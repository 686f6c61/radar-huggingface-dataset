# Supernova11c/SUPERnova-TeraiTTS

## Resumen

SUPERnova-TeraiTTS es un conjunto de firmas vocales de referencia (reference audio) para clonacion de voz con el motor Coqui XTTS-v2, publicado por el usuario Supernova11c en Hugging Face. No se trata de un modelo entrenado de forma independiente, sino de un repositorio que contiene dos audios de referencia (`ref_en.wav` y `ref_ne.wav`) pensados para ser pasados como `speaker_wav` al motor XTTS-v2 y reproducir asi dos timbres vocales concretos: uno en ingles y otro en nepalí.

El objetivo declarado es sintetizar habla conversacional "natural y casual" con variacion de tono y ritmos de respiracion realistas. Para el nepalí, la model card indica que se utiliza el motor fonetico del hindi (`language="hi"`) como aproximacion, dado que XTTS-v2 no cubre el nepalí de forma nativa.

La relevancia es limitada y muy practica: se trata de un preset de voz de autor, sin pesos propios, sin licencia declarada y sin descargas ni interacciones registradas. Cualquier evaluacion real depende enteramente del modelo base XTTS-v2 sobre el que se apoya.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio; hereda la del motor base Coqui XTTS-v2 (tokenizador VQ-VAE, decoder autorregresivo y vocoder) |
| Parametros totales | No disponible (el repositorio no contiene pesos; tamano 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la longitud esta limitada por los fragmentos que acepta XTTS-v2) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) y nepalí (ne), este ultimo mediante mapeo fonetico al hindi |
| Licencia | No disponible |
| Formato de pesos | No aplica: el repositorio contiene audio WAV (`ref_en.wav`, `ref_ne.wav`); los pesos utilizados son los de `tts_models/multilingual/multi-dataset/xtts_v2` |

## Arquitectura y entrenamiento

No se ha entrenado ningun modelo en este repositorio. El contenido son dos archivos de audio de referencia (`ref_en.wav` y `ref_ne.wav`) que actuan como "firma vocal" para el motor Coqui XTTS-v2. La clonacion se produce en tiempo de inferencia: XTTS-v2 extrae el embedding de hablante a partir del audio de referencia y condiciona la generacion con el.

La arquitectura efectiva es, por tanto, la de XTTS-v2 (modelo multilingue de sintesis de voz basado en un tokenizador VQ-VAE, un decoder autorregresivo y un vocoder neuronal). La model card no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de ajuste como RLHF o DPO, porque no se ha realizado ningun entrenamiento propio. La unica personalizacion es la eleccion de audios de referencia y de hiperparametros de muestreo (`temperature=0.85`, `speed=0.95`, `repetition_penalty=2.5`, `top_k=50`, `top_p=0.85`).

## Capacidades

- Sintesis de voz (text-to-speech) en ingles y nepalí, esta ultima apoyandose en el motor fonetico del hindi.
- Clonacion de voz de hablante unico mediante audio de referencia, con dos timbres predefinidos (uno por idioma).
- Generacion de habla con variacion de tono y pausas de respiracion orientadas a un registro conversacional.
- Ajuste de expresividad y velocidad a traves de hiperparametros de decodificacion (temperatura, `top_k`, `top_p`, penalizacion por repeticion, velocidad).
- Ejecucion en Python mediante la libreria `TTS` de Coqui, tanto en CPU como en GPU CUDA.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni ninguna capacidad propia de un LLM; es exclusivamente un sistema de sintesis de voz.

## Casos de uso

- Prototipado de voces para videojuegos o animacion: se pueden usar `ref_en.wav` o `ref_ne.wav` como firma vocal fija para generar dialogos en ingles o nepalí sin grabar a un actor.
- Locucion de contenido educativo en nepalí: el repositorio permite generar narraciones en nepalí apoyandose en el mapeo al hindi, util para materiales de aprendizaje con habla sintetica.
- Audiolibros o podcasts de bajo coste en ingles: el timbre de referencia ofrece una voz consistente para narrar textos largos.
- Sistemas de respuesta de voz (IVR) en ingles: integrable en flujos que requieran sintesis de voz en tiempo casi real cargando XTTS-v2 en una GPU.
- Doblaje ligero de clips cortos: para traducir y locutar fragmentos breves en ingles o nepalí con voz clonada.
- Investigacion en clonacion de voz y evaluacion de presets: sirve como ejemplo reproducible de como condicionar XTTS-v2 con audios de referencia propios.
- Accesibilidad: lectura en voz alta de textos para usuarios con discapacidad visual, en ingles o nepalí, con un timbre estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, SIM-O, WER, RTF ni comparaciones con otros sistemas), y el repositorio no aporta pesos ni scripts de evaluacion.

## Requisitos de hardware

- No hay requisitos propios del repositorio; los requisitos corresponden al motor base XTTS-v2, que debe descargarse por separado (no se detallan en la informacion proporcionada).
- Al tratarse de un modelo de sintesis de voz de tamano moderado, XTTS-v2 suele ejecutarse en GPU de consumo con unos pocos GB de VRAM, aunque este dato no esta confirmado en la informacion disponible.
- GPU de gama alta (A100, H100) no son necesarias para inferencia de voz de un solo hablante; sirven para despliegues con alta concurrencia.
- Opcion de ejecucion en CPU disponible a traves de la libreria `TTS` (`device = "cuda" if torch.cuda.is_available() else "cpu"`), con latencia mucho mayor.
- Despliegue tipico mediante Python y la libreria Coqui `TTS`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un sistema TTS de este tipo).
- No se dispone de cifras de latencia ni de throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SUPERnova-TeraiTTS | Preset de voz sobre XTTS-v2 | en, ne | No disponible | Hugging Face (0 descargas, 0 likes) | Solo audios de referencia; depende de XTTS-v2 |
| Coqui XTTS-v2 | Modelo TTS multilingue | Multiples (no incluye nepalí nativo) | Coqui Public Model License | Ampliamente disponible | Motor base de este repositorio |
| Alternativas TTS open source (Bark, F5-TTS, etc.) | Modelos TTS | Variable | Variable | Hugging Face / repos propios | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparados entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio contiene unicamente dos audios de referencia y no incluye pesos, por lo que su funcionamiento depende por completo de Coqui XTTS-v2.
- Licencia no disponible: no se especifican los terminos de uso, lo que impide confirmar si se permite el uso comercial de los audios de referencia o de las voces generadas.
- El nepalí no esta soportado de forma nativa por XTTS-v2; la propia model card indica que se emplea el motor fonetico del hindi, lo que puede degradar la pronunciacion y la naturalidad.
- Riesgo de alucinacion de audio: los sistemas TTS pueden generar artefactos, ruidos o prosodia incorrecta, especialmente en textos largos o con fonetica poco representada.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes): no hay evidencia externa sobre la calidad real ni sobre la fidelidad de la clonacion.
- Repositorio de 0.0 GB: no incluye datasets, scripts de evaluacion ni documentacion adicional.
- No apto para tareas de razonamiento, codigo, agentes, vision ni procesamiento de lenguaje; es exclusivamente sintesis de voz.
- Posible uso indebido de la clonacion de voz: al tratarse de una tecnica de voice cloning, existe riesgo de suplantacion o generacion de audio enganoso si no se aplican salvaguardas y consentimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Supernova11c/SUPERnova-TeraiTTS
- Coqui XTTS-v2 (motor base referenciado en la model card): modelo `tts_models/multilingual/multi-dataset/xtts_v2` de la libreria Coqui TTS (no se ha proporcionado una URL especifica en la busqueda web)
- Libreria Coqui TTS: no se ha proporcionado enlace directo en la informacion disponible
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en los resultados de busqueda web (los resultados devueltos corresponden a Google Translate y no guardan relacion con este modelo).
