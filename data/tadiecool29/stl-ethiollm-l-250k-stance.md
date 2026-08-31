# tadiecool29/STL-ethiollm-l-250K-stance

## Resumen

STL-ethiollm-l-250K-stance es un modelo de clasificación de texto desarrollado por tadiecool29, obtenido mediante fine-tuning del modelo multilingüe EthioLLM-l-250K de EthioNLP. Está especializado en la detección de stance (postura) en textos, una tarea de análisis de opinión que identifica si un texto expresa una posición a favor, en contra o neutral respecto a un tema. El modelo base está orientado a lenguas etíopes, por lo que este fine-tuning hereda esa orientación, aunque no se especifican los idiomas exactos en la documentación.

Con 559,9 millones de parámetros y un tamaño de repositorio de 2,3 GB, el modelo se distribuye en formato safetensors y se integra con la librería Transformers. La licencia MIT permite uso comercial sin restricciones. Aunque el modelo no presenta resultados de benchmarks externos, la model card reporta métricas de evaluación propias: F1 de 0,7353, precisión de 0,7326, recall de 0,7394 y exactitud de 0,7282. Su relevancia radica en ofrecer una herramienta específica para análisis de opinión en contextos lingüísticos etíopes, un área con escasos recursos de PLN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: EthioLLM-l-250K) |
| Parametros totales | 559.894.532 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (modelo base orientado a lenguas etíopes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer EthioLLM-l-250K, desarrollado por EthioNLP para lenguas etíopes. No se proporcionan detalles sobre la arquitectura interna (número de capas, dimensiones, tipo de atención) ni sobre el dataset de entrenamiento, que se describe como "desconocido". El proceso de fine-tuning se realizó con el Trainer de HuggingFace, utilizando los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 16, batch size de evaluación de 32, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler de tipo coseno con 300 pasos de warmup, 10 épocas y entrenamiento con precisión mixta (Native AMP). No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado para una tarea de clasificación de stance.

## Capacidades

- Detección de stance (postura) en textos: clasifica si un texto expresa una posición a favor, en contra o neutral respecto a un tema.
- Clasificación de texto supervisada, probablemente multiclase (aunque no se especifica el número de clases).
- Orientado a lenguas etíopes, según el modelo base, aunque no se detallan los idiomas concretos.
- No se reportan capacidades de generación de texto, razonamiento, código, tool calling ni agentes.

## Casos de uso

- Análisis de opinión en redes sociales: el modelo puede procesar publicaciones en lenguas etíopes para identificar la postura de los usuarios sobre temas políticos, sociales o económicos, facilitando el monitoreo de tendencias.
- Monitoreo de debates parlamentarios: clasificar discursos o transcripciones de sesiones legislativas para determinar la posición de los representantes sobre proyectos de ley.
- Análisis de comentarios en noticias: evaluar la reacción de la audiencia ante artículos periodísticos, agrupando comentarios por postura para medir el sentimiento público.
- Investigación académica en ciencias sociales: apoyar estudios sobre opinión pública en Etiopía y países vecinos, proporcionando una herramienta automatizada para etiquetar corpus de texto.
- Moderación de contenido en foros: identificar mensajes con posturas extremas o polarizadas para priorizar la revisión humana en plataformas de discusión.
- Evaluación de campañas de marketing: medir la recepción de productos o servicios en mercados etíopes analizando menciones en redes y reseñas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0,9751 |
| Precision (stance) | 0,7326 |
| Recall (stance) | 0,7394 |
| F1 | 0,7353 |
| Accuracy (stance) | 0,7282 |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. La tabla de entrenamiento muestra una mejora progresiva del F1 desde 0,4173 en la primera época hasta 0,7353 en la décima, con una ligera disminución en las últimas épocas, lo que sugiere un posible sobreajuste leve.

## Requisitos de hardware

- VRAM estimada para inferencia: con 559,9 millones de parámetros, en fp32 se requieren aproximadamente 2,2 GB de memoria, en fp16 unos 1,1 GB y en int8 unos 0,6 GB. Sin embargo, al no estar cuantizado, el uso real dependerá del formato de carga.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16, como una NVIDIA GTX 1650 o superior. Para mayor comodidad, una RTX 3060 o superior es adecuada.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales (RTX 20/30/40 series) con suficiente VRAM.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la API de HuggingFace. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporciona ese formato.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por ejemplo en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de detección de stance específicos para lenguas etíopes. El modelo base EthioLLM-l-250K es la referencia principal, pero no se han publicado comparativas de rendimiento entre ambos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: al estar entrenado sobre un dataset desconocido, puede heredar sesgos presentes en los datos de entrenamiento, especialmente en temas políticos o sociales de la región etíope.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación es bajo, pero puede cometer errores de clasificación en casos ambiguos.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada; se recomienda verificar el tokenizador del modelo base para conocer el límite.
- Limitaciones de idioma: aunque el modelo base está orientado a lenguas etíopes, no se confirma qué idiomas exactos soporta el fine-tuning; su uso fuera de ese ámbito puede degradar el rendimiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución sin restricciones, siempre que se incluya el aviso de copyright.
- Caveat para producción: el modelo no ha sido evaluado en entornos reales ni con datos externos; se recomienda validar su rendimiento con un conjunto propio antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/STL-ethiollm-l-250K-stance
- Modelo base EthioLLM-l-250K: https://huggingface.co/EthioNLP/EthioLLM-l-250K
- Paper de EthioLLM (referenciado en la búsqueda web, sin URL directa): "EthioLLM: Multilingual Large Language Models for Ethiopian Languages with Task Evaluation" (Tonja et al., 2024).
