# v3loc1ty/kafwain-produce-freshness-vit

## Resumen

kafwain-produce-freshness-vit es un clasificador de imágenes especializado en reconocer el tipo de producto fresco (fruta o verdura) y su estado de frescura. Es un ajuste fino de google/vit-base-patch16-224, un Vision Transformer de 85,8 millones de parámetros preentrenado en ImageNet-21k y afinado después en ImageNet-1k a 224×224 píxeles. El modelo lo desarrolla el equipo Kafwain, una startup estudiantil con sede en Doha (Catar) que conecta granjas locales con restaurantes mediante pedidos, entrega refrigerada y facturación unificada.

El modelo resuelve un problema operativo concreto: en el punto de recogida de Kafwain, el personal fotografía los productos que entregan las granjas y el clasificador marca aquellos que podrían estar en mal estado para que una persona tome la decisión final de aceptar o rechazar el lote. Se distribuye como prototipo, no como sistema de producción validado, y el propio autor advierte que la precisión declarada (99,68 %) procede de un conjunto de evaluación con imágenes similares a las de entrenamiento, por lo que en fotos reales será previsiblemente inferior.

La relevancia actual del modelo es acotada: se trata de un ajuste fino pequeño y de bajo coste computacional sobre una arquitectura ViT-Base estándar, útil como referencia para quien quiera replicar un pipeline de clasificación de frescura con `transformers` y `Trainer`, y como ejemplo de aplicación vertical de visión por computador en el sector agroalimentario. No aporta innovaciones arquitectónicas ni un corpus de entrenamiento publicado en detalle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch size 16) para clasificación de imágenes |
| Parámetros totales | 85.800.194 (float32, safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de una imagen RGB redimensionada a 224×224) |
| Tipos de cuantización | no disponible (el repo publica pesos en float32; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo ViT-Base con parches de 16×16 y resolución de entrada de 224×224, heredada de google/vit-base-patch16-224, que a su vez parte de un preentrenamiento en ImageNet-21k y un ajuste fino en ImageNet-1k. El modelo recibe una única imagen RGB, la divide en parches, aplica auto-atención sobre la secuencia de parches y devuelve una distribución de probabilidad sobre las etiquetas de clase definidas en el ajuste fino. La cabeza de clasificación se reemplaza por una con el número de etiquetas del dataset de frescura.

El ajuste fino se realizó con el `Trainer` de Hugging Face sobre el dataset v3loc1ty/kafwain-produce-freshness. Los hiperparámetros documentados son: learning rate 5e-05, batch de entrenamiento 32, batch de evaluación 64, semilla 42, optimizador AdamW (torch fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 300 pasos de warmup, 4 épocas y precisión mixta nativa (AMP). El preprocesamiento usa el image processor de ViT (redimensionado a 224×224 y normalización). No se documentan el número total de imágenes, la composición exacta del dataset, el reparto train/eval/test, el hardware de entrenamiento ni el tiempo de cómputo; la model card deja esos campos sin rellenar. Tampoco se indica si hubo aumento de datos ni técnicas de regularización adicionales.

## Capacidades

- Clasificación de imágenes de producto fresco en una única etiqueta que combina tipo de producto y estado de frescura (por ejemplo, fruta fresca frente a fruta en mal estado).
- Salida de probabilidades por clase mediante `softmax` sobre los logits, lo que permite aplicar umbrales de confianza y derivar casos inciertos a revisión humana.
- Integración directa con el pipeline `image-classification` de `transformers` y con `AutoModelForImageClassification`.
- Inferencia sobre una sola imagen RGB de 224×224, sin necesidad de preprocesamiento manual más allá del image processor oficial.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión documental, audio ni modo "thinking"; es exclusivamente un clasificador de imagen.
- No tiene capacidades multilingües en sentido estricto: las etiquetas están en inglés y el modelo no procesa lenguaje natural.

## Casos de uso

- Verificación en el punto de recogida de Kafwain: el personal fotografía cada lote al recibirlo de la granja y el modelo marca los ítems que podrían estar en mal estado; una persona revisa las marcas antes de aceptar o rechazar el pedido. Es el uso principal declarado por el autor.
- Prototipos y demos comerciales: sirve para ilustrar la funcionalidad de control de frescura en presentaciones, pitches o entornos de prueba de la aplicación Kafwain, sin comprometer decisiones reales.
- Aprendizaje y experimentación con clasificación de imágenes: por su tamaño contenido (85,8 M de parámetros) y su licencia Apache-2.0, es útil como base para quienes quieran reproducir un flujo de ajuste fino de ViT con `Trainer`.
- Filtro previo en líneas de inspección de bajo coste: con un umbral de confianza (por ejemplo, 0,80) se pueden derivar automáticamente las imágenes dudosas a un operario y procesar el resto de forma desatendida, siempre con supervisión humana final.
- Etiquetado asistido de nuevos conjuntos de datos: el modelo puede preetiquetar imágenes de producto para acelerar la anotación manual, revisando después las predicciones de baja confianza.
- Investigación aplicada en agricultura y alimentación: como referencia para comparar enfoques de clasificación de frescura (ViT frente a CNN como EfficientNet) en experimentos académicos o internos.
- Integración en aplicaciones móviles o web de gestión de inventario: dado su reducido tamaño, puede desplegarse en servidores modestos o en el borde para clasificar fotos de stock y señalar productos a revisar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación de imágenes | v3loc1ty/kafwain-produce-freshness | Accuracy | 0,9968 |

No se han publicado en la información disponible resultados en benchmarks estándar (ImageNet, Food-101 u otros) ni comparaciones con modelos alternativos. El propio autor advierte que el 99,68 % corresponde a un conjunto de evaluación con imágenes del mismo tipo que las de entrenamiento, por lo que la precisión en fotos reales será inferior.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 350 MB solo para los pesos (85,8 M de parámetros × 4 bytes), más el espacio de activaciones y del image processor; en la práctica, menos de 1 GB para lotes pequeños.
- En float16 o bfloat16, los pesos ocupan aproximadamente 170 MB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por imagen, aunque con mayor latencia.
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`, `AutoModelForImageClassification`, y servidores de inferencia compatibles con modelos de `transformers` (por ejemplo, TGI o endpoints de Hugging Face). No se documentan despliegues con llama.cpp, Ollama ni vLLM, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kafwain-produce-freshness-vit | ViT-Base patch 16 | 85,8 M | Imagen 224×224 | 0,9968 accuracy en su dataset (no verificado) | Apache-2.0 | Hugging Face |
| Vinay5566/AI-freshness-detection | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| FreshScan-Pro (pkrutika03) | EfficientNetB0 | no disponible | no disponible | no disponible | no disponible (repo GitHub) | GitHub |

Las alternativas encontradas en la búsqueda web no publican especificaciones detalladas ni resultados comparables, por lo que no es posible establecer una comparación cuantitativa rigurosa. No se dispone de datos de otros clasificadores de frescura con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo es un prototipo y, según el autor, no se ha probado aún con las fotos reales de Kafwain; la precisión de 99,68 % procede de un conjunto de evaluación con imágenes similares a las de entrenamiento.
- No debe usarse para decisiones de seguridad alimentaria: "parece fresco" no implica "es seguro para comer"; no detecta contaminación, pesticidas, bacterias ni moho interno.
- No debe usarse para rechazar automáticamente el producto de una granja ni para fijar precios sin revisión humana; los errores tendrían consecuencias económicas injustas para los agricultores.
- No está entrenado para gradación de calidad (por ejemplo, grado A frente a grado B).
- Solo admite los tipos de producto incluidos en su lista de etiquetas; para productos no contemplados o imágenes que no sean de producto, devolverá igualmente una de sus etiquetas, a menudo con alta confianza.
- La lista de etiquetas no está publicada en la información disponible (la model card contiene marcadores `[FILL]` sin rellenar), lo que dificulta conocer la cobertura real del modelo.
- No se documentan el tamaño ni la composición del dataset de entrenamiento, el reparto de splits ni el hardware utilizado, lo que limita la reproducibilidad.
- Riesgo de sesgo por el origen de los datos: si las imágenes provienen de un conjunto limitado de fuentes, el modelo puede generalizar mal a otras variedades, iluminaciones, fondos o cámaras.
- Riesgo de alucinación en el sentido de clasificaciones seguras pero erróneas: el modelo siempre devuelve una etiqueta con una probabilidad, por lo que conviene aplicar un umbral de confianza y derivar los casos dudosos a una persona.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero no se ofrece ninguna garantía por parte del autor.
- No apto para consejo al consumidor, médico o de salud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/v3loc1ty/kafwain-produce-freshness-vit
- Dataset de entrenamiento: https://huggingface.co/datasets/v3loc1ty/kafwain-produce-freshness
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Paper de ViT (arXiv:2010.11929): https://arxiv.org/abs/2010.11929
- Alternativa encontrada en la búsqueda: https://huggingface.co/Vinay5566/AI-freshness-detection
- Proyecto relacionado en GitHub: https://github.com/pkrutika03/FreshScan-Pro/blob/main/
