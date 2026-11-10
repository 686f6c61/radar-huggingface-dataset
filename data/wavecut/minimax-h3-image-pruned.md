# WaveCut/MiniMax-H3-Image-Pruned

## Resumen

MiniMax-H3-Image-Pruned es una versión podada del modelo de generación y edición de imágenes MiniMax-H3-Image, publicada por el usuario WaveCut sobre el checkpoint oficial de MiniMaxAI. El modelo conserva únicamente los pesos que la inferencia realmente utiliza: elimina las proyecciones AdaLN (sustituidas por tablas de 116 MB), las capas 50-63 del codificador de texto Qwen3-VL-32B y la cabeza `lm_head`, además de saltar el cómputo de filas muertas en el último bloque del transformer. El resultado pasa de 135,3 GB a 94,1 GB en disco sin cuantización ni reentrenamiento, con salidas bit a bit idénticas a las del original en la misma GPU.

La relevancia práctica está en el ahorro de memoria: el transformer baja de 66,3 GB (33,1B parámetros) a 40,3 GB (20,1B parámetros) y el codificador de texto de 66,7 GB a 51,5 GB. Eso permite mantener ambos modelos residentes en una GPU de 96 GB (RTX PRO 6000 Blackwell), eliminando el offload por imagen que penaliza al original. Según las mediciones del autor, una generación a 4736×3552 pasa de 101,2 s a 26,3 s en ese hardware.

Se distribuye en formato diffusers/safetensors, con un cargador propio (`minimax_h3_image_pruned`) y dependencia de una revisión concreta de Diffusers con soporte para MiniMax-H3-Image. La licencia es la MiniMax-H3-Image Community License, no estándar y heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de imagen MiniMax-H3-Image) + codificador de texto Qwen3-VL-32B + VAE |
| Parametros totales | 20.128.273.984 (transformer podado; el checkpoint completo incluye además el codificador de texto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (condicionamiento de texto con 36 a 1757 tokens en las pruebas del autor) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bfloat16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (la guía de prompting recomienda descripciones en inglés) |
| Licencia | minimax-h3-image-community-license |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para texto-a-imagen y edición de imágenes, derivado del MiniMax-H3-Image original. No se ha reentrenado: cada tensor conservado es una copia byte a byte del checkpoint `MiniMaxAI/MiniMax-H3-Image@492fd8c4`. La poda se apoya en dos observaciones sobre el pipeline de inferencia. Primero, el checkpoint muestrea en una rejilla fija de seis pasos (una cabeza de salida por paso) y las imágenes de referencia en edición permanecen en t = 0.999, de modo que las proyecciones AdaLN solo producen un conjunto fijo de valores; se sustituyen por tablas de 116 MB calculadas con los módulos originales y se eliminan `time_embedder` y `norm_out.linear`. Un tercio de cada proyección servía a la modalidad de audio de MiniMax-H3, que el modelo de imagen no usa, y no se conserva.

Segundo, el transformer se condiciona sobre `hidden_states[50]` del codificador Qwen3-VL, es decir, la salida de la capa 49 del decodificador; todo lo posterior (capas 50-63 y `lm_head`) es irrelevante y se elimina, dejando un stack de 50 capas. Además, en el último bloque solo se leen las filas de la imagen generada: las filas de texto y de referencia siguen aportando claves y valores, pero se saltan sus queries, salida de atención y feed-forward (`skip_dead_rows`). El VAE (2,3 GB) queda intacto. El codificador de texto requiere `adapt_text_encoder` tras la carga, que reemplaza la norma final por una identidad para que el último estado oculto del stack de 50 capas sea el condicionamiento.

## Capacidades

- Generación de imágenes texto-a-imagen con resoluciones recomendadas desde 4096×4096 (1:1) hasta 6272×2688 (21:9).
- Edición de imágenes: se pasa una imagen de referencia (o una lista) y se referencian en el prompt como `<Picture 1>`, `<Picture 2>`, etc.
- Condicionamiento de texto mediante Qwen3-VL-32B truncado a 50 capas.
- Muestreo en una rejilla fija de seis pasos; el transformer lanza un error para otros timesteps.
- Salidas bit a bit idénticas al modelo original en la misma GPU y con las mismas semillas.
- No se documentan capacidades de tool calling, agentes, audio o visión más allá del uso del codificador de texto.

## Casos de uso

- Generación de imágenes de alta resolución en producción: el modelo permite renderizar a 4736×3552 en 26,3 s sobre una RTX PRO 6000 Blackwell, adecuado para pipelines de contenido editorial o catálogos que necesitan resoluciones grandes sin offload.
- Edición de imágenes con referencias múltiples: pasar una o varias imágenes y describir cambios en el prompt permite flujos de retoque y variación de producto con consistencia respecto a la referencia.
- Despliegue en GPUs de 96 GB: al caber transformer y codificador de texto residentes (85,5 GiB), se evita el gestor de offload y se reduce la latencia por imagen de forma drástica frente al original.
- Sustitución directa del checkpoint original en pipelines existentes: al ser bit a bit idéntico, sirve para reducir huella en disco (94,1 GB frente a 135,3 GB) y memoria sin cambiar prompts ni semillas.
- Investigación en eficiencia de modelos de difusión: la técnica de tabular proyecciones AdaLN y truncar el codificador de texto es un caso reproducible con scripts de construcción y verificación publicados.
- Servicios de generación de imágenes autoalojados con requisitos de reproducibilidad: la verificación bit a bit con prompts y semillas fijas facilita auditorías y comparaciones de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí publica mediciones de tiempo y memoria en una RTX PRO 6000 Blackwell (96 GB), bfloat16, tras una imagen de calentamiento, incluyendo codificación de prompt, seis pasos y decodificación VAE:

| Ejecución | 2048×2048 | Edición, 2048×2048 | 4736×3552 | Pico de memoria, 4736×3552 |
|---|---|---|---|---|
| Original, model offload | 80,3 s | 83,7 s | 101,2 s | 68,2 GiB |
| Podado, model offload | 5,8 s | 9,2 s | 26,3 s | 92,6 GiB |
| Podado, todo en GPU (`offload=False`) | 5,5 s | 8,9 s | 25,8 s | 92,6 GiB |

La diferencia de tiempo se atribuye a la memoria, no al cómputo: el original (124 GiB entre transformer y codificador) no cabe en 96 GB y se mueve en cada imagen, mientras que el podado (85,5 GiB) permanece residente. En GPUs de 141 GB o más se esperan tiempos similares para ambos; en 80 GB el podado también alterna en GPU, con menos datos que mover (no medido).

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image-Pruned | 20,1B (podado de 33,1B) | Rejilla fija de 6 pasos; 4096×4096 a 6272×2688 | minimax-h3-image-community-license | Hugging Face (WaveCut) |
| MiniMax-H3-Image (original) | 33,1B | Rejilla fija de 6 pasos; mismas resoluciones | minimax-h3-image-community-license | Hugging Face (MiniMaxAI) |
| Otros modelos de texto-a-imagen de escala similar | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: el podado reduce el transformer un 39 % en parámetros y el checkpoint un 30 % en disco, mantiene salidas idénticas y mejora la latencia en GPUs donde el original no cabe. No se dispone de datos de benchmarks frente a otras familias de modelos de imagen.

## Limitaciones y advertencias

- Solo funciona con la rejilla de muestreo de seis pasos del release; las tablas no contienen otros timesteps y el transformer lanza un error para ellos.
- Las tablas se calcularon en una RTX PRO 6000 Blackwell; en otro tipo de GPU el original puede redondear sus salidas AdaLN de forma distinta en pasos bfloat16, por lo que las salidas pueden diferir ligeramente del original en ese hardware.
- La licencia MiniMax-H3-Image Community License no es estándar; hay que revisar sus restricciones antes de uso comercial.
- El modelo base es de noviembre de 2026 y el podado se publicó el mismo día, con 0 descargas y 0 likes: no hay validación independiente de la comunidad.
- Riesgo de alucinación visual y de sesgos heredados del checkpoint original; no se documentan evaluaciones de sesgo en la información disponible.
- La guía de prompting recomienda descripciones largas y completas en inglés; no se documenta soporte multilingüe.
- Requiere instalar un cargador propio y una revisión concreta de Diffusers (`875373ac`), además de `transformers>=5.22`, lo que añade fricción de integración.
- El repositorio ocupa 94,1 GB, lo que exige almacenamiento considerable y complica su distribución en entornos con cuotas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/MiniMax-H3-Image-Pruned
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio del podado (cargador, scripts de construcción y verificación): https://github.com/iamwavecut/MiniMax-H3-Image-Pruned
- Diffusers (revisión con soporte MiniMax-H3-Image): https://github.com/huggingface/diffusers/tree/875373ac7f5856071e345a3e394c74efccc6b9e6
- Licencia: https://huggingface.co/WaveCut/MiniMax-H3-Image-Pruned/blob/main/LICENSE
