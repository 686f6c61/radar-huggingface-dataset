# SpaceTimee/Suri-Qwen-3.8-27B-Companion-GGUF

## Resumen

Suri Qwen 3.8 27B Companion es un modelo de lenguaje derivado de la familia Qwen, ajustado por el desarrollador independiente SpaceTimee (Space Time) bajo el paraguas del proyecto "Suri". Se distribuye en formato GGUF cuantizado y está orientado a conversación de acompañamiento ("companion"), es decir, diálogo abierto, empático y de estilo coloquial, más que a tareas de razonamiento formal o código. El modelo base declarado es SpaceTimee/Suri-Qwen-3.8-27B-Companion, a su vez un ajuste sobre una variante Qwen de 27B (etiquetada internamente como "Qwen3.8").

El dato objetivo disponible es el recuento de parámetros en safetensors: 26.895.998.464 (aproximadamente 26,9 mil millones), coherente con la nomenclatura "27B". El pipeline declarado es image-text-to-text, aunque la model card no documenta capacidades de visión ni arquitectura multimodal; el uso descrito por el autor es exclusivamente conversacional y textual. Los idiomas declarados son chino (zh) e inglés (en).

Su relevancia práctica es acotada pero concreta: es una de las pocas distribuciones GGUF de un ajuste conversacional de ~27B con licencia no especificada, lo que permite ejecución local en hardware de consumo alto (32-48 GB de VRAM/RAM unificada) mediante llama.cpp u Ollama. La información publicada es escasa: no hay benchmarks, no hay detalle de dataset de entrenamiento y la licencia no está disponible, lo que limita su adopción en producción comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no listadas en la informacion disponible); se menciona uso de imatrix |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 2359,6 GB, incluye multiples variantes); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen, con aproximadamente 26,9 mil millones de parámetros. No se dispone de información publicada sobre número de capas, dimensión oculta, mecanismo de atención (estándar, GQA o atención lineal), ni sobre si incorpora capas multimodales pese a la etiqueta `image-text-to-text`. El ajuste "Companion" se presenta como un fine-tuning orientado a personalidad y estilo conversacional, pero la model card no documenta la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de alineación como RLHF, DPO o SFT supervisado.

La única innovación técnica documentada de forma explícita es el uso de **imatrix** (importance matrix) en el proceso de cuantización GGUF, una técnica que calibra la pérdida de precisión por tensor para preservar mejor la calidad en cuantizaciones agresivas. El autor recomienda parámetros de muestreo concretos: temperatura 0,8-1,0, top_p 0,8-0,95 y repetition_penalty 1-1,1, lo que sugiere un ajuste afinado para respuestas variadas y no deterministas, típico de modelos de rol o acompañamiento.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Estilo de "compañero" (companion): respuestas coloquiales, empáticas y de rol, según la intención declarada por el autor.
- Conversación de rol y mantenimiento de personaje, coherente con el ajuste "Suri".
- Etiqueta `image-text-to-text` en el pipeline, aunque no se documenta procesamiento real de imágenes ni tokenizador visual.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference según los tags.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- **Compañía conversacional en local**: despliegue doméstico con llama.cpp u Ollama para mantener conversaciones de rol o acompañamiento en zh/en, aprovechando la cuantización GGUF para ejecución en una sola GPU o en memoria unificada.
- **Prototipado de personajes y chatbots de rol**: el ajuste "Companion" y los parámetros de muestreo recomendados (temp 0,8-1,0) permiten generar respuestas variadas y con personalidad sin ingeniería de prompts extensa.
- **Investigación sobre fine-tuning de personalidad**: útil como punto de comparación frente a modelos base Qwen del mismo tamaño para estudiar cómo el ajuste conversacional altera estilo, verbosidad y coherencia en diálogo.
- **Evaluación de cuantizaciones con imatrix**: el repo permite comparar variantes GGUF y medir el impacto de la matriz de importancia en la calidad de respuestas conversacionales.
- **Asistente de escritura creativa y diálogo narrativo**: generación de diálogos entre personajes en chino e inglés, con control de temperatura para explorar registros.
- **Despliegue en entornos con requisitos de privacidad**: al ejecutarse íntegramente en local, encaja en escenarios donde no se permite enviar conversaciones a APIs externas, siempre que se valide la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada (inferencia)**: para ~27B parámetros, aproximadamente 16-18 GB en Q4_K_M, 20-22 GB en Q5_K_M, 26-30 GB en Q8_0 y ~54 GB en FP16 (estimación teórica por tamaño, no confirmada por el autor).
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4/Q5.
- **Consumer GPU**: sí, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con cuantizaciones Q3 o inferiores, con degradación esperada.
- **Despliegue**: llama.cpp, Ollama, text-generation-inference (declarado en tags) y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente.
- **Latencia y throughput**: no disponibles; dependen de la cuantización y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Companion | ~26,9B | no disponible | zh, en | no disponible | GGUF, safetensors |
| Qwen2.5-32B-Instruct | ~32,5B | 32.768 tokens (ampliable) | multilingue | Apache 2.0 (variante estándar) | safetensors, GGUF |
| Gemma 2 27B IT | ~27B | 8.192 tokens | multilingue | Gemma Terms of Use | safetensors, GGUF |
| Mistral Small 24B Instruct | ~24B | 32.768 tokens | multilingue | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen2.5-32B-Instruct y Gemma 2 27B es aproximada: no se dispone de datos que confirmen la versión exacta de Qwen sobre la que se construye este ajuste ni su ventana de contexto. Frente a ellos, la ventaja de Suri es su especialización conversacional y la disponibilidad de GGUF con imatrix; la desventaja es la ausencia de licencia clara, benchmarks y documentación técnica.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- **Sesgos**: un ajuste de "companion" entrenado con datos no documentados puede reproducir sesgos de género, culturales o de rol; no hay evaluación publicada.
- **Alucinación**: sin benchmarks ni documentación de alineación, el riesgo de respuestas inventadas en dominios factuales es alto; no es un modelo adecuado para tareas de precisión sin verificación.
- **Contexto e idiomas**: solo se declaran zh y en; el castellano no está soportado oficialmente y la longitud de contexto es desconocida.
- **Pipeline ambiguo**: la etiqueta `image-text-to-text` no se corresponde con capacidades multimodales documentadas; conviene tratarlo como modelo de texto.
- **Trazabilidad**: el modelo base ("Qwen3.8") no corresponde a una denominación oficial conocida de Qwen, lo que dificulta auditar el linaje y los datos de entrenamiento.
- **Repo de gran tamaño**: 2359,6 GB en total; la descarga de variantes individuales debe hacerse de forma selectiva.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion
- Contacto del autor: Zeus6_6@163.com
- Grupo QQ del autor: 902575634
