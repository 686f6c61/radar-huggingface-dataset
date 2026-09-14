# soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-FromFP8MTP-pr3118-validation

## Resumen

Este repositorio contiene una cuantizacion experimental del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B, publicada por el usuario `soyrsoyr` con el identificador `Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-FromFP8MTP-pr3118-validation`. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de NVIDIA: es un artefacto derivado cuyo objetivo es validar una receta de cuantizacion concreta sobre el modulo de multi-token prediction (MTP) del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`.

El proceso declarado por el autor es el siguiente: se parte de un checkpoint derivado con backbone en BF16 y modulo MTP convertido a FP8 por bloques nativo; ese MTP en FP8 se descuantiza y se vuelve a cuantizar al formato FP4 solicitado. El backbone y el MTP se almacenan con formatos separados. Segun el safetensors publicado, el modelo tiene 32.245.782.080 parametros (unos 32,2 mil millones) y el repositorio ocupa 33,0 GB.

La relevancia de esta ficha es acotada y conviene entenderla asi: se publica como validacion de una implementacion de `llm-compressor` (PR 3118) y sus tags lo situan como modelo conversacional de generacion de texto. La propia model card advierte de que la validacion en tiempo de ejecucion sobre B200 esta pendiente y de que no se reclama ninguna pasada de inferencia en MXFP4. Con 0 descargas y 0 likes en el momento de la consulta, debe considerarse material de investigacion, no un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Nemotron-H (tag `nemotron_h`): hibrido Mamba-Transformer con mezcla de expertos (MoE) segun la convencion de nombres A3B. Inferido de los tags y del nombre; no detallado en la model card |
| Parametros totales | 32.245.782.080 (~32,2 B), segun los pesos safetensors publicados |
| Parametros activos | ~3 B (inferido del sufijo A3B del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MTP en MXFP4 con cuantizacion dinamica de activaciones; backbone en FP8 segun la nomenclatura del repositorio. Formatos de backbone y MTP gestionados por separado. Segun la model card, NVFP4A16 es FP4 solo de pesos con activaciones de 16 bits, no NVFP4 W4A4 calibrado |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (campo `license: other` en HuggingFace). La validacion no anade ninguna concesion de licencia; se aplica la licencia del modelo original |
| Formato de pesos | safetensors con compressed-tensors (generado con llm-compressor) |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre el entrenamiento del modelo base: no se detallan tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO. Lo unico documentado es el linaje del artefacto: parte de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (commit `a9904d24bcc1d289a1950fa9d2b978c47cf903b9`), se genera un checkpoint de prueba derivado con backbone BF16 y MTP en FP8 nativo por bloques, y ese MTP se descuantiza y recuantiza a FP4. El autor indica explicitamente que ese checkpoint de entrada en FP8 no es una release oficial de NVIDIA.

La innovacion tecnica que motiva este repositorio es el modulo MTP, utilizado como metodo de decodificacion especulativa en vLLM (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`). La validacion se plantea de extremo a extremo y no se conforma con que el modelo cargue: el script `verify_mtp.py` lanza dos prompts y exige metricas positivas de tokens borrador. La model card insiste en que una carga correcta no cuenta como validacion de MTP. El entorno de referencia declarado es `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0, con compatibilidad de runtime pendiente de establecer en B200.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation` del repositorio.
- Decodificacion especulativa mediante multi-token prediction (MTP), con `num_speculative_tokens` configurable en vLLM.
- Razonamiento y generacion de codigo: no documentado en la informacion disponible para este checkpoint; se heredaria, en su caso, del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad multimodal: el comando de servicio del autor desactiva explicitamente las entradas de imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`), lo que sugiere que el modelo base admite entrada multimodal, pero este repositorio no la habilita ni la documenta.
- Modo thinking: no documentado.

## Casos de uso

- Validacion de recetas de cuantizacion: el repositorio existe precisamente para comprobar si la conversion de un MTP en FP8 a MXFP4 produce un checkpoint coherente, usando `verify_mtp.py` como criterio de aceptacion. Es el caso de uso principal y esta explicitamente descrito por el autor.
- Pruebas de integracion de `llm-compressor`: el artefacto esta ligado al PR 3118 (commit `87347881`), por lo que sirve para reproducir y depurar esa implementacion antes de un merge o de una release.
- Investigacion sobre decodificacion especulativa: permite medir la tasa de aceptacion de tokens borrador con un unico token especulativo en un MoE de ~32 B con modulo MTP cuantizado a FP4.
- Evaluacion de degradacion por cuantizacion: comparar la salida de este checkpoint MXFP4 contra el modelo base BF16 para cuantificar la perdida de calidad atribuible a la cuantizacion del MTP.
- Benchmarking de inferencia en hardware Blackwell: la model card menciona B200 como plataforma objetivo de validacion, de modo que el modelo es util para estudiar el comportamiento de formatos FP4/FP8 en esa generacion de GPU.
- Servicio local de generacion de texto con vLLM: el comando documentado (`vllm serve ... --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85`) permite levantar un endpoint compatible con la API de OpenAI para pruebas internas con contexto corto.
- Reproducibilidad de artefactos de terceros: al incluir `pr3118-validation.json` y referencias a commits concretos, el repositorio facilita auditar la cadena de procedencia de un checkpoint cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad. El unico dato de rendimiento mencionado es funcional, no comparativo: la validacion de MTP requiere metricas positivas de tokens borrador en dos prompts, con un token especulativo, y dicha validacion esta pendiente en B200.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 33 GB, derivados del tamano del repositorio (33,0 GB) y de los 32,2 B de parametros. Es una estimacion a partir de los datos publicados, no una cifra declarada por el autor.
- VRAM total: hay que sumar a esos 33 GB la cache KV y el overhead de runtime. Con `--max-model-len 1024` y `--gpu-memory-utilization 0.85` el autor apunta a un unico acelerador de gran capacidad.
- GPU recomendadas: NVIDIA B200 es la plataforma objetivo de validacion (pendiente). Por capacidad de memoria, tambien encajan H100, H200 y A100 de 80 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) con los formatos publicados, dado que solo los pesos superan los 32 GB. Se necesitarian al menos 48 GB de VRAM y, en la practica, 80 GB para operar con holgura.
- Opciones de despliegue: vLLM es la unica ruta documentada, con la version de referencia `0.29.1rc1.dev79+g767d1c4d4` y Transformers `5.17.0` sobre CUDA 13.0. No hay instrucciones para llama.cpp, Ollama, TGI ni otros motores.
- Nota critica: la model card advierte de que la compatibilidad en runtime de MXFP4 debe establecerla el propio usuario en su B200. No se reclama ninguna pasada de inferencia en MXFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Este repositorio (`soyrsoyr/...FP8Dyn-MTP-MXFP4...`) | 32,2 B (totales, safetensors) | no disponible | safetensors, compressed-tensors, MTP en MXFP4 | openmdw-1.1; sin concesion adicional | Publicado el 14/09/2026; 0 descargas; validacion de runtime en B200 pendiente |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (modelo base) | no disponible | no disponible | BF16 | se aplica la del modelo original | Referencia upstream, commit `a9904d24...` |
| Checkpoint derivado con backbone BF16 y MTP en FP8 nativo | no disponible | no disponible | MTP en block FP8 | no es release oficial de NVIDIA | Checkpoint de prueba intermedio del proceso de conversion |

No se dispone en la informacion proporcionada de datos que permitan comparar este artefacto con alternativas de otros fabricantes (Qwen, Mistral, Llama, etc.) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Validacion incompleta: la propia model card declara la validacion de runtime en B200 como pendiente y aclara que no se reclama ninguna pasada de inferencia en MXFP4. No debe desplegarse en produccion con ese formato sin validacion previa.
- Naturaleza derivada: no es un modelo oficial de NVIDIA. El modelo base, el proceso de cuantizacion y los resultados dependen de un PR de `llm-compressor` (PR 3118) en estado de validacion.
- Licencia: el campo de HuggingFace indica `license: other` con nombre `openmdw-1.1`. La model card especifica que la validacion no anade ninguna concesion de licencia y que se aplica la licencia del modelo original. Antes de cualquier uso comercial hay que revisar la licencia upstream y los terminos de OpenMDW 1.1.
- Idiomas soportados: sin declarar, por lo que no puede asumirse cobertura multilingue.
- Longitud de contexto: sin declarar. El ejemplo de servicio usa `--max-model-len 1024`, muy por debajo de lo habitual en modelos de esta clase.
- Riesgo de alucinacion: no evaluado en la informacion disponible; no hay benchmarks de fidelidad ni de tasas de error.
- Sesgos: no documentados.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicacion y ultima actualizacion separadas por menos de un minuto (14/09/2026), lo que indica un artefacto de trabajo sin rodaje en la comunidad.
- Compatibilidad de motores: sin soporte documentado fuera de vLLM, lo que limita las opciones de despliegue y complica el fallback a otros runtimes.
- Requisitos de memoria: los formatos publicados exigen aceleradores de gran capacidad (48-80 GB o mas), lo que excluye GPU de consumo.
- Multiples formatos en un mismo repositorio: backbone y MTP usan cuantizaciones distintas, de modo que cualquier evaluacion debe inspeccionar `config.json`, `recipe.yaml` y `pr3118-validation.json` antes de extraer conclusiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-FromFP8MTP-pr3118-validation
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/tree/a9904d24bcc1d289a1950fa9d2b978c47cf903b9
- Implementacion de cuantizacion (llm-compressor PR 3118, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Nota sobre la busqueda web: las consultas realizadas solo devolvieron resultados de Google Traduction (https://translate.google.fr/, https://translate.google.fr/details, https://translate.google.fr/m), sin ninguna relacion tecnica con el modelo. No se han encontrado papers, blogs ni demos adicionales.
