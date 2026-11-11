# tmhoanggg/so101-drawer-v3-pi05

## Resumen

`tmhoanggg/so101-drawer-v3-pi05` es un conjunto de checkpoints de política robótica obtenidos mediante fine-tuning de `lerobot/pi05_base` (pi0.5) sobre el dataset `tmhoanggg/so101-drawer-v3`, usando la librería LeRobot (commit f5c9bc02). No es un modelo de lenguaje generalista, sino un modelo de control visuomotor para manipulación robótica (apertura de cajones) que combina un codificador visual congelado con un experto de acciones entrenado junto a un backbone Gemma.

El autor explora sistemáticamente variantes de codificador visual: el SigLIP original de pi0.5, VIRGIL, DINOv2-base, combinaciones con ramas auxiliares (option3, DynaFLIP) y una variante con acciones relativas. Cada carpeta corresponde a un checkpoint (cada 5k pasos hasta 30k) y a una configuración de entrenamiento concreta, lo que lo convierte en un artefacto de investigación comparativa más que en un modelo listo para producción.

El interés actual reside en la evaluación de representaciones visuales preentrenadas para políticas de imitación (VLA) en tareas de manipulación con el robot SO-101, un brazo de bajo coste. La información pública sobre el modelo es muy limitada: no hay licencia declarada, ni idiomas, ni pipeline, ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en pi0.5: codificador visual congelado + backbone Gemma + experto de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acciones de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje generalista) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints LeRobot por carpeta; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y aplica una receta idéntica en todas las variantes: codificador visual congelado, entrenamiento del backbone Gemma y del experto de acciones, 30.000 pasos con batch de 64, learning rate de 2,5e-5 con decaimiento a 2,5e-6, warmup de 1.000 pasos, acciones articulares absolutas, chunk de 50 y normalización por cuantiles. Solo se usan las cámaras SIDE y de muñeca; la cámara frontal queda descartada.

Las variantes exploran el reemplazo del codificador SigLIP por VIRGIL o DINOv2-base (con nuevo proyector), ramas auxiliares con el codificador en paralelo (option3 y DynaFLIP Apéndice D.4), un swap en dos etapas con aumento de imagen (virgil_vit_swapv2) y una variante con acciones relativas para la tarea de cajón. Los checkpoints se guardan cada 5.000 pasos en carpetas con el patrón `<policy>_<k>k`.

## Capacidades

- Control visuomotor para manipulación robótica: genera secuencias de acciones articulares (chunk de 50) a partir de observaciones de cámara SIDE y de muñeca.
- Ejecución de la tarea de apertura de cajones sobre el robot SO-101.
- Variantes con distintos codificadores visuales (SigLIP, VIRGIL, DINOv2-base) para comparación de representaciones.
- Variante con acciones relativas (gripper absoluto) para la tarea de cajón.
- Soporte de rollout mediante script propio `code/lerobot_rollout_pi05.py` con variables de entorno para seleccionar codificador o rama auxiliar.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en representaciones visuales para VLA: comparar SigLIP, VIRGIL y DINOv2-base con la misma receta permite aislar el efecto del codificador en el éxito de la política.
- Reproducción de experimentos de imitación con LeRobot: los checkpoints cada 5k pasos permiten estudiar curvas de aprendizaje y saturación.
- Evaluación de ramas auxiliares (option3, DynaFLIP): útil para investigar si una rama con el codificador mejora la política frente al swap directo.
- Estudio de acciones relativas frente a absolutas en tareas de cajón: la variante `official_frozen_relative_*` sirve como ablación controlada.
- Benchmark interno de políticas sobre SO-101: usar `lerobot_rollout_pi05.py` con el mismo `n_action_steps` y fps para comparar todas las variantes en igualdad de condiciones.
- Base para fine-tuning en tareas de manipulación similares (apertura de cajones, pick-and-place) partiendo de pi05_base con la receta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño de pi05_base, no declarado en la información).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: rollout mediante `code/lerobot_rollout_pi05.py` de LeRobot; VIRGIL y DINOv2 requieren `github.com/tmhoanggg/r3m` (rama main) en `PYTHONPATH`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Codificador visual | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-drawer-v3-pi05 | pi05_base | SigLIP / VIRGIL / DINOv2 (variantes) | Apertura de cajón (SO-101) | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | pi0.5 | SigLIP | Política generalista VLA | no disponible en la información | Hugging Face |
| Otras políticas LeRobot para SO-101 | no disponible | no disponible | Manipulación | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado solo para la tarea de cajón sobre SO-101; no generaliza a otras tareas ni robots sin reentrenamiento.
- Solo usa cámaras SIDE y de muñeca; la cámara frontal no se emplea, lo que limita la percepción en configuraciones distintas.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor.
- Sin benchmarks publicados ni métricas de éxito declaradas: imposible evaluar la calidad de la política a priori.
- 0 descargas y 0 likes: artefacto de investigación sin validación comunitaria.
- Dependencia de código externo (`r3m` para VIRGIL y DINOv2) y de un commit concreto de LeRobot (f5c9bc02), lo que puede romper la reproducibilidad.
- Riesgo de sobreajuste al dataset `so101-drawer-v3` y a las condiciones de captura del mismo.
- No apto para despliegue en producción sin evaluación propia en el robot real.

## Enlaces

- Hugging Face: https://huggingface.co/tmhoanggg/so101-drawer-v3-pi05
- Dataset: https://huggingface.co/datasets/tmhoanggg/so101-drawer-v3
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de codigo auxiliar (VIRGIL/DINOv2): https://github.com/tmhoanggg/r3m
- LeRobot: https://github.com/huggingface/lerobot
