# starrydark/Kurisu_Qwen3_TTS

## Resumen

Kurisu_Qwen3_TTS es un modelo de síntesis de voz (text-to-speech) publicado por el usuario starrydark en Hugging Face, que consiste en un fine-tune del modelo Qwen3-TTS de Alibaba Cloud orientado a reproducir la voz del personaje Kurisu Makise, de la serie *Steins;Gate*. El modelo base Qwen3-TTS es una familia de sistemas TTS de código abierto que emplea una arquitectura de modelo de lenguaje discreto multi-codebook con un tokenizador propio de 12 Hz, capaz de generar habla expresiva y de baja latencia en diez idiomas principales. Este fine-tune concreto tiene 1.916.676.352 parámetros (aproximadamente 1,9 mil millones), lo que sugiere que parte de una de las variantes de 1,7 B del modelo original, aunque el número exacto no coincide con las versiones publicadas oficialmente. La relevancia de este modelo radica en su especialización para una voz de ficción muy concreta, lo que lo hace útil para proyectos de doblaje, entretenimiento y asistentes personalizados, aunque su utilidad general es limitada fuera de ese nicho.

La model card incluida en el repositorio es idéntica a la del modelo Qwen3-TTS original, sin información adicional sobre el proceso de fine-tune ni sobre los datos utilizados. El repositorio contiene únicamente pesos en formato safetensors, con un tamaño total de 4,5 GB. No se han publicado métricas de rendimiento específicas para este fine-tune, por lo que las capacidades descritas se basan en las características del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto multi-codebook (LM) con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano (segun la card del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS emplea una arquitectura de modelo de lenguaje autoregresivo con múltiples codebooks discretos, que codifican la señal de voz a una frecuencia de 12 Hz mediante el tokenizador propio Qwen3-TTS-Tokenizer-12Hz. Este diseño permite una compresión acústica eficiente y un modelado semántico de alta dimensión, preservando información paralingüística y ambiental. A diferencia de los esquemas tradicionales LM + DiT, el enfoque de Qwen3-TTS es totalmente de extremo a extremo, lo que evita cuellos de botella de información y errores en cascada. El modelo base admite generación en streaming y no streaming mediante una arquitectura híbrida de doble vía, con una latencia de síntesis de hasta 97 ms.

En el caso de Kurisu_Qwen3_TTS, no se dispone de información detallada sobre el proceso de fine-tune: ni el conjunto de datos utilizado, ni la duración del entrenamiento, ni las técnicas de ajuste (por ejemplo, supervisión con pares texto-audio del personaje). Se desconoce si se ha aplicado algún método de regularización o si se ha congelado parte del modelo. El autor tampoco ha documentado si el fine-tune se realizó sobre la variante Base, CustomVoice o VoiceDesign del Qwen3-TTS original.

## Capacidades

- Generación de voz a partir de texto en diez idiomas, aunque el fine-tune está orientado a reproducir una voz específica (Kurisu Makise).
- Control de la entonación, el ritmo y la emoción mediante instrucciones en lenguaje natural, según las capacidades del modelo base.
- Generación en streaming con baja latencia, lo que permite su uso en interacciones en tiempo real.
- Clonación de voz a partir de una muestra de audio de tres segundos, si se ha conservado esta capacidad del modelo base.
- Soporte para múltiples timbres de voz, aunque en este fine-tune el timbre está fijado al del personaje.
- Robustez ante texto de entrada ruidoso o mal formateado, heredada del modelo base.

## Casos de uso

- Doblaje de personajes en proyectos de animación o videojuegos: el modelo permite generar diálogos con la voz de Kurisu Makise sin necesidad de contratar a una actriz de doblaje, acelerando la producción de contenidos no comerciales o de aficionados.
- Creación de mods y contenidos para la comunidad de *Steins;Gate*: se puede integrar en herramientas de edición de vídeo o en motores de juego para sustituir o añadir líneas de diálogo del personaje.
- Asistentes de voz personalizados: al ser un modelo ligero (1,9 B parámetros), puede desplegarse en hardware de consumo para construir un asistente con la personalidad y el tono del personaje, útil en proyectos de *roleplay* o entretenimiento.
- Audiolibros y narraciones: el modelo puede leer textos largos con la voz del personaje, manteniendo una prosodia natural y expresiva, siempre que el texto esté en uno de los idiomas soportados.
- Generación de contenido para redes sociales: creadores de contenido pueden producir vídeos o podcasts con la voz del personaje, aunque deben considerar las implicaciones legales del uso de una voz con derechos de autor.
- Investigación en adaptación de voz: el modelo sirve como ejemplo de fine-tune de un TTS de código abierto para una voz concreta, y puede utilizarse como referencia para estudiar técnicas de clonación y personalización de voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparativas con otros modelos TTS. El autor no ha documentado ninguna evaluación cuantitativa del fine-tune. Por tanto, no es posible ofrecer datos de rendimiento verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.916.676.352 parámetros, en precisión FP16 se requieren aproximadamente 3,8 GB de VRAM solo para los pesos. Añadiendo memoria para activaciones y buffers, se recomienda al menos 6 GB de VRAM para una generación fluida.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. Para despliegues con mayor concurrencia, se pueden usar A10, L4 o A100.
- Sí cabe en GPU de consumo: una RTX 3060 con 12 GB puede ejecutar el modelo sin problemas, incluso con cuantización a 8 bits (requeriría unos 2 GB de VRAM para los pesos).
- Opciones de despliegue: el modelo base Qwen3-TTS se integra con el paquete `qwen-tts` y con vLLM, según la documentación oficial. También puede ejecutarse mediante Hugging Face Transformers si se adapta el código. Para este fine-tune, se puede cargar con `transformers` o con el mismo paquete, siempre que se especifique la ruta local de los pesos.
- Latencia y throughput: no se han publicado datos específicos para este fine-tune. El modelo base reporta una latencia de síntesis de 97 ms en modo streaming, pero este valor puede variar según el hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos TTS. El modelo es un fine-tune de Qwen3-TTS, por lo que su rendimiento en términos de naturalidad y calidad de voz debería ser similar al del modelo base (1,7 B). Como alternativas en el mismo espacio de TTS de código abierto se pueden mencionar:

| Modelo | Parametros | Idiomas | Streaming | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B (base) | 1,7 B | 10 | Sí | Apache-2.0 | Modelo original sin fine-tune |
| Kurisu_Qwen3_TTS | 1,9 B | 10 (según base) | No disponible | Apache-2.0 | Fine-tune para una voz concreta |
| XTTS v2 (Coqui) | ~0,8 B | 17 | Sí | CPML (no comercial) | Clonación de voz con pocos segundos de audio |

Sin embargo, no hay datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única voz (Kurisu Makise) y no es adecuado para generar voces genéricas o múltiples timbres, salvo que se realice un nuevo fine-tune.
- No se ha documentado el proceso de fine-tune, por lo que se desconocen los datos de entrenamiento y posibles sesgos derivados de ellos.
- La voz del personaje puede estar sujeta a derechos de autor o de propiedad intelectual. Su uso comercial podría infringir licencias de la obra original *Steins;Gate*. Se recomienda verificar los términos legales antes de cualquier aplicación comercial.
- No se han publicado métricas de calidad objetiva (MOS, WER) para este fine-tune, por lo que la calidad percibida puede variar.
- El modelo base tiene limitaciones en la generación de audio de muy larga duración, y aunque soporta streaming, la estabilidad en sesiones prolongadas no está garantizada.
- La información sobre cuantización y formatos de despliegue es limitada; solo se han subido pesos en safetensors sin archivos de configuración adicionales, lo que puede dificultar su integración en frameworks estándar.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/starrydark/Kurisu_Qwen3_TTS
- Repositorio oficial de Qwen3-TTS en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Espacio de demostración "Kurisu TTS" en Hugging Face: https://huggingface.co/spaces/aveyas/kurisu-tts
- Página del modelo en OpenVox AI (referencia): https://openvoxai.com/models/qwen3-tts
- Ficha técnica en tinfoil.sh (referencia): https://tinfoil.sh/models/qwen3-tts
