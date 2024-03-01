"use client";
import { z } from "zod";
import axios from "axios";
import { useState } from "react";
import { Issue } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Callout, TextField } from "@radix-ui/themes";
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

import Spinner from "@/app/components/Spinner";
import ErrorMessage from "@/app/components/ErrorMessage";
import { createIssueSchema } from "@/app/validationSchemas";

type IssueFormData = z.infer<typeof createIssueSchema>;

const IssueForm = ({ issue }: { issue?: Issue }) => {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(createIssueSchema),
  });
  const [error, setError] = useState("");
  const [isSubmiting, setIsSubmiting] = useState(false);

  const onSubmit = async (data: IssueFormData) => {
    try {
      setIsSubmiting(true);
      await axios.post("/api/issues", data);
      router.push("/issues");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <div className="max-w-xl ">
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <TextField.Root>
          <TextField.Input
            defaultValue={issue?.title}
            placeholder="Title"
            {...register("title")}
          />
        </TextField.Root>
        {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
        <Controller
          name="description"
          control={control}
          defaultValue={issue?.description}
          render={({ field }) => (
            <SimpleMDE placeholder="Description" {...field} />
          )}
        />
        {errors.description && (
          <ErrorMessage>{errors.description.message}</ErrorMessage>
        )}
        <Button disabled={isSubmiting}>
          Submit New Issue {isSubmiting && <Spinner />}
        </Button>
      </form>
    </div>
  );
};

export default IssueForm;
