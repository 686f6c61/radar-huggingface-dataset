# tc-huang-mahjong/pi05_mahjong_v1_reach07_twos_ovphysx_perturb_off5_split_full

## Resumen

pi05_mahjong_v1_reach07_twos_ovphysx_perturb_off5_split_full es un ajuste fino del modelo de politica robotica lerobot/pi05_base, desarrollado por el usuario tc-huang-mahjong. El modelo esta especializado en una tarea concreta de manipulacion robotica dentro de un entorno simulado de mahjong, empleando el brazo robotico SO101 y el simulador Isaac Lab. Se distribuye a traves de la libreria LeRobot y su pipeline es de robotica, no de generacion de texto.

El modelo parte de la arquitectura pi0.5, que se construye sobre PaliGemma (vision-lenguaje) y anade una cabeza de accion para el control de robots. El ajuste fino se realizo sobre el dataset mahjong_v1_reach07_twos_ovphysx_perturb_off5, con 30.000 pasos de entrenamiento, batch de 12, precision mixta bf16 y pesos en float32. El repositorio ocupa 33,2 GB, lo que refleja el almacenamiento de pesos y estado del optimizador.

Su relevancia es acotada: se trata de un experimento de investigacion reproducible (incluye el commit exacto del codigo y los argumentos de entrenamiento) mas que de un modelo de proposito general. Resulta util para quienes trabajan en aprendizaje por imitacion, politicas vision-lenguaje-accion y evaluacion en simulacion con perturbaciones fisicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-lenguaje-accion sobre PaliGemma) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (repositorio LeRobot, 33,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, una politica vision-lenguaje-accion que hereda el codificador y el modelo de lenguaje de PaliGemma y anade una cabeza de prediccion de acciones para control robotico. El ajuste fino se realizo con LeRobot (commit principal fijado 38b975c5) partiendo de lerobot/pi05_base. La configuracion de entrenamiento incluye 30.000 pasos, batch de 12, mixed precision bf16, optimizador fusionado, compilacion del modelo en modo default, scheduler_decay_steps de 30000 y 8 workers de datos. El codificador de vision no se congela (freeze_vision_encoder=false) y no se usa gradient checkpointing.

El preprocesador no recorta las camaras: la observacion observation.images.front_cam se presenta como dos vistas solapadas, front_cam y front_cam_right, cada una de 224 x 224 en recortes cuadrados (src/models/split_camera.py). Los pesos y el estado del optimizador estan en float32 con autocast bf16. La rama main contiene el ultimo checkpoint y las ramas step-<step> cada guardado intermedio. Los fotogramas de entrenamiento usan caras de fichas de mahjong adaptadas de Mahjong_eg_TW.jpg de Cangjie6 (CC BY-SA 4.0).

## Capacidades

- Control robotico por imitacion: predice acciones para el brazo SO101 en tareas de manipulacion de fichas de mahjong en simulacion.
- Percepcion visual multimodal: procesa dos vistas de camara (front_cam y front_cam_right) de 224 x 224.
- Ejecucion en simulacion fisica: entrenado y evaluado en Isaac Lab con perturbaciones fisicas (perturb_off5).
- Especializacion en tareas de alcanzar y manipular (reach07, twos): no es un modelo de proposito general.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingueismo.
- No se documentan modos especiales como thinking, audio o vision general fuera del contexto robotico.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el experimento con los argumentos y commits documentados para estudiar el efecto de perturbaciones fisicas en politicas pi0.5.
- Evaluacion de robustez en simulacion: comparar el rendimiento del modelo con y sin perturbaciones (off5) en Isaac Lab para medir degradacion.
- Desarrollo de pipelines de robotica con LeRobot: integrar el checkpoint como referencia en flujos de entrenamiento y evaluacion de politicas vision-lenguaje-accion.
- Benchmarking de brazos SO101: usar el modelo como linea base en tareas de alcance y manipulacion de fichas de mahjong.
- Estudio de preprocesado de camaras: analizar el efecto de las dos vistas solapadas (front_cam y front_cam_right) frente a configuraciones de una sola camara.
- Docencia y prototipado: servir como ejemplo completo de ajuste fino de pi05_base con configuracion reproducible y checkpoints intermedios por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 33,2 GB incluye pesos y estado del optimizador en float32, por lo que la inferencia requiere una fraccion de ese espacio no especificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (libreria declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_mahjong_v1_reach07_twos_ovphysx_perturb_off5_split_full | no disponible | no disponible | Manipulacion robotica en simulacion (mahjong, SO101) | Gemma | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible | no disponible | Politica vision-lenguaje-accion general | Gemma | Hugging Face (LeRobot) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una tarea y entorno concretos (mahjong en Isaac Lab con SO101); no generaliza a otros dominios sin reentrenamiento.
- Sin datos publicados de rendimiento ni de benchmarks, por lo que no puede evaluarse su calidad de forma objetiva.
- Riesgo de sobreajuste al simulador: el comportamiento en robot real no esta documentado.
- Licencia Gemma: sujeta a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con restricciones para uso comercial y usos prohibidos.
- Los fotogramas de entrenamiento incluyen material de terceros (CC BY-SA 4.0) y no implican endorsement del autor original.
- No se documentan sesgos, capacidades multilingues ni limites de contexto; el modelo no es de texto general.
- Uso en produccion no recomendado sin validacion previa: se trata de un artefacto de investigacion con una unica descarga y sin likes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_reach07_twos_ovphysx_perturb_off5_split_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_reach07_twos_ovphysx_perturb_off5
- Codigo del experimento: https://github.com/tc-huang/mahjong-lab/tree/87e4c19ab53b60dad53167d54c880caa9de2cfe6
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
