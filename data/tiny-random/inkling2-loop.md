# tiny-random/inkling2-loop

## Resumen

`tiny-random/inkling2-loop` es un checkpoint diminuto de inicialización aleatoria derivado de `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `tiny-random`. No es un modelo entrenado ni utilizable para tareas reales: su proposito es servir como fixture de pruebas y depuracion para la implementacion del modelo Inkling 2 en SGLang, concretamente para validar la variante "looped" (con bloque de atencion residual reutilizado en multiples pasadas por token). Con 94.976.276 parametros totales y un repo de 0,2 GB, reproduce la geometria del modelo original a escala reducida.

La relevancia de esta ficha es acotada: no hay ningun caso de uso productivo. Su valor esta en que permite a desarrolladores de infraestructura verificar la carga de pesos mixtos NVFP4/MXFP8, la atencion hibrida (5 capas SWA + 1 global), el modulo MTP (multi-token prediction) y el pipeline `image-text-to-text` sin necesidad de descargar el checkpoint completo de 20,16 GB del modelo fuente.

El modelo se sirve exclusivamente mediante una version no publicada de SGLang (PR #51926), con backend de atencion `fa4` y parsers de razonamiento y tool calling especificos de Inkling. La model card indica explicitamente que ha sido generado por GPT-6.1-Sol y que su unico proposito es testing y debugging.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con bloque de atencion residual "looped" (multiples pasadas por token) y MoE enrutado |
| Parametros totales | 94.976.276 |
| Parametros activos | no disponible (96 expertos enrutados, 8 por token; no se especifica el computo activo exacto) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--context-length 2048` |
| Tipos de cuantizacion | Pesos mixtos: expertos en NVFP4 y MXFP8 (10 capas NVFP4 + 2 MXFP8); tensores BF16, F32, F8_E4M3 y U8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` 153,8 MB; `mtp.safetensors` 6,7 MB) |
| Libreria | sglang |
| Pipeline | image-text-to-text |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo replica la topologia de Inkling-2-Mini a escala tiny. Consta de 12 capas de decoder con un bloque de atencion residual compartido que se recorre en 3 pasadas por token sobre un rango de loop core de 6 a 11, lo que da 24 visitas de capa totales (frente a 24 capas y 48 visitas en el modelo fuente). El ciclo de atencion alterna 5 capas de sliding window attention con 1 capa de atencion global, y el checkpoint tiny contiene dos ciclos completos de ese patron.

La capa MoE tiene 96 expertos enrutados con 8 activos por token, distribuidos en dos regiones de precision (10 capas NVFP4 y 4 MXFP8 en el original; 10 NVFP4 + 2 MXFP8 en el tiny). La anchura oculta es de 128 (frente a 2.304 en el original) y la anchura de experto tambien 128 (frente a 1.152). La atencion usa 8 cabezas Q, 4 cabezas KV y dimension de cabeza 128. El vocabulario es de 201.024 tokens con embeddings no atados. Incluye un modulo de vision de 4 capas y anchura 32, y un modulo MTP de 3 capas con block size 8 y Markov rank 8.

No hay entrenamiento: los pesos son de inicializacion aleatoria. La model card no documenta dataset, tokens de entrenamiento ni fases de RLHF/DPO. La innovacion tecnica que se valida es la estructura "looped" con MTP y expertos en precision mixta NVFP4/MXFP8, soportada por una implementacion especifica en SGLang.

## Capacidades

- Generacion de texto y conversacion multi-turno a nivel de interfaz (el checkpoint no produce salidas coherentes por estar sin entrenar).
- Procesamiento de imagen y texto (`image-text-to-text`): acepta partes `image_url` con URLs `data:` en el endpoint compatible con OpenAI.
- Soporte de tool calling mediante el parser `inkling2` en SGLang.
- Soporte de razonamiento con parser `inkling` (`--reasoning-parser inkling`).
- Multi-token prediction (MTP) con 3 capas y block size 8, util para decodificacion especulativa.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: solo vision, segun el pipeline declarado.

## Casos de uso

- Pruebas de integracion de SGLang: validar la carga de un checkpoint con expertos en precision mixta NVFP4/MXFP8 y tensores en cuatro dtypes distintos antes de pasar al modelo completo.
- Depuracion de la atencion hibrida: comprobar que el ciclo 5 SWA + 1 global se ejecuta correctamente sobre dos ciclos completos con el bloque residual looped.
- Verificacion del modulo MTP: ejercitar las 3 capas MTP con block size 8 y los feature taps (5, 11, 23, 24) en un entorno de CI sin GPU de gran memoria.
- Test del pipeline multimodal: enviar peticiones `image-text-to-text` con imagenes base64 al endpoint OpenAI-compatible y comprobar el enrutado de partes de contenido.
- Validacion de parsers: probar `--reasoning-parser inkling` y `--tool-call-parser inkling2` con respuestas sinteticas para asegurar el parseo de bloques de razonamiento y llamadas a herramientas.
- Pruebas de despliegue multi-GPU: usar `--tp 2 --ep 2` con `--mem-fraction-static 0.2` para validar el reparto de expertos y la configuracion de CUDA graphs deshabilitados en decode y prefill.
- Benchmarking de infraestructura: medir latencia de arranque y overhead del servidor SGLang con un modelo de 0,2 GB antes de escalar al checkpoint de 20,16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint de inicializacion aleatoria sin entrenamiento, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 94,98 M de parametros; el repo completo ocupa 0,2 GB en disco.
- El ejemplo de la model card usa `--tp 2 --ep 2`, es decir, 2 GPUs con paralelismo tensorial y de expertos, y `--mem-fraction-static 0.2`.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque el ejemplo oficial asume un entorno multi-GPU.
- Backend de atencion requerido: `fa4` (FlashAttention 4) segun el comando de ejemplo.
- Despliegue: exclusivamente SGLang desde la PR #51926 (`git+https://github.com/sgl-project/sglang.git@refs/pull/51926/head#subdirectory=python`), no hay wheel publicada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- CUDA graphs deshabilitados en decode y prefill en la configuracion de ejemplo; `--watchdog-timeout 1800`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| tiny-random/inkling2-loop | 94,98 M | no disponible | no disponible | Hugging Face, requiere SGLang PR #51926 | Fixture de test |
| thinkingmachines/Inkling-2-Mini | no disponible (checkpoint de 20,16 GB) | no disponible | no disponible | Hugging Face | Modelo base real |
| Otros repos `tiny-random/*` | variable | no disponible | no disponible | Hugging Face | Fixtures de test |

La comparativa con modelos de produccion de tamano similar no es significativa: este checkpoint no compite en calidad ni rendimiento, solo en geometria estructural con su modelo base.

## Limitaciones y advertencias

- Pesos de inicializacion aleatoria: las salidas no son coherentes y el modelo no debe usarse para inferencia real, evaluacion de calidad ni produccion.
- No hay informacion sobre licencia; no se puede asumir uso comercial permitido.
- No se documentan idiomas soportados ni sesgos, al no haber entrenamiento.
- Dependencia de una PR no fusionada de SGLang: la API y el comportamiento pueden cambiar sin aviso.
- El comando de ejemplo requiere `--attention-backend fa4`, lo que limita el hardware compatible.
- El contexto maximo no esta declarado; el ejemplo usa 2048 tokens, muy por debajo de lo habitual en modelos de produccion.
- La model card indica que el repo ha sido generado por GPT-6.1-Sol; conviene tratar la documentacion como material de referencia y no como especificacion contractual.
- No apto para benchmarks de calidad: cualquier metrica obtenida seria ruido estadistico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiny-random/inkling2-loop
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de SGLang con soporte looped Inkling 2: https://github.com/sgl-project/sglang/pull/51926
- Script de creacion del repo: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
