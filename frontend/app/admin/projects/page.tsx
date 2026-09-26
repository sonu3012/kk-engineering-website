"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

type Project = {
  id: number;
  name: string;
  location: string;
  service: string;
  description: string;
  image_url: string;
  status: string;
  created_at: string;
};

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    service: "",
    description: "",
    image_url: "",
    status: "Completed",
  });


  // ==========================================
  // LOGIN CHECK
  // ==========================================

  useEffect(() => {

    const loggedIn =
      localStorage.getItem("adminLoggedIn");

    if (loggedIn !== "true") {

      router.push("/admin/login");

      return;
    }

    fetchProjects();

  }, [router]);


  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  async function fetchProjects() {

    try {

      const response = await fetch(
        `${API_URL}/api/projects`
      );

      const result = await response.json();

      if (result.success) {

        setProjects(result.data);
      }

    } catch (error) {

      console.error(
        "Error fetching projects:",
        error
      );

    } finally {

      setLoading(false);
    }
  }


  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {

    setForm({

      ...form,

      [e.target.name]: e.target.value
    });
  }


  // ==========================================
  // IMAGE SELECT
  // ==========================================

  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      e.target.files?.[0];

    if (!file) {

      return;
    }


    // Check file type

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

      alert(
        "Please select JPG, JPEG, PNG or WEBP image."
      );

      return;
    }


    // Check file size

    if (file.size > 5 * 1024 * 1024) {

      alert(
        "Image size must be less than 5 MB."
      );

      return;
    }


    setSelectedFile(file);


    // Preview

    const preview =
      URL.createObjectURL(file);

    setPreviewUrl(preview);
  }


  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  async function uploadImage() {

    if (!selectedFile) {

      return form.image_url;
    }


    setUploadingImage(true);


    try {

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );


      const response = await fetch(
        `${API_URL}/api/upload-project-image`,
        {
          method: "POST",
          body: formData,
        }
      );


      const result =
        await response.json();


      if (!result.success) {

        alert(
          result.message ||
          "Image upload failed."
        );

        return null;
      }


      return result.image_url;

    } catch (error) {

      console.error(
        "Image upload error:",
        error
      );

      alert(
        "Unable to upload image."
      );

      return null;

    } finally {

      setUploadingImage(false);
    }
  }


  // ==========================================
  // RESET FORM
  // ==========================================

  function resetForm() {

    setForm({

      name: "",
      location: "",
      service: "",
      description: "",
      image_url: "",
      status: "Completed",
    });

    setSelectedFile(null);

    setPreviewUrl("");

    setEditingId(null);
  }


  // ==========================================
  // SAVE PROJECT
  // ==========================================

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();


    if (!form.name.trim()) {

      alert("Please enter project name.");

      return;
    }


    if (!form.location.trim()) {

      alert("Please enter project location.");

      return;
    }


    if (!form.service.trim()) {

      alert("Please enter project service.");

      return;
    }


    if (!form.description.trim()) {

      alert("Please enter project description.");

      return;
    }


    setSaving(true);


    try {

      // Upload image first

      let imageUrl = form.image_url;


      if (selectedFile) {

        const uploadedUrl =
          await uploadImage();


        if (!uploadedUrl) {

          setSaving(false);

          return;
        }


        imageUrl = uploadedUrl;
      }


      const payload = {

        name: form.name,

        location: form.location,

        service: form.service,

        description: form.description,

        image_url: imageUrl,

        status: form.status,
      };


      let response;


      if (editingId) {

        response = await fetch(

          `${API_URL}/api/projects/${editingId}`,

          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(payload),
          }
        );

      } else {

        response = await fetch(

          `${API_URL}/api/projects`,

          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(payload),
          }
        );
      }


      const result =
        await response.json();


      if (!result.success) {

        alert(
          result.message ||
          "Something went wrong."
        );

        return;
      }


      alert(
        editingId
          ? "Project updated successfully!"
          : "Project added successfully!"
      );


      resetForm();

      fetchProjects();

    } catch (error) {

      console.error(
        "Save project error:",
        error
      );

      alert(
        "Unable to save project."
      );

    } finally {

      setSaving(false);
    }
  }


  // ==========================================
  // EDIT PROJECT
  // ==========================================

  function handleEdit(project: Project) {

    setEditingId(project.id);


    setForm({

      name: project.name,

      location: project.location,

      service: project.service,

      description: project.description,

      image_url: project.image_url || "",

      status: project.status,
    });


    setSelectedFile(null);


    if (project.image_url) {

      setPreviewUrl(
        `${API_URL}${project.image_url}`
      );

    } else {

      setPreviewUrl("");
    }


    window.scrollTo({

      top: 0,

      behavior: "smooth"
    });
  }


  // ==========================================
  // DELETE PROJECT
  // ==========================================

  async function handleDelete(
    projectId: number
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );


    if (!confirmed) {

      return;
    }


    try {

      const response =
        await fetch(

          `${API_URL}/api/projects/${projectId}`,

          {
            method: "DELETE",
          }
        );


      const result =
        await response.json();


      if (result.success) {

        alert(
          "Project deleted successfully!"
        );

        fetchProjects();

      } else {

        alert(
          result.message ||
          "Unable to delete project."
        );
      }

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        "Unable to delete project."
      );
    }
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  function logout() {

    localStorage.removeItem(
      "adminLoggedIn"
    );

    router.push("/admin/login");
  }


  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProjects =
    projects.filter((project) => {

      const searchText =
        search.toLowerCase();


      return (

        project.name
          .toLowerCase()
          .includes(searchText)

        ||

        project.location
          .toLowerCase()
          .includes(searchText)

        ||

        project.service
          .toLowerCase()
          .includes(searchText)

      );

    });


  // ==========================================
  // IMAGE URL HELPER
  // ==========================================

  function getImageUrl(
    imageUrl: string
  ) {

    if (!imageUrl) {

      return "";
    }


    if (
      imageUrl.startsWith("http")
    ) {

      return imageUrl;
    }


    return `${API_URL}${imageUrl}`;
  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-slate-950 text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <h1 className="text-2xl font-bold">
              KK Engineering
            </h1>

            <p className="text-sm text-slate-400">
              Project Management
            </p>

          </div>


          <div className="flex gap-3">

            <button

              onClick={() =>
                router.push("/admin")
              }

              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Dashboard
            </button>


            <button

              onClick={logout}

              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-10">


        {/* FORM CARD */}

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-900">

              {editingId
                ? "Edit Project"
                : "Add New Project"}

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Add project information and upload
              a project image.

            </p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="grid gap-6 md:grid-cols-2"
          >


            {/* PROJECT NAME */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">

                Project Name

              </label>

              <input

                type="text"

                name="name"

                value={form.name}

                onChange={handleChange}

                placeholder="Example: Commercial HVAC Installation"

                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"

              />

            </div>


            {/* LOCATION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">

                Location

              </label>

              <input

                type="text"

                name="location"

                value={form.location}

                onChange={handleChange}

                placeholder="Example: Pune"

                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"

              />

            </div>


            {/* SERVICE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">

                Service

              </label>

              <input

                type="text"

                name="service"

                value={form.service}

                onChange={handleChange}

                placeholder="Example: HVAC Ducting"

                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"

              />

            </div>


            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">

                Status

              </label>

              <select

                name="status"

                value={form.status}

                onChange={handleChange}

                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"

              >

                <option value="Completed">
                  Completed
                </option>

                <option value="Ongoing">
                  Ongoing
                </option>

                <option value="Upcoming">
                  Upcoming
                </option>

              </select>

            </div>


            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">

                Description

              </label>

              <textarea

                name="description"

                value={form.description}

                onChange={handleChange}

                rows={5}

                placeholder="Describe the project and work completed..."

                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"

              />

            </div>


            {/* IMAGE UPLOAD */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">

                Project Image

              </label>


              <input

                type="file"

                accept="image/jpeg,image/jpg,image/png,image/webp"

                onChange={handleImageSelect}

                className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"

              />


              <p className="mt-2 text-xs text-slate-500">

                JPG, JPEG, PNG or WEBP • Maximum 5 MB

              </p>


              {/* IMAGE PREVIEW */}

              {previewUrl && (

                <div className="mt-5">

                  <p className="mb-2 text-sm font-semibold text-slate-700">

                    Image Preview

                  </p>


                  <div className="overflow-hidden rounded-2xl border border-slate-200">

                    <img

                      src={previewUrl}

                      alt="Project preview"

                      className="h-64 w-full object-cover"

                    />

                  </div>

                </div>

              )}

            </div>


            {/* BUTTONS */}

            <div className="flex flex-wrap gap-3 md:col-span-2">

              <button

                type="submit"

                disabled={
                  saving ||
                  uploadingImage
                }

                className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"

              >

                {uploadingImage
                  ? "Uploading Image..."
                  : saving
                  ? "Saving..."
                  : editingId
                  ? "Update Project"
                  : "Add Project"}

              </button>


              {editingId && (

                <button

                  type="button"

                  onClick={resetForm}

                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"

                >

                  Cancel Edit

                </button>

              )}

            </div>

          </form>

        </section>


        {/* PROJECT LIST */}

        <section>


          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">

                All Projects

              </h2>

              <p className="text-sm text-slate-500">

                {projects.length} project
                {projects.length !== 1
                  ? "s"
                  : ""}

              </p>

            </div>


            <input

              type="text"

              value={search}

              onChange={(e) =>
                setSearch(e.target.value)
              }

              placeholder="Search projects..."

              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900 md:w-80"

            />

          </div>


          {/* LOADING */}

          {loading && (

            <div className="rounded-2xl bg-white p-10 text-center">

              <p className="text-slate-500">

                Loading projects...

              </p>

            </div>

          )}


          {/* EMPTY */}

          {!loading &&
            filteredProjects.length === 0 && (

              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                <h3 className="text-lg font-bold text-slate-900">

                  No projects found

                </h3>

                <p className="mt-2 text-sm text-slate-500">

                  Add your first project using
                  the form above.

                </p>

              </div>

            )}


          {/* PROJECT GRID */}

          {!loading &&
            filteredProjects.length > 0 && (

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {filteredProjects.map(
                  (project) => (

                    <article

                      key={project.id}

                      className="overflow-hidden rounded-2xl bg-white shadow-sm"

                    >


                      {/* IMAGE */}

                      {project.image_url ? (

                        <img

                          src={getImageUrl(
                            project.image_url
                          )}

                          alt={project.name}

                          className="h-52 w-full object-cover"

                        />

                      ) : (

                        <div className="flex h-52 items-center justify-center bg-slate-200">

                          <span className="text-sm text-slate-500">

                            No Image

                          </span>

                        </div>

                      )}


                      {/* CONTENT */}

                      <div className="p-5">


                        <div className="mb-3 flex items-start justify-between gap-3">

                          <h3 className="text-lg font-bold text-slate-900">

                            {project.name}

                          </h3>


                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">

                            {project.status}

                          </span>

                        </div>


                        <p className="mb-2 text-sm font-medium text-slate-600">

                          📍 {project.location}

                        </p>


                        <p className="mb-3 text-sm font-semibold text-slate-800">

                          {project.service}

                        </p>


                        <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-500">

                          {project.description}

                        </p>


                        {/* ACTIONS */}

                        <div className="flex gap-3">

                          <button

                            onClick={() =>
                              handleEdit(project)
                            }

                            className="flex-1 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"

                          >

                            Edit

                          </button>


                          <button

                            onClick={() =>
                              handleDelete(
                                project.id
                              )
                            }

                            className="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"

                          >

                            Delete

                          </button>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

        </section>

      </div>

    </main>

  );
}

