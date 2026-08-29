# yuhengtu-bytedance/sfm_baseline_filtered-9k_10k_11k_merge

## Resumen

El modelo `sfm_baseline_filtered-9k_10k_11k_merge` es un modelo de lenguaje de 6.856 millones de parámetros (aproximadamente 6,8B) desarrollado por el equipo de ByteDance Seed, publicado bajo el perfil `yuhengtu-bytedance` en Hugging Face. Se trata de un experimento de fusión de modelos (model merging) aplicado durante la fase de pre-entrenamiento: combina tres checkpoints intermedios de un mismo modelo base (pasos globales 9000, 10000 y 11000) mediante el método Linear implementado en mergekit, tomando como base el checkpoint del paso 11000.

Este modelo es relevante porque explora una técnica emergente para mejorar el rendimiento de los LLM sin necesidad de entrenamiento adicional, fusionando pesos de diferentes etapas de pre-entrenamiento. El equipo de ByteDance Seed ha publicado un paper académico sobre esta metodología, lo que sitúa este modelo como parte de una investigación más amplia sobre el merging en pre-entrenamiento. Al ser un modelo de tamaño medio (6,8B) y con arquitectura GPT-NeoX, puede ejecutarse en GPUs de consumo con cuantización, aunque su naturaleza experimental y la ausencia de documentación detallada limitan su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder) |
| Parametros totales | 6.856.253.440 (6,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se construye mediante la fusión lineal de tres checkpoints de pre-entrenamiento de un mismo modelo base, todos ellos con la misma arquitectura GPT-NeoX. El método Linear (descrito en el paper arxiv:2203.05482) calcula los pesos finales como una combinación ponderada de los pesos de los modelos fuente, con normalización previa. En este caso, los tres checkpoints (pasos 9000, 10000 y 11000) reciben un peso de 1.0 cada uno, y el checkpoint del paso 11000 actúa como base. La fusión se realiza en precisión float32 y los pesos resultantes se guardan en bfloat16.

No se dispone de información sobre el dataset de pre-entrenamiento, el número total de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo es un producto intermedio de una investigación sobre merging en pre-entrenamiento, no un modelo final afinado para tareas específicas.

## Capacidades

- Generacion de texto: al ser un modelo de lenguaje pre-entrenado, puede generar texto coherente en el idioma en que fue entrenado, aunque no se especifican los idiomas soportados.
- Razonamiento basico: como cualquier LLM de 6,8B, puede realizar tareas simples de razonamiento, pero no hay datos que confirmen capacidades avanzadas.
- No se ha documentado soporte para tool calling, function calling, agentes, vision, audio ni modos de pensamiento extendido.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion academica sobre model merging: este modelo sirve como punto de comparacion para estudiar el efecto de fusionar checkpoints de pre-entrenamiento en diferentes etapas. Los investigadores pueden reproducir los experimentos del paper de ByteDance Seed y analizar la calidad del modelo resultante frente a los checkpoints individuales.
- Evaluacion de tecnicas de fusion de pesos: al ser un merge lineal simple, es util para validar implementaciones de mergekit o probar variaciones del metodo (por ejemplo, cambiar los pesos o el orden de los checkpoints).
- Pruebas de concepto en entornos de investigacion: se puede utilizar como modelo base para experimentos de fine-tuning o para medir la degradacion o mejora de rendimiento tras la fusion, siempre que se tenga acceso a los checkpoints originales.
- Benchmarking de infraestructura: dado su tamano moderado (6,8B), puede emplearse para probar pipelines de inferencia con vLLM, TGI o llama.cpp, midiendo latencia y throughput en diferentes GPUs.
- Estudio de la evolucion del pre-entrenamiento: al comparar este modelo con los checkpoints individuales, se puede observar como la fusion afecta a la coherencia interna y a la capacidad de generalizacion.
- Desarrollo de herramientas de analisis de modelos: util para probar metricas de similitud de pesos, distancia entre checkpoints o tecnicas de interpolacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 13,7 GB (segun el tamano del repositorio). Con overhead de activaciones y memoria del runtime, se recomienda al menos 16 GB de VRAM para inferencia en precision nativa.
- Con cuantizacion a 8 bits (int8) se podria reducir a unos 7-8 GB, y a 4 bits (int4) a unos 4-5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para precision nativa, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas. Con cuantizacion, una RTX 3080/3090 (10-24 GB) o incluso una RTX 4060 Ti (16 GB) podrian ser suficientes.
- Opciones de despliegue: al ser un modelo compatible con transformers y safetensors, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (mediante conversion).
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 6,8B en una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, por tamano y arquitectura, se puede situar junto a otros modelos de ~7B:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_baseline_filtered-9k_10k_11k_merge | 6,8B | no disponible | no disponible | Hugging Face |
| Mistral 7B | 7,3B | 32k | Apache 2.0 | Hugging Face |
| Llama 2 7B | 6,7B | 4k | Llama 2 license | Hugging Face |
| Gemma 7B | 8,5B | 8k | Gemma license | Hugging Face |

La comparacion es solo estructural; no hay benchmarks que permitan evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Modelo experimental: es un merge de checkpoints intermedios, no un modelo final afinado. Puede presentar incoherencias, repeticiones o degradacion en tareas complejas.
- Sin documentacion de entrenamiento: se desconoce el dataset, el idioma principal y el proceso de pre-entrenamiento, lo que dificulta predecir su comportamiento en dominios especificos.
- Licencia no especificada: no se indica la licencia de uso, por lo que no se puede garantizar su uso comercial o la redistribucion de derivados.
- Sin benchmarks publicados: no hay evidencia de su calidad en tareas estandar, por lo que no es recomendable para aplicaciones criticas sin una evaluacion previa.
- Contexto limitado desconocido: al no conocerse la longitud de contexto, no se puede asegurar un rendimiento adecuado en tareas de ventana larga.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en ausencia de datos de entrenamiento verificables.
- Sin soporte de herramientas: no se ha documentado tool calling ni integracion con agentes, lo que limita su uso en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-9k_10k_11k_merge
- Paper sobre model merging en pre-entrenamiento (ByteDance Seed): https://seed.bytedance.com/en/public_papers/model-merging-in-pre-training-of-large-language-models
- Pagina del equipo ByteDance Seed: https://seed.bytedance.com/en/
- Modelo similar (sfm-baseline-filtered-4k-5k-6k-avg): https://huggingface.co/yuhengtu-bytedance/sfm-baseline-filtered-4k-5k-6k-avg
