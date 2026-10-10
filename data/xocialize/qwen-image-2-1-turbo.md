# xocialize/Qwen-Image-2.1-Turbo

## Resumen

xocialize/Qwen-Image-2.1-Turbo es un espejo (mirror) sin modificaciones del checkpoint Qwen-Image-2.1-Turbo de Qwen, publicado por el desarrollador xocialize como fuente de pesos para el port en Swift/MLX destinado a Apple Silicon (repositorio qwen-image21-swift). No es un modelo nuevo: reproduce byte a byte los ficheros que difieren del modelo base, verificados contra el hash LFS SHA-256 y el blob de git del upstream en la revision d65dbc9a7e8f6b5479e33dee6030eaab2a906509 (2026-10-09).

Se trata de un modelo de difusion texto-a-imagen de 7.115.124.736 parametros (aproximadamente 7,1 mil millones) basado en un transformer DiT de un solo flujo (single-stream) con atencion causal por bloques, reajustado mediante destilacion para generar en 8 pasos. El repositorio ocupa 14,2 GB e incluye unicamente el transformer en safetensors bf16 (2 shards), el model_index.json con la rejilla de muestreo de 8 pasos y la configuracion del scheduler; el VAE, el codificador de texto y el procesador deben cargarse por separado.

Su relevancia es doble: por un lado, la destilacion a 8 pasos reduce de forma sustancial el coste de inferencia frente a los pipelines habituales de 30 a 50 pasos; por otro, sirve como punto de entrada para ejecutar el modelo en hardware de Apple mediante MLX. La licencia es la Qwen RESEARCH LICENSE AGREEMENT, limitada a investigacion y evaluacion no comerciales, lo que condiciona cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT de difusion, single-stream, con atencion causal por bloques (block-causal); reformulado para 8 pasos |
| Parametros totales | 7.115.124.736 (transformer; dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no especifica la longitud de contexto del codificador de texto) |
| Tipos de cuantizacion | Solo bf16 en este repositorio; no se publican cuantizaciones (GGUF, fp8, int8) en la informacion disponible |
| Idiomas soportados | No disponible; el codificador de texto es Qwen/Qwen3-VL-8B-Instruct, byte a byte identico al de ese modelo |
| Licencia | qwen-research (Qwen RESEARCH LICENSE AGREEMENT), solo investigacion y evaluacion no comercial |
| Formato de pesos | safetensors bf16, 2 shards (transformer); model_index.json y scheduler/ en configuracion JSON |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo |
| Codificador de texto | Qwen/Qwen3-VL-8B-Instruct (Apache-2.0, 750/750 tensores, misma plantilla de chat); no incluido en el repositorio |
| VAE | No incluido; se recomienda el VAE fp32 de xocialize/Qwen-Image-2.1 o el del upstream Qwen/Qwen-Image-2.1 |
| Pasos de inferencia | 8 (rejilla sample_sigmas fijada en el checkpoint destilado) |
| Pipeline de diffusers | QwenImage21Pipeline |
| Tamano del repositorio | 14,2 GB |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DiT (Diffusion Transformer) de la familia Qwen-Image 2.1: un transformer de un solo flujo con atencion causal por bloques y 7,1 mil millones de parametros, que opera sobre latentes del VAE y utiliza un scheduler de flow matching (FlowMatchEulerDiscreteScheduler) con desplazamiento dinamico y el tramo terminal desactivado. La variante Turbo se ha reajustado (re-weighted) para trabajar con una rejilla de muestreo de 8 pasos concreta, almacenada en el model_index.json, que se usa de forma literal: el scheduler no la recalcula y num_inference_steps no la sobrescribe. El soporte de esa rejilla guardada requiere diffusers igual o posterior al PR #14950.

En cuanto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma directa a un modelo de difusion texto-a-imagen). Lo unico documentado es el resultado del proceso de destilacion a pocos pasos y la procedencia de los componentes: el transformer es la parte especifica del tier Turbo, mientras que el VAE procede del modelo base convertido a bf16 (mismos 238 tensores; las diferencias con el fp32 son solo de redondeo) y el codificador de texto y el procesador son identicos a los de Qwen3-VL-8B-Instruct. Este repositorio no aplica ninguna conversion adicional sobre los pesos del upstream.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) con la clase QwenImage21Pipeline de diffusers.
- Generacion en pocos pasos: la rejilla destilada permite completar la inferencia en 8 pasos del DiT.
- Edicion de imagenes: la etiqueta image-editing del repositorio indica soporte de tareas de edicion, no solo de sintesis desde cero.
- Salida con canal alfa (etiqueta rgba), es decir, generacion con transparencia.
- Ejecucion en Apple Silicon mediante el port en Swift/MLX qwen-image21-swift, que lee directamente el layout diffusers sin conversion.
- Comprension textual de las instrucciones a traves del codificador Qwen3-VL-8B-Instruct (componente externo, no incluido).
- No se documentan capacidades de tool calling, function calling, uso agentico ni razonamiento multi-paso: no es un modelo de lenguaje, sino un modelo de generacion de imagenes.
- No se documentan capacidades de audio, video ni vision de entrada mas alla de lo que habilite el codificador Qwen3-VL.

## Casos de uso

- Investigacion academica en sintesis de imagen: el modelo puede emplearse como objeto de estudio de tecnicas de destilacion a pocos pasos, comparando la rejilla de 8 pasos con pipelines de 30 a 50 pasos sobre el mismo transformer. La licencia permite este uso sin coste adicional.
- Evaluacion de cuantizaciones y tecnicas de aceleracion: dado que el transformer esta aislado en el repositorio (14,2 GB en bf16), resulta adecuado para medir el impacto de bf16, fp8 o int8 en calidad y latencia sin arrastrar el resto del pipeline.
- Generacion de recursos graficos con transparencia: la etiqueta rgba sugiere que el modelo puede producir imagenes con canal alfa, utiles para prototipos de interfaces, iconografia o composicion de capas en herramientas de diseno, siempre en un contexto de evaluacion.
- Edicion de imagenes por lotes: la etiqueta image-editing permite plantear flujos de retoque o variacion de imagenes existentes para experimentacion, por ejemplo para estudiar la estabilidad del modelo ante prompts de modificacion.
- Ejecucion local en equipos Apple: a traves del port qwen-image21-swift, el modelo puede ejecutarse en Mac con MLX, lo que facilita la experimentacion sin acceso a GPUs de datacenter para grupos que ya trabajan en el ecosistema Apple.
- Creacion de datasets sinteticos para investigacion: el modelo puede generar lotes de imagenes etiquetadas que sirvan como datos de aumento en estudios de vision por computador, con la salvedad de que la licencia restringe el uso a investigacion y evaluacion.
- Integracion en pipelines de diffusers: al cargarse con QwenImage21Pipeline y componentes externos (VAE y codificador de texto), encaja en flujos de experimentacion ya existentes basados en la libreria diffusers, incluido el uso de schedulers alternativos.
- Verificacion de reproducibilidad de checkpoints: al ser un espejo verificado por hash, puede utilizarse para auditar que los pesos del upstream no han cambiado entre revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.

- Transformer: 7.115.124.736 parametros en bf16 equivalen a unos 14,2 GB de pesos en memoria (coincide con el tamano del repositorio).
- Codificador de texto: Qwen3-VL-8B-Instruct en bf16 ocupa del orden de 16 GB adicionales, aunque no forma parte de este repositorio.
- VAE: no se especifica su numero de parametros; en la version fp32 recomendada ocupa aproximadamente 1 a 2 GB.
- VRAM estimada para el pipeline completo en bf16 (transformer + codificador de texto + VAE + activaciones): en torno a 32-40 GB, por lo que una GPU de 40 GB (A100 40 GB) queda muy justa y se recomienda A100 80 GB o H100 80 GB para trabajar con comodidad a resoluciones altas.
- GPU consumer: en una RTX 4090 (24 GB) el pipeline completo no cabe en bf16 sin estrategias de offload. Con offload secuencial o de CPU en diffusers es viable, a cambio de una latencia mayor.
- Despliegue: la via documentada es diffusers con QwenImage21Pipeline (requiere diffusers igual o posterior al PR #14950 para cargar la rejilla de 8 pasos guardada) y el port Swift/MLX para Apple Silicon. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni ComfyUI; estas opciones quedan como no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles. Como referencia estructural, el checkpoint esta destilado a 8 pasos, frente a los 30-50 pasos habituales de los pipelines de difusion, lo que reduce proporcionalmente el numero de evaluaciones del DiT.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo del que deriva. No se dispone de datos de rendimiento de alternativas de la misma categoria, por lo que las celdas sin dato se marcan como no disponibles.

| Modelo | Parametros del transformer | Pasos de inferencia | Contexto del codificador | Licencia | Componentes incluidos |
|---|---|---|---|---|---|
| xocialize/Qwen-Image-2.1-Turbo (este repositorio) | 7.115.124.736 | 8 (rejilla guardada) | No disponible (codificador Qwen3-VL-8B) | qwen-research (no comercial) | Solo transformer, model_index.json y scheduler |
| Qwen/Qwen-Image-2.1-Turbo (upstream) | No disponible (misma familia, tier Turbo) | 8 | No disponible | qwen-research | Checkpoint completo del upstream |
| Qwen/Qwen-Image-2.1 (base) | No disponible | Multitud de pasos (no destilado a 8) | No disponible | No disponible en la informacion proporcionada | Incluye VAE en fp32 |
| Qwen/Qwen3-VL-8B-Instruct | 8B (modelo de lenguaje y vision, no generativo de imagen) | No aplica | No disponible | Apache-2.0 | Modelo completo |

## Limitaciones y advertencias

- Licencia restrictiva: Qwen-Image-2.1-Turbo se distribuye bajo la Qwen RESEARCH LICENSE AGREEMENT, limitada a investigacion o evaluacion no comercial. Cualquier uso comercial exige una licencia aparte de Qwen, solicitada a traves de model-business@notice.qwencloud.com. Este espejo se redistribuye al amparo de la seccion 3 de dicho acuerdo y no concede ningun derecho adicional.
- Repositorio incompleto por diseno: no incluye vae/, text_encoder/ ni processor/. Cargarlo con diffusers exige pasar esos componentes de forma explicita; si se omiten o se usan versiones distintas, el resultado puede diferir del esperado.
- Dependencia de version de diffusers: la rejilla de 8 pasos solo se carga correctamente con diffusers igual o posterior al PR #14950. Con versiones anteriores, o forzando num_inference_steps, se pierde la configuracion con la que el modelo fue destilado y la calidad puede degradarse.
- Ausencia total de benchmarks: el autor no publica metricas de calidad, fidelidad al prompt ni comparativas con otros modelos, por lo que no es posible estimar su rendimiento relativo a partir de la informacion disponible.
- Riesgo de artefactos y sesgos: los modelos de difusion texto-a-imagen pueden reproducir sesgos presentes en sus datos de entrenamiento (representacion de personas, estereotipos culturales) y generar contenido inexacto o no fiel al prompt. No se documenta ningun proceso de mitigacion en la informacion proporcionada.
- Idioma: no se especifican los idiomas soportados. Aunque el codificador de texto es Qwen3-VL-8B-Instruct, no hay confirmacion de cobertura multilingue ni de calidad por idioma en este pipeline.
- Naturaleza de espejo: no se trata de un modelo entrenado por el autor del repositorio, sino de una copia verificada por hash. Cualquier actualizacion, correccion o soporte proviene del upstream, no de este repositorio.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad que haya validado su funcionamiento en distintos entornos.
- Compatibilidad: el uso esta orientado a diffusers y a MLX/Swift en Apple Silicon. No se documentan rutas de despliegue en otros servidores de inferencia, lo que limita las opciones en produccion incluso dentro del ambito de investigacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xocialize/Qwen-Image-2.1-Turbo
- Modelo upstream: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo base y fuente del VAE en fp32: https://huggingface.co/xocialize/Qwen-Image-2.1
- Modelo base upstream (VAE en fp32): https://huggingface.co/Qwen/Qwen-Image-2.1
- Codificador de texto y procesador: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Port en Swift/MLX para Apple Silicon: https://github.com/xocialize/qwen-image21-swift
- Pull request de diffusers con el soporte de la rejilla guardada: https://github.com/huggingface/diffusers/pull/14950
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada.
