# yaghmood/sam-audio-large-fp16-pytorch

## Resumen

SAM-Audio (Segment Anything Model for Audio) es un modelo de separación de fuentes sonoras guiado por prompts: dado un audio y una descripción (por ejemplo, «A man speaking» o una indicación visual o temporal), devuelve la pista aislada de la fuente descrita y el residuo con el resto de la mezcla. El modelo original lo desarrolla Meta (Facebook Research), y esta ficha describe `yaghmood/sam-audio-large-fp16-pytorch`, una resubida no oficial en float16 de `facebook/sam-audio-large` para PyTorch/CUDA.

El repositorio no introduce cambios de arquitectura ni de pesos: es una conversión tensor a tensor del `checkpoint.pt` original (1345 tensores, todos en float16) que reduce el peso en disco de 14,86 GB en fp32 a 7,43 GB en fp16. Es relevante porque las únicas copias fp16 previas en el Hub estaban en formato MLX para Apple Silicon y no se podían cargar desde PyTorch, de modo que esta es la vía práctica para trabajar en CUDA con un checkpoint más ligero.

Se trata de un modelo multimodal de audio (texto, audio y visión), con licencia propietaria `sam-license` y prompts en inglés. No es un modelo de lenguaje: su tarea es audio-audio, y el checkpoint contiene únicamente el separador (transformer, códec de audio, encoder de visión y capas de proyección/anclaje); los codificadores de texto, el predictor de spans y los rankers se descargan por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de separacion de audio; el checkpoint incluye `transformer`, `audio_codec`, `vision_encoder` y capas de proyeccion/anclaje. Detalle interno de capas y atencion: no disponible |
| Parametros totales | no disponible (el autor no declara cifra; los 7,43 GB de pesos fp16 equivalen a unos 3700 millones de parametros si todos los tensores son pesos, calculo no confirmado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre clips de audio; en las pruebas se uso un clip de 3 s) |
| Tipos de cuantizacion | fp16 (este repo) y fp32 (repo original). No hay versiones GGUF, INT8 ni INT4 publicadas |
| Idiomas soportados | en (prompts de texto en ingles) |
| Licencia | sam-license (licencia personalizada de Meta, etiquetada como `other`; enlace `LICENSE` en el repo) |
| Formato de pesos | PyTorch (`checkpoint.pt`, 1345 tensores en float16) mas `config.json` sin modificar del upstream; no hay GGUF ni MLX en este repo |

Datos adicionales del repositorio: tamano de repo 7,4 GB, pipeline `audio-to-audio`, 0 descargas y 1 like en el momento de la consulta, creado el 4 de octubre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema de segmentacion de audio guiado por prompts, con tres modalidades de indicacion: texto, visual (requiere SAM3 para generar mascaras) y anclajes de span/temporal. El checkpoint distribuido contiene el separador propiamente dicho: un `transformer`, un `audio_codec`, un `vision_encoder` y las capas de proyeccion y anclaje. La salida de `model.separate()` son dos listas de tensores, `result.target` (la fuente descrita) y `result.residual` (el resto).

El repositorio de esta ficha es exclusivamente una conversion de precision: se transformaron los 1345 tensores del `checkpoint.pt` original a float16 uno a uno, sin ninguna otra modificacion, y se mantuvo el `config.json` del upstream. Por tanto, no aporta datos nuevos de entrenamiento, RLHF/DPO ni innovaciones tecnicas respecto al modelo de Meta. Componentes auxiliares que no estan en el checkpoint: el codificador de texto `t5-base`, el predictor de spans `pe-a-frame-large` y los rankers (`facebook/sam-audio-judge`, que es un repo con acceso restringido, ademas de CLAP e ImageBind); `sam_audio` los descarga desde sus propios repositorios al construir el modelo. Los detalles de composicion del dataset y numero de tokens de entrenamiento no estan disponibles en la informacion proporcionada.

## Capacidades

- Separacion de fuentes guiada por texto: aislar la fuente descrita en lenguaje natural (por ejemplo, «A man speaking») y devolver el residuo con el resto de la mezcla.
- Prompts multimodales: soporta indicacion por texto, por vision (necesita mascaras de SAM3) y por anclajes de span o temporales.
- Reordenacion (reranking) opcional de candidatos de separacion mediante `facebook/sam-audio-judge`, activa cuando `reranking_candidates > 1`.
- Prediccion de spans temporales mediante `pe-a-frame-large`, que permite localizar en el tiempo la fuente descrita.
- Entrada y salida de audio: trabaja con formas de onda, con muestreo gestionado por `SAMAudioProcessor`.
- Soporte de inferencia en fp16 con autocast en CUDA, con pesos en float16 y modelo construido en float16.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, codigo ni matematicas: no es un modelo de lenguaje.
- Idiomas: unicamente ingles en los prompts de texto.

## Casos de uso

- Extraccion de voces para podcasts y entrevistas: procesar la grabacion con un prompt de habla y obtener `result.target` con la voz limpia y `result.residual` con musica y ruido de fondo, util para reutilizar la locucion o publicar una version alternativa.
- Preprocesado para ASR: separar el hablante principal antes de enviar el audio a un sistema de transcripcion, reduciendo el impacto de musica o ruido en la tasa de error.
- Postproduccion de cine y video: aislar un instrumento o un efecto concreto (por ejemplo, «guitar») para reequilibrar la mezcla sin volver a grabar, apoyandose en el residuo para no perder el resto de la escena sonora.
- Generacion de stems para musica y remezclas: dividir una pista en componentes descritos por texto para crear versiones instrumentales, remixes o material para practicas.
- Limpieza de grabaciones de campo: eliminar sonidos concretos (trafico, viento, conversaciones de fondo) descritos en el prompt, conservando el sonido objetivo y el residuo por separado.
- Analisis forense y revision de audio: aislar una fuente o un hablante concreto de una grabacion compleja para su posterior inspeccion, con la salvedad de que el modelo no verifica autenticidad ni aporta trazabilidad.
- Investigacion en separacion guiada por lenguaje: usar esta copia fp16 como punto de partida reproducible en CUDA para comparar estrategias de prompting, reranking o prediccion de spans frente al checkpoint fp32 de Meta.
- Procesado por lotes en GPUs economicas: con picos medidos de 8,0 GiB de VRAM en una T4 de Colab, es viable montar un servicio de separacion en hardware de gama media-baja, siempre que se tenga en cuenta el tiempo de carga del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son mediciones de carga e inferencia, no de calidad de separacion:

| Escenario | Hardware | Carga del modelo | Inferencia | Pico de VRAM |
|---|---|---|---|---|
| Colab gratuito, con `map_location="cuda"` | T4, 12,7 GB de RAM | 78 s | 7 s para un clip de 3 s | 8,0 GiB |
| Kaggle, sin `map_location` | T4, 30 GB de RAM | no disponible | no disponible | 11,1 GiB en entradas mas largas |

No se proporcionan cifras de SDR, SI-SNR ni comparaciones con otros separadores. No se deben inferir valores de calidad a partir de estos datos de latencia.

## Requisitos de hardware

- VRAM estimada: 8,0 GiB de pico medidos en una T4 de Colab con un clip de 3 s; 11,1 GiB en una T4 de Kaggle con entradas mas largas y sin `map_location`. La VRAM depende de la duracion del audio procesado.
- GPU recomendadas: NVIDIA T4 (16 GB) verificada por el autor; cualquier GPU CUDA con al menos 12 GB de VRAM es un punto de partida razonable segun las mediciones. A100, H100, RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) deberian acomodar el modelo segun esos picos, aunque no hay pruebas publicadas en estas tarjetas.
- GPU de consumo: si, cabe en tarjetas consumer de 16 GB o mas. Verificado en T4; en GPUs con menos de 12 GB de VRAM el margen es insuficiente segun los picos reportados.
- RAM del sistema: el autor advierte de que sin `map_location="cuda"` el checkpoint y el modelo coexisten en RAM (unos 15 GB) y una sesion gratuita de Colab se queda sin memoria. El propio autor documenta un pico de 11,1 GiB en Kaggle con 30 GB de RAM.
- Opciones de despliegue: PyTorch/CUDA con la libreria `sam_audio` (`pip install git+https://github.com/facebookresearch/sam-audio.git "huggingface_hub<1.0" "transformers>=4.54,<5"`). No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. Para Apple Silicon existen copias fp16 en formato MLX del mismo modelo original.
- Entorno: requiere un entorno limpio; la instalacion degrada `numpy` a 1.x y `protobuf` a 3.19, lo que entra en conflicto con otros paquetes. En Colab hay que reiniciar la sesion tras instalar para evitar el error `numpy.dtype size changed`. Si `transformers` tropieza con TensorFlow, hay que definir `USE_TF=0` y `USE_FLAX=0` antes de importar.
- Rendimiento y latencia: carga de 78 s y 7 s de inferencia para un clip de 3 s en T4 segun el autor. No hay datos de throughput para lotes.

## Comparativa con modelos similares

| Modelo | Precision y tamano | Formato | Prompts soportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yaghmood/sam-audio-large-fp16-pytorch | float16, 7,43 GB | PyTorch, cargable con `sam_audio` | texto (probado); vision y spans no probados en fp16 | sam-license | Publico en el Hub |
| facebook/sam-audio-large | float32, 14,86 GB | PyTorch (upstream) | texto, visual y span/temporal | sam-license | Publico en el Hub |
| mlx-community/sam-audio-*-fp16 | float16 | MLX para Apple Silicon | no disponible | no disponible | Publico en el Hub; no cargable desde PyTorch |

La diferencia entre las dos primeras es exclusivamente el peso en disco y la precision de los tensores: misma arquitectura, mismos pesos convertidos y mismo `config.json`. El autor no publica comparaciones de calidad entre fp16 y fp32, por lo que no se puede afirmar que la salida sea identica sin una evaluacion propia. No se dispone de comparaciones con otros modelos de separacion de fuentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un reupload oficial: el autor lo etiqueta explicitamente como no oficial. Para uso en produccion conviene validar los pesos frente al checkpoint original de Meta.
- La licencia `sam-license` es una licencia personalizada de Meta etiquetada como `other`; las condiciones exactas de uso comercial no estan detalladas en la informacion proporcionada y deben revisarse en el archivo `LICENSE` antes de cualquier despliegue.
- Los rankers del upstream dependen de `facebook/sam-audio-judge`, un repositorio con acceso restringido: usarlos exige solicitud aprobada e inicio de sesion con token. La via probada por el autor los desactiva (`visual_ranker=None, text_ranker=None`) y solo son relevantes con `reranking_candidates > 1`.
- Las rutas de prompting visual (requiere SAM3 para mascaras), prediccion de spans y reranking no han sido probadas por el autor con el casting a fp16 de este repositorio.
- Solo se ha probado la modalidad de prompting por texto, y unicamente en ingles.
- Riesgo de separacion incorrecta: al estar guiado por lenguaje natural, una descripcion ambigua o poco frecuente puede producir un `target` que no corresponda a la fuente deseada. No hay datos publicados de robustez ni de tasas de fallo.
- El paso a fp16 no reduce la VRAM por si solo: si se carga el modelo sin castear explicitamente con `.to("cuda", dtype=torch.float16)`, `load_state_dict` copia los valores fp16 en parametros fp32 y se obtiene un modelo en float32, con el ahorro limitado al tamano de descarga.
- El forward en fp16 exige `torch.autocast`, porque `SAMAudioProcessor` genera las caracteristicas de entrada en fp32; sin autocast falla por discrepancia de tipos.
- La instalacion degrada `numpy` a 1.x y `protobuf` a 3.19 y exige `huggingface_hub<1.0` (la libreria `sam_audio` sobrescribe `_from_pretrained` con la firma de la serie 0.x). Esto puede romper otros paquetes del mismo entorno.
- El consumo de VRAM crece con la duracion del audio; los picos medidos (8,0 y 11,1 GiB) corresponden a clips cortos y a entradas mas largas, respectivamente.
- No hay informacion sobre sesgos, comportamiento multilingue ni evaluacion de equidad en la documentacion disponible.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/yaghmood/sam-audio-large-fp16-pytorch
- Modelo base original: https://huggingface.co/facebook/sam-audio-large
- Model card original de SAM-Audio: https://huggingface.co/facebook/sam-audio-large
- Paper (arXiv:2512.18099): https://arxiv.org/abs/2512.18099
- Blog de Meta AI: https://ai.meta.com/blog/sam-audio/
- Publicacion de investigacion de Meta: https://ai.meta.com/research/publications/sam-audio-segment-anything-in-audio/
- Demo de Meta: https://aidemos.meta.com/segment-anything/editor/segment-audio
- Repositorio de codigo: https://github.com/facebookresearch/sam-audio
- Perception-Encoder Audio-Visual (PE-AV): https://huggingface.co/facebook/pe-av-large
- Publicacion de PE-AV: https://ai.meta.com/research/publications/pushing-the-frontier-of-audiovisual-perception-with-large-scale-multimodal-correspondence-learning/
- Modelo juez con acceso restringido: https://huggingface.co/facebook/sam-audio-judge
- Copias fp16 en formato MLX para Apple Silicon: https://huggingface.co/mlx-community/sam-audio-large-fp16
