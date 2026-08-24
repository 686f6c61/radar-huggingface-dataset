# Surojit-Utah/protosemseg-checkpoints

## Resumen

ProtoSemSeg es un método de segmentación semántica few-shot basado en prototipos, adaptado específicamente para la clasificación de facies sísmicas en datos de prospección geofísica. Fue desarrollado originalmente por Zhao et al. (2023) y posteriormente adaptado por Saha y Whitaker en el contexto del artículo *AdaSemSeg: An Adaptive Few-shot Semantic Segmentation of Seismic Facies* (IEEE TGRS, 2025), donde se utiliza como baseline competitivo. Este repositorio contiene los checkpoints entrenados de ProtoSemSeg bajo el protocolo de dejar un dataset fuera (leave-one-dataset-out), evaluados en tres datasets sísmicos: F3, Parihaka y Penobscot, tanto en configuraciones de 1 como de 5 muestras de soporte.

La relevancia de este modelo radica en que aborda una limitación clave de los métodos estándar de segmentación semántica few-shot (FSSS): la necesidad de un número fijo de clases objetivo. ProtoSemSeg, mediante el aprendizaje de prototipos, permite manejar un número variable de clases, lo que lo convierte en un baseline natural para comparar con métodos adaptativos como AdaSemSeg. Los checkpoints se proporcionan para permitir una reproducción directa y comparaciones justas sin necesidad de reentrenar el modelo desde cero. La arquitectura subyacente es una red basada en U-Net con encoder ResNet y conexiones de salto, tal como se describe en el paper de AdaSemSeg, aunque los detalles de parámetros y contexto no se especifican en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-UNet (U-Net con encoder ResNet y conexiones de salto, adaptación de ProtoSemSeg) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints .pth.tar) |

## Arquitectura y entrenamiento

ProtoSemSeg es un método de segmentación semántica few-shot basado en prototipos. La arquitectura empleada en estos checkpoints es una variante de U-Net con un encoder ResNet (con conexiones de salto en múltiples niveles de codificación), tal como se describe en la sección de métodos del paper AdaSemSeg. Esta arquitectura se utiliza como baseline para la comparación con AdaSemSeg, que introduce regresión con procesos gaussianos y una descomposición binaria de tareas independiente de la clase con un backbone compartido.

El entrenamiento sigue un protocolo de dejar un dataset fuera (leave-one-dataset-out). Es decir, para cada dataset objetivo (F3, Parihaka, Penobscot), el modelo se entrena en los otros dos datasets y se evalúa en el objetivo sin fine-tuning. Se proporcionan checkpoints para configuraciones de 1 y 5 shots. No se detallan el número de tokens ni la composición del dataset de entrenamiento, pero se sabe que se utilizan datos sísmicos de los tres datasets mencionados. No se menciona el uso de RLHF o DPO, ya que es un modelo de visión supervisado.

## Capacidades

- Segmentación semántica few-shot de facies sísmicas en imágenes sísmicas (datos geofísicos).
- Maneja un número variable de clases objetivo, a diferencia de los métodos FSSS estándar que requieren un número fijo de clases.
- Evaluación en datasets sísmicos reales: F3, Parihaka y Penobscot, con métricas como FwF1, PA, MCA y FwIoU.
- No es un modelo de lenguaje: no genera texto, no tiene capacidad de tool calling ni agentes.
- No soporta visión general (solo imágenes sísmicas), ni audio, ni pensamiento razonado.

## Casos de uso

- **Segmentación de facies sísmicas en exploración de hidrocarburos**: el modelo puede identificar unidades litológicas en volúmenes sísmicos, ayudando a geólogos a mapear reservorios y sellos. Su capacidad few-shot permite adaptarse a nuevos datasets con pocas etiquetas.
- **Evaluación de métodos de segmentación adaptativa**: dado que se proporciona como baseline, se utiliza para comparar el rendimiento de AdaSemSeg u otros métodos adaptativos frente a un enfoque de prototipos clásico.
- **Investigación en few-shot learning para geociencias**: los checkpoints permiten reproducir experimentos y servir de punto de partida para estudios de generalización entre datasets sísmicos.
- **Análisis de transferencia entre datasets**: al estar entrenados en dos datasets y evaluados en un tercero, los checkpoints permiten estudiar la transferibilidad de representaciones sísmicas.
- **Desarrollo de métodos de segmentación con pocas etiquetas**: se puede usar como referencia para desarrollar nuevas técnicas que mejoren el rendimiento en escenarios de 1-shot y 5-shot.
- **Reproducción de resultados publicados**: los checkpoints permiten verificar los resultados de la tabla III del paper AdaSemSeg sin reentrenar, facilitando la auditoría de la investigación.

## Benchmarks y rendimiento

La model card reporta los resultados de FwF1 (F1 weighted por facies) para cada dataset y configuración de shots, comparando con AdaSemSeg y con un método de transferencia de aprendizaje (transfer learning). Los valores provienen del paper (Tabla III).

| Dataset objetivo | Shots | AdaSemSeg | ProtoSemSeg (este repo) | Transfer learning |
|---|---|---|---|---|
| F3 | 1 | 0.85 | 0.55 | 0.84 |
| F3 | 5 | 0.89 | 0.68 | 0.84 |
| Parihaka | 1 | 0.84 | 0.52 | 0.54 |
| Parihaka | 5 | 0.86 | 0.58 | 0.62 |
| Penobscot | 1 | 0.93 | 0.58 | 0.67 |
| Penobscot | 5 | 0.96 | 0.71 | 0.89 |

Los valores completos de PA, MCA, FwIoU y FwF1 están disponibles en el README del repositorio principal y en el script de reproducción. No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) por ser un modelo de visión específico.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de segmentación con encoder ResNet (posiblemente ResNet-50 o ResNet-101), se estima que para inferencia con imágenes sísmicas de tamaño moderado (por ejemplo, 256x256 o 512x512) se requiere al menos 4-8 GB de VRAM en FP32. Con cuantización (no disponible) podría reducirse.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, RTX 3080, A100, H100). Para entrenamiento desde cero se requeriría una GPU con más memoria (16 GB o más).
- Cabe en GPU consumer (RTX 3060, RTX 4090) para inferencia, siempre que el tamaño de imagen no sea excesivo.
- Opciones de despliegue: el modelo está en formato PyTorch (checkpoint .pth.tar). Se puede cargar con PyTorch y ejecutar en cualquier entorno con Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento (FwF1, F3 1-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ProtoSemSeg (este repo) | ResNet-UNet basado en prototipos | no disponible | no aplica | 0.55 | MIT | Checkpoints en HF |
| AdaSemSeg | Gaussian Process + shared backbone | no disponible | no aplica | 0.85 | MIT (presumible) | Checkpoints en HF (Surojit-Utah/adasemseg-checkpoints) |
| Transfer learning (baseline) | ResNet-UNet (similar) | no disponible | no aplica | 0.84 | no disponible | no disponible |

No se dispone de otros modelos comparables de la misma categoría (segmentación sísmica few-shot) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de segmentación sísmica específico; no es adecuado para tareas de procesamiento de lenguaje natural o visión general.
- El rendimiento es significativamente inferior al de AdaSemSeg (por ejemplo, 0.55 vs 0.85 en F3 1-shot), por lo que no debe utilizarse como método principal si se busca alta precisión.
- Al ser un baseline, no incorpora las innovaciones de AdaSemSeg (regresión con procesos gaussianos, descomposición binaria de tareas).
- No se proporcionan detalles sobre los datos de entrenamiento (volumen, composición exacta), lo que limita la reproducibilidad completa.
- Los checkpoints están entrenados en datasets sísmicos específicos; su generalización a otros dominios geológicos no está garantizada.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos del paper original (Zhao et al., 2023) para posibles restricciones adicionales.
- No hay información sobre sesgos o riesgos de alucinación (no aplicable a un modelo de visión).

## Enlaces

- HuggingFace: https://huggingface.co/Surojit-Utah/protosemseg-checkpoints
- Paper AdaSemSeg (arXiv): https://arxiv.org/abs/2501.16760
- Código principal (GitHub): https://github.com/Surojit-Utah/AdaSemSeg
- Checkpoints en Zenodo: https://zenodo.org/records/21762769
- Repositorio de checkpoints de AdaSemSeg (método propuesto): https://huggingface.co/Surojit-Utah/adasemseg-checkpoints
- Página personal del autor: https://surojit-utah.github.io/
