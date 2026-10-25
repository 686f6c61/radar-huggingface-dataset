# SubMaroon/Kitchoon-V3.1-26B-A4B

## Resumen

Kitchoon-V3.1-26B-A4B es un ajuste fino (fine-tune) del modelo Kitchoon-V3-26B-A4B, a su vez derivado de la familia Gemma 4 en su variante con mezcla de expertos. Lo desarrolla SubMaroon en colaboración con Indexnusrefather, que aportó el conjunto de datos, y está diseñado específicamente para roleplay (RP) y roleplay erótico (ERP), con enfoque en la coherencia de personaje y un estilo de escritura neutro. No es un modelo de propósito general: es una especialización orientada a personajes.

El modelo tiene 25.805.933.872 parámetros totales (unos 25,8B) almacenados en safetensors, con un repositorio de 51,6 GB, lo que corresponde a pesos en bf16. La nomenclatura «A4B» del nombre indica del orden de 4B de parámetros activos por token, coherente con una arquitectura MoE, aunque la model card no detalla el reparto exacto entre expertos. La arquitectura conserva el tronco Gemma 4, incluida una torre de visión, y mantiene intactos el router, los expertos MoE, los embeddings y el `lm_head`.

La relevancia de esta versión está en el método: el autor entrenó un LoRA sobre atención OV y capas MLP densas para diversificar las respuestas plantilla de Gemma, y aplicó un enmascaramiento selectivo de la función de pérdida para evitar reintroducir clichés («slop»). Es una publicación experimental, con pensamiento (thinking) declarado como no funcional, cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y capas MLP densas; incluye torre de visión; base Gemma 4 |
| Parámetros totales | 25.805.933.872 (≈25,8B) |
| Parámetros activos | ≈4B, según el sufijo «A4B» del nombre; no confirmado de forma explícita en la model card |
| Longitud de contexto | No disponible en la model card; el LoRA se entrenó con 8192 tokens |
| Tipos de cuantización | No se publican GGUF ni otras cuantizaciones; los pesos del repositorio están en bf16 (51,6 GB / 25,8B ≈ 2 bytes por parámetro) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Kitchoon-V3-26B-A4B, un Gemma 4 con arquitectura MoE en el que conviven capas MLP densas y capas con expertos enrutados. La model card confirma la presencia de `v_proj` y `o_proj` en la atención, `gate_proj`, `up_proj` y `down_proj` en las MLP densas, expertos MoE con router, embeddings y una torre de visión. El ajuste V3.1 modificó únicamente la atención OV y las MLP densas: el LoRA se aplicó a las capas 10–29 y 36 en el caso de OV (36 matrices objetivo) y a las capas 10–20 en el caso de las MLP densas (33 matrices objetivo), ambas con una intensidad de fusión («baked») de 0.5. Router, expertos, `lm_head`, QK, embeddings, torre de visión y la proyección `lm_head` permanecen idénticos al modelo base, verificado por nombre de módulo y forma de matriz.

Los detalles de entrenamiento indican rango/alpha de 32/64 para OV y 16/32 para MLP, tasa de aprendizaje 2,5e-5 con decaimiento coseno, una época (754 pasos) y contexto de 8192 tokens; la pérdida de evaluación bajó de 4,32 a 1,41. El conjunto de datos es un corpus en inglés de unas 2800 conversaciones multi-turno construidas sobre tarjetas de personaje, limpiado antes del entrenamiento: se eliminaron tarjetas con personajes menores de edad y personas reales, se corrigieron unas 640 system prompts que instruían al modelo a escribir por el usuario, las conversaciones largas se dividieron en fragmentos de 8192 tokens en lugar de truncarse, se recortó aleatoriamente el primer y/o último párrafo en parte de las respuestas, y se eliminaron los prefijos de nombre (`Name:`). La innovación técnica destacable es el enmascaramiento de la pérdida sobre spans de «slop»: frases cliché, unos 400 n-gramas detectados en múltiples personajes, construcciones del tipo «not just X, but Y» y «It wasn't an X; it was a Y», finales con pregunta «X — or Y?», la primera frase que repite las palabras del usuario y el texto copiado literalmente de la tarjeta de personaje. El modelo ve esos spans en contexto pero no recibe gradiente por reproducirlos. La fusión se hizo con redondeo estocástico en bf16 para que la intensidad aplicada coincida con la probada.

## Capacidades

- Generación de texto conversacional orientada a roleplay y ERP, con estilo de escritura neutro y foco en el desarrollo de personaje.
- Coherencia con la tarjeta de personaje: según las pruebas del autor, los personajes incorporan por iniciativa propia personajes secundarios, hábitos y trasfondo descritos en la ficha.
- Mayor proporción de diálogo y una voz de personaje más marcada en comparación con el modelo base.
- Seguimiento fiable de reglas de formato estrictas y presets estructurados.
- Reducción de muletillas y construcciones repetitivas: menos finales «X — or Y?» y menos fórmulas «not just X».
- Capacidad multimodal heredada del tronco Gemma 4 (torre de visión intacta), aunque la model card no documenta su uso ni su calidad tras el ajuste.
- Modo thinking presente en el modelo, pero declarado explícitamente como no funcional por el autor.
- Modelo «uncensored»/«heretic»: sin filtrado de contenido incorporado, orientado a escritura sin restricciones.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- Multilingüe: no. La model card declara únicamente inglés.

## Casos de uso

- Roleplay conversacional en local con SillyTavern: el modelo está ajustado para tarjetas de personaje y presets estructurados, con parámetros de muestreo recomendados (temperatura 0.85, min-P 0.05, sin repetition penalty/DRY, thinking desactivado).
- Escritura creativa y narrativa por entregas: su ventana de entrenamiento de 8192 tokens permite mantener escenas multi-turno con continuidad de contexto razonable dentro de una sesión.
- Generación de diálogo para videojuegos y novelas visuales: la adherencia a la ficha y la reducción de clichés facilitan producir líneas distinguibles por personaje sin repetir fórmulas.
- Investigación sobre mitigación de «slop»: el enmascaramiento de pérdida sobre n-gramas y construcciones concretas es un caso de estudio replicable para quien entrene modelos de RP.
- Prototipado de personajes virtuales sin conexión a servicios externos: al ser un modelo de pesos abiertos, permite desplegarlo en infraestructura propia para conversaciones con datos sensibles.
- Estudio comparativo de modelos abliterated frente a sus bases alineadas: la variante conserva router y expertos del modelo original, lo que permite aislar el efecto del ajuste de estilo.
- Experimentación con arquitecturas MoE de ~26B en entornos con presupuesto de cómputo limitado: al activar del orden de 4B de parámetros por token, el coste de decodificación es menor que el de un modelo denso del mismo tamaño total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de entrenamiento: pérdida de evaluación de 4,32 a 1,41 tras 754 pasos, y comparaciones cualitativas frente al modelo base (mayor adherencia a la tarjeta, más diálogo, menos finales «X — or Y?»). No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay estandarizadas. La búsqueda web realizada no devolvió información relevante sobre este modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del tamaño de pesos; el autor no publica requisitos oficiales.

- VRAM en bf16: unos 52 GB solo para pesos, más caché KV y activaciones; en la práctica, 60–80 GB. Indicado para A100 80 GB u H100 80 GB en una sola GPU; en consumer requiere varias GPU (por ejemplo, 4× RTX 4090 de 24 GB) o descarga a CPU.
- VRAM en FP8/INT8: del orden de 26–28 GB. Cabe en RTX 6000 Ada (48 GB) y A6000 (48 GB), no en una RTX 4090 de 24 GB sin offload.
- VRAM en INT4: del orden de 14–16 GB para pesos. Entraría en RTX 4090 (24 GB) y RTX 4080 (16 GB) con margen ajustado; en GPUs de 12 GB requeriría offload parcial.
- Al ser MoE con aproximadamente 4B de parámetros activos, la decodificación debería ser notablemente más rápida que la de un denso de 26B, pero no se han publicado medidas de latencia ni de throughput.
- Opciones de despliegue: vLLM (soporte de MoE), TGI o transformers con aceleración por hardware. llama.cpp y Ollama requerirían convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- El repositorio ocupa 51,6 GB, por lo que conviene disponer de ese espacio en disco además de la VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Kitchoon-V3.1-26B-A4B | 25,8B | ≈4B (según nombre) | No disponible | Apache 2.0 | Experimental, 0 descargas |
| Kitchoon-V3-26B-A4B (base) | No disponible en la información | No disponible | No disponible | No disponible | Modelo de partida del ajuste |
| Otras variantes de la familia Gemma 4 | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos en la búsqueda |

No hay datos públicos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría (modelos de roleplay de 20–30B, densos o MoE). La comparación disponible se limita a las diferencias declaradas por el autor frente a Kitchoon-V3: atención OV y MLP densas con LoRA fusionado a 0.5, y el resto de componentes idénticos.

## Limitaciones y advertencias

- Publicación experimental: el propio autor advierte de que «puede ser inestable».
- El modo thinking no funciona correctamente; debe desactivarse. Con él activo, el comportamiento no está garantizado.
- Clichés residuales confirmados: los personajes a veces repiten las palabras del usuario en su primera línea, muchos párrafos empiezan por un nombre o «He/She» (heredado de Gemma), y términos como «smirk» y el guion largo no han desaparecido por completo.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, por lo que el rendimiento fuera del inglés es impredecible.
- Modelo «uncensored» derivado de una variante «heretic»: no incorpora filtros de contenido, lo que implica riesgo de generar material sensible o inapropiado sin salvaguardas. Requiere moderación externa en cualquier despliegue público.
- Riesgo de alucinación y pérdida de coherencia en sesiones largas: el autor pide explícitamente feedback sobre la lógica de escena, quién está dónde y quién habla con quién en conversaciones prolongadas, lo que sugiere que es un punto débil conocido.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, con pruebas realizadas por el autor sobre un conjunto limitado de tarjetas propias.
- Licencia: la model card declara Apache 2.0, pero al derivar de la familia Gemma conviene verificar la compatibilidad con los términos de uso de Gemma antes de un uso comercial, ya que los modelos derivados de Gemma suelen heredar sus condiciones.
- El ajuste se aplicó únicamente a atención OV y MLP densas; los expertos MoE y el router conservan el comportamiento del modelo base, incluidas sus limitaciones y sesgos.
- No hay garantías de soporte de tool calling ni de integración en pipelines de agentes; no está documentado ni evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Kitchoon-V3.1-26B-A4B
- Modelo base Kitchoon-V3-26B-A4B: https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- Perfil del colaborador y proveedor del dataset (Indexnusrefather): https://huggingface.co/Indexnusrefather
- Perfil de Tetratype, autor de la base antislop: https://huggingface.co/Tetratype
- Donaciones al autor (Boosty): https://boosty.to/submaroon/donate
- Créditos sin URL en la model card: `coder3101` (versión heretic de partida) y Sam Paech (pipeline auto-antislop)
