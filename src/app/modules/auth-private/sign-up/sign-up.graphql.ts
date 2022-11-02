import gql from 'graphql-tag';

export const SignUpMutation = gql`
	mutation authSignUp($auth: SignUp!){
    authSignUp(auth: $auth){
      accessToken
    }
  }
`;

export const CitiesSearchQuery = gql`
query locationAutocomplete($q: String, $type: String, $isInternationalCity: Boolean) {
  locationAutocomplete(q: $q, type: $type, isInternationalCity: $isInternationalCity){
			name
			 id
			 locationType
		 }
	}
`;

export const LocationListQuery = gql`
query locationList($type: String, $isInternationalCity: Boolean) {
  locationList(type: $type, isInternationalCity: $isInternationalCity){
			name
			 id
			 locationType
		 }
	}
`;


export const AuhtAcceptInviteMutation = gql`
	mutation authAcceptInvite($auth: AcceptInvite!){
		authAcceptInvite(auth: $auth){
      		accessToken
   		}
  	}
`;




