import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

interface AuthFormWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerLinkHref: string;
  footerLinkText: string;
  footerText: string;
}

export function AuthFormWrapper({
  title,
  description,
  children,
  footerLinkHref,
  footerLinkText,
  footerText
}: AuthFormWrapperProps) {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-primary">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p className="text-muted-foreground">
          {footerText}{" "}
          <Link href={footerLinkHref} className="font-medium text-accent hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
