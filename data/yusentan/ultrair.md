# yusentan/UltraIR

## Resumen

UltraIR es un modelo fundacional especializado en espectroscopia infrarroja (IR/FTIR), desarrollado por el grupo AIMS Lab de la HKUST (Guangzhou) y publicado por Yusen Tan y colaboradores. A diferencia de los modelos de lenguaje, su dominio es la química analítica: aprende representaciones transferibles de espectros infrarrojos para tareas que van desde la elucidación estructural de moléculas pequeñas hasta el análisis de mezclas complejas y la clasificación de muestras biológicas. El modelo se distribuye con más de 100 millones de parámetros y un preentrenamiento sobre aproximadamente 60 millones de espectros IR simulados, seguido de una adaptación específica a datos experimentales.

La relevancia del modelo reside en su enfoque de transferencia simulación-a-realidad (simulation-to-real): en lugar de depender exclusivamente de espectros experimentales etiquetados, que son escasos y costosos de obtener, UltraIR se preentrena con datos simulados generados mediante dinámica molecular y predicciones de Chemprop-IR, y posteriormente se ajusta con datos reales de NIST, SDBS, USPTO, FTIR de mezclas, espectros bacterianos, hierbas medicinales, microplásticos y el Open Soil Spectral Library. Este planteamiento aborda el problema clásico de la escasez de datos etiquetados en química analítica.

El repositorio de Hugging Face aloja checkpoints de PyTorch (`.pt`) del codificador preentrenado y de las versiones adaptadas a tareas, con un tamaño total de 144,3 GB. La licencia es MIT y el paquete Python oficial `ultrair` es el mecanismo previsto para cargar los pesos junto con la configuración de tarea correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: fusión de entrada con canales de derivadas primera y segunda, extracción convolucional jerárquica y Transformer basado en parches |
| Parametros totales | Más de 100 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.792 puntos espectrales (configuración general de preentrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de dominio científico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch `.pt` (codificador preentrenado y adaptaciones por tarea) |

Parámetros arquitectónicos adicionales de la configuración general de preentrenamiento: anchura de embedding de 1.024, longitud de parche de 16, 16 cabezas de atención y 8 capas Transformer globales.

## Arquitectura y entrenamiento

UltraIR emplea un flujo de dos etapas. En la primera, se preentrena un codificador espectral compartido sobre espectros simulados; en la segunda, se optimizan conjuntamente el codificador y una cabeza específica de tarea sobre datos etiquetados de dominio descendente. El codificador combina el espectro original con canales aprendidos de derivada primera y segunda, aplica una fusión de entrada con compuertas (gated input fusion), extrae características convolucionales jerárquicas con fusión posterior y las procesa mediante un Transformer basado en parches. Existen adaptadores dedicados para la generación de estructura molecular condicionada por fórmula y para el análisis de mezclas por pares guiado por referencia.

El preentrenamiento público combina tres objetivos: reconstrucción espectral basada en wavelets, aprendizaje de representaciones supervisado por huellas dactilares (fingerprints) mediante similitudes de Tanimoto entre Morgan fingerprints de radio 2 y 2.048 bits, y predicción de 17 etiquetas de grupos funcionales. La configuración YAML publicada especifica cinco épocas, tasa de aprendizaje `1e-4`, decaimiento de peso `0.01` y aumentación de datos mediante ruido, desplazamiento y enmascaramiento. El autor advierte que esta configuración es reproducible pero no documenta por sí sola todos los detalles de la ejecución original a gran escala.

Los datos de preentrenamiento incluyen espectros de dinámica molecular de UltraIR, IRtoMol, el conjunto multimodal de espectroscopia y QM9S, junto con herramientas para generar espectros de dinámica molecular y combinar predicciones de Chemprop-IR. Los datos preparados se estructuran en arrays alineados por filas: `ir_norm.npy` de forma `[N, L]`, `fingerprint.npy` de forma `[N, 2048]` y `functional_groups.npy` de forma `[N, 17]`. La demo de preentrenamiento del repositorio de GitHub contiene 256 ejemplos y sirve para ejercitar el pipeline.

## Capacidades

- Predicción de grupos funcionales: dado un espectro IR, predice 17 grupos funcionales en régimen multi-etiqueta (métricas Micro-F1, Macro-F1 y ratio de coincidencia exacta).
- Elucidación de estructura molecular: dado un espectro IR y una fórmula molecular, genera candidatos SMILES ordenados (precisión Top-1/5/10, validez, similitud de Tanimoto y coincidencia de esqueleto).
- Predicción de propiedades fisicoquímicas: estima 11 propiedades moleculares a partir del espectro (MAE y RMSE normalizados, R²).
- Detección de componentes dirigida en mezclas: a partir de un espectro de referencia y uno de mezcla, estima la probabilidad de presencia de un componente (exactitud, Macro-F1, ROC-AUC, average precision).
- Estimación de contribución fraccional: calcula la fracción del componente en la mezcla (MAE, RMSE, R²).
- Cuantificación de componentes a nivel de mezcla: estima cuatro cantidades de componentes a partir del espectro de mezcla, con variantes experimental y sintética.
- Clasificación bacteriana: clasifica espectros FTIR en una de nueve géneras (exactitud, Macro-F1, MCC).
- Trazabilidad de origen geográfico de hierbas medicinales mediante FTIR.
- Adaptadores específicos para generación de estructura molecular condicionada por fórmula y análisis de mezclas por pares guiado por referencia.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües en el sentido de los modelos de lenguaje.

## Casos de uso

- Identificación de grupos funcionales en laboratorios de síntesis: el modelo recibe el espectro FTIR de un compuesto recién sintetizado y devuelve las 17 etiquetas de grupos funcionales con sus probabilidades, lo que permite una verificación rápida antes de recurrir a técnicas más costosas como RMN.
- Elucidación estructural asistida por fórmula: cuando el químico conoce la fórmula molecular pero no la estructura, el adaptador correspondiente genera una lista ordenada de candidatos SMILES que se pueden contrastar con bases de datos o con predicciones computacionales.
- Control de calidad en producción química: la estimación de contribución fraccional de componentes permite monitorizar la composición de una mezcla en línea a partir de espectros FTIR, sustituyendo métodos cromatográficos más lentos en determinadas etapas.
- Análisis de mezclas de cuatro componentes: la tarea de cuantificación a nivel de mezcla, con variantes experimental y sintética, se orienta a la determinación simultánea de las cantidades de cuatro componentes en una muestra problema.
- Microbiología clínica y alimentaria: la clasificación bacteriana en nueve géneras a partir de espectros FTIR permite un cribado rápido de cultivos, útil en entornos donde el tiempo de respuesta es crítico.
- Autenticidad y trazabilidad de productos botánicos: la tarea de origen geográfico de hierbas medicinales (datos de Jinyinhua y Shanyinhua) sirve para detectar falsificaciones o verificar la procedencia declarada de materias primas.
- Monitorización medioambiental: los espectros de microplásticos y del Open Soil Spectral Library permiten aplicar el modelo a la caracterización de suelos y a la detección de contaminantes poliméricos.
- Investigación en química computacional: el codificador preentrenado se puede reutilizar como extractor de características congelado para nuevas tareas descendentes con pocos datos etiquetados, aprovechando el preentrenamiento sobre 60 millones de espectros simulados.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card enumera las métricas que se reportan para cada tarea (Micro-F1, Macro-F1, exactitud Top-1/5/10, MAE y RMSE normalizados, R², ROC-AUC, MCC), pero no incluye sus valores. Se remite al artículo para los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo supera los 100 millones de parámetros, lo que en precisión FP32 supondría del orden de 0,4 GB solo en pesos, pero el repositorio ocupa 144,3 GB e incluye múltiples checkpoints y ficheros de datos, por lo que el requisito real depende del checkpoint concreto que se cargue.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible. Por el tamaño declarado de parámetros (más de 100 millones) sería previsible que quepa en GPUs de consumo actuales, pero no hay confirmación en la documentación.
- Opciones de despliegue: el mecanismo previsto es el paquete Python oficial `ultrair` con la configuración de tarea correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de espectroscopia infrarroja con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para espectroscopia infrarroja; no es un modelo de lenguaje y no debe emplearse para tareas de generación de texto, código o razonamiento general.
- Los pesos se distribuyen como checkpoints `.pt` que requieren el paquete `ultrair` y la configuración de tarea adecuada; no hay formato GGUF ni integración con runners estándar de inferencia.
- La configuración de preentrenamiento publicada (cinco épocas, demo de 256 ejemplos) es una referencia reproducible y no documenta todos los detalles de la ejecución original a gran escala; los resultados pueden no ser idénticos a los del artículo.
- Los datos de preentrenamiento son mayoritariamente simulados; aunque el ajuste posterior usa datos experimentales, puede existir una brecha de dominio en muestras reales alejadas de las condiciones de entrenamiento.
- Los conjuntos de datos externos utilizados (NIST, SDBS, USPTO, Zenodo, figshare, Open Soil Spectral Library) conservan sus propios términos de uso, que pueden ser más restrictivos que la licencia MIT del modelo.
- El rendimiento en tareas descendentes depende de la disponibilidad de datos etiquetados para el ajuste fino; no se documenta el comportamiento en modo zero-shot.
- No se documentan sesgos ni riesgos de alucinación en el sentido habitual de los modelos generativos de texto; el riesgo principal es la predicción incorrecta de estructuras o concentraciones, que debe validarse experimentalmente antes de cualquier uso en producción.
- El repositorio es de gran tamaño (144,3 GB), lo que condiciona el almacenamiento y la descarga.
- No se especifican los idiomas ni la cobertura geográfica de los datos más allá de las tareas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusentan/UltraIR
- Código oficial: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR
- Artículo: https://arxiv.org/abs/2608.13341
- Guía de datos y preprocesamiento: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR/blob/main/data/README.md
- Guía de datos de preentrenamiento: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR/blob/main/data/pretraining/README.md
- Configuración de preentrenamiento: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR/blob/main/configs/pretraining/default.yaml
- Implementación del preentrenamiento: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR/tree/main/src/ultrair/pretraining
- Licencia del código: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR/blob/main/LICENSE
- Figura de arquitectura: https://github.com/AIMS-Lab-HKUSTGZ/UltraIR/blob/main/assets/figures/ultrair_overview.pdf
- Dataset IRtoMol: https://zenodo.org/records/7928396
- Dataset multimodal de espectroscopia: https://zenodo.org/records/14770232
- Dataset QM9S: https://figshare.com/articles/dataset/QM9S_dataset/24235333
