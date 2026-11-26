# tomcupr/Zitra-Titan-585M

## Resumen

Zitra-Titan-585M es un modelo fundacional para prediccion de series temporales desarrollado por el usuario de Hugging Face `tomcupr`, buque insignia de la familia Zitra v2. Resuelve el problema de la previsión probabilística multivariante zero-shot sobre series heterogéneas (demanda de retail, telemetría de nube, generación solar, conteo de bicicletas) sin reentrenamiento por dominio. Su propuesta técnica es un ensemble de tres priors fundacionales empaquetados en un único checkpoint `safetensors` de 584,4 millones de parámetros.

La arquitectura combina tres modelos ortogonales: Zitra-209M-v2 (209,3M, decoder con RoPE temporal y cross-variante, contexto hasta 32.768), t0-gamma (255,6M, especialista patch-decoder con contexto 8.192) y Chronos-2 (119,5M, encoder-only con soporte nativo multivariante y covariables pasadas/futuras). El enrutamiento entre expertos se realiza en tiempo de inferencia mediante backtests causales rodantes, sin pesos de router aprendidos, y la mezcla se materializa invirtiendo la CDF lineal por tramos del pool de distribuciones.

Es relevante ahora porque declara estado del arte en GIFT-Eval (0,6443 MASE / 0,4352 CRPS sobre 97 tareas) y en fev-bench (50,61 SQL / 54,95 WQL / 39,71 MASE skill sobre 100 tareas), superando a Timestral-209M, TimesFM-3, Toto-2.0-2.5B y Chronos-2. No se usaron los datasets de benchmark en post-entrenamiento ni en selección de modelo, según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres priors fundacionales (decoder RoPE temporal + patch-decoder + encoder-only) con mezcla de CDF en inferencia |
| Parametros totales | 584.404.213 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 (Zitra-209M-v2); 8.192 (t0-gamma); no disponible para Chronos-2 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo numerico de series temporales) |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo no es un transformer único, sino un contenedor de tres submodelos con inductive biases complementarios. Zitra-209M-v2 es un decoder de 24 capas con atención cross-variante y RoPE temporal (contexto hasta 32.768), descrito como un model soup de 5 semillas con FullLoRA plegado algebraicamente sobre Timestral-209M. t0-gamma es un patch-decoder de 255,6M parámetros bajo Apache-2.0, configurado con sus ajustes oficiales `a2` (recorte de missing iniciales, promediado simétrico, no negatividad, snapping a enteros, contexto 8.192). Chronos-2 es un prior encoder-only de 119,5M parámetros bajo Apache-2.0 con soporte nativo multivariante y covariables dinámicas pasadas y futuras.

La innovación principal es el enrutamiento en test-time: antes de predecir, se ejecutan dos backtests causales rodantes preservando covariables sobre la historia reciente de cada serie, y los pesos se calculan como un posterior bayesiano no recortado `w ∈ Δ³` que pondera por tamaño efectivo de muestra `n_eff / (n_eff + κ)` y consistencia de signo entre cortes. La mezcla no promedia cuantiles (Vincentización), sino que construye la CDF lineal exacta `F_mix(y) = Σ w_e F_e(y)` y la invierte en cada decil, lo que acota la influencia de outliers y ensancha automáticamente la incertidumbre epistémica cuando los expertos discrepan. No se detalla el volumen de tokens de entrenamiento ni la composición del dataset; el autor declara `trained_on_benchmark_datasets = []`.

## Capacidades

- Previsión probabilística de series temporales univariantes y multivariantes.
- Soporte de covariables dinámicas pasadas y futuras (nativo en el prior Chronos-2).
- Predicción zero-shot sin ajuste fino por dominio.
- Salida de distribución predictiva (decilas) con incertidumbre epistémica calibrada por discrepancia entre expertos.
- Enrutamiento adaptativo por serie en inferencia mediante backtests causales.
- Manejo de valores missing iniciales, no negatividad y snapping a enteros (heredado de t0-gamma).
- Contexto largo hasta 32.768 pasos en el experto Zitra-209M-v2.
- No dispone de capacidades de texto, visión, audio, tool calling ni razonamiento multi-paso: es un modelo estrictamente numérico de forecasting.

## Casos de uso

- Previsión de demanda en retail: el modelo puede generar distribuciones de demanda por SKU y tienda con covariables (promociones, calendario) gracias al soporte multivariante y de covariables, y su ventana de hasta 32.768 pasos permite capturar estacionalidades anuales en datos horarios.
- Planificación de capacidad en cloud: predicción de telemetría de CPU, memoria y latencia por servicio; el enrutamiento por backtest selecciona el experto más adecuado para series con distinto régimen (picos, deriva, estacionalidad), y la CDF mixta cuantifica el riesgo de saturación.
- Previsión de generación solar y eólica: el prior con covariables permite incorporar irradiancia prevista o velocidad de viento; el modelo reporta mejoras específicas en la familia `solar` de GIFT-Eval, lo que lo hace adecuado para despacho energético con bandas de incertidumbre.
- Gestión de flotas de movilidad urbana: conteo de bicicletas y viajes por estación con patrones semanales y meteorología como covariable; útil para rebalanceo operativo con cuantiles de demanda por franja.
- Detección temprana de anomalías operativas: la inversión de CDF mixta y el ensanchamiento automático ante discrepancia entre expertos permiten marcar series con comportamiento atípico sin umbrales manuales.
- Previsión financiera de series de negocio (ingresos, tickets, cartera): con contexto largo y salida probabilística, se puede alimentar planificación presupuestaria con intervalos calibrados en lugar de puntos únicos.
- Sustitución de pipelines de forecasting clásicos (ARIMA, Prophet) en producción: al ser zero-shot y no requerir reentrenamiento por serie, reduce el coste de mantenimiento de modelos por SKU o por cliente.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`).

| Benchmark | Metrica | Zitra-Titan-585M | Zitra-Apex-585M | Zitra-209M-v2 | Timestral-209M | t0-gamma | TimesFM-3 | Toto-2.0-2.5B | Chronos-2 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GIFT-Eval (97 configs) | MASE ↓ | 0.6443 | 0.6569 | 0.6578 | 0.6575 | 0.661 | 0.667 | 0.696 | 0.698 |
| GIFT-Eval (97 configs) | CRPS / WQL ↓ | 0.4352 | 0.4469 | 0.4451 | 0.4460 | 0.452 | 0.456 | 0.476 | 0.485 |
| fev-bench (100 tareas) | SQL Skill ↑ | 50.61 | 50.55 | 50.45 | 50.39 | 49.42 | 48.99 | 44.42 | 47.28 |
| fev-bench (100 tareas) | WQL Skill ↑ | 54.95 | 54.94 | 54.81 | 54.63 | no disponible | no disponible | no disponible | no disponible |
| fev-bench (100 tareas) | MASE Skill ↑ | 39.71 | 39.85 | 39.56 | 39.49 | 37.99 | 37.82 | 32.54 | 35.50 |

El autor reporta mejoras de −2,02% MASE y −2,43% CRPS frente a Timestral-209M en GIFT-Eval (11 de 19 familias ganadas en ambas métricas), y victoria en las cuatro particiones de fev-bench (Covariate, Multivariate, Univariate, No-Covariate) en MASE y WQL.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (584,4M × 4 bytes), más overhead de activaciones y buffers de contexto; en fp16/bf16 alrededor de 1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; A100, H100 o L40S para lotes grandes y contexto de 32.768.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, siempre que el framework `zitra-forecast` soporte ejecución en fp16/bf16.
- Opciones de despliegue: la librería propietaria `zitra-forecast` (PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste de inferencia incluye los backtests causales de enrutamiento, por lo que será superior al de un único experto de tamaño comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GIFT-Eval MASE ↓ | GIFT-Eval CRPS ↓ | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Zitra-Titan-585M | 584,4M | 32.768 (experto mayor) | 0.6443 | 0.4352 | other | Hugging Face (tomcupr) |
| Zitra-Apex-585M | 585M (aprox.) | no disponible | 0.6569 | 0.4469 | other | Hugging Face (tomcupr) |
| Timestral-209M | 209M | no disponible | 0.6575 | 0.4460 | no disponible | Hugging Face |
| TimesFM-3 | no disponible | no disponible | 0.667 | 0.456 | no disponible | Hugging Face (Google) |
| Chronos-2 | 119,5M | no disponible | 0.698 | 0.485 | Apache-2.0 | Hugging Face (Amazon) |
| Toto-2.0-2.5B | 2.500M | no disponible | 0.696 | 0.476 | no disponible | Hugging Face (Datadog) |

Zitra-Titan-585M iguala o supera a modelos de hasta 2,5B parámetros en las métricas declaradas, con un coste de parámetros muy inferior al de Toto-2.0-2.5B.

## Limitaciones y advertencias

- Licencia `other`: los términos exactos no están detallados en la información disponible; es imprescindible revisar el fichero de licencia del repositorio antes de un uso comercial.
- Los resultados de benchmark son declarados por el autor y figuran como `verified: false`; no hay validación independiente en la información proporcionada.
- El enrutamiento depende de backtests causales sobre la historia reciente; series muy cortas o con pocos cortes pueden producir pesos poco informativos.
- El ensemble triplica el coste de inferencia respecto a un único experto del mismo tamaño, con latencia mayor y mayor consumo de VRAM por activaciones.
- Riesgo de alucinación en el sentido de predicciones con intervalos demasiado estrechos en regímenes no vistos; el mecanismo de ensanchamiento por discrepancia mitiga pero no elimina este riesgo.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.
- El soporte de idiomas no aplica; la interfaz de uso está ligada a la librería `zitra-forecast` y a la API de PyTorch.
- Sin datos publicados sobre robustez ante cambios de distribución, valores atípicos extremos o series con frecuencia irregular.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomcupr/Zitra-Titan-585M
- Colección Zitra v2: https://huggingface.co/collections/tomcupr/zitra-v2-time-series-foundation-models-6b07f1ff7bd52f98a455d847
- Zitra-Apex-585M: https://huggingface.co/tomcupr/Zitra-Apex-585M
- Zitra-209M-v2: https://huggingface.co/tomcupr/Zitra-209M-v2
- Demo interactiva: https://huggingface.co/spaces/tomcupr/zitra-v2-demo
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Repositorio del proyecto: https://github.com/tomascupr/zitra-forecast
