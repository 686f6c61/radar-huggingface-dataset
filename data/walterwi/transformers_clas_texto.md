# WalterWi/transformers_clas_texto

## Resumen

`WalterWi/transformers_clas_texto` es un clasificador binario de texto en espanol construido con una arquitectura BERT minima y entrenado desde cero. Lo desarrolla WalterWi en el marco del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra) como ejemplo pedagogico que ilustra todas las piezas que se publican al compartir un modelo en Hugging Face: configuracion, pesos, tokenizer y scripts de entrenamiento e inferencia. No es un modelo destinado a produccion, sino una demostracion didactica del flujo completo de publicacion de un modelo de Transformers.

El modelo resuelve una tarea de clasificacion de sentimiento muy acotada: dado un comentario corto sobre departamentos, devuelve `positivo` o `negativo`. La arquitectura es un `BertForSequenceClassification` con solo 2 capas, 2 cabezas de atencion y dimension oculta 32, lo que suma 20.546 parametros totales. El tokenizer es de nivel palabra (`WordLevel`) con un vocabulario de 37 tokens, en minusculas y sin tildes.

Su relevancia es exclusivamente educativa. Sirve para entender como se empaquetan los artefactos de un modelo, por que el tokenizer debe acompanar siempre a los pesos y por que un accuracy perfecto en test puede ser enganoso cuando el conjunto de evaluacion comparte plantillas con el de entrenamiento. No debe confundirse con un modelo de sentimiento en espanol utilizable en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), 2 capas, 2 cabezas de atencion, dimension 32 |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se documenta en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol (es) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizer | `WordLevel`, 37 tokens, minusculas y sin tildes |
| Pipeline | text-classification |
| Etiquetas | `negativo` (0), `positivo` (1) |
| Biblioteca | transformers (compatible con Transformers 4 y 5) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo BERT reducido al minimo: 2 capas, 2 cabezas de atencion y dimension oculta 32. La cabeza de clasificacion (`BertForSequenceClassification`) proyecta la representacion del token `[CLS]` a dos clases. El tokenizer es `WordLevel` con 37 tokens, normaliza a minusculas y elimina tildes; cualquier palabra fuera del vocabulario se mapea a `[UNK]`.

El entrenamiento es supervisado desde cero, sin preentrenamiento previo. El dataset es sintetico: 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos), con 294 registros para entrenamiento y 74 para evaluacion. Se usa entropia cruzada como funcion de perdida, optimizador AdamW con tasa de aprendizaje 0,001, 15 epocas y lotes de 16, todo con PyTorch y Hugging Face Transformers. No hay RLHF, DPO ni ninguna innovacion tecnica destacable; el interes del modelo es precisamente mostrar el esqueleto minimo de un flujo de clasificacion de texto.

## Capacidades

- Clasificacion binaria de sentimiento (`positivo` / `negativo`) sobre comentarios cortos construidos con las plantillas y adjetivos vistos en entrenamiento.
- Inferencia via `pipeline("text-classification")` de Transformers.
- Normalizacion de texto a minusculas y eliminacion de tildes mediante el tokenizer incluido.
- Compatibilidad con Transformers 4 y Transformers 5.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo espanol y, de hecho, solo el subconjunto de 37 palabras de su vocabulario.
- No dispone de modo thinking, vision, audio ni ninguna capacidad especial.

## Casos de uso

- Docencia de pipelines de Transformers: sirve para mostrar de principio a fin como se entrena, guarda y publica un modelo de clasificacion de texto con `Trainer` y `pipeline`, incluidos `config.json`, `model.safetensors` y los archivos del tokenizer.
- Demostracion de la dependencia modelo-tokenizer: permite explicar por que publicar los pesos sin el tokenizer hace el modelo inutilizable, ya que los indices de embedding solo tienen sentido con el vocabulario exacto con el que se entreno.
- Ejercicio sobre evaluacion enganosa: con 74 ejemplos de test generados con las mismas plantillas que el entrenamiento, el accuracy de 1,000 sirve para discutir fuga de informacion y por que un test debe ser independiente.
- Ilustracion del fallo con `[UNK]`: al introducir frases fuera de vocabulario, el modelo responde con confianza alta y etiqueta erronea, lo que ejemplifica el comportamiento de un modelo ante entradas fuera de distribucion.
- Practica de publicacion en el Hub: el repositorio incluye `train.py`, `predict.py` y `requirements.txt`, utiles como plantilla para que el alumnado replique el flujo con sus propios datos.
- Punto de partida para un fine-tuning real: la model card recomienda explicitamente partir de un modelo preentrenado en espanol y ajustarlo con comentarios reales, de modo que este modelo sirve como contraste de lo que no debe hacerse en produccion.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sinteticos de test |

El propio autor advierte que este 1,000 no indica calidad del modelo: los comentarios de test emplean las mismas plantillas y adjetivos que los de entrenamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 20.546 parametros y pesos en safetensors, el modelo cabe holgadamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Funciona tambien en GPU consumer de gama baja (por ejemplo, GTX 1650, RTX 3050) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer, incluida una iGPU o incluso ejecucion solo en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (segun los tags del repositorio) y despliegue como endpoint compatible. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia en CPU es del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Proposito |
|---|---|---|---|---|---|
| `WalterWi/transformers_clas_texto` | 20.546 | no disponible | es | MIT | Ejemplo educativo de clasificacion binaria |
| BETO (`dccuchile/bert-base-spanish-wwm-cased`) | ~110 M | 512 tokens | es | no disponible en esta ficha | Modelo BERT preentrenado en espanol para fine-tuning |
| `finiteautomata/beto-sentiment-analysis` | ~110 M | 512 tokens | es | no disponible en esta ficha | Clasificacion de sentimiento en espanol con datos reales |
| `robertuito-sentiment-analysis` | ~110 M | 128 tokens | es | no disponible en esta ficha | Analisis de sentimiento en espanol de redes sociales |

La comparacion relevante es de proposito, no de rendimiento: los modelos BETO y RoBERTuito son alternativas reales para clasificacion de sentimiento en espanol, mientras que este modelo es una maqueta didactica con un vocabulario de 37 palabras. No se dispone de datos de benchmarks comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para uso en produccion.
- Vocabulario de solo 37 palabras: cualquier termino fuera de el se convierte en `[UNK]`, y el modelo responde igualmente con confianza alta y, a menudo, etiqueta erronea.
- No entiende negaciones ("no es luminoso") ni ironia, porque no aparecen en los datos de entrenamiento.
- El dataset es sintetico y generado con plantillas, por lo que el accuracy de test (1,000) es optimista y no representa el rendimiento en texto real.
- Sesgos conocidos: no documentados en la model card; el vocabulario y las plantillas limitan el modelo a un dominio muy concreto de comentarios sobre departamentos.
- Riesgo de alucinacion: no aplica en sentido estricto (es un clasificador), pero si existe riesgo de predicciones seguras e incorrectas ante entradas fuera de distribucion.
- Limitaciones de contexto e idioma: solo espanol y sin longitud de contexto documentada; el tokenizer elimina tildes y pasa a minusculas, lo que pierde informacion ortografica.
- Licencia MIT: permite uso comercial, pero el modelo no es funcionalmente util para tareas reales.
- Caveat para produccion: la propia model card recomienda hacer fine-tuning de un modelo preentrenado en espanol con comentarios reales en lugar de usar este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WalterWi/transformers_clas_texto
- Documentacion de Transformers (Hugging Face): https://huggingface.co/docs/transformers
- Que son los transformers en IA (AWS): https://aws.amazon.com/what-is/transformers-in-artificial-intelligence/
- Transformer (deep learning), Wikipedia: https://en.wikipedia.org/wiki/Transformer_(deep_learning)
- BETO, BERT preentrenado en espanol: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
