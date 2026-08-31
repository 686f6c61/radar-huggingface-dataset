# VertexAGI/amethyst-1-mini

## Resumen

Amethyst 1 Mini es un modelo de lenguaje conversacional de propósito general, desarrollado por VertexAGI (proyecto independiente de investigación) como primera validación de un pipeline de destilación de conocimiento, ajuste fino y evaluación sobre hardware de consumo. Se basa en **Gemma 3 4B IT** de Google, sobre el que se aplicó un ajuste fino LoRA (rank 8) utilizando el framework MLX en Apple Silicon, con un conjunto de datos sintético de 1.122 pares instrucción-respuesta destilados del modelo **Nemotron-3-Super-120B-A12B** de NVIDIA.

El modelo tiene 4.551.515.648 parámetros (~4,55 B), arquitectura transformer densa decoder-only, y se distribuye en formato fp16 (safetensors) y GGUF Q4_K_M. Está pensado para experimentación, investigación de pipelines de destilación a pequeña escala y despliegues de aficionados, no para uso en producción o escenarios críticos. Su relevancia radica en demostrar que es posible obtener un asistente conversacional razonable con un dataset reducido y recursos de entrenamiento modestos, sirviendo como punto de partida para futuros modelos de la familia Amethyst.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3, transformer denso decoder-only |
| Parametros totales | 4.551.515.648 (~4,55 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Gemma 3 4B IT, no especificada en la documentacion) |
| Tipos de cuantizacion | fp16 (safetensors) y GGUF Q4_K_M |
| Idiomas soportados | Ingles |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (fp16) y GGUF |

## Arquitectura y entrenamiento

Amethyst 1 Mini parte del checkpoint **google/gemma-3-4b-it** y fue ajustado con LoRA de rango 8 (escala 20.0, dropout 0.0) sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de 16 capas. El entrenamiento se realizó con MLX (`mlx-lm`) en Apple Silicon, con optimizador Adam (tasa de aprendizaje 1e-5 constante), longitud de secuencia de 1024 tokens, gradient checkpointing y 3.246 iteraciones totales. El checkpoint liberado corresponde a la iteración 2.600, seleccionada por tener la menor pérdida de validación (1.513); las iteraciones posteriores mostraron sobreajuste (la pérdida subió a ~1.95).

El dataset de entrenamiento consta de 1.122 pares (1.082 train / 40 validación) generados sintéticamente por destilación desde **NVIDIA Nemotron-3-Super-120B-A12B** (MoE de 120B parámetros, ~12B activos) vía OpenRouter. Las categorías cubren explicación y conceptos erróneos, razonamiento y matemáticas, generación de código, extracción y salida estructurada, planificación, roleplay y escritura creativa, traducción, clasificación de sentimiento y lluvia de ideas. El adaptador LoRA se fusionó en los pesos base y se de-cuantizó a fp16 para esta versión, permitiendo su carga directa con `transformers`.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés.
- Razonamiento básico y matemático, incluyendo problemas de lógica y aritmética.
- Generación de código en varios lenguajes (el dataset incluye ejemplos de programación).
- Extracción de información y generación de salidas estructuradas (JSON, etc.).
- Planificación de tareas y descomposición de problemas en pasos.
- Roleplay, escritura creativa y narración de historias.
- Traducción entre idiomas (aunque el modelo está entrenado principalmente en inglés, puede manejar pares de traducción simples).
- Clasificación de sentimiento y análisis de opiniones.
- Lluvia de ideas y generación de ideas para proyectos o contenidos.
- No se documenta soporte para tool calling, function calling o capacidades multimodales en esta versión (aunque el tag `image-text-to-text` aparece en HuggingFace, la model card no lo menciona explícitamente).

## Casos de uso

- **Asistente conversacional para prototipos**: dado su tamaño reducido y su formato GGUF, puede integrarse en aplicaciones de chat locales (Ollama, LM Studio) para validar flujos de conversación antes de escalar a modelos mayores.
- **Investigación en destilación de conocimiento**: sirve como referencia para estudiar cómo un dataset pequeño destilado de un modelo grande afecta al rendimiento de un modelo base de 4B, permitiendo comparar con el Gemma 3 4B IT original.
- **Generación de código en entornos educativos**: puede ayudar a estudiantes a generar ejemplos de código, explicar algoritmos o depurar fragmentos simples, siempre que se supervise la salida.
- **Extracción de datos estructurados en tareas de bajo volumen**: para clasificar sentimientos, extraer entidades o convertir texto en JSON en aplicaciones internas con requisitos de latencia bajos y sin datos sensibles.
- **Escritura creativa y roleplay**: útil para generar borradores de historias, diálogos o personajes en proyectos de ocio o juegos de rol.
- **Traducción asistida**: para traducir frases cortas o párrafos entre inglés y otros idiomas cuando no se requiere precisión profesional.
- **Pruebas de integración en pipelines de ML**: al ser compatible con `transformers` y GGUF, puede usarse como modelo de prueba en pipelines de CI/CD para verificar la compatibilidad de librerías o la inferencia en diferentes runtimes.
- **Educación y divulgación**: como ejemplo de fine-tuning con LoRA y destilación en hardware de consumo, es un recurso didáctico para cursos de IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. La única métrica reportada es la pérdida de validación durante el entrenamiento (1.513 en la iteración 2.600), que no es comparable con benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - fp16 (safetensors): ~9,1 GB solo para los pesos (4.55 B × 2 bytes), más overhead de activaciones y KV cache. Se recomienda al menos 12 GB de VRAM.
  - GGUF Q4_K_M: ~2,6 GB para los pesos (4.55 B × 0,5625 bytes), más overhead. Puede caber en GPUs con 4-6 GB de VRAM.
- **GPU recomendadas**:
  - Para fp16: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A10, A100.
  - Para GGUF Q4_K_M: RTX 3050 8 GB, RTX 4060, GTX 1660 Super (con limitaciones), o incluso CPUs modernas con suficiente RAM.
  - Al ser entrenado en Apple Silicon, también es posible ejecutarlo en Mac con MLX (aunque no se aportan datos de rendimiento).
- **Opciones de despliegue**:
  - `transformers` para fp16.
  - `llama.cpp` / Ollama / LM Studio para GGUF.
  - Compatible con `text-generation-inference` según los tags de HuggingFace.
  - No se menciona soporte explícito para vLLM, aunque al ser un modelo estándar de transformers es probable que funcione.
- **Latencia y throughput**: no se proporcionan datos. Para un modelo de 4B en fp16, se espera una latencia de decodificación de ~10-30 ms/token en una RTX 4090, pero esto es una estimación general no verificada para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos publicados de benchmarks comparativos para Amethyst 1 Mini. Al ser un fine-tune de Gemma 3 4B IT, la comparación natural sería con su modelo base y con otros modelos de ~4B como Llama 3.2 3B o Phi-3.5-mini, pero no hay información en la documentación que permita una comparación cuantitativa rigurosa. La siguiente tabla resume las características conocidas:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amethyst 1 Mini | 4,55 B | No especificado | Gemma | safetensors, GGUF | Fine-tune LoRA, dataset de 1.122 ejemplos |
| Gemma 3 4B IT (base) | ~4 B | No especificado en la fuente | Gemma | safetensors, GGUF | Modelo base, entrenado con datos extensos |
| Llama 3.2 3B | 3,21 B | No especificado en la fuente | Llama 3.2 | safetensors, GGUF | Modelo comparable en tamaño, sin relación directa |

La comparativa con otros modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Dataset de entrenamiento muy pequeño**: solo 1.122 ejemplos sintéticos, lo que puede provocar un comportamiento inconsistente fuera de las categorías representadas.
- **Sesgos del modelo profesor**: al destilar de un único modelo (Nemotron-3-Super) sin revisión humana exhaustiva, los sesgos o errores factuales del profesor pueden propagarse.
- **Riesgo de alucinación**: al ser un modelo pequeño con datos limitados, es propenso a generar información falsa o inventada, especialmente en dominios especializados.
- **Solo inglés**: no se garantiza un rendimiento adecuado en otros idiomas, aunque el dataset incluya tareas de traducción.
- **No apto para producción**: la model card indica explícitamente que no está destinado a usos de alto riesgo, críticos o de producción.
- **Licencia Gemma**: sujeto a las condiciones de uso de Gemma de Google, que pueden restringir ciertos usos comerciales; es necesario revisar los términos.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de su rendimiento en tareas estándar, lo que dificulta evaluar su calidad real.
- **Sobreajuste observado**: el checkpoint seleccionado es el de menor pérdida de validación, pero las iteraciones posteriores mostraron sobreajuste, lo que indica fragilidad ante datos fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/amethyst-1-mini
- Perfil de VertexAIco en HuggingFace: https://huggingface.co/VertexAIco/models
- Publicación en X (Twitter): https://x.com/vertexagi
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint base para fine-tuning: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
