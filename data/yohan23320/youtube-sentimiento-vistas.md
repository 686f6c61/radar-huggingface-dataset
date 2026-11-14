# yohan23320/youtube-sentimiento-vistas

## Resumen

El repositorio `yohan23320/youtube-sentimiento-vistas` agrupa dos artefactos desarrollados como proyecto final de la asignatura de Procesamiento de Lenguaje Natural en la Universidad de Cundinamarca. El primero es un ajuste fino del modelo `cardiffnlp/twitter-roberta-base-sentiment-latest` (RoBERTa base, 125 millones de parametros) para clasificacion de sentimiento en comentarios de YouTube, entrenado sobre 18.139 comentarios del conjunto *YouTube Statistics* de Kaggle. El segundo es un modelo de stacking en formato joblib que estima el logaritmo decimal del numero de vistas de un video a partir de 32 variables tabulares, con intervalos de prediccion conformal al 90 %.

El interes practico del repositorio reside en su doble naturaleza: combina un clasificador de texto basado en transformers con un ensamblado tabular clasico (XGBoost, HistGradientBoosting, Random Forest y Ridge con meta-modelo RidgeCV), todo empaquetado junto a una demo en Hugging Face Spaces. No se trata de un modelo fundacional ni de un lanzamiento de gran escala, sino de un artefacto academico reproducible con metricas declaradas y licencia MIT, lo que facilita su inspeccion y reutilizacion.

El ajuste fino reporta un F1-macro fuera de fold de 0,901 y una exactitud de 0,927 en la tarea de sentimiento. El componente tabular reporta un R² de 0,791 y una cobertura empirica del 0,901 para el intervalo conformal del 90 %. El repositorio ocupa 0,5 GB y esta etiquetado para inferencia de clasificacion de texto en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (encoder transformer) para sentimiento; stacking de XGBoost + HistGradientBoosting + Random Forest + Ridge con meta-modelo RidgeCV para regresion tabular |
| Parametros totales | 125 millones (RoBERTa base); no disponible el numero de parametros del ensamblado tabular |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de `cardiffnlp/twitter-roberta-base-sentiment-latest`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y joblib; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (clasificador) y joblib (ensamblado tabular) |

## Arquitectura y entrenamiento

El clasificador de sentimiento parte de `cardiffnlp/twitter-roberta-base-sentiment-latest`, un RoBERTa base preentrenado sobre corpus de Twitter, y se ajusta con 18.139 comentarios del conjunto *YouTube Statistics* de Kaggle. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de balanceo de clases ni si se aplicaron tecnicas de aumento de datos. Tampoco se especifica la estrategia de validacion mas alla de la mencion a metricas "fuera de fold", lo que sugiere una validacion cruzada o un esquema de particion reservada.

El segundo componente es un ensamblado de stacking supervisado: cuatro modelos base (XGBoost, HistGradientBoosting, Random Forest y Ridge) alimentan un meta-modelo RidgeCV que predice `log10(vistas)` a partir de 32 variables por video. Sobre la prediccion puntual se construye un intervalo de prediccion conformal con cobertura nominal del 90 %, cuya cobertura empirica reportada es 0,901. No se detalla el metodo conformal exacto (split conformal, CV+, jackknife+) ni el tamano del conjunto de calibracion.

## Capacidades

- Clasificacion de sentimiento de texto en ingles (positivo, negativo, neutro) sobre comentarios de YouTube.
- Estimacion del logaritmo de vistas de un video a partir de 32 caracteristicas tabulares.
- Generacion de intervalos de prediccion con garantia conformal al 90 % para la estimacion de vistas.
- Inferencia compatible con el pipeline `text-classification` de transformers y con endpoints de Hugging Face.
- Integracion en una interfaz web y API desplegada en Hugging Face Spaces.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles; no se documenta soporte para castellano.

## Casos de uso

- Moderacion y analisis de opinion en canales de YouTube: el clasificador permite etiquetar automaticamente comentarios como positivos, negativos o neutros para priorizar la revision manual y detectar toxicidad emergente en la comunidad.
- Analisis de reputacion de marca en campanas de video: agregando las predicciones de sentimiento sobre los comentarios de un conjunto de videos se obtiene una metrica de percepcion publica comparable entre campanas.
- Priorizacion de creacion de contenido: el modelo tabular estima vistas esperadas para un video planificado a partir de sus 32 variables y devuelve un intervalo conformal del 90 %, lo que permite decidir que temas o formatos tienen mayor potencial.
- Planificacion de medios y presupuestos publicitarios: la estimacion de vistas con intervalo de confianza sirve para dimensionar inversiones en campanas de YouTube antes de publicar.
- Investigacion academica en NLP y estadistica aplicada: el repositorio es reproducible (licencia MIT, codigo en GitHub) y sirve como linea base para experimentos de clasificacion de sentimiento y de regresion conformal.
- Enriquecimiento de paneles analiticos: las predicciones de sentimiento y de vistas pueden incorporarse como columnas derivadas en un data warehouse para dashboards de marketing.
- Prototipado rapido via API: la demo en Spaces permite validar el comportamiento del modelo sobre textos nuevos sin infraestructura propia.

## Benchmarks y rendimiento

| Tarea | Metrica | Valor reportado |
|---|---|---|
| Clasificacion de sentimiento (comentarios de YouTube) | F1-macro fuera de fold | 0,901 |
| Clasificacion de sentimiento (comentarios de YouTube) | Exactitud | 0,927 |
| Regresion de vistas (log10) | R² | 0,791 |
| Intervalo conformal al 90 % | Cobertura empirica | 0,901 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para el clasificador RoBERTa base en fp32: aproximadamente 0,5 GB de pesos, con un pico de 1-2 GB durante la inferencia por lotes pequenos.
- VRAM en fp16: alrededor de 0,25 GB de pesos, ejecutable en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4); para lotes grandes, A10G, L4 o A100.
- El ensamblado tabular (joblib) se ejecuta en CPU y no requiere GPU; su huella en memoria es marginal frente al clasificador.
- Cabe en GPU consumer y en CPU: la inferencia del clasificador es viable en CPU con latencias de decenas de milisegundos por comentario.
- Opciones de despliegue: pipeline `text-classification` de transformers, endpoints de Hugging Face Inference, FastAPI o Flask para el ensamblado joblib, y la demo ya publicada en Hugging Face Spaces.
- No se dispone de mediciones de throughput ni de latencia publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yohan23320/youtube-sentimiento-vistas` | 125 M (clasificador) + ensamblado tabular | 512 tokens | Sentimiento + regresion de vistas | MIT | Hugging Face + Spaces |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | 125 M | 512 tokens | Sentimiento en ingles | MIT | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | Sentimiento binario en ingles | Apache 2.0 | Hugging Face |
| `ProsusAI/finbert` | 110 M | 512 tokens | Sentimiento financiero en ingles | Apache 2.0 | Hugging Face |

La comparativa se limita al componente de clasificacion de texto, ya que no se identifican en la informacion disponible modelos publicos equivalentes que combinen clasificacion de sentimiento y regresion tabular de vistas de YouTube con intervalos conformales. El modelo base de Cardiff NLP es el referente directo; los otros dos son alternativas genericas de analisis de sentimiento en ingles con distinto dominio y tamano.

## Limitaciones y advertencias

- El clasificador esta entrenado exclusivamente sobre comentarios de YouTube en ingles; su rendimiento fuera de ese dominio o en castellano no esta caracterizado.
- El modelo base de Cardiff NLP se entreno sobre corpus de Twitter, lo que puede introducir sesgos de dominio (jerga, abreviaturas, ironia) que no se corrigen con el ajuste fino.
- No se documenta el balance de clases del conjunto de entrenamiento ni la distribucion de etiquetas, por lo que el F1-macro de 0,901 puede ocultar un rendimiento desigual entre clases.
- El ensamblado tabular depende de 32 variables concretas; su uso fuera del esquema de caracteristicas original requiere reentrenamiento y recalibracion del intervalo conformal.
- La cobertura conformal del 90 % es valida bajo el supuesto de intercambiabilidad entre calibracion y produccion; cambios en la distribucion de videos pueden degradar la cobertura empirica.
- Riesgo de alucinacion no aplica al clasificador (es una tarea discriminativa), pero si a la interpretacion de las predicciones: el modelo no explica por que un comentario es positivo o negativo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento normativo en dominios regulados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yohan23320/youtube-sentimiento-vistas
- Demo e interfaz (Spaces): https://huggingface.co/spaces/yohan23320/estadisticas-youtube
- Codigo fuente en GitHub: https://github.com/Nicolas2322/proyecto-estadisticas-youtube
- Modelo base: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
