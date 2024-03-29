import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoDisturb from '@mui/icons-material/DoDisturb';
import MapIcon from '@mui/icons-material/Map';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import haversine from 'haversine-distance';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getApiServerURL } from '../constants';
import { RootState } from '../store';
import HTMLTooltip from './HTMLTooltip';

type Item = {
	coordinates: {
		type: 'Feature';
		geometry: { coordinates: { lat: number; lng: number } };
		properties: string;
	};
	direction: 'CARRETERA N-550 KM. 71,2';
	id: 511;
	labour_data: 'L-V: 07:00-23:00; S-D: 08:00-23:00';
	last_price: [
		{
			date: string;
			diesel_a: number;
		}
	];
	name: 'CEPSA';
	sale_type: 'P';
	service_type: 'A' | 'P' | 'D';
};

type Row = {
	name: string;
	price: number;
	direction: string;
	characteristics: string;
	distance: number;
	labour_data: string;
	coordinates: string;
	calculate: number;
};

function createData(
	row: Item,
	origin: GeolocationCoordinates,
	payment,
	gas_type
): Row {
	return {
		name: row.name,
		price: row.last_price[0][gas_type],
		direction: row.direction,
		characteristics: `${row.sale_type} (${row.service_type})`,
		labour_data: row.labour_data,
		distance: haversine(
			{
				lng: row.coordinates.geometry.coordinates[0],
				lat: row.coordinates.geometry.coordinates[1],
			},
			{ lng: origin.longitude, lat: origin.latitude }
		),
		coordinates: `${row.coordinates.geometry.coordinates[0]},${row.coordinates.geometry.coordinates[1]}`,
		calculate: +(payment / row.last_price[0][gas_type]).toFixed(3),
	};
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function getComparator<Key extends keyof Row>(
	order: Order,
	orderBy: Key
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string }
) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

type Order = 'asc' | 'desc';

interface HeadCell {
	id: keyof Row;
	disablePadding: boolean;
	label: string;
	numeric: boolean;
	sortable?: boolean;
	variant?: string;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'name',
		numeric: false,
		disablePadding: false,
		label: 'Name',
		variant: 'head',
	},
	{
		id: 'price',
		numeric: true,
		disablePadding: false,
		label: 'Price',
		sortable: true,
		variant: 'head',
	},
	{
		id: 'direction',
		numeric: false,
		disablePadding: false,
		label: 'Direction',
		variant: 'head',
	},
	{
		id: 'distance',
		numeric: true,
		disablePadding: false,
		label: 'Distance',
		sortable: true,
		variant: 'head',
	},
	{
		id: 'characteristics',
		numeric: false,
		disablePadding: false,
		label: 'Characteristics',
		variant: 'head',
	},
	{
		id: 'labour_data',
		numeric: false,
		disablePadding: false,
		label: 'Labour data',
		variant: 'head',
	},
	{
		id: 'calculate',
		numeric: false,
		disablePadding: false,
		label: 'Quantity (Liters)',
		variant: 'head',
	},
];

interface EnhancedTableProps {
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof Row
	) => void;
	order: Order;
	orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const handleSort =
		(property: keyof Row) => (event: React.MouseEvent<unknown>) => {
			props.onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) =>
					headCell.sortable ? (
						<TableCell
							key={headCell.id}
							align={headCell.numeric ? 'right' : 'left'}
							padding={headCell.disablePadding ? 'none' : 'normal'}
							sortDirection={
								props.orderBy === headCell.id ? props.order : false
							}
						>
							<TableSortLabel
								active={props.orderBy === headCell.id}
								direction={props.orderBy === headCell.id ? props.order : 'asc'}
								onClick={handleSort(headCell.id)}
							>
								{headCell.label}
								{props.orderBy === headCell.id ? (
									<Box component='span' sx={visuallyHidden}>
										{props.order === 'desc'
											? 'sorted descending'
											: 'sorted ascending'}
									</Box>
								) : null}
							</TableSortLabel>
						</TableCell>
					) : (
						<TableCell
							key={headCell.id}
							align={headCell.numeric ? 'right' : 'left'}
							padding={headCell.disablePadding ? 'none' : 'normal'}
						>
							{headCell.label}
						</TableCell>
					)
				)}
			</TableRow>
		</TableHead>
	);
}

interface Props {
	location: GeolocationCoordinates;
}

export const PriceTableEnhanced = (props: Props) => {
	let navigate = useNavigate();
	const [data, setData] = useState<any>();
	const [order, setOrder] = React.useState<Order>('asc');
	const [orderBy, setOrderBy] = React.useState<keyof Row>('price');
	const { payment, preferredCarburant } = useSelector(
		(state: RootState) => state.priceCalculator
	);

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof Row
	) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const rows = useMemo(
		() =>
			data &&
			data.items?.map((datum) => {
				if (datum.last_price[0]?.[preferredCarburant]) {
					return createData(datum, props.location, payment, preferredCarburant);
				}
			}),
		[data, payment, preferredCarburant]
	);

	useEffect(() => {
		props.location &&
			fetch(
				`${getApiServerURL()}/api/v1/gas_stations?near=${
					props.location.longitude
				},${props.location.latitude}`
			)
				.then((response) => {
					return response.json();
				})
				.then(setData);
	}, [props.location, preferredCarburant]);

	type TimetableService = Map<'A' | 'P' | 'D', Map<string, string[]>>;

	const getHTMLServiceTypeTooltip = (
		title: string,
		serviceType: Map<string, string[]>
	) => {
		return (
			<>
				<Typography color='inherit'>{title}</Typography>
				{Array.from(serviceType.entries()).map(([k, v]) => (
					<>
						<div>{k}</div>
						<div>
							{v.map((v) => (
								<div style={{ paddingLeft: '1em' }}>{v}</div>
							))}
						</div>
					</>
				))}
			</>
		);
	};

	return (
		<TableContainer component={Paper}>
			<Table aria-label='simple table'>
				<EnhancedTableHead
					order={order}
					orderBy={orderBy}
					onRequestSort={handleRequestSort}
				/>
				<TableBody>
					{rows
						?.slice()
						.sort(getComparator(order, orderBy))
						.map(
							(row, index) =>
								row && (
									<TableRow
										key={index}
										sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
									>
										<TableCell align='left'>{row.name}</TableCell>
										<TableCell align='right'>{row.price}</TableCell>
										<TableCell align='left'>
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													cursor: 'pointer',
												}}
												onClick={() =>
													navigate(
														`/map?location=${row.coordinates.split(',')[0]},${
															row.coordinates.split(',')[1]
														}`
													)
												}
											>
												{row.direction}
												<MapIcon sx={{ marginLeft: '0.75rem' }}></MapIcon>
											</Box>
										</TableCell>
										<TableCell align='right'>{`${(row.distance / 1000).toFixed(
											2
										)} km`}</TableCell>
										<TableCell align='left'>
											{row.characteristics.startsWith('P') ? (
												<HTMLTooltip title='Public sell' arrow placement='top'>
													<CheckCircleIcon />
												</HTMLTooltip>
											) : (
												<HTMLTooltip
													title='Restricted sell'
													arrow
													placement='top'
												>
													<DoDisturb />
												</HTMLTooltip>
											)}
											{/* {row.characteristics.includes('(P)') && (
												<HTMLTooltip title='Atendido' arrow placement='top'>
													<PersonIcon />
												</HTMLTooltip>
											)}
											{row.characteristics.includes('(A)') && (
												<HTMLTooltip title='Autoservicio' arrow placement='top'>
													<LiveHelpIcon />
												</HTMLTooltip>
											)}
											{row.characteristics.includes('(D)') && (
												<HTMLTooltip title='Desatendido' arrow placement='top'>
													<PersonOffIcon />
												</HTMLTooltip>
											)} */}
										</TableCell>
										<TableCell align='left'>
											{row.labour_data.split(';').map((v) => (
												<div>{v}</div>
											))}
										</TableCell>
										<TableCell align='left'>{row.calculate}</TableCell>
									</TableRow>
								)
						)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
