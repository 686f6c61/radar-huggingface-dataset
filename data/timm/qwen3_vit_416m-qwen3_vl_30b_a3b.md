# timm/qwen3_vit_416m.qwen3_vl_30b_a3b

## Resumen

`timm/qwen3_vit_416m.qwen3_vl_30b_a3b` es un encoder de imagen Vision Transformer (ViT) de 415 millones de parámetros extraído del tower de visión de `Qwen/Qwen3-VL-30B-A3B-Instruct` y reempaquetado de forma nativa para la librería timm. No se ha entrenado de nuevo: se trata de un remapeo directo de los pesos de visión originales, sin pesos de modelo de lenguaje y sin cabeza de clasificación entrenada. Su función es producir embeddings e mapas de características de imagen listos para tareas downstream.

El modelo resuelve un problema concreto: reutilizar el encoder visual de un VLM de gran tamaño como extractor de características independiente, sin necesidad de cargar el modelo completo de 30B parámetros. Con 415 M de parámetros, 1152 canales de anchura de backbone y 1280,1 GMACs a 768x768, es lo bastante ligero para ejecutarse en una GPU de consumo y lo bastante expresivo para alimentar pipelines de clasificación, recuperación visual o segmentación tras un ajuste fino.

Es relevante ahora porque Qwen3-VL es una de las familias multimodales abiertas de referencia y su encoder visual estaba hasta ahora acoplado al modelo generativo. Esta conversión a timm permite usarlo con la API estándar de `forward_features()`, `forward_intermediates()` y `features_only=True`, integrándose en el ecosistema habitual de visión por computador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) del encoder visual de Qwen3-VL, remapeado a timm |
| Parametros totales | 415.006.704 (415,0 M) |
| Parametros activos | no aplica (encoder denso, no es MoE) |
| Longitud de contexto | no aplica (encoder de imagen; entrada recomendada 768x768, dimensiones divisibles por 16 y, con el merger 2x2, por 32) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-30B-A3B-Instruct |
| Anchura de backbone | 1152 |
| GMACs (768x768) | 1280,1 |
| Activaciones (768x768) | 2993,6 M |
| Revisión de origen | 9c4b90e1e4ba969fd3b5378b57d966d725f1b86c |

## Arquitectura y entrenamiento

Es un transformer de visión con anchura de backbone de 1152, MLPs con activación GELU-tanh, posiciones absolutas aprendidas y RoPE axial 2D. Las posiciones absolutas se interpolan para la rejilla de entrada, mientras que el RoPE se regenera en cada tamaño. La implementación es solo para imagen: la entrada repite un fotograma a lo largo del kernel temporal original y los pesos del Conv3d temporal se suman en un Conv2d. Los proyectores DeepStack de Qwen3-VL se omiten, y las características intermedias del backbone quedan accesibles mediante `forward_intermediates()` o `features_only=True`.

No ha habido entrenamiento adicional ni ajuste fino: el checkpoint es un remapeo nativo de los pesos de visión originales, sin cabeza de clasificación y sin pesos de lenguaje. El wrapper incluye average pooling y LayerNorm sin parámetros afines sobre las características del encoder, lo que lo deja listo para añadir una cabeza lineal. El preprocesado de timm normaliza los píxeles RGB con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`, y admite entradas rectangulares siempre que cada dimensión sea divisible por 16.

## Capacidades

- Extracción de embeddings de imagen globales: `forward()` devuelve un vector de 1152 dimensiones por imagen (salida agrupada, variante clasificador).
- Extracción de características crudas del backbone: `forward_features()` devuelve tensores NHWC sin normalizar de forma (1, 48, 48, 1152) para una entrada de 768x768.
- Mapas de características intermedios: `forward_intermediates()` permite obtener activaciones de capas concretas en formato NCHW o NHWC.
- Salida de tokens con fusión espacial: la variante `_enc` devuelve tokens tras el merger espacial.
- Ajuste fino para clasificación: admite `num_classes=N`; la cabeza lineal nueva se inicializa de forma aleatoria y debe entrenarse.
- Soporte de entradas rectangulares y de distintos tamaños, con la restricción de divisibilidad por 16 (o 32 si se usa el merger 2x2).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni procesamiento de audio: es exclusivamente un encoder visual.

## Casos de uso

- Recuperación visual de imágenes (image retrieval): generar embeddings de 1152 dimensiones con `forward()` e indexarlos en un motor vectorial para búsqueda por similitud coseno; el coste de 1280,1 GMACs por imagen permite indexar catálogos grandes en GPU de consumo.
- Clasificación de imágenes con ajuste fino: añadir una cabeza lineal con `num_classes=N` y entrenarla sobre el dataset objetivo, aprovechando que el backbone ya viene preentrenado dentro de Qwen3-VL.
- Segmentación semántica y detección: consumir los mapas intermedios de `forward_intermediates()` en formato NCHW, que conservan resolución espacial de 48x48 para una entrada de 768x768.
- Moderación de contenido visual: clasificar imágenes en categorías de riesgo con un clasificador ligero sobre los embeddings agrupados, reduciendo coste frente a ejecutar un VLM completo.
- Recomendación y similitud de producto en comercio electrónico: calcular embeddings de las fichas de producto y resolver búsqueda visual o "productos similares" por vecino más cercano.
- Inspección visual industrial y control de calidad: detección de defectos mediante clasificación o segmentación sobre las características intermedias, con inferencia en una sola GPU.
- Inicialización de backbones para tareas downstream: usar los pesos como punto de partida en lugar de entrenar desde cero cuando el dataset etiquetado es pequeño.
- Componente visual de un pipeline multimodal propio: emplear el encoder para producir tokens de imagen que se inyecten en un LLM distinto, ya que los proyectores DeepStack originales se han omitido y habría que añadir uno propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de coste computacional: 415,0 M de parámetros, 1280,1 GMACs y 2993,6 M de activaciones para una entrada de 768x768.

## Requisitos de hardware

- VRAM estimada para los pesos en inferencia: aproximadamente 0,83 GB en bfloat16/float16 y 1,66 GB en float32 (cálculo a partir de los 415.006.704 parámetros; estimación, no dato de la model card).
- VRAM adicional por activaciones: la model card reporta 2993,6 M de activaciones a 768x768, lo que eleva de forma notable el consumo en entrenamiento y ajuste fino; en inferencia con `torch.inference_mode()` las activaciones intermedias se liberan y el pico es mucho menor.
- GPU recomendadas para inferencia: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; en centros de datos, A100, H100 o L40S para procesar lotes grandes.
- Cabe en GPU de consumo: sí, con holgura en bfloat16 para lotes moderados a 768x768.
- Opciones de despliegue: timm con PyTorch (`timm.create_model('hf-hub:timm/qwen3_vit_416m.qwen3_vl_30b_a3b', pretrained=True)`), exportación a ONNX o TorchScript para servir con Triton Inference Server o TorchServe, o endpoints gestionados de Hugging Face. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que esas herramientas están orientadas a modelos generativos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas y pueden variar según la variante concreta; no se dispone de cifras comparativas verificadas dentro de la información proporcionada.

| Modelo | Parametros | Entrada tipica | Tipo | Licencia |
|---|---|---|---|---|
| `timm/qwen3_vit_416m.qwen3_vl_30b_a3b` | 415 M | 768x768 (divisible por 16) | Encoder ViT de un VLM | Apache 2.0 |
| SigLIP ViT-L/16 | aproximadamente 300 M | 384x384 o 512x512 | Encoder vision-lenguaje con pérdida sigmoidea | Abierta (varía por checkpoint) |
| DINOv2 ViT-L/14 | aproximadamente 304 M | 518x518 | Encoder auto-supervisado | Abierta (varía por checkpoint) |
| CLIP ViT-L/14 | aproximadamente 304 M (torre de visión) | 224x224 | Encoder vision-lenguaje contrastivo | Abierta (varía por checkpoint) |

Frente a estos alternativos, la ventaja principal de este checkpoint es que hereda las características del encoder de Qwen3-VL, un modelo multimodal reciente, y expone directamente mapas intermedios y salidas crudas en formato NHWC a través de la API de timm. Como contrapartida, se distribuye sin cabeza de clasificación, sin cuantizaciones publicadas y con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al derivar de Qwen3-VL, puede heredar los sesgos presentes en los datos de entrenamiento de dicho modelo, pero no se documenta ningún análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que produce embeddings y mapas de características, no texto; el riesgo se traslada al clasificador o al sistema que consuma las representaciones.
- El checkpoint no incluye cabeza de clasificación: cualquier uso como clasificador requiere entrenar una cabeza lineal nueva, inicializada aleatoriamente.
- No incluye pesos de lenguaje ni los proyectores DeepStack de Qwen3-VL; no puede usarse por sí solo como modelo multimodal completo.
- Restricciones de entrada: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se emplea el merger 2x2.
- Limitación de idioma: no procesa texto, por lo que no tiene soporte multilingüe.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se atribuya correctamente. Debe verificarse la licencia de la fuente original en el repositorio Qwen3-VL.
- La model card no documenta cuantizaciones (GGUF, AWQ, GPTQ), por lo que no hay versiones listas para llama.cpp u Ollama.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso en producción ni validación independiente.
- La fecha de creación indicada en la ficha (2026-09-10) es posterior a la de la documentación técnica citada; conviene comprobar la revisión exacta de los pesos antes de fijar una dependencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m.qwen3_vl_30b_a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Revisión de origen de los pesos: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct/tree/9c4b90e1e4ba969fd3b5378b57d966d725f1b86c
- Qwen3-VL Technical Report: https://arxiv.org/abs/2511.21631
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Fuente de la licencia original: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
