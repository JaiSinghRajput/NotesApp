import { Category } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, "Name is required");

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const isExists = await Category.findOne({ slug });
    if (isExists) throw new ApiError(409, "Category already exists");

    const category = await Category.create({ name, slug, description });
    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found");

    if (name) {
        category.name = name;
        category.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    if (description) category.description = description;

    await category.save();
    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});

export {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
