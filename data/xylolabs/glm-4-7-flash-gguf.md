# Xylolabs/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash-GGUF es una exportación cuantizada del modelo zai-org/GLM-4.7-Flash, publicada por Xylolabs. No se trata de un modelo nuevo, sino de una conversión a formato GGUF para su uso con llama.cpp, con dos variantes de cuantización IQ4_XS (una de ellas con importance matrix). El modelo base pertenece a la familia GLM-4 de Z.ai y cuenta con aproximadamente 31.200 millones de parámetros totales, según los pesos en safetensors del repositorio base.

El objetivo de esta publicación es facilitar la inferencia local del modelo en hardware de consumo o en entornos sin GPU de gran capacidad, manteniendo una calidad cercana a la referencia BF16. El repositorio ocupa 33,6 GB e incluye 868 tensores distribuidos en 47 capas del decodificador principal más un módulo MTP (multi-token prediction).

La relevancia de esta ficha radica en que documenta una cuantización de 4 bits de un modelo de 31B con licencia MIT, algo poco habitual en modelos de este tamaño, y aporta métricas de divergencia KL frente a la referencia BF16 y frente a una cuantización Q4_K_M de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GLM-4), con modulo MTP; detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 31.221.488.576 (aprox. 31,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la metadata original se conserva; el ejemplo de quickstart limita a 2048 tokens) |
| Tipos de cuantizacion | IQ4_XS (plain) e IQ4_XS con importance matrix (imatrix); tipos de tensor mixtos: F32, IQ4_NL, IQ4_XS, Q5_K, Q6_K |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (868 tensores, 47 capas principales + 1 modulo MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia GLM-4 con 47 capas de texto y un módulo MTP (multi-token prediction), que en el modelo original puede emplearse como drafter para decodificación especulativa. Esta publicación no entrena ni recalibra el modelo: se limita a convertir y cuantizar los pesos originales con llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica de esta exportación es la preservación de los pesos del decodificador principal y del módulo MTP, junto con la tokenizer y la plantilla de chat originales. Se ofrecen dos variantes: IQ4_XS simple (16,876 GB, 4,322 bits/parámetro de media) e IQ4_XS con imatrix existente (16,713 GB, 4,280 bits/parámetro). Los tipos de tensor mixtos incluyen F32 (290 tensores), IQ4_NL (48), IQ4_XS (518 o 529), Q5_K (11, solo en la variante plain) y Q6_K (1). La variante con imatrix conserva el resultado de la matriz de importancia existente; no se realizó calibración nueva para la publicación.

## Capacidades

- Generación de texto conversacional, con plantilla de chat original preservada.
- Razonamiento con modo thinking opcional, controlable mediante `enable_thinking` en la plantilla de chat.
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- Soporte de decodificación especulativa potencial mediante el módulo MTP, aunque el autor indica que requiere una implementación compatible y evaluación propia.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: la variante IQ4_XS-imat ocupa 16,713 GB de pesos, por lo que puede ejecutarse en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) dejando margen para KV cache y buffers.
- Despliegue en servidores sin aceleradores de gran capacidad: al ser GGUF para llama.cpp, permite ejecución en CPU con memoria RAM suficiente, útil para prototipado y pruebas de integración.
- Evaluación comparativa de cuantizaciones: las métricas de divergencia KL frente a BF16 y Q4_K_M permiten decidir entre IQ4_XS plain e imatrix según el equilibrio calidad/tamaño requerido.
- Chat conversacional multilingüe inglés-coreano: la plantilla de chat original y el soporte de ambos idiomas permiten construir asistentes para esos mercados sin reentrenamiento.
- Investigación sobre decodificación especulativa: el módulo MTP preservado sirve como base para experimentos con drafters, siempre que se implemente el soporte correspondiente.
- Integración en pipelines de generación de texto con llama.cpp: el formato GGUF y la compatibilidad con endpoints facilitan su incorporación en servicios existentes basados en llama.cpp.
- Pruebas de razonamiento con thinking mode: el flag `enable_thinking` permite alternar entre respuestas directas y cadenas de razonamiento, útil para evaluar latencia frente a precisión.

## Benchmarks y rendimiento

El autor publica métricas de divergencia KL y una prueba de respuestas cortas, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible.

| Variante | KL media | KL / Q4_K_M | Respuestas correctas | Perdidas/rotas contadas |
|---|---:|---:|---:|---:|
| IQ4_XS-imat | 0,089672 | 1,133x | 33/33 + 7/7 | 0 |
| IQ4_XS | 0,092851 | 1,173x | 32/33 + 7/7 | 0 |
| Q4_K_M (referencia) | 0,079141 | 1,000x | 32/33 + 7/7 | 0 |
| BF16 (referencia) | — | — | 31/33 + 7/7 | — |

Las 16 secuencias emparejadas de 1.024 tokens cubren 16.288 posiciones evaluadas en grupos inglés/coreano, plain/chat. Las ejecuciones usan contexto 8.192 y los mismos contratos de referencia. Las pérdidas contadas excluyen empates cercanos en BF16 (diferencia top-2 inferior a 1,0 en el primer token divergente) y elementos de razonamiento recuperados con thinking activado. La velocidad no se reporta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,87 GB solo para los pesos de la variante más grande, más espacio para KV cache y buffers. En la práctica, se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB) para la variante IQ4_XS; A100 40 GB o H100 para contextos largos o mayor paralelismo.
- GPU de consumo: cabe en GPUs de 24 GB; en GPUs de 16 GB o menos no cabría la variante completa en VRAM y requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp (probado con v0.9.0 según el quickstart), y por extensión herramientas compatibles con GGUF como Ollama o servidores basados en llama.cpp. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| GLM-4.7-Flash-GGUF (esta ficha) | 31,2B | no disponible | MIT | GGUF IQ4_XS | Cuantizacion 4 bits, metricas KL publicadas |
| zai-org/GLM-4.7-Flash (base) | 31,2B | no disponible | MIT | safetensors (BF16) | Referencia de calidad, mayor requisito de memoria |
| Q4_K_M del mismo modelo | 31,2B | no disponible | MIT | GGUF Q4_K_M | Usado como referencia de KL (0,079141) |

No se dispone de datos de benchmarks estándar ni de comparativas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se declaran idiomas inglés y coreano; el rendimiento en castellano no está documentado.
- La cuantización a 4 bits introduce divergencia respecto a BF16 (KL media de 0,0897 en la mejor variante), lo que puede degradar respuestas en tareas sensibles.
- Las métricas publicadas se basan en textos almacenados y prompts cortos; el autor advierte que una integración real necesita su propia evaluación por tarea.
- El módulo MTP está preservado pero no validado para decodificación especulativa en esta exportación; requiere implementación compatible y evaluación independiente.
- Riesgo de alucinación no cuantificado en la información disponible; inherente a modelos de lenguaje de este tamaño.
- Sesgos conocidos no documentados en la información proporcionada.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantía ni respaldo del upstream; se debe citar la model card original y el informe técnico de GLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Licencia MIT en el repo: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF/blob/main/LICENSE
- Código llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación GGUF + llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de herramientas Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
