# twanghcmut/bridgequant-libero-76m-ptr5

## Resumen

bridgequant-libero-76m-ptr5 es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario twanghcmut, que forma parte de la familia BridgeQuant. Se trata de un ablation del recipe LIBERO de 76M de parámetros en el que se modifica el parámetro `loss.phase_transition_radius` a 5 con un peso de 3.0. El modelo está pensado para control robótico en tareas de manipulación, mapeando observaciones visuales y lenguaje a acciones motoras.

El modelo tiene 64.826.027 parámetros reales según los pesos en safetensors (el nombre "76m" hace referencia a la configuración del recipe, no al conteo exacto), se distribuye en formato safetensors y ocupa 0.3 GB en el repositorio. Su pipeline declarado es `robotics` y está etiquetado con `bridgequant_async_vla`, lo que indica que se integra con el framework asíncrono de BridgeQuant para entrenamiento y despliegue.

Es relevante como referencia de ablation: el autor indica explícitamente que se conserva solo para comparación y que no se recomienda su uso. Su rendimiento en LIBERO-500 (media de 3 ejecuciones) es de 0.9533 frente a 0.9715 del modelo de referencia, con un descenso notable en la tarea "long" (0.920 frente a la referencia). Por tanto, es un artefacto de investigación, no un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), variante BridgeQuant async |
| Parámetros totales | 64.826.027 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (junto con norm_stats.json, bridgequant_vla.yaml, config.json, metadata.json, train_config.yaml) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su clasificación como modelo de visión-lenguaje-acción (VLA) dentro del framework BridgeQuant async. Los tags (`bridgequant_async_vla`, `robotics`, `vision-language-action`) y el pipeline (`robotics`) confirman que el modelo consume observaciones visuales y posiblemente instrucciones en lenguaje para producir acciones de control. El repositorio incluye `norm_stats.json`, lo que sugiere normalización de observaciones y acciones típica en políticas robóticas, y un `bridgequant_vla.yaml` que el método `load_trainable_weights` espera para cargar los pesos entrenables.

El entrenamiento corresponde al recipe LIBERO de 76M con una modificación concreta: `loss.phase_transition_radius: 5` con peso 3.0. No se especifican en la información proporcionada el número de tokens, la composición del dataset, ni si hubo RLHF o DPO. El autor lo describe como un ablation ("Ablation: the 76M LIBERO recipe...") conservado únicamente como referencia. La evaluación se realizó sobre LIBERO-500 con media de 3 ejecuciones, y el YAML de experimento (`train_config.yaml`) se usa tanto para evaluación como para despliegue.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales, orientado a las suites de tareas LIBERO (long, spatial, goal, object).
- Percepción visual integrada: procesa entradas de imagen como parte del pipeline VLA.
- Condicionamiento por lenguaje: la naturaleza vision-language-action implica que las tareas se especifican mediante instrucciones, aunque no se detalla el formato exacto en la información disponible.
- Integración con el framework BridgeQuant async: los archivos del bundle (`bridgequant_vla.yaml`, `config.json`, `metadata.json`) permiten cargar los pesos entrenables mediante `load_trainable_weights`.
- Evaluación reproducible: incluye `train_config.yaml` compartido entre entrenamiento, evaluación y despliegue.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos especiales (thinking, audio) en la documentación proporcionada.

## Casos de uso

- Investigación en ablations de VLA: el modelo sirve como punto de comparación controlado para medir el efecto de `loss.phase_transition_radius: 5` con peso 3.0 frente al recipe base, gracias a que comparte configuración y bundle de carga con el resto de la familia.
- Reproducción de experimentos LIBERO: permite replicar la evaluación sobre LIBERO-500 (long, spatial, goal, object) usando el mismo `train_config.yaml` que el autor empleó para evaluación y despliegue.
- Desarrollo y depuración del pipeline BridgeQuant async: al incluir `norm_stats.json` y el bundle completo, es útil para validar el flujo de `load_trainable_weights` y la normalización de observaciones/acciones antes de pasar a modelos recomendados.
- Benchmarking interno de políticas robóticas: su puntuación de 0.9533 en LIBERO-500 permite situar otras variantes en una escala conocida, especialmente en la tarea "long", donde rinde 0.920.
- Docencia y formación en robótica basada en aprendizaje: un modelo pequeño (0.3 GB) y con artefactos de configuración explícitos facilita explicar el ciclo completo de un VLA sin requerir infraestructura pesada.
- Pruebas de integración en simulación: adecuado para validar conectores de simulación a control antes de desplegar variantes con mejor rendimiento; no se recomienda para despliegue real en producción según el propio autor.

## Benchmarks y rendimiento

Resultados en LIBERO-500 (media de 3 ejecuciones) según la model card:

| Métrica | bridgequant-libero-76m-ptr5 | Referencia (recipe base) |
|---|---|---|
| LIBERO-500 (media) | 0.9533 | 0.9715 |
| Long | 0.920 | no disponible |
| Spatial | 0.950 | no disponible |
| Goal | 0.946 | no disponible |
| Object | 0.997 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64,8M de parámetros y pesos en safetensors, el modelo es muy ligero (repo de 0.3 GB), por lo que en fp32 ocuparía aproximadamente 0,26 GB solo en pesos, más el coste del codificador visual y del estado de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna debería poder alojarlo.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con suficiente memoria para el codificador visual y el resto del pipeline VLA; no se especifican modelos concretos.
- Opciones de despliegue: el autor remite al repositorio https://github.com/VLAOpt/bridgequant-async; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-libero-76m-ptr5 | 64.826.027 | no disponible | 0.9533 | other | HuggingFace |
| Recipe base BridgeQuant LIBERO 76M (referencia del autor) | ~76M (según nombre del recipe) | no disponible | 0.9715 | other | Referenciado en la model card, no se proporciona enlace directo |
| Otras alternativas VLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo no recomendado por el propio autor: la model card indica explícitamente "Kept for reference; not recommended".
- Rendimiento inferior al recipe base: 0.9533 frente a 0.9715 en LIBERO-500, con una caída acusada en la tarea "long" (0.920).
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en robótica el riesgo equivalente es la ejecución de acciones incorrectas, y no se documentan métricas de seguridad.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: licencia "other", sin texto de licencia incluido en la información disponible; es imprescindible revisar los términos antes de cualquier uso comercial.
- Caveat para producción: es un artefacto de ablation con 0 descargas y 0 likes, sin validación externa conocida; no debe usarse como política desplegada sin evaluación adicional en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/bridgequant-libero-76m-ptr5
- Código: https://github.com/VLAOpt/bridgequant-async
- Paper, blog o demo: no disponibles en la información proporcionada.
