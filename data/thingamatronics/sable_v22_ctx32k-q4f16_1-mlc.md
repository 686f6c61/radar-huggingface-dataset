# Thingamatronics/Sable_v22_ctx32k-q4f16_1-MLC

## Resumen

Sable_v22_ctx32k-q4f16_1-MLC es un conjunto de pesos cuantizados y compilados con MLC-LLM para su ejecución en navegador mediante WebLLM y WebGPU. No se trata de un modelo entrenado desde cero, sino de una adaptación de Qwen/Qwen2.5-1.5B-Instruct (licencia Apache-2.0) afinada por Sticky Bit Games para interpretar a un personaje concreto, "Dr. Sable", dentro del videojuego *Doctor Sable* publicado por Thingamatronics LLC. El repositorio contiene únicamente los pesos: la lógica de juego y la verdad del estado de la partida residen en el motor del juego, no en el modelo.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de despliegue de un LLM de 1.500 millones de parámetros completamente en el cliente (navegador de escritorio), sin envío de datos a servidor, lo que resulta interesante para desarrolladores que evalúan inferencia local en WebGPU. Por otro lado, sirve de advertencia: el modelo está especializado en un personaje y un contexto de juego, por lo que su uso como asistente general no está previsto ni validado por el autor.

El contexto declarado es de 32.768 tokens y el peso de descarga ronda los 880 MB, con un consumo estimado de memoria de GPU de aproximadamente 3,3 GB en f32 y 2,5 GB en f16. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); pesos compilados con MLC-LLM |
| Parametros totales | 1.500 millones (aproximado, segun el modelo base Qwen2.5-1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | q4f16_1-MLC (compilacion MLC; pesos de 4 bits con activaciones f16) |
| Idiomas soportados | No disponible (la model card no los especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compilados para MLC-LLM (artefacto MLC, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal estándar, diseñado por el equipo Qwen de Alibaba. Sobre esa base, Sticky Bit Games realizó un ajuste fino orientado a un único personaje de juego, "Dr. Sable". No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO en esa fase específica; la model card no los detalla.

La innovación técnica relevante no está en el entrenamiento sino en el empaquetado: los pesos se han compilado con MLC-LLM en el formato q4f16_1-MLC, lo que permite ejecutarlos en el navegador a través de WebLLM sobre WebGPU. Esto implica una cuantización de pesos a 4 bits con activaciones en f16, y un grafo de ejecución optimizado para el runtime de MLC. El resultado es un artefacto de aproximadamente 880 MB que se descarga en tiempo de ejecución y se ejecuta íntegramente en el cliente, sin llamadas a servidor.

## Capacidades

- Generación de texto conversacional en el rol del personaje "Dr. Sable", limitada al contexto narrativo del juego *Doctor Sable*.
- Conversación multi-turno dentro de la ventana de 32.768 tokens, suficiente para sesiones de juego prolongadas.
- Ejecución local en navegador de escritorio mediante WebGPU, sin envío de datos a servidores.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (comprensión de lenguaje, generación de texto, cierta capacidad de razonamiento y código), aunque no validadas ni garantizadas tras el ajuste fino del personaje.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Integración en el videojuego *Doctor Sable*: el modelo se carga en el navegador del jugador y genera los diálogos del personaje en tiempo real, con el motor del juego como fuente de verdad del estado de la partida.
- Demostración técnica de inferencia LLM en cliente: sirve como referencia para desarrolladores que quieran evaluar WebLLM y WebGPU con un modelo de 1,5B cuantizado a 4 bits y un consumo de VRAM de 2,5-3,3 GB.
- Prototipado de NPCs conversacionales en juegos web: el patrón de pesos MLC + WebLLM permite experimentar con personajes sin infraestructura de servidor, aunque para producción habría que reentrenar o adaptar el modelo al personaje propio.
- Estudio de cuantización q4f16_1-MLC: útil para medir latencia, throughput y calidad de un modelo de 1,5B en GPU de escritorio con WebGPU frente a otras cuantizaciones.
- Docencia y divulgación: ejemplo didáctico de pipeline completo (modelo base open source, ajuste fino de personaje, compilación MLC, despliegue en navegador).
- Pruebas de privacidad por diseño: escenario en el que ningún dato de conversación sale del dispositivo del usuario, relevante para demos que manejen información sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB en f32 y 2,5 GB en f16, según la model card.
- GPU recomendadas: cualquier GPU de escritorio o portátil compatible con WebGPU (la model card no especifica modelos concretos).
- Compatibilidad con GPU de consumo: sí, siempre que la GPU soporte WebGPU; el modelo está pensado para equipos de escritorio y portátiles, no para móviles ni tablets.
- Restricción explícita: teléfonos y tablets no pueden ejecutarlo.
- Opciones de despliegue: WebLLM sobre WebGPU en navegador; el artefacto es específico de MLC-LLM y no está pensado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Sable_v22_ctx32k-q4f16_1-MLC | ~1,5B | 32.768 | MLC-LLM / WebLLM (navegador) | Apache-2.0 | Ajustado a un personaje de juego; pesos solo para el demo |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 (según modelo base) | Safetensors, GGUF, etc. | Apache-2.0 | Modelo base generalista; no especializado en personaje |
| Otros modelos MLC para WebLLM de tamaño similar | ~1-2B | Variable | MLC-LLM / WebLLM | Variable | No disponible comparativa concreta en la información proporcionada |

## Limitaciones y advertencias

- El modelo no es un asistente de propósito general: está ajustado para interpretar un personaje dentro de un juego concreto y el motor del juego decide qué es verdad en cada partida.
- Riesgo de alucinación elevado fuera del contexto del juego; no debe usarse como fuente de información factual.
- No se documentan los idiomas soportados tras el ajuste fino; el modelo base Qwen2.5 es multilingüe, pero el ajuste de personaje puede haber reducido esa cobertura.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen2.5-1.5B-Instruct, no evaluados aquí.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que estos pesos son solo para el demo y no están validados para otros fines.
- Requiere GPU de escritorio o portátil con WebGPU; no funciona en móviles ni tablets.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (1 de noviembre de 2026); no hay evidencia de uso en producción fuera del juego.
- El formato MLC-LLM limita la portabilidad: no es directamente utilizable en runtimes estándar como llama.cpp, vLLM u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thingamatronics/Sable_v22_ctx32k-q4f16_1-MLC
- Demo del juego: https://stickybitgames.itch.io/doctor-sable
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
