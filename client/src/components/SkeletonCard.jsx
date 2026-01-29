import "./SkeletonCard.css";

const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line text"></div>
                <div className="skeleton-line text short"></div>
                <div className="skeleton-footer">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
