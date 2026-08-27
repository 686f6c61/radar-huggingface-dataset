# t8star/IndexTTS-2.5-T8

## Resumen

IndexTTS-2.5 es un sistema de text-to-speech (TTS) de clonación de voz zero-shot desarrollado por el equipo Index Team de Bilibili. A partir de un único clip de audio de referencia, el modelo es capaz de replicar la voz del hablante y generar habla natural en cinco idiomas: chino, inglés, japonés, español y árabe. La versión 2.5 incorpora control fino de emociones, control de velocidad de habla y control de pronunciación mediante fonemas (Pinyin, CMU y Kana japonés), además de una inferencia más rápida que su predecesor IndexTTS-2.

El repositorio `t8star/IndexTTS-2.5-T8` no es un lanzamiento oficial del modelo, sino un empaquetado de terceros preparado por el usuario T8star-Aix para facilitar su uso con el nodo de ComfyUI `T8mars/comfyui-indextts25-t8`. Incluye todos los archivos necesarios para la inferencia en un solo directorio, resolviendo la ausencia del archivo `bpe.model` en el repositorio oficial y evitando descargas adicionales de Wav2Vec2-BERT, CAMPPlus y BigVGAN. El tamaño total del repositorio es de 8,3 GB.

La arquitectura de IndexTTS-2.5 se compone de dos módulos principales: un módulo Text-to-Semantic (T2S) basado en transformer y un módulo Semantic-to-Mel (S2M) no autorregresivo. Esta combinación permite una réplica fiel de la emoción y un control autorregresivo de la duración, lo que lo hace especialmente adecuado para aplicaciones de doblaje, audiolibros y asistentes de voz personalizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (T2S) + no autorregresivo (S2M) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | chino, ingles, japones, espanol, arabe |
| Licencia | bilibili-model-license-and-third-party-licenses |
| Formato de pesos | safetensors, bin (CAMPPlus), config y generador (BigVGAN) |

## Arquitectura y entrenamiento

IndexTTS-2.5 se basa en la arquitectura introducida en IndexTTS-2, compuesta por dos módulos diferenciados. El módulo Text-to-Semantic (T2S) es un transformer autorregresivo que convierte el texto de entrada en una secuencia de unidades semánticas, mientras que el módulo Semantic-to-Mel (S2M) es no autorregresivo y transforma esas unidades en espectrogramas mel. Esta separación permite un control explícito de la duración y la emoción durante la síntesis.

El modelo incorpora un mecanismo de control de emociones a nivel fino, que permite ajustar la expresividad de la voz generada. Además, admite control de velocidad de habla y control de pronunciación mediante tres sistemas de fonemas: Pinyin para chino, fonemas CMU para inglés y Kana para japonés. La inferencia es más rápida que en IndexTTS-2, aunque no se han publicado detalles específicos sobre el número de parámetros, la composición del dataset de entrenamiento ni el uso de técnicas como RLHF o DPO.

El repositorio empaquetado incluye, además del modelo principal, los componentes auxiliares necesarios para la inferencia: el codificador Wav2Vec2-BERT 2.0 para la representación del habla, el modelo CAMPPlus para la extracción de características de timbre y el vocoder BigVGAN v2 a 22,05 kHz para la síntesis de forma de onda. Todos los pesos se mantienen byte-idénticos a sus fuentes originales.

## Capacidades

- Clonación de voz zero-shot: genera habla con la voz de un hablante a partir de un único clip de referencia de audio.
- Control fino de emociones: permite ajustar la expresividad y el tono emocional de la voz generada.
- Control de velocidad de habla: ajuste explícito de la velocidad de elocución.
- Control de pronunciación: soporte de Pinyin (chino), fonemas CMU (inglés) y Kana (japonés) para una articulación precisa.
- Multilingüe: soporta cinco idiomas (chino, inglés, japonés, español y árabe) con un único modelo.
- Inferencia rápida: más rápida que IndexTTS-2, aunque no se especifican cifras concretas.
- Integración con ComfyUI: el empaquetado está diseñado para funcionar directamente con el nodo `comfyui-indextts25-t8`.

## Casos de uso

- Doblaje de vídeo y localización de contenido: el modelo puede generar voces dobladas en cinco idiomas a partir de una voz de referencia, lo que permite doblar series, películas o vídeos corporativos manteniendo la identidad vocal del actor original.
- Audiolibros y narración: con el control de emociones y velocidad, se pueden producir narraciones expresivas para audiolibros, podcasts o contenido educativo, ajustando el tono según el pasaje.
- Asistentes de voz personalizados: empresas o creadores pueden clonar una voz propia o de un personaje para usarla en asistentes virtuales, chatbots de voz o sistemas de respuesta interactiva.
- Accesibilidad: generación de voz para personas con discapacidad del habla, permitiendo que conserven una voz similar a la suya a partir de una grabación previa.
- Creación de contenido para redes sociales: generación de voces para vídeos cortos, memes de audio o personajes animados, con control fino de la emoción para adaptarse al guion.
- Pruebas de producto y prototipado: los equipos de producto pueden generar muestras de voz realistas para probar interfaces de voz, asistentes o sistemas de navegación sin necesidad de grabar con actores de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe técnico de IndexTTS-2.5 está disponible en la página del proyecto, pero no se han incluido métricas numéricas en los materiales consultados.

## Requisitos de hardware

- El tamaño del repositorio es de 8,3 GB, lo que indica que el modelo completo requiere un espacio de almacenamiento considerable.
- No se han publicado requisitos mínimos de VRAM ni GPU recomendadas en la información disponible.
- Al tratarse de un modelo TTS con componentes de transformer y vocoder, se recomienda una GPU con al menos 8 GB de VRAM para una inferencia fluida, aunque no hay confirmación oficial.
- El empaquetado está pensado para su uso con ComfyUI, por lo que el despliegue se realiza a través de ese entorno, colocando el directorio en `ComfyUI/models/TTS/IndexTTS-2.5/`.
- No se dispone de datos sobre latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación zero-shot | Control de emociones | Control de velocidad | Licencia |
|---|---|---|---|---|---|
| IndexTTS-2.5 (este repo) | zh, en, ja, es, ar | Sí | Sí | Sí | bilibili (uso comercial restringido) |
| IndexTTS-2 | zh, en | Sí | Sí | Sí | bilibili |
| XTTS v2 (Coqui) | 17 idiomas | Sí | Parcial | No | CPML (no comercial) |

La comparativa se basa en información pública general. No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial: no está avalado ni garantizado por los titulares originales de IndexTTS-2.5. El autor del empaquetado declara explícitamente que los derechos originales no respaldan esta distribución.
- La licencia es la de Bilibili (bilibili-model-license-and-third-party-licenses), que puede imponer restricciones al uso comercial. Es necesario revisar el archivo LICENSE antes de cualquier uso en producción.
- El modelo incluye componentes de terceros (Wav2Vec2-BERT, CAMPPlus, BigVGAN) con sus propias licencias, que deben respetarse por separado.
- No se han publicado datos sobre sesgos en las voces generadas ni sobre la robustez ante acentos o hablantes no representados en el entrenamiento.
- Al ser un sistema de clonación de voz, existe el riesgo de uso indebido para suplantación de identidad. Se recomienda aplicar medidas de verificación y consentimiento en aplicaciones públicas.
- La calidad de la clonación depende de la calidad del clip de referencia; audios con ruido o distorsión pueden degradar el resultado.
- No se dispone de información sobre la latencia en diferentes hardware ni sobre el comportamiento en entornos de producción a gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t8star/IndexTTS-2.5-T8
- Nodo ComfyUI: https://github.com/T8mars/comfyui-indextts25-t8
- Repositorio oficial IndexTTS: https://github.com/index-tts/index-tts
- Informe técnico de IndexTTS-2.5: https://index-tts.github.io/index-tts2-5.github.io/
- Repositorio oficial del modelo (IndexTeam/IndexTTS-2.5): https://huggingface.co/IndexTeam/IndexTTS-2.5
- Repositorio de IndexTTS-2 (para bpe.model): https://huggingface.co/IndexTeam/IndexTTS-2
- Wav2Vec2-BERT 2.0: https://huggingface.co/facebook/w2v-bert-2.0
- CAMPPlus: https://huggingface.co/funasr/campplus
- BigVGAN v2: https://huggingface.co/nvidia/bigvgan_v2_22khz_80band_256x
