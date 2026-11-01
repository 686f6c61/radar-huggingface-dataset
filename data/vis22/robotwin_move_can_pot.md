# vis22/Robotwin_move_can_pot

## Resumen

Robotwin_move_can_pot es un fine-tuning del modelo SmolVLA (Small Vision-Language-Action) publicado por el usuario vis22 en Hugging Face. Se trata de una política robótica de tipo vision-language-action entrenada para ejecutar una tarea concreta de manipulación: mover una lata (can) a una olla (pot). El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha ajustado sobre el dataset `robotwin_move_can_pot_piper_v30`, asociado al entorno de simulación RoboTwin y presumiblemente al brazo robótico Piper.

SmolVLA, descrito en el paper arXiv 2506.01844, es una arquitectura compacta que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir comandos motores directamente a partir de observaciones visuales e instrucciones en lenguaje natural. Su principal atractivo es que logra un rendimiento competitivo con un coste computacional reducido, lo que permite desplegarlo en hardware de consumo en lugar de requerir clústeres de GPU.

Este checkpoint concreto es relevante como ejemplo reproducible de fine-tuning de SmolVLA con LeRobot: cuenta con 450 millones de parámetros, un repositorio de 0,9 GB en safetensors y licencia Apache 2.0, lo que facilita su inspección, reproducción y reutilización como punto de partida para otras tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, fine-tuning de `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, una política vision-language-action compacta que procesa observaciones visuales junto con instrucciones en lenguaje natural y emite acciones motoras de forma directa. La arquitectura combina componentes de percepción visual y comprensión lingüística con un cabezal de acción, siguiendo el diseño descrito en el paper arXiv 2506.01844. El checkpoint base es `lerobot/smolvla_base`, y este ajuste se ha realizado con la librería LeRobot de Hugging Face.

El entrenamiento se ha llevado a cabo sobre el dataset `robotwin_move_can_pot_piper_v30`, orientado a la tarea de mover una lata a una olla en el entorno RoboTwin, probablemente con el robot Piper. No se dispone de información sobre el número de tokens, la composición exacta del dataset, el número de episodios de demostración ni sobre si se aplicaron técnicas de RLHF o DPO; en el ámbito de las políticas de imitación tipo VLA, lo habitual es el aprendizaje por imitación supervisado a partir de demostraciones teleoperadas, pero este dato no está confirmado en la información disponible.

## Capacidades

- Control robótico visomotor: genera acciones a partir de imágenes de la escena y de una instrucción de tarea.
- Ejecución de la tarea específica de mover una lata a una olla en el entorno RoboTwin.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios (`lerobot-train`, `lerobot-record`).
- Despliegue en hardware de consumo según las características declaradas de SmolVLA.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo está especializado en una única tarea de manipulación.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): percepción visual inherente a la arquitectura VLA; no se documentan otras.

## Casos de uso

- Reproducción de experimentos de RoboTwin: sirve como checkpoint de referencia para replicar la tarea de mover la lata a la olla y comparar resultados con otras políticas entrenadas en el mismo dataset.
- Punto de partida para fine-tuning: al derivar de `lerobot/smolvla_base` y usar LeRobot, puede reajustarse sobre nuevos datasets de manipulación con el mismo pipeline de entrenamiento.
- Evaluación de políticas VLA compactas: permite medir el rendimiento de un modelo de 450 M de parámetros en una tarea concreta frente a políticas más grandes, con un coste de inferencia reducido.
- Docencia y prototipado en robótica: su tamaño (0,9 GB) y licencia Apache 2.0 lo hacen adecuado para cursos y laboratorios que necesiten un ejemplo completo de extremo a extremo con LeRobot.
- Pruebas de despliegue en hardware de consumo: útil para validar si una política SmolVLA ajustada puede ejecutarse en GPU de gama media en un entorno simulado o real.
- Base para pipelines de imitación en laboratorio: integrable en flujos de recogida de datos con `lerobot-record` para generar nuevos episodios de evaluación etiquetados con el prefijo `eval_`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,8 GB y en fp16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; SmolVLA se describe como desplegable en hardware de consumo.
- ¿Cabe en GPU de consumo? Según la descripción de SmolVLA, sí; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documentan otras integraciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/Robotwin_move_can_pot | 450 M | no disponible | Mover lata a olla (RoboTwin) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Política VLA general (base) | no disponible | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT) | no disponible | no disponible | Manipulación con imitación | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para una única tarea (mover una lata a una olla) en un entorno concreto; no es un modelo generalista.
- Riesgo de sobreajuste al dataset `robotwin_move_can_pot_piper_v30`: el comportamiento fuera de la distribución de entrenamiento (otras cámaras, iluminación, objetos o robots) no está garantizado.
- Sesgos: no documentados; en robótica, los sesgos provienen de las condiciones de recogida de datos (posiciones, colores, fondos) y pueden provocar fallos sistemáticos.
- Alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras cuando la percepción no coincide con la tarea esperada.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea suelen estar en inglés en los datasets de LeRobot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base y del dataset asociado.
- Producción: no hay información sobre robustez, latencia ni seguridad; no se recomienda su uso en entornos reales sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/Robotwin_move_can_pot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
