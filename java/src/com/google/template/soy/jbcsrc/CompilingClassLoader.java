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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.template.soy.base.internal.SoyFileSupplier;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.error.SoyCompilationException;
import com.google.template.soy.error.SoyError;
import com.google.template.soy.jbcsrc.internal.AbstractMemoryClassLoader;
import com.google.template.soy.jbcsrc.internal.ClassData;
import com.google.template.soy.soytree.SoyFileNode;
import com.google.template.soy.soytree.SoyFileSetNode;
import com.google.template.soy.soytree.TemplateNode;
import com.google.template.soy.types.SoyTypeRegistry;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/** A classloader that can compile templates on demand. */
final class CompilingClassLoader extends AbstractMemoryClassLoader {
  static {
    // See http://docs.oracle.com/javase/7/docs/technotes/guides/lang/cl-mt.html
    ClassLoader.registerAsParallelCapable();
  }

  // Synchronized hashmap is sufficient for our usecase since we are only calling remove(), CHM
  // would just use more memory.
  private final Map<String, ClassData> classesByName = Collections.synchronizedMap(new HashMap<>());

  private final CompiledTemplateRegistry registry;
  private final ImmutableMap<String, SoyFileSupplier> filePathsToSuppliers;
  private final ImmutableMap<String, TemplateNode> classNameToTemplateNode;
  private final SoyTypeRegistry typeRegistry;

  CompilingClassLoader(
      CompiledTemplateRegistry registry,
      SoyFileSetNode fileSet,
      ImmutableMap<String, SoyFileSupplier> filePathsToSuppliers,
      SoyTypeRegistry typeRegistry) {
    this.registry = registry;
    ImmutableMap.Builder<String, TemplateNode> classNameToTemplateNode = ImmutableMap.builder();
    for (SoyFileNode file : fileSet.getChildren()) {
      for (TemplateNode template : file.getChildren()) {
        CompiledTemplateMetadata meta =
            registry.getTemplateInfoByTemplateName(template.getTemplateName());
        classNameToTemplateNode.put(meta.typeInfo().className(), template);
      }
    }
    this.classNameToTemplateNode = classNameToTemplateNode.build();
    this.typeRegistry = typeRegistry;
    this.filePathsToSuppliers = filePathsToSuppliers;
  }

  @Override
  protected ClassData getClassData(String name) {
    ClassData classDef = classesByName.get(name);
    if (classDef != null) {
      return classDef;
    }
    // We haven't already compiled it (and haven't already loaded it) so try to find the matching
    // template.

    // For each template we compile there are only two 'public' classes that could be loaded prior
    // to compiling the template. The CompiledTemplate.Factory class and the CompiledTemplate itself
    boolean isFactory = name.endsWith("$" + StandardNames.FACTORY_CLASS);
    String compiledTemplateName =
        isFactory
            ? name.substring(0, name.length() - (StandardNames.FACTORY_CLASS.length() + 1))
            : name;
    CompiledTemplateMetadata meta = registry.getTemplateInfoByClassName(compiledTemplateName);
    if (meta == null) {
      return null;
    }
    ClassData clazzToLoad = null;
    ErrorReporter reporter = ErrorReporter.create(filePathsToSuppliers);
    for (ClassData clazz :
        new TemplateCompiler(
                registry,
                meta,
                classNameToTemplateNode.get(compiledTemplateName),
                reporter,
                typeRegistry)
            .compile()) {
      String className = clazz.type().className();
      if (className.equals(name)) {
        clazzToLoad = clazz;
      } else {
        classesByName.put(className, clazz);
      }
    }
    if (reporter.hasErrors()) {
      // if we are reporting errors we should report warnings at the same time.
      Iterable<SoyError> errors = Iterables.concat(reporter.getErrors(), reporter.getWarnings());
      throw new SoyCompilationException(errors);
    }
    return clazzToLoad;
  }
}
