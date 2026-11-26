# WeeAIResearch/Phoenix-Inkling-14.6B-A3.5B-5G

## Resumen

Phoenix-Inkling-14.6B-A3.5B-5G es una compilación compacta en formato GGUF del modelo Inkling 2 Mini de Thinking Machines Lab, distribuida por WeeAIResearch. Se trata de un derivado modificado del cuantizado `UD-IQ2_XXS` publicado por Unsloth, sobre el que se han aplicado técnicas de poda (pruning) de canales en las proyecciones de los expertos y compresión de los bancos de expertos en 15 de las 24 capas físicas del modelo. El resultado es un checkpoint de 14.590.057.240 parámetros almacenados con un tamaño de fichero GGUF de 4.998.672.960 bytes (aproximadamente 5 GB), lo que lo hace desplegable en hardware de consumo.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) y capas recurrentes (looped layers) que reutilizan sus pesos en cada pasada. El checkpoint conserva 2.060 expertos y enruta ocho selecciones por visita de capa, con un estimado de 3,52 mil millones de parámetros activos por token. Está pensado exclusivamente para generación de texto conversacional en inglés, sin proyector de visión.

Su relevancia radica en que demuestra una vía de compresión agresiva sobre un MoE ya cuantizado a 2 bits, manteniendo un comportamiento conversacional estable en pruebas locales (15 turnos sin bucles de tokens de control). No obstante, el propio autor advierte de errores factuales y de seguimiento de instrucciones, y el soporte en llama.cpp requiere un parche de compatibilidad específico, no verificado sobre la versión estándar del runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (looped layers) |
| Parámetros totales | 14.590.057.240 (14,59B almacenados) |
| Parámetros activos | 3,52B estimados por token |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantización | GGUF derivado de `UD-IQ2_XXS` (Unsloth); bancos de expertos compactos con anchos variables |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (pesos); parche de runtime bajo MIT |
| Formato de pesos | GGUF (4.998.672.960 bytes; SHA-256 `e6278977a5f94579db3cb606c3cf08857a0bcd917c3eec2b9c95d294fea3af48`) |

## Arquitectura y entrenamiento

El modelo original, Inkling 2 Mini de Thinking Machines Lab, es un transformer con mezcla de expertos y capas recurrentes: las capas en bucle reutilizan los mismos pesos en cada pasada, lo que reduce el recuento efectivo de parámetros únicos frente al almacenado. Phoenix actúa sobre esta base aplicando poda de canales de baja impacto en las proyecciones de los expertos de 15 de las 24 capas físicas, y comprimiendo los bancos de expertos. Se conservan 2.060 expertos con índices de router completos y anchos de experto variables, y el enrutamiento selecciona ocho expertos por visita de capa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La estimación de 3,52B parámetros activos incluye pesos compartidos como la cabeza de salida y excluye la tabla de embeddings de entrada completa; las pasadas repetidas por las capas en bucle reutilizan los mismos parámetros. La innovación técnica destacable del release es precisamente el esquema de poda y compresión sobre un cuantizado de 2 bits, junto con el parche de compatibilidad para llama.cpp que permite interpretar el layout GGUF con bancos de experto compactos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento básico y seguimiento de contexto conversacional (recall de nombres, seguimiento de cambios en una agenda, continuación de relatos).
- Ejecución en local mediante llama.cpp con endpoint compatible con la API de chat de OpenAI.
- Soporte de plantilla Jinja (`--jinja`) para formateo de chat.
- Parámetro de esfuerzo de razonamiento (`reasoning effort`) configurable, usado como `none` en las pruebas del autor.
- Sin capacidades de visión: el release no incluye proyector visual.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades multimodales de audio ni de agente multi-paso.

## Casos de uso

- Asistente conversacional local en inglés: el modelo mantiene conversaciones multi-turno con coherencia aceptable en pruebas de 15 turnos, adecuado para prototipos en estaciones de trabajo sin GPU dedicada gracias a sus ~5 GB de pesos.
- Pruebas de concepto de MoE podado: útil para investigadores que quieran estudiar el impacto de la poda de canales y la compresión de bancos de expertos sobre un modelo ya cuantizado a 2 bits.
- Despliegue en Apple Silicon: el release fue evaluado con Metal, por lo que encaja en flujos de trabajo sobre Mac con llama.cpp y el parche incluido.
- Generación de texto creativo breve: continuación de relatos e historias en inglés, una de las tareas verificadas por el autor en las pruebas de humo.
- Experimentación con runtimes: sirve como banco de pruebas para el parche de compatibilidad de llama.cpp sobre layouts GGUF no estándar (expertos de ancho variable).
- Evaluación de robustez y alucinación: dado que el autor documenta errores factuales y de formato, es útil como caso de estudio negativo en pipelines de evaluación de fiabilidad.
- Chat de bajo coste en entornos con restricciones de memoria: con ~5 GB de fichero y 3,52B parámetros activos, puede ejecutarse en GPUs de consumo con VRAM moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pruebas de humo locales:

| Prueba | Resultado |
|---|---|
| Turnos de chat completados sin bucles ni gibberish | 15 |
| Test estricto de respuesta corta (8 preguntas) | 0 de 8 correctas y en el formato pedido |
| Decodificación Metal (64 tokens) | 32,3 tokens/s |
| Tamaño GGUF | 4.998.672.960 bytes |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB para los pesos en el formato GGUF publicado, más overhead de contexto (el ejemplo usa 4096 tokens de contexto y `-ngl 99`).
- GPU recomendadas: no se especifican modelos concretos; el autor evaluó en Apple Silicon con Metal. Por tamaño, cabe en GPUs de consumo con 6-8 GB de VRAM o más.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque no se documenta una lista verificada.
- Opciones de despliegue: llama.cpp con el parche `runtime/phoenix-inkling.patch` aplicado sobre la revisión fijada `33aeb17f85869279e3821f746bc645357139bc2c` y compilación de `llama-server`. El soporte en la versión estándar de llama.cpp no está verificado. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: 32,3 tokens/s medidos en decodificación de 64 tokens con Metal. No hay datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phoenix-Inkling-14.6B-A3.5B-5G | 14,59B almacenados / 3,52B activos | No disponible | Apache 2.0 | GGUF (~5 GB) | Derivado podado de Inkling 2 Mini; requiere parche de llama.cpp |
| Inkling 2 Mini (thinkingmachines) | No disponible en la información | No disponible | No disponible en la información | No disponible en la información | Modelo base original |
| Inkling-2-Mini UD-IQ2_XXS (Unsloth) | No disponible en la información | No disponible | No disponible en la información | GGUF | Cuantizado de origen sobre el que se construye Phoenix |

No se dispone de datos suficientes sobre los modelos comparables para contrastar rendimiento, contexto o disponibilidad más allá de lo indicado.

## Limitaciones y advertencias

- El autor documenta errores factuales y de seguimiento de instrucciones en las pruebas de humo.
- En un test estricto de respuesta corta, el modelo acertó 0 de 8 respuestas en contenido y formato.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Sin visión: no incluye proyector visual.
- Requiere un parche de compatibilidad específico para llama.cpp; el soporte en la versión estándar del runtime no está verificado, lo que complica el despliegue en producción.
- El modelo está derivado de un cuantizado de 2 bits (`UD-IQ2_XXS`), lo que puede degradar la calidad frente al modelo base en precisión completa.
- La poda de canales y la compresión de expertos son modificaciones agresivas que pueden introducir sesgos o pérdida de capacidades no evaluadas.
- Licencia Apache 2.0 para los pesos, lo que permite uso comercial, pero el parche de runtime se distribuye bajo MIT y el modelo base puede tener condiciones adicionales no detalladas en la información disponible.
- Riesgo de alucinación relevante dado el tamaño reducido y la cuantización agresiva; no recomendado para tareas de alta precisión sin validación externa.
- No hay datos publicados de benchmarks estándar que permitan evaluar su calidad frente a alternativas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/WeeAIResearch/Phoenix-Inkling-14.6B-A3.5B-5G)
- [GGUF directo](https://huggingface.co/WeeAIResearch/Phoenix-Inkling-14.6B-A3.5B-5G/resolve/main/Phoenix-Inkling-14.6B-A3.5B-5G.gguf)
- [Modelo base original (Thinking Machines Lab)](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [GGUF de origen de Unsloth](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-UD-IQ2_XXS.gguf)
- [Repositorio de llama.cpp](https://github.com/ggml-org/llama.cpp)
