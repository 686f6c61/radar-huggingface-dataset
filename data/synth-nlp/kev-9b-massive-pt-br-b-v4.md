# Synth-NLP/kev-9b-massive-pt-br-B-v4

## Resumen

Kev-9b-massive-pt-br-B-v4 es un ajuste fino mediante LoRA y una cabeza pointer (pointer head) sobre el modelo base jaredpalmer/kev-9b, un modelo de decisión de 9 000 millones de parámetros. Lo desarrolla Synth-NLP y su tarea concreta es la clasificación de intenciones en portugués de Brasil sobre el conjunto de datos MASSIVE pt-BR, eligiendo entre 20 opciones candidatas por frase. No es un modelo generativo de propósito general, sino un clasificador especializado que selecciona una intención entre un conjunto cerrado de alternativas.

El modelo forma parte de un experimento comparativo más amplio que contrasta datos sintéticos generados por una pipeline agéntica frente a datos reales, evaluando modelos de decisión de distintos tamaños (Laya, Kev-0.8B, Kev-4B y Kev-9B). Esta variante concreta, denominada braço B_v4, se entrenó exclusivamente con datos sintéticos de la pipeline v4 correspondientes a las 30 intenciones vistas, manteniendo la misma distribución por intención que el entrenamiento con datos reales.

Su relevancia es acotada y experimental: sirve para validar si los datos sintéticos pueden sustituir a los reales en tareas de clasificación de intenciones en portugués, con un rendimiento reportado de 0,879 en intenciones vistas y 0,834 en intenciones no vistas. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión (decision-model) sobre base Kev-9B; ajuste LoRA con pointer head para selección de intención entre 20 opciones |
| Parametros totales | 9B (modelo base); el adaptador LoRA se distribuye como delta sobre la base |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; no se detallan cuantizaciones publicadas) |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + pointer head sobre jaredpalmer/kev-9b) |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-9b, un modelo de decisión de 9B parámetros, y se ajusta mediante LoRA con una cabeza pointer que selecciona una intención entre 20 opciones candidatas por frase. La base se mantiene congelada en bf16 durante el entrenamiento. El ajuste se realizó con el comando `python -m kev.train --init_from jaredpalmer/kev-9b`, con learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Se desactivaron los aumentos propios de Kev (sin la opción "ninguna de las anteriores" ni distractores extra).

Los datos de entrenamiento del brazo B_v4 son exclusivamente sintéticos, generados por la pipeline v4, y cubren las 30 intenciones vistas con la misma distribución por intención que el entrenamiento con datos reales. Las filas y las 20 opciones coinciden con las del modelo Laya del mismo brazo, lo que permite una comparación controlada. La evaluación se realizó sobre la validación de MASSIVE pt-BR con 20 opciones y promedio de 3 sorteos, obteniendo 0,879 en intenciones vistas y 0,834 en intenciones no vistas (escenarios reservados nunca vistos en entrenamiento).

## Capacidades

- Clasificación de intenciones en portugués de Brasil: selecciona una intención entre 20 opciones candidatas por frase.
- Modelo de decisión: no genera texto libre, sino que elige entre alternativas predefinidas.
- Generalización a intenciones no vistas: el brazo B_v4 reporta 0,834 en escenarios reservados, lo que indica cierta capacidad de transferencia a intenciones no presentes en el entrenamiento.
- Evaluación sobre MASSIVE pt-BR: alineado con el esquema de intenciones de dicho conjunto de datos.
- Servicio mediante API System One: se expone con `uv run --extra serve python -m kev.serve --run <este repo>`, siguiendo el patrón del modelo Jev.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (el modelo es un clasificador de decisión de un solo paso).
- Capacidades multilingües: limitadas al portugués de Brasil según la información disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo recibe una frase del usuario y 20 intenciones candidatas, y devuelve la más probable, adecuado para enrutar consultas en un chatbot de atención al cliente en pt-BR.
- Enrutamiento de consultas en sistemas de soporte: integrado en un pipeline previo a un LLM generativo, permite decidir qué flujo o base de conocimiento activar según la intención detectada.
- Evaluación de datos sintéticos para entrenamiento: sirve como referencia experimental para medir si los datos sintéticos de la pipeline v4 igualan a los datos reales en clasificación de intenciones.
- Investigación sobre modelos de decisión: útil para comparar el comportamiento de modelos de 0,8B, 4B y 9B bajo el mismo esquema de datos y opciones.
- Prototipado de clasificadores con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales internos para tareas de clasificación cerrada en portugués.
- Validación de generalización a intenciones no vistas: el rendimiento reportado en escenarios reservados (0,834) permite usarlo en pruebas de robustez ante intenciones nuevas.
- Servicio de inferencia ligero: el adaptador ocupa 0,2 GB y se sirve mediante la API System One, lo que facilita su despliegue en entornos de investigación.

## Benchmarks y rendimiento

| Conjunto / escenario | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, 20 opciones, intenciones vistas | Precisión (media de 3 sorteos) | 0,879 |
| MASSIVE pt-BR, validación, 20 opciones, intenciones no vistas | Precisión (media de 3 sorteos) | 0,834 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 9B con adaptador LoRA, se requiere cargar la base completa, lo que implica del orden de 18 GB en bf16 (estimación basada en el tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar A100, H100 o GPUs con al menos 24 GB de VRAM para bf16.
- ¿Cabe en GPU de consumo? No disponible de forma confirmada; con cuantización a 8 bits o 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090, pero el autor no detalla cuantizaciones publicadas.
- Opciones de despliegue: API System One mediante `uv run --extra serve python -m kev.serve --run <este repo>`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-9b-massive-pt-br-B-v4 | 9B (base) + LoRA | no disponible | 0,879 vistas / 0,834 no vistas (MASSIVE pt-BR) | Apache 2.0 | Hugging Face |
| Laya (mismo brazo B_v4) | no disponible | no disponible | no disponible en la información | no disponible | no disponible |
| Kev-0.8B (mismo experimento) | 0,8B | no disponible | no disponible en la información | no disponible | no disponible |
| Kev-4B (mismo experimento) | 4B | no disponible | no disponible en la información | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un clasificador de decisión cerrado, no un modelo generativo: no puede producir texto libre ni mantener conversaciones.
- Entrenado exclusivamente con datos sintéticos en el brazo B_v4, lo que puede introducir sesgos o artefactos propios de la pipeline de generación.
- Limitado al portugués de Brasil; no se reporta soporte para otros idiomas.
- El conjunto de intenciones está restringido a las 30 vistas en entrenamiento y a las 20 opciones por frase; no cubre intenciones fuera de ese esquema.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en frases ambiguas o fuera de distribución.
- No se detallan sesgos conocidos ni evaluaciones de robustez más allá de las dos métricas reportadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base jaredpalmer/kev-9b debe verificarse por separado en cuanto a sus propios términos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- No se especifican requisitos de hardware, latencia ni opciones de cuantización, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Synth-NLP/kev-9b-massive-pt-br-B-v4
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Conjunto de datos MASSIVE pt-BR: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
