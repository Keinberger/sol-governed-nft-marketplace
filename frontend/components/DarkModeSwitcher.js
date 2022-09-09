import React, { useState } from "react"
import useDarkSide from "../hooks/useDarkSide"
import { DarkModeSwitch } from "react-toggle-dark-mode"

export default function Switcher() {
    const [colorTheme, setColorTheme] = useDarkSide()
    const [darkSide, setDarkSide] = useState(colorTheme === "light" ? false : true)

    const toggleDarkMode = (checked) => {
        setColorTheme(colorTheme)
        setDarkSide(checked)
    }

    return (
        <div className="hidden lg:block">
            <button className="py-2 px-2 rounded-lg bg-slate-600 dark:bg-slate-400 hover:dark:bg-slate-200 hover:bg-slate-800 transition ease-in-out">
                <DarkModeSwitch
                    checked={darkSide}
                    // sunColor="white"
                    // moonColor="black"
                    onChange={toggleDarkMode}
                    size={20}
                />
            </button>
        </div>
    )
}
