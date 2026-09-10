# timm/qwen3_vit_416m_enc.qwen3_5_27b

## Resumen

`timm/qwen3_vit_416m_enc.qwen3_5_27b` es un encoder de características de imagen extraído del modelo multimodal Qwen3.5-27B y reempaquetado en formato nativo de la librería timm por Ross Wightman (organización `timm` en Hugging Face). No es un modelo de lenguaje ni un modelo de clasificación: es el componente de visión del VLM original, con 459,8 millones de parámetros, que incluye el backbone, el merger espacial y la proyección a la anchura del LLM de origen (5120). Se publica bajo licencia Apache 2.0 y pipeline `image-feature-extraction`.

Su relevancia es fundamentalmente de ingeniería: permite reutilizar el encoder visual de Qwen3.5-27B de forma aislada, sin cargar los 27.000 millones de parámetros del modelo completo, para investigación de representaciones, destilación, construcción de pipelines multimodales propios o entrenamiento de cabezas específicas sobre características preentrenadas. Al estar remapeado a timm, se integra con el ecosistema habitual de `timm.data` (resolución de `data_config`, transformaciones, `forward_intermediates`) y con `transformers` mediante `timm.create_model('hf-hub:...')`.

El checkpoint no ha recibido entrenamiento adicional: es un remap directo de los pesos de visión del Qwen3.5-27B original (revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`). Esto implica que su calidad depende enteramente de la del encoder de origen y que no existe una model card con datos de dataset, número de tokens de entrenamiento ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con merger espacial y proyección a anchura de LLM; MLP con GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parametros totales | 459.845.360 (459,8 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: es un encoder de visión. Produce 576 tokens por imagen de 768 x 768 (rejilla 48 x 48 con merger 2 x 2) |
| Tipos de cuantizacion | No disponible: no se publican variantes cuantizadas; el repositorio contiene safetensors (1,8 GB, coherente con pesos en fp32) |
| Idiomas soportados | No disponible: no procesa texto, solo imágenes RGB |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargable con `timm` vía `hf-hub`) |

Datos adicionales de la model card: anchura del backbone 1152, anchura de proyección 5120, GMACs 1305,9, activaciones 2999,2 M, resolución de imagen de referencia 768 x 768.

## Arquitectura y entrenamiento

El modelo es un ViT con anchura de backbone de 1152 canales que procesa imágenes de 768 x 768 y genera una rejilla de 48 x 48 parches. Sobre esa rejilla aplica un merger espacial 2 x 2 que reduce la secuencia a 576 tokens, y una proyección final a 5120 dimensiones, que es exactamente la anchura del LLM de Qwen3.5-27B. La implementación emplea MLPs con activación GELU-tanh, posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) y RoPE 2D axial regenerado para cada tamaño de entrada. Para esta variante solo imagen, los pesos del Conv3d temporal del encoder original se han sumado en un Conv2d, de forma que una imagen se replica como un único frame a lo largo del kernel temporal original. La normalización de las transformaciones de timm usa `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.

No hay entrenamiento propio ni ajuste adicional: es un remap nativo de los pesos de visión del Qwen3.5-27B original, sin cabeza de clasificación y sin pesos de lenguaje. Por tanto, no se dispone de información sobre composición del dataset, número de tokens vistos, uso de RLHF/DPO ni innovaciones de entrenamiento específicas de este checkpoint; el paper asociado (`Qwen3.5: Towards Native Multimodal Agents`, Qwen Team, febrero de 2026) documentaría el proceso del modelo completo, no de este extracto.

## Capacidades

- Extracción de características de imagen sin normalizar mediante `forward_features(x)`, con salida en formato NHWC de forma `(1, 48, 48, 1152)` para una entrada de 768 x 768.
- Generación de tokens espaciales proyectados mediante `forward()`, con salida `(1, 576, 5120)` lista para inyectarse en un LLM de anchura 5120.
- Extracción de mapas de características intermedios con `forward_intermediates(..., output_fmt='NCHW')`, útil para tareas densas.
- Soporte de entradas rectangulares, siempre que cada dimensión sea divisible por 16 (y por 32 en las variantes que usan el merger 2 x 2).
- Compatibilidad nativa con las transformaciones y utilidades de datos de `timm` (`resolve_model_data_config`, `create_transform`).
- No incluye cabeza de clasificación: la variante `_enc` devuelve tokens fusionados espacialmente, y se puede añadir una cabeza propia para clasificación, segmentación o recuperación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: carece de pesos de lenguaje.
- No procesa vídeo en esta implementación, ya que el kernel temporal se ha colapsado a 2D.

## Casos de uso

- Sustitución del encoder visual en un pipeline VLM propio: al proyectar a 5120 dimensiones, las características pueden conectarse directamente a un LLM con esa anchura sin capa de alineamiento adicional, lo que simplifica prototipos multimodales.
- Recuperación visual y búsqueda de imágenes: añadiendo una cabeza de pooling y una normalización L2 sobre los 576 tokens, se obtienen embeddings de imagen utilizables en índices vectoriales para búsqueda por similitud.
- Clasificación por linear probing: congelar el encoder y entrenar una capa lineal sobre las características del backbone (1152 dimensiones) es un experimento barato y reproducible para evaluar la calidad de las representaciones.
- Tareas densas de visión artificial: segmentación semántica, detección o estimación de profundidad aprovechando `forward_intermediates` para obtener mapas NCHW de 1152 x 48 x 48.
- Destilación de conocimiento: usar las características del encoder como objetivo para entrenar modelos de visión más pequeños, dado que el checkpoint aísla el componente visual sin el coste de cargar 27.000 millones de parámetros.
- Preprocesado en sistemas RAG multimodal: generar tokens visuales de 5120 dimensiones para indexarlos junto a texto en una base de datos vectorial, sin necesidad de ejecutar el LLM completo durante la fase de indexación.
- Investigación de alineación visión-lenguaje: analizar cómo se comportan los tokens proyectados frente a los embeddings de texto del modelo base, o auditar sesgos visuales del encoder de Qwen3.5.
- Control de calidad industrial y análisis de imágenes médicas o satelitales: extracción de características densas como paso previo a un clasificador específico del dominio, con la ventaja de partir de un encoder multimodal preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ImageNet, zero-shot, retrieval ni ninguna otra tarea estándar, y este checkpoint no ha sido entrenado ni evaluado de forma independiente. Los únicos datos cuantitativos publicados son de coste computacional, no de calidad:

| Metrica | Valor |
|---|---|
| Parametros (M) | 459,8 |
| GMACs | 1305,9 |
| Activaciones (M) | 2999,2 |
| Resolucion de imagen de referencia | 768 x 768 |
| Tokens de salida por imagen | 576 |
| Anchura del backbone | 1152 |
| Anchura de proyeccion | 5120 |

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,84 GB en fp32 (coincide con el tamaño del repositorio, 1,8 GB) y unos 0,92 GB en fp16/bf16 si se convierte manualmente.
- Activaciones: la model card reporta 2999,2 M de activaciones, lo que como cota superior teórica en fp32 equivaldría a unos 12 GB si se materializasen todas a la vez; en inferencia real con `torch.inference_mode()` y sin gradientes la huella es muy inferior. Con `torch.no_grad()` y lotes pequeños, una GPU de 8 GB es suficiente.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB (RTX 3060, RTX 4060, RTX 3080, RTX 4090) es válida para lotes pequeños en fp16/bf16. Para lotes grandes o extracción masiva de características, A100 o H100 aportan más margen de memoria y throughput.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas con 6 GB o más, e incluso en CPU para inferencia puntual (con latencia mucho mayor).
- Opciones de despliegue: `timm` (vía `hf-hub:timm/qwen3_vit_416m_enc.qwen3_5_27b`), PyTorch directo, la `pipeline` de `transformers` con tarea `image-feature-extraction`, y exportación a ONNX, TorchScript o ExecuTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo de texto.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imágenes por segundo, ni para GPU ni para CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa. A modo orientativo, la categoría de comparables la forman otros encoders de visión de rango 300-500 M de parámetros (por ejemplo, los encoders de CLIP ViT-L, SigLIP o DINOv2), pero sus cifras concretas de parámetros, contexto, licencia y disponibilidad no se han facilitado y no se incluyen aquí para no introducir datos no verificados.

| Aspecto | qwen3_vit_416m_enc.qwen3_5_27b | Alternativas de la misma categoria |
|---|---|---|
| Parametros | 459,8 M | no disponible en la informacion proporcionada |
| Contexto / tokens de salida | 576 tokens por imagen de 768 x 768 | no disponible en la informacion proporcionada |
| Rendimiento en benchmarks | no publicado | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 | no disponible en la informacion proporcionada |
| Disponibilidad | Hugging Face, formato timm/safetensors | no disponible en la informacion proporcionada |

El diferenciador verificable de este checkpoint frente a otros encoders genéricos es su proyección nativa a 5120 dimensiones, pensada para emparejarse con el LLM de Qwen3.5-27B, lo que evita tener que entrenar una capa de proyección propia.

## Limitaciones y advertencias

- No contiene pesos de lenguaje ni cabeza de clasificación entrenada: no puede generar texto, responder preguntas ni clasificar imágenes por sí solo sin una cabeza adicional.
- No ha recibido entrenamiento ni ajuste posterior: es un remap de pesos, de modo que cualquier limitación del encoder original de Qwen3.5-27B se hereda intacta.
- Sesgos: no documentados en la información disponible. Al provenir de un modelo entrenado por Qwen, es razonable esperar sesgos culturales y de representación en los datos de preentrenamiento, pero no hay análisis publicado para este checkpoint.
- Riesgo de alucinación: no aplica a generación, ya que el modelo no produce texto. El riesgo se traslada a cualquier cabeza o LLM que consuma sus características.
- Restricciones de resolución: cada dimensión de la imagen debe ser divisible por 16, y por 32 en las variantes con merger 2 x 2; las entradas que no cumplan esto fallarán o requerirán redimensionado.
- Generalización de resolución: aunque las posiciones absolutas se interpolan y el RoPE se regenera por tamaño, no hay evidencia publicada de que el rendimiento se mantenga fuera de la resolución de referencia de 768 x 768.
- Vídeo no soportado: el kernel temporal Conv3d del encoder original se ha colapsado a Conv2d, por lo que esta implementación es estrictamente de imagen estática.
- Salida sin normalizar en `forward_features()`: las características NHWC se devuelven en crudo, y cualquier uso posterior (similitud coseno, clustering) requiere aplicar la normalización adecuada.
- Licencia: el checkpoint es Apache 2.0, pero la model card enlaza la licencia del modelo fuente Qwen3.5-27B como origen; conviene revisar ese archivo antes de un uso comercial para confirmar que no añade condiciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni informes de terceros sobre su comportamiento en producción.
- Idiomas: al no procesar texto, no tiene capacidades multilingües evaluables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m_enc.qwen3_5_27b
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Revisión concreta del modelo fuente: https://huggingface.co/Qwen/Qwen3.5-27B/tree/fc05daec18b0a78c049392ed2e771dde82bdf654
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen3.5-27B/blob/fc05daec18b0a78c049392ed2e771dde82bdf654/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentación de timm (fast.ai): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- DOI de PyTorch Image Models: https://doi.org/10.5281/zenodo.4414861
