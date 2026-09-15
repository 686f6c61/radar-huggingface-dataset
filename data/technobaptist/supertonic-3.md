# TechnoBaptist/supertonic-3

## Resumen

Supertonic 3 es un sistema de sintesis de voz (text-to-speech) de pesos abiertos disenado para inferencia local. Lo desarrolla Supertone y se ejecuta enteramente en el dispositivo mediante ONNX Runtime, sin necesidad de llamadas a la nube. La ficha analizada, TechnoBaptist/supertonic-3, parece una redistribucion del repositorio original Supertone/supertonic-3, ya que la model card y los enlaces apuntan al espacio, GitHub y SDK de Supertone.

La version 3 amplia el soporte de 5 a 31 idiomas respecto a Supertonic 2, mejora la estabilidad de lectura (reduce fallos de repeticion y omision, especialmente en enunciados cortos y largos) y aumenta la similitud con el hablante en el conjunto de idiomas compartidos. Ademas incorpora etiquetas de expresion simples como `<laugh>`, `<breath>` y `<sigh>`.

Su relevancia reside en ofrecer sintesis multilingue con un coste computacional bajo, ejecutable en local y con licencia OpenRAIL, lo que lo hace apto para aplicaciones offline, de borde o con requisitos de privacidad. No se detallan en la informacion disponible ni la topologia de red, ni el numero de parametros, ni el volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (inferencia mediante ONNX Runtime; no se especifica la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha anunciado una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto, no una secuencia de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Biblioteca / SDK | supertonic (Python SDK, `pip install supertonic`) |
| Tarea (pipeline) | text-to-speech |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (se desconoce si emplea un decoder autorregresivo, un modelo de flujo, un vocoder neuronal o una combinacion). Lo unico confirmado es que la inferencia se realiza con ONNX Runtime de forma local, sin llamadas a la nube, y que el paquete distribuido contiene pesos en formato ONNX junto con estilos de voz predefinidos. El repositorio ocupa 0,4 GB, lo que indica un sistema compacto orientado a ejecucion en dispositivo.

Tampoco se especifican el numero de tokens o horas de audio empleados en el entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion, RLHF o DPO. La model card solo describe mejoras relativas respecto a Supertonic 2: mayor cobertura linguistica (de 5 a 31 idiomas), mayor estabilidad de lectura con menos fallos de repeticion y omision, y mayor similitud con el hablante. Se menciona soporte de decodificacion con estilos de voz predefinidos y de estilos personalizados zero-shot generados a partir de audio de referencia mediante embeddings.

## Capacidades

- Sintesis de voz multilingue en 31 idiomas, incluyendo espanol, ingles, aleman, frances, italiano, portugues, japones, coreano, arabe, hindi y la mayoria de lenguas eslavas y nordicas listadas.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos (por ejemplo, el estilo `M1` empleado en el ejemplo de la model card).
- Estilos de voz personalizados zero-shot: es posible crear un JSON de estilo de voz a partir de audio de referencia mediante Supertonic Voice Builder; los estilos comprados incluyen embeddings descargables para Supertonic 2 y Supertonic 3.
- Etiquetas de expresion simples integradas en el texto: `<laugh>`, `<breath>` y `<sigh>`.
- Salida de audio en formato WAV junto con la duracion generada, mediante la API `synthesize` del SDK, que devuelve la forma de onda y la duracion.
- Mejora de estabilidad de lectura frente a la version anterior, con menos repeticiones y omisiones en enunciados cortos y largos.
- No se documenta soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades de vision, audio de entrada (salvo referencia para clonacion) ni transcripcion; el modelo es exclusivamente text-to-speech.

## Casos de uso

- Lectura de articulos y audiolibros offline: el modelo puede convertir texto largo en audio en el propio dispositivo, sin conexion, lo que resulta adecuado para aplicaciones de lectura que requieren privacidad y funcionamiento sin red.
- Asistencia por voz en aplicaciones de escritorio o moviles: al ejecutarse con ONNX Runtime de forma local, permite incorporar respuestas habladas en asistentes y menus de aplicacion sin depender de APIs en la nube ni asumir costes por peticion.
- Accesibilidad para personas con discapacidad visual: puede actuar como motor de lectura de pantalla en 31 idiomas, generando audio para contenido dinamico con latencia baja al no requerir red.
- Localizacion y doblaje de contenido: con cobertura de 31 idiomas, permite generar versiones habladas de guiones, tutoriales o material formativo en varios idiomas a partir de una misma fuente de texto.
- Voces de personajes en videojuegos y prototipos: las etiquetas de expresion (`<laugh>`, `<breath>`, `<sigh>`) y la clonacion zero-shot permiten previsualizar dialogos con voces especificas antes de contratar grabaciones definitivas.
- Generacion de datos de audio sintetico para entrenamiento: la produccion local de muestras WAV etiquetadas facilita la creacion de datasets de habla en idiomas con pocos recursos disponibles en el conjunto de 31 idiomas soportados.
- Narracion de notificaciones y alertas en sistemas embebidos: al no necesitar GPU ni nube, puede integrarse en dispositivos con recursos limitados para leer mensajes del sistema o avisos por voz.
- Sistemas de atencion automatizada (IVR): puede sintetizar prompts y mensajes de atencion al cliente; conviene senalar que se trata de un componente TTS, no de un modelo conversacional, por lo que el dialogo debe gestionarlo un sistema externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona una seccion de "Performance Highlights" y afirma que el sistema es "compacto y competitivo" para inferencia en dispositivo, pero no incluye cifras concretas de metricas como MOS, similitud de hablante, WER o latencia. Tampoco se proporcionan comparaciones cuantitativas frente a Supertonic 2 mas alla de las afirmaciones cualitativas sobre mayor estabilidad y similitud.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni de memoria en la informacion disponible.
- A partir del tamano del repositorio (0,4 GB), que incluye pesos ONNX y estilos de voz, cabe estimar que el conjunto completo se mantiene por debajo de 1 GB de disco y que la inferencia puede residir en torno a 1-2 GB de memoria; esta cifra es una deduccion del tamano del repo, no un dato oficial.
- El diseno esta orientado a inferencia en CPU mediante ONNX Runtime, por lo que no se requiere GPU para funcionar.
- En caso de usar GPU, cualquier acelerador moderno (RTX 3060 o superior, T4, A100, H100) dispone de VRAM mas que suficiente para un modelo de este tamano; no se especifican optimizaciones concretas por hardware.
- Cabe en tarjetas graficas de consumo, asi como en portatiles y dispositivos de borde, dado el enfoque "on-device" declarado por el autor.
- Opciones de despliegue documentadas: SDK de Python `supertonic` con `pip install supertonic`, que descarga los pesos desde Hugging Face en la primera ejecucion, e inferencia directa sobre ONNX Runtime. No se mencionan integraciones con vLLM, llama.cpp, TGI ni Ollama, que ademas no son aplicables a un modelo text-to-speech en formato ONNX.
- No se publican datos de latencia ni de throughput (por ejemplo, factor de tiempo real o milisegundos por caracter) en la informacion disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas. La tabla siguiente recoge caracteristicas publicas ampliamente conocidas de alternativas de la misma categoria (TTS open source ejecutable en local); los datos de Supertonic 3 son los declarados en su model card y el resto no proceden de la busqueda realizada para esta ficha, por lo que deben verificarse en las fuentes originales de cada proyecto.

| Modelo | Parametros | Idiomas | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Supertonic 3 | no disponible | 31 | ONNX | openrail | On-device, ONNX Runtime, sin nube; etiquetas de expresion y clonacion zero-shot via Voice Builder |
| Piper | no disponible (depende de la voz) | Decenas de voces e idiomas | ONNX | MIT | On-device, orientado a sistemas embebidos y Raspberry Pi |
| Kokoro-82M | 82 M (segun su model card) | Multilingue (segun version) | ONNX y pesos nativos | Apache 2.0 | Modelo compacto de pesos abiertos con buena relacion calidad/tamano |
| XTTS-v2 | no disponible en esta busqueda | 17 | Pesos nativos | Coqui Public Model License | Clonacion de voz zero-shot con requisitos de GPU mas altos |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion disponible; en sintesis de voz los sesgos suelen manifestarse como calidad desigual entre idiomas, acentos y generos, pero no hay datos al respecto para este modelo.
- El riesgo de alucinacion no aplica en el sentido de generacion de hechos, pero si existe riesgo de errores de pronunciacion, repeticiones u omisiones. La model card reconoce fallos de este tipo en versiones anteriores y afirma haberlos reducido en la version 3, sin aportar cifras.
- La calidad por idioma puede variar: se declaran 31 idiomas, pero no se desglosa el rendimiento de cada uno, y varios de ellos podrian disponer de menos datos de entrenamiento que el ingles o el coreano.
- La licencia OpenRAIL incluye restricciones de uso por ambito de aplicacion ademas de la obligacion de atribucion; conviene revisar el texto completo de la licencia antes de un uso comercial, ya que no se resumen en la informacion disponible los casos prohibidos.
- El repositorio analizado (TechnoBaptist/supertonic-3) no coincide con el autor original (Supertone) y registra 0 descargas y 0 likes; se trata presumiblemente de una redistribucion. Para produccion es recomendable acudir al repositorio oficial Supertone/supertonic-3.
- Los estilos de voz personalizados zero-shot requieren pasar por Supertonic Voice Builder y, en el caso de estilos comprados, los embeddings son de pago; el paquete de pesos abiertos solo incluye estilos predefinidos.
- No se especifican limites de longitud de texto por peticion ni comportamiento con entradas muy largas, mas alla de la mencion generica a fallos en enunciados largos.
- No hay datos publicados de latencia, throughput ni requisitos de memoria, lo que dificulta dimensionar un despliegue en produccion sin pruebas propias.
- El conjunto de etiquetas de expresion es reducido (`<laugh>`, `<breath>`, `<sigh>`), por lo que la expresividad esta acotada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/supertonic-3
- Repositorio oficial (referenciado en la model card): https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Codigo fuente en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
