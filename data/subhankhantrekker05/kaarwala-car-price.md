# SubhanKhanTrekker05/kaarwala-car-price

## Resumen

KaarWala es un pipeline de regresión tabular basado en Random Forest, implementado con scikit-learn, que estima el precio de venta razonable (en rupias pakistaníes, PKR) de coches de segunda mano en Pakistán. Lo desarrolla el equipo Mind Masters como proyecto del curso CT-378 Machine Learning (otoño de 2026) y lo publica el usuario SubhanKhanTrekker05 en Hugging Face. No es un modelo de lenguaje: es un estimador supervisado clásico que opera sobre 15 variables estructuradas (marca, modelo, variante, combustible, transmisión, ciudad, provincia, año, kilometraje, cilindrada, indicadores de mercado, etc.).

El problema que aborda es la ausencia de referencias de precio fiables en el mercado de coches usados pakistaní, donde los anuncios reflejan precios de salida (asking price) y no precios de transacción. El modelo se entrenó con dos conjuntos de datos de Kaggle: el Pakistan Used Cars Dataset: Prices & Specs 2026 (10.589 anuncios, scrapeado el 28 de septiembre de 2026) y Pakistan Used Car Prices (59.554 filas, CC0) para construir variables de mercado.

Su relevancia es acotada y muy específica: sirve como utilidad de orientación de precios para compradores y vendedores, y como ejemplo didáctico de ingeniería de características y validación en regresión tabular. No cubre generación de texto, razonamiento ni ninguna capacidad de IA generativa, y su licencia es "other" sin términos comerciales explícitos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (pipeline de scikit-learn con preprocesado y regresión) |
| Parámetros totales | no disponible (modelo de árboles; no aplica el recuento de parámetros de una red neuronal) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 15 características) |
| Tipos de cuantización | no aplica; serialización con joblib |
| Idiomas soportados | no disponible (no procesa texto libre; las categorías están codificadas en los datos) |
| Licencia | other (sin términos detallados en la model card) |
| Formato de pesos | joblib (scikit-learn); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un pipeline de regresión supervisada sobre datos tabulares. La arquitectura concreta es un Random Forest, es decir, un ensamblado de árboles de decisión con agregación por media, envuelto en un pipeline de scikit-learn que incluye el preprocesado de las 15 características. Las variables categóricas son marca, modelo, variante, tipo de combustible, transmisión, ciudad y provincia; las numéricas son año, kilometraje en km, cilindrada, recuento de oferta de mercado, kilometraje medio de mercado, antigüedad del vehículo, km por año y desviación del kilometraje respecto a la media del mercado. Los coches eléctricos se codifican con engine_cc = 0.

El entrenamiento usa como variable objetivo price_in_pkr (precio de salida en PKR) y se evalúa sobre un conjunto de test reservado del 15 %. La model card no documenta el número de árboles, la profundidad máxima, los hiperparámetros de búsqueda, ni el proceso de validación cruzada. Las variables de mercado se emparejan por marca, modelo y año; cuando no hay coincidencia se usan medias a nivel de modelo o globales, lo que introduce un mecanismo de imputación jerárquica que conviene auditar. No hay RLHF, DPO ni ajuste por preferencias: es aprendizaje supervisado clásico.

## Capacidades

- Regresión tabular: estima un precio en PKR a partir de 15 características del vehículo y del mercado.
- Ingeniería de características de mercado: incorpora oferta, kilometraje medio y desviación respecto a la media.
- Manejo de categóricas de alta cardinalidad (marca, modelo, variante, ciudad, provincia) mediante el preprocesado del pipeline.
- Soporte de coches eléctricos mediante la codificación engine_cc = 0.
- Inferencia local rápida con scikit-learn y joblib, sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, imágenes ni audio.

## Casos de uso

- Orientación de precio para compradores: dado un anuncio con marca, modelo, año, kilometraje y ciudad, el modelo devuelve un precio de referencia en PKR que el comprador puede comparar con el precio solicitado para detectar sobreprecios.
- Asistencia a vendedores particulares: un vendedor introduce las especificaciones de su coche y obtiene un rango orientativo antes de fijar el precio de salida en portales de anuncios.
- Filtrado y priorización en marketplaces: un portal puede puntuar cada anuncio nuevo contra la estimación del modelo y marcar automáticamente los que se desvían de forma anómala, usando la MAE de 479.339 PKR como umbral de referencia.
- Analítica de mercado para concesionarios: agregando predicciones por marca, provincia y año se obtienen mapas de precios relativos que ayudan a decidir qué stock comprar en cada región.
- Enriquecimiento de datasets: el pipeline puede generar la variable price_in_pkr estimada para anuncios con precio ausente o sospechoso, siempre que las 15 características estén disponibles.
- Docencia y prototipado: sirve como ejemplo reproducible de pipeline de scikit-learn con mezcla de variables categóricas y numéricas, imputación jerárquica y evaluación con R² y MAE, útil en cursos de machine learning aplicado.
- Aplicaciones móviles de consulta: al ser un modelo joblib de 0,1 GB y sin requisitos de GPU, puede servirse desde una API ligera o incluso ejecutarse en el dispositivo para consultas puntuales.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| R² | 0,9155 | Test reservado (15 %) |
| MAE | 479.339 PKR (aprox. 4,79 lakh) | Test reservado (15 %) |

No se han publicado resultados comparativos con otros modelos en la información disponible. La propia model card advierte que estas cifras deben verificarse contra el modelo final antes de publicarlas. El error es sustancialmente mayor para coches por encima de 1 crore de PKR, donde los datos son escasos.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia corre en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier consumer GPU y en CPU de gama baja; el repositorio completo ocupa 0,1 GB.
- Despliegue: carga directa con scikit-learn y joblib en Python; puede servirse con FastAPI, Flask o BentoML. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; para un Random Forest sobre 15 características se espera una latencia de milisegundos por petición en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaarWala (este modelo) | Random Forest (scikit-learn) | 15 características tabulares | R² 0,9155; MAE 479.339 PKR | other | Hugging Face, joblib |
| Regresión lineal o Ridge sobre las mismas variables | Modelo lineal | 15 características tabulares | no disponible | no aplica | implementación propia |
| Gradient Boosting (XGBoost, LightGBM) sobre las mismas variables | Ensamblado de árboles con boosting | 15 características tabulares | no disponible | según librería | implementación propia |

No se dispone de resultados publicados de alternativas sobre este mismo conjunto de datos, por lo que la comparación cuantitativa no está disponible. La comparación relevante es metodológica: un Random Forest suele superar a la regresión lineal en relaciones no lineales entre antigüedad, kilometraje y precio, y suele quedar por debajo de Gradient Boosting en precisión a costa de mayor coste de ajuste.

## Limitaciones y advertencias

- El objetivo son precios de salida (asking price), no precios de transacción reales; la estimación puede estar sesgada al alza respecto al precio de cierre.
- El error es mucho mayor para coches por encima de 1 crore de PKR, donde los datos son escasos; no debe usarse como referencia fiable en ese segmento.
- Las variables de mercado se emparejan por marca, modelo y año; los coches sin coincidencia usan medias de nivel de modelo o globales, lo que puede distorsionar la predicción en modelos poco frecuentes.
- Las especificaciones de algunos coches están ausentes o son aproximadas, lo que introduce ruido en la entrada.
- La model card no documenta sesgos demográficos ni geográficos, pero la cobertura por ciudad y provincia depende de la distribución del scraping y puede infrarepresentar regiones con pocos anuncios.
- Licencia "other" sin términos explícitos: no hay autorización clara para uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- No es una tasación, peritaje ni asesoramiento financiero; la propia model card lo indica.
- No hay métricas de calibración ni intervalos de confianza publicados, solo R² y MAE puntuales.
- Proyecto de curso con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni historial de versiones documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SubhanKhanTrekker05/kaarwala-car-price
- Dataset primario (Kaggle, Danish Javaid Meo): Pakistan Used Cars Dataset: Prices & Specs 2026, https://www.kaggle.com/datasets (búsqueda por el título exacto)
- Dataset de mercado (Kaggle, Muhammad Humayun Babar): Pakistan Used Car Prices, https://www.kaggle.com/datasets (búsqueda por el título exacto)
- Documentación de scikit-learn: https://scikit-learn.org
- Documentación de joblib: https://joblib.readthedocs.io
