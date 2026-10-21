# SubMaroon/Kitchoon-V3-26B-A4B

## Resumen

Kitchoon-V3-26B-A4B es un ajuste fino (fine-tune) de tipo LoRA sobre `Tetratype/Gemma-4-26B-A4B-it-heretic-antislop`, un modelo de la familia Gemma 4 con arquitectura Mixture of Experts (MoE) y aproximadamente 25.800 millones de parametros totales. Lo desarrolla el usuario SubMaroon y esta orientado especificamente a roleplay (RP) y roleplay erotico (ERP): el objetivo declarado es mejorar la construccion de personaje, el estilo de escritura neutro y la fidelidad a la ficha de personaje, reduciendo al mismo tiempo las muletillas tipicas de los modelos de roleplay ("slop").

El problema que aborda es concreto: los modelos base suelen producir respuestas genericas con formulas repetidas ("a flicker of", "not just X, but Y", finales del tipo "X — or Y?") y tienden a repetir las palabras del usuario o a copiar literalmente la tarjeta de personaje. Kitchoon-V3 entrena unicamente las proyecciones de atencion OV y el MLP denso, y enmascara esas construcciones en la funcion de perdida, de modo que el modelo las ve en contexto pero no recibe gradiente por reproducirlas.

Es relevante ahora porque demuestra una tecnica de ajuste muy quirurgica sobre un MoE: no toca expertos, router, embeddings, `lm_head` ni la torre de vision, con lo que el coste de entrenamiento es bajo (754 pasos, 1 epoca) y el resto de capacidades del modelo base se conserva intacto. El entrenamiento se hizo con ventanas de 8192 tokens y el modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) derivado de Gemma 4; fine-tune LoRA sobre atencion OV y MLP denso |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | no disponible de forma explicita; el nombre del modelo indica ~4B activos |
| Longitud de contexto | no disponible para el modelo final; el ajuste se entreno con ventanas de 8192 tokens y se reporta funcionamiento del modo thinking con 5-7K tokens de contexto |
| Tipos de cuantizacion | no se publican cuantizaciones oficiales; el repo contiene pesos safetensors (bf16), por lo que requiere cuantizacion propia (GGUF, AWQ, GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma (terminos de uso de Gemma) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 51,6 GB |
| Modelo base | Tetratype/Gemma-4-26B-A4B-it-heretic-antislop |
| Pipeline | no disponible |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer MoE de la familia Gemma 4 con unos 25,8B de parametros totales y, segun la nomenclatura del nombre, del orden de 4B activos por token. El ajuste no reentrena el modelo: aplica LoRA sobre dos conjuntos de modulos y los fusiona ("bake") en los pesos finales. Por un lado, atencion OV (`v_proj` + `o_proj`) en las capas 10-29, con 36 objetivos, rango 32 y alpha 64. Por otro, MLP denso (`gate_proj` + `up_proj` + `down_proj`) en las capas 10-20, con 33 objetivos, rango 16 y alpha 32. Ambos LoRA se entrenaron conjuntamente pero se fusionaron con intensidades separadas, ambas a 0,5, usando redondeo estocastico en bf16 para que la intensidad fusionada coincida con la probada. Quedan identicos al modelo base `lm_head`, las proyecciones QK, los expertos MoE, el router, los embeddings y la torre de vision.

El entrenamiento uso un dataset en ingles de roleplay de unas 2800 conversaciones multi-turno construidas sobre tarjetas de personaje. Antes de entrenar se eliminaron tarjetas con personajes menores de edad y personas reales, se corrigieron unos 640 system prompts que instruian al modelo a escribir por el usuario, se dividieron las conversaciones largas en fragmentos de 8192 tokens en lugar de truncarlas y se eliminaron los prefijos de nombre de personaje en las respuestas. El entrenamiento fue de 1 epoca (754 pasos), learning rate 2,5e-5 con decaimiento coseno, y la perdida de evaluacion bajo de 4,32 a 1,41. La innovacion tecnica principal es el enmascaramiento selectivo de la perdida: se anulan las frases cliche, unas 400 n-gramas frecuentes entre personajes distintos, las construcciones tipo "not just X, but Y" y "It wasn't an X; it was a Y", las preguntas finales del tipo "X — or Y?", la primera frase que repite las palabras del usuario y el texto copiado literalmente de la tarjeta de personaje. El modelo sigue viendo esos fragmentos como contexto, pero no recibe gradiente por generarlos.

## Capacidades

- Generacion de texto en ingles con foco en narrativa de rol, dialogo multi-turno y desarrollo de personaje.
- Roleplay y ERP sin censura: parte de una base "heretic" a la que se ha retirado la alineacion de seguridad del modelo original.
- Modo thinking funcional, incluido en contexto largo (se reporta uso correcto con 5-7K tokens de contexto).
- Fidelidad a la ficha de personaje: segun el autor, los personajes incorporan por iniciativa propia personajes secundarios, habitos y lore descritos en la tarjeta.
- Seguimiento fiable de reglas de formato estrictas y presets estructurados (relevante para front-ends tipo SillyTavern).
- Reduccion de muletillas y construcciones repetitivas respecto al modelo base, incluyendo finales "X — or Y?" y construcciones "not just X".
- Respuestas largas: por defecto ronda las 400 palabras, por lo que recomienda configurar al menos 900 tokens de longitud de respuesta.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modo thinking existe, pero no hay evaluacion publicada de uso agentico.
- Vision: la torre de vision se mantiene identica al modelo base, por lo que la capacidad multimodal se hereda, pero no se ha entrenado ni evaluado en esta version.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo mantiene coherencia de escena y de personaje en sesiones extensas gracias al modo thinking y a un entrenamiento especifico en conversaciones multi-turno; conviene revisar la logica de escena en sesiones muy largas, que es justo lo que el autor pide testear.
- Front-ends de rol autoalojados tipo SillyTavern: sigue de forma fiable presets estructurados y reglas de formato estrictas, con ajustes recomendados de temperature 0,85 y min-p 0,05, y penalizacion de repeticion/DRY desactivada.
- Creacion de personajes consistentes para narrativa interactiva: el ajuste prioriza que el personaje arrastre lore y secundarios de su tarjeta en lugar de improvisar un tono generico, lo que reduce el trabajo de curacion de prompts.
- Generacion de ficcion serializada en ingles: con respuestas de ~400 palabras y ventanas de 8192 tokens, encaja en pipelines que producen capitulos o escenas encadenadas con continuidad de estilo.
- Prototipado de sistemas de dialogo con personajes para videojuegos o experiencias interactivas: sirve como modelo de referencia para evaluar estilo y voz de personaje antes de destilar a un modelo menor.
- Investigacion sobre mitigacion de "slop" en modelos de lenguaje: el enmascaramiento selectivo de la perdida sobre frases y construcciones cliche es una tecnica reproducible y documentada, util como caso de estudio para ajustes de estilo.
- Base para nuevos fine-tunes de rol: al no haberse tocado router, expertos ni embeddings, es un punto de partida razonable para experimentos posteriores con LoRA sobre atencion y MLP denso sin degradar el resto del modelo.
- Evaluacion comparativa de ajustes "uncensored": util en entornos de investigacion sobre alineacion y desalineacion, siempre con las advertencias legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y el repositorio no ofrece pipeline ni evaluaciones automaticas. El unico dato cuantitativo publicado es la perdida de evaluacion durante el entrenamiento:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Eval loss (1 epoca, 754 pasos) | 4,32 | 1,41 |

Las comparaciones cualitativas que hace el autor frente al modelo base son: mayor fidelidad a la tarjeta de personaje, mas dialogo y voz de personaje mas marcada, mejor seguimiento de formatos estrictos y bastantes menos finales "X — or Y?" y construcciones "not just X". No se aportan numeros que respalden estas afirmaciones.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan unos 51,6 GB, por lo que se necesitan aproximadamente 58-64 GB de VRAM contando cache KV y overhead del runtime.
- VRAM cuantizado: ~26 GB en 8 bits y ~13-14 GB en 4 bits, cifras estimadas a partir del numero de parametros, sin publicacion oficial de estos formatos.
- GPU recomendadas: una A100 80GB o H100 80GB para bf16 en una sola GPU; para precision completa en varias GPU, tensor parallelism sobre 2x A100 40GB o 2x L40S 48GB.
- GPU de consumo: no cabe en bf16 en ninguna consumer GPU. En 4 bits es viable en una RTX 4090 o RTX 3090 de 24 GB, y en 8 bits en una RTX 5090 de 32 GB o en dos GPU de 24 GB.
- Opciones de despliegue: vLLM, TGI y SGLang admiten arquitecturas MoE de esta familia y son la via recomendada para servicio concurrente; llama.cpp y Ollama solo si se genera previamente una cuantizacion GGUF, que el autor no publica.
- Latencia y throughput: no hay mediciones publicadas. Como referencia estructural, al activar del orden de 4B parametros por token, el coste de computo por token se aproxima al de un modelo denso de ~4B, aunque el peso en memoria y la carga de pesos corresponden a 25,8B.
- Contexto operativo: el ajuste se entreno con 8192 tokens; planificar el dimensionado de cache KV para esa ventana salvo que se valide un contexto mayor con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque | Evaluacion publicada |
|---|---|---|---|---|---|---|
| Kitchoon-V3-26B-A4B | ~25,8B | ~4B (segun nomenclatura) | 8192 tokens en entrenamiento | Gemma | Roleplay/ERP en ingles, antislop | No |
| Tetratype/Gemma-4-26B-A4B-it-heretic-antislop (base) | ~25,8B | ~4B (segun nomenclatura) | no disponible | Gemma | Roleplay sin censura, antislop a nivel de token | No |
| Gemma-4-26B-A4B-it (modelo upstream) | no disponible en la informacion proporcionada | no disponible | no disponible | Gemma | Asistente general | no disponible |

La comparacion directa posible se limita al modelo base, ya que es el unico para el que la informacion proporcionada describe diferencias concretas: Kitchoon-V3 modifica atencion OV en capas 10-29 y MLP denso en capas 10-20, mientras que el base mantiene esos modulos en estado original. No se dispone de datos verificables de otros fine-tunes de roleplay del mismo tamano para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluaciones estandar ni comparaciones medidas, solo impresiones del autor sobre sus propias tarjetas de personaje.
- Sesgos desconocidos: no se documenta analisis de sesgos; el dataset son tarjetas de personaje en ingles de origen comunitario, con la distribucion demografica y cultural que ello implica.
- Riesgo de alucinacion: como cualquier modelo generativo de 25,8B, puede inventar hechos; en roleplay esto es en parte deseable, pero lo invalida para tareas factuales sin verificacion.
- Contenido sin censura: al partir de una base "heretic" se ha reducido la alineacion de seguridad, por lo que puede producir contenido sexual explicito, violento u ofensivo. Requiere moderacion y control de acceso si se expone a usuarios.
- Idioma: solo ingles declarado; no hay garantia de calidad en castellano ni en otros idiomas.
- Contexto: el entrenamiento se hizo a 8192 tokens; no se especifica la ventana maxima del modelo final, y el rendimiento mas alla de esa longitud no esta verificado.
- Defectos reconocidos por el autor: los personajes a veces repiten las palabras del usuario en la primera frase, la mayoria de parrafos empiezan por un nombre o por "He/She" (herencia de Gemma), y el asterisco de accion (`*smirk*`) y la raya em dash no han desaparecido del todo.
- Respuestas largas por defecto (~400 palabras): puede requerir truncado o limites de longitud en produccion.
- Licencia Gemma: los terminos de uso de Gemma imponen restricciones que deben revisarse antes de un uso comercial, incluida la obligacion de cumplir la politica de uso prohibido de Google y las clausulas de redistribucion.
- Madurez: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo dia (20 de octubre de 2026), sin validacion independiente de la comunidad.
- Trazabilidad del dataset: el autor agradece el dataset a un tercero (Indexnusrefather); la model card no publica el dataset ni su procedencia detallada, lo que dificulta auditorias de licencia y sesgo.
- Incoherencia menor en la model card: menciona que el modelo se entreno "from scratch" cuando en realidad es un fine-tune LoRA; debe interpretarse como mercadotecnia, no como descripcion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- Modelo base: https://huggingface.co/Tetratype/Gemma-4-26B-A4B-it-heretic-antislop
- Autor del base (Tetratype): https://huggingface.co/Tetratype
- Colaborador del dataset (Indexnusrefather): https://huggingface.co/Indexnusrefather
- Colaborador (Naphula): https://huggingface.co/Naphula
- Colaborador (redaihf): https://huggingface.co/redaihf
- Donaciones del autor: https://boosty.to/submaroon/donate
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos eran contenido para adultos sin relacion con la ficha, por lo que se han descartado y no se enlazan. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados al modelo.
