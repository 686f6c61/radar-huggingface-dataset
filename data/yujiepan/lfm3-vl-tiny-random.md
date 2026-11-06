# yujiepan/lfm3-vl-tiny-random

## Resumen

`yujiepan/lfm3-vl-tiny-random` es un modelo de prueba de inicialización aleatoria derivado de `LiquidAI/LFM3-VL-2B`, el modelo vision-lenguaje de Liquid AI. No es un modelo entrenado ni utilizable en producción: su propósito es servir como fixture de tests para validar la carga, el procesamiento multimodal y el paso forward de la arquitectura LFM3-VL dentro de Transformers, incluyendo imágenes y vídeo.

Conserva la estructura arquitectónica del modelo original (backbone de texto híbrido con capas full, conv y sliding, torre de visión con convoluciones depthwise y RoPE axial, proyector MLP con downsample) pero reduce drásticamente las dimensiones: 13,81 millones de parámetros frente a los 1,92 mil millones del modelo base, con anchos de hidden de 64 en texto y 256 en visión. Mantiene, sin embargo, el vocabulario completo de 128.000 filas con embedding tied y la longitud máxima de contexto de 128.000 tokens declarada por el autor.

Es relevante para desarrolladores que necesiten verificar implementaciones de inferencia multimodal (image-text-to-text, vídeo con metadatos temporales, atención con conv corta en Triton) sin incurrir en los requisitos de memoria de un modelo de 2B. El repositorio incluye la implementación upstream fijada para carga con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (texto con capas full/conv/sliding + torre de visión con convs depthwise), clase `lfm3_vl` |
| Parametros totales | 13.810.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (texto máximo declarado) |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), 27,6 MB en un único archivo |
| Capas de texto | 10 (prefijo de dos conv, después dos ciclos full/conv/sliding/conv) |
| Ancho hidden / MLP (texto) | 64 / 128 |
| Cabezas Q / KV / dim de cabeza (texto) | 16 / 4 / 32 |
| Capas de visión | 6 (prefijo de dos conv, después dos ciclos full/conv) |
| Ancho hidden / MLP (visión) | 256 / 640 |
| Cabezas Q / KV / dim de cabeza (visión) | 8 / 4 / 32 |
| Patch / patch temporal / merge espacial | 16 / 2 / 2 |
| Kernel conv depthwise (visión) | 3 x 3 |
| RoPE | axial en visión con theta 1e6; dual theta en texto (full/sliding) |
| Proyector MLP | hidden 128, factor de downsample 2 |
| Vocabulario | 128.000 filas, embedding tied |
| Precisión de almacenamiento | BF16 |

## Arquitectura y entrenamiento

El modelo replica el esqueleto de LFM3-VL a escala reducida. El backbone de texto alterna capas de atención completa, capas convolucionales y capas de atención deslizante, con un prefijo de dos capas convolucionales; los anchos de texto siguen la convención de `tiny-random/lfm3` y `tiny-random/lfm2` (hidden 64, MLP 128, diez capas). Se mantiene la ratio 4:1 entre cabezas Q y KV (16 Q, 4 KV) con dimensión de cabeza 32, pensada para tensor parallelism de grado 4, y se conservan los sandwich norms, QK RMSNorm y la puerta sigmoide de salida.

La torre de visión usa parches de 16x16 con patch temporal de 2 y merge espacial de 2, kernel depthwise de 3x3, RoPE axial con theta 1e6 y ratio 2:1 Q/KV (8 Q, 4 KV, dim 32, ancho 256). El proyector hacia el espacio de texto es un MLP con hidden 128 y downsample de 2. No hay entrenamiento: los pesos son aleatorios, generados por un script (`.meta/create_model.py`) y documentados en `.meta/model.log`. No se ha aplicado RLHF, DPO ni preentrenamiento de ningún tipo; tampoco se declaran datos de entrenamiento.

## Capacidades

- Paso forward multimodal completo: procesa simultáneamente una imagen y un vídeo (frames predecodificados) junto con texto en una misma conversación.
- Procesamiento de vídeo con `VideoMetadata` (total de frames, fps, índices de frames) para la ruta de conv corta en Triton.
- Generación de texto autoregresiva mediante `model.generate`, con logits finitos verificados en el ejemplo del autor.
- Plantilla de chat aplicada con `apply_chat_template` y conmutador `enable_thinking` en el procesador.
- Soporte de atención SDPA (`attn_implementation="sdpa"`) y de la ruta Triton para conv corta (requiere CUDA).
- No dispone de capacidades reales de razonamiento, código, matemáticas, tool calling ni multilingüismo: al ser pesos aleatorios, la salida generada es ruido estadístico.
- El ejemplo del autor no valida backends de serving; solo se cubre la carga en Transformers.

## Casos de uso

- Test de integración en Transformers: cargar el modelo con `trust_remote_code=True` y verificar que `AutoModelForImageTextToText` y `AutoProcessor` resuelven correctamente la clase `lfm3_vl` y sus dependencias.
- Validación de pipelines multimodales: comprobar que el procesador genera `pixel_values` y `pixel_values_videos` con las formas esperadas al mezclar imagen, vídeo y texto en un mismo mensaje.
- Pruebas de CI sin GPU de gama alta: con 27,6 MB de pesos, el modelo cabe en cualquier GPU consumer e incluso en CPU para el paso forward, lo que permite ejecutar tests de humo en runners modestos.
- Verificación de `VideoMetadata`: asegurar que la ruta de vídeo propaga correctamente `total_num_frames`, `fps` y `frames_indices` hasta la torre de visión.
- Desarrollo de kernels y atención: servir como caso de prueba para implementaciones de atención full/sliding con RoPE dual theta y para la conv corta en Triton, sin necesidad de un checkpoint de 2B.
- Comprobación de tensor parallelism: validar que la ratio 4:1 Q/KV y las dimensiones de cabeza 32 funcionan con TP=4 en un entorno de pruebas pequeño.
- Referencia de estructura para portar LFM3-VL a otros runtimes: inspeccionar el grafo de capas (prefijo conv, ciclos full/conv/sliding) en un modelo manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de calidad, latencia ni throughput; el modelo es de inicialización aleatoria y no está destinado a evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los pesos (27,6 MB); el consumo real lo dominan activaciones y el vocabulario de 128.000 filas en la cabeza de salida, por lo que conviene reservar al menos 2-4 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA para la ruta Triton de conv corta; el ejemplo del autor usa `.cuda()` sin especificar modelo.
- Cabe en GPU consumer: sí, en cualquier RTX con al menos 4 GB (por ejemplo RTX 3050, RTX 4060, RTX 4090).
- Despliegue: Transformers con `trust_remote_code=True` es la única ruta verificada. No hay validación de vLLM, llama.cpp, Ollama ni TGI; llama.cpp y Ollama no soportan esta arquitectura.
- Latencia y throughput: no disponibles.
- Nota: la ruta de conv corta en Triton requiere CUDA; en CPU solo funcionan las rutas alternativas de atención.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/lfm3-vl-tiny-random | 13,81 M | 128.000 (declarado) | Fixture de test, pesos aleatorios | no disponible | Hugging Face |
| LiquidAI/LFM3-VL-2B | 1,92 B (BF16) | 128.000 | Modelo vision-lenguaje real | no disponible en la informacion | Hugging Face |
| tiny-random/lfm3 | no disponible | no disponible | Fixture de test solo texto | no disponible | Hugging Face |
| tiny-random/lfm2 | no disponible | no disponible | Fixture de test solo texto | no disponible | Hugging Face |

La comparación relevante es con el modelo base: este repositorio reduce parámetros en un factor de ~139 y tamaño en disco de 3,84 GB a 27,6 MB, manteniendo la topología de capas pero no la calidad. Frente a `tiny-random/lfm3` y `tiny-random/lfm2`, añade la torre de visión y el proyector multimodal.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce texto coherente ni descripciones correctas de imágenes o vídeo; cualquier uso generativo es inválido.
- No es un modelo entrenado: no hay datos de entrenamiento, RLHF ni ajuste, por lo que no se pueden evaluar sesgos aprendidos, pero tampoco existe garantía de comportamiento.
- Licencia no disponible: no se puede asumir uso comercial; hay que consultar la licencia del modelo base `LiquidAI/LFM3-VL-2B` antes de cualquier redistribución.
- Idiomas no declarados: el vocabulario de 128.000 filas está presente, pero sin entrenamiento no hay soporte lingüístico real.
- Dependencia de `trust_remote_code=True`: la carga ejecuta código upstream fijado en el repositorio, lo que implica revisar y confiar en ese código antes de usarlo en entornos productivos.
- La ruta Triton de conv corta requiere CUDA; en CPU o en GPUs sin soporte la ejecución puede fallar o degradarse.
- No hay validación de backends de serving (vLLM, TGI, llama.cpp); no debe asumirse compatibilidad.
- El checkpoint se generó con una herramienta automatizada (GPT-6.1-Sol según la model card); conviene auditar `.meta/create_model.py` y `.meta/model.log` antes de confiar en la estructura.
- El contexto de 128.000 tokens es una declaración de configuración, no una capacidad verificada con pruebas de recuperación en contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujiepan/lfm3-vl-tiny-random
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Fixture de texto relacionado: https://huggingface.co/tiny-random/lfm3
- Fixture de texto relacionado: https://huggingface.co/tiny-random/lfm2
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
