# zerolimites/Qwen3-0.6B-Code-Surgery-v2

## Resumen

Qwen3-0.6B-Code-Surgery-v2 es una edición directa de los pesos del modelo Qwen/Qwen3-0.6B orientada a generación de código políglota (Python, Bash/Linux, web HTML/CSS/JS y sistemas C/Rust/Go/SQL). Lo desarrolla el usuario zerolimites y se distribuye bajo licencia Apache 2.0. El modelo no se ha reentrenado de forma convencional: se ha intervenido sobre los pesos del checkpoint base mediante una combinación de proyección ortogonal de comentarios, inyección asociativa MEMIT en el espacio nulo y un pulido iterativo de margen en las capas 20 a 27.

El resultado declarado por el autor es un salto de precisión en un benchmark ejecutable propio de 28 problemas: del 46,43 % Pass@1 del modelo base a un 96,43 % Pass@1 tras la edición. Es relevante porque demuestra que técnicas de "weight surgery" (edición de pesos sin reentrenamiento completo) pueden producir mejoras sustanciales en un modelo pequeño de aproximadamente 750 millones de parámetros, abaratando el coste frente a un fine-tuning tradicional.

El modelo conserva la arquitectura y el tokenizador del Qwen3-0.6B original, con pesos en bfloat16 (1,51 GB) y versiones GGUF Q8_0 (804 MB) y F16 (1,51 GB). El repositorio ocupa 3,8 GB e incluye un Modelfile listo para Ollama y los datos de comparación de las cuatro etapas de edición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parametros totales | 751.632.384 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; hereda la del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | bfloat16 (safetensors), GGUF Q8_0 (8 bits), GGUF F16 (16 bits) |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B original: un transformer decoder-only con atención causal estándar, sin mezcla de expertos y sin mecanismos híbridos SSM. No se ha realizado un preentrenamiento ni un fine-tuning supervisado clásico; el autor aplica edición de pesos sobre el checkpoint base. La técnica declarada combina tres componentes: una proyección ortogonal de comentarios (`P_comm`), una inyección asociativa MEMIT en el espacio nulo y un pulido iterativo de margen restringido a las capas 20 a 27.

El proceso se documenta en cuatro etapas: el modelo base (13/28), la etapa 1 con `P_comm` (14/28), la versión editada v1 (24/28) y la versión final v2 (27/28). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que no se trata de un entrenamiento convencional sino de una intervención sobre pesos. El repositorio incluye `code_comparison_complete.json` con la comparación completa de las cuatro etapas sobre las 28 tareas.

## Capacidades

- Generación de código en Python, Linux/Bash, web (HTML/CSS/JS) y sistemas (C/Rust/Go/SQL).
- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento de código a nivel de tarea corta, orientado a problemas ejecutables.
- Soporte multilingüe limitado a inglés y portugués según la model card.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, visión ni audio.
- No se documenta decodificación especulativa ni atención lineal.

## Casos de uso

- Generación de scripts de automatización en Bash: el modelo está editado específicamente para Linux/Bash y alcanza 7/7 en la categoría LINUX del benchmark del autor, lo que lo hace adecuado para producir scripts de despliegue, tareas cron y pipelines de shell.
- Completado de funciones Python en editores: con 7/7 en la categoría PY, puede usarse como asistente de autocompletado local en entornos con recursos limitados, dado su tamaño de 0,75 B parámetros.
- Generación de componentes web: para producir fragmentos HTML/CSS/JS en prototipado rápido, con 6/7 en la categoría WEB del benchmark declarado.
- Ejercicios y ejemplos de sistemas en C, Rust, Go y SQL: útil en entornos educativos o de documentación técnica donde se necesitan snippets cortos y verificables.
- Despliegue en local con Ollama: el repositorio incluye un Modelfile listo para importar, lo que permite ejecutar el modelo en portátiles y equipos sin GPU dedicada.
- Evaluación de técnicas de edición de pesos: investigadores pueden reproducir la comparación de las cuatro etapas usando `code_comparison_complete.json` para estudiar el efecto de MEMIT y del pulido de margen en modelos pequeños.
- Filtrado y clasificación de código en pipelines de CI: al ser un modelo pequeño y rápido de cargar, puede integrarse como paso de verificación de snippets antes de tests automáticos.

## Benchmarks y rendimiento

El autor publica un benchmark ejecutable propio de 28 problemas, no benchmarks estándar como MMLU, HumanEval o GSM8K.

| Modelo | Pass@1 global | Python | Linux/Bash | Web | Sistemas |
|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | 46,43 % (13/28) | 14,29 % (1/7) | 57,14 % (4/7) | 57,14 % (4/7) | 57,14 % (4/7) |
| Qwen3-0.6B Stage 1 (`P_comm`) | 50,00 % (14/28) | 28,57 % (2/7) | 57,14 % (4/7) | 57,14 % (4/7) | 57,14 % (4/7) |
| Qwen3-0.6B Editado v1 | 85,71 % (24/28) | 71,43 % (5/7) | 100,00 % (7/7) | 85,71 % (6/7) | 85,71 % (6/7) |
| Qwen3-0.6B-Code-Surgery-v2 (final) | 96,43 % (27/28) | 100,00 % (7/7) | 100,00 % (7/7) | 85,71 % (6/7) | 100,00 % (7/7) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en bfloat16/F16 y unos 0,8 GB en GGUF Q8_0, más overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (GGUF Q8_0/F16), Ollama (Modelfile incluido), transformers con safetensors, vLLM y TGI (compatibilidad con el formato Hugging Face).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Code-Surgery-v2 | 751.632.384 | no disponible | Apache 2.0 | safetensors, GGUF | 96,43 % Pass@1 en benchmark propio de 28 tareas |
| Qwen/Qwen3-0.6B (base) | ~0,6 B | no disponible | Apache 2.0 | safetensors, GGUF | 46,43 % Pass@1 en el mismo benchmark |
| Qwen3-0.6B Editado v1 | ~0,6 B | no disponible | Apache 2.0 | no especificado | 85,71 % Pass@1, etapa intermedia del mismo autor |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos pequeños de código (por ejemplo CodeGemma o StarCoder) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio autor.

## Limitaciones y advertencias

- Los resultados de rendimiento proceden de un benchmark propio de 28 problemas, no de suites estándar; la extrapolación a otros conjuntos de código no está validada.
- El modelo base Qwen3-0.6B es muy pequeño; la edición de pesos mejora tareas concretas, pero puede degradar capacidades generales no evaluadas.
- Idiomas soportados declarados: solo inglés y portugués; el castellano no está listado.
- Riesgo de alucinación en APIs, librerías y sintaxis no cubiertas por el benchmark de edición.
- La edición de pesos puede introducir sesgos o artefactos no documentados; no se reportan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación externa de la comunidad.
- No se documenta la longitud de contexto efectiva tras la edición; conviene verificar el comportamiento en prompts largos antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zerolimites/Qwen3-0.6B-Code-Surgery-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web proporcionada.
