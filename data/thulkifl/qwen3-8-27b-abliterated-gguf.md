# Thulkifl/Qwen3.8-27B-abliterated-GGUF

## Resumen

`Thulkifl/Qwen3.8-27B-abliterated-GGUF` es una distribución en formato GGUF del modelo Qwen3.8-27B sometido a “abliteration”, una técnica que elimina de los pesos la dirección de rechazo. El modelo original lo desarrolla Qwen Team; la model card atribuye la abliteración y la cuantización a douyamv, mientras que el repositorio lo publica Thulkifl. Con 27,78 mil millones de parámetros, arquitectura híbrida Gated DeltaNet + Gated Attention y 262.144 tokens de contexto, está pensado para inferencia local y para experimentación sobre alineación y filtros de seguridad.

La relevancia de esta ficha está en que ofrece una variante sin salvaguardas de rechazo, cuantizada de Q2_K a Q8_0, compatible con llama.cpp, Ollama y LM Studio. No se han publicado benchmarks ni detalles de entrenamiento en la información disponible, por lo que su calidad tras la abliteración y la cuantización no está cuantificada. La licencia declarada es Apache-2.0 y los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention (no MoE) |
| Parámetros totales | 27,78 mil millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens; extensible a 1M+ según la model card |
| Tipos de cuantización | Q8_0 (~28 GB), Q6_K (~21 GB), Q5_K_M (~19 GB), Q4_K_M (~16 GB), Q3_K_M (~13 GB), Q2_K (~7,9 GB) |
| Idiomas soportados | Inglés (en) y chino (zh); no se declara español |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; el modelo base se distribuye en safetensors BF16 y FP8 según los repositorios relacionados |

## Arquitectura y entrenamiento

La arquitectura declarada es híbrida: combina capas Gated DeltaNet con Gated Attention. La model card no detalla el número exacto de capas, la proporción entre ambos tipos, la dimensión oculta ni el vocabulario. Tampoco indica el volumen de
