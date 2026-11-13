# WaveCut/Edge0-ngram-table-FP8-NInfer-v3

## Resumen

WaveCut/Edge0-ngram-table-FP8-NInfer-v3 no es un modelo de lenguaje completo, sino un artefacto auxiliar de inferencia: la tabla n-gram de embeddings por capa (PLE, *per-layer embedding*) de la familia de modelos Edge0, empaquetada en el formato contenedor NInfer v3. La desarrolla el usuario WaveCut (Neroued/iamwavecut) a partir de la revisión `51a60a20` del modelo base `Edge0/Edge0-120B-q3k`, y su propósito es servir de dependencia compartida para todas las conversiones NInfer de las versiones Edge0 que se publican sin su tabla: Edge0-145B-NVFP4, Edge0-145B-q3k, Edge0-120B-NVFP4 y Edge0-120B-q3k.

El artefacto contiene 320.001.536 filas de 160 valores cada una (51,2 mil millones de parámetros en total), organizadas en 16 cabeceras hash sobre los n-gramas de 2 y 3 tokens del contexto. Cada token lee las 16 filas que direccionan sus n-gramas. Los valores son los códigos FP8 E4M3 del fichero `ple-fp8.gguf` de las releases, copiados byte a byte, junto con la escala global de la release (209 × 2^-20) escrita como FP16 en cada fila.

Su relevancia es operativa: cualquier build estándar de NInfer no puede leer este fichero; solo la rama `master` de `iamwavecut/ninfer-all` (desde el commit `72d1d8e04`) lo soporta. El fichero único ocupa 51.840.252.928 bytes (48,28 GiB) y debe descargarse junto al modelo y pasarse mediante el flag `--ngram-table`. No se ha reentrenado ningún peso ni recuantizado ningún bloque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla n-gram de embeddings por capa (PLE) en formato NInfer v3; 16 cabeceras hash sobre n-gramas de 2 y 3 tokens |
| Parametros totales | 51,2B (320.001.536 filas × 160 valores) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica al artefacto; el ejemplo de ejecución usa `--max-context 32768` |
| Tipos de cuantizacion | FP8 E4M3 (códigos), con escala global FP16 (209 × 2^-20) por fila; formato de fila `fp8_e4m3fn_row_fp16` |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-license-1.0 (componentes Edge0) + Qwen Community License 1.0 (materiales Qwen) |
| Formato de pesos | `.ninfer` (contenedor NInfer v3); fichero único de 51.840.252.928 bytes (48,28 GiB) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es un repack de datos existentes. La tabla PLE original vive en el fichero `ple-fp8.gguf` de las releases Edge0 (el mismo fichero en las cuatro variantes) y aquí se reempaqueta en el contenedor de NInfer mediante el conversor `tools/convert/edge0.py` de `iamwavecut/ninfer-all`, con la receta `edge0_pack` y el componente `ngram`. La estructura son 320.001.536 filas de 160 valores FP8 E4M3; cada token del contexto consulta 16 filas determinadas por los hashes de sus n-gramas de 2 y 3 tokens. El componente `ngram` del fichero registra las constantes hash para las que se escribieron las filas, su formato y el SHA-256 de las filas (`57496326706760c564e80ed401f6b26a7d6b340cc05966502675c8dc01ef8fd9`); NInfer rechaza una tabla que no coincida con esos valores.

La innovación técnica es de empaquetado y verificación, no de modelado: los códigos FP8 se conservan byte a byte y la escala global de la release se escribe como FP16 en cada fila (exacta en FP16), lo que permite que el runtime lea 16 filas por token directamente del fichero o las cargue íntegramente en RAM con `--ngram-residency ram`. No se ha reentrenado ningún peso ni recuantizado ningún otro bloque.

## Capacidades

- Almacenamiento y direccionamiento de la tabla PLE de la familia Edge0 mediante hashes de n-gramas de 2 y 3 tokens.
- Suministro de las filas de embedding por capa que los modelos Edge0-120B y Edge0-145B (NVFP4 y q3k) necesitan en tiempo de inferencia.
- Verificación de integridad: el componente `ngram` expone constantes hash, formato y SHA-256 de las filas, y NInfer rechaza tablas que no coincidan.
- Carga opcional completa en memoria RAM (`--ngram-residency ram`) para evitar lecturas desde disco por token.
- No realiza generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes por sí mismo; esas capacidades pertenecen al modelo Edge0 al que acompaña.
- Compatibilidad limitada: solo la rama `master` de `iamwavecut/ninfer-all` desde el commit `72d1d8e04`; los builds estándar de NInfer no pueden leerlo.

## Casos de uso

- Despliegue de Edge0-120B-q3k con NInfer: descargar este artefacto junto al modelo y arrancar `ninfer-serve models/Edge0-120B-q3k-ninfer-v3.ninfer --ngram-table models/Edge0-ngram-table-FP8-ninfer-v3.ninfer --model-id edge0-120b --max-context 32768`.
- Despliegue de Edge0-145B-q3k y Edge0-145B-NVFP4: la misma tabla sirve a las cuatro releases listadas, lo que evita duplicar 48,28 GiB por cada conversión.
- Despliegue de variantes NVFP4 (Edge0-120B-NVFP4): reutilización de la tabla compartida en entornos con GPU que aprovechan el formato NVFP4 para los pesos principales.
- Servicios de inferencia en memoria: con `--ngram-residency ram` se precargan las 320.001.536 filas para eliminar la latencia de lectura por token en servidores con RAM suficiente.
- Verificación de cadena de suministro: comprobar el SHA-256 de las filas y las constantes hash registradas en el componente `ngram` antes de poner un despliegue en producción.
- Reproducibilidad de conversiones: reconstruir el artefacto con el comando documentado (`python3 -m tools.convert --model Qwen3.8-Flash-Next --recipe edge0_pack --source pack=Edge0-120B-q3k --components ngram --device cpu --name edge0-ngram-table-fp8 --out Edge0-ngram-table-FP8-ninfer-v3.ninfer`) para auditar el pipeline.
- Integración en pipelines internos de MLOps: distribuir la tabla como dependencia versionada de los artefactos NInfer de Edge0, con `SHA256SUMS` como control de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput ni calidad para este artefacto.

## Requisitos de hardware

- Espacio en disco: 51.840.252.928 bytes (48,28 GiB) para el fichero `.ninfer`, más el modelo Edge0 correspondiente y los ficheros `SHA256SUMS`, `LICENSE`, `NOTICE`, `release-scope.json` y `third-party/Qwen-LICENSE.txt`.
- RAM: con `--ngram-residency ram`, la tabla completa debe caber en memoria (48,28 GiB solo para este componente, además del modelo). Sin esa opción, NInfer lee 16 filas por token desde el fichero.
- VRAM: no disponible para el artefacto; depende del modelo Edge0 acompañante y de su cuantización (q3k o NVFP4).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU consumer: no disponible; el límite documentado es de RAM/disco para la tabla.
- Opciones de despliegue: exclusivamente NInfer, rama `master` de `iamwavecut/ninfer-all` desde el commit `72d1d8e04`, mediante `ninfer-serve` y el flag `--ngram-table`. Los builds estándar de NInfer no lo soportan; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Contenido | Tamano | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| WaveCut/Edge0-ngram-table-FP8-NInfer-v3 | Tabla PLE n-gram compartida para las cuatro releases Edge0 | 48,28 GiB | `.ninfer` v3 | NInfer-all (master, desde `72d1d8e04`) | Edge0 Community 1.0 + Qwen Community 1.0 |
| WaveCut/Edge0-120B-q3k-NInfer-v3 | Conversión NInfer del modelo Edge0-120B-q3k | no disponible | `.ninfer` v3 | NInfer-all | Edge0 Community 1.0 + Qwen Community 1.0 |
| WaveCut/Edge0-120B-NVFP4-NInfer-v3 | Conversión NInfer del modelo Edge0-120B-NVFP4 | no disponible | `.ninfer` v3 | NInfer-all | Edge0 Community 1.0 + Qwen Community 1.0 |
| WaveCut/Edge0-145B-q3k-NInfer-v3 | Conversión NInfer del modelo Edge0-145B-q3k | no disponible | `.ninfer` v3 | NInfer-all | Edge0 Community 1.0 + Qwen Community 1.0 |
| WaveCut/Edge0-145B-NVFP4-NInfer-v3 | Conversión NInfer del modelo Edge0-145B-NVFP4 | no disponible | `.ninfer` v3 | NInfer-all | Edge0 Community 1.0 + Qwen Community 1.0 |

No se dispone de datos de benchmarks ni de parámetros de contexto de las releases para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un modelo Edge0 acompañante y el runtime NInfer-all correcto, el artefacto no produce ninguna funcionalidad de inferencia.
- Incompatibilidad de runtime: los builds estándar de NInfer no pueden leerlo; se requiere la rama `master` de `iamwavecut/ninfer-all` desde el commit `72d1d8e04`.
- Verificación estricta: NInfer rechaza cualquier tabla cuyas constantes hash, formato o SHA-256 de filas no coincidan con los que espera el modelo.
- Licencia: los componentes Edge0 están bajo Edge0 Community Model License 1.0; las ofertas comerciales de modelo requieren una licencia separada de Edge0 (Sección 4). Los materiales Qwen permanecen bajo Qwen Community License 1.0, que la licencia Edge0 no sustituye; ambas condiciones aplican.
- Los ficheros no implican endorsement por parte de Edge0 ni de Qwen.
- Sesgos, alucinación y limitaciones idiomáticas: no disponibles para este artefacto; corresponden al modelo Edge0 subyacente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Modelo base: https://huggingface.co/Edge0/Edge0-120B-q3k
- Conversión Edge0-145B-NVFP4: https://huggingface.co/WaveCut/Edge0-145B-NVFP4-NInfer-v3
- Conversión Edge0-145B-q3k: https://huggingface.co/WaveCut/Edge0-145B-q3k-NInfer-v3
- Conversión Edge0-120B-NVFP4: https://huggingface.co/WaveCut/Edge0-120B-NVFP4-NInfer-v3
- Conversión Edge0-120B-q3k: https://huggingface.co/WaveCut/Edge0-120B-q3k-NInfer-v3
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit de soporte: https://github.com/iamwavecut/ninfer-all/commit/72d1d8e0439974779201f8537a2915de0b52f155
- Conversor: https://github.com/iamwavecut/ninfer-all/blob/master/tools/convert/edge0.py
