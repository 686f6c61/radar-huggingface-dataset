# Yuyang-z/rbdj-tsc-sc37815-s40k

## Resumen

`rbdj-tsc-sc37815-s40k` es un checkpoint de un modelo del mundo (world model) para robotica de manipulacion, publicado por el usuario Yuyang-z en HuggingFace. No es un modelo de lenguaje: es un modelo generativo condicionado por acciones que predice video multi-vista y estado de un brazo robotico ARX X5 dentro del simulador RoboDojo. Concretamente, se trata del ajuste fino supervisado (SFT) de tipo *episode-chain* sobre la arquitectura `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`, un transformer de difusion/flow matching de doble flujo (video y accion) de aproximadamente 5 B de parametros, derivado del preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal`.

El checkpoint corresponde a `epoch_41_step_40000` con pesos en crudo (fp32 consolidado, 17,9 GB de repositorio), inicializado desde el preentrenamiento `SANA_RoboDojo_EpisodeChain_SFT_obsstatecausal37815_kef8n`, que a su vez parte de `.../SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws256/epoch_3_step_37815`. La receta de datos trabaja con episodios completos desde su primer fotograma, en ventanas de 4 a 49 chunks de 32 acciones absolutas del efector final (EEF) a 25 fps, con tres vistas de 256x320 y latentes de LTX-2.3.

Su relevancia es acotada pero especifica: los modelos del mundo accion-condicionados son la pieza central de las tecnicas de entrenamiento en imaginacion, evaluacion de politicas y aumento de datos para robotica. Este repositorio es, sin embargo, un artefacto de investigacion sin model card explicativa, sin licencia declarada, sin benchmarks publicados, con cero descargas y sin formato de pesos estandar (solo un `.bin` consolidado de FSDP), por lo que su evaluacion independiente requiere la herramienta propietaria del autor (`XPolicyLab`, tarea `SANA_WAM_TSC`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion / flow matching con doble flujo (video + accion), atencion con sub-atencion, acondicionamiento de camara multivista y esquema "self-flow"; clase `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36` |
| Parametros totales | ~5 B (deducido del sufijo `_5B_` del nombre de clase; no confirmado de forma explicita en la model card) |
| Parametros activos | No disponible (la informacion no describe una arquitectura MoE) |
| Longitud de contexto | No aplica contexto de texto. Ventana de episodio de L = 4..49 chunks de 32 acciones absolutas (hasta 1568 pasos, ~62,7 s a 25 fps) |
| Tipos de cuantizacion | No disponible. Los pesos se publican en fp32 consolidado; no se documentan GGUF, int8 ni int4 |
| Idiomas soportados | No disponible (no es un modelo linguistico; el nombre de clase sugiere un codificador de texto tipo Qwen, sin confirmar) |
| Licencia | No disponible (ni la model card ni los metadatos del repositorio la indican) |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS`. Sin safetensors ni GGUF |

Configuracion de inferencia documentada por el autor:

| Parametro | Valor |
|---|---|
| CFG de video | 6 |
| CFG de accion | 1 |
| Pasos de muestreo | 10 |
| Flow shift (video / accion) | 5 / 1 |
| Prefijado | Ultimo chunk de la ventana de episodio con el prefijo limpio precargado (`prefix_cache` de sana-rwm) |
| Horizonte del softmax sink | 7 |
| Dropout de instruccion (entrenamiento) | 0,1 |
| Herramienta de despliegue | `XPolicyLab`, tarea `SANA_WAM_TSC` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de flujo (flow matching) con dos flujos acoplados: uno de video y otro de accion. El nombre de clase indica atencion con sub-atencion (`SubAttn`), un esquema de auto-flujo (`SelfFlow`), acondicionamiento de camara (`CameraCondition`), soporte multivista (`MultiView`) y un bloque de observacion (`obs-block`) con dos flujos (`TwoStream`). El sufijo `_P1_D36` sugiere un unico estadio de prediccion y una profundidad de 36 bloques, aunque este extremo no se detalla en la informacion disponible. La generacion de video se realiza en el espacio latente de un VAE LTX-2.3, comun en modelos de video recientes, lo que reduce el coste de modelar fotogramas de 256x320.

El entrenamiento es un SFT sobre cadenas de episodios de RoboDojo, con ventanas que abarcan episodios completos desde el primer fotograma (L de 4 a 49 chunks de 32 acciones absolutas del EEF a 25 fps, tres vistas de 256x320, latentes de LTX-2.3). Se usan los prompts de token-group del preentrenamiento con dropout de instruccion de 0,1 y la normalizacion propia de la receta de cadenas, cuyo hash sha256 empieza por `1fe3b7e7`. El checkpoint publicado es el paso 40000 de la epoca 41, inicializado desde un preentrenamiento que a su vez partio de `epoch_3_step_37815` del modelo `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws256`. No se documentan en la informacion proporcionada el volumen total de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (en un modelo de mundo de robotica no serian el mecanismo habitual).

## Capacidades

- Prediccion de video multi-vista condicionada por acciones: dado un prefijo de observaciones y una secuencia de acciones, genera los fotogramas futuros de tres camaras a 256x320.
- Modelado de acciones continuas del efector final: chunks de 32 acciones absolutas por paso, a 25 fps, en ventanas de 4 a 49 chunks.
- Rollout largo por episodios: la receta de *episode-chain* permite predecir ventanas que cubren episodios completos, no solo tramos cortos.
- Prefijado de contexto limpio: el modo `prefix_cache` permite avanzar autoregresivamente reutilizando el prefijo ya generado.
- Acondicionamiento por instruccion: los prompts de token-group del preentrenamiento se conservan en el SFT, con dropout de instruccion durante el entrenamiento.
- Acondicionamiento de camara y consistencia multivista, segun el nombre de clase (`CameraConditionMultiView`).
- Control de la generacion mediante classifier-free guidance independiente para video y accion.
- No dispone de capacidad de generacion de texto, dialogo, codigo ni tool calling: no es un LLM y no se documenta ninguna de esas funciones.

## Casos de uso

- Aumento de datos para imitacion visual: generar rollouts sinteticos de episodios completos sobre el simulador RoboDojo para ampliar el conjunto de demostraciones de un brazo ARX X5 antes de entrenar una politica VLA.
- Evaluacion de politicas en imaginacion: sustituir parte de la simulacion fisica por la prediccion del modelo del mundo, ejecutando una politica candidata contra el modelo y midiendo exito o desviacion respecto a la trayectoria esperada, con un coste muy inferior al de renderizar el simulador.
- Planificacion basada en modelo (MPC / model-based RL): muestrear varias secuencias de acciones de 32 pasos, predecir sus consecuencias con CFG de accion a 1 y 10 pasos de muestreo, y seleccionar la que minimiza un coste definido sobre las vistas generadas.
- Deteccion temprana de fallos de manipulacion: comparar el rollout predicho con la observacion real; una divergencia sostenida en las tres vistas actua como senal de anomalia o de agarre fallido.
- Pruebas de robustez ante cambios de punto de vista: gracias al acondicionamiento de camara, evaluar como cambia la prediccion al variar la vista, antes de decidir la configuracion de camaras de un montaje real.
- Curriculo de horizontes largos: usar ventanas de 49 chunks para estudiar la degradacion de la prediccion a lo largo de ~60 s y fijar el horizonte seguro de reutilizacion del modelo en un bucle de control.
- Comparacion de checkpoints de la misma receta: el repositorio incluye `metadata.pth`, `RUN_ID.json` y `SHA256SUMS`, lo que facilita reproducir y contrastar pasos de entrenamiento de la cadena de SFT.
- Analisis de sensibilidad a hiperparametros de muestreo: barrido sistematico de los flow shifts (5 para video, 1 para accion) y del CFG de video, dado que el autor documenta una configuracion concreta pero no su justificacion empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de prediccion (PSNR, LPIPS, FVD), de error de estado, ni de tasa de exito de politicas entrenadas sobre el modelo. Tampoco se aportan comparaciones con otros world models.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del tamano del repositorio (17,9 GB) y del tipo de carga de trabajo; el autor no publica requisitos.

- Pesos: ~5 B de parametros. En fp32 ocupan ~20 GB (el `.bin` consolidado pesa 17,9 GB); en bf16, ~10 GB; en int8, ~5 GB. No se distribuyen versiones cuantizadas.
- Memoria de activaciones: es el factor dominante, no los pesos. Tres vistas de 256x320 con ventanas de hasta 49 chunks y 10 pasos de muestreo implican una secuencia latente muy larga; se estima necesario un acelerador de 40-80 GB para ventanas completas.
- GPU recomendadas: A100 80 GB o H100 80 GB para la ventana maxima (49 chunks). Para ventanas cortas (4-8 chunks) podria ser viable una RTX 4090 de 24 GB en bf16 con atencion eficiente y gestione de memoria.
- GPU de consumo: no se puede confirmar que quepa en 24 GB para el caso de uso nominal; solo seria realista con ventanas reducidas y posiblemente con offload de CPU.
- Opciones de despliegue: la unica ruta documentada es `XPolicyLab` con la tarea `SANA_WAM_TSC`. No hay soporte declarado en vLLM, TGI, llama.cpp u Ollama: son servidores de LLM y este es un modelo de difusion de video con entradas de accion, por lo que no aplican directamente. Tampoco se publican scripts de inferencia en el repositorio.
- Latencia y throughput: no disponibles. Como referencia estructural, 10 pasos de muestreo con CFG de video 6 implican del orden de decenas de evaluaciones del transformer por chunk generado, lo que situa la generacion de un episodio completo en el rango de minutos en una A100, sin que exista medicion publicada.
- Almacenamiento: 17,9 GB de repositorio, mas el VAE LTX-2.3 y el codificador de texto que el pipeline necesite, no incluidos en este repositorio.

## Comparativa con modelos similares

No hay datos publicados de este checkpoint que permitan una comparacion cuantitativa. La tabla recoge la comparacion estructural; las celdas sin datos verificables se marcan como no disponibles.

| Modelo | Categoria | Parametros | Ventana / contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `rbdj-tsc-sc37815-s40k` (este) | World model accion-condicionado, video multivista | ~5 B (deducido) | 4-49 chunks de 32 acciones (~62,7 s a 25 fps) | No disponible | Checkpoint de investigacion, sin benchmarks ni descargas |
| NVIDIA Cosmos (familia de world foundation models) | World model / generacion de video para robotica y conduccion | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Publico, con documentacion y evaluaciones propias |
| NVIDIA GR00T N1 | Politica VLA (predice acciones, no observaciones) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Publico |
| SANA (familia base del preentrenamiento) | Backbone de difusion para generacion de imagenes y video | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Publico |

Nota metodologica: la comparacion directa con Cosmos o GR00T N1 no es homogenea, porque este modelo predice observaciones futuras condicionadas por acciones (world model), mientras que un VLA predice acciones. La comparacion relevante seria contra otros world models accion-condicionados, para los que no se dispone de resultados en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada de calidad de prediccion, error de estado ni exito posterior de politicas; no se puede afirmar que el modelo sea util sin evaluacion propia.
- Licencia no declarada: sin licencia explicita no hay permiso claro de uso comercial ni de redistribucion. Es un bloqueo para produccion.
- Dominio muy restringido: entrenado sobre RoboDojo con un brazo ARX X5, tres vistas de 256x320 y acciones absolutas del EEF a 25 fps. No hay evidencia de transferencia a robot real ni a otras morfologias, camaras o frecuencias.
- Deriva en horizontes largos: aunque la receta cubre episodios de hasta 49 chunks con un softmax sink de horizonte 7, la prediccion de video autorregresiva tiende a acumular error; el analisis analogo a la alucinacion en LLM seria la generacion de fisicas plausibles pero incorrectas (objetos que se atraviesan, agarres que no se cierran).
- Formato de pesos no estandar: un unico `pytorch_model_fsdp.bin` consolidado en fp32, sin safetensors ni GGUF. Requiere cargarlo con codigo propio o con la herramienta del autor, y consume ~20 GB solo en pesos.
- Dependencia de la herramienta `XPolicyLab` y de la tarea `SANA_WAM_TSC`: no se documenta la interfaz, el contrato de entrada/salida ni la version necesaria.
- Dependencias externas no incluidas: VAE de LTX-2.3 y, presumiblemente, un codificador de texto Qwen, no presentes en el repositorio.
- Reproducibilidad parcial: el repositorio incluye `normalization/` y `episode_chain_contract.json`, pero los datos RoboDojo y el preentrenamiento referenciado no estan enlazados en la informacion disponible.
- Riesgo de sesgo de simulador: el modelo aprende las particularidades visuales y fisicas de RoboDojo; no debe tratarse como predictor de dinamica real.
- Senales de baja validacion externa: cero descargas, cero likes, autor unico y ausencia de model card narrativa. La fecha de creacion indicada (2026-10-26) resulta ademas inconsistente con la cronologia esperada y conviene verificarla.
- Requisito de hardware elevado para lo que es: no cabe de forma fiable en GPU de consumo para el caso de uso nominal de episodios completos.

## Enlaces

- HuggingFace: https://huggingface.co/Yuyang-z/rbdj-tsc-sc37815-s40k
- No se han proporcionado en la informacion disponible enlaces a papers, blogs, repositorios de codigo, demos ni a las dependencias citadas (`SANA`, `LTX-2.3`, `RoboDojo`, `XPolicyLab`, preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws256`).
