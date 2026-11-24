# yujiepan/hy4-fp8-tiny-random

## Resumen

`yujiepan/hy4-fp8-tiny-random` es un checkpoint aleatorio de tamano minimo (55,4 millones de parametros) construido a partir de la arquitectura de `tencent/Hy4-FP8`, un modelo vision-lenguaje de tipo HYV4-VL con cuantizacion block-FP8. Lo desarrolla el usuario yujiepan como artefacto de test y depuracion, no como modelo de produccion: sirve para verificar la carga de pesos, la tokenizacion, el pipeline `image-text-to-text` y la compatibilidad con kernels de cuantizacion FP8 antes de escalar a checkpoints reales de cientos de gigabytes.

La relevancia es practica y acotada: permite a ingenieros de infraestructura validar integraciones (SGLang, transformers, compressed-tensors) sin descargar los 786 GB del modelo original. Reproduce la estructura de capas del backbone (1 capa densa + 9 MoE en esta variante), el mecanismo MLA con LoRA en Q/KV, las Hyper-Connections independientes, el indexer de atencion y la torre de vision, pero con anchuras reducidas (`hidden_size=128`) y vocabulario identico (120.832 filas).

No es un modelo utilizable para generacion de texto o vision: sus pesos son aleatorios y su unica funcion es servir de fixture de ingenieria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4-VL (transformer híbrido denso + MoE, MLA, vision encoder), block-FP8 |
| Parametros totales | 55.419.110 |
| Parametros activos | no disponible (variante MoE con top-k=8 sobre 32 expertos enrutados, pero el conteo activo no esta publicado) |
| Longitud de contexto | no disponible en el repo; el ejemplo de servicio usa `--context-length 4096` |
| Tipos de cuantizacion | compressed-tensors block FP8 (E4M3, escalas F32 en bloques 128x128); matrices de tokens, ViT y atencion de capa 0 en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 93,9 MB) |

## Arquitectura y entrenamiento

La arquitectura replica la de `tencent/Hy4-FP8` con dimensiones reducidas. El backbone consta de 10 capas: 1 densa y 9 MoE, con 32 expertos enrutados, top-k=8 y 1 experto compartido, tamano intermedio de experto 128. La atencion usa MLA con LoRA de rango 64 en Q y 512 en KV, 8 cabezas Q, dimensiones non-RoPE/RoPE/V de 32/64/32, gating MLA elementwise, sinks aprendidos y clamp SwiGLU a 10. Incluye 4 streams de Hyper-Connections independientes con pre-ramas con compuerta, y un indexer de atencion con 32 cabezas, dimension 128 y top-k 2048, colocado en las capas 0, 1 y cada 4 capas. La torre de vision tiene 4 capas, anchura 64 y anchura de salida 128.

La cuantizacion es block-FP8 E4M3 con escalas F32 en bloques 128x128, aplicada con `compressed-tensors`. Esta restriccion impone que la dimension de reduccion de las GEMM (`K % 128 == 0`) sea multiplo de 128, por lo que `hidden_size` se fija a 128 en las proyecciones gate/up de expertos, `linear_gate` de atencion y `q_a_proj`; por eso esta variante no puede reutilizar la anchura del checkpoint BF16 hermano. Los expertos enrutados se almacenan por experto (`experts.E.{gate,up,down}_proj.weight[_scale]`) con bloques 128x128 teselados por `ceil`. Las matrices de tokens no atadas en BF16 dominan el tamano del repo (~62 MB con hidden 128).

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO: los pesos son inicializados aleatoriamente segun la model card. El checkpoint incluye ademas la estructura de borrador DFly2 (5 capas densas MLA con fusion y correccion oculta), presumiblemente para decodificacion especulativa, aunque su funcionalidad no esta verificada en esta variante.

## Capacidades

- Generacion de texto multimodal: la arquitectura esta disenada para entradas de texto, imagen y video mediante los marcadores `<image>` y `<video>` en el prompt, pero los pesos aleatorios no producen salidas coherentes.
- Razonamiento multi-paso y tool calling: el ejemplo de servicio SGLang activa `--reasoning-parser auto` y `--tool-call-parser auto`, lo que indica que la arquitectura preve parsers de razonamiento y llamadas a herramientas; no hay evidencia de que funcionen con pesos aleatorios.
- Vision: torre de vision integrada (4 capas, anchura 64) que procesa parches de imagen y los proyecta al espacio del backbone.
- Video: soporte declarado de entradas de video mediante el placeholder `<video>`.
- Multilingue: vocabulario de 120.832 filas con embeddings no atados; la lista de idiomas no esta disponible.
- Decodificacion especulativa: estructura DFly2 con 5 capas densas MLA, fusion y correccion oculta presente en el checkpoint.
- Capacidades de agente: no verificadas; la model card solo menciona parsers de razonamiento y tool calling en el servidor.

## Casos de uso

- Validacion de pipelines de carga FP8: usar el repo como fixture para comprobar que transformers y compressed-tensors reconstruyen correctamente los descriptores de cuantizacion block-FP8 (E4M3 con escalas F32 128x128) antes de pasar a checkpoints de 786 GB. Es adecuado porque reproduce exactamente el descriptor y las exclusiones del original.
- Pruebas de integracion con SGLang: servir el modelo con la rama PR #51672 y verificar que las peticiones OpenAI-compatible de chat, imagen y video responden sin errores de kernel en SM90 (H20/H100 con CUDA 13). El modelo es lo bastante pequeno para iterar rapido en CI.
- Depuracion de tokenizacion y plantillas de chat: comprobar el manejo de los placeholders `<image>` y `<video>` y la resolucion de tokens especiales con el vocabulario de 120.832 filas, sin coste de descarga.
- Test de regresion de kernels Triton y flashinfer: ejecutar el servidor con `SGLANG_SKIP_SGL_KERNEL_VERSION_CHECK=1` y validar que las GEMM FP8 con `K % 128 == 0` compilan y producen formas correctas en `hidden_size=128`.
- Verificacion de decodificacion especulativa: cargar la estructura DFly2 (5 capas MLA de borrador) y comprobar que la fusion y la correccion oculta se inicializan y se invocan sin errores de forma.
- Benchmark de arranque y memoria: medir tiempo de carga, huella de VRAM y latencia de un forward con pesos aleatorios para dimensionar el despliegue del modelo completo; util para comparar configuraciones de `tp`, dtype y context-length.
- Formacion de ingenieros: servir como ejemplo didactico de como se organizan pesos MoE por experto, escalas de bloque y matrices no atadas en un checkpoint FP8 de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, MMMU) seria invalida por construccion.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en BF16/FP8 dado el tamano de 93,9 MB del checkpoint; cabe en cualquier GPU consumer (GTX 16xx, RTX 20xx/30xx/40xx) y en CPU.
- GPU recomendadas para validar kernels FP8: H20, H100, H200 o cualquier SM90 con CUDA 13; la model card menciona explicitamente H20 con driver 535 y `cuda-compat-13`.
- Consumer GPU: si, cabe con holgura; la restriccion real es la disponibilidad de kernels block-FP8 en SM90, no la memoria.
- Despliegue: SGLang (rama PR #51672, no hay wheel publicada), transformers con `compressed-tensors`; llama.cpp, Ollama y TGI no estan mencionados ni verificados.
- Latencia y throughput: no disponibles; con 55 millones de parametros y 10 capas, el coste dominante seria el overhead de servidor y de kernels, no el computo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| `yujiepan/hy4-fp8-tiny-random` | 55,4 M | no disponible (ejemplo a 4096) | no disponible | Hugging Face, 0 descargas | Fixture de test FP8 |
| `tencent/Hy4-FP8` | ~774 B (11,58 B BF16 + 762,82 B FP8 E4M3) | no disponible | no disponible | Hugging Face, 786,31 GB en 245 ficheros | Modelo vision-lenguaje de produccion |
| Variante BF16 hermano de Hy4 | no disponible | no disponible | no disponible | referenciada en la model card | Checkpoint sin cuantizacion FP8 |

La comparativa relevante es exclusivamente estructural: este repo reduce el backbone de 78 a 10 capas, la anchura de 6.144 a 128, los expertos de 256 a 32 y el tamano intermedio de experto de 2.048 a 128, manteniendo vocabulario, top-k, cadencia del indexer, Hyper-Connections y descriptor de cuantizacion. No hay alternativas publicas de proposito equivalente (fixtures FP8 de modelos MoE multimodales de gran escala) identificadas en la informacion disponible.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto, codigo ni descripciones de imagen coherentes; cualquier uso fuera de test o depuracion produce salidas sin sentido.
- No es un modelo de produccion: no debe desplegarse en aplicaciones de usuario final ni usarse para evaluar calidad.
- Licencia no disponible: no se puede confirmar el uso comercial; ademas, al derivar de `tencent/Hy4-FP8`, quedan sujetas las condiciones del modelo base, que tampoco estan publicadas en este repo.
- Idiomas no disponibles: no hay lista verificada de idiomas soportados.
- Dependencia de kernels no publicados: el soporte block-FP8 de Hy4-VL reside en una rama de SGLang (PR #51672) sobre CUDA 13, torch 2.14.1+cu130 y flashinfer 0.7.4; no hay wheel estable, lo que introduce riesgo de rotura en CI.
- Restriccion de forma: `hidden_size=128` impide reutilizar pesos o configuraciones del checkpoint BF16 hermano; scripts que asuman anchuras mayores fallaran.
- Riesgo de alucinacion: total, por construccion (pesos aleatorios).
- Sesgos: no evaluables con pesos aleatorios; los sesgos del modelo original no estan documentados en la informacion disponible.
- Model card generada por `DeepSeek-V4.1-Flash`: conviene tratar las afirmaciones de la model card como no auditadas hasta verificarlas contra el codigo de `.meta/create_model.py`.
- Fecha de creacion futura (2026-11-24) y 0 descargas/0 likes: artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repo Hugging Face: https://huggingface.co/yujiepan/hy4-fp8-tiny-random
- Modelo base: https://huggingface.co/tencent/Hy4-FP8
- Script de creacion: `.meta/create_model.py` (en el repo)
- Log de estructura: `.meta/model.log` (en el repo)
- Entorno de generacion: `.meta/env.json` (en el repo)
- PR de SGLang con soporte block-FP8 de Hy4-VL: https://github.com/sgl-project/sglang (PR #51672, commit `a0804a2f99719f5666ed2018e5d00a75645de6a8`)
- Libreria compressed-tensors: no disponible enlace directo en la informacion proporcionada
