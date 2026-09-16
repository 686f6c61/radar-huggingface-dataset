# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118

## Resumen

Este repositorio no es una publicacion de modelo independiente, sino un artefacto de validacion tecnica derivado de Qwen/Qwen3.8-27B (27.320.697.856 parametros). El autor, soyrsoyr, lo genera para comprobar el helper de guardado de MTP (multi-token prediction) introducido en el PR3118 de llm-compressor (commit 3dd54c307). En concreto, toma el backbone FP8_DYNAMIC ya cuantizado de un repositorio anterior y desquantiza la cabeza MTP con `mtp_scheme="BF16"`, verificando que los valores coinciden con la desquantizacion de referencia.

El resultado es la tercera etapa de una cadena de tres: una copia sin cuantizar, una version FP8 con roundtrip completo y esta version BF16 obtenida a partir de la FP8. El repositorio ocupa 35,9 GB e incluye pesos en safetensors compatibles con transformers y con el formato compressed-tensors, bajo licencia apache-2.0.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para quien depure el soporte de MTP con decodificacion especulativa en vLLM, no como modelo listo para produccion. La propia model card advierte de que se trata de un smoke test de pipeline y serving, no de una evaluacion de calidad ni de rendimiento. A fecha de creacion acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3_5`; derivada de Qwen/Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone FP8_DYNAMIC reutilizado; MTP desquantizado a BF16; formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (se aplica la licencia original de Qwen) |
| Formato de pesos | safetensors (+ metadatos compressed-tensors) |
| Tamano del repositorio | 35,9 GB |
| Libreria | transformers |
| Pipeline declarado | text-generation |
| Etiquetas adicionales | image-text-to-text, conversational, endpoints_compatible |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la informacion proporcionada. La etiqueta `qwen3_5` sugiere una generacion Qwen3.5, y la presencia de MTP (multi-token prediction) indica que el modelo incorpora cabezas de prediccion de multiples tokens empleadas para decodificacion especulativa, es decir, un mecanismo de borrador que propone varios tokens por paso y un modelo verificador que los acepta o rechaza.

El proceso aplicado en este repositorio es puramente de posentrenamiento y cuantizacion, no de entrenamiento. El backbone FP8_DYNAMIC se reutiliza sin modificar desde soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation; lo unico que se recalcula es la desquantizacion de la cabeza MTP a BF16. La model card indica explicitamente que esta ejecucion no repite el proceso oneshot de modelo completo ni la cuantizacion del backbone. Los valores obtenidos coinciden con la desquantizacion de referencia, si bien persiste la perdida por redondeo inherente a la cuantizacion FP8 previa. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Prediccion de multiples tokens (MTP) con decodificacion especulativa: validada con vLLM 0.28.0, TP=1 y un token especulativo por paso.
- Posible entrada multimodal de imagen y texto: la etiqueta `image-text-to-text` aparece en el repositorio, aunque la model card no describe ni confirma esta capacidad.
- Compatibilidad con endpoints de inferencia: etiqueta `endpoints_compatible`.
- Compatibilidad con el ecosistema compressed-tensors y transformers.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Validacion del helper de guardado de MTP en llm-compressor: el repositorio existe precisamente para ejercitar el codigo del PR3118 (commit 3dd54c307); un ingeniero puede clonarlo, cargar los pesos y comprobar que la desquantizacion BF16 de la cabeza MTP reproduce los valores de referencia.
- Depuracion de decodificacion especulativa en vLLM: sirve como caso reproducible con una tasa de aceptacion de borradores documentada (30 de 33 tokens, 90,91%) sobre una completacion de 64 tokens, util para comparar configuraciones de `num_speculative_tokens` o versiones de vLLM.
- Verificacion de roundtrip FP8: al ser la tercera etapa de una cadena copy -> FP8 -> BF16, permite medir la perdida por redondeo FP8 comparando las tres etapas con las mismas entradas.
- Pruebas de humo de despliegue en hardware Blackwell: la model card documenta una ejecucion en una B200 con vLLM 0.28.0, lo que sirve de referencia para validar que la pila de serving arranca en esa GPU.
- Referencia para pipelines de cuantizacion de modelos Qwen de ~27B: util para equipos que necesiten cuantizar variantes con MTP y quieran un punto de comparacion de pesos y tamanos.
- Generacion de texto general: heredada del modelo base, podria emplearse para tareas conversacionales, si bien este artefacto no ha sido evaluado en calidad y no se recomienda su uso directo en produccion.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado en la informacion disponible es un smoke test de serving, no una evaluacion de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tokens borrador aceptados | 30/33 (90,91%) | 1 token especulativo MTP, completacion de 64 tokens |
| Hardware | B200 (1 GPU) | Reservada via canhazgpu |
| Motor de inferencia | vLLM 0.28.0 | TP=1 |
| Naturaleza de la prueba | Smoke test de pipeline y serving | No es benchmark de calidad ni de rendimiento |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que la prueba es corta y no constituye una evaluacion de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 54,6 GB solo para pesos (27,32 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV. Estimacion propia a partir del recuento de parametros, no publicada por el autor.
- VRAM estimada en FP8: en torno a 27,3 GB solo para pesos, mas overhead. Estimacion propia.
- GPU recomendadas: el autor valida sobre una NVIDIA B200. Por tamano, cabria tambien en H100 80 GB e incluso en A100 80 GB en BF16 con margen ajustado; en FP8 cabria en GPUs de 40-48 GB.
- GPUs de consumo: no cabe en una RTX 4090 (24 GB) en BF16 ni presumiblemente en FP8 con overhead. No se publican cuantizaciones de 4 bits ni formato GGUF que permitan reducir el footprint.
- Opciones de despliegue: vLLM 0.28.0 es la unica ruta validada explicitamente. El formato compressed-tensors es compatible con el ecosistema vLLM/compressed-tensors. No hay evidencia de soporte en llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El unico dato es la tasa de aceptacion de tokens especulativos (90,91%) en una unica completacion de 64 tokens.
- Nota: el repositorio ocupa 35,9 GB, lo que incluye pesos y metadatos; el espacio en disco necesario para descargarlo es de ese orden.

## Comparativa con modelos similares

Los unicos comparables documentados son las otras dos etapas de la misma cadena de validacion y el modelo base:

| Modelo | Parametros | Formato / cuantizacion | Proposito | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118 (este) | 27,32 mil millones | safetensors, backbone FP8_DYNAMIC + MTP BF16 | Validacion del helper MTP de PR3118 | apache-2.0 | 0 descargas |
| Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118 | No disponible | Copia sin cuantizar | Primera etapa de la cadena | apache-2.0 | No disponible |
| Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118 | No disponible | FP8 con roundtrip | Segunda etapa de la cadena | apache-2.0 | No disponible |
| Qwen/Qwen3.8-27B | 27,32 mil millones (derivado) | No disponible | Modelo base original | No disponible en la informacion | No disponible |

No se dispone de datos sobre context length, benchmarks ni idiomas del modelo base, por lo que no es posible una comparativa funcional con alternativas externas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un smoke test de pipeline y serving, segun indica el propio autor. No se ha evaluado su calidad.
- La tasa de aceptacion de MTP (90,91%) proviene de una unica completacion de 64 tokens con un solo token especulativo; no es estadisticamente representativa.
- Persiste la perdida por redondeo de la cuantizacion FP8 previa: la desquantizacion a BF16 reduce el error de formato, pero no recupera la precision perdida en el paso FP8.
- Sesgos conocidos: no disponibles. Al heredar el modelo base Qwen/Qwen3.8-27B, arrastraria los sesgos de este, pero no hay informacion al respecto en la documentacion proporcionada.
- Riesgo de alucinacion: no cuantificado ni documentado para este artefacto.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Licencia: apache-2.0, pero la model card indica que se aplica la licencia original de Qwen; conviene revisar los terminos del modelo base antes de cualquier uso comercial.
- La etiqueta `image-text-to-text` sugiere capacidad multimodal, pero no esta confirmada ni documentada en la model card; no debe asumirse.
- Sin cuantizaciones ligeras publicadas (GGUF, AWQ, 4 bits), lo que limita su despliegue en hardware de consumo.
- 0 descargas y 0 likes: no existe validacion por parte de la comunidad.
- El repositorio depende de un PR concreto de llm-compressor; la reproducibilidad futura depende de que ese codigo siga disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118
- Etapa 1 (copia): https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118
- Etapa 2 (FP8 roundtrip): https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118
- Repositorio de validacion de referencia: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation
- Commit del PR3118 de llm-compressor: https://github.com/vllm-project/llm-compressor/commit/3dd54c307dd68074c8af055cb5017093a4880e54
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fichero de validacion del autor: pr3118-validation.json (referenciado en la model card, sin URL directa en la informacion disponible)
- La busqueda web no devolvio resultados relevantes: unicamente enlaces genericos a Wikipedia, sin relacion con el modelo.
