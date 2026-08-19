# walston/cosyvoice3-multiaccent

## Resumen

CosyVoice3 Multi-Accent es un modelo de síntesis de voz (text-to-speech) en chino, desarrollado por el usuario walston, que parte del modelo base Fun-CosyVoice3-0.5B de Alibaba y lo ajusta mediante fine-tuning para controlar nueve acentos regionales del chino mediante instrucciones de texto. El modelo resuelve el problema de generar habla con acento específico (norteño, sichuanés, cantonés, sureño, henanés, shanghainés, wuhanés, tianjinés y singapurense) sin necesidad de muestras de voz de referencia para cada acento, ya que el acento se selecciona por instrucción.

El repositorio es autocontenido: incluye el código de inferencia de CosyVoice, el tokenizador, el modelo de flujo (flow matching), el vocoder, componentes ONNX y el LLM fine-tuneado (`llm.pt`), por lo que no requiere una instalación separada de CosyVoice. Está publicado bajo licencia Apache 2.0, con un tamaño de repositorio de 8,3 GB, y es compatible con Hugging Face Inference Endpoints mediante un handler personalizado. Su relevancia actual radica en ofrecer una solución práctica y de código abierto para TTS chino con control de acento, un área con poca cobertura en modelos multilingües genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM + flow matching (CosyVoice3), con Matcha-TTS, tokenizador, modelo de flujo y vocoder |
| Parametros totales | 0,5B (modelo base Fun-CosyVoice3-0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se incluyen pesos en safetensors, ONNX y `llm.pt`) |
| Idiomas soportados | chino (zh) con nueve acentos regionales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch (`llm.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en CosyVoice 3, cuya arquitectura combina un modelo de lenguaje grande (LLM) con un modelo de flow matching consciente de fragmentos (chunk-aware), tal como se describe en el artículo técnico de CosyVoice 3 (arXiv:2505.17589). En esta variante, el LLM de 0,5B parámetros se ha fine-tuneado para aceptar instrucciones de acento como parte del prompt de texto, generando así habla con el acento solicitado. El repositorio incluye todos los componentes necesarios para la inferencia: el tokenizador, el modelo de flujo, el vocoder y el código de Matcha-TTS, además de los pesos del LLM ajustado.

El fine-tuning se realizó con 135.000 transcripciones originales en chino, cada una etiquetada con una instrucción de acento. El LLM publicado es el promedio de los cinco checkpoints con menor pérdida de validación (épocas 0 a 4). El entrenamiento se detuvo en la época 31 al observarse sobreajuste sostenido en la pérdida de validación. La distribución de datos entre acentos es desigual, lo que afecta a la fuerza del acento y a la similitud de la voz según el acento y la voz de referencia utilizada.

## Capacidades

- Generación de voz en chino con control de acento mediante instrucciones de texto (nueve acentos: north, Sichuan, Guangdong, south, Henan, Shanghai, Wuhan, Tianjin y singapore).
- Control de velocidad de habla mediante el parámetro `speed`.
- Selección de voz de referencia opcional: si no se proporciona un audio de referencia, se usa una voz de referencia incluida por defecto; se puede pasar un WAV codificado en base64 como `prompt_audio_base64` para elegir otra voz.
- Compatible con Hugging Face Inference Endpoints mediante el `handler.py` incluido, que acepta peticiones JSON y devuelve audio en base64, frecuencia de muestreo y acento.
- Inferencia en CPU posible aunque lenta; CUDA recomendado.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de síntesis de voz.

## Casos de uso

- Audiolibros con acento regional: permite generar narraciones en chino con el acento deseado (por ejemplo, sichuanés o shanghainés) para audiolibros dirigidos a audiencias locales, sin necesidad de locutores nativos de cada región.
- Asistentes de voz localizados: integración en asistentes virtuales o sistemas de IVR que necesiten hablar con el acento de la región del usuario, mejorando la cercanía y la comprensión cultural.
- Doblaje de contenido audiovisual: producción de doblaje para vídeos, series o anuncios donde el acento es un rasgo distintivo del personaje o de la marca.
- Aplicaciones educativas de idiomas: generación de ejemplos de pronunciación con diferentes acentos del chino para estudiantes que quieran familiarizarse con la variación dialectal.
- Generación de contenido para redes sociales: creación de voces en off con acento específico para vídeos cortos, podcasts o memes de audio, con control fino del estilo.
- Sistemas de navegación y avisos públicos: voces de navegación GPS o anuncios en transporte público que se adapten al acento predominante de la zona, mejorando la aceptación del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo fine-tuneado en la informacion disponible. El artículo original de CosyVoice 3 (arXiv:2505.17589) reporta evaluaciones del modelo base, indicando que para la mayoría de idiomas la diferencia de rendimiento entre CosyVoice3-0.5B y CosyVoice3-1.5B es mínima, y que la generación de palabras raras, trabalenguas y términos de dominio específico sigue siendo difícil. Sin embargo, no se dispone de métricas concretas (MOS, SIM, etc.) para esta variante multi-accent.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo base es de 0,5B parámetros, la inferencia en FP16 requeriría aproximadamente 1 GB de VRAM solo para el LLM, pero el repositorio incluye múltiples componentes (flow model, vocoder, tokenizador) que en conjunto pueden necesitar entre 4 y 8 GB de VRAM en función de la implementación. Se recomienda una GPU con al menos 8 GB de VRAM para un uso fluido.
- GPU recomendadas: cualquier GPU consumer moderna con CUDA, como RTX 3060, RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100 o H100. La inferencia en CPU es posible pero lenta, como indica el autor.
- Opciones de despliegue: el repositorio incluye `inference.py` para ejecución local, y `handler.py` para desplegar en Hugging Face Inference Endpoints. También se puede integrar con vLLM o TGI si se adapta el código, aunque no está documentado.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud del texto de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CosyVoice3 Multi-Accent (este) | 0,5B | no disponible | chino con 9 acentos | Apache 2.0 | Hugging Face |
| CosyVoice3-0.5B (base) | 0,5B | no disponible | multilingüe (varios idiomas) | Apache 2.0 | Hugging Face / GitHub |
| CosyVoice3-1.5B (base) | 1,5B | no disponible | multilingüe | Apache 2.0 | Hugging Face / GitHub |
| ChatTTS | ~0,8B | no disponible | chino e inglés | MIT (con restricciones de uso) | Hugging Face |

La comparativa se centra en el ecosistema CosyVoice. Este modelo se diferencia del base por su especialización en acentos chinos, mientras que el base es multilingüe. La versión 1.5B ofrece mayor capacidad pero no está fine-tuneada para acentos. ChatTTS es una alternativa popular para TTS chino, pero no ofrece control de acento regional mediante instrucciones.

## Limitaciones y advertencias

- La distribución de datos de entrenamiento entre acentos es desigual, por lo que algunos acentos (por ejemplo, singapore o Tianjin) pueden tener una fuerza de acento o una calidad de voz inferior a la de acentos con más datos (como north o Sichuan).
- La similitud de la voz generada con la voz de referencia depende de la calidad y características del audio de referencia proporcionado. Con la voz por defecto, el resultado puede no ser óptimo para todos los acentos.
- El modelo solo soporta chino; no es multilingüe en esta variante.
- Según el paper de CosyVoice 3, la generación de palabras raras, trabalenguas y términos de dominio específico sigue siendo problemática, lo que puede afectar a casos de uso con vocabulario técnico o nombres propios.
- No se han publicado benchmarks específicos para este fine-tune, por lo que se recomienda evaluar la calidad de salida en el dominio de aplicación antes de usarlo en producción.
- El repositorio tiene un tamaño de 8,3 GB, lo que puede suponer un coste de almacenamiento y descarga considerable en entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los componentes incluidos (por ejemplo, el vocoder o el modelo de flujo) mantengan la misma licencia y no tengan restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/walston/cosyvoice3-multiaccent
- Artículo técnico de CosyVoice 3: https://arxiv.org/abs/2505.17589
- Versión HTML del artículo: https://arxiv.org/html/2505.17589v1
- Repositorio GitHub de CosyVoice-v3: https://github.com/wehos/CosyVoice-v3
- Repositorio relacionado (variante singapurense): https://huggingface.co/walston/cosyvoice3-sg
