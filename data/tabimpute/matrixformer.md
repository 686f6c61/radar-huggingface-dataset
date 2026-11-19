# Tabimpute/MatrixFormer

## Resumen

MatrixFormer es una red neuronal preentrenada de proposito general para completar matrices numericas con entradas faltantes (matrix completion). Lo desarrolla el equipo Tabimpute, con autoria academica de Dwaipayan Saha, Jacob Feitelberg, Kyuseong Choi, Raaz Dwivedi y Anish Agarwal, y se presenta como un modelo fundacional especifico para imputacion de datos tabulares. Frente a los enfoques clasicos de imputacion, que suelen requerir un ajuste por conjunto de datos o metodos matriciales de bajo rango, MatrixFormer propone una unica red preentrenada que generaliza entre matrices de dominios distintos sin reentrenamiento.

El modelo tiene 77.998.496 parametros y una arquitectura de ocho capas de atencion alternadas por filas y columnas, con anchura 768, 16 cabezas de atencion, 12 tokens de contexto aprendidos y 5.000 bins de salida. Trabaja directamente sobre matrices numericas donde los valores ausentes se marcan con `NaN`, y devuelve predicciones puntuales mediante la media de la distribucion de salida, no mediante muestreo aleatorio.

Es relevante ahora porque aborda un problema transversal en ciencia de datos y aprendizaje automatico aplicado: la mayoria de los conjuntos tabulares reales contienen valores ausentes, y los metodos habituales (media, KNN, MICE, factorizacion matricial) no aprovechan patrones globales de la matriz. La release publica un checkpoint seleccionado tras 250.000 matrices sinteticas adicionales de entrenamiento (62.500 actualizaciones de continuacion del optimizador), con pesos en safetensors y PyTorch bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion alternada por filas y columnas (8 capas) |
| Parametros totales | 77.998.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; limite operativo de 2.000 filas x 1.000 columnas en el cargador de referencia |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; inferencia con `amp_bfloat16` en CUDA) |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y `.pth` (PyTorch state dict) |

## Arquitectura y entrenamiento

MatrixFormer es un transformer disenado especificamente para matrices, no para secuencias de texto. La innovacion central es la atencion alternada: ocho capas que alternan atencion a lo largo de filas y a lo largo de columnas, de modo que cada celda puede agregar informacion tanto de su fila como de su columna. La anchura es 768 y usa 16 cabezas de atencion. El modelo incorpora 12 tokens de contexto aprendidos que actuan como estado global de la matriz, y la salida se discretiza en 5.000 bins, sobre los que se calcula la media de la distribucion para obtener la prediccion puntual.

El checkpoint publicado corresponde a una continuacion del entrenamiento con 250.000 matrices sinteticas adicionales y 62.500 actualizaciones del optimizador; segun la model card, estas cifras describen solo esa fase de continuacion, no el historial completo de entrenamiento. No se publican el inventario de datasets, la composicion detallada del corpus ni la configuracion completa de entrenamiento. La seleccion del checkpoint se hizo tras inspeccionar monitorizacion previa sobre UCI y MissBench, por lo que esos benchmarks no son holdouts intactos de seleccion. No se documenta uso de RLHF ni DPO, algo esperable en un modelo no linguistico.

## Capacidades

- Completar matrices numericas con valores faltantes marcados como `NaN`, preservando las entradas observadas.
- Imputacion tabular de proposito general sin reentrenamiento por conjunto de datos.
- Manejo de matrices de hasta 2.000 filas y 1.000 columnas con el cargador de referencia (`max_rows`, `max_cols`).
- Prediccion puntual mediante la media de la distribucion sobre 5.000 bins de salida.
- Inferencia en CPU en float32 y en CUDA con `amp_bfloat16` en hardware compatible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades linguisticas, de vision ni de audio: solo procesa matrices numericas.
- No proporciona incertidumbre calibrada; las predicciones no son estimaciones de incertidumbre.

## Casos de uso

- Limpieza de datasets tabulares en pipelines de ciencia de datos: el modelo imputa celdas ausentes en matrices numericas de hasta 2.000 x 1.000, sustituyendo metodos como media, KNN o MICE con una unica red preentrenada y sin ajuste por dataset.
- Preprocesamiento para modelos predictivos tabulares: completar variables faltantes antes de entrenar modelos downstream (gradient boosting, regresion logistica), reduciendo el sesgo introducido por imputaciones triviales.
- Datos de sensores y series multivariantes: reconstruir lecturas perdidas en matrices de sensores x tiempo, donde la atencion alternada por filas y columnas captura dependencias temporales y entre sensores.
- Sistemas de recomendacion en fase de exploracion: completar matrices usuario x item con valores ausentes; la model card advierte que el wrapper generico no reproduce el centrado de sesgo especifico de ratings, por lo que requiere preprocesamiento adicional.
- Analisis de encuestas y estudios clinicos: imputar respuestas faltantes en matrices de sujetos x variables antes del analisis estadistico, manteniendo las entradas observadas intactas.
- Investigacion en metodos de imputacion: servir como baseline fundacional frente a metodos matriciales de bajo rango y metodos estadisticos clasicos en experimentos comparativos.
- Rellenado de matrices de covarianza o correlacion incompletas en finanzas y analisis de riesgo, donde las entradas ausentes son habituales por falta de historico.

## Benchmarks y rendimiento

La model card reporta evaluaciones sobre MissBench y UCI, pero advierte que no son holdouts intactos porque se usaron durante la seleccion del checkpoint. Los resultados son NRMSE columnwise con la desviacion tipica de la columna de verdad oculta como normalizador.

| Benchmark | Casos elegibles | NRMSE antes | NRMSE despues |
|---|---|---|---|
| MissBench (normalizacion columnwise) | 2.091 | 1,415619 | 1,256252 |
| UCI (normalizacion columnwise) | 3.058 | 1,442289 | 1,285373 |
| MissBench (normalizacion SD de columna observada) | 2.091 | 4,108524 | 4,000035 |
| UCI (normalizacion SD de columna observada) | 3.058 | 1,139899 | 1,045013 |

No se publican resultados comparativos con otros modelos de imputacion en la informacion disponible, ni evaluaciones de RecSys o causales completas para este checkpoint. Las dos definiciones de normalizacion no son intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 77,998 millones de parametros en float32, el peso de los pesos ronda los 312 MB; en la practica el consumo lo domina el tamano de la matriz de entrada y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con suficiente memoria para la matriz de entrada; `amp_bfloat16` esta soportado en Ampere y posteriores (A100, H100, RTX 30xx/40xx).
- Cabe en GPU consumer: si, el modelo es pequeno (menos de 80 M de parametros) y cabe holgadamente en cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: runtime oficial `jacobf18/MatrixFormer` (`pip install git+https://github.com/jacobf18/MatrixFormer.git`), con la clase `Expert` para inferencia. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / limite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatrixFormer (Tabimpute) | 77,998 M | Transformer con atencion alternada fila/columna | 2.000 x 1.000 celdas (cargador de referencia) | Apache 2.0 | Hugging Face |
| Metodos de bajo rango (SoftImpute, factorizacion) | no aplica | Factorizacion matricial | sin limite fijo, ajuste por matriz | variable | librerias estadisticas |
| MICE / imputacion multiple | no aplica | Modelos por columna con iteracion | sin limite fijo | variable | scikit-learn, R |
| KNN imputer | no aplica | Vecinos mas cercanos por fila | sin limite fijo | variable | scikit-learn |

No se dispone de resultados de benchmarks comparativos publicados con alternativas neuronales de imputacion en la informacion proporcionada.

## Limitaciones y advertencias

- Solo acepta matrices numericas; las variables categoricas requieren preprocesamiento previo (codificacion) antes de la imputacion.
- Las predicciones no son estimaciones de incertidumbre calibradas.
- Los benchmarks UCI y MissBench se usaron durante la seleccion del checkpoint, por lo que no son holdouts intactos y los numeros reportados pueden estar optimistamente sesgados.
- El wrapper de inferencia generico no reproduce el centrado de sesgo ni el escalado de residuos de usuario especificos de ratings; el uso en sistemas de recomendacion requiere trabajo adicional.
- Las evaluaciones de RecSys y causales no estaban completas en el momento de la release y no se reclama mejora en esas tareas.
- El limite operativo del cargador de referencia es de 2.000 filas por 1.000 columnas; matrices mayores requieren troceado manual.
- No se publican inventario de datasets, composicion del corpus ni configuracion completa de entrenamiento, lo que limita la reproducibilidad.
- Existe riesgo de sesgo heredado de los datos sinteticos y de los conjuntos UCI/MissBench usados en el desarrollo, no documentado en detalle.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no evaluados.
- Las versiones del SDK pueden fijar un checkpoint anterior por defecto; conviene fijar `revision` al hash del commit para descargas reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tabimpute/MatrixFormer
- Runtime oficial: https://github.com/jacobf18/MatrixFormer
- Paper (arXiv): https://arxiv.org/abs/2610.06751
