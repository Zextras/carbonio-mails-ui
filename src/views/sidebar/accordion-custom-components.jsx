/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { AppLink, FOLDERS } from '@zextras/zapp-shell';
import styled from 'styled-components';
import {
	AccordionItem,
	Dropdown,
	Row,
	Icon,
	Padding,
	Drag,
	Drop,
	Container
} from '@zextras/zapp-ui';
import { actionsRetriever } from './commons/folder-actions';
import { FolderActionsType } from '../../types/folder';
import { CORRESPONDING_COLORS } from '../../constants';
import { convAction, msgAction } from '../../store/actions';
import { folderAction } from '../../store/actions/folder-action';

const DropOverlayContainer = styled(Container)`
	position: absolute;
	width: calc(248px - ${(props) => (props.folder.level - 2) * 16}px);
	height: 100%;
	background: ${(props) => props.theme.palette.primary.regular};
	border-radius: 4px;
	border: 4px solid #d5e3f6;
	opacity: 0.4;
`;

const DropDenyOverlayContainer = styled(Container)`
	position: absolute;
	width: calc(248px - ${(props) => (props.folder.level - 2) * 16}px);
	height: 100%;
	background: ${(props) => props.theme.palette.gray1.regular};
	border-radius: 4px;
	border: 4px solid #d5e3f6;
	opacity: 0.4;
`;

export const SetDropdownActions = (
	folder,
	setAction,
	setCurrentFolder,
	t,
	dispatch,
	createModal
) => {
	const modalFolder = folder;

	const actions = useMemo(
		() => actionsRetriever(modalFolder, setAction, setCurrentFolder, t, dispatch, createModal),
		[modalFolder, setAction, setCurrentFolder, t, dispatch, createModal]
	);

	switch (modalFolder?.id) {
		// default folders
		case FOLDERS.INBOX:
		case FOLDERS.SENT:
		case FOLDERS.DRAFTS:
			return actions
				.filter(
					(action) =>
						action.id !== FolderActionsType.SHARES_INFO &&
						action.id !== FolderActionsType.REMOVE_FROM_LIST
				)
				.map((action) =>
					action.id === FolderActionsType.MOVE || action.id === FolderActionsType.DELETE
						? { ...action, disabled: true }
						: action
				);

		case FOLDERS.SPAM:
			return actions
				.filter(
					(action) =>
						action.id !== FolderActionsType.SHARES_INFO &&
						action.id !== FolderActionsType.REMOVE_FROM_LIST
				)
				.map((action) =>
					action.id === FolderActionsType.NEW ||
					action.id === FolderActionsType.MOVE ||
					action.id === FolderActionsType.DELETE ||
					action.id === FolderActionsType.EMPTY
						? { ...action, disabled: true }
						: action
				);
		case FOLDERS.TRASH:
			return actions
				.filter(
					(action) =>
						action.id !== FolderActionsType.SHARES_INFO &&
						action.id !== FolderActionsType.REMOVE_FROM_LIST
				)
				.map((action) => action);
		// customizable folders
		default:
			return modalFolder?.owner
				? actions.filter(
						(action) =>
							action.id === FolderActionsType.SHARES_INFO ||
							action.id === FolderActionsType.REMOVE_FROM_LIST ||
							action.id === FolderActionsType.EDIT
				  )
				: actions
						.filter(
							(action) =>
								action.id !== FolderActionsType.SHARES_INFO &&
								action.id !== FolderActionsType.REMOVE_FROM_LIST
						)
						.map((action) => {
							if (
								(modalFolder.level > 2 && action.id === FolderActionsType.NEW) ||
								(modalFolder.depth > 2 &&
									modalFolder.parent === FOLDERS.USER_ROOT &&
									action.id === FolderActionsType.MOVE) ||
								(modalFolder.absParent === FOLDERS.TRASH &&
									(action.id === FolderActionsType.NEW || action.id === FolderActionsType.EDIT)) ||
								(modalFolder.parent === FOLDERS.TRASH &&
									(action.id === FolderActionsType.NEW || action.id === FolderActionsType.EDIT)) ||
								(modalFolder.absParent === FOLDERS.TRASH && action.id === FolderActionsType.EMPTY)
							) {
								return { ...action, disabled: true };
							}
							return action;
						});
	}
};

export const getFolderIconColor = (f) =>
	f.color < 10 ? CORRESPONDING_COLORS[f.color].uiRgb : f?.rgb ?? CORRESPONDING_COLORS[0].uiRgb;

const folderIconName = {
	2: 'InboxOutline',
	3: 'Trash2Outline',
	4: 'SlashOutline',
	5: 'PaperPlaneOutline',
	6: 'FileOutline'
};
export const getFolderIconName = (f) =>
	// eslint-disable-next-line no-unused-expressions
	// eslint-disable-next-line no-nested-ternary
	Object.keys(folderIconName).includes(f.id)
		? folderIconName[Number(f.id)]
		: f.id === 'share' || f.isSharedFolder
		? 'Share'
		: 'Folder';

const setAccordionCustomComponent = ({
	accordions,
	setAction,
	setCurrentFolder,
	t,
	dispatch,
	createModal,
	nestedFolders = accordions,
	replaceHistory,
	createSnackbar,
	activeFolder
}) => {
	const CustomAccordion = (folder) => {
		const folderIconColor = getFolderIconColor(folder);
		const folderIconLabel = getFolderIconName(folder);
		const onDragEnterAction = (data) => {
			if (data.type === 'conversation' || data.type === 'message') {
				if (
					data.data.parentFolderId === folder.id || // same folder not allowed
					(data.data.parentFolderId === FOLDERS.INBOX && [5, 6].includes(Number(folder.id))) || // from inbox not allowed in draft and sent
					(data.data.parentFolderId === FOLDERS.DRAFTS && ![3].includes(Number(folder.id))) || // from draft only allowed in Trash
					(folder.id === FOLDERS.DRAFTS && data.data.parentFolderId !== FOLDERS.TRASH) || // only from Trash can move in Draft
					(folder.isSharedFolder && folder.perm.indexOf('w') === -1) // only if shared folder have write permission
				) {
					return { succss: false };
				}
			}
			if (data.type === 'folder') {
				if (
					folder.id === data.data.id || // same folder not allowed
					folder.level + data.data.depth > 3 || // rules for maximum 3 folder depth
					folder.isSharedFolder || //  shared folder not allowed
					[4, 6].includes(Number(folder.id)) // cannot be moved inside Draft and Spam
				)
					return { succss: false };
			}
			return undefined;
		};

		const onDropAction = (data) => {
			const dragEnterResponse = onDragEnterAction(data);
			if (dragEnterResponse && dragEnterResponse?.succss === false) return;
			let convMsgsIds = [data.data.id];
			if (
				data.type !== 'folder' &&
				data.data?.selectedIDs?.length &&
				data.data?.selectedIDs.includes(data.data.id)
			) {
				convMsgsIds = data.data?.selectedIDs;
			}

			if (data.type === 'folder') {
				dispatch(
					folderAction({ folder: data.data, l: folder.id || FOLDERS.USER_ROOT, op: 'move' })
				).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `move`,
							replace: true,
							type: 'success',
							label: t('messages.snackbar.folder_moved', 'Folder successfully moved'),
							autoHideTimeout: 3000
						});
					} else {
						createSnackbar({
							key: `move`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again.'),
							autoHideTimeout: 3000
						});
					}
				});
			} else if (data.type === 'conversation') {
				dispatch(
					convAction({
						operation: `move`,
						ids: convMsgsIds,
						parent: folder.id
					})
				).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'info',
							label: t('messages.snackbar.conversation_move', 'Conversation successfully moved'),
							autoHideTimeout: 3000,
							actionLabel: t('action.goto_folder', 'GO TO FOLDER'),
							onActionClick: () => {
								replaceHistory(`/folder/${folder.id}`);
							}
						});
					} else {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				});
			} else {
				dispatch(
					msgAction({
						operation: `move`,
						ids: convMsgsIds,
						parent: folder.id
					})
				).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'info',
							label: t('messages.snackbar.message_move', 'Message successfully moved'),
							autoHideTimeout: 3000,
							actionLabel: t('action.goto_folder', 'GO TO FOLDER'),
							onActionClick: () => {
								replaceHistory(`/folder/${folder.id}`);
							}
						});
					} else {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				});
			}
		};

		const Component = (props) => {
			const dragFolderDisable = useMemo(
				() => [2, 3, 4, 5, 6].includes(Number(folder.id)) || folder.isSharedFolder, // Default folders and shared folders not allowed to drag
				[]
			);
			return (
				<Drop
					acceptType={['message', 'conversation', 'folder']}
					onDrop={(data) => onDropAction(data)}
					onDragEnter={(data) => onDragEnterAction(data)}
					overlayAcceptComponent={<DropOverlayContainer folder={folder} />}
					overlayDenyComponent={<DropDenyOverlayContainer folder={folder} />}
				>
					<Drag
						type="folder"
						data={folder}
						dragDisabled={dragFolderDisable}
						style={{ display: 'block' }}
					>
						<AppLink
							onClick={(e) => e.stopPropagation()}
							to={`/folder/${folder.id}`}
							style={{ width: '100%', height: '100%', textDecoration: 'none' }}
						>
							<Dropdown
								contextMenu
								items={SetDropdownActions(
									folder,
									setAction,
									setCurrentFolder,
									t,
									dispatch,
									createModal
								)}
								display="block"
								width="100%"
							>
								<Row mainAlignment="flex-start" padding={{ left: 'large' }} takeAvailableSpace>
									<Icon size="large" icon={folderIconLabel} customColor={folderIconColor} />
									<Padding right="large" />
									<AccordionItem {...props} />
								</Row>
							</Dropdown>
						</AppLink>
					</Drag>
				</Drop>
			);
		};
		return Component;
	};

	return accordions.map((accordion) => ({
		...accordion,
		active: activeFolder === accordion.id,
		CustomComponent: CustomAccordion(
			accordion,
			setAction,
			setCurrentFolder,
			t,
			dispatch,
			createModal
		),
		items: accordion.items.length
			? setAccordionCustomComponent({
					accordions: accordion.items,
					setAction,
					setCurrentFolder,
					t,
					dispatch,
					createModal,
					nestedFolders,
					replaceHistory,
					createSnackbar,
					activeFolder
			  })
			: []
	}));
};

export default setAccordionCustomComponent;
