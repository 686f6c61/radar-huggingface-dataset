# turhancan97/visbench-vehicle_classification-dinov2_vitb14

## Resumen

`visbench-vehicle_classification-dinov2_vitb14` no es un modelo generativo ni un backbone de vision: es una **cabeza de sondeo (probe head) lineal** entrenada sobre las características congeladas del backbone DINOv2 ViT-B/14. La publica el usuario `turhancan97` dentro del ecosistema VisBench, un framework de evaluación por sondeo que mide qué información semántica contienen las representaciones de un modelo de vision congelado. El módulo resuelve un problema muy concreto: cuantificar de forma reproducible la calidad de las features de `dinov2_vitb14` para la tarea de clasificación de vehículos (196 clases), sin reentrenar el backbone.

Su relevancia es metodológica más que de producto. Permite comparar backbones de vision de forma controlada (mismo protocolo, mismos hiperparámetros, mismo pooling) y obtener métricas de sonda comparables. El repo tiene 0 descargas y 0 likes, tamaño de 0.0 GB (solo pesos de la cabeza lineal) y fue creado el 25 de noviembre de 2026. No es un modelo para desplegar en producción como clasificador autónomo: requiere obligatoriamente el backbone `dinov2_vitb14` y la librería `visbench` para cargarse.

La ficha describe, por tanto, un artefacto de evaluación: sus especificaciones reflejan la cabeza de sondeo y su backbone asociado, no un transformer completo con contexto y generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de sondeo lineal sobre backbone ViT (DINOv2 ViT-B/14) congelado |
| Parametros totales | No disponible (la cabeza lineal es de tamaño reducido; el backbone DINOv2 ViT-B/14 ronda los 86 M, dato no confirmado en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen 224 px segun la clave del backbone) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (vision); no disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos cargables via `visbench.hub.load_probe_from_hub` (formato de fichero no especificado) |

## Arquitectura y entrenamiento

La arquitectura es una **sonda lineal** ajustada sobre features densas de `dinov2_vitb14` con `pooling=cls` (solicitado como `default`) y `feature_mode=dense_only`. El backbone permanece congelado; solo se entrena la cabeza, con `num_classes=196`, `optimizer=adamw`, `lr=0.01`, `weight_decay=0.0001`, `batch_size=256`, `epochs=200` y `standardize=False`. El protocolo declarado es `visbench_vehicle_linear_probe`. La clave del backbone es `dinov2/dinov2_vitb14/224/7764ea0f912e`.

El diseño incorpora una salvaguarda explícita: la carga se rechaza si el backbone o el pooling no coinciden con los usados en el ajuste, porque una cabeza alimentada con otro pooling produce formas correctas y un número plausible pero erróneo. No hay datos sobre volumen de tokens, composición del dataset de entrenamiento ni uso de RLHF/DPO (no aplica a una sonda supervisada). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de vehículos en 196 clases a partir de una imagen, usando features de `dinov2_vitb14`.
- Medición de la calidad de representaciones de un backbone congelado (evaluación por sondeo).
- Comparación controlada entre backbones bajo el mismo protocolo VisBench.
- Verificación de consistencia de pooling y feature mode (rechazo de configuraciones incompatibles).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni audio.
- Capacidades multilingües: no aplica (modelo de vision).
- No dispone de modo thinking, vision generativa ni agentes.

## Casos de uso

- Evaluación de backbones de vision: usar la sonda para medir qué información de vehículos retienen las features de `dinov2_vitb14` frente a otros backbones, con métricas top-1 y top-5 comparables bajo el mismo protocolo.
- Selección de backbone para un pipeline de clasificación: ejecutar el sondeo antes de comprometerse a un fine-tuning completo, reduciendo coste de experimentación.
- Reproducción de resultados de investigación: el protocolo `visbench_vehicle_linear_probe` con hiperparámetros fijos permite replicar el top-1 de 0.7953 y top-5 de 0.9509 de forma determinista.
- Auditoría de features: comprobar si un cambio en el preentrenamiento de un backbone mejora la separabilidad lineal de clases de vehículos sin reentrenar el modelo completo.
- Baseline para clasificación de vehículos: servir como referencia ligera (cabeza lineal sobre features congeladas) antes de invertir en un clasificador entrenado de extremo a extremo.
- Docencia y experimentación con probing: ejemplo mínimo y reproducible de cómo evaluar representaciones congeladas con la librería `visbench`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `top1` | 0.7953 |
| `top5` | 0.9509 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni métricas adicionales (por ejemplo, por clase o matriz de confusión).

## Requisitos de hardware

- VRAM estimada: no disponible para la sonda; el backbone DINOv2 ViT-B/14 es ligero y cabe en GPU de consumo, pero no se aportan cifras en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dado el tamaño del backbone ViT-B, aunque no confirmado en la informacion.
- Opciones de despliegue: carga mediante `visbench` y `visbench.hub.load_probe_from_hub`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `visbench-vehicle_classification-dinov2_vitb14` | Sonda lineal sobre DINOv2 ViT-B/14 | No disponible | No aplica | top1 0.7953 / top5 0.9509 | No disponible | Hugging Face, 0 descargas |
| Otras sondas VisBench | Sondas lineales sobre otros backbones | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion |
| Clasificadores de vehiculos entrenados de extremo a extremo | CNN/ViT supervisados | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Solo funciona con el backbone `dinov2_vitb14` y con `pooling=cls` y `feature_mode=dense_only`; cualquier otra configuración se rechaza o produce resultados erróneos.
- No es un clasificador autónomo: requiere el backbone congelado y la librería `visbench`.
- Licencia no especificada; no se puede asumir uso comercial sin verificar los términos del autor y del backbone subyacente.
- Sin descargas ni likes: no hay evidencia de uso en producción ni validación externa.
- Riesgo de alucinación no aplica (no es generativo), pero sí de sobreinterpretar el top-1 como rendimiento real en dominios distintos al de entrenamiento.
- Sesgos del dataset de entrenamiento no documentados; la composición de datos y la distribución de las 196 clases no se detallan.
- Limitaciones de contexto o idioma: no aplica (vision), pero la generalización a imágenes fuera de dominio es desconocida.
- Advertencia de producción: al ser una sonda de evaluación, no debe usarse como componente de decisión en sistemas reales sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-vehicle_classification-dinov2_vitb14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
- Backbone DINOv2 ViT-B/14: no disponible en la informacion (referencia habitual: repositorio oficial de DINOv2 en GitHub/Hugging Face)
