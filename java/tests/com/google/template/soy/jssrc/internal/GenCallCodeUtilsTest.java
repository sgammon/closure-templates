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

package com.google.template.soy.jssrc.internal;

import static com.google.common.collect.ImmutableList.toImmutableList;
import static com.google.common.truth.Truth.assertThat;
import static com.google.common.truth.Truth.assertWithMessage;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.template.soy.SoyFileSetParserBuilder;
import com.google.template.soy.base.internal.UniqueNameGenerator;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.internal.i18n.BidiGlobalDir;
import com.google.template.soy.jssrc.SoyJsSrcOptions;
import com.google.template.soy.jssrc.dsl.CodeChunk;
import com.google.template.soy.jssrc.dsl.Expression;
import com.google.template.soy.shared.SharedTestUtils;
import com.google.template.soy.shared.internal.InternalPlugins;
import com.google.template.soy.shared.internal.NoOpScopedData;
import com.google.template.soy.shared.restricted.SoyPrintDirective;
import com.google.template.soy.soytree.CallNode;
import com.google.template.soy.soytree.SoyFileSetNode;
import java.util.regex.Pattern;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Unit tests for {@link GenCallCodeUtils}.
 *
 */
@RunWith(JUnit4.class)
public final class GenCallCodeUtilsTest {

  private static final Joiner JOINER = Joiner.on('\n');

  @Test
  public void testGenCallExprForBasicCalls() {
    assertThat(getCallExprTextHelper("{call some.func data=\"all\" /}"))
        .isEqualTo("some.func(/** @type {?} */ (opt_data), opt_ijData);");

    assertThat(getCallExprTextHelper("{@param boo : ?}", "{call some.func data=\"$boo.foo\" /}"))
        .isEqualTo("some.func(/** @type {?} */ (boo.foo), opt_ijData);");

    assertThat(
            getCallExprTextHelper(
                "{@param moo : ?}", "{call some.func}", "  {param goo: $moo /}", "{/call}"))
        .isEqualTo("some.func(/** @type {?} */ ({goo: opt_data.moo}), opt_ijData);");

    assertThat(
            getCallExprTextHelper(
                "{@param boo : ?}",
                "{call some.func data=\"$boo\"}",
                "  {param goo kind=\"text\"}Blah{/param}",
                "{/call}"))
        .isEqualTo(
            "some.func(soy.$$assignDefaults("
                + "{goo: soydata.$$markUnsanitizedTextForInternalBlocks('Blah')}, boo), "
                + "opt_ijData);");

    String callExprText =
        getCallExprTextHelper(
            "{call some.func}\n"
                + "  {param goo kind=\"text\"}\n"
                + "    {for $i in range(3)}{$i}{/for}\n"
                + "  {/param}\n"
                + "{/call}\n");
    assertThat(callExprText)
        .matches(
            Pattern.quote(
                    "some.func(/** @type {?} */ "
                        + "({goo: soydata.$$markUnsanitizedTextForInternalBlocks(param")
                + "[0-9]+"
                + Pattern.quote(")}), opt_ijData);"));
  }

  @Test
  public void testGenCallExprForBasicCallsWithTypedParamBlocks() {
    assertThat(
            getCallExprTextHelper(
                "{@param boo : ?}",
                "{call some.func data=\"$boo\"}",
                "  {param goo kind=\"html\"}Blah{/param}",
                "{/call}"))
        .isEqualTo(
            "some.func(soy.$$assignDefaults("
                + "{goo: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('Blah')}, "
                + "boo), opt_ijData);");

    final String callExprText =
        getCallExprTextHelper(
            "{call some.func}\n"
                + "  {param goo kind=\"html\"}\n"
                + "    {for $i in range(3)}{$i}{/for}\n"
                + "  {/param}\n"
                + "{/call}\n");
    // NOTE: Soy generates a param### variable to store the output of the for loop.
    assertWithMessage("Actual result: " + callExprText)
        .that(
            callExprText.matches(
                "some[.]func[(]/[*][*] @type [{?}]{3} [*]/ [(][{]goo: soydata.VERY_UNSAFE.[$][$]"
                    + "ordainSanitizedHtmlForInternalBlocks["
                    + "(]param[0-9]+[)][}][)], opt_ijData[)];"))
        .isTrue();
  }

  @Test
  public void testGenCallExprForDelegateCalls() {
    assertThat(getCallExprTextHelper("{delcall myDelegate data=\"all\" /}"))
        .isEqualTo(
            "soy.$$getDelegateFn("
                + "soy.$$getDelTemplateId('myDelegate'), '', false)(/** @type {?} */ (opt_data), "
                + "opt_ijData);");

    assertThat(
            getCallExprTextHelper("{delcall myDelegate data=\"all\" allowemptydefault=\"true\" /}"))
        .isEqualTo(
            "soy.$$getDelegateFn("
                + "soy.$$getDelTemplateId('myDelegate'), '', true)(/** @type {?} */ (opt_data), "
                + "opt_ijData);");

    assertThat(
            getCallExprTextHelper(
                "{@param moo : ?}",
                "{delcall my.other.delegate}",
                "  {param goo: $moo /}",
                "{/delcall}"))
        .isEqualTo(
            "soy.$$getDelegateFn("
                + "soy.$$getDelTemplateId('my.other.delegate'), '', false)("
                + "/** @type {?} */ ({goo: opt_data.moo}), opt_ijData);");
  }

  @Test
  public void testGenCallExprForDelegateVariantCalls() {
    assertThat(getCallExprTextHelper("{delcall myDelegate variant=\"'voo'\" data=\"all\" /}"))
        .isEqualTo(
            "soy.$$getDelegateFn(soy.$$getDelTemplateId('myDelegate'), 'voo', false)"
                + "(/** @type {?} */ (opt_data), opt_ijData);");

    assertThat(
            getCallExprTextHelper(
                "{@param voo : ?}",
                "{delcall myDelegate variant=\"$voo\" data=\"all\" allowemptydefault=\"true\" /}"))
        .isEqualTo(
            "soy.$$getDelegateFn(soy.$$getDelTemplateId('myDelegate'), opt_data.voo, true)"
                + "(/** @type {?} */ (opt_data), opt_ijData);");
  }

  @Test
  public void testGenCallExprForDelegateCallsWithTypedParamBlocks() {
    assertThat(
            getCallExprTextHelper(
                "{delcall my.other.delegate}",
                "  {param goo kind=\"html\"}Blah{/param}",
                "{/delcall}"))
        .isEqualTo(
            "soy.$$getDelegateFn(soy.$$getDelTemplateId('my.other.delegate'), '', false)("
                + "/** @type {?} */ ({goo: soydata.VERY_UNSAFE"
                + ".$$ordainSanitizedHtmlForInternalBlocks('Blah')}), "
                + "opt_ijData);");

    String callExprText =
        getCallExprTextHelper(
            "{delcall my.other.delegate}",
            "  {param goo kind=\"html\"}",
            "    {for $i in range(3)}{$i}{/for}",
            "  {/param}",
            "{/delcall}");
    assertWithMessage("Actual text:" + callExprText)
        .that(
            callExprText.matches(
                "soy.\\$\\$getDelegateFn\\("
                    + "soy.\\$\\$getDelTemplateId\\('my.other.delegate'\\), '', false\\)"
                    + "[(]/[*][*] @type [{?}]{3} [*]/ [(][{]goo: soydata.VERY_UNSAFE"
                    + ".[$][$]ordainSanitizedHtmlForInternalBlocks"
                    + "[(]param[0-9]+[)][}][)], opt_ijData[)];"))
        .isTrue();
  }

  @Test
  public void testGenCallExprForDataAllAndDefaultParameter() {
    assertThat(
            getCallExprTextHelper(
                "{@param boo:= 'default'}",
                "{@param goo:= 12}",
                "{call some.func data='all'}",
                "  {param goo: 59 /}",
                "{/call}"))
        .isEqualTo("some.func(soy.$$assignDefaults({boo: boo, goo: 59}, opt_data), opt_ijData);");
  }

  @Test
  public void testGenCallExprForStrictCall() {
    assertThat(getCallExprTextHelper("{call some.func /}\n", ImmutableList.of("|escapeHtml")))
        .isEqualTo("soy.$$escapeHtml(some.func(null, opt_ijData));");
  }

  private static String getCallExprTextHelper(String... callSourceLines) {
    return getCallExprTextHelper(Joiner.on('\n').join(callSourceLines), ImmutableList.of());
  }

  private static String getCallExprTextHelper(
      String callSource, ImmutableList<String> escapingDirectives) {

    SoyFileSetNode soyTree =
        SoyFileSetParserBuilder.forTemplateContents(callSource)
            .parse()
            .fileSet();

    CallNode callNode = (CallNode) SharedTestUtils.getNode(soyTree, 0);
    // Manually setting the escaping directives.
    ImmutableMap<String, ? extends SoyPrintDirective> directives =
        InternalPlugins.internalDirectiveMap(new NoOpScopedData());
    callNode.setEscapingDirectives(
        escapingDirectives.stream().map(directives::get).collect(toImmutableList()));

    GenCallCodeUtils genCallCodeUtils = JsSrcTestUtils.createGenCallCodeUtils();
    UniqueNameGenerator nameGenerator = JsSrcNameGenerators.forLocalVariables();
    TranslationContext translationContext =
        TranslationContext.of(
            SoyToJsVariableMappings.forNewTemplate()
                .put("boo", Expression.id("boo"))
                .put("goo", Expression.id("goo")),
            CodeChunk.Generator.create(nameGenerator),
            nameGenerator);
    ErrorReporter errorReporter = ErrorReporter.exploding();
    TranslateExprNodeVisitor exprTranslator =
        new TranslateExprNodeVisitor(
            new JavaScriptValueFactoryImpl(new SoyJsSrcOptions(), BidiGlobalDir.LTR, errorReporter),
            translationContext,
            errorReporter);
    CodeChunk call =
        genCallCodeUtils.gen(
            callNode,
            AliasUtils.IDENTITY_ALIASES,
            translationContext,
            errorReporter,
            exprTranslator);
    return call.getCode();
  }
}
