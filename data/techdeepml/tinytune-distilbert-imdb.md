# techdeepml/tinytune-distilbert-imdb

## Resumen

TinyTune distilbert-imdb es un adaptador LoRA para clasificación de sentimiento en texto, construido sobre el modelo base `distilbert/distilbert-base-uncased` y entrenado con el framework TinyTune sobre el conjunto de datos `stanfordnlp/imdb`. Lo desarrolla el usuario `techdeepml` y se publica bajo licencia MIT en Hugging Face. El repositorio contiene únicamente los pesos del adaptador (no el modelo base completo), por lo que su tamaño es practicamente nulo y requiere descargar DistilBERT por separado para su uso.

El modelo resuelve una tarea concreta: clasificar reseñas de cine del corpus IMDB como positivas o negativas. Su interes no reside en la novedad arquitectonica —reutiliza un transformer encoder de 6 capas y 66 millones de parametros— sino en demostrar que un ajuste fino con LoRA de solo 739.586 parametros entrenables (el 1,093% del total) sobre 4.000 ejemplos y una unica GPU gratuita eleva la precision del 40,80% del modelo base al 86,90% en el conjunto de evaluacion. Es, por tanto, una pieza util para quienes quieren un clasificador de sentimiento ligero, reproducible y de bajo coste, no un modelo generativo de proposito general.

La relevancia actual es metodologica y practica: sirve como referencia de ajuste parametro-eficiente (PEFT) aplicado a una tarea de clasificacion clasica, con hiperparametros documentados y resultados medibles. No obstante, conviene subrayar que la evaluacion se realizo sobre 1.000 ejemplos retenidos y que no se han publicado comparaciones con otros clasificadores de sentimiento ni analisis de robustez fuera del dominio IMDB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con adaptador LoRA sobre las proyecciones `q_lin` y `v_lin` |
| Parametros totales | 67.694.596 (modelo base); adaptador LoRA: 739.586 parametros entrenables (1,093%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento; el modelo base soporta hasta 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es mayoritariamente ingles; el dataset IMDB es en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `distilbert-base-uncased` en safetensors |
| Libreria | peft (compatible con transformers) |
| Dataset de entrenamiento | stanfordnlp/imdb |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo base es DistilBERT, una version destilada de BERT con 6 capas, 12 cabezas de atencion, dimension oculta de 768 y 66 millones de parametros, que conserva aproximadamente el 97% del rendimiento de BERT en tareas de comprension del lenguaje con un 40% menos de parametros. Sobre el se aplica un adaptador LoRA de rango 8, alpha 16 y dropout 0,1, dirigido exclusivamente a las matrices de proyeccion de query (`q_lin`) y value (`v_lin`) de cada capa de atencion. Esto reduce el numero de parametros entrenables a 739.586 frente a los 67.694.596 totales.

El entrenamiento se realizo con TinyTune sobre 4.000 ejemplos del corpus IMDB, durante 2 epocas, con tamano de lote 16, tasa de aprendizaje 0,0002 y longitud maxima de secuencia de 256 tokens. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, lo cual es coherente con una tarea de clasificacion supervisada. Tampoco se detalla la composicion exacta del subconjunto de entrenamiento ni la semilla utilizada, lo que limita la reproducibilidad estricta. La innovacion tecnica destacable es la propia metodologia TinyTune: ajuste fino de bajo coste en una unica GPU gratuita, con un adaptador de menos del 1,1% de parametros entrenables.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre resenas de cine en ingles, con salida de etiqueta y puntuacion.
- Ajuste fino parametro-eficiente: el adaptador puede combinarse con el modelo base mediante PEFT sin reentrenar los pesos originales.
- Inferencia ligera: el conjunto base + adaptador ocupa aproximadamente 255 MB en precision FP32, lo que permite ejecucion en CPU y GPU de gama baja.
- Integracion con el ecosistema Hugging Face `transformers` y `peft` mediante `AutoPeftModelForSequenceClassification`.
- Capacidad multilingue: no disponible; el modelo base esta entrenado principalmente en ingles y el dataset IMDB es monolingue.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Analisis de sentimiento de resenas de productos o peliculas: el modelo clasifica textos de hasta 256 tokens en positivo o negativo con una precision reportada del 86,90%, suficiente para monitorizar opiniones a escala en catalogos de contenido.
- Moderacion de comentarios en plataformas de critica cinematografica: permite filtrar automaticamente resenas toxicas o negativas para revision humana, usando el adaptador sobre el modelo base en un servicio de bajo coste.
- Enriquecimiento de datasets de opinion: clasificar grandes volumenes de resenas IMDB no etiquetadas para construir conjuntos de entrenamiento adicionales o para analisis de tendencias temporales.
- Prototipado rapido en entornos con recursos limitados: al requerir solo una GPU gratuita para el ajuste y unos 255 MB en inferencia, sirve como base para experimentos academicos de PEFT y comparativas de hiperparametros.
- Clasificacion en el borde (edge computing) o en CPU: el tamano reducido del modelo base y del adaptador permite desplegarlo en contenedores ligeros o en dispositivos sin GPU dedicada, con latencias de decenas de milisegundos por muestra.
- Pipeline de control de calidad en generacion de resenas sinteticas: usar el clasificador como filtro para validar que textos generados por un LLM mantienen la polaridad deseada antes de publicarlos.
- Investigacion sobre eficiencia de adaptadores: el repositorio documenta hiperparametros y resultados, lo que permite reproducir y comparar variantes de LoRA (rango, alpha, capas objetivo) en una tarea estandar.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los siguientes, evaluados sobre 1.000 ejemplos retenidos:

| Modelo | Accuracy | F1 (macro) |
|---|---|---|
| Base model (sin ajuste fino) | 0,4080 | 0,4057 |
| TinyTune LoRA | 0,8690 | 0,8690 |

No se han publicado resultados comparativos con otros clasificadores de sentimiento (BERT-base, RoBERTa, DeBERTa, etc.) ni metricas adicionales como precision, recall o AUC en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 255 MB en FP32 para el conjunto base + adaptador (67,7 M de parametros); en FP16 alrededor de 128 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes se recomienda cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4, etc.).
- Cabe en consumer GPU: si, en practicamente todas las GPU modernas, incluidas integradas.
- Opciones de despliegue: `transformers` + `peft` (referencia), ONNX Runtime tras exportacion, TorchServe, FastAPI con Uvicorn, o servicios gestionados de Hugging Face Inference Endpoints. vLLM y llama.cpp no aplican a este tipo de modelo encoder de clasificacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en IMDB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyTune distilbert-imdb (este modelo) | 67,7 M (base) + 0,74 M (adaptador) | 256 tokens (entrenamiento) | 0,8690 (1.000 ejemplos) | MIT | Hugging Face |
| DistilBERT base sin ajuste | 66,9 M | 512 tokens | 0,4080 (mismo conjunto) | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | No disponible en la informacion | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | No disponible en la informacion | MIT | Hugging Face |

No se dispone de resultados de benchmarks comparativos con otros clasificadores de sentimiento en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El adaptador solo se ha evaluado sobre 1.000 ejemplos retenidos del corpus IMDB; no hay evidencia de su comportamiento en otros dominios (resenas de productos, redes sociales, texto formal).
- Riesgo de sobreajuste al dominio: el entrenamiento uso solo 4.000 ejemplos y 2 epocas, por lo que la generalizacion fuera de IMDB es incierta.
- Sesgos conocidos: no documentados por el autor; el corpus IMDB puede contener sesgos de genero, edad o cultura que el modelo hereda sin analisis.
- Riesgo de alucinacion: no aplica en sentido estricto (no genera texto), pero puede producir clasificaciones erroneas con alta confianza en entradas ambiguas o fuera de distribucion.
- Limitacion de contexto: la longitud maxima usada en entrenamiento es de 256 tokens; resenas mas largas se truncan, lo que puede perder informacion relevante.
- Limitacion de idioma: el modelo base es mayoritariamente ingles y el dataset es monolingue; el rendimiento en castellano u otros idiomas no esta validado.
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero el modelo base DistilBERT esta bajo Apache 2.0, cuyas condiciones tambien deben respetarse.
- Caveat para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado una validacion independiente; conviene evaluar el modelo en el dominio objetivo antes de desplegarlo.
- No se documentan semillas, divisiones exactas de entrenamiento/evaluacion ni el procedimiento de seleccion de hiperparametros, lo que dificulta la reproduccion exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/techdeepml/tinytune-distilbert-imdb
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
- Repositorio TinyTune: https://github.com/techdeeplimbachiya/tinytune
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
