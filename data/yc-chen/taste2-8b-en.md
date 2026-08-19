# YC-Chen/TASTE2-8B-EN

## Resumen

TASTE2-8B-EN es un modelo de lenguaje hablado (spoken language model) orientado a síntesis de voz y agentes de voz full-duplex, desarrollado por el autor YC-Chen. A diferencia de los sistemas tradicionales de text-to-speech que generan audio a partir de texto, este modelo está diseñado para operar en conversaciones bidireccionales, lo que lo hace relevante para asistentes de voz interactivos y agentes conversacionales en tiempo real. El modelo está pensado para el idioma inglés y se distribuye bajo una licencia de uso exclusivamente investigador (taste2-research-only), con acceso restringido en HuggingFace.

Según la nomenclatura del nombre, el modelo tendría aproximadamente 8 mil millones de parámetros, aunque este dato no ha sido confirmado en la información disponible. El repositorio ocupa 42,2 GB, lo que sugiere que los pesos se almacenan en formato de alta precisión (probablemente FP16 o BF16) y que la inferencia requerirá hardware con capacidad de memoria considerable. No se han publicado detalles sobre la arquitectura interna, el contexto máximo soportado ni los datos de entrenamiento, por lo que esta ficha se basa únicamente en la información pública del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8B (según nombre del modelo, no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | taste2-research-only (solo investigación) |
| Formato de pesos | safetensors, onnx (según etiquetas del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura de TASTE2-8B-EN. Por las etiquetas del repositorio (spoken-language-model, full-duplex, voice-agent), se deduce que se trata de un modelo de lenguaje entrenado para procesar y generar audio directamente, probablemente basado en un transformer con codificación de audio, similar a otros modelos de habla recientes. Sin embargo, no hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas como decodificación especulativa o atención lineal. Toda esta información está pendiente de publicación por parte de los autores.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, generando audio a partir de texto.
- Operación full-duplex: capacidad de manejar conversaciones bidireccionales simultáneas, lo que permite interacción en tiempo real sin esperar a que el usuario termine de hablar.
- Orientado a agentes de voz: diseñado para integrarse en sistemas de asistente conversacional que requieren respuesta oral natural.
- Posible soporte de diálogo multi-turno, aunque no se especifica la longitud de contexto ni la gestión de historial.
- No se confirman capacidades de tool calling, razonamiento complejo, ni procesamiento de otras modalidades (visión, audio además de voz).

## Casos de uso

- Asistentes de voz para atención al cliente: el modelo puede gestionar conversaciones telefónicas o por voz con clientes, respondiendo preguntas frecuentes y derivando casos complejos a humanos. Su naturaleza full-duplex permite interrumpir o ser interrumpido, similar a una conversación natural.
- Agentes de voz para domótica: integración en altavoces inteligentes o sistemas de control del hogar, donde el usuario habla de forma natural y el modelo responde oralmente, manteniendo el flujo de la conversación.
- Lectura de contenidos dinámicos: generación de audiolibros o podcasts personalizados a partir de texto, con entonación y ritmo adecuados gracias a su entrenamiento en lenguaje hablado.
- Sistemas de tutoría o aprendizaje de idiomas: el modelo puede actuar como interlocutor en inglés, permitiendo a los estudiantes practicar conversación con retroalimentación oral inmediata.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con capacidad de responder a preguntas sobre el contenido leído.
- Prototipado de interfaces de voz: los desarrolladores pueden usar el modelo para crear demos rápidas de asistentes de voz en inglés, validando flujos conversacionales antes de implementar soluciones completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de síntesis de voz (MOS, WER, etc.). Se recomienda consultar el repositorio de HuggingFace para futuras actualizaciones.

## Requisitos de hardware

- El tamaño del repositorio (42,2 GB) sugiere que los pesos están en FP16/BF16, lo que requeriría al menos 16 GB de VRAM para cargar el modelo completo en una GPU. Con cuantización (por ejemplo, INT8 o INT4) podría reducirse, pero no se han publicado versiones cuantizadas.
- GPUs recomendadas: para inferencia en FP16, una NVIDIA A100 (40/80 GB) o H100 serían adecuadas. En el ámbito consumer, una RTX 4090 (24 GB) podría ser insuficiente si el modelo supera los 16 GB en FP16; una RTX 3090 (24 GB) o RTX 4080 (16 GB) podrían funcionar con cuantización, aunque no hay garantías.
- No se dispone de información sobre latencia o throughput. Dado que es un modelo de voz, la generación de audio suele ser más lenta que la de texto, y el factor de tiempo real dependerá del hardware y de la implementación.
- Opciones de despliegue: no se mencionan frameworks específicos. Al estar en formato safetensors y onnx, podría desplegarse con ONNX Runtime o convertirse a GGUF para ejecutarlo con llama.cpp u Ollama, pero no hay documentación al respecto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de lenguaje hablado full-duplex. No se conocen alternativas directas en el momento de redactar esta ficha. Modelos como Whisper (reconocimiento) o VITS (TTS) son de naturaleza diferente, y no se han encontrado modelos comparables con las mismas características (spoken language model, full-duplex, 8B). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia de uso exclusivamente investigador (taste2-research-only): no está permitido su uso comercial sin autorización expresa de los autores. Esto limita su adopción en producción.
- Acceso restringido (gated): es necesario solicitar acceso en HuggingFace y aceptar las condiciones, lo que añade una barrera de entrada.
- Idioma limitado: solo se ha confirmado soporte para inglés, sin información sobre otros idiomas.
- Sin datos sobre sesgos o alucinaciones: al ser un modelo de voz, podría generar contenido incorrecto o inapropiado, pero no hay evaluaciones publicadas.
- Sin especificaciones de contexto: se desconoce la longitud máxima de la conversación que puede manejar, lo que dificulta planificar su uso en diálogos largos.
- Repositorio con 0 descargas y 0 likes: indica que el modelo es muy reciente o poco difundido, y no hay evidencia de pruebas por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YC-Chen/TASTE2-8B-EN
