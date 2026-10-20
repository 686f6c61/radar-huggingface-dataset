# Thingamatronics/Sable_v19_ctx32k-q4f16_1-MLC

## Resumen

Sable_v19_ctx32k-q4f16_1-MLC es un conjunto de pesos compilados con MLC-LLM a partir de Qwen2.5-1.5B-Instruct, afinados por el usuario Thingamatronics para dar vida al personaje "Dr. Sable" en una demo jugable en navegador. El repositorio no contiene un asistente de propósito general: contiene únicamente los artefactos que WebLLM descarga en tiempo de ejecución y ejecuta en el propio navegador del jugador mediante WebGPU, sin enviar datos a ningún servidor.

El modelo parte de un transformer decoder-only denso de 1.540 millones de parámetros con una ventana de contexto de 32.768 tokens, cuantizado en formato `q4f16_1-MLC` (pesos de 4 bits con activaciones en fp16) y empaquetado en aproximadamente 880 MB de descarga. En memoria, la model card reporta un consumo de unos 3,3 GB en f32 y unos 2,5 GB en f16, lo que lo sitúa en el rango de GPU integradas y portátiles recientes con soporte de WebGPU.

Su relevancia es acotada pero concreta: es un ejemplo real de despliegue de un LLM cuantizado íntegramente en el cliente para un videojuego, con las implicaciones de privacidad (cero llamadas a servidor) y de latencia que eso conlleva. Conviene tratarlo como un artefacto de producción específico de una aplicación, no como un modelo base reutilizable. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), compilado con MLC-LLM para WebGPU |
| Parametros totales | 1,54 mil millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | `q4f16_1-MLC`: pesos cuantizados en grupo a 4 bits, activaciones y acumulacion en fp16 |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara soporte de 29 idiomas, sin datos sobre el comportamiento tras el fine-tune |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos MLC-LLM (`params_shard_*.bin`, `ndarray-cache.json`, `mlc-chat-config.json`); no se distribuyen safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 0,9 GB (descarga reportada: ~880 MB) |
| Memoria GPU reportada | ~3,3 GB en f32 / ~2,5 GB en f16 |
| Libreria / runtime | mlc-llm, WebLLM (web-llm), WebGPU |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal y ventana de contexto nativa de 32.768 tokens, entrenado por Alibaba Qwen y publicado bajo Apache-2.0 con un pipeline de ajuste por instrucciones (SFT y optimización por preferencias) que el autor original documenta en su model card. Sobre esa base, Thingamatronics aplicó un fine-tune específico para interpretar al personaje Dr. Sable dentro de la demo `doctor-sable` alojada en itch.io. La model card no detalla el conjunto de datos de ese fine-tune, el número de tokens empleados, la composición del corpus ni si se usaron técnicas de RLHF o DPO adicionales; todos esos datos deben considerarse no disponibles.

La contribución técnica del repositorio no está en el entrenamiento sino en el empaquetado: los pesos se compilan con MLC-LLM al formato `q4f16_1-MLC`, que aplica cuantización de grupo a 4 bits sobre los pesos manteniendo activaciones en fp16, y se serializan junto con la configuración de chat y el caché de tensores que WebLLM necesita para cargar el modelo directamente en la GPU del navegador vía WebGPU. Esto habilita inferencia en cliente sin instalación, aunque limita el artefacto al ecosistema MLC/WebLLM: no es directamente consumible por llama.cpp, Ollama, vLLM o TGI sin reconvertir los pesos o recurrir al modelo base original.

## Capacidades

- Generación de texto conversacional multi-turno en el rol del personaje Dr. Sable, con una ventana de 32.768 tokens que permite mantener historial extenso de partida dentro de la demo.
- Ejecución íntegra en el navegador del cliente mediante WebGPU, sin peticiones a servidor ni transferencia de datos del usuario.
- Descarga e inicialización bajo demanda a través de WebLLM, con caché local del artefacto de ~880 MB.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (comprensión lectora básica, generación de código sencillo, aritmética de pocos pasos, seguimiento de instrucciones), degradadas de forma no documentada por el fine-tune de personaje.
- Soporte multilingüe: no documentado para este fine-tune; el modelo base declara 29 idiomas.
- Tool calling / function calling: no documentado en este repositorio; el formato MLC-LLM no incluye plantilla de herramientas específica en la información disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.
- Capacidad de agente multi-paso: no documentada; la lógica de estado de la partida reside en el motor del juego, no en el modelo.

## Casos de uso

- NPC conversacional en videojuegos web: el modelo se carga con WebLLM dentro del propio motor del juego y genera diálogo de personaje en tiempo real sin backend, lo que permite publicar una build estática en itch.io o similar sin costes de inferencia por jugador.
- Demos jugables con presupuesto cero de infraestructura: al ejecutarse en la GPU del cliente, el coste marginal por partida es nulo y no hay que aprovisionar GPUs ni gestionar cuotas de API.
- Prototipado rápido de personajes: sirve como plantilla de referencia para crear otros fine-tunes de personaje y compilarlos al formato MLC-LLM con el mismo pipeline.
- Aplicaciones con requisitos estrictos de privacidad: cualquier caso donde el texto del usuario no pueda salir del dispositivo (educación, salud, menores) puede beneficiarse del patrón de inferencia 100 % local que demuestra este repositorio.
- Evaluación de WebGPU como plataforma de inferencia: útil para medir tiempos de carga, consumo de VRAM del navegador y latencia por token en hardware cliente real antes de comprometerse con esta arquitectura.
- Docencia y talleres sobre despliegue de LLM en el navegador: el par repo + demo constituye un ejemplo completo y reproducible de cuantización, compilación MLC y consumo desde JavaScript.
- Base para experimentos de alineación de personaje: permite estudiar cómo un fine-tune estrecho sobre un modelo de 1,5 B altera el comportamiento del modelo base en tareas generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K ni evaluaciones de diálogo) para este fine-tune. Cualquier cifra atribuible a Qwen2.5-1.5B-Instruct corresponde al modelo base publicado por Alibaba Qwen y no se ha verificado sobre estos pesos. Los únicos datos medidos que reporta el autor son operativos:

| Metrica reportada | Valor |
|---|---|
| Tamano de descarga | ~880 MB |
| Memoria GPU en f32 | ~3,3 GB |
| Memoria GPU en f16 | ~2,5 GB |
| Ventana de contexto | 32.768 tokens |
| Latencia por token | No disponible |
| Throughput | No disponible |

## Requisitos de hardware

- VRAM estimada: ~2,5 GB con precisión f16 y ~3,3 GB en f32, según la model card; conviene reservar margen adicional para el contexto activo y el overhead del navegador.
- GPU recomendadas: cualquier GPU de escritorio o portátil con soporte de WebGPU (gama media reciente de AMD, NVIDIA o Intel, y Apple Silicon). El autor indica explícitamente que móviles y tabletas no pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en el rango de 4 GB de VRAM efectiva en adelante, siempre que el navegador exponga WebGPU de forma estable.
- Opciones de despliegue: WebLLM sobre WebGPU es la vía prevista; MLC-LLM puede servir el mismo formato mediante su servidor REST y backend nativo, aunque este repositorio está empaquetado para el runtime web. No es cargable directamente en llama.cpp, Ollama, vLLM ni TGI sin reconvertir pesos; para esos runtimes habría que partir del modelo base y cuantizarlo a GGUF o AWQ/GPTQ.
- Latencia y throughput: no disponibles. La latencia dependerá de la GPU del cliente, del driver WebGPU y del tamaño del contexto activo; el coste de la primera carga incluye la descarga de ~880 MB.
- Almacenamiento: prever ~0,9 GB de caché del navegador por versión del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso comercial | Formato nativo |
|---|---|---|---|---|---|
| Sable_v19_ctx32k-q4f16_1-MLC | 1,54 B | 32.768 | Apache-2.0 | Sí, sin restricciones adicionales | MLC-LLM / WebLLM |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache-2.0 | Sí | safetensors |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Licencia comunitaria Llama 3.2 | Sí, con condiciones de la licencia | safetensors |
| Gemma-2-2B-it | 2,6 B | 8.192 | Licencia Gemma | Sí, con condiciones de la licencia | safetensors |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache-2.0 | Sí | safetensors |

En rendimiento medido no hay comparación posible: este repositorio no publica benchmarks y los datos de los modelos alternativos no se han verificado aquí. La diferencia práctica frente a las alternativas es de empaquetado y propósito: Sable v19 es un artefacto listo para WebGPU atado a un personaje concreto, mientras que los otros son modelos de propósito general que requieren una etapa de conversión para ejecutarse en el navegador.

## Limitaciones y advertencias

- No es un asistente de propósito general: la model card lo declara explícitamente. Está afinado para interpretar a un único personaje en un único juego y su comportamiento fuera de ese contexto será degradado e impredecible.
- La verdad del estado de la partida la decide el motor del juego, no el modelo; el LLM puede generar afirmaciones inconsistentes con el estado real de la partida y el motor debe filtrarlas.
- Riesgo de alucinación inherente a un modelo de 1,5 B cuantizado a 4 bits, agravado por el fine-tune estrecho y por la falta de evaluaciones publicadas.
- Idiomas: la model card no documenta qué idiomas conserva el fine-tune; no hay garantía de calidad fuera del idioma de entrenamiento del personaje, presumiblemente inglés.
- Cobertura de plataformas muy limitada: requiere WebGPU y el autor excluye móviles y tabletas, lo que reduce la audiencia alcanzable de la demo.
- Dependencia del ecosistema MLC/WebLLM: los pesos no son portables a otros runtimes sin reconversión, lo que crea un riesgo de dependencia de versión del runtime web.
- Licencia Apache-2.0 permisiva para uso comercial, tanto en este repositorio como en el modelo base; no se identifican cláusulas adicionales del autor, aunque conviene revisar los términos de la demo y de los assets del juego, que son obra separada.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de calidad, sesgos o estabilidad.
- El repositorio solo contiene pesos: no se distribuyen scripts de entrenamiento, dataset del fine-tune ni configuración de evaluación, lo que impide auditar el ajuste.
- Sesgos: no documentados. Al heredarse del modelo base sin evaluación publicada, no puede descartarse la presencia de sesgos de género, culturales o geográficos en el diálogo del personaje.

## Enlaces

- Repositorio HuggingFace: <https://huggingface.co/Thingamatronics/Sable_v19_ctx32k-q4f16_1-MLC>
- Demo jugable (Dr. Sable): <https://stickybitgames.itch.io/doctor-sable>
- WebLLM (runtime de inferencia en navegador): <https://github.com/mlc-ai/web-llm>
- Modelo base Qwen2.5-1.5B-Instruct: <https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct>
- MLC-LLM (compilador y runtime): <https://github.com/mlc-ai/mlc-llm>
