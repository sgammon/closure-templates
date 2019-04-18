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

package com.google.template.soy.conformance;

import com.google.common.collect.ImmutableSet;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.error.SoyErrorKind;
import com.google.template.soy.soytree.HtmlAttributeNode;
import com.google.template.soy.soytree.HtmlAttributeValueNode;
import com.google.template.soy.soytree.HtmlCommentNode;
import com.google.template.soy.soytree.RawTextNode;

/**
 * Conformance rule banning particular raw text in Soy.
 *
 * @author brndn@google.com (Brendan Linn)
 */
final class BannedRawText extends Rule<RawTextNode> {

  private final ImmutableSet<String> bannedTexts;
  private final ImmutableSet<String> ignoredHtmlAttributes;

  BannedRawText(
      ImmutableSet<String> bannedRawText,
      ImmutableSet<String> ignoredHtmlAttributes,
      SoyErrorKind error) {
    super(error);
    this.bannedTexts = bannedRawText;
    this.ignoredHtmlAttributes = ignoredHtmlAttributes;
  }

  @Override
  protected void doCheckConformance(RawTextNode node, ErrorReporter errorReporter) {
    if (node.getParent() instanceof HtmlCommentNode) {
      return;
    }
    String rawText = node.getRawText();
    for (String bannedText : bannedTexts) {
      int indexOf = rawText.indexOf(bannedText);
      if (indexOf > -1 && !isIgnoredHtmlAttribute(node)) {
        errorReporter.report(node.substringLocation(indexOf, indexOf + bannedText.length()), error);
      }
    }
  }

  private boolean isIgnoredHtmlAttribute(RawTextNode node) {
    if (!(node.getParent() instanceof HtmlAttributeValueNode)
        || !(node.getParent().getParent() instanceof HtmlAttributeNode)) {
      return false;
    }
    HtmlAttributeNode htmlAttributeNode = (HtmlAttributeNode) node.getParent().getParent();
    for (String ignoredAttribute : ignoredHtmlAttributes) {
      if (htmlAttributeNode.definitelyMatchesAttributeName(ignoredAttribute)) {
        return true;
      }
    }
    return false;
  }
}
