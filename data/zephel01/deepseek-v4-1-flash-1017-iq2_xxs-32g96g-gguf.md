# zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF es una cuantización GGUF en formato beta del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario zephel01. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 748.494.643.824 parámetros totales según los safetensors del repositorio base. La cuantización está diseñada específicamente para ejecutarse en un ordenador con una GPU de 32 GB de VRAM y 96 GB de RAM, objetivo que da nombre al repositorio (32G96G).

El trabajo de zephel01 no es una cuantización convencional: aplica LDLQ (error-feedback rounding con estadísticas de entrada propias de cada experto) sobre los pesos originales en FP4, conservando los 384 expertos enrutados de cada capa sin poda. El resultado son dos conjuntos de shards, etiquetados 132G y 139G, que difieren en el número de bits por peso de los expertos (1,95 y 2,05 bits de media respectivamente) y en el tratamiento de las últimas capas.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 750.000 millones de parámetros en hardware de consumo de gama alta (RTX 5090 más un equipo con 96 GB de RAM), un escenario impensable para el modelo en precisión completa. El autor reporta métricas de calidad (KL, tareas de código, needle-in-a-haystack) y velocidad de decodificación medidas en un único equipo, y advierte explícitamente de que se trata de una versión BETA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); el modelo base usa pesos FP4 y una tabla Engram |
| Parametros totales | 748.494.643.824 (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han probado prompts de 8K y 32K en las evaluaciones del autor) |
| Tipos de cuantizacion | GGUF mixto: expertos en IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S e IQ3_XXS según capa; denso en Q8_0; tabla Engram en Q5_K |
| Idiomas soportados | no disponible (la model card incluye pruebas en japones e ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards por carpeta, apuntar a `-00001-of-00006.gguf`) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer MoE con 384 expertos enrutados por capa y pesos originales en FP4. La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO; esa información correspondería a la model card del modelo base, que no se ha proporcionado.

La innovación técnica de esta publicación es el proceso de cuantización LDLQ: en lugar de un redondeo imatrix convencional, se aplica redondeo con realimentación de error usando las estadísticas de entrada de cada experto individual. Según el autor, el redondeo plano a los mismos tipos producía un KL de 0,404, el redondeo propio de unsloth obtenía 0,198 y LDLQ baja a 0,194. Todo lo que no son expertos enrutados (atención, expertos compartidos, routers, embeddings, salida, metadatos y tokenizador) es byte-idéntico a la cuantización UD-IQ2_XXS de unsloth. La carpeta 139G sube un escalón de cuantización (IQ3_XXS) en las capas 35-39, donde se acumulan los errores.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y resolución de tareas de código: el autor reporta 10/10 tareas de código difíciles resueltas con tests ocultos.
- Tool calling en sesiones multi-turno: se valida una sesión de 7 turnos con llamadas a herramientas en tareas de código con tests superados.
- Recuperación en contexto largo: prueba needle-in-a-haystack superada con prompts de 8K y 32K.
- Capacidad multilingüe parcial: la model card incluye pruebas en japonés (3 prompts, sin mezcla de sistemas de escritura); el tag `japanese` figura en el repositorio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Ejecución local de un modelo de ~750B en un PC de gama alta: con una RTX 5090 (32 GB) y 96 GB de RAM, el modelo se reparte entre VRAM, RAM y SSD (los expertos de RAM se leen a demanda desde NVMe). Adecuado para desarrolladores que quieren experimentar con un MoE de gran escala sin infraestructura de datacenter.
- Asistencia de programación en local: las pruebas del autor muestran 10/10 tareas de código difíciles resueltas y sesiones de tool calling de 7 turnos con tests superados, lo que lo hace viable como copiloto de código autoalojado con privacidad total.
- Procesamiento de documentos largos: supera la prueba needle-in-a-haystack con prompts de 32K, útil para resumen y extracción de información en contratos, informes o bases de código extensas.
- Evaluación e investigación de cuantización: los dos conjuntos (132G y 139G) permiten comparar el compromiso calidad/velocidad de LDLQ frente a las cuantizaciones de unsloth, con métricas KL reproducibles.
- Despliegue con endpoint compatible: el tag `endpoints_compatible` permite integrarlo en servidores estilo OpenAI para prototipos de agentes conversacionales.
- Experimentación multilingüe con japonés: las pruebas en japonés sin mezcla de escrituras lo hacen apto para prototipos de atención al cliente en ese idioma, aunque la cobertura de idiomas no está documentada.
- Inferencia con decodificación especulativa: el autor usa el drafter DSpark de Lucebox para acelerar la decodificación, un patrón replicable en otros despliegues.

## Benchmarks y rendimiento

Calidad (KL frente al modelo sin cuantizar, top-256 log-probs, 8 secuencias de 1.023 tokens, motor Abyss con routing exacto):

| Modelo | Expertos (GB) | KL medio | Mismo token top | NLL |
|---|---:|---:|---:|---:|
| unsloth UD-IQ2_XXS | 156,9 | 0,142 | 83,7% | 2,173 |
| 139G (esta publicacion) | 139,4 | 0,182 | 81,6% | 2,204 |
| 132G (esta publicacion) | 132,2 | 0,194 | 81,1% | 2,215 |
| unsloth UD-IQ1_M | 132,2 | 0,198 | 81,7% | 2,209 |

Tareas reales (servidor Abyss, temperatura 1,0, top_p 0,95):

| Prueba | 132G | 139G | UD-IQ1_M | UD-IQ2_XXS |
|---|---:|---:|---:|---:|
| 10 tareas de código difíciles resueltas | 10/10 | 10/10 | 10/10 | 10/10 |
| Puntuación de calidad (graduada) | 77,6 | 81,4 | 81,1 | 78,8 |
| Needle 8K / 32K | OK / OK | OK / OK | OK / OK | OK / OK |
| Sesión tool-call 7 turnos, tests pasan | sí | sí | sí | sí |
| Japonés (3 prompts) | OK | OK | OK | OK |

Velocidad de decodificación (RTX 5090 en OCuLink PCIe Gen4 x4, Ryzen AI Max+ 395, RAM limitada a 60 GB, resto desde NVMe SSD, drafter DSpark):

| Decodificación (tok/s) | 132G | 139G | UD-IQ1_M |
|---|---:|---:|---:|
| 3 tareas de código | 67,5 | 57,9 | 71,8 |
| 10 tareas difíciles (media) | 58,0 | 47,8 | 52,5 |
| Prompt de 32K y decodificación | 43,4 | 43,4 | no disponible |

## Requisitos de hardware

- VRAM: 32 GB de GPU como objetivo de diseño; el resto del modelo se reparte entre RAM (96 GB en el equipo objetivo) y SSD.
- GPU recomendadas: RTX 5090 (32 GB) es la única medida con estos ficheros; la model card menciona también una Radeon AI PRO R9700 (32 GB) como guía aproximada, sin medición.
- RAM: 96 GB en el equipo objetivo; el autor limita el tier de RAM a 60 GB (`STRATA_GLM_RAM_GB=60`) y lee el resto desde NVMe.
- Almacenamiento: el repositorio ocupa 337,1 GB; cada carpeta requiere 275,8 GB (132G) o 283,0 GB (139G).
- Cabe en GPU de consumo: sí, con una GPU de 32 GB más un PC con 96 GB de RAM; un equipo de sobremesa con DDR5 de doble canal y sin iGPU será más lento que las cifras reportadas.
- Despliegue: motor Abyss (v1.3.9x) del propio autor, con decodificación especulativa DSpark; no se documentan otras opciones como vLLM, llama.cpp u Ollama en la información disponible.
- Rendimiento: 67,5 tok/s (132G) y 57,9 tok/s (139G) en tareas de código; 43,4 tok/s con prompt de 32K; variación de ±5% entre ejecuciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos (GB) | Formato | KL | Licencia |
|---|---:|---:|---|---:|---|
| Este repo, 132G | 748B (base) | 132,2 | GGUF LDLQ | 0,194 | MIT |
| Este repo, 139G | 748B (base) | 139,4 | GGUF LDLQ | 0,182 | MIT |
| unsloth UD-IQ1_M | 748B (base) | 132,2 | GGUF | 0,198 | MIT (base) |
| unsloth UD-IQ2_XXS | 748B (base) | 156,9 | GGUF | 0,142 | MIT (base) |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Versión BETA: las métricas proceden de un único PC; el autor solicita reportes de otras GPU y tamaños de RAM.
- La cuantización a ~2 bits por peso degrada la calidad frente al modelo sin cuantizar (KL 0,182-0,194 frente a 0,142 del UD-IQ2_XXS) y puede aumentar el riesgo de alucinación y errores en tareas sensibles a matices.
- El rendimiento depende críticamente del ancho de banda de RAM y SSD: equipos sin iGPU o con DDR5 de doble canal serán más lentos que las cifras medidas.
- El shard 6 (tabla Engram, 135,2 GB) se lee desde SSD fila a fila y nunca cabe entero en RAM; requiere almacenamiento NVMe rápido.
- No se documentan sesgos conocidos, cobertura de idiomas ni longitud de contexto oficial en la información disponible; las pruebas de idioma se limitan a inglés y japonés.
- Licencia MIT declarada en este repositorio, pero conviene verificar la licencia del modelo base DeepSeek-V4.1-Flash-1017 antes de uso comercial.
- El despliegue medido usa el motor Abyss del propio autor; el soporte en otros motores GGUF no está verificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio del motor Abyss: https://github.com/zephel01/Abyss
- Issues de Abyss: https://github.com/zephel01/Abyss/issues
- Variante Compact-32G96G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF
- Variante LDLQ-32G96G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF
