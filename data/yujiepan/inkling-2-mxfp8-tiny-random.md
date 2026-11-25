# yujiepan/inkling-2-mxfp8-tiny-random

## Resumen

`yujiepan/inkling-2-mxfp8-tiny-random` es un checkpoint de juguete generado aleatoriamente a partir de `thinkingmachines/Inkling-2-Small-MXFP8`, publicado por el usuario yujiepan. No es un modelo entrenado ni utilizable para tareas reales: su proposito es servir como fixture para probar y depurar la implementacion de la arquitectura Inkling 2 en SGLang, en concreto el soporte de pesos MXFP8, atencion hibrida con ventana deslizante y capas de prediccion multi-token (MTP). El repositorio se genero con un script (`.meta/create_model.py`) y el propio autor indica que el contenido fue producido por "GPT-6.1-Sol".

El modelo conserva la topologia del Inkling-2-Small original pero con dimensiones reducidas: 12 capas de decoder frente a 48, anchura oculta de 128 frente a 4.608, y 48 expertos enrutados frente a 384. Aun asi mantiene invariantes estructurales clave del modelo grande, como el ciclo de atencion de 5 capas SWA mas 1 global, 8 expertos activos por token, el formato de bloque MXFP8 [32, 32] con escalas UE8M0, un vocabulario de 201.024 tokens sin embeddings atados y 5 capas MTP con block size 8.

Su relevancia es puramente de ingenieria: permite validar en hardware modesto rutas de codigo que de otro modo requeririan cientos de GB de VRAM (el checkpoint original ocupa 622,80 GB en 49 ficheros). Con 87,65 millones de parametros y 155,14 MB en dos safetensors, se puede cargar en una sola GPU para verificar el pipeline de serving, el parser de razonamiento y el parser de tool calls antes de escalar al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE, atencion hibrida (5 SWA + 1 global) y capas MTP |
| Parametros totales | 87.651.136 |
| Parametros activos | no disponible (el modelo declara 8 expertos enrutados de 48 por token, pero no se publica el computo activo) |
| Longitud de contexto | no disponible en el modelo; el ejemplo de serving usa `--context-length 2048` |
| Tipos de cuantizacion | MXFP8 (F8_E4M3 con bloques [32, 32] y escalas UE8M0) en las 12 capas de expertos; resto en BF16 y F32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` 146,2 MB, `mtp.safetensors` 9,0 MB) |
| Capas de decoder | 12 (modelo base: 48) |
| Expertos enrutados / por token | 48 / 8 (modelo base: 384 / 8) |
| Anchura oculta / de experto | 128 / 128 (modelo base: 4.608 / 2.304) |
| Cabezas Q / KV / dimension de cabeza | 8 / 4 / 128 (modelo base: 48 / 8 / 128) |
| Vocabulario / embeddings atados | 201.024 / false |
| Vision encoder | anchura 32, 4 capas (modelo base: 1.024, 23 capas) |
| Capas MTP / block size / rango Markov | 5 / 8 / 8 (modelo base: 5 / 8 / 256) |
| Libreria declarada | sglang |

## Arquitectura y entrenamiento

El checkpoint reproduce la arquitectura Inkling 2 en miniatura: un transformer decoder-only con mezcla de expertos, atencion con patron ciclico de cinco capas de ventana deslizante seguidas de una capa de atencion global, y un modulo de prediccion multi-token (MTP) con 5 capas, block size 8 y rango de Markov reducido a 8. Los pesos de los expertos se almacenan en MXFP8 con bloques de forma [32, 32] y escalas en UE8M0, mientras que el resto de tensores van en BF16 o F32. El vocabulario es de 201.024 entradas y los embeddings no estan atados a la cabeza de salida.

No ha habido entrenamiento: todos los tensores se inicializan de forma aleatoria, tal como indica el autor. El desglose de elementos por tipo en el repo (62,94 M en BF16, 4,16 K en F32, 28,31 M en F8_E4M3 y 884,74 K en U8) frente al original (8,69 B BF16, 587,07 B F8_E4M3, 18,35 B U8) confirma que se trata de una copia estructural, no de un destilado ni de una cuantizacion funcional. Las "innovaciones" tecnicas que se pueden probar con el son las del modelo base: decodificacion especulativa via MTP, atencion hibrida y precision MXFP8 por bloques.

## Capacidades

- Generacion de texto: teoricamente soportada por la topologia, pero sin valor funcional al tener pesos aleatorios.
- Razonamiento y modo thinking: el ejemplo de serving incluye `--reasoning-parser inkling`, lo que indica que el formato de razonamiento del modelo base esta contemplado.
- Tool calling / function calling: el ejemplo usa `--tool-call-parser inkling2`, por lo que el pipeline de herramientas es testeable.
- Entrada imagen-texto: pipeline `image-text-to-text` con vision encoder de 4 capas y anchura 32; acepta partes `image_url` con URL `data:` en la API compatible con OpenAI.
- Decodificacion especulativa: 5 capas MTP con block size 8 y taps de caracteristicas en las capas 5 y 12.
- Multilingue: no disponible; no se documentan idiomas.
- Capacidades de agente multi-paso: no verificables con pesos aleatorios, aunque el stack de serving las contempla.

## Casos de uso

- Pruebas de integracion de SGLang: validar la PR #51926 que anade soporte para Inkling 2 sin necesidad de descargar los 622,80 GB del checkpoint original. El modelo cabe en una GPU consumer y arranca en segundos.
- Desarrollo del parser de razonamiento: comprobar que `--reasoning-parser inkling` separa correctamente los bloques de pensamiento del texto final en el endpoint `/v1/chat/completions`.
- Desarrollo del parser de tool calls: verificar el formato de llamadas a funciones con `--tool-call-parser inkling2` antes de desplegar el modelo grande en produccion.
- Validacion de la ruta multimodal: probar la carga del vision encoder, el preprocesado de imagenes y el envio de partes `image_url` con data URLs sin consumir recursos del modelo real.
- Pruebas de cuantizacion MXFP8: comprobar la carga de tensores F8_E4M3 con bloques [32, 32] y escalas UE8M0, y detectar regresiones en kernels de dequantizacion.
- CI/CD de infraestructura de inferencia: usar el checkpoint como fixture en tests automatizados de despliegue, healthchecks y configuracion de tensor/pipeline parallelism (`--tp 2 --ep 2`).
- Depuracion de MTP y decodificacion especulativa: ejercitar las 5 capas MTP y el block size 8 en un entorno controlado antes de medir aceptacion de tokens en el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria carente de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (155,14 MB en safetensors); el consumo real dependera de la cache KV y del contexto configurado.
- GPU recomendadas: cualquier GPU con soporte de BF16 y FP8. El ejemplo del autor usa `--tp 2 --ep 2`, es decir, dos GPUs, aunque por tamano cabria en una sola.
- GPU consumer: si, cabe holgadamente en cualquier RTX con 8 GB o mas; incluso en GPUs de gama baja.
- Opciones de despliegue: SGLang es la unica via verificada, y requiere instalar desde la PR #51926 (`git+https://github.com/sgl-project/sglang.git@refs/pull/51926/head#subdirectory=python`), no desde un wheel publicado. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Configuracion de serving probada: `--dtype bfloat16 --attention-backend fa4 --enable-multimodal --context-length 2048 --mem-fraction-static 0.2 --watchdog-timeout 1800`, con CUDA graphs deshabilitados en decode y prefill.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| yujiepan/inkling-2-mxfp8-tiny-random | 87,65 M | no disponible (ejemplo con 2048) | safetensors MXFP8/BF16 | no disponible | Fixture de pruebas |
| thinkingmachines/Inkling-2-Small-MXFP8 | no disponible (checkpoint de 622,80 GB) | no disponible | safetensors MXFP8 | no disponible | Modelo real |
| Otros tiny-random de Hugging Face | variable | variable | safetensors | variable | Fixtures de pruebas |

La comparacion con alternativas de la misma categoria (modelos de 87 M entrenados) no es pertinente porque este checkpoint no ha sido entrenado. Su unico comparable directo es el modelo base del que deriva.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce salidas coherentes y no debe usarse para inferencia real, evaluacion de calidad ni demostraciones.
- No es una cuantizacion funcional del modelo base: la reduccion de dimensiones (12 capas frente a 48, anchura 128 frente a 4.608) impide transferir pesos o resultados al Inkling-2-Small.
- Licencia no disponible: no se puede asumir uso comercial; ademas, la licencia del modelo base condiciona cualquier redistribucion.
- Dependencia de una PR no fusionada de SGLang: la instalacion requiere compilar desde `refs/pull/51926/head`, lo que implica riesgo de ruptura y ausencia de soporte estable.
- Idiomas no documentados: no hay garantia de cobertura linguistica, aunque con pesos aleatorios es irrelevante.
- Sesgos y alucinacion: no evaluables; cualquier salida es ruido estadistico.
- El autor indica que el repositorio fue generado por "GPT-6.1-Sol"; conviene revisar el script `.meta/create_model.py` antes de confiar en la estructura.
- Zero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yujiepan/inkling-2-mxfp8-tiny-random
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- PR de SGLang con soporte Inkling 2: https://github.com/sgl-project/sglang/pull/51926
- Script de generacion: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
