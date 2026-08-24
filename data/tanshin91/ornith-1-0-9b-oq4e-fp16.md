# tanshin91/Ornith-1.0-9B-oQ4e-fp16

## Resumen

Ornith-1.0-9B-oQ4e-fp16 es una cuantización de 4 bits del modelo Ornith-1.0-9B, perteneciente a la familia Ornith-1.0 desarrollada por ornith-ai / DeepReinforce. El modelo original es un modelo de codificación agéntica (agentic coding) de tipo denso, con una ventana de contexto de 262 144 tokens (256K) y una interfaz compatible con OpenAI. Esta versión concreta ha sido cuantizada con oQ (oMLX) en formato MLX safetensors, pensada para su ejecución en dispositivos Apple Silicon y entornos con recursos limitados.

La cuantización reduce el tamaño del modelo y lo hace viable en GPUs de consumo, manteniendo la capacidad de tool calling y el contexto largo del original. El modelo base se distribuye bajo licencia MIT, aunque la cuantización no especifica su propia licencia. Aunque el nombre indica 9B de parámetros, el repositorio de esta cuantización muestra 1 876 724 976 parámetros totales, lo que sugiere que podría tratarse de una versión reducida o de un error en los metadatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, tipo dense) |
| Parametros totales | 1 876 724 976 (según safetensors del repo; el modelo base se anuncia como 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | Q4 (4 bits), group size 64, mixed-precision (oQ4e) |
| Idiomas soportados | no especificado (orientado a código, probablemente inglés) |
| Licencia | MIT (modelo base), cuantización sin licencia indicada |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo Ornith-1.0-9B es un transformer denso de 9B parámetros basado en la arquitectura Qwen3.5. Según la documentación oficial, se distribuye junto con variantes MoE de 35B y 397B, pero esta cuantización corresponde al modelo denso. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO). El modelo está optimizado para tareas de codificación agéntica, con soporte de tool calling y razonamiento multi-paso. La cuantización se realizó con oMLX v0.6.3rc2, utilizando cuantización de precisión mixta (oQ4e) con un group size de 64, lo que permite reducir el tamaño del modelo manteniendo un equilibrio entre rendimiento y calidad.

## Capacidades

- Generación de código en múltiples lenguajes de programación (probablemente Python, JavaScript, C++, etc., aunque no se especifica).
- Razonamiento de codificación agéntica: puede planificar y ejecutar tareas de programación de varios pasos.
- Soporte de tool calling / function calling, permitiendo integración con APIs y entornos de desarrollo.
- Ventana de contexto de 256K tokens, útil para repositorios grandes o conversaciones largas.
- Interfaz compatible con OpenAI, facilitando el despliegue en entornos estándar.
- Capacidad de razonamiento matemático y lógico, aunque no es su foco principal.

## Casos de uso

- **Asistente de programación en el IDE**: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar código, explicar fragmentos y sugerir refactorizaciones. Su contexto de 256K permite procesar archivos y proyectos enteros.
- **Agente de resolución de issues**: puede analizar un repositorio, entender el problema descrito en un issue y generar un parche o sugerir cambios. La capacidad de tool calling le permite ejecutar comandos y tests en un entorno controlado.
- **Generación de tests unitarios**: a partir de una función o clase, el modelo puede crear casos de prueba, cubriendo casos límite y excepciones. Su conocimiento de patrones de código mejora la calidad de los tests generados.
- **Revisión de código automatizada**: puede revisar pull requests, detectar errores comunes, problemas de seguridad y proponer mejoras. El contexto largo le permite analizar la difusión completa en un solo paso.
- **Chat de soporte técnico**: con su interfaz compatible con OpenAI, puede desplegarse como un chatbot de ayuda para desarrolladores, respondiendo preguntas sobre APIs, librerías y frameworks.
- **Automatización de tareas de CI/CD**: gracias al tool calling, puede integrarse en pipelines para generar scripts de build, configurar entornos o incluso ejecutar tests y analizar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las webs oficiales mencionan que existen resultados comparativos, pero no se proporcionan números concretos en los datos extraídos.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización 4-bit de un modelo de ~9B parámetros, el tamaño en memoria aproximado es de 4.5-5 GB para los pesos. Añadiendo el contexto (KV cache) para 256K tokens, la memoria adicional puede ser significativa (en el orden de 10-20 GB). Por tanto, se recomienda al menos 16 GB de VRAM para uso con contexto largo, aunque para contexto corto podría funcionar en 8 GB.
- **GPU recomendadas**: RTX 4080/4090, A6000, L4, A10G o cualquier GPU con 16 GB o más. El modelo original cabe en una GPU de 80GB, pero la cuantización reduce notablemente los requisitos.
- **Consumer GPU**: sí, con 16 GB de VRAM (p.ej., RTX 4080 o RTX 4090) es viable para tareas de codificación con contexto moderado. Para contexto completo de 256K, se requiere más memoria.
- **Opciones de despliegue**: dado que el formato es MLX, se ejecuta con la librería oMLX (para macOS) y también puede convertirse a GGUF para usar con llama.cpp o Ollama. No hay soporte directo para vLLM o TGI en este formato, pero se puede convertir a safetensors estándar para esos motores.
- **Latencia y throughput**: no se han publicado datos concretos. En una GPU como RTX 4090, se espera una latencia de decodificación de unos 20-40 tokens por segundo para un modelo 9B cuantizado, pero depende del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith-1.0-9B (base) | 9B | 256K | MIT | safetensors |
| CodeLlama-7B | 7B | 16K | Llama 2 | safetensors |
| DeepSeek-Coder-6.7B | 6.7B | 16K | MIT | safetensors |
| Qwen2.5-Coder-7B | 7B | 128K | Apache 2.0 | safetensors |

El modelo destaca por su contexto de 256K, muy superior al de la mayoría de alternativas. Su licencia MIT es permisiva, aunque la cuantización aquí no especifica licencia. En términos de rendimiento, no hay datos comparativos disponibles.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un modelo de codificación, puede generar código con errores lógicos o de seguridad. Es necesario revisar el código generado antes de usarlo en producción.
- **Licencia**: aunque el modelo base tiene licencia MIT, esta cuantización no indica licencia explícita. Antes de usarla comercialmente, conviene contactar con el autor.
- **Idioma**: el modelo está orientado al código, por lo que su capacidad para otros idiomas (español, francés, etc.) es limitada.
- **Contexto**: aunque la ventana es de 256K, el uso de contexto largo aumenta significativamente el uso de VRAM y puede degradar el rendimiento si no se gestiona adecuadamente.
- **Formato propietario**: el formato MLX es específico de Apple y de oMLX; para otros entornos hay que convertir los pesos, lo que puede introducir pérdidas de precisión.
- **Datos de entrenamiento**: no se han publicado detalles sobre el dataset, por lo que no se puede evaluar posibles sesgos o limitaciones.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/tanshin91/Ornith-1.0-9B-oQ4e-fp16)
- [Modelo base ornith-ai/Ornith-1.0-9B](https://huggingface.co/ornith-ai/Ornith-1.0-9B)
- [Repositorio GitHub ornith-ai/Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Página oficial Ornith 1.0](https://ornith.site/)
- [Página del modelo 9B](https://ornith.online/ornith-1-0-model-9b)
