# Spinai/AISVI_T1.0.0_SPINAI

## Resumen

AISVI_T1.0.0_SPINAI es un modelo de extracción de características (embeddings) publicado por Spinai, derivado mediante fine-tuning del modelo Qwen/Qwen3-Embedding-4B. Con 4.021.774.336 parámetros y un repositorio de 8,1 GB en formato safetensors, está orientado a tareas de representación vectorial de texto, con un enfoque declarado en las etiquetas del repositorio hacia el enrutamiento de herramientas (tool-routing) y el uso de herramientas (tool-use). El modelo declara soporte para coreano (ko) e inglés (en).

La relevancia de esta ficha es acotada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, con acceso restringido (gated) que exige aceptar condiciones en Hugging Face, y con una licencia propia denominada "aisvi-personal-use" que no figura entre las licencias estándar de código abierto. No se dispone de documentación pública sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks.

Al estar construido sobre Qwen3-Embedding-4B, hereda la arquitectura transformer del modelo base, pero la información disponible no detalla modificaciones estructurales, cambios en la longitud de contexto ni el volumen de datos de fine-tuning empleados. Cualquier evaluación de producción debería tratarse como preliminar hasta que el autor publique una model card completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3-Embedding-4B; detalles no disponibles) |
| Parametros totales | 4.021.774.336 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | aisvi-personal-use (licencia propia, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune de Qwen/Qwen3-Embedding-4B, un modelo de embeddings de 4.000 millones de parámetros. La información disponible no especifica la arquitectura interna más allá de la herencia del modelo base, ni detalla si se han modificado capas, cabezas de pooling o la dimensionalidad de salida de los embeddings. Tampoco se documenta la longitud de contexto efectiva tras el fine-tuning.

Respecto al entrenamiento, no se han publicado datos sobre el número de tokens utilizados, la composición del corpus, la presencia de etapas de RLHF/DPO ni la metodología de alineación. Las etiquetas del repositorio sugieren un enfoque en tool-routing y tool-use, lo que indica que el fine-tuning podría haberse orientado a producir representaciones útiles para seleccionar herramientas o funciones en pipelines de agentes, pero se trata de una inferencia a partir de las etiquetas y no de documentación técnica verificable.

## Capacidades

- Generación de embeddings de texto para tareas de similitud semántica, recuperación y clustering (pipeline feature-extraction).
- Enrutamiento de herramientas (tool-routing): las etiquetas del modelo indican un ajuste orientado a representar consultas para seleccionar herramientas o funciones.
- Soporte de uso de herramientas (tool-use) a nivel de representación, según las etiquetas declaradas.
- Capacidades multilingües limitadas a coreano e inglés.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y con endpoints compatibles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio; el pipeline declarado es exclusivamente de extracción de características.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo puede generar embeddings de la consulta del usuario para compararlos contra representaciones de un catálogo de herramientas y seleccionar la más adecuada, aprovechando su ajuste declarado en tool-routing.
- Búsqueda semántica bilingüe coreano-inglés: útil en bases de conocimiento con documentación en ambos idiomas, donde se necesita recuperar pasajes relevantes a partir de consultas en cualquiera de las dos lenguas.
- Clasificación de intenciones en asistentes conversacionales: los embeddings permiten entrenar clasificadores ligeros sobre las representaciones para detectar la intención del usuario antes de derivar a un flujo concreto.
- Deduplicación y clustering de documentos: agrupación de textos similares en corpus coreanos o ingleses para limpieza de datasets o organización de contenido.
- Sistemas de recomendación de contenido textual: cálculo de similitud entre perfiles de usuario y artículos para ordenar resultados por relevancia semántica.
- Filtrado previo en pipelines RAG: generación de representaciones para una primera etapa de recuperación antes de un re-ranking más costoso, siempre que se valide el rendimiento en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 16 GB solo para pesos, más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 8 GB para pesos, más overhead; se recomienda un mínimo de 12-16 GB para operar con comodidad.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090 (24 GB) o RTX A6000 (48 GB) para desarrollo y despliegues de un solo nodo.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 16 GB o más en fp16; en GPUs de 8-12 GB requeriría cuantización, para la cual no se documentan formatos publicados.
- Opciones de despliegue: Text Embeddings Inference (TEI) es la opción declarada como compatible; transformers para uso directo; vLLM y llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de 4.000 millones de parámetros, el throughput será sustancialmente menor que el de modelos de embeddings de 300-600 millones, lo que debe tenerse en cuenta en despliegues de alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Spinai/AISVI_T1.0.0_SPINAI | 4.021.774.336 | No disponible | ko, en | aisvi-personal-use | Restringido (gated) |
| Qwen/Qwen3-Embedding-4B (modelo base) | 4.000 millones (aprox.) | No disponible en esta ficha | Multilingüe (no detallado) | No disponible en esta ficha | Público |
| Alternativas de embeddings de 4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación más directa posible es con el modelo base Qwen3-Embedding-4B, pero no se han publicado métricas que permitan cuantificar la mejora o el deterioro introducido por el fine-tuning.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que impide su uso directo en pipelines automatizados sin gestión previa de credenciales.
- Licencia "aisvi-personal-use": no es una licencia de código abierto reconocida; el uso comercial no está garantizado y debe revisarse el texto completo de la licencia antes de cualquier despliegue en producción.
- Idiomas limitados a coreano e inglés: no hay evidencia de soporte para castellano ni para otras lenguas, por lo que su uso en entornos hispanohablantes requeriría validación específica.
- Ausencia de benchmarks: no hay métricas publicadas de recuperación, similitud semántica ni enrutamiento de herramientas, lo que impide estimar su calidad frente al modelo base.
- Riesgo de sesgos y alucinación en las representaciones: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos lingüísticos o culturales; en tareas de recuperación, representaciones sesgadas pueden producir resultados sesgados.
- Cero adopción verificable: con cero descargas y cero likes, no existen informes de terceros sobre su comportamiento en producción.
- Modelo de embeddings, no generativo: no debe emplearse para generación de texto, razonamiento o código; su uso está acotado a la producción de representaciones vectoriales.
- Fecha de creación posterior a la consulta de referencia (2026-11-27): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Spinai/AISVI_T1.0.0_SPINAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
