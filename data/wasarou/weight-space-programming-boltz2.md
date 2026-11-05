# wasarou/weight-space-programming-boltz2

## Resumen

`wasarou/weight-space-programming-boltz2` es un repositorio experimental que contiene treinta checkpoints Lightning editados (v1-v30) derivados de Boltz-2 2.2.1, un modelo de prediccion de estructura de proteinas y complejos proteina-ligando. El autor, wasarou, aplica una tecnica de edicion directa en el espacio de pesos ("weight-space programming") sobre el checkpoint de estructura upstream de Boltz-2, sin reentrenamiento supervisado convencional, para intentar corregir errores de estereoquimica en la asignacion R/S y en la geometria de dobles enlaces E/Z.

El objetivo declarado del experimento era obtener un checkpoint con cero errores R/S y E/Z en los 209 sistemas del dataset `wasarou/plinder-cistrans-209`, manteniendo errores de longitud de enlace y de angulo inferiores a la linea base. Segun la propia model card, ningun candidato cumple ese criterio, por lo que los treinta checkpoints son material de investigacion no validado y no un reemplazo listo para produccion.

La relevancia del repositorio es metodologica: documenta de forma transparente treinta variantes de edicion de pesos con evaluacion comparable sobre un conjunto de desarrollo de 55 sistemas y una evaluacion posterior congelada sobre validacion y test, incluyendo intervalos de confianza de los efectos agrupados. El repositorio ocupa 68,6 GB y mantiene la licencia MIT del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Boltz-2 2.2.1, checkpoint de estructura `boltz2_conf.ckpt`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | checkpoints Lightning (`.ckpt`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de Boltz-2; se limita a indicar que los checkpoints derivan del checkpoint de estructura upstream `boltz2_conf.ckpt`, cuya SHA-256 es `090e82ac8c92f5e943fa1b39e7410a44027bea7243c0bbb3caa67a77fc1428e1`, y que se ejecutan sobre Boltz-2 2.2.1. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset original ni etapas de RLHF o DPO, porque el trabajo no entrena el modelo desde cero sino que edita pesos de un modelo ya entrenado.

La innovacion tecnica es el propio metodo de "weight-space programming": cada candidato corresponde a una intervencion distinta sobre tensores concretos del checkpoint (por ejemplo, `input_geometry_v1`, `reference_distances_v2`, `absolute_vectors_only_v11`, `reserved_denoiser_channels_v27`). Durante la creacion de cada checkpoint se verifico que los tensores no objetivo permanecieran intactos y que cada archivo coincidiera con su registro de edicion original. La evaluacion se realizo con asignaciones de GPU emparejadas y una linea base compartida, y en la fase de test se promediaron semillas repetidas por sistema antes de remuestrear por grupos biologicos.

## Capacidades

- Prediccion de estructura de proteinas y de complejos proteina-ligando, heredada de Boltz-2.
- Asignacion de estereoquimica R/S en centros quirales de ligandos.
- Prediccion de geometria de dobles enlaces, incluyendo configuracion E/Z.
- Generacion de coordenadas atomicas evaluables frente a conformeros de referencia ETKDGv3/UFF.
- Edicion selectiva de subconjuntos de tensores del checkpoint (capacidad del metodo, no del modelo).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues, por tratarse de un modelo biologico.

## Casos de uso

- Investigacion en edicion de pesos: los treinta checkpoints permiten reproducir y comparar intervenciones directas sobre tensores de un modelo biologico sin reentrenar, usando el manifiesto `CHECKPOINTS.json` y los checksums `SHA256SUMS`.
- Analisis de sensibilidad de la estereoquimica: comparar variantes como v11 o v17 (23/55 de acuerdo conjunto en desarrollo) frente a la linea base (20/55) para estudiar que tensores afectan a la asignacion R/S.
- Auditoria metodologica de evaluacion: el repositorio incluye evaluacion de desarrollo, evaluacion congelada de v2 en validacion y test, y discute el uso repetido del mismo split de test, lo que sirve como caso practico de buenas y malas practicas.
- Estudio de degradacion por edicion agresiva: candidatos como v6, v27, v29 y v30 muestran caidas severas (por ejemplo, v30 con 1/55 de acuerdo conjunto y mediana de enlace de 0,640607 A), utiles para caracterizar limites del metodo.
- Docencia en bioinformatica estructural: uso de los resultados tabulados para ilustrar la diferencia entre error de geometria mediana y error de pose de union experimental.
- Punto de partida para experimentos propios: el codigo fuente enlazado y el snapshot de codigo permiten extender el metodo a otros tensores o a otros modelos de la familia Boltz.

## Benchmarks y rendimiento

Los datos disponibles son recuentos de acuerdo de sistema completo sobre 55 sistemas de desarrollo, con geometria medida como error RMS mediano frente a conformeros independientes ETKDGv3/UFF (no frente a poses experimentales).

| Candidato | R/S | E/Z completo | Conjunto | Mediana enlace (A) | Mediana angulo (grados) |
|---|---:|---:|---:|---:|---:|
| Linea base upstream | 21/55 | 36/55 | 20/55 | 0,038337 | 2,9074 |
| v1 | 23/55 | 36/55 | 22/55 | 0,038804 | 2,8740 |
| v2 | 23/55 | 36/55 | 22/55 | 0,038833 | 2,8752 |
| v9 | 21/55 | 38/55 | 20/55 | 0,038519 | 2,7932 |
| v11 | 24/55 | 36/55 | 23/55 | 0,038460 | 2,8734 |
| v15 | 21/55 | 37/55 | 20/55 | 0,038517 | 2,7716 |
| v17 | 24/55 | 36/55 | 23/55 | 0,038491 | 2,8781 |
| v18 | 21/55 | 37/55 | 16/55 | 0,036566 | 2,8999 |
| v27 | 8/55 | 30/55 | 7/55 | 0,587255 | 34,5568 |
| v30 | 8/55 | 22/55 | 1/55 | 0,640607 | 28,6757 |

En la evaluacion congelada de v2 sobre 50 sistemas de validacion (semilla 1) y 104 sistemas de test (semillas 1, 2 y 3), el acuerdo conjunto en test se mantuvo sin cambios en 103/312 predicciones y todos los intervalos de confianza del efecto agrupado primario incluyeron cero. La evaluacion de validacion y test de v11 seguia en ejecucion en el momento de redactar la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 68,6 GB y contiene treinta checkpoints, por lo que el tamano por checkpoint individual no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible; la model card solo menciona "asignaciones de GPU emparejadas" entre candidatos y linea base, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo indicado es la descarga mediante `huggingface-hub` (`hf download`) y el uso con Boltz-2 2.2.1.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wasarou/weight-space-programming-boltz2` | no disponible | no disponible | Edicion de pesos sobre Boltz-2 | MIT | HuggingFace, 0 descargas |
| `boltz-community/boltz-2` (linea base) | no disponible | no disponible | Prediccion de estructura proteina-ligando | MIT (segun repo derivado) | HuggingFace |
| Alternativas de prediccion de estructura proteina-ligando | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de Boltz-2 ni de otras alternativas en la informacion proporcionada, por lo que la comparativa se limita a la relacion de derivacion respecto al modelo base.

## Limitaciones y advertencias

- Ningun checkpoint cumple el criterio original de cero errores R/S y E/Z en los 209 sistemas con menor error de enlace y angulo.
- Los treinta checkpoints son material de investigacion no validado; la propia model card los califica como "unvalidated research checkpoints".
- v11 muestra mejores estimaciones puntuales que v2 en desarrollo para R/S, estereoquimica conjunta y las dos medianas de geometria, pero su mediana de longitud de enlace es peor que la linea base.
- En la evaluacion congelada de v2, todos los intervalos de confianza del efecto agrupado primario incluyen cero, lo que no respalda una mejora real.
- El split de test usado para v11 ya se habia empleado para v2, por lo que no constituye un test nuevo sin contaminar.
- Varios candidatos degradan gravemente el rendimiento (v6, v27, v29, v30), con medianas de enlace superiores a 0,5 A y acuerdos conjuntos de 1/55 a 7/55.
- Las metricas de geometria son errores frente a conformeros ETKDGv3/UFF, no frente a poses de union experimentales, por lo que no deben interpretarse como precision de docking.
- No hay informacion sobre sesgos, alucinacion, cobertura de idiomas ni restricciones adicionales de licencia; la licencia MIT se hereda del modelo base y se conserva el aviso de copyright upstream.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wasarou/weight-space-programming-boltz2
- Codigo fuente: https://github.com/th2ch-g/weight-space-programming-boltz2
- Snapshot de codigo: https://github.com/th2ch-g/weight-space-programming-boltz2/tree/e26696edb9d6010c213c8837aa990197fe7e0619
- Manifiesto de checkpoints: CHECKPOINTS.json (en el repositorio)
- Checksums SHA-256: SHA256SUMS (en el repositorio)
- Evaluacion de desarrollo de los treinta candidatos: evaluation/all_candidates_development.md (en el repositorio)
- Evaluacion congelada de v2: evaluation/frozen_v2_evaluation.md (en el repositorio)
- Modelo base: https://huggingface.co/boltz-community/boltz-2
- Checkpoint upstream de estructura: https://huggingface.co/boltz-community/boltz-2/resolve/6fdef46d763fee7fbb83ca5501ccceff43b85607/boltz2_conf.ckpt
- Dataset de evaluacion: https://huggingface.co/datasets/wasarou/plinder-cistrans-209
