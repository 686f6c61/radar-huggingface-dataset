# yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep1

## Resumen

Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha reentrenado como "memory model" sobre pares sintéticos de pregunta-respuesta generados a partir de MuSiQue, un conjunto de datos de razonamiento multi-salto sobre múltiples documentos. El objetivo es que el modelo aprenda a recuperar y sintetizar información dispersa en un contexto largo, una tarea típica de los sistemas de memoria externa en pipelines RAG y agentes.

El checkpoint publicado corresponde a la época 1 de 3 de un entrenamiento con ajuste fino completo (no LoRA), lo que implica que los 1.543.714.304 parámetros del modelo base se han actualizado. La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con 1.500 millones de parámetros aproximadamente, ventana de contexto de 32.768 tokens en el modelo base y licencia Apache 2.0.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación con cero descargas y sin benchmarks publicados, orientado a evaluar si un modelo pequeño puede internalizar la tarea de memoria sobre documentos. No está pensado como modelo de producción generalista, sino como pieza de un estudio sobre clustering de documentos (HDBSCAN combinado con agrupación por entidades) para la construcción de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenado con secuencias de hasta 8.096 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue, pero no se documenta el efecto del ajuste fino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar, RoPE y normalización RMSNorm, sin mezcla de expertos. El ajuste fino es completo (FSDP), con el 100 % de los parámetros entrenables, sobre 2.177.125 ejemplos sintéticos derivados de un subconjunto de 1.000 preguntas de MuSiQue. Los datos se construyeron con un método de clustering denominado `hdb_and_entity`: HDBSCAN con tamaño mínimo de cluster 2 combinado con agrupación por entidades y un umbral de frecuencia documental máxima de 3, generando combinaciones de entidades cross-documento (fichero `msq_subset1000_numsamplingepochs1_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`).

Los hiperparámetros documentados son: batch efectivo de 256 (32 por dispositivo, 1 paso de acumulación, 8 GPUs), learning rate constante de 2e-05 con warmup del 5 %, weight decay 0.01, max grad norm 1.0, precisión bf16, gradient checkpointing y cálculo de pérdida solo sobre tokens del asistente. El entrenamiento completo de 3 épocas requirió 2,23 horas de reloj (17,9 GPU-horas) sobre 8 aceleradores AMD Instinct MI325X. El checkpoint publicado corresponde a la época 1. No se documentan fases de RLHF o DPO adicionales sobre este ajuste.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen.
- Recuperación y síntesis de información a partir de contextos largos, orientada a tareas de memoria sobre documentos múltiples.
- Razonamiento multi-salto sobre evidencia dispersa, heredado del dominio MuSiQue.
- Capacidad multilingüe potencial heredada del modelo base Qwen2.5, aunque no se documenta su conservación tras el ajuste.
- Soporte de tool calling y function calling: no documentado en esta model card; el modelo base lo soporta, pero no hay evidencia de que el ajuste lo preserve.
- Modo thinking, visión o audio: no disponible.
- Comportamiento agéntico multi-paso: no documentado.

## Casos de uso

- Investigación sobre modelos de memoria: el modelo sirve como sujeto de experimento para medir cuánto conocimiento de recuperación multi-documento puede internalizar un modelo de 1.500 millones de parámetros mediante ajuste fino completo.
- Evaluación de estrategias de construcción de datos: permite comparar el método de clustering `hdb_and_entity` frente a otras alternativas de generación sintética de pares QA sobre MuSiQue.
- Baseline en pipelines RAG: puede usarse como componente de generación de respuestas a partir de contextos recuperados, midiendo su fidelidad frente al modelo base sin ajustar.
- Reproducción de experimentos académicos: con 17,9 GPU-horas de entrenamiento documentadas, es viable reproducir el pipeline completo en un nodo de 8 GPUs para validar resultados.
- Estudio de degradación por ajuste fino: al ser un ajuste sobre un subconjunto estrecho, resulta útil para analizar la pérdida de capacidades generales (olvido catastrófico) en modelos pequeños.
- Prototipado de asistentes documentales de bajo coste: con 1.500 millones de parámetros y cuantización a 4 bits, puede desplegarse en GPUs de consumo para pruebas de concepto de respuesta sobre corpus acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias moderadas.
- VRAM en cuantización de 8 bits: en torno a 1,6 GB de pesos.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M): en torno a 1,0-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para servir con concurrencia alta, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep1 | 1.543.714.304 | 32.768 (base); entrenado a 8.096 | Apache 2.0 | Ajuste de memoria sobre MuSiQue, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500 millones | 32.768 | Apache 2.0 | Modelo base, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-3B-Instruct | ~3.000 millones | 32.768 | Apache 2.0 (salvo excepciones por tamaño) | Alternativa de mayor capacidad para tareas de razonamiento |
| meta-llama/Llama-3.2-1B-Instruct | ~1.200 millones | 131.072 | Llama 3.2 Community License | Contexto mucho mayor, licencia con restricciones de uso |

La comparación de rendimiento con estas alternativas no está disponible para el modelo ajustado, ya que no se han publicado evaluaciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea medible.
- Riesgo elevado de olvido catastrófico: el ajuste fino completo sobre 2,17 millones de ejemplos de un dominio muy estrecho (MuSiQue sintético) puede degradar capacidades generales del modelo base.
- Sesgos: no documentados; el modelo hereda los sesgos de Qwen2.5-1.5B-Instruct y los del corpus MuSiQue, sin que el autor reporte análisis alguno.
- Alucinación: al tratarse de un modelo de memoria entrenado sobre pares QA sintéticos, existe riesgo de fabricar respuestas plausibles cuando la evidencia no está en el contexto; no se ha evaluado la tasa de alucinación.
- Idiomas: no se documenta qué idiomas conserva tras el ajuste; el entrenamiento parece haberse realizado sobre datos en inglés (MuSiQue), lo que puede degradar el multilingüismo del base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Estado del checkpoint: es la época 1 de 3, no el modelo final del entrenamiento; el autor no publica las épocas 2 y 3 en esta ficha.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin validación por parte de la comunidad.
- Tool calling: no hay garantía de que el ajuste preserve las capacidades de llamada a funciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del dominio de entrenamiento): https://huggingface.co/datasets/dgslibisey/MuSiQue
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de transformers: https://huggingface.co/docs/transformers
