# tiny-random/hy4-fp8

## Resumen

`tiny-random/hy4-fp8` es un checkpoint de juguete generado aleatoriamente a partir de la arquitectura de `tencent/Hy4-FP8`, un modelo multimodal de tipo image-text-to-text. No es un modelo entrenado ni utilizable en produccion: su proposito es servir como fixture de pruebas para validar la implementacion de la arquitectura HYV4-VL y del esquema de cuantizacion block-FP8 (compressed-tensors) en stacks de inferencia como SGLang. El repositorio lo publica la organizacion `tiny-random`, habitual en checkpoints de depuracion, y segun la model card fue generado automaticamente por DeepSeek-V4.1-Flash.

El checkpoint conserva la topologia del modelo original (backbone hibrido con capas densas y MoE, vision encoder, atencion MLA, capas draft DFly2 para decodificacion especulativa) pero con dimensiones reducidas: hidden width de 128 en lugar de 6.144, 10 capas de backbone en lugar de 78 y 32 expertos enrutados en lugar de 256. Los pesos son aleatorios, por lo que no existe capacidad linguistica ni de vision real.

Su relevancia es puramente de ingenieria: permite verificar de forma barata (93,9 MB frente a los 786 GB del modelo original) que el pipeline de carga, el descriptor de cuantizacion FP8 E4M3 con bloques 128x128, el enrutado MoE top-8 con experto compartido y la integracion de placeholders `<image>`/`<video>` funcionan correctamente antes de escalar al checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4-VL (transformer hibrido denso + MoE, atencion MLA, vision encoder, capas draft DFly2) |
| Parametros totales | 55.419.110 |
| Parametros activos | no disponible (MoE con 32 expertos enrutados, top-8, 1 compartido; no se publica el computo activo) |
| Longitud de contexto | no disponible en el repo; el ejemplo de SGLang usa `--context-length 4096` |
| Tipos de cuantizacion | block FP8 E4M3 con escalas F32 en bloques 128x128 (compressed-tensors); matrices de tokens, ViT y atencion de la capa 0 en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 93,9 MB) |

## Arquitectura y entrenamiento

El checkpoint replica la estructura de `tencent/Hy4-FP8`: un backbone de 10 capas (1 densa + 9 MoE) con hidden width 128 y MLP denso de 128, 32 expertos enrutados con top-k 8 y un experto compartido, tamano intermedio de experto 128. La atencion es de tipo MLA con 8 cabezas Q (dimensiones 32 no-RoPE / 64 RoPE / 32 V), rangos LoRA Q/KV de 64/512, gating elementwise, sinks aprendidos y clamp SwiGLU a 10. Incluye un indexador de atencion dispersa con 32 cabezas, dimension 128 y top-k 2.048, activo en las capas 0, 1 y luego cada 4 capas, ademas de 4 flujos de Hyper-Connections independientes con pre-ramas con compuerta.

El modulo de vision tiene 4 capas, anchura 64 y salida de 128 (frente a 40/1.536/6.144 del original). Se anaden 5 capas draft densas MLA con fusion y correccion oculta para decodificacion especulativa DFly2. La cuantizacion es block-FP8 E4M3 con escalas F32 por bloques de 128x128; como el GEMM en SM90 exige `K % 128 == 0` en la dimension de reduccion, el hidden size se fija en 128. Los pesos son aleatorios: no ha habido entrenamiento, RLHF ni DPO, y no se documenta composicion de dataset.

## Capacidades

- Ninguna capacidad funcional real: los pesos son aleatorios y no producen texto, codigo ni descripciones de imagen coherentes.
- La interfaz expone el pipeline `image-text-to-text` con placeholders `<image>` y `<video>` en el prompt, pero sin semantica aprendida.
- El descriptor de cuantizacion y la topologia MoE/MLA son validos para probar tooling de carga e inferencia.
- Soporte declarado de parsers `--reasoning-parser auto` y `--tool-call-parser auto` en SGLang (heredado del modelo base, no verificado en este checkpoint).
- Capacidades multilingues: no disponibles.
- Modo thinking, vision y video: la arquitectura los contempla; el checkpoint no los implementa de forma util.

## Casos de uso

- Pruebas de integracion de SGLang: validar que la PR #51672 carga correctamente pesos block-FP8 E4M3 con bloques 128x128 antes de desplegar el modelo de 786 GB.
- CI de kernels CUDA: ejecutar smoke tests de GEMM FP8 en SM90 (H20, H100) comprobando la restriccion `K % 128 == 0` con un artefacto de 94 MB.
- Validacion de tokenizer y plantillas de chat: comprobar el manejo de los 120.832 tokens de vocabulario y los placeholders multimodales sin coste de descarga.
- Desarrollo de parsers de tool calling y reasoning: verificar el enrutado de `--reasoning-parser` y `--tool-call-parser` en el endpoint compatible con OpenAI.
- Test de pipelines de cuantizacion: comprobar que compressed-tensors reconstruye correctamente las escalas F32 y las exclusiones BF16 (matrices de tokens, ViT, atencion de capa 0).
- Benchmark de latencia de infraestructura: medir overhead de carga, arranque del servidor y throughput del scheduler MoE con un modelo minimo que ejercita todas las rutas de codigo.
- Validacion de decodificacion especulativa: probar la estructura de las 5 capas draft DFly2 y su logica de fusion sin necesidad del checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, MMMU) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en BF16/FP8 para el checkpoint completo (93,9 MB de pesos mas activaciones y cache KV con contexto 4.096).
- GPU recomendadas: cualquier GPU con soporte CUDA 13 y SM90 para reproducir el path FP8 nativo (H20, H100). En GPUs anteriores el kernel block-FP8 puede no estar disponible.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM; el cuello de botella es la toolchain (torch 2.14.1+cu130, flashinfer 0.7.4, `sgl-fa3`, `sgl-flash-mla`), no la memoria.
- Despliegue: SGLang desde la PR #51672 (no hay wheel publicada), con `SGLANG_SKIP_SGL_KERNEL_VERSION_CHECK=1`. En H20 con driver 535 hay que anteponer `cuda-compat-13` en `LD_LIBRARY_PATH` y `LIBRARY_PATH`. Transformers puede cargar los pesos, pero no se garantiza la ejecucion de los kernels FP8.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-random/hy4-fp8 | 55,4 M | no disponible | texto, imagen, video | no disponible | Fixture de pruebas |
| tencent/Hy4-FP8 | 11,58 B BF16 + 762,82 B F8_E4M3 (segun model card) | no disponible | texto, imagen, video | no disponible | Modelo real |
| Otros `tiny-random/*` de Hugging Face | variable (tipicamente <1 B) | no disponible | segun base | habitualmente no disponible | Fixtures de pruebas |

La comparativa con alternativas de la misma categoria (modelos multimodales de ~55 M) no esta disponible: no se han identificado en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera salida coherente y no debe usarse en produccion ni en evaluaciones de calidad.
- No es un modelo destilado ni una version reducida entrenada del original: solo comparte topologia y descriptor de cuantizacion.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es posible; ademas, al derivar de `tencent/Hy4-FP8`, podrian aplicar restricciones del modelo base no reflejadas en este repo.
- El ejemplo de SGLang esta marcado como "unverified" por el propio autor; el soporte depende de una PR no fusionada en una wheel estable.
- La restriccion `K % 128 == 0` del block-FP8 en SM90 obliga a `hidden_size=128`, por lo que este checkpoint no puede reutilizar la anchura del hermano BF16 ni validar configuraciones de dimensiones intermedias.
- No hay informacion sobre sesgos, idiomas o riesgo de alucinacion porque no hay comportamiento aprendido que evaluar.
- El checkpoint fue generado automaticamente por DeepSeek-V4.1-Flash; posibles errores en el script de creacion no estan auditados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/hy4-fp8
- Modelo base: https://huggingface.co/tencent/Hy4-FP8
- Script de creacion: `.meta/create_model.py` (dentro del repo)
- Log de estructura: `.meta/model.log` (dentro del repo)
- Entorno de generacion: `.meta/env.json` (dentro del repo)
- PR de SGLang con soporte Hy4-VL block-FP8: https://github.com/sgl-project/sglang/pull/51672
- Commit de SGLang referenciado: https://github.com/sgl-project/sglang/commit/a0804a2f99719f5666ed2018e5d00a75645de6a8
