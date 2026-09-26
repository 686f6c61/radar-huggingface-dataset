# superagent-ai/security-one-27b

## Resumen

security-one-27b es un modelo de 27.356.728.560 parámetros (unos 27,36 mil millones) publicado por superagent-ai, la organización detrás de Superagent, una herramienta de protección en tiempo de ejecución para agentes y copilotos de IA. El modelo se presenta como un clasificador especializado en seguridad: sus etiquetas incluyen `classification`, `decision-model`, `prompt-injection`, `ai-security` y `text-classification`, lo que apunta a un uso como componente de decisión para detectar inyecciones de prompt y entradas hostiles antes de que lleguen a un modelo generativo.

Técnicamente es un fine-tuning del modelo `denis-pplx/autojev-27b` y lleva la etiqueta de arquitectura `qwen3_5`, además de `image-text-to-text`, lo que sugiere una base multimodal de la familia Qwen 3.5. Los pesos se distribuyen en formato safetensors con un repositorio de 54,7 GB, coherente con pesos en BF16/FP16 para ese número de parámetros. La licencia declarada es Apache-2.0, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace.

Su relevancia es contextual: la seguridad de agentes (filtrado de prompts, validación de llamadas a herramientas y prevención de fugas de datos) se ha convertido en una capa crítica en despliegues de producción. Sin embargo, el modelo es muy reciente (creado el 25 de septiembre de 2026), acumula 0 descargas y 0 likes, y no publica documentación técnica, benchmarks ni especificaciones de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen 3.5 (etiqueta `qwen3_5`); no se detalla si emplea MoE, atención lineal u otras variantes |
| Parámetros totales | 27.356.728.560 (~27,36 mil millones) |
| Parámetros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio publica safetensors de 54,7 GB, tamaño consistente con BF16/FP16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0, con acceso restringido (gated) en HuggingFace |
| Formato de pesos | safetensors |
| Modelo base | denis-pplx/autojev-27b (fine-tune) |
| Tarea declarada | text-classification (etiqueta adicional: image-text-to-text) |
| Biblioteca | transformers |
| Compatibilidad de despliegue | `endpoints_compatible`, `sglang` |
| Acceso | restringido; requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5`, que sitúa al modelo en la familia Qwen 3.5, y de la etiqueta `image-text-to-text`, que indica capacidad de procesar entradas de imagen y texto. El recuento exacto de parámetros (27.356.728.560) procede de los archivos safetensors, y el tamaño del repositorio (54,7 GB) es consistente con pesos en BF16/FP16 sin cuantizar. No se especifica el número de capas, la dimensión oculta, el tipo de atención ni si existe mezcla de expertos.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, la presencia de fases de RLHF, DPO o ajuste supervisado, ni sobre el procedimiento concreto de destilación o calibración para la tarea de clasificación de seguridad. Únicamente consta que deriva de `denis-pplx/autojev-27b` mediante fine-tune, lo que implica que hereda la arquitectura, el tokenizador y buena parte de los sesgos del modelo base. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, cabezas de clasificación específicas) sería especulativa con los datos actuales.

## Capacidades

- Clasificación de texto orientada a seguridad: el pipeline declarado es `text-classification` y las etiquetas apuntan a la detección de inyecciones de prompt y contenido hostil.
- Modelo de decisión (`decision-model`): orientado a producir una decisión binaria o categorizada sobre una entrada, no a generar texto libre.
- Procesamiento de entradas multimodal imagen-texto segun la etiqueta `image-text-to-text`, en contradicción aparente con el pipeline de clasificación de texto; no se detalla el uso previsto de la vía visual.
- Detección de prompt injection: caso de uso explícito en las etiquetas del repositorio.
- Compatibilidad con SGLang y con endpoints gestionados, lo que facilita su integración como servicio de inferencia.
- Idiomas: únicamente inglés según la etiqueta declarada.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking, audio u otras modalidades.

## Casos de uso

- Filtrado de prompts en tiempo de ejecución: colocado como proxy delante de un LLM generativo, el modelo clasificaría cada entrada del usuario o de una fuente externa para bloquear intentos de inyección antes de que alcancen al modelo principal.
- Protección de agentes con acceso a herramientas: en un agente que ejecuta llamadas a APIs o a un sistema de archivos, el modelo puede actuar como validador de la intención de la petición, reduciendo el riesgo de que un texto malicioso induzca una acción no autorizada.
- Moderación de contenido generado: clasificación de salidas del modelo principal para detectar contenido dañino o filtraciones antes de devolverlas al usuario final.
- Auditoría y cumplimiento: generación de etiquetas de decisión registrables para demostrar a clientes o auditores que existe un control de seguridad documentado sobre el tráfico de IA.
- Filtrado de contenido recuperado en pipelines RAG: análisis de documentos, páginas web o resultados de búsqueda antes de incorporarlos al contexto del modelo, evitando inyecciones indirectas.
- Detección de exfiltración de datos: clasificación de prompts salientes que contengan secretos, credenciales o datos personales, como control de fuga de información.
- Inspección de entradas multimodales: si la vía imagen-texto es funcional, podría analizar capturas de pantalla o documentos escaneados en busca de instrucciones maliciosas embebidas.
- Despliegue on-premise en entornos regulados: la licencia Apache-2.0 permite el uso comercial y la instalación en infraestructura propia, algo relevante para banca, sanidad o sector público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de métricas, y la búsqueda web no aporta cifras asociadas específicamente a `security-one-27b`. La única referencia de rendimiento encontrada corresponde a material promocional sobre SuperagentLM, el modelo de seguridad de la empresa, que afirma analizar tráfico con latencia inferior a 50 ms; no hay confirmación de que esa cifra corresponda a este modelo de 27B, y se trata de una fuente de terceros, no de documentación oficial.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (27,36B) y no proceden de documentación oficial del modelo:

- Inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos, más caché KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB, H200) o reparto en varias GPU.
- Inferencia en INT8: aproximadamente 28 GB para pesos. Cabe en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB dejando margen para caché.
- Inferencia en 4 bits (GPTQ/AWQ): aproximadamente 14-16 GB para pesos. Cabe en una RTX 4090 o RTX 5090 con contexto moderado.
- GPU de consumo: viable en RTX 4090 (24 GB), RTX 5090 (32 GB) o RTX 3090 (24 GB) con cuantización de 4 bits; en 8 bits queda al límite en tarjetas de 24 GB.
- Opciones de despliegue: `transformers` (biblioteca declarada), SGLang (etiqueta oficial) y, previsiblemente, vLLM o TGI por tratarse de un modelo safetensors estándar. Para llama.cpp u Ollama sería necesario disponer de pesos GGUF, que no se publican en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de `security-one-27b` ni de comparativas publicadas, por lo que la tabla siguiente es únicamente paramétrica y de licencia. Los datos de los modelos alternativos provienen de documentación pública ampliamente conocida, no de la búsqueda web realizada.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento comparado |
|---|---|---|---|---|---|
| superagent-ai/security-one-27b | 27,36B | no disponible | Apache-2.0 (gated) | Clasificación de seguridad / prompt injection | no disponible |
| denis-pplx/autojev-27b (modelo base) | no disponible | no disponible | no disponible | Modelo generalista del que deriva | no disponible |
| Qwen3-32B | ~32,8B | 128K (según documentación pública) | Apache-2.0 | LLM generalista con modo thinking | no disponible |
| Gemma-3-27B-IT | ~27B | 128K (según documentación pública) | Términos de Gemma | LLM generalista multimodal | no disponible |

No se han identificado en la información proporcionada otros clasificadores de seguridad de tamaño comparable con los que establecer una comparación directa de precisión, recall o latencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de precisión, recall, F1 ni tasa de falsos positivos, algo crítico en un modelo cuyo propósito es bloquear tráfico.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la evaluación independiente.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Idioma: solo inglés declarado; su comportamiento con prompts en castellano u otros idiomas no está documentado.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el análisis de conversaciones largas o documentos extensos.
- Ambigüedad de tarea: el pipeline declarado es `text-classification` pero las etiquetas incluyen `image-text-to-text`, sin aclarar si la vía multimodal está activa o es un remanente del modelo base.
- Especialización estrecha: está ajustado para clasificación de seguridad, por lo que no debe emplearse como modelo generativo de propósito general.
- Riesgo de falsos positivos y negativos: en un guardarraíl de seguridad, los falsos positivos degradan la experiencia de usuario y los falsos negativos comprometen la protección; sin métricas publicadas no es posible calibrar ese equilibrio.
- Sesgos heredados: al ser un fine-tune de `denis-pplx/autojev-27b`, arrastra los sesgos y limitaciones del modelo base, cuya documentación no se ha podido verificar.
- Uso comercial: la licencia Apache-2.0 lo permite en principio, pero las condiciones adicionales del acceso gated podrían imponer restricciones que no se detallan en la información disponible.
- Producción: sin pruebas de robustez frente a ataques adversariales específicos, no debería ser el único control de seguridad de un sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/superagent-ai/security-one-27b
- Repositorio GitHub de Superagent: https://github.com/superagent-ai/superagent
- Documentación en DeepWiki: https://deepwiki.com/superagent-ai/superagent
- Ficha en Agents.one: https://agents.one/agent/superagent
- Plataforma SuperAgentX: https://www.superagentx.ai/
- Reseña en BestAITools: https://www.bestaitools.com/tool/superagent/
