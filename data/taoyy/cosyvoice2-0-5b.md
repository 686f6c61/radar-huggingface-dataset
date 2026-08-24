# taoyy/CosyVoice2-0.5B

## Resumen

CosyVoice2-0.5B es un sistema de síntesis de voz (text-to-speech) basado en grandes modelos de lenguaje (LLM), desarrollado por el equipo FunAudioLLM de Alibaba. Este modelo representa la segunda generación de la familia CosyVoice y aborda el problema de la síntesis de voz natural y expresiva con capacidades de clonación de voz en cero disparos (zero-shot), utilizando únicamente 3 segundos de audio de referencia para replicar una voz. Su relevancia actual radica en que combina generación de voz multilingüe, control mediante lenguaje natural y latencia ultrabaja de 150 ms para el primer paquete de audio, lo que lo hace apto para aplicaciones de streaming en tiempo real.

El modelo tiene 500 millones de parámetros y soporta cinco idiomas: chino mandarín, inglés, japonés, coreano y cantonés. Su arquitectura integra un modelo de lenguaje autorregresivo con un decodificador de flujo (flow matching) para generar audio de alta calidad a 25 Hz. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y está disponible en formato safetensors. El repositorio en Hugging Face contiene el modelo completo con un tamaño de 4.1 GB, e incluye soporte para inferencia en streaming mediante optimizaciones como KV cache y SDPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM autorregresivo + decodificador de flujo (flow matching) |
| Parametros totales | 500 millones (0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino mandarin (zh), ingles (en), japones (ja), coreano (ko), canton (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CosyVoice2-0.5B emplea una arquitectura híbrida que combina un modelo de lenguaje autorregresivo (LLM) con un decodificador basado en flow matching para la generación de audio. El LLM se encarga de modelar la secuencia de unidades de voz discretas, mientras que el decodificador de flujo transforma estas representaciones en formas de onda de audio continuas. Esta combinación permite una síntesis de voz estable y de alta calidad, con una tasa de generación de 25 Hz. El modelo integra modelado offline y streaming en un único sistema, lo que facilita la síntesis bidireccional y reduce la latencia del primer paquete a 150 ms sin pérdida significativa de calidad.

El entrenamiento incorpora técnicas como Repetition Aware Sampling (RAS) para mejorar la estabilidad del LLM durante la inferencia, así como soporte para streaming con KV cache y SDPA (Scaled Dot-Product Attention) para optimizar el factor de tiempo real (RTF). Aunque los detalles específicos del dataset de entrenamiento no están disponibles en la información proporcionada, el modelo está diseñado para soportar múltiples idiomas y tareas como clonación de voz, conversión de voz y control por instrucciones en lenguaje natural. El modelo se distribuye con los pesos completos y requiere el código oficial del repositorio CosyVoice para su uso.

## Capacidades

- Generación de voz multilingüe: síntesis de voz natural en chino mandarín, inglés, japonés, coreano y cantonés.
- Clonación de voz zero-shot: replica el timbre de una voz con solo 3 segundos de audio de referencia.
- Clonación de voz cross-lingüe: permite sintetizar voz en un idioma distinto al del audio de referencia.
- Control por lenguaje natural: mediante instrucciones en texto, se puede controlar la velocidad, emoción, dialecto y otros atributos de la voz generada.
- Inferencia en streaming: soporta síntesis bidireccional con latencia ultrabaja de 150 ms para el primer paquete de audio.
- Conversión de voz: capacidad para transformar la voz de un hablante a otro manteniendo el contenido lingüístico.
- Generación de audio a 25 Hz: produce audio de alta calidad con una tasa de muestreo de 25 Hz.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede integrarse en asistentes virtuales que requieren respuestas de voz inmediatas, gracias a su latencia de 150 ms y soporte de streaming bidireccional.
- Doblaje y localización de contenido: permite clonar la voz de un actor o locutor y sintetizar diálogos en otros idiomas manteniendo el timbre original, lo que resulta útil para doblaje automático de películas o series.
- Audiolibros personalizados: con la clonación zero-shot, se puede generar un audiolibro completo con la voz del propio usuario o de un narrador específico a partir de una muestra breve.
- Atención al cliente automatizada: el control por lenguaje natural permite ajustar el tono y la emoción de las respuestas de voz en sistemas IVR, mejorando la experiencia del usuario.
- Creación de contenido para redes sociales: los creadores pueden generar locuciones multilingües con su propia voz o con voces personalizadas para vídeos, podcasts o anuncios.
- Herramientas de accesibilidad: personas con discapacidad visual o dificultades de lectura pueden beneficiarse de sistemas de lectura de texto en voz alta con voces naturales y personalizables.
- Educación y aprendizaje de idiomas: el modelo puede generar ejemplos de pronunciación en varios idiomas con diferentes voces, facilitando la práctica de comprensión auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque al tratarse de un modelo de 0.5B, es probable que quepa en GPUs de consumo con al menos 8 GB de VRAM en cuantizaciones ligeras.
- GPU recomendadas: no disponible en la información proporcionada; se recomienda una GPU con al menos 8-12 GB de VRAM para inferencia fluida.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño reducido del modelo (4.1 GB en safetensors), aunque no se especifica explícitamente.
- Opciones de despliegue: el modelo requiere el código oficial de CosyVoice (disponible en GitHub) y puede ejecutarse en entornos Python con PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: la latencia del primer paquete de audio es de 150 ms en modo streaming, según la documentación oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Streaming | Licencia |
|---|---|---|---|---|---|
| CosyVoice2-0.5B | 0.5B | zh, en, ja, ko, yue | Si (3s referencia) | Si (150 ms) | Apache 2.0 |
| CosyVoice-300M | 300M | zh, en, ja, ko, yue | Si | No (solo offline) | Apache 2.0 |
| XTTS v2 (Coqui) | 0.4B | 17 idiomas | Si (6s referencia) | No | CPML (no comercial) |
| Bark (Suno) | 1.2B | 13 idiomas | No (solo voces predefinidas) | No | MIT |

## Limitaciones y advertencias

- El modelo está diseñado principalmente para investigación y demostración técnica; la model card indica que "solo se utiliza para investigación académica y demostración técnica", lo que puede limitar su uso en producción comercial sin evaluación adicional.
- No se proporcionan datos sobre sesgos en los datos de entrenamiento ni sobre riesgos de alucinación en la síntesis de voz.
- La calidad de la clonación de voz depende de la calidad del audio de referencia; audios ruidosos o de baja calidad pueden degradar el resultado.
- El soporte de idiomas se limita a cinco lenguas; no cubre otros idiomas como francés, alemán o español.
- No se especifican requisitos mínimos de hardware ni se ofrecen paquetes de cuantización, lo que puede dificultar el despliegue en entornos con recursos limitados.
- La latencia de 150 ms se refiere al primer paquete de audio; la latencia total puede variar según la longitud del texto y el hardware utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taoyy/CosyVoice2-0.5B
- Modelo original: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Repositorio oficial: https://github.com/FunAudioLLM/CosyVoice
- Paper: https://arxiv.org/abs/2412.10117
- Demo y documentacion: https://fun-audio-llm.github.io/cosyvoice2/
