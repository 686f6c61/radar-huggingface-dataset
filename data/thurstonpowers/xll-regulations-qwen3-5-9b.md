# thurstonpowers/xll-regulations-qwen3.5-9b

## Resumen

XLL Regulations Qwen3.5-9B es un ajuste fino completo (*full fine-tune*) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario thurstonpowers. Su propósito es muy concreto: convertir secciones de regulaciones federales estadounidenses en un árbol JSON estructural XLL alineado con el texto fuente, preservando la jerarquía de disposiciones y la semántica de la estructura legal original. No es un modelo de propósito general ni un adaptador LoRA: se distribuyen los pesos BF16 completos del ajuste.

La relevancia del modelo reside en su especialización extrema y en su contrato de entrada poco habitual. No acepta texto plano de regulaciones, sino un índice léxico disperso y sin pérdida de la sección fuente, codificado como fragmentos `start:end|JSON-string`. La salida es un árbol `{"tree":[tag,start,end,attributes,children]}` cuyos intervalos apuntan al texto original, de modo que el contenido se copia por referencia y no se regenera. Esto reduce el riesgo de alucinación textual y hace que la fidelidad sea verificable de forma determinista.

Con 9.409.813.744 parámetros y un repositorio de 18,8 GB en safetensors, el modelo se posiciona como una alternativa de despliegue contenido frente a modelos frontera para una tarea de conversión documental estructurada. El autor advierte explícitamente de que no se han medido la relación coste-eficacia ni el rendimiento de servicio, y de que el modelo no sustituye la validación determinista ni la revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, full fine-tune) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y se somete a un ajuste fino completo de todos los parámetros, no a un adaptador. La arquitectura subyacente es la del modelo base Qwen3.5, de tipo transformer; la información proporcionada no detalla variantes como atención lineal, mezcla de expertos o decodificación especulativa. El pipeline declarado en Hugging Face es `image-text-to-text`, aunque la tarea entrenada es de conversión texto-a-estructura JSON.

El entrenamiento utiliza el dataset `thurstonpowers/xll-regulations-dataset` y define un protocolo concreto: `raw-text-cfr-source-native-structure-0.2`, con la variante de prompt `cfr-native-lexical-sparse-v2-regulations`. La entrada de usuario es un índice léxico disperso de la sección fuente, con fragmentos que cubren todos los caracteres distintos del espacio ASCII; las posiciones no listadas se reconstruyen como espacios ASCII. La salida esperada es un árbol USLM con cinco campos por nodo, intervalos de offsets Unicode basados en cero y exclusivos en el extremo final, hijos ordenados, no solapados y contenidos en sus padres. El prompt de sistema está congelado y debe usarse byte a byte, con `enable_thinking=False` y decodificación greedy (`do_sample=False`), sin gramática ni reparación de salida. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Conversión de secciones de regulaciones federales a árbol JSON estructural XLL con intervalos de offsets sobre el texto fuente.
- Preservación de la jerarquía de disposiciones: `num`, `heading`, `chapeau`, `content`, `continuation`, `notes`, `references` y marcado en línea.
- Manejo de tablas con atributos de tabla (`colspan`, `rowspan`, `scope`, `span`) cuando están evidenciados en la entrada.
- Diferenciación entre elementos CFR, `source`, `authority` y `editorial`.
- Predicción de atributos solo cuando están fundamentados en el texto: `value`, `date`, `type`, `role`, `topic`, `status` y atributos de tabla.
- Omisión deliberada de identificadores externos, destinos de enlace y atributos de presentación.
- Salida estrictamente JSON, sin explicaciones ni fences de Markdown.
- Capacidad monolingüe en inglés.
- No se documentan tool calling, function calling, comportamiento agéntico ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Conversión de corpus regulatorio a estructura USLM: el modelo transforma secciones del CFR en árboles JSON con spans verificables, lo que permite ensamblar después el XML USLM de forma determinista y auditable.
- Enriquecimiento de bases de datos legales: los árboles de salida permiten indexar disposiciones por jerarquía y tipo de provisión, facilitando búsquedas estructurales sobre normativa federal.
- Auditoría de fidelidad documental: al copiar el texto por referencia mediante offsets, un pipeline puede comparar cada span con el texto original y detectar desviaciones sin depender de la generación libre del modelo.
- Extracción de metadatos regulatorios: los atributos `date`, `type`, `status` y `topic` permiten poblar campos estructurados de un sistema de gestión normativa a partir de secciones individuales.
- Procesamiento de tablas normativas: la predicción de `colspan`, `rowspan`, `scope` y `span` resulta útil para reconstruir tablas regulatorias en formatos estructurados.
- Preprocesado para revisión humana: el árbol generado sirve como borrador estructurado que un revisor legal valida y corrige, reduciendo el trabajo manual de marcado.
- Integración en pipelines de publicación normativa: el modelo puede alimentar un ensamblador determinista que genere USLM XML a partir de los spans, con validación posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evidencia de evaluación se distribuye junto con los pesos, pero no se proporcionan cifras numéricas en la información accesible, y señala que la relación coste-eficacia y el throughput de servicio no han sido medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para margen operativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 de 24 GB para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB o superiores, siempre que la longitud de contexto y el tamaño de lote sean contenidos.
- Opciones de despliegue: transformers con el chat template indicado; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Regulations Qwen3.5-9B | 9.409.813.744 | no disponible | Conversión de regulaciones a árbol XLL/USLM | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B (aproximado) | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Modelos frontera de propósito general | no disponible | no disponible | Generalista | variable | APIs comerciales |

La comparación cuantitativa con alternativas especializadas en estructuración legal no está disponible en la información proporcionada. El propio autor subraya que el modelo no compite con modelos frontera de propósito general y que no es el adaptador de estatutos ni USLM XML autónomo.

## Limitaciones y advertencias

- No acepta texto plano de regulaciones: usar texto crudo o aplicar los offsets de salida al mensaje indexado queda fuera del contrato entrenado y no debe esperarse que reproduzca la precisión reportada.
- Requiere el prompt de sistema congelado byte a byte, sin envoltorio de rol adicional, descripción de esquema ni fences de Markdown.
- La salida debe ensamblarse, validarse y revisarse humanamente de forma determinista; el modelo no garantiza por sí solo un XML USLM válido.
- Riesgo de alucinación estructural: aunque el texto se copia por spans, la asignación de etiquetas, jerarquía y atributos puede ser incorrecta y debe verificarse.
- Sesgos conocidos: no documentados en la información disponible.
- Limitación idiomática: solo inglés, orientado a regulaciones federales de EE. UU.
- Longitud de contexto no documentada, lo que dificulta planificar el procesamiento de secciones largas.
- Licencia apache-2.0, que permite uso comercial, pero sin garantías del autor sobre idoneidad legal o precisión normativa.
- El autor advierte de que no se han medido coste-eficacia ni throughput, por lo que las estimaciones de producción deben validarse empíricamente.
- No es un competidor de modelos frontera ni sustituye al adaptador de estatutos; su ámbito es la conversión de regulaciones a estructura XLL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-regulations-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-regulations-dataset
- Prompt entrenado (`PROMPT_TRAINED.txt`): https://huggingface.co/thurstonpowers/xll-regulations-qwen3.5-9b/blob/main/PROMPT_TRAINED.txt
- Ejemplo de entrenamiento (`example.json`): https://huggingface.co/thurstonpowers/xll-regulations-qwen3.5-9b/blob/main/example.json
