# TensorForger/RQI-safetensors

## Resumen

RQI (Relative Quality Index) es una métrica de evaluación de calidad de imagen con referencia completa (*full-reference*): recibe un par de imágenes —la imagen evaluada y la referencia— y devuelve una puntuación que indica cuánto se parece la primera a la segunda. No es un modelo generativo ni un modelo de lenguaje, sino un estimador de calidad perceptual entrenado para evaluar resultados de superresolución y restauración. Lo desarrolla el grupo CVC-Color (Universitat Autònoma de Barcelona) y se publica en el artículo "Bridging the Perception Gap in Image Super-Resolution Evaluation" (CVPR 2026).

El repositorio analizado, `TensorForger/RQI-safetensors`, es un **rehost no oficial** de los pesos originales en formato safetensors. El modelo tiene 121.244.770 parámetros en fp32 (485 MB), extrae características con un backbone ViT-B/8, aplica atención por canal y transformadores Swin, y agrega la puntuación con una cabeza ponderada por parches. Trabaja sobre recortes de 224x224 y promedia recortes aleatorios en hasta tres escalas (20, 10 y 5 recortes, halving entre escalas).

Su interés práctico ahora es doble: sirve como métrica de inferencia para comparar pipelines de superresolución, y —a diferencia de la versión original— la clase `RqiMetric` es diferenciable, por lo que puede usarse directamente como función de pérdida para entrenar o afinar modelos de restauración. El rehost elimina dependencias de `timm` y `einops`, reduce el tamaño de 581 MB a 485 MB y es compatible con `torch.compile(fullgraph=True)`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN/ViT híbrida: backbone ViT-B/8 para extracción de características, atención por canal, transformadores Swin y cabeza de puntuación ponderada por parches |
| Parametros totales | 121.244.770 (fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de recortes de 224x224, agregados en hasta 3 escalas (20 + 10 + 5 recortes) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen únicamente en fp32 |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | Apache-2.0 (pesos); el repositorio de código upstream no especifica licencia |
| Formato de pesos | safetensors fp32 (`model.safetensors`); el original se distribuía como `.pt` (pickle) |
| Entrada | dos tensores `[B, 3, H, W]` RGB, float32 en `[0, 1]`, `H, W >= 224`, ambos del mismo tamaño |
| Salida | tensor `[B]` de puntuaciones; mayor valor = la primera imagen es más fiel a la referencia |
| Simetria | asimétrica: el primer argumento es la imagen evaluada, el segundo la referencia |
| Normalizacion | no normalizada: una imagen comparada consigo misma no devuelve 1 |
| Tamano del repo | 0,5 GB |
| Descargas / likes | 4 / 1 |

## Arquitectura y entrenamiento

La red (`RqiNetwork`) procesa pares de recortes de 224x224 píxeles en `[-1, 1]`. Un ViT-B/8 preentrenado extrae características de ambas imágenes; a continuación se aplica atención por canal y una pila de transformadores Swin que modelan la relación entre las representaciones del par, y finalmente una cabeza de puntuación ponderada por parches produce un escalar por recorte. La clase `RqiMetric` envuelve la red, normaliza la entrada a `[0, 1]`, muestrea recortes aleatorios en hasta tres escalas (20, 10 y 5 recortes, con la imagen reducida a la mitad entre escalas) y promedia las puntuaciones; el parámetro `seed` controla la reproducibilidad del muestreo. La implementación del rehost condensa todo el modelo en `rqi_model.py` con dependencia exclusiva de `torch`, y sus salidas coinciden con la implementación original con un error aproximado de 1e-7 para los mismos recortes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO (no procede en una métrica). El dato técnico relevante es que la red se distribuye congelada y en modo evaluación: los gradientes fluyen únicamente hacia el primer argumento, lo que permite usar `RqiMetric` como pérdida diferenciable (por ejemplo `(1 - metric(restored, target)).mean()`) sin actualizar los pesos de la métrica. El modelo admite `torch.compile(fullgraph=True)` tanto en inferencia como en retropropagación, aunque en fp32 no aporta aceleración porque dominan las multiplicaciones matriciales, y cada nuevo tamaño de lote provoca una recompilación.

## Capacidades

- Evaluación de calidad de imagen con referencia completa: compara una imagen restaurada o generada con su referencia y devuelve una puntuación de similitud perceptual.
- Evaluación de superresolución: caso de uso central del artículo, orientado a medir la brecha entre métricas clásicas y percepción humana.
- Análisis multiescala: agrega puntuaciones de recortes a tres escalas de resolución, lo que reduce la dependencia de una única región de la imagen.
- Uso como función de pérdida: `RqiMetric` es diferenciable y permite retropropagar hacia la imagen restaurada.
- Control de memoria configurable: `crops_per_scale`, `gradient_checkpointing` y `max_crops_per_forward` permiten ajustar el consumo de VRAM.
- Compatibilidad con `torch.compile(fullgraph=True)` en inferencia y en backward.
- Determinismo opcional mediante `seed` en el muestreo de recortes.
- Detección de distorsiones locales: el demo incluido evalúa ruido y un rectángulo dibujado sobre la imagen.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje o audio: es una métrica de visión.

## Casos de uso

- **Evaluación de modelos de superresolución**: comparar distintas arquitecturas o checkpoints calculando RQI entre la salida de cada modelo y la imagen de alta resolución de referencia; es el escenario para el que se diseñó la métrica y evita depender solo de PSNR/SSIM.
- **Función de pérdida perceptual en entrenamiento**: usar `(1 - metric(restored, target)).mean()` con `gradient_checkpointing=True` y pocos recortes por escala (por ejemplo `(4, 2, 1)`) para afinar un modelo de restauración en una GPU de consumo.
- **Selección de datasets de entrenamiento**: puntuar pares restaurado/referencia en un corpus de imágenes y descartar muestras con calidad perceptual baja antes de alimentar un pipeline de entrenamiento.
- **Comparación de codecs y pipelines de compresión**: aplicar RQI entre la imagen original y la reconstruida para clasificar configuraciones de compresión por fidelidad perceptual en lugar de por métricas de píxel.
- **Control de calidad en producción de imágenes**: monitorizar un servicio de upscaling o restauración evaluando una muestra de salidas contra la referencia, con `max_crops_per_forward=8` para contener el pico de memoria a 1,4 GB por pasada.
- **Investigación en métricas de calidad**: emplear el modelo como baseline reproducible (con `seed` fijo) en estudios comparativos de métricas FR-IQA.
- **Detección de artefactos locales**: el muestreo por recortes permite detectar degradaciones concentradas en regiones concretas (ruido, oclusiones, rectángulos dibujados) que una métrica global diluiría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta dos datos de fidelidad numérica: las salidas del rehost coinciden con la implementación original con un error aproximado de 1e-7 para los mismos recortes, y en `torch.compile` con fp32 no se observa aceleración respecto a la ejecución sin compilar.

## Requisitos de hardware

- VRAM en inferencia (fp32): pico de 4,0 GB con la configuración por defecto; 1,4 GB con `max_crops_per_forward=8`, sin penalización de velocidad según la model card.
- VRAM en entrenamiento (fp32, imagen de 1024x1024, forward + backward, medido en una RTX 5090): 27,0 GB con los 35 recortes por defecto (7,4 GB con `gradient_checkpointing=True`); 5,9 GB con 7 recortes (1,9 GB con checkpointing); 1,3 GB con un solo recorte (0,7 GB con checkpointing).
- Cabe en GPU de consumo: con 1,4 GB de pico en inferencia, cualquier GPU con 6-8 GB de VRAM es suficiente; para entrenamiento conviene partir de 8-12 GB usando pocos recortes y checkpointing.
- GPU recomendadas: la model card solo documenta mediciones en una RTX 5090; no se especifican modelos de datacenter (A100, H100) ni requisitos mínimos oficiales.
- Despliegue: script de PyTorch con `safetensors.torch.load_file` y `rqi_model.py`, más `torch.compile(fullgraph=True)` opcional. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del número de recortes, del tamaño de imagen y de si se usa `max_crops_per_forward`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Tamano | Dependencias | Licencia |
|---|---|---|---|---|---|---|
| RQI-safetensors (este repo) | 121.244.770 | recortes 224x224, 3 escalas | safetensors fp32 | 485 MB | solo `torch` | Apache-2.0 (pesos) |
| RQI original (`shaolin999/rqi`) | no disponible en la informacion (mismo modelo) | recortes 224x224, 3 escalas | `.pt` (pickle) | 581 MB | `timm`, `einops` y varios ficheros de código | Apache-2.0 (pesos) |
| Otras metricas FR-IQA (LPIPS, DISTS, TOPIQ, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado frente a otras métricas de calidad de imagen en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- **Rehost no oficial**: el repositorio lo publica TensorForger, no el equipo autores del artículo; no debe citarse como release oficial.
- **Incompatibilidad de código**: los pesos safetensors no funcionan con el repositorio original; requieren el fork `github.com/tensorforger/rqi` (la propia model card contiene una errata: "compatiple").
- **Licencia ambigua en el código**: los pesos son Apache-2.0, pero el repositorio upstream de código no especifica licencia, lo que supone un riesgo para uso comercial del código del fork.
- **Puntuación no normalizada**: el score no está acotado a un rango interpretable y una imagen comparada consigo misma no devuelve 1; los umbrales deben calibrarse por caso de uso.
- **Asimetría**: invertir el orden de los argumentos cambia el resultado; hay que respetar la convención (evaluada primero, referencia después).
- **Restricciones de entrada**: ambas imágenes deben tener el mismo tamaño, ser RGB en `[0, 1]` float32 y medir al menos 224 píxeles por lado; si no, se lanza `ValueError`.
- **No determinista por defecto**: con `seed=None` se muestrean recortes nuevos en cada llamada, de modo que la puntuación varía entre ejecuciones; para producción conviene fijar `seed`.
- **Coste de memoria en entrenamiento**: con la configuración por defecto, una sola imagen de 1024x1024 en forward + backward requiere 27,0 GB; es imprescindible reducir recortes o activar checkpointing.
- **Sin cuantizaciones publicadas**: solo hay pesos fp32; no hay versiones fp16, bf16 ni GGUF validadas.
- **Alcance limitado a visión**: no procesa texto, no soporta tool calling ni agentes, y no se han documentado sesgos específicos ni tasas de alucinación (no procede).
- **Idiomas y sesgos demográficos**: no disponible; al ser una métrica perceptual, puede heredar sesgos del dataset con el que se entrenó el modelo original, sin que la información disponible permita cuantificarlos.
- **Resultados de la búsqueda web no relevantes**: las consultas devolvieron páginas sin relación con el modelo (contenido sobre monederos de criptomonedas), por lo que no aportan documentación adicional.

## Enlaces

- HuggingFace (este rehost): https://huggingface.co/TensorForger/RQI-safetensors
- Pesos originales: https://huggingface.co/shaolin999/rqi
- Repositorio original: https://github.com/CVC-Color/rqi
- Fork compatible con safetensors: https://github.com/tensorforger/rqi
- Artículo (arXiv): https://arxiv.org/abs/2503.13074
- Fichero de modelo del repo: https://huggingface.co/TensorForger/RQI-safetensors/blob/main/rqi_model.py
- Pesos: https://huggingface.co/TensorForger/RQI-safetensors/blob/main/model.safetensors
