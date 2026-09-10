# youspeech/moss_nano_trainer_unofficial

## Resumen

`youspeech/moss_nano_trainer_unofficial` es un proyecto no oficial de entrenamiento e inferencia para un tokenizador de audio de tipo MOSS Audio Tokenizer Nano a 16 kHz, desarrollado por el usuario `youspeech`. El repositorio proporciona una implementación completa de RVQ (vector quantization residual) junto con un pipeline de dos etapas: reconstrucción mel y ajuste adversarial con discriminadores multi-period y multi-resolution STFT. El modelo resultante tiene 21.887.744 parámetros y publica sus pesos en formato safetensors, además de un checkpoint de Lightning.

El problema que resuelve es la conversión de audio en representaciones discretas de baja tasa de bits (aproximadamente 2 kbps con los 16 codebooks) de forma eficiente, con soporte para decodificación parcial mediante prefijo RVQ. El proyecto se presenta como una alternativa de 16 kHz al modelo oficial de 48 kHz de OpenMOSS, con el que no comparte pesos pero sí una API pública compatible. Su relevancia radica en ofrecer una base de investigación accesible para tokenización de audio, especialmente útil en tareas de generación, compresión y experimentación con tasas de bits variables.

La publicación es reciente (septiembre de 2026) y no está afiliada al equipo OpenMOSS. La documentación incluye scripts de entrenamiento e inferencia, ejemplos de código con `AutoModel`, y una descripción detallada del estado de entrenamiento, aunque no se han publicado benchmarks cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVQ (Residual Vector Quantization) con discriminadores adversariales multi-period y multi-resolution STFT |
| Parametros totales | 21.887.744 (~21,9 M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelo de audio, no de texto; en el pipeline procesa segmentos de hasta 10 segundos a 16 kHz) |
| Tipos de cuantizacion | No disponible (la cuantizacion de pesos no esta documentada; el checkpoint se publica en .ckpt y safetensors sin variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible (el README menciona ficheros LICENSE y THIRD_PARTY_NOTICES, pero la licencia no se especifica en la informacion proporcionada) |
| Formato de pesos | Safetensors (exportacion Hugging Face) y checkpoint de Lightning en formato .ckpt |

## Arquitectura y entrenamiento

Se trata de un pipeline no oficial de entrenamiento e inferencia para un tokenizador de audio de tipo MOSS Audio Tokenizer Nano a 16 kHz. La arquitectura se compone de un codificador-decodificador con vector quantization residual (RVQ) de 16 codebooks de 1024 entradas cada uno, lo que produce un flujo de 2 kbps cuando se usan todos los codebooks. El modelo opera a 12,5 codec frames por segundo. Se aplica normalizacion L2 a los latentes y vectores de codigo, junto con un random RVQ prefix dropout durante el entrenamiento.

El entrenamiento se divide en dos etapas: 250.000 batches de reconstruccion (basados en reconstruccion mel) seguidos de 250.000 batches adversariales con discriminadores multi-period y multi-resolution STFT. El proyecto usa checkpoints de Lightning reanudables y registro en TensorBoard. El autor indica que las capas de frontera de 16 kHz no son compatibles con el modelo preentrenado oficial de 48 kHz, por lo que el entrenamiento parte de una inicializacion aleatoria.

## Capacidades

- Codificacion y decodificacion de audio a 16 kHz en mono o estereo.
- Tokenizacion con RVQ de 16 codebooks, con soporte para decodificar usando un subconjunto de codebooks (prefijo RVQ).
- Exportacion en Hugging Face con API publica compatible con el ejemplo oficial de OpenMOSS: `AutoModel`, `encode`, `decode` y slicing de prefijo RVQ.
- Soporta modos de inferencia tanto de streaming como no streaming: encoding/decoding por trozos (chunked), batches de longitud variable y decodificacion continua por lotes en streaming.
- Incluye pipeline completo de entrenamiento e inferencia, con scripts de ejemplo (`train.sh`, `inference.sh`), soporte para reanudar desde checkpoints y utilidades para preparar manifests de audio.
- Reporta la frecuencia de muestreo del modelo a traves de `model.sampling_rate` (16 kHz en este checkpoint, frente a 48 kHz del oficial).

## Casos de uso

- Investigacion en modelos generativos de audio: el tokenizador produce representaciones discretas que pueden servir como entrada a modelos de lenguaje de audio para TTS o sintesis de voz.
- Compresion a baja tasa de bits: los 16 codebooks permiten alcanzar aproximadamente 2 kbps; util en escenarios de transmision o almacenamiento con ancho de banda limitado.
- Experimentacion con tasas de bits variables: el uso de prefijo RVQ permite decodificar con un subconjunto de codebooks (por ejemplo, 8), lo que facilita estudios de relacion calidad/compresion en tiempo real.
- Prototipado y educacion en tokenizacion de audio: el codigo proporcionado, basado en Lightning, incluye registro en TensorBoard y checkpoints reanudables, lo que facilita la depuracion y el aprendizaje de la tecnica.
- Reproduccion de experimentos: los scripts `train.sh` e `inference.sh` y los manifests permiten replicar el entrenamiento y la inferencia en un entorno propio.
- Sustitucion en demos de OpenMOSS: gracias a la compatibilidad de la API, se puede reemplazar el ID del repositorio en ejemplos oficiales para probar el funcionamiento con este checkpoint de 16 kHz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; dado que el modelo tiene ~21,9 M de parametros, la inferencia basica requiere una cantidad pequena de memoria, probablemente inferior a 1 GB en FP32, pero no hay cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumidor: no se especifica; el minimo documentado es disponer de una runtime CUDA valida para PyTorch 2.9.1 o posterior.
- Opciones de despliegue: el modelo se ejecuta con PyTorch y Transformers mediante `AutoModel`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Se incluyen scripts de inferencia propios (`inference.sh`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Frecuencia de muestreo | Parametros | API compatible | Licencia |
|---|---|---|---|---|
| MOSS Audio Tokenizer Nano (oficial, 48 kHz) | 48 kHz | no disponible | OpenMOSS | no disponible |
| youspeech/moss_nano_trainer_unofficial | 16 kHz | 21.887.744 | OpenMOSS compatible | no disponible |

El proyecto no oficial esta disenado para 16 kHz y no es compatible con los pesos del modelo oficial de 48 kHz. No se dispone de datos comparativos de benchmarks entre ambos.

## Limitaciones y advertencias

- Proyecto no oficial: no esta afiliado al equipo OpenMOSS. No hay garantia de mantenimiento ni de calidad de produccion.
- Checkpoint en desarrollo: el punto de control publicado se describe como un snapshot de desarrollo, no como una version final.
- Incompatibilidad con el modelo oficial: las capas de frontera de 16 kHz no son compatibles con el modelo preentrenado de 48 kHz; no se puede transferir el aprendizaje.
- Posible polaridad invertida entre canales: el checkpoint de desarrollo actual puede emitir canales con polaridad opuesta; la exportacion a WAV usa por defecto el canal 1 como mono para evitar este problema.
- Evaluacion no formalizada: las muestras de audio disponibles son cualitativas y no constituyen un conjunto de evaluacion. No se han publicado metricas objetivas.
- Licencia no especificada: aunque el repositorio incluye ficheros de licencia y avisos de terceros, la licencia aplicable no se detalla en la ficha. Los usuarios son responsables de comprobar las condiciones y de asegurar que los datasets y audios de muestra cumplan sus propias licencias.
- No es un modelo de lenguaje: no debe utilizarse para tareas de generacion de texto o conversacion.

## Enlaces

- [Hugging Face: youspeech/moss_nano_trainer_unofficial](https://huggingface.co/youspeech/moss_nano_trainer_unofficial)
- Nota: la busqueda web no devolvio enlaces adicionales relevantes. El proyecto incluye documentacion interna (por ejemplo, `docs/openmoss_compatibility.md` y `THIRD_PARTY_NOTICES.md`) dentro del repositorio, pero no se proporcionan URLs publicas en la informacion disponible.
