# Waqf-AI/arabic-modernbert-unified

## Resumen

Arabic ModernBERT Unified es un codificador de texto en arabe desarrollado por Waqf-AI, disenado como una alternativa compacta y eficiente para tareas de comprension del lenguaje natural en arabe. Con solo 32,79 millones de parametros para el modelado de lenguaje enmascarado (MLM) y 32,94 millones incluyendo todas las cabezas de tarea, el modelo integra en un unico checkpoint cuatro funcionalidades: prediccion de palabras enmascaradas, inferencia de lenguaje natural (NLI) de tres clases, QA extractiva y embeddings de frases de 384 dimensiones. Esta construido sobre una columna vertebral ModernBERT de ocho capas, con un ancho oculto de 384 y seis cabezas de atencion, y un tokenizador BPE especifico para arabe de 48.000 entradas.

El modelo resuelve el problema de disponer de un codificador arabe de proposito general que no exija los recursos de modelos mucho mas grandes como AraBERTv2 (135,26M) o NAMAA AraModernBERT (149,59M). Al unificar MLM, NLI, retrieval y QA en un solo artefacto de aproximadamente 131 MB en FP32 safetensors, facilita el despliegue en entornos con recursos limitados y reduce la fragmentacion de checkpoints que suele acompanar a los pipelines de NLP arabe.

Es relevante ahora porque combina la eficiencia arquitectonica de ModernBERT (atencion lineal y contexto configurado de 4.096 tokens, frente a los 512 de AraBERTv2) con un presupuesto de entrenamiento documentado y reproducible: 2.508B tokens de contenido sobre el subconjunto arabe de FineWeb2-HQ, seguido de una fase de continuacion de tareas y una adaptacion unificada final. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT, 8 capas, ancho oculto 384, 6 cabezas de atencion |
| Parametros totales | 32.790.144 (MLM); 32,94M con todas las cabezas de tarea |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens configurados; 1.024 tokens por bloque en el preentrenamiento HQ |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32); encoder + MLM ~131 MB, cabezas auxiliares ~0,60 MB |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT de ocho capas con atencion lineal, ancho oculto de 384 y seis cabezas de atencion, sobre un tokenizador BPE orientado al arabe con 48.000 entradas. El checkpoint unificado anade cabezas especificas: una cabeza MLM, un clasificador NLI de tres vias que usa el estado oculto del primer token, una cabeza QA extractiva que mapea cada estado oculto a logits de inicio y fin, y una ruta de retrieval que aplica mean-pooling sobre tokens no especiales, una proyeccion aprendida y normalizacion L2 para producir vectores de 384 dimensiones. Los pesos se inicializaron de forma aleatoria (no hay herencia de un modelo previo).

El entrenamiento se organizo en tres fases. Primero, un unico pase sobre el subconjunto `arb_Arab` retenido de FineWeb2-HQ (revision fijada en `c0c06e94fd3a44ae9e802b2b0fc533817601eb5e`), que tras limpieza, exclusion de solapamientos y deduplicacion exacta retuvo 3.098.999 documentos y 18,30 GB de texto UTF-8 limpio; el modelo vio 2.508B tokens de contenido y 2.517B posiciones atendidas en 142.210 actualizaciones con enmascaramiento del 15%. Segundo, una fase de continuacion de lenguaje y tareas con Wikipedia arabe fusionada, replay de lenguaje de HQ y XL-Sum arabe, NLI arabe, TyDi QA y ejemplos de dominio filtrados, con un presupuesto reconstruido de aproximadamente 778M posiciones atendidas (incluyendo el replay). Tercero, una adaptacion unificada de 1.000 actualizaciones que combino MLM, NLI con supervision de profesor, retrieval contrastivo con alineacion a vectores de profesor y replay de QA extractiva; el MLM de dominio incluyo texto de Nawah y Waqfeya filtrado. No se documenta RLHF ni DPO, dado que se trata de un encoder y no de un modelo generativo.

## Capacidades

- Prediccion de palabras enmascaradas (fill-mask) en arabe mediante la pipeline estandar de Transformers.
- Inferencia de lenguaje natural (NLI) de tres clases: entailment, neutral y contradiction, con cabeza nativa liberada.
- QA extractiva: se codifica la pregunta como primera secuencia y el contexto como segunda, usando solo los offsets del contexto para los tramos de respuesta.
- Embeddings de frases de 384 dimensiones para retrieval y similitud semantica, con mean-pooling, proyeccion aprendida y normalizacion L2.
- Recuperacion de informacion (retrieval) con cabeza nativa y con sonda congelada.
- Soporte de tool calling / function calling: no disponible (es un encoder, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al arabe (unico idioma declarado).
- Capacidades especiales: contexto configurado de 4.096 tokens, tokenizador BPE arabe de 48.000 entradas; sin vision ni audio.

## Casos de uso

- Busqueda semantica en corpus arabes: el modelo genera embeddings de 384 dimensiones con mean-pooling y normalizacion L2, lo que permite indexar documentos y consultas en un espacio vectorial compacto y ejecutar retrieval R@1/R@5 con una cabeza nativa que alcanza 55,27%/77,73% en las 512 consultas de evaluacion.
- Clasificacion de pares de frases en NLI: con la cabeza nativa de tres vias y el estado oculto del primer token, se puede usar para detectar contradicciones o implicaciones en pares pregunta-respuesta, deduplicacion semantica o verificacion de afirmaciones, con una precision de 74,12% en 1.024 pares.
- QA extractiva sobre documentos arabes: codificando la pregunta como primera secuencia y el contexto como segunda, la cabeza `model.qa` produce logits de inicio y fin, adecuada para asistentes de lectura comprensiva o extraccion de respuestas en bases documentales.
- Autocompletado y correccion ortografica en arabe: la pipeline fill-mask permite predecir palabras enmascaradas con top-k candidatos, util en editores de texto, teclados predictivos o herramientas de escritura asistida.
- Filtrado y enriquecimiento de datasets arabes: las representaciones de frase y la cabeza NLI permiten eliminar duplicados semanticos, etiquetar pares y construir conjuntos de entrenamiento de mayor calidad sin depender de modelos de 135M+ parametros.
- Despliegue en entornos con recursos limitados: con aproximadamente 131 MB en FP32 para encoder y MLM, el modelo cabe en CPU y en GPUs de gama baja, lo que lo hace adecuado para servicios de NLP arabe en el borde o en contenedores pequenos.
- Clasificacion y enrutamiento de texto a gran escala: el bajo coste computacional de un encoder de 32,79M parametros permite procesar volumenes altos de documentos arabes para etiquetado, moderacion o enrutamiento previo a modelos mayores.

## Benchmarks y rendimiento

Los resultados publicados corresponden a porcentajes Luna → Terra sobre 100 casos arabes compartidos por tarea. El MLM acredita respuestas exactas y completaciones plausibles aceptadas por el juez; NLI mide la concordancia del juez; retrieval mide si los mejores resultados incluyen una frase relevante juzgada. Todos los checkpoints usaron el mismo protocolo de sonda congelada para NLI y retrieval.

| Checkpoint | Parametros MLM | Contexto configurado | MLM top-1 / top-5 | Concordancia NLI | Retrieval R@1 / R@5 |
|---|---:|---:|---:|---:|---:|
| **Arabic ModernBERT Unified** | **32,79M** | **4.096** | **70/100 → 65/88** | **68 → 59** | **48/61 → 42/53** |
| Waqf-AI ArabicBertHash v2 | 49,41M | 2.048 | 65/93 → 48/76 | 37 → 41 | 31/39 → 27/35 |
| AraBERTv2 | 135,26M | 512 | 82/98 → 81/89 | 49 → 40 | 55/64 → 50/58 |
| NAMAA AraModernBERT | 149,59M | 8.192 | 84/97 → 78/95 | 34 → 35 | 47/62 → 42/55 |
| Arabic MiniBERT | 11,58M | 512 | 30/78 → 35/74 | 35 → 32 | 46/63 → 41/57 |

Resultados con referencia exacta y cabezas nativas:

| Protocolo | Puntuacion de Unified |
|---|---:|
| MLM de palabra completa exacta top-1 / top-5, 201 casos compartidos elegibles a token unico | 16,92% / 30,35% |
| Sonda NLI congelada, 1.024 pares | 71,68% de precision |
| **Cabeza NLI nativa liberada**, mismos pares | **74,12% de precision** |
| Sonda de retrieval congelada, 512 consultas | 53,13% / 76,76% R@1 / R@5 |
| **Cabeza de retrieval nativa liberada**, mismas consultas | **55,27% / 77,73% R@1 / R@5** |

Unified usa un 78% menos parametros MLM que NAMAA; en estos casos queda a dos puntos de NAMAA en retrieval de frases, mientras que NAMAA lidera por 13-14 puntos en MLM top-1. Unified lidera las tres lineas base publicas en concordancia NLI tras su propia adaptacion supervisada. Los pesos de encoder de los checkpoints publicos permanecieron congelados. Unified usa un 34% menos parametros MLM que ArabicBertHash v2 y puntua mas alto en las cinco metricas reportadas bajo ambos jueces.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 131 MB para encoder + MLM en FP32; con las cabezas auxiliares (~0,60 MB) el checkpoint completo ronda los 132 MB. Cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes o baja latencia, cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer y en la mayoria de entornos integrados.
- Opciones de despliegue: pipeline `fill-mask` de Transformers; el repositorio incluye `unified_encoder.py` con `UnifiedArabicEncoder` para embeddings, NLI y QA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos generativos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros MLM | Contexto | MLM top-1 (Luna/Terra) | NLI (Luna/Terra) | Retrieval R@1/R@5 (Luna/Terra) | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Arabic ModernBERT Unified | 32,79M | 4.096 | 70/100 → 65/88 | 68 → 59 | 48/61 → 42/53 | Apache-2.0 |
| Waqf-AI ArabicBertHash v2 | 49,41M | 2.048 | 65/93 → 48/76 | 37 → 41 | 31/39 → 27/35 | Apache-2.0 |
| AraBERTv2 | 135,26M | 512 | 82/98 → 81/89 | 49 → 40 | 55/64 → 50/58 | no disponible en la informacion proporcionada |
| NAMAA AraModernBERT | 149,59M | 8.192 | 84/97 → 78/95 | 34 → 35 | 47/62 → 42/55 | no disponible en la informacion proporcionada |

Unified es el segundo modelo mas pequeno de la comparativa por detras de Arabic MiniBERT (11,58M), pero supera a este en MLM y NLI. Frente a ArabicBertHash v2, usa un 34% menos parametros MLM y puntua mas alto en las cinco metricas reportadas. Frente a NAMAA, usa un 78% menos parametros MLM y queda a dos puntos en retrieval, aunque NAMAA lidera en MLM top-1. Frente a AraBERTv2, Unified pierde en MLM y retrieval pero gana en NLI y ofrece un contexto ocho veces mayor (4.096 frente a 512).

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en arabe; no se declara soporte para otros idiomas, por lo que su uso en textos multilingues o code-switching no esta validado.
- Es un encoder, no un modelo generativo: no puede generar texto libre, mantener conversaciones ni ejecutar tool calling o razonamiento multi-paso.
- Riesgo de alucinacion en sentido generativo: no aplica como tal, pero las predicciones MLM pueden producir completaciones plausibles no exactas; la evaluacion exacta de palabra completa top-1 es solo del 16,92% en 201 casos elegibles a token unico.
- El contexto configurado es de 4.096 tokens, pero el preentrenamiento HQ uso bloques de hasta 1.024 tokens; el rendimiento mas alla de ese rango no esta documentado.
- Los pesos se inicializaron de forma aleatoria y el modelo fue entrenado desde cero, sin herencia de un checkpoint previo; esto puede implicar menor cobertura linguistica que modelos preentrenados sobre corpus mas amplios.
- En MLM top-1, NAMAA AraModernBERT supera a Unified por 13-14 puntos en los casos compartidos, por lo que para esa tarea concreta puede ser preferible.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar las licencias de los datasets de entrenamiento (FineWeb2-HQ, XL-Sum, TyDi QA, Nawah, Waqfeya) si se redistribuye el modelo o se alega procedencia de datos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 2026-11-06; su adopcion y validacion por la comunidad son practicamente inexistentes.
- La model card referencia el ID `Abdelkareem/arabic-modernbert-unified` en los ejemplos, distinto del ID del repositorio `Waqf-AI/arabic-modernbert-unified`; conviene comprobar cual es el checkpoint correcto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Waqf-AI/arabic-modernbert-unified
- Modelo comparable ArabicBertHash v2: https://huggingface.co/Waqf-AI/arabic-berthash-v2
- Organizacion Waqf-AI en Hugging Face: https://huggingface.co/Waqf-AI/models
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Manifiesto de entrenamiento (referenciado en la model card): `training_summary.json` en el repositorio del modelo
- Script de ejemplo (referenciado en la model card): `example.py` en el repositorio del modelo
