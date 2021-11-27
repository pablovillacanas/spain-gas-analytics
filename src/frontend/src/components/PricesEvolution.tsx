import { Container } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PriceChart from './PriceChart';

interface Props {}

const carburantsNamesMap = {
	biodiesel: 'Biodiesel',
	bioethanol: 'Bioethanol',
	compressed_natgas: 'Compressed natgas',
	diesel_a: 'Diesel A',
	diesel_b: 'Diesel B',
	diesel_prem: 'Diesel premium',
	gasoline_95e5: 'Gasoline 95e5',
	gasoline_95e5prem: 'Gasoline 95e5 premium',
	gasoline_95e10: 'Gasoline 95e10',
	gasoline_98e5: 'Gasoline 98e5',
	gasoline_98e10: 'Gasoline 98e10',
	liq_gas_from_oil: 'Liquid gas from oil',
	liq_natgas: 'Liq natgas from oil',
};

export const PricesEvolution = (props: Props) => {
	const [analytics, setAnalytics] = useState([]);

	useEffect(() => {
		fetch('http://localhost:5000/api/v1/analytics/prices_evolution')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				setAnalytics(data);
			});
	}, []);

	const adapter = (type) => {
		const dataparsed: Array<any> = analytics.reduce((acc: any, curr: any) => {
			if (curr[type])
				acc.push({
					x: new Date(curr.date),
					y: parseFloat(parseFloat(curr[type]).toFixed(3)),
				});
			return acc;
		}, []);
		return [{ label: type, data: dataparsed }];
	};

	return (
		<Container maxWidth='xl'>
			<h1>Prices evolution</h1>
			{analytics.length > 0 &&
				Object.keys(carburantsNamesMap).map((c) => (
					<PriceChart
						title={carburantsNamesMap[c]}
						data={adapter(c)}
					></PriceChart>
				))}
		</Container>
	);
};
