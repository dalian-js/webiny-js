import React from "react";
import { Bind } from "@webiny/form";
import { validation } from "@webiny/validation";
import { Input } from "@webiny/ui/Input";
import { usePbWebsiteSettings } from "../usePbWebsiteSettings";
import { WebsiteSettingsConfig } from "~/modules/WebsiteSettings/config/WebsiteSettingsConfig";

const { Group, Element } = WebsiteSettingsConfig;

const WebsiteURL = () => {
    const { defaultSettings } = usePbWebsiteSettings();

    const websiteUrl = defaultSettings && defaultSettings.websiteUrl;

    return (
        <Bind name={"websiteUrl"} validators={validation.create("url")}>
            <Input
                label="Website URL"
                description={
                    <>
                        The URL on which your app is available.{" "}
                        {websiteUrl && (
                            <>
                                If not specified, the default one (
                                <a href={websiteUrl} target={"blank"}>
                                    {websiteUrl}
                                </a>
                                ) will be used.
                            </>
                        )}
                    </>
                }
            />
        </Bind>
    );
};

const WebsitePreviewURL = () => {
    const { defaultSettings } = usePbWebsiteSettings();

    const websitePreviewUrl = defaultSettings && defaultSettings.websitePreviewUrl;

    const description = (
        <>
            The preview URL on which your app is available.
            {websitePreviewUrl && (
                <>
                    If not specified, the default one (
                    <a href={websitePreviewUrl} target={"blank"}>
                        {websitePreviewUrl}
                    </a>
                    ) will be used.
                </>
            )}
        </>
    );

    return (
        <Bind name={"websitePreviewUrl"} validators={validation.create("url")}>
            <Input label="Website preview URL" description={description} />
        </Bind>
    );
};

export const GeneralSettings = () => {
    return (
        <WebsiteSettingsConfig>
            <Group name={"website"} label={"Website Settings"}>
                <Element
                    name={"name"}
                    element={
                        <Bind name={"name"} validators={validation.create("required")}>
                            <Input label="Website name" />
                        </Bind>
                    }
                />
                <Element name={"websiteUrl"} element={<WebsiteURL />} />
                <Element name={"websitePreviewUrl"} element={<WebsitePreviewURL />} />
            </Group>
        </WebsiteSettingsConfig>
    );
};
