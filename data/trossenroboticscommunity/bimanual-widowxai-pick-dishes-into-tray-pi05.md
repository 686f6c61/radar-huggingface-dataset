# TrossenRoboticsCommunity/bimanual-widowxai-pick-dishes-into-tray-pi05

## Resumen

π₀.₅ (pi05) es una política robótica visión-lenguaje-acción (VLA) desarrollada originalmente por Physical Intelligence y aquí publicada como fine-tune por TrossenRoboticsCommunity. El modelo parte de la arquitectura π₀.₅, que combina un VLM PaliGemma `gemma_2b` como codificador de observaciones e instrucciones con un experto de acciones `gemma_300m` entrenado mediante flow matching. El resultado es un modelo de 4.143.404.816 parámetros (8,29 GB en bfloat16) que genera trayectorias de 14 dimensiones a partir de cuatro cámaras y una instrucción en lenguaje natural.

Este checkpoint concreto resuelve una tarea única y muy específica: recoger platos y colocarlos en una bandeja con el robot bimanual estacionario Trossen AI (WidowX AI), de 14 grados de libertad y cuatro cámaras. Se entrenó mediante LoRA (r=32, α=32) sobre un modelo base de Trossen Cloud y se publica como modelo fusionado, de modo que `from_pretrained` carga los pesos completos sin necesidad de descargar el base por separado.

Su relevancia es doble. Por un lado, documenta un patrón de entrenamiento con acciones relativas en las 14 dimensiones (incluidas las pinzas), un detalle que lo diferencia de otros fine-tunes de la misma familia y que condiciona por completo la evaluación. Por otro, es el modelo más pequeño de su colección en número de episodios (40), lo que lo convierte en un caso útil para estudiar hasta qué punto un VLA preentrenado puede adaptarse a una tarea de manipulación bimanual con muy pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅: VLM PaliGemma `gemma_2b` + experto de acciones `gemma_300m` con flow matching |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizer_max_length: 200 tokens; n_obs_steps: 1) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (condicionado por prompt en inglés; tokenizer `google/paligemma-3b-pt-224`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, fusionado, bfloat16, 8,29 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅: un VLM PaliGemma con backbone `gemma_2b` procesa las imágenes (tres cámaras a 480×640, reescaladas a 224×224) y el prompt de tarea, mientras un experto de acciones `gemma_300m` genera los chunks de acción mediante flow matching. La configuración usa `chunk_size` y `n_action_steps` de 50, 10 pasos de inferencia, `max_state_dim` y `max_action_dim` de 32, normalización por cuantiles para estado y acción, e identidad para lo visual. El muestreo temporal del flujo sigue una beta(α=1.5, β=1.0) con escala 0,999 y offset 0,001.

El entrenamiento se realizó con LoRA (r=32, lora_alpha=32) sobre el modelo base de Trossen Cloud `a8f3c67b-518f-4e42-9ed7-6420fb373ca6`, con AdamW (lr 2,5e-5, betas 0,9/0,95, weight_decay 0,01, grad_clip 1.0), warmup de 1000 pasos y decaimiento hasta 2,5e-6 en 38.000 pasos, batch de 32 y gradient checkpointing activado. El vision encoder no se congeló. Se ejecutó en un H200 durante 29,3 horas (29 al 31 de julio de 2026) con una pérdida final de 0,004126. El dataset consta de 40 episodios en formato LeRobot v3, no publicados, retenidos como dataset de Trossen Cloud `bbe014df-f93f-4cb0-a008-1fb777cc76cd`.

La innovación técnica destacable es el tratamiento de acciones relativas como pasos de procesador integrados en el pipeline guardado, no como un flag del modelo. El `relative_actions_processor` (paso 2) aplica `action -= state` en preprocesado y el `absolute_actions_processor` aplica `action += state` en postprocesado, con `exclude_joints: []`, es decir, las 14 dimensiones incluidas las pinzas son relativas. El loader reconfigura automáticamente los pasos emparejados al cargar, por lo que en inferencia no hace falta ninguna marca especial.

## Capacidades

- Generación de trayectorias de acción de 14 dimensiones (posición y pinzas) para un robot bimanual estacionario de 14 DoF.
- Condicionamiento por lenguaje natural: la política responde al prompt exacto `pick up the dishes and place into the tray`; una paráfrasis constituye una entrada distinta.
- Percepción multi-cámara con cuatro vistas (`cam_low`, `cam_high`, `cam_left_wrist`, `cam_right_wrist`), con orden de cámaras estricto.
- Generación de chunks de acción de 50 pasos con 10 pasos de inferencia por chunk.
- Acciones relativas en las 14 dimensiones, incluidas las pinzas, con reconstrucción absoluta automática en postprocesado.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de audio o visión general fuera del pipeline robótico.
- Capacidades multilingües: no disponibles; el prompt de entrenamiento está en inglés.

## Casos de uso

- Automatización de recogida y colocación de vajilla: el modelo ejecuta la tarea de coger platos y depositarlos en una bandeja sobre la plataforma Trossen AI estacionaria, usando las cuatro cámaras para localizar los objetos y las pinzas.
- Investigación en aprendizaje por imitación con pocos datos: con solo 40 episodios, sirve como referencia para estudiar la transferencia de un VLA preentrenado a una tarea bimanual concreta y el efecto del fine-tune LoRA.
- Evaluación de acciones relativas frente a absolutas: al ser el único fine-tune de la familia con las 14 dimensiones relativas (pinzas incluidas), permite comparar directamente con `pi05-block-transfer-lerobot` (pinzas absolutas) y con `bimanual-widowxai-pour-items-red-cup-pi05` (acciones absolutas).
- Banco de pruebas de pipelines LeRobot: el checkpoint valida el flujo completo de `PI05Policy.from_pretrained`, procesadores de pre/postprocesado y normalizadores por cuantiles en un caso real.
- Prototipado de líneas de montaje con manipulación bimanual: la política puede integrarse en una celda con robot estacionario para tareas de clasificación y traslado de objetos rígidos.
- Docencia y reproducción de experimentos: la model card documenta hiperparámetros, manifiesto de entradas, checkpoints y pérdida final, lo que facilita reproducir el entrenamiento en Trossen Cloud.
- Base para nuevos fine-tunes: al publicarse fusionado en bfloat16, puede servir de punto de partida para adaptar la tarea a otras geometrías de bandeja u objetos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única evaluación reportada es cualitativa: la tabla de la model card indica que la tarea `pick-dishes-into-tray` está "confirmed working on the stationary rig", con el número de repeticiones y la tasa de éxito marcados como TODO.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan 8,29 GB; con overhead de activaciones, buffers de imagen (cuatro cámaras a 480×640) y el pipeline de flow matching, se recomienda un mínimo de 16 GB de VRAM.
- GPU recomendadas: H200 (la usada en entrenamiento), A100 40/80 GB, H100; para inferencia ajustada, RTX 4090 (24 GB) es suficiente para cargar los pesos en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y RTX 4080 (16 GB) con margen limitado; por debajo de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: `lerobot` con `PI05Policy.from_pretrained`; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no son aplicables a una política de acciones.
- Latencia y throughput: no disponibles; la configuración fija 10 pasos de inferencia por chunk de 50 acciones, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Acciones | Cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bimanual-widowxai-pick-dishes-into-tray-pi05` (este) | 4.143.404.816 | 200 tokens / 50 | Relativas en 14 dims (pinzas incluidas) | 4 | no disponible | Hugging Face |
| `pi05-block-transfer-lerobot` | no disponible | no disponible / 50 | Relativas con pinzas absolutas (excluye juntas de carro) | 4 | no disponible | Hugging Face |
| `bimanual-widowxai-pour-items-red-cup-pi05` | no disponible | no disponible / no disponible | Absolutas | 3 | no disponible | Hugging Face |

Los tres comparten la arquitectura π₀.₅ y el pipeline LeRobot, pero difieren en el espacio de acciones y en el número de cámaras. El modelo de este análisis es el único con las 14 dimensiones relativas y cuatro cámaras; el de `pour-items-red-cup` usa acciones absolutas y solo tres cámaras, por lo que no es intercambiable en el mismo montaje.

## Limitaciones y advertencias

- Tarea única: el modelo solo ha sido entrenado para `pick up the dishes and place into the tray`; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- Sensibilidad al orden de cámaras: `config.json` exige `cam_low`, `cam_high`, `cam_left_wrist`, `cam_right_wrist` en ese orden; un orden incorrecto carga sin error y produce acciones sin sentido, y una configuración de tres cámaras no puede ejecutar esta política.
- Dependencia de los procesadores: sin los `.safetensors` de los procesadores de pre/postprocesado, la política emite salidas no normalizadas; el pipeline debe cargarse completo.
- Dataset no publicado: los 40 episodios de entrenamiento no están disponibles, lo que impide reproducir el fine-tune.
- Checkpoint no óptimo medido: solo se recuperó el paso 38000 de los cuatro generados (9500, 19000, 28500, 38000); es el mejor conocido, no un óptimo medido.
- Evaluación incompleta: no hay número de repeticiones ni tasa de éxito formal; la validez está confirmada solo cualitativamente.
- Riesgo de alucinación motora: como toda política VLA, puede generar trayectorias plausibles pero incorrectas ante cambios de iluminación, geometría de la escena u objetos distintos a los del entrenamiento.
- Sesgos: no documentados por el autor; al entrenarse con un único montaje y una única tarea, el sesgo de dominio es alto.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Idiomas: no se documenta soporte multilingüe; el prompt de entrenamiento está en inglés y el tokenizer es el de PaliGemma.
- Sin `adapter_config.json`: los ficheros de adaptador LoRA no se publicaron, solo el modelo fusionado, por lo que no es posible reutilizar el adaptador por separado.

## Enlaces

- Hugging Face: https://huggingface.co/TrossenRoboticsCommunity/bimanual-widowxai-pick-dishes-into-tray-pi05
- Modelo base referenciado (Trossen Cloud): `a8f3c67b-518f-4e42-9ed7-6420fb373ca6` (no es una URL pública)
- Dataset de entrenamiento (Trossen Cloud): `bbe014df-f93f-4cb0-a008-1fb777cc76cd` (no publicado)
- Tokenizer: `google/paligemma-3b-pt-224`
- Fine-tunes relacionados: `pi05-block-transfer-lerobot`, `bimanual-widowxai-pour-items-red-cup-pi05`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
