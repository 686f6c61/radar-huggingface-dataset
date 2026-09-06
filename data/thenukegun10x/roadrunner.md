# thenukegun10x/RoadRunner

## Resumen

RoadRunner es un modelo de aprendizaje automático publicado por thenukegun10x en Hugging Face. Consiste en un heurístico de búsqueda A* aprendido de 12.986 parámetros, acompañado de cabezas de predicción multi-token (multi-hop), diseñado para enrutamiento por carretera en Australia Occidental. El modelo se presenta explícitamente como un resultado negativo: no logra el objetivo de encontrar rutas con una longitud ≤1.01× la óptima siendo más rápido que A* vanilla. Su relevancia radica en documentar el fracaso de forma transparente, ofreciendo una frontera de rendimiento medida y mostrando exactamente dónde y por qué falla.

La arquitectura es una red densa pequeña (dense-S) con cabezas MTP k=2,3,4, exportada a ONNX (52 KB, FP32). No es un modelo de lenguaje, por lo que no tiene longitud de contexto ni soporte de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa pequeña (dense-S) con cabezas de predicción multi-token (MTP), integrada como heurístico en A* |
| Parametros totales | 12.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | FP32 (sin cuantización) |
| Idiomas soportados | No aplica (modelo de enrutamiento, no de lenguaje) |
| Licencia | MIT (pesos y demo); datos OSM ODbL y Main Roads CC-BY-4.0 |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

RoadRunner es una red neuronal densa de 12.986 parámetros que predice un coste residual r para la heurística de A*, calculada como h = euc + r*(euc+300). Las cabezas MTP k=2,3,4 predicen coordenadas polares (sin, cos, logdist) de los nodos 2 a 4 pasos por delante. El entrenamiento es discriminativo, con pérdida de entropía cruzada sobre los vecinos reales del nodo base ordenados por distancia polar, no mediante regresión global. El modelo se entrenó con autocast BF16 pero se exportó en FP32 para asegurar compatibilidad con ONNX Runtime CPU.

Los datos de entrenamiento proceden de 100.000 consultas origen-destino (OD) generadas sobre la red de carreteras de Australia Occidental extraída de OpenStreetMap (Geofabrik). Se utilizaron atributos de Main Roads WA como datos laterales. No se aplicó RLHF ni DPO. La innovación principal es el uso de un heurístico aprendido y cabezas MTP para acelerar la búsqueda, aunque el resultado final es negativo.

## Capacidades

- Genera heurísticas de coste restante para A* en grafos de carreteras, mejorando la precisión de la búsqueda en términos de expansiones.
- Predice nodos futuros (multi-hop) con cabezas MTP k=2,3,4, usando coordenadas polares.
- Soporta búsqueda dirigida bidireccional (guided-bidir), que reduce las expansiones en 2.1× respecto a A* vanilla.
- Puede procesar múltiples consultas al mismo destino con un throughput amortizado 1.5× superior al baseline.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Optimización de rutas para múltiples consultas al mismo destino: el modelo ofrece 1.5× throughput amortizado cuando hay muchas consultas hacia un punto común, útil en sistemas de navegación con alta demanda simultánea.
- Reducción de expansiones en búsqueda bidireccional: guided-bidir reduce las expansiones en 2.1×, lo que puede acelerar la planificación de rutas en mapas de gran tamaño.
- Investigación en heurísticas aprendidas para búsqueda informada: el modelo sirve como referencia negativa para estudiar los límites del aprendizaje de heurísticas en dominios de grafos.
- Evaluación de MTP en dominios no lingüísticos: los resultados de MTP (pointer acc 0.80, mean accept 1.44) ayudan a entender la inestabilidad del rollout y los límites de esta técnica fuera del procesamiento del lenguaje.
- Generación de subobjetivos (subgoal jumps) con relleno exacto: la forma restante de MTP es útil para saltos de subobjetivo, no para rollout libre.
- Benchmark de rendimiento en CPU: sirve como punto de referencia para comparar implementaciones de heurísticas en ONNX Runtime y medir la latencia end-to-end en hardware de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo:

| setup | gap mean/p90 | exp vs vanilla | end-to-end ms |
|---|---|---|---|
| vanilla euc A* | 0 / 0 | 1.0× | ~21.5 |
| dense-S fwd (crown) | 1.5% / 4.5% | 0.66× | ~19–25 |
| dense-S guided-bidir | 2.5% / 7.6% | 0.31× | ~14.5 (mejor punto de gap pequeño) |
| regime-S fwd (accuracy crown) | 0.78% / 1.8% | 0.97× | ~25 |
| greedy MTP rollout | 10.4% / 25% | — | 22.4, 0/195 pure (aparcado) |
| XS 4k-param probe | 4.2% / 11.9% | 3.17× | 42 (rechazado) |
| learned MoE routing | 5.8% / 17% | 1.06× | — (colapsado, aparcado) |

Datos adicionales de MTP medidos sobre el bundle: pointer acc 0.80, k2 snap-accept 137/256 forzado vs 114/206 encadenado, mean accept 1.44 en modo teacher-forced. El rollout greedy alcanzó el destino en 0 de 195 consultas OD de validación.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica, es un modelo CPU.
- Cabe en consumer GPU: no aplica, no necesita GPU.
- Opciones de despliegue: ONNX Runtime (Python), con el script demo_mtp.py que solo requiere onnxruntime y numpy.
- Latencia end-to-end medida: vanilla ~21.5 ms, dense-S fwd ~19–25 ms, dense-S guided-bidir ~14.5 ms, regime-S fwd ~25 ms, greedy MTP rollout 22.4 ms, XS 4k-param probe 42 ms.

## Comparativa con modelos similares

No se han identificado modelos comparables externos publicados. La comparación disponible es contra el baseline A* vanilla y variantes del propio modelo:

| Modelo | Parametros | Gap medio | Expansiones vs vanilla | End-to-end ms |
|---|---|---|---|---|
| A* vanilla (euc) | 0 | 0% | 1.0× | ~21.5 |
| RoadRunner dense-S fwd | 12.986 | 1.5% | 0.66× | ~19–25 |
| RoadRunner dense-S guided-bidir | 12.986 | 2.5% | 0.31× | ~14.5 |
| RoadRunner regime-S fwd | no disponible | 0.78% | 0.97× | ~25 |

## Limitaciones y advertencias

- Resultado negativo: no cumple el objetivo de longitud de ruta ≤1.01× la óptima siendo más rápido que A* vanilla.
- Sesgo geográfico: el modelo se entrenó únicamente con la red de carreteras de Australia Occidental, por lo que no generaliza a otras regiones.
- Riesgo de alucinación en rollout: el rollout greedy alcanzó el destino en 0 de 195 consultas OD, lo que indica inestabilidad en la predicción encadenada.
- Cabezas MTP no calibradas en distancia: el valor de logdist se estanca en ~11 (≈90.000 km) frente a la distancia real de ~0.5 km; toda la señal se concentra en el ángulo.
- Licencia de datos: los datos de topología de OSM están bajo ODbL con cláusula share-alike, y los atributos de Main Roads WA bajo CC-BY-4.0; los datos derivados heredan el share-alike.
- No apto para producción: es un resultado negativo publicado con fines de investigación y documentación de límites.

## Enlaces

- HuggingFace: https://huggingface.co/thenukegun10x/RoadRunner
- Perfil de GitHub del autor: https://github.com/Thenukegun10x
- Repositorio de código: mencionado en la model card como "repo" (no se proporciona URL en la información disponible)
- Paper: no disponible
