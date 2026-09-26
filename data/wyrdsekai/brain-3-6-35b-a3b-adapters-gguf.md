# wyrdsekai/brain-3.6-35b-a3b-adapters-gguf

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA en formato GGUF para el modelo base Qwen3.6-35B-A3B, concretamente la variante publicada por Unsloth. Los adaptadores han sido entrenados por el usuario wyrdsekai (proyecto "Wyrdsekai") para un perfil de servicio concreto denominado `single-sparse`, pensado para un nodo de inferencia que sirve un unico modelo y varios adaptadores superpuestos. El objetivo declarado es dotar al modelo base de tres comportamientos diferenciados: una "base de especie" (registro en el que el modelo habla como si mismo), un adaptador de estilo elevado por un dial de registro, y un adaptador de "honestidad" orientado a turnos de trabajo y llamadas a herramientas.

Los tres ficheros son LoRA de rango 16 (`rank-16 spine LoRAs`): `wyrdsekai-3.6-35b-a3b-species-floor-v1-f16.gguf`, `wyrdsekai-3.6-35b-a3b-styled-v1-f16.gguf` y `wyrdsekai-3.6-35b-a3b-honesty-lora-v1-f16.gguf`. Segun la model card, los dos primeros se entrenaron el 25 de septiembre de 2026 y el tercero el 21 de septiembre de 2026. El repositorio declara licencia Apache 2.0 y no registra descargas ni valoraciones en el momento de la consulta.

La relevancia de este artefacto es acotada: no es un modelo nuevo, sino un ejemplo de despliegue de multiples LoRA sobre un modelo MoE cuantizado a GGUF para gestionar comportamientos distintos dentro de la misma instancia de inferencia. Resulta util como referencia de patron de serving, no como modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el modelo base; el repositorio contiene unicamente adaptadores LoRA. La nomenclatura "A3B" del modelo base sugiere arquitectura MoE, sin confirmar |
| Parametros totales | 6.389.760 parametros en los pesos del repositorio (adaptadores LoRA, segun safetensors). El modelo base Qwen3.6-35B-A3B declara 35B en su nomenclatura |
| Parametros activos | no disponible de forma confirmada; la nomenclatura "A3B" indica 3B activos en el modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | adaptadores en F16 (GGUF); el modelo base se menciona junto a `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptadores LoRA); safetensors referenciado en los metadatos de parametros |

## Arquitectura y entrenamiento

El repositorio contiene tres adaptadores LoRA de rango 16, no un modelo entrenado desde cero. La model card describe un esquema de "spine" con tres ranuras de carga (`species.gguf`, `styled.gguf` y `work.gguf`) que se superponen sobre el modelo base GGUF. El adaptador de "especie" incorpora los conjuntos de entrenamiento propios de las variantes de 9B y 4B del autor, reescritos en un registro llano, junto con un conjunto de "honestidad" y los comportamientos etiquetados como V8. El adaptador de estilo se activa por turno segun un "dial de registro" derivado del estado del sistema (valor por defecto de top 0.5). El adaptador de honestidad se orienta a turnos de trabajo con llamadas a herramientas y se situa en la ranura 0 en nodos que no cargan la base de especie.

No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset original del modelo base, ni sobre si hubo etapas de RLHF o DPO. Tampoco se detalla el metodo de ajuste (por ejemplo, si se uso QLoRA sobre GGUF, o entrenamiento en precision completa y posterior conversion). Las fechas indicadas son el unico dato temporal disponible. La innovacion tecnica destacable, mas de despliegue que de modelado, es la carga ordenada de multiples LoRA por ranura con pesos configurables por turno, lo que permite alternar entre registro conversacional y modo herramienta sin reiniciar el modelo.

## Capacidades

- Generacion de texto en dos registros diferenciados: conversacional (adaptador de especie mas estilo) y funcional (adaptador de honestidad).
- Soporte declarado de llamadas a herramientas (tool calling) a traves del adaptador de honestidad, activo en turnos de trabajo.
- Alternancia en tiempo de ejecucion entre comportamiento conversacional y comportamiento de trabajo mediante control de pesos por turno.
- Compatible con el pipeline de serving `single-sparse` de Wyrdsekai, que carga varios adaptadores sobre una misma instancia.
- Capacidades concretas del modelo base (razonamiento, codigo, matematicas, vision o multilingue) no disponibles en la informacion proporcionada.
- No se documenta modo de pensamiento explicito, vision, audio ni otras capacidades especiales.

## Casos de uso

- Personajes conversacionales persistentes: el adaptador de especie mas el de estilo permiten mantener una voz coherente y un registro controlable por turno, util en asistentes con personalidad definida.
- Copiloto de desarrollo con dos modos: el adaptador de honestidad puede activarse durante generacion de codigo y llamadas a herramientas, y desactivarse al volver a conversacion.
- Atencion al cliente automatizada: la alternancia entre registro conversacional y modo herramienta permite gestionar consultas y, en el mismo hilo, ejecutar acciones sobre sistemas internos.
- Agentes multi-paso: el adaptador de trabajo esta pensado para turnos con tool calls, lo que encaja en flujos de agente que encadenan llamadas a funciones.
- Experimentacion con serving multi-LoRA: sirve como caso de estudio para validar la carga ordenada de adaptadores en una sola instancia GGUF con llama.cpp u otros motores compatibles.
- Investigacion sobre control de estilo: el "dial de registro" con top 0.5 por defecto permite estudiar como varia la salida al modular el peso del adaptador de estilo.
- Despliegue en nodos con recursos limitados: al ser LoRA sobre un modelo MoE cuantizado, el coste adicional de almacenamiento y de memoria es reducido frente a servir varios modelos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con los modelos base o con adaptadores alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 35B en cuantizacion Q4_K_M suele ocupar en torno a 20 GB de pesos, a lo que hay que sumar la cache KV segun la longitud de contexto efectiva; los adaptadores LoRA anaden una sobrecarga pequena. Estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, un despliegue comodo requeriria GPU de 24 GB o superiores (RTX 4090, L40S, A100 40/80 GB, H100).
- Cabe en GPU de consumo: no confirmado. Depende del modelo base y del contexto; con Q4_K_M podria caber en GPU de 24 GB ajustando contexto, pero el autor no lo documenta.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requieren comprobar soporte de carga de multiples LoRA en GGUF. El autor menciona su propio perfil `single-sparse` y el comando `wyrd brain setup`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wyrdsekai/brain-3.6-35b-a3b-adapters-gguf | ~6,4M en adaptadores LoRA (base 35B, ~3B activos) | no disponible | sin benchmarks publicados | apache-2.0 | HuggingFace |
| Adaptadores LoRA genericos para Qwen3-30B-A3B | variable | depende del modelo base | variable | variable | HuggingFace |
| Modelo base Qwen3.6-35B-A3B (Unsloth, GGUF) | 35B (~3B activos) | no disponible | no disponible | segun el modelo base | HuggingFace |

No se dispone de datos suficientes para una comparativa cuantitativa fiable. La comparacion con otros conjuntos de adaptadores LoRA del mismo modelo base no es posible sin conocer los benchmarks ni la composicion exacta de los datasets de entrenamiento.

## Limitaciones y advertencias

- El repositorio contiene adaptadores LoRA, no un modelo autonomo: sin el modelo base no es utilizable.
- No se documentan sesgos conocidos, composicion del dataset ni procesos de alineacion, por lo que el riesgo de sesgo es indeterminado.
- Riesgo de alucinacion: no evaluado; el autor no publica metricas de fidelidad ni de tasas de error.
- La model card emplea un registro antropomorfico ("she speaks as herself") que dificulta interpretar de forma tecnica los criterios de activacion de cada adaptador.
- No se especifican idiomas soportados, longitud de contexto ni limites de uso.
- El flujo de despliegue documentado depende de la herramienta propietaria `wyrd` y de un indice de versiones (`models-index.json`), lo que ata el uso a la infraestructura del autor.
- Licencia Apache 2.0 declarada, en principio permisiva para uso comercial, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 valoraciones: sin validacion externa ni comunidad que respalde su calidad.
- Fechas de creacion y actualizacion muy proximas (2026-09-26) y ausencia de historial de versiones en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wyrdsekai/brain-3.6-35b-a3b-adapters-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Repositorio Wyrdsekai y documento `docs/public/CONFIGURATION.md`: referenciados en la model card, URL no disponible en la informacion proporcionada.
