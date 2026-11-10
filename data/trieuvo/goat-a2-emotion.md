# TrieuVo/goat-a2-emotion

## Resumen

`TrieuVo/goat-a2-emotion` es un checkpoint de DistilBERT afinado para clasificacion de emociones en textos cortos en ingles. Lo desarrolla el grupo "Goat" en el marco de la asignatura CO3133 Deep Learning and Its Applications (HCMUT, semestre 261) y se publica como artefacto academico, no como modelo de produccion. El problema que resuelve es la clasificacion de una frase corta en una de seis emociones del dataset `dair-ai/emotion`: sadness, joy, love, anger, fear y surprise.

El modelo base es `distilbert-base-uncased`, un transformer encoder de la familia BERT destilada, con vocabulario WordPiece sin casing. El repo incluye dos artefactos: el checkpoint DistilBERT afinado completo (`distil_full_min/`) y un baseline clasico de TF-IDF + regresion logistica en formato `joblib`. El checkpoint seleccionado reporta una exactitud de 0,9270 y un Macro-F1 de 0,8902 sobre las 2.000 frases del test oficial.

Su relevancia es limitada fuera del ambito docente: no hay datos de licencia, el modelo solo cubre ingles, el dataset de entrenamiento tiene un sesgo fuerte de plantilla ("i feel ...") y el autor reconoce errores por etiquetas dudosas. Es util como referencia de linea base para tareas de clasificacion de emociones y como ejemplo de receta de fine-tuning reproducible, pero no como componente critico de un sistema en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT) |
| Parametros totales | 66 millones (DistilBERT base, segun el modelo base `distilbert-base-uncased`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (MAX_LEN usado en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint `distil_full_min/`); `joblib` para el baseline TF-IDF + regresion logistica |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de DistilBERT: 6 capas de encoder, atencion multi-cabeza y embeddings WordPiece de 30.522 tokens, destilado desde `bert-base-uncased`. Sobre esa base se anade una cabeza de clasificacion de secuencias con 6 etiquetas. El fine-tuning es completo (no LoRA ni adaptadores), con `MAX_LEN` de 128, batch de 16 y 3 epocas, optimizador AdamW con learning rate 2e-5 en el encoder y 1e-4 en la cabeza, warmup lineal del 10% y funcion de perdida ponderada por clase para compensar el desbalance del dataset. El checkpoint seleccionado es el de la epoca 3, elegida por mejor Macro-F1 de validacion. El entrenamiento se ejecuto en una Tesla T4 de Colab.

El preprocesado es deliberadamente minimo: normalizacion Unicode NFC, minusculas y colapso de espacios multiples. El dataset es `dair-ai/emotion` (config `split`, revision `cab853a1dbdf4c42c2b3ef2173804746df8825fe`), que contiene frases cortas en minusculas, sin puntuacion y con una alta proporcion de textos que empiezan por "i feel". No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; es un clasificador supervisado convencional. El repo incluye tambien un baseline TF-IDF (unigramas y bigramas, stopwords eliminadas, pesos de clase balanceados) con regresion logistica, guardado como dict `joblib` con scikit-learn 1.6.1.

## Capacidades

- Clasificacion de texto corto en ingles en 6 emociones: sadness, joy, love, anger, fear y surprise.
- Inferencia por `argmax` sobre los logits de la cabeza de clasificacion (salida de 6 clases).
- Tokenizacion con `AutoTokenizer` de la familia DistilBERT/BERT.
- Preprocesado reproducible integrado (normalizacion NFC, minusculas, espacios colapsados).
- Baseline clasico complementario (TF-IDF + regresion logistica) para comparacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Cobertura multilingue: solo ingles.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de comentarios en ingles: clasificar respuestas de usuarios en emociones negativas (anger, fear, sadness) para enrutarlas a revision humana, aprovechando la salida de 6 clases y el umbral configurable sobre logits.
- Analisis de sentimiento a nivel de frase en encuestas cortas: procesar respuestas tipo "i feel ..." y agregar distribuciones de emociones por segmento; el modelo esta entrenado especificamente sobre ese registro.
- Etiquetado de datos para construir datasets de emociones: usar el checkpoint como anotador automatico de frases cortas en ingles y revisar manualmente los casos de baja confianza, dado el Macro-F1 de 0,8902.
- Linea base en experimentos academicos: comparar nuevas propuestas (modelos mas grandes, LLMs, tecnicas de aumento de datos) contra este checkpoint y su baseline TF-IDF, ambos con metricas publicadas sobre el mismo test.
- Deteccion de patrones de queja en tickets de soporte: clasificar la primera frase del ticket en anger o sadness para priorizar colas, con la advertencia de que frases largas o con puntuacion pueden degradar el rendimiento.
- Filtrado previo en pipelines de analisis conversacional: descartar o marcar turnos con carga emocional alta antes de pasarlos a un modelo generativo mas caro, reduciendo coste computacional.
- Demostracion docente de fine-tuning: reproducir la receta (AdamW, warmup, class weights, seleccion por Macro-F1) como plantilla para otras tareas de clasificacion con `transformers`.

## Benchmarks y rendimiento

| Modelo | Test accuracy | Test Macro-F1 |
|---|---|---|
| DistilBERT full fine-tune, seed 42 (checkpoint seleccionado) | 0,9270 | 0,8902 |
| TF-IDF (uni + bigramas) + regresion logistica, class weights (baseline) | 0,8905 | 0,8548 |

Test sobre las 2.000 frases oficiales de `dair-ai/emotion`. La seleccion de checkpoint y baseline se hizo sobre el conjunto de validacion antes de evaluar en test. No se publican resultados frente a otros modelos de la literatura en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3 GB en fp32 para los pesos del checkpoint DistilBERT (66 millones de parametros); con batch pequeno y `MAX_LEN` 128 el consumo es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una T4 es suficiente para entrenamiento (se uso en el proyecto) y sobra para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) y tambien en CPU para batches pequenos.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`; `pipeline("text-classification")`; exportacion a ONNX para inferencia optimizada; el baseline TF-IDF se sirve con `joblib` y scikit-learn 1.6.1.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano del modelo, se espera orden de milisegundos por frase en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TrieuVo/goat-a2-emotion` | 66 M (DistilBERT) | 128 tokens | Clasificacion de 6 emociones (en) | no disponible | Hugging Face (repo publico) |
| `distilbert-base-uncased` | 66 M | 512 tokens | Modelo base sin cabeza de clasificacion | Apache 2.0 (modelo base) | Hugging Face |
| `bhadresh-savani/distilbert-base-uncased-emotion` | 66 M (DistilBERT) | 512 tokens | Clasificacion de emociones (en) | no verificada en esta ficha | Hugging Face |
| `j-hartmann/emotion-english-distilroberta-base` | 82 M (DistilRoBERTa) | 512 tokens | Clasificacion de 7 emociones (en) | no verificada en esta ficha | Hugging Face |

Comparaciones de rendimiento entre estos modelos no estan disponibles en la informacion proporcionada; solo se dispone de las metricas internas del checkpoint frente a su propio baseline TF-IDF.

## Limitaciones y advertencias

- Sesgo de plantilla: la mayoria de textos de `dair-ai/emotion` empiezan por "i feel", en minusculas y sin puntuacion; el modelo puede rendir peor con texto natural con mayusculas, puntuacion o estructuras distintas.
- Negaciones: frases como "i am not happy ..." suelen clasificarse por la palabra de emocion presente, no por la polaridad real.
- Etiquetas dudosas: el autor reconoce que parte de los errores restantes corresponden a etiquetas discutibles del propio dataset.
- Solo ingles: no hay soporte multilingue; el vocabulario es `uncased` en ingles.
- Contexto corto: 128 tokens; frases mas largas se truncan y pueden perder informacion relevante.
- Licencia no disponible: no se puede confirmar el uso comercial; tratar como artefacto academico hasta verificacion.
- Artefacto academico: sin descargas ni likes, sin proceso de mantenimiento ni versionado posterior; no hay garantias de robustez en produccion.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la cabeza de clasificacion puede producir predicciones de alta confianza sobre entradas fuera de distribucion.
- Baseline `joblib`: depende de scikit-learn 1.6.1 y del preprocesado `clean_aggr` (stopwords eliminadas) del `app.py` de la demo; versiones distintas pueden fallar al cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TrieuVo/goat-a2-emotion
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/TrieuVo/goat-a2-emotion-demo
- Codigo y memoria del proyecto: https://github.com/volethanhtrieu/DL_Assignment-02
- Pagina de la asignatura: https://volethanhtrieu.github.io/DL_Assignment-02/
- Dataset `dair-ai/emotion`: https://huggingface.co/datasets/dair-ai/emotion
- Modelo base `distilbert-base-uncased`: https://huggingface.co/distilbert/distilbert-base-uncased
