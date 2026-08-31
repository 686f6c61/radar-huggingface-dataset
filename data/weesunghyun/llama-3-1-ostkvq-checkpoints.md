# weesunghyun/Llama-3.1-ostkvq-checkpoints

## Resumen

Este repositorio aloja los checkpoints de cuantización generados durante los experimentos **ostkvq** (rotación + cuantización de pesos, activaciones y clave-valor) del investigador weesunghyun. No es un modelo de lenguaje independiente, sino un archivo de artefactos de investigación: pesos derivados de varios modelos base populares (Llama 3.1 8B, Llama 2 7B/13B, Qwen 2.5 1.5B/7B/14B y Mistral 7B) sobre los que se aplicó una rotación de Hadamard y cuantización de baja precisión (por ejemplo, w4a4). El objetivo es preservar exactamente los pesos que produjeron los resultados reportados en el paper asociado, ya que la rotación se genera sin semilla fija y, por tanto, no es reproducible re-ejecutando el código. El repositorio tiene un tamaño de 104,4 GB y contiene un `MANIFEST.csv` que traza cada archivo con su modelo base, familia de licencia y la perplejidad WikiText-2 registrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (checkpoints de modelos base transformer: Llama 3.1, Llama 2, Qwen 2.5, Mistral) |
| Parametros totales | No disponible (depende del checkpoint; los modelos base van de 1,5B a 14B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada de cada modelo base, no documentada en el repo) |
| Tipos de cuantizacion | w4a4 (pesos y activaciones de 4 bits) y cuantización de KV; se mencionan otros métodos en `MANIFEST.csv` (columna `k_quant_method`) |
| Idiomas soportados | No disponible |
| Licencia | Mixta: Llama 3.1 Community License (592 archivos), Llama 2 Community License (74 archivos), Apache 2.0 (230 archivos para Qwen2.5 y Mistral) |
| Formato de pesos | safetensors (también hay `model.bin` en `runs/`) |

## Arquitectura y entrenamiento

Los checkpoints no constituyen una arquitectura nueva; son pesos de modelos transformer ya existentes (Llama 3.1 8B, Llama 3.1 8B-Instruct, Llama 2 7B/13B, Qwen 2.5 1.5B/7B/14B, Mistral 7B) a los que se ha aplicado una transformación de cuantización post-entrenamiento. El proceso consiste en una rotación de Hadamard (generada con `random_hadamard_matrix` sin semilla) seguida de cuantización de pesos, activaciones y caché de clave-valor. No hay entrenamiento adicional ni ajuste fino; se trata de una técnica de compresión para reducir el coste de inferencia. La ausencia de semilla fija en la rotación hace que cada ejecución produzca una matriz `Q` distinta y, por tanto, una perplejidad diferente; de ahí que los autores hayan archivado los pesos exactos para que los resultados del paper (por ejemplo, PPL 7.4794 en WikiText-2 para el checkpoint `llama31_8b_tq_id`) sean reproducibles.

## Capacidades

- No se documentan capacidades funcionales específicas en el repositorio (generación de texto, razonamiento, código, etc.).
- Los checkpoints heredan las capacidades de los modelos base correspondientes, pero no se garantiza su comportamiento tras la cuantización.
- El repositorio está orientado a investigación: permite analizar el impacto de la cuantización en la perplejidad y otras métricas.
- No hay soporte documentado de tool calling, agentes, visión o audio; es un artefacto de pesos, no un modelo de inferencia listo para usar.

## Casos de uso

- Reproducción de experimentos de cuantización: los checkpoints permiten verificar los resultados del paper sin necesidad de re-ejecutar el pipeline de rotación y cuantización, que no es determinista.
- Análisis de perplejidad: cada archivo del `MANIFEST.csv` incluye la PPL de WikiText-2 cuando el log la registró, lo que permite comparar el efecto de distintos métodos de cuantización de KV y bit-widths.
- Estudio de la variabilidad de la rotación de Hadamard: al no haber semilla, los investigadores pueden evaluar cómo cambia la PPL con distintas matrices `Q`.
- Desarrollo de técnicas de cuantización KV: los checkpoints de la carpeta `quarot_native` (versión `*_v7` canónica) sirven como referencia para implementaciones de QuaRot.
- Auditoría de licencias y trazabilidad: el `MANIFEST.csv` permite identificar qué pesos derivan de modelos con licencias restrictivas (Llama) frente a los Apache 2.0.
- Benchmarking de kernels de cuantización: los `state_dict` fusionados de `tier3/` (~16 GB cada uno) pueden usarse para probar kernels de inferencia cuantizada en hardware específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, salvo un dato puntual de perplejidad en WikiText-2:

| Checkpoint | PPL WikiText-2 |
|---|---|
| `llama31_8b_tq_id` (carpeta `tier3/`) | 7.4794 |

No hay comparativas con otros modelos ni métricas como MMLU, HumanEval o GSM8K. El repositorio no incluye tablas de rendimiento adicionales.

## Requisitos de hardware

- No se especifican requisitos de hardware en el repositorio.
- Los checkpoints completos de `tier3/` ocupan ~16 GB cada uno, por lo que se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090 o A10G) para cargar un `state_dict` en memoria, aunque no se proporciona código de inferencia.
- Los archivos sharded de `quarot_native/` son más pequeños y podrían cargarse en GPUs con menos memoria, pero no se indica el tamaño exacto por shard.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; estos checkpoints no están formateados para esos motores de inferencia.
- La latencia y el throughput no se han medido ni publicado.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de propósito general comparable con alternativas comerciales o de código abierto; es un conjunto de artefactos de investigación sobre cuantización. Los modelos base originales (Llama 3.1 8B, Qwen 2.5 7B, etc.) sí tienen comparativas conocidas, pero no se proporcionan aquí.

## Limitaciones y advertencias

- Los checkpoints no son reproducibles a partir del código: la rotación de Hadamard se genera sin semilla, por lo que solo estos pesos exactos producen los resultados reportados.
- No son modelos listos para producción: no incluyen tokenizadores, configuraciones de generación ni código de inferencia.
- Licencias mixtas: los archivos derivados de Llama 3.1 y Llama 2 están sujetos a las Community Licenses de Meta y a su Acceptable Use Policy; los derivados de Qwen2.5 y Mistral son Apache 2.0. Es obligatorio consultar `MANIFEST.csv` para cada archivo.
- No hay documentación sobre sesgos, alucinación o limitaciones idiomáticas; al ser pesos cuantizados, podrían degradar la calidad de generación respecto al modelo original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación de baja difusión.
- No se proporciona información sobre el número total de parámetros por checkpoint, ni sobre la composición de los datos de entrenamiento de los modelos base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/weesunghyun/Llama-3.1-ostkvq-checkpoints
- GitHub del autor: https://github.com/weesunghyun (incluye forks de SpinQuant, paper sobre cuantización con rotaciones aprendidas)
- Modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Página de Meta sobre Llama 3: https://developer.meta.com/ai/models/llama-3/
- Blog de Meta sobre Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Repositorio de inferencia de Llama: https://github.com/meta-llama/llama
