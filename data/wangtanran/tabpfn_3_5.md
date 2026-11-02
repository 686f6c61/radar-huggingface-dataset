# wangtanran/tabpfn_3_5

## Resumen

TabPFN-3.5 es un modelo fundacional basado en transformer que resuelve problemas de predicción sobre datos tabulares mediante aprendizaje en contexto (in-context learning) en un único pase hacia delante, sin necesidad de entrenamiento específico por tarea. Lo desarrolla Prior Labs y se distribuye a través de HuggingFace con el identificador `wangtanran/tabpfn_3_5`, un espejo del repositorio oficial `Prior-Labs/tabpfn_3_5`. Un mismo checkpoint sirve tanto para clasificación como para regresión, lo que simplifica su integración en pipelines de ciencia de datos.

El modelo se entrena exclusivamente con tareas tabulares sintéticas, lo que elimina el riesgo de fuga de datos (dataset leakage) en la fase de preentrenamiento y lo hace aplicable a dominios muy diversos: química, biología, finanzas, legal, clima o medicina, según las etiquetas declaradas por el autor. Su relevancia actual radica en que sustituye el ajuste de hiperparámetros y el entrenamiento por tarea por una inferencia directa sobre el conjunto de entrenamiento proporcionado en el contexto.

La licencia `tabpfn-3-5-license-v1.0` es permisiva para investigación y evaluación interna, pero prohíbe explícitamente cualquier uso comercial o de producción, incluida la toma de decisiones comerciales internas con sus resultados. El acceso al repositorio está condicionado a un formulario (gated) que solicita organización, rol y caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con aprendizaje en contexto (in-context learning) para datos tabulares |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (límite de 20.000 características por conjunto de datos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre datos tabulares, no sobre texto libre) |
| Licencia | tabpfn-3-5-license-v1.0 (permisiva para investigación y evaluación interna; prohíbe uso comercial y de producción) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TabPFN-3.5 es un transformer que implementa aprendizaje en contexto: el conjunto de entrenamiento se pasa como contexto al modelo y este produce predicciones en un solo pase hacia delante, sin ajuste de pesos por tarea. Un único checkpoint cubre clasificación y regresión. El repositorio incluye tres variantes: `tabpfn-v3.5-20260909.safetensors` (modelo por defecto), `tabpfn-v3.5-fast-20260909.safetensors` (versión más pequeña y rápida) y `tabpfn-v3.5-20260909_multiclass.safetensors` (arquitectura ligeramente distinta, experimental, con mejor rendimiento ocasional en clasificación multiclase).

El entrenamiento se realiza exclusivamente sobre tareas tabulares sintéticas, lo que según el autor elimina la fuga de datos desde el preentrenamiento. Cada checkpoint incorpora de serie el manejo de columnas de texto y de fecha (`TRANSFORM_TEXT`, `TRANSFORM_DATES`) y un límite de 20.000 características. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset sintético ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación tabular (binaria y multiclase) y regresión con un mismo checkpoint.
- Aprendizaje en contexto: predicción en un pase hacia delante sin entrenamiento por tarea.
- Manejo nativo de columnas de texto y de fecha mediante transformadores integrados.
- Soporte de hasta 20.000 características por conjunto de datos.
- Variante específica para clasificación multiclase (experimental).
- Variante "Fast" optimizada para menor latencia.
- Integración con la API de scikit-learn (`TabPFNClassifier`, `TabPFNRegressor`).
- No soporta datos no estructurados como imágenes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad.

## Casos de uso

- Evaluación interna de modelos tabulares: un equipo de ciencia de datos puede descargar el modelo y ejecutar benchmarks preliminares sobre sus propios conjuntos de datos para decidir si merece la pena una licencia comercial, ya que la licencia permite explícitamente pruebas y benchmarking interno.
- Clasificación en dominios científicos: aplicable a tareas de química, biología, clima o medicina donde se dispone de tablas de características y etiquetas, aprovechando el entrenamiento puramente sintético para evitar sesgos de dominio.
- Predicción de riesgo financiero en fase de prototipo: regresión sobre variables tabulares (importes, ratios, históricos) para validar la viabilidad de un modelo antes de migrar a una solución con licencia de producción.
- Análisis de datos legales y de cumplimiento: clasificación de registros estructurados con columnas de texto y fechas gracias a los transformadores integrados (`TRANSFORM_TEXT`, `TRANSFORM_DATES`).
- Prototipado rápido sin ajuste de hiperparámetros: sustitución de pipelines de gradient boosting en la fase exploratoria, ya que el modelo predice directamente a partir del conjunto de entrenamiento sin búsqueda de hiperparámetros.
- Clasificación multiclase experimental: uso de la variante `multiclass` para problemas con muchas categorías donde el checkpoint por defecto rinde peor, siempre en contexto de investigación.
- Integración en notebooks y pipelines de scikit-learn: la API `fit`/`predict`/`predict_proba` permite incorporar el modelo en flujos existentes con cambios mínimos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 2,1 GB, lo que da una cota inferior orientativa para cargar los pesos en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (2,1 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: paquete oficial `tabpfn` (instalable con `pip install tabpfn`), con clases `TabPFNClassifier` y `TabPFNRegressor` compatibles con la API de scikit-learn. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La existencia de una variante "Fast" indica que el checkpoint por defecto puede ser lento en conjuntos grandes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabPFN-3.5 | Transformer tabular con in-context learning | no disponible | límite de 20.000 características | tabpfn-3-5-license-v1.0 (no comercial) | HuggingFace (gated) |
| TabPFN-2 | Transformer tabular con in-context learning | no disponible | no disponible | no disponible | HuggingFace |
| XGBoost / LightGBM | Gradient boosting | no aplica | no aplica | permisiva (Apache/MIT) | amplia |
| AutoGluon-Tabular | Ensemble automático | no aplica | no aplica | Apache 2.0 | amplia |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Licencia restrictiva: prohibido el uso comercial o de producción, incluidos productos que generen ingresos, benchmarking competitivo para compras, entregables a clientes y decisiones comerciales internas basadas en sus resultados.
- Acceso condicionado: el repositorio es gated y requiere aceptar los términos y enviar una solicitud con organización, rol y caso de uso.
- No apto para datos no estructurados como imágenes.
- Límite de 20.000 características por conjunto de datos.
- Entrenado solo con datos sintéticos: aunque evita la fuga de datos, no garantiza el rendimiento en distribuciones reales sesgadas; el autor recomienda verificar que los datos etiquetados estén libres de sesgos en casos de alto riesgo.
- Riesgo de alucinación: no documentado explícitamente, pero al ser un modelo predictivo sobre tablas, el riesgo se manifiesta como predicciones mal calibradas en distribuciones fuera de su prior sintética.
- Idiomas: no aplica ni se documenta soporte multilingüe.
- Sin datos públicos de benchmarks, latencia ni requisitos de hardware, lo que dificulta la planificación de despliegue.
- El repositorio `wangtanran/tabpfn_3_5` es un espejo no oficial (0 descargas, 0 likes); el repositorio de referencia es `Prior-Labs/tabpfn_3_5`.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/wangtanran/tabpfn_3_5
- HuggingFace (oficial): https://huggingface.co/Prior-Labs/tabpfn_3_5
- Checkpoint por defecto: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/tabpfn-v3.5-20260909.safetensors
- Checkpoint Fast: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/tabpfn-v3.5-fast-20260909.safetensors
- Checkpoint multiclase: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/tabpfn-v3.5-20260909_multiclass.safetensors
- Repositorio de inferencia: https://github.com/PriorLabs/TabPFN
- Contacto comercial: sales@priorlabs.ai
