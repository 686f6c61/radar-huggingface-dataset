# Synaptics/moonshine-streaming-tiny-torq

## Resumen

Moonshine Streaming Tiny es un modelo de reconocimiento automático de voz (ASR) de alta eficiencia diseñado para transcripción en tiempo real, desarrollado originalmente por Useful Sensors y posteriormente compilado por Synaptics para su plataforma de edge computing Torq, orientada a los procesadores Astra SL2600. A diferencia de arquitecturas como Whisper, que procesan audio en bloques fijos de 30 segundos, Moonshine utiliza una arquitectura de longitud variable que solo computa la duración real del habla recibida, reduciendo la latencia y el coste computacional. La versión *tiny* cuenta con 27 millones de parámetros y se basa en Moonshine V2, que incorpora atención de ventana deslizante en el encoder para permitir el streaming de la codificación sin esperar a la señal completa. Este modelo está pensado para ejecutarse en dispositivos de bajo consumo, ofreciendo un factor de tiempo real (RTF) inferior a 1 en el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder con atención de ventana deslizante) |
| Parametros totales | 27 millones (version tiny) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 30 segundos de audio (16 kHz mono) |
| Tipos de cuantizacion | Ninguna (modelo compilado con Torq) |
| Idiomas soportados | Ingles (segun la documentacion del modelo original) |
| Licencia | MIT |
| Formato de pesos | Modelo compilado para Torq (formato propietario de Synaptics) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine, un sistema encoder-decoder de longitud variable pensado para ASR en tiempo real. La version V2, sobre la que se basa este modelo, introduce atención de ventana deslizante en el encoder, lo que permite que los frames de audio se codifiquen y se transmitan al decoder de forma incremental, reduciendo el tiempo hasta el primer token (TTFT). El modelo acepta como entrada una forma de onda cruda de 16 kHz mono y produce una secuencia de identificadores de token. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO). La versión compilada en este repositorio ha sido generada con Torq, la herramienta de compilación de Synaptics, y no incluye cuantización adicional.

## Capacidades

- Reconocimiento de voz en tiempo real (streaming) con baja latencia gracias a la atención de ventana deslizante en el encoder.
- Procesamiento de audio crudo a 16 kHz mono, sin necesidad de extracción previa de características.
- Generación de transcripciones en inglés a partir de la entrada de audio.
- Eficiencia energética y computacional optimizada para ejecución en hardware edge de bajo consumo (Synaptics Astra SL2600).
- No incluye capacidades de tool calling, razonamiento multi-paso, visión ni otras modalidades; es exclusivamente un modelo de ASR.

## Casos de uso

- Asistentes de voz en dispositivos IoT: el modelo puede activarse y transcribir comandos de voz en tiempo real en altavoces inteligentes o electrodomésticos conectados, gracias a su bajo RTF y su capacidad de streaming.
- Transcripción en vivo para subtitulado: al procesar audio de forma incremental, es adecuado para generar subtítulos en tiempo real en reuniones, conferencias o retransmisiones, sin esperar a que termine la frase.
- Control por voz en entornos industriales: integrado en maquinaria o paneles de control, permite dictar órdenes o registrar incidencias sin necesidad de conexión a la nube, manteniendo la privacidad y reduciendo la latencia.
- Sistemas de dictado portátiles: en dispositivos como grabadoras o wearables, el modelo puede transcribir notas de voz de forma continua, con un consumo energético lo suficientemente bajo para funcionar con batería.
- Accesibilidad para personas con discapacidad motora: permite interactuar con ordenadores o móviles mediante voz, ofreciendo una respuesta inmediata gracias al streaming.
- Automatización del hogar: comandos de voz para controlar luces, persianas o termostatos, ejecutados localmente en un MPU Astra SL2600, sin depender de servicios externos.

## Benchmarks y rendimiento

La información disponible incluye métricas de rendimiento medidas en la plataforma SL2610 con Torq v2.1.0:

| Plataforma | Modelo / Etapa | Entorno | Factor de tiempo real (RTF) | Tokens / s | Tipo de métrica |
|---|---|---|---|---|---|
| SL2610 | Moonshine Tiny Encoder | Torq v2.1.0 | 0.38 | N/A | Media global |
| SL2610 | Moonshine Tiny Decoder | Torq v2.1.0 | 0.68 | 36.6 | Media global |

Estos valores indican que el modelo procesa audio más rápido que en tiempo real (RTF < 1), siendo adecuado para aplicaciones interactivas. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no son aplicables a un modelo de ASR.

## Requisitos de hardware

- Plataforma objetivo: procesadores Synaptics Astra SL2600-Series (concretamente SL2610 en las métricas proporcionadas).
- No requiere GPU ni VRAM; está diseñado para ejecutarse en MPU de bajo consumo.
- El despliegue se realiza mediante la herramienta Torq, que compila el modelo para el hardware específico.
- No se dispone de datos de latencia o throughput para otras plataformas (GPU, CPU de escritorio, etc.), ya que el modelo compilado es específico para Astra SL2600.
- Para probar el modelo en otros entornos, sería necesario acceder al modelo fuente (aún no publicado, según la model card).

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos ASR en la información proporcionada. Sin embargo, se puede contextualizar frente a alternativas conocidas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Moonshine Streaming Tiny (este) | 27M | 30 s audio | MIT | Compilado para Torq |
| Whisper tiny | 39M | 30 s audio | MIT | Multiplataforma (PyTorch, ONNX, etc.) |
| Whisper base | 74M | 30 s audio | MIT | Multiplataforma |

Moonshine destaca por su capacidad de streaming y su menor número de parámetros, lo que lo hace más ligero para edge, aunque está limitado a hardware Synaptics en esta versión compilada. No se dispone de datos de rendimiento comparativo en términos de WER o precisión.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha confirmado soporte para otros idiomas.
- La ventana de audio está limitada a 30 segundos, por lo que no es adecuado para transcribir segmentos largos de una sola vez.
- No se han publicado detalles sobre sesgos del modelo, pero al ser un ASR entrenado con datos de voz, puede presentar errores en acentos no representados o entornos ruidosos.
- La versión compilada solo funciona en hardware Astra SL2600 con Torq; no es portable a otras arquitecturas sin recompilar desde el modelo fuente (aún no disponible).
- No se incluye cuantización, lo que puede limitar la eficiencia en dispositivos con memoria muy restringida.
- Para uso en producción, se recomienda validar el rendimiento en el hardware objetivo, ya que las métricas proporcionadas corresponden a una plataforma específica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Synaptics/moonshine-streaming-tiny-torq
- Modelo base (Useful Sensors): https://huggingface.co/UsefulSensors/moonshine-streaming-tiny
- Ejemplos de Torq (GitHub): https://github.com/synaptics-torq/torq-examples
- Documentación de Torq Compiler: https://synaptics-torq.github.io/torq-compiler/v/latest/
- Synaptics AI Developer Zone: https://developer.synaptics.com
