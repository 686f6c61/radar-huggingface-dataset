# tomcupr/Zitra-Apex-585M

## Resumen

Zitra-Apex-585M es un modelo fundacional de series temporales desarrollado por tomcupr (Tomáš Cupr) dentro de la familia Zitra v2. Se presenta como el especialista "multi-prior" de un solo pase: fusiona en una única pasada hacia delante tres modelos fundacionales complementarios (Zitra-209M-v2, t0-gamma y Chronos-2) mediante un meta-combinador de 79.000 parámetros. Con 584,48 millones de parámetros, resuelve el problema de la previsión probabilística multivariante con covariables dinámicas (promociones, precios, festivos, meteorología) en entornos de retail y operaciones.

El modelo destaca por su eficiencia: 84 ms por inferencia en una GPU B300, unas 3,2 veces más rápido que su hermano Zitra-Titan-585M (251 ms), manteniendo el primer puesto en MASE skill score (39,85) en el benchmark fev-bench. Está orientado a previsión zero-shot, sin necesidad de reentrenamiento por serie, y se distribuye con la librería propia `zitra-forecast` sobre PyTorch y pesos en safetensors.

Su relevancia actual radica en la combinación de precisión probabilística (cuantiles) con latencia baja y soporte nativo de covariables, un perfil poco habitual en modelos fundacionales de series temporales de tamaño medio. La licencia es "other", lo que exige revisar los términos concretos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble multi-prior de un solo pase: fusión de Zitra-209M-v2 (Timestral de 24 capas con FullLoRA plegado), t0-gamma (flags de inferencia `a2`) y Chronos-2 (covariables dinámicas nativas y atención multivariante), más un meta-combinador de 79K parámetros |
| Parametros totales | 584.483.517 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo numérico de series temporales); no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo de texto, sino un sistema de previsión compuesto. Tres "cerebros" fundacionales procesan la serie en paralelo y un meta-combinador de 79.000 parámetros enruta por separado la localización de la mediana y la dispersión de los cuantiles, condicionándose a estadísticas invariantes de escala de la serie, la longitud del historial y el desacuerdo entre expertos. La fusión se realiza en una sola pasada, sin reejecución en tiempo de test (zero test-time replay overhead), lo que explica la latencia de 84 ms en B300.

El meta-combinador se entrenó exclusivamente con datos reales limpios ajenos a los benchmarks y con pools sintéticos de regímenes, con `trained_on_benchmark_datasets = []`, es decir, sin exposición a los conjuntos de evaluación. La model card no detalla el volumen de tokens ni la composición exacta del corpus de entrenamiento, ni confirma el uso de RLHF o DPO (no procede en este dominio). La innovación principal es la fusión multi-prior condicionada y el diseño específico para covariables dinámicas y estructura multivariante.

## Capacidades

- Previsión probabilística de series temporales: emite cuantiles (mediana y dispersión) evaluados con WQL y CRPS.
- Previsión puntual evaluada con MASE y SQL.
- Soporte de covariables pasadas y conocidas en el futuro (promociones, precios, festivos, meteorología).
- Modelado multivariante con estructura entre series (atención multivariante vía Chronos-2).
- Previsión zero-shot sin reentrenamiento por serie ni por dominio.
- Operación por lotes sobre DataFrames de Pandas con `predict_df`, especificando `prediction_length`, `id_column` y `timestamp_column`.
- No soporta tool calling, function calling, agentes ni generación de texto: es un modelo numérico especializado.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Previsión de ventas en retail con promociones: el modelo incorpora covariables dinámicas (descuentos, precios, festivos) y logra reducciones de −5,87 % MASE y −6,25 % WQL en Rossmann Store Sales, lo que lo hace adecuado para planificación de demanda por SKU y tienda.
- Planificación de pedidos en fulfillment: en la retención interna de producción de Rohlik (2026) mejora −3,48 % MASE en pedidos horarios a 24 h y −2,33 % en pedidos horarios a 7 días, útil para dimensionar capacidad de almacén y reparto.
- Gestión de inventario a nivel de SKU: con 5.000 SKU activos y horizonte de 14 días reporta −1,22 % WAPE, aplicable a reposición automática y alertas de rotura.
- Previsión de demanda energética: las tareas con covariables (42 tareas de fev-bench) muestran −1,66 % MASE, un perfil apto para carga eléctrica con variables exógenas meteorológicas y de calendario.
- Movilidad y bikeshare: en la prueba prospectiva en vivo con H=64 (128 minutos) obtiene −3,93 % MASE y −7,29 % WQL, útil para reequilibrado de estaciones en tiempo casi real.
- Sustitución directa de Timestral-209M en pipelines existentes: al ser un upgrade con la misma interfaz de previsión y latencia contenida, permite mejorar precisión sin rediseñar la infraestructura.
- Planificación financiera y de operaciones con estructura multivariante: las 35 tareas multivariantes de fev-bench mejoran −0,68 % MASE y −1,24 % WQL, aplicable a previsiones de múltiples series correlacionadas.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`), obtenidos de la model card y del model-index.

| Benchmark / metrica | Zitra-Apex-585M | Referencia (Timestral-209M) |
|---|---|---|
| fev-bench MASE skill score | 39,85 | 39,49 |
| fev-bench SQL skill score | 50,55 | 50,39 |
| fev-bench WQL skill score | 54,94 | 54,63 |
| GIFT-Eval MASE | 0,6569 | No disponible |
| GIFT-Eval CRPS | 0,4469 | No disponible |

| Slice de fev-bench (vs Timestral-209M) | Variacion |
|---|---|
| Equal-Source MASE (29 fuentes) | −0,851 % (IC 95 % [−1,69 %, −0,08 %], p < 0,05) |
| Equal-Task (100 tareas) | −0,60 % MASE / −0,68 % WQL / −0,31 % SQL |
| Exposure-Clean (78 tareas) | −0,93 % MASE / −0,72 % WQL / −0,70 % SQL |
| Covariate Tasks (42 tareas) | −1,66 % MASE / −2,05 % WQL / −1,94 % SQL |
| Multivariate Tasks (35 tareas) | −0,68 % MASE / −1,24 % WQL |

| Benchmark retail zero-shot | MASE | WQL |
|---|---|---|
| Rossmann Store Sales | −5,87 % | −6,25 % |
| Rohlik Sales | −3,51 % | −7,14 % |
| Rohlik Orders | −3,26 % | −2,40 % |
| Walmart | −1,43 % | −2,61 % |
| M5 | −0,42 % | −1,06 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 584,48 M de parámetros en safetensors y un repo de 2,1 GB, la inferencia en FP32 rondaría los 2,3 GB de pesos y en FP16/BF16 alrededor de 1,2 GB, más memoria para activaciones y lotes.
- GPU recomendadas: el autor reporta latencias en NVIDIA B300 (84 ms). No se especifican requisitos mínimos ni otras GPU.
- Cabe en GPU de consumo: por tamaño de pesos (inferior a 3 GB), es plausible en tarjetas con 6-8 GB de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: librería oficial `zitra-forecast` (instalación vía `pip install "zitra-forecast[all] @ git+https://github.com/tomascupr/zitra-forecast.git"`), sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: 84 ms por inferencia en B300 (3,2× respecto a Zitra-Titan-585M con 251 ms y 3,2× respecto a Zitra-209M-v2 con 26 ms). Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | fev-bench MASE skill | GIFT-Eval MASE / CRPS | Latencia B300 | Licencia |
|---|---|---|---|---|---|---|
| Zitra-Apex-585M | 584,5 M | No disponible | 39,85 | 0,6569 / 0,4469 | 84 ms | other |
| Zitra-Titan-585M | 584,4 M | No disponible | No disponible | 0,6443 / 0,4352 | 251 ms | other |
| Zitra-209M-v2 | 209,3 M | No disponible | No disponible | No disponible | 26 ms | other |
| Timestral-209M (referencia) | 209 M | No disponible | 39,49 | No disponible | No disponible | No disponible |

Zitra-Titan-585M ofrece mejor precisión global en GIFT-Eval pero es 3× más lento; Zitra-209M-v2 es el más rápido y el drop-in directo de Timestral-209M; Zitra-Apex-585M se posiciona como el más preciso en tareas con covariables y operaciones horarias.

## Limitaciones y advertencias

- Modelo numérico especializado: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso; no debe evaluarse como LLM.
- Resultados de benchmarks declarados por el autor con `verified: false`; conviene replicarlos antes de tomar decisiones de producción.
- El meta-combinador se entrenó sin datasets de benchmark, pero los resultados del autor podrían no generalizar a dominios fuera de retail, energía y operaciones.
- Licencia "other": es imprescindible revisar los términos exactos del repositorio antes de cualquier uso comercial; no se garantiza permiso de uso comercial por defecto.
- No se documenta longitud de contexto, tipos de cuantización ni idiomas; la ausencia de estos datos limita la planificación de despliegues con series muy largas.
- Riesgo de degradación en series con fuerte no estacionalidad o cambios de régimen no representados en el entrenamiento; el autor no publica análisis de errores por régimen.
- Sesgos potenciales hacia los dominios sobrerrepresentados (retail, fulfillment, energía); dominios como sanidad o finanzas de alta frecuencia no están evaluados.
- Las latencias reportadas corresponden a una GPU B300; el rendimiento en GPU de consumo no está medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomcupr/Zitra-Apex-585M
- Colección Zitra v2: https://huggingface.co/collections/tomcupr/zitra-v2-time-series-foundation-models-6b07f1ff7bd52f98a455d847
- Zitra-Titan-585M: https://huggingface.co/tomcupr/Zitra-Titan-585M
- Zitra-209M-v2: https://huggingface.co/tomcupr/Zitra-209M-v2
- Demo interactiva: https://huggingface.co/spaces/tomcupr/zitra-v2-demo
- Repositorio de código: https://github.com/tomascupr/zitra-forecast
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
