# Vicgrace/qwen25_15b_adtc_submission

## Resumen

Este modelo es un fine-tune del Qwen2.5-1.5B-Instruct, convertido al formato GGUF mediante la librería Unsloth. Fue publicado por el usuario Vicgrace bajo el nombre `qwen25_15b_adtc_submission`, con el archivo `qwen2.5-1.5b-instruct.Q4_K_M.gguf` como único peso disponible. El modelo base, Qwen2.5-1.5B, es un transformer denso decoder-only de 1,54 mil millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud, con una ventana de contexto de 32K tokens y entrenado sobre 18 trillones de tokens en su fase de preentrenamiento.

La relevancia de este modelo reside en su tamaño compacto y su formato GGUF, que permite desplegarlo en entornos con recursos limitados mediante llama.cpp, Ollama o servidores compatibles con endpoints. Al ser una adaptación de Qwen2.5-Instruct, hereda las capacidades de instrucción y razonamiento del modelo original, aunque la información disponible no detalla el dataset de fine-tuning específico ni los resultados de evaluación. No se especifica la licencia ni los idiomas soportados, por lo que estos datos deben tratarse como desconocidos para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (base Qwen2.5-1.5B, no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (unico archivo disponible) |
| Idiomas soportados | No disponible (base Qwen2.5 soporta multilingüe, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B es un transformer denso, decoder-only, con arquitectura de atención completa (full attention). Durante el preentrenamiento, se usaron 18 trillones de tokens, y el modelo fue refinado con técnicas de instrucción (SFT) y alineación con preferencias humanas (RLHF/DPO), aunque los detalles exactos del fine-tuning del modelo base no se detallan en este repo. El modelo presentado aquí es un fine-tuning adicional sobre Qwen2.5-1.5B-Instruct, convertido a GGUF con Unsloth, que permite ejecutarlo en CPU o GPU con memoria limitada. No se proporciona información sobre el dataset de entrenamiento ni las técnicas de ajuste empleadas por Vicgrace.

## Capacidades

- **Generacion de texto y conversacion**: al heredar de Qwen2.5-1.5B-Instruct, puede mantener diálogos multi-turno y seguir instrucciones en formato conversacional.
- **Razonamiento y conocimiento general**: soporta tareas de QA, resumen, clasificación y razonamiento básico, aunque con las limitaciones propias de un modelo de 1,5B.
- **Generacion de codigo**: el modelo base tiene cierta capacidad de generación de código (Python, SQL, etc.), aunque no se ha verificado en este fine-tune.
- **Soporte de tool calling**: no confirmado en este modelo específico, aunque Qwen2.5-Instruct incluye soporte para function calling en el modelo base.
- **Capacidades multilingues**: el modelo base soporta más de 29 idiomas, pero no se confirma para este fine-tune.
- **Formato de ejecución**: compatible con llama.cpp y Ollama, lo que facilita su uso en entornos locales y en la nube.

## Casos de uso

- **Asistente conversacional en entornos con recursos limitados**: por su tamaño de 1,5B y formato GGUF, puede ejecutarse en CPU o GPU de gama baja, ideal para chatbots en dispositivos edge o servidores pequeños.
- **Prototipado rapido**: los desarrolladores pueden usar este modelo para validar conceptos de agentes conversacionales antes de escalar a modelos mayores.
- **Generacion de respuestas para sistemas de soporte**: con contexto de 32K tokens, puede gestionar conversaciones largas de atención al cliente, aunque la calidad será inferior a la de modelos de 7B o mayores.
- **Clasificacion y extraccion de informacion**: puede aplicarse a tareas de análisis de texto, como extraer entidades o clasificar documentos, usando prompts en formato instrucción.
- **Educacion y aprendizaje**: útil para generar explicaciones, ejercicios o resúmenes de contenido en aplicaciones educativas, siempre que se supervise la salida.
- **Despliegue en entornos de pruebas**: como modelo GGUF, puede integrarse en pipelines de CI/CD para testing de prompts, generación de datos sintéticos o evaluación de calidad de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-1.5B-Instruct tiene resultados conocidos (por ejemplo, MMLU: 62,1, HumanEval: 69,8, GSM8K: 70,1), pero estos datos no son extrapolables a este fine-tune sin una evaluación específica. Se recomienda realizar una evaluación propia si se va a usar en producción.

## Requisitos de hardware

- **VRAM estimada**: con cuantización Q4_K_M, el modelo ocupa aproximadamente 1,0 GB en memoria. La VRAM necesaria para inferencia es de ~2-3 GB, incluyendo overhead de contexto y KV cache.
- **GPU recomendadas**: funciona en GPUs con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso en CPU con suficiente RAM (8 GB).
- **Cabe en consumer GPU**: sí, cualquier GPU moderna de gama media puede ejecutarlo sin problemas.
- **Opciones de despliegue**: llama.cpp (usando `llama-cli`), Ollama (con el Modelfile incluido), o servidores compatibles con endpoints GGUF (como llama-cpp-python o text-generation-webui).
- **Latencia y throughput**: no disponible, pero para un modelo de 1,5B en una GPU moderna se espera una velocidad de generación de 50-100 tokens/segundo en Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| **Este modelo (Vicgrace/qwen25_15b_adtc_submission)** | 1,54B | 32K (no confirmado) | No disponible | GGUF (Q4_K_M) | Fine-tune de Qwen2.5-1.5B-Instruct |
| **Qwen2.5-1.5B-Instruct (base)** | 1,54B | 32K | Apache 2.0 | Safetensors | Modelo base de instrucción |
| **Llama-3.2-1B-Instruct** | 1,23B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Modelo de instrucción de Meta |
| **Gemma-2-2B** | 2,6B | 8K | Gemma Terms of Use | Safetensors, GGUF | Modelo compacto de Google |

El modelo de Vicgrace se distingue por estar ya cuantizado en GGUF, lo que facilita su despliegue inmediato, pero carece de información de licencia y evaluación. El modelo base Qwen2.5-1.5B es más transparente y con licencia Apache 2.0, mientras que Llama-3.2-1B ofrece contexto más largo y una licencia permisiva, aunque con más restricciones de uso comercial.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, lo que puede impedir su uso comercial o incluso su uso en proyectos personales. Se recomienda contactar al autor antes de cualquier despliegue.
- **Alucinaciones**: al ser un modelo pequeño, es propenso a generar información falsa o inventada, especialmente en tareas de razonamiento complejo o conocimiento factual.
- **Sesgos**: el modelo base puede presentar sesgos heredados de los datos de entrenamiento, no se ha evaluado su mitigación en este fine-tune.
- **Idiomas**: no se confirma el soporte para español u otros idiomas, aunque el modelo base Qwen2.5 es multilingüe.
- **Rendimiento desconocido**: no hay benchmarks publicados para este modelo, por lo que su calidad real es incierta.
- **Dependencia de herramientas**: requiere llama.cpp u otras herramientas compatibles con GGUF; no funciona con librerías como transformers directamente.
- **Contexto no confirmado**: aunque el modelo base soporta 32K, el fine-tune podría haber reducido la ventana de contexto; no se ha verificado.

## Enlaces

- [HuggingFace - Vicgrace/qwen25_15b_adtc_submission](https://huggingface.co/Vicgrace/qwen25_15b_adtc_submission)
- [Coleccion Qwen2.5 en HuggingFace](https://huggingface.co/collections/Qwen/qwen25)
- [Modelo base Qwen2.5-1.5B en HuggingFace](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Qwen2.5 Technical Report (arXiv)](https://arxiv.org/abs/2412.15115)
- [Repositorio Qwen2.5-Omni en GitHub](https://github.com/QwenLM/Qwen2.5-Omni)
- [Repositorio Qwen2.5 en GitHub (mx4ai)](https://github.com/mx4ai/qwen2.5)
- [Unsloth (herramienta de fine-tuning y conversión)](https://github.com/unslothai/unsloth)
