# ThakiCloud/Thaki-ER119-Triage-KO

## Resumen

Thaki-ER119-Triage-KO es un clasificador de texto en coreano desarrollado por ThakiCloud que procesa transcripciones de llamadas de emergencia al 119 (servicio de emergencias de Corea del Sur) para predecir tres etiquetas: urgencia (3 niveles), tipo de desastre (4 clases) y subtipo (16 clases). El modelo se construye mediante fine-tuning de BAAI/bge-m3, un encoder multilingüe, con tres cabezas lineales independientes añadidas sobre la representación CLS.

El modelo resuelve un problema concreto de triaje asistido: dado un diálogo entre operador y llamante, estima la gravedad de la situación y la categoría del incidente. Puede evaluar la llamada completa o únicamente los primeros 30 o 60 segundos, lo que resulta relevante para escenarios en los que la decisión debe tomarse antes de que termine la conversación.

Se publica como *research preview* y el propio autor advierte explícitamente de que no es apto para triaje automatizado: su macro-F1 de urgencia en una región no vista durante el entrenamiento (Gwangju) es de 0,5388, lo que implica que aproximadamente una de cada dos llamadas recibe un nivel de urgencia incorrecto. Es relevante ahora como referencia metodológica de evaluación rigurosa (gates pre-registrados, intervalos de confianza por bootstrap, evaluación out-of-distribution) más que como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base BAAI/bge-m3) con tres cabezas lineales de clasificación |
| Parámetros totales | 567.754.752 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (truncado en la entrada) |
| Tipos de cuantización | no disponible (pesos en safetensors, probablemente bf16/fp32) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (encoder + `heads.safetensors`), módulo de inferencia en Python (`er119_triage.py`) |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder basado en la familia XLM-RoBERTa con 567 millones de parámetros, y le añade tres cabezas lineales independientes sobre la representación del token CLS. La entrada se construye uniendo los turnos de la conversación en orden temporal con el formato `[화자{speaker}] {text}`, donde el hablante 0 es el operador y el 1 el llamante, y se trunca a 1.024 tokens. El pooling es CLS estándar.

El entrenamiento se realizó sobre transcripciones humanas de llamadas al 119 de Seúl e Incheon, con evaluación principal sobre llamadas de la sede de bomberos de Gwangju, una región completamente ausente del conjunto de entrenamiento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en un clasificador de este tipo). El autor documenta seis gates de evaluación pre-registrados, todos superados, aunque indica que la pre-registración no está verificada de forma independiente (`VERIFICATION_INSUFFICIENT`). Los intervalos de confianza se calcularon con bootstrap pareado (B = 2.000, semilla 20261103).

## Capacidades

- Clasificación de urgencia en tres niveles: 상 (alta), 중 (media), 하 (baja).
- Clasificación de tipo de desastre en cuatro clases: 구급 (médico), 구조 (rescate), 기타 (otros), 화재 (incendio).
- Clasificación de subtipo en 16 clases: 기타, 기타구급, 기타구조, 기타화재, 대물사고, 부상, 사고, 산불, 심정지, 안전사고, 약물중독, 일반화재, 임산부, 자살, 질병(중증 외), 질병(중증).
- Evaluación sobre llamada completa o sobre los primeros 30 o 60 segundos mediante el parámetro `cutoff_s`.
- Entrada multimodal por turnos con marcas de hablante y timestamps en milisegundos.
- API de inferencia: `predict(turns)` devuelve para cada tarea `{label, prob, probs}`; `predict_proba(texts)` acepta cadenas ya unidas.
- Procesamiento solo de texto: requiere un paso previo de speech-to-text (ASR); todas las métricas se midieron sobre transcripciones humanas, no sobre salida de ASR.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Triaje asistido en centrales de emergencia: el modelo puede mostrar al operador una estimación de urgencia y tipo de incidente como señal complementaria, nunca como decisión vinculante, aprovechando su capacidad de evaluar solo los primeros 30 segundos de llamada.
- Priorización de colas de revisión: en un centro con volumen alto de llamadas, el modelo puede ordenar las transcripciones por probabilidad de urgencia alta para que un supervisor las revise primero, dado que su macro-F1 de 0,5388 exige validación humana en todos los casos.
- Investigación en procesamiento de lenguaje aplicado a emergencias: sirve como baseline reproducible con evaluación out-of-distribution y gates pre-registrados para comparar futuros modelos de triaje en coreano.
- Análisis retrospectivo de llamadas: clasificación por lotes de transcripciones históricas para estudiar la distribución de tipos de incidente y subtipos por región o franja horaria.
- Enrutamiento preliminar por tipo de recurso: la predicción de tipo de desastre (macro-F1 de 0,6790 en OOD) puede usarse como sugerencia para dirigir la llamada al departamento adecuado, con confirmación del operador.
- Detección de subtipos críticos: la etiqueta 심정지 (parada cardíaca) o 자살 (suicidio) puede emplearse para marcar llamadas que requieran revisión inmediata por un especialista, siempre como señal de alerta y no como clasificación final.
- Generación de datasets etiquetados: el modelo puede preetiquetar grandes volúmenes de transcripciones para su posterior revisión y corrección manual, acelerando la anotación.

## Benchmarks y rendimiento

Unidad: una llamada. Métrica: macro-F1. `test_ood` corresponde a todas las llamadas de Gwangju (n = 23.364), región no vista en entrenamiento; `test_id` a llamadas de validación de Seúl e Incheon (n = 13.320).

| Test set | Condición | Modelo | TF-IDF | Keyword | Δ vs TF-IDF [IC 95%] |
|---|---|---|---|---|---|
| test_ood | llamada completa | 0,5388 | 0,5151 | 0,3831 | +0,0237 [0,0174; 0,0301] |
| test_ood | primeros 60 s | 0,5369 | 0,5126 | 0,3783 | +0,0243 [0,0177; 0,0307] |
| test_ood | primeros 30 s | 0,5167 | 0,4732 | 0,3492 | +0,0434 [0,0369; 0,0500] |
| test_id | llamada completa | 0,5974 | 0,5537 | 0,4344 | +0,0437 [0,0347; 0,0528] |
| test_id | primeros 30 s | 0,5642 | 0,5111 | 0,3879 | +0,0531 [0,0442; 0,0628] |

| Test set | Tarea | Modelo | TF-IDF | Δ vs TF-IDF [IC 95%] |
|---|---|---|---|---|
| test_ood completa | tipo de desastre (4) | 0,6790 | 0,6742 | +0,0048 [−0,0058; 0,0143] |
| test_ood completa | subtipo (16) | 0,4483 | 0,4151 | no testeado |
| test_id completa | tipo de desastre (4) | 0,8132 | 0,7722 | +0,0410 [0,0295; 0,0532] |
| test_id completa | subtipo (16) | 0,5248 | 0,5095 | no testeado |

Gates pre-registrados: 6/6 superados (G1: cota inferior del IC > 0 frente a TF-IDF en OOD, 0,0174; G2: estimación puntual ≥ +0,02, +0,0237; G3: cota inferior > 0 en primeros 30 s, 0,0369; G4: cota inferior > −0,01 en ID, 0,0347; G5: cota inferior > 0 frente a keyword, 0,1479; G6: Δ tipo de desastre ≥ −0,01, +0,0048). El autor señala que la cota inferior del IC en G1 queda por debajo de +0,02, por lo que no puede afirmarse con confianza estadística que la mejora alcance ese umbral.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp16/bf16 (567 M de parámetros) y alrededor de 2,3 GB en fp32; el repositorio ocupa 2,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, L4, T4, RTX 4090, RTX 3090 y RTX 3060 son suficientes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070 y superiores. También puede ejecutarse en CPU para inferencia por lotes, con mayor latencia.
- Opciones de despliegue: el módulo propio `er119_triage.py` con PyTorch y autocast bf16; transformers estándar; el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La longitud máxima de 1.024 tokens y el tamaño del encoder permiten inferencia en lote en una sola GPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-ER119-Triage-KO | 567,7 M | 1.024 tokens | Clasificación de triaje de emergencias en coreano (3 + 4 + 16 clases) | CC-BY-4.0 | Hugging Face |
| BAAI/bge-m3 (base) | 567 M | 8.192 tokens | Embeddings multilingües y recuperación | MIT (según el modelo base) | Hugging Face |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | Clasificación de urgencia | no aplica | Baseline interno |
| Regla por palabras clave (baseline del autor) | no aplica | no aplica | Clasificación de urgencia | no aplica | Baseline interno |

No se dispone de comparación con otros clasificadores públicos de triaje de emergencias en coreano en la información proporcionada.

## Limitaciones y advertencias

- No apto para triaje o despacho automatizado: el propio autor lo declara *research preview*; el macro-F1 de urgencia en OOD es 0,5388, lo que implica que cerca de una de cada dos llamadas recibe un nivel de urgencia incorrecto.
- La pre-registración de los gates de evaluación no está verificada de forma independiente (`VERIFICATION_INSUFFICIENT`); los resultados deben interpretarse con esa cautela.
- La mejora frente a TF-IDF en OOD es pequeña (+0,0237) y su cota inferior del IC (0,0174) queda por debajo del umbral de +0,02 fijado por el autor.
- En tipo de desastre en OOD la mejora frente a TF-IDF no es medible (+0,0048 con IC que cruza cero).
- El modelo solo procesa texto: requiere ASR previo y todas las métricas se obtuvieron sobre transcripciones humanas, no sobre salida de ASR; el rendimiento real con ASR puede degradarse.
- Entrada truncada a 1.024 tokens, lo que puede descartar información de llamadas largas.
- Idiomas limitados a coreano e inglés; no se ha evaluado en otros idiomas.
- Riesgo de sesgo geográfico y de dominio: entrenado con llamadas de Seúl e Incheon y evaluado en Gwangju; el comportamiento en otras regiones u otros servicios de emergencia no está caracterizado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea con alta confianza en clases críticas (심정지, 자살).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la licencia no exime de las advertencias de seguridad del autor.
- No se documentan sesgos demográficos, de género ni de edad; no disponibles.
- Cualquier uso en producción debe incluir validación por un operador humano formado y no debe emplearse para decidir, ordenar ni retrasar un despacho.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-ER119-Triage-KO
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-ER119-Triage-KO/blob/main/MODEL_CARD.ko.md
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Módulo de inferencia: https://huggingface.co/ThakiCloud/Thaki-ER119-Triage-KO/blob/main/er119_triage.py
- Pesos de las cabezas: https://huggingface.co/ThakiCloud/Thaki-ER119-Triage-KO/blob/main/heads.safetensors
