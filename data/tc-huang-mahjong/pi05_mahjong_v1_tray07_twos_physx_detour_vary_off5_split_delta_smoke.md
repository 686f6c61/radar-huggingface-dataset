# tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_physx_detour_vary_off5_split_delta_smoke

## Resumen

`pi05_mahjong_v1_tray07_twos_physx_detour_vary_off5_split_delta_smoke` es un checkpoint de robótica de tipo vision-language-action (VLA) obtenido mediante fine-tuning de `lerobot/pi05_base`, la implementación de LeRobot del modelo pi0.5. El autor, `tc-huang-mahjong`, lo ha entrenado sobre un dataset propio de demostraciones simuladas de manipulación de fichas de mahjong con un brazo SO-101, generado en Isaac Lab y registrado en formato LeRobot.

El modelo no es un LLM de propósito general: su salida son acciones de control de un robot (posiciones articulares relativas al estado inicial del chunk y apertura absoluta de pinza), condicionadas por observaciones visuales de dos vistas de cámara de 224×224 y por el estado de las articulaciones. El nombre del checkpoint indica el régimen de entrenamiento: variación de offset de la bandeja (`vary_off5`), desvío físico (`physx_detour`), predicción de acciones relativas (`split_delta`) y una ejecución corta de 300 pasos (`smoke`).

Se trata de un artefacto experimental de bajo perfil (4 descargas, 0 likes en el momento de la consulta), útil como referencia para quien trabaje con pi0.5, SO-101 y pipelines de LeRobot en simulación, pero sin evidencia publicada de robustez en hardware real ni benchmarks de éxito de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (base PaliGemma: vision encoder SigLIP + LLM Gemma con experto de acciones), implementada en LeRobot |
| Parametros totales | 4.143.404.816 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica; el contexto es la observación y el estado, no texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; sin GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; no se documentan capacidades lingüísticas) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (repo de 16,6 GB, pesos y estado del optimizador en float32) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, una política VLA que combina un codificador visual PaliGemma con un backbone Gemma y un cabezal de acciones que genera chunks de acciones continuas para el robot. El fine-tuning se realizó con LeRobot en un commit fijado (`38b975c5`) y con el script `lerobot_train_mahjong.py` del repositorio `tc-huang/mahjong-lab` (commit `f3fbc1b5`). La configuración emplea precisión mixta bf16 con autocast sobre pesos float32, optimizador fusionado, `compile_model=true`, batch de 12, 300 pasos, 8 workers de datos y congelación del codificador visual desactivada (`freeze_vision_encoder=false`), es decir, se ajusta también la torre visual.

Dos decisiones de preprocesado son relevantes. Primero, el preprocesador divide `observation.images.front_cam` en dos vistas solapadas (`front_cam` y `front_cam_right`), cada una recortada a 224×224 mediante `src/models/split_camera.py`, sin recorte adicional de cámaras. Segundo, las acciones se predicen en modo relativo (`use_relative_actions=true`): cada articulación del brazo se expresa como delta respecto al estado al inicio del chunk, mientras que la pinza se predice en valor absoluto, y ambas se normalizan con las estadísticas calculadas sobre los chunks del dataset. El scheduler decae durante 300 pasos, coincidiendo con la duración total del entrenamiento, lo que sugiere un ajuste muy corto orientado a validar el pipeline más que a converger.

## Capacidades

- Control de un brazo robótico SO-101 en tareas de manipulación de fichas de mahjong en simulación (Isaac Lab).
- Generación de chunks de acciones continuas para las articulaciones del brazo, con deltas relativas al estado inicial y pinza en absoluto.
- Fusión de dos vistas de cámara (`front_cam` y `front_cam_right`) de 224×224 en una única observación.
- Generalización limitada al régimen de variación de offset de bandeja y desvíos físicos presente en el dataset de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, diálogo multilingüe, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de pi0.5 en simulación: sirve como punto de partida verificable para comparar configuraciones de entrenamiento (acciones relativas frente a absolutas, congelación o no del codificador visual).
- Validación de pipelines LeRobot de extremo a extremo: el checkpoint cubre registro de dataset, entrenamiento con `lerobot-train`, guardado por pasos en ramas `step-<step>` y publicación en Hub.
- Estudio de robustez ante variación de offset: al haberse entrenado con `vary_off5`, permite medir cómo decae la tasa de éxito al desplazar la bandeja fuera del rango visto.
- Evaluación de preprocesado de cámara partida: útil para analizar el efecto de dividir una cámara frontal en dos vistas solapadas sobre la precisión de agarre.
- Base para fine-tuning posterior sobre hardware real: al derivar de `pi05_base` y mantener el codificador visual entrenable, puede reajustarse con datos de un SO-101 físico.
- Pruebas de integración con Isaac Lab: permite comprobar latencia y estabilidad del bucle de control cerrado antes de trasladar la política a un entorno real.
- Docencia y demos de VLA: el tamaño de repo (16,6 GB) y el carácter acotado del dominio lo hacen manejable para laboratorios con una sola GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito de tarea, métricas de error de acción ni comparaciones con otros checkpoints; tampoco se documentan latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: los 4.143 millones de parámetros en float32 ocupan aproximadamente 16,6 GB solo en pesos, por lo que la inferencia sin cuantización requiere del orden de 18-20 GB de VRAM contando activaciones y buffers de imagen.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para ejecución cómoda en float32 o bf16; una RTX 4090 de 24 GB queda al límite y puede requerir autocast bf16 y batch de 1.
- GPU de consumo: posible en RTX 4090 con bf16; improbable en tarjetas de 16 GB o menos sin cuantización, que no está publicada.
- Despliegue: LeRobot es la vía natural (carga de política `pi05` con `pretrained_path`); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, que además no aplican a una política de acciones.
- Latencia y throughput: no disponibles. El bucle de control exige inferencia por chunk, pero no se publican tiempos por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi0.5 fine-tuned mahjong) | 4,14 B | Dos vistas 224×224 + estado articular | Fichas de mahjong, SO-101, simulación | gemma | Hub, repo 16,6 GB |
| `lerobot/pi05_base` | no disponible en la información | no disponible | Manipulación general (preentrenado) | gemma | Hub |
| Políticas tipo ACT / Diffusion Policy en LeRobot | no disponible | imágenes + estado | Tareas de imitación específicas | no disponible | Hub / librería |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks comunes ni datos de éxito de tarea para este checkpoint ni para `pi05_base` en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento de solo 300 pasos con batch 12 (unas 3.600 muestras procesadas): es un smoke test, no un modelo convergido; la calidad de política es presumiblemente baja.
- Dominio estrechísimo: fichas de mahjong en una bandeja concreta, bajo variación de offset y desvíos físicos simulados; no hay evidencia de transferencia a otras tareas, objetos o entornos reales.
- Sin métricas publicadas de tasa de éxito, error de posición o estabilidad, por lo que no puede evaluarse su rendimiento de forma objetiva.
- Riesgo de sobreajuste a la apariencia de las fichas sintéticas, adaptadas de una imagen CC BY-SA 4.0 (Cangjie6); cambios de iluminación, textura o cámara pueden degradar la política.
- Licencia Gemma con Terms of Use y Prohibited Use Policy aplicables, incluidas restricciones de uso; los pesos son una modificación por fine-tuning del modelo base y heredan esas condiciones.
- El preprocesador asume una cámara frontal partida en dos vistas; usar el modelo con una única cámara requiere replicar el mismo esquema de recorte.
- Idiomas no documentados y capacidades lingüísticas no evaluadas: no debe tratarse como un modelo de texto.
- Sin garantías del autor sobre idoneidad para producción; el nombre del repo indica carácter experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_physx_detour_vary_off5_split_delta_smoke
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_tray07_twos_physx_detour_vary_off5
- Código de entrenamiento (commit f3fbc1b5): https://github.com/tc-huang/mahjong-lab/tree/f3fbc1b5f214b87c4a426e05146162ae1cdab9c8
- Imagen de fichas de mahjong (Cangjie6, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia de la imagen: https://creativecommons.org/licenses/by-sa/4.0/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
