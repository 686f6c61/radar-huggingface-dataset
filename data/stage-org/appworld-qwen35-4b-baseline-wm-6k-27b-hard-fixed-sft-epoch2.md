# Stage-org/appworld-qwen35-4b-baseline-wm-6k-27b-hard-fixed-sft-epoch2

## Resumen

Stage-org/appworld-qwen35-4b-baseline-wm-6k-27b-hard-fixed-sft-epoch2 es un checkpoint de 4.539.265.536 parámetros (unos 4,54 mil millones) publicado en Hugging Face por la organización Stage-org. La etiqueta qwen3_5 y el propio identificador apuntan a un ajuste fino supervisado (SFT) sobre un modelo base de la familia Qwen3.5 de 4B, orientado al benchmark AppWorld, un entorno controlado de aplicaciones y personas diseñado para evaluar agentes de código interactivos. La nomenclatura del repositorio (baseline, wm-6k, 27b-hard-fixed, epoch2) sugiere un experimento de ajuste sobre datos «duros» generados por un modelo mayor, pero ninguno de estos extremos está documentado en la ficha del repositorio.

El artefacto no incluye model card, licencia declarada, idiomas soportados ni pipeline de inferencia, y acumula 11 descargas y 0 likes, por lo que se trata de un checkpoint de investigación sin validación comunitaria. Su interés es acotado: funciona como línea base (baseline) dentro de una serie de experimentos de agentes sobre AppWorld, no como modelo de propósito general listo para producción.

El tamaño del repositorio (9,1 GB) es coherente con pesos en precisión de 16 bits (4,54 mil millones de parámetros × 2 bytes ≈ 9,1 GB), lo que indica que no se publican cuantizaciones GGUF ni versiones comprimidas junto al checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El tag qwen3_5 sugiere un transformer denso de la familia Qwen3.5; no confirmado en la información proporcionada |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones), dato real de los safetensors |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors en 16 bits (≈9,1 GB para 4,54 mil millones de parámetros); no se incluyen GGUF, AWQ, GPTQ ni similar |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio no declara licencia; al derivar presuntamente de un modelo Qwen3.5, habría que verificar la licencia de la familia base antes de cualquier uso comercial |
| Formato de pesos | safetensors |
| Pipeline declarado | No disponible |
| Tamaño del repositorio | 9,1 GB |
| Fecha de creación | 2026-09-21 |
| Última actualización | 2026-09-21 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el tokenizador, el número de capas, la dimensión oculta ni el mecanismo de atención. Lo único verificable es el recuento de parámetros (4.539.265.536) y el formato de pesos (safetensors, 9,1 GB, compatible con precisión de 16 bits). El tag `qwen3_5` indica que el modelo parte de la familia Qwen3.5, y el sufijo `sft-epoch2` indica que se ha aplicado un ajuste fino supervisado durante al menos dos épocas sobre un checkpoint base. El resto del identificador (`appworld`, `baseline`, `wm-6k`, `27b-hard-fixed`) sugiere un experimento de ajuste con datos de AppWorld, posiblemente generados o filtrados por un modelo de 27B sobre tareas marcadas como difíciles, con un conjunto de unas 6.000 muestras; esta lectura es una interpretación del nombre del repositorio y no está confirmada por documentación alguna.

Se desconoce por completo la composición del dataset de ajuste, el número de tokens vistos, la existencia de fases de RLHF, DPO o RLVR, y si se aplicaron técnicas como decodificación especulativa, atención lineal o mezcla de expertos. Tampoco hay información sobre el régimen de entrenamiento (precisión, paralelismo, hardware) ni sobre posibles procesos de destilación desde el modelo de 27B mencionado en el nombre.

## Capacidades

No existe documentación que enumere las capacidades del modelo. A partir del modelo base presumido y del objetivo declarado en el identificador, cabría esperar lo siguiente, siempre sin confirmar:

- Generación de texto en lenguaje natural (capacidad heredada del base, no verificada en este checkpoint).
- Generación de código y razonamiento multi-paso, dado el enfoque en AppWorld, un benchmark de agentes de código interactivos.
- Llamada a herramientas y funciones (tool calling / function calling) en entornos con APIs simuladas, presumiblemente el eje del ajuste.
- Ejecución de tareas agénticas de varios turnos con observaciones del entorno.
- Razonamiento matemático y lógico básico, típico de modelos de 4B, sin datos publicados.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible; nada en el repositorio indica soporte multimodal.

## Casos de uso

- Reproducción de experimentos sobre AppWorld: el checkpoint sirve como línea base para comparar variantes de ajuste (por ejemplo, distintas épocas o volúmenes de datos) en el benchmark AppWorld, midiendo la tasa de tareas completadas por el agente.
- Evaluación de agentes de código en entornos controlados: permite montar un bucle de agente que interactúe con APIs simuladas y registre el éxito por tarea, útil para estudiar fallos de planificación y de uso de herramientas.
- Aprendizaje por imitación y generación de trayectorias: al estar ajustado con SFT sobre trayectorias, puede emplearse para producir demostraciones sintéticas que alimenten el entrenamiento de modelos mayores o de políticas de agente.
- Ajuste fino posterior para dominios concretos: con 4,54 mil millones de parámetros y pesos en safetensors, es viable reentrenar con LoRA o QLoRA en una única GPU de 24 GB para adaptarlo a APIs internas de una empresa.
- Prototipado de asistentes que usan herramientas sobre un catálogo cerrado de operaciones, donde el coste de error es bajo y se puede validar cada llamada antes de ejecutarla.
- Investigación en olvido catastrófico: al ser un SFT específico de un benchmark sobre un modelo generalista, resulta apropiado para medir cuánta capacidad general se pierde tras el ajuste, comparando contra el base sin ajustar.
- Servicio de inferencia de bajo coste para pruebas internas: el tamaño reducido permite desplegarlo en GPUs de gama media o incluso en CPU con cuantización, siempre que se acepte la ausencia de garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de AppWorld, MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web asociada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros confirmado (4,54 mil millones) y del tamaño de los pesos; no proceden de mediciones publicadas por el autor:

- Inferencia en bf16/fp16: aproximadamente 9,1 GB solo de pesos. Con caché KV y activaciones, entre 11 y 13 GB para contextos cortos, y por encima de 16 GB para contextos largos o lotes grandes.
- Cuantización a 8 bits (INT8, GPTQ, AWQ): en torno a 5 GB de pesos, más caché; manejable en GPUs de 8-12 GB.
- Cuantización a 4 bits (Q4_K_M, AWQ 4-bit): aproximadamente 2,7-3,5 GB de pesos; cabe en GPUs de 6-8 GB.
- GPUs recomendadas para producción: A100 40/80 GB, H100, L40S o A10G para despliegues con concurrencia; RTX 4090 o RTX 6000 Ada para nodos únicos.
- GPU de consumo: sí. En bf16 cabe en RTX 4080/4090 (16-24 GB) y en RTX 4060 Ti de 16 GB con contexto moderado; en 4 bits funciona en RTX 3060 de 12 GB, RTX 4060 de 8 GB e incluso en iGPU con memoria compartida.
- Opciones de despliegue: vLLM, SGLang y TGI para servicio con safetensors; llama.cpp u Ollama tras convertir los pesos a GGUF (conversión no publicada, habría que generarla); Transformers con accelerate para uso puntual.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo, TTFT ni rendimiento bajo batching en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados para construir una comparativa cuantitativa fiable, ya que el modelo no publica resultados de evaluación. La tabla siguiente es orientativa: las cifras de los modelos alternativos proceden de conocimiento general y deben contrastarse en sus fichas oficiales antes de citarlas.

| Modelo | Parámetros | Contexto declarado (referencia, sin verificar) | Licencia (referencia, sin verificar) | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Stage-org/appworld-qwen35-4b-baseline-...) | 4.539.265.536 | No disponible | No disponible | Checkpoint de investigación, 11 descargas |
| Qwen3-4B | ≈4.000 millones | 32.768 nativo, ampliable por YaRN | Apache 2.0 (por confirmar) | Ampliamente distribuido |
| Llama 3.2 3B Instruct | ≈3.200 millones | 128.000 | Licencia comunitaria de Llama | Ampliamente distribuido |
| Gemma 3 4B | ≈4.000 millones | 128.000 | Términos de uso de Gemma | Ampliamente distribuido |
| Phi-4-mini | ≈3.800 millones | 128.000 | MIT (por confirmar) | Ampliamente distribuido |

La diferencia sustancial no está en el tamaño, sino en el propósito: las alternativas son modelos generalistas con cuantizaciones oficiales y licencias explícitas, mientras que este checkpoint es un artefacto de investigación especializado en un benchmark, sin model card ni licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución. Además, al derivar presumiblemente de Qwen3.5, las condiciones de la familia base podrían aplicar y no están documentadas aquí.
- Ausencia total de model card: no se especifican datos de entrenamiento, idiomas, sesgos, ni limitaciones conocidas, lo que impide evaluar riesgos de forma informada.
- Riesgo de sobreajuste al benchmark: el identificador sugiere un ajuste específico sobre AppWorld con un volumen reducido de datos (posiblemente 6.000 muestras). Es probable un sobreajuste al formato de ese entorno y una degradación de capacidades generales fuera de él (olvido catastrófico).
- Sesgos: no disponibles. Al no documentarse la composición del dataset, se desconoce la representación de idiomas, culturas y dominios.
- Alucinación: esperable en un modelo de 4B ajustado con SFT. En tareas de agente, el riesgo se traduce en llamadas a herramientas inexistentes, argumentos mal formados o bucles de acción repetidos.
- Contexto e idiomas desconocidos: no se puede garantizar un rendimiento correcto en castellano ni en ventanas de contexto largas.
- Sin cuantizaciones publicadas: cualquier despliegue en 4 u 8 bits exige convertir los pesos, con el consiguiente riesgo de degradación no medida.
- Validación comunitaria nula: 11 descargas y 0 likes implican que no hay informes independientes de calidad, estabilidad ni seguridad.
- Estado del arte superado con rapidez: la fecha de creación (septiembre de 2026) y el carácter de línea base experimental hacen probable que quede obsoleto frente a iteraciones posteriores de la misma serie.
- No apto para producción sin evaluación previa: antes de integrarlo en un sistema real conviene medir tasa de éxito en tareas propias, latencia y coste, y establecer validación de las acciones del agente antes de su ejecución.

## Enlaces

- Ficha de Hugging Face: https://huggingface.co/Stage-org/appworld-qwen35-4b-baseline-wm-6k-27b-hard-fixed-sft-epoch2

La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo: los resultados obtenidos corresponden a portales de ofertas de prácticas («stage» en francés) y no guardan relación con el artefacto. Por tanto, no hay papers, blogs, repositorios ni demos adicionales confirmados en la información disponible.

Referencias potencialmente relacionadas, no localizadas en esta búsqueda y pendientes de verificación: el benchmark AppWorld y su publicación asociada, que servirían para interpretar el propósito del ajuste, pero que no pueden citarse aquí con datos verificados.
