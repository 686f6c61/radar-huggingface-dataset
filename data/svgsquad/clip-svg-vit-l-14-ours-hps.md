# SVGsquad/clip-svg-ViT-L-14-ours-hps

## Resumen

CLIP-SVG ViT-L/14 con alineación de preferencias humanas (HPS-style) es un modelo de visión-lenguaje desarrollado por el equipo de SVGsquad. Se trata de un checkpoint que fusiona un adaptador LoRA de rango 16 en el modelo base [`SVGsquad/clip-svg-ViT-L-14-ours`](https://huggingface.co/SVGsquad/clip-svg-ViT-L-14-ours), con el objetivo de mejorar la correlación entre las representaciones de texto e imagen SVG con las preferencias humanas de alineación semántica. El modelo emplea la arquitectura CLIP ViT-L/14, con 427,6 millones de parámetros, y está diseñado para codificar captions y renders de SVGs en un espacio vectorial compartido.

La relevancia de este modelo radica en su aplicación específica al dominio de gráficos vectoriales escalables (SVG). A diferencia de los CLIP genéricos entrenados sobre fotografías, este modelo ha sido ajustado con pares de preferencias humanas dentro de la misma caption, lo que permite evaluar y ordenar la calidad de diferentes SVGs que representan el mismo concepto. Esto lo convierte en una herramienta útil para tareas de evaluación automática de generación de SVGs, búsqueda semántica y control de calidad en pipelines de generación.

El modelo se distribuye en formato safetensors, es compatible con la librería `transformers` y puede utilizarse para clasificación de imágenes zero-shot y para calcular similitud coseno entre embeddings de texto e imagen. No se ha publicado información sobre la licencia, los idiomas soportados ni el proceso de entrenamiento completo más allá del ajuste con preferencias humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (Vision Transformer con patch de 14x14) |
| Parametros totales | 427.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CLIP (Contrastive Language-Image Pre-training) con un encoder de visión ViT-L/14 y un encoder de texto Transformer. Ambos encoders proyectan sus entradas a un espacio vectorial compartido de 768 dimensiones, donde se calcula la similitud coseno entre las representaciones L2-normalizadas. El checkpoint presentado incorpora un adaptador LoRA de rango 16 que se entrena sobre pares de preferencias humanas extraídos del dataset `SVGsquad/svg-human-judgements-caption-image-disjoint-80-20`. El adaptador actualiza únicamente las proyecciones de query y value en los dos últimos bloques transformer de los encoders de imagen y texto, utilizando una pérdida de preferencia bidireccional. Los pesos LoRA se fusionaron con el modelo base mediante `PeftModel.merge_and_unload`, por lo que el resultado es un modelo denso sin capas adicionales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset más allá de su partición (80-20) ni sobre el uso de técnicas como RLHF o DPO. El entrenamiento del adaptador se centra exclusivamente en la alineación con juicios humanos sobre SVGs, no en el preentrenamiento contrastivo original.

## Capacidades

- Codificación conjunta de texto e imágenes SVG en un espacio vectorial compartido de 768 dimensiones.
- Clasificación de imágenes zero-shot mediante similitud coseno entre embeddings de caption y render.
- Evaluación de alineación semántica entre captions y SVGs, con correlación con juicios humanos (Pearson 0.5969, Spearman 0.6087 en test).
- Ordenación de múltiples SVGs para una misma caption según su alineación con preferencias humanas.
- Compatible con la API `CLIPModel` de `transformers`, lo que facilita su integración en pipelines existentes.
- No soporta generación de texto ni tool calling; es exclusivamente un modelo de representaciones.

## Casos de uso

- Evaluación automática de calidad de SVGs generados por modelos de texto a imagen: el modelo puntúa cada SVG renderizado según su alineación con la caption, permitiendo filtrar o rankear salidas en pipelines de generación.
- Búsqueda semántica de SVGs en bases de datos: al codificar captions y renders en el mismo espacio, se pueden recuperar los SVGs más relevantes para una consulta textual.
- Control de calidad en datasets de SVGs: el modelo puede detectar SVGs mal alineados con sus etiquetas, facilitando la limpieza de datasets de entrenamiento.
- Comparación de modelos generativos de SVG: al medir la correlación entre las salidas de distintos generadores y las preferencias humanas, se puede comparar objetivamente su rendimiento.
- Sistemas de recomendación de iconos o ilustraciones: dado un texto descriptivo, el modelo sugiere los SVGs más adecuados de una colección.
- Investigación en alineación de preferencias humanas: sirve como referencia para estudiar cómo los adaptadores LoRA pueden transferir juicios subjetivos a modelos de visión-lenguaje.

## Benchmarks y rendimiento

El autor del modelo reporta resultados en el conjunto de test retenido (2.374 SVGs, renders blancos de 448px). Las métricas de correlación con puntuaciones humanas de alineación semántica son:

| Metrica | Valor |
|---|---|
| Pearson | 0.5969 |
| Kendall tau-b | 0.4688 |
| Spearman | 0.6087 |

No se han publicado comparaciones con otros modelos CLIP o variantes ajustadas con preferencias en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM ni latencia en la documentación del modelo.
- Con 427,6 millones de parámetros y un tamaño de repo de 0,9 GB en safetensors, se estima que el modelo puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM en precisión fp16 (aproximadamente 0,85 GB de pesos), o en 8 GB para fp32.
- GPUs recomendadas según disponibilidad: NVIDIA RTX 3060, RTX 4070, A100, H100, o cualquier GPU con soporte CUDA y suficiente memoria.
- Opciones de despliegue: al ser un modelo de `transformers`, puede cargarse con la librería estándar, o servirse mediante herramientas compatibles con CLIP como `sentence-transformers`, aunque no se ha confirmado soporte en vLLM, Ollama o TGI.
- La inferencia es de baja latencia al tratarse de un modelo de embeddings (sin generación autoregresiva), típicamente milisegundos por par texto-imagen en hardware moderno.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| SVGsquad/clip-svg-ViT-L-14-ours-hps | CLIP ViT-L/14 + LoRA | 427M | No aplica | Pearson 0.5969 en test SVG | No disponible |
| OpenAI CLIP ViT-L/14 | CLIP ViT-L/14 | ~400M | No aplica | No comparable (entrenado en imágenes naturales) | MIT (uso comercial permitido) |
| LAION CLIP ViT-L/14 (laion2B) | CLIP ViT-L/14 | ~400M | No aplica | No comparable (entrenado en LAION-5B) | MIT (uso comercial permitido) |

No se dispone de benchmarks comparativos directos entre estos modelos en el dominio SVG. La comparativa se limita a características arquitectónicas y de entrenamiento; el modelo de SVGsquad está especializado en SVGs, mientras que los otros son de propósito general.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones; al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es nulo.
- El modelo está especializado en SVGs renderizados en blanco sobre fondo blanco (448px), por lo que su rendimiento en otros formatos o estilos puede degradarse.
- La licencia no está especificada, lo que impide determinar si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El entrenamiento del adaptador se realizó sobre un dataset con partición 80-20, pero no se detalla el volumen total de pares ni la diversidad de captions, lo que limita la generalización a dominios fuera del conjunto de entrenamiento.
- Al ser un modelo de representaciones, no puede realizar tareas generativas ni de razonamiento multi-paso; su uso se limita a tareas de similitud y ranking.
- No se han publicado resultados de rendimiento en otros benchmarks estándar (MMLU, HumanEval, etc.), por lo que no es adecuado para tareas de texto puro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SVGsquad/clip-svg-ViT-L-14-ours-hps
- Modelo base: https://huggingface.co/SVGsquad/clip-svg-ViT-L-14-ours
- CLIP ViT-L/14 de OrcaDB (referencia): https://huggingface.co/OrcaDB/clip-ViT-L-14
- Descripción de CLIP ViT-L/14 en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/clip-vit-l-14-sentence-transformers
- LAION CLIP ViT-L/14 (laion2B): https://huggingface.co/laion/CLIP-ViT-L-14-laion2B-s32B-b82K
- Repositorio de referencia sobre CLIP ViT-L/14: https://github.com/maigaridavid/CLIP_VIT-L14
