# vishwajeet456/DistilBERTforITSupport

## Resumen

DistilBERTforITSupport es un modelo de clasificación de texto en inglés obtenido por fine-tuning de `distilbert-base-uncased` sobre preguntas reales de soporte técnico. Lo publica Vishwajeet Adkine (usuario `vishwajeet456`) en Hugging Face y su tarea es el enrutado de tickets de IT hacia cinco colas: Linux, Apple, Android, Server & Network y Security. La entrada es el título y el cuerpo de la pregunta, truncados a 256 tokens.

El modelo parte de DistilBERT, un transformer encoder de 6 capas y 66 millones de parámetros destilado de BERT-base, con lo que conserva aproximadamente el 97 % del rendimiento del modelo original a la mitad de coste computacional. El autor reporta 0,893 de accuracy y 0,8927 de macro-F1 en el conjunto de test reservado, cifras prácticamente idénticas a las de un baseline TF-IDF con regresión logística (0,8940 / 0,8941).

Su relevancia es doble: por un lado sirve como prototipo de enrutado automático de incidencias; por otro, es un ejemplo poco habitual de model card honesta, ya que el propio autor advierte de que el transformer no supera al baseline clásico y de que las etiquetas son comunidades de Stack Exchange, no categorías de ticket anotadas a mano. No está pensado para producción sin una evaluación previa sobre los tickets reales de cada organización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base), 6 capas |
| Parametros totales | 66 millones (heredados de `distilbert-base-uncased`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens maximos del modelo base; entrenado con truncado a 256 tokens |
| Tipos de cuantizacion | no disponible (compatible con cuantizacion dinamica de PyTorch y con GGUF via conversion, no documentado por el autor) |
| Idiomas soportados | ingles (`en`) |
| Licencia | `other` (pesos marcados como `other`; modelo base Apache-2.0; datos de entrenamiento Stack Exchange CC BY-SA con dataset card no comercial) |
| Formato de pesos | safetensors (formato estandar de `transformers`; tamano del repo 0.0 GB segun Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder de 6 capas, 12 cabezas de atencion y 768 dimensiones ocultas, con 66 millones de parametros, destilado de BERT-base mediante distillation loss sobre las salidas del modelo profesor. Sobre esa base se anade una cabeza de clasificacion lineal con 5 salidas para la tarea de enrutado.

El entrenamiento se realizo con el `Trainer` de Hugging Face: 3 epocas, batch size 32, learning rate 2e-5, 10 % de warm-up, weight decay 0,01, longitud maxima de 256 tokens, fp16 y seleccion del mejor checkpoint por macro-F1 de validacion. Los datos provienen del dataset `flax-sentence-embeddings/stackexchange_titlebody_best_voted_answer_jsonl`, tomando hasta 4.000 preguntas por clase de cinco comunidades (Ask Ubuntu, Ask Different, Android Enthusiasts, Server Fault e Information Security), limpiadas, deduplicadas y divididas 80/10/10 de forma estratificada. La etiqueta es la comunidad donde se publico la pregunta, no una categoria anotada manualmente. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de clasificacion.

## Capacidades

- Clasificacion de texto de etiqueta unica en 5 categorias: Linux, Apple, Android, Server & Network y Security.
- Procesamiento conjunto de titulo y cuerpo de la pregunta, con truncado a 256 tokens.
- Inferencia rapida y de bajo coste gracias al tamano reducido del encoder (66 M de parametros).
- Integracion directa con el pipeline `text-classification` de `transformers`, incluido `top_k=None` para obtener la distribucion completa de probabilidades.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue: no, solo ingles.

## Casos de uso

- Enrutado de tickets en un service desk: el modelo recibe titulo y cuerpo de la incidencia y devuelve la cola mas probable entre las cinco disponibles, lo que permite preasignar el ticket antes de que lo vea un operador humano.
- Triage asistido con umbral de confianza: usando `top_k=None` se obtiene la distribucion de probabilidades y se derivan a revision manual los casos con confianza baja, tal como recomienda el propio autor.
- Clasificacion de preguntas en foros y comunidades tecnicas: util para etiquetar automaticamente hilos de soporte de estilo Stack Exchange y dirigirlos al subforo adecuado.
- Filtrado previo en pipelines de atencion al cliente: descartar o redirigir consultas que no encajan en las cinco categorias antes de enviarlas a un modelo generativo de mayor coste.
- Baseline de referencia en proyectos de NLP: sirve como punto de partida reproducible para comparar con modelos mayores o con clasificadores clasicos antes de invertir en infraestructura.
- Material didactico y de evaluacion: ejemplo completo de fine-tuning de un transformer sobre texto real con baseline honesto, util para cursos y para revisar buenas practicas de model cards.
- Prototipado rapido en CPU: al ser un encoder de 66 M de parametros, se puede desplegar en una maquina sin GPU para validar la viabilidad de un sistema de enrutado antes de escalar.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test reservado (10 % de los datos):

| Modelo | Accuracy | Macro-F1 |
|---|---|---|
| TF-IDF + regresion logistica | 0,8940 | 0,8941 |
| TF-IDF con palabras de marca enmascaradas | 0,8605 | 0,8604 |
| DistilBERT fine-tuned (este modelo) | 0,8930 | 0,8927 |

El experimento de enmascarado de marcas no se ejecuto sobre DistilBERT, solo sobre el baseline. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible, algo logico al tratarse de un clasificador de dominio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66 M de parametros, unos 265 MB de pesos) y en torno a 150 MB en fp16 o int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. Funciona en CPU con latencias de milisegundos por muestra; para lotes grandes, cualquier GPU moderna (RTX 3060 en adelante, T4, A10) ofrece throughput sobrado.
- Cabe en GPU consumer: si, en todas las del mercado, incluidas integradas.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (soportado por tag), Hugging Face Inference Endpoints, ONNX Runtime, TorchScript y conversion a GGUF para llama.cpp u Ollama (no documentada por el autor).
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU para lotes de cientos de muestras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DistilBERTforITSupport (este) | 66 M | 512 (entrenado a 256) | Clasificacion en 5 clases IT | `other` | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 | Modelo base general, sin cabeza de clasificacion IT | Apache-2.0 | Hugging Face |
| Baseline TF-IDF + regresion logistica | no aplica (bolsa de palabras) | no aplica | Clasificacion en 5 clases IT | no disponible | Implementacion propia |
| BERT-base-uncased | 110 M | 512 | Modelo base general | Apache-2.0 | Hugging Face |

La comparativa relevante es con el baseline clasico, que iguala en accuracy al transformer con un coste computacional mucho menor, y con el modelo base sin fine-tuning, que no resuelve la tarea. No se dispone de datos de otros clasificadores especificos de enrutado de tickets publicos para comparar directamente.

## Limitaciones y advertencias

- Las etiquetas corresponden a comunidades de Stack Exchange, no a categorias de ticket anotadas; algunas preguntas encajan en varias clases (por ejemplo, un problema de VPN en macOS), lo que limita el techo de accuracy alcanzable.
- El estilo de escritura de Stack Exchange difiere del de los tickets internos (mas cortos, informales, multilingues y con plantillas); es previsible una caida de rendimiento en tickets reales de empresa.
- Solo cubre cinco clases: no hay categorias de Windows, cloud, bases de datos ni hardware.
- Solo ingles; no procesa texto en castellano ni en otros idiomas.
- Refleja los sesgos demograficos y tematicos de los usuarios de Stack Exchange.
- El autor recomienda enviar a triaje humano las predicciones de baja confianza.
- Licencia `other`: los pesos no son Apache-2.0 pese a que el modelo base si lo sea, porque los datos de entrenamiento son CC BY-SA y la dataset card indica licencia no comercial. Hay que revisar los terminos y mantener la atribucion antes de cualquier uso comercial.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en entradas fuera de dominio.
- No debe usarse para decisiones automatizadas sobre personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishwajeet456/DistilBERTforITSupport
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/flax-sentence-embeddings/stackexchange_titlebody_best_voted_answer_jsonl
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de BERT (paper): https://arxiv.org/abs/1810.04805
- Libreria transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
