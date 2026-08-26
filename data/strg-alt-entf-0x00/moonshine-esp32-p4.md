# Strg-Alt-Entf-0x00/Moonshine-ESP32-P4

## Resumen

Moonshine-ESP32-P4 es un repositorio que contiene modelos de reconocimiento automático de voz (ASR) de la familia Moonshine, preconvertidos al formato binario `.mshn` para su ejecución nativa en el microcontrolador ESP32-P4 de Espressif. El autor, Strg-Alt-Entf-0x00, ha adaptado los checkpoints originales de PyTorch de los modelos `moonshine-seq2seq-mshn-base-en`, `moonshine-seq2seq-mshn-tiny-de` y `moonshine-seq2seq-mshn-tiny-en` para que puedan cargarse directamente desde una tarjeta SD en el ESP32-P4, sin depender de frameworks de inferencia pesados.

El problema que resuelve es la necesidad de ejecutar transcripción de voz en tiempo real en dispositivos embebidos con recursos muy limitados, donde los modelos ASR convencionales son demasiado grandes o lentos. Moonshine, desarrollado originalmente por UsefulSensors, es una familia de modelos encoder-decoder optimizados para edge computing, con un tamaño de aproximadamente 61 millones de parámetros en su variante base. Este repositorio añade la capa de conversión y cuantización (fp32, int8 e int8 por canal) específica para el ESP32-P4, un microcontrolador con núcleos RISC-V y acelerador de IA.

La relevancia actual radica en el creciente interés por asistentes de voz locales y privados en dispositivos IoT, donde la latencia y la privacidad son críticas. Al ofrecer variantes cuantizadas a int8, el modelo puede ejecutarse con un consumo de memoria reducido, manteniendo una precisión aceptable para comandos de voz y transcripción corta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con Rotary Position Embedding (RoPE) |
| Parametros totales | 61M (modelo base, segun documentacion de Moonshine; no confirmado en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, int8 (per-tensor), int8ch (per-channel) |
| Idiomas soportados | Ingles (modelos base-en y tiny-en), aleman (modelo tiny-de) |
| Licencia | no disponible (depende de la licencia upstream de Moonshine) |
| Formato de pesos | `.mshn` (binario propietario para ESP32-P4), `tokenizer.json`, `vocab.bin` |

## Arquitectura y entrenamiento

Moonshine es un modelo de reconocimiento de voz de tipo encoder-decoder basado en transformer. A diferencia de los modelos ASR tradicionales que usan posiciones absolutas, Moonshine emplea Rotary Position Embedding (RoPE), lo que permite manejar secuencias de voz de longitud variable sin necesidad de padding. Esto mejora la eficiencia en inferencia, especialmente en dispositivos con memoria limitada. El modelo está diseñado para transcripción en tiempo real y reconocimiento de comandos de voz, priorizando la baja latencia sobre la precisión en textos largos.

El repositorio no incluye información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Los binarios `.mshn` son conversiones directas de los checkpoints de PyTorch de Moonshine, realizadas por el autor del repo. No se documentan innovaciones técnicas adicionales más allá de la conversión y cuantización para el ESP32-P4. La cuantización int8 por canal (`int8ch`) es la variante recomendada por el autor para uso embebido, ya que reduce el uso de memoria manteniendo escalado por canal de salida.

## Capacidades

- Transcripción de voz a texto en inglés (modelos base-en y tiny-en) y alemán (modelo tiny-de).
- Reconocimiento de comandos de voz en tiempo real, optimizado para baja latencia.
- Ejecución nativa en ESP32-P4 sin dependencias externas de red o frameworks de inferencia.
- Soporte de cuantización int8 e int8 por canal para reducir el consumo de memoria.
- Carga de modelos desde tarjeta SD, lo que permite actualizar o cambiar el modelo sin reflashear el firmware.
- No se documentan capacidades de tool calling, agentes, visión ni otras modalidades.

## Casos de uso

- Asistentes de voz locales en dispositivos IoT: el modelo puede ejecutarse en un ESP32-P4 integrado en un altavoz inteligente o un electrodoméstico, procesando comandos de voz sin enviar audio a la nube, lo que garantiza privacidad y baja latencia.
- Control por voz en automatización del hogar: un sistema de domótica puede usar el modelo para reconocer comandos como "encender la luz" o "subir la persiana", con respuesta en milisegundos gracias a la inferencia local.
- Transcripción de notas de voz en dispositivos portátiles: un grabador de voz con ESP32-P4 puede transcribir audio en inglés o alemán de forma offline, útil para periodistas o estudiantes en entornos sin conectividad.
- Interfaz de voz para personas con movilidad reducida: el modelo permite controlar una silla de ruedas o un sistema de llamada mediante comandos de voz, funcionando de forma autónoma y sin depender de servicios externos.
- Prototipado rápido de productos con voz: los desarrolladores pueden integrar el modelo en un ESP32-P4 para validar conceptos de productos con interacción por voz, gracias a la facilidad de carga desde SD y la variedad de cuantizaciones.
- Sistemas de seguridad con verificación por voz: combinado con un VAD (detección de actividad de voz) como el FireRedVAD portado por el mismo autor, el modelo puede activar grabación o alertas solo cuando se detecta habla, reduciendo el consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (WER, CER) ni comparativas con otros modelos ASR. La documentación de Moonshine en HuggingFace y STT.ai menciona que es adecuado para edge, pero no se proporcionan números concretos en esta ficha.

## Requisitos de hardware

- Plataforma objetivo: microcontrolador Espressif ESP32-P4 (núcleos RISC-V, acelerador de IA integrado).
- Memoria: la variante int8ch es la recomendada para reducir el uso de RAM; no se especifican cifras exactas de memoria requerida.
- Almacenamiento: tarjeta SD para alojar los binarios del modelo (el repositorio ocupa 0.7 GB en total, pero cada modelo individual es mucho menor).
- No aplica VRAM de GPU; es un sistema embebido.
- Despliegue: firmware personalizado que carga los archivos `.mshn` desde la SD; no se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no son aplicables a este hardware.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Moonshine se posiciona como una alternativa más compacta a modelos como Whisper de OpenAI, pero no hay métricas concretas de rendimiento en este repositorio. La comparativa cualitativa indicaría que Moonshine está diseñado específicamente para edge, mientras que Whisper requiere más recursos, pero no se pueden dar cifras sin fuentes verificadas.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio; el autor remite a la licencia de los modelos Moonshine originales, que debe revisarse antes de cualquier uso comercial o redistribución.
- El modelo solo cubre inglés y alemán; no hay soporte para otros idiomas en las variantes incluidas.
- Al ser una conversión para un microcontrolador, la precisión puede verse afectada por la cuantización int8, especialmente en entornos ruidosos o con acentos no estándar.
- No se documentan sesgos específicos, pero al ser un modelo entrenado principalmente con datos en inglés, puede tener un rendimiento inferior con hablantes no nativos o variedades dialectales.
- El formato `.mshn` es propietario y solo funciona con el firmware específico del autor; no es portable a otras plataformas sin reconversión.
- No hay garantías de soporte o mantenimiento del repositorio; el autor no proporciona información sobre actualizaciones o correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Strg-Alt-Entf-0x00/Moonshine-ESP32-P4
- GitHub del autor (esp-uart-filebridge): https://github.com/Strg-Alt-Entf-0x00/esp-uart-filebridge
- GitHub del autor (FireRedVAD para ESP32-P4): https://github.com/Strg-Alt-Entf-0x00/firered-vad-esp32-p4
- Modelos Moonshine originales en HuggingFace: https://huggingface.co/UsefulSensors/moonshine
- Documentación de Moonshine en Transformers: https://huggingface.co/docs/transformers/en/model_doc/moonshine
- Ficha de Moonshine en STT.ai: https://stt.ai/models/moonshine/
