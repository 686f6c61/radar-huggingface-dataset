# xqllll/minesumm-demo

## Resumen

MineSumm es una aplicación de demostración publicada en Hugging Face bajo el identificador `xqllll/minesumm-demo`. No se trata de un modelo de lenguaje con pesos publicados, sino de un *Space* de tipo Docker que implementa un servicio de resumen de informes mineros con enfoque en riesgos. El sistema recibe documentos PDF, DOCX o XLSX detrás de autenticación y devuelve un resumen estructurado en cuatro bloques: riesgos, incidencias, acciones recomendadas y otros hallazgos relevantes, exportable a PDF o CSV.

El proyecto resuelve un problema concreto del sector minero-industrial: la revisión manual de informes extensos de producción y operaciones para extraer riesgos y acciones. La aplicación funciona en dos modos. Sin clave de API, emplea un motor extractivo determinista que puntúa frases según señales de riesgo, incidencia, acción o hallazgo. Con `OPENAI_API_KEY` configurada, delega en un LLM externo (por defecto `gpt-4o-mini`) a través de una API compatible con OpenAI, lo que permite apuntar a endpoints alternativos como vLLM, Ollama, Gemini o Azure.

Es relevante como referencia de ingeniería de producto más que como artefacto de modelado: demuestra un patrón de despliegue con autenticación JWT, control de acceso basado en roles, validación de ficheros por *magic bytes*, limitación de tasa y ausencia de persistencia en disco. No hay pesos, arquitectura de red neuronal propia ni datos de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (aplicación Docker; no es un modelo de pesos) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del LLM externo configurado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican pesos; el servicio usa un LLM externo vía API) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una aplicación web con backend FastAPI y frontend React + Vite construido con Vite y CSS escrito a mano, sin framework de UI. El backend se organiza en tres módulos: `main.py` (rutas, autenticación y seguridad), `parsing.py` (detección de tipo por *magic bytes* y extracción de texto) y `summarizer.py` (motor extractivo y llamada al LLM). El despliegue se realiza mediante un `Dockerfile` multi-etapa que compila el frontend con Node y sirve el resultado desde una imagen Python slim.

El motor extractivo, activo cuando no hay clave de API, puntúa oraciones según señales léxicas de riesgo, incidencia, acción o hallazgo, ancla cada elemento al texto fuente y aplica un presupuesto de palabras. El modo LLM envía un esquema JSON en el prompt, impone orden priorizando riesgos y limita la salida a 250 palabras (400 para informes de más de 3000 palabras de origen), exigiendo un mínimo de tres riesgos y tres acciones cuando existan en el documento. No se documentan datos de entrenamiento, ajuste fino ni proceso de alineación, porque el modelo subyacente es externo y configurable.

## Capacidades

- Resumen extractivo determinista de informes en PDF, DOCX y XLSX sin necesidad de clave de API.
- Resumen generativo estructurado mediante LLM externo compatible con la API de OpenAI, con salida en esquema JSON.
- Ordenación prioritaria por riesgos, seguida de incidencias, acciones recomendadas y otros hallazgos.
- Anclaje al texto fuente: el sistema declara que no inventa elementos y solo devuelve riesgos y acciones presentes en el documento.
- Control de presupuesto de palabras con recorte en servidor (250 palabras; 400 en informes largos).
- Exportación de resúmenes a PDF y CSV.
- Autenticación JWT (HS256, caducidad de 12 horas) y contraseñas con PBKDF2-SHA256 (120 000 iteraciones, sal por usuario).
- Control de acceso basado en roles con tres perfiles: admin, analyst y viewer, aplicado en servidor y con resúmenes acotados al propietario.
- Validación de subida por *magic bytes* (cabecera PDF o estructura zip OOXML), sin confiar en extensión ni MIME del cliente, con límite duro de 50 MB.
- Limitación de tasa: inicio de sesión a 10 peticiones por minuto por IP y subida a 20 por minuto por IP.
- Cabeceras de seguridad: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `no-store` en la API.
- Sin persistencia en disco: los ficheros se procesan en memoria y los resúmenes viven en RAM con TTL de 30 minutos.
- API documentada con endpoints de login, salud, subida, muestra, consulta de resumen y exportación.

## Casos de uso

- Revisión de informes de producción minera: el sistema extrae riesgos y acciones de informes operativos extensos, reduciendo la lectura manual a un resumen de 250 palabras con bloques priorizados.
- Auditoría interna de seguridad operacional: un analista sube el informe mensual y obtiene una lista de riesgos anclada al texto, exportable a CSV para incorporarla a un registro de riesgos corporativo.
- Triaje de incidencias en turnos: con el modo LLM y un endpoint local (vLLM u Ollama), el equipo de operaciones puede resumir partes diarios sin enviar datos a un proveedor externo, cumpliendo requisitos de residencia de datos.
- Validación de entregables documentales: la comprobación por *magic bytes* y el límite de 50 MB permiten rechazar ficheros corruptos o sobredimensionados antes de procesarlos, integrándose en un flujo de recepción documental.
- Generación de resúmenes para comités de dirección: la exportación a PDF facilita distribuir un resumen ejecutivo con riesgos y acciones a partes interesadas sin acceso al sistema.
- Base para un servicio SaaS multiinquilino: el control de acceso por propietario y los roles admin/analyst/viewer sirven de esqueleto para un despliegue con gestión real de usuarios y SSO.
- Prototipo de evaluación de LLM en dominio industrial: al permitir cambiar `LLM_MODEL` y `OPENAI_BASE_URL`, el equipo puede comparar la calidad de resumen entre distintos modelos sobre el mismo corpus de informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se publican requisitos de VRAM propios: la inferencia depende del LLM externo configurado, no del Space.
- Con el modo por defecto (`gpt-4o-mini` vía API de OpenAI), el servicio no requiere GPU local; basta con CPU y memoria para FastAPI y el parseo de documentos.
- Para despliegue con LLM local vía `OPENAI_BASE_URL` apuntando a vLLM u Ollama, los requisitos vendrán determinados por el modelo elegido; no se especifican en la documentación.
- El contenedor se construye en dos etapas (Node para el frontend, Python slim para el backend) y expone el puerto 8000.
- Opciones de despliegue documentadas: ejecución local con Uvicorn, `docker compose up --build` y despliegue en AWS o Azure mediante contenedor o máquina virtual según la checklist de producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. MineSumm no es un modelo de lenguaje con pesos publicados, sino una aplicación de demostración, por lo que no existe una comparación directa con modelos de la misma categoría en parámetros o contexto. Como referencia funcional, se apoya en LLM externos compatibles con la API de OpenAI, y el propio proyecto sugiere `gpt-4o-mini` como valor por defecto, sin publicar métricas comparativas.

## Limitaciones y advertencias

- No se publican pesos ni arquitectura de modelo: el repositorio es una aplicación, no un modelo evaluable de forma aislada.
- La licencia no está indicada, lo que impide determinar condiciones de uso comercial.
- No se declaran idiomas soportados; el motor extractivo y los prompts están orientados a informes en inglés según la documentación.
- El modo extractivo es determinista y basado en señales léxicas, por lo que puede omitir riesgos formulados con vocabulario no contemplado.
- El modo LLM depende de un proveedor externo y de la calidad del modelo configurado; el anclaje al texto fuente reduce pero no elimina el riesgo de alucinación.
- Los PDF escaneados no se procesan sin un complemento OCR (Tesseract o PaddleOCR), que la documentación sitúa fuera de la demo.
- Los informes muy largos requieren resumen por map-reduce en chunks, funcionalidad no incluida en la demo.
- Las credenciales de demostración (admin/admin123, analyst/analyst123, viewer/viewer123) son públicas y no deben usarse en producción.
- El sistema guarda resúmenes en RAM con TTL de 30 minutos: no hay persistencia ni registro de auditoría en la demo.
- La checklist de producción exige HTTPS con HSTS, cifrado AES-256 en reposo, Postgres, SSO, revisión OWASP y monitorización, ninguno de los cuales está implementado en la demo.
- El soporte incluido tras la entrega se limita a una semana de corrección de errores según la propuesta.

## Enlaces

- Hugging Face: https://huggingface.co/xqllll/minesumm-demo
