/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';
import { Container, ChipInput, ChipItem } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { SearchChipItem } from '../../../types/commons';

type ComponentProps = {
	compProps: {
		t: TFunction;
		otherKeywords: Array<any>;
		setOtherKeywords: (arg: any) => void;
		subject: Array<any>;
		setSubject: (arg: any) => void;
	};
};
const SubjectKeywordRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { t, otherKeywords, setOtherKeywords, subject, setSubject } = compProps;
	const onChange = useCallback((state, stateHandler) => {
		stateHandler(state);
	}, []);
	const keywordChipOnAdd = useCallback(
		(label: string | unknown): SearchChipItem => ({
			label: typeof label === 'string' ? label : '',
			hasAvatar: false,
			isGeneric: true
		}),
		[]
	);
	const chipOnAdd = useCallback(
		(label, preText, hasAvatar, isGeneric, isQueryFilter): SearchChipItem => ({
			label: `${preText}:${label}`,
			hasAvatar,
			isGeneric,
			isQueryFilter,
			value: `${preText}:${label}`
		}),
		[]
	);

	const subjectOnChange = useCallback(
		(label: ChipItem[]): void => onChange(label, setSubject),
		[onChange, setSubject]
	);

	const keywordOnChange = useCallback(
		(label: ChipItem[]): void => onChange(label, setOtherKeywords),
		[onChange, setOtherKeywords]
	);

	const subjectChipOnAdd = useCallback(
		(label: string | unknown): ChipItem => chipOnAdd(label, 'Subject', false, false, true),
		[chipOnAdd]
	);

	const chipBackground = 'gray5';

	return (
		<React.Fragment>
			<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
				<Container padding={{ right: 'extrasmall' }} maxWidth="50%">
					<ChipInput
						placeholder={t('label.keywords', 'Keywords')}
						background={chipBackground}
						value={otherKeywords}
						confirmChipOnSpace={false}
						onChange={keywordOnChange}
						onAdd={keywordChipOnAdd}
					/>
				</Container>
				<Container padding={{ left: 'extrasmall' }} maxWidth="50%">
					<ChipInput
						placeholder={t('label.subject', 'Subject')}
						background={chipBackground}
						value={subject}
						confirmChipOnSpace={false}
						onChange={subjectOnChange}
						onAdd={subjectChipOnAdd}
						maxChips={1}
					/>
				</Container>
			</Container>
		</React.Fragment>
	);
};

export default SubjectKeywordRow;
