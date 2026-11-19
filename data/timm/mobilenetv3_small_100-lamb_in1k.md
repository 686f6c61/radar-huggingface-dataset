# timm/mobilenetv3_small_100.lamb_in1k

## Resumen

`mobilenetv3_small_100.lamb_in1k` es un modelo de clasificación de imágenes de la familia MobileNet-v3 Small, publicado por el mantenedor de `timm` (Ross Wightman) dentro del repositorio PyTorch Image Models. Se trata de una red convolucional ligera con 2.554.968 parámetros (2,5 M), diseñada para inferencia de bajo coste computacional (0,1 GMACs con entrada de 224x224) y entrenada sobre ImageNet-1k con una receta específica basada en el optimizador LAMB.

El modelo resuelve el problema de clasificación de imágenes en 1.000 clases y, además, sirve como extractor de features y backbone para tareas de visión por computador (detección, segmentación, embeddings). Su relevancia actual radica en que ofrece un equilibrio muy agresivo entre precisión y coste: es lo bastante pequeño como para ejecutarse en CPU, dispositivos móviles o GPUs de gama baja, y su licencia Apache 2.0 permite uso comercial sin restricciones.

La variante `lamb_in1k` se distingue de otras versiones del mismo backbone por su receta de entrenamiento: un optimizador LAMB con un esquema similar a ResNet Strikes Back `A2`, alargado un 50%, con EMA de pesos y sin CutMix. El resultado es un checkpoint listo para usar vía `timm.create_model` y compatible con el ecosistema `transformers` para pipelines de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNet-v3 Small (bloques invertidos con squeeze-and-excitation, activaciones h-swish) |
| Parametros totales | 2.554.968 (2,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible en la información proporcionada (soporta pesos safetensors en fp32; cuantización int8 posible vía tooling externo, no documentada en la model card) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo `timm`, también cargable desde PyTorch) |

## Arquitectura y entrenamiento

MobileNet-v3 Small es una red convolucional diseñada mediante Neural Architecture Search (NAS) y refinada manualmente, descrita en el paper *Searching for MobileNetV3* (Howard et al., 2019). Emplea bloques de convolución invertida con expansión lineal, squeeze-and-excitation (SE) en determinadas etapas y activaciones h-swish, optimizados para eficiencia en hardware móvil. Con 224x224 de entrada, el modelo consume 0,1 GMACs y genera 1,4 M de activaciones, lo que lo sitúa entre los clasificadores más ligeros del catálogo `timm`.

El entrenamiento se realizó sobre ImageNet-1k con una receta LAMB inspirada en ResNet Strikes Back `A2`, pero un 50% más larga, con EMA de pesos y sin CutMix. El schedule de learning rate es exponencial con decaimiento en escalera y warmup. La model card no detalla el número exacto de tokens/epochs, la composición del dataset más allá de ImageNet-1k ni si hubo etapas de destilación o fine-tuning adicional. La innovación principal no está en el modelo en sí, sino en la receta de entrenamiento reproducible dentro de `timm`, que permite obtener checkpoints competitivos con recursos moderados.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k (top-1 y top-5).
- Extracción de mapas de features en múltiples resoluciones mediante `features_only=True` (salidas de 16x112x112, 16x56x56, 24x28x28, 48x14x14 y 576x7x7 para entrada 224x224).
- Generación de embeddings de imagen (vector de 576 dimensiones con `num_classes=0` o `forward_head(pre_logits=True)`).
- Uso como backbone para tareas downstream: detección de objetos, segmentación semántica, clasificación fine-tuned, retrieval visual.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje; es puramente visión.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Clasificación de imágenes en el borde (edge computing): el modelo cabe en dispositivos con pocos recursos (Raspberry Pi, móviles, microcontroladores con acelerador) gracias a sus 2,5 M de parámetros y 0,1 GMACs, permitiendo clasificación en tiempo real sin conexión.
- Filtrado y moderación de contenido visual: se puede usar como primer clasificador para descartar o etiquetar imágenes en pipelines de moderación, con un coste de inferencia mínimo por imagen.
- Extracción de features para búsqueda visual: generar embeddings de 576 dimensiones para indexar imágenes en un motor de búsqueda por similitud o en un sistema de recomendación visual.
- Backbone para fine-tuning en dominios específicos: con un dataset pequeño (por ejemplo, clasificación de defectos industriales o especies de plantas), se puede reentrenar la cabeza y ajustar el backbone con recursos modestos.
- Preprocesamiento en pipelines de visión más complejos: usar los mapas de features multi-escala como entrada para detectores o segmentadores ligeros en sistemas embebidos.
- Prototipado rápido y educación: servir como baseline reproducible en experimentos de visión por computador y en docencia, ya que se carga con una sola línea de `timm` y no requiere GPU.
- Clasificación por lotes en CPU: en entornos sin GPU (servidores de bajo coste, contenedores), el modelo ofrece throughput aceptable para clasificación de imágenes a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página de resultados de `timm` (https://github.com/huggingface/pytorch-image-models/tree/main/results) para métricas de precisión y runtime, pero no se incluyen cifras concretas de top-1/top-5 en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en fp32 (2,5 M de parámetros ≈ 10 MB de pesos, más activaciones de 1,4 M). Cabe holgadamente en cualquier GPU, incluso integradas.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1650, una GPU integrada Intel Iris Xe o incluso CPU son adecuadas.
- Cabe en GPU consumer: sí, en todas, y también en CPU y dispositivos móviles.
- Opciones de despliegue: `timm` (nativo), PyTorch, exportación a ONNX, TorchScript, TensorRT, Core ML y TFLite mediante conversión externa. No está pensado para vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend. Por su tamaño, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilenetv3_small_100.lamb_in1k | 2,5 M | 224x224 | no aplica | Apache 2.0 | Hugging Face (`timm`) |
| mobilenetv3_large_100 | ~5,5 M | 224x224 | no aplica | Apache 2.0 | Hugging Face (`timm`) |
| efficientnet_b0 | ~5,3 M | 224x224 | no aplica | Apache 2.0 | Hugging Face (`timm`) |
| resnet18 | ~11,7 M | 224x224 | no aplica | BSD-3 / Apache 2.0 (según checkpoint) | Hugging Face (`timm`) |

La comparación se limita a parámetros, entrada, licencia y disponibilidad; no se dispone de cifras de precisión (top-1/top-5) en la información proporcionada para establecer una comparación cuantitativa de rendimiento. En términos de coste, MobileNet-v3 Small es el más ligero del grupo, seguido de MobileNet-v3 Large y EfficientNet-B0, mientras que ResNet-18 es el más pesado.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con ImageNet-1k, hereda los sesgos de representación y etiquetado de ese dataset (clases desequilibradas, sesgos geográficos y culturales).
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución o ambiguas.
- Limitaciones de contexto o idioma: no procesa texto ni tiene capacidades multilingües; su entrada está restringida a imágenes de 224x224 (aunque `timm` permite otras resoluciones con posible degradación).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya; no hay restricciones adicionales conocidas.
- Caveats para producción: la precisión en dominios distintos de ImageNet puede ser insuficiente sin fine-tuning; conviene validar el modelo con datos propios y considerar la calibración de confianza antes de usarlo en decisiones automatizadas.
- No es un modelo de lenguaje: no debe emplearse para tareas de generación de texto, razonamiento, código ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
- Repositorio PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
- Resultados de `timm`: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Paper MobileNet-v3: https://arxiv.org/abs/1905.02244
- Paper ResNet Strikes Back: https://arxiv.org/abs/2110.00476
- Ficha de referencia en Toolify: https://www.toolify.ai/ai-model/timm-mobilenetv3-small-100-lamb-in1k
