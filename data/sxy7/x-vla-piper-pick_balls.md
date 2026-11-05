# SXY7/X-VLA-Piper-pick_balls

## Resumen

X-VLA Piper: pick_balls es un modelo de visión-lenguaje-acción (VLA) especializado en robótica, publicado por el usuario SXY7 en HuggingFace. Se trata de un ajuste fino completo (full-parameter fine-tuning) del modelo base 2toINF/X-VLA-Pt, orientado a una tarea concreta de manipulación robótica: recoger bolas ("pick_balls") con un brazo robótico Piper. El repositorio contiene 13 checkpoints completos de entrenamiento, desde el paso 40.000 hasta el 160.000, cada uno con pesos en safetensors, configuración del modelo, procesador y tokenizador, metadatos de normalización de la tarea (piper_manifest.json) y estado del entrenamiento (training_state.pt).

El modelo resuelve el problema de mapear observaciones visuales y propioceptivas a acciones motoras de un robot manipulador. Concretamente, consume dos vistas RGB (cámara superior y muñeca derecha) a resolución 224x224, más siete valores medidos de articulaciones y pinza como propiocepción, y predice treinta acciones absolutas de siete dimensiones (articulaciones y pinza). La tercera vista del modelo está enmascarada.

Es relevante porque ejemplifica el patrón de adaptación de modelos VLA generalistas a tareas robóticas específicas mediante fine-tuning completo, con artefactos de verificación (hashes SHA256 por checkpoint) y metadatos de normalización que permiten reproducir el despliegue. No obstante, el repositorio carece de model card descriptiva, licencia declarada y datos de benchmarks, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA); detalles internos no disponibles |
| Parametros totales | no disponible (tamaño de checkpoint ~10,56 GB en safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), mas training_state.pt y piper_manifest.json |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de 2toINF/X-VLA-Pt, un modelo de visión-lenguaje-acción. La arquitectura interna concreta (tipo de transformer, mecanismo de atención, encoder visual) no se detalla en la información disponible; la model card solo especifica el contrato de entrada y salida y los requisitos de integración. El entrenamiento consistió en fine-tuning completo de todos los parámetros, con 13 checkpoints guardados entre los pasos 40.000 y 160.000, cada uno de aproximadamente 10,56 GB. Se conserva el estado del optimizador AdamW, el paso, el estado del generador aleatorio (RNG) y los argumentos de entrenamiento en training_state.pt.

La innovación técnica destacable no está en la arquitectura sino en el contrato de despliegue: se exige usar la integración X-VLA Piper con el commit upstream `6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2`, Transformers 4.51.3 y la configuración guardada (`action_mode=auto`, `real_action_dim=7`, `max_action_dim=20`). Además, se deben preservar las estadísticas de normalización y el `domain_id` de piper_manifest.json. El proceso de recuperación de checkpoints no preservó un cursor exacto del dataset iterable, lo que puede afectar a la reproducibilidad exacta del entrenamiento. No se dispone de información sobre el número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Predicción de acciones motoras de 7 dimensiones (articulaciones y pinza) a partir de observaciones visuales y propioceptivas.
- Procesamiento de dos vistas RGB (cámara superior y muñeca derecha) a 224x224 píxeles.
- Integración de propiocepción: siete valores medidos de articulaciones y pinza.
- Generación de treinta acciones absolutas de 7 dimensiones por inferencia.
- Tarea especializada de manipulación: recogida de bolas ("pick_balls") con brazo Piper.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión general, audio): no disponible más allá de la percepción visual robótica.

## Casos de uso

- Automatización de recogida de objetos en línea de producción: el modelo puede controlar un brazo Piper para recoger bolas de una superficie, usando las dos cámaras y la propiocepción para generar las acciones articulares. Es adecuado porque está entrenado específicamente para esa tarea y ese hardware.
- Investigación en aprendizaje por imitación robótica: sirve como punto de partida para estudiar el fine-tuning completo de modelos VLA en tareas de manipulación, con checkpoints intermedios que permiten analizar la evolución del entrenamiento.
- Evaluación de robustez de políticas VLA: al disponer de 13 checkpoints, se puede comparar el rendimiento en distintos pasos de entrenamiento y detectar sobreajuste o degradación.
- Despliegue en entornos de laboratorio con brazo Piper: el contrato de entrada y salida está bien definido, lo que facilita la integración con el stack X-VLA y la reproducción de la política entrenada.
- Generación de datos sintéticos o aumento de dataset: las predicciones del modelo pueden usarse para etiquetar trayectorias adicionales en la misma tarea, siempre que se preserve la normalización del manifiesto.
- Docencia y formación en robótica: permite ilustrar el ciclo completo de un modelo VLA, desde la observación multimodal hasta la acción motora, con artefactos de verificación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint en safetensors ocupa ~10,56 GB, por lo que en precisión nativa (probablemente fp32 o bf16) se requiere al menos esa cantidad más el overhead del runtime y del procesador.
- GPU recomendadas: no disponible. Por tamaño de pesos, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) sería el mínimo razonable para cargar el modelo completo sin cuantizar.
- ¿Cabe en GPU de consumidor? Posiblemente en RTX 4090 (24 GB) si se carga en bf16 y el overhead es moderado; no confirmado por el autor.
- Opciones de despliegue: integración específica X-VLA Piper (commit `6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2`) con Transformers 4.51.3, cargando XVLA y XVLAProcessor. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SXY7/X-VLA-Piper-pick_balls | no disponible (~10,56 GB en pesos) | no disponible | Manipulación robótica (pick_balls) | no disponible | HuggingFace, 13 checkpoints |
| 2toINF/X-VLA-Pt (modelo base) | no disponible | no disponible | VLA generalista | no disponible | HuggingFace |
| Otros VLA robóticos (p. ej. OpenVLA, RT-2) | no disponible en esta ficha | no disponible | Manipulación general | no disponible en esta ficha | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea ("pick_balls") y un hardware concreto (brazo Piper); no es un modelo generalista.
- Sin licencia declarada: no se especifican términos de uso comercial, por lo que su explotación en producción requiere aclaración legal previa.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de la tasa de acierto de la política.
- Dependencia estricta de la integración: requiere un commit concreto de X-VLA y Transformers 4.51.3; versiones distintas pueden romper la compatibilidad.
- Reproducibilidad parcial: el entrenador de recuperación no preservó un cursor exacto del dataset iterable, lo que impide reproducir el entrenamiento de forma bit a bit.
- Riesgo de sobreajuste al dominio: al ser fine-tuning completo sobre una tarea, puede degradarse ante cambios de iluminación, fondo u objetos distintos a los del dataset original.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones inválidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no aplica (no es un modelo de lenguaje conversacional).

## Enlaces

- HuggingFace: https://huggingface.co/SXY7/X-VLA-Piper-pick_balls
- Modelo base: https://huggingface.co/2toINF/X-VLA-Pt
- Checkpoints: https://huggingface.co/SXY7/X-VLA-Piper-pick_balls/tree/main
- Repositorio X-VLA (commit de referencia): `6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2` (no se proporciona URL directa en la información disponible)
