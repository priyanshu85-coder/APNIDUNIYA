import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaUserAstronaut } from "react-icons/fa";

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
            [e.target.name]: e.target.value,
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
            <div className="formHeader">
                <span className="formIcon">
                    <FaUserAstronaut />
                </span>
                <div>
                    <span className="eyebrow">{editingCharacter ? "Update persona" : "Create persona"}</span>
                    <h2>{editingCharacter ? "Edit Character" : "New Character Form"}</h2>
                    <p>Fill in the details that shape how this AI character thinks, speaks, and responds.</p>
                </div>
            </div>

            <div className="formGrid">
                <label>
                    Name
                    <input name="name" placeholder="e.g. Aarya" value={form.name} onChange={handleChange} required />
                </label>

                <label>
                    Gender
                    <select name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                    </select>
                </label>

                <label>
                    Age
                    <input
                        name="age"
                        type="number"
                        min="0"
                        placeholder="e.g. 24"
                        value={form.age}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Relationship
                    <input
                        name="relationship"
                        placeholder="e.g. mentor, friend, guide"
                        value={form.relationship}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <label>
                Personality
                <textarea
                    name="personality"
                    placeholder="Describe tone, values, habits, and emotional style."
                    value={form.personality}
                    onChange={handleChange}
                />
            </label>

            <label>
                Rules
                <textarea
                    name="rules"
                    placeholder="What should this character always do or avoid?"
                    value={form.rules}
                    onChange={handleChange}
                />
            </label>

            <label>
                Example Conversation
                <textarea
                    name="example"
                    placeholder="User: I feel stuck. Character: Let us slow down and find one small step."
                    value={form.example}
                    onChange={handleChange}
                />
            </label>

            <div className="formActions">
                <button type="submit">
                    <FaCheck />
                    {editingCharacter ? "Save Changes" : "Create Character"}
                </button>

                <button type="button" onClick={cancelEdit}>
                    <FaTimes />
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default CharacterForm;
