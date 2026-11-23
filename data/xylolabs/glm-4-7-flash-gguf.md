# Xylolabs/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash-GGUF es una distribucion cuantizada en formato GGUF del modelo zai-org/GLM-4.7-Flash, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base pertenece a la familia GLM-4.7 de Z.ai (Zhipu AI) y esta orientado a generacion de texto conversacional, con un total de 31.221.488.576 parametros (aproximadamente 31,2 mil millones). Esta ficha cubre especificamente la version GGUF, que conserva el modelo de lenguaje completo, el tokenizer original, la plantilla de chat y el modulo MTP (multi-token prediction).

La relevancia de esta publicacion radica en que permite ejecutar un modelo de ~31B en hardware de consumo mediante cuantizacion de 4 bits, con un tamano de fichero de 16,71-16,88 GB. El autor proporciona metricas de fidelidad frente a la pasada BF16 en transformers (KL medio y coincidencia top-1), lo que facilita evaluar la perdida de calidad introducida por la cuantizacion. Incluye una variante con importance matrix (`-imat`) que mejora ligeramente tanto el KL como la tasa de coincidencia top-1.

La licencia es MIT, lo que simplifica el uso comercial, aunque conviene revisar el aviso `NOTICE` del repositorio, que atribuye la autoria del modelo original. Los idiomas declarados son ingles y coreano, y el modelo esta etiquetado como compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-4.7-Flash; pesos distribuidos en GGUF para llama.cpp) |
| Parametros totales | 31.221.488.576 (~31,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | IQ4_XS (16,88 GB) e IQ4_XS-imat (16,71 GB) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (un fichero por cuantizacion; incluye tokenizer, chat template y modulo MTP) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base GLM-4.7-Flash en la informacion proporcionada; la model card remite al repositorio original y al informe tecnico de GLM para esos detalles. Lo que si se conoce es que el paquete GGUF contiene el modelo de lenguaje completo, el tokenizer original, la plantilla de chat y un modulo MTP (multi-token prediction), que puede habilitar decodificacion especulativa o prediccion de multiples tokens en funcion del soporte de llama.cpp.

El proceso de esta publicacion consiste en la conversion de los pesos originales a GGUF y su cuantizacion a 4 bits. El autor documenta la fidelidad de la cuantizacion frente a su propia pasada BF16 en transformers, evaluada sobre 16.288 posiciones de texto en ingles y coreano. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset) ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y la plantilla de chat incluida.
- Ejecucion en llama.cpp sobre CUDA, Metal o CPU, lo que permite despliegue local y en servidores sin GPU dedicada.
- Soporte de plantilla de chat Jinja (`--jinja` en el ejemplo oficial), necesaria para el formateo correcto de conversaciones.
- Modulo MTP incluido en los ficheros, potencialmente util para decodificacion especulativa.
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni modos de razonamiento extendido para esta version.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con 16,71-16,88 GB por fichero, el modelo puede cargarse en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) usando `-ngl 99` para descargar todas las capas en GPU, lo que resulta adecuado para prototipado y uso personal.
- Servicio de chat autoalojado: mediante `llama-server` se puede exponer una API compatible con el formato de chat del modelo, util para integrar un asistente conversacional en aplicaciones internas sin depender de servicios en la nube.
- Procesamiento de texto en ingles y coreano: el modelo esta declarado para ambos idiomas, por lo que encaja en tareas de resumen, reescritura o generacion de contenido en esos mercados linguisticos.
- Experimentacion con cuantizacion: las metricas KL y top-1 publicadas permiten comparar el impacto de IQ4_XS frente a IQ4_XS-imat en pipelines de evaluacion propios, lo que sirve para decidir que variante desplegar.
- Inferencia en CPU o Apple Silicon: al soportar Metal y CPU, el modelo puede ejecutarse en equipos sin GPU NVIDIA, aunque con mayor latencia; es adecuado para entornos de desarrollo y pruebas offline.
- Integracion en pipelines de evaluacion reproducibles: el autor fija un commit concreto de llama.cpp (`cd959bae99ff4bed22bef2604f45241c09bbb8c8`), lo que facilita reproducir resultados en entornos CI.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de la cuantizacion frente a su pasada BF16 en transformers, sobre 16.288 posiciones de texto en ingles y coreano:

| Cuantizacion | Tamano | KL medio vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| IQ4_XS | 16,88 GB | 0,0868 | 87,80% |
| IQ4_XS-imat | 16,71 GB | 0,0845 | 88,34% |

No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para esta version GGUF ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB solo para los pesos en IQ4_XS o IQ4_XS-imat; hay que anadir el espacio para el contexto KV cache, que crece con la ventana configurada (el ejemplo usa 8192 tokens).
- GPU recomendadas: RTX 4090 (24 GB) o superiores para carga completa en GPU; A100 y H100 son viables con holgura, aunque el modelo es pequeno para esas tarjetas.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto moderado; en tarjetas de 16 GB probablemente requiera descarga parcial de capas a CPU o contextos muy reducidos.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con el commit indicado o posterior; no se documentan en la informacion disponible otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A nivel estructural, esta publicacion se diferencia de otras distribuciones GGUF por incluir metricas de fidelidad de cuantizacion (KL y top-1) y una variante con importance matrix, ademas de fijar un commit concreto de llama.cpp para reproducibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| GLM-4.7-Flash-GGUF (esta ficha) | ~31,2B | no disponible | MIT | GGUF (IQ4_XS, IQ4_XS-imat) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de fidelidad: la coincidencia top-1 frente a BF16 es del 87,80% (IQ4_XS) y del 88,34% (IQ4_XS-imat), lo que implica divergencias en la distribucion de probabilidad respecto al modelo original.
- Idiomas declarados limitados a ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su tasa de alucinacion.
- La licencia MIT se aplica a esta distribucion, pero el aviso `NOTICE` atribuye la autoria del modelo original; conviene revisar los terminos del modelo base zai-org/GLM-4.7-Flash antes de un uso comercial.
- Xylolabs declara no estar afiliada ni respaldada por los autores del modelo original.
- Requiere un commit concreto de llama.cpp o posterior; versiones anteriores pueden no cargar correctamente el modelo o la plantilla de chat.
- El contexto maximo no esta documentado en la informacion disponible; el ejemplo oficial usa 8192 tokens y no debe asumirse una ventana mayor sin verificacion.
- El modulo MTP incluido puede no ser aprovechado por todas las versiones o configuraciones de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Licencia en el repositorio: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
