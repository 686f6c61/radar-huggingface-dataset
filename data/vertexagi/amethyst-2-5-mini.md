# VertexAGI/amethyst-2-5-mini

## Resumen

Amethyst 2.5 Mini es un ajuste fino (fine-tune) del modelo Qwen3-4B desarrollado por VertexAGI, un proyecto de investigación independiente. El modelo está especializado en conversación con capacidad de invocar una herramienta de búsqueda web (`web_search`) de forma selectiva: decide cuándo es necesario buscar información actualizada y cuándo puede responder directamente con conocimiento estable. Además, cita las fuentes consultadas y, cuando los resultados no contienen la respuesta, lo indica explícitamente en lugar de inventar datos.

Técnicamente se trata de un transformer denso decoder-only de 4.022.468.096 parámetros (aproximadamente 4B), derivado de Qwen3-4B y ajustado mediante LoRA sobre el checkpoint cuantizado a 4 bits de `mlx-community`. El entrenamiento se realizó con MLX en Apple Silicon, con un conjunto sintético de 3.205 conversaciones generadas por destilación desde modelos maestros de mayor tamaño. La longitud de contexto heredada del modelo base es de 32.768 tokens según la documentación pública de Qwen3-4B, aunque la model card no la especifica explícitamente.

Su relevancia radica en el enfoque: en lugar de maximizar el tamaño, optimiza el comportamiento en tool calling y la honestidad ante resultados insuficientes, un problema recurrente en asistentes con acceso a búsqueda. Se distribuye en formatos MLX y GGUF con licencia Apache 2.0, lo que facilita su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el base Qwen3-4B soporta 32.768 tokens) |
| Tipos de cuantizacion | MLX mixta (capas ajustadas 8-bit, resto 4-bit), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de aproximadamente 4B parámetros, y se ajusta mediante LoRA con rango 16, escala 20.0, dropout 0.0 y 16 capas adaptadas. El entrenamiento se ejecutó con MLX y `mlx-lm` sobre Apple Silicon, con pérdida calculada únicamente sobre los turnos del asistente (`mask_prompt`). Se usó el optimizador Adam con learning rate constante de 6e-5, batch size 4, longitud de secuencia 2.048, gradient checkpointing, 2 épocas y 2.341 iteraciones. La ejecución se pausó manualmente en torno a la iteración 1.580 y se reanudó desde los pesos de la iteración 1.400 para las 941 iteraciones restantes, reiniciando Adam en frío al no haberse guardado el estado del optimizador.

Los datos de entrenamiento son 3.205 conversaciones sintéticas (4.683 muestras tras dividir cada conversación en una muestra por turno del asistente), generadas por destilación desde GLM 5.3, GLM 5.3 Flash, Kimi K3, poolside Laguna S 2.1 y MiniMax M3.1 Flash a través de NVIDIA NIM y OpenRouter. Todos los resultados de búsqueda del dataset son inventados por los maestros; no se rastrearon páginas web reales. La mezcla cubre chat general (817), respuestas cortas sin búsqueda (309 + 42), instrucciones de formato conciso (500), búsqueda de hechos actuales con una consulta (502), fuentes en desacuerdo (127), refinamiento de consultas débiles (97 + 21), fallos de búsqueda (192) y, de forma destacada, resultados en tema pero sin la respuesta (448). Las filas con resultados de búsqueda pasaron una verificación automática de grounding: la respuesta solo puede citar resultados existentes y usar cifras y nombres propios presentes en el último resultado o en la pregunta.

Como innovación destacable, el build MLX emplea cuantización mixta: las 112 capas lineales adaptadas por LoRA se fusionan en fp16 y se recuantizan a 8 bits, mientras el resto permanece en 4 bits, evitando que la recuantización destruya el ajuste. El autor verificó que el modelo fusionado coincide con el adaptador (misma pérdida de validación hasta tres decimales e idénticas puntuaciones en los prompts de validación).

## Capacidades

- Generación de texto conversacional en inglés con respuestas breves y directas.
- Decisión selectiva de invocar la herramienta `web_search`: busca para información cambiante (noticias, resultados deportivos, precios, términos como "latest") y responde sin buscar ante preguntas estables.
- Respuestas con citas numeradas (`[1]`, `[2]`) de los fragmentos consultados tras una búsqueda.
- Declaración explícita de ausencia de respuesta cuando la búsqueda falla, devuelve vacío o los resultados no contienen el dato, señalando dónde consultar en su lugar.
- Manejo de fuentes en desacuerdo: indica que difieren y cita ambas.
- Refinamiento de consultas de búsqueda cuando los primeros resultados son débiles.
- Seguimiento de instrucciones de formato estricto ("exactamente 3 viñetas", "menos de 20 palabras", "una frase"), traducción y reescritura.
- Descomposición de consultas múltiples, resúmenes con citas y seguimiento de preguntas elípticas.
- Soporte de tool calling / function calling para la herramienta de búsqueda web.
- Capacidades multilingües: no disponible (entrenado y declarado únicamente para inglés).

## Casos de uso

- Asistentes de atención al cliente con acceso a búsqueda: el modelo solo consulta cuando la pregunta requiere información actual (estado de un pedido, precios vigentes) y responde directamente ante preguntas de política estables, reduciendo llamadas innecesarias a APIs externas.
- Chatbots de noticias y resultados deportivos: ante consultas como "último resultado del partido", invoca `web_search`, responde en pocas palabras y cita los fragmentos utilizados, lo que facilita la verificación por parte del usuario.
- Agentes de investigación con pipeline de búsqueda propia: el modelo emite tool calls bien formadas (el autor reporta 100% en sus conjuntos de validación) y puede integrarse en orquestadores que ejecuten la búsqueda y devuelvan snippets al modelo.
- Sistemas que priorizan la honestidad factual: en dominios donde inventar una cifra es costoso (finanzas, salud informativa), el modelo declara cuando los resultados no contienen la respuesta en lugar de alucinar un dato.
- Despliegue en hardware de consumo: con GGUF Q4_K_M de 2,50 GB puede ejecutarse en portátiles con GPU modesta o en CPU mediante llama.cpp, Ollama o LM Studio, adecuado para prototipos y aplicaciones de escritorio.
- Aplicaciones en Apple Silicon: el build MLX de 3,07 GB está pensado para `mlx-lm` en Macs, permitiendo inferencia local con un consumo de memoria contenido.
- Generación de respuestas con formato estricto: útil en integraciones que requieren salidas acotadas (resúmenes de una frase, listas de tres elementos) para insertar en interfaces o notificaciones.

## Benchmarks y rendimiento

La model card incluye una evaluación propia con decodificación greedy sobre prompts de validación hechos a mano, en tres conjuntos de 44, 64 y 36 prompts. Los resultados publicados de forma explícita son:

| Metrica | Amethyst 2.5 Mini | Qwen3-4B base |
|---|---|---|
| Tool calls bien formadas (3 conjuntos, 44/64/36 prompts) | 100% | 60-88% |
| Busquedas innecesarias en preguntas estables | 0% | no disponible |
| Longitud media de respuesta llana (conjuntos 1 y 2) | 31-38 palabras | 45-66 palabras |
| Longitud media de respuesta llana (conjunto 3) | similar al base | similar al modelo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que los conjuntos de 64 y 36 prompts se solapan más con los temas de entrenamiento que el de 44, por lo que la columna de 44 prompts es la más representativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para GGUF Q4_K_M, 4,3 GB para GGUF Q8_0 y 3,1 GB para el build MLX mixto (más overhead del runtime y de la caché KV).
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU con 6-8 GB de VRAM o más puede alojar las variantes cuantizadas. El formato MLX está orientado a Apple Silicon (memoria unificada).
- GPU de consumo: sí, cabe en tarjetas con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) usando Q4_K_M, y en Macs con Apple Silicon mediante MLX.
- Opciones de despliegue: `mlx-lm` (MLX), llama.cpp, Ollama y LM Studio (GGUF). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formatos |
|---|---|---|---|---|---|
| Amethyst 2.5 Mini | 4,02B | no disponible (base: 32.768) | Chat + tool calling de busqueda web con citas y abstención | Apache 2.0 | MLX, GGUF |
| Qwen3-4B (base) | ~4B | 32.768 | Modelo generalista multilingüe | Apache 2.0 | safetensors, GGUF (comunidad) |
| Qwen3-4B-Instruct | ~4B | 32.768 | Chat generalista con soporte de tool calling | Apache 2.0 | safetensors, GGUF (comunidad) |

La comparación directa con alternativas especializadas en búsqueda web y abstención no está disponible en la información proporcionada. Frente a su base, Amethyst 2.5 Mini sacrifica multilingüismo y generalidad a cambio de un comportamiento más fiable en tool calling y concisión, según la evaluación del propio autor.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- Entrenado exclusivamente con datos sintéticos generados por destilación; los resultados de búsqueda del dataset son inventados, lo que puede limitar la robustez ante snippets reales con formatos, ruido o HTML no vistos.
- La evaluación se basa en conjuntos de validación pequeños (44, 64 y 36 prompts) hechos a mano por el autor, sin benchmarks estandar ni evaluación independiente; los conjuntos de 64 y 36 se solapan con los temas de entrenamiento.
- Riesgo de alucinación reducido por diseño en el escenario de búsqueda, pero no eliminado: fuera del flujo de tool calling no hay garantías específicas más allá de las del modelo base.
- El proceso de entrenamiento incluyó una pausa manual con reinicio en frío del optimizador, lo que puede afectar la reproducibilidad exacta del ajuste.
- El build MLX usa cuantización mixta no estándar; otras herramientas distintas de `mlx-lm` pueden no interpretarlo correctamente.
- Licencia Apache 2.0, que permite uso comercial, pero se heredan las condiciones y consideraciones del modelo base Qwen3-4B.
- La longitud de contexto efectiva no se documenta en la model card; conviene verificar el comportamiento con contextos largos antes de usarlo en producción.
- Sin datos publicados de latencia, throughput ni consumo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-2-5-mini
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint de ajuste mlx-community/Qwen3-4B-4bit: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Framework MLX: https://github.com/ml-explore/mlx
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos del autor.
