# studioboo/Group08_Day03_AI-Methods

## Resumen

`studioboo/Group08_Day03_AI-Methods` es un repositorio de Hugging Face publicado como artefacto academico del curso AI Methods I (Day 3, aprendizaje no supervisado) del programa IAAC MaAI 2026/27, elaborado por el Group 8 (Akshat Dayal, Bhavini Manot, Bo De Roeck). No se trata de un modelo de lenguaje ni de una red neuronal: el artefacto entrenado es un pipeline de scikit-learn serializado en `model.joblib` que agrupa paises-anio en regimenes de mercado inmobiliario mediante K-Means con k=4 sobre caracteristicas de dinamica de precios, rentas y asequibilidad.

El problema que aborda es la ausencia de un vocabulario compartido para describir fases de mercado entre paises. A partir de 1.210 filas (una por pais y anio, 1977-2024, 26 paises) derivadas del Dallas Fed International House Price Database, el modelo clasifica cada observacion en uno de cuatro regimenes nombrados: crecimiento estable asequible (30 %), correccion de precios (17 %), meseta cara (35 %) y boom de precios (18 %).

Su relevancia es metodologica y de analisis de politica publica: demuestra un flujo completo de aprendizaje no supervisado (PCA, t-SNE, comparacion de K-Means, Ward y DBSCAN, validacion de estabilidad con ARI 0,96) aplicado a un fenomeno economico real, con resultados que reproducen secuencias historicas conocidas como la burbuja espanola e irlandesa de 2005-2008.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: StandardScaler + K-Means (k=4) sobre 4 caracteristicas; PCA y t-SNE solo para visualizacion |
| Parametros totales | no disponible (no es una red neuronal; el modelo es un conjunto de centroides y un escalador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la model card esta en ingles; el modelo no procesa texto) |
| Licencia | no disponible en los metadatos de Hugging Face; la model card indica MIT para el codigo y CC BY-SA 4.0 para el dataset |
| Formato de pesos | `model.joblib` (serializacion joblib de Python) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un pipeline clasico de aprendizaje no supervisado. La entrada son cuatro caracteristicas calculadas por pais y anio: `log_afford_vs_own_avg` (posicion de la asequibilidad respecto a la media historica del propio pais), `afford_momentum_pct` (asequibilidad frente a su media movil de 3 anios), `real_hpi_change_pct` (variacion anual del indice real de precios) y `real_income_change_pct` (variacion anual de la renta real). Se usa solo dinamica y posicion relativa porque los indices brutos no son comparables entre paises. El preprocesamiento aplica el logaritmo del ratio y un `StandardScaler` dentro de un `Pipeline`.

Se compararon K-Means, clustering jerarquico (Ward) y DBSCAN, eligiendo k mediante codo, silhouette y dendrograma, y verificando estabilidad sobre arranques aleatorios y submuestras del 80 %. La eleccion final es K-Means con k=4 por su mejor silhouette, su estabilidad (ARI 0,96 entre arranques) y la interpretabilidad de los cuatro grupos. DBSCAN revela que no existen huecos de densidad (una sola nube mas un 5 % de atipicos), lo que confirma que los regimenes son una segmentacion util de un continuo y no grupos naturales. El entrenamiento se ejecuta en menos de un minuto en CPU.

## Capacidades

- Segmentacion no supervisada de observaciones pais-anio en cuatro regimenes de mercado inmobiliario.
- Asignacion de etiqueta de regimen a nuevas observaciones una vez calculadas las cuatro caracteristicas de entrada.
- Interpretacion de resultados mediante mapas PCA (3 dimensiones reales: boom/bust, crecimiento de rentas, posicion) y t-SNE en 2D.
- Deteccion de anos atipicos mediante DBSCAN (aproximadamente el 5 % de las observaciones).
- Analisis de estabilidad del clustering mediante ARI sobre arranques aleatorios y submuestras.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Monitorizacion macroprudencial multinacional: un banco central o ministerio asigna cada trimestre el regimen vigente de cada pais y detecta concentraciones de "boom de precios" (precios reales +10,1 %/anual frente a rentas +2,5 %) que justifiquen medidas macroprudenciales.
- Alertas tempranas de correccion: el regimen "correccion de precios" (precios reales -6,8 %/anual) permite anticipar episodios de ajuste; en el 85 % de los casos la asequibilidad seguia mejorando al anio siguiente, lo que sirve para calibrar el momento de retirar estimulos.
- Analisis de ciclos historicos comparados: reconstruir secuencias como boom (2005-06) -> meseta cara (2007-08) -> correccion (2009-12) en Espana e Irlanda, o el adelanto de un anio en EE. UU., para estudiar contagio y sincronia entre mercados.
- Investigacion academica sobre asequibilidad: usar los cuatro regimenes como variable categorica en estudios posteriores (por ejemplo, para modelar la probabilidad de crisis bancaria tras una meseta prolongada, como en Finlandia y Suecia en los noventa).
- Segmentacion de carteras hipotecarias: clasificar exposiciones por regimen de pais para estimar riesgo de impago en funcion de la fase del ciclo, con la ventaja de que el modelo no usa el nivel absoluto de asequibilidad sino su dinamica.
- Docencia y reproducibilidad metodologica: el notebook completo (secciones 0-8) sirve como plantilla de flujo no supervisado (PCA, t-SNE, comparacion de algoritmos, validacion de estabilidad) reproducible en menos de un minuto en CPU.
- Analisis de politica de vivienda por decada: la meseta cara domina los anios 2010-2020 (35 % de las observaciones), lo que permite argumentar sobre apoyos a compradores en mercados estancados pero caros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de clustering:

| Metrica | Valor |
|---|---|
| Silhouette (k=4) | aproximadamente 0,24 |
| Estabilidad K-Means (ARI entre arranques) | 0,96 |
| Tamano del cluster 0 (crecimiento estable asequible) | 364 filas (30 %) |
| Tamano del cluster 1 (correccion de precios) | 209 filas (17 %) |
| Tamano del cluster 2 (meseta cara) | 420 filas (35 %) |
| Tamano del cluster 3 (boom de precios) | 217 filas (18 %) |
| Atipicos detectados por DBSCAN | aproximadamente 5 % |

## Requisitos de hardware

- Inferencia en CPU: el pipeline (StandardScaler + K-Means con 4 centroides) se ejecuta en milisegundos; no requiere GPU.
- VRAM estimada: 0 GB; el modelo cabe holgadamente en memoria RAM convencional (el repositorio ocupa 0,0 GB).
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos sin aceleracion.
- Despliegue: carga directa con `joblib.load` en Python, servicio via FastAPI o Flask, o integracion en notebooks Jupyter; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; el entrenamiento completo del notebook se ejecuta en menos de un minuto, lo que situa la inferencia en el orden de microsegundos por observacion.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clustering de regimenes de mercado inmobiliario). El propio autor referencia otros artefactos del mismo curso: el modelo de forecasting `iaac-maai/day2-group8-affordability` y el dataset `iaac-maai/day3-group8-housing-market-regimes`, pero no se dispone de sus especificaciones para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Los regimenes son una segmentacion de un continuo, no grupos naturales: el silhouette es aproximadamente 0,24 para cualquier k y DBSCAN no encuentra huecos de densidad, por lo que las fronteras entre regimenes son convencionales.
- El modelo no ve el anio ni el pais como variables de entrada; la coherencia historica observada es una validacion externa, no una garantia de causalidad.
- Solo cubre 26 paises y el periodo 1977-2024; no es extrapolable a otros mercados sin recalcular las caracteristicas y reentrenar.
- Depende de la calidad y homogeneidad del dataset de origen (Kaggle, probablemente derivado del Dallas Fed International House Price Database); errores o revisiones en esa fuente alteran las etiquetas.
- Licencia del modelo no declarada en los metadatos de Hugging Face; la model card indica MIT para el codigo y CC BY-SA 4.0 para el dataset, lo que conviene verificar antes de un uso comercial.
- Es un artefacto academico (curso IAAC MaAI 2026/27) sin mantenimiento ni versionado posteriores a la creacion (13 de noviembre de 2026); no debe tratarse como un producto en produccion.
- La model card esta truncada en la seccion de limitaciones, por lo que pueden existir advertencias adicionales del autor no recogidas aqui.
- El uso del modelo para decisiones de politica o inversion requiere validacion con datos actualizados y supervision de un analista; las etiquetas de regimen no constituyen asesoramiento financiero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/studioboo/Group08_Day03_AI-Methods
- Modelo del autor (referenciado): https://huggingface.co/iaac-maai/day3-group8-market-regimes
- Dataset agrupado: https://huggingface.co/datasets/iaac-maai/day3-group8-housing-market-regimes
- Modelo del dia 2 (forecasting): https://huggingface.co/iaac-maai/day2-group8-affordability
- Repositorio del dia 1: https://github.com/iaac-maai/Group8-day1-assignment
- Dataset original en Kaggle: https://www.kaggle.com/code/tolstoyjustin/forecasting-housing-affordability-to-2035/input
- Dallas Fed International House Price Database: https://www.dallasfed.org/research/international/houseprice
