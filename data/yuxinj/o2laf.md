# YuxinJ/O2LaF

## Resumen

O²LaF (One Prior, Two Dynamics) es un modelo de investigación publicado por Yuxin Jiang y colaboradores (ShowLab, con participación de investigadores de otras instituciones según la autoría del paper) que reaprovecha un difusionador de vídeo preentrenado, Wan 2.2 TI2V-5B, para aprender acciones latentes de forma autosupervisada a partir de vídeo sin etiquetar. El modelo no genera texto ni razona: su tarea es inferir una "acción latente" para cada transición de un vídeo y, a partir de esa representación, generar vídeo condicionado por un primer fotograma y una secuencia de acciones.

La innovación central es el uso de un único prior (el DiT de Wan 2.2) para dos dinámicas complementarias: un codificador de acciones que extrae la acción entre fotogramas y un modelo del mundo que sintetiza la evolución del vídeo. Esto permite entrenar sin etiquetas de acción, algo relevante para robótica, manipulación egocéntrica y aprendizaje de dinámicas a partir de vídeo masivo no anotado.

El repositorio agrupa seis variantes (distintos codificadores de acción y distintos conjuntos de datos), con dos modos de inferencia: bidireccional (81 fotogramas) y causal (41 fotogramas), ambos a resolución 480×832. La variante recomendada por los autores es `o2laf_dit_mixed`, la única que incluye la biblioteca de acciones atómicas y la evaluada en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de difusión de vídeo (Wan 2.2 TI2V-5B) con codificador de acciones latentes y modelo del mundo; variantes con codificador V-JEPA 2 o transformer espaciotemporal |
| Parametros totales | no disponible (el modelo base es Wan 2.2 TI2V-5B, 5B aproximados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de vídeo de 81 fotogramas (bidireccional) o 41 fotogramas (causal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 72 GB; descarga por modo: ~2,5 GB causal, ~12 GB bidireccional) |

## Arquitectura y entrenamiento

El modelo parte de Wan 2.2 TI2V-5B, un transformer de difusión (DiT) para generación de vídeo texto-imagen-a-vídeo. Sobre ese prior se entrenan dos componentes: un codificador de acciones que, dado un par de fotogramas o una transición, produce una acción latente, y un modelo del mundo que, dado el primer fotograma y una secuencia de acciones latentes, genera el vídeo resultante. El entrenamiento es autosupervisado: no se usan etiquetas de acción, sino que las acciones se infieren de las transiciones observadas en vídeo.

El paper describe dos etapas y ablaciones sobre el codificador de acción (DiT de Wan, V-JEPA 2 con tronco ViT-g congelado, o un transformer espaciotemporal) y sobre el punto de arranque de la segunda etapa (modelo causal frente a Wan 2.2). Los datos de entrenamiento son MiraData y EgoDexMix, este último orientado a manipulación egocéntrica. La variante V-JEPA 2 requiere descargar aparte el checkpoint `vitg-384.pt` de Meta, ya que el tronco ViT-g no se distribuye en el repositorio. No se detallan en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO (no aplicable a un modelo de difusión de vídeo).

## Capacidades

- Generación de vídeo condicionada por primer fotograma y secuencia de acciones latentes (image-to-video con control por acciones).
- Inferencia de acciones latentes a partir de transiciones de vídeo no etiquetado (codificador de acciones).
- Dos modos de inferencia: bidireccional (81 fotogramas) y causal (41 fotogramas), a 480×832.
- Variante específica para vídeo egocéntrico de manipulación (`o2laf_dit_egodexmix`) a 24 fps; el resto a 16 fps.
- Biblioteca de acciones atómicas incluida en `o2laf_dit_mixed`.
- Transferencia de acciones entre vídeos mediante la herramienta `o2laf-transfer`.
- No soporta tool calling, agentes, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Aprendizaje de dinámicas para robótica: usar el codificador de acciones para extraer acciones latentes de vídeos de manipulación y entrenar políticas sin etiquetas manuales, aprovechando que el modelo no requiere anotaciones.
- Aumento de datos de vídeo: generar variaciones de una escena a partir de un primer fotograma y secuencias de acciones latentes para ampliar datasets de entrenamiento.
- Análisis de vídeo egocéntrico: con `o2laf_dit_egodexmix`, modelar secuencias de manipulación a 24 fps y estudiar la estructura de acciones en primera persona.
- Transferencia de movimiento entre vídeos: la herramienta `o2laf-transfer` permite aplicar la dinámica de un vídeo fuente a un primer fotograma distinto, útil en posproducción y prototipado visual.
- Investigación en modelos del mundo: comparar codificadores de acción (DiT, V-JEPA 2, transformer espaciotemporal) con las variantes de ablación incluidas en el repositorio.
- Simulación de entornos para planificación: usar el modelo del mundo causal (41 fotogramas) para predecir la evolución de una escena bajo una secuencia de acciones, como paso previo a planificación basada en modelo.
- Evaluación de representaciones latentes: emplear las acciones latentes como features para tareas downstream de clasificación o segmentación de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modo causal descarga ~2,5 GB de pesos y el bidireccional ~12 GB, lo que orienta el consumo, pero no se especifica la VRAM de inferencia.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base (5B) y la generación de vídeo a 480×832, se requiere previsiblemente una GPU de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM.
- ¿Cabe en GPU consumer? No confirmado; el modo causal (~2,5 GB de pesos) es el candidato más viable, pero no hay datos oficiales de VRAM pico.
- Opciones de despliegue: el repositorio oficial de código (`showlab/o2laf`) con la librería `o2laf` y `LatentActionPipeline`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| O²LaF | Modelo del mundo + codificador de acciones latentes sobre DiT de vídeo | ~5B (base Wan 2.2 TI2V-5B) | 81 o 41 fotogramas a 480×832 | Apache 2.0 | Hugging Face (YuxinJ/O2LaF) |
| Wan 2.2 TI2V-5B | Difusión de vídeo imagen-a-vídeo | ~5B | no disponible | Apache 2.0 | Hugging Face (Wan-AI) |
| V-JEPA 2 | Modelo de representación de vídeo autosupervisado | no disponible | no disponible | no disponible | Meta (checkpoint `vitg-384.pt`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el repositorio tiene pocas descargas (345) y likes (2); no está validado para producción.
- No es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta tool calling; su uso está acotado a vídeo y acciones latentes.
- Idiomas: no aplica ni se documenta soporte multilingüe.
- La variante V-JEPA 2 requiere descargar un checkpoint externo (`vitg-384.pt`) y usar exactamente ese fichero, no su conversión a `transformers`.
- Riesgo de artefactos y deriva en la generación de vídeo largo; el modo causal está limitado a 41 fotogramas.
- No se documentan sesgos concretos ni evaluación de robustez; al entrenarse con MiraData y EgoDexMix, puede heredar sesgos de esos datasets.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación en producción desaconseja su despliegue sin evaluación propia.
- El tamaño del repo (72 GB) y la necesidad de descargar por variante implican una gestión de almacenamiento considerable.

## Enlaces

- Hugging Face: https://huggingface.co/YuxinJ/O2LaF
- Paper: https://arxiv.org/abs/2611.26617
- Página del proyecto: https://showlab.github.io/o2laf/
- Código: https://github.com/showlab/o2laf
- Vídeo: https://youtu.be/AYWevG1Nhpc
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Checkpoint V-JEPA 2 (ViT-g): https://dl.fbaipublicfiles.com/vjepa2/vitg-384.pt
