# yisuiban/git-ai-commit-sft

## Resumen

`yisuiban/git-ai-commit-sft` es un adaptador LoRA de 11,5 millones de parámetros entrenado sobre el modelo base `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`, una versión cuantizada a 4 bits del Qwen2.5-Coder de 7B. Su propósito es generar mensajes de commit en chino siguiendo la especificación Conventional Commits a partir de diffs de Git. El adaptador está diseñado para integrarse en el plugin de IntelliJ `git-ai-commit`, que utiliza LLMs para automatizar la redacción de mensajes de commit.

El modelo se entrenó con 548 mensajes de commit reales de dos repositorios (un backend Java y un microservicio Go), procesados con el mismo pipeline de filtrado y construcción de prompts que usa el plugin en producción. El resultado es una mejora significativa en la adherencia a Conventional Commits (del 96% al 100%) y en la similitud con los mensajes de referencia (de 0,339 a 0,546), además de una reducción de la longitud media de salida de 51 a 27 caracteres.

La relevancia de este adaptador radica en que aborda un problema concreto y frecuente en el desarrollo de software: la generación de mensajes de commit consistentes y descriptivos. Al estar especializado en chino y en el formato Conventional Commits, ofrece una solución más precisa que un modelo generalista, con un coste de inferencia reducido gracias a la cuantización 4-bit del modelo base y al pequeño tamaño del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct-4bit (transformer decoder) |
| Parametros totales | 11,5 millones (adaptador LoRA); el modelo base tiene 7 mil millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el adaptador no modifica el contexto del modelo base; el entrenamiento usó secuencias de hasta 4096 tokens) |
| Tipos de cuantizacion | El modelo base está cuantizado a 4 bits; el adaptador se distribuye en formato MLX (safetensors) sin cuantización adicional |
| Idiomas soportados | Chino (para mensajes de commit); el modelo base es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador MLX) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo Qwen2.5-Coder-7B-Instruct-4bit, que ya incorpora atención multi-cabeza estándar y mecanismos de instrucción. El fine-tuning se realizó con LoRA (Low-Rank Adaptation) con rango 8 y 16 capas, lo que añade 11,5 millones de parámetros entrenables sobre los 7 mil millones del modelo base. El entrenamiento se ejecutó con MLX LoRA (librería `mlx-lm` 0.31.3) en un Apple M1 Max con 64 GB de memoria unificada, usando el optimizador Adam con tasa de aprendizaje 1e-5, batch efectivo de 8 (batch 1 con acumulación de gradientes de 8) y 250 pasos (~4 épocas sobre 473 muestras de entrenamiento). La longitud máxima de secuencia fue de 4096 tokens y el tiempo total de entrenamiento fue de aproximadamente 20 minutos.

Los datos de entrenamiento consisten en 548 pares de (diff de Git, mensaje de commit humano) extraídos de dos repositorios reales, filtrados para incluir únicamente mensajes en chino que siguen el formato Conventional Commits. Cada diff se procesó con el pipeline exacto del plugin `git-ai-commit` (GitDiffFilter + PromptBuilder), lo que garantiza que el adaptador aprende a partir de entradas idénticas a las que recibirá en producción.

## Capacidades

- Generación de mensajes de commit en chino a partir de diffs de Git, siguiendo la especificación Conventional Commits (tipos como `feat`, `fix`, `refactor`, etc.).
- Producción de mensajes de una sola línea (tasa del 100% en evaluación).
- Adherencia estricta al formato Conventional Commits (tasa del 100% tras el fine-tuning).
- Generación de mensajes cortos y concisos (longitud media de 27 caracteres).
- Integración directa con el plugin de IntelliJ `git-ai-commit` mediante el formato MLX.
- Compatibilidad con el ecosistema MLX de Apple Silicon y exportación a Ollama (según la documentación del repositorio de entrenamiento).
- No se reportan capacidades adicionales como tool calling, razonamiento multi-paso o soporte de visión.

## Casos de uso

- **Automatización de commits en repositorios Java**: el adaptador está entrenado con diffs de un backend Java, por lo que es especialmente eficaz para generar mensajes de commit en proyectos Spring Boot, Maven o Gradle. Se puede invocar desde un hook de Git o desde el plugin de IntelliJ para que cada commit tenga un mensaje descriptivo sin intervención manual.
- **Automatización de commits en microservicios Go**: al haber sido entrenado también con diffs de un microservicio Go, funciona bien en proyectos de este lenguaje, cubriendo patrones comunes como cambios en handlers, modelos o configuraciones.
- **Integración en plugins de IDE**: el caso de uso principal es el plugin `git-ai-commit` para IntelliJ, que carga el adaptador y lo usa para sugerir mensajes de commit en tiempo real mientras el desarrollador revisa los cambios.
- **Hooks de Git para equipos con convenciones estrictas**: si un equipo exige mensajes de commit en chino y formato Conventional Commits, este adaptador puede integrarse en un hook `prepare-commit-msg` para validar o generar automáticamente el mensaje, reduciendo errores humanos.
- **Generación de mensajes para CI/CD**: en pipelines de integración continua, se puede usar el adaptador para generar automáticamente mensajes de commit a partir de diffs de pull requests, facilitando la generación de changelogs.
- **Asistente para desarrolladores que trabajan con código chino**: para proyectos con documentación o comentarios en chino, el adaptador genera mensajes coherentes con el idioma del equipo, mejorando la legibilidad del historial de commits.

## Benchmarks y rendimiento

La model card proporciona una tabla de evaluación comparando el comportamiento del modelo base (antes) y el adaptador fine-tuneado (después) sobre el conjunto de validación:

| Metrica | Antes | Despues |
|---|---|---|
| Tasa de Conventional Commits | 96% | 100% |
| Tasa de mensajes en chino | 100% | 100% |
| Tasa de mensajes de una sola linea | 100% | 100% |
| Similitud media con la referencia | 0,339 | 0,546 |
| Longitud media de salida | 51 caracteres | 27 caracteres |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que su evaluación se centra exclusivamente en la tarea de generación de mensajes de commit.

## Requisitos de hardware

- El adaptador está diseñado para el ecosistema MLX de Apple Silicon. Se entrenó en un Apple M1 Max con 64 GB de memoria unificada, por lo que la inferencia puede ejecutarse en cualquier Mac con chip M1 o posterior con al menos 16 GB de memoria (el modelo base 4-bit ocupa aproximadamente 4 GB).
- Para GPU de NVIDIA no hay soporte directo de MLX; sería necesario exportar el modelo a otro formato (por ejemplo, GGUF para llama.cpp o safetensors para vLLM) mediante el pipeline de exportación mencionado en el repositorio de entrenamiento.
- Opciones de despliegue: `mlx-lm` (CLI y Python), exportación a Ollama (según la documentación del repositorio de entrenamiento).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del adaptador (11,5 M parámetros) y el modelo base 4-bit, la inferencia en un M1 Max debería ser de decenas de milisegundos por muestra, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

El adaptador se compara directamente con su modelo base sin fine-tuning (Qwen2.5-Coder-7B-Instruct-4bit), que es la alternativa natural para la misma tarea. La tabla de evaluación anterior muestra la mejora obtenida. No se dispone de información sobre otros adaptadores específicos para generación de mensajes de commit en chino.

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| yisuiban/git-ai-commit-sft | 11,5 M (adaptador) + 7B (base) | no disponible | Apache-2.0 | Especializado en commits en chino, formato MLX |
| Qwen2.5-Coder-7B-Instruct-4bit | 7B | no disponible | Apache-2.0 | Modelo base sin fine-tuning, genera mensajes menos consistentes (96% Conventional Commits, similitud 0,339) |
| Otras herramientas (aicommits, git-ai-commit) | n/a | n/a | n/a | Son aplicaciones que usan LLMs generalistas, no modelos fine-tuneados específicos |

## Limitaciones y advertencias

- El adaptador se entrenó con solo 548 muestras de dos repositorios (Java y Go), por lo que su generalización a otros lenguajes, frameworks o estilos de código puede ser limitada.
- Solo genera mensajes de commit en chino; no soporta otros idiomas para esta tarea.
- La salida está restringida a una sola línea y al formato Conventional Commits; no es adecuado para mensajes largos o con cuerpo.
- El adaptador depende del modelo base cuantizado a 4 bits (`mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`); si se usa con otra cuantización, el comportamiento puede variar.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder también está bajo Apache-2.0, por lo que no hay restricciones adicionales.
- No se han publicado evaluaciones sobre sesgos o alucinaciones específicas de este adaptador. Como cualquier modelo generativo, puede producir mensajes que no reflejen con precisión los cambios del diff si el diff es ambiguo o inusual.
- Para producción, se recomienda validar los mensajes generados, especialmente en repositorios con convenciones de commit personalizadas más allá de Conventional Commits.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/yisuiban/git-ai-commit-sft)
- [Modelo base: mlx-community/Qwen2.5-Coder-7B-Instruct-4bit](https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-4bit)
- No se proporcionan enlaces oficiales a papers, blogs o demos en la información disponible. El enlace al repositorio de entrenamiento citado en la model card (`https://github.com/your-org/git-ai-commit-sft`) es un placeholder y no es accesible.
