# Wojtekb30/LIS1-0.8B

## Resumen

LIS1-0.8B (Linguistic Image Segmenter 0.8B) es un modelo de segmentación de imágenes por referencia (*referring image segmentation*) desarrollado por Wojtekb30. Forma parte de la familia LIS1, que incluye variantes de 0.8B, 2B, 4B, 9B y 27B construidas sobre Qwen3.5. El modelo resuelve la tarea de generar máscaras pixel-level a partir de consultas en lenguaje natural, incluyendo acertijos funcionales (por ejemplo, "algo que puedes beber" para referirse a un vaso).

La innovación principal es que realiza el razonamiento visual y la decodificación de máscaras en un único paso forward, sin generación autorregresiva de tokens y sin encoder SAM externo. Utiliza el Vision Transformer nativo de Qwen3.5 y los estados ocultos del LLM para producir máscaras directamente, lo que reduce la latencia frente a aproximaciones como LISA.

El modelo se distribuye con licencia Apache 2.0, está etiquetado para inglés y su repositorio ocupa aproximadamente 0.1 GB. En el momento de la consulta no registra descargas ni likes en Hugging Face, lo que sugiere un lanzamiento reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer + LLM de Qwen3.5 con cabeza de máscaras (no autorregresiva) |
| Parametros totales | 0.8B (backbone Qwen3.5-0.8B más cabeza de máscaras) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit (bitsandbytes); bfloat16 completo |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y .pt (PyTorch) |

## Arquitectura y entrenamiento

LIS1 combina el backbone multimodal Qwen3.5 (con su Vision Transformer nativo y el LLM) con una cabeza de decodificación de máscaras entrenada específicamente. A diferencia de LISA, que genera tokens de texto de forma autorregresiva y delega la segmentación a un SAM independiente, LIS1 aprovecha los estados ocultos del LLM en un único forward pass para producir máscaras directamente. El pipeline incluye kernels de atención lineal opcionales (`causal-conv1d`, `flash-linear-attention`) para acelerar en GPU.

El entrenamiento se realizó exclusivamente sobre el dataset RefCOCO de lichengunc, que agrega RefCOCO, RefCOCO+ y RefCOCOg con un 35% de aumento sintético mediante acertijos funcionales. Se ofrecen dos variantes por tamaño: `noLora` (etapa 1, cabeza de máscaras entrenada con el Qwen3.5 base congelado) y `forLora` (etapa 2, cabeza más un adaptador LoRA con r=8 y alpha=16 aplicado solo a las 4 capas superiores del LLM). La evaluación se hizo zero-shot sobre ReasonSeg, sin ver imágenes de entrenamiento de ese benchmark.

## Capacidades

- Segmentación de imágenes por referencia a partir de consultas en lenguaje natural (etiquetas directas como "toast").
- Razonamiento de sentido común para resolver acertijos funcionales ("something you can drink").
- Segmentación multi-consulta simultánea con puntuaciones de confianza por máscara.
- Decodificación de máscaras pixel-level en un solo paso forward, sin SAM externo.
- Soporte de cuantización 4-bit y 8-bit para reducir requisitos de memoria.
- Caché de visión (`cache_vision`) para reutilizar características visuales entre consultas.
- Aislamiento de consultas (`isolate_queries`) para generar máscaras independientes por query.
- No dispone de tool calling ni de capacidades de agente multi-paso según la información disponible.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Anotación semiautomática de datasets de segmentación: el modelo puede generar máscaras a partir de descripciones textuales para preetiquetar imágenes, reduciendo el coste de anotación manual en pipelines de visión por computador.
- Segmentación en robótica de manipulación: dado un objeto descrito funcionalmente ("algo que puedes beber"), el modelo devuelve la máscara para que el brazo robótico pueda localizarlo y agarrarlo.
- Edición de imágenes asistida por lenguaje: integrar LIS1 en herramientas de retoque para que el usuario seleccione regiones mediante descripciones naturales sin dibujar polígonos.
- Análisis de escenas en conducción autónoma o vigilancia: segmentar objetos descritos de forma indirecta permite consultas más flexibles que las clases fijas de un detector tradicional.
- Moderación de contenido visual: localizar regiones descritas por el moderador ("la zona con texto superpuesto") para aplicar censura o revisión.
- Asistencia a personas con discapacidad visual: describir verbalmente un objeto y obtener su ubicación precisa en la imagen para guiar la interacción.
- Procesamiento en tiempo real en dispositivos con GPU de consumo: la variante 0.8B en 4-bit cabe en GPUs modestas, lo que permite despliegues de baja latencia sin SAM separado.

## Benchmarks y rendimiento

Resultados en ReasonSeg (zero-shot, gIoU y cIoU):

| Metodo | Val overall gIoU | Val overall cIoU | Test overall gIoU | Test overall cIoU |
|---|---:|---:|---:|---:|
| LIS1-0.8B noLora | 31.7 | 32.5 | 27.5 | 29.6 |
| LIS1-0.8B forLora | 32.4 | 31.7 | 29.4 | 28.6 |
| LIS1-2B noLora | 37.4 | 33.1 | 34.6 | 32.6 |
| LIS1-4B noLora | 42.3 | 38.3 | 42.8 | 38.7 |
| LIS1-9B noLora | 45.2 | 38.3 | 42.8 | 37.0 |
| LIS1-27B noLora | 54.1 | 54.3 | 49.3 | 49.0 |
| LISA-7B | 44.4 | 46.0 | 36.8 | 34.1 |
| LISA-7B (ft) | 52.9 | 54.0 | 47.3 | 48.4 |
| LISA-13B (ft) | 56.2 | 62.9 | 51.7 | 51.1 |

El autor afirma que las variantes de 4B en adelante superaron a Ultralytics MobileSAM y YOLOE Open Vocabulary en evaluación interna, aunque no se aportan cifras de esa comparación.

## Requisitos de hardware

- VRAM estimada para LIS1-0.8B: aproximadamente 2-3 GB en 4-bit, 5-6 GB en 8-bit y en torno a 8-10 GB en bfloat16 (estimación a partir del tamaño del backbone y la cabeza de máscaras; no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para 4-bit; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para variantes mayores de la familia.
- Cabe en GPU de consumo: sí, la variante 0.8B en 4-bit es apta para GPUs de gama media y posiblemente para algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: el repositorio proporciona scripts propios (`example.py`, `lis1_infer.py`, `LIS1ModelCode.py`) basados en `transformers`, `peft`, `safetensors` y `bitsandbytes`. No se menciona soporte directo para vLLM, llama.cpp, Ollama ni TGI.
- Aceleración opcional: `causal-conv1d` y `flash-linear-attention` para kernels de atención lineal en CUDA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | ReasonSeg test overall gIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIS1-0.8B | 0.8B | Single-pass, sin SAM | 27.5 (noLora) / 29.4 (forLora) | Apache 2.0 | Hugging Face |
| LISA-7B | 7B | Autorregresivo + SAM | 36.8 | Apache 2.0 (repo original) | Hugging Face / GitHub |
| LISA-13B (ft) | 13B | Autorregresivo + SAM | 51.7 | Apache 2.0 (repo original) | Hugging Face / GitHub |
| X-Decoder | no disponible | Multitarea | 21.7 | no disponible | GitHub |
| SEEM | no disponible | Promptable segmentation | 24.3 | no disponible | GitHub |

La ventaja de LIS1-0.8B no es la precisión absoluta, sino la eficiencia: con menos de una décima parte de parámetros que LISA-7B queda por debajo en gIoU, pero elimina la generación autorregresiva y el encoder SAM, lo que reduce la latencia y el consumo de memoria.

## Limitaciones y advertencias

- Precisión modesta en ReasonSeg: 27.5 gIoU en test, inferior a LISA-7B (36.8) y muy por debajo de LISA-13B (51.7). No es adecuada para tareas donde se requiera máxima exactitud de máscara.
- Entrenada solo en RefCOCO y sus variantes; puede generalizar mal a dominios visuales muy distintos (imágenes médicas, satelitales, microscopía).
- Soporte limitado a inglés; las consultas en castellano no están cubiertas oficialmente.
- Sin datos publicados sobre sesgos demográficos o de clase en las máscaras generadas.
- Riesgo de alucinación de objetos: si la consulta describe algo que no está en la imagen, el modelo puede devolver una máscara espuria con puntuación baja; se recomienda usar el umbral (`threshold=0.7` en el ejemplo) y validar las puntuaciones.
- El repositorio tiene 0 descargas y 0 likes, lo que implica poca validación externa.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del backbone Qwen3.5 y de los datasets de entrenamiento para uso comercial.
- Dependencia de scripts propios para la inferencia; no hay integración con frameworks de despliegue estándar (vLLM, TGI), lo que complica el escalado en producción.
- No se han publicado cifras de latencia ni throughput, lo que impide planificar capacity.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wojtekb30/LIS1-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Wojtekb30/ref_coco_lichengunc
- Split de validación ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_val
- Split de test ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_test
- Repositorio LISA (referencia comparativa): https://github.com/JIA-Lab-research/LISA
- Tabla de evaluación original de LISA: https://github.com/JIA-Lab-research/LISA/blob/main/imgs/table1.jpg
