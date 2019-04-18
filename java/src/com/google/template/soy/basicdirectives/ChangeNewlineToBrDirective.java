/*
 * Copyright 2009 Google Inc.
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

package com.google.template.soy.basicdirectives;

import com.google.common.collect.ImmutableSet;
import com.google.template.soy.data.LoggingAdvisingAppendable;
import com.google.template.soy.data.SanitizedContent;
import com.google.template.soy.data.SanitizedContentOperator;
import com.google.template.soy.data.SoyValue;
import com.google.template.soy.jbcsrc.restricted.Expression;
import com.google.template.soy.jbcsrc.restricted.JbcSrcPluginContext;
import com.google.template.soy.jbcsrc.restricted.MethodRef;
import com.google.template.soy.jbcsrc.restricted.SoyExpression;
import com.google.template.soy.jbcsrc.restricted.SoyJbcSrcPrintDirective;
import com.google.template.soy.jssrc.restricted.JsExpr;
import com.google.template.soy.jssrc.restricted.SoyLibraryAssistedJsSrcPrintDirective;
import com.google.template.soy.pysrc.restricted.PyExpr;
import com.google.template.soy.pysrc.restricted.SoyPySrcPrintDirective;
import com.google.template.soy.shared.restricted.SoyJavaPrintDirective;
import com.google.template.soy.shared.restricted.SoyPurePrintDirective;
import com.google.template.soy.types.SanitizedType.HtmlType;
import com.google.template.soy.types.StringType;
import com.google.template.soy.types.UnionType;
import java.util.List;
import java.util.Set;
import javax.annotation.Nonnull;

/**
 * A directive that replaces newlines (\n, \r, or \r\n) with HTML line breaks (&lt;br&gt;).
 *
 */
@SoyPurePrintDirective
final class ChangeNewlineToBrDirective
    implements SanitizedContentOperator,
        SoyJavaPrintDirective,
        SoyLibraryAssistedJsSrcPrintDirective,
        SoyPySrcPrintDirective,
        SoyJbcSrcPrintDirective.Streamable {

  @Override
  public String getName() {
    return "|changeNewlineToBr";
  }

  @Override
  public Set<Integer> getValidArgsSizes() {
    return ImmutableSet.of(0);
  }

  @Override
  @Nonnull
  public SanitizedContent.ContentKind getContentKind() {
    // This directive expects HTML as input and produces HTML as output.
    return SanitizedContent.ContentKind.HTML;
  }

  @Override
  public SoyValue applyForJava(SoyValue value, List<SoyValue> args) {
    return BasicDirectivesRuntime.changeNewlineToBr(value);
  }

  private static final class JbcSrcMethods {

    static final MethodRef CHANGE_NEWLINE_TO_BR =
        MethodRef.create(BasicDirectivesRuntime.class, "changeNewlineToBr", SoyValue.class)
            .asNonNullable();
    static final MethodRef CHANGE_NEWLINE_TO_BR_STREAMING =
        MethodRef.create(
                BasicDirectivesRuntime.class,
                "changeNewlineToBrStreaming",
                LoggingAdvisingAppendable.class)
            .asNonNullable();
  }

  @Override
  public SoyExpression applyForJbcSrc(
      JbcSrcPluginContext context, SoyExpression value, List<SoyExpression> args) {
    return SoyExpression.forSoyValue(
        UnionType.of(StringType.getInstance(), HtmlType.getInstance()),
        JbcSrcMethods.CHANGE_NEWLINE_TO_BR.invoke(value.box()));
  }

  @Override
  public AppendableAndOptions applyForJbcSrcStreaming(
      JbcSrcPluginContext context, Expression delegateAppendable, List<SoyExpression> args) {
    return AppendableAndOptions.create(
        JbcSrcMethods.CHANGE_NEWLINE_TO_BR_STREAMING.invoke(delegateAppendable));
  }

  @Override
  public JsExpr applyForJsSrc(JsExpr value, List<JsExpr> args) {
    return new JsExpr("soy.$$changeNewlineToBr(" + value.getText() + ")", Integer.MAX_VALUE);
  }

  @Override
  public ImmutableSet<String> getRequiredJsLibNames() {
    return ImmutableSet.of("soy");
  }

  @Override
  public PyExpr applyForPySrc(PyExpr value, List<PyExpr> args) {
    return new PyExpr("sanitize.change_newline_to_br(" + value.getText() + ")", Integer.MAX_VALUE);
  }
}
