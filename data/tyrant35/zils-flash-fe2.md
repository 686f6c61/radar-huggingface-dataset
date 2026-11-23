# tyrant35/zils-flash-fe2

## Resumen

zils-flash-fe2 es un fine-tune del modelo Qwen/Qwen3.5-9B publicado por el usuario tyrant35 bajo la etiqueta `zils` y la categoría de "decision-model". Se trata de un modelo de 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) distribuido en formato safetensors, con un repositorio de 16,8 GB y licencia Apache 2.0. El modelo se presenta como un "soup-pool body" del chasis stock z3-flash (vllm-sr/d3-flash, cuyo padre es Qwen/Qwen3.5-9B).

La construcción del modelo consiste en el promedio de dos fine-tunes LoRA de rango 32 (semillas 1 y 2, tasa de aprendizaje 2e-4) aplicados sobre el chasis original. El entrenamiento se realizó sobre datos públicos de una docena de conjuntos de datos orientados a tareas de decisión y razonamiento (iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, ANLI, Humicroedit, RAGTruth, HellaSwag, WinoGrande, CLINC150 y BANKING77), combinando etiquetas gold al 50% con las propias probabilidades del chasis al 50%.

La relevancia de este modelo radica en su enfoque especializado: no busca ser un modelo generalista, sino preservar el comportamiento del chasis original (mediante el aprendizaje de sus propias probabilidades de respuesta en unas 16.500 prompts de decisión públicos y generados) mientras se ajusta para tareas de clasificación, verificación de hechos, detección de alucinaciones y razonamiento lógico. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B; no se detalla la arquitectura interna en la model card) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del chasis stock z3-flash (vllm-sr/d3-flash), cuyo modelo padre es Qwen/Qwen3.5-9B. Sobre ese chasis se aplicaron dos fine-tunes LoRA de rango 32 con semillas 1 y 2 y tasa de aprendizaje 2e-4, y el resultado final es el promedio de ambos merges (técnica de "soup-pool"). La model card no detalla la arquitectura interna del transformer base (número de capas, dimensión oculta, mecanismo de atención, etc.), por lo que esos datos no están disponibles.

El entrenamiento utilizó únicamente los splits de train de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, ANLI, Humicroedit, RAGTruth, HellaSwag, WinoGrande, CLINC150 y BANKING77, más los splits de dev de VAST y NLI4CT. No se usó ningún split de test de benchmark. Los objetivos de entrenamiento mezclan la etiqueta gold (peso 0,5) con las propias probabilidades del chasis (peso 0,5). Además, el modelo aprendió las probabilidades de respuesta del chasis original sobre aproximadamente 16.500 prompts de decisión públicos y generados, con el fin de preservar el comportamiento original del chasis en otras tareas. No se menciona el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Clasificación y decisión sobre tareas de razonamiento: el modelo está ajustado específicamente sobre datasets de decisión (CLadder, ANLI, HellaSwag, WinoGrande, CLINC150, BANKING77).
- Verificación de hechos y detección de alucinaciones: entrenado con HoVer y RAGTruth, orientado a evaluar la veracidad de afirmaciones y la fidelidad de resúmenes generados.
- Análisis de sarcasmo e ironía: fine-tune sobre iSarcasmEval.
- Razonamiento sobre imágenes y texto en tareas de decisión: entrenado con VAST, un dataset multimodal de valoración de escenas.
- Razonamiento clínico y evidencia: entrenado con NLI4CT (inferencia de lenguaje natural sobre ensayos clínicos).
- Búsqueda y relevancia en comercio electrónico: entrenado con Amazon ESCI (clasificación de intención de búsqueda).
- Edición de humor y manipulación de texto: entrenado con Humicroedit.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada (aunque el entrenamiento con VAST sugiere cierta capacidad multimodal heredada del chasis, no se confirma).

## Casos de uso

- Moderación de contenido y detección de sarcasmo: el modelo puede clasificar comentarios o publicaciones como sarcásticos o literales gracias al fine-tune sobre iSarcasmEval, útil en sistemas de análisis de sentimiento y moderación de comunidades.
- Verificación de hechos en pipelines de generación aumentada (RAG): entrenado con HoVer y RAGTruth, puede evaluar si una afirmación generada está respaldada por las fuentes recuperadas, integrándose como filtro de fidelidad en sistemas RAG.
- Clasificación de intención en asistentes conversacionales: el fine-tune sobre CLINC150 y BANKING77 permite enrutar consultas de usuarios hacia intents predefinidos en chatbots de banca o atención al cliente.
- Razonamiento lógico y respuesta a preguntas causales: el entrenamiento con CLadder y ANLI lo hace adecuado para tareas de inferencia lógica y detección de contradicciones en textos.
- Evaluación de evidencia clínica: con NLI4CT, puede asistir en la verificación de afirmaciones médicas contra resúmenes de ensayos clínicos, como apoyo a revisores o sistemas de búsqueda biomédica.
- Análisis de relevancia en motores de búsqueda de e-commerce: el fine-tune sobre Amazon ESCI permite clasificar la relación entre consulta y producto (exacta, sustituta, complementaria, irrelevante) en sistemas de recomendación.
- Detección de manipulación de texto y humor: con Humicroedit, puede identificar ediciones que alteran el significado humorístico de titulares, útil en análisis de medios.
- Evaluación de modelos en tareas de sentido común: con HellaSwag y WinoGrande, puede usarse como componente de evaluación o como clasificador de coherencia en generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de los propios datasets de entrenamiento, y no se proporcionan comparaciones numéricas con el chasis original ni con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,4 mil millones de parámetros en precisión completa (fp32) se requieren aproximadamente 33,6 GB; en fp16/bf16 unos 16,8 GB; en cuantización de 8 bits unos 8,4 GB; en 4 bits unos 4,2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para fp16 se recomienda una A100 40 GB, H100 80 GB o RTX 4090 24 GB; para cuantización 8 bits basta una RTX 3090/4090 24 GB; para 4 bits podría caber en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Cabe en GPU consumer: sí, en cuantizaciones de 8 y 4 bits, siempre que se genere la versión cuantizada (el repo solo incluye safetensors).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers, siempre que se conviertan los pesos a los formatos correspondientes (el repo no incluye GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-fe2 | 8,39 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune especializado en tareas de decisión |
| Qwen/Qwen3.5-9B | ~9 B | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| vllm-sr/d3-flash | no disponible | no disponible | no disponible | Hugging Face | Chasis stock sobre el que se aplica el fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse sobre datasets públicos diversos (sarcasmo, humor, banca, comercio), puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinación: el modelo está parcialmente entrenado con RAGTruth para detectar alucinaciones, pero no se garantiza que él mismo no las produzca; no hay evaluación publicada.
- Limitaciones de contexto o idioma: no se especifican la longitud de contexto ni los idiomas soportados; el entrenamiento se realizó sobre datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se desconoce si el modelo base Qwen/Qwen3.5-9B impone restricciones adicionales; conviene verificar la licencia del modelo padre.
- Caveats para producción: el modelo tiene cero descargas y cero likes, sin validación comunitaria ni benchmarks publicados; el repositorio solo contiene safetensors (16,8 GB), sin versiones cuantizadas ni GGUF, lo que obliga a convertirlo para despliegue en consumer GPU. No se documenta el pipeline de inferencia ni la tokenizer utilizada.
- El entrenamiento mezcla etiquetas gold con probabilidades del chasis (50/50), lo que puede diluir la especialización en las tareas objetivo y hacer que el modelo se comporte de forma más conservadora que un fine-tune puro.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-flash-fe2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Chasis stock: https://huggingface.co/vllm-sr/d3-flash (referenciado en la model card)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
