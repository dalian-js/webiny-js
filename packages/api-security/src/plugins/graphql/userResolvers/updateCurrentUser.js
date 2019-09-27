// @flow
import { Response, NotFoundResponse, ErrorResponse } from "@webiny/commodo-graphql";

export default async (root: any, args: Object, context: Object) => {
    const { SecurityUser } = context.models;

    const { user } = context;

    const currentUser = await SecurityUser.findById(user.id);
    if (currentUser) {
        try {
            currentUser.populate(args.data);
            await currentUser.save();
            return new Response(currentUser);
        } catch (e) {
            return new ErrorResponse({
                code: e.code,
                message: e.message,
                data: e.data || null
            });
        }
    }

    return new NotFoundResponse("User not found!");
};
