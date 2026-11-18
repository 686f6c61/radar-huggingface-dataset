# taichi116/diffusion_sarmal_3temp_speed_2_100k

## Resumen

`taichi116/diffusion_sarmal_3temp_speed_2_100k` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y empaquetada con la librería LeRobot de Hugging Face. El autor, identificado como taichi116, la publica como un checkpoint de robótica (pipeline `robotics`) que genera trayectorias de acción multimodales mediante un proceso generativo de difusión, en lugar de predecir una única acción determinista. El modelo tiene 277.839.242 parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación derivado de un dataset propio (`taichi116/sarmal_3temp_speed_2_20261109_172724`) y no de un modelo fundacional de propósito general. No es un modelo de lenguaje: no procesa texto, no responde instrucciones y no tiene ventana de contexto en el sentido habitual. Su función es mapear observaciones visuales y proprioceptivas a secuencias de acciones para un robot concreto.

La ficha se elabora, por tanto, con los datos disponibles en la model card y los metadatos de Hugging Face. Muchos campos propios de un modelo de lenguaje (idiomas, cuantización, benchmarks estándar) no aplican o no están disponibles, y así se indica explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), empaquetado con LeRobot |
| Parametros totales | 277.839.242 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte de predicción de acciones no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, descrito en el paper arXiv:2303.04137. En lugar de regresar directamente la acción siguiente, aprende la distribución de trayectorias de acción completas mediante un proceso de difusión: se parte de ruido y se denoiza iterativamente hasta obtener una secuencia de acciones coherente. Este enfoque produce comportamientos multimodales y suaves, y según la propia model card destaca en manipulación con contacto rico (contact-rich manipulation), donde las políticas deterministas tienden a promediar modos incompatibles.

Los detalles concretos de la arquitectura interna (tipo de backbone visual, número de pasos de difusión, horizonte de predicción, dimensiones de la acción) no se especifican en la información disponible. El entrenamiento se realizó con LeRobot sobre el dataset `taichi116/sarmal_3temp_speed_2_20261109_172724`; el sufijo `100k` del nombre sugiere 100.000 pasos de entrenamiento, aunque esto no está confirmado en la model card. No se documentan composición del dataset, número de episodios ni si hubo fases de ajuste adicionales.

## Capacidades

- Generación de trayectorias de acción multimodales para control robótico mediante difusión.
- Control visuomotor a partir de observaciones (se asume entrada de imagen y estado proprioceptivo, aunque la composición exacta no se detalla).
- Manipulación con contacto rico, el escenario para el que Diffusion Policy está diseñado.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de ensamblaje o inserción donde el contacto físico es crítico, aprovechando la naturaleza generativa de la difusión para producir trayectorias suaves y multimodales.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy sobre el mismo dataset y configuraciones de entrenamiento.
- Reproducción de experimentos con LeRobot: al estar empaquetado con la librería, permite cargar el checkpoint, lanzar `lerobot-record` sobre un robot SO-100 y comparar el comportamiento con otras políticas del mismo ecosistema.
- Evaluación de robustez ante variaciones de velocidad: el nombre del modelo (`speed_2`) sugiere un entrenamiento orientado a una velocidad de ejecución concreta, útil para estudiar cómo afecta la dinámica de la tarea al rendimiento de la política.
- Base para ajuste fino en un robot propio: partiendo de los pesos publicados, un equipo puede continuar el entrenamiento con su propio dataset y su propia morfología, siempre que respete la licencia Apache 2.0.
- Docencia y divulgación: ejemplo práctico y reproducible de Diffusion Policy dentro del ecosistema LeRobot, adecuado para talleres sobre aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277,8 M de parámetros en safetensors, los pesos ocupan aproximadamente 1,1 GB en FP32; en FP16 rondarían los 0,55 GB. A ello hay que sumar la memoria del backbone visual y de los tensores intermedios del proceso de difusión, no cuantificada en la información disponible.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar el modelo; una RTX 4090, A100 o H100 ofrecerían margen sobrado, pero no hay datos de latencia que lo confirmen.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint), que es el flujo documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La latencia real dependerá del número de pasos de difusión, del hardware y de la frecuencia de control del robot, parámetros que no se detallan.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `taichi116/diffusion_sarmal_3temp_speed_2_100k` | 277,8 M | Diffusion Policy (LeRobot) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot | no disponible | Transformer de imitación | no disponible | según checkpoint | Ecosistema LeRobot |
| Otras políticas Diffusion Policy en LeRobot | variable | Difusión | no disponible | según checkpoint | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Especificidad del dataset: entrenado sobre un único dataset propio (`sarmal_3temp_speed_2_20261109_172724`); su generalización a otras tareas, morfologías o entornos no está documentada.
- Sin datos de evaluación: no se publican métricas de éxito, tasas de error ni comparaciones con baselines, lo que impide estimar su calidad real.
- Riesgo de sobreajuste al robot y a la configuración de hardware empleados en la recogida de datos; el comportamiento puede degradarse fuera de esas condiciones.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval ni GSM8K, y no ofrece garantías de razonamiento simbólico.
- Sesgos: no documentados. En robótica, los sesgos provienen de la distribución del dataset de demostración (posiciones, iluminación, objetos), no de corpus textuales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset asociado antes de un despliegue en producción.
- En producción robótica, una política de difusión sin evaluación externa debe tratarse como prototipo y someterse a pruebas de seguridad antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taichi116/diffusion_sarmal_3temp_speed_2_100k
- Dataset de entrenamiento: https://huggingface.co/datasets/taichi116/sarmal_3temp_speed_2_20261109_172724
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
