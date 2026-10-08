# xbill9/gemma-4-12B-it-qat-q4_0-fp8-text-emb4

## Resumen

Este repositorio contiene una conversión no oficial, publicada por el usuario xbill9, de los pesos de Gemma 4 12B-it entrenados con cuantización consciente (QAT) por Google DeepMind. El punto de partida es `google/gemma-4-12B-it-qat-q4_0-unquantized` (revisión `b6ed862`), del que se conservan los pesos pero se cambia el formato de almacenamiento: todas las capas lineales se guardan en FP8 E4M3 con una escala float32 por canal de salida, y las activaciones se cuantizan a FP8 por token en tiempo de ejecución (esquema W8A8 de la librería compressed-tensors). Las tablas de embeddings y de `lm_head` son int4, copiadas sin modificar del build `xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4` (revisión `94ff29e`), y el `lm_head` no está atado a los embeddings.

El modelo tiene 12.913.983.280 parámetros, un checkpoint de 11,22 GiB y es una variante de solo texto. Su interés práctico es doble: por un lado, permite servir un Gemma 4 12B-it en GPUs con soporte nativo de FP8 aprovechando el ahorro de memoria del formato; por otro, sirve como caso de estudio de re-cuantización de pesos QAT, ya que el autor documenta el error introducido al pasar de una rejilla de 4 bits con escala por grupo de 32 valores a FP8 con escala por canal.

Conviene subrayar que se trata de un artefacto sin evaluar ni servir todavía: el autor indica explícitamente que está construido y verificado en local contra su fuente, pero que aún no se ha desplegado y que está en cola para una campaña de serving en una única AMD Instinct MI300X. No cuenta con resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (tag `gemma4_unified_text`); transformer denso, detalle interno no disponible |
| Parámetros totales | 12.913.983.280 (12,91 B) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos FP8 E4M3 con una escala float32 por canal de salida; activaciones FP8 por token en runtime (W8A8, compressed-tensors `float-quantized`); embeddings y `lm_head` en int4; origen QAT de 4 bits con escala por grupo de 32 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (`license_link` apunta a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors; librería declarada: vllm |
| Modelo base | google/gemma-4-12B-it-qat-q4_0-unquantized (revisión `b6ed862`) |
| Tamaño del checkpoint | 11,22 GiB |
| Tamaño del repositorio | 12,1 GB |
| Módulos lineales en FP8 | 328 |
| Valores cuantizados | 10.899.947.520 |
| Construido con | `fp8_text.py` y `repack_q4_0.py` (incluidos en el repositorio) |

## Arquitectura y entrenamiento

El modelo original es un Gemma 4 12B-it, es decir, un modelo instruido de la familia Gemma 4. Google lo entrenó con cuantización consciente (QAT) sobre una rejilla de 4 bits con una escala por cada grupo de 32 valores. Este repositorio no vuelve a entrenar nada: parte de esos pesos QAT y los re-cuantiza. Como FP8 con una escala por canal de salida no puede representar escalas por grupo de 32, el build redondea de nuevo los pesos y, además, cuantiza las activaciones. No se utiliza ningún dato de calibración en el proceso; la conversión se apoya en los scripts `fp8_text.py` (construido sobre el build con embeddings int4) y `repack_q4_0.py`, ambos incluidos en el repositorio.

La verificación documentada en `verify_report.json` ofrece las siguientes métricas de fidelidad respecto a los pesos QAT de origen:

| Métrica de verificación (frente a los pesos QAT) | Valor |
|---|---:|
| Módulos lineales en FP8 | 328 |
| Valores cuantizados | 10.899.947.520 |
| Error RMS relativo | 2,64 % |
| Error máximo, como fracción del mayor valor de su fila | 3,57 % |
| Otros tensores byte a byte idénticos a su fuente | 337 de 337 |
| Checkpoint | 11,22 GiB |

No se documenta innovación algorítmica adicional (ni decodificación especulativa, ni atención lineal, ni variantes híbridas). La particularidad técnica del build es exclusivamente el esquema de cuantización W8A8 con embeddings int4 y `lm_head` no atado.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y el modelo es una variante de solo texto del Gemma 4 12B-it.
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, coherente con que el modelo base sea una versión instruida (`-it`).
- Razonamiento, matemáticas, código y otras capacidades concretas: no disponibles en la información proporcionada; no hay evaluaciones publicadas para este build.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (el campo de idiomas figura como no disponible).
- Modalidades especiales (visión, audio, modo thinking): no disponibles; el build es explícitamente de solo texto.

## Casos de uso

- Servicio de inferencia en producción sobre GPUs con soporte nativo de FP8: el checkpoint de 11,22 GiB en W8A8 está pensado para vLLM con compressed-tensors, de modo que un endpoint de generación de texto puede servirse con menor huella de pesos que la versión QAT de origen. Requiere validar antes la calidad, ya que el modelo no está evaluado.
- Despliegue en GPUs de 24 GB para prototipos: con 11,22 GiB de pesos, un único acelerador de 24 GB (RTX 4090, A6000, L40S) deja margen para caché KV y activaciones en contextos moderados. Es un escenario realista para entornos de desarrollo y pruebas internas, no para producción sin evaluación previa.
- Evaluación de cuantización como línea de investigación: el repositorio publica el error relativo RMS (2,64 %) y el error máximo por fila (3,57 %) frente a los pesos QAT, lo que permite medir experimentalmente cuánta degradación introduce el paso de una rejilla int4 por grupos a FP8 por canal en tareas concretas.
- Auditoría y reproducibilidad de builds de cuantización: al incluir `fp8_text.py`, `repack_q4_0.py` y `verify_report.json`, un equipo puede reconstruir el checkpoint y comprobar la trazabilidad tensor a tensor (337 de 337 tensores no lineales byte a byte idénticos a la fuente).
- Generación de texto por lotes donde el coste por token es crítico: FP8 en hardware compatible reduce el coste de memoria y puede mejorar el throughput agregado en vLLM al procesar grandes volúmenes de peticiones cortas, siempre que la calidad se valide en el dominio de aplicación.
- Asistentes conversacionales de texto internos: el modelo base es una versión instruida y conversacional; un despliegue interno (por ejemplo, atención a documentación técnica o resúmenes) puede aprovechar el formato FP8, con la advertencia de que no hay evaluación publicada de respuestas.
- Comparación A/B frente al build W4A16 del mismo autor: permite contrastar en la misma infraestructura si el ahorro de memoria de FP8 compensa la pérdida de fidelidad respecto a la rejilla QAT exacta que conserva el build de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo está "built and checked offline against its source; not yet served or evaluated" y que está en cola para una campaña de serving en una AMD Instinct MI300X. Las únicas métricas medidas son las de fidelidad de la cuantización recogidas en la tabla de la sección de arquitectura (error RMS relativo del 2,64 % y error máximo del 3,57 % respecto al mayor valor de su fila), que no son benchmarks de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 11,22 GiB. A ello hay que sumar la caché KV y las activaciones, cuyo tamaño depende de la longitud de contexto, que no está documentada; no es posible dar una cifra cerrada. Como referencia práctica, con contexto corto el modelo debería encajar en 16 GB, y 24 GB ofrecen margen holgado.
- GPU recomendadas: AMD Instinct MI300X es la plataforma elegida por el autor para su primera campaña de serving. En el lado NVIDIA, las arquitecturas con soporte de tensor cores FP8 (Hopper y Ada, por ejemplo H100, H200, L40S, RTX 4090) son las adecuadas para este formato.
- GPU sin soporte FP8: en Ampere (A100) no existen unidades de tensor FP8, por lo que el rendimiento esperado es inferior y no hay datos medidos. No se han publicado cifras para esta plataforma.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas de 24 GB (RTX 4090, RTX 3090, RX 7900 XTX en función del soporte de la pila de software), con contexto limitado. No hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: vLLM es la librería declarada por el autor y el formato compressed-tensors es el que consume. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama no son utilizables directamente con este repositorio. El soporte en TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables externos, por lo que la comparación se limita a los builds de la misma familia citados en la información disponible.

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| xbill9/gemma-4-12B-it-qat-q4_0-fp8-text-emb4 (este) | 12.913.983.280 | FP8 E4M3 W8A8 + embeddings int4 | No disponible | Apache 2.0 | Construido y verificado; sin servir ni evaluar |
| xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text | No disponible | W4A16, rejilla QAT exacta | No disponible | Apache 2.0 | Publicado; recomendado por el autor para la rejilla QAT exacta |
| xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4 | No disponible | W4A16 con embeddings int4 | No disponible | Apache 2.0 | Fuente de las tablas int4 de este build |
| google/gemma-4-12B-it-qat-q4_0-unquantized | No disponible | Pesos QAT sin cuantizar (origen) | No disponible | Apache 2.0 | Modelo oficial de Google, revisión `b6ed862` |

No se dispone de datos de rendimiento comparado entre estos builds en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: el build descarta cualquier modalidad adicional del modelo base.
- Sin evaluar ni servir: no existen resultados de benchmarks ni mediciones de calidad; cualquier uso en producción es prematuro sin una validación propia.
- No es el build de máxima fidelidad: la re-cuantización introduce un error RMS relativo del 2,64 % y un error máximo del 3,57 % respecto al mayor valor de su fila. El autor remite al build W4A16 para la rejilla QAT exacta.
- Sin datos de calibración: la conversión no utiliza calibración, por lo que el comportamiento numérico en dominios concretos no está caracterizado.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo instruido de 12 B, es esperable el riesgo habitual, pero no hay evaluación publicada para este build.
- Idiomas y longitud de contexto: no documentados; no se puede garantizar cobertura multilingüe ni estimar el coste de caché KV con precisión.
- Tool calling y capacidades de agente: no documentadas; no deben asumirse sin pruebas.
- Licencia: el repositorio declara Apache 2.0 y enlaza la licencia de Gemma 4 de Google. Al redistribuir pesos derivados de Google, el usuario debe revisar y cumplir los términos aplicables de dicha licencia antes de un uso comercial.
- Carácter no oficial: el build y su model card no están afiliados ni respaldados por Google; los problemas deben reportarse al autor del repositorio, no a Google.
- Soporte de herramienta limitado: no hay pesos GGUF, de modo que las pilas de inferencia en CPU (llama.cpp, Ollama) no son una vía directa; depende de vLLM/compressed-tensors y de hardware con FP8.
- Adopción muy baja: 15 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-fp8-text-emb4
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Build fuente de las tablas int4: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4
- Build con la rejilla QAT exacta: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Scripts y verificación incluidos en el repositorio: `fp8_text.py`, `repack_q4_0.py`, `verify_report.json`, `ORIGINAL_README.md` (disponibles en la raíz del repositorio de HuggingFace)
