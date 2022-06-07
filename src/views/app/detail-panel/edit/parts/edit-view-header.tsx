/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';

import { useTranslation } from 'react-i18next';
import {
	Button,
	Dropdown,
	Padding,
	Row,
	Tooltip,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { concat, some } from 'lodash';
import { useDispatch } from 'react-redux';
import { replaceHistory, useBoardConfig, useRemoveCurrentBoard } from '@zextras/carbonio-shell-ui';
import { EditViewContext } from './edit-view-context';
import { useGetIdentities } from '../edit-utils-hooks/use-get-identities';
import { useGetAttachItems } from '../edit-utils-hooks/use-get-attachment-items';
import * as StyledComp from './edit-view-styled-components';
import { addAttachments } from '../edit-utils';
import { ActionsType } from '../../../../../types/participant';
import { CreateSnackbar } from './edit-view-types';
import { sendMsg } from '../../../../../store/actions/send-msg';
import { mailAttachment } from '../../../../../types/soap/save-draft';

type PropType = {
	setValue: (arg: unknown) => void;
	handleSubmit: (arg: () => void) => void;
	uploadAttachmentsCb: () => void;
};
const EditViewHeader: FC<PropType> = ({ setValue, handleSubmit, uploadAttachmentsCb }) => {
	const [t] = useTranslation();
	const { control, editor, updateEditorCb, editorId, saveDraftCb, folderId, action } =
		useContext(EditViewContext);
	const [open, setOpen] = useState(false);
	const [openDD, setOpenDD] = useState(false);
	const [btnLabel, setBtnLabel] = useState(t('label.send', 'Send'));
	const [isDisabled, setIsDisabled] = useState(false);
	const createSnackbar: CreateSnackbar = useContext(SnackbarManagerContext);
	const dispatch = useDispatch();

	// needs to be replace with correct type
	const boardContext: { onConfirm: (arg: any) => void } = useBoardConfig();

	const closeBoard = useRemoveCurrentBoard();

	const isSendDisabled = useMemo(() => {
		const participants = concat(editor?.to, editor?.bcc, editor?.cc);
		return isDisabled || participants.length === 0 || some(participants, { error: true });
	}, [isDisabled, editor]);

	const { from, activeFrom, identitiesList, hasIdentity } = useGetIdentities({
		updateEditorCb,
		setOpen
	});

	const inputRef = useRef<any>();
	const onFileClick = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.value = null;
			inputRef.current.click();
		}
	}, []);

	const attachmentsItems = useGetAttachItems({
		onFileClick,
		setOpenDD,
		editorId,
		updateEditorCb,
		saveDraftCb,
		setValue
	});

	const onClick = (): void => {
		setOpenDD(!openDD);
	};

	const toggleOpen = useCallback(() => setOpen((show) => !show), []);

	const sendMailCb = useCallback(() => {
		setBtnLabel(t('label.sending', 'Sending'));
		setIsDisabled(true);
		if (action === ActionsType.COMPOSE && boardContext?.onConfirm) {
			boardContext?.onConfirm(editor);
		} else {
			let notCanceled = true;
			const infoSnackbar = (remainingTime: number, hideButton = false): void => {
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'info',
					label: t('messages.snackbar.sending_mail_in_count', {
						count: remainingTime,
						defaultValue: 'Sending your message in {{count}} second',
						defaultValue_plural: 'Sending your message in {{count}} seconds'
					}),
					autoHideTimeout: remainingTime * 1000,
					hideButton,
					actionLabel: 'Undo',
					onActionClick: () => {
						notCanceled = false;
					}
				});
			};

			infoSnackbar(3);
			setTimeout(() => notCanceled && infoSnackbar(2), 1000);
			setTimeout(() => notCanceled && infoSnackbar(1), 2000);
			setTimeout(() => {
				if (notCanceled) {
					folderId ? replaceHistory(`/folder/${folderId}/`) : closeBoard();
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					dispatch(sendMsg({ editorId })).then((res) => {
						if (res.type.includes('fulfilled')) {
							createSnackbar({
								key: `mail-${editorId}`,
								replace: true,
								type: 'success',
								label: t('messages.snackbar.mail_sent', 'Message sent'),
								autoHideTimeout: 3000,
								hideButton: true
							});
						} else {
							createSnackbar({
								key: `mail-${editorId}`,
								replace: true,
								type: 'error',
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								autoHideTimeout: 3000,
								hideButton: true
							});
							setIsDisabled(false);
						}
					});
				}
			}, 3000);
		}
	}, [t, action, boardContext, editor, createSnackbar, folderId, closeBoard, dispatch, editorId]);

	const onSave = useCallback(() => {
		saveDraftCb(editor);
		createSnackbar({
			key: 'send',
			replace: true,
			type: 'info',
			label: t('messages.snackbar.mail_saved_to_drafts', 'Mail saved to drafts'),
			autoHideTimeout: 3000,
			actionLabel: t('action.goto_drafts', 'Go to drafts'),
			hideButton: true,
			onActionClick: () => {
				// todo: redirect to folder/6 i.e. Drafts
				replaceHistory(`/folder/6/`);
				closeBoard();
			}
		});
	}, [closeBoard, createSnackbar, editor, saveDraftCb, t]);
	return (
		<>
			<Row
				padding={{ all: 'small' }}
				orientation="horizontal"
				mainAlignment={hasIdentity ? 'space-between' : 'flex-end'}
				width="100%"
			>
				{hasIdentity && (
					<Row>
						<Tooltip label={activeFrom.label} maxWidth="100%" placement="top-start">
							<Dropdown
								items={identitiesList}
								width="fit"
								maxWidth="100%"
								forceOpen={open}
								onClose={toggleOpen}
								selectedBackgroundColor="highlight"
							>
								<Button
									label={t('label.from_identity', {
										identity: from?.fullName || from?.address,
										defaultValue: 'From: {{identity}}'
									})}
									icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
									onClick={toggleOpen}
									type="outlined"
									style={{ maxWidth: '280px' }}
								/>
							</Dropdown>
						</Tooltip>
					</Row>
				)}
				<Row>
					<Controller
						name="richText"
						control={control}
						defaultValue={editor?.richText ?? false}
						render={({ onChange, value }): ReactElement => (
							<Tooltip
								label={
									value
										? t('tooltip.disable_rich_text', 'Disable rich text editor')
										: t('tooltip.enable_rich_text', 'Enable rich text editor')
								}
							>
								<StyledComp.ResizedIconCheckbox
									icon="Text"
									value={value}
									onClick={(): void => {
										updateEditorCb({
											richText: !value
										});
										onChange(!value);
									}}
									onChange={(): null => null}
								/>
							</Tooltip>
						)}
					/>
					<Controller
						name="urgent"
						control={control}
						defaultValue={editor?.urgent ?? false}
						render={({ onChange, value }): ReactElement => (
							<Tooltip
								label={
									value
										? t('tooltip.disable_urgent', 'Disable urgent')
										: t('tooltip.enable_urgent', 'Enable urgent')
								}
							>
								<StyledComp.ResizedIconCheckbox
									icon="ArrowUpward"
									value={value}
									onClick={(): void => {
										updateEditorCb({
											urgent: !value
										});
										onChange(!value);
									}}
									onChange={(): null => null}
								/>
							</Tooltip>
						)}
					/>
					<Controller
						name="attach"
						control={control}
						defaultValue={editor.attach || {}}
						render={({ onChange, value }): ReactElement => (
							<StyledComp.FileInput
								type="file"
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								ref={inputRef}
								onChange={(): void =>
									addAttachments(
										saveDraftCb,
										uploadAttachmentsCb,
										editor,
										inputRef?.current?.files
									).then((data: mailAttachment) => {
										updateEditorCb({
											attach: { ...value, mp: data }
										});
										onChange({ ...value, mp: data });
									})
								}
								multiple
							/>
						)}
					/>
					{action !== ActionsType.COMPOSE && (
						<Tooltip label={t('tooltip.add_attachments', 'Add attachments')}>
							<Dropdown
								items={attachmentsItems}
								display="inline-block"
								width="fit"
								forceOpen={openDD}
							>
								<StyledComp.ResizedIconCheckbox
									onChange={(): null => null}
									icon="AttachOutline"
									onClick={onClick}
								/>
							</Dropdown>
						</Tooltip>
					)}
					{action !== ActionsType.COMPOSE && (
						<Padding left="large">
							<Button
								type="outlined"
								onClick={handleSubmit(onSave)}
								label={`${t('label.save', 'Save')}`}
							/>
						</Padding>
					)}
					<Padding left="large">
						<Button onClick={sendMailCb} label={btnLabel} disabled={isSendDisabled} />
					</Padding>
				</Row>
			</Row>
		</>
	);
};

export default EditViewHeader;