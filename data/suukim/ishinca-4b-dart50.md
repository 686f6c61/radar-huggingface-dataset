# suukim/Ishinca-4B-DART50

## Resumen

Ishinca-4B-DART50 es un modelo visión-lenguaje-acción (VLA) de 4.228 millones de parámetros orientado a conducción autónoma, desarrollado por Sunguk Kim como trabajo de investigación. Se obtiene por destilación del modelo profesor NVIDIA Alpamayo-1.5-10B sobre un backbone inicializado desde NVIDIA Cosmos-Reason2-2B, que a su vez sigue la arquitectura Qwen3-VL-2B. El modelo predice trayectorias de conducción (64 waypoints a 10 Hz, equivalentes a 6,4 segundos) a partir de cuatro cámaras y un historial de estado del vehículo, y opcionalmente genera texto de razonamiento causal (*Chain-of-Causation*).

La variante DART50 aplica poda de tokens visuales mediante la técnica DART con una ratio de retención del 50 %, reduciendo la entrada de 2.880 a 1.440 tokens de imagen por muestra. Esto disminuye el coste de prefill y de caché KV, a cambio de una tendencia no significativa hacia más colisiones atribuibles al vehículo en bucle cerrado. La poda no está codificada en los pesos: la aplica el código de inferencia mediante la opción `dart_keep`.

El interés del modelo reside en su enfoque de destilación pura: todos los objetivos de entrenamiento provienen del profesor, sin mezclar trayectorias ground-truth. Es un modelo de investigación explícitamente no destinado a producción, con licencia NVIDIA Open Model License y soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo Qwen3-VL-2B (28 capas, hidden 2048, vision tower de 24 capas con DeepStack en capas 5/11/17) + action expert de 28 capas (hidden 2048, intermediate 8256, 16 cabezas x 128) con atención no causal sobre la caché KV del prefijo VLM |
| Parametros totales | 4.228.148.226 (4,23 B): VLM 2,45 B (incluye vision tower 0,41 B, embeddings y lm_head) + action expert y proyecciones 1,77 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (`model.safetensors`, 947 tensores, bf16) |

## Arquitectura y entrenamiento

El modelo combina un backbone de visión-lenguaje con un experto de acción. El backbone sigue la arquitectura Qwen3-VL-2B: 28 capas, dimensión oculta 2048, torre visual de 24 capas con parche 16 y merge 2, y DeepStack en las capas 5, 11 y 17. El vocabulario es de 155.685 tokens, con los tokens de trayectoria de Alpamayo añadidos; el tokenizador difiere del de la release oficial de Alpamayo y se incluye en `backbone/`. El experto de acción (AE28) tiene 28 capas, hidden 2048, intermediate 8256 y 16 cabezas de 128 dimensiones, con atención no causal sobre la caché KV del prefijo VLM. Sus capas se inicializaron desde las capas del experto del profesor según `round(i*35/27)` y se entrenaron con *flow matching* sobre las acciones del profesor.

La destilación se realizó desde NVIDIA Alpamayo-1.5-10B, con todos los objetivos provenientes del profesor y sin mezclar trayectorias ground-truth. La entrada consiste en 4 cámaras x 4 fotogramas (front-wide, front-tele, cross-left, cross-right) a 320x576 tras el procesado, un historial de ego de 16 pasos y, opcionalmente, una instrucción de ruta en formato `<command> in <distance> meters` (por ejemplo, `"turn left in 20 meters"`). Aproximadamente el 21 % de las muestras de entrenamiento llevaban instrucción de ruta (go straight 11,5 %, turn right 4,9 %, turn left 4,6 %); estas instrucciones fueron creadas por el autor y no forman parte del dataset PhysicalAI-AV ni de anotaciones de NVIDIA. La salida son 64 waypoints a 10 Hz (6,4 s) en espacio de acción unicycle aceleración/curvatura, igual que Alpamayo 1.5, más texto opcional de Chain-of-Causation.

La innovación destacable es la poda DART de tokens visuales con ratio de retención del 50 %, que reduce la entrada a 1.440 tokens de imagen por muestra. La poda la aplica el código de inferencia (opción `dart_keep`), no los pesos, de modo que ejecutar un checkpoint DART sin poda o Ishinca-4B con poda no corresponde a la configuración evaluada.

## Capacidades

- Predicción de trayectorias de conducción: 64 waypoints a 10 Hz (6,4 s) en espacio de acción unicycle aceleración/curvatura.
- Procesamiento multimodal de 4 cámaras x 4 fotogramas (front-wide, front-tele, cross-left, cross-right) a 320x576.
- Uso de historial de ego de 16 pasos (posición y rotación).
- Generación opcional de texto de razonamiento causal (*Chain-of-Causation*) junto a la trayectoria.
- Seguimiento opcional de instrucciones de ruta en lenguaje natural (`nav_text` / `--nav-text`) con comandos `go straight`, `turn left`, `turn right` y distancia entera.
- Poda configurable de tokens visuales en inferencia (variantes sin poda, DART75 y DART50).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni otras capacidades generales de texto.

## Casos de uso

- Investigación en destilación de modelos VLA: el modelo sirve como caso de estudio de destilación de un profesor de 10B a un estudiante de 4B con objetivos exclusivamente del profesor, útil para analizar qué se pierde y qué se conserva en el proceso.
- Evaluación de poda de tokens visuales: las tres variantes (sin poda, DART75, DART50) permiten medir el compromiso entre coste de prefill/caché KV y calidad de conducción en bucle cerrado con AlpaSim.
- Simulación en bucle cerrado: integrable en AlpaSim para generar planes de trayectoria y texto de razonamiento, con evaluación de colisiones atribuibles y casos de fallo.
- Análisis de razonamiento causal en conducción: la salida opcional de Chain-of-Causation permite estudiar la interpretabilidad de las decisiones de planificación del modelo.
- Estudio de seguimiento de instrucciones de navegación: el soporte de `nav_text` permite investigar la influencia de instrucciones de ruta en la trayectoria predicha, aunque las evaluaciones publicadas se hicieron sin instrucción.
- Base para experimentos de inicialización: al partir de Cosmos-Reason2-2B y usar el tokenizador propio en `backbone/`, sirve como punto de partida para fine-tuning en tareas de robótica y conducción.
- Comparación de arquitecturas VLM + action expert: el diseño con atención no causal sobre la caché KV del prefijo VLM es replicable para estudiar alternativas de acoplamiento entre percepción y acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación en bucle cerrado con AlpaSim y remite a la sección de Evaluation para cifras agregadas y casos de fallo, pero no incluye tablas numéricas de MMLU, HumanEval, GSM8K ni métricas de conducción en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,23 B parámetros en bfloat16, los pesos ocupan aproximadamente 8,5 GB (tamaño del repo); a esto hay que sumar la caché KV del prefijo VLM y las activaciones, por lo que se requiere margen adicional.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. Los pesos en bf16 (unos 8,5 GB) podrían caber en GPUs con 16 GB o más, pero no se documenta ningún requisito oficial ni se han publicado pruebas.
- Opciones de despliegue: el modelo se ejecuta mediante el código propio `ishinca` (repositorio GitHub con licencia Apache-2.0) junto con el código de inferencia upstream de Alpamayo-1.5. El cargador `ishinca.load_ishinca` resuelve `./backbone` relativo a la carpeta del checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La variante DART50 se presenta como la de menor coste de prefill y caché KV de la familia, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens de imagen | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishinca-4B-DART50 (este) | 4,23 B | 1.440 (DART 50 %) | no disponible | nvidia-open-model-license | Hugging Face + GitHub |
| Ishinca-4B-DART75 | 4,23 B | 2.160 (DART 75 %) | no disponible | nvidia-open-model-license | Hugging Face |
| Ishinca-4B | 4,23 B | 2.880 (sin poda) | no disponible | nvidia-open-model-license | Hugging Face |
| NVIDIA Alpamayo-1.5-10B (profesor) | 10 B | no disponible | no disponible | no disponible en la información | Hugging Face |
| NVIDIA Cosmos-Reason2-2B (backbone) | 2 B | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La model card indica únicamente que DART50 presenta la menor huella de prefill/KV y una tendencia no significativa hacia más colisiones atribuibles en bucle cerrado.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo declara explícitamente como no apto para producción como sistema de conducción.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; el modelo genera texto opcional de Chain-of-Causation que podría no reflejar fielmente el proceso de planificación.
- Limitaciones de idioma: solo inglés.
- Restricciones de licencia: NVIDIA Open Model License; es necesario revisar `LICENSE` y `NOTICE.md` antes de cualquier uso comercial.
- La poda DART no está en los pesos: usar un checkpoint DART sin la poda correspondiente, o Ishinca-4B con poda, invalida la configuración evaluada.
- Las instrucciones de ruta fueron creadas por el autor, no forman parte del dataset PhysicalAI-AV ni de anotaciones de NVIDIA, y no se redistribuyen; todas las evaluaciones publicadas se hicieron sin instrucción de ruta (sin CFG-nav).
- El tokenizador difiere del de la release oficial de Alpamayo; hay que usar el incluido en `backbone/`.
- El backbone no tiene pesos separados: todo está en `model.safetensors`, y el cargador resuelve `./backbone` respecto a la carpeta del checkpoint, lo que exige mantener la estructura de directorios.
- DART50 muestra una tendencia, no significativa, hacia más colisiones atribuibles al vehículo en bucle cerrado; conviene tratarlo como compromiso coste/calidad.
- Requiere el código de inferencia upstream de Alpamayo-1.5 además del paquete `ishinca`, lo que añade dependencias externas al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suukim/Ishinca-4B-DART50
- Variante sin poda: https://huggingface.co/suukim/Ishinca-4B
- Variante DART75: https://huggingface.co/suukim/Ishinca-4B-DART75
- Código, entrenamiento y evaluación: https://github.com/kimsunguk0/Ishinca
- Modelo profesor: https://huggingface.co/nvidia/Alpamayo-1.5-10B
- Backbone: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles
- Paper referenciado (arXiv:2511.00088): https://arxiv.org/abs/2511.00088
- Vídeo de demostración: https://huggingface.co/suukim/Ishinca-4B/resolve/main/assets/ishinca_teaser.mp4
