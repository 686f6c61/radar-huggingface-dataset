# VallemKeerthi/kcat-km-v10-safe

## Resumen

kcat-km-v10-safe es un modelo de prediccion conjunta de parametros cineticos enzimaticos, concretamente `log10_kcat` y `log10_km`, para pares formados por un sustrato (representado como SMILES) y una secuencia de enzima. Lo desarrolla el usuario VallemKeerthi y se distribuye en Hugging Face como un artefacto serializado (joblib y ONNX) de aproximadamente 0,7 GB, no como un modelo de lenguaje generativo. Su proposito es servir como componente de un pipeline de evaluacion de prediccion cinetica, con un diseno explicito de "safety" orientado a garantizar que la inferencia termina dentro de un limite de tiempo.

Tecnicamente no es un transformer entrenado de extremo a extremo, sino un ensemble clasico de ExtraTrees e HistGradientBoosting sobre caracteristicas quimicas e proteinicas, complementado con un regresor kNN basado en similitud de Tanimoto y Jaccard. La unica pieza neuronal es un ESM-2 de 35M parametros exportado a ONNX en int8 y ejecutado en CPU, cuyas representaciones se reducen con PCA. Es relevante para quienes trabajan en ingenieria de proteinas y enzimas, ya que la prediccion de kcat y Km es un cuello de botella habitual en el diseno de vias metabolicas y en la anotacion funcional.

La ficha se basa unicamente en la model card publicada y en los metadatos de Hugging Face. No hay informacion sobre licencia, idiomas, benchmarks ni pipeline declarado, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble clasico: ExtraTrees + HistGradientBoosting por objetivo, combinados con regresor kNN kernel sobre similitud (Tanimoto de sustrato, Jaccard de 3-mer de secuencia); encoder ESM-2 35M (int8 ONNX, CPU) con PCA para la parte proteica |
| Parametros totales | No disponible (el unico componente neuronal es ESM-2 de 35M parametros; el resto son modelos de arboles sin parametros en el sentido habitual) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; la entrada es un par SMILES + secuencia de enzima) |
| Tipos de cuantizacion | ESM-2 en int8 ONNX; el resto del ensemble se serializa en joblib |
| Idiomas soportados | No disponible (no aplica; entrada quimica y proteica) |
| Licencia | No disponible |
| Formato de pesos | joblib (modelos de arboles y kNN) + ONNX (ESM-2 int8) |
| Tamano del repo | 0,7 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo resuelve dos tareas de regresion en paralelo, `log10_kcat` y `log10_km`, a partir de un par (SMILES, secuencia de enzima). La representacion del sustrato combina MACCS keys, Morgan counts plegados (folded) y descriptores de RDKit. La representacion de la enzima combina la composicion de aminoacidos con estados ocultos de ESM-2 (35M) promediados (mean-pooled) sobre tres capas, extraidos via ONNX en int8 sobre CPU y reducidos con PCA.

Sobre esas caracteristicas se entrenan, para cada objetivo, dos modelos de arboles (ExtraTrees y HistGradientBoosting) que se mezclan con un regresor kNN kernel que opera sobre la similitud de Tanimoto entre sustratos y la similitud Jaccard entre 3-mer de secuencias. Los pesos del blend y los hiperparametros del kNN se seleccionan mediante validacion cruzada agrupada por cluster de secuencia (sequence-cluster-grouped CV), lo que evita fuga de informacion entre proteinas hom*logas. El componente de "safety" del diseno es un presupuesto de tiempo de reloj (wall-clock) en la etapa ESM: cualquier muestra que no se logre embeber a tiempo cae a la media del embedding de entrenamiento, de modo que la inferencia siempre termina dentro del limite del evaluador.

El repositorio incluye el codigo de entrenamiento (`train.py`), el exportador a ONNX (`export_onnx.py`, solo para entrenamiento), el entrypoint de inferencia (`predict.py`) y modulos auxiliares (`features.py`, `models.py`, `knn.py`, `clusters.py`), ademas de un `Dockerfile` y `requirements.lock.txt`. El build descarga `facebook/esm2_t12_35M_UR50D` y exporta el ONNX antes de entrenar.

## Capacidades

- Prediccion conjunta de `log10_kcat` y `log10_km` para un par sustrato-enzima.
- Extraccion de caracteristicas quimicas a partir de SMILES: MACCS keys, Morgan counts plegados y descriptores de RDKit.
- Extraccion de caracteristicas proteinicas a partir de secuencia: composicion de aminoacidos y embeddings ESM-2 de tres capas con PCA.
- Regresion mediante ensemble de arboles (ExtraTrees, HistGradientBoosting) con blending ponderado.
- Regresion kNN kernel sobre similitud de sustrato (Tanimoto) y de secuencia (Jaccard de 3-mer).
- Inferencia robusta con presupuesto de tiempo: fallback a la media del embedding si el encoder ESM no termina a tiempo.
- Ejecucion en CPU (el encoder ESM es int8 ONNX), sin requisito de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Anotacion de parametros cineticos en bases de datos de enzimas: dado un par (SMILES, secuencia) se obtiene una estimacion de `log10_kcat` y `log10_km` que puede usarse para priorizar experimentos o rellenar huecos en bases como BRENDA o UniProt, donde faltan valores medidos.
- Diseno de vias metabolicas: al evaluar candidatos de enzimas para un sustrato dado, el modelo permite filtrar rapidamente combinaciones con kcat alto y Km bajo antes de recurrir a ensayos in vitro.
- Ingenieria de proteinas dirigida: para variantes de una enzima con un sustrato fijo, el modelo estima el efecto de la secuencia sobre la cinetica y ayuda a rankear mutaciones candidatas.
- Cribado virtual de sustratos: dado un panel de moleculas (SMILES) y una enzima de interes, se puede estimar que sustratos son mas prometedores segun la prediccion de kcat y Km.
- Integracion en pipelines de evaluacion automatizada: el diseno con presupuesto de tiempo y fallback garantiza que la inferencia termina dentro del limite del evaluador, lo que lo hace apto para entornos tipo benchmark o CI donde no se puede colgar un proceso.
- Prototipado en entornos sin GPU: al ejecutar el encoder ESM en int8 ONNX sobre CPU y el resto como modelos de arboles en joblib, se puede desplegar en contenedores modestos, tal como sugiere el `Dockerfile` incluido.
- Docencia y experimentacion con features quimicas y proteinicas: el codigo modular (`features.py`, `knn.py`, `clusters.py`) sirve como referencia para construir pipelines de regresion con caracteristicas mixtas y validacion agrupada por cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (MAE, RMSE, R2) ni comparaciones con otros predictores de kcat/Km.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el encoder ESM-2 35M se ejecuta en int8 ONNX sobre CPU y el resto son modelos de arboles y kNN en joblib.
- GPU recomendadas: no disponibles; el diseno declarado es CPU-only para la etapa ESM.
- Cabe en consumer GPU: no aplica en el diseno actual; el modelo esta pensado para CPU.
- Opciones de despliegue: ejecucion directa via `predict.py`; contenedor Docker incluido en el repo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. La model card menciona un presupuesto de tiempo de reloj en la etapa ESM, pero no publica cifras concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros predictores de kcat/Km (por ejemplo, DLKcat, UniKP, EITLEM u otros), ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de integrarlo en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision (MAE, RMSE, R2) frente a otros metodos, por lo que su calidad predictiva no esta validada de forma independiente.
- Modelo de regresion, no generativo: no soporta tool calling, agentes, vision ni generacion de texto; cualquier expectativa en ese sentido es incorrecta.
- Dependencia de la calidad del SMILES y de la secuencia: entradas mal formateadas o proteinas muy alejadas del dominio de entrenamiento degradaran la prediccion.
- Fallback por presupuesto de tiempo: si la etapa ESM no termina a tiempo, la muestra se predice con la media del embedding de entrenamiento, lo que reduce la senal y puede sesgar la prediccion hacia el promedio del conjunto de entrenamiento.
- Riesgo de extrapolacion: al ser un ensemble de arboles y kNN, la prediccion fuera del espacio quimico o proteico cubierto por el entrenamiento no es fiable.
- Sesgos del dataset de entrenamiento: no se documenta la composicion ni la distribucion del conjunto de entrenamiento, por lo que se desconoce el sesgo hacia familias enzimaticas o tipos de sustrato sobrerrepresentados.
- Sin informacion sobre idiomas ni contexto: los campos correspondientes de la model card no aplican, pero se marcan como no disponibles en la ficha por rigor.
- Versionado confuso: el titulo de la model card indica "v3" mientras que el ID del repositorio es "v10", lo que puede generar ambiguedad sobre la version efectiva de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v10-safe
- Modelo base del encoder: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- No se han encontrado en la informacion proporcionada papers, blogs, repos adicionales ni demos.
