# y0uq/Ternary-Bonsai-2-27B-Q2_0-MTP

## Resumen

Ternary Bonsai 2 27B Q2_0 MTP es una cuantizacion GGUF del modelo Ternary Bonsai 2 27B, un transformer denso de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) publicado por el usuario y0uq en Hugging Face. El modelo parte de la version GGUF de prism-ml y le injerta la cabeza MTP (multi-token prediction) de Qwen3.8-27B, siguiendo el procedimiento publicado por decent-jawfish. Los pesos originales del modelo base no se modifican: la operacion anade un modulo de prediccion multi-token que permite decodificacion especulativa.

La particularidad tecnica de esta version es que emplea tensores Q2_0 estandar en lugar del formato PQ2_0 de la publicacion de decent-jawfish, lo que facilita su ejecucion con llama.cpp upstream sin necesidad de parches. El repositorio ocupa 8,0 GB, coherente con una cuantizacion de 2 bits sobre un modelo de 27B parametros, y se distribuye bajo licencia Apache 2.0.

Es relevante para desarrolladores que quieran probar decodificacion especulativa con MTP en hardware modesto: la cuantizacion Q2_0 reduce drasticamente los requisitos de memoria y la cabeza MTP permite acelerar la generacion activando `--spec-type draft-mtp --spec-draft-n-max 2` en llama.cpp. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, idiomas soportados ni detalles sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cabeza MTP (multi-token prediction) injertada; formato GGUF para llama.cpp |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_0 (2 bits); el modelo base dispone de otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2 27B, un transformer denso de 27,3B parametros del que no se dispone de detalles publicados sobre composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La denominacion "Ternary" sugiere pesos ternarios en el modelo original, aunque la model card no lo confirma explicitamente.

Sobre esa base, esta version injerta la cabeza MTP de Qwen3.8-27B siguiendo el script de decent-jawfish. La MTP es un modulo que predice varios tokens futuros a la vez y se usa como borrador en decodificacion especulativa: llama.cpp lo activa con `--spec-type draft-mtp --spec-draft-n-max 2`, de modo que el modelo propone tokens candidatos que luego se verifican. La innovacion respecto a la release de decent-jawfish es el uso de tensores Q2_0 estandar en lugar de PQ2_0, lo que elimina la necesidad de parches en llama.cpp upstream. Los pesos del modelo original permanecen inalterados.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Decodificacion especulativa mediante cabeza MTP, con verificacion de tokens candidatos en llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servir el modelo mediante infraestructura de inferencia estandar.
- Ejecucion en llama.cpp upstream sin parches.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni agentes en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado local de decodificacion especulativa: sirve para evaluar el impacto de la MTP en latencia y throughput dentro de llama.cpp con `--spec-type draft-mtp`, sin necesidad de aplicar parches al runtime.
- Despliegue en hardware de gama consumer: con 8,0 GB de repositorio en Q2_0, el modelo cabe en GPUs con 8-12 GB de VRAM, lo que permite experimentar con un modelo de 27B en equipos de escritorio.
- Investigacion sobre cuantizacion agresiva: util para medir la degradacion de calidad de Q2_0 frente a cuantizaciones mayores del mismo modelo base y comparar con el formato PQ2_0.
- Generacion de texto conversacional en entornos con memoria limitada: el pipeline `text-generation` y el tag `conversational` permiten integrarlo en chatbots de prueba o asistentes locales.
- Servicio mediante endpoints compatibles: al estar marcado como `endpoints_compatible`, puede desplegarse en plataformas de inferencia que acepten GGUF y llama.cpp.
- Reproducibilidad de injertos MTP: el repositorio documenta el procedimiento de decent-jawfish, por lo que sirve como referencia para replicar el injerto de cabezas MTP en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 8,0 GB en Q2_0; la inferencia requiere aproximadamente esa cifra mas overhead de contexto y cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, encaja en GPUs consumer con 8-12 GB de VRAM y en cualquier GPU de datacenter (A100, H100) con holgura.
- Cabe en GPU consumer: si, en modelos con al menos 8-12 GB de VRAM, aunque el dato exacto no esta confirmado por el autor.
- Opciones de despliegue: llama.cpp (soporte upstream confirmado); otras opciones como vLLM, Ollama o TGI no estan documentadas para este repositorio.
- Latencia y throughput: no disponibles; la MTP esta pensada para acelerar la generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B Q2_0 MTP (este) | 27,3B | No disponible | Q2_0 + MTP | Apache 2.0 | GGUF para llama.cpp upstream, 8,0 GB |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27,3B (base) | No disponible | GGUF (varias) | No disponible | Modelo base sin cabeza MTP |
| decent-jawfish/bonsai-2-27b-mtp | 27,3B (base) | No disponible | PQ2_0 + MTP | No disponible | Requiere parches en llama.cpp |
| unsloth/Qwen3.8-27B-GGUF | 27B (aproximado) | No disponible | GGUF (varias) | No disponible | Origen de la cabeza MTP injertada |

## Limitaciones y advertencias

- La cuantizacion Q2_0 es muy agresiva (2 bits) y previsiblemente degrada la calidad respecto al modelo base; no se publican evaluaciones que cuantifiquen esa perdida.
- No hay informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion no evaluado: no se han publicado benchmarks ni evaluaciones de fidelidad.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- El injerto MTP anade complejidad: requiere flags especificos en llama.cpp y no se documenta su comportamiento con otras configuraciones de decodificacion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base prism-ml y de la cabeza MTP de Qwen3.8 antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/y0uq/Ternary-Bonsai-2-27B-Q2_0-MTP
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Origen de la cabeza MTP: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Script e instrucciones del injerto MTP: https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
