# Xylolabs/Qwen3-4B-GGUF

## Resumen

Xylolabs/Qwen3-4B-GGUF es una exportación en formato GGUF del modelo Qwen3-4B de Alibaba Qwen, preparada por Xylolabs mediante llama.cpp. No se trata de un modelo nuevo ni de un reentrenamiento: el autor declara explícitamente que no se ha realizado cuantización ni entrenamiento adicional para la publicación, sino que se ofrecen tres checkpoints GGUF alternativos del mismo modelo base de 4.022.468.096 parámetros (~4 B). El objetivo es facilitar el despliegue en local con llama.cpp y otros runtimes compatibles con GGUF, manteniendo la plantilla de chat y el tokenizador originales.

El repositorio incluye tres ficheros: IQ4_XS plano (4,535 bits/peso), IQ4_XS con matriz de importancia preexistente (4,504 bits/peso) y Q5_K_M (5,735 bits/peso). Cada fichero contiene los 398 tensores del modelo de lenguaje y requiere aproximadamente 2,88 GB de memoria de dispositivo para el mayor de ellos, más espacio para la caché KV y buffers. La licencia es Apache 2.0, heredada del Qwen3-4B original.

La relevancia actual es práctica: Qwen3-4B es un modelo denso de la familia Qwen3 con modo de razonamiento (thinking) conmutable, y esta exportación permite ejecutarlo en hardware de consumo con cuantizaciones de 4 y 5 bits, verificadas contra una referencia BF16 mediante métricas de divergencia KL y comprobaciones de respuestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B); pesos exportados en GGUF para llama.cpp |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los metadatos del modelo se mantienen sin cambios; el ejemplo de la model card usa 2.048 tokens) |
| Tipos de cuantización | IQ4_XS, IQ4_XS con importance matrix, Q5_K_M |
| Idiomas soportados | en, ko (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Detalle de los ficheros publicados:

| Fichero | Descarga (GB) | Bits/peso medios | KL media | Respuestas correctas |
|---|---:|---:|---:|---:|
| `Qwen3-4B-IQ4_XS.gguf` | 2,286 | 4,535 | 0,072559 | 30/33 + 7/7 |
| `Qwen3-4B-IQ4_XS-imat.gguf` | 2,271 | 4,504 | 0,056876 | 29/33 + 7/7 |
| `Qwen3-4B-Q5_K_M.gguf` | 2,890 | 5,735 | 0,019301 | 29/33 + 7/7 |

Composición de tipos de tensor por fichero:

| Opción | Tipos de tensor y recuentos |
|---|---|
| `IQ4_XS` | F32: 145, IQ4_XS: 212, Q5_K: 40, Q6_K: 1 |
| `IQ4_XS-imat` | F32: 145, IQ4_XS: 216, Q5_K: 36, Q6_K: 1 |
| `Q5_K_M` | F32: 145, Q5_K: 216, Q6_K: 37 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B original de Alibaba Qwen: un transformer denso de aproximadamente 4 B de parámetros. Esta exportación no introduce cambios arquitectónicos ni entrenamiento adicional; se limita a convertir y cuantizar los pesos con llama.cpp. Cada fichero GGUF contiene los 398 tensores del modelo de lenguaje, junto con el tokenizador y la plantilla de chat originales. Los ficheros son checkpoints alternativos y deben usarse de uno en uno.

La cuantización emplea presets mixtos de GGUF. El fichero `-imat` conserva el resultado de una matriz de importancia preexistente; el autor aclara que los nombres de fichero de calibración históricos son etiquetas de metadatos y que no se incluye ningún dato de calibración. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base; dichos datos deben consultarse en la model card de Qwen/Qwen3-4B.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat original conservada.
- Modo de razonamiento (thinking) conmutable mediante `enable_thinking` en los kwargs de la plantilla de chat; el ejemplo de la model card lo desactiva explícitamente.
- Soporte multilingüe limitado a inglés y coreano según las etiquetas del repositorio.
- Ejecución local con llama.cpp y runtimes compatibles con GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión o audio para esta exportación concreta.

## Casos de uso

- Inferencia local en estación de trabajo: cargar el fichero Q5_K_M con `llama-cli` para tareas de generación de texto y preguntas factuales, aprovechando que el mayor fichero requiere unos 2,88 GB de memoria de dispositivo más caché KV.
- Despliegue en portátiles y equipos de consumo: el fichero IQ4_XS (2,286 GB de descarga) permite ejecutar el modelo en GPU de consumo con VRAM modesta o incluso en CPU, manteniendo una divergencia KL de 0,072559 frente a BF16.
- Evaluación de cuantizaciones: usar los tres ficheros como referencia para medir el impacto de IQ4_XS, IQ4_XS-imat y Q5_K_M en la calidad de las respuestas, con métricas KL y recuentos de respuestas ya publicados.
- Prototipado de asistentes conversacionales en inglés o coreano: la plantilla de chat original y el modo thinking conmutable permiten alternar entre respuestas directas y razonamiento paso a paso según la tarea.
- Integración en pipelines con llama.cpp: el formato GGUF y la compatibilidad con endpoints facilitan su uso como backend de generación de texto en servicios internos.
- Experimentación con presets mixtos de cuantización: comparar el efecto de la matriz de importancia (`-imat`) frente al preset plano en tareas de razonamiento, dado que el autor reporta ratios KL de 0,864× y 1,103× respecto a Q4_K_M.

## Benchmarks y rendimiento

El autor publica comprobaciones de precisión relativas frente a una referencia BF16, no benchmarks estándar (MMLU, HumanEval, GSM8K). Los resultados disponibles son:

| Métrica | IQ4_XS | IQ4_XS-imat | Q5_K_M | Referencia Q4_K_M | Referencia BF16 |
|---|---:|---:|---:|---:|---:|
| KL media | 0,072559 | 0,056876 | 0,019301 | 0,065805 | 0,000325 (suelo) |
| Ratio KL vs Q4_K_M | 1,103× | 0,864× | 0,293× | 1× | — |
| Respuestas correctas | 30/33 + 7/7 | 29/33 + 7/7 | 29/33 + 7/7 | 31/33 + 7/7 | 29/33 + 7/7 |

Las evaluaciones usan 16 secuencias almacenadas, 16.240 posiciones puntuadas, cuatro grupos de texto plano y chat en inglés y coreano, y 33 prompts más siete recomprobaciones con thinking activado. El autor no reporta velocidad ni rendimiento de ejecución en dispositivo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,88 GB para el mayor fichero GGUF (Q5_K_M) solo en pesos, más caché KV y buffers. IQ4_XS e IQ4_XS-imat son algo menores (2,286 y 2,271 GB de descarga).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPU de consumo con 6-8 GB de VRAM o más, así como en CPU.
- Cabe en GPU de consumo: sí, dado el tamaño de los ficheros (2,27-2,89 GB) más la caché KV.
- Opciones de despliegue: llama.cpp (versión verificada v0.9.0 según la model card), y runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3-4B-GGUF | 4.022.468.096 | no disponible | GGUF (IQ4_XS, IQ4_XS-imat, Q5_K_M) | Apache 2.0 | Exportación de Qwen3-4B verificada con KL frente a BF16 |
| Qwen/Qwen3-4B | 4.022.468.096 | no disponible en la información proporcionada | safetensors | Apache 2.0 | Modelo base original; referencia de esta exportación |
| Otras cuantizaciones GGUF de Qwen3-4B | 4.022.468.096 | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos en la información proporcionada |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes ni de datos de benchmarks estándar que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- No se ha realizado entrenamiento ni cuantización nueva para esta publicación; la calidad depende íntegramente del Qwen3-4B original y del preset GGUF elegido.
- Los ficheros son checkpoints alternativos: deben usarse de uno en uno, no combinados.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está documentado.
- La longitud de contexto no se especifica en la información disponible; el ejemplo de la model card usa 2.048 tokens y los metadatos del modelo se mantienen sin cambios.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de factualidad en esta exportación.
- El autor no reporta velocidad, latencia ni rendimiento en dispositivo, solo comprobaciones de precisión en host.
- El fichero `-imat` conserva una matriz de importancia preexistente cuyos nombres de calibración son etiquetas de metadatos; no se incluye dato de calibración alguno.
- Licencia Apache 2.0 sin garantía ni respaldo del upstream, según el aviso del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación GGUF y llama.cpp en Hugging Face: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
