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
import {signup_student} from "@/lib/auth-actions";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";


export function SignupStudentForm({
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

                            {/* Sex / Year Level */}
                            <Field>
                                <Field className="grid grid-cols-2 gap-4">

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

                                    {/* Year Level */}
                                    <Field>
                                        <FieldLabel htmlFor="year_level">
                                            Year Level
                                        </FieldLabel>

                                        <Select name="year_level" required>
                                            <SelectTrigger
                                              id="year_level"
                                              className="w-full"
                                            >
                                                <SelectValue placeholder="Select year level" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="1">
                                                    1
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    2
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    3
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    4
                                                </SelectItem>
                                                <SelectItem value="5">
                                                    5+
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                </Field>
                            </Field>

                            <Field>
                                <Field className="grid grid-cols-2 gap-4">

                                    {/* Student ID Number*/}
                                    <Field>
                                        <FieldLabel htmlFor="student_number">Student ID Number</FieldLabel>
                                        <Input
                                          id="student_number"
                                          name="student_number"
                                          type="student_number"
                                          placeholder="yyyy-xxxx"
                                          required
                                          autoComplete="student_number"
                                        />
                                    </Field>

                                    {/* Program */}
                                    <Field>
                                        <FieldLabel htmlFor="program">
                                            Program
                                        </FieldLabel>

                                        <Select name="program" required>
                                            <SelectTrigger
                                              id="program"
                                              className="w-full"
                                            >
                                                <SelectValue placeholder="Select program" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="BSCS">
                                                    BSCS
                                                </SelectItem>
                                                <SelectItem value="BSIT">
                                                    BSIT
                                                </SelectItem>
                                                <SelectItem value="BSIS">
                                                    BSIS
                                                </SelectItem>
                                                <SelectItem value="BSCA">
                                                    BSCA
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
                                <Button type="submit" formAction={signup_student}>Create Account</Button>
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
