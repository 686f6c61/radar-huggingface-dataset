# stable-ai/LimiX-16M

## Resumen

LimiX-16M es un modelo fundacional tabular (tabular foundation model, TFM) publicado por la organización stable-ai dentro de la familia LimiX, desarrollada por el equipo LimiX-LDM. Se trata de un transformer de aproximadamente 16 millones de parámetros (dato inferido de la nomenclatura del repositorio, no confirmado de forma explícita) especializado en datos estructurados, no en texto: un único checkpoint que aborda clasificación, regresión, imputación de valores faltantes, selección de características, selección de muestras e inferencia causal bajo una misma receta de entrenamiento e inferencia.

El modelo sigue el paradigma de aprendizaje en contexto (in-context learning) propio de los TFM: no requiere reentrenamiento ni ajuste de hiperparámetros por tarea, sino que recibe el conjunto de entrenamiento (X_train, y_train) y el conjunto de test (X_test) en una sola llamada y devuelve predicciones. La arquitectura aplica mecanismos de atención tanto sobre la dimensión de muestras como sobre la de características, con el objetivo de identificar patrones relevantes en filas y columnas.

Su relevancia actual radica en que propone sustituir pipelines artesanales basados en gradient boosting (XGBoost, LightGBM) por un modelo único y generalista para datos tabulares, con un coste computacional muy bajo por su tamaño. El repositorio de HuggingFace acumula 174 descargas y 52 likes desde su creación el 28 de agosto de 2025, y el tamaño del repo (0,1 GB) es coherente con un checkpoint de decenas de megabytes. Conviene advertir que la model card del repositorio describe en realidad LimiX-2M, la variante de 2M parámetros lanzada el 10 de noviembre de 2025, y no documenta de forma específica el checkpoint de 16M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer optimizado para modelado de datos estructurados, con atención sobre las dimensiones de muestra y de característica. La variante LimiX-2M describe además un esquema "tokenize-and-route" con tokenización RaBEL y enrutado alineado con la lectura (readout-aligned routing) |
| Parámetros totales | Aproximadamente 16M (deducido de la nomenclatura "LimiX-16M"; no confirmado explícitamente en la información disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se distribuyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible. El modelo opera sobre datos tabulares (valores numéricos y categóricos), no sobre texto en lenguaje natural |
| Licencia | apache-2.0 según los metadatos del repositorio. La model card matiza que el código del repositorio asociado es Apache-2.0, mientras que el uso de los pesos está sujeto a una Model License: disponibles libremente para investigación académica y para uso comercial previa autorización |
| Formato de pesos | .ckpt (checkpoint de PyTorch). El ejemplo de la model card descarga el fichero mediante hf_hub_download |

## Arquitectura y entrenamiento

LimiX adopta una arquitectura transformer adaptada al modelado de datos estructurados y a la generalización entre tareas. El modelo embebe las características X y los objetivos Y procedentes de una base de conocimiento previo (prior knowledge base) en representaciones tipo token y, en los módulos centrales, aplica atención cruzada sobre las dimensiones de muestra y de característica para localizar patrones salientes en las filas y columnas relevantes. La inferencia es de tipo in-context: el conjunto de entrenamiento se pasa como contexto y no se actualizan pesos.

La variante LimiX-2M, descrita en el artículo arXiv:2606.04485, introduce dos innovaciones técnicas que la model card atribuye a la mitigación de dos problemas concretos de los TFM: el colapso de bajo rango (low-rank collapse) y los cuellos de botella de atención. Para ello emplea un marco "tokenize-and-route" con tokenización RaBEL y una arquitectura de enrutado alineada con el readout. Asimismo, la versión 2M incorpora un mecanismo de recuperación (retrieval) mejorado que incrementa el rendimiento y reduce el tiempo de inferencia y el consumo de memoria. No se especifica si estas mejoras están presentes en el checkpoint de 16M.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de datos sintéticos frente a reales ni sobre el uso de RLHF, DPO u otras técnicas de alineamiento. El artículo de referencia de la familia (LimiX: Unleashing Structured-Data Modeling Capability for Generalist Intelligence, arXiv:2509.03505) es la fuente técnica original, pero sus detalles no se recogen en la información proporcionada.

## Capacidades

- Clasificación tabular binaria y multiclase sobre datos estructurados.
- Regresión tabular sobre variables objetivo continuas.
- Imputación de valores faltantes dentro del mismo modelo y receta de inferencia.
- Selección de características (feature selection) para identificar columnas relevantes.
- Selección de muestras (sample selection) para detectar instancias informativas o anómalas.
- Inferencia causal sobre datos observacionales.
- Aprendizaje en contexto sin reentrenamiento: basta con invocar el predictor con X_train, y_train y X_test.
- Mecanismo de recuperación (retrieval) mencionado para LimiX-2M; no confirmado para el checkpoint de 16M.
- Ejecución en CPU o GPU mediante torch.device, con backend distribuido configurable a través de las variables de entorno RANK, WORLD_SIZE, MASTER_ADDR y MASTER_PORT.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades de visión, audio ni multilingüismo.

## Casos de uso

- Clasificación tabular con pocos datos: en dominios como diagnóstico médico o scoring de riesgo crediticio, donde los conjuntos de entrenamiento tienen cientos o pocos miles de filas, LimiX-16M puede ofrecer predicciones sin ajuste de hiperparámetros ni validación cruzada extensiva, sustituyendo el ciclo habitual de búsqueda de hiperparámetros con XGBoost o LightGBM.
- Regresión en datos estructurados: predicción de demanda, precios o tiempos de servicio a partir de variables tabulares, aprovechando que el modelo cubre regresión con la misma receta de inferencia que la clasificación.
- Limpieza e imputación de datos: uso del modelo para rellenar valores faltantes en tablas de producción antes de alimentar otros sistemas analíticos, evitando mantener un pipeline separado de imputación.
- Selección de características en pipelines existentes: reducir la dimensionalidad de un dataset identificando las columnas más relevantes y alimentar después un modelo clásico más ligero o un sistema de reglas de negocio.
- Selección de muestras y curaduría de datasets: detectar filas poco informativas, duplicadas o anómalas en un conjunto de entrenamiento antes de usarlo para entrenar otros modelos.
- Inferencia causal en estudios observacionales: estimación de efectos de tratamiento o de intervenciones a partir de datos tabulares, un caso de uso que en la práctica suele requerir paquetes estadísticos específicos.
- Baseline rápido en competiciones y prototipado: obtener una referencia competitiva en horas en lugar de días, y comparar después contra pipelines optimizados manualmente.
- Despliegue en entornos sin GPU: gracias a su tamaño reducido, el checkpoint puede ejecutarse en CPU en servicios de baja latencia o en dispositivos con recursos limitados.
- Evaluación interna de modelos tabulares: usar LimiX-16M como referencia fija en pruebas de regresión de pipelines de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card afirma que LimiX-2M alcanza resultados de estado del arte en benchmarks tabulares con requisitos de cómputo significativamente menores, pero no se incluyen cifras concretas (ni MMLU, ni HumanEval, ni GSM8K, ni métricas tabulares como AUC o RMSE sobre datasets específicos) para LimiX-16M ni para LimiX-2M. Tampoco se proporcionan resultados comparativos frente a XGBoost, LightGBM, CatBoost, TabPFN u otros modelos fundacionales tabulares. Las afirmaciones de rendimiento del autor no pueden verificarse con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 32 MB para los pesos en bf16/fp16 y 64 MB en fp32, calculado a partir de 16M parámetros. La memoria total está dominada por el conjunto de datos que se pasa en contexto (X_train, y_train, X_test), no por los pesos.
- GPU recomendadas: no se requiere una GPU de gama alta. Cualquier GPU con soporte CUDA es suficiente, incluidas RTX 3060, RTX 4090, A100 o H100, aunque el modelo no las aprovecha por tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en GPU integradas. La ejecución en CPU es viable, tal y como refleja el propio ejemplo de la model card (torch.device('cuda' if torch.cuda.is_available() else 'cpu')).
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La inferencia se realiza mediante la clase LimiXPredictor del módulo inference.predictor, que exige clonar el repositorio oficial de GitHub e instalar dependencias como scikit-learn, einops, huggingface-hub, matplotlib, networkx, numpy, pandas, scipy, tqdm, typing_extensions, xgboost, kditransform y hyperopt.
- Requisito de backend: el predictor espera un backend distribuido, por lo que hay que definir las variables de entorno RANK=0, WORLD_SIZE=1, MASTER_ADDR=127.0.0.1 y MASTER_PORT=29500 incluso para ejecución en un único proceso.
- Latencia y throughput estimados: no disponibles. La model card indica únicamente que la variante de 2M ofrece menor consumo de memoria y mayor velocidad de inferencia que la de 16M, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimiX-16M | ~16M (no confirmado) | No disponible | Clasificación, regresión, imputación, selección de características y muestras, inferencia causal | Apache-2.0 en metadatos; pesos sujetos a Model License con autorización para uso comercial | HuggingFace (stable-ai/LimiX-16M) + GitHub |
| LimiX-2M | 2M (según la model card) | No disponible | Mismas tareas que LimiX-16M, con retrieval mejorado | Mismo esquema que LimiX-16M | HuggingFace (stableai-org/LimiX-2M, según el ejemplo de código) |
| TabPFN (Prior Labs) | No disponible en la información proporcionada | No disponible | Clasificación y regresión tabular en contexto | No disponible | No disponible |
| TabICL | No disponible en la información proporcionada | No disponible | Clasificación tabular en contexto | No disponible | No disponible |

No se dispone de datos verificables de rendimiento, contexto ni licencia de los modelos alternativos dentro de la información proporcionada; para una comparación rigurosa debe consultarse la ficha oficial de cada proyecto. La única comparación interna contrastable es la que ofrece el propio autor: LimiX-2M frente a LimiX-16M, con menor uso de memoria y mayor velocidad de inferencia a cambio de un tamaño de 2M parámetros.

## Limitaciones y advertencias

- Discrepancia documental relevante: el repositorio consultado es LimiX-16M, pero la model card describe LimiX-2M y su ejemplo de código descarga el fichero LimiX-2M.ckpt desde el repositorio stableai-org/LimiX-2M. No hay confirmación explícita de que el checkpoint de 16M comparta arquitectura, mejoras de retrieval o hiperparámetros con la variante de 2M.
- Inconsistencia en los identificadores de la organización: los metadatos indican el autor "stable-ai", mientras que el ejemplo de código referencia "stableai-org". Conviene verificar cuál es el espacio de nombres oficial antes de integrar el modelo.
- Licencia: aunque los metadatos de HuggingFace declaran apache-2.0, la propia model card restringe los pesos a uso académico libre y a uso comercial solo con autorización previa. Para producción comercial debe aclararse por escrito con el titular.
- No es un modelo de lenguaje: no procesa texto libre, no responde a instrucciones, no soporta tool calling, agentes, ni razonamiento multi-paso. Cualquier expectativa de uso conversacional es inaplicable.
- Idiomas: no aplica soporte multilingüe; no hay información sobre el tratamiento de variables categóricas textuales ni sobre codificaciones específicas de idioma.
- Riesgo de predicciones mal calibradas fuera de la distribución del prior de entrenamiento. No se documentan los límites operativos en cuanto a número máximo de filas, número de características, cardinalidad de variables categóricas ni porcentaje tolerable de valores faltantes.
- Riesgo de alucinación en el sentido clásico: no aplica, al no generar texto. El riesgo equivalente es la producción de predicciones con aparente seguridad en dominios alejados de los datos vistos durante el entrenamiento.
- Verificabilidad: no hay cifras de benchmarks publicadas en la información disponible, por lo que las afirmaciones de estado del arte no pueden comprobarse de forma independiente.
- Dependencia de código externo: la inferencia exige clonar el repositorio de GitHub e importar inference.predictor, además de configurar variables de entorno de backend distribuido. No existe integración con la librería transformers ni con servidores de inferencia estándar.
- Dependencias pesadas para un modelo de 16M: la instalación recomendada incluye xgboost, hyperopt y kditransform, lo que añade complejidad innecesaria en entornos de despliegue mínimos.
- Madurez: el proyecto declara su primera versión (LimiX V1.0) el 29 de agosto de 2025 y la variante de 2M el 10 de noviembre de 2025. La fecha de actualización del repositorio (15 de septiembre de 2026) es posterior a la de creación, lo que sugiere revisiones del contenido; conviene fijar una revisión concreta en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stable-ai/LimiX-16M
- Artículo de LimiX-2M (arXiv:2606.04485): https://huggingface.co/papers/2606.04485
- Artículo original de LimiX (arXiv:2509.03505): https://arxiv.org/abs/2509.03505
- Repositorio en GitHub: https://github.com/limix-ldm-ai/LimiX
- Página del proyecto: https://www.limix.ai/
- Búsqueda web: no se encontraron resultados relevantes para este modelo. Las consultas devolvieron únicamente páginas de ayuda y foros sobre YouTube, sin relación con LimiX ni con modelos fundacionales tabulares.
