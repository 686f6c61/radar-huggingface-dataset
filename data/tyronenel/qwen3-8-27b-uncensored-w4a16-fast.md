# TyroneNel/Qwen3.8-27B-Uncensored-W4A16-fast

## Resumen

El Qwen3.8-27B-Uncensored-W4A16-fast es una compilación cuantizada en 4 bits del modelo Qwen3.8-27B-Uncensored (a su vez una versión abliterated en BF16 de Qwen/Qwen3.8-27B), publicada por el usuario TyroneNel. Se distribuye como variante "fast" del build W4A16-g128: conserva intacto el cuerpo decodificador en int4 g128 y solo recuantiza a int4 GPTQ la cabeza de salida (lm_head) y el módulo MTP, además de recalcular el vocabulario del borrador especulativo a partir de las propias generaciones del modelo. El resultado ocupa 15,8 GB en disco (frente a 16,7 GB del g128) y está diseñado para servirse en una única GPU de 24 GB, tipo RTX 3090.

El modelo declara pipeline image-text-to-text (incluye torre de visión), razonamiento con modo "thinking" conmutable, function calling y predicción multi-token. La nomenclatura indica en torno a 27B de parámetros lógicos, aunque el recuento de elementos almacenados en safetensors es de 4.298.815.014 debido al empaquetado de los pesos int4 (véase la tabla de especificaciones). Su interés práctico es el despliegue: mantener la calidad del modelo original con solo un 0,5 % de pérdida de perplejidad y ganar entre un 5 % y un 10 % de throughput respecto al build g128 en la misma tarjeta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8, con torre de visión y módulo MTP (multi-token prediction); no se detalla la configuración de capas |
| Parámetros totales | ≈27B lógicos según la nomenclatura; 4.298.815.014 elementos almacenados en safetensors (los pesos int4 van empaquetados) |
| Parámetros activos | No aplica (no se indica que el modelo base sea de mezcla de expertos) |
| Longitud de contexto | No disponible; en las pruebas se sirvió con MAX_LEN=49152 tokens |
| Tipos de cuantización | W4A16: cuerpo en int4 g128 simétrico (AutoRound); lm_head y módulo MTP en int4 GPTQ g128 simétrico; embed_tokens en int8; torre de visión y normas en BF16. Grupos simétricos (sin zero points) |
| Idiomas soportados | en, zh (declarados); el vocabulario del borrador se calibró además con prompts en danés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B base: un transformer de la familia Qwen3.8 con torre de visión (de ahí el pipeline image-text-to-text) y un módulo MTP que habilita decodificación especulativa. La cuantización se aplica sobre el build BF16 ya abliterado, es decir, con la dirección de rechazo eliminada, y esa propiedad se conserva sin cambios en esta versión.

El proceso de construcción (herramientas en HyperQwen, directorios `drafter/` y `prepare/`) consta de cuatro pasos: generación con el propio modelo y captura de estados ocultos finales; cuantización GPTQ int4 de la lm_head con 300.000 filas de calibración; cuantización GPTQ int4 del módulo MTP (8 capas lineales) usando las matrices de Hessian volcadas; y construcción del vocabulario del borrador a partir de los 40.960 ids más frecuentes de 6.761 generaciones (4,85 M de tokens de salida, 3.119 de ellas con thinking activado; prompts de chat en inglés, código, instrucciones y razonamiento en danés y GSM8K de entrenamiento). Ese vocabulario propio cubre el 97,90 % de los tokens en el 10 % reservado de esas generaciones, frente al 98,39 % de la lista genérica del g128. Las capas lineales del decodificador no se tocan (65 de los 67 archivos son idénticos byte a byte al build g128) y embed_tokens, torre de visión y normas permanecen en int8/BF16. El error relativo de la lm_head int4 es 0,1408 frente a 0,0064 del int8 RTN del g128, pero GPTQ usa estados ocultos del propio modelo para minimizar el error de salida sobre activaciones reales en lugar del error de pesos. No se mencionan fases de RLHF o DPO específicas de esta recuantización.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento conmutable (thinking on/off, protocolo v2).
- Generación de código y resolución de problemas matemáticos (GSM8K).
- Function calling / tool calling.
- Capacidades de visión-lenguaje (entrada conjunta de imagen y texto, torre de visión en BF16).
- Predicción multi-token y decodificación especulativa (SPEC=mtp / dflash2, 7 tokens de borrador).
- Soporte multilingüe declarado en inglés y chino; se observó tratamiento de danés en la calibración.
- Modelo abliterated/uncensored: menor tendencia al rechazo en respuestas.

## Casos de uso

- Asistente conversacional autoalojado en una sola GPU de consumo: con 15,8 GB de pesos y una caché KV configurada de 4,22 GiB, el modelo cabe en una RTX 3090 de 24 GB y sirve a 124,9 tok/s en decodificación monousuario (T por defecto) con un TTFT medio de 175 ms.
- Análisis de imágenes y documentos: al ser image-text-to-text, admite entradas de imagen junto con texto para tareas de descripción, extracción o preguntas sobre capturas, aprovechando la torre de visión sin cuantización agresiva.
- Agente con tool calling y razonamiento multi-paso: el soporte de function calling permite integrarlo en orquestadores que encadenan llamadas a APIs, y el modo thinking ayuda en tareas que requieren descomposición de problemas.
- Copiloto de código en pipeline local: la perplejidad medida sobre fuente Python es de 3,29 (la más baja de los tres checkpoints evaluados), lo que permite integrarlo en entornos de desarrollo sin enviar código a servicios externos.
- Atención al cliente bilingüe en/zh: los idiomas declarados cubren inglés y chino, y la ventana de 49.152 tokens usada en pruebas permite mantener historiales de conversación largos con 1.044,8 tok/s en modo batch a 64 concurrencias.
- Generación de contenido sin rechazos excesivos: al estar abliterated, es adecuado para dominios donde el modelo base aplica filtros de rechazo injustificados (ficción, guiones, análisis de temas sensibles), siempre bajo responsabilidad del despliegue.
- Procesamiento por lotes de alto rendimiento: con 64 peticiones concurrentes y 128 tokens de entrada / 512 de salida alcanza 1.044,8 tok/s, un 10 % más que el build g128, lo que lo hace viable para tuberías offline de resumen o clasificación.
- Inferencia de contexto largo: con prefill de 102.400 tokens mantiene 1.064 tok/s y un TPOT de 24,6 ms en un prompt de 100k, adecuado para tareas de lectura de documentos extensos.

## Benchmarks y rendimiento

Decodificación monousuario en una RTX 3090 (24 GB), HyperQwen sobre vLLM 0.28.0, WSL2 + Docker, thinking off, tarjeta a 250 W, SPEC=dflash2, PREFIX_CACHE=1, KV_MEM=4.229.848.320 (4,22 GiB), MAX_LEN=49152. Throughput extremo a extremo en tok/s (T por defecto / T=0):

| Concurrencia | Este modelo | Build g128 | Base AutoRound oficial |
|---|---|---|---|
| C1 | 124,9 / 127,8 | 116,1 / 121,1 | 116,6 / 118,9 |
| C2 | 180,3 / 191,2 | 172,6 / 189,2 | 175,7 / 169,6 |
| C4 | 238,1 / 260,3 | 224,7 / 245,5 | 229,4 / 237,6 |
| C8 | 224,7 / 233,5 | 209,8 / 256,7 | 223,6 / 207,4 |

En C1 acepta 3,70 / 3,93 tokens por paso de verificación y el tiempo medio hasta el primer token es de 175 ms. Se indica una variación esperada del 3-5 % entre sesiones.

Servicio por lotes (tarjeta a 350 W, KV=fp8, sin especulación, segunda de dos ejecuciones):

| Escenario | Este modelo | Build g128 |
|---|---|---|
| 64 concurrentes, 128 entrada / 512 salida | 1.044,8 tok/s | 947,2 tok/s (+10 %) |
| 64 concurrentes, 256 entrada / 256 salida | 752,4 tok/s | 700,4 tok/s (+7 %) |
| Prefill 1.024 tokens | 1.818 tok/s | 1.804 tok/s |
| Prefill 102.400 tokens | 1.064 tok/s | 1.063 tok/s |
| 1 prompt de 100k: TTFT / TPOT | 92,9 s / 24,6 ms | 93,0 s / 25,4 ms |
| 4 prompts de 60k, 1.024 salida | 17,4 tok/s | 17,1 tok/s |

Calidad (ventanas de ~300 tokens sobre wikitext-2 en inglés, fineweb-2 danés y fuente Python; GSM8K con las primeras 200 preguntas de test, greedy, thinking off):

| Checkpoint | PPL total (en / da / código) | GSM8K | Tokens medios de respuesta |
|---|---|---|---|
| Este modelo | 8,260 (10,83 / 10,98 / 3,29) | 96,0 % (96,5 % en una ejecución anterior) | 384 |
| Build g128 | 8,216 (10,80 / 10,90 / 3,27) | 94,5 % (95,5 %) | 384 |
| Base AutoRound oficial | 8,186 (10,68 / 10,85 / 3,30) | 94,5 % | 379 |

Las cabezas int4 cuestan un 0,5 % de perplejidad. Con n=200 el error estándar de GSM8K es de aproximadamente 1,6 puntos, por lo que la diferencia en GSM8K no es significativa.

## Requisitos de hardware

- VRAM estimada: 15,8 GB de pesos en disco; en las pruebas se reservaron 4,22 GiB para caché KV, lo que deja el conjunto dentro de los 24 GB de una RTX 3090.
- GPU recomendadas: una sola RTX 3090 (24 GB) es el objetivo declarado; no se han publicado requisitos para A100 o H100.
- Cabe en GPU de consumo: sí, en la clase RTX 3090 de 24 GB. No se indica soporte para tarjetas de 16 GB o menos.
- Opciones de despliegue: el autor usa el stack HyperQwen sobre vLLM 0.28.0 en Linux o WSL2 con Docker. Los tags mencionan compatibilidad con vLLM y Marlin. No se declara soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 124,9 tok/s en C1 (TTFT medio 175 ms) y 1.044,8 tok/s a 64 concurrentes con 128/512 tokens; prefill de 102.400 tokens a 1.064 tok/s, con TTFT de 92,9 s y TPOT de 24,6 ms para un prompt de 100k.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño en disco | PPL (en / da / código) | GSM8K | Licencia |
|---|---|---|---|---|---|
| Este modelo (fast) | Cuerpo int4 g128 + lm_head/MTP int4 GPTQ | 15,8 GB | 8,260 (10,83 / 10,98 / 3,29) | 96,0 % | apache-2.0 |
| Qwen3.8-27B-Uncensored-W4A16-g128 | Cuerpo int4 g128 + lm_head/MTP int8 RTN | 16,7 GB | 8,216 (10,80 / 10,90 / 3,27) | 94,5 % | apache-2.0 |
| Base AutoRound oficial | int4 AutoRound | No disponible | 8,186 (10,68 / 10,85 / 3,30) | 94,5 % | No disponible en la información proporcionada |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | BF16, abliterated | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento del modelo BF16 original ni de alternativas de otros fabricantes para establecer una comparación cruzada.

## Limitaciones y advertencias

- El modelo es abliterated: se ha eliminado la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado sin filtros. Requiere moderación externa en producción.
- La cuantización int4 de la lm_head y del módulo MTP eleva el error relativo de pesos de 0,0064 a 0,1408 en la cabeza de salida; aunque el impacto medido en perplejidad es del 0,5 %, puede afectar a distribuciones de tokens poco frecuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad factual.
- Idiomas declarados limitados a inglés y chino; no se garantiza un rendimiento equivalente en castellano ni en otras lenguas, aunque la calibración incluyó danés.
- La longitud de contexto nativa no está documentada; el valor de 49.152 tokens corresponde a la configuración de las pruebas, no necesariamente al máximo soportado.
- El recuento de parámetros es ambiguo (≈27B lógicos frente a 4,3B elementos almacenados por el empaquetado int4); conviene verificar requisitos de memoria antes de planificar el despliegue.
- Las métricas publicadas corresponden a ejecuciones concretas en WSL2 + Docker con una RTX 3090 y thinking off; se advierte de una variación del 3-5 % entre sesiones y no se han replicado en otros entornos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- La licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo abliterated recae en el desplegador.

## Enlaces

- Repositorio del modelo: https://huggingface.co/TyroneNel/Qwen3.8-27B-Uncensored-W4A16-fast
- Build g128 de referencia: https://huggingface.co/TyroneNel/Qwen3.8-27B-Uncensored-W4A16-g128
- Modelo base abliterated (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Stack de servicio HyperQwen: https://github.com/syv-ai/HyperQwen
- vLLM (versión usada en las pruebas: 0.28.0): no se proporciona enlace directo en la información disponible
