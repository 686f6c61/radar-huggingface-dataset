# yasserrmd/timesfm-3.0-onnx

## Resumen
TimesFM 3.0 es un modelo fundacional de pronóstico de series temporales desarrollado por Google Research, diseñado para realizar predicciones precisas en dominios muy diversos sin necesidad de entrenamiento específico por tarea. La versión presentada aquí, `yasserrmd/timesfm-3.0-onnx`, es una conversión a formato ONNX del modelo original `google/timesfm-3.0-pytorch`, optimizada para inferencia en CPU y con soporte de cuantización INT8. Esta conversión permite ejecutar el modelo en entornos sin GPU, facilitando su integración en pipelines de producción con requisitos de hardware modestos.

La exportación fija una longitud de contexto de 128 puntos temporales y un horizonte de pronóstico de 64, con una salida que incluye cuantiles para cuantificar la incertidumbre. El modelo original soporta pronóstico multivariante nativo y covariables flexibles, capacidades que se conservan en esta versión ONNX. Su relevancia radica en hacer accesible un modelo de vanguardia en forecasting a equipos que operan en infraestructura CPU, un caso habitual en entornos empresariales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo de series temporales basado en transformer) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 puntos temporales (fijo en esta exportacion) |
| Tipos de cuantizacion | FP32 e INT8 |
| Idiomas soportados | No aplica (datos numericos de series temporales) |
| Licencia | TimesFM Non-Commercial License v1.0 (derivada del modelo original) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento
No se dispone de detalles especificos de arquitectura y entrenamiento en la informacion proporcionada. El modelo original, TimesFM 3.0, es un transformer de series temporales desarrollado por Google Research, entrenado de forma autosupervisada con datos de multiples dominios para lograr capacidades de generalizacion zero-shot. La version ONNX aqui descrita es una conversion directa de los pesos de PyTorch, sin cambios en la arquitectura interna, pero con una configuracion de exportacion que fija el contexto y el horizonte. No se mencionan procesos de ajuste fino ni tecnicas como RLHF o DPO, que no son aplicables a este tipo de modelo.

## Capacidades
- Pronostico de series temporales univariante y multivariante, segun las capacidades del modelo original.
- Soporte de covariables pasadas y futuras, lo que permite incorporar informacion exogena al pronostico.
- Salida con cuantiles de pronostico (forecast_quantiles), util para estimar intervalos de confianza.
- Inferencia en CPU gracias a la conversion ONNX, con opcion de cuantizacion INT8 para reducir requisitos de memoria y acelerar la ejecucion.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni razonamiento simbolico.
- Capacidades multilingues: no aplica, al trabajar con datos numericos.

## Casos de uso
- Prediccion de demanda minorista: el modelo puede pronosticar ventas diarias o semanales a partir de historicos, ayudando a optimizar inventario y logistica. Su capacidad de manejar series multivariantes permite incluir variables como precios o promociones como covariables.
- Monitorizacion de metricas de servidores: permite anticipar picos de carga en CPU, memoria o red, facilitando el escalado automatico de infraestructura en entornos cloud. La salida con cuantiles ayuda a planificar margenes de seguridad.
- Prevision de consumo energetico: util para companias electricas o de gestion de redes, pronosticando la demanda horaria o diaria a partir de datos historicos y covariables como temperatura o dia de la semana.
- Analisis financiero de series temporales: prediccion de indicadores economicos o de flujos de caja, con intervalos de confianza para evaluar riesgos. La inferencia en CPU permite ejecutarlo en entornos con restricciones de hardware.
- Mantenimiento predictivo: pronostico de valores de sensores industriales para detectar anomalias o anticipar fallos en maquinaria, usando series multivariantes de multiples sensores.
- Optimizacion de inventario en cadena de suministro: prediccion de niveles de stock y demanda futura, integrando el modelo en sistemas de planificacion mediante ONNX Runtime en servidores CPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo original TimesFM 3.0 reporta rendimiento superior en los tres principales benchmarks de modelos fundacionales de series temporales, pero no se incluyen cifras concretas en esta ficha.

## Requisitos de hardware
- Inferencia en CPU: el modelo esta disenado para ejecutarse con ONNX Runtime en CPU, sin necesidad de GPU.
- Memoria: el archivo FP32 ocupa aproximadamente 1.7 GB; la version INT8 reduce significativamente el uso de memoria (estimado en torno a 0.5-0.7 GB, aunque no se especifica el tamano exacto).
- GPU recomendada: no necesaria; puede ejecutarse en CPU de cualquier generacion reciente.
- Compatibilidad con consumer hardware: si, cabe en cualquier maquina con al menos 2 GB de RAM disponible.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), tambien se puede servir mediante frameworks que soporten ONNX como Triton o FastAPI.
- Latencia y throughput: no disponible; dependen de la CPU y de la cuantizacion utilizada.

## Comparativa con modelos similares
La comparativa se realiza con otras opciones de pronostico de series temporales basadas en modelos fundacionales. No se dispone de datos de rendimiento para esta conversion ONNX, por lo que la comparacion se basa en caracteristicas generales.

| Modelo | Formato | Contexto | Horizonte | Licencia | Despliegue CPU |
|---|---|---|---|---|---|
| TimesFM 3.0 (PyTorch original) | PyTorch | Flexible (tipicamente 512) | Flexible | TimesFM Non-Commercial v1.0 | Requiere GPU o conversion |
| TimesFM 3.0 ONNX (este modelo) | ONNX | Fijo 128 | Fijo 64 | TimesFM Non-Commercial v1.0 | Si, optimizado para CPU |
| Amazon Chronos | PyTorch / ONNX | Variable | Variable | Apache 2.0 | Si, con conversion |

La principal ventaja de esta version ONNX es su facilidad de integracion en entornos CPU, a costa de una ventana de contexto fija y limitada a 128 puntos. El modelo original PyTorch ofrece mayor flexibilidad pero requiere mas recursos.

## Limitaciones y advertencias
- Licencia no comercial: la TimesFM Non-Commercial License v1.0 restringe el uso a fines de investigacion y evaluacion, prohibiendo su uso en productos o servicios comerciales.
- Contexto fijo: la exportacion limita la entrada a 128 puntos temporales, lo que puede ser insuficiente para series con dependencias de largo plazo. No es posible cambiar este valor sin reexportar el modelo.
- No se documentan sesgos especificos, pero el modelo puede heredar sesgos de los datos de entrenamiento originales, que no se detallan en esta ficha.
- Riesgo de alucinacion: al ser un modelo de pronostico numerico, no genera texto, pero las predicciones pueden ser inexactas en series con cambios estructurales o regime shifts no presentes en los datos historicos.
- La cuantizacion INT8 puede degradar ligeramente la precision en comparacion con FP32, aunque no se proporcionan metricas de error.
- No se garantiza soporte para todas las variantes de entrada; el modelo espera un tensor de forma [batch, variates, 128] y devuelve cuantiles.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yasserrmd/timesfm-3.0-onnx
- Modelo original (PyTorch): https://huggingface.co/google/timesfm-3.0-pytorch
- Repositorio oficial de TimesFM: https://github.com/google-research/timesfm/
- Articulo sobre TimesFM 3.0: https://www.explainx.ai/blog/google-timesfm-3-multivariate-time-series-foundation-model-2026
