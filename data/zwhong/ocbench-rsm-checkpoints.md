# zwhong/ocbench-rsm-checkpoints

## Resumen

OCBench RSM + baseline checkpoints (`ocbench_unified_rsm`) es un repositorio de checkpoints de entrenamiento en crudo publicado por el usuario `zwhong` en Hugging Face. No se trata de un modelo de lenguaje con pesos listos para inferencia, sino de un archivo de artefactos de entrenamiento de aprendizaje por refuerzo offline (offline RL) asociados al proyecto OCBench, un entorno de evaluacion de agentes. El repositorio contiene los ficheros `params_<step>.pkl` con el estado del actor y del optimizador en distintos pasos de entrenamiento, junto con metadatos de cada segmento de ejecucion.

El contenido se organiza en tres bloques: `exp/ocbench_unified_rsm/<arm>/<segment>/`, que agrupa los 505 checkpoints referenciados por las evaluaciones seguras (`results/secured/evals/*.json`) que aun existian el 22 de noviembre de 2026; `results/secured/`, con los registros de evaluacion (metricas, flags completos de ambos brazos, ruta, tamano y huella del checkpoint); y `unverified_latest/`, que contiene `params_latest.pkl` de brazos de procedencia antigua cuyo paso exacto reportado fue podado y que, por tanto, no deben tratarse como los checkpoints reportados.

Su relevancia es de caracter reproducible: permite a investigadores de RL offline auditar y reproducir los resultados del proyecto OCBench a partir de los pesos intermedios y el estado del optimizador. El tamano del repositorio (725,9 GB) refleja que se trata de checkpoints completos con estado de optimizador, no de pesos finales cuantizados. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints de RL offline, no se especifica la red del actor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en `.pkl` sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pkl` (pickle de Python, con estado del actor y del optimizador); metadatos en `.json`, `.npz` y `.csv` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de la red del actor ni del scorer. El repositorio se limita a almacenar los artefactos de un pipeline de aprendizaje por refuerzo offline sobre el entorno OCBench, bajo el proyecto `ocbench_unified_rsm`. Cada checkpoint (`params_<step>.pkl`) incluye el estado del optimizador, lo que lo hace apto para reanudar el entrenamiento y no solo para inferencia.

Los metadatos por segmento de ejecucion incluyen `flags.json` (configuracion de ambos brazos del experimento), `action_normalizer.npz` (normalizador de acciones), `resume.json` (estado de reanudacion) y ficheros CSV de evaluacion y entrenamiento. El repositorio conserva 505 checkpoints referenciados por las evaluaciones seguras; otros 418 checkpoints referenciados fueron podados antes de la subida y no estan incluidos, lo que limita la reproducibilidad completa del conjunto original.

## Capacidades

- Almacenamiento y distribucion de checkpoints de RL offline con estado de optimizador para reanudar entrenamiento.
- Reconstruccion de la procedencia de cada evaluacion: los registros en `results/secured/` incluyen metricas, flags de ambos brazos y huella del checkpoint.
- Auditoria de resultados: permite verificar que checkpoint concreto produjo cada evaluacion reportada.
- Reanudacion de segmentos de entrenamiento mediante `resume.json` y `action_normalizer.npz`.
- No es un modelo generativo: no soporta generacion de texto, codigo, vision, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Reproduccion de experimentos de RL offline: un investigador puede cargar `params_<step>.pkl` con el optimizador incluido y reanudar el entrenamiento exactamente en el paso reportado, comparando sus metricas con las de `results/secured/evals/*.json`.
- Auditoria de resultados publicados: los ficheros de evaluacion permiten rastrear que checkpoint (ruta, tamano y huella) genero cada metrica, lo que facilita la verificacion independiente de las cifras del proyecto OCBench.
- Analisis de curvas de aprendizaje: los CSV de entrenamiento y evaluacion por segmento permiten reconstruir la evolucion de las metricas a lo largo de los pasos y detectar inestabilidades.
- Estudio de normalizacion de acciones: `action_normalizer.npz` permite replicar el preprocesado exacto de acciones empleado en cada segmento, un detalle critico para comparar brazos de forma justa.
- Comparacion de brazos (arms) del experimento: `flags.json` documenta la configuracion completa de ambos brazos, lo que permite aislar que hiperparametros explican las diferencias de rendimiento.
- Archivado a largo plazo de artefactos de investigacion: dado que 418 checkpoints referenciados ya fueron podados, este repositorio sirve como copia de preservacion de los 505 que sobrevivieron, util para instituciones que exigen retencion de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene registros de evaluacion en `results/secured/evals/*.json`, pero sus valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano de la red del actor, que no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica como modelo de inferencia; los artefactos se cargan con Python/pickle para reanudar entrenamiento o analisis.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 725,9 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene descargar solo los segmentos o pasos necesarios.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de checkpoints del mismo proyecto o de proyectos equivalentes de RL offline sobre OCBench.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son checkpoints de entrenamiento en crudo con estado de optimizador, no pesos finales para inferencia.
- Cobertura incompleta: 418 checkpoints referenciados por las evaluaciones fueron podados antes de la subida y no estan incluidos, por lo que la reproducibilidad completa del conjunto original no es posible.
- Los ficheros en `unverified_latest/` tienen procedencia no verificada: el paso exacto reportado fue podado y no deben tratarse como los checkpoints reportados.
- Formato `.pkl`: la carga de pickle de Python implica riesgos de seguridad si los ficheros no provienen de una fuente confiable; conviene cargarlos en entornos aislados.
- Sesgos conocidos: no disponibles; al no ser un modelo de lenguaje, no aplican sesgos de generacion, pero los resultados de RL pueden heredar sesgos del entorno y de los datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no aplica (no es un modelo generativo).
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero no se documentan las licencias de las dependencias ni del entorno OCBench subyacente.
- Requisitos de almacenamiento elevados (725,9 GB) y posible necesidad de versiones concretas de librerias para deserializar los `.pkl` correctamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zwhong/ocbench-rsm-checkpoints
