# tiyuvta/GLM-5.3-Flash-NVFP4-B200-hybrid

## Resumen

GLM-5.3-Flash-NVFP4-B200-hybrid es una versión cuantizada en precisión híbrida del modelo zai-org/GLM-5.3-Flash, publicada por el usuario tiyuvta (tiyuvta.ai). No es un checkpoint uniforme de 4 bits: sigue una receta de precisión por operador inspirada en la columna NVFP4 de la Tabla 2 del informe Nemotron-Labs-3-Puzzle-75B-A9B, combinando NVFP4, FP8, FP32 y BF16 según el tipo de tensor. Está dirigida específicamente a NVIDIA B200 (sm_100) y no es compatible con el pin para RTX PRO 6000.

El modelo base es un transformer MoE de 184.302.984.030 parámetros totales (según los pesos en safetensors), con arquitectura `glm5_next` que combina atención completa MLA/DSA con capas de atención lineal KDA. El repo ocupa 189,1 GB repartidos en 19 shards de safetensors. Los idiomas declarados son inglés y chino, y la licencia es MIT.

Su relevancia es doble: por un lado, demuestra una estrategia de cuantización híbrida fail-closed (cada tensor fuente se clasifica en exactamente un bucket o el proceso aborta) para hardware Blackwell; por otro, el propio autor advierte que el checkpoint todavía no ha superado la puerta de serving en sm_100 (kernel-check, argmax-margin y decodificación muestreada pendientes), por lo que no debe tratarse como un pin de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`glm5_next`): atención completa MLA/DSA + atención lineal KDA |
| Parámetros totales | 184.302.984.030 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (W4A4-shaped, max-calib), FP8 e4m3, FP32, BF16 (híbrido por operador) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (19 shards, 189,1 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida: capas de atención completa con MLA/DSA (Multi-head Latent Attention / DeepSeek Sparse Attention) combinadas con capas de atención lineal KDA (kernel de atención lineal fusionado `qmatvec_kda6`, presente en 34 capas). La componente MoE incluye expertos enrutados y compartidos, además de un MLP denso en las capas 0-2, y un router con `mlp.gate.weight` y `e_score_correction_bias`. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La innovación de esta ficha es la cuantización híbrida. Partiendo del gemelo BF16 del proveedor (656 GB, commit `f12e0fe1`), se aplicó `nvidia-modelopt` 0.46.0 con la siguiente asignación: los GEMM de expertos MoE enrutados y compartidos y el MLP denso van en NVFP4 max-calib con empaquetado K-inner `[N, K/2]` y plano de escalas Swizzle32x4x4 (CUTLASS / vLLM `swizzle_blockscale`, con padding N%128 y K%4); los seis tensores KDA que consume el kernel fusionado (`q,k,v_proj`, `f_a_proj`, `g_a_proj`, `b_proj`) van en FP8 e4m3 por tensor con `amax/448`; el router va en FP32; y el resto (QKV/output de atención MLA/DSA, `kv_b_proj`, conv1d, indexer, mHC, normas, embeddings, `lm_head`, visión, glue de MTP y `o_proj` de KDA) se mantiene en BF16. No se aplica rotación (ni QuaRot ni Hadamard), y el `input_scale` para tensor cores W4A4 queda diferido por falta de calibración de activaciones (256 x 65K).

El censo de tensores es 37.290 NVFP4, 204 FP8, 86 FP32 y 1.190 BF16, lo que da 113.554 tensores almacenados (3 por triple NVFP4, 2 por par FP8). El repo incluye `LAYOUT.json` como mapa de operadores y tres ficheros de rangos FR-Spec (32.768 líneas cada uno) que actúan como artefacto de vocabulario para el recorte en tiempo de carga del motor de serving.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Tool calling / function calling, según los tags del modelo.
- Razonamiento agéntico y multi-step, según el informe técnico de referencia ("from Vibe Coding to Agentic Engineering").
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de decodificación especulativa vía MTP (Multi-Token Prediction), cuyos tensores de glue se conservan en BF16.
- Componente de visión presente en el checkpoint (tensores de visión en BF16), aunque no se detalla su alcance funcional.
- No se documentan capacidades de audio ni modo thinking explícito.

## Casos de uso

- Serving de agentes en clústeres B200: el checkpoint está diseñado para tensor cores NVFP4 de sm_100, por lo que encaja en despliegues de inference a gran escala donde el ahorro de memoria frente al BF16 (656 GB) es determinante.
- Asistentes de código con tool calling: la preservación del router en FP32 y de los tensores de atención en BF16 busca mantener la estabilidad del enrutamiento de expertos y la calidad de atención en tareas de generación de código.
- Pipelines de razonamiento multi-paso: el soporte de MTP permite decodificación especulativa, útil en flujos agénticos con muchas llamadas encadenadas.
- Atención al cliente bilingüe EN/ZH: los dos idiomas declarados cubren mercados anglófono y chino en un mismo despliegue.
- Investigación en cuantización: el repo sirve como referencia reproducible de una receta híbrida por operador con censo fail-closed y mapa de operadores explícito.
- Evaluación de kernels CUTLASS/vLLM con escalas swizzled: útil para validar lectores de `swizzle_blockscale` y rutas dp4a con indexer K-major.
- No recomendado, en su estado actual, para producción directa: el autor indica explícitamente que aún no es un pin de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU objetivo: NVIDIA B200 (sm_100). El autor indica que no es apto para el pin de RTX PRO 6000.
- El proceso de creación se ejecutó en una GPU sm_89, donde `try_tensorrt=True` es un no-op; el plano Swizzle32x4x4 se escribe explícitamente.
- VRAM estimada: el repo pesa 189,1 GB, por lo que la carga completa requiere al menos esa capacidad más overhead de activaciones y KV cache; no se dispone de cifra oficial de VRAM de inferencia.
- No cabe en GPUs de consumo convencionales por tamaño; no se dispone de datos para RTX 4090 u otras.
- Despliegue: no es una carga estándar de `transformers`. Los consumidores previstos son tensor cores B200 y un indexer dp4a que direccione escalas K-major/swizzled. El autor menciona el motor de serving tiyuvta y la lectura de layout modelopt para el hermano 4o6, pero este fichero no es drop-in para ese lector.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiyuvta/GLM-5.3-Flash-NVFP4-B200-hybrid | 184,3 B | no disponible | Híbrida NVFP4/FP8/FP32/BF16 | MIT | HF, 579 descargas |
| tiyuvta/GLM-5.3-Flash-NVFP4 (pin PRO 6000) | mismo base | no disponible | NVFP4 con layout modelopt | MIT | HF |
| tiyuvta/GLM-5.3-Flash-NVFP4-4o6 | mismo base | no disponible | NVFP4 Four-Over-Six | MIT | HF |
| zai-org/GLM-5.3-Flash (BF16) | mismo base | no disponible | BF16 (656 GB) | MIT | HF |

Las tres variantes de tiyuvta comparten modelo base y licencia, pero difieren en el programa numérico y el layout: el pin PRO 6000 y el 4o6 usan layout modelopt, mientras que este híbrido B200 usa max-calib, K-inner y Swizzle32x4x4, y además sube los QKV de atención a BF16 y el router a FP32.

## Limitaciones y advertencias

- No es un pin de serving: kernel-check, argmax-margin y decodificación muestreada por defecto del proveedor en sm_100 siguen pendientes sobre estos bytes exactos.
- Falta el `input_scale` de activaciones para tensor cores W4A4; el autor advierte de no confundir el mint de pesos con serving W4A4.
- No cargar en lugar del pin `2bade47d` en RTX PRO 6000: es un programa numérico y un layout distintos.
- No es compatible con una carga estándar de `transformers` ni con el lector de layout modelopt existente del motor de serving.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Los ficheros de rangos FR-Spec son un artefacto de vocabulario del tokenizer original y aún se debe un remint propio por generación tras la puerta de serving en B200.
- Licencia MIT permite uso comercial, pero la ausencia de validación de serving desaconseja producción sin verificación previa.

## Enlaces

- Hugging Face: https://huggingface.co/tiyuvta/GLM-5.3-Flash-NVFP4-B200-hybrid
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Pin PRO 6000: https://huggingface.co/tiyuvta/GLM-5.3-Flash-NVFP4
- Hermano 4o6: https://huggingface.co/tiyuvta/GLM-5.3-Flash-NVFP4-4o6
- Informe técnico (arXiv 2602.15763): https://arxiv.org/abs/2602.15763
- Sitio del autor: https://tiyuvta.ai/
