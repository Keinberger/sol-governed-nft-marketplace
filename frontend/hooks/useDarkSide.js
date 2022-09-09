import { useEffect, useState } from "react"

export default function useDarkSide() {
    let theme, setTheme
    if (typeof window !== "undefined") {
        if (
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            const [currentTheme, setThemeFunc] = useState("dark")
            theme = currentTheme
            setTheme = setThemeFunc
        } else {
            const [currentTheme, setThemeFunc] = useState("light")
            theme = currentTheme
            setTheme = setThemeFunc
        }
    }
    const colorTheme = theme === "dark" ? "light" : "dark"

    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.classList.remove(colorTheme)
            document.documentElement.classList.add(theme)

            localStorage.setItem("theme", theme)
        }
    }, [theme, colorTheme])

    return [colorTheme, setTheme]
}
