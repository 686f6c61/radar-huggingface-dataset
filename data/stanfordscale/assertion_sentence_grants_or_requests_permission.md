# StanfordSCALE/assertion_sentence_grants_or_requests_permission

## Resumen

`StanfordSCALE/assertion_sentence_grants_or_requests_permission` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es determinar si un turno de habla de un docente constituye una aserción del tipo "la oración concede o solicita permiso" (por ejemplo, "Go ahead"). No es un modelo generativo: es un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` con una cabeza de regresión logística.

El modelo se entrenó sobre un subconjunto anotado por LLM de intervenciones docentes del TalkMoves Dataset, con 3.430 ejemplos de entrenamiento, 858 de desarrollo y 2.146 de test. La clase positiva es extremadamente rara (tasa base del 1,2 % en test), y el rendimiento publicado es bajo: F1 de 0,118 y recall de 0,077 en test, con ROC-AUC de 0,651. La propia model card advierte de que el modelo "no funciona lo bastante bien como para usarse por sí solo".

Su relevancia es, por tanto, metodológica y de investigación: forma parte de un conjunto de clasificadores de aserciones (assertions) pensados para auditar la codificación de diálogo en contextos educativos, y se distribuye como componente del paquete Python `EduBehaviors-kit`. Resulta útil como pieza de un pipeline de anotación asistida, nunca como clasificador autónomo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder tipo transformer (MPNet) + cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base `sentence-transformers/paraphrase-mpnet-base-v2` trabaja con entradas de hasta 384 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni ONNX documentadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `setfit`) |
| Pipeline | `text-classification` |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | `sentence-transformers/paraphrase-mpnet-base-v2` |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` |
| Columnas de salida | `assertion_sentence_grants_or_requests_permission`, `split_sentence_grants_or_requests_permission` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SetFit en dos fases: primero un ajuste contrastivo del encoder MPNet (cuerpo) con pares de frases, y después el entrenamiento de una cabeza de regresión logística sobre las representaciones congeladas. Los hiperparámetros declarados son learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 épocas, un máximo de 5.000 pasos en la fase contrastiva, 100 pasos máximos de evaluación, semilla 20260904 y precisión mixta activada en GPU. La entrada se construye pasando la intervención tal cual (`{utterance}`), sin plantilla adicional.

Los datos proceden del TalkMoves Dataset, restringido a intervenciones de docentes, y las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos. La concordancia entre anotadores medida con alfa de Krippendorff es de 0,500 para esta aserción. La tasa base de la clase positiva es del 1,2 % global (1,0 % en train, 2,1 % en dev, 1,2 % en test), lo que sitúa el problema en un régimen de desequilibrio extremo de clases. No se documentan fases de RLHF, DPO ni decodificación especulativa, algo esperable al tratarse de un clasificador y no de un modelo generativo.

## Capacidades

- Clasificación binaria de texto: devuelve 1 cuando el turno docente concede o solicita permiso y 0 en caso contrario, mediante `model.predict([texto])`.
- Puntuación probabilística: `model.predict_proba([texto])` devuelve `[[P(no), P(yes)]]`, lo que permite ordenar candidatos por confianza.
- Codificación de una aserción específica dentro de un esquema mayor de codificación de diálogo educativo (EduBehaviors).
- Procesamiento de intervenciones docentes individuales en inglés, sin contexto conversacional multi-turno.
- Integración programática vía `setfit` en scripts Python y cuadernos de análisis.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo y no produce texto.

## Casos de uso

- Investigación en discurso de aula: codificar automáticamente transcripciones del TalkMoves Dataset para estudiar con qué frecuencia los docentes conceden o solicitan permiso, usando el clasificador como primer filtro y validando una muestra con codificación humana.
- Anotación asistida con revisión humana obligatoria: emplear `predict_proba` para ordenar los turnos por probabilidad y revisar solo la cola superior, dado el bajo recall del modelo en su umbral actual.
- Formación de profesorado: analizar patrones de cesión de turno y concesión de permiso en grabaciones de prácticas docentes, siempre con verificación cualitativa posterior.
- Replicación y auditoría metodológica: reproducir el esquema de aserciones de EduBehaviors y auditar la trazabilidad de las etiquetas generadas por LLM frente a codificación humana.
- Aprendizaje activo: usar las puntuaciones del modelo para seleccionar los ejemplos más informativos que se enviarán a anotación humana, con el objetivo de reentrenar el clasificador con etiquetas de mayor calidad.
- Punto de partida para reentrenamiento: partir de este checkpoint y ajustar con un conjunto más amplio y anotado por humanos, aprovechando el ajuste contrastivo ya realizado sobre el dominio de discurso de aula.
- Análisis exploratorio a escala: descartar candidatos con probabilidad muy baja para reducir el volumen de texto que un equipo de investigación necesita inspeccionar manualmente, asumiendo la pérdida de recall que eso implica.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la model card (no verificados externamente, `verified: false`):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 2,1 % | 0,333 | 0,111 | 0,167 | 0,679 | 0,191 |
| test | 2.146 | 1,2 % | 0,250 | 0,077 | 0,118 | 0,651 | 0,135 |

El modelo solo declara resultados sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en ningún otro benchmark generalista en la información disponible, ni tendría sentido aplicárselos por tratarse de un clasificador de una aserción concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 109,5 M de parámetros ocupan aproximadamente 438 MB; en fp16 unos 219 MB. El repositorio completo pesa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (GTX 1650, T4, RTX 3060 o superiores). No se requieren A100 ni H100.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el cuello de botella es el encoder MPNet, no la cabeza logística.
- Opciones de despliegue: la vía documentada es la librería `setfit` (`pip install setfit`). También puede exportarse el encoder a `sentence-transformers` y servirse con FastAPI o类似; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. No se publican pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_grants_or_requests_permission` | 109,5 M | No disponible (base: 384 tokens) | Clasificación binaria de una aserción de discurso de aula | No disponible | F1 0,118 / ROC-AUC 0,651 en test |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base sin ajuste SetFit) | 109 M | 384 tokens | Embeddings de frases para similitud semántica | Apache-2.0 | No disponible |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 256 tokens | Embeddings de frases, alternativa ligera muy usada para clasificación con cabezas lineales | Apache-2.0 | No disponible |

Nota: los datos de parámetros, contexto y licencia de las dos alternativas provienen de la documentación pública de esos modelos base, no de la información de esta ficha. No se dispone de una comparación de rendimiento directa sobre el mismo conjunto de test para ninguno de ellos.

## Limitaciones y advertencias

- Rendimiento insuficiente para uso autónomo: la propia model card indica que el modelo no funciona lo bastante bien como para usarse por sí solo (F1 de 0,118 en test).
- Etiquetas generadas por LLM, no por humanos: la concordancia entre anotadores es de alfa de Krippendorff 0,500, un valor bajo que introduce ruido en el entrenamiento y la evaluación.
- Muestra positiva mínima: solo 26 ejemplos positivos en el split de test, por lo que las métricas publicadas tienen un margen de error muy amplio.
- Desequilibrio extremo de clases: tasa base del 1,2 % en test, lo que favorece predicciones negativas y explica el recall de 0,077.
- Dominio restringido: entrenado únicamente con intervenciones de docentes; el comportamiento sobre habla de estudiantes no está probado.
- Idioma: solo inglés. No hay soporte multilingüe ni evaluación en castellano.
- Sin contexto conversacional: clasifica una intervención aislada, sin información de turnos previos.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Métricas no verificadas: todos los resultados del `model-index` figuran con `verified: false`, es decir, son declaraciones del autor sin validación externa.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto libre), pero sí de falsos positivos y falsos negativos con precisión del 25 % en la clase positiva.
- Advertencia sobre la búsqueda web: los resultados devueltos por la búsqueda para este modelo no contenían material relevante sobre el mismo y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_grants_or_requests_permission
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio SumnerLab): https://github.com/SumnerLab/TalkMoves
- Librería SetFit: https://github.com/huggingface/setfit
- Cita declarada por el autor: Stanford SCALE Initiative, *Assertion classifier: sentence grants or requests permission*, 2026.
