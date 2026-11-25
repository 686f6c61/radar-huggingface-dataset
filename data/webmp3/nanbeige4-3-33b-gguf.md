# webmp3/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.118.977.024 parámetros (33,1 B) desarrollado por Nanbeige, con arquitectura declarada `llama` y pesos originales en safetensors/bfloat16. El repositorio aquí descrito, `webmp3/Nanbeige4.3-33B-GGUF`, es una cuantización comunitaria independiente (bajo la etiqueta "Sakura") que no constituye una publicación oficial del autor original, sino una redistribución en formato GGUF de los pesos BF16 ya convertidos por terceros.

El problema que resuelve esta ficha es concreto: hacer desplegable en hardware de consumo un modelo denso de 33 B que en BF16 ocupa 66,2 GB. Las cuatro cuantizaciones publicadas van de 12,7 GB (Q2_K) a 23,5 GB (Q5_K_M), lo que abre la puerta a inferencia local con llama.cpp en GPUs de 16-24 GB o incluso en configuraciones con offload a CPU.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema: el modelo base aparece en Hugging Face, un tercero (bartowski) genera el GGUF BF16 y un cuarto (webmp3) hace la requantización K-quant con verificación de hashes y prueba real de inferencia. La licencia Apache 2.0 del modelo original facilita esta cadena de redistribución con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `llama` (transformer denso, según metadatos del GGUF) |
| Parametros totales | 33.118.977.024 (33,1 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (presets llama.cpp, sin imatrix) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen: safetensors / bfloat16) |
| Tamano del repo | 145,0 GB (incluye los cuatro ficheros GGUF y artefactos) |
| Modelo base | Nanbeige/Nanbeige4.3-33B (commit `c1093c501cc6460427c0ac634db7223d0450c0ee`) |
| Modelo base declarado | Nanbeige/Nanbeige4.3-33B-Base (relación: finetune) |
| Fuente de la requantizacion | bartowski/Nanbeige_Nanbeige4.3-33B-GGUF, fichero BF16 con SHA-256 `09da2d75…d2c068` |
| Descargas / likes | 302 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es `llama`, es decir, un transformer denso con atención multi-cabeza estándar, sin mezcla de expertos ni capas recurrentes. El dato procede de los metadatos del GGUF, no de una model card técnica detallada del autor original. El modelo base es un fine-tune de `Nanbeige4.3-33B-Base`, según la relación `finetune` declarada en los metadatos.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT con preferencias. Tampoco se documenta ninguna innovación arquitectónica específica (atención lineal, decodificación especulativa, SSM híbrido). Lo único verificable técnicamente es el proceso de cuantización: requantización directa desde un GGUF BF16 ya existente, sin calibración con importance matrix, usando presets estándar de llama.cpp. Como consecuencia, los tensores de normalización se mantienen en F32 (105 tensores por fichero) y los ficheros mezclan tipos: por ejemplo, Q4_K_M contiene 313 tensores Q4_K y 53 Q6_K, y Q2_K contiene 209 Q2_K, 104 Q3_K, 52 Q4_K y 1 Q6_K.

## Capacidades

- Generación de texto conversacional: los tags del repositorio incluyen `conversational`, lo que indica un ajuste orientado a diálogo.
- Multilingüismo limitado a inglés y chino (`en`, `zh`); no se declara soporte de castellano ni de otras lenguas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que los ficheros pueden servirse mediante infraestructura de inferencia compatible con el formato GGUF.
- Inferencia verificada: cada uno de los cuatro ficheros fue cargado en llama.cpp (build `b11669-620d2225c`) y se generó texto al menos una vez, lo que confirma validez estructural del GGUF.
- Tool calling / function calling: no disponible.
- Modo thinking, visión, audio, agentes multi-paso: no disponible en la información proporcionada.
- Razonamiento matemático y generación de código: no disponible; el autor no reclama ningún benchmark de código ni perplexidad.

## Casos de uso

- Despliegue local en una RTX 4090 (24 GB): el fichero Q4_K_M (20,1 GB) deja margen para caché KV y contexto moderado, permitiendo un asistente conversacional en inglés o chino sin conexión a la nube.
- Servicio en una RTX 3090/4080 (16 GB): el Q3_K_M (16,3 GB) es el límite práctico; requiere reducir el contexto o usar offload parcial de capas a CPU para evitar OOM.
- Estación de trabajo con 32 GB de RAM y GPU integrada: el Q2_K (12,7 GB) permite ejecución íntegra en CPU con llama.cpp, adecuado para prototipos y pruebas de pipeline más que para producción.
- Evaluación comparativa de cuantizaciones: al publicarse cuatro niveles con hashes SHA-256 por fichero, el repo sirve para medir la degradación de calidad entre Q2_K y Q5_K_M sobre el mismo modelo base, algo útil en investigación de cuantización.
- Chat bilingüe inglés-chino: el modelo está ajustado para esas dos lenguas, por lo que encaja en herramientas internas de soporte para equipos con documentación en ambos idiomas.
- Base para fine-tuning posterior en formato GGUF: aunque el flujo típico parte de safetensors, los ficheros permiten experimentar con LoRA sobre llama.cpp en entornos con VRAM limitada.
- Integración en pipelines de inferencia autoalojada: mediante llama.cpp server o bindings compatibles, se puede exponer una API HTTP interna para tareas de generación de texto sin depender de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ninguna puntuación de código, perplexidad ni calidad salvo los valores medidos que figuran en la model card, y estos se limitan a tamaños de fichero, hashes y verificación de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - Q2_K: ~12,7 GB
  - Q3_K_M: ~16,3 GB
  - Q4_K_M: ~20,1 GB
  - Q5_K_M: ~23,5 GB
- GPU recomendadas: A100 40/80 GB o H100 para Q5_K_M con contexto largo; RTX 4090 (24 GB) para Q4_K_M; RTX 4080/3090 (16 GB) para Q3_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M y en GPUs de 16 GB con Q3_K_M. El Q5_K_M excede los 24 GB si se suma caché KV para contextos amplios.
- Opciones de despliegue: llama.cpp (binario `llama-cli` verificado con build `b11669-620d2225c`), llama.cpp server, y cualquier frontend compatible con GGUF (Ollama, LM Studio) siempre que soporte la arquitectura `llama` en la versión adecuada.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (Sakura GGUF) | 33,1 B | no disponible | Apache 2.0 | GGUF Q2_K-Q5_K_M | Requantización comunitaria sin imatrix |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1 B | no disponible | Apache 2.0 | safetensors BF16 | Pesos de referencia, 66,2 GB |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF | 33,1 B | no disponible | Apache 2.0 | GGUF BF16 y otras | Fuente directa de esta requantización |
| Alternativas de ~30 B densos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con modelos de otras familias (por ejemplo, densos de 30-34 B de otros autores) no puede fundamentarse con los datos disponibles; cualquier cifra sería inventada.

## Limitaciones y advertencias

- Requantización sin importance matrix: la calidad relativa frente a una cuantización calibrada puede ser inferior, especialmente en Q2_K y Q3_K_M, y el autor no aporta perplexidad que lo cuantifique.
- No es una release oficial: los usuarios deben evaluar por su cuenta la fidelidad respecto al modelo base de Nanbeige.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- Contexto desconocido: al no publicarse la longitud de contexto, el dimensionado de la caché KV en producción es especulativo.
- Riesgo de alucinación: inherente a cualquier LLM; sin benchmarks ni evaluaciones de fidelidad publicadas, no hay base para estimar su magnitud.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial y redistribución con atribución; no obstante, la cadena de atribución incluye a Nanbeige (modelo base), bartowski (GGUF BF16) y webmp3 (requantización), y conviene conservar los avisos.
- Repositorio con 0 likes y 302 descargas: ecosistema de validación muy pequeño; no hay retroalimentación comunitaria que respalde la calidad.
- Ficheros grandes: el repo completo ocupa 145 GB; descargar solo el fichero necesario y verificar el SHA-256 antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webmp3/Nanbeige4.3-33B-GGUF
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Model card del commit fijado: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/blob/c1093c501cc6460427c0ac634db7223d0450c0ee/README.md
- Modelo base declarado: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Fuente GGUF BF16: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Paper, blog o demo oficial: no disponible
