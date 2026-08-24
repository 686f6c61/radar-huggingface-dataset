# windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 es una cuantización NVFP4 (precisión de 4 bits en coma flotante de NVIDIA) del modelo instructivo multimodal DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, creada por windowsxp811203 específicamente para GPUs Blackwell (compute capability 12.0) y el servidor de inferencia vLLM. El modelo base aplica la metodología de entrenamiento "Cold Fusion", que combina la técnica interna GAIN con la infraestructura de Unsloth, reduciendo los tokens de razonamiento a entre 1/10 y 1/2 de los modelos Qwen estándar mientras mantiene el 99 % del rendimiento en BF16 tanto en 8 como en 4 bits.

La cuantización NVFP4 conserva intactos los componentes más sensibles: el cabezal de borrador MTP (Multi-Token Prediction) completo en bf16, el torre de visión (333 tensores `visual.*`) en bf16, el camino Gated DeltaNet (`linear_attn.*`) y `lm_head`. Esto permite que el modelo mantenga capacidades multimodales y decodificación especulativa funcional. El autor midió sobre este checkpoint un 79,5 % en MMLU (muestra de 400 preguntas) y una tasa de aceptación del borrador MTP del 97,6 %.

El modelo se distribuye bajo licencia Apache 2.0, pesa aproximadamente 28,6 GB y está diseñado para ejecutarse en tarjetas Blackwell de 32 GB o superiores, aunque su contexto nativo es de 262 000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer denso multimodal, Gated DeltaNet para atencion lineal) |
| Parametros totales | 19.135.892.976 (segun safetensors; el nombre comercial indica 27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; 32 768 tokens en la configuracion de ejemplo de vLLM |
| Tipos de cuantizacion | NVFP4 (NVFP4A16, 4 bits en coma flotante, formato compressed-tensors) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4 con `quantization_config` para vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal de la familia Qwen3.8, con una torre de visión integrada (pipeline `image-text-to-text`) y un mecanismo de atención híbrido que incluye una ruta Gated DeltaNet (atención lineal) además de la atención por softmax convencional. Incluye un cabezal MTP (Multi-Token Prediction) que se usa como borrador para decodificación especulativa.

La variante "Cold Fusion" de DavidAU se entrenó con la metodología GAIN (una técnica interna del autor) sobre la infraestructura de Unsloth, con el objetivo de reducir drásticamente los tokens de razonamiento (thinking) en las respuestas. Según la documentación de Unsloth y el artículo de HackerNoon, el modelo mantiene el 99 % del rendimiento en BF16 tanto en cuantizaciones de 8 como de 4 bits.

En esta cuantización NVFP4, el autor (windowsxp811203) decidió mantener en bf16 las partes más sensibles: los 15 tensores `mtp.*` del borrador MTP, las 333 tensores `visual.*` de la torre de visión, el camino completo `linear_attn.*` (Gated DeltaNet) y `lm_head`. El resto de capas lineales se cuantizan a NVFP4A16. Esta decisión es inusual: según la corrección del autor, solo 14 de 72 artefactos NVFP4 auditados mantienen todo el camino `linear_attn` en bf16. La receta usa llm-compressor 0.13.0 con targets `Linear` e ignore list `[lm_head, mtp.*, visual.*, linear_attn.*]`.

## Capacidades

- Generación de texto conversacional y de razonamiento compacto: el modelo hereda el comportamiento del tune "Cold Fusion", que produce razonamiento visible abreviado (entre 1/10 y 1/2 de los tokens de pensamiento de los Qwen estándar).
- Visión: procesa imágenes mediante la torre de visión en bf16 (pipeline `image-text-to-text`). Acepta mensajes multimodales estilo OpenAI (`content` array con partes `image_url`).
- Decodificación especulativa MTP: el borrador MTP en bf16 permite una tasa de aceptación medida del 97,4 % con temperatura 0 y longitud de aceptación media de 1,98 tokens.
- Tool calling y agentes: capacidades heredadas de Qwen3.8-27B, incluyendo razonamiento agéntico y uso de herramientas.
- Multilingüe: no se dispone de datos específicos de idiomas soportados en la información disponible, pero hereda las capacidades multilingües de la familia Qwen3.8.
- Modo pensamiento: el razonamiento está fuertemente abreviado por el entrenamiento Cold Fusion; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.

## Casos de uso

- Inferencia multimodal en GPU Blackwell con presupuesto de VRAM limitado: con 28,6 GB de pesos, una RTX PRO 6000 Blackwell de 32 GB ejecuta el modelo con contexto moderado; tarjetas mayores permiten subir `--max-model-len` hasta el nativo de 262K.
- Asistentes de conversación con razonamiento visible pero compacto: el tune Cold Fusion reduce la latencia percibida al acortar el thinking, manteniendo la calidad en tareas de razonamiento.
- Sistemas agénticos con decodificación especulativa: el cabezal MTP intacto acelera la generación en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`, útil para pipelines de agentes con múltiples turnos.
- Análisis de imágenes con contexto largo: la torre de visión en bf16 permite tareas de captioning y VQA en documentos largos con ventanas de hasta 262K tokens.
- Generación de código asistida en entornos con GPU Blackwell: hereda las capacidades de codificación de Qwen3.8-27B, con el beneficio de un footprint de memoria reducido.
- Investigación sobre cuantización de modelos híbridos: sirve como caso de estudio de cómo preservar rutas sensibles (atención lineal, cabezal MTP, visión) en cuantización NVFP4.

## Benchmarks y rendimiento

El autor midió los siguientes resultados sobre este checkpoint exacto (vLLM 0.27.1, 1× RTX PRO 6000 Blackwell):

| Prueba | Resultado |
|---|---|
| MMLU (muestra de 400 preguntas) | 79,5 % |
| Aceptación del draft MTP (temperatura 0, forma corta) | 97,6 %; longitud media de aceptación 1,98 |
| Sonda de visión | Descripción de escena correcta |
| Comportamiento de pensamiento | Razonamiento fuertemente abreviado (heredado del tune Cold Fusion) |

No se publicaron en la información disponible comparativas contra el modelo base en BF16 ni contra otras cuantizaciones del mismo tune. El autor de la cuantización indica que el método Cold Fusion mantiene el 99 % del rendimiento en BF16 en 8 y 4 bits, según la documentación del modelo base.

## Requisitos de hardware

- VRAM estimada: ~28,6 GB de pesos; una tarjeta de 32 GB (como la RTX PRO 6000 Blackwell) ejecuta el modelo con contexto moderado. Tarjetas mayores (48 GB, 80 GB) permiten subir `--max-model-len` hasta el nativo de 262K.
- GPU compatibles: únicamente Blackwell (compute capability 12.0). No funciona en GPUs de generaciones anteriores (Ampere, Ada, Hopper). Para estas, el autor recomienda los builds GGUF de DavidAU.
- Opciones de despliegue: vLLM (0.27.1 o superior) con soporte NVFP4; también es compatible con el ecosistema compressed-tensors. No se menciona soporte directo en llama.cpp u Ollama para este formato NVFP4.
- Latencia: no se publican medidas de throughput o latencia en la información disponible; el uso de decodificación especulativa MTP (1 token especulativo) reduce la latencia efectiva de generación.
- Configuración de ejemplo: `vllm serve windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 --served-model-name cf-nvfp4 --max-model-len 32768 --speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (BF16) | 27B | 262K | bf16 | Apache-2.0 | Modelo base sin cuantizar; 99 % rendimiento respecto al BF16 según el autor |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 (este modelo) | 19,1B (safetensors) | 262K (nativo) | NVFP4 | Apache-2.0 | Cuantizado para Blackwell; MTP, visión y DeltaNet en bf16 |
| Qwen3.8-27B-Abliterated-NVFP4 | 27B | 262K | NVFP4 | Apache-2.0 | Misma pipeline de cuantización, sin el tune Cold Fusion (abliterated) |
| Qwen3.8-27B (base, sin tune) | 27B | 256K | BF16/GGUF | Apache-2.0 | Modelo original de Qwen; razonamiento estándar sin Cold Fusion |

No se dispone de benchmarks comparativos directos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware Blackwell (compute capability 12.0). No es ejecutable en GPUs de generaciones anteriores; para esas plataformas hay que usar los GGUF de DavidAU.
- El razonamiento del modelo está fuertemente abreviado por el entrenamiento Cold Fusion; en tareas que requieran cadenas de pensamiento largas y detalladas, el modelo puede producir explicaciones demasiado concisas.
- La tasa de aceptación del draft MTP medida (97,4 %) corresponde a temperatura 0 y respuestas cortas; con temperatura alta y respuestas largas se espera una tasa menor.
- El número de parámetros reportado por safetensors (19,1 mil millones) difiere del nombre comercial "27B"; puede deberse a la eliminación de tensores duplicados o a la estructura de la cuantización, pero no se aclara en la documentación.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base de DavidAU para conocer restricciones adicionales del tune.
- No se han publicado evaluaciones detalladas de sesgos, alucinaciones ni calidad multilingüe específica para esta cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4
- Modelo base original: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Discusión que motivó la cuantización: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4/discussions/1
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de HackerNoon sobre Cold Fusion: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
