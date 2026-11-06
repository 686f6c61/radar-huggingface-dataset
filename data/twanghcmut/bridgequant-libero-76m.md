# twanghcmut/bridgequant-libero-76m

## Resumen

bridgequant-libero-76m es un modelo vision-language-action (VLA) de 64,8 millones de parámetros publicado por el usuario twanghcmut en Hugging Face, orientado a robótica y control de brazos manipuladores. Forma parte del proyecto BridgeQuant y se presenta como un "TinyVL" entrenado de forma conjunta sobre las cuatro suites del benchmark LIBERO (long, spatial, goal y object), lo que lo convierte en una política compacta capaz de resolver tareas de manipulación a partir de instrucciones en lenguaje natural e imágenes.

El modelo resuelve el problema de obtener una política VLA con rendimiento competitivo en LIBERO manteniendo un tamaño muy reducido (64,8 M de parámetros, repo de 0,3 GB), lo que facilita el despliegue en hardware modesto y su integración en bucles de control robótico. Según la model card, alcanza una media de 97,15 en LIBERO-500 (media de 3 ejecuciones) y 71,7 en LIBERO-Plus.

La relevancia actual del modelo radica en su enfoque de cuantización ("BridgeQuant") y en la disponibilidad de un bundle completo de despliegue (pesos safetensors, estadísticas de normalización estado/acción, YAML de configuración y scripts para el brazo SO101) junto con el repositorio de código bridgequant-async. La información pública disponible es escasa: no se detallan idiomas soportados, composición del dataset ni proceso de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en "TinyVL", según la model card; detalles internos no disponibles |
| Parametros totales | 64.826.027 (64,8 M) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el nombre "BridgeQuant" sugiere un esquema de cuantización propio, sin especificar en la información proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | other (licencia no estándar; consultar términos del autor) |
| Formato de pesos | safetensors (model.safetensors), más norm_stats.json, bridgequant_vla.yaml, config.json, metadata.json y train_config.yaml |

## Arquitectura y entrenamiento

La model card describe el modelo como "BridgeQuant 76M (TinyVL)" entrenado conjuntamente sobre las cuatro suites de LIBERO. Se trata, por tanto, de una política VLA que combina percepción visual e instrucciones de lenguaje para producir acciones de control, con un backbone de tipo TinyVL de tamaño muy reducido. El bundle incluye `norm_stats.json` con las estadísticas de normalización de estados y acciones, lo que indica que el modelo opera sobre observaciones y acciones normalizadas propias del entorno LIBERO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas más allá del nombre del proyecto (BridgeQuant) y de la etiqueta `bridgequant_async_vla`. El archivo `train_config.yaml` se presenta como la configuración experimental usada en el entrenamiento, y la model card indica que evaluación y despliegue emplean el mismo YAML, lo que sugiere una pipeline unificada de entrenamiento y evaluación.

## Capacidades

- Control robótico vision-language-action: genera acciones de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural.
- Ejecución de tareas de las suites LIBERO: long, spatial, goal y object, con un único conjunto de pesos entrenado conjuntamente.
- Integración con el brazo SO101 mediante `scripts/so101_policy.py` y la guía `docs/so101_deploy.md` del repositorio bridgequant-async.
- Carga de pesos mediante `load_trainable_weights(policy, "<dir>")` tras instanciar `BridgeQuantAsyncVLA.from_pretrained(config=cfg.policy, init_empty_trainable=True)`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no documenta idiomas.
- Modo "thinking", visión general, audio u otras capacidades especiales: no disponibles más allá de la percepción visual propia de un VLA.

## Casos de uso

- Manipulación robótica en entornos de investigación tipo LIBERO: el modelo puede evaluarse directamente sobre las cuatro suites (long, spatial, goal, object) con los mismos pesos, lo que simplifica la comparación de políticas y la reproducibilidad de experimentos.
- Despliegue en el brazo SO101: gracias a `scripts/so101_policy.py` y `docs/so101_deploy.md`, el modelo puede ejecutarse en un brazo de bajo coste para tareas de pick-and-place y manipulación guiada por instrucciones.
- Prototipado rápido de políticas VLA: con 64,8 M de parámetros y un repo de 0,3 GB, el modelo cabe en hardware modesto y permite iterar en local sin infraestructura de gran escala.
- Investigación sobre cuantización en robótica: al formar parte del proyecto BridgeQuant, sirve como base para estudiar el efecto de esquemas de cuantización sobre el rendimiento de políticas VLA en tareas de control.
- Evaluación comparativa de políticas compactas: sus resultados en LIBERO-500 (97,15 de media) y LIBERO-Plus (71,7) permiten usarlo como referencia "small" frente a políticas VLA de mayor tamaño.
- Integración en pipelines de entrenamiento y evaluación unificados: el uso del mismo `train_config.yaml` para entrenamiento, evaluación y despliegue facilita la automatización de experimentos en un laboratorio de robótica.

## Benchmarks y rendimiento

Resultados publicados en la model card (LIBERO-500, media de 3 ejecuciones):

| Benchmark | Resultado |
|---|---|
| LIBERO-500 long | 94,8 |
| LIBERO-500 spatial | 98,0 |
| LIBERO-500 goal | 96,2 |
| LIBERO-500 object | 99,6 |
| LIBERO-500 media | 97,15 |
| LIBERO-Plus | 71,7 |

No se han publicado en la información disponible resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64,8 M de parámetros y pesos safetensors, el modelo es muy ligero (repo de 0,3 GB), por lo que debería caber holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente para inferencia.
- Cabe en consumer GPU: sí, previsiblemente, dado el reducido número de parámetros; sin cifras oficiales de VRAM.
- Opciones de despliegue: el repositorio bridgequant-async (carga mediante `BridgeQuantAsyncVLA` y `load_trainable_weights`), con soporte específico para el brazo SO101; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. Como referencia cualitativa, el modelo se posiciona como una política VLA compacta (64,8 M de parámetros) entrenada sobre LIBERO, pero no se han facilitado resultados de alternativas en la misma información.

| Modelo | Parámetros | Contexto | LIBERO-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-libero-76m | 64,8 M | No disponible | 97,15 (media) | other | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado; al ser un modelo de acción, el riesgo principal es la ejecución de acciones incorrectas en el entorno físico.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto; la model card no documenta capacidades lingüísticas generales.
- Restricciones de licencia: la licencia es "other", no estándar; es imprescindible revisar los términos del autor antes de cualquier uso comercial.
- Caveats para producción: el modelo está orientado a investigación en robótica y benchmarks LIBERO; no se documentan garantías de robustez en entornos reales, seguridad física ni protocolos de parada de emergencia.
- El rendimiento reportado corresponde a LIBERO-500 (media de 3 ejecuciones) y LIBERO-Plus; no hay datos de generalización fuera de estos entornos.
- El repositorio tiene muy poca tracción pública (11 descargas, 0 likes) y fue creado en octubre de 2026, por lo que la validación externa es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/bridgequant-libero-76m
- Código: https://github.com/VLAOpt/bridgequant-async
- Guía de despliegue SO101: docs/so101_deploy.md (dentro del repositorio de código)
