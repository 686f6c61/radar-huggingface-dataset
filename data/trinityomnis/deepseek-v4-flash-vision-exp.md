# trinityomnis/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental de la familia DeepSeek-V4, desarrollado por DeepSeek AI. Se construye sobre la arquitectura de DeepSeek-V4-Flash, a la que se incorporan módulos visuales (vision encoder y aligner) mediante entrenamiento continuado, con el objetivo de desbloquear capacidades de comprensión de imágenes. El modelo está diseñado para tareas de agente tanto en texto como en multimodal, y según la información publicada mejora sustancialmente el rendimiento en agentes multimodales respecto a su predecesor DeepSeek-V4-Flash-0731, manteniendo un rendimiento comparable en tareas de agente puramente textuales.

La arquitectura combina un transformer con mezcla de expertos (MoE), atención DFlash, Hyper-Connections y un forward path denominado DSpark, que también se usa para decodificación especulativa. El modelo tiene un total de 304.646.824.126 parámetros (≈304.6B) y está disponible en formato safetensors, con un tamaño de repositorio de 167.8 GB. Se distribuye bajo licencia MIT y su pipeline en HuggingFace es image-text-to-text. Es un modelo experimental, por lo que su uso en producción requiere una validación exhaustiva previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (DeepSeek-V4-Flash) + vision encoder y aligner |
| Parametros totales | 304.646.824.126 (≈304.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, FP8 (según tags de HuggingFace) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental que parte de la arquitectura DeepSeek-V4-Flash. Incorpora un vision encoder y un aligner para procesar entradas de imagen y convertirlas en representaciones compatibles con el modelo de texto. La arquitectura interna incluye atención DFlash, un mecanismo de mezcla de expertos (MoE), Hyper-Connections y un forward path denominado DSpark. El modelo soporta decodificación especulativa mediante DSpark, que se habilita tanto en vLLM como en SGLang a través de parámetros de configuración específicos (`--speculative-config` en vLLM y `--speculative-algorithm DSPARK` en SGLang).

No se han publicado datos detallados sobre el corpus de entrenamiento, el número de tokens ni la composición del dataset. Tampoco se especifica si se utilizaron técnicas de alineación como RLHF o DPO. La información disponible indica que el modelo fue sometido a entrenamiento continuado para añadir capacidades visuales sobre la base de DeepSeek-V4-Flash. El repositorio incluye una implementación mínima de inferencia en PyTorch que cubre el vision encoder, el aligner, la atención DFlash, el MoE, Hyper-Connections y el forward path DSpark, junto con utilidades de prompt encoding que soportan tanto bloques JSON estilo OpenAI como notación TXT compacta (`<image>path</image>`).

## Capacidades

- Generación de texto y comprensión multimodal (image-text-to-text).
- Razonamiento avanzado con modo de razonamiento configurable (`reasoning-parser deepseek_v4`).
- Tool calling / function calling mediante `tool-call-parser deepseek_v4` y `enable-auto-tool-choice`.
- Soporte de agentes y razonamiento multi-paso, con rendimiento evaluado en benchmarks como Terminal Bench 2.1, NL2Repo, Cybergym, DeepSWE, Toolathlon-Verified, DSBench-Hard y AutomationBench.
- Capacidades multimodales para agentes, evaluadas en ApexBench, Agents' Last Exam, Chartography y ZeroBench.
- Interpretación de gráficos y visualizaciones de datos (Chartography).
- Comprensión de imágenes complejas con razonamiento de alto nivel (ZeroBench).
- Decodificación especulativa nativa con DSpark, lo que reduce la latencia en despliegues con vLLM o SGLang.
- Soporte de prompts en formato OpenAI JSON y notación TXT con rutas de imagen.

## Casos de uso

- Agentes de desarrollo de software: el modelo puede navegar repositorios, entender issues y generar código o parches, como se refleja en NL2Repo y DeepSWE. Es adecuado para integrarse en flujos de trabajo de ingeniería de software asistida por IA.
- Automatización de terminales y administración de sistemas: con un rendimiento de 83.9 en Terminal Bench 2.1, puede ejecutar comandos, gestionar entornos y automatizar tareas operativas en sistemas Unix-like.
- Análisis de gráficos y documentos visuales: gracias a sus capacidades multimodales, puede extraer información de gráficos, tablas y capturas de pantalla, útil en entornos de análisis financiero o de inteligencia de negocio.
- Asistentes de código con tool calling: soporta function calling y puede integrarse en pipelines de CI/CD para generar código, revisar pull requests o automatizar pruebas, aprovechando la decodificación especulativa para reducir tiempos de respuesta.
- Agentes de ciberseguridad: con un 75.3 en Cybergym, puede analizar código malicioso, detectar vulnerabilidades y asistir en tareas de hardening de sistemas.
- Soporte al cliente multimodal: puede atender consultas que incluyan imágenes, como capturas de error o fotografías de productos, manteniendo conversaciones multi-turno y utilizando herramientas externas si es necesario.
- Investigación y desarrollo de agentes: el modelo está pensado para experimentar con arquitecturas de agentes multimodales, y su soporte para razonamiento y tool calling lo hace idóneo para prototipos de agentes autónomos.
- Despliegue de bajo coste con decodificación especulativa: en entornos con GPUs de gran capacidad, DSpark permite acelerar la generación sin necesidad de un modelo draft separado, simplificando la infraestructura.

## Benchmarks y rendimiento

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
| :--- | :---: | :---: | :---: |
| Terminal Bench 2.1 | 83.9 | 82.7 | 85.0 |
| NL2Repo | 57.7 | 54.2 | 69.7 |
| Cybergym | 75.3 | 76.7 | 78.3 |
| DeepSWE | 59.3 | 54.4 | 58.0 |
| Toolathlon-Verified | 75.9 | 70.3 | 76.2 |
| DSBench-Hard | 63.6 | 59.6 | 71.7 |
| AutomationBench (Public) | 25.7 | 25.1 | 27.2 |
| ApexBench (Pass@1) | 36.5 | 26.2† | 39.4 |
| Agents' Last Exam | 27.3 | 25.2† | 25.7 |
| Chartography | 64.3 | - | 65.0 |
| ZeroBench (Pass@5) | 35.0 | - | 34.0 |

Notas:
- Los benchmarks de agentes de texto se evaluaron con DeepSeek Harness en modo mínimo, usando el nivel de razonamiento "max" con `temperature = 1.0` y `top_p = 0.95`.
- † Para ApexBench y Agents' Last Exam, DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada.
- El símbolo "-" indica que el modelo no fue evaluado en ese benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio de safetensors ocupa 167.8 GB, y el comando de despliegue con vLLM utiliza un nodo de 4×GB300, lo que sugiere que se requiere una infraestructura de GPU de gran escala.
- GPU recomendadas: NVIDIA GB300 (según el comando de vLLM proporcionado). Para despliegues con menos recursos, no se especifican configuraciones alternativas.
- Tamaño del modelo: con 304.6B parámetros, no es viable en GPUs de consumo. Se necesitan múltiples GPUs de datacenter con paralelismo tensor.
- Opciones de despliegue: vLLM (con comando específico que incluye `--tensor-parallel-size 4`, `--kv-cache-dtype fp8` y `--speculative-config`), SGLang (con `--speculative-algorithm DSPARK`), y la implementación mínima de inferencia en PyTorch incluida en el repositorio.
- Latencia y throughput: no disponibles. La decodificación especulativa con DSpark está diseñada para mejorar la latencia, pero no se proporcionan métricas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
| :--- | :---: | :---: | :---: | :---: |
| DeepSeek-V4-Flash-Vision-Exp | 304.6B | no disponible | MIT | HuggingFace (trinityomnis y deepseek-ai) |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible |
| Opus-4.8 | no disponible | no disponible | no disponible | no disponible |

En términos de rendimiento, DeepSeek-V4-Flash-Vision-Exp supera a DeepSeek-V4-Flash-0731 en la mayoría de benchmarks de agentes de texto y en todos los benchmarks multimodales evaluados, aunque queda por debajo de Opus-4.8 en varios de ellos. No se dispone de información sobre parámetros, contexto ni licencia para los modelos comparados.

## Limitaciones y advertencias

- Modelo experimental: no se recomienda su uso en producción sin una validación exhaustiva previa.
- Sesgos y alucinaciones: como todo modelo de lenguaje de gran tamaño, puede generar contenido falso o sesgado. No se han publicado evaluaciones de sesgos ni de seguridad.
- Idiomas: no se especifica qué idiomas soporta, por lo que su rendimiento en lenguas distintas del inglés o del chino es desconocido.
- Contexto: la longitud de contexto no está documentada, lo que limita la previsibilidad en tareas que requieren ventanas de contexto muy largas.
- Requisitos de infraestructura: el despliegue necesita un clúster de GPUs de datacenter (por ejemplo, 4×GB300), lo que restringe su uso a organizaciones con recursos de hardware avanzados.
- Datos de entrenamiento: no se ha publicado información sobre la composición del corpus ni sobre técnicas de alineación, lo que dificulta evaluar su comportamiento ético y su robustez.
- Los benchmarks publicados se centran en tareas de agente y pueden no reflejar el rendimiento en tareas generales de comprensión de lenguaje o visión.

## Enlaces

- Repositorio en HuggingFace (trinityomnis): https://huggingface.co/trinityomnis/DeepSeek-V4-Flash-Vision-Exp
- Repositorio oficial en HuggingFace (deepseek-ai): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Sitio web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
