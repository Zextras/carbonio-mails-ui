/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type StateType = {
	status: string;
	folders: FoldersStateType;
	editors: EditorsStateType;
	conversations: ConversationsStateType;
	sync: SyncStateType;
	messages: MsgStateType;
	searches: SearchesStateType;
};

export type FoldersSlice = {
	status: string;
	folders: FoldersStateType[];
};

export type SyncStateType = {
	status: string;
	intervalId: number;
	token?: string;
};

export type EditorsStateType = {
	status: string;
	editors: MailsEditorMap;
};

export type FoldersStateType = {
	status: string;
	folders: MailsFolderMap;
};

export type MsgStateType = {
	searchedInFolder: Record<string, string>;
	messages: MsgMap;
	status: Record<string, Status>;
};

export type ConversationsStateType = {
	currentFolder: string;
	searchedInFolder: Record<string, string>;
	conversations: Record<string, Conversation>;
	expandedStatus: Record<string, Status>;
	status: ConversationsFolderStatus;
};

export type SearchesMap = Record<string, Conversation>;

export type SearchesStateType = {
	conversations?: Array<Conversation>;
	messages?: Array<Partial<MailMessage>>;
	more: boolean;
	offset: number;
	sortBy: 'dateDesc' | 'dateAsc';
	query: string;
	status: string;
	parent?: string;
	tagName?: string;
};

export type MailsFolderMap = Record<string, FolderType>;

export type MailsEditorMap = Record<string, MailsEditor>;

export type MsgMap = Record<string, Partial<MailMessage>>;

export type ConversationsFolderStatus =
	| 'empty'
	| 'pending'
	| 'complete'
	| 'hasMore'
	| 'hasChange'
	| 'error';
export type Status = 'pending' | 'error' | 'complete';

export type Payload = {
	payload: { m: Array<SoapIncompleteMessage>; t: any };
};
