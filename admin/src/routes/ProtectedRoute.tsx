  import React, { memo } from "react";

  import Layout from "../components/layout/Layout";
  import { useAdminAuthQuery } from "../hooks/mutations/useUserProfileMutation";


  const ProtectedRoute: React.FC = () => {
 useAdminAuthQuery();

    return <Layout />;
  };

  export default memo(ProtectedRoute);
