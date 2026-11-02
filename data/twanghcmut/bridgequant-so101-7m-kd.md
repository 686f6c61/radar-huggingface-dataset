# twanghcmut/bridgequant-so101-7m-kd

## Resumen

bridgequant-so101-7m-kd es un modelo de vision-lenguaje-accion (VLA) de 6,59 millones de parametros desarrollado por el usuario twanghcmut, orientado al control de un brazo robotico SO101. Se trata de un estudiante destilado a partir de un profesor de 76 millones de parametros (`twanghcmut/bridgequant-so101-76m`), entrenado sobre tres tareas de manipulacion con el brazo seguidor SO101 (159 episodios, 30 fps, camaras top y wrist, objetivos de articulacion absolutos de 6 dimensiones). El modelo se publica bajo la familia tecnica BridgeQuant, que da nombre al pipeline de cuantizacion asincrona del repositorio de codigo asociado.

La relevancia de este modelo reside en su tamano: con menos de 7 millones de parametros, esta disenado para inferencia en entornos de robotica con recursos muy limitados, donde un VLA de decenas de millones de parametros no seria viable en el bucle de control. La destilacion por conocimiento (KD) combina una perdida latente agrupada por roles (1-cos + Huber, peso 0,1) con una perdida L1 sobre la estimacion de accion limpia (peso 0,5, con annealing a 0 durante el ultimo 30% del entrenamiento).

El modelo se distribuye en formato safetensors junto con ficheros de normalizacion (`norm_stats.json`), configuracion (`bridgequant_vla.yaml`, `config.json`, `metadata.json`) y configuracion de entrenamiento (`train_config.yaml`). No se han publicado datos de benchmarks, idiomas soportados ni resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) BridgeQuant, estudiante destilado de un profesor SO101 de 76M |
| Parametros totales | 6.593.715 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el pipeline se denomina BridgeQuant, pero no se detallan los tipos soportados) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (con `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json`, `train_config.yaml`) |

## Arquitectura y entrenamiento

El modelo es un VLA (vision-language-action) de tipo BridgeQuant que actua como estudiante en un proceso de destilacion de conocimiento desde el profesor `twanghcmut/bridgequant-so101-76m` (76M de parametros). La entrada combina observaciones visuales de dos camaras (top y wrist) con el estado del robot, y la salida son objetivos de articulacion absolutos de 6 dimensiones (6-D absolute joint targets) para el brazo seguidor SO101. No se detalla en la informacion disponible la arquitectura interna exacta (tipo de transformer, codificador visual, mecanismo de atencion ni fusion multimodal).

El entrenamiento se realizo sobre tres tareas del brazo SO101 con un total de 159 episodios capturados a 30 fps. La funcion de perdida de destilacion combina dos terminos: una perdida latente agrupada por roles (role-group-pooled latent loss) con distancia coseno (1-cos) y Huber, con peso 0,1; y una perdida L1 sobre la estimacion de accion limpia con peso 0,5, que se anula progresivamente (annealing a 0) durante el ultimo 30% del entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, aunque por la naturaleza del modelo (politica robotica) estos mecanismos de alineamiento no resultan aplicables.

## Capacidades

- Control de un brazo robotico SO101 mediante prediccion de objetivos de articulacion absolutos de 6 dimensiones.
- Percepcion visual multimodal a partir de dos camaras (top y wrist).
- Politica de manipulacion entrenada para tres tareas concretas del brazo SO101.
- Inferencia de baja latencia apta para bucles de control robotico gracias a su reducido tamano (6,59M de parametros).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (el modelo no procesa lenguaje natural de forma documentada).
- No se documentan modos especiales como thinking mode, vision general, audio o generacion de texto libre.

## Casos de uso

- Control de brazo robotico SO101 en laboratorio: el modelo recibe imagenes de las camaras top y wrist y emite objetivos de articulacion de 6 dimensiones, adecuado para tareas de manipulacion replicables en un entorno controlado con 159 episodios de entrenamiento.
- Despliegue en hardware de bajos recursos: con 6,59M de parametros, puede ejecutarse en dispositivos embebidos o GPUs de gama baja dentro del bucle de control, algo inviable con el profesor de 76M.
- Investigacion en destilacion de politicas roboticas: sirve como referencia para estudiar la transferencia de conocimiento de un VLA de 76M a un estudiante de 7M mediante perdidas latentes agrupadas por roles.
- Prototipado rapido de pipelines VLA: al incluir `norm_stats.json` y ficheros de configuracion, permite integrar la politica en scripts de despliegue como `scripts/so101_policy.py` del repositorio bridgequant-async.
- Evaluacion comparativa profesor-estudiante: util para medir la degradacion de rendimiento entre el modelo de 76M y el de 7M en las mismas tres tareas del SO101.
- Docencia y experimentacion en robotica de bajo coste: su tamano y su licencia abierta (con condiciones) facilitan su uso en entornos academicos con hardware limitado.
- Base para cuantizacion y optimizacion: el pipeline BridgeQuant sugiere su uso como punto de partida para experimentos de cuantizacion asincrona en politicas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 6,59M de parametros en precision FP32 el peso de los pesos ronda los 26 MB, y en FP16 unos 13 MB, por lo que la VRAM necesaria es muy reducida, aunque no se confirma el formato de inferencia.
- GPU recomendadas: no disponibles; por tamano, cabria en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en dispositivos embebidos, pero no se documenta oficialmente.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se especifican los requisitos exactos.
- Opciones de despliegue: el repositorio oficial indica el script `scripts/so101_policy.py` y la guia `docs/so101_deploy.md`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a politicas roboticas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-so101-7m-kd | 6.593.715 | no disponible | VLA para brazo SO101 | other | HuggingFace |
| bridgequant-so101-76m (profesor) | 76M (segun model card) | no disponible | VLA para brazo SO101 | no disponible | HuggingFace (`twanghcmut/bridgequant-so101-76m`) |
| Otros VLA roboticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre tres tareas del brazo SO101 con 159 episodios; su generalizacion a otras tareas, brazos o entornos no esta documentada.
- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que se desconoce la degradacion respecto al profesor de 76M.
- Idiomas soportados no disponibles; el modelo no parece orientado a procesamiento de lenguaje natural.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; la model card no detalla condiciones.
- Riesgo de alucinacion y sesgos: no documentados, pero al ser una politica robotica entrenada con pocos episodios existe riesgo de sobreajuste a las condiciones de captura (iluminacion, posiciones, objetos).
- El fichero `train_config.yaml` contiene rutas al profesor que solo son necesarias para entrenamiento; la inferencia las ignora, pero pueden confundir en un despliegue mal configurado.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no debe emplearse como modelo de lenguaje general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-so101-7m-kd
- Modelo profesor: https://huggingface.co/twanghcmut/bridgequant-so101-76m
- Codigo: https://github.com/VLAOpt/bridgequant-async
- Script de politica: `scripts/so101_policy.py` (dentro del repositorio de codigo)
- Guia de despliegue: `docs/so101_deploy.md` (dentro del repositorio de codigo)
