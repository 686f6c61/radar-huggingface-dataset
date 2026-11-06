# yujiepan/minicpm-ocr-1.0-tiny-random

## Resumen

`yujiepan/minicpm-ocr-1.0-tiny-random` es un checkpoint reducido y con pesos inicializados de forma aleatoria, derivado de `openbmb/MiniCPM-OCR-1.0`. No es un modelo funcional: su propósito es servir como fixture de pruebas y depuración para pipelines de carga, tokenización, procesado de imagen y generación con la arquitectura MiniCPM-OCR dentro de la librería `transformers`. Lo publica el usuario `yujiepan` y conserva la estructura arquitectónica del modelo base, pero con dimensiones internas drásticamente recortadas.

El checkpoint contiene 7,58 millones de parámetros en BF16 (15,18 MB), frente a los 1.300 millones del modelo original (2,60 GB). Mantiene sin embargo elementos clave de la arquitectura: vocabulario de 248.100 filas con embeddings atados, atención híbrida con ciclos de tres capas lineales y una capa de atención completa, M-RoPE con secciones 11/11/10 y factor parcial 0,25, y una torre visual con downsampling 4x. La reducción afecta a la profundidad (8 capas frente a 24), el ancho oculto (16 frente a 1.024) y el ancho del MLP (32 frente a 3.584).

Su relevancia es práctica para desarrolladores que necesitan validar integraciones con MiniCPM-OCR sin descargar el modelo completo ni requerir hardware significativo. Al estar generado automáticamente, no produce salidas útiles de OCR: cualquier texto generado es ruido estadístico. La licencia no está declarada en el repositorio, lo que impide asumir términos de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM-OCR (transformer híbrido con atención lineal y atención completa, más torre visual) |
| Parametros totales | 7,58 M (BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, `model.safetensors`, 15,18 MB) |

## Arquitectura y entrenamiento

El modelo replica el esqueleto de MiniCPM-OCR 1.0: un backbone con atención híbrida organizada en ciclos de tres capas de atención lineal seguidas de una capa de atención completa. En este checkpoint se conservan dos ciclos completos (8 capas), con un ancho oculto de 16 y MLP de 32. La configuración de atención mantiene 8 cabezas de consulta, 2 cabezas KV y dimensión de cabeza 256, además de 16 cabezas clave/valor lineales de dimensión 128. La torre visual consta de 4 capas con ancho 128 y un merger insertado tras la capa 2, con downsampling visual 4x. El vocabulario de 248.100 filas se mantiene con embeddings y cabeza de salida atados, por lo que el checkpoint contiene una única tabla BF16.

No hay entrenamiento: los pesos son inicializaciones aleatorias. El autor documenta que la ruta de atención lineal de Qwen3.5 requiere CUDA y Triton, y que el ejemplo público se verificó en una NVIDIA A800-SXM4-80GB con `transformers[torch]>=5.21.0`. El repositorio incluye los scripts de generación (`.meta/create_model.py`), el log de estructura (`.meta/model.log`) y el entorno (`.meta/env.json`). El propio autor indica que el repositorio fue generado con DeepSeek-V4.1-Flash.

## Capacidades

- Carga y ejecución de la arquitectura MiniCPM-OCR en `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Procesado de entradas multimodales imagen-texto: acepta imágenes RGB y prompts de texto en formato conversacional con `apply_chat_template`.
- Validación de la ruta de atención lineal (requiere CUDA y Triton) y de la atención completa con `attn_implementation="sdpa"`.
- Verificación de la integración de M-RoPE con secciones 11/11/10 y factor parcial 0,25.
- Comprobación del pipeline de downsampling visual 4x y del merger tras la capa 2.
- Generación de tokens con `model.generate`, útil para tests de formas de salida y decodificación, no para contenido real.
- No soporta OCR funcional, tool calling, agentes, razonamiento multilingüe ni ninguna capacidad semántica: los pesos aleatorios no codifican conocimiento.

## Casos de uso

- Test de integración en CI: cargar el checkpoint en un job de integración continua para verificar que la versión de `transformers`, el `AutoProcessor` y el `AutoModelForImageTextToText` resuelven correctamente la arquitectura MiniCPM-OCR sin descargar 2,60 GB.
- Validación de pipelines de preprocesado de imagen: comprobar que el downsampling 4x, el `max_slice_nums` y el `use_image_id` producen tensores con las formas esperadas antes de pasar al modelo real.
- Depuración de la ruta de atención lineal: al requerir CUDA y Triton, sirve para aislar problemas de compilación de kernels y de selección de backend sin la sobrecarga del modelo completo.
- Pruebas de compatibilidad de versiones: verificar que actualizaciones de `transformers` no rompen la carga de checkpoints con embeddings atados y vocabulario de 248.100 filas.
- Desarrollo de wrappers y servidores de inferencia: validar el contrato de entrada/salida (mensajes con imagen y texto, `return_dict`, `return_tensors`) en endpoints compatibles antes de conectar el modelo real.
- Benchmarking de infraestructura: medir tiempos de carga, asignación de memoria y overhead del procesador con un artefacto de 15 MB, aislando el coste del runtime del coste del modelo.
- Pruebas de regresión de tokenizer: comprobar que el vocabulario y los tokens especiales se mantienen estables entre versiones del modelo base y del processor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios, cualquier métrica de calidad (MMLU, OCRBench, etc.) sería irrelevante y no se reporta.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en BF16 (7,58 M parámetros, 15,18 MB de pesos); el grueso del consumo proviene de activaciones y del procesador de imagen.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y Triton para la ruta de atención lineal; el autor verificó en A800-SXM4-80GB, pero el tamaño no exige ese hardware.
- Cabe en GPU de consumo: sí, en cualquier RTX con CUDA; también es viable en CPU para pruebas de carga, aunque la ruta de atención lineal documentada requiere CUDA.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` (verificado); no hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; el cuello de botella esperado es el procesado de imagen y el arranque del runtime, no la computación del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yujiepan/minicpm-ocr-1.0-tiny-random` | 7,58 M | no disponible | Fixture de test y depuración | no disponible | Hugging Face, 0 descargas |
| `openbmb/MiniCPM-OCR-1.0` | 1,30 B | no disponible | OCR real sobre documentos | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| `yujiepan/moe-tiny-random` | ~0,3 B (medido) | no disponible | Fixture de test para arquitecturas MoE | no disponible | Hugging Face |
| `yujiepan/tiny-random` | no disponible | no disponible | Fixture de test genérico | no disponible | Hugging Face |

La comparación relevante es con el modelo base: este checkpoint conserva la interfaz y la estructura, pero no la funcionalidad. Frente a otros `tiny-random` del mismo autor, se distingue por incluir torre visual y atención híbrida, lo que lo hace útil específicamente para pipelines imagen-texto.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no realiza OCR ni genera texto coherente. Cualquier salida debe tratarse como ruido.
- No debe desplegarse en producción ni evaluarse como sustituto de `openbmb/MiniCPM-OCR-1.0`.
- La licencia no está declarada en el repositorio; no se puede asumir uso comercial sin consultar al autor y al modelo base.
- La ruta de atención lineal requiere CUDA y Triton, lo que limita su ejecución en CPU y en entornos sin esas dependencias.
- El repositorio tiene 0 descargas y 0 likes, y fue generado automáticamente: no hay garantía de mantenimiento ni de estabilidad de la API.
- El tamaño del repositorio aparece como 0,0 GB en los metadatos, aunque el archivo de pesos ocupa 15,18 MB; posible inconsistencia de indexación.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no ha habido entrenamiento.
- El checkpoint depende de `transformers[torch]>=5.21.0`; versiones anteriores pueden no cargar la arquitectura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yujiepan/minicpm-ocr-1.0-tiny-random
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
- Referencia externa detectada en la búsqueda: https://50gramx.com/inferences (menciona variantes `tiny-random` del mismo autor; no es documentación oficial del modelo)
