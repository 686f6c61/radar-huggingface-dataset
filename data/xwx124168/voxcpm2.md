# xwx124168/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) desarrollado por OpenBMB, con licencia Apache 2.0 y apto para uso comercial. Se trata de un sistema de 2 290 millones de parámetros (2,29 B) que combina una arquitectura de difusión autorregresiva sin tokenizador con un AudioVAE V2, capaz de generar audio a 48 kHz a partir de texto. El modelo está entrenado con más de 2 millones de horas de voz multilingüe y soporta 30 idiomas, además de nueve dialectos del chino.

Su relevancia radica en que ofrece tres modos de generación: diseño de voz a partir de descripciones en lenguaje natural (sin audio de referencia), clonación de voz con control de estilo y clonación de alta fidelidad (con transcripción del audio de referencia). Además, incluye generación en tiempo real con factor de tiempo real (RTF) de ~0,3 en una RTX 4090 y puede acelerarse mediante Nano-vLLM hasta ~0,13. Su licencia permisiva y su disponibilidad en Hugging Face lo convierten en una opción atractiva para aplicaciones comerciales y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion autoregressive tokenizer-free (LocEnc → TSLM → RALM → LocDiT) basada en MiniCPM-4 |
| Parametros totales | 2 290 004 544 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (se usa bfloat16 de forma nativa) |
| Idiomas soportados | 30 idiomas: árabe, birmano, chino, danés, neerlandés, inglés, finés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita. Además, 9 dialectos chinos (sichuanés, cantonés, wu, nororiental, henan, shaanxi, shandong, tianjin y minnan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxCPM2 emplea una arquitectura de difusión autorretiva sin tokenizador. Se compone de cuatro módulos principales: LocEnc (codificador de localización), TSLM (Transformer de lenguaje de texto), RALM (módulo de lenguaje autoregresivo) y LocDiT (transformador de difusión local). Esta estructura permite generar directamente la señal de audio a partir de texto, sin necesidad de convertir el texto a tokens discretos. El modelo se basa en MiniCPM-4 como columna vertebral.

El entrenamiento se realizó con más de 2 millones de horas de voz multilingüe, abarcando los 30 idiomas soportados. El sistema utiliza un AudioVAE V2 asimétrico: codifica la entrada a 16 kHz y decodifica a 48 kHz, de modo que no se requiere un upsampler externo. La tasa de tokens del LM es de 6,25 Hz y la longitud máxima de secuencia es de 8192 tokens. Durante la inferencia se emplea guía sin clasificador (CFG) con un valor de 2.0 y un número de pasos de difusión configurable (típicamente 10). No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de voz de alta calidad a 48 kHz a partir de texto, con prosodia y expresividad contextuales.
- Clonación de voz a partir de un clip corto (16 kHz) sin necesidad de transcripción.
- Control de estilo en la clonación: permite modificar emoción, velocidad y expresión mientras se preserva el timbre.
- Clonación de máxima fidelidad (Ultimate Cloning) que requiere audio de referencia y su transcripción exacta para reproducir matices vocales.
- Diseño de voz (Voice Design): genera una voz nueva a partir de una descripción en lenguaje natural, por ejemplo "(una mujer joven, voz dulce y suave)".
- Soporte de streaming: generación de audio por trozos (chunks) en tiempo real.
- Multilingüismo: 30 idiomas sin necesidad de etiqueta de idioma (detección automática).
- Dialectos chinos: soporta 9 dialectos chinos adicionales.
- Salida de 48 kHz de alta fidelidad, superresolución integrada en el AudioVAE.
- Inferencia rápida: RTF ~0,3 en RTX 4090, ~0,13 con Nano-vLLM.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede generar respuestas de voz con contexto largo (hasta 8192 tokens) y control de estilo, permitiendo crear asistentes telefónicos multilingües que se adapten al tono y emoción del cliente.
- **Narración de audiolibros**: gracias al soporte de 30 idiomas y la generación de prosodia contextual, se puede producir audiolibros en varios idiomas sin intervención manual, usando la clonación de voz para mantener una voz consistente en la serie.
- **Doblaje de vídeo**: la clonación de voz con control de estilo permite doblar contenido audiovisual a otros idiomas, manteniendo el timbre del actor original y ajustando la emoción según la escena.
- **Creación de contenido y marketing**: la función de Voice Design permite generar voces novedosas para anuncios, podcasts o vídeos de YouTube a partir de una descripción textual, sin necesidad de un locutor.
- **Asistentes de voz y accesibilidad**: el modelo puede integrarse en aplicaciones de lectura en voz alta para personas con discapacidad visual, ofreciendo múltiples voces y idiomas, con baja latencia (streaming).
- **Generación de contenido educativo**: para crear lecciones de idiomas o audios explicativos, el modelo puede clonar la voz de un profesor o generar voces artificiales con características específicas (edad, tono, acento).
- **Investigación en síntesis de voz**: al ser de código abierto y con licencia Apache 2.0, es adecuado para experimentos académicos sobre TTS, clonación de voz y generación de voz controlable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo logra resultados de vanguardia o competitivos en benchmarks de TTS como Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test, y remite al repositorio de GitHub para tablas completas, pero no se proporcionan cifras concretas en el material consultado.

## Requisitos de hardware

- VRAM estimada: ~8 GB (según la model card), suficiente para inferencia en una GPU con 8 GB de memoria.
- GPU recomendada: NVIDIA RTX 4090 (RTF ~0,3) para uso en tiempo real. También se ha probado con Nano-vLLM para aceleración adicional (RTF ~0,13).
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 2080, RTX 3080) puede ejecutar el modelo, aunque la latencia variará.
- Opciones de despliegue: el modelo se usa con la librería `voxcpm`, que ofrece API en Python. También se puede integrar con Nano-vLLM para inferencia acelerada. No se mencionan adaptaciones para vLLM u Ollama en la información.
- Requisitos de software: Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0.
- Latencia y throughput: RTF de 0,3 en RTX 4090, es decir, genera 1 segundo de audio en 0,3 segundos. Con Nano-vLLM, RTF de 0,13.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. No se han proporcionado tablas con resultados de otros modelos TTS (como CosyVoice, XTTS, etc.) para establecer una comparación objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información disponible.
- Riesgo de alucinación: como todo modelo generativo, puede producir audio que no corresponde exactamente al texto o con entonación inapropiada en casos ambiguos.
- El modelo requiere que el texto de entrada sea compatible con los idiomas soportados; fuera de esos 30 idiomas, el rendimiento puede degradarse.
- La clonación de voz puede generar usos no éticos (suplantación de identidad). Aunque la licencia es permisiva, se recomienda revisar las normativas locales sobre síntesis de voz.
- La model card no especifica el comportamiento en situaciones de ruido o audio de referencia de baja calidad.
- No se ha informado de limitaciones de contexto más allá de la longitud máxima de 8192 tokens; textos más largos requerirían segmentación.

## Enlaces

- Hugging Face (repo original): https://huggingface.co/openbmb/VoxCPM2
- Hugging Face (repo espejo en este caso): https://huggingface.co/xwx124168/VoxCPM2
- GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo en línea: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Paper (arXiv): https://arxiv.org/abs/2509.24650 (referencia de la etiqueta)
- Página web de VoxCPM2: https://voxcpm2.org/ (no oficial, de terceros)
