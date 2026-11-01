# Thingamatronics/Sable_v22_ctx32k-q4f32_1-MLC

## Resumen

Sable_v22_ctx32k-q4f32_1-MLC es un conjunto de pesos cuantizados y compilados con MLC-LLM del modelo Qwen2.5-1.5B-Instruct, publicado por Thingamatronics (Sticky Bit Games) para su uso en WebLLM dentro de un navegador con WebGPU. No se trata de un modelo de propósito general, sino de un artefacto de despliegue: el modelo base se ha ajustado finamente para interpretar a un personaje concreto ("Dr. Sable") dentro de una demo jugable, y los pesos que aquí se distribuyen están empaquetados en el formato que MLC genera para ejecución en el cliente.

El interés técnico del repositorio es fundamentalmente de infraestructura: demuestra cómo llevar un transformer de 1.500 millones de parámetros a un navegador de escritorio con una ventana de contexto de 32.768 tokens y un consumo de memoria de GPU de aproximadamente 3,3 GB en f32 y 2,5 GB en f16. La cuantización `q4f32_1-MLC` es la nomenclatura propia de MLC para pesos de 4 bits con escalas en punto flotante, y el repositorio ocupa unos 0,9 GB.

Es relevante ahora porque ejemplifica una tendencia práctica: distribuir modelos pequeños cuantizados como activos estáticos de una aplicación web, sin servidor de inferencia, con la privacidad y la latencia que eso conlleva. Conviene subrayar que el repositorio contiene únicamente los pesos: no es un asistente general y su comportamiento está acotado por el motor del juego que lo invoca.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); pesos compilados con MLC-LLM |
| Parámetros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | `q4f32_1-MLC` (pesos de 4 bits con escalas en punto flotante, según MLC); el modelo base admite otras cuantizaciones no incluidas en este repo |
| Idiomas soportados | No disponible en la información proporcionada (heredados del modelo base Qwen2.5, no documentados en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compilados para MLC-LLM (consumidos por WebLLM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y las innovaciones estándar de la familia Qwen2.5. Sobre esa base, el autor ha aplicado un ajuste fino orientado a un personaje concreto dentro de una demo interactiva. No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en el ajuste específico de este modelo.

La innovación destacable no está en el entrenamiento sino en el pipeline de despliegue: los pesos se han compilado con MLC-LLM para ejecutarse en WebGPU mediante WebLLM, lo que implica una planificación de memoria estática, kernels específicos por backend y una cuantización de 4 bits con escalas en coma flotante. El resultado es un artefacto de unos 880 MB de descarga que se carga en el navegador y se ejecuta íntegramente en el cliente, sin llamadas a un servidor de inferencia.

## Capacidades

- Generación de texto conversacional en el rol del personaje "Dr. Sable", acotada por el motor del juego.
- Ventana de contexto de 32.768 tokens, adecuada para mantener el estado de una partida y el historial de diálogo.
- Ejecución íntegra en el navegador sobre WebGPU, sin envío de datos a servidores.
- Herencia de las capacidades del modelo base Qwen2.5-1.5B-Instruct (razonamiento básico, código y matemáticas elementales), si bien el ajuste fino de personaje puede degradarlas.
- Soporte de tool calling y function calling: no documentado en la información proporcionada para este artefacto.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es la interpretación de un personaje en una demo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Demo jugable en navegador: cargar los pesos con WebLLM y ejecutar el diálogo del personaje en el cliente, aprovechando que no hay servidor ni coste de inferencia por petición.
- Prototipado de NPCs con diálogo generativo: usar el artefacto como referencia para medir latencia y consumo de memoria de un modelo de 1,5B cuantizado a 4 bits en GPUs de escritorio.
- Evaluación de WebGPU como plataforma de inferencia: comparar el rendimiento de `q4f32_1-MLC` frente a otras cuantizaciones del mismo modelo base en el mismo hardware.
- Aplicaciones web offline-first: integrar el modelo en una PWA donde la conversación deba funcionar sin conexión y sin exponer datos del usuario.
- Docencia y divulgación: mostrar de forma tangible el ciclo completo de compilación MLC, cuantización y ejecución en navegador con un modelo pequeño y una licencia permisiva.
- Base para ajustes finos de personaje: partir de Qwen2.5-1.5B-Instruct, ajustar el rol deseado y recompilar con MLC para distribuirlo como activo estático de una aplicación web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de despliegue: descarga de aproximadamente 880 MB, consumo de GPU de aproximadamente 3,3 GB en f32 y 2,5 GB en f16, y una ventana de contexto de 32.768 tokens.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,3 GB en f32 y 2,5 GB en f16, según la model card.
- GPU recomendadas: no se especifican modelos concretos; se requiere una GPU de escritorio o portátil compatible con WebGPU.
- GPU de consumo: el modelo está pensado para GPUs de escritorio y portátiles con WebGPU; no se documenta compatibilidad con modelos concretos como RTX 4090 o similares.
- Dispositivos no soportados: teléfonos y tabletas no pueden ejecutarlo, según la model card.
- Opciones de despliegue: WebLLM sobre WebGPU (vía MLC-LLM); no se documentan otros runtimes para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sable_v22_ctx32k-q4f32_1-MLC | 1,5B | 32.768 | Pesos MLC para WebLLM/WebGPU | Apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (según modelo base) | Safetensors, GGUF y otras cuantizaciones de la comunidad | Apache-2.0 | HuggingFace |
| Alternativas de 1-2B para navegador (p. ej. compilaciones MLC de Llama 3.2 1B o Gemma 2 2B) | 1-2B | Variable según modelo | Pesos MLC para WebLLM | Licencias variables (Llama, Gemma) | HuggingFace |

La comparación directa con otras compilaciones MLC de la misma familia no está disponible en la información proporcionada; los datos de la fila de alternativas son orientativos y deben verificarse en cada repositorio.

## Limitaciones y advertencias

- No es un asistente de propósito general: está ajustado para un personaje y un juego concretos, y el motor del juego, no el modelo, determina qué es verdad en una partida.
- El repositorio contiene solo los pesos; no incluye código de inferencia ni instrucciones de uso más allá de la integración con WebLLM.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del modelo base Qwen2.5-1.5B-Instruct.
- Riesgo de alucinación: presente como en cualquier modelo generativo de este tamaño, agravado por el ajuste de personaje.
- Limitaciones de contexto o idioma: la ventana es de 32.768 tokens, pero no se documentan los idiomas soportados tras el ajuste fino.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base y de los pesos compilados.
- Requisito de plataforma: solo funciona en navegadores con WebGPU sobre GPU de escritorio o portátil; no hay soporte para móviles ni tabletas.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Thingamatronics/Sable_v22_ctx32k-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Demo jugable: https://stickybitgames.itch.io/doctor-sable
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
