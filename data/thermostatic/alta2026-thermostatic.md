# Thermostatic/alta2026-thermostatic

## Resumen

Thermostatic/alta2026-thermostatic es el repositorio de sistema presentado por el equipo Stargazers (identificador `thermostatic`) a la tarea compartida ALTA 2026 sobre clasificación de sentimiento y sarcasmo en variedades del inglés australiano (en-AU) y británico (en-UK), sobre los subconjuntos BESSTIE. No es un modelo único, sino un ensemble de tres miembros: cinco semillas de DeBERTa-v3-large afinadas de forma multi-tarea, una regresión logística sobre embeddings congelados de e5-large-v2 y multilingual-e5-large-instruct, y una sonda de regresión logística sobre estados ocultos de la capa 24 de Qwen3.5-9B en cuantización NF4.

El sistema obtuvo una puntuación oficial de 0,867 en el conjunto de test, lo que le situó en segunda posición del leaderboard y entre las seis ejecuciones no significativamente distintas de la mejor. La relevancia actual reside en que documenta con rigor qué límites encuentra un ensemble bien validado cuando se enfrenta a variación dialectal y a la detección de sarcasmo, un fenómeno especialmente dependiente de la variedad lingüística. El repositorio incluye código, predicciones, características cacheadas, 25 checkpoints de DeBERTa y el artículo asociado.

El tamaño del repositorio (23,9 GB) se explica por los 25 checkpoints en bf16 y las características cacheadas, no por un modelo de gran escala. La licencia es MIT, aunque los datos de competición no son redistribuibles y deben obtenerse de los organizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: DeBERTa-v3-large multi-tarea (encoder transformer) + regresión logística sobre embeddings e5-large-v2 y multilingual-e5-large-instruct + sonda de regresión logística sobre estados ocultos de Qwen3.5-9B (capa 24, NF4) |
| Parametros totales | No disponible de forma agregada; DeBERTa-v3-large ronda los 435 M por checkpoint, con 25 checkpoints en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (DeBERTa-v3-large soporta hasta 512 tokens; no confirmado para este sistema) |
| Tipos de cuantizacion | El miembro LLM usa NF4 (Qwen3.5-9B); los checkpoints DeBERTa se publican en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés), específicamente variedades en-AU y en-UK |
| Licencia | MIT |
| Formato de pesos | `weights.pt` (state dict bf16) + config + tokenizer para los checkpoints DeBERTa; el resto son artefactos de código y predicciones |

## Arquitectura y entrenamiento

El miembro principal, `enc_deb_l_rx5`, es un DeBERTa-v3-large multi-tarea con una cabeza de sentimiento y una cabeza de sarcasmo por variedad, con la entrada prefijada por `[variety] [source]`. Se entrenó durante 4 épocas con learning rate 1e-5 y batch 16, generando 5 semillas (13 a 17) por 5 folds de validación cruzada, es decir, 25 checkpoints. El ensemble final es una media de logits sin pesos de los tres miembros, con umbrales de decisión ajustados por validación cruzada para cada tarea y segmento.

Los otros dos miembros son más ligeros: `cls_e5me5_lr` es una regresión logística sobre embeddings congelados de e5-large-v2 y multilingual-e5-large-instruct, y `llm_q35_9b_probe` es una sonda de regresión logística sobre los estados ocultos de la capa 24 de Qwen3.5-9B en NF4 bajo prompts zero-shot. El protocolo de validación emplea validación cruzada de 5 folds agrupada sobre train+valid, estratificada por segmento y etiquetas, con textos idénticos agrupados y comparación de candidatos mediante bootstrap pareado del tamaño del test. El artículo documenta los experimentos descartados (otros backbones, EMA/LLRD, LoRA sobre LLMs, pseudo-etiquetas, contexto de hilo, kNN, características de LLM-reader) en `results/paper/NOTES.md`.

## Capacidades

- Clasificación de sentimiento en inglés australiano (en-AU) y británico (en-UK), con macro-F1 de 0,932 y 0,976 respectivamente en test oficial.
- Detección de sarcasmo en ambas variedades, con macro-F1 de 0,801 (en-AU) y 0,837 (en-UK) en test oficial.
- Clasificación multi-tarea con cabezas separadas por tarea y variedad, lo que permite reutilizar representaciones compartidas.
- Ajuste de umbrales de decisión por tarea y segmento para calibrar las probabilidades de salida.
- Ensemble por media de logits de tres miembros heterogéneos (encoder afinado, embeddings congelados y sonda sobre LLM).
- No soporta generación de texto, tool calling, agentes ni visión: es un sistema de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada a las variedades de inglés evaluadas; no se documenta comportamiento en otras lenguas.

## Casos de uso

- Moderación de comunidades en línea: el sistema puede clasificar comentarios sarcásticos o de sentimiento negativo en foros con audiencias australianas y británicas, donde la variación dialectal degrada clasificadores entrenados solo con inglés estadounidense.
- Análisis de opinión en redes sociales por mercado: permite separar el sentimiento de reseñas y publicaciones en en-AU y en-UK, usando los umbrales calibrados por segmento para mantener la precisión en cada variedad.
- Investigación en procesamiento de variedades dialectales: el repositorio sirve como línea base reproducible para estudiar cuánto limita la variedad lingüística a un ensemble bien validado, con código, predicciones y artículo incluidos.
- Detección de ironía en atención al cliente: puede marcar mensajes con sarcasmo para enrutarlos a agentes humanos, reduciendo errores de interpretación literal en canales de soporte de Reino Unido y Australia.
- Evaluación de sistemas de clasificación: los 25 checkpoints y las predicciones OOF permiten reproducir el protocolo de validación cruzada y comparar nuevos modelos con bootstrap pareado.
- Análisis de opinión en encuestas y estudios de mercado: clasificación por lotes de respuestas abiertas en inglés británico y australiano, con probabilidades por ítem exportadas en `preds/`.
- Destilación y ajuste de clasificadores pequeños: las características cacheadas (embeddings y estados ocultos de LLM) permiten entrenar sondas ligeras sin volver a ejecutar los modelos grandes.

## Benchmarks y rendimiento

Puntuación oficial = ½ [min(sent-AU, sent-UK) + min(sarc-AU, sarc-UK)], macro-F1 por componente.

| Sistema | sent-AU | sent-UK | sarc-AU | sarc-UK | score |
|---|---|---|---|---|---|
| Ensemble `stk_v5r`, OOF agrupado 5-fold (estimación dev) | 0,934 | 0,976 | 0,805 | 0,841 | 0,869 |
| Ensemble `stk_v5r`, test oficial (2.º del leaderboard) | 0,932 | 0,976 | 0,801 | 0,837 | 0,867 |
| DeBERTa-v3-large ×5 solo, test oficial (ablación) | 0,916 | 0,975 | 0,793 | 0,820 | 0,854 |
| Línea base de los organizadores, test oficial | 0,866 | 0,931 | 0,680 | 0,696 | 0,773 |

## Requisitos de hardware

- Una GPU de 24 GB es suficiente para los miembros neuronales; el autor indica que usó una RTX 3090.
- El reentrenamiento completo de los 25 checkpoints DeBERTa tarda aproximadamente 2,5 horas en una RTX 3090.
- El miembro Qwen3.5-9B en NF4 requiere memoria para un modelo de 9B cuantizado a 4 bits, además de los estados ocultos de la capa 24; no se detalla el consumo exacto.
- Los checkpoints DeBERTa en bf16 pueden cargarse con `experiments.encoders.common.load_fold(path)`.
- Opciones de despliegue: el repositorio está orientado a inferencia por lotes con Python 3.12 y `uv`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Sistema | Tipo | Contexto | Score oficial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thermostatic/alta2026-thermostatic | Ensemble (DeBERTa-v3-large + e5 + sonda Qwen3.5-9B) | No disponible | 0,867 | MIT | Pesos y código en Hugging Face |
| DeBERTa-v3-large ×5 (ablación del mismo equipo) | Encoder multi-tarea | No disponible | 0,854 | MIT | Incluido en el repositorio |
| Línea base de los organizadores ALTA 2026 | No disponible | No disponible | 0,773 | No disponible | No disponible |
| Modelos comparables de la literatura BESSTIE | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El sistema está especializado en clasificación de sentimiento y sarcasmo en en-AU y en-UK; no es un modelo generativo ni un asistente conversacional.
- Los datos de competición no son redistribuibles: sin acceso a los organizadores (CodaBench 17681) no se pueden reproducir entrenamiento ni evaluación.
- El rendimiento en sarcasmo es notablemente inferior al de sentimiento (0,801-0,837 frente a 0,932-0,976), lo que refleja la dificultad intrínseca de la tarea.
- El ensemble depende de umbrales ajustados por validación cruzada; su aplicación fuera de la distribución de BESSTIE puede degradar la calibración.
- La sonda sobre Qwen3.5-9B hereda los sesgos del modelo subyacente y de los prompts zero-shot empleados.
- El repositorio incluye etiquetas de reanotación ciega generadas por subagentes de Claude, lo que introduce una fuente de anotación automatizada que conviene tratar con cautela.
- Solo se soporta inglés; no hay evidencia de transferencia a otras lenguas o variedades.
- El tamaño del repositorio (23,9 GB) puede dificultar su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thermostatic/alta2026-thermostatic
- Tarea compartida ALTA 2026: https://www.alta.asn.au/events/sharedtask2026/
- Competición CodaBench 17681: https://www.codabench.org/competitions/17681/ (referenciada en la model card; no verificada)
- Artículo: *Two Varieties, Two Sarcasms: What Limits a Well-Validated Ensemble on Australian and British English*, incluido en `paper/main.tex` y `paper/main.pdf` del repositorio
- Registro de experimentos: `results/paper/NOTES.md` (R1–R13) del repositorio
