# webmp3/hfqa-auto-proof-GGUF

## Resumen

`webmp3/hfqa-auto-proof-GGUF` es un repositorio de cuantizaciones GGUF generadas de forma automática a partir de `Qwen/Qwen2.5-0.5B-Instruct`, el modelo instructivo denso de 0,5B parámetros de la familia Qwen2.5. No se trata de un modelo nuevo ni de un fine-tuning: el autor lo describe explícitamente como una "cuantización comunitaria independiente" producida por una tubería local denominada *HF Quant Agent control plane*, y advierte de que no es una release oficial del autor original (Alibaba/Qwen).

El interés técnico del repositorio es limitado pero concreto: publica dos requantizaciones (Q2_K y Q4_K_M) derivadas de un GGUF intermedio Q8_0 ya existente, con hashes SHA-256, recuento de tensores, tipos de tensor medidos y pruebas de carga e inferencia en CPU con una build concreta de llama.cpp (`b11669-620d2225c`). Es, en la práctica, un artefacto de verificación reproducible de la cadena de cuantización, no un modelo pensado para producción ni con métricas de calidad.

La relevancia práctica deriva del modelo base: con unos 494-630 millones de parámetros y ficheros de 415 MB (Q2_K) y 491 MB (Q4_K_M), es ejecutable en CPU y en cualquier GPU consumer, lo que lo hace útil como componente auxiliar de bajo coste (clasificación, enrutado, preprocesado) o como banco de pruebas de pipelines GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `model_type: qwen2` (sin MoE, sin código personalizado; `trust_remote_code` no ejecutado) |
| Parámetros totales | 630.167.424 según metadatos de HuggingFace; 494.032.768 declarados en la model card del autor (discrepancia no explicada en el repositorio) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en el repositorio; el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens |
| Tipos de cuantización | Q2_K y Q4_K_M (requantizadas desde un GGUF Q8_0 de origen) |
| Idiomas soportados | `en`, `zh` (según metadatos; sin evaluación de otros idiomas) |
| Licencia | apache-2.0 (heredada del modelo base, con atribución al autor original) |
| Formato de pesos | GGUF (único formato publicado; no hay safetensors en este repo) |
| Ficheros publicados | `qwen2.5-0.5b-instruct-q8_0-Q2_K-requant.gguf` (415.182.688 bytes) y `qwen2.5-0.5b-instruct-q8_0-Q4_K_M-requant.gguf` (491.400.032 bytes) |
| Tensores | 291 en el GGUF de origen; mismo conjunto de nombres en ambos ficheros de salida (SHA-256 del set: `70e194dd…`) |
| Tamaño del repositorio | 0,9 GB |
| Runtime validado | llama.cpp build `b11669-620d2225c` (ejecutable con SHA-256 `486568ae…`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni afina ningún modelo. La ruta declarada es `native_gguf_requant` con el adaptador `standard-llamacpp`: se parte del fichero `qwen2.5-0.5b-instruct-q8_0.gguf` (SHA-256 `ca59ca7f…`, commit `9217f5db…` del repo `Qwen/Qwen2.5-0.5B-Instruct-GGUF`) y se recuantiza a Q2_K y Q4_K_M. El job no convirtió el checkpoint original en bfloat16/safetensors y no ejecutó calibración con matriz de importancia, algo que el propio autor señala como fuente adicional de error de cuantización al partir de una fuente ya cuantizada.

Los tipos de tensor medidos no coinciden con la etiqueta comercial de la cuantización. En Q2_K: F32 ×121, Q3_K ×24, Q4_0 ×121, Q5_0 ×24, Q8_0 ×1. En Q4_K_M: F32 ×121, Q4_K ×12, Q5_0 ×133, Q6_K ×12, Q8_0 ×13. El cuantizador reportó 145 tensores con *fallback* en ambos casos, y los 121 tensores en F32 explican que el Q4_K_M resultante (491 MB) sea más grande de lo habitual para un modelo de este tamaño. En el GGUF de origen se midieron 121 tensores F32 y 170 en Q8_0, sobre un total de 291.

En cuanto al modelo subyacente, la arquitectura es la `qwen2` estándar (decoder-only con RoPE, GQA y sesgo en las proyecciones QKV), con atención densa. Los detalles de entrenamiento del modelo original (número de tokens, composición del corpus, etapas de post-entrenamiento tipo SFT/RLHF o DPO) no están documentados en este repositorio y no se han verificado aquí; deben consultarse en la model card de `Qwen/Qwen2.5-0.5B-Instruct`.

## Capacidades

- Generación de texto conversacional multi-turno mediante la plantilla de chat de Qwen2.5, heredada del modelo base; no se ha validado la fidelidad de la plantilla en estos GGUF.
- Respuesta a instrucciones y ajuste básico a formato (listas, resúmenes cortos, reescritura), limitado por el tamaño del modelo.
- Razonamiento aritmético y lógico simple, sin cadena de pensamiento explícita ni modo *thinking*.
- Generación de código muy sencilla (fragmentos, snippets cortos); no hay ninguna prueba de HumanEval ni similar en el repositorio.
- Capacidades multilingües declaradas: inglés y chino. No se declara ni evalúa castellano.
- No hay soporte documentado de *tool calling* / *function calling* ni de razonamiento agéntico multi-paso verificado en este repositorio.
- Sin capacidades de visión, audio ni multimodalidad.
- El repositorio incluye la etiqueta `endpoints_compatible`, aunque no se publican pruebas de compatibilidad con endpoints gestionados.
- Inferencia verificada en CPU con llama.cpp (una ejecución real por cada fichero), además de validación estructural del GGUF.

## Casos de uso

- **Clasificación y etiquetado de textos cortos en local**: con 415-491 MB de pesos y contexto de sobra para titulares o tickets, el modelo cabe en cualquier portátil y permite etiquetar lotes en CPU sin enviar datos a la nube; útil cuando la confidencialidad prima sobre la precisión.
- **Enrutado de intenciones antes de un modelo mayor**: usar el Q4_K_M como clasificador de intención o *router* (por ejemplo, decidir si una consulta va a un modelo de 7B o a una base de conocimiento), aprovechando que su latencia en CPU es de milisegundos por respuesta corta y que el coste por llamada es despreciable.
- **Preprocesado y normalización en pipelines batch**: limpieza, reescritura de campos, generación de resúmenes de una línea o transformación de formatos dentro de un ETL, donde un modelo de 0,5B evita el coste de API para millones de registros.
- **Chatbot embebido en dispositivos de bajos recursos**: cabe en una Raspberry Pi 5 o en un contenedor de 1 GB de RAM; adecuado para demos de asistente, kioscos o interfaces de ayuda con dominio acotado y respuestas cortas.
- **Banco de pruebas de cuantización y CI de inferencia**: el propio repositorio lo usa como prueba de humo; sirve para validar que una build nueva de llama.cpp carga y genera con arquitectura `qwen2`, comparando salidas entre Q2_K y Q4_K_M para detectar regresiones.
- **Docencia y experimentación con GGUF**: comparar dos niveles de cuantización sobre el mismo checkpoint permite ilustrar empíricamente la degradación por doble cuantización y el efecto de los tensores en F32 en el tamaño final.
- **Generación de texto de relleno en inglés o chino**: descripciones cortas, variaciones de copy o respuestas FAQ en esos dos idiomas, siempre con revisión humana y sin asumir calidad en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card lo indica de forma explícita: "No coding benchmark, perplexity or quality score is claimed"; las únicas validaciones ejecutadas son la comprobación estructural del GGUF y una inferencia real en CPU por cada uno de los dos ficheros. Tampoco se reportan latencia ni throughput medidos, solo la build de llama.cpp empleada.

| Comprobación ejecutada | Q2_K | Q4_K_M |
|---|---|---|
| Estructura GGUF válida | sí | sí |
| Carga en runtime | sí | sí |
| Inferencia en CPU | sí (1 ejecución) | sí (1 ejecución) |
| Benchmark de calidad / perplejidad | no ejecutado | no ejecutado |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para ambos ficheros (396 MiB el Q2_K y 469 MiB el Q4_K_M), más la caché KV correspondiente al contexto configurado; con 1 GB de memoria disponible hay margen.
- Inferencia en CPU perfectamente viable: el repositorio valida carga e inferencia con llama.cpp sobre CPU, sin GPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con ≥1-2 GB de VRAM (GTX 1050 Ti, GTX 1650, iGPU moderna) es suficiente. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluida la gama de entrada y muchas GPU integradas; también en SBC con 2-4 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), `llama-cpp-python`, Ollama importando un Modelfile, LM Studio, Jan. El soporte de GGUF en vLLM es experimental y no está validado para estos artefactos; TGI no soporta GGUF.
- Latencia y throughput: no disponibles. No se han publicado medidas; solo se documenta la build de runtime utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| `webmp3/hfqa-auto-proof-GGUF` (Q4_K_M) | 494M declarados / 630M en metadatos | 32.768 tokens (heredado del base) | apache-2.0 | GGUF Q2_K y Q4_K_M | Sin benchmarks; requantización desde Q8_0; 145 tensores con fallback |
| `Qwen/Qwen2.5-0.5B-Instruct` (original) | 494M | 32.768 tokens | apache-2.0 | safetensors (bf16) + GGUF oficial | Referencia de calidad frente a la que se debería medir esta requantización; mantiene soporte oficial |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1.540M aprox. | 32.768 tokens | apache-2.0 | safetensors + GGUF | Misma familia y tokenizador; mayor calidad a costa de ~3× tamaño y más RAM |
| `meta-llama/Llama-3.2-1B-Instruct` | 1.240M aprox. | 128.000 tokens | Llama 3.2 Community License | safetensors + GGUF comunitarios | Contexto mucho mayor y mejor calidad esperada; licencia con restricciones de uso comercial para grandes entidades |

Los datos de los modelos comparables provienen de sus model cards públicas y no se han verificado en esta ficha; no hay mediciones cruzadas de rendimiento. Advertencia importante: este repositorio no publica ninguna comparación de calidad frente al Qwen2.5-0.5B-Instruct original, por lo que la degradación introducida por la doble cuantización es desconocida.

## Limitaciones y advertencias

- Ausencia total de métricas de calidad: el autor declara que no se ejecutó ningún benchmark de código, perplejidad ni puntuación de calidad, y marca explícitamente como *untested* la calidad, la velocidad y la compatibilidad más allá de los dos ficheros listados.
- Doble cuantización: se parte de un GGUF Q8_0 ya cuantizado, no del checkpoint en bf16, y no se aplicó calibración con matriz de importancia. El propio autor advierte que esto añade error de cuantización acumulado.
- Etiquetas de cuantización engañosas: los tipos de tensor reales no coinciden con el preset nominal (el Q2_K contiene 121 tensores Q4_0 y 121 en F32; el Q4_K_M contiene 133 tensores Q5_0 y 121 en F32), con 145 tensores en *fallback* reportados en ambos casos.
- Modelo muy pequeño: 0,5B parámetros implica razonamiento frágil, errores aritméticos frecuentes, poca adherencia a instrucciones complejas y propensión alta a la alucinación cuando se le pide conocimiento factual.
- Idiomas: solo `en` y `zh` declarados. El rendimiento en castellano no está evaluado y previsiblemente será deficiente; no debe usarse para producción en español sin validación previa.
- Sin soporte documentado de *tool calling* ni de flujos agénticos; no hay pruebas de uso con funciones o APIs.
- Adopción nula: 0 descargas y 0 *likes*, repositorio creado y actualizado con menos de dos minutos de diferencia y nombre que lo identifica como prueba automatizada (`hfqa-auto-proof`). No hay garantía de mantenimiento, releases ni soporte.
- Metadatos inconsistentes: el recuento de parámetros de HuggingFace (630M) no coincide con el de la model card (494M), y la fecha declarada de creación es 2026-10-26, sin que el repositorio explique ninguna de las dos cosas.
- Licencia: apache-2.0 permite uso comercial y redistribución con atribución; es obligatorio conservar la atribución a Qwen/Alibaba y el enlace a la licencia original. Aun así, el autor del repositorio no verifica la calidad del artefacto, por lo que la licencia no implica idoneidad para producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/webmp3/hfqa-auto-proof-GGUF
- Modelo base (instruct): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base declarado (preentrenado): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Model card fijada del modelo base (revisión `7ae5576`): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/7ae557604adf67be50417f59c2c2f167def9a775/README.md
- GGUF de origen de la requantización: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE

Enlaces contextuales sobre el ecosistema GGUF localizados en la búsqueda web (no específicos de este modelo):

- Directorio de modelos GGUF: https://local-ai-zone.github.io/
- Repositorio del directorio anterior: https://github.com/local-ai-zone/local-ai-zone.github.io
- Herramienta de automatización de cuantización GGUF: https://github.com/leafspark/AutoGGUF
- Listado de modelos compatibles con la librería GGUF en HuggingFace: https://huggingface.co/models?library=gguf
