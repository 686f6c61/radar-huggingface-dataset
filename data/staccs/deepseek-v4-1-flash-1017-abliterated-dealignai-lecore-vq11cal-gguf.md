# staccs/DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de un solo archivo (106,8 GB) del modelo `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8`, que a su vez es una versión «abliterated» (sin alineamiento de seguridad) del `deepseek-ai/DeepSeek-V4.1-Flash-1017` publicado por DeepSeek el 17 de octubre de 2026. El autor de este build, `staccs`, no modifica los pesos más allá del proceso de cuantización: todo el trabajo de abliteración es de `dealignai` y el modelo original es de DeepSeek.

Se trata de un transformer de tipo mezcla de expertos (MoE) con expertos enrutados, expertos compartidos y unas tablas de n-gramas denominadas «engram» que se distribuyen por separado. La cuantización emplea codificación vectorial (VQ) de 11 bits con codebooks de 2048 entradas para los expertos enrutados (1,39 bpw), `q4_K` para el esqueleto de atención y FP8 para la cabeza de salida, con calibración por activaciones sobre 65.536 tokens.

Su relevancia es doble: por un lado, permite ejecutar un modelo de más de 100.000 millones de parámetros en hardware de consumidor con memoria unificada grande (el autor lo ha medido en una Radeon 8060S con 128 GB); por otro, al estar basado en un modelo abliterated, elimina deliberadamente los mecanismos de rechazo del modelo original, lo que lo hace inadecuado para despliegues comerciales sin control humano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (expertos enrutados + expertos compartidos + tablas de n-gramas «engram»); detalles completos de la arquitectura base no disponibles |
| Parametros totales | 106.804.403.562 (≈106,8 B, dato de safetensors); la model card menciona además «557B params» en expertos enrutados, cifra no reconciliada con el total |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (evaluado a 2k y 16k; se documentan prompts de 19,3k tokens) |
| Tipos de cuantizacion | GGUF con VQ de 11 bits (codebooks de 2048 entradas, 1,39 bpw) en expertos enrutados y compartidos; `q4_K` en atención; FP8 con bloques 32x32 en la cabeza de salida; caché KV en FP4 (valores E4M3 para escalas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único de 106,8 GB); tablas engram en shards separados (~203 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de DeepSeek con tres componentes diferenciados: expertos enrutados (los que concentran la mayor parte de los parámetros), expertos compartidos que se activan siempre, y tablas «engram» de n-gramas que en este build se mantienen en los shards originales sin recuantizar y deben descargarse aparte (~203 GB). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica de este repositorio es puramente de compresión: cuantización vectorial con k-means ponderado por activaciones (calibrado) sobre 65.536 tokens, con codebooks de 11 bits y 2048 entradas. Los cosenos ponderados reportados son 0,909 para expertos enrutados, 0,910 para expertos compartidos y 0,997 para el esqueleto de atención en `q4_K`. El autor declara que el escaneo de tipos de archivo y la comprobación de paridad de decodificación frente a los pesos fuente se han superado. La abliteración del modelo intermedio es responsabilidad de `dealignai`; no se documenta la metodología exacta empleada.

## Capacidades

- Generación de texto y razonamiento: el modelo soporta modo de pensamiento (`reasoning_effort: "none"` o `thinking: {"type":"disabled"}` permiten desactivarlo), lo que implica que el modo razonado existe y es configurable.
- Codificación y tareas de agente: la documentación de DeepSeek para V4.1-Flash-1017 menciona mejoras en finalización de tareas de código y trabajo con agentes.
- Tool calling / function calling: el autor documenta su uso con Hermes Agent, que inyecta esquemas de herramientas (system prompt + esquemas ≈14k tokens), por lo que el soporte de herramientas es funcional.
- Razonamiento multi-paso y agentes: soportado a través de la API compatible con OpenAI que expone el servidor `ds4-server` en `http://127.0.0.1:8008/v1`.
- Comprensión visual nativa: anunciada para el modelo base DeepSeek-V4.1-Flash; este build GGUF no documenta soporte de visión ni incluye codificador visual en la descripción.
- Multilingüismo: no disponible; no se declaran idiomas en la model card.
- Capacidades deliberadamente no restringidas: al ser una variante abliterated, no aplica los filtros de rechazo del modelo original.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un MoE de gran tamaño tras eliminar el alineamiento, comparando respuestas frente al modelo original en tareas de rechazo, sesgo y toxicidad.
- Evaluación de técnicas de cuantización extrema: con métricas de perplejidad, KL y acuerdo top-1 frente al modelo profesor, sirve como banco de pruebas para medir el impacto de VQ de 11 bits en un MoE de más de 100 B.
- Despliegue local en estación de trabajo con memoria unificada: el autor lo ejecuta en una Radeon 8060S con 128 GB de memoria y API compatible con OpenAI, lo que permite tener un modelo grande en local sin depender de la nube.
- Agentes autónomos de larga duración en local: con reutilización de prefijo KV y checkpoints en disco (~30 MB por checkpoint de 14k tokens), es viable mantener sesiones de agente con prompts de sistema grandes (14k tokens) sin reprefijar cada turno.
- Generación de código en entornos aislados: al ejecutarse sobre `127.0.0.1` con clave local, encaja en pipelines internos donde no se permite enviar código a APIs externas.
- Reproducción y auditoría de modelos derivados: al incluir comprobación de paridad de decodificación y métricas de fidelidad frente al profesor, facilita auditar qué se pierde en cada paso de cuantización.
- Experimentación con prompts sin restricciones en entornos controlados: útil para estudiar jailbreaks y robustez de filtros, siempre con supervisión y sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización frente al modelo profesor (WikiText-2, test), sobre los 1.233 ids reservados del tokenizador:

| Metrica | 2k contexto | 16k contexto |
|---|---:|---:|
| Perplejidad | 2,817 | 2,936 |
| KL media vs. fuente | 0,587 | 0,584 |
| KL mediana vs. fuente | 0,047 | 0,093 |
| Acuerdo top-1 con la fuente | 80,2% | 78,6% |
| Masa basura en ids reservados (media) | 2,10e-07 | 2,44e-07 |
| Masa basura en ids reservados (máx.) | 7,66e-05 | 8,23e-05 |
| Masa de escape fuera del top-50 de la fuente | 0,0359 | 0,0316 |
| Jaccard del conjunto top-p 0,95 vs. fuente | 0,681 | 0,627 |

Comparación con el build anterior sin calibrar del mismo autor (`lecore-vq10sh12`, a 2k): perplejidad 3,615, KL 0,797 media / 0,195 mediana, acuerdo top-1 74,5%. La mejora del calibrado es sustancial en perplejidad y en acuerdo top-1.

Rendimiento medido en Radeon 8060S (gfx1151, HIP SDK 7.2, 128 GB de memoria unificada), sobre el build vq10sh12: prefill de 135-190 tok/s y decodificación de 14-17 tok/s. El autor indica que ambos están limitados por kernels, no por el formato.

## Requisitos de hardware

- VRAM/memoria estimada: ~106,8 GB solo para los pesos; hay que sumar la caché KV (FP4) y, si se usan, las tablas engram (~203 GB adicionales en disco, no necesariamente en memoria).
- GPU profesionales: no hay mediciones publicadas en A100/H100 en la información disponible; por tamaño, un H100 de 80 GB no basta para el archivo completo en una sola unidad.
- GPU de consumo: no cabe en ninguna GPU de consumo con VRAM dedicada (RTX 4090 = 24 GB, RTX 5090 = 32 GB). Requiere memoria unificada grande (el autor usa 128 GB en una Radeon 8060S con memoria unificada).
- Opción medida: Windows + HIP nativo con el servidor `ds4-server` parcheado del repositorio compañero (`ds4-winhip`), arrancado con `run_ds41.ps1`. Expone API compatible con OpenAI.
- Variables relevantes: `DS4_CUDA_COPY_MODEL=1` copia los pesos a memoria de GPU (requiere límite de commit por encima de ~100 GB); `-NoCopy` mapea en host (sin commit, más lento).
- Otras opciones de despliegue (llama.cpp, vLLM, TGI, Ollama): no documentadas en la información disponible para este build.
- Latencia de arranque: ~6 minutos hasta la primera respuesta, más ~110 s de calentamiento de kernels y grafos en la primera petición. No se debe medir rendimiento en la primera petición.
- Concurrencia: una petición a la vez; la segunda se encola. Cualquier petición intermedia invalida los dos checkpoints KV vivos y fuerza un reprefijado completo (medido: 19,3k tokens, 138 s).
- Almacén KV en disco: `--kv-disk-dir` y `--kv-disk-space-mb`; presente pero no validado en el build de Windows según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este build (`staccs/...lecore-vq11cal-GGUF`) | 106,8 B | No disponible | GGUF, VQ 11 bits | MIT | Calibrado por activaciones; PPL 2,817 a 2k |
| `staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF` | 106,8 B (mismo origen) | No disponible | GGUF, VQ sin calibrar | MIT (heredada) | PPL 3,615 a 2k; top-1 74,5% |
| `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8` | No disponible (FP8 del mismo modelo) | No disponible | FP8 | No disponible | Modelo profesor de esta cuantización; sin pérdida de cuantización VQ |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` | No disponible | No disponible | Pesos originales | MIT | Modelo oficial con alineamiento intacto |

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y métricas de fidelidad.

## Limitaciones y advertencias

- Alineamiento eliminado: es una variante abliterated, es decir, se ha suprimido deliberadamente la capacidad de rechazo. Puede producir contenido tóxico, ilegal o dañino sin filtros; no debe exponerse a usuarios finales sin una capa de moderación propia.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica de veracidad en la información disponible.
- Emisión de tokens reservados: el build anterior sin calibrar generaba «ensalada de palabras» con tokens reservados (por ejemplo `place_holder_no_362`) a temperatura 1,0 sin truncación en prompts de más de 14k tokens. Este build mejora las métricas de cola (masa basura media 2,10e-07, escape 0,0359), pero el riesgo no es nulo; se recomienda temperatura 0 o 0,6-0,7 con `top_p` 0,95 y `min_p` 0,05.
- Discrepancia en el recuento de parámetros: la model card cita 557 B en expertos enrutados frente a 106,8 B totales en safetensors; conviene verificar antes de dimensionar hardware.
- Longitud de contexto no declarada: solo se documentan evaluaciones a 2k y 16k y prompts de 19,3k tokens; no se garantiza un máximo oficial.
- Dependencia de componentes externos: las tablas engram (~203 GB) se descargan por separado y no se han recuantizado.
- Madurez del ecosistema: el despliegue documentado es específico de Windows + HIP en una Radeon 8060S con un servidor parcheado; no hay soporte documentado en llama.cpp, vLLM, TGI ni Ollama.
- Rendimiento limitado: 14-17 tok/s de decodificación y una sola petición concurrente lo hacen poco adecuado para producción de alta concurrencia.
- Gestión de caché KV frágil: cualquier petición intermedia invalida los checkpoints y provoca reprefijados de más de dos minutos.
- Licencia: MIT permite uso comercial, pero al derivar de un modelo abliterated la responsabilidad legal y de contenido recae íntegramente en el desplegador; verificar también los términos del modelo base de DeepSeek.
- Idiomas no declarados: no hay garantía de calidad fuera de los idiomas con los que se entrenó el modelo original, dato no disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF
- Modelo base (abliterated, FP8): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build anterior sin calibrar: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
- Anuncio oficial de DeepSeek-V4.1-Flash: https://www.deepseek.com/en/news/deepseek-v4-1-flash/
- Artículo sobre la licencia MIT y el lanzamiento: https://tech-insider.org/deepseek-v4-1-flash-1017-mit-license-update-2026/
- Lista de ejemplos y demos: https://github.com/sandbase-lab/awesome-deepseek-v4.1-flash
