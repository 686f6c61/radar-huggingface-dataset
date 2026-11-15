# StillDeadcode/flint-iq8r

## Resumen

Flint IQ8R es una conversión cuantizada del modelo base RecursiveSI/flint, publicada por el usuario StillDeadcode para el motor de inferencia radiance (versión 2.1.0 o superior). No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: un fichero `flint-iq8r.rad` de 37,9 GiB que empaqueta los pesos del modelo original en un formato int8 optimizado para ejecución en GPUs de consumo profesional. La relevancia de esta publicación es principalmente práctica: permite probar un modelo de gran tamaño (la presencia de 256 expertos enrutados por capa y una proyección `lm_head` separada sugiere una arquitectura Mixture-of-Experts de escala considerable) en hardware de gama alta pero no de centro de datos.

La cuantización aplicada es de tipo IQ8R, una variante de 8 bits con rotación Walsh-Hadamard previa al redondeo, escalas compartidas por bloques de columnas y búsqueda de escala sin datos de calibración. El autor la describe explícitamente como una "conversión rápida" orientada a evaluar el modelo, no como una cuantización de producción validada con métricas de divergencia.

No se dispone de información sobre el número total de parámetros, la longitud de contexto nativa, los idiomas soportados ni los datos de entrenamiento del modelo base, más allá de lo que se deduce del proceso de conversión. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): 256 expertos enrutados por capa más un experto compartido; proyecciones de atención, dos capas densas y `lm_head` diferenciadas |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura MoE confirmada, ratio de activación no indicado) |
| Longitud de contexto | no disponible (el autor verifica recuperación de una cadena en un prompt de 4,5k tokens, sin especificar el máximo) |
| Tipos de cuantización | IQ8R (int8 con rotación Walsh-Hadamard y escalas bf16 por bloques); KV cache en int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), 37,9 GiB |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint emplea una arquitectura transformer con mezcla de expertos: cada capa contiene 256 expertos enrutados más un experto compartido, con un router que decide la asignación por token. La conversión IQ8R preserva esta estructura y aplica un esquema de cuantización diferenciado por componente: las proyecciones de atención, las dos capas densas y las compuertas `gate`/`up` del experto compartido se almacenan como códigos int8 con una escala u8 por cada bloque de 256 columnas y una escala bf16 por fila, aplicando previamente una rotación Walsh-Hadamard sobre bloques de 128 columnas. Los 256 expertos enrutados de cada capa y la proyección `down` del experto compartido usan int8 sobre la misma rejilla rotada, con una escala bf16 por bloque de 128 columnas. El `lm_head` se cuantiza como int8 simple con escala bf16 por bloque de 128 columnas. El router, las normas, los sumideros de atención (*attention sinks*) y el embedding se mantienen en bf16.

La conversión se realizó con la herramienta `rad-convert` del motor radiance, aplicando un fichero de sesgo cero (`flint-zero-bias.safetensors`), una receta (`flint-iq8r.recipe`) y una plantilla de chat (`flint-chat-template.jinja`). No se emplearon datos de calibración: el proceso es un redondeo al más cercano con búsqueda de escala. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto autoregresiva en modo chat, con plantilla de conversación incluida en la conversión.
- Razonamiento factual básico: el autor verifica respuestas correctas a preguntas cortas de tipo factual.
- Generación de código: se valida con prompts de programación cortos.
- Recuperación en contexto largo: localiza una cadena oculta en un prompt de 4,5k tokens.
- Arquitectura MoE con enrutamiento por token, lo que en teoría permite activar solo un subconjunto de expertos por paso (el ratio exacto no está documentado).
- Soporte de tool calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de modelos MoE de gran escala en hardware de gama alta: el fichero de 37,9 GiB con `tp: 2` y KV cache int8 cabe en dos GPUs de 32 GB, lo que permite probar el modelo base sin infraestructura de centro de datos.
- Despliegue en estaciones de trabajo con dos Radeon AI PRO R9700: configuración validada por el autor con `tp: 2` y `kv-cache-dtype: i8`, adecuada para prototipos y demos internas.
- Asistencia de código en entornos con presupuesto de VRAM limitado: el modelo responde a prompts de programación cortos y puede integrarse en un servidor radiance local para autocompletado o revisión.
- Procesamiento de documentos con contexto medio (hasta ~4,5k tokens verificados): extracción de información o preguntas sobre contratos, informes o artículos que quepan en esa ventana.
- Chat de soporte técnico interno: conversaciones multi-turno con contexto moderado, siempre que el caso de uso tolere la ausencia de benchmarks de calidad publicados.
- Base para experimentación en cuantización: al ser una conversión IQ8R reproducible con `rad-convert`, sirve como referencia para comparar recetas de cuantización sobre el mismo modelo fuente.
- Pruebas de integración del motor radiance: el artefacto valida la carga de contenedores `.rad`, el paralelismo tensorial y el KV cache int8 en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se midió la divergencia KL frente al modelo en bf16 ni ningún benchmark estándar.

Los únicos datos de rendimiento aportados son de decodificación: 6,8 ms por paso para un único stream sin drafter, sobre dos Radeon AI PRO R9700 con `tp: 2` y KV cache int8.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 37,9 GiB; con KV cache int8 y overhead del runtime, se requieren al menos dos GPUs de 32 GB en `tp: 2` (configuración validada por el autor).
- GPUs recomendadas: dos Radeon AI PRO R9700 (32 GB cada una) es la configuración probada. No hay datos sobre otras GPUs.
- ¿Cabe en GPU de consumo? No en una sola tarjeta de consumo: 37,9 GiB de pesos superan los 24 GB de una RTX 4090. Se necesitan al menos dos GPUs, y la compatibilidad con CUDA no está documentada (el motor radiance se probó en ROCm/HIP con Radeon).
- Opciones de despliegue: exclusivamente el motor radiance (versión 2.1.0 o superior), mediante configuración YAML con `tp: 2` y `kv-cache-dtype: i8`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.rad` es propietario.
- Latencia y throughput: 6,8 ms por paso de decodificación para un stream sin drafter en la configuración de dos R9700. No se reporta throughput agregado ni latencia de prefill.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento del modelo base RecursiveSI/flint, ni de alternativas comparables de la misma categoría (MoE de gran escala), por lo que no es posible establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Flint IQ8R (esta ficha) | no disponible | no disponible | Apache-2.0 | `.rad` (radiance) | Hugging Face |
| RecursiveSI/flint (base) | no disponible | no disponible | Apache-2.0 | safetensors (presumible) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantización no validada: el autor la describe como "conversión rápida" sin datos de calibración y sin medir divergencia KL frente al modelo bf16; la degradación de calidad es desconocida.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica publicada, ni del modelo cuantizado ni del base en esta ficha.
- Ecosistema cerrado: el formato `.rad` solo funciona con el motor radiance, lo que limita la portabilidad y obliga a usar una herramienta concreta.
- Requisito de hardware elevado: 37,9 GiB de pesos exigen al menos dos GPUs de 32 GB; no cabe en una GPU de consumo individual.
- Contexto no documentado: solo se verifica recuperación en 4,5k tokens; se desconoce la ventana máxima real y el comportamiento más allá de esa longitud.
- Idiomas no documentados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks de fidelidad ni evaluación de sesgos, no puede cuantificarse.
- Sesgos: no disponible; no se ha publicado ninguna evaluación de sesgos del modelo base ni de la conversión.
- Licencia Apache-2.0: permite uso comercial, pero el autor incluye el fichero LICENSE del modelo fuente y no se detallan posibles restricciones adicionales del modelo base más allá de la licencia declarada.
- Fecha de creación futura (2026-11-15): el artefacto tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/flint-iq8r
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
