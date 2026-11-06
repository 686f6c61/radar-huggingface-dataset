# tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_delta_full

## Resumen

`pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_delta_full` es un ajuste fino del modelo de robotica `lerobot/pi05_base` (pi0.5, construido sobre PaliGemma) especializado en una tarea de manipulacion con un brazo robotico SO-101 en un entorno simulado de mahjong. Lo publica el usuario `tc-huang-mahjong` como parte de su laboratorio `mahjong-lab`, y esta pensado para que un agente robotico aprenda a colocar y manipular fichas de mahjong en una estanteria (rack) concreta dentro de un simulador Isaac Lab con fisicas OvPhysX.

El modelo no es un LLM de proposito general: es una politica visomotora (vision-language-action) que recibe observaciones de camara y estado de las articulaciones, y emite acciones de control para el brazo y la pinza. Su relevancia es la de un artefacto de investigacion reproducible: documenta con detalle el comando de entrenamiento, el dataset, el commit de codigo y el esquema de preprocesado, lo que permite replicar el experimento o reutilizar la receta en otras tareas de manipulacion.

Al tratarse de un ajuste fino sobre pi0.5, hereda la arquitectura VLA de PaliGemma (vision encoder SigLIP + backbone Gemma + cabeza de accion) y la licencia Gemma. El contexto, el numero de parametros y los idiomas no se detallan en la informacion disponible; el modelo no procesa lenguaje natural de forma conversacional, sino instrucciones y observaciones dentro de un pipeline LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5 / PaliGemma (SigLIP + Gemma + cabeza de accion), ajustada con LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos entrenados en float32 con autocast bf16) |
| Idiomas soportados | no disponible (modelo de robotica, no conversacional) |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | no disponible (pesos float32 y estado del optimizador; checkpoints en ramas `step-<step>`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revision `main`), un VLA pi0.5 que combina un encoder visual PaliGemma con un backbone Gemma y una cabeza que predice acciones. El ajuste fino se realizo con LeRobot en el commit fijado `38b975c5`, usando el script `scripts/train/lerobot_train_mahjong.py` y los presets de `scripts/train/train_lerobot.sh`. El entrenamiento duro 30.000 pasos con batch de 12, precision mixta bf16, optimizador fusionado, `compile_model=true` y `scheduler_decay_steps=30000`, guardando checkpoints cada 5.000 pasos. Los pesos y el estado del optimizador se mantienen en float32.

Una innovacion destacable es el esquema de acciones relativas (`use_relative_actions=true`): el modelo predice cada articulacion del brazo relativa al estado del inicio del chunk, mientras que la pinza se predice de forma absoluta, todo normalizado con las estadisticas de dichos chunks. Ademas, el preprocesador no recorta las camaras y presenta `observation.images.front_cam` como dos vistas solapadas (`front_cam` y `front_cam_right`), cada una de 224 x 224, mediante recortes cuadrados definidos en `src/models/split_camera.py`. El dataset de entrenamiento es `tc-huang-mahjong/mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5`, generado en Isaac Lab con fisicas OvPhysX y variaciones de posicion (`detour`, `vary`, `off5`). No se especifica el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control visomotor de un brazo SO-101 en simulacion: genera comandos de articulacion y de pinza a partir de imagenes de camara y del estado del robot.
- Manipulacion de fichas de mahjong en una tarea concreta de estanteria (rack 07, con variaciones de posicion y desvio).
- Prediccion de acciones por chunks con esquema relativo para el brazo y absoluto para la pinza.
- Procesamiento de dos vistas de camara solapadas de 224 x 224 (`front_cam` y `front_cam_right`).
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue de politicas.
- No se documenta soporte de tool calling, agentes multi-paso, capacidades multilingues, thinking mode, vision general, audio ni dialogo conversacional.

## Casos de uso

- Replicacion de experimentos de VLA: el modelo sirve como referencia reproducible para validar la receta de ajuste fino de pi0.5 sobre una tarea de manipulacion con SO-101, gracias a que el autor publica comando, commit y dataset.
- Investigacion en manipulacion robotica simulada: permite estudiar el efecto de acciones relativas frente a absolutas y del preprocesado de camaras partidas en el rendimiento de la politica.
- Generacion de datos sinteticos y evaluacion en Isaac Lab: se puede usar como politica de referencia para comparar con otros checkpoints del mismo dataset o de variantes `detour`/`vary`.
- Transferencia a tareas de picking y placing: la receta de prediccion relativa del brazo y absoluta de la pinza es reutilizable en tareas de recogida y colocacion de objetos rigidos en estanterias.
- Docencia y formacion en robotica de aprendizaje: sirve como ejemplo completo de pipeline LeRobot + Isaac Lab + SO-101 para cursos practicos.
- Base para ajustes finos adicionales: al estar disponible el checkpoint completo y el estado del optimizador, se puede continuar el entrenamiento con nuevos datasets de mahjong o de otras tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un VLA basado en PaliGemma, se espera un consumo moderado, pero no hay datos publicados.
- GPU recomendadas: no disponible. El entrenamiento uso precision mixta bf16, optimizador fusionado y `compile_model`, lo que sugiere GPUs con soporte bf16 (serie A100/H100 o RTX 30/40), pero no se confirma.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: LeRobot (libreria principal); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 mahjong SO-101) | no disponible | no disponible | Manipulacion de mahjong en simulacion | Gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA general base para ajuste fino | Gemma | Hugging Face |
| Otros checkpoints del mismo autor (`detour`, `vary`, `off5`) | no disponible | no disponible | Variantes de la misma tarea | Gemma | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas como OpenVLA u Octo.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de validacion externa ni de robustez en produccion.
- Especifico de una tarea y un entorno: entrenado para mahjong en rack 07 con SO-101 en Isaac Lab; no se espera que generalice a otros objetos, brazos o escenas sin reentrenamiento.
- Sin benchmarks publicados: no se puede afirmar su rendimiento relativo frente a otras politicas.
- Riesgo de sobreajuste a la simulacion: las fisicas OvPhysX y las variaciones del dataset pueden no transferir al mundo real (sim-to-real no documentado).
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; los pesos son una modificacion del modelo base.
- Contenido de terceros: las caras de las fichas de mahjong derivan de `Mahjong_eg_TW.jpg` de Cangjie6 bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y compartir igual sobre ese material.
- Sin datos de sesgos, alucinacion o limitaciones de idioma: al no ser un modelo conversacional, estas categorias no aplican de forma directa, pero tampoco se documentan evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_delta_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5
- Codigo del experimento: https://github.com/tc-huang/mahjong-lab/tree/f3fbc1b5f214b87c4a426e05146162ae1cdab9c8
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (Cangjie6, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
