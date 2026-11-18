# taobao-mnn/gpt-oss-20b-MNN

## Resumen

gpt-oss-20b-MNN es un paquete de inferencia cuantizado en 4 bits con HQQ del modelo openai/gpt-oss-20b, publicado por el equipo taobao-mnn (Alibaba) para su ejecución sobre el motor MNN. No es un modelo nuevo: es una conversión del checkpoint original de OpenAI orientada a despliegue local eficiente en CPU y dispositivos con recursos limitados, manteniendo la licencia Apache 2.0 del modelo base.

El modelo subyacente, gpt-oss-20b, es un transformer de tipo mezcla de expertos (MoE) con 21.000 millones de parámetros totales y 3,6 millones activos por token, diseñado por OpenAI para razonamiento configurable y uso agéntico. Esta conversión conserva 24 capas, 32 expertos enrutados (4 seleccionados por token) y el formato de respuesta Harmony, pero sustituye las capas lineales de texto por pesos HQQ de 4 bits con grupo de 64 y escalas FP16, mientras que los embeddings se almacenan en BF16.

Su relevancia práctica está en que permite ejecutar un MoE de 21B en hardware modesto sin GPU dedicada, usando el runtime MNN con soporte de bajo consumo de memoria. El paquete incluye tokenizer propio, plantilla de chat y scripts de conversión reproducibles, lo que facilita auditorías y reexportaciones. No obstante, la validación publicada por el autor se limita a seis casos de humo funcionales en CPU, no a una evaluación amplia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 21B (21.000 millones) |
| Parametros activos | 3,6B por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit, group size 64, escalas FP16; embeddings BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (pesos convertidos para el runtime MNN); checkpoint original en safetensors MXFP4 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de mezcla de expertos con 24 capas, 32 expertos enrutados y 4 expertos activos por token, lo que da 21B parámetros totales y 3,6B activos. Esta conversión no reentrena el modelo: exporta el checkpoint original mediante `llmexport.py` de MNN con cuantización HQQ de 4 bits (bloque 64, escalas de 16 bits) para las capas lineales de texto, y mantiene los embeddings de tokens en BF16 en un fichero separado. El checkpoint original de OpenAI usa formato MXFP4, por lo que la conversión requiere activar `dequantize: true` en la configuración de cuantización antes de exportar.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, etapas de RLHF/DPO) no se recogen en la información proporcionada. La model card del paquete MNN indica que la revisión del runtime incluye correcciones de exportación para MoE y que se preservan la plantilla Harmony y el tokenizer verificados del paquete publicado, con el objetivo de mantener la distinción entre canal de razonamiento y respuesta final.

## Capacidades

- Generación de texto y razonamiento con esfuerzo de razonamiento configurable (heredado de gpt-oss-20b).
- Capacidades agénticas y de razonamiento multi-paso según el modelo base.
- Formato de respuesta Harmony, con canales separados para razonamiento, respuesta final y control.
- Ejecución local en CPU mediante el runtime MNN con `MNN_LOW_MEMORY` activado.
- Soporte de plantilla de chat y tokenizer empaquetados (`tokenizer.mtok`, plantilla Jinja).
- Capacidades multilingües limitadas al inglés según los metadatos del paquete.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta conversión concreta.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU: el paquete MNN con HQQ 4-bit permite ejecutar un MoE de 21B en CPU usando `llm_demo` y `llm_bench`, adecuado para pruebas y prototipos en entornos con memoria limitada.
- Asistentes de razonamiento en dispositivos edge: el bajo número de parámetros activos (3,6B) y la cuantización de 4 bits reducen el coste por token, lo que facilita su integración en aplicaciones de escritorio o embebidas con MNN.
- Evaluación y auditoría de modelos abiertos: los scripts de conversión reproducibles permiten regenerar los pesos y verificar la integridad del proceso de cuantización en pipelines internos.
- Investigación sobre cuantización HQQ: sirve como referencia práctica para medir el impacto de HQQ 4-bit con grupo 64 sobre un MoE en tareas de razonamiento y generación.
- Prototipado de agentes con formato Harmony: la plantilla preservada permite experimentar con canales de razonamiento y control sin reentrenar el modelo.
- Docencia y experimentación con MoE: el paquete permite estudiar el comportamiento de un MoE de 32 expertos en hardware asequible, comparando resultados con el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta que la migración superó 6 casos de humo funcionales en CPU (modos High y Low), que son comprobaciones de funcionamiento y no una evaluación amplia de calidad ni de rendimiento en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete está orientado a ejecución en CPU con MNN y modo de bajo consumo de memoria.
- GPU recomendadas: no especificadas en la información proporcionada; el paquete se valida en CPU (build Linux con `MNN_LOW_MEMORY=ON`).
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del repositorio es de 25,4 GB, lo que da una idea del espacio en disco necesario; la huella en memoria depende del runtime y de la cuantización.
- Opciones de despliegue: MNN (`llm_demo`, `llm_bench`) con la revisión `7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; `llm_bench` permite medirlos en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-MNN (este) | 21B totales / 3,6B activos | no disponible | Apache 2.0 | MNN, HQQ 4-bit | Conversión para CPU con MNN |
| openai/gpt-oss-20b | 21B totales / 3,6B activos | no disponible | Apache 2.0 | safetensors, MXFP4 | Checkpoint original; requiere runtime compatible |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La validación publicada se limita a 6 casos de humo en CPU; no hay evidencia de calidad amplia ni de rendimiento en GPU.
- La cuantización HQQ 4-bit puede degradar la precisión respecto al checkpoint original; no se han publicado métricas de esa degradación.
- El paquete declara únicamente inglés como idioma soportado.
- La longitud de contexto no se especifica en la información disponible; conviene consultar la configuración (`llm_config.json`) antes de usarlo en producción.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta conversión.
- Sesgos conocidos del modelo base: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar la atribución y los avisos del modelo original de OpenAI.
- El paquete depende de una revisión concreta de MNN; cambios de versión pueden romper la compatibilidad de pesos y plantilla.
- El formato Harmony exige preservar la plantilla y distinguir el canal de razonamiento del de respuesta; un uso incorrecto puede producir salidas mal formadas.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/taobao-mnn/gpt-oss-20b-MNN
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio MNN: https://github.com/alibaba/MNN
- Revisión de MNN usada: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentación MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
