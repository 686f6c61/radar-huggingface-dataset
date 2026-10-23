# staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF

## Resumen

Este repositorio no es un modelo nuevo, sino una cuantización extrema del checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario `staccs`. El objetivo es empaquetar un modelo Mixture-of-Experts de gran tamaño (763.000 M de parámetros según la model card) en un único archivo GGUF de 99.116.576.416 bytes (99,1 GB) que quepa en una máquina con 128 GB de memoria unificada, en lugar de requerir un servidor multigráfico de clase 500 GB.

La técnica empleada es cuantización vectorial (VQ) de 8 dimensiones sobre los expertos enrutados: 4096 palabras de código (índices de 12 bits) en las capas 0-13 y 1024 palabras de código (10 bits) en las capas 14-39, con códebook E4M3 compartido por capa; el resto de tensores (atención, expertos compartidos, embeddings y cabeza) va en `q4_K`. Las tablas Engram de n-gramas (2 × 101,5 GB) no se incluyen en el archivo y se leen en tiempo de ejecución desde los shards oficiales, por lo que la descarga total ronda los 302 GB.

Es relevante ahora porque demuestra hasta dónde se puede comprimir un MoE de este tamaño asumiendo pérdida de calidad medible y porque requiere un runtime propio (`ds4-dfm-rs`) con un parche para índices VQ de 10/11/12 bits: no funciona en llama.cpp, vLLM ni Ollama. El coste es explícito: la perplejidad en WikiText-2 pasa de 1,838 a 3,615 y la coincidencia de siguiente palabra con el original cae al 74,5%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con arquitectura Causal Encoder-Decoder (CED) según Apertis; 384 expertos enrutados por capa, tablas Engram de n-gramas (2 × 101,5 GB, externas) y drafter MTP de tres torres |
| Parametros totales | 763.000 M según la model card del autor; 552.000 M según Apertis; los metadatos de safetensors del repo informan 102.247.695.722 (dato no coherente con la model card, ver limitaciones) |
| Parametros activos | no disponible en la model card; Apertis indica 8.000 M para entrada y 16.000 M para salida |
| Longitud de contexto | 1.000.000 tokens según LM Studio y Apertis para el modelo base; no confirmado en la model card del cuantizado |
| Tipos de cuantizacion | VQ 8-dim, 12 bits (capas 0-13); VQ 8-dim, 10 bits (capas 14-39); MTP en VQ 10 bits; resto en `q4_K`; ~1,4 bits por peso de media en el subconjunto de ~566.000 M parámetros sin Engram |
| Idiomas soportados | no disponible |
| Licencia | MIT (artefacto cuantizado); licencia del modelo base no indicada en la información disponible |
| Formato de pesos | GGUF en un único archivo (`DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-q4k-mtpnative.gguf`); requiere shards Engram oficiales en tiempo de ejecución |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa y 40 capas identificables (índices 0-39 en la receta de cuantización). A ello se suman dos componentes propios de la familia V4.1 Flash: un drafter MTP (*multi-token prediction*) de tres torres, que actúa como mecanismo de decodificación especulativa, y las tablas Engram, un almacén de n-gramas de 2 × 101,5 GB que el modelo consulta junto con los pesos. Según Apertis, la arquitectura subyacente es un Causal Encoder-Decoder (CED) con representaciones de texto e imagen entrenadas conjuntamente, lo que explica el soporte multimodal del checkpoint original.

Esta ficha corresponde únicamente al proceso de cuantización, no a un reentrenamiento: no hay datos de entrenamiento, RLHF ni DPO asociados al artefacto. La conversión se hizo desde el checkpoint oficial en la revisión `1bae0e1088993b9b82de08f59de5be5a34e42170` con `fodelf/YoungAi` (`v41_quantize`, commit `7fb26cc`) y calibración cero, mediante el comando `v41_quantize --skel q4k --mtp-vq --vq-nc 1024 --vq-nc-layers 0:14=4096 --vq-shared-cb --vq-cb-fp8`. El autor tuvo que parchear tanto el conversor como el runtime, porque solo aceptaban índices v3 de 13 bits, para admitir anchos de 10, 11 y 12 bits (ancho de índice `min(nbit, 12)` y corrección de la máscara del kernel de persistencia). La fidelidad en el espacio de pesos reportada por el cuantizador es de coseno ≈ 0,911 en capas de 12 bits y ≈ 0,873 en capas de 10 bits.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del checkpoint DeepSeek-V4.1-Flash-1017, con la degradación descrita en la sección de benchmarks.
- Generación de código: en la verificación del autor, produjo una función `nth_prime` correcta por división por tentativa con dos doctests válidos (`nth_prime(1) == 2`, `nth_prime(10) == 29`).
- Entrada de imagen nativa según LM Studio y Apertis para el modelo base; la model card del cuantizado no documenta una verificación específica de visión (el build de Baekpica sí publica un sidecar de visión de ~1 GB, este no).
- Ventana de contexto de hasta 1.000.000 tokens según las fichas del modelo base, sujeta a la memoria disponible en el runtime.
- Modo *thinking* desactivable: las pruebas del autor se hicieron con *thinking* off y decodificación greedy.
- Decodificación especulativa mediante el drafter MTP incluido en el archivo, sin poda ni destilación: los 384 expertos por capa están presentes.
- Consulta a las tablas Engram de n-gramas servidas desde los shards oficiales sin modificar.
- Soporte de *tool calling* y comportamiento de agente: no disponible en la información proporcionada para este artefacto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en cuantización vectorial: el artefacto permite medir el efecto de bajar de 12 a 10 bits en capas concretas (perplejidad 3,615 frente a 1,838 del original) sobre un modelo de 763.000 M, con las tablas Engram como variable fija servida desde los shards originales.
- Inferencia local en una estación de trabajo con 128 GB de memoria unificada: el objetivo declarado es un Ryzen AI Max+ 395 con Radeon 8060S y 96 GB de memoria gráfica variable, lo que permite ejecutar el modelo sin conexión ni coste por token, a 46-54 tok/s en el hardware de referencia.
- Evaluación comparativa de artefactos cuantizados: sirve como punto intermedio entre el checkpoint original (307,2 GB de pesos) y el build de Baekpica (113,6 GB) en pruebas de perplejidad, KL y acuerdo de siguiente palabra con el mismo forward pass oficial.
- Prototipado de pipelines de código en local: la verificación con `nth_prime` y doctests indica que puede generar funciones pequeñas verificables, útil para entornos sin salida a Internet, siempre que se validen las salidas con tests automáticos.
- Docencia y demostración de arquitecturas MoE con Engram: el modelo completo, sin podar, cabe en una sola máquina, lo que facilita explicar enrutamiento de expertos y recuperación de n-gramas en un taller práctico.
- Reproducción de resultados de runtime: dado que necesita `ds4-dfm-rs` parcheado, el artefacto es útil para validar kernels de descompresión VQ de 10 bits y máscaras de persistencia en CUDA (sm_90 probado).
- Análisis de sensibilidad a la anchura de índice: comparar los cosenos 0,911 (12 bits) y 0,873 (10 bits) frente a métricas de tarea permite calibrar cuánta anchura necesita cada bloque de capas.

## Benchmarks y rendimiento

| Métrica (WikiText-2, primeros 2.048 tokens del test, forward pass oficial con Engram) | Original DeepSeek-V4.1-Flash-1017 | Este build |
|---|---|---|
| Perplejidad | 1,838 | 3,615 |
| Coincidencia de siguiente palabra con el original | 100% (referencia) | 74,5% |
| KL medio frente al original | 0 (referencia) | 0,797 |
| Coseno en espacio de pesos, capas de 12 bits (0-13) | 1,0 | ≈ 0,911 |
| Coseno en espacio de pesos, capas de 10 bits (14-39) | 1,0 | ≈ 0,873 |

Datos de ejecución medidos por el autor en 1× H200 NVL (CUDA 13, sm_90), greedy, *thinking* off: copia de pesos a la GPU en 5,2 s, servidor listo en 10 s, tiempo hasta el primer token de 0,24-0,31 s y decodificación sostenida de 46-54 tok/s en respuestas de 400 tokens. El build de Baekpica (113,6 GB, VQ de 13/12 bits) alcanza 54-66 tok/s en un DGX Spark y, en la medición de YoungAi sobre el modelo base, ~79 de cada 100 palabras coincidentes, aunque con una ventana de texto distinta.

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 99,1 GB para el GGUF más 203,1 GB de tablas Engram en shards oficiales; total en disco ~302,2 GB y descarga equivalente.
- VRAM/GPU: el autor indica una GPU con ≥104 GB; probado en 1× H200 NVL. No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos del tamaño de los pesos.
- Memoria unificada: objetivo de diseño de 128 GB (Ryzen AI Max+ 395 / Radeon 8060S con 96 GB de memoria gráfica variable). El autor marca esta configuración como no probada en Linux nativo para este build.
- Motores de despliegue: exclusivamente `ds4-dfm-rs` / `ds4-server` con el parche para índices VQ de 10/11/12 bits y los shards Engram montados. llama.cpp, vLLM y Ollama no pueden cargar el archivo.
- Latencia: TTFT de 0,24-0,31 s y 46-54 tok/s en decodificación sostenida con un solo stream en H200 NVL; no hay cifras publicadas de throughput agregado por lotes.
- Requisitos de software: CUDA 13 y arquitectura sm_90 para la configuración validada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos en disco | Total en disco | Perplejidad WikiText-2 | Licencia | Hardware |
|---|---|---:|---:|---:|---|---|---|
| Este build (staccs, VQ 12/10 bits) | 763.000 M (card) | 1.000.000 tokens (modelo base) | 99,1 GB | ~302,2 GB | 3,615 | MIT (artefacto) | 1 GPU ≥104 GB o 128 GB unificados |
| Baekpica VQ GGUF | 763.000 M (card) | mismo modelo base | 113,6 GB | ~318 GB | no publicada | no disponible en la información | DGX Spark de 128 GB |
| DeepSeek-V4.1-Flash-1017 original | 763.000 M (card); 552.000 M según Apertis | 1.000.000 tokens | 307,2 GB | 510,3 GB | 1,838 | no disponible en la información | servidor multigráfico de clase 500 GB |

La comparación se limita a variantes del mismo checkpoint: no se dispone de datos de benchmarks de tarea ni de alternativas de otros fabricantes en la información proporcionada, por lo que no es posible comparar con modelos densos o MoE de tamaño similar de otras familias.

## Limitaciones y advertencias

- Pérdida de calidad cuantificada y significativa: perplejidad 3,615 frente a 1,838 del original, con una de cada cuatro palabras siguientes distinta. El autor advierte de más errores factuales y razonamiento largo menos fiable.
- No hay precisión de tarea medida (código, Q&A, matemáticas): solo perplejidad, KL y acuerdo de siguiente palabra, más unas pocas pruebas puntuales.
- Discrepancia de cifras entre fuentes: la model card afirma 763.000 M de parámetros, Apertis indica 552.000 M con 8.000 M/16.000 M activos y los metadatos de safetensors del repo informan 102.247.695.722. Conviene verificar el dato antes de citarlo en producción.
- Dependencia de un runtime no estándar y parcheado: sin el parche de índices de 10/11/12 bits, ni el conversor ni el runtime de YoungAi cargan el archivo. Esto rompe la portabilidad y complica el mantenimiento.
- Descarga de ~300 GB pese a que el GGUF ocupe 99,1 GB, por las tablas Engram servidas desde los shards originales.
- Sin calibración y sin sidecar de corrección: el propio autor lo sitúa por debajo del build de 113,6 GB en fidelidad.
- Configuración de ejecución validada muy estrecha: greedy, *thinking* off, un solo stream, CUDA 13 en sm_90. No hay datos de decodificación especulativa con muestreo, ni de lotes, ni de contexto largo.
- El soporte multimodal del modelo base no está verificado en este build; no incluye sidecar de visión.
- Licencia MIT para el artefacto, pero la licencia del modelo base no se indica en la información disponible: hay que comprobarla antes de un uso comercial. Además, el uso comercial puede verse afectado por la obligación de distribuir el parche del runtime.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe equivalente al del original.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build alternativo de Baekpica: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF
- Herramienta de cuantización y runtime YoungAi: https://github.com/fodelf/YoungAi
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/deepseek-v4.1-flash-1017
- Ficha del modelo base en Apertis: https://apertis.ai/models/deepseek-v4.1-flash-1017
- Precios y acceso vía API (AIHubMix): https://aihubmix.com/model/deepseek-v4.1-flash-1017
