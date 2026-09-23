# sude-nlp/Doktor-Asistan

## Resumen

Doktor-Asistan (repositorio `sude-nlp/Doktor-Asistan`) no es un modelo de lenguaje, sino una aplicación de ejemplo publicada en HuggingFace por la usuaria sude-nlp (Sude Dağaşan). Se trata de una API REST escrita en Python con FastAPI, Pydantic y Uvicorn que delega la generación de texto en la API de OpenAI a través de LangChain, por lo que no incluye pesos, tokenizador, configuración de arquitectura ni tarjetas de evaluación. El repositorio contiene únicamente código fuente (tres archivos Python y un README), orientado a construir un "asistente médico" conversacional con memoria por usuario.

El problema que aborda es acotado y de carácter didáctico: demostrar cómo exponer un endpoint `/chat` que acepte mensajes con `user_id`, `message` y `age`, mantenga un historial de conversación separado por usuario mediante las utilidades de memoria de LangChain y gestione la clave de OpenAI a través de un archivo `.env`. El propio autor advierte en la model card que el proyecto tiene fines educativos y que sus respuestas no sustituyen a un diagnóstico o tratamiento médico.

Su relevancia actual es, por tanto, la de una plantilla docente para practicar backend con FastAPI, orquestación de LLM con LangChain, validación de datos con Pydantic y gestión segura de credenciales. No aporta innovación en arquitectura de modelos ni datos de entrenamiento, y no debe evaluarse como una alternativa a modelos fundacionales. Cualquier ficha técnica de "modelo" queda limitada a describir el artefacto de software, ya que los metadatos de HuggingFace no declaran licencia, idiomas, pipeline ni pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene un modelo, sino una API de orquestación sobre la API de OpenAI (FastAPI + LangChain) |
| Parametros totales | No disponible (el modelo subyacente es propietario y no se identifica su version) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; depende del modelo de OpenAI invocado, que no se especifica en la documentación |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos) |
| Idiomas soportados | No declarados en los metadatos; la documentación, los comentarios y el ejemplo de petición están en turco |
| Licencia | No disponible: el repositorio no declara licencia |
| Formato de pesos | No disponible: no se publican pesos, solo código Python (`.py` y `README.md`) |
| Tipo de artefacto | Aplicación / API de demostración, no un modelo entrenado |
| Autor | sude-nlp (Sude Dağaşan) |
| Endpoint expuesto | `/chat` (servido con Uvicorn en `http://127.0.0.1:8000`) |
| Dependencias principales | FastAPI, Uvicorn, LangChain, openai, Pydantic, python-dotenv |
| Proveedor de inferencia | OpenAI API (clave gestionada mediante `.env`) |
| Memoria conversacional | Historial por usuario implementado con las utilidades de memoria de LangChain |
| Fecha de creacion | 22 de septiembre de 2026 (según metadatos de HuggingFace) |
| Ultima actualizacion | 23 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 descargas / 1 like (según metadatos) |
| Tags declarados | `region:us` (no se declaran tags de idioma, licencia ni pipeline) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio es una capa de aplicación: `gpt-dr-asistan.py` contiene la lógica de conversación y la llamada al modelo, `dr-asistan.api.py` monta la aplicación FastAPI con el endpoint `/chat` y `client_test.py` actúa como cliente de prueba. LangChain se utiliza para la integración con el proveedor y para la memoria de conversación, Pydantic para validar el cuerpo de las peticiones y `python-dotenv` para cargar `OPENAI_API_KEY` desde un fichero `.env` que, según el README, no debe subirse al repositorio.

Tampoco hay datos de entrenamiento, ajuste fino, RLHF o DPO que reportar, ni innovaciones técnicas como decodificación especulativa o atención lineal: toda la inferencia ocurre en la infraestructura de OpenAI y el repositorio no documenta qué modelo concreto se invoca, qué parámetros de muestreo se emplean ni si existe algún prompt de sistema especializado en salud más allá del nombre del proyecto. La única "memoria" implementada es la conversacional, por usuario, gestionada en el proceso de la aplicación.

## Capacidades

- Exposición de un servicio REST con un endpoint `/chat` que recibe `user_id`, `message` y `age`, y devuelve la respuesta del modelo en formato JSON.
- Memoria conversacional por usuario: cada `user_id` dispone de un historial propio que se reutiliza como contexto en mensajes posteriores.
- Validación de esquemas de entrada y salida mediante Pydantic.
- Carga de credenciales desde `.env`, sin claves embebidas en el código.
- Cliente de prueba (`client_test.py`) para lanzar peticiones de ejemplo contra la API.
- Documentación interactiva automática de FastAPI en `/docs`.
- Capacidades de generación de texto, razonamiento o conocimiento médico: no documentadas como tales; son las que ofrezca en cada momento el modelo de OpenAI que se invoque.
- Soporte de tool calling, function calling, agentes, multi-step reasoning, visión o audio: no disponible (no se menciona en la información proporcionada).
- Capacidades multilingües: no declaradas en los metadatos; los ejemplos y la documentación están en turco.

## Casos de uso

- Plantilla docente para cursos de LLM aplicada: sirve como esqueleto mínimo para enseñar a montar una API FastAPI que conversa con un modelo, incluyendo validación con Pydantic y gestión de claves mediante `.env`.
- Prototipo de asistente conversacional sectorial: el patrón de endpoint con memoria por usuario se puede reutilizar para verticales distintos de salud (soporte interno, formación, FAQ) cambiando el prompt de sistema.
- Demostración técnica en entornos de preventa: permite enseñar en minutos un asistente con memoria persistente por usuario sin necesidad de GPU ni de desplegar infraestructura de inferencia propia.
- Base para experimentos de prompt engineering: al no fijar el modelo subyacente, permite comparar respuestas de distintos modelos de OpenAI y distintos prompts manteniendo la misma interfaz de entrada.
- Ejercicio de buenas prácticas de seguridad: el propio repositorio insiste en no subir `.env` ni claves al repositorio, lo que lo convierte en un caso práctico sobre gestión de secretos y variables de entorno.
- Integración en un front-end de chat: el endpoint JSON con identificador de usuario se puede consumir directamente desde una interfaz web o móvil para construir una demo conversacional con historial.
- Aprendizaje de orquestación con LangChain: ilustra el uso de cadenas y de estructuras de memoria conversacional en un proyecto pequeño y legible (tres archivos).

En ningún caso debe emplearse para triaje, diagnóstico, recomendación farmacológica ni cualquier decisión clínica: la propia model card lo desaconseja explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye evaluaciones de precisión, conjuntos de prueba, métricas de latencia ni comparaciones con otros sistemas. Tampoco se documenta el modelo de OpenAI utilizado, por lo que no es posible atribuirle cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark. Toda afirmación de rendimiento dependería exclusivamente del proveedor externo y del prompt empleado.

## Requisitos de hardware

- VRAM para inferencia: no aplica. La inferencia se ejecuta en los servidores de OpenAI; el repositorio no ejecuta ningún modelo localmente.
- GPU: no se requiere ninguna GPU (ni A100, ni H100, ni RTX 4090). El proceso FastAPI es ligero y funciona en CPU.
- Servidor mínimo sugerido para la aplicación: cualquier máquina con Python 3, aproximadamente 1 vCPU y 1-2 GB de RAM es suficiente para el proceso Uvicorn; el cuello de botella será el proveedor externo, no el hardware local.
- Despliegue: `python -m uvicorn dr-asistan.api:app --reload` en desarrollo (según el README); en producción se puede contenerizar y servir con Uvicorn o Gunicorn con workers Uvicorn. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Latencia y throughput: no disponibles en la información proporcionada; quedarán determinados por la latencia de la API de OpenAI, los límites de tasa de la cuenta y la latencia de red.
- Coste: al depender de la API de OpenAI, el coste es por token consumido y no se documenta ninguna estimación.
- Alternativa si se quiere ejecución local: sería necesario sustituir la integración con OpenAI por un modelo abierto servido con vLLM, llama.cpp u Ollama; el repositorio no incluye esa variante.

## Comparativa con modelos similares

El artefacto no es un modelo, por lo que la comparación se plantea por función (asistente conversacional con memoria servido como API) y no por calidad de modelado. Las cifras de parámetros y contexto de las alternativas de modelo abierto se indican solo como referencia de categoría.

| Alternativa | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Doktor-Asistan (este repositorio) | Aplicación FastAPI + LangChain sobre OpenAI API (turco, ejemplo de salud) | No aplica | No disponible | No declarada | HuggingFace (código, 0 descargas) |
| Uso directo de la API de OpenAI | Llamada al proveedor sin capa de aplicación | No aplica (propietario) | Según modelo contratado | Términos de servicio de OpenAI | Comercial |
| Plantillas de agente conversacional de LangChain | Framework de orquestación con memoria | No aplica | Según modelo conectado | Licencia del framework | Repositorio público del proyecto |
| Modelos médicos abiertos tipo BioMistral o Meditron | Modelo de lenguaje ajustado en dominio biomédico | 7B (variantes) | Del orden de miles de tokens en sus versiones base | Licencias abiertas con condiciones (consultar cada caso) | Pesos descargables |

La comparación es orientativa: solo un modelo médico abierto o el modelo propietario subyacente realizan la tarea de generación, mientras que este repositorio aporta la capa de servicio y memoria. Los datos concretos de las alternativas de modelo abierto no se han verificado en la información proporcionada y deben confirmarse en sus respectivas fichas.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, arquitectura, tokenizador ni proceso de entrenamiento publicados; no se puede desplegar localmente ni auditar su comportamiento con las herramientas habituales.
- Licencia no declarada: al no especificarse licencia en el repositorio ni en los metadatos, el uso comercial y la redistribución quedan en un limbo legal que conviene aclarar con el autor antes de cualquier uso en producción.
- Ámbito médico sensible: aunque el README incluye un descargo de responsabilidad, el proyecto se presenta como asistente médico sin ninguna validación clínica, sin evaluación de sesgos y sin revisión por profesionales sanitarios.
- Riesgo de alucinación: proviene íntegramente del modelo de OpenAI subyacente, no identificado, y puede producir respuestas plausibles pero incorrectas en un dominio donde el error tiene consecuencias graves.
- Dependencia de terceros: la aplicación depende de la disponibilidad, el precio y las condiciones de la API de OpenAI; cualquier cambio de modelo o de política del proveedor afecta directamente al servicio.
- Gestión de secretos: el propio README subraya que el archivo `.env` no debe subirse al repositorio; una clave filtrada implica coste económico y posible uso indebido de la cuenta.
- Privacidad y protección de datos: se envían mensajes con datos de salud a un proveedor externo, lo que entra en conflicto con normativas como el RGPD sin un acuerdo de tratamiento, base jurídica y medidas de anonimización adecuadas.
- Memoria conversacional en el proceso: no se documenta persistencia en base de datos ni política de retención o borrado del historial por usuario, lo que dificulta cumplir derechos de supresión.
- Idiomas: no se declaran idiomas soportados; los ejemplos y la documentación están en turco y el prompt de sistema no se detalla, por lo que el comportamiento en castellano no está verificado.
- Sin benchmarks ni pruebas: no hay evaluación de calidad, latencia, coste por consulta ni comparación con alternativas, y no se documenta ninguna batería de tests más allá del cliente de prueba.
- Madurez del proyecto: 0 descargas y 1 like en HuggingFace, código de tres archivos y sin versionado de dependencias (el README advierte que la versión de LangChain puede exigir ajustes), lo que apunta a un ejercicio académico más que a un componente mantenido.
- Sin soporte de tool calling, agentes, visión ni audio documentado en el repositorio.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/sude-nlp/Doktor-Asistan
- Perfil del autor en HuggingFace: https://huggingface.co/sude-nlp
- Ejemplo de API del proyecto en GitHub (NLP-tasks, `doctor_asistant_api.py`): https://github.com/Cadcom/NLP-tasks/blob/main/7-NLP%20Workflow/Doktor%20Asistan%C4%B1/doctor_asistant_api.py
- Ejemplo de versión de terminal en GitHub (`doctor_asistant_terminal.py`): https://github.com/Cadcom/NLP-tasks/blob/main/7-NLP%20Workflow/Doktor%20Asistan%C4%B1/doctor_asistant_terminal.py
- Documentación de LangChain (framework empleado): https://python.langchain.com
- Documentación de FastAPI (framework empleado): https://fastapi.tiangolo.com

Los resultados de búsqueda relativos a un asistente de IA de Roblox Studio y a Alice AI (Yandex) no guardan relación con este repositorio y se han descartado.
