# YMQY-MY/dsh-qingsheng-voice-models

## Resumen

`YMQY-MY/dsh-qingsheng-voice-models` es un repositorio de modelos de voz en formato GGUF publicado por el usuario YMQY-MY como complemento del plugin `dsh-qingsheng-voice` para DeepSeek-Harness. No es un modelo entrenado por el autor: se trata de un espejo de distribución que empaqueta tres pesos de terceros (Breeze TTS 2, VoxCPM2 y SenseVoice Small) para ofrecer síntesis de voz (TTS) y reconocimiento de voz (ASR) en local, sin llamadas a API.

El repositorio está orientado a ejecución local en Windows x64 sobre GPUs con soporte Vulkan, con alternativa en CPU. El pipeline declarado es text-to-speech y el único idioma soportado es el chino (`zh`). El tamaño total del repo es de 0,3 GB en la metadata de Hugging Face, aunque la model card describe ficheros individuales de hasta 2,8 GB, lo que sugiere que las cifras de tamaño y de parámetros publicadas no reflejan el conjunto completo de pesos.

El dato de parámetros totales disponible (233.999.728, es decir, unos 234 M) corresponde a un único tensor en safetensors y no al conjunto de los tres modelos, por lo que no debe interpretarse como el tamaño del repositorio. La relevancia actual del proyecto es acotada: cubre un nicho concreto (voz local en chino dentro de un harness de desarrollo) y su licencia es "other", heredada de los proyectos upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tres modelos independientes: dos TTS y un ASR) |
| Parametros totales | 233.999.728 (dato de un tensor safetensors; no representa el conjunto del repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K (Breeze TTS 2), Q8_0 (VoxCPM2), Q8 (SenseVoice Small) |
| Idiomas soportados | chino (`zh`) |
| Licencia | other (sujeta a las licencias de los proyectos upstream) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: agrupa tres artefactos de inferencia en GGUF procedentes de proyectos de terceros. Según la model card, `breeze-tts-2-q4_k.gguf` (unos 2,4 GB) actúa como motor TTS principal recomendado, `voxcpm2-q8_0.gguf` (unos 2,8 GB) es un motor TTS alternativo y `sensevoice-small-q8-audiocpp-v1.gguf` (unos 242 MB) cubre el reconocimiento de voz para entrada por micrófono. No se documentan detalles de arquitectura interna, composición del dataset, número de tokens de entrenamiento ni si hubo ajuste por RLHF o DPO en ninguno de los tres componentes.

La innovación técnica del paquete no está en los modelos sino en el modo de despliegue: cuantización GGUF con backend Vulkan para ejecutar TTS y ASR en GPU local dentro del plugin `dsh-qingsheng-voice`, con el objetivo declarado de "cero consumo de API". La integración se realiza colocando los ficheros en el directorio `engine/models/` del espacio de trabajo de Qingsheng y reiniciando el harness, que levanta automáticamente el servicio de voz local.

## Capacidades

- Síntesis de voz (TTS) en chino mediante dos motores alternativos (Breeze TTS 2 y VoxCPM2).
- Reconocimiento automático de voz (ASR) en chino mediante SenseVoice Small, orientado a dictado y entrada por micrófono.
- Ejecución completamente local, sin dependencia de API externa.
- Aceleración por GPU vía Vulkan, con fallback a CPU (más lento).
- Integración con el plugin `dsh-qingsheng-voice`, que aporta lectura TTS, entrada de voz y un "estudio de timbres" (gestión de voces).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del ASR.
- Capacidad multilingüe: no disponible; el único idioma declarado es el chino.

## Casos de uso

- Lectura de respuestas en voz alta dentro de un harness de desarrollo: el plugin invoca `breeze-tts-2-q4_k.gguf` para convertir el texto generado por el modelo principal en audio local, evitando enviar contenido a servicios TTS en la nube.
- Dictado por voz en el editor o chat: `sensevoice-small-q8-audiocpp-v1.gguf` transcribe el micrófono en chino y lo inserta como texto, útil para sesiones largas de prompting sin teclado.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el audio y las transcripciones no salen de la máquina, lo que encaja en flujos con datos sensibles o sin conectividad.
- Pruebas de integración de voz en aplicaciones de escritorio Windows: sirve como banco de pruebas para validar pipelines TTS/ASR antes de contratar un servicio gestionado.
- Comparación de motores TTS: disponer de Breeze TTS 2 y VoxCPM2 en el mismo repo permite alternar y evaluar calidad y latencia con el mismo texto de entrada.
- Prototipado de asistentes conversacionales en chino: combinando ASR (entrada) y TTS (salida) se puede montar un bucle de voz completo sin infraestructura externa.
- Automatización de accesibilidad: lectura de documentos o registros en chino para usuarios con dificultades visuales en estaciones de trabajo con GPU Vulkan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los ficheros ocupan 2,4 GB (Breeze TTS 2 Q4_K), 2,8 GB (VoxCPM2 Q8_0) y 242 MB (SenseVoice Small Q8); la VRAM necesaria será igual o superior al tamaño del fichero cargado más overhead de runtime, pero no se documenta la cifra exacta.
- GPU recomendadas: no disponibles. El requisito declarado es una GPU con soporte Vulkan, preferiblemente dedicada.
- GPU de consumo: el proyecto está pensado para equipos de escritorio con GPU dedicada; no se especifican modelos concretos (RTX 4090, etc.).
- CPU: es posible ejecutar en CPU, pero la model card advierte que la velocidad será notablemente menor.
- Sistema operativo: Windows x64.
- Opciones de despliegue: el plugin `dsh-qingsheng-voice` sobre DeepSeek-Harness con backend Vulkan; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| dsh-qingsheng-voice-models (este repo) | TTS + ASR (paquete) | no disponible por componente | no disponible | zh | other | GGUF |
| Breeze TTS 2 (upstream) | TTS | no disponible | no disponible | zh | no disponible | original; aquí GGUF Q4_K |
| VoxCPM2 (upstream) | TTS | no disponible | no disponible | zh | no disponible | original; aquí GGUF Q8_0 |
| SenseVoice Small (upstream) | ASR | no disponible | no disponible | zh (aquí) | no disponible | original; aquí GGUF Q8 |

No se dispone de datos de rendimiento ni de licencias detalladas de los proyectos upstream en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El repositorio es un espejo de pesos de terceros; el autor no reclama propiedad y remitirá a las licencias de Breeze TTS 2, VoxCPM2 y SenseVoice Small, que no se detallan en la model card.
- La licencia "other" impide asumir uso comercial sin verificar antes los términos de cada proyecto upstream.
- Solo se declara soporte de chino (`zh`); no hay evidencia de calidad en castellano ni en otros idiomas.
- Plataforma limitada a Windows x64 con Vulkan; no se documenta soporte Linux, macOS ni CUDA.
- El dato de parámetros (234 M) procede de un único tensor safetensors y no representa el conjunto de los tres modelos; no debe usarse para estimar requisitos de memoria.
- El tamaño del repo en Hugging Face (0,3 GB) contradice los tamaños de fichero descritos en la model card (hasta 2,8 GB); conviene verificar los artefactos reales antes de desplegar.
- Sin descargas ni likes en el momento de la consulta y con fecha de creación futura en la metadata, lo que indica un proyecto muy reciente y sin validación comunitaria.
- Riesgo de alucinación y sesgos: no evaluado ni documentado para ninguno de los tres componentes.
- No se documentan límites de longitud de audio o de texto para TTS/ASR, ni métricas de calidad (MOS, WER).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YMQY-MY/dsh-qingsheng-voice-models
- Código del plugin: https://github.com/YMQY-MY/dsh-qingsheng-voice
- Declaración de componentes de terceros: NOTICE.md en el repositorio del plugin
- Breeze TTS 2 (proyecto upstream): no disponible
- VoxCPM2 (proyecto upstream): no disponible
- SenseVoice Small (proyecto upstream): no disponible
