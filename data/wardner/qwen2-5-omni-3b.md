# wardner/Qwen2.5-Omni-3B

## Resumen

`wardner/Qwen2.5-Omni-3B` es un paquete de despliegue derivado del modelo multimodal Qwen2.5-Omni-3B de Alibaba Qwen, convertido a los formatos propietarios RKNN y RKLLM para su ejecución sobre hardware Rockchip. No se trata de los pesos originales en safetensors ni de una versión estándar de Hugging Face Transformers, sino de artefactos de inferencia precompilados para la tarjeta de cómputo RK182x (1,82 TOPS) montada sobre una plataforma anfitriona RK3588. El autor, `wardner`, publica además el manifiesto del worker (`qwen2.5-omni-3b.json`) que integra el modelo en su interfaz web `wdnwebui`.

El modelo subyacente es un LLM multimodal de la familia Qwen2.5-Omni, con arquitectura Thinker-Talker según la model card original de Qwen, aunque esta distribución concreta declara únicamente la capacidad `swcap_audio_chat` (entrada de audio, salida de texto) y un límite de 6 segundos por inferencia. El paquete ocupa 3,62 GB de pesos y requiere aproximadamente 2500 MB de memoria, con un tiempo de inicialización de unos 50 segundos.

Su relevancia es acotada pero clara: permite llevar un modelo conversacional de audio a placas de bajo consumo basadas en RK3588 sin depender de GPUs dedicadas. No obstante, la licencia declarada en el Hub es "other" (los artefactos son derivados RKNN, no pesos Apache 2.0 sin modificar), el número de descargas es muy bajo (39) y no se han publicado benchmarks ni idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Thinker-Talker (modelo multimodal Qwen2.5-Omni); artefactos convertidos a grafos RKNN |
| Parámetros totales | no disponible (el nombre indica 3B; no confirmado en la información) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos RKNN/RKLLM precompilados; tabla de embeddings en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | other (upstream Apache 2.0; los ficheros son derivados RKNN, ver LICENSE y NOTICE) |
| Formato de pesos | RKNN (`.rknn`), pesos binarios (`.weight`, `.embed.bin`), tokenizer GGUF (`.tokenizer.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Omni emplea una arquitectura Thinker-Talker orientada a percepción multimodal (texto, imagen, audio y vídeo) con generación de texto y habla en streaming. Esta distribución no incluye información sobre el entrenamiento del modelo original: no se detallan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

Lo relevante técnicamente es el proceso de conversión: los pesos originales se han transformado en grafos RKNN para la tarjeta RK182x junto con pesos emparejados, una tabla de embeddings en fp16 (593,5 MB), un tokenizer en formato GGUF (GPT-2 BPE + ByteLevel) y un filtro mel de 128 bandas (`mel_128_filters.txt`) para el frontend de audio. El paquete se integra mediante un manifiesto de worker que declara la variable de entorno `WDNAI_QWEN_2_5_OMNI_3B_DIR` y se detecta automáticamente por el backend de `wdnwebui` sin reinicio. Se incluye verificación de integridad mediante `SHA256SUMS`.

## Capacidades

- Conversación por audio: entrada de audio y salida de texto (`swcap_audio_chat`), con un límite declarado de 6 segundos por inferencia.
- Procesamiento de voz en el dispositivo: el frontend mel de 128 filtros sugiere extracción de características acústicas local.
- Generación de texto conversacional heredada del modelo base Qwen2.5-Omni.
- Integración con la interfaz `wdnwebui` mediante manifiesto de worker y detección automática en el gestor de cómputo.
- Ejecución en hardware Rockchip RK3588 con tarjeta RK182x; no requiere GPU.
- No se documentan en esta distribución: tool calling, function calling, agentes multi-paso, visión, vídeo, modo thinking ni capacidades multilingües explícitas.

## Casos de uso

- Asistentes de voz embebidos en placas RK3588: el paquete permite montar un chat de audio local sin GPU, con inferencias de hasta 6 segundos, adecuado para comandos y consultas breves en dispositivos empotrados.
- Interfaces de voz para electrónica de consumo: con ~2500 MB de memoria y 50 s de inicialización, encaja en dispositivos que arrancan una vez y mantienen el modelo residente para interacción conversacional.
- Prototipado de aplicaciones de audio en el edge: el manifiesto y la estructura de ficheros facilitan desplegar el modelo en `wdnwebui` y validar flujos de audio-a-texto antes de invertir en hardware mayor.
- Transcripción y respuesta hablada en entornos sin conectividad: al ejecutarse íntegramente en la tarjeta RK182x, no depende de servicios en la nube, útil en instalaciones aisladas.
- Kioscos y paneles interactivos: la combinación de audio de entrada y texto de salida permite construir interfaces de consulta por voz en terminales de bajo consumo.
- Docencia y experimentación con conversión de modelos: el repositorio sirve como ejemplo práctico de pipeline de conversión a RKNN/RKLLM con verificación SHA-256 y manifiesto de worker.
- Automatización industrial con voz: para instrucciones cortas y respuestas textuales en pantallas de control, siempre que se acepte el límite de 6 segundos por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma de destino: RK3588 como anfitrión con tarjeta de cómputo RK182x (1,82 TOPS).
- Memoria estimada: ~2500 MB según el manifiesto del worker.
- Tamaño total de pesos: 3,62 GB (repositorio de 3,9 GB).
- Tiempo de inicialización: ~50 segundos.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el paquete está compilado para RKNN y no se documenta ejecución en GPU.
- Despliegue: runtime RKLLM + RKNN a través de `wdnwebui`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; únicamente se declara el límite de 6 segundos por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wardner/Qwen2.5-Omni-3B | no disponible (nombre sugiere 3B) | no disponible | RKNN/RKLLM | other (upstream Apache 2.0) | 39 descargas, 0 likes |
| Qwen/Qwen2.5-Omni-3B | 3B (según nombre) | no disponible en la información | safetensors (formato estándar de Hugging Face) | Apache 2.0 | Repositorio oficial de Qwen |
| Alternativas de audio en edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo original `Qwen/Qwen2.5-Omni-3B`: misma base, pero los artefactos de `wardner` están limitados a audio-a-texto, atados al hardware RK182x y con una licencia derivada distinta. Para otros modelos comparables de la misma categoría no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Limitación funcional severa: solo se declara `swcap_audio_chat` (audio de entrada, texto de salida), con un máximo de 6 segundos por inferencia; no hay visión, vídeo ni salida de habla en esta distribución.
- Dependencia de hardware: los grafos RKNN están compilados para RK182x sobre RK3588; no son ejecutables en GPU convencionales ni en otros aceleradores.
- Licencia: el Hub declara "other"; los ficheros son derivados RKNN, no pesos Apache 2.0 sin modificar. Es necesario revisar LICENSE y NOTICE antes de uso comercial.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas de esta conversión.
- Madurez baja: 39 descargas y 0 likes; sin benchmarks ni validación comunitaria publicada.
- Integridad: es imprescindible verificar `SHA256SUMS` antes del despliegue; con `git clone` los pesos son punteros LFS hasta completar `git lfs pull`.
- Dependencia de la herramienta: el despliegue está acoplado a `wdnwebui` y a su manifiesto de worker.

## Enlaces

- Repositorio del paquete: https://huggingface.co/wardner/Qwen2.5-Omni-3B
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
