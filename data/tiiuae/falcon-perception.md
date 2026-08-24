# tiiuae/Falcon-Perception

## Resumen

Falcon Perception es un modelo de visión y lenguaje desarrollado por el Technology Innovation Institute (TII) de Abu Dabi, especializado en segmentación de instancias y grounding de vocabulario abierto. Con 632 millones de parámetros, emplea una arquitectura de fusión temprana (early fusion) en la que los parches de imagen y los tokens de texto se procesan conjuntamente en un único Transformer desde la primera capa, utilizando una máscara de atención híbrida: bidireccional entre tokens de imagen y causal para texto y tokens de tarea. El modelo genera, para cada instancia detectada, una secuencia estructurada de tokens (`<|coord|>`, `<|size|>`, `<|seg|>`) que permite obtener coordenadas, dimensiones y una máscara binaria a resolución completa sin decodificación autoregresiva de la máscara.

El modelo está diseñado para escenarios de grounding denso, donde el número de instancias es grande y variable, y donde la localización bajo vocabulario abierto es el principal desafío. No se concibe como un asistente general de visión y lenguaje para razonamiento abierto o VQA multi-paso. Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, e incluye una revisión post-entrenada con aprendizaje por refuerzo (GRPO) que mejora el recall en escenas de alta densidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer early-fusion con atención híbrida (bidireccional para imagen, causal para texto) |
| Parametros totales | 632.372.288 (0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende de la resolución de imagen, máx. 1024 píxeles en lado mayor) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Falcon Perception utiliza una única pila de Transformer que procesa conjuntamente parches de imagen y tokens de texto desde la primera capa. La atención es híbrida: los tokens de imagen se atienden entre sí de forma bidireccional, mientras que los tokens de texto y de tarea se decodifican de forma causal condicionada a la imagen. Para cada instancia, el modelo genera una secuencia fija de tokens de tarea en orden: `<|coord|>` (coordenadas del centro), `<|size|>` (altura y anchura) y `<|seg|>` (consulta de máscara). El estado oculto del token `<|seg|>` se proyecta y se multiplica con características de imagen sobremuestreadas, produciendo una máscara binaria a resolución completa sin generación autoregresiva de la máscara.

El entrenamiento base no se detalla en la información disponible (número de tokens, composición del dataset, etc.). Sin embargo, se publica una revisión post-entrenada mediante aprendizaje por refuerzo (GRPO) con una recompensa de emparejamiento húngaro que penaliza falsos positivos y falsos negativos. Esta revisión, disponible en la revisión `19-08-2026`, mejora el recall en escenas densas (hasta 500 instancias por imagen) y elimina la necesidad de NMS y deduplicación de coordenadas, sin cambios en la arquitectura ni el tokenizador.

## Capacidades

- Segmentación de instancias con vocabulario abierto: dado un prompt en lenguaje natural, devuelve cero, una o múltiples instancias con máscaras precisas a nivel de píxel.
- Grounding de lenguaje natural: localiza objetos descritos por texto en imágenes, incluyendo atributos, relaciones espaciales y guiado por OCR.
- Detección de objetos: genera coordenadas normalizadas del centro y dimensiones (alto y ancho) para cada instancia.
- OCR guiado por lenguaje: puede leer texto en imágenes cuando la consulta lo requiere (por ejemplo, "encuentra el cartel que dice 'STOP'").
- Decodificación paralela de máscaras: cada token `<|seg|>` produce una máscara completa mediante producto escalar con características de imagen, sin decodificación autoregresiva.
- Post-entrenamiento con RL: la revisión `19-08-2026` mejora el recall en escenas densas y simplifica el post-procesado.

## Casos de uso

- Segmentación promptable en pipelines de visión por computador: Falcon Perception puede usarse como módulo de segmentación de instancias dirigido por texto en flujos de trabajo que requieren aislar objetos específicos (por ejemplo, en robótica o inspección industrial). Su interfaz simple (`model.generate(images, queries)`) permite integrarlo fácilmente.
- Análisis de imágenes médicas o de satélite: la capacidad de segmentar estructuras descritas en lenguaje natural (p. ej., "vasos sanguíneos", "edificios") facilita la anotación automática de datasets sin necesidad de entrenar modelos específicos.
- Moderación de contenido visual: dado un prompt como "arma" o "contenido violento", el modelo puede localizar y segmentar regiones relevantes en imágenes, ayudando a filtrar contenido inapropiado.
- Búsqueda visual por atributos: en comercio electrónico, permite buscar productos por descripciones complejas ("vestido rojo con mangas largas") y devolver la región exacta del producto en la imagen.
- Asistencia a la conducción autónoma: la detección de objetos en escenas densas (peatones, señales, vehículos) con consultas en lenguaje natural puede complementar sistemas de percepción tradicionales, especialmente en entornos urbanos concurridos.
- Generación de datos de entrenamiento: el modelo puede usarse para anotar automáticamente máscaras de instancia en grandes conjuntos de imágenes, reduciendo el coste de anotación manual en tareas de segmentación semántica o panóptica.

## Benchmarks y rendimiento

La model card reporta resultados en el dataset PBench (mask F1) para la versión base y la versión post-entrenada con RL:

| Split | Falcon Perception | RL post-trained | Δ |
|---|---|---|---|
| L0 Simple objects | 63,7 | 64,9 | +1,1 |
| L1 Attribute | 63,8 | 64,2 | +0,5 |
| L2 OCR guided | 38,3 | 40,4 | +2,1 |
| L3 Spatial understanding | 53,4 | 54,7 | +1,3 |
| L4 Relation binding | 49,1 | 51,8 | +2,7 |
| Dense | 72,3 | 80,5 | +8,2 |
| **Average** | **56,8** | **59,4** | **+2,6** |

Además, se menciona un resultado de 68,0 Macro F1 en SA-Co (open-vocabulary segmentation), comparado con 62,3 de una referencia no especificada. No se proporcionan más detalles de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 0,6B parámetros, los pesos en FP16 ocupan aproximadamente 1,3 GB, por lo que es viable en GPUs de consumo con al menos 4 GB de VRAM (p. ej., RTX 3050, RTX 3060, RTX 4060).
- Se requiere PyTorch 2.5 o superior para usar FlexAttention, que es un componente clave de la implementación. La primera llamada puede ser más lenta porque `torch.compile` puede construir kernels optimizados.
- El repositorio de GitHub proporciona un motor de inferencia en PyTorch, y el modelo se integra con la librería `transformers` mediante `AutoModelForCausalLM` con `trust_remote_code=True`.
- No se especifican requisitos de VRAM exactos ni latencia/throughput en la documentación disponible. Se recomienda probar en la GPU objetivo para medir el rendimiento real.
- Opciones de despliegue: además de `transformers`, el código de inferencia del repositorio oficial puede adaptarse a entornos de producción. No se menciona soporte explícito para vLLM, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con otros modelos de segmentación open-vocabulary (como Grounding DINO, SAM-CLIP o X-Decoder). Los únicos datos comparativos son los de SA-Co (68,0 vs 62,3 de una referencia no identificada). Por tanto, la comparativa con alternativas específicas se considera no disponible.

## Limitaciones y advertencias

- No es un asistente general de visión y lenguaje: no está diseñado para razonamiento abierto, generación de texto largo o VQA multi-paso. Su uso fuera de tareas de grounding y segmentación puede producir resultados pobres.
- Sesgos y alucinaciones: como todo modelo entrenado con datos web, puede reflejar sesgos presentes en los datos y generar máscaras o localizaciones incorrectas, especialmente con consultas ambiguas o fuera de distribución.
- Dependencia de la resolución de imagen: el modelo redimensiona las imágenes a un lado máximo de 1024 píxeles, lo que puede afectar a la precisión en objetos muy pequeños o detalles finos.
- Rendimiento en escenas densas: la versión base requiere NMS y deduplicación de coordenadas; la versión RL post-entrenada elimina esta necesidad, pero se recomienda usar la revisión `19-08-2026` para escenarios con muchas instancias.
- Requisitos de software: necesita PyTorch 2.5+ y `torch.compile`, lo que puede limitar su despliegue en entornos con versiones antiguas de PyTorch o hardware sin soporte para FlexAttention.
- Idiomas: no se especifican los idiomas soportados; la documentación solo muestra ejemplos en inglés, por lo que el rendimiento en otros idiomas no está garantizado.

## Enlaces

- HuggingFace: https://huggingface.co/tiiuae/Falcon-Perception
- Repositorio de inferencia (GitHub): https://github.com/tiiuae/Falcon-Perception
- Página oficial de Falcon Perception: https://falconllm.tii.ae/falcon-perception.html
- Noticia de lanzamiento de TII: https://www.tii.ae/news/tii-launches-falcon-perception-new-multimodal-ai-model-helps-machines-see-and-understand-world
- Artículo arXiv (RL post-training): https://arxiv.org/abs/2608.18881
- Artículo arXiv (referencia adicional): https://arxiv.org/abs/2603.27365
- Dataset PBench: https://huggingface.co/tiiuae/PBench
- Modelo OCR asociado: https://huggingface.co/tiiuae/Falcon-OCR
