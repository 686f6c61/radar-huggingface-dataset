# tandrey/Ornith-1.5-9B

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9.650 millones de parámetros (9.653.104.368), desarrollado por el equipo de Ornith AI y publicado en HuggingFace bajo el repositorio `tandrey/Ornith-1.5-9B`. Se trata de la variante más ligera de la familia Ornith-1.5, diseñada para un despliegue eficiente en una única GPU y, según la documentación, con una variante cuantizada denominada Ornith-1.5-9B-Mobile para dispositivos móviles.

El modelo extiende Ornith-1.0, que a su vez se construyó sobre Qwen3.5 y Gemma4 mediante preentrenamiento continuado, mid-training y post-training. La aportación principal de Ornith-1.5 es ampliar el bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas y diseños manuales de harnesses, el modelo genera nuevas tareas de entrenamiento, descubre estrategias de resolución y optimiza su política mediante aprendizaje por refuerzo. Esta orientación hacia tareas agénticas se refleja en los resultados de benchmarks de terminal y de ingeniería de software publicados en su model card.

Con licencia MIT y un tamaño de peso de 19,3 GB en formato safetensors, es un modelo interesante para equipos que necesiten un LLM open source para automatización de desarrollo de software y tareas de terminal con costes de inferencia moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en Qwen3.5 |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona una variante Ornith-1.5-9B-Mobile) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors y compatible con transformers |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso derivado de Qwen3.5, con una arquitectura que no utiliza mezcla de expertos (MoE). El proceso de construcción se articula en tres fases: preentrenamiento continuado, mid-training y post-training, partiendo de la base de Ornith-1.0, que a su vez se desarrolló sobre Qwen3.5 y Gemma4.

La innovación técnica destacada es el bucle de auto-mejora de extremo a extremo. En lugar de emplear un conjunto fijo de tareas curadas por humanos y harnesses diseñados manualmente, Ornith-1.5 optimiza de forma conjunta la generación de tareas de entrenamiento, la construcción de scaffolds y los rollouts de soluciones. El sistema genera nuevas tareas, descubre estrategias efectivas para resolverlas y mejora la política del modelo mediante aprendizaje por refuerzo, sin intervención humana en el diseño del harness ni de las recompensas. La documentación no proporciona detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y conversación para tareas técnicas y de programación.
- Ejecución de tareas agénticas en entornos de terminal, como se deduce de los resultados en Terminal-Bench 2.1.
- Resolución de problemas de ingeniería de software, con resultados destacados en SWE-bench Verified y SWE-bench Pro.
- Integración como agente autónomo en entornos de desarrollo, incluyendo uso de herramientas y ejecución de comandos, aunque la documentación no especifica explícitamente soporte de function calling.
- Despliegue en entornos de una sola GPU y opción de cuantización para dispositivos móviles mediante la variante Mobile.
- Compatibilidad con el ecosistema de HuggingFace transformers y servidores compatibles con la API de OpenAI (según la documentación de despliegue).

## Casos de uso

- Asistente de programación en tiempo real: el modelo puede generar código, explicar fragmentos y sugerir correcciones en el flujo de trabajo de un desarrollador, integrándose en editores o IDEs mediante un servidor OpenAI-compatible.
- Agente de terminal para DevOps: puede ejecutar comandos, navegar por sistemas de archivos y automatizar tareas de administración en entornos sandbox, apoyándose en su rendimiento en Terminal-Bench 2.1.
- Reparación automatizada de bugs en CI/CD: integrable en pipelines de integración continua para analizar repositorios, generar parches y ejecutar pruebas, aprovechando su puntuación de 70.6 en SWE-bench Verified.
- Asistente de mantenimiento de código legacy: capaz de trabajar con bases de código grandes, identificar errores y proponer refactorizaciones en proyectos de software con requisitos de automatización.
- Soporte técnico conversacional: en tareas de ayuda a desarrolladores o equipos de sistemas, el modelo puede responder preguntas sobre programación, scripts y configuración en conversaciones multi-turno.
- Generación de scripts de automatización: puede crear scripts en bash, Python u otros lenguajes para tareas repetitivas, con validación en terminal antes de su despliegue en producción.
- Despliegue en dispositivos móviles o edge: gracias a la variante cuantizada Ornith-1.5-9B-Mobile, el modelo puede ejecutarse en entornos con recursos limitados, como aplicaciones de asistencia técnica en campo.

## Benchmarks y rendimiento

Según la model card del autor, se publican los siguientes resultados para Ornith-1.5-9B en comparación con modelos de referencia. No se dispone de datos adicionales en la información proporcionada.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 47 | 40.6 | 18.9 | 49.2 | no disponible |
| SWE-bench Verified | 70.6 | 69.4 | 53.2 | 73.4 | 52 |
| SWE-bench Pro | 47.5 | 42.9 | 31.3 | 49.5 | 35.7 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 19 GB en bf16, por lo que requiere al menos una GPU con 80 GB de VRAM para servir sin cuantización en una sola tarjeta.
- GPUs recomendadas: A100 o H100 de 80 GB para servidores compatibles con OpenAI. No se especifican requisitos para versiones cuantizadas, aunque la variante Mobile apunta a dispositivos móviles.
- Cabe en GPU de consumo: no confirmado para la versión completa; la cuantización permitiría su ejecución en GPUs de menor capacidad, pero no se detallan los tamaños resultantes.
- Opciones de despliegue: servidor compatible con OpenAI, soportando sharding entre múltiples GPUs mediante `--tensor-parallel-size` / `--tp` según la documentación; también es compatible con la librería `transformers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B | 9.65B | no disponible | 70.6 | MIT | HuggingFace |
| Ornith-1.0-9B | no disponible | no disponible | 69.4 | no disponible | HuggingFace |
| Qwen3.5-9B | no disponible | no disponible | 53.2 | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | 73.4 | no disponible | no disponible |
| Gemma-4-31B | no disponible | no disponible | 52 | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado análisis de sesgos ni evaluaciones de seguridad para este modelo en la información disponible.
- Riesgo de alucinación y de comportamiento impredecible, especialmente porque el proceso de auto-mejora genera tareas y estrategias de forma autónoma, lo que puede introducir sesgos no documentados.
- La longitud de contexto no está especificada, por lo que no se pueden garantizar conversaciones de contexto largo ni ingestas de documentos extensos.
- La composición del dataset de entrenamiento y los datos utilizados para el aprendizaje por refuerzo no se han divulgado, lo que limita la evaluación de su alineación y robustez.
- Aunque el tag en HuggingFace incluye `image-text-to-text`, no se dispone de documentación que confirme capacidades multimodales de visión; la evidencia disponible apunta a un modelo puramente de texto.
- No se especifican los idiomas soportados, por lo que su rendimiento en lenguas distintas del inglés no está garantizado.

## Enlaces

- https://huggingface.co/tandrey/Ornith-1.5-9B
- https://huggingface.co/ornith-ai/Ornith-1.5-9B
- https://ornith.ai/ornith_1_5.html
