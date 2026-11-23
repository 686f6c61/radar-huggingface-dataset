# zk0bot/study001-specialist-exp-tool-insert

## Resumen

Study 001 — specialist_exp tool_insert es un artefacto de investigación publicado por el usuario zk0bot en Hugging Face. Se trata de un ajuste fino (fine-tuning) completo del modelo base `lerobot/smolvla_base`, orientado a la tarea concreta de `tool_insert` dentro del ecosistema SmolVLA de LeRobot. Con 450.046.176 parámetros totales (aproximadamente 450 millones) y un tamaño de repositorio de 0,9 GB en formato safetensors, es un modelo de tamaño medio pensado para robótica y control, no para generación de texto general.

El modelo forma parte del "Study 001", un estudio comparativo interno cuyo objetivo declarado es establecer una referencia ("ceiling reference") de especialistas con fine-tuning completo frente a otras estrategias de adaptación. Según la model card, el entrenamiento consistió en 3.000 pasos sobre un alcance de 155 tensores (expert-only), partiendo de `lerobot/smolvla_base`, con una pérdida final de entrenamiento de 0,118.

Es relevante ahora únicamente como artefacto de investigación reproducible: el propio autor indica explícitamente que este NO es el modelo distribuido oficialmente (el modelo publicado es `ivelin/zk0-smolvla-fl`). La licencia Apache 2.0 facilita su reutilización, pero la ausencia de documentación sobre datos, idiomas y evaluación limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de `lerobot/smolvla_base`, familia SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un fine-tuning del modelo base `lerobot/smolvla_base`, perteneciente a la familia SmolVLA de LeRobot. SmolVLA es una familia de modelos de visión-lenguaje-acción (VLA) diseñada para control robótico, pero la model card no especifica la configuración exacta de capas, atención ni el codificador visual empleado en este artefacto concreto.

En cuanto al entrenamiento, la model card indica: 3.000 pasos de entrenamiento, alcance "expert-only" de 155 tensores, inicialización desde `lerobot/smolvla_base` y pérdida final de entrenamiento de 0,118. No se especifica el número de tokens o episodios, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El autor lo describe como un "expert-only fair specialist baseline" en el marco de una decisión de fundador fechada el 2026-11-22.

## Capacidades

- Ejecución de la tarea específica `tool_insert` en el dominio robótico, para la que fue ajustado.
- Procesamiento visión-lenguaje-acción heredado del modelo base SmolVLA (no verificado en la documentación de este artefacto).
- No se documentan capacidades de generación de texto general, razonamiento, código o matemáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible más allá de lo implícito en la familia VLA; sin confirmación en la model card.

## Casos de uso

- Referencia de comparación en estudios de adaptación: sirve como "ceiling reference" de fine-tuning completo para contrastar con métodos como LoRA u otras variantes de adaptación eficiente en parámetros dentro del Study 001.
- Reproducción de experimentos de investigación: permite replicar el baseline especialista de 3.000 pasos con pérdida 0,118 para validar resultados publicados del estudio.
- Evaluación de estrategias de ajuste sobre SmolVLA: útil para medir cuánto se acerca una adaptación ligera al rendimiento de un especialista con fine-tuning completo.
- Desarrollo de pipelines de robótica con LeRobot: el modelo puede cargarse en el ecosistema LeRobot para probar la política `tool_insert` en entornos simulados, aunque sin garantías de rendimiento fuera del estudio.
- Auditoría de artefactos de investigación: permite inspeccionar los pesos safetensors y el alcance de 155 tensores para entender qué partes del modelo base se ajustaron.
- Docencia y formación: ejemplo práctico de fine-tuning especialista sobre un modelo VLA de ~450 M de parámetros para ilustrar flujos de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida final de entrenamiento (0,118) tras 3.000 pasos, que no es comparable con métricas de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp16 se requieren aproximadamente 0,9 GB solo para pesos, más memoria para activaciones y el codificador visual del modelo base.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría albergar el modelo en precisión reducida, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en modelos como RTX 3060, RTX 4060 o superiores, aunque no está verificado.
- Opciones de despliegue: no disponibles específicamente para este artefacto; al ser safetensors, requeriría cargarse mediante las herramientas de LeRobot o PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| study001-specialist-exp-tool-insert | 450.046.176 | no disponible | apache-2.0 | Hugging Face (zk0bot) |
| lerobot/smolvla_base | no disponible en la información | no disponible | no disponible en la información | Hugging Face (lerobot) |
| ivelin/zk0-smolvla-fl | no disponible en la información | no disponible | no disponible en la información | Hugging Face (ivelin) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que este NO es el modelo distribuido oficialmente; el modelo publicado es `ivelin/zk0-smolvla-fl`.
- Es un artefacto de investigación ("study artifact") sin garantías de calidad ni validación externa.
- No hay información sobre sesgos, datos de entrenamiento ni composición del dataset, por lo que no es posible evaluar riesgos de sesgo.
- Riesgo de alucinación y comportamiento impredecible fuera del dominio `tool_insert`: no evaluado.
- Sin documentación sobre idiomas soportados ni longitud de contexto.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación y de documentación desaconseja su uso en producción.
- El modelo está especializado en una única tarea; no debe esperarse comportamiento generalista.
- Creado y actualizado en noviembre de 2026; sin mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/zk0bot/study001-specialist-exp-tool-insert
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo distribuido oficial: https://huggingface.co/ivelin/zk0-smolvla-fl
