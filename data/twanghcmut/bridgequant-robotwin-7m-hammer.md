# twanghcmut/bridgequant-robotwin-7m-hammer

## Resumen

bridgequant-robotwin-7m-hammer es un modelo de vision-lenguaje-accion (VLA) de muy pequeno tamano (6.628.787 parametros, aproximadamente 6,6 millones) desarrollado por el usuario twanghcmut. Esta especializado en una unica tarea robotica de manipulacion: golpear un bloque con un martillo (`beat_block_hammer`) dentro del benchmark de simulacion RoboTwin 2.0. No es un modelo de proposito general, sino un checkpoint de investigacion entrenado para validar la arquitectura BridgeQuant en tareas de imitacion robotica.

El modelo se ha entrenado con 50 demostraciones limpias sobre una configuracion de robot Aloha-AgileX de 14 grados de libertad, usando articulaciones relativas del brazo. Alcanza una tasa de exito de 40 sobre 100 en el ajuste limpio de RoboTwin 2.0 cuando se sirve mediante el protocolo de servidor de politicas XPolicyLab (`scripts/robotwin_policy_server.py`). Su relevancia es acotada: sirve como referencia reproducible para quien investigue cuantizacion aplicada a politicas VLA o quiera replicar el pipeline BridgeQuant en RoboTwin.

La licencia es `other` (no estandar), el repo pesa 0,0 GB y no tiene descargas ni likes en el momento de la consulta. No se dispone de informacion sobre idiomas soportados ni sobre resultados de benchmarks mas alla del dato de exito en la tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) BridgeQuant, etiqueta `bridgequant_async_vla` |
| Parametros totales | 6.628.787 (aprox. 6,6 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del modelo sugiere cuantizacion, pero no se detalla en la informacion) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json` y `train_config.yaml` |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una politica VLA de la familia BridgeQuant (`bridgequant_async_vla`), pensada para mapear observaciones visuales y estado del robot a acciones de control. El checkpoint esta entrenado sobre el entorno RoboTwin 2.0, en la tarea `beat_block_hammer`, con 50 demostraciones limpias y un espacio de accion de 14 dimensiones correspondiente a la plataforma Aloha-AgileX, usando articulaciones relativas del brazo. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset mas alla de esas 50 demos, ni si se aplicaron tecnicas de RLHF o DPO.

El bundle de artefactos (`model.safetensors`, `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json`) es el que espera la funcion `load_trainable_weights` del codigo asociado. El `train_config.yaml` es el mismo YAML de experimento que se usa para evaluacion y despliegue, lo que facilita la reproducibilidad entre entrenamiento y servicio. No se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos) en la informacion disponible.

## Capacidades

- Control robotico de manipulacion: genera acciones de 14 dimensiones para el robot Aloha-AgileX en la tarea `beat_block_hammer`.
- Percepcion visual y comprension de instrucciones: al ser un modelo VLA, procesa observaciones visuales junto con el estado del robot para producir acciones.
- Ejecucion de politica de imitacion: reproduce comportamientos aprendidos de 50 demostraciones limpias.
- Servicio mediante protocolo de servidor de politicas: compatible con XPolicyLab a traves de `scripts/robotwin_policy_server.py`.
- Carga de pesos entrenables: integrable con `load_trainable_weights` del repositorio bridgequant-async.
- No se documentan capacidades de generacion de texto general, codigo, matematicas, tool calling, agentes multi-paso ni multilingue.

## Casos de uso

- Evaluacion reproducible en RoboTwin 2.0: usar el checkpoint con el YAML de experimento y el servidor de politicas para reproducir la tasa de exito 40/100 en el ajuste limpio y comparar variantes del pipeline.
- Investigacion en cuantizacion de politicas VLA: al ser un modelo de 6,6 M de parametros, permite experimentar con esquemas de cuantizacion y medir su impacto en la tasa de exito sin grandes costes de computo.
- Pruebas de integracion del servidor XPolicyLab: sirve como politica de referencia para validar el protocolo `robotwin_policy_server.py` y el flujo de carga de bundles.
- Desarrollo de pipelines de imitacion con pocas demostraciones: el modelo demuestra que 50 demos limpias bastan para obtener una politica funcional en una tarea concreta, util como linea base en experimentos de data efficiency.
- Docencia y formacion en robotica: por su tamano reducido y su tarea acotada, es adecuado para ilustrar el ciclo completo de entrenamiento, evaluacion y despliegue de una politica VLA.
- Comparacion de arquitecturas en entornos simulados: sirve como referencia de bajo coste frente a politicas VLA de mayor tamano en la misma tarea de RoboTwin 2.0.

## Benchmarks y rendimiento

| Benchmark / tarea | Metrica | Resultado |
|---|---|---|
| RoboTwin 2.0 `beat_block_hammer` (ajuste limpio) | Tasa de exito | 40/100 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 6,6 M de parametros, el peso en precision completa ocupa del orden de decenas de MB. No se dispone de una cifra oficial en la informacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad de memoria; no se especifican modelos concretos en la informacion.
- Cabe en GPU consumer: si, por el reducido tamano del modelo.
- Opciones de despliegue: servidor de politicas XPolicyLab (`scripts/robotwin_policy_server.py`) y carga mediante `load_trainable_weights` del repositorio bridgequant-async. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas VLA de ~7 M de parametros entrenadas en RoboTwin 2.0) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo esta entrenado para la tarea `beat_block_hammer` en RoboTwin 2.0; no es un modelo de proposito general.
- Tasa de exito limitada: 40 sobre 100 en el ajuste limpio, lo que implica un 60 por 100 de fallos en la evaluacion reportada.
- Dependencia de configuracion: requiere el robot Aloha-AgileX de 14 grados de libertad con articulaciones relativas y el protocolo XPolicyLab; fuera de ese entorno su uso no esta validado.
- Licencia `other`: no se especifican los terminos exactos, por lo que el uso comercial requiere revisar las condiciones del autor antes de cualquier despliegue en produccion.
- Riesgo de sobreajuste a las 50 demostraciones limpias: el rendimiento en condiciones con ruido o variaciones del entorno no esta documentado.
- Sin informacion sobre sesgos, idiomas, alucinacion en el sentido de modelos de lenguaje ni caveats adicionales de produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/bridgequant-robotwin-7m-hammer
- Codigo: https://github.com/VLAOpt/bridgequant-async
