# TIE-Pilot/dspark-lattice-nominator-qwen3-4b

## Resumen

dspark-lattice-nominator-qwen3-4b es un conjunto de checkpoints de modelos borrador (draft models) diseñados para decodificación especulativa sobre el modelo base Qwen/Qwen3-4B. Lo desarrolla el usuario TIE-Pilot y se publica bajo licencia Apache 2.0. No se trata de un modelo de lenguaje autónomo, sino de un artefacto de aceleración de inferencia: propone candidatos de tokens que el modelo grande verifica después, reduciendo el coste por token generado sin alterar la distribución de salida del modelo objetivo.

La propuesta técnica se articula en torno a lo que el autor denomina "block-7 lattice drafters": un nominador ciego que propone los 16 tokens más probables por posición y un reranker de orden 1 que los puntúa. El repositorio contiene siete brazos experimentales entrenados durante una época cada uno, con solo el paso final conservado, lo que implica que los checkpoints no se pueden reanudar para entrenamiento. El tamaño del repositorio es de 17,0 GB.

Es relevante por dos motivos. Primero, documenta resultados negativos y positivos de una línea de investigación sobre borradores ligeros (el brazo de 1 capa obtiene un veredicto NEGATIVE con oracle@16 de -0,98 frente al de 5 capas), lo que aporta información útil sobre qué configuraciones de borrador funcionan. Segundo, el mejor brazo de la línea (rr3joint, tronco y reranker entrenados conjuntamente) se publica junto al resto, permitiendo reproducir la comparación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con nominador ciego (blind nominator) y reranker de orden 1; variantes de 1, 2 y 3 capas, una de ellas con convolución corta (short-conv) |
| Parametros totales | no disponible (depende del brazo; el repositorio ocupa 17,0 GB en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos y configuraciones en safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen/Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tipo de artefacto | Draft model para decodificación especulativa |

## Arquitectura y entrenamiento

El sistema se compone de dos piezas. Un nominador ciego genera, para cada posición de un bloque de 7 tokens, los 16 candidatos más probables (top-16 por slot). Un reranker de orden 1 puntúa esos candidatos para seleccionar la propuesta final. Los brazos publicados exploran distintas configuraciones de esta arquitectura: un nominador de 1 capa, un nominador de 2 capas con convolución corta, un reranker de 3 capas sobre un tronco congelado de 2 capas con convolución, una variante causal en la que las filas del reranker se ven entre sí, y varias variantes conjuntas (tronco y reranker entrenados a la vez, reparto 3+2 y tronco "tall-thin" de 3 capas con FFN de 2048).

El entrenamiento se realizó durante una época por brazo, conservando únicamente el paso final (step_2616) en todos los casos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; al tratarse de un modelo borrador, el objetivo de entrenamiento es presumiblemente la predicción de tokens del modelo base, pero este extremo no se detalla. La innovación destacable es el esquema de nominación ciega con reranking de orden 1 sobre bloques de 7 tokens, junto con la comparación sistemática de profundidades y estrategias de entrenamiento (congelado frente a conjunto).

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa sobre Qwen/Qwen3-4B.
- Nominación top-16 por posición dentro de bloques de 7 tokens.
- Reranking de candidatos mediante un módulo de orden 1.
- Variante con atención causal entre filas del reranker (brazo rr3causal), pensada como cota superior.
- Entrenamiento conjunto de tronco y reranker (brazo rr3joint), señalado por el autor como el mejor de la línea.
- No es un modelo conversacional: no se documentan capacidades de generación libre, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles de forma explícita; dependen del modelo base.

## Casos de uso

- Aceleración de inferencia de Qwen/Qwen3-4B en producción: el borrador propone bloques de tokens que el modelo grande verifica en paralelo, reduciendo el número de pasos de decodificación y, con ello, la latencia por token generado.
- Despliegue en entornos con presupuesto de cómputo ajustado: al ser un borrador ligero (1 a 3 capas según el brazo), el coste adicional de proponer candidatos es bajo frente al ahorro en llamadas al modelo objetivo.
- Investigación en decodificación especulativa: los siete brazos permiten reproducir la comparación entre nominadores de distinta profundidad, con y sin convolución corta, y entre entrenamiento congelado y conjunto.
- Evaluación de esquemas de nominación top-k: el diseño top-16 por slot sirve como banco de pruebas para estudiar la relación entre tamaño del conjunto de candidatos y tasa de aceptación.
- Integración en pipelines de serving que ya soportan decodificación especulativa (por ejemplo, motores con soporte de draft models), usando el checkpoint rr3joint como borrador de referencia.
- Estudio de arquitecturas de reranking ligero: la variante causal (rr3causal) actúa como cota superior para medir cuánto se pierde al restringir la información disponible en el reranker.

## Benchmarks y rendimiento

La información disponible solo incluye una métrica interna de la línea experimental: el brazo de nominador ciego de 1 capa obtiene un veredicto NEGATIVE con oracle@16 de -0,98 respecto al nominador de 5 capas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de aceptación de decodificación especulativa) en la información disponible.

| Brazo | Configuración | Veredicto del autor |
|---|---|---|
| dflash_b7_qwen3_4b_1ep_1L | Nominador ciego de 1 capa | NEGATIVE (oracle@16 -0,98 frente a 5L) |
| dflash_b7_qwen3_4b_1ep_2Lconv | Nominador ciego de 2 capas + short-conv | PASS |
| rr3_2Lconv_b7_qwen3_4b_1ep | Tronco 2Lconv congelado + reranker de 3 capas | no disponible |
| rr3causal_2Lconv_b7_qwen3_4b_1ep | Reranker con visibilidad causal entre filas (cota superior) | no disponible |
| rr3joint_2Lconv_b7_qwen3_4b_1ep | Tronco y reranker entrenados conjuntamente | Mejor brazo de la línea |
| rr3joint_S3p2_b7_qwen3_4b_1ep | Conjunto, reparto 3+2 | no disponible |
| rr3joint_T3f2048_b7_qwen3_4b_1ep | Conjunto, tronco tall-thin (3 capas, FFN 2048) | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma desagregada por brazo; el repositorio completo ocupa 17,0 GB, por lo que cada checkpoint individual es una fracción de esa cifra.
- Al ser borradores de 1 a 3 capas sobre un modelo base de 4B parámetros, se espera que quepan holgadamente en GPU de consumo, aunque no se publican cifras concretas de memoria.
- GPU recomendadas: no disponibles en la información proporcionada.
- Opciones de despliegue: el autor indica restaurar los checkpoints en la disposición original mediante `hf download TIE-Pilot/dspark-lattice-nominator-qwen3-4b --local-dir /workspace/checkpoints/deepspec`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia estructural, el artefacto se relaciona con otras familias de draft models para decodificación especulativa (por ejemplo, EAGLE o Medusa), pero no se han facilitado cifras que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dspark-lattice-nominator-qwen3-4b | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los checkpoints conservan solo el paso final de una época de entrenamiento y no se pueden reanudar para entrenamiento, según advierte el propio autor.
- El brazo de nominador de 1 capa fue evaluado como NEGATIVE por el autor; no debe usarse como configuración de referencia sin validación propia.
- No es un modelo de lenguaje utilizable de forma autónoma: requiere el modelo base Qwen/Qwen3-4B y un motor de decodificación especulativa compatible.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas; estas dependen del modelo base y del uso como borrador.
- El repositorio está archivado (fecha de archivo 2026-11-12) y no se esperan actualizaciones.
- Ausencia de benchmarks estándar publicados: cualquier estimación de ganancia de velocidad debe medirse en el entorno de despliegue concreto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-4B antes de combinar ambos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TIE-Pilot/dspark-lattice-nominator-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
