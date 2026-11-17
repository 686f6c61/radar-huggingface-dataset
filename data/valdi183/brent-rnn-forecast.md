# Valdi183/brent-rnn-forecast

## Resumen

brent-rnn-forecast es un conjunto de cinco redes neuronales recurrentes (RNN) entrenadas para predecir el precio del petróleo Brent a tres horizontes temporales: 5, 63 y 252 días hábiles. Lo desarrolla Valdi183 en el marco de un caso de uso académico de la asignatura de Aprendizaje automático (UAX). Cada miembro del ensemble es una RNN de 64 neuronas y 2 capas que consume una ventana de 60 días con 16 variables exógenas procedentes de FRED y Yahoo Finance, y se entrena con pérdida Huber durante 2 épocas.

El modelo resuelve un problema clásico de forecasting financiero: anticipar la trayectoria del crudo de referencia europeo a corto, medio y largo plazo. Frente a alternativas como LSTM y GRU, el autor seleccionó esta arquitectura mediante validación cruzada walk-forward, e incorpora intervalos de predicción del 80 % calculados por cuantiles empíricos. Los pesos se distribuyen en formato PyTorch (`state_dict`) junto con el preprocesador y un fichero de metadatos.

Es relevante por su enfoque reproducible de extremo a extremo (pipeline, web y código publicados en GitHub) y por ofrecer métricas de test honestas frente a una línea base ingenua. No obstante, la mejora sobre dicha línea base es modesta en el horizonte corto (+1,2 % en RMSE), lo que conviene tener en cuenta antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN (red neuronal recurrente) simple, 64 neuronas × 2 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de entrada de 60 días hábiles con 16 variables |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` de PyTorch) |
| Idiomas soportados | es (documentación y model card) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`production_model.pt`, `state_dict`) + `production_preprocessor.pkl` + `production_meta.json` |

## Arquitectura y entrenamiento

El modelo es un ensemble de cinco RNN simples, cada una con 64 neuronas y 2 capas, entrenadas con pérdida Huber durante 2 épocas. La entrada es una ventana de 60 días hábiles con 16 variables: series macroeconómicas de FRED y datos de mercado de Yahoo Finance. La salida cubre tres horizontes (5, 63 y 252 días hábiles), gestionados mediante los cinco miembros del ensemble y los cuantiles empíricos para los intervalos del 80 %.

La selección de arquitectura se realizó comparando RNN, LSTM y GRU mediante validación cruzada walk-forward, procedimiento adecuado para series temporales porque respeta el orden cronológico. El preprocesador (escalador) se ajustó únicamente con datos de entrenamiento, lo que evita fuga de información. El modelo se reentrenó con datos hasta el 17 de noviembre de 2026. No se detalla en la información disponible el volumen total de tokens ni la composición exacta del dataset más allá de las fuentes citadas.

## Capacidades

- Predicción de series temporales financieras: precio del Brent a 5, 63 y 252 días hábiles.
- Estimación de intervalos de predicción al 80 % mediante cuantiles empíricos.
- Uso de 16 variables exógenas (macro FRED y mercado Yahoo Finance) como entrada multivariante.
- Ensemble de 5 modelos para robustecer la predicción.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá de la documentación en español.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Apoyo a la decisión en cobertura de riesgo: un analista de una empresa expuesta al crudo puede usar las predicciones a 63 y 252 días para dimensionar coberturas, apoyándose en los intervalos del 80 % para acotar la incertidumbre.
- Planificación presupuestaria de costes energéticos: departamentos financieros de industrias intensivas en energía pueden incorporar el escenario central y los cuantiles como insumo en sus previsiones anuales.
- Investigación académica sobre forecasting: el pipeline reproducible (preprocesador, pesos y metadatos) permite replicar el experimento y comparar con LSTM, GRU u otras arquitecturas bajo el mismo protocolo walk-forward.
- Docencia en series temporales: sirve como ejemplo completo de extremo a extremo (recolección de datos, escalado, validación walk-forward, intervalos por cuantiles) para cursos de machine learning.
- Señal auxiliar en modelos de riesgo de cartera: las predicciones a corto plazo (5 días) pueden integrarse como feature exógena en modelos de valor en riesgo, siempre con validación adicional.
- Monitorización de mercados: un sistema interno puede ejecutar el modelo periódicamente sobre datos actualizados de FRED y Yahoo Finance para generar alertas cuando la predicción a 63 días se desvíe de umbrales predefinidos.

## Benchmarks y rendimiento

Evaluación en test (entrenado hasta 2022, evaluado 2023 → 2026):

| Horizonte | MAE ($) | RMSE ($) | RMSE ingenuo ($) | Mejora vs ingenuo |
|---|---:|---:|---:|---:|
| Corto (5 d) | 3,63 | 5,38 | 5,44 | +1,2 % |
| Medio (63 d) | 10,71 | 16,65 | 17,96 | +7,3 % |
| Largo (252 d) | 14,70 | 20,58 | 21,74 | +5,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el modelo es una RNN de 64 neuronas × 2 capas con ventana de 60 pasos, por lo que cabe holgadamente en cualquier GPU consumer y probablemente en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier RTX 3060 o superior es más que suficiente, y una CPU moderna puede ejecutar la inferencia con latencia aceptable.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en hardware de gama baja.
- Opciones de despliegue: PyTorch nativo (carga directa de `state_dict`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Horizontes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brent-rnn-forecast | RNN 64×2, ensemble de 5 | 60 días × 16 variables | 5, 63, 252 d | no disponible | Hugging Face (PyTorch) |
| LSTM (referencia del autor) | LSTM | misma ventana | mismos | no disponible | evaluado internamente, no publicado |
| GRU (referencia del autor) | GRU | misma ventana | mismos | no disponible | evaluado internamente, no publicado |

El autor indica que RNN superó a LSTM y GRU en validación cruzada walk-forward, pero no se publican las métricas comparativas de esos dos modelos en la información disponible.

## Limitaciones y advertencias

- Mejora modesta sobre la línea base ingenua en el horizonte corto (+1,2 % en RMSE), lo que limita su valor práctico a 5 días.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de sobreajuste y de degradación ante regímenes de mercado no vistos en entrenamiento.
- El modelo se entrenó con datos hasta 2026-11-17; sin reentrenamiento periódico, su precisión puede degradarse.
- Los intervalos del 80 % son empíricos y pueden subestimar la incertidumbre en episodios de alta volatilidad.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Documentación únicamente en español y repo de 0,0 GB con 0 descargas, lo que sugiere ausencia de validación externa.
- El propio autor lo declara como herramienta de apoyo a la decisión y no como recomendación de inversión.

## Enlaces

- Hugging Face: https://huggingface.co/Valdi183/brent-rnn-forecast
- GitHub (web y pipeline): no disponible en la información proporcionada
- Paper: no disponible
- Demo: no disponible
