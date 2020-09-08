import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  getAllImages,
  uploadImages,
  deleteImages,
} from "../../../redux/actions";
import "../assets/css/demo.scss";
import { Row, Col, Modal, Upload, Select, Checkbox } from "antd";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const Demo = ({
  getAllImages,
  images,
  uploadImages,
  isUploadSuccess,
  deleteImages,
  ...props
}) => {
  const arrAlbums = ["Travel", "Personal", "Food", "Nature", "Other"];
  const [visible, setVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [valueAlbum, setValueAlbum] = useState("");
  const [listSelectImage, setListSelectImage] = useState([]);
  useEffect(() => {
    getAllImages({ skip: 0, limit: 250 });
  }, []);

  const showModalUpload = () => {
    setVisible(true);
  };

  const handleCancel = (e) => {
    setVisible(false);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCancelReview = () => setPreviewVisible(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewVisible(true);
    setPreviewImage(file.url || file.preview);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
    console.log({ fileList });
  };

  const uploadImage = async () => {
    let fd = new FormData();
    fd.append("album", valueAlbum);
    fileList.map((item) => {
      fd.append("documents", item.originFileObj);
    });
    await uploadImages(fd);
    if (!isUploadSuccess) {
      getAllImages({ skip: 0, limit: 250 });
      setVisible(false);
      setFileList([]);
      setValueAlbum("");
    }
  };

  const uploadButton = (
    <div>
      {/* <PlusOutlined /> */}
      <div style={{ marginTop: 8 }}>
        Drag 'n' drop some files here, or click to select files.
      </div>
    </div>
  );

  const handleChangeAlbums = (value) => {
    setValueAlbum(value);
  };

  const deletePhotos = async () => {
    const arrAlbums = [];
    listSelectImage.map((item) => {
      const data = {
        album: item.album,
        documents: item.name,
      };
      arrAlbums.push(data);
    });

    await deleteImages(arrAlbums);
    setListSelectImage([]);
    getAllImages({ skip: 0, limit: 250 });
  };

  const selectImage = (item) => {
    if (!listSelectImage.includes(item)) {
      setListSelectImage([...listSelectImage, item]);
    } else {
      const arr = listSelectImage.filter((i) => i !== item);
      setListSelectImage([...arr]);
    }
  };

  return (
    <div className="container-demo">
      <div className="header">
        <h3>Photos</h3>
        <div className="right-header">
          {listSelectImage.length !== 0 && (
            <div className="delete-space">
              <DeleteOutlined className="icon-upload" />
              <h4 onClick={deletePhotos}>
                Delete {listSelectImage.length} photos
              </h4>
            </div>
          )}

          <div className="upload-space ">
            <CloudUploadOutlined className="icon-upload" />
            <h4 onClick={showModalUpload}>Upload</h4>
          </div>

          <h4>Uploads</h4>
        </div>
        <Modal
          className="modal-upload"
          title="Upload Photos"
          visible={visible && !isUploadSuccess}
          onCancel={handleCancel}
          footer={null}
        >
          <Upload
            accept="image/*"
            multiple
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
          <Modal
            visible={previewVisible}
            title={previewTitle}
            footer={null}
            onCancel={handleCancelReview}
          >
            <img alt="example" style={{ width: "100%" }} src={previewImage} />
          </Modal>
          <div className="bottom-upload-image">
            <Select
              defaultValue="Select Album"
              style={{ width: 200 }}
              onChange={handleChangeAlbums}
            >
              {arrAlbums.map((item, key) => (
                <Option key={key} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
            <div
              className={`${
                valueAlbum && fileList.length ? "" : "disable-upload"
              } upload-space upload-space-modal`}
            >
              <CloudUploadOutlined className="icon-upload" />
              <h4 onClick={uploadImage}>Upload</h4>
            </div>
          </div>
        </Modal>
      </div>
      <div className="content-demo">
        <Row type="flex" gutter={16}>
          {images &&
            images.documents &&
            images.documents.map((item) => (
              <Col className="col-image">
                <div className="content-image">
                  <div>
                    <img
                      src={item.raw}
                      onClick={() => selectImage(item)}
                      alt="Image"
                      className={`${
                        listSelectImage.length &&
                        !listSelectImage.includes(item)
                          ? "no-select-image"
                          : ""
                      } image-list`}
                    />
                    <h5>{item.name}</h5>
                    <p>{item.album}</p>
                  </div>
                  <div
                    className="checkbox-image"
                    style={{
                      display: listSelectImage.includes(item)
                        ? "block"
                        : "none",
                    }}
                  >
                    <Checkbox checked></Checkbox>
                  </div>
                </div>
              </Col>
            ))}
        </Row>
      </div>
    </div>
  );
};

const mapActionToProps = {
  getAllImages,
  uploadImages,
  deleteImages,
};
const mapStateToProps = (state) => {
  return {
    images: state.image.images,
    isUploadSuccess: state.image.isUploadSuccess,
  };
};

export default connect(mapStateToProps, mapActionToProps)(Demo);
