# thelamapi/Next-Trace

## Resumen

Next Trace es un modelo de recuperación de evidencia para question answering desarrollado por el usuario thelamapi (proyecto Next Lab). No es un modelo generativo de lenguaje: su tarea es, dado un documento y una pregunta en turco o inglés, identificar la frase o frases del documento que sustentan la respuesta, o bien declarar explícitamente que el documento no contiene evidencia suficiente para responder (abstención). Se implementa como un reranker aprendido de 18 características léxicas ligeras de idioma sobre una red MLP, combinado con una cabeza de answerability basada en regresión logística, y se compara contra una línea base BM25.

El modelo es relevante ahora porque aborda dos problemas prácticos de los sistemas RAG: la localización de evidencia verificable (citabilidad) y la abstención calibrada ante preguntas sin respuesta en el documento. Su enfoque es deliberadamente ligero: no requiere GPU para inferencia (la librería declarada es numpy y existe un port a JavaScript que corre íntegramente en el navegador), lo que lo hace atractivo para despliegues con requisitos de latencia y coste bajos. El soporte de turco es zero-shot: no se usó texto turco en entrenamiento ni en el ajuste de umbrales.

La ficha se basa exclusivamente en la model card publicada. No hay información sobre el número de parámetros del modelo, el volumen de datos de entrenamiento más allá de los splits de SQuAD 2.0, ni resultados de benchmarks estándar de QA generativo, por lo que esos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reranker de frases: MLP 18→32→32→1 (BCE) + cabeza de answerability por regresión logística sobre 9 características de documento |
| Parametros totales | no disponible (MLP de 18→32→32→1 y regresión logística; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre documentos completos; las estadísticas BM25 se diluyen en documentos largos según el autor) |
| Tipos de cuantizacion | no disponible (inferencia en numpy; port a JavaScript en el navegador) |
| Idiomas soportados | tr (turco, zero-shot), en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | no disponible (librería numpy; no se especifica formato de serialización) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes. El primero es un reranker de frases que puntúa cada frase del documento combinando 18 características: BM25 normalizado y por rango, masa IDF de términos emparejados y ausentes, mejor término clave ausente, Jaccard de 4-gramas de caracteres, solapamiento de bigramas, señales de tipo de pregunta (when/kaç frente a dígitos, who/kim frente a nombres en mayúscula), longitud, posición, puntuaciones de frases vecinas, fuerza BM25 a nivel de documento, proporción de términos de la pregunta ausentes del documento completo y números de la pregunta que faltan en la frase (por ejemplo, 2019 frente a 2020). La tokenización y el troceado de frases son "language-light": minúsculas conscientes del turco, stems de 5 letras y stop words de TR+EN.

El reranker se entrena con BCE sobre los artículos de entrenamiento de SQuAD 2.0 (split A, 126.503 preguntas). La cabeza de answerability es una regresión logística sobre 9 características de documento, entrenada en el split B. Los splits se hacen por título de artículo y se añaden preguntas sin respuesta generadas preguntando contra otro párrafo del mismo artículo. Los umbrales se fijan en el split V (answerable ≥ 0,60; BM25 ≥ 2,79). XQuAD y SQuAD dev son solo de test. Existe un port línea a línea a JavaScript con paridad verificada en Node sobre 9 documentos (diferencia absoluta máxima 1,6653345369377348e-16).

## Capacidades

- Localización de evidencia: marca las frases del documento en las que se sustenta la respuesta a una pregunta.
- Abstención explícita: declara que el documento no contiene evidencia suficiente cuando la pregunta no es respondible con el texto.
- Question answering extractivo a nivel de frase (no genera la respuesta, selecciona la evidencia).
- Soporte bilingüe inglés-turco, con turco en régimen zero-shot.
- Comparación integrada con línea base BM25 en el Space asociado.
- Ejecución en navegador mediante port a JavaScript, sin backend ni GPU.
- Inferencia en numpy, sin dependencias de frameworks de deep learning.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido: no es un modelo generativo.

## Casos de uso

- Verificación de citas en sistemas RAG: dado un fragmento recuperado y la pregunta del usuario, el modelo devuelve la frase exacta que sustenta la respuesta, lo que permite mostrar la cita al usuario y auditar la respuesta generada por otro modelo.
- Filtrado de abstención en pipelines de atención al cliente: si el documento de la base de conocimiento no contiene evidencia, el sistema deriva a un agente humano en lugar de responder con una alucinación; la tasa de abstención correcta en XQuAD-tr es 0,972.
- Búsqueda documental interna en turco: con 0,788 de trace accuracy zero-shot en XQuAD-tr, es adecuado para localizar el pasaje relevante en manuales, normativas o contratos en turco sin necesidad de un modelo turco específico.
- Enriquecimiento de datasets de evaluación: el modelo puede preetiquetar frases de evidencia en corpus de QA para revisión humana posterior, reduciendo el coste de anotación.
- Despliegue en el navegador o en edge: gracias al port a JavaScript y a la inferencia numpy, puede integrarse en aplicaciones web estáticas o entornos sin GPU para resaltar evidencia en documentos del usuario.
- Detección de preguntas fuera de alcance en asistentes documentales: la cabeza de answerability permite descartar consultas que el corpus no cubre antes de invocar un modelo generativo, ahorrando coste de inferencia.
- Comparación de estrategias de recuperación: el Space asociado permite contrastar BM25 frente a Next Trace sobre documentos propios, útil para decidir si merece la pena añadir un reranker aprendido.

## Benchmarks y rendimiento

Resultados publicados en la model card (BM25 + umbral → Next Trace):

| Conjunto de test | Preguntas | Trace accuracy | Evidence@1 (respondibles) | Abstención correcta (no respondibles) | Respondidas (respondibles) |
|---|---:|---:|---:|---:|---:|
| SQuAD2-dev (EN, no respondibles adversariales) | 11873 | 0,492 → **0,510** | 0,825 → 0,842 | 0,415 → 0,318 | 0,645 → 0,801 |
| XQuAD-tr (TR, zero-shot) | 2327 | 0,719 → **0,788** | 0,770 → 0,803 | 0,934 → 0,972 | 0,612 → 0,721 |
| XQuAD-en (EN) | 2319 | 0,732 → **0,820** | 0,803 → 0,824 | 0,953 → 0,965 | 0,606 → 0,790 |

La trace accuracy cuenta como correcta una pregunta respondible solo si el sistema responde y cita primero la frase gold, y una no respondible solo si se abstiene. En los no respondibles adversariales de SQuAD 2.0, la frase citada contenía la respuesta plausible pero incorrecta de los anotadores en el 44,6 % de los casos con BM25 frente al 51,6 % con Next Trace. El autor indica que los ejemplos de fallo de cada conjunto de test están en `evaluation.json`. No se han publicado resultados de benchmarks estándar de QA generativo (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en numpy sobre CPU y no requiere GPU según la información publicada.
- GPU recomendadas: no aplica para inferencia; el autor menciona una NVIDIA L4 únicamente como hardware empleado en la evaluación.
- Cabe en GPU consumer: sí, y también en CPU; el port a JavaScript corre íntegramente en el navegador.
- Opciones de despliegue: script `inference.py` (con modo `--selftest`), port a JavaScript en Node y en navegador, y Space de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next Trace | Reranker de frases + abstención (MLP + regresión logística) | tr, en | no disponible | cc-by-sa-4.0 | Hugging Face (modelo y Space) |
| BM25 (línea base del autor) | Recuperación léxica | independiente del idioma | no aplica | según implementación | ampliamente disponible |
| Modelos de QA extractivo tipo BERT (p. ej. fine-tunes de SQuAD 2.0) | Transformer encoder con clasificación de respuesta y abstención | según checkpoint | típicamente 512 tokens | según checkpoint | Hugging Face |
| Cross-encoders de reranking (p. ej. familia MiniLM/MS MARCO) | Transformer cross-encoder | mayoritariamente en | típicamente 512 tokens | según checkpoint | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada: el autor solo publica la comparación interna frente a BM25.

## Limitaciones y advertencias

- Selecciona frases de evidencia; no redacta la respuesta. No debe presentarse como un modelo de QA generativo.
- Las características son léxicas: las paráfrasis sin solapamiento de palabras y las preguntas multi-hop son difíciles.
- Los documentos largos diluyen las estadísticas BM25, lo que puede degradar la selección de evidencia.
- El rendimiento en turco se mide únicamente sobre XQuAD traducido y en régimen zero-shot; no hay validación en corpus turcos nativos.
- La abstención en no respondibles adversariales de SQuAD 2.0 empeora frente a BM25 (0,415 → 0,318), aunque aumenta la cobertura de respondidas (0,645 → 0,801); es un compromiso explícito que debe calibrarse según el caso de uso.
- La licencia cc-by-sa-4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar su compatibilidad con el producto antes de un uso comercial.
- Los datos de entrenamiento (SQuAD 2.0 y XQuAD) son CC BY-SA 4.0, lo que arrastra condiciones de atribución y compartición.
- No se documentan sesgos específicos ni evaluación de robustez fuera de los conjuntos citados; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente conocida.
- No se especifican parámetros totales ni formato de pesos, lo que dificulta la reproducibilidad y el versionado del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Trace
- Space de demostración: https://huggingface.co/spaces/thelamapi/Next-Trace
- SQuAD 2.0 (Rajpurkar et al., 2018): https://huggingface.co/datasets/rajpurkar/squad_v2
- XQuAD (Artetxe et al., 2020): https://huggingface.co/datasets/google/xquad
- Repositorio o paper del modelo: no disponible
