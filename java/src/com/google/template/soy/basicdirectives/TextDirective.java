/*
 * Copyright 2012 Google Inc.
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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.template.soy.data.LoggingAdvisingAppendable;
import com.google.template.soy.data.SoyValue;
import com.google.template.soy.jbcsrc.restricted.Expression;
import com.google.template.soy.jbcsrc.restricted.JbcSrcPluginContext;
import com.google.template.soy.jbcsrc.restricted.MethodRef;
import com.google.template.soy.jbcsrc.restricted.SoyExpression;
import com.google.template.soy.jbcsrc.restricted.SoyJbcSrcPrintDirective;
import com.google.template.soy.jssrc.restricted.JsExpr;
import com.google.template.soy.jssrc.restricted.JsExprUtils;
import com.google.template.soy.jssrc.restricted.SoyJsSrcPrintDirective;
import com.google.template.soy.pysrc.restricted.PyExpr;
import com.google.template.soy.pysrc.restricted.SoyPySrcPrintDirective;
import com.google.template.soy.shared.restricted.SoyJavaPrintDirective;
import com.google.template.soy.shared.restricted.SoyPurePrintDirective;
import java.util.List;
import java.util.Set;

/**
 * Internal-only directive indicating content is to be treated as plain text.
 *
 * <p>Should never be used by users in its current state. This directive itself performs no
 * escaping, though in the future, it may force autoescaping to re-escape the value.
 *
 */
@SoyPurePrintDirective
final class TextDirective
    implements SoyJavaPrintDirective,
        SoyJsSrcPrintDirective,
        SoyPySrcPrintDirective,
        SoyJbcSrcPrintDirective.Streamable {

  @Override
  public String getName() {
    return "|text";
  }

  @Override
  public Set<Integer> getValidArgsSizes() {
    return ImmutableSet.of(0);
  }

  @Override
  public SoyValue applyForJava(SoyValue value, List<SoyValue> args) {
    // TODO: If this directive is opened up to users, this needs to coerce the value to a string.
    return value;
  }

  @Override
  public SoyExpression applyForJbcSrc(
      JbcSrcPluginContext context, SoyExpression value, List<SoyExpression> args) {
    // TODO: If this directive is opened up to users, this needs to coerce the value to a string.
    return value;
  }

  private static final class JbcSrcMethods {
    static final MethodRef stringCoercing =
        MethodRef.create(
                LoggingAdvisingAppendable.class, "stringCoercing", LoggingAdvisingAppendable.class)
            .asNonNullable();
  }

  @Override
  public AppendableAndOptions applyForJbcSrcStreaming(
      JbcSrcPluginContext context, Expression delegateAppendable, List<SoyExpression> args) {
    return AppendableAndOptions.create(JbcSrcMethods.stringCoercing.invoke(delegateAppendable));
  }

  @Override
  public JsExpr applyForJsSrc(JsExpr value, List<JsExpr> args) {
    // Coerce to string, since sometimes this will be the root of an expression and will be used as
    // a return value or let-block assignment.
    return JsExprUtils.concatJsExprs(ImmutableList.of(new JsExpr("''", Integer.MAX_VALUE), value));
  }

  @Override
  public PyExpr applyForPySrc(PyExpr value, List<PyExpr> args) {
    return value.toPyString();
  }
}
