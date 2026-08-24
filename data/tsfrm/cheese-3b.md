# tsfrm/cheese-3b

## Resumen

cheese-3b es un fine-tune del modelo Llama-3.2-3B-Instruct, desarrollado por el usuario tsfrm, que transforma cualquier frase introducida por el usuario en una variante con juegos de palabras sobre quesos. Por ejemplo, "just do it" se convierte en "just brie it" o "good morning everyone" en "gouda morning everyone". El proyecto es una demostración de cómo un pequeño ajuste con LoRA puede provocar un cambio de comportamiento muy específico y estrecho sobre un modelo base, entrenándose en un solo día en un ordenador portátil.

El modelo se basa en el checkpoint de MLX de Llama 3.2 3B Instruct cuantizado a 4 bits, sobre el que se aplica un adapter LoRA (r=32, alpha=64) en las últimas 16 de las 28 capas. Se entrenó con aproximadamente 5.000 pares de frases y sus correspondientes versiones "con queso", más 300 pares sintéticos diseñados para evitar el comportamiento de eco cuando no hay una palabra con potencial lácteo obvio. El resultado es un generador de humor lingüístico muy específico, no un modelo de propósito general.

La relevancia de cheese-3b no reside en sus capacidades generales, sino en su demostración práctica: un entrenamiento LoRA sencillo sobre un modelo de 3B en hardware de consumo (Apple M4, 16 GB) puede lograr una transformación de texto consistente y divertida. Es un ejemplo útil para quienes quieren aprender a hacer fine-tuning con MLX en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B Instruct (transformador) con adapter LoRA |
| Parametros totales | 502.139.904 (adapter LoRA; el base completo tiene 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de Llama 3.2 3B Instruct, probablemente 128k tokens) |
| Tipos de cuantizacion | base en 4-bit (MLX); el adapter es de precision completa |
| Idiomas soportados | no disponibles (heredados de Llama 3.2, que soporta multilingue, pero no se especifica) |
| Licencia | llama3.2 (Meta Llama 3.2 Community License) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del checkpoint `mlx-community/Llama-3.2-3B-Instruct-4bit`. La arquitectura subyacente es un transformer decoder-only estándar de Llama 3.2 con 3.000 millones de parámetros, pero el adapter LoRA añade solo unos 502 millones de parámetros entrenables (r=32, alpha=64) aplicados a las últimas 16 de las 28 capas. El entrenamiento se realizó con MLX (`mlx_lm.lora`) en un Apple M4 con 16 GB de RAM.

El dataset consta de aproximadamente 5.000 pares de frases y su correspondiente transformación con juegos de palabras de queso (30 variedades de queso), más 300 pares sintéticos añadidos en la tercera ronda de entrenamiento. El proceso se dividió en 4 rondas con un total de ~1.750 pasos y una tasa de aprendizaje que decayó de 2e-4 a 5e-5. El objetivo principal fue eliminar el "eco" (devolver la entrada sin transformar) cuando la frase no contiene una palabra fácil de sustituir por un queso. Tras añadir 262 transformaciones manuales de texto arbitrario, el modelo aprendió a transformar también frases sin contenido lácteo obvio.

## Capacidades

- Transformación de texto en frases con parodias de queso (be→brie, good→gouda, etc.) de forma consistente.
- Manejo de frases hechas y expresiones idiomáticas con alta calidad de sustitución fonética.
- Transformación de frases arbitrarias sin contenido lácteo evidente, aunque con menor calidad en esos casos.
- Soporte de chat mediante el template de chat de Llama (conversaciones multi-turno).
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni otras modalidades.
- Multilingüe: hereda el tokenizador y el vocabulario de Llama 3.2, pero el entrenamiento se ha hecho solo con datos en inglés.

## Casos de uso

- **Entretenimiento y humor generativo**: el modelo es ideal para generar respuestas ingeniosas en juegos de palabras sobre quesos en chats o redes sociales. Se puede integrar en bots de Telegram o Discord que respondan a mensajes con una versión "quesificada".
- **Generación de contenido creativo**: para equipos de marketing o copywriting que busquen eslóganes o frases publicitarias con juegos de palabras de queso (ej. "gouda morning" para una campaña de desayunos).
- **Demo educativa de fine-tuning LoRA**: es un ejemplo perfecto para talleres o tutoriales sobre cómo entrenar un adapter LoRA con MLX en hardware de consumo, mostrando el flujo completo desde datos hasta inferencia.
- **Herramienta de brainstorming**: un asistente que propone variaciones de frases conocidas con terminología de queso, útil para generar ideas de nombres de productos o campañas.
- **Pruebas de calidad de transformación de texto**: puede servir como caso de estudio para evaluar cómo un modelo pequeño puede aprender una tarea de transformación de dominio estrecho sin perder la estructura gramatical.
- **Integración en pipelines de generación de contenido**: mediante la API de MLX, se puede integrar en un pipeline que reciba frases de un usuario y devuelva la versión con queso, por ejemplo en una extensión de navegador o una herramienta de línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido evaluado en tareas estándar como MMLU, HumanEval o GSM8K, ya que su propósito es puramente generativo y específico del dominio del queso.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado a 4 bits, el modelo base ocupa aproximadamente 1,8 GB (según el tamaño del repositorio), más el adapter LoRA. En una GPU con 6-8 GB de VRAM sería suficiente para inferencia en FP16.
- GPU recomendadas: funciona sin problemas en Apple Silicon (M4, 16 GB) como se indica en el entrenamiento; también puede ejecutarse en GPUs NVIDIA con 8 GB o más (RTX 3060, 4070, etc.) usando MLX o convirtiendo los pesos a otros formatos.
- Si cabe en consumer GPU: sí, en GPUs con 6 GB o más (ej. RTX 3060 12 GB, RTX 4060 Ti 16 GB). En CPU pura sería lento pero posible con cuantización.
- Opciones de despliegue: MLX (recomendado), conversión a GGUF para llama.cpp/Ollama, o a formato HuggingFace (safetensors) para vLLM/TGI. El modelo se distribuye en MLX, por lo que es nativo para Apple Silicon.
- Latencia y throughput: no disponibles; para un modelo de 3B en 4-bit en una GPU moderna se esperan latencias de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| cheese-3b (este) | 3B + LoRA 502M | no disp. | llama3.2 | Transformación de texto en parénticos de queso |
| Llama-3.2-3B-Instruct | 3B | 128k | llama3.2 | Chat general, instrucciones, multilingüe |
| Qwen2.5-3B-Instruct | 3B | 32k | Apache 2.0 | Chat general, código, multilingüe |

cheese-3b no es comparable en rendimiento general con los modelos de chat estándar; es un fine-tune de nicho. La comparación con otros fine-tunes de LoRA no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado solo en inglés y con datos de parénticos de queso, por lo que no es útil para tareas generales de lenguaje.
- Riesgo de alucinación: en frases sin potencial lácteo, el modelo puede devolver la frase sin modificar o hacer sustituciones forzadas y poco naturales (p. ej., "odds→goudas").
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; el modelo base soporta 128k, pero el entrenamiento LoRA puede no haber preservado esa capacidad completa.
- Restricciones de licencia: el modelo se distribuye bajo la licencia Llama 3.2 Community License de Meta, que permite uso comercial pero con restricciones (por ejemplo, no usar para mejorar otros modelos de lenguaje, y no para usuarios con más de 700 millones de usuarios activos mensuales).
- Comportamiento en producción: el autor indica que a veces genera texto extra después de la paréntesis (p. ej., "netflix and chill, wine and cheese for two") en lugar de detenerse, lo que puede requerir un postprocesado para cortar la generación.
- No es un modelo de propósito general: no debe usarse para tareas de generación de texto, razonamiento o código fuera de su dominio.

## Enlaces

- Modelo en HuggingFace: [tsfrm/cheese-3b](https://huggingface.co/tsfrm/cheese-3b)
- Modelo base: [mlx-community/Llama-3.2-3B-Instruct-4bit](https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct-4bit)
- Documentación de MLX: [mlx-lm](https://github.com/ml-explore/mlx-examples/tree/main/lora) (repositorio de ejemplo)
