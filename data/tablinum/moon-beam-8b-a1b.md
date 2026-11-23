# tablinum/Moon-Beam-8B-A1B

## Resumen

Moon-Beam-8B-A1B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum, un proyecto independiente que parte del modelo base inclusionAI/Ling-3.0-tiny. Cuenta con 7.893.389.856 parámetros totales (aproximadamente 8B) y activa alrededor de 1B por token, con una ventana de contexto de 131.072 tokens. Su rasgo diferencial es que está entrenado para responder a partir de pasajes recuperados de una biblioteca de conocimiento propia denominada *engram*, lo que lo orienta a tareas de recuperación aumentada (RAG) y a un uso como agente de soporte con acceso a herramientas.

La arquitectura subyacente es `bailing_hybrid`, que combina atención KDA (Kimi Delta Attention) con MLA (Multi-head Latent Attention) y capas MoE, junto con una capa MTP (multi-token prediction) entrenada para decodificación especulativa. El ajuste se realizó con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno, y la versión publicada corresponde a la ronda 1b, ya que la ronda 2 no superó las puertas de validación en held-out.

El modelo resulta relevante para quienes construyen pipelines de RAG y agentes conversacionales con presupuesto de cómputo contenido: ofrece contexto muy largo, modo de razonamiento (thinking) activado por defecto, soporte de tool calling y una integración específica con el *harness* terrabeam, que mejora de forma medible la precisión en tareas de biblioteca (del 53,2% al 83,4% en el conjunto de 154 tareas held-out según el autor).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailing_hybrid`: atención KDA + MLA con capas MoE (transformer híbrido) |
| Parámetros totales | 7.893.389.856 (~8B) |
| Parámetros activos | ~1B por token (MoE, dato del autor) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | BF16 (pesos oficiales); GGUF, FP8, MLX y MLX 8-bit en repos derivados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 4 shards, ~16 GB); GGUF, FP8 y MLX en repos separados; capa MTP en `mtp/mtp_layer.safetensors` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `bailing_hybrid` de Ling-3.0-tiny: un transformer con atención híbrida que combina KDA y MLA, capas de mezcla de expertos y una capa MTP adicional (`model.layers.24.*`, 0,63 GB) entrenada para decodificación especulativa. El repositorio incluye el código de modelado (`modeling_bailing_moe_v3.py`, `configuration_bailing_moe_v3.py`), por lo que requiere `trust_remote_code=True`. Los pesos se distribuyen en cuatro shards safetensors en BF16, con un tamaño de repositorio de 16,4 GB.

El ajuste se hizo con QLoRA sobre el modelo base inclusionAI/Ling-3.0-tiny, usando como datos pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. El autor indica que la ronda 2 de entrenamiento no superó las puertas de evaluación en held-out, por lo que la release final es la ronda 1b. La innovación principal no está en los pesos sino en el acoplamiento con el *harness* terrabeam: el modelo está entrenado para consumir pasajes en un formato concreto y para invocar una herramienta `search_library` con sus propias consultas, lo que habilita razonamiento multi-paso sobre la biblioteca.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking) activado por defecto en la plantilla de chat.
- Razonamiento matemático: 95,5% en 400 preguntas de GSM8K con thinking activado, según el protocolo de model card del autor.
- Respuesta sobre conocimiento recuperado: 86,5% (436/503) en EngramBench con pasajes de la tabla propia de cada pregunta.
- Tool calling y function calling, incluida la herramienta `search_library` que el modelo invoca con consultas propias y de forma iterativa.
- Comportamiento como agente de soporte multi-turno: recompensa media de 0,71 en airline, 0,80 en retail y 0,62 en telecom en tau2-bench.
- Memoria a largo plazo de conversaciones anteriores, gestionada por terrabeam y presentada junto a los pasajes de biblioteca.
- Ventana de contexto de 131.072 tokens, adecuada para bibliotecas de decenas de tablas y conversaciones largas.
- Decodificación especulativa mediante la capa MTP incluida en el repositorio.
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.

## Casos de uso

- Agente de atención al cliente multi-turno: el modelo puede mantener conversaciones largas y consultar una base de conocimiento estructurada mediante `search_library`, con recompensas medidas en tau2-bench de 0,71 (airline), 0,80 (retail) y 0,62 (telecom) cuando se conserva el razonamiento entre turnos.
- Asistente interno sobre documentación corporativa: desplegado con terrabeam delante de vLLM o SGLang, responde preguntas de dos pasos sobre bibliotecas de decenas de tablas, tarea en la que el *harness* 0.3 eleva la precisión del 9,1% al 63,6% frente al setup anterior.
- RAG con memoria persistente: notas de conversaciones previas se emparejan por palabras distintivas (nombres, lugares) y se muestran junto a los pasajes recuperados, con una precisión del 89,6% en 24 tareas de memoria en la evaluación del autor.
- Resolución de problemas matemáticos con razonamiento explícito: útil en pipelines educativos o de verificación donde se necesita la traza de pensamiento, con 95,5% en GSM8K bajo el protocolo indicado.
- Automatización de soporte con herramientas: el modelo puede encadenar llamadas a funciones y búsquedas en biblioteca para resolver incidencias que requieren varios pasos, integrándose vía API compatible con OpenAI a través de terrabeam.
- Prototipado en hardware de consumo: con cuantizaciones GGUF o MLX 8-bit y ~1B parámetros activos, es viable en estaciones de trabajo y Macs Apple Silicon para desarrollo y pruebas.
- Evaluación de sistemas RAG: sirve como modelo de referencia para medir el impacto del *harness* (búsqueda, memoria, conservación del razonamiento) manteniendo los pesos fijos.

## Benchmarks y rendimiento

Resultados publicados por el autor bajo su protocolo de model card (temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GSM8K (400 preguntas) | 95,5% | Thinking activado |
| EngramBench (503 preguntas) | 86,5% (436/503) | Thinking activado, pasajes de la tabla propia de cada pregunta |
| tau2-bench airline | 0,71 de recompensa media | Conversaciones de soporte |
| tau2-bench retail | 0,80 de recompensa media | Conversaciones de soporte |
| tau2-bench telecom | 0,62 de recompensa media | Conversaciones de soporte |

Evaluación del *harness* sobre 154 tareas held-out (mismos pesos, terrabeam 0.2 frente a 0.3):

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats anteriores (24) | 64,6% | 89,6% |
| Todas las tareas (correctas / incorrectas) | 53,2% / 14,6% | 83,4% / 12,0% |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada en BF16: unos 16 GB solo para pesos, más overhead de activaciones y caché KV para 131K tokens; se recomienda GPU con 24 GB o más para contexto largo.
- Cuantizaciones GGUF, FP8 y MLX 8-bit reducen el requisito de memoria; el repo GGUF está pensado para despliegue ligero y ejecución con el comando `terrabeam run`.
- GPU recomendadas: A100 o H100 para servicio con contexto completo y decodificación especulativa; RTX 4090 (24 GB) viable en BF16 con contexto reducido o con cuantización.
- En hardware de consumo: las variantes GGUF y MLX 8-bit permiten ejecución en GPUs de 16-24 GB y en Macs Apple Silicon; el tamaño de pesos en 8-bit ronda los 8 GB.
- Opciones de despliegue: vLLM (`--trust-remote-code --max-model-len 131072`), SGLang, transformers 4.57 con código del repositorio, llama.cpp/Ollama vía GGUF y MLX en Apple Silicon.
- terrabeam actúa como proxy compatible con OpenAI (`/v1`) delante del servidor para inyectar pasajes, activar la herramienta de biblioteca y conservar el razonamiento entre turnos.
- No se han publicado cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B | ~8B | ~1B | 131.072 | MIT | Fine-tune de Ling-3.0-tiny orientado a RAG y agentes; benchmarks propios |
| inclusionAI/Ling-3.0-tiny | no disponible en la información | no disponible | no disponible | no disponible | Modelo base del que deriva Moon-Beam |
| Alternativas MoE de ~8B con ~1B activos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos verificados de otros modelos comparables en la información proporcionada; la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- El modelo está entrenado para responder a partir de pasajes recuperados en un formato concreto; sin el *harness* terrabeam o sin pasajes inyectados, su rendimiento en tareas de conocimiento puede degradarse notablemente.
- Los benchmarks publicados (GSM8K, EngramBench, tau2-bench) proceden del autor y de su propio protocolo de model card; no hay validación independiente en la información disponible.
- La puntuación en tau2-bench airline cae de 0,711 a 0,045 si se descarta el razonamiento previo entre turnos, lo que hace crítica la configuración del *harness* en producción.
- Riesgo de alucinación inherente a modelos de ~1B parámetros activos; la evaluación del autor registra un 12,0% de respuestas incorrectas en el conjunto de tareas de biblioteca.
- La ronda 2 de entrenamiento no superó las puertas de validación, lo que sugiere margen de mejora limitado con el pipeline actual del autor.
- Requiere `trust_remote_code=True` y ejecución de código incluido en el repositorio; conviene auditar `modeling_bailing_moe_v3.py` antes de desplegar en entornos sensibles.
- Licencia MIT: permite uso comercial, pero el modelo base Ling-3.0-tiny puede tener condiciones propias que conviene revisar.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Repositorio GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Repositorio FP8: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-FP8
- Repositorio MLX: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX
- Repositorio MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decisión sobre la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Release terrabeam 0.3.0: https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
