# Thox-ai/ThoxEdge-0.5B

## Resumen

ThoxEdge-0.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct desarrollado por Thox-ai, orientado a su uso como asistente en dispositivos locales de gama baja (tier ThoxMini). Se trata de un LoRA de rango 32 entrenado sobre un corpus propio de 982 ejemplos de chat, uso de herramientas y factualidad, fusionado posteriormente en los pesos base. El modelo resuelve el problema de disponer de un asistente conversacional totalmente offline y ligero para enrutar intenciones hacia funciones del dispositivo y del mesh, manteniendo una voz de marca consistente.

La relevancia actual del modelo radica en su enfoque "local-first": se distribuye con pesos safetensors, un GGUF Q4_K_M y un Modelfile de Ollama, lo que permite ejecutarlo en hardware de consumo sin conexión. Con 494 millones de parámetros, hereda la arquitectura transformer de Qwen2.5 y su tokenizador, pero su capacidad es deliberadamente estrecha: el ajuste actúa como una capa de comportamiento y factualidad, no como una mejora de capacidades.

El modelo se publica con la advertencia explícita de que requiere "grounding" en la capa de servicio: los pesos por sí solos no son una fuente fiable de hechos sobre THOX. Su licencia Apache-2.0 facilita la integración comercial, aunque el autor restringe el uso a tareas no críticas sin supervisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (incluido); otros no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, Modelfile de Ollama |

## Arquitectura y entrenamiento

ThoxEdge-0.5B parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. Sobre esa base se aplicó un ajuste fino mediante LoRA de rango 32, entrenado con un corpus autoría de THOX compuesto por 982 ejemplos que cubren conversación, uso de herramientas y factualidad. Los adaptadores LoRA se fusionaron en los pesos base, de modo que el repositorio contiene los pesos completos fusionados en safetensors, además de una cuantización Q4_K_M en GGUF y un Modelfile para Ollama.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. El autor describe el ajuste como una "capa de hechos y comportamiento" sobre el modelo base, no como una mejora de capacidades. La evaluación se realizó con la puerta de factualidad GATE49 (49 preguntas, solo pesos, sin grounding del lado del servicio, con ponderación de abstención), obteniendo 47/49 y una media de 4,837/5, con un fallo duro (la pregunta de precios se respondió sin la declinación requerida). La política de la puerta exige cero fallos duros, por lo que el build no la supera y se publica requiriendo grounding en la capa de servicio.

## Capacidades

- Generación de texto conversacional para respuestas cortas en inglés.
- Enrutamiento de intenciones hacia funciones del dispositivo y del mesh (tool routing).
- Uso de herramientas (tool-use) según el corpus de entrenamiento.
- Voz de marca THOX ("house voice") consistente en las respuestas.
- Declinación correcta ante preguntas difíciles o fuera de alcance (abstention), según el diseño del ajuste.
- Funcionamiento totalmente offline en dispositivos locales.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso avanzado.

## Casos de uso

- Asistente de voz o chat en dispositivos ThoxMini: el modelo gestiona respuestas conversacionales cortas y enruta intenciones a funciones del dispositivo, funcionando sin conexión gracias a su tamaño reducido y su GGUF Q4_K_M.
- Enrutamiento de comandos en un mesh de dispositivos: interpreta la intención del usuario y la dirige a la función o dispositivo adecuado, con la factualidad complementada por la capa de servicio.
- Asistente local para portátiles y equipos de sobremesa vía Ollama: se despliega con `ollama run Thox-ai/thoxedge-0.5b` para tareas de conversación ligera y automatización de escritorio.
- Prototipado de agentes de borde: sirve como componente de enrutamiento y diálogo en pipelines experimentales que requieren un modelo pequeño y de baja latencia.
- Filtrado y clasificación de intenciones en aplicaciones de atención al cliente locales: responde con declinaciones controladas cuando la consulta queda fuera de su ámbito.
- Demostraciones y pruebas de integración de la plataforma THOX: permite validar la experiencia de usuario en los dispositivos virtuales disponibles en la web de THOX antes de adquirir el hardware.
- Base para ajustes finos adicionales: al estar bajo Apache-2.0 y con pesos safetensors, puede reutilizarse como punto de partida para dominios específicos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| THOX GATE49 (factualidad, solo pesos, development set) | 47/49 — media 4,837/5 |
| Fallos duros | 1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. GATE49 es un conjunto de desarrollo propio del autor y no es comparable directamente con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (pesos safetensors de 988 MB); alrededor de 0,4-0,6 GB en Q4_K_M (GGUF de 398 MB) más overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; cabe en RTX 3050, RTX 4060, GTX 1660 y superiores; también en Apple Silicon y CPU.
- Cabe en GPU consumer y en dispositivos de borde; es viable en CPU con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp con el GGUF Q4_K_M, y descarga directa de safetensors vía `hf download` para otros runtimes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxEdge-0.5B | 494 M | no disponible | Apache-2.0 | Hugging Face, Ollama | Fine-tune de Qwen2.5-0.5B-Instruct con corpus propio |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en la información | Apache-2.0 | Hugging Face | Modelo base; capacidades generales sin ajuste de marca |
| Otros modelos de 0,5B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada más allá del modelo base.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad estrecha por diseño; el ajuste es una capa de hechos y comportamiento, no una mejora de capacidades. Es previsible que decline correctamente preguntas difíciles en lugar de responderlas.
- Las respuestas factuales de los pesos desnudos siguen siendo poco fiables en las categorías débiles; debe desplegarse con grounding en la capa de servicio para hechos.
- El build publicado no supera la puerta GATE49 por un fallo duro (pregunta de precios respondida sin la declinación requerida).
- Riesgo de alucinación en preguntas factuales fuera del corpus de entrenamiento.
- Soporte únicamente de inglés (`en`); no se documentan otros idiomas.
- Longitud de contexto no disponible; no debe asumirse una ventana amplia.
- Uso previsto limitado a asistente en dispositivo y enrutamiento; fuera de alcance para decisiones críticas de seguridad, médicas o legales sin supervisión humana.
- No debe usarse como fuente autónoma de hechos sobre THOX.
- La licencia Apache-2.0 cubre los pesos y el ajuste; conviene revisar el texto de licencia del repositorio para los términos completos.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
