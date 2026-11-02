# thisisdineth/apilageai

## Resumen

ApilageAI es un asistente de estudio local orientado a la asignatura G.C.E. A/L ICT de Sri Lanka, publicado en HuggingFace por el usuario thisisdineth. No se trata de un modelo entrenado desde cero ni de un fine-tuning sobre los materiales de estudio: es una modificación de los metadatos de un build QAT de Gemma 4 E2B distribuido por Ollama (`gemma4:e2b-it-qat`), con los pesos sin alterar y un tamaño de contexto ajustado a 6144 tokens. La recuperación de conocimiento se realiza mediante RAG en tiempo de consulta sobre tres publicaciones del National Institute of Education de Sri Lanka.

El modelo responde en inglés y cingalés (si), cita la página del PDF de origen y declina responder cuando no encuentra evidencia en los documentos indexados. El repositorio incluye el pipeline completo de extracción, indexación, servidor local y evaluación, lo que lo convierte en una plantilla reproducible para asistentes RAG educativos más que en un modelo de propósito general.

Su relevancia es doble: por un lado, ejemplifica un patrón de despliegue de bajo coste (Ollama sobre un MacBook Air M1 con 8 GB de RAM); por otro, documenta de forma inusualmente honesta sus métricas reales y sus debilidades, incluyendo que no alcanza el objetivo de precisión del 99 % que se había fijado el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B, build QAT distribuido por Ollama); pesos sin modificar |
| Parametros totales | 475.729.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 6144 tokens (configurado en el Modelfile) |
| Tipos de cuantizacion | QAT (quantization-aware training) según el build `gemma4:e2b-it-qat`; nivel exacto de bits no disponible |
| Idiomas soportados | Inglés (en), cingalés (si) |
| Licencia | Apache 2.0 (los textos de los libros en `rag/data/` NO están cubiertos por esta licencia) |
| Formato de pesos | GGUF (repositorio preparado para Ollama), con carpeta `model/` y `Modelfile` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E2B, un transformer decoder-only de aproximadamente 476 millones de parámetros en su build QAT. ApilageAI no introduce ningún entrenamiento ni fine-tuning: según la model card, los únicos cambios respecto al original son el nombre y los campos de metadatos de finetune (que ahora leen `apilageai`) y el tamaño de contexto fijado en 6144 tokens. Los pesos son idénticos a los del build `gemma4:e2b-it-qat` de Ollama.

La innovación técnica no reside en el modelo sino en el pipeline RAG que lo acompaña. El repositorio incluye `rag/extract.js` para extraer texto de los PDF, `rag/build_index.pl` para construir el índice, `serve.pl` como servidor HTTP local en el puerto 8765 y `rag/evaluate.pl` para ejecutar la batería de pruebas. La recuperación utiliza el modelo de embeddings `nomic-embed-text` de Ollama. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque no hubo entrenamiento sobre estos datos.

## Capacidades

- Generación de texto y respuesta a preguntas en inglés y cingalés sobre el temario de G.C.E. A/L ICT.
- Recuperación aumentada (RAG) sobre tres publicaciones del National Institute of Education: el syllabus de A/L ICT, la guía del profesor de Grade 12 y el libro de recursos de Grade 13.
- Citación de la página del PDF de origen en las respuestas.
- Rechazo explícito de preguntas fuera de dominio: 10 de 10 rechazos correctos en la última ejecución evaluada.
- Modo thinking opcional, que mejora la calidad de las respuestas a costa de latencia (unos 41 segundos frente a 13 segundos por respuesta).
- Instrucción de declinar preguntas sobre el modelo subyacente que lo alimenta.
- Despliegue local mediante Ollama, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas simbólicas más allá de lo que el modelo base pueda ofrecer.

## Casos de uso

- Estudio autónomo de G.C.E. A/L ICT: un estudiante formula preguntas sobre el temario y recibe respuestas con la página del libro citada, lo que le permite verificar cada afirmación contra la fuente original.
- Despliegue en equipos de bajo recursos: el autor lo ha probado en un MacBook Air M1 con 8 GB de RAM, con respuestas en torno a 13 segundos, lo que lo hace viable en portátiles de gama media sin GPU dedicada.
- Reproducción de un pipeline RAG educativo: el repositorio sirve como plantilla completa (extracción, indexación, servidor y evaluación) para construir asistentes sobre otros corpus documentales sustituyendo los libros y reejecutando `rag/build_index.pl`.
- Evaluación de sistemas RAG: `rag/evaluate.pl` permite medir precisión por coincidencia de palabras clave y por lectura manual, útil para comparar configuraciones de recuperación o de prompting.
- Asistencia bilingüe inglés-cingalés: útil para estudiantes que preparan la asignatura en inglés pero necesitan apoyo puntual en cingalés, aunque la calidad en este idioma es desigual.
- Prototipado de asistentes locales con Ollama: el `Modelfile` y el servidor Perl mínimo permiten levantar un endpoint HTTP en red local sin infraestructura adicional, adecuado para demos y pruebas internas.
- Formación de profesorado: la guía del profesor y el libro de recursos están indexados, de modo que un docente puede consultar cómo se aborda un concepto concreto en el material oficial.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones propias del autor, no benchmarks estándar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares.

| Prueba | Coincidencia de palabras clave | Lectura de respuestas |
|---|---|---|
| 30 preguntas nuevas en inglés (no usadas en ajuste) | 28/30 | ~24/30 |
| 5 preguntas nuevas en cingalés | 5/5 encontraron la página correcta | ~3/5 |
| 97 preguntas respondibles + 10 fuera de tema | 93/107 | no reevaluado por completo |
| Rechazo de preguntas fuera de tema | 10/10 | no aplica |
| Modo thinking, 30 preguntas nuevas (palabras clave) | 33/35 | no evaluado por completo |

Latencia medida: aproximadamente 13 segundos por respuesta en modo normal y unos 41 segundos en modo thinking, sobre un MacBook Air M1 con 8 GB de RAM. No se dispone de datos de throughput agregado.

## Requisitos de hardware

- VRAM/RAM estimada: el autor reporta funcionamiento con 8 GB de RAM unificada en un MacBook Air M1, con memoria ajustada. Para el tamaño de 476 M de parámetros en GGUF QAT, la huella es modesta, pero el índice RAG y el modelo de embeddings añaden consumo.
- GPU recomendadas: no se especifican. El caso probado es Apple Silicon (M1). Cualquier GPU consumer con 8 GB o más debería poder alojar el modelo, aunque no hay datos publicados de rendimiento en CUDA.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, si bien no está verificado por el autor.
- Opciones de despliegue: Ollama es el método documentado (`ollama create apilageai -f Modelfile`); el servidor `serve.pl` expone la interfaz en http://localhost:8765. No se documenta compatibilidad con vLLM, TGI ni llama.cpp directo.
- Dependencias adicionales: `nomic-embed-text` vía Ollama para los embeddings del RAG.
- Latencia: ~13 s por respuesta en modo normal y ~41 s en modo thinking sobre M1 con 8 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ApilageAI | 475,7 M | 6144 | RAG educativo sobre Gemma 4 E2B | Apache 2.0 (libros excluidos) | HuggingFace + Ollama |
| Gemma 4 E2B (base) | ~476 M (build QAT) | según build de Ollama | Modelo generalista | Términos de Gemma | Ollama |
| Asistentes RAG educativos genéricos | variable | variable | RAG sobre corpus propio | variable | variable |

No se dispone de información sobre otros asistentes RAG comparables publicados con métricas equivalentes, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Precisión real por debajo del objetivo: el autor reconoce que no se alcanzó el 99 % y que la evaluación se hizo por palabras clave y lectura, no línea a línea contra los libros; los exámenes reales podrían puntuar peor.
- Errores de contenido: pasos en orden incorrecto, temas descritos como otros, fórmulas y tablas mal extraídas (se cita explícitamente la ley de De Morgan como caso problemático).
- Diagramas e imágenes no indexados, lo que deja fuera parte del material didáctico.
- Cobertura desigual: la Unidad 8 (Database Management) apenas está cubierta por los libros indexados.
- Calidad irregular en cingalés, con posibilidad de citas inválidas.
- El modo thinking mejora algunos resultados pero multiplica la latencia por tres y no fue evaluado por completo.
- Licencia: los pesos y el código son Apache 2.0, pero los textos extraídos en `rag/data/` pertenecen al National Institute of Education de Sri Lanka y no están cubiertos por esa licencia; su uso comercial o redistribución requiere atención.
- El servidor `serve.pl` escucha en la red local sin autenticación ni cifrado; solo debe ejecutarse en redes de confianza.
- El chat está instruido para no revelar información sobre el modelo subyacente, lo que puede dificultar la depuración.
- Riesgo de alucinación inherente a un modelo de 476 M de parámetros, mitigado parcialmente por la citación de páginas pero no eliminado.
- Sin datos publicados de sesgos; al ser un modelo pequeño y con RAG restringido a un corpus concreto, el riesgo principal es la incorrección factual más que el sesgo ideológico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thisisdineth/apilageai
- Ollama: https://ollama.com
- Modelo de embeddings `nomic-embed-text` (vía Ollama): https://ollama.com/library/nomic-embed-text
- Repositorio del proyecto: incluido en el propio repo de HuggingFace (carpetas `model/`, `rag/`, `serve.pl`, `LICENSE`)
