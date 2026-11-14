# Wojtekb30/LIS1-9B

## Resumen

LIS1-9B (Linguistic Image Segmenter) es un modelo de segmentación de imágenes por referencia (referring image segmentation) y razonamiento visual desarrollado por Wojtekb30. Forma parte de una familia de modelos construida sobre Qwen3.5 en cinco tamaños (0.8B, 2B, 4B, 9B y 27B). A diferencia de aproximaciones como LISA, que generan tokens de texto de forma autorregresiva y dependen de un codificador SAM externo, LIS1 realiza el razonamiento y la decodificación de máscaras a nivel de píxel en una sola pasada hacia delante, sin generación autorregresiva de tokens y sin codificador SAM adicional.

El modelo combina el Vision Transformer nativo de Qwen3.5 con los estados ocultos del LLM para producir máscaras directamente. Se entrena exclusivamente sobre RefCOCO, RefCOCO+ y RefCOCOg (con un 35% de aumento sintético de adivinanzas funcionales) y se evalúa zero-shot sobre ReasonSeg. La variante de 9B se distribuye con dos checkpoints: una etapa 1 con la cabeza de máscaras entrenada y el modelo base congelado (`noLora`) y una etapa 2 que añade un adaptador LoRA ligero sobre las cuatro capas superiores del LLM (`forLora`).

La relevancia del modelo radica en su enfoque de "System1": razonamiento visual de una sola pasada que evita la latencia de la decodificación autorregresiva y el coste computacional de un backbone SAM separado, lo que lo hace atractivo para aplicaciones de segmentación interactiva en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (Vision Transformer nativo + LLM) con cabeza de máscaras no autorregresiva |
| Parametros totales | 9B (modelo base Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit (bitsandbytes); bfloat16 completo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y .pt (PyTorch) |

## Arquitectura y entrenamiento

LIS1 se construye sobre Qwen3.5 y aprovecha su Vision Transformer nativo junto con los estados ocultos del LLM para decodificar máscaras de segmentación en una única pasada hacia delante. No emplea generación autorregresiva de tokens ni un codificador SAM externo, lo que reduce la latencia frente a modelos de razonamiento de segmentación tradicionales. La familia incluye variantes de 0.8B, 2B, 4B, 9B y 27B parámetros.

El entrenamiento se realizó exclusivamente sobre el dataset RefCOCO de lichengunc, que agrupa RefCOCO, RefCOCO+, RefCOCOg y un 35% de aumento sintético de adivinanzas funcionales (functional riddles). Cada repositorio ofrece dos variantes: `noLora` (etapa 1), con la cabeza de máscaras entrenada y el modelo Qwen3.5 base completamente congelado, y `forLora` (etapa 2), que añade un adaptador PEFT LoRA con r=8 y alpha=16 aplicado únicamente a las cuatro capas superiores del LLM. La evaluación se realizó zero-shot sobre ReasonSeg, sin haber visto imágenes de entrenamiento de ese benchmark.

## Capacidades

- Segmentación de imágenes por referencia a partir de lenguaje natural (nombres de objetos directos).
- Razonamiento visual de sentido común y resolución de adivinanzas funcionales (por ejemplo, "algo que puedes beber") para localizar y segmentar objetos.
- Segmentación multi-consulta simultánea en una misma imagen, con aislamiento de consultas (`isolate_queries`).
- Decodificación de máscaras a nivel de píxel en una sola pasada, sin generación autorregresiva de tokens.
- Soporte de cuantización 4-bit y 8-bit para reducir requisitos de memoria.
- Caché de visión (`cache_vision`) para reutilizar características visuales entre consultas.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario escribe el nombre de un objeto y el modelo devuelve su máscara en una sola pasada, lo que permite una experiencia de edición casi instantánea.
- Anotación automática de datasets de visión: el modelo puede generar máscaras de referencia para RefCOCO y otros conjuntos, acelerando el etiquetado de píxeles con consultas en lenguaje natural.
- Robótica y manipulación guiada por lenguaje: dado un comando como "coge la taza roja", el modelo localiza y segmenta el objeto para el sistema de percepción, gracias a su razonamiento de adivinanzas funcionales.
- Análisis de imágenes médicas o industriales asistido: segmentación de regiones descritas mediante lenguaje natural, con la ventaja de no requerir un backbone SAM separado en el pipeline.
- Sistemas de accesibilidad: descripción y localización de objetos en imágenes a partir de consultas verbales o escritas del usuario.
- Moderación y análisis de contenido visual: identificación y aislamiento de regiones específicas descritas por texto en flujos de revisión automatizada.
- Integración en pipelines de visión por computador con cuantización 4-bit: despliegue en GPUs de consumo para prototipado y pruebas, reduciendo el coste de infraestructura.

## Benchmarks y rendimiento

Resultados en ReasonSeg (zero-shot), comparados con modelos de referencia:

| Metodo | Val overall gIoU | Val overall cIoU | Test overall gIoU | Test overall cIoU |
|---|---:|---:|---:|---:|
| LISA-7B | 44.4 | 46.0 | 36.8 | 34.1 |
| LISA-13B | 48.9 | 46.9 | 44.8 | 45.8 |
| LIS1-9B noLora | 45.2 | 38.3 | 42.8 | 37.0 |
| LIS1-9B forLora | 45.1 | 40.0 | 43.9 | 39.6 |
| LIS1-27B forLora | 54.0 | 54.8 | 50.0 | 50.4 |

En la validación, LIS1-9B noLora alcanza un gIoU de 45.2, ligeramente por encima de LISA-7B (44.4) y por debajo de LISA-13B (48.9). En el conjunto de test, LIS1-9B forLora obtiene un gIoU de 43.9, por debajo de LISA-13B (44.8). El autor indica que LIS1 4B y superiores obtuvieron mejores resultados que Ultralytics MobileSAM y YOLOE Open Vocabulary en evaluación interna, aunque no se proporcionan cifras de esa comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con cuantización 4-bit el modelo de 9B requiere aproximadamente entre 6 y 8 GB solo para los pesos, más el coste de las activaciones del Vision Transformer y la cabeza de máscaras.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: probablemente en GPUs con 12-16 GB o más usando cuantización 4-bit, aunque no se confirma en la documentación.
- Opciones de despliegue: el código de ejemplo usa `transformers`, `peft`, `safetensors`, `bitsandbytes` y `accelerate`, con kernels opcionales `causal-conv1d` y `flash-linear-attention` para GPUs CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor destaca la ventaja de la pasada única frente a la generación autorregresiva, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Val gIoU (ReasonSeg) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIS1-9B | 9B | Pasada única, sin SAM, sin autorregresión | 45.2 (noLora) | apache-2.0 | Hugging Face |
| LISA-7B | 7B | Autorregresivo + SAM | 44.4 | no disponible en la información | Hugging Face |
| LISA-13B | 13B | Autorregresivo + SAM | 48.9 | no disponible en la información | Hugging Face |
| X-Decoder | no disponible | Segmentación por referencia | 22.6 | no disponible en la información | Hugging Face |

LIS1-9B compite directamente con LISA-7B y LISA-13B en la tarea de segmentación por razonamiento. Su principal ventaja es la arquitectura de pasada única sin backbone SAM, que reduce la latencia y la complejidad del pipeline; su desventaja es que en cIoU queda por debajo de LISA-13B en validación (38.3 frente a 46.9).

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- El entrenamiento se limita a RefCOCO, RefCOCO+ y RefCOCOg con aumento sintético; puede generalizar peor a dominios visuales muy distintos (médico, satelital, industrial).
- Riesgo de alucinación en el razonamiento de adivinanzas funcionales: la máscara puede corresponder a un objeto plausible pero incorrecto.
- El rendimiento en cIoU es inferior al de LISA-13B en validación, lo que sugiere menor precisión en la cobertura de píxeles.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener sus propias condiciones que conviene verificar.
- No se han publicado datos sobre sesgos, robustez ante imágenes adversarias ni comportamiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La documentación no especifica la longitud de contexto ni los requisitos exactos de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wojtekb30/LIS1-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/Wojtekb30/ref_coco_lichengunc
- Split de validación ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_val
- Split de test ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_test
- Repositorio LISA (referencia de comparación): https://github.com/JIA-Lab-research/LISA
