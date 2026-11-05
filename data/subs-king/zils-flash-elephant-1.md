# subs-king/zils-flash-elephant-1

## Resumen

Zils d3-flash soup body: elephant-1 es un reempaquetado del modelo base `baselabs/elephant-1`, publicado por el usuario `subs-king` en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos nuevos: la model card indica explícitamente que los pesos de lenguaje son los del modelo original, sin cambios, y que las únicas modificaciones son de nombres de tensores y disposición de shards para adaptarlos al formato "soup body" del subred Zils (Bittensor SN127), pool `d3-flash`.

El modelo cuenta con 8.392.695.024 parámetros en formato safetensors (aproximadamente 8,4 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio, comparable en orden de magnitud a Llama 3 8B o Qwen2.5 7B. El repositorio ocupa 16,8 GB. La licencia declarada es MIT, heredada del modelo base.

La relevancia de esta ficha es limitada y conviene ser transparente: se trata de un artefacto de infraestructura para un subred de Bittensor, no de una versión mejorada del modelo original. Cualquier evaluación de capacidades debe remitirse a `baselabs/elephant-1`, ya que este repositorio no aporta mejoras de rendimiento ni datos de entrenamiento adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de baselabs/elephant-1; no especificada en la informacion proporcionada) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `baselabs/elephant-1` en los datos proporcionados. El repositorio no incluye documentacion tecnica sobre el tipo de transformer, el esquema de atencion, la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico verificable es que este repositorio concreto no entrena ni modifica los pesos: la model card afirma que "the language weights are the original model's, unchanged" y que los cambios se limitan a nombres de tensores y layout de shards. Ademas, se excluyen los tensores `lm_head` y `mtp`, lo que implica que este artefacto no es directamente utilizable para inferencia de lenguaje sin reconstruir esas capas desde el modelo original.

## Capacidades

- No se documentan capacidades especificas en la informacion proporcionada.
- Al conservar los pesos de lenguaje de `baselabs/elephant-1`, las capacidades teoricas serian las del modelo base, pero no se detallan en la model card de este repositorio.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma capacidad multilingue ni cobertura de idiomas.
- No se confirman modos especiales (thinking mode, vision, audio).
- La ausencia de `lm_head` y `mtp` limita el uso directo: el artefacto esta pensado como "soup body" para el pipeline de Zils, no como modelo listo para generar texto.

## Casos de uso

- Integracion en el subred Zils (Bittensor SN127): el proposito declarado del repositorio es servir como cuerpo de pesos para el pool `d3-flash` de dicha subred, de modo que los nodos participantes puedan cargar los tensores con el layout esperado.
- Reempaquetado y redistribucion de pesos: util para equipos que necesiten una copia con nombres de tensores normalizados y shards reorganizados, manteniendo la licencia MIT del original.
- Experimentacion con pipelines de Bittensor: permite probar el flujo de carga de "soup body" sin depender de conversiones manuales desde el modelo base.
- Base para reconstruccion completa: combinando estos tensores con `lm_head` y `mtp` del modelo original se podria recuperar un modelo funcional, util en entornos donde se separa el cuerpo de la cabeza.
- Auditoria de artefactos de subredes: sirve para estudiar como se publican y versionan pesos en subredes de Bittensor y que metadatos acompanan a cada revision.
- Referencia para conversiones de formato: el cambio de shard layout documentado puede tomarse como ejemplo de adaptacion de safetensors entre esquemas de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 16,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 20-24 GB como minimo.
- Cuantizacion a 8 bits: en torno a 8,4 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: en torno a 4,2 GB de pesos, viable en GPUs consumer de 8 GB o superiores.
- GPUs recomendadas para FP16: A100 40GB, H100, L40S, RTX 4090 (24 GB, justo al limite).
- GPUs consumer: RTX 4090, RTX 3090, RTX 4080 en cuantizacion; RTX 3060 12 GB o similar en 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan un modelo completo con `lm_head`; este repositorio, tal cual, no es cargable por esos motores sin reconstruir las capas ausentes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils d3-flash soup body: elephant-1 | 8,39 B | no disponible | MIT | HuggingFace | Reempaquetado, sin `lm_head`/`mtp` |
| baselabs/elephant-1 | no disponible | no disponible | no disponible | HuggingFace | Modelo base original |
| Llama 3 8B | 8,03 B | 8.192 tokens | Llama 3 Community | Meta / HuggingFace | Referencia de tamano, licencia restrictiva |
| Qwen2.5 7B | 7,62 B | 32.768 tokens | Apache 2.0 | HuggingFace | Alternativa abierta de tamano similar |

La comparativa con Llama 3 8B y Qwen2.5 7B es solo orientativa por orden de magnitud: no se dispone de datos de contexto, rendimiento ni arquitectura del modelo base para establecer una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- El repositorio no incluye `lm_head` ni `mtp`, por lo que no es un modelo autónomo listo para inferencia de lenguaje.
- No hay datos publicados sobre sesgos, alucinacion o comportamiento del modelo base en produccion.
- La longitud de contexto y los idiomas soportados se desconocen, lo que impide garantizar su idoneidad en aplicaciones multilingues o de contexto largo.
- La licencia MIT se hereda del modelo base, pero conviene verificar los ficheros de licencia originales incluidos en el repositorio antes de un uso comercial.
- El modelo no aporta mejoras sobre `baselabs/elephant-1`: cualquier evaluacion de calidad debe hacerse contra el original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni validacion externa.
- La fecha de creacion indicada (2026-11-04) es futura respecto a la mayoria de referencias habituales; conviene confirmar la vigencia del artefacto antes de integrarlo.
- Uso ligado a Bittensor SN127: fuera de ese contexto, el formato "soup body" puede no ser compatible con los motores de inferencia estandar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/subs-king/zils-flash-elephant-1
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Revision del modelo base referenciada: `b3f8a93462fb1051a9de031e94a7ff380e254072`
