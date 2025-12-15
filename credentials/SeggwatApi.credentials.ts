import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class SeggwatApi implements ICredentialType {
	name = 'seggwatApi';
	displayName = 'SeggWat API';
	documentationUrl = 'https://seggwat.com/docs/api-reference';
	icon: Icon = 'file:../icons/seggwat.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Organization Access Token from SeggWat dashboard (Settings → API Keys)',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://seggwat.com',
			required: false,
			description: 'Base URL for SeggWat API (change for self-hosted instances)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.apiUrl || "https://seggwat.com"}}',
			url: '/api/v1/projects',
			method: 'GET',
		},
	};
}
