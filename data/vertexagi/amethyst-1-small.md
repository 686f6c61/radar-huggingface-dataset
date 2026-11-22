# VertexAGI/amethyst-1-small

## Resumen
Amethyst 1 Small es un modelo de chat e instrucciones de propósito general desarrollado por VertexAGI como parte de un proyecto de investigación independiente. Se obtiene mediante un ajuste fino con LoRA sobre Llama 3.1 8B Instruct, utilizando el mismo conjunto de datos de instrucciones destiladas empleado en Amethyst 1 Mini (basado en Gemma 3 4B). La propuesta del autor es explícita: mismos datos de entrenamiento, modelo base de mayor tamaño, lo que lo convierte en el segundo miembro de la familia Amethyst.

El modelo es un transformer denso decoder-only de 8.030.261.248 parámetros, derivado de la arquitectura Llama 3.1. Se distribuye exclusivamente en formato MLX cuantizado a 4 bits (group size 64), con un peso de 4,52 GB, y está pensado para ejecutarse en Apple Silicon mediante `mlx-lm`. No se ofrece build GGUF, lo que limita su uso fuera del ecosistema MLX.

Su relevancia es acotada y experimental: se trata de un checkpoint temprano de segunda generación, entrenado sobre un dataset sintético muy pequeño (1.122 pares instrucción/respuesta) destilado de un único profesor, Nemotron-3-Super-120B-A12B. El autor lo declara apto para experimentación e investigación sobre pipelines de destilación a pequeña escala, y explícitamente no apto para uso en producción o en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1, transformer denso decoder-only |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens, pero la model card no confirma el contexto efectivo tras el ajuste) |
| Tipos de cuantizacion | 4-bit (group size 64), misma cuantizacion que el checkpoint base |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (MLX, `model.safetensors` en la raiz del repo); no se proporciona GGUF |

## Arquitectura y entrenamiento
La arquitectura es la de Llama 3.1 8B Instruct: un transformer denso decoder-only con atención por causalidad estándar, sin componentes MoE ni mecanismos híbridos. El ajuste se realizó con LoRA de rango 8, dropout 0.0 y escala 20.0, sobre el checkpoint cuantizado `mlx-community/Meta-Llama-3.1-8B-Instruct-4bit`. Los módulos entrenados son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en 16 capas. Los adaptadores se fusionan en los pesos base y se publican directamente en 4 bits, sin de-cuantizar. El entrenamiento se ejecutó con MLX / `mlx-lm` en Apple Silicon, optimizador Adam con learning rate constante de 1e-5, longitud de secuencia de 4096 tokens y gradient checkpointing activado.

El conjunto de datos consta de 1.122 pares instrucción/respuesta (1.082 de entrenamiento y 40 de validación), generados sintéticamente mediante destilación de conocimiento desde `nvidia/nemotron-3-super-120b-a12b` (MoE de 120B parámetros con ~12B activos) a través de la API de OpenRouter. Las categorías cubiertas son explicación, razonamiento, código, extracción, planificación, roleplay, escritura creativa, traducción, clasificación de sentimiento y brainstorming. El entrenamiento se realizó en dos pasadas, interrumpidas por un reinicio de la máquina local y reanudadas desde un checkpoint intermedio, superando sustancialmente el presupuesto original de 3.246 iteraciones. El checkpoint publicado es el de menor pérdida de validación observada (1.487); los posteriores oscilan en torno a un suelo de ruido sin mejorar, patrón ya visto en Amethyst 1 Mini.

## Capacidades
- Generación de texto conversacional multi-turno y seguimiento de instrucciones en inglés.
- Razonamiento básico y explicaciones paso a paso, dentro de las categorías presentes en el dataset de destilación.
- Generación y explicación de código, limitada por el tamaño y la diversidad del corpus de ajuste.
- Extracción de información estructurada y planificación de tareas simples.
- Escritura creativa y roleplay, así como clasificación de sentimiento y brainstorming.
- Traducción, según lo cubierto en los datos de entrenamiento (sin garantías fuera de los pares representados).
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Llama 3.1 lo soporta, pero no hay confirmación de que se preserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso
- Experimentación con pipelines de destilación: el modelo sirve como punto de comparación directa con Amethyst 1 Mini para estudiar cómo escala el mismo dataset sintético al pasar de un base de 4B a uno de 8B, en un entorno MLX reproducible.
- Asistente conversacional de prototipado en Apple Silicon: gracias al formato MLX 4-bit de 4,52 GB, puede desplegarse localmente en un Mac con memoria unificada suficiente para validar flujos de chat antes de migrar a modelos mayores.
- Generación de respuestas explicativas en inglés: útil para probar plantillas de instrucciones y evaluar la calidad de explicaciones destiladas en dominios como ciencia básica o conceptos técnicos.
- Extracción y estructuración de información en tareas acotadas: adecuado para prototipos de parsing de texto a formatos estructurados cuando el esquema de salida está bien definido y cabe en el contexto.
- Evaluación de calidad de datos sintéticos: permite medir hasta qué punto un profesor MoE de 120B transfiere capacidades a un alumno denso de 8B con solo 1.082 ejemplos, como insumo para decidir si merece la pena ampliar el corpus.
- Clasificación de sentimiento y análisis ligero de opiniones: válido para demos y pruebas internas de pipelines de NLP en inglés, no para decisiones automatizadas en producción.
- Roleplay y escritura creativa controlada: útil en entornos de investigación sobre estilos conversacionales y consistencia de personaje, con expectativas limitadas por el tamaño del dataset.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación del checkpoint seleccionado (1.487), sin métricas estándar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware
- El repositorio ocupa 4,5 GB y el archivo `model.safetensors` en 4-bit pesa 4,52 GB, por lo que la inferencia requiere al menos ese espacio en memoria, más overhead para KV cache y tokenizador.
- Diseñado para Apple Silicon mediante MLX y `mlx-lm`; no se distribuye GGUF, por lo que llama.cpp, Ollama y TGI no son vías de despliegue soportadas de forma nativa para estos pesos.
- VRAM estimada para inferencia: en torno a 5-6 GB en 4-bit, dependiendo de la longitud de contexto y del tamaño del lote; el dato exacto no está publicado.
- GPU recomendadas: el formato MLX está orientado a chips Apple (series M1/M2/M3/M4 con memoria unificada); para GPUs NVIDIA (A100, H100, RTX 4090) habría que convertir los pesos a otro formato, lo que no está documentado por el autor.
- Cabe en GPUs de consumo con suficiente memoria unificada o VRAM; en el ecosistema MLX, un Mac con 16 GB de memoria unificada es un objetivo razonable para contextos moderados.
- Opciones de despliegue: `mlx-lm` es la vía documentada. vLLM, llama.cpp, Ollama y TGI no están soportados de forma directa al no existir build GGUF ni pesos en safetensors estándar para transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Amethyst 1 Small | 8B (denso) | no disponible | MLX 4-bit (4,52 GB) | Llama 3.1 Community | Ajuste LoRA sobre Llama 3.1 8B Instruct con 1.122 ejemplos destilados de Nemotron-3-Super-120B-A12B |
| Amethyst 1 Mini | 4B (Gemma 3) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Mismo dataset y pipeline de destilacion, base de menor tamano; referencia directa del autor |
| Llama 3.1 8B Instruct | 8B (denso) | 128K tokens (modelo base) | safetensors, GGUF y multiples cuantizaciones de la comunidad | Llama 3.1 Community | Modelo base del ajuste; mayor cobertura de datos y disponibilidad de formatos |
| Nemotron-3-Super-120B-A12B | 120B totales, ~12B activos (MoE) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Profesor usado para generar el dataset de destilacion |

## Limitaciones y advertencias
- Dataset de ajuste muy pequeno (1.122 ejemplos) y sintetico: el comportamiento puede ser inconsistente fuera de las categorias representadas en el entrenamiento.
- Destilado de un unico modelo profesor sin revision humana de cada ejemplo, lo que arrastra sesgos y errores del profesor.
- Hereda las limitaciones generales y la fecha de corte de conocimiento de Llama 3.1 8B Instruct.
- Solo ingles: no se documenta soporte multilingue, aunque el base Llama 3.1 lo tiene; el ajuste puede haber degradado el rendimiento en otros idiomas.
- Riesgo de alucinacion propio de un modelo de 8B ajustado con pocos datos y sin RLHF/DPO posterior; no hay evaluaciones de fidelidad publicadas.
- Licencia Llama 3.1 Community: uso comercial sujeto a los terminos de Meta, incluida la politica de uso aceptable y las obligaciones de atribucion; conviene revisar el texto completo antes de cualquier despliegue.
- El autor declara explicitamente que no es apto para uso en produccion, entornos de alto riesgo o seguridad critica.
- Sin build GGUF y con pesos solo en MLX 4-bit, la portabilidad fuera de Apple Silicon es limitada y requeriria conversion no documentada.
- Checkpoint temprano de segunda generacion de la serie, con entrenamiento interrumpido y reanudado; la seleccion se basa en perdida de validacion sobre 40 ejemplos, una muestra muy reducida.
- No hay datos publicados sobre tool calling, comportamiento agentico ni latencias, por lo que no deben asumirse en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-1-small
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Checkpoint de ajuste: https://huggingface.co/mlx-community/Meta-Llama-3.1-8B-Instruct-4bit
- Amethyst 1 Mini: https://huggingface.co/VertexAIco/amethyst-1-mini
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- MLX: https://github.com/ml-explore/mlx
- Profesor de destilacion (referencia): `nvidia/nemotron-3-super-120b-a12b` (identificador citado en la model card; no se proporciona URL directa en la informacion disponible)
