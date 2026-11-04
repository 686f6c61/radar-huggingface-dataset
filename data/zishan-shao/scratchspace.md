# Zishan-Shao/scratchspace

## Resumen

`Zishan-Shao/scratchspace` no es un modelo entrenado, sino un paquete de artefactos de investigacion congelados para los tres experimentos de replica (rebuttal) del proyecto Basis, en la rama `rebuttal/20261104-defense-experiments`. El repositorio contiene 26 fuentes de modelos congeladas (301,786 GiB, incluidas dos redes densas "padre"), un archivo de 0,653 GiB con 331 ficheros (68 adaptadores unicos, datos de tokenizacion, vectores densos firmados, especificaciones de ejecucion originales y metadatos) y manifiestos de transferencia con SHA256 por fichero. Su proposito es garantizar la reproducibilidad de mediciones GPU en un cluster de destino distinto del de origen.

El paquete esta disenado como entrada de un pipeline de medicion, no como salida: la instantanea de traspaso registra 0 de 134 mediciones GPU completadas. La medicion completa en FP32 requiere al menos 64 GiB de VRAM libre y el planificador usa como maximo dos GPU. La descarga se realiza con `huggingface-hub==0.35.3` mediante patrones de include sobre `checkpoints/frozen_sources/**` y `rebuttal/migration/**`, y se verifica con sumas SHA256 antes de descomprimir el archivo de entradas.

Es relevante ahora porque documenta un flujo de handoff entre maquinas para experimentos de interpretabilidad/defensa con adaptadores (68 adaptadores unicos sobre modelos base congelados), con identidades canonicas verificables. No hay informacion publica sobre arquitectura, parametros o contexto de los modelos subyacentes en la model card; el contenido es exclusivamente operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio agrupa 26 fuentes de modelos congeladas, no un modelo unico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (las mediciones previstas son en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag de la libreria `transformers`); el paquete incluye un tar de entradas y manifiestos JSON con SHA256 |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repo | 225,2 GB |
| Fuentes de modelos congeladas | 26 (301,786 GiB), incluidas dos redes densas padre |
| Archivo de entradas | 0,653 GiB, 331 ficheros, 68 adaptadores unicos |
| Mediciones GPU completadas | 0 de 134 |
| VRAM minima para FP32 | 64 GiB libres |
| GPU maximas usadas por el planificador | 2 |
| Espacio en disco recomendado | >= 303 GiB mas espacio para salidas |
| Libreria | transformers |
| Tags | rebuttal, research, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se describe arquitectura de modelo en la informacion disponible. El repositorio es un contenedor de artefactos de investigacion: 26 fuentes de modelos congeladas bajo `checkpoints/frozen_sources/` con rutas originales preservadas, mas 68 adaptadores unicos y vectores densos firmados dentro de `rebuttal_inputs.tar`. Cada modelo tiene una identidad canonica congelada registrada en `transfer_manifest.json`, junto con tamano y SHA256 por fichero, lo que permite verificar que las mediciones se ejecutan sobre exactamente los mismos pesos que en el cluster de origen.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO). El unico detalle de proceso es metodologico: las especificaciones de ejecucion (`run specs`) estan congeladas y no deben editarse ni regenerarse con `prepare.py` / `add_cost_jobs.py` tras el traslado, y las mediciones nuevas en GPU deben partir de este paquete, no de la extraccion de caracteristicas historica del Experimento 1 (10,3 GiB, excluida del paquete).

## Capacidades

- No aplica como modelo generativo: el repositorio no declara pipeline ni tarea en HuggingFace (`pipeline: no disponible`).
- Transporte reproducible de pesos congelados: descarga reanudable via `hf download` con patrones de include y verificacion SHA256 (`sha256sum -c rebuttal_inputs.tar.sha256`).
- Verificacion de identidad de modelos: `python rebuttal/migrate.py check --verify-models` y `python rebuttal/verify.py`.
- Ejecucion de una cola de 134 mediciones GPU mediante `rebuttal/pipeline.py`, con preflights obligatorios y uso de como maximo dos GPU.
- Publicacion desde el cluster de origen con `rebuttal/publish_hf.py --upload`, que comprueba identidades congeladas, prepara enlaces simbolicos sin copiar datos de modelo, reanuda con metadatos locales y verifica tamanos y hashes remotos antes de escribir `UPLOAD_COMPLETE.json`.
- Preparacion local sin autenticacion: `python rebuttal/publish_hf.py --prepare`.
- Analisis parcial de mediciones: `python rebuttal/analyze_measurements.py --partial`.

## Casos de uso

- Replica de experimentos de defensa en un cluster distinto: descargar el paquete con `hf download`, verificar hashes y lanzar `rebuttal/pipeline.py` en segundo plano con `nohup` para reproducir las 134 mediciones GPU planificadas sobre los mismos pesos congelados.
- Auditoria de integridad de pesos: usar `transfer_manifest.json` y `migrate.py check --verify-models` para confirmar que las identidades canonicas de los 26 modelos y los 68 adaptadores coinciden bit a bit con las del origen antes de publicar resultados.
- Gestion de presupuesto de almacenamiento en clusters: planificar >= 303 GiB libres mas espacio para salidas, y decidir si se excluye la extraccion de caracteristicas historica (10,3 GiB) segun se necesiten resultados CPU previos o solo mediciones GPU nuevas.
- Reanudacion de transferencias largas: repetir el mismo comando `hf download` para retomar descargas interrumpidas de un paquete de 301,786 GiB sin reiniciar desde cero.
- Publicacion controlada de artefactos: ejecutar `publish_hf.py --upload` desde el cluster de origen para reemplazar el estado de handoff (0/134) por un paquete con mediciones completas, con verificacion remota de tamanos y hashes antes de marcar `UPLOAD_COMPLETE.json` como `complete`.
- Preparacion de entorno en maquina nueva: seguir `rebuttal/NEW_MACHINE.md` para instalar el entorno del checkout de codigo y fijar `huggingface-hub==0.35.3`, evitando discrepancias de version en la descarga.
- Analisis incremental de resultados: usar `analyze_measurements.py --partial` para obtener lecturas intermedias mientras la cola GPU sigue en ejecucion, sin esperar a las 134 mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paquete declara explicitamente 0/134 mediciones GPU completadas y se describe como artefactos de entrada, no como resultados finales.

## Requisitos de hardware

- VRAM: al menos 64 GiB libres de memoria GPU para la medicion completa en FP32.
- GPU: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible; el planificador usa como maximo dos GPU.
- GPU de consumo: no disponible; el requisito de 64 GiB libres en FP32 excede la VRAM de las GPU de consumo habituales, pero no se confirma en la documentacion proporcionada.
- Almacenamiento: >= 303 GiB libres en el destino, mas espacio adicional para salidas de experimentos.
- Despliegue: no aplica inferencia de servicio; el flujo es `huggingface-hub` 0.35.3 para descarga, scripts del repositorio Basis (`migrate.py`, `verify.py`, `pipeline.py`, `analyze_measurements.py`, `publish_hf.py`) y un entorno conda llamado `flashsvd` en el cluster de origen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con pesos publicados para inferencia, sino un paquete de artefactos de investigacion; no se identifican alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no declara pipeline, licencia, idiomas ni arquitectura; los pesos subyacentes pertenecen a 26 fuentes congeladas cuyo detalle no se publica en la model card.
- Licencia no disponible: no hay autorizacion explicita de uso comercial ni de redistribucion; tratar como material de investigacion restringido hasta confirmar terminos.
- Estado incompleto por diseno: 0/134 mediciones GPU completadas; cualquier conclusion sobre rendimiento a partir de esta instantanea seria prematura.
- Fragilidad del flujo: no se deben editar las especificaciones de ejecucion congeladas ni volver a ejecutar `prepare.py` / `add_cost_jobs.py` despues del traslado; hacerlo invalida la reproducibilidad.
- Dependencia de version: se fija `huggingface-hub==0.35.3`; otras versiones pueden alterar el comportamiento de descarga o de reanudacion.
- Coste de infraestructura elevado: 301,786 GiB de fuentes mas 0,653 GiB de entradas, con requisito de 64 GiB de VRAM libre y verificacion SHA256 de 331 ficheros, lo que implica tiempos de transferencia y validacion significativos.
- Riesgo de confusion con un modelo: el nombre `scratchspace` y los tags `transformers`/`safetensors` pueden llevar a intentar cargarlo con `AutoModel`; no hay evidencia de que sea cargable como modelo unico.
- Sin datos de sesgo ni alucinacion aplicables: al no ser un modelo generativo, esas advertencias no se pueden evaluar; la limitacion real es la ausencia de documentacion tecnica de los pesos incluidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zishan-Shao/scratchspace
- Repositorio GitHub Basis (rama de replica): https://github.com/Zishan-Shao/Basis/tree/rebuttal/20261104-defense-experiments
- Documentacion de maquina nueva: `rebuttal/NEW_MACHINE.md` (dentro del repositorio GitHub anterior)
- No se han encontrado papers, blogs, demos ni otros repositorios en la informacion proporcionada.
