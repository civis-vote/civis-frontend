import gql from 'graphql-tag';

export const LoginMutation = gql`
  mutation LoginMutation($auth: Login!) {
    authLogin(auth: $auth) {
      accessToken
      expiresAt
    }
  }
`;
