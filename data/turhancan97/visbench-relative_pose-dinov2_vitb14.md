# turhancan97/visbench-relative_pose-dinov2_vitb14

## Resumen

`visbench-relative_pose-dinov2_vitb14` es una cabeza de sondeo (probe) entrenada, no un modelo generativo ni un backbone de visión. La publica el usuario turhancan97 dentro del ecosistema VisBench, un framework de evaluación por sondeo que mide qué información geométrica y semántica contienen las representaciones de un backbone congelado. En concreto, esta cabeza se ajusta sobre características extraídas de `dinov2_vitb14` para predecir la pose relativa entre pares de imágenes.

El modelo resuelve un problema de evaluación: en lugar de fine-tuning completo, entrena un módulo ligero (MLP de tres capas ocultas) sobre las features congeladas del backbone y reporta métricas de error de rotación y traslación. Es relevante porque permite comparar de forma controlada la calidad de las representaciones de distintos backbones sin reentrenar el modelo base, y porque publica los números concretos del sondeo, lo que facilita la reproducibilidad.

El repositorio es de tamaño 0.0 GB, sin descargas ni likes en el momento de la consulta, y no incluye pipeline, licencia ni idiomas declarados. La información disponible se limita a la model card y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MLP (capas ocultas [512, 256, 128]) sobre features congeladas de un ViT (DINOv2 ViT-B/14); no es un transformer generativo |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; solo se publican los pesos de la cabeza, no el backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imágenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (cargado mediante `visbench.hub.load_probe_from_hub`) |

## Arquitectura y entrenamiento

La cabeza es un perceptrón multicapa con dimensiones ocultas `[512, 256, 128]` que se ajusta sobre características de `dinov2_vitb14` obtenidas con `pooling=cls` y `feature_mode=dense_only`. El backbone permanece congelado; solo se entrena la cabeza. La clave del backbone es `dinov2/dinov2_vitb14/224/7764ea0f912e`, y la librería rechaza cargar los pesos contra cualquier otro backbone o configuración de pooling, ya que el fallo sería silencioso (mismas formas, resultado numéricamente plausible pero incorrecto).

El entrenamiento se realizó con el protocolo `probe3d_pose`, 50 519 pares de entrenamiento, 30 épocas, batch size 128, optimizador AdamW con learning rate 0.001 y weight decay 0.0001, y scheduler coseno. La tarea es `relative_pose` (nivel medio), es decir, estimar la rotación y traslación relativas entre dos vistas. No se documentan datos de RLHF, DPO ni composición del dataset más allá del número de pares.

## Capacidades

- Estimación de pose relativa entre pares de imágenes: predicción de rotación y traslación relativas a partir de features de DINOv2 ViT-B/14.
- Evaluación de representaciones: mide qué información geométrica portan las features congeladas del backbone.
- Sondeo controlado: solo funciona con el backbone y la configuración exactos (`pooling=cls`, `feature_mode=dense_only`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No incluye modo thinking, visión generativa ni audio.

## Casos de uso

- Evaluación comparativa de backbones: usar la cabeza como sonda para cuantificar cuánta información de pose relativa contiene DINOv2 ViT-B/14 frente a otros backbones, manteniendo el protocolo fijo.
- Reproducción de resultados de VisBench: cargar el probe con `load_probe_from_hub` y verificar las métricas reportadas (`rotation_acc@15deg` = 0.3879, `translation_error` = 0.1101) sobre el mismo conjunto de pares.
- Análisis de representaciones en investigación: estudiar qué capas o configuraciones de pooling conservan mejor la geometría 3D, usando esta cabeza como referencia de línea base.
- Detección de regresiones en pipelines de features: si se cambia la extracción de features del backbone, el probe sirve para detectar degradaciones en la información de pose.
- Docencia y experimentación con probing: ejemplo mínimo de cómo se ajusta y evalúa una cabeza lineal/MLP sobre features congeladas.
- Validación de protocolos de sondeo: comprobar que la configuración de pooling y feature mode coincide con la esperada antes de lanzar experimentos a mayor escala.

## Benchmarks y rendimiento

Resultados reportados en la model card para la tarea `relative_pose`:

| Metrica | Valor |
|---|---|
| `floor_rotation_acc@15deg` | 0.0374 |
| `floor_rotation_acc@30deg` | 0.1563 |
| `floor_rotation_error_deg` | 66.8464 |
| `floor_rotation_median_deg` | 65.6347 |
| `floor_translation_error` | 0.2411 |
| `rotation_acc@15deg` | 0.3879 |
| `rotation_acc@30deg` | 0.7115 |
| `rotation_error_deg` | 29.0808 |
| `rotation_median_deg` | 18.0390 |
| `translation_error` | 0.1101 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del backbone DINOv2 ViT-B/14 (aproximadamente 86 M de parámetros) más la cabeza MLP, pero no se publican cifras.
- GPU recomendadas: no disponible; cualquier GPU capaz de ejecutar DINOv2 ViT-B/14 debería ser suficiente.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del backbone ViT-B/14, aunque no se confirma en la documentación.
- Opciones de despliegue: carga mediante la librería `visbench` (`visbench.hub.load_probe_from_hub`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una cabeza de sondeo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada cabezas de sondeo comparables publicadas con métricas equivalentes.

## Limitaciones y advertencias

- Solo funciona con el backbone `dinov2_vitb14` y la configuración exacta (`pooling=cls`, `feature_mode=dense_only`); cargarlo de otra forma produce resultados incorrectos de forma silenciosa.
- No es un modelo generativo: no produce texto, código ni respuestas; es una cabeza de evaluación.
- Las métricas `floor_*` muestran un rendimiento bajo (por ejemplo, `floor_rotation_acc@15deg` = 0.0374), lo que sugiere que la tarea de suelo es especialmente difícil para estas features.
- Licencia no declarada: no se puede confirmar el uso comercial.
- Sin descargas ni validación comunitaria en el momento de la consulta; el repositorio está recién creado.
- Riesgo de alucinación no aplica (no genera lenguaje), pero sí de interpretar mal las métricas si se compara con configuraciones de backbone distintas.
- No se documentan sesgos, idiomas ni restricciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-relative_pose-dinov2_vitb14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
