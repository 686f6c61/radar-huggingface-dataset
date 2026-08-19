# whcl412/LycheeAI-coder-1.7b-GGUF

## Resumen

LycheeAI-coder-1.7b-GGUF es una cuantización GGUF del modelo LycheeAI-coder-1.7b, un fine-tune del modelo Qwen3-1.7B especializado en generación de código. Desarrollado por el usuario whcl412, este modelo se entrena mediante QLoRA (4-bit, rank 16) sobre un conjunto de datos de instrucciones de código (CodeAlpaca-20k y fragmentos seleccionados de GitHub) para mejorar las capacidades de programación del modelo base. Su tamaño reducido (1.720.574.976 parámetros) y su formato GGUF lo hacen adecuado para despliegue en entornos con recursos limitados, como portátiles o GPUs de consumo.

La relevancia de este modelo radica en su enfoque específico para tareas de código con un coste computacional muy bajo, lo que permite ejecutarlo localmente sin necesidad de infraestructura de servidor. La cuantización Q4_K_M reduce el peso a 1.05 GB, facilitando su uso en dispositivos con poca memoria. Sin embargo, el autor advierte que el fine-tune exclusivo con datos de código degrada el rendimiento en conversación general, por lo que su uso recomendado se limita a tareas de programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B, no especificada en la ficha) |
| Tipos de cuantizacion | Q4_K_M (1.05 GB), F16 (3.44 GB) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen3-1.7B, un modelo de lenguaje denso con 1.7 mil millones de parámetros. El fine-tune se realizó mediante QLoRA (Quantized Low-Rank Adaptation) con cuantización de 4 bits y un rango de LoRA de 16, lo que permite ajustar el modelo con un coste de memoria reducido. Los datos de entrenamiento consisten en 2.000 muestras del dataset CodeAlpaca-20k y 1.000 fragmentos de código seleccionados del corpus de GitHub, totalizando 3.000 ejemplos. No se menciona el uso de técnicas de RLHF o DPO; el entrenamiento es puramente supervisado sobre instrucciones de código.

La innovación principal reside en la combinación de un modelo base moderno (Qwen3-1.7B) con un fine-tune específico para código, manteniendo un tamaño compacto que permite su ejecución en hardware modesto. La cuantización GGUF posterior facilita la compatibilidad con múltiples motores de inferencia como Ollama, llama.cpp o LM Studio.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (Python, JavaScript, etc.), basada en las instrucciones del dataset de entrenamiento.
- Autocompletado y finalizacion de fragmentos de codigo.
- Explicacion y documentacion de codigo existente.
- Refactorizacion y correccion de errores simples.
- Soporte multilingue limitado a chino e ingles, aunque la salida de codigo suele ser independiente del idioma.
- No se menciona soporte para tool calling, function calling, agentes o razonamiento multi-paso. Dado el tamano y el entrenamiento, estas capacidades probablemente no estan disponibles.
- No dispone de modo de pensamiento, vision ni audio.

## Casos de uso

- Autocompletado de codigo en editores locales: el modelo puede integrarse en entornos como VS Code o Neovim mediante complementos que usen llama.cpp o Ollama, ofreciendo sugerencias de codigo en tiempo real sin conexion a internet.
- Generacion de scripts y utilidades rapidas: para tareas de automatizacion o prototipado, el modelo puede generar funciones o scripts completos a partir de descripciones en lenguaje natural, por ejemplo "escribe una funcion que lea un CSV y calcule la media".
- Asistencia en entrevistas tecnicas o ejercicios de programacion: al ser un modelo pequeno, se puede ejecutar en un portatil para practicar problemas de algoritmos y recibir soluciones de referencia.
- Educacion y aprendizaje de programacion: los estudiantes pueden usarlo para obtener ejemplos de codigo comentados y explicaciones de conceptos, aunque debe supervisarse la calidad de las respuestas.
- Generacion de codigo para proyectos personales o de baja criticidad: en entornos de desarrollo sin requisitos de produccion estrictos, el modelo puede acelerar la escritura de codigo boilerplate o funciones repetitivas.
- Pruebas de concepto en entornos sin GPU: gracias a su tamano y cuantizacion Q4_K_M, puede ejecutarse en CPU con un rendimiento aceptable, permitiendo validar flujos de generacion de codigo en maquinas virtuales o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se desconoce el rendimiento cuantitativo en tareas de programacion.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantizacion Q4_K_M (1.05 GB), se necesitan aproximadamente 2 GB de VRAM o RAM si se ejecuta en CPU. Para la version F16 (3.44 GB), se requieren al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o integradas modernas) puede ejecutar la version Q4_K_M. Para F16, se recomienda una GPU con 4 GB o mas, como RTX 3060 o superior.
- Compatibilidad con GPUs de consumo: si, tanto la version Q4_K_M como la F16 caben en GPUs de gama media actuales. Tambien puede ejecutarse en CPU con 8 GB de RAM para Q4_K_M.
- Opciones de despliegue: compatible con Ollama, llama.cpp, LM Studio y cualquier motor que soporte formato GGUF. Tambien se puede usar con el backend de text-generation-webui.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (por ejemplo RTX 3090), la generacion de tokens con Q4_K_M deberia ser inferior a 50 ms por token, pero no hay mediciones confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LycheeAI-coder-1.7b | 1.7B | No disponible | Apache-2.0 | Codigo (fine-tune) |
| Qwen2.5-Coder-1.5B | 1.5B | 32K | Apache-2.0 | Codigo (base) |
| DeepSeek-Coder-1.3B | 1.3B | 16K | MIT | Codigo (base) |
| CodeLlama-7B | 7B | 16K | Llama 2 license | Codigo (base) |

No se dispone de datos de rendimiento comparativo. LycheeAI-coder-1.7b se distingue por ser un fine-tune especifico sobre Qwen3-1.7B, mientras que las alternativas son modelos base de codigo. Su ventaja principal es el tamano reducido y la licencia permisiva, pero carece de la madurez y el soporte de modelos mas establecidos.

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo tiene un rendimiento deficiente en conversacion general: puede responder con contenido irrelevante, en ingles o repetir fragmentos del dataset de entrenamiento. No debe usarse para chatbots o asistentes de proposito general.
- El conjunto de entrenamiento es muy pequeno (3.000 ejemplos), lo que limita la generalizacion y puede provocar alucinaciones en tareas de codigo complejas o poco comunes.
- No se ha evaluado la seguridad ni la robustez del modelo; podria generar codigo con vulnerabilidades o practicas inseguras si se le solicita.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte oficial.
- La longitud de contexto no esta documentada en la ficha; se hereda del modelo base Qwen3-1.7B, que soporta hasta 32K tokens, pero no se ha verificado en este fine-tune.
- No se proporcionan pesos en formato safetensors ni otros formatos; solo GGUF, lo que limita su uso con frameworks que requieran pesos originales (por ejemplo, Transformers de HuggingFace sin conversion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whcl412/LycheeAI-coder-1.7b-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de formato GGUF: https://huggingface.co/docs/hub/gguf
- Repositorio MLX mencionado (no verificado): https://huggingface.co/whcl412/mlx-LycheeAI-coder-1.7b
