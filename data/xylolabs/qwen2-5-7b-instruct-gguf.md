# Xylolabs/Qwen2.5-7B-Instruct-GGUF

## Resumen

Xylolabs/Qwen2.5-7B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-7B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio, publicado por Xylolabs, distribuye una única variante Q4_K_M de 4,683 GB pensada para su ejecución con llama.cpp en hardware de consumo y estaciones de trabajo. El modelo base es un transformer denso de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) con licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo instructivo de 7B en local con un equilibrio razonable entre tamaño y fidelidad respecto al original en BF16. El autor publica métricas de divergencia KL y acuerdo top-1 frente a BF16 para justificar la elección de la cuantización, algo poco habitual en repositorios de cuantizaciones de terceros.

El repositorio declara únicamente los idiomas inglés (en) y coreano (ko) en sus metadatos, aunque el modelo base Qwen2.5 es multilingüe por diseño. Esta discrepancia debe tenerse en cuenta al evaluar el soporte real de idiomas, especialmente para castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (según tabla de recomendación de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | en, ko (según metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso decoder-only de aproximadamente 7,6 mil millones de parámetros. Esta ficha corresponde a una conversión a GGUF y cuantización Q4_K_M realizada por Xylolabs sobre los pesos oficiales; el repositorio no documenta detalles adicionales sobre el entrenamiento del modelo base (número de tokens, composición del dataset, etapas de RLHF o DPO), por lo que esos datos deben consultarse en la model card original de Qwen. El autor indica que la conversión se verificó con la build de llama.cpp `cd959bae99ff4bed22bef2604f45241c09bbb8c8`.

La innovación técnica destacable de este repositorio no está en la arquitectura, sino en la evaluación de la cuantización: se publican métricas de divergencia KL media respecto a BF16 y de acuerdo top-1, medidas con llama.cpp sobre WikiText-2 y un conjunto held-out. Para Q4_K_M se reporta una KL de 0,034830 en WikiText-2 (top-1 del 91,402 %) y una KL de 0,027718 en held-out (top-1 del 92,353 %). El autor incluye además comparativas con cuantizaciones propias de llama.cpp (Q8_0, Q6_K, Q5_K_M, Q3_K_M) y con ficheros de otros proveedores, lo que permite situar la pérdida de fidelidad de esta conversión concreta.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del ajuste instructivo de Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de complejidad media, adecuado para un modelo de 7B.
- Generación de código y asistencia en tareas de programación (capacidad del modelo base; el repositorio no aporta evaluaciones propias).
- Capacidades multilingües del modelo base Qwen2.5; los metadatos del repositorio solo declaran inglés y coreano.
- Ejecución local con llama.cpp mediante `llama-cli` con la opción `--jinja` para plantillas de chat.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan en este repositorio capacidades de visión, audio, tool calling específico ni modo de razonamiento extendido; deben verificarse en la model card del modelo base.

## Casos de uso

- Asistente conversacional local: desplegar el modelo con llama.cpp en una estación de trabajo para mantener conversaciones multi-turno con hasta 32K tokens de contexto, sin dependencia de servicios en la nube.
- Prototipado rápido en equipos de desarrollo: usar el fichero Q4_K_M de 4,7 GB para validar pipelines de generación de texto antes de pasar a variantes de mayor precisión o a modelos mayores.
- Generación de código en entornos con requisitos de privacidad: ejecutar el modelo en local para autocompletado y explicación de código sin enviar datos a terceros, aprovechando la licencia Apache 2.0.
- Procesamiento de documentos largos: gracias a la ventana de 32K tokens, resumir o extraer información de contratos, informes o transcripciones que no caben en modelos de contexto corto.
- Educación y experimentación académica: reproducir experimentos de cuantización y medir la degradación respecto a BF16 usando las métricas KL y top-1 publicadas como referencia.
- Despliegue en hardware de consumo: ejecutar el modelo en una RTX 4090 o RTX 3090 (24 GB) con contexto de 32K, según la tabla de recomendación del autor, para tareas de asistencia y generación de contenido.
- Integración en herramientas de línea de comandos: usar `llama-cli` con plantillas Jinja para incorporar el modelo en scripts de automatización de texto.

## Benchmarks y rendimiento

El repositorio no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) del modelo. Sí incluye métricas de fidelidad de la cuantización frente a BF16 medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,099 GB | 0,001288 | 98,098 % | 0,001302 | 98,020 % |
| llama.cpp Q6_K | 6,254 GB | 0,004518 | 96,446 % | 0,004115 | 96,863 % |
| llama.cpp Q5_K_M | 5,445 GB | 0,010590 | 94,990 % | 0,008788 | 95,471 % |
| Q4_K_M (este repo) | 4,683 GB | 0,034830 | 91,402 % | 0,027718 | 92,353 % |
| llama.cpp Q3_K_M | 3,808 GB | 0,111754 | 85,029 % | 0,089577 | 86,775 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 4,683 GB; el autor estima que un fichero encaja cuando su tamaño más la caché KV en f16 a ese contexto más 2 GB de runtime queda por debajo del 90 % de la memoria disponible.
- GPU recomendadas por el autor: RTX 4090 y RTX 3090 (24 GB) con contexto de 32K; RTX 5090 (32 GB); RTX 6000 Ada o 2 × 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB a contexto de 32K según la tabla del autor.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB) aparecen soportados con contexto de 32K.
- Opciones de despliegue: llama.cpp (build `cd959bae` o posterior) mediante `llama-cli -m Qwen2.5-7B-Instruct-Q4_K_M.gguf --jinja`. El repositorio no documenta explícitamente otros runtimes (Ollama, vLLM, TGI), aunque al ser GGUF estándar deberían poder cargarlo herramientas compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-GGUF (este) | 7,6B | 32K | GGUF Q4_K_M | Apache 2.0 | Cuantización de terceros con métricas KL publicadas |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K (según modelo base) | safetensors | Apache 2.0 | Modelo original en BF16; referencia de calidad |
| Cuantizaciones oficiales de llama.cpp de Qwen2.5-7B-Instruct | 7,6B | 32K | GGUF (Q8_0 a Q3_K_M) | Apache 2.0 | Mismo modelo base; el autor las usa como referencia de fidelidad |

No se dispone en la información proporcionada de comparativas con otros modelos de 7B de la misma categoría (por ejemplo, Llama 3.1 8B Instruct o Mistral 7B Instruct) en términos de benchmarks de tareas.

## Limitaciones y advertencias

- Sesgos: no documentados en el repositorio; el modelo base Qwen2.5 puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de 7B; no se han publicado evaluaciones específicas de factualidad en este repositorio.
- Idiomas: los metadatos solo declaran inglés y coreano; el soporte de castellano no está garantizado por el autor, aunque el modelo base Qwen2.5 es multilingüe.
- Cuantización: Q4_K_M introduce una pérdida medible de fidelidad (KL de 0,034830 en WikiText-2, top-1 del 91,402 %); para tareas sensibles a la precisión puede ser preferible una cuantización mayor o los pesos originales en BF16.
- Licencia: Apache 2.0 permite uso comercial, pero el autor indica que Xylolabs no está afiliado ni respaldado por los autores del modelo original; debe conservarse el fichero `NOTICE` con la atribución.
- Producción: el repositorio no documenta latencia, throughput ni pruebas de carga; conviene validar el rendimiento en el hardware objetivo antes de desplegar.
- Fecha de creación del repositorio: los metadatos indican 2026-11-14, fecha que conviene verificar antes de citar el recurso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-GGUF/blob/main/LICENSE
- llama.cpp (build de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
