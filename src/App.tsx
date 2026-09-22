import { Route, Routes } from 'react-router'
import { MDXProvider } from '@mdx-js/react'
import { mdxComponents } from './components/mdx'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { ProjectPage } from './pages/ProjectPage'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/BlogPost'
import { NotFound } from './pages/NotFound'

import './styles/tokens.css'
import './styles/base.css'
import './styles/home.css'
import './styles/archive.css'
import './styles/article.css'

export function App() {
  return (
    <MDXProvider components={mdxComponents}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectPage />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MDXProvider>
  )
}
