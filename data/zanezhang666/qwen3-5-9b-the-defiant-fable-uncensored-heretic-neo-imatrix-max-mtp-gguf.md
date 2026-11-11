# zanezhang666/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantizacion GGUF del modelo DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, un fine-tune multi-etapa construido sobre la familia Qwen 3.5 de 9B parametros. El autor del repositorio de cuantizacion es zanezhang666, mientras que el modelo base y el trabajo de fine-tune corresponden a DavidAU y Nightmedia. El objetivo declarado del fine-tune es elevar la inteligencia general y el seguimiento de instrucciones respecto al modelo base, y se presenta como un modelo "heretic" (abliterated/uncensored) entrenado tras eliminar las restricciones de rechazo.

El modelo resuelve el problema de disponer de un 9B con razonamiento y creatividad de gama alta que quepa en hardware de consumo, ofreciendo cuantizaciones NEO Imatrix y variantes MTP (multi-token prediction) para acelerar la inferencia. La ficha del autor afirma que supera siete benchmarks criticos frente a Qwen 3.5 9B, Qwen 3.5 27B, Qwen 3.6 35B-A3B y, en algunos casos, iguala a Qwen 3.6 27B en cuantizacion de 4 y 8 bits.

La relevancia actual radica en la combinacion de tamano contenido (8.953.803.264 parametros totales), licencia Apache 2.0, soporte de modo thinking y una orientacion explicita a escritura creativa, ficcion, roleplay y codigo sin censura. El repositorio ocupa 204.9 GB por la gran cantidad de variantes de cuantizacion y modos incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5), con MTP (multi-token prediction) en las variantes MTP |
| Parametros totales | 8.953.803.264 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el autor menciona mejora de rendimiento en contexto largo por NEO Imatrix, sin cifra) |
| Tipos de cuantizacion | GGUF regulares y MTP; citados explicitamente Q4_K_S, Q6, Q8, mxfp8, mxfp4; tensor de salida a 16 bits; tensores MTP en Q8_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones regulares y MTP); el modelo base en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen 3.5 con 8.953.803.264 parametros. Sobre esa base, DavidAU y Nightmedia realizaron un fine-tune multi-etapa y un merge multi-modelo en hardware local, partiendo de varios fine-tunes propios de 9B de Qwen 3.5. El proceso incluye una fase "heretic" (abliterated) previa al entrenamiento posterior, de modo que el modelo resultante acepta peticiones sin rechazo. Las variantes MTP incorporan prediccion multi-token para acelerar la decodificacion.

Las cuantizaciones son NEO Imatrix, que segun el autor mejoran la precision entre un 2 y un 4 por ciento respecto a GGUF normales y el rendimiento en contexto largo. Ademas, el tensor de salida (entre el 10 y el 20 por ciento de la salida) se mantiene a precision completa de 16 bits en todas las cuantizaciones, y los tensores MTP se fijan en Q8_0. El bloque de thinking/razonamiento se ha compactado y, segun el autor, es mas potente en muchos casos. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto, razonamiento y modo thinking con bloque de razonamiento compactado.
- Codigo y matematicas, con etiqueta explicita "coder" en el modelo.
- Escritura creativa, ficcion y roleplaying.
- Capacidad multimodal image-text-to-text segun el pipeline declarado.
- Seguimiento de instrucciones reforzado respecto al base, objetivo central del fine-tune.
- Modos de razonamiento e instruct conmutables en caliente via API y a nivel de chat/mensaje en las variantes Q6/Q8 "plusIQ" (5 modos de razonamiento y 5 de instruct, incluidos Spoon y Einstein, con cero tokens de razonamiento en instruct).
- Modelo sin censura (heretic/abliterated): no rechaza peticiones.
- Multilingue limitado a ingles y chino.
- No se confirma en la informacion disponible soporte de tool calling ni de agentes multi-paso, aunque existe una version "tools" en Q6 y Q8 segun el autor.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo esta afinado especificamente para creatividad y ficcion, con modo thinking para planificar tramas y modo instruct para redactar sin tokens de razonamiento.
- Roleplay y personajes conversacionales: el caracter uncensored y el entrenamiento en roleplaying permiten mantener personajes sin rechazos, con contexto multi-turno gestionado por el servidor de inferencia.
- Generacion de codigo asistida: la etiqueta coder y el seguimiento de instrucciones mejorado lo hacen util para autocompletado y explicacion de codigo en editores locales con llama.cpp u Ollama.
- Razonamiento local en hardware de consumo: con cuantizacion Q4_K_S cabe en GPUs de gama alta de consumo y permite desplegar razonamiento sin depender de la nube.
- Prototipado de asistentes sin filtros para investigacion: util para estudiar comportamiento de modelos abliterated y comparar con el base no heretic en tareas controladas.
- Despliegue en produccion de bajo coste: la licencia Apache 2.0 permite uso comercial; las variantes MTP aceleran el throughput en servidores con llama.cpp o LMStudio.
- Traduccion y generacion bilingue ingles-chino: los dos idiomas declarados cubren casos de documentacion tecnica y atencion al cliente en esos mercados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (modo instruct; arc/c, arc/e, boolq, hswag, obkqa, piqa, wino):

| Modelo / cuantizacion | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B bf16 | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Defiant-Fable 9B mxfp8 | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Defiant-Fable 9B mxfp4 | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct mxfp8 | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.8-27B mxfp8 | 0.591 | 0.782 | 0.896 | 0.746 | 0.448 | 0.801 | 0.711 |
| Qwen3.8-27B mxfp4 | 0.581 | 0.771 | 0.889 | 0.738 | 0.442 | 0.798 | 0.713 |
| Qwen3.6-27B-Instruct mxfp8 | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.5-27B-Instruct mxfp8 | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |
| Qwen3.6-35B-A3B-Instruct mxfp8 | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |

El autor senala 640 en ARC-C tanto en 8 como en 4 bits y afirma que el modelo supera siete de siete benchmarks frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, e iguala a Qwen 3.6 27B en algunos casos. Los resultados son autodeclarados y no verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en Q4_K_S (4 bits), 8-10 GB en Q6, 10-12 GB en Q8; el bf16 completo requiere unos 18 GB.
- GPU recomendadas: RTX 4090, RTX 5090 y GPUs de 16-24 GB para cuantizaciones altas; A100 y H100 para despliegue en servidor con bf16 o multiples instancias.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 y RTX 5090 con cuantizaciones Q4 a Q8.
- Opciones de despliegue: llama.cpp, Ollama, LMStudio, vLLM (con soporte GGUF) y TGI segun compatibilidad; el autor probo en LMStudio.
- Latencia y throughput: en Q4_K_S regular alrededor de 130 t/s; en MTP con aceptacion del 60 por ciento y 2 tokens, mas de 185 t/s (RTX 5090, Windows 11, LMStudio). El autor advierte que temperaturas superiores a 1 y repetition penalty distinto de 1 degradan el MTP, y que si la aceptacion de tokens baja del 50 por ciento conviene usar cuantizaciones regulares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (arc/c mxfp8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este) | 8.95B | No disponible | 0.647 | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B-Instruct (base) | 9B | No disponible | 0.571 | Apache 2.0 | HF |
| Qwen3.5-27B-Instruct | 27B | No disponible | 0.557 | Apache 2.0 | HF |
| Qwen3.6-35B-A3B-Instruct (MoE) | 35B totales, 3B activos | No disponible | 0.581 | Apache 2.0 | HF |

Frente al base no heretic de 9B, este fine-tune gana entre 6 y 12 puntos en arc/c, arc/e y obkqa. Frente a modelos de 27B y 35B-A3B supera en arc/c y arc/e segun los datos del autor, aunque queda por debajo en hswag y wino frente a Qwen 3.6 27B.

## Limitaciones y advertencias

- Modelo sin censura (heretic/abliterated): puede generar contenido ofensivo, ilegal o danino; no apto para despliegue publico sin moderacion externa.
- Riesgo de alucinacion inherente a modelos de 9B; el autor advierte que superar benchmarks no implica superar al 27B en todas las tareas.
- Sesgos no documentados en la informacion disponible; el entrenamiento heretic puede alterar el comportamiento en dominios sensibles.
- Idiomas limitados a ingles y chino; el castellano no esta declarado como soportado.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros traslada la responsabilidad legal al desplegador.
- Los benchmarks son autodeclarados por el autor y no se han verificado de forma independiente.
- El rendimiento MTP depende de la temperatura y del repetition penalty; configuraciones fuera de los valores recomendados degradan la velocidad.
- El repositorio ocupa 204.9 GB por la multitud de variantes; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Hugging Face (cuantizacion GGUF): https://huggingface.co/zanezhang666/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Modelos en tendencia de DavidAU: https://huggingface.co/models?sort=trending&search=DavidAU
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelo relacionado 27B Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
