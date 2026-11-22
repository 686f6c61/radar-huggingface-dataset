# tmtdev/Qwen3-1.7B-VNL-QA-V1

## Resumen

Qwen3-1.7B-VNL-QA-V1 es un ajuste fino (fine-tuning) del modelo ntphuc149/ViLegalQwen3-1.7B-Base, que a su vez deriva de la familia Qwen3 de Alibaba. Lo desarrolla el usuario tmtdev y se distribuye bajo licencia Apache 2.0. El modelo está orientado a generación de texto y, por el nombre del repositorio ("VNL-QA"), parece concebido para tareas de pregunta-respuesta, presumiblemente en el ámbito legal vietnamita, aunque la model card no lo explicita y declara únicamente el idioma inglés.

Se trata de un modelo denso de aproximadamente 1.700 millones de parámetros, con el tamaño de repositorio de 2,6 GB en formato safetensors, lo que es coherente con pesos en precisión de 16 bits. El ajuste se realizó con Unsloth, una librería de entrenamiento optimizado que, según el autor, permitió entrenar el doble de rápido. No se publican detalles sobre el dataset de ajuste, el número de tokens ni la metodología de entrenamiento.

Su relevancia es limitada y muy específica: es un modelo pequeño, con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni documentación técnica más allá de la plantilla de Unsloth. Resulta útil como ejemplo de ajuste fino de sub-2B para dominios verticales y para despliegue en hardware modesto, pero no debe considerarse un modelo evaluado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado con Unsloth |
| Parametros totales | ~1.700 millones (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (según la model card); el nombre del modelo sugiere orientación a vietnamita, no confirmado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de la familia Qwen3. El modelo base inmediato es ntphuc149/ViLegalQwen3-1.7B-Base, que a su vez parte de Qwen3-1.7B y fue adaptado al dominio legal vietnamita. Sobre esa base, tmtdev aplicó un ajuste fino supervisado con Unsloth y TRL, según las etiquetas del repositorio (unsloth, trl, qwen3).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni sobre hiperparámetros. La model card es la plantilla automática de Unsloth y no aporta detalles técnicos adicionales. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen3-1.7B.
- Pregunta-respuesta (QA): el nombre del repositorio indica especialización en tareas de QA, presumiblemente sobre normativa legal vietnamita, aunque no está documentado.
- Razonamiento básico y matemáticas elementales, limitados por el tamaño de 1.7B.
- Capacidades multilingües: la model card solo declara inglés; no se confirma soporte de vietnamita pese al nombre.
- Tool calling / function calling: no documentado; no se puede asumir.
- Modo thinking: no documentado para este ajuste.
- Visión, audio: no soportado.

## Casos de uso

- Prototipado de asistentes de QA legal en vietnamita: el modelo puede responder preguntas sobre normativa si el ajuste se realizó sobre ese corpus, aunque requiere validación humana por la falta de benchmarks.
- Experimentación académica con ajuste fino de modelos sub-2B: sirve como referencia para estudiar el pipeline Unsloth + TRL sobre Qwen3.
- Despliegue en entornos con recursos limitados: con 1.7B de parámetros cabe en GPU de consumo, lo que permite probar asistentes conversacionales en local.
- Generación de borradores de respuestas en atención al cliente de nicho: útil para dominios acotados donde se disponga de datos propios para validar.
- Filtrado y clasificación de consultas: puede usarse como componente de un pipeline RAG para reformular o resumir preguntas.
- Base para nuevos ajustes: al ser Apache 2.0, puede servir de punto de partida para fine-tunings adicionales en otros dominios.
- Evaluación comparativa de modelos pequeños: útil en experimentos que midan la degradación de calidad al reducir tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 3,4 GB solo para pesos; en cuantización de 8 bits, ~1,7 GB; en 4 bits, ~0,9 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para inferencia cómoda; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en FP16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta presente), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B-VNL-QA-V1 | 1.7B | No disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base original) | 1.7B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| ViLegalQwen3-1.7B-Base | 1.7B | No disponible | No disponible | Hugging Face |
| Otros ajustes sub-2B de Qwen3 | ~1.7B | Variable | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en QA legal ni en tareas generales.
- Model card mínima: no se documenta el dataset, el proceso de entrenamiento ni las limitaciones conocidas.
- Idioma declarado únicamente inglés, lo que contradice la orientación aparente a vietnamita del nombre; riesgo de comportamiento inconsistente entre idiomas.
- Riesgo de alucinación elevado en un modelo de 1.7B, especialmente en dominio legal, donde los errores tienen consecuencias graves.
- Sesgos desconocidos: no se ha realizado ninguna evaluación de sesgos.
- Longitud de contexto no confirmada: no se debe asumir la ventana de Qwen3 sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación exhaustiva.
- Cero descargas y cero likes: sin comunidad que haya validado el modelo.
- El nombre "VNL" podría referirse a Vietnam Legal, pero no está confirmado en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/tmtdev/Qwen3-1.7B-VNL-QA-V1
- Modelo base: https://huggingface.co/ntphuc149/ViLegalQwen3-1.7B-Base
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen3 (familia): no se ha encontrado enlace específico en la información proporcionada.
