# XcaliburMoon/deepseek-v4.1-flash-1017-gguf

## Resumen

DeepSeek-V4.1-Flash-1017 GGUF es una conversión al formato GGUF, realizada por el usuario XcaliburMoon, del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, pensada para su ejecución con llama.cpp. Se trata de un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE): 40 bloques MoE, 384 expertos enrutados de los cuales 6 se activan por token más 1 experto compartido, y un tamaño oculto de 5120. El total de parámetros, según los metadatos de safetensors, es de 748.494.643.824 (unos 748B).

La característica más distintiva es un módulo denominado "engram": un tensor `per_layer_token_embd` de 196,6B parámetros con forma 768.022.850 x 256, indexado por un vocabulario de 16M entradas sobre 4-grams. Este módulo domina el tamaño de los ficheros cuantizados y marca un suelo físico por debajo del cual la conversión deja de funcionar (Q4_K para el engram).

Es relevante ahora porque documenta no solo una conversión exitosa, sino también un resultado negativo riguroso: la variante `rq2` (284,7 GB) está rota y se publica como registro de un fallo, con un análisis de aislamiento que demuestra que el cuello de botella está en el engram cuantizado a Q3_K. La variante recomendada es `q4/` (429,2 GB). El contexto anunciado es de 1.048.576 tokens, aunque solo se ha probado hasta 4.096. La conversión es de solo texto: la torre de visión del checkpoint original multimodal no se ha convertido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (40 bloques, 384 expertos enrutados, 6 activos por token, 1 experto compartido) + módulo engram |
| Parametros totales | 748.494.643.824 (748,49B) |
| Parametros activos | no disponible (6 expertos enrutados + 1 compartido por token; total exacto no publicado) |
| Longitud de contexto | 1.048.576 anunciada (solo probada hasta 4.096) |
| Tipos de cuantizacion | Expertos: MXFP4 en todas las carpetas; engram: Q8_0, Q6_K, Q5_K, Q4_K, Q3_K segun variante; rq2 usa expertos Q2_K (rota) |
| Idiomas soportados | Ingles (etiquetado `en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp); repo total 2.458,1 GB repartidos en 6 carpetas independientes |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. Por un lado, 40 bloques MoE con 384 expertos enrutados (6 activos por token) y 1 experto compartido, con tamaño oculto 5120. Los expertos suman 543,6B parámetros y se almacenan en MXFP4 en todas las variantes, por lo que su peso en disco (288 GB incluidos escalas de bloque) es idéntico en toda la escalera de cuantización. Por otro lado, el módulo engram: un tensor `per_layer_token_embd` de 196,6B parámetros (768.022.850 x 256) indexado por un vocabulario de 16M entradas sobre 4-grams, que constituye entre el 41% (Q8_0) y una proporción mayor del tamaño de cada fichero y que debe residir en RAM del sistema durante la inferencia.

Sobre los datos y el proceso de entrenamiento del modelo base, la model card no aporta información: número de tokens, composición del dataset ni uso de RLHF/DPO no disponibles. Sí está documentado el proceso de cuantización: `q8` es la fuente de la que se requantizaron el resto de variantes; `rq2` se generó con `llama-quantize --allow-requantize` a Q2_K para expertos y Q3_K para el engram, y se demostró que el engram a Q3_K rompe la vía de instrucciones del modelo (repite el prompt y emite andamiaje de plantilla), mientras que los expertos a Q2_K con engram limpio (variante `rq2e8`) funcionan parcialmente pero caen en bucles de repetición tras unos 400 tokens. El suelo establecido para el engram es Q4_K.

## Capacidades

- Generacion de texto en ingles: la ruta de completado en crudo produce ingles fluido incluso en la variante rota `rq2`; `q8` y `q4` responden correctamente a un sondeo de dificultad alta con plantilla de chat aplicada.
- Seguimiento de instrucciones con plantilla de chat (via `--jinja` en llama-server), verificado en `q8` y `q4`.
- Arquitectura MoE con enrutamiento disperso (6 expertos activos de 384 por token), orientada a inferencia eficiente.
- Modulo engram sobre 4-grams con vocabulario de 16M entradas, una via adicional de recuperacion de informacion a nivel de token.
- No soporta entrada de imagen: la torre de vision del checkpoint original multimodal no se ha convertido.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes y thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con arquitecturas MoE de gran escala en local: la conversion GGUF permite cargar el modelo con llama.cpp en una unica GPU de 48 GB (A40) mas RAM del sistema, algo inviable con los pesos originales en safetensors.
- Investigacion sobre cuantizacion extrema: el repo documenta con detalle que partes del modelo (engram frente a expertos) toleran cada nivel de cuantizacion, util como caso de estudio para quien desarrolle pipelines de requantizacion.
- Servicios de generacion de texto en ingles de alta calidad con hardware moderado: con la variante `q4` se obtienen 13,2-14,0 tokens/s en una A40, suficiente para chat interactivo de un usuario.
- Pruebas de contexto largo teorico: el contexto anunciado de 1.048.576 tokens permite, en principio, explorar ventanas muy amplias, aunque con la reserva de que solo se ha validado hasta 4.096.
- Reproduccion de resultados negativos en evaluacion de cuantizacion: la carpeta `rq2` sirve como material de referencia para estudiar como la cuantizacion del engram a Q3_K degrada la via de instrucciones.
- Integracion en flujos basados en llama.cpp/Ollama para inferencia autoalojada sin dependencia de APIs externas, con licencia MIT sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, perplexity, KL) en la informacion disponible; la propia model card lo reconoce explicitamente. Los unicos datos medidos son de throughput de decodificacion:

| Modelo | `-cmoe`, sin pinning | 4 bloques fijados en VRAM | 8 bloques fijados en VRAM |
|---|---|---|---|
| `q8` | 10,5 t/s | 11,6 t/s | no ejecutado |
| `q4` | 13,2 t/s | 14,0 t/s | no ejecutado |
| `rq2` | 16,8 t/s | 15,9 t/s (6 fijados) | 19,8 t/s |
| `rq2e8` | 20,8 t/s | no ejecutado | 19,5 t/s |

Condiciones de medida: A40 48 GB, 2 TB de RAM de sistema, 32 hilos, contexto 4096, una peticion, 128 tokens generados, temperatura 0, llama.cpp 0.7.0-dev, CUDA 12.9. Existe una anomalia no resuelta: `rq2e8` (409,5 GB) decodifica mas rapido que `rq2` (284,7 GB), posiblemente por el coste de dequantizacion Q2_K en CPU.

## Requisitos de hardware

- VRAM: no basta por si sola para ningun variant en su totalidad; el patron de despliegue documentado usa una GPU de 48 GB (A40) para la ruta densa y parte de los expertos, con el resto de expertos y el engram (84,5 a 208,9 GB) en RAM del sistema.
- RAM del sistema: se documentan 2 TB; el engram debe residir siempre en CPU (`-ot 'per_layer_token_embd\.weight=CPU'`).
- GPU recomendadas: A40 48 GB es la unica verificada; por tamaño de ficheros (284,7 a 506,7 GB), una RTX 4090 (24 GB) solo cubriria una fraccion minima de expertos fijados.
- Espacio en disco: descargar una sola carpeta, no el repo completo. `q4` (recomendada): 429,2 GB; `q8`: 506,7 GB; `q3`: 403,6 GB; `q2`: 376,7 GB; `rq2`: 284,7 GB (rota); `q6`: 457,1 GB (sin probar).
- Despliegue: llama.cpp (llama-server con `-ngl 99 -cmoe --jinja`); compatibilidad con Ollama, vLLM o TGI no disponible en la informacion proporcionada.
- Latencia/throughput: 13,2-14,0 t/s con `q4` en A40; `q8` 10,5-11,6 t/s. No hay datos de latencia de primer token.
- Advertencia: no usar `rq2/` ni presumiblemente `q2/`; `q3/` y `q6/` no han sido probadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion minima viable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 GGUF (este) | 748,49B (MoE + engram) | 1.048.576 anunciada | 429,2 GB (q4) | MIT | GGUF publico, solo texto |
| DeepSeek-V4.1-Flash-1017 (base) | 748,49B | no disponible | pesos originales | no disponible | HuggingFace, multimodal |
| deepseek-ai/DeepSeek-V3 | 671B (MoE, 37B activos) | 128K | no disponible | licencia propia de DeepSeek | HuggingFace, pesos originales |

La comparativa se limita al modelo base y a la referencia mas cercana conocida de DeepSeek; datos de rendimiento comparado no disponibles.

## Limitaciones y advertencias

- Solo texto: la torre de vision del checkpoint original no se ha convertido; no hay entrada de imagen.
- Contexto de 1.048.576 tokens anunciado pero sin validar: nada se ha probado mas alla de 4.096 tokens.
- Sin evaluacion de calidad: no existe perplexity, KL ni benchmarks para ninguna variante excepto la verificacion cualitativa de `q8` y `q4`; toda variante distinta de `q8` debe asumirse a distancia desconocida del modelo de referencia.
- `rq2/` esta rota: con plantilla de chat no responde, repite el prompt y emite andamiaje de plantilla hasta max_tokens. `q2/` comparte el engram Q3_K de rq2 y debe tratarse como rota salvo demostracion en contrario. `rq2e8` cae en bucles de repeticion tras unos 400 tokens.
- Suelo fisico de cuantizacion: el engram no funciona por debajo de Q4_K; no es posible reducir el tamaño mucho mas alla de `q3/`.
- Idioma: etiquetado solo para ingles; el comportamiento en otros idiomas no esta documentado.
- Requisitos de RAM extremos (del orden de 2 TB de sistema) que lo hacen inviable fuera de estaciones de trabajo o servidores muy dotados.
- Riesgo de alucinacion, sesgos y restricciones de uso comercial: no disponible en la informacion proporcionada; la licencia MIT del repo no impone restricciones, pero la licencia del modelo base debe verificarse por separado.
- Anomalia de rendimiento no explicada: `rq2e8` decodifica mas rapido que `rq2` pese a ser mayor; causa probable (coste de dequantizacion Q2_K en CPU) no aislada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/XcaliburMoon/deepseek-v4.1-flash-1017-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper, blog oficial, demo y otros enlaces: no disponible en la informacion proporcionada.
