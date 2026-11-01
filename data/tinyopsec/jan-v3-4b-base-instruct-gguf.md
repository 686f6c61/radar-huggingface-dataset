# tinyopsec/Jan-v3-4B-base-instruct-GGUF

## Resumen

Jan-v3-4B-base-instruct-GGUF es un repositorio de cuantizaciones GGUF del modelo `janhq/Jan-v3-4B-base-instruct`, un modelo compacto de propósito general de unos 4B parámetros, elaborado por el usuario tinyopsec mediante llama.cpp. El modelo base subyacente es Qwen3-4B-Instruct-2507, de la familia Qwen3 de Alibaba, lo que le confiere capacidades de generación de texto conversacional y, según las etiquetas del repositorio, orientación hacia código.

La relevancia de esta ficha reside en la portabilidad: el formato GGUF permite ejecutar el modelo en CPU y en GPUs de consumo mediante llama.cpp, Ollama, LM Studio o koboldcpp, sin necesidad de infraestructura de datacenter. El repositorio ofrece trece niveles de cuantización, desde F16 (~8 GB) hasta Q2_K, cubriendo un espectro amplio de compromisos entre calidad y huella de memoria.

Es una opción adecuada para desarrolladores que buscan un modelo pequeño, con licencia Apache 2.0, para inferencia local, prototipado en portátiles o despliegues en edge, aceptando las limitaciones inherentes a un modelo de 4B parámetros frente a modelos de mayor escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), detalles no disponibles |
| Parametros totales | 4.411.424.256 (~4,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multilingüe, pero no consta en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Otros datos: tamaño del repositorio 42,9 GB; librería `gguf`; pipeline `text-generation`; 418 descargas registradas.

## Arquitectura y entrenamiento

El modelo es una variante derivada de Qwen3-4B-Instruct-2507, un transformer denso (no MoE) de la familia Qwen3 optimizado para instrucciones. La variante "Jan" fue publicada por janhq como modelo base-instruct compacto de propósito general, y este repositorio no aporta pesos nuevos: contiene únicamente reconversiones a GGUF a trece niveles de precisión mediante llama.cpp. No se ha publicado información sobre el proceso de entrenamiento específico de la variante Jan (tokens, composición del dataset, RLHF/DPO).

Respecto al modelo base Qwen3-4B-Instruct-2507, la familia Qwen3 emplea arquitecturas transformer con mejoras estándar (GQA, tokenizadores multilingües amplios), pero los detalles concretos de esta derivada no constan en la información disponible. La cuantización Q4_K_M se señala en la model card como la recomendada como punto de partida.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Generación y comprensión de código, según las etiquetas del repositorio (`code`, heredadas del enfoque de la variante Jan).
- Instrucción siguiendo formatos de chat del modelo base Qwen3-Instruct.
- Ejecución local en CPU o GPU mediante runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- No consta soporte de vision, audio ni tool calling en la información disponible.

## Casos de uso

- Asistente local en portátil o PC de sobremesa: con la cuantización Q4_K_M (~2,5-3 GB aproximados para un modelo de 4B) cabe en GPUs de consumo o incluso en CPU, ideal para chat privado sin enviar datos a la nube.
- Prototipado rápido de aplicaciones LLM: la integración directa con Ollama o LM Studio permite probar prompts y flujos conversacionales en minutos.
- Generación de código asistida en editor: dado el enfoque en código de la variante Jan, puede usarse como autocompletado o explicación de snippets en entornos locales tipo Continue o extensiones de VS Code compatibles con GGUF.
- Despliegue en edge y dispositivos con recursos limitados: las cuantizaciones Q3 y Q2_K reducen la huella por debajo de los 2-3 GB, aptas para mini-PC o SBC.
- Procesamiento por lotes de texto en CPU: para tareas como resumen o clasificación de documentos donde el throughput no es crítico, la ejecución en CPU con GGUF evita costes de GPU.
- Base para fine-tuning experimental o evalución de cuantizaciones: el abanico de trece niveles permite estudiar la degradación de calidad por nivel de bits en un mismo modelo.
- Atención al cliente en entornos con restricciones de privacidad: conversaciones multi-turno ejecutadas íntegramente on-premise gracias a la licencia permisiva y al formato local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Como referencia cualitativa, el modelo base Qwen3-4B-Instruct-2507 dispone de evaluaciones públicas, pero este repositorio solo contiene cuantizaciones y no aporta datos propios; no se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada para 4,4B parámetros): F16 ~8-9 GB; Q8_0 ~4,5-5 GB; Q6_K ~3,5-4 GB; Q4_K_M ~2,5-3 GB; Q3 ~2-2,5 GB; Q2_K ~1,5-2 GB, más la memoria de contexto.
- GPU recomendadas: cualquier GPU de consumo con 4-6 GB (RTX 3060, RTX 4060) para Q4_K_M; GPUs de 8 GB o más (RTX 4070/4080, RTX 4090) para F16 o Q8_0 con contexto amplio. No se requieren GPUs de datacenter.
- Cabe en GPUs de consumo desde la gama media; también es ejecutable en CPU puro (x86 con AVX2 o ARM) a velocidades de unos pocos tokens/segundo, cifra exacta no disponible.
- Despliegue: llama.cpp (ejemplo oficial: `./llama-cli -m model-Q4_K_M.gguf -p "Your prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime GGUF-compatible. No consta soporte verificado en vLLM o TGI para GGUF (vLLM requiere pesos originales).
- Latencia y throughput: no disponibles; al ser un modelo de 4B, se espera interacción fluida en GPU de consumo y velocidades moderadas en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto |
|---|---|---|---|---|
| Jan-v3-4B-base-instruct (este repo, GGUF) | ~4,4B | GGUF (13 cuantizaciones) | Apache 2.0 | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | Safetensors | Apache 2.0 | No disponible en esta ficha |
| Qwen3-4B (original, con thinking) | ~4B | Safetensors / GGUF comunitarios | Apache 2.0 | No disponible en esta ficha |
| Phi-3-mini / Phi-4-mini (Microsoft) | ~3,8B | Safetensors / GGUF comunitarios | MIT | Hasta 128K según variante |

En términos de tamaño y licencia es equivalente a Qwen3-4B-Instruct-2507 (del que deriva) y a otros pequeños modelos abiertos como los Phi de Microsoft. Su ventaja diferencial es la disponibilidad inmediata de trece cuantizaciones GGUF oficiales del repositorio; su desventaja es que no aporta pesos originales ni datos de evaluación propios.

## Limitaciones y advertencias

- La propia model card advierte: "Compact 4B base model. Evaluate before use" (modelo compacto de 4B; evaluar antes de usarlo en producción).
- Riesgo de alucinación típico de modelos pequeños; no adecuado para tareas que exijan alta fiabilidad factual sin verificación externa.
- Sesgos: no documentados en la ficha; hereda los del modelo base Qwen3 y del corpus de entrenamiento de la variante Jan, no descritos.
- Longitud de contexto no especificada en este repositorio; debe consultarse la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Cuantizaciones agresivas (Q3, Q2_K) degradan apreciablemente la calidad, especialmente en código y razonamiento.
- La licencia Apache 2.0 es permisiva y permite uso comercial, pero conviene verificar los términos de la variante Jan original (janhq) y del modelo base.
- Repositorio de comunidad con pocas descargas (418) y sin likes: menor madurez y validación comunitaria que los repos oficiales.
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/Jan-v3-4B-base-instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original de la variante Jan: https://huggingface.co/janhq/Jan-v3-4B-base-instruct (deducido de la model card; no verificado en la información proporcionada)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Otros enlaces (paper, blog, demo): no disponibles
