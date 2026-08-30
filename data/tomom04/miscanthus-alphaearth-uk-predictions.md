# TomOM04/miscanthus-alphaearth-uk-predictions

## Resumen

Este repositorio contiene un conjunto de cuatro clasificadores binarios Random Forest diseñados para identificar cultivos de Miscanthus a partir de embeddings satelitales de Google AlphaEarth. El modelo fue desarrollado por TomOM04 y está pensado para el mapeo de cultivos a escala de campo en el Reino Unido, utilizando datos de los mapas de cultivos UKCEH/LCM 2024 y los límites de campos FIBOA UKFields. El problema que resuelve es la detección automática de Miscanthus, un cultivo energético relevante para la bioeconomía y la captura de carbono, a partir de imágenes de teledetección.

Cada clasificador es un `RandomForestClassifier` de 300 árboles que opera sobre 64 bandas de embeddings AlphaEarth. Se entrenaron cuatro modelos distintos, cada uno comparando Miscanthus contra una clase negativa diferente (hierba, cereales, cultivos de hoja ancha/raíz y otros cultivos). El repositorio incluye además dos mapas de predicción a nivel de campo para todo el Reino Unido, junto con los pesos entrenados, un manifiesto de modelos, archivos de resultados por umbral y un script de inferencia reproducible. La relevancia actual radica en la creciente demanda de herramientas de agricultura de precisión y monitoreo ambiental que aprovechen datos satelitales de alta resolución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (4 clasificadores binarios independientes) |
| Parametros totales | No disponible (modelo de árboles, no redes neuronales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular/espacial, sin contexto secuencial) |
| Tipos de cuantizacion | No aplica (modelo basado en árboles, no requiere cuantizacion) |
| Idiomas soportados | No aplica (datos georreferenciados, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Pickle (scikit-learn 1.7.2) |

## Arquitectura y entrenamiento

El modelo consiste en cuatro clasificadores Random Forest independientes, cada uno con 300 árboles de decisión. La entrada son vectores de 64 dimensiones correspondientes a las bandas de embeddings AlphaEarth generadas a partir de imágenes satelitales anuales de 2024. Cada clasificador se entrena de forma binaria: la clase positiva es Miscanthus, representada por coordenadas de marcadores editados, y la clase negativa se muestrea de uno de los cuatro grupos de cultivos definidos en el mapa UKCEH/LCM 2024 (hierba, cereales, cultivos de hoja ancha/raíz y otros cultivos). Los pesos de clase se configuran con `balanced_subsample` para manejar el desequilibrio entre clases.

Los datos de entrenamiento provienen de embeddings AlphaEarth de 64 bandas de cobertura del Reino Unido, combinados con los polígonos de campos y etiquetas de cultivos del mapa UKCEH/LCM 2024 en EPSG:27700. Para cada campo, se extrae el valor del embedding en el punto representativo del polígono. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de aprendizaje supervisado clásico. La innovación técnica principal reside en la combinación de embeddings satelitales preentrenados con un clasificador simple pero efectivo, y en la estrategia de múltiples clasificadores negativos para robustecer la detección. Para el mapa FIBOA UKFields, donde no hay etiquetas de cultivo, se aplican los cuatro clasificadores y se retiene la probabilidad máxima de Miscanthus, junto con las cuatro probabilidades individuales y el modelo ganador.

## Capacidades

- Clasificación binaria de campos agrícolas como Miscanthus o no Miscanthus, basada en embeddings satelitales.
- Generación de mapas de predicción a nivel de campo para todo el Reino Unido, con dos fuentes de límites de campo (UKCEH y FIBOA).
- Estimación de probabilidad de pertenencia a la clase Miscanthus en escala 0-100.
- Cálculo de incertidumbre mediante la variación entre las predicciones de los 300 árboles individuales, con intervalo empírico 2.5-97.5%.
- Producción de curvas de umbral: para cada umbral del 1% al 100%, se reporta el número de campos predichos y el área total.
- Manejo de datos geoespaciales en formatos estándar (GeoTIFF, GeoPackage, EPSG:27700).
- Registro explícito de campos sin cobertura AlphaEarth, evitando falsos negativos silenciosos.

## Casos de uso

- Inventario de cultivos energéticos a escala nacional: el modelo permite estimar la superficie dedicada a Miscanthus en el Reino Unido, información clave para políticas de bioenergía y captura de carbono. Se usaría aplicando los clasificadores a los límites de campo de UKCEH o FIBOA y agregando los resultados por región.
- Monitorización de cambios en el uso del suelo: al comparar predicciones de diferentes años (si se dispone de embeddings de otros periodos), se pueden detectar nuevas plantaciones de Miscanthus o abandonos de cultivo, apoyando estudios de dinámica agrícola.
- Verificación de cumplimiento de subsidios agrícolas: organismos reguladores pueden contrastar las declaraciones de los agricultores sobre cultivos de Miscanthus con las predicciones del modelo, reduciendo la necesidad de inspecciones de campo.
- Planificación de cadenas de suministro de biomasa: empresas del sector bioenergético pueden identificar zonas con alta concentración de Miscanthus para optimizar la logística de recolección y transporte.
- Investigación agronómica: los mapas generados sirven como insumo para estudios sobre rendimiento de Miscanthus, relación con variables climáticas o edáficas, y modelos de predicción de biomasa.
- Evaluación de impacto ambiental: las predicciones ayudan a cuantificar la extensión de Miscanthus y su posible efecto sobre la biodiversidad, los recursos hídricos o el secuestro de carbono en el suelo.

## Benchmarks y rendimiento

Los resultados de validación incluidos en la model card se resumen a continuación. Se trata de métricas de precisión para los clasificadores binarios individuales, no de una evaluación independiente de los mapas finales.

| Clasificador | Precision entrenamiento | Precision test retenido | Precision CV 5 pliegues |
|---|---:|---:|---:|
| Miscanthus vs Grass | 100.0% | 95.9% | 95.5% ± 4.3% |
| Miscanthus vs Cereal | 100.0% | 97.9% | 96.7% ± 3.6% |
| Miscanthus vs Broadleaf/root-row | 100.0% | 96.8% | 97.6% ± 1.7% |
| Miscanthus vs Other crops | 100.0% | 91.5% | 95.3% ± 3.8% |

La precisión de entrenamiento es optimista por diseño (los árboles pueden memorizar). Los valores de test retenido y CV son más representativos del rendimiento real. El mapa FIBOA, al usar el máximo de cuatro clasificadores, debe interpretarse como un mapa candidato que requiere validación externa.

## Requisitos de hardware

- Al ser un modelo basado en árboles, no requiere GPU. La inferencia se ejecuta en CPU sin problemas.
- El tamaño de los archivos pickle de los pesos no se especifica, pero el repositorio total pesa 3.5 GB, incluyendo mapas GeoPackage y datos de entrada. Los clasificadores individuales son ligeros (300 árboles con 64 características).
- Memoria RAM estimada: menos de 1 GB para cargar los cuatro modelos y ejecutar inferencia sobre un conjunto de campos típico (miles de polígonos).
- El script de inferencia `code/make_two_miscanthus_predictions.py` está diseñado para ejecutarse en una máquina estándar con scikit-learn 1.7.2.
- No se requieren opciones de despliegue especializadas como vLLM u Ollama; basta con un entorno Python con scikit-learn y las librerías geoespaciales adecuadas (p.ej. geopandas, rasterio).
- La latencia por campo es del orden de milisegundos, ya que la predicción con un Random Forest de 300 árboles sobre 64 características es muy rápida.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicos de detección de Miscanthus basados en AlphaEarth en el momento de redactar esta ficha. En el ámbito general de clasificación de cultivos con Random Forest sobre datos satelitales, existen trabajos similares pero no comparables directamente por falta de datos públicos de referencia. Se recomienda consultar la literatura de teledetección agrícola para encontrar alternativas, aunque ninguna con las mismas características de este repositorio.

## Limitaciones y advertencias

- Los modelos se entrenaron únicamente con datos del Reino Unido (EPSG:27700) y embeddings AlphaEarth de 2024; su aplicabilidad a otras regiones o años no está garantizada.
- El mapa FIBOA, al usar el máximo de cuatro clasificadores, puede sobreestimar la presencia de Miscanthus; se requiere validación externa antes de usarlo en decisiones críticas.
- Las coordenadas de los marcadores de Miscanthus fueron editadas, lo que introduce un posible sesgo en la selección de ejemplos positivos.
- La precisión de entrenamiento del 100% es un artefacto de la capacidad de los árboles para memorizar; no debe interpretarse como rendimiento real.
- La licencia del modelo no está especificada, lo que limita su uso comercial sin consultar al autor.
- Los archivos pickle se generaron con scikit-learn 1.7.2; versiones más nuevas pueden emitir `InconsistentVersionWarning`, aunque generalmente siguen siendo cargables.
- La ausencia de cobertura AlphaEarth en algunos campos se registra explícitamente, pero no se proporciona una estrategia de imputación; los mapas pueden tener huecos.
- No se han realizado evaluaciones de sesgos demográficos o geográficos más allá de la validación por precisión; el rendimiento puede variar entre tipos de suelo o condiciones climáticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TomOM04/miscanthus-alphaearth-uk-predictions
- Proyecto relacionado "Miscanthus AI - Plant selection and breeding for Net Zero" (Universidad de Aberystwyth): https://research.aber.ac.uk/en/projects/miscanthus-ai-plant-selection-and-breeding-for-net-zero-ibers-143/
- Presentación PDF sobre Miscanthus-AI (UKRI AI Net Zero Showcase): https://rai.ac.uk/wp-content/uploads/2024/06/UKRI-AI-Net-Zero-Showcase_Miscanthus-AI.pdf
