# tgv5612/Llama-VARCO-8b-news2stock-analyzer

## Resumen

Llama-VARCO-8b-news2stock-analyzer es un modelo de lenguaje afinado a partir de NCSOFT/Llama-VARCO-8B-Instruct, un modelo basado en arquitectura transformer de 8 mil millones de parametros. El modelo ha sido creado por el usuario tgv5612 mediante entrenamiento por supervision (SFT) con TRL, y su nombre indica que esta orientado a analizar noticias financieras y generar un analisis bursatil, aunque la model card no detalla las tareas concretas ni los datos de entrenamiento. La relevancia del modelo radica en su especializacion aparente en el dominio financiero, lo que lo convierte en un candidato para experimentos de analisis de noticias, siempre que se valide su comportamiento.

El proceso de ajuste se realizo con SFT, y se documentan las versiones de TRL, Transformers, PyTorch, Datasets y Tokenizers utilizadas. No se han publicado resultados de benchmarks ni descripciones de los datos de entrenamiento, lo que limita la evaluacion objetiva del modelo.

Destaca la existencia de una variante 4-bit-merged, que podria facilitar el despliegue en entornos con recursos limitados. No obstante, el repositorio original muestra un tamano de 0.1 GB, inusualmente pequeno para un modelo de 8B, lo que sugiere que podria tratarse de un adaptador o pesos parciales, y que los pesos completos podrian no estar disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama; base: NCSOFT/Llama-VARCO-8B-Instruct) |
| Parametros totales | 8 B (segun el nombre del modelo base) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe una variante 4-bit-merged, pero no se detalla el esquema) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se ha especificado una licencia valida) |
| Formato de pesos | Safetensors (segun tags); no obstante, el tamano del repo (0.1 GB) sugiere que podrian ser pesos parciales o adaptador |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (SFT) de NCSOFT/Llama-VARCO-8B-Instruct. La arquitectura subyacente es un transformer de tipo decoder-only, con un total de aproximadamente 8 mil millones de parametros, aunque no se han especificado detalles sobre el numero de capas, dimensiones ni la longitud de contexto. Para el entrenamiento se ha utilizado el framework TRL, con versiones: TRL 1.12.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se ha proporcionado informacion sobre el dataset empleado, el numero de tokens ni si se han aplicado tecnicas como RLHF o DPO. El proceso fue supervisado mediante SFT.

## Capacidades

- Generacion de texto instruccional: el modelo responde a prompts de usuario en formato chat, como muestra el ejemplo de la model card.
- Razonamiento basico y opiniones: el ejemplo de la time machine indica que puede responder preguntas abiertas que exigen juicio o posicionamiento.
- Analisis de noticias bursatil (segun el nombre del modelo): aunque no se describe formalmente, la denominacion "news2stock" sugiere una especializacion en transformar noticias en informacion accionable para el mercado.
- No se dispone de informacion sobre soporte de tool calling, function calling, vision, audio, ni capacidades de agentes.

## Casos de uso

- Analisis de noticias financieras: el modelo podria recibir una noticia economica y generar un resumen con posible impacto en el precio de una accion, como parte de un flujo de trabajo experimental.
- Generacion de informes bursatiles: se puede usar para crear borradores de comentarios diarios sobre la evolucion de un valor a partir de titulares.
- Atencion al cliente financiera: por su naturaleza instructiva, podria responder preguntas frecuentes sobre productos de inversion si se le incluye contexto, aunque sin garantia de precision.
- Procesamiento de documentos legales o de prensa: puede extraer datos relevantes (fechas, cifras, eventos) de textos periodisticos, siempre que se valide su salida.
- Investigacion en PLN financiero: sirve como punto de partida para experimentos de fine-tuning adicionales en el dominio, ya que parte de un modelo base instruido.
- Prototipado de aplicaciones conversacionales: se puede integrar en un chatbot para practicar la generacion de respuestas con tono financiero, aunque el modelo no es apto para produccion sin evaluacion previa.
- Clasificacion de sentimiento en noticias: aunque no esta confirmado, podria adaptarse para analizar el tono de una noticia y su posible efecto en el mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (0.1 GB) indica que no esta claro si los pesos completos estan incluidos, por lo que los requisitos de hardware no se pueden determinar con fiabilidad.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: no confirmado; el tamano del repo sugiere que podria tratarse de un adaptador, no de pesos completos.
- Opciones de despliegue: no especificadas. Si se dispone de los pesos completos, vLLM, llama.cpp u Ollama son opciones habituales para modelos de 8B, pero no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-VARCO-8b-news2stock-analyzer | 8 B | no disponible | no disponible | HuggingFace |
| NCSOFT/Llama-VARCO-8B-Instruct | 8 B | no disponible | no disponible | HuggingFace |
| Llama-VARCO-8b-news2stock-analyzer-4bit-merged | 8 B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- El tamano del repositorio (0.1 GB) es extremadamente pequeno para un modelo de 8B, lo que sugiere que los pesos completos no estan disponibles o que se trata de un adaptador (por ejemplo, LoRA). Cargar el modelo directamente con el ID puede fallar o producir resultados inesperados.
- No se ha especificado la licencia, por lo que no se puede asumir que sea de uso libre, especialmente con fines comerciales.
- No se han publicado benchmarks ni evaluaciones, por lo que se desconoce el rendimiento real en tareas financieras o de generacion de texto.
- El posible sesgo de los datos de entrenamiento no es conocible al no existir informacion sobre el dataset.
- Riesgo de alucinacion alto en dominios especializados si el modelo no ha sido entrenado con datos financieros adecuados.
- La variante 4-bit-merged existe, pero su origen y metodo de cuantizacion no estan documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tgv5612/Llama-VARCO-8b-news2stock-analyzer
- Variante 4-bit-merged: https://huggingface.co/tgv5612/Llama-VARCO-8b-news2stock-analyzer-4bit-merged
- Modelo base: https://huggingface.co/NCSOFT/Llama-VARCO-8B-Instruct
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/tgv5612-haru/huggingface/runs/jzcl5c7u
