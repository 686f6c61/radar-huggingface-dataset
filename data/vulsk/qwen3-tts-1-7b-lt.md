# VULSK/qwen3-tts-1.7b-lt

## Resumen

VULSK/qwen3-tts-1.7b-lt es un ajuste fino (fine-tune) del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base de Alibaba Qwen, especializado en lituano (código de idioma `lt`) y orientado a dominios sanitarios. Lo publica el usuario VULSK en Hugging Face bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en la plataforma. El modelo resuelve la generación de voz en lituano con calidad natural y capacidad de clonación de voz, un idioma con poca cobertura en los sistemas TTS comerciales.

Técnicamente se trata de un modelo de 1.928.677.440 parámetros (aproximadamente 1.9B) en formato safetensors, con un repositorio de 4,5 GB, construido sobre la arquitectura Qwen3-TTS con tokenización de audio a 12 Hz. La librería asociada es `qwen-tts` y el pipeline declarado es text-to-speech. Su relevancia actual radica en que cubre un hueco poco atendido: TTS de alta calidad para lituano en entornos clínicos, con soporte declarado de streaming y despliegue mediante vLLM-OMNI.

Al estar basado en Qwen3-TTS, hereda las capacidades del modelo original (clonación de voz, síntesis multilingüe en origen) y las especializa mediante fine-tuning en un único idioma y un dominio concreto. No se han publicado en la información disponible detalles sobre el corpus de ajuste, los benchmarks ni las condiciones exactas de acceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer de síntesis de voz, tokenización de audio a 12 Hz) |
| Parámetros totales | 1.928.677.440 (~1.9B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | lituano (`lt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz de Alibaba Qwen que emplea una representación de audio tokenizada a 12 Hz, lo que reduce la longitud de secuencia necesaria para modelar la señal de voz y facilita la generación autorregresiva o semiautorregresiva de audio. El ajuste fino de VULSK parte de esos pesos y los especializa en lituano y en el dominio médico, según indican las etiquetas del repositorio (`lithuanian`, `medical`).

No se dispone de información sobre el volumen de datos de ajuste, la composición del corpus, el uso de RLHF/DPO ni las técnicas concretas de entrenamiento empleadas. Tampoco se detallan innovaciones adicionales más allá de las heredadas del modelo base (tokenización a 12 Hz, soporte de streaming y compatibilidad con vLLM-OMNI para servir el modelo).

## Capacidades

- Síntesis de voz (text-to-speech) en lituano con salida de audio natural.
- Clonación de voz a partir de muestras de referencia (capacidad heredada del modelo base Qwen3-TTS).
- Soporte de streaming de audio, adecuado para aplicaciones de baja latencia.
- Especialización declarada en dominio médico y sanitario.
- Compatibilidad con la librería `qwen-tts` y con el motor de inferencia vLLM-OMNI.
- Capacidades multilingües del modelo base no garantizadas tras el fine-tuning; el idioma declarado es únicamente lituano.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura de informes clínicos en lituano: el modelo puede convertir textos médicos en audio para profesionales o pacientes, aprovechando su ajuste específico en dominio sanitario y su pronunciación adaptada al vocabulario médico lituano.
- Accesibilidad para personas con discapacidad visual: narración de documentos y contenido web en lituano con voz natural, usando el modo streaming para reducir la latencia en lecturas largas.
- Asistentes de voz para atención al paciente: integración en sistemas de triaje telefónico o chatbots con salida de voz en lituano, donde la clonación de voz permite mantener una identidad sonora consistente.
- Locución de material formativo sanitario: generación de audio para cursos, guías y protocolos dirigidos a personal médico lituano, sin necesidad de grabaciones profesionales.
- Doblaje y postproducción de contenido divulgativo: síntesis de voz para vídeos educativos o institucionales en lituano, con clonación de una voz de referencia aprobada.
- Sistemas de alerta y notificación por voz: mensajes automatizados en entornos hospitalarios o de teleasistencia, donde el streaming y la baja latencia son críticos.
- Investigación en TTS de bajos recursos: servir como punto de partida para experimentos con lituano y otros idiomas bálticos, dado que la licencia Apache 2.0 permite modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 7,7 GB solo para pesos; en fp16/bf16, aproximadamente 3,9 GB. No se dispone de datos oficiales de cuantización para este modelo.
- GPU recomendadas: no disponible de forma específica; por tamaño, una GPU con al menos 8-12 GB de VRAM en bf16 resulta suficiente para pesos, dejando margen para el códec de audio y buffers.
- GPU de consumo: previsiblemente cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en bf16; en fp32 requeriría al menos 12-16 GB.
- Opciones de despliegue: vLLM-OMNI (soporte declarado en las etiquetas), librería `qwen-tts`; no se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| VULSK/qwen3-tts-1.7b-lt | ~1.9B | no disponible | lituano | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1.7B (según nombre) | no disponible | multilingüe | no disponible en la información | no disponible |
| Alternativas TTS específicas para lituano | no disponible | no disponible | lituano | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.
- El modelo está ajustado únicamente para lituano; su uso en otros idiomas puede degradar la calidad de forma notable.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir pronunciaciones incorrectas, omisiones o artefactos en textos fuera de distribución, especialmente con terminología médica poco frecuente.
- No se documentan sesgos de voz (género, acento, edad) ni la composición del corpus de ajuste, lo que impide evaluar su representatividad.
- La clonación de voz plantea riesgos de suplantación y uso indebido; es responsabilidad del integrador aplicar consentimiento y controles.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-TTS antes de un uso comercial en producción.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que la evaluación en producción debe hacerse mediante pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VULSK/qwen3-tts-1.7b-lt
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
