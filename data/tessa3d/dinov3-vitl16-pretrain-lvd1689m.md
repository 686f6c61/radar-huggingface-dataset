# tessa3d/dinov3-vitl16-pretrain-lvd1689m

## Resumen

DINOv3 ViT-L/16 (LVD-1689M) es un modelo de extraccion de caracteristicas visuales basado en un transformer de vision (ViT) desarrollado por Meta. Este repositorio concreto, publicado por el usuario `tessa3d`, es un espejo sin modificaciones del modelo original `facebook/dinov3-vitl16-pretrain-lvd1689m`, redistribuido bajo la licencia DINOv3 para su uso en el add-on Tessa Blender (conversion local de imagen a 3D). No esta afiliado ni respaldado por Meta.

El modelo resuelve la tarea de extraccion de caracteristicas (embeddings) densas y globales a partir de imagenes, sin necesidad de ajuste fino, y sirve como base para tareas downstream como segmentacion, deteccion, correspondencia densa o clasificacion con cabezas ligeras. Emplea una arquitectura ViT con parches de 16x16 y 303 millones de parametros, preentrenada con el metodo DINOv3 sobre el dataset LVD-1689M.

Es relevante ahora porque DINOv3 representa la ultima iteracion de la familia DINO de Meta para representaciones visuales auto-supervisadas, y este espejo facilita su integracion en pipelines de transformers y en herramientas de creacion 3D como Blender sin depender del repositorio original. Los pesos son byte-identicos al original (SHA256 `dcb2e45127cccbf1601e5f42fef165eea275c8e5213197e8dcf3f48822718179`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16), DINOv3 |
| Parametros totales | 303.129.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; el modelo procesa imagenes) |
| Licencia | dinov3-license (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tamano large (ViT-L) con parches de 16x16, entrenado con el metodo auto-supervisado DINOv3 descrito en el paper arXiv:2508.10104. La model card del espejo no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset LVD-1689M; esa informacion debe consultarse en la model card original de Meta. No se especifican en la informacion disponible detalles sobre RLHF, DPO ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

El repositorio es un espejo sin modificaciones: los pesos y la configuracion son identicos al original. No se ha realizado ningun ajuste fino ni cambio en el entrenamiento por parte de `tessa3d`.

## Capacidades

- Extraccion de caracteristicas visuales globales (embedding por imagen) para tareas de recuperacion, clasificacion y similitud.
- Extraccion de caracteristicas densas por parche, utiles para segmentacion, correspondencia densa y tareas pixel-level.
- Base para ajuste fino con cabezas ligeras en tareas downstream de vision.
- Procesamiento de imagenes en el pipeline `image-feature-extraction` de transformers.
- Integracion en herramientas de imagen-a-3D (caso de uso declarado: add-on Tessa Blender).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no aplica (modelo de vision).
- Capacidades especiales (thinking mode, vision, audio): vision; el resto no disponible.

## Casos de uso

- Conversion local de imagen a 3D en Blender: el add-on Tessa usa los embeddings del modelo para inferir geometria o correspondencias a partir de una imagen, evitando enviar datos a servicios en la nube. Es adecuado por su tamano contenido (303 M de parametros) y su capacidad de extraccion densa.
- Recuperacion de imagenes por similitud (image retrieval): se extrae el embedding global de cada imagen y se indexa en una base vectorial para busqueda visual; el modelo ofrece representaciones robustas sin ajuste fino.
- Segmentacion semantica con cabezas ligeras: se congelan los pesos del ViT y se entrena un decodificador pequeno sobre las caracteristicas por parche, reduciendo coste de entrenamiento.
- Correspondencia densa entre imagenes (matching): las caracteristicas por parche permiten emparejar puntos entre pares de imagenes para tareas de reconstruccion o seguimiento.
- Clasificacion de imagenes con pocos datos: se usa el embedding global como entrada a un clasificador lineal o k-NN, util en dominios con datasets pequenos.
- Preprocesamiento en pipelines de vision industrial: extraccion de caracteristicas para control de calidad, deteccion de anomalias o agrupamiento de imagenes en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 303 M de parametros en precision FP32 los pesos ocupan aproximadamente 1,2 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en precision completa; RTX 3060 o superior es suficiente. Para lotes grandes o entrenamiento de cabezas, se recomienda RTX 4090, A100 o H100.
- Cabe en consumer GPU: si, en la mayoria de GPUs modernas con 4-8 GB de VRAM.
- Opciones de despliegue: transformers (libreria declarada), con posible exportacion a ONNX u otros runtimes; no se especifican vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv3 ViT-L/16 (este espejo) | 303 M | no aplica | dinov3-license | HuggingFace (espejo) |
| DINOv3 ViT-L/16 original (Meta) | 303 M | no aplica | dinov3-license | HuggingFace (oficial) |
| Otros modelos de la familia DINOv3 (tamanos S/B) | no disponible | no aplica | dinov3-license | HuggingFace |
| Alternativas de extraccion visual (p. ej. CLIP ViT-L) | no disponible en la informacion | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo no oficial: no esta afiliado ni respaldado por Meta; para soporte y documentacion completa debe consultarse el repositorio original.
- La licencia `dinov3-license` es de tipo "other" e incluye restricciones de control comercial (Trade Controls) y usos prohibidos; es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- El modelo es de vision y no procesa texto; no admite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de sesgos y alucinaciones: no hay informacion especifica en la model card del espejo; debe consultarse la documentacion original de Meta.
- Limitaciones de contexto o idioma: no aplica contexto textual; la etiqueta de idioma "en" es informativa y no restringe el procesamiento de imagenes.
- Para produccion, verificar la integridad de los pesos mediante el SHA256 indicado y confirmar que la version del espejo coincide con la original.

## Enlaces

- Repositorio del espejo: https://huggingface.co/tessa3d/dinov3-vitl16-pretrain-lvd1689m
- Modelo original: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Licencia DINOv3: incluida en `LICENSE.md` del repositorio
