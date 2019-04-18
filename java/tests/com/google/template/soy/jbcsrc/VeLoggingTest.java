/*
 * Copyright 2017 Google Inc.
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

import static com.google.common.truth.Truth.assertThat;
import static com.google.template.soy.data.SoyValueConverter.EMPTY_DICT;

import com.google.common.base.Joiner;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.template.soy.SoyFileSetParser;
import com.google.template.soy.SoyFileSetParser.ParseResult;
import com.google.template.soy.SoyFileSetParserBuilder;
import com.google.template.soy.data.LogStatement;
import com.google.template.soy.data.LoggingFunctionInvocation;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.jbcsrc.api.OutputAppendable;
import com.google.template.soy.jbcsrc.api.RenderResult;
import com.google.template.soy.jbcsrc.shared.CompiledTemplates;
import com.google.template.soy.jbcsrc.shared.RenderContext;
import com.google.template.soy.logging.LoggableElement;
import com.google.template.soy.logging.LoggingConfig;
import com.google.template.soy.logging.LoggingFunction;
import com.google.template.soy.logging.SoyLogger;
import com.google.template.soy.logging.ValidatedLoggingConfig;
import com.google.template.soy.shared.restricted.Signature;
import com.google.template.soy.shared.restricted.SoyFunctionSignature;
import com.google.template.soy.types.SoyTypeRegistry;
import java.io.IOException;
import java.util.Map;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Tests {@code {velog}} support. */
@RunWith(JUnit4.class)
public final class VeLoggingTest {
  private static final ValidatedLoggingConfig config =
      ValidatedLoggingConfig.create(
          LoggingConfig.newBuilder()
              .addElement(
                  LoggableElement.newBuilder()
                      .setName("Foo")
                      .setId(1L)
                      .setProtoType("soy.test.Foo"))
              .addElement(
                  LoggableElement.newBuilder()
                      .setName("Bar")
                      .setId(2L)
                      .setProtoType("soy.test.Foo"))
              .addElement(
                  LoggableElement.newBuilder()
                      .setName("Baz")
                      .setId(3L)
                      .setProtoType("soy.test.Foo"))
              .addElement(
                  LoggableElement.newBuilder()
                      .setName("Quux")
                      .setId(4L)
                      .setProtoType("soy.test.Foo"))
              .build());

  private static class TestLogger implements SoyLogger {
    final StringBuilder builder = new StringBuilder();
    int depth;

    @Override
    public void enter(LogStatement statement) {
      if (builder.length() > 0) {
        builder.append('\n');
      }
      builder.append(Strings.repeat("  ", depth)).append(statement);
      depth++;
    }

    @Override
    public void exit() {
      depth--;
    }

    @Override
    public String evalLoggingFunction(LoggingFunctionInvocation value) {
      switch (value.functionName()) {
        case "depth":
          return Integer.toString(depth);
        default:
          throw new UnsupportedOperationException(value.toString());
      }
    }
  }

  @SoyFunctionSignature(name = "depth", value = @Signature(returnType = "string"))
  private static final class DepthFunction implements LoggingFunction {
    @Override
    public String getPlaceholder() {
      return "depth_placeholder";
    }
  }

  @Test
  public void testBasicLogging_treeStructure() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "{velog Foo}<div data-id=1>{velog Bar}<div data-id=2></div>"
            + "{/velog}{velog Baz}<div data-id=3></div>{/velog}</div>{/velog}");
    assertThat(sb.toString())
        .isEqualTo("<div data-id=1><div data-id=2></div><div data-id=3></div></div>");
    assertThat(testLogger.builder.toString())
        .isEqualTo("velog{id=1}\n" + "  velog{id=2}\n" + "  velog{id=3}");
  }

  @Test
  public void testBasicLogging_withData() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "{velog ve_data(Foo, soy.test.Foo(intField: 123))}<div data-id=1></div>{/velog}");
    assertThat(sb.toString()).isEqualTo("<div data-id=1></div>");
    assertThat(testLogger.builder.toString())
        .isEqualTo("velog{id=1, data=soy.test.Foo{int_field: 123}}");
  }

  @Test
  public void testBasicLogging_logonly() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "{velog Foo logonly=\"true\"}<div data-id=1></div>{/velog}");
    // logonly ve's disable content generation
    assertThat(sb.toString()).isEmpty();
    assertThat(testLogger.builder.toString()).isEqualTo("velog{id=1, logonly}");
  }

  @Test
  public void testBasicLogging_logonly_dynamic() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        ImmutableMap.of("t", true, "f", false),
        OutputAppendable.create(sb, testLogger),
        "{@param t : bool}",
        "{@param f : bool}",
        "{velog Foo logonly=\"$t\"}<div data-id=1></div>{/velog}",
        "{velog Bar logonly=\"$f\"}<div data-id=2></div>{/velog}");
    // logonly ve's disable content generation
    assertThat(sb.toString()).isEqualTo("<div data-id=2></div>");
    assertThat(testLogger.builder.toString()).isEqualTo("velog{id=1, logonly}\nvelog{id=2}");
  }

  @Test
  public void testLogging_letVariables() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "{let $foo kind=\"html\"}{velog Foo}<div data-id=1></div>{/velog}{/let}{$foo}{$foo}");
    assertThat(testLogger.builder.toString()).isEqualTo("velog{id=1}\nvelog{id=1}");
    assertThat(sb.toString()).isEqualTo("<div data-id=1></div><div data-id=1></div>");
  }

  @Test
  public void testLogging_msg() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        ""
            + "{msg desc=\"a message!\"}\n"
            + "  Greetings, {velog Foo}<a href='./wiki?human'>Human</a>{/velog}\n"
            + "{/msg}");
    assertThat(sb.toString()).isEqualTo("Greetings, <a href='./wiki?human'>Human</a>");
    assertThat(testLogger.builder.toString()).isEqualTo("velog{id=1}");
  }

  @Test
  public void testLogging_nestedLogOnly() throws IOException {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "{velog Foo logonly=\"true\"}<div data-id=1>{velog Foo logonly=\"false\"}<div data-id=1>"
            + "{velog Foo logonly=\"true\"}<div data-id=1>"
            + "{velog Foo logonly=\"true\"}<div data-id=1></div>{/velog}"
            + "</div>{/velog}</div>{/velog}</div>{/velog}");
    assertThat(sb.toString()).isEmpty();
    assertThat(testLogger.builder.toString())
        .isEqualTo(
            "velog{id=1, logonly}\n"
                + "  velog{id=1}\n"
                + "    velog{id=1, logonly}\n"
                + "      velog{id=1, logonly}");
  }

  @Test
  public void testLogging_loggingFunction_basic() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "<div data-depth={depth()}></div>"
            + "{velog Foo}<div data-depth={depth()}></div>{/velog}"
            + "<div data-depth={depth()}></div>");
    assertThat(testLogger.builder.toString()).isEqualTo("velog{id=1}");
    assertThat(sb.toString())
        .isEqualTo("<div data-depth=0></div><div data-depth=1></div><div data-depth=0></div>");
  }

  @Test
  public void testLogging_loggingFunction_usesPlaceholders() throws Exception {
    StringBuilder sb = new StringBuilder();
    TestLogger testLogger = new TestLogger();
    renderTemplate(
        OutputAppendable.create(sb, testLogger),
        "{let $html kind=\"html\"}{velog Foo}<div data-depth={depth()}></div>{/velog}{/let}"
            + "<script>{'' + $html}</script>");
    // nothing is logged because no elements were rendered
    assertThat(testLogger.builder.toString()).isEmpty();
    // everything is escaped, and the placeholder is used instead of a 'real value'
    assertThat(sb.toString()).contains("depth_placeholder");
  }

  private void renderTemplate(OutputAppendable output, String... templateBodyLines)
      throws IOException {
    renderTemplate(ImmutableMap.of(), output, templateBodyLines);
  }

  private void renderTemplate(
      Map<String, ?> params, OutputAppendable output, String... templateBodyLines)
      throws IOException {
    SoyTypeRegistry typeRegistry =
        new SoyTypeRegistry.Builder()
            .addDescriptors(ImmutableList.of(com.google.template.soy.testing.Foo.getDescriptor()))
            .build();
    SoyFileSetParser parser =
        SoyFileSetParserBuilder.forFileContents(
                "{namespace ns}\n"
                    + "{template .foo}\n"
                    + Joiner.on("\n").join(templateBodyLines)
                    + "\n{/template}")
            .typeRegistry(typeRegistry)
            .setLoggingConfig(config)
            .addSoySourceFunction(new DepthFunction())
            .runAutoescaper(true)
            .build();
    ParseResult parseResult = parser.parse();
    CompiledTemplates templates =
        BytecodeCompiler.compile(
                parseResult.registry(),
                parseResult.fileSet(),
                false,
                ErrorReporter.exploding(),
                parser.soyFileSuppliers(),
                typeRegistry)
            .get();
    RenderContext ctx =
        TemplateTester.getDefaultContext(templates).toBuilder().hasLogger(true).build();
    RenderResult result =
        templates
            .getTemplateFactory("ns.foo")
            .create(TemplateTester.asRecord(params), EMPTY_DICT)
            .render(output, ctx);
    assertThat(result).isEqualTo(RenderResult.done());
  }
}
