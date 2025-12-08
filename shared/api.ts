import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export interface SeggwatCredentials {
	apiKey: string;
	apiUrl: string;
}

/**
 * Get credentials for SeggWat API
 */
export async function getCredentials(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<SeggwatCredentials> {
	const credentials = await this.getCredentials('seggwatApi');

	const apiKey = credentials.apiKey as string;
	const apiUrl = ((credentials.apiUrl as string) || 'https://seggwat.com').replace(/\/$/, '');

	if (!apiKey) {
		throw new Error('API Key is required. Please configure your SeggWat credentials.');
	}

	return { apiKey, apiUrl };
}

/**
 * Make an API request to SeggWat
 */
export async function seggwatApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await getCredentials.call(this);

	// Remove undefined values from query params
	const cleanQuery: IDataObject = {};
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null && value !== '') {
			cleanQuery[key] = value;
		}
	}

	const options: IHttpRequestOptions = {
		method,
		url: `${credentials.apiUrl}/api/v1${endpoint}`,
		headers: {
			'X-API-Key': credentials.apiKey,
			'Content-Type': 'application/json',
		},
		qs: cleanQuery,
		json: true,
	};

	if (method !== 'GET' && method !== 'DELETE' && Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		return await this.helpers.httpRequest(options);
	} catch (error: unknown) {
		const err = error as Error & { code?: string; cause?: { code?: string } };

		// Handle connection errors with helpful messages
		if (
			err.code === 'ECONNREFUSED' ||
			err.cause?.code === 'ECONNREFUSED' ||
			err.message?.includes('ECONNREFUSED')
		) {
			throw new Error(
				`Cannot connect to SeggWat API at "${credentials.apiUrl}". ` +
					'Please verify the API URL in your credentials is correct and the server is running.',
			);
		}

		if (
			err.code === 'ENOTFOUND' ||
			err.cause?.code === 'ENOTFOUND' ||
			err.message?.includes('ENOTFOUND')
		) {
			throw new Error(
				`Cannot resolve SeggWat API host "${credentials.apiUrl}". ` +
					'Please check that the API URL is correct.',
			);
		}

		if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
			throw new Error(
				'Authentication failed. Please verify your API Key is correct in the SeggWat credentials.',
			);
		}

		if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
			throw new Error(
				'Access denied. Your API Key may not have permission to perform this operation.',
			);
		}

		// Re-throw with more context
		throw new Error(`SeggWat API request failed: ${err.message}`);
	}
}

/**
 * Make an API request with pagination and return all results
 */
export async function seggwatApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	itemsKey: string = 'feedback',
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	let page = 1;
	const limit = 100; // Max allowed by API
	let hasMore = true;

	while (hasMore) {
		const response = (await seggwatApiRequest.call(this, method, endpoint, body, {
			...query,
			page,
			limit,
		})) as IDataObject;

		const items = response[itemsKey] as IDataObject[] | undefined;
		if (items && Array.isArray(items)) {
			returnData.push(...items);

			const pagination = response.pagination as IDataObject | undefined;
			if (pagination) {
				const totalPages = pagination.total_pages as number;
				hasMore = page < totalPages;
			} else {
				hasMore = false;
			}
		} else {
			hasMore = false;
		}

		page++;
	}

	return returnData;
}

/**
 * Feedback types available in SeggWat
 */
export const FEEDBACK_TYPES = [
	{ name: 'Bug', value: 'Bug' },
	{ name: 'Feature', value: 'Feature' },
	{ name: 'Praise', value: 'Praise' },
	{ name: 'Question', value: 'Question' },
	{ name: 'Improvement', value: 'Improvement' },
	{ name: 'Other', value: 'Other' },
];

/**
 * Feedback statuses available in SeggWat
 */
export const FEEDBACK_STATUSES = [
	{ name: 'New', value: 'New' },
	{ name: 'Active', value: 'Active' },
	{ name: 'Assigned', value: 'Assigned' },
	{ name: 'Hold', value: 'Hold' },
	{ name: 'Closed', value: 'Closed' },
	{ name: 'Resolved', value: 'Resolved' },
];

/**
 * Feedback sources available in SeggWat
 */
export const FEEDBACK_SOURCES = [
	{ name: 'Widget', value: 'Widget' },
	{ name: 'Manual', value: 'Manual' },
	{ name: 'Mintlify', value: 'Mintlify' },
	{ name: 'Stripe', value: 'Stripe' },
];

/**
 * Load projects from SeggWat API for dropdown
 */
export async function getProjects(
	this: ILoadOptionsFunctions,
): Promise<Array<{ name: string; value: string }>> {
	try {
		const response = (await seggwatApiRequest.call(this, 'GET', '/projects')) as IDataObject;

		const projects = response.projects as IDataObject[] | undefined;
		if (!projects || !Array.isArray(projects)) {
			return [];
		}

		return projects.map((project) => ({
			name: `${project.name as string} (${project.feedback_count || 0} feedback)`,
			value: project.id as string,
		}));
	} catch (error: unknown) {
		const err = error as Error;
		// Return empty array with a hint in the error for loadOptions
		throw new Error(`Failed to load projects: ${err.message}`);
	}
}
