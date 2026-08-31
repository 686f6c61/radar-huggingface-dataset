# tadiecool29/STL-Davlan-bert-base-multilingual-finetuned-amharic-stance

## Resumen

STL-Davlan-bert-base-multilingual-finetuned-amharic-stance es un modelo de clasificación de postura (stance detection) en amhárico, desarrollado por el usuario tadiecool29. Se trata de un ajuste fino (fine-tuning) del modelo Davlan/bert-base-multilingual-cased-finetuned-amharic, que a su vez es una versión de BERT multilingüe adaptada al amhárico con un vocabulario específico para esta lengua. El modelo está diseñado para determinar la postura de un texto (a favor, en contra o neutral) respecto a un objetivo concreto, una tarea fundamental en el análisis de opiniones y la monitorización de redes sociales.

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers) con 177,8 millones de parámetros, y su contexto máximo es de 512 tokens, el estándar de BERT. El ajuste fino se realizó con un conjunto de datos no especificado, y los resultados de evaluación muestran una precisión de postura de 0,70 y un F1 de 0,70. Aunque la ficha técnica es escasa en detalles, el modelo representa un intento de abordar la detección de postura en un idioma de bajos recursos como el amhárico, lo que lo hace relevante para la investigación en PLN multilingüe y para aplicaciones centradas en la región de Etiopía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder) |
| Parametros totales | 177.856.516 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Amharico (entrenado especificamente para esta lengua) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT original, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion. La base es bert-base-multilingual-cased, que fue adaptada al amharico por Davlan reemplazando el vocabulario multilingue por uno especifico del amharico y ajustando el modelo con texto en este idioma. Sobre esta base, el autor del modelo STL realizo un ajuste fino adicional para la tarea de deteccion de postura.

El entrenamiento se realizo con un conjunto de datos no documentado, durante 10 epocas, con un tamaño de lote de 16 para entrenamiento y 32 para evaluacion. Se utilizo el optimizador AdamW con una tasa de aprendizaje de 1e-05, un programador de tasa de aprendizaje coseno con 300 pasos de calentamiento, y entrenamiento con precision mixta (Native AMP). La perdida de validacion final fue de 1,5265, con una precision de postura de 0,7004, recall de 0,7031, F1 de 0,7016 y exactitud de 0,6933. No se menciona el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion de postura (stance detection): el modelo determina si un texto expresa una postura a favor, en contra o neutral respecto a un objetivo dado.
- Comprension del lenguaje en amharico: al estar basado en un modelo ajustado especificamente para esta lengua, ofrece mejor rendimiento que el BERT multilingue generico en tareas de PLN en amharico.
- Procesamiento de texto de longitud media: con un contexto de 512 tokens, puede manejar parrafos y textos de extension moderada.
- Inferencia de clasificacion de secuencia: adecuado para tareas de clasificacion de textos completos, no para generacion de texto.
- Compatible con la libreria transformers: se puede cargar con la API estandar de Hugging Face para clasificacion de secuencias.
- No soporta tool calling, agentes, vision ni audio: es un modelo exclusivamente de texto y clasificacion.

## Casos de uso

- Monitorizacion de redes sociales en amharico: el modelo puede analizar publicaciones de Twitter, Facebook o foros para detectar la postura de los usuarios sobre temas politicos, sociales o de marcas, ayudando a medir la opinion publica en tiempo real.
- Analisis de opinion en noticias y articulos: permite clasificar automaticamente si un articulo de prensa o un comentario apoya o rechaza una determinada politica, candidato o iniciativa, util para medios y consultoras.
- Investigacion academica en PLN para lenguas de bajos recursos: sirve como punto de partida para estudios sobre deteccion de postura en amharico, un area poco explorada, y puede compararse con otros modelos multilingues.
- Atencion al cliente en amharico: las empresas que operan en Etiopia pueden usar el modelo para clasificar la postura de los clientes en encuestas o comentarios, identificando quejas o apoyos hacia productos o servicios.
- Analisis de discursos politicos: partidos y organizaciones pueden analizar discursos, debates o declaraciones para entender la postura de los oradores sobre temas clave, facilitando el analisis de campanas.
- Filtrado de contenido para moderacion: en plataformas que necesitan identificar mensajes de apoyo u oposicion a ciertos temas (por ejemplo, discursos de odio), el modelo puede preclasificar textos para revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de resultados de entrenamiento, pero no hay comparaciones con otros modelos ni evaluaciones en conjuntos de datos estandar como MMLU o HumanEval. Los datos de evaluacion del propio autor durante el entrenamiento son:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,5265 |
| Precision de postura | 0,7004 |
| Recall de postura | 0,7031 |
| F1 | 0,7016 |
| Exactitud de postura | 0,6933 |

Estos valores corresponden a la ultima epoca de entrenamiento y no deben interpretarse como resultados de benchmarks independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo BERT de 178 millones de parametros, la inferencia en precision FP32 requiere aproximadamente 700 MB de VRAM. Con cuantizacion a 8 bits, se reduce a unos 350 MB, y a 4 bits a unos 180 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna, incluso en las de gama de entrada.
- Opciones de despliegue: se puede servir con la libreria transformers de Hugging Face, con vLLM (aunque no es optimo para modelos BERT), con llama.cpp si se convierte a GGUF, o mediante Ollama si se empaqueta adecuadamente. Tambien es compatible con los Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: en una GPU como RTX 3090, la inferencia de un texto de 128 tokens tarda aproximadamente 5-10 ms, con un throughput de 100-200 peticiones por segundo en modo batch. En CPU, la latencia puede ser de 100-300 ms por texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| STL-Davlan-bert-base-multilingual-finetuned-amharic-stance | 178 M | 512 | Amharico | no disponible | Ajuste fino para stance detection |
| Davlan/bert-base-multilingual-cased-finetuned-amharic | 178 M | 512 | Amharico | MIT (segun repo original) | Modelo base, sin ajuste para stance |
| bert-base-multilingual-cased (mBERT) | 178 M | 512 | 104 idiomas | Apache 2.0 | Modelo multilingue generico, sin adaptacion al amharico |

La comparativa se limita a modelos BERT de tamano similar. No se han encontrado otros modelos especificos de stance detection en amharico publicados en Hugging Face, por lo que esta comparativa es orientativa.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: no se especifica que datos se usaron para el ajuste fino, lo que impide evaluar posibles sesgos o la representatividad del modelo.
- Rendimiento moderado: con un F1 de 0,70, el modelo tiene margen de mejora y puede cometer errores en textos ambiguos o con matices.
- Limitado al amharico: no soporta otros idiomas, y su vocabulario esta restringido al amharico, por lo que no es util para textos multilingues.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o la redistribucion.
- Sin soporte para generacion de texto: es exclusivamente un modelo de clasificacion, no puede generar respuestas ni mantener conversaciones.
- Riesgo de alucinacion en clasificacion: aunque no genera texto, puede clasificar incorrectamente textos con ironia, sarcasmo o dobles sentidos, comunes en redes sociales.
- Contexto limitado a 512 tokens: no apto para documentos largos o conversaciones extensas sin truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-Davlan-bert-base-multilingual-finetuned-amharic-stance
- Modelo base (Davlan): https://huggingface.co/Davlan/bert-base-multilingual-cased-finetuned-amharic
- Modelo MTL del mismo autor: https://huggingface.co/tadiecool29/MTL-Davlan-bert-base-multilingual-cased-finetuned-amharic
- Referencia al despliegue en endpoints: https://endpoints.huggingface.co/new?repository=Davlan%2Fbert-base-multilingual-cased-finetuned-amharic
