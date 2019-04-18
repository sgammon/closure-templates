/*
 * Copyright 2011 Google Inc.
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

package com.google.template.soy.sharedpasses.opti;

import com.google.common.base.Supplier;
import com.google.common.collect.ImmutableMap;
import com.google.template.soy.msgs.SoyMsgBundle;
import com.google.template.soy.shared.SoyCssRenamingMap;
import com.google.template.soy.shared.SoyIdRenamingMap;
import com.google.template.soy.sharedpasses.render.Environment;
import com.google.template.soy.sharedpasses.render.EvalVisitor.EvalVisitorFactory;
import javax.annotation.Nullable;

/**
 * A factory for creating PreevalVisitor objects.
 *
 * <p>Important: Do not use outside of Soy code (treat as superpackage-private).
 *
 */
final class PreevalVisitorFactory implements EvalVisitorFactory {

  @Override
  public PreevalVisitor create(
      Environment env,
      @Nullable SoyCssRenamingMap cssRenamingMap,
      @Nullable SoyIdRenamingMap xidRenamingMap,
      @Nullable SoyMsgBundle msgBundle,
      boolean debugSoyTemplateInfo,
      ImmutableMap<String, Supplier<Object>> pluginInstances) {
    return new PreevalVisitor(env);
  }
}
