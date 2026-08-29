# turnercore/needle-point-v10

## Resumen

Needle Point V10 es un modelo de generación de texto desarrollado por turnercore, publicado como release interino de producción aprobado por el propietario. Se distribuye como un artefacto autocontenido `.np` (Needle Point) de 108.589.056 bytes, diseñado exclusivamente para inferencia en CPU con PyTorch, pesos FP32, atención manual y decodificación restringida estricta. La política de runtime es fail-closed (`fallbacks=[]`), con inferencia batch-one y threads intra-op limitados a 1-4 (canónico: 4) e inter-op fijado en 1. Las rutas nativas C++/HIP y ROCm están en cuarentena y no son opciones de producción.

La relevancia de este release reside en su énfasis en la procedencia verificable: incluye hashes SHA-256 de todos los componentes (artefacto, manifiestos de build y release, tokenizador, commit de entrenamiento upstream). Sin embargo, es un release interino que no supera las puertas de evaluación obligatorias: la métrica no-op exact alcanzó 99,322% frente al 100% requerido, se registraron 5 no-op overcalls frente a 0 requeridos, y la matriz de latencia falló el requisito de `<500 ms` en p50/p95/p99. El autor declara explícitamente que este release no es una afirmación de que las puertas hayan pasado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo Needle Point con atención manual y pesos FP32) |
| Parametros totales | no disponible (artefacto de 108.589.056 bytes, ~103,6 MiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (sin cuantizacion; solo CPU) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | .np (artefacto Needle Point autocontenido) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación pública. El modelo se describe como un artefacto Needle Point autocontenido para inferencia en CPU con PyTorch, con pesos FP32 y atención manual. La política de runtime especifica decodificación restringida estricta (strict constrained decoding), política de fallback fail-closed con lista vacía (`fallbacks=[]`), inferencia batch-one, threads intra-op configurables a 1, 2, 3 o 4 (canónico: 4) e inter-op fijado en 1. Las rutas nativas C++/HIP y ROCm están en cuarentena y no son opciones de producción ni fallbacks para este release.

Los datos de entrenamiento (composición del dataset, número de tokens, uso de RLHF/DPO) no están disponibles públicamente. El commit de entrenamiento upstream se registra como `ffb1c5144c5a16cb8ec650dbc8a6f6fd3854f8f2`. El trabajo futuro declarado incluye completar la paridad FP32/upstream-JAX y la validación de concurrencia en producción.

## Capacidades

- Generación de texto con decodificación restringida estricta: 1.050/1.050 salidas schema-valid en la evaluación one-shot.
- Ejecución de acciones con coincidencia semántica exacta: 268/312 (85,897%) en action full semantic exact.
- Coincidencia exacta de herramientas: 294/312 (94,231%) en action tool exact.
- Discriminación no-op parcial: 733/738 (99,322%) en no-op exact, con 5 no-op overcalls (fallo frente al requisito de 0).
- Inferencia exclusivamente en CPU con PyTorch, batch-one, con política fail-closed sin rutas de respaldo.
- No se documentan capacidades de tool calling general, agentes multi-step, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Reproducción de investigación: el artefacto incluye hashes SHA-256 completos y manifiestos de release, lo que permite verificar la integridad del modelo y reproducir experimentos de forma fiable.
- Evaluación de pipelines de decodificación restringida: con 1.050/1.050 en schema-valid, es útil para probar sistemas de generación con restricciones estrictas de esquema.
- Pruebas de latencia en CPU: su política de threads intra-op configurables (1-4) y batch-one permite medir rendimiento de prefill y decode en entornos CPU con cargas controladas.
- Auditoría de procedencia de modelos: los manifiestos de release y los hashes permiten auditar la cadena de custodia del artefacto y verificar la integridad del commit de entrenamiento.
- Investigación sobre discriminación no-op: el modelo falla en no-op exact (99,322%) y registra 5 no-op overcalls, lo que lo convierte en un caso de estudio para mejorar la precisión en tareas de no-operación.
- Desarrollo de sistemas fail-closed: su política `fallbacks=[]` lo hace adecuado para probar infraestructuras que deben cerrarse de forma segura ante fallos, sin rutas alternativas.

## Benchmarks y rendimiento

La evaluación one-shot V10 FINAL-BENCH registró los siguientes resultados:

| Metrica | Resultado | Requisito | Estado |
|---|---|---|---|
| Schema-valid | 1.050/1.050 | - | Correcto |
| Action full semantic exact | 268/312 (85,897%) | - | - |
| Action tool exact | 294/312 (94,231%) | - | - |
| No-op exact | 733/738 (99,322%) | 100% | Fallo |
| No-op overcalls | 5 | 0 | Fallo |
| Misses totales | 49 (44 action + 5 no-op) | - | - |

Latencia en CPU con 4 threads intra-op, batch-one:

| Percentil | Matriz raw warm | FINAL sealed-run |
|---|---|---|
| p50 | 344,667 ms | 416,886 ms |
| p95 | 1.733,279 ms | 1.980,465 ms |
| p99 | 1.849,877 ms | 3.051,189 ms |

La matriz de latencia falló el requisito de `<500 ms` en p50/p95/p99. La excepción de latencia aprobada por el propietario es solo de latencia y no reescribe estos fallos. Los resultados del sealed-run se mantienen como identidad separada y no se mezclan con la matriz.

## Requisitos de hardware

- CPU exclusivamente: PyTorch en CPU, sin soporte GPU. Las rutas C++/HIP y ROCm están en cuarentena.
- Pesos FP32: el artefacto ocupa 108.589.056 bytes (~103,6 MiB), por lo que cabe en cualquier sistema con RAM estándar.
- Threads intra-op: 1, 2, 3 o 4 (canónico: 4); inter-op fijado en 1.
- Batch-one: no se soporta inferencia por lotes.
- Opciones de despliegue: PyTorch en CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia observada: p50 de 344-417 ms, p95 de 1.733-1.980 ms, p99 de 1.850-3.051 ms en CPU con 4 threads, por debajo del requisito de `<500 ms` en p50 pero muy por encima en p95 y p99.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. La versión anterior needle-automaticity-v9 es un release archivado de investigación sin datos de rendimiento públicos comparables. El proyecto cactus-compute/needle (14 MB, para dispositivos pequeños) comparte nombre pero es un proyecto independiente sin relación aparente con Needle Point V10.

## Limitaciones y advertencias

- Release interino: no es una declaración de que las puertas de evaluación obligatorias hayan pasado.
- Fallos de evaluación: no-op exact (99,322% frente al 100% requerido) y no-op overcalls (5 frente a 0 requeridos) fallaron.
- Latencia: la matriz de latencia falló el requisito de `<500 ms` en p50/p95/p99; las colas warm raw alcanzaron 1.849,877 ms en p99 y el sealed-run 3.051,189 ms.
- Sin soporte GPU: las rutas C++/HIP y ROCm están en cuarentena y no son opciones de producción.
- Sin fallbacks: la política fail-closed (`fallbacks=[]`) implica que el sistema se cierra ante fallos sin rutas alternativas.
- Idiomas no disponibles: no se documentan los idiomas soportados.
- Sin datos de entrenamiento públicos: no se detalla la composición del dataset ni el número de tokens.
- Adopción nula: 0 descargas en el momento de la publicación; el modelo no tiene adopción verificada.
- El trabajo futuro declarado debe mejorar la discriminación no-op, reducir la latencia de prefill y decode en CPU, y completar la paridad FP32/upstream-JAX y la validación de concurrencia.

## Enlaces

- HuggingFace: https://huggingface.co/turnercore/needle-point-v10
- Versión anterior (needle-automaticity-v9): https://huggingface.co/turnercore/needle-automaticity-v9
- Proyecto cactus-compute/needle (independiente, mismo nombre): https://github.com/cactus-compute/needle
