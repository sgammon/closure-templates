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
package com.google.template.soy.jssrc.dsl;

import com.google.auto.value.AutoValue;
import com.google.common.collect.ImmutableList;
import com.google.template.soy.jssrc.restricted.JsExpr;

/**
 * Represents an anonymous JavaScript function declaration.
 *
 * <p>Example:
 *
 * <p><code>{@literal
 * function(param1, param2) { < function body > }
 * }</code>
 */
@AutoValue
abstract class FunctionDeclaration extends Expression {

  abstract JsDoc jsDoc();

  abstract Statement body();

  abstract boolean isArrowFunction();

  static FunctionDeclaration create(JsDoc jsDoc, Statement body) {
    return new AutoValue_FunctionDeclaration(
        /* initialStatements= */ ImmutableList.of(), jsDoc, body, false);
  }

  static FunctionDeclaration createArrowFunction(JsDoc jsDoc, Statement body) {
    return new AutoValue_FunctionDeclaration(
        /* initialStatements= */ ImmutableList.of(), jsDoc, body, true);
  }

  @Override
  public JsExpr singleExprOrName() {
    FormattingContext ctx = new FormattingContext();
    ctx.appendOutputExpression(this);
    return new JsExpr(ctx.toString(), Integer.MAX_VALUE);
  }

  @Override
  void doFormatInitialStatements(FormattingContext ctx) {
    // there are none
  }

  @Override
  public void collectRequires(RequiresCollector collector) {
    body().collectRequires(collector);
    jsDoc().collectRequires(collector);
  }

  @Override
  void doFormatOutputExpr(FormattingContext ctx) {
    if (!isArrowFunction()) {
      ctx.append("function");
    }
    ctx.append("(");
    ctx.append(CodeChunkUtils.generateParamList(jsDoc()));
    ctx.append(") ");
    if (isArrowFunction()) {
      ctx.append("=> ");
    }
    try (FormattingContext ignored = ctx.enterBlock()) {
      ctx.appendAll(body());
    }
  }
}
