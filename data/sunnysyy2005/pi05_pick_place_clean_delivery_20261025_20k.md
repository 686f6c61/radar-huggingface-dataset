# SUNNYsyy2005/pi05_pick_place_clean_delivery_20261025_20k

## Resumen

π0.5 Piper pick-and-place — delivery, 20k es un checkpoint de politica robotica de extremo a extremo (visuomotor policy) publicado por el usuario SUNNYsyy2005 dentro del proyecto bimanual-vla. Se trata de un ajuste fino del modelo base OpenPI π0.5 de Physical Intelligence sobre un dataset propio de demostraciones reales, orientado a una unica tarea de pick-and-place bimanual: coger un contenedor pequeno de plastico azul y depositarlo dentro de uno grande del mismo color.

El checkpoint corresponde al paso 20.000 de entrenamiento y trabaja en espacio de efector final (EEF), con observaciones compuestas por una camara cenital y dos camaras de muneca (izquierda y derecha), un vector de estado de 20 dimensiones y una salida de accion de 14 dimensiones (brazo izquierdo seguido del derecho). Emite chunks de 50 acciones a 30 Hz, es decir, aproximadamente 1,67 segundos de trayectoria por inferencia, con soporte de Real-Time Chunking (RTC) entrenado con retardos de 0 a 12.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general ni un modelo consumible via `transformers`, sino un artefacto de investigacion reproducible para un montaje robotico concreto (Piper bimanual). Resulta util para quien quiera estudiar el pipeline completo de OpenPI (contrato de acciones, estadisticas de normalizacion, split de episodios, despliegue cliente-servidor) o replicar el flujo de ajuste fino con vision encoder completo, action expert completo y LoRA sobre el modelo de lenguaje. No se ha publicado ninguna tasa de exito agregada, solo una demostracion de un unico rollout correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) OpenPI π0.5: codificador de vision + modelo de lenguaje (LoRA) + action expert; no disponible el detalle interno de capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; la ventana efectiva viene dada por el chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible (se publican parametros nativos en formato Orbax; no se ofrece GGUF ni cuantizaciones) |
| Idiomas soportados | en (instruccion de tarea en ingles) |
| Licencia | no disponible; la model card remite a los terminos del modelo base π0.5 de Physical Intelligence y no asigna una licencia nueva a esos pesos |
| Formato de pesos | Orbax / OCDBT nativo de JAX (no safetensors, no GGUF) |
| Paso de entrenamiento | 20.000 |
| Espacio de accion | EEF, 14D (brazo izquierdo y despues derecho) |
| Dimension del estado | 20D |
| Chunk de accion | 50 pasos a 30 Hz (aprox. 1,67 s por inferencia) |
| Entradas de vision | Camara cenital + muneca izquierda + muneca derecha, redimensionado tipo stretch |
| Convencion de pinza | 0 = cerrada, 1 = abierta |
| Split de datos | 81 episodios de entrenamiento / 9 de validacion (agrupados) |
| Tamano del repositorio | 6,5 GB |

## Arquitectura y entrenamiento

La politica sigue la receta de OpenPI π0.5: un modelo vision-lenguaje que procesa imagenes multi-camara junto con la instruccion en lenguaje natural y el estado del robot, acoplado a un action expert que genera secuencias de acciones continuas. En este ajuste fino concreto se entrenan el codificador de vision completo, el action expert completo y un adaptador LoRA sobre el modelo de lenguaje, mientras que los parametros base del modelo de lenguaje permanecen congelados. Las acciones se representan como deltas XYZ en el marco base con origen en el chunk, deltas de vector de rotacion multiplicados por la izquierda y objetivos absolutos de pinza.

El entrenamiento se ejecuto en H200 y el checkpoint se sincronizo a una maquina de servicio con 4×RTX 4090. Se activo entrenamiento con RTC, con retardos en el rango 0-12 y pesos uniformes, lo que permite al cliente consumir chunks parcialmente solapados y mantener continuidad ante latencias de inferencia o de red. El dataset de origen es `SUNNYsyy2005/pick_place_clean_delivery_20261025`, con 90 episodios agrupados en total (81/9). No se especifica en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitacion sobre demostraciones, no se documenta ninguna fase de preferencias. El checkpoint publicado es solo de pesos: no incluye estado del optimizador ni estado completo de entrenamiento, por lo que sirve para inferencia y no para reanudar el entrenamiento.

## Capacidades

- Ejecucion de una unica tarea de manipulacion bimanual: recoger un contenedor pequeno azul y colocarlo dentro de uno grande azul.
- Control en espacio de efector final con 14 dimensiones de accion (dos brazos Piper) y estado de 20 dimensiones.
- Percepcion multi-camara: vista cenital y dos vistas de muneca, con redimensionado stretch.
- Generacion de chunks de 50 acciones a 30 Hz, con ejecucion solapada compatible con RTC (retardos 0-12).
- Seguimiento de instruccion en lenguaje natural en ingles para definir la tarea.
- Soporte de inferencia cliente-servidor mediante el policy server de OpenPI integrado en bimanual-vla.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision general, audio ni modo "thinking": no es un modelo de lenguaje de proposito general.
- Capacidades multilingues: no disponibles; la unica lengua documentada es el ingles.
- No es cargable con `AutoModel.from_pretrained` de Transformers; requiere el runtime JAX/OpenPI con `PiperPi0Config`.

## Casos de uso

- Replicacion de la tarea de pick-and-place en un montaje Piper bimanual: el checkpoint se arranca en el policy server con `PiperPi0Config` y se conecta al cliente RTC, permitiendo reproducir la tarea exacta sobre la que fue entrenado con el contrato de acciones publicado.
- Investigacion en chunking en tiempo real: al estar entrenado con RTC y retardos 0-12, sirve como banco de pruebas para medir como afectan latencias de red y de inferencia a la continuidad de la trayectoria en un sistema real de 4×RTX 4090.
- Estudio de estrategias de ajuste fino eficiente: el checkpoint documenta vision encoder completo + action expert completo + LoRA en el modelo de lenguaje con el resto congelado, lo que permite analizar el coste y el rendimiento de esa combinacion frente a alternativas.
- Base para ajuste fino en tareas de entrega de objetos: al trabajar en espacio EEF con deltas relativos al marco base, es un punto de partida razonable para variantes de pick-and-place sobre contenedores con la misma morfologia de robot.
- Validacion de pipelines de datos y normalizacion: incluye `norm_stats.json` y `train_test_split.json`, utiles para verificar la reproducibilidad de la normalizacion y del split agrupado 81/9 antes de desplegar cualquier politica derivada.
- Docencia y divulgacion sobre VLA: el repositorio es autocontenido (pesos, metadatos de contrato de accion, manifiesto con checksums SHA-256), lo que facilita explicar el ciclo completo observacion-instruccion-accion en robotica de imitacion.
- Auditoria de despliegue: `release-manifest.json` y `run.json` permiten verificar integridad de ficheros y el alcance de solo inferencia declarado por el autor, util en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la demostracion en robot real adjunta es un unico ejemplo correcto y que no se reporta ninguna tasa de exito agregada de rollouts. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de robotica como tasas de exito por episodio, error de posicion o tiempos de ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 6,5 GB, pero no se desglosa el tamano de los parametros ni el pico de memoria en ejecucion.
- Entrenamiento: realizado en NVIDIA H200 segun la model card.
- Despliegue de referencia: maquina de servicio con 4×RTX 4090, a la que se sincronizo el checkpoint entrenado; no se especifica como se reparte el modelo entre las cuatro GPU.
- Viabilidad en GPU de consumo: la unica referencia es el montaje con 4×RTX 4090; no hay datos para una unica GPU de consumo ni para GPUs de gama inferior.
- Opciones de despliegue: policy server de OpenPI integrado en el proyecto bimanual-vla (JAX), con guia de instalacion y guia de cliente RTC. No compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia derivada del contrato de acciones, cada inferencia cubre 50 pasos a 30 Hz, es decir, unos 1,67 s de trayectoria; la frecuencia real de inferencia del servidor no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 Piper pick-and-place — delivery, 20k (este) | VLA afinado, tarea unica, EEF 14D | no disponible | chunk de 50 acciones a 30 Hz | no disponible (remite al modelo base) | Pesos Orbax en HuggingFace, runtime bimanual-vla |
| OpenPI π0.5 base (Physical Intelligence) | VLA generalista, preentrenado | no disponible | no disponible en esta informacion | terminos del modelo base, no detallados | Referenciado como `gs://openpi-assets/checkpoints/pi05_base` |
| OpenPI π0 (Physical Intelligence) | VLA predecesor | no disponible | no disponible en esta informacion | terminos del modelo base, no detallados | Repositorio openpi publico |

La comparacion cuantitativa no es posible con la informacion disponible: no se publican parametros, contexto ni metricas para ninguno de los tres. La diferencia documentada es cualitativa: este checkpoint esta especializado en una tarea y un montaje concretos, con ajuste fino parcial y RTC activado, mientras que los modelos base son generalistas y no incorporan el contrato de acciones especifico del robot Piper.

## Limitaciones y advertencias

- Especificidad extrema: la politica esta entrenada para una unica instruccion y un unico entorno; no se espera generalizacion a otras tareas, objetos o disposiciones sin nuevo ajuste fino.
- Ausencia de evaluacion agregada: no hay tasa de exito publicada, solo una demostracion correcta. Cualquier afirmacion de robustez carece de respaldo empirico en la informacion disponible.
- Sesgos: no documentados. Al derivar de un dataset propio de 90 episodios, hereda los sesgos de posicion, iluminacion, colores y morfologia presentes en esas demostraciones.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: al ser un modelo generativo de trayectorias, puede producir comandos fisicamente invalidos ante observaciones fuera de distribucion; se recomienda supervisión y limites de seguridad en el robot.
- Idioma: solo ingles documentado; no hay evidencia de que las instrucciones en castellano funcionen.
- Licencia: no disponible. La model card no asigna licencia nueva y remite a los terminos del modelo base π0.5, por lo que el uso comercial queda sin resolver y requiere consultar las condiciones upstream.
- Reanudacion de entrenamiento: el checkpoint contiene solo pesos, sin estado del optimizador ni estado completo; no se puede continuar el entrenamiento desde el paso 20.000 tal cual.
- Dependencia de rutas y metadatos: el runtime necesita `run.json` y `metadata/` por encima del directorio del checkpoint, y la variable `HF_LEROBOT_HOME` apuntando al dataset para resolver el ID original. Un empaquetado incorrecto rompe la carga.
- Compatibilidad: no es un modelo de Transformers ni un GGUF; no puede servirse con las herramientas habituales de LLM y exige el stack JAX/OpenPI de bimanual-vla.
- Baja traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SUNNYsyy2005/pi05_pick_place_clean_delivery_20261025_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/SUNNYsyy2005/pick_place_clean_delivery_20261025
- Repositorio bimanual-vla: https://github.com/SUNNYsyy2005/bimanual-vla
- Guia de instalacion y policy server de OpenPI: https://github.com/SUNNYsyy2005/bimanual-vla/blob/master/docs/INSTALLATION.md#9-openpi-policy-and-training-server
- Guia de despliegue con cliente RTC: https://github.com/SUNNYsyy2005/bimanual-vla/blob/master/docs/deployment/RTC_CLIENT_GUIDE.md
- OpenPI de Physical Intelligence (modelo base): https://github.com/Physical-Intelligence/openpi

Nota sobre la busqueda web: los resultados devueltos por la busqueda (lostgem.tv y similares) no guardan relacion con este modelo y se han descartado por completo; no se ha incorporado ningun dato procedente de ellos.
