# staccs/ds41-sidecars

## Resumen

`staccs/ds41-sidecars` no es un modelo autónomo, sino un repositorio de archivos acompañantes ("sidecars") para el runtime propietario **ds4 / ds4-server**, creado por el usuario staccs. Contiene tres ficheros pequeños que el runtime carga junto a las cuantizaciones "lecore" de **DeepSeek-V4.1-Flash-1017** (modelo base de DeepSeek, MoE con pesos principales de 99–107 GB en formato GGUF VQ): una torre de visión en GGUF, un borrador de decodificación especulativa (DSpark) y un esqueleto denso en layout de llama.cpp.

Su relevancia radica en que habilita tres capacidades sobre las builds cuantizadas de V4.1-Flash: inferencia multimodal (visión), aceleración por decodificación especulativa (1,0–3,3 tokens aceptados por bloque de verificación de 5 tokens según la mezcla de prompts) y compatibilidad con herramientas del ecosistema llama.cpp mediante el esqueleto de metadatos. El repo pesa solo 1,6 GB, frente a los ~100 GB de los pesos principales, y se distribuye bajo licencia MIT, igual que el modelo base.

Es importante subrayar que ninguno de los tres ficheros es cargable por sí solo como modelo: los pesos del LLM residen en los GGUF principales listados en el README, y solo el runtime ds4 puede cargarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecars para MoE DeepSeek-V4.1-Flash (arquitectura `deepseek4` / `deepseek41.*`): torre de visión ViT, drafter especulativo DSpark, esqueleto denso llama.cpp |
| Parametros totales | no disponible (los pesos completos, 99–107 GB en VQ GGUF, están en los repos de builds principales) |
| Parametros activos | no disponible (el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica al repo (los builds principales usan cuantización "lecore" VQ: vq11cal, vq10sh12) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (sidecars); los pesos principales están en GGUF VQ y los Engram tables en safetensors |

## Arquitectura y entrenamiento

El repositorio agrupa tres componentes técnicos diferenciados:

1. **Torre de visión** (`DeepSeek-V4.1-Flash.vision.gguf`, 0,90 GiB): un ViT de 32 bloques, anchura 1024, parche 14 y factor de downsample 3, con un máximo de 1024 tokens de imagen por imagen. Contiene 306 tensores emitidos desde el modelo sin cuantizar y es compartido por todas las builds de V4.1-Flash. Se carga de forma aditiva (no interfiere en la ruta de texto) mediante `ds4-server --vision-gguf`.

2. **DSpark drafter** (`...dspark.llama.gguf`, 5,05 MiB): un borrador para decodificación especulativa con 3 torres de draft × 128 expertos, top-3, bloque 5, capas objetivo 37/38/39 y cabeza de confianza. Los pesos provienen de las torres de draft de la build pqhaz-abliterated, con codewords VQ de 8×1024. Se activa automáticamente si se coloca junto al GGUF principal.

3. **Esqueleto denso llama.cpp** (`...llama.gguf`, 605,8 MiB): 922 tensores con todos los componentes no-experto del modelo (atención q_a/q_b/kv/output_a/output_b, FFN del experto compartido, indexador, MTP main_proj, embeddings y cabeza de salida) con metadatos completos `deepseek41.*`. Los expertos enrutados no están incluidos: permanecen en el fichero VQ de 103 GB.

No se ha entrenado ningún modelo nuevo aquí: los sidecars son pesos extraídos o derivados del modelo original. Los builds principales mantienen una perplejidad WikiText-2 (2k) de 2,78–2,82 en las versiones abliterated (fidelidad top-1 del 80,2–80,5 % frente al modelo fuente) y 3,615 en la build base vq10sh12 (74,5 %).

## Capacidades

Capacidades que estos sidecars habilitan sobre las builds cuantizadas de DeepSeek-V4.1-Flash-1017:

- Generación de texto con el modelo base DeepSeek-V4.1-Flash-1017 (MoE, vía runtime ds4 exclusivamente)
- Comprensión de imágenes: hasta 1024 tokens por imagen gracias a la torre de visión ViT de 32 bloques
- Decodificación especulativa DSpark: 1,0–3,3 tokens aceptados por bloque de verificación de 5 tokens (medido en Radeon 8060S con 128 GB unificados)
- Multimodalidad aditiva: la torre de visión (~1 GiB) no penaliza la ruta de texto
- Compatibilidad de layout con herramientas del ecosistema llama.cpp mediante el esqueleto de metadatos denso
- Soporte de tablas n-gram **Engram** de DeepSeek (~203 GB leídos de disco por token, mapeados sin copiar a VRAM) mediante `--engram-dir`
- Builds abliterated disponibles (pqhaz, dealignai, mrfakename, rumplestilzken) que eliminan los rechazos de seguridad del modelo original

No hay información sobre tool calling, agentes ni modos de razonamiento específicos en la documentación disponible.

## Casos de uso

- **Inferencia local multimodal en estaciones de trabajo con mucha memoria unificada**: en equipos tipo Radeon 8060S con 128 GB unificados, el conjunto (pesos VQ ~100 GB + torre de visión + Engram en disco) permite ejecutar un MoE de gran tamaño con capacidad de visión sin GPUs de centro de datos.
- **Aceleración de decodificación con DSpark**: para cargas de generación de texto largo (redacción, resumen, generación de código), el drafter reduce la latencia por token al aceptar entre 1 y 3,3 tokens por bloque de verificación.
- **Análisis de documentos e imágenes**: la torre de visión permite pasar capturas, diagramas o documentos escaneados (hasta 1024 tokens de imagen) junto al prompt de texto.
- **Experimentación con builds abliterated**: investigadores que estudien el efecto de la eliminación de alineamiento pueden comparar las cuatro variantes (pqhaz, dealignai, mrfakename, rumplestilzken), todas con perplejidad muy similar (2,78–2,82).
- **Interoperabilidad con tooling llama.cpp**: el esqueleto denso en layout llama.cpp facilita inspeccionar metadatos y estructura del modelo con herramientas estándar del ecosistema, aunque no permite cargar el modelo completo fuera del runtime ds4.
- **Despliegue con tablas Engram en disco**: escenarios donde se quiere aprovechar las tablas n-gram del modelo original (~203 GB) sin consumir VRAM adicional, ya que el servidor las mapea desde disco.
- **Automatización en Windows**: el script `run_ds41.ps1` del repo `ds4-winhip` orquesta el arranque completo (GGUF principal, torre de visión y Engram) en un solo comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados por el autor son mediciones propias de la cuantización y del drafter:

| Métrica | Valor |
|---|---|
| PPL WikiText-2 (2k), builds abliterated vq11cal | 2,78 – 2,82 |
| PPL WikiText-2 (2k), build base vq10sh12 | 3,615 |
| Fidelidad top-1 vs modelo fuente (abliterated) | 80,2 % – 80,5 % |
| Fidelidad top-1 vs modelo fuente (base vq10sh12) | 74,5 % |
| Aceptación DSpark | 1,0 – 3,3 tokens por bloque de 5 |

## Requisitos de hardware

- **Los sidecars en sí** son pequeños (0,9 GiB + 5 MiB + 606 MiB), pero requieren los GGUF principales de 99,1–106,8 GB para ser útiles.
- **Memoria estimada para inferencia**: los builds principales (~100–107 GB) apuntan a sistemas con memoria unificada amplia; la medición de referencia del autor usa una Radeon 8060S con 128 GB unificados. No hay datos de VRAM para GPUs discretas.
- **GPU de referencia**: Radeon 8060S (AMD, 128 GB de memoria unificada). No se documentan configuraciones con NVIDIA.
- **Consumer GPUs**: no es realista cargar los pesos principales (~100 GB) en GPUs de consumo típicas (RTX 4090 con 24 GB); se requiere memoria unificada de gran capacidad o configuraciones multi-GPU no documentadas aquí.
- **Espacio en disco adicional**: las tablas Engram añaden ~203 GB leídos de disco por token (mapeados, no copiados a VRAM); se recomienda almacenamiento rápido (NVMe).
- **Despliegue**: exclusivamente mediante el runtime **ds4 / ds4-server** (repo `staccs/ds4-winhip`, script `run_ds41.ps1` para Windows/ROCm-HIP). No compatible con vLLM, llama.cpp estándar, Ollama ni TGI para el modelo completo.
- **Caveat de latencia**: si se activa cualquier penalty de repetición, el runtime desactiva el drafter DSpark y se vuelve a decodificación normal.
- **Latencia/throughput**: no se publican tokens/s absolutos; solo la tasa de aceptación del drafter.

## Comparativa con modelos similares

Comparativa entre las builds principales que acompañan a estos sidecars (todas cuantizaciones lecore VQ del mismo modelo base):

| Build | Tamaño | PPL (WT-2, 2k) | Top-1 vs fuente | Característica |
|---|---:|---:|---:|---|
| [pqhaz abliterated vq11cal](https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-pqhaz-lecore-vq11cal-GGUF) | 106,8 GB | 2,78 | 80,4 % | Mejor perplejidad; drafter DSpark incluido |
| [dealignai abliterated vq11cal](https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF) | 106,8 GB | 2,82 | 80,2 % | Alternativa abliterated |
| [mrfakename abliterated vq11cal](https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-mrfakename-lecore-vq11cal-GGUF) | 106,8 GB | 2,80 | 80,3 % | Alternativa abliterated |
| [rumplestilzken abliterated vq11cal](https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-rumplestilzken-lecore-vq11cal-GGUF) | 106,8 GB | 2,82 | 80,5 % | Mejor fidelidad top-1 |
| [base vq10sh12](https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF) | 99,1 GB | 3,615 | 74,5 % | Sin abliterar, más ligera |

No hay datos comparativos con otros modelos de la categoría (p. ej. otros MoE abiertos de tamaño similar) en la información disponible.

## Limitaciones y advertencias

- **No es un modelo autónomo**: ninguno de los tres ficheros es cargable por sí solo; sin los GGUF principales de ~100 GB y el runtime ds4, estos sidecars no sirven para nada.
- **Lock-in de runtime**: los builds principales solo cargan con ds4/ds4-server; no funcionan con llama.cpp, Ollama, vLLM ni TGI pese al layout llama.cpp del esqueleto denso.
- **Builds abliterated**: las variantes abliterated eliminan deliberadamente los mecanismos de seguridad del modelo original. Su uso conlleva riesgos éticos y legales significativos y no es adecuado para entornos de producción orientados a usuarios finales.
- **Repositorio comunitario de terceros**: el autor (staccs) redistribuye pesos de DeepSeek (torre de visión y Engram) sin modificar; la procedencia y el mantenimiento dependen de un usuario individual con 283 descargas y 0 likes, sin garantías de calidad o continuidad.
- **Coste de E/S de Engram**: las tablas Engram (~203 GB) se leen de disco por token; en almacenamiento lento esto puede degradar seriamente la latencia.
- **Drafter condicional**: cualquier penalty de repetición desactiva DSpark, eliminando la aceleración especulativa.
- **Datos faltantes**: longitud de contexto, idiomas soportados, parámetros totales/activos y benchmarks estándar no están documentados; la evaluación de calidad se limita a perplejidad y fidelidad top-1 de la cuantización.
- **Riesgo de alucinación y sesgos**: heredados del modelo base DeepSeek-V4.1-Flash-1017; la abliteración puede además aumentar la tasa de contenidos nocivos generados.
- **Plataforma**: el flujo documentado (`run_ds41.ps1`) es específico de Windows con HIP/ROCm; no hay instrucciones para Linux u otras plataformas.

## Enlaces

- Repositorio de sidecars: https://huggingface.co/staccs/ds41-sidecars
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Runtime ds4 parcheado y scripts: https://huggingface.co/staccs/ds4-winhip
- Build pqhaz abliterated: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-pqhaz-lecore-vq11cal-GGUF
- Build dealignai abliterated: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF
- Build mrfakename abliterated: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-mrfakename-lecore-vq11cal-GGUF
- Build rumplestilzken abliterated: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-rumplestilzken-lecore-vq11cal-GGUF
- Build base vq10sh12: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
- Engram shard 47: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/resolve/main/model-00047-of-00048.safetensors
- Engram shard 48: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/resolve/main/model-00048-of-00048.safetensors
