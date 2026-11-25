# wuosyn/freya-mood-reader

## Resumen

Freya's mood reader es un clasificador de texto de una sola etiqueta que asigna a una frase corta una de once "moods" o estados de animo predefinidos (neutral, happy, excited, curious, thinking, proud, playful, shy, surprised, sad, sleepy). Lo desarrolla el usuario wuosyn como componente interno de Freya, un asistente de estudio basado en IA que se ejecuta en el navegador, y su funcion es elegir la expresion visual del personaje segun el tono del mensaje del usuario.

Tecnicamente es un fine-tuning del checkpoint `google/bert_uncased_L-2_H-128_A-2`, un BERT extremadamente pequeno (solo 2 capas, hidden size 128 y 2 cabezas de atencion) con 4.387.339 parametros totales. El modelo parte de una arquitectura transformer encoder de tipo BERT sin distincion de mayusculas, esta entrenado exclusivamente en ingles y se publica bajo licencia Apache 2.0. Su interes practico esta en el extremo opuesto a los LLM: es un clasificador de 4,4 millones de parametros pensado para inferencia en cliente, con un coste computacional minimo.

El modelo se entreno sobre GoEmotions (comentarios de Reddit etiquetados con emociones) remapeados a las once categorias propias, mas algunas lineas escritas a mano, hasta 22.240 ejemplos balanceados durante 4 epocas. El autor reporta un 61,8 % de accuracy sobre 3.930 frases de test no vistas, frente al 40,9 % de un baseline trivial que siempre responde "neutral". No se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (uncased), 2 capas, hidden size 128, 2 cabezas de atencion |
| Parametros totales | 4.387.339 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el BERT base, tipicamente 512 tokens; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/bert_uncased_L-2_H-128_A-2`, una version reducida de BERT con solo 2 capas de encoder, dimension oculta de 128 y 2 cabezas de atencion. Sobre ese backbone se anade una cabeza de clasificacion para once clases. No se documentan innovaciones arquitectonicas adicionales: es un clasificador encoder-only convencional, sin atencion lineal, sin decodificacion especulativa ni componentes MoE.

El entrenamiento parte del dataset GoEmotions (comentarios de Reddit etiquetados con emociones), cuyas etiquetas se remapean a las once moods del asistente, y se complementa con algunas lineas escritas a mano. Tras balancear el conjunto quedan 22.240 ejemplos, sobre los que se entrena durante 4 epocas. No se especifica en la informacion disponible si hubo RLHF, DPO ni otras tecnicas de alineacion, ni el numero exacto de tokens de entrenamiento mas alla del recuento de ejemplos.

## Capacidades

- Clasificacion de texto de una sola etiqueta entre once clases de estado de animo: neutral, happy, excited, curious, thinking, proud, playful, shy, surprised, sad, sleepy.
- Inferencia en navegador: el tamano (4,4 M de parametros) permite ejecutarlo en cliente dentro de la app de Freya.
- Deteccion de tono en frases cortas en ingles, orientada a seleccionar la expresion del personaje.
- Integracion sencilla via `transformers.pipeline("text-classification")`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Seleccion de expresion en un asistente conversacional: el clasificador recibe el mensaje del usuario y devuelve la mood que dispara la animacion o el avatar correspondiente en Freya; su tamano permite ejecutarlo en el navegador sin llamadas al servidor.
- Enrutado ligero de tono en un chatbot: usar la etiqueta predicha para decidir si derivar a un flujo de soporte emocional, a uno de refuerzo positivo o a una respuesta neutra.
- Etiquetado de feedback de usuarios: procesar comentarios cortos en ingles y agregar la distribucion de moods para detectar picos de frustracion o entusiasmo.
- Moderacion asistida de tono: marcar mensajes con etiquetas "sad" o "surprised" para revision humana en comunidades, sin pretender detectar toxicidad (el modelo no aprendio anger, fear ni disgust).
- Analisis de sentimiento granular en redes: clasificar comentarios tipo Reddit en once categorias mas finas que positivo/negativo para estudios de opinion.
- Prototipado rapido en edge: servir el modelo con ONNX o en el navegador para demos de interaccion afectiva sin infraestructura GPU.
- Componente de un pipeline mayor: usar la salida como feature adicional (por ejemplo, un embedding de mood) para un LLM que genere la respuesta final.

## Benchmarks y rendimiento

| Metrica | Freya's mood reader | Baseline trivial ("neutral" siempre) |
|---|---|---|
| Accuracy en test (3.930 frases no vistas) | 61,8 % | 40,9 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (4,4 M de parametros); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en navegador. Cualquier GPU consumer (GTX 1050 o superior) es mas que suficiente.
- Cabe en consumer GPU: si, en todas, y tambien en movil y navegador.
- Opciones de despliegue: `transformers` (pipeline), exportacion a ONNX para ejecucion en navegador o edge, y servidores de inferencia ligeros. No se documentan variantes GGUF ni integracion con Ollama o vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| wuosyn/freya-mood-reader | 4,4 M | no disponible | en | Apache 2.0 | Clasificacion de 11 moods |
| google/bert_uncased_L-2_H-128_A-2 (base) | 4,4 M | 512 (tipico) | en | Apache 2.0 | Modelo base sin fine-tuning |
| DistilBERT-base-uncased | 66 M | 512 | en | Apache 2.0 | Clasificacion generica, mayor capacidad |
| Clasificadores sobre GoEmotions (p. ej. RoBERTa-base fine-tuned) | 125 M | 512 | en | MIT/Apache segun variante | Clasificacion de 27 emociones |

No se dispone de datos de rendimiento comparativo publicados para este modelo frente a las alternativas.

## Limitaciones y advertencias

- Entrenado solo con comentarios cortos de Reddit en ingles: rinde peor en otros tipos de texto y en otros idiomas.
- No aprendio las emociones anger, fear ni disgust; no debe usarse para deteccion de toxicidad o riesgo.
- Las moods son subjetivas: el autor recomienda tratar la salida como una pista, no como un hecho.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si de falsos positivos y etiquetas erroneas en frases ambiguas.
- Accuracy del 61,8 %: insuficiente para decisiones automatizadas de alto impacto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del dataset GoEmotions y del modelo base.
- Sin datos publicados sobre sesgos demograficos ni sobre calibracion de probabilidades.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso en produccion ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wuosyn/freya-mood-reader
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
