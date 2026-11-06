# xkarkx/Qwen3.8-4B-Distill

## Resumen

Qwen3.8-4B-Distill es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por Empero y publicado en Hugging Face bajo el identificador xkarkx/Qwen3.8-4B-Distill. Se trata de un ejercicio de destilación off-policy: el estudiante de 4B parametros se entrena sobre aproximadamente 45.000 trazas de cadena de pensamiento (chain-of-thought) generadas por un profesor de escala frontier, Qwen3.8 2.4T A95B, con mezcla de matematicas, razonamiento general y seguimiento de instrucciones.

El objetivo declarado es trasladar el comportamiento de razonamiento de un modelo de escala frontier a un modelo de 4B que quepa en hardware de consumo. El resultado es un modelo causal de lenguaje (la rama de texto de una base vision-language) con 4.659.865.088 parametros reales en safetensors, contexto nativo de 262.144 tokens y soporte nativo de function calling heredado de la especificacion de Qwen3.5.

La relevancia practica esta en el binomio tamano/contexto: un modelo de 4B en bf16 ocupa aproximadamente 8 GB, lo que permite despliegues en GPU de consumo, y conserva una ventana de 256K tokens que en esta clase de tamano es poco habitual. La contrapartida es que el ajuste prioriza matematicas y razonamiento sobre codigo, y que la evaluacion publicada se limita a GSM8K y MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model sobre Qwen3.5 (transformer hibrido con capas de atencion lineal Gated DeltaNet, segun dependencias declaradas) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (la model card menciona builds cuantizados sin detallar formatos; el repo solo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, que segun la model card combina capas de atencion estandar con capas de atencion lineal basadas en Gated DeltaNet; para un rendimiento correcto requiere los kernels `flash-linear-attention` y una build de `causal_conv1d` compatible con la version de CUDA, ya que en su ausencia las capas lineales caen a operaciones PyTorch lentas y con alto consumo de memoria. Es la rama de texto de una base vision-language, por lo que la torre de vision existe en el modelo base pero no fue evaluada en este ajuste.

El entrenamiento es un SFT por destilacion off-policy: se recopilaron aproximadamente 45.000 trazas del profesor Qwen3.8 2.4T A95B, procedentes de los datasets internos de destilacion de Empero, con cadenas de pensamiento densas centradas en matematicas, razonamiento general y seguimiento de instrucciones, filtradas por calidad antes del entrenamiento. Se actualizaron todos los parametros (no es un adapter LoRA). El resultado es que cada respuesta del modelo se abre con un bloque `<think>` aprendido directamente de las trazas del profesor, en lugar de razonamiento sintetico autogenerado. Las herramientas de entrenamiento citadas son TRL y Transformers.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento explicito: toda respuesta comienza con un bloque `<think>...</think>` que debe parsearse y eliminarse antes de mostrarla al usuario final.
- Razonamiento matematico y aritmetico de varios pasos, reforzado por la mezcla de trazas del profesor (mejora de +19,9 puntos en MMLU CoT flexible respecto al base).
- Razonamiento general y conocimiento en 57 materias (MMLU con protocolo CoT).
- Seguimiento de instrucciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Function calling nativo conforme a la especificacion de Qwen3.5, sin necesidad de wrapper ni fine-tune especifico de herramientas.
- Contexto largo: 262.144 tokens nativos, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Vision: heredada de la base Qwen3.5-4B, pero no evaluada en este ajuste y fuera del alcance declarado (el fine-tune es solo texto).

## Casos de uso

- Tutoria y resolucion de problemas matematicos paso a paso: el bloque `<think>` expone el razonamiento intermedio, lo que permite auditar el procedimiento en lugar de solo la respuesta final; util en plataformas educativas que quieran mostrar el desarrollo.
- Asistentes conversacionales de contexto largo: con 262.144 tokens se puede mantener un historial extenso o adjuntar documentacion completa sin truncar, algo poco comun en modelos de 4B.
- Agentes con tool calling en local: el soporte nativo de function calling permite construir agentes que invoquen APIs, bases de datos o calculadoras en entornos sin GPU de datacenter, con el modelo en bf16 sobre una GPU de consumo.
- Procesamiento de documentos largos en ingles: resumen, extraccion y preguntas sobre contratos, informes o articulos que superen los 100K tokens, con el modelo desplegado en una sola GPU.
- Prototipado e investigacion en destilacion: al ser un fine-tune completo con receta y evaluacion publicadas, sirve como referencia para estudiar como se transfiere el comportamiento de razonamiento de un profesor frontier a un estudiante de 4B.
- Despliegue en portatiles y estaciones de trabajo: en bf16 ocupa aproximadamente 8 GB, de modo que cabe en GPU de consumo de gama alta y en builds cuantizados en equipos mas modestos, habilitando asistentes de razonamiento offline.
- Evaluacion comparativa de protocolos CoT: util para medir la diferencia entre metrica flexible y strict-match en modelos que razonan, ya que el autor publica ambas.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness` (backend HF, mismas condiciones para base y estudiante, protocolos CoT, muestreo con temperature=0.6, top_p=0.95, top_k=20):

| Tarea | Metrica | Qwen3.5-4B (base) | Qwen3.8-4B | Delta |
|---|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0,850 | 0,785 | -0,065 |
| gsm8k_cot | exact_match (strict) | 0,850 | 0,785 | -0,065 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,354 | 0,553 | +0,199 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0,071 | 0,233 | +0,162 |

No se han publicado resultados de HumanEval, MBPP, MATH, BBH ni de tareas de codigo o function calling en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 8 GB para los pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 12-16 GB para contexto largo.
- VRAM en cuantizacion: no disponible en la model card; el autor afirma que las builds cuantizadas corren en portatiles y GPU de consumo, sin especificar formatos ni tamanos.
- GPU recomendadas: A100 y H100 para produccion con contexto completo y throughput alto; RTX 4090 (24 GB) para bf16 con contexto largo; GPU de consumo de gama media solo con cuantizacion.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 16-24 GB y en cuantizacion en equipos mas modestos.
- Opciones de despliegue: Transformers, vLLM y SGLang (soporte de arquitectura Qwen3.5 declarado). Requiere `transformers` reciente con soporte Qwen3.5 y los kernels `flash-linear-attention` y `causal_conv1d` compilados contra la CUDA instalada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota operativa: sin los kernels de atencion lineal, las capas Gated DeltaNet usan operaciones PyTorch lentas y con alto consumo de memoria, lo que degrada gravemente el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU CoT (flexible) | GSM8K CoT | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3.8-4B-Distill | 4,66B | 262.144 | 0,553 | 0,785 | Apache-2.0 | Hugging Face (xkarkx) |
| Qwen3.5-4B (base) | ~4B | 262.144 (heredado) | 0,354 | 0,850 | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3.8-9B (familia Empero) | ~9B | no disponible | no disponible | no disponible | no disponible | Hugging Face (empero-ai) |

La comparativa se limita a estos tres modelos porque son los unicos con datos en la informacion proporcionada. El dato mas llamativo es el intercambio: el ajuste gana 19,9 puntos en MMLU CoT pero pierde 6,5 puntos en GSM8K respecto al base, lo que sugiere que la destilacion mejora el conocimiento general con razonamiento pero no la aritmetica de primaria. Para codigo, el propio autor remite a Qwen3.8-9B.

## Limitaciones y advertencias

- Regresion en GSM8K: el modelo rinde peor que su base (0,785 frente a 0,850), por lo que no es una mejora universal.
- Solo ingles: la metadata declara unicamente `en`; no hay soporte multilingue verificado.
- Repositorio de bajo respaldo: 0 likes y 581 descargas en el momento de la consulta, publicado por un autor individual (xkarkx) aunque la model card atribuya el desarrollo a Empero. Conviene tratar la procedencia con cautela.
- Model card con elementos atipicos: incluye direcciones de criptomonedas para donaciones y referencias a un modelo profesor (Qwen3.8 2.4T A95B) del que no se aportan enlaces verificables.
- Riesgo de alucinacion: inherente a un modelo de 4B; el bloque `<think>` no garantiza correccion y puede contener razonamiento plausible pero erroneo.
- Repeticion en decodificacion greedy: el autor advierte que la decodificacion greedy en generaciones largas provoca bucles de repeticion; es obligatorio usar muestreo con los parametros recomendados.
- Longitud de salida: se recomienda `max_new_tokens` de 16.384; valores bajos pueden truncar el bloque de razonamiento y producir respuestas invalidas.
- Vision no evaluada: aunque la base es vision-language, el ajuste es solo texto y el comportamiento visual no se ha medido.
- Dependencia de kernels: sin `flash-linear-attention` y `causal_conv1d` compatibles, el rendimiento se degrada severamente y el consumo de memoria crece.
- Licencia Apache-2.0: permite uso comercial, pero se hereda del base Qwen3.5-4B; conviene revisar los terminos del modelo base y la ausencia de garantias (el autor lo publica "as-is" para investigacion y experimentacion).
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xkarkx/Qwen3.8-4B-Distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano de la familia: https://huggingface.co/empero-ai/Qwen3.8-9B
- Organizacion Empero: https://empero.org
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- causal_conv1d: https://github.com/Dao-AILab/causal-conv1d
