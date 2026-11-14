# tjdavid/kvark-sparkle-1.1-exl3-4bpw

## Resumen

Kvark-Sparkle-1.1-27B EXL3 4.0 bpw es una cuantización de 4 bits del modelo Kvark-Sparkle-1.1-27B, un ajuste fino de Qwen3.8-27B desarrollado por Egzakta y orientado específicamente al trabajo con documentos: búsqueda sobre una base documental, respuesta fundamentada en lo encontrado y rechazo explícito cuando la respuesta no está en los documentos. Esta variante concreta, publicada por el usuario tjdavid, emplea el formato EXL3 (ExLlamaV3) con 4.0 bits por peso en el decodificador y 4 bpw en la cabeza, calibrada con 128 filas y 1024 columnas, y está pensada para GPUs con 20 GB de VRAM como la RTX 3080, manteniendo contexto largo y decodificación especulativa MTP.

El modelo base declara 27.800 millones de parámetros en BF16 con una arquitectura Qwen3.8 sin modificar: 64 capas, de las cuales 48 usan atención lineal y 16 atención completa, con 24 cabezas de consulta y 4 cabezas clave-valor de dimensión 256, tamaño oculto de 5120 y un vocabulario de 248.320 tokens. La ventana de contexto nativa es de 262.144 tokens, aunque la evaluación publicada llega hasta 64k. La relevancia actual del modelo reside en su enfoque en eficiencia de razonamiento: según el autor, en benchmarks públicos no muestra diferencias significativas frente a Qwen3.8-27B y emplea entre un 7 % y un 48 % menos de tokens de razonamiento en la mediana.

El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales de entrada, aunque la model card no detalla la torre de visión ni los datos de entrenamiento multimodal. La licencia es Apache 2.0 y los idiomas declarados son inglés y serbio. El repositorio de esta cuantización ocupa 16,2 GB y contiene pesos en safetensors compatibles con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B sin modificar (transformer híbrido: 48 capas de atención lineal, 16 de atención completa) |
| Parametros totales | 27,8B en BF16 (modelo base); la cuantización EXL3 declara 8.095.667.584 parámetros en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; evaluado hasta 64k |
| Tipos de cuantizacion | EXL3 4.0 bpw (decodificador) y 4 bpw (cabeza); el modelo base ofrece BF16, FP8 y GGUF de BF16 a IQ4_XS |
| Idiomas soportados | inglés (en), serbio (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.8-27B sin cambios estructurales, con 64 capas que combinan 48 capas de atención lineal y 16 de atención completa. La atención completa usa 24 cabezas de consulta y 4 cabezas clave-valor con dimensión de cabeza 256, tamaño oculto de 5120 y vocabulario de 248.320 tokens. Incluye una cabeza MTP (multi-token prediction) que habilita decodificación especulativa, y el autor indica que el modelo fue entrenado con una regla de parada explícita para agentes documentales, que se distribuye en el fichero `stop_system.txt` del repositorio base.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican los detalles del ajuste fino que transforma Qwen3.8-27B en Sparkle 1.0 ni de la iteración 1.1. La innovación técnica destacada es la eficiencia de razonamiento: el autor reporta medianas de tokens de razonamiento notablemente inferiores a Qwen3.8-27B en GPQA Diamond (4.471 frente a 7.670), AIME 2026 (8.732 frente a 14.822), HMMT (13.540 frente a 21.182), LiveCodeBench (8.607 frente a 15.276), IFEval (646 frente a 695), MMLU-Pro (518 frente a 708) y FRAMES (644 frente a 1.228).

Esta variante EXL3 introduce una cuantización de 4 bits calibrada con 128 filas y 1024 columnas, orientada a preservar el contexto largo y la decodificación especulativa MTP en GPUs de 20 GB de VRAM.

## Capacidades

- Generación de texto y razonamiento con modo thinking, evaluado en GPQA Diamond, AIME 2026, HMMT y MMLU-Pro.
- Generación de código, con resultados declarados en LiveCodeBench sobre los 150 problemas más recientes.
- Seguimiento de instrucciones a nivel de prompt, medido con IFEval en precisión estricta.
- Trabajo documental: búsqueda sobre una base de documentos, respuesta fundamentada y rechazo explícito cuando la respuesta no está presente.
- Razonamiento agéntico multi-paso con tool calling implícito en el flujo de búsqueda documental (etiquetas agentic-rag y document-qa).
- Regla de parada entrenada para limitar búsquedas improductivas y forzar una línea `Final answer:` en cada respuesta.
- Capacidades multimodales de entrada declaradas por el pipeline image-text-to-text, aunque sin detalle en la model card.
- Soporte multilingüe limitado a inglés y serbio según los metadatos.
- Decodificación especulativa MTP para acelerar la inferencia.

## Casos de uso

- Preguntas y respuestas sobre bases documentales corporativas: el modelo busca en el corpus, responde a partir de los fragmentos encontrados y declina la respuesta con `NOT IN DOCUMENTS` cuando no hay evidencia, lo que reduce respuestas inventadas en entornos de compliance.
- Agentes RAG con control de coste: la regla de parada entrenada evita bucles de búsqueda improductivos tras tres consultas sin resultados relevantes, lo que abarata las llamadas a herramientas en pipelines de recuperación.
- Asistentes de atención al cliente con base de conocimiento: la ventana de 262.144 tokens permite incluir manuales extensos y el modelo mantiene conversaciones multi-turno citando el documento fuente.
- Análisis de documentación técnica y contratos: la combinación de contexto largo y rechazo explícito permite extraer cláusulas o especificaciones y señalar cuándo un dato no figura en el texto.
- Generación y revisión de código en pipelines de CI/CD: los resultados declarados en LiveCodeBench y el soporte de razonamiento eficiente lo hacen adecuado para tareas de completado y revisión con coste de tokens contenido.
- Evaluación de calidad de respuestas en sistemas de búsqueda: el modelo puede actuar como juez o verificador de que una respuesta está respaldada por los documentos recuperados, gracias a su comportamiento entrenado de declinar cuando falta evidencia.
- Despliegue en estaciones de trabajo con GPU de 20 GB: la cuantización EXL3 de 4 bpw permite ejecutar un modelo de 27,8B en una RTX 3080 manteniendo contexto largo y decodificación especulativa.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Kvark-Sparkle-1.1-27B |
|---|---|---|
| GPQA Diamond | accuracy (4 seeds, thinking on, FP8) | 88,3 |
| LiveCodeBench | pass@1 (150 problemas más recientes) | 86,0 |
| IFEval | prompt-level strict accuracy | 91,1 |
| MMLU-Pro | accuracy (subconjunto de 980 ítems) | 84,0 |
| FRAMES | accuracy (juez LLM) | 69,8 |

Comparación declarada frente a Qwen3.8-27B en la model card:

| Benchmark | Sparkle 1.1 | Qwen3.8-27B |
|---|---|---|
| GPQA Diamond | 88,3 | 88,8 |
| AIME 2026 | 92,5 | 95,8 |
| HMMT | 88,1 | 86,1 |
| LiveCodeBench | 86,0 | 82,0 |
| IFEval | 91,1 | 90,8 |
| MMLU-Pro | 84,0 | 83,6 |
| FRAMES | 69,8 | 70,6 |

En trabajo documental sobre GroundedWork, el autor reporta 91,0 para Sparkle 1.1 con la regla de parada, frente a 89,5 de Sparkle 1.0 con la misma regla y 86,2 de Sparkle 1.0 sin ella. En preguntas cuya respuesta no está en los documentos, el porcentaje de rechazos correctos es del 91,5 % para Sparkle 1.1, frente al 74 % de Sparkle 1.0 con regla y el 36 % sin regla.

## Requisitos de hardware

- VRAM estimada: la cuantización EXL3 de 4.0 bpw está diseñada para GPUs de 20 GB de VRAM, como la RTX 3080, manteniendo contexto largo y MTP.
- El repositorio de esta cuantización ocupa 16,2 GB en disco; el modelo base en BF16 ocupa 55,6 GB y la variante FP8 30,9 GB.
- GPU recomendadas: RTX 3080 (20 GB) como objetivo declarado; para el modelo base en BF16 se requiere hardware de mayor capacidad (A100 80 GB, H100, o múltiples GPUs).
- Cabe en GPU de consumo: sí, en el caso de esta cuantización EXL3 de 4 bpw en GPUs de 20 GB; las variantes GGUF del modelo base van de 15,3 a 54,7 GB según cuantización.
- Opciones de despliegue: ExLlamaV3 para esta cuantización; vLLM para la variante FP8; llama.cpp para los GGUF; transformers como librería declarada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kvark-Sparkle-1.1-27B (EXL3 4 bpw) | 27,8B (8,1B en safetensors de esta cuantización) | 262.144 tokens | Apache 2.0 | Hugging Face | Especializado en trabajo documental y razonamiento eficiente |
| Qwen3.8-27B | 27,8B | 262.144 tokens | no disponible en la información | Hugging Face | Modelo base; referencia directa en los benchmarks del autor |
| Kvark-Sparkle-1.0-27B | 27,8B | no disponible | Apache 2.0 | Hugging Face | Iteración anterior; peor rechazo de preguntas sin respuesta (74 % frente a 91,5 %) |

## Limitaciones y advertencias

- Los benchmarks son datos declarados por el autor y no han sido verificados de forma independiente; deben tomarse con cautela.
- El modelo está entrenado con una regla de parada específica; sin ella, según el propio autor, declina muchas menos preguntas cuya respuesta no está en los documentos (36 % frente a 91,5 %).
- Los idiomas declarados son únicamente inglés y serbio; el rendimiento en castellano no está documentado.
- El pipeline image-text-to-text sugiere multimodalidad, pero la model card no detalla la torre de visión ni su entrenamiento, por lo que su fiabilidad en tareas visuales es desconocida.
- La cuantización EXL3 de 4 bpw puede introducir degradación frente al BF16 original, especialmente en contexto muy largo; no se han publicado comparativas de esta variante frente al modelo completo.
- Riesgo de alucinación inherente a los modelos de lenguaje, mitigado parcialmente por la regla de parada pero no eliminado.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B podría tener condiciones adicionales no reflejadas en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su comportamiento en producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/tjdavid/kvark-sparkle-1.1-exl3-4bpw
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B
- Iteración anterior: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Variante FP8 para vLLM: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B-FP8
- Variante GGUF para llama.cpp: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B-GGUF
