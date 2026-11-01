# ToxeH/Qwen3-Coder-30B-A3B-Instruct-Ternary2x

## Resumen

ToxeH/Qwen3-Coder-30B-A3B-Instruct-Ternary2x es una cuantización híbrida de precisión mixta del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, desarrollada por el usuario ToxeH y publicada en formato MLX para Apple Silicon. El objetivo es hacer viable la inferencia de un modelo MoE de 30.532 millones de parámetros (3.300 millones activos por token, 128 expertos) en Macs con 16 o 18 GB de memoria unificada, un escenario en el que las cuantizaciones estándar de 4 bits (unos 17,2 GiB) provocan swapping severo y las de 3 bits (unos 12,4 GiB) degradan la atención RoPE en contextos largos.

La innovación central es una descomposición ternaria multi-plano: los expertos enrutados del MoE (95,1% de los parámetros) se comprimen con dos planos ternarios (-1, 0, +1) con compensación de residuo, mientras que las capas de atención, embeddings y lm_head (4,9% de los parámetros, pero activas en el 100% de los tokens) se codifican con tres planos ternarios, reduciendo el error de reconstrucción del 18,5% al 2,20%. El resultado ocupa 12,99 GiB y mantiene citas exactas de números de línea sin bucles de repetición en contextos de 25k tokens o más.

El modelo es relevante porque demuestra que es posible ejecutar un modelo de código de gama alta con capacidades agénticas en hardware de consumo de Apple, sin necesidad de parchear el motor de inferencia: los planos ternarios se empaquetan en tablas de cuantización afín `uint32` estándar de MLX, por lo que `mlx_lm`, LM Studio y vllm-mlx lo cargan de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 128 expertos con 8 activos por token |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B por token |
| Longitud de contexto | 65.536 tokens (configurado en mlx-serve); el modelo base soporta contextos largos, aunque la model card no fija un máximo absoluto |
| Tipos de cuantizacion | Ternaria híbrida multi-plano: 2 planos ternarios (bits=3, group_size=64) en expertos MoE; 3 planos ternarios (bits=6, group_size=64) en atención, embeddings y lm_head; bfloat16 completo en router y normas |
| Idiomas soportados | en, zh, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, tablas de cuantización afín `uint32` + scales + biases) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos y 8 activos por token, del que se derivan 30,5B parámetros totales y 3,3B activos. Esta ficha no dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original; esos datos corresponden a la model card de Qwen y no se incluyen en la información proporcionada.

La aportación técnica de esta versión es el esquema de cuantización. Los expertos enrutados (`mlp.switch_mlp.{gate,up,down}_proj`) se aproximan como w ≈ α₁t₁ + α₂t₂ con dos planos ternarios, lo que da un error relativo de reconstrucción del 18,5% y un tamaño reducido. Las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), los embeddings y el lm_head usan tres planos (w ≈ α₁t₁ + α₂t₂ + α₃t₃), bajando el error al 2,20% y preservando la atención RoPE en contextos largos. El router MoE y las capas de normalización se mantienen en bfloat16 para evitar desviaciones en la selección de expertos. Los planos se empaquetan en el formato afín estándar de MLX, de modo que no se requiere un motor modificado; adicionalmente se incluye un kernel Metal opcional (`libternary2x_mlxserve.c`) que decodifica los planos ternarios directamente en registros de GPU.

## Capacidades

- Generación de texto y código con razonamiento agéntico multi-paso, heredado del modelo base Qwen3-Coder.
- Escritura y refactorización de código en múltiples lenguajes, con soporte de tests unitarios (el ejemplo de la model card pide un LRU cache thread-safe en Rust con tests).
- Citas exactas de números de línea en contextos de 25k tokens o más, sin bucles de repetición, según las pruebas del autor con OpenCode, Cline y Roo Code.
- Integración con herramientas de codificación agéntica: opencode, cline, roo-code.
- Capacidades multilingües limitadas a inglés, chino y ruso según los metadatos del repositorio.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo thinking; deben verificarse en la model card del modelo base.

## Casos de uso

- Codificación agéntica en Mac de 16-18 GB: el modelo permite ejecutar OpenCode, Cline o Roo Code con contextos de 25k-64k tokens sin swapping, manteniendo citas de línea correctas, algo que las cuantizaciones estándar de 3 bits no logran.
- Asistente de refactorización en local: con 12,99 GiB de pesos quedan 3-4 GB libres para la caché KV, suficiente para cargar varios ficheros de un proyecto y proponer cambios coherentes entre ellos.
- Generación de tests unitarios: el ejemplo de la model card (LRU cache en Rust con tests) ilustra el uso típico de generación de código con verificación.
- Automatización de revisión de código en CI local: al soportar contextos largos y citas exactas de línea, puede señalar ubicaciones concretas en informes de revisión sin alucinar números de línea.
- Prototipado en Apple Silicon sin GPU dedicada: desarrolladores con M1/M2/M3/M4 Pro pueden iterar sobre un modelo de 30B sin depender de servicios en la nube.
- Investigación sobre cuantización ternaria: el repositorio incluye el script de conversión (`convert_qwen3_coder_30b_ternary2x.py`) y el kernel Metal, útiles para estudiar el impacto de la descomposición multi-plano en la calidad de atención.
- Despliegue con mlx-serve y caché KV cuantizada a 4 bits: la configuración recomendada (`--ctx-size 65536 --kv-quant 4`) permite servir el modelo con contexto máximo en hardware de consumo.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en un MacBook Pro con Apple M3 Pro (18 GB), no benchmarks académicos estándar:

| Variante | Tamano de pesos | Cabe en 16-18 GB a 25k-64k ctx | Error en atencion (q,k,v,o) | Prefill (ctx 20k) | Decode | Codificacion agentica de contexto largo |
|---|---|---|---|---|---|---|
| 4-bit estandar (mlx-community) | ~17,2 GiB | No (OOM/swap por encima de 8k) | ~5,0% | Lento (swap) | Lento (swap) | Inutilizable en 16-18 GB |
| 3-bit estandar (mlx-community) | ~12,4 GiB | Si | ~18,5% | ~95 tok/s | ~54 tok/s | Alucina lineas y entra en bucles por encima de 15k |
| Ternary2x hibrido (este repo) | 12,99 GiB | Si (~3-4 GB libres para KV) | 2,20% | 240,4 tok/s | 53,5 tok/s | Citas exactas y sin bucles a 25k+ |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 12,99 GiB de pesos; el autor indica que quedan 3-4 GB libres para caché KV en Macs de 16-18 GB.
- Hardware objetivo: Apple Silicon M1/M2/M3/M4 Pro con 16 o 18 GB de memoria unificada; medido en un M3 Pro de 18 GB.
- No cabe en GPUs consumer con menos de 16 GB de VRAM; en el ecosistema CUDA no hay soporte nativo porque el formato es MLX.
- Despliegue: `mlx_lm.generate` (nativo, sin parches), LM Studio, vllm-mlx y mlx-serve; este último con el kernel Metal opcional `libternary2x_mlxserve.c` para máxima velocidad.
- Configuración recomendada en mlx-serve: `--ctx-size 65536 --kv-quant 4 --no-decode-attn-quant --no-pld`.
- Parámetros de muestreo recomendados para codificación agéntica: temperature 0,1-0,2, top_p 0,9, top_k 20, repetition_penalty 1,12, presence_penalty 0,50.
- Throughput medido: prefill de 240,4 tok/s a 20k de contexto y decode de 53,5 tok/s en M3 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToxeH/Qwen3-Coder-30B-A3B-Instruct-Ternary2x | 30,5B totales / 3,3B activos | 65.536 (config. mlx-serve) | MLX safetensors ternario hibrido | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B totales / 3,3B activos | No disponible en esta ficha | safetensors bfloat16 | apache-2.0 | HuggingFace (modelo base) |
| Cuantizacion 4-bit estandar (mlx-community) | 30,5B totales / 3,3B activos | No disponible | MLX 4-bit (~17,2 GiB) | apache-2.0 | HuggingFace |
| Cuantizacion 3-bit estandar (mlx-community) | 30,5B totales / 3,3B activos | No disponible | MLX 3-bit (~12,4 GiB) | apache-2.0 | HuggingFace |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de rendimiento frente a otros modelos de codificación de tamaño similar.

## Limitaciones y advertencias

- El error de reconstrucción del 18,5% en los expertos MoE es alto; aunque el autor reporta buen comportamiento en codificación, puede afectar a tareas fuera del dominio de código.
- Solo se declaran los idiomas inglés, chino y ruso; el rendimiento en castellano no está verificado.
- El formato es exclusivamente MLX: no hay pesos GGUF ni safetensors estándar para llama.cpp, Ollama o TGI.
- Requiere Apple Silicon; no es desplegable en GPUs NVIDIA o AMD sin reconversión.
- La model card no documenta sesgos, tasas de alucinación ni evaluaciones de seguridad; el riesgo de alucinación en código debe asumirse y mitigarse con tests.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las cifras del autor.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Coder-30B-A3B-Instruct.
- El kernel Metal opcional se inyecta con `DYLD_INSERT_LIBRARIES`, técnica que puede interferir con otros procesos y no es adecuada para entornos gestionados.

## Enlaces

- HuggingFace: https://huggingface.co/ToxeH/Qwen3-Coder-30B-A3B-Instruct-Ternary2x
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Kernel Metal incluido: `libternary2x_mlxserve.c` (en el repositorio del modelo)
- Script de conversión incluido: `convert_qwen3_coder_30b_ternary2x.py` (en el repositorio del modelo)
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
