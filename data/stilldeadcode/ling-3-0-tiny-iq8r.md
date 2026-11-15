# StillDeadcode/ling-3.0-tiny-iq8r

## Resumen

Ling-3.0-tiny-iq8r es una conversión cuantizada del modelo inclusionAI/Ling-3.0-tiny, publicada por el desarrollador independiente StillDeadcode para su motor de inferencia radiance (versión 2.1.0 o superior). No se trata de un modelo nuevo ni de un ajuste fino, sino de una redistribución de los pesos del modelo base en un formato propietario (`.rad`) con cuantización int8 mixta, pensada para ejecutarse en GPUs AMD Radeon mediante dicho motor. El repositorio ocupa 8,5 GB y el artefacto principal `ling-3.0-tiny-iq8r.rad` pesa 7,9 GiB.

El modelo base, Ling-3.0-tiny de inclusionAI, es un transformer con mezcla de expertos (MoE) que combina atención latente con proyecciones KDA (Kimi Delta Attention), según se deduce de la descripción de las capas cuantizadas en la model card. La conversión mantiene en bf16 los componentes sensibles (router, embeddings, lm_head, convoluciones, proyecciones de baja dimensión) y cuantiza a int8 el tronco principal y los 128 expertos enrutados de cada capa.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a usuarios del motor radiance sobre hardware AMD. No sustituye al modelo original para usos generales y no aporta benchmarks ni métricas de calidad frente al bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion latente y proyecciones KDA (Kimi Delta Attention); 128 expertos enrutados por capa mas experto compartido |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se verifico la recuperacion de una cadena oculta en un prompt de 4,8k tokens) |
| Tipos de cuantizacion | IQ8R: int8 con escala u8 por (fila, 256 columnas) y escala bf16 por fila en el tronco; int8 con escala bf16 por (fila, 128 columnas) en expertos; componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura MoE con 128 expertos enrutados por capa y un experto compartido, combinada con atención latente (proyecciones de baja dimensión y compuerta) y proyecciones KDA para query, key y value fusionadas, forget, gate y output. La model card de esta conversión detalla únicamente qué componentes se cuantizan y cuáles permanecen en bf16, no la arquitectura completa ni los datos de entrenamiento del modelo original.

La conversión aplica una rotación Walsh-Hadamard de 128 columnas antes del redondeo en el tronco y en los expertos, con búsqueda de escala y redondeo al vecino más cercano, sin datos de calibración. Es, en palabras del autor, una "conversión rápida para probar el modelo". No se documenta RLHF, DPO ni composición del dataset, y el autor declara explícitamente que no se midió la divergencia KL frente al modelo bf16 ni ningún benchmark.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y el autor verificó respuestas correctas a prompts factuales breves y de programación.
- Razonamiento sobre contexto medio: recuperó una cadena oculta en un prompt de 4,8k tokens, lo que confirma cierta capacidad de atención a contexto largo, aunque no se especifica la ventana máxima.
- Generación de código: validada de forma cualitativa con prompts de programación, sin métricas.
- Mezcla de expertos: el enrutamiento por router se mantiene en bf16, por lo que la selección de expertos no se ve degradada por la cuantización.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación del motor radiance en hardware AMD: el artefacto sirve para validar el despliegue de radiance 2.1.0 o superior en tarjetas Radeon AI PRO R9700, con configuración `tp: 1` o `tp: 2`, antes de invertir en conversiones propias.
- Pruebas de humo de pipelines de generación de texto: permite comprobar el correcto funcionamiento de la cadena de inferencia (carga, tokenización, decodificación en streaming) con un modelo MoE real y sin necesidad de preparar una cuantización desde cero.
- Prototipado de asistentes de código en entornos AMD: el autor verificó respuestas correctas a prompts de programación, lo que lo hace utilizable para demos internas de autocompletado o explicación de código, siempre con validación humana.
- Servicio de generación con throughput alto en una sola tarjeta: a 230 tokens/s en una R9700 y 270 tokens/s con dos, encaja en escenarios de generación masiva de texto donde la latencia por token importa más que la calidad puntera.
- Recuperación de información en documentos de extensión media: la prueba con 4,8k tokens sugiere uso en tareas de question answering sobre contratos, informes o documentación técnica de tamaño moderado.
- Base para experimentos de cuantización: al documentarse la receta exacta (`rad-convert` con `ling-3.0-tiny-iq8r.recipe`), sirve como referencia para comparar estrategias de cuantización int8 con rotación Walsh-Hadamard frente a otras recetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no midió ningún benchmark ni la divergencia KL frente al modelo bf16.

Los únicos datos de rendimiento publicados son de velocidad de decodificación en Radeon AI PRO R9700:

| Configuracion | Latencia por paso | Throughput |
|---|---|---|
| tp: 1 (una tarjeta) | 4,3 ms | 230 tokens/s |
| tp: 2 (dos tarjetas) | 3,7 ms | 270 tokens/s |

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 7,9 GiB, por lo que se necesita al menos ese espacio para los pesos, más overhead de KV cache y buffers del motor; con `tp: 1` debe caber en una GPU de 16 GB o más, aunque el autor no detalla el consumo exacto.
- GPU verificadas: Radeon AI PRO R9700, tanto en configuración de una como de dos tarjetas.
- GPU consumer: no se documenta compatibilidad con GPUs de consumo; el motor radiance está orientado a hardware AMD y no se mencionan otras familias.
- Opciones de despliegue: exclusivamente el motor radiance (versión 2.1.0 o superior), con configuración YAML de `tp: 1` o `tp: 2`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.rad` es propietario.
- Throughput: 230 tokens/s con una tarjeta y 270 tokens/s con dos, medido en decodificación de un único stream.
- Decodificación especulativa: el modelo no incorpora draft head, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-iq8r (esta ficha) | no disponible | no disponible | `.rad` (radiance) | MIT | Hugging Face, 0 descargas |
| inclusionAI/Ling-3.0-tiny (base) | no disponible | no disponible | no disponible en esta informacion | no disponible en esta informacion | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Conversión rápida sin calibración: el autor la describe como una conversión para probar el modelo, con redondeo al vecino más cercano y búsqueda de escala, sin datos de calibración; la degradación frente al bf16 no se ha medido.
- Sin benchmarks: no hay ninguna métrica de calidad publicada, ni siquiera divergencia KL frente al modelo original.
- Formato propietario: los pesos solo son utilizables con el motor radiance 2.1.0 o superior; no hay safetensors, GGUF ni compatibilidad con el ecosistema estándar.
- Hardware restringido: las pruebas se limitaron a Radeon AI PRO R9700; no se documenta funcionamiento en otras GPUs.
- Idiomas y contexto máximo: no disponibles, lo que impide planificar despliegues multilingües o con ventanas de contexto conocidas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad para este artefacto.
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgos del modelo base ni de la conversión.
- Licencia MIT: permisiva para uso comercial, pero el usuario debe verificar las condiciones del modelo base inclusionAI/Ling-3.0-tiny, ya que la model card no detalla la licencia original más allá de afirmar que es MIT "como el modelo fuente".
- Madurez: cero descargas y cero likes en el momento de la consulta, con una única verificación cualitativa por parte del autor; no es un artefacto con validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/StillDeadcode/ling-3.0-tiny-iq8r
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
