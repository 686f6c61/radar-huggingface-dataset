# Zachary1150/ear-eeg-fm-benchmark-runs-archive

## Resumen

Este repositorio de Hugging Face no contiene un modelo desplegable, sino un archivo de artefactos de ejecución (checkpoints, métricas, predicciones, configuraciones y logs) del benchmark de modelos fundacionales de Ear-EEG del autor Zachary1150. Alberga las ejecuciones que ya no están en uso activo: experimentos de eficiencia de datos y de presupuesto de etiquetas, ejecuciones de personalización, pilotos tempranos, pruebas de humo y layouts de ejecución heredados. Los datos se copiaron desde los clústeres de entrenamiento pde, h100 y h200 en octubre de 2026, antes de liberar las copias locales.

El repositorio ocupa 175,5 GB y existe como desbordamiento del repositorio `Zachary1150/ear-eeg-fm-benchmark-ckpt`, que alcanzó el límite de 20 000 ficheros del Hub el 23 de octubre de 2026. Ambos usan la misma estructura de rutas (`runs/<exp>/...`), de modo que un mismo directorio de ejecución puede estar partido entre los dos: los `best.pt` en el repositorio antiguo y los `last.pt` más los ficheros pequeños en este.

Para reducir el recuento de ficheros, los ficheros pequeños se empaquetan en archivos `_small_files_<host>_<time>.tar.gz` acompañados de un manifiesto TSV con ruta, tamaño y sha256 de cada miembro. La licencia declarada es `other`, sin texto adicional en la model card, y no se documentan arquitectura, parámetros ni contexto de los modelos subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de artefactos; los checkpoints `.pt` corresponden a modelos evaluados en el benchmark, sin arquitectura documentada en esta ficha) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que los modelos evaluados sean MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se almacenan checkpoints en precisión nativa `.pt`; no se documenta cuantización) |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no incluido en la model card) |
| Formato de pesos | `.pt` (PyTorch) para `best.pt`, `last.pt`, `best_method.pt`; ficheros pequeños empaquetados en `.tar.gz` con manifiesto `.manifest.tsv` |
| Tamano del repositorio | 175,5 GB |
| Estructura de rutas | `runs/<exp>/...` (idéntica a la del código de entrenamiento) |
| Repositorio complementario | `Zachary1150/ear-eeg-fm-benchmark-ckpt` |
| Documentacion de ejecuciones | `docs/ops/experiment-ledger.md` y `docs/ops/run-inventory.md` en el repositorio de código del benchmark (no enlazados en la model card) |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-10-24T00:18:45Z |
| Ultima actualizacion | 2026-10-24T02:21:21Z |
| Hosts de origen | pde, h100, h200 |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura de los modelos cuyos artefactos se archivan. El repositorio es un contenedor de salidas de experimentos: checkpoints PyTorch (`.pt`), métricas, predicciones, configuraciones y logs generados por el código del benchmark Ear-EEG, cuyo ledger de experimentos y cuyo inventario de ejecuciones viven en el repositorio de código (`docs/ops/experiment-ledger.md`, `docs/ops/run-inventory.md`). Por tanto, cualquier detalle sobre transformer, MoE o modelos de espacio de estados, número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO queda fuera del alcance de la información disponible.

Sí está documentada la política de empaquetado y verificación: los ficheros pequeños (todo excepto `*.pt` y ficheros de más de 50 MB) se agrupan en un archivo tar por directorio y host de origen, con rutas relativas a la raíz del repositorio y un manifiesto TSV con tamaño y sha256 de cada miembro. Los checkpoints se almacenan uno a uno en su ruta original. La integridad se comprobó tras la subida (tamaño y sha256 para ficheros LFS; cada miembro del tar contra su manifiesto) y, antes de borrar cada copia local, se aplicó hash y comparación mediante `scripts/hf_backup.py --audit`.

## Capacidades

- Este repositorio no expone un modelo ejecutable ni una API de inferencia; su función es preservar artefactos de experimentos.
- Recuperación de directorios de ejecución completos combinando prefijos idénticos de este repositorio y de `ear-eeg-fm-benchmark-ckpt`.
- Reconstrucción de resultados experimentales a partir de métricas, predicciones, configuraciones y logs almacenados.
- Verificación criptográfica de integridad mediante los manifiestos TSV y los hashes de los ficheros LFS.
- Trazabilidad de ejecuciones por host de origen (pde, h100, h200) y por marca temporal en el nombre de los archivos empaquetados.
- Cobertura de tipologías de experimento: eficiencia de datos, presupuesto de etiquetas, personalización, pilotos tempranos, pruebas de humo y layouts heredados.
- No consta soporte de tool calling, agentes, multimodalidad ni capacidades multilingües, al no tratarse de un modelo.

## Casos de uso

- Reproducibilidad de experimentos de eficiencia de datos: descargar los directorios de las ejecuciones correspondientes y reutilizar sus configuraciones y métricas para replicar las curvas publicadas o verificar conclusiones del benchmark.
- Reconstrucción de ejecuciones partidas: cuando un directorio quedó dividido entre los dos repositorios, descargar el mismo prefijo de ambos en un único checkout y extraer los tar en la raíz para restaurar la estructura `runs/<exp>/...` completa.
- Auditoría de integridad de un artefacto antes de usarlo en un artículo: comprobar tamaño y sha256 contra el manifiesto y contra los hashes LFS del Hub.
- Análisis de sobreajuste y selección de checkpoint: comparar `best.pt`, `best_method.pt` y `last.pt` de una misma ejecución para estudiar la divergencia entre el mejor punto de validación y el estado final del entrenamiento.
- Reconstrucción de curvas de aprendizaje: agregar las métricas y los logs empaquetados de los barridos de presupuesto de etiquetas para analizar el rendimiento en función del número de etiquetas disponibles.
- Estudio de personalización de modelos Ear-EEG: recuperar las ejecuciones de personalización y sus predicciones para medir la ganancia por sujeto frente al modelo base.
- Recuperación tras liberación de almacenamiento en clúster: rehidratar datos eliminados de pde, h100 o h200 usando este archivo como copia de referencia verificada.
- Punto de partida para comparaciones externas: servir de base factual para contrastar los resultados del benchmark con marcos de evaluación estandarizados de modelos fundacionales de EEG, como EEG-FM-Bench, si bien no consta que sean el mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene métricas y predicciones de las ejecuciones archivadas, pero la model card no incluye cifras agregadas ni tablas comparativas.

## Requisitos de hardware

- Almacenamiento: 175,5 GB para la descarga completa; prever espacio adicional para la extracción de los tar y para combinar con `ear-eeg-fm-benchmark-ckpt`.
- VRAM para inferencia: no disponible; depende del tamaño de los modelos subyacentes, que no se documenta. Cargar un checkpoint requiere PyTorch y memoria proporcional a su tamaño, desconocido.
- GPU recomendadas: no disponible. Los hosts de origen (pde, h100, h200) indican que el entrenamiento se ejecutó en hardware de datacenter, pero no se especifica la configuración por ejecución.
- GPU de consumo: no se puede determinar si los checkpoints caben en tarjetas como RTX 4090 sin conocer el número de parámetros.
- Despliegue: no aplica como servidor de inferencia (vLLM, TGI, llama.cpp u Ollama no son relevantes para un archivo de artefactos). Herramientas pertinentes: `huggingface-cli` o `git-lfs` para la descarga, `tar` para desempaquetar y el script `scripts/hf_backup.py --audit` del repositorio de código para verificación.
- Latencia y throughput: no disponibles; no hay servicio de inferencia asociado.
- Ancho de banda: descarga masiva de 175,5 GB; conviene usar descargas por prefijo (`runs/<exp>/`) en lugar de clonar el repositorio completo.

## Comparativa con modelos similares

No se dispone de modelos comparables en sentido estricto, ya que el repositorio no contiene un modelo. Se comparan a continuación repositorios del mismo autor y un marco de evaluación relacionado del ecosistema.

| Repositorio / proyecto | Tipo | Contenido | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| `Zachary1150/ear-eeg-fm-benchmark-runs-archive` (este) | Archivo de artefactos | Ejecuciones fuera de uso activo: `last.pt`, ficheros pequeños empaquetados, pilotos, smoke tests | 175,5 GB | other | Archivado, 0 descargas |
| `Zachary1150/ear-eeg-fm-benchmark-ckpt` | Archivo de checkpoints | Misma estructura `runs/<exp>/`; recibió ficheros hasta el 2026-10-23 (límite de 20 000 ficheros) | no disponible | no disponible | Activo hasta alcanzar el límite |
| `Zachary1150/ear-eeg-fm-benchmark-model` | Repositorio de modelo | No documentado en la información disponible | no disponible | no disponible | no disponible |
| EEG-FM-Bench (xw1216, arXiv 2508.17742) | Marco de evaluación | Protocolo unificado para evaluar modelos fundacionales de EEG; no consta relación con este autor | no disponible | no disponible | Paper y repositorio públicos |

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con `transformers`, no tiene tokenizador ni pipeline, y no ofrece inferencia directa.
- La licencia es `other` sin texto: no hay base explícita para uso comercial, redistribución o creación de derivados. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Ausencia total de especificaciones del modelo subyacente (arquitectura, parámetros, contexto, datos de entrenamiento), lo que impide evaluar su idoneidad sin consultar el repositorio de código.
- Ejecuciones incompletas por diseño: un directorio puede tener los `best.pt` en un repositorio y los `last.pt` en otro; una descarga parcial produce resultados silenciosamente inconsistentes.
- Los tar deben extraerse en la raíz del checkout y sus miembros tienen rutas relativas; extraerlos en otro directorio rompe la estructura `runs/<exp>/...`. Se recomienda `--skip-old-files` para no sobrescribir ficheros ya presentes.
- Riesgo de confusión entre ficheros del mismo nombre provenientes de distintos hosts: los nombres incluyen host y marca temporal, pero las rutas internas no.
- No consta que los checkpoints estén libres de datos derivados de participantes; la model card no trata privacidad ni cumplimiento de RGPD para datos EEG.
- Sin validación comunitaria: 0 descargas y 1 like en la fecha de creación; no hay issues, discusiones ni resultados replicados de forma independiente.
- Las fechas del repositorio (octubre de 2026) y el límite de 20 000 ficheros citado deben tomarse tal cual figuran en la model card.
- No se ha verificado de forma independiente la integridad declarada; las comprobaciones descritas son las que el autor afirma haber ejecutado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zachary1150/ear-eeg-fm-benchmark-runs-archive
- Repositorio complementario de checkpoints (ID citado en la model card): https://huggingface.co/Zachary1150/ear-eeg-fm-benchmark-ckpt
- Repositorio de modelo del mismo autor: https://huggingface.co/Zachary1150/ear-eeg-fm-benchmark-model
- Paper EEG-FM-Bench (arXiv 2508.17742): https://arxiv.org/abs/2508.17742
- Version HTML del paper: https://arxiv.org/html/2508.17742v2
- Repositorio GitHub EEG-FM-Bench: https://github.com/xw1216/EEG-FM-Bench
