# yeahyeahyeahyeah123123/Gemma-4-e2b-dolly-15k

## Resumen

Gemma-4-e2b-dolly-15k es un ajuste fino (fine-tune) del modelo unsloth/gemma-4-E2B-it, publicado por el usuario yeahyeahyeahyeah123123 en Hugging Face. Se trata de un modelo de generación de texto derivado de la familia Gemma 4 de Google, concretamente de la variante E2B en su versión instruction-tuned, sobre la que se ha aplicado un entrenamiento adicional con el dataset Dolly-15k. El resultado es un modelo orientado a conversación y generación de texto en formato MLX, pensado para ejecutarse en hardware Apple Silicon.

El modelo cuenta con aproximadamente 5.101 millones de parámetros según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0. La librería asociada es MLX, el framework de Apple para aprendizaje automático en chips M-series, lo que condiciona su despliegue al ecosistema Apple. El repositorio ocupa 10,2 GB y acumula 35 descargas en el momento de la consulta, lo que indica un uso muy limitado y un modelo de carácter experimental más que de producción.

La relevancia de este modelo es acotada: se trata de un fine-tune comunitario de bajo perfil, sin model card sustantiva ni benchmarks publicados, cuyo interés principal radica en servir como ejemplo de adaptación de Gemma 4 E2B a un dataset conversacional mediante MLX. No debe confundirse con los modelos oficiales de Google ni con los checkpoints de referencia de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B; detalles no disponibles) |
| Parametros totales | 5.101.150.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y formato MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 E2B, un transformer de la familia Gemma 4 de Google, en su variante instruction-tuned (unsloth/gemma-4-E2B-it). No se dispone de información detallada sobre el número de capas, dimensión de hidden state, mecanismos de atención ni innovaciones específicas de esta variante E2B en la información proporcionada. El sufijo E2B sugiere una configuración compacta dentro de la familia, pero no se confirma su significado exacto ni si emplea técnicas como atención lineal o decodificación especulativa.

El entrenamiento adicional se realizó sobre el dataset Dolly-15k, un conjunto de instrucciones y respuestas de propósito general creado por Databricks. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF o DPO, ni los hiperparámetros utilizados. La model card del autor es mínima y se limita a metadatos de licencia, pipeline y tags, sin documentar el proceso de fine-tuning.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruction-tuned.
- Respuesta a instrucciones de propósito general, reforzada por el ajuste con Dolly-15k.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución en Apple Silicon mediante MLX.

## Casos de uso

- Experimentación con fine-tuning sobre Gemma 4 E2B: el modelo sirve como referencia para desarrolladores que quieran replicar el pipeline de ajuste con Dolly-15k usando MLX y Unsloth.
- Prototipado de asistentes conversacionales en Mac: al estar en formato MLX, puede ejecutarse localmente en equipos Apple Silicon para pruebas de concepto de chat multi-turno.
- Evaluación comparativa de datasets de instrucciones: permite medir el efecto de Dolly-15k sobre un modelo base Gemma 4 E2B en tareas de seguimiento de instrucciones.
- Generación de texto en entornos de desarrollo con hardware Apple: útil para integrar generación de texto en scripts o herramientas locales sin depender de GPUs NVIDIA.
- Docencia y formación: ejemplo práctico de fine-tuning de un modelo abierto con licencia Apache 2.0 para cursos de IA.
- Investigación sobre modelos pequeños: su tamaño de ~5.100 millones de parámetros permite estudiar comportamientos de modelos compactos en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5.101 millones de parámetros, en fp16 se requieren aproximadamente 10,2 GB de memoria; en cuantizaciones de 8 bits, en torno a 5,1 GB; en 4 bits, alrededor de 2,6 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: al estar en formato MLX, el despliegue está orientado a chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para GPUs NVIDIA.
- Compatibilidad con GPU de consumo: previsiblemente sí en Apple Silicon con memoria unificada suficiente (16 GB o más para fp16; 8 GB para cuantización de 4 bits), aunque no está verificado.
- Opciones de despliegue: MLX (librería nativa del modelo). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-e2b-dolly-15k | ~5.100 M | no disponible | Apache 2.0 | safetensors (MLX) | Hugging Face, 35 descargas |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Gemma 4 E2B (oficial Google) | no disponible | no disponible | Gemma license | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Model card mínima: no se documentan sesgos, datos de entrenamiento detallados ni evaluación de calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks que lo cuantifiquen.
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingüe.
- Longitud de contexto no documentada; puede limitar conversaciones largas.
- Licencia Apache 2.0 declarada, pero el modelo base remite a la licencia de Gemma 4 de Google (license_link), lo que puede introducir condiciones adicionales para uso comercial; conviene revisar ambas licencias.
- Formato MLX restringe el despliegue a hardware Apple Silicon; no es directamente portable a ecosistemas CUDA sin conversión.
- Modelo comunitario con 0 likes y 35 descargas: sin validación externa ni mantenimiento garantizado.
- El ajuste con Dolly-15k puede introducir sesgos propios de ese dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeahyeahyeahyeah123123/Gemma-4-e2b-dolly-15k
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset Dolly-15k: no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
