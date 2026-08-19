const membersTableBody = document.getElementById("membersTableBody");
const searchInput = document.getElementById("searchInput");

const memberForm = document.getElementById("memberForm");

const memberModal = new bootstrap.Modal(document.getElementById("memberModal"));

const modalTitle = document.getElementById("modalTitle");
const memberId = document.getElementById("memberId");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");

const messageModal = new bootstrap.Modal(document.getElementById("messageModal"));

const messageModalIcon = document.getElementById("messageModalIcon");

const messageModalTitle = document.getElementById("messageModalTitle");

const messageModalText = document.getElementById("messageModalText");

function showMessage(title, message, type = "success") {
  messageModalTitle.textContent = title;
  messageModalText.textContent = message;

  if (type === "success") {
    messageModalIcon.className = "message-modal-icon";

    messageModalIcon.innerHTML = `<i class="bi bi-check-lg"></i>`;
  } else {
    messageModalIcon.className = "message-modal-icon message-error-icon";

    messageModalIcon.innerHTML = `<i class="bi bi-exclamation-lg"></i>`;
  }

  messageModal.show();
}

const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let members = [];

async function loadMembers() {
  try {
    const response = await fetch("/api/members");

    members = await response.json();

    displayMembers(members);
  } catch (error) {
    console.error("Error loading members:", error);
  }
}

async function editMember(id) {
  const member = members.find((member) => member.member_id === id);

  if (!member) {
    showMessage("Member not found");
    return;
  }

  modalTitle.textContent = "Edit Member";

  memberId.value = member.member_id;
  nameInput.value = member.name;
  phoneInput.value = member.phone || "";
  addressInput.value = member.address || "";

  memberModal.show();
}

function deleteMember(id) {
  confirmDeleteBtn.onclick = async () => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        confirmModal.hide();

        showMessage("Delete Failed", data.error || "Unable to delete the member.", "error");

        return;
      }

      confirmModal.hide();

      await loadMembers();

      showMessage("Member Deleted", "The member was deleted successfully.");
    } catch (error) {
      console.error("Error deleting member:", error);

      confirmModal.hide();

      showMessage("Connection Error", "Unable to connect to the server.", "error");
    }
  };

  confirmModal.show();
}

function displayMembers(memberList) {
  membersTableBody.innerHTML = "";

  if (memberList.length === 0) {
    membersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No members found.
                </td>
            </tr>
        `;

    return;
  }

  memberList.forEach((member) => {
    const row = document.createElement("tr");

    const displayId = `MEM-${String(member.member_id).padStart(3, "0")}`;

    row.innerHTML = `
    <td>
        <strong>${displayId}</strong>
    </td>

    <td>
        ${member.name}
    </td>

    <td>
        ${member.phone || "-"}
    </td>

    <td>
        ${member.address || "-"}
    </td>

    <td class="text-end">

        <div class="action-buttons">

            <button
                class="btn table-action edit-action"
                onclick="editMember(${member.member_id})"
                title="Edit member"
            >
                <i class="bi bi-pencil"></i>
                Edit
            </button>

            <button
                class="btn table-action delete-action"
                onclick="deleteMember(${member.member_id})"
                title="Delete member"
            >
                <i class="bi bi-trash3"></i>
                Delete
            </button>

        </div>

    </td>
`;

    membersTableBody.appendChild(row);
  });
}

memberForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = memberId.value;

  const memberData = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    address: addressInput.value.trim(),
  };

  try {
    const url = id ? `/api/members/${id}` : "/api/members";

    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Failed to save member");
      return;
    }

    memberForm.reset();
    memberId.value = "";

    modalTitle.textContent = "Add Member";

    memberModal.hide();

    await loadMembers();

    showMessage(id ? "Member updated successfully!" : "Member added successfully!");
  } catch (error) {
    console.error("Error saving member:", error);
    showMessage("Unable to connect to the server.");
  }
});

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredMembers = members.filter((member) => {
    const memberId = String(member.member_id);

    const displayId = `mem-${memberId.padStart(3, "0")}`;

    return (
      memberId.includes(searchTerm) ||
      displayId.includes(searchTerm) ||
      member.name.toLowerCase().includes(searchTerm) ||
      (member.address || "").toLowerCase().includes(searchTerm)
    );
  });

  displayMembers(filteredMembers);
});

function openAddMemberModal() {
  memberForm.reset();
  memberId.value = "";

  modalTitle.textContent = "Add Member";
}

loadMembers();
