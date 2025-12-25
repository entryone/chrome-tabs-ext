// src/components/JiraIssues.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';

// Объявление для Chrome Extension API
declare const chrome: {
    storage: {
        sync: {
            get: (keys: string[], callback: (items: { [key: string]: any }) => void) => void;
            set: (items: { [key: string]: any }, callback?: () => void) => void;
        };
    };
};

interface JiraIssue {
    id: string;
    key: string;
    fields: {
        summary: string;
        status: {
            name: string;
            statusCategory: {
                colorName: string;
            };
        };
        priority: {
            name: string;
            iconUrl?: string;
        };
        issuetype: {
            name: string;
            iconUrl?: string;
        };
        assignee?: {
            displayName: string;
            avatarUrls: {
                '24x24': string;
            };
        };
        updated: string;
        created: string;
        description?: string;
    };
    self: string;
}

interface JiraIssuesResponse {
    issues: JiraIssue[];
    total: number;
    maxResults: number;
    startAt: number;
}

interface JiraConfig {
    instanceUrl: string;
    email: string;
    apiToken: string;
}

function JiraIssues() {
    const [issues, setIssues] = useState<JiraIssue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<JiraConfig | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        if (config && config.instanceUrl && config.email && config.apiToken) {
            fetchIssues();
        }
    }, [config]);

    const loadConfig = () => {
        chrome.storage.sync.get(['jiraInstanceUrl', 'jiraEmail', 'jiraApiToken'], (data) => {
            if (data.jiraInstanceUrl && data.jiraEmail && data.jiraApiToken) {
                setConfig({
                    instanceUrl: data.jiraInstanceUrl,
                    email: data.jiraEmail,
                    apiToken: data.jiraApiToken,
                });
            } else {
                setShowSettings(true);
            }
        });
    };

    const fetchIssues = async () => {
        if (!config) return;

        setLoading(true);
        setError(null);

        try {
            // Убираем trailing slash если есть
            const baseUrl = config.instanceUrl.replace(/\/$/, '');
            // Используем новый API v3 endpoint с POST запросом
            const url = `${baseUrl}/rest/api/3/search/jql`;

            const auth = btoa(`${config.email}:${config.apiToken}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jql: '(assignee=currentUser() OR participants=currentUser()) AND status = "In Progress" ORDER BY updated DESC',
                    maxResults: 50,
                    fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'updated', 'created', 'description'],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}. ${errorText}`);
            }

            const data: JiraIssuesResponse = await response.json();
            console.log('Jira API response:', data);
            
            // Проверяем структуру ответа и фильтруем валидные issues
            const validIssues = (data.issues || []).filter(issue => {
                return issue && issue.fields && issue.fields.summary;
            });
            
            console.log('Valid issues:', validIssues);
            setIssues(validIssues);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch issues');
            console.error('Error fetching Jira issues:', err);
        } finally {
            setLoading(false);
        }
    };


    const saveConfig = (newConfig: JiraConfig) => {
        chrome.storage.sync.set({
            jiraInstanceUrl: newConfig.instanceUrl,
            jiraEmail: newConfig.email,
            jiraApiToken: newConfig.apiToken,
        }, () => {
            setConfig(newConfig);
            setShowSettings(false);
        });
    };

    const getStatusColor = (statusCategoryColor: string) => {
        switch (statusCategoryColor.toLowerCase()) {
            case 'green':
                return '#388e3c';
            case 'yellow':
                return '#fbc02d';
            case 'blue-gray':
                return '#1976d2';
            default:
                return '#757575';
        }
    };

    const getPriorityColor = (priorityName: string) => {
        const lower = priorityName.toLowerCase();
        if (lower.includes('highest') || lower.includes('critical')) {
            return '#d32f2f';
        } else if (lower.includes('high')) {
            return '#f57c00';
        } else if (lower.includes('medium')) {
            return '#fbc02d';
        } else if (lower.includes('low') || lower.includes('lowest')) {
            return '#388e3c';
        }
        return '#757575';
    };

    if (showSettings || !config) {
        return <JiraSettings onSave={saveConfig} initialConfig={config} />;
    }

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '20px auto',
            padding: '20px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>My Jira Issues</h1>
                <div>
                    <button
                        onClick={fetchIssues}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            marginRight: '10px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#757575',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '20px',
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading && issues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Loading issues...
                </div>
            ) : issues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No active issues assigned to you
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {issues.map((issue) => {
                        // Безопасный доступ к данным
                        if (!issue || !issue.fields) {
                            return null;
                        }
                        
                        const fields = issue.fields;
                        const issueUrl = `${config.instanceUrl.replace(/\/$/, '')}/browse/${issue.key || issue.id}`;
                        // Формируем ссылку для Lab: dt-{issue-key}.labs.datatile.eu
                        const labUrl = issue.key 
                            ? `https://${issue.key.toLowerCase()}.labs.datatile.eu`
                            : null;
                        
                        return (
                            <div
                                key={issue.id}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    transition: 'box-shadow 0.2s',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                                onClick={() => {
                                    window.open(issueUrl, '_blank');
                                }}
                            >
                                {/* Кнопка Lab в правом верхнем углу */}
                                {labUrl && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(labUrl, '_blank');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            padding: '6px 12px',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#45a049';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#4caf50';
                                        }}
                                    >
                                        Lab
                                    </button>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            {issue.key && (
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    color: '#1976d2',
                                                    fontSize: '16px',
                                                }}>
                                                    {issue.key}
                                                </span>
                                            )}
                                            <h3 style={{
                                                margin: 0,
                                                fontSize: '18px',
                                                color: '#333',
                                                fontWeight: 'normal',
                                            }}>
                                                {fields.summary || 'No summary'}
                                            </h3>
                                        </div>
                                        {fields.description && (
                                            <p style={{
                                                margin: '8px 0 0 0',
                                                color: '#666',
                                                fontSize: '14px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}>
                                                {typeof fields.description === 'string' 
                                                    ? fields.description.replace(/<[^>]*>/g, '').substring(0, 150)
                                                    : String(fields.description).substring(0, 150)}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexWrap: 'wrap', justifyContent: 'flex-end', paddingRight: labUrl ? '60px' : '0' }}>
                                        {fields.status && fields.status.statusCategory && (
                                            <span
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: getStatusColor(fields.status.statusCategory.colorName),
                                                    color: 'white',
                                                }}
                                            >
                                                {fields.status.name || 'Unknown'}
                                            </span>
                                        )}
                                        {fields.priority && (
                                            <span
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: getPriorityColor(fields.priority.name),
                                                    color: 'white',
                                                }}
                                            >
                                                {fields.priority.name || 'Unknown'}
                                            </span>
                                        )}
                                        {fields.issuetype && (
                                            <span
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                }}
                                            >
                                                {fields.issuetype.name || 'Unknown'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    color: '#666',
                                    paddingTop: '8px',
                                    borderTop: '1px solid #f0f0f0',
                                }}>
                                    <div>
                                        {fields.assignee && fields.assignee.avatarUrls && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <img
                                                    src={fields.assignee.avatarUrls['24x24']}
                                                    alt={fields.assignee.displayName || 'Assignee'}
                                                    style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                                                />
                                                {fields.assignee.displayName || 'Unassigned'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        {fields.updated && (
                                            <span style={{ marginRight: '16px' }}>
                                                Updated: {new Date(fields.updated).toLocaleDateString()}
                                            </span>
                                        )}
                                        {fields.created && (
                                            <span>
                                                Created: {new Date(fields.created).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function JiraSettings({ onSave, initialConfig }: { onSave: (config: JiraConfig) => void; initialConfig: JiraConfig | null }) {
    const [instanceUrl, setInstanceUrl] = useState(initialConfig?.instanceUrl || '');
    const [email, setEmail] = useState(initialConfig?.email || '');
    const [apiToken, setApiToken] = useState(initialConfig?.apiToken || '');

    const handleSave = () => {
        if (instanceUrl && email && apiToken) {
            // Убираем trailing slash
            const cleanUrl = instanceUrl.replace(/\/$/, '');
            onSave({ instanceUrl: cleanUrl, email, apiToken });
        } else {
            alert('Please fill in all fields');
        }
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '600px',
            margin: '40px auto',
            padding: '30px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white',
        }}>
            <h1 style={{ marginTop: 0, color: '#333' }}>Jira Settings</h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
                Configure your Jira credentials to fetch issues. You can create an API token at{' '}
                <a href="https://id.atlassian.com/manage/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                    id.atlassian.com/manage/api-tokens
                </a>
            </p>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Jira Instance URL:
                </label>
                <input
                    type="text"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                    placeholder="https://your-company.atlassian.net"
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                    }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Your Jira instance URL (e.g., https://your-company.atlassian.net)
                </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Email:
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                    }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Your Jira account email address
                </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    API Token:
                </label>
                <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="your-api-token"
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                    }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Create an API token at{' '}
                    <a href="https://id.atlassian.com/manage/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                        id.atlassian.com/manage/api-tokens
                    </a>
                </p>
            </div>

            <button
                onClick={handleSave}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                Save Settings
            </button>
        </div>
    );
}

export default JiraIssues;

