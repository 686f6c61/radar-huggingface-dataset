# urakozz/Nanbeige4.3-33B-W4A16-g64-AutoRound-GPTQ

## Resumen

Nanbeige4.3-33B-W4A16-g64-AutoRound-GPTQ es una versión cuantizada a 4 bits del modelo denso Nanbeige4.3-33B, publicada por el usuario urakozz. El modelo original lo desarrolla el equipo Nanbeige y sigue una arquitectura Llama densa con 52 capas de decodificador, tamaño oculto de 7168 y atención con consultas agrupadas (GQA). La cuantización se ha realizado con AutoRound 0.17.0 en formato `auto_round:auto_gptq`, con pesos INT4 simétricos y grupo de 64, lo que reduce el checkpoint de unos 66 GB en BF16 a aproximadamente 21,4 GB.

El objetivo de esta ficha es evaluar una alternativa práctica para desplegar un modelo de 33B en hardware más modesto sin renunciar a la ventana de contexto ni al modo de razonamiento del modelo original. El checkpoint conserva en BF16 las embeddings, las normas y el `lm_head`, y cuantiza todas las capas lineales de los bloques del decodificador. Está pensado para tareas de agente, uso de herramientas y generación de código, con soporte declarado de inglés y chino.

La relevancia actual radica en que permite ejecutar un modelo de 33B con un consumo de VRAM cercano a los 21-22 GB, lo que lo sitúa al alcance de GPUs de consumo de gama alta y de GPUs profesionales de un solo dispositivo. La licencia Apache 2.0 facilita su uso comercial, aunque conviene verificar la compatibilidad del runtime con el formato de empaquetado de AutoRound antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas, hidden size 7168, GQA con 56 cabezas de consulta y 8 de clave/valor, dimensión de cabeza 128) |
| Parámetros totales | 6.774.369.280 (según safetensors del checkpoint cuantizado); el modelo base se denomina 33B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; la model card recomienda hasta 262.144 tokens nuevos en tareas de razonamiento y chat, y 65.536 en tareas de agente |
| Tipos de cuantización | W4A16, INT4 simétrico con group size 64, exportado como `auto_round:auto_gptq`; embeddings, normas y `lm_head` en BF16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint cuantizado GPTQ/AutoRound), compatible con Transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de arquitectura Llama con 52 capas de decodificador, tamaño oculto de 7168 y atención con consultas agrupadas: 56 cabezas de consulta y 8 de clave/valor con dimensión de cabeza 128. No se trata de un modelo MoE ni híbrido; toda la capacidad del modelo se activa en cada token. El checkpoint cuantizado mantiene la arquitectura estándar `LlamaForCausalLM` de Transformers, por lo que no requiere código remoto ni modificaciones del tokenizador.

La cuantización se realizó con AutoRound 0.17.0 sobre pesos fuente en BF16, con 512 muestras de calibración del dataset `opencode-instruct` (NVIDIA OpenCodeInstruct), longitud de secuencia de 2048 tokens y 200 iteraciones de optimización. Se cuantizaron todas las capas lineales dentro de `model.layers`, dejando en BF16 las embeddings, las normas y el `lm_head` no atado. No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Una innovación destacable del modelo original es el modo de razonamiento: el prompt de generación termina con `<think>\n`, de modo que el modelo razona antes de responder. La model card del checkpoint cuantizado recomienda temperaturas distintas según el escenario (1.0 para agente y uso de herramientas, 0.6 para razonamiento y chat) y advierte de que los tokens con id superior a 166.106 son relleno de vocabulario y nunca los produce el tokenizador.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explícito mediante el modo `<think>`, que fuerza una fase de pensamiento antes de la respuesta final.
- Generación y asistencia de código, con calibración específica sobre un dataset de instrucciones de código (`opencode-instruct`).
- Uso de herramientas y function calling, orientado a flujos de agente.
- Razonamiento multi-paso y tareas agénticas, con recomendación de hasta 65.536 tokens nuevos en ese escenario.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Soporte de contexto largo: la model card recomienda hasta 262.144 tokens nuevos en tareas de razonamiento y chat.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agentes autónomos con uso de herramientas: el modelo puede encadenar llamadas a funciones y razonamiento multi-paso, con una configuración de muestreo recomendada de temperatura 1.0 y top_p 0.95 para tareas agénticas. El checkpoint de 21,4 GB permite desplegarlo en una sola GPU profesional.
- Asistencia de programación en producción: la calibración con `opencode-instruct` y el soporte de tool calling lo hacen adecuado para integrarse en pipelines de generación de código, revisión de parches y autocompletado asistido dentro de un IDE o CI/CD.
- Razonamiento y resolución de problemas con contexto largo: con hasta 262.144 tokens nuevos recomendados, puede procesar documentos extensos, trazas de error o expedientes completos antes de responder, usando temperatura 0.6 y top_p 0.95.
- Chat de atención al cliente en inglés y chino: la plantilla de chat y el modo de razonamiento permiten conversaciones multi-turno con respuestas justificadas, aunque el alcance lingüístico queda limitado a esos dos idiomas.
- Análisis de código y documentación técnica: el modelo puede resumir repositorios, explicar funciones y generar documentación a partir de fragmentos largos de código, aprovechando la ventana de contexto extendida.
- Despliegue en hardware de gama alta de consumo: al ocupar unos 21,4 GB en INT4, es viable en GPUs con 24 GB de VRAM, lo que facilita prototipado local y entornos de investigación con presupuesto ajustado.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de AutoRound W4A16 frente al modelo BF16 en tareas de código y razonamiento, gracias a que mantiene la arquitectura estándar de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones numéricas con el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 21-22 GB solo para los pesos en INT4; hay que sumar la caché KV, que según la model card ocupa aproximadamente 208 KiB por token en BF16 con atención completa.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para contexto largo y concurrencia; una RTX 4090 de 24 GB puede alojar los pesos, pero el contexto disponible se reduce al descontar la caché KV.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB de VRAM como la RTX 4090, siempre que se limite la longitud de contexto y la concurrencia. En GPUs de 16 GB no cabe sin cuantizaciones adicionales o descarga a CPU.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `device_map="auto"`; la model card menciona compatibilidad con text-generation-inference y endpoints compatibles. Es imprescindible confirmar que el runtime soporta el formato de empaquetado `auto_round:auto_gptq` antes de desplegar. No se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card solo advierte de que el consumo de memoria en ejecución depende del framework, la longitud de contexto y la concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-W4A16-g64-AutoRound-GPTQ (este) | 6.774.369.280 en el checkpoint cuantizado; base denominado 33B | No disponible explícitamente; recomendaciones de hasta 262.144 tokens nuevos | W4A16 INT4, grupo 64, AutoRound GPTQ | Apache 2.0 | Hugging Face, 30 descargas, 0 likes |
| Nanbeige/Nanbeige4.3-33B (base) | 33B (denominación) | No disponible en la información | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de 33B densas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento fuera de esos dos idiomas es incierto.
- Riesgo de alucinación inherente a los modelos generativos; el modo `<think>` puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios especializados.
- La cuantización W4A16 con grupo 64 puede degradar la calidad frente al modelo BF16, sobre todo en tareas sensibles a precisión numérica; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Es necesario verificar que el runtime de inferencia soporte el formato `auto_round:auto_gptq`; de lo contrario, el checkpoint no cargará correctamente.
- La model card indica cargar el tokenizador lento (`use_fast=False`); usar el rápido puede provocar un comportamiento distinto al previsto por el autor.
- El consumo de caché KV es elevado (unos 208 KiB por token en BF16 con atención completa), lo que limita el contexto real en GPUs de 24 GB.
- El repositorio tiene un volumen de descargas muy bajo (30) y ningún like, por lo que no cuenta con validación comunitaria amplia; conviene evaluar su calidad antes de usarlo en producción.
- Aunque la licencia es Apache 2.0, deben revisarse los términos del modelo base y de los datos de calibración (`opencode-instruct`) para usos comerciales concretos.
- El checkpoint declara 6.774.369.280 parámetros en safetensors, cifra que no coincide con la denominación comercial de 33B; conviene validar el tamaño real y el comportamiento antes de dimensionar la infraestructura.

## Enlaces

- Repositorio del checkpoint cuantizado: https://huggingface.co/urakozz/Nanbeige4.3-33B-W4A16-g64-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- AutoRound (Intel): https://github.com/intel/auto-round
- Dataset de calibración NVIDIA OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
