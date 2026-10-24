# TheStageAI/phonon-31m-en

## Resumen

TheStageAI/phonon-31m-en es un paquete de motores Core ML para Apple Neural Engine (ANE) del modelo de síntesis de voz phonon-31m-en, desarrollado originalmente por Gradium. El modelo base es un TTS de 31 millones de parámetros (sin contar el tokenizador de audio) que convierte texto en voz natural en inglés a 24 kHz mono, con generación en streaming: emite audio mientras sigue sintetizando. Su reducido tamaño permite ejecutarlo en la CPU de un portátil, en un teléfono o incluso en una pestaña del navegador, sin GPU dedicada.

Este repositorio concreto no contiene los pesos originales en PyTorch, sino los motores ya compilados y optimizados para el SDK de Apple de TheStage (`model_type: phonon`): el flow LM en fp16, las capas transformer palettizadas a 6 bits para el ANE y el decodificador Mimi en fp32 sobre CPU. Incluye seis voces (default, easton, zoey, harper, maeve, freya) y los motores van cifrados con QLPA.

Es relevante ahora porque demuestra la viabilidad de TTS neuronal de calidad en hardware de consumo Apple con licencia Apache-2.0, y porque existe un ecosistema incipiente alrededor de Phonon: exportaciones ONNX de terceros, el modelo upstream de Gradium y la familia Phonon con soporte para más idiomas (inglés, francés, alemán, español y portugués), aunque los modelos mayores de esa familia usan licencias no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en dos etapas: transformer con flow matching (flow LM) + códec neuronal Mimi (Kyutai), construido sobre Pocket TTS; motores Core ML para ANE y CPU |
| Parametros totales | 31 M (excluyendo el tokenizador de audio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | flow LM en fp16; capas transformer con palettizacion g8 a 6 bits para ANE; decodificador Mimi en fp32 sobre CPU |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodelc` empaquetados en `subscription/macos_ios/engines.zip`), cifrado QLPA; existen exportaciones ONNX de terceros del modelo base |
| Voces incluidas | default, easton, zoey, harper, maeve, freya |
| Frecuencia de muestreo | 24 kHz mono (modelo base) |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base sigue un esquema de dos etapas típico de los TTS neuronales modernos con códec. Un transformer con flow matching (flow LM) genera representaciones de audio compactas y produce un frame de 80 ms cada vez; después, el decodificador Mimi de Kyutai convierte esos tokens latentes en forma de onda a 24 kHz. La generación es en streaming, de modo que el primer audio puede emitirse antes de que termine la síntesis completa. El modelo se apoya en el trabajo previo de Kyutai (Pocket TTS) y en el códec Mimi.

En este repositorio de TheStageAI no se distribuyen los pesos originales ni detalles del dataset de entrenamiento: lo que se publica son los motores ya convertidos y optimizados. El flow LM va en fp16, las capas transformer se palettizan a 6 bits para ejecutarse en el Neural Engine y el decodificador Mimi se mantiene en fp32 sobre CPU para preservar la calidad de la forma de onda. Los motores están cifrados con QLPA y se consumen a través del SDK de Apple de TheStage. No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del corpus ni si hubo ajuste con RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz mono con salida en streaming.
- Generación de audio con latencia de primer frame muy baja según el autor del modelo base (aproximadamente 7 ms en la CPU de un portátil, dato reportado para phonon-31m-en, no verificado para estos motores Core ML).
- Seis voces preentrenadas empaquetadas: default, easton, zoey, harper, maeve, freya.
- Ejecución en dispositivo: motores específicos para Apple Neural Engine y CPU, sin dependencia de GPU ni de servicios en la nube.
- No soporta tool calling ni function calling: es un modelo acústico, no un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión ni audio de entrada.
- Multilingüismo: limitado a inglés en este paquete; la familia Phonon incluye otros idiomas en modelos separados.
- Integración mediante el SDK de Apple de TheStage (`model_type: phonon`).

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: el motor se ejecuta en el ANE del dispositivo, de modo que la app puede narrar texto sin conexión y sin coste por petición, con seis voces seleccionables según el perfil de usuario.
- Accesibilidad: lectores de pantalla y asistentes para personas con discapacidad visual que necesitan respuesta hablada inmediata; la latencia de primer frame reportada para el modelo base (unos 7 ms) hace viable la realimentación conversacional.
- Asistentes de voz locales: combinación con un STT y un LLM pequeños en el mismo dispositivo para construir un asistente totalmente offline; la salida en streaming permite empezar a hablar antes de que el LLM termine de generar la respuesta.
- Audioguías y contenido turístico: generación de narraciones en inglés empaquetadas con la app, sin necesidad de preprocesar y almacenar ficheros de audio para cada texto.
- Notificaciones y avisos dinámicos: anuncios de navegación, alarmas o resúmenes de correo leídos en voz alta, donde el texto se conoce en tiempo de ejecución y no puede pregenerarse.
- Prototipado y demos en navegador o portátil: con el modelo base (menos de 75 MB según las fuentes) o su exportación ONNX, se puede validar una experiencia de voz antes de invertir en infraestructura de inferencia.
- Pruebas de integración en pipelines de CI para apps Apple: verificar que el empaquetado de motores, las voces y el cifrado QLPA funcionan en cada build antes de publicar en App Store.

## Benchmarks y rendimiento

Los únicos datos públicos encontrados corresponden al modelo base de Gradium, no a estos motores Core ML concretos. Se incluyen con esa salvedad explícita.

| Metrica | Valor | Ambito |
|---|---|---|
| WER en frases difíciles en inglés | 1,70 % | phonon-31m-en (modelo base, dato reportado por Gradium) |
| Latencia hasta el primer audio | ~7 ms | phonon-31m-en en CPU de portátil (dato reportado por Gradium) |
| Tamano del modelo base | < 75 MB | phonon-31m-en (reportado en prensa especializada) |
| Frecuencia de muestreo | 24 kHz mono | phonon-31m-en |
| Frame de audio generado | 80 ms por paso | arquitectura del flow LM |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de TTS (MOS, UTMOS, CMOS) en la información disponible para este paquete de motores.

## Requisitos de hardware

- Plataforma objetivo: Apple Neural Engine (chips de la serie A y M) para las capas transformer, más CPU para el decodificador Mimi en fp32.
- No requiere VRAM de GPU discreta; el modelo base ocupa menos de 75 MB, y el repositorio completo de motores pesa 0,3 GB.
- Cabe en cualquier dispositivo Apple con ANE; no está pensado para GPU NVIDIA ni para servidores CUDA.
- Despliegue mediante el SDK de Apple de TheStage, que carga `engines.zip` con `model_type: phonon`; el contenido está cifrado con QLPA.
- Alternativa fuera del ecosistema Apple: usar la exportación ONNX de terceros (ai-ecoverse/phonon-31m-en-ONNX con 37 voces en inglés) sobre ONNX Runtime, cuya latencia y throughput concretos no están disponibles en la información proporcionada.
- Throughput y latencia exactos de estos motores Core ML: no disponibles. El único dato de latencia (~7 ms hasta el primer audio) procede del modelo base en CPU de portátil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TheStageAI/phonon-31m-en (esta ficha) | 31 M | Core ML + ANE, cifrado QLPA | en | Apache-2.0 | 6 voces, motores optimizados para Apple |
| gradium/phonon-31m-en | 31 M | Pesos originales | en | Apache-2.0 | Modelo upstream, TTS en streaming a 24 kHz |
| ai-ecoverse/phonon-31m-en-ONNX | 31 M | ONNX | en | Apache-2.0 (heredada) | Exportación con 37 voces de gradium/phonon-voices |
| Modelos mayores de la familia Phonon | no disponible | no disponible | en, fr, de, es, pt | no comercial (según la fuente) | Mayor calidad a cambio de licencia restrictiva |

No se dispone de datos verificados en la información proporcionada para comparar con alternativas de otros autores (por ejemplo Kokoro o Piper); cualquier cifra al respecto debería contrastarse con sus fichas oficiales antes de publicarla.

## Limitaciones y advertencias

- Solo inglés: no sintetiza castellano ni otros idiomas; para español habría que acudir a otros modelos de la familia Phonon, con licencia no comercial según las fuentes consultadas.
- Estos motores están atados al ecosistema Apple (Core ML y ANE) y al SDK de TheStage; no son portables a Linux, Android o servidores x86 sin recurrir a otra exportación.
- Los motores van cifrados con QLPA, lo que puede limitar la inspección, la modificacion y la depuración del contenido por parte del integrador.
- Al ser un modelo acústico, puede producir errores de pronunciación en nombres propios, siglas, unidades y terminos tecnicos; el 1,70 % de WER corresponde a frases difíciles en inglés del modelo base, no a este paquete.
- No puede razonar sobre el contenido: no corrige el texto de entrada ni resuelve ambigüedades semánticas; el saneamiento previo del texto es responsabilidad de la aplicación.
- Riesgo de artefactos acústicos y de prosodia inconsistente en textos muy largos o con puntuación atípica; no hay datos publicados de MOS para estos motores.
- La licencia Apache-2.0 del modelo permite uso comercial, pero conviene verificar por separado las condiciones del SDK de TheStage y de las voces utilizadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni informes de la comunidad.
- No hay información publicada sobre sesgos de acento, género o variedad dialectal de las seis voces incluidas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TheStageAI/phonon-31m-en
- Modelo base de Gradium: https://huggingface.co/gradium/phonon-31m-en
- Exportación ONNX de terceros: https://huggingface.co/ai-ecoverse/phonon-31m-en-ONNX
- Voces de referencia (gradium/phonon-voices): https://huggingface.co/gradium/phonon-voices
- Ficha en LLM Reference: https://www.llmreference.com/model/phonon-31m
- Noticia en MarkTechPost: https://www.marktechpost.com/2026/10/22/gradium-phonon-31m-on-device-tts/
- Noticia en AlphaSignal: https://alphasignal.ai/news/gradium-s-phonon-runs-text-to-speech-in-browsers-at-under-75-mb
