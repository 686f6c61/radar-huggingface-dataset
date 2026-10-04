# TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF

## Resumen

TTQ (TokenTinkerer Quant) es un conjunto de diez cuantizaciones GGUF derivadas del fine-tune HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, publicado por el usuario TokenTinkerer. No es un modelo nuevo: es una escalera de re-cuantizaciones de 3,33 a 6,72 bits por peso (bpw), construida explícitamente para maximizar la eficiencia por byte frente a los cuantizados del repositorio original. El modelo subyacente es un transformer de mezcla de expertos (MoE) con 34.660.610.688 parámetros totales y una nomenclatura A3B que sugiere unos 3.000 millones de parámetros activos por token, aunque ese dato no se confirma en la model card.

El problema que resuelve es práctico: el fine-tune base solo se publica en formato GGUF y su archivo de mayor calidad es un `Q8_K_P` de aproximadamente 10 bpw, que sirve a la vez como fuente de re-cuantización y como referencia de todas las métricas. A partir de él, el autor mide divergencia KL, perplejidad, RMS de la diferencia de probabilidad del token real y velocidad de decodificación para cada escalón, y demuestra que sus archivos baten al cuantizado de tamaño comparable del repositorio base por un factor de KLD de 1,26× a 3,51×.

Es relevante por dos motivos. Primero, ofrece diez puntos de operación medidos bajo el mismo protocolo, lo que permite elegir con datos en lugar de por convención. Segundo, el mayor de los archivos ocupa 27,10 GiB y el menor 13,46 GiB, lo que sitúa el modelo en el rango de estaciones de trabajo con GPU de consumo si se descargan los expertos a CPU. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer de mezcla de expertos (MoE); etiquetado como `moe` en el repositorio |
| Parámetros totales | 34.660.610.688 (34,66 mil millones) |
| Parámetros activos | aproximadamente 3.000 millones, deducido de la nomenclatura A3B del nombre; no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | diez escalones GGUF: IQ3_XXS (3,33 bpw, 13,46 GiB), IQ3_XS (3,51 bpw, 14,16 GiB), Q3_K_S (3,67 bpw, 14,84 GiB), Q3_K_M (3,93 bpw, 15,85 GiB), IQ4_XS (4,19 bpw, 16,90 GiB), IQ4_NL (4,51 bpw, 18,20 GiB), Q4_K_M (4,90 bpw, 19,76 GiB), Q5_K_S (5,59 bpw, 22,54 GiB), Q5_K_M (6,06 bpw, 24,45 GiB), Q6_K (6,72 bpw, 27,10 GiB) |
| Idiomas soportados | inglés (en) y chino (zh), según los metadatos; no se detalla la cobertura real |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no existen pesos en safetensors ni versión F16/BF16 del fine-tune |

## Arquitectura y entrenamiento

La ficha de este repositorio no documenta el entrenamiento del modelo base, sino el proceso de cuantización. El fine-tune de partida es HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, un modelo MoE de la familia Qwen3.6 con 34,66 mil millones de parámetros totales, publicado únicamente en GGUF y sin liberación en precisión completa. Según el propio autor, el archivo de mayor calidad disponible es el `Q8_K_P` upstream de unos 10 bpw, que se usa como fuente para re-cuantizar cada escalón y simultáneamente como referencia contra la que se miden todas las cifras de KLD y RMS.

La innovación técnica del repositorio es el método de cuantización y su verificación. Cada escalón utiliza una matriz de importancia (imatrix) y una elección de tipo declarado deliberadamente conservadora: el token final del nombre (`general.file_type`) se escoge para subestimar la tasa real y para ser distinto en los diez archivos, evitando que el selector de descargas de HuggingFace colapse dos variantes en una sola entrada. El nombre del archivo declara el bpw verdadero medido a partir del tamaño en bytes, que es el dato fiable, mientras que el tipo declarado (por ejemplo IQ3_XXS) no describe con exactitud el contenido: el archivo de 3,33 bpw está muy por encima de los 3,06 bpw que ese tipo implica nominalmente.

La model card advierte de una limitación metodológica importante: al no existir un original en precisión completa, todas las cifras de calidad son relativas al `Q8_K_P` y no al modelo sin cuantizar. Una fracción desconocida de la divergencia medida es heredada de ese archivo y no puede separarse sin una fuente F16/BF16. Las comparaciones entre archivos del conjunto sí son válidas porque comparten referencia. No se documentan en la información disponible los detalles de entrenamiento del fine-tune (número de tokens, composición del dataset, uso de RLHF/DPO), aunque el nombre «Uncensored» y la afirmación del repositorio de GitHub asociado («0/465 refusals») indican un ajuste orientado a eliminar rechazos.

## Capacidades

- Generación de texto conversacional en inglés y chino, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y generación de código: esperable por la familia base, aunque no se aportan evaluaciones específicas en la información disponible.
- Capacidad multimodal: un artículo de terceros (BestHub) atribuye al modelo base capacidad multimodal, pero la model card de este repositorio no la menciona y no se confirma en los metadatos.
- Modo sin restricciones editoriales: el fine-tune está orientado a reducir rechazos, con la afirmación de 0 rechazos sobre 465 pruebas en el repositorio de GitHub enlazado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos; no se documenta cobertura de otros idiomas.
- Capacidad especial de cuantización: diez puntos de operación con métricas de divergencia publicadas, útil para estudiar el compromiso tamaño/calidad.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de consumo: los escalones de 3,33 a 4,90 bpw (13,46–19,76 GiB) permiten ejecutar el modelo descargando expertos a CPU con `-ncmoe`, reduciendo de forma notable la VRAM necesaria en comparación con una carga completa en GPU.
- Generación de contenido creativo sin filtros editoriales: el ajuste «Uncensored» y las 465 pruebas sin rechazo declaradas lo hacen apto para redacción de narrativa, guiones o material editorial donde los modelos alineados se niegan a generar.
- Red teaming y evaluación de seguridad: generar deliberadamente contenido que los modelos alineados rechazan para entrenar y validar clasificadores de contenido, o para medir la robustez de filtros propios.
- Asistentes conversacionales en inglés y chino con coste de cómputo bajo: al activar aproximadamente 3.000 millones de parámetros por token (según la nomenclatura A3B), el coste de inferencia por token es bajo en relación con los 34,66 mil millones totales.
- Investigación sobre cuantización: el conjunto de diez escalones con KLD, perplejidad y RMS medidos sobre el mismo corpus y con el mismo procedimiento permite estudiar empíricamente la curva calidad/bpw sin montar un banco de pruebas propio.
- Punto de partida para ajuste fino o destilación: los escalones Q5_K_M (6,06 bpw) y Q6_K (6,72 bpw) son los candidatos lógicos para trabajar en local cuando la calidad importa más que el tamaño.
- Despliegue en pipelines de generación por lotes sobre hardware híbrido CPU/GPU: el formato GGUF y la compatibilidad con llama.cpp permiten colocarlo en colas de procesamiento donde la VRAM es el recurso escaso.
- Traducción inglés–chino y viceversa en entornos privados, sin envío de datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica son métricas de cuantización medidas por el autor sobre 40 fragmentos fijos de un conjunto de evaluación interno, con la misma máquina y el mismo protocolo para todos los archivos. La columna `tg128` es la decodificación medida con `llama-bench` de llama.cpp en la configuración `-ncmoe 40` (todos los expertos en CPU), `-p 512 -n 128 -r 5`, en tokens por segundo.

| Archivo | Tipo declarado | GiB | bpw | KLD ± | PPL(Q) | RMS Δp | tg128 (tok/s) |
|---|---|---|---|---|---|---|---|
| TTQ-3.33bpw-IQ3_XXS | IQ3_XXS (23) | 13,46 | 3,33 | 0,060539 ± 0,001366 | 6,060 | 7,339 % | 27,07 |
| TTQ-3.51bpw-IQ3_XS | IQ3_XS (22) | 14,16 | 3,51 | 0,051261 ± 0,001194 | 6,094 | 6,757 % | 26,30 |
| TTQ-3.67bpw-Q3_K_S | Q3_K_S (11) | 14,84 | 3,67 | 0,042459 ± 0,001034 | 5,960 | 5,924 % | 36,28 |
| TTQ-3.93bpw-Q3_K_M | Q3_K_M (12) | 15,85 | 3,93 | 0,034379 ± 0,000873 | 5,959 | 5,205 % | 37,41 |
| TTQ-4.18bpw-IQ4_XS | IQ4_XS (30) | 16,90 | 4,19 | 0,025999 ± 0,000740 | 5,944 | 4,520 % | 37,22 |
| TTQ-4.51bpw-IQ4_NL | IQ4_NL (25) | 18,20 | 4,51 | 0,018427 ± 0,000634 | 5,896 | 3,789 % | 53,86 |
| TTQ-4.90bpw-Q4_K_M | Q4_K_M (15) | 19,76 | 4,90 | 0,015152 ± 0,000886 | 5,902 | 3,415 % | 53,36 |
| TTQ-5.59bpw-Q5_K_S | Q5_K_S (16) | 22,54 | 5,59 | 0,011316 ± 0,000672 | 5,879 | 3,115 % | 48,65 |
| TTQ-6.06bpw-Q5_K_M | Q5_K_M (17) | 24,45 | 6,06 | 0,007621 ± 0,000252 | 5,868 | 2,501 % | 48,38 |
| TTQ-6.72bpw-Q6_K | Q6_K (18) | 27,10 | 6,72 | 0,005800 ± 0,000218 | 5,872 | 2,173 % | 45,46 |

Comparación declarada por el autor frente al cuantizado de tamaño o calidad más cercano del repositorio base:

| Este conjunto | Archivo del repo base | KLD | Tamaño | Decodificación | Prefill | RMS Δp |
|---|---|---|---|---|---|---|
| 6,72 bpw Q6_K (27,10 GiB) | Q6_K_P (28,54 GiB) | 1,61× mejor (5,1σ) | −1,44 GiB | +11 % | +50 % | mejor |
| 6,06 bpw Q5_K_M (24,45 GiB) | Q6_K_P | 1,23× mejor (2,5σ) | −4,09 GiB | +19 % | +80 % | mejor |
| 5,59 bpw Q5_K_S (22,54 GiB) | Q5_K_P (26,10 GiB) | 1,28× mejor (3,9σ) | −3,56 GiB | +6 % | +28 % | mejor |
| 4,90 bpw Q4_K_M (19,76 GiB) | Q5_K_P | empate (0,65σ) | −6,34 GiB | +16 % | +45 % | mejor |

Según el autor, cada escalón bate al cuantizado de tamaño más cercano del repositorio base en KLD por un factor de 1,26× a 3,51×, y su equivalente de calidad comparable en el repositorio base ocupa entre 1,44 y 7,90 GiB más.

## Requisitos de hardware

- Para descarga completa en GPU, la VRAM necesaria ronda el tamaño del archivo más el contexto y el overhead del runtime: entre 13,46 GiB (3,33 bpw) y 27,10 GiB (6,72 bpw) de pesos, más el coste del KV cache según la longitud de contexto empleada (no documentada).
- Con descarga parcial de expertos a CPU (`-ncmoe`, la configuración usada por el autor con 40 capas de expertos en CPU), los requisitos de VRAM bajan de forma sustancial; un artículo de terceros (BestHub) afirma que el modelo puede ejecutarse con 6 GB de VRAM en esta modalidad, cifra no verificada de forma independiente.
- GPU recomendadas por tramo: en el extremo alto, una RTX 4090 o superior permite cargar los escalones de 3,33 a 4,90 bpw en su totalidad; los escalones de 5,59 a 6,72 bpw requieren tarjetas con 24 GB o más, o bien offload parcial. Para despliegue multiusuario, A100/H100 de 40–80 GB.
- En GPU de consumo: los escalones bajos (3,33–4,51 bpw, 13,46–18,20 GiB) caben en tarjetas de 24 GB con margen para contexto; en tarjetas de 12 GB o menos es necesario el offload de expertos a CPU.
- Opciones de despliegue: llama.cpp es la librería declarada y el formato es GGUF, por lo que también son viables Ollama y otras herramientas compatibles con GGUF. No se menciona compatibilidad con vLLM o TGI en la información disponible.
- Rendimiento medido: decodificación de 26,30 a 53,86 tok/s en la configuración `-ncmoe 40`, `-p 512 -n 128 -r 5`. El escalón más rápido en decodificación es IQ4_NL (53,86 tok/s) y el más lento IQ3_XS (26,30 tok/s, tipo con libro de códigos). En prefill, el autor reporta mejoras de entre el 28 % y el 80 % frente al repositorio base en pares de calidad comparable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KLD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TTQ 6,72 bpw Q6_K (este repo) | 34,66 mm totales / ~3 mm activos | no disponible | 0,005800 ± 0,000218 | Apache 2.0 | GGUF, 27,10 GiB |
| HauhauCS `Q6_K_P` (repo base) | 34,66 mm totales / ~3 mm activos | no disponible | referencia (1,61× peor que TTQ Q6_K según el autor) | Apache 2.0 | GGUF, 28,54 GiB |
| HauhauCS `Q5_K_P` (repo base) | 34,66 mm totales / ~3 mm activos | no disponible | referencia (TTQ Q4_K_M empata con 6,34 GiB menos) | Apache 2.0 | GGUF, 26,10 GiB |
| TokenTinkerer MTP-GGUF (mismo autor) | 34,66 mm totales / ~3 mm activos | no disponible | no disponible | Apache 2.0 | GGUF, variante MTP |

No se dispone de comparación con modelos de otros autores de tamaño o tarea equivalente en la información proporcionada. La comparación relevante es interna al ecosistema de cuantizaciones de este mismo fine-tune, ya que no existe una versión en precisión completa que sirva de referencia absoluta.

## Limitaciones y advertencias

- No existe versión en precisión completa (F16/BF16) del fine-tune. Todas las métricas de calidad se miden contra el `Q8_K_P` upstream y no contra el modelo original, por lo que una fracción desconocida de la divergencia es heredada y no separable.
- El `Qwen/Qwen3.6-35B-A3B` base de precisión completa no es un sustituto válido para esa comparación, porque el fine-tune es un modelo distinto.
- El modelo está ajustado para reducir rechazos («Uncensored», 0/465 refusals declaradas). Esto implica un riesgo elevado de generar contenido dañino, ilegal o sesgado sin las salvaguardas habituales. No es adecuado para aplicaciones orientadas al usuario final sin filtros propios.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable el comportamiento típico de un modelo de 3.000 millones de parámetros activos.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está documentado y no puede asumirse.
- Longitud de contexto no especificada en la información disponible, lo que impide planificar cargas de contexto largo y calcular el coste real de KV cache.
- Cifras de benchmark no estándar: las métricas publicadas son de cuantización (KLD, PPL, RMS Δp), no de capacidades (MMLU, HumanEval, GSM8K). No sirven para comparar este modelo con otras familias.
- Los datos de velocidad proceden de una única configuración de hardware y de un único protocolo (`-ncmoe 40`), no son extrapolables a otras máquinas.
- La licencia Apache 2.0 es permisiva para uso comercial, pero se aplica al artefacto publicado; el fine-tune hereda la licencia del modelo base, cuya ficha no se ha verificado en detalle aquí.
- El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, con fecha de creación y actualización del 4 de octubre de 2026. No hay validación comunitaria independiente de las cifras del autor.
- La model card está truncada en la información disponible: las secciones de límites («Limits and things that did not work») y de condiciones de medición de velocidad («Speed column conditions») no están completas, por lo que podrían existir advertencias adicionales del autor no recogidas aquí.

## Enlaces

- Repositorio HuggingFace de este conjunto: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Modelo base del fine-tune: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Variante MTP GGUF del mismo autor: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Agressive-MTP-GGUF
- Repositorio GitHub del modelo base: https://github.com/chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/tree/main
- Artículo de terceros sobre ejecución con poca VRAM (BestHub): https://www.besthub.dev/articles/run-a-35b-open-source-llm-on-6-gb-vram-qwen3-6-35b-a3b-uncensored-jailbreak-edition-1dbcc3c6a4c8
- Ficha del modelo base en Mixpeek: https://mixpeek.com/model/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
