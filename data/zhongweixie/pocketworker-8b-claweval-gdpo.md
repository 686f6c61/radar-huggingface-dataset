# zhongweixie/PocketWorker-8B-ClawEval-GDPO

## Resumen

PocketWorker-8B-ClawEval-GDPO es un ajuste por aprendizaje por refuerzo del modelo multimodal Qwen3-VL-8B-Instruct, publicado por el usuario zhongweixie. El modelo parte del checkpoint *instruct* original de Qwen (no de un SFT intermedio) y se entrena con el algoritmo GDPO sobre un conjunto interno de tareas de agente, con el objetivo de mejorar el comportamiento multi-paso y el uso de herramientas en entornos de ejecución reales. El resultado es un checkpoint (`iter_0000560`) de 8.767.123.696 parámetros (~8,77 B) con licencia Apache 2.0 y pesos en safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la práctica actual en *open source*: un *fine-tune* de RL sobre un modelo base potente, con infraestructura Megatron + slime y un *judge* externo como función de recompensa. Por otro, el propio autor advierte explícitamente de que **no existen métricas de evaluación *held-out* fiables**: el *baseline* de *cold start* no llegó a arrancar por un fallo de `ninja` en el JIT de SGLang y el *script* de evaluación descarta parte de las tareas, con una cobertura inferior a 30 de un conjunto mayor. Cualquier uso en producción debe tratar el modelo como experimental.

Arquitectura y contexto: se trata de un transformer multimodal de la familia Qwen3-VL (etiqueta `qwen3_vl`, pipeline `image-text-to-text`), pero la model card no detalla la longitud de contexto, la composición del dataset ni los hiperparámetros de RL. El repositorio ocupa 17,5 GB e incluye únicamente pesos en safetensors, sin cuantizaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3-VL (etiqueta `qwen3_vl`); detalles de capas y atención no disponibles en la información proporcionada |
| Parámetros totales | 8.767.123.696 (~8,77 B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada (no se documenta en la model card) |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (convertidos desde un checkpoint distribuido de Megatron) |
| Tamaño del repositorio | 17,5 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Pipeline declarado | `image-text-to-text` |
| Biblioteca | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* por refuerzo del Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar imagen y texto. El autor no describe cambios arquitectónicos: los pesos se obtienen convirtiendo un checkpoint distribuido de Megatron con `slime/tools/convert_torch_dist_to_hf.py`, y los pesos o el tokenizer ausentes se completan tomando los del modelo base original. Por tanto, la arquitectura efectiva es la del Qwen3-VL-8B-Instruct, sin modificaciones estructurales declaradas.

El entrenamiento usa GDPO (una variante de optimización de preferencias por grupos) sobre un conjunto interno de tareas de agente, con 187 *prompts*, 8 muestras por *prompt*, *rollout batch* de 1 y *global batch* de 8, durante 561 pasos de *rollout* (aproximadamente 3 épocas). La variante es una línea base de *cold start*: sin *rubric overlay* ni *dim scoring*. La recompensa la proporciona un *judge* externo, `qwen/qwen-2.5-72b-instruct`, servido vía OpenRouter. El *hardware* fueron 8 GPU H800 con TP=8 en configuración *colocate*. La tasa de aprendizaje y el coeficiente KL provienen del perfil `formal` de slime y el autor no los reproduce por no poder verificarlos. No se documentan el volumen de tokens, la composición del dataset ni si hubo fases previas de SFT o DPO sobre este checkpoint.

## Capacidades

- Generación de texto y razonamiento multi-turno sobre el modelo base Qwen3-VL-8B-Instruct.
- Procesamiento de entradas imagen-texto (`image-text-to-text`): el pipeline declarado admite imágenes junto a instrucciones textuales.
- Comportamiento de agente orientado a tareas: el ajuste se realizó sobre un conjunto interno de tareas de agente, lo que sugiere entrenamiento en uso de herramientas y resolución de pasos intermedios, aunque no se detalla el formato exacto de las herramientas.
- Aprendizaje por refuerzo con *judge* externo (GDPO), que puede favorecer respuestas más alineadas con el criterio del evaluador usado durante el entrenamiento.
- Capacidades multilingües: no disponibles en la información proporcionada (la model card no declara idiomas).
- No se documentan modo *thinking* explícito, soporte de audio, ni funciones de *function calling* verificadas más allá de lo implícito en el entrenamiento de agente.

## Casos de uso

- Automatización de tareas de agente en entornos con imagen: al estar entrenado sobre tareas de agente y admitir entradas multimodales, puede emplearse en flujos donde el modelo debe interpretar una captura de pantalla o un documento escaneado y decidir el siguiente paso.
- Evaluación comparativa de recetas de RL: sirve como punto de partida para reproducir un *pipeline* GDPO con slime y un *judge* externo, útil en investigación sobre optimización de preferencias.
- Prototipado de asistentes multi-turno con contexto visual: el modelo puede mantener conversaciones donde el usuario adjunta imágenes y formula preguntas de seguimiento, aunque la longitud de contexto no está documentada y debe medirse empíricamente.
- Extracción de información de documentos: dado su pipeline imagen-texto, es apto para probar *pipelines* de OCR semántico o respuesta a preguntas sobre capturas y páginas escaneadas.
- *Baseline* interno para *fine-tuning* posterior: al ser un checkpoint intermedio de RL sobre el instruct original, puede usarse como inicialización para SFT específico de dominio.
- Investigación sobre sesgos del *reward model*: permite estudiar cómo un *judge* `qwen-2.5-72b-instruct` moldea el estilo de las respuestas tras 561 pasos de RL, comparando con el modelo base.
- No se recomienda su uso en producción crítica sin una evaluación propia, dado que el autor declara ausencia de métricas *held-out* fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay cifras *held-out* creíbles y que no debe asumirse que el modelo supera a su punto de partida. Los dos motivos citados son: (1) el trabajo de *baseline* de *cold start* (ID 373736) no arrancó por falta de `ninja` en el JIT de SGLang, y (2) el *script* de evaluación *held-out* rechaza tareas de tipo *sandbox snapshot* y de entrada multimodal, con una cobertura inferior a 30 del conjunto completo, por lo que su puntuación no es representativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 18-20 GB solo para pesos, más caché KV y *overhead* del *runtime*; se recomienda reservar 24 GB o más.
- Cuantización a 8 bits: aproximadamente 9-10 GB de pesos; a 4 bits, aproximadamente 5-6 GB, aunque **no se publican pesos cuantizados** en el repositorio, por lo que habría que generarlos.
- GPU profesionales: A100 40/80 GB, H100/H800 (la configuración de entrenamiento usó 8x H800 con TP=8) y L40S son adecuadas.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16 de forma ajustada, con riesgo de OOM según la longitud de contexto y el número de imágenes; en 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar.
- Opciones de despliegue: transformers (ruta documentada en la model card), vLLM y SGLang (SGLang aparece citado en el contexto de evaluación del autor); llama.cpp u Ollama solo si se generan pesos GGUF, que no están publicados.
- Latencia y *throughput*: no disponibles. Al ser un modelo multimodal de ~8,8 B, el coste por token de salida es comparable al de otros modelos densos de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|
| PocketWorker-8B-ClawEval-GDPO | ~8,77 B | No disponible | Apache 2.0 | Ninguna fiable (según el autor) | Safetensors en HF |
| Qwen3-VL-8B-Instruct (base) | ~8 B (heredado) | No disponible en la información proporcionada | Apache 2.0 | Métricas del modelo original no trasladables a este *fine-tune* | Safetensors en HF |
| Otros *fine-tunes* GDPO del mismo autor (`*_stage3`) | ~8 B | No disponible | Apache 2.0 | No disponible | Safetensors en HF |

La comparación directa con alternativas de terceros no está disponible en la información proporcionada. La diferencia documentada frente al modelo base es únicamente el proceso de RL (561 pasos, 187 *prompts*, *judge* `qwen-2.5-72b-instruct`) y el punto de partida (*instruct* original, no un checkpoint SFT); no hay datos que cuantifiquen la mejora.

## Limitaciones y advertencias

- Ausencia de evaluación *held-out* fiable: el propio autor advierte de que no debe considerarse que el modelo supera a su punto de partida.
- Riesgo de sobreajuste al conjunto interno de 187 *prompts* y al criterio del *judge* `qwen-2.5-72b-instruct` vía OpenRouter, lo que puede sesgar el estilo y las respuestas hacia ese evaluador.
- El *script* de evaluación *held-out* rechaza tareas de tipo *sandbox snapshot* y de entrada multimodal, de modo que las capacidades multimodales del modelo podrían no estar cubiertas por ninguna validación.
- Idiomas soportados no documentados; no hay garantía de calidad en castellano ni en otros idiomas distintos del que se usó en el conjunto interno.
- Longitud de contexto no documentada: debe medirse antes de diseñar aplicaciones con conversaciones largas o muchas imágenes.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en *hardware* de consumo sin trabajo adicional.
- Inconsistencia de nomenclatura: el repositorio se llama `PocketWorker-8B-ClawEval-GDPO` mientras que el título de la model card es `qwen3vl-8b-claw-rl-gdpo-v13-iter560`; conviene verificar el checkpoint exacto antes de integrarlo.
- La model card indica que el repositorio tuvo previamente adjunta la model card del Qwen original y que ya se corrigió; conviene revisar la versión vigente antes de citar cualquier dato.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento (conjunto interno no descrito) podrían introducir obligaciones adicionales no detalladas.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de 8,8 B sin validación específica; debe aplicarse verificación externa en flujos de producción.
- El repositorio no tiene descargas ni *likes*, lo que reduce la probabilidad de que la comunidad haya detectado problemas de conversión o de tokenizer.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhongweixie/PocketWorker-8B-ClawEval-GDPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- slime (herramienta de RL citada en la model card, usada para la conversión del checkpoint): https://github.com/THUDM/slime
- Resultados de búsqueda web: no se encontraron enlaces relevantes sobre este modelo; las consultas devolvieron contenido no relacionado con el proyecto, por lo que no se incluyen.
