# Xenna/cielvox2-tts-0.6b-customvoice-GGUF

## Resumen

CielVox2 0.6B CustomVoice es un modelo de síntesis de voz (TTS) en formato GGUF, desarrollado por Xenna como parte del ecosistema CielVox2, un runtime local basado en ggml/llama.cpp. El modelo se basa en la arquitectura Qwen3-TTS (identificada como qwen3tts) y está diseñado para ejecutarse de forma totalmente local, sin depender de servicios en la nube ni de audio de referencia para fijar la voz. En lugar de clonar voces mediante muestras, este modelo incorpora nueve voces fijas seleccionables por nombre a través de un token de hablante.

El talker LM emite códigos RVQ de 16 codebooks a 12,5 fotogramas por segundo, que un codec separado (CielVox-Tokenizer-12Hz) convierte en audio PCM mono de 24 kHz. Con 905,8 millones de parámetros y un peso cuantizado Q8_0 de 968 MB, cabe en hardware de consumo y se controla desde la línea de comandos del binario `stelnettts`. Su licencia Apache 2.0 y su soporte para nueve idiomas lo convierten en una alternativa atractiva para aplicaciones de síntesis de voz locales, con privacidad de datos y sin coste por uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (qwen3tts) |
| Parámetros totales | 905.768.672 (~0,9B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única disponible) |
| Idiomas soportados | en, zh, de, fr, it, es, pt, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo es un decoder autoregresivo de la familia Qwen3-TTS, adaptado al runtime ggml. El talker LM tiene 28 capas, 1024 unidades ocultas, 16 cabezas de atención y 8 cabezas KV con head_dim de 64. La salida del modelo consiste en 16 codebooks de RVQ con 1024 tokens cada uno, que se generan a 12,5 fotogramas por segundo. El predictor de código es una capa adicional de 5 niveles con 15 pares separados de codec_embedding/lm_head, usando top-k de 50 y temperatura de 0,9.

El audio final se obtiene con un codec independiente, CielVox-Tokenizer-12Hz, que decodifica los 16 codebooks RVQ a PCM mono de 24 kHz. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El autor tampoco detalla el proceso de conversión de los pesos originales de Qwen3-TTS al formato GGUF más allá de la mención del script `convert-cielvox2-tts-to-gguf.py`.

## Capacidades

- Síntesis de voz a texto con nueve voces fijas: `aiden` (por defecto, inglés masculino), `dylan` (dialecto de Pekín, token 2074), `eric` (dialecto de Sichuan, token 2062), `ono_anna` (inglés femenino), `ryan` (inglés masculino), `serena` (inglés femenino), `sohee` (inglés femenino), `uncle_fu` (inglés masculino, mayor) y `vivian` (inglés femenino).
- Soporte de dialectos chinos regionales: `dylan` y `eric` llevan tokens de dialecto específicos (Beijing y Sichuan).
- Multilingüismo declarado: el modelo soporta nueve idiomas (inglés, chino, alemán, francés, italiano, español, portugués, japonés y coreano), aunque las voces predefinidas están mayoritariamente en inglés y chino.
- No requiere audio de referencia: a diferencia de los modos base de Qwen3-TTS, las voces se fijan con un token, sin necesidad de ECAPA, codificador de codec ni muestra de voz.
- Generación de audio de 24 kHz en formato float32 PCM, con codec RVQ de 12,5 fps.
- Ejecución local mediante CLI con descarga automática de modelos (`-m auto`).

## Casos de uso

- Asistentes de escritorio y aplicaciones de voz locales: el modelo puede integrarse en asistentes que necesiten síntesis de voz sin conexión, ya que el binario `stelnettts` se ejecuta directamente en el equipo con 968 MB de peso y sin dependencias de red.
- Accesibilidad y lectura de pantalla: para personas con discapacidad visual, se puede generar voz a partir de texto de forma privada, sin enviar contenido a servicios externos, lo que es crítico en entornos con datos sensibles.
- Locución para vídeo educativo: las voces masculinas y femeninas fijas en inglés permiten generar narraciones para tutoriales o vídeos de divulgación sin necesidad de grabar locución profesional ni usar servicios de pago.
- Aprendizaje de idiomas y dialectos: las voces con dialectos chinos (Pekín y Sichuan) pueden utilizarse en aplicaciones de práctica de pronunciación y comprensión regional.
- Sistemas de respuesta interactiva (IVR): en un centro de llamadas o atención telefónica, se puede desplegar una voz consistente (`uncle_fu` para un perfil mayor, `serena` para atención general) sin depender de proveedores de TTS en la nube.
- Prototipado rápido de productos de voz: para maquetas de aplicaciones, se generan muestras de voz con distintas voces en segundos, permitiendo evaluar tono y estilo antes de invertir en locución real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una verificación de calidad mediante reconocimiento de voz (ASR) con el modelo Parakeet-TDT-0.6B, con los siguientes resultados:

| Speaker | Texto sintetizado | Salida de Parakeet |
|---|---|---|
| `vivian` | "Hello, this is a CustomVoice test using the vivian speaker." | "Hello! This is a custom voice test using the Vivian speaker." |
| `aiden` | "The quick brown fox jumps over the lazy dog." | "The quick brown fox jumps over the lazy dog." |
| `serena` | "Testing the new backend alias and the serena speaker." | "Testing the new back end Ilias and the Serena speaker." |

La transcripción es correcta en la mayoría de los casos, con un error en la salida de `serena` (interpretación de "alias" como "Ilias"). No se proporcionan métricas cuantitativas como WER o CER.

## Requisitos de hardware

| Componente | Detalle |
|---|---|
| VRAM estimada | El archivo Q8_0 ocupa 968 MB; se estima que cabe en cualquier GPU con 4 GB de VRAM o más. En CPU, se necesita entre 4 y 8 GB de RAM. |
| GPU recomendadas | NVIDIA GTX 1650/2060 o superiores; cualquier GPU compatible con llama.cpp/ggml. No se requieren GPUs de datacenter. |
| CPU | Puede ejecutarse en CPU con 4-8 GB de RAM, aunque la latencia será mayor que en GPU. |
| Opciones de despliegue | Binario `stelnettts` compilado desde el repositorio CielVox2 (llama.cpp/ggml). No se menciona soporte para vLLM, Ollama ni TGI. |
| Latencia y throughput | No se han publicado cifras concretas. |

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Voz fija |
|---|---|---|---|---|---|
| CielVox2 0.6B CustomVoice (este) | 0,9B | no disponible | GGUF | Apache 2.0 | Sí (9 voces) |
| CielVox2 0.6B Base | 0,9B | no disponible | GGUF | Apache 2.0 | No (requiere audio de referencia) |
| CielVox2 1.7B Base | 1,7B | no disponible | GGUF | Apache 2.0 | No (requiere audio de referencia) |
| Qwen3-TTS 0.6B (original) | 0,6B | no disponible | safetensors | Apache 2.0 | No (requiere audio) |

Nota: las especificaciones de las versiones base y 1.7B provienen del repositorio de GitHub de CielVox2; no se dispone de datos completos de esos modelos.

## Limitaciones y advertencias

- Voces fijas: no se puede clonar una voz nueva ni usar audio de referencia; solo están disponibles las nueve voces predefinidas.
- Cobertura de idiomas limitada en la práctica: aunque se declaran nueve idiomas, las voces disponibles están en inglés y dialectos chinos; el rendimiento en el resto de idiomas no está verificado.
- Cuantización limitada: solo se ofrece Q8_0; no hay versiones Q4_K_M ni Q5_K_M, lo que limita la optimización de memoria.
- Requiere un codec externo: el modelo no genera audio directamente; necesita el archivo `cielvox-tokenizer-12hz.gguf` para decodificar los códigos.
- Frecuencia de muestreo de 24 kHz: inferior a los 44,1 o 48 kHz estándar en producción de audio profesional.
- Riesgo de errores en la síntesis: la verificación ASR muestra errores ocasionales en la transcripción de la salida (p. ej., "Ilias" en lugar de "alias").
- Información de entrenamiento ausente: no se publican datos sobre el dataset, el proceso de entrenamiento ni posibles sesgos, lo que dificulta la validación en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xenna/cielvox2-tts-0.6b-customvoice-GGUF
- Repositorio CielVox2 (GitHub): https://github.com/stelnetxcis-create/cielvox2
- Codec asociado: https://huggingface.co/Xenna/cielvox2-tokenizer-12hz
- Modelo base (0.6B): https://huggingface.co/Xenna/cielvox2-tts-0.6b-base-GGUF
- Qwen3-TTS (GitHub): https://github.com/QwenLM/Qwen3-TTS
