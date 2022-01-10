/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { createContext, FC, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
	useReplaceHistoryCallback,
	useIntegratedComponent,
	useUserSettings
} from '@zextras/zapp-shell';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { SnackbarManagerContext, ModalManagerContext } from '@zextras/zapp-ui';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getActions as conversationActions } from '../ui-actions/conversation-actions';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getActions as messageActions } from '../ui-actions/message-actions';

type ACPProps = {
	folderId: string;
};

type ActionObj = {
	id: string;
	label: string;
	click: (event: MouseEvent) => void;
	icon: string;
};

type ActionList = Array<ActionObj>;

type GetActionsFunction = (item: any) => [ActionList, ActionList];

export const ActionsContext = createContext<{
	getConversationActions: GetActionsFunction;
	getMessageActions: GetActionsFunction;
}>({
	getConversationActions: (i: any) => [[], []],
	getMessageActions: (i: any) => [[], []]
});

export const ActionsContextProvider: FC<ACPProps> = ({ children, folderId }) => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const replaceHistory = useReplaceHistoryCallback();
	const createSnackbar = useContext(SnackbarManagerContext);
	const createModal = useContext(ModalManagerContext);
	const settings = useUserSettings();
	const timezone = useMemo(() => settings?.prefs.zimbraPrefTimeZoneId, [settings]);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');

	const [conversationActionsCallback, messageActionsCallback] = useMemo(
		() => [
			conversationActions(
				folderId,
				t,
				dispatch,
				replaceHistory,
				createSnackbar,
				createModal,
				ContactInput,
				timezone
			),
			messageActions(
				folderId,
				t,
				dispatch,
				replaceHistory,
				createSnackbar,
				createModal,
				ContactInput,
				timezone
			)
		],
		[ContactInput, createModal, createSnackbar, dispatch, folderId, replaceHistory, t, timezone]
	);
	const getMessageActions = useCallback<GetActionsFunction>(
		(item: any): [ActionList, ActionList] => messageActionsCallback(item),
		[messageActionsCallback]
	);
	const getConversationActions = useCallback<GetActionsFunction>(
		(item: any): [ActionList, ActionList] => conversationActionsCallback(item),
		[conversationActionsCallback]
	);
	return (
		<ActionsContext.Provider value={{ getConversationActions, getMessageActions }}>
			{children}
		</ActionsContext.Provider>
	);
};
