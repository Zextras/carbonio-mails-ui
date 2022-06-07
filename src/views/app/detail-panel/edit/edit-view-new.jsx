/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Catcher, Container } from '@zextras/carbonio-design-system';
import { useDispatch, useSelector } from 'react-redux';
import { throttle, filter, isNil } from 'lodash';
import {
	useUserSettings,
	useBoardConfig,
	useUserAccounts,
	replaceHistory,
	useAddBoardCallback,
	useUpdateCurrentBoard
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import moment from 'moment';
import { useQueryParam } from '../../../../hooks/useQueryParam';
import {
	closeEditor,
	createEditor,
	selectEditors,
	updateEditor
} from '../../../../store/editor-slice';
import { ActionsType } from '../../../../types/participant';
import { selectMessages } from '../../../../store/messages-slice';
import EditAttachmentsBlock from './edit-attachments-block';
import { saveDraft } from '../../../../store/actions/save-draft';
import { uploadAttachments } from '../../../../store/actions/upload-attachments';
import { getMsg } from '../../../../store/actions';
import DropZoneAttachment from './dropzone-attachment';
import { MAILS_ROUTE, MAIL_APP_ID } from '../../../../constants';

import { addAttachments } from './edit-utils';

import * as StyledComp from './parts/edit-view-styled-components';
import { EditViewContext } from './parts/edit-view-context';
import ParticipantsRow from './parts/participants-row';
import TextEditorContainer from './parts/text-editor-container';
import EditViewHeader from './parts/edit-view-header';
import WarningBanner from './parts/warning-banner';
import SubjectRow from './parts/subject-row';

let counter = 0;

const generateId = () => {
	counter += 1;
	return `new-${counter}`;
};

export default function EditView({ mailId, folderId, setHeader, toggleAppBoard }) {
	const settings = useUserSettings();
	const boardContext = useBoardConfig();
	const [editor, setEditor] = useState();

	const action = useQueryParam('action');
	const change = useQueryParam('change');

	const editors = useSelector(selectEditors);
	const dispatch = useDispatch();
	const [t] = useTranslation();

	const accounts = useUserAccounts();
	const messages = useSelector(selectMessages);

	const { handleSubmit, control, setValue } = useForm();

	const addBoard = useAddBoardCallback();
	const [dropZoneEnable, setDropZoneEnable] = useState(false);
	const saveDraftCb = useCallback((data) => dispatch(saveDraft({ data })), [dispatch]);

	const [saveFirstDraft, setSaveFirstDraft] = useState(true);
	const [draftSavedAt, setDraftSavedAt] = useState('');
	const [timer, setTimer] = useState(null);

	const [loading, setLoading] = useState(false);
	const [initialAction, setInitialAction] = useState(action);
	const [actionChanged, setActionChanged] = useState(true);
	const [isUploading, setIsUploading] = useState(false);

	const activeMailId = useMemo(
		() => boardContext?.mailId || mailId,
		[mailId, boardContext?.mailId]
	);

	const editorId = useMemo(() => activeMailId ?? generateId(), [activeMailId]);

	useEffect(() => {
		if (actionChanged && editors[editorId]) {
			dispatch(closeEditor(editorId));
		}
	}, [actionChanged, dispatch, editorId, editors]);

	const updateEditorCb = useCallback(
		(data) => {
			dispatch(updateEditor({ editorId, data }));
		},
		[dispatch, editorId]
	);

	useEffect(() => {
		if (activeMailId && !messages?.[activeMailId]?.isComplete) {
			dispatch(getMsg({ msgId: activeMailId }));
		}
	}, [activeMailId, dispatch, messages, updateEditorCb]);

	const throttledSaveToDraft = useCallback(
		(data) => {
			clearTimeout(timer);
			const newTimer = setTimeout(() => {
				const newData = { ...editor, ...data };
				if (saveFirstDraft) {
					saveDraftCb(newData);
					setDraftSavedAt(moment().format('HH:mm'));
					setSaveFirstDraft(false);
				} else if (!isNil(editor.id)) {
					saveDraftCb(newData);
					setDraftSavedAt(moment().format('HH:mm'));
				}
			}, 500);

			setTimer(newTimer);
		},
		[editor, saveDraftCb, saveFirstDraft, timer]
	);

	const updateSubjectField = useMemo(
		() =>
			throttle(
				(mod) => {
					updateEditorCb(mod);
				},
				250,
				{
					trailing: true,
					leading: false
				}
			),
		[updateEditorCb]
	);

	const uploadAttachmentsCb = useCallback(
		(files) => dispatch(uploadAttachments({ files })),
		[dispatch]
	);

	const updateBoard = useUpdateCurrentBoard();

	useEffect(() => {
		if (setHeader) {
			setHeader(editor?.subject ?? t('label.no_subject', 'No subject'));
		} else {
			updateBoard(undefined, editor?.subject ?? t('messages.new_email', 'New e-mail'));
		}
	}, [editor?.subject, setHeader, updateBoard, action, t]);

	useEffect(() => {
		if (action !== initialAction) {
			setActionChanged(true);
			setInitialAction(action);
		}
	}, [action, initialAction]);

	useEffect(() => {
		if (editors[editorId] && actionChanged) {
			setActionChanged(false);
		}
	}, [actionChanged, editorId, editors]);

	useEffect(() => {
		if (
			(activeMailId && messages?.[activeMailId]?.isComplete) ||
			action === ActionsType.NEW ||
			action === ActionsType.PREFILL_COMPOSE ||
			action === ActionsType.COMPOSE ||
			action === ActionsType.MAIL_TO ||
			actionChanged
		) {
			if (!editors[editorId] || actionChanged) {
				setLoading(true);
				dispatch(
					createEditor({
						settings,
						editorId,
						id: action === ActionsType.EDIT_AS_DRAFT ? activeMailId : undefined,
						original: messages?.[activeMailId ?? editorId],
						boardContext,
						action,
						change,
						accounts,
						labels: {
							to: `${t('label.to', 'To')}:`,
							from: `${t('label.from', 'From')}:`,
							cc: `${t('label.cc', 'CC')}:`,
							subject: `${t('label.subject', 'Subject')}:`,
							sent: `${t('label.sent', 'Sent')}:`
						}
					})
				);
				setTimeout(() => {
					setLoading(false);
				}, 10);
			} else {
				setEditor(editors[editorId]);
			}
		}
	}, [
		accounts,
		action,
		actionChanged,
		activeMailId,
		boardContext,
		change,
		dispatch,
		editor,
		editorId,
		editors,
		messages,
		saveDraftCb,
		settings,
		t
	]);

	useEffect(() => {
		if (editor) {
			if (
				action === ActionsType.PREFILL_COMPOSE &&
				!isUploading &&
				editor?.attach?.aid &&
				!saveFirstDraft
			) {
				setIsUploading(true);
				throttledSaveToDraft(editor);
				setTimeout(() => {
					setIsUploading(false);
				}, 10);
			}
		}
	}, [action, editor, isUploading, saveFirstDraft, throttledSaveToDraft]);

	useEffect(() => {
		if (toggleAppBoard) {
			if (activeMailId) {
				addBoard(`${MAILS_ROUTE}/edit/${activeMailId}?action=${action}`, {
					app: MAIL_APP_ID,
					mailId: activeMailId,
					title: editor?.subject
				});
			} else {
				addBoard(`${MAILS_ROUTE}/new`, {
					app: MAIL_APP_ID,
					title: t('label.new_email', 'New E-mail')
				});
			}
			replaceHistory(`/folder/${folderId}`);
		}
	}, [addBoard, folderId, activeMailId, toggleAppBoard, action, editor?.subject, t]);

	const onDragOverEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(true);
	};

	const onDropEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(false);
		addAttachments(saveDraftCb, uploadAttachmentsCb, editor, event.dataTransfer.files).then(
			(data) => {
				updateEditorCb({
					attach: { mp: data }
				});
			}
		);
	};

	const onDragLeaveEvent = (event) => {
		event.preventDefault();
		setDropZoneEnable(false);
	};
	const isSendingToYourself = useMemo(
		() => filter(editor?.to, { type: 't', address: accounts[0].name }).length > 0,
		[editor?.to, accounts]
	);

	useEffect(() => {
		if (action === ActionsType.REPLY || action === ActionsType.REPLY_ALL) {
			dispatch(
				updateEditor({
					editorId: editor?.editorId,
					data: {
						attach: { mp: [] },
						attachmentFiles: []
					}
				})
			);
		}
	}, [action, dispatch, editor?.editorId]);

	if (loading || !editor)
		return (
			<Container height="50%" mainAlignment="center" crossAlignment="center">
				<Button loading disabled label="" type="ghost" />
			</Container>
		);
	return (
		<EditViewContext.Provider
			value={{
				updateEditorCb,
				throttledSaveToDraft,
				control,
				editorId,
				editor,
				updateSubjectField,
				action,
				folderId,
				saveDraftCb
			}}
		>
			<Catcher>
				<Container onDragOver={(event) => onDragOverEvent(event)}>
					<Container
						mainAlignment="flex-start"
						height="fill"
						style={{ position: 'relative', maxHeight: '100%', overflowY: 'auto' }}
						background="gray5"
						padding={{ top: 'small', bottom: 'medium', horizontal: 'large' }}
					>
						{dropZoneEnable && (
							<DropZoneAttachment
								onDragOverEvent={onDragOverEvent}
								onDropEvent={onDropEvent}
								onDragLeaveEvent={onDragLeaveEvent}
							/>
						)}
						<Container crossAlignment="flex-end" height="fit" background="gray6">
							<EditViewHeader
								setValue={setValue}
								handleSubmit={handleSubmit}
								uploadAttachmentsCb={uploadAttachmentsCb}
							/>
							{isSendingToYourself && <WarningBanner />}

							<StyledComp.RowContainer background="gray6" padding={{ all: 'small' }}>
								<ParticipantsRow />
								<SubjectRow />

								{editor.original &&
									editor.attach?.mp?.length > 0 &&
									action !== ActionsType.COMPOSE && (
										<StyledComp.ColContainer occupyFull>
											<EditAttachmentsBlock
												editor={editor}
												throttledSaveToDraft={throttledSaveToDraft}
											/>
										</StyledComp.ColContainer>
									)}
							</StyledComp.RowContainer>
						</Container>
						<TextEditorContainer onDragOverEvent={onDragOverEvent} draftSavedAt={draftSavedAt} />
					</Container>
				</Container>
			</Catcher>
		</EditViewContext.Provider>
	);
}