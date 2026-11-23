# UchihaUdhaya/Qwen2.5-3B-FP8-W8A8-Dynamic

## Resumen
Qwen2.5-3B-FP8-W8A8-Dynamic es un checkpoint cuantizado en FP8 (W8A8) del modelo Qwen/Qwen2.5-3B, publicado por el usuario UchihaUdhaya. Se trata de una cuantización post-entrenamiento (PTQ) de una sola pasada, sin fine-tuning ni calibración, generada con `llm-compressor` en formato `compressed-tensors` y verificada para servir con FP8 Tensor Cores nativos en vLLM. El objetivo es reducir el peso en disco y acelerar la inferencia manteniendo prácticamente intacta la calidad del modelo original.

El modelo base Qwen2.5-3B es un transformer decoder-only de 3.085.938.688 parámetros desarrollado por Alibaba Qwen, con licencia Apache 2.0. Esta variante cuantizada ocupa 3,40 GB (3,17 GiB) frente a los 6,17 GB (5,75 GiB) del BF16, un 44,9% menos, y según la model card del autor mantiene la precisión en evaluaciones zero-shot con diferencias no significativas estadísticamente.

Es relevante porque demuestra que la cuantización FP8 W8A8 dinámica por canal puede aplicarse a modelos pequeños sin pérdida medible de calidad y con ganancias de throughput de hasta 1,56× en decodificación individual sobre NVIDIA L4. Sin embargo, el repositorio tiene 0 descargas y 0 likes, es de un autor individual y la model card está truncada, por lo que debe tratarse como un artefacto experimental y no como un checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantización FP8 W8A8 |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `--max-model-len 4096`) |
| Tipos de cuantizacion | FP8 E4M3 (`float8_e4m3fn`), pesos simétricos per-channel, activaciones dinámicas per-token; embeddings, RMSNorms y `lm_head` en bfloat16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`compressed-tensors`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento
El modelo base Qwen2.5-3B es un transformer decoder-only con 36 bloques y 252 capas lineales, según los detalles de cuantización recogidos en la model card. Esta variante no introduce cambios arquitectónicos: es una cuantización post-entrenamiento de una sola pasada, sin fine-tuning, sin LoRA y sin dataset de calibración. Los pesos de las 252 capas lineales se almacenan en FP8 E4M3 con escala simétrica por canal (252 tensores `weight_scale`, sin `input_scale` estáticos), mientras que las activaciones se escalan dinámicamente por token en tiempo de inferencia. Los embeddings, las RMSNorms y la `lm_head` se preservan en bfloat16 (312.438.784 parámetros), y los parámetros cuantizados suman 2.774.532.096.

La herramienta empleada es `llm-compressor==0.15.0` con el esquema `FP8_DYNAMIC` (formato `float-quantized`, receta incluida en `recipe.yaml`). No se documentan datos de entrenamiento propios ni procesos de RLHF/DPO, ya que el modelo hereda íntegramente el conocimiento del checkpoint original de Qwen. La innovación técnica se limita a la propia receta de cuantización: escalado dinámico por token en activaciones, que evita la necesidad de calibración y permite servir en vLLM con detección automática de la configuración desde `config.json`.

## Capacidades
- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B.
- Razonamiento básico y respuesta a preguntas de conocimiento general (evaluado en HellaSwag, ARC-Easy, ARC-Challenge, WinoGrande y PIQA).
- Comprensión lectora y sentido común en tareas de elección múltiple.
- Generación de código y matemáticas: capacidad heredada del modelo base, aunque no se aportan benchmarks específicos en la información disponible.
- Soporte de tool calling y function calling: no documentado en la model card de esta variante; debe verificarse contra la documentación del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta variante.
- Capacidades multilingües: la model card declara únicamente `en`; el modelo base Qwen2.5 soporta más idiomas, pero esta ficha no puede confirmarlo para el checkpoint cuantizado.
- Sin modo thinking, visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso
- Servicio de chat conversacional de bajo coste: con 3,40 GB en disco y FP8 nativo en GPUs Ada Lovelace o Hopper, puede desplegarse en una sola L4 o RTX 4090 para atender conversaciones multi-turno con latencia de 16,42 ms/token (60,7 tok/s) en decodificación individual.
- Inferencia de alto throughput en batch: con 3.373,5 tok/s a batch 128 y entrada de 128 tokens en L4, es adecuado para pipelines de generación masiva de texto, etiquetado o aumento de datos donde el coste por token es crítico.
- Prototipado rápido en hardware consumer: al caber holgadamente en GPUs de 8-12 GB tras la cuantización, permite a desarrolladores individuales experimentar con un modelo Qwen2.5 sin infraestructura de datacenter.
- Clasificación y extracción de información en inglés: tareas de zero-shot o few-shot sobre texto en inglés (resúmenes, extracción de entidades, respuesta a preguntas) donde la pérdida de precisión de 0,11% en la media de cinco tareas es aceptable.
- Backend de aplicaciones RAG: con contexto de 4.096 tokens configurado en el ejemplo de despliegue, puede integrarse en pipelines de recuperación aumentada para responder sobre documentación en inglés con latencia baja.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible para estudiar el impacto de FP8 W8A8 dinámico frente a BF16, dado que el autor publica el código y el estudio en un repositorio de GitHub.

## Benchmarks y rendimiento
Datos publicados en la model card del autor, medidos en NVIDIA L4 (24 GB) con vLLM 0.34.0 y lm-evaluation-harness 0.4.13, 0-shot y tests de McNemar emparejados frente a BF16:

| Benchmark | Metrica | BF16 base | FP8 W8A8 | Delta |
|---|---|---:|---:|---:|
| HellaSwag (10.042 preguntas) | acc_norm | 73,56% | 73,52% | -0,04% (ns) |
| ARC-Easy (2.376) | acc | 77,31% | 77,15% | -0,17% (ns) |
| ARC-Challenge (1.172) | acc_norm | 46,76% | 46,93% | +0,17% (ns) |
| WinoGrande (1.267) | acc | 68,43% | 68,98% | +0,55% (ns) |
| PIQA (1.838) | acc | 78,40% | 78,45% | +0,05% (ns) |
| Media 5 tareas | — | 68,89% | 69,01% | +0,11% (sin pérdida) |

| Metrica de fidelidad y rendimiento | BF16 | FP8 W8A8 | Delta |
|---|---:|---:|---:|
| Perplejidad WikiText-2 | 7,782 | 7,834 | +0,052 |
| Perplejidad UltraChat | 4,144 | 4,180 | +0,036 |
| KL media vocabulario completo (Wiki / Chat) | 0,0000 | 0,0105 / 0,0093 | Bajo |
| Acuerdo top-1 de token (Chat / Wiki) | 100,0% | 95,63% / 94,71% | — |
| Decodificación B=1 | 25,55 ms/tok (39,0 tok/s) | 16,42 ms/tok (60,7 tok/s) | 1,56× más rápido |
| Throughput pico (B=128, in=128) | 2.503,6 tok/s | 3.373,5 tok/s | 1,35× (+34,7%) |
| Throughput prompt largo (B=128, in=512) | 1.223,3 tok/s | 1.612,6 tok/s | 1,32× (+31,8%) |
| Tiempo de prefill (B=128, in=512) | 7,72 s | 5,78 s | 1,34× más rápido |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de la comparación directa con otros modelos cuantizados similares.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3,4 GB solo para pesos en FP8; con overhead de KV cache y activaciones, un despliegue realista requiere 6-8 GB para contextos moderados.
- GPUs con FP8 Tensor Cores nativos (mejor rendimiento): NVIDIA Ada Lovelace (L4, L40, RTX 4090, compute capability 8.9), Hopper (H100, H200, cc 9.0) y Blackwell (B200, cc 10.0).
- GPUs Ampere y Turing: soportadas mediante dequantización software (ruta Marlin o weight-only), sin aceleración FP8 GEMM nativa.
- Cabe en GPUs consumer: sí, en RTX 4090 (24 GB) con FP8 nativo, y en GPUs de 8-12 GB mediante fallback o cuantización adicional.
- Opciones de despliegue: vLLM es la vía recomendada (detección automática de `compressed-tensors` desde `config.json`); también es compatible con Hugging Face `transformers` + `accelerate` + `compressed-tensors`. No se documenta soporte de llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput medidos en L4: 16,42 ms/token en decodificación B=1 (60,7 tok/s), 3.373,5 tok/s a B=128 con entrada de 128 tokens y prefill de 5,78 s a B=128 con entrada de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-FP8-W8A8-Dynamic (este) | 3,09 B | no disponible (ejemplo a 4.096) | FP8 W8A8 dinámico per-channel | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B (BF16) | 3,09 B | no disponible en la información | BF16 | Apache 2.0 | Hugging Face, modelo de referencia |
| Otras cuantizaciones de Qwen2.5-3B (GGUF, AWQ, GPTQ) | ~3,09 B | depende del formato | 4-8 bits según esquema | Apache 2.0 (heredada) | Amplia disponibilidad en Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otras cuantizaciones del mismo modelo base ni frente a modelos de tamaño similar (Llama 3.2 3B, Gemma 2 2B, Phi-3.5-mini) en la información proporcionada.

## Limitaciones y advertencias
- Repositorio de autor individual con 0 descargas y 0 likes: no hay validación comunitaria ni mantenimiento garantizado; trátese como artefacto experimental.
- La model card está truncada en la sección de licencia y atribución, por lo que parte de la documentación oficial puede faltar.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base Qwen2.5-3B.
- Riesgo de alucinación: inherente a un modelo de 3 B de parámetros; la cuantización FP8 añade una ligera deriva en la distribución de logits (KL media de 0,0105 en Wiki y 0,0093 en Chat, con un 95,63% de acuerdo top-1 en chat).
- Limitaciones de idioma: la model card declara únicamente inglés (`en`), aunque el modelo base Qwen2.5 es multilingüe; no se garantiza el rendimiento en castellano.
- Limitaciones de contexto: no se especifica la longitud de contexto nativa en la información disponible; el ejemplo de despliegue limita a 4.096 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen2.5-3B conviene verificar los términos del modelo base y citar la atribución correspondiente.
- En GPUs sin FP8 nativo (Ampere, Turing), el rendimiento puede degradarse por la ruta de dequantización software; las cifras de speedup publicadas solo aplican a L4 y arquitecturas con FP8 Tensor Cores.
- El formato `compressed-tensors` limita la portabilidad: no se documenta compatibilidad con llama.cpp, Ollama o TGI.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/UchihaUdhaya/Qwen2.5-3B-FP8-W8A8-Dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio con código y estudio de benchmarks: https://github.com/udhaya30012004/Qwen-3b-Quantized-FP8-W8A8
- Herramienta de cuantización llm-compressor: no se proporciona enlace directo en la información disponible
- Paper o blog técnico del autor: no disponible en la información proporcionada
