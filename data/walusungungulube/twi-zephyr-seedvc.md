# walusungungulube/twi-zephyr-seedvc

## Resumen

Twi Voice Converter - Seed-VC fine-tuned for "Zephyr" es un modelo de conversión de voz (voice conversion, VC) publicado por el usuario walusungungulube en Hugging Face bajo el identificador `walusungungulube/twi-zephyr-seedvc`. No se trata de un modelo de lenguaje, sino de un modelo generativo de audio: recibe una grabación de voz cualquiera y la re-sintetiza manteniendo el contenido lingüístico pero sustituyendo la identidad vocal por la del hablante sintético denominado *Zephyr*. Está construido como un ajuste fino del modelo Seed-VC V1, en su variante `seed-uvit-whisper-small-wavenet`, que combina un encoder de contenido basado en Whisper-small con un decoder DiT (Diffusion Transformer) sobre mel-espectrogramas y un vocoder neuronal BigVGAN, todo a 22,05 kHz.

El interés del modelo es doble. Por un lado, aplica una arquitectura de conversión de voz zero-shot de referencia (Seed-VC) a un dominio escasamente cubierto: el twi (akan), una lengua hablada en Ghana por millones de personas y con recursos tecnológicos limitados. Por otro, lo hace sobre un dataset público concreto, `ghananlpcommunity/ghana-twi-synthesized-speech`, lo que permite reproducir y auditar el proceso de ajuste. El resultado es un sistema capaz de convertir cualquier audio de entrada a la voz de Zephyr, entrenado con más de 10.000 locuciones limpias en twi.

El repositorio es pequeño (0,4 GB), no acumula descargas ni valoraciones en el momento de la consulta, y se distribuye con la misma licencia GPL-3.0 del proyecto Seed-VC del que deriva. La información pública disponible es limitada: no se publican métricas de calidad (MOS, similitud de hablante, WER), ni detalles sobre cuantización, ni resultados de benchmarks comparativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seed-VC V1 `seed-uvit-whisper-small-wavenet`: encoder de contenido Whisper-small + decoder DiT (Diffusion Transformer) sobre mel-espectrograma + vocoder BigVGAN, a 22,05 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: el modelo no procesa contexto textual; trabaja sobre segmentos de audio de entrada |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en precisión de entrenamiento, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no declarado explícitamente; el ajuste fino se realizó sobre datos en twi (akan). Seed-VC es agnóstico al idioma en la conversión, por lo que puede procesar audio en otras lenguas con la calidad del modelo base |
| Licencia | GPL-3.0 (obra derivada de Seed-VC; el fichero `LICENSE` es el del proyecto upstream) |
| Formato de pesos | PyTorch `.pth` (`ft_model.pth`, checkpoint de DiT + BigVGAN) acompañado de configuración YAML (`config_dit_mel_seed_uvit_whisper_small_wavenet.yml`) |

Otros datos relevantes del repositorio: tamaño total 0,4 GB, creado el 15 de septiembre de 2026, pipeline de Hugging Face no declarado, etiqueta de región `region:us`.

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Seed-VC V1. El pipeline se compone de tres bloques: un encoder de contenido basado en Whisper-small, que extrae representaciones lingüísticas y prosódicas del audio de entrada; un decoder DiT que genera el mel-espectrograma objetivo mediante difusión, condicionado por el embedding de timbre extraído de una locución de referencia (`ref_zephyr.wav` en este caso); y un vocoder BigVGAN que convierte el mel-espectrograma en la forma de onda final a 22,05 kHz. La separación entre contenido y timbre es lo que permite conservar el mensaje hablado mientras se sustituye la identidad vocal. El stack de inferencia descarga además pesos auxiliares (CAM++ y OpenVoice) bajo sus propias licencias.

El ajuste fino se describe de forma escueta en la model card. El dataset empleado es `ghananlpcommunity/ghana-twi-synthesized-speech`, restringido al hablante *Zephyr*, con aproximadamente 10.500 clips válidos y limpios en twi. El entrenamiento consta de 2.500 pasos con batch size 2, con checkpoints guardados cada 1.250 pasos. La línea base declarada es el modelo zero-shot `seed-uvit-whisper-small-wavenet` sin ajustar. No se documentan estrategias de RLHF, DPO ni preferencias humanas, algo esperable en un modelo de conversión de voz; tampoco se especifican el número total de tokens de audio vistos, la composición exacta del dataset, la duración agregada en horas ni el hardware de entrenamiento. La inferencia expone tres parámetros ajustables: `--diffusion-steps` (25 en el ejemplo del autor, 20 en el endpoint HTTP), `--length-adjust` (1.0) y `--inference-cfg-rate` (0.7).

## Capacidades

- Conversión de voz many-to-one: transforma cualquier locución de entrada en la voz del hablante sintético Zephyr, conservando el contenido lingüístico del audio original.
- Procesamiento de audio a 22,05 kHz con vocoder BigVGAN, lo que sitúa la salida en calidad de banda ancha de voz.
- Transferencia de timbre guiada por referencia: el hablante objetivo se especifica mediante un fichero de audio (`ref_zephyr.wav`), sin necesidad de reentrenar.
- Control de prosodia temporal mediante `length_adjust`, que permite ajustar la duración del audio generado.
- Control de fidelidad/estilo mediante `diffusion_steps` y `inference_cfg_rate`, que regulan el compromiso entre calidad, fidelidad al timbre objetivo y coste computacional.
- Operación agnóstica al idioma de entrada, gracias al encoder de contenido Whisper-small; el ajuste específico se ha hecho sobre twi.
- Inferencia por línea de comandos mediante el repositorio Seed-VC, o por HTTP contra un endpoint serverless desplegado en Modal.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, ni procesamiento de texto: es exclusivamente un modelo de audio.

## Casos de uso

- Localización de contenido audiovisual a twi: dado que el modelo transfiere el timbre de Zephyr a cualquier audio de entrada, se puede usar para doblar vídeos, entrevistas o material formativo al twi manteniendo una identidad vocal coherente en toda la serie de episodios.
- Producción de voz sintética consistente para TTS en akan: al fijar una única identidad (Zephyr), sirve como capa de personalización vocal sobre un sistema TTS en twi, garantizando que todo el contenido generado suene con la misma voz de marca.
- Audiolibros y contenido accesible en lenguas ghanesas: convertir la locución de un lector a la voz objetivo permite producir versiones consistentes de textos largos sin depender de la disponibilidad del mismo locutor en cada sesión de grabación.
- Investigación en tecnologías del lenguaje para lenguas de bajos recursos: el modelo, junto con el dataset público de entrenamiento, proporciona un punto de partida reproducible para estudiar conversión de voz en akan y comparar con otras aproximaciones.
- Anonimización de voz en material sensible: al reemplazar la identidad vocal de grabaciones por la de Zephyr, se puede publicar audio de entrevistas o testimonios preservando el contenido pero reduciendo la identificabilidad del hablante (con las cautelas legales correspondientes, véase la sección de limitaciones).
- Prototipado de asistentes de voz en twi: integrado tras un reconocedor y un generador de texto, el modelo aporta la capa de síntesis con una voz estable, útil para demos y validación temprana de producto sin contratar a un locutor profesional.
- Creación de material didáctico y educativo: generar audios de vocabulario, lecturas o diálogos en twi con una voz uniforme facilita la producción de recursos de aprendizaje de la lengua.
- Restauración y normalización de timbre en archivos de audio: cuando un corpus histórico mezcla varios locutores con calidades dispares, la conversión a una única voz de referencia permite homogeneizar el material antes de su publicación o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, similitud de hablante con embeddings como ECAPA-TDNN o CAM++, WER del contenido tras la conversión, EER de verificación) ni comparaciones cuantitativas con el modelo base. Tampoco se publican medidas de latencia o throughput. La única información de entrenamiento disponible es el número de pasos (2.500), el batch size (2) y el tamaño del dataset (~10.500 clips).

## Requisitos de hardware

Las cifras de esta sección son estimaciones orientativas basadas en el tamaño del repositorio (0,4 GB) y en los componentes de la arquitectura (Whisper-small para el encoder, DiT, BigVGAN); el autor no publica requisitos oficiales.

- VRAM para inferencia: el checkpoint distribuido ocupa 0,4 GB; sumando encoder de contenido, vocoder y pesos auxiliares (CAM++/OpenVoice), es razonable esperar un consumo de unos pocos gigabytes, compatible con GPU de gama de consumo media. No hay medición publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA razonablemente reciente debería poder ejecutar la inferencia; no se especifica un modelo concreto en la documentación.
- ¿Cabe en GPU de consumo? Previsiblemente sí, dado el tamaño del modelo y su naturaleza (tarea de audio, no de texto de gran escala). No confirmado por el autor.
- Opciones de despliegue: inferencia local mediante el repositorio Seed-VC (`inference.py`) con el checkpoint `ft_model.pth` y el YAML de configuración; o llamada HTTP al endpoint serverless en Modal (`https://walusungungulube--convert.modal.run/convert`), que arranca bajo demanda y no está siempre activo. No se documentan soportes para vLLM, TGI, Ollama ni llama.cpp, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste depende directamente de `diffusion_steps` (20-25 en los ejemplos) y de la duración del audio de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Ajuste específico | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twi-zephyr-seedvc (este modelo) | Conversión de voz many-to-one (Seed-VC V1) | Sí, sobre twi / hablante Zephyr, ~10,5k clips | No declarada; entrenado en twi | GPL-3.0 | Hugging Face + Space + endpoint Modal |
| Seed-VC V1 `seed-uvit-whisper-small-wavenet` (Plachtaa) | Conversión de voz zero-shot | No | Agnóstico al idioma | Según repositorio upstream (el modelo card lo declara GPL-3.0) | Hugging Face |
| RVC (Retrieval-based Voice Conversion) | Conversión de voz many-to-one entrenable por hablante | Requiere entrenamiento por voz objetivo | Agnóstico al idioma | No verificada en la información disponible | Repositorio público |
| OpenVoice V2 (MyShell) | Clonación de voz y conversión de estilo | Modelo multilingüe preentrenado | Multilingüe | No verificada en la información disponible | Hugging Face |

Datos de parámetros y de rendimiento comparado no disponibles para ninguno de los sistemas, ya que los autores no publican métricas homogéneas. La comparativa debe tomarse como orientativa respecto a la categoría funcional, no como una evaluación cuantitativa.

## Limitaciones y advertencias

- Riesgo de uso indebido: la conversión de voz permite suplantar identidades. El uso sobre voces de terceros sin consentimiento explícito puede ser ilegal en jurisdicciones con normativa sobre deepfakes y derechos de imagen.
- Sesgo de dominio: el ajuste fino se ha hecho sobre un único dataset y un único hablante sintético (Zephyr), procedente de un corpus de voz *sintetizada*. Esto puede introducir artefactos propios del TTS de origen y limitar la naturalidad fuera del dominio twi.
- Idiomas no cubiertos explícitamente: aunque el encoder Whisper-small es multilingüe, no hay evidencia publicada sobre el comportamiento del modelo ajustado con entradas en lenguas distintas del twi.
- Sin métricas de calidad: no existen evaluaciones de MOS, similitud de hablante ni inteligibilidad, por lo que no es posible estimar su rendimiento frente al modelo base zero-shot de forma objetiva.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Integrar el modelo o sus derivados en productos propietarios puede exigir la liberación del código correspondiente. Conviene revisar la compatibilidad antes de un uso comercial.
- Licencias adicionales en cascada: el stack de inferencia descarga automáticamente pesos de CAM++ y OpenVoice bajo sus propias licencias, y el dataset de entrenamiento tiene sus propios términos de uso. Todas ellas condicionan el uso final.
- Sin cuantizaciones ni formatos optimizados: solo se distribuye el checkpoint `.pth` en precisión de entrenamiento, lo que limita las opciones de despliegue en entornos sin GPU.
- Infraestructura de demo intermitente: el endpoint en Modal arranca bajo demanda, por lo que la primera petición puede tardar y no es adecuado como servicio en producción sin un despliegue propio.
- Repositorio sin adopción: cero descargas y cero valoraciones en el momento de la consulta, sin señales externas de validación por parte de la comunidad.
- Sobre el contenido de las búsquedas web: los resultados devueltos por la búsqueda no guardan ninguna relación con este modelo (corresponden a páginas de una aseguradora alemana), por lo que no aportan información adicional aprovechable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/walusungungulube/twi-zephyr-seedvc
- Space de inferencia: https://huggingface.co/spaces/walusungungulube/twi-zephyr-voice-converter
- Endpoint HTTP serverless (Modal): https://walusungungulube--convert.modal.run/convert
- Repositorio Seed-VC (código e inferencia): https://github.com/Plachtaa/seed-vc
- Pesos base de Seed-VC: https://huggingface.co/Plachtaa/seed-vc
- Dataset de entrenamiento: https://huggingface.co/datasets/ghananlpcommunity/ghana-twi-synthesized-speech
