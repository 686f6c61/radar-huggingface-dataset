# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation

## Resumen

Este repositorio aloja una validación técnica de una cuantización FP8 dinámica del modelo Qwen3.8-27B, publicada por el usuario soyrsoyr. No es un modelo nuevo ni un ajuste fino: es un checkpoint derivado de Qwen/Qwen3.8-27B, con 27.320.697.856 parámetros según los pesos safetensors y 35,9 GB de repositorio, cuyo objetivo declarado es validar la carga y la generación con decodificación especulativa MTP (multi-token prediction) sobre la implementación del PR 3118 de llm-compressor.

El autor indica explícitamente que la prueba en H100 pasó con métricas reales de draft-token y que esto no constituye un benchmark de calidad ni de rendimiento. El backbone se cuantiza en FP8 dinámico mientras que el módulo MTP denso se copia sin cambios en BF16; el repositorio documenta además otros formatos de cuantización (NVFP4A16 y MXFP4) y separa los formatos del backbone y del MTP.

Su relevancia es acotada pero concreta: sirve a quien necesite reproducir o depurar pipelines de cuantización combinados con decodificación especulativa MTP en versiones muy específicas de vLLM, Transformers y CUDA. No hay información pública sobre idiomas soportados, longitud de contexto ni evaluación de calidad, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetada como qwen3_5, con pipeline image-text-to-text y text-generation, e incorpora un modulo MTP denso |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones), dato real de safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone en FP8 dinamico (FP8Dyn) con MTP en BF16; el repositorio menciona ademas NVFP4A16 (FP4 weight-only con activaciones de 16 bits, no calibrado W4A4) y MXFP4 (cuantizacion dinamica de activaciones) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (la validacion no anade concesion de licencia; sigue aplicando la del modelo original) |
| Formato de pesos | safetensors |
| Autor | soyrsoyr |
| Modelo base | Qwen/Qwen3.8-27B (commit 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0) |
| Libreria | transformers |
| Pipeline | text-generation |
| Implementacion de cuantizacion | llm-compressor PR 3118, commit 87347881 |
| Tamano del repositorio | 35,9 GB |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base: no hay datos en la informacion proporcionada sobre numero de tokens, composicion del dataset, fases de RLHF o DPO ni sobre el regimen de entrenamiento. Este checkpoint en concreto no se ha entrenado: es el resultado de aplicar un recipe de cuantizacion sobre Qwen/Qwen3.8-27B, por lo que su comportamiento cualitativo depende integramente del modelo original.

La innovacion tecnica del repositorio es de infraestructura, no de modelado. Por un lado, la cuantizacion FP8 dinamica del backbone mediante llm-compressor y compressed-tensors, con el modulo MTP denso preservado en BF16 ("dense MTP was copied unchanged"). Por otro, la validacion de decodificacion especulativa MTP en vLLM, configurada con `{"method":"mtp","num_speculative_tokens":1}`, que requiere metricas positivas de draft-token para considerarse superada. El autor subraya que backbone y MTP tienen formatos separados y que deben inspeccionarse `config.json`, `recipe.yaml` (cuando exista) y `pr3118-validation.json` para conocer la configuracion exacta.

## Capacidades

- Generacion de texto y conversacion, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Procesamiento de imagen y texto: la etiqueta image-text-to-text sugiere capacidades multimodales heredadas del modelo base, si bien el comando de despliegue de ejemplo las desactiva explicitamente (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Decodificacion especulativa con multi-token prediction (MTP) como mecanismo de aceleracion en vLLM, con un token especulativo por paso en la configuracion validada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Validacion de decodificacion especulativa MTP en pipelines propios: el repositorio incluye el script `verify_mtp.py`, que ejecuta dos prompts y exige metricas positivas de draft-token; se usaria para comprobar que una instalacion concreta de vLLM acelera correctamente con MTP antes de desplegar el modelo en produccion.
- Pruebas de integracion de cuantizacion en CI: sirve como checkpoint de referencia para verificar que el PR 3118 de llm-compressor y la libreria compressed-tensors producen pesos cargables y generables tras aplicar un recipe FP8 dinamico, sin necesidad de reejecutar la cuantizacion completa.
- Matriz de compatibilidad de versiones: el autor fija un baseline de `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0 y CUDA 13.0; el checkpoint se usaria para confirmar o descartar que una actualizacion de estas dependencias no rompe ni la carga ni el MTP.
- Auditoria de releases de cuantizacion: al estar vinculado a un commit concreto del modelo base, permite comparar el snapshot cuantizado con Qwen/Qwen3.8-27B sin cuantizar y documentar diferencias de comportamiento o de formato.
- Despliegue de un endpoint de generacion de texto de 27,3 mil millones de parametros en FP8: con el comando de vLLM documentado se puede levantar un servidor compatible con la API de OpenAI para prototipos internos de generacion y conversacion.
- Evaluacion de rutas alternativas de cuantizacion (NVFP4A16 y MXFP4): el repositorio documenta estas variantes y advierte de que MXFP4 exige validar la compatibilidad en una maquina B200, por lo que sirve como punto de partida para comparar precision y latencia entre formatos sobre el mismo backbone.
- Reproduccion de resultados por parte de terceros: dado que el autor sostiene que una carga correcta no basta para considerar superado el MTP, el repositorio se usaria para reproducir la prueba completa y registrar generaciones y metricas de decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara de forma explicita que la prueba realizada "is not a quality or performance benchmark". Unicamente se documenta el resultado de la validacion de carga y generacion:

| Prueba | Resultado | Nota |
|---|---|---|
| Carga y generacion en H100 | PASSED | Con metricas reales de draft-token de MTP |
| Validacion MTP (`verify_mtp.py`) | Requiere metricas positivas de draft-token | Una carga correcta del modelo no cuenta como MTP superado |
| MMLU, HumanEval, GSM8K u otros | No disponible | No publicados en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia aritmetica a partir del recuento de parametros, los pesos en FP8 ocuparian del orden de 27,3 GB y en BF16 del orden de 54,6 GB; a ello hay que sumar cache KV y overhead del runtime. El comando de despliegue documentado emplea `--dtype bfloat16` con `--gpu-memory-utilization 0.85` y `--max-model-len 1024`, por lo que en la practica requiere un acelerador de gran capacidad de memoria.
- GPU recomendadas: H100 (el autor confirma validacion en esta GPU). Para la variante MXFP4 se indica que es necesario validar la compatibilidad en una B200. No hay datos sobre A100, L40S u otras.
- Cabe en GPU de consumo: no disponible. Con 27,3 mil millones de parametros y un repositorio de 35,9 GB, un despliegue en GPUs de 24 GB como la RTX 4090 no esta documentado y no se puede dar por viable sin cuantizaciones adicionales; no se publican pesos GGUF.
- Opciones de despliegue: vLLM, con la configuracion exacta documentada. No se mencionan llama.cpp, Ollama ni TGI, y el repositorio solo ofrece safetensors.
- Version de runtime validada: `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0 y CUDA 13.0.
- Comando de referencia: `vllm serve soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}'`.
- Latencia y throughput: no disponible. Se espera ganancia por decodificacion especulativa, pero no se publican cifras de tokens por segundo ni factor de aceleracion.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar con alternativas de la misma categoria, y la busqueda web realizada no devolvio ningun enlace relacionado con el modelo (unicamente resultados de foros sin relacion). La unica comparacion posible es contra el modelo del que deriva:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation | 27,32 B | FP8 dinamico en backbone, MTP en BF16 | No disponible | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Otras alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Naturaleza del artefacto: es un checkpoint de validacion de un PR concreto, no un modelo publicado con garantias de estabilidad ni una release de calidad.
- Ausencia de evaluacion de calidad: el propio autor advierte de que la prueba superada no es un benchmark de calidad ni de rendimiento. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones humanas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay informacion especifica sobre tasas de alucinacion ni sobre mitigaciones aplicadas.
- Degradacion potencial por cuantizacion: la cuantizacion FP8 dinamica del backbone puede alterar la calidad respecto a los pesos originales, y no se publica ninguna comparacion al respecto. El modulo MTP se copia sin cambios, por lo que podria no estar perfectamente alineado con el backbone cuantizado.
- Compatibilidad de versiones muy estricta: el baseline validado depende de versiones concretas (vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0). Cualquier cambio puede invalidar la validacion.
- MXFP4 sin validar: el autor indica que esa ruta requiere que cada usuario establezca la compatibilidad en su propia ejecucion con B200.
- Idiomas y contexto: no disponibles. No se puede asumir soporte multilingue ni una ventana de contexto determinada a partir de este repositorio.
- Licencia: aunque el repositorio declara apache-2.0, el propio autor indica que sigue aplicando la licencia del modelo original y que esta validacion no anade ninguna concesion de licencia. Antes de un uso comercial debe consultarse la model card de Qwen/Qwen3.8-27B.
- Adopcion nula: 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros.
- Capacidades multimodales: la etiqueta image-text-to-text apunta a entrada de imagen y texto, pero el comando de despliegue de ejemplo desactiva imagen y video, por lo que la ruta multimodal no esta validada en este repositorio.
- Ausencia de formatos ligeros: no hay pesos GGUF ni cuantizaciones de 4 bits listas para consumo en hardware de gama de consumo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit concreto del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Implementacion de cuantizacion (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion MTP: `verify_mtp.py`, incluido en el snapshot del repositorio (no se proporciona URL independiente)
- Ficheros de configuracion citados por el autor: `config.json`, `recipe.yaml` y `pr3118-validation.json`, dentro del repositorio
- Resultados de busqueda web: no se encontro ningun enlace relevante relacionado con el modelo; los resultados devueltos corresponden a foros de la Universidad del Egeo sin relacion con el contenido de esta ficha
