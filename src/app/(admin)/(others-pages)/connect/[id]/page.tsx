import { useParams } from "next/navigation";

const InstancePage = () => {
  const { id } = useParams(); // Get the dynamic ID from the URL

  return (
    <div>
      <h1>Instance Details</h1>
      <p>Instance ID: {id}</p>
    </div>
  );
};

export default InstancePage;
