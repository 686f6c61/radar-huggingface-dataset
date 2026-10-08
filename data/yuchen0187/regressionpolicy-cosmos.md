# yuchen0187/RegressionPolicy-Cosmos

## Resumen

RegressionPolicy-Cosmos es un checkpoint de política robótica (visuomotor policy) publicado por el usuario yuchen0187, construido mediante fine-tuning sobre el modelo fundacional de vídeo nvidia/Cosmos3-Nano. Se trata de un checkpoint HT (presumiblemente orientado a tareas de manipulación, dado el tag ht-regression) entrenado específicamente para el benchmark de simulación LIBERO-10, en el iteración `libero_10/iter_000002000` con `nu=640`. Resuelve el problema de generar acciones robóticas a partir de observaciones visuales y propioceptivas, un área en la que los modelos de vídeo con priors físicos se están adoptando como base para políticas de control (línea de trabajo de Cosmos Policy).

El modelo hereda la aproximación de Cosmos: aprovechar los priors espacio-temporales de un modelo de generación de vídeo para predecir acciones. Es relevante ahora porque forma parte de la ola de adaptación de modelos de vídeo a robótica (visuomotor control and planning) que busca reducir las etapas de post-entrenamiento y componentes arquitectónicos adicionales. La información disponible es escasa: no se especifican parámetros totales, contexto, idiomas ni datos de entrenamiento. El repositorio ocupa 93,9 GB y usa checkpoint nativo PyTorch distribuido en 8 shards. La fecha indicada de creación es 2026-10-08.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de NVIDIA Cosmos3-Nano (modelo fundacional de vídeo para IA física); arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible (variante "Nano" del modelo base; cifra no publicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint nativo en PyTorch, no cuantizado) |
| Idiomas soportados | no disponible (modelo de política robótica; no aplica el concepto de idioma de texto) |
| Licencia | openmdw1.1-license (OpenMDW-1.1, heredada del modelo upstream); el VAE Wan2.2 se distribuye bajo Apache-2.0 |
| Formato de pesos | Checkpoint nativo PyTorch distribuido: 8 shards + `.metadata`; VAE en `assets/wan22_vae/Wan2.2_VAE.pth` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que deriva de nvidia/Cosmos3-Nano, un modelo de la familia Cosmos orientada a IA física, y que el checkpoint corresponde al paradigma de "regresión HT" (tag `ht-regression`) aplicado sobre el benchmark LIBERO-10. El trabajo de referencia (Cosmos Policy, arXiv:2601.16163) describe la adaptación de modelos de vídeo para control y planificación visomotora, prediciendo (1) un chunk de acciones del robot, (2) estado futuro (propiocepción e imágenes) y (3) valor (recompensas esperadas). Sin embargo, ese artículo se basa en Cosmos-Predict2-2B, no en Cosmos3-Nano, por lo que no puede asumirse que los detalles del paper apliquen exactamente a este checkpoint.

No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se empleó RLHF, DPO u otras técnicas de alineamiento. El checkpoint se acompaña de estadísticas de acciones en `libero_10/action_stats.json`, lo que indica que la normalización de acciones se realiza a partir de estadísticas calculadas sobre el conjunto de datos LIBERO-10. Requiere un runtime de Cosmos con soporte HT ("HT-capable Cosmos runtime") para su ejecución.

## Capacidades

- Generación de acciones robóticas (action chunks) a partir de entradas multimodales y vistas de cámara múltiples, según el paradigma descrito en el trabajo de Cosmos Policy.
- Control visuomotor para tareas de manipulación robótica en el entorno de simulación LIBERO-10.
- Predicción de estado futuro (propiocepción e imágenes), según el enfoque general de Cosmos Policy (aplicabilidad a este checkpoint concreto no confirmada explícitamente en la información disponible).
- Estimación de valor (recompensas esperadas) según el marco de Cosmos Policy (aplicabilidad a este checkpoint concreto no confirmada).
- Uso con planificación basada en modelo (best-of-N) según el repositorio oficial de Cosmos Policy (aplicabilidad a este checkpoint concreto no confirmada).
- Generación de texto, razonamiento, código, matemáticas, tool calling, agentes, visión general o audio: no disponible / no aplicable según la información proporcionada.

## Casos de uso

- Evaluación de políticas visomotoras en LIBERO-10: el modelo está entrenado específicamente para este benchmark de manipulación, por lo que su uso principal es la evaluación comparativa frente a otras políticas en tareas de simulación.
- Investigación en adaptación de modelos de vídeo a robótica: sirve como punto de partida para estudiar cómo los priors de un modelo de vídeo (Cosmos) se transfieren al control robótico mediante regresión de acciones.
- Fine-tuning adicional sobre nuevos conjuntos de manipulación: al ser un checkpoint sobre Cosmos3-Nano, puede reutilizarse como base para experimentos de post-entrenamiento en otros entornos, siempre que se disponga del runtime Cosmos HT-compatible.
- Generación de trayectorias de acción con normalización estadística: el fichero `action_stats.json` permite reproducir la normalización de acciones de LIBERO-10, útil para pipelines de evaluación reproducibles.
- Planificación con modelo (best-of-N): si el checkpoint conserva las capacidades de predicción de estado y valor del marco Cosmos Policy, podría emplearse para búsqueda best-of-N sobre candidatos de acción, aunque la aplicabilidad a este checkpoint concreto no está confirmada.
- Integración en pipelines de simulación robótica: mediante la librería `cosmos`, puede incorporarse en entornos de evaluación automatizados que carguen los 8 shards del checkpoint junto con el VAE Wan2.2.
- Reproducción de resultados de investigación: al incluir la iteración exacta (`iter_000002000`, `nu=640`) y estadísticas de acciones, es apto para reproducir experimentos publicados sobre LIBERO-10.

## Benchmarks y rendimiento

No se han proporcionado resultados de benchmarks en la información disponible para este checkpoint concreto. El artículo asociado (Cosmos Policy, arXiv:2601.16163) describe resultados state-of-the-art, pero corresponde al modelo Cosmos-Predict2-2B y no a RegressionPolicy-Cosmos, por lo que no se incluyen cifras que no puedan atribuirse a este modelo.

## Requisitos de hardware

- VRAM estimada para este checkpoint: no disponible. El repositorio ocupa 93,9 GB en 8 shards, lo que sugiere requisitos de memoria considerablemente superiores a los de Cosmos-Policy sobre Cosmos-Predict2-2B, pero no puede derivarse una cifra fiable de VRAM solo a partir del tamaño del repo.
- Referencia orientativa del ecosistema Cosmos Policy (para Cosmos-Predict2-2B, no para este checkpoint): inferencia base en 1 GPU con 6,8 GB de VRAM para LIBERO; 8,9 GB para RoboCasa; 6,0 GB para tareas ALOHA.
- Con planificación basada en modelo (best-of-N) en tareas ALOHA (referencia Cosmos Policy): mínimo 1 GPU con 10,0 GB VRAM (inferencia serial); se recomienda paralelización en el repositorio oficial (cifras no especificadas aquí).
- GPU recomendadas para este checkpoint: no disponible. Requiere un runtime Cosmos HT-compatible; la compatibilidad con GPUs consumer concretas (RTX 4090, etc.) no está confirmada en la información proporcionada.
- Opciones de despliegue: librería `cosmos` con runtime HT-compatible. No se mencionan vLLM, llama.cpp, TGI ni Ollama (no aplicables a un checkpoint de política robótica nativo en PyTorch).
- Latencia y throughput: no disponibles.

## Comparacion con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RegressionPolicy-Cosmos | no disponible | no disponible | OpenMDW-1.1 | HuggingFace (yuchen0187) |
| Cosmos Policy (Cosmos-Predict2-2B) | 2B (según paper) | no disponible | no disponible en la información | Repositorio GitHub NVlabs/cosmos-policy |
| CosmosPolicyRecreation (Cosmos-Predict 2.5) | no disponible | no disponible | no disponible en la información | GitHub (Norm90732) |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en LIBERO-10: no es un modelo de propósito general ni de generación de texto.
- No se documentan capacidades fuera del ámbito de política robótica visomotora; cualquier uso conversacional o de código no está soportado por la información disponible.
- Requiere un runtime Cosmos con soporte HT específico; no se documentan alternativas de despliegue estándar.
- Necesita conservar los 8 shards y el fichero `.metadata` completos; el checkpoint no es un único fichero portable.
- La licencia OpenMDW-1.1 proviene del modelo upstream (NVIDIA Cosmos) y no ha sido impuesta por el autor del checkpoint; deben respetarse sus obligaciones. El VAE Wan2.2 tiene su propia licencia Apache-2.0.
- Sin datos de descargas ni likes (0/0) y creado recientemente (2026-10-08), por lo que no existe validación comunitaria documentada.
- No hay información sobre sesgos, robustez fuera de distribución ni comportamiento en entornos reales (solo se menciona un benchmark de simulación).
- No se han publicado datos de benchmarks específicos para este checkpoint, por lo que su rendimiento real no puede verificarse a partir de la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/yuchen0187/RegressionPolicy-Cosmos
- Paper Cosmos Policy: https://arxiv.org/abs/2601.16163
- Paper (HTML): https://arxiv.org/html/2601.16163v1
- Repositorio oficial NVlabs/cosmos-policy: https://github.com/NVlabs/cosmos-policy
- Repositorio CosmosPolicyRecreation: https://github.com/Norm90732/CosmosPolicyRecreation
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
