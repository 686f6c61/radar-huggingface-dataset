# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-BLOCK-pr3118-validation

## Resumen

GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-BLOCK-pr3118-validation es un artefacto de validacion estructural publicado por el usuario soyrsoyr en HuggingFace. No es un modelo preentrenado: la propia model card lo describe como un "fixture estructural de pesos aleatorios" derivado del repositorio soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture, con dimensiones alineadas y todos los pasos de derivacion registrados en el fichero pr3118-validation.json. Su finalidad es verificar que la cadena de herramientas de cuantizacion y de inferencia carga y ejecuta correctamente un modelo con arquitectura etiquetada como glm_moe_dsa, decodificacion especulativa MTP (multi-token prediction) y cuantizacion FP8 por bloques.

El modelo tiene 88.040.064 parametros (aproximadamente 88 millones) segun los pesos safetensors, ocupa 0,2 GB en el repositorio y se distribuye bajo licencia "other". La model card indica explicitamente que la carga y generacion en H100 pasaron la validacion con metricas reales de tokens borrador MTP, y que esto no constituye una prueba de calidad ni de rendimiento. Es decir, el artefacto sirve para validar infraestructura, no para producir texto de calidad.

Su relevancia es acotada pero real para equipos que trabajan con vLLM y con llm-compressor: permite reproducir un caso minimo de cuantizacion sin calibracion (data-free) sobre un backbone BF16 con modulo MTP separado, y comprobar la compatibilidad de versiones concretas (vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0) antes de lanzar trabajos sobre modelos GLM-5.3 completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atencion dispersa, segun el tag de arquitectura del repositorio); backbone BF16 con modulo MTP separado |
| Parametros totales | 88.040.064 (dato real de los safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el comando de validacion usa --max-model-len 1024, pero es una configuracion de prueba de servicio, no la ventana del modelo) |
| Tipos de cuantizacion | FP8 por bloques (pesos) sobre backbone BF16; modulo MTP cuantizado con esquema data-free. El repositorio base esta asociado a NVFP4A16 (FP4 solo pesos con activaciones de 16 bits) y a MXFP4 (cuantizacion dinamica de activaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (la model card indica que la licencia del modelo de origen sigue aplicandose y que esta validacion no anade ninguna concesion de licencia) |
| Formato de pesos | safetensors; tambien se referencian config.json y recipe.yaml |

## Arquitectura y entrenamiento

La arquitectura declarada es glm_moe_dsa, etiqueta que apunta a un transformer con mezcla de expertos (MoE) y atencion dispersa, en la linea de la familia GLM con DSA (DeepSeek Sparse Attention). En este repositorio concreto el backbone y el modulo MTP se almacenan en formatos separados, de modo que la inspeccion de config.json y de pr3118-validation.json es necesaria para reconstruir la topologia exacta. El modelo no ha sido entrenado: los pesos son aleatorios y solo se han alineado las dimensiones para que la carga sea posible en el runtime objetivo. No existe, por tanto, dataset de entrenamiento, numero de tokens, ni fases de RLHF o DPO.

La innovacion tecnica del artefacto es de proceso, no de modelado. Se aplico un esquema de cuantizacion FP8 por bloques solicitado explicitamente como data-free, es decir, sin calibracion con datos reales, sobre un backbone BF16 con cabezal MTP procedente del fixture denso de origen. La implementacion corresponde al PR 3118 de llm-compressor (commit 87347881) y emplea el formato compressed-tensors. La validacion end-to-end exige metricas positivas de tokens borrador MTP: segun la model card, una carga correcta del modelo no se considera un "pass" de MTP por si sola, lo que convierte a este repositorio en una prueba funcional de decodificacion especulativa, no en un modelo utilizable.

## Capacidades

- Generacion de texto: tecnicamente puede ejecutar el pipeline text-generation, pero al tratarse de pesos aleatorios la salida es incoherente y carece de valor.
- Validacion de decodificacion especulativa MTP: el escenario para el que fue creado; expone metricas de tokens borrador via --speculative-config con metodo "mtp".
- Validacion de carga de pesos cuantizados: comprueba que llm-compressor y compressed-tensors generan y consumen correctamente un checkpoint FP8 por bloques sobre backbone BF16.
- Compatibilidad de versiones de runtime: sirve como test de humo reproducible para vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0.
- Dialogo conversacional: el tag "conversational" esta presente, pero sin pesos entrenados no hay capacidad conversacional real.
- Tool calling, agentes, multi-step reasoning, vision, audio, thinking mode: no disponible; la model card no declara ninguna de estas capacidades.
- Capacidades multilingues: no disponible.

## Casos de uso

- Integracion continua de llm-compressor: usar el repositorio como caso de prueba minimo en el pipeline de CI para verificar que una modificacion en el codigo de cuantizacion sigue produciendo un checkpoint FP8 por bloques cargable en vLLM.
- Regresion de decodificacion especulativa MTP: ejecutar verify_mtp.py en cada actualizacion de vLLM para detectar roturas en la ruta de tokens borrador sin necesidad de descargar un modelo GLM-5.3 completo.
- Validacion de hardware previa a despliegue: comprobar en una maquina nueva (por ejemplo, un nodo H100 o B200) que el stack CUDA, el driver y las versiones de Python cargan correctamente un checkpoint con backbone BF16 y modulo MTP en FP8.
- Pruebas de esquemas de cuantizacion sin datos: servir como banco de pruebas para recetas de cuantizacion data-free y comparar NVFP4A16, MXFP4 y FP8 por bloques sin acceso a datasets.
- Desarrollo de herramientas de inspeccion de checkpoints: al tener config.json, recipe.yaml y pr3118-validation.json con todos los pasos de derivacion, es util para construir o depurar parsers de compressed-tensors y de modelos MoE.
- Verificacion de limites de memoria y planificacion de GPU: con 88 millones de parametros y 0,2 GB de repositorio, permite medir consumo de VRAM, tiempo de carga y sobrecarga de --enforce-eager con --gpu-memory-utilization 0.85 en distintos aceleradores.
- Docencia y demostracion de arquitecturas MoE con atencion dispersa: sirve para mostrar la estructura de ficheros, la separacion backbone/MTP y el flujo de cuantizacion sin exponer pesos con licencia restrictiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es explicita: "This is not a quality or performance benchmark" y "No quality claims apply". El unico resultado reportado es cualitativo: carga y generacion con exito en H100 con metricas positivas de tokens borrador MTP bajo vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0.

| Prueba | Resultado reportado | Notas |
|---|---|---|
| Carga en H100 | PASSED | Segun la model card |
| Generacion en H100 | PASSED | Con metricas reales de tokens borrador MTP |
| Benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) | no disponible | Pesos aleatorios; no aplica |
| Compatibilidad MXFP4 | no disponible | La model card indica que requiere una ejecucion propia en B200 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,18 GB en BF16 solo para pesos (88 M de parametros) y en torno a 0,09 GB si se sirven los pesos FP8; el repositorio completo ocupa 0,2 GB en disco.
- GPU recomendadas: cualquier GPU con al menos unos pocos gigabytes libres; el unico entorno explicitamente validado es NVIDIA H100 con CUDA 13.0.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU. El limite practico no es la memoria, sino la disponibilidad de las versiones de vLLM y CUDA requeridas.
- Opciones de despliegue: vLLM es la ruta documentada, con --dtype bfloat16, --enforce-eager, --gpu-memory-utilization 0.85 y --speculative-config '{"method":"mtp","num_speculative_tokens":1}'. Transformers se usa como libreria de carga. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card no publica cifras y advierte que no es un benchmark de rendimiento.
- Restriccion de multimodalidad: el comando de referencia usa --limit-mm-per-prompt '{"image":0,"video":0}', es decir, la validacion se ejecuto sin entradas de imagen ni video.

## Comparativa con modelos similares

La comparacion de calidad no es aplicable porque el modelo no tiene pesos entrenados. La tabla siguiente contrasta el artefacto con el fixture de origen y con modelos pequenos reales de proposito general, solo a efectos de dimension, contexto y uso previsto.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-BLOCK-pr3118-validation | 88.040.064 | no disponible (prueba con 1024) | Fixture de validacion de cuantizacion y MTP | other | HuggingFace, 0 descargas, 0 likes |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture | no disponible | no disponible | Fixture de origen | no disponible | HuggingFace |
| Modelos pequenos de proposito general (por ejemplo, en la franja de 100-600 M de parametros) | Comparable en orden de magnitud | Tipicamente miles de tokens | Generacion de texto real | Varias | Amplia |

No se dispone de datos de benchmarks ni de licencia del fixture de origen, por lo que no es posible establecer una comparacion tecnica significativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Pesos aleatorios: la model card afirma que es un "derived random-weight structural fixture, not pretrained GLM-5.3 weights". Cualquier salida de texto carece de sentido.
- Prohibido usar como modelo de produccion: no hay ninguna garantia de calidad, coherencia, seguridad ni ausencia de sesgos, porque no ha habido entrenamiento.
- Riesgo de alucinacion: total; no es un riesgo estadistico sino una consecuencia directa de los pesos aleatorios.
- Contexto e idiomas: no hay datos publicados sobre ventana de contexto ni idiomas soportados. El valor 1024 del comando de validacion es una configuracion de servicio, no una especificacion del modelo.
- Licencia: "other". La model card indica que la licencia del modelo de origen sigue aplicandose y que esta validacion no anade ninguna concesion. Se debe consultar la model card aguas arriba antes de cualquier uso, incluido el comercial.
- Dependencia estricta de versiones: la validacion se realizo con vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0. Otras combinaciones pueden fallar, y la propia model card senala que MXFP4 requiere una ejecucion en B200 para establecer compatibilidad.
- Backbone y MTP en formatos separados: inspeccionar config.json, recipe.yaml y pr3118-validation.json antes de asumir cualquier estructura.
- El exito de carga no equivale a exito funcional: la model card exige metricas positivas de tokens borrador para considerar superada la prueba MTP.
- Sin traccion en la comunidad: 0 descargas, 0 likes, creado y actualizado el 2026-09-14, lo que implica ausencia de validacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-FP8-BLOCK-pr3118-validation
- Modelo base (fixture de origen): https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Implementacion (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Fichero de derivacion: pr3118-validation.json (dentro del repositorio de HuggingFace)
- Script de verificacion: verify_mtp.py (dentro del repositorio de HuggingFace)
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos corresponden a un foro de matematicas en arabe y no guardan relacion con el modelo.
