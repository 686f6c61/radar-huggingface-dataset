# VoiceHub/DACVAE-Turkish

## Resumen

DACVAE-Turkish es un autoencoder de audio (codec neuronal basado en VAE) especializado en voz en turco, publicado por VoiceHub como un fine-tune experimental de Aratako/Semantic-DACVAE-Japanese, que a su vez deriva del codec Meta DACVAE (facebook/dacvae-watermarked). No es un modelo de texto a voz: su función es codificar y reconstruir audio, transformando la señal en latentes continuos y devolviéndola al dominio de la onda. Trabaja con audio mono a 48.000 Hz y produce latentes de 128 canales a 25 fotogramas por segundo (hop de 1.920 muestras).

El modelo se entrenó con pérdidas de reconstrucción acústica, KL y L1 de forma de onda, con el profesor semántico y el discriminador GAN desactivados. El checkpoint publicado corresponde a un peso de L1 de forma de onda de 150, semilla 42 y actualización 1.000. La inferencia se realiza en FP32 con la media de la posterior y con el camino de watermark desactivado.

Su relevancia es acotada y principalmente de investigación: es una prueba preliminar de adaptación al turco de un codec originalmente entrenado en japonés, con una única semilla de entrenamiento y evidencia de conjunto de desarrollo no confirmada con un test final intacto. La licencia Apache 2.0 facilita su reutilización, pero el propio autor advierte de que no debe tratarse como un benchmark de calidad definitivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) para audio, derivado de DACVAE (Meta) vía Aratako/Semantic-DACVAE-Japanese |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); latentes continuos a 25 fps, hop de 1.920 muestras |
| Tipos de cuantización | inferencia en FP32; no se documentan otras cuantizaciones |
| Idiomas soportados | turco (tr); el checkpoint base estaba entrenado en japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio (0,4 GB) incluye `inference.py` y `requirements.txt`, con 317 tensores de estado verificados en la recarga |

## Arquitectura y entrenamiento

La arquitectura es un codec neuronal VAE de tipo DACVAE. El modelo parte del checkpoint Aratako/Semantic-DACVAE-Japanese (revisión `96adcf1937e1ff46ec0817a07c80f2d7d64998f0`), que a su vez deriva de Meta DACVAE (revisión `facebook/dacvae-watermarked@8680102d141858a21bd533543966a2eb2e569f92`). Representa el audio como latentes continuos de 128 canales a 25 fotogramas por segundo, lo que equivale a un hop de 1.920 muestras a 48 kHz. No emplea cuantización discreta de tokens; el espacio latente es continuo.

El fine-tune turco se realizó en FP32 sobre una única RTX 5070 Ti, con 1.000 actualizaciones y semilla 42, batch 1 y acumulación de gradiente 2, sobre recortes de 3 segundos. El optimizador fue AdamW con LR 1e-5, betas (0,8; 0,99) y weight decay 0, con un calentamiento de 5 actualizaciones y gamma 0,99999. Las ponderaciones de los objetivos fueron Mel 15, STFT 1, KL gaussiana canónica 1e-4 y L1 de forma de onda 150. Tanto el profesor semántico como la pérdida adversarial se desactivaron. La posterior se muestreó durante el entrenamiento y se usó la media en la evaluación.

Los datos provienen del conjunto privado de podcasts turcos Vyvo/tr-dataset-12 (revisión `847aeb429875352823edbbd989bfc9792243a890`), que declara 93,2 horas de origen. Tras filtrado y deduplicación por PCM exacto se retuvieron 59,3641 horas de entrenamiento, 2,9163 de validación y 2,4720 de test, con particiones agrupadas por programa/episodio (la disjunción de hablantes físicos no está establecida). Es importante notar que la exposición real al entrenamiento fue de 2.000 recortes de 3 segundos, es decir 1,667 horas presentadas, no una pasada completa sobre las 59,36 horas. El checkpoint exportado se recargó de forma estricta y los 317 tensores de estado coincidieron exactamente.

## Capacidades

- Codificación y reconstrucción de voz en turco a partir de audio mono a 48.000 kHz.
- Extracción de latentes VAE continuos de 128 canales a 25 fotogramas por segundo.
- Reconstrucción de forma de onda con métricas de dominio espectral y de forma de onda (Mel, STFT, SI-SDR).
- No genera texto a voz: el autor indica explícitamente que el modelo no es un sistema TTS.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- Cobertura multilingüe limitada: el fine-tune es específicamente turco; no se reclama alineación semántica turca nueva ni verificada, ya que el profesor semántico se desactivó.
- El camino de watermark está desactivado en la inferencia (watermark bypass).

## Casos de uso

- Compresión y almacenamiento de voz: el modelo puede codificar locuciones turcas en latentes continuos de 128 canales a 25 fps y reconstruirlas después, útil para reducir el tamaño de archivos de audio en archivos o pipelines de distribución.
- Tokenizador de audio para modelos generativos: los latentes continuos pueden emplearse como representación intermedia en modelos de lenguaje de audio que operen sobre espacio latente en lugar de tokens discretos.
- Preprocesamiento para pipelines de ASR: al reconstruir audio con menor pérdida espectral, puede servir como etapa previa de normalización o limpieza antes de un sistema de reconocimiento de voz en turco.
- Investigación en codecs neuronales para turco: permite estudiar la transferencia de un codec entrenado en otro idioma (japonés) hacia una lengua morfológicamente distinta y medir el impacto en métricas espectrales.
- Data augmentation en representación latente: los latentes pueden usarse como espacio común para tareas de clasificación, segmentación o detección sobre voz turca sin exponer el audio original.
- Base para fine-tunes posteriores: dada la licencia Apache 2.0, el checkpoint puede actuar como inicialización para adaptaciones a otros idiomas o dominios dentro del ecosistema DACVAE.
- Evaluación comparativa de codecs: sirve como referencia en experimentos que comparen DACVAE frente a otros codecs neuronales sobre corpus de podcast turcos, siempre que se respete el protocolo de medición del autor.

## Benchmarks y rendimiento

Todos los modelos se evaluaron con el mismo protocolo: FP32, media de la posterior, watermark bypass, 48 kHz y preprocesado a −16 LUFS. Las métricas de reconstrucción usan 256 recortes fijos de tres segundos del centro del conjunto de validación, repartidos en 18 episodios. El ASR usa 32 grabaciones completas de validación (224,24 segundos) con un protocolo fijo de decodificación/normalización de Whisper large-v3-turbo en turco.

| Modelo | Mel ↓ | STFT ↓ | Mel + STFT ↓ | Raw SI-SDR, dB ↑ | WER, % ↓ | CER, % ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Meta DACVAE | 0,278626 | 1,064086 | 1,342712 | 16,8840 | 4,9892 | 2,5641 |
| Inicialización japonesa | 0,265590 | 0,971278 | 1,236868 | 17,4423 | 4,9892 | 2,5295 |
| **DACVAE-Turkish** | **0,226915** | **0,843268** | **1,070183** | **17,4190** | **4,1215** | **2,2869** |

Frente a la inicialización japonesa, la pérdida espectral combinada baja un 13,48 %, mientras que el SI-SDR bruto baja 0,0233 dB. Frente a Meta DACVAE, la pérdida espectral combinada baja un 20,30 % y el SI-SDR bruto sube 0,5350 dB. El propio autor advierte de que la inicialización japonesa ya mejora a Meta, por lo que la diferencia total respecto a Meta no puede atribuirse por completo a la etapa de entrenamiento turca.

El resultado de ASR turco corresponde a 19/461 errores de palabra y 66/2.886 errores de carácter; el japonés da 23/461 y 73/2.886, con diferencias en solo dos grabaciones. El audio original presenta 20/461 y 59/2.886. El intervalo bootstrap pareado por episodio para la diferencia de SI-SDR turco menos japonés es de [−0,0824, +0,0369] dB, descriptivo y no un test formal de equivalencia. No se reclama ningún resultado sobre test final intacto, ni MOS con escucha ciega, ni similitud de hablante, ni resultado TTS posterior.

## Requisitos de hardware

- Entrenamiento: una única GPU RTX 5070 Ti en FP32, según la información del autor.
- Inferencia: FP32, con media de la posterior y watermark bypass; no se documenta soporte de cuantización inferior.
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB y el checkpoint tiene 317 tensores de estado. No se publica el número de parámetros ni una cifra de VRAM medida.
- GPU recomendadas: no especificadas por el autor; el único hardware citado es la RTX 5070 Ti usada en entrenamiento.
- ¿Cabe en GPU de consumo? No confirmado por el autor. El tamaño del repositorio (0,4 GB) y el hecho de que el entrenamiento cupo en una RTX 5070 Ti sugieren que es viable en GPU de consumo, pero no hay medición publicada.
- Opciones de despliegue: el repositorio incluye `inference.py` y `requirements.txt` para inferencia autónoma. Requiere Python 3.11; las versiones probadas son Torch y torchaudio 2.8.0, con soporte CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/latentes | Mel + STFT ↓ | Raw SI-SDR, dB ↑ | WER turco, % ↓ | Licencia |
|---|---|---|---:|---:|---:|---|
| DACVAE-Turkish | VAE de audio (fine-tune turco) | 128 canales, 25 fps, 48 kHz | 1,070183 | 17,4190 | 4,1215 | Apache 2.0 |
| Inicialización japonesa (Aratako/Semantic-DACVAE-Japanese) | VAE de audio (japonés) | no disponible en esta ficha | 1,236868 | 17,4423 | 4,9892 | no disponible |
| Meta DACVAE (facebook/dacvae-watermarked) | VAE de audio (watermarked) | no disponible en esta ficha | 1,342712 | 16,8840 | 4,9892 | no disponible |

El WER turco de la inicialización japonesa y de Meta DACVAE coincide (4,9892 %), lo que sugiere que la mejora del WER proviene de la etapa turca. En SI-SDR bruto, la inicialización japonesa supera ligeramente a DACVAE-Turkish (17,4423 frente a 17,4190 dB), mientras que DACVAE-Turkish gana de forma clara en pérdida espectral y en WER/CER. No se dispone de comparativas con otros codecs neuronales (por ejemplo EnCodec o SoundStream) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de texto a voz; solo reconstruye audio. No debe presentarse como TTS.
- El profesor semántico y el GAN se desactivaron: el modelo no reclama alineación semántica turca nueva ni verificada.
- Entrenamiento con una sola semilla (42); los experimentos previos de tres semillas usaron peso de forma de onda 0 y no establecen robustez de semilla para esta versión.
- Exposición de entrenamiento muy limitada: 1.667 horas de audio presentado (2.000 recortes de 3 s), no una pasada completa sobre las 59,36 horas disponibles.
- La validación se usó de forma repetida para desarrollo; los intervalos no contemplan la selección de modelo ni la incertidumbre de la semilla de entrenamiento.
- No hay test final intacto, ni MOS con escucha ciega, ni evaluación de similitud de hablante, ni resultado TTS posterior.
- La deduplicación no garantiza disjunción de hablantes físicos entre particiones (las particiones se agrupan por programa/episodio).
- Los datos de audio, transcripciones e identidades no se distribuyen con el modelo, lo que dificulta la reproducibilidad completa.
- Riesgo de sobreajuste al dominio de podcast turco privado; el comportamiento fuera de ese dominio no está caracterizado.
- La mejora frente a Meta DACVAE no puede atribuirse íntegramente a la etapa turca, ya que la inicialización japonesa ya reducía la pérdida espectral.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base (Aratako y Meta DACVAE) antes de un despliegue en producción.
- La inferencia está fijada a FP32 sin cuantizaciones probadas; requisitos de VRAM no publicados.
- El repositorio de entrenamiento (github.com/kadirnar/vae-train) es privado y no accesible para auditar la historia completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VoiceHub/DACVAE-Turkish
- Modelo base (japonés): https://huggingface.co/Aratako/Semantic-DACVAE-Japanese
- Checkpoint original de Meta: https://huggingface.co/facebook/dacvae-watermarked
- Conjunto de datos privado: https://huggingface.co/datasets/Vyvo/tr-dataset-12
- Repositorio de entrenamiento/informe (privado): https://github.com/kadirnar/vae-train
- Revisión de inicialización: `Aratako/Semantic-DACVAE-Japanese@96adcf1937e1ff46ec0817a07c80f2d7d64998f0`
- Revisión del checkpoint Meta: `facebook/dacvae-watermarked@8680102d141858a21bd533543966a2eb2e569f92`
- Revisión del conjunto de datos: `847aeb429875352823edbbd989bfc9792243a890`
- Commit fuente de entrenamiento: `ef31744fc12e40e9254f175e6920e78913a51107`
