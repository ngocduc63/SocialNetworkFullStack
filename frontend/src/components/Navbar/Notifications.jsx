import React, {useState} from "react";
import {Dropdown} from 'antd';
import {likeFillBlack, likeOutline} from "./SvgIcons";

const notifications = [
    {
        id: 1,
        title: "Notification 1",
        message: "This is notification 1",
        time: "10 minutes ago",
        avatar: "https://picsum.photos/200/300"
    },
    {
        id: 2,
        title: "Notification 2",
        message: "This is notification 2",
        time: "30 minutes ago",
        avatar: "https://picsum.photos/200/301"
    },
    {
        id: 3,
        title: "Notification 3",
        message: "This is notification 3",
        time: "1 hour ago",
        avatar: "https://picsum.photos/200/302"
    }
];

const Notifications = () => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    return (
        <Dropdown
            open={open}
            onOpenChange={handleOpenChange}
            menu={{
                items: notifications.map((notification) => ({
                    key: notification.id,
                    label: (
                        <div className="flex items-center">
                            <img src={notification.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2"/>
                            <div>
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <small>{notification.time}</small>
                            </div>
                        </div>
                    )
                }))
            }}
            trigger={['click']}
        >
            <div onClick={(e) => e.preventDefault()} className="relative">
                <div
                    className="cursor-pointer sm:block rounded-full p-2 transition duration-300">
                    {open ? likeFillBlack : likeOutline}
                </div>
            </div>
        </Dropdown>
    );
};

export default Notifications;