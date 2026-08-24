# xCloudinfo/xVITA-TTS-zhTW

## Resumen

xVITA-TTS-zhTW es un modelo de síntesis de voz (text-to-speech) desarrollado por la empresa taiwanesa xCloudinfo (云碩科技). Se trata de un fine-tuning del modelo multilingüe Chatterbox de ResembleAI, especializado en chino tradicional con acento de Taiwán. El modelo resuelve el problema de la baja calidad de los TTS genéricos para esta variante lingüística, ofreciendo una alternativa de código abierto con licencia MIT.

El ajuste se realizó sobre el componente T3 del modelo base, congelando el voice encoder y el generador S3Gen para preservar la capacidad de clonación de voz original. Se utilizaron 121 horas de corpus de chino taiwanés (118 511 segmentos) en un proceso de fine-tuning de parámetros completos. El repositorio tiene un tamaño de 3,2 GB e incluye los pesos ajustados, el tokenizador y las condiciones de voz por defecto.

La relevancia actual del modelo radica en que ofrece una alternativa de alta calidad para síntesis de voz en chino tradicional, con una mejora significativa en la precisión de contenido (medida mediante CER) respecto al modelo base, y mantiene la flexibilidad de clonación de voz del Chatterbox original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en ResembleAI/chatterbox (fine-tuning del componente T3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | Chino tradicional (zh-TW), herencia del modelo base multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (t3_mtl23ls_v2.safetensors, ve.safetensors, s3gen.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Chatterbox, un sistema TTS multilingüe de ResembleAI con licencia MIT. La arquitectura interna de Chatterbox no se detalla en la información proporcionada, pero se sabe que consta de tres componentes principales: un voice encoder (ve), un generador de condiciones (S3Gen) y un módulo T3 que probablemente actúa como decoder o sintetizador. En este fine-tuning, solo se ajustaron los pesos de T3, mientras que ve y S3Gen permanecieron congelados, lo que permite conservar la capacidad de clonación de voz del modelo original.

El entrenamiento se realizó en la plataforma propia xCloudFinetune Studio, utilizando una NVIDIA RTX 5090. Se emplearon 118 511 segmentos de audio (7 266 minutos) del corpus ADI Taiwan-Tongues, con un solo epoch, tamaño de lote efectivo de 8 y una tasa de aprendizaje de 2e-5 con decaimiento coseno. El proceso fue de fine-tuning de parámetros completos (full fine-tuning) sobre T3, no un LoRA ni adaptadores ligeros. Los autores advierten explícitamente que con menos datos (por ejemplo, 6 horas) el resultado empeora respecto al modelo base, por lo que la cantidad de datos es un factor crítico.

## Capacidades

- Síntesis de voz en chino tradicional con acento taiwanés, con mejora sustancial en precisión de contenido frente al modelo base.
- Clonación de voz: al mantener congelados el voice encoder y S3Gen, conserva la capacidad de replicar una voz de referencia a partir de un audio de 5-10 segundos.
- Generación de audio a partir de texto con control de prosodia mediante condiciones de voz.
- Compatible con el ecosistema Chatterbox: se carga como un ChatterboxMultilingualTTS y se sustituye el T3 con los pesos ajustados.
- Soporte para inferencia en GPU y CPU (aunque significativamente más lenta en CPU).
- No se mencionan capacidades de tool calling, agentes ni razonamiento, al ser un modelo puramente de síntesis de voz.

## Casos de uso

- Audiollibros en chino tradicional: el modelo puede generar narraciones fluidas y precisas para contenido largo, aunque se recomienda dividir el texto en frases para evitar alargamientos no deseados.
- Asistentes de voz para Taiwán: integración en aplicaciones de asistente personal que requieran respuestas habladas en chino tradicional con acento local, mejorando la naturalidad frente a voces genéricas.
- Doblaje de vídeos y contenido multimedia: gracias a la clonación de voz, se puede replicar la voz de un locutor concreto para doblar vídeos, manteniendo consistencia tonal.
- Sistemas de accesibilidad: lectura de textos para personas con discapacidad visual, con la posibilidad de elegir una voz de referencia personalizada.
- Pruebas de producto y prototipado: generación rápida de muestras de voz para validar interfaces de usuario o campañas de marketing sin necesidad de grabar en estudio.
- Educación y aprendizaje de idiomas: creación de materiales de pronunciación en chino tradicional, con ejemplos de habla natural y clonación de voces de profesores.

## Benchmarks y rendimiento

Los autores proporcionan una evaluación de precisión de contenido mediante round-trip CER (Character Error Rate), comparando el modelo con el base Chatterbox y con audio real como referencia. La medición se realizó con 30 frases held-out, sintetizadas con la misma voz de referencia y transcritas con un ASR propio (Whisper-Large-v3-Turbo-xVITA-zhTW). Se excluyeron frases con números para evitar errores de normalización.

| Modelo | Contenido CER |
|---|---|
| Audio real (ruido de fondo centinela) | 1,82 % |
| Chatterbox base multilingue | 40,83 % |
| **xVITA-TTS-zhTW (este modelo)** | **11,85 %** |

La mejora es notable: reduce el CER de 40,83 % a 11,85 %, acercándose al rendimiento del audio real (1,82 %). No se han publicado otros benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero el modelo base Chatterbox requiere una GPU con al menos 8 GB de VRAM para inferencia en tiempo real; el fine-tuning no aumenta significativamente los requisitos.
- GPU recomendada: NVIDIA RTX 5090 (usada en las pruebas, con RTF 0,38), aunque cualquier GPU moderna con soporte CUDA y suficiente VRAM debería funcionar.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs como RTX 3060, 4070 o superiores, dependiendo de la longitud de audio generada.
- Opciones de despliegue: se puede usar directamente con la librería `chatterbox` de Python, cargando el modelo base y sustituyendo los pesos. No se mencionan integraciones con vLLM, Ollama o TGI, al ser un modelo TTS.
- Latencia y throughput: RTF (real-time factor) de 0,38 en RTX 5090, es decir, genera 1 segundo de audio en aproximadamente 0,38 segundos. En CPU la inferencia es posible pero significativamente más lenta.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos TTS de chino tradicional en la información proporcionada. La única comparativa disponible es con el modelo base Chatterbox, que se muestra en la tabla de benchmarks. Se puede considerar que este modelo compite con alternativas como VITS (de Coqui) o modelos comerciales, pero no hay datos públicos de rendimiento comparativo en este contexto.

| Modelo | Idioma | Licencia | Precisión (CER) | Notas |
|---|---|---|---|---|
| xVITA-TTS-zhTW | zh-TW | MIT | 11,85 % | Fine-tuning de Chatterbox, clonación de voz |
| Chatterbox base | Multilingue | MIT | 40,83 % | Modelo original, sin especialización |
| VITS (Coqui) | Multilingue | MIT | no disponible | Arquitectura VAE+GAN, sin clonación de voz nativa |

## Limitaciones y advertencias

- Textos largos o con lenguaje coloquial pueden provocar un alargamiento descontrolado de la síntesis; se recomienda dividir el texto en frases cortas.
- Los números con guiones (por ejemplo, 02-2712-3456) requieren normalización previa del texto, ya que el modelo no los maneja correctamente.
- La calidad de la clonación de voz depende críticamente de la calidad del audio de referencia: se recomienda usar grabaciones limpias de 5-10 segundos; con audio ruidoso la calidad puede degradarse hasta seis veces.
- El fine-tuning con pocos datos (menos de 100 horas) puede empeorar el rendimiento respecto al modelo base; no se recomienda replicar el proceso con conjuntos de datos pequeños.
- Aunque la licencia es MIT, el modelo base Chatterbox también es MIT, por lo que no hay restricciones de uso comercial conocidas.
- No se han evaluado sesgos o alucinaciones en el contenido generado, aunque al ser un TTS el riesgo principal es la pronunciación incorrecta de términos poco comunes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xCloudinfo/xVITA-TTS-zhTW
- Modelo ASR asociado (Whisper-Large-v3-Turbo-xVITA-zhTW): https://huggingface.co/xCloudinfo/Whisper-Large-v3-Turbo-xVITA-zhTW
- Modelo ASR alternativo (Whisper-Large-v3-xVITA-zhTW): https://huggingface.co/xCloudinfo/Whisper-Large-v3-xVITA-zhTW
- Repositorio de Chatterbox (modelo base): no se proporciona enlace directo, pero se puede buscar como ResembleAI/chatterbox en HuggingFace.
