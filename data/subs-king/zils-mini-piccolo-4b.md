# subs-king/zils-mini-piccolo-4b

## Resumen

Zils d3-mini soup body: Piccolo-4B es un reempaquetado del modelo agentscope-ai/Piccolo-4B, publicado por el usuario subs-king en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos del lenguaje son exactamente los del modelo original, sin modificar. El cambio introducido afecta únicamente a los nombres de los tensores y a la distribución de los shards, para adaptarlos al formato que exige el "cuerpo" (body) del pool d3-mini de la subred Zils (Bittensor SN127).

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) almacenados en safetensors, con un tamaño de repositorio de 9,1 GB. La licencia es Apache 2.0, heredada del modelo base, y los tensores `lm_head` y `mtp` no están incluidos en este reempaquetado. El pipeline no está declarado y no se especifican idiomas soportados en la información disponible.

Su relevancia es acotada: no aporta mejoras de capacidad respecto a Piccolo-4B y está pensado como artefacto de infraestructura para participantes del ecosistema Bittensor/Zils. Para cualquier uso general de inferencia conviene acudir directamente al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de agentscope-ai/Piccolo-4B; no especificada en la informacion) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/quantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este repositorio no documenta la arquitectura interna; la información disponible solo indica que los pesos del lenguaje son los del modelo agentscope-ai/Piccolo-4B en la revisión `35f5e464ef884d8720b53d12c7f8aaf5497a3644`, sin cambios. Cualquier detalle sobre tipo de transformer, atención, composición del dataset de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO) debe consultarse en la model card del modelo base, ya que no se reproduce aquí.

La única modificación realizada es estructural: renombrado de tensores y reorganización de shards para encajar en el layout del "soup body" de Zils (Bittensor SN127), pool d3-mini. Se excluyen explícitamente los tensores `lm_head` y `mtp`, lo que implica que este artefacto no es directamente un modelo de lenguaje completo para generación autónoma, sino un componente para el pipeline de dicho subnet.

## Capacidades

- No se documentan capacidades específicas en la información disponible; al conservar los pesos intactos, las capacidades serían las del modelo base Piccolo-4B.
- Generación de texto: presumiblemente heredada del modelo base, sin verificación en esta ficha.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- Nota: la ausencia de `lm_head` en el reempaquetado limita el uso directo para decodificación de tokens sin restaurar esa cabeza desde el modelo original.

## Casos de uso

- Participación en el subnet Zils (Bittensor SN127): el modelo está empaquetado específicamente como body del pool d3-mini, por lo que su uso previsto es servir como pesos de lenguaje dentro de la infraestructura de validación/minería de ese subnet.
- Sustitución de shards en pipelines internos de Zils: los nombres de tensores y el layout de shards están adaptados, lo que facilita su carga en el runtime del subnet sin transformaciones adicionales.
- Punto de partida para experimentación con Piccolo-4B: al ser idéntico en pesos al modelo base, puede usarse para comparar el comportamiento del runtime de Zils frente a una carga estándar del modelo original.
- Reconstrucción del modelo completo: combinando estos pesos con `lm_head` y `mtp` extraídos de agentscope-ai/Piccolo-4B se obtendría un modelo de 4,5B parámetros utilizable en tareas generales de generación de texto.
- Auditoría de licencias y trazabilidad: el repositorio incluye los ficheros de licencia originales, útil para verificar el cumplimiento Apache 2.0 en despliegues derivados.
- Docencia o pruebas de formato de pesos: sirve como ejemplo práctico de reempaquetado de safetensors y reorganización de shards sin alterar los valores numéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones teóricas, no verificadas para este artefacto).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues en FP16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para FP16 en configuraciones moderadas.
- GPU de consumo: cabe en tarjetas con 12-16 GB si se cuantiza a 8 bits; en 4 bits podría ejecutarse en GPUs de 8 GB, siempre que se restaure `lm_head`.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| subs-king/zils-mini-piccolo-4b | 4,54B | no disponible | Apache 2.0 | safetensors (sin lm_head/mtp) | Reempaquetado para Zils SN127 |
| agentscope-ai/Piccolo-4B | 4B (aprox.) | no disponible | Apache 2.0 | safetensors | Modelo base original, pesos completos |
| Alternativas de ~4B (p. ej. Qwen, Llama 3.2) | 3-4B | 8k-128k segun modelo | variable | safetensors, GGUF | No se dispone de datos comparativos verificados en esta informacion |

## Limitaciones y advertencias

- No es un modelo nuevo: no aporta ninguna mejora de calidad, razonamiento o contexto respecto a Piccolo-4B.
- Ausencia de `lm_head` y `mtp`: sin estos tensores el artefacto no puede generar texto de forma autónoma; requiere restaurarlos desde el modelo base.
- Sin model card técnica: no se documentan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso.
- Riesgo de alucinación y sesgos: no evaluados en este repositorio; deben asumirse los del modelo base, que tampoco se detallan aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución al autor original (agentscope-ai) y verificar los ficheros de licencia incluidos.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo en entornos reales.
- Uso principal restringido al ecosistema Bittensor/Zils; no recomendado como sustituto directo de un LLM de propósito general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/subs-king/zils-mini-piccolo-4b
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B
- Revisión del modelo base referenciada: `35f5e464ef884d8720b53d12c7f8aaf5497a3644`
- Subnet Zils (Bittensor SN127): no se proporciona enlace en la información disponible.
