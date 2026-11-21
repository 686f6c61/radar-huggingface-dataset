# warten/Haru-4B

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo, full-duplex y multilingüe, desarrollado por warten (con código y documentación asociados al proyecto higurashi-ai). Su particularidad es que escucha y habla simultáneamente, como en una llamada telefónica: cada 133 ms procesa un frame de audio del usuario y emite un frame de su propio audio y texto, sin esperar turnos. Está pensado como modelo base preentrenado para investigación, no como asistente conversacional afinado para instrucciones.

Técnicamente combina un backbone de lenguaje Qwen3.5-4B (32 capas, dimensión oculta 2560) con un códec de audio causal de VibeVoice a 24 kHz y una cabeza MLP de 4 capas con muestreo MeanFlow que genera el latente de audio en un solo paso. No emplea tokens de audio discretos ni un transformer de audio separado: el audio del usuario, el audio del modelo y el texto del modelo se suman en una única posición del modelo de lenguaje, a una tasa de 7,5 Hz.

El modelo tiene 5.270.000.897 parámetros en bfloat16 y se distribuye bajo licencia Apache 2.0 en safetensors. Cubre nueve idiomas (inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano) y permite controlar el personaje mediante una tarjeta de texto y la voz mediante un clip de referencia. Es relevante porque aborda el diálogo hablado de baja latencia con una arquitectura nativa full-duplex, un enfoque poco común frente a los pipelines cascados de ASR, LLM y TTS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje Qwen3.5-4B (32 capas, hidden 2560) + códec de audio causal VibeVoice (24 kHz) + cabeza MLP de 4 capas con MeanFlow; full-duplex a 7,5 Hz |
| Parámetros totales | 5.270.000.897 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de lenguaje (Qwen3.5-4B, 32 capas, hidden size 2560) adaptado a modalidad de audio. En cada frame de 133 ms (7,5 Hz) el latente de audio del usuario, el token de texto previo del modelo y el latente de audio previo del modelo se suman en una sola posición del modelo de lenguaje; la salida predice el siguiente token de texto y el siguiente latente de audio. El audio se representa como un latente de 64 dimensiones por frame, generado por una cabeza MLP de 4 capas con muestreo MeanFlow en un único paso (guidance scale entre 1 y 2, por defecto 1,5). El códec es el tokenizador acústico causal de VibeVoice, a 24 kHz y 3200 muestras por latente. No hay transformer de audio independiente ni tokens de audio discretos.

El modelo se presenta como base preentrenada para investigación. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación destacable es el diseño full-duplex nativo: escucha y habla no se bloquean mutuamente, y la generación de audio se resuelve en un solo paso de muestreo, lo que reduce la latencia frente a esquemas de difusión multi-paso. El control de personaje se realiza mediante una tarjeta de sistema con formato fijo y el control de voz mediante un clip de referencia de un solo hablante (entre 3 segundos y 3 minutos).

## Capacidades

- Diálogo hablado full-duplex: escucha y emite audio de forma simultánea a 7,5 Hz, sin turnos estrictos.
- Generación conjunta de audio y texto por frame (133 ms), con latentes de audio de 64 dimensiones.
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Control de personaje mediante tarjeta de texto en el system prompt.
- Clonación e imitación de voz a partir de un clip de referencia (3 s a 3 min, un solo hablante, habla limpia).
- Generación de audio en un solo paso de muestreo mediante cabeza MeanFlow.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No se documenta capacidad de visión ni de audio más allá del diálogo hablado.

## Casos de uso

- Investigación en diálogo hablado full-duplex: sirve como base para estudiar interacción simultánea de escucha y habla, midiendo latencia y solapamiento de turnos con el código de referencia.
- Prototipos de agentes de voz de baja latencia: el diseño a 7,5 Hz y la generación de audio en un paso permiten construir demos interactivas con latencia reducida usando el servidor incluido.
- Atención al cliente con voz sintética personalizada: la combinación de tarjeta de personaje y clip de referencia permite definir tono y voz concretos para un caso de uso, siempre con voces sobre las que se tenga derecho de uso.
- Aplicaciones de compañía conversacional o personajes interactivos: el control de personaje por tarjeta de texto facilita mantener una identidad estable durante la conversación.
- Evaluación multilingüe de diálogo hablado: al cubrir nueve idiomas, puede emplearse para comparar calidad de conversación y naturalidad entre lenguas en entornos de investigación.
- Integración en aplicaciones macOS nativas: la implementación MLX con app nativa permite probar el modelo en local sobre hardware Apple.
- Despliegue en servidores con vLLM-Omni: el plugin disponible facilita servir el modelo en infraestructura con GPU para experimentación a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB de memoria en GPU NVIDIA según la model card (pesos en bfloat16 de 5.270.000.897 parámetros, más overhead del códec y del runtime).
- GPU recomendadas: no se especifican modelos concretos; la referencia del autor es una GPU NVIDIA con unos 12 GB de memoria.
- ¿Cabe en GPU de consumo? No se confirma explícitamente; por el requisito de ~12 GB, quedaría al límite en tarjetas de 12 GB y holgado en modelos de 16 GB o más, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: servidor propio del repositorio (`python -m haru.server`), implementación MLX con app nativa para macOS y plugin para vLLM-Omni.
- Latencia y throughput: no se publican cifras de throughput; la model card advierte que los dispositivos Bluetooth añaden 100 ms o más de latencia y recomienda auriculares y micrófono con cable.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de diálogo hablado full-duplex con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: mantiene conversaciones naturales, pero no es una fuente fiable de hechos ni sigue instrucciones como un asistente afinado.
- Riesgo de alucinación en el contenido textual y de respuestas factualmente incorrectas.
- Puede imitar la voz de un clip de referencia; solo deben usarse voces sobre las que se tenga derecho de uso.
- No se documentan sesgos conocidos ni evaluación de seguridad en la información disponible.
- No se especifica la longitud de contexto, lo que limita la planificación de conversaciones largas.
- El rendimiento por idioma no está cuantificado; el soporte multilingüe se declara sin métricas.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el estado de modelo base y la ausencia de evaluación de seguridad desaconsejan su uso directo en producción sin trabajo adicional.
- La latencia depende del hardware de audio: los dispositivos Bluetooth añaden 100 ms o más.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/warten/Haru-4B
- Código: https://github.com/higurashi-ai/Haru
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Blog técnico en japonés: https://blog.higurashi.ai/melte/haru4b-ja/
