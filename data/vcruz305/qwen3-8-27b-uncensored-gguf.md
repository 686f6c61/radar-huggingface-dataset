# vcruz305/Qwen3.8-27B-Uncensored-GGUF

## Resumen

El modelo `vcruz305/Qwen3.8-27B-Uncensored-GGUF` es una cuantización GGUF en formato K-quants del checkpoint `orcarouter/Qwen3.8-27B-Uncensored-FP8`, que a su vez es una versión "abliterated" (con la dirección de rechazo eliminada) del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. Este pack no es oficial de Qwen, sino un trabajo de la comunidad orientado a ofrecer un trunk de 27B sin filtros de seguridad para uso local en investigación, red-team y generación sin restricciones en entornos controlados.

La arquitectura subyacente es un modelo denso de 27B parámetros con atención híbrida (Gated DeltaNet, identificada como `qwen35`), con 64 bloques de trunk de lenguaje, dimensión oculta 5120 y FFN de 17408. Soporta un contexto nativo de 262 144 tokens. Esta versión GGUF omite el módulo MTP (multi-token prediction) para reducir el uso de memoria en tarjetas de 12-24 GB, y no incluye torre de visión.

La relevancia de este modelo radica en que permite ejecutar localmente un LLM de 27B sin alineamiento de seguridad, algo útil para análisis de sesgos, pruebas de robustez o generación creativa sin censura, siempre bajo la responsabilidad del usuario. Al ser Apache-2.0, se puede usar comercialmente con las restricciones habituales de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention (Gated DeltaNet, `qwen35`) |
| Parametros totales | 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (K-quants) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura densa con atención híbrida Gated DeltaNet, que combina mecanismos de atención clásicos con capas de estado lineal para mejorar la eficiencia en contextos largos. El checkpoint `orcarouter/Qwen3.8-27B-Uncensored-FP8` se obtuvo mediante abliteration, una técnica que elimina la dirección de rechazo aprendida durante el alineamiento de seguridad, de modo que el modelo responde a solicitudes que la versión oficial rechazaría. Posteriormente, `vcruz305` lo cuantizó a GGUF K-quants usando `convert_hf_to_gguf.py --outtype f16 --no-mtp` y `llama-quantize`.

No se dispone de información detallada sobre el dataset de entrenamiento original, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El pack GGUF omite el módulo MTP para reducir el consumo de memoria en GPUs de 12-24 GB, y no incluye torre de visión.

## Capacidades

- Generacion de texto sin filtros de seguridad: el modelo responde a solicitudes que la version oficial rechazaria, gracias a la abliteration.
- Soporte de contexto largo: 262 144 tokens nativos, adecuado para documentos extensos o conversaciones multi-turno.
- Multilingue: soporta ingles y chino.
- Solo lenguaje: no incluye torre de vision ni capacidades multimodales.
- Compatible con llama.cpp: requiere una version reciente con soporte para `qwen35` (Gated DeltaNet).
- Plantilla de chat fija: el pack incluye una plantilla jinja corregida para evitar el truncamiento de conversaciones multi-turno que ocurre con la plantilla oficial de Qwen 3.8.

## Casos de uso

- Investigacion en seguridad y red-team: el modelo permite probar tecnicas de jailbreak, evaluar la robustez de sistemas de moderacion o estudiar el comportamiento de un LLM sin alineamiento en entornos controlados.
- Analisis de sesgos y alucinaciones: al eliminar la direccion de rechazo, se pueden estudiar los sesgos subyacentes del modelo base Qwen3.8-27B sin la interferencia de filtros de seguridad.
- Generacion creativa sin restricciones: escritura de ficcion, poesia o guiones que requieran contenido que un modelo alineado rechazaria, siempre dentro del marco legal y etico.
- Pruebas de robustez de pipelines de IA: evaluar como se comporta un modelo sin filtros cuando se integra en sistemas de generacion automatizada, para disenar salvaguardas propias.
- Experimentacion academica en etica de IA: estudiar el impacto de la abliteration en la calidad de las respuestas y en la coherencia del modelo.
- Desarrollo de filtros y moderadores: utilizar el modelo como generador de contenido "problematico" para entrenar o evaluar clasificadores de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion:
  - Q2_K: ~12 GB
  - Q3_K_M: ~16 GB
  - Q4_K_M: ~24 GB (recomendado por defecto)
  - Q5_K_M: ~24 GB (comodo)
  - Q6_K: ~24 GB (el mayor que hace full-offload en GPUs Turing de 24 GB)
  - Q8_0: ~32 GB o mas (no cabe en 24 GB con `-ngl 99`)
- GPUs recomendadas:
  - Q4_K_M, Q5_K_M, Q6_K: RTX 3090, RTX 4090, A5000 (24 GB)
  - Q8_0: A100 40 GB, H100 80 GB
- Despliegue: llama.cpp (`llama-server`), compatible con `--jinja` y `--reasoning-format deepseek`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 27B | 262 144 | Apache-2.0 | HuggingFace |
| vcruz305/Qwen3.8-27B-GGUF (trunk oficial BF16) | 27B | 262 144 | Apache-2.0 | HuggingFace |
| vcruz305/Qwen3.8-27B-Uncensored-GGUF (este) | 27B | 262 144 | Apache-2.0 | HuggingFace |

La diferencia principal es que este pack elimina el alineamiento de seguridad y omite el MTP, mientras que los otros dos conservan el comportamiento oficial. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El alineamiento de seguridad fue eliminado en el checkpoint fuente: el modelo respondera a solicitudes que la version oficial rechazaria, lo que puede generar contenido inapropiado, ofensivo o peligroso.
- Conserva los sesgos y modos de fallo del modelo base Qwen3.8-27B, ademas del error introducido por la cuantizacion K-quant.
- Solo lenguaje: no incluye torre de vision ni capacidades multimodales.
- El modulo MTP esta omitido, lo que puede afectar la velocidad de decodificacion especulativa.
- No es apto para despliegue a usuarios finales sin filtros adicionales implementados por el desarrollador.
- Cualquier uso debe cumplir con la licencia Apache-2.0 y la legislacion aplicable.
- No se han publicado benchmarks especificos para esta version cuantizada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vcruz305/Qwen3.8-27B-Uncensored-GGUF
- Checkpoint FP8 abliterated: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Pack GGUF del trunk oficial BF16: https://huggingface.co/vcruz305/Qwen3.8-27B-GGUF
