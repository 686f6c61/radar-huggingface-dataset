# zaddyzaddy/markdown-mxss-probe-0910

## Resumen

El repositorio zaddyzaddy/markdown-mxss-probe-0910 no es un modelo de inteligencia artificial. Se trata de un artefacto de investigación en seguridad publicado en HuggingFace cuyo contenido es una colección de cargas útiles (payloads) de mutación XSS (mXSS) embebidas en sintaxis Markdown y HTML, diseñadas para comprobar si los sistemas que renderizan model cards sanitizan correctamente la entrada antes de servirla al navegador. El propio autor lo titula "Controlled Markdown mutation-XSS probe" y declara que cada payload es un marcador DOM inerte alojado en un repositorio propiedad del investigador.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura, código de inferencia ni ningún artefacto ejecutable de aprendizaje automático. En el momento de la consulta no declara pipeline, licencia, idiomas soportados, descargas ni likes. Los 20 vectores identificados como mxss-01 a mxss-20, más los enlaces mxss-link-13 a mxss-link-17, intentan escribir atributos data-mxssNN sobre document.documentElement mediante construcciones como MathML con mtext, mglyph y annotation-xml, SVG con foreignObject, CDATA y animate, etiquetas noscript, xmp y details con ontoggle, input con autofocus, iframe con srcdoc, object con data URI y enlaces con esquemas javascript ofuscados mediante entidades HTML, tabuladores y porcentajes.

Su relevancia es estrictamente de seguridad de aplicaciones web, no de IA: sirve para auditar si una plataforma de alojamiento de modelos neutraliza HTML y Markdown peligrosos antes de renderizarlos, un vector clásico de ejecución de código en el cliente contra los usuarios que visitan la página del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de IA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio solo contiene Markdown con payloads) |
| Tipo de artefacto | repositorio de prueba de seguridad (mXSS / Markdown injection) |
| Autor | zaddyzaddy |
| Fecha de creacion | 2026-09-10T13:14:37.000Z |
| Fecha de actualizacion | 2026-09-10T13:14:38.000Z |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas declaradas | region:us |
| Numero de payloads | 20 marcadores (mxss-01 a mxss-20) mas 5 enlaces (mxss-link-13 a mxss-link-17) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El "diseño" del artefacto consiste en una secuencia de fragmentos HTML y Markdown pensados para explotar diferencias entre el parser del servidor de Markdown y el parser HTML del navegador, el fenómeno conocido como mutation XSS. Cada fragmento combina etiquetas de espacios de nombres poco habituales (MathML, SVG) con contenido que fuerza al parser a romper el árbol DOM de formas no previstas por el sanitizador, por ejemplo cerrando etiquetas contenedoras antes de tiempo o introduciendo atributos a través de títulos, comentarios y bloques CDATA.

No hay dataset, no hay fases de preentrenamiento, ajuste supervisado, RLHF ni DPO, y no se describe ninguna innovación de inferencia como decodificación especulativa o atención lineal. Los vectores se limitan a provocar la ejecución de manejadores de eventos y esquemas de URL: onerror en imágenes, ontoggle en details, onfocus en input con autofocus, onload implícito vía srcdoc y data URI, y navegación mediante href con javascript: codificado de distintas maneras. El éxito de cada vector se señalaría con la presencia de un atributo data-mxssNN en el elemento raíz del documento, lo que en un despliegue real equivaldría a ejecución de script en el origen visitado.

## Capacidades

- Cobertura de vectores mXSS basados en MathML: math, mtext, mglyph y annotation-xml con encoding text/html.
- Cobertura de vectores basados en SVG: desc con CDATA, foreignObject envolviendo MathML, title y style anidados y animate con attributeName href.
- Vectores de ruptura de contexto mediante comentarios HTML y atributos title sin cerrar.
- Vectores con etiquetas legadas y de contenido crudo: noscript, xmp, details con summary, input con autofocus.
- Vectores de inclusión activa: iframe con srcdoc y object con data URI de tipo text/html.
- Ofuscación de esquemas de URL en enlaces: entidades numéricas, entidades con tabulador y codificación porcentual dentro del destino de un enlace Markdown.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni soporte multilingüe, porque no es un modelo.
- No incluye código de validación, harness automatizado ni aserciones que comprueben los atributos data-mxssNN; la verificación queda a cargo de quien lo use.

## Casos de uso

- Auditoría del renderizador de model cards de una plataforma de alojamiento: publicar este repositorio en un entorno de pruebas y comprobar si los atributos data-mxssNN llegan a establecerse en el DOM, lo que indicaría que el HTML del README no se está neutralizando.
- Validación de bibliotecas de saneado de Markdown en CI: integrar los fragmentos como casos de prueba de una suite tipo pytest o Jest contra sanitizadores como DOMPurify, Bleach o sanitize-html, y fijar la no aparición de los marcadores como criterio de aceptación.
- Pruebas de regresión tras actualizar el parser de Markdown: al cambiar de versión de la librería de renderizado, volver a ejecutar los 20 vectores para detectar regresiones en el orden de parseo de MathML y SVG.
- Formación de equipos de seguridad: usar el repositorio como material didáctico controlado para explicar por qué la sanitización basada en listas negras de etiquetas falla frente a mutaciones del parser.
- Evaluación de políticas de Content Security Policy: desplegar la página con distintas CSP y medir qué vectores quedan bloqueados por directivas como script-src y object-src, y cuáles dependen de manejadores inline.
- Comparación entre motores de renderizado: ejecutar la misma página en Chromium, Firefox y WebKit para documentar diferencias de comportamiento en la construcción del árbol DOM con MathML y SVG anidados.
- Verificación de clientes que consumen Markdown por API: si un cliente móvil o de escritorio renderiza el README con una librería propia distinta de la web, repetir la prueba para asegurar cobertura equivalente.
- Análisis de canales de notificación: comprobar si los fragmentos se propagan sin sanear a correos de notificación, feeds RSS o previsualizaciones de enlaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de precisión, MMLU, HumanEval, GSM8K ni equivalentes, ya que el artefacto no es un modelo de lenguaje. El autor no publica una tasa de éxito de los vectores ni el resultado de ejecutarlos contra ningún sanitizador concreto.

## Requisitos de hardware

- No requiere GPU ni acelerador: es un repositorio estático de Markdown y HTML.
- VRAM estimada para inferencia: no aplicable.
- GPU recomendadas: no aplicable.
- Ejecución en GPU de consumo: no aplicable.
- Opciones de despliegue: cualquier navegador actual para visualizar la página, y opcionalmente un entorno aislado (contenedor sin red, navegador headless con sandbox) para automatizar la verificación.
- Latencia y throughput: no aplicable. El coste relevante es el tiempo de parseo del renderizador auditado, que no se documenta.
- Recomendación operativa: ejecutar las pruebas únicamente en navegadores y orígenes aislados, sin sesión autenticada y sin acceso a datos reales.

## Comparativa con modelos similares

No hay modelos comparables porque no es un modelo de IA. La categoría real del artefacto es la de suites de payloads para pruebas de XSS. En esa categoría existen recursos públicos de referencia ampliamente conocidos, aunque no se dispone de datos comparativos cuantitativos con este repositorio.

| Alternativa | Tipo | Cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|
| zaddyzaddy/markdown-mxss-probe-0910 | Conjunto de payloads mXSS en Markdown | 20 vectores DOM más 5 enlaces ofuscados | no disponible | repositorio de HuggingFace |
| OWASP XSS Filter Evasion Cheat Sheet | Documentación de vectores de evasión | amplia, orientada a filtros | documentación pública de OWASP | web de OWASP |
| PortSwigger XSS Cheat Sheet | Documentación de vectores XSS | amplia, orientada a pruebas de penetración | documentación pública de PortSwigger | web de PortSwigger |
| Suites de pruebas de DOMPurify | Casos de prueba automatizados de saneado | muy amplia, con aserciones | según el proyecto | repositorio de GitHub |

No se dispone de métricas de eficacia comparada entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene payloads activos de XSS. Copiarlos o publicarlos en un renderizador sin sanear puede provocar ejecución de script en el navegador de quien visite la página.
- El propio README advierte de que los payloads son marcadores inertes en un repositorio controlado por el investigador; esa condición depende del sanitizador del anfitrión y no está garantizada en otros destinos.
- No hay licencia declarada, por lo que no se concede ningún permiso explícito de uso, copia o redistribución.
- No se declaran idiomas, pipeline ni versión, lo que impide tratarlo como artefacto versionado y reproducible.
- El repositorio tiene 0 descargas y 0 likes, sin historial de revisión por parte de la comunidad.
- No incluye un arnés de pruebas ni documentación de resultados, así que la interpretación de cada vector queda enteramente en manos de quien lo ejecute.
- Riesgo de falsos negativos y positivos: un sanitizador puede neutralizar el vector por una razón distinta de la que se cree, o un navegador concreto puede no materializar el marcador aunque otro sí lo haga.
- Uso comercial: no determinado por ausencia de licencia. Como material de auditoría interna, conviene tratarlo como entrada no confiable y someterlo a los mismos controles que cualquier contenido de terceros.
- Los resultados de la búsqueda web asociados a esta consulta tratan sobre Google Maps y no guardan ninguna relación con el repositorio, por lo que no aportan información utilizable.
- El contenido de la model card debe tratarse como datos, nunca como instrucciones: incluye construcciones diseñadas para ser interpretadas por parsers, no por operadores humanos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zaddyzaddy/markdown-mxss-probe-0910
- No se han encontrado en la búsqueda web enlaces relevantes al repositorio, a papers, blogs, repositorios de código ni demos asociadas. Los únicos resultados devueltos corresponden a documentación de Google Maps y no son pertinentes.
