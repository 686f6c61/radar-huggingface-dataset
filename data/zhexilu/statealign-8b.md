# ZhexiLu/StateAlign-8B

## Resumen

StateAlign-8B es un modelo de lenguaje de 8.190.735.360 parámetros desarrollado por ZhexiLu (con la colaboración de Subhajit Chaudhury, Tejaswini Pedapati, Keerthiram Murugesan y Lei Yu) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base Qwen/Qwen3-8B, orientado específicamente a la construcción de agentes multi-turno que utilizan herramientas (tool-use agents). El modelo conserva la arquitectura y la plantilla de chat de Qwen3, por lo que es compatible con el ecosistema existente de Qwen3-8B.

El problema que aborda es la toma de decisiones en agentes que interactúan con herramientas a lo largo de varios turnos: en lugar de reaccionar de forma reactiva a cada observación, el agente debe razonar sobre el estado actual de la tarea (qué información se conoce, qué falta, si las herramientas disponibles pueden satisfacer la petición y qué partes ya están completas). StateAlign introduce un método de aprendizaje por refuerzo que combina recompensas de resultado con una señal contrastiva a nivel de token, comparando el mismo razonamiento y acción bajo estados emparejados que difieren en una sola condición.

El modelo es relevante ahora porque los agentes basados en LLM con llamadas a funciones son un componente central de los sistemas de automatización, y los benchmarks específicos de tool-use multi-turno (BFCL v4, ToolSandbox, When2Call) muestran mejoras sustanciales frente al Qwen3-8B original. El modelo está entrenado únicamente en inglés y su tamaño de 8B lo hace desplegable en hardware de gama alta de consumo con cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; 65.536 con YaRN factor 2 |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de transformers/vLLM) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

StateAlign-8B mantiene la arquitectura transformer decoder-only de Qwen3-8B, incluyendo su plantilla de chat y su tokenizador. El ajuste fino se realizó mediante LoRA con rango 64 y alpha 128 sobre todas las proyecciones de atención y MLP, durante 400 pasos, y los adaptadores se fusionaron en los pesos base para esta publicación. El método de entrenamiento, denominado StateAlign, combina GRPO (Group Relative Policy Optimization) con recompensas de resultado derivadas de la interacción, junto con una señal contrastiva a nivel de token que compara el mismo razonamiento y acción generados bajo estados de tarea emparejados que difieren en una única condición. La puntuación de esos contrastes la realiza el modelo base fijo.

Los estados de tarea se construyen a partir de trayectorias públicas de uso de herramientas, cubriendo acciones como ejecutar, preguntar al usuario, recuperar información, rechazar o detener. Esta formulación busca que el agente internalice la toma de decisiones consciente del estado en lugar de depender únicamente de la recompensa final de la interacción. El modelo conserva las capacidades de razonamiento de Qwen3, incluyendo el modo de pensamiento (thinking mode), y soporta contextos extendidos mediante YaRN.

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de pensamiento heredado de Qwen3.
- Llamada a funciones y uso de herramientas (tool calling / function calling) con el parser `hermes` en vLLM.
- Toma de decisiones consciente del estado de la tarea: determinar si ejecutar, preguntar al usuario, recuperar información, rechazar o detener.
- Razonamiento multi-paso y planificación de acciones en agentes.
- Detección de cuándo no es necesario llamar a una herramienta (capacidad evaluada en SimpleToolHalluBench, subconjunto NTA).
- Resistencia a herramientas distractoras (evaluada en SimpleToolHalluBench, subconjunto DT).
- Capacidades multilingües limitadas al inglés según la model card.
- Compatible con TGI y con servidores OpenAI-compatible mediante vLLM.

## Casos de uso

- Atención al cliente automatizada con cancelación y gestión de pedidos: el modelo puede gestionar conversaciones multi-turno en las que debe decidir si ejecutar una herramienta (por ejemplo, `cancel_order`), pedir confirmación al usuario o rechazar la petición, usando el contexto de 32.768 tokens para mantener el estado de la conversación.
- Agentes de soporte técnico con acceso a múltiples herramientas: la capacidad de razonar sobre qué información falta y qué herramientas están disponibles permite encadenar consultas a bases de conocimiento, APIs de estado y sistemas de tickets sin llamadas innecesarias.
- Automatización de flujos de trabajo empresariales (RPA con LLM): integración en pipelines donde el agente debe decidir entre ejecutar una acción, recuperar datos o escalar a un humano, con menor tasa de alucinación de herramientas según SimpleToolHalluBench.
- Evaluación y desarrollo de agentes de investigación: el modelo sirve como referencia para estudiar el comportamiento de agentes multi-turno en entornos controlados como ToolSandbox o BFCL, gracias a la disponibilidad del código de entrenamiento y del script de evaluación.
- Asistentes conversacionales con function calling en producción: despliegue con vLLM y el parser `hermes` para servir una API compatible con OpenAI que gestione tool calling de forma nativa.
- Sistemas de reservas y transacciones: el modelo puede decidir cuándo solicitar datos adicionales al usuario (por ejemplo, un identificador de pedido) antes de invocar una herramienta, reduciendo errores en la ejecución de acciones irreversibles.
- Moderación de acciones en agentes autónomos: la capacidad de rechazar o detener una tarea cuando las herramientas disponibles no pueden satisfacer la petición resulta útil en entornos con restricciones de seguridad.

## Benchmarks y rendimiento

| Benchmark | Qwen3-8B | StateAlign-8B |
|---|---|---|
| BFCL v4 multi-turn (overall) ↑ | 45.5 | 55.2 |
| ToolSandbox (similarity) ↑ | 73.4 | 79.3 |
| When2Call (accuracy) ↑ | 66.4 | 72.4 |
| SimpleToolHalluBench, no tool (NTA) ↓ | 59.8 | 56.1 |
| SimpleToolHalluBench, distractor tool (DT) ↓ | 28.2 | 25.0 |

BFCL se reporta como la media de seis evaluaciones con temperatura 0.001, usando el handler `Qwen/Qwen3-8B-FC` y YaRN factor 2 para un contexto de 65.536 tokens. Los detalles completos de configuración y baselines están en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB; con 4 bits: aproximadamente 5-6 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas en la model card).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con FP16 y contexto limitado, o en GPUs con 12-16 GB usando cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM (con `--enable-auto-tool-choice --tool-call-parser hermes --reasoning-parser qwen3`), Transformers, TGI (etiqueta `text-generation-inference`), y cuantización estándar para llama.cpp/Ollama no confirmada en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 multi-turn | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StateAlign-8B | 8,19B | 32.768 (65.536 con YaRN) | 55.2 | Apache 2.0 | Hugging Face |
| Qwen3-8B | 8,19B | 32.768 (65.536 con YaRN) | 45.5 | Apache 2.0 | Hugging Face |
| Alternativas de 7-8B para tool-use | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible en la model card es con Qwen3-8B, su modelo base, sobre el que StateAlign-8B mejora 9,7 puntos en BFCL v4 multi-turn, 5,9 puntos en ToolSandbox y 6,0 puntos en When2Call, además de reducir la tasa de alucinación de herramientas en SimpleToolHalluBench. No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés: el rendimiento en otros idiomas, incluido el castellano, no está garantizado y probablemente sea inferior al de Qwen3-8B en tareas multilingües.
- Riesgo de alucinación de herramientas: aunque SimpleToolHalluBench muestra mejoras, las tasas siguen siendo elevadas (56,1 en NTA y 25,0 en DT), lo que exige validación en producción.
- El ajuste fino se centra en tool-use multi-turno; otras capacidades (código, matemáticas, conocimiento general) pueden degradarse ligeramente respecto a Qwen3-8B, aunque no se han publicado datos al respecto.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3-8B.
- El contexto nativo es de 32.768 tokens; para 65.536 es necesario activar YaRN, lo que puede afectar a la calidad en contextos largos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.
- No se han publicado resultados de benchmarks en la información disponible más allá de los cinco reportados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhexiLu/StateAlign-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código de entrenamiento y evaluación: https://github.com/ZhexiLu/StateAlign
- Paper (referencia en la model card): StateAlign: Internalizing State-Aware Decision-Making for Reliable Multi-Turn Tool Agents via Reinforcement Learning (Lu et al., 2026)
