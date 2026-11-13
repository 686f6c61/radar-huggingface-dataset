# TawkaSaya/burmese-authorship-xlm-roberta

## Resumen

TawkaSaya/burmese-authorship-xlm-roberta es un modelo derivado de la arquitectura XLM-RoBERTa, publicado en Hugging Face por el usuario TawkaSaya. Por su nombre ("burmese-authorship") y por los artefactos que acompanian al repositorio (un fichero `joblib` junto a pesos en `safetensors`), se trata presumiblemente de un modelo de clasificacion de autoria en birmano: es decir, un encoder afinado para atribuir un texto a su autor o para discriminar entre distintos escritores en ese idioma. No es un modelo generativo ni un modelo conversacional.

El modelo cuenta con 278.049.031 parametros totales, un tamano coherente con la variante base de XLM-RoBERTa (aproximadamente 278 M de parametros), lo que sugiere que se ha partido de un checkpoint preentrenado de esa familia y se ha afinado para la tarea de atribucion de autoria. El repositorio ocupa 6,7 GB, un tamano desproporcionado para 278 M de parametros, lo que apunta a la presencia de multiples artefactos (pesos duplicados en distintos formatos, vectorizadores serializados con `joblib` y posiblemente copias de seguridad del entrenamiento).

La relevancia de este modelo es acotada y muy especializada: cubre un nicho poco atendido como es el procesamiento del birmano (una lengua de bajos recursos con escritura propia no latina) aplicado a la estilometria forense y la atribucion de autoria. No obstante, la ausencia de model card, licencia, idiomas declarados y resultados de evaluacion limita seriamente su adopcion en produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, presumiblemente base) |
| Parametros totales | 278.049.031 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas, no documentada) |
| Idiomas soportados | no disponible (por el nombre, orientado a birmano) |
| Licencia | no disponible |
| Formato de pesos | safetensors y joblib |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa, un transformer encoder multilingue basado en RoBERTa y preentrenado con objetivos de modelado de lenguaje enmascarado sobre corpus multilingues. El recuento de parametros (278 M) coincide con la variante base de esta familia, por lo que lo mas probable es que el autor haya partido de `xlm-roberta-base` y haya realizado un ajuste fino supervisado para una tarea de clasificacion, anadiendo una cabeza de clasificacion sobre el token `[CLS]` o sobre la representacion pooled.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de regularizacion, aumentacion de datos o validacion cruzada. La presencia de un fichero `joblib` sugiere que el pipeline incluye un vectorizador o un objeto serializado de scikit-learn (posiblemente para preprocesamiento de texto o para el propio clasificador), aunque su contenido exacto no esta documentado. Tampoco hay evidencia de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Clasificacion de texto: presumiblemente atribucion de autoria en birmano (identificar el autor de un texto entre un conjunto cerrado de candidatos).
- Extraccion de representaciones: al ser un encoder XLM-RoBERTa, puede emplearse para obtener embeddings contextuales de texto birmano y multilingue.
- Ajuste fino posterior: al ser un checkpoint de 278 M de parametros, es viable reentrenarlo para otras tareas de clasificacion o etiquetado de secuencias.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No se ha documentado capacidad de generacion de texto, vision, audio ni matematicas.
- Capacidades multilingues: no confirmadas; el preentrenamiento de XLM-RoBERTa es multilingue, pero el ajuste fino podria haber degradado el rendimiento en idiomas distintos del birmano.

## Casos de uso

- Atribucion forense de autoria en birmano: dado un texto anonimo, el modelo podria clasificarlo entre un conjunto conocido de autores, apoyando peritajes linguisticos o investigaciones documentales. Es adecuado por su especializacion en la tarea y en el idioma.
- Deteccion de plaguicidio o suplantacion de identidad textual: comparar el estilo de un texto sospechoso con el de un autor de referencia para detectar escritura suplantada en entornos academicos o periodisticos.
- Analisis estilometrico de corpus literarios birmanos: agrupar o clasificar obras por autor para estudios de autoria, filologia o humanidades digitales.
- Moderacion de contenido en foros y redes birmanas: si se reentrena con las clases adecuadas, podria apoyar la deteccion de cuentas coordinadas o suplantacion de usuarios.
- Verificacion de autoria en periodismo: contrastar si un articulo atribuido a un firmante mantiene su huella estilistica habitual.
- Base para experimentos de NLP en birmano: servir como punto de partida para ajuste fino en tareas de clasificacion (sentimiento, topicos, deteccion de spam) en una lengua de bajos recursos, aprovechando el preentrenamiento multilingue de XLM-RoBERTa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278 M x 4 bytes), mas activaciones y overhead; en la practica, entre 2 y 4 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos; entre 1,5 y 3 GB en total con overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 Ti o RTX 4090 pueden ejecutar el modelo con holgura; tambien es viable en GPUs de datacenter (A100, H100) para procesamiento por lotes a gran escala.
- Cabe en GPUs consumer de gama baja (GTX 1650 4 GB, RTX 3050 8 GB) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (PyTorch) es la via natural; tambien es posible exportar a ONNX Runtime para inferencia en CPU. No se ha documentado soporte en vLLM, TGI, llama.cpp ni Ollama, y al ser un encoder de clasificacion no encaja en esos motores de generacion.
- Latencia y throughput: no disponibles. Para un encoder de 278 M en una GPU moderna se puede esperar un throughput de cientos a miles de secuencias cortas por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TawkaSaya/burmese-authorship-xlm-roberta | 278 M | no disponible | Atribucion de autoria (birmano) | no disponible | Hugging Face |
| xlm-roberta-base (FacebookAI) | 278 M | 512 tokens | Modelo base multilingue | MIT | Hugging Face |
| xlm-roberta-large (FacebookAI) | 560 M | 512 tokens | Modelo base multilingue | MIT | Hugging Face |
| bert-base-multilingual-cased (Google) | 178 M | 512 tokens | Modelo base multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos base de la misma familia, ya que no se conocen checkpoints publicos comparables especificamente para atribucion de autoria en birmano. Frente a `xlm-roberta-base`, este checkpoint anade un ajuste fino especifico pero pierde la documentacion, la licencia clara y la garantia de calidad del modelo original.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, metricas, limitaciones ni sesgos, lo que impide evaluar su calidad de forma objetiva.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion sin aclaracion del autor.
- Riesgo de sobreajuste: al ser un ajuste fino sobre un dataset presumiblemente pequeno (la atribucion de autoria suele tener pocos autores y muestras), es probable que el modelo generalice mal a autores no vistos durante el entrenamiento.
- Sesgo de dominio: si el corpus de entrenamiento es de un genero concreto (literario, periodistico, redes sociales), el rendimiento caera fuera de ese dominio.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en la clasificacion, con implicaciones eticas en contextos forenses.
- Limitaciones de contexto: si hereda la ventana de 512 tokens de XLM-RoBERTa, no puede procesar documentos largos sin truncado o segmentacion.
- Idiomas: no confirmados; el ajuste fino podria haber reducido el rendimiento multilingue del checkpoint original.
- Repositorio de 6,7 GB para 278 M de parametros: sugiere artefactos redundantes o mal empaquetados, lo que complica el despliegue y aumenta los tiempos de descarga.
- Cero descargas y un solo "like": no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/TawkaSaya/burmese-authorship-xlm-roberta
- XLM-RoBERTa base (modelo de referencia): https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
