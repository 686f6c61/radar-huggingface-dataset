# ycui7/MiMo-V2.6-Distill-Qwen-9B-NVFP4-MTP

## Resumen

`ycui7/MiMo-V2.6-Distill-Qwen-9B-NVFP4-MTP` es una cuantización de solo post-entrenamiento (PTQ) del modelo `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, que a su vez deriva de `Qwen/Qwen3.5-9B`. El autor, `ycui7`, ha utilizado NVIDIA TensorRT Model Optimizer para convertir las 32 capas del transformer y la proyección `lm_head` a NVFP4 (E2M1, bloques de 16, escalas FP8 E4M3), manteniendo en bf16 la torre de visión, la atención lineal GDN, los embeddings y la cabeza MTP de decodificación especulativa.

El objetivo declarado es maximizar la tasa de generación de tokens en GPUs consumer Blackwell (RTX PRO 6000, sm_120). El repositorio ocupa 7,9 GB y declara 5.688.438.512 parámetros en safetensors, muy por debajo del "9B" del nombre comercial, diferencia que conviene tener en cuenta al planificar VRAM. Soporta una ventana de contexto de 262.144 tokens y se sirve con vLLM (>= 0.30) o SGLang, con throughput medido de hasta 305,8 tok/s en vLLM con `num_speculative_tokens=2`.

Es relevante ahora porque expone una combinación poco habitual: cuantización NVFP4 con KV cache en FP8, cabeza MTP embebida a precisión completa y decodificación especulativa nativa en un modelo de ~5,7 B parámetros que cabe en hardware Blackwell de una sola GPU. La contrapartida es que el autor advierte explícitamente de que no se ha evaluado la calidad del modelo: no hay benchmarks de tareas ni suite de precisión, solo una prueba interna de recuperación en contexto largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la familia Qwen3.5 (tag `qwen3_5`), 32 capas, con atención lineal GDN y torre de visión; cabeza MTP para decodificación especulativa |
| Parámetros totales | 5.688.438.512 (~5,69 B) según safetensors; el nombre del modelo indica 9B |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K), según los comandos de servicio documentados |
| Tipos de cuantización | NVFP4 (E2M1, bloque 16, escalas FP8 E4M3) en las 32 capas del transformer y en `lm_head`; KV cache en FP8 (`e4m3fn`); bf16 en `embed_tokens`, atención lineal GDN (`conv1d`, `in_proj_a/b`), torre de visión (`model.visual.*`) y cabeza MTP (`mtp.*`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiquetado como 8-bit), repositorio de 7,9 GB |
| Modelo base | `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` |
| Modelo upstream | `Qwen/Qwen3.5-9B` |
| Herramienta de cuantización | NVIDIA TensorRT Model Optimizer (`examples/hf_ptq`), receta `nvfp4_lmhead_nvfp4-kv_fp8_cast` |
| Tamaño de `lm_head` | 1.017 M parámetros (el GEMM dominante en decodificación) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia Qwen3.5. La lista de módulos excluidos de la cuantización (`ignore`: `embed_tokens`, `linear_attn.conv1d`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, `mtp.*`, `model.visual*`) revela tres componentes diferenciales: una atención lineal de tipo GDN conviviendo con atención estándar, una torre de visión para entrada de imágenes y una cabeza de predicción multi-token (MTP) embebida que actúa como modelo borrador para decodificación especulativa. Las 32 capas del transformer se cuantizan a NVFP4, incluida la proyección `lm_head` de 1.017 M parámetros, que es el GEMM dominante durante la decodificación. La cabeza MTP se mantiene en bf16 para conservar la tasa de aceptación (el autor declara ~99,5 %).

En cuanto al entrenamiento, este repositorio no introduce ninguno: es una conversión PTQ pura con ModelOpt, sin SFT, sin RL, sin fine-tuning y sin entrenamiento consciente de la calibración. El único ajuste es de precisión numérica. El modelo base del que parte es una destilación de MiMo-V2.6 sobre Qwen3.5-9B, según se deduce de la nomenclatura `MiMo-V2.6-Distill-Qwen-9B`; no se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO. En el lado de la innovación técnica, lo destacable es la combinación de NVFP4 en pesos con KV cache FP8 (`fp8_cast`), obligada porque el KV cache en NVFP4 es exclusivo de SM100, y el uso de la cabeza MTP en precisión completa como mecanismo de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento: el despliegue en SGLang documenta `--reasoning-parser mimo`, lo que indica la existencia de un modo de razonamiento explícito en la plantilla de chat del modelo.
- Tool calling / function calling: SGLang documenta `--tool-call-parser mimo`, lo que implica soporte de llamadas a herramientas integrado en el modelo base.
- Visión: la presencia de torre de visión (`model.visual.*`) mantenida en bf16 indica capacidad de procesamiento de imágenes como entrada.
- Contexto largo: ventana de hasta 262.144 tokens, con una prueba interna de recuperación en contexto largo citada por el autor como único control de calidad realizado.
- Decodificación especulativa nativa: cabeza MTP embebida en bf16 con ~99,5 % de aceptación declarada, explotable en vLLM (`--spec-method mtp`) y SGLang (`--speculative-algorithm NEXTN`).
- Agentes y razonamiento multi-paso: no documentado explícitamente; la combinación de parser de razonamiento y de tool calling lo hace viable, pero sin evaluación publicada.
- Capacidades multilingües: no disponible (ni en la model card ni en los metadatos del repositorio).

## Casos de uso

- Serving de alto throughput en Blackwell: el caso de uso declarado por el autor. Con vLLM, `num_speculative_tokens=2` y `lm_head` en NVFP4 se alcanzan 305,8 tok/s en una RTX PRO 6000 a 256K de contexto, lo que lo hace adecuado para endpoints de generación con requisitos de latencia estrictos.
- Asistente conversacional con contexto muy largo: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con historiales extensos o documentos completos en el prompt sin truncado ni técnicas de recuperación.
- RAG sobre corpus documentales extensos: se pueden inyectar contratos, expedientes o bases de conocimiento completas dentro de la ventana, reduciendo la dependencia de un retriever externo y de sus errores de recuperación.
- Procesamiento de documentos con componente visual: la torre de visión en bf16 permite extraer información de capturas, formularios escaneados o gráficos junto con el texto asociado en una única pasada.
- Asistentes con integración de herramientas: el parser `mimo` de tool calling permite construir agentes que consulten APIs, bases de datos o sistemas internos, siempre que se validen previamente las tasas de acierto en el formato de llamada.
- Investigación en cuantización NVFP4: sirve como caso de estudio reproducible de PTQ con ModelOpt sobre un transformer híbrido, útil para medir el impacto de NVFP4 en capas de atención lineal y en `lm_head` frente a bf16.
- Evaluación de decodificación especulativa con cabeza MTP: el repositorio publica las curvas de throughput para distinto número de tokens especulativos, lo que lo convierte en un banco de pruebas para comparar estrategias de decodificación especulativa entre vLLM y SGLang.
- Generación por lotes en pipelines offline: etiquetado, resumen o reformateo masivo de datos, donde el throughput por GPU es el factor dominante y la calidad se valida con una muestra previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El autor indica explícitamente que el modelo no ha pasado ninguna evaluación de calidad, salvo una prueba interna de recuperación en contexto largo.

Los únicos datos numéricos publicados son de throughput, medidos en una RTX PRO 6000 Blackwell (sm_120), con 256K de contexto y una sola GPU:

| Configuración | Tokens especulativos / pasos | Throughput (tok/s) |
|---|---|---|
| vLLM, `lm_head` NVFP4 | 0 | 182,8 |
| vLLM, `lm_head` NVFP4 | 1 | 206,1 |
| vLLM, `lm_head` NVFP4 | 2 | 305,8 (pico) |
| vLLM, `lm_head` NVFP4 | 3 | 164,5 |
| SGLang, `lm_head` bf16 | P3 (`num-steps 2` / `draft-tokens 3`) | 222,5 (pico) |

La diferencia entre ambas configuraciones se atribuye a que en la build de SGLang el `lm_head` permanece en bf16, mientras que en vLLM se sirve cuantizado a NVFP4. La tasa de aceptación declarada de la cabeza MTP es de ~99,5 %.

## Requisitos de hardware

- Acelerador obligatorio: la cuantización NVFP4 requiere hardware Blackwell. El autor ha medido sobre RTX PRO 6000 (sm_120); el propio modelo documenta que el KV cache en NVFP4 es exclusivo de SM100, de ahí que en sm_120 sea necesario `--kv-cache-dtype fp8`.
- VRAM: el repositorio pesa 7,9 GB, por lo que los pesos caben holgadamente en GPUs consumer Blackwell, como una RTX 5090 de 32 GB, dejando margen para KV cache FP8 y overhead del runtime. La VRAM exacta necesaria para 256K de contexto no está disponible.
- Configuración de referencia del autor: una sola GPU con `--gpu-memory-utilization 0.85` y `--max-model-len 262144` sobre RTX PRO 6000. No se publican medidas en A100, H100 ni en GPUs no Blackwell, y NVFP4 no es nativo en esas arquitecturas.
- Opciones de despliegue: vLLM >= 0.30 y SGLang (`lmsysorg/sglang:dev-cu13`) están documentados con comandos completos. No hay artefactos GGUF en el repositorio, por lo que llama.cpp y Ollama no están soportados según la información disponible. La receta de cuantización es reproducible con ModelOpt.
- Flags críticos: `--trust-remote-code` en ambos runtimes, `--dtype bfloat16`, `--kv-cache-dtype fp8` en vLLM, y `--speculative-draft-model-quantization unquant` en SGLang para cargar la cabeza borrador sin cuantizar.
- Latencia y throughput: hasta 305,8 tok/s en vLLM con MTP (`num_speculative_tokens=2`) y 222,5 tok/s en SGLang (P3) en las condiciones medidas. No se especifica el tamaño de lote ni si las cifras corresponden a una única petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| `ycui7/MiMo-V2.6-Distill-Qwen-9B-NVFP4-MTP` | 5,69 B (safetensors) | 262.144 | NVFP4 + KV FP8 + MTP bf16 | no disponible | No (solo throughput) |
| `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` (base sin cuantizar) | no disponible | no disponible | bf16 | no disponible | no disponible |
| `Qwen/Qwen3.5-9B` (upstream) | ~9 B por nomenclatura | no disponible | bf16 | no disponible | no disponible |

No se dispone de datos de benchmarks ni de licencia de los modelos comparados, por lo que la comparación se limita a la relación de derivación entre los tres repositorios. No se han identificado en la información proporcionada otras cuantizaciones NVFP4 del mismo modelo base con las que contrastar.

## Limitaciones y advertencias

- Calidad no validada: el autor declara explícitamente que el modelo no ha pasado ninguna evaluación de tareas ni suite de precisión, más allá de una prueba interna de recuperación en contexto largo. Cualquier uso en producción exige evaluaciones propias previas.
- Licencia no disponible: no se especifica licencia en el repositorio ni en la model card. Al ser una cuantización de un modelo de Xiaomi, los términos aplicables son presumiblemente los del modelo base, pero no están documentados, lo que supone un riesgo legal para uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Compatibilidad restringida a Blackwell: NVFP4 no se ejecuta en GPUs anteriores, y el KV cache NVFP4 es exclusivo de SM100. Esto limita el despliegue a hardware reciente y descarta A100, H100 y GPUs consumer de generaciones previas.
- Sin soporte GGUF: al publicarse únicamente safetensors en NVFP4, no hay ruta documentada hacia llama.cpp, Ollama u otros runtimes basados en GGUF.
- `--trust-remote-code` obligatorio en vLLM y SGLang, lo que implica ejecutar código del repositorio y añade superficie de riesgo en entornos no controlados.
- Discrepancia de tamaño: el nombre comercial indica 9B, pero safetensors declara 5.688.438.512 parámetros. Conviene verificar el conteo real antes de dimensionar VRAM o presupuesto de cómputo.
- Degradación por PTQ no medida: la cuantización NVFP4 de `lm_head` altera la calibración de logits frente a bf16 (el propio autor observa diferencias de rendimiento entre builds con `lm_head` cuantizado y sin cuantizar), pero no se ha medido el impacto en tareas sensibles a la precisión como matemáticas o código.
- Riesgo de alucinación: inherente a un modelo destilado de 5,7 B, y no cuantificado en este repositorio.
- Idiomas y sesgos: no hay información sobre cobertura idiomática, composición del dataset de entrenamiento ni sesgos conocidos.
- Idiomas soportados y pipeline: ambos marcados como no disponibles en los metadatos, sin documentación adicional en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ycui7/MiMo-V2.6-Distill-Qwen-9B-NVFP4-MTP
- Modelo base (destilación MiMo): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo upstream original: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de cuantización (NVIDIA TensorRT Model Optimizer): https://github.com/NVIDIA/Model-Optimizer
