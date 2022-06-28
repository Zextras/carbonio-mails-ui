/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ButtonOldProps, ChipItem, ContainerProps } from '@zextras/carbonio-design-system';
import { AccordionFolder } from '@zextras/carbonio-shell-ui';
import { SyntheticEvent } from 'react';
import { TFunction } from 'react-i18next';

export type ModalFooterProps = {
	mainAlignment?: ContainerProps['mainAlignment'];
	crossAlignment?: ContainerProps['crossAlignment'];
	padding?: Record<string, string> | undefined;
	onConfirm: (e?: SyntheticEvent<Element, Event> | KeyboardEvent) => void;
	secondaryAction?: () => void | undefined;
	label: string;
	secondaryLabel?: string | undefined;
	disabled?: boolean | undefined;
	secondaryDisabled?: boolean | undefined;
	background?: ContainerProps['background'] | undefined;
	secondarybackground?: ContainerProps['background'] | undefined;
	color?: string | undefined;
	secondaryColor?: string | undefined;
	size?: ButtonOldProps['size'] | undefined;
	primaryBtnType?: ButtonOldProps['type'] | undefined;
	secondaryBtnType?: ButtonOldProps['type'] | undefined;
	showDivider?: boolean;
	tooltip?: string;
	secondaryTooltip?: string;
	paddingTop?: string;
};

export type SnackbarArgumentType = {
	key: string;
	replace: boolean;
	type: string;
	label: string;
	autoHideTimeout: number;
	hideButton?: boolean;
	actionLabel?: string;
	onActionClick?: TFunction;
};

export type ModalProps = {
	folder: AccordionFolder;
	onClose: () => void;
};

export type Crumb = {
	label: string;
	tooltip: string;
};

export type ResFolder = AccordionFolder &
	Partial<{
		folderId: number;
		folderPath: string;
		folderUuid: string;
		granteeId: string;
		granteeName: string;
		granteeType: string;
		mid: string;
		ownerEmail: string;
		ownerId: string;
		ownerName: string;
		rights: string;
		view: string;
	}>;

export type DataProps = {
	id: string;
	date: number;
	msgCount: number;
	unreadMsgCount: number;
	messages: [
		{
			id: string;
			parent: string;
			date: number;
		}
	];
	participants: [
		{
			type: string;
			address: string;
			name: string;
			fullName: string;
		},
		{
			type: string;
			address: string;
			name: string;
		}
	];
	subject: string;
	fragment: string;
	read: false;
	attachment: false;
	flagged: false;
	urgent: false;
	parentFolderId: string;
	selectedIDs: Array<string>;
};

export type SearchChipItem = ChipItem & {
	isGeneric?: boolean;
	isQueryFilter?: boolean;
	hasError?: boolean;
};
