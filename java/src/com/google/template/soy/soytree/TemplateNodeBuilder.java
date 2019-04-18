/*
 * Copyright 2013 Google Inc.
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

package com.google.template.soy.soytree;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.CharMatcher;
import com.google.common.base.Joiner;
import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.template.soy.base.SourceLocation;
import com.google.template.soy.base.internal.Identifier;
import com.google.template.soy.base.internal.SanitizedContentKind;
import com.google.template.soy.error.ErrorReporter;
import com.google.template.soy.error.SoyErrorKind;
import com.google.template.soy.soytree.TemplateNode.SoyFileHeaderInfo;
import com.google.template.soy.soytree.defn.TemplateParam;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import javax.annotation.Nullable;

/**
 * Builder for TemplateNode.
 *
 * <p>Important: Do not use outside of Soy code (treat as superpackage-private).
 *
 */
public abstract class TemplateNodeBuilder<T extends TemplateNodeBuilder<T>> {
  // TODO(b/78790262): Remove once people get used to it.
  private static final SoyErrorKind SOYDOC_PARAM =
      SoyErrorKind.of(
          "SoyDoc params are not supported anymore. "
              + "Use '{@param}' in the template header instead.");
  private static final SoyErrorKind INVALID_PARAM_NAMED_IJ =
      SoyErrorKind.of("Invalid param name ''ij'' (''ij'' is for injected data).");
  private static final SoyErrorKind PARAM_ALREADY_DECLARED =
      SoyErrorKind.of("Param ''{0}'' already declared.");

  /** Info from the containing Soy file's header declarations. */
  protected final SoyFileHeaderInfo soyFileHeaderInfo;

  /** For reporting parse errors. */
  protected final ErrorReporter errorReporter;

  /** The id for this node. */
  protected Integer id;

  /** The command text. */
  protected String cmdText;

  /**
   * This template's name. This is private instead of protected to enforce use of
   * setTemplateNames().
   */
  private String templateName;

  /**
   * This template's partial name. Only applicable for V2. This is private instead of protected to
   * enforce use of setTemplateNames().
   */
  private String partialTemplateName;

  /** This template's visibility level. */
  protected Visibility visibility;

  /** This template's whitespace handling mode. */
  protected WhitespaceMode whitespaceMode = WhitespaceMode.JOIN;

  /** Required CSS namespaces. */
  private ImmutableList<String> requiredCssNamespaces = ImmutableList.of();

  /** Base CSS namespace for package-relative CSS selectors. */
  private String cssBaseNamespace;

  /**
   * Strict mode context. This is private instead of protected to enforce use of setContentKind().
   */
  private SanitizedContentKind contentKind;

  /** The full SoyDoc, including the start/end tokens, or null. */
  protected String soyDoc;

  /** The description portion of the SoyDoc, or null. */
  protected String soyDocDesc;

  /** The params from template header. Null if no decls. */
  @Nullable protected ImmutableList<TemplateParam> params;

  protected boolean strictHtmlDisabled;

  SourceLocation sourceLocation;
  SourceLocation openTagLocation;

  /** @param soyFileHeaderInfo Info from the containing Soy file's header declarations. */
  protected TemplateNodeBuilder(SoyFileHeaderInfo soyFileHeaderInfo, ErrorReporter errorReporter) {
    this.soyFileHeaderInfo = soyFileHeaderInfo;
    this.errorReporter = errorReporter;
  }

  /**
   * Sets the id for the node to be built.
   *
   * @return This builder.
   */
  public T setId(int id) {
    Preconditions.checkState(this.id == null);
    this.id = id;
    return (T) this;
  }

  /** Sets the source location. */
  public T setSourceLocation(SourceLocation location) {
    checkState(sourceLocation == null);
    this.sourceLocation = checkNotNull(location);
    return (T) this;
  }

  /** Sets the source location. */
  public T setOpenTagLocation(SourceLocation location) {
    checkState(openTagLocation == null);
    this.openTagLocation = checkNotNull(location);
    return (T) this;
  }

  /**
   * Set the parsed data from the command tag.
   *
   * @param name The template name
   * @param attrs The attributes that are set on the tag {e.g. {@code kind="strict"}}
   */
  public abstract T setCommandValues(Identifier name, List<CommandTagAttribute> attrs);

  protected static final ImmutableSet<String> COMMON_ATTRIBUTE_NAMES =
      ImmutableSet.of("kind", "requirecss", "cssbase", "stricthtml", "whitespace");

  protected void setCommonCommandValues(List<CommandTagAttribute> attrs) {
    SanitizedContentKind kind = SanitizedContentKind.HTML;
    for (CommandTagAttribute attribute : attrs) {
      Identifier name = attribute.getName();
      switch (name.identifier()) {
        case "kind":
          kind = attribute.valueAsContentKind(errorReporter);
          SourceLocation kindLocation = attribute.getValueLocation();
          if (kind == SanitizedContentKind.HTML) {
            errorReporter.report(
                kindLocation, CommandTagAttribute.EXPLICIT_DEFAULT_ATTRIBUTE, "kind", "html");
          }
          break;
        case "requirecss":
          setRequiredCssNamespaces(attribute.valueAsRequireCss(errorReporter));
          break;
        case "cssbase":
          setCssBaseNamespace(attribute.valueAsCssBase(errorReporter));
          break;
        case "stricthtml":
          strictHtmlDisabled = attribute.valueAsDisabled(errorReporter);
          break;
        case "whitespace":
          whitespaceMode = attribute.valueAsWhitespaceMode(errorReporter);
          break;
        default:
          break;
      }
    }
    setContentKind(kind);
  }

  /**
   * Sets the SoyDoc for the node to be built.
   *
   * @return This builder.
   */
  public T setSoyDoc(String soyDoc, SourceLocation soyDocLocation) {
    Preconditions.checkState(this.soyDoc == null);
    Preconditions.checkState(cmdText != null);
    int paramOffset = soyDoc.indexOf("@param");
    if (paramOffset != -1) {
      errorReporter.report(
          new RawTextNode(-1, soyDoc, soyDocLocation)
              .substringLocation(paramOffset, paramOffset + "@param".length()),
          SOYDOC_PARAM);
    }
    this.soyDoc = soyDoc;
    Preconditions.checkArgument(soyDoc.startsWith("/**") && soyDoc.endsWith("*/"));
    this.soyDocDesc = cleanSoyDocHelper(soyDoc);

    return (T) this;
  }

  /**
   * This method is intended to be called at most once for header params.
   *
   * @param newParams The params to add.
   */
  public T addParams(Iterable<? extends TemplateParam> newParams) {

    Set<String> seenParamKeys = new HashSet<>();
    if (this.params == null) {
      this.params = ImmutableList.copyOf(newParams);
    } else {
      for (TemplateParam oldParam : this.params) {
        seenParamKeys.add(oldParam.name());
      }
      this.params =
          ImmutableList.<TemplateParam>builder().addAll(this.params).addAll(newParams).build();
    }

    // Check new params.
    for (TemplateParam param : newParams) {
      if (param.name().equals("ij")) {
        errorReporter.report(param.nameLocation(), INVALID_PARAM_NAMED_IJ);
      }
      if (!seenParamKeys.add(param.name())) {
        errorReporter.report(param.nameLocation(), PARAM_ALREADY_DECLARED, param.name());
      }
    }
    return (T) this;
  }

  /** Builds the template node. Will error if not enough info as been set on this builder. */
  public abstract TemplateNode build();

  // -----------------------------------------------------------------------------------------------
  // Protected helpers for fields that need extra logic when being set.

  protected void setContentKind(SanitizedContentKind contentKind) {
    this.contentKind = contentKind;
  }

  /** @return the id for this node. */
  Integer getId() {
    return id;
  }

  /** @return The command text. */
  String getCmdText() {
    return cmdText;
  }

  /** @return The full SoyDoc, including the start/end tokens, or null. */
  String getSoyDoc() {
    return soyDoc;
  }

  /** @return The description portion of the SoyDoc (before declarations), or null. */
  String getSoyDocDesc() {
    return soyDocDesc;
  }

  /** @return Strict mode context. */
  public SanitizedContentKind getContentKind() {
    return contentKind;
  }

  /** Gets the whitespace handling mode. */
  public WhitespaceMode getWhitespaceMode() {
    return whitespaceMode;
  }

  /** @return Required CSS namespaces. */
  protected ImmutableList<String> getRequiredCssNamespaces() {
    return Preconditions.checkNotNull(requiredCssNamespaces);
  }

  protected void setRequiredCssNamespaces(ImmutableList<String> requiredCssNamespaces) {
    this.requiredCssNamespaces = Preconditions.checkNotNull(requiredCssNamespaces);
  }

  /** @return Base CSS namespace for package-relative CSS selectors. */
  protected String getCssBaseNamespace() {
    return cssBaseNamespace;
  }

  protected void setCssBaseNamespace(String cssBaseNamespace) {
    this.cssBaseNamespace = cssBaseNamespace;
  }

  protected final void setTemplateNames(String templateName, String partialTemplateName) {
    this.templateName = checkNotNull(templateName);
    this.partialTemplateName = checkNotNull(partialTemplateName);
  }

  protected boolean getStrictHtmlDisabled() {
    return strictHtmlDisabled;
  }

  protected String getTemplateName() {
    return templateName;
  }

  protected String getPartialTemplateName() {
    return partialTemplateName;
  }

  // -----------------------------------------------------------------------------------------------
  // Private static helpers for parsing template SoyDoc.

  /** Pattern for a newline. */
  private static final Pattern NEWLINE = Pattern.compile("\\n|\\r\\n?");

  /** Pattern for a SoyDoc start token, including spaces up to the first newline. */
  private static final Pattern SOY_DOC_START =
      Pattern.compile("^ [/][*][*] [\\ ]* \\r?\\n?", Pattern.COMMENTS);

  /** Pattern for a SoyDoc end token, including preceding spaces up to the last newline. */
  private static final Pattern SOY_DOC_END =
      Pattern.compile("\\r?\\n? [\\ ]* [*][/] $", Pattern.COMMENTS);

  /**
   * Private helper for the constructor to clean the SoyDoc. (1) Changes all newlines to "\n". (2)
   * Escapes deprecated javadoc tags. (3) Strips the start/end tokens and spaces (including newlines
   * if they occupy their own lines). (4) Removes common indent from all lines (e.g.
   * space-star-space).
   *
   * @param soyDoc The SoyDoc to clean.
   * @return The cleaned SoyDoc.
   */
  private static String cleanSoyDocHelper(String soyDoc) {
    // Change all newlines to "\n".
    soyDoc = NEWLINE.matcher(soyDoc).replaceAll("\n");

    // Escape all @deprecated javadoc tags.
    // TODO(cushon): add this to the specification and then also generate @Deprecated annotations
    soyDoc = soyDoc.replace("@deprecated", "&#64;deprecated");

    // Strip start/end tokens and spaces (including newlines if they occupy their own lines).
    soyDoc = SOY_DOC_START.matcher(soyDoc).replaceFirst("");
    soyDoc = SOY_DOC_END.matcher(soyDoc).replaceFirst("");

    // Split into lines.
    List<String> lines = Lists.newArrayList(Splitter.on(NEWLINE).split(soyDoc));

    // Remove indent common to all lines. Note that SoyDoc indents often include a star
    // (specifically the most common indent is space-star-space). Thus, we first remove common
    // spaces, then remove one common star, and finally, if we did remove a star, then we once again
    // remove common spaces.
    removeCommonStartCharHelper(lines, ' ', true);
    if (removeCommonStartCharHelper(lines, '*', false) == 1) {
      removeCommonStartCharHelper(lines, ' ', true);
    }

    return CharMatcher.whitespace().trimTrailingFrom(Joiner.on('\n').join(lines));
  }

  /**
   * Private helper for {@code cleanSoyDocHelper()}. Removes a common character at the start of all
   * lines, either once or as many times as possible.
   *
   * <p>Special case: Empty lines count as if they do have the common character for the purpose of
   * deciding whether all lines have the common character.
   *
   * @param lines The list of lines. If removal happens, then the list elements will be modified.
   * @param charToRemove The char to remove from the start of all lines.
   * @param shouldRemoveMultiple Whether to remove the char as many times as possible.
   * @return The number of chars removed from the start of each line.
   */
  private static int removeCommonStartCharHelper(
      List<String> lines, char charToRemove, boolean shouldRemoveMultiple) {

    int numCharsToRemove = 0;

    // Count num chars to remove.
    boolean isStillCounting = true;
    do {
      boolean areAllLinesEmpty = true;
      for (String line : lines) {
        if (line.length() == 0) {
          continue; // empty lines are okay
        }
        areAllLinesEmpty = false;
        if (line.length() <= numCharsToRemove || line.charAt(numCharsToRemove) != charToRemove) {
          isStillCounting = false;
          break;
        }
      }
      if (areAllLinesEmpty) {
        isStillCounting = false;
      }
      if (isStillCounting) {
        numCharsToRemove += 1;
      }
    } while (isStillCounting && shouldRemoveMultiple);

    // Perform the removal.
    if (numCharsToRemove > 0) {
      for (int i = 0; i < lines.size(); i++) {
        String line = lines.get(i);
        if (line.length() == 0) {
          continue; // don't change empty lines
        }
        lines.set(i, line.substring(numCharsToRemove));
      }
    }

    return numCharsToRemove;
  }
}
