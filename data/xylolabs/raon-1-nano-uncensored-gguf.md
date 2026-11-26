# Xylolabs/Raon-1-nano-Uncensored-GGUF

## Resumen

Raon-1-nano Uncensored GGUF es una distribucion cuantizada en formato GGUF del modelo KRAFTON/Raon-1-nano, publicada por Xylolabs. Se trata de un modelo de lenguaje de aproximadamente 3.130 millones de parametros (3,13 B) al que se le ha aplicado una tecnica de "abliteration": se ha eliminado una direccion de rechazo de los pesos para reducir la tasa de respuestas negativas ante peticiones consideradas sensibles. El resultado es una variante "uncensored" orientada a usos donde el filtrado por defecto del modelo base resulta limitante.

La intervencion es quirurgica y esta documentada: se toma una unica direccion en la capa 16 con el canal 746 anulado y se proyecta fuera de las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22 (51 tensores en total). El embedding, la cabeza de salida y el bloque MTP (multi-token prediction) quedan intactos, aunque el bloque MTP se omite en los ficheros publicados.

Su relevancia practica es doble: por un lado ofrece un modelo pequeno (2-3,4 GB segun cuantizacion) que cabe en GPUs de consumo, y por otro documenta con detalle el impacto de la cuantizacion y del proceso de abliteration sobre la fidelidad respecto a los pesos BF16 originales. La licencia Apache 2.0 facilita su integracion en productos comerciales, aunque requiere un fork especifico de llama.cpp para su ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base KRAFTON/Raon-1-nano), con bloque MTP omitido en los GGUF publicados |
| Parametros totales | 3.130.811.440 (3,13 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens segun la tabla de hardware del autor (con KV en f16) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es KRAFTON/Raon-1-nano, un transformer de 3,13 B de parametros. La model card de esta distribucion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aqui. Lo que si se documenta es la modificacion realizada por Xylolabs: una ablacion de direccion unica (single-direction abliteration) calculada en la capa 16, con el canal 746 anulado, proyectada fuera de 51 tensores distribuidos entre las capas 6 y 22 (proyecciones de salida de atencion, proyecciones down del MLP y proyecciones de entrada por capa).

Una innovacion destacable del modelo base es la presencia de un bloque MTP (multi-token prediction), que permite decodificacion especulativa y por tanto acelerar la generacion. En esta distribucion GGUF el bloque MTP se ha eliminado, de modo que esa ventaja de velocidad no esta disponible en estos ficheros. La cuantizacion se ha generado con imatrix, y el autor publica metricas de divergencia KL y acuerdo top-1 frente a los pesos BF16 originales para cada nivel de cuantizacion, lo que permite evaluar el coste de comprimir el modelo.

## Capacidades

- Generacion de texto conversacional multi-turno en coreano e ingles.
- Razonamiento general y respuesta a instrucciones (modelo afinado para chat).
- Generacion de codigo y matematicas a nivel basico, coherente con un modelo de 3 B.
- Modo "thinking" desactivable: las pruebas de rechazo se realizaron con thinking off, lo que sugiere soporte de razonamiento extendido opcional.
- Comportamiento "uncensored": tasa de rechazo en HarmBench reducida al 0,5 % en Q8_0 frente al 98,5 % del Q8_0 original de KRAFTON.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantilla Jinja en llama-server (`--jinja`).
- No se documenta soporte de tool calling, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como varia la tasa de rechazo antes y despues de una abliteration, con datos cuantitativos (HarmBench 200 prompts, Alpaca 100) y comparacion con los cuants originales de KRAFTON.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo base rechazaria peticiones; el modelo cabe en una RTX 4090 en Q8_0 con contexto de 256K.
- Despliegue en hardware de consumo: con 1,58-3,39 GB por fichero, se puede ejecutar en GPUs de 8-24 GB o incluso en CPU (aunque el build solo-CPU del fork falla con una asercion al cargar estos ficheros, segun el autor).
- Prototipado rapido de asistentes conversacionales en coreano e ingles: el contexto de hasta 256K permite conversaciones largas o analisis de documentos extensos sin truncar.
- Evaluacion de cuantizaciones: las tablas de KL y top-1 por fichero permiten elegir el punto de equilibrio tamano/calidad para un pipeline de inferencia (por ejemplo, Q4_K_M con KL 0,0265 frente a Q8_0 con 0,0060).
- Experimentos de destilacion o generacion de datos sinteticos: un modelo pequeno y permisivo puede generar datasets diversos sin bloqueos por politicas de contenido.
- Pruebas de robustez de sistemas de moderacion: util para generar respuestas que un filtro downstream debe detectar y clasificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 3,39 GB | 0,005994 | 95,64 % | 0,016018 | 94,20 % | 0,5 % | 0,0 % |
| Q6_K | 2,65 GB | 0,009180 | 94,31 % | 0,021124 | 93,10 % | 0,5 % | 0,0 % |
| Q5_K_M | 2,36 GB | 0,013208 | 93,05 % | 0,026456 | 92,39 % | 0,0 % | 0,0 % |
| Q4_K_M | 2,08 GB | 0,026504 | 90,59 % | 0,044721 | 90,45 % | 0,5 % | 0,0 % |
| Q4_K_S | 2,06 GB | 0,030274 | 89,93 % | 0,048429 | 89,55 % | 0,0 % | 0,0 % |
| IQ4_XS | 1,88 GB | 0,039235 | 88,84 % | 0,059420 | 88,57 % | 0,0 % | 0,0 % |
| Q3_K_M | 1,69 GB | 0,087801 | 83,96 % | 0,125945 | 84,28 % | 0,0 % | 0,0 % |
| Q2_K | 1,58 GB | 0,287412 | 73,49 % | 0,363602 | 72,75 % | 3,0 % | 0,0 % |

Como referencia, los cuants equivalentes de KRAFTON mantienen tasas de rechazo del 98,0-98,5 % en HarmBench, lo que confirma que la abliteration es efectiva en todos los niveles de cuantizacion salvo Q2_K, donde sube al 3,0 %.

## Requisitos de hardware

- VRAM estimada: 1,58 GB (Q2_K) a 3,39 GB (Q8_0) para los pesos; el KV cache en f16 para 256K de contexto anade memoria adicional no cuantificada en la model card.
- GPUs recomendadas por el autor: RTX 4090 o RTX 3090 (24 GB) con Q8_0 y 256K de contexto; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM para Q8_0 con contexto corto; el autor lista explicitamente RTX 4090, 3090 y 5090.
- Opciones de despliegue: exclusivamente llama.cpp mediante el fork krafton-ai/llama.cpp, rama `raon-1-nano`, commit b6626358828007d0140d42399705b73bb7a6444b, compilado con CUDA. El build solo-CPU falla con una asercion al cargar estos ficheros. No se menciona compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La omision del bloque MTP implica que no se aprovecha la decodificacion especulativa del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/Raon-1-nano-Uncensored-GGUF | 3,13 B | hasta 256K | Apache 2.0 | GGUF | Abliterated, requiere fork de llama.cpp, sin MTP |
| KRAFTON/Raon-1-nano (cuants oficiales) | 3,13 B | no disponible | Apache 2.0 (segun este repo) | GGUF | Sin abliteration; rechazo 98,0-98,5 % en HarmBench; mejor KL/top-1 en Q8_0 y Q6_K |
| KRAFTON/Raon-1-nano (BF16) | 3,13 B | no disponible | Apache 2.0 | safetensors | Referencia de calidad; incluye bloque MTP |

No se dispone de datos de benchmarks estandar para comparar con otros modelos de 3 B de la misma categoria (Llama 3.2 3B, Qwen2.5 3B, Gemma 2 2B) en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina filtros de seguridad: el modelo respondera a peticiones que el original rechaza, lo que puede producir contenido danino, ilegal o sensible. No es apto para aplicaciones orientadas al publico sin moderacion downstream.
- El proceso de abliteration degrada la fidelidad respecto al BF16: en Q8_0 el KL en WikiText-2 sube de 0,001187 (KRAFTON) a 0,005994, y el top-1 baja de 98,08 % a 95,64 %.
- La cuantizacion Q2_K es claramente deficitaria: KL 0,287 y top-1 73,49 %, con un repunte de rechazos al 3,0 %. No recomendada para produccion.
- Solo soporta coreano e ingles de forma declarada; el rendimiento en castellano no esta documentado.
- Requiere un fork especifico de llama.cpp (rama `raon-1-nano`) y un build con CUDA; el build solo-CPU falla. Esto limita el despliegue en entornos sin GPU y complica la integracion con otras herramientas.
- El bloque MTP esta omitido, por lo que se pierde la decodificacion especulativa del modelo base y el throughput sera menor que el del original.
- Riesgo de alucinacion inherente a un modelo de 3 B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo entrenado principalmente en coreano e ingles, puede presentar sesgos culturales y linguisticos de esos corpus.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a `NOTICE` para los cambios realizados; conviene revisarlo antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-Uncensored-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Fork de llama.cpp requerido: https://github.com/krafton-ai/llama.cpp (rama `raon-1-nano`)
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Raon-1-nano-Uncensored-GGUF/blob/main/LICENSE
- Graficas de precision: https://huggingface.co/Xylolabs/Raon-1-nano-Uncensored-GGUF/resolve/main/accuracy-mean-kl.png y https://huggingface.co/Xylolabs/Raon-1-nano-Uncensored-GGUF/resolve/main/accuracy-top1.png
