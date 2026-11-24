# wq2012/univ_full_eres2conformer_xl_diar_adapt

## Resumen

`univ_full_eres2conformer_xl_diar_adapt` es un extractor de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de locutor. El modelo emplea una arquitectura ERes2Conformer en variante `xl`, con pooling temporal atencional (`catp`) y un objetivo de entrenamiento Sub-Center ArcFace (K=3, scale=32, margin=0.32). Genera embeddings de 256 dimensiones que se comparan mediante similitud coseno.

El checkpoint es un modelo "flagship" universal entrenado sobre siete corpus (VoxCeleb1/2, CN-Celeb 1+2, LibriSpeech 960h, Fisher, AMI, ICSI y CallHome), totalizando 24.110 locutores y 2.481.542 emisiones limpias, con aumento de datos mediante perturbación de velocidad y MUSAN/RIR. Está adaptado específicamente a diarización conversacional, ya que incluye turnos de conversación con solapamiento restado en el conjunto de entrenamiento.

Es relevante para quienes trabajan en verificación de locutor y diarización en ecosistemas JAX/Flax, un nicho poco cubierto frente a la abundancia de modelos PyTorch. El modelo incluye exportaciones TFLite (FP32 e INT8) para despliegue en dispositivos, aunque con una ventana fija de 180 frames (1,8 s).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (`xl`) con pooling temporal atencional (`catp`) |
| Parametros totales | 64.485.852 (safetensors); 64.376.300 en inferencia (encoder + cabeza de scoring, excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; audio de hasta 3000 frames (30 s) en inferencia JAX con máscara completa |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones TFLite del encoder); pesos originales en safetensors/msgpack |
| Idiomas soportados | no disponible (el modelo opera sobre audio, no texto; entrenado con corpus multilingües como CN-Celeb y LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El backbone es un ERes2Conformer en tamaño `xl`, una arquitectura que combina bloques convolucionales con mecanismos de atención tipo Conformer para extraer representaciones de locutor robustas. Sobre la salida del encoder se aplica un pooling temporal atencional (`catp`, adaptado de un paper de identificación de idioma) que agrega la información a lo largo del tiempo en un vector de 256 dimensiones. La función de pérdida es Sub-Center ArcFace con K=3 subcentros, escala 32 y margen 0.32, y la verificación se realiza por similitud coseno.

El entrenamiento se realizó durante 78.000 pasos de gradiente con batch de 512 emisiones (aproximadamente 15,06 épocas), semilla 42, sobre 24.110 locutores y 2.481.542 emisiones limpias, expandidas mediante perturbación de velocidad de tres vías y aumentación MUSAN/RIR. Los recortes de entrenamiento fueron de longitud variable `U(80, 220)` frames con máscara de validez exacta. El frontend de audio es Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` (no es un `AutoFeatureExtractor` de Hugging Face). El autor documenta una verificación de reproducibilidad mediante huella de pérdida en el paso 0 y análisis de varianza entre semillas (desviación estándar de 0,08-0,41 % absoluto en EER agrupado de 1 utt).

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones para verificación e identificación.
- Verificación de locutor (1-utt y 3-utt) mediante similitud coseno.
- Reconocimiento de locutor sobre audio de hasta 30 s con inferencia JAX enmascarada de secuencia completa.
- Adaptación a diarización conversacional: entrenado con turnos de AMI, ICSI y CallHome con solapamiento restado.
- Robustez multilingüe y multidominio por el entrenamiento sobre siete corpus (inglés, chino y conversacional telefónico).
- Exportación TFLite FP32 e INT8 para despliegue en dispositivos con ventana fija de 180 frames.
- No soporta tool calling, agentes, visión ni generación de texto: es un modelo de audio de tipo feature-extraction.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera embeddings de 256 dimensiones comparables por coseno, adecuados para umbrales de aceptación/rechazo con EER documentado.
- Diarización de reuniones y llamadas: al haber sido entrenado con AMI, ICSI y CallHome, puede segmentar y agrupar turnos de habla en conversaciones multipartícipe.
- Autenticación de voz en call centers: permite comprobar la identidad del cliente en conversaciones telefónicas gracias al entrenamiento con CallHome y Fisher.
- Indexación y búsqueda de archivos de audio por locutor: los embeddings permiten agrupar y recuperar fragmentos de una misma voz en archivos de gran duración.
- Detección de locutor en pipelines de transcripción (speaker-attributed ASR): asignar hablante a cada segmento transcrito en reuniones o entrevistas.
- Despliegue en dispositivos embebidos o móviles: las exportaciones TFLite FP32/INT8 con ventana de 1,8 s permiten inferencia local con EER de 1,58 %/1,57 % en VoxCeleb1-O (recorte central).
- Investigación en ecosistemas JAX/Flax: sirve como referencia reproducible de ERes2Conformer sin dependencia de PyTorch.

## Benchmarks y rendimiento

Datos disponibles en la model card (EER de 1 utt, inferencia JAX enmascarada de secuencia completa salvo donde se indique):

| Benchmark | Resultado |
|---|---|
| VoxCeleb1-O (secuencia completa JAX) | 0,47 % EER |
| VoxCeleb1-O (TFLite FP32, recorte central 180 frames, 37.611 trials) | 1,58 % EER |
| VoxCeleb1-O (TFLite INT8, recorte central 180 frames) | 1,57 % EER |
| Fidelidad coseno FP32 vs INT8 (180 frames) | 0,999639 de media |

La model card menciona métricas adicionales (EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos bootstrap del 95 %, subconjunto de 10 locutores de VoxCeleb1-O) en `eval_results.json`, pero no se proporcionan sus valores numéricos en la información disponible. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,26 GB en FP32 (64,4 M de parámetros × 4 bytes) más overhead de activaciones; en INT8, aproximadamente 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3060 no representan limitación.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: JAX/Flax nativo (`flaxspeaker >= 0.8.0`), TFLite (FP32/INT8) para dispositivos, y carga desde Hugging Face Hub o directorio local mediante `load_pretrained`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| `univ_full_eres2conformer_xl_diar_adapt` | 64,4 M | Audio hasta 30 s (JAX); 1,8 s (TFLite) | Apache 2.0 | Hugging Face, PyPI (`flaxspeaker`), GitHub |
| ECAPA-TDNN (referencia habitual en speaker verification) | no disponible en esta ficha | no disponible | varía según checkpoint | amplia en Hugging Face/SpeechBrain |
| WavLM-based speaker models | no disponible en esta ficha | no disponible | varía según checkpoint | amplia en Hugging Face |
| ERes2Conformer original (PyTorch, WeSpeaker) | no disponible en esta ficha | no disponible | varía según checkpoint | GitHub de WeSpeaker |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementación independiente en JAX/Flax basada únicamente en papers publicados.
- Las exportaciones TFLite usan una ventana fija de 180 frames (1,8 s) con recorte central, lo que degrada el EER de 0,47 % a aproximadamente 1,58 % frente a la inferencia JAX de secuencia completa.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face; requiere `flaxspeaker.AudioFrontend` con VAD y CMVN específicos, lo que complica la integración con pipelines estándar.
- Riesgo de sesgo por dominio: aunque entrenado con siete corpus, el rendimiento en condiciones acústicas no representadas (ruido extremo, micrófonos lejanos no vistos) no está documentado.
- Riesgo de falsos positivos/negativos en verificación biométrica; debe calibrarse el umbral por dominio y considerarse las implicaciones éticas y legales del reconocimiento de locutor.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.
- No se documentan los idiomas cubiertos de forma explícita ni el comportamiento en lenguas fuera de los corpus de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_xl_diar_adapt
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
