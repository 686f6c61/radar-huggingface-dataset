# vivek2477/gpt2-spam-classifier

## Resumen

GPT-2 Spam Classifier es un modelo de clasificacion binaria de texto derivado de GPT-2 small (124 M de parametros) mediante ajuste supervisado (supervised finetuning). Su unico cometido es etiquetar mensajes SMS como "spam" o "no spam". No genera texto: la cabeza de salida original de GPT-2 (50 257 clases) se sustituye por una capa lineal de 768 entradas y 2 salidas, y solo se entrenan el ultimo bloque transformer, la layer norm final y esa nueva cabeza. El autor es el usuario de HuggingFace `vivek2477` y el repositorio ocupa 0.5 GB con 0 descargas y 0 likes en el momento de redactar esta ficha.

El interes del modelo es fundamentalmente didactico y reproducible: es una implementacion del capitulo 6 de *Build a Large Language Model (From Scratch)*, de Sebastian Raschka, que muestra como reutilizar un modelo preentrenado para una tarea de clasificacion con muy pocos recursos (entrenamiento en una GPU T4 de Google Colab en unos 2 minutos). El conjunto de datos empleado es el SMS Spam Collection del UCI Machine Learning Repository, balanceado a 747 mensajes spam y 747 no spam.

Se trata de un artefacto pequeno, centrado en ingles y en el dominio SMS, sin licencia declarada ni pipeline publicado. No debe confundirse con un modelo de lenguaje conversacional: su salida es una de dos etiquetas y su ventana de contexto util en inferencia (120 tokens) viene impuesta por el max_length usado en el entrenamiento, no por el limite de 1024 tokens de la arquitectura GPT-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small) con cabeza de clasificacion lineal 768 -> 2 |
| Parametros totales | 124 M (aproximado, GPT-2 small) mas la nueva cabeza de 2 clases |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens por arquitectura; entrenado e inferido con max_length 120 |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | no disponible en la informacion proporcionada; el modelo base GPT-2 esta entrenado principalmente en ingles y el dataset es de SMS en ingles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`, `state_dict`); requiere reconstruir la clase `GPTModel` con el fichero `previous_chapters.py` |
| Vocabulario | 50 257 tokens (tokenizer BPE de GPT-2, via `tiktoken`) |
| Dimension de embedding | 768 |
| Capas / cabezas de atencion | 12 bloques transformer / 12 cabezas |
| Creado / actualizado | 2026-10-13 / 2026-10-13 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small sin modificaciones internas: 12 bloques transformer decoder-only, `emb_dim` de 768, 12 cabezas de atencion, vocabulario de 50 257 tokens y contexto maximo de 1024. La adaptacion a clasificacion consiste en congelar todos los pesos preentrenados y descongelar exclusivamente el ultimo bloque transformer, la layer norm final y una nueva capa `out_head` de 768 -> 2. Como GPT-2 procesa de izquierda a derecha, la prediccion se toma del vector del ultimo token de la secuencia, que actua como resumen de todo el mensaje.

El entrenamiento se realizo sobre el SMS Spam Collection balanceado (747 spam + 747 no spam), con particion 70 % entrenamiento / 10 % validacion / 20 % test y relleno (`padding`) con el token `<|endoftext|>` (id 50256) hasta una longitud fija. La configuracion es: perdida de entropia cruzada, optimizador AdamW, learning rate 5e-5, weight decay 0.1, batch size 8 y 5 epocas sobre una GPU T4. No se documenta RLHF, DPO ni ningun tipo de alineamiento; es un ajuste supervisado clasico de clasificacion. Tampoco se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia.

## Capacidades

- Clasificacion binaria de texto en dos clases: "spam" y "not spam".
- Funciona sobre mensajes cortos, típicamente SMS, con una longitud de entrada de hasta 120 tokens.
- Devuelve una etiqueta a partir del `argmax` de los logits de la ultima posicion (`indice 1` -> spam, `indice 0` -> no spam).
- No genera texto: la cabeza causal original esta reemplazada por una capa de clasificacion.
- No soporta `tool calling`, function calling ni uso como agente.
- No soporta razonamiento multi-paso ni modos de "thinking".
- No tiene capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue: no disponible; el modelo base y el dataset de ajuste son en ingles.
- Capacidad de generalizacion fuera del dominio SMS: no documentada.

## Casos de uso

- Filtrado de spam en pasarelas de SMS: el modelo se puede colocar delante de un gateway SMPP o de la API de un proveedor de mensajeria para descartar mensajes promocionales no deseados antes de que lleguen al usuario final. La latencia con un modelo de 124 M en GPU es minima y permite procesar en linea.
- Prefiltrado en formularios de contacto y comentarios web: ante la duda de si un texto entrante es un intento de estafa o publicidad, el clasificador aporta una primera senal binaria que se puede combinar con reglas y listas de bloqueo.
- Etiquetado automatico de corpus de mensajes: sirve para anotar grandes volumenes de SMS historicos con las categorias spam / no spam y asi construir datasets de mayor tamano para entrenar modelos posteriores.
- Base para ajuste fino en dominios vecinos: la misma receta (congelar GPT-2, sustituir `out_head`, reentrenar el ultimo bloque) se puede reproducir sobre correo electronico, resenas o tickets de soporte partiendo de estos pesos.
- Material docente y de investigacion reproducible: es un ejemplo de un solo script que demuestra el flujo completo de preentrenamiento, adaptacion de cabeza y ajuste supervisado, con curvas de perdida y exactitud incluidas en el repositorio.
- Deteccion de mensajes fraudulentos en campanas de verificacion: en entornos con consentimiento y de acuerdo con la normativa de proteccion de datos, puede separar mensajes legitimos de intentos de phishing o premios falsos antes de la revision humana.
- Modulo de triaje en pipelines de moderacion mas amplios: al ser un clasificador binario barato, encaja como primera etapa de un sistema en cascada en el que solo los casos dudosos pasan a un modelo mayor.

## Benchmarks y rendimiento

El autor solo publica exactitud (accuracy) sobre el conjunto de SMS Spam Collection balanceado. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar, ya que el modelo no es un modelo de lenguaje generativo.

| Conjunto | Exactitud |
|---|---|
| Entrenamiento | 97.21 % |
| Validacion | 98.66 % |
| Test | 95.33 % |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay datos de precision, recall, F1 ni matriz de confusion, lo que es relevante en una tarea desbalanceada en el mundo real aunque el conjunto de ajuste se haya balanceado artificialmente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.5 GB en fp32 y unos 0.25 GB en fp16 para los pesos de 124 M, mas el espacio de activaciones y el batch, por lo que con 1-2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. El autor entreno en una NVIDIA T4 de Google Colab (unos 2 minutos para 5 epocas), y una RTX 3060, RTX 4090, A100 o H100 son ampliamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna. Tambien se puede ejecutar en CPU, con un coste de latencia mayor pero perfectamente asumible para un modelo de este tamano.
- Opciones de despliegue: al tratarse de un clasificador con cabeza de 2 clases, no es compatible directamente con servidores de modelos generativos como vLLM, TGI, llama.cpp u Ollama. El despliegue natural es inferencia nativa en PyTorch, envolviendolo en un servicio propio con FastAPI, TorchServe o un contenedor dedicado.
- Latencia y throughput: no disponible. No se publican mediciones, aunque por el tamano del modelo se espera un throughput alto en GPU y moderado en CPU.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La comparacion siguiente se limita a caracteristicas estructurales conocidas; los datos de rendimiento de las alternativas no estan disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2 Spam Classifier (`vivek2477`) | 124 M | 1024 (entrenado a 120) | Clasificacion binaria spam / no spam | no disponible | HuggingFace, 0 descargas |
| GPT-2 small base | 124 M | 1024 | Generacion de texto causal | no disponible en esta ficha | Ampliamente disponible |
| Clasificadores tipo BERT / DistilBERT ajustados sobre SMS Spam Collection | 66 M - 110 M tipicamente | 512 tipicamente | Clasificacion binaria | variable segun el autor | Multiples variantes en HuggingFace |
| Clasificadores clasicos (Naive Bayes, SVM, regresion logistica) sobre TF-IDF | no aplica | no aplica | Clasificacion binaria | no aplica | Implementaciones de referencia ampliamente conocidas |

## Limitaciones y advertencias

- Conjunto de datos muy pequeno: 1494 mensajes balanceados. El riesgo de sobreajuste es alto y la exactitud de test (95.33 %) no se puede extrapolar a un trafico real de SMS sin una validacion propia.
- La exactitud de validacion (98.66 %) es superior a la de entrenamiento (97.21 %), una diferencia que sugiere que las particiones son pequenas y que las metricas tienen una varianza elevada.
- Sesgo de dominio: entrenado exclusivamente con SMS en ingles, probablemente con una distribucion de spam de una epoca y region concretas. El rendimiento en correo electronico, redes sociales u otros idiomas no esta documentado.
- No se publican precision, recall ni F1. En produccion, un falso negativo (spam clasificado como legitimo) puede tener un coste muy distinto al de un falso positivo, por lo que la exactitud aislada es insuficiente.
- Dependencia del `max_length`: el valor debe coincidir con el usado en entrenamiento (120). Si se cambia, el relleno y el truncado alteran las predicciones.
- Detalle de implementacion fragil: la etiqueta se decide con `argmax` sobre la ultima posicion y se asume que el indice 1 corresponde a spam. Cualquier reordenacion de clases invalida el resultado.
- Requiere reconstruir la arquitectura manualmente: los pesos se cargan en un objeto `GPTModel` definido en `previous_chapters.py`, no en una clase estandar de `transformers`. Esto complica su integracion con ecosistemas habituales.
- Licencia no disponible: no se puede asumir uso comercial sin aclararlo previamente con el autor. La ausencia de licencia es un riesgo legal relevante.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes, sin pipeline declarado, sin idiomas declarados y sin model card completa.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con confianza alta, al no exponerse calibracion ni umbrales.
- Tratamiento de datos personales: procesar SMS reales implica datos personales; hay que cumplir el RGPD y las condiciones del proveedor de mensajeria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vivek2477/gpt2-spam-classifier
- Dataset SMS Spam Collection (UCI): https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- Libro de referencia, *Build a Large Language Model (From Scratch)*, de Sebastian Raschka (capitulo 6)
- Paper de GPT-2, *Language Models are Unsupervised Multitask Learners* (Radford et al., OpenAI)
- Repositorio de tiktoken, tokenizer usado en el codigo de ejemplo: https://github.com/openai/tiktoken
