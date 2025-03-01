import React from "react";
import ApolloClient from "apollo-client";
import { useI18N } from "@webiny/app-i18n/hooks/useI18N";
import { CircularProgress } from "@webiny/ui/Progress";
import { config as appConfig } from "@webiny/app/config";
import { CmsContentEntry, CmsErrorResponse, CmsModel } from "~/types";
import {
    CmsEntryPublishMutationResponse,
    CmsEntryPublishMutationVariables,
    createReadQuery,
    createCreateMutation,
    createCreateFromMutation,
    createUpdateMutation,
    createDeleteMutation,
    createPublishMutation,
    createUnpublishMutation,
    CmsEntryCreateMutationResponse,
    CmsEntryCreateMutationVariables,
    CmsEntryUpdateMutationResponse,
    CmsEntryUpdateMutationVariables,
    CmsEntryDeleteMutationResponse,
    CmsEntryDeleteMutationVariables,
    CmsEntryUnpublishMutationResponse,
    CmsEntryUnpublishMutationVariables,
    CmsEntryCreateFromMutationResponse,
    CmsEntryCreateFromMutationVariables,
    CmsEntryGetQueryResponse,
    CmsEntryGetQueryVariables
} from "@webiny/app-headless-cms-common";
import { getFetchPolicy } from "~/utils/getFetchPolicy";

interface EntryError {
    message: string;
    code?: string;
    data?: Record<string, any>;
}

interface OperationSuccess {
    entry: CmsContentEntry;
    error?: never;
}

interface OperationError {
    entry?: never;
    error: EntryError;
}

export type PartialCmsContentEntryWithId = Partial<CmsContentEntry> & { id: string };
export type GetEntryResponse = OperationSuccess | OperationError;
export type CreateEntryResponse = OperationSuccess | OperationError;
export type CreateEntryRevisionFromResponse = OperationSuccess | OperationError;
export type UpdateEntryRevisionResponse = OperationSuccess | OperationError;
export type DeleteEntryResponse = boolean | OperationError;
export type PublishEntryRevisionResponse = OperationSuccess | OperationError;
export type UnpublishEntryRevisionResponse = OperationSuccess | OperationError;

export interface CreateEntryParams {
    model: CmsModel;
    entry: PartialCmsContentEntryWithId;
    options?: {
        skipValidators?: string[];
    };
}

export interface CreateEntryRevisionFromParams {
    model: CmsModel;
    id: string;
    input?: Record<string, any>;
    options?: {
        skipValidators?: string[];
    };
}

export interface UpdateEntryRevisionParams {
    model: CmsModel;
    entry: PartialCmsContentEntryWithId;
    options?: {
        skipValidators?: string[];
    };
}

export interface PublishEntryRevisionParams {
    model: CmsModel;
    id: string;
}
export interface DeleteEntryParams {
    model: CmsModel;
    id: string;
}

export interface UnpublishEntryRevisionParams {
    model: CmsModel;
    id: string;
}

export interface GetEntryParams {
    model: CmsModel;
    id: string;
}

export interface CmsContext {
    getApolloClient(locale: string): ApolloClient<any>;
    createApolloClient: CmsProviderProps["createApolloClient"];
    apolloClient: ApolloClient<any>;
    getEntry: (params: GetEntryParams) => Promise<GetEntryResponse>;
    createEntry: (params: CreateEntryParams) => Promise<CreateEntryResponse>;
    createEntryRevisionFrom: (
        params: CreateEntryRevisionFromParams
    ) => Promise<CreateEntryRevisionFromResponse>;
    updateEntryRevision: (
        params: UpdateEntryRevisionParams
    ) => Promise<UpdateEntryRevisionResponse>;
    publishEntryRevision: (
        params: PublishEntryRevisionParams
    ) => Promise<PublishEntryRevisionResponse>;
    unpublishEntryRevision: (
        params: UnpublishEntryRevisionParams
    ) => Promise<UnpublishEntryRevisionResponse>;
    deleteEntry: (params: DeleteEntryParams) => Promise<DeleteEntryResponse>;
}

export const CmsContext = React.createContext<CmsContext | undefined>(undefined);

interface ApolloClientsCache {
    [locale: string]: ApolloClient<any>;
}

const apolloClientsCache: ApolloClientsCache = {};

export interface CmsProviderProps {
    createApolloClient: (params: { uri: string }) => ApolloClient<any>;
    children: React.ReactNode;
}

export const CmsProvider = (props: CmsProviderProps) => {
    const apiUrl = appConfig.getKey("API_URL", process.env.REACT_APP_API_URL);
    const { getCurrentLocale } = useI18N();

    const currentLocale = getCurrentLocale("content");

    if (currentLocale && !apolloClientsCache[currentLocale]) {
        apolloClientsCache[currentLocale] = props.createApolloClient({
            uri: `${apiUrl}/cms/manage/${currentLocale}`
        });
    }

    if (!currentLocale) {
        return <CircularProgress />;
    }

    const getApolloClient = (locale: string) => {
        if (!apolloClientsCache[locale]) {
            apolloClientsCache[locale] = props.createApolloClient({
                uri: `${apiUrl}/cms/manage/${locale}`
            });
        }
        return apolloClientsCache[locale];
    };

    const value: CmsContext = {
        getApolloClient,
        createApolloClient: props.createApolloClient,
        apolloClient: getApolloClient(currentLocale),
        getEntry: async ({ model, id }) => {
            const query = createReadQuery(model);
            const isRevisionId = id.includes("#");

            const response = await value.apolloClient.query<
                CmsEntryGetQueryResponse,
                CmsEntryGetQueryVariables
            >({
                query,
                variables: isRevisionId ? { revision: id } : { entryId: id },
                fetchPolicy: getFetchPolicy(model)
            });

            if (!response.data) {
                return {
                    error: {
                        message: "Missing response data on Get Entry query.",
                        code: "MISSING_RESPONSE_DATA",
                        data: {}
                    }
                };
            }

            const { data, error } = response.data.content;

            if (error) {
                return { error };
            }

            return {
                entry: data as CmsContentEntry
            };
        },
        createEntry: async ({ model, entry, options }) => {
            const mutation = createCreateMutation(model);
            const response = await value.apolloClient.mutate<
                CmsEntryCreateMutationResponse,
                CmsEntryCreateMutationVariables
            >({
                mutation,
                variables: {
                    data: entry,
                    options
                },
                fetchPolicy: getFetchPolicy(model)
            });

            if (!response.data) {
                return {
                    error: {
                        message: "Missing response data on Create Entry mutation.",
                        code: "MISSING_RESPONSE_DATA",
                        data: {}
                    }
                };
            }

            const { data, error } = response.data.content;

            if (error) {
                return { error };
            }

            return {
                entry: data as CmsContentEntry
            };
        },
        createEntryRevisionFrom: async ({ model, id, input, options }) => {
            const mutation = createCreateFromMutation(model);
            const response = await value.apolloClient.mutate<
                CmsEntryCreateFromMutationResponse,
                CmsEntryCreateFromMutationVariables
            >({
                mutation,
                variables: {
                    revision: id,
                    data: input,
                    options
                },
                fetchPolicy: getFetchPolicy(model)
            });

            if (!response.data) {
                return {
                    error: {
                        message: "Missing response data on Create Entry mutation.",
                        code: "MISSING_RESPONSE_DATA",
                        data: {}
                    }
                };
            }

            const { data, error } = response.data.content;

            if (error) {
                return { error };
            }

            return {
                entry: data as CmsContentEntry
            };
        },
        updateEntryRevision: async ({ model, entry, options }) => {
            const mutation = createUpdateMutation(model);
            const { id, ...input } = entry;
            const response = await value.apolloClient.mutate<
                CmsEntryUpdateMutationResponse,
                CmsEntryUpdateMutationVariables
            >({
                mutation,
                variables: {
                    revision: id,
                    data: input,
                    options
                },
                fetchPolicy: getFetchPolicy(model)
            });

            if (!response.data) {
                return {
                    error: {
                        message: "Missing response data on Update Entry mutation.",
                        code: "MISSING_RESPONSE_DATA",
                        data: {}
                    }
                };
            }

            const { data, error } = response.data.content;

            if (error) {
                return { error };
            }

            return {
                entry: data as CmsContentEntry
            };
        },
        publishEntryRevision: async ({ model, id }) => {
            const mutation = createPublishMutation(model);
            const response = await value.apolloClient.mutate<
                CmsEntryPublishMutationResponse,
                CmsEntryPublishMutationVariables
            >({
                mutation,
                variables: {
                    revision: id
                }
            });

            if (!response.data) {
                const error: CmsErrorResponse = {
                    message: "Missing response data on Publish Entry mutation.",
                    code: "MISSING_RESPONSE_DATA",
                    data: {}
                };
                return { error };
            }

            const { data, error } = response.data.content;

            if (error) {
                return { error };
            }

            return {
                entry: data as CmsContentEntry
            };
        },
        unpublishEntryRevision: async ({ model, id }) => {
            const mutation = createUnpublishMutation(model);

            const response = await value.apolloClient.mutate<
                CmsEntryUnpublishMutationResponse,
                CmsEntryUnpublishMutationVariables
            >({
                mutation,
                variables: {
                    revision: id
                }
            });

            if (!response.data) {
                return {
                    error: {
                        message: "Missing response data on Unpublish Entry mutation.",
                        code: "MISSING_RESPONSE_DATA",
                        data: {}
                    }
                };
            }
            const { data, error } = response.data.content;
            if (error) {
                return {
                    error
                };
            }

            return {
                entry: data as CmsContentEntry
            };
        },
        deleteEntry: async ({ model, id }) => {
            const mutation = createDeleteMutation(model);
            const response = await value.apolloClient.mutate<
                CmsEntryDeleteMutationResponse,
                CmsEntryDeleteMutationVariables
            >({
                mutation,
                variables: {
                    revision: id,
                    permanently: false
                }
            });

            if (!response.data) {
                const error: CmsErrorResponse = {
                    message: "Missing response data on Delete Entry mutation.",
                    code: "MISSING_RESPONSE_DATA",
                    data: {}
                };
                return { error };
            }

            const { error } = response.data.content;

            if (error) {
                return { error };
            }

            return true;
        }
    };

    return <CmsContext.Provider value={value} {...props} />;
};
