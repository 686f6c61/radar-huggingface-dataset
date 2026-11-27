# TimesheetMe/timesheetme-lfm2.5-1.2b-release

## Resumen

TimesheetMe LFM2.5-1.2B (v5, Q4_K_M) es un ajuste fino del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por TimesheetMe para su aplicación de escritorio de registro horario. El modelo resuelve una tarea muy acotada: a partir del texto OCR de una captura de pantalla y de la lista de proyectos del usuario, devuelve en una sola llamada una entrada de parte de horas de una frase y el proyecto correspondiente (o `null`). También se ha entrenado en las demás llamadas internas de la aplicación: síntesis de sesión, fusión de entradas, reescritura de alto nivel, palabras clave de proyecto y verificación de nombres de personas.

El modelo parte de una arquitectura Liquid Foundation Model (LFM2.5) de 1.170.340.608 parámetros y se distribuye únicamente en formato GGUF Q4_K_M para llama.cpp. Su relevancia es limitada fuera del ecosistema TimesheetMe: no es un modelo de propósito general, sino un componente especializado con un contrato de prompt y salida JSON muy concretos, definidos en el código de la aplicación.

La licencia es el aspecto más restrictivo: la TimesheetMe Model License v1.0 limita el uso exclusivamente a la aplicación TimesheetMe, prohíbe la redistribución, el ajuste fino y los modelos derivados, y veta el uso comercial fuera de la app sin permiso escrito. Además, al derivar de LFM2.5-1.2B-Instruct, queda sujeta también a la LFM Open License v1.0, aplicándose el término más restrictivo en caso de discrepancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-1.2B-Instruct, familia LFM2.5) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada) |
| Idiomas soportados | en, fr |
| Licencia | timesheetme-model-license (TimesheetMe Model License v1.0) + LFM Open License v1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible; el modelo es un ajuste fino del instructivo LiquidAI/LFM2.5-1.2B-Instruct, de la familia LFM2.5 de Liquid AI, con 1.170.340.608 parámetros. El ajuste se realizó mediante SFT sobre el conjunto de datos `timesheet_sft_v10`, compuesto por capturas de pantalla sintéticas (personas y proyectos generados, incluidos proyectos de vida personal) y capturas reales pseudonimizadas, en las que se sustituyeron personas, proyectos, clientes, instituciones, direcciones y correos electrónicos.

El entrenamiento cubre varias tareas de la aplicación con los mismos prompts que esta utiliza: generación combinada de resumen y proyecto, síntesis de sesión, fusión de entradas, reescritura de alto nivel, palabras clave de proyecto y verificación de nombres de personas. La salida esperada es un JSON con las claves `summary` (cadena), `project_number` (número o `null`) y `confidence` (número); el autor recomienda temperatura 0 y un esquema JSON (grammar) para las tres claves, tal como hace la aplicación. No se mencionan datos sobre volumen de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de entradas de parte de horas de una frase a partir de texto OCR de una captura de pantalla.
- Asignación del proyecto correspondiente a partir de la lista de proyectos del usuario, con posibilidad de devolver `null` cuando no hay coincidencia.
- Salida estructurada en JSON con las claves `summary`, `project_number` y `confidence`, compatible con gramáticas JSON en llama.cpp.
- Síntesis de sesión de trabajo.
- Fusión de entradas de parte de horas.
- Reescritura de alto nivel de entradas.
- Extracción de palabras clave de proyecto.
- Verificación de nombres de personas.
- Multilingüe limitado: inglés y francés; los resúmenes siguen el idioma de la pantalla (inglés, o francés para pantallas en francés).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Registro horario automático en la aplicación TimesheetMe: el modelo recibe el OCR de una captura y la lista de proyectos, y devuelve la entrada y el proyecto en una sola llamada, que es exactamente el flujo para el que fue entrenado.
- Clasificación de capturas sin proyecto: gracias al entrenamiento con proyectos de vida personal y a la salida `null`, puede distinguir actividad laboral de personal y evitar asignaciones erróneas.
- Procesamiento por lotes de capturas diarias: con temperatura 0 y gramática JSON, la salida es determinista y parseable, lo que facilita integrarlo en un pipeline que procese decenas de capturas al día.
- Fusión de entradas duplicadas: la tarea de entry merge permite consolidar registros fragmentados de una misma sesión de trabajo antes de enviarlos al sistema de partes.
- Reescritura de descripciones para informes: la tarea de high-level rewrite genera descripciones más presentables a partir de entradas breves, útil para reportes a clientes.
- Extracción de palabras clave de proyecto: puede alimentar la indexación o el etiquetado de proyectos a partir de las descripciones registradas.
- Verificación de nombres de personas en capturas pseudonimizadas: la tarea de person-name check ayuda a validar que la pseudonimización se aplicó correctamente antes de procesar datos.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Personas sintéticas held-out (val) | Precisión de proyecto (incluye "sin proyecto") | 93,6 % |
| Personas sintéticas held-out con descripciones de proyecto degradadas | Precisión de proyecto | 89,9 % |
| Personas sintéticas held-out de vida personal | Precisión de proyecto | 84,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.170.340.608 parámetros en Q4_K_M, el peso de los pesos ronda los 0,7 GB, por lo que debería caber holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño en Q4_K_M, aunque no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (formato GGUF); la model card no menciona vLLM, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Propósito |
|---|---|---|---|---|---|
| TimesheetMe LFM2.5-1.2B | 1.170.340.608 | no disponible | TimesheetMe Model License v1.0 + LFM Open License v1.0 | GGUF Q4_K_M | Registro horario especializado |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.200 millones (aprox., según nombre) | no disponible | LFM Open License v1.0 | no disponible | Instructivo de propósito general |
| Otros modelos de ~1B para clasificación/extracción | no disponible | no disponible | variable | variable | Tareas de extracción estructurada |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base del que deriva.

## Limitaciones y advertencias

- Licencia muy restrictiva: uso exclusivo dentro de la aplicación TimesheetMe; prohibida la redistribución, el ajuste fino, la creación de modelos derivados y el uso comercial fuera de la app sin permiso escrito.
- Sujeto también a la LFM Open License v1.0, incluido su umbral de uso comercial; en caso de conflicto prevalece el término más restrictivo.
- Modelo especializado: no es apto para uso general; su contrato de prompt y salida JSON está definido en el código de la aplicación (`services/ai/combined_prompt.py`).
- Solo inglés y francés; no se documenta soporte de castellano.
- Solo se publica la cuantización Q4_K_M, lo que limita el ajuste de precisión y rendimiento.
- Riesgo de alucinación en la asignación de proyecto: la precisión cae al 84,0 % en personas de vida personal y al 89,9 % con descripciones de proyecto degradadas.
- Entrenado con capturas pseudonimizadas; no se detallan análisis de sesgos.
- No se documentan longitud de contexto ni límites de entrada, lo que dificulta dimensionar capturas con OCR muy extenso.
- Recomendación del autor de usar temperatura 0 y gramática JSON; desviarse de ese formato puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimesheetMe/timesheetme-lfm2.5-1.2b-release
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
