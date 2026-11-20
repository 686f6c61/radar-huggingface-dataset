# takumiecd/cst-patchtst-weather

## Resumen

CST PatchTST on Weather es un modelo de previsión de series temporales publicado por el usuario takumiecd en Hugging Face. Se trata de una variante del conocido PatchTST (Patch Time Series Transformer) entrenada desde cero sobre el conjunto de datos Weather, un benchmark estándar de predicción meteorológica multivariante. El objetivo del modelo es predecir 96 registros consecutivos a partir de los 336 registros previos en 21 variables medidas en una estación meteorológica; con la frecuencia nominal de 10 minutos, esto equivale a un horizonte de aproximadamente 16 horas a partir de 56 horas de histórico.

La relevancia del modelo no reside en un salto de rendimiento, sino en una comparación arquitectónica controlada: la variante CST sustituye las proyecciones de salida 256-a-128 de cada bloque FFN por 512 "Atoms" con rejillas de índices bidimensionales fijas, reduciendo el número de parámetros entrenables un 9,7 %. En la comparación de una sola semilla, las métricas de test fueron prácticamente idénticas al PatchTST original (MSE 0,14972 frente a 0,15022), a costa de un paso de entrenamiento un 19,2 % más lento.

El repositorio es de tamaño mínimo (0,0 GB según Hugging Face), con pesos en safetensors y licencia Apache 2.0. No incluye idiomas declarados ni datos de benchmarks adicionales más allá de la comparación interna, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchTST (transformer encoder) con variante CST en las proyecciones de salida de las FFN |
| Parametros totales | 832.099 (variante CST); 921.187 (baseline PatchTST) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 336 pasos temporales de entrada (historico); horizonte de prediccion de 96 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PatchTST de referencia en su configuración para Weather: tres bloques de encoder, anchura de 128 y anchura de FFN de 256. La innovación de la variante CST consiste en reemplazar la proyección de salida de 256 a 128 de cada FFN por 512 Atoms con rejillas de índices bidimensionales fijas que describen índices de características latentes. Se conserva el sesgo de la proyección, mientras que la atención, la cabeza de predicción compartida, la normalización y el resto de operaciones de la FFN provienen de la arquitectura de referencia. El modelo se entrena de forma supervisada (no auto-supervisada) y se predicen 96 pasos a partir de 336.

El entrenamiento se realizó con una sola semilla, tamaño de lote 64 y 20 épocas sobre una RTX 4090. Los parámetros ordinarios usan una tasa de aprendizaje base de 0,0001 y el grupo de Atoms de 0,00048, ambos con el factor de decaimiento tipo 3 de la referencia. El escalado por canal se ajusta sobre el segmento de entrenamiento y se emplea la división cronológica del benchmark Weather. El conjunto de test se evalúa con el checkpoint de menor MSE de validación. Los datos provienen del CSV Weather de 52.696 filas enlazado por los autores de PatchTST (SHA-256 `9b2b19b13e342d9c9b9c51620d42b4be232df7fba30e7f5c4968b7c79ab138ad`), que contiene una marca de tiempo repetida y un intervalo de 100 minutos; el preprocesado mantiene las filas originales del benchmark.

## Capacidades

- Previsión de series temporales multivariantes: 21 variables meteorológicas simultáneas.
- Horizonte de predicción de 96 pasos (aproximadamente 16 horas con muestreo de 10 minutos).
- Ventana de entrada de 336 pasos (aproximadamente 56 horas de histórico).
- Inferencia sobre CSV propio con las mismas 21 columnas del dataset Weather; la CLI usa por defecto las últimas 336 filas.
- Variantes intercambiables `baseline` y `cst` para comparación directa.
- Ejecución en CPU o GPU CUDA mediante `--device cuda`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo puramente numérico de forecasting.

## Casos de uso

- Predicción meteorológica a corto plazo: el modelo genera 96 pasos futuros de 21 variables (temperatura, humedad, presión, viento, etc.) a partir de las 56 horas previas, adecuado para ahora-casting operativo en estaciones con muestreo de 10 minutos.
- Investigación sobre eficiencia arquitectónica: la comparación baseline frente a CST permite medir el efecto de sustituir proyecciones FFN por Atoms con un 9,7 % menos de parámetros entrenables, útil para estudiar alternativas de compresión en transformers de series temporales.
- Reproducción de benchmarks: el repositorio incluye scripts de entrenamiento, exportación e inferencia, lo que permite replicar la configuración de PatchTST Weather y validar resultados con la misma semilla y división cronológica.
- Prototipado de pipelines de forecasting: la CLI `infer.py` acepta un CSV con las 21 columnas y devuelve 96 previsiones de temperatura en °C junto con las observaciones correspondientes, lo que facilita integrar el modelo en cuadernos de validación o scripts de evaluación.
- Docencia y experimentación con PatchTST: al ser un modelo pequeño (832.099 parámetros) y entrenable en una sola GPU de consumo, sirve como banco de pruebas para estudiar tokenización por parches, normalización por canal y decaimiento de learning rate en series temporales.
- Análisis de sensibilidad al preprocesado: el dataset incluye una marca de tiempo duplicada y un intervalo irregular de 100 minutos, lo que permite estudiar cómo afectan estas anomalías al entrenamiento y a las métricas en espacio estandarizado.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son la comparación interna entre las dos variantes, en espacio estandarizado y con una sola semilla:

| Modelo | Test MSE | Test MAE | Parametros entrenables | Paso de entrenamiento |
|---|---:|---:|---:|---:|
| PatchTST original | 0,15022 | 0,19772 | 921.187 | 26,15 ms |
| CST FFN output projections | 0,14972 | 0,19765 | 832.099 | 31,16 ms |

Checkpoints publicados:

| Checkpoint | Epoca | Test MSE | Test MAE |
|---|---:|---:|---:|
| baseline | 18 | 0,15022 | 0,19772 |
| cst | 20 | 0,14972 | 0,19765 |

No se han publicado resultados frente a otros modelos de forecasting (DLinear, TimesNet, iTransformer, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 832.099 parámetros en precisión de 32 bits el peso ronda los 3,3 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: el entrenamiento de referencia se realizó en una RTX 4090; para inferencia basta una GPU consumer modesta o CPU.
- Cabe en GPU de consumo: sí, sin restricciones prácticas por tamaño de modelo.
- Opciones de despliegue: PyTorch nativo con los scripts `infer.py` y `export.py` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: paso de entrenamiento medido de 26,15 ms (baseline) y 31,16 ms (CST) en RTX 4090 con lote 64; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Test MSE (Weather) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| CST PatchTST (este) | 832.099 | 336 → 96 | 0,14972 | Apache 2.0 | Hugging Face + GitHub |
| PatchTST original (variante del repo) | 921.187 | 336 → 96 | 0,15022 | Apache 2.0 (arquitectura upstream) | Incluido en el mismo repo |
| Otros modelos de forecasting | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el PatchTST de referencia con la misma configuración; no hay datos frente a DLinear, TimesNet, iTransformer ni otros modelos del benchmark Weather en la información proporcionada.

## Limitaciones y advertencias

- La comparación se realizó con una sola semilla; las diferencias de MSE (0,0005) y MAE (0,00007) están dentro de lo que podría ser ruido y no permiten concluir superioridad estadística.
- El modelo está entrenado exclusivamente sobre el dataset Weather con 21 columnas concretas; no generaliza a otras series sin reentrenamiento.
- Las métricas se reportan en espacio estandarizado, no en unidades físicas, lo que dificulta la comparación directa con literatura que reporte errores en °C u otras unidades.
- El dataset contiene una marca de tiempo duplicada y un intervalo de 100 minutos; el preprocesado conserva esas filas, lo que puede introducir irregularidades no modeladas explícitamente.
- No hay información sobre sesgos, calibración de incertidumbre ni intervalos de predicción: el modelo devuelve estimaciones puntuales.
- No se documentan restricciones adicionales de uso comercial más allá de la licencia Apache 2.0, que permite uso comercial con atribución.
- El paso de entrenamiento es un 19,2 % más lento en la variante CST, lo que puede ser relevante en pipelines de reentrenamiento frecuente.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/takumiecd/cst-patchtst-weather
- Repositorio GitHub del autor: https://github.com/takumiecd/cst-patchtst-weather
- PatchTST (repositorio de referencia): https://github.com/yuqinie98/PatchTST
- Configuración Weather de PatchTST: https://github.com/yuqinie98/PatchTST/blob/204c21efe0b39603ad6e2ca640ef5896646ab1a9/PatchTST_supervised/scripts/PatchTST/weather.sh
- Mirror del CSV Weather: https://www.uni-hildesheim.de/gitlab/domuro/PatchTST/-/blob/f720f50a210751dfbfb84c6008c19dd2cf6d8d44/PatchTST_self_supervised/dataset/weather.csv
