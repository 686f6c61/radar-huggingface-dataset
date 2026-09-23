# Zhongzhu/tunekv-swe-kimi-qwen38-27b

## Resumen

El repositorio `Zhongzhu/tunekv-swe-kimi-qwen38-27b` no contiene un modelo completo, sino un conjunto de artefactos de investigación publicados por el usuario Zhongzhu para la celda 2.1.1 del plan interno "multi-swe". En concreto, se trata de una exportación de prefijos clave-valor (prefix-KV) ajustados con la técnica TuneKV sobre el modelo base Qwen3.8-27B (revisión `1d4bf0f`), junto con las recetas de entrenamiento, las particiones de datos y los informes del evaluador oficial de SWE-bench Verified.

El objetivo del experimento es medir si el ajuste de un prefijo KV (sin tocar los pesos del modelo) mejora la resolución de issues reales de Python dentro de un arnés de agente de código (kimi-code, revisión `87916fa`). La línea base medida con el arnés Kimi sobre Qwen3.8-27B alcanza una media de 29,0 sobre una partición fija de 50 instancias de SWE-bench Verified, con un scorer oficial 4.1.0. Los brazos ajustados (CE y CE+0.1KL) superaron la puerta numérica de reinjección (Δ=0.0) pero su evaluación aún estaba en curso en el momento de publicación.

Es relevante para desarrolladores e investigadores porque documenta con detalle un flujo poco habitual: ajuste de prefijos KV sobre trayectorias resueltas de agentes (46 filas, 2×150 rollouts) en lugar de fine-tuning completo, con geometría declarada (n_skip=16256, n_tune=5120, n_inject=21408) y artefactos de reproducibilidad completos. El repositorio ocupa 1,0 GB, no tiene descargas ni valoraciones, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio publica un artefacto TuneKV (prefix-KV ajustado) para el modelo base Qwen3.8-27B; no se describe la arquitectura del modelo base ni se incluyen sus pesos completos |
| Parametros totales | No disponible para el artefacto. El modelo base se identifica como Qwen3.8-27B (27 000 millones según nomenclatura; no confirmado en la ficha) |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible. Las trayectorias de entrenamiento usadas se filtraron a ≤32 768 tokens y el prefijo del arnés tiene 21 408 identificadores (`kimi_prefix_27b_list.json`) |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors: 81 ficheros en `ce_prefix_kv/` con marcador `READY`, en formato conector TuneKV. El repositorio incluye además JSONL (`ce_all_rows.jsonl`), TOML (`recipe_ce.toml`, `recipe_cekl.toml`, `recipe_gate.toml`), YAML (`training_ce.yaml`) y JSON (manifests, probes, gates, composiciones) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de extremo a extremo, sino un prefijo KV ajustado. La receta V1 emplea la geometría n_skip=16256, n_tune=5120 y n_inject=21408: se conservan 16 256 tokens de prefijo sin ajustar, se ajustan 5 120 y se reinyectan 21 408 identificadores en total, correspondientes al prefijo del arnés Kimi. El entrenamiento se ejecutó con 3 épocas, 48 pasos, optimizador con learning rate 0,0015 y scheduler coseno, semilla 42, sobre 3×H100 con FSDP, según `training_ce.yaml`. La atención se configuró en modo `native` porque el pod no disponía de compilación de FA3, desviación que queda registrada en la ficha.

Los datos de entrenamiento proceden de dos pools de 150 rollouts cada uno (p1: 72/150 resueltos; p2: 80/150 resueltos). De ahí se extrajeron 46 filas para el brazo CE (`ce_all_rows.jsonl`), 23 de p1 y 23 de p2, limitadas a trayectorias resueltas de ≤32 768 tokens y sin peticiones fallidas. El brazo CE alcanzó una pérdida final de 0,32; el brazo CE+0.1KL usó los mismos datos y geometría añadiendo una divergencia KL forward con peso 0,1, con pérdida final de 0,324. El brazo GRPO se descartó por inviabilidad de datos (PLAN §2.1.1). Las peticiones de servicio reales usaron TP1, backend FLASHINFER y sin caché de prefijos, con vLLM 0.28.0 en un pod de 4×H100.

## Capacidades

- Reparación automática de issues de Python en el estilo de SWE-bench: el artefacto se ha evaluado resolviendo incidencias reales del split de test de `princeton-nlp/SWE-bench_Verified` (revisión `c104f84`) mediante parches generados por el agente.
- Ejecución dentro de un arnés de agente de código (kimi-code, revisión `87916fa`), lo que implica interacción multi-turno con el repositorio: lectura de ficheros, edición y generación de parches. Esta capacidad es derivada del arnés descrito, no una especificación declarada del modelo base.
- Prefijo KV reutilizable: el prefijo de 21 408 identificadores permite evitar el reprocesamiento completo del contexto del arnés en cada petición, siempre que el motor de inferencia soporte inyección de prefijos en formato conector TuneKV.
- Transferencia mediante ajuste de KV: el brazo CE+0.1KL publica su `prefix_kv` con la misma geometría y datos que CE, lo que permite comparar el efecto del término KL sin cambiar el resto del pipeline.
- Capacidades del modelo base (razonamiento, generación de código, matemáticas, multilingüismo, tool calling): no disponible en la información publicada. La ficha del repositorio no describe las capacidades de Qwen3.8-27B, solo el experimento de ajuste sobre él.
- Modo de pensamiento, visión o audio: no disponible.

## Casos de uso

- Evaluación interna de agentes de código: el artefacto sirve para medir la tasa de resolución de un agente sobre una partición fija de 50 instancias de SWE-bench Verified, con scorer oficial 4.1.0, de forma replicable entre brazos dentro del mismo stack (misma topología, concurrencia y build de CLI).
- Reducción del coste de preprocesado de contexto en agentes: al publicar un prefijo KV de 21 408 identificadores y la lista asociada (`kimi_prefix_27b_list.json`), un despliegue compatible con el conector TuneKV puede evitar recalcular la atención del prefijo en cada turno, algo especialmente relevante en sesiones largas de depuración.
- Investigación en ajuste de prefijos KV como alternativa al fine-tuning completo: la receta (`recipe_ce.toml`, `recipe_cekl.toml`) y las 46 filas de entrenamiento permiten reproducir el ajuste CE y la variante con KL 0,1 sobre el mismo pool de trayectorias.
- Comparación controlada de recetas de ajuste: los manifiestos `manifest_base_27b.json` y `manifest_tuned_ce_27b.json` describen planes de servicio en seco (TP1, FLASHINFER, sin caché de prefijos), lo que facilita contrastar línea base y brazo ajustado bajo configuración idéntica.
- Auditoría y trazabilidad de resultados de benchmarks: el directorio `reports/` contiene los JSON del evaluador oficial y los JSONL de predicciones de las rondas base r1–r4, con el detalle de los recuentos brutos y los errores corregidos, útil para revisión metodológica.
- Depuración de entornos de evaluación: la ficha documenta la reparación manual de tres imágenes de instancia (setuptools/pkg_resources, eliminación de `--no-use-pep517` en pip y entorno micromamba), referencia aprovechable para equipos que monten sus propias imágenes de instancias SWE-bench.
- Servicio de inferencia con vLLM para evaluaciones a escala: el experimento se sirvió con vLLM 0.28.0 en TP1×2 sobre un pod de 4×H100, lo que da una configuración de partida documentada, aunque con la advertencia de que no se declara licencia para uso comercial.

## Benchmarks y rendimiento

SWE-bench Verified, partición fija de 50 instancias, scorer oficial 4.1.0:

| Brazo | r1 | r2 | r3 | r4 | Media |
|---|---|---|---|---|---|
| base | 27 | 29 | 28 | 32 | 29,0 |
| CE | En evaluación (puerta superada) | — | — | — | — |
| CE+0.1KL | En evaluación (loss de entrenamiento 0,324; puerta superada) | — | — | — | — |
| GRPO | Descartado (datos inviables) | — | — | — | — |

Detalle de la línea base, con recuentos brutos y correcciones: r1 = 26 + 2 errores → corrección +1 = 27; r2 = 27 + 2 errores → corrección +2 = 29; r3 = 28 sin errores; r4 = 31 + 1 error → corrección +1 = 32. Los parches vacíos cuentan como no resueltos según la semántica oficial. El evaluador se ejecutó en un sidecar dind aislado de red y se repararon manualmente tres imágenes de instancia.

Advertencia de comparabilidad recogida en la propia ficha: la línea base de 29,0 en el clúster charlie no es comparable con la línea base de 16,25 de la era B300, porque el stack difiere (TP1 frente a TP8, concurrencia y build de CLI distintos). Las comparaciones solo son válidas dentro del mismo stack.

## Requisitos de hardware

- Entrenamiento del artefacto: 3×H100 con FSDP para el brazo CE (48 pasos, 3 épocas, learning rate 0,0015, scheduler coseno). El pod del experimento contaba con 4×H100.
- Servicio en evaluación: vLLM 0.28.0, TP1×2, backend FLASHINFER, sin caché de prefijos, sobre el pod de 4×H100.
- Requisitos de atención: el pod no disponía de compilación de FA3, por lo que se usó atención `native`; esta desviación está registrada y puede afectar al rendimiento.
- VRAM para el modelo base de 27 000 millones de parámetros: no disponible como medición en la información publicada. Como estimación a partir del tamaño nominal, en bf16 los pesos ocuparían del orden de 54 GB, a los que habría que sumar la caché KV; en FP8 unos 27 GB y en cuantizaciones de 4 bits del orden de 14–16 GB. Estas cifras son estimaciones aritméticas y no medidas del experimento.
- GPU de consumo: con 27 000 millones de parámetros en bf16 no cabe en una GPU de 24 GB. Con cuantización agresiva de 4 bits podría ajustarse en una RTX 4090 de 24 GB, pero no hay confirmación de que exista una variante cuantizada publicada. No disponible.
- Opciones de despliegue confirmadas: vLLM 0.28.0 con el conector TuneKV. Otros motores (llama.cpp, Ollama, TGI) no están documentados en la información disponible.
- Latencia y throughput: no disponibles. La ficha solo declara la topología (TP1×2) y advierte que los resultados no son comparables con stacks distintos.

## Comparativa con modelos similares

No se han publicado en la información disponible datos de modelos comparables de terceros. La única comparación válida documentada es interna al experimento, entre la línea base y los brazos ajustados:

| Elemento comparado | Modelo base | Brazo CE | Brazo CE+0.1KL | Brazo GRPO |
|---|---|---|---|---|
| Modelo subyacente | Qwen3.8-27B rev `1d4bf0f` | Qwen3.8-27B rev `1d4bf0f` | Qwen3.8-27B rev `1d4bf0f` | No aplica |
| Modificación | Ninguna | Prefix-KV ajustado (TuneKV) | Prefix-KV ajustado + KL forward 0,1 | Descartado |
| Datos de ajuste | — | 46 filas (23 + 23) | 46 filas (23 + 23) | Inviables |
| Pérdida final de entrenamiento | — | 0,32 | 0,324 | — |
| SWE-bench Verified (50 instancias), media | 29,0 | Sin publicar | Sin publicar | — |
| Licencia | No disponible | No disponible | No disponible | — |

Comparación con alternativas externas (por ejemplo, otros modelos de código de ~30B evaluados en SWE-bench Verified): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia publicada, no hay autorización explícita de uso comercial ni de redistribución, ni del artefacto ni del modelo base.
- Los brazos ajustados (CE y CE+0.1KL) no tienen resultados finales publicados: en el momento de la publicación la evaluación estaba en curso o en cola, por lo que no existe evidencia de mejora sobre la línea base de 29,0.
- Muestra pequeña: la línea base de 29,0 corresponde a una partición fija de 50 instancias, no al conjunto completo de SWE-bench Verified, y a cuatro rondas (r1–r4) con recuentos brutos corregidos manualmente por errores de ejecución.
- Falta de comparabilidad entre stacks: la propia ficha advierte que 29,0 en el clúster charlie y 16,25 en la era B300 no son comparables (TP1 frente a TP8, concurrencia y build de CLI distintos).
- El brazo GRPO se descartó por inviabilidad de datos, de modo que no hay contraste con métodos de optimización por preferencias.
- Fragilidad del entorno de evaluación: tres imágenes de instancia requirieron reparación manual (setuptools/pkg_resources, eliminación de `--no-use-pep517`, entorno micromamba), lo que indica que los resultados dependen de la configuración del entorno.
- Semántica estricta de evaluación: los parches vacíos se contabilizan como no resueltos, lo que puede penalizar comportamientos que otros evaluadores tratarían de forma distinta.
- Ejecución de código no confiable: la evaluación se hizo en un sidecar dind aislado de red, lo que refleja la necesidad de sandboxing estricto al reproducir el pipeline.
- Idiomas soportados no declarados: no hay información sobre el comportamiento multilingüe ni sobre sesgos conocidos del modelo base.
- Sin validación de la comunidad: el repositorio tiene 0 descargas y 0 valoraciones, y no se indica pipeline, de modo que no hay señales externas de calidad o mantenimiento.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible. Este artefacto es de investigación y no está orientado a producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Zhongzhu/tunekv-swe-kimi-qwen38-27b
- Modelo base: Qwen/Qwen3.8-27B, revisión `1d4bf0f` (referencia de procedencia; URL no disponible en la información proporcionada)
- Dataset: princeton-nlp/SWE-bench_Verified, revisión `c104f84`, split test (https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified)
- Arnés: FutureMLS-Lab kimi-code, revisión `87916fa` (referencia de procedencia; URL no disponible en la información proporcionada)
- Recetas y configuración incluidas en el repositorio: `recipe_ce.toml`, `recipe_cekl.toml`, `recipe_gate.toml`, `training_ce.yaml`
- Manifiestos de servicio: `manifest_base_27b.json`, `manifest_tuned_ce_27b.json`
- Informes de evaluación: `reports/` (JSON del evaluador oficial de las rondas base r1–r4 y de los pools p1/p2, más JSONL de predicciones)
- Artefactos de exportación: `ce_prefix_kv/` (marcador `READY` y 81 safetensors), `ce_all_rows.jsonl`, `kimi_prefix_27b_list.json`, `probes_ce.json`, `gate_ce.json`, `gate_cekl.json`, `COMPOSITION_ce.json`, `COMPOSITION_cekl.json`
