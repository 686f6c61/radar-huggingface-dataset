# Tileward-Inc/Tileward-whisper-large-v3

## Resumen

Tileward-whisper-large-v3 es una versión comprimida del modelo de reconocimiento automático del habla (ASR) Whisper large-v3 de OpenAI, desarrollada por Tileward-Inc. El modelo reduce el tamaño del archivo de pesos de 3,09 GB a 0,98 GB, lo que supone una compresión del 68 % (un factor de 3,2x), quedando por debajo del tamaño de Whisper large-v3-turbo (1,62 GB). La relación con el modelo base es de cuantización, según los metadatos del repositorio.

La propuesta de valor es mantener la precisión del large-v3 original con una huella de almacenamiento mucho menor. Según la model card, en nueve de diez conjuntos de prueba el incremento de tasa de error respecto al original es de como máximo 0,3 puntos, con la excepción del danés, donde sube 1,06 puntos. Frente a large-v3-turbo, el modelo obtiene errores más bajos en cuatro conjuntos y queda a la par en seis.

Es relevante para desarrolladores que necesitan desplegar ASR de alta calidad en entornos con restricciones de memoria o almacenamiento, o que quieren aumentar el número de llamadas concurrentes por GPU. No obstante, los pesos no están publicados en Hugging Face: el modelo solo se ofrece mediante la API alojada de Tileward, en la nube del cliente o en modo air-gapped.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de Whisper large-v3) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s característica de Whisper) |
| Tipos de cuantización | no disponible (compresión propietaria de Tileward, relación "quantized" con el base) |
| Idiomas soportados | no disponible (evaluado en LibriSpeech, FLEURS en siete idiomas y clips sintéticos de call-center) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (los pesos no se publican en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3, un transformer encoder-decoder entrenado para transcripción y traducción de voz, y aplica un proceso de compresión propietario de Tileward que reduce el archivo de pesos a 0,98 GB. La model card califica la relación con el modelo base como "quantized", aunque no se detalla la técnica exacta de cuantización ni el esquema de bits empleado.

No se especifican en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de ajuste fino, RLHF o DPO. La evaluación reportada se centra en la degradación de la tasa de error respecto al original, medida sobre LibriSpeech test-clean y test-other, FLEURS en siete idiomas y 384 clips sintéticos de call-center, lo que sugiere que el proceso de compresión se validó para preservar la precisión del modelo base en esos dominios.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), heredado de Whisper large-v3.
- Traducción de voz a texto en inglés, capacidad nativa de la familia Whisper.
- Procesamiento de audio en ventanas de 30 segundos, con segmentación para audios más largos.
- Multilingüismo: evaluado en siete idiomas mediante FLEURS, aunque la lista completa no se detalla.
- Mayor concurrencia por GPU: 152 llamadas simultáneas en una tarjeta de 20 GB, frente a 140 del large-v3 original.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede procesar audio de 30 segundos por ventana con la precisión del large-v3 y un archivo de 0,98 GB, lo que facilita su despliegue en servidores con almacenamiento limitado.
- Atención al cliente automatizada: la model card reporta evaluación sobre 384 clips sintéticos de call-center, lo que indica que el modelo se validó para transcripción de conversaciones telefónicas con ruido y acentos variados.
- Subtitulado y generación de transcripciones para vídeo: la compresión permite ejecutar más instancias por GPU, reduciendo el coste por hora de audio procesado en pipelines de postproducción.
- Servicios de transcripción bajo demanda: con 152 llamadas concurrentes en una GPU de 20 GB, es adecuado para APIs multiinquilino que necesitan alta densidad de peticiones.
- Despliegue en entornos air-gapped: Tileward ofrece ejecución en la nube del cliente o aislada, útil para sectores con requisitos de soberanía de datos como salud o administración pública.
- Traducción de voz a texto en inglés: para organizaciones que necesitan transcribir audio en varios idiomas y traducirlo al inglés, aprovechando la capacidad multilingüe de Whisper.
- Investigación en ASR con restricciones de recursos: el tamaño reducido permite experimentar con un modelo cercano a large-v3 en clústeres con GPUs de menor VRAM.

## Benchmarks y rendimiento

Datos publicados en la model card (incremento de tasa de error respecto al original):

| Conjunto de prueba | Tileward Whisper large-v3 |
|---|---|
| LibriSpeech test-clean, test-other, FLEURS (7 idiomas) y 384 clips de call-center (9 de 10 conjuntos) | Incremento de error de como máximo 0,3 puntos |
| Danés | Incremento de error de 1,06 puntos |
| Comparación con large-v3-turbo, clip por clip | Error más bajo en cuatro conjuntos, a la par en seis |

| Modelo | Tamaño del archivo | Llamadas simultáneas en GPU de 20 GB |
|---|---|---|
| Whisper large-v3 | 3,09 GB | 140 |
| Whisper large-v3-turbo | 1,62 GB | 301 |
| Tileward Whisper large-v3 | 0,98 GB | 152 |

No se publican valores absolutos de WER (word error rate) por conjunto, solo deltas respecto al original. No hay datos de latencia ni de throughput más allá del recuento de llamadas concurrentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo se ejecuta en una GPU de 20 GB con 152 llamadas concurrentes, lo que sugiere un consumo moderado por instancia.
- GPU recomendadas: tarjetas de 20 GB o superiores para el escenario de alta concurrencia reportado; no se especifican modelos concretos (A100, H100, RTX 4090).
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el tamaño de 0,98 GB hace plausible su ejecución en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: API alojada de Tileward (app.tileward.com), despliegue en la nube del cliente o air-gapped. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 152 llamadas simultáneas por segundo de audio transcrito por segundo en una GPU de 20 GB; no se detalla la latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Tamaño de archivo | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Tileward Whisper large-v3 | no disponible | 30 s por ventana | 0,98 GB | apache-2.0 | No publicados (API/nube/air-gapped) |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | 3,09 GB | apache-2.0 | Públicos en Hugging Face |
| openai/whisper-large-v3-turbo | 809 M | 30 s por ventana | 1,62 GB | apache-2.0 | Públicos en Hugging Face |

Frente al large-v3 original, Tileward reduce el tamaño un 68 % con un incremento de error de hasta 0,3 puntos en nueve de diez conjuntos. Frente a large-v3-turbo, el archivo es un 39 % más pequeño y el error es más bajo en cuatro conjuntos y equivalente en seis, según la model card.

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face: el acceso es únicamente mediante la API de Tileward, despliegue en la nube del cliente o air-gapped, lo que impide la autoalojamiento gratuito.
- El repositorio muestra 0 descargas y 0 likes, y no hay evidencia de adopción externa.
- La evaluación se limita a LibriSpeech, FLEURS en siete idiomas y clips sintéticos de call-center; no cubre dominios como audio médico, legal o conversacional espontáneo.
- El danés presenta un incremento de error de 1,06 puntos, superior al umbral de 0,3 del resto de conjuntos, lo que indica degradación desigual por idioma.
- No se documentan sesgos conocidos, riesgo de alucinación en transcripción ni limitaciones específicas de contexto o idioma más allá de lo indicado.
- La licencia apache-2.0 del modelo base se mantiene, pero el uso comercial está condicionado a las vías de despliegue ofrecidas por Tileward, no a una descarga libre de pesos.
- No se especifican los detalles técnicos de la cuantización, lo que dificulta auditar la fidelidad numérica del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-whisper-large-v3
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Artículo de investigación: https://tileward.com/research/a-smaller-speech-recogniser/
- Investigación de Tileward: https://tileward.com/research/
- Plataforma y API: https://app.tileward.com/?join=explore
- Sitio de Tileward: https://tileward.com
