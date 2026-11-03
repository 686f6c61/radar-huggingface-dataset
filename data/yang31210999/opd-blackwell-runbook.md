# yang31210999/opd-blackwell-runbook

## Resumen

`opd-blackwell-runbook` no es un modelo de lenguaje, sino un repositorio de infraestructura y automatización publicado en Hugging Face. Contiene un manual operativo, scripts de instalación y una cola de tareas para convertir un nodo con 8 GPU NVIDIA B200 o B300 en un nodo remoto de experimentación que ejecuta trabajos de forma desatendida y sube los resultados a Hugging Face o ModelScope. El autor es el usuario `yang31210999`, y el repositorio se creó el 3 de noviembre de 2026.

El contenido describe el proyecto OPD (mecanismo de experimentación) y una pila de software concreta: torch 2.8.0 con CUDA 12.8, vLLM 0.10.2, flashinfer 0.3.0, transformers 4.56.x y la rama G-OPD de verl fijada en un commit específico. La cola incluye experimentos con estudiantes Qwen3 de 0.6B, 1.7B y 8B, junto con los conjuntos MATH-500 y DAPO-Math-17k.

Es relevante ahora porque documenta, con nivel de detalle poco habitual, los problemas de compatibilidad de la pila de entrenamiento e inferencia en Blackwell (sm_100 y sm_103), incluyendo avisos sobre flash-attn, Triton/ptxas y la combinación verl 0.6.1 con vLLM 0.10.2, que el propio autor reconoce no haber probado. No obstante, no contiene pesos, tokenizador ni configuración de modelo, por lo que no es utilizable como modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; describe una pila de entrenamiento e inferencia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (menciona pesos bf16 para los checkpoints subidos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los checkpoints generados se describen como bf16; no se indica formato de serialización) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal. Su contenido es una guía de operaciones para ejecutar experimentos de destilación o política con estudiantes Qwen3 (0.6B, 1.7B y 8B) sobre una pila basada en verl (rama G-OPD, commit `37371a4c31ad7947746200d234161769191f4748`, sobre verl 0.6.1) y vLLM 0.10.2 para generación. La pila fija torch 2.8.0 con runtime CUDA 12.8, flashinfer-python 0.3.0 y transformers 4.56.x, y descarta flash-attn por su soporte inestable en Blackwell, usando SDPA en entrenamiento y FlashInfer en inferencia.

En cuanto a datos, el runbook descarga MATH-500 y DAPO-Math-17k y genera ficheros parquet mediante `code/train/prep_data.py`. La cola de experimentos (versión 2) es fija: E10b con siete brazos sobre el estudiante de 1.7B, E11b con reevaluación a 16K y TWR/α, E12b tier A con el punto de partida SFT P1, tareas sin entrenamiento E03 y E02, el resto de puntos de partida de E12b, un segundo grupo de brazos de 1.7B y réplicas de semillas de P2/P6r. El autor indica explícitamente que no se añaden semillas, no se escala a 4B y no se incorporan métodos nuevos.

## Capacidades

- Orquestación desatendida de experimentos en nodos de 8 GPU B200/B300 mediante `scripts/overnight.sh` y `setsid nohup`.
- Instalación reproducible por tres vías: uv (recomendada), conda y Docker sobre la imagen `verlai/verl:base-verl0.6-cu128-cudnn9.8-torch2.8.0-fa2.7.4`.
- Verificación previa del entorno con `scripts/verify.sh`, que incluye una comprobación de subida (UPLOAD_CHECK).
- Descarga de modelos y datasets con fallback automático a hf-mirror y opción de usar ModelScope (`USE_MODELSCOPE=1`).
- Exploración de caché local con `scripts/scan_cache.sh`, que valida la integridad de los pesos (1 fichero para 0.6B, 2 para 1.7B, 5 para 8B).
- Subida automática de resultados a Hugging Face o ModelScope con `scripts/remote.py` y `upload_sync.sh`, con heartbeat cada 10 minutos.
- Gestión de la cola de tareas mediante `tasks/queue.txt`, con apertura automática de la siguiente fase.
- Soporte declarado para B300 (sm_103) mediante compatibilidad de código sm_100, aunque sin validación real.

## Casos de uso

- Puesta en marcha de un nodo de experimentación: un colaborador con 8 GPU B200 sigue la sección de instalación y verificación para dejar la máquina operativa como nodo remoto gestionado por el proyecto, sin intervención manual diaria.
- Ejecución desatendida de barridos de hiperparámetros: la cola E10b lanza siete brazos en paralelo, uno por GPU, con la octava libre, y avanza automáticamente a E11b al terminar.
- Reutilización de caché en máquinas ya provisionadas: `scan_cache.sh` detecta copias completas de Qwen3 y evita volver a descargar decenas de gigabytes, lo que reduce el tiempo de arranque a minutos.
- Entornos con red restringida: el fallback a hf-mirror y la opción ModelScope permiten descargar modelos y datasets cuando el acceso directo a huggingface.co no es viable, y `HF_ENDPOINT` se limita a descargas sin afectar a las subidas.
- Reproducción de resultados en clústeres heterogéneos: la fijación de versiones en `requirements.lock` y del commit de verl permite replicar la misma pila en H100 (CUDA 12.6, torch 2.6, vLLM 0.8.5) y en Blackwell.
- Diagnóstico de fallos en Blackwell: el runbook documenta errores concretos (PTXASError de Triton, inestabilidad de flash-attn) y el procedimiento para reportarlos vía GitHub Issues con logs adjuntos.
- Auditoría de privacidad en la subida de artefactos: la variable `REQUIRE_PRIVATE=1` hace que los scripts rechacen subir a repositorios públicos, útil cuando los checkpoints no deben exponerse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de modelo; únicamente menciona que el estudiante de 1.7B se entrena durante 150 pasos en 8 GPU, sin datos de throughput ni latencia.

## Requisitos de hardware

- GPU: 8 × NVIDIA B200 o B300 por nodo; el autor solo ha validado la instalación, los tests unitarios, el accept y un smoke test de 3 pasos en 1 × B200.
- Drivers y CUDA: driver NVIDIA ≥ 570 y CUDA ≥ 12.8.
- Sistema: Linux x86_64 con Python 3.10 o 3.11.
- Almacenamiento: aproximadamente 60 GB por brazo; se recomiendan ≥ 600 GB libres para siete brazos, o unos 300 GB si solo se conservan los pesos bf16 ya subidos.
- Red: acceso a PyPI, GitHub y Hugging Face o su mirror; también a ModelScope si se usa como backend de subida.
- Despliegue: uv, conda o Docker; inferencia con vLLM 0.10.2 y FlashInfer 0.3.0; entrenamiento con verl (rama G-OPD).
- No se proporcionan datos de latencia ni de throughput.
- No se indica compatibilidad con GPU de consumo (RTX 4090 u otras); el runbook está escrito exclusivamente para B200/B300.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo y no se han identificado en la información proporcionada proyectos comparables de runbooks para nodos Blackwell con cola de experimentos y subida automática de resultados.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador, configuración ni model card de un modelo de lenguaje; descargarlo no permite inferencia.
- Licencia no declarada: no se especifican términos de uso, lo que impide evaluar su idoneidad para uso comercial o su redistribución.
- Validación incompleta: el autor reconoce que la ruta uv solo se ha probado en 1 × B200 con un smoke test de 3 pasos; el entrenamiento completo de 150 pasos con 8 GPU, la ruta Docker y la ruta conda no se han probado.
- Compatibilidad no verificada en B300: la pila cu128 incluye `sm_100` y `sm_120`, pero no `sm_103`; el funcionamiento en B300 se basa en la regla de compatibilidad de CUDA y no en pruebas reales.
- Riesgo de combinación de versiones: verl 0.6.1 con vLLM 0.10.2 no se ha ejecutado; la pila original de G-OPD usa vLLM 0.8.5 y torch 2.6.
- Fallos conocidos en Blackwell: errores `PTXASError` de Triton y soporte inestable de flash-attn, que obligan a usar SDPA y FlashInfer.
- Historial de errores en scripts: la versión v2.3.1 corrige que versiones anteriores omitían silenciosamente los checkpoints de 1.7B guardados en shards y podían perder el último checkpoint.
- Riesgo de fuga de credenciales: el repositorio es público y el runbook insiste en no incluir `HF_TOKEN`, `MS_TOKEN` ni claves en ficheros o issues; no obstante, la gestión manual de tokens en variables de shell es propensa a errores.
- Sin datos de sesgo, alucinación o cobertura lingüística, al no tratarse de un modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yang31210999/opd-blackwell-runbook
- Repositorio en GitHub: https://github.com/yang3121099/opd-blackwell-runbook
- Issues del proyecto: https://github.com/yang3121099/opd-blackwell-runbook/issues
- Rama G-OPD de verl: https://github.com/RUCBM/G-OPD
- Imagen base de Docker (verl): `verlai/verl:base-verl0.6-cu128-cudnn9.8-torch2.8.0-fa2.7.4`
