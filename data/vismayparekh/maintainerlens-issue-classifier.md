# vismayparekh/maintainerlens-issue-classifier

## Resumen

MaintainerLens issue classifier v2 es un clasificador de texto experimental desarrollado por vismayparekh que predice la categoria de una issue publica de GitHub (Bug, Question, Feature request u Other) a partir de su titulo y descripcion. No es un modelo de lenguaje neuronal: se trata de un pipeline clasico de scikit-learn basado en TF-IDF a nivel de palabra y regresion logistica, empaquetado en formato skops.

El modelo nace del proyecto MaintainerLens, una herramienta de triaje de issues para mantenedores de proyectos open source. Su relevancia es acotada y practica: ofrece una linea base reproducible y ligera para clasificar issues sin necesidad de GPU ni de infraestructura de inferencia neuronal, y publica una evaluacion externa congelada junto al modelo. El propio autor indica que MaintainerLens sigue usando sus reglas de texto para la clasificacion en produccion, y que este clasificador es una alternativa experimental.

Las cifras publicadas son modestas y el propio autor las enmarca como muestras pequenas: 610 ejemplos de entrenamiento y un holdout externo de 32 issues. El modelo esta entrenado unicamente en ingles y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF a nivel de palabra + regresion logistica (scikit-learn) |
| Parametros totales | no disponible (modelo lineal; el repositorio ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (cuerpo truncado a 3000 caracteres en el preprocesado) |
| Tipos de cuantizacion | no aplica (pesos lineales en formato skops) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | skops (issue-classifier.skops) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clasico: vectorizacion TF-IDF sobre el texto de titulo y cuerpo, seguida de regresion logistica multinomial con cuatro clases (Bug, Question, Feature request, Other). El preprocesado elimina bloques de codigo, comentarios HTML, URLs, correos y menciones mediante una expresion regular, y el titulo se repite tres veces antes del cuerpo para darle mayor peso; el cuerpo se trunca a 3000 caracteres.

El entrenamiento uso 594 ejemplos procedentes de VS Code, JupyterLab, Sphinx y HTTPX, con etiquetas mapeadas desde GitHub, mas 16 issues de Poetry revisadas por un asistente, hasta un total de 610 ejemplos. Los ejemplos curados tienen peso 6 y la clase Bug lleva un multiplicador de 1.35. El autor indica que los ficheros publicados contienen el vocabulario ajustado y los pesos, pero omiten los cuerpos de las issues de entrenamiento. No se documenta uso de RLHF, DPO ni tecnicas de aumento de datos mas alla del reponderado de clases.

## Capacidades

- Clasificacion de issues de GitHub en cuatro categorias: Bug, Question, Feature request y Other.
- Entrada basada en titulo y descripcion en texto plano, con eliminacion de codigo, URLs, correos y menciones.
- Prediccion de una unica etiqueta por issue (clasificacion multiclase, no multietiqueta).
- Ejecucion en CPU sin GPU, con dependencias minimas (scikit-learn 1.8.0 y skops 0.13.0).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Triaje inicial de issues en repositorios open source: el clasificador etiqueta automaticamente issues entrantes como Bug, Question, Feature request u Other para enrutarlas al maintainer o al canal adecuado, con revision humana posterior.
- Priorizacion de la cola de bugs: dado que la clase Bug lleva un multiplicador de peso de 1.35 en entrenamiento, puede usarse como primera senal para destacar issues candidatas a bug antes de la revision manual.
- Filtrado previo en herramientas de gestion: integrado en un bot de GitHub Actions que preetiqueta issues recien creadas en repositorios con convenciones de etiquetado similares a VS Code, JupyterLab, Sphinx o HTTPX.
- Linea base de evaluacion: sirve como referencia reproducible (TF-IDF + regresion logistica) contra la que comparar clasificadores neuronales o basados en LLM en tareas de triaje de issues.
- Prototipado rapido sin infraestructura: al ejecutarse en CPU y con un unico fichero skops, permite desplegar un clasificador de issues en entornos con recursos muy limitados o en pruebas de concepto.
- Analisis de documentacion y preguntas: la categoria Other absorbe issues de documentacion, lo que permite separar consultas y documentacion de bugs y peticiones de funcionalidad en repositorios con mucho trafico de preguntas (como Streamlit en el conjunto de evaluacion).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un holdout externo congelado de 32 issues (CPython, Flask y Streamlit; 8 por categoria):

| Metodo | Ejemplos de entrenamiento | Macro F1 | Precision (aciertos) | Recall de Bug |
|---|---:|---:|---:|---:|
| Reglas de texto | — | 77.9% | 25 / 32 | 7 / 8 |
| Classifier v1 | 594 | 68.4% | 22 / 32 | 4 / 8 |
| **Classifier v2** | **610** | **75.1%** | **24 / 32** | **6 / 8** |
| Classifier v3 | 638 | 68.0% | 22 / 32 | 5 / 8 |

En un holdout anterior de 24 issues limitado a bug/question, v2 obtuvo 56.8% de macro F1 frente al 68.6% de v1. El autor advierte que las muestras son muy pequenas, que Streamlit aporta todas las preguntas y CPython todas las peticiones de funcionalidad (por lo que las puntuaciones por categoria pueden reflejar convenciones del repositorio) y que las etiquetas de referencia aun requieren verificacion independiente. Los resultados no cubren deteccion de duplicados, severidad ni informes de seguridad.

## Requisitos de hardware

- Inferencia en CPU: el modelo es lineal y el repositorio ocupa 0.0 GB, por lo que no requiere GPU ni VRAM dedicada.
- GPU recomendadas: no aplica; no se beneficia de aceleracion por GPU.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y contenedores con memoria minima.
- Despliegue mediante Python con scikit-learn 1.8.0 y skops 0.13.0; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo neuronal.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (TF-IDF + regresion logistica) la inferencia es de orden de milisegundos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Macro F1 (holdout 32 issues) | Licencia |
|---|---|---|---:|---:|---|
| MaintainerLens classifier v2 | TF-IDF + regresion logistica | no disponible | no disponible | 75.1% | MIT |
| MaintainerLens reglas de texto | Reglas heuristicas | no aplica | no aplica | 77.9% | MIT (mismo proyecto) |
| MaintainerLens classifier v1 | TF-IDF + regresion logistica | no disponible | no disponible | 68.4% | MIT (mismo proyecto) |
| MaintainerLens classifier v3 | TF-IDF + regresion logistica | no disponible | no disponible | 68.0% | MIT (mismo proyecto) |

No se dispone de comparacion con clasificadores de issues de terceros ni con LLM en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor mantiene las reglas de texto en produccion y recomienda revision humana de las sugerencias.
- Entrenamiento con solo 610 ejemplos y evaluacion sobre 32 issues; las metricas tienen alta varianza y no son concluyentes.
- Sesgo de repositorio: las etiquetas de evaluacion provienen de convenciones de VS Code, JupyterLab, Sphinx, HTTPX, CPython, Flask y Streamlit; el rendimiento puede degradarse en repositorios con otras convenciones de etiquetado.
- Solo ingles: no soporta issues en otros idiomas.
- Clasificacion de etiqueta unica: no detecta duplicados, severidad ni informes de seguridad, y no modela issues que pertenecen a varias categorias.
- Riesgo de error en clases poco representadas y en textos con mucho codigo o plantillas, ya que el preprocesado elimina bloques de codigo, URLs y menciones.
- Los ficheros publicados omiten los cuerpos de las issues de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia MIT: permite uso comercial, pero no hay garantias de rendimiento ni soporte.
- Dependencia de versiones concretas (scikit-learn 1.8.0 y skops 0.13.0) para cargar los pesos correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vismayparekh/maintainerlens-issue-classifier
- Dataset de evaluacion: https://huggingface.co/datasets/vismayparekh/maintainerlens-benchmark
- Codigo fuente de MaintainerLens: https://github.com/vismayparekh/maintainerlens
