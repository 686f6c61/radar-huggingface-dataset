# wonderland21127/REAX-G2-Distill-v4

## Resumen

REAX-G2-Distill-v4 es un modelo de la familia Gemma 4 (tag `gemma4` en Hugging Face) publicado por el usuario wonderland21127, con 31.273.086.512 parámetros totales según los pesos en safetensors. Se distribuye como un fine-tuning del modelo `tattrongvu/Jeffan-31b-1710` y está orientado a tareas de toma de decisiones y clasificación de texto con opción múltiple, además de soportar entrada imagen-texto (`image-text-to-text`). El pipeline declarado en el Hub es `text-classification`, aunque las capacidades multimodales y de razonamiento indican un uso más amplio.

El modelo se presenta como un "distill" de la generación G2 dentro del linaje REAX, lo que sugiere un proceso de destilación sobre un modelo base de 31B. La licencia es Apache 2.0, lo que permite uso comercial, pero el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. El repositorio ocupa 62,6 GB, coherente con pesos en precisión de 16 bits para 31B de parámetros.

La relevancia actual es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con documentación pública escasa. Resulta útil para quien necesite un clasificador/razonador de 31B con capacidades multimodales y quiera evaluar el linaje REAX, pero no hay información publicada sobre benchmarks, datos de entrenamiento ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `gemma4`, lo que lo sitúa en la arquitectura transformer de la familia Gemma 4 de Google, aunque no se detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de atención lineal o decodificación especulativa). El tamaño de 31,27B parámetros y el repo de 62,6 GB son consistentes con pesos en bf16/fp16 sin cuantizar.

El proceso de entrenamiento se describe únicamente como un fine-tuning/destilación sobre `tattrongvu/Jeffan-31b-1710`, con orientación a toma de decisiones (`decision-making`) y elección múltiple (`multiple-choice`). No se han publicado el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o destilación supervisada. Tampoco hay información sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto y razonamiento en tareas de decisión y elección múltiple (pipeline declarado: `text-classification`).
- Procesamiento imagen-texto (`image-text-to-text`), lo que implica capacidad multimodal de entrada visual.
- Clasificación de texto y etiquetado en escenarios con opciones discretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el tag `decision-making` sugiere uso en flujos de decisión, pero sin confirmación técnica.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías y prioridades a incidencias entrantes, aprovechando su pipeline de `text-classification` y su tamaño para captar matices en textos largos.
- Enrutamiento de decisiones en pipelines de negocio: dado un conjunto de opciones discretas (por ejemplo, aprobar/rechazar/escalar), el modelo puede seleccionar la etiqueta más probable, alineado con el tag `multiple-choice`.
- Moderación de contenido con contexto visual: gracias a la entrada imagen-texto, puede clasificar publicaciones que combinan texto e imagen en categorías de riesgo.
- Etiquetado de datasets para entrenamiento: uso como anotador automático de grandes volúmenes de texto en tareas de clasificación, reduciendo coste de anotación humana.
- Evaluación de respuestas en sistemas de QA: puede puntuar o clasificar la adecuación de respuestas candidatas en un pipeline de generación aumentada.
- Análisis de documentos con imágenes: clasificación de formularios, capturas o documentos escaneados junto con su texto asociado.
- Investigación sobre destilación: como objeto de estudio para comparar el comportamiento del modelo base `Jeffan-31b-1710` frente a su versión destilada REAX-G2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- En cuantización de 8 bits: ~31 GB de pesos, viable en una A100 40GB o H100 80GB con margen.
- En cuantización de 4 bits: ~16 GB de pesos, podría caber en una RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB, H200; para cuantización 4 bits, RTX 4090 o RTX 6000 Ada.
- Consumer GPU: solo en cuantización agresiva (4 bits) y con contexto reducido; no cabe en GPUs de 8-16 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| REAX-G2-Distill-v4 | 31,27B | no disponible | Apache 2.0 | Gated | Fine-tune de Jeffan-31b-1710; multimodal; sin benchmarks |
| tattrongvu/Jeffan-31b-1710 (base) | ~31B (según nombre) | no disponible | no disponible | no disponible | Modelo base del que deriva el fine-tune |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Abierto | Alternativa de tamaño similar en la familia Gemma, con benchmarks públicos |

No se dispone de datos de rendimiento del modelo ni de comparativas verificadas con alternativas de la misma categoría, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar calidad, sesgos ni robustez frente a alternativas.
- Documentación mínima: no se detallan datos de entrenamiento, idiomas, contexto ni proceso de alineación, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación: inherente a modelos generativos de este tamaño; sin evaluación publicada, el riesgo no está cuantificado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que los términos del modelo base `Jeffan-31b-1710` sean compatibles, ya que la licencia del derivado no anula las obligaciones del original.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe sin evaluación.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay evidencia de uso en producción ni reportes de terceros.
- El tag `gemma4` sugiere dependencia de la familia Gemma, pero no se confirma la versión exacta ni los términos de la licencia Gemma original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wonderland21127/REAX-G2-Distill-v4
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-31b-1710
