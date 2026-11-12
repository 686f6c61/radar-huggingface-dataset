# VallemKeerthi/kcat-km-v12-blend

## Resumen

kcat-km-v12-blend (denominado internamente "kcat–Km model v3 (Leak CURBER)" por el autor) es un modelo predictivo de aprendizaje automatico clasico orientado a la bioinformatica enzimatica. Su objetivo es predecir conjuntamente dos parametros cineticos de enzimas: `log10_kcat` (constante catalitica, turnover) y `log10_km` (constante de Michaelis-Menten) a partir de un par formado por la estructura quimica del sustrato (codificada como SMILES) y la secuencia aminoacidica de la enzima.

No es un modelo de lenguaje ni un transformer generativo: es un ensemble de regresores tabulares (ExtraTrees e HistGradientBoosting) combinado con un regresor de vecinos mas cercanos por kernel, que opera sobre caracteristicas quimicas e informacion de embeddings de proteina extraidos de ESM-2 (35M parametros) exportado a ONNX en int8 para ejecucion en CPU. El repositorio ocupa 0,7 GB, principalmente por los pesos ONNX de ESM-2 y los modelos serializados con joblib.

Su relevancia radica en el problema que aborda: la prediccion de parametros cineticos enzimaticos es un cuello de botella en diseno de enzimas, biologia sintetica y anotacion funcional, donde los datos experimentales son escasos y costosos. El modelo esta disenado explicitamente para un entorno de evaluacion con limite de tiempo ("Leak CURBER"), con un mecanismo de fallback que garantiza que la inferencia siempre termina dentro del presupuesto de wall-clock.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de regresores tabulares (ExtraTrees + HistGradientBoosting) con blend de kNN por kernel de similitud; features de sustrato (MACCS keys, Morgan counts plegados, descriptores RDKit) y de enzima (composicion aminoacidica + ESM-2 35M int8 ONNX con PCA) |
| Parametros totales | no disponible (no es un modelo neuronal unico; incluye ESM-2 35M como extractor de features) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija: par SMILES + secuencia de enzima) |
| Tipos de cuantizacion | ESM-2 exportado a ONNX en int8; modelos tabulares serializados con joblib |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | joblib (modelos tabulares y kNN) y ONNX (ESM-2 int8) |

## Arquitectura y entrenamiento

El pipeline tiene dos ramas de caracteristicas. La rama de sustrato combina MACCS keys, Morgan counts plegados y descriptores calculados con RDKit sobre la molecula SMILES. La rama de enzima combina la composicion de aminoacidos con estados ocultos de ESM-2 (facebook/esm2_t12_35M_UR50D) promediados (mean-pooling) sobre tres capas, reducidos posteriormente mediante PCA. Para cada objetivo (`log10_kcat` y `log10_km`) se entrenan dos regresores base (ExtraTrees e HistGradientBoosting) sobre esas caracteristicas, que se combinan (blend) con un regresor de vecinos mas cercanos por kernel basado en dos similitudes: Tanimoto sobre el sustrato y Jaccard sobre 3-mers de la secuencia.

Los pesos del blend y la configuracion del kNN se seleccionan mediante validacion cruzada agrupada por cluster de secuencia, lo que evita fuga de informacion entre enzimas homologueas en train y validacion. El entrenamiento se realiza con `train.py` sobre un fichero `train.parquet`; el export de ESM-2 a ONNX se hace con `export_onnx.py`. Una innovacion practica destacable es el mecanismo de seguridad temporal: la etapa de embedding ESM tiene un presupuesto de wall-clock y cualquier entrada que no se embeba a tiempo cae a la media del embedding de entrenamiento, garantizando que la inferencia siempre termina dentro del limite del evaluador. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo ajuste fino adicional no estan disponibles en la informacion proporcionada.

## Capacidades

- Prediccion conjunta de `log10_kcat` y `log10_km` para un par (SMILES de sustrato, secuencia de enzima).
- Extraccion de features de proteina mediante ESM-2 35M en ONNX int8 sobre CPU.
- Extraccion de features quimicas mediante RDKit (MACCS keys, Morgan counts, descriptores).
- Inferencia robusta con fallback a embedding medio cuando se agota el presupuesto de tiempo.
- Ejecucion en CPU, sin requerimiento de GPU.
- Empaquetado reproducible: `Dockerfile`, `requirements.lock.txt`, scripts de entrenamiento y export.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Anotacion funcional de enzimas: dado un candidato enzimatico y un sustrato de interes, estimar `kcat` y `Km` para priorizar experimentos de validacion y reducir el numero de ensayos in vitro necesarios.
- Diseno de enzimas y biologia sintetica: filtrar variantes de secuencia generadas computacionalmente por su cinetica predicha antes de sintetizarlas y caracterizarlas en laboratorio.
- Priorizacion de pares enzima-sustrato en cribados masivos: recorrer grandes librerias de pares y ordenar por cinetica predicha para seleccionar los mas prometedores.
- Construccion de modelos metabolicos: poblar parametros cineticos faltantes en modelos a escala genomica cuando no existen valores experimentales, usando el modelo como estimador con incertidumbre.
- Ingenieria de rutas metabolicas: comparar enzimas alternativas para un mismo paso de una ruta y elegir la que maximice `kcat` o minimice `Km` segun el cuello de botella.
- Integracion en pipelines bioinformaticos con restricciones de tiempo: al ejecutarse en CPU con ESM-2 int8 ONNX y fallback temporal, encaja en servicios de evaluacion con limite estricto de wall-clock.
- Investigacion en cinetica enzimatica: generar predicciones a escala para analisis de tendencias y como baseline frente a metodos experimentales o de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el pipeline esta disenado para CPU, con ESM-2 exportado a ONNX int8.
- VRAM: no requiere GPU; consumo de memoria RAM no especificado en la informacion disponible.
- GPU recomendadas: no aplica (no hay requisito de GPU); podria ejecutarse en cualquier maquina con CPU suficiente, aunque el tamano de RAM necesario no esta documentado.
- Cabe en consumer GPU: no aplica.
- Opciones de despliegue: script `predict.py` como entrypoint, contenedor via `Dockerfile`, dependencias fijadas en `requirements.lock.txt`.
- Latencia y throughput: no disponibles; existe un presupuesto de wall-clock interno para la etapa ESM con fallback, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas no aplicables; la entrada es exclusivamente SMILES y secuencia de aminoacidos.
- El fallback a la media del embedding de entrenamiento puede degradar la precision de forma silenciosa en entradas que no se embeban dentro del presupuesto de tiempo.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa ni resultados de benchmarks publicados.
- La calidad de las predicciones depende de la cobertura del dataset de entrenamiento; enzimas o sustratos fuera de la distribucion pueden producir estimaciones poco fiables.
- No se documentan sesgos especificos ni tasas de error; el uso en produccion requiere validacion propia contra datos experimentales.
- El modelo card menciona "v3" mientras el identificador del repo es "v12"; conviene verificar la version real de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v12-blend
- ESM-2 35M (dependencia): https://huggingface.co/facebook/esm2_t12_35M_UR50D
