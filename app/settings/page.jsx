'use client';
import { useEffect, useState } from 'react';
import { Alert, Container, Row, Col, FormGroup, Input, Label } from 'reactstrap';
import { createClient } from '@/utils/supabase/client';
import LoadingPlaceholder from '@/components/interface/LoadingPlaceholder';
import { roundingOptions } from '@/utils/constants';

const UserSettings = () => {
	const supabase = createClient();
	const [user, setUser] = useState(null);
	const [config, setConfig] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const {
					data: { user }
				} = await supabase.auth.getUser();
				setUser(user);
			} catch (error) {
				console.log(error);
			}
		};

		fetchUser();
	}, []);

	useEffect(() => {
		const fetchUserSettings = async () => {
			if (!user) return;

			try {
				const { data, error } = await supabase.from('usersettings').select('config').eq('user_id', user?.id).single();

				if (error && error.code === 'PGRST116') {
					// No row exists, create a new one
					const { data: newData, error: newError } = await supabase.from('usersettings').insert({ user_id: user?.id, config: {} }).select().single();

					if (newError) {
						throw newError;
					}

					setConfig(newData.config);
				} else if (error) {
					throw error;
				} else {
					setConfig(data.config);
				}
			} catch (error) {
				setError('Something went wrong while loading user settings.');
			} finally {
				setLoading(false);
			}
		};

		fetchUserSettings();
	}, [user]);

	const handleConfigChange = async (e) => {
		const { name, value } = e.target;

		// Update the local state
		setConfig((prevConfig) => ({
			...prevConfig,
			[name]: value
		}));

		// Update the database
		try {
			const { error } = await supabase
				.from('usersettings')
				.update({ config: { ...config, [name]: value } })
				.eq('user_id', user?.id);

			if (error) {
				throw error;
			}
		} catch (error) {
			setError('Something went wrong while saving user settings. Try refreshing the page.');
		}
	};

	return (
		<Container>
			<Row>
				<Col>
					<h2 className="mt-5">Settings</h2>

				</Col>
			</Row>
			{loading && (
                <>
				<Row>
					<Col>
                        <LoadingPlaceholder width='300px' height='24px' cornerRadius='2px' className="mt-2 mb-0" />
					</Col>
				</Row>
                <LoadingPlaceholder width='366px' height='36px' cornerRadius='4px' className="mt-2 mb-0" />
                </>
			)}
			{!loading && (
				<>
					<Row>
						<Col>
							<div>{error && <Alert color="danger">{error}</Alert>}</div>
						</Col>
					</Row>
					<FormGroup className="mt-2">
						<Label for="minSessionLength">Round Session Length to the nearest</Label>
						<Input 
                        style={{ width: '366px' }}
                        type="select" name="minSessionLength" id="minSessionLength" value={config.minSessionLength || ''} onChange={handleConfigChange}>
							{roundingOptions.map(({ label, value }) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</Input>
					</FormGroup>
				</>
			)}
		</Container>
	);
};

export default UserSettings;
