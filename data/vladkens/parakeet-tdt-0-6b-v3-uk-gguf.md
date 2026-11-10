# vladkens/parakeet-tdt-0.6b-v3-uk-gguf

## Resumen

`vladkens/parakeet-tdt-0.6b-v3-uk-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `ihnatov-yuri/parakeet-tdt-0.6b-v3-uk`, un ajuste fino en ucraniano del NVIDIA Parakeet TDT 0.6B v3. El modelo original lo desarrolla Yurii Ihnatov y esta conversión la publica el desarrollador vladkens para su uso con las herramientas `wavo` y `transcribe.cpp`, ambas orientadas a inferencia local de modelos de voz en formato GGUF.

El modelo resuelve la transcripción de audio a texto en ucraniano conservando la capacidad en inglés del modelo base, incluyendo palabras en inglés dentro de habla ucraniana. La salida se entrega con mayúsculas, puntuación y números en dígitos, lo que reduce el postprocesado necesario en pipelines de subtitulado o actas.

Con 627.052.166 parámetros y un único archivo Q8_0 de 740 MB, es una opción ligera para despliegue en CPU o GPU de gama baja. La arquitectura es la del Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, un modelo transducer no autorregresivo que predice tokens y duraciones de forma conjunta, lo que le permite transcribir con baja latencia. La licencia es CC-BY-4.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), no autorregresiva |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | ucraniano (uk), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`parakeet-tdt-0.6b-v3-uk-Q8_0.gguf`, 740 MB) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Parakeet TDT 0.6B v3, un transducer de tokens y duraciones (TDT) que combina un encoder acústico con un predictor y una red conjunta que emite, en cada paso, tanto el token como su duración. Esta formulación no autorregresiva permite transcribir secuencias completas con un número reducido de pasos de decodificación, lo que se traduce en menor latencia que los modelos encoder-decoder clásicos. El ajuste fino en ucraniano lo realiza Yurii Ihnatov partiendo de los pesos de NVIDIA; la model card de esta conversión no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO, y remite a la model card del modelo original para esa información.

La conversión a GGUF se realizó con el script `scripts/convert-parakeet.py` de `transcribe.cpp` en el commit `5bb2deb`, seguida de una cuantización Q8_0 con `transcribe-quantize`. El perfil del conversor replica el del Parakeet TDT 0.6B v3 estándar y solo modifica el nombre, el autor, los idiomas y el formato de origen (safetensors de Transformers). El tokenizer y los nombres, formas y tipos de todos los tensores coinciden con el GGUF `parakeet-tdt-0.6b-v3` de `transcribe.cpp`, lo que garantiza compatibilidad directa con el runtime.

## Capacidades

- Transcripción de voz a texto en ucraniano con salida en mayúsculas, puntuada y con números en dígitos.
- Reconocimiento de palabras en inglés dentro de habla ucraniana, así como transcripción de audio íntegramente en inglés.
- Generación de marcas de tiempo por token (`token times`), útiles para alineación y subtitulado.
- Inferencia local sin dependencia de servicios en la nube, mediante `wavo` o `transcribe.cpp`.
- Acepta cualquier formato y frecuencia de muestreo de audio cuando se usa a través de `wavo`; con `transcribe.cpp` requiere WAV mono a 16 kHz.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Subtitulado de vídeo en ucraniano: el modelo produce texto puntuado y con mayúsculas, y las marcas de tiempo por token permiten generar archivos SRT o VTT sin postprocesado lingüístico adicional.
- Actas y notas de reuniones: al ejecutarse en local con 740 MB de pesos, se puede desplegar en un portátil para transcribir conversaciones sin enviar audio a terceros.
- Atención al cliente en ucraniano: integración en un pipeline ASR + LLM donde el transcriptor convierte las llamadas en texto para su análisis posterior.
- Archivística y digitalización de audio histórico: procesamiento por lotes de grabaciones en ucraniano con `transcribe-cli` sobre WAV de 16 kHz.
- Investigación lingüística: generación de transcripciones con tiempos por token para estudios fonéticos o de alineación forzada.
- Aplicaciones de accesibilidad: dictado y subtitulado en tiempo real en dispositivos de gama baja gracias al tamaño reducido del modelo cuantizado.
- Procesamiento de contenido mixto ucraniano-inglés: entrevistas o clases donde se alternan ambos idiomas sin necesidad de cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas de WER, latencia ni throughput, y remite a la model card del modelo original para datos de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con Q8_0 (archivo de 740 MB más overhead de runtime); no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con más de 1 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: `wavo` (gestión de modelos y audio de cualquier formato) y `transcribe.cpp` (`transcribe-cli` sobre WAV mono 16 kHz). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos transducer de ASR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-uk-gguf (este) | 627 M | uk, en | GGUF Q8_0 | CC-BY-4.0 | Conversion comunitaria para transcribe.cpp/wavo |
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk | no disponible | uk, en | safetensors (Transformers) | CC-BY-4.0 | Modelo original del ajuste fino |
| nvidia/parakeet-tdt-0.6b-v3 | no disponible | en (principal) | safetensors | no disponible en la informacion proporcionada | Modelo base de NVIDIA |

No se dispone de datos de benchmarks que permitan comparar la precisión (WER) frente a alternativas.

## Limitaciones y advertencias

- Solo se publica una cuantización Q8_0; no hay variantes Q4 ni Q5 para reducir aún más el peso.
- El alcance lingüístico se limita a ucraniano e inglés; otros idiomas no están soportados según la model card.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan métricas de robustez.
- No se detallan sesgos del ajuste fino ni la composición del corpus de entrenamiento en esta conversión.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original y al modelo base; el archivo `NOTICE` documenta los cambios realizados.
- `transcribe.cpp` requiere WAV mono a 16 kHz; para otros formatos hay que remuestrear o usar `wavo`.
- La ficha del modelo no incluye información sobre latencia, throughput ni consumo de memoria en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladkens/parakeet-tdt-0.6b-v3-uk-gguf
- Modelo original (ajuste fino ucraniano): https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio wavo: https://github.com/vladkens/wavo
- Script de conversión de wavo: https://github.com/vladkens/wavo/blob/main/scripts/convert.sh
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit del conversor utilizado: https://github.com/handy-computer/transcribe.cpp/tree/5bb2deb2a4afb1fd50534ecb51cfcb521ef94944
- Commit del modelo de origen: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk/tree/5c4bcfaca501587beaedfd23b72a678bf7194de1
