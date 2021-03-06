/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useMemo } from 'react';
import { Text, Container, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import ModalFooter from './commons/modal-footer';
import { folderAction } from '../../store/actions/folder-action';
import { ModalHeader } from './commons/modal-header';
import { ModalProps } from '../../types';

export const EmptyModal: FC<ModalProps> = ({ folder, onClose }) => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	// eslint-disable-next-line @typescript-eslint/ban-types
	const createSnackbar = useContext(SnackbarManagerContext) as Function;

	const onConfirm = useCallback(() => {
		dispatch(folderAction({ folder: folder.folder, recursive: true, op: 'empty' }))
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `trash`,
						replace: true,
						type: 'info',
						label:
							folder.id === FOLDERS.TRASH
								? t('messages.snackbar.folder_empty', 'Trash successfully emptied')
								: t('messages.snackbar.folder_wiped', 'Folder successfully wiped'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				} else {
					createSnackbar({
						key: `trash`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again.'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		onClose();
	}, [dispatch, folder, onClose, createSnackbar, t]);

	const title = useMemo(
		() =>
			folder.id === FOLDERS.TRASH
				? `${t('label.empty', 'Empty')} ${folder.folder?.name}`
				: `${t('label.wipe', 'Wipe')} ${folder.folder?.name}`,
		[folder.id, folder.folder?.name, t]
	);
	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} />
			<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
				{folder.id === FOLDERS.TRASH ? (
					<Text overflow="break-word">
						{t(
							'folder_panel.modal.empty.body.message1',
							'Do you want to empty the selected folder?'
						)}
						<br />
						{t(
							'folder_panel.modal.empty.body.message2',
							'If you empty it, all the related content will be deleted permanently.'
						)}
					</Text>
				) : (
					<Text overflow="break-word">
						{
							(t('folder_panel.modal.wipe.body.message1'),
							'Do you want to wipe the selected folder?')
						}
						<br />
						{t(
							'folder_panel.modal.wipe.body.message2',
							'If you wipe it, all the related content will be deleted permanently.'
						)}
					</Text>
				)}
			</Container>

			<ModalFooter
				onConfirm={onConfirm}
				label={folder.id === FOLDERS.TRASH ? t('label.empty', 'Empty') : t('label.wipe', 'Wipe')}
				color="error"
			/>
		</Container>
	);
};
