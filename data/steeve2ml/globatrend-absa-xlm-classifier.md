# Steeve2ml/globatrend-absa-xlm-classifier

## Resumen

`Steeve2ml/globatrend-absa-xlm-classifier` es un checkpoint experimental de análisis de sentimiento basado en aspectos (ABSA, Aspect-Based Sentiment Analysis) construido sobre `xlm-roberta-base`. Dado un texto y un aspecto concreto mencionado en él, el modelo predice la polaridad de ese aspecto en tres clases (negativo, neutro, positivo). Forma parte del proyecto de portafolio "GlobaTrend Insights" y no está pensado como clasificador listo para producción.

El objetivo del experimento es responder a una pregunta de investigación concreta: si un modelo afinado en ABSA únicamente con datos en inglés es capaz de transferir esa capacidad a español, alemán, francés e hindi sin haber visto nunca un ejemplo etiquetado en esos idiomas (transferencia cross-lingual zero-shot). XLM-R se eligió precisamente porque comparte un espacio de representación entre 100 idiomas, algo que un encoder solo-inglés como DistilBERT no puede ofrecer estructuralmente.

El modelo tiene 278.045.955 parámetros y ocupa 1,1 GB en el repositorio, lo que corresponde a pesos en precisión completa (fp32). Pese a ser técnicamente publicable y estar bajo licencia MIT, la propia model card documenta un fallo de entrenamiento verificado: un primer run de 3 épocas colapsó a predecir una única clase, con accuracy 0,600 y macro F1 0,375 en la validación inglesa y exactamente 0,500 de accuracy zero-shot en los cuatro idiomas objetivo. El autor recomienda explícitamente no desplegar este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), clasificacion de secuencias sobre pares de frases (sentence-pair sequence classification) |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de `xlm-roberta-base`; no declarado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors en fp32 (1,1 GB para 278M parametros). No se publican variantes GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | Afinado solo en ingles; evaluado zero-shot en es, de, fr, hi. Idiomas declarados en el modelo: en, es, de, fr, hi |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Text classification / ABSA, 3 clases (negativo, neutro, positivo) |
| Dataset de entrenamiento | `tomaarsen/setfit-absa-semeval-restaurants` (SemEval-2014 Task 4, resenas de restaurantes, solo ingles) |
| Modelo base | `FacebookAI/xlm-roberta-base` |
| Metricas declaradas | accuracy, f1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa base con una cabeza de clasificacion de 3 clases anadida para la tarea de sequence classification sobre pares (texto, aspecto). XLM-RoBERTa base fue preentrenado por Facebook AI sobre texto en 100 idiomas; el checkpoint aqui descrito parte de esa base y se afina exclusivamente con el split ingles de SemEval-2014 Task 4 en su variante de restaurantes, distribuida a traves del dataset `tomaarsen/setfit-absa-semeval-restaurants`. No se menciona en la informacion disponible el uso de RLHF, DPO ni preferencias humanas: es un fine-tuning supervisado estandar de clasificacion.

La innovacion tecnica que se pretende explorar es la transferencia cross-lingual zero-shot: reutilizar el espacio de representacion multilingue de XLM-R para aplicar a es, de, fr e hi lo aprendido solo en ingles. Los resultados documentados no respaldan que esa transferencia se haya producido en este checkpoint. Un primer entrenamiento de 3 epocas colapso a una clase unica: accuracy y F1 identicos en las tres epocas, 0,600 de accuracy y 0,375 de macro F1 sobre la propia validacion inglesa, y 0,500 exactos de accuracy zero-shot en los cuatro idiomas destino. El autor atribuye la causa probable a que XLM-R (~270M parametros) necesita mas entrenamiento que DistilBERT (~67M) para que la cabeza de clasificacion inicializada aleatoriamente deje de dominar; se esta probando aumentar las epocas, sin resultados estables confirmados en el momento de redactar la model card.

## Capacidades

- Clasificacion de polaridad por aspecto en 3 clases (negativo, neutro, positivo) cuando el aspecto se proporciona de forma explicita en la entrada.
- Formulacion como sentence-pair classification: la entrada combina el texto de la resena y el termino de aspecto.
- Cobertura linguistica teorica derivada de la base multilingue XLM-R (100 idiomas en el preentrenamiento), con evaluacion declarada en en, es, de, fr e hi.
- Capacidad de transferencia cross-lingual zero-shot: es la hipotesis bajo estudio, no una capacidad verificada en este checkpoint.
- No realiza extraccion de aspectos: no localiza que aspectos aparecen en un texto crudo, solo clasifica el sentimiento de un aspecto ya dado.
- No soporta tool calling ni function calling, no es un modelo generativo, no tiene modo de razonamiento explicito (thinking mode), no procesa vision ni audio y no tiene capacidades de agente ni de razonamiento multi-paso.
- Tag declarado de compatibilidad con Text Embeddings Inference (`text-embeddings-inference`, `endpoints_compatible`).

## Casos de uso

- Investigacion sobre transferencia cross-lingual zero-shot: comparar la accuracy de este checkpoint en es, de, fr e hi contra su accuracy en ingles (el unico idioma de entrenamiento) para cuantificar cuanto conocimiento de sentimiento por aspecto se transfiere sin datos etiquetados en el idioma destino. Es el uso previsto declarado por el autor.
- Reproduccion y depuracion de fallos de entrenamiento: el checkpoint es un ejemplo documentado de colapso a clase unica en fine-tuning de XLM-R con 3 epocas. Sirve como caso de estudio para disenar protocolos de validacion que detecten predicciones de una sola clase antes de fiarse de una metrica agregada.
- Analisis de sesgo por distancia linguistica: medir si la degradacion de la transferencia es mayor en idiomas mas alejados del ingles dentro de los datos de preentrenamiento de XLM-R, con el hindi como caso destacado segun la propia model card.
- Comparacion de arquitecturas base para ABSA: contrastar XLM-R (~278M parametros) con DistilBERT (~67M) sobre los mismos datos de entrenamiento, ya que el proyecto incluye el modelo hermano `globatrend-absa-classifier` entrenado con el mismo dataset.
- Evaluacion de pipelines de clasificacion con la libreria `transformers`: probar la integracion del modelo en flujos de `AutoModelForSequenceClassification` y en servicios compatibles con Text Embeddings Inference o endpoints de Hugging Face.
- Estudio de estabilidad de la cabeza de clasificacion: analizar como afectan el numero de epocas y la tasa de aprendizaje al comportamiento de una cabeza inicializada aleatoriamente sobre un encoder multilingue grande.
- Uso en produccion de analisis de opiniones: no recomendado. La model card indica explicitamente "Do not deploy this checkpoint" y no valida el modelo para analisis de sentimiento en produccion en ningun idioma, incluido el ingles.

## Benchmarks y rendimiento

Resultados declarados en la model card, todos procedentes del run de 3 epocas que colapso a una clase unica. Deben interpretarse como evidencia de fallo de entrenamiento, no como rendimiento util del modelo.

| Benchmark | Idioma | Metrica | Resultado | Notas |
|---|---|---|---|---|
| SemEval-2014 Task 4 (restaurantes), validacion | en | Accuracy | 0,600 | Identica en las tres epocas del run colapsado |
| SemEval-2014 Task 4 (restaurantes), validacion | en | Macro F1 | 0,375 | Identica en las tres epocas del run colapsado |
| Evaluacion zero-shot | es | Accuracy | 0,500 | Consistente con prediccion de una unica clase |
| Evaluacion zero-shot | de | Accuracy | 0,500 | Consistente con prediccion de una unica clase |
| Evaluacion zero-shot | fr | Accuracy | 0,500 | Consistente con prediccion de una unica clase |
| Evaluacion zero-shot | hi | Accuracy | 0,500 | Consistente con prediccion de una unica clase |

Como referencia del mismo proyecto, el modelo hermano `globatrend-absa-classifier` (DistilBERT, solo ingles) alcanza 0,767 de accuracy declarada. Los conjuntos de prueba zero-shot son conjuntos pequenos traducidos manualmente, de unas pocas frases por idioma, insuficientes para constituir un benchmark estadisticamente robusto. No hay resultados publicados de MMLU, HumanEval ni GSM8K: este modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,1 GB en fp32, lo que corresponde a unos 1,1 GB de pesos. En fp16 la huella de pesos baja a aproximadamente 0,56 GB y en int8 a aproximadamente 0,28 GB. Con activaciones y batches moderados, la inferencia cabe holgadamente por debajo de 2-3 GB de VRAM en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 con batches pequenos. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes; el modelo esta muy por debajo de las capacidades de cualquier acelerador moderno.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos con 4 GB o mas de VRAM. Tambien es viable en CPU para inferencia por lotes pequenos, dado el tamano del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (unico metodo documentado en la model card), Text Embeddings Inference (tag declarado), endpoints compatibles con Hugging Face. No hay variantes GGUF publicadas, por lo que llama.cpp y Ollama no son aplicables directamente; tampoco se documentan integraciones con vLLM o TGI para este checkpoint.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de throughput en la informacion proporcionada.
- Nota: los requisitos anteriores son estimaciones derivadas del numero de parametros y del tamano del repositorio. La idoneidad del modelo para cualquier despliegue esta condicionada por el fallo de entrenamiento documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Enfoque | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `Steeve2ml/globatrend-absa-xlm-classifier` | 278.045.955 | 512 tokens (base) | Afinado en en; zero-shot en en, es, de, fr, hi | ABSA, sentence-pair classification sobre XLM-R | Accuracy 0,600 y macro F1 0,375 en validacion inglesa (run colapsado); 0,500 zero-shot en es/de/fr/hi | MIT | Publico en Hugging Face, 0 descargas, 0 likes |
| `globatrend-absa-classifier` (modelo hermano del mismo proyecto) | ~67M (DistilBERT) | no disponible | Solo ingles | ABSA sobre DistilBERT, mismos datos de entrenamiento | Accuracy 0,767 declarada | no disponible | Publico, referenciado en la model card |
| `FacebookAI/xlm-roberta-base` (modelo base) | ~278M | 512 tokens | 100 idiomas en preentrenamiento | Encoder multilingue sin cabeza de clasificacion | No aplica (modelo base) | MIT | Publico en Hugging Face |

No se dispone de informacion sobre otros modelos comparables de ABSA multilingue zero-shot en el material proporcionado; la busqueda web no devolvio resultados relevantes (unicamente paginas de soporte de Microsoft ajenas al tema).

## Limitaciones y advertencias

- Fallo de entrenamiento verificado: un run inicial de 3 epocas colapso a predecir una unica clase. Accuracy y macro F1 fueron identicos en las tres epocas sobre la validacion inglesa (0,600 y 0,375) y la accuracy zero-shot fue exactamente 0,500 en los cuatro idiomas objetivo, patron consistente con un modelo que nunca aprendio a discriminar.
- Advertencia del autor: cualquier cifra de evaluacion de esta linea de experimentos debe tratarse con cautela hasta contrastarla con predicciones individuales sobre una muestra pequena, para descartar el colapso a clase unica.
- Causa probable no confirmada: XLM-R es sustancialmente mayor que DistilBERT (270M frente a 67M) y puede requerir mas epocas o una tasa de aprendizaje distinta. La correccion se estaba probando y los resultados no estaban confirmados al redactar la model card.
- El modelo no es un extractor de aspectos: solo clasifica el sentimiento de un aspecto ya proporcionado. La extraccion de aspectos del proyecto es solo en ingles (basada en POS tagging) y no se aplico a las frases de prueba en otros idiomas, que se suministraron directamente.
- Conjuntos de prueba zero-shot muy pequenos: unas pocas frases traducidas a mano por idioma. Suficientes para una primera senal, no para un benchmark robusto.
- Uso fuera de alcance: no esta validado para analisis de sentimiento en produccion en ningun idioma, incluido el ingles. La model card indica explicitamente no desplegar el checkpoint.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es la prediccion sistematicamente incorrecta por colapso a una clase.
- Sesgos conocidos: no se documentan sesgos especificos mas alla de los derivados del dataset de resenas de restaurantes en ingles (dominio y registro restringidos a SemEval-2014 Task 4).
- Limitaciones de idioma: aunque la base cubre 100 idiomas, el afinamiento es exclusivamente en ingles y la transferencia a es, de, fr e hi no se ha demostrado con este checkpoint.
- Restricciones de licencia: MIT permite uso comercial, modificacion y redistribucion, pero la recomendacion explicita del autor y el estado experimental del checkpoint desaconsejan cualquier uso en produccion con independencia de la licencia.
- Caveat de produccion: no se documentan pruebas de robustez, calibracion, latencia ni comportamiento frente a dominios distintos de las resenas de restaurantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Steeve2ml/globatrend-absa-xlm-classifier
- Modelo base XLM-RoBERTa base: https://huggingface.co/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/tomaarsen/setfit-absa-semeval-restaurants
- Modelo hermano (DistilBERT ABSA, solo ingles): `globatrend-absa-classifier`, referenciado en la model card del modelo aqui descrito; no se proporciona URL directa en la informacion disponible
- Paper original de la tarea (SemEval-2014 Task 4): no disponible como enlace en la informacion proporcionada
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de soporte de Microsoft sin relacion con el modelo
