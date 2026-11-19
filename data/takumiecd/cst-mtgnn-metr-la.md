# takumiecd/cst-mtgnn-metr-la

## Resumen

CST MTGNN para METR-LA es un modelo de prediccion de series temporales especializado en forecasting de trafico. Lo desarrolla el usuario de Hugging Face `takumiecd` y resuelve un problema concreto: predecir la velocidad del trafico en los proximos 60 minutos (12 pasos de 5 minutos) en 207 sensores viarios del condado de Los Angeles, a partir de la hora previa de mediciones. Se trata de una variante del modelo MTGNN (Multivariate Time Series Forecasting with Graph Neural Networks) en la que la matriz de adyacencia aprendida entre sensores se genera mediante una capa `CSTLinear` del framework torchcst, mientras que el grafo fijo (Chart) se construye a partir de coordenadas publicas de los sensores.

El interes tecnico del modelo reside en la reduccion drastica del numero de parametros dedicados al grafo: la variante CST emplea 3.072 parametros de grafo frente a los 19.840 del MTGNN original, y aun asi mejora el error absoluto medio (MAE) en todos los horizontes evaluados. Es un modelo pequeno, orientado a inferencia en CPU o GPU consumer, con licencia Apache 2.0 y pesos en formato Safetensors.

No es un modelo de lenguaje ni un modelo fundacional: es un predictor numerico de series temporales multivariantes de un unico dominio (trafico). Su relevancia es practica para investigacion aplicada en grafos espacio-temporales y para pipelines de prediccion de trafico a corto plazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTGNN (graph neural network espacio-temporal) con generacion de grafo via `CSTLinear` (torchcst) |
| Parametros totales | no disponible (solo se publica el recuento de parametros de grafo: 3.072 en CST frente a 19.840 en MTGNN) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 12 pasos temporales de entrada (1 hora a intervalos de 5 minutos) |
| Tipos de cuantizacion | no disponible (pesos en Safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo numerico de series temporales) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es una MTGNN, es decir, una red neuronal de grafos espacio-temporal para series multivariantes. La innovacion de esta variante es sustituir el mecanismo de aprendizaje de la estructura del grafo por una unica capa `CSTLinear` del framework torchcst, que genera las puntuaciones del grafo entre sensores. Ademas, se incorpora un grafo fijo (Chart) construido a partir de las coordenadas publicas de los 207 sensores. El resultado es una reduccion de los parametros de grafo de 19.840 a 3.072, manteniendo o mejorando la precision.

El entrenamiento se realizo durante 100 epocas desde inicializacion aleatoria con semilla 17, tanto para la variante CST como para la linea base MTGNN. La evaluacion usa el mejor checkpoint segun MAE de validacion. El conjunto de datos METR-LA se divide cronologicamente en 23.967 ventanas de entrenamiento, 3.417 de validacion y 6.843 de test, con marcas de tiempo objetivo no solapadas entre particiones. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo esperable en un modelo de regresion numerica. Tampoco se detalla la composicion exacta del dataset mas alla de su origen publico (METR-LA en Zenodo).

## Capacidades

- Prediccion de velocidad del trafico a 12 pasos de 5 minutos (15, 30 y 60 minutos) para 207 sensores.
- Forecasting multivariante con dependencias espaciales modeladas mediante grafo aprendido y grafo fijo por coordenadas.
- Manejo de valores objetivo ausentes (las metricas excluyen objetivos faltantes).
- Inferencia en CPU y CUDA mediante CLI incluida en el repositorio.
- Comparacion directa entre variante CST y linea base MTGNN sobre la misma ventana (`--variant baseline`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de trafico a corto plazo en un corredor urbano: el modelo genera los proximos 60 minutos de velocidad para 207 sensores, util para paneles de movilidad y sistemas de informacion al conductor con actualizacion cada 5 minutos.
- Investigacion en grafos espacio-temporales: sirve como referencia reproducible para comparar mecanismos de generacion de grafo (CSTLinear frente a aprendizaje denso) con una reduccion de parametros de 6,5x en la componente de grafo.
- Enrutamiento dinamico y estimacion de tiempos de llegada: las predicciones a 15 y 30 minutos alimentan algoritmos de rutas que ajustan ETA segun la velocidad prevista por sensor.
- Deteccion de congestion incipiente: la comparacion entre velocidad observada y predicha permite generar alertas tempranas cuando la desviacion supera un umbral.
- Simulacion y planificacion de escenarios: el modelo puede ejecutarse sobre series historicas reemplazadas para estudiar el impacto de cambios de demanda en la red de sensores.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeno con pesos Safetensors y CLI para CPU/CUDA, es util para validar pipelines de despliegue de modelos de series temporales con latencia baja.
- Docencia y experimentacion: el repositorio incluye entrenamiento, evaluacion e inferencia, lo que facilita reproducir resultados con semilla fija y particiones cronologicas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de METR-LA. MAE en millas por hora, excluyendo objetivos ausentes.

| Modelo | MAE 15 min | MAE 30 min | MAE 60 min | MAE global | Parametros de grafo |
|---|---:|---:|---:|---:|---:|
| MTGNN | 2,938 | 3,401 | 3,960 | 3,355 | 19.840 |
| CST MTGNN | 2,809 | 3,190 | 3,573 | 3,132 | 3.072 |

Mejora del MAE global de aproximadamente el 6,6 % con un 84,5 % menos de parametros de grafo. No se han publicado resultados de otros benchmarks (RMSE, MAPE) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el modelo es un MTGNN pequeno con pesos Safetensors y un recuento de parametros de grafo de 3.072, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; no requiere memoria significativa.
- CPU: la inferencia esta soportada explicitamente en CPU mediante el CLI del repositorio.
- Opciones de despliegue: CLI propia (`infer.py`) con soporte `--device cuda`; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros de grafo | Contexto de entrada | MAE global METR-LA | Licencia |
|---|---|---:|---|---:|---|
| CST MTGNN (este) | MTGNN + CSTLinear | 3.072 | 12 pasos (1 h) | 3,132 | Apache 2.0 |
| MTGNN | MTGNN con grafo aprendido | 19.840 | 12 pasos (1 h) | 3,355 | Apache 2.0 (segun repositorio original) |
| Otros modelos espacio-temporales (Graph WaveNet, STGCN) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la linea base incluida por el autor. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio unico: solo predice velocidad de trafico en los 207 sensores de METR-LA; no es transferible directamente a otras ciudades o redes viarias sin reentrenamiento.
- Dependencia de la configuracion: los pesos estan vinculados a los IDs de sensor de `config.json`; un cambio de orden o de conjunto de sensores invalida la inferencia.
- Horizonte corto: maximo 60 minutos; no apto para planificacion a medio o largo plazo.
- Valores ausentes: las metricas excluyen objetivos faltantes, pero no se documenta el comportamiento del modelo ante entradas con huecos en la ventana de entrada.
- Sin datos de sesgo: no se publican analisis de sesgo por sensor, zona o franja horaria.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero el modelo puede producir predicciones poco realistas en regimenes no vistos (incidentes, obras, eventos extremos).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia y licencia de los datos METR-LA para uso en produccion.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni INT8 documentadas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takumiecd/cst-mtgnn-metr-la
- Repositorio GitHub (entrenamiento, evaluacion, CLI): https://github.com/takumiecd/cst-mtgnn-metr-la
- Dataset METR-LA en Zenodo: https://zenodo.org/records/5146275
- Framework torchcst: no disponible en la informacion proporcionada
- Paper de MTGNN: no disponible en la informacion proporcionada
