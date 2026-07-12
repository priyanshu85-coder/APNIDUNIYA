import { useEffect, useState } from "react";

import "./CharacterForm.css";

const emptyForm = {
    name: "",
    gender: "",
    age: "",
    personality: "",
    relationship: "",
    rules: "",
    example: "",
};

function CharacterForm({ addCharacter, editCharacter, editingCharacter, cancelEdit }) {
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (editingCharacter) {
            setForm({
                ...editingCharacter,
                age: editingCharacter.age ?? "",
            });
        } else {
            setForm(emptyForm);
        }
    }, [editingCharacter]);

    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    }

    function submit(e) {
        e.preventDefault();

        const payload = {
            ...form,
            age: Number(form.age) || 0,
        };

        if (editingCharacter) {
            editCharacter(payload);
        } else {
            addCharacter(payload);
        }
    }

    return (

        <form className="characterForm" onSubmit={submit}>

            <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
            />

            <input
                name="gender"
                placeholder="Gender"
                value={form.gender}
                onChange={handleChange}
            />

            <input
                name="age"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
            />


            <textarea
                name="personality"
                placeholder="Personality"
                value={form.personality}
                onChange={handleChange}
            />

        


            <textarea
                name="relationship"
                placeholder="Relationship"
                value={form.relationship}
                onChange={handleChange}
            />

            <textarea
                name="rules"
                placeholder="Rules"
                value={form.rules}
                onChange={handleChange}
            />

            <textarea
                name="example"
                placeholder="Example Conversation"
                value={form.example}
                onChange={handleChange}
            />

            <button type="submit">
                {editingCharacter ? "Save Changes" : "Create Character"}
            </button>

            {editingCharacter && (
                <button type="button" onClick={cancelEdit}>
                    Cancel
                </button>
            )}

        </form>

    );

}

export default CharacterForm;