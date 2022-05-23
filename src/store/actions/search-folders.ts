/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const searchFolder = soapFetch('GetFolder', {
	_jsns: 'urn:zimbraMail',
	folder: {},
	tr: true
});
