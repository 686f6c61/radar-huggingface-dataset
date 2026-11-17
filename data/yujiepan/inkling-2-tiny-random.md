# yujiepan/inkling-2-tiny-random

## Resumen

`yujiepan/inkling-2-tiny-random` es un modelo de prueba (test fixture) derivado de `thinkingmachines/Inkling-2-Small`, publicado por el usuario yujiepan. No es un modelo entrenado ni utilizable en producción: se trata de una inicialización aleatoria de una arquitectura reducida que replica la estructura del modelo original (atención híbrida SWA/global, mezcla de expertos con precisión mixta NVFP4/MXFP8, torre de visión y capas MTP) para validar pipelines de inferencia y depuración.

Su relevancia es puramente de ingeniería: permite verificar el soporte de la arquitectura Inkling 2 en SGLang (parsers de razonamiento y tool calling, backend de atención FA4, multimodal, decodificación especulativa MTP) sin necesidad de descargar los 393,48 GB del checkpoint completo. El repo ocupa 0,3 GB y contiene 103.651.852 parámetros reales según safetensors.

La model card indica explícitamente que el repositorio está generado por GPT-6.1-Sol y que el modelo es de inicialización aleatoria, por lo que sus salidas carecen de valor semántico. Cualquier evaluación de calidad debe hacerse sobre el modelo base, no sobre esta réplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE enrutada, atención híbrida (5 SWA + 1 global), torre de visión y capas MTP (multi-token prediction) |
| Parametros totales | 103.651.852 (según safetensors) |
| Parametros activos | 8 expertos enrutados por token de 96 disponibles (no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio usa `--context-length 2048` |
| Tipos de cuantizacion | Pesos de expertos en precisión mixta NVFP4 y MXFP8 (6 capas NVFP4 + 6 MXFP8); tensores BF16 y F32; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` 162,2 MB, `mtp.safetensors` 9,0 MB) |

## Arquitectura y entrenamiento

El modelo replica la topología de Inkling-2-Small a escala reducida: 12 capas de decoder con bloques de atención residual, ciclo de atención de 5 capas de ventana deslizante (SWA) más 1 global (dos ciclos completos), 96 expertos enrutados con 8 activos por token, vocabulario de 201.024 tokens sin embeddings atados, dimensión oculta de 128 y dimensión de experto de 128, 8 cabezas Q, 4 cabezas KV y dimensión de cabeza 128. La torre de visión tiene anchura 32 y 4 capas (frente a 1.024 y 23 en el original).

La precisión de los expertos preserva el esquema mixto del modelo fuente: 6 capas en NVFP4 y 6 en MXFP8, con tablas de tokens independientes. Incluye 5 capas MTP con block size 8 y rango de Markov 8 (frente a 256 en el original), con taps de características en las capas 5 y 12. Los tensores suman 63,01M elementos BF16, 5,90K F32, 30,08M F8_E4M3 y 15,04M U8.

No hay entrenamiento: los pesos son inicialización aleatoria. No se documentan datos de entrenamiento, RLHF, DPO ni proceso de alineamiento alguno.

## Capacidades

- Generación de texto y razonamiento: la arquitectura lo soporta, pero al ser pesos aleatorios las salidas no son coherentes.
- Procesamiento image-text-to-text: pipeline declarado `image-text-to-text`, con torre de visión integrada de 4 capas.
- Tool calling / function calling: el ejemplo de SGLang activa `--tool-call-parser inkling2`, lo que confirma soporte de parser en el runtime.
- Modo de razonamiento: el ejemplo activa `--reasoning-parser inkling`, indicando soporte de un modo de razonamiento en el stack de servicio.
- Decodificación especulativa: capas MTP presentes (`mtp.safetensors`), pensadas para multi-token prediction.
- Multimodal: soportado vía `--enable-multimodal` en SGLang.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Validación de integración con SGLang: servir el modelo con la build concreta indicada (`f726172d...`) para comprobar que la arquitectura Inkling 2 carga, compila CUDA graphs y responde antes de desplegar el modelo completo de 393,48 GB.
- Pruebas de CI de parsers: verificar el `reasoning-parser inkling` y el `tool-call-parser inkling2` con respuestas sintéticas sin coste de GPU sobre el checkpoint real.
- Depuración de precisión mixta NVFP4/MXFP8: el repo conserva el esquema de 6 capas NVFP4 + 6 MXFP8, útil para validar kernels de cuantización y rutas de dequant antes de pasar al modelo grande.
- Validación de decodificación especulativa MTP: las 5 capas MTP con block size 8 permiten probar el flujo de multi-token prediction y medir overhead del runtime con un checkpoint de 0,3 GB.
- Pruebas de pipeline multimodal: con la torre de visión reducida (anchura 32, 4 capas) se puede ejercitar la ruta image-text-to-text de extremo a extremo en una sola GPU consumer.
- Verificación de topologías de paralelismo: el ejemplo usa `--tp 2 --ep 2`, de modo que sirve para comprobar el arranque con tensor parallelism y expert parallelism 2 sin reservar memoria para 384 expertos por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de inicialización aleatoria, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada: el repo pesa 0,3 GB y los safetensors suman unos 171,22 MB; la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: no se especifican; el ejemplo de servicio usa `--tp 2 --ep 2`, es decir, 2 GPUs, pero el tamaño real del checkpoint no lo exige.
- GPU consumer: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y similares.
- Despliegue: SGLang con soporte de Inkling 2 (build `f726172d760dea737c7f1e797c9f32efe14d1685`), backend de atención FA4, `--mem-fraction-static 0.2`, CUDA graphs para decode bs=16 y prefill bs=128/2048. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| yujiepan/inkling-2-tiny-random | 103,65M | no disponible (ejemplo con 2048) | no disponible | Test fixture de la arquitectura Inkling 2 |
| thinkingmachines/Inkling-2-Small | no disponible (checkpoint de 393,48 GB) | no disponible | no disponible | Modelo base real |
| Otros tiny-random de Hugging Face | variable | variable | variable | Pruebas de carga y CI |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Pesos de inicialización aleatoria: el modelo no produce texto, código ni respuestas con sentido; no debe usarse para evaluación de calidad ni en producción.
- Sesgos: no evaluables, al no haber entrenamiento.
- Alucinación: irrelevante en la práctica porque toda salida es ruido estadístico.
- Idiomas: no se declaran idiomas soportados.
- Licencia: no disponible; la licencia del modelo base (`thinkingmachines/Inkling-2-Small`) tampoco se detalla en la información proporcionada, por lo que el uso comercial queda sin determinar.
- Dependencia de runtime: requiere una build concreta de SGLang con soporte de Inkling 2 y backend FA4; no funciona con stacks genéricos.
- Repo generado automáticamente: la model card indica que el repositorio lo generó GPT-6.1-Sol, lo que conviene tener en cuenta al auditar los ficheros.
- No sustituye al modelo base para pruebas de rendimiento reales: las métricas de latencia y memoria obtenidas aquí no son extrapolables al checkpoint completo.

## Enlaces

- Hugging Face: https://huggingface.co/yujiepan/inkling-2-tiny-random
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- SGLang (build referenciada): https://github.com/sgl-project/sglang/tree/f726172d760dea737c7f1e797c9f32efe14d1685
- Script de creación: `.meta/create_model.py` (dentro del repo)
- Log de estructura: `.meta/model.log` (dentro del repo)
- Entorno: `.meta/env.json` (dentro del repo)
