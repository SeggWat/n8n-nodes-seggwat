import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	FEEDBACK_SOURCES,
	FEEDBACK_STATUSES,
	FEEDBACK_TYPES,
	getProjects,
	seggwatApiRequest,
	seggwatApiRequestAllItems,
} from '../../shared/api';

export class Seggwat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SeggWat',
		name: 'seggwat',
		icon: 'file:seggwat.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Manage feedback and ratings in SeggWat',
		defaults: {
			name: 'SeggWat',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'seggwatApi',
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Feedback',
						value: 'feedback',
					},
					{
						name: 'Rating',
						value: 'rating',
					},
				],
				default: 'feedback',
			},

			// ============================================
			// FEEDBACK OPERATIONS
			// ============================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
					},
				},
				options: [
					{
						name: 'Submit',
						value: 'submit',
						description: 'Submit new feedback',
						action: 'Submit feedback',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List feedback for a project',
						action: 'List feedback',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single feedback item',
						action: 'Get feedback',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a feedback item',
						action: 'Update feedback',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a feedback item',
						action: 'Delete feedback',
					},
				],
				default: 'list',
			},

			// ============================================
			// RATING OPERATIONS
			// ============================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['rating'],
					},
				},
				options: [
					{
						name: 'Submit',
						value: 'submit',
						description: 'Submit a new rating',
						action: 'Submit rating',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List ratings for a project',
						action: 'List ratings',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single rating',
						action: 'Get rating',
					},
					{
						name: 'Get Statistics',
						value: 'stats',
						description: 'Get rating statistics for a project',
						action: 'Get rating statistics',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a rating',
						action: 'Delete rating',
					},
				],
				default: 'list',
			},

			// ============================================
			// FEEDBACK: Submit Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['submit'],
					},
				},
				description: 'The project to submit feedback to',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['submit'],
					},
				},
				description: 'The feedback message content',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['submit'],
					},
				},
				options: [
					{
						displayName: 'Path',
						name: 'path',
						type: 'string',
						default: '',
						description: 'The page path where feedback was submitted (e.g., /docs/getting-started)',
					},
					{
						displayName: 'Version',
						name: 'version',
						type: 'string',
						default: '',
						description: 'Application version (e.g., 1.2.3)',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'options',
						options: FEEDBACK_SOURCES,
						default: 'Manual',
						description: 'Where the feedback came from',
					},
					{
						displayName: 'Submitted By',
						name: 'submitted_by',
						type: 'string',
						default: '',
						description: 'User identifier who submitted the feedback',
					},
				],
			},

			// ============================================
			// FEEDBACK: List Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['list'],
					},
				},
				description: 'The project to list feedback from',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['list'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 20,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['list'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: FEEDBACK_STATUSES,
						default: '',
						description: 'Filter by feedback status',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: FEEDBACK_TYPES,
						default: '',
						description: 'Filter by feedback type',
					},
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search term to filter feedback messages',
					},
				],
			},

			// ============================================
			// FEEDBACK: Get Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['get'],
					},
				},
				description: 'The project the feedback belongs to',
			},
			{
				displayName: 'Feedback ID',
				name: 'feedbackId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['get'],
					},
				},
				description: 'The ID of the feedback item to retrieve',
			},

			// ============================================
			// FEEDBACK: Update Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['update'],
					},
				},
				description: 'The project the feedback belongs to',
			},
			{
				displayName: 'Feedback ID',
				name: 'feedbackId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['update'],
					},
				},
				description: 'The ID of the feedback item to update',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Message',
						name: 'message',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Updated feedback message',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: FEEDBACK_TYPES,
						default: '',
						description: 'Updated feedback type',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: FEEDBACK_STATUSES,
						default: '',
						description: 'Updated feedback status',
					},
				],
			},

			// ============================================
			// FEEDBACK: Delete Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['delete'],
					},
				},
				description: 'The project the feedback belongs to',
			},
			{
				displayName: 'Feedback ID',
				name: 'feedbackId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['feedback'],
						operation: ['delete'],
					},
				},
				description: 'The ID of the feedback item to delete',
			},

			// ============================================
			// RATING: Submit Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['submit'],
					},
				},
				description: 'The project to submit rating to',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'options',
				options: [
					{
						name: 'Helpful (👍)',
						value: true,
					},
					{
						name: 'Not Helpful (👎)',
						value: false,
					},
				],
				default: true,
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['submit'],
					},
				},
				description: 'Whether the content was helpful or not',
			},
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['submit'],
					},
				},
				description: 'The page path being rated (e.g., /docs/getting-started)',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['submit'],
					},
				},
				options: [
					{
						displayName: 'Version',
						name: 'version',
						type: 'string',
						default: '',
						description: 'Application version (e.g., 1.2.3)',
					},
					{
						displayName: 'Submitted By',
						name: 'submitted_by',
						type: 'string',
						default: '',
						description: 'User identifier who submitted the rating',
					},
				],
			},

			// ============================================
			// RATING: List Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['list'],
					},
				},
				description: 'The project to list ratings from',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['list'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 20,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['list'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Value',
						name: 'value',
						type: 'options',
						options: [
							{
								name: 'All',
								value: '',
							},
							{
								name: 'Helpful',
								value: 'true',
							},
							{
								name: 'Not Helpful',
								value: 'false',
							},
						],
						default: '',
						description: 'Filter by rating value',
					},
					{
						displayName: 'Path',
						name: 'path',
						type: 'string',
						default: '',
						description: 'Filter by exact path match',
					},
				],
			},

			// ============================================
			// RATING: Get Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['get'],
					},
				},
				description: 'The project the rating belongs to',
			},
			{
				displayName: 'Rating ID',
				name: 'ratingId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['get'],
					},
				},
				description: 'The ID of the rating to retrieve',
			},

			// ============================================
			// RATING: Stats Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['stats'],
					},
				},
				description: 'The project to get statistics for',
			},
			{
				displayName: 'Path Filter',
				name: 'pathFilter',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['stats'],
					},
				},
				description: 'Optional path to filter statistics (leave empty for project-wide stats)',
			},

			// ============================================
			// RATING: Delete Operation Fields
			// ============================================
			{
				displayName: 'Project',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['delete'],
					},
				},
				description: 'The project the rating belongs to',
			},
			{
				displayName: 'Rating ID',
				name: 'ratingId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rating'],
						operation: ['delete'],
					},
				},
				description: 'The ID of the rating to delete',
			},
		],
	};

	methods = {
		loadOptions: {
			async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getProjects.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'feedback') {
					// FEEDBACK OPERATIONS
					if (operation === 'submit') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const message = this.getNodeParameter('message', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							message,
							...additionalFields,
						};

						responseData = await seggwatApiRequest.call(
							this,
							'POST',
							`/projects/${projectId}/feedback`,
							body,
						);
					} else if (operation === 'list') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						const query: IDataObject = { ...filters };

						if (returnAll) {
							responseData = await seggwatApiRequestAllItems.call(
								this,
								'GET',
								`/projects/${projectId}/feedback`,
								{},
								query,
								'feedback',
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							query.limit = limit;
							query.page = 1;

							const response = (await seggwatApiRequest.call(
								this,
								'GET',
								`/projects/${projectId}/feedback`,
								{},
								query,
							)) as IDataObject;

							responseData = (response.feedback as IDataObject[]) || [];
						}
					} else if (operation === 'get') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const feedbackId = this.getNodeParameter('feedbackId', i) as string;

						responseData = await seggwatApiRequest.call(
							this,
							'GET',
							`/projects/${projectId}/feedback/${feedbackId}`,
						);
					} else if (operation === 'update') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const feedbackId = this.getNodeParameter('feedbackId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						if (Object.keys(updateFields).length === 0) {
							throw new Error('At least one field must be provided to update');
						}

						responseData = await seggwatApiRequest.call(
							this,
							'PATCH',
							`/projects/${projectId}/feedback/${feedbackId}`,
							updateFields,
						);
					} else if (operation === 'delete') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const feedbackId = this.getNodeParameter('feedbackId', i) as string;

						await seggwatApiRequest.call(
							this,
							'DELETE',
							`/projects/${projectId}/feedback/${feedbackId}`,
						);

						responseData = { success: true, deleted: feedbackId };
					} else {
						throw new Error(`Unknown feedback operation: ${operation}`);
					}
				} else if (resource === 'rating') {
					// RATING OPERATIONS
					if (operation === 'submit') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const value = this.getNodeParameter('value', i) as boolean;
						const path = this.getNodeParameter('path', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							value,
							path,
							...additionalFields,
						};

						await seggwatApiRequest.call(this, 'POST', `/projects/${projectId}/ratings`, body);

						responseData = { success: true, value, path };
					} else if (operation === 'list') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						const query: IDataObject = {};
						if (filters.path) {
							query.path = filters.path;
						}
						if (filters.value && filters.value !== '') {
							query.value = filters.value === 'true';
						}

						if (returnAll) {
							responseData = await seggwatApiRequestAllItems.call(
								this,
								'GET',
								`/projects/${projectId}/ratings`,
								{},
								query,
								'ratings',
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							query.limit = limit;
							query.page = 1;

							const response = (await seggwatApiRequest.call(
								this,
								'GET',
								`/projects/${projectId}/ratings`,
								{},
								query,
							)) as IDataObject;

							responseData = (response.ratings as IDataObject[]) || [];
						}
					} else if (operation === 'get') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const ratingId = this.getNodeParameter('ratingId', i) as string;

						responseData = await seggwatApiRequest.call(
							this,
							'GET',
							`/projects/${projectId}/ratings/${ratingId}`,
						);
					} else if (operation === 'stats') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const pathFilter = this.getNodeParameter('pathFilter', i) as string;

						const query: IDataObject = {};
						if (pathFilter) {
							query.path = pathFilter;
						}

						responseData = await seggwatApiRequest.call(
							this,
							'GET',
							`/projects/${projectId}/ratings/stats`,
							{},
							query,
						);
					} else if (operation === 'delete') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const ratingId = this.getNodeParameter('ratingId', i) as string;

						await seggwatApiRequest.call(
							this,
							'DELETE',
							`/projects/${projectId}/ratings/${ratingId}`,
						);

						responseData = { success: true, deleted: ratingId };
					} else {
						throw new Error(`Unknown rating operation: ${operation}`);
					}
				} else {
					throw new Error(`Unknown resource: ${resource}`);
				}

				// Handle array vs single object response
				if (Array.isArray(responseData)) {
					for (const item of responseData) {
						returnData.push({ json: item });
					}
				} else {
					returnData.push({ json: responseData as IDataObject });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
