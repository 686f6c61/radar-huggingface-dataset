# TobiasPitters/t0-alpha-onnx

## Resumen

El modelo `TobiasPitters/t0-alpha-onnx` es una exportación no oficial en formato ONNX (precisión fp32) del modelo `theforecastingcompany/t0-alpha`, un modelo fundacional de forecasting de series temporales desarrollado por The Forecasting Company. El objetivo de esta exportación es permitir la inferencia del modelo en entornos compatibles con ONNX, como ONNX Runtime, sin depender de la pila de PyTorch original. Esto facilita el despliegue en producción, en entornos embebidos o incluso en el navegador mediante `onnxruntime-web`, como demuestra el proyecto comunitario `tsfm-onnx`.

El modelo acepta una secuencia de contexto de 512 valores (con soporte para valores faltantes mediante NaN) y devuelve 64 pasos de predicción con cinco cuantiles (0.1, 0.25, 0.5, 0.75 y 0.9), lo que permite cuantificar la incertidumbre de la previsión. La salida se ha verificado frente a la implementación oficial de `T0Forecaster.predict()` con una discrepancia inferior al 0.0001 % en el spread del forecast. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que acerca un modelo de forecasting de última generación a un formato estándar y portable, con un tamaño de repositorio de solo 0.4 GB, lo que lo hace viable para entornos con recursos limitados. Es una opción práctica para desarrolladores que necesitan integrar predicción de series temporales en aplicaciones existentes sin reentrenar ni adaptar el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `theforecastingcompany/t0-alpha`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 (entrada `context` de tamaño fijo) |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base `t0-alpha`. Se sabe que es un modelo de forecasting de series temporales con capacidad de predicción en cero disparos (zero-shot), pero no se especifican los componentes (transformer, MLP, etc.) ni los datos de entrenamiento. La exportación ONNX conserva la funcionalidad del modelo original, incluyendo el manejo de valores faltantes (NaN) y la generación de cuantiles. El proceso de exportación se realizó en fp32 y se verificó la equivalencia con la implementación oficial de PyTorch.

No se dispone de información sobre el proceso de entrenamiento del modelo base, como el número de tokens (en este caso, series temporales), la composición del dataset o si se utilizaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia exportación a ONNX.

## Capacidades

- Generación de pronósticos de series temporales univariantes: acepta una secuencia de contexto de 512 valores y produce 64 pasos de predicción.
- Salida con cuantiles: proporciona cinco niveles de cuantil (0.1, 0.25, 0.5, 0.75, 0.9), lo que permite estimar intervalos de confianza y la mediana (índice 2).
- Manejo de valores faltantes: la entrada admite NaN para datos ausentes, y el modelo es consciente de la falta de datos (missing-aware). Se recomienda rellenar series cortas con NaN por la izquierda.
- Inferencia en un solo paso (one forward pass): no requiere autoregresión iterativa, lo que reduce la latencia.
- Soporte multivariante opcional: mediante el script `scripts/export_t0_onnx.py --grouped` se puede exportar una variante que acepta `group_ids` para series múltiples.
- Compatibilidad con ONNX Runtime y `onnxruntime-web`: puede ejecutarse en servidores, dispositivos edge y navegadores.

## Casos de uso

- Previsión de demanda en retail: el modelo puede predecir ventas futuras a partir de 512 días de histórico, con cuantiles para planificar stock y evitar roturas. Su formato ONNX permite integrarlo en sistemas de planificación existentes sin dependencias de PyTorch.
- Monitorización de métricas de infraestructura: predecir el uso de CPU, memoria o tráfico de red en los próximos 64 intervalos, útil para autoescalado proactivo. La salida con cuantiles ayuda a detectar picos anómalos.
- Predicción de consumo energético: a partir de series de consumo horario, el modelo genera previsiones a corto plazo que pueden alimentar sistemas de gestión de energía en hogares o plantas industriales.
- Análisis financiero de series de precios: aunque no es un modelo específico para finanzas, puede aplicarse a series de precios o volúmenes para obtener proyecciones a corto plazo con intervalos de confianza, como apoyo a la toma de decisiones.
- Previsión de afluencia en transporte: predecir el número de pasajeros en estaciones o rutas, con cuantiles para dimensionar recursos y planificar horarios.
- Despliegue en navegador para demos interactivas: gracias a `onnxruntime-web`, el modelo puede ejecutarse completamente en el cliente, permitiendo prototipos y herramientas de visualización sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la salida fp32 se verificó dentro del 0.0001 % del spread del forecast de la implementación oficial, pero no se proporcionan métricas comparativas (como MASE, sMAPE, etc.) frente a otros modelos de forecasting.

## Requisitos de hardware

- Tamaño del repositorio: 0.4 GB (archivo ONNX fp32). Esto sugiere un modelo relativamente ligero, aunque no se especifica el número de parámetros.
- Inferencia en CPU: al ser fp32 y de tamaño moderado, es probable que pueda ejecutarse en CPU sin problemas, aunque no se proporcionan datos de latencia o throughput.
- GPU: no se indica un requisito mínimo. Dado el tamaño, cualquier GPU moderna con al menos 1-2 GB de VRAM podría ser suficiente, pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), `onnxruntime-web` para navegador, y cualquier runtime compatible con ONNX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas de la misma categoría (modelos de forecasting de series temporales). Existen otros modelos como Chronos, TimesFM o Lag-Llama, pero no se tienen datos de rendimiento ni especificaciones para establecer una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por los autores del modelo original (`theforecastingcompany/t0-alpha`). Podría haber diferencias sutiles en el comportamiento en casos extremos.
- Contexto fijo: la entrada está limitada a 512 valores. Series más largas deben truncarse o procesarse en ventanas, lo que puede afectar a la precisión.
- Univariate por defecto: la versión estándar solo maneja una serie a la vez. Para múltiples series se requiere la variante con `group_ids`, que debe exportarse manualmente.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de forecasting, no genera texto, pero puede producir predicciones poco realistas en series con patrones no vistos durante el entrenamiento. No se documentan limitaciones específicas.
- Licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y, si el repositorio upstream incluye un archivo `NOTICE`, debe republicarse sin cambios.
- Dependencia del modelo base: el rendimiento final depende del modelo `t0-alpha` original, del que no se proporcionan detalles de entrenamiento ni limitaciones conocidas.

## Enlaces

- Modelo en Hugging Face: [TobiasPitters/t0-alpha-onnx](https://huggingface.co/TobiasPitters/t0-alpha-onnx)
- Modelo base: [theforecastingcompany/t0-alpha](https://huggingface.co/theforecastingcompany/t0-alpha)
- Proyecto de ejemplo en navegador: [siddharth7113/tsfm-onnx](https://github.com/siddharth7113/tsfm-onnx)
- ONNX (formato estándar): [https://onnx.ai/](https://onnx.ai/)
- ONNX Runtime: [https://onnxruntime.ai/models](https://onnxruntime.ai/models)
- ONNX Model Zoo: [https://github.com/onnx/models](https://github.com/onnx/models)
