# yemara/Qwen3.8-27B-NVFP4-sharar-w3

## Resumen

`yemara/Qwen3.8-27B-NVFP4-sharar-w3` es un repositorio de puntos de control (checkpoints) de decodificación en 3 bits calibrados con GPTQ, publicados por el usuario yemara el 2 de octubre de 2026 para el perfil de servicio `fast` de Sharar. No es un modelo autónomo: contiene 304 copias cuantizadas de las proyecciones MLP (gate_up/down) y de atención/GDN de las 64 capas de Qwen3.8-27B, destiladas desde la publicación FP8 con bloques de 128 de Qwen y ajustadas sobre el objetivo `RadixArk/Qwen3.8-27B-NVFP4`.

El problema que resuelve es puramente de eficiencia de servido. Los pesos NVFP4/FP8 del modelo base siguen encargándose del prefill y de las llamadas anchas, mientras que las llamadas de como máximo 64 filas leen estas copias de 3 bits, lo que reduce el coste de la ruta de decodificación. En las mediciones del propio autor, esto aporta una velocidad de 1,83x a batch uno y un 22 % más de tokens por ronda, con un KL de la ruta de decodificación de 0,108 frente a un suelo de 0,020.

El modelo subyacente, Qwen3.8-27B, es un LLM denso de 27 000 millones de parámetros, multimodal nativo, construido sobre la arquitectura Qwen3.5 y sucesor de Qwen3.6-27B. El repositorio ocupa 9,9 GB y se distribuye bajo licencia Apache 2.0. Es importante señalar que su compuerta de calidad interna lo marcó como **rechazado** por una regresión estadísticamente significativa en MBPP, aunque el operador adoptó igualmente estas copias como predeterminadas para el perfil `fast` del 27B el 2 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5) con capas de atención y GDN; 64 capas |
| Parametros totales | 27B en el modelo base; este repositorio contiene 304 proyecciones cuantizadas (MLP gate_up/down y proyecciones de atención/GDN de las 64 capas) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits mediante GPTQ con libro de códigos E4M3 de ocho niveles, grupos de 32 pesos y amortiguamiento 0,01; el modelo base usa NVFP4 (receta mixta W4A4) y FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio incluye `manifest.json` con hashes por fichero y `calibration-inputs.json`; no se especifica el contenedor de pesos) |

## Arquitectura y entrenamiento

El artefacto no se entrena desde cero: se ajusta mediante GPTQ sobre los pesos FP8 del release `Qwen/Qwen3.8-27B-FP8` (revisión `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a`), que emplea cuantización FP8 con bloques de 128. El objetivo declarado es el checkpoint `RadixArk/Qwen3.8-27B-NVFP4@319f741cce68d7914884900c138a1fbb70a42f30`. Se calibraron 304 proyecciones con un libro de códigos E4M3 de ocho niveles, grupos de 32 pesos y amortiguamiento 0,01, sobre 64 muestras y 87 622 tokens de los propios ficheros fuente de Sharar en el commit `bc7984f` (el mismo conjunto que usa el checkpoint de Flash-Next).

El comando de reconstrucción documentado es `SHARAR_W3_DECODE=0 python3 -m bench.w3_calibrate --inputs calibration-inputs.json --source <FP8 snapshot> --output DIR`, ejecutado en la imagen `sharar:main-20261001`, con un coste de 20 minutos en una única GPU GB10. El `manifest.json` registra las revisiones de origen y destino, el hash de las entradas, informes de ajuste por proyección y hashes por fichero, y el cargador de Sharar los verifica. No se documenta ningún proceso de RLHF, DPO ni ajuste por instrucciones asociado a este artefacto, ya que se limita a la cuantización de un modelo previamente entrenado.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas heredados del modelo base Qwen3.8-27B; este repositorio no añade ni retira capacidades por sí mismo, solo altera la precisión numérica de la ruta de decodificación.
- Multimodalidad nativa: el modelo base está descrito por el equipo de Qwen como un LLM denso multimodal nativo, con capacidades de visión.
- Flujos agénticos: el modelo base está orientado explícitamente a *agentic workflows*, según la documentación de Alibaba.
- Automatización de oficina: caso de uso destacado por el equipo de Qwen para el modelo base.
- Compatibilidad con *tool calling*: no disponible explícitamente en la información proporcionada para este repositorio; la guía de terceros sobre Qwen3.8-27B menciona uso de herramientas en el modelo base.
- Multilingüismo: no disponible.
- Modo de razonamiento (*thinking*): no disponible.

## Casos de uso

- Servido de alta concurrencia en el perfil `fast` de Sharar: las llamadas de hasta 64 filas se resuelven contra estas copias de 3 bits, mientras el prefill y las llamadas anchas siguen usando los pesos NVFP4/FP8. Es el escenario para el que el artefacto fue construido y calibrado.
- Despliegue en hardware de gama de escritorio o nodo único: el repositorio de 9,9 GB más el modelo base permiten montar una instancia local en una GPU Blackwell, siguiendo el tutorial de DGX Spark enlazado más abajo.
- Reducción del coste por token en producción: el 1,83x de velocidad a batch uno y el 1,22x de tokens por ronda se traducen directamente en menor tiempo de GPU por petición en cargas de decodificación con lotes pequeños.
- Evaluación de técnicas de cuantización: el `manifest.json` con hashes por fichero y los informes de ajuste por proyección convierten este repositorio en un caso reproducible para estudiar el impacto de GPTQ de 3 bits sobre un modelo de 27B.
- Investigación sobre calidad de cuantización: la propia model card documenta el resultado negativo en MBPP y el KL de 0,108, lo que lo hace útil como caso de estudio sobre el coste real de comprimir la ruta de decodificación.
- Servicio de asistentes de programación en local: dado que el modelo base es uno de los modelos de código locales más usados según la guía de terceros, estas copias habilitan respuestas más rápidas en editores y asistentes de autocompletado, con la advertencia de la pérdida medida en MBPP.
- Pipelines de generación de documentación o resúmenes de repositorios: la calibración se hizo sobre código fuente de Sharar, por lo que el perfil está especialmente ajustado a ese dominio.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la compuerta de calidad del autor (`tools/lossy-gate.py --target qwen38 --profile fast`, etapa completa, contra `exact`, 2026-10-01, imagen `sharar:main-20261001`). Se expresan como diferencia respecto a la referencia exacta, no como puntuaciones absolutas.

| Tarea | Delta | Intervalo / p | Nota |
|---|---|---|---|
| MBPP | -3,2 pp | [-5,9, -0,5], p 0,029 | 16 mejores / 32 peores; motivo del rechazo |
| HumanEval | -3,7 pp | p 0,15 | No significativo |
| GSM8K | +0,2 pp | No disponible | |
| MGSM | +0,3 pp | No disponible | |
| Agregado (4 733 elementos) | -0,3 pp | [-1,0, +0,5], p 0,53 | No significativo |

| Metrica de eficiencia | Valor |
|---|---|
| Velocidad a batch uno | x1,83 [1,76, 1,91] |
| Tokens por ronda | x1,22 |
| KL de la ruta de decodificacion | 0,108 (suelo 0,020) |

Veredicto declarado por el autor: **rechazado** en la compuerta, por una única tarea. La model card aclara que la compuerta juzga el perfil `fast` completo (estas copias más una aceptación relajada) y que esta es la primera vez que el perfil del 27B pasa por ella. No se han publicado resultados absolutos de MMLU, HumanEval u otros en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,9 GB en disco. No obstante, no sustituye al modelo base: la VRAM total necesaria incluye además los pesos NVFP4/FP8 para prefill y llamadas anchas, cantidad no especificada en la información disponible.
- GPU recomendadas: NVIDIA GB10 (Grace Blackwell) es la única plataforma citada explícitamente; la calibración de 304 proyecciones se completó en 20 minutos en una sola GB10. El uso de pesos NVFP4 en el modelo base implica, por el propio formato, hardware con soporte de FP4 de la generación Blackwell.
- GPU de consumo: no disponible de forma explícita; un despliegue completo en una única GPU de consumo exigiría una tarjeta con soporte FP4, extremo que no se confirma en el material consultado.
- Opciones de despliegue: Sharar con perfil `fast` es el destino soportado, con carga automática desde `$SHARAR_RESULTS/w3-checkpoints/qwen38-current` o mediante la variable `SHARAR_W3_CHECKPOINT=/ruta/al/repositorio`. Para el modelo base NVFP4, RadixArk documenta SGLang. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se documenta una mejora de 1,83x en velocidad a batch uno y 1,22x en tokens por ronda. No se publican valores absolutos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| yemara/Qwen3.8-27B-NVFP4-sharar-w3 | 27B densos (304 proyecciones en 3 bits) | GPTQ 3 bits, codigo E4M3 | No disponible | Apache 2.0 | Solo copias de decodificacion; requiere Sharar; 0 descargas |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B densos | NVFP4 W4A4 (NVIDIA Model Optimizer) | No disponible | No disponible | Modelo base de este repositorio; recetas para SGLang |
| Qwen/Qwen3.8-27B-FP8 | 27B densos | FP8 con bloques de 128 | No disponible | Apache 2.0 | Fuente de la que se ajustaron estas copias |
| unsloth/Qwen3.8-27B-NVFP4 | 27B densos | NVFP4 | No disponible | No disponible | Cuantizacion alternativa del mismo modelo base |

## Limitaciones y advertencias

- La compuerta de calidad del propio autor marcó el perfil como **rechazado**: MBPP cae 3,2 puntos porcentuales con un intervalo de confianza que excluye el cero (p 0,029). Es una regresión real en generación de código.
- La divergencia KL de la ruta de decodificación es 0,108 frente a un suelo de 0,020, lo que indica un desplazamiento apreciable de la distribución, muy por encima del umbral considerado aceptable.
- El autor no aísla la causa de la pérdida: admite explícitamente que no sabe si proviene de estas copias o de la aceptación relajada del perfil `fast`, y que se está investigando en el repositorio de Sharar.
- El conjunto de calibración son 64 muestras y 87 622 tokens procedentes de los ficheros fuente de Sharar, un dominio estrecho y sesgado hacia código. El comportamiento fuera de ese dominio no está caracterizado.
- No es un modelo autónomo: sin el cargador de Sharar y los pesos NVFP4/FP8 del modelo base no puede ejecutarse.
- Las copias de 3 bits solo se usan para llamadas de como máximo 64 filas; por encima de ese umbral se recurre a los pesos NVFP4/FP8.
- La model card no especifica idiomas soportados, longitud de contexto ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- El repositorio presenta 0 descargas y 0 "me gusta", por lo que no cuenta con validación externa.
- Las fechas del repositorio (creado y actualizado el 2 de octubre de 2026) y de las pruebas citadas son las declaradas por el autor; no se ha contrastado la reproducibilidad de las mismas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yemara/Qwen3.8-27B-NVFP4-sharar-w3
- Modelo base: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Release FP8 de origen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Sharar: https://github.com/abdelfattah-lab/sharar
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Tutorial de NVFP4 en DGX Spark: https://github.com/Deep-AI-Evo/qwen3.8-27b-nvfp4-dgx-spark-tutorial
- Cuantización NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Guía de Qwen 3.8-27B (terceros): https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
