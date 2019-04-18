/*
 * Copyright 2014 Google Inc.
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

package com.google.template.soy.passes;

import com.google.common.collect.ImmutableList;
import com.google.template.soy.base.internal.IdGenerator;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.error.SoyErrorKind;
import com.google.template.soy.soytree.CallBasicNode;
import com.google.template.soy.soytree.SoyFileNode;
import com.google.template.soy.soytree.SoyTreeUtils;
import com.google.template.soy.soytree.TemplateMetadata;
import com.google.template.soy.soytree.TemplateRegistry;
import com.google.template.soy.soytree.Visibility;

/**
 * Visitor for checking the visibility of a template.
 *
 * @author brndn@google.com (Brendan Linn)
 */
final class CheckTemplateVisibilityPass extends CompilerFileSetPass {

  private static final SoyErrorKind CALLEE_NOT_VISIBLE =
      SoyErrorKind.of("{0} has {1} access in {2}.");

  private final ErrorReporter errorReporter;

  CheckTemplateVisibilityPass(ErrorReporter errorReporter) {
    this.errorReporter = errorReporter;
  }

  @Override
  public Result run(
      ImmutableList<SoyFileNode> sourceFiles, IdGenerator idGenerator, TemplateRegistry registry) {
    for (SoyFileNode file : sourceFiles) {
      for (CallBasicNode node : SoyTreeUtils.getAllNodesOfType(file, CallBasicNode.class)) {
        String calleeName = node.getCalleeName();
        TemplateMetadata definition = registry.getBasicTemplateOrElement(calleeName);
        if (definition != null && !isVisible(file, definition)) {
          errorReporter.report(
              node.getSourceLocation(),
              CALLEE_NOT_VISIBLE,
              calleeName,
              definition.getVisibility().getAttributeValue(),
              definition.getSourceLocation().getFilePath());
        }
      }
    }

    return Result.CONTINUE;
  }

  private static boolean isVisible(SoyFileNode calledFrom, TemplateMetadata callee) {
    // The only visibility level that this pass currently cares about is PRIVATE.
    // Templates are visible if they are not private or are defined in the same file.
    return callee.getVisibility() != Visibility.PRIVATE
        || callee.getSourceLocation().getFilePath().equals(calledFrom.getFilePath());
  }
}
