# uthayamurthy/origin-task1-t5gemma2-270m

## Resumen

El modelo `uthayamurthy/origin-task1-t5gemma2-270m` es un ajuste fino completo (full-parameter fine-tuning) del checkpoint `google/t5gemma-2-270m-270m`, desarrollado por el usuario uthayamurthy para la tarea 1 del desafío SciHigh-2026. Su propósito es generar *research highlights* (resúmenes destacados) concisos a partir de abstracts de artículos científicos, una tarea de summarization especializada en el dominio académico.

El modelo base, T5Gemma 2 270M-270M, pertenece a la familia T5Gemma 2 de Google, que adapta decoders preentrenados (Gemma 3) a una arquitectura encoder-decoder mediante el objetivo UL2. Esta versión de 270M-270M (encoder y decoder) incorpora mejoras como embeddings atados entre encoder y decoder, atención self y cross fusionada, y soporte nativo para contexto largo de hasta 128k tokens. El checkpoint ajustado aquí tiene 786 millones de parámetros totales (según los pesos safetensors), superando la cifra nominal del nombre del modelo base, y se distribuye bajo la licencia Gemma.

La relevancia de este modelo radica en su especialización: está entrenado con 10.000 ejemplos del split MixSub-SciHigh de SciHigh Task 1, lo que lo convierte en una herramienta práctica para automatizar la generación de resúmenes destacados en el flujo de publicación científica, con métricas de validación razonables (ROUGE-1 de 0,3818 y BERTScore F1 de 0,8775).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma 2, adaptado de Gemma 3) |
| Parametros totales | 786.029.296 (786M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens (modelo base); el fine-tuning usa max input de 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base T5Gemma 2 270M-270M es un encoder-decoder construido mediante adaptación de un decoder-only preentrenado (Gemma 3) usando el objetivo UL2. La arquitectura sigue el diseño de T5 con mejoras de Gemma 2: atención con GQA (Grouped Query Attention), RoPE (Rotary Position Embeddings) y embeddings atados entre encoder y decoder. Además, fusiona la atención self y cross del decoder, lo que reduce el número de parámetros y permite una mayor eficiencia de memoria. El modelo base soporta multimodalidad, multilingüismo y una ventana de contexto de 128k tokens.

El ajuste fino se realizó sobre este checkpoint con 10.000 ejemplos del split MixSub-SciHigh de SciHigh Task 1. Los hiperparámetros reportados son: 3 épocas, learning rate de 3e-5, batch size de 32, longitudes máximas de entrada y salida de 1024 y 320 tokens respectivamente, precisión bfloat16 y atención SDPA (Scaled Dot-Product Attention). El entrenamiento se ejecutó con Transformers 5.14.1 y PyTorch 2.13.0+cu130. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un ajuste supervisado estándar.

## Capacidades

- Generación de *research highlights* concisos a partir de abstracts de artículos científicos, con una longitud de salida típica de hasta 320 tokens.
- Resumen extractivo y abstractivo de textos académicos en inglés, especializado en el dominio científico.
- Hereda del modelo base la capacidad de procesar secuencias largas (hasta 128k tokens), aunque el fine-tuning limita la entrada a 1024 tokens.
- Soporte de generación con beam search (num_beams=4) y parámetros de control como length_penalty y no_repeat_ngram_size.
- No se reporta soporte de tool calling, function calling, agentes o razonamiento multi-paso; el modelo está orientado exclusivamente a tareas de summarization.
- Capacidades multilingües del modelo base no se aprovechan en este checkpoint, ya que el fine-tuning se realizó solo con datos en inglés.

## Casos de uso

- **Automatización de resúmenes para revistas científicas**: el modelo puede generar automáticamente los *highlights* que muchas revistas exigen al enviar un artículo, ahorrando tiempo a los autores. Se usaría alimentando el abstract y obteniendo un resumen destacado listo para revisión.
- **Indexación y búsqueda en bases de datos bibliográficas**: plataformas como PubMed o arXiv pueden integrar el modelo para crear resúmenes cortos que mejoren la búsqueda semántica y la presentación de resultados.
- **Asistencia a revisores y editores**: los revisores pueden usar el modelo para obtener una síntesis rápida de un paper antes de leerlo completo, facilitando la evaluación preliminar.
- **Generación de newsletters académicas**: servicios de divulgación científica pueden emplear el modelo para resumir abstracts de múltiples papers y componer boletines temáticos.
- **Preprocesamiento para sistemas de recomendación de literatura**: el resumen generado puede servir como entrada para sistemas de recomendación que necesitan representaciones compactas de artículos.
- **Integración en gestores de referencias**: herramientas como Zotero o Mendeley podrían incorporar el modelo para mostrar un resumen automático de cada artículo guardado, mejorando la experiencia del usuario.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de validación sobre 1.985 ejemplos del split de validación de SciHigh Task 1:

| Metrica | Valor |
|---|---|
| ROUGE-1 | 0,3818 |
| ROUGE-2 | 0,1389 |
| ROUGE-L | 0,2590 |
| ROUGE-Lsum | 0,2591 |
| METEOR | 0,2983 |
| BERTScore F1 | 0,8775 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores son específicos del dominio científico y no son directamente comparables con benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bfloat16, el modelo ocupa aproximadamente 1,6 GB (tamaño del repo). Para inferencia con batch pequeño, se necesitan al menos 2-4 GB de VRAM, dependiendo de la longitud de la secuencia de entrada.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) puede ejecutar el modelo en bfloat16. Para mayor velocidad, se recomienda una RTX 3090 o superior.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs consumer de gama media y alta. Con cuantización a 8 bits o 4 bits (no documentada en el repo, pero posible con herramientas como bitsandbytes), podría ejecutarse en GPUs con 2 GB de VRAM.
- **Opciones de despliegue**: el modelo es compatible con Hugging Face Transformers (código de inferencia proporcionado). También puede servirse mediante TGI (Text Generation Inference) si se configura correctamente, o con vLLM si se adapta a la arquitectura encoder-decoder. No se menciona soporte para llama.cpp u Ollama.
- **Latencia y throughput**: no se han publicado mediciones. Dado el tamaño de 786M parámetros, se espera una latencia de decenas de milisegundos por generación en una GPU moderna, pero depende del hardware y de la longitud de salida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (generación de research highlights científicos) dentro de la información proporcionada. El modelo base T5Gemma 2 270M-270M podría considerarse una alternativa genérica, pero no se han publicado benchmarks de resumen científico para él. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Dominio específico**: el modelo está entrenado exclusivamente con abstracts científicos en inglés; su rendimiento en otros dominios o idiomas será muy limitado.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto o no fiel al abstract original. Se recomienda supervisión humana en aplicaciones críticas.
- **Longitud de entrada limitada**: aunque el modelo base soporta 128k tokens, el fine-tuning se entrenó con entradas de hasta 1024 tokens; entradas más largas pueden degradar la calidad del resumen.
- **Licencia Gemma**: la licencia Gemma de Google impone restricciones de uso, incluyendo la prohibición de usos militares o de vigilancia, y puede requerir atribución. Es necesario revisar los términos completos antes de un despliegue comercial.
- **Sin soporte de herramientas**: el modelo no incluye capacidades de tool calling ni de agentes, por lo que no es adecuado para tareas que requieran interacción con APIs o razonamiento multi-paso.
- **Datos de entrenamiento limitados**: solo 10.000 ejemplos, lo que puede limitar la generalización a subcampos científicos no representados en el dataset SciHigh.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uthayamurthy/origin-task1-t5gemma2-270m
- Modelo base: https://huggingface.co/google/t5gemma-2-270m-270m
- Documentación de T5Gemma 2 en Transformers: https://huggingface.co/docs/transformers/v5.0.0/model_doc/t5gemma2
- Paper de T5Gemma 2: https://arxiv.org/abs/2512.14856
- Repositorio de Gemma en GitHub: https://github.com/google-deepmind/gemma/blob/main/gemma/research/t5gemma/README.md
