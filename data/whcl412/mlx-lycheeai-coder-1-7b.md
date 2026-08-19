# whcl412/mlx-LycheeAI-coder-1.7b

## Resumen

mlx-LycheeAI-coder-1.7b es un modelo de generación de código desarrollado por el usuario whcl412, obtenido mediante fine-tuning del modelo base Qwen/Qwen3-1.7B con la técnica QLoRA en cuantización de 4 bits. El modelo está diseñado específicamente para tareas de programación: generación de código, completado, explicación y respuestas a preguntas técnicas. Se distribuye exclusivamente en formato MLX, lo que lo hace compatible únicamente con hardware Apple Silicon a través de la librería MLX-LM, y no es compatible con transformers, Windows/Linux ni Ollama.

El fine-tuning se realizó con un conjunto de datos mixto que incluye 2000 muestras de CodeAlpaca-20k y 1000 fragmentos de repositorios open source de alta calidad (requests, fastapi, zod, express, guava, Alamofire, gin, redis, nlohmann/json, fmt, entre otros). El modelo mantiene la licencia Apache 2.0 del modelo base y soporta chino e inglés. Con aproximadamente 269 millones de parámetros en el archivo safetensors (aunque el modelo base declara 1.7B), es una opción ligera para entornos con recursos limitados, aunque su capacidad de razonamiento complejo y contexto largo es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-1.7B) |
| Parametros totales | 268.944.384 (según safetensors; el modelo base Qwen3-1.7B declara 1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (QLoRA) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer Qwen3-1.7B, realizado con QLoRA (4-bit quantización + LoRA) con rank 16 y aplicado a 16 capas. El entrenamiento se llevó a cabo con el framework MLX-LM en Apple Silicon, con una tasa de aprendizaje de 2e-4, batch size 2 y 1500 pasos. Los datos de entrenamiento combinan 2000 instrucciones de CodeAlpaca-20k y 1000 fragmentos de código fuente de repositorios populares de GitHub, cubriendo lenguajes como Python, TypeScript, Java, Swift, Go, C y C++. Durante el entrenamiento se fijó un system prompt que establece la identidad del modelo como un asistente derivado de Qwen3-1.7B. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de código en múltiples lenguajes (Python, TypeScript, Java, Swift, Go, C/C++).
- Completado de código y generación de fragmentos a partir de descripciones en lenguaje natural.
- Explicación de código y respuestas a preguntas técnicas de programación.
- Soporte conversacional básico en chino e inglés.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades multimodales (visión, audio).

## Casos de uso

- Autocompletado de código en editores locales: el modelo puede integrarse en extensiones de VS Code o editores compatibles con MLX para sugerir fragmentos de código mientras se escribe, aprovechando su fine-tuning específico en repositorios populares.
- Generación de scripts de automatización: útil para crear scripts en Python o shell a partir de instrucciones breves, por ejemplo, para tareas de procesamiento de archivos o integración con APIs.
- Asistente de aprendizaje de programación: puede explicar fragmentos de código y responder preguntas de nivel básico e intermedio, siendo adecuado para estudiantes que trabajan en inglés o chino.
- Generación de tests unitarios: a partir de una función o clase, el modelo puede proponer casos de prueba simples, aunque con limitaciones por su tamaño.
- Documentación de código: puede generar comentarios y descripciones de funciones en inglés o chino, facilitando el mantenimiento de proyectos.
- Prototipado rápido en entornos Apple Silicon: al ser un modelo MLX ligero (~968 MB), puede ejecutarse en portátiles Mac con memoria unificada de 8 GB, permitiendo generar código sin conexión a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB (tamaño del modelo 968 MB en 4-bit).
- GPU recomendada: cualquier chip Apple Silicon (M1, M2, M3 o superior); no requiere GPU dedicada.
- Compatible con Macs con 8 GB de RAM unificada o más.
- Opciones de despliegue: exclusivamente mediante MLX-LM (Python o CLI). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño se espera generación rápida en hardware Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| mlx-LycheeAI-coder-1.7b | 268M (safetensors) | No disponible | Apache 2.0 | MLX | Código (fine-tune Qwen3-1.7B) |
| DeepSeek-Coder-1.3B | 1.3B | 16K | MIT | PyTorch | Código (base) |
| CodeLlama-7B | 7B | 16K | Llama 2 license | PyTorch | Código (base) |

Nota: la comparación se basa en características generales; no hay datos de rendimiento disponibles para mlx-LycheeAI-coder-1.7b. DeepSeek-Coder-1.3B y CodeLlama-7B son alternativas de código abierto con mayor tamaño y soporte multiplataforma, pero requieren más recursos.

## Limitaciones y advertencias

- Tamaño reducido: con 1.7B parámetros (según el modelo base), el rendimiento en razonamiento complejo, matemáticas avanzadas y tareas de largo contexto es limitado.
- Solo compatible con Apple Silicon: el formato MLX impide su uso en Windows, Linux o GPUs NVIDIA; no es posible cargarlo con transformers ni Ollama.
- Idiomas limitados: solo chino e inglés; no se garantiza buen rendimiento en otros idiomas.
- Riesgo de alucinación en código: puede generar código sintácticamente válido pero lógicamente incorrecto, especialmente en casos poco representados en el entrenamiento.
- Sesgos del fine-tuning: los datos provienen de repositorios populares, lo que puede sesgar el estilo de código hacia proyectos grandes y bien mantenidos, no representativos de todos los casos.
- Sin garantías de producción: el autor no indica pruebas exhaustivas ni benchmarks; se recomienda validación manual antes de usar en entornos críticos.
- Fecha de creación futura (2026-08-18) y cero descargas: el modelo es muy reciente y no ha sido evaluado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/whcl412/mlx-LycheeAI-coder-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- MLX-LM (librería de carga): https://github.com/ml-explore/mlx-lm
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
