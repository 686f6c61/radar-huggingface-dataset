# Xylolabs/clairic-GGUF

## Resumen

Clairic es un modelo multimodal de 27B parámetros desarrollado por Cloudflare, afinado a partir de Qwen3.8-27B para extracción estructurada de información. Convierte un estado de entrada (texto o JSON) más un esquema de campos tipados en respuestas estructuradas, con valores tipados, listas, nulos, estimaciones numéricas y predicciones. Es relevante porque aborda una tarea concreta —la extracción fiable de datos con esquema— en lugar de la generación abierta, e incorpora puntuaciones de confianza por campo y probabilidades de nulo.

El repositorio que nos ocupa, Xylolabs/clairic-GGUF, no es el modelo original sino una conversión a formato GGUF para llama.cpp, con el codificador visual incluido (mmproj en BF16) y nueve cuantizaciones entre Q8_0 y Q2_K. Según la model card, no incluye la cabeza de extracción tipada de Cloudflare ni el bloque de predicción multi-token del checkpoint original, por lo que el comportamiento en producción puede diferir del modelo PyTorch de referencia.

La licencia es Apache-2.0 y el autor declara no tener afiliación con Cloudflare. La fecha de creación del repositorio es 2026-11-20 y la última actualización 2026-11-22, con 1681 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con codificador visual |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-server usa `-c 32768`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector visual `mmproj-clairic-BF16.gguf` en BF16 e importance matrix `clairic.imatrix.gguf` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de aproximadamente 26,9B parámetros, adaptado por Cloudflare para extracción estructurada. La entrada es un estado en texto o JSON, imágenes opcionales y un mapeo de nombres de campo a especificaciones; la salida son valores tipados, listas, nulos, estimaciones y trayectorias de predicción, con información de confianza de extracción, probabilidades de nulo y cuantiles opcionales para las estimaciones. El runtime original usa PyTorch y Transformers, con `xgrammar` como procesador de logits para imponer restricciones de esquema.

La conversión de Xylolabs a GGUF conserva el codificador visual pero omite dos componentes del checkpoint original: la cabeza de extracción tipada de Cloudflare y el bloque de predicción multi-token no utilizado. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card indica que el modelo debe ejecutarse con el modo thinking desactivado, tal como hace el runtime de Cloudflare, y que las salidas JSON conformes a esquema se consiguen pasando el esquema en la petición (`response_format` con `json_schema` en llama-server), que llama.cpp convierte en una gramática.

## Capacidades

- Extracción estructurada de información a partir de texto o JSON y un esquema de campos tipados.
- Entrada de imágenes mediante el proyector visual incluido (pipeline image-text-to-text).
- Salida con valores tipados, listas, nulos, estimaciones numéricas y trayectorias de predicción.
- Puntuación por campo: confianza de extracción y probabilidad de nulo; cuantiles opcionales para estimaciones.
- Salida JSON restringida por esquema (gramáticas en llama.cpp, `xgrammar` en el runtime original).
- Informe de truncamiento de entrada y uso de tokens en la respuesta.
- Conversación multi-turno (tag `conversational`).
- Modo thinking desactivable; el autor recomienda ejecutarlo desactivado.
- No se documentan capacidades de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Extracción de campos de facturas y albaranes: se envía el documento como imagen más un esquema con los campos (fecha, importe, NIF, líneas), y el modelo devuelve valores tipados con confianza por campo, lo que permite enrutar a revisión manual los campos con baja puntuación.
- Procesamiento de formularios y documentos escaneados: el codificador visual permite leer la imagen directamente y devolver un JSON conforme al esquema de la base de datos, evitando una etapa OCR separada.
- Normalización de registros JSON heterogéneos: dado un estado JSON de origen y un esquema destino, el modelo mapea y tipa los campos, marcando como nulos los ausentes con su probabilidad asociada.
- Enriquecimiento de datos con estimaciones: cuando un campo numérico no está presente de forma explícita, el modelo puede emitir una estimación con cuantiles, útil en informes financieros o de inventario donde se requiere una horquilla de valores.
- Predicción de series a partir de estado y esquema: las trayectorias de predicción permiten generar escenarios numéricos condicionados a un estado de entrada, por ejemplo para planificación de demanda a pequeña escala.
- Despliegue local en llama.cpp: con la cuantización Q4_K_M (16,78 GB) y el proyector visual, el modelo puede ejecutarse en una estación de trabajo con GPU de consumo para pipelines de extracción por lotes sin enviar datos a la nube.
- Integración en pipelines de validación: la salida JSON con gramática impuesta y las puntuaciones de confianza permiten validar automáticamente la conformidad del esquema antes de insertar en base de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a inferencia f32 sobre pesos BF16, medidas en texto mixto:

| Cuantizacion | Tamano | KL media (texto mixto) | Top-1 |
|---|---:|---:|---:|
| Q8_0 | 28,62 GB | 0,0100 | 98,25% |
| Q6_K | 22,11 GB | 0,0161 | 97,35% |
| Q5_K_M | 19,36 GB | 0,0237 | 95,97% |
| Q4_K_M | 16,78 GB | 0,0518 | 93,93% |
| Q4_K_S | 15,63 GB | 0,0566 | 93,55% |
| IQ4_XS | 15,35 GB | 0,0611 | 92,42% |
| Q3_K_M | 13,55 GB | 0,1333 | 89,36% |
| IQ3_M | 12,82 GB | 0,1393 | 88,59% |
| Q2_K | 11,10 GB | 0,2348 | 84,86% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el proyector visual (0,93 GB) y la caché KV. Q4_K_M requiere unos 17,7 GB de pesos; Q8_0, unos 29,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) para Q5_K_M, Q4_K_M, Q4_K_S e IQ4_XS; GPUs de 16 GB para Q3_K_M e IQ3_M; Q2_K (11,1 GB) cabe en GPUs de 12 GB.
- Cabe en GPU de consumo: sí, desde Q2_K en una RTX 3060 de 12 GB hasta Q5_K_M en una RTX 4090 de 24 GB, siempre que se reserve VRAM para la caché KV del contexto configurado.
- Opciones de despliegue: llama.cpp (`llama-server` y `llama-cli`), con soporte de gramáticas para JSON conforme a esquema; el autor verificó los archivos con el build e4b620af1. No se documentan otros motores (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo del autor usa `-ngl 99 -c 32768` con thinking desactivado, lo que reduce el número de tokens generados por respuesta frente al modo razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada multimodal | Salida estructurada con esquema | Licencia | Formato |
|---|---|---|---|---|---|---|
| Clairic (este GGUF) | ~26,9B | no disponible | Sí (imagen + texto) | Sí, con confianza y nulos por campo | Apache-2.0 | GGUF |
| Cloudflare/clairic (original) | ~26,9B | no disponible | Sí | Sí, incluye cabeza de extracción tipada | Apache-2.0 | PyTorch/Transformers |
| Cloudflare/clairic-flash | no disponible | no disponible | no disponible | no disponible | Apache-2.0 (según familia) | no disponible |
| Qwen3.8-27B (base) | ~26,9B | no disponible | no disponible | No específica; JSON genérico | no disponible | safetensors |

La comparación con modelos de propósito general del mismo tamaño no está disponible con datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- La conversión omite la cabeza de extracción tipada de Cloudflare y el bloque de predicción multi-token del checkpoint original; el comportamiento puede diferir del modelo PyTorch de referencia en tareas de extracción y predicción.
- El autor recomienda ejecutar con thinking desactivado; activarlo puede degradar la conformidad con el esquema o aumentar la latencia.
- Las salidas conformes a esquema dependen de que el runtime imponga gramáticas; sin esa restricción, el JSON puede no ser válido.
- No se documentan idiomas soportados; el rendimiento multilingüe es desconocido.
- No se han publicado evaluaciones de sesgo, alucinación o robustez para este modelo ni para el original en la información disponible.
- Las estimaciones numéricas y las predicciones son salidas probabilísticas y no deben usarse como única fuente en decisiones críticas; conviene contrastar los cuantiles.
- La licencia Apache-2.0 permite uso comercial, pero el aviso NOTICE debe conservarse y Xylolabs no está afiliado ni respaldado por Cloudflare.
- Los cuantizados por debajo de Q4_K_M pierden fidelidad de forma apreciable (Q3_K_M baja al 89,36% de top-1; Q2_K, al 84,86%), lo que puede afectar a la extracción de campos.
- El repositorio ocupa 156,3 GB en total; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/clairic-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Modelo de la familia: https://huggingface.co/Cloudflare/clairic-flash
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
