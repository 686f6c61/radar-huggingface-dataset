# ulasZoi/smolvla_pickcube_bs64_camera2_LORA

## Resumen

`ulasZoi/smolvla_pickcube_bs64_camera2_LORA` es una politica de robotica (vision-language-action, VLA) entrenada por el usuario ulasZoi mediante LeRobot y publicada en HuggingFace. Se trata de un ajuste fino del modelo base `lerobot/smolvla_base`, la implementacion de SmolVLA descrita en el paper arXiv:2506.01844, un modelo VLA compacto y eficiente que, segun su model card, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo.

El modelo resuelve una tarea de manipulacion concreta: "pick up the cube" (coger el cubo), sobre un brazo `so_follower` (familia SO-100/SO-101 de bajo coste) con dos camaras de entrenamiento declaradas como `front`/`camera1`-`camera2`. Consume un estado de 6 dimensiones y varias imagenes de 256x256 y 480x640, y produce un vector de accion de 6 dimensiones, a una frecuencia de captura de 30 FPS.

Su relevancia es practica: sirve como ejemplo reproducible de flujo completo de imitation learning con LeRobot 0.6.2 (243 episodios, 76.011 frames, 25.000 pasos de entrenamiento con AdamW, batch 64, lr 0,001), y como posible punto de partida para experimentar con ajuste fino tipo LoRA —el nombre del repositorio sugiere LoRA, aunque el model card no lo confirma— sobre una base VLA disenada para hardware asequible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); ajuste fino de SmolVLA (arXiv:2506.01844). El model card no detalla la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana de observaciones estado + imagenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible; el modelo ejecuta instrucciones de tarea cortas (p. ej. "pick up the cube"), no conversacion multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256); `observation.images.empty_camera_0/1` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | ulasZoi/smolvla_pickcube_all (243 episodios, 76.011 frames, 30 FPS) |
| Version de LeRobot | 0.6.2 |
| Tarea entrenada | "pick up the cube" |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El model card identifica el modelo como SmolVLA, un VLA compacto y eficiente descrito en el paper arXiv:2506.01844, y remite a ese trabajo para los detalles de arquitectura. No se especifican en la informacion disponible el numero de parametros, el tipo de backbone de vision-lenguaje ni el mecanismo de generacion de acciones. Tampoco se indica si se aplico RLHF, DPO o algun otro ajuste por preferencias, algo poco habitual en politicas de imitacion robotica.

Los datos de entrenamiento son exclusivamente el dataset `ulasZoi/smolvla_pickcube_all`: 243 episodios, 76.011 frames grabados a 30 FPS, una unica tarea ("pick up the cube"). La configuracion reportada es de 25.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 0,001, semilla 1000 y LeRobot 0.6.2. El nombre del repositorio incluye "LORA" y "camera2", lo que sugiere un ajuste con adaptadores de bajo rango y una configuracion de dos camaras, pero el model card no documenta ni el rango de LoRA, ni los modulos adaptados, ni que entradas visuales se usaron realmente frente a las declaradas.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones para un brazo `so_follower` (5 articulaciones mas pinza, segun la forma del estado y de la accion).
- Control reactivo guiado por vision: consume imagenes de 256x256 y 480x640 junto al estado articular para producir la siguiente accion.
- Ejecucion de una tarea de manipulacion especifica: coger un cubo ("pick up the cube").
- Imitation learning end-to-end: reproduce la politica aprendida de 243 episodios de demostracion a 30 FPS.
- Integracion con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades conversacionales, vision general, audio ni modo de pensamiento: es una politica robotica, no un modelo de lenguaje de proposito general.
- Capacidades multilingues: no disponibles (solo interpreta la instruccion de tarea con la que fue entrenado).

## Casos de uso

- Automatizacion de pick-and-place de laboratorio: el modelo ejecuta la secuencia de recogida de un cubo desde la posicion observada por camara, adecuado para prototipos de celda robotica de bajo coste sobre brazo SO-100/SO-101.
- Base de partida para nuevos ajustes finos: al ser un fine-tune de `lerobot/smolvla_base`, se puede reentrenar con `lerobot-train --policy.path=lerobot/smolvla_base` sobre un dataset propio; este repositorio sirve como referencia de hiperparametros (batch 64, lr 0,001, 25.000 pasos).
- Estudio comparativo de configuraciones de entrenamiento: el nombre del repo (`bs64`, `camera2`, `LORA`) permite usarlo como punto de comparacion frente a otras variantes del mismo autor sobre el mismo dataset de 243 episodios.
- Docencia e investigacion en robotica: el flujo completo (instalacion, calibracion, grabacion, entrenamiento y rollout) esta documentado en LeRobot, lo que facilita usarlo como ejemplo en cursos de imitation learning.
- Validacion de hardware asequible: al tratarse de un VLA pensado para hardware de consumo segun el model card, permite medir si una GPU no profesional sostiene inferencia a 30 FPS con dos camaras.
- Recoleccion y analisis de datos: el dataset asociado (`ulasZoi/smolvla_pickcube_all`, 76.011 frames) es visualizable con la herramienta de LeRobot, util para auditar la calidad de las demostraciones antes de reentrenar.
- Evaluacion de robustez de politicas de imitacion: se puede medir la tasa de exito ante cambios de posicion del cubo, iluminacion o distractores, un experimento que el propio model card invita a documentar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card de este repositorio indica explicitamente que todavia no se han proporcionado resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito ni comparaciones numericas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El model card de SmolVLA afirma que puede desplegarse en hardware de consumo, pero no se publican cifras de memoria ni de parametros en la informacion disponible.
- GPU recomendadas: no disponibles. El flujo de ejecucion de LeRobot usa `--policy.device=cuda` para entrenamiento (segun los comandos del model card); no se especifica modelo de GPU concreto.
- GPU de consumo: presumiblemente viable segun la afirmacion generica de SmolVLA sobre hardware de consumo, pero sin datos verificables en este repositorio.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (inferencia sin grabacion), `lerobot-train` con `--policy.device=cuda` para entrenamiento. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robotica.
- Latencia y throughput: no disponibles. La unica referencia temporal es que los datos se grabaron a 30 FPS.
- Camaras: el model card declara entradas de 256x256 (`camera1`-`camera3`) y 480x640 (`empty_camera_0`/`empty_camera_1`), mientras que el ejemplo de rollout configura camaras de 640x480 a 30 FPS; los nombres de camara deben coincidir con las claves de observacion con las que se entreno la politica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ulasZoi/smolvla_pickcube_bs64_camera2_LORA | VLA, fine-tune de SmolVLA | no disponible | 243 episodios / 76.011 frames | apache-2.0 | HuggingFace (0 descargas) |
| lerobot/smolvla_base | VLA base | no disponible | no disponible | no disponible (el repo derivado usa apache-2.0) | HuggingFace |
| Otras politicas de LeRobot (ACT, Diffusion Policy, pi0) | Politicas de imitacion | no disponible | no disponible | no disponible | HuggingFace / repositorio LeRobot |

No se dispone de datos numericos verificables (tasas de exito, parametros, contexto) para establecer una comparacion cuantitativa con alternativas de la misma categoria. Cualquier comparacion de rendimiento requeriria ejecutar evaluaciones en robot real, que este repositorio no aporta.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el model card confirma que no hay resultados de exito en robot real, por lo que no se conoce la fiabilidad de la politica en produccion.
- Especializacion extrema: entrenada para una unica tarea ("pick up the cube") sobre un unico tipo de robot (`so_follower`). No es un modelo generalista.
- Sensibilidad a la configuracion de camaras: las claves de observacion (`camera1`, `camera2`, `camera3`, `empty_camera_0`, `empty_camera_1`) deben coincidir exactamente con las del entrenamiento; el ejemplo de rollout declara solo dos camaras, lo que puede provocar desajustes de entrada.
- Posible sesgo de dominio: 243 episodios de un mismo montaje implican dependencia de la iluminacion, la posicion del cubo, el fondo y la mesa concretos de la grabacion. Se espera degradacion ante cambios de entorno.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas o inseguras ante observaciones fuera de distribucion.
- Idiomas: no disponible. La instruccion de tarea deberia formularse como en el entrenamiento ("pick up the cube"); no hay evidencia de soporte para instrucciones en castellano.
- Licencia: apache-2.0, permisiva para uso comercial. Se debe citar el metodo (SmolVLA, arXiv:2506.01844) y LeRobot (Cadene et al., 2024) segun el propio model card.
- El repositorio figura con 0,0 GB de tamano y 0 descargas, un dato inusual que sugiere que los pesos pueden estar incompletos o ser unicamente adaptadores; el model card no lo aclara. Conviene verificar la integridad de los ficheros antes de usarlo.
- Discrepancia entre el nombre del repositorio (menciona LoRA) y el model card (no documenta LoRA): no se puede confirmar el metodo de ajuste real ni su rango.
- Advertencia de seguridad: cualquier politica de robotica debe ejecutarse con limites de par, parada de emergencia y espacio de trabajo despejado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_camera2_LORA
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron paginas de un foro general sin relacion con robotica ni con SmolVLA.
