import style1 from './header.module.css'

export function Header() {
    console.log(style1)
    return (
    <div>
        <h1 className={style1.header}>cabeça</h1>
    </div>
    )
}