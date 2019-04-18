/*
 * Copyright 2016 Google Inc.
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
import com.google.errorprone.annotations.Immutable;
import javax.annotation.Nullable;

/** Represents an assignment to a variable. */
@AutoValue
@Immutable
abstract class Assignment extends Statement {
  abstract Expression lhs();

  abstract Expression rhs();

  @Nullable
  abstract JsDoc jsDoc();

  static Assignment create(Expression lhs, Expression rhs, JsDoc jsDoc) {
    return new AutoValue_Assignment(lhs, rhs, jsDoc);
  }

  @Override
  public void collectRequires(RequiresCollector collector) {
    lhs().collectRequires(collector);
    rhs().collectRequires(collector);
    if (jsDoc() != null) {
      jsDoc().collectRequires(collector);
    }
  }

  @Override
  void doFormatInitialStatements(FormattingContext ctx) {
    if (jsDoc() != null) {
      ctx.append(jsDoc()).endLine();
    }
    ctx.appendInitialStatements(lhs())
        .appendInitialStatements(rhs())
        .appendOutputExpression(lhs())
        .append(" = ")
        .appendOutputExpression(rhs())
        .append(";")
        .endLine();
  }
}
