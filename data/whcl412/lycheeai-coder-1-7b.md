# whcl412/LycheeAI-coder-1.7b

## Resumen

LycheeAI-coder-1.7b es un modelo de generación de código basado en Qwen3-1.7B, desarrollado por whcl412 mediante fine-tuning con QLoRA en 4-bit. El modelo está diseñado específicamente para mejorar las capacidades de programación del modelo base, entrenándose con una mezcla de CodeAlpaca-20k (2000 instrucciones de código) y fragmentos seleccionados de repositorios GitHub de alta calidad (1000 ejemplos de proyectos como requests, fastapi, zod, express, guava, Alamofire, gin, redis, nlohmann/json y fmt).

La relevancia de este modelo radica en su tamaño compacto: al partir de Qwen3-1.7B y aplicar cuantización 4-bit, ocupa aproximadamente 968 MB, lo que permite ejecutarlo en dispositivos Apple Silicon con poca memoria. El entrenamiento se realizó con el framework MLX-LM, optimizado para el ecosistema de Apple, y el resultado es un asistente de código ligero que hereda la arquitectura transformer del modelo base Qwen3.

El modelo se distribuye bajo licencia Apache 2.0, igual que su base, y soporta principalmente chino e inglés, aunque su dominio principal es la generación de código en múltiples lenguajes de programación. No se han publicado benchmarks oficiales, por lo que su rendimiento debe evaluarse empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 268.944.384 (adaptadores LoRA) + Qwen3-1.7B base (~1.7B) |
| Longitud de contexto | no disponible (heredado del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | 4-bit (QLoRA) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX-LM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó QLoRA (Quantized Low-Rank Adaptation) con rank 16, cuantizando los pesos del modelo base a 4-bit y entrenando únicamente los adaptadores LoRA. El framework de entrenamiento fue MLX-LM, diseñado para Apple Silicon, lo que implica que el modelo está optimizado para ejecutarse en hardware de Apple mediante el runtime MLX.

El entrenamiento se realizó durante 1500 pasos con un batch size de 2 y una tasa de aprendizaje de 2e-4. Los datos de entrenamiento consistieron en 2000 muestras del dataset CodeAlpaca-20k y 1000 fragmentos de código extraídos de repositorios GitHub de alta calidad, cubriendo lenguajes como Python, TypeScript, Java, Swift, Go y C/C++. No se aplicaron técnicas de RLHF ni DPO. Durante el entrenamiento se fijó un system prompt que identifica al modelo como "derivado de Qwen3-1.7B mediante fine-tuning".

## Capacidades

- Generación de código en Python, TypeScript, Java, Swift, Go y C/C++.
- Explicación de fragmentos de código y resolución de dudas de programación simples.
- Completado de código y generación de funciones a partir de descripciones en lenguaje natural.
- Soporte multilingüe limitado a chino e inglés para instrucciones de programación.
- Capacidad de razonamiento básico sobre algoritmos y estructuras de datos, aunque limitada por el tamaño del modelo.
- No se documenta soporte para tool calling, function calling ni uso como agente autónomo.

## Casos de uso

- Asistente de programación en entornos Apple Silicon: al estar optimizado para MLX, puede ejecutarse localmente en un Mac con M1/M2/M3 sin conexión a internet, ofreciendo respuestas rápidas para consultas de código.
- Generación de scripts de automatización: el modelo puede producir scripts en Python o Bash a partir de instrucciones en lenguaje natural, útil para tareas de administración de sistemas.
- Explicación de código legado: dado su entrenamiento en repositorios populares como fastapi o requests, puede interpretar y comentar fragmentos de código de proyectos open source comunes.
- Educación en programación: estudiantes pueden usarlo para obtener ejemplos de implementación de algoritmos clásicos (ordenación, búsqueda, estructuras de datos) en varios lenguajes.
- Prototipado rápido de funciones: desarrolladores pueden generar funciones sueltas o pequeñas utilidades sin necesidad de un modelo más grande, especialmente en entornos con recursos limitados.
- Preprocesamiento de datos: puede generar código para limpieza, transformación o análisis de datos en Python, aprovechando su familiaridad con librerías como requests y nlohmann/json.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Se recomienda evaluar su rendimiento de forma empírica en tareas de generación de código antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para inferencia en 4-bit (el modelo ocupa ~968 MB en disco).
- GPU recomendadas: el modelo está diseñado para Apple Silicon (M1, M2, M3) mediante el runtime MLX. No se proporcionan instrucciones para GPU NVIDIA o AMD.
- Compatibilidad con hardware de consumo: sí, cualquier Mac con al menos 8 GB de RAM unificada puede ejecutarlo sin problemas.
- Opciones de despliegue: mediante la librería mlx-lm, tanto en Python como desde línea de comandos con `mlx_lm.generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Al ser un modelo de 1.7B en 4-bit, se espera una generación de decenas de tokens por segundo en Apple Silicon, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LycheeAI-coder-1.7b | 1.7B + LoRA | no disponible | Apache 2.0 | Código, QLoRA sobre Qwen3 |
| DeepSeek Coder 1.3B | 1.3B | 16K | Apache 2.0 | Código, entrenado desde cero |
| Qwen2.5-Coder-1.5B | 1.5B | 32K | Apache 2.0 | Código, base general |

La comparativa se basa en datos públicos de los modelos alternativos. LycheeAI-coder-1.7b se distingue por su fine-tuning específico sobre Qwen3 y su optimización para Apple Silicon, mientras que DeepSeek Coder y Qwen2.5-Coder ofrecen ventanas de contexto más largas y un entrenamiento más extenso en código. No hay benchmarks comparativos disponibles para LycheeAI-coder-1.7b.

## Limitaciones y advertencias

- Tamaño reducido: con solo 1.7B de parámetros, el modelo tiene capacidades limitadas para razonamiento complejo, matemáticas avanzadas o comprensión de contextos extensos.
- Datos de entrenamiento escasos: solo 3000 muestras en total, lo que puede provocar respuestas inconsistentes fuera de los patrones vistos durante el fine-tuning.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código sintácticamente válido pero incorrecto o inseguro. Se recomienda revisar siempre el código generado.
- Soporte de idiomas limitado: solo chino e inglés; no se garantiza un buen comportamiento en otros idiomas.
- Sin soporte para tool calling ni agentes: no puede interactuar con APIs externas ni ejecutar acciones por sí mismo.
- Restricciones de hardware: al estar optimizado para MLX, no se puede ejecutar directamente en GPUs NVIDIA sin conversión previa a otro formato (por ejemplo, GGUF o PyTorch).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whcl412/LycheeAI-coder-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Framework MLX-LM: https://github.com/ml-explore/mlx-lm
