# Ttimms/bible-ai-assistant-qwen3.5-4b-v2

## Resumen

Bible AI Assistant v2-4b es un modelo de conversación y respuesta a preguntas sobre la Biblia, desarrollado por Ttimms como parte de un pipeline de recuperación aumentada (RAG). Se trata de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, que emplea una arquitectura híbrida Gated-DeltaNet con atención, 32 capas y aproximadamente 4,2 mil millones de parámetros. El modelo está diseñado para ejecutarse en una GPU de consumo con 16 GB de VRAM y se distribuye bajo licencia Apache-2.0.

Su propósito principal es responder preguntas bíblicas a partir de pasajes recuperados por un sistema de RAG externo, con un énfasis especial en la fidelidad a las citas textuales y en la reducción de alucinaciones. Según su protocolo de evaluación interno (282 preguntas con verificación a nivel de versículo), alcanza un 76,5 % de recuperación exacta de versículos en la categoría de búsqueda directa, un 98,9 % de tasa de citación y aproximadamente un 2 % de alucinación. El modelo está entrenado para declinar preguntas de consejería pastoral o de crisis, redirigiendo al usuario a un pastor o a una línea de ayuda.

La relevancia actual de este modelo radica en su enfoque especializado: combina un modelo base moderno con un ajuste fino orientado a una tarea concreta (Q&A bíblico con RAG), ofreciendo una alternativa local, reproducible y con licencia permisiva para desarrolladores que necesiten integrar conocimiento religioso estructurado en aplicaciones de asistencia, estudio o educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet + atención (Qwen3.5-4B), 32 capas |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (secuencia de entrenamiento fijada en 1280 tokens) |
| Tipos de cuantizacion | bf16 (original), GGUF (repo separado) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, que combina un mecanismo de atención tradicional con capas Gated-DeltaNet, una variante de atención lineal con compuertas que reduce el coste computacional en secuencias largas. Sobre esta base se aplicó un ajuste fino supervisado mediante LoRA con rango 32, alpha 64, dropout 0,05, en precisión bf16, durante una época (3.474 pasos) con un tamaño de lote efectivo de 16, una tasa de aprendizaje de 2e-4 con decaimiento coseno y una secuencia fija de 1280 tokens con máscara de pérdida solo en las completaciones. El entrenamiento duró aproximadamente 10,4 horas en una RTX 5070 Ti de 16 GB, con una pérdida de evaluación que descendió de 0,2515 a 0,2138 de forma monótona.

El conjunto de datos de entrenamiento contiene 56.022 ejemplos, totalmente trazables en cuanto a procedencia y licencia, y descontaminados respecto a las preguntas de evaluación. Se compone de varios bloques: 35.604 ejemplos de citas de escritura (recuperación de versículos, búsqueda inversa, cadenas de referencias cruzadas, colecciones temáticas, contexto de capítulo, variantes de traducción), 7.000 ejemplos de exégesis fundamentada (versículo más comentario de Matthew Henry), 12.996 ejemplos de instrucción general y razonamiento (procedentes de HuggingFaceTB/smoltalk2, con trazas de pensamiento eliminadas), 352 ejemplos de triaje pastoral escritos a mano y 70 ejemplos heredados de rechazo y metainstrucciones. No se utilizaron datos propietarios, personales ni con licencia comercial. No se aplicó ninguna etapa de preferencia o RL (prevista para la versión v3).

## Capacidades

- Generación de texto conversacional para preguntas y respuestas sobre la Biblia, orientada a su uso dentro de un pipeline RAG.
- Recuperación de versículos con citación textual: el modelo cita el pasaje exacto recuperado del contexto en el 98,9 % de las respuestas.
- Refusal seguro: entrenado para declinar preguntas de consejería pastoral, crisis o temas sensibles, redirigiendo a un pastor o a una línea de ayuda.
- Búsqueda inversa de versículos: dado un pasaje, identifica su referencia.
- Cadenas de referencias cruzadas: enlaza pasajes relacionados mediante las referencias de TSK (Treasury of Scripture Knowledge).
- Exégesis fundamentada: interpreta un versículo apoyándose en el comentario de Matthew Henry incluido en el contexto.
- Capacidad multilingüe: no disponible, el modelo solo soporta inglés.

## Casos de uso

- Estudio bíblico personal: un usuario formula preguntas sobre un pasaje concreto y el modelo responde citando el versículo exacto desde el contexto recuperado, lo que permite verificar la fuente al instante.
- Búsqueda de versículos por tema o referencia: el modelo localiza pasajes a partir de descripciones temáticas o citas parciales, gracias a su alta precisión en la categoría verse_lookup (76,5 % de acierto exacto).
- Preparación de sermones: un predicador recupera pasajes relacionados mediante cadenas de referencias cruzadas y obtiene citas textuales fiables para estructurar su mensaje.
- Devocionales automatizados: integrado en una aplicación que genera lecturas diarias con contexto recuperado, el modelo produce respuestas con citas verificables y baja tasa de alucinación (2,3 % global).
- Exploración educativa en entornos académicos: estudiantes de teología pueden consultar interpretaciones fundamentadas en comentarios históricos (Matthew Henry) dentro de un marco de RAG.
- Asistente de atención en comunidades religiosas: desplegado localmente en una GPU de 16 GB, puede servir como herramienta de apoyo para voluntarios que necesiten localizar pasajes rápidamente sin depender de servicios en la nube.

## Benchmarks y rendimiento

El autor publica resultados de su protocolo de evaluación interno (protocol v3), compuesto por 282 preguntas con verificación a nivel de versículo, decodificación greedy, semilla 42 y contexto RAG habilitado. La métrica verse_acc mide la cita verbatim del versículo esperado; las categorías sin respuesta canónica puntúan 0 en esta métrica, por lo que se complementa con una puntuación difusa (fuzzy mean) y un juez automático.

| Categoria | N | Verse acc (exacto) | Fuzzy mean | Alucinacion | Citacion |
|---|---|---|---|---|---|
| verse_lookup | 102 | 76,5 % | 0,65 | 2,9 % | 100 % |
| cross_reference | 30 | 0 %* | 0,40 | 3,3 % | 100 % |
| context | 30 | 0 %* | 0,23 | 0 % | 93 % |
| character | 35 | 0 %* | 0,20 | 2,9 % | 97 % |
| topical | 58 | 0 %* | 0,20 | 1,7 % | 100 % |
| theological_reliability | 8 | 0 %* | 0,15 | 0 % | 100 % |
| **Overall** | 266 | **29,3 %** | **0,40** | **2,3 %** | **98,9 %** |

\* La métrica verse_acc solo puntúa la cita verbatim del versículo esperado; las categorías character, topical, context y theological_reliability no tienen una respuesta canónica única, por lo que una buena respuesta sintetizada puntúa 0 en esta métrica.

Comparado con el modelo anterior del mismo proyecto (mismo protocolo y mismo día), la precisión exacta en verse_lookup mejoró de 58 % a 76,5 % (+18,5 puntos), la tasa de citación de 88 % a 98,9 % (+11 puntos) y la alucinación se mantuvo plana en torno al 2 %. Sin embargo, la puntuación difusa global regresó de 0,48 a 0,40, lo que indica que las respuestas temáticas abiertas (explicar el contexto de un salmo, describir un personaje) tienden a listar versículos en lugar de ofrecer una explicación sintetizada. El autor atribuye esta regresión a las plantillas rígidas de respuesta del conjunto de datos y planea abordarla en la versión v3 con respuestas destiladas por un profesor y una etapa GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bf16 ocupa aproximadamente 8,4 GB (tamaño del repositorio), por lo que cabe en GPUs de 16 GB con margen para el contexto y el sistema RAG.
- GPU recomendadas: RTX 5070 Ti (16 GB) fue la utilizada para el entrenamiento; cualquier GPU consumer con 16 GB de VRAM (RTX 4080, RTX 4090, etc.) es suficiente para inferencia.
- Compatibilidad con GPU consumer: sí, es el objetivo declarado del proyecto.
- Opciones de despliegue: transformers, vLLM, y GGUF mediante llama.cpp (repo separado). El soporte de Ollama está pendiente de la actualización de su versión empaquetada de llama.cpp.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

No se han publicado comparativas formales con otros modelos bíblicos en la información disponible. La única comparación documentada es contra la versión anterior del mismo proyecto (v1), cuyos resultados se detallan en la sección de benchmarks. Como referencia de la categoría, se puede considerar el modelo base Qwen3.5-4B, que ofrece capacidades generales de razonamiento y generación pero sin el ajuste especializado en citas bíblicas ni el entrenamiento en refusal pastoral. Tampoco se dispone de datos sobre alternativas comerciales o de otro tipo en el ámbito de Q&A bíblico con RAG.

## Limitaciones y advertencias

- Regresión en respuestas temáticas: el modelo tiende a listar versículos en lugar de explicar el contexto o sintetizar interpretaciones en preguntas abiertas ("explica el contexto del Salmo 23"). Es una limitación conocida del conjunto de datos, no del modelo base.
- Dependencia estricta de RAG: el modelo no está diseñado para usarse sin contexto recuperado; sin un retriever que proporcione los pasajes relevantes, su rendimiento se degrada significativamente.
- Sin red-teaming adversarial: el autor indica que el modelo no ha sido sometido a pruebas de adversario sistemáticas, por lo que puede ser vulnerable a entradas malintencionadas.
- No apto para consejo médico, legal o financiero: el modelo no debe utilizarse para estos fines.
- No apto para consejería pastoral o atención en crisis: está entrenado para redirigir estas consultas a un profesional o línea de ayuda, no para responderlas.
- No apto para decisiones teológicas autoritativas: el modelo no debe emplearse como fuente de autoridad doctrinal.
- Restricciones de despliegue: no se recomienda su uso no supervisado o a gran escala sin control humano.
- Idioma: solo inglés, sin soporte multilingüe.
- Licencia: Apache-2.0, permisiva para uso comercial, pero el autor no ofrece garantías sobre la exactitud teológica de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ttimms/bible-ai-assistant-qwen3.5-4b-v2
- Repositorio GGUF: https://huggingface.co/Ttimms/bible-ai-assistant-qwen3.5-4b-v2-GGUF
- Proyecto y pipeline RAG en GitHub: https://github.com/t-timms/bible-ai-assistant
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset smoltalk2 (fuente del bloque general_blend): https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
