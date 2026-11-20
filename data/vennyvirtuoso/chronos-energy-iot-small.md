# vennyvirtuoso/chronos-energy-iot-small

## Resumen

chronos-energy-iot-small es un modelo de forecasting de series temporales desarrollado por el usuario vennyvirtuoso y publicado en Hugging Face. Se trata de un fine-tuning del checkpoint base amazon/chronos-t5-small, un modelo T5 seq2seq adaptado por Amazon para predicción probabilística de series temporales. El modelo resultante está especializado en telemetría industrial de alta frecuencia y en lecturas de contadores inteligentes (smart meters) de múltiples regiones, con el objetivo de predecir consumo energético y detectar picos de carga de cola pesada.

El modelo mantiene la arquitectura T5 original con 46,2 millones de parámetros y una ventana de contexto de 512 pasos temporales, generando predicciones de hasta 64 pasos (16 horas a intervalos de 15 minutos). Su propuesta de valor es ofrecer forecasting probabilístico zero-shot con licencia Apache 2.0, lo que permite su uso comercial sin restricciones y su despliegue en entornos de borde gracias a su reducido tamaño.

La relevancia actual del modelo radica en su enfoque de foundation model para series temporales: en lugar de entrenar un modelo específico por serie, se aprovecha el preentrenamiento de Chronos y se adapta mediante fine-tuning a dominios concretos de energía e IoT. No obstante, las mejoras reportadas frente al baseline zero-shot son marginales (reducciones de error de entre el 0,4 % y el 2,68 % en la mayoría de métricas, con un empeoramiento del 0,72 % en un conjunto out-of-distribution), lo que conviene tener en cuenta al evaluar su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 seq2seq (transformer encoder-decoder) adaptada para series temporales |
| Parametros totales | 46.154.240 (46,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 pasos temporales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Horizonte de prediccion | 64 pasos (16 horas a intervalos de 15 minutos) |
| Modelo base | amazon/chronos-t5-small |
| Tamano del repositorio | 0,1 GB |
| Pipeline | time-series-forecasting |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura T5 seq2seq de Chronos, en la que los valores de la serie temporal se tokenizan en un vocabulario discreto mediante binning por cuantiles y se tratan como una secuencia de tokens que el encoder-decoder procesa de forma autoregresiva. El fine-tuning se realiza sobre el checkpoint amazon/chronos-t5-small, que ya ha sido preentrenado por Amazon sobre un corpus amplio de series temporales diversas. La adaptación del autor se centra en telemetría industrial de alta frecuencia y flujos de smart meters multi-región, e incorpora un esquema de binning por cuantiles no lineal orientado a capturar picos de carga de cola pesada.

Los datos de entrenamiento declarados provienen del dataset UCI, aunque la model card no detalla el número de tokens, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). La evaluación se realizó sobre splits de test disjuntos por grupo para evitar fuga de datos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo se limita a la inferencia Monte Carlo por muestreo del pipeline de Chronos.

## Capacidades

- Predicción probabilística de series temporales univariantes mediante muestreo Monte Carlo (por defecto 20 trayectorias).
- Generación de cuantiles calibrados (P10, P50, P90) para construir intervalos de predicción.
- Forecasting zero-shot sobre dominios no vistos, con adaptación específica a energía e IoT.
- Manejo de contextos de 512 pasos temporales y horizontes de predicción de 64 pasos.
- Capacidad de modelar picos de carga de cola pesada mediante binning por cuantiles no lineal.
- Integración con el ecosistema Hugging Face transformers y con ChronosPipeline.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales (visión, audio) ni multilingües en el sentido textual.

## Casos de uso

- Predicción de consumo eléctrico residencial: el modelo puede ingerir 512 lecturas de contador (5,3 días a 15 minutos) y generar una previsión de 16 horas con intervalos P10/P50/P90, útil para tarificación dinámica y gestión de demanda.
- Gestión de picos de carga en redes de distribución: la modelización de cola pesada permite anticipar subidas abruptas de demanda y activar protocolos de respuesta a la demanda o refuerzo de capacidad.
- Mantenimiento predictivo en plantas industriales: a partir de telemetría de sensores, el modelo puede detectar desviaciones en la serie y anticipar fallos antes de que se materialicen, reduciendo paradas no planificadas.
- Despliegue en el borde (edge computing): con 46,2 M de parámetros y un repositorio de 0,1 GB, el modelo cabe en dispositivos con recursos limitados y puede ejecutarse en microservicios de baja latencia (481,71 ms por predicción con batch=1).
- Agregación de previsiones en plataformas de smart grid: el throughput de 55 predicciones por segundo en GPU permite procesar lotes de miles de contadores en segundos para planificación de balance energético.
- Monitorización de telemetría IoT en tiempo real: integrado en pipelines de streaming, el modelo puede generar alertas tempranas cuando la predicción se desvía de la lectura real, señalando anomalías o fallos de sensor.
- Evaluación de escenarios de eficiencia energética: los cuantiles generados permiten simular escenarios de consumo bajo distintas condiciones y apoyar decisiones de inversión en infraestructura.

## Benchmarks y rendimiento

| Metrica | Fine-tuned | Baseline zero-shot | Reduccion de error |
|---|---|---|---|
| Macro WAPE (held-out) | 42,55 % | 42,72 % | -0,40 % |
| Macro MASE (held-out) | 1,2192 | 1,2333 | -1,15 % |
| Mean WQL (quantile loss) | 0,3459 | 0,3480 | -0,60 % |
| Cross-entropy loss | 3,8031 | 3,8031 | 0,00 % |
| UCI Industrial Unseen WAPE | 7,63 % | 7,84 % | -2,68 % |
| London Residential Unseen WAPE | 54,22 % | 55,00 % | -1,42 % |
| Australian Grid External OOD WAPE | 65,79 % | 65,32 % | +0,72 % (empeora) |

| Metrica de rendimiento | Valor |
|---|---|
| Throughput en GPU (batch) | 55,0 forecasts/s |
| Latencia por serie (batch=1) | 481,71 ms |
| Contexto | 512 pasos |
| Horizonte | 64 pasos |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (46 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo buffers y muestras Monte Carlo.
- GPU recomendadas: cualquier GPU moderna sirve; para máximo throughput, A100, H100 o L4. Para desarrollo, RTX 4090, RTX 3090 o incluso RTX 3060.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: ChronosPipeline (librería chronos-forecasting), transformers, integración con sentence-transformers y peft según la model card; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje).
- Latencia y throughput: 481,71 ms por predicción con batch=1 y 55,0 predicciones por segundo en modo batch sobre GPU, según los datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chronos-energy-iot-small | 46,2 M | 512 pasos | Fine-tuning de Chronos T5 para energía/IoT | Apache 2.0 | Hugging Face |
| amazon/chronos-t5-small | 46,2 M | 512 pasos | Foundation model zero-shot de series temporales | Apache 2.0 | Hugging Face |
| amazon/chronos-t5-base | ~200 M | 512 pasos | Foundation model zero-shot de series temporales | Apache 2.0 | Hugging Face |
| amazon/chronos-t5-large | ~710 M | 512 pasos | Foundation model zero-shot de series temporales | Apache 2.0 | Hugging Face |

La comparación directa con chronos-t5-small es la más relevante: el fine-tuning apenas mejora el WAPE macro (0,40 %) y el MASE (1,15 %), y empeora en un conjunto OOD externo (Australian Grid, +0,72 %). Frente a chronos-t5-base y chronos-t5-large, el modelo fine-tuneado ofrece menor capacidad pero mayor especialización y menor coste de inferencia. No se dispone de comparación con otros modelos de forecasting como TimesFM, Moirai o Lag-Llama en la información proporcionada.

## Limitaciones y advertencias

- Las mejoras frente al baseline zero-shot son marginales y no uniformes; en el conjunto Australian Grid External OOD el modelo empeora un 0,72 % en WAPE.
- El WAPE en dominios residenciales (London Residential, 54,22 %) y en redes externas (Australian Grid, 65,79 %) es elevado, lo que indica un rendimiento limitado en escenarios alejados de la distribución de entrenamiento.
- El modelo solo maneja series univariantes; no modela correlaciones entre múltiples series simultáneas.
- La ventana de contexto está limitada a 512 pasos y el horizonte a 64 pasos, insuficiente para previsiones a más de 16 horas a resolución de 15 minutos.
- No se documentan sesgos específicos, pero al entrenarse sobre datos UCI y flujos de smart meters, puede heredar sesgos de representación geográfica y socioeconómica de dichos datasets.
- Riesgo de alucinación en el sentido de predicciones poco realistas fuera de la distribución de entrenamiento; los intervalos probabilísticos pueden estar mal calibrados en dominios OOD.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente por parte de la comunidad.
- No se dispone de información sobre cuantización, por lo que el despliegue en hardware muy limitado requiere verificación empírica.

## Enlaces

- Hugging Face: https://huggingface.co/vennyvirtuoso/chronos-energy-iot-small
- Modelo base: https://huggingface.co/amazon/chronos-t5-small
- Repositorio Chronos (Amazon): https://github.com/amazon-science/chronos-forecasting
- Paper Chronos: https://arxiv.org/abs/2403.07815
- Dataset UCI: https://archive.ics.uci.edu/
