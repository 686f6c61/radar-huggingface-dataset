# timm/qwen3_vit_306m_merge.qwen3_vl_4b

## Resumen

`timm/qwen3_vit_306m_merge.qwen3_vl_4b` es un codificador de características de imagen (image feature encoder) extraído del torreón visual de Qwen3-VL-4B-Instruct y reempaquetado como modelo nativo de la librería timm (PyTorch Image Models, de Ross Wightman y Hugging Face). No es un modelo generativo: no incluye los pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada. Su función es producir embeddings de imagen y mapas de características espaciales listos para tareas de visión por computador.

El checkpoint conserva el merger espacial nativo del torreón visual de Qwen3-VL y la proyección al ancho del LLM (2560 dimensiones), seguida de average pooling y una LayerNorm sin parámetros afines. Esto lo hace especialmente interesante para proyectos que quieran reutilizar el espacio de representación del torreón visual de Qwen3-VL sin cargar los aproximadamente 4.000 millones de parámetros del modelo completo: son 332,7 millones de parámetros y 974,8 GMACs a 768x768 píxeles.

La relevancia actual viene de dos factores: por un lado, permite aprovechar características visuales de un VLM de última generación en pipelines ligeros de extracción de features; por otro, al estar envuelto como modelo timm, se integra con el ecosistema habitual (`timm.create_model`, `forward_features`, `forward_intermediates`, `features_only=True`) y admite fine-tuning de clasificación con una simple llamada a `num_classes`. La licencia Apache 2.0 y la ausencia de entrenamiento adicional simplifican su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con merger espacial nativo, proyeccion al ancho del LLM, average pooling y LayerNorm sin afin (afine-free) |
| Parametros totales | 332.727.808 (332,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (codificador de imagen; no procesa texto ni tiene ventana de contexto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en el precision original) |
| Idiomas soportados | no disponible (modelo puramente visual; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos en el repositorio de 1,3 GB, compatible con la carga via timm/huggingface_hub) |
| Tamano de imagen de referencia | 768 x 768 (admite entradas rectangulares) |
| GMACs | 974,8 (a 768 x 768) |
| Activaciones | 2610,9 M (a 768 x 768) |
| Ancho del backbone | 1024 |
| Ancho de proyeccion | 2560 |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revision ebb281ec70b05090aa6165b016eac8ec08e71b17) |
| Pipeline de HuggingFace | image-feature-extraction |
| Libreria | timm |

## Arquitectura y entrenamiento

Se trata de un transformer de vision puro (sin componentes de estado, convoluciones recurrentes ni mezcla MoE) derivado del torreón visual de Qwen3-VL-4B-Instruct. El backbone tiene un ancho de 1024 canales y emplea MLPs con activacion GELU-tanh, posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) y RoPE axial 2D que se regenera para cada tamano de imagen. La conversion a imagen estatica se resuelve colapsando el kernel temporal: las entradas repiten un unico fotograma y los pesos del Conv3d temporal se suman en un Conv2d, de modo que el modelo procesa una sola imagen sin la dimension de tiempo original.

Sobre el backbone se conserva el merger espacial nativo y la proyeccion al ancho del LLM (1024 -> 2560), seguida de average pooling y una LayerNorm sin parametros afines. Los proyectores DeepStack de Qwen3-VL se omiten deliberadamente. Las caracteristicas intermedias siguen siendo accesibles mediante `forward_intermediates()` o `features_only=True`. Es importante subrayar que este checkpoint es un remapeo nativo de los pesos de vision originales: no ha habido entrenamiento adicional, no contiene pesos del modelo de lenguaje y no incluye cabeza de clasificacion entrenada. Tampoco se documentan en la model card datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO, ya que el autor no entrena, sino que reempaqueta.

## Capacidades

- Extraccion de embeddings globales de imagen: `model(x)` devuelve un vector de 2560 dimensiones por imagen (forma `(1, 2560)` para un lote de una imagen).
- Extraccion de tokens espaciales proyectados: `forward_features(x)` devuelve tokens NLC `(1, 576, 2560)` a 768x768, es decir, una rejilla de 24x24 tokens proyectados al ancho del LLM.
- Extraccion de mapas de caracteristicas intermedias: `forward_intermediates()` con `output_fmt='NCHW'` devuelve, por ejemplo, `(1, 1024, 48, 48)`, util para tareas densas.
- Acceso a caracteristicas crudas del backbone: `encoder.forward_features()` devuelve caracteristicas NHWC sin proyectar.
- Fine-tuning de clasificacion: `timm.create_model(..., num_classes=N)` anade una cabeza lineal aleatoria que debe entrenarse con el dataset objetivo.
- Soporte de entradas rectangulares, con la restriccion de que cada dimension sea divisible por 16 (32 si se usa la variante con merger 2x2).
- Normalizacion integrada via `timm.data.resolve_model_data_config` con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.
- No dispone de generacion de texto, tool calling, soporte de agentes, razonamiento multi-paso, capacidades de audio ni modo thinking: al carecer de los pesos del LLM, todas las capacidades linguisticas del modelo base quedan fuera de este checkpoint.
- No se documentan capacidades multilingues (el modelo no procesa texto).

## Casos de uso

- Busqueda y recuperacion visual (image retrieval): usar `model(x)` para indexar un corpus de imagenes en vectores de 2560 dimensiones y construir un motor de busqueda por similitud coseno. Es adecuado porque el embedding procede de un torreon visual de VLM entrenado a gran escala, y el coste por imagen es de 974,8 GMACs.
- Clasificacion de imagenes con fine-tuning: cargar el modelo con `num_classes=N` y entrenar solo la cabeza lineal (o hacer fine-tuning completo) sobre un dataset propio. El backbone preentrenado reduce el volumen de datos necesario frente a entrenar desde cero.
- Deduplicacion y agrupamiento de imagenes: los embeddings globales permiten detectar near-duplicates y agrupar imagenes por similitud con tecnicas de clustering sobre los vectores de 2560 dimensiones.
- Backbone para tareas densas: deteccion, segmentacion o estimacion de profundidad usando `forward_intermediates()` o `features_only=True`, con mapas de `(1, 1024, 48, 48)` a 768x768.
- Alineacion y destilacion hacia el espacio de Qwen3-VL: al conservar el merger nativo y la proyeccion a 2560 (el ancho del LLM de Qwen3-VL), los embeddings resultantes son compatibles con ese espacio de representacion, lo que facilita alinear un adaptador ligero o destilar conocimiento desde el VLM completo.
- Control de calidad industrial y filtrado de contenido: clasificacion o scoring de imagenes en linea de produccion, con la ventaja de que el modelo cabe en una GPU de consumo.
- Sistemas de recomendacion visual: representar catalogo y consulta del usuario en el mismo espacio de 2560 dimensiones para recuperacion por vecinos mas cercanos en un indice vectorial.
- Preprocesado de pipelines multimodales: generar features de imagen en lote antes de alimentar un LLM multimodal o un sistema de captioning, sin cargar el VLM completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de coste computacional (974,8 GMACs y 2610,9 M de activaciones a 768x768) y el numero de parametros (332,7 M), pero no incluye resultados de ImageNet, zero-shot, retrieval ni ninguna otra evaluacion. Tampoco se han encontrado datos de benchmarks en los resultados de busqueda web, que se limitan a la documentacion general de la libreria timm.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, aproximadamente 1,33 GB (coincide con el tamano del repositorio, 1,3 GB); en fp16/bf16, unos 0,67 GB; en int8, unos 0,33 GB. No se publican pesos cuantizados, por lo que las cifras en precision reducida implican cuantizar uno mismo.
- Consideracion adicional: la model card declara 2610,9 M de activaciones a 768x768, de modo que la memoria de trabajo durante la inferencia en fp32 puede superar holgadamente la de los pesos; conviene usar fp16/bf16, `torch.inference_mode()` y lotes pequenos para mantener el consumo bajo control.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM deberia ser suficiente en fp16; para lotes grandes a 768x768 son preferibles A100, H100, L40S o RTX 4090.
- GPU de consumo: si, cabe en GPU de consumo. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutarlo sin problemas en fp16, incluso con lotes moderados.
- Opciones de despliegue: al ser un modelo timm, la via natural es la propia libreria timm con PyTorch; tambien es posible exportarlo a ONNX o TorchScript para servirlo con ONNX Runtime o TensorRT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un codificador de imagen de este tipo.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Los valores de parametros de los modelos alternativos no estan verificados en la informacion disponible y se ofrecen solo como referencia orientativa de orden de magnitud; deben confirmarse en sus respectivas model cards.

| Modelo | Tipo | Parametros (aprox.) | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timm/qwen3_vit_306m_merge.qwen3_vl_4b | Codificador ViT derivado de Qwen3-VL-4B | 332,7 M (verificado) | Embedding de 2560 dim y tokens espaciales NLC | Apache 2.0 | HuggingFace, via timm |
| Qwen/Qwen3-VL-4B-Instruct | VLM completo (vision + lenguaje) | ~4 B (no verificado en esta busqueda) | Texto generado y embeddings internos | Apache 2.0 | HuggingFace, transformers |
| DINOv2 ViT-L/14 | Codificador ViT auto-supervisado | ~300 M (no verificado) | Embeddings y mapas de features | Apache 2.0 (segun variante) | HuggingFace, timm, torch.hub |
| CLIP ViT-L/14 | Codificador dual imagen-texto | ~300 M en el torreon visual (no verificado) | Embeddings alineados imagen-texto | MIT (segun variante) | HuggingFace, open_clip |
| SigLIP so400m/14 | Codificador dual imagen-texto | ~400 M en el torreon visual (no verificado) | Embeddings alineados imagen-texto | Apache 2.0 | HuggingFace, timm, open_clip |

Diferencias cualitativas relevantes: frente a DINOv2 y CLIP/SigLIP, este checkpoint no ha sido entrenado especificamente para alineacion imagen-texto ni para auto-supervision, sino que hereda el torreon visual de un VLM instruido; su principal ventaja diferencial es la compatibilidad dimensional con el espacio de 2560 del LLM de Qwen3-VL. Frente al Qwen3-VL-4B completo, sacrifica todas las capacidades linguisticas y de generacion a cambio de un coste de memoria aproximadamente doce veces menor.

## Limitaciones y advertencias

- No es un modelo generativo: no contiene pesos del modelo de lenguaje, por lo que no puede generar texto, razonar, usar herramientas ni mantener conversaciones. Cualquier expectativa de ese tipo sobre este checkpoint es incorrecta.
- No incluye cabeza de clasificacion entrenada. La cabeza que se anade con `num_classes=N` se inicializa de forma aleatoria y debe entrenarse con datos propios.
- No ha habido entrenamiento adicional respecto al modelo base: es un remapeo de pesos. Los sesgos del torreon visual de Qwen3-VL se heredan sin mitigacion especifica.
- No se documentan evaluaciones de sesgo, toxicidad ni fairness para este checkpoint. Al tratarse de un extractor de features, el riesgo se traslada aguas abajo, al clasificador o sistema que lo consuma.
- Riesgo de alucinacion: no aplica en sentido estricto, ya que no genera texto; el riesgo equivalente es que los embeddings o clasificaciones reflejen correlaciones espurias del dataset de fine-tuning.
- Restricciones de forma de entrada: cada dimension de la imagen debe ser divisible por 16, y por 32 si se usa la variante con merger 2x2. No cumplir esta restriccion provoca errores en tiempo de ejecucion.
- Limitacion de idioma: al no procesar texto, no hay capacidades multilingues; la model card no declara idiomas soportados.
- Limitacion de contexto: no aplica ventana de contexto textual, pero si una limitacion practica de resolucion: el modelo esta configurado por defecto para 768x768, con 576 tokens espaciales proyectados a esa resolucion; resoluciones muy superiores aumentan el coste de atencion de forma cuadratica en el numero de parches.
- Licencia: Apache 2.0, que permite uso comercial. Conviene verificar de todos modos las condiciones del modelo base Qwen3-VL-4B-Instruct y de la libreria timm, referenciadas en la model card.
- Madurez: el repositorio registra 0 descargas y 0 likes, y las fechas declaradas (creacion y actualizacion en septiembre de 2026) lo situan como un checkpoint muy reciente y sin validacion comunitaria. Para produccion se recomienda validarlo con datos propios antes de adoptarlo.
- Caveat de reproduccion: los resultados pueden variar segun la version de timm y de transformers empleadas, dado que el modelo depende de operaciones de remapeo especificas (colapso del Conv3d temporal, regeneracion de RoPE por tamano, interpolacion de posiciones absolutas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_306m_merge.qwen3_vl_4b
- Modelo base (Qwen3-VL-4B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revision del modelo base usada como fuente: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17
- Paper del modelo base (Qwen3-VL Technical Report, arXiv:2511.21631): https://arxiv.org/abs/2511.21631
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Pagina de timm en Hugging Face: https://huggingface.co/timm
- Documentacion de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Documentacion de timm (timmdocs): https://timm.fast.ai/
- Licencia del modelo base en el repositorio QwenLM/Qwen3-VL: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
