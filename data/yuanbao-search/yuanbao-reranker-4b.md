# Yuanbao-Search/Yuanbao-Reranker-4B

## Resumen

Yuanbao-Reranker-4B es un modelo de reranking cross-encoder desarrollado por Yuanbao-Search, construido sobre el backbone Qwen3-4B. Dado un par formado por una instruccion de tarea, una query de busqueda y un documento candidato, el modelo emite una puntuacion de relevancia continua en el rango [0, 1], calculada como la probabilidad normalizada sobre los tokens de decision `yes` y `no`. Forma parte de una familia de tres tamanos (0.6B, 4B y 8B) orientada a pipelines de recuperacion de informacion y RAG.

El modelo aborda el problema del reranking fino en sistemas de busqueda de dos etapas: tras una recuperacion inicial por embeddings, el reranker reordena los candidatos con una evaluacion conjunta query-documento, mucho mas precisa que la similitud vectorial. Yuanbao-Reranker-4B cubre escenarios en chino, ingles, multilingue, documentos largos de hasta 8192 tokens y recuperacion de codigo.

Su relevancia actual reside en que supera a su propio profesor (Qwen3-Reranker-8B) con la mitad de parametros segun los datos del autor, y en que se distribuye con licencia Apache 2.0, lo que facilita su adopcion en produccion sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a ranking mediante clasificacion de tokens de decision |
| Parametros totales | 4.021.784.576 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | BF16 en los pesos publicados; otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles en la informacion |
| Idiomas soportados | Chino (zh), ingles (en) y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |
| Capas | 36 |
| Entrada | Instruccion (`<Instruct>`), query (`<Query>`) y documento (`<Document>`) |
| Salida | Probabilidad de relevancia en [0, 1] normalizada sobre `yes`/`no` |
| Tamano del repositorio | 8,1 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 36 capas, y lo reutiliza como cross-encoder de ranking: la secuencia completa (instruccion, query y documento) se procesa conjuntamente y la prediccion se extrae de los logits de los tokens `yes` y `no` en la ultima posicion. No emplea una cabeza de clasificacion adicional, sino que normaliza la probabilidad sobre esos dos tokens de vocabulario.

El entrenamiento se basa en tres componentes descritos por el autor. Primero, sintesis de datos anclada al documento (*document-grounded synthesis*) con generacion *answer-first* y guiada por tipo de query, que produce 2,75 millones de grupos de ranking con ratio 1:3. Segundo, un embudo de curacion en tres etapas: verificacion por el modelo profesor, deduplicacion semantica y asignacion de cuotas por fuente y longitud. Tercero, minado de negativos estratificado por dificultad (niveles *Hard*, *Medium* y *Moderate*) filtrado por el profesor con umbral Δ > 1.

La funcion de perdida combina entropia cruzada puntual sobre `yes`/`no` con un objetivo hinge pairwise unilateral acotado (*bounded minimum-gap preference distillation*) sobre pares positivo-negativo y negativo-negativo. Posteriormente se aplica un merging de modelos por capas mediante *Adaptive LERP*, que no anade coste de inferencia. El proceso de destilacion toma como profesor a Qwen3-Reranker-8B.

## Capacidades

- Reranking de pares query-documento con puntuacion de relevancia continua en [0, 1].
- Recuperacion de informacion en chino, ingles y escenarios multilingues.
- Manejo de documentos largos de hasta 8192 tokens en una sola pasada.
- Recuperacion de codigo (*code retrieval*) como dominio especifico de evaluacion.
- Acepta instrucciones de tarea personalizables mediante el prefijo `<Instruct>`, lo que permite adaptar el criterio de relevancia a distintos dominios.
- Integracion con vLLM para despliegue de alto rendimiento, ademas de transformers.
- Compatible con endpoints (tag `endpoints_compatible`).
- No dispone de modo thinking activo: el prompt de uso cierra el bloque `<think>` vacio antes de la respuesta.

## Casos de uso

- Reranking en pipelines RAG: tras una busqueda vectorial inicial, el modelo reordena los fragmentos recuperados con una evaluacion conjunta query-documento, mejorando la precision del contexto que se inyecta al LLM generador. Sus 8192 tokens de contexto permiten incluir pasajes largos sin truncado agresivo.
- Busqueda empresarial multilingue: en corpus con documentos en chino e ingles, el modelo puntua la relevancia real frente a la similitud coseno, reduciendo falsos positivos en consultas cruzadas entre idiomas.
- Recuperacion de codigo en asistentes de desarrollo: el soporte de code retrieval permite localizar funciones o fragmentos relevantes en repositorios grandes a partir de descripciones en lenguaje natural.
- Filtrado de contexto en agentes: antes de alimentar a un agente con resultados de herramientas de busqueda, el reranker descarta documentos irrelevantes, reduciendo el consumo de tokens y el riesgo de alucinacion por contexto ruidoso.
- Atencion al cliente con base de conocimiento: reordena articulos de ayuda y FAQs frente a la consulta del usuario para seleccionar la respuesta mas pertinente en sistemas de soporte automatizado.
- Deduplicacion y curacion de datasets: como scorer de relevancia instruible, puede usarse para filtrar pares query-documento de baja calidad en la construccion de corpus de entrenamiento.
- Evaluacion de sistemas de recuperacion: las puntuaciones continuas permiten calcular metricas de ranking (nDCG, MRR) y comparar configuraciones de recuperacion en A/B tests.

## Benchmarks y rendimiento

Datos publicados por el autor (media de cinco paneles: CMTEB-R, MMTEB-R, BEIR, MLDR y MTEB-Code):

| Modelo | Parametros | Media cinco paneles |
|---|---|---|
| Yuanbao-Reranker-8B | 8B | 74,21 |
| Yuanbao-Reranker-4B | 4B | 73,63 |
| Qwen3-Reranker-8B (profesor) | 8B | 72,68 |
| Qwen3-Reranker-4B | 4B | 72,13 |
| KaLM-Reranker-Large-R2 | no disponible | 69,73 |
| Yuanbao-Reranker-0.6B | 0,6B | 70,96 |

Desglose por panel individual no disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas memoria para activaciones y KV cache; en la practica se recomienda un minimo de 12-16 GB.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para despliegues con concurrencia.
- Consumer GPU: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en GPUs de 16 GB puede requerir cuantizacion o batch pequeno.
- Despliegue: transformers (soporte nativo documentado), vLLM (soporte explicito en la model card) y paquete propio `yuanbao-reranker`. Soporte en llama.cpp u Ollama no disponible en la informacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El contexto maximo de 8192 tokens implica que pares query-documento largos elevan el coste de atencion; conviene truncar documentos o trocearlos antes del reranking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media cinco paneles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yuanbao-Reranker-4B | 4B | 8.192 | 73,63 | Apache 2.0 | Hugging Face |
| Qwen3-Reranker-4B | 4B | no disponible | 72,13 | no disponible | Hugging Face |
| Qwen3-Reranker-8B | 8B | no disponible | 72,68 | no disponible | Hugging Face |
| Yuanbao-Reranker-8B | 8B | 8.192 | 74,21 | Apache 2.0 | Hugging Face |
| KaLM-Reranker-Large-R2 | no disponible | no disponible | 69,73 | no disponible | no disponible |

Yuanbao-Reranker-4B iguala o supera a modelos del doble de tamano segun los datos del autor, con la ventaja adicional de una licencia Apache 2.0 explicita.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor; no se dispone de verificacion independiente en la informacion proporcionada.
- El modelo es un reranker, no un generador: no debe usarse para producir texto libre, solo para puntuar relevancia.
- La ventana de 8192 tokens limita el reranking de documentos muy largos; es necesario truncar o trocear.
- El soporte linguistico declarado se centra en chino e ingles; el rendimiento en otras lenguas no esta cuantificado.
- Riesgo de sesgo heredado del corpus de entrenamiento sintetico y del backbone Qwen3; no se documentan evaluaciones de sesgo.
- La calibracion de las puntuaciones depende de la instruccion proporcionada; instrucciones mal formuladas degradan la calidad del ranking.
- El uso de `trust_remote_code=False` en el ejemplo sugiere que no requiere codigo remoto, pero conviene verificar la version de transformers compatible.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3-4B puede tener condiciones adicionales que deben revisarse antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-4B
- Variante 0.6B: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-0.6B
- Variante 8B: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-8B
- Repositorio GitHub (codigo y evaluacion): https://github.com/Yuanbao-Search/Yuanbao-Reranker
- Coleccion en Hugging Face: https://huggingface.co/collections/Yuanbao-Search/yuanbao-reranker-6aeda9e8d327ee5c9b20c9d6
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
