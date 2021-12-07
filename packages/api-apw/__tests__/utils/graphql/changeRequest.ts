const ERROR_FIELDS = `{
    message
    code
    data
}`;

const getDataFields = (fields = "") => `{
    id
    createdOn
    savedOn
    createdBy {
        id
        displayName
        type
    }
    step
    body
    title
    media
    resolved
    ${fields}
}`;

export const GET_CHANGE_REQUEST_QUERY = /* GraphQL */ `
    query GetChangeRequest($id: ID!) {
        advancedPublishingWorkflow {
            getChangeRequest(id: $id) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
            }
        }
    }
`;

export const LIST_CHANGES_REQUESTED_QUERY = /* GraphQL */ `
    query ListChangeRequests(
        $where: ApwListChangeRequestWhereInput,
        $limit: Int,
        $after: String,
        $sort: [ApwListChangeRequestSort!],
        $search: ApwListChangeRequestSearchInput
    ) {
        advancedPublishingWorkflow {
            listChangeRequests(
                where: $where,
                limit: $limit,
                after: $after,
                sort: $sort,
                search: $search
            ) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
                meta {
                    hasMoreItems
                    totalCount
                    cursor
                }
            }
        }
    }
`;

export const CREATE_CHANGE_REQUEST_MUTATION = /* GraphQL */ `
    mutation CreateChangeRequestMutation($data: ApwCreateChangeRequestInput!) {
        advancedPublishingWorkflow {
            createChangeRequest(data: $data) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
            }
        }
    }
`;

export const UPDATE_CHANGE_REQUEST_MUTATION = /* GraphQL */ `
    mutation UpdateChangeRequestMutation($id: ID!, $data: ApwUpdateChangeRequestInput!) {
        advancedPublishingWorkflow {
            updateChangeRequest(id: $id, data: $data) {
                data ${getDataFields()}
                error ${ERROR_FIELDS}
            }
        }
    }
`;

export const DELETE_CHANGE_REQUEST_MUTATION = /* GraphQL */ `
    mutation DeleteChangeRequestMutation($id: ID!) {
        advancedPublishingWorkflow {
            deleteChangeRequest(id: $id) {
                data
                error ${ERROR_FIELDS}
            }
        }
    }
`;
