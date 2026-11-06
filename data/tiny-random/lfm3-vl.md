# tiny-random/lfm3-vl

## Resumen

`tiny-random/lfm3-vl` es un modelo de prueba y depuración derivado de `LiquidAI/LFM3-VL-2B`, un modelo multimodal de tipo image-text-to-text de la familia LFM3 de LiquidAI. No es un modelo entrenado ni utilizable en producción: se trata de una inicialización aleatoria con arquitectura reducida, publicada por la organización `tiny-random` con el objetivo de validar la carga del modelo en Transformers, el pipeline de procesamiento de imagen y vídeo, y el código personalizado asociado a la arquitectura LFM3-VL.

El modelo conserva la estructura arquitectónica del original (backbone de texto híbrido con capas convolucionales y de atención, torre de visión con RoPE axial, proyector multimodal, normas sandwich, RMSNorm sobre QK y compuerta sigmoide en la cabeza de salida) pero reduce drásticamente las dimensiones: 10 capas de texto frente a 24, anchura oculta de 64 frente a 2.048, y 13,81 millones de parámetros frente a los 1.920 millones del modelo base. La longitud máxima de contexto se mantiene en 128.000 tokens y el vocabulario en 128.000 filas con embeddings atados.

Su relevancia es exclusivamente de ingeniería: sirve como fixture ligero (27,6 MB en BF16) para tests de integración de Transformers con entradas de imagen y vídeo, y para verificar que el código remoto incluido (`trust_remote_code=True`) se ejecuta correctamente en CUDA con la ruta de convolución corta implementada en Triton. No debe confundirse con un modelo funcional de la familia LFM3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (texto con capas conv y full/sliding attention; visión con capas conv y full attention; proyector MLP) |
| Parametros totales | 13.810.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (texto) |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), código Python con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El backbone de texto sigue el diseño LFM3: un ciclo de tipos de capa compuesto por un prefijo de dos capas convolucionales seguido de ciclos full/conv/sliding/conv. En este repositorio se mantienen 10 capas con dos ciclos completos, anchura oculta de 64 y anchura MLP de 128. La atención usa 16 cabezas Q y 4 cabezas KV con dimensión de cabeza 32 (ratio 4:1, pensado para tensor parallelism de grado 4), y RoPE dual para capas full y sliding. Se incluyen normas sandwich, RMSNorm sobre Q y K, y una compuerta sigmoide en la cabeza de salida. El vocabulario es de 128.000 filas con embeddings atados.

La torre de visión consta de 6 capas con prefijo conv/conv y dos ciclos full/conv, anchura oculta de 256 y MLP de 640, 8 cabezas Q y 4 KV con dimensión 32, parches de 16, parche temporal de 2, fusión espacial de 2 y RoPE axial con theta 1e6. El proyector multimodal es un MLP con capa oculta de 128 y factor de downsample de 2. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque el modelo es de inicialización aleatoria y no ha sido entrenado.

## Capacidades

- El modelo no tiene capacidades funcionales reales: sus pesos son aleatorios y las salidas no son coherentes.
- Soporta el pipeline `image-text-to-text` a nivel de interfaz: acepta imágenes y vídeo predecodificado con metadatos (`VideoMetadata`) y produce logits finitos.
- Sirve como fixture para validar la carga de código remoto (`trust_remote_code=True`) y la ruta de convolución corta en Triton sobre CUDA.
- Permite probar el procesador multimodal (`AutoProcessor`) con plantillas de chat y el flag `enable_thinking=False`.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente ni multilingüismo verificables.
- No se ha validado con backends de serving (vLLM, TGI, llama.cpp); el autor lo indica explícitamente.

## Casos de uso

- Tests de integración en Transformers: usar el modelo como fixture ligero de 27,6 MB para verificar que `AutoModelForImageTextToText` carga arquitecturas LFM3-VL con código remoto en CI.
- Validación de pipelines multimodales: comprobar que el procesador acepta simultáneamente una imagen y cuatro fotogramas de vídeo con `VideoMetadata` correcta y genera tensores `pixel_values` y `pixel_values_videos` no vacíos.
- Depuración de la ruta Triton de convolución corta: ejecutar el modelo en CUDA para validar que la implementación del kernel no rompe la propagación hacia delante.
- Pruebas de compatibilidad de versiones de Transformers: detectar regresiones en la carga de modelos con `trust_remote_code=True` y en la API de `apply_chat_template` con `processor_kwargs`.
- Verificación de formas y dimensiones: comprobar ratios Q/KV, dimensiones de cabeza y ciclos de capas en entornos de tensor parallelism (TP=4) sin coste de memoria.
- Benchmarking de infraestructura de test: medir tiempos de carga y ejecución de un modelo multimodal mínimo para calibrar suites de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (27,6 MB de pesos más activaciones y caché KV); el contexto de 128.000 tokens puede incrementar el uso de memoria de forma notable si se llena.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para la ruta Triton de convolución corta; el ejemplo del autor usa `.cuda()` sin especificar modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en iGPU con suficiente memoria unificada.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"`; no se ha validado vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-random/lfm3-vl | 13,81 M | 128.000 | Multimodal (imagen+vídeo+texto) | no disponible | Test y depuración |
| LiquidAI/LFM3-VL-2B | 1,92 B | 128.000 | Multimodal (imagen+vídeo+texto) | no disponible | Producción |
| tiny-random/lfm3 | no disponible | 128.000 | Texto | no disponible | Test y depuración |
| tiny-random/lfm2 | no disponible | no disponible | Texto | no disponible | Test y depuración |

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce texto ni descripciones coherentes; cualquier salida es ruido estadístico.
- No ha sido entrenado ni ajustado, por lo que no tiene sesgos medibles pero tampoco conocimiento alguno.
- No apto para uso comercial ni para producción bajo ninguna circunstancia.
- La licencia no está declarada en el repositorio; hay que remitirse a la del modelo base `LiquidAI/LFM3-VL-2B` para cualquier uso derivado.
- El código remoto incluido debe auditarse antes de ejecutarlo en entornos no confiables (`trust_remote_code=True`).
- La ruta de convolución corta requiere CUDA y Triton; no hay validación en CPU ni en backends de serving.
- El contexto nominal de 128.000 tokens no implica que el modelo lo aproveche, dado que no ha sido entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/tiny-random/lfm3-vl
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Backbone de texto de referencia: https://huggingface.co/tiny-random/lfm3
- Predecesor del backbone: https://huggingface.co/tiny-random/lfm2
