# Williiii/piper-voices

## Resumen

`Williiii/piper-voices` es un repositorio de voces preentrenadas para Piper, el sistema de síntesis de voz (text-to-speech, TTS) de código abierto desarrollado en el ecosistema Rhasspy. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de una colección de pesos en formato ONNX listos para su uso con el motor de inferencia Piper, que emplea arquitecturas ligeras basadas en VITS para generar audio a partir de texto.

El repositorio agrupa voces para 35 idiomas (árabe, catalán, checo, galés, danés, alemán, griego, inglés, español, persa, finés, francés, húngaro, islandés, italiano, georgiano, kazajo, luxemburgués, letón, nepalí, neerlandés, noruego, polaco, portugués, rumano, ruso, eslovaco, esloveno, serbio, sueco, suajili, turco, ucraniano, vietnamita y chino), lo que lo convierte en un recurso práctico para aplicaciones de asistencia por voz, domótica y accesibilidad multilingüe.

Su relevancia radica en que Piper está diseñado para inferencia en CPU con requisitos de hardware muy modestos, lo que permite desplegar TTS de calidad razonable en dispositivos de borde (Raspberry Pi, mini-PC, servidores sin GPU). El tamaño del repositorio (12,2 GB) refleja la suma de todas las voces incluidas, cada una con sus pesos ONNX y ficheros de configuración asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante ligera de Piper, basada en transformer y flujos normalizadores) |
| Parametros totales | no disponible (depende de cada voz; las voces Piper suelen oscilar entre 15 y 100 millones de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; es un modelo TTS por fonemas) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX, habitualmente en fp32 o fp16 según la voz) |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Piper emplea una arquitectura de síntesis de voz basada en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), adaptada para inferencia eficiente en CPU. El pipeline incluye un codificador de texto fonemizado, un módulo de duración y un decodificador que genera la forma de onda directamente, sin necesidad de un vocoder separado. Las voces se distribuyen como ficheros ONNX junto con un fichero JSON de configuración que define el mapeo de fonemas, la frecuencia de muestreo y otros parámetros de inferencia.

No se dispone de información detallada en la model card sobre el número de tokens de entrenamiento, la composición de los datasets por idioma ni si se aplicaron técnicas de RLHF o ajuste fino supervisado. La documentación oficial de Piper indica que las voces se entrenan con datos de dominio público y corpus específicos por idioma, y que el proyecto mantiene un repositorio separado de checkpoints (`rhasspy/piper-checkpoints`) para quienes deseen reentrenar o ajustar voces propias.

## Capacidades

- Síntesis de voz (text-to-speech) en 35 idiomas, incluyendo español, catalán, inglés, alemán, francés, italiano, portugués, ruso, chino, árabe y una amplia representación de lenguas europeas y asiáticas.
- Generación de audio a partir de texto fonemizado, con control de velocidad mediante el parámetro `length_scale` del motor Piper.
- Inferencia en CPU sin necesidad de GPU, lo que facilita el despliegue en dispositivos de borde.
- Soporte de múltiples voces por idioma (según la disponibilidad de cada una en el repositorio).
- Integración con el ecosistema Rhasspy para asistentes de voz locales (Home Assistant, Rhasspy Assistant).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales más allá de la síntesis de voz.

## Casos de uso

- Asistentes de voz locales para domótica: integración con Home Assistant o Rhasspy para leer estados de sensores, confirmar comandos y responder consultas en el idioma del usuario, aprovechando la inferencia en CPU y la baja latencia de Piper.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla, artículos o notificaciones a voz en tiempo real en dispositivos de bajo consumo como Raspberry Pi.
- Sistemas de anuncios públicos y megafonía: generación de avisos pregrabados o dinámicos en múltiples idiomas para aeropuertos, estaciones o comercios, sin depender de servicios cloud.
- Lectura de contenidos y podcasts automatizados: síntesis de artículos, boletines o resúmenes en varios idiomas para distribución como audio, con control de velocidad y voz.
- Juguetes interactivos y dispositivos IoT: incorporación de voz sintética en hardware embebido con recursos limitados, donde no es viable ejecutar modelos TTS basados en GPU.
- Prototipado de interfaces conversacionales: generación rápida de respuestas habladas en entornos de desarrollo y pruebas de usabilidad, sin coste de API ni latencia de red.
- Localización de contenidos multimedia: doblaje automático de vídeos o tutoriales a los 35 idiomas soportados para mercados regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; Piper está diseñado para ejecutarse en CPU. Cada voz ONNX ocupa típicamente entre 20 y 100 MB, por lo que la memoria RAM necesaria es mínima (menos de 500 MB por instancia).
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU de un solo núcleo moderno con latencia aceptable.
- ¿Cabe en consumer GPU? Sí, pero no es necesario; el modelo está optimizado para CPU y funciona en Raspberry Pi 3/4/5, mini-PC y servidores sin acelerador.
- Opciones de despliegue: motor Piper (binario oficial), `piper-tts` (paquete Python), integración con Home Assistant, Rhasspy, y contenedores Docker de la comunidad.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la documentación de Piper indica que en CPU moderna se alcanza síntesis en tiempo real o superior para voces de tamaño medio.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Requisitos |
|---|---|---|---|---|---|
| Williiii/piper-voices (Piper) | TTS VITS | 35 | MIT | ONNX | CPU, RAM mínima |
| Coqui TTS (XTTS v2) | TTS neuronal | ~17 | MPL 2.0 (con restricciones) | PyTorch | GPU recomendada |
| eSpeak NG | TTS por formantes | >100 | GPLv3 | Binario | CPU, muy ligero |
| MaryTTS | TTS concatenativo/HMM | ~10 | LGPL | Java | CPU |

Piper se posiciona como una alternativa ligera y de licencia permisiva (MIT) frente a Coqui TTS (más pesado y con licencia más restrictiva para uso comercial en algunas versiones) y a eSpeak NG (más ligero pero con calidad de voz robótica). MaryTTS ofrece calidad inferior y menor cobertura de idiomas. No se dispone de datos comparativos de benchmarks objetivos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente TTS: no procesa lenguaje natural, no razona y no responde a instrucciones.
- La calidad de la voz varía significativamente entre idiomas y entre voces individuales; algunas lenguas pueden tener una o muy pocas voces disponibles.
- No se dispone de información sobre sesgos demográficos o acentos específicos en las voces incluidas.
- Riesgo de prosodia incorrecta o pronunciación errónea en textos con nombres propios, siglas o palabras fuera del vocabulario fonético del idioma.
- La licencia MIT del repositorio permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento de cada voz individual, ya que Piper agrega voces de distintas fuentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una copia o agregación reciente sin validación comunitaria extensa.
- No se especifica en la model card el pipeline de Hugging Face ni metadatos de uso; la integración debe realizarse a través del motor Piper, no mediante `transformers`.
- El tamaño del repositorio (12,2 GB) implica una descarga considerable si se necesitan todas las voces; se recomienda descargar solo las voces relevantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Williiii/piper-voices
- Proyecto Piper (GitHub): https://github.com/rhasspy/piper
- Documentación de entrenamiento de Piper: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints de Piper para reentrenamiento: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Rhasspy (ecosistema de asistentes de voz): https://rhasspy.readthedocs.io/
