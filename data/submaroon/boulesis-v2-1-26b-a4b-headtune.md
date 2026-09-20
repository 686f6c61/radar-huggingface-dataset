# SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune

## Resumen
Boulesis-v2.1-26B-A4B-HeadTune es un modelo de lenguaje orientado a roleplay y generacion creativa, publicado por el usuario SubMaroon en HuggingFace. No se trata de un entrenamiento desde cero, sino de un merge experimental construido sobre dos modelos base: Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 y coder3101/gemma-4-26B-A4B-it-heretic. La arquitectura de partida es un transformer de tipo mezcla de expertos (MoE) de la familia Gemma 4, con 26.544.133.710 parametros totales y una nomenclatura "A4B" que sugiere del orden de 4.000 millones de parametros activos por token, aunque ese dato no se confirma en la documentacion.

El objetivo declarado del autor es conservar el conocimiento y la inteligencia del modelo base, diversificar su prosa y hacerlo mas decisivo, ademas de afinar su atencion al contexto para que incorpore de forma organica el lore y los hechos de la ficha de personaje en lugar de limitarse a imitar al usuario. La innovacion tecnica principal es la combinacion de aritmetica de tareas sobre las matrices Q y K, una LoRA fusionada y una cabeza de salida (`lm_head`) entrenada por el propio autor sobre su dataset, en lugar de reutilizar la de StyleTune-V2.

Es relevante ahora porque se posiciona dentro del ecosistema de modelos "uncensored" o "heretic" para SillyTavern y KoboldCPP, un nicho con demanda constante de modelos con modo de razonamiento y buena memoria de contexto en sesiones largas multi-personaje. Se trata, en palabras del autor, de una version muy experimental y publicada con cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4); merge por aritmetica de tareas QK + LoRA fusionada + `lm_head` propio |
| Parametros totales | 26.544.133.710 (26,5 B) |
| Parametros activos | No confirmado; la nomenclatura "A4B" del nombre sugiere del orden de 4 B activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en detalle; la model card menciona el uso de una version GGUF en KoboldCPP |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (terminos de uso de Gemma de Google) |
| Formato de pesos | safetensors (tamano del repo: 53,1 GB) |

## Arquitectura y entrenamiento
El modelo parte de una arquitectura MoE de Gemma 4 con 26,5 mil millones de parametros totales. Sobre esa base, el autor aplica una estrategia de composicion en tres piezas: aritmetica de tareas sobre las proyecciones Q y K para combinar comportamientos de los dos modelos base, una LoRA fusionada para ajustar el comportamiento generativo, y un `lm_head` entrenado especificamente por el autor sobre su propio dataset. Este `lm_head` sustituye al de StyleTune-V2 utilizado en variantes anteriores, lo que convierte a HeadTune en una rama diferenciada dentro de la familia Boulesis.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en los modelos base. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal. El proposito declarado del merge es triple: mantener el nucleo de conocimiento e inteligencia del modelo, diversificar la prosa, y reforzar la atencion al contexto para que el modelo recupere y use lore de la ficha de personaje de forma espontanea. El autor clasifica esta version como "muy experimental" y anuncia que se actualizara tras las pruebas.

## Capacidades
- Generacion de texto creativo y narrativo en ingles, con enfasis en roleplay multi-turno.
- Modo de razonamiento o "thinking" (etiquetas `thinking` y `reasoning`), con instrucciones en la model card para forzarlo en KoboldCPP y configurar la plantilla en SillyTavern.
- Persistencia de personaje y coherencia de escena en sesiones largas con multiples personajes, segun la descripcion de la version v2.1.
- Uso organico de lore y hechos de la ficha de personaje, en lugar de reflejar unicamente el estilo del usuario.
- Comportamiento "uncensored" o "heretic", derivado del fine-tune coder3101/gemma-4-26B-A4B-it-heretic, orientado a reducir rechazos en contextos de ficcion.
- Ajuste fino del estilo de prosa: la v2.1 busca una longitud comparable a la v1 con un tono mas medido y mejor comprension de personajes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado mas alla del modo de razonamiento.
- Capacidades de vision, audio o multimodalidad: no disponibles ni documentadas, pese a la etiqueta "gemma4".
- Capacidades multilingues: solo ingles declarado (`language: en`).

## Casos de uso
- Roleplay conversacional en SillyTavern: el modelo esta disenado explicitamente para este front-end, con plantilla de prompt y parametros de muestreo recomendados (temperatura 1,0, top-k 64, top-p 0,95, penalizacion de repeticion 1,05-1,1), lo que permite desplegarlo con una configuracion conocida.
- Sesiones de rol con multiples personajes simultaneos: la version v2.1 se presenta como la de mejor manejo de posiciones, logica de escena y asignacion de quien habla a quien, lo que la hace adecuada para tramas con varios interlocutores en una misma escena.
- Escritura de ficcion asistida de forma local: el modelo puede generar prosa narrativa y dialogos manteniendo coherencia con un trasfondo extenso, lo que encaja en flujos de escritura por capitulos donde se reinyecta el lore.
- Despliegue en hardware de consumo mediante GGUF: la model card incluye instrucciones concretas para KoboldCPP, lo que permite ejecutarlo en equipos de gama alta sin infraestructura de servidor.
- Prototipado de personajes para videojuegos o experiencias interactivas: la capacidad de extraer y reutilizar hechos de una ficha permite mantener personalidad y hechos consistentes en dialogos ramificados.
- Investigacion sobre merges y edicion de modelos: al ser un ejemplo documentado de aritmetica de tareas QK combinada con LoRA fusionada y `lm_head` propio, sirve como caso de estudio para quienes estudian tecnicas de composicion de pesos.
- Generacion de datos sinteticos de dialogo en ingles con tono controlado: util para crear corpus de conversacion o de roleplay, siempre que se revise el sesgo y el contenido generado.
- Pruebas comparativas de ajuste de `lm_head`: al sustituir la cabeza de salida respecto a variantes previas, permite aislar el efecto del `lm_head` sobre el estilo frente al resto del merge.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y los resultados de la busqueda web no aportan datos relacionados con el modelo.

## Requisitos de hardware
- VRAM para inferencia en precision completa (bf16/fp16): aproximadamente 53 GB, coherente con el tamano del repositorio (53,1 GB). Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM estimada en 8 bits: alrededor de 27 GB.
- VRAM estimada en 4 bits: alrededor de 15-16 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- Cabe en GPU de consumo: en cuantizaciones de 4 bits es plausible en una RTX 4090 o RTX 3090 de 24 GB; en 8 bits requeriria dos GPU de 24 GB. Al tratarse de un MoE con pocos parametros activos, la velocidad de decodificacion deberia ser superior a la de un modelo denso del mismo tamano total, aunque no hay mediciones publicadas.
- Opciones de despliegue: llama.cpp y KoboldCPP mediante GGUF (documentado en la model card), SillyTavern como front-end. vLLM, TGI, Ollama o ExLlamaV2 no estan confirmados como compatibles en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo incluye parametros de muestreo, no metricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boulesis-v2.1-26B-A4B-HeadTune | 26,5 B totales (activos no confirmados) | No disponible | Roleplay, merge con `lm_head` propio, thinking | gemma | HuggingFace, 0 descargas |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26 B (A4B) | No disponible | Razonamiento y roleplay (modelo base) | No disponible en la informacion | HuggingFace |
| coder3101/gemma-4-26B-A4B-it-heretic | 26 B (A4B) | No disponible | Gemma 4 con ajuste "heretic" (modelo base) | No disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente a alternativas de la misma categoria. La comparativa se limita, por tanto, a la relacion de descendencia directa con los dos modelos base.

## Limitaciones y advertencias
- Modelo marcado por el propio autor como "muy experimental", con pruebas limitadas a sus propias fichas de personaje y cobertura estrecha.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente de calidad, estabilidad ni seguridad.
- No se han publicado benchmarks, por lo que no es posible cuantificar su rendimiento frente a alternativas.
- La longitud de contexto no esta documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- El caracter "uncensored"/"heretic" implica un filtrado de seguridad reducido, con mayor probabilidad de generar contenido inapropiado, sesgado o danino sin advertencia. Requiere moderacion adicional en cualquier despliegue con usuarios finales.
- Riesgo de alucinacion inherente a los modelos generativos, acentuado en tareas de recuperacion de hechos fuera del contexto de roleplay.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen obligaciones de cumplimiento y restricciones de uso. Debe revisarse antes de cualquier explotacion comercial.
- El modelo es un merge, no un entrenamiento completo: no hay garantia de que las capacidades de los modelos base se preserven de forma uniforme.
- No se documenta soporte de tool calling ni de flujos de agente, por lo que no es adecuado para pipelines que dependan de llamadas a funciones.
- Los parametros de muestreo recomendados (temperatura 1,0, top-k 64, top-p 0,95) son especificos de este merge; desviarse de ellos puede degradar notablemente la salida.
- La fecha de creacion registrada (2026-09-20) y la ausencia de pipeline declarado son inconsistencias o vacios de metadatos que conviene tener en cuenta al automatizar el consumo de la ficha.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Modelo base: https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Perfil del autor: https://huggingface.co/SubMaroon
- Perfiles mencionados en los creditos: https://huggingface.co/Naphula, https://huggingface.co/redaihf, https://huggingface.co/Vortex5
- Hilo de Reddit citado sobre parametros de muestreo: https://www.reddit.com/r/SillyTavernAI/comments/1w9abpf/comment/p8b064y/
- No se han encontrado papers, blogs tecnicos, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo.
