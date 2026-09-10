# timm/qwen3_vit_88m_merge.qwen3_5_0_8b

## Resumen

`timm/qwen3_vit_88m_merge.qwen3_5_0_8b` es un codificador de características de imagen publicado por el equipo de timm (Ross Wightman / Hugging Face). No es un modelo de lenguaje: es el torreón de visión del modelo multimodal Qwen3.5-0.8B, extraído y reempaquetado como modelo nativo de timm para extracción de características visuales. Conserva el merger espacial nativo de Qwen3.5 y la proyección al ancho del LLM (1024 dimensiones), seguidos de average pooling y una LayerNorm sin parámetros afines.

El checkpoint tiene 100.003.072 parámetros (aproximadamente 100 M, pese a que el nombre del repositorio indica "88m"), 302,4 GMACs y 980,9 M de activaciones a una resolución de entrada de 768 x 768. El repositorio ocupa 0,4 GB en formato safetensors. Es relevante porque permite reutilizar el torreón visual nativo de un VLM reciente como extractor de embeddings de imagen independiente, sin necesidad de cargar el modelo lingüístico completo ni de ejecutar código propietario del pipeline multimodal.

El modelo se distribuye como un remapeo nativo a timm de los pesos de visión originales, **sin entrenamiento adicional**: no contiene pesos del modelo de lenguaje ni una cabeza de clasificación entrenada. Cualquier uso clasificatorio requiere entrenar una cabeza lineal nueva sobre los embeddings o las características espaciales que devuelve el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con merger espacial nativo y proyeccion al ancho del LLM; MLPs GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parametros totales | 100.003.072 (100,0 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (codificador de vision). Presupuesto de tokens: 576 tokens espaciales de 1024 dimensiones por imagen de 768 x 768 |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien cargable via `timm.create_model` con `hf-hub:`) |
| Tamano del repositorio | 0,4 GB |
| Resolucion de entrada | 768 x 768 (referencia); admite entradas rectangulares |
| Anchura del backbone | 768 |
| Anchura de proyeccion | 1024 |
| GMACs | 302,4 |
| Activaciones | 980,9 M |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Normalizacion de entrada | mean = (0,5; 0,5; 0,5), std = (0,5; 0,5; 0,5) |
| Restricciones de dimension | Cada dimension de la imagen debe ser divisible por 16; las variantes con merger 2x2 requieren divisibilidad por 32 |

## Arquitectura y entrenamiento

Se trata de un Vision Transformer con parche de tamano 16 y un merger espacial 2x2, de forma que una imagen de 768 x 768 produce un mapa de caracteristicas de 48 x 48 a anchura 768 (salida de `encoder.forward_features()`, formato NHWC) que el merger reduce a 576 tokens espaciales de 1024 dimensiones (formato NLC, salida de `forward_features()`). El modelo usa MLPs con activacion GELU-tanh, posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) y RoPE 2D axial regenerado en cada tamano de entrada.

Una particularidad importante es que el torreón original de Qwen3.5 es nativo de video y emplea un kernel de parche temporal con una Conv3d. En esta implementacion solo imagen, la entrada repite un unico fotograma a lo largo del kernel temporal y los pesos de la Conv3d se suman en una Conv2d equivalente. La salida final de `forward()` es un embedding de imagen agrupado (pooled) y normalizado, de 1024 dimensiones, sin cabeza de clasificacion. **No hay entrenamiento adicional ni ajuste fino:** es un remapeo de pesos, por lo que no consta informacion sobre dataset de entrenamiento, numero de tokens vistos, composicion de datos ni etapas de RLHF/DPO (no aplicables a este checkpoint).

## Capacidades

- Extraccion de embeddings globales de imagen: `model(x)` devuelve un tensor de forma (1, 1024) listo para tareas de retrieval, clustering o clasificacion con cabeza nueva.
- Extraccion de tokens espaciales proyectados: `model.forward_features(x)` devuelve (1, 576, 1024) en formato NLC, util para tareas densas (deteccion, segmentacion, grounding) que necesiten rejilla.
- Extraccion de mapas de caracteristicas intermedios del backbone: `model.forward_intermediates(x, indices=3, output_fmt='NCHW')` devuelve, por ejemplo, tensores de forma (1, 768, 48, 48).
- Ajuste fino para clasificacion: `timm.create_model(..., num_classes=N)` anade una cabeza lineal inicializada aleatoriamente que debe entrenarse.
- Soporte de entradas rectangulares, con la restriccion de divisibilidad por 16 (o por 32 si se usa el merger 2x2).
- Compatibilidad nativa con el ecosistema timm: `resolve_model_data_config`, transformaciones estandar y carga directa desde el Hub.
- **No** dispone de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidad multilingue: no contiene pesos de lenguaje.
- **No** incluye capacidades de audio ni de video real (el eje temporal esta colapsado a una sola repeticion de fotograma).

## Casos de uso

- Busqueda visual y recuperacion de imagenes (image retrieval): los embeddings de 1024 dimensiones devueltos por `forward()` permiten construir un indice vectorial y recuperar imagenes visualmente similares mediante similitud coseno, sin necesidad de cargar el LLM asociado.
- Clasificacion de imagenes mediante ajuste fino: se anade una cabeza lineal con `num_classes` y se entrena sobre el dataset objetivo; el backbone ya viene preentrenado en un pipeline multimodal, lo que reduce el coste de convergencia frente a entrenar desde cero.
- Deduplicacion y curado de datasets visuales: calcular embeddings de todo un corpus y agrupar por cercania para detectar imagenes duplicadas o casi duplicadas antes de entrenar otros modelos.
- Clustering y anotacion semiautomatica: agrupar un corpus no etiquetado en clusters visuales coherentes y anotar por prototipo, reduciendo el trabajo manual de etiquetado.
- Clasificacion few-shot con k-NN: usar directamente los embeddings agrupados como espacio metrico y clasificar con k vecinos mas cercanos, sin reentrenar el backbone, para prototipado rapido.
- Tareas densas sobre rejilla (deteccion, segmentacion, keypoint): explotar los mapas intermedios (1, 768, 48, 48) o los tokens NLC (1, 576, 1024) como entrada a cabezas ligeras de deteccion o segmentacion.
- Inspeccion visual industrial y control de calidad: fine-tuning de la cabeza sobre imagenes de producto para clasificar defectos, con un modelo lo bastante pequeno (100 M de parametros) para desplegarse en linea de produccion.
- Moderacion de contenido visual: entrenar un clasificador binario o multietiqueta sobre los embeddings para filtrar contenido no deseado en plataformas.
- Extraccion de caracteristicas para pipelines de VLM: reutilizar el torreon visual nativo de Qwen3.5 como modulo de vision en arquitecturas propias, manteniendo la proyeccion de 1024 dimensiones hacia la anchura del LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud (ImageNet, COCO, etc.) ni comparaciones con otros codificadores visuales.

Las unicas cifras objetivas publicadas son de coste computacional y tamano: 100,0 M de parametros, 302,4 GMACs, 980,9 M de activaciones y una entrada de referencia de 768 x 768.

## Requisitos de hardware

- Pesos: 0,4 GB en el repositorio. En fp32, aproximadamente 400 MB; en fp16/bf16, aproximadamente 200 MB.
- VRAM estimada para inferencia (batch 1, 768 x 768): el recuento de activaciones de referencia es de 980,9 M de elementos, lo que equivaldria a unos 3,9 GB en fp32 y unos 2,0 GB en fp16 si se materializaran todas. En inferencia con `torch.inference_mode()` y sin gradientes, el consumo real es considerablemente inferior; un presupuesto practico de 2 a 4 GB de VRAM cubre la mayoria de escenarios en batch pequeno.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problemas en RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100, L4 o T4. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, incluidas las de gama de entrada con 4-8 GB.
- CPU: viable para inferencia, teniendo en cuenta los 302,4 GMACs por imagen (unos 605 GFLOPs), lo que se traduce en tiempos del orden de segundos por imagen en CPU moderna. No se dispone de medidas publicadas.
- Opciones de despliegue: timm sobre PyTorch (`timm.create_model('hf-hub:timm/qwen3_vit_88m_merge.qwen3_5_0_8b', pretrained=True)`), exportacion a ONNX o TorchScript, y uso como modulo dentro de un pipeline de `transformers`. No aplica llama.cpp, GGUF, Ollama, vLLM o TGI, al no ser un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles. No se publican medidas de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentacion publica. No es posible comparar rendimiento porque este checkpoint no publica benchmarks.

| Modelo | Parametros | Entrada / tokens | Licencia | Disponibilidad |
|---|---|---|---|---|
| timm/qwen3_vit_88m_merge.qwen3_5_0_8b | 100,0 M | 768 x 768; 576 tokens de 1024 d | Apache 2.0 | Hugging Face (org. timm) |
| DINOv2 ViT-S/14 | 21 M aprox. | 518 x 518, parche 14 | Apache 2.0 | Hugging Face (facebook) |
| DINOv2 ViT-B/14 | 86 M aprox. | 518 x 518, parche 14 | Apache 2.0 | Hugging Face (facebook) |
| CLIP ViT-B/32 | 151 M aprox. (vision + texto) | 224 x 224 | MIT | OpenAI / Hugging Face |

Diferencias cualitativas relevantes: este modelo es el unico de la lista que conserva el merger espacial y la proyeccion al ancho de un LLM multimodal concreto (1024), lo que lo hace adecuado para reutilizacion dentro de pipelines tipo Qwen3.5; tambien es el unico que trabaja por defecto a 768 x 768 con 576 tokens espaciales. DINOv2 es un codificador auto-supervisado puramente visual, sin relacion con ningun LLM, y CLIP es un modelo conjunto imagen-texto con alineacion cross-modal, capacidad de la que carece este checkpoint.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas. Cualquier expectativa de uso conversacional es erronea.
- No incluye cabeza de clasificacion entrenada ni pesos del modelo de lenguaje. Las cabezas anadidas se inicializan aleatoriamente y deben entrenarse.
- No se ha realizado entrenamiento ni ajuste adicional: es un remapeo de pesos, por lo que no hay garantia de que el rendimiento como extractor de imagen generalista iguale al de un codificador visual entrenado especificamente para esa tarea.
- Riesgo de sesgos heredados: el torreon proviene de Qwen3.5-0.8B, cuyo dataset de preentrenamiento no se documenta en esta ficha; pueden persistir sesgos de representacion en los embeddings.
- Alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de que los embeddings o clasificaciones derivadas produzcan resultados poco fiables en dominios alejados de la distribucion de entrenamiento original (por ejemplo, imagenes medicas o tecnicas muy especificas).
- Restricciones de entrada: cada dimension de la imagen debe ser divisible por 16, y por 32 si se usa el merger 2x2. Las entradas que no cumplan esta condicion deben redimensionarse o rellenarse.
- Idiomas: no aplica; no hay procesamiento de lenguaje, por lo que no existe soporte multilingue ni tokenizador de texto.
- Licencia: Apache 2.0, que permite uso comercial. Conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B en la revision de origen citada, ya que la model card remite explicitamente a ese fichero de licencia.
- Datos de creacion y actualizacion poco habituales: el repositorio consta creado y actualizado el 2026-09-10, con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- No se publican variantes cuantizadas, benchmarks, ni cifras de latencia o throughput; cualquier estimacion de produccion debe medirse en el entorno objetivo.
- Discrepancia de nomenclatura: el nombre del modelo indica "88m" mientras que el recuento real de parametros en safetensors es de 100.003.072.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_88m_merge.qwen3_5_0_8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revision de origen de los pesos: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/2fc06364715b967f1860aea9cf38778875588b17/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organizacion timm en Hugging Face: https://huggingface.co/timm
- Documentacion de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentacion de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Cita de PyTorch Image Models: https://doi.org/10.5281/zenodo.4414861
