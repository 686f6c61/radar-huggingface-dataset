# veripazari/turkish-tax

## Resumen

`veripazari/turkish-tax` no es un modelo de lenguaje, sino un repositorio de código, resultados crudos y registros que respaldan el artículo "Turkish tax: the cost of serving Turkish in open-source LLMs" (en turco, "Türkçe vergisi"). El autor original es **speker** (Serkan Peker), y VeriPazarı lo ha archivado y traducido al turco para la comunidad de IA turca. El repositorio mide el coste computacional adicional de servir turco frente a inglés en LLMs de código abierto desplegados con vLLM y llama.cpp.

El contenido incluye campañas de benchmark de throughput, tasas de tokens y calidad FP8 en vLLM 0.33.0, además de matrices de importancia para cuantización GGUF con llama.cpp b12116, divergencia KL sobre Wikipedia y FLORES+, y puntuaciones Belebele. Los experimentos se ejecutaron en máquinas con 5, 6 y 8 GPU H200. El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los artefactos pesados no están alojados en el repo de Hugging Face.

Es relevante ahora porque cuantifica de forma reproducible una asimetría conocida pero poco documentada: el coste en tokens y latencia de atender idiomas de bajos recursos como el turco con modelos entrenados mayoritariamente en inglés. El material permite verificar todos los números del artículo sin GPU mediante scripts de validación incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de benchmarks, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye IQ, calibrado con matrices de importancia); FP8 en vLLM |
| Idiomas soportados | tr (turco), en (inglés, como referencia comparativa) |
| Licencia | MIT |
| Formato de pesos | no aplica (repo de código y resultados); los GGUF generados se producen con `run_model.sh` |

## Arquitectura y entrenamiento

No aplica: este repositorio no contiene pesos de modelo ni describe un proceso de entrenamiento. Es un artefacto de investigación reproducible que documenta la infraestructura de evaluación. La pila medida comprende vLLM 0.33.0 y llama.cpp b12116, ejecutados dentro de Docker (`Dockerfile.bench`) sobre clústeres de GPU H200.

Los modelos evaluados que se mencionan en la documentación son `ytu-ce-cosmos/Turkish-Gemma-9b-T1` (que reutiliza el tokenizer de Gemma 2, commit `9145841c83add11c48155cd7bb87d8656703f997`), `Trendyol-LLM-8B-T1` y `Kumru-2B` (para el que se incluye un parche de pre-tokenizador, `llama_kumru_patch.py`). La innovación metodológica destacable es la medición de divergencia KL a nivel de documento (`doc_kld.cpp`), la repetición de cuantizaciones IQ con tres núcleos de calibración distintos (`iq_seeds.sh`) y la evaluación Belebele directamente sobre archivos GGUF (`belebele_gguf.cpp`).

## Capacidades

- Medición de throughput (tokens/s) y tasas de tokens en turco e inglés con vLLM.
- Evaluación de calidad FP8 frente a BF16 mediante suma de log-probabilidades por token y por documento.
- Cuantización GGUF con llama.cpp usando matrices de importancia específicas por idioma.
- Cálculo de divergencia KL a nivel de documento con backend GPU y CPU.
- Puntuación de comprensión lectora multilingüe Belebele sobre GGUF.
- Verificación reproducible de resultados sin GPU (`verify_article.py`, `verify_serve.py`, `verify_kld.py`, `tp_latency.py`).
- Análisis de paralelismo tensorial: throughput, latencia y horas-GPU (`tp_latency.py`).
- Réplica de experimentos en una segunda máquina para control de variabilidad.

## Casos de uso

- **Planificación de capacidad para despliegues multilingües**: usar los datos de throughput de `results/serve-v3/` para estimar cuántas GPU H200 adicionales requiere servir turco frente a inglés con el mismo SLA, y dimensionar costes operativos antes de lanzar un producto.
- **Selección de cuantización para producción en turco**: comparar la divergencia KL y la perplejidad BF16 de los distintos GGUF (incluidas variantes IQ con tres semillas de calibración) para elegir el nivel de cuantización que mantiene calidad aceptable en turco sin sobredimensionar VRAM.
- **Validación de calidad FP8 en pipelines de inferencia**: reutilizar `fp8_quality.py compare|paired` para medir la degradación de FP8 frente a BF16 en un modelo propio antes de adoptarlo en producción con vLLM.
- **Auditoría de resultados publicados**: emplear `verify_article.py` para recalcular desde los JSON crudos los números de un artículo o informe interno, sin necesidad de GPU, como control de calidad editorial o de revisión por pares.
- **Benchmarking de tokenizers para idiomas de bajos recursos**: el parche `llama_kumru_patch.py` y los scripts de pre-tokenización sirven de plantilla para medir la fertilidad de tokens (tokens por palabra) de otros idiomas y cuantificar su "impuesto" de servicio.
- **Reproducción de experimentos en clúster**: los scripts `night_quiet_v3.sh`, `gptoss_warm_v3.sh`, `tp_high_v3.sh` y `tp1024_v3.sh`, junto con el sistema de reserva de GPU vía `~/bin/lease`, sirven como esqueleto para campañas de benchmark reproducibles en máquinas multi-GPU compartidas.
- **Evaluación de comprensión lectora en turco**: usar `belebele_gguf.cpp` para puntuar modelos cuantizados sobre Belebele y detectar regresiones de calidad idiomática introducidas por la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodología y las rutas de los archivos de resultados (`results/serve-v3/`, `results/takip-2026-11-17/`, `results/belebele-gguf/`, `results/belge-kld/`), pero no incluye cifras concretas de throughput, latencia, KL ni Belebele. Los números del artículo están en el blog enlazado y en el dataset `serkanpeker/turkish-tax`, no en esta ficha.

## Requisitos de hardware

- La campaña principal se ejecutó en una máquina con 6 GPU H200; la campaña de seguimiento usó la misma máquina (con 8 H200 en ese momento) y una segunda máquina con 5 H200.
- No se especifican requisitos de VRAM para un modelo concreto, ya que el repositorio abarca varios modelos (Turkish-Gemma-9b-T1, Trendyol-LLM-8B-T1, Kumru-2B) y configuraciones de paralelismo tensorial distintas.
- Para la verificación de resultados no se requiere GPU: los scripts `verify_article.py`, `verify_serve.py` y `verify_kld.py` se ejecutan con `uv run python` sobre CPU.
- Opciones de despliegue cubiertas por los benchmarks: vLLM 0.33.0 (FP8, prefix caching) y llama.cpp b12116 (GGUF, cuantización IQ).
- Latencia y throughput: no disponibles en la información proporcionada; se remite a los JSON de `results/serve-v3/` y a `tp_latency.py`.

## Comparativa con modelos similares

No disponible. No existen repositorios comparables identificados en la información proporcionada; este artefacto es un estudio de medición, no un modelo, por lo que la comparación por parámetros, contexto o licencia no aplica.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no contiene pesos ni pipeline declarado. Cualquier intento de cargarlo como modelo fallará.
- El repositorio pesa 0.0 GB; los artefactos pesados (GGUF, logs completos) probablemente no están alojados aquí y deben regenerarse o descargarse de las fuentes originales.
- Los resultados están ligados a un hardware concreto (H200), versiones concretas (vLLM 0.33.0, llama.cpp b12116) y a los modelos evaluados; no son extrapolables sin réplica.
- Los scripts asumen rutas fijas (`~/work/tr-serve`, `~/work/tr-quant`) y un sistema de reserva de GPU local (`~/bin/lease`) que debe eliminarse o sustituirse por el planificador propio.
- La documentación y parte de los nombres de archivo están en turco, lo que puede dificultar su mantenimiento por equipos no turcoparlantes.
- La model card advierte de que la perplejidad base en `kld.csv` para Turkish-Gemma-9b-T1 está sesgada a la baja; para comparaciones correctas debe usarse `ppl_bf16_*.log`.
- Las secuencias de log-probabilidades por token no se publican porque los IDs de token codifican el texto de FLORES+, lo que limita la reproducibilidad completa a nivel de token.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre la exactitud de los resultados publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/turkish-tax
- Fuente original en GitHub: https://github.com/speker/turkish-tax
- Artículo en inglés: https://huggingface.co/blog/serkanpeker/turkish-tax
- Artículo en turco: https://huggingface.co/blog/serkanpeker/turkce-vergisi
- Dataset con las cifras medidas: https://huggingface.co/datasets/serkanpeker/turkish-tax
- Plataforma que archiva el repo: https://veripazari.com.tr
