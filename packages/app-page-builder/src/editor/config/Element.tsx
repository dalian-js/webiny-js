import React from "react";
import { makeDecoratable } from "@webiny/app-admin";
import { Property, useIdGenerator } from "@webiny/react-properties";

export interface ElementConfig {
    name: string;
    group: string;
    scope: string;
    element: JSX.Element;
}

export interface ElementProps {
    name: string;
    id?: string;
    element?: JSX.Element | null;
    /**
     * `group` is a public prop that can be used by external developers to logically group elements.
     * For example: "actions", "buttons", etc.
     */
    group?: string;
    /**
     * `scope` is used for internal grouping of elements. It is only used to create higher level components used by the 3rd party.
     * For example: "sidebar", "topBar", "toolbar".
     * This creates a scope within which we can then filter elements by their `group` prop.
     */
    scope?: string;
    remove?: boolean;
    before?: string;
    after?: string;
}

export const Element = makeDecoratable(
    "EditorElement",
    ({ id, name, element, group, scope, remove, before, after }: ElementProps) => {
        const getId = useIdGenerator("element");
        const realId = id ?? name;

        const placeAfter = after !== undefined ? getId(after) : undefined;
        const placeBefore = before !== undefined ? getId(before) : undefined;

        return (
            <Property
                id={getId(realId)}
                name={"elements"}
                remove={remove}
                array={true}
                before={placeBefore}
                after={placeAfter}
            >
                <Property id={getId(realId, "name")} name={"name"} value={name} />
                {element ? (
                    <Property id={getId(realId, "element")} name={"element"} value={element} />
                ) : null}
                {group ? (
                    <Property id={getId(realId, "group")} name={"group"} value={group} />
                ) : null}
                {scope ? (
                    <Property id={getId(realId, "scope")} name={"scope"} value={scope} />
                ) : null}
            </Property>
        );
    }
);
