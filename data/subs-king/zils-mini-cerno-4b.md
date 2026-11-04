# subs-king/zils-mini-cerno-4b

## Resumen

Zils d3-mini soup body: Cerno 4B v1.2 es un reempaquetado del modelo apertixai/cerno-4b-v1.2 (revision `e14dec9894c5afb761f90926f1c19b19938a271c`) publicado por el usuario subs-king como "cuerpo" (soup body) para la subred Zils de Bittensor (SN127), en el pool `d3-mini`. No se trata de un modelo entrenado desde cero ni de un fine-tune: los pesos del lenguaje son los del modelo original, sin modificar, y el trabajo del autor se limita a renombrar tensores, reorganizar los shards y anadir una torre de vision.

El modelo cuenta con 4.539.265.536 parametros reales segun los safetensors del repositorio, que ocupa 9,1 GB. La torre de vision anadida procede de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), tambien sin cambios, y responde al requisito de layout del cuerpo Zils. El export original era solo de texto; esta version incorpora capacidad multimodal por construccion del formato, no por entrenamiento adicional.

La relevancia de esta ficha es acotada y conviene ser explicito: es un artefacto de infraestructura para un subnet de Bittensor, no un modelo generalista listo para produccion. Se distribuye bajo licencia Apache 2.0 heredada del modelo base, con cero descargas y cero likes en el momento de la consulta, y sin model card tecnica mas alla de la nota de reempaquetado. Cualquier evaluacion de capacidades debe remitirse al modelo original apertixai/cerno-4b-v1.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base apertixai/cerno-4b-v1.2; layout de cuerpo Zils con torre de vision) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB, shards reorganizados) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base en la documentacion disponible. El repositorio unicamente describe cambios de empaquetado: renombrado de tensores, nueva distribucion de shards y adicion de la torre de vision de Qwen/Qwen3.5-4B en la revision indicada. Los pesos del lenguaje son los originales de apertixai/cerno-4b-v1.2, sin modificacion alguna, y los tensores `lm_head`/`mtp` no estan incluidos en este export.

No se dispone de datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas del modelo base. Tampoco se documenta si la torre de vision ha sido integrada funcionalmente o solo colocada para satisfacer el layout exigido por el cuerpo Zils, lo que es un caveat importante: la presencia de pesos de vision no garantiza que el pipeline de inferencia del subnet los utilice de forma efectiva.

## Capacidades

- Generacion de texto: heredada del modelo base, sin cambios en los pesos del lenguaje.
- Capacidad multimodal: incluye la torre de vision de Qwen/Qwen3.5-4B, aunque no se documenta si esta operativa en inferencia o es solo parte del layout.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Integracion con Bittensor: el modelo esta formateado como cuerpo para la subred Zils (SN127), pool `d3-mini`.

## Casos de uso

- Participacion en la subred Zils (Bittensor SN127): el uso principal y documentado es servir como cuerpo (soup body) en el pool `d3-mini`, con el layout de tensores que el subnet espera. Es el escenario para el que el artefacto fue construido.
- Experimentacion con el modelo base Cerno 4B: al conservar los pesos del lenguaje intactos, sirve para probar apertixai/cerno-4b-v1.2 en un empaquetado alternativo, util si el formato original no encaja en el pipeline propio.
- Pruebas de integracion multimodal en pipelines Zils: permite validar como se comporta el layout con la torre de vision de Qwen3.5-4B anadida, antes de desplegar variantes propias.
- Investigacion sobre reempaquetado de modelos: caso de estudio de como se reorganizan shards y se renombran tensores para adaptar un transformer a un formato de subnet, sin reentrenar.
- Evaluacion comparativa de exportaciones: util para contrastar si el reempaquetado introduce diferencias numericas respecto al modelo base en tareas de texto.
- Base para futuros fine-tunes en el ecosistema Zils: al estar bajo Apache 2.0 y con pesos safetensors, puede servir de punto de partida para adaptaciones dentro del subnet, siempre que se respete la atribucion al autor original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parametros, en FP16 se requieren aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 4,5-5 GB y en 4 bits unos 2,5-3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: para FP16, GPU con 16-24 GB (RTX 4090, A10G, L4 de 24 GB); para cuantizacion 4/8 bits, GPU consumer de 8-12 GB podrian ser suficientes.
- Cabe en GPU consumer: si, previsiblemente en RTX 3090/4090 en FP16 y en tarjetas de 8-12 GB con cuantizacion, si bien no hay GGUF publicado y habria que generarlo.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama requeririan conversion previa a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles. El hecho de que no se incluyan `lm_head`/`mtp` puede complicar el despliegue directo con frameworks estandar y exigir el pipeline especifico del subnet Zils.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| subs-king/zils-mini-cerno-4b | 4.539 M | no disponible | Apache 2.0 | Reempaquetado para Zils SN127; sin benchmarks publicados |
| apertixai/cerno-4b-v1.2 | no disponible (base de 4B) | no disponible | no disponible | Modelo original; fuente de los pesos de lenguaje |
| Qwen/Qwen3.5-4B | no disponible (4B) | no disponible | no disponible | Fuente de la torre de vision anadida |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo entrenado: es un reempaquetado con cambios de nombres de tensores, shards y una torre de vision anadida; no debe esperarse ninguna mejora de capacidades respecto al base.
- Ausencia de `lm_head`/`mtp`: el export no incluye estos tensores, lo que puede impedir la carga directa en frameworks estandar y limitar su uso fuera del pipeline Zils.
- La torre de vision puede no estar funcional: no se documenta si esta integrada en el grafo de inferencia o solo presente para cumplir el layout.
- Sin model card tecnica: no hay informacion sobre contexto, idiomas, alineacion ni sesgos; cualquier evaluacion debe hacerse sobre el modelo base.
- Riesgo de alucinacion: no evaluado en este artefacto; se hereda el comportamiento del modelo base, del que no se publican datos.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Licencia: Apache 2.0 permite uso comercial, pero la atribucion a los autores originales (apertixai y Qwen) es obligatoria y debe conservarse.
- Fecha de creacion futura en los metadatos (2026-11-04), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/subs-king/zils-mini-cerno-4b
- Modelo base: https://huggingface.co/apertixai/cerno-4b-v1.2
- Revision del modelo base: `e14dec9894c5afb761f90926f1c19b19938a271c`
- Torre de vision (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Subred Zils (Bittensor SN127): no disponible en la informacion proporcionada.
