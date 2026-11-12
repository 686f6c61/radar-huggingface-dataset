# suukim/Ishinca-4B-DART75

## Resumen

Ishinca-4B-DART75 es un modelo visión-lenguaje-acción (VLA) de 4,23 mil millones de parámetros orientado a la conducción autónoma, publicado por Sunguk Kim (usuario `suukim`) en Hugging Face. Se trata de un modelo destilado del profesor `nvidia/Alpamayo-1.5-10B` (10B) sobre una inicialización de backbone `nvidia/Cosmos-Reason2-2B`, cuya arquitectura sigue el diseño de Qwen3-VL-2B. El resultado es un estudiante de menos de la mitad de tamaño que conserva la capacidad de predecir trayectorias de conducción y generar texto de razonamiento causal (Chain-of-Causation).

La variante DART75 aplica poda de tokens visuales mediante la técnica DART con una ratio de retención del 75%, lo que reduce la entrada de imagen de 2.880 a 2.160 tokens por muestra. El objetivo es disminuir el coste de prefill y de caché KV en el escenario de inferencia de conducción, donde cada muestra implica 4 cámaras y 4 fotogramas temporales. El modelo genera 64 waypoints a 10 Hz (6,4 segundos de horizonte) en un espacio de acción de aceleración y curvatura de tipo unicycle, idéntico al del profesor Alpamayo 1.5.

Es relevante ahora porque ejemplifica la línea de destilación de modelos VLA grandes hacia tamaños desplegables en vehículo, combinando un backbone VLM estándar con un experto de acción entrenado por flow matching. No obstante, se trata de un modelo de investigación, no de un sistema de conducción listo para producción, y su licencia es la NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo Qwen3-VL-2B (28 capas, hidden 2048, torre visual de 24 capas, patch 16, merge 2, DeepStack en capas 5/11/17) + experto de acción AE28 (28 capas, hidden 2048, intermediate 8256, 16 cabezas x 128, atención no causal sobre la caché KV del prefijo VLM) |
| Parametros totales | 4.228.148.226 (4,23 B): VLM 2,45 B (incluye torre visual de 0,41 B, embeddings y lm_head) + experto de acción y proyecciones 1,77 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (model.safetensors, 947 tensores en bf16) |

## Arquitectura y entrenamiento

El modelo combina un backbone VLM tipo Qwen3-VL-2B con un experto de acción de 28 capas. El backbone procesa 4 cámaras (front-wide, front-tele, cross-left, cross-right) con 4 fotogramas cada una, a resolución 320x576 tras el procesamiento, más un historial de ego de 16 pasos y, opcionalmente, una instrucción de ruta en texto. El vocabulario es de 155.685 tokens, con los tokens de trayectoria de Alpamayo añadidos (el tokenizer difiere del de Alpamayo publicado, y se incluye en `backbone/`). El experto de acción se inicializa a partir de las capas del experto del profesor según `round(i*35/27)` y se entrena con flow matching sobre las acciones del profesor.

La destilación emplea como profesor a `nvidia/Alpamayo-1.5-10B` y como inicialización de backbone a `nvidia/Cosmos-Reason2-2B`. Todas las dianas de destilación provienen del profesor, sin mezclar trayectorias ground-truth en los objetivos. La innovación destacable es la poda de tokens visuales DART con ratio de retención del 75% (2.160 tokens de imagen por muestra en lugar de 2.880), aplicada por el código de inferencia mediante la opción `dart_keep`, no almacenada en los pesos. La salida son 64 waypoints a 10 Hz (6,4 s) en espacio de aceleración/curvatura unicycle, con texto opcional de Chain-of-Causation. Aproximadamente el 21% de las muestras de entrenamiento llevaban instrucción de ruta (go straight 11,5%, turn right 4,9%, turn left 4,6%), generadas por el autor y no parte del dataset PhysicalAI-AV.

## Capacidades

- Predicción de trayectorias de conducción: 64 waypoints a 10 Hz (6,4 s) en espacio de acción unicycle (aceleración y curvatura).
- Generación de texto de razonamiento causal (Chain-of-Causation) que acompaña a la trayectoria predicha.
- Procesamiento multimodal de 4 cámaras x 4 fotogramas con historial de ego de 16 pasos.
- Soporte de instrucciones de ruta opcionales en formato `<command> in <distance> meters`, con comandos `go straight`, `turn left`, `turn right` y distancia entera (por ejemplo, `"turn left in 20 meters"`).
- Poda de tokens visuales configurable en inferencia mediante DART (`dart_keep`), con variantes al 75% y 50% en la familia Ishinca.
- Muestreo de múltiples trayectorias (`num_traj_samples`) con parámetros de top-p y temperatura.
- Capacidades multilingües: únicamente inglés.
- No se documentan soporte de tool calling, function calling ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación en destilación de modelos VLA: el modelo sirve como estudiante de referencia para estudiar cómo se transfiere la capacidad de predicción de trayectorias de un profesor de 10B a un modelo de 4,23B, con scripts de entrenamiento y evaluación publicados en el repositorio del autor.
- Evaluación en simulación cerrada con AlpaSim: el modelo puede ejecutarse en bucle cerrado para medir planes de trayectoria, comparar rollouts y analizar casos de fallo, tal como se muestra en el vídeo teaser de la model card.
- Estudio de eficiencia de tokens visuales: las variantes DART75 y DART50 permiten comparar el impacto de reducir de 2.880 a 2.160 o 1.440 tokens de imagen sobre la calidad de la trayectoria y el coste de prefill/KV.
- Análisis de razonamiento causal en conducción: la generación de Chain-of-Causation permite inspeccionar qué factores considera el modelo al planificar, útil para investigación en interpretabilidad de sistemas VLA.
- Prototipado de planificación condicionada por ruta: con la opción `nav_text` se puede estudiar cómo responde el modelo a instrucciones de giro y distancia, aunque las evaluaciones publicadas se hicieron sin instrucción de ruta.
- Benchmarking de modelos de conducción autónoma: al compartir espacio de acción y formato de salida con Alpamayo 1.5, permite comparaciones controladas entre profesor y estudiante en el mismo pipeline de inferencia.
- Base para experimentos de poda de tokens en otros dominios VLA: la integración de DART en el código de inferencia es reutilizable para estudiar reducción de contexto visual en robótica y conducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación con números agregados y casos de fallo, pero no se incluyen tablas de métricas (MMLU, HumanEval, GSM8K ni métricas de conducción como desplazamiento o colisión) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,23 B parámetros en bfloat16, los pesos ocupan aproximadamente 8,5 GB (tamaño del repositorio), por lo que se necesita al menos esa cantidad más el espacio para activaciones, caché KV y procesamiento de 4 cámaras x 4 fotogramas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs con 16 GB o más de VRAM en bf16, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos (8,5 GB) sugiere que podría caber en GPUs de consumo con 12-16 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: el modelo requiere el código de inferencia propio (`ishinca.load_ishinca`) más el código upstream de Alpamayo-1.5. Se instala con `pip install git+https://github.com/kimsunguk0/Ishinca`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que DART75 reduce el coste de prefill y KV frente a la variante sin poda, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens de imagen | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishinca-4B-DART75 | 4,23 B | 2.160 (DART 75%) | no disponible | nvidia-open-model-license | Hugging Face (`suukim/Ishinca-4B-DART75`) |
| Ishinca-4B | 4,23 B | 2.880 (sin poda) | no disponible | nvidia-open-model-license | Hugging Face (`suukim/Ishinca-4B`) |
| Ishinca-4B-DART50 | 4,23 B | 1.440 (DART 50%) | no disponible | nvidia-open-model-license | Hugging Face (`suukim/Ishinca-4B-DART50`) |
| Alpamayo-1.5-10B (profesor) | 10 B | no disponible | no disponible | no disponible | Hugging Face (`nvidia/Alpamayo-1.5-10B`) |
| Cosmos-Reason2-2B (backbone) | 2 B (aprox.) | no disponible | no disponible | no disponible | Hugging Face (`nvidia/Cosmos-Reason2-2B`) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no un sistema de conducción listo para producción; la propia model card lo indica explícitamente.
- Solo soporta inglés.
- Las instrucciones de ruta (`nav_text`) fueron creadas por el autor, no forman parte del dataset PhysicalAI-AV ni son anotaciones de NVIDIA, y no se redistribuyen. Todas las evaluaciones publicadas se hicieron sin instrucción de ruta (sin CFG-nav).
- La poda DART se aplica en el código de inferencia, no en los pesos: ejecutar un checkpoint DART sin poda, o Ishinca-4B con poda, no corresponde a lo evaluado.
- El tokenizer difiere del de Alpamayo publicado; es necesario usar el incluido en `backbone/`.
- Licencia NVIDIA Open Model License: revisar las condiciones de uso comercial antes de cualquier despliegue productivo.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto más allá de lo indicado.
- Requiere el código de inferencia propio más el código upstream de Alpamayo-1.5; no hay soporte documentado para frameworks de despliegue estándar.
- Riesgo de alucinación en el texto de Chain-of-Causation: no se han publicado métricas de fidelidad de las explicaciones generadas.

## Enlaces

- Hugging Face: https://huggingface.co/suukim/Ishinca-4B-DART75
- Variante sin poda: https://huggingface.co/suukim/Ishinca-4B
- Variante DART50: https://huggingface.co/suukim/Ishinca-4B-DART50
- Profesor: https://huggingface.co/nvidia/Alpamayo-1.5-10B
- Backbone: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Repositorio de código: https://github.com/kimsunguk0/Ishinca
- Dataset: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles
- Paper (arXiv): https://arxiv.org/abs/2511.00088
- Vídeo teaser: https://huggingface.co/suukim/Ishinca-4B/resolve/main/assets/ishinca_teaser.mp4
