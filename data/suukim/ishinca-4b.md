# suukim/Ishinca-4B

## Resumen

Ishinca-4B es un modelo vision-lenguaje-acción (VLA) de 4,23 mil millones de parámetros orientado a conducción autónoma, desarrollado por Sunguk Kim y publicado en Hugging Face bajo la licencia NVIDIA Open Model License. Se construye mediante destilación del profesor NVIDIA Alpamayo 1.5 (10B) sobre un backbone Cosmos-Reason2-2B (arquitectura Qwen3-VL-2B), al que se añade un experto de acción de 28 capas entrenado con flow matching sobre las acciones del profesor. El resultado es un modelo que predice trayectorias de conducción a partir de cuatro cámaras y un historial de ego-estado, y que además puede emitir una justificación textual en lenguaje natural (Chain-of-Causation).

La relevancia del modelo reside en su propuesta de compresión: reduce a menos de la mitad los parámetros del profesor manteniendo la capacidad de generar planes de trayectoria a 10 Hz con 64 waypoints (6,4 s de horizonte) en un espacio de acción de aceleración y curvatura de uniciclo. Emplea atención no causal sobre la caché KV del prefijo VLM en el experto de acción, y ofrece variantes con poda de tokens visuales (DART al 75 % y 50 %) para reducir coste de inferencia.

Es un modelo de investigación, no un sistema de producción para conducción. El autor lo declara explícitamente y limita el idioma a inglés. La destilación se realizó exclusivamente con objetivos derivados del profesor, sin mezclar trayectorias ground-truth, lo que conviene tener en cuenta al interpretar su comportamiento en lazo cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrido: backbone VLM tipo Qwen3-VL-2B (28 capas, hidden 2048, vision tower de 24 capas con patch 16, merge 2 y DeepStack en capas 5/11/17) + experto de acción de 28 capas (hidden 2048, intermediate 8256, 16 cabezas x 128) con atención no causal sobre la caché KV del prefijo VLM |
| Parametros totales | 4.228.148.226 (4,23 B): VLM 2,45 B (incluye vision tower 0,41 B, embeddings y lm_head) + experto de acción y proyecciones 1,77 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa 2.880 tokens de imagen en la variante sin poda; la generación de texto se limita a `max_generation_length=256` en el ejemplo de inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors (`model.safetensors`, 947 tensores, bf16) |

## Arquitectura y entrenamiento

El modelo combina un backbone VLM con un experto de acción separado. El backbone sigue la arquitectura Qwen3-VL-2B: 28 capas, dimensión oculta 2048, vocabulario de 155.685 tokens (se añaden los tokens de trayectoria de Alpamayo) y una torre de visión de 24 capas con patch de 16, merge de 2 y conexiones DeepStack en las capas 5, 11 y 17. El experto de acción (AE28) tiene 28 capas, dimensión oculta 2048, dimensión intermedia 8256 y 16 cabezas de 128 dimensiones; sus capas se inicializaron a partir de las capas del experto del profesor mediante el mapeo `round(i*35/27)` y se entrenaron con flow matching sobre las acciones del profesor, con atención no causal sobre la caché KV del prefijo del VLM.

La entrada son 4 cámaras x 4 fotogramas (frontal amplia, frontal tele, lateral izquierda y lateral derecha) a 320x576 tras el procesado, un historial de ego-estado de 16 pasos y, opcionalmente, una instrucción de ruta en formato `<command> in <distance> meters`. La salida son 64 waypoints a 10 Hz (6,4 s) en espacio de acción de aceleración y curvatura de uniciclo, más un texto opcional de Chain-of-Causation. La destilación usa exclusivamente objetivos del profesor Alpamayo-1.5-10B, sin mezclar trayectorias ground-truth. Aproximadamente el 21 % de las muestras de entrenamiento llevaban instrucción de ruta (go straight 11,5 %, turn right 4,9 %, turn left 4,6 %), si bien esas instrucciones fueron creadas por el autor y no forman parte del dataset PhysicalAI-AV ni son anotaciones de NVIDIA. El dataset de referencia es `nvidia/PhysicalAI-Autonomous-Vehicles`.

## Capacidades

- Predicción de trayectorias de conducción: 64 waypoints a 10 Hz (6,4 s) en espacio de aceleración y curvatura de uniciclo.
- Razonamiento visual multimodal sobre 4 cámaras x 4 fotogramas a 320x576.
- Generación de texto Chain-of-Causation que justifica la trayectoria propuesta.
- Seguimiento opcional de instrucciones de ruta en formato `<command> in <distance> meters`, con comandos `go straight`, `turn left` y `turn right`.
- Integración de historial de ego-estado de 16 pasos (posición y rotación).
- Muestreo estocástico de trayectorias con `top_p` y `temperature` configurables, y `num_traj_samples` para múltiples muestras.
- Variantes con poda de tokens visuales (DART 75 % y 50 %) para reducir el coste de inferencia, aplicadas por el código de inferencia mediante la opción `dart_keep`.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en destilación de modelos VLA: el modelo sirve como caso de estudio reproducible de compresión de un profesor de 10B a 4B con scripts de entrenamiento y evaluación publicados, útil para estudiar la transferencia de capacidad entre expertos de acción.
- Evaluación en lazo cerrado en AlpaSim: el autor demuestra rollouts en el simulador con plan de pájaro, cámara frontal, Chain-of-Causation y trayectoria predicha; adecuado para comparar variantes con y sin poda de tokens.
- Análisis de poda de tokens visuales: las variantes DART75 (2.160 tokens) y DART50 (1.440 tokens) permiten medir el impacto de reducir la resolución efectiva sobre la calidad de la trayectoria en un mismo checkpoint.
- Generación de explicaciones de conducción: la salida Chain-of-Causation permite estudiar la alineación entre el razonamiento textual y la trayectoria emitida, por ejemplo en auditoría de decisiones.
- Seguimiento de instrucciones de navegación: con el texto de ruta opcional se puede evaluar la capacidad del modelo de condicionar la trayectoria a comandos de giro y distancia, aunque solo el 21 % de las muestras de entrenamiento llevaban instrucción.
- Prototipado de pipelines de percepción-planificación: la API `build_model_inputs` y `sample_trajectories_from_data_with_vlm_rollout` permite integrar el modelo en experimentos que combinen 4 cámaras, ego-historial y salida de waypoints.
- Estudio de flow matching en espacio de acción de uniciclo: el experto AE28 entrenado con flow matching sobre acciones del profesor es un banco de pruebas para métodos de generación de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación con números agregados y casos de fallo en AlpaSim, pero no se incluyen tablas con métricas concretas (MMLU, HumanEval, GSM8K ni métricas de conducción como ADE/FDE) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,23 B parámetros en bfloat16, los pesos ocupan aproximadamente 8,5 GB (tamaño del repo), por lo que se necesita al menos esa cantidad más el overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo de inferencia usa `torch.autocast("cuda", dtype=torch.bfloat16)`, lo que requiere una GPU con soporte de bfloat16.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos (≈8,5 GB en bf16) cabría en GPUs con 12-16 GB o más, pero no se documenta ningún requisito oficial ni se han validado configuraciones de consumo.
- Opciones de despliegue: el código oficial es `ishinca` (repositorio GitHub `kimsunguk0/Ishinca`, Apache-2.0), que requiere además el código de inferencia upstream de Alpamayo-1.5. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishinca-4B | 4,23 B | no disponible | VLA conducción autónoma (destilado) | NVIDIA Open Model License | Hugging Face (`suukim/Ishinca-4B`) |
| NVIDIA Alpamayo-1.5-10B (profesor) | 10 B (según nombre del repo) | no disponible | VLA conducción autónoma | no disponible en la información | Hugging Face (`nvidia/Alpamayo-1.5-10B`) |
| NVIDIA Cosmos-Reason2-2B (backbone) | 2 B (según nombre del repo) | no disponible | VLM base | no disponible en la información | Hugging Face (`nvidia/Cosmos-Reason2-2B`) |
| Ishinca-4B-DART75 / DART50 | 4,23 B | no disponible | VLA con poda de tokens (2.160 / 1.440 tokens) | NVIDIA Open Model License | Hugging Face (`suukim/Ishinca-4B-DART75`, `suukim/Ishinca-4B-DART50`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no es un sistema de conducción para producción.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado; el modelo genera texto Chain-of-Causation que podría no reflejar fielmente la trayectoria emitida.
- Limitación de idioma: solo inglés, tanto en instrucciones de ruta como en texto generado.
- Destilación sin ground-truth: los objetivos provienen exclusivamente del profesor, por lo que el modelo hereda los errores del profesor sin corrección con datos reales.
- Instrucciones de ruta creadas por el autor: no forman parte del dataset PhysicalAI-AV ni son anotaciones de NVIDIA; solo el 21 % de las muestras de entrenamiento las incluían, y todas las evaluaciones reportadas se hicieron sin instrucción de ruta.
- Licencia: NVIDIA Open Model License, con posibles restricciones para uso comercial; debe revisarse el archivo `LICENSE` antes de cualquier despliegue.
- Dependencia del código upstream de Alpamayo-1.5 para la inferencia, además del paquete `ishinca`.
- Longitud de contexto no documentada; la generación de texto se limita a 256 tokens en el ejemplo.
- Sin datos publicados de latencia, throughput ni requisitos mínimos de GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suukim/Ishinca-4B
- Variante DART75: https://huggingface.co/suukim/Ishinca-4B-DART75
- Variante DART50: https://huggingface.co/suukim/Ishinca-4B-DART50
- Repositorio de código (Apache-2.0): https://github.com/kimsunguk0/Ishinca
- Modelo profesor: https://huggingface.co/nvidia/Alpamayo-1.5-10B
- Backbone base: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset de referencia: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles
- Paper referenciado (arXiv:2511.00088): https://arxiv.org/abs/2511.00088
