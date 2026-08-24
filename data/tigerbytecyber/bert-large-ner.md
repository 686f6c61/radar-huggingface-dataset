# TigerByteCyber/bert-large-NER

## Resumen

bert-large-NER es un modelo de reconocimiento de entidades nombradas (NER) basado en la arquitectura BERT large, fine-tuneado sobre el conjunto de datos CoNLL-2003 en inglés. El modelo original fue desarrollado por dslim y esta versión concreta, publicada por TigerByteCyber, es una re-subida que mantiene las mismas características y pesos. Está diseñado para clasificar cada token en una de cuatro categorías de entidad: persona (PER), organización (ORG), ubicación (LOC) y miscelánea (MISC), utilizando el esquema de etiquetado BIO.

Con 333,6 millones de parámetros, este modelo ofrece un rendimiento cercano al estado del arte en NER para inglés, alcanzando una F1 de 0,919 en el conjunto de test de CoNLL-2003. Su relevancia actual radica en que sigue siendo una opción sólida y ligera para tareas de extracción de entidades en producción, especialmente cuando se necesita un modelo de encoder puro sin dependencias de generación. Aunque no incorpora capacidades modernas como tool calling o ventanas de contexto largas, su madurez y licencia MIT lo convierten en una alternativa fiable para pipelines de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (encoder transformer, 24 capas, 1024 dimensiones ocultas, 16 cabezas de atencion) |
| Parametros totales | 333.588.489 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (tipico de BERT large) |
| Tipos de cuantizacion | no disponible (no se especifican en la informacion) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en BERT large, un transformer encoder bidireccional preentrenado con 24 capas, 1024 unidades ocultas y 16 cabezas de atencion. Sobre esta base se realizo un fine-tuning supervisado para la tarea de clasificacion de tokens (token classification) utilizando el dataset CoNLL-2003 en su version inglesa, que contiene 14.987 oraciones de entrenamiento extraidas de articulos de noticias de Reuters. El etiquetado sigue el esquema BIO, distinguiendo el inicio (B-) y la continuacion (I-) de cada entidad, ademas de la clase O para tokens fuera de entidad.

El entrenamiento se llevo a cabo en una unica GPU NVIDIA V100, empleando los hiperparametros recomendados en el articulo original de BERT. No se aplicaron tecnicas de RLHF ni DPO; se trata de un fine-tuning clasico con funcion de perdida de entropia cruzada sobre las etiquetas de cada token. No se documentan innovaciones tecnicas adicionales mas alla de la arquitectura BERT estandar.

## Capacidades

- Reconocimiento de entidades nombradas en ingles para cuatro tipos: persona (PER), organizacion (ORG), ubicacion (LOC) y miscelanea (MISC).
- Clasificacion de tokens con etiquetas BIO, permitiendo identificar entidades consecutivas del mismo tipo.
- Integracion sencilla con el pipeline de Hugging Face Transformers para NER.
- Soporte de inferencia en multiples frameworks gracias a los pesos exportados a PyTorch, TensorFlow, JAX y ONNX.
- No dispone de capacidades de generacion de texto, tool calling, agentes, vision ni audio.
- Limitado al idioma ingles; no es multilingue.

## Casos de uso

- Extraccion de entidades en articulos de noticias: el modelo puede identificar personas, organizaciones y lugares mencionados en textos periodisticos, facilitando tareas de indexacion y analisis de contenido.
- Preprocesamiento para sistemas de busqueda semantica: al extraer entidades de documentos, se pueden construir indices basados en entidades para mejorar la recuperacion de informacion.
- Analisis de documentos legales: identificacion de partes involucradas, organizaciones y jurisdicciones en contratos o sentencias, siempre que el texto este en ingles y el dominio sea similar al de noticias.
- Enriquecimiento de bases de datos de clientes: extraccion de nombres de empresas y personas a partir de correos electronicos o formularios para completar registros.
- Monitorizacion de redes sociales: deteccion de menciones de marcas, personas o lugares en publicaciones en ingles para analisis de opinion o alertas.
- Construccion de grafos de conocimiento: el modelo puede alimentar pipelines que convierten entidades extraidas en nodos y relaciones, util para ontologias en dominios especificos.

## Benchmarks y rendimiento

Los resultados oficiales declarados en el model-index de Hugging Face para el conjunto de test de CoNLL-2003 son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9032 |
| Precision | 0,9200 |
| Recall | 0,9194 |
| F1 | 0,9197 |
| Loss | 0,5085 |

Adicionalmente, la model card original reporta en su tabla de evaluacion unos valores ligeramente distintos para el conjunto de test: F1 de 91,7, precision de 91,2 y recall de 92,3. Estas diferencias pueden deberse a variaciones en el redondeo o en el metodo de calculo. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32, el modelo ocupa aproximadamente 1,33 GB (333,6 millones de parametros x 4 bytes). En FP16 se reduce a unos 0,67 GB, y con cuantizacion de 8 bits a unos 0,33 GB, aunque no se ofrecen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32 con batch pequeno. Tarjetas como NVIDIA GTX 1060, RTX 2060 o superiores son suficientes. Para despliegues con mayor throughput, se recomienda una V100, A100 o similar.
- Es compatible con GPUs de consumo: si, cabe en tarjetas como RTX 3060, RTX 4070, etc., siempre que se gestione la memoria.
- Opciones de despliegue: se puede servir con Hug Face Transformers, ONNX Runtime, TensorFlow Serving o mediante frameworks como vLLM (aunque no es optimo para encoders puros). Tambien es posible exportar a formato ONNX para inferencia en CPU.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, la inferencia sobre una oracion de 128 tokens suele completarse en menos de 10 ms, pero estos valores dependen del hardware y del batch.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos NER en la informacion proporcionada. Como referencia cualitativa, se puede comparar con:

- **dslim/bert-base-NER**: version mas pequena del mismo autor, con 108 millones de parametros, que ofrece un rendimiento inferior (F1 alrededor de 89-90 en CoNLL-2003) pero con menor coste computacional y de memoria.
- **RoBERTa-large-NER**: alternativa basada en RoBERTa large, que suele lograr resultados ligeramente superiores en NER, pero con una licencia y disponibilidad diferentes. No se incluyen datos concretos por falta de informacion.

Para una comparacion cuantitativa rigurosa, se recomienda consultar los benchmarks publicados en el leaderboard de Hugging Face para la tarea de token classification.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con articulos de noticias de Reuters de la epoca de CoNLL-2003, por lo que su generalizacion a otros dominios (textos cientificos, conversaciones informales, redes sociales) puede ser limitada.
- Puede etiquetar erroneamente subword tokens como entidades completas, requiriendo post-procesamiento para fusionar fragmentos.
- Solo soporta ingles; no es util para textos en otros idiomas.
- No dispone de mecanismos de control de alucinaciones, aunque al ser un modelo de clasificacion, el riesgo de generar texto inventado es bajo.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe ser consciente de los sesgos inherentes al dataset de entrenamiento.
- No se han publicado resultados de cuantizacion ni de rendimiento en entornos de produccion especificos.

## Enlaces

- Repositorio de Hugging Face de esta version: https://huggingface.co/TigerByteCyber/bert-large-NER
- Modelo original de dslim: https://huggingface.co/dslim/bert-large-NER
- Articulo de BERT: https://arxiv.org/abs/1810.04805
- Paper de CoNLL-2003: https://www.aclweb.org/anthology/W03-0419
