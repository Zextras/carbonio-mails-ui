/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tag } from '@zextras/carbonio-shell-ui';
import { ComponentType } from 'react';
import { TFunction } from 'react-i18next';

export type ReturnType = {
	id: string;
	icon: string;
	label: string;
	click?: (arg: React.SyntheticEvent<EventTarget>) => void;
	items?: Array<{
		customComponent: ComponentType;
		id: string;
		icon: string;
		label: string;
	}>;
};

export type TagsFromStoreType = Record<string, Tag>;

export type ArgumentType = {
	t: TFunction;
	createModal?: (...args: any) => () => void;
	createSnackbar?: (...args: any) => void;
	items?: ReturnType;
	tag?: ItemType;
};

export type ItemType = {
	CustomComponent?: ComponentType<any>;
	active: boolean;
	color: number;
	divider: boolean;
	id: string;
	label: string;
	name: string;
	open: boolean;
	actions?: Array<unknown>;
};

export type TagsAccordionItems = {
	items: ItemType[];
	id: string;
	label: string;
	divider: true;
	active: false;
	open: boolean;
	onClick: (e: Event) => void;
	CustomComponent: ComponentType<any>;
};
