# tablinum/Lite-Beam-27B

## Resumen

Lite-Beam 27B es una derivación cuantizada del modelo base Qwen/Qwen3.8-27B, publicada por el usuario tablinum en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una reconstrucción de los pesos del Qwen3.8-27B mediante el método propietario Lite-Beam, que combina un conjunto de calibración, una matriz de importancia y un cuantizador propio para producir archivos GGUF de 1 y 2 bits. El objetivo declarado es hacer viable la inferencia de un modelo de aproximadamente 27.000 millones de parámetros en GPUs de consumo reducidas, con un tamaño de archivo de 6,73 GB (IQ1_M, 1 bit) o 9,26 GB (IQ2_S, 2 bits).

La propuesta diferencial del autor no es solo la cuantización agresiva, sino el emparejamiento con un "engram" externo llamado Tablinum-2: un conjunto de pasajes recuperados que se inyectan en el prompt para compensar la pérdida de conocimiento factual provocada por la cuantización extrema. El autor publica métricas propias (SimpleQA, AA-Omniscience, GPQA Diamond) que muestran mejoras notables al usar el engram con el prompt de inyección `v1`, especialmente en la variante de 1 bit.

La relevancia actual del modelo radica en su enfoque híbrido: cuantización extrema más recuperación aumentada como estrategia para reducir requisitos de hardware sin renunciar por completo a la precisión factual. La licencia es Apache-2.0 y los pesos se distribuyen exclusivamente en formato GGUF para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de la arquitectura base no disponibles) |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones, dato de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se menciona un presupuesto de razonamiento de 32K en GPQA, no la ventana de contexto del modelo) |
| Tipos de cuantización | IQ1_M (1 bit, 6,73 GB, 1,97 bpw) e IQ2_S (2 bits, 9,26 GB, 2,71 bpw) |
| Idiomas soportados | inglés (`en` en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.8-27B, no un entrenamiento nuevo. Los pesos se generan con el conjunto de calibración, la matriz de importancia y el cuantizador de Tablinum (método Lite-Beam), aplicados sobre disposiciones de tipo por tensor que el autor atribuye en la model card. Se ofrecen dos configuraciones: IQ1_M con 1,97 bits por peso y IQ2_S con 2,71 bits por peso. El autor reporta divergencia KL frente al BF16 original: 0,121 en tokens del asistente (chat) y 0,174 en wikitext para IQ2_S, y 0,418 y 0,4 respectivamente para IQ1_M.

La innovación principal no está en la arquitectura del transformer subyacente, sino en el emparejamiento con un engram externo (Tablinum-2) y en un prompt de inyección (`v1`) que instruye al modelo a usar un pasaje solo si responde exactamente a la pregunta formulada; en caso contrario, debe recurrir a su propio conocimiento o declarar que no lo sabe. El autor también menciona decodificación especulativa como etiqueta del repositorio, aunque no se detallan los parámetros de esa implementación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que el modelo base no se documenta en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline de text-generation.
- Razonamiento multi-paso: se reportan resultados en GPQA Diamond con un presupuesto de razonamiento de 32K tokens y "low effort".
- Conocimiento factual asistido por recuperación: el engram Tablinum-2 inyecta pasajes para mejorar respuestas en dominios como Software, Derecho, STEM, Finanzas, Salud y Humanidades.
- Modo de respuesta calibrada: con el prompt `v1`, el modelo tiende a declinar responder cuando no dispone de fundamento, en lugar de alucinar (el autor reporta 71 respuestas incorrectas frente a 149 en modo closed-book para IQ1_M en AA).
- Integración con API compatible con OpenAI mediante la herramienta terrabeam (`http://127.0.0.1:8080/v1`).
- Soporte de memoria persistente opcional (`--memory long-term` en terrabeam).
- Proxy hacia backends existentes (Ollama, LM Studio, vLLM) con formato Tablinum.
- No se documentan capacidades de visión, audio ni tool calling nativo en la información disponible.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: la variante IQ1_M (6,73 GB) permite ejecutar un modelo de ~27B en tarjetas con 8 GB de VRAM, algo inviable con pesos en BF16. Adecuado para prototipado local y estaciones de trabajo modestas.
- Asistentes de conocimiento domain-specific con recuperación: combinando el modelo con el engram Tablinum-2 y el prompt `v1`, se puede construir un asistente para dominios como Software o Derecho, donde el autor reporta mejoras de +44,1 y +21,2 puntos respectivamente en el índice de conocimiento.
- Sustitución de backends en aplicaciones existentes: mediante `terrabeam proxy --upstream <URL> --format tablinum`, se puede envolver un servidor Ollama, LM Studio o vLLM ya en producción y añadir la capa de recuperación sin reescribir la aplicación.
- Evaluación de estrategias de cuantización extrema: investigadores que estudien el impacto de la cuantización de 1-2 bits en la fidelidad factual pueden usar este modelo como caso de estudio con métricas publicadas (KLD, SimpleQA, AA-Omniscience).
- Razonamiento científico con presupuesto acotado: para tareas tipo GPQA Diamond donde se acepta un presupuesto de 32K tokens y baja latencia de razonamiento, la variante IQ2_S reporta 70,2% (139/198).
- Integración en entornos de desarrollo con Open WebUI, Claude Code o Cursor: la documentación de terrabeam incluye guías de configuración para estos clientes, lo que facilita su uso como backend local en flujos de trabajo de desarrollo.
- Investigación sobre calibración y abstención: el comportamiento del modelo al declinar responder con el prompt `v1` lo hace útil para estudiar técnicas de abstención en modelos cuantizados.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor y son autoevaluados con bajo esfuerzo de razonamiento; el propio autor advierte que los valores absolutos no son comparables con cifras publicadas de AA.

| Benchmark | Build | Closed-book | + engram (plain) | + engram (`v1`) |
|---|---|---:|---:|---:|
| SimpleQA-verified (dev 200) | IQ1_M 6,73 GB | −14,0 | +43,0 | no disponible |
| SimpleQA-verified (dev 200) | IQ2_S 9,26 GB | −25,5 | +38,5 | no disponible |
| AA-Omniscience (test 400) | IQ1_M | −7,2 | −3,5 | no disponible |
| AA-Omniscience (test 400) | IQ2_S | −19,8 | −1,0 | no disponible |
| AA dev 200 (todos los dominios) | IQ1_M | −14,5 | +9,0 | +13,5 |
| AA dev 200 (todos los dominios) | IQ2_S | −32,5 | +1,5 | no disponible |

Desglose por dominio para IQ1_M con `v1` (AA dev 200): Software +44,1 (20 mejor / 1 peor), Derecho +21,2 (10/3), STEM +15,2 (13/4), Finanzas +3,0 (8/3), Salud −6,1 (11/4), Humanidades +2,9 (3/3).

| Benchmark | Build | Resultado |
|---|---|---:|
| GPQA Diamond (198), low effort, 32K budget | IQ2_S 9,26 GB | 139/198 (70,2%) |
| GPQA Diamond, sobre las 188 que terminaron | IQ2_S 9,26 GB | 73,9% |

Divergencia KL frente a BF16:

| Build | KLD chat (tokens asistente) | KLD wikitext |
|---|---:|---:|
| IQ2_S | 0,121 | 0,174 |
| IQ1_M | 0,418 | 0,4 |

## Requisitos de hardware

- VRAM estimada: IQ1_M requiere aproximadamente 6,73 GB de pesos; IQ2_S, aproximadamente 9,26 GB. Hay que añadir el espacio para el contexto KV y el runtime de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamaño, IQ1_M cabe en GPUs de consumo con 8 GB de VRAM; IQ2_S requiere al menos 12 GB para operar con holgura.
- Cabe en GPU de consumo: sí, en ambos casos, según el tamaño de los archivos.
- Opciones de despliegue: llama.cpp (librería nativa), terrabeam (instalador y servidor con API OpenAI-compatible), Ollama, LM Studio y vLLM mediante el modo proxy de terrabeam.
- Latencia y throughput: no disponibles. El autor no publica métricas de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lite-Beam 27B (IQ1_M / IQ2_S) | ≈26,9B | no disponible | 1 y 2 bits (GGUF) | Apache-2.0 | Hugging Face, 1.445 descargas |
| Qwen/Qwen3.8-27B (base) | ≈26,9B | no disponible | BF16 y otras | no disponible en la información | Hugging Face |
| Lite-Beam 1.0 501B A23B IQS_XXS | 501B (23B activos, MoE) | no disponible | IQS_XXS | no disponible en la información | Hugging Face (mismo autor) |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada. La comparación con el modelo base Qwen3.8-27B se limita a la divergencia KL reportada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La cuantización de 1 bit (IQ1_M) presenta una divergencia KL de 0,418 en chat frente a BF16, lo que implica una degradación notable de la distribución de salida respecto al original.
- El conocimiento factual del modelo sin engram es deficiente: el índice en AA-Omniscience es negativo en closed-book para ambas variantes (−7,2 y −19,8).
- Las mejoras reportadas dependen del engram Tablinum-2 y del prompt `v1`; sin ellos, el rendimiento cae drásticamente. El propio autor reconoce que STEM y Humanidades siguen limitados por cobertura.
- Los benchmarks son autoevaluados con bajo esfuerzo de razonamiento y el autor advierte que los valores absolutos no son comparables con cifras publicadas de AA-Omniscience.
- Riesgo de alucinación: el autor indica que el engram ayuda principalmente a "reemplazar respuestas incorrectas con confianza por respuestas fundamentadas", lo que sugiere que el modelo base tiende a responder con seguridad cuando no sabe.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que no se detalla en la información disponible; conviene verificar la compatibilidad antes de un despliegue comercial.
- No se documentan parámetros de contexto, tool calling ni otras capacidades que puedan ser críticas en producción.
- El repositorio tiene 0 likes y 1.445 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Lite-Beam-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset del engram Tablinum-2: https://huggingface.co/datasets/tablinum/tablinum-2
- Lite-Beam 1.0 (501B): https://huggingface.co/tablinum/Lite-Beam-1.0-501B-A23B-IQS_XXS
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guía de integración con clientes: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instalador (Linux/macOS): https://raw.githubusercontent.com/chadstthomas-svg/terrabeam/master/install.sh
- Instalador (Windows): https://raw.githubusercontent.com/chadstthomas-svg/terrabeam/master/install.ps1
