const createNote = document.querySelector(".create-note");
const noteColor = document.querySelector(".note-color");
const noteLabel = document.querySelector(".note-label");
const notesHolder = document.querySelector(".notes-holder");
const noteSection = document.querySelector(".note-section");
const noteDescription = document.querySelector(".note-description");
const labelContainer = document.querySelector(".label-container");
const noNotes = document.querySelector(".no-notes");

const colors = [
  "#ffffff",
  "#fe9a37",
  "#cbdb57",
  "#fdcfe8",
  "#fff474",
  "#aecbfa",
  "#ccff90",
  "#f28b82",
  "#e6c9a8",
  "#a7ffeb",
];

let keepMeNotes = JSON.parse(localStorage.getItem("keep-me-notes")) || {
  notes: [],
  labels: [],
};

let initialNote = {
  id: null,
  labels: [],
  description: "",
  color: "#ffffff",
};

function updateStoredNotes() {
  localStorage.setItem("keep-me-notes", JSON.stringify(keepMeNotes));

  if(keepMeNotes.notes.length === 0) {
    noNotes.style.display = "block";
  }
}

function setLabelsInNote(labels) {
  const labelList = [];
  labels.forEach(function (label) {
    const span = document.createElement("span");
    span.className = "label";
    span.innerText = label;
    span.id = label;

    labelList.push(span);
    return labelContainer.appendChild(span);
  });

  return labelContainer.replaceChildren(...labelList);
}

function setNoteForm() {
  const { id, color, labels, description } = initialNote;

  noteDescription.id = id;
  setLabelsInNote(labels);
  noteSection.style.background = color;
  noteDescription.innerHTML = description;
}

function editNoteForm(note) {
  initialNote = { ...initialNote, ...note };
  setNoteForm();
}

function resetNoteForm() {
  initialNote = {
    id: null,
    labels: [],
    description: "",
    color: "#ffffff",
  };
  setNoteForm();
}

function addNotesToDom(note) {
  noNotes.style.display = "none";

  const { id, color, labels, description } = note;
  const noteCard = document.createElement("div");
  noteCard.style.background = color;
  noteCard.className = "note-card";
  noteCard.id = `note-${id}`;

  const noteDescription = document.createElement("div");
  noteDescription.innerHTML = description;
  noteCard.appendChild(noteDescription);

  if (labels.length > 0) {
    const spanContainer = document.createElement("div");
    spanContainer.className = "label-container";

    labels.forEach(function (label) {
      const span = document.createElement("span");
      span.className = "label";
      span.innerText = label;
      spanContainer.appendChild(span);
    });
    noteCard.appendChild(spanContainer);
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "note-delete";
  deleteButton.innerText = "🗑️";
  deleteButton.addEventListener("click", function () {
    deleteNote(note);
  });
  noteCard.appendChild(deleteButton);

  const editButton = document.createElement("button");
  editButton.className = "note-edit";
  editButton.innerText = "✍️";
  editButton.addEventListener("click", function () {
    editNoteForm(note);
  });
  noteCard.appendChild(editButton);

  notesHolder.insertBefore(noteCard, notesHolder.childNodes[0]);
}

function updateNoteDescription(e) {
  initialNote.description = e.target.innerHTML;
}

function updateNoteLabel(e) {
  const { labels } = initialNote;

  if (!e.target.checked) {
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === e.target.value) {
        labels.splice(i, 1);
        i--;
      }
    }
    return setLabelsInNote(labels);
  }

  labels.push(e.target.value);
  return setLabelsInNote(labels);
}

function updateNoteColor(e) {
  initialNote.color = e.target.value;
  setNoteForm();
}

function closePallet(e) {
  const pallet = e.target.querySelector("#pallet");
  if (pallet) pallet.remove();
}

function openColorPallet(e) {
  const pallet = document.createElement("div");
  pallet.id = "pallet";

  colors.forEach(function (color) {
    const button = document.createElement("button");
    button.value = color;
    button.className = "color-button";
    button.style.background = color;
    button.addEventListener("click", updateNoteColor);

    return pallet.appendChild(button);
  });

  e.target.appendChild(pallet);
}

function createLabel(e) {
  keepMeNotes.labels.push(e.target.value);
  initialNote.labels.push(e.target.value);
  updateStoredNotes();

  setLabelsInNote(initialNote.labels);
  document.querySelector("#pallet").remove();
}

function createLabelList(labels) {
  const list = [];
  labels.forEach(function (label) {
    const li = document.createElement("li");

    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.value = label;
    checkboxInput.id = label;
    checkboxInput.checked = initialNote.labels.indexOf(label) > -1;
    checkboxInput.addEventListener("change", updateNoteLabel);

    const checkboxLabel = document.createElement("label");
    checkboxLabel.innerText = label;
    checkboxLabel.htmlFor = label;

    li.appendChild(checkboxInput);
    li.appendChild(checkboxLabel);
    list.push(li);
  });

  return list;
}

function openLabelPallet(e) {
  const { labels } = keepMeNotes;

  const pallet = document.createElement("div");
  pallet.id = "pallet";

  const ul = document.createElement("ul");
  ul.id = "label-list";

  const textInput = document.createElement("input");
  textInput.placeholder = "Search / add label";
  textInput.type = "text";

  textInput.addEventListener("keyup", function (e) {
    const filteredLabels = labels.filter(function (label) {
      return label
        .toLocaleLowerCase()
        .includes(e.target.value.toLocaleLowerCase());
    });

    ul.replaceChildren(...createLabelList(filteredLabels));
    if (filteredLabels.length === 0) {
      const button = document.createElement("button");
      button.innerText = "Create label";
      button.className = "text-button";
      button.value = e.target.value;
      button.addEventListener("click", createLabel);
      document.querySelector("#label-list").appendChild(button);
    }
  });

  pallet.appendChild(textInput);
  ul.replaceChildren(...createLabelList(labels));
  pallet.appendChild(ul);
  e.target.appendChild(pallet);
}

function loadNotes() {
  const { notes } = keepMeNotes;
  if (!notes.length) return;

  notes.forEach(function (note) {
    return addNotesToDom(note);
  });
}

function addNote(note) {
  const { notes } = keepMeNotes;

  note.id = Date.now();
  noteDescription.id = note.id;

  notes.push(note);
  updateStoredNotes();
  addNotesToDom(initialNote);
  resetNoteForm();
}

function deleteNote(note) {
  const { notes } = keepMeNotes;
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === note.id) {
      notes.splice(i, 1);
      i--;
    }
  }

  resetNoteForm();
  updateStoredNotes();
  return document.querySelector(`#note-${note.id}`).remove();
}

function updateNote(note) {
  document.querySelector(`#note-${note.id}`).remove();

  keepMeNotes.notes = keepMeNotes.notes.map(function (oldNote) {
    return oldNote.id === note.id ? { ...oldNote, ...note } : oldNote;
  });

  updateStoredNotes();
  addNotesToDom(note);
  resetNoteForm();
}

noteLabel.addEventListener("mouseenter", openLabelPallet);
noteLabel.addEventListener("mouseleave", closePallet);

noteColor.addEventListener("mouseenter", openColorPallet);
noteColor.addEventListener("mouseleave", closePallet);

noteDescription.addEventListener("keyup", updateNoteDescription);

createNote.addEventListener("click", function () {
  const { id, description } = initialNote;

  if (!description) return;
  if (id) return updateNote(initialNote);

  addNote(initialNote);
});

loadNotes();
