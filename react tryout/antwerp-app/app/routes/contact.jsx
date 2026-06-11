import { Form, useFetcher } from "react-router";
import { getContact, updateContact } from "../data";

export async function loader({ params }) {
  const contactData = await getContact(params.contactId);
  if (!contactData) {
    throw new Response("Not Found", { status: 404 });
  }
  // Safely extract from array if needed
  const contact = Array.isArray(contactData) ? contactData[0] : contactData;
  return { contact };
}

export async function action({ params, request }) {
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
}

export default function Contact({ loaderData }) {
  const contact = Array.isArray(loaderData.contact) ? loaderData.contact[0] : loaderData.contact;

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first || ""} ${contact.last || ""} avatar`}
          key={contact.avatar || ""}
          src={
            contact.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              (contact.first || "") + " " + (contact.last || "")
            )}`
          }
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`} target="_blank" rel="noopener noreferrer">
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }) {
  const fetcher = useFetcher();
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "true" : "false"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
