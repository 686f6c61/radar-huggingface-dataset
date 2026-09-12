# Travor278/pi05-pick-dual-bottles-uniform-lora-10k

## Resumen

`Travor278/pi05-pick-dual-bottles-uniform-lora-10k` es un checkpoint de politica robotica de tipo vision-lenguaje-accion (VLA) obtenido mediante un ajuste fino con LoRA sobre el modelo base PI0.5 en JAX publicado como `XinY0201/openpi-pi05-base-jax`. El autor lo distribuye dentro del ecosistema OpenPI, con el arbol completo de parametros de inferencia (base + LoRA) y los activos de normalizacion, en un repositorio de 6,3 GB. No es un modelo de lenguaje de proposito general: su salida son acciones motoras de 14 dimensiones condicionadas por imagenes de tres camaras RGB y una instruccion en lenguaje natural.

El modelo resuelve una tarea concreta de manipulacion: recoger dos botellas, tal como define el prompt nativo "Pick up two bottles." Se entreno durante 10 000 actualizaciones con batch global 16 sobre dos H100 de 80 GB, usando el dataset `Shiki42/ctr-pick-dual-bottles-uniform-20260911` (100 episodios, 23 503 fotogramas a 25 FPS). El resultado es un checkpoint especializado en un unico entorno, horizonte de accion 50 y acciones absolutas sin conversion de unidades tipo Aloha.

Su relevancia es practica para investigacion en robotica: sirve como ejemplo reproducible de ajuste LoRA (rango/alpha 16 en PaliGemma, 32 en el action expert) sobre una base PI0.5, con puertas de validacion de tokenizer, decoder y guardado/carga en CPU verificadas, hashes incluidos y sin ninguna afirmacion publicada de tasa de exito en rollout.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) PI0.5 con backbone PaliGemma y un unico action expert estandar; ajuste LoRA en JAX (segun model card) |
| Parametros totales | no disponible (el repositorio de pesos base+LoRA ocupa 6,3 GB) |
| Parametros activos | no aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento uso bf16 en activaciones y pesos congelados y float32 en pesos entrenables |
| Idiomas soportados | no disponible (la unica instruccion documentada es el prompt nativo en ingles "Pick up two bottles.") |
| Licencia | no disponible |
| Formato de pesos | checkpoint Orbax de OpenPI (JAX); la raiz de checkpoint es `10000/` |
| Rango y alpha de LoRA | 16 en PaliGemma, 32 en el action expert |
| Horizonte de accion | 50 pasos, con pad 32 |
| Dimension de estado/accion | 14 (acciones y estado absolutos, sin conversion Aloha ni delta) |
| Entradas sensoriales | Tres camaras RGB, preprocesado estandar 224x224 |
| Tamano del repositorio | 6,3 GB |
| Libreria declarada | openpi |
| Tarea declarada (pipeline) | robotics |

## Arquitectura y entrenamiento

La model card describe un ajuste LoRA sobre un checkpoint base PI0.5 "fresco y original" (`XinY0201/openpi-pi05-base-jax`, commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`), con un unico action expert estandar. El filtro de referencia incluye las proyecciones y la torre de vision como modulos entrenables dentro del esquema LoRA, con rango/alpha 16 en el componente PaliGemma y 32 en el action expert. Los pesos congelados y las activaciones se mantienen en bf16, mientras que los pesos entrenables se guardan en float32.

El entrenamiento se ejecuto sobre dos NVIDIA H100 de 80 GB, con batch global 16, semilla 87431 y 10 000 actualizaciones. El optimizador fue AdamW (beta1 = 0,9, beta2 = 0,95, epsilon = 1e-8, weight decay = 1e-10, grad clipping 1, sin EMA) siguiendo un plan coseno fijo de 30 000 pasos con 1000 de warmup, pico 2,5e-5 y valor final 2,5e-6, detenido en el paso 10 000. El dataset de entrenamiento contiene 100 episodios y 23 503 fotogramas a 25 FPS, sin mascara de reposo (idle mask) y sin conversion de unidades. Antes del envio a GPU se validaron estadisticas especificas del dataset, el decoder/tokenizer real y las pruebas de guardado y recarga en CPU; tras el entrenamiento se verifico que los arboles de parametros y de optimizador fuesen finitos y que el paso de optimizador fuese 10000. El directorio `10000/experiment/` documenta inventario de entorno y paquetes, configuracion resuelta, commit y parche de codigo fuente, afinidad de GPU, manifiestos fijados de dataset y base, normalizacion, puertas de validacion e historial.

## Capacidades

- Generacion de acciones motoras de 14 dimensiones para control de robot a partir de observaciones visuales y una instruccion textual.
- Percepcion multimodal mediante tres camaras RGB con preprocesado 224x224.
- Ejecucion de la tarea especifica de recoger dos botellas, con el prompt nativo "Pick up two bottles.".
- Prediccion de trayectorias con horizonte de accion de 50 pasos (con pad 32), adecuada para control en bucle cerrado o abierto.
- Inferencia con el arbol de parametros base + LoRA ya fusionado en el checkpoint, sin necesidad de aplicar el adaptador por separado.
- Normalizacion de observaciones y acciones incluida en el propio checkpoint (`normalization assets`).
- Trazabilidad completa de entrenamiento: hashes, recibos, configuracion resuelta y registro de puertas de validacion.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): vision si (tres camaras RGB); audio y modo thinking, no disponibles.

## Casos de uso

- Manipulacion robotica de recogida multiple: el checkpoint esta especializado en recoger dos botellas simultaneamente a partir de tres vistas RGB, por lo que puede emplearse directamente como politica de control en la celda o entorno para el que se recogieron los datos.
- Punto de partida para ajustes LoRA propios: al incluir el arbol completo base+LoRA y los activos de normalizacion, sirve como inicializacion para reentrenar con un dataset nuevo cambiando unicamente el prompt y las estadisticas de normalizacion.
- Reproduccion de experimentos de robotica: la carpeta `10000/experiment/` documenta configuracion resuelta, commit de codigo, afinidad de GPU y manifiestos fijados, lo que permite replicar el entrenamiento en otra infraestructura.
- Estudio de hiperparametros de LoRA en VLA: el uso de rango/alpha 16 en PaliGemma y 32 en el action expert permite comparar configuraciones alternativas manteniendo fijo el resto del pipeline.
- Evaluacion de pipelines de datos con acciones absolutas: el dataset no aplica conversion de unidades Aloha ni mascara de reposo, por lo que es util para validar que una cadena de preprocesado respeta acciones absolutas de 14 dimensiones.
- Pruebas de integracion con el runtime OpenPI: el checkpoint esta pensado para cargarse con la raiz Orbax `10000/`, lo que permite verificar la compatibilidad de un despliegue OpenPI/JAX antes de invertir en entrenamientos largos.
- Generacion de datos sinteticos de trayectorias: las predicciones de 50 pasos pueden usarse para aumentar datos de imitacion en simulacion antes de trasladar la politica a un robot real.
- Auditoria de seguridad previa a produccion: al no existir ninguna afirmacion de tasa de exito, este checkpoint es adecuado como objeto de evaluacion offline (comparacion accion predicha frente a accion registrada) mas que como controlador final sin validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "No rollout success-rate claim", es decir, el autor no declara ninguna tasa de exito en rollout real ni en simulacion. Tampoco se proporcionan metricas de error de accion, MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a un modelo de accion robotica.

## Requisitos de hardware

- Entrenamiento documentado: dos NVIDIA H100 de 80 GB, batch global 16 durante 10 000 actualizaciones.
- Almacenamiento: 6,3 GB para el repositorio de pesos base+LoRA de inferencia. El estado del optimizador no se incluye (se conserva en la plataforma de entrenamiento).
- VRAM de inferencia: no disponible de forma explicita. Estimacion orientativa (no confirmada por el autor): un checkpoint bf16 de este tamano requiere al menos varios gigabytes solo para pesos, a los que hay que sumar activaciones, buffers de las tres camaras RGB a 224x224 y el estado de inferencia del action expert.
- GPU recomendadas: no disponibles. Por el tipo de carga y el precedente de entrenamiento con H100, el entorno natural de ejecucion son GPU de datacenter (A100/H100 o equivalentes); no hay confirmacion de funcionamiento en GPU de consumo.
- Cabe en GPU de consumo: no disponible. No se documenta soporte para RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: el unico camino documentado es el runtime OpenPI con checkpoint Orbax en JAX (el autor indica que la plataforma NGC PyTorch 25.02 ejecuta un runtime JAX construido por separado). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint, que ademas no son aplicables a un modelo de accion robotica.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por paso de control ni de frecuencia de inferencia.
- Dependencias de entorno: runtime JAX distinto del contenedor PyTorch sobre el que se ejecuta; la model card advierte que no se reclama identidad con el runtime archivado de CTR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-pick-dual-bottles-uniform-lora-10k` | no disponible | no disponible | sin datos publicados; sin afirmacion de tasa de exito | no disponible | HuggingFace, 0 descargas, 0 likes |
| `XinY0201/openpi-pi05-base-jax` (base PI0.5 en JAX) | no disponible | no disponible | no disponible | no disponible | HuggingFace (base del ajuste) |
| Otros VLA de robotica (por ejemplo, familias OpenVLA o GR00T) | no disponible | no disponible | no disponible | no disponible | no se encontro informacion comparable en la busqueda realizada |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables: los unicos resultados obtenidos fueron paginas de Pinterest, sin relacion con robotica ni con modelos VLA. La unica comparacion documentada es la del propio checkpoint frente a su base, del que difiere unicamente por el adaptador LoRA y los activos de normalizacion especificos del dataset.

## Limitaciones y advertencias

- Licencia no especificada. No se puede asumir uso comercial libre; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluacion publicada: la model card declara explicitamente que no se reclama ninguna tasa de exito en rollout. Cualquier uso real exige una evaluacion propia.
- Especializacion extrema: el modelo esta ajustado para una unica tarea ("Pick up two bottles.") en un unico entorno, con un prompt nativo fijo en ingles.
- Dataset pequeno: 100 episodios y 23 503 fotogramas, sin mascara de reposo ni conversion de unidades. El riesgo de sobreajuste a la iluminacion, disposicion de camaras y posiciones concretas del montaje de recogida de datos es alto.
- Idiomas soportados no disponibles: al ser una politica condicionada por lenguaje, el comportamiento ante instrucciones en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion de acciones: como modelo de politica, puede generar trayectorias plausibles pero fisicamente invalidas o inseguras ante observaciones fuera de distribucion.
- Sin estado del optimizador en el repositorio: el checkpoint sirve para inferencia y para reiniciar ajustes LoRA, pero no para reanudar exactamente el entrenamiento original tal cual.
- Dependencia fuerte del ecosistema OpenPI/JAX y de la raiz Orbax `10000/`; no hay pesos en safetensors ni GGUF, lo que limita la portabilidad a otras pilas de inferencia.
- Advertencia de entorno: la model card indica que la plataforma NGC PyTorch 25.02 ejecuta un runtime JAX construido aparte y que no se reclama identidad con el runtime archivado de CTR, por lo que pueden aparecer discrepancias entre entornos.
- Riesgo de seguridad fisica: cualquier integracion en un robot real debe acompanarse de limites de par, paradas de emergencia y validacion en entorno controlado antes de operar cerca de personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-uniform-lora-10k
- Modelo base PI0.5 en JAX: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-uniform-20260911
- Identificador de trabajo de entrenamiento reportado: `job-2fea0cb4-8ca2-427b-a2d8-4a62851295cb`
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relevantes).
