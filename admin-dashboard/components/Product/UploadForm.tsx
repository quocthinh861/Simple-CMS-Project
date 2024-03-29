import React, { useState, useRef } from "react";
import supabase from "../../client/SuperbaseClient";
import { uploadImage } from "../../shared/Utils";

function UploadForm() {
  // Refs
  const fileInputRef = useRef(null);

  // Form fields
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [productPrice, setProductPrice] = useState();
  const [errors, setErrors] = useState({});
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");

  // State to show loading spinner
  const [isUploading, setIsUploading] = useState(false);

  // Define a variable for the button class
  const buttonClass = isUploading
    ? "bg-gray-500 cursor-not-allowed"
    : "bg-blue-500";

  // Defind functions
  const handleSubmit = async (event) => {
    event.preventDefault();
    scrollToTop();

    if (validate()) {
      setIsUploading(true);

      const userConfirmed = window.confirm(
        "Bạn có chắc chắn muốn thêm sản phẩm này không?"
      );
      if (!userConfirmed) return;
      scrollToTop();

      try {
        //Upload images to storage
        const thumbnailImageKey = await uploadImage(thumbnailImage);

        if (thumbnailImageKey === null) {
          alert("Lỗi upload ảnh, vui lòng thử lại!");
          return;
        }

        // Insert product to database
        const product = {
          name: productName,
          description: productDescription,
          thumbnail_image: thumbnailImageKey,
          price: productPrice,
        };

        const { data, error } = await supabase
          .from("products")
          .insert([product]);

        if (error) {
          throw error;
        }

        // Reset form fields
        setProductName("");
        setProductDescription("");
        setThumbnailImage("");
        setProductPrice(undefined);

        alert("Thêm sản phẩm thành công!");
      } catch (error) {
        // Delete uploaded images
        if (thumbnailImage !== null) {
          await supabase.storage.from("images").remove([thumbnailImage]);
        }

        alert("Đã xảy ra lỗi, vui lòng thử lại!");
        console.log("error", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  function scrollToTop() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }

  const removeThumbImage = () => {
    setThumbnailImage("");
    setThumbnailImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    let errors: any = {};

    if (!productName) {
      errors.productName = "Vui lòng nhập tên sản phẩm.";
    }

    if (!productDescription) {
      errors.productDescription = "Vui lòng nhập mô tả sản phẩm.";
    }

    if (!thumbnailImage) {
      errors.thumbnailImage = "Vui lòng chọn ảnh đại diện.";
    }

    if (!productPrice) {
      errors.productPrice = "Vui lòng nhập giá sản phẩm.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <>  
      {
        // Hiển thị lỗi ở đây
        Object.keys(errors).length > 0 && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <button
              className="absolute top-0 right-0 px-2 py-1"
              onClick={() => setErrors({})}
            >
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M14.348 5.652a.999.999 0 00-1.414 0L10 8.586 6.066 4.652a.999.999 0 10-1.414 1.414L8.586 10l-3.934 3.934a.999.999 0 101.414 1.414L10 11.414l3.934 3.934a.999.999 0 101.414-1.414L11.414 10l3.934-3.934a.999.999 0 000-1.414z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                />
              </svg>
            </button>
            <strong className="font-bold">Đã xảy ra lỗi! </strong>
            <span className="block sm:inline">Hãy sửa các lỗi dưới đây:</span>
            <ul className="list-disc list-inside">
              {Object.keys(errors).map((key) => (
                <li key={key}>{errors[key]}</li>
              ))}
            </ul>
          </div>
        )
      }
      {
        // Hiển thị loading spinner
        isUploading && (
          <div className="flex flex-col items-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            <p className="text-gray-700 mt-2">Đang xử lý...</p>
          </div>
        )
      }
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="product-name"
            className="block text-gray-700 font-medium mb-2"
          >
            Tên sản phẩm
          </label>
          <input
            type="text"
            id="product-name"
            name="product-name"
            className="w-full py-2 px-4 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 mt-1"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="product-description"
            className="block text-gray-700 font-medium mb-2"
          >
            Mô tả sản phẩm
          </label>
          <textarea
            id="product-description"
            name="product-description"
            className="w-full py-2 px-4 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 mt-1"
            value={productDescription}
            onChange={(event) => setProductDescription(event.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="thumbnail-image"
            className="block text-gray-700 font-medium mb-2"
          >
            Hình Thumbnail
          </label>
          <input
            type="file"
            id="thumbnail-image"
            name="thumbnail-image"
            accept="image/*"
            ref={fileInputRef}
            className="w-full py-2 px-4 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 mt-1"
            onChange={(event: any) => {
              const file = event.target.files[0];
              setThumbnailImage(file);
              setThumbnailImageUrl(URL.createObjectURL(file));
            }}
          />
          {thumbnailImageUrl && (
            <div className="relative w-48">
              <button
                type="button"
                className="absolute top-0 right-0 mt-2 mr-2 rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center"
                onClick={() => removeThumbImage()}
              >
                X
              </button>
              <img src={thumbnailImageUrl} alt="Thumbnail" className="my-4" />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="product-price"
            className="block text-gray-700 font-medium mb-2"
          >
            Giá tiền
          </label>
          <input
            type="number"
            id="product-price"
            min={0}
            name="product-price"
            className="w-full py-2 px-4 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 mt-1"
            placeholder="Nhập giá bán"
            value={productPrice}
            onChange={(event: any) => setProductPrice(event.target.value)}
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isUploading}
            className={`${buttonClass} text-white rounded-md py-2 px-4 font-medium text-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out`}
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

export default UploadForm;
