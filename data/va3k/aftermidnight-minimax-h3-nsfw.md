# va3k/AfterMidnight-MiniMax-H3-NSFW

## Resumen

AfterMidnight-MiniMax-H3-NSFW es un adaptador LoRA publicado por el usuario va3k sobre el modelo de generación de vídeo omnicanal MiniMax H3, concretamente sobre su ruta ref2va (referencia a vídeo con audio). No es un modelo completo: se distribuye como pesos de adaptación que se cargan junto al modelo base para desplazar la generación hacia contenido para adultos, con énfasis en movimiento coherente y en detalle de textura. El repositorio ocupa 4,8 GB y contiene dos variantes entrenadas sobre el mismo conjunto de datos con estilos distintos: «sexytime», pensada para escenas sexuales y movimiento coherente, y una versión «softer» más centrada en el detalle y en un acabado de estilo surrealista. La ficha no documenta rango del adaptador, número de pasos de entrenamiento, composición del dataset ni parámetros del modelo base.

La relevancia de esta publicación es acotada y muy específica: los modelos base de vídeo suelen aplicar moderación en la inferencia alojada, de modo que los adaptadores comunitarios son la vía habitual para trabajar en dominios que esas políticas restringen. Además, el autor documenta un requisito de muestreo no trivial (sampler euler con scheduler beta) para evitar artefactos de audio, un detalle operativo que condiciona cualquier integración en producción. El modelo está etiquetado como `not-for-all-audiences` y acumula 0 descargas y 0 «likes» en el momento de la consulta, por lo que carece de validación por parte de terceros.

La licencia declarada es Apache 2.0, pero la model card no aclara si esa licencia cubre únicamente el adaptador o si el uso queda además condicionado por los términos del modelo base MiniMax H3, aspecto que debe verificarse antes de cualquier uso comercial. Toda la información técnica disponible procede de la propia model card y de referencias externas sobre MiniMax H3; no hay resultados de benchmarks ni evaluación cuantitativa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax H3, ruta ref2va; arquitectura del modelo base no disponible en la información proporcionada |
| Parámetros totales | no disponible (no se indica el rango del adaptador; el repositorio pesa 4,8 GB) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no se especifica número de fotogramas ni duración de vídeo soportada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (según etiquetas y model card); licencia del modelo base MiniMax H3 no detallada |
| Formato de pesos | no disponible (no se especifica en la model card; el repositorio contiene 4,8 GB de pesos) |
| Variantes incluidas | 2: «sexytime» (fuerza 1.0) y «softer» (fuerza 0.8-1.0) |
| Muestreo recomendado | sampler euler y scheduler beta (obligatorio según el autor para evitar problemas de audio) |
| Casos de uso declarados | generación de vídeo para adultos; no se declaran otros |
| Creado / actualizado | 2026-09-30 (fechas registradas en HuggingFace, sin actualizaciones posteriores) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe un adaptador LoRA, no una arquitectura propia. Se entrena sobre el modelo MiniMax H3 en su variante ref2va, es decir, la ruta de generación de vídeo condicionada por una referencia, con salida de audio asociada. El autor indica que las dos variantes («sexytime» y «softer») proceden del mismo dataset pero de estilos de entrenamiento diferentes: la primera se orientó a escenas sexuales y a coherencia de movimiento, mientras que la segunda se centró en el detalle y en un acabado de estilo surrealista, sin forzar tanto la dinámica. No se especifican rango del LoRA, resolución de entrenamiento, número de pasos, tasa de aprendizaje, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO).

Tampoco se documenta la composición del dataset, su tamaño, su procedencia ni los criterios de consentimiento y licencia de las imágenes o vídeos empleados, algo especialmente relevante en un adaptador de contenido para adultos. Como contexto externo, las referencias web describen MiniMax H3 como un modelo omnicanal de generación de vídeo con codificadores de texto, cuantizaciones y herramientas de despliegue local (por ejemplo, ComfyUI); esos materiales no forman parte de esta publicación ni confirman detalles de arquitectura interna. La innovación técnica declarada por el autor se limita a la restricción de muestreo (euler + beta) para mantener la coherencia del audio generado.

## Capacidades

- Aplicación de un estilo y una temática de contenido para adultos sobre la generación de vídeo del modelo base MiniMax H3.
- Generación condicionada por referencia (ruta ref2va), con producción conjunta de vídeo y audio, según la model card.
- Variante «sexytime»: optimizada para escenas sexuales y coherencia de movimiento.
- Variante «softer»: orientada a detalle fino y estética surrealista, con menor énfasis en el movimiento; el autor la usa a fuerza 1.0.
- Control de intensidad del efecto mediante el parámetro de fuerza del LoRA (0.8-1.0 en la variante «softer», 1.0 en «sexytime»).
- Compatibilidad declarada con el pipeline de muestreo euler + beta para evitar artefactos de audio.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades multilingües ni modo «thinking». El adaptador no es un modelo de lenguaje y no se le atribuyen esas funciones.

## Casos de uso

- Producción de contenido para adultos en estudio: el adaptador se carga sobre MiniMax H3 para generar planos con movimiento coherente a partir de una referencia, dentro de un flujo de trabajo controlado y con revisión humana previa a la publicación.
- Postproceso y ajuste de estilo en pipelines existentes: al ser un LoRA, permite alternar entre las variantes «sexytime» y «softer» sin volver a cargar el modelo base, lo que facilita iterar sobre detalle frente a dinámica en una misma sesión de generación.
- Investigación sobre adaptación de modelos de vídeo: sirve como caso de estudio de cómo un LoRA de bajo rango desplaza el comportamiento de un modelo omnicanal en un dominio restringido, útil para estudiar olvido catastrófico y pérdida de coherencia temporal.
- Evaluación de clasificadores de moderación: el contenido generado puede emplearse como conjunto de prueba interno para medir la tasa de detección de modelos de seguridad y de filtros NSFW en plataformas.
- Diagnóstico de sincronización audio-vídeo: dado que el autor documenta fallos de audio con otros samplers, es un banco de pruebas práctico para comparar configuraciones de muestreo y su efecto sobre la pista de audio generada.
- Prototipado de herramientas de generación local: integrado en una interfaz tipo ComfyUI, permite evaluar el coste real de ejecutar generación de vídeo con audio en hardware propio frente a servicios alojados con moderación estricta.
- Automatización de variaciones sobre una referencia: en un flujo de producción que necesite múltiples tomas del mismo sujeto, el condicionamiento por referencia permite mantener consistencia entre planos generados con distintas fuerzas del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, calidad de audio, coherencia temporal ni comparaciones con otros adaptadores), y las búsquedas web consultadas no aportan evaluaciones de este LoRA concreto. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio pesa 4,8 GB, por lo que hay que prever ese espacio adicional de pesos sobre el modelo base; el coste real en VRAM depende del formato de carga y no está documentado.
- VRAM total: no disponible. Al tratarse de un LoRA sobre un modelo de generación de vídeo con audio, el consumo dominante es el del modelo base MiniMax H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Para modelos de vídeo de esta categoría suelen emplearse GPUs de datacenter (A100, H100) o tarjetas de gama alta con 24 GB o más, pero no hay confirmación para este caso concreto.
- ¿Cabe en GPU de consumo? No confirmado. La viabilidad depende enteramente del modelo base y de la resolución y duración de los vídeos; el autor no publica cifras.
- Opciones de despliegue: las referencias web apuntan a inferencia local con ComfyUI para MiniMax H3, con disponibilidad de cuantizaciones y codificadores de texto en el ecosistema de la comunidad. Para este LoRA no se documenta compatibilidad explícita con vLLM, TGI, llama.cpp u Ollama (herramientas, por lo demás, orientadas a modelos de lenguaje y no a difusión de vídeo).
- Latencia y throughput: no disponible.
- Restricción operativa: es obligatorio usar sampler euler y scheduler beta; otras combinaciones producen, según el autor, problemas de audio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AfterMidnight-MiniMax-H3-NSFW (va3k) | LoRA sobre MiniMax H3 ref2va | no disponible (repo de 4,8 GB) | no disponible | sin benchmarks publicados | apache-2.0 (adaptador) | HuggingFace, 0 descargas |
| MiniMax H3 (base, ref2va) | Modelo omnicanal de generación de vídeo con audio | no disponible | no disponible | referencia del ecosistema; sin datos en esta búsqueda | no disponible | distribuido por su autor original |
| LoRAs NSFW de la comunidad para difusión de vídeo (por ejemplo, adaptadores para Flux u otros backbones) | Adaptadores de estilo/temática | no disponible | no disponible | sin benchmarks comparables publicados | variable (habitualmente permisiva) | HuggingFace, con moderación variable |

No se dispone de comparativas cuantitativas entre este adaptador y alternativas equivalentes: no hay métricas públicas, ni evaluación de coherencia temporal, ni pruebas de sincronización de audio que permitan un ranking objetivo.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences` y su finalidad declarada es la generación de material NSFW. Requiere control de acceso, verificación de edad y cumplimiento de la normativa aplicable en cada jurisdicción.
- Riesgo legal y ético grave: no se documenta el origen del dataset, ni consentimiento de las personas representadas, ni mecanismos para impedir la generación de contenido sexual no consentido o de personas menores de edad. Cualquier despliegue debe incorporar filtros y verificación previa.
- Sin validación por terceros: 0 descargas y 0 «likes». No hay evidencia de uso reproducible ni de calidad verificada por la comunidad.
- Ausencia total de benchmarks: no hay métricas de calidad de vídeo, coherencia temporal, fidelidad a la referencia ni calidad de audio.
- Sesgos: no evaluados ni documentados. En modelos de difusión de vídeo son habituales los sesgos de representación corporal, etnia, edad y tipo de cuerpo, agravados aquí por la falta de evaluación.
- Alucinación y artefactos: en generación de vídeo se traduce en deformaciones anatómicas, incoherencia entre fotogramas y fallos de audio. El autor advierte explícitamente de problemas de audio si no se usa euler + beta; no cuantifica su frecuencia.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma. Su comportamiento, licencia efectiva y requisitos de hardware quedan supeditados a MiniMax H3, cuyos términos no se detallan aquí.
- Ambigüedad de licencia: Apache 2.0 se declara a nivel de repositorio, pero no se aclara si cubre el uso comercial del contenido generado ni si entra en conflicto con la licencia del modelo base. Verificar antes de cualquier explotación comercial.
- Idiomas y contexto: no disponibles; no se puede planificar soporte multilingüe ni longitudes de vídeo concretas con la información publicada.
- Metadatos a revisar: las fechas registradas (creación y actualización el 2026-09-30, sin cambios posteriores) conviene contrastarlas antes de tratarlas como referencia temporal fiable.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, int8 ni similares, lo que dificulta el despliegue en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/va3k/AfterMidnight-MiniMax-H3-NSFW
- Listado de modelos NSFW en HuggingFace (referencia de ecosistema): https://huggingface.co/models?search=nsfw
- Guía sobre despliegue local de MiniMax H3 y moderación: https://kingy.ai/blog/can-minimax-h3-generate-uncensored-video-what-local-deployment-actually-changes/
- Artículo sobre generación de vídeo sin censura con MiniMax H3: https://medium.com/data-science-in-your-pocket/uncensored-video-generation-using-minimax-h3-dc53e2102eb6
- Repositorio de recursos de MiniMax H3 (codificadores de texto, cuantizaciones y herramientas): https://github.com/wildminder/awesome-minimax-H3
- Evaluación de flujos de edición de imagen NSFW con MiniMax H3: https://crepal.ai/blog/aiimage/minimax-h3-nsfw-image-editor/
- Paper, blog oficial o repositorio del autor de este LoRA: no disponible en la información proporcionada.
