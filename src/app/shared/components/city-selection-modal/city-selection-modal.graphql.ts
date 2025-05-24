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

export const CURRENT_USER_UPDATE_MUTATION = gql`
  mutation currentUserUpdate($user: CurrentUserUpdateInput!) {
    currentUserUpdate(user: $user) {
      email
      id
      firstName
      lastName
      phoneNumber
      city {
        id
        locationType
        name
        parent {
          id
          name
        }
      }
    }
  }
`;
