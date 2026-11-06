# Windmi1l/geoagenticrag-finetuned-models

## Resumen

GeoAgenticRag fine-tuned models es un repositorio de Hugging Face publicado por el usuario Windmi1l que contiene dos checkpoints fusionados del proyecto GeoAgenticRag, un sistema de generacion aumentada por recuperacion (RAG) orientado a dominios geoespaciales. El repositorio no aloja un unico modelo, sino dos artefactos independientes almacenados en subdirectorios: un modelo de decision estructurada para agentes geoespaciales (JEV) y un reranker de descripciones.

El primer checkpoint, JEV, parte de Qwen/Qwen3.5-0.8B y se ha ajustado para emitir decisiones estructuradas en el contexto de un agente geoespacial. El segundo, reranker-v5, parte de BAAI/bge-reranker-v2-m3 y puntua nodos candidatos de un arbol de descripciones frente a una consulta. Ambos se han entrenado con estados simulados y etiquetas generadas por reglas, no con anotaciones de expertos.

La relevancia del repositorio es acotada: se trata de checkpoints de investigacion (epoch 2 para JEV, epoch 4 para el reranker) con cero descargas y cero likes en el momento de la consulta, y el propio autor advierte que las metricas de validacion se calculan sobre etiquetas debiles y no deben interpretarse como precision anotada por expertos. Es util como referencia de un pipeline RAG agentico especializado, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (JEV: Qwen3.5-0.8B; reranker: BGE reranker v2 m3) |
| Parametros totales | 0,8 mil millones (JEV); no disponible para el reranker |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio agrupa dos modelos con funciones distintas. JEV es un fine-tuning de Qwen3.5-0.8B, un transformer decoder de 0,8 mil millones de parametros, orientado a generar decisiones estructuradas de agente en dominios geoespaciales. El entrenamiento empleo estados simulados y etiquetas generadas por reglas, y el checkpoint publicado corresponde a la epoca 2. El repositorio incluye junto a los pesos la configuracion, el tokenizer, la plantilla de chat, metadatos de despliegue, la procedencia del entrenamiento y la licencia.

El segundo componente, reranker-v5, es un ajuste de BAAI/bge-reranker-v2-m3 configurado como modelo de clasificacion de secuencias (AutoModelForSequenceClassification) que puntua nodos candidatos de un arbol de descripciones frente a una consulta. El checkpoint publicado corresponde a la epoca 4 y se selecciono segun nDCG@10 sobre validacion con preguntas disjuntas. Las etiquetas proceden de consultas de ramas de produccion y fueron generadas por reglas, no por anotadores expertos. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de decisiones estructuradas de agente para tareas geoespaciales (checkpoint JEV).
- Reranking de nodos candidatos de un arbol de descripciones frente a una consulta (checkpoint reranker-v5).
- Integracion en pipelines RAG como componente de seleccion y ordenacion de candidatos.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: el checkpoint JEV esta disenado para decisiones de agente, aunque no se detalla el mecanismo.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reranking en pipelines RAG geoespaciales: el checkpoint reranker-v5 puntua nodos de un arbol de descripciones para reordenar candidatos antes de pasarlos al generador, mejorando la precision de la recuperacion en consultas de dominio geografico.
- Seleccion de acciones en agentes geoespaciales: JEV emite decisiones estructuradas a partir de estados simulados, lo que permite prototipar bucles de agente en entornos controlados antes de conectar herramientas reales.
- Investigacion sobre etiquetado debil: ambos checkpoints sirven para estudiar como se comportan modelos ajustados con etiquetas generadas por reglas frente a alternativas con anotacion experta.
- Evaluacion de arquitecturas RAG especializadas: el repositorio documenta configuracion, plantilla de chat y procedencia, lo que facilita reproducir el pipeline en experimentos academicos.
- Filtrado de candidatos en busquedas de descripciones geograficas: el reranker puede descartar nodos irrelevantes en arboles de descripcion antes de una fase de generacion costosa.
- Base para fine-tuning posterior: al partir de Qwen3.5-0.8B y bge-reranker-v2-m3 con licencia Apache-2.0, los checkpoints pueden reutilizarse como punto de partida en proyectos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el reranker se selecciono por nDCG@10 sobre validacion con preguntas disjuntas, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para JEV (0,8 mil millones de parametros): aproximadamente 1,6 GB en fp16 y en torno a 0,5-0,8 GB en cuantizacion de 4 bits, segun estimacion estandar para modelos de ese tamano.
- VRAM estimada para el reranker: no disponible, al no conocerse el numero de parametros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder ejecutar JEV en fp16; para el reranker no se dispone de datos.
- Cabe en GPU consumer: si para JEV (RTX 3060, RTX 4060 o superiores); para el reranker, no disponible.
- Opciones de despliegue: Transformers con soporte de Qwen3.5 para JEV y AutoModelForSequenceClassification para el reranker. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV (este repo) | 0,8 B | no disponible | Decisiones de agente geoespacial | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | Generacion general | Apache-2.0 | Hugging Face |
| reranker-v5 (este repo) | no disponible | no disponible | Reranking de descripciones | Apache-2.0 | Hugging Face |
| BAAI/bge-reranker-v2-m3 (base) | no disponible | no disponible | Reranking general | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Los checkpoints se entrenaron con etiquetas generadas por reglas (weak labels); las metricas de validacion no equivalen a precision anotada por expertos.
- El autor califica explicitamente los modelos como checkpoints de investigacion y recomienda revisar las decisiones y los resultados de reranking antes de usarlos en un sistema operativo.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- No se especifican los idiomas soportados, lo que impide garantizar cobertura multilingue.
- La licencia Apache-2.0 permite uso comercial, pero cada checkpoint incluye su propio texto de licencia en el subdirectorio correspondiente y debe revisarse.
- El repositorio tiene cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- No se detalla el contexto maximo soportado, lo que limita la planificacion de despliegues con entradas largas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Windmi1l/geoagenticrag-finetuned-models
- Modelo base JEV: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base del reranker: https://huggingface.co/BAAI/bge-reranker-v2-m3
