# tinyopsec/LFM-2.5-2.6B-heretic-GGUF

## Resumen

LFM-2.5-2.6B-heretic-GGUF es un conjunto de cuantizaciones en formato GGUF de un modelo derivado de LiquidAI/LFM2.5-2.6B, la familia LFM2.5 de Liquid AI, con 2.697.198.592 parámetros totales. La particularidad es que no se trata del modelo original, sino de una versión «abliterated»/«decensored» generada con la herramienta Heretic, que elimina o atenúa el comportamiento de rechazo aprendido durante el alineamiento. El repositorio lo publica el usuario tinyopsec, no Liquid AI, y actúa como empaquetador del trabajo previo de heretic-org.

El problema que resuelve es de naturaleza muy concreta: ofrece el modelo base en cuantizaciones de 2 a 16 bits listas para llama.cpp y runtimes compatibles, de modo que se puede ejecutar en hardware de consumo sin necesidad de convertir pesos ni de disponer de GPU. Es relevante ahora porque los modelos de ~2,6 B parámetros son el punto dulce para inferencia local en portátiles y equipos sin acelerador dedicado, y porque las variantes sin censura interesan a investigadores que estudian el alineamiento, la negativa a responder y los sesgos residuales.

Conviene subrayar que la información publicada es mínima: la model card solo describe los ficheros y el uso con llama.cpp. No hay datos sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks, por lo que todos esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (Liquid AI); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License v1.0, según la model card) |
| Formato de pesos | GGUF (solo cuantizaciones; no se publican safetensors en este repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en los materiales publicados. La etiqueta `lfm2` y el campo `base_model: LiquidAI/LFM2.5-2.6B` sitúan el origen en la familia LFM2 de Liquid AI, pero la model card de este repositorio no documenta número de capas, tipo de atención, mecanismo de mezcla (atención, convolución o híbrido), vocabulario ni tokenizador. Tampoco se indica la ventana de contexto nativa ni si el modelo base usa atención lineal o alguna variante eficiente.

Respecto al entrenamiento, lo único documentado es el proceso de «abliteration» mediante Heretic sobre el checkpoint heretic-org/LFM-2.5-2.6B-heretic, que a su vez deriva de LiquidAI/LFM2.5-2.6B. No hay datos sobre tokens de preentrenamiento, composición del dataset, fases de SFT, RLHF o DPO, ni sobre el método exacto de intervención aplicado (direcciones de rechazo, edición de pesos por capa, etc.). Tampoco se documenta si la cuantización se generó con `llama.cpp` estándar y qué métricas de perplejidad se obtuvieron por nivel de bits.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica uso orientado a diálogo.
- Ejecución local: todas las cuantizaciones están pensadas para llama.cpp, Ollama, LM Studio o koboldcpp.
- Respuesta sin rechazo aprendido: al ser una variante abliterated, no aplica el comportamiento de negativa del modelo alineado original (con las advertencias de la sección de limitaciones).
- Razonamiento y código: no disponible; no hay documentación ni benchmarks que lo confirmen para esta variante.
- Tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni soporte de agentes.
- Capacidades multimodales (visión, audio): no disponibles; no se declaran.
- Multilingüismo: no disponible; no se enumeran idiomas en la model card ni en los metadatos.
- Modo «thinking» o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en portátil sin GPU: con la cuantización Q4_K_M el modelo ocupa del orden de 1,7 GB, de modo que cabe en RAM y se puede ejecutar con llama.cpp u Ollama en equipos de 8 GB, útil para prototipado offline.
- Investigación sobre alineamiento y negativa: comparar las respuestas del modelo abliterated con las del LFM2.5-2.6B original permite estudiar qué comportamientos se eliminan al aplicar Heretic y cuánto degrada la calidad general.
- Clasificación y etiquetado de texto por lotes: al ser un modelo pequeño, se pueden procesar grandes volúmenes de documentos en CPU con coste bajo, siempre que la tarea no requiera contexto largo.
- Generación de texto creativo sin filtros editoriales: escritura de ficción o guiones donde el modelo alineado impondría restricciones, con revisión humana posterior obligatoria.
- Base para fine-tuning ligero: las cuantizaciones Q8_0 o F16 sirven como referencia de comportamiento antes de adaptar el modelo a un dominio concreto con LoRA sobre los pesos originales.
- Experimentación educativa con cuantización: el repositorio cubre desde Q2_K hasta F16, lo que permite medir empíricamente la pérdida de calidad por bit y entender el compromiso tamaño/rendimiento en un modelo de 2,7 B.
- Pruebas de robustez y red teaming: evaluar la facilidad con la que un modelo sin alineamiento produce contenido problemático, como caso de estudio controlado en entornos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (cálculos a partir de los 2,7 B parámetros y los tamaños declarados, incluyendo overhead de contexto y caché KV): F16 ~5,2 GB de pesos, ~6-7 GB en ejecución; Q8_0 ~2,9 GB, ~3,5-4 GB; Q4_K_M ~1,7 GB, ~2,2-2,8 GB; Q2_K ~1,1 GB, ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090 sobrada). Para despliegue con concurrencia, A100/H100 no aportan ventaja significativa por el tamaño reducido del modelo; el cuello de botella es más probablemente la CPU o el ancho de banda.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones de 4 bits o menos, incluidas iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa y generalizada; requerirían los pesos originales en safetensors, que no se publican en este repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/LFM-2.5-2.6B-heretic-GGUF | ~2,7 B | no disponible | LFM Open License v1.0 | GGUF (13 cuantizaciones) | Variante abliterated; sin benchmarks publicados |
| LiquidAI/LFM2.5-2.6B (base) | ~2,7 B | no disponible en esta busqueda | LFM Open License v1.0 | safetensors (original) | Modelo alineado de referencia; permite comparar el efecto de la abliteration |
| heretic-org/LFM-2.5-2.6B-heretic | ~2,7 B | no disponible | no disponible | no disponible | Origen directo de estas cuantizaciones |
| Alternativas de ~3 B (p. ej. Qwen2.5-3B, Llama-3.2-3B, Gemma-2-2B) | 2-3 B | 32k-128k según familia | Apache 2.0 / Llama / Gemma | safetensors, GGUF comunitario | Ecosistema más maduro y con benchmarks públicos; datos de referencia general, no verificados en la búsqueda |

## Limitaciones y advertencias

- Modelo «decensored»/«abliterated»: el alineamiento de seguridad se ha eliminado deliberadamente, por lo que puede producir contenido dañino, ilegal o sexualmente explícito sin aplicar negativas. No es apto para aplicaciones de cara al público sin filtros externos.
- La propia model card incluye un descargo explícito («Evaluate before use») y no ofrece ninguna garantía de calidad tras la intervención.
- Riesgo de alucinación: no disponible como dato medido, pero al tratarse de un modelo de ~2,7 B parámetros y de una modificación de pesos, es esperable degradación respecto al original; no hay perplejidad ni evaluación publicada para confirmarlo.
- Sesgos conocidos: no documentados. La abliteration puede alterar la distribución de respuestas en temas sensibles sin que exista una evaluación de sesgo asociada.
- Contexto e idiomas: se desconocen la ventana de contexto efectiva y la cobertura idiomática. No se debe asumir buen rendimiento en castellano.
- Licencia: LFM Open License v1.0 (campo `license: other`). Es una licencia con condiciones específicas, no OSI; hay que revisar los términos exactos de Liquid AI antes de cualquier uso comercial, y verificar si la redistribución de derivados abliterated está permitida.
- El repositorio es de un tercero (tinyopsec), no del autor original; no hay auditoría de que las cuantizaciones correspondan fielmente al checkpoint de heretic-org.
- Solo se publican ficheros GGUF: no hay safetensors en este repo, lo que impide reanudar entrenamiento o fine-tuning desde aquí.
- 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El repositorio ocupa 26,3 GB en total por acumular las 13 cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/LFM-2.5-2.6B-heretic-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Checkpoint de origen de la abliteration: https://huggingface.co/heretic-org/LFM-2.5-2.6B-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (solo páginas de contenido para adultos sin relación).
