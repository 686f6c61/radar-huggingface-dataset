# tc-huang-mahjong/pi05_mahjong_v1_rack07_twos_ovphysx_detour_vary_off5_split_full

## Resumen

pi05_mahjong_v1_rack07_twos_ovphysx_detour_vary_off5_split_full es un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, desarrollado por el usuario tc-huang-mahjong. Se trata de una política robótica (policy) entrenada con la librería LeRobot para una tarea concreta de manipulación de fichas de mahjong en un entorno simulado, presumiblemente construido con Isaac Lab. El modelo no es un LLM conversacional, sino un modelo de control visuomotor que mapea observaciones de cámara y estado del robot a acciones motoras.

El modelo parte de pi0.5, una arquitectura construida sobre PaliGemma que combina un codificador visual y un modelo de lenguaje para generar acciones de robot. En este caso, el ajuste se ha realizado sobre el dataset `mahjong_v1_rack07_twos_ovphysx_detour_vary_off5`, con 30 000 pasos de entrenamiento, batch size de 12 y precisión mixta bf16. El checkpoint final se publica en la rama `main`, mientras que las ramas `step-<step>` contienen checkpoints intermedios.

La relevancia de esta ficha es limitada fuera del contexto específico del proyecto: se trata de un experimento de investigación en robótica sim2real, con cero descargas y sin benchmarks publicados. Su interés radica en ser un ejemplo reproducible de fine-tuning de pi0.5 con LeRobot para tareas de manipulación fina (fichas de mahjong), y en documentar la configuración exacta de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (basada en PaliGemma: codificador visual + modelo de lenguaje para generación de acciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 con autocast bf16 durante entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | gemma (Gemma Terms of Use, incluye Gemma Prohibited Use Policy) |
| Formato de pesos | no disponible explícitamente (compatible con LeRobot; pesos float32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de pi0.5, que a su vez se construye sobre PaliGemma. La arquitectura combina un codificador de visión (procesa imágenes de cámara a 224 x 224) con un modelo de lenguaje que genera secuencias de acciones motoras. El preprocesador no recorta las cámaras y presenta `observation.images.front_cam` como dos vistas solapadas, `front_cam` y `front_cam_right`, cada una de 224 x 224 píxeles cuadrados (implementado en `src/models/split_camera.py`).

El entrenamiento se realizó con LeRobot (commit principal fijado 38b975c5) sobre el dataset `tc-huang-mahjong/mahjong_v1_rack07_twos_ovphysx_detour_vary_off5`, con 30 000 pasos, batch size 12, precisión mixta bf16, optimizador fused, `compile_model=true` y scheduler con decaimiento a 30 000 pasos. El codificador visual no se congeló (`freeze_vision_encoder=false`) y no se usó gradient checkpointing. Los pesos y el estado del optimizador están en float32. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que contiene frames de fichas de mahjong adaptadas de una imagen de Wikimedia Commons (CC BY-SA 4.0). No se documenta RLHF ni DPO.

## Capacidades

- Control visuomotor de un robot SO-101 en simulación (Isaac Lab) para manipulación de fichas de mahjong.
- Generación de acciones motoras a partir de observaciones de cámara (dos vistas frontales de 224 x 224) y estado del robot.
- Ejecución de una tarea específica: manipulación de la ficha "dos" (twos) en la posición de rack 07, con variaciones de detour y offset 5.
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No soporta agentes multi-step reasoning en el sentido de LLM; es una política de imitación.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión general, audio ni otras capacidades de LLM.

## Casos de uso

- Investigación en manipulación robótica fina: el modelo sirve como punto de partida para experimentos de agarre y colocación de fichas de mahjong en simulación, permitiendo evaluar políticas de imitación en tareas de precisión.
- Reproducción de experimentos de fine-tuning de pi0.5: gracias a la documentación del comando de entrenamiento y los commits fijados, un investigador puede replicar el pipeline con LeRobot y el dataset indicado.
- Benchmarking de políticas visuomotoras en entornos Isaac Lab: el checkpoint permite comparar el rendimiento de pi0.5 frente a otras políticas (p. ej., ACT, Diffusion Policy) en la misma tarea de mahjong.
- Generación de datos sintéticos para sim2real: las trayectorias generadas por el modelo en simulación pueden usarse para aumentar datasets de entrenamiento antes de transferir a un robot físico SO-101.
- Estudio de robustez ante variaciones (detour, offset): el nombre del dataset sugiere variaciones controladas, útiles para analizar la generalización de la política ante perturbaciones en la posición de las fichas.
- Docencia en robótica: ejemplo práctico de fine-tuning de un modelo base (pi05_base) con LeRobot, incluyendo configuración de precisión mixta, compilación y scheduler.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño de pi0.5, no especificado; los pesos están en float32).
- GPU recomendadas: no disponible. El entrenamiento usó batch size 12 con bf16 y `compile_model=true`, lo que sugiere GPUs de gama alta (A100/H100) para entrenamiento, pero no se confirma.
- ¿Cabe en GPU consumer? no disponible.
- Opciones de despliegue: LeRobot (librería principal), con soporte para Isaac Lab en simulación. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_mahjong_v1_rack07_twos... (este) | no disponible | no disponible | Manipulación de fichas de mahjong (SO-101) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | Política robótica general (base) | gemma | Hugging Face |
| Otras políticas LeRobot (ACT, Diffusion Policy) | no disponible | no aplica | Manipulación robótica | según modelo | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea de mahjong en simulación; no generaliza a otras tareas sin reentrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento ni comparación con alternativas.
- Riesgo de sobreajuste al entorno simulado: no se documenta transferencia a robot físico (sim2real).
- Licencia Gemma: sujeta a los Gemma Terms of Use y la Gemma Prohibited Use Policy; el uso comercial puede estar restringido. Los pesos son modificados por fine-tuning.
- Idiomas: no aplica, pero la documentación está en inglés.
- El dataset de entrenamiento incluye imágenes de fichas de mahjong adaptadas de Wikimedia Commons (CC BY-SA 4.0), lo que puede imponer obligaciones de atribución si se redistribuyen los frames.
- Cero descargas y cero likes: proyecto de investigación sin validación comunitaria.
- No se especifican sesgos, pero al ser una política de imitación puede reproducir sesgos de las demostraciones humanas.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero la política puede generar acciones erráticas fuera de la distribución de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_rack07_twos_ovphysx_detour_vary_off5_split_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_rack07_twos_ovphysx_detour_vary_off5
- Código de entrenamiento (commit): https://github.com/tc-huang/mahjong-lab/tree/87e4c19ab53b60dad53167d54c880caa9de2cfe6
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (Wikimedia Commons): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
