# tiny-random/lfm3-omni

## Resumen

`tiny-random/lfm3-omni` es un checkpoint de depuración (debug) publicado en Hugging Face por el usuario `tiny-random`. No es un modelo entrenado ni pensado para uso real: se trata de una versión de dimensiones reducidas y pesos inicializados aleatoriamente, derivada del modelo `LiquidAI/LFM3-Omni-2B`. Su propósito es servir como fixture reproducible para probar el pipeline `any-to-any` de Transformers (entrada y salida de texto, imagen, vídeo y audio) sin necesidad de descargar los aproximadamente 4,5 GB del checkpoint original.

El modelo conserva la topología del LFM3-Omni original (backbone de texto con capas full/conv/sliding, encoder de audio, encoder de visión, decoder de profundidad para los codebooks de audio y el códec LiquidCodec), pero con anchuras y número de capas drásticamente reducidos. El resultado son unos 13,4 millones de parámetros totales en BF16, con un vocabulario de 128.000 entradas que domina el recuento. La geometría de texto y visión sigue la del también tiny `tiny-random/lfm3-vl`.

Es relevante únicamente en el contexto de desarrollo e integración: permite validar que un cambio en el procesador, en el cargador `trust_remote_code` o en el códec de audio funciona correctamente antes de lanzar pruebas contra el modelo grande. No debe confundirse con un modelo utilizable en producción ni evaluarse por su calidad de salida, ya que sus pesos no han sido entrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3-Omni (backbone de texto híbrido full/conv/sliding + encoder de audio + encoder de visión + decoder de profundidad + códec LiquidCodec) |
| Parámetros totales | 13.431.424 (13,91M BF16 + 1,28K F32) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en BF16; ventana ISTFT del códec en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors 26,9 MB + audio_tokenizer/model.safetensors 1,0 MB) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura multimodal de LFM3-Omni a escala reducida. El backbone de texto tiene 10 capas organizadas como prefijo de dos convoluciones seguido de dos ciclos completos de capas full/conv/sliding/conv, con anchura oculta de 64 y MLP de 128, 16 cabezas de query y 4 de clave-valor con dimensión de cabeza 32. El encoder de audio consta de 6 capas con anchura 64 (dos ciclos conv/conv/full), mantiene los 128 bins mel, stride 8 y ventana de 32 frames del original. El encoder de visión tiene 6 capas con anchura 128 y 4 cabezas de query frente a 2 de clave-valor, con patch de 16, patch temporal de 2 y merge de 2. El decoder de profundidad conserva 3 capas con anchura 32, 12 codebooks de tamaño 2.017 y máscara MaskGIT [4, 4, 4].

El códec LiquidCodec mantiene los contratos de audio del original: frecuencia de muestreo de 24 kHz, 1.920 muestras por frame, STFT con n_fft 1.280, hop 320 y apilado de 6 frames, niveles FSQ [8, 7, 6, 6] y 12 codebooks, con backbone LFM3 de 4 + 4 capas y anchura 64. El vocabulario de 128.000 filas está atado (tied) a la matriz de salida. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque los pesos son aleatorios. La única modificación de código respecto al original es permitir que las dimensiones del backbone LFM3 del códec se lean de su configuración, manteniendo los valores por defecto originales.

## Capacidades

- Generación de texto condicionada por imagen, audio y vídeo (pipeline `any-to-any`), con `generation_mode="text"`.
- Síntesis de voz (TTS) mediante `generation_mode="audio"`, con parámetros `audio_temperature` y `audio_repetition_penalty`, y decodificación a waveform de 24 kHz a través del LiquidCodec incluido.
- Procesamiento de audio de entrada a 16 kHz mediante el feature extractor incluido.
- Procesamiento de imagen con patches de 16x16 y vídeo con patch temporal de 2 y merge de 2.
- Soporte de plantilla de chat conversacional vía `apply_chat_template` con contenido multimodal estructurado.
- Carga con `trust_remote_code=True` y `attn_implementation="sdpa"`.
- Ruta de convolución corta en Triton que requiere CUDA.
- No dispone de capacidades reales de razonamiento, código, matemáticas ni tool calling: al no estar entrenado, sus salidas son arbitrarias.

## Casos de uso

- Pruebas de integración del pipeline `any-to-any` de Transformers: sirve para verificar que el procesador acepta entradas de imagen, audio y vídeo simultáneas y devuelve tensores con las formas esperadas, sin descargar el checkpoint de 4,48 GB.
- Validación de cambios en el procesador multimodal: al fijar la geometría (patches, mel bins, stride, ventana), permite comprobar de forma determinista que una modificación en el preprocesado no rompe las dimensiones de `input_features`, `pixel_values` ni `pixel_values_videos`.
- Depuración del códec LiquidCodec: el repositorio incluye `audio_tokenizer/` como componente separado, lo que facilita probar la ruta de codificación y decodificación de audio (STFT, FSQ, ISTFT) de forma aislada.
- CI/CD de la librería Transformers: al ser un modelo de 27,88 MB en dos ficheros safetensors, encaja en suites de tests que se ejecutan en cada pull request con límites de tiempo y ancho de banda.
- Verificación de la ruta Triton de convolución corta: permite comprobar en una GPU CUDA que el kernel se compila y produce formas coherentes antes de pasar al modelo completo.
- Reproducción de ejemplos de la model card: el snippet incluido (pregunta hablada + imagen + cuatro frames de vídeo, respuesta en texto y posterior TTS) se puede ejecutar tal cual para validar el entorno.
- Desarrollo de herramientas de perfilado de memoria: con 13,9M parámetros en BF16, sirve para medir overhead de carga, inicialización del códec y del procesador sin la presión de memoria del modelo de 2,24B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los pesos (27,88 MB de safetensors más buffers y activaciones); el grueso del consumo proviene de las activaciones del procesador y del códec, no del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA para la ruta Triton de convolución corta; una RTX 4090 o superior no aporta ventaja significativa por el tamaño del modelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de portátil con 4 GB o más.
- Opciones de despliegue: carga vía `transformers` con `AutoModelForImageTextToText` y `trust_remote_code=True`; no se declara validación con vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors con código personalizado complica su uso en backends de serving estándar.
- Latencia y throughput: no disponibles; al ser un modelo aleatorio, las métricas de calidad no aplican y las de velocidad dependen del hardware y del códec.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-random/lfm3-omni | 13,43M | no disponible | texto, imagen, vídeo, audio (in/out) | no disponible | Hugging Face, `trust_remote_code` |
| LiquidAI/LFM3-Omni-2B | 2,24B (BF16) | no disponible | texto, imagen, vídeo, audio (in/out) | no disponible | Hugging Face (modelo base) |
| tiny-random/lfm3-vl | no disponible | no disponible | texto, imagen, vídeo | no disponible | Hugging Face (referencia de geometría) |

La comparación relevante es con el modelo base `LiquidAI/LFM3-Omni-2B`: misma topología y mismos contratos de audio y visión, pero con 2,24B de parámetros frente a 13,43M y pesos entrenados frente a aleatorios. `tiny-random/lfm3-vl` comparte la geometría de texto y visión, pero no incluye la rama de audio ni el códec.

## Limitaciones y advertencias

- Los pesos están inicializados aleatoriamente: las salidas de texto y audio no tienen ningún valor semántico ni utilidad práctica.
- No es apto para producción, evaluación de calidad ni comparación de capacidades; solo para pruebas de integración y depuración.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribución.
- Idiomas soportados no declarados.
- Longitud de contexto no declarada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- La ruta Triton de convolución corta requiere CUDA; en CPU puede no estar disponible o funcionar por una ruta alternativa no validada.
- No se declara validación con backends de serving (vLLM, TGI, llama.cpp, Ollama); el uso está pensado para `transformers`.
- El ejemplo de la model card usa `model_id="scratch/lfm3_omni"` en lugar del ID del repositorio, lo que puede requerir ajuste para ejecutarlo tal cual.
- El repositorio se creó y actualizó en noviembre de 2026 según los metadatos; conviene verificar que el código fijado sigue siendo compatible con la versión de Transformers en uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/lfm3-omni
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Modelo de referencia de geometría texto/visión: https://huggingface.co/tiny-random/lfm3-vl
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de creación: `.meta/env.json` (dentro del repositorio)
