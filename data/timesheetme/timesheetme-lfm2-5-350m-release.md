# TimesheetMe/timesheetme-lfm2.5-350m-release

## Resumen

TimesheetMe LFM2.5-350M es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-350M desarrollado por TimesheetMe para su aplicación de escritorio de registro horario. El modelo resuelve una tarea muy acotada: a partir del texto OCR de una captura de pantalla y de la lista de proyectos del usuario, devuelve en una sola llamada una entrada de parte de horas de una frase y el proyecto correspondiente (o `null`). Adicionalmente se ha entrenado en las demás llamadas internas de la aplicación: síntesis de sesión, fusión de entradas, reescritura de alto nivel, extracción de palabras clave de proyecto y verificación de nombres de personas.

El modelo base es un transformer de 354.483.968 parámetros (aproximadamente 350M) de Liquid AI, del que no se dispone de detalles arquitectónicos en la información proporcionada. El ajuste se distribuye en formato GGUF con cuantización Q4_K_M para llama.cpp, lo que reduce el peso del repositorio a 0,2 GB y permite ejecución en CPU o GPU de gama baja dentro de una aplicación de escritorio.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso de modelo pequeño y especializado en producción real (extracción estructurada con salida JSON restringida por gramática); por otro, advierte de una licencia extremadamente restrictiva que impide cualquier uso fuera de la aplicación TimesheetMe, incluida la redistribución, el fine-tuning y el uso comercial no autorizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-350M) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (única publicada) |
| Idiomas soportados | inglés, francés (los resúmenes siguen el idioma de la pantalla) |
| Licencia | TimesheetMe Model License v1.0, sujeta además a LFM Open License v1.0 (prevalece la más restrictiva) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su identificador (LiquidAI/LFM2.5-350M) y su recuento de parámetros. El ajuste fino se realizó sobre el dataset `timesheet_sft_v4`, compuesto por capturas de pantalla sintéticas (personas y proyectos generados, incluidos proyectos de vida personal) y capturas reales seudonimizadas, en las que se sustituyeron personas, proyectos, clientes, instituciones, direcciones y correos electrónicos.

El entrenamiento cubre varias tareas de la aplicación con los mismos prompts que esta utiliza: la llamada combinada (resumen + proyecto), la síntesis de sesión, la fusión de entradas, la reescritura de alto nivel, las palabras clave de proyecto y la comprobación de nombres de personas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La salida esperada es un JSON con tres claves (`summary`, `project_number`, `confidence`), y el autor recomienda temperatura 0 junto con un esquema JSON (gramática) para restringir la generación a esas tres claves, tal como hace la aplicación.

## Capacidades

- Generación de resúmenes de una frase a partir de texto OCR de capturas de pantalla.
- Clasificación y asignación de proyecto a partir de una lista de proyectos del usuario, con posibilidad de devolver `null` (sin proyecto).
- Salida estructurada en JSON con las claves `summary`, `project_number` y `confidence`.
- Síntesis de sesión de trabajo a partir de entradas individuales.
- Fusión (merge) de entradas de parte de horas duplicadas o solapadas.
- Reescritura de alto nivel de entradas para informes.
- Extracción de palabras clave de proyecto.
- Verificación de nombres de personas.
- Multilingüismo limitado: inglés y francés, con resúmenes que siguen el idioma de la pantalla de origen.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Registro horario automático desde capturas de pantalla: la aplicación captura una imagen, extrae el texto por OCR y pasa ese texto junto con la lista de proyectos al modelo, que devuelve en una sola llamada el resumen y el proyecto asignado. Es el caso de uso principal y el único permitido por la licencia.
- Asignación de proyecto con abstención: gracias a la salida `project_number: null` y a la clave `confidence`, el sistema puede derivar a revisión manual las entradas de baja confianza en lugar de forzar una asignación incorrecta.
- Fusión de entradas duplicadas: cuando el usuario registra dos veces el mismo intervalo de trabajo, el modelo combina ambas entradas en una sola con un resumen coherente, reduciendo la intervención manual.
- Síntesis de sesión: a partir de varias entradas cortas de una misma sesión de trabajo, el modelo genera un resumen agregado apto para el informe diario.
- Reescritura para informes de alto nivel: las entradas técnicas o telegráficas se reformulan en lenguaje presentable para clientes o responsables, manteniendo el proyecto asignado.
- Extracción de palabras clave de proyecto: el modelo identifica términos recurrentes en las entradas de un proyecto para etiquetarlo o mejorar búsquedas internas.
- Verificación de nombres de personas: antes de persistir una entrada, el modelo comprueba si el texto contiene nombres de personas, lo que permite aplicar políticas de privacidad o seudonimización en la aplicación.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de validación sobre personas sintéticas retenidas, no benchmarks estándar:

| Evaluación (validación sintética) | Precisión de proyecto |
|---|---|
| Personas sintéticas retenidas (incluye "sin proyecto") | 79,5% |
| Descripciones de proyecto degradadas | 73,4% |
| Personas de vida personal | 74,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_K_M ocupa 0,2 GB, por lo que la inferencia requiere del orden de 0,5-1 GB de memoria sumando overhead de contexto y runtime (estimación, no dato publicado).
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Despliegue previsto: llama.cpp con formato GGUF; el autor no documenta otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles. Por el tamaño del modelo y la temperatura 0 con gramática JSON, se espera una latencia baja en hardware de consumo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TimesheetMe LFM2.5-350M | 354,5M | no disponible | TimesheetMe Model License v1.0 + LFM Open License v1.0 (solo uso dentro de la app) | GGUF en Hugging Face |
| LiquidAI/LFM2.5-350M (base) | ~350M | no disponible | LFM Open License v1.0 | Pesos en Hugging Face |
| Otros fine-tunes de extracción estructurada de ~350M | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: el modelo solo puede usarse dentro de la aplicación TimesheetMe; se prohíben la redistribución, el fine-tuning, la creación de modelos derivados y el uso comercial fuera de la aplicación sin permiso escrito.
- Al ser una versión modificada de LiquidAI/LFM2.5-350M, también está sujeta a la LFM Open License v1.0, incluido su umbral de uso comercial; en caso de conflicto prevalece la condición más restrictiva.
- El modelo está entrenado para tareas muy concretas de la aplicación; no es un modelo de propósito general y su rendimiento fuera de esos prompts no está evaluado.
- Riesgo de alucinación en la asignación de proyecto: la precisión medida es del 79,5% en el mejor caso y baja al 73,4% con descripciones degradadas, por lo que se requiere validación o revisión humana en producción.
- Idiomas limitados a inglés y francés; no se documenta soporte de castellano.
- No se especifican sesgos conocidos, longitud de contexto ni comportamiento con entradas OCR muy ruidosas.
- El uso de temperatura 0 y gramática JSON es una recomendación del autor; desviarse de ella puede producir salidas no parseables.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimesheetMe/timesheetme-lfm2.5-350m-release
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia del modelo (LICENSE en el repositorio): https://huggingface.co/TimesheetMe/timesheetme-lfm2.5-350m-release/blob/main/LICENSE
- Licencia LFM Open License v1.0 (LICENSE-LFM en el repositorio): https://huggingface.co/TimesheetMe/timesheetme-lfm2.5-350m-release/blob/main/LICENSE-LFM
