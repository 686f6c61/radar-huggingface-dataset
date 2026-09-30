# theroboticscompany/pi05-piperx-stack-cup-ft02

## Resumen

π0.5 fine-tune — PiPER-X `stack_cup`, ft02 es un ajuste fino de la política robótica π0.5 (pi05_base) desarrollado por theroboticscompany sobre 49 demostraciones reales de teleoperación de la tarea «apilar el vaso verde dentro del vaso rojo». El escenario es un escritorio de madera con tres vasos de papel (azul, rojo, verde) y un cubo de espuma verde como distractores; el brazo PiPER-X (6 grados de libertad más pinza paralela) debe coger el vaso verde e introducirlo en el rojo. Los datos se grabaron el 28 de septiembre de 2026 a 15 Hz y suman 11.754 fotogramas.

Se trata de un modelo VLA (vision-language-action) de la familia π0.5 con 3,381.000 millones de parámetros totales, de los cuales solo 458,0 millones (13,54 %) son entrenables. La receta congela SigLIP por completo, congela Gemma-2B dejando únicamente adaptadores LoRA entrenables (27,87 millones) y entrena al completo el experto de acciones (427,93 millones), más 2,17 millones en proyecciones. Es una variante de un solo cambio respecto a su compañero ft01 (solo experto): añadir LoRA sobre Gemma-2B.

El interés de esta ficha está en su valor como experimento controlado más que como producto: el autor advierte explícitamente de que la menor pérdida de ft02 no demuestra una mejor política, ya que añade 28 millones de parámetros entrenables sobre 11.754 fotogramas (13,6 épocas) y ese ajuste más estrecho es igual de compatible con la memorización. El modelo se distribuye como checkpoints Orbax de JAX, sin safetensors ni `from_pretrained`, y exige el stack openpi para servirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia π0.5: codificador visual SigLIP + backbone VLM Gemma-2B + experto de acciones; transformer multimodal, no MoE |
| Parámetros totales | 3,381 mil millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros entrenables | 458,0 M (13,54 %): 427,93 M experto de acciones + 27,87 M LoRA de Gemma + 2,17 M proyecciones |
| Longitud de contexto | no disponible (no es un modelo de lenguaje conversacional); horizonte de acción: 15 pasos = 1,0 s a 15 Hz |
| Tipos de cuantización | no disponible (se publican checkpoints Orbax en precisión de entrenamiento; sin GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (prompt fijo en inglés: `stack the green cup inside the red cup`) |
| Licencia | other (texto de licencia no especificado en la información disponible) |
| Formato de pesos | Orbax (JAX/Flax). No hay safetensors ni GGUF; no admite `from_pretrained` |
| Entradas | 2 cámaras: `observation.images.external` (OAK-D estática, frontal-izquierda) → `base_0_rgb`; `observation.images.wrist` (Orbbec en la brida) → `left_wrist_0_rgb`; `right_wrist_0_rgb` enmascarado a ceros. 640×480 con letterbox a 224×224 |
| Espacio de estado/acción | 7 dimensiones: `joint1..joint6` (rad) + pinza normalizada. La interfaz servida son objetivos articulares absolutos en rad |
| Frecuencia de control | 15 Hz (66,7 ms por acción predicha) |
| Dataset de ajuste | 49 episodios (de 52 grabados), 11.754 fotogramas, grabados el 28/09/2026 |
| Hardware de entrenamiento | 1× NVIDIA L40S (instancia g6e.2xlarge), 5 h 10 min, batch 16, 10.000 pasos |
| Tamaño del repositorio | 45,3 GB (5 checkpoints con `params/`, `train_state/` y `assets/`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de π0.5 publicado por Physical Intelligence: un codificador de visión SigLIP, un backbone de lenguaje y visión Gemma-2B que fusiona los tokens visuales, el texto del prompt y el estado del robot, y un experto de acciones que consume esa representación y produce un trozo (*chunk*) de acciones futuras. En este caso, el experto predice deltas de articulación (la pinza se predice de forma absoluta) y una capa `AbsoluteActions` los convierte de vuelta, de modo que la interfaz servida expone objetivos articulares absolutos en radianes. El autor no detalla en la model card la formulación concreta del experto de acciones; la familia π0/π0.5 usa flow matching en su formulación publicada, pero ese detalle no se confirma en la información disponible.

La receta de entrenamiento es un experimento de variable única respecto a ft01: SigLIP congelado, Gemma-2B congelado salvo adaptadores LoRA, experto de acciones entrenado al completo. Los hiperparámetros son batch 16, 10.000 pasos, `action_horizon=15`, calentamiento de 400 pasos hasta 2,5e-5, decaimiento coseno hasta 2,5e-6 en el paso 10.000, EMA desactivado, deltas de brazo y pinza absoluta, con `gripper_open_value=0.07`. No se menciona RLHF ni DPO: es aprendizaje por imitación supervisado sobre demostraciones de teleoperación. Las estadísticas de normalización se comparten con ft01 (mismos datos, transformaciones y horizonte) y viajan dentro de la carpeta `assets/` de cada checkpoint, requisito imprescindible para la inferencia.

La innovación destacable es, paradójicamente, la advertencia metodológica del propio autor: π0.5 presume de «aislamiento del conocimiento» (entrenar las acciones sin perturbar el VLM), y añadir LoRA sobre Gemma-2B relaja esa propiedad. El autor anticipa que el modo de fallo esperado es la fragilidad ante posiciones de vaso fuera de la distribución de entrenamiento, no una pérdida peor. La calidad de datos documentada es alta: verificación contra los HDF5 originales (estado con error 1,2e-07, acción 6,0e-08), comparación vídeo-JPEG en 5 índices por episodio y ambas cámaras con PSNR mínimo de 35,5 dB sobre 490 fotogramas, 49/49 episodios con secuencia completa abrir → cerrar → levantar → soltar, y tres fotogramas CAN corruptos (0,007 %) reparados por interpolación con el vecino.

## Capacidades

- Manipulación robótica de una única tarea: recoger el vaso verde y anidarlo dentro del rojo, ignorando los distractores (vaso azul y cubo de espuma verde).
- Condicionamiento por prompt de lenguaje en inglés (`stack the green cup inside the red cup`), con prompt constante.
- Política de imitación con trozo de acciones (*action chunking*): predice 15 acciones, equivalentes a 1,0 s de ejecución a 15 Hz.
- Control de brazo de 6 grados de libertad más pinza paralela, con objetivos articulares absolutos servidos en radianes.
- Fusión multimodal de dos cámaras (externa estática y de muñeca) con el estado articular.
- Ejecución de menos acciones por consulta que el horizonte completo, lo que aumenta la reactividad sin reentrenar.
- No soporta tool calling, function calling, agentes multi-paso, conversación multi-turno ni capacidades de audio o texto general: es una política visomotora, no un modelo de lenguaje de propósito general.
- Capacidad multilingüe: no disponible (prompt fijo en inglés como parte del condicionamiento entrenado).

## Casos de uso

- Automatización de anidado de objetos deformables: el modelo ejecuta la secuencia abrir → cerrar → levantar → soltar sobre vasos de papel, un caso donde las mordazas de la pinza llegan a cerrarse casi por completo (rango medido 0,0006–0,0702 m), distinto del comportamiento sobre cubos rígidos.
- Estudio experimental de LoRA frente a ajuste solo del experto: ft01 y ft02 comparten datos, transformaciones y estadísticas de normalización, por lo que sirven como par controlado de un único cambio (27,87 M de parámetros LoRA adicionales) en un contexto académico de comparación de estrategias de ajuste.
- Evaluación de robustez ante desplazamiento de objetos: el autor recomienda probar específicamente contra ft01 con los vasos desplazados, ya que ahí se espera el modo de fallo por pérdida del aislamiento del conocimiento.
- Punto de partida para nuevos ajustes sobre PiPER-X: la receta (SigLIP congelado, Gemma-2B con LoRA, experto completo) y el pipeline de datos a 15 Hz son reutilizables para otras tareas del mismo robot, siempre que se respete la convención de cero articular de la sesión.
- Validación de un pipeline completo de aprendizaje por demostración: 52 episodios grabados, filtrado a 49, con verificación HDF5, comprobación de PSNR y reparación de fotogramas CAN, utilizable como plantilla de control de calidad de datos de teleoperación.
- Despliegue en laboratorio sobre una réplica exacta del montaje: cámara OAK-D externa fija frontal-izquierda más Orbbec en la brida, con la calibración de `sim_scene_20260928/` y el modelo de distorsión racional de OpenCV con los ocho coeficientes.
- Docencia y formación en robótica open source: ejemplo real y documentado de integración de π0.5, checkpoints Orbax y servidor `serve_policy.py` de openpi en una sola GPU L40S.
- Referencia interna de coste de entrenamiento: 5 h 10 min en 1× L40S, batch 16 y 10.000 pasos para 49 episodios, dato útil para planificar presupuestos de ajuste fino de políticas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tasas de éxito en hardware (*rollouts*), ni MMLU, HumanEval, GSM8K u otras métricas, que por otra parte no aplican a una política visomotora. Los únicos datos cuantitativos publicados son las pérdidas de entrenamiento y las épocas por checkpoint.

Comparación de pérdida de entrenamiento entre ft01 (solo experto) y ft02 (+LoRA):

| Paso | ft01 (solo experto) | ft02 (+LoRA) |
|---|---|---|
| 0 | 0,0616 | 0,0621 |
| 2000 | 0,0158 | 0,0145 |
| 4000 | 0,0099 | 0,0075 |
| 6000 | 0,0089 | 0,0070 |
| 8000 | 0,0069 | 0,0051 |
| 9999 | 0,0070 | 0,0056 |

Checkpoints publicados de ft02:

| Paso | Épocas | Pérdida de entrenamiento |
|---|---|---|
| 2000 | 2,7 | 0,0145 |
| 4000 | 5,4 | 0,0075 |
| 6000 | 8,2 | 0,0070 |
| 8000 | 10,9 | 0,0051 |
| 9999 | 13,6 | 0,0056 |

El autor subraya que la pérdida inferior de ft02 no es evidencia de una mejor política: con 28 M más de parámetros entrenables sobre 11.754 fotogramas, un ajuste más estrecho es el resultado esperado y es igual de compatible con la memorización. Ambas curvas se aplanan a partir del paso 6000 y repuntan ligeramente de 8000 a 9999, por lo que recomienda evaluar los checkpoints 6000, 8000 y 9999 en lugar de asumir que el último es el mejor. No se aportan datos de latencia ni de throughput de inferencia.

## Requisitos de hardware

- Peso del modelo: 3,381 mil millones de parámetros; en bfloat16 los pesos ocupan aproximadamente 6,8 GB (cálculo derivado del número de parámetros, no un dato publicado).
- VRAM de inferencia: no disponible de forma explícita. Como estimación a partir del tamaño de los pesos, una GPU de 12-16 GB podría alojar la política en bf16, pero no está verificado en la información disponible.
- GPU de entrenamiento confirmada: 1× NVIDIA L40S (48 GB) en una instancia AWS g6e.2xlarge, 5 h 10 min para 10.000 pasos con batch 16.
- GPU recomendadas: no disponibles como lista publicada; el único dato confirmado es la L40S. No hay confirmación de funcionamiento en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no confirmado. El tamaño de pesos en bf16 es compatible con varias GPU de consumo de gama alta, pero la información disponible no lo valida.
- Repositorio completo: 45,3 GB. Para servir un único checkpoint basta con descargar `9999/params/*`, `9999/assets/*` y `9999/_CHECKPOINT_METADATA`, lo que reduce notablemente la descarga.
- Opciones de despliegue: exclusivamente el stack openpi, mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config=pi05_piperx_stackcup_expert_lora --policy.dir=<descargado>/9999`. Requiere la rama `rahim-trc` de `The-Robotics-Company/openpi` en el commit `89c7836` o posterior.
- vLLM, llama.cpp, Ollama y TGI: no aplicables. Los pesos son checkpoints Orbax de JAX y no existe `from_pretrained`.
- Latencia y throughput: no disponibles. La única restricción temporal documentada es que el cliente debe ejecutar a 15 Hz, de modo que cada acción se mantiene 66,7 ms y el trozo de 15 cubre exactamente 1,0 s.
- Aviso de configuración: el archivo de configuración arrastra rutas absolutas de la máquina de entrenamiento; si la resolución de rutas falla, hay que sobrescribir `assets_base_dir`. Las estadísticas de normalización van dentro de `assets/` de cada checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros entrenables | Tarea | Pérdida final (paso 9999) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-piperx-stack-cup-ft02 | 3,381 B | 458,0 M (13,54 %): experto + LoRA Gemma | `stack_cup` en PiPER-X | 0,0056 | other | checkpoints Orbax en HuggingFace |
| pi05-piperx-stack-cup-ft01 | 3,381 B | aproximadamente 430,1 M (experto + proyecciones; valor derivado, no publicado) | `stack_cup` en PiPER-X | 0,0070 | other | checkpoints Orbax en HuggingFace |
| pi05_base | 3,381 B (base de partida) | no disponible | política general π0.5 | no disponible | no disponible | citado como origen del fine-tune, sin enlace en la información |
| Políticas `pick_cube` de PiPER-X | no disponible | no disponible | `pick_cube` | no disponible | no disponible | citadas como no intercambiables, sin enlace |

La comparación relevante es entre ft01 y ft02, que difieren únicamente en los adaptadores LoRA sobre Gemma-2B y comparten datos, transformaciones, horizonte y estadísticas de normalización. No hay modelos de terceros comparables documentados en la información disponible.

## Limitaciones y advertencias

- No hay ninguna evaluación en hardware: no existen tasas de éxito, vídeos de rollouts ni métricas de tarea publicadas. La única señal es la pérdida de entrenamiento.
- Pérdida más baja no implica mejor política. Con 13,6 épocas sobre 11.754 fotogramas, el riesgo de memorización es más agudo, no más leve; los checkpoints 6000, 8000 y 9999 deben evaluarse por separado.
- La incorporación de LoRA sobre Gemma-2B relaja el aislamiento del conocimiento característico de π0.5. El modo de fallo esperado es fragilidad ante posiciones de vaso fuera de la distribución de entrenamiento.
- Sensibilidad crítica a la frecuencia de servicio: el entrenamiento lee los fps de `info.json`, pero el servidor no. Un cliente escrito para un dataset de 30 Hz reproducirá las trayectorias al doble de velocidad sin lanzar ningún error, y la política parecerá simplemente incapaz.
- La convención de cero articular corresponde al 28 de septiembre de 2026 y el extrínseco externo solo es válido para esa sesión. La calibración viaja en `sim_scene_20260928/`.
- La cámara OAK-D usa el modelo de distorsión racional de OpenCV y requiere los ocho coeficientes; truncar a cinco desplaza las esquinas de la imagen hasta 369 px.
- No es intercambiable con las políticas `pick_cube`: distinta tarea, distinto prompt y distinta convención de cero articular.
- La pinza se normaliza en el modelo, pero el robot espera metros: `aperture_m = (1.0 - gripper_norm) * 0.07`, con 0,0 abierto y 1,0 cerrado. Ignorar esta conversión invalida cualquier evaluación.
- Dependencia estricta de una rama concreta de openpi (`rahim-trc`, commit `89c7836` o posterior) y de una configuración con rutas absolutas del equipo de entrenamiento.
- Formato de pesos propietario del ecosistema JAX (Orbax), sin safetensors ni `from_pretrained`: la integración queda limitada al stack openpi.
- Licencia `other` sin texto público disponible en la información proporcionada: hay que verificar las condiciones antes de cualquier uso comercial o redistribución.
- Discrepancia de repositorio: la ficha de HuggingFace corresponde a `theroboticscompany/pi05-piperx-stack-cup-ft02`, mientras que el comando de descarga de la model card apunta a `abdulrahimmirani/pi05-piperx-stack-cup-ft02`. Conviene confirmar cuál es el repositorio canónico.
- Cero descargas y cero valoraciones: no hay validación por parte de la comunidad ni reproducciones independientes.
- El repositorio completo ocupa 45,3 GB si se descarga entero.
- El prompt está fijado en inglés y el condicionamiento lingüístico es constante: no es un modelo de conversación ni admite instrucciones arbitrarias.
- `right_wrist_0_rgb` está enmascarado a ceros; el cliente debe rellenar ese canal correctamente o la inferencia fallará.
- En el contexto de una política visomotora, el equivalente funcional de la alucinación es la ejecución de una trayectoria plausible pero incorrecta (colisión, agarre fallido o manipulación de un distractor), un riesgo relevante al no existir verificación externa en el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theroboticscompany/pi05-piperx-stack-cup-ft02
- Modelo compañero ft01 (solo experto): https://huggingface.co/abdulrahimmirani/pi05-piperx-stack-cup-ft01
- Repositorio de descarga citado en la model card: https://huggingface.co/abdulrahimmirani/pi05-piperx-stack-cup-ft02
- Repositorio de código openpi: `The-Robotics-Company/openpi`, rama `rahim-trc`, commit `89c7836` o posterior (URL no proporcionada en la información disponible)
- Modelo base: `pi05_base` (citado en la model card, sin enlace disponible)
- Resultados de búsqueda web: no se han encontrado resultados relevantes. Las búsquedas devueltas corresponden a páginas genéricas de Bing (imágenes, historial, Microsoft Rewards, colecciones y una entrada de blog de 2018 sobre búsqueda visual) sin relación con el modelo. Por tanto, no hay papers, blogs, demos ni repositorios adicionales que enlazar.
