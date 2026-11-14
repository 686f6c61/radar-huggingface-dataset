# voiceforever/parakeet-tdt-0.6b-v3-mlx-8bit

## Resumen

Parakeet-tdt-0.6b-v3-mlx-8bit es una conversión al formato MLX (Apple Silicon) y cuantización a 8 bits del modelo de reconocimiento automático del habla nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario voiceforever. El modelo original de NVIDIA emplea una arquitectura FastConformer con decodificador Transducer TDT (Token-and-Duration Transducer), diseñada específicamente para transcripción de audio con predicción conjunta de tokens y duraciones. Con 627.052.166 parámetros totales y un repositorio de 0,9 GB, esta versión permite ejecutar ASR de alta calidad en hardware Apple sin necesidad de GPU dedicada.

La relevancia de esta ficha radica en que el modelo base cubre 25 idiomas europeos (incluido el español) y está optimizado para inferencia local en Mac mediante la librería mlx. La cuantización a 8 bits reduce el peso del modelo aproximadamente a la mitad respecto a los pesos en punto flotante, manteniendo la arquitectura Transducer intacta. Es una opción práctica para desarrolladores que necesitan transcripción multilingüe en local, con privacidad de datos y sin depender de APIs en la nube.

La licencia CC-BY-4.0 del modelo base permite uso comercial con atribución, lo que lo hace atractivo para integrar en productos. No obstante, esta conversión concreta tiene un mantenimiento aparentemente mínimo (0 descargas, 0 likes en el momento de la consulta) y depende de scripts de terceros (animaslabs/mlx-models) para su conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador Transducer TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX), con group_size configurable en config.json |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX, cuantizado 8 bits) |

## Arquitectura y entrenamiento

El modelo base nvidia/parakeet-tdt-0.6b-v3 emplea una arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante downsampling de las secuencias de entrada, combinada con un decodificador Transducer de tipo TDT. El decodificador TDT predice conjuntamente el token de salida y su duración, lo que permite emisiones no autorregresivas por pasos de tiempo y mejora la eficiencia frente a los Transducers RNN-T clásicos. Esta versión concreta es una conversión a MLX con cuantización de 8 bits realizada con los scripts del repositorio animaslabs/mlx-models; no se ha reentrenado ni ajustado el modelo, por lo que hereda íntegramente el comportamiento del original.

Los datos de entrenamiento del modelo base, según los metadatos disponibles, incluyen los conjuntos nvidia/Granary y nemo/asr-set-3.0. No se dispone en la información proporcionada del número exacto de horas de audio, la composición detallada del dataset ni si hubo etapas de RLHF o ajuste fino supervisado adicionales. Tampoco se documentan innovaciones específicas de decodificación especulativa o atención lineal más allá de las propias del Transducer TDT.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos, incluidos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, rumano, sueco y ruso, entre otros.
- Transcripción de audio a texto con predicción conjunta de tokens y duraciones mediante el decodificador TDT.
- Inferencia local en Apple Silicon a través de la librería MLX, con pesos cuantizados a 8 bits.
- Ejecución mediante la API `model.transcribe("audio.wav")` que devuelve un objeto con el texto transcrito.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking; se trata de un modelo puramente ASR.
- El soporte multilingüe está limitado a los 25 idiomas listados; no se indica cobertura de otras familias lingüísticas.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo permite convertir audio a texto en un Mac sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad y para reuniones multilingües dentro del conjunto de idiomas soportados.
- Subtitulado automático de vídeo: se puede integrar en un pipeline que extraiga el audio y genere subtítulos en español, inglés, francés o alemán, aprovechando la cobertura de 25 idiomas europeos para contenido multiplataforma.
- Asistentes de voz para aplicaciones de escritorio en macOS: al ejecutarse con MLX sobre Apple Silicon, se puede integrar en apps nativas que necesiten dictado por voz con baja dependencia de servicios externos.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones para su posterior indexación y búsqueda, con la ventaja de que el modelo corre en hardware de sobremesa sin GPU dedicada.
- Investigación en lingüística computacional: generación de corpus transcritos en múltiples idiomas europeos para estudios comparativos, con la licencia CC-BY-4.0 que permite redistribución con atribución.
- Prototipado rápido de productos de voz: gracias a la API simple `transcribe()` y a la cuantización de 8 bits, se puede validar una idea de producto de ASR en un Mac antes de invertir en infraestructura GPU.
- Accesibilidad: transcripción en tiempo casi real de audio para personas con discapacidad auditiva en aplicaciones de escritorio, siempre que el hardware Apple Silicon disponible cumpla los requisitos de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser una conversión MLX para Apple Silicon, el modelo utiliza memoria unificada en lugar de VRAM dedicada. Con 627 millones de parámetros y cuantización de 8 bits, el peso de los pesos ronda los 0,6-0,7 GB, y el repositorio completo ocupa 0,9 GB.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) con memoria unificada suficiente para cargar el modelo y el audio de entrada. No se documentan requisitos para GPU NVIDIA o AMD en esta conversión.
- ¿Cabe en consumer GPU? La versión MLX está pensada para Apple Silicon; para GPU consumer NVIDIA habría que usar el modelo original en PyTorch/NeMo, no esta conversión.
- Opciones de despliegue: librería MLX con el paquete `parakeet_mlx` (función `from_config` y `model.transcribe`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| voiceforever/parakeet-tdt-0.6b-v3-mlx-8bit | 627 M | no disponible | 25 europeos | CC-BY-4.0 | safetensors MLX 8-bit |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 627 M | no disponible | 25 europeos | CC-BY-4.0 | PyTorch/NeMo |
| Whisper large-v3 (referencia) | no disponible en la informacion | no disponible | multilingue amplio | MIT (segun conocimiento general, no verificado aqui) | PyTorch, GGUF, etc. |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia e idiomas.

## Limitaciones y advertencias

- Modelo puramente ASR: no genera texto libre, no razona, no hace tool calling ni soporta agentes; cualquier uso fuera de transcripción de audio queda fuera de su alcance.
- Sesgos conocidos: no se documentan en la información proporcionada; al heredar el modelo base de NVIDIA, es previsible que arrastre los sesgos acústicos y lingüísticos de sus datos de entrenamiento (nvidia/Granary, nemo/asr-set-3.0), aunque no se detallan.
- Riesgo de alucinación: en ASR, el equivalente son transcripciones incorrectas o invenciones en audio con ruido, acentos no representados o idiomas fuera de la lista; no se cuantifica en la información disponible.
- Limitaciones de idioma: solo cubre 25 idiomas europeos; no se garantiza soporte para otras lenguas.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero exige mantener el crédito al autor original; hay que revisar los términos exactos antes de producción.
- Mantenimiento: la conversión tiene 0 descargas y 0 likes, y depende de scripts de terceros (animaslabs/mlx-models); no hay garantía de soporte o actualizaciones.
- Dependencia de hardware: al ser MLX, solo funciona en Apple Silicon; no es portable a otros entornos sin reconvertir el modelo.
- La model card cita el modelo como `animaslabs/parakeet-tdt-0.6b-v3-mlx-8bit` en el código de ejemplo, mientras que el ID del repositorio es `voiceforever/parakeet-tdt-0.6b-v3-mlx-8bit`; conviene verificar la ruta correcta antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/voiceforever/parakeet-tdt-0.6b-v3-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio de scripts de conversión: https://github.com/animaslabs/mlx-models
- Dataset nvidia/Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset nemo/asr-set-3.0: https://huggingface.co/datasets/nemo/asr-set-3.0
- Paper de FastConformer: no disponible en la información proporcionada
- Paper de TDT (Token-and-Duration Transducer): no disponible en la información proporcionada
