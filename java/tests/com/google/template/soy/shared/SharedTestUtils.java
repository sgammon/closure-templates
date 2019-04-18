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

package com.google.template.soy.shared;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.exprtree.AbstractExprNodeVisitor;
import com.google.template.soy.exprtree.ExprNode;
import com.google.template.soy.exprtree.ExprNode.ParentExprNode;
import com.google.template.soy.exprtree.FunctionNode;
import com.google.template.soy.exprtree.VarRefNode;
import com.google.template.soy.soyparse.SoyFileParser;
import com.google.template.soy.soytree.SoyFileSetNode;
import com.google.template.soy.soytree.SoyNode;
import com.google.template.soy.soytree.SoyNode.ParentSoyNode;
import com.google.template.soy.types.SoyType;
import com.google.template.soy.types.UnknownType;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;

/**
 * Shared utilities for unit tests.
 *
 * <p>Important: Do not use outside of Soy code (treat as superpackage-private).
 *
 */
public final class SharedTestUtils {

  private SharedTestUtils() {}

  /**
   * Builds a test Soy file's content from the given Soy code, which will be the body of the only
   * template in the test Soy file.
   *
   * @param soyDocParamNames Param names to declare in SoyDoc of the single template.
   * @param soyCode The code to parse as the full body of a template.
   * @return The test Soy file's content.
   */
  public static String buildTestSoyFileContent(
      @Nullable List<String> soyDocParamNames, String soyCode) {
    return buildTestSoyFileContent(false, soyDocParamNames, soyCode);
  }

  /**
   * Builds a test Soy file's content from the given Soy code, which will be the body of the only
   * template in the test Soy file.
   *
   * @param strictHtml Whether to use strict html mode in this namespace.
   * @param soyDocParamNames Param names to declare in SoyDoc of the single template.
   * @param soyCode The code to parse as the full body of a template.
   * @return The test Soy file's content.
   */
  public static String buildTestSoyFileContent(
      boolean strictHtml,
      @Nullable List<String> soyDocParamNames,
      String soyCode) {
    String namespace = "brittle.test.ns";
    String templateName = ".brittleTestTemplate";

    StringBuilder soyFileContentBuilder = new StringBuilder();
    soyFileContentBuilder.append("{namespace " + namespace + "}\n").append("/** Test template.");
    if (soyDocParamNames != null) {
      for (String paramName : soyDocParamNames) {
        soyFileContentBuilder.append(" @param " + paramName);
      }
    }
    soyFileContentBuilder
        .append(" */\n")
        .append("{template " + templateName)
        .append(strictHtml ? "" : " stricthtml=\"false\"")
        .append("}\n")
        .append(soyCode)
        .append("\n")
        .append("{/template}\n");
    return soyFileContentBuilder.toString();
  }

  /**
   * Returns a template body for the given soy expression. e.g. for the soy expression {@code $foo +
   * 2} this will return
   *
   * <pre><code>
   *   {{@literal @}param foo : ?}
   *   {$foo + 2}
   * </code></pre>
   *
   * <p>To supply types, call {@link #createTemplateBodyForExpression} directly.
   */
  public static String untypedTemplateBodyForExpression(String soyExpr) {
    return createTemplateBodyForExpression(soyExpr, ImmutableMap.of());
  }

  /** Returns a template body for the given soy expression. With type specializations. */
  public static String createTemplateBodyForExpression(
      String soyExpr, final Map<String, SoyType> typeMap) {
    ExprNode expr =
        SoyFileParser.parseExpression(
            soyExpr,
            ErrorReporter.exploding());
    final Set<String> loopVarNames = new HashSet<>();
    final Set<String> names = new HashSet<>();
    new AbstractExprNodeVisitor<Void>() {

      @Override
      protected void visitVarRefNode(VarRefNode node) {
        names.add(node.getName());
      }

      @Override
      protected void visitFunctionNode(FunctionNode node) {
        switch (node.getFunctionName()) {
          case "index":
          case "isFirst":
          case "isLast":
            loopVarNames.add(((VarRefNode) node.getChild(0)).getName());
            break;
          default: // fall out
        }
        visitChildren(node);
      }

      @Override
      protected void visitExprNode(ExprNode node) {
        if (node instanceof ParentExprNode) {
          visitChildren((ParentExprNode) node);
        }
      }
    }.exec(expr);
    final StringBuilder templateBody = new StringBuilder();
    for (String varName : Sets.difference(names, loopVarNames)) {
      SoyType type = typeMap.get(varName);
      if (type == null) {
        type = UnknownType.getInstance();
      }
      templateBody.append("{@param " + varName + ": " + type + "}\n");
    }
    String contents = "{" + soyExpr + "}\n";
    for (String loopVar : loopVarNames) {
      contents = "{for $" + loopVar + " in [null]}\n" + contents + "\n{/for}";
    }
    templateBody.append(contents);
    return templateBody.toString();
  }

  /**
   * Retrieves the node within the given Soy tree indicated by the given indices to reach the
   * desired node.
   *
   * @param soyTree The Soy tree.
   * @param indicesToNode The indices to reach the desired node to retrieve. E.g. To retrieve the
   *     first child of the template, simply pass a single 0.
   * @return The desired node in the Soy tree.
   */
  public static SoyNode getNode(SoyFileSetNode soyTree, int... indicesToNode) {

    SoyNode node = soyTree.getChild(0).getChild(0); // initially set to TemplateNode
    for (int index : indicesToNode) {
      node = ((ParentSoyNode<?>) node).getChild(index);
    }
    return node;
  }
}
