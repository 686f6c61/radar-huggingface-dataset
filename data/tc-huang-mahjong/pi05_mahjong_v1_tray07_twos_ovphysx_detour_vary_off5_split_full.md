# tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_full

## Resumen

`pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_full` es un ajuste fino del modelo de robotica `lerobot/pi05_base` (la variante pi0.5 de Physical Intelligence, construida sobre PaliGemma) realizado por el usuario `tc-huang-mahjong`. El modelo esta especializado en una tarea de manipulacion robotica dentro de un entorno de simulacion de mahjong, empleando el brazo robotico SO-101 sobre el simulador Isaac Lab. Se trata, por tanto, de una politica visuomotora (vision-language-action) y no de un modelo de lenguaje generativo de proposito general.

El modelo parte de la arquitectura pi0.5, que combina un codificador visual SigLIP con un backbone Gemma para producir acciones motoras a partir de observaciones visuales y de la instruccion de tarea. Con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un repositorio de 49,8 GB, el checkpoint se distribuye en formato safetensors y esta pensado para su uso con la libreria LeRobot.

La relevancia de esta ficha es acotada: se trata de un experimento de investigacion reproducible (con codigo y dataset publicos) centrado en una tarea muy concreta de recogida de fichas de mahjong en simulacion. Resulta util como referencia para quienes trabajan en imitation learning, ajuste fino de pi0.5 y evaluacion de politicas VLA en entornos simulados, pero no es un modelo de uso general ni esta destinado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (pi0.5) basada en PaliGemma: codificador visual SigLIP + backbone Gemma |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos y estado del optimizador en float32, con autocast bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura pi0.5, que sigue el esquema de las politicas vision-language-action: un codificador de imagen SigLIP procesa las observaciones visuales y un transformer basado en Gemma genera las acciones del robot condicionadas por la tarea. En este ajuste fino concreto, el preprocesador no recorta las camaras y presenta `observation.images.front_cam` como dos vistas solapadas, `front_cam` y `front_cam_right`, cada una de 224 x 224 pixeles con recortes cuadrados (implementado en `src/models/split_camera.py`).

El entrenamiento se realizo con LeRobot (commit principal fijado 38b975c5) sobre el dataset `tc-huang-mahjong/mahjong_v1_tray07_twos_ovphysx_detour_vary_off5`, con el script `lerobot_train_mahjong.py` (commit `4fea83350a19f4e04e4f45c39b9d0f661ec70c6e`). Los hiperparametros principales fueron: 30.000 pasos, batch size 12, mixed precision bf16, optimizador fusionado, `compile_model=true` con modo `default`, `freeze_vision_encoder=false` (codificador visual entrenado), `gradient_checkpointing=false`, `scheduler_decay_steps=30000`, 8 workers y seguimiento con Trackio. Los pesos y el estado del optimizador se guardan en float32. La rama `main` contiene el ultimo checkpoint y las ramas `step-<step>` contienen cada checkpoint guardado (frecuencia de guardado cada 10.000 pasos).

## Capacidades

- Generacion de acciones motoras para un brazo robotico SO-101 a partir de observaciones visuales en simulacion (Isaac Lab).
- Manipulacion de fichas de mahjong en una bandeja concreta (`tray07`), incluyendo agarre de fichas lejanas con los dedos inclinados hacia fuera.
- Robustez ante condiciones iniciales variadas: cada episodio del dataset parte con las articulaciones hasta 5 grados fuera de la pose de reposo.
- Procesamiento de dos vistas de camara solapadas (`front_cam` y `front_cam_right`) a 224 x 224.
- No dispone de capacidades de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni audio: es una politica VLA especializada, no un modelo conversacional.
- Capacidades multilingues: no disponibles (no aplica a la tarea).

## Casos de uso

- Investigacion en imitation learning: servir como punto de partida reproducible para estudiar el ajuste fino de pi0.5 sobre tareas de manipulacion con un solo brazo, ya que el codigo, el dataset y los hiperparametros estan publicados.
- Evaluacion de politicas VLA en simulacion: usar el checkpoint para medir tasas de exito en la tarea de recogida de fichas de mahjong bajo el simulador Isaac Lab y comparar con otras variantes del mismo autor (por ejemplo, las versiones `stand07` o `tray07`).
- Reproduccion de experimentos: replicar el entrenamiento con el script `lerobot_train_mahjong.py` y el commit indicado para validar resultados o hacer ablaciones (por ejemplo, congelar o no el codificador visual).
- Generacion de datos sinteticos de manipulacion: emplear la politica para producir trayectorias en simulacion que alimenten pipelines de aprendizaje por refuerzo o de data augmentation.
- Docencia y divulgacion: ilustrar el flujo completo de un ajuste fino de un modelo VLA (dataset, preprocesador, entrenamiento, checkpoints por paso) en cursos de robotica o aprendizaje automatico.
- Desarrollo de habilidades de agarre con variaciones: estudiar como el modelo generaliza a poses iniciales perturbadas y a fichas situadas en posiciones lejanas, aprovechando la variacion introducida en el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parametros en float32, el peso ronda los 16,5 GB; en bf16/fp16 unos 8,3 GB; en cuantizaciones de 8 bits o 4 bits (si se generan) se reduciria aproximadamente a 4,1 GB y 2,1 GB respectivamente. No se han publicado cifras oficiales de VRAM para este checkpoint.
- GPU recomendadas: para entrenamiento o inferencia en precision completa, GPU de datacenter como A100 (40/80 GB) o H100; para inferencia en bf16, una RTX 4090 (24 GB) o RTX A6000 (48 GB) serian suficientes en teoria.
- Cabe en GPU de consumo: si, en bf16 cabria en GPUs con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090); en float32 requeriria al menos 20-24 GB.
- Opciones de despliegue: la libreria LeRobot es la via natural; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_full (este) | 4,14 mil millones | no disponible | Manipulacion de mahjong en simulacion (SO-101) | Gemma | Hugging Face, 28 descargas |
| tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full | no disponible | no disponible | Variante con configuracion `stand07` | Gemma | Hugging Face |
| tc-huang/pi05_mahjong_v1_tray07_twos_30k | no disponible | no disponible | Variante con dataset `mahjong_v1_tray07_twos` (1.000 demostraciones, 230.373 frames a 30 fps, batch 16, 30.000 pasos) | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Politica VLA base de proposito general | Gemma | Hugging Face |

## Limitaciones y advertencias

- Modelo altamente especializado: solo funciona en la tarea y el entorno de simulacion para los que fue entrenado (bandeja `tray07`, fichas de mahjong, brazo SO-101 en Isaac Lab); no generaliza a otros objetos, entornos o robots.
- Entrenado exclusivamente en simulacion: el rendimiento en un robot fisico no esta validado y probablemente requiera ajuste adicional (sim-to-real gap).
- Sesgos conocidos: no documentados; al ser un modelo de robotica, los sesgos relevantes serian los del dataset de demostraciones (posiciones, iluminacion y configuracion de camaras concretas).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la politica puede generar acciones incorrectas o inseguras fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; el modelo no procesa lenguaje natural de forma general.
- Restricciones de licencia: los pesos se rigen por los Gemma Terms of Use y la Gemma Prohibited Use Policy, que imponen restricciones al uso comercial y a determinados usos; es necesario revisarlas antes de cualquier despliegue.
- Los frames de entrenamiento incluyen caras de fichas de mahjong adaptadas de `Mahjong_eg_TW.jpg` de Cangjie6, bajo CC BY-SA 4.0; no se implica el respaldo del autor original.
- El repositorio ocupa 49,8 GB, lo que exige espacio de almacenamiento considerable y complica su distribucion.
- Solo 28 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_tray07_twos_ovphysx_detour_vary_off5
- Codigo de entrenamiento (commit): https://github.com/tc-huang/mahjong-lab/tree/4fea83350a19f4e04e4f45c39b9d0f661ec70c6e
- Variante `stand07`: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full
- Variante `tray07` 30k: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_30k
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (Cangjie6, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
