# textilelabs/Loom-Spark-1.8-Flash

## Resumen

Loom Spark 1.8 Flash es un modelo de lenguaje tiny de 2,62 millones de parámetros desarrollado por Textile Labs, entrenado desde cero sobre una arquitectura tipo GPT-2. Forma parte de la familia Loom Spark, donde "Flash" designa una variante más pequeña y rápida, no una destilación del modelo numerado. Este modelo se posiciona como un experimento para explorar los límites del tamaño mínimo viable en tareas de generación de texto con soporte de herramientas y agentes.

Su principal innovación técnica consiste en un currículo de entrenamiento que inserta el token de fin de secuencia (`<|endoftext|>`) después de cada turno de conversación, lo que elimina el problema de auto-diálogo que afectaba a versiones anteriores. Verificado con 442.333 turnos, el modelo termina sus respuestas de forma fiable sin configuración adicional en entornos como Ollama. Con solo 2,62M de parámetros y entrenado en CPU, resulta relevante para investigación en eficiencia, prototipado rápido y entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder causal) |
| Parametros totales | 2.615.424 (2,62M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 (GGUF), safetensors (precision no especificada) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder causal de 4 capas, 4 cabezas de atencion y dimensiones ocultas de 192, con un vocabulario BPE propio de 4096 tokens (compartido con Loom Spark 1.5 Flash, pero no con las generaciones full-size). Se entrenó desde cero sobre un corpus de 70MB de currículo propio, con 2.666 pasos y un batch de 32 × 256 tokens, en una CPU Dell OptiPlex 9020 (i5-4690, 4 núcleos, sin GPU). La innovación clave es que el token `<|endoftext|>` se inserta tras cada turno del modelo, no solo al final del documento, lo que permite que el modelo aprenda a detenerse de forma autónoma. La pérdida final de validación fue de 0,3332.

## Capacidades

- Generación de texto autoregresiva con formato de prompt específico (`<tools:off>` o `<tools:on>`).
- Soporte de tool use mediante la sintaxis `<lookup>query</lookup>` para búsquedas externas, integrable en un harness de agente con búsqueda web.
- Auto-terminación de turnos: el modelo emite `<|endoftext|>` al final de cada respuesta, evitando auto-diálogo incluso con configuración cero en Ollama.
- Mantenimiento de identidad y registro emocional: 0/12 sondas de identidad filtradas, comparable a modelos full-size.
- Capacidad de razonamiento básico y respuesta a preguntas simples, aunque limitada por su tamaño.
- Multilingüe: no, solo inglés.

## Casos de uso

- Prototipado de agentes conversacionales: gracias a su auto-terminación fiable y soporte de tool use, permite construir demos de agentes con búsqueda web en minutos, sin necesidad de configurar stop tokens manualmente.
- Experimentación educativa: su tamaño reducido y entrenamiento en CPU lo hacen ideal para estudiar el comportamiento de modelos pequeños, la influencia del currículo en la generación y la dinámica de auto-terminación.
- Pruebas de harness de herramientas: el agente harness incluido (v0.2.2) permite validar flujos de tool calling y splicing de resultados en entornos de desarrollo.
- Generación de texto con restricciones de hardware: puede ejecutarse en dispositivos sin GPU, como Raspberry Pi o máquinas virtuales pequeñas, para tareas de generación de texto simples.
- Investigación sobre eficiencia de parámetros: al comparar con 1.5 Flash (1,35M) y 1.8 full-size (18,85M), sirve para analizar el impacto del escalado de capacidad en métricas de validación y comportamiento.
- Demostraciones de "humble AI": su filosofía de diseño (identidad, moderación, registro emocional) lo hace útil para explorar interacciones donde se prioriza la contención sobre la precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta métricas propias de validación comparadas con Loom Spark 1.5 Flash:

| Metrica | 1.5 Flash | 1.8 Flash |
|---|---|---|
| Parametros | 1,35M | 2,62M |
| Val loss | 0,3544 | 0,3332 |
| Identity probes leaking | 0/12 | 0/12 |
| Offline fact leak (raw model) | 18/30 | 15/30 |
| Clean online lookups | 5/10 | 6/10 |
| Self-terminates, zero config | si | si |

## Requisitos de hardware

- Inferencia en CPU: el modelo se entrenó en una CPU de 4 núcleos, por lo que la inferencia es viable en cualquier CPU moderna sin GPU.
- VRAM estimada: inferior a 1 GB en cuantizacion f32; con cuantizaciones menores (no proporcionadas) sería aún menor.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de VRAM es suficiente si se desea aceleración.
- Compatible con hardware de consumo: sí, incluyendo Raspberry Pi 4/5, portátiles antiguos y entornos embebidos.
- Opciones de despliegue: transformers (Python), Ollama (con o sin Modelfile), llama.cpp (GGUF), y compatible con text-generation-inference (endpoints_compatible).
- Latencia y throughput: no disponible; al ser un modelo de 2,62M de parámetros, se espera una generación muy rápida incluso en CPU, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Val loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Spark 1.8 Flash | 2,62M | no disponible | 0,3332 | MIT | HuggingFace |
| Loom Spark 1.5 Flash | 1,35M | no disponible | 0,3544 | MIT | HuggingFace |
| Loom Spark 1.8 (full-size) | 18,85M | no disponible | no disponible | MIT | HuggingFace |

La comparativa se limita a la familia Loom Spark, ya que no se dispone de datos de otros modelos tiny comparables en la informacion proporcionada. El full-size 1.8 tiene aproximadamente 7 veces más parámetros, pero no se reportan sus métricas de validación en esta ficha.

## Limitaciones y advertencias

- Modelo extremadamente pequeño: respuestas incorrectas o confusas en la mayoría de preguntas factuales; no apto para tareas que requieran conocimiento enciclopédico.
- Riesgo de alucinación elevado: al carecer de un núcleo factual sólido, puede inventar información con alta fluidez.
- Solo inglés: no soporta otros idiomas.
- Longitud de contexto no documentada: se desconoce el límite exacto de tokens de entrada; se recomienda mantener prompts cortos.
- Sin cuantizaciones de baja precisión publicadas: solo se ofrece f32 en GGUF, lo que limita la optimización en memoria.
- Uso en producción desaconsejado: es un modelo experimental pensado para investigación y prototipado, no para cargas de trabajo reales.
- Dependencia del formato de prompt: requiere el formato exacto (`<tools:off>` o `<tools:on>`, `<user>`, `<loom>`) para un comportamiento correcto; desviaciones pueden degradar la salida.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/textilelabs/Loom-Spark-1.8-Flash)
- [Loom Spark 1.8 (full-size)](https://huggingface.co/textilelabs/Loom-Spark-1.8)
- [Loom Spark 1.5 Flash](https://huggingface.co/textilelabs/Loom-Spark-1.5-Flash)
- [Loom-Spark API e Inference Endpoint (FriendliAI)](https://friendli.ai/models/textilelabs/Loom-Spark)
- [LLM Leaderboard & AI Model Benchmarks (agosto 2026)](https://benchlm.ai/)
