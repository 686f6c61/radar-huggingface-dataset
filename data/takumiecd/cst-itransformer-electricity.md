# takumiecd/cst-itransformer-electricity

## Resumen

`takumiecd/cst-itransformer-electricity` es una reproducción independiente del modelo iTransformer aplicada al benchmark de electricidad (Electricity/ECL) de la librería Time-Series-Library de THUML. El modelo resuelve una tarea concreta de previsión multivariante de series temporales: dado un histórico de 96 horas en 321 series eléctricas, predice las 96 horas siguientes. No es un modelo de lenguaje ni un modelo fundacional generalista, sino un checkpoint de investigación especializado en forecasting horario.

La contribución principal es la variante CST (Polar Triweight Atoms), que sustituye las proyecciones FFN 512→512 del encoder de iTransformer por 2.048 átomos Polar Triweight por proyección, manteniendo el sesgo entrenable. El resultado es una reducción del 15,5% en parámetros entrenables (4.084.320 frente a 4.833.888 del denso de referencia), con un coste de rendimiento mínimo en MSE estandarizado (0,14982 frente a 0,14778).

El modelo está pensado para investigadores que trabajan en eficiencia paramétrica de arquitecturas transformer para series temporales, no para despliegues de producción en previsión eléctrica real. La licencia MIT y la inclusión del código upstream y del scaler facilitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | iTransformer (transformer con atención sobre dimensión de variables) con FFN sustituidas por CST Polar Triweight Atoms |
| Parametros totales | 4.084.320 entrenables (variante CST) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 pasos temporales de entrada, 96 de salida (configuración 96→96) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de series temporales, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | Safetensors (cargado mediante la factoría de modelo incluida) |

## Arquitectura y entrenamiento

iTransformer invierte el eje habitual de atención en transformers para series temporales: en lugar de aplicar atención sobre la dimensión temporal, la aplica sobre la dimensión de variables (las 321 series eléctricas), tratando cada serie como un token. La variante CST de este repositorio reemplaza las tres proyecciones FFN 512→512 del encoder por una descomposición en 2.048 Polar Triweight Atoms por proyección; el sesgo permanece entrenable y cada proyección expande su peso final a partir de factores de entrada y salida una vez por forward pass. Esto reduce el número de parámetros entrenables en un 15,5%.

El entrenamiento usa el CSV original del benchmark Electricity de THUML, con un scaler calculado sobre el primer 70% de las filas. Se emplea semilla 2023, batch size 16, hasta 10 épocas y la regla de checkpoint basada en validación del recetario upstream, con learning rate base de 0,0005. La variante CST usa un multiplicador de learning rate de 4× para los átomos (tras 512 actualizaciones, MSE de validación de 0,15774 con 4× frente a 0,15805 con 16×). El denso de referencia se entrenó en A100 MIG 3g.40gb con PyTorch 2.6.0+cu126 y cuatro workers de data loader; la variante CST, en RTX 4090 con PyTorch 2.9.1+cu128 y data loader monoproceso.

## Capacidades

- Previsión multivariante de series temporales: 96 pasos de entrada (horarios) para predecir 96 pasos futuros en 321 series eléctricas simultáneamente.
- Modelado de correlaciones entre variables mediante atención sobre la dimensión de series, en lugar de sobre el tiempo.
- Inferencia en CPU y GPU (flag `--device cpu` o `--device cuda`).
- Carga de pesos en Safetensors a través de la factoría de modelo incluida.
- Script de inferencia CLI que acepta un CSV con columna `date` y las 321 series listadas en `scaler.json`, y devuelve 96 filas de predicción en unidades originales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo puramente numérico de forecasting.
- Variante densa de referencia incluida (`--variant dense`) para comparación.

## Casos de uso

- Investigación en eficiencia paramétrica: comparar el checkpoint CST con el denso de referencia para evaluar el compromiso entre reducción de parámetros (15,5%) y degradación de MSE (0,00136 en MSE estandarizado) en arquitecturas iTransformer.
- Reproducción de experimentos del benchmark Electricity: el repositorio incluye scaler, curvas de aprendizaje, métricas completas y recetario de entrenamiento, lo que permite replicar los resultados con semilla 2023 y la regla de validación upstream.
- Previsión horaria de demanda eléctrica a corto plazo (96 h): útil como línea base en estudios académicos sobre 321 series agregadas, siempre que se respete la ventana de 96 horas consecutivas.
- Evaluación de métodos de factorización de pesos en transformers temporales: los átomos Polar Triweight como alternativa a FFN densas pueden probarse en otros datasets de Time-Series-Library modificando el recetario.
- Benchmarking de hardware para entrenamiento e inferencia: el repositorio publica latencias y memoria pico medidas en RTX 4090 y A100 MIG 3g.40gb, útiles para planificar experimentos similares.
- Docencia y formación en series temporales: el modelo, pequeño (4M parámetros) y con inferencia en CPU, sirve como ejemplo didáctico de iTransformer y de factorización de proyecciones.
- Análisis de sensibilidad al learning rate de los átomos: el recetario permite variar `CST_ATOM_LR_MULTIPLIER` para estudiar el efecto en la convergencia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test estandarizado del benchmark Electricity (96→96):

| Modelo | MSE test estandarizado | MAE test estandarizado | Época seleccionada | Parámetros entrenables |
|---|---:|---:|---:|---:|
| Dense (referencia) | 0,14778 | 0,23948 | 8 | 4.833.888 |
| CST | 0,14982 | 0,24189 | 10 | 4.084.320 |

Rendimiento de entrenamiento medido (mediana de 64 actualizaciones tras 8 de warm-up, incluyendo transferencia, forward, backward y update):

| Dispositivo | Paso Dense (ms) | Paso CST (ms) | Pico Dense (MiB) | Pico CST (MiB) |
|---|---:|---:|---:|---:|
| RTX 4090 | 11,70 | 15,98 | 809,4 | 951,6 |
| A100 MIG 3g.40gb | 38,98 | 50,81 | 808,3 | 950,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint tiene 4,08 M parámetros entrenables y el pico de memoria en entrenamiento medido es de 951,6 MiB (CST) y 809,4 MiB (Dense) en RTX 4090 y A100 MIG 3g.40gb. La inferencia requiere bastante menos.
- GPU recomendadas: RTX 4090 (paso CST de 15,98 ms) y A100 MIG 3g.40gb (paso CST de 50,81 ms) son las validadas por el autor. Cualquier GPU con al menos ~1 GB de VRAM libre debería bastar para inferencia.
- Cabe en GPU de consumo: sí, con margen amplio; también hay soporte explícito de inferencia en CPU (`--device cpu`).
- Opciones de despliegue: script `inference.py` incluido en el repositorio, que carga Safetensors mediante la factoría de modelo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: paso de entrenamiento de 11,70 ms (Dense) y 15,98 ms (CST) en RTX 4090; 38,98 ms y 50,81 ms en A100 MIG 3g.40gb. No se publica latencia de inferencia específica.

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Contexto entrada→salida | MSE test estandarizado | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| CST iTransformer (este) | 4.084.320 | 96→96 | 0,14982 | MIT | Hugging Face |
| Dense iTransformer (referencia incluida) | 4.833.888 | 96→96 | 0,14778 | MIT (upstream) | Incluido en el repo |
| iTransformer upstream (THUML) | no disponible en la información | 96→96 | no disponible en la información | no disponible en la información | GitHub THUML |

No se dispone de datos de otros modelos comparables (PatchTST, TimesNet, DLinear) en la información proporcionada; no se inventan cifras.

## Limitaciones y advertencias

- Modelo especializado y de alcance muy acotado: solo predice 96 pasos horarios sobre las 321 series del benchmark Electricity; no es un modelo generalista ni transferible sin reentrenamiento.
- El CSV de entrada debe contener exactamente las 321 series listadas en `scaler.json` y las últimas 96 filas deben ser lecturas horarias consecutivas; cualquier desviación invalida la predicción.
- El scaler se calcula sobre el primer 70% de las filas del dataset original, lo que puede introducir sesgo si se aplica a distribuciones distintas a las del benchmark.
- La variante CST es ligeramente peor que la densa en MSE (0,14982 frente a 0,14778) y MAE (0,24189 frente a 0,23948): no es una mejora de precisión, sino un compromiso por eficiencia paramétrica.
- El paso de entrenamiento CST es más lento que el denso (15,98 frente a 11,70 ms en RTX 4090; 50,81 frente a 38,98 ms en A100 MIG) y consume más memoria pico (951,6 frente a 809,4 MiB), pese a tener menos parámetros.
- El modelo se entrenó con una única semilla (2023) y hasta 10 épocas; la variabilidad entre semillas no se documenta.
- Reproducción con NumPy 2 requiere sustituir `np.Inf` por `np.inf` en el trainer upstream, según advierte el autor.
- Sin datos publicados sobre sesgos, robustez ante datos anómalos o comportamiento fuera de distribución; no debe usarse en producción eléctrica real sin validación adicional.
- La licencia MIT permite uso comercial, pero el código upstream incluido en `upstream/` conserva su propia licencia, que debe revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takumiecd/cst-itransformer-electricity
- README en japonés: https://huggingface.co/takumiecd/cst-itransformer-electricity/blob/main/README.ja.md
- Recetario upstream de iTransformer para ECL: https://github.com/thuml/iTransformer/blob/c2426e68ca13f74aaec08045c5c724d8ad328124/scripts/multivariate_forecasting/ECL/iTransformer.sh
- Dataset Electricity de THUML: https://huggingface.co/datasets/thuml/Time-Series-Library/blob/2b66e59ee19dac8f6f19fb5d4997f289fdfea357/electricity/electricity.csv
- Repositorio iTransformer (THUML): https://github.com/thuml/iTransformer
- Librería Time-Series-Library (THUML): https://github.com/thuml/Time-Series-Library
