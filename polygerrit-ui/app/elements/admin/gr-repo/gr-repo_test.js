/**
 * @license
 * Copyright (C) 2017 The Android Open Source Project
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

import '../../../test/common-test-setup-karma.js';
import './gr-repo.js';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {addListenerForTest, stubRestApi} from '../../../test/test-utils.js';

const basicFixture = fixtureFromElement('gr-repo');

suite('gr-repo tests', () => {
  let element;
  let loggedInStub;
  let repoStub;
  const repoConf = {
    description: 'Access inherited by all other projects.',
    use_contributor_agreements: {
      value: false,
      configured_value: 'FALSE',
    },
    use_content_merge: {
      value: false,
      configured_value: 'FALSE',
    },
    use_signed_off_by: {
      value: false,
      configured_value: 'FALSE',
    },
    create_new_change_for_all_not_in_target: {
      value: false,
      configured_value: 'FALSE',
    },
    require_change_id: {
      value: false,
      configured_value: 'FALSE',
    },
    enable_signed_push: {
      value: false,
      configured_value: 'FALSE',
    },
    require_signed_push: {
      value: false,
      configured_value: 'FALSE',
    },
    reject_implicit_merges: {
      value: false,
      configured_value: 'FALSE',
    },
    private_by_default: {
      value: false,
      configured_value: 'FALSE',
    },
    match_author_to_committer_date: {
      value: false,
      configured_value: 'FALSE',
    },
    reject_empty_commit: {
      value: false,
      configured_value: 'FALSE',
    },
    enable_reviewer_by_email: {
      value: false,
      configured_value: 'FALSE',
    },
    max_object_size_limit: {},
    submit_type: 'MERGE_IF_NECESSARY',
    default_submit_type: {
      value: 'MERGE_IF_NECESSARY',
      configured_value: 'INHERIT',
      inherited_value: 'MERGE_IF_NECESSARY',
    },
  };

  const REPO = 'test-repo';
  const SCHEMES = {http: {}, repo: {}, ssh: {}};

  function getFormFields() {
    const selects = Array.from(
        element.root.querySelectorAll('select'));
    const textareas = Array.from(
        element.root.querySelectorAll('iron-autogrow-textarea'));
    const inputs = Array.from(
        element.root.querySelectorAll('input'));
    return inputs.concat(textareas).concat(selects);
  }

  setup(() => {
    loggedInStub = stubRestApi('getLoggedIn').returns(Promise.resolve(false));
    stubRestApi('getConfig').returns(Promise.resolve({download: {}}));
    repoStub =
        stubRestApi('getProjectConfig').returns(Promise.resolve(repoConf));
    element = basicFixture.instantiate();
  });

  test('_computePluginData', () => {
    assert.deepEqual(element._computePluginData(), []);
    assert.deepEqual(element._computePluginData({}), []);
    assert.deepEqual(element._computePluginData({base: {}}), []);
    assert.deepEqual(element._computePluginData({base: {plugin: 'data'}}),
        [{name: 'plugin', config: 'data'}]);
  });

  test('_handlePluginConfigChanged', () => {
    const notifyStub = sinon.stub(element, 'notifyPath');
    element._repoConfig = {plugin_config: {}};
    element._handlePluginConfigChanged({detail: {
      name: 'test',
      config: 'data',
      notifyPath: 'path',
    }});
    flush();

    assert.equal(element._repoConfig.plugin_config.test, 'data');
    assert.equal(notifyStub.lastCall.args[0],
        '_repoConfig.plugin_config.path');
  });

  test('loading displays before repo config is loaded', () => {
    assert.isTrue(element.$.loading.classList.contains('loading'));
    assert.isFalse(getComputedStyle(element.$.loading).display === 'none');
    assert.isTrue(element.$.loadedContent.classList.contains('loading'));
    assert.isTrue(getComputedStyle(element.$.loadedContent)
        .display === 'none');
  });

  test('download commands visibility', () => {
    element._loading = false;
    flush();
    assert.isTrue(element.$.downloadContent.classList.contains('hide'));
    assert.isTrue(getComputedStyle(element.$.downloadContent)
        .display == 'none');
    element._schemesObj = SCHEMES;
    flush();
    assert.isFalse(element.$.downloadContent.classList.contains('hide'));
    assert.isFalse(getComputedStyle(element.$.downloadContent)
        .display == 'none');
  });

  test('form defaults to read only', () => {
    assert.isTrue(element._readOnly);
  });

  test('form defaults to read only when not logged in', async () => {
    element.repo = REPO;
    await element._loadRepo();
    assert.isTrue(element._readOnly);
  });

  test('form defaults to read only when logged in and not admin', async () => {
    element.repo = REPO;
    stubRestApi('getRepoAccess')
        .callsFake(() => Promise.resolve({'test-repo': {}}));
    await element._loadRepo();
    assert.isTrue(element._readOnly);
  });

  test('all form elements are disabled when not admin', async () => {
    element.repo = REPO;
    await element._loadRepo();
    flush();
    const formFields = getFormFields();
    for (const field of formFields) {
      assert.isTrue(field.hasAttribute('disabled'));
    }
  });

  test('_formatBooleanSelect', () => {
    let item = {inherited_value: true};
    assert.deepEqual(element._formatBooleanSelect(item), [
      {
        label: 'Inherit (true)',
        value: 'INHERIT',
      },
      {
        label: 'True',
        value: 'TRUE',
      }, {
        label: 'False',
        value: 'FALSE',
      },
    ]);

    item = {inherited_value: false};
    assert.deepEqual(element._formatBooleanSelect(item), [
      {
        label: 'Inherit (false)',
        value: 'INHERIT',
      },
      {
        label: 'True',
        value: 'TRUE',
      }, {
        label: 'False',
        value: 'FALSE',
      },
    ]);

    // For items without inherited values
    item = {};
    assert.deepEqual(element._formatBooleanSelect(item), [
      {
        label: 'Inherit',
        value: 'INHERIT',
      },
      {
        label: 'True',
        value: 'TRUE',
      }, {
        label: 'False',
        value: 'FALSE',
      },
    ]);
  });

  test('fires page-error', done => {
    repoStub.restore();

    element.repo = 'test';

    const response = {status: 404};
    stubRestApi('getProjectConfig').callsFake((repo, errFn) => {
      errFn(response);
    });
    addListenerForTest(document, 'page-error', e => {
      assert.deepEqual(e.detail.response, response);
      done();
    });

    element._loadRepo();
  });

  suite('admin', () => {
    setup(() => {
      element.repo = REPO;
      loggedInStub.returns(Promise.resolve(true));
      stubRestApi('getRepoAccess')
          .returns(Promise.resolve({'test-repo': {is_owner: true}}));
    });

    test('all form elements are enabled', async () => {
      await element._loadRepo();
      await flush();
      const formFields = getFormFields();
      for (const field of formFields) {
        assert.isFalse(field.hasAttribute('disabled'));
      }
      assert.isFalse(element._loading);
    });

    test('state gets set correctly', async () => {
      await element._loadRepo();
      assert.equal(element._repoConfig.state, 'ACTIVE');
      assert.equal(element.$.stateSelect.bindValue, 'ACTIVE');
    });

    test('inherited submit type value is calculated correctly', async () => {
      await element._loadRepo();
      const sel = element.$.submitTypeSelect;
      assert.equal(sel.bindValue, 'INHERIT');
      assert.equal(
          sel.nativeSelect.options[0].text,
          'Inherit (Merge if necessary)'
      );
    });

    test('fields update and save correctly', async () => {
      const configInputObj = {
        description: 'new description',
        use_contributor_agreements: 'TRUE',
        use_content_merge: 'TRUE',
        use_signed_off_by: 'TRUE',
        create_new_change_for_all_not_in_target: 'TRUE',
        require_change_id: 'TRUE',
        enable_signed_push: 'TRUE',
        require_signed_push: 'TRUE',
        reject_implicit_merges: 'TRUE',
        private_by_default: 'TRUE',
        match_author_to_committer_date: 'TRUE',
        reject_empty_commit: 'TRUE',
        max_object_size_limit: 10,
        submit_type: 'FAST_FORWARD_ONLY',
        state: 'READ_ONLY',
        enable_reviewer_by_email: 'TRUE',
      };

      const saveStub = stubRestApi('saveRepoConfig')
          .callsFake(() => Promise.resolve({}));

      const button = element.root.querySelectorAll('gr-button')[2];

      await element._loadRepo();
      assert.isTrue(button.hasAttribute('disabled'));
      assert.isFalse(element.$.Title.classList.contains('edited'));
      element.$.descriptionInput.bindValue = configInputObj.description;
      element.$.stateSelect.bindValue = configInputObj.state;
      element.$.submitTypeSelect.bindValue = configInputObj.submit_type;
      element.$.contentMergeSelect.bindValue =
          configInputObj.use_content_merge;
      element.$.newChangeSelect.bindValue =
          configInputObj.create_new_change_for_all_not_in_target;
      element.$.requireChangeIdSelect.bindValue =
          configInputObj.require_change_id;
      element.$.enableSignedPush.bindValue =
          configInputObj.enable_signed_push;
      element.$.requireSignedPush.bindValue =
          configInputObj.require_signed_push;
      element.$.rejectImplicitMergesSelect.bindValue =
          configInputObj.reject_implicit_merges;
      element.$.setAllnewChangesPrivateByDefaultSelect.bindValue =
          configInputObj.private_by_default;
      element.$.matchAuthoredDateWithCommitterDateSelect.bindValue =
          configInputObj.match_author_to_committer_date;
      const inputElement = PolymerElement ?
        element.$.maxGitObjSizeIronInput : element.$.maxGitObjSizeInput;
      inputElement.bindValue = configInputObj.max_object_size_limit;
      element.$.contributorAgreementSelect.bindValue =
          configInputObj.use_contributor_agreements;
      element.$.useSignedOffBySelect.bindValue =
          configInputObj.use_signed_off_by;
      element.$.rejectEmptyCommitSelect.bindValue =
          configInputObj.reject_empty_commit;
      element.$.unRegisteredCcSelect.bindValue =
          configInputObj.enable_reviewer_by_email;

      assert.isFalse(button.hasAttribute('disabled'));
      assert.isTrue(element.$.configurations.classList.contains('edited'));

      const formattedObj =
          element._formatRepoConfigForSave(element._repoConfig);
      assert.deepEqual(formattedObj, configInputObj);

      await element._handleSaveRepoConfig();
      assert.isTrue(button.hasAttribute('disabled'));
      assert.isFalse(element.$.Title.classList.contains('edited'));
      assert.isTrue(saveStub.lastCall.calledWithExactly(REPO,
          configInputObj));
    });
  });
});

