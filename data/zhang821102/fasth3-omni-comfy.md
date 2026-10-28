# zhang821102/FastH3-Omni-Comfy

## Resumen

FastH3-Omni-Comfy es un paquete de pesos en formato de fichero único para ComfyUI del modelo FastH3 Omni, un modelo de difusión que genera vídeo y audio sincronizado a partir de un prompt de texto y de referencias ordenadas de imagen, vídeo y audio (reference-to-video). El repositorio lo publica el usuario `zhang821102` como empaquetado listo para ComfyUI del checkpoint oficial `FastVideo/FastVideo-FastH3-Omni-8-Step-V1`; el modelo original lo desarrollan FastVideo y Nuva Lab, con agradecimiento explícito al equipo NVIDIA FastGen.

La relevancia técnica está en dos frentes. Por un lado, es un modelo ómnimo: no solo anima referencias visuales, sino que sintetiza la pista de audio de forma conjunta mediante un VAE de audio dedicado, lo que evita el pipeline habitual de generar vídeo y doblar audio por separado. Por otro, está destilado o ajustado para muestrear en 8 pasos con guidance 1.0, lo que reduce drásticamente el coste de inferencia frente a los 20-50 pasos típicos de los modelos de difusión de vídeo.

El repositorio ocupa 169,4 GB e incluye, además del modelo de difusión en BF16 e INT8 ConvRot, los codificadores de texto (Qwen3-VL de 32B según la nomenclatura de los ficheros, en BF16, INT8 ConvRot y NVFP4 AWQ) y tres VAE (vídeo FP16, vídeo INT8 ConvRot y audio FP32). Está pensado para ejecutarse con una build reciente de ComfyUI con soporte nativo de MiniMax-H3; para otros runtimes (UniServe, FastVideo) el autor remite a los repositorios oficiales en otros formatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación conjunta de vídeo y audio; la información disponible no detalla el backbone interno (transformer de difusión, MoE, etc.) |
| Parámetros totales | No disponible (el checkpoint se distribuye "pruned" y el autor no publica recuento de parámetros) |
| Longitud de contexto | No disponible (no se especifican duración máxima de vídeo ni número máximo de referencias) |
| Tipos de cuantización | BF16, INT8 ConvRot (modelo de difusión y VAE de vídeo); BF16, INT8 ConvRot y NVFP4 AWQ (codificador de texto); FP16 y FP32 (VAE de vídeo y de audio) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-H3 Community License Agreement (`license: other`) |
| Formato de pesos | `safetensors`, distribuidos como `diffusion-single-file` para ComfyUI |
| Codificador de texto | Qwen3-VL 32B adaptado a MiniMax-H3, con torre de visión para las referencias |
| Pasos de muestreo | 8 pasos, guidance 1.0 |
| Shift de muestreo | Vídeo 12.0 / audio 3.0 |
| Tamaño del repositorio | 169,4 GB (incluye todas las variantes) |
| Entradas de referencia | Etiquetas `<Picture 1>`, `<Video 1>`, `<Audio 1>` en el prompt, en orden |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo de difusión que genera vídeo y audio de forma conjunta, con un VAE específico para cada modalidad y un codificador de texto multimodal (Qwen3-VL 32B) que incluye torre de visión para procesar las referencias visuales. El condicionamiento es de tipo reference-to-video: el prompt de texto se combina con referencias ordenadas de imagen, vídeo y audio etiquetadas explícitamente, lo que permite transferir identidad, estilo o pista sonora desde los materiales de entrada. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO (poco habituales en difusión).

El checkpoint distribuido aquí deriva de `FastVideo/FastVideo-FastH3-Omni-8-Step-V1`, una versión de 8 pasos, y se ofrece en variantes "pruned" (podadas) en BF16 e INT8 ConvRot. La innovación destacable es la cuantización ConvRot, que rota canales antes de cuantizar para reducir el error en INT8, y la disponibilidad de un codificador de texto en NVFP4 AWQ que acelera la codificación en hardware Blackwell. Nuva Lab co-desarrolló el modelo, definió y curó el dataset de referencias ómnimo y aportó flujos de trabajo creativos de producción, según la model card.

## Capacidades

- Generación de vídeo a partir de texto con referencias visuales y sonoras ordenadas (reference-to-video).
- Generación de audio sincronizado con el vídeo en la misma pasada, mediante VAE de audio dedicado.
- Aceptación de referencias mixtas: imágenes (`<Picture N>`), vídeos (`<Video N>`) y audio (`<Audio N>`) en un mismo prompt.
- Inferencia rápida: 8 pasos de muestreo con guidance 1.0, lo que abarata el coste por clip frente a esquemas de 20-50 pasos.
- Codificación de texto multimodal con torre de visión, necesaria para interpretar las referencias visuales.
- Ejecución en ComfyUI mediante el nodo de condicionamiento "MiniMax H3 Reference to Video".
- Compatibilidad con varios runtimes: ComfyUI (BF16/INT8), UniServe (BF16 en Hopper y Blackwell), FastVideo (NVFP4 QAD en DGX Spark y RTX 5090; FP8 en RTX 4090 con offload por capas).
- No se documentan en la información disponible capacidades de tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- **Publicidad y contenido de marca con coherencia de personaje**: se aporta una imagen o un clip del producto o del modelo y se genera un vídeo nuevo que preserva identidad y estilo, con audio sincronizado en la misma generación.
- **Doblaje y sustitución de voz en postproducción**: usando `<Audio 1>` como referencia sonora y una referencia visual, el modelo puede generar tomas donde el audio guía el resultado, útil para adaptar piezas a distintos mercados.
- **Previsualización de storyboards**: un equipo creativo convierte un guion en texto más una o dos imágenes de referencia en un clip animado con sonido, en 8 pasos de muestreo, para validar una idea antes de rodar.
- **Prototipado rápido en ComfyUI**: al ser un fichero único que se coloca en `models/diffusion_models/`, se integra en flujos de nodos existentes sin reescribir pipelines, lo que acelera la experimentación de artistas técnicos.
- **Generación de material para redes sociales a escala**: con INT8 ConvRot o NVFP4 se reduce el coste por clip, lo que permite procesar lotes de variaciones de un mismo concepto con distintas referencias.
- **Investigación en generación ómnima**: el par vídeo+audio con referencias ordenadas sirve como base para estudiar alineación audio-vídeo, fidelidad a la referencia y evaluación de modelos multimodales de difusión.
- **Despliegue en infraestructura propia**: sobre Hopper o Blackwell con UniServe en BF16, o en estaciones con RTX 5090 / DGX Spark usando NVFP4 QAD a través de FastVideo, para entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, alineación audio-vídeo, etc.) ni comparaciones numéricas con otros modelos. Tampoco se publican cifras de latencia o throughput por GPU.

## Requisitos de hardware

- **Huella de almacenamiento**: el repositorio completo ocupa 169,4 GB, pero solo hay que descargar una variante de cada componente (modelo de difusión, codificador de texto, VAE de vídeo y VAE de audio).
- **Codificador de texto**: un modelo de 32B en BF16 implica del orden de 64 GB solo en pesos; las variantes INT8 ConvRot y NVFP4 AWQ reducen esa cifra aproximadamente a la mitad y a un cuarto respectivamente (estimación aritmética a partir del número de parámetros, no publicada por el autor).
- **NVFP4**: la codificación de texto acelerada en NVFP4 requiere hardware Blackwell según la model card; en otros dispositivos hay que usar BF16 o INT8.
- **Vía oficial de altas prestaciones (UniServe, BF16)**: GB200/B200, RTX PRO 6000 Blackwell y GPUs Hopper.
- **Vía local (FastVideo)**: DGX Spark y RTX 5090 con pesos NVFP4 QAD en formato FastVideo.
- **Consumer GPU de gama alta**: RTX 4090 con la variante FP8 de FastVideo y offload por capas, usando componentes de codificador en BF16 compatibles (la model card enlaza una receta específica para RTX 4090).
- **ComfyUI**: requiere una build reciente con soporte nativo de MiniMax-H3 y el nodo de condicionamiento "MiniMax H3 Reference to Video". El autor advierte de que ComfyUI usa su propio layout de modelo, sampler y kernels, por lo que los resultados pueden diferir de FastVideo y UniServe.
- **Latencia y throughput**: no disponibles. Cualitativamente, el esquema de 8 pasos con guidance 1.0 reduce el número de evaluaciones del modelo frente a configuraciones de decenas de pasos, pero no se publican tiempos por clip.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. La comparación posible es entre las distintas distribuciones del mismo modelo:

| Distribución | Formato / cuantización | Runtime objetivo | Licencia | Notas |
|---|---|---|---|---|
| `zhang821102/FastH3-Omni-Comfy` (esta) | BF16 e INT8 ConvRot en fichero único | ComfyUI | MiniMax-H3 Community License | Reempaquetado por un tercero; incluye codificadores y VAE en el mismo repo |
| `FastVideo/FastVideo-FastH3-Omni-8-Step-V1` | BF16 | UniServe (Hopper, Blackwell) y runtimes nativos | MiniMax-H3 Community License | Checkpoint base oficial del que deriva este repo |
| `FastVideo/FastH3-OmniRef-FP8-Comfy` | FP8 | ComfyUI | MiniMax-H3 Community License | Alternativa para GPUs sin soporte NVFP4 |
| `FastVideo/FastH3-OmniRef-NVFP4-QAD` | NVFP4 QAD | FastVideo (DGX Spark, RTX 5090) | MiniMax-H3 Community License | Formato específico de FastVideo, no de ComfyUI |

## Limitaciones y advertencias

- **Licencia restrictiva y no estándar**: se rige por la MiniMax-H3 Community License Agreement, no por una licencia open source permisiva. Los términos concretos de uso comercial no se detallan en la información disponible; hay que leer el texto de la licencia antes de usarlo en producción.
- **Reempaquetado de terceros**: el repositorio lo publica `zhang821102`, no FastVideo ni Nuva Lab, y registra 0 descargas y 0 likes en el momento de la consulta. Para producción conviene partir de los repositorios oficiales.
- **Resultados dependientes del runtime**: ComfyUI emplea su propio layout, sampler y kernels; el propio autor advierte de que las salidas pueden diferir de las de FastVideo y UniServe. No es un checkpoint intercambiable entre runtimes.
- **Riesgo de alucinación visual y sonora**: como todo modelo generativo, puede producir detalles inconsistentes con las referencias (identidad, texto en pantalla, sincronía labial) y artefactos en movimientos rápidos. No se publican métricas de fidelidad.
- **Sesgos**: no hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo demográfico, cultural o de representación.
- **Cobertura idiomática desconocida**: no se documentan los idiomas soportados en prompts ni en audio generado.
- **Duración y resolución no especificadas**: no se indican límites de longitud de clip, resolución, fps ni número máximo de referencias, lo que complica el dimensionado de infraestructura.
- **Dependencia de hardware específico**: NVFP4 exige Blackwell; el camino en RTX 4090 pasa por FP8 con offload por capas, con la penalización de rendimiento que eso implica.
- **Sin benchmarks**: no es posible estimar calidad objetiva frente a alternativas sin evaluación propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zhang821102/FastH3-Omni-Comfy
- Modelo base (BF16, 8 pasos): https://huggingface.co/FastVideo/FastVideo-FastH3-Omni-8-Step-V1
- Colección de lanzamiento FastH3 Omni: https://huggingface.co/collections/FastVideo/fasth3-omniref
- Variante FP8 para ComfyUI: https://huggingface.co/FastVideo/FastH3-OmniRef-FP8-Comfy
- Variante NVFP4 QAD para ComfyUI: https://huggingface.co/FastVideo/FastH3-OmniRef-NVFP4-QAD-Comfy
- Pesos FP8 en formato FastVideo: https://huggingface.co/FastVideo/FastH3-OmniRef-FP8
- Pesos NVFP4 QAD en formato FastVideo: https://huggingface.co/FastVideo/FastH3-OmniRef-NVFP4-QAD
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Guía de despliegue en UniServe: https://github.com/hao-ai-lab/uniserve/blob/main/docs/minimax_h3/minimax_h3.md
- Guía de inferencia local en FastVideo: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/fasth3_omniref.md
- Cookbook de FastVideo: https://haoailab.com/FastVideo/cookbook/
- Constructor de recetas FastH3 Omni: https://haoailab.com/FastVideo/cookbook/minimax-h3/fasth3-omniref/
- Receta para DGX Spark: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_spark.yaml
- Receta para RTX 5090: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_rtx5090.yaml
- Receta FP8 para RTX 4090: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_rtx4090.yaml
- Página de Nuva Lab sobre FastH3-Omni: https://nuvalab.ai/fasth3/
- Licencia MiniMax-H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
