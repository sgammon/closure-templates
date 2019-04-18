/*
 * Copyright 2015 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.template.soy.jbcsrc;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.base.Joiner;
import com.google.common.base.Optional;
import com.google.common.base.Stopwatch;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteSink;
import com.google.common.io.ByteSource;
import com.google.template.soy.base.internal.SoyFileSupplier;
import com.google.template.soy.base.internal.SoyJarFileWriter;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.error.SoyErrorKind;
import com.google.template.soy.error.SoyErrorKind.StyleAllowance;
import com.google.template.soy.jbcsrc.internal.ClassData;
import com.google.template.soy.jbcsrc.internal.MemoryClassLoader;
import com.google.template.soy.jbcsrc.restricted.Flags;
import com.google.template.soy.jbcsrc.shared.CompiledTemplates;
import com.google.template.soy.jbcsrc.shared.Names;
import com.google.template.soy.soytree.SoyFileNode;
import com.google.template.soy.soytree.SoyFileSetNode;
import com.google.template.soy.soytree.TemplateDelegateNode;
import com.google.template.soy.soytree.TemplateNode;
import com.google.template.soy.soytree.TemplateRegistry;
import com.google.template.soy.types.SoyTypeRegistry;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;

/** The entry point to the {@code jbcsrc} compiler. */
public final class BytecodeCompiler {

  private static final Logger logger = Logger.getLogger(BytecodeCompiler.class.getName());

  private static final SoyErrorKind UNEXPECTED_COMPILER_FAILURE =
      SoyErrorKind.of(
          "Unexpected error while compiling template: ''{0}''\n"
              + "Soy Stack:\n{1}\n"
              + "Compiler Stack:\n{2}",
          StyleAllowance.NO_PUNCTUATION);

  private static final SoyErrorKind UNEXPECTED_ERROR =
      SoyErrorKind.of(
          "Unexpected error while compiling template: ''{0}''\n{1}", StyleAllowance.NO_PUNCTUATION);

  /**
   * Compiles all the templates in the given registry.
   *
   * @param registry All the templates to compile
   * @param developmentMode Whether or not we are in development mode. In development mode we
   *     compile classes lazily
   * @param reporter The error reporter
   * @return CompiledTemplates or {@code absent()} if compilation fails, in which case errors will
   *     have been reported to the error reporter.
   */
  public static Optional<CompiledTemplates> compile(
      final TemplateRegistry registry,
      final SoyFileSetNode fileSet,
      boolean developmentMode,
      ErrorReporter reporter,
      ImmutableMap<String, SoyFileSupplier> filePathsToSuppliers,
      SoyTypeRegistry typeRegistry) {
    final Stopwatch stopwatch = Stopwatch.createStarted();
    ErrorReporter.Checkpoint checkpoint = reporter.checkpoint();
    if (reporter.errorsSince(checkpoint)) {
      return Optional.absent();
    }
    CompiledTemplateRegistry compilerRegistry = new CompiledTemplateRegistry(registry);
    if (developmentMode) {
      CompiledTemplates templates =
          new CompiledTemplates(
              compilerRegistry.getDelegateTemplateNames(),
              new CompilingClassLoader(
                  compilerRegistry, fileSet, filePathsToSuppliers, typeRegistry));
      if (reporter.errorsSince(checkpoint)) {
        return Optional.absent();
      }
      // TODO(lukes): consider spawning a thread to load all the generated classes in the background
      return Optional.of(templates);
    }
    // TODO(lukes): once most internal users have moved to precompilation eliminate this and just
    // use the 'developmentMode' path above.  This hybrid only makes sense for production services
    // that are doing runtime compilation.  Hopefully, this will become an anomaly.
    List<ClassData> classes =
        compileTemplates(
            compilerRegistry,
            fileSet,
            reporter,
            typeRegistry,
            new CompilerListener<List<ClassData>>() {
              final List<ClassData> compiledClasses = new ArrayList<>();
              int numBytes = 0;
              int numFields = 0;
              int numDetachStates = 0;

              @Override
              public void onCompile(ClassData clazz) {
                numBytes += clazz.data().length;
                numFields += clazz.numberOfFields();
                numDetachStates += clazz.numberOfDetachStates();
                compiledClasses.add(clazz);
              }

              @Override
              public List<ClassData> getResult() {
                logger.log(
                    Level.FINE,
                    "Compilation took {0}\n"
                        + "     templates: {1}\n"
                        + "       classes: {2}\n"
                        + "         bytes: {3}\n"
                        + "        fields: {4}\n"
                        + "  detachStates: {5}",
                    new Object[] {
                      stopwatch.toString(),
                      registry.getAllTemplates().size(),
                      compiledClasses.size(),
                      numBytes,
                      numFields,
                      numDetachStates
                    });
                return compiledClasses;
              }
            });
    if (reporter.errorsSince(checkpoint)) {
      return Optional.absent();
    }
    CompiledTemplates templates =
        new CompiledTemplates(
            compilerRegistry.getDelegateTemplateNames(), new MemoryClassLoader(classes));
    stopwatch.reset().start();
    templates.loadAll(compilerRegistry.getTemplateNames());
    logger.log(Level.FINE, "Loaded all classes in {0}", stopwatch);
    return Optional.of(templates);
  }

  /**
   * Compiles all the templates in the given registry to a jar file written to the given output
   * stream.
   *
   * <p>If errors are encountered, the error reporter will be updated and we will return. The
   * contents of any data written to the sink at that point are undefined.
   *
   * @param registry All the templates to compile
   * @param reporter The error reporter
   * @param sink The output sink to write the JAR to.
   */
  public static void compileToJar(
      TemplateRegistry registry,
      SoyFileSetNode fileSet,
      ErrorReporter reporter,
      SoyTypeRegistry typeRegistry,
      ByteSink sink)
      throws IOException {
    ErrorReporter.Checkpoint checkpoint = reporter.checkpoint();
    if (reporter.errorsSince(checkpoint)) {
      return;
    }
    CompiledTemplateRegistry compilerRegistry = new CompiledTemplateRegistry(registry);
    if (reporter.errorsSince(checkpoint)) {
      return;
    }
    try (final SoyJarFileWriter writer = new SoyJarFileWriter(sink.openStream())) {
      final Set<String> delTemplates = new TreeSet<>();
      compileTemplates(
          compilerRegistry,
          fileSet,
          reporter,
          typeRegistry,
          new CompilerListener<Void>() {
            @Override
            void onCompile(ClassData clazz) throws IOException {
              writer.writeEntry(
                  clazz.type().internalName() + ".class", ByteSource.wrap(clazz.data()));
            }

            @Override
            void onCompileDelTemplate(String name) {
              delTemplates.add(name);
            }
          });
      if (!delTemplates.isEmpty()) {
        String delData = Joiner.on('\n').join(delTemplates);
        writer.writeEntry(
            Names.META_INF_DELTEMPLATE_PATH, ByteSource.wrap(delData.getBytes(UTF_8)));
      }
    }
  }

  /**
   * Writes the source files out to a {@code -src.jar}. This places the soy files at the same
   * classpath relative location as their generated classes. Ultimately this can be used by
   * debuggers for source level debugging.
   *
   * <p>It is a little weird that the relative locations of the generated classes are not identical
   * to the input source files. This is due to the disconnect between java packages and soy
   * namespaces. We should consider using the soy namespace directly as a java package in the
   * future.
   *
   * @param registry All the templates in the current compilation unit
   * @param files The source files by file path
   * @param sink The source to write the jar file
   */
  public static void writeSrcJar(
      SoyFileSetNode soyFileSet, ImmutableMap<String, SoyFileSupplier> files, ByteSink sink)
      throws IOException {
    try (SoyJarFileWriter writer = new SoyJarFileWriter(sink.openStream())) {
      for (SoyFileNode file : soyFileSet.getChildren()) {
        String namespace = file.getNamespace();
        String fileName = file.getFileName();
        writer.writeEntry(
            Names.javaFileName(namespace, fileName),
            files.get(file.getFilePath()).asCharSource().asByteSource(UTF_8));
      }
    }
  }

  private abstract static class CompilerListener<T> {
    /** Callback for for class data that was generated. */
    abstract void onCompile(ClassData newClass) throws Exception;

    /**
     * Callback to notify a deltemplate was compiled.
     *
     * @param name The full name as would be returned by SoyTemplateInfo.getName()
     */
    void onCompileDelTemplate(String name) {}

    /**
     * Callback to notify a template (not a deltemplate) was compiled.
     *
     * @param name The full name as would be returned by SoyTemplateInfo.getName()
     */
    void onCompileTemplate(String name) {}

    T getResult() {
      return null;
    }
  }

  private static <T> T compileTemplates(
      CompiledTemplateRegistry registry,
      SoyFileSetNode fileSet,
      ErrorReporter errorReporter,
      SoyTypeRegistry typeRegistry,
      CompilerListener<T> listener) {
    for (SoyFileNode file : fileSet.getChildren()) {
      for (TemplateNode template : file.getChildren()) {
        CompiledTemplateMetadata classInfo =
            registry.getTemplateInfoByTemplateName(template.getTemplateName());
        try {
          TemplateCompiler templateCompiler =
              new TemplateCompiler(registry, classInfo, template, errorReporter, typeRegistry);
          for (ClassData clazz : templateCompiler.compile()) {
            if (Flags.DEBUG) {
              clazz.checkClass();
            }
            listener.onCompile(clazz);
          }
          if (template instanceof TemplateDelegateNode) {
            listener.onCompileDelTemplate(template.getTemplateName());
          } else {
            listener.onCompileTemplate(template.getTemplateName());
          }
          // Report unexpected errors and keep going to try to collect more.
        } catch (UnexpectedCompilerFailureException e) {
          errorReporter.report(
              e.getOriginalLocation(),
              UNEXPECTED_COMPILER_FAILURE,
              template.getTemplateNameForUserMsgs(),
              e.printSoyStack(),
              Throwables.getStackTraceAsString(e));
        } catch (Throwable t) {
          errorReporter.report(
              template.getSourceLocation(),
              UNEXPECTED_ERROR,
              template.getTemplateNameForUserMsgs(),
              Throwables.getStackTraceAsString(t));
        }
      }
    }
    return listener.getResult();
  }

  private BytecodeCompiler() {}
}
