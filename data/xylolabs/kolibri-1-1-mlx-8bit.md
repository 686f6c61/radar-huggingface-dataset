# Xylolabs/Kolibri-1.1-MLX-8bit

## Resumen

Kolibri-1.1-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo Aleph-Alpha/Kolibri-1.1, publicada por Xylolabs. El modelo original es un transformer de tipo mezcla de expertos (MoE) desarrollado por Aleph Alpha, orientado a generación de texto y conversación, con especial atención a los idiomas alemán e inglés. Esta versión mantiene la licencia Apache 2.0 del modelo base y está pensada para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm.

La relevancia de esta ficha radica en que permite ejecutar un modelo de aproximadamente 75.000 millones de parámetros totales en equipos con memoria unificada de gama alta (Mac Studio), algo impracticable con los pesos originales en BF16. La cuantización a 8 bits reduce el tamaño del repositorio a 79,9 GB, con una pérdida de fidelidad medida y documentada por el autor mediante divergencia KL y acuerdo top-1 frente a los pesos originales.

Es importante señalar que mlx-lm no dispone de la arquitectura `kolibri1_1` de forma nativa, por lo que el código del modelo se distribuye como `kolibri1_1.py` y requiere cargarse con `--trust-remote-code`. Esta circunstancia implica ejecutar código remoto y debe evaluarse en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), arquitectura `kolibri1_1` |
| Parametros totales | 75.112.646.912 (~75,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según la tabla de hardware del autor) |
| Tipos de cuantizacion | 8 bits (esta versión); existe también una variante MLX 4-bit de 43,61 GB |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 (con los términos de la model card original) |
| Formato de pesos | safetensors en formato MLX cuantizado |

## Arquitectura y entrenamiento

El modelo base Kolibri-1.1 de Aleph Alpha emplea una arquitectura de transformer con mezcla de expertos (MoE), según indican las etiquetas del repositorio. Esta versión es una conversión directa del modelo original a MLX con cuantización de 8 bits; no se ha realizado un reentrenamiento ni un ajuste fino adicional, sino una transformación de los pesos para su ejecución en Apple Silicon. El repositorio no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta publicación es la propia conversión: el autor documenta métricas de fidelidad frente a los pesos originales en BF16, incluyendo divergencia KL y acuerdo top-1 sobre varios conjuntos (WikiText-2, prompts de chat, held-out y alemán). Además, el código del modelo se distribuye junto con los pesos porque mlx-lm no reconoce la arquitectura de forma nativa.

## Capacidades

- Generación de texto y conversación multi-turno en alemán e inglés.
- Razonamiento y respuesta a prompts de tipo chat, con verificación documentada de 7 prompts de control de respuestas (7/7 respondidos igual que en BF16).
- Procesamiento de contexto largo de hasta 256K tokens, según la tabla de requisitos de memoria del autor.
- Ejecución local en hardware Apple Silicon mediante mlx-lm.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia conversacional en alemán: el modelo está entrenado y evaluado específicamente para este idioma (la métrica German KL es la mejor de la tabla), por lo que resulta adecuado para atención al usuario, resúmenes y redacción en alemán en entornos locales.
- Procesamiento de documentos largos: con 256K tokens de contexto, puede ingerir contratos, informes o expedientes extensos y responder preguntas sobre ellos sin fragmentación.
- Despliegue en estación de trabajo Apple: equipos Mac Studio con 96 GB o más de memoria unificada pueden ejecutar el modelo íntegramente en local, lo que facilita escenarios con requisitos de privacidad y sin conexión a la nube.
- Prototipado e investigación en entornos MLX: sirve para evaluar el comportamiento de un MoE de ~75B en el stack de Apple antes de invertir en infraestructura GPU.
- Traducción y adaptación de contenido entre alemán e inglés: el soporte bilingüe declarado permite tareas de traducción y localización, aunque sin benchmarks publicados que cuantifiquen su calidad.
- Generación de texto asistida por lotes: mediante `mlx_lm.generate` se pueden procesar colas de prompts de forma scriptable en un Mac de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente a los pesos originales en BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Aleman KL | top-1 | Respuestas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 43,61 GB | 0,049350 | 91,22% | 0,041060 | 92,37% | 0,047258 | 90,35% | 0,036535 | 91,77% | 7/7 |
| MLX 8-bit | 79,85 GB | 0,037269 | 92,94% | 0,030178 | 94,04% | 0,034909 | 92,49% | 0,024459 | 93,47% | 7/7 |

La versión de 8 bits mejora a la de 4 bits en todas las métricas de fidelidad, con un acuerdo top-1 entre el 92,49% y el 94,04% según el conjunto, a costa de casi duplicar el tamaño en disco.

## Requisitos de hardware

- VRAM/memoria unificada: 79,9 GB de pesos en 8 bits; se necesita memoria adicional para el contexto, por lo que en la práctica se requieren equipos con 96 GB o más de memoria unificada.
- Hardware recomendado por el autor: Mac Studio M5 Ultra con 96, 256 o 512 GB, y Mac Studio M5 Max con 128 GB, todos con contexto de 256K.
- Alternativa de menor huella: la variante MLX 4-bit (43,6 GB) cabe en un Mac Studio M5 Max de 64 GB con contexto de 256K.
- GPU dedicadas: no se documenta soporte para CUDA ni ROCm en esta versión; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.chat` con `mlx-lm==0.32.2` y la opción `--trust-remote-code`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Kolibri-1.1-MLX-8bit | ~75,1B (MoE) | 256K | MLX safetensors 8-bit | Apache 2.0 | Requiere `--trust-remote-code`; orientado a Apple Silicon |
| Xylolabs/Kolibri-1.1-MLX-4bit | ~75,1B (MoE) | 256K | MLX safetensors 4-bit | Apache 2.0 | 43,61 GB; menor fidelidad (top-1 90,35%-92,37%) |
| Aleph-Alpha/Kolibri-1.1 | ~75,1B (MoE) | no disponible | BF16 | Apache 2.0 | Modelo original; pesos de referencia para las métricas de fidelidad |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Solo se declaran los idiomas alemán e inglés; el rendimiento en castellano u otros idiomas no está verificado.
- La cuantización a 8 bits introduce una divergencia medible frente a BF16 (KL de 0,024459 a 0,037269 según el conjunto), por lo que no es idéntica al modelo original.
- Requiere ejecutar código remoto (`--trust-remote-code`) debido a que mlx-lm no soporta la arquitectura `kolibri1_1` de forma nativa; esto supone un riesgo de seguridad en producción.
- Dependencia estricta de la versión `mlx-lm==0.32.2` y del ecosistema MLX; no hay soporte documentado para CUDA, vLLM ni llama.cpp.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es nula.
- La licencia Apache 2.0 se acompaña de los términos de la model card original de Aleph Alpha, que deben revisarse antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Kolibri-1.1-MLX-8bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del proyecto de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
