# turhancan97/visbench-fine_grained_classification-dinov2_vitb14

## Resumen

Este repositorio no contiene un modelo de lenguaje ni un backbone de visión, sino una **cabeza de sondeo (probe head) lineal** entrenada por el usuario turhancan97 sobre características congeladas del backbone `dinov2_vitb14` (ViT-B/14 de DINOv2). Forma parte del proyecto VisBench, un banco de evaluación cuyo objetivo es medir qué información contienen realmente las representaciones de un backbone visual congelado, sin reentrenarlo. La cabeza resuelve una tarea de clasificación de grano fino (`fine_grained_classification`) sobre 200 clases.

El módulo es deliberadamente pequeño y específico: se ajusta sobre características extraídas con `pooling=cls` y `feature_mode=dense_only` del backbone indicado, y la librería rechaza cargarlo contra cualquier otro backbone o configuración de pooling, ya que de lo contrario produciría predicciones con la forma correcta pero numéricamente erróneas de forma silenciosa. Su relevancia es metodológica: proporciona una referencia reproducible (top-1 de 0,8683 y top-5 de 0,9757) para comparar la calidad de las representaciones de distintos backbones bajo un protocolo de sondeo lineal estandarizado.

Al tratarse de un artefacto de evaluación y no de un modelo generativo, no dispone de ventana de contexto, capacidades multilingües ni pesos en formatos convencionales como safetensors o GGUF. Su uso está pensado exclusivamente dentro del ecosistema VisBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de sondeo lineal sobre características congeladas de un ViT (DINOv2 ViT-B/14) |
| Parametros totales | no disponible (cabeza lineal sobre 200 clases; el backbone no se incluye en el repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos gestionados por la librería `visbench`; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es una sonda lineal (linear probe) que se aplica sobre las características globales del token `cls` del backbone `dinov2_vitb14` (clave de backbone `dinov2/dinov2_vitb14/224/7764ea0f912e`), con `feature_mode=dense_only` y sin selección de capas concreta (`layers=None`). El backbone permanece completamente congelado durante el ajuste; solo se entrena la cabeza de clasificación de 200 clases.

El entrenamiento siguió el protocolo `visbench_fine_grained_linear_probe` con los siguientes hiperparámetros: `batch_size=256`, `epochs=200`, `lr=0.01`, `optimizer=adamw`, `weight_decay=0.0001`, `standardize=False` y `num_classes=200`. No se documenta el conjunto de datos de entrenamiento, el número de muestras ni si hubo aumento de datos. No se mencionan técnicas de RLHF, DPO ni innovaciones de decodificación, dado que no es un modelo generativo.

## Capacidades

- Clasificación de imágenes de grano fino en 200 clases, operando sobre características de DINOv2 ViT-B/14.
- Extracción de una señal cuantitativa sobre la calidad de las representaciones de un backbone congelado (evaluación de features).
- Integración con la librería `visbench` mediante `load_probe_from_hub`, con verificación estricta de compatibilidad de backbone y pooling.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Evaluación comparativa de backbones: usar la sonda como referencia para medir si un backbone alternativo, bajo el mismo protocolo de sondeo lineal, alcanza o supera el top-1 de 0,8683 en la tarea de grano fino.
- Reproducción de resultados de VisBench: cargar la sonda con `load_probe_from_hub` y el backbone `dinov2_vitb14` para verificar las métricas reportadas en un entorno propio.
- Auditoría de representaciones: analizar qué información semántica de grano fino conserva el token `cls` de DINOv2 sin ajuste fino del backbone.
- Baseline en pipelines de investigación: servir como punto de partida fijo frente al que comparar técnicas de adaptación (LoRA, fine-tuning completo, otras cabezas).
- Validación de integraciones: comprobar que una instalación de `visbench` y la extracción de características con `pooling=cls` y `dense_only` funcionan correctamente antes de lanzar experimentos mayores.
- Docencia y experimentación metodológica: ilustrar el protocolo de sondeo lineal y la importancia de fijar pooling y modo de características para evitar comparaciones inválidas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| top1 | 0.8683 |
| top5 | 0.9757 |

No se han publicado resultados comparativos con otros backbones o sondas en la información disponible.

## Requisitos de hardware

- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que solo contiene los pesos de la cabeza lineal; el coste real de inferencia lo determina el backbone `dinov2_vitb14`.
- VRAM estimada para la sonda: despreciable; para el backbone ViT-B/14 en FP16, del orden de 1-2 GB para los pesos, más memoria para activaciones según el tamano de lote y la resolución (224 px).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para el backbone; A100 o H100 solo necesarias para lotes grandes o extracción masiva de características.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería `visbench` (carga vía `load_probe_from_hub`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| visbench-fine_grained_classification-dinov2_vitb14 | Sonda lineal sobre DINOv2 ViT-B/14 | no disponible | no aplica | top-1 0,8683 / top-5 0,9757 | no disponible | Hugging Face (repo `turhancan97`) |
| Otras sondas VisBench del mismo autor | Sondas lineales sobre otros backbones | no disponible | no aplica | no disponible | no disponible | potencialmente en Hugging Face |
| DINOv2 ViT-B/14 (backbone base) | ViT auto-supervisado | ~86 M | no aplica | no disponible en esta ficha | licencia DINOv2 (no confirmada aquí) | Meta / Hugging Face |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona acoplado al backbone `dinov2_vitb14` con `pooling=cls` y `feature_mode=dense_only`; la librería rechaza otras combinaciones.
- Los resultados (top-1 0,8683) solo son válidos bajo el protocolo exacto de VisBench; cambiar pooling, capa o normalización invalida la comparación.
- No se documenta el conjunto de datos de evaluación ni su composición, por lo que no se puede evaluar el sesgo de las 200 clases.
- Riesgo de alucinación no aplica (no genera texto), pero sí de métricas engañosas si se usa fuera de su protocolo.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Sin descargas ni likes en el momento de la consulta; proyecto en fase temprana y con poca validación externa.
- El repo no incluye el backbone, por lo que el usuario debe obtenerlo por separado.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-fine_grained_classification-dinov2_vitb14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
