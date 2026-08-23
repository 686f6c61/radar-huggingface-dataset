# W00ds1/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, un fine-tuning de la familia Qwen 3.5 con 8.953.803.264 parámetros (9B) y ventana de contexto nativa de 256.000 tokens. El modelo original es un ajuste multi-etapa y multi-modelo realizado por DavidAU y Nightmedia sobre la base Qwen 3.5 9B, orientado a elevar la inteligencia general y el seguimiento de instrucciones, con un bloque de razonamiento compactado y una capa de visión activada (requiere un archivo `mmproj` adicional).

La versión publicada por W00ds1 ofrece dos familias de cuantizaciones: las regulares y las MTP (multi-token prediction), ambas con calibración NEO IMATRIX que mejora la precisión de los quants entre un 2 y un 4 %, y con el tensor de salida en precisión completa de 16 bits. Según el autor, el modelo supera los 7 benchmarks críticos de Qwen 3.5 27B y Qwen 3.6 35B-A3B en cuantizaciones de 4 y 8 bits, manteniendo una velocidad de inferencia notablemente alta (hasta 185 t/s en MTP sobre RTX 5090). Es un modelo abliterado y sin censura, lo que implica que no rechaza peticiones explícitas; esta característica debe tenerse en cuenta para evaluar su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 3.5) con visión multimodal y MTP |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | GGUF: Q8_0, Q6_K, Q5_K, Q4_K, Q4_K_S, Q3_K, Q2_K, entre otros (regulares y MTP) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del modelo base en bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen 3.5 9B (transformer denso) y ha sido sometido a un proceso de ajuste en múltiples etapas y con múltiples modelos, combinando fine-tuning y merges realizados por DavidAU y Nightmedia. Según la model card, se emplearon varios fine-tunes previos del mismo autor sobre Qwen 3.5 9B, y se aplicó una técnica de "Heretic'ing" (abliteración) posterior al entrenamiento, lo que elimina las negativas del modelo original. El bloque de razonamiento o "thinking" se ha compactado y reforzado para mejorar la calidad del razonamiento interno.

La cuantización GGUF es NEO IMATRIX, que mejora la precisión de los quants entre un 2 y un 4 % sobre los GGUF convencionales, además de mejorar el rendimiento en contextos largos. Los tensores de salida se mantienen a 16 bits en todas las cuantizaciones. La variante MTP (multi-token prediction) predice dos tokens por paso, con los tensores MTP fijados a Q8_0. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto, razonamiento y seguimiento de instrucciones, con modo "thinking" (razonamiento) y modo "instruct" (no pensamiento).
- Capacidad de razonamiento y resolución de problemas, con métricas que superan en varios benchmarks a modelos de 27B y 35B (ver sección de benchmarks).
- Soporte de visión multimodal: el modelo puede procesar imágenes, pero requiere descargar un archivo `mmproj` separado y colocarlo junto al GGUF.
- Soporte de tool calling y function calling (propio de la arquitectura Qwen 3.5, aunque no se detalla explícitamente en la model card).
- Capacidad multilingüe limitada a inglés y chino según la model card.
- MTP (multi-token prediction) para acelerar la generación en la variante MTP, con velocidades superiores al 60 % de aceptación.
- Modelo sin censura (uncensored) y abliterado, que no rechaza peticiones.

## Casos de uso

- Generación de código en producción: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar y revisar código. Con contexto de 256k, puede trabajar con repositorios completos en una sola pasada.
- Razonamiento y análisis técnico: su bloque de razonamiento compactado y sus resultados en benchmarks como ARC-c y BoolQ lo hacen adecuado para tareas de análisis complejo, resolución de problemas y toma de decisiones en entornos de investigación.
- Escritura creativa y ficción: al ser un modelo sin censura, permite explorar temas que otros modelos rechazan, lo que puede ser útil en prototipos de escritura creativa, roleplay o generación de narrativa con restricciones mínimas.
- Asistencia multimodal en documentación: al activar la visión con el archivo `mmproj`, el modelo puede describir imágenes, extraer texto de capturas y responder preguntas sobre diagramas técnicos.
- Conversación y atención al cliente en inglés y chino: con su ventana de 256k tokens puede gestionar conversaciones multi-turno con historial largo, aunque se debe evaluar su sesgo de idioma.
- Inferencia local de alto rendimiento: con cuantizaciones GGUF y soporte de MTP, el modelo puede desplegarse en una GPU de consumo (por ejemplo RTX 5090) alcanzando más de 185 t/s, lo que lo hace adecuado para aplicaciones en tiempo real sin depender de APIs externas.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para el modelo en tres precisiones (bf16, mxfp8 y mxfp4) comparados con otros modelos de la familia Qwen. Se presentan los valores en modo "instruct".

| Modelo | ARC-c | ARC-e | BoolQ | HSWAG | OBQA | PIQA | Wino |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Qwen3.5-9B-The-Defiant-Fable (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Qwen3.5-9B-The-Defiant-Fable (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.6-27B-Instruct (mxfp8) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct (mxfp8) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

Según el autor, el modelo supera los 7 benchmarks críticos de Qwen 3.5 27B y Qwen 3.6 35B-A3B, y en algunos casos iguala a Qwen 3.6 27B, tanto en 4 bits como en 8 bits. No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_S (~4.5 GB) el modelo cabe en GPU con 8 GB de VRAM; para Q8_0 (~9 GB) se recomienda al menos 12 GB. Con contexto de 256k tokens, la memoria de caché KV aumenta notablemente, por lo que en la práctica se recomienda reducir el contexto a 8k-16k en GPU de consumo.
- GPU recomendadas: RTX 4090, RTX 5090, A100, H100. En RTX 5090 el autor reporta ~130 t/s en GGUF regular y hasta ~185 t/s en MTP (aceptación del 60 %).
- Compatibilidad con GPU de consumo: sí, con cuantizaciones Q4_K_S o Q4_K_M en GPU de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI (con conversión). El formato GGUF es compatible con la mayoría de motores de inferencia locales.
- Latencia y throughput: no se han publicado métricas estandarizadas; los valores de 130-185 t/s son pruebas del autor en una RTX 5090 con LM Studio en Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos destacados |
|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (este) | 8.9B | 256k | Apache-2.0 | Sin censura, visión, MTP, supera benchmarks de 27B |
| Qwen3.5-9B-Instruct (base) | 8.9B | 256k | Apache-2.0 | Censura activa, sin abliteración, rendimiento inferior en benchmarks |
| Qwen3.6-27B-Instruct | 27B | 256k | Apache-2.0 | Más grande, mejor en algunos benchmarks (BoolQ, HSwag, PIQA) |
| Qwen3.6-35B-A3B-Instruct | 35B (MoE, 3B activos) | 256k | Apache-2.0 | MoE eficiente, mejor en ARC-c que este modelo |

La comparativa se basa en los datos de benchmarks proporcionados por el autor. No se dispone de información sobre otros modelos de la misma categoría fuera de la familia Qwen.

## Limitaciones y advertencias

- Modelo sin censura y abliterado: no rechaza peticiones, lo que puede generar contenido inapropiado, dañino o ilegal. No es adecuado para aplicaciones públicas sin moderación externa.
- Riesgo de alucinación: no hay métricas de exactitud factual en la model card; se recomienda verificar las salidas en aplicaciones críticas.
- Idiomas limitados a inglés y chino: no se ha evaluado el rendimiento en otros idiomas, incluido el castellano.
- La visión requiere descargar un archivo `mmproj` adicional y colocarlo junto al GGUF; sin él, el modelo no procesa imágenes.
- La variante MTP degrada su rendimiento con temperaturas superiores a 1 o con repetition penalty >1; se recomienda usar las cuantizaciones regulares en escenarios creativos o con alta temperatura.
- El autor advierte que superar los benchmarks de 27B no garantiza superarlo en todas las tareas; hay que evaluar según el caso de uso.
- El repositorio tiene 147.5 GB en total (todas las variantes de cuantización); hay que seleccionar el archivo adecuado.
- No se han publicado datos sobre el dataset de entrenamiento, el número de tokens ni el proceso de RLHF/DPO, lo que limita la evaluación de riesgos de sesgo.

## Enlaces

- Repositorio GGUF (W00ds1): https://huggingface.co/W00ds1/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Cuantizaciones GGUF del autor original (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Referencia externa en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-davidau
- Referencia externa en interfaze.ai: https://interfaze.ai/models/davidauqwen35-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
- Referencia externa en aiany.app: https://aiany.app/item/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
