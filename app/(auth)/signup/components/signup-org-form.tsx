import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {signup_org} from "@/lib/auth-actions";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";


export function SignupOrgForm({
                               className,
                               ...props
                           }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                                <Input id="name" name="name" required autoComplete="name" />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="short_name">Organization Short Name</FieldLabel>
                                <Input id="short_name" name="short_name" required autoComplete="short_name" />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="organization_type">
                                    Organization Type
                                </FieldLabel>

                                <Select name="organization_type" required>
                                    <SelectTrigger
                                      id="organization_type"
                                      className="w-full"
                                    >
                                        <SelectValue placeholder="Select Organization Type" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Student Council">
                                            Student Council
                                        </SelectItem>
                                        <SelectItem value="Council of Organizations">
                                            Council of Organizations
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@g.msuiit.edu.ph"
                                    required
                                    autoComplete="email"
                                />
                            </Field>
                            <Field>
                                <Field className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Input id="password" name="password" type="password" required />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="confirm-password">
                                            Confirm Password
                                        </FieldLabel>
                                        <Input
                                            id="confirm-password"
                                            name="confirm-password"
                                            type="password"
                                            required
                                        />
                                    </Field>
                                </Field>
                                <FieldDescription>
                                    Must be at least 8 characters long.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <Button type="submit" formAction={signup_org}>Create Account</Button>
                                <FieldDescription className="text-center">
                                    Already have an account? <a href="signin">Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}
