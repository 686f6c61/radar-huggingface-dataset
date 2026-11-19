# wuosyn/frejya-mood-reader

## Resumen

Frejya's mood reader es un clasificador de texto de muy pequeno tamano desarrollado por el usuario wuosyn y publicado en Hugging Face. Su funcion es leer una frase en ingles y asignarle una de once "animos" predefinidos: neutral, happy, excited, curious, thinking, proud, playful, shy, surprised, sad o sleepy. El modelo se emplea para seleccionar la expresion visual de Frejya, un companero de estudio basado en IA que se ejecuta en el navegador, de modo que el clasificador esta pensado para inferencia local en el cliente y no para despliegues en servidor.

Tecnicamente es un ajuste fino (fine-tuning) del checkpoint `google/bert_uncased_L-2_H-128_A-2`, un transformer BERT extremadamente reducido con solo 2 capas, 128 dimensiones ocultas y 4.387.339 parametros totales. El entrenamiento parte del dataset GoEmotions (comentarios de Reddit etiquetados con emociones) remapeado a las once categorias de animo, complementado con algunas lineas escritas a mano, y alcanza un 61,8 % de accuracy sobre 3.930 frases de test no vistas, frente al 40,9 % de un clasificador trivial que siempre responde "neutral".

Su relevancia es acotada pero clara: demuestra como un modelo de menos de 5 millones de parametros puede resolver una tarea de clasificacion de emociones con un coste computacional minimo y ejecutarse integramente en el navegador. No compite con modelos de proposito general, sino que cubre un nicho de UX conversacional ligera donde el tamano y la latencia importan mas que la precision absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), 2 capas, hidden size 128 |
| Parametros totales | 4.387.339 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del BERT base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/bert_uncased_L-2_H-128_A-2`, un BERT "tiny" con solo 2 capas de encoder y 128 dimensiones ocultas, lo que explica sus 4.387.339 parametros. Se trata de una arquitectura transformer encoder-only clasica, sin innovaciones como atencion lineal, decodificacion especulativa ni mecanismos MoE. La cabeza de clasificacion se ajusta para producir once clases correspondientes a los animos definidos por la aplicacion.

El entrenamiento parte del dataset `google-research-datasets/go_emotions`, que contiene comentarios de Reddit etiquetados con emociones finas; estas etiquetas se remapean a las once categorias de animo. A ese conjunto se anaden algunas lineas escritas manualmente y, tras un proceso de balanceo, se obtienen 22.240 ejemplos. El modelo se entrena durante 4 epocas. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con el tamano y el proposito del modelo.

## Capacidades

- Clasificacion de texto en once clases de animo: neutral, happy, excited, curious, thinking, proud, playful, shy, surprised, sad y sleepy.
- Inferencia en ingles exclusivamente.
- Ejecucion en navegador: la model card indica que corre dentro de la app de Frejya en el cliente, lo que implica que el modelo es lo bastante pequeno para entornos con recursos limitados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; el autor advierte explicitamente de que es mas debil en otros idiomas y en textos que no sean comentarios cortos de Reddit.

## Casos de uso

- Seleccion de expresion en un companero de estudio conversacional: el clasificador recibe la ultima frase del usuario y elige la animacion o el estado visual de Frejya (por ejemplo, "sleepy" si el usuario dice "i can't keep my eyes open any more"), aprovechando su baja latencia y su ejecucion en el navegador.
- Clasificacion ligera de sentimiento en formularios o encuestas: para textos cortos en ingles, el modelo puede etiquetar respuestas abiertas con un animo aproximado sin necesidad de infraestructura de servidor.
- Moderacion de tono en chats de soporte: como capa previa que detecta estados como "sad" o "surprised" y activa respuestas mas empaticas o escalado a un humano, dado su coste minimo.
- Etiquetado automatico de comentarios en prototipos de investigacion: util para preanotar pequenos corpus en ingles antes de una revision manual, con la advertencia de que la precision del 61,8 % exige validacion humana.
- Filtrado de resenas en apps moviles o webs estaticas: al caber en el cliente, permite clasificar resenas cortas en ingles sin enviar datos a un backend, lo que reduce costes y mejora la privacidad.
- Demo educativa de NLP: por su tamano reducido y su licencia Apache 2.0, sirve como ejemplo didactico de fine-tuning de BERT y de despliegue de clasificadores en el navegador.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Accuracy en test (3.930 frases no vistas) | 61,8 % |
| Baseline trivial (siempre "neutral") | 40,9 % |
| Ejemplos de entrenamiento (tras balanceo) | 22.240 |
| Epocas | 4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (4,39 M de parametros, aproximadamente 17,5 MB en fp32 y unos 8,8 MB en fp16).
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; el modelo esta disenado para ejecutarse en CPU o incluso en el navegador.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en dispositivos de bajos recursos.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportacion a ONNX o TensorFlow.js para ejecucion en navegador, y llama.cpp no aplica por no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wuosyn/frejya-mood-reader | 4,39 M | no disponible | Clasificacion de animo (11 clases, ingles) | Apache 2.0 | Hugging Face |
| google/bert_uncased_L-2_H-128_A-2 | 4,39 M | no disponible | Modelo base BERT (encoder) | Apache 2.0 | Hugging Face |
| DistilBERT base (uncased) | 66 M | 512 tokens | Clasificacion y extraccion de caracteristicas | Apache 2.0 | Hugging Face |
| RoBERTa base (GoEmotions) | 125 M | 512 tokens | Clasificacion de emociones (28 clases) | MIT | Hugging Face |

La comparativa se limita a modelos de la misma familia o proposito; no se dispone de datos de rendimiento comparables publicados para este checkpoint frente a alternativas especificas de clasificacion de emociones.

## Limitaciones y advertencias

- Entrenado exclusivamente con comentarios cortos de Reddit en ingles; su rendimiento cae en otros tipos de texto y en otros idiomas.
- No fue entrenado para reconocer ira, miedo ni asco, por lo que esas emociones se mapearan a alguna de las once clases disponibles de forma potencialmente erronea.
- Precision del 61,8 %: el autor recomienda tratar la salida como una pista, no como un hecho; existe riesgo de clasificacion erronea y de sobrerreaccion a frases ambiguas.
- Los animos son subjetivos; la etiqueta asignada puede no coincidir con la interpretacion humana.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no se documentan garantias ni soporte.
- No apto para decisiones criticas (moderacion automatizada de contenido sensible, diagnostico o evaluacion psicologica) sin supervision humana.
- Riesgo de sesgo heredado de GoEmotions y de Reddit como fuente de datos.
- No se documentan limitaciones de contexto especificas mas alla de las del BERT base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wuosyn/frejya-mood-reader
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Paper de GoEmotions (referencia del dataset): https://arxiv.org/abs/2005.00547
- Repositorio de BERT (referencia de la arquitectura): https://github.com/google-research/bert
