# ueuegio/LightPFN

## Resumen

LightPFN es una familia de modelos fundacionales tabulares de pequeno tamano (por debajo de 5 millones de parametros) desarrollada por Giorgio Ottoboni (usuario `ueuegio` en Hugging Face). Se trata de redes ajustadas a priors (prior-data-fitted networks, PFN) que resuelven tareas de clasificacion y regresion tabular mediante aprendizaje en contexto: el metodo `fit` almacena el conjunto de entrenamiento como contexto y `predict_proba`, `predict` y `predict_quantiles` responden en un unico forward pass, sin entrenamiento sobre los datos del usuario ni ajuste de hiperparametros.

El modelo se entrena exclusivamente con datos sinteticos (priors de grafos y reglas), sin usar conjuntos de datos reales ni destilacion de otros modelos fundacionales tabulares. Esta disenado para ejecutarse en CPU, CUDA, ROCm y GPUs Vulkan, lo que lo hace especialmente atractivo para entornos con hardware modesto o heterogeneo.

La version 1.5.1 (11 de noviembre de 2026) incorpora categoricas nativas, regresion por cuantiles (999 cuantiles), soporte para tablas anchas y una inferencia portable mas rapida. En el leaderboard oficial de TabArena ocupa la posicion 31 de 99 con un Elo de 1447, por encima de todos los metodos basados en arboles, aunque por debajo de los modelos fundacionales tabulares de mayor tamano, especialmente en regresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Prior-data-fitted network (PFN) sobre transformer, aprendizaje en contexto |
| Parametros totales | 4.609.472 (clasificador); 4.772.519 (regresor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 20.000 filas (clasificador, 4 miembros por defecto); hasta 50.000 filas (regresor, 2 miembros por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | Apache 2.0 (codigo y pesos) |
| Formato de pesos | safetensors |
| Tarea | Clasificacion (2 a 10 clases) y regresion (media y 999 cuantiles) |
| Libreria | `lightpfn` (PyPI) |
| Backends | CPU, CUDA, ROCm, Vulkan |

## Arquitectura y entrenamiento

LightPFN es una red ajustada a priors (PFN) que implementa aprendizaje en contexto sobre datos tabulares. El modelo recibe el conjunto de entrenamiento completo como contexto y produce predicciones en un unico forward pass, siguiendo el paradigma de los modelos fundacionales tabulares como TabPFN. El clasificador y el regresor comparten tronco: el regresor se afina a partir del tronco del clasificador sobre un prior de regresion sintetico.

El entrenamiento se realiza exclusivamente sobre tareas sinteticas generadas mediante priors de grafos y reglas, con hasta 60.000 filas por tarea, y se afina sobre tablas de entre 64 y 500 caracteristicas. Segun la model card, no se utilizaron conjuntos de datos reales, destilacion, ni pesos o salidas de otros modelos fundacionales tabulares. La version 1.5 introduce categoricas nativas, regresion por cuantiles y soporte para tablas anchas, ademas de una inferencia mas rapida (1,65x en entrenamiento y 1,64x en prediccion respecto a la 1.1.0 en el protocolo de TabArena sobre 31 tareas de clasificacion con una RTX 5090).

## Capacidades

- Clasificacion tabular de 2 a 10 clases con `predict_proba`.
- Regresion tabular con prediccion de media y de 999 cuantiles mediante `predict_quantiles`.
- Aprendizaje en contexto: no requiere entrenamiento sobre los datos del usuario ni ajuste de hiperparametros.
- Soporte de variables categoricas, de cadena, booleanas y valores faltantes; deteccion automatica de categoricas con `cat="auto"`.
- Acepta arrays de NumPy y DataFrames de pandas como entrada.
- Ejecucion en CPU, CUDA, ROCm y GPUs Vulkan.
- Manejo de tablas anchas (hasta 500 caracteristicas en el afinado).
- Contexto de hasta 20.000 filas (clasificador) y 50.000 filas (regresor).
- No dispone de tool calling, capacidades de agente, vision, audio ni generacion de texto: es un modelo estrictamente tabular.

## Casos de uso

- Clasificacion rapida en produccion con hardware modesto: al ejecutarse en CPU y Vulkan, permite desplegar un clasificador tabular sin GPU dedicada, con un unico forward pass por prediccion y sin reentrenamiento.
- Prediccion con incertidumbre en regresion: `predict_quantiles` con 999 cuantiles permite construir intervalos de prediccion para previsiones de demanda, precios o riesgo sin modelos auxiliares.
- Prototipado y analisis exploratorio: sustituye a scikit-learn en fases tempranas al no requerir busqueda de hiperparametros; `fit` y `predict` bastan para obtener una linea base solida.
- Datos con categoricas y valores faltantes: el soporte nativo de categoricas y la deteccion automatica con `cat="auto"` simplifican pipelines sobre datos tabulares reales sin preprocesado extenso.
- Entornos con hardware heterogeneo: el soporte de CUDA, ROCm y Vulkan permite ejecutar el mismo modelo en estaciones con GPUs AMD, NVIDIA o integradas.
- Tablas anchas con muchas caracteristicas: el afinado sobre 64 a 500 caracteristicas lo hace adecuado para datasets con decenas o cientos de columnas.
- Comparacion de modelos en evaluacion: su inclusion en TabArena como referencia ligera permite contrastar metodos de arboles y modelos fundacionales mayores con un coste computacional minimo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| TabArena, leaderboard oficial, 51 datasets (1.5.1, 11 nov. 2026) | 31 de 99, Elo 1447 (+53 / -61); por encima de todos los metodos basados en arboles; en las fronteras de Pareto de Elo frente a tiempo de entrenamiento e inferencia |
| TabArena, 38 datasets de clasificacion | 28 de 103 (Elo 1468) |
| TabArena, 13 datasets de regresion | 47 de 101 (Elo 1431; CatBoost por defecto 1410) |
| 23 datasets de regresion de OpenML fuera de TabArena | RMSE inferior a CatBoost por defecto en 22 de 23 |
| Velocidad en GPU, protocolo TabArena, 31 tareas de clasificacion, RTX 5090 (1.5.1 vs 1.1.0) | 1,65x mas rapido en entrenamiento, 1,64x mas rapido en prediccion |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,6-4,8 millones de parametros, los pesos en safetensors ocupan del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier modelo moderno es suficiente; la model card reporta mediciones en una RTX 5090.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual, incluidas integradas con soporte Vulkan.
- Opciones de despliegue: paquete `lightpfn` de PyPI (carga los pesos en un commit fijado); backends CPU, CUDA, ROCm y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la model card reporta mejoras de 1,65x en entrenamiento y 1,64x en prediccion respecto a la 1.1.0, pero no se publican valores absolutos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightPFN 1.5.1 | 4,6-4,8 M | hasta 20.000 (clasif.) / 50.000 (regr.) filas | PFN sobre transformer, solo datos sinteticos | Apache 2.0 | Hugging Face + PyPI |
| TabPFN | no disponible en la informacion | no disponible en la informacion | PFN tabular | no disponible en la informacion | mencionado como modelo fundacional tabular mayor |
| CatBoost (por defecto) | no aplica (arboles) | no aplica | Gradient boosting | no disponible en la informacion | referencia en TabArena (Elo 1410 en regresion) |
| Metodos basados en arboles (TabArena) | no aplica | no aplica | Arboles | no disponible en la informacion | superados por LightPFN en Elo global segun la model card |

La model card senala que los modelos fundacionales tabulares de mayor tamano siguen por delante, de forma clara en regresion. No se dispone de datos concretos de TabPFN en la informacion proporcionada.

## Limitaciones y advertencias

- Los modelos fundacionales tabulares de mayor tamano superan a LightPFN, especialmente en regresion (puesto 47 de 101 en TabArena para regresion).
- Entrenado solo con datos sinteticos: el rendimiento puede degradarse en distribuciones alejadas de los priors de entrenamiento.
- Contexto limitado a 20.000 filas (clasificador) y 50.000 filas (regresor); los datasets mayores requieren submuestreo o particionado.
- Clasificacion limitada a entre 2 y 10 clases.
- No es un modelo linguistico: no procesa texto libre, no soporta tool calling ni agentes.
- No se publican datos de sesgo, calibracion ni robustez ante datos adversarios.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero las predicciones pueden ser erroneas sin senal clara en distribuciones fuera de dominio.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio concreto antes de produccion.
- No se dispone de informacion sobre cuantizacion ni sobre latencias absolutas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ueuegio/LightPFN
- Codigo en GitHub: https://github.com/GioOtto/LightPFN
- Paquete en PyPI: https://pypi.org/project/LightPFN/
- Informe tecnico 1.5 (PDF): https://huggingface.co/ueuegio/LightPFN/blob/main/LightPFN15_report.pdf
- Informe tecnico 1.1 (PDF): https://huggingface.co/ueuegio/LightPFN/blob/main/LightPFN_report.pdf
- Resultados detallados: https://github.com/GioOtto/LightPFN/blob/main/docs/en/RESULTS.md
- Leaderboard de TabArena: https://huggingface.co/spaces/TabArena/leaderboard
- Licencia: https://github.com/GioOtto/LightPFN/blob/main/LICENSE
