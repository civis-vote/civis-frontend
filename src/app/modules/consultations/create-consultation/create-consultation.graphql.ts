import gql from 'graphql-tag';

export const DepartmentAutocompleteQuery = gql`
    query departmentAutocomplete ($q: String) {
        departmentAutocomplete (q: $q) {
            name
            id
            level
        }
    }
`

export const CreateConsultationMutation = gql`
    mutation consultationCreate($consultation: ConsultationCreateInput!) {
        consultationCreate(consultation: $consultation) {
        id
        createdBy {
            firstName
        }
        }
    }
`

export const DepartmentCreateMutation = gql `
    mutation departmentCreate($department: Create!) {
        departmentCreate(department: $department) {
            id
            name
            level
            logo {
                url
            }
        }
    }
`

export const ConstantForTypeQuery = gql`
    query constantForType($constantType: String){
        constantForType(constantType: $constantType){
        id
        name
        }
    }
`;

export const ThemeListQuery = gql`
query themeList($sort: ThemeSort, $sortDirection: SortDirections){
    themeList(sort: $sort, sortDirection: $sortDirection){
        data {
            id
            name
            coverPhoto {
                filename
                url
            }
        }
        paging {
            totalItems
        }
    }
}
`;
