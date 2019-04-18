/*
 * Copyright 2010 Google Inc.
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

import com.google.common.base.CaseFormat;
import com.google.common.collect.ImmutableSet;
import com.google.errorprone.annotations.concurrent.LazyInit;
import com.google.template.soy.data.LoggingAdvisingAppendable;
import com.google.template.soy.data.SanitizedContent;
import com.google.template.soy.data.SanitizedContent.ContentKind;
import com.google.template.soy.data.SoyValue;
import com.google.template.soy.data.restricted.StringData;
import com.google.template.soy.jbcsrc.restricted.Expression;
import com.google.template.soy.jbcsrc.restricted.JbcSrcPluginContext;
import com.google.template.soy.jbcsrc.restricted.MethodRef;
import com.google.template.soy.jbcsrc.restricted.SoyExpression;
import com.google.template.soy.jbcsrc.restricted.SoyJbcSrcPrintDirective;
import com.google.template.soy.jbcsrc.restricted.SoyJbcSrcPrintDirective.Streamable.AppendableAndOptions;
import com.google.template.soy.jssrc.restricted.JsExpr;
import com.google.template.soy.jssrc.restricted.SoyLibraryAssistedJsSrcPrintDirective;
import com.google.template.soy.pysrc.restricted.PyExpr;
import com.google.template.soy.pysrc.restricted.SoyPySrcPrintDirective;
import com.google.template.soy.shared.internal.Sanitizers;
import com.google.template.soy.shared.internal.ShortCircuitable;
import com.google.template.soy.shared.restricted.SoyJavaPrintDirective;
import com.google.template.soy.shared.restricted.SoyPurePrintDirective;
import java.util.List;
import java.util.Set;

/**
 * An escaping directive that is backed by {@link Sanitizers} in java, {@code soyutils.js} or the
 * closure equivalent in JavaScript, and {@code sanitize.py} in Python.
 *
 * <p>See {@link com.google.template.soy.jssrc.internal.GenerateSoyUtilsEscapingDirectiveCode} which
 * creates the JS code that backs escaping directives, and {@link
 * com.google.template.soy.pysrc.internal.GeneratePySanitizeEscapingDirectiveCode} which creates the
 * Python backing code.
 *
 */
public abstract class BasicEscapeDirective
    implements SoyJavaPrintDirective,
        SoyLibraryAssistedJsSrcPrintDirective,
        SoyPySrcPrintDirective,
        SoyJbcSrcPrintDirective {

  private static final ImmutableSet<Integer> VALID_ARGS_SIZES = ImmutableSet.of(0);

  /** The directive name, including the leading vertical bar ("|"). */
  private final String name;

  @LazyInit private MethodRef javaSoyValueSanitizer;
  @LazyInit private MethodRef javaStreamingSanitizer;

  /** @param name E.g. {@code |escapeUri}. */
  public BasicEscapeDirective(String name) {
    this.name = name;
  }

  /** Performs the actual escaping. */
  protected abstract String escape(SoyValue value);

  /** The name of the Soy directive that this instance implements. */
  @Override
  public final String getName() {
    return name;
  }

  @Override
  public final Set<Integer> getValidArgsSizes() {
    return VALID_ARGS_SIZES;
  }

  /**
   * Returns whether or not the streaming version of this directive is closeable.
   *
   * <p>The default is {@code false}, override this to change it to {@code true};
   */
  protected boolean isCloseable() {
    return false;
  }

  @Override
  public SoyValue applyForJava(SoyValue value, List<SoyValue> args) {
    return StringData.forValue(escape(value));
  }

  @Override
  public JsExpr applyForJsSrc(JsExpr value, List<JsExpr> args) {
    return new JsExpr(
        "soy.$$" + name.substring(1) + "(" + value.getText() + ")", Integer.MAX_VALUE);
  }

  @Override
  public ImmutableSet<String> getRequiredJsLibNames() {
    return ImmutableSet.of("soy");
  }

  @Override
  public PyExpr applyForPySrc(PyExpr value, List<PyExpr> args) {
    String pyFnName = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, name.substring(1));
    return new PyExpr("sanitize." + pyFnName + "(" + value.getText() + ")", Integer.MAX_VALUE);
  }

  @Override
  public SoyExpression applyForJbcSrc(
      JbcSrcPluginContext context, SoyExpression value, List<SoyExpression> args) {
    MethodRef sanitizerMethod = javaSoyValueSanitizer;
    if (sanitizerMethod == null) {
      // lazily allocated
      sanitizerMethod =
          MethodRef.create(Sanitizers.class, name.substring(1), SoyValue.class).asNonNullable();
      javaSoyValueSanitizer = sanitizerMethod;
    }
    // almost all the escaper functions have versions which accept a raw String, in theory we could
    // take advantage of this to avoid boxing, but the risk is that we might throw away information
    // about the content kind of the string.
    return SoyExpression.forString(sanitizerMethod.invoke(value.box()));
  }

  /**
   * Default implementation for {@link Streamable}.
   *
   * <p>Subclasses can simply add {@code implements Streamable} if they have an implementation in
   * Sanitizers.<name>Streaming. If they don't, this method will throw while trying to find it.
   */
  public final AppendableAndOptions applyForJbcSrcStreaming(
      JbcSrcPluginContext context, Expression delegateAppendable, List<SoyExpression> args) {
    MethodRef sanitizerMethod = javaStreamingSanitizer;
    if (sanitizerMethod == null) {
      // lazily allocated
      sanitizerMethod =
          MethodRef.create(
                  Sanitizers.class,
                  name.substring(1) + "Streaming",
                  LoggingAdvisingAppendable.class)
              .asNonNullable();
      javaStreamingSanitizer = sanitizerMethod;
    }
    Expression streamingSanitizersExpr = sanitizerMethod.invoke(delegateAppendable);
    if (isCloseable()) {
      return AppendableAndOptions.createCloseable(streamingSanitizersExpr);
    } else {
      return AppendableAndOptions.create(streamingSanitizersExpr);
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Concrete subclasses.

  /** Implements the |escapeCssString directive. */
  @SoyPurePrintDirective
  static final class EscapeCssString extends BasicEscapeDirective implements Streamable {

    EscapeCssString() {
      super("|escapeCssString");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeCssString(value);
    }
  }

  /** Implements the |filterCssValue directive. */
  @SoyPurePrintDirective
  static final class FilterCssValue extends BasicEscapeDirective {

    FilterCssValue() {
      super("|filterCssValue");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterCssValue(value);
    }
  }

  /**
   * Implements the |normalizeHtml directive. This escapes the same as escapeHtml except does not
   * escape attributes.
   */
  @SoyPurePrintDirective
  static final class NormalizeHtml extends BasicEscapeDirective implements Streamable {

    NormalizeHtml() {
      super("|normalizeHtml");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.normalizeHtml(value);
    }
  }

  /** Implements the |escapeHtmlRcdata directive. */
  @SoyPurePrintDirective
  static final class EscapeHtmlRcdata extends BasicEscapeDirective implements Streamable {

    EscapeHtmlRcdata() {
      super("|escapeHtmlRcdata");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeHtmlRcdata(value);
    }
  }

  /** Implements the |escapeHtmlAttribute directive. */
  @SoyPurePrintDirective
  static final class EscapeHtmlAttribute extends BasicEscapeDirective {

    EscapeHtmlAttribute() {
      super("|escapeHtmlAttribute");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeHtmlAttribute(value);
    }
  }

  /** Implements the |escapeHtmlHtmlAttribute directive. */
  @SoyPurePrintDirective
  static final class EscapeHtmlHtmlAttribute extends BasicEscapeDirective {

    EscapeHtmlHtmlAttribute() {
      super("|escapeHtmlHtmlAttribute");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeHtmlHtmlAttribute(value);
    }
  }

  /** Implements the |escapeHtmlAttributeNospace directive. */
  @SoyPurePrintDirective
  static final class EscapeHtmlAttributeNospace extends BasicEscapeDirective {

    EscapeHtmlAttributeNospace() {
      super("|escapeHtmlAttributeNospace");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeHtmlAttributeNospace(value);
    }
  }

  /** Implements the |filterHtmlAttributes directive. */
  @SoyPurePrintDirective
  static final class FilterHtmlAttributes extends BasicEscapeDirective implements Streamable {

    FilterHtmlAttributes() {
      super("|filterHtmlAttributes");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterHtmlAttributes(value);
    }

    @Override
    protected boolean isCloseable() {
      return true;
    }
  }

  /** Implements the |filterNumber directive. */
  @SoyPurePrintDirective
  static final class FilterNumber extends BasicEscapeDirective {
    FilterNumber() {
      super("|filterNumber");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterNumber(value);
    }
  }

  /** Implements the |filterHtmlElementName directive. */
  @SoyPurePrintDirective
  static final class FilterHtmlElementName extends BasicEscapeDirective {

    FilterHtmlElementName() {
      super("|filterHtmlElementName");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterHtmlElementName(value);
    }
  }

  /** Implements the |escapeJsRegex directive. */
  @SoyPurePrintDirective
  static final class EscapeJsRegex extends BasicEscapeDirective implements Streamable {

    EscapeJsRegex() {
      super("|escapeJsRegex");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeJsRegex(value);
    }
  }

  /** Implements the |escapeJsString directive. */
  @SoyPurePrintDirective
  static final class EscapeJsString extends BasicEscapeDirective implements Streamable {

    EscapeJsString() {
      super("|escapeJsString");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeJsString(value);
    }
  }

  /** Implements the |escapeJsValue directive. */
  @SoyPurePrintDirective
  static final class EscapeJsValue extends BasicEscapeDirective implements ShortCircuitable {

    EscapeJsValue() {
      super("|escapeJsValue");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeJsValue(value);
    }

    @Override
    public boolean isNoopForKind(ContentKind kind) {
      return kind == SanitizedContent.ContentKind.JS;
    }
  }

  /** Implements the |filterNormalizeUri directive. */
  @SoyPurePrintDirective
  static final class FilterNormalizeUri extends BasicEscapeDirective {

    FilterNormalizeUri() {
      super("|filterNormalizeUri");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterNormalizeUri(value);
    }
  }

  /** Implements the |filterNormalizeMediaUri directive. */
  @SoyPurePrintDirective
  static final class FilterNormalizeMediaUri extends BasicEscapeDirective {

    FilterNormalizeMediaUri() {
      super("|filterNormalizeMediaUri");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterNormalizeMediaUri(value);
    }
  }

  /** Implements the |filterNormalizeRefreshUri directive. */
  @SoyPurePrintDirective
  static final class FilterNormalizeRefreshUri extends BasicEscapeDirective {

    FilterNormalizeRefreshUri() {
      super("|filterNormalizeRefreshUri");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterNormalizeRefreshUri(value);
    }
  }

  /** Implements the |normalizeUri directive. */
  @SoyPurePrintDirective
  static final class NormalizeUri extends BasicEscapeDirective implements Streamable {

    NormalizeUri() {
      super("|normalizeUri");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.normalizeUri(value);
    }
  }

  /** Implements the |escapeUri directive. */
  @SoyPurePrintDirective
  static final class EscapeUri extends BasicEscapeDirective {

    EscapeUri() {
      super("|escapeUri");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.escapeUri(value);
    }
  }

  /** Implements the |filterTrustedResourceUri directive. */
  @SoyPurePrintDirective
  static final class FilterTrustedResourceUri extends BasicEscapeDirective
      implements ShortCircuitable {

    FilterTrustedResourceUri() {
      super("|filterTrustedResourceUri");
    }

    @Override
    protected String escape(SoyValue value) {
      return Sanitizers.filterTrustedResourceUri(value);
    }

    @Override
    public boolean isNoopForKind(ContentKind kind) {
      return kind == ContentKind.TRUSTED_RESOURCE_URI;
    }
  }
}
