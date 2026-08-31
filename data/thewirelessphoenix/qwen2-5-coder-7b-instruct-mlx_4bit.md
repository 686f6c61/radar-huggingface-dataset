# TheWirelessPhoenix/Qwen2.5-Coder-7B-Instruct-mlx_4bit

## Resumen

TheWirelessPhoenix/Qwen2.5-Coder-7B-Instruct-mlx_4bit es una conversión a formato MLX con cuantización de 4 bits del modelo Qwen2.5-Coder-7B-Instruct, desarrollado originalmente por Alibaba Cloud. Esta versión está pensada para ejecutarse de forma eficiente en dispositivos Apple Silicon mediante la librería mlx-lm, manteniendo las capacidades de generación de código y razonamiento del modelo base. El modelo base, Qwen2.5-Coder-7B-Instruct, es un transformer decoder-only de 7.6 mil millones de parámetros, preentrenado sobre más de 5,5 billones de tokens y ajustado con instrucciones para tareas de programación. La conversión a 4 bits reduce el tamaño del modelo a aproximadamente 4,3 GB, lo que permite su uso en equipos con memoria unificada de 8 GB o más, como los Mac con chip M1/M2/M3/M4.

Esta ficha cubre la versión cuantizada, no el modelo original. La relevancia de esta conversión radica en que facilita la ejecución local de un modelo de código de alto rendimiento en hardware de consumo, sin necesidad de GPUs dedicadas de gran VRAM. El autor, TheWirelessPhoenix, ha publicado el modelo con licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.6B (modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles (segun la model card; el modelo base soporta ademas chino y otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors de esta conversion reporta 1.190.221.312 parametros, una cifra que no coincide con los 7.6B del modelo base. Esta discrepancia probablemente se debe a que el archivo contiene los tensores cuantizados en 4 bits, donde el numero de elementos no se corresponde con el conteo de parametros original. El tamano del repositorio es de 4,3 GB.

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B-Instruct emplea una arquitectura transformer causal con atencion completa, similar a la familia Qwen2.5. Consta de 28 capas, 14 cabezas de atencion y una dimension de modelo de 3584, con un vocabulario de 151.936 tokens. El preentrenamiento se realizo sobre un corpus de mas de 5,5 billones de tokens, con un enfasis especial en datos de codigo de multiples lenguajes de programacion, seguido de un ajuste fino supervisado (SFT) y optimizacion con preferencias humanas (RLHF) para la variante Instruct. El modelo base soporta una ventana de contexto de 32.768 tokens y utiliza rotary positional embeddings (RoPE) con una base de 1.000.000.

La conversion a MLX 4-bit no altera la arquitectura, solo cuantiza los pesos a 4 bits mediante el metodo de cuantizacion de mlx-lm (version 0.32.0). Esto reduce el uso de memoria y acelera la inferencia en hardware Apple Silicon, aunque puede introducir una ligera perdida de precision en comparacion con la version de 16 bits.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Java, C++, JavaScript, TypeScript, etc.) con sintaxis correcta y logica coherente.
- Razonamiento y explicacion de codigo: puede analizar fragmentos, detectar errores y sugerir correcciones.
- Soporte de tool calling / function calling: el modelo base esta entrenado para invocar funciones externas, lo que permite integrarlo en agentes y pipelines de automatizacion.
- Capacidad de agentes y razonamiento multi-paso: puede planificar secuencias de acciones y mantener contexto en conversaciones largas.
- Multilingue limitado: aunque la model card indica solo ingles, el modelo base Qwen2.5-Coder soporta tambien chino y otros idiomas, pero la conversion no garantiza el mismo rendimiento en todos ellos.
- Generacion de documentacion tecnica, comentarios y tests unitarios a partir de descripciones en lenguaje natural.

## Casos de uso

- Autocompletado de codigo en editores: el modelo puede integrarse en extensiones de VS Code o Neovim para sugerir lineas o bloques completos, aprovechando su contexto de 32K tokens para entender el proyecto.
- Asistente de programacion en local: ejecutable en un Mac con 8 GB de RAM, permite consultas interactivas sobre APIs, algoritmos o depuracion sin conexion a internet.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede crear casos de prueba en frameworks como pytest o JUnit, reduciendo el trabajo manual.
- Refactorizacion de codigo legacy: con su capacidad de razonamiento, puede proponer mejoras de estructura, renombrado de variables o extraccion de funciones.
- Integracion en pipelines de CI/CD: mediante tool calling, puede revisar pull requests, generar mensajes de commit o detectar vulnerabilidades simples.
- Educacion y formacion: util para estudiantes que quieren practicar programacion con un asistente que explica conceptos y resuelve dudas en tiempo real.
- Prototipado rapido: generar esqueletos de aplicaciones o scripts de automatizacion a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion MLX 4-bit en la informacion disponible. El modelo base Qwen2.5-Coder-7B-Instruct reporta en su paper resultados en HumanEval (85,9% pass@1), MBPP (83,5%) y otros benchmarks de codigo, pero estos datos corresponden a la version original sin cuantizar. La cuantizacion 4-bit puede degradar ligeramente el rendimiento, aunque no se dispone de mediciones concretas para esta variante.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,3 GB para el modelo en 4-bit, mas overhead de ejecucion. En Mac con memoria unificada, el pico de memoria observado es de 4,9 GB (segun benchmark en M4 con 16 GB).
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o posterior) con al menos 8 GB de RAM unificada. Tambien puede ejecutarse en GPUs de NVIDIA con al menos 6 GB de VRAM usando el backend MLX (aunque MLX esta optimizado para Apple Silicon).
- En consumer GPU: cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, pero la libreria MLX esta disenada principalmente para Apple Silicon; para NVIDIA se recomienda usar otras herramientas como llama.cpp o vLLM con el modelo GGUF equivalente.
- Opciones de despliegue: mlx-lm (recomendado), tambien se puede convertir a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: en un Mac M4 (10 nucleos) con 16 GB, se observan 257,8 tokens/s de prefill y 23,3 tokens/s de generacion para un contexto de 4K tokens (segun oMLX benchmark). En hardware mas antiguo, el rendimiento sera menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7.6B | 32K | Apache 2.0 | safetensors | Modelo original, sin cuantizar |
| TheWirelessPhoenix/Qwen2.5-Coder-7B-Instruct-mlx_4bit | 7.6B (cuantizado 4-bit) | 32K | Apache 2.0 | MLX safetensors | Conversion para Apple Silicon |
| CodeLlama-7B-Instruct | 6.7B | 16K | Llama 2 license | safetensors | Alternativa de Meta, con restricciones de uso comercial |
| DeepSeek-Coder-7B-Instruct | 6.9B | 16K | DeepSeek license | safetensors | Alternativa de DeepSeek, con licencia permisiva |

No se dispone de comparativas de rendimiento numerico entre estas versiones cuantizadas, pero el modelo base Qwen2.5-Coder-7B supera consistentemente a CodeLlama-7B y DeepSeek-Coder-7B en benchmarks de codigo como HumanEval y MBPL, segun el paper tecnico.

## Limitaciones y advertencias

- La cuantizacion 4-bit puede provocar una degradacion en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo muy largo.
- El modelo esta entrenado principalmente en ingles; el rendimiento en otros idiomas puede ser inferior, aunque el modelo base soporta chino.
- Riesgo de alucinacion: como cualquier LLM, puede generar codigo incorrecto o inventar APIs inexistentes. Se recomienda validar siempre la salida.
- Sesgos: el modelo puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en contextos de generacion de codigo con nombres de variables o comentarios.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales.
- Para produccion, se recomienda probar exhaustivamente el modelo en el dominio especifico antes de desplegarlo, dado que la cuantizacion puede afectar la fiabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheWirelessPhoenix/Qwen2.5-Coder-7B-Instruct-mlx_4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper tecnico Qwen2.5-Coder: https://arxiv.org/html/2409.12186v1
- Benchmark oMLX (M4): https://omlx.ai/benchmarks/performance/o21qlz68
- Informacion de la conversion en LLM Explorer: https://llm-explorer.com/model/mlx-community%2FQwen2.5-Coder-7B-Instruct-4bit,3wls0bakDefOMzTTSrA2sV
