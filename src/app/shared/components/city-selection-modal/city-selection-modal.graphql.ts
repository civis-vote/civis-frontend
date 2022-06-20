import gql from 'graphql-tag';

export const CitiesSearchQuery = gql`
query locationAutocomplete($q: String, $type: String, $isInternationalCity: Boolean) {
  locationAutocomplete(q: $q, type: $type, isInternationalCity: $isInternationalCity){
			name
			 id
			 locationType
		 }
	}
`;

export const UpdateCity = gql`
  mutation currentUserUpdate($user: CurrentUserUpdateInput!) {
    currentUserUpdate(user: $user) {
      id
      city {
        id
        name
        parent {
          id
          name
        }
      }
    }
  }
`;
