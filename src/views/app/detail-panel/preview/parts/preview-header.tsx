/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	ReactElement,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import styled from 'styled-components';
import {
	Container,
	Text,
	Avatar,
	Icon,
	Padding,
	Row,
	ThemeContext
} from '@zextras/carbonio-design-system';
import { capitalize, find, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { useParams } from 'react-router-dom';
import OnBehalfOfDisplayer from './on-behalf-of-displayer';
import MailMsgPreviewActions from '../../../../../ui-actions/mail-message-preview-actions';
import { useMessageActions } from '../../../../../hooks/use-message-actions';
import { retrieveAttachmentsType } from '../../../../../store/editor-slice-utils';
import { getTimeLabel, participantToString } from '../../../../../commons/utils';
import MessageContactsList from './message-contact-list';
import { MailMessage } from '../../../../../types/mail-message';

const HoverContainer = styled(Container)`
	cursor: pointer;
	border-radius: ${({ isExpanded }): string => (isExpanded ? '4px 4px 0 0' : '4px')};
	&:hover {
		background: ${({ theme, background }): string => theme.palette[background].hover};
	}
`;

type PreviewHeaderProps = {
	compProps: {
		message: MailMessage;
		onClick: (e: any) => void;
		open: boolean;
	};
};

type ThemeType = { sizes: { icon: { large: string } } };

const fallbackContact = { address: '', displayName: '', fullName: '' };

const PreviewHeader: FC<PreviewHeaderProps> = ({ compProps }): ReactElement => {
	const { message, onClick, open } = compProps;

	const textRef = useRef<HTMLInputElement>();
	const [t] = useTranslation();
	const accounts = useUserAccounts();

	const [_minWidth, _setMinWidth] = useState('');
	const actions = useMessageActions(message);
	const mainContact = find(message.participants, ['type', 'f']) || fallbackContact;
	const _onClick = useCallback((e) => !e.isDefaultPrevented() && onClick(e), [onClick]);
	const attachments = retrieveAttachmentsType(message, 'attachment');
	const senderContact = find(message.participants, ['type', 's']);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { folderId } = useParams();

	const theme: ThemeType = useContext(ThemeContext);
	const iconSize = useMemo(
		() => parseInt(theme?.sizes.icon.large, 10),
		[theme?.sizes?.icon?.large]
	);
	useLayoutEffect(() => {
		let width = actions.length > 2 ? iconSize : 2 * iconSize;
		if (message.attachment && attachments.length > 0) width += iconSize;
		if (message.flagged) width += iconSize;
		if (textRef?.current?.clientWidth) width += textRef.current.clientWidth;
		_setMinWidth(`${width}px`);
	}, [
		actions.length,
		attachments.length,
		iconSize,
		message.attachment,
		message.flagged,
		textRef?.current?.clientWidth
	]);

	return (
		<HoverContainer
			height="fit"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			background="gray6"
			isExpanded={open}
			onClick={_onClick}
		>
			<Container height="fit" width="100%" isExpanded={open}>
				<Container orientation="horizontal">
					<Container
						orientation="vertical"
						width="fit"
						mainAlignment="flex-start"
						padding={{ all: 'small' }}
					>
						<Avatar
							label={mainContact.fullName || mainContact.address}
							colorLabel={mainContact.address}
							size="small"
						/>
					</Container>
					<Row
						height="fit"
						width="calc(100% - 48px)"
						padding={{ vertical: 'small' }}
						takeAvailableSpace
					>
						<Container orientation="horizontal" mainAlignment="space-between" width="fill">
							<Row
								// this style replace takeAvailableSpace prop, it calculates growth depending from content (all 4 props are needed)
								style={{
									flexGrow: 1,
									flexBasis: 'fit-content',
									overflow: 'hidden',
									whiteSpace: 'nowrap'
								}}
								mainAlignment="flex-start"
								wrap="nowrap"
							>
								{isEmpty(senderContact) ? (
									<Row takeAvailableSpace width="fit" mainAlignment="flex-start" wrap="nowrap">
										<Text
											data-testid="SenderText"
											size={message.read ? 'small' : 'medium'}
											color={message.read ? 'text' : 'primary'}
											weight={message.read ? 'normal' : 'bold'}
										>
											{capitalize(participantToString(mainContact, t, accounts))}
										</Text>
										<Padding left="small" />
										<Text color="gray1" size={message.read ? 'small' : 'medium'}>
											{mainContact.address && mainContact.address}
										</Text>
									</Row>
								) : (
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore
									<OnBehalfOfDisplayer compProps={{ senderContact, message, mainContact }} />
								)}
							</Row>
							<Row
								wrap="nowrap"
								mainAlignment="flex-end"
								// this style replace takeAvailableSpace prop, it calculates growth depending from content (all 4 props are needed)
								style={{
									flexGrow: 1,
									flexBasis: 'fit-content',
									whiteSpace: 'nowrap',
									overflow: 'hidden'
								}}
								minWidth={_minWidth}
							>
								{message.attachment && attachments.length > 0 && (
									<Padding left="small">
										<Icon icon="AttachOutline" />
									</Padding>
								)}
								{message.flagged && (
									<Padding left="small">
										<Icon color="error" icon="Flag" data-testid="FlagIcon" />
									</Padding>
								)}
								<Row ref={textRef} minWidth="fit" padding={{ horizontal: 'small' }}>
									<Text color="gray1" data-testid="DateLabel" size="extrasmall">
										{getTimeLabel(message.date)}
									</Text>
								</Row>

								{open && <MailMsgPreviewActions actions={actions} />}
							</Row>
						</Container>
					</Row>
				</Container>
			</Container>
			<Container
				orientation="horizontal"
				padding={{ horizontal: 'small' }}
				mainAlignment="flex-start"
			>
				{!open && (
					<Row takeAvailabelSpace padding={{ bottom: 'small' }}>
						<Text color="secondary" size="small">
							{message.fragment}
						</Text>
					</Row>
				)}
				{open && <MessageContactsList message={message} folderId={folderId} />}
			</Container>
		</HoverContainer>
	);
};

export default PreviewHeader;