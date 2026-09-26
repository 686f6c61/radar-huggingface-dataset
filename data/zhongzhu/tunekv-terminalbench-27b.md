# Zhongzhu/tunekv-terminalbench-27b

## Resumen

`Zhongzhu/tunekv-terminalbench-27b` es un artefacto de investigación publicado en HuggingFace que no contiene un modelo de lenguaje completo, sino una caché K/V entrenada (denominada TuneKV) para el modelo `Qwen/Qwen3.8-27B` (snapshot `1d4bf0f2`). El planteamiento es el de un "arnés diferenciable": los pesos del transformer permanecen congelados y lo único que se entrena es la caché K/V asociada a un prefijo fijo del prompt, de modo que se intenta modular el comportamiento del agente sin modificar un solo parámetro del modelo base.

El artefacto se ha entrenado y evaluado sobre Terminal-Bench 0.2.18, con un conjunto fijo de 80 tareas y el agente terminus-2. El prefijo entrenado corresponde a los 722 primeros tokens del prompt del arnés, de los cuales 704 posiciones son entrenables y se inyectan en el servicio mediante el conector `tunekv_vllm.hybrid` sobre vLLM 0.28, con una ventana de contexto de 131.072 tokens.

Su relevancia es metodológica más que práctica: la model card documenta que las dos variantes entrenadas no superan al modelo base. La variante de entropía cruzada es estadísticamente nula (41,5 frente a 43,5 sobre 80) y la variante GRPO retrocede de forma significativa (37,0 frente a 43,5; prueba de signos p 0,043). El repositorio, de 3,7 GB, incluye el artefacto de servicio, trayectorias completas, registros de entrenamiento y scripts de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Artefacto de caché K/V entrenada (TuneKV) sobre el modelo base `Qwen/Qwen3.8-27B`, transformer híbrido de 64 capas según la partición declarada: 16 capas de atención completa más 48 estados de frontera GatedDeltaNet |
| Parámetros totales | 27B en el modelo base (congelado); el artefacto entrenable cubre 704 posiciones de K/V, no pesos del transformer |
| Parámetros activos | no aplica (no se declara arquitectura MoE en la información disponible) |
| Longitud de contexto | 131.072 tokens (`--max-model-len`); prefijo entrenado de 722 tokens con 704 posiciones inyectadas (`n_inject 704`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | artefacto de KV (`export/artifact`: 64 archivos más `COMPOSITION.json` y `READY`); no se distribuye en safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.8-27B, snapshot `1d4bf0f2` |
| Autor | Zhongzhu |
| Tamaño del repositorio | 3,7 GB |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-26 (según HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El método TuneKV no entrena pesos: en la fase de captura inicializa la caché K/V del prefijo y optimiza únicamente esas posiciones. El prefijo inyectado son 704 posiciones alineadas a frontera GatedDeltaNet (múltiplo de 64) sobre los 722 tokens compartidos de cabecera del prompt del arnés, y abarca las K/V de las 16 capas de atención completa más 48 estados de frontera GatedDeltaNet; el estado `state1` se entrena y el estado de convolución `state0` se recaptura de forma coherente en la exportación. En el servicio, las peticiones solo reciben la K/V entrenada si su prompt renderizado comienza por los 704 identificadores del prefijo, lo que se sirve mediante el conector `tunekv_vllm.hybrid` con `n_inject 704`.

El protocolo de evaluación fija 80 tareas, agente terminus-2, `run_eval_fixed.py` (sha `953b0d4d`) y adaptador congelado `run_native.py` (sha `8cf915c5`), terminal-bench 0.2.18, temperatura 0,7, `max_tokens` 4096, contexto 131.072 y 2 ensayos concurrentes; las tareas sin veredicto cuentan como 0. El servicio emplea vLLM 0.28 (imagen `tunekv:multi-swe-0922`), una B300 por servidor con TP1, atención FLASHINFER, caché de prefijo desactivada, `limit-mm 0` y `gdn_prefill_backend=triton`, con plantilla de chat por defecto (thinking activado, esfuerzo xhigh).

En cuanto a los datos, el brazo de entropía cruzada parte de trayectorias exitosas del propio modelo de 27B (12 tareas fuera del conjunto de evaluación, 4 ensayos cada una, 26 ensayos correctos), filtradas a filas limpias de estilo V3 (respuesta JSON canónica, filtro de errores de observación, guarda de repetición), lo que da 148 filas; se entrena con inicialización por captura, lr 1,5e-3 coseno, 3 épocas (105 pasos) y ventana de 32.768. El brazo GRPO genera 4 ensayos on-policy del modelo base por tarea de evaluación a temperatura 0,7 (b1 y t1..t3), con recompensa igual al `is_resolved` del ensayo y z-score por tarea; cada llamada al modelo del journal equivale a una fila (4.005 filas de hasta 32.768 tokens, 19 tareas mixtas), con lr 3e-4 coseno y 624 pasos de batch efectivo 2. No se documenta RLHF ni DPO.

## Capacidades

- El artefacto no añade capacidades nuevas al modelo base: su única función es inyectar una caché K/V entrenada cuando el prompt renderizado empieza por los 704 identificadores del prefijo.
- Ejecución de tareas de terminal: resolución de tareas de Terminal-Bench 0.2.18 mediante el agente terminus-2, con interacción con shell y entorno de línea de comandos.
- Razonamiento multi-paso: la evaluación registra un journal HTTP de cada llamada al modelo, con múltiples turnos por tarea y 4.096 tokens máximos de salida por llamada.
- Modo thinking activado por defecto con esfuerzo xhigh, según la plantilla de chat por defecto del despliegue.
- Tool calling / function calling: no se documenta soporte explícito en la model card; la interacción con herramientas se realiza a través del agente terminus-2, no mediante un esquema de funciones declarado.
- Capacidades multimodales: desactivadas explícitamente en el servicio (`limit-mm-per-prompt {"image":0,"video":0}`).
- Capacidades multilingües: no disponibles.
- Capacidad especial: condicionamiento por prefijo exacto, es decir, la inyección solo se activa con una coincidencia literal de los 704 identificadores iniciales.

## Casos de uso

- Reproducción de resultados negativos: el repositorio contiene trayectorias completas, verdictos por ensayo, informes por fila, configuraciones de entrenamiento, logs por paso y canarios de inyección, lo que permite replicar la conclusión de que ni CE ni GRPO mejoran al base en este protocolo.
- Infraestructura de inyección de KV: el conector `tunekv_vllm.hybrid` y los scripts de servicio de `code/` pueden reutilizarse para experimentos de prefijos K/V entrenados sobre otros modelos o tareas, con la configuración `KVC` documentada.
- Auditoría metodológica de evaluaciones de agentes: los archivos `eval/COMPARISON_27B_{CE,GRPO}.json` y `eval/SUMMARY_TB6.json` conservan los emparejamientos por tarea, la prueba de McNemar y la prueba de signos, útiles como plantilla para comparar variantes con 6 u 8 ejecuciones base.
- Estudio de coste de personalización: permite analizar cuánto se puede desplazar el comportamiento de un modelo de 27B entrenando 704 posiciones de K/V en lugar de ajustar pesos, con 105 pasos (CE) o 624 pasos (GRPO) frente al coste de un ajuste completo.
- Análisis de trayectorias de agentes: los `trajectories/<run>.tar.gz` incluyen directorios completos de ejecución con journal HTTP de cada llamada, logs del agente y sesiones tmux, aprovechables para estudiar patrones de fallo en tareas de terminal.
- Construcción de conjuntos de entrenamiento filtrados: los constructores de filas de `code/` implementan filtros de errores de observación y guardas de repetición sobre JSON canónico, reutilizables para limpiar datos de agentes propios.
- Calibración de tests estadísticos con muestras pequeñas: el material ilustra el uso de z-score por tarea, prueba de signos y McNemar con 80 tareas y desviación estándar de 3,7 en el brazo base.
- Referencia de despliegue híbrido en vLLM: el ejemplo de `vllm serve` con FLASHINFER, `gdn_prefill_backend=triton`, TP1 y caché de prefijo desactivada sirve como configuración de partida para modelos con capas GatedDeltaNet.

## Benchmarks y rendimiento

Resultados en Terminal-Bench 0.2.18, conjunto fijo de 80 tareas, métrica de tareas resueltas sobre 80:

| Brazo | Ejecuciones | Media (/80) | Δ frente al base | Prueba de signos por tarea (tuned frente a 8 ejecuciones base) |
|---|---|---|---|---|
| base (mismo stack) | b1 42, t1 47, t2 38, t3 47, b2 46, b3 41; controles concurrentes b4 43, b5 43 | 43,5 (6 canónicas, SD 3,7) | — | — |
| CE + 0,1·forward KL | 40, 43 | 41,5 | -2,0 (b1: -2, McNemar p 0,51) | 14 arriba / 17 abajo, p 0,72 |
| GRPO (clip 0,2 + 0,1·reverse KL, CE 0) | 38, 36 | 37,0 | -6,5 (b1: -4 / -6, p 0,55 / 0,15) | 9 arriba / 21 abajo, p 0,043 |

Interpretación recogida en la propia model card: CE es nulo y GRPO regresa, con ambas ejecuciones GRPO en el valor más bajo o por debajo de la peor ejecución base. No se han publicado resultados de benchmarks del modelo base en otras tareas dentro de la información disponible.

## Requisitos de hardware

- GPU de referencia en el protocolo: una B300 por servidor, con tensor-parallel-size 1.
- Pesos del modelo base: 27B parámetros; en bf16 equivalen a unos 54 GB (estimación aritmética a partir del recuento de parámetros), a los que se suma la caché K/V para 131.072 tokens de contexto, por lo que el despliegue completo no es viable en GPU de consumo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de gama alta de 24-32 GB con contexto completo; requiere aceleradores de centro de datos (B300, y previsiblemente A100/H100 de 80 GB solo con cuantización y contexto reducidos, extremo no verificado en la información disponible).
- Artefacto: el repositorio ocupa 3,7 GB e incluye además del artefacto de servicio las trayectorias y los datos de entrenamiento, por lo que el peso del artefacto de KV es inferior a esa cifra.
- Software obligatorio: vLLM 0.28 (imagen `tunekv:multi-swe-0922`), backend de atención FLASHINFER, `gdn_prefill_backend=triton`, caché de prefijo desactivada, `limit-mm-per-prompt {"image":0,"video":0}` y el conector `TuneKVConnector` con `kv_connector_module_path: tunekv_vllm.hybrid`.
- Opciones de despliegue: solo vLLM con el conector TuneKV; no hay soporte documentado para llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros artefactos comparables de prefijo K/V entrenado, por lo que la comparación se limita a los tres brazos del propio estudio y al modelo base sin el artefacto:

| Elemento | Parámetros | Contexto | Terminal-Bench (resueltas/80) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B sin TuneKV (base) | 27B | 131.072 | 43,5 (media de 6 ejecuciones canónicas, SD 3,7) | no disponible en la información | requiere `Qwen/Qwen3.8-27B` snapshot `1d4bf0f2` |
| Artefacto TuneKV, brazo CE | 27B congelados más 704 posiciones de K/V | 131.072 | 41,5 | apache-2.0 | repositorio de HuggingFace `Zhongzhu/tunekv-terminalbench-27b`, subdirectorio `ce/` |
| Artefacto TuneKV, brazo GRPO | 27B congelados más 704 posiciones de K/V | 131.072 | 37,0 | apache-2.0 | repositorio de HuggingFace `Zhongzhu/tunekv-terminalbench-27b`, subdirectorio `grpo/` |

## Limitaciones y advertencias

- Resultado negativo: ninguna de las dos variantes mejora al modelo base; GRPO regresa de forma estadísticamente significativa (9 arriba frente a 21 abajo, p 0,043) y CE es indistinguible del base (p 0,72).
- Activación frágil: la K/V entrenada solo se inyecta si el prompt renderizado comienza exactamente por los 704 identificadores del prefijo; cualquier cambio en la cabecera del prompt del arnés desactiva el efecto.
- Dependencia de un stack muy concreto: vLLM 0.28, conector propio, FLASHINFER, backend de prefill en triton y caché de prefijo desactivada; no es portable a otros motores de inferencia.
- Métrica conservadora: las tareas sin veredicto cuentan como 0, lo que puede penalizar ejecuciones incompletas y sesgar la comparación si el reparto de fallos no es homogéneo entre brazos.
- Potencia estadística limitada: 80 tareas y desviación estándar de 3,7 en el brazo base; los intervalos de confianza de las diferencias son amplios.
- Cobertura de datos reducida en el brazo CE: 148 filas procedentes de 12 tareas fuera del conjunto de evaluación, con 26 ensayos correctos.
- Idiomas soportados, tipos de cuantización y sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente al modelo base y no medido en esta ficha; el artefacto no incorpora mecanismos de verificación.
- Licencia: el artefacto se publica bajo apache-2.0, pero la licencia del modelo base `Qwen/Qwen3.8-27B` no se indica en la información disponible y debe verificarse antes de cualquier uso comercial.
- Metadatos: 0 descargas y 0 likes en el momento de la consulta, y fechas de creación y actualización de 2026 según HuggingFace; no hay validación externa documentada.

## Enlaces

- Repositorio del artefacto en HuggingFace: https://huggingface.co/Zhongzhu/tunekv-terminalbench-27b
- Modelo base referenciado: `Qwen/Qwen3.8-27B`, snapshot `1d4bf0f2` (https://huggingface.co/Qwen/Qwen3.8-27B)
- Seguimiento en W&B: proyecto `zhoumllab/TERMINALBENCH`, ejecuciones `5z1z9t5g` (CE), `e0ikai7l` (GRPO) y `oufrbh9e` (resumen de evaluación) (https://wandb.ai/zhoumllab/TERMINALBENCH)
- Proyecto Terminal-Bench, versión 0.2.18: sin enlace proporcionado en la información disponible
- Scripts internos citados: `run_eval_fixed.py` (sha `953b0d4d`) y `run_native.py` (sha `8cf915c5`), incluidos en el subdirectorio `code/` del repositorio
- Informes internos de comparación: `eval/COMPARISON_27B_CE.json`, `eval/COMPARISON_27B_GRPO.json` y `eval/SUMMARY_TB6.json`
