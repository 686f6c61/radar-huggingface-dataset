# tiny-random/longcat-flash-lite-sparse

## Resumen

`tiny-random/longcat-flash-lite-sparse` es un checkpoint de juguete (11.727.904 parametros totales en safetensors) generado de forma aleatoria a partir de la arquitectura del modelo `meituan-longcat/LongCat-Flash-Lite-Sparse` de Meituan. No es un modelo funcional: su proposito es servir como fixture de pruebas para validar cargadores, esquemas de pesos y rutas de servicio del modelo original, no para inferencia real. El autor de la ficha en HuggingFace es la organizacion `tiny-random`, sin descargas ni likes en el momento de la consulta.

El modelo reproduce la topologia del LongCat Flash Lite Sparse a escala minima: atencion con mecanismo LSA (LongCat Sparse Attention) y RoPE tipo deepseek-yarn, MLA comprimido, mezcla de expertos con expertos identidad sin pesos, capas de borrador MTP/NextN y tablas de over-embedding basadas en n-gramas. La relevancia actual es de ingenieria: el repositorio original de Meituan no incluye codigo de modelo ni implementacion en Transformers (su `config.json` carece de `model_type` y `auto_map`), por lo que este checkpoint permite probar el parser `longcat_flash` y el indexador DSA de SGLang sin descargar los 138,29 GB del checkpoint completo.

La ficha describe, por tanto, un artefacto de depuracion: sus dimensiones (anchura oculta de 8, MLP densa de 64, MLP de experto de 32, 4 capas logicas) no permiten generar texto coherente. Toda la informacion tecnica procede de la model card y de los metadatos de HuggingFace; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con LSA (LongCat Sparse Attention), MLA comprimido, MoE con expertos identidad y capas MTP/NextN; esquema compatible con el cargador `LongcatCausalLM` de SGLang |
| Parametros totales | 11.727.904 (11,72 M) |
| Parametros activos | no disponible (el checkpoint declara 32 expertos enrutados y 128 expertos identidad sin pesos con top-k 12, pero no se publica el computo de parametros activos) |
| Longitud de contexto | 1.000.000 de tokens (heredada de la configuracion del modelo base: LSA + deepseek-yarn) |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16; routers y bias de correccion en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (un unico `model.safetensors`, 23,53 MB) |

## Arquitectura y entrenamiento

El checkpoint replica la arquitectura LongCat Flash Lite Sparse a escala reducida. Mantiene cuatro capas logicas (ocho subcapas de atencion) con topologia shortcut-MoE: 32 expertos enrutados y 128 expertos identidad sin pesos, con top-k 12. La atencion usa MLA comprimido con 8 cabezas Q, dimensiones de cabeza 64/64 para nope/rope y 128 para el value head, y rangos q-lora de 32 y kv-lora de 256 (el modelo fuente usa 512; aqui se baja al minimo del kernel FA3 comprimido en Hopper). Los indexadores LSA conservan 16 cabezas y dimension de cabeza 128 en cada capa fisica de atencion par (factor CLI 2), y se serializa una capa de borrador MTP/NextN con su propio indexador bajo `model.mtp.*`.

Las tablas de over-embedding usan los nombres anidados nativos del cargador (`model.ngram_embeddings.{embedders,post_projs}.*`) con dos tablas de aproximadamente 524.000 filas cada una, en lugar de las 12 tablas de 10,22 millones de filas del modelo fuente. El vocabulario se mantiene en 131.072 filas sin tying. Los tensores se generaron directamente contra el esquema de state-dict y el remapeo de claves del cargador `longcat_flash.py` de SGLang, mas el `Indexer` DSA. No hay entrenamiento: los pesos son aleatorios, y no existe ruta de ejecucion en Transformers (el repositorio no incluye `model_type` ni `auto_map`). La model card indica que el repositorio fue generado por "GPT-6.1-Sol".

## Capacidades

- Generacion de texto: no funcional. Los pesos son aleatorios y el modelo no ha sido entrenado; cualquier salida es ruido estadistico.
- Razonamiento, codigo y matematicas: no disponible (sin entrenamiento).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: el checkpoint conserva la maquinaria de decodificacion especulativa MTP/NextN y los indexadores LSA, pero como estructura, no como capacidad funcional.
- Servicio de texto: verificado en SGLang (version 0.5.23.dev384 o superior, que incluye LongCat LSA); el endpoint `/v1/chat/completions` responde, aunque con contenido sin sentido.

## Casos de uso

- Pruebas de integracion del cargador de SGLang: validar que la version de SGLang en produccion reconoce la arquitectura `LongcatCausalLM`, el parser `longcat_flash` y el indexador DSA antes de desplegar el modelo real de 69,11 B de parametros.
- Desarrollo de kernels y backends de atencion: ejercitar la ruta LSA y el backend `fa3` con un checkpoint de 23,53 MB en lugar de 138,29 GB, reduciendo el ciclo de iteracion en CI.
- Validacion de esquemas de pesos: comprobar el remapeo de claves del state-dict, incluidos los nombres anidados de over-embedding y las claves aplanadas `oe_embed_tokens*.weight` que aceptan versiones recientes de SGLang.
- Pruebas de decodificacion especulativa: verificar la serializacion y carga de la capa MTP/NextN bajo `model.mtp.*` sin necesidad de GPU de gran memoria.
- Test de configuracion de servido: ensayar parametros de `sglang.launch_server` (`--tp-size`, `--mem-fraction-static`, `--chunked-prefill-size`, `--kv-cache-dtype`) con un footprint minimo antes de aplicarlos al modelo completo.
- Depuracion de pipelines de tokenizacion: el vocabulario de 131.072 filas y los ids de token se mantienen identicos al modelo fuente, lo que permite probar el flujo de tokenizacion sin cargar los pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint aleatorio sin entrenamiento, por lo que cualquier evaluacion de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en BF16 (23,53 MB de safetensors); el consumo real lo domina la cache KV y el runtime de SGLang.
- GPU recomendadas: cualquier GPU con soporte de SGLang; la model card cita `--tp-size 4` y el backend `fa3`, lo que apunta a GPUs Hopper (H100/H200) para reproducir exactamente la configuracion verificada, aunque el tamano del checkpoint permite ejecutarlo en GPUs mucho menores.
- Cabe en GPU de consumo: si, el checkpoint en si ocupa decenas de MB; la viabilidad depende de que la version de SGLang y el backend seleccionado soporten la GPU concreta.
- Opciones de despliegue: SGLang (unica ruta verificada, version 0.5.23.dev384 o superior). No hay implementacion en Transformers, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiny-random/longcat-flash-lite-sparse` (este) | 11,72 M | 1.000.000 (heredado) | Fixture de pruebas para SGLang | no disponible | HuggingFace, 0 descargas |
| `tiny-random/longcat-flash-lite` | no disponible | no disponible | Fixture de pruebas del mismo linaje, con modulo n-gram menor | no disponible | HuggingFace |
| `meituan-longcat/LongCat-Flash-Lite-Sparse` | 69,11 B BF16 (checkpoint de 138,29 GB) | 1.000.000 | Modelo real de produccion | no disponible | HuggingFace, servido con SGLang |

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce texto coherente y no debe usarse en produccion ni en evaluaciones de calidad.
- Sin licencia declarada: no hay terminos de uso comercial ni de redistribucion; tratar como no apto para uso comercial hasta que el autor la especifique.
- Sin implementacion en Transformers: `config.json` no incluye `model_type` ni `auto_map`; la unica ruta de ejecucion conocida es SGLang con `--trust-remote-code`.
- Dependencia de version: requiere SGLang 0.5.23.dev384 o superior (PR #32918 para la adaptacion LongCat Sparse); versiones anteriores no cargan el checkpoint.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Riesgo de confusion con el modelo base: el nombre puede llevar a desplegarlo por error en lugar del LongCat Flash Lite Sparse real; conviene etiquetarlo como artefacto de test en cualquier registro interno.
- Escala no representativa: la anchura oculta de 8 y las MLP de 64/32 no reproducen el comportamiento numerico del modelo fuente; los tests de rendimiento o de calidad obtenidos aqui no son extrapolables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiny-random/longcat-flash-lite-sparse
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse
- Checkpoint tiny hermano: https://huggingface.co/tiny-random/longcat-flash-lite
- Script de creacion: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
- Cargador de SGLang: `sgl-project/sglang`, fichero `longcat_flash.py`
- Pull request de la adaptacion LongCat Sparse en SGLang: PR #32918
