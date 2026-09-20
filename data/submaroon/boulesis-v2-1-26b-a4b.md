# SubMaroon/Boulesis-v2.1-26B-A4B

## Resumen

Boulesis-v2.1-26B-A4B es un merge experimental de la familia Gemma 4 con arquitectura MoE (26.544.131.376 parámetros totales, nomenclatura A4B que implica del orden de 4.000 millones de parámetros activos por token) publicado por el usuario SubMaroon en HuggingFace. El modelo no es un entrenamiento desde cero ni un fine-tune clásico: es una composición construida mediante aritmética de tareas sobre las matrices Q y K (QK task arithmetic) más la fusión de adaptadores LoRA, aplicada sobre tres modelos base de la misma familia: Gryphe/Gemma-4-26B-A4B-StyleTune-V2, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 y coder3101/gemma-4-26B-A4B-it-heretic.

El objetivo declarado del autor es triple: conservar la inteligencia y el conocimiento del modelo de partida, diversificar su prosa para hacerla más decidida, y afinar la atención al contexto para que el modelo explote de forma orgánica la tarjeta de personaje (lore, hechos, relaciones) en lugar de limitarse a reflejar al usuario. Está etiquetado explícitamente como modelo de roleplay, con soporte de modo thinking/reasoning y sin censura (heretic/abliterated), lo que lo sitúa en el nicho de modelos para SillyTavern y KoboldCPP.

La relevancia de esta versión v2.1 dentro de la propia serie es que, según el autor, es la que mejor capta a los personajes y mejor memoria de contexto tiene, a costa de una extensión de respuesta comparable a v1 y un tono algo más mesurado. Se trata de un modelo de 53,1 GB en safetensors, distribuido bajo licencia Gemma y declarado únicamente para inglés, con 148 descargas y 13 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de la familia Gemma 4; atención con capas sliding-window y globales (grupos `sliding_q`, `sliding_k`, `global_q`, `global_k`); conserva la torre de visión del cuerpo base |
| Parametros totales | 26.544.131.376 (26,54 mil millones), según los pesos safetensors del repositorio |
| Parametros activos | Del orden de 4.000 millones por token, inferido de la nomenclatura A4B; el autor no publica la cifra exacta |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle; el autor menciona una versión GGUF para su uso en KoboldCPP, sin especificar niveles. Los pesos publicados son safetensors de precisión completa |
| Idiomas soportados | Inglés (declarado). La v1 se entrenó con datos mixtos inglés/ruso; v2 y v2.1 se entrenaron solo en inglés |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (repositorio de 53,1 GB); GGUF mencionado para inferencia en KoboldCPP |

## Arquitectura y entrenamiento

La base es un Gemma 4 26B-A4B: un transformer con mezcla de expertos en el que solo se activa una fracción de los expertos por token, de ahí el sufijo A4B. El autor afirma haber verificado por comparación de tensores, tras cada paso del merge, que los expertos MoE, el router, los embeddings, el MLP y la torre de visión son idénticos al cuerpo abliterated de partida. Por tanto, la intervención se limita a dos mecanismos: aritmética de tareas sobre las matrices de query y key, y la fusión de adaptadores LoRA.

El merge usa vectores de tarea calculados sobre Q y K (no ajustados "a ojo"): el autor mide la norma de Frobenius relativa frente a los pesos base y obtiene valores medios de 0,00278 para `sliding_q`, 0,00263 para `sliding_k`, 0,00356 para `global_q` y 0,00286 para `global_k`, con máximos de 0,00518, 0,00474, 0,00436 y 0,00395 respectivamente. En los alfas de publicación, la rotación por fila resultante es pequeña: 0,12 grados de media en los cuatro grupos, con máximos de 3,08 (sliding_q), 5,87 (sliding_k), 1,72 (global_q) y 9,53 (global_k). El LoRA fusionado se aplica sobre las capas 10 a 28, con 35 objetivos, y se integra con una escala de bake de 0,40.

Respecto a versiones anteriores, v2.1 mantiene el donante QK y los alfas de v2 (0,85 en sliding q/k y 0,65 en global q/k), el mismo rango de capas y objetivos LoRA y el mismo corpus de entrenamiento solo en inglés; el único cambio es la escala de bake, que baja de 0,70 a 0,40. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO (al tratarse de un merge, el autor no realiza un entrenamiento supervisado nuevo).

| Aspecto | v1 | v2 | v2.1 |
|---|---|---|---|
| Donante QK | Pantheon-Reasoning-1.1 | Pantheon-Reasoning-1.1-V2 | Igual que v2 |
| Alfas QK | 0,6 sliding q/k; 0,6 global q; 0 global k | 0,85 sliding q/k; 0,65 global q/k | Igual que v2 |
| Capas LoRA | las 30 | 10-28 | Igual que v2 |
| Objetivos LoRA | 55 | 35 | Igual que v2 |
| Escala de bake | 0,26 | 0,70 | 0,40 |
| Datos de entrenamiento | mixto inglés/ruso | solo inglés | Igual que v2 |

## Capacidades

- Generación de texto narrativo y conversacional orientado a roleplay, con énfasis declarado en la coherencia de personaje y en el uso activo del lore de la tarjeta de personaje.
- Modo thinking/reasoning: el modelo incorpora etiquetas de razonamiento que el autor documenta como funcionales, con instrucciones específicas para forzarlas en KoboldCPP y configurar la plantilla correcta en SillyTavern.
- Memoria de contexto en sesiones largas: según el autor, v2.1 es la versión de la serie con mejor seguimiento de la lógica de escena, posiciones de los personajes y a quién se dirige cada intervención, especialmente en escenas con varios personajes.
- Prosa diversificada y tono más decidido respecto al modelo base, con respuestas de longitud comparable a v1.
- Capacidad heredada del cuerpo base abliterated: sin capas de rechazo activas (etiquetas `uncensored`, `heretic`), lo que habilita contenido que los modelos alineados estándar rechazarían.
- Conserva la torre de visión del modelo base, verificada como idéntica tras el merge; la información disponible no documenta su funcionamiento ni su calidad tras la composición.
- Capacidades multilingües limitadas: solo inglés declarado; aunque el modelo base pueda tener competencia en otros idiomas, el LoRA fusionado se entrenó únicamente con datos en inglés.
- Ajustes de muestreo recomendados por el autor: temperature 1,0; top-k 64; top-p 0,95; repetition penalty entre 1,05 y 1,1.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Roleplay multi-personaje en SillyTavern: el modelo está diseñado específicamente para este escenario, con la versión v2.1 orientada a escenas complejas donde varios personajes interactúan. Su capacidad declarada de seguir posiciones y turnos de habla durante sesiones largas reduce el fallo típico de mezclar voces o perder la lógica de escena.
- Personajes no jugadores (NPC) en videojuegos narrativos: el modelo se usaría como backend de diálogo generativo para NPC con tarjeta de personaje propia, aprovechando su atención reforzada al lore para mantener consistencia de trasfondo a lo largo de muchas interacciones, sin necesidad de reinyectar el contexto completo en cada turno.
- Co-escritura de ficción: para autores que necesitan generar prosa narrativa con un tono concreto y sin los rechazos habituales de los modelos alineados en escenas de conflicto, violencia o contenido adulto, dentro de los límites de la licencia Gemma.
- Simulación de diálogo para guionistas y diseñadores narrativos: generar variantes de una misma escena con personajes distintos para comparar registros, apoyándose en la diversificación de prosa introducida por el merge.
- Investigación sobre alineación y abliteración: al ser un cuerpo abliterated con ediciones verificadas por tensores, sirve como caso de estudio reproducible para medir cómo una rotación pequeña en Q/K (máximos de 9,53 grados por fila) afecta al comportamiento de personaje y a la adherencia al contexto.
- Generación de datos sintéticos de diálogo en inglés para fine-tuning: sesiones largas de roleplay etiquetadas pueden alimentar datasets conversacionales, con la ventaja de que el modelo no bloquea temáticas que otros modelos rechazarían.
- Despliegue local en equipos de consumo: gracias a la arquitectura MoE y a las versiones GGUF mencionadas por el autor, puede ejecutarse en KoboldCPP con cuantizaciones bajas, lo que lo hace viable para usuarios sin GPU de centro de datos.
- Pruebas de prompts y ajuste de samplers: el autor pide explícitamente feedback sobre ajustes de muestreo, por lo que el modelo también encaja en flujos de trabajo de evaluación comparativa de configuraciones de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, y las búsquedas web realizadas no han devuelto resultados relevantes sobre el modelo. Los únicos datos cuantitativos publicados son las métricas internas del merge (normas de Frobenius y rotaciones por fila de las matrices Q/K), que miden la magnitud de la edición, no la calidad del modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros publicado, no mediciones del autor:

- Pesos en bf16/fp16: aproximadamente 53 GB (26,54 mil millones de parámetros × 2 bytes), coherente con el tamaño del repositorio (53,1 GB).
- VRAM mínima para inferencia en bf16: en torno a 56-64 GB contando caché KV y overhead. Requiere una A100 de 80 GB, una H100 de 80 GB o varias GPU con tensor parallelism.
- Cuantización de 8 bits: aproximadamente 27-28 GB de pesos, por lo que no cabe en una RTX 4090 de 24 GB y sí en una A6000 de 48 GB o en dos GPU de 24 GB.
- Cuantización de 4 bits: aproximadamente 14-16 GB de pesos, lo que permite ejecutarlo en una RTX 4090, RTX 3090 o similar de 24 GB con margen para contexto, y en tarjetas de 16 GB con contexto reducido.
- El coste de cómputo por token es el de un modelo de unos 4.000 millones de parámetros activos, pero el consumo de memoria es el de los 26,54 mil millones completos. Esto hace que un MoE de este tipo sea especialmente adecuado para despliegue con offloading parcial de expertos a CPU.
- Opciones de despliegue documentadas en la ficha: KoboldCPP con pesos GGUF (incluye instrucciones para habilitar el modo razonamiento) y SillyTavern como front-end con plantilla específica. llama.cpp y LM Studio son compatibles con GGUF de la familia Gemma, aunque el autor no los menciona. El soporte en vLLM, TGI o Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La información disponible no incluye benchmarks de ninguno de los modelos de la comparativa, por lo que las celdas de rendimiento quedan como no disponibles. La comparación se limita a linaje, tipo de artefacto y licencia.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Boulesis-v2.1-26B-A4B | Merge (QK task arithmetic + LoRA fusionado) | 26,54 mil millones totales, ~4 mil millones activos | no disponible | gemma | no disponible |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | Fine-tune de estilo | 26B-A4B (misma base) | no disponible | gemma | no disponible |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | Fine-tune orientado a razonamiento; donante de las matrices Q/K | 26B-A4B (misma base) | no disponible | gemma | no disponible |
| coder3101/gemma-4-26B-A4B-it-heretic | Fine-tune abliterated; cuerpo base del merge | 26B-A4B (misma base) | no disponible | gemma | no disponible |

Frente a alternativas de roleplay de otros linajes, la información disponible no permite establecer una comparación con datos verificables.

## Limitaciones y advertencias

- Modelo abliterated ("heretic", "uncensored"): las capas de rechazo han sido eliminadas del cuerpo base. Puede generar contenido violento, sexual o dañino sin filtros, lo que exige moderación externa si se expone a usuarios finales.
- Es un merge experimental: el propio autor indica que solo lo prueba con sus propias tarjetas de personaje y que su cobertura es estrecha. La v1 recibió quejas sobre la lógica de escena en sesiones largas, y v2.1 es un intento de corregirlo sin garantía de resolución completa.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones de fidelidad factual en la información disponible.
- Idioma: solo inglés declarado. El LoRA fusionado se entrenó únicamente con datos en inglés, por lo que el rendimiento en castellano u otros idiomas no está documentado y previsiblemente degradado respecto al del modelo base.
- Longitud de contexto no documentada: se desconoce la ventana efectiva del modelo y si el merge afecta a su comportamiento en los extremos del contexto.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la política de uso prohibido de Google, que incluye restricciones específicas. No es una licencia permisiva tipo Apache 2.0 y requiere revisión legal antes de integraciones comerciales.
- No se documenta soporte de tool calling, function calling ni uso agéntico, por lo que no es adecuado para pipelines que dependan de estas capacidades sin validación previa.
- Requiere configuración manual para que el modo razonamiento funcione en KoboldCPP y una plantilla concreta en SillyTavern; sin ella, las etiquetas de pensamiento pueden no activarse.
- Número de descargas muy bajo (148) y 13 likes: la validación por parte de la comunidad es mínima, lo que limita la evidencia disponible sobre su comportamiento en producción.
- El repositorio ocupa 53,1 GB, lo que encarece el almacenamiento y la transferencia si se despliega en varias instancias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B
- Modelo base (abliterated): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo base (estilo): https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo base (razonamiento, donante QK): https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Hilo de Reddit con ajustes de muestreo citado por el autor: https://www.reddit.com/r/SillyTavernAI/comments/1w9abpf/comment/p8b064y/
- Perfiles de créditos mencionados en la model card: https://huggingface.co/Naphula, https://huggingface.co/redaihf, https://huggingface.co/Vortex5

Nota: las búsquedas web realizadas no han devuelto resultados relevantes sobre este modelo; los únicos enlaces verificables son los anteriores, extraídos de la propia model card. No se han localizado papers, blogs técnicos ni demos adicionales.
