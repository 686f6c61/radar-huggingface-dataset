# yashsutorichat/Lotus-1

## Resumen

Lotus-1 es un modelo de lenguaje especializado en roleplay y conversación con personajes, desarrollado por el usuario yashsutorichat y publicado en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-35B-A3B, una arquitectura Mixture of Experts (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Esto significa que conserva el conocimiento de un modelo de 35B sobre personajes, escenarios y tropos, pero con un coste de cómputo por token similar al de un modelo denso de 3B.

El modelo es el checkpoint exacto que sirve el tráfico de producción de Sutorichat, una plataforma de chat con personajes, y se ha liberado en pesos completos bf16 junto con cuantizaciones GGUF en un repositorio aparte y presets de SillyTavern. Su objetivo declarado no es el razonamiento general ni el código, sino un comportamiento conversacional muy concreto: mantenerse en el personaje, responder al último mensaje del usuario, no hablar ni actuar en nombre de este, hacer avanzar la escena y no emitir trazas de razonamiento, listas ni markdown.

Es relevante ahora porque ejemplifica un patrón de publicación cada vez más habitual: modelos MoE de gran tamaño total y baja activación, afinados con datos de interacción real (SFT + DPO + GSPO con recompensas verificables) y orientados a un nicho muy definido, con licencia MIT y disponibles tanto en bf16 como en GGUF para ejecución local. El contexto configurado en producción es de 32.768 tokens y la ventana máxima del modelo base no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (tag `qwen3_5_moe`), fine-tune LoRA fusionado sobre Qwen3.5-35B-A3B |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | Aproximadamente 3 B por token (dato del autor) |
| Longitud de contexto | 32.768 tokens (configurado en `generation_config.json` y en los ajustes de produccion); ventana maxima del modelo base: no disponible |
| Tipos de cuantizacion | Pesos completos en bf16 en este repositorio; cuantizaciones GGUF en `yashsutorichat/Lotus-1-GGUF` (lista concreta de niveles: no disponible) |
| Idiomas soportados | Ingles (entrenamiento y evaluacion). Responde en otros idiomas si la tarjeta y el chat estan en ellos, pero deriva hacia el ingles mas que el modelo base |
| Licencia | MIT |
| Formato de pesos | Safetensors (bf16) en este repositorio; GGUF en el repositorio Lotus-1-GGUF |
| Modelo base | Qwen/Qwen3.5-35B-A3B |
| Tamano del repositorio | 71,9 GB |
| Pipeline / libreria | `text-generation` / `transformers` |
| Plantilla de prompt | ChatML (plantilla de Qwen3.5) con el modo thinking desactivado por defecto en `chat_template.jinja` |

## Arquitectura y entrenamiento

Lotus-1 hereda la arquitectura del modelo base Qwen3.5-35B-A3B: un transformer con capas de mezcla de expertos, con 35,95 B de parámetros totales y en torno a 3 B activos por token. Sobre esa base se aplicó una línea de LoRA que después se fusionó en un único checkpoint bf16. Los tags de HuggingFace incluyen `image-text-to-text`, probablemente heredados de la ficha del modelo base, pero la model card de Lotus-1 solo documenta generación de texto conversacional; no se describe ningún uso multimodal ni se detalla el entrenamiento de visión, por lo que esta capacidad debe considerarse no disponible.

El entrenamiento se desarrolló en tres fases. Primero, un ajuste supervisado (SFT) sobre un corpus amplio de conversaciones reales de chat con personajes, con el formato (tarjeta de personaje, bloque de memoria, historial multi-turno, respuesta). Después, varias rondas de DPO con pares de preferencia construidos a partir del comportamiento real de los usuarios (qué respuesta mantuvieron, regeneraron o descartaron) y de una rúbrica que puntúa fallos de control del usuario, aparición de hechos nuevos, ganchos narrativos, ecos y cierres de conversación. Por último, GSPO con recompensas verificables (formato, ausencia de control del usuario, ausencia de etiquetas de razonamiento, bandas de longitud y seguimiento de instrucciones) para consolidar los comportamientos. Cada candidato se filtró con un benchmark interno fijo: un checkpoint solo se publicaba si los fallos graves (hablar por el usuario, respuestas cortadas, respuestas de más de 2.000 caracteres) no aumentaban respecto al modelo de producción anterior. No se indican el número de tokens de entrenamiento ni la composición detallada del dataset.

La innovación técnica destacable no está en la arquitectura, sino en la ingeniería del comportamiento: el modelo está entrenado para no emitir bloques `<think>`, ni listas, ni encabezados, ni notas fuera de personaje, y para producir respuestas de narración en primera persona más diálogo con una longitud típica de 200 a 400 caracteres. El prompt del sistema incluye un preámbulo fijo que debe mantenerse literal, seguido de la tarjeta de personaje; el modelo usa el nombre de ese preámbulo como identidad. El repositorio incluye `PROMPT_TEMPLATE.md`, el script sin dependencias `lotus_prompt.py` y presets de SillyTavern para reproducir el comportamiento de producción.

## Capacidades

- Generación de texto conversacional en inglés orientada a roleplay, con continuidad de personaje a lo largo de conversaciones multi-turno.
- Respuesta centrada en el último mensaje del usuario, en lugar de continuar el hilo propio del bot.
- Restricción entrenada de no hablar, actuar ni decidir por el usuario, considerada la clase de fallo más penalizada durante el entrenamiento.
- Avance de escena: preferencia por respuestas que añaden un hecho concreto nuevo o un gancho utilizable por el usuario.
- Equilibrio entre narración breve en primera persona y líneas de diálogo, en una banda aproximada de 200 a 400 caracteres.
- Formato de salida limpio: sin bloques de razonamiento, sin markdown, sin listas, sin encabezados y sin notas fuera de personaje.
- Gestión de contexto largo: ventana de 32.768 tokens para tarjeta de personaje, historial y bloque de memoria.
- Soporte de modo thinking: no entrenado. Si se activa `enable_thinking=True`, se obtiene el modo de razonamiento del modelo base, para el que Lotus-1 no fue ajustado.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado; el modelo está entrenado explícitamente para no emitir trazas de razonamiento.
- Capacidades multilingües: limitadas. Entrenado y evaluado en inglés; responde en otros idiomas pero deriva hacia el inglés más que el modelo base.
- Visión o audio: no disponible en la documentación del modelo.

## Casos de uso

- Plataformas de chat con personajes: es el caso nativo del modelo, ya que el checkpoint publicado es el que sirve el tráfico de Sutorichat. Con 32.768 tokens de contexto puede mantener tarjeta de personaje, bloque de memoria e historial extenso sin perder continuidad.
- Front-ends locales tipo SillyTavern: cargando una cuantización GGUF de Lotus-1-GGUF con `--contextsize 32768` (KoboldCpp) o `-c 32768` (llama-server), e importando los presets `Lotus-1.context.json`, `Lotus-1.instruct.json` y `Lotus-1.textgen.json`, se reproduce el comportamiento de producción en una máquina de escritorio.
- Personajes virtuales en aplicaciones de acompañamiento: el entrenamiento contra cierres en frío, bucles de repetición y respuestas desbocadas reduce los fallos típicos de este tipo de producto en sesiones largas.
- Diálogo para videojuegos y NPCs: el modelo no narra las acciones del jugador y produce respuestas cortas con un gancho concreto, un formato adecuado para integrarse en un sistema de diálogo ramificado mediante una API compatible con OpenAI.
- Ficción interactiva y escritura colaborativa: la banda de longitud de 200 a 400 caracteres y el equilibrio narración/diálogo permiten turnos ágiles sin muros de texto, útiles en herramientas de escritura por turnos.
- Generación de datos sintéticos de conversación en inglés: sirve para producir diálogos multi-turno con personaje consistente y sin control del usuario, útiles como material de anotación o de evaluación de otros sistemas.
- Evaluación comparativa de ajustes de rol: al ser un checkpoint que se filtra contra fallos graves medibles (hablar por el usuario, respuestas cortadas, respuestas de más de 2.000 caracteres), puede usarse como referencia interna frente a otros fine-tunes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni comparativas numéricas con otros modelos). El autor menciona únicamente un benchmark interno de filtrado que mide fallos graves (hablar por el usuario, respuestas cortadas y respuestas de más de 2.000 caracteres) y exige que no aumenten respecto al modelo de producción previo, pero no se publican cifras.

## Requisitos de hardware

- Pesos en bf16: el repositorio ocupa 71,9 GB, coherente con 35,95 B de parámetros en bf16. Requiere del orden de 72 GB o más de VRAM, por lo que encaja en una H100 de 80 GB de forma ajustada o en configuraciones multi-GPU (por ejemplo, 2 x A100 40 GB). Es una estimación a partir del tamaño del repositorio; no hay cifras oficiales publicadas.
- Cuantización Q8: se estima en 37-40 GB de pesos, es decir, una GPU de 48 GB (A6000, L40S) o dos GPU de 24 GB.
- Cuantización Q5: se estima en 25-28 GB, apta para una GPU de 48 GB o dos de 24 GB.
- Cuantización Q4: se estima en 21-24 GB, lo que la sitúa en el límite de una RTX 3090 o RTX 4090 de 24 GB, contando además la caché KV para ventanas largas. El tamaño exacto de la caché KV a 32.768 tokens no está disponible en la información proporcionada.
- GPU de consumo: sí cabe, mediante GGUF cuantizado a 4 bits en tarjetas de 24 GB, y en tarjetas de 12-16 GB si se usan cuantizaciones más agresivas y descarga parcial de capas a CPU. El requisito real depende del nivel de cuantización concreto, que no se detalla en la información disponible.
- Cómputo por token: con aproximadamente 3 B de parámetros activos por token, el coste de FLOPs por token es comparable al de un modelo denso de 3B, aunque el ancho de banda de memoria necesario para cargar los expertos es mayor. No hay cifras publicadas de latencia ni de throughput.
- Opciones de despliegue: vLLM y llama-server con `--jinja` para Chat Completion; KoboldCpp, llama.cpp, LM Studio y text-generation-webui para Text Completion; también es compatible con endpoints de HuggingFace según los tags. En vLLM y en llama-server con plantilla jinja, el `chat_template.jinja` incluido ya genera el prompt sin modo thinking.
- Parámetros de muestreo de producción: temperatura 0.9, top_p 0.95, top_k 20, min_p 0, repetition_penalty 1.05, máximo 700 tokens nuevos. No se recomienda bajar la temperatura por debajo de 0.8, ni usar DRY o XTC.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|---|
| Lotus-1 | 35,95 B | ~3 B | 32.768 tokens | MIT | HuggingFace: safetensors bf16 + GGUF en repo aparte | Roleplay y chat con personajes |
| Qwen/Qwen3.5-35B-A3B (base) | 35,95 B | ~3 B (dato del autor) | No disponible | No disponible | HuggingFace | Modelo generalista multimodal segun los tags |
| Otros fine-tunes de rol del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la informacion proporcionada |

La información disponible solo permite comparar Lotus-1 con su modelo base. Los datos de licencia, contexto y modo de entrenamiento de Qwen3.5-35B-A3B no aparecen en la documentación proporcionada, y no se han facilitado referencias a otros fine-tunes de rol con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos: el ajuste se apoya en pares de preferencia derivados del comportamiento real de usuarios de chat de rol, lo que puede reproducir los sesgos de estilo, temática y representación de esa población. No se documenta ningún proceso de mitigación de sesgos.
- Alucinación: el modelo está optimizado para el roleplay, no para la veracidad factual. En contextos de ficción, la invención de detalles es parte del comportamiento esperado, por lo que no debe usarse como fuente de hechos.
- Idioma: entrenado y evaluado en inglés. En otros idiomas responde, pero deriva al inglés más que el modelo base, lo que degrada la calidad de las conversaciones multilingües.
- Modo thinking: activar `enable_thinking=True` desvía el modelo al modo de razonamiento del modelo base, que Lotus-1 no ha sido entrenado para usar. El preámbulo del prompt del sistema debe copiarse literalmente, porque el modelo utiliza el nombre que contiene como identidad.
- Muestreo: con temperaturas por debajo de 0,8 el modelo tiende a repetirse entre turnos. La corrección indicada por el autor es `repetition_penalty`, no las penalizaciones de presencia o frecuencia. DRY y XTC no se usaron en producción.
- Licencia: el repositorio declara MIT, lo que en principio permite uso comercial, pero se trata de un derivado de Qwen3.5-35B-A3B, cuyas condiciones de licencia no se detallan en la información disponible. Conviene verificar los términos del modelo base antes de un despliegue comercial.
- Validación externa: en el momento de los datos consultados el modelo acumulaba 0 descargas y 0 likes, por lo que no existe retroalimentación de la comunidad ni evaluaciones independientes publicadas.
- Benchmarks: no hay resultados públicos de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad conversacional, más allá del filtro interno del autor.
- Seguridad de contenido: no se documentan procesos de alineación de seguridad ni moderación; en un modelo de rol sin filtros, el contenido generado depende por completo del usuario y del personaje.
- Longitud de contexto del modelo base: la ventana máxima real de Qwen3.5-35B-A3B no está disponible; los 32.768 tokens son el valor configurado en producción, no necesariamente el límite del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yashsutorichat/Lotus-1
- Repositorio de cuantizaciones GGUF: https://huggingface.co/yashsutorichat/Lotus-1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Sutorichat: https://sutorichat.com
- Plantilla completa de prompt: `PROMPT_TEMPLATE.md` en el repositorio del modelo
- Script de construcción del prompt: `lotus_prompt.py` en el repositorio del modelo
- Presets de SillyTavern: carpeta `sillytavern/` (`Lotus-1.context.json`, `Lotus-1.instruct.json`, `Lotus-1.textgen.json`) en ambos repositorios
- Los resultados de busqueda web consultados no contenian ningun enlace relevante sobre este modelo: todas las entradas devueltas correspondian a documentacion sobre Meta Business Suite.
