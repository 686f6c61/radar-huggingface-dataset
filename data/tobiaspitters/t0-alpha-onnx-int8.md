# TobiasPitters/t0-alpha-onnx-int8

## Resumen

El modelo `TobiasPitters/t0-alpha-onnx-int8` es una exportación no oficial en formato ONNX y cuantización int8 del modelo de forecasting de series temporales `theforecastingcompany/t0-alpha`, desarrollado por The Forecasting Company. Esta versión ha sido creada por Tobias Pitters, un mantenedor de SHAP y experto en IA explicable e infraestructura de inferencia, con el objetivo de permitir la ejecución del modelo en entornos sin dependencias de Python, como navegadores web mediante `onnxruntime-web`. El modelo original es un predictor de series temporales con capacidad zero-shot, capaz de generar pronósticos probabilísticos a partir de una ventana de contexto de 512 pasos. Esta exportación cuantizada reduce el tamaño del artefacto a 0.1 GB y mantiene una fidelidad media del 3% respecto a la salida original, lo que la hace adecuada para despliegues ligeros en producción o en el edge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: theforecastingcompany/t0-alpha) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 512 pasos temporales (fijo) |
| Tipos de cuantizacion | int8 (dynamic per-channel QInt8) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `t0-alpha` en la documentación proporcionada. Se sabe que es un modelo de forecasting de series temporales con capacidad zero-shot, entrenado por The Forecasting Company, pero no se especifican detalles como el número de parámetros, la composición del dataset de entrenamiento o el uso de técnicas como RLHF o DPO. La exportación ONNX mantiene la funcionalidad original, incluyendo la capacidad de manejar valores faltantes (NaN) y generar cuantiles de predicción. La cuantización int8 se aplica de forma dinámica por canal, lo que reduce el tamaño del modelo y acelera la inferencia en CPU, a costa de una pequeña pérdida de precisión (verificada dentro del 15.2% del spread del pronóstico, con una media del 3%).

## Capacidades

- Forecasting de series temporales univariantes con salida de cuantiles probabilísticos (niveles 0.1, 0.25, 0.5, 0.75, 0.9).
- Inferencia zero-shot: no requiere fine-tuning para nuevas series.
- Manejo de valores faltantes: la entrada acepta NaN, y el modelo es consciente de la ausencia de datos.
- Soporte de series de longitud variable mediante left-padding con NaN, equivalente a la llamada con longitud natural.
- Salida de 64 pasos futuros por serie, con mediana en el índice 2 de los cuantiles.
- Ejecución en entornos sin Python gracias al formato ONNX, compatible con `onnxruntime` y `onnxruntime-web`.
- Posibilidad de exportar una variante multivariante mediante el script `scripts/export_t0_onnx.py --grouped` (no incluida en este artefacto).

## Casos de uso

- Predicción de demanda en retail: el modelo puede generar pronósticos de ventas diarias o semanales a partir de 512 días de histórico, con intervalos de confianza para planificar inventario.
- Monitorización de métricas de infraestructura: predecir el uso de CPU, memoria o tráfico de red en los próximos 64 pasos, alertando ante posibles saturaciones.
- Análisis financiero de series de precios: estimar rangos de cotización futuros con cuantiles, útil para gestión de riesgo en carteras.
- Mantenimiento predictivo: anticipar fallos en equipos industriales basándose en series de sensores (temperatura, vibración) y programar intervenciones.
- Previsión de consumo energético: predecir la demanda eléctrica de un edificio o región para optimizar la generación y el almacenamiento.
- Despliegue en el navegador: gracias a la exportación ONNX, se puede integrar en aplicaciones web de análisis de datos sin backend, como demuestra el proyecto `tsfm-onnx` que ejecuta el modelo íntegramente en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de fidelidad reportada es la verificación de la salida int8 frente a la predicción oficial de `T0Forecaster.predict()`: el error medio es del 3% y el máximo del 15.2% del spread del pronóstico. No hay comparaciones con otros modelos de forecasting en la documentación.

## Requisitos de hardware

- Al ser un modelo ONNX cuantizado a int8, puede ejecutarse en CPU sin necesidad de GPU. El tamaño del artefacto es de 0.1 GB, por lo que cabe en memoria RAM de cualquier sistema moderno.
- Para inferencia en navegador, se recomienda un dispositivo con soporte WebAssembly y, opcionalmente, WebGPU para aceleración. El proyecto `tsfm-onnx` demuestra su funcionamiento en el cliente sin servidor.
- En entornos de servidor, se puede desplegar con `onnxruntime` (Python, C++, C#) o `ONNX Runtime Web` para aplicaciones frontend.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo pequeño y cuantizado, se espera una inferencia en milisegundos en CPU moderna.
- Para la variante multivariante (si se exporta con `--grouped`), los requisitos de memoria pueden aumentar, aunque no se especifican.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `t0-alpha` pertenece a la categoría de modelos fundacionales de forecasting, pero no se han identificado alternativas concretas con las que comparar en términos de parámetros, contexto o rendimiento. Se recomienda consultar el repositorio de The Forecasting Company para obtener más contexto.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por los autores del modelo original. Puede haber diferencias sutiles en la salida debido a la cuantización (error medio del 3%, máximo del 15.2% del spread).
- Solo soporta series univariantes en este artefacto. La variante multivariante requiere ejecutar el script de exportación adicional.
- La longitud de contexto está fijada en 512 pasos; series más largas deben truncarse o procesarse en ventanas.
- El modelo no es un modelo de lenguaje: no procesa texto ni instrucciones en lenguaje natural.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar el aviso de no afiliación y conservar la atribución al autor original.
- No se han documentado sesgos específicos, pero al ser un modelo de forecasting, su precisión puede degradarse en series con cambios de régimen o estacionalidad no vista en el entrenamiento.

## Enlaces

- [HuggingFace: TobiasPitters/t0-alpha-onnx-int8](https://huggingface.co/TobiasPitters/t0-alpha-onnx-int8)
- [Modelo base: theforecastingcompany/t0-alpha](https://huggingface.co/theforecastingcompany/t0-alpha)
- [GitHub: siddharth7113/tsfm-onnx (ejecución en navegador)](https://github.com/siddharth7113/tsfm-onnx)
- [Perfil de TobiasPitters en HuggingFace](https://huggingface.co/TobiasPitters)
