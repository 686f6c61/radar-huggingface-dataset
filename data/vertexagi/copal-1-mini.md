# VertexAGI/copal-1-mini

## Resumen

Copal 1 Mini es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre Gemma 3 4B IT, desarrollado por VertexAGI como proyecto de investigación independiente. Su propósito no es el chat general, sino el juicio en el uso de herramientas: decidir cuándo invocar una tool, seleccionar la correcta, interpretar su resultado y continuar el bucle de acción o responder en texto plano. Emplea una convención textual propia basada en bloques `<tool_call>` y `<tool_result>` en lugar de una API de function calling con esquema JSON.

El modelo parte de `google/gemma-3-4b-it` y se distribuye en cuantización 4-bit (group size 64) sobre el checkpoint QAT de `mlx-community/gemma-3-4b-it-qat-4bit`, con pesos fusionados con el adaptador y sin desquantizar. Está pensado para ejecución local en Apple Silicon mediante MLX y `mlx-lm`, con un tamaño de repositorio de 2,6 GB y 4.551.515.648 parámetros totales.

Es relevante ahora porque cubre un nicho concreto: agentes ligeros que corren en hardware de consumo y que necesitan una tasa alta de invocación correcta de herramientas sin depender de infraestructura en la nube. El autor reporta 11/12 usos apropiados de tools en tareas retenidas frente a 8/12 del modelo base, sin errores de parseo en ninguno de los dos brazos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3, transformer decoder-only denso |
| Parámetros totales | 4.551.515.648 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 4096 tokens) |
| Tipos de cuantización | 4-bit (group size 64), pesos ya cuantizados y fusionados con el adaptador |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (MLX); no se proporciona build GGUF |

## Arquitectura y entrenamiento

La base es Gemma 3 4B IT, un transformer decoder-only denso. El ajuste se realizó con LoRA de rango 8, dropout 0.0 y escala 20.0, fusionado posteriormente en los pesos base. Los módulos entrenados son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en 16 capas. El framework fue MLX / `mlx-lm` sobre Apple Silicon, con optimizador Adam, learning rate 1e-5 constante, longitud de secuencia de 4096 tokens y gradient checkpointing activado.

El dataset consta de 930 trayectorias agénticas depuradas de 1.152 generadas originalmente, destiladas desde `z-ai/glm-5.2` vía NVIDIA NIM API. Cada trayectoria es un episodio multi-turno completo con prompt de tarea, llamadas a tools, resultados simulados y respuesta final o llamadas adicionales. Las tareas abarcan 10 categorías: orquestación de API, seguimiento de estado, selección de tool, planificación multi-paso, clarificación ante peticiones incompletas, recuperación de errores, lectura-y-decisión, ejecución concisa, flujo de navegador y salida estructurada. Se generaron de forma programática sobre múltiples entidades para evitar sobreajuste a plantillas. El entrenamiento corrió 2.500 iteraciones con validación cada 50 pasos; los pesos publicados corresponden al checkpoint de la iteración 2.250, seleccionado por menor pérdida de validación (0.236), que se estabilizó con ruido a partir de la iteración 1.000 aproximadamente.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Decisión de invocación de herramientas: determina cuándo una petición requiere una tool y cuándo basta una respuesta directa.
- Selección de tool entre un conjunto disponible y construcción de argumentos en formato `{"name": ..., "arguments": {...}}`.
- Interpretación de resultados de herramientas y ramificación condicional sobre la salida (read-and-decide).
- Planificación multi-paso y ejecución de cadenas de llamadas hasta alcanzar una respuesta final.
- Recuperación de errores: manejo de resultados fallidos o incompletos dentro del bucle agéntico.
- Clarificación: reconocimiento de peticiones infraespecificadas antes de actuar.
- Salida estructurada y ejecución concisa dentro de las categorías entrenadas.
- No soporta visión, audio ni modo de razonamiento extendido más allá de lo heredado de Gemma 3 4B IT.
- No emplea tool calling estilo OpenAI con esquema JSON; requiere adaptación del harness al formato textual propio.

## Casos de uso

- Automatización de tareas locales en Apple Silicon: el modelo corre en 4-bit con 2,6 GB de pesos vía `mlx-lm`, lo que permite desplegar un agente de herramientas en un MacBook sin GPU dedicada, útil para prototipado rápido de bucles agénticos.
- Orquestación de APIs internas: con la convención `<tool_call>`/`<tool_result>`, se puede conectar a endpoints REST y encadenar consultas dependientes, usando las categorías de orquestación de API y seguimiento de estado presentes en el entrenamiento.
- Investigación sobre bucles agénticos: al ser un checkpoint pequeño y con formato explícito, resulta adecuado para estudiar tasas de invocación correcta, errores de parseo y comportamiento multi-paso en experimentos controlados con semilla fija.
- Asistentes de consulta a bases de datos: el modelo puede emitir llamadas a una tool de query, leer el resultado y decidir si necesita una segunda consulta o responder, aprovechando la categoría read-and-decide.
- Flujos de navegador simulado: las tareas de browser workflow del dataset permiten usar el modelo como planificador de acciones secuenciales sobre un entorno web instrumentado.
- Enrutamiento y selección de herramientas en pipelines: dado un catálogo de tools, el modelo elige la más adecuada y construye los argumentos, lo que sirve como capa de decisión antes de un executor determinista.
- Recuperación de errores en automatizaciones: ante un resultado de tool con fallo, el modelo puede reintentar con argumentos corregidos o escalar a una respuesta textual, gracias a la categoría de error recovery.
- Extracción con salida estructurada: para tareas de parsing de respuestas de tools hacia formatos definidos, dentro de los límites de la categoría structured output entrenada.

## Benchmarks y rendimiento

Evaluación del autor sobre 12 tareas agénticas retenidas, con entorno de tools simulado y la misma semilla para ambos brazos:

| Modelo | Uso apropiado de tools | Errores de parseo de tool-call |
|---|---|---|
| Gemma 3 4B IT (base) | 8 / 12 | 0 |
| Copal 1 Mini | 11 / 12 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB de pesos en 4-bit, más overhead de contexto y KV cache; el consumo real no está documentado.
- GPU recomendadas: no disponible para CUDA; el modelo está empaquetado para MLX y Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para los 2,6 GB de pesos más el contexto.
- Opciones de despliegue: `mlx-lm` sobre MLX; no se proporciona build GGUF, por lo que llama.cpp, Ollama y TGI no están soportados de forma nativa sin conversión adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Copal 1 Mini | 4.551.515.648 | no disponible | Tool calling agéntico, formato textual propio, 4-bit MLX | Gemma Terms of Use | Hugging Face, solo MLX |
| google/gemma-3-4b-it | 4B (aprox.) | no disponible | Chat general multimodal (base) | Gemma Terms of Use | Hugging Face, múltiples formatos |
| mlx-community/gemma-3-4b-it-qat-4bit | 4B (aprox.) | no disponible | Base cuantizada QAT para MLX | Gemma Terms of Use | Hugging Face, MLX |

La comparación con alternativas de tool calling de otros linajes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeño (930 ejemplos) y generado sintéticamente: el comportamiento puede ser inconsistente fuera de las 10 categorías representadas.
- Destilado de un único modelo profesor (`z-ai/glm-5.2`) sin revisión humana de todas las trayectorias; pueden persistir sesgos o errores de uso de tools heredados del profesor.
- Formato de tool call propio, no un esquema estandarizado: no es sustituto directo de APIs que esperan tool calls estilo OpenAI y exige adaptar el harness.
- Hereda las limitaciones generales y el corte de conocimiento de Gemma 3 4B IT.
- Solo inglés; no hay soporte multilingüe declarado.
- Licencia Gemma Terms of Use: conviene revisar las condiciones antes de uso comercial.
- El propio autor lo declara no apto para uso en producción, alta criticidad o seguridad.
- Es un checkpoint de primera generación dentro de una serie en desarrollo.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/copal-1-mini
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint QAT de partida: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
- MLX: https://github.com/ml-explore/mlx
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
