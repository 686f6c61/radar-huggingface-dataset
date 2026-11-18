# soulman-inc/capdemon-w2v-en-onnx

## Resumen

`capdemon-w2v-en-onnx` es una conversión a formato ONNX del modelo `facebook/wav2vec2-base-960h`, un sistema de reconocimiento automático del habla (ASR) en inglés basado en la arquitectura wav2vec2 con decodificación CTC. Lo publica el usuario soulman-inc (SOULMAN, inc.) como componente interno del producto CapDemon, donde se emplea para alineamiento forzado (forced alignment) de habla en inglés. No introduce cambios en los pesos: solo transforma el formato de los ficheros para permitir la inferencia con runtimes ONNX.

El modelo hereda por completo las características del original de Meta AI: 95 millones de parámetros, entrada de audio mono a 16 kHz y salida de logits CTC sobre un vocabulario de 32 tokens (caracteres en minúscula, apóstrofo, separador de palabra y token de relleno que actúa como blank). Está ajustado sobre 960 horas de LibriSpeech, por lo que su dominio natural es inglés leído y con buena calidad de grabación.

Su relevancia práctica es acotada pero clara: ofrece un checkpoint ASR compacto (0,4 GB de repositorio), con licencia Apache 2.0 y exportado con longitud de entrada dinámica, lo que facilita integrarlo en pipelines de transcripción o alineamiento sobre CPU sin depender de PyTorch. No es un modelo multilingüe ni un sistema ASR de última generación, sino una pieza de infraestructura reutilizable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder Transformer) con cabeza CTC |
| Parámetros totales | 95 millones (heredados de facebook/wav2vec2-base-960h; no se detalla en la model card, dato estándar del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio con longitud dinámica; sin límite declarado en la model card) |
| Tipos de cuantización | no disponible (el repositorio contiene un único fichero ONNX en float32; el tag `quantized` procede del modelo base) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`w2v_en.onnx`) más vocabulario JSON (`vocab_en.json`) |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2-base: un extractor de características convolucional que opera directamente sobre la forma de onda a 16 kHz, seguido de un encoder Transformer y una cabeza de clasificación CTC. La exportación a ONNX se realizó con PyTorch y admite longitud de entrada dinámica; la entrada se denomina `input_values` (float32, mono, 16 kHz, normalizada a media cero y varianza unitaria) y la salida `logits`. El vocabulario no se ha modificado: el token `<pad>` (id 0) hace de blank CTC y `|` (id 4) actúa como separador de palabras.

El entrenamiento es el del checkpoint original de Meta AI: ajuste fino supervisado con CTC sobre 960 horas de LibriSpeech. La model card no documenta pasos adicionales de RLHF, DPO ni aumentos de datos propios; tampoco se indica ninguna innovación técnica más allá de la conversión de formato. La única modificación respecto al original es, por tanto, el contenedor ONNX.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio mono de 16 kHz.
- Decodificación CTC codificada por caracteres, con separador de palabra explícito.
- Alineamiento forzado de transcripciones sobre el audio (uso declarado por el autor en CapDemon).
- Inferencia con longitud de audio variable gracias al eje dinámico del grafo ONNX.
- Ejecución sobre runtimes ONNX (ONNX Runtime, etc.) sin necesidad de PyTorch.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No ofrece capacidades de visión, audio generativo ni modo de razonamiento explícito.
- Sin capacidades multilingües: solo inglés.

## Casos de uso

- Alineamiento forzado de transcripciones: el caso declarado por el autor. Se generan los logits CTC del audio y se alinean contra el texto de referencia para obtener marcas temporales por carácter o palabra, útil en subtitulado y en anotación de corpus.
- Subtitulado automático de contenido en inglés: transcripción de pódcast, clases o reuniones grabadas en inglés con calidad de estudio, usando decodificación CTC y el separador `|` para reconstruir palabras.
- Preetiquetado de corpus de voz: generación de transcripciones preliminares sobre las que un anotador humano corrige, reduciendo el coste de creación de datasets ASR en inglés.
- Indexación y búsqueda de audio: transcripción por lotes de archivos de audio para construir índices de texto consultables, aprovechando el tamaño reducido del modelo (0,4 GB) para procesar en CPU.
- Integración en aplicaciones de escritorio o móviles: al estar en ONNX y con entrada dinámica, puede embeberse en aplicaciones nativas que ya usan ONNX Runtime, sin añadir una dependencia de PyTorch.
- Verificación de pronunciación en inglés: comparando la salida CTC con la transcripción esperada se pueden localizar desviaciones a nivel de fonema o carácter en herramientas de aprendizaje de idiomas.
- Validación de pipelines ASR: como referencia ligera y determinista para comparar la salida de otros sistemas o para pruebas de regresión en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 95 millones de parámetros en float32, lo que supone aproximadamente 0,4 GB de pesos; la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 quedan muy sobredimensionadas para este modelo.
- GPU de consumo: cabe en cualquier GPU de consumo moderna e incluso en iGPU; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), y conversión adicional a otros runtimes ONNX si se necesita. No se distribuye en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin convertir el grafo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| capdemon-w2v-en-onnx | 95 M | longitud dinámica (no especificada) | inglés | Apache 2.0 | ONNX |
| facebook/wav2vec2-base-960h | 95 M | longitud dinámica (no especificada) | inglés | Apache 2.0 | PyTorch (safetensors/bin) |
| Whisper (variantes de OpenAI) | desde ~39 M hasta ~1,5 B según variante | ventana de 30 s | multilingüe en las variantes multilingües | MIT | PyTorch, ONNX, GGUF (comunidad) |

La comparación con Whisper se ofrece como referencia de categoría; los datos concretos de cada variante no se han verificado en la información disponible. Frente al checkpoint original de Meta AI, la única diferencia es el formato ONNX y la ausencia de pesos en PyTorch en este repositorio.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni code-switching.
- Entrenado sobre LibriSpeech (lectura de audiolibros): el rendimiento puede degradarse con acentos marcados, ruido de fondo, habla espontánea o audio telefónico.
- Requiere audio mono a 16 kHz normalizado a media cero y varianza unitaria; un preprocesado incorrecto produce salidas erróneas.
- Riesgo de alucinación y de errores de sustitución en CTC, especialmente en nombres propios, cifras y términos técnicos.
- El vocabulario es de caracteres en minúscula; no genera puntuación ni mayúsculas.
- No dispone de marcas de tiempo nativas: el alineamiento debe obtenerse mediante técnicas de forced alignment sobre los logits.
- La model card no documenta evaluación de sesgos; al derivar de LibriSpeech, puede reflejar los sesgos de dominio y de locutores de ese corpus.
- Licencia Apache 2.0, permisiva para uso comercial; debe mantenerse la atribución a LibriSpeech (CC BY 4.0) y al modelo original de Meta AI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El tag `quantized` del repositorio no se corresponde con un fichero cuantizado incluido; conviene verificar el contenido real antes de asumir pesos reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soulman-inc/capdemon-w2v-en-onnx
- Modelo base: https://huggingface.co/facebook/wav2vec2-base-960h
- Corpus LibriSpeech: https://www.openslr.org/12
