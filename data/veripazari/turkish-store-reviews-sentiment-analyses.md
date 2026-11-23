# veripazari/turkish-store-reviews-sentiment-analyses

## Resumen

`veripazari/turkish-store-reviews-sentiment-analyses` es un repositorio de Hugging Face que archiva un proyecto academico de clasificacion de sentimiento sobre resenas de productos en turco. El modelo original fue desarrollado por el usuario `knetic0` y redistribuido por la plataforma turca VeriPazari con fines de preservacion. No se trata de un modelo de lenguaje generativo ni de un transformer preentrenado: es un conjunto de clasificadores recurrentes (LSTM, Bidirectional LSTM, GRU y una variante "Balanced GRU") implementados en PyTorch y entrenados desde cero para una tarea de clasificacion ternaria (positivo, neutro, negativo).

La relevancia del artefacto es limitada en terminos de estado del arte, pero resulta util como referencia docente: muestra un pipeline completo de NLP en turco con un corpus de 440.679 ejemplos de entrenamiento y 48.965 de test, una interfaz Gradio y una comparativa de cuatro arquitecturas recurrentes clasicas. No hay pesos publicados en el repositorio (tamano de 0.0 GB), por lo que el artefacto disponible es documental, no ejecutable de forma directa.

El modelo no emplea atencion, ni tokenizacion subword de un transformer moderno, ni tecnicas de alineacion como RLHF o DPO. Su interes es, por tanto, historico y pedagogico dentro del ecosistema NLP turco, no competitivo frente a modelos transformer actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN: LSTM, Bidirectional LSTM, GRU y Balanced GRU (PyTorch `nn.Module`) |
| Parametros totales | no disponible (no se publican dimensiones de embedding, hidden ni vocabulario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada empaquetada con `pack_padded_sequence`; sin ventana fija documentada) |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | turco (`tr`) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio de Hugging Face no contiene pesos; tamano 0.0 GB) |

## Arquitectura y entrenamiento

El proyecto implementa cuatro clasificadores recurrentes en PyTorch. El clasificador LSTM base usa una capa `nn.Embedding` con `padding_idx`, una LSTM de una capa con dropout 0.3 y una capa lineal final hacia la salida de clasificacion. La variante Bidirectional LSTM emplea una LSTM bidireccional con dropout 0.5 y una capa lineal de dimension `hid_dim * 2` a la salida. Las variantes GRU y "Balanced GRU" no detallan hiperparametros en la model card, aunque se infiere que siguen el mismo esquema sustituyendo la celda recurrente y, en el caso "balanced", aplicando algun tipo de reponderacion de clases o muestreo equilibrado para mitigar el desbalance del corpus.

El entrenamiento se realizo en Google Colab sobre GPUs A100 de 40 GB, L4 y T4. El corpus procede del dataset publico `winvoker/turkishsentimentanalysisdataset` de Kaggle, con 440.679 filas de entrenamiento y 48.965 de test, tres columnas (`text`, `label`, `dataset`) y seis subconjuntos de origen (`dataset`). La distribucion de etiquetas esta fuertemente desbalanceada: en entrenamiento, la clase mayoritaria ("Positive") aparece 235.949 veces frente a 440.058 textos unicos, lo que sugiere que la clase positiva domina el corpus. No se documentan tecnicas de aumento de datos, tokenizacion concreta, tamano de vocabulario ni numero de epocas.

## Capacidades

- Clasificacion de sentimiento ternaria (positivo, neutro, negativo) sobre resenas de productos en turco.
- Procesamiento de texto en turco a nivel de resena individual, con secuencias de longitud variable mediante empaquetado (`pack_padded_sequence`).
- Interfaz Gradio para seleccionar el modelo (LSTM, BiLSTM, GRU, Balanced GRU) e introducir una resena manualmente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo "thinking", vision, audio ni generacion de texto libre.
- Capacidad multilingue: no, exclusivamente turco.
- No expone una API de inferencia estandar (pipeline de Hugging Face no disponible).

## Casos de uso

- Docencia de NLP en turco: el proyecto sirve como ejemplo completo de pipeline (carga de corpus, tokenizacion, entrenamiento de RNN, evaluacion y demo con Gradio) para asignaturas de procesamiento de lenguaje natural.
- Prototipado rapido de analisis de sentimiento en resenas de e-commerce turco: dado un corpus etiquetado, se puede reproducir el entrenamiento y obtener un clasificador ternario ligero para pruebas internas.
- Monitorizacion de opinion en marketplaces turcos: clasificar resenas de productos en positivas, neutras y negativas para agregar metricas de satisfaccion por categoria, siempre que se reentrene con datos propios.
- Comparativa de arquitecturas recurrentes: util como baseline para contrastar LSTM, BiLSTM y GRU frente a modelos transformer en tareas de clasificacion de texto turco.
- Filtrado previo en pipelines de moderacion: descartar o priorizar resenas negativas para revision humana en flujos de atencion al cliente.
- Investigacion sobre desbalance de clases: el corpus, con una clase positiva dominante, permite estudiar tecnicas de reponderacion (la variante "Balanced GRU" apunta en esa direccion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision ni recall para ninguna de las cuatro variantes, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse pesos ni dimensiones, no puede calcularse. Por la naturaleza de los clasificadores RNN (tipicamente decenas de millones de parametros como maximo), cabria esperar un consumo muy bajo, pero es una estimacion no verificada.
- GPU recomendadas: el autor uso A100 40 GB, L4 y T4 exclusivamente para entrenamiento; para inferencia no se documenta hardware.
- Cabe en GPU consumer: probablemente si, dado el tamano tipico de un clasificador RNN, pero no confirmado por falta de pesos.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI. El unico despliegue descrito es una demo Gradio incluida en el repositorio original de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| veripazari/turkish-store-reviews-sentiment-analyses | RNN (LSTM/BiLSTM/GRU) | no disponible | no disponible | tr | MIT | Solo documentacion, sin pesos |
| knetic0/turkish-store-reviews-sentiment-analyses (original) | RNN (LSTM/BiLSTM/GRU) | no disponible | no disponible | tr | MIT | Repositorio GitHub con codigo y demo Gradio |
| Modelos transformer turcos para clasificacion (p. ej. BERTurk) | Transformer encoder | no disponible en esta ficha | 512 tokens tipicos | tr | variable | Pesos publicos en Hugging Face |

No se dispone de datos de rendimiento del modelo analizado ni de los alternativos en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- No hay pesos publicados en el repositorio de Hugging Face (tamano 0.0 GB); el artefacto es esencialmente documental y no puede ejecutarse sin reentrenar desde el codigo original.
- El corpus esta fuertemente desbalanceado hacia la clase positiva (235.949 de 440.679 ejemplos de entrenamiento), lo que puede sesgar las predicciones hacia "positivo".
- Riesgo de alucinacion no aplica en sentido generativo, pero si de sobreajuste a dominios concretos de resenas de productos; el modelo no esta validado en otros generos textuales.
- Limitacion idiomatica estricta: solo turco; no soporta castellano ni otras lenguas.
- Arquitectura recurrente sin atencion: capacidad limitada para dependencias largas y para capturar negaciones o ironias complejas.
- No se documentan sesgos demograficos ni geograficos del corpus; el origen (seis subconjuntos de `dataset`) no se describe en detalle.
- La licencia MIT permite uso comercial, pero al no existir pesos ni metricas, cualquier uso en produccion exige reentrenamiento y validacion propios.
- El proyecto parece de origen academico (tres autores con numeros de matricula), sin mantenimiento ni versionado posterior a la fecha de creacion del repositorio (2026-11-23).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/turkish-store-reviews-sentiment-analyses
- Repositorio original en GitHub: https://github.com/knetic0/turkish-store-reviews-sentiment-analyses
- Plataforma VeriPazari: https://veripazari.com.tr
- Dataset en Kaggle: https://www.kaggle.com/datasets/winvoker/turkishsentimentanalysisdataset
- Imagen de la interfaz Gradio: https://raw.githubusercontent.com/knetic0/turkish-store-reviews-sentiment-analyses/master/images/ui-image.png
- Imagen de ejemplo del dataset: https://raw.githubusercontent.com/knetic0/turkish-store-reviews-sentiment-analyses/master/images/dataset-example.png
