# Thox-ai/ThoxNano-360M

## Resumen

ThoxNano-360M es un ajuste fino (fine-tune) del modelo SmolLM-360M de Hugging Face, publicado por Thox-ai bajo el paraguas de THOX.ai. Se trata de un modelo de lenguaje de 361.821.120 parámetros (aproximadamente 360M) orientado a la ejecución en dispositivo (on-device) y en el borde (edge), pensado como asistente local para el "tier" ThoxClip: respuestas conversacionales cortas, voz de marca THOX y enrutamiento de intenciones hacia funciones del dispositivo y de la malla (mesh). El ajuste consiste en un LoRA de rango 32 sobre un corpus propio de 982 ejemplos de chat, uso de herramientas y factualidad, fusionado posteriormente en los pesos base.

Su relevancia actual radica en dos factores. Por un lado, el tamaño reducido (360M) y la disponibilidad de pesos en safetensors y en GGUF Q4_K_M (270 MB) lo hacen desplegable en hardware muy modesto, incluso en CPU, con Ollama o llama.cpp. Por otro, el autor es explícito sobre el estado del modelo: la model card lo marca como "PUBLISHED — GROUNDING REQUIRED", es decir, los pesos por sí solos no son una fuente fiable de hechos y deben desplegarse con una capa de servicio que aporte el conocimiento factual.

El modelo se publica bajo licencia Apache-2.0, con soporte únicamente en inglés y con una evaluación propia (GATE49) que arroja un resultado débil: 23 de 49 preguntas superadas, media de 2,959 sobre 5 y 11 fallos duros. Es, por tanto, un modelo de nicho para identidad, tono conversacional y enrutamiento bajo grounding, no para recuperación factual desde los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-360M; detalles de atención y capas no disponibles en la información proporcionada) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (publicada); safetensors en precisión original; no se documentan otros niveles |
| Idiomas soportados | Inglés (en); calidad inferior en otros idiomas según el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (model.safetensors, 723.674.912 B) y GGUF Q4_K_M (270.590.336 B); incluye tokenizer.json, tokenizer_config.json, config.json, generation_config.json, chat_template.jinja y Modelfile |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM-360M, un transformer decoder-only de la familia SmolLM de Hugging Face; la model card no detalla número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.), por lo que esos datos deben considerarse no disponibles. Sobre esa base, Thox-ai aplicó un ajuste fino mediante LoRA de rango 32 entrenado con un corpus propio de 982 ejemplos que combina conversación (chat), uso de herramientas (tool-use) y factualidad. El adaptador LoRA se fusionó en los pesos base, de modo que el repositorio distribuye los pesos ya mergeados, no un adaptador separado.

No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; la model card indica que "el corpus y el procedimiento se describen en esta tarjeta tal como se publicaron en el lanzamiento" y que no se reclama ningún entrenamiento adicional más allá de lo descrito. Tampoco se especifican innovaciones técnicas destacables (atención lineal, decodificación especulativa, modos de razonamiento). El valor diferencial del modelo no está en la arquitectura, sino en el ajuste de comportamiento: voz de marca THOX, enrutamiento de intenciones y formato de chat propio (chat_template.jinja incluido en el repositorio).

## Capacidades

- Generación de texto conversacional en inglés, orientada a respuestas cortas y multi-turno.
- Enrutamiento de intenciones (intent routing) hacia funciones del dispositivo y de la malla, dentro del ecosistema ThoxClip.
- Uso de herramientas (tool-use) a nivel de formato de conversación, según el corpus de entrenamiento.
- Voz de marca (house voice) THOX: el ajuste busca reproducir un tono y estilo concretos.
- Ejecución totalmente offline y local-first, sin dependencia de servicios en la nube.
- Compatibilidad con Ollama y llama.cpp mediante el GGUF Q4_K_M publicado.
- No se documentan capacidades de visión, audio, matemáticas avanzadas, razonamiento multi-paso complejo ni modos de pensamiento (thinking mode).

## Casos de uso

- Asistente conversacional embebido en dispositivo: el modelo puede gestionar diálogos cortos en local con el GGUF Q4_K_M (270 MB), lo que permite integrarlo en dispositivos con recursos limitados sin conexión a internet. Es adecuado por su tamaño y su entrenamiento específico en conversación breve.
- Enrutamiento de comandos en el ecosistema ThoxClip: el ajuste sobre ejemplos de tool-use permite mapear la intención del usuario a funciones del dispositivo o de la malla (mesh), actuando como clasificador/enrutador ligero antes de invocar la función real.
- Prototipado rápido de asistentes de voz de marca: al incluir una voz THOX definida, sirve para experimentar con tono y estilo conversacional en productos de consumo antes de invertir en modelos mayores.
- Filtro o preprocesador en pipelines locales: por su bajo coste computacional, puede usarse como primera etapa para clasificar o reformular consultas antes de pasarlas a un modelo mayor con grounding.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse offline y con pesos abiertos bajo Apache-2.0, encaja en escenarios donde los datos no pueden salir del dispositivo (domótica, wearables, electrónica de consumo).
- Base para fine-tunes de dominio: al ser un fine-tune de SmolLM-360M con licencia permisiva, puede servir como punto de partida para ajustes adicionales en tareas concretas de un producto.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abstención) | 23/49 superadas — media 2,959/5 |
| Fallos duros en GATE49 | 11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación es la puerta de factualidad propia del autor, medida solo con los pesos y sin grounding del lado del servicio. El propio autor califica el resultado como débil y señala que una ejecución anterior de la evaluación no pudo completarse porque el modelo entró en un bucle de repetición en una de las preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 270.590.336 B (unos 258 MiB), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU. Los safetensors en precisión original ocupan 723.674.912 B (unos 690 MiB).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100, etc.). El modelo está pensado para ejecución en CPU y en dispositivos de borde.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en CPU y en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxnano-360m`), llama.cpp (`llama-cli` con el GGUF), y descarga directa de safetensors desde Hugging Face. No se documentan integraciones con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda límites de salida modestos y condiciones de parada activas por la tendencia a bucles de repetición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---:|---|---|---|---|
| ThoxNano-360M | 361.821.120 | No disponible | Apache-2.0 | Safetensors, GGUF Q4_K_M | Fine-tune de SmolLM-360M con corpus propio de 982 ejemplos; GATE49 23/49 |
| SmolLM-360M (HuggingFaceTB) | 360M | No disponible en la información proporcionada | Apache-2.0 | Safetensors, GGUF | Modelo base del que deriva ThoxNano; sin ajuste THOX |
| SmolLM2-360M (HuggingFaceTB) | 360M | No disponible en la información proporcionada | Apache-2.0 | Safetensors, GGUF | Generación posterior de la familia SmolLM; no se dispone de comparación de rendimiento con ThoxNano en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre ThoxNano-360M y estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formatos.

## Limitaciones y advertencias

- Tendencia a bucles de repetición en algunas indicaciones; el autor recomienda límites de salida modestos y condiciones de parada activas.
- Puede repetir fragmentos de su texto de sistema en lugar de responder conversacionalmente.
- Las respuestas factuales desde los pesos desnudos no son fiables; el despliegue debe incluir grounding del lado del servicio. El propio autor marca el estado como "GROUNDING REQUIRED".
- La cuantización Q4_K_M intercambia precisión por tamaño, con la consiguiente pérdida de calidad.
- El entrenamiento es mayoritariamente en inglés y la calidad en otros idiomas es inferior; el modelo solo declara soporte de inglés.
- El resultado en la puerta de factualidad propia es débil (23/49, media 2,959/5, 11 fallos duros), y una evaluación anterior no pudo completarse por un bucle de repetición.
- Esta versión no ha sido cualificada en el hardware de los dispositivos ThoxClip, según el autor.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento, mayoritariamente en inglés.
- Licencia Apache-2.0: permisiva para uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción; el uso en decisiones críticas de seguridad, médicas o legales queda fuera de alcance sin supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxNano-360M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Repositorio de Ollama (referencia de despliegue): no disponible en la información proporcionada
- Paper o blog técnico del fine-tune: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
