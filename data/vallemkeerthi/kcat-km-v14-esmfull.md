# VallemKeerthi/kcat-km-v14-esmfull

## Resumen
kcat-km-v14-esmfull es un modelo predictivo de aprendizaje automatico clasico (no un modelo de lenguaje generativo) desarrollado por el usuario VallemKeerthi y publicado en Hugging Face. Su objetivo es la prediccion conjunta de `log10_kcat` y `log10_km` para pares (sustrato, secuencia enzimatica), es decir, parametros cineticos de enzimas a partir de su estructura quimica de sustrato (codificada como SMILES) y su secuencia de aminoacidos. Resuelve un problema recurrente en biologia computacional y enzimologia: estimar la eficiencia catalitica sin recurrir a experimentos de laboratorio, que son costosos y lentos.

El modelo combina descriptores quimicos (MACCS keys, Morgan counts plegados y descriptores RDKit) con representaciones de la enzima basadas en composicion de aminoacidos y estados ocultos de ESM-2 (35M parametros) extraidos de las capas 6, 8 y 12, reducidos mediante PCA. Sobre esas caracteristicas entrena modelos de regresion por objetivo (ExtraTrees e HistGradientBoosting) combinados con un regresor kNN basado en similitud de Tanimoto y Jaccard de 3-meros. El repositorio ocupa 0,8 GB e incluye pesos en formato joblib y ONNX.

La relevancia actual radica en el creciente interes por predecir propiedades enzimaticas con modelos de proteina preentrenados (ESM-2) combinados con aprendizaje automatico tabular, una via mas ligera y desplegable que los grandes modelos de lenguaje biologico. El autor reporta un SCC medio de 0,5555 en validacion cruzada agrupada por cluster de secuencia.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de ExtraTrees + HistGradientBoosting + regresor kNN, con caracteristicas derivadas de ESM-2 (35M) y descriptores RDKit |
| Parametros totales | no disponible (modelo tabular; el componente ESM-2 tiene 35M parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 1022 residuos para el embedding ESM-2) |
| Tipos de cuantizacion | no disponible (pesos joblib y ONNX en fp32) |
| Idiomas soportados | no aplica (modelo de regresion cientifica) |
| Licencia | no disponible |
| Formato de pesos | joblib y ONNX |

## Arquitectura y entrenamiento
El modelo no es un transformer generativo sino un pipeline de regresion supervisada. La representacion del sustrato se construye con MACCS keys, Morgan counts plegados y descriptores RDKit. La representacion de la enzima combina la composicion de aminoacidos con el promedio de estados ocultos de ESM-2 (facebook/esm2_t12_35M_UR50D) en las capas 6, 8 y 12, procesando secuencias completas en ventanas de 1022 residuos y reduciendo la dimensionalidad con PCA. Sobre estas caracteristicas se entrenan, por cada objetivo, ExtraTrees e HistGradientBoosting, que se mezclan con un regresor de vecinos mas cercanos basado en similitud (Tanimoto para el sustrato, Jaccard de 3-meros para la secuencia).

Los pesos de mezcla y los hiperparametros del kNN se seleccionan mediante validacion cruzada agrupada por cluster de secuencia, lo que evita fuga de informacion entre proteinas similares. El resultado se somete a un post-procesado: se mezcla con una version del mismo modelo entrenada sin ESM (peso 0,25) y se aplica un shrinkage intra-enzima. El autor reporta un SCC medio de 0,5555 en la validacion cruzada por cluster. El pipeline incluye un presupuesto de tiempo de reloj para la etapa ESM: las proteinas que no se embeben a tiempo se predicen solo con el modelo sin ESM, garantizando que la inferencia termine dentro del limite del evaluador.

## Capacidades
- Prediccion de `log10_kcat` y `log10_km` para pares (SMILES, secuencia enzimatica).
- Extraccion de caracteristicas proteicas mediante ESM-2 (35M) con pooling multi-capa.
- Extraccion de descriptores quimicos mediante RDKit (MACCS, Morgan, descriptores fisicoquimicos).
- Regresion tabular con ensembles de arboles y blending con kNN basado en similitud.
- Fallback determinista: si la etapa ESM excede el presupuesto de tiempo, usa el modelo sin ESM.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision.

## Casos de uso
- Priorizacion de enzimas candidatas en ingenieria de proteinas: el modelo estima kcat y Km para variantes de secuencia y permite ordenar candidatas antes de validacion experimental, reduciendo el numero de ensayos.
- Filtrado de sustratos en diseno de rutas metabolicas: dado un conjunto de sustratos candidatos (SMILES), predice la afinidad (Km) y la tasa catalitica (kcat) frente a una enzima de interes.
- Anotacion funcional a escala de genoma: procesa secuencias en ventanas de 1022 residuos y predice parametros cineticos para enzimas anotadas, util para bases de datos como BRENDA o UniProt.
- Enriquecimiento de datasets de enzimologia: genera predicciones para pares no medidos experimentalmente y prioriza que experimentos realizar a continuacion.
- Integracion en pipelines de descubrimiento de farmacos: estimacion rapida de interacciones enzima-sustrato para descartar candidatos metabolicamente inestables.
- Docencia e investigacion en bioinformatica: el repositorio incluye `predict.py`, `features.py`, `models.py`, `knn.py`, `clusters.py`, `train.py`, `export_onnx.py`, `Dockerfile` y `requirements.lock.txt`, lo que facilita reproducir el pipeline y adaptarlo a nuevos datos.

## Benchmarks y rendimiento
| Metrica | Valor |
|---|---|
| SCC medio en validacion cruzada agrupada por cluster | 0,5555 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware
- VRAM estimada: reducida; el componente ESM-2 (35M) en fp32 ocupa aproximadamente 140 MB de pesos, y los modelos tabulares (joblib) son ligeros. El repositorio completo ocupa 0,8 GB.
- GPU recomendadas: no se requiere GPU dedicada; el modelo puede ejecutarse en CPU. Una GPU consumer (por ejemplo, RTX 3060 o superior) acelera la etapa ONNX de ESM-2.
- Cabe en cualquier GPU consumer y en entornos CPU-only, dado el tamano reducido del componente neuronal.
- Opciones de despliegue: inferencia via `predict.py` con ONNX Runtime para la etapa ESM y scikit-learn/joblib para los modelos tabulares; se incluye `Dockerfile` para contenedorizacion.
- Latencia y throughput: no disponibles; el autor menciona un presupuesto de tiempo de reloj para la etapa ESM, lo que sugiere que la latencia es una preocupacion de diseno pero no publica cifras.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de kcat/Km ni datos de rendimiento de alternativas.

## Limitaciones y advertencias
- Licencia no especificada: no hay garantia de uso comercial; es necesario contactar con el autor antes de usarlo en produccion.
- Model card muy escueta: no se documentan sesgos, composicion del dataset de entrenamiento ni cobertura taxonomica.
- Riesgo de extrapolacion: al ser un modelo tabular con kNN sobre similitud, su rendimiento puede degradarse en enzimas o sustratos poco representados en el conjunto de entrenamiento.
- El fallback sin ESM introduce heterogeneidad en las predicciones: proteinas largas o costosas de embeber pueden recibir predicciones de menor calidad sin aviso explicito.
- El SCC de 0,5555 en validacion cruzada indica correlacion moderada; las predicciones no deben tratarse como medidas experimentales.
- Sin soporte de idiomas ni texto: no es adecuado para tareas de NLP, generacion ni agentes.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion independiente por la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v14-esmfull
- ESM-2 base utilizada: https://huggingface.co/facebook/esm2_t12_35M_UR50D
