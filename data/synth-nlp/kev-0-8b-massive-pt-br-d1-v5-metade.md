# Synth-NLP/kev-0.8b-massive-pt-br-D1-v5-metade

## Resumen

Kev-0.8b-massive-pt-br-D1-v5-metade es un ajuste fino tipo delta (LoRA más una cabeza pointer) sobre el modelo base jaredpalmer/kev-0.8b, desarrollado por Synth-NLP. El modelo está especializado en clasificación de intenciones en portugués de Brasil sobre el conjunto de datos MASSIVE, donde debe elegir la intención correcta entre 20 opciones candidatas por frase. No es un modelo generativo de propósito general, sino un modelo de decisión orientado a una tarea concreta de enrutamiento semántico.

Forma parte de un experimento comparativo más amplio que contrasta datos sintéticos generados mediante una pipeline agéntica con datos reales, evaluando modelos de decisión de distintos tamaños (Laya, Kev-0.8B, 4B y 9B). La variante D1_v5_metade combina el conjunto de entrenamiento real con la mitad (seleccionada aleatoriamente) del conjunto sintético v5, sumando 46.743 líneas con formato de pregunta variado y 240 intenciones.

Con 0,8 mil millones de parámetros y un repositorio de apenas 0,1 GB, el modelo está pensado para despliegue ligero en tareas de clasificación de intenciones. Su relevancia radica en explorar hasta qué punto datos sintéticos pueden sustituir parcialmente a datos reales en modelos de decisión pequeños, un área de interés creciente para pipelines de agentes y asistentes conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con adaptador LoRA y cabeza pointer (derivada de jaredpalmer/kev-0.8b) |
| Parámetros totales | 0,8 mil millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, entrenamiento en bf16) |
| Idiomas soportados | portugués (pt, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye como un ajuste delta sobre jaredpalmer/kev-0.8b, un modelo de decisión de 0,8 mil millones de parámetros. El ajuste combina un adaptador LoRA con una cabeza pointer que selecciona una de entre 20 opciones de intención por frase. La base se mantiene congelada en bf16 durante el entrenamiento, de modo que solo se actualizan los parámetros del adaptador y de la cabeza de decisión.

El entrenamiento se realizó con el comando `python -m kev.train --init_from jaredpalmer/kev-0.8b`, con una tasa de aprendizaje de 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Se desactivaron los aumentos propios de Kev (sin la opción "ninguna de las anteriores" ni distractores adicionales). Los datos del brazo D1_v5_metade combinan el conjunto real con la mitad sorteada del sintético v5, totalizando 46.743 líneas con 240 intenciones y formato de pregunta variado, empleando las mismas líneas y las mismas 20 opciones que el modelo Laya del mismo brazo.

## Capacidades

- Clasificación de intenciones en portugués de Brasil: selecciona la intención correcta entre 20 opciones candidatas por frase.
- Decisión sobre un conjunto cerrado de 240 intenciones presentes en el entrenamiento.
- Generalización a intenciones no vistas: el modelo alcanza 0,797 de precisión en escenarios reservados nunca vistos durante el entrenamiento.
- Formato de pregunta variado: entrenado con distintas formulaciones de la misma consulta.
- Servicio mediante API System One: `uv run --extra serve python -m kev.serve --run <repo>`.
- No soporta tool calling, ni agentes multi-paso, ni generación libre de texto, ni visión o audio.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo recibe una frase del usuario y debe elegir entre 20 intenciones candidatas, lo que permite dirigir la conversación al flujo adecuado en un chatbot de atención al cliente en portugués.
- Clasificación en pipelines de agentes: al ser un modelo de decisión ligero, puede actuar como primer eslabón que determina la intención antes de invocar herramientas o subagentes especializados.
- Investigación sobre datos sintéticos: sirve como punto de comparación en experimentos que evalúan si el entrenamiento con datos sintéticos generados por pipelines agénticas iguala al entrenamiento con datos reales.
- Evaluación de modelos de decisión pequeños: con 0,8 mil millones de parámetros y un repositorio de 0,1 GB, es adecuado para estudiar el equilibrio entre tamaño y precisión en tareas de clasificación cerrada.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite servirlo en infraestructura modesta para tareas de clasificación de intenciones en producción.
- Benchmarking de generalización: los escenarios reservados del conjunto MASSIVE pt-BR permiten medir la capacidad del modelo para manejar intenciones nunca vistas durante el entrenamiento (0,797 de precisión reportada).

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, 20 opciones, media de 3 sorteos | Precisión en intenciones vistas | no disponible ("nan" en la model card) |
| MASSIVE pt-BR, validación, 20 opciones, media de 3 sorteos | Precisión en intenciones no vistas (escenarios reservados) | 0,797 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,8 mil millones de parámetros, una estimación razonable en bf16 rondaría los 1,6 GB de pesos, y en cuantización de 8 bits alrededor de 0,8 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles; por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque no se confirma en la model card.
- Opciones de despliegue: el autor documenta el servicio mediante `uv run --extra serve python -m kev.serve --run <este repo>`, que expone una API System One. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-0.8b-massive-pt-br-D1-v5-metade | 0,8 B | no disponible | Clasificación de intenciones pt-BR (20 opciones) | Apache 2.0 | Hugging Face |
| Laya (mismo brazo D1_v5_metade) | no disponible | no disponible | Clasificación de intenciones pt-BR (20 opciones) | no disponible | Referenciado en la model card |
| Kev-0.8B (variantes de 4B y 9B del experimento) | 0,8 B / 4 B / 9 B | no disponible | Clasificación de intenciones pt-BR | no disponible | Referenciados en la model card |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en clasificación de intenciones en portugués de Brasil; no es adecuado para generación de texto libre, código, matemáticas ni otras tareas.
- La precisión en intenciones vistas aparece como "nan" en la model card, lo que impide verificar su rendimiento en el conjunto principal de evaluación.
- El conjunto de intenciones está limitado a 240 clases y a 20 opciones candidatas por frase; no generaliza a intenciones fuera de ese catálogo.
- Se desactivaron los aumentos de Kev (opción "ninguna de las anteriores" y distractores adicionales), por lo que el modelo no está entrenado para rechazar consultas fuera de dominio.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de contexto más allá de las derivadas de la tarea.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base jaredpalmer/kev-0.8b debe verificarse por separado para confirmar compatibilidad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-0.8b-massive-pt-br-D1-v5-metade
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Conjunto de datos MASSIVE (referenciado en la model card): no disponible como enlace directo en la información proporcionada
