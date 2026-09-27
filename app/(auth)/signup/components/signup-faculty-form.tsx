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
import {signup_faculty} from "@/lib/auth-actions";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";


// TODO: Implement student, faculty, and org signup


export function SignupFacultyForm({
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
                                <Field className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="first_name">firstname</FieldLabel>
                                        <Input id="first_name" name="first_name" required autoComplete="first_name" />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="last_name">
                                            lastname
                                        </FieldLabel>
                                        <Input id="last_name" name="last_name" required autoComplete="last_name" />
                                    </Field>
                                </Field>
                            </Field>

                            {/* Sex */}
                            <Field>
                                <FieldLabel htmlFor="sex">
                                    Sex
                                </FieldLabel>

                                <Select name="sex" required>
                                    <SelectTrigger id="sex" className="w-full">
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Field className="grid grid-cols-2 gap-4">

                                    {/* Employee ID Number */}
                                    <Field>
                                        <FieldLabel htmlFor="employee_number">Employee ID Number</FieldLabel>
                                        <Input
                                          id="employee_number"
                                          name="employee_number"
                                          type="employee_number"
                                          placeholder="yyyy-xxx"
                                          required
                                          autoComplete="employee_number"
                                        />
                                    </Field>

                                    {/* Department*/}
                                    <Field>
                                        <FieldLabel htmlFor="department">
                                            Department
                                        </FieldLabel>

                                        <Select name="department" required>
                                            <SelectTrigger
                                              id="department"
                                              className="w-full"
                                            >
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="CS Dept">
                                                    CS Dept
                                                </SelectItem>
                                                <SelectItem value="IT Dept">
                                                    IT Dept
                                                </SelectItem>
                                                <SelectItem value="CA Dept">
                                                    CA Dept
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                </Field>
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
                                <Button type="submit" formAction={signup_faculty}>Create Account</Button>
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
