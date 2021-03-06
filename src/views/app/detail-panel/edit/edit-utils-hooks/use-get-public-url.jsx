/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';
import { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditors } from '../../../../../store/editor-slice';

export const useGetPublicUrl = ({ editorId, updateEditorCb, saveDraftCb, setValue }) => {
	const [getLink, getLinkAvailable] = useIntegratedFunction('get-link');
	const createSnackbar = useContext(SnackbarManagerContext);
	const editors = useSelector(selectEditors);
	const editor = useMemo(() => editors[editorId], [editors, editorId]);
	const [t] = useTranslation();

	const getPublicUrl = useCallback(
		(nodes) => {
			const promises = map(nodes, (node) =>
				getLink({ node, type: 'createLink', description: node.id })
			);

			Promise.allSettled(promises).then((res) => {
				const success = filter(res, ['status', 'fulfilled']);
				const allSuccess = res.length === success?.length;
				const allFails = res.length === filter(res, ['status', 'rejected'])?.length;
				const type = allSuccess ? 'info' : 'warning';
				// eslint-disable-next-line no-nested-ternary
				const label = allSuccess
					? t('message.snackbar.all_link_copied', 'Public link copied successfully')
					: allFails
					? t(
							'message.snackbar.link_copying_error',
							'There seems to be a problem while generating public link, please try again'
					  )
					: t(
							'message.snackbar.some_link_copying_error',
							'There seems to be a problem while generating public url for some files, please try again'
					  );
				createSnackbar({
					key: `public-link`,
					replace: true,
					type,
					hideButton: true,
					label,
					autoHideTimeout: 4000
				});

				const newEditor = {
					...editor,
					text: [
						map(success, (i) => i.value.url)
							.join('\n')
							.concat(editor.text[0]),
						` ${map(success, (i) => `<p><a href="${i.value.url}"> ${i.value.url}</a></p>`).join(
							''
						)}`.concat(editor.text[1])
					]
				};

				updateEditorCb(newEditor);
				saveDraftCb(newEditor);
				setValue('text', newEditor.text);
			});
		},
		[createSnackbar, editor, getLink, saveDraftCb, setValue, t, updateEditorCb]
	);

	return [getPublicUrl, getLinkAvailable];
};
