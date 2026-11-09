# tmhoanggg/so101-stack-cup-v4-pi05

## Resumen

`tmhoanggg/so101-stack-cup-v4-pi05` es un conjunto de checkpoints de política robótica obtenidos mediante fine-tuning de `lerobot/pi05_base` sobre el dataset `tmhoanggg/so101-stack-cup-v4`. Lo publica el usuario tmhoanggg y está pensado como material experimental para evaluar el efecto de sustituir el codificador visual de pi0.5 (SigLIP congelado) por alternativas congeladas como VIRGIL o DINOv2-base, manteniendo el resto del pipeline de entrenamiento idéntico.

El modelo resuelve una tarea concreta de manipulación (apilar vasos, "stack cup") sobre el brazo SO-101, dentro del ecosistema LeRobot. No es un modelo de lenguaje general: es una policy visión-lenguaje-acción (VLA) que recibe observaciones visuales y estado de articulaciones y emite acciones de control. Su relevancia es metodológica: ofrece una comparación controlada entre encoders visuales bajo la misma receta de entrenamiento (30k pasos, batch 64, lr 2.5e-5 a 2.5e-6, warmup 1k, chunk 50, normalización por cuantiles).

La información publicada no incluye resultados de benchmarks, licencia explícita, idiomas ni pipeline declarado en Hugging Face. El repositorio ocupa 18,7 GB y contiene un directorio por checkpoint (cada 5k pasos) para cada variante de encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de pi0.5 (encoder visual + Gemma + action expert) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acciones de 50 pasos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (modelo orientado a control robótico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de `lerobot/pi05_base`, un modelo visión-lenguaje-acción que combina un codificador visual (SigLIP en la versión oficial), un backbone de lenguaje Gemma y un "action expert" que genera secuencias de acciones. En este repositorio el codificador visual se mantiene congelado y se entrenan Gemma y el action expert. Se publican tres variantes: `official_frozen_*` (SigLIP propio de pi0.5 congelado), `virgil_vit_*` (VIRGIL congelado sustituyendo a SigLIP, con un proyector nuevo) y `dinov2_*` (DINOv2-base congelado, también con proyector nuevo).

La receta de entrenamiento es idéntica para todas las variantes: 30.000 pasos con batch 64, learning rate de 2.5e-5 decayendo a 2.5e-6, warmup de 1.000 pasos, acciones en articulaciones absolutas, chunk de 50 y normalización por cuantiles. Se excluyó el episodio 103 (6 frames) del dataset. El entrenamiento se realizó con LeRobot en el commit f5c9bc02. Se publica un checkpoint cada 5.000 pasos, con carpetas nombradas `<policy>_<k>k`. Las variantes VIRGIL y DINOv2 requieren el repositorio `github.com/tmhoanggg/r3m` (rama main) en `PYTHONPATH` y el código auxiliar incluido en `code/` (`lerobot_rollout_pi05.py`, `encoder_swap.py`, `aux_inject.py`).

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones en articulaciones absolutas para el brazo SO-101 en la tarea de apilar vasos.
- Percepción visual: procesa observaciones de imagen mediante el encoder congelado (SigLIP, VIRGIL o DINOv2 según la variante).
- Ejecución de políticas por chunks: emite bloques de 50 acciones por inferencia.
- Evaluación comparativa de encoders visuales bajo una receta fija.
- Rollout reproducible mediante el script `lerobot_rollout_pi05.py`, con selección de encoder vía variable de entorno `PI05_ENCODER`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre encoders visuales en VLA: comparar `official_frozen`, `virgil_vit` y `dinov2` con el mismo dataset y receta permite aislar el efecto del encoder en el rendimiento de la política.
- Reproducción de experimentos de fine-tuning con LeRobot: los checkpoints cada 5k pasos permiten estudiar curvas de aprendizaje y estabilidad del entrenamiento.
- Desarrollo de políticas para el brazo SO-101: servir como punto de partida para tareas de apilado y manipulación con este hardware de bajo coste.
- Evaluación de transferencia de representaciones: usar VIRGIL o DINOv2 congelados y un proyector nuevo para medir cuánto conocimiento visual genérico se aprovecha en control motor.
- Docencia y prototipado en robótica: el repositorio incluye código de rollout y de intercambio de encoder, lo que facilita montar prácticas reproducibles.
- Benchmarking interno de infraestructura de inferencia: comparar latencia y throughput entre variantes de encoder con el mismo `n_action_steps` y fps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 18,7 GB e incluye múltiples checkpoints (cada 5k pasos y tres variantes de encoder); para inferencia solo es necesario cargar una carpeta de checkpoint.
- VRAM estimada: no disponible. Al derivar de pi0.5 con backbone Gemma y encoder visual congelado, se requiere una GPU con memoria suficiente para cargar el checkpoint completo en safetensors; no se especifica la cifra.
- GPU recomendadas: no disponible. No se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: rollout mediante `code/lerobot_rollout_pi05.py` del propio repositorio, con LeRobot y, para VIRGIL/DINOv2, `github.com/tmhoanggg/r3m` en `PYTHONPATH`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor indica usar el mismo `n_action_steps` y fps en todas las políticas para que la comparación sea válida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Encoder visual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmhoanggg/so101-stack-cup-v4-pi05` | no disponible | no disponible | SigLIP / VIRGIL / DINOv2 (congelados) | no disponible | Hugging Face, safetensors |
| `lerobot/pi05_base` | no disponible | no disponible | SigLIP | no disponible | Hugging Face (modelo base) |
| Otras policies VLA para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (apilar vasos) y un único robot (SO-101); no es un modelo de propósito general.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de las políticas ni de la comparación entre encoders.
- Riesgo de sobreajuste al dataset `so101-stack-cup-v4` y a las condiciones de captura del mismo; la generalización a otras cámaras, iluminación o posiciones no está documentada.
- Exclusión del episodio 103 del entrenamiento: puede introducir un sesgo menor en la distribución de estados cubierta.
- Las variantes VIRGIL y DINOv2 dependen de un repositorio externo (`r3m`, rama main) y de un proyector nuevo; cambios en esa dependencia pueden romper la reproducibilidad.
- No se documentan sesgos sociales ni de idioma porque el modelo no está orientado a texto libre, pero tampoco se aporta información sobre sesgos visuales.
- El tamaño del repositorio (18,7 GB) y la multiplicidad de checkpoints complican el almacenamiento y la selección del checkpoint adecuado en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tmhoanggg/so101-stack-cup-v4-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de fine-tuning: https://huggingface.co/datasets/tmhoanggg/so101-stack-cup-v4
- Repositorio auxiliar para VIRGIL y DINOv2: https://github.com/tmhoanggg/r3m
- LeRobot (framework de entrenamiento y rollout): https://github.com/huggingface/lerobot
