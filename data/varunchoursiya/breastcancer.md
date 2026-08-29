# varunchoursiya/breastcancer

## Resumen

El modelo `varunchoursiya/breastcancer` es un perceptrón multicapa (MLP) implementado en PyTorch para clasificación binaria de cáncer de mama. Desarrollado por el usuario varunchoursiya, resuelve la tarea de distinguir entre tumores malignos y benignos a partir de 30 características numéricas extraídas de imágenes de aspirados con aguja fina (FNA), utilizando el conjunto de datos Wisconsin Diagnostic Breast Cancer (WDBC). Su relevancia radica en ser un ejemplo práctico de aplicación de redes neuronales profundas en el ámbito sanitario, con un proceso de optimización de hiperparámetros mediante Optuna.

La arquitectura es un MLP con dos capas ocultas de 106 neuronas cada una, activación ReLU, normalización por lotes y dropout. El modelo se entrenó durante 60 épocas con el optimizador Adam y una tasa de aprendizaje de 0.0031. Aunque el repositorio no especifica el número total de parámetros, se puede estimar en torno a 14.700 a partir de la estructura descrita. No se trata de un modelo de lenguaje ni de visión, sino de un clasificador tabular específico para un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con 2 capas ocultas de 106 neuronas |
| Parametros totales | no disponible (estimable ~14.700) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 30 features) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`), además de `scaler.pkl` para preprocesado |

## Arquitectura y entrenamiento

El modelo es una red neuronal profunda de tipo MLP con dos capas ocultas de 106 neuronas cada una, activación ReLU, normalización por lotes (`BatchNorm1d`) y dropout con tasa 0.4393. La capa de salida es una única neurona con logits, sobre la que se aplica una sigmoide para obtener la probabilidad de malignidad. El entrenamiento se realizó con el optimizador Adam (learning rate 0.0031) y la función de pérdida `BCEWithLogitsLoss` durante 60 épocas. Los hiperparámetros se ajustaron mediante Optuna con 30 ensayos y el algoritmo TPE (Tree-structured Parzen Estimator).

El dataset WDBC contiene 569 muestras, de las cuales 455 se usaron para entrenamiento y 114 para test (división 80/20). El preprocesado incluyó la eliminación de columnas irrelevantes (`id`, `Unnamed: 32`), codificación de la variable objetivo (`M` → 1, `B` → 0) y estandarización de características con `StandardScaler`. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de tumores de mama (maligno/benigno) a partir de 30 características numéricas.
- Inferencia rápida en CPU, adecuada para entornos sin GPU.
- Soporte para integración en pipelines de Python mediante PyTorch.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo entrada tabular).
- El idioma de la documentación y los datos es inglés, aunque el modelo en sí no procesa lenguaje.

## Casos de uso

- **Soporte a la decisión clínica**: el modelo puede utilizarse como herramienta de segunda opinión para clasificar citologías de FNA, ayudando a los patólogos a priorizar casos sospechosos. Su baja latencia permite obtener una predicción en milisegundos.
- **Investigación biomédica**: los investigadores pueden emplear el modelo como baseline para comparar nuevas arquitecturas o técnicas de preprocesado en el dataset WDBC.
- **Educación y formación**: sirve como ejemplo didáctico de implementación de un MLP con PyTorch y optimización de hiperparámetros con Optuna, útil en cursos de deep learning aplicado a salud.
- **Desarrollo de APIs de diagnóstico**: se puede envolver en un servicio REST (por ejemplo, con FastAPI) para ofrecer predicciones bajo demanda en aplicaciones de telesalud.
- **Validación de pipelines de MLOps**: al ser un modelo pequeño y reproducible, es adecuado para probar flujos de entrenamiento, versionado y despliegue en entornos de producción.
- **Análisis de características**: aunque no es interpretable por sí mismo, puede combinarse con técnicas como SHAP para identificar qué features contribuyen más a la clasificación, generando hipótesis para estudios clínicos.

## Benchmarks y rendimiento

El autor reporta en la model card una precisión (accuracy) del 100% en el conjunto de test (114 muestras) y una precisión media del estudio de aproximadamente 96,5%. No se proporcionan valores de precisión, recall o F1, aunque el encabezado de la model card los menciona como métricas. Estos resultados deben interpretarse con cautela debido al pequeño tamaño del conjunto de test y al riesgo de sobreajuste.

| Metrica | Valor |
|---|---|
| Accuracy (test) | 100% (1.00) |
| Accuracy media (estudio Optuna) | ~96,5% |

No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no es de lenguaje ni de código.

## Requisitos de hardware

- **VRAM**: no requiere GPU; puede ejecutarse en CPU con menos de 1 GB de RAM.
- **GPU recomendada**: ninguna, aunque si se desea acelerar la inferencia en lote, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- **Compatibilidad con hardware de consumo**: sí, funciona en cualquier portátil o Raspberry Pi (con PyTorch instalado).
- **Opciones de despliegue**: se puede servir con TorchServe, FastAPI, o exportar a ONNX para entornos de producción. No es compatible directamente con vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- **Latencia**: del orden de microsegundos por muestra en CPU moderna; throughput de miles de predicciones por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el repositorio ni en la búsqueda web. El modelo es un caso específico de clasificación tabular sin competidores directos en el mismo espacio de HuggingFace. Se podría comparar con otros clasificadores del dataset WDBC (por ejemplo, SVM o Random Forest), pero no hay datos disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Sobreajuste**: el accuracy del 100% en test con solo 114 muestras sugiere un posible sobreajuste o una división de datos favorable; no es un indicador fiable de rendimiento en poblaciones reales.
- **Alcance limitado**: el modelo solo acepta 30 características numéricas específicas del dataset WDBC; no puede procesar imágenes, texto ni otros formatos.
- **Sesgos del dataset**: WDBC proviene de un único centro médico (Wisconsin) y puede no representar la diversidad de otras poblaciones.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo.
- **Uso clínico**: no está validado para diagnóstico real; debe usarse únicamente con fines de investigación o educativos. La licencia MIT permite uso comercial, pero no exime de responsabilidad médica.
- **Idioma**: la documentación y los comentarios del código están en inglés; no hay soporte multilingüe.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/varunchoursiya/breastcancer)
- [Dataset Breast Cancer Wisconsin (Diagnostic) en Kaggle](https://www.kaggle.com/datasets/uciml/breast-cancer-wisconsin-data)
