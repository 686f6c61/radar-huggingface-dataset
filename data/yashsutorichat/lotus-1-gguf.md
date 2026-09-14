# yashsutorichat/Lotus-1-GGUF

## Resumen

Lotus-1-GGUF es la version cuantizada en formato GGUF de Lotus-1, un modelo de generacion de texto orientado a roleplay y conversacion con personajes desarrollado por yashsutorichat y utilizado como motor conversacional detras de Sutorichat (sutorichat.com). Se distribuye especificamente para su uso en llama.cpp, KoboldCpp, LM Studio y text-generation-webui, con una plantilla de chat integrada que funciona por defecto en modo "non-thinking".

Arquitectonicamente es un modelo de mezcla de expertos (MoE) con 34.660.610.688 parametros totales (~34,7B) y aproximadamente 3B parametros activos por token, lo que le permite decodificar a velocidad de un modelo pequeno mientras mantiene la capacidad de uno grande. Segun las etiquetas del repositorio, la arquitectura esta basada en Qwen3.5. La model card recomienda cargarlo con una ventana de contexto de 32 768 tokens, anadiendo entre 2 y 3 GB adicionales de KV cache a ese presupuesto.

Su relevancia practica reside en el desglose de cuantizaciones publicado: desde Q3_K_M (~16 GB) hasta Q8_0 (~37 GB) y BF16 partido (~70 GB), con soporte para offload parcial de GPU gracias a la ubicacion de los expertos. Esto permite ejecutarlo en tarjetas consumer de 12 GB combinadas con RAM del sistema, algo poco habitual en modelos de este tamano total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), basado en Qwen3.5 |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 32 768 tokens (valor recomendado en la model card) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (partido) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); BF16 en GGUF partido para re-cuantizacion |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) de tipo transformer, con 34.660.610.688 parametros totales de los que solo unos 3B se activan por token. Esta configuracion explica la afirmacion de la model card de que "el quant que elijas depende de lo que quepa en memoria, no de la velocidad": el coste de decodificacion se aproxima al de un modelo de 3B activos, mientras que el espacio en disco y en VRAM lo determina el total de parametros. Las etiquetas del repositorio lo vinculan a la familia Qwen3.5, aunque la informacion disponible no detalla la configuracion exacta de expertos, el numero de capas ni la dimension del modelo.

Respecto al entrenamiento, la model card de esta version GGUF no incluye detalles: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste. La propia card remite a la ficha del modelo base, Lotus-1, para esos datos. La conversion se realizo con `convert_hf_to_gguf.py` (bf16) y `llama-quantize`, sin matriz de importancia (importance matrix). La plantilla de chat incrustada en el GGUF usa ChatML con el modo thinking desactivado por defecto, incluyendo un bloque `<think></think>` vacio que forma parte obligatoria del formato en modo Text Completion.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y encarnacion de personajes (character roleplay).
- Mantenimiento de continuidad narrativa en conversaciones de multiples turnos.
- Respeto de fichas de personaje (character cards) estructuradas con tagline, personalidad en prosa y persona del usuario.
- Formato de prompt ChatML compatible con plantillas de SillyTavern y otros frontends conversacionales.
- Modo "non-thinking" por defecto, con el bloque `<think>` vacio integrado en el prefijo del asistente.
- Soporte de contexto largo: la model card recomienda 32 768 tokens, con un bloque de memoria intra-conversacion en el prompt de produccion.
- Capacidades multilingues: unicamente declarado el ingles (en).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling o function calling.

## Casos de uso

- Roleplay conversacional en SillyTavern: la model card incluye presets de contexto, instruct y samplers (`Lotus-1.context.json`, `Lotus-1.instruct.json`, `Lotus-1.textgen.json`) para cargar el modelo con 32k de contexto y obtener directamente el formato de prompt que espera, sin necesidad de editar plantillas a mano.
- Backend de aplicaciones de chat con personajes: dado que es el modelo detras de Sutorichat, sirve como motor conversacional para productos de entretenimiento conversacional donde cada personaje tiene una ficha persistente y una memoria de la conversacion.
- Despliegue local en hardware consumer: la tabla de cuantizaciones permite elegir el fichero segun la VRAM disponible (Q3_K_M en 16 GB, Q4_K_M en 24 GB) y usar offload parcial de capas con `--n-gpu-layers`, por lo que una GPU de 12 GB con 32 GB de RAM puede ejecutar Q4_K_M a velocidad utilizable.
- Escritura creativa y narrativa asistida: el modelo mantiene el personaje y la continuidad entre turnos con temperatura 0.9, lo que encaja en herramientas de co-escritura de ficcion donde se quiere una voz de personaje consistente.
- Prototipado de agentes conversacionales con personalidad fija: el formato ChatML y el bloque `<think>` vacio hacen que el comportamiento sea predecible y facil de integrar en pipelines de inferencia locales con llama.cpp o KoboldCpp.
- Servicio de generacion de texto autoalojado: mediante `llama-server` con `--jinja` se puede exponer una API compatible con clientes de chat, integrable en un backend propio sin depender de proveedores externos, gracias a la licencia MIT.
- Base para ajuste fino sobre un dominio concreto de conversacion: el fichero BF16 partido (~70 GB) esta pensado para re-cuantizar o servir de punto de partida en procesos posteriores de adaptacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- Q3_K_M (~16 GB): cabe en 16 GB de VRAM o en 24 GB de RAM.
- Q4_K_S (~21 GB): orientado a 24 GB de VRAM.
- Q4_K_M (~22 GB): recomendado por el autor; 24 GB de VRAM.
- Q5_K_M (~26 GB): requiere 32 GB de memoria.
- Q6_K (~29 GB): 32 GB, descrito como practicamente sin perdida.
- Q8_0 (~37 GB): 48 GB de memoria.
- BF16 partido (~70 GB): pensado para re-cuantizacion.
- Los tamanos anteriores no incluyen la KV cache; a 32 768 tokens de contexto hay que sumar entre 2 y 3 GB adicionales.
- Offload parcial de GPU: una tarjeta de 12 GB junto con 32 GB de RAM ejecuta Q4_K_M a velocidad utilizable ajustando `--n-gpu-layers`. El offload de expertos funciona bien segun el autor.
- Opciones de despliegue: KoboldCpp (`koboldcpp --model ... --contextsize 32768 --gpulayers 99`), llama.cpp (`llama-server -m ... -c 32768 -ngl 99 --jinja`), LM Studio (contexto a 32768 en los ajustes del modelo) y text-generation-webui.
- Latencia y throughput: no se publican cifras concretas. La model card indica que el modelo decodifica "a velocidad de modelo pequeno" por tener solo ~3B parametros activos, y que la eleccion de cuantizacion afecta a la memoria, no a la velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de fichas tecnicas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo pertenece a la categoria de MoE de ~30B totales con ~3B activos (familia Qwen3.5 segun las etiquetas), un segmento en el que compiten otras propuestas de mezcla de expertos del mismo orden de tamano, pero no se aportan cifras de rendimiento, contexto ni licencia de esas alternativas en la documentacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lotus-1-GGUF | 34,7B totales / ~3B activos | 32 768 tokens (recomendado) | MIT | GGUF en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; la model card remite a la ficha del modelo base para limitaciones, que no se incluye en los datos proporcionados.
- Temperatura minima: el autor advierte que por debajo de 0.8 el modelo empieza a repetir entre turnos. La penalizacion de repeticion, no la temperatura, es el parametro que controla los bucles.
- Idiomas: solo se declara ingles. No hay evidencia de soporte de castellano ni de otros idiomas.
- Formato estricto: en modo Text Completion el prefijo del asistente debe incluir el bloque `<think></think>` vacio; omitirlo altera el comportamiento. Los presets de instruct lo insertan automaticamente.
- Plantilla "non-thinking": cualquier cargador que lea la plantilla incrustada en el GGUF generara el prompt correcto, pero forzar el modo thinking no esta soportado segun la informacion disponible.
- Licencia: MIT, lo que permite uso comercial, aunque conviene verificar la ficha del modelo base por si hubiera condiciones adicionales no reflejadas aqui.
- Datos de entrenamiento ausentes: no se conocen la composicion del dataset ni el proceso de alineacion, lo que dificulta evaluar riesgos de sesgo o de contenido inapropiado en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yashsutorichat/Lotus-1-GGUF
- Modelo base: https://huggingface.co/yashsutorichat/Lotus-1
- Sutorichat: https://sutorichat.com
- Presets de SillyTavern incluidos en el repositorio: `sillytavern/Lotus-1.context.json`, `sillytavern/Lotus-1.instruct.json`, `sillytavern/Lotus-1.textgen.json`
- Plantilla de prompt de produccion: `PROMPT_TEMPLATE.md` (en el repositorio)
- Script auxiliar de construccion de prompt: `lotus_prompt.py` (en el repositorio)
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
