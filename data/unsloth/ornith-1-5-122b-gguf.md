# unsloth/Ornith-1.5-122B-GGUF

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por ornith-ai, presentado como el miembro más ligero de la familia Ornith-1.5. Esta ficha concreta documenta la versión cuantizada en GGUF publicada por Unsloth bajo el identificador `unsloth/Ornith-1.5-122B-GGUF`, derivada del modelo base `ornith-ai/Ornith-1.5-122B`. El modelo cuenta con 124.635.206.144 parámetros totales (unos 124,6 mil millones) según los pesos en safetensors del modelo base, y la etiqueta `qwen3_5_moe` indica que la arquitectura procede de la familia Qwen3.5 MoE.

La propuesta del autor es un bucle de auto-mejora de extremo a extremo: en lugar de depender de un conjunto fijo de tareas curadas por humanos y de harnesses diseñados a mano, Ornith-1.5 genera continuamente nuevas tareas de entrenamiento, descubre estrategias eficaces para resolverlas y mejora la política mediante aprendizaje por refuerzo, optimizando de forma conjunta la generación de tareas, la construcción del scaffold y los rollouts de solución. Según la model card, Ornith-1.0 se construyó sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales.

La relevancia práctica de esta publicación es doble: por un lado, ofrece una vía de despliegue local de un modelo de 122B en formato GGUF con cuantización dinámica Unsloth Dynamic 3.0, pensado para despliegue en una sola GPU; por otro, su licencia MIT facilita el uso comercial. El repositorio ocupa 908,8 GB en total, lo que refleja que incluye múltiples niveles de cuantización del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`; linaje Qwen3.5 y Gemma4 según la model card) |
| Parametros totales | 124.635.206.144 (124,6B, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones dinamicas Unsloth Dynamic 3.0 (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

Otros datos del repositorio: 25 likes, 0 descargas, pipeline `text-generation`, tags `gguf`, `ornith`, `qwen3_5_moe`, `unsloth`, `endpoints_compatible`, `conversational`, `region:us`. Fecha de creacion: 2026-10-20; ultima actualizacion: 2026-10-20.

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), heredera de Qwen3.5 según la etiqueta del repositorio. La model card sitúa el origen de la familia en Ornith-1.0, desarrollado sobre Qwen3.5 y Gemma4 mediante preentrenamiento continuado, mid-training y post-training adicionales. No se especifican en la información disponible el número de expertos, el número de expertos activos por token, la dimensión oculta ni la longitud de contexto nativa. El dato de parámetros totales (124,6B) corresponde a los pesos en safetensors del modelo base, no a los ficheros GGUF cuantizados.

El aspecto técnico diferencial es el procedimiento de entrenamiento: Ornith-1.5 amplía el bucle de auto-mejora de Ornith-1.0 —que optimizaba scaffold y rollouts— para optimizar conjuntamente la generación de tareas, la construcción del scaffold y los rollouts de solución. En lugar de un conjunto fijo de tareas humanas y harnesses manuales, el sistema genera nuevas tareas, busca estrategias de resolución y actualiza la política con aprendizaje por refuerzo. El diseño de recompensas de tareas, harness y rollouts se detalla en el blog del autor. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO al margen del bucle de RL descrito.

La publicación de Unsloth añade una capa de cuantización: GGUFs con Unsloth Dynamic 3.0, con gráficas comparativas de KLD y de precisión top-1 frente al tamaño del fichero. No se detallan en el texto proporcionado los valores numéricos de esas gráficas.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`, pipeline `text-generation`).
- Razonamiento y resolución de tareas de codificación agéntica: los benchmarks reportados incluyen TerminalBench 2.1 (81,2) y CyberGym (80), orientados a operación en terminal y ciberseguridad.
- Capacidad declarada de ejecución de tareas multi-paso dentro de scaffolds, dado que el entrenamiento optimiza explícitamente la construcción de harness y los rollouts de solución.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, no necesariamente con protocolos de herramientas).
- Capacidades multilingües: no disponible; el campo de idiomas de HuggingFace figura como no disponible.
- Capacidades de visión o audio: no disponibles para esta variante (la comparativa menciona un modelo distinto, Nemotron 3.5 Super VL, con capacidades visuales, pero no se atribuyen a Ornith-1.5-122B).
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.
- Despliegue en una sola GPU y variante móvil: la model card menciona una variante cuantizada `Ornith-1.5-122B-Mobile` para despliegue en dispositivos móviles.

## Casos de uso

- Automatización de operaciones en terminal: el modelo obtiene 81,2 en TerminalBench 2.1, una prueba orientada a resolver tareas de shell y administración de sistemas, por lo que encaja en agentes que ejecutan comandos, interpretan la salida y corrigen errores en bucle.
- Auditoría de seguridad y análisis de vulnerabilidades: con 80 puntos en CyberGym, es adecuado para asistentes que razonan sobre superficies de ataque, revisan configuraciones y proponen mitigaciones en entornos controlados, siempre con validación humana.
- Agente de codificación en pipelines de CI/CD: la puntuación en benchmarks de terminal y el énfasis del entrenamiento en rollouts multi-paso permiten integrarlo como agente que reproduce fallos, aplica parches y verifica tests, sujeto a revisión obligatoria antes del merge.
- Despliegue local con requisitos de soberanía de datos: al publicarse en GGUF y con licencia MIT, puede ejecutarse en infraestructura propia sin depender de APIs externas, lo que resulta útil en entornos con restricciones de confidencialidad.
- Asistente conversacional de dominio técnico: la etiqueta `conversational` y el pipeline de generación de texto permiten construir asistentes multi-turno para documentación interna, soporte a desarrolladores o consultas sobre bases de código.
- Experimentación en investigación sobre auto-mejora: el modelo es un caso de estudio de entrenamiento por RL con generación automática de tareas, útil para grupos que investigan currículos sintéticos, diseño de recompensas y evaluaciones agénticas.
- Prototipado en hardware de gama alta para consumo: una cuantización agresiva permite probar el comportamiento del modelo en una estación de trabajo con una sola GPU antes de escalar a despliegue en servidor.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (porcentaje de acierto). La tabla original está truncada en la información disponible; se recogen las filas completas.

| Benchmark | Ornith-1.5-122B | Qwen3.8-Flash-Next (125B) | Qwen3.8 (27B dense) | Nemotron 3.5 Super VL (120B) | DeepSeek-V4-Flash-0731 (284B) | Beam (501B) |
|---|---|---|---|---|---|---|
| TerminalBench 2.1 | 81,2 | 83,4 | 71,9 | 66,7 | 82,7 | 80,1 |
| CyberGym | 80 | 78 | 55 | 34 | no disponible (tabla truncada) | no disponible (tabla truncada) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar de conocimiento general o matemáticas. Los datos anteriores proceden del propio autor y no se han verificado de forma independiente en esta ficha.

## Requisitos de hardware

- Memoria para pesos en precision completa: 124,6B parametros a bf16 equivalen a unos 249 GB, por encima de cualquier GPU individual; requiere sharding multi-GPU o offload a CPU.
- Cuantizacion 8 bits: estimacion de unos 125-135 GB de VRAM solo para pesos, lo que exige multiples GPU (por ejemplo, 2x H100 80GB o 2x A100 80GB).
- Cuantizacion 4 bits: estimacion de unos 65-75 GB de VRAM para pesos; cabe en una H100 80GB o A100 80GB con margen limitado para KV cache. No cabe en una RTX 4090 (24 GB) sin offload.
- Cuantizacion 2-3 bits: estimacion de unos 35-50 GB; podria ejecutarse en una A6000 48GB o en configuraciones con offload parcial. La calidad se degrada de forma apreciable en estos rangos.
- Estas cifras son estimaciones calculadas a partir del numero de parametros; en un MoE todos los expertos deben residir en memoria, aunque solo se activen unos pocos por token, por lo que el ahorro de memoria respecto a un modelo denso equivalente es nulo.
- GPU recomendadas: H100 80GB, A100 80GB o H200 para las cuantizaciones de 4-8 bits; A6000 48GB o configuraciones multi-GPU para cuantizaciones bajas.
- Cabe en GPU de consumo: no de forma holgada. Una RTX 4090 (24 GB) solo admitiria cuantizaciones muy agresivas con offload a memoria del sistema, con latencia muy elevada.
- Opciones de despliegue: llama.cpp y sus derivados para GGUF, Ollama, y Unsloth Desktop segun la propia model card; vLLM y TGI no se mencionan para esta variante GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput por token depende del numero de expertos activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | CyberGym | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B | 124,6B (MoE) | no disponible | 81,2 | 80 | MIT | GGUF en HF (esta publicacion) y safetensors en el modelo base |
| Qwen3.8-Flash-Next | 125B | no disponible | 83,4 | 78 | no disponible | no disponible en la informacion proporcionada |
| Nemotron 3.5 Super VL | 120B | no disponible | 66,7 | 34 | no disponible | no disponible en la informacion proporcionada |
| Qwen3.8 | 27B dense | no disponible | 71,9 | 55 | no disponible | no disponible en la informacion proporcionada |
| DeepSeek-V4-Flash-0731 | 284B | no disponible | 82,7 | no disponible | no disponible | no disponible en la informacion proporcionada |
| Beam | 501B | no disponible | 80,1 | no disponible | no disponible | no disponible en la informacion proporcionada |

Frente a modelos de tamano comparable, Ornith-1.5-122B queda 2,2 puntos por debajo de Qwen3.8-Flash-Next en TerminalBench 2.1 y 2 puntos por encima en CyberGym. Frente a alternativas mucho mayores (DeepSeek-V4-Flash-0731 con 284B y Beam con 501B) se mantiene en un rango proximo en TerminalBench, con 1,5 y 1,1 puntos de diferencia respectivamente.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor del modelo; no se han verificado de forma independiente y la tabla publicada esta truncada, por lo que faltan resultados en varias celdas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos generativos, especialmente en tareas de codigo y seguridad donde una respuesta plausible pero incorrecta puede tener consecuencias graves.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicity ni fairness en la informacion proporcionada.
- Idiomas soportados: no disponible. El campo de idiomas figura vacio, por lo que no hay garantia documentada de rendimiento fuera del ingles; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso que dependan de ventanas largas.
- Parametros activos y estructura de expertos: no disponibles, lo que dificulta estimar coste de inferencia y planificacion de capacidad.
- Restricciones de licencia: la licencia es MIT, permisiva y apta para uso comercial con atribucion; el modelo base declara la misma licencia enlazada en su repositorio. Debe conservarse el aviso de copyright correspondiente.
- Calidad de las cuantizaciones: las versiones de 2-3 bits pueden degradar de forma notable el razonamiento y la fidelidad en tareas agenticas; para uso en produccion conviene partir de 4 bits o superior.
- Tamano del repositorio: 908,8 GB en total, lo que implica costes de almacenamiento y descarga considerables si se clona completo; conviene descargar unicamente el fichero de cuantizacion necesario.
- Fecha de publicacion: el repositorio figura creado el 2026-10-20; verificar la vigencia y el estado de mantenimiento antes de adoptarlo.
- Ausencia de confirmacion sobre tool calling: si el caso de uso depende de function calling estricto, debe validarse empiricamente antes de integrarlo en un agente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/unsloth/Ornith-1.5-122B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Documentacion de Unsloth Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Unsloth: https://unsloth.ai/docs
- Releases de Unsloth: https://github.com/unslothai/unsloth/releases
- Perfil de Unsloth en HuggingFace: https://huggingface.co/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
