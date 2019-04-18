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

package com.google.template.soy.types;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.google.errorprone.annotations.ForOverride;
import com.google.errorprone.annotations.concurrent.LazyInit;
import com.google.template.soy.soytree.SoyTypeP;

/**
 * Interface for all classes that describe a data type in Soy. These types are used to determine
 * what kinds of values can be bound to a template or function parameter.
 *
 * <p>Note that this type hierarchy only describes types that are visible from a template author's
 * perspective. Actual Soy values may have types which fall outside this hierarchy. An example is
 * Futures - a SoyValue may contain a future of a type, but since the future is always resolved
 * before the value is used, the future type is invisible as far as the template is concerned.
 *
 * <p>All type objects are immutable.
 *
 * <p>Important: Do not use outside of Soy code (treat as superpackage-private).
 *
 */
public abstract class SoyType {

  /**
   * Enum that identifies the kind of type this is.
   *
   * <ul>
   *   <li>Special types:
   *       <ul>
   *         <li>ANY: Superclass of all types.
   *         <li>UNKNOWN: Indicates that we don't know the type. A value with unknown type is
   *             considered to be dynamically typed.
   *         <li>ERROR: Placeholder which represents a type that failed to parse.
   *       </ul>
   *   <li>Primitive types:
   *       <ul>
   *         <li>NULL: The type of the "null" value
   *         <li>BOOL
   *         <li>INT
   *         <li>FLOAT
   *         <li>STRING
   *       </ul>
   *   <li>Sanitized types (subtypes of string):
   *       <ul>
   *         <li>HTML: Possibly containing HTML markup
   *         <li>ATTRIBUTES: key="value" pairs
   *         <li>JS
   *         <li>CSS
   *         <li>URI
   *         <li>TRUSTED_RESOURCE_URI
   *       </ul>
   *   <li>Aggregate types:
   *       <ul>
   *         <li>LIST: Sequence of items indexed by integer.
   *         <li>RECORD: Open-ended record type.
   *         <li>LEGACY_OBJECT_MAP: Deprecated map type.
   *         <li>MAP: Map type that supports proto map (and ES6 map in JS backend).
   *         <li>PROTO: Protobuf object.
   *         <li>PROTO_ENUM: Protobuf enum object.
   *         <li>UNION: Used to indicate a parameter that can accept multiple alternatives, e.g.
   *             a|b.
   *         <li>VE: A VE ID.
   *       </ul>
   * </ul>
   */
  public enum Kind {
    // Special types
    ANY,
    UNKNOWN,
    ERROR,
    // Primitive types
    NULL,
    BOOL,
    INT,
    FLOAT,
    STRING,
    // Sanitized types (subtypes of string)
    HTML,
    ATTRIBUTES,
    JS,
    CSS,
    URI,
    TRUSTED_RESOURCE_URI,
    // Aggregate types
    LIST,
    RECORD,
    LEGACY_OBJECT_MAP,
    MAP,
    PROTO,
    PROTO_ENUM,
    UNION,
    VE,
    VE_DATA,
    ;

    private static final ImmutableSet<Kind> STRING_KINDS =
        Sets.immutableEnumSet(
            Kind.STRING,
            Kind.HTML,
            Kind.ATTRIBUTES,
            Kind.JS,
            Kind.CSS,
            Kind.URI,
            Kind.TRUSTED_RESOURCE_URI);

    private static final ImmutableSet<Kind> ILLEGAL_OPERAND_KINDS_PLUS_OP =
        Sets.immutableEnumSet(Kind.BOOL, Kind.LIST, Kind.LEGACY_OBJECT_MAP, Kind.MAP, Kind.RECORD);

    /** Returns true for SoyTypes that are plain strings or sanitized subtypes of strings. */
    public boolean isKnownStringOrSanitizedContent() {
      return STRING_KINDS.contains(this);
    }

    /** Returns true for SoyTypes that are sanitized subtypes of strings. */
    public boolean isKnownSanitizedContent() {
      return this != Kind.STRING && STRING_KINDS.contains(this);
    }

    /**
     * Returns true for SoyTypes that are not allowed to be operands of binary arithmetic operators.
     */
    public boolean isIllegalOperandForBinaryOps() {
      return ILLEGAL_OPERAND_KINDS_PLUS_OP.contains(this) || STRING_KINDS.contains(this);
    }
  }

  // memoize the proto version.  SoyTypes are immutable so this is safe/correct and types are likely
  // to be serialized many times (think, 'string'), so we can save some work by not calculating it
  // repeatedly.
  @LazyInit private SoyTypeP protoDual;

  // restrict subtypes to this package
  SoyType() {}

  /** Returns what kind of type this is. */
  public abstract Kind getKind();

  /**
   * Returns true if a parameter or field of this type can be assigned from a value of {@code
   * srcType}.
   *
   * @param srcType The type of the incoming value.
   * @return True if the assignment is valid.
   */
  public final boolean isAssignableFrom(SoyType srcType) {
    // Handle unions generically.  A type is assignable from a union if it is assignable from _all_
    // memebers.
    if (srcType instanceof UnionType) {
      // By construction union types are guaranteed
      // 1. not to be empty
      // 2. not to contain union types
      UnionType asUnion = (UnionType) srcType;
      for (SoyType member : asUnion.getMembers()) {
        if (!doIsAssignableFromNonUnionType(member)) {
          return false;
        }
      }
      return true;
    } else {
      return doIsAssignableFromNonUnionType(srcType);
    }
  }

  /**
   * Subclass integration point to implement assignablility.
   *
   * @param type The target type, guaranteed to <b>not be a union type</b>.
   */
  @ForOverride
  abstract boolean doIsAssignableFromNonUnionType(SoyType type);

  /** The type represented in a fully parseable format. */
  @Override
  public abstract String toString();

  /** The type represented in proto format. For template metadata protos. */
  public final SoyTypeP toProto() {
    SoyTypeP local = protoDual;
    if (local == null) {
      SoyTypeP.Builder builder = SoyTypeP.newBuilder();
      doToProto(builder);
      local = builder.build();
      protoDual = local;
    }
    return local;
  }

  @ForOverride
  abstract void doToProto(SoyTypeP.Builder builder);
}
