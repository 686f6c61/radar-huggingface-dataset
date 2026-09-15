# voice-box/shakespeare

## Resumen

voice-box/shakespeare es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B orientado a responder siempre en ingles moderno temprano, con vocabulario isabelino, pronombres thee/thou/thy y cierto ritmo yambico. Lo publica el usuario voice-box, con la model card atribuida a QuillBytes (huggingface.co/QuillBytes), y esta pensado explicitamente para entretenimiento: "trained for fun and entertainment purposes only".

El interes practico no esta en su calidad como modelo generalista, sino en que es un ejemplo pequeno y ligero de adaptacion de estilo y personalidad ("persona") sobre una base moderna. El entrenamiento se anuncia como LoRA con tooling de Unsloth, y el repositorio distribuye pesos en safetensors y GGUF cuantizado en 4 bits, lo que permite ejecutarlo en local con Ollama o LM Studio.

Hay que manejar con cautela las cifras del repositorio: los safetensors declaran 333.514.240 parametros, muy por debajo de los aproximadamente 4.000 millones del modelo base declarado (Qwen/Qwen3-4B). Esa discrepancia sugiere que la parte en safetensors podria corresponder a un adaptador o a un componente parcial y no al modelo completo, o bien un error de subida del autor. La informacion disponible no permite resolverlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen/Qwen3-4B (no se detallan capas ni dimensiones en la informacion disponible) |
| Parametros totales | 333.514.240 segun los safetensors del repositorio; el modelo base declarado es Qwen/Qwen3-4B (~4.000 millones). Dato contradictorio, ver advertencias |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-4B) |
| Tipos de cuantizacion | GGUF 4 bits (Q4_K_M) y GGUF F16 segun los ficheros del repositorio |
| Idiomas soportados | en (ingles; salida forzada en ingles moderno temprano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only denso. Segun las etiquetas del repositorio, el ajuste se realizo mediante LoRA con la libreria Unsloth (tags: unsloth, lora, fine-tuned), y el resultado se distribuye tanto en safetensors como en GGUF cuantizado. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no estan disponibles.

Tampoco se documentan innovaciones tecnicas propias mas alla del propio ajuste de estilo. La finalidad declarada es que el modelo no rompa nunca el personaje: responde sistematicamente en Early Modern English con lexico isabelino y pronombres arcaicos. Las etiquetas incluyen qwen3_5 e image-text-to-text, y el fichero shakespeare-F16.gguf se describe como "multimodal projector", lo que apunta a una posible base multimodal; sin embargo, el pipeline declarado es text-generation y la informacion disponible no permite confirmar capacidades de vision.

## Capacidades

- Generacion de texto con estilo isabelino consistente: mantiene el personaje de forma persistente por diseno.
- Uso de lexico, gramatica y pronombres del ingles moderno temprano (thee, thou, thy, hath, doth, etc.).
- Redaccion con cierto ritmo yambico cuando el prompt lo favorece.
- Conversacion multi-turno en el registro shakespeariano (sujeta a la ventana de contexto del modelo base).
- Generacion de texto general heredada de Qwen3-4B, reestilizada (razonamiento, explicaciones, codigo), aunque deformada por el registro arcaico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; el modelo esta entrenado y orientado unicamente al ingles.
- Vision, audio u otras modalidades: no confirmado; existe una etiqueta image-text-to-text y un fichero descrito como proyector multimodal, pero el pipeline declarado es text-generation.

## Casos de uso

- Demostraciones interactivas de estilo: desplegar el modelo en una web o demo para que los usuarios conversen con un "Shakespeare" que nunca rompe el personaje, aprovechando su GGUF 4 bits para ejecucion local.
- Ludotecas y experiencias de entretenimiento: integrarlo como personaje NPC en videojuegos o experiencias de realidad aumentada con tematica isabelina, donde el estilo constante es el objetivo y no la precision factual.
- Material didactico para clases de literatura: generar ejemplos de parlamento isabelino para ilustrar recursos retoricos, siempre como apoyo y con supervision docente.
- Escritura creativa y generacion de borradores: producir bocetos de monologos, sonetos o dialogos teatrales que el autor luego pule, aprovechando el registro arcaico consistente.
- Marketing tematico y redes sociales: generar publicaciones con voz isabelina para campanas de teatro, festivales renacentistas o eventos historicos.
- Chatbot de museo o casa historica: atender preguntas de visitantes en un tono acorde con la exhibicion, reconociendo que el contenido debe revisarse por posibles alucinaciones.
- Juguete conversacional local y offline: ejecutarlo en un portatil con Ollama o LM Studio como demo de ajuste de personalidad sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a programas de television y herramientas de cambio de voz, sin relacion con el modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato oficial. Como referencia orientativa segun el tamano declarado: si el modelo efectivo fuese de ~333 millones de parametros, cabria en menos de 1 GB en 4 bits; si fuese el Qwen3-4B completo (~4.000 millones), en cuantizacion GGUF Q4_K_M rondaria los 2,5-3 GB y en FP16 unos 8 GB.
- GPU recomendadas: no especificadas por el autor. Para el escenario de 4B, una RTX 3060 de 12 GB o superior bastaria para 4 bits; para FP16 se recomendaria una GPU con 10-12 GB o mas.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio (3,5 GB) y la existencia de un GGUF de 4 bits. Modelos concretos no confirmados.
- Opciones de despliegue: Ollama (recomendado en la model card) y LM Studio, ambos mediante GGUF. Tambien es compatible con llama.cpp por el formato GGUF. vLLM, TGI u otros servidores no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| voice-box/shakespeare | 333,5 M declarados en safetensors (base Qwen3-4B) | no disponible | apache-2.0 | HuggingFace (safetensors y GGUF) | Ajuste de estilo isabelino, uso recreativo |
| Qwen/Qwen3-4B | ~4.000 M | no disponible en esta ficha | apache-2.0 | HuggingFace | Modelo base; proposito general |
| Otros fine-tunes de "persona" sobre Qwen3 o Llama 3 | variable (1-8 B) | variable | habitualmente apache-2.0 o similar | HuggingFace | Sin datos de benchmarks comparables en la informacion disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- El propio autor indica que el modelo es solo para diversion y entretenimiento; no deberia usarse en produccion para tareas que requieran precision.
- Responde siempre en estilo shakespeariano: no es posible obtener respuestas en ingles estandar ni en otros idiomas.
- Riesgo de alucinacion elevado en contenido factual, agravado por el registro arcaico, que puede enmascarar errores con una forma verosimil.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitacion idiomatica: solo ingles; no hay soporte multilingue declarado.
- Discrepancia de parametros: los safetensors declaran 333,5 M frente a los ~4.000 M del modelo base, lo que puede indicar que la subida esta incompleta o que el recuento corresponde a un componente parcial. Conviene verificar antes de integrarlo.
- Ambiguedad sobre multimodalidad: las etiquetas y el fichero descrito como proyector multimodal no se corresponden con el pipeline text-generation declarado; tratar la vision como no confirmada.
- Licencia apache-2.0: permite uso comercial, pero al derivar de Qwen/Qwen3-4B conviene revisar los terminos del modelo base.
- Sin descargas ni likes y con fecha de creacion reciente: no hay validacion de la comunidad ni historial de uso.
- Inconsistencia en la model card: el ejemplo de Ollama referencia Qwen3.5-4B, mientras que el modelo base declarado en los metadatos es Qwen/Qwen3-4B.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/voice-box/shakespeare
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Autor de la model card (QuillBytes): https://huggingface.co/QuillBytes
- Busqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs, repositorios o demos asociados. El resto de enlaces no esta disponible.
