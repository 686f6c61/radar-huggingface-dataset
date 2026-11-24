# whynotBeTop/gemma4-31b-choice-ft

## Resumen

`whynotBeTop/gemma4-31b-choice-ft` es un ajuste fino (fine-tuning) del modelo `MachinePulseAI/karpo-decision-31B`, que a su vez se presenta en la model card como un derivado de la familia Gemma 4. El modelo está orientado a tareas de toma de decisiones y clasificación de texto, según declara su pipeline (`text-classification`) y sus etiquetas (`decision-making`, `text-classification`). Cuenta con 31.273.088.876 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de gran tamano (~31B).

El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El repositorio ocupa 62,6 GB, coherente con pesos en precisión completa o bf16 para un modelo de 31B. La información pública disponible es muy limitada: no se especifican idiomas, contexto, datos de entrenamiento ni benchmarks, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia actual es limitada pero concreta: se trata de un derivado especializado en decisiones y clasificación sobre una base de 31B, lo que puede interesar a equipos que necesiten un clasificador de alta capacidad o un modelo de enrutamiento/decisiones dentro de pipelines de agentes, siempre que acepten las condiciones de acceso y asuman la falta de documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 4, segun tags; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un fine-tuning de `MachinePulseAI/karpo-decision-31B`, etiquetado como parte de la familia `gemma4` y especializado en `decision-making` y `text-classification`. No se publican detalles sobre la arquitectura interna (número de capas, dimensiones, tipo de atención, uso de MoE o variantes híbridas), ni sobre el dataset de ajuste fino, el número de tokens utilizados, la composición de los datos o si se aplicaron técnicas de RLHF, DPO o SFT supervisado.

Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, modos de razonamiento explícito, etc.). Dado que el pipeline declarado es `text-classification`, es razonable inferir que el ajuste fino se orientó a producir etiquetas o decisiones discretas a partir de texto, pero no hay información publicada que confirme la metodología, las clases objetivo ni el formato exacto de entrada/salida.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el uso previsto es asignar etiquetas o categorías a entradas textuales.
- Toma de decisiones: la etiqueta `decision-making` sugiere un ajuste orientado a seleccionar opciones o rutas de acción a partir de contexto textual.
- Generación de texto: al derivar de un modelo base de 31B, es probable que conserve capacidades generativas, aunque no se documentan explícitamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Modo de razonamiento explícito: no disponible.

## Casos de uso

- Enrutamiento de consultas en pipelines de agentes: usar el modelo como clasificador de intención para decidir a qué sub-agente o herramienta derivar cada petición, aprovechando su tamaño de 31B para manejar matices en la entrada.
- Moderación y triaje de contenido: clasificar textos entrantes en categorías predefinidas (spam, soporte, queja, consulta comercial) antes de pasarlos a sistemas downstream.
- Clasificación de tickets de soporte: asignar automáticamente prioridad, departamento o tipo de incidencia a partir del texto del ticket, con un modelo de alta capacidad que puede capturar dependencias semánticas complejas.
- Selección de acciones en sistemas de decisión automatizada: dado un contexto y un conjunto de opciones, elegir la opción más adecuada (por ejemplo, en sistemas de recomendación de siguiente acción o de resolución de incidencias).
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación documental o puede responderse directamente, reduciendo coste y latencia en el resto del pipeline.
- Etiquetado asistido para curación de datasets: usar el modelo para pre-etiquetar grandes volúmenes de texto que luego se revisan manualmente, acelerando la construcción de datasets supervisados.
- Clasificación de documentos en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de otras licencias, siempre que se acepten las condiciones de acceso del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.273.088.876 parámetros, en bf16/fp16 se requieren aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, en torno a 31-33 GB; en 4 bits, en torno a 16-18 GB (estimaciones teóricas, no confirmadas para este modelo).
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 40-48 GB para precisión completa. Para cuantización 4/8 bits, GPU de 24-48 GB (RTX 4090, RTX 6000 Ada, L40S) pueden ser viables.
- Cabe en GPU de consumo: en cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no hay variantes GGUF publicadas en el repositorio y habría que generarlas.
- Opciones de despliegue: vLLM, TGI o transformers para pesos safetensors; llama.cpp/Ollama requerirían conversión a GGUF no publicada. El acceso gated debe resolverse antes de cualquier despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| whynotBeTop/gemma4-31b-choice-ft | 31,27B | no disponible | Apache 2.0 | Gated en HF | Fine-tuning para clasificación/decisiones |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | no disponible | no disponible | Modelo base del fine-tuning |
| Gemma 4 (familia base) | no disponible | no disponible | no disponible | no disponible | Familia de origen segun tags |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación muy escasa: no se publican idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización de pipelines.
- Riesgo de alucinación: al derivar de un modelo generativo de 31B, si se usa en modo generación puede producir contenido incorrecto; su uso previsto como clasificador reduce pero no elimina este riesgo.
- Sesgos: no se documentan evaluaciones de sesgo; al no conocerse la composición del dataset de ajuste fino, no es posible descartar sesgos heredados del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero deben verificarse las condiciones del modelo base y del repositorio gated, que podrían imponer restricciones adicionales.
- Sin variantes cuantizadas publicadas: el despliegue eficiente requiere conversión manual a GGUF/AWQ/GPTQ.
- Sin métricas de rendimiento ni de calidad: no hay evidencia publicada de su precisión en tareas de clasificación o decisión.
- Fecha de creación futura en los metadatos (2026-11-24): conviene verificar la autenticidad y procedencia del repositorio antes de usarlo en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whynotBeTop/gemma4-31b-choice-ft
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
