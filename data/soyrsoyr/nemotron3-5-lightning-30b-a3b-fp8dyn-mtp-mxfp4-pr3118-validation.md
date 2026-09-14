# soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-pr3118-validation

## Resumen

Este repositorio contiene una validacion de cuantizacion del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B, publicado por el usuario soyrsoyr bajo el identificador `soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-pr3118-validation`. No es un modelo entrenado desde cero, sino una conversion del checkpoint BF16 de NVIDIA (`nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`) a esquemas de precision reducida (FP8 dinamico y MXFP4) manteniendo un modulo de decodificacion especulativa MTP (multi-token prediction) en un formato separado del backbone. El repositorio se presenta explicitamente como una validacion de la implementacion de cuantizacion del PR 3118 de llm-compressor, no como un modelo listo para produccion.

El modelo cuenta con 32.245.782.080 parametros totales segun los pesos en safetensors y un repositorio de 33,0 GB. La nomenclatura "30B-A3B" del modelo base apunta a una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parametros activos por token, aunque la informacion disponible no detalla la configuracion interna de expertos, el numero de capas ni la longitud de contexto. La etiqueta de arquitectura declarada en el repositorio es `nemotron_h`, lo que sugiere una arquitectura hibrida propia de la familia Nemotron.

Su relevancia en este momento es acotada y muy tecnica: sirve como banco de pruebas para verificar que la cuantizacion MXFP4 con activaciones dinamicas y el modulo MTP funcionan conjuntamente en hardware Blackwell (B200). El propio autor advierte que la validacion de runtime en B200 esta pendiente y que no se reclama ninguna pasada de inferencia MXFP4 exitosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (etiqueta declarada en el repositorio); detalle interno no disponible |
| Parametros totales | 32.245.782.080 (aprox. 32,25 B), segun safetensors |
| Parametros activos | No disponible en la informacion proporcionada; la nomenclatura "30B-A3B" del modelo base sugiere un esquema MoE con aproximadamente 3 B activos, sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinamico (FP8Dyn), MXFP4 con cuantizacion dinamica de activaciones y NVFP4A16 (FP4 weight-only con activaciones de 16 bits, no calibrado W4A4); el modulo MTP se cuantiza con un esquema data-free |
| Idiomas soportados | No disponibles |
| Licencia | openmdw-1.1 (etiquetada como `license: other` en HuggingFace); se mantiene la licencia del modelo base y esta validacion no concede licencia adicional |
| Formato de pesos | safetensors (backbone y MTP en formatos separados; existe `config.json`, `recipe.yaml` y `pr3118-validation.json`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una conversion de pesos. El checkpoint de origen es `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, del que no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La etiqueta de arquitectura del repositorio es `nemotron_h`, y la nomenclatura del modelo base (30B-A3B) es coherente con una arquitectura de mezcla de expertos, pero no se aportan datos sobre el numero de expertos, el enrutador ni el ratio de activacion.

La innovacion tecnica concreta de este repositorio es la validacion de un pipeline de cuantizacion que combina tres piezas: cuantizacion FP8 dinamica, cuantizacion MXFP4 con activaciones dinamicas y preservacion del modulo de decodificacion especulativa MTP. El autor separa deliberadamente el backbone y el MTP en formatos distintos y advierte que NVFP4A16 no equivale a NVFP4 W4A4 calibrado. El material incluye un script `verify_mtp.py` que ejecuta dos prompts y exige metricas positivas de draft-token: una carga correcta del modelo no se considera una prueba superada de MTP.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso orientado a dialogo, aunque no se documentan evaluaciones cualitativas.
- Decodificacion especulativa mediante MTP: el repositorio incluye un modulo de prediccion multi-token que se activa con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` en vLLM, con el objetivo de acelerar la generacion sin cambiar el modelo objetivo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura de inferencia gestionada.
- Soporte de capacidades multimodales: no confirmado. El comando de validacion desactiva explicitamente imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`), lo que apunta a que la arquitectura de origen contempla entradas de ese tipo, pero no se aporta ninguna capacidad multimodal verificada.
- Tool calling, function calling, razonamiento multi-paso y modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Validacion de pipelines de cuantizacion: el escenario principal del repositorio. Un equipo que investigue la receta de llm-compressor puede reproducir la conversion, ejecutar `verify_mtp.py` y comprobar que la decodificacion especulativa produce draft-tokens validos antes de adoptar el esquema en otros modelos.
- Pruebas de compatibilidad de runtime en Blackwell: el comando documentado apunta a B200 con `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0 y CUDA 13.0, de modo que sirve para verificar la ruta MXFP4 en esa generacion de GPU.
- Investigacion sobre cuantizacion de modulos auxiliares: el caso de un MTP cuantizado con esquema data-free y almacenado aparte del backbone es un objeto de estudio util para quienes disenan tecnicas de compresion que no degraden la tasa de aceptacion especulativa.
- Evaluacion comparativa de precision: con 32,25 B de parametros en MXFP4, el checkpoint permite medir la perdida de calidad frente al BF16 de origen en tareas de generacion, siempre que se disponga de una suite propia, ya que no hay benchmarks publicados.
- Integracion en vLLM para pruebas de throughput: al habilitar decodificacion especulativa, es un candidato para experimentos internos de latencia y tokens por segundo en servidores con GPU de datacenter.
- Analisis de conversaciones multi-turno en laboratorio: la etiqueta conversacional permite usar el modelo como banco de pruebas en prototipos de dialogo, sin garantias de calidad ni de contexto largo al no conocerse la ventana real.
- Docencia y formacion tecnica: ilustra de forma practica la diferencia entre FP8 dinamico, MXFP4 y NVFP4A16, y por que una validacion de consistencia de checkpoint no equivale a una validacion de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las comprobaciones de conversion y consistencia del checkpoint se han superado, pero que la validacion de runtime en B200 esta pendiente y que no se reclama ninguna pasada de inferencia en MXFP4. Tampoco se facilitan cifras de latencia, throughput ni tasa de aceptacion de los tokens especulativos.

## Requisitos de hardware

- VRAM estimada para FP8: en torno a 32-34 GB solo para pesos, calculado a partir de los 32.245.782.080 parametros y del tamano de repositorio de 33,0 GB. Requiere GPU de datacenter con 40 GB o mas.
- VRAM estimada para MXFP4: aproximadamente 16-18 GB para pesos en 4 bits mas escalas de bloque. Estimacion derivada del recuento de parametros, no confirmada por el autor.
- GPU recomendadas: NVIDIA B200 es la plataforma de referencia de la validacion (pendiente). Para FP8, GPU de 40-80 GB como A100 80 GB, H100 o H200.
- Cabe en GPU de consumo: la variante MXFP4 podria ajustarse en una RTX 4090 de 24 GB con contexto corto, segun la estimacion de 16-18 GB de pesos, pero no hay confirmacion experimental y el resto de la pila (vLLM, CUDA 13.0) condiciona la viabilidad.
- Opciones de despliegue: vLLM con `--dtype bfloat16`, `--enforce-eager`, `--gpu-memory-utilization 0.85` y decodificacion especulativa MTP; Transformers 5.17.0 como libreria declarada. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no estan soportados por este repositorio.
- En el comando de validacion se fija `--max-model-len 1024`, un ajuste de la prueba y no una especificacion de la ventana de contexto del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-pr3118-validation | 32,25 B | No disponible | FP8 dinamico, MXFP4, NVFP4A16 | openmdw-1.1 (hereda la del modelo base) | HuggingFace, 0 descargas, validacion pendiente en B200 |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (modelo base) | 32,25 B (equivalente en el checkpoint convertido) | No disponible | BF16 | No disponible en la informacion proporcionada | HuggingFace, revision a9904d24 referenciada |
| Otros modelos MoE de ~30 B con ~3 B activos (por ejemplo, alternativas de la misma categoria) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Estado de validacion incompleto: el autor declara que la validacion de runtime en B200 esta pendiente y que no se reclama ninguna pasada de inferencia MXFP4. No debe tratarse como un artefacto listo para produccion.
- Ausencia de benchmarks: sin MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, no es posible estimar la degradacion introducida por la cuantizacion respecto al checkpoint BF16.
- Ambiguedad de formato: el backbone y el MTP se distribuyen en formatos separados; NVFP4A16 es FP4 weight-only con activaciones de 16 bits y no equivale a NVFP4 W4A4 calibrado, lo que puede inducir a error al elegir la configuracion de inferencia.
- Dependencias muy especificas: la ruta validada exige `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers 5.17.0 y CUDA 13.0. Otras versiones pueden no cargar el checkpoint o no soportar MXFP4.
- Sin soporte de llama.cpp ni Ollama: no se publican pesos GGUF, lo que limita el despliegue en entornos de CPU o GPU de consumo con esas herramientas.
- Contexto e idiomas desconocidos: no se documenta la longitud de contexto ni los idiomas soportados; el `--max-model-len 1024` del ejemplo corresponde unicamente a la prueba de validacion.
- Licencia: el repositorio usa openmdw-1.1 y hereda las condiciones del modelo base de NVIDIA. Esta validacion no concede licencia adicional, por lo que el uso comercial debe verificarse contra la licencia upstream, no contra este repositorio.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros. Requiere auditoria propia antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-MXFP4-pr3118-validation
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/tree/a9904d24bcc1d289a1950fa9d2b978c47cf903b9
- Implementacion de cuantizacion (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Script de verificacion MTP: `verify_mtp.py`, incluido en el snapshot del repositorio.
- Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a foros no relacionados (soporte de WhatsApp Web y Microsoft Community) y se han descartado.
