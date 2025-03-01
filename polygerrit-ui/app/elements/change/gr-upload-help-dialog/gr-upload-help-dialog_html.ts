/**
 * @license
 * Copyright (C) 2020 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {html} from '@polymer/polymer/lib/utils/html-tag';

export const htmlTemplate = html`
  <style include="shared-styles">
    :host {
      background-color: var(--dialog-background-color);
      display: block;
    }
    .main {
      width: 100%;
    }
    ol {
      margin-left: var(--spacing-xl);
      list-style: decimal;
    }
    p {
      margin-bottom: var(--spacing-m);
    }
    .warning {
      color: var(--warning-foreground);
    }
  </style>
  <gr-dialog confirm-label="Done" cancel-label="" on-confirm="_handleCloseTap">
    <div class="header" slot="header">
      How to update this change:
    </div>
    <div class="main" slot="main">
      <iron-icon
        icon="gr-icons:warning"
        class="warningBeforeSubmit"
      ></iron-icon>
      <span class="warning"
        >The Update Change button will be removed from Gerrit in 2 weeks. You
        can find the checkout command in the Download Dialog(keyboard shortcut:
        d). We recommend making an alias for the other commands.
      </span>
      <ol>
        <li>
          <p>
            Checkout this change locally and make your desired modifications to
            the files.
          </p>
          <template is="dom-if" if="[[_fetchCommand]]">
            <gr-shell-command
              class="fetch-command"
              command="[[_fetchCommand]]"
            ></gr-shell-command>
          </template>
        </li>
        <li>
          <p>
            Update the local commit with your modifications using the following
            command.
          </p>
          <gr-shell-command
            class="commit-command"
            command="[[_commitCommand]]"
          ></gr-shell-command>
          <p>
            Leave the "Change-Id:" line of the commit message as is.
          </p>
        </li>
        <li>
          <p>Push the updated commit to Gerrit.</p>
          <gr-shell-command
            class="push-command"
            command="[[_pushCommand]]"
          ></gr-shell-command>
        </li>
        <li>
          <p>Refresh this page to view the the update.</p>
        </li>
      </ol>
    </div>
  </gr-dialog>
`;
