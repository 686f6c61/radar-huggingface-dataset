# SZLHOLDINGS/willay-r1-candidate

## Resumen

willay-r1-candidate es un modelo de investigación publicado por SZLHOLDINGS, derivado por ajuste fino supervisado (SFT) del checkpoint `szl-receiptagent-qwen35-0.8b-sft-v3`, que a su vez se apoya en la arquitectura Qwen 3.5. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones) y se distribuye bajo licencia Apache 2.0 en formato safetensors, con pipeline declarado `image-text-to-text`, lo que indica soporte de entrada multimodal imagen-texto. El repositorio ocupa 3,5 GB.

El modelo se presenta explícitamente como un "research candidate" no promocionado ni certificado en calidad, entrenado bajo un contrato de lanzamiento fail-closed del pipeline interno szl-forge. Según la model card, el entrenamiento se realizó sobre un corpus denominado Doctrine-corpus-v2, con una partición group-disjoint de 212/24 y semilla 3407, y con un recibo de admisión de derechos bajo licencia CC-BY-4.0. No se han publicado resultados de evaluación ni benchmarks amplios; la evaluación sobre el holdout está pendiente de publicación.

Su relevancia es limitada y de nicho: se trata de un artefacto de investigación orientado a estudiar procedencia, reproducibilidad y gobernanza de modelos, más que un modelo listo para producción. Con solo 2 descargas y 0 likes en el momento de la consulta, y sin idiomas declarados, debe tratarse como un objeto de estudio de linaje y contratos de despliegue, no como una base para aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen 3.5 (según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un ajuste fino SFT de un checkpoint base Qwen 3.5 de aproximadamente 0,8 mil millones de parámetros, con pipeline multimodal `image-text-to-text`. No se detallan en la información proporcionada el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como decodificación especulativa o atención lineal. El tag `qwen3_5` sugiere la familia arquitectónica, pero no se aportan especificaciones internas.

El entrenamiento se realizó mediante el pipeline gobernado szl-forge bajo un "launch contract" (referencia PR #708), con pines inmutables, partición group-disjoint de 212/24 con semilla 3407, suelo de corpus y recibo de admisión de derechos (`ADMITTED_FOR_TRAINING`, CC-BY-4.0). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card enfatiza la trazabilidad del linaje y la reproducibilidad por encima de las capacidades del modelo.

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), lo que sugiere capacidad multimodal de entrada, aunque no se detalla el alcance.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- No se declaran modos especiales (thinking, audio, visión de salida) más allá de la entrada imagen-texto.

## Casos de uso

- Estudio de procedencia y linaje de modelos: el artefacto incorpora pines inmutables, recibos de admisión y contratos de lanzamiento, lo que lo hace útil para investigar reproducibilidad y trazabilidad en pipelines de IA.
- Investigación sobre gobernanza de despliegue: sirve para analizar cómo un contrato fail-closed condiciona la promoción de un modelo y qué metadatos se conservan en cada etapa.
- Análisis de fallos y limitaciones: la propia documentación del ecosistema sugiere su uso para estudiar casos en los que los modelos no alcanzan estándares de fiabilidad y precisión factual.
- Experimentación académica sobre autodescripción de modelos: permite examinar cómo un modelo describe sus propias capacidades y limitaciones.
- Reproducción de experimentos SFT: la partición group-disjoint con semilla fija y los recibos por ola facilitan replicar el proceso de ajuste fino en entornos controlados.
- Docencia y formación en MLOps: útil como ejemplo didáctico de pipeline con admisión de datos, evaluación pendiente y estado de promoción explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación sobre el holdout group-disjoint está pendiente de publicación y que no existe certificación de calidad ni benchmark amplio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7-1,8 GB solo para pesos (873 M de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9-1,0 GB para pesos; en 4 bits, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM debería poder ejecutar el modelo en FP16 con contexto moderado; para lotes grandes o contexto largo se recomiendan GPU de datacenter como A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: transformers (librería declarada); el ecosistema de Hugging Face lista integraciones genéricas como vLLM, llama.cpp, Ollama, TGI y SGLang, pero no se confirma compatibilidad específica ni existen cuantizaciones GGUF publicadas en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/willay-r1-candidate | 873 M | no disponible | Apache 2.0 | research candidate, no promocionado | SFT sobre Qwen 3.5 0.8B, multimodal imagen-texto, sin benchmarks |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 | ~0,8 B (base declarada) | no disponible | no disponible | checkpoint base | Modelo del que deriva willay-r1-candidate |
| Qwen 3.5 0.8B (familia base) | ~0,8 B | no disponible en la información | no disponible | modelo base de referencia | Arquitectura de la que parte la cadena de ajuste fino |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente no promocionado y no certificado en calidad; no debe usarse en producción sin evaluación propia.
- Sin benchmarks publicados ni evaluación de holdout disponible; el rendimiento real es desconocido.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- Riesgo de alucinación no cuantificado; la documentación del ecosistema lo vincula a estudios de fallos de fiabilidad y precisión factual.
- Sesgos conocidos: no documentados.
- Longitud de contexto no especificada; no se puede garantizar el manejo de conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el estado de "research candidate" y la ausencia de certificación desaconsejan su despliegue comercial sin validación adicional.
- Procedencia y linaje documentados, pero la cadena depende de artefactos internos de SZLHOLDINGS cuya disponibilidad pública no está garantizada.
- Con 2 descargas y 0 likes, la validación por parte de la comunidad es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/willay-r1-candidate
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de recibos de evaluación: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Pipeline szl-forge, launch contract #708: https://github.com/szl-holdings/szl-forge/pull/708
- Run WILLAY API en Featherless: https://featherless.ai/models/SZLHOLDINGS/WILLAY
- Adaptadores de SZLHOLDINGS/WILLAY en Hugging Face: https://huggingface.co/models?other=base_model%3Aadapter%3ASZLHOLDINGS%2FWILLAY
