# unslothai/Hy-MT3-30B-A3B-FP8

## Resumen

Hy-MT3-30B-A3B-FP8 es una distribucion cuantizada en FP8 del modelo de traduccion multilingue Hy-MT3-30B-A3B desarrollado por Tencent. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) con 30.064.725.984 parametros totales, empaquetado por el equipo de Unsloth en formato FP8 para reducir los requisitos de memoria durante la inferencia sin renunciar a la precision del modelo original.

El modelo esta especializado en traduccion automatica (pipeline `translation`) y su relevancia radica en que ofrece capacidades de traduccion multilingue de gran escala en un formato que puede ejecutarse en infraestructura mas modesta que la version en precision completa. La publicacion es reciente (noviembre de 2026) y esta pensada para desarrolladores que necesitan desplegar traduccion de calidad en produccion.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio incluye 7 shards de pesos en Safetensors, el indice de shards, el tokenizer y la configuracion de runtime, y puede ejecutarse tambien en Unsloth Desktop en entornos compatibles con FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer; familia `hy_v3` |
| Parametros totales | 30.064.725.984 (aproximadamente 30B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible (multilingue segun la model card, sin listado explicito) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7 shards + indice) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) sobre una base transformer, identificada en los tags como `hy_v3`. Con 30B parametros totales, la naturaleza MoE implica que solo un subconjunto de expertos se activa por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamano. No se dispone de informacion detallada sobre el numero de parametros activos, el numero de expertos ni la estrategia de enrutamiento en la informacion proporcionada.

Tampoco se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card remite a la release original de Tencent para obtener detalles sobre idiomas soportados, ejemplos de prompt y ajustes de inferencia, pero esos datos no estan incluidos en el material consultado.

## Capacidades

- Traduccion automatica multilingue: capacidad principal del modelo, segun el pipeline `translation`.
- Generacion de texto: el tag `text-generation` indica que el modelo puede emplearse para tareas generativas generales ademas de traduccion.
- Soporte multilingue: la model card describe el modelo como multilingue, aunque no se detalla el listado de idiomas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de inferencia gestionada.
- Ejecucion en FP8: permite inferencia con menor huella de memoria en hardware compatible.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales, guias y referencias de API manteniendo terminologia especializada, gracias a su especializacion en traduccion y su escala de 30B parametros.
- Localizacion de productos software: integrado en pipelines de CI/CD para traducir cadenas de interfaz y ficheros de recursos de forma automatizada antes de cada release.
- Atencion al cliente multilingue: traduccion en tiempo real de conversaciones entre agentes y clientes que hablan idiomas distintos, desplegado detras de un endpoint compatible.
- Traduccion de contenido editorial y marketing: procesamiento por lotes de articulos y materiales promocionales hacia multiples idiomas de destino.
- Subtitulado y transcripcion traducida: traduccion de transcripciones o subtitulos generados por sistemas de reconocimiento de voz, aprovechando la capacidad de generacion de texto.
- Investigacion en traduccion automatica: modelo de referencia para comparar tecnicas de cuantizacion FP8 frente a la version en precision completa, al estar disponible en ambos formatos.
- Procesamiento de correspondencia legal o administrativa: traduccion asistida de documentos con revisión humana posterior, dado el volumen de parametros y la calidad esperada de un modelo especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos FP8 y 30B parametros, los pesos ocupan aproximadamente 30 GB; se recomienda al menos 32-40 GB de VRAM para inferencia con margen para cache KV y overhead.
- GPU recomendadas: NVIDIA H100, A100 80GB, L40S o GPUs con soporte nativo de FP8 (arquitecturas Hopper y Ada Lovelace en adelante).
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en FP8 sin tecnicas adicionales de offloading; requeriria cuantizaciones de menor precision no incluidas en este repositorio.
- Opciones de despliegue: transformers (libreria indicada), Unsloth Desktop en entornos compatibles con FP8, y servidores de inferencia con soporte FP8 (vLLM o TGI, aunque no se confirma compatibilidad explicita en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-FP8 (este) | 30B (MoE) | no disponible | Apache 2.0 | Safetensors FP8 | Distribucion cuantizada por Unsloth |
| tencent/Hy-MT3-30B-A3B | 30B (MoE) | no disponible | Apache 2.0 | Safetensors | Modelo base original en precision completa |
| tencent/Hy-MT3-30B-A3B-FP8 | 30B (MoE) | no disponible | Apache 2.0 | Safetensors FP8 | Release FP8 oficial de Tencent |

No se dispone de informacion sobre modelos de traduccion alternativos comparables en la documentacion proporcionada; los unicos terminos de comparacion son las variantes del propio modelo Hy-MT3.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos; en traduccion puede manifestarse como adiciones, omisiones o reinterpretaciones del texto fuente, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni el listado completo de idiomas soportados; es necesario consultar la release original de Tencent antes de desplegar en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar el fichero LICENSE.txt del repositorio.
- FP8 requiere hardware compatible: en GPUs sin soporte nativo de FP8 la inferencia puede degradarse o no ser viable.
- Repositorio sin adopcion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion comunitaria.
- Mantener todos los shards y el indice juntos: la model card advierte explicitamente de que deben conservarse todos los ficheros de pesos y el indice para que el modelo funcione.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unslothai/Hy-MT3-30B-A3B-FP8
- Release FP8 original de Tencent: https://huggingface.co/tencent/Hy-MT3-30B-A3B-FP8
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Unsloth: https://unsloth.ai/
