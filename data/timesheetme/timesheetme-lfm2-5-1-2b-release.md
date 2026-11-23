# TimesheetMe/timesheetme-lfm2.5-1.2b-release

## Resumen

TimesheetMe LFM2.5-1.2B es un fine-tune del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por TimesheetMe para alimentar la función de imputación automática de horas de su aplicación de escritorio. El modelo recibe como entrada el texto OCR de una captura de pantalla junto con la lista de proyectos del usuario y devuelve, en una sola llamada, una entrada de parte de horas de una frase y el proyecto correspondiente (o `null` si no hay coincidencia), junto con una puntuación de confianza.

El modelo base pertenece a la familia LFM2.5 de Liquid AI, con 1.170.340.608 parámetros totales según los pesos safetensors. La versión publicada en este repositorio está cuantizada en GGUF Q4_K_M para su uso con llama.cpp, lo que reduce el peso del repositorio a aproximadamente 1,5 GB y permite ejecución local en hardware modesto.

Su relevancia práctica reside en el enfoque: en lugar de un modelo generalista, se trata de un modelo especializado y pequeño, con salida JSON restringida por gramática, pensado para una tarea concreta de clasificación y resumen sobre texto ruidoso de OCR. La licencia LFM Open License v1.0 se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | en, fr |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base en la información proporcionada; el repositorio solo indica que se trata de un fine-tune de LiquidAI/LFM2.5-1.2B-Instruct, un modelo instructivo de aproximadamente 1,17 mil millones de parámetros. Tampoco se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la descripción cualitativa.

El entrenamiento del fine-tune se realizó sobre capturas de pantalla sintéticas, generadas a partir de personas y proyectos ficticios (incluidos proyectos de vida personal), combinadas con pantallas reales pseudonimizadas en las que se sustituyeron personas, proyectos, clientes, instituciones, direcciones y correos electrónicos. El prompt del sistema está definido en la propia aplicación (`services/ai/combined_prompt.py`) y la salida esperada es un JSON con tres claves: `summary` (cadena), `project_number` (número o `null`) y `confidence` (número). El autor recomienda usar temperatura 0 y un esquema JSON (gramática) para forzar las tres claves, tal como hace la aplicación.

## Capacidades

- Generación de resúmenes de una frase a partir de texto OCR de capturas de pantalla, en el idioma de la pantalla (inglés o francés).
- Clasificación contra una lista de proyectos proporcionada por el usuario, devolviendo el número de proyecto o `null` cuando no hay coincidencia.
- Salida estructurada en JSON con puntuación de confianza, restringida por gramática/esquema JSON.
- Manejo de entradas ruidosas derivadas de OCR y de descripciones de proyecto degradadas o incompletas.
- Distinción entre actividad laboral y proyectos de vida personal.
- Soporte multilingüe limitado a inglés y francés.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión nativa, audio ni modo de pensamiento explícito.

## Casos de uso

- Imputación automática de horas en la aplicación TimesheetMe: el modelo recibe el OCR de una captura y la lista de proyectos del usuario y devuelve directamente la entrada de parte de horas y el proyecto asociado, eliminando la introducción manual.
- Clasificación de actividad por proyecto en herramientas de productividad: a partir de texto de capturas de aplicaciones, el modelo asigna cada registro al proyecto correcto usando la lista cerrada de proyectos del usuario.
- Detección de actividad no imputable: cuando el texto corresponde a proyectos personales o a contenido sin proyecto asociado, el modelo devuelve `null`, lo que permite filtrar registros antes de enviarlos a facturación.
- Procesamiento por lotes de capturas históricas: con temperatura 0 y gramática JSON, se puede ejecutar el modelo sobre lotes de OCR para reconstruir partes de horas pasadas de forma reproducible.
- Integración en pipelines de escritorio con llama.cpp: el formato GGUF Q4_K_M y el tamaño de 1,17 mil millones de parámetros permiten empaquetar el modelo dentro de la propia aplicación sin depender de servicios en la nube.
- Enrutamiento con umbral de confianza: la puntuación `confidence` devuelta permite derivar a revisión humana los casos dudosos, manteniendo la automatización solo en los registros de alta confianza.
- Entornos con requisitos de privacidad: al ejecutarse localmente sobre texto OCR pseudonimizado, el modelo permite procesar capturas de pantalla sin enviar contenido a APIs externas.

## Benchmarks y rendimiento

El autor publica métricas de validación sobre personas sintéticas reservadas (held-out), no benchmarks estándar de NLP:

| Escenario de evaluacion | Precision de proyecto |
|---|---|
| Personas sinteticas reservadas (incluye "sin proyecto") | 89,0% |
| Descripciones de proyecto degradadas | 86,1% |
| Personas de vida personal | 80,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa aproximadamente 1,5 GB en GGUF Q4_K_M, por lo que la inferencia requiere del orden de 2 GB de memoria, aunque no se dispone de una cifra oficial del autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño del archivo Q4_K_M (alrededor de 1,5 GB), aunque no se especifica una lista de tarjetas validadas.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo chat. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TimesheetMe LFM2.5-1.2B (este modelo) | 1.170.340.608 | no disponible | en, fr | LFM Open License v1.0 | GGUF Q4_K_M |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | ~1,2B | no disponible | no disponible en esta ficha | LFM Open License v1.0 | safetensors y otras |
| Otras alternativas de ~1B para clasificación de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de propósito general de tamaño similar no está disponible en la información proporcionada; la diferencia principal frente al modelo base es la especialización en la tarea de parte de horas con salida JSON restringida.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para una única tarea (resumen de una frase y clasificación de proyecto a partir de OCR) y no debe esperarse un comportamiento generalista.
- Dependencia del prompt de la aplicación: el autor indica que el prompt está definido en `services/ai/combined_prompt.py`; usarlo fuera de ese formato puede degradar los resultados.
- Salida restringida por gramática: sin el esquema JSON de las tres claves, el modelo puede no producir JSON válido de forma fiable.
- Idiomas limitados a inglés y francés; no se documenta soporte para castellano.
- Precisión no perfecta: entre 80,0% y 89,0% en validación sintética, con caída en descripciones degradadas y en proyectos de vida personal, lo que hace recomendable un umbral de confianza y revisión humana.
- Riesgo de alucinación en el resumen: el texto de entrada proviene de OCR y puede contener errores; el modelo puede generar resúmenes imprecisos sobre contenido ruidoso.
- Sesgos: no se documentan análisis de sesgos; los datos de entrenamiento incluyen personas y proyectos sintéticos, lo que puede introducir sesgos de distribución difíciles de caracterizar.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (MIT/Apache) y se hereda del modelo base.
- Fecha de creación del repositorio: 19 de noviembre de 2026, con 421 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente y con poca validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TimesheetMe/timesheetme-lfm2.5-1.2b-release
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia: LICENSE (incluida en el repositorio, LFM Open License v1.0)
- Prompt de la aplicación: `services/ai/combined_prompt.py` (referenciado en la model card, no enlazado)
- Papers, blogs, repos y demos adicionales: no disponible
