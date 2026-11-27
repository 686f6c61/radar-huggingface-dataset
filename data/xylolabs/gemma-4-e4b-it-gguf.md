# Xylolabs/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT GGUF es una colección de cuantizaciones en formato GGUF del modelo google/gemma-4-E4B-it, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es la variante instruct de la familia Gemma 4 de Google, con 7.518.069.290 parámetros totales según los pesos en safetensors del modelo original. Esta ficha describe la distribución cuantizada, no el modelo base, por lo que las capacidades y el comportamiento funcional provienen del modelo de Google subyacente.

El interés de esta publicación radica en la calidad de las cuantizaciones: el autor incluye una tabla comparativa frente a BF16 con métricas de divergencia KL y precisión top-1 sobre WikiText-2, un conjunto de chat y un conjunto held-out, y compara sus propios quants con los de Unsloth. En las mismas huellas de tamaño, los quants de Xylolabs muestran una degradación notablemente menor que las alternativas de Unsloth recogidas en la tabla, lo que resulta relevante para despliegues en hardware limitado.

La licencia declarada es Apache-2.0 y los idiomas indicados en la model card son inglés y coreano. El repositorio ocupa 47,5 GB e incluye diez ficheros GGUF que van desde IQ2_M (3,55 GB) hasta Q6_K (7,07 GB). La fecha de creación del repositorio es el 14 de noviembre de 2026 y la última actualización el 25 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E4B-it; la model card del quant no detalla la arquitectura interna) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K, IQ2_M |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card de esta distribución no describe la arquitectura interna del modelo base ni los datos de entrenamiento. Se sabe que el modelo original es google/gemma-4-E4B-it, de la familia Gemma 4 de Google, y que esta publicación es una cuantización del mismo con relación `base_model_relation: quantized`. Cualquier detalle sobre tipo de transformer, composición del corpus, número de tokens o fases de alineación (RLHF/DPO) debe consultarse en la model card del modelo base, que no forma parte de la información proporcionada.

El trabajo técnico destacable de esta ficha es el proceso de cuantización. El autor reporta métricas de fidelidad frente a BF16 (divergencia KL y precisión top-1) sobre tres conjuntos: WikiText-2, un conjunto de chat y un conjunto held-out. Además, la model card menciona el uso de imatrix (según los tags del repositorio) y ofrece una comparación directa con cuantizaciones de Unsloth en huellas de tamaño equivalentes. El ejemplo de ejecución recomienda llama.cpp release b12531 o posterior y el flag `--jinja`; también documenta el uso de `--chat-template-kwargs '{"enable_thinking":false}'` para obtener respuestas directas sin modo de razonamiento.

## Capacidades

- Generación de texto conversacional en inglés y coreano, según los idiomas declarados.
- Modo de razonamiento (thinking) activable o desactivable mediante `enable_thinking` en las kwargs de plantilla de chat.
- Compatibilidad con llama.cpp en CUDA, Metal y CPU.
- Compatible con `llama-cli` y `llama-server`, lo que permite despliegue como servidor HTTP compatible con la API de chat.
- Soporte de plantilla de chat Jinja (`--jinja`), lo que habilita el formateo de turnos y el uso de plantillas conversacionales.
- El resto de capacidades específicas del modelo base (tool calling, agentes, matemáticas, código, visión) no están documentadas en la model card de esta cuantización y deben verificarse en la ficha de google/gemma-4-E4B-it.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: con el quant Q4_K_M (4,98 GB) o IQ4_XS (4,72 GB) el modelo cabe en memoria RAM de un portátil moderno y se ejecuta en CPU con llama.cpp, lo que permite prototipar asistentes conversacionales sin infraestructura cloud.
- Servicio de chat en una GPU de consumo: el quant Q5_K_M (5,48 GB) o Q6_K (7,07 GB) se ajusta a GPUs con 8-12 GB de VRAM, y `llama-server` expone una API HTTP para integrarlo en aplicaciones web o backends internos.
- Evaluación de calidad de cuantización en pipelines de ML: la tabla de divergencia KL y top-1 frente a BF16 permite elegir el quant con el compromiso adecuado entre tamaño y fidelidad para un caso concreto, por ejemplo IQ4_XS si se prioriza tamaño o Q6_K si se prioriza calidad.
- Procesamiento por lotes en CPU para tareas de generación de texto en inglés o coreano: con llama.cpp y `-ngl 0` se puede ejecutar en servidores sin GPU para resúmenes, clasificación o generación de borradores donde la latencia no sea crítica.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache-2.0, el modelo cuantizado puede integrarse en productos comerciales sin las restricciones de otras licencias de modelos abiertos.
- Comparación de implementaciones de cuantización: el repositorio incluye resultados frente a Unsloth en huellas equivalentes, lo que sirve como referencia para decidir qué proveedor de quants usar en producción.
- Experimentación con el modo thinking: el flag `enable_thinking` permite alternar entre respuestas directas y razonamiento extendido, útil para evaluar el impacto en latencia y calidad en tareas de razonamiento.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de cuantización frente a BF16, que se reproducen a continuación para los quants propios del autor:

| Quant | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| IQ2_M | 3,545 GB | 0,145291 | 85,123% | 0,120633 | 88,990% | 0,138921 | 87,559% |
| Q2_K | 3,643 GB | 0,116908 | 86,627% | 0,097999 | 90,284% | 0,114853 | 88,618% |
| IQ3_M | 3,717 GB | 0,101507 | 87,417% | 0,086792 | 90,873% | 0,104041 | 89,147% |
| Q3_K_M | 4,058 GB | 0,064535 | 89,745% | 0,061062 | 91,863% | 0,061970 | 91,382% |
| IQ4_XS | 4,715 GB | 0,027604 | 93,299% | 0,027729 | 94,676% | 0,026384 | 94,304% |
| Q4_K_S | 4,845 GB | 0,027684 | 93,275% | 0,023422 | 95,078% | 0,024669 | 94,627% |
| Q4_K_M | 4,977 GB | 0,022757 | 94,020% | 0,020117 | 95,412% | 0,019967 | 95,020% |
| Q5_K_S | 5,405 GB | 0,014282 | 95,020% | 0,011529 | 96,343% | 0,012316 | 96,098% |
| Q5_K_M | 5,482 GB | 0,013250 | 95,319% | 0,010749 | 96,578% | 0,011395 | 96,255% |
| Q6_K | 7,073 GB | 0,005638 | 96,961% | 0,004307 | 98,108% | 0,004469 | 97,549% |

La model card incluye además una comparación con cuantizaciones de Unsloth en huellas equivalentes. A modo de ejemplo representativo, en IQ4_XS (4,715 GB) el quant de Xylolabs obtiene KL 0,027604 y top-1 93,299% en WikiText-2, frente a KL 0,115054 y top-1 85,922% del IQ4_XS de Unsloth; en Q6_K (7,073 GB) el de Xylolabs obtiene KL 0,005638 y top-1 96,961%, frente a KL 0,010617 y top-1 95,882% del Q6_K de Unsloth. Estas cifras son las reportadas por el autor y no se han verificado de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead de contexto. Para Q4_K_M (4,98 GB) se recomienda al menos 6 GB de VRAM; para Q6_K (7,07 GB), al menos 8 GB; para IQ2_M (3,55 GB), al menos 4,5 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal que disponga de VRAM suficiente. Para Q4_K_M y Q5_K_M son adecuadas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; para Q6_K, RTX 4070 Ti o superiores. En el segmento profesional, A100 y H100 sobran para todos los quants.
- Cabe en GPU de consumo: sí. Los quants de 4-5 GB (Q4_K_M, IQ4_XS, Q4_K_S) caben en GPUs de 6-8 GB; Q5_K_M y Q6_K requieren 8-12 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), con soporte de CUDA, Metal y CPU. No se documentan en la model card otras opciones como vLLM, TGI u Ollama, aunque al ser GGUF estándar podrían ser compatibles según la versión.
- Latencia y throughput: no disponibles. La model card no reporta mediciones de velocidad; solo indica que se use llama.cpp b12531 o posterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Xylolabs/gemma-4-E4B-it-GGUF (este) | 7.518.069.290 | no disponible | Apache-2.0 | GGUF | Quants con métricas de fidelidad frente a BF16 y comparación con Unsloth |
| google/gemma-4-E4B-it | 7.518.069.290 | no disponible | Apache-2.0 (según este repo) | safetensors | Modelo base original; referencia de calidad BF16 |
| Quants de Unsloth para gemma-4-E4B-it | 7.518.069.290 | no disponible | Apache-2.0 | GGUF | Alternativa de cuantización; en la tabla del autor presenta mayor divergencia KL en huellas equivalentes |
| Otros modelos de ~7-8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos de benchmarks de tarea en la información proporcionada |

La comparación se limita a variantes del mismo modelo base y a la alternativa de Unsloth documentada por el autor. No se dispone de datos de benchmarks de tarea que permitan comparar con modelos de otros proveedores de tamaño similar.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben consultarse en la ficha de google/gemma-4-E4B-it.
- Riesgo de alucinación: inherente a los modelos generativos; no se reportan evaluaciones específicas de factualidad en esta distribución.
- Idiomas: solo se declaran inglés y coreano. El rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto: no documentada en la model card; el ejemplo usa 8192 tokens. Verificar la ventana real del modelo base antes de usarlo en tareas de contexto largo.
- Licencia: Apache-2.0 según la model card y el badge del repositorio; conviene revisar el fichero LICENSE del repositorio y la licencia del modelo base para uso comercial.
- Los quants de menor tamaño (IQ2_M, Q2_K) presentan una degradación medible frente a BF16 (KL 0,145 y 0,117 en WikiText-2, respectivamente); no se recomiendan para producción sensible a la calidad.
- Las métricas de fidelidad y la comparación con Unsloth son las reportadas por el autor; no se han verificado de forma independiente en la información disponible.
- Requiere llama.cpp b12531 o posterior; versiones anteriores pueden no cargar correctamente estos GGUF.
- El repositorio tiene 0 likes y 3297 descargas en el momento de la consulta; es una publicación reciente (noviembre de 2026) sin validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de referencia de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF/blob/main/LICENSE
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráfica de divergencia KL media: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF/resolve/main/accuracy-mean-kl.png
- Gráfica de precisión top-1: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF/resolve/main/accuracy-top1.png
