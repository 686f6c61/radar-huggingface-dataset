# yeasah/MiniCPM5-2B-exl3

## Resumen

MiniCPM5-2B-exl3 es una familia de cuantizaciones EXL3 del modelo base openbmb/MiniCPM5-2B, publicada por el usuario yeasah. El modelo subyacente es MiniCPM5-2B, un modelo de lenguaje de 2.000 millones de parámetros desarrollado por OpenBMB, orientado a despliegue en dispositivo (on-device) y edge computing, con soporte declarado de contexto largo y tool calling. Esta ficha describe la variante cuantizada, que mantiene la licencia Apache 2.0 del original y ofrece cinco niveles de compresión entre 3,00 y 6,00 bits por peso.

La relevancia de esta publicación está en el método de cuantizacion: no es un EXL3 genérico, sino una calibración específica para lo que el modelo "lee y escribe mientras trabaja" (documentos, salidas de herramientas, código, diffs y respuestas propias), con asignación de bits por tensor según sensibilidad medida y redondeo con factor de Fisher del lado de salida (LDLQ de dos lados, tras YAQA). El resultado es que a 4,00 BPW el checkpoint ocupa 1,24 GiB y pierde solo 1,59% de perplejidad, mientras que a 3,00 BPW se queda en 0,98 GiB con un 6,26% de aumento.

El repo ocupa 8,0 GB porque incluye todas las revisiones de bitrate. Cada nivel se sirve como revisión independiente y requiere exllamav3 1.6.4 o posterior (porque también se cuantiza la tabla de embeddings de entrada) o vLLM mediante el plugin vllm-exl3-plugin del mismo autor. La información disponible no detalla la arquitectura interna del MiniCPM5-2B original, por lo que los campos correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B; tags indican familia llama/minicpm) |
| Parametros totales | 2.000 millones (según nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag "long-context" sugiere contexto largo, sin cifra publicada) |
| Tipos de cuantizacion | EXL3 en 3,00, 3,50, 4,00, 5,00 y 6,00 BPW (revisiones separadas) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (checkpoint cuantizado compatible con exllamav3 y vLLM vía plugin) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniCPM5-2B en los datos proporcionados (solo los tags "minicpm", "minicpm5" y "llama", que apuntan a una familia tipo transformer decoder-only). Tampoco se detalla el número de tokens de entrenamiento ni la composición exacta del corpus. Los datasets listados en la model card del modelo base (Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609) indican un pipeline que combina preentrenamiento web, datos matemáticos y de código, SFT y una fase de RL, presumiblemente con datos de agentes y tool calling.

La innovación técnica de esta publicación no está en el modelo base sino en el proceso de cuantizacion EXL3: calibración sobre texto que el modelo consume y produce en tareas reales (documentos, salidas de herramientas, código y diffs, respuestas del propio modelo) en lugar de texto web genérico; asignación de bits por tensor a partir de la sensibilidad medida en las respuestas del modelo, manteniendo el mismo tamaño total que una asignación uniforme; y redondeo ponderado por la importancia de cada salida para las predicciones (LDLQ de dos lados con factor de Fisher del lado de salida, después de YAQA). Según la model card, esto cambia solo cómo se redondean los valores, no el tamaño ni el formato. La tabla de "Facts kept" (871 preguntas cerradas) muestra que la pérdida no es uniforme: el quant retiene lo que el modelo original sabía con seguridad y pierde más lo que apenas sabía.

## Capacidades

- Generación de texto en inglés y chino.
- Soporte declarado de tool calling / function calling (tag "tool-calling" y datasets de agentes y RL).
- Orientado a contexto largo (tag "long-context"), aunque la longitud exacta no está publicada.
- Diseñado para despliegue on-device y edge (tags "on-device", "edge-ai").
- Compatible con transformers (library_name) y con exllamav3 / vLLM vía plugin.
- No se documentan capacidades de visión, audio, thinking mode ni decodificación especulativa en la información disponible.

## Casos de uso

- Asistente local en dispositivo: con checkpoints de 0,98 a 1,73 GiB, el modelo cabe en equipos con poca VRAM y puede ejecutarse como asistente de texto offline en portátiles o mini-PC, usando exllamav3 como runtime.
- Automatización de agentes con tool calling: los datasets de SFT de agentes y RL del modelo base apuntan a uso en pipelines donde el modelo invoca funciones; el EXL3 a 5,00 o 6,00 BPW preserva mejor las respuestas factuales (93,9% y 97,3% de "facts kept") necesarias para no encadenar errores.
- Generación y revisión de código en local: la calibración incluye código y diffs, lo que hace que a 4,00 BPW (1,24 GiB) el modelo sea adecuado para autocompletado y revisión de parches en entornos con GPU consumer.
- Procesamiento de documentos largos: el tag de contexto largo y la calibración sobre documentos permiten resumir y extraer información de textos extensos en un servicio self-hosted con vLLM y vllm-exl3-plugin.
- Servicio multiusuario de bajo coste: vLLM con el plugin permite servir varias peticiones concurrentes con menos de 1,6 GiB de VRAM de pesos a 6,00 BPW, liberando el resto para KV cache.
- Evaluación de cuantizaciones en investigación: las revisiones por bitrate y las métricas publicadas (Excess KLD, Δ perplexity, facts kept, confident errors) permiten comparar el compromiso calidad/tamaño de EXL3 frente a GGUF Q6_K de bartowski en las mismas evaluaciones.
- Chat bilingüe inglés-chino: el soporte declarado de ambos idiomas lo hace utilizable en atención al cliente o documentación para mercados que requieren EN y ZH.

## Benchmarks y rendimiento

La model card publica métricas de cuantizacion, no benchmarks de capacidad (MMLU, HumanEval, GSM8K). Se reproducen los datos disponibles:

| BPW | Tamano en disco | VRAM (vLLM) | Excess KLD | Δ perplejidad | Facts kept | Errores confiados |
|---|---|---|---|---|---|---|
| 3,00 | 0,98 GiB | 0,85 GiB | 0,0603 | +6,26% | 76,3% | 4,59% |
| 3,50 | 1,09 GiB | 0,97 GiB | 0,0304 | +3,23% | 81,1% | 3,90% |
| 4,00 | 1,24 GiB | 1,11 GiB | 0,0148 | +1,59% | 89,0% | 1,38% |
| 5,00 | 1,50 GiB | 1,34 GiB | 0,0039 | +0,34% | 93,9% | 0,11% |
| 6,00 | 1,73 GiB | 1,57 GiB | 0,0011 | +0,09% | 97,3% | 0,00% |
| base | 4,69 GiB | no disponible | 0 | 0 | 100% | 0% |

"Facts kept" se mide sobre 871 preguntas cerradas que el modelo sin cuantizar responde correctamente, con puntuación token a token; "errores confiados" son preguntas donde el quant asigna al menos 70% a un token incorrecto. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM de pesos en vLLM: 0,85 GiB (3,00 BPW) hasta 1,57 GiB (6,00 BPW); el checkpoint en disco va de 0,98 a 1,73 GiB.
- El modelo base sin cuantizar ocupa 4,69 GiB en checkpoint.
- Cabe en GPU consumer: cualquier GPU con 2 GB o más de VRAM libre puede alojar los pesos a 6,00 BPW; con 1 GB libre se puede usar 3,00 BPW. La VRAM total necesaria depende de la KV cache y del contexto configurado.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y A100/H100 son holgadas para los pesos, y estas últimas permiten mayor concurrencia y contexto.
- Despliegue: exllamav3 1.6.4 o posterior (obligatorio por la cuantizacion de embeddings de entrada) y vLLM mediante vllm-exl3-plugin. La library_name del repo es transformers, pero el formato EXL3 requiere los runtimes citados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yeasah/MiniCPM5-2B-exl3 (esta ficha) | 2.000 M | no disponible | Apache 2.0 | EXL3 (3,00-6,00 BPW) | Calibración específica para uso agéntico y de código; métricas de KLD y facts kept publicadas |
| openbmb/MiniCPM5-2B | 2.000 M | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base sin cuantizar, 4,69 GiB |
| bartowski/MiniCPM5-2B-GGUF | 2.000 M | no disponible | Apache 2.0 | GGUF | Referencia Q6_K usada en las gráficas del autor; evaluado por llama.cpp en las mismas pruebas |

No se dispone de datos de benchmarks de capacidad para comparar rendimiento entre estas variantes; la comparación disponible es exclusivamente de tamaño, formato y métricas de cuantizacion.

## Limitaciones y advertencias

- La cuantizacion introduce pérdida de conocimiento factual: a 3,00 BPW se conserva el 76,3% de los hechos y el 4,59% de las respuestas son errores confiados; incluso a 6,00 BPW se pierde un 2,7% de hechos. No recomendable para tareas que exijan exactitud factual estricta por debajo de 5,00 BPW.
- Riesgo de alucinacion inherente al modelo base, agravado por la cuantizacion en bitrates bajos.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- La longitud de contexto real no está publicada; el tag "long-context" no especifica cifra y la KV cache debe dimensionarse aparte de los pesos.
- Requiere exllamav3 1.6.4 o posterior; versiones anteriores no funcionan por la cuantizacion de embeddings. El soporte en vLLM depende de un plugin de terceros (vllm-exl3-plugin), no del core de vLLM.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento citados.
- Las métricas publicadas (Excess KLD, facts kept) miden fidelidad respecto al modelo sin cuantizar, no capacidad absoluta; no deben interpretarse como rendimiento en tareas.
- El repo de 8,0 GB contiene todas las revisiones; hay que descargar solo la revisión del bitrate elegido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/MiniCPM5-2B-exl3
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Commit del modelo base usado: https://huggingface.co/openbmb/MiniCPM5-2B/tree/42433e90dad95123ab87729fd7011e7110629556
- exllamav3: https://github.com/turboderp-org/exllamav3
- Plugin vLLM EXL3: https://github.com/yeasah/vllm-exl3-plugin
- GGUF de referencia: https://huggingface.co/bartowski/MiniCPM5-2B-GGUF
- Detalle técnico de las cuantizaciones: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/blob/main/TECHNICAL.md
- Revisión 3,00 BPW: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/tree/3.00bpw-H5
- Revisión 3,50 BPW: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/tree/3.50bpw-H5
- Revisión 4,00 BPW: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/tree/4.00bpw
- Revisión 5,00 BPW: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/tree/5.00bpw
- Revisión 6,00 BPW: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/tree/6.00bpw
