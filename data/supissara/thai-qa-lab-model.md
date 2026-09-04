# Supissara/thai-qa-lab-model

## Resumen

El modelo `Supissara/thai-qa-lab-model` es un ajuste fino (fine-tuning) de GPT-2 realizado por un estudiante llamado Supissara, orientado a tareas de preguntas y respuestas (QA) en tailandés. El dominio de conocimiento se limita exclusivamente al pez payaso (clownfish), sobre el que se generaron 3000 pares de preguntas y respuestas que constituyen el conjunto de datos de entrenamiento (`clownfish_3000`). El modelo se publica en HuggingFace con licencia MIT y utiliza el formato de pesos `safetensors`.

La arquitectura es la de GPT-2, un transformer decoder-only con 124.449.024 parámetros, un tamaño relativamente pequeño que lo hace accesible para ejecución en hardware modesto. El proyecto tiene un carácter claramente experimental y académico, ya que no se han publicado resultados de benchmarks ni información detallada sobre el proceso de entrenamiento. Su relevancia radica en servir como ejemplo de fine-tuning de un modelo de lenguaje en un dominio muy específico y en tailandés, un idioma con menos recursos que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.449.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | th (tailandes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura GPT-2, un transformer decoder-only con mecanismo de atencion causal. El numero de parametros (124.449.024) corresponde a la variante pequena de GPT-2. No se han publicado detalles sobre la configuracion exacta de capas, cabezas de atencion ni dimensiones de embedding, por lo que estos datos no estan disponibles.

El entrenamiento consiste en un fine-tuning sobre el dataset `clownfish_3000`, que contiene 3000 pares de preguntas y respuestas en tailandes centrados en el pez payaso. No se especifica si se aplicaron tecnicas de RLHF, DPO, ni el regimen de entrenamiento (precision, hiperparametros, numero de epochs). El dataset no esta documentado mas alla de su nombre, por lo que se desconoce su composicion exacta, tamano en tokens o criterios de filtrado. Tampoco se indica el modelo base utilizado, aunque por el numero de parametros y la arquitectura se infiere que es GPT-2 pequeno.

## Capacidades

- Generacion de texto en tailandes, con especializacion en respuestas cortas sobre el pez payaso.
- Respuesta a preguntas factuales dentro del dominio del dataset de entrenamiento (clownfish).
- No soporta tool calling ni function calling, al ser un modelo de texto generativo basico sin entrenamiento en APIs externas.
- No tiene soporte para agentes ni razonamiento multi-paso complejo.
- No dispone de capacidades multimodales (vision, audio) ni modo de pensamiento explicito.
- Multilingue: no; el modelo esta entrenado exclusivamente para tailandes.
- La longitud de contexto no se especifica, pero por la arquitectura GPT-2 base seria previsiblemente de 1024 tokens, dato no confirmado por el autor.

## Casos de uso

- Demostracion educativa de fine-tuning: el modelo puede usarse en cursos o tutoriales para mostrar como adaptar GPT-2 a un dominio especifico con un dataset pequeno en un idioma con pocos recursos.
- Chatbot de preguntas frecuentes sobre peces payaso: podria integrarse en una web educativa o museo acuatico para responder consultas basicas en tailandes sobre esta especie.
- Investigacion sobre transferencia de conocimiento en modelos pequenos: sirve como caso de estudio de cuanto conocimiento puede absorber un modelo de 124M parametros con solo 3000 pares de entrenamiento.
- Prototipo de sistema de QA restringido: util para experimentar con sistemas de respuesta a preguntas en tailandes sin necesidad de infraestructura de alto coste.
- Generacion de contenido corto en tailandes: puede generar parrafos breves o respuestas sobre el pez payaso, siempre que la consulta este dentro del dominio.
- Practica de despliegue de modelos en entornos ligeros: por su tamano reducido, es adecuado para probar tecnicas de cuantizacion y despliegue en dispositivos con recursos limitados, como Raspberry Pi o portatiles antiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona perplexity como metrica de evaluacion, pero no ofrece valores concretos ni comparaciones con otros modelos. Tampoco hay datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K, ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124M parametros, el modelo en precision FP32 ocupa aproximadamente 500 MB. Con cuantizacion a 8 bits se reduce a unos 125 MB, y con 4 bits a unos 65 MB, aunque estos valores son estimaciones teoricas y no estan confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3050) es suficiente para ejecutar el modelo en FP32. Tambien puede ejecutarse en CPU sin problemas.
- Capacidad en GPU de consumo: si, es compatible con GPUs de consumo como la RTX 4090, aunque resulta sobredimensionado para este modelo.
- Opciones de despliegue: puede cargarse con la libreria Transformers de HuggingFace, ejecutarse con llama.cpp si se convierte a GGUF, o desplegarse en servidores de inferencia como vLLM o TGI, aunque para un modelo tan pequeno la opcion mas sencilla es ejecutarlo directamente con Transformers.
- Latencia y throughput: no disponibles. Al ser un modelo pequeno, la latencia en una GPU moderna seria de decenas de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supissara/thai-qa-lab-model | 124.449.024 | no disponible | th | MIT | HuggingFace |
| GPT-2 pequeno (base, sin fine-tuning) | 124.449.024 | 1024 tokens (estandar) | en (principalmente) | MIT | HuggingFace |
| WangChanGLM (GPT-2 fine-tuned en tailandes) | 124.000.000 | no disponible | th | no disponible | HuggingFace (no confirmado) |

No se dispone de comparativas publicadas de rendimiento entre estos modelos. Los datos de GPT-2 base se incluyen como referencia por su arquitectura identica, pero no hay evidencia de que el modelo fine-tuned supere o iguale al base en tareas generales.

## Limitaciones y advertencias

- El modelo esta entrenado en un dataset muy pequeno (3000 pares), por lo que su cobertura de conocimiento es extremadamente limitada y puede fallar en preguntas fuera del dominio del pez payaso.
- Riesgo alto de alucinacion: al carecer de filtrado y evaluacion exhaustiva, el modelo puede generar respuestas incorrectas o inventadas, especialmente en preguntas de caracter general.
- Sesgos desconocidos: no se han realizado estudios de sesgos. El dataset, al ser recopilado por una unica persona, puede reflejar sesgos personales o culturales de su autor.
- Limitacion linguistica: el modelo solo soporta tailandes. No puede procesar ni generar texto en otros idiomas.
- Restricciones de contexto: la longitud de contexto no esta documentada; si se usa con prompts largos, el comportamiento puede degradarse mas alla de la ventana nativa de GPT-2 (1024 tokens, no confirmado).
- Ausencia de evaluacion: no hay resultados publicados de perplexity ni de otras metricas, por lo que no se puede afirmar su calidad real de respuesta.
- Uso comercial permitido gracias a la licencia MIT, pero el rendimiento limitado hace que su aplicacion en produccion sea poco recomendable salvo en escenarios muy acotados.

## Enlaces

- HuggingFace: https://huggingface.co/Supissara/thai-qa-lab-model
- Paper referenciado en los metadatos (Lacoste et al. 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- No se han encontrado repositorios, demos, papers del modelo ni otros enlaces relevantes en la busqueda web.
