# timm/qwen3_vit_416m.qwen3_vl_235b_a22b

## Resumen

`timm/qwen3_vit_416m.qwen3_vl_235b_a22b` es un codificador de características de imagen de 415 millones de parámetros extraído del modelo multimodal Qwen3-VL-235B-A22B-Instruct. Lo publica el proyecto timm (PyTorch Image Models, mantenido por Ross Wightman dentro del ecosistema de Hugging Face) y consiste en un remapeo nativo de los pesos de visión originales al formato de timm, sin entrenamiento adicional. No incluye pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada.

El problema que resuelve es concreto: permite reutilizar la torre de visión de un sistema visión-lenguaje de 235.000 millones de parámetros (MoE con 22.000 millones activos) de forma aislada, sin necesidad de cargar el modelo completo. Esto es útil cuando solo se necesitan representaciones visuales: búsqueda de imágenes, clasificación con fine-tuning, destilación, curación de datasets o uso como backbone en tareas densas.

Técnicamente es un Vision Transformer con ancho de backbone de 1152, entrada de referencia de 768 x 768 píxeles, 1280,1 GMACs por imagen y 2993,6 millones de activaciones. Emplea MLP con activación GELU-tanh, posiciones absolutas aprendidas interpoladas a la rejilla de entrada y RoPE 2D axial regenerado en cada resolución. Se distribuye bajo licencia Apache 2.0 en safetensors, con un tamaño de repositorio de 1,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con MLP GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial; extraido de la torre de vision de Qwen3-VL |
| Parametros totales | 415.006.704 (415,0 M) |
| Parametros activos | no aplica; este checkpoint no es MoE (el modelo base Qwen3-VL-235B-A22B si lo es, con 22B activos) |
| Longitud de contexto | no disponible; no procesa texto. Resolucion de entrada de referencia 768 x 768; cada dimension debe ser divisible por 16 (por 32 si se usa el merger 2x2) |
| Tipos de cuantizacion | no disponible; no se documentan cuantizaciones oficiales. El tamano del repositorio (1,7 GB) es consistente con pesos en fp32 |
| Idiomas soportados | no disponible; al ser un codificador visual puro no tiene comportamiento linguistico propio. El modelo base Qwen3-VL es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Ancho del backbone | 1152 |
| GMACs | 1280,1 |
| Activaciones | 2993,6 M (a 768 x 768) |
| Dim. del embedding de imagen | 1152 |
| Pipeline | image-feature-extraction |
| Libreria | timm |
| Modelo base | Qwen/Qwen3-VL-235B-A22B-Instruct (revision 710c13861be6c466e66de3f484069440b8f31389) |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un ViT puro de caracteristicas de imagen, obtenido por remapeo de pesos desde la torre de vision de Qwen3-VL-235B-A22B-Instruct. La nota del autor es explicita: se trata de un remapeo nativo a timm "con ningun entrenamiento adicional", y el checkpoint no contiene pesos de lenguaje ni cabeza de clasificacion entrenada. Por tanto no hay fases de preentrenamiento, SFT, RLHF ni DPO documentadas para este artefacto concreto; la informacion de entrenamiento solo existe, si acaso, para el modelo base, descrito en el informe tecnico de Qwen3-VL.

Las particularidades tecnicas del remapeo son relevantes para reproducibilidad. La entrada de imagen repite un unico fotograma a lo largo del kernel temporal original, y los pesos del Conv3d temporal se suman en un Conv2d para esta implementacion exclusivamente de imagen. El backbone usa MLP con GELU-tanh, posiciones absolutas aprendidas que se interpolan a la rejilla de entrada, y RoPE 2D axial que se regenera en cada tamano. La envoltura orientada a clasificacion aplica average pooling y LayerNorm sin parametros afines sobre las caracteristicas del codificador. Los proyectores DeepStack de Qwen3-VL se omiten, y las caracteristicas intermedias quedan accesibles mediante `forward_intermediates()` o `features_only=True`. Las transformaciones de timm normalizan los pixeles RGB con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.

## Capacidades

- Extraccion de embeddings globales de imagen: `model(x)` devuelve un tensor de forma `(1, 1152)`.
- Extraccion de mapas de caracteristicas espaciales sin normalizar en formato NHWC: `forward_features(x)` devuelve `(1, 48, 48, 1152)`.
- Acceso a mapas de caracteristicas intermedias del backbone mediante `forward_intermediates()` (por ejemplo, `indices=3`, `output_fmt='NCHW'` produce `(1, 1152, 48, 48)`) o `features_only=True`.
- Fine-tuning para clasificacion: se puede crear el modelo con `num_classes=N`, lo que anade una cabeza lineal inicializada aleatoriamente que debe entrenarse con el dataset objetivo.
- Soporte de entradas rectangulares, siempre que cada dimension sea divisible por 16 (o por 32 si se emplea el merger 2x2).
- Capacidad de actuar como backbone de vision para tareas densas gracias a los mapas intermedios.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no contiene pesos de lenguaje.
- No tiene capacidades multilingues propias.
- No dispone de modo thinking, ni de entrada o salida de audio, ni generacion de texto.
- La variante `_enc` devuelve tokens fusionados espacialmente a partir de `forward()`; la variante clasificadora devuelve embeddings de imagen agrupados hasta que se anade una cabeza.

## Casos de uso

- Busqueda y recuperacion visual de imagenes: los embeddings de 1152 dimensiones permiten indexar un corpus de imagenes y recuperar las mas similares mediante similitud coseno, sin cargar el modelo multimodal completo de 235B.
- Clasificacion de imagenes con fine-tuning: se instancia el modelo con `num_classes` ajustado al numero de etiquetas del dominio (por ejemplo, 45 clases en el ejemplo de la model card) y se entrena unicamente la cabeza, aprovechando que la envoltura ya aplica average pooling y LayerNorm.
- Segmentacion y deteccion como backbone: el acceso a `forward_intermediates()` con salidas `NCHW` de 1152 canales a 48 x 48 proporciona mapas de caracteristicas listos para alimentar cabezas densas tipo FPN o U-Net ligero.
- Curacion y deduplicacion de datasets de imagen: generar embeddings para millones de imagenes y agrupar por similitud permite detectar duplicados o near-duplicates antes de entrenar otros modelos.
- Control de calidad e inspeccion visual industrial: con un dataset etiquetado reducido de piezas correctas o defectuosas, el fine-tuning de la cabeza lineal es suficiente para clasificacion binaria o multietiqueta a resolucion 768 x 768.
- Moderacion y filtrado de contenido: clasificar imagenes por categorias de politica mediante una cabeza entrenada, usando el encoder como extractor congelado para reducir coste de entrenamiento.
- Destilacion e inicializacion de torres de vision: al proceder de Qwen3-VL-235B-A22B, los pesos pueden servir como punto de partida o referencia para modelos vision-lenguaje de menor tamano.
- Analisis de imagenes de satelite o microscopia con entrada rectangular: el soporte de dimensiones divisibles por 16 permite trabajar con relaciones de aspecto no cuadradas sin recorte agresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de ImageNet, COCO, MMLU ni de ninguna otra tarea, y el checkpoint no se ha entrenado ni evaluado para clasificacion. Los unicos datos cuantitativos de rendimiento disponibles son de coste computacional: 1280,1 GMACs y 2993,6 millones de activaciones a 768 x 768, con 415,0 M de parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,66 GB en fp32 (415 M x 4 bytes) o unos 0,83 GB en fp16/bf16. Hay que sumar memoria de activaciones, que a 768 x 768 y lote 1 se cuenta en unidades de varios GB segun el framework y si se retienen mapas intermedios.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en fp16. Para entrenamiento de la cabeza de clasificacion o extraccion por lotes a 768 x 768 conviene una RTX 4090, L40S, A100 o H100.
- Compatibilidad con GPU de consumo: si. Cabe en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en resolucion de referencia. En GPUs de 6-8 GB puede requerir bajar el lote o reducir la resolucion de entrada.
- Opciones de despliegue: uso nativo mediante `timm.create_model` y PyTorch, integracion con `transformers` a traves del cargador de timm, exportacion a ONNX u otros formatos via `torch.export`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo ni dispone de pesos en GGUF.
- Latencia y throughput estimados: no se publican mediciones. Como referencia aritmetica a partir de los 1280,1 GMACs indicados, cada imagen de 768 x 768 requiere aproximadamente 2,56 TFLOPs en la pasada directa, por lo que el rendimiento dependera casi linealmente del lote y de la GPU empleada.
- Nota sobre frecuencia de reloj y precision: una ejecucion en fp16/bf16 reduce memoria y suele acelerar el calculo, pero el checkpoint se distribuye en precision completa y puede requerir una conversion explicita.

## Comparativa con modelos similares

La comparativa se establece con otros codificadores de imagen de proposito general de tamano comparable, ya que no existe una categoria exacta de "torre de vision extraida de un VLM". Los datos de los modelos alternativos provienen de sus publicaciones y fichas publicas y pueden variar segun la revision.

| Modelo | Parametros | Resolucion tipica | Dim. de embedding | Licencia | Formato |
|---|---|---|---|---|---|
| timm/qwen3_vit_416m.qwen3_vl_235b_a22b | 415 M | 768 x 768 (divisible por 16) | 1152 | Apache 2.0 | safetensors (timm) |
| SigLIP SoViT-400m/14 | ~400 M | 384 x 384 | 1152 | Apache 2.0 | safetensors |
| CLIP ViT-L/14 | ~304 M | 224 x 224 | 1024 | MIT (pesos OpenAI con terminos propios) | safetensors |
| DINOv2 ViT-L/14 | ~300 M | 518 x 518 | 1024 | Apache 2.0 | safetensors |
| Torre de vision de Qwen2-VL (7B) | ~675 M | dinamica | 1280 | Apache 2.0 | safetensors |

Diferencias clave: frente a SigLIP, CLIP o DINOv2, este checkpoint no ha sido entrenado con un objetivo de alineacion imagen-texto ni con autosupervision contrastiva, de modo que sus embeddings no estan calibrados para recuperacion texto-imagen sin un adaptador adicional. Su ventaja es la procedencia directa de un VLM de ultima generacion y su integracion inmediata en timm, con un coste de 1280,1 GMACs a 768 x 768, superior al de los alternativos a resoluciones menores. No se dispone de resultados comparativos de benchmarks para establecer una jerarquia de calidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no admite tool calling ni razonamiento multi-paso.
- No incluye cabeza de clasificacion entrenada. La cabeza lineal que anade timm se inicializa de forma aleatoria y debe entrenarse con datos propios.
- Los proyectores DeepStack de Qwen3-VL se han omitido, por lo que no existe alineacion imagen-texto en este checkpoint. No es adecuado para tareas de retrieval texto-a-imagen sin entrenar un adaptador.
- No hay resultados de benchmarks ni validacion independiente publicados. El modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de verificacion por parte de la comunidad.
- Restriccion de resolucion: cada dimension de la imagen debe ser divisible por 16, y por 32 si se utiliza el merger 2x2. No respetar esta condicion provoca errores de forma.
- El RoPE 2D se regenera en cada tamano de entrada y las posiciones absolutas se interpolan, por lo que el comportamiento puede degradarse en resoluciones muy alejadas de la rejilla de referencia.
- La conversion temporal de Conv3d a Conv2d implica que la informacion temporal de video se pierde por diseno; este checkpoint es exclusivamente de imagen.
- Sobre sesgos: no se documenta ningun analisis de sesgo. Al proceder de un modelo entrenado a gran escala con datos web, es previsible que herede sesgos de representacion, pero no hay evaluacion publicada que lo cuantifique.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero un clasificador entrenado sobre estos embeddings puede producir predicciones confiadas e incorrectas en dominios alejados de los datos de fine-tuning.
- Licencia Apache 2.0, que permite uso comercial. No obstante, conviene revisar los terminos del modelo base Qwen3-VL y las condiciones de los datos de entrenamiento originales antes de un despliegue en produccion.
- El identificador de modelo y la fecha de publicacion indican un artefacto muy reciente y con escasa trayectoria de uso; se recomienda fijar la revision exacta (`710c13861be6c466e66de3f484069440b8f31389` en origen) para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m.qwen3_vl_235b_a22b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct
- Revision de origen usada para el remapeo: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct/tree/710c13861be6c466e66de3f484069440b8f31389
- Informe tecnico de Qwen3-VL (arXiv:2511.21631): https://arxiv.org/abs/2511.21631
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Licencia del modelo base (Qwen3-VL): https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
- Licencia Apache 2.0 incluida en el repositorio: https://huggingface.co/timm/qwen3_vit_416m.qwen3_vl_235b_a22b/blob/main/LICENSE
- DOI de PyTorch Image Models: https://doi.org/10.5281/zenodo.4414861

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; unicamente enlaces genericos a YouTube que no guardan relacion con la ficha y que, por tanto, se omiten.
