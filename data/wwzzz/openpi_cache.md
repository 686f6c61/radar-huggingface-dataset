# WWZzz/openpi_cache

## Resumen

WWZzz/openpi_cache es un repositorio espejo alojado en Hugging Face que replica el contenido del directorio de caché de OpenPI (`~/.cache/openpi`) utilizado por el proyecto VLAStudio. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia de checkpoints y artefactos auxiliares que OpenPI distribuye originalmente a través de Google Cloud Storage (`gs://openpi-assets`, `gs://big_vision`), un origen inaccesible desde muchas redes corporativas o geográficas.

El repositorio contiene checkpoints base de las familias pi0 y pi0.5, tanto en formato JAX (fuente para fine-tuning) como en formato PyTorch (con `model.safetensors` y `config.json`), además del tokenizer sentencepiece de PaliGemma. Su relevancia es operativa: permite restaurar el layout de datos de OpenPI desde Hugging Face en lugar de depender de GCS, habilitando el arranque automático de la política OpenPI integrada en VLAStudio cuando la ruta de caché configurada no existe.

Con un tamaño de repositorio de 38,7 GB y sin descargas ni likes registrados en el momento de la consulta, se trata de un artefacto de infraestructura más que de un modelo publicable de forma autónoma: la model card no documenta parámetros, contexto, entrenamiento ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene checkpoints de pi0_base, pi0_base_torch, pi05_base y pi05_base_torch; la model card no describe la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y checkpoints JAX sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors + config.json (variantes PyTorch), checkpoints JAX nativos (variantes base), sentencepiece (`paligemma_tokenizer.model`) |
| Tamano del repositorio | 38,7 GB |
| Tags declarados | safetensors, region:us |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset ni el procedimiento de entrenamiento (RLHF, DPO u otros) de los checkpoints alojados. El repositorio se limita a espejar el layout de datos predeterminado de OpenPI, organizado en cuatro directorios de checkpoints y un tokenizer.

La estructura concreta es la siguiente: `openpi-assets/checkpoints/pi0_base/` (base JAX pi0, fuente para fine-tuning), `openpi-assets/checkpoints/pi0_base_torch/` (base pi0 en PyTorch con `model.safetensors` y `config.json`), `openpi-assets/checkpoints/pi05_base/` (base JAX pi0.5, fuente para fine-tuning), `openpi-assets/checkpoints/pi05_base_torch/` (base pi0.5 en PyTorch) y `big_vision/paligemma_tokenizer.model`. Los checkpoints JAX incorporan ademas estadisticas de normalizacion en `assets/<robot>/norm_stats.json`. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- El repositorio no documenta capacidades funcionales del modelo: es un espejo de artefactos de checkpoints.
- Contiene checkpoints base de las familias pi0 y pi0.5 en dos formatos, JAX y PyTorch, orientados a servir como fuente de fine-tuning y de inferencia dentro de VLAStudio.
- Incluye estadisticas de normalizacion por robot (`norm_stats.json`), necesarias para el preprocesado de observaciones en politicas de robot.
- Incluye el tokenizer sentencepiece de PaliGemma, requerido para el procesado de texto de entrada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Restauracion del cache de OpenPI en redes sin acceso a GCS: descargar el repositorio y colocarlo en `~/.cache/openpi` permite disponer de los checkpoints de pi0 y pi0.5 alli donde `gs://openpi-assets` y `gs://big_vision` no son alcanzables.
- Despliegue de VLAStudio con auto-descarga: la politica OpenPI de VLAStudio consulta este espejo (`WWZzz/openpi_cache`) cuando la ruta de cache configurada no existe al arrancar, segun `src/vlastudio/policy/openpi/cache_utils.py`.
- Restauracion manual reproducible: el comando `hf download WWZzz/openpi_cache --local-dir ~/.cache/openpi` reconstruye el layout completo sin depender del cliente de GCS.
- Fine-tuning de politicas a partir de los checkpoints base: las variantes `pi0_base` y `pi05_base` en JAX se ofrecen explicitamente como fuente para ajuste fino sobre datos propios.
- Inferencia con pesos PyTorch: las variantes `*_torch` con `model.safetensors` y `config.json` permiten cargar los checkpoints en stacks basados en PyTorch.
- Archivado y espejo interno: equipos que necesitan una copia inmutable de los checkpoints de OpenPI pueden usar este repositorio como origen alternativo para sus propios espejos.
- Integracion en pipelines con variables de control: el comportamiento de auto-descarga puede ajustarse con `VLASTUDIO_OPENPI_CACHE_REPO` (para apuntar a otro repositorio) o desactivarse con `VLASTUDIO_OPENPI_AUTO_DOWNLOAD=0`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 38,7 GB en disco, por lo que requiere al menos ese espacio libre para una descarga completa.
- VRAM estimada para inferencia: no disponible (no se documentan parametros ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el unico flujo documentado es su uso como cache de VLAStudio mediante la politica OpenPI; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no describe un modelo comparable ni ofrece datos de parametros, contexto o rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar las condiciones de uso comercial de los checkpoints que contiene. Cualquier uso en produccion deberia verificar antes las licencias de OpenPI y de los artefactos originales en GCS.
- No es un modelo entrenado ni publicado de forma autonoma: es un espejo de artefactos de terceros, por lo que su vigencia depende de la del proyecto OpenPI.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma.
- No se especifican parametros, contexto ni requisitos de hardware, lo que dificulta planificar un despliegue sin consultar la documentacion de OpenPI.
- La model card advierte de que `hf download` omite ficheros de metadatos `.lock`, que son bloqueos transitorios de descarga de GCS; su ausencia es esperada y no implica corrupcion de los checkpoints.
- No se ofrecen sumas de verificacion ni hashes de los ficheros, de modo que la integridad de la copia no es verificable desde el propio repositorio.
- El repositorio registra cero descargas y cero likes, por lo que no existe evidencia de uso ni de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WWZzz/openpi_cache
- VLAStudio (proyecto consumidor): https://github.com/WwZzz/VLAStudio
- Ruta de codigo de auto-descarga: `src/vlastudio/policy/openpi/cache_utils.py` dentro del repositorio de VLAStudio
- Origenes upstream citados en la model card: `gs://openpi-assets` y `gs://big_vision` (no enlazables via HTTP)
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada
- Los resultados de busqueda web facilitados corresponden a conversores de divisas EUR/USD y no guardan relacion con el modelo.
