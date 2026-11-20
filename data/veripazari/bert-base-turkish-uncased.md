# veripazari/bert-base-turkish-uncased

## Resumen

BERTurk uncased es un modelo de lenguaje encoder-only basado en la arquitectura BERT, entrenado especificamente para turco por el equipo MDZ de la Biblioteca Estatal de Baviera (dbmdz). La ficha analizada corresponde a una re-subida en el repositorio `veripazari/bert-base-turkish-uncased`, que archiva y documenta en turco el modelo original `dbmdz/bert-base-turkish-uncased` manteniendo licencia MIT y metadatos. No es un modelo generativo: es un encoder de representaciones enmascaradas (masked language modeling) pensado para tareas de comprension, clasificacion y etiquetado de secuencias.

El modelo emplea la arquitectura BERT-base estandar (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) con un vocabulario especifico para turco y tokenizacion uncased. Se entreno sobre un corpus de 35 GB que suma 44.049.766.662 tokens, combinando una version filtrada y segmentada en frases de OSCAR, un volcado reciente de Wikipedia, varios corpus OPUS y un corpus privado cedido por Kemal Oflazer. El entrenamiento se ejecuto durante 2 millones de pasos sobre un TPU v3-8 con soporte de Google TFRC.

Su relevancia actual es la de un backbone de referencia para NLP en turco: sirve como base para fine-tuning en NER, POS tagging, clasificacion de texto, analisis de sentimiento y recuperacion semantica en un idioma con relativamente pocos modelos abiertos de calidad. Al ser un encoder de 110 millones de parametros, es ligero, desplegable en CPU y compatible con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base) |
| Parametros totales | 110 millones (aproximado, configuracion BERT-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (estandar BERT-base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision completa; admite cuantizacion dinamica via herramientas externas) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); la model card indica que solo hay pesos compatibles con PyTorch-Transformers y que los checkpoints TensorFlow no estan publicados |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base canonica: pila de 12 capas de transformer encoder con atencion multi-cabeza bidireccional, 768 dimensiones ocultas y aproximadamente 110 millones de parametros. La tokenizacion es uncased (sin distincion de mayusculas/minusculas), con un vocabulario especifico para turco derivado del corpus de entrenamiento. Al ser un encoder bidireccional, no dispone de mecanismo de generacion autorregresiva ni de decodificacion especulativa.

El preentrenamiento se realizo con el objetivo estandar de masked language modeling sobre un corpus de 35 GB y 44.049.766.662 tokens. La composicion del dataset incluye una version filtrada y dividida en frases de OSCAR, un volcado actual de Wikipedia en turco, varios corpus OPUS y un corpus privado proporcionado por Kemal Oflazer. El entrenamiento se ejecuto durante 2 millones de pasos en un TPU v3-8 con acceso a Google TensorFlow Research Cloud (TFRC). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un encoder de esta generacion.

## Capacidades

- Representaciones contextuales bidireccionales del turco, utilizables como backbone para fine-tuning supervisado.
- Clasificacion de secuencias (sentimiento, topicos, deteccion de spam, moderacion).
- Etiquetado de tokens: NER (reconocimiento de entidades nombradas) y POS tagging, con resultados publicados en el repositorio `stefan-it/turkish-bert`.
- Similitud semantica y recuperacion de frases mediante embeddings pooled (CLS) o mean pooling.
- Respuesta a preguntas extractiva (extractive QA) tras fine-tuning sobre SQuAD-like en turco.
- No soporta generacion de texto libre, tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo causal.
- Capacidad multilingue limitada al turco; no se documenta transferencia a otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Reconocimiento de entidades nombradas en turco: fine-tuning sobre el corpus de referencia del proyecto `turkish-bert` para extraer personas, organizaciones y localizaciones en noticias y documentos; el modelo parte de representaciones ya adaptadas al turco, lo que reduce el volumen de datos anotados necesario.
- Clasificacion de sentimiento en resenas y redes sociales: se anade una cabeza de clasificacion sobre el token CLS y se entrena con un dataset etiquetado; el contexto de 512 tokens cubre la mayoria de resenas y comentarios.
- Moderacion de contenido y deteccion de spam: clasificacion binaria o multietiqueta sobre mensajes; el bajo coste de inferencia (110M de parametros) permite procesar grandes volumenes en CPU.
- Busqueda semantica en catalogo documental: generar embeddings de frases con mean pooling y construir un indice vectorial para recuperacion en turco, por ejemplo en bibliotecas digitales o bases de conocimiento interno.
- Etiquetado morfosintactico (POS tagging): fine-tuning token a token para pipelines de analisis linguistico, lematizacion o preprocesado de corpus turcos, aprovechando la tokenizacion uncased para reducir dispersion.
- Respuesta a preguntas extractiva sobre documentacion: fine-tuning estilo SQuAD para localizar la respuesta dentro de un parrafo de hasta 512 tokens, util en asistentes de soporte con base documental cerrada.
- Filtrado y deduplicacion de corpus: uso de embeddings para detectar near-duplicates y clasificar calidad de texto en pipelines de curacion de datos turcos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio `stefan-it/turkish-bert` para resultados de PoS tagging y NER, pero no incluye cifras concretas (F1, accuracy) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 440 MB para los pesos (110M parametros x 4 bytes) mas overhead de activaciones, en torno a 1-2 GB con batch pequeno.
- En FP16: aproximadamente 220 MB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; una NVIDIA T4, RTX 3060 o superior ofrece throughput alto, pero el modelo funciona en CPU para inferencia en produccion de bajo volumen.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3050, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), TorchScript/ONNX Runtime, FastAPI + Uvicorn para servicio REST, y conversión a GGUF no documentada oficialmente para llama.cpp (no es un modelo generativo, por lo que el ecosistema GGUF/Ollama no es el objetivo natural).
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera un throughput de decenas a cientos de frases por segundo con batch, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `veripazari/bert-base-turkish-uncased` (copia de dbmdz) | ~110M | 512 | Turco | MIT | Hugging Face (repositorio de archivo) |
| `dbmdz/bert-base-turkish-cased` | ~110M | 512 | Turco | MIT | Hugging Face (original) |
| `dbmdz/bert-base-turkish-uncased` | ~110M | 512 | Turco | MIT | Hugging Face (original) |
| `xlm-roberta-base` | ~278M | 512 | 100 idiomas (incl. turco) | MIT | Hugging Face |

La diferencia principal frente a las variantes cased es la tokenizacion: la version uncased normaliza mayusculas, lo que simplifica el preprocesado pero puede perder informacion en tareas sensibles a capitalizacion (nombres propios, siglas). Frente a `xlm-roberta-base`, BERTurk ofrece un vocabulario mas especifico para turco y menor coste computacional, a cambio de no cubrir otros idiomas. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un encoder, no un modelo generativo: no puede usarse para chat, generacion de texto, tool calling ni agentes.
- Entrenado exclusivamente en turco; su uso en otros idiomas producira representaciones pobres.
- Ventana de contexto de 512 tokens: no apta para documentos largos sin truncado o segmentacion previa.
- Riesgo de sesgos presente en el corpus de origen (OSCAR, Wikipedia, OPUS): puede reflejar sesgos de genero, etnicos o geopoliticos del contenido web turco.
- La tokenizacion uncased pierde informacion de mayusculas, lo que puede degradar tareas de NER en nombres propios o siglas.
- La model card original no documenta evaluaciones de sesgo ni de robustez; no hay garantias de comportamiento en dominios de nicho (legal, medico, tecnico).
- El repositorio analizado es una re-subida de archivo con 0 descargas y 0 likes; para produccion se recomienda usar el repositorio original `dbmdz/bert-base-turkish-uncased`, que recibe mantenimiento y actualizaciones.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia del corpus de entrenamiento (OSCAR, OPUS) por si hubiera restricciones subyacentes en los datos originales.
- No se publican checkpoints TensorFlow en este repositorio; solo pesos PyTorch.

## Enlaces

- Repositorio analizado: https://huggingface.co/veripazari/bert-base-turkish-uncased
- Modelo original: https://huggingface.co/dbmdz/bert-base-turkish-uncased
- Repositorio de resultados (PoS, NER): https://github.com/stefan-it/turkish-bert
- Organizacion dbmdz en Hugging Face: https://huggingface.co/dbmdz
- Issues del proyecto BERT de dbmdz: https://github.com/dbmdz/berts/issues/new
- Corpus OSCAR: https://traces1.inria.fr/oscar/
- Corpus OPUS: http://opus.nlpl.eu/
- Plataforma que aloja la copia: https://veripazari.com.tr
