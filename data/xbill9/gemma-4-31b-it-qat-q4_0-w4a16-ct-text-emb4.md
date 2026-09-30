# xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4

## Resumen

`xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4` es un repack no oficial del modelo Gemma 4 31B instruct, ya sometido a quantisation-aware training (QAT) por Google. Este checkpoint concreto no lo publica Google, sino el usuario xbill9, y su aportación consiste en empaquetar también las tablas de embeddings en int4 (además de las capas lineales, que ya venían en W4A16), con el objetivo de reducir el peso en disco y en VRAM sin salirse de la rejilla de 4 bits que dejó el QAT (grupo 32).

El problema que resuelve es de eficiencia de despliegue: el checkpoint intermedio en bf16 (`google/gemma-4-31B-it-qat-q4_0-unquantized`) ocupa 48 GiB según la documentación asociada a la familia, mientras que este repack deja el checkpoint en 16,82 GiB, lo que permite servirlo en GPUs de 24 GB con vLLM. La contrapartida es que es una conversión de terceros, solo texto y con fidelidad numérica no exacta respecto del original (el 73,27 % de los valores de `embed_tokens` quedan bit-idénticos; el resto, no).

Se distribuye en formato `compressed-tensors` (safetensors) y requiere vLLM 0.29 o superior para cargarse, ya que depende del esquema `CompressedTensorsEmbeddingWNA16Int`. No hay resultados de benchmarks publicados para este checkpoint ni para su modelo base en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder, variante de solo texto de la familia Gemma 4 (etiqueta `gemma4_text`); no disponible el detalle de capas o atención |
| Parámetros totales | 32.106.631.484 (≈32,1 B, dato real de safetensors) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A16 con `compressed-tensors`; pesos lineales en int4 y activaciones en fp16; `embed_tokens` y `lm_head` empaquetados en int4 con escalas fp16, grupo 32 |
| Idiomas soportados | No disponible (la model card solo indica que es un modelo de texto) |
| Licencia | `gemma` (términos de uso de Gemma) |
| Formato de pesos | Safetensors con `compressed-tensors`; requiere vLLM ≥ 0.29 |

Datos adicionales de empaquetado: `embed_tokens` pasa de 2,625 GiB en bf16 a 0,738 GiB en int4 más escalas fp16; 0 grupos fuera de rejilla; error máximo de 6,62e-03 respecto del máximo del grupo, con escalas en el rango 0,000591..0,863. Checkpoint final: 16,82 GiB. Tamaño total del repositorio: 18,1 GB.

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como `google/gemma-4-31B-it-qat-q4_0-unquantized`, un checkpoint de la familia Gemma 4 (31B, instruido) extraído del pipeline de QAT de Google y publicado sin cuantizar, pensado para compilación y ajuste posteriores. Sobre esa base, el autor ha aplicado un repack a W4A16 con `compressed-tensors` y, en esta variante, ha extendido el empaquetado int4 a las tablas de embeddings. No se detallan en la documentación el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO específicas.

La innovación técnica relevante es de ingeniería de cuantización, no de arquitectura: el QAT original ya situó las tablas de embeddings sobre la misma rejilla de 4 bits que las capas lineales (grupo 32), de modo que el repack recupera esa rejilla sin salirse de ella. Un grupo fuera de rejilla abortaría la conversión. Además, como vLLM "ata" la capa de salida copiando el `.weight` del embedding (algo que un embedding empaquetado no tiene), el autor deja `lm_head` desatado y lo almacena con los mismos niveles int4, aunque el modelo se entrenó con pesos atados. Las capas lineales no se modifican respecto del repack W4A16 de texto ya existente.

## Capacidades

- Generación de texto y conversación instructiva, heredadas del modelo base Gemma 4 31B-it.
- Razonamiento y matemáticas: capacidades esperables del modelo base, pero no verificadas en esta información (sin benchmarks publicados).
- Generación de código: no documentada explícitamente para este checkpoint.
- Tool calling / function calling: no disponible en la documentación; depende del modelo base y de la plantilla de chat usada, no del repack de cuantización.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; la model card insiste en que la variante es "text only" (sin visión ni audio).
- Capacidad especial: no hay modo "thinking" ni multimodalidad documentados en este checkpoint. La única particularidad técnica es el empaquetado int4 de embeddings y `lm_head` para servir con vLLM.

## Casos de uso

- Servicio de chat de propósito general autoalojado: el checkpoint de 16,82 GiB cabe en una GPU de 24 GB con vLLM, lo que permite desplegar un modelo de ~32 B de parámetros en hardware de gama alta de consumo o en una sola L40S, sin depender de APIs externas.
- Extracción y clasificación de texto a gran escala: al ser un modelo solo texto, puede procesar lotes de documentos para resumen, etiquetado o extracción de entidades usando el batching continuo de vLLM, con activaciones en fp16 y pesos int4.
- Generación aumentada por recuperación (RAG): adecuado para indexar y responder sobre documentación interna, siempre que se configure la longitud de contexto según los recursos de VRAM disponibles (la ventana exacta no está documentada y debe validarse contra el modelo base).
- Asistentes internos con datos sensibles: al ser un peso abierto bajo licencia Gemma y ejecutable en infraestructura propia, encaja en escenarios donde no se permite enviar datos a servicios de terceros.
- Evaluación y comparación de esquemas de cuantización: útil como referencia para medir la degradación introducida por el empaquetado int4 de embeddings frente al repack W4A16 de texto y frente al GGUF Q4_0 oficial.
- Prototipado en una sola GPU para investigación: permite experimentar con un modelo de esta escala sin clúster multinodo, aceptando la limitación de que solo funciona en vLLM (no en llama.cpp u Ollama).
- Sustitución de alternativas propietarias en pipelines de texto: para tareas de redacción, reformulación o asistencia en soporte, con la salvedad de que no hay benchmarks publicados que respalden la calidad final tras el repack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repack no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y las páginas del modelo base consultadas tampoco aportan cifras.

## Requisitos de hardware

- Peso del checkpoint: 16,82 GiB (16,82 GiB de pesos cuantizados); el repositorio completo ocupa 18,1 GB.
- VRAM estimada para inferencia: aproximadamente 18-20 GB para pesos más sobrecarga, con caché KV adicional en función del contexto y del número de secuencias concurrentes. Al no conocerse la longitud de contexto, no puede darse una cifra cerrada de VRAM para contextos largos.
- GPU de consumo: sí cabe en RTX 3090 y RTX 4090 (24 GB) con contexto moderado. No cabe en GPUs de 16 GB ni inferiores sin recurrir a otra cuantización (por ejemplo, un GGUF Q4_0 con llama.cpp).
- GPU profesionales recomendadas: L40S o RTX A6000 (48 GB) para lotes medianos; A100 40/80 GB y H100 80 GB para lotes grandes, contextos largos o requisitos de latencia baja.
- Opciones de despliegue: vLLM 0.29 o superior es obligatorio, porque el modelo depende de `CompressedTensorsEmbeddingWNA16Int`. No es cargable con llama.cpp, Ollama ni otros motores que no soporten `compressed-tensors` con embeddings empaquetados. Para esos motores existe la alternativa GGUF de 18,3 GB publicada a partir del Q4_0 oficial.
- Latencia y throughput: no disponibles. No se han publicado medidas para este repack.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4` | 32,1 B (safetensors) | No disponible | Safetensors `compressed-tensors` W4A16 con embeddings int4; 16,82 GiB | Gemma | Este modelo; requiere vLLM ≥ 0.29; solo texto |
| `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text` | Aprox. 32,1 B (misma arquitectura) | No disponible | Safetensors `compressed-tensors` W4A16 con embeddings en bf16 | Gemma | Versión previa del mismo autor, sin empaquetado int4 de embeddings |
| `google/gemma-4-31B-it-qat-q4_0-unquantized` | No disponible | No disponible | Safetensors en bf16 (export de unos 48 GiB según la documentación de la familia) | Gemma | Base oficial sin cuantizar del que deriva este repack; pensado para compilación y ajuste |
| GGUF `gemma-4-31b-it-qat-q4-0` | No disponible | No disponible | GGUF, 18,3 GB | Gemma | ~430.000 descargas y 127 likes según el índice consultado; compatible con llama.cpp y Ollama, a diferencia de este repack |
| `xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct` | No disponible | No disponible | Safetensors `compressed-tensors` W4A16 | Gemma | Variante MoE de la familia (26B A4B); Google no publicó W4A16 para este tamaño según la página del autor |

## Limitaciones y advertencias

- Modelo no oficial: la model card indica explícitamente que los problemas deben reportarse al autor, no a Google. No hay garantía de soporte ni de mantenimiento.
- Solo texto: no procesa imagen ni audio.
- Pérdida de fidelidad numérica: el 73,27 % de los valores de `embed_tokens` son bit-idénticos al original; el 26,73 % restante no lo es. El error máximo documentado es de 6,62e-03 respecto del máximo del grupo. El impacto real en la calidad de salida no está medido.
- Dependencia dura de vLLM 0.29 o superior: no funciona en llama.cpp, Ollama, TGI ni otras herramientas sin soporte para `CompressedTensorsEmbeddingWNA16Int`. Esto limita el despliegue en entornos heterogéneos.
- Cambio estructural en los pesos atados: `lm_head` se desata y se empaqueta en int4, mientras que el entrenamiento se hizo con pesos atados. Aunque la intención es reproducir el comportamiento, es una desviación respecto del grafo original.
- Sin benchmarks: no hay evidencia publicada de MMLU, HumanEval, GSM8K ni métricas equivalentes para este checkpoint, por lo que la calidad real tras el repack es desconocida.
- Sesgos y alucinación: no documentados para este repack; deben asumirse los del modelo base Gemma 4 31B-it (sesgos de los datos de entrenamiento y riesgo de generación de contenido incorrecto con apariencia plausible).
- Contexto e idiomas sin especificar: la ventana máxima y la cobertura idiomática no están publicadas en esta ficha; conviene verificarlas contra el modelo base antes de usar el modelo en producción con documentos largos o en idiomas distintos del inglés.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Gemma, que imponen condiciones específicas (obligaciones de atribución y restricciones de uso). Es imprescindible revisarlos antes de un despliegue comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4
- Repack de texto W4A16 del mismo autor: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text
- Repack equivalente para el MoE 26B-A4B: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct
- Checkpoints W4A16 oficiales de Google: https://huggingface.co/google/gemma-4-31B-it-qat-w4a16-ct
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Script de repack `embed_int4.py`: https://github.com/xbill9/gemma4-dev/blob/main/gpu-vllm-t4-2b-w4a16/repack/embed_int4.py
- Índice del GGUF Q4_0 de la familia: https://local-ai-zone.github.io/models/gemma-4-31b-it-qat-q4-0.html
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/google%2Fgemma-4-31B-it-qat-q4_0-unquantized,1nhzb6B6iAxmOqA8ytAUNi
