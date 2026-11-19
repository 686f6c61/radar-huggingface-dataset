# turintech/Kev-9B-Artemis-GGUF

## Resumen

Kev-9B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo Kev-9B de TurinTech, un modelo de decisión diseñado específicamente para responder preguntas tipadas (sí/no, elección múltiple, puntuaciones) devolviendo una probabilidad por cada respuesta en una sola pasada. A diferencia de un modelo conversacional, no mantiene diálogo: su función es clasificar y enrutar decisiones dentro de pipelines, y se sirve a través del endpoint `/v1/systemone` de `llama-server`.

El modelo base, `jaredpalmer/kev-9b`, tiene 8.955.900.928 parámetros (aproximadamente 9B) y esta versión ha sido comprimida con la técnica Artemis de TurinTech, que reduce el peso de 20.0 GiB a 9.1 GiB de memoria GPU manteniendo un 92.2% de coincidencia con las respuestas del modelo original. Esto permite ejecutarlo en GPUs de consumo con 12 GB de VRAM, como una RTX 4090 o una RTX 5090.

Su relevancia actual radica en que ofrece un modelo de decisión de 9B parámetros con licencia Apache 2.0, desplegable localmente en hardware asequible, con soporte para Ollama y LM Studio, y con un formato de salida probabilístico que facilita la integración en sistemas de enrutamiento, triaje y verificación tipada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `jaredpalmer/kev-9b`; arquitectura específica no disponible) |
| Parametros totales | 8.955.900.928 (~9B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens (configuración recomendada `-c 16384`; contexto de entrenamiento mayor según la model card) |
| Tipos de cuantizacion | GGUF cuantizado con Artemis; incluye al menos IQ3_M (4.78 GB); otras variantes no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `jaredpalmer/kev-9b` más allá de que se trata de un transformer de aproximadamente 9B parámetros. Lo que sí se especifica es el proceso de compresión Artemis de TurinTech, que reduce el modelo de 20.0 GiB a 9.1 GiB de memoria GPU (una reducción de más del 50%) manteniendo un 92.2% de coincidencia con las respuestas del original en el conjunto de test `LocalLLaMA/typed-decisions`.

El modelo está diseñado como un "decision model": recibe un estado (texto de entrada) y un conjunto de preguntas tipadas, y devuelve una probabilidad para cada respuesta posible en una sola pasada. No es un modelo conversacional ni genera texto libre; su salida es probabilística y estructurada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo sí/no, elección múltiple y puntuaciones, devolviendo una probabilidad por cada respuesta.
- Enrutamiento y triaje: adecuado para decidir la categoría o el destino de una solicitud dentro de un pipeline.
- Verificación tipada: puede comprobar si una condición se cumple (por ejemplo, si un mensaje expresa urgencia).
- Salida probabilística en una sola pasada: no requiere generación autoregresiva de texto, lo que reduce la latencia.
- Integración con `llama-server`: expone el endpoint `/v1/systemone` para peticiones estructuradas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a decisiones puntuales, no a razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar la urgencia de un mensaje de cliente (por ejemplo, "¿este mensaje expresa urgencia?") y enrutarlo al equipo adecuado, usando el endpoint `/v1/systemone` con preguntas tipadas y umbrales de probabilidad configurables.
- Enrutamiento de consultas en un chatbot: dado un mensaje de usuario, decidir a qué flujo o departamento debe dirigirse (ventas, soporte técnico, facturación), aprovechando la salida probabilística para manejar casos ambiguos con umbrales.
- Verificación de condiciones en pipelines de CI/CD: comprobar si un cambio de código cumple ciertos criterios tipados (por ejemplo, "¿este parche afecta a la API pública?") antes de continuar el pipeline.
- Moderación de contenido ligera: clasificar mensajes según categorías predefinidas (spam, abuso, consulta legítima) con una sola pasada y baja latencia, adecuado para volúmenes altos.
- Extracción de señales en formularios: evaluar respuestas de formularios o encuestas con preguntas tipadas (sí/no, escala) para generar puntuaciones automáticas.
- Despliegue en hardware de consumo: al caber en 9.1 GiB de VRAM, puede ejecutarse en una RTX 4090 o RTX 5090 para prototipos y entornos de desarrollo sin necesidad de infraestructura en la nube.
- Integración en Ollama o LM Studio: usar el paquete `turintech/kev-9b-artemis` con `--ask` para pruebas locales y desarrollo rápido de flujos de decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Agreement with the original | Test decisions (`LocalLLaMA/typed-decisions`) | Same answer (%) | 92.2 |
| Agreement with the original | Test decisions (`LocalLLaMA/typed-decisions`) | Confident changes | 0 |
| Typed decisions | Test decisions (`LocalLLaMA/typed-decisions`) | Accuracy (%) | 67.8 |

Comparación adicional aportada en la model card: el cuantizado ggml-org Q4_K_M obtiene un 93.2% de coincidencia con el original, frente al 92.2% de esta versión Artemis.

## Requisitos de hardware

- VRAM estimada para inferencia: 9.1 GiB con la cuantización IQ3_M (frente a 20.0 GiB del modelo original).
- GPU recomendadas: RTX 4090, RTX 5090 (probado en RTX 5090), y cualquier GPU con al menos 12 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 4090, RTX 5090, entre otras).
- Opciones de despliegue: `llama-server` (llama.cpp b11540 o superior, probado en `1e6f04a`), Ollama (0.40.4 probado), LM Studio. También funciona en Apple M3 Max (36 GB) con la build Metal de llama.cpp (b11617).
- Configuración recomendada: `llama-server -hf turintech/Kev-9B-Artemis-GGUF:IQ3_M --port 8080 -c 16384 -ub 4096 -b 4096`, añadiendo `--parallel 2` para reproducir la medición de memoria (dos slots de 8.192 tokens cada uno).
- Latencia y throughput: no disponibles de forma explícita; la model card menciona que el tamaño de batch afecta ligeramente a las probabilidades (0.730 con batch 512 frente a 0.727 con batch 4096 en una prueba con RTX 5090 sobre una entrada de 854 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-9B-Artemis-GGUF (este) | ~9B | 16.384 tokens (config. recomendada) | 92.2% same answer; 67.8% accuracy en typed decisions | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| Kev-9B (original, `jaredpalmer/kev-9b`) | ~9B | no disponible | Referencia base (20.0 GiB VRAM) | no disponible | Hugging Face |
| ggml-org Q4_K_M de Kev-9B | ~9B | no disponible | 93.2% same answer | no disponible | Hugging Face (ggml-org) |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no mantiene diálogo ni genera texto libre; solo responde preguntas tipadas a través del endpoint `/v1/systemone`.
- Requiere `llama.cpp` b11540 o superior (probado en `1e6f04a`); versiones anteriores pueden no soportar el endpoint.
- El tamaño de batch afecta ligeramente a las probabilidades de salida; se recomienda fijar `-ub 4096 -b 4096` para reproducir los resultados de la model card.
- La precisión en decisiones tipadas es del 67.8%, lo que implica un margen de error significativo para aplicaciones críticas; se recomienda validar con datos propios y usar umbrales de confianza.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- No se dispone de información sobre sesgos, idiomas soportados ni rendimiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribución correspondiente.
- El modelo base `jaredpalmer/kev-9b` tiene licencia no especificada en la información disponible; conviene verificar su licencia antes de un uso comercial derivado.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero las probabilidades de decisión pueden ser incorrectas en entradas ambiguas o fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Kev-9B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Ollama: https://ollama.com/turintech/kev-9b-artemis
- LM Studio: https://lmstudio.ai/turintech/kev-9b-artemis
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
