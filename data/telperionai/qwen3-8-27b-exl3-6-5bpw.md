# TelperionAI/Qwen3.8-27B-EXL3-6.5bpw

## Resumen

TelperionAI/Qwen3.8-27B-EXL3-6.5bpw es una cuantización del modelo Qwen3.8-27B de Alibaba, realizada por TelperionAI mediante el formato EXL3 (una variante de QTIP) a 6,5 bits por peso, con un pre-paso de suavizado AWQ sobre los pesos BF16 originales. El resultado es un checkpoint de 23,0 GB que permite ejecutar un modelo de 27B en hardware local con una sola GPU de 24 GB, manteniendo una alta fidelidad respecto al modelo base.

La relevancia de esta versión radica en que EXL3 es un formato de cuantización relativamente nuevo, soportado únicamente por exllamav3 y TabbyAPI, que ofrece una buena relación calidad-tamaño. Según las mediciones del autor, este build a 6,5 bpw consigue la mejor concordancia global con el BF16 base en comparación con otras cuantizaciones de la misma serie (INT4, NVFP4, FP8), aunque no supera al INT4-AWQ-GPTQ en las métricas de daño real (confident y certain).

El modelo base Qwen3.8-27B es un transformer denso multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, orientado a tareas de código, flujos de trabajo agénticos y automatización ofimática. Esta cuantización no documenta explícitamente si se conserva el soporte de visión, pero al ser una transformación de los pesos del mismo modelo, se asume que las capacidades se mantienen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) |
| Parametros totales | 27B (modelo base) / 12.230.358.256 en safetensors cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 6,5 bpw (variante QTIP) con pre-suavizado AWQ |
| Idiomas soportados | No disponible (el modelo base es presumiblemente multilingue, sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal de Alibaba, con capacidades de texto e imagen. No se dispone de información detallada sobre su arquitectura interna (número de capas, dimensiones, cabezas de atención) ni sobre su entrenamiento (tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada.

Esta versión concreta aplica una receta de cuantización en dos pasos: primero, un suavizado AWQ sobre los pesos BF16, que es una transformación que preserva la función (pliega `1/s` en la normalización previa y `s` en la siguiente capa lineal), calibrada con 256 secuencias. Después, se convierte a EXL3 a 6,5 bits por peso, incluyendo el `lm_head` a 6 bpw y las capas MTP cuantizadas inline. El autor indica que AWQ apila correctamente porque deja un checkpoint BF16 ordinario, a diferencia de GPTQ o AutoRound, cuyos errores de compensación están ligados a decisiones de redondeo específicas que EXL3 descarta.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM denso de 27B, capaz de tareas de lenguaje general.
- Codigo: segun la descripcion oficial de Qwen3.8-27B, destaca en generacion y comprension de codigo.
- Agentes y flujos de trabajo agénticos: el modelo base esta disenado para tareas de agente y automatizacion de oficina.
- Multimodalidad: el modelo base acepta entradas de texto e imagen, aunque esta cuantizacion no documenta explicitamente el soporte de vision.
- Tool calling / function calling: no se menciona en la documentacion, pero el modelo base soporta agentic workflows, lo que sugiere capacidad de invocacion de herramientas.
- Multilingue: no confirmado, pero probable dado el origen del modelo base.

## Casos de uso

- Inferencia local de alta calidad: con 23,0 GB de peso, puede ejecutarse en una GPU de 24 GB (RTX 3090/4090, A100 40GB) para aplicaciones de escritorio o servidores de un solo nodo.
- Desarrollo de agentes y automatizacion ofimatica: el modelo base esta optimizado para tareas de agente, como gestion de correo, generacion de documentos o integracion con APIs, y esta cuantizacion permite ejecutarlo en hardware modesto.
- Generacion de codigo en entornos locales: ideal para asistentes de programacion que requieran privacidad y baja latencia, sin depender de servicios en la nube.
- Investigacion en cuantizacion: el autor proporciona metricas detalladas de fidelidad, lo que lo convierte en un caso de estudio util para comparar formatos de cuantizacion (EXL3 vs INT4 vs NVFP4).
- Despliegue en servidores con una sola GPU: para aplicaciones de produccion que no necesiten alto throughput por lotes, exllamav3 permite servir el modelo con 492 tok/s en modo single-stream.
- Prototipado rapido con TabbyAPI: al ser compatible con TabbyAPI, se puede integrar en entornos de desarrollo que usen esta API para experimentar con el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. En su lugar, el autor proporciona mediciones de fidelidad de cuantizacion, comparando la salida de cada build con la del BF16 base sobre 231 documentos y 142.727 posiciones de token puntuadas. La tabla siguiente resume los resultados:

| Build | bits/peso | Tamano | top-1 ↑ | near-tie ↓ | moderate ↓ | confident ↓ | certain ↓ | divmed ↑ | tok/s |
|---|---|---|---|---|---|---|---|---|---|
| TelperionAI INT4-AWQ-GPTQ (vLLM) | 4,63 | 25,1 GB | 96,30% | 22,29% | 3,52% | 0,93% | 0,09% | 48 | 4617 |
| **Este modelo — EXL3 6,5 bpw** | 6,50 | 23,0 GB | **97,10%** | **17,03%** | **2,41%** | 1,23% | 0,15% | **59** | 492* |
| EXL3 5,5 bpw | 5,50 | 20,0 GB | 96,12% | 22,81% | 3,52% | 1,34% | 0,16% | 55 | 516* |
| Qwen FP8 (referencia, vLLM) | 8,00 | ~30 GB | 96,15% | 22,70% | 3,48% | 1,45% | 0,08% | 47 | 8711 |
| TelperionAI NVFP4 (vLLM) | 4,50 | 24,7 GB | 93,62% | 32,25% | 8,59% | 1,85% | 0,16% | 29 | 10521 |
| EXL3 4,0 bpw | 4,00 | 16,0 GB | 93,82% | 31,66% | 6,94% | 2,40% | 0,58% | 28 | 570* |
| EXL3 4,0 bpw, sin AWQ | 4,00 | 16,0 GB | 93,17% | 34,05% | 8,41% | 3,08% | 0,16% | 27 | 561* |

\* El throughput de EXL3 es single-stream argmax en una GPU via exllamav3, no comparable con las cifras batched de vLLM.

Las columnas `confident` y `certain` representan tasas de discrepancia con el BF16 base en posiciones donde el modelo base tenia alta confianza (margen top1−top2 de 2–5 y >5, respectivamente). Solo estas dos metricas indican dano real; `near-tie` y `moderate` son ruido numerico o desviaciones leves. `divmed` es la mediana del indice de token en el que la generacion greedy diverge del base (mayor es mejor).

## Requisitos de hardware

- VRAM estimada: al menos 24 GB para el checkpoint de 23,0 GB (6,5 bpw). Para margen de seguridad, se recomienda una GPU con 24 GB o mas.
- GPUs compatibles: RTX 3090, RTX 4090, A100 40GB, A6000, etc. No cabe en GPUs de 16 GB (aunque la version EXL3 4,0 bpw de 16,0 GB si cabria).
- Opciones de despliegue: exllamav3 o TabbyAPI. No es compatible con vLLM, TGI ni llama.cpp (formato EXL3 exclusivo).
- Latencia y throughput: 492 tok/s en modo single-stream argmax con una GPU (medido por el autor, sin optimizacion). No se dispone de datos de throughput batched.
- Para uso en produccion con multiples peticiones concurrentes, se necesitaria un servidor con varias GPUs o recurrir a otras cuantizaciones compatibles con vLLM (como INT4-AWQ-GPTQ).

## Comparativa con modelos similares

La comparativa mas directa es con otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos alternativos de 27B. La tabla de fidelidad anterior muestra que:

- Frente a NVFP4 (vLLM): el EXL3 6,5 bpw es mas fiel (confident 1,23% vs 1,85%) y mas pequeno (23,0 GB vs 24,7 GB), aunque con un throughput mucho menor (492 vs 10521 tok/s).
- Frente a INT4-AWQ-GPTQ (vLLM): el INT4 es mas fiel en las metricas de dano real (confident 0,93% vs 1,23%; certain 0,09% vs 0,15%) y mucho mas rapido (4617 tok/s), pero ocupa 2,1 GB mas.
- Frente a EXL3 5,5 bpw: el 6,5 bpw mejora la fidelidad (confident 1,23% vs 1,34%) a costa de 3 GB adicionales, con un rendimiento ligeramente inferior (492 vs 516 tok/s). El autor senala que 5,5 bpw es el punto de equilibrio (knee) de la curva de bitrate.

En terminos de modelo base, Qwen3.8-27B compite con otros LLMs de 27B como Llama 3.1 8B (menor tamano) o Mistral Large 2 (mayor tamano), pero no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad: aunque este build es el mas fiel en terminos globales, presenta una tasa de discrepancia del 1,23% en posiciones de alta confianza (confident) y 0,15% en posiciones de certeza (certain) respecto al BF16 base. El INT4-AWQ-GPTQ de TelperionAI es aun mas fiel en esas metricas.
- Requisito de software: EXL3 solo puede servirse con exllamav3 o TabbyAPI. No es compatible con vLLM, TGI, llama.cpp ni Ollama, lo que limita su integracion en infraestructuras existentes.
- Throughput limitado: el rendimiento medido (492 tok/s) es single-stream y no batched; para aplicaciones con alta concurrencia, otras cuantizaciones con vLLM son muy superiores.
- Informacion incompleta: no se documentan la longitud de contexto, los idiomas soportados ni las capacidades multimodales especificas de esta cuantizacion. Se asume que hereda las del modelo base, pero no esta confirmado.
- Sesgos y alucinaciones: no hay informacion sobre sesgos conocidos o tasas de alucinacion del modelo base. Como cualquier LLM, puede generar contenido incorrecto o sesgado.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TelperionAI/Qwen3.8-27B-EXL3-6.5bpw
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
- Otros modelos de TelperionAI (INT4-AWQ-GPTQ): https://huggingface.co/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ
- Entrada en LLM Explorer: https://llm-explorer.com/model/TelperionAI%2FQwen3.8-27B-NVFP4-AWQ-GPTQ,7sti5ZDCLMFpd7O9iPnnBQ
