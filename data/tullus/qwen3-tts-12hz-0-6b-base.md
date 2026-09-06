# TULLUS/Qwen3-TTS-12Hz-0.6B-Base

## Resumen

Qwen3-TTS-12Hz-0.6B-Base es un modelo de texto a voz (TTS) perteneciente a la familia Qwen3-TTS, desarrollada por el equipo de Qwen. Este checkpoint concreto, publicado en HuggingFace por el usuario TULLUS, corresponde a la variante Base de 0.6B, aunque sus parametros reales ascienden a 914.643.008 (aproximadamente 0.91B). El modelo esta entrenado con mas de 5 millones de horas de habla en 10 idiomas y ofrece clonacion de voz a partir de una muestra de audio de 3 segundos, asi como control de la voz mediante instrucciones en lenguaje natural.

Desde el punto de vista tecnico, Qwen3-TTS emplea una arquitectura de modelo de lenguaje de multiples codigos discretos (discrete multi-codebook LM) potenciada por el tokenizer propio Qwen3-TTS-Tokenizer-12Hz, que consigue una compresion acustica eficiente y una modelizacion semantica de alta dimension. El modelo soporta generacion en streaming con una latencia de sintesis de extremo a extremo de hasta 97 ms, lo que lo hace adecuado para escenarios interactivos en tiempo real. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de multiples codigos discretos (discrete multi-codebook LM) |
| Parametros totales | 914.643.008 (aproximadamente 0.91B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS se basa en una arquitectura de modelo de lenguaje discreto con multiples codebooks, que permite modelar el habla de extremo a extremo sin perdida de informacion. El tokenizer Qwen3-TTS-Tokenizer-12Hz es un componente clave: opera a una frecuencia de 12 Hz y consigue una representacion acustica compacta y semanticamente rica. El entrenamiento se realizo con mas de 5 millones de horas de datos de habla que cubren 10 idiomas mayoritarios, incluyendo varios perfiles de voz dialectales.

El modelo es capaz de generar voz a partir de texto y de una voz de referencia, y admite control de atributos acusticos multidimensionales mediante instrucciones en lenguaje natural. La arquitectura esta disenada para soportar generacion en streaming con latencia minima, lo que la hace apta para aplicaciones de tiempo real. No se han publicado detalles adicionales sobre el proceso de entrenamiento (por ejemplo, si se emplearon tecnicas de RLHF o DPO) en la informacion disponible.

## Capacidades

- Clonacion de voz a partir de una muestra de audio de 3 segundos, con fidelidad alta respecto a la voz de referencia.
- Generacion de voz en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Control de la voz mediante descripciones en lenguaje natural, permitiendo ajustar atributos como tono, velocidad o emocion.
- Generacion en streaming con latencia de extremo a extremo de hasta 97 ms, adecuada para aplicaciones interactivas.
- Sintesis de habla de alta calidad, con caracteristicas humanas y capacidad de expresar emociones.
- Soporte de diseno de voz (voice design), segun la documentacion del proyecto en GitHub.
- Capacidad de manejar texto complejo, incluyendo formulas matematicas y simbolos, como se muestra en el ejemplo de uso.

## Casos de uso

- Asistentes virtuales personalizados: el modelo permite clonar la voz de un usuario o de un personaje para crear asistentes con identidad vocal propia. Gracias a la baja latencia, puede integrarse en sistemas de dialogo en tiempo real.
- Doblaje de contenido audiovisual: la clonacion de voz y el soporte multilingue permiten generar versiones dobladas de videos, series o peliculas manteniendo la voz original, lo que reduce costes de produccion.
- Narracion de audiolibros: se puede clonar la voz de un narrador profesional y generar contenido nuevo de forma rapida, manteniendo una calidad de habla natural y consistente.
- Accesibilidad para personas con discapacidad visual o del habla: el modelo puede convertir texto en voz con voces personalizadas, mejorando la experiencia de usuarios que dependen de sistemas de lectura en voz alta.
- Generacion de contenido para redes sociales y marketing: permite crear voces personalizadas para anuncios, videos promocionales o contenido educativo, con control de tono y estilo mediante lenguaje natural.
- Sistemas de respuesta de voz interactiva (IVR): la capacidad de streaming y la clonacion de voz permiten construir sistemas de atencion telefonica con voces personalizadas y respuestas generadas dinamicamente.
- Avatares virtuales y videojuegos: la generacion de voz en tiempo real y la clonacion de voz facilitan la creacion de personajes con voces unicas y expresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos safetensors del repositorio ocupan aproximadamente 2.5 GB. Con 914M parametros en bfloat16, la memoria necesaria solo para los pesos es de ~1.8 GB, a lo que hay que sumar el overhead de activaciones y el tokenizer.
- GPU recomendadas: no disponible. Dado el tamano del modelo, es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay datos oficiales confirmados.
- Opciones de despliegue: el codigo de ejemplo utiliza la libreria `qwen-tts` con `torch` y soporta `flash_attention_2`. No se mencionan otras opciones como vLLM, llama.cpp u Ollama en la documentacion disponible.
- Latencia y throughput: la documentacion indica una latencia de sintesis de extremo a extremo de hasta 97 ms, pero no se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni estudios de alucinacion en la informacion disponible.
- El modelo solo soporta los 10 idiomas indicados; su rendimiento en otros idiomas o dialectos no esta garantizado.
- Al ser un checkpoint Base, puede requerir ajuste fino o el uso del modelo instruct correspondiente para tareas que necesiten un control mas fino mediante instrucciones complejas.
- La documentacion no incluye restricciones de uso comercial mas alla de la licencia Apache 2.0, que permite uso comercial con atribucion.
- No se especifican limites de longitud de contexto, por lo que el comportamiento con textos muy largos es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/TULLUS/Qwen3-TTS-12Hz-0.6B-Base
- Paper (Technical Report): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Demo en HuggingFace: https://huggingface.co/spaces/Qwen/Qwen3-TTS
