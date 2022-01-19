/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo } from 'react';
import {
	Container,
	Dropdown,
	IconButton,
	SnackbarManagerContext,
	ModalManagerContext
} from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { map, every, filter, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import {
	setMsgRead,
	setMsgFlag,
	moveMsgToTrash,
	moveMessageToFolder,
	deleteMessagePermanently
} from './message-actions';

export default function SelectMessagesPanelActions({
	messages,
	folderId,
	selectedIds,
	deselectAll,
	conversationId
}) {
	const [t] = useTranslation();
	const createSnackbar = useContext(SnackbarManagerContext);
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const ids = useMemo(() => Object.keys(selectedIds ?? []), [selectedIds]);

	const showAddFlag = useMemo(() => {
		const selectMessages = filter(messages, (convo) => ids.indexOf(convo.id) !== -1);
		return every(selectMessages, ['flagged', true]);
	}, [messages, ids]);

	const showReadConvo = useMemo(() => {
		const selectMessages = filter(messages, (convo) => ids.indexOf(convo.id) !== -1);
		return some(selectMessages, ['read', true]);
	}, [messages, ids]);

	const showUnreadConvo = useMemo(() => {
		const selectMessages = filter(messages, (convo) => ids.indexOf(convo.id) !== -1);
		return some(selectMessages, ['read', false]);
	}, [messages, ids]);

	const primaryActions = useMemo(() => {
		switch (folderId) {
			case FOLDERS.SPAM:
			case FOLDERS.INBOX:
				return [
					showReadConvo && setMsgRead(ids, true, t, dispatch, folderId, null, deselectAll),
					showUnreadConvo && setMsgRead(ids, false, t, dispatch, folderId, null, deselectAll),
					moveMsgToTrash(ids, t, dispatch, createSnackbar, deselectAll, folderId)
					// archiveMsg
					// editTagsMsg
				];
			case FOLDERS.SENT:
				return [
					moveMsgToTrash(ids, t, dispatch, createSnackbar, deselectAll, folderId)
					// archiveMsg
					// editTagsMsg
				];

			case FOLDERS.DRAFTS:
				return [
					moveMsgToTrash(ids, t, dispatch, createSnackbar, deselectAll, folderId)
					// archiveMsg
					// editTagsMsg
				];

			case FOLDERS.TRASH:
				return [
					deleteMessagePermanently(ids, t, dispatch, createModal, deselectAll)

					// archiveMsg
					// editTagsMsg
				];

			default:
				return [
					moveMsgToTrash(ids, t, dispatch, createSnackbar, deselectAll, folderId)
					// archiveMsg
					// editTagsMsg
				];
		}
	}, [
		folderId,
		showReadConvo,
		ids,
		t,
		dispatch,
		deselectAll,
		showUnreadConvo,
		createSnackbar,
		createModal
	]);

	const secondaryActions = useMemo(() => {
		switch (folderId) {
			case FOLDERS.SENT:
			case FOLDERS.SPAM:
			case FOLDERS.INBOX:
				return [
					showReadConvo && setMsgRead(ids, true, t, dispatch, folderId, null, deselectAll),
					showUnreadConvo && setMsgRead(ids, false, t, dispatch, folderId, null, deselectAll),
					setMsgFlag(ids, showAddFlag, t, dispatch),
					moveMessageToFolder(ids, t, dispatch, false, createModal, deselectAll)
					// move
					// markSpam
					// reply
					// replyAll
					// forward
					// redirect
					// editAsNew
					// print
					// createFilter
					// createAppointment
					// openInSeperateWindow
					// archiveConversation
					// editTagsConversation
				];
			case FOLDERS.TRASH:
				return [
					// setConversationsRead(selectedIDs, conversation.read, t, dispatch),
					// setConversationsFlag(selectedIDs, allRead, t, dispatch),
					setMsgFlag(ids, showAddFlag, t, dispatch),
					deleteMessagePermanently(ids, t, dispatch, createModal, deselectAll),
					moveMessageToFolder(ids, t, dispatch, true, createModal, deselectAll)
				];
			case FOLDERS.DRAFTS:
			default:
				return [
					setMsgFlag(ids, showAddFlag, t, dispatch),
					moveMessageToFolder(ids, t, dispatch, false, createModal, deselectAll)
					// move
					// archiveConversation
					// editTagsConversation
					// print
					// send
				];
		}
	}, [
		folderId,
		showReadConvo,
		ids,
		t,
		dispatch,
		deselectAll,
		showUnreadConvo,
		showAddFlag,
		createModal
	]);
	return (
		<Container
			background="gray5"
			height={49}
			orientation="horizontal"
			padding={{ all: 'extrasmall' }}
		>
			<Container background="gray5" orientation="horizontal" mainAlignment="flex-start">
				<IconButton
					icon="ArrowBack"
					color="primary"
					size="large"
					onClick={deselectAll}
					data-testid="action-button-deselect-all"
				/>
				{/* Uncomment this line to show the `Select all` Button */}
				{/* <Button type='ghost' label='Select all' color='primary' /> */}
			</Container>
			<Container background="gray5" orientation="horizontal" mainAlignment="flex-end">
				{map(filter(primaryActions), (action) => (
					<IconButton
						data-testid={`primary-action-button-${action.label}`}
						icon={action.icon}
						color="primary"
						onClick={(ev) => {
							if (ev) ev.preventDefault();
							action.click();
						}}
						size="medium"
					/>
				))}
			</Container>

			<Dropdown
				placement="right-end"
				data-testid="secondary-actions-dropdown"
				items={map(filter(secondaryActions), (action) => ({
					id: action.label,
					icon: action.icon,
					label: action.label,
					click: (ev) => {
						if (ev) ev.preventDefault();
						action.click();
					}
				}))}
			>
				<IconButton
					size="medium"
					iconColor="primary"
					icon="MoreVertical"
					data-testid="secondary-actions-open-button"
				/>
			</Dropdown>
		</Container>
	);
}
