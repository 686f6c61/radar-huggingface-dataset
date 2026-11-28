# tmhoanggg/so101-bimanual-blocks-storing-pi05

## Resumen

`tmhoanggg/so101-bimanual-blocks-storing-pi05` es un conjunto de políticas de robótica (vision-language-action, VLA) obtenidas mediante fine-tuning de `lerobot/pi05_base` sobre el dataset `tmhoanggg/so101-bimanual-blocks-storing`. El escenario es una tarea bimanual de manipulación ("blocks storing") ejecutada con dos brazos SO-101 y acciones de 12 dimensiones. No es un modelo de lenguaje general: es un checkpoint de control motor condicionado por imagen y consigna, empaquetado en formato `safetensors` dentro de un repositorio de 10,9 GB.

El interés técnico del repositorio no está en el modelo base —pi0.5, la arquitectura de Gemma más un "action expert" de LeRobot— sino en la receta experimental que lo acompaña. El autor congela SigLIP y entrena en paralelo una rama lateral con un codificador visual congelado distinto en cada variante (VIRGIL, DINOv2-base, CLIP ViT-B/16 y SigLIP-2), de modo que el repositorio contiene cuatro políticas comparables bajo idéntico protocolo de entrenamiento (30k pasos, batch 64, lr 2,5e-5 → 2,5e-6, warmup 1k, chunk 50, normalización por cuantiles).

Es relevante ahora porque permite reproducir un ablation controlado sobre representaciones visuales auxiliares en políticas VLA bimanuales, un área donde la mayoría de publicaciones no liberan los checkpoints intermedios ni el código de rollout. La información pública es muy escasa: no hay licencia declarada, ni idiomas, ni pipeline, ni resultados de benchmarks en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA pi0.5: backbone Gemma + action expert, con SigLIP congelado y rama lateral de codificador visual congelado (VIRGIL, DINOv2-base, CLIP ViT-B/16 o SigLIP-2 según variante) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acción de 50 pasos) |
| Tipos de cuantización | no disponible (pesos publicados en `safetensors`, presumiblemente fp32/bf16; no confirmado) |
| Idiomas soportados | no disponible (modelo de robótica; las consignas de tarea no se documentan) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y sigue la receta de LeRobot (commit `f5c9bc02`). La arquitectura combina un backbone Gemma con un módulo "action expert" que produce secuencias de acciones; la entrada visual principal pasa por un SigLIP congelado. Sobre esa base, el autor añade una rama lateral con un codificador visual también congelado, y entrena conjuntamente pi0.5 y la rama auxiliar. Se usan tres cámaras (lateral, muñeca izquierda y muñeca derecha, esta última etiquetada `front2`), acciones en articulaciones absolutas, chunk de 50 y normalización por cuantiles.

El entrenamiento se realizó durante 30k pasos con batch 64, learning rate de 2,5e-5 con decaimiento a 2,5e-6 y warmup de 1k pasos, idéntico para las cuatro variantes. El repositorio incluye un directorio `code/` con `lerobot_rollout_pi05.py`, `encoder_swap.py` y `aux_inject.py`; la variante VIRGIL requiere `github.com/tmhoanggg/r3m` (rama main) en `PYTHONPATH`. La selección de variante en el rollout se hace mediante la variable de entorno `PI05_AUX` (`virgil_pred`, `dinov2`, `clip`, `siglip2`).

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para dos brazos SO-101 a partir de observaciones visuales de tres cámaras.
- Ejecución de la tarea "blocks storing" (almacenamiento de bloques) en el entorno del dataset de fine-tuning.
- Política condicionada por consigna de lenguaje, heredada del formato pi0.5/LeRobot (no se detalla el conjunto de instrucciones).
- Cuatro variantes de representación visual auxiliar intercambiables para experimentación.
- Rollout reproducible mediante el script incluido y LeRobot.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni multilingüismo; no aplica a un modelo de este tipo.

## Casos de uso

- Reproducción de un ablation controlado: comparar VIRGIL, DINOv2, CLIP y SigLIP-2 como codificadores auxiliares con idéntico presupuesto de entrenamiento (30k pasos, batch 64) y aislar el efecto de la representación visual en el éxito de la tarea.
- Investigación en manipulación bimanual: usar el checkpoint como línea base para estudiar coordinación entre dos brazos SO-101 con acciones de 12 dimensiones y tres vistas.
- Evaluación de políticas VLA en laboratorio: desplegar `lerobot_rollout_pi05.py` con `n_action_steps` y fps fijos para obtener comparaciones justas entre variantes.
- Estudio de transferencia desde pi0.5: medir cuánto del conocimiento del modelo base se conserva tras fine-tuning con codificadores congelados y cuánto aporta la rama lateral.
- Docencia y prototipado en robótica de bajo coste: SO-101 es una plataforma asequible; el repositorio permite montar un pipeline completo de entrenamiento y rollout con LeRobot.
- Referencia para ingeniería de datos de robótica: el par dataset/checkpoint sirve para validar herramientas de conversión, normalización por cuantiles y empaquetado de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 10,9 GB, lo que sugiere pesos sin cuantizar de un modelo de escala media; el espacio en disco necesario para descargar y ejecutar es de al menos ese orden.
- VRAM estimada: no disponible con precisión; para un modelo de este tamaño en `safetensors` de 10,9 GB, una GPU con 24 GB (RTX 4090, A10G) es el mínimo razonable para inferencia sin cuantización; A100/H100 para entrenamiento o lotes mayores.
- GPU consumer: probablemente viable en RTX 4090 para inferencia; no confirmado por el autor.
- Despliegue: LeRobot con el script `code/lerobot_rollout_pi05.py`; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplicables a un VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmhoanggg/so101-bimanual-blocks-storing-pi05` | no disponible | no disponible | VLA bimanual SO-101 | no disponible | Hugging Face (repo público) |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5 | no disponible en esta ficha | Hugging Face |
| Políticas ACT/Diffusion de LeRobot | no disponible | no disponible | Manipulación (single-arm) | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para una única tarea ("blocks storing") y un único montaje físico (dos SO-101, tres cámaras); no generaliza a otras tareas sin reentrenamiento.
- Licencia no declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de rendimiento en la model card.
- Dependencia de código externo: la variante VIRGIL requiere `github.com/tmhoanggg/r3m` en `PYTHONPATH` y un commit concreto de LeRobot (`f5c9bc02`), lo que puede romper la reproducibilidad.
- Riesgo de sobreajuste al entorno de entrenamiento: sin validación cruzada documentada, el éxito fuera del laboratorio original es incierto.
- Sin información sobre sesgos, alucinación o comportamiento ante entradas fuera de distribución; en robótica, los fallos se traducen en colisiones o acciones erráticas, no en texto incorrecto.
- Idiomas y consignas no documentados: se desconoce si acepta instrucciones en castellano u otras lenguas.

## Enlaces

- Hugging Face: https://huggingface.co/tmhoanggg/so101-bimanual-blocks-storing-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de fine-tuning: https://huggingface.co/datasets/tmhoanggg/so101-bimanual-blocks-storing
- Repositorio VIRGIL: https://github.com/tmhoanggg/r3m
- LeRobot: https://github.com/huggingface/lerobot
