# vllm-project/roberta-large-ner-english

## Resumen

`vllm-project/roberta-large-ner-english` es una copia de seguridad (mirror) del modelo `Jean-Baptiste/roberta-large-ner-english`, un modelo de reconocimiento de entidades nombradas (NER) en inglés obtenido por fine-tuning de `roberta-large` sobre el dataset CoNLL-2003. La copia la mantiene el proyecto vLLM dentro de su organizacion en Hugging Face para usarla en sus pipelines de integracion continua y reducir el riesgo de cadena de suministro, ya que el repositorio original reside en una cuenta personal. El checkpoint se creo el 30 de octubre de 2026 a partir del commit `8f3abc1` del repositorio original.

El modelo resuelve la tarea de token classification para extraer cuatro tipos de entidades: personas (PER), organizaciones (ORG), localizaciones (LOC) y entidades miscelaneas (MISC). A diferencia del esquema original de CoNLL-2003, el autor elimino los prefijos B- e I-, simplificando la salida a una etiqueta por token. Segun la model card, el modelo fue validado especificamente sobre datos de correo electronico y chat, donde supero a alternativas como spaCy `en_core_web_trf-3.2.0` en la deteccion de organizaciones y localizaciones.

Se trata de un transformer encoder de tipo RoBERTa con 354.315.783 parametros (aproximadamente 355 M), pesos en safetensors, PyTorch, TensorFlow y ONNX, y licencia MIT. Su relevancia actual es la de un componente clasico y ligero para tareas de extraccion de informacion en produccion, con un rendimiento elevado en el dominio formal de CoNLL-2003 (F1 global de 0,9753) y una degradacion moderada en dominios informales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large), tarea de token classification |
| Parametros totales | 354.315.783 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (RoBERTa-large admite hasta 512 tokens de posicion, dato no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el repo incluye pesos safetensors, PyTorch, TensorFlow y ONNX; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin), TensorFlow y ONNX |
| Tamano del repositorio | 5,7 GB |
| Dataset de entrenamiento | CoNLL-2003 (train: 17.494 ejemplos; validation: 3.250) |
| Etiquetas | O, MISC, PER, ORG, LOC (sin prefijos B-/I-) |

## Arquitectura y entrenamiento

El modelo es un `roberta-large` adaptado a token classification mediante una cabeza lineal sobre las representaciones del encoder. RoBERTa-large es un transformer encoder de 24 capas con atencion multi-cabeza completa, preentrenado de forma autoregresiva enmascarada sobre grandes corpus en ingles y posteriormente afinado. La model card no detalla hiperparametros de fine-tuning (learning rate, epochs, batch size) ni el numero exacto de tokens de preentrenamiento, por lo que esos datos deben considerarse no disponibles.

El ajuste se realizo sobre CoNLL-2003, usando los splits oficiales de entrenamiento y test para entrenamiento y el split de validacion para evaluacion. El autor simplifico el esquema de etiquetado eliminando los prefijos B- e I-, de modo que cada token recibe directamente una de las cinco etiquetas. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un fine-tuning supervisado clasico. La innovacion practica declarada por el autor es la validacion especifica sobre datos informales (correos y chats), donde el modelo muestra mejor comportamiento con entidades que no comienzan en mayuscula.

## Capacidades

- Reconocimiento de entidades nombradas en ingles con cuatro categorias: PER (persona), ORG (organizacion), LOC (localizacion) y MISC (miscelanea).
- Token classification a nivel de subpalabra, con agregacion a nivel de palabra mediante `aggregation_strategy="simple"` en el pipeline de Hugging Face.
- Extraccion de entidades en texto formal (noticias, wikipedia) con alta precision.
- Extraccion de entidades en texto informal (correos, chats, conversaciones) con rendimiento validado por el autor.
- Deteccion razonable de entidades que no comienzan en mayuscula, segun la model card.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; es exclusivamente un modelo discriminativo de etiquetado.
- No dispone de modo "thinking" ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Extraccion de entidades en pipelines de procesamiento de documentos: el modelo etiqueta personas, organizaciones y localizaciones en texto en ingles, adecuado para indexar contratos, articulos o informes antes de almacenarlos en un motor de busqueda.
- Enriquecimiento de CRM y correo electronico: gracias a la validacion del autor sobre datos de correo y chat, puede usarse para detectar remitentes, empresas y ubicaciones en hilos de email y poblar campos estructurados.
- Preprocesamiento para anonimizacion (PII): identificar nombres de personas y organizaciones en texto en ingles para posteriormente enmascararlos en flujos de cumplimiento y proteccion de datos.
- Analisis de noticias y monitorizacion de medios: extraer entidades de articulos para construir grafos de entidades, seguimiento de menciones y analisis de tendencias por organizacion o localizacion.
- Construccion de knowledge graphs: alimentar un grafo de conocimiento con tripletas sujeto-predicado-objeto tras combinar la salida NER con un extractor de relaciones.
- Deteccion de firmas en correos electronicos: el propio autor documenta un caso de uso en el que usa las salidas del modelo para entrenar un LSTM de deteccion de firmas, aprovechando la deteccion de nombres y organizaciones al final de los mensajes.
- Moderacion y clasificacion de contenido: identificar entidades mencionadas en comentarios o chats para aplicar reglas de negocio (por ejemplo, bloquear menciones a organizaciones concretas).

## Benchmarks y rendimiento

Resultados en el split de validacion de CoNLL-2003 (calculados sobre predicciones a nivel de token):

| Entidad | Precision | Recall | F1 |
|---|---|---|---|
| PER | 0,9914 | 0,9927 | 0,9920 |
| ORG | 0,9627 | 0,9661 | 0,9644 |
| LOC | 0,9795 | 0,9862 | 0,9828 |
| MISC | 0,9292 | 0,9262 | 0,9277 |
| Global | 0,9740 | 0,9766 | 0,9753 |

Resultados en un dataset privado del autor (correo, chat, discusion informal), calculados a nivel de palabra:

| Entidad | Precision | Recall | F1 |
|---|---|---|---|
| PER | 0,8823 | 0,9116 | 0,8967 |
| ORG | 0,7694 | 0,7292 | 0,7487 |
| LOC | 0,8619 | 0,7768 | 0,8171 |

Comparativa del mismo dataset privado frente a spaCy `en_core_web_trf-3.2.0`:

| Entidad | Modelo (F1) | spaCy (F1) |
|---|---|---|
| PER | 0,8967 | 0,8695 |
| ORG | 0,7487 | 0,6993 |
| LOC | 0,8171 | 0,7236 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que no aplican a un modelo de token classification.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo para pesos (355 M parametros x 4 bytes), mas memoria para activaciones y tokenizer; en la practica, entre 2 y 3 GB con batches pequenos.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB para pesos; entre 1 y 2 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia con ONNX.
- Opciones de despliegue: Hugging Face Transformers (`pipeline('ner')`), ONNX Runtime (hay pesos ONNX en el repo), TensorFlow, y servidores de inferencia compatibles con modelos de token classification. No se documentan pesos GGUF ni soporte especifico para llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 355 M, se espera un throughput alto en GPU y adecuado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm-project/roberta-large-ner-english | 354 M | No disponible | 0,9753 (validacion, nivel token) | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english (original) | 354 M | No disponible | 0,9753 (mismo checkpoint) | MIT | Hugging Face (cuenta personal) |
| spaCy en_core_web_trf-3.2.0 | No disponible | No disponible | No disponible en CoNLL-2003; F1 inferior en dataset privado del autor (PER 0,8695; ORG 0,6993; LOC 0,7236) | MIT (spaCy) | Paquete spaCy |
| dslim/bert-base-NER | No disponible en la informacion | No disponible | No disponible en la informacion | MIT | Hugging Face |

La comparativa directa con otros modelos NER en ingles no esta documentada en la informacion proporcionada mas alla de la comparacion con spaCy realizada por el autor. No se dispone de datos de `dslim/bert-base-NER` ni de otros modelos en la informacion recibida.

## Limitaciones y advertencias

- Solo soporta ingles; no debe usarse con texto en castellano u otros idiomas sin un modelo especifico.
- El esquema de etiquetas es simplificado (sin B-/I-), lo que puede dificultar la delimitacion exacta de entidades multi-token en algunos pipelines que esperan el formato BIO.
- Rendimiento notablemente inferior en datos informales que en CoNLL-2003: el F1 de ORG cae de 0,9644 a 0,7487 en el dataset privado del autor.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos y negativos en la deteccion de entidades, especialmente en MISC (F1 de 0,9277 en validacion).
- No se documentan sesgos especificos, pero al entrenarse sobre CoNLL-2003 (noticias en ingles de los anos 90) puede tener sesgos de dominio y de representacion geografica y cultural.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- Es una copia mantenida por vLLM para CI; el mantenimiento y las actualizaciones dependen del repositorio original, por lo que puede quedar desactualizada respecto a este.
- No es un modelo generativo: no admite instrucciones, tool calling, agentes ni razonamiento multi-paso.
- La longitud de contexto no se detalla en la model card; debe verificarse en la configuracion del modelo antes de usarlo con textos largos.

## Enlaces

- Hugging Face (copia vLLM): https://huggingface.co/vllm-project/roberta-large-ner-english
- Hugging Face (modelo original): https://huggingface.co/Jean-Baptiste/roberta-large-ner-english
- Dataset CoNLL-2003: https://huggingface.co/datasets/conll2003
- Articulo del autor sobre deteccion de firmas en correos con LSTM: https://medium.com/@jean-baptiste.polle/lstm-model-for-email-signature-detection-8e990384fefa
- Repositorio vLLM: https://github.com/vllm-project/vllm
