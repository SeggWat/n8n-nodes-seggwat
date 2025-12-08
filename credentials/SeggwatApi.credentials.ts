import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SeggwatApi implements ICredentialType {
	name = 'seggwatApi';
	displayName = 'SeggWat API';
	documentationUrl = 'https://seggwat.com/docs/api-reference';
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
}
