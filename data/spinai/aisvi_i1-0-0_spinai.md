# Spinai/AISVI_I1.0.0_SPINAI

## Resumen

AISVI_I1.0.0_SPINAI es un modelo de embeddings derivado por fine-tuning de Qwen/Qwen3-Embedding-0.6B, publicado por el usuario Spinai en Hugging Face. Su propósito declarado, según las etiquetas del repositorio, es la extracción de características vectoriales orientada a enrutamiento de herramientas (tool-routing) y uso de herramientas (tool-use), es decir, convertir texto en representaciones densas que permitan decidir qué herramienta o función invocar en un pipeline de agentes. No es un modelo generativo: la pipeline declarada es `feature-extraction`.

El modelo cuenta con 595.776.512 parámetros en formato safetensors (aproximadamente 0,6 mil millones), lo que lo sitúa en la gama de embeddings ligeros aptos para despliegue en CPU y GPU de consumo. Hereda la arquitectura transformer del Qwen3-Embedding-0.6B original, aunque la ficha pública no detalla cambios estructurales respecto al modelo base. Los idiomas declarados son coreano (ko) e inglés (en).

Su relevancia es limitada y muy específica: se trata de un fine-tuning reciente (creado el 27 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, con acceso restringido (gated) y una licencia propia denominada `aisvi-personal-use` que no es de código abierto. Resulta adecuado únicamente para evaluaciones internas de enrutamiento de herramientas en coreano e inglés, y no como sustituto de un modelo de embeddings de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3-Embedding-0.6B); detalles internos no disponibles |
| Parametros totales | 595.776.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | aisvi-personal-use (licencia propia, no open source; acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un fine-tuning de Qwen/Qwen3-Embedding-0.6B, un modelo de embeddings de la familia Qwen3. No se documentan en la ficha publica ni la arquitectura interna exacta (numero de capas, dimension de hidden state, dimension del embedding de salida), ni la longitud de contexto soportada, ni el volumen o composicion del dataset de fine-tuning. Tampoco se especifica si se emplearon tecnicas de contraste, destilacion o entrenamiento supervisado con pares (query, herramienta).

Las etiquetas del repositorio (`tool-routing`, `tool-use`, `embedding`) sugieren que el ajuste se orienta a producir representaciones utiles para seleccionar herramientas o funciones a partir de una consulta en lenguaje natural, un caso de uso habitual en sistemas de agentes. No obstante, no se aportan detalles sobre el corpus de entrenamiento, el regimen de entrenamiento ni innovaciones tecnicas destacables (por ejemplo, decodificacion especulativa o atencion lineal), por lo que cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de embeddings de texto para tareas de similitud y recuperacion semantica, con salida vectorial densa.
- Enrutamiento de herramientas (tool-routing): representar consultas de usuario y descripciones de herramientas en un espacio comun para seleccionar la funcion adecuada.
- Soporte de uso de herramientas (tool-use) a nivel de representacion, segun las etiquetas del repositorio.
- Capacidades multilingues limitadas a coreano e ingles.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y con endpoints compatibles (`text-embeddings-inference`, `endpoints_compatible`).
- No se documentan capacidades de generacion de texto, razonamiento generativo, codigo, matematicas, vision ni audio.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un mensaje de usuario en coreano o ingles, generar su embedding y compararlo por similitud coseno con los embeddings de las descripciones de las herramientas disponibles para seleccionar la mas adecuada. El tamano de 0,6 B permite latencias bajas en CPU.
- Busqueda semantica en bases de conocimiento internas: indexar documentos y consultas en el mismo espacio vectorial para recuperacion por similitud, aprovechando el formato safetensors y la compatibilidad con TEI.
- Clasificacion de intenciones en asistentes conversacionales: usar los embeddings como entrada a un clasificador ligero que determine la intencion del usuario antes de derivar a un flujo concreto.
- Deduplicacion y agrupamiento de tickets de soporte: calcular embeddings de incidencias en coreano e ingles y agrupar por similitud para priorizar y enrutar al equipo correcto.
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion de bajo coste, descartando candidatos irrelevantes antes de un reranker mas pesado.
- Evaluacion interna de seleccion de funciones en entornos controlados: medir la precision del enrutamiento de herramientas frente a un conjunto de validacion propio, dado que el modelo esta restringido y su licencia es de uso personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 2,4 GB solo para pesos (595,8 M de parametros x 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos, mas overhead de activaciones y tokenizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060, T4); A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas; tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: transformers (libreria declarada), Text Embeddings Inference (TEI) y endpoints compatibles segun las etiquetas del repositorio; no se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Spinai/AISVI_I1.0.0_SPINAI | 595,8 M | No disponible | ko, en | aisvi-personal-use | Gated |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | ~0,6 B | No disponible en esta ficha | Multilingue (segun modelo base) | Segun modelo base | Publico |
| Modelos de embeddings de ~0,5-0,6 B de proposito general | ~0,5-0,6 B | Variable | Multilingue | Variable | Publico |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado benchmarks del modelo ajustado ni se dispone de datos que permitan contrastarlo con alternativas en tareas de enrutamiento de herramientas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia `aisvi-personal-use`: no es una licencia de codigo abierto; el uso comercial no esta permitido salvo autorizacion expresa, lo que limita su adopcion en produccion.
- Cobertura idiomatica reducida a coreano e ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en tool-routing frente al modelo base ni frente a alternativas.
- Riesgo de sobreajuste al dominio de entrenamiento: al ser un fine-tuning especifico, puede degradar su comportamiento en tareas de embeddings generales.
- Modelo sin traccion en la comunidad (0 descargas, 0 likes en la fecha de consulta): no existe validacion externa ni soporte documentado.
- No es un modelo generativo: no debe emplearse para generar texto, razonar o responder preguntas directamente.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento con entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Spinai/AISVI_I1.0.0_SPINAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
