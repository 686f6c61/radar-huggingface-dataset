# whynotBeTop/reaxchampion

## Resumen

reaxchampion es un modelo de clasificación de texto derivado por fine-tuning de MachinePulseAI/karpo-decision-31B, un modelo base de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones). Lo publica el usuario whynotBeTop en Hugging Face con licencia Apache 2.0 y acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de descargarlo. La etiqueta `gemma4` en los metadatos sugiere que la arquitectura subyacente pertenece a la familia Gemma, aunque no se dispone de confirmación técnica en la información proporcionada.

El modelo está orientado a tareas de decisión y clasificación de texto (tags `decision-model` y `text-classification`), no a generación abierta. Su relevancia práctica es limitada por el momento: registra 0 descargas y 0 likes, el repositorio ocupa 62,6 GB y no se han publicado resultados de benchmarks, idiomas soportados ni detalles del proceso de entrenamiento. Es, por tanto, un artefacto reciente (creado el 22 de noviembre de 2026) sin validación comunitaria.

La ficha siguiente recoge exclusivamente los datos verificables del repositorio y marca de forma explícita todo aquello que no está disponible, dado que la información publicada es muy escasa y no permite caracterizar el rendimiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tag `gemma4`; se asume transformer derivado de la familia Gemma, sin confirmar) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tamano del repositorio | 62,6 GB |
| Acceso | Restringido (gated) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá del tag `gemma4` y de la referencia al modelo base MachinePulseAI/karpo-decision-31B. El recuento de parámetros (31,3 B) y el tamaño del repositorio (62,6 GB) son coherentes con pesos en precisión bf16/fp16 sin cuantizar, pero no se detalla la configuración de capas, cabezas de atención ni el tipo de atención empleado.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset de fine-tuning ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. La única información sobre el proceso es que se trata de un fine-tuning del modelo base citado, con la pipeline declarada como clasificación de texto. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, mezcla de expertos) sería especulativa y no se incluye.

## Capacidades

- Clasificación de texto: la pipeline declarada es `text-classification`, por lo que el uso previsto es asignar etiquetas o categorías a entradas de texto.
- Modelo de decisión: el tag `decision-model` indica un enfoque hacia tareas de decisión, probablemente clasificación binaria o multietiqueta, sin detalle publicado.
- Generación de texto: no confirmada; al ser un fine-tuning para clasificación, la cabeza generativa puede haber sido reemplazada o reorientada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de documentos en pipelines de ingestión: el modelo puede etiquetar textos entrantes según categorías definidas por el desarrollador, integrándose como paso previo a un sistema de recuperación o enrutado.
- Moderación de contenido asistida: uso como clasificador de segundo nivel para marcar textos que requieran revisión humana, siempre que se valide su comportamiento con datos propios.
- Enrutado de tickets de soporte: asignación automática de categoría a incidencias entrantes antes de derivarlas al equipo correspondiente.
- Filtrado de candidatos en procesos de selección: clasificación de currículos o respuestas abiertas según criterios predefinidos, con supervisión humana obligatoria.
- Etiquetado de datasets para entrenamiento: uso del modelo para preanotar grandes volúmenes de texto y reducir el coste de anotación manual, con revisión posterior.
- Investigación sobre clasificación con modelos de gran tamaño: evaluación de si un modelo de 31 B aporta ventajas frente a clasificadores más pequeños en dominios específicos.

En todos los casos, la ausencia de benchmarks, de documentación de entrenamiento y de validación comunitaria obliga a realizar una evaluación propia antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requiere al menos 80 GB de VRAM para una ejecución cómoda.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB o H200.
- Consumer GPU: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) sin cuantización agresiva; no se publican variantes cuantizadas oficiales.
- Cuantización posible: al no ofrecerse pesos GGUF/AWQ/GPTQ, habría que generarlos a partir de los safetensors; en 4 bits los pesos ocuparían aproximadamente 16-18 GB, lo que permitiría ejecución en una RTX 4090 con margen ajustado, aunque sin garantías de calidad por falta de validación.
- Opciones de despliegue: al ser un modelo de clasificación, el despliegue típico sería mediante la librería `transformers` con `AutoModelForSequenceClassification`; vLLM, TGI o llama.cpp no están confirmados como compatibles con esta cabeza de clasificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa fiable: no se conocen benchmarks del modelo ni las características del modelo base MachinePulseAI/karpo-decision-31B más allá de su nombre. Como referencia estructural, se incluye una tabla con datos verificables del propio modelo frente a categorías genéricas, marcando como no disponible lo que no se puede contrastar.

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks publicados |
|---|---|---|---|---|---|
| whynotBeTop/reaxchampion | 31,3 B | No disponible | Apache 2.0 | Gated | No |
| MachinePulseAI/karpo-decision-31B (base) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Clasificadores encoder pequenos (p. ej. DeBERTa/RoBERTa fine-tuneados) | 0,1-0,4 B | 512-4k | MIT/Apache 2.0 | Abierto | Habituales en GLUE/SuperGLUE |

La comparación cualitativa con clasificadores encoder pequeños es la más relevante en la práctica: estos últimos son más baratos de desplegar y suelen estar mejor documentados, mientras que reaxchampion aporta un tamaño de 31 B sin evidencia pública de que mejore sus resultados.

## Limitaciones y advertencias

- Ausencia total de documentación: no se describen datos de entrenamiento, hiperparámetros, composición del dataset ni metodología de evaluación.
- Sin benchmarks: no es posible estimar su calidad frente a alternativas; cualquier uso en producción exige una evaluación propia.
- Riesgo de alucinación y sesgos: inherente a los modelos de gran tamaño, agravado por la falta de información sobre el corpus de entrenamiento y los posibles sesgos heredados del modelo base.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés.
- Contexto desconocido: no se puede planificar su uso en documentos largos sin determinar experimentalmente la ventana efectiva.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated obliga a aceptar las condiciones de Hugging Face y conviene verificar las condiciones del modelo base, cuyos términos no se detallan.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad; el artefacto debe tratarse como no auditado.
- Tamaño de despliegue elevado: 62,6 GB de pesos dificultan el uso en infraestructura modesta y no se ofrecen cuantizaciones oficiales.
- Cabeza de clasificación: al ser un fine-tuning para `text-classification`, no debe asumirse que conserve capacidades generativas del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whynotBeTop/reaxchampion
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Perfil del autor: https://huggingface.co/whynotBeTop
