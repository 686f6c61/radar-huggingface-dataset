# starkprateek1/retcast-jepa

## Resumen

RetCast-JEPA es una familia de modelos fundacionales de predicción de series temporales de muy pequeño tamano (2,05M, 5,11M y 9,19M de parámetros), desarrollada por starkprateek1 y publicada en Hugging Face bajo licencia MIT. El modelo combina una arquitectura RetNet2.0 (con memoria sobrescribible basada en delta-rule, convolución causal depthwise corta y retención multi-escala) con el marco JEPA de Yann LeCun, que en lugar de predecir los valores crudos de la serie predice la representación latente del futuro. El resultado es un predictor zero-shot que no necesita ajuste por tarea y que se ejecuta en hardware muy modesto.

Su relevancia radica en la eficiencia: con apenas 2M de parámetros supera a Google TimesFM 200M en el benchmark zero-shot de 12 tareas ETT (MSE medio de 0,3706 frente a 0,3878), con una latencia de 17,44 ms frente a 413,49 ms y un pico de VRAM de 22,0 MB frente a 796,6 MB (medido con B=16 y L=512). El repositorio incluye además variantes in-domain y ablaciones controladas (sin JEPA, sin delta-rule, con transformer) que permiten aislar la contribución de cada componente arquitectónico.

La ventana de contexto utilizada en los experimentos es de 512 pasos con horizontes de predicción de 96, 192 y 336. El modelo está entrenado exclusivamente sobre series no pertenecientes a ETT (1.345 series reales de 9 dominios, más UCI solar_AL, remuestreo multi-rate y un 25% de trayectorias sintéticas), lo que garantiza que la evaluación ETT sea estrictamente zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet2.0 (retención multi-escala, delta-rule, short_conv causal depthwise=4) + encoder/decoder JEPA con VICReg |
| Parametros totales | 2.052.180 (variante 2M); 5.105.304 (5M); 9.187.292 (9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 pasos en los experimentos; estado recurrente fijo probado hasta L=16.384 |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (8,09 MB / 20,01 MB / 35,87 MB según variante) |

## Arquitectura y entrenamiento

El backbone es RetNet2.0, una evolución de RetNet que incorpora tres innovaciones: memoria sobrescribible con delta-rule (β_max = 2,0), que borra proyecciones de régimen obsoletas antes de escribir nuevas observaciones y permite autovalores negativos en (-1, 1) para seguir ciclos y fases; una convolución causal depthwise corta (short_conv=4); y retención multi-escala. Sobre este backbone se aplica un objetivo JEPA: el modelo predice la semántica latente en tiempo-frecuencia de parches futuros (con stop-gradient y EMA del target) en lugar de los valores puntuales, regularizado con VICReg. Esto produce una alineación coseno del latente futuro de 0,809–0,842 y un R@1 de recuperación 5,4 veces mayor que sin JEPA.

El preentrenamiento usa el corpus `NonETTPretrainCorpus`, compuesto por 1.345 series reales de 9 dominios no-ETT extraídas de `autogluon/chronos_datasets` más UCI `solar_AL`, con remuestreo temporal multi-rate y un 25% de trayectorias sintéticas. No se vieron ficheros ETT durante el preentrenamiento. Los pasos de entrenamiento documentados son 2.400 (2M zero-shot), 2.100 (5M y 9M zero-shot), 1.800 (ablación raw y 9M in-domain) y 1.600 (2M y 5M in-domain). No se especifica el número total de tokens ni si hubo RLHF/DPO (no aplica a este dominio).

La arquitectura permite entrenamiento en paralelo, prefill chunkwise y un estado recurrente de memoria O(1): 830 KB fijos a L=16.384 frente a 30.750 KB de caché KV de un transformer, lo que se traduce en 1,85x más velocidad y 2,72x menos VRAM que un transformer con el mismo número de parámetros.

## Capacidades

- Predicción de series temporales univariadas en modo zero-shot sin ajuste por tarea.
- Predicción puntual y por cuantiles: la salida incluye `point` (B, H) y `quantiles` (B, H, 10) con q10 a q90.
- Rollout latente recurrente con memoria O(1), adecuado para horizontes largos o streaming.
- Dos modos de inferencia: `chunkwise` (prefill paralelo) y recurrente.
- Normalización reversible (RevIN) integrada para manejar cambios de escala.
- Embedding de frecuencia para series con estacionalidades marcadas.
- Variantes in-domain para ajuste sobre dominios concretos (2M, 5M, 9M).
- Ablaciones publicadas que permiten sustituir el backbone por transformer o desactivar delta-rule/JEPA.
- No soporta tool calling, agentes, visión, audio ni capacidades lingüísticas: es un modelo puramente numérico.

## Casos de uso

- Predicción de demanda energética: con contexto de 512 pasos y horizontes de 96 a 336, el modelo puede generar previsiones horarias o diarias zero-shot sobre contadores nuevos sin reentrenamiento, gracias a RevIN y al embedding de frecuencia.
- Monitorización de infraestructura: predecir métricas de CPU, latencia o throughput en pipelines de observabilidad usando el modo recurrente O(1), que mantiene estado fijo independientemente de la longitud del histórico.
- Planificación de capacidad en cloud: estimar picos de tráfico a partir de series históricas de 9 dominios distintos, aprovechando que el modelo fue preentrenado en dominios heterogéneos y generaliza a series no vistas.
- Predicción de series financieras de alta frecuencia: el delta-rule con autovalores negativos permite seguir ciclos y fases, útil para series con estacionalidad intradía; los cuantiles q10–q90 permiten construir intervalos de confianza para gestión de riesgo.
- Sensórica industrial y mantenimiento predictivo: predecir la evolución de variables de proceso (temperatura, vibración, presión) en modo zero-shot sobre sensores nuevos, con latencia de decenas de milisegundos por lote.
- Edge computing y dispositivos embebidos: con 2M de parámetros, 22 MB de VRAM pico y pesos de 8 MB, el modelo cabe en GPUs de consumo e incluso en entornos con recursos muy limitados, permitiendo inferencia local sin nube.
- Forecasting en investigación: las ablaciones publicadas (raw, sin delta-rule, transformer) permiten reproducir experimentos y comparar contribuciones arquitectónicas con un coste de entrenamiento mínimo.

## Benchmarks y rendimiento

Evaluación zero-shot sobre 12 tareas ETT (ETTh1, ETTh2, ETTm1, ETTm2 con H ∈ {96, 192, 336}), context_len=512, stride=pred_len:

| Modelo | Parametros | MSE medio ↓ | MAE medio ↓ | WAPE medio ↓ | NRMSE medio ↓ | Latencia (B=16, L=512) | VRAM pico |
|---|---:|---:|---:|---:|---:|---:|---:|
| Google TimesFM 200M | 203,57M | 0,3878 | 0,3807 | 0,3878 | 0,6273 | 413,49 ms | 796,6 MB |
| RetCast-JEPA 2M (zero-shot) | 2,05M | 0,3706 | 0,3800 | 0,3869 | 0,6150 | 17,44 ms | 22,0 MB |
| RetCast-JEPA 5M (zero-shot) | 5,11M | 0,3831 | 0,3845 | 0,3913 | 0,6251 | 32,17 ms | 36,7 MB |
| RetCast-JEPA 9M (zero-shot) | 9,19M | 0,3799 | 0,3836 | 0,3887 | 0,6190 | 50,31 ms | 55,3 MB |
| Seasonal Naive | 0 | 0,4638 | 0,4089 | 0,4166 | 0,6892 | — | — |

Ablaciones controladas a 2M zero-shot:

| Variante | Parametros | MSE medio ↓ | MAE medio ↓ | JEPA Cosine ↑ | Eff. Rank ↑ | Retrieval R@1 ↑ |
|---|---:|---:|---:|---:|---:|---:|
| RetNet2.0 + JEPA (2M) | 2.052.180 | 0,3706 | 0,3800 | 0,809 | 17,9 | 0,070 |
| RetNet2.0 Raw (sin JEPA) | 2.052.180 | 0,3792 | 0,3819 | 0,030 | 18,8 | 0,013 |
| Plain RetNet + JEPA | 2.047.044 | 0,3985 | 0,3927 | 0,798 | 17,5 | 0,080 |
| Transformer + JEPA | 2.049.604 | 0,4209 | 0,4003 | 0,721 | 16,4 | 0,062 |

## Requisitos de hardware

- VRAM estimada para inferencia: 22,0 MB (2M), 36,7 MB (5M) y 55,3 MB (9M) con B=16 y L=512, incluyendo activaciones.
- Pesos en disco: 8,09 MB (2M), 20,01 MB (5M) y 35,87 MB (9M) en safetensors fp32.
- GPU recomendadas: cualquier GPU con al menos ~100 MB libres es suficiente; A100, H100, RTX 4090, RTX 3090, T4 e incluso iGPUs modernas.
- Cabe holgadamente en GPU de consumo: sí, en todas las variantes; también en CPU para lotes pequenos.
- Opciones de despliegue: el paquete propio `retcast` (instalable con `pip install -e .` desde el repositorio GitHub) y PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 17,44 ms (2M), 32,17 ms (5M) y 50,31 ms (9M) para B=16, L=512, en el hardware de referencia no especificado en la model card.
- Estado recurrente: 830 KB fijos a L=16.384, independiente de la longitud del histórico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MSE medio ETT (zero-shot) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| RetCast-JEPA 2M | 2,05M | 512 (probado hasta 16.384 en estado recurrente) | 0,3706 | MIT | Hugging Face + GitHub |
| Google TimesFM 200M | 203,57M | no disponible en la información | 0,3878 | no disponible en la información | Hugging Face (`timesfm-1.0-200m-pytorch`) |
| Seasonal Naive (baseline) | 0 | — | 0,4638 | — | — |
| RetCast-JEPA 9M | 9,19M | 512 | 0,3799 | MIT | Hugging Face + GitHub |

No se dispone de datos de otros modelos fundacionales de series temporales (Chronos, Moirai, Lag-Llama) en la información proporcionada, por lo que no se incluyen en la comparativa.

## Limitaciones y advertencias

- Modelo puramente numérico: no procesa texto, imágenes ni audio; no soporta tool calling ni agentes.
- Entrenado exclusivamente sobre series no-ETT, lo que puede introducir sesgo hacia los 9 dominios del corpus de preentrenamiento y el dataset UCI solar_AL; el rendimiento en dominios muy distintos (por ejemplo, series médicas o de tráfico) no está documentado.
- Evaluación limitada a 12 tareas ETT con horizontes 96, 192 y 336; no hay resultados publicados en otros benchmarks (M3, M4, Monash, etc.).
- Riesgo de degradación en series con cambios de régimen abruptos no representados en el corpus de preentrenamiento.
- Los cuantiles q10–q90 no están calibrados de forma explícita en la documentación; su cobertura empírica no se reporta.
- No se documentan variantes cuantizadas (GGUF, INT8, INT4), lo que limita el despliegue en entornos sin PyTorch.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- Las cifras de latencia y VRAM corresponden al hardware de referencia del autor, no especificado; pueden variar en otros entornos.
- Licencia MIT permite uso comercial, pero los datasets de preentrenamiento (`autogluon/chronos_datasets`, UCI solar_AL) conservan sus licencias upstream y deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/starkprateek1/retcast-jepa
- Repositorio GitHub (código, scripts de entrenamiento, tests y logs de benchmarks): https://github.com/prateekstark/retcast
- Dataset de preentrenamiento: https://huggingface.co/datasets/autogluon/chronos_datasets
- Modelo de comparación TimesFM 200M: https://huggingface.co/google/timesfm-1.0-200m-pytorch
- Paper de JEPA (referencia citada en la model card, sin enlace explícito): no disponible
- Paper de RetNet2.0 (referencia citada en la model card, sin enlace explícito): no disponible
