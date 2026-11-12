# Thorsten-Voice/Coqui

## Resumen

Thorsten-Voice/Coqui es un repositorio de archivo que agrupa tres modelos de síntesis de voz (text-to-speech) en alemán entrenados con Coqui TTS y basados en la voz del desarrollador Thorsten Müller. Incluye un modelo VITS de extremo a extremo, un modelo Tacotron2-DDC y el vocoder HifiGAN asociado a este último. El repositorio se publica como copia de seguridad tras el cierre de Coqui AI a principios de 2024, para que los modelos sigan disponibles aunque desaparezca el catálogo original.

La relevancia de estos modelos es fundamentalmente práctica y legal: se entrenaron exclusivamente con grabaciones del propio autor, liberadas bajo CC0 (dominio público), y los pesos se publican bajo licencia Apache 2.0, lo que permite explícitamente el uso comercial sin las restricciones habituales de los datasets de voz de terceros. Todos los modelos generan audio mono a 22.050 Hz y pueden ejecutarse en CPU, con aceleración opcional mediante GPU NVIDIA.

No se trata de un modelo de lenguaje ni de un transformer generativo de texto: son sistemas TTS neuronales ligeros (VITS y Tacotron2 + HifiGAN) orientados a una única voz en alemán. El repositorio ocupa 1,9 GB e incluye pesos en formato `.pth` / `.pth.tar` junto con sus ficheros `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end) y Tacotron2-DDC + vocoder HifiGAN v1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (`de`) |
| Licencia | Apache 2.0 (pesos); grabaciones de voz originales bajo CC0 |
| Formato de pesos | `.pth` (VITS, Tacotron2-DDC) y `.pth.tar` (HifiGAN), con `config.json` |
| Frecuencia de muestreo | 22.050 Hz, mono |
| Libreria | Coqui TTS (fork comunitario `idiap/coqui-ai-TTS`) |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El repositorio contiene dos pipelines TTS distintos. El primero es VITS, un modelo de síntesis de extremo a extremo que combina codificador de texto, predictor de duración, flujo normalizador y decodificador generativo en una sola red, con salida directa de forma de onda. El segundo es Tacotron2-DDC (Decoder-Decoder Consistency), un modelo autorregresivo de predicción de mel-espectrogramas que requiere un vocoder separado, en este caso HifiGAN v1, para convertir el espectrograma en audio. Ambos pipelines producen audio mono a 22.050 Hz.

El entrenamiento se realizó exclusivamente con grabaciones de la voz de Thorsten Müller, liberadas bajo CC0. El modelo VITS se entrenó sobre el dataset Thorsten-22.05-neutral y el par Tacotron2-DDC + HifiGAN sobre Thorsten-Dec2021-22k. No se dispone de información sobre número de tokens, horas de audio, composición exacta del dataset ni sobre el uso de técnicas de alineamiento forzado, RLHF o ajuste fino adicional. Como innovación práctica destacable, el modelo VITS utiliza gruut en lugar de espeak-ng para la fonemización, lo que elimina la dependencia de una librería GPL-3.0 en la cadena de inferencia.

## Capacidades

- Síntesis de voz en alemán a partir de texto, con salida de audio mono a 22.050 Hz.
- Dos alternativas de calidad y dependencias: VITS sin espeak-ng (fonemización con gruut) y Tacotron2-DDC con espeak-ng, que según el autor suena ligeramente más natural.
- Inferencia en CPU; aceleración opcional con GPU NVIDIA mediante `--device cuda`.
- Interfaz de servidor web incluida (`tts-server`, puerto 5002) para pruebas interactivas.
- Integración con la CLI de Coqui TTS, tanto por nombre de modelo del catálogo como por rutas locales de pesos y configuración.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es multilingüe: únicamente alemán.
- Voz única (la del autor); no se documenta clonación de voz ni control de emoción o estilo.

## Casos de uso

- Audiolibros y narración en alemán: el modelo VITS genera voz consistente y ligera que puede ejecutarse en CPU, adecuada para procesar lotes de texto largos sin infraestructura GPU dedicada.
- Asistentes de voz y sistemas de respuesta por voz (IVR) en alemán: al ser Apache 2.0 y entrenado con voz CC0, puede integrarse en productos comerciales sin las restricciones de licencia típicas de voces de terceros.
- Accesibilidad y lectores de pantalla: la baja latencia y el funcionamiento en CPU permiten desplegar la síntesis localmente en equipos de usuario final sin conexión.
- Generación de contenido para vídeo y pódcast: el par Tacotron2-DDC + HifiGAN, que según el autor suena más natural, es adecuado para narraciones pregrabadas donde la calidad prima sobre la latencia.
- Prototipado e investigación en TTS: al ser un archivo de modelos Coqui con configuración completa, sirve como referencia reproducible para comparar VITS frente a Tacotron2-DDC en alemán.
- Pruebas de integración en pipelines de CI: la CLI `tts` permite generar muestras de audio de verificación en tests automatizados sin dependencias de servicios en la nube.
- Demos interactivas en navegador: `tts-server` expone una interfaz web en localhost:5002 para validar pronunciación y prosodia antes de integrar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia viable en CPU; el autor indica explícitamente que los modelos funcionan sin GPU.
- GPU NVIDIA opcional para acelerar la síntesis mediante `--device cuda`.
- No se especifica VRAM mínima ni recomendada; por el tamaño del repositorio (1,9 GB para tres modelos) y la naturaleza de los mismos, la huella en memoria es reducida y cabe con holgura en GPU de consumo como RTX 3060 o RTX 4090.
- Despliegue mediante la CLI `tts` y el servidor `tts-server` del fork comunitario `idiap/coqui-ai-TTS`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Entorno: Python 3.10 o superior; el extra `codec` requiere FFmpeg; Tacotron2-DDC requiere además espeak-ng.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Licencia | Contexto / notas |
|---|---|---|---|---|
| Thorsten-Voice/Coqui (VITS) | TTS end-to-end | Alemán | Apache 2.0 | Sin espeak-ng; CPU; 22.050 Hz |
| Thorsten-Voice/Coqui (Tacotron2-DDC + HifiGAN) | TTS + vocoder | Alemán | Apache 2.0 (espeak-ng GPL-3.0) | Más natural según el autor; requiere espeak-ng |
| Alternativas Coqui TTS multilingües | TTS | Varios | Varía según modelo | No disponible en la información proporcionada |
| Modelos TTS comerciales en la nube | TTS | Varios | Propietaria | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo alemán; no admite otros idiomas.
- Voz única (la del autor); no hay soporte documentado de clonación, cambio de hablante ni control emocional.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, neologismos y términos extranjeros, habitual en sistemas TTS basados en fonemización.
- El modelo Tacotron2-DDC depende de espeak-ng, licenciado bajo GPL-3.0; el autor advierte de que conviene revisar las implicaciones si se distribuye un producto y sugiere VITS como alternativa sin esa dependencia.
- La configuración del vocoder HifiGAN requiere ajustar `audio.stats_path` a la ruta absoluta de `scale_stats.npy`, un paso manual propenso a errores.
- Al ser una copia de archivo de modelos originalmente distribuidos por Coqui AI (cerrada en 2024), el mantenimiento y las actualizaciones no están garantizados.
- No se han publicado métricas objetivas (MOS, WER, latencia) en la información disponible, lo que dificulta evaluar la calidad frente a alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción aún muy baja.
- No se documentan sesgos específicos del modelo; al entrenarse con una única voz, la diversidad acústica es por definición nula.

## Enlaces

- Hugging Face: https://huggingface.co/Thorsten-Voice/Coqui
- Guía de instalación (inglés): https://www.thorsten-voice.de/en/guides/coqui
- Guía de instalación (alemán): https://www.thorsten-voice.de/anleitungen/coqui
- Sobre las grabaciones: https://www.thorsten-voice.de/en/about/recordings
- Coqui TTS (fork comunitario): https://github.com/idiap/coqui-ai-TTS
