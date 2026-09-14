# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-FromFP8MTP-pr3118-validation

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado, sino un fixture estructural de pesos aleatorios derivado de `soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture`. Lo publica el usuario soyrsoyr con el objetivo declarado de validar la ruta de conversion a MXFP4 dentro del PR 3118 de llm-compressor, manteniendo un backbone en BF16 y un modulo MTP (multi-token prediction) cuantizado. Sus 88.040.064 parametros corresponden a dimensiones alineadas artificialmente para que el checkpoint sea cargable, no a un entrenamiento real.

Su relevancia es puramente de ingenieria: sirve como artefacto de validacion de formato, carga en vLLM y decodificacion especulativa MTP sobre hardware Blackwell (B200). El propio autor indica explicitamente que la validacion de runtime en B200 esta pendiente y que no se reclama ninguna pasada de inferencia MXFP4, por lo que no debe interpretarse como un modelo usable para generacion de texto.

La arquitectura declarada en los tags es `glm_moe_dsa`, con licencia `other` y pesos en safetensors con formato compressed-tensors. No hay datos de entrenamiento, idiomas, contexto ni evaluaciones de calidad asociados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE, segun tag de transformers); backbone BF16 + modulo MTP |
| Parametros totales | 88.040.064 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el comando de validacion usa `--max-model-len 1024`) |
| Tipos de cuantizacion | MXFP4 con cuantizacion dinamica de activaciones; origen: FP8 nativo por bloques (MTP) desquantizado y requantizado a FP4; backbone en BF16. En el fixture base: NVFP4A16 (FP4 weight-only con activaciones de 16 bits, no NVFP4 W4A4 calibrado) |
| Idiomas soportados | no disponible |
| Licencia | other (la licencia del modelo fuente sigue aplicando; esta validacion no anade concesion de licencia) |
| Formato de pesos | safetensors con compressed-tensors (llm-compressor) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Modelo base | soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture |

## Arquitectura y entrenamiento

El checkpoint se presenta como un fixture estructural de pesos aleatorios: no ha habido preentrenamiento, ajuste por instrucciones ni RLHF/DPO. La unica "derivacion" documentada es un proceso de conversion de formato, registrado en `pr3118-validation.json`: el checkpoint de entrada tenia un backbone BF16 retenido y un modulo MTP convertido a FP8 nativo por bloques (no es un release FP8 oficial); ese MTP en FP8 se desquanto y se volvio a cuantizar al formato FP4 solicitado. La implementacion usada es el commit `87347881` del PR 3118 de llm-compressor.

El interes tecnico esta en la separacion de formatos entre backbone y MTP, y en la validacion de la cadena MTP completa en vLLM con decodificacion especulativa (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`). El script `verify_mtp.py` lanza dos prompts y exige metricas positivas de tokens de borrador; el autor aclara que una carga correcta del modelo no cuenta como validacion MTP superada. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset ni innovaciones de atencion mas alla del tag de arquitectura.

## Capacidades

- No hay capacidades de generacion verificadas: los pesos son aleatorios, por lo que cualquier salida de texto carece de valor semantico.
- Carga y ejecucion en vLLM 0.29.1rc1.dev79+g767d1c4d4 con Transformers 5.17.0 y CUDA 13.0, segun la configuracion indicada por el autor.
- Decodificacion especulativa mediante MTP con un token de borrador, supeditada a validacion de runtime.
- Compatibilidad estructural con el ecosistema compressed-tensors / llm-compressor para formatos MXFP4.
- Ruta multimodal deshabilitada en el ejemplo de servicio (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Tool calling, function calling, razonamiento multi-paso, capacidades multilingues y modo thinking: no disponibles.

## Casos de uso

- Validacion de pipelines de cuantizacion: el checkpoint permite comprobar que una receta MXFP4 de llm-compressor produce tensores con las dimensiones y escalas esperadas antes de aplicarla a pesos reales.
- Pruebas de regresion de vLLM: sirve para verificar que una version concreta del motor (0.29.1rc1.dev79+g767d1c4d4) carga un checkpoint compressed-tensors con backbone BF16 y MTP FP4 sin errores de compatibilidad.
- Integracion continua de herramientas de compresion: al ser un artefacto de 0,2 GB, se puede descargar y procesar en cada job de CI sin coste relevante de almacenamiento ni de red.
- Verificacion de decodificacion especulativa MTP: `verify_mtp.py` mide tokens de borrador aceptados, lo que permite detectar regresiones en la ruta especulativa sin depender de la calidad del modelo.
- Pruebas de compatibilidad en hardware Blackwell: el autor marca el B200 como entorno objetivo de validacion de runtime para MXFP4, por lo que el fixture sirve para comprobar disponibilidad de kernels y memoria antes de mover pesos de produccion.
- Depuracion de errores de carga y de configuracion: los ficheros `config.json`, `recipe.yaml` y `pr3118-validation.json` permiten reproducir paso a paso la derivacion de formatos y localizar discrepancias de version.
- Comparacion de rutas NVFP4A16 frente a MXFP4: el fixture base usa NVFP4A16 (weight-only, activaciones de 16 bits) y este usa MXFP4 con cuantizacion dinamica de activaciones, lo que facilita contrastar ambas rutas sobre la misma estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que "no quality claims apply" y que la validacion de runtime en B200 esta pendiente, de modo que no existe ninguna medicion de MMLU, HumanEval, GSM8K ni de tareas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 176 MB (88 M de parametros); la ruta MXFP4 reduce la parte cuantizada a aproximadamente 44 MB mas escalas y metadatos. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: el autor fija el B200 (Blackwell) como plataforma de validacion de la ruta MXFP4; cualquier GPU CUDA con soporte para las versiones indicadas deberia poder cargar el checkpoint.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta con 2 GB o mas de VRAM, e incluso en iGPUs con aceleracion adecuada, dado el tamano del modelo.
- Opciones de despliegue: vLLM (version validada `0.29.1rc1.dev79+g767d1c4d4`), Transformers 5.17.0 con CUDA 13.0 y llm-compressor para la conversion. No hay confirmacion de soporte en llama.cpp, Ollama o TGI para este formato MXFP4 con modulo MTP separado.
- Latencia y throughput estimados: no disponibles. El unico dato operativo es la configuracion usada en la validacion (`--enforce-eager`, `--gpu-memory-utilization 0.85`, `--max-model-len 1024`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-FromFP8MTP-pr3118-validation) | 88.040.064 | no disponible | no evaluado (sin claims de calidad) | other | Hugging Face, 0 descargas, 0 likes |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face, referenciado como origen |
| Pesos oficiales de GLM-5.3 | no disponibles en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas funcionales de la misma categoria (fixtures de validacion de cuantizacion para arquitecturas MoE con MTP) ni de pesos oficiales con los que comparar parametros o resultados.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto util ni puede usarse en produccion, evaluacion o demostracion.
- El autor declara explicitamente que no aplica ninguna afirmacion de calidad y que la validacion de runtime en B200 esta pendiente.
- No se reclama ninguna pasada de inferencia MXFP4 completada; solo se han superado las comprobaciones de conversion y consistencia del checkpoint.
- La licencia es `other` y no anade ninguna concesion: la licencia del modelo fuente sigue aplicando y debe consultarse la model card de origen antes de cualquier uso, incluido el comercial.
- El fixture FP8 de entrada era a su vez un checkpoint de prueba derivado (BF16 + MTP en FP8), no un release oficial; la trazabilidad de formatos depende de `config.json`, `recipe.yaml` y `pr3118-validation.json`.
- La distincion entre formatos es relevante: NVFP4A16 es FP4 weight-only con activaciones de 16 bits, no NVFP4 W4A4 calibrado, y MXFP4 emplea cuantizacion dinamica de activaciones; confundirlos invalida cualquier comparacion de rendimiento.
- La configuracion validada desactiva vision y video (`image: 0`, `video: 0`) y usa `--enforce-eager`, por lo que no refleja un despliegue optimizado.
- No hay datos de idiomas, sesgos, contexto maximo real ni riesgo de alucinacion medible, dado que no existe entrenamiento.
- Los resultados de busqueda web recuperados no contienen informacion tecnica relevante sobre este modelo; no se ha podido contrastar ningun dato con fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-MXFP4-FromFP8MTP-pr3118-validation
- Modelo base (fixture de origen): https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Commit de implementacion en llm-compressor (PR 3118): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
