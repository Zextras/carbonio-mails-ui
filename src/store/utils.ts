/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { max, map, filter, find, reduce, some, merge, isNil, omitBy } from 'lodash';
import { Folder } from '../types/folder';
import { MailsFolderMap, FoldersStateType } from '../types/state';

export function findDepth(subFolder: Folder, depth = 1): number {
	if (subFolder && subFolder.items && subFolder.items.length) {
		return <number>max(map(subFolder.items, (item) => findDepth(item, depth + 1)));
	}
	return depth;
}

export function calcFolderItems(
	folders: MailsFolderMap,
	subFolders: Folder | undefined,
	id: string
): Folder[] {
	return map(
		filter(folders, (item) => item.parent === id),
		(item) => ({
			...item,
			items: calcFolderItems(folders, subFolders, item.id),
			to: `/folder/${item.id}`
		})
	);
}

export function calcFolderAbsParentLevelAndPath(
	folders: MailsFolderMap,
	subFolder: Folder | undefined,
	path = subFolder && subFolder.name,
	level = 1
): { absParent: string; level: number; path: string | undefined } | undefined {
	if (!subFolder) return undefined;
	const nextFolder = find(folders, (item) => item.id === subFolder.parent);
	const nextPath = `${nextFolder ? nextFolder.name : ''}/${path}`;
	return (
		calcFolderAbsParentLevelAndPath(folders, nextFolder, nextPath, level + 1) || {
			absParent: level > 1 ? subFolder.id : subFolder.parent,
			level,
			path
		}
	);
}

export function updateFolders(state: FoldersStateType, folders: Folder[]): void {
	state.folders = reduce(
		state.folders,
		(acc, item) => {
			const newFolder = omitBy(
				find(folders, (c) => c.id === item.id),
				isNil
			);
			const toRet = newFolder ? { ...item, ...newFolder } : item;

			const items = calcFolderItems(state.folders, toRet, toRet.id);
			const moreParams = calcFolderAbsParentLevelAndPath(state.folders, toRet);
			return {
				...acc,
				[toRet.id]: {
					...toRet,
					...moreParams,
					depth: findDepth({ ...toRet, items }),
					items,
					path: moreParams ? `/${moreParams.path}` : undefined
				}
			};
		},
		{}
	);
}

export function updateFolderInStore(state: FoldersStateType, folders: Folder[]): void {
	state.folders = reduce(
		state.folders,
		(acc, item) => {
			const toRet = find(folders, (c) => c.id === item.id) || item;

			const items = calcFolderItems(state.folders, toRet, toRet.id);
			const moreParams = calcFolderAbsParentLevelAndPath(state.folders, toRet);
			return {
				...acc,
				[toRet.id]: {
					...toRet,
					...moreParams,
					depth: findDepth({ ...toRet, items }),
					items,
					path: moreParams ? `/${moreParams.path}` : undefined
				}
			};
		},
		{}
	);
}

export function updatePartialFolderInStore(state: FoldersStateType, folders: Folder[]): void {
	state.folders = reduce(
		state.folders,
		(acc, item) => {
			const itemToUpdate = find(folders, (c) => c.id === item.id);
			const toRet = merge(item, itemToUpdate ?? {});

			const items = calcFolderItems(state.folders, toRet, toRet.id);
			const moreParams = calcFolderAbsParentLevelAndPath(state.folders, toRet);
			return {
				...acc,
				[toRet.id]: {
					...toRet,
					...moreParams,
					depth: findDepth({ ...toRet, items }),
					items,
					path: moreParams ? `/${moreParams.path}` : undefined
				}
			};
		},
		{}
	);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function addFoldersToStore(state: FoldersStateType, folders: any): void {
	state.folders = reduce(folders, (acc, v, k) => ({ ...acc, [v.id]: v }), state.folders);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function removeFoldersFromStore(state: FoldersStateType, idsToDelete: any): void {
	// state.folders = omit(state.folders, idsToDelete); Maybe?
	state.folders = reduce(
		state.folders,
		(acc, v, k) => {
			const value = some(idsToDelete, (cid) => cid === v.id);
			return value ? { ...acc } : { ...acc, [v.id]: v };
		},
		{} as MailsFolderMap
	);
}
