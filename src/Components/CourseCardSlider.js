import "./WorkshopCardSlider.css";
import React from "react";
import CourseCard from "./CourseCard";

const CardSlider = ({ dataList }) => {
  return (
    <div className={"horizontal-scroll-wrapper"}>
      {dataList.map((dataItem, index) => (
        <CourseCard key={dataItem.id} dataItem={dataItem} />
      ))}
    </div>
  );
};

export default CardSlider;
