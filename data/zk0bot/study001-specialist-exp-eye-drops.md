# zk0bot/study001-specialist-exp-eye-drops

## Resumen

`zk0bot/study001-specialist-exp-eye-drops` es un artefacto de investigación publicado por el usuario zk0bot en Hugging Face. Se trata de un modelo derivado de `lerobot/smolvla_base`, entrenado como especialista ("expert-only") para una tarea concreta de robótica: `eye_drops_to_basket`, es decir, manipular un frasco de gotas oftálmicas y depositarlo en una cesta. Por tanto, no es un modelo de lenguaje generalista, sino una política visuomotora (vision-language-action) orientada a control robótico.

El modelo tiene 450.046.176 parámetros (unos 450 millones) y se distribuye en formato safetensors con un repositorio de 0,9 GB, lo que es coherente con pesos en precisión de 16 bits. El entrenamiento consistió en 3.000 pasos sobre un alcance reducido de 155 tensores, partiendo de la base SmolVLA, y alcanzó una pérdida final de entrenamiento de 0,088. El autor indica explícitamente que este no es el modelo final que se distribuye, sino una referencia de especialista con ajuste completo (full fine-tuning) dentro del "Study 001".

Su relevancia es acotada pero clara para quien investiga en VLA y robótica de manipulación: sirve como línea base de especialista frente a variantes más generales, y documenta un protocolo de entrenamiento reproducible (pasos, alcance de tensores, pérdida). No obstante, la información pública es muy escasa: no hay pipeline declarado, no se listan idiomas, no hay benchmarks ni descargas, y la model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `lerobot/smolvla_base`; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, una base VLA de la familia SmolVLA orientada a control de robots a partir de observaciones visuales e instrucciones. El autor no detalla en la model card la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, codificador visual), por lo que esos datos deben considerarse no disponibles. Lo que sí se especifica es el procedimiento: ajuste completo sobre un subconjunto de 155 tensores ("expert-only"), durante 3.000 pasos, con una pérdida final de entrenamiento de 0,088.

No se indica el número de tokens ni la composición del dataset de entrenamiento, ni si hubo etapas de RLHF, DPO o ajuste por preferencias; en el contexto de políticas VLA esto sería habitualmente imitación supervisada sobre demostraciones, pero el autor no lo confirma. La innovación declarada no es arquitectónica sino metodológica: aislar un especialista de ajuste completo como referencia superior ("ceiling reference") para comparar con el modelo finalmente distribuido, `ivelin/zk0-smolvla-fl`.

## Capacidades

- Control visuomotor para la tarea específica `eye_drops_to_basket`: el modelo recibe observaciones (previsiblemente imágenes) y produce acciones para manipular un frasco de gotas y colocarlo en una cesta.
- Ejecución de una política especializada entrenada con ajuste completo, pensada como referencia de rendimiento en esa tarea concreta.
- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas; es un artefacto de política robótica, no un LLM de propósito general.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; su naturaleza es de política de acción.
- Capacidades multilingües: no disponibles; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): la componente visual es implícita en la familia VLA, pero el autor no la detalla.

## Casos de uso

- Investigación en políticas VLA especializadas: usar este checkpoint como línea base "ceiling" de ajuste completo para comparar con variantes más generales o con el modelo distribuido `ivelin/zk0-smolvla-fl` en la misma tarea.
- Reproducción de experimentos de robótica de manipulación: el protocolo documentado (3.000 pasos, 155 tensores, pérdida 0,088) permite replicar el entrenamiento y verificar la pérdida reportada.
- Evaluación de técnicas de ajuste parcial frente a ajuste completo: al ser un especialista expert-only, sirve para medir la brecha de rendimiento frente a políticas con congelación de capas o adaptadores.
- Docencia y divulgación sobre SmolVLA: un checkpoint pequeño (450 M de parámetros, 0,9 GB) facilita demostraciones de flujo de entrenamiento y despliegue en entornos académicos.
- Pruebas de integración con LeRobot: al derivar de `lerobot/smolvla_base`, es un candidato para validar pipelines de carga, inferencia y evaluación del ecosistema LeRobot.
- Análisis de sensibilidad al alcance de tensores: comparar qué tensores (los 155 del alcance) son suficientes para una tarea de manipulación concreta y cuáles no aportan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico reportado es la pérdida final de entrenamiento (0,088), que no es una métrica de evaluación ni es comparable con benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) ni con métricas de éxito en robótica, que no se proporcionan.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, en fp16 los pesos ocupan aproximadamente 0,9 GB; el consumo real dependerá del codificador visual y de los buffers de inferencia, no documentados.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo con suficiente VRAM, pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de pesos, pero no hay confirmación oficial ni requisitos declarados.
- Opciones de despliegue: no disponible; al ser un artefacto LeRobot/SmolVLA, el ecosistema natural sería LeRobot, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zk0bot/study001-specialist-exp-eye-drops` | 450.046.176 | no disponible | `eye_drops_to_basket` (especialista) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible | no disponible | Base VLA generalista | no disponible | Hugging Face (referencia del autor) |
| `ivelin/zk0-smolvla-fl` | no disponible | no disponible | Modelo distribuido del Study 001 | no disponible | Hugging Face (referencia del autor) |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la relación declarada por el autor: este checkpoint es un especialista de referencia y no el modelo distribuido.

## Limitaciones y advertencias

- Es un artefacto de investigación ("study artifact"), no un modelo listo para producción; el propio autor indica que no es el modelo distribuido.
- Especialización extrema: entrenado solo para `eye_drops_to_basket`; no debe esperarse generalización a otras tareas de manipulación.
- La model card es mínima: sin pipeline, sin idiomas, sin benchmarks y sin instrucciones de uso; esto dificulta la evaluación independiente.
- No hay métricas de éxito en la tarea, solo pérdida de entrenamiento; la pérdida de entrenamiento no garantiza buen rendimiento en el robot real.
- Riesgo de sobreajuste al conjunto de demostraciones de la tarea, dado el ajuste completo sobre un alcance reducido de 155 tensores.
- Sesgos conocidos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, iluminación, objetos), que no se describe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles restricciones heredadas.
- No se documentan requisitos de hardware ni compatibilidad con frameworks de despliegue, lo que añade riesgo operativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zk0bot/study001-specialist-exp-eye-drops
- Modelo base citado: https://huggingface.co/lerobot/smolvla_base
- Modelo distribuido citado: https://huggingface.co/ivelin/zk0-smolvla-fl
