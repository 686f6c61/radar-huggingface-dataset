# tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full_from30k

## Resumen

`pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full_from30k` es un modelo de política robótica (vision-language-action, VLA) derivado de pi0.5, la arquitectura de robot learning de Physical Intelligence construida sobre PaliGemma. El modelo lo publica el usuario `tc-huang-mahjong` y está especializado en una tarea muy concreta: manipular fichas de mahjong en un entorno simulado con un brazo SO-101, dentro de un pipeline generado con Isaac Lab y PhysX. No es un modelo de lenguaje general, sino un checkpoint de control motor entrenado con LeRobot.

El modelo parte del checkpoint `step-030000` de un entrenamiento previo del mismo autor y se ha afinado durante 20 000 pasos adicionales sobre el dataset `mahjong_v1_stand07_twos_ovphysx_detour_vary_off5`. La variante "detour_vary_off5" y "split_full" sugiere escenarios de simulación con desvíos y variaciones de posición, y una división de cámara frontal en dos vistas solapadas de 224 x 224. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

Su relevancia es acotada: sirve como ejemplo de flujo completo de fine-tuning de pi0.5 con LeRobot, con hiperparámetros y commits documentados, y como referencia para quien quiera replicar políticas VLA sobre tareas de manipulación de precisión (fichas pequeñas, posiciones variadas) en simulación antes de trasladarlas a un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action sobre PaliGemma), política tipo flow matching con encoder de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32, autocast bf16 durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | no disponible explícitamente; integrado en LeRobot (checkpoints con estado del optimizador en float32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de pi0.5, una política VLA que combina un backbone de visión-lenguaje PaliGemma con un cabezal de acciones. La entrada incluye imágenes de cámara (`observation.images.front_cam`, dividida en dos vistas solapadas `front_cam` y `front_cam_right` de 224 x 224 mediante `src/models/split_camera.py`) y el estado del robot; la salida es una secuencia de acciones para el brazo SO-101. El preprocesador no recorta las cámaras.

El entrenamiento se realizó con LeRobot en el commit `38b975c5`, usando `lerobot_train_mahjong.py` con precisión mixta bf16, optimizador fused, `compile_model=true` (modo default), batch size 12, 20 000 pasos, LR 1e-5, warmup de 500 pasos y decaimiento del scheduler a 20 000 pasos, semilla 1001. Se congeló o no el encoder de visión según `freeze_vision_encoder=false` (es decir, no se congeló). Los pesos y el estado del optimizador se guardan en float32. El dataset de entrenamiento es `mahjong_v1_stand07_twos_ovphysx_detour_vary_off5`, generado en simulación con Isaac Lab y PhysX, con caras de fichas adaptadas de una imagen de Wikimedia (CC BY-SA 4.0). No se documentan número de tokens, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación: genera acciones para un brazo SO-101 orientadas a la interacción con fichas de mahjong en simulación.
- Percepción visual multi-vista: procesa dos vistas frontales solapadas de 224 x 224 para estimar la posición de las fichas.
- Ejecución de políticas condicionadas por observación: mapea imágenes y estado del robot a secuencias de acciones.
- Entrenamiento y evaluación reproducibles en LeRobot, con checkpoints por paso (`step-<step>`) y `main` con el último.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas ni multilingüismo; no es un modelo de lenguaje de propósito general.
- No se documentan modos de "thinking", visión general, audio ni otras capacidades fuera del dominio de control.

## Casos de uso

- Replicación de experimentos de VLA: usar el checkpoint y los argumentos de entrenamiento documentados para reproducir el fine-tuning de pi0.5 sobre el mismo dataset y comparar curvas de aprendizaje.
- Investigación en manipulación de precisión: evaluar cómo una política VLA se comporta con objetos pequeños y posiciones variables (fichas de mahjong) en simulación antes de transferir a hardware.
- Generación de datos sintéticos con Isaac Lab: emplear el modelo como política de referencia para generar rollouts y ampliar el dataset `mahjong_v1_stand07_twos_ovphysx_detour_vary_off5`.
- Estudio de robustez ante desvíos: la variante "detour_vary" permite analizar la degradación de la política cuando la trayectoria nominal se altera o la posición inicial varía.
- Benchmark interno de pipelines LeRobot: servir como caso de prueba de integración de `lerobot-train`, `policy.type=pi05` y preprocesadores con múltiples cámaras.
- Docencia y formación en robótica: ejemplo completo y versionado (commits, semilla, hiperparámetros) para enseñar el ciclo de vida de un modelo de control entrenado en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política VLA basada en PaliGemma con dos vistas de 224 x 224, se espera un consumo moderado, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. El entrenamiento usó bf16 y `compile_model`, lo que sugiere GPUs con soporte de bf16 (por ejemplo, serie Ampere o superior), pero no se especifica el modelo exacto.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: LeRobot (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi0.5 mahjong fine-tune) | VLA para SO-101 en simulación | no disponible | no aplica | gemma | Hugging Face, 0 descargas |
| pi0.5 base (Physical Intelligence) | VLA generalista | no disponible | no aplica | no disponible en la información | Referencia del autor como `pi05_base` |
| Checkpoint previo `..._split_full` (step-030000) | VLA, mismo dominio | no disponible | no aplica | gemma | Hugging Face, mismo autor |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una tarea concreta (fichas de mahjong, brazo SO-101, escenario simulado); no generaliza a otras tareas sin reentrenamiento.
- Entrenado en simulación: el rendimiento en un robot real no está validado y puede degradarse por la brecha sim-a-real.
- Sin benchmarks publicados: no hay métricas de éxito, lo que impide evaluar su calidad objetivamente.
- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; conviene revisar restricciones antes de cualquier uso comercial.
- Dataset con material CC BY-SA 4.0 (caras de fichas): puede implicar obligaciones de atribución si se redistribuyen los datos o derivados.
- Riesgo de sobreajuste al escenario "detour_vary_off5": variaciones no contempladas en el dataset pueden provocar fallos de la política.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de control, el riesgo principal es la ejecución de acciones incorrectas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full_from30k
- Modelo base: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_stand07_twos_ovphysx_detour_vary_off5
- Código de entrenamiento (commit): https://github.com/tc-huang/mahjong-lab/tree/7fa45d435028a29afb816057fdd0ec5dea05a6c9
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas (Wikimedia): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
