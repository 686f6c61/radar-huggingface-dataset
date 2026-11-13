# WithinUsAI/Opus4.7-GODs.Ghost.Codex-4B.GGuF

## Resumen

Opus4.7-GODs.Ghost.Codex-4B.GGuF es un modelo de lenguaje especializado en código, publicado por WithinUsAI en formato GGUF para inferencia local mediante llama.cpp y runtimes compatibles. Se construye como un ajuste fino (destilación de patrones de razonamiento) sobre el modelo base Qwen/Qwen3.5-4B, con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones). El repositorio ocupa 10,3 GB, lo que refleja la presencia de múltiples cuantizaciones en el mismo espacio.

El modelo se orienta a flujos de trabajo de desarrollo: generación de código en lenguajes como Python, JavaScript o C++, depuración, refactorización y diseño de algoritmos, además de cadenas de razonamiento estructurado cuando se le solicita explícitamente. Su propuesta de valor es ofrecer capacidades de asistencia a programación en un tamaño que cabe en hardware de consumo, sin necesidad de infraestructura de centro de datos.

Es relevante en el contexto actual de modelos locales porque combina un footprint reducido (~4B) con un enfoque declarado en calidad de código y razonamiento paso a paso. No obstante, la información publicada es escasa: no hay resultados de benchmarks, la licencia no está declarada de forma explícita y el modelo solo declara soporte de inglés. La model card incluye afirmaciones de marketing ("Opus4.7", "GODs.Ghost") que no deben interpretarse como equivalencia con sistemas propietarios de Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (no se declara MoE) |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de uso de llama.cpp emplea `--ctx-size 8192` |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q5_K_M, Q8_0 mencionados en la model card); `imatrix` en tags |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (la model card sugiere verificar herencia del modelo base) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original es safetensors |
| Tamano del repo | 10,3 GB |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5-4B, un transformer decoder-only; el autor no detalla modificaciones estructurales propias. El modelo se presenta como un ajuste fino orientado a código y razonamiento, con el tag `distilled`, lo que sugiere que parte del entrenamiento busca imitar trazas de razonamiento de modelos mayores. La model card no especifica número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Los datasets declarados en los metadatos son mayoritariamente colecciones de razonamiento y código generadas a partir de interacciones con modelos tipo Claude Opus (por ejemplo, `Roman1111111/claude-opus-4.6-10000x`, `Crownelius/Opus-4.6-Reasoning-3300x`, `TeichAI/Claude-Opus-4.6-Reasoning-887x`), junto con datos de código (`WithinUsAI/Python_GOD_Coder_50k`, `m-a-p/Code-Feedback`, `peteromallet/my-personal-codex-data`) y un dataset de instrucciones multimodales (`HuggingFaceH4/llava-instruct-mix-vsft`). La inclusión de este último no implica que el modelo resultante sea multimodal, ya que los tags y la pipeline declarada son de generación de texto. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en múltiples lenguajes (Python, JavaScript, C++, entre otros, según la model card).
- Depuración y corrección de errores en fragmentos de código.
- Refactorización y optimización de funciones.
- Diseño de algoritmos y explicación de lógica paso a paso.
- Razonamiento estructurado cuando se le pide explícitamente ("explain your logic").
- Explicación de código con fines didácticos.
- Instrucciones conversacionales de un solo turno o multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible de forma declarada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible de forma declarada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse con llama.cpp en un equipo de consumo y responder a peticiones de generación y corrección de código sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Integración en IDE con IA (Cursor, Cline y similares): su tamaño de ~4B y su formato GGUF permiten servirlo como backend local para autocompletado y explicación de fragmentos, reduciendo la latencia de red.
- Generación de scripts de automatización: útil para producir scripts de shell, Python o JavaScript a partir de descripciones en lenguaje natural, con la ventaja de que el usuario puede inspeccionar y ajustar el resultado en su propia máquina.
- Enseñanza y explicación de código: el modelo está entrenado para producir razonamiento paso a paso, por lo que puede emplearse en entornos educativos para desglosar algoritmos o explicar por qué falla un fragmento.
- Refactorización en pipelines de revisión: puede integrarse en un paso previo a la revisión humana para proponer simplificaciones de funciones, aunque requerirá validación manual por sus limitaciones de tamaño.
- Prototipado rápido en investigación: al ser un modelo pequeño y cuantizable, sirve como banco de pruebas para experimentos de prompting, RAG o envoltorios de tool calling antes de escalar a modelos mayores.
- Despliegue en entornos con hardware restringido: con Q4_K_M requiere aproximadamente 3-4 GB de RAM, lo que permite ejecutarlo en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según la model card):
  - Q4_K_M: ~3-4 GB.
  - Q5_K_M: ~4-5 GB.
  - Q8_0: ~6-8 GB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabría en GPUs de consumo con al menos 8 GB de VRAM en cuantizaciones Q4/Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 4070), aunque el autor no lo confirma.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6-8 GB de VRAM para cuantizaciones bajas; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (principal, con `llama-cli`), LM Studio y cualquier runtime compatible con GGUF. No se declara soporte explícito para vLLM o TGI, que habitualmente requieren safetensors.
- Latencia y throughput estimados: no disponibles.

Parámetros de generación recomendados por el autor: temperatura 0,6-0,8, top-p 0,9-1,0, repeat penalty 1,0-1,1, contexto de ejemplo 8192.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Opus4.7-GODs.Ghost.Codex-4B | ~4,2B | No disponible (ejemplo 8192) | GGUF | No disponible | Especializado en código, solo inglés |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible en la información | Safetensors | Según Qwen (no confirmado aquí) | Modelo base generalista |
| Alternativas de ~4B para código | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un modelo de ~4B, la profundidad de razonamiento y la corrección en tareas complejas serán limitadas en comparación con modelos de mayor tamaño.
- Riesgo de alucinación en APIs, librerías y firmas de funciones; el código generado debe validarse siempre antes de usarse en producción.
- La licencia no está declarada de forma explícita; la model card indica que probablemente herede la del modelo base, pero recomienda verificarlo antes de un uso comercial. No debe asumirse uso comercial libre.
- El nombre y el marketing del modelo ("Opus4.7", "GODs.Ghost") pueden inducir a confusión sobre su origen y capacidades; no es un modelo de Anthropic ni una destilación oficial.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- El entrenamiento con datos derivados de interacciones con modelos propietarios puede plantear dudas sobre los términos de uso de dichos datos.
- Sin benchmarks publicados, no es posible verificar las afirmaciones de calidad de la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/WithinUsAI/Opus4.7-GODs.Ghost.Codex-4B.GGuF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WithinUsAI/Python_GOD_Coder_50k: https://huggingface.co/datasets/WithinUsAI/Python_GOD_Coder_50k
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Crownelius/Opus-4.6-Reasoning-3300x: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-3300x
- Dataset TeichAI/Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset peteromallet/my-personal-codex-data: https://huggingface.co/datasets/peteromallet/my-personal-codex-data
- Dataset misterkerns/my-personal-claude-code-data: https://huggingface.co/datasets/misterkerns/my-personal-claude-code-data
- Dataset HuggingFaceH4/llava-instruct-mix-vsft: https://huggingface.co/datasets/HuggingFaceH4/llava-instruct-mix-vsft
- Dataset m-a-p/Code-Feedback: https://huggingface.co/datasets/m-a-p/Code-Feedback
- Dataset peteromallet/dataclaw-peteromallet: https://huggingface.co/datasets/peteromallet/dataclaw-peteromallet
- Dataset Crownelius/Opus-4.6-Reasoning-2100x-formatted: https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-2100x-formatted
- llama.cpp: https://github.com/ggml-org/llama.cpp
