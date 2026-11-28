# yujiepan/ernie-5.5-flash-preview-tiny-random

## Resumen

`yujiepan/ernie-5.5-flash-preview-tiny-random` es un checkpoint de inicialización aleatoria de tamano reducido construido a partir de la arquitectura del modelo `baidu/ERNIE-5.5-Flash-Preview`. No es un modelo entrenado ni funcional para tareas reales: su proposito es servir como banco de pruebas para validar infraestructura de inferencia (concretamente SGLang) y para depurar la carga de pesos, la tokenización y el pipeline de generación de texto antes de desplegar el modelo completo.

El repositorio reproduce fielmente la estructura del modelo original (capas de decodificador, ciclos de atención HCA y MLA, expertos enrutados de tipo MoE, cabezas de indexer, borradores DSpark para decodificación especulativa, etc.) pero con dimensiones internas drásticamente reducidas: 105.510.366 parámetros totales frente a los cientos de miles de millones del modelo base. El checkpoint ocupa 153,78 MB en un único fichero `model.safetensors`.

Su relevancia es puramente practica para ingenieros de plataformas de inferencia: permite verificar que una build concreta de SGLang (en este caso la del PR #51236) resuelve correctamente el grafo CUDA de decodificación, gestiona la atención con KV comprimida y ejecuta los expertos enrutados en precisión MXFP4 sobre GPUs Hopper mediante el backend Marlin, sin necesidad de aprovisionar el hardware masivo que exige el modelo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE con atención híbrida (ciclos HCA + MLA), indexer y borrador DSpark |
| Parametros totales | 105.510.366 |
| Parametros activos | no disponible (el modelo base es MoE con 10 expertos enrutados por token; el recuento activo del tiny no se publica) |
| Longitud de contexto | no disponible en el modelo; el ejemplo de servicio usa `--context-length 2048` |
| Tipos de cuantizacion | Pesos en BF16, F32, F8_E4M3 (block-FP8 128x128), F8_E8M0 e I8; expertos enrutados en MXFP4 (e2m1 con escala UE8M0 por bloque de 32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fichero unico `model.safetensors`, 153,78 MB) |

## Arquitectura y entrenamiento

El modelo replica la topologia de ERNIE-5.5-Flash-Preview: 15 capas de decodificador organizadas en dos ciclos de atención que alternan HCA (64 cabezas en el original, 4 en esta version tiny, con dimension de cabeza 512) y MLA (4 cabezas, qk_nope 192, rope 64, v 256, latente KV-LoRA 512). Incorpora un indexer con 64 cabezas, dimension 128 y top-k 2048, y una capa MoE con 16 expertos enrutados (frente a 512 en el original), 10 expertos por token y 1 experto compartido. La dimension oculta se reduce a 128 y la intermedia densa a 256, con anchura de experto y latente de 128/256. Mantiene el vocabulario de 201.216 tokens sin embeddings atados, 4 streams mHC con 20 iteraciones de Sinkhorn y un borrador DSpark de 3 capas, tamano de bloque 7 y rango de Markov 8.

No ha habido entrenamiento: los pesos son inicializaciones aleatorias generadas con el script `.meta/create_model.py`. La innovacion relevante no esta en el aprendizaje sino en la fidelidad estructural para pruebas: conserva las precisiones mixtas del checkpoint original (lineales en block-FP8 e4m3 con bloques 128x128, expertos enrutados en MXFP4 e2m1 con escala UE8M0 por 32 elementos) y la decodificación especulativa DSpark, lo que permite validar rutas de codigo que dependen de estas caracteristicas.

## Capacidades

- Generación de texto: tecnicamente operable (produce tokens), pero sin valor semantico por pesos aleatorios.
- Validación de pipeline de chat: el tokenizer Python compone prompts con mensajes de sistema e historial multi-turno, y el endpoint compatible con OpenAI acepta listas `messages`.
- Prueba de atención con KV comprimida: ejercita la ruta de atención HCA/MLA del modelo real.
- Prueba de decodificación especulativa: incluye el borrador DSpark (3 capas, bloque 7) para validar esa ruta.
- Prueba de ejecución MoE: 16 expertos enrutados con 10 activos por token, en MXFP4, sobre backend Marlin en Hopper.
- Prueba de cuantización mixta: lineales en block-FP8 e4m3 e I8, util para verificar kernels y conversiones.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües reales: al no estar entrenado, ninguna de estas funciones produce resultados utiles.

## Casos de uso

- Validación de builds de SGLang: instalar la revisión del PR #51236 y arrancar `sglang serve` con `--tp 2 --ep 2 --moe-runner-backend marlin` para comprobar que el grafo CUDA de decodificación se resuelve correctamente antes de desplegar el modelo completo.
- Pruebas de integración continua en pipelines de inferencia: ejecutar el tiny en cada commit de SGLang o de un fork para detectar regresiones en carga de safetensors, tokenizer o endpoint OpenAI sin consumir GPUs de gran memoria.
- Depuración de atención con KV comprimida: verificar que la ruta HCA/MLA y el indexer (top-k 2048) funcionan con la configuracion de `--context-length 2048` y `--mem-fraction-static 0.3`.
- Validación de kernels MXFP4 en Hopper: comprobar que los expertos enrutados se ejecutan con el backend Marlin y que las conversiones de escala UE8M0 son correctas.
- Pruebas de tokenizer y formato de chat: enviar mensajes multi-turno con roles system/user/assistant al endpoint `/v1/chat/completions` y verificar la composición del prompt y el manejo de `ignore_eos`.
- Benchmark de latencia de infraestructura: medir tiempos de arranque, carga del checkpoint y throughput de decodificación del stack SGLang con un modelo de 105 M de parámetros, aislando el coste del software del coste del modelo.
- Formación y demos de arquitectura: usar la estructura tiny como material didactico para explicar atención híbrida, MoE y decodificación especulativa sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 153,78 MB; con overhead de activaciones y grafo CUDA, cabe holgadamente en cualquier GPU con 8 GB o mas.
- GPU recomendadas: el ejemplo verificado usa `--tp 2 --ep 2` con backend Marlin, pensado para GPUs Hopper (H100/H200). Tambien deberia funcionar en A100 y en GPUs consumer modernas (RTX 4090, RTX 3090) si la build de SGLang soporta la ruta MXFP4 correspondiente.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: SGLang (unica ruta verificada, revision del PR #51236 con `SGLANG_BUILD_RUST_EXTS=none`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato y las precisiones mixtas (block-FP8, MXFP4) complican su uso fuera de SGLang.
- Latencia y throughput: no disponibles. El modelo es demasiado pequeno para que sus cifras sean representativas de ERNIE-5.5-Flash-Preview.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/ernie-5.5-flash-preview-tiny-random | 105,5 M | no disponible (ejemplo con 2048) | Pruebas de infraestructura SGLang | no disponible | Hugging Face |
| baidu/ERNIE-5.5-Flash-Preview | no disponible en la informacion (checkpoint de 165,90 GB, 129 ficheros) | no disponible | Generación de texto en produccion | no disponible | Hugging Face |
| Otros tiny-random de la comunidad | variable | variable | Pruebas de carga y CI | variable | Hugging Face |

La comparativa directa con alternativas de la misma categoria (modelos tiny de prueba) no esta disponible en la informacion proporcionada. La referencia natural es el modelo base, del que este repositorio solo conserva la estructura.

## Limitaciones y advertencias

- Pesos aleatorios: no ha sido entrenado; sus salidas son texto sin sentido y no deben usarse en produccion ni en evaluaciones de calidad.
- No apto para uso comercial ni para tareas reales: es un artefacto de prueba.
- Licencia no disponible: no se puede asumir permiso de uso, redistribucion ni uso comercial.
- Idiomas no disponibles: sin entrenamiento no hay soporte linguistico efectivo.
- Dependencia de una revision concreta de SGLang (PR #51236): otras versiones pueden fallar al cargar el checkpoint o al ejecutar la ruta MXFP4/Marlin.
- Restricciones de despliegue: requiere `--trust-remote-code` y el tokenizer Python del repositorio; no hay soporte documentado en otros motores de inferencia.
- El ejemplo de servicio fija `--context-length 2048`, por lo que no se ha validado el comportamiento con ventanas mayores.
- Generado por GPT-6.1-Sol segun la model card; conviene revisar los scripts de generacion (`.meta/create_model.py`) antes de confiar en la equivalencia estructural con el modelo base.
- Riesgo de confusion: el nombre puede llevar a pensar que es una version funcional de ERNIE-5.5-Flash-Preview; no lo es.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yujiepan/ernie-5.5-flash-preview-tiny-random
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Script de generacion: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
- PR de SGLang #51236: https://github.com/sgl-project/sglang/pull/51236 (referenciado en la model card)
- Repositorio SGLang: https://github.com/sgl-project/sglang
