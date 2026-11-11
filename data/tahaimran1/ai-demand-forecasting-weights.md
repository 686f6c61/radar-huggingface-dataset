# TahaImran1/ai-demand-forecasting-weights

## Resumen

`TahaImran1/ai-demand-forecasting-weights` no es un modelo de lenguaje, sino un repositorio de pesos entrenados para prediccion de demanda y apoyo a decisiones de inventario. Lo publica el usuario TahaImran1 como entregable 2 de un proyecto de previsión de demanda, e incluye checkpoints de LightGBM (tres regresores cuantílicos P10, P50 y P90 por pipeline) y de una red MLP cuantílica en PyTorch, junto con los escaladores de preprocesado ajustados únicamente sobre el split de entrenamiento.

El repositorio cubre dos pipelines independientes: el pipeline A sobre el dataset Rossmann Store Sales (1.115 tiendas) y el pipeline B sobre Store Item Demand (500 series). Ambos se entrenaron con validación cronológica estricta para evitar fuga de información (zero lookahead leakage), lo que es relevante en series temporales de retail donde un split aleatorio infla artificialmente las métricas.

Su interés práctico reside en que proporciona un artefacto listo para producción con métricas de holdout auditadas: WMAPE del 8,67 % en Rossmann y del 10,90 % en Store Item para LightGBM, además de cobertura de intervalos y recall de rotura de stock. No hay información sobre arquitectura de lenguaje, contexto ni idiomas porque no aplica: es un modelo tabular de forecasting, no un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles) y QuantileMLP en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de series temporales tabulares) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | `.txt` (modelos LightGBM serializados) y `.pt` (checkpoints PyTorch); escaladores en `.pkl` |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Tarea | Prediccion de demanda con regresion cuantílica (P10, P50, P90) |
| Datasets de entrenamiento | Rossmann Store Sales y Store Item Demand (Kaggle) |
| Salidas | Cuantiles P10, P50 y P90 de demanda; senal de riesgo de rotura de stock |

## Arquitectura y entrenamiento

El repositorio contiene dos familias de modelos por pipeline. La primera es LightGBM, con un regresor independiente por cuantil (P10, P50 y P90), lo que permite construir intervalos de predicción directamente sin asumir una distribución paramétrica. La segunda es una QuantileMLP en PyTorch que aprende los tres cuantiles de forma conjunta mediante una perdida de regresion cuantílica, y que sirve como alternativa neuronal y como contraste frente al modelo de árboles.

El entrenamiento se realizó sobre dos benchmarks públicos de Kaggle: Rossmann Store Sales (1.115 tiendas, pipeline A) y Store Item Demand (500 series, pipeline B). La validación es cronológica estricta, sin lookahead, y los escaladores de features continuas se ajustaron solo con el split de entrenamiento, lo que evita contaminación de la distribución de test. El repositorio no detalla el número de features de entrada, la ventana temporal, la composición exacta del dataset ni si hubo ajuste fino posterior; esos datos figuran como no disponibles.

## Capacidades

- Prediccion puntual de demanda (cuantil P50) por tienda, artículo o serie temporal.
- Prediccion intervalar mediante cuantiles P10 y P90, útil para planificación con niveles de servicio objetivo.
- Detección de riesgo de rotura de stock a partir de la señal de cuantiles y del clasificador implícito evaluado con recall y AUC-ROC.
- Forecasting multi-serie: soporta 1.115 tiendas (pipeline A) y 500 series (pipeline B) en el mismo artefacto.
- Preprocesado reproducible: escaladores ajustados solo en train, listos para inferencia.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Planificación de reposición en retail: usar el P50 para la previsión central y el P90 para dimensionar stock de seguridad por tienda, con la cobertura de intervalos del 80,31 % observada en Rossmann como referencia de calibración.
- Alertas de rotura de stock: integrar la señal de clasificación (recall del 98,04 % en pipeline A y 98,62 % en pipeline B) en un sistema de avisos que dispare reposiciones urgentes cuando la demanda prevista supere el inventario disponible.
- Presupuestación de compras: agregar los cuantiles por tienda y artículo para estimar escenarios pesimista, central y optimista de demanda semanal o mensual.
- Priorización de promociones: comparar la demanda prevista con y sin promoción usando el mismo pipeline para estimar el uplift esperado por tienda.
- Benchmark interno de modelos: emplear los checkpoints LightGBM y QuantileMLP como líneas base reproducibles frente a nuevos enfoques de forecasting en la misma organización.
- Investigación aplicada en series temporales: reutilizar los escaladores y los splits cronológicos como referencia para experimentos con quantile regression y comparar arquitecturas de árboles frente a MLP.
- Sustitución de hojas de cálculo en pymes: desplegar el pipeline B (500 series) como servicio de previsión diario sin infraestructura de GPU.

## Benchmarks y rendimiento

Datos de holdout publicados en la model card:

| Pipeline | Modelo | WMAPE | Cobertura [P10, P90] | Recall rotura de stock | AUC-ROC |
|---|---|---|---|---|---|
| A (Rossmann, 1.115 tiendas, 46.830 instancias) | LightGBM | 8,67 % | 80,31 % | 98,04 % | 0,9875 |
| A (Rossmann) | QuantileMLP | 12,59 % | 99,89 % | 100,00 % | no disponible |
| B (Store Item, 500 series, 45.000 instancias) | LightGBM | 10,90 % | 78,11 % | 98,62 % | 0,9877 |
| B (Store Item) | QuantileMLP | 13,05 % | 95,46 % | 99,90 % | no disponible |

LightGBM obtiene mejor error puntual en ambos pipelines, mientras que la MLP sobrecubre los intervalos (99,89 % y 95,46 % frente al 80 % nominal), lo que indica intervalos menos informativos pese a su mayor recall. No se han publicado comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: suficiente para LightGBM; los modelos de árboles se ejecutan en CPU sin GPU y con latencia de milisegundos por lote.
- GPU: solo necesaria para la QuantileMLP en PyTorch; una GPU consumer (RTX 3060 o superior) es más que suficiente dado el tamano reducido de la red.
- VRAM estimada: no disponible; por el tamano del repositorio (0,0 GB) y la naturaleza de los modelos, el consumo es mínimo.
- Cabe en GPU consumer: sí, para el componente MLP; LightGBM no requiere GPU.
- Opciones de despliegue: carga directa de los `.txt` con la API de LightGBM, `torch.load` para los `.pt`, y servicio vía FastAPI o similar. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LightGBM) | Gradient boosting | Regresión cuantílica P10/P50/P90 | 8,67 % y 10,90 % WMAPE | MIT | Hugging Face |
| Este repositorio (QuantileMLP) | Red neuronal | Regresión cuantílica conjunta | 12,59 % y 13,05 % WMAPE | MIT | Hugging Face |
| Prophet (Meta) | Modelo aditivo | Tendencia y estacionalidad | no comparable directamente | MIT | Open source |
| Temporal Fusion Transformer | Transformer | Forecasting multi-horizonte | no comparable directamente | Apache 2.0 | Open source |
| Modelos de Kaggle Rossmann top | Ensembles | Feature engineering específico | no disponible | variable | Kaggle |

La comparación con Prophet y TFT es cualitativa: no se dispone de resultados en los mismos splits para establecer una comparación numérica rigurosa. La ventaja de este repositorio es la reproducibilidad del pipeline y la validación cronológica documentada.

## Limitaciones y advertencias

- Sesgos: los modelos se entrenaron con dos datasets concretos de retail; el rendimiento puede degradarse en dominios con otra estacionalidad, granularidad o estructura de promociones.
- Alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de predicciones mal calibradas fuera del rango de entrenamiento (extrapolación en series nuevas).
- Contexto e idioma: no aplica; no es un modelo de lenguaje ni procesa texto libre.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el ajuste a datos de producción ajenos.
- La cobertura de intervalos de LightGBM (80,31 % y 78,11 %) está cerca del nominal del 80 %, pero la MLP sobrecubre de forma acusada, lo que puede inflar el stock de seguridad si se usa sin recalibrar.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado en Hugging Face; no hay evidencia de uso en producción por terceros.
- No se documentan hiperparámetros, features de entrada ni ventana temporal, lo que dificulta la reproducción exacta del entrenamiento.
- Fecha de creación registrada como 2026-11-08; conviene verificar que los artefactos corresponden a la versión esperada antes de desplegarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TahaImran1/ai-demand-forecasting-weights
- Dataset Rossmann Store Sales (Kaggle): https://www.kaggle.com/c/rossmann-store-sales
- Dataset Store Item Demand (Kaggle): https://www.kaggle.com/c/demand-forecasting-kernels-only
- Documentación de LightGBM: https://lightgbm.readthedocs.io/
- Documentación de PyTorch: https://pytorch.org/docs/stable/index.html
- Paper de regresión cuantílica con gradient boosting (Koenker y Bassett, referencia metodológica): https://projecteuclid.org/journals/annals-of-statistics/volume-6/issue-1/Regression-Quantiles/10.1214/aos/1176344616.full
