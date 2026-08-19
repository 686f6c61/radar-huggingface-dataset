# SPRINGLab/SPRING_F5

## Resumen

SPRING_F5 es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por SPRINGLab, que parte del modelo base F5-TTS y lo ajusta para cubrir 23 idiomas indios y el inglés. El objetivo principal es ofrecer voces naturales y de alta calidad para lenguas con poca representación en los sistemas TTS comerciales, además de soportar code-mixing, es decir, la mezcla de idiomas dentro de una misma frase, algo habitual en la conversación cotidiana en la India.

El modelo se entrena sobre aproximadamente 3.220 horas de audio procedente de los datasets Rasa, IndicTTS e IndicVoices-R, y emplea la arquitectura F5-TTS con alrededor de 330 millones de parámetros. Su relevancia actual radica en que llena un vacío importante en el ecosistema TTS de código abierto para lenguas indias, con una licencia Apache 2.0 que permite su uso comercial sin restricciones. El repositorio incluye ejemplos de audio generados en telugu, tamil, hindi e inglés, demostrando su capacidad para producir habla fluida incluso en escenarios de code-mixing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching con backbone transformer) |
| Parametros totales | ~330 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 24: as, bn, bo, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, doi, raj, en |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (presumiblemente, al usar transformers) |

## Arquitectura y entrenamiento

SPRING_F5 se basa en F5-TTS, un modelo de síntesis de voz que utiliza flow matching sobre un backbone transformer. F5-TTS fue originalmente diseñado para generar habla de alta fidelidad a partir de texto y una referencia de audio, y SPRING_F5 extiende esta arquitectura a un conjunto mucho más amplio de idiomas. El modelo tiene aproximadamente 330 millones de parámetros, siguiendo la configuración base del trabajo original de F5-TTS.

El entrenamiento se realizó durante aproximadamente dos semanas en dos GPUs NVIDIA H200, utilizando un total de 3.220 horas de audio de alta calidad. Las fuentes de datos incluyen los datasets Rasa, IndicTTS e IndicVoices-R, todos ellos orientados a lenguas indias. No se menciona el uso de técnicas como RLHF o DPO en el ajuste; el proceso es un fine-tuning supervisado estándar sobre el modelo base. La innovación principal del modelo reside en su capacidad para manejar code-mixing y la conversión de números a palabras en idiomas indios, lo que mejora la naturalidad en contextos reales de uso.

## Capacidades

- Generación de voz multilingüe en 24 idiomas, incluyendo 23 lenguas indias (asamés, bengalí, bodo, guyaratí, hindi, canarés, cachemir, konkani, maithili, malayalam, manipuri, maratí, nepalí, oriya, punyabí, sánscrito, santali, sindhi, tamil, telugu, urdu, dogri, rayastaní) y el inglés.
- Soporte de code-mixing: puede generar habla que mezcla naturalmente un idioma indio con palabras o frases en inglés dentro de la misma oración, sin pausas artificiales.
- Conversión de números a palabras en idiomas indios mediante un identificador de idioma (`lang`), lo que evita la lectura literal de cifras.
- Salida de audio a 24 kHz de frecuencia de muestreo, con normalización de amplitud integrada en el flujo de ejemplo.
- Capacidad de transferencia de voz: el usuario puede proporcionar un audio de referencia para controlar las características vocales del habla generada.
- Integración sencilla con la librería transformers mediante `AutoModel` y `trust_remote_code`.

## Casos de uso

- Atención al cliente automatizada en idiomas regionales: el modelo puede gestionar conversaciones de voz en lenguas como tamil, telugu o hindi, con soporte de code-mixing para términos técnicos en inglés, lo que mejora la experiencia de usuarios en sectores como banca o telecomunicaciones.
- Audiolibros y contenido educativo: permite generar narraciones naturales en 24 idiomas, facilitando la producción de material educativo accesible en lenguas con poca oferta de voces sintéticas.
- Asistentes de voz multilingües: puede integrarse en asistentes personales o dispositivos IoT para responder en el idioma local del usuario, incluyendo la mezcla de idiomas típica de la conversación informal.
- Accesibilidad para personas con discapacidad visual: la síntesis de voz en lenguas indias permite convertir texto escrito (noticias, documentos, mensajes) en audio comprensible para usuarios que dependen de lectores de pantalla.
- Localización de contenido multimedia: doblaje automático de vídeos, podcasts o anuncios a múltiples idiomas indios, reduciendo costes de producción frente a la grabación con actores humanos.
- Sistemas de navegación y avisos públicos: generación de anuncios de voz en estaciones de tren, aeropuertos o transporte público en el idioma local, con la posibilidad de mezclar inglés para términos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~330 millones de parámetros, la inferencia es ligera; se estima que puede ejecutarse en GPUs con 8-16 GB de VRAM en precisión FP16, aunque no se proporcionan datos oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o GPUs de datacenter (A100, H200) son suficientes. El entrenamiento se realizó con 2×H200, pero la inferencia no requiere ese nivel.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: se puede utilizar directamente con la librería transformers mediante `AutoModel.from_pretrained` y `trust_remote_code`. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, que están orientadas a modelos de lenguaje, no a TTS.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPRING_F5 | ~330M | 24 (23 indios + inglés) | No disponible | Apache 2.0 | HuggingFace |
| F5-TTS (base) | ~330M | Principalmente inglés y algunos multilingües | No disponible | MIT (según repo original) | GitHub/HuggingFace |
| VITS | ~30-100M | Varía según checkpoint | No disponible | MIT (checkpoints varios) | HuggingFace |

La comparativa se limita a los modelos más cercanos disponibles públicamente. F5-TTS es el modelo base de SPRING_F5 y comparte arquitectura y tamaño, pero no tiene el soporte específico para lenguas indias ni el code-mixing. VITS es un modelo TTS más ligero pero con menos idiomas soportados y sin la capacidad de code-mixing documentada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse principalmente con datos de IndicVoices y Rasa, puede haber variaciones en la calidad según el idioma o el acento regional.
- Riesgo de alucinación: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en palabras poco frecuentes o nombres propios, especialmente en code-mixing.
- Limitaciones de contexto: no se especifica la longitud máxima de texto que puede procesar de una vez; para textos largos puede ser necesario segmentar la entrada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar las licencias de los datasets de entrenamiento (Rasa, IndicVoices-R) por si imponen condiciones adicionales.
- Caveat para producción: el modelo requiere un audio de referencia (`ref_audio_path`) para cada generación, lo que añade complejidad al pipeline. Además, el uso de `trust_remote_code=True` implica ejecutar código remoto, lo que debe evaluarse en entornos de seguridad estrictos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SPRINGLab/SPRING_F5
- Repositorio GitHub: https://github.com/ArigalaAdarsh/SPRING_F5
- Modelo base F5-TTS: https://github.com/SWivid/F5-TTS
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
