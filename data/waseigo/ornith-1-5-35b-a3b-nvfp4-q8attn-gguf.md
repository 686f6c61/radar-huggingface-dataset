# waseigo/Ornith-1.5-35B-A3B-NVFP4-Q8attn-GGUF

## Resumen

Ornith-1.5-35B-A3B-NVFP4-Q8attn-GGUF es una conversión a formato GGUF para llama.cpp del modelo `ornith-ai/Ornith-1.5-35B-A3B-NVFP4`, un finetune de Qwen3.6-35B-A3B con capacidad de visión y arquitectura Mixture-of-Experts (MoE). El trabajo lo publica el usuario `waseigo` y destaca por preservar los tensores nativos FP4 del checkpoint original (cuantización NVFP4 de NVIDIA ModelOpt 0.45.0 en modo MIXED_PRECISION) sin recuantizar el payload de los expertos, mapeando en cambio la ruta densa FP8 a Q8_0 en lugar de BF16.

El modelo tiene 35.505.282.297 parámetros totales con aproximadamente 3.000 millones activos por token (la nomenclatura A3B del nombre lo indica), lo que lo sitúa en la categoría de MoE de gran capacidad pero coste de inferencia contenido. Incluye una cabeza MTP (Multi-Token Prediction) nativa que actúa como drafter interno para decodificación especulativa, sin necesidad de un modelo borrador externo.

La relevancia de esta ficha es doble: por un lado documenta una técnica de conversión poco habitual (mantener NVFP4 nativo en GGUF para GPUs Blackwell), y por otro reporta un efecto medido y reproducible de mejora en la tasa de aceptación del drafter MTP al usar Q8_0 en la ruta densa (de ~0,50 a ~0,93-0,99 según profundidad de contexto), con incrementos de throughput de generación de entre el 48 % y el 55 % frente a la conversión BF16-dense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (self_attn + linear_attn), cabeza MTP nativa y proyector de visión (no incluido en este repo) |
| Parametros totales | 35.505.282.297 |
| Parametros activos | ~3B (denominación A3B; cifra exacta no disponible) |
| Longitud de contexto | Hasta 262.144 tokens (flag de referencia `--ctx-size 262144`); contexto nativo de entrenamiento no disponible |
| Tipos de cuantizacion | NVFP4 (241 tensores: expertos enrutados, expertos compartidos y `lm_head`), Q8_0 (130 tensores densos provenientes de FP8), BF16 (72 tensores nativos: embeddings, norms, bloque MTP), F32 (551 tensores: norms y sidecars de escala NVFP4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (file type 39), 22.650.785.344 bytes, 994 tensores |

## Arquitectura y entrenamiento

El modelo base es un finetune de Qwen3.6-35B-A3B, por lo que hereda la arquitectura MoE de la familia Qwen3.6 con atención híbrida: combina capas de self-attention clásicas con capas de linear attention, lo que reduce el coste de contexto largo. La cuantización original de NVIDIA usa ModelOpt 0.45.0 en modo MIXED_PRECISION: expertos y `lm_head` en NVFP4, proyecciones de atención en FP8-e4m3, y embeddings, norms y bloque MTP en BF16. El checkpoint incluye una cabeza MTP nativa (`blk.40.nextn.*`) que embebe adaptadores de drafter, habilitando decodificación especulativa sin modelo borrador externo.

La conversión de `waseigo` se realizó con `convert_hf_to_gguf.py --outtype bf16 --fp8-as-q8` desde el commit `dac308739` de llama.cpp. Los super-bloques de 4 bits de los expertos son byte-idénticos a un repack fresco de los nibbles y escalas E4M3 del checkpoint (verificado en 5 de 5 tensores muestreados, incluido el último experto del tensor fusionado y `output` 248320×1152). Las escalas globales se almacenan como `weight_scale_2` del checkpoint. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en el modelo base.

La innovación técnica principal es el mapeo de la ruta densa FP8 a Q8_0 en lugar de BF16: según el autor, el upcast a BF16 deja a llama.cpp en una ruta que degrada mediblemente el drafter MTP propio, mientras que Q8_0 preserva mejor la tasa de aceptación. El mecanismo exacto de este efecto está aún abierto según la model card.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y matemáticas (capacidad esperada por herencia de Qwen3.6; sin benchmarks publicados en esta ficha).
- Generación de código (capacidad esperada por herencia de Qwen3.6; sin benchmarks publicados en esta ficha).
- Visión multimodal (pipeline `image-text-to-text`), aunque el proyector de visión no está incluido en este repo: requiere `mmproj-Ornith-1.5-35B-BF16.gguf` de `TizzyT566/Ornith-1.5-35B-A3B-NVFP4-GGUF`.
- Decodificación especulativa con drafter MTP interno (`--spec-type draft-mtp`), sin modelo borrador externo.
- Soporte de plantillas Jinja (`--jinja`), lo que habilita tool calling y function calling a través de la plantilla del modelo base.
- Capacidad de contexto largo: hasta 262.144 tokens configurados en la referencia de servicio.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible; dependen del modelo base.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones multi-turno sobre documentos extensos, contratos o bases de código sin truncar. Adecuado para atención al cliente técnica o análisis documental.
- Generación de código en pipelines de CI/CD: gracias al soporte de plantillas Jinja y tool calling, puede integrarse como agente de revisión de código o generación de parches en flujos automatizados.
- Análisis de imágenes con texto (visión): usando el proyector `mmproj` externo, el modelo puede describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas. Útil en herramientas de soporte y documentación técnica.
- Razonamiento matemático y resolución de problemas: la herencia de Qwen3.6 y el modo MoE permiten abordar problemas de varios pasos con coste de inferencia contenido (~3B activos).
- Servicio en GPUs Blackwell de consumo: la ruta NVFP4 nativa con `BLACKWELL_NATIVE_FP4` en sm_120 (RTX 50-series) permite desplegar un modelo de 35B en dos GPUs consumer con tensor-split, algo inviable en BF16.
- Decodificación especulativa de alto throughput: la cabeza MTP interna con Q8_0 denso alcanza tasas de aceptación de 0,93-0,99, lo que lo hace adecuado para aplicaciones de baja latencia donde el coste por token importa (chat interactivo, autocompletado).
- Prototipado e investigación en cuantización: el repo documenta una técnica reproducible de conversión NVFP4→GGUF con verificación byte a byte, útil para quienes investigan formatos de cuantización y su efecto en drafters especulativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta mediciones de throughput de generación (tg, tokens/s) y tasa de aceptación MTP en una configuración concreta (RTX 5070 Ti + 5060 Ti, tensor-split, builds b12624/b12648):

| Profundidad de contexto | BF16-dense (tg) | Este GGUF (tg) | Aceptación MTP BF16 → Q8_0 |
|---|---:|---:|---|
| 12,3k | 140,8 | 218,9 | 0,500 → 0,932 |
| 32k | 131,1 | 203,6 | 0,545 → 0,988 |
| 261k | 58,6 | 86,9 | 0,528 → 0,965 |

El prefill es entre un 8 % y un 15 % más lento (dequant Q8_0 batcheado frente a matmul BF16) y el uso de VRAM es ~0,56 GiB por tarjeta menor.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 22,7 GB; con caché KV cuantizada (`-ctk q8_0 -ctv q8_0 -ctkd q4_0 -ctvd q4_0`) y contexto de 262.144 tokens, se ha servido en un tensor-split de RTX 5070 Ti + RTX 5060 Ti (16 GB + 16 GB). VRAM exacta por tarjeta no disponible.
- GPU recomendadas: GPUs Blackwell (sm_120, RTX 50-series) para la ruta NVFP4 nativa con `BLACKWELL_NATIVE_FP4`. No se confirma compatibilidad con arquitecturas anteriores (Ada, Ampere) en la información disponible.
- Cabe en GPU consumer: sí, en GPUs Blackwell de 16 GB o más, con tensor-split entre dos tarjetas si es necesario (no requiere NVLink).
- Opciones de despliegue: llama.cpp build b12505 o superior (verificado en b12624 y b12648). Otros motores (vLLM, TGI, Ollama) no están confirmados para este dialecto GGUF ModelOpt.
- Latencia y throughput: 218,9 tok/s a 12,3k de contexto, 203,6 tok/s a 32k y 86,9 tok/s a 261k en la configuración de referencia.
- Flags de referencia: `-ub 512 --ctx-size 262144 --parallel 1 -ctk q8_0 -ctv q8_0 -ctkd q4_0 -ctvd q4_0 -fa on --jinja --spec-type draft-mtp --spec-draft-n-max 2 --temp 0.6 --top_p 0.95 --top_k 20`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-NVFP4-Q8attn-GGUF (este) | 35,5B totales / ~3B activos | 262.144 | MIT | GGUF NVFP4+Q8_0 | Requiere build llama.cpp b12505+ y GPU Blackwell |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 (base) | 35,5B totales / ~3B activos | no disponible | MIT | safetensors ModelOpt | Requiere stack NVIDIA ModelOpt/TensorRT; incluye proyector de visión |
| TizzyT566/Ornith-1.5-35B-A3B-NVFP4-GGUF | 35,5B totales / ~3B activos | no disponible | no disponible | GGUF | Incluye `mmproj` de visión; detalles de cuantización no disponibles |

No se dispone de comparativas con modelos de otras familias (Qwen3.6 base, Llama, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se ha validado su comportamiento en castellano ni en otros idiomas.
- El proyector de visión no está incluido en este repo: sin el `mmproj` externo, el modelo no procesa imágenes pese a su pipeline `image-text-to-text`.
- Requiere un build específico de llama.cpp (b12505+) que entienda el dialecto GGUF ModelOpt; versiones anteriores no cargarán el archivo.
- La ruta NVFP4 nativa está pensada para GPUs Blackwell (sm_120); el rendimiento y la compatibilidad en otras arquitecturas no están documentados.
- La mejora de aceptación MTP con Q8_0 denso está medida y reproducida por el autor, pero su mecanismo es desconocido; la model card advierte de que las expectativas cruzadas entre checkpoints deben tratarse con cautela.
- No hay benchmarks de calidad publicados: no se puede verificar la degradación (o no) respecto al modelo base en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.6, no evaluados aquí.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción por terceros.
- Licencia MIT permite uso comercial, pero el modelo base y sus dependencias (llama.cpp, ModelOpt) pueden tener condiciones propias que conviene revisar.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/waseigo/Ornith-1.5-35B-A3B-NVFP4-Q8attn-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- GGUF con proyector de visión: https://huggingface.co/TizzyT566/Ornith-1.5-35B-A3B-NVFP4-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
