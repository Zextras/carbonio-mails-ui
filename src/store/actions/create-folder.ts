/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const createFolder = ({
	parentFolder,
	name
}: {
	name: string;
	parentFolder?: { id: string };
}): Promise<{ folder: any }> =>
	soapFetch<any, { folder: any }>('CreateFolder', {
		_jsns: 'urn:zimbraMail',
		folder: {
			view: 'message',
			l: parentFolder?.id ?? '2',
			name
		}
	});
