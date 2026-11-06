# tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full

## Resumen

pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full es un ajuste fino del modelo de robotica pi0.5 (`lerobot/pi05_base`) realizado por el usuario tc-huang-mahjong sobre un conjunto de datos propio de simulacion de mahjong. El modelo resuelve una tarea concreta de manipulacion robotica: operar fichas de mahjong en un entorno simulado con un brazo SO101, dentro del ecosistema LeRobot. No es un modelo de lenguaje general, sino una politica visomotora (vision-language-action) que recibe observaciones de camara y estado del robot y emite acciones de control.

La relevancia es acotada y experimental: se trata de un checkpoint de investigacion publicado sin descargas ni validacion externa, con fecha de creacion en noviembre de 2026. Su interes principal radica en ser un ejemplo reproducible de fine-tuning de pi0.5 con LeRobot, incluyendo detalles de configuracion de entrenamiento, preprocesado de camaras y estructura de checkpoints por pasos.

Arquitectonicamente hereda de pi0.5, que se construye sobre PaliGemma (un modelo vision-language de Gemma) y anade una cabeza de accion para control robotico. El repositorio pesa 33,2 GB y esta pensado para inferencia en simulacion, no para despliegue comercial general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action sobre PaliGemma/Gemma) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (repo de 33,2 GB, libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se ajusta con LeRobot en el commit principal fijado 38b975c5. pi0.5 es una politica visomotora que combina un backbone vision-language derivado de PaliGemma con una cabeza de generacion de acciones; el preprocesador del modelo divide `observation.images.front_cam` en dos vistas solapadas de 224 x 224 (`front_cam` y `front_cam_right`) mediante `src/models/split_camera.py`, sin recorte adicional de camaras.

El entrenamiento se ejecuta con `lerobot-train` durante 30 000 pasos, batch de 12, precision mixta bf16 con optimizador fusionado, `compile_model=true` en modo `default`, `freeze_vision_encoder=false` y `gradient_checkpointing=false`. Los pesos y el estado del optimizador se guardan en float32 con autocast bf16. El dataset es `tc-huang-mahjong/mahjong_v1_stand07_twos_ovphysx_detour_vary_off5`, generado en Isaac Lab con el brazo SO101; las imagenes de fichas de mahjong derivan de `Mahjong_eg_TW.jpg` de Cangjie6 bajo CC BY-SA 4.0. La rama `main` contiene el ultimo checkpoint y las ramas `step-<step>` cada guardado (cada 5000 pasos). No se documentan tecnicas de RLHF/DPO ni decodificacion especulativa.

## Capacidades

- Control visomotor de un brazo robotico SO101 en simulacion para manipular fichas de mahjong.
- Percepcion a partir de dos vistas de camara frontal de 224 x 224 con solapamiento.
- Generacion de acciones de robot condicionadas a observaciones visuales y estado del entorno.
- Ejecucion de una tarea especifica de "stand07" con variaciones de detour y configuracion `twos`.
- Integracion nativa con el ecosistema LeRobot para carga y evaluacion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode.

## Casos de uso

- Investigacion en manipulacion robotica simulada: reproducir el pipeline de fine-tuning de pi0.5 con LeRobot sobre un dataset propio y comparar checkpoints por paso.
- Benchmark interno de politicas VLA: usar el modelo como referencia para tareas de picking y colocacion de fichas en Isaac Lab.
- Estudio de preprocesado de camaras: evaluar el efecto de dividir la vista frontal en dos crops solapados de 224 x 224 sobre el rendimiento de la politica.
- Generacion de datos sinteticos de demostracion: emplear el checkpoint para rodar rollouts en simulacion y alimentar datasets de entrenamiento adicionales.
- Docencia y divulgacion: ejemplo didactico de ajuste fino de un modelo vision-language-action con configuracion de entrenamiento completamente publicada.
- Validacion de infraestructura: probar pipelines de entrenamiento con bf16, `torch.compile` y batches de 12 en GPUs de datacenter antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 33,2 GB en float32 sugiere que la carga completa requiere al menos esa magnitud de memoria, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el peso del repo hace improbable su ejecucion en GPUs consumer de gama media sin cuantizacion, que no esta documentada.
- Opciones de despliegue: LeRobot (libreria nativa); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full | no disponible | no disponible | Manipulacion de mahjong en simulacion | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | Politica VLA general | gemma | Hugging Face (modelo base) |
| Otros fine-tunes de pi0.5 en LeRobot | no disponible | no disponible | Variables | gemma | no disponible |

No se dispone de datos de rendimiento de alternativas para una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea de mahjong en simulacion con SO101; no generaliza a otros dominios.
- Sin benchmarks ni evaluaciones publicadas; el rendimiento real es desconocido.
- Sesgos: no documentados, pero el dataset de fichas deriva de una unica imagen fuente (CC BY-SA 4.0), lo que puede limitar la variabilidad visual.
- Riesgo de alucinacion en el sentido de acciones incorrectas o no fisicamente plausibles en entornos distintos al de entrenamiento.
- Licencia Gemma: sujeta a Gemma Terms of Use y Gemma Prohibited Use Policy; revisar restricciones antes de cualquier uso comercial.
- El modelo base pi0.5 incorpora componentes Gemma, con las obligaciones asociadas.
- Pesos en float32 y repo de 33,2 GB: coste de almacenamiento y memoria elevado.
- Sin soporte documentado de cuantizacion ni de despliegue fuera de LeRobot.
- Fecha de creacion futura (2026) y cero descargas: sin validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_stand07_twos_ovphysx_detour_vary_off5
- Codigo de entrenamiento: https://github.com/tc-huang/mahjong-lab/tree/bcc92d79437cbc6d933b8244947775d2560e8fcd
- Imagen fuente de fichas: https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia de la imagen: https://creativecommons.org/licenses/by-sa/4.0/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
