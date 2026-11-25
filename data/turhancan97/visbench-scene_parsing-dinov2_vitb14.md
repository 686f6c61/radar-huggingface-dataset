# turhancan97/visbench-scene_parsing-dinov2_vitb14

## Resumen

`visbench-scene_parsing-dinov2_vitb14` no es un modelo generativo ni un backbone de visión, sino una **cabeza de sondeo (probe head) lineal** entrenada por el usuario turhancan97 dentro del marco VisBench. Su función es medir qué información contiene realmente el espacio de características del backbone congelado `dinov2_vitb14` (DINOv2 ViT-B/14) para la tarea de *scene parsing* (segmentación semántica de escenas de alto nivel). Se trata, por tanto, de una herramienta de evaluación y análisis de representaciones, no de un modelo desplegable en producción.

El módulo se ajusta sobre características extraídas con `pooling=mean` y `feature_mode=dense_only`, y solo es válido con ese backbone y esa configuración exacta: la librería rechaza cargarlo contra cualquier otra combinación, ya que una cabeza entrenada con un pooling y alimentada con otro produce formas correctas pero números silenciosamente erróneos.

Su relevancia es metodológica: permite reproducir y comparar de forma estandarizada la calidad de las representaciones de DINOv2 en tareas densas, con métricas publicadas (mIoU de 0,4959 y precisión de píxel de 0,7344) y una receta de entrenamiento completamente especificada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza lineal (probe) sobre backbone congelado DINOv2 ViT-B/14 |
| Parámetros totales | no disponible (cabeza lineal con `hidden_dim=512` y `num_classes=40`; el backbone no se incluye en el repo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 px según la clave del backbone) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; pesos gestionados vía `visbench.hub`) |

## Arquitectura y entrenamiento

La arquitectura es una **cabeza lineal** (`head: linear`) que proyecta características densas de DINOv2 ViT-B/14 a 40 clases semánticas (`num_classes: 40`). El backbone permanece congelado; solo se entrena la cabeza, con `hidden_dim: 512`, función de pérdida `cross_entropy` e `ignore_index: -1`. Las características se extraen con `pooling=mean`, `feature_mode=dense_only` y `layers: None` (sin selección de capas intermedias), sobre entradas de 224 px identificadas por la clave de backbone `dinov2/dinov2_vitb14/224/7764ea0f912e`.

El entrenamiento se realizó durante 10 épocas con `batch_size: 8`, optimizador AdamW, `lr: 0.0005`, `weight_decay: 0.0001` y `warmup_epochs: 1.5`, bajo el protocolo `visbench_scene_parsing` con `miou_reduction: dataset_and_per_image`. No se especifica el volumen ni la composición del dataset de entrenamiento, ni si hubo aumentos de datos o ajuste fino posterior.

## Capacidades

- Segmentación semántica densa de escenas en 40 clases, a partir de características congeladas de DINOv2 ViT-B/14.
- Evaluación estandarizada de representaciones: produce métricas de mIoU y precisión de píxel comparables entre backbones.
- Cálculo de mIoU agregado por dataset y por imagen (`miou_reduction: dataset_and_per_image`).
- Integración con la librería VisBench mediante `load_probe_from_hub`, con validación estricta de backbone, pooling y modo de características.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión multimodal ni modos de pensamiento: es exclusivamente un módulo de visión por computador.

## Casos de uso

- Auditoría de representaciones de DINOv2: cargar el probe con `load_probe_from_hub` y medir si el backbone congelado conserva información semántica suficiente para scene parsing antes de invertir en fine-tuning completo.
- Comparación de backbones en investigación: usar las métricas publicadas (mIoU 0,4959, pixel_acc 0,7344) como línea base reproducible frente a otros extractores de características evaluados con el mismo protocolo VisBench.
- Selección de configuración de extracción: el probe sirve para cuantificar el impacto de decisiones como `pooling=mean` frente a alternativas, ya que VisBench rechaza configuraciones no coincidentes y evita comparaciones inválidas.
- Reproducción de experimentos: la receta completa (10 épocas, AdamW, lr 0,0005, batch 8) permite replicar el resultado y verificar la estabilidad del sondeo.
- Docencia y formación en evaluación de modelos: ejemplo mínimo y verificable de cómo se mide la calidad de un espacio latente sin entrenar el backbone.
- Prototipado de pipelines de segmentación: como referencia de techo alcanzable con una cabeza lineal antes de pasar a decodificadores más complejos (FPN, UPerNet) sobre las mismas características.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| `mean_acc` | 0,6199 |
| `miou` | 0,4959 |
| `miou_per_image` | 0,3362 |
| `pixel_acc` | 0,7344 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; la cabeza lineal es de tamaño reducido, pero requiere cargar el backbone DINOv2 ViT-B/14 (aproximadamente 86 M de parámetros) para extraer características.
- GPU recomendadas: no disponible. El backbone ViT-B/14 es ligero y cabe en GPUs de consumo, pero no se aportan mediciones.
- Cabe en GPU de consumo: no confirmado con datos; por el tamaño del backbone es plausible, pero no se especifica.
- Opciones de despliegue: la única vía documentada es la librería VisBench (`visbench.get_backbone` + `load_probe_from_hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros probes de VisBench ni métricas de cabezas alternativas sobre DINOv2 ViT-B/14 con las que establecer una comparación fiable.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el backbone `dinov2_vitb14` y la configuración exacta (`pooling=mean`, `feature_mode=dense_only`); cualquier otra combinación es rechazada por la librería.
- Riesgo de resultados silenciosamente incorrectos si se fuerza una configuración distinta: formas válidas, métricas erróneas.
- Licencia no declarada: no puede asumirse uso comercial sin verificar los términos del autor y del backbone subyacente (DINOv2 tiene su propia licencia).
- Sin información sobre el dataset de entrenamiento: se desconoce el dominio, el sesgo y la generalización a escenas fuera de la distribución evaluada.
- Solo 40 clases semánticas: no cubre taxonomías más amplias ni tareas como detección, profundidad o segmentación de instancias.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad más allá de la receta declarada.
- Sin soporte de idiomas, texto ni interacción: no debe emplearse en casos de uso conversacionales o multimodales.
- Métricas moderadas: un mIoU de 0,4959 y un mIoU por imagen de 0,3362 indican que las características congeladas no resuelven la tarea de forma completa con una cabeza lineal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turhancan97/visbench-scene_parsing-dinov2_vitb14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
