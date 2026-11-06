# Yousofkhan/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-BF16

## Resumen

NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA Corporation, publicado como pesos abiertos bajo la licencia OpenMDW-1.1. Se trata del modelo "Ultra" de la familia Nemotron 3, entrenado entre diciembre de 2025 y abril de 2026, y representa la variante de mayor capacidad de dicha familia, orientada a cargas de trabajo de agentes especializados y generación de texto de alta calidad. Emplea una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) con capas intercaladas de Mamba-2, capas MoE y capas de atención selectivas, además de capas de Multi-Token Prediction (MTP).

El modelo cuenta con 560.524.578.816 parámetros totales según los pesos en safetensors (aproximadamente 550B según la nomenclatura comercial) y 55B parámetros activos por token, lo que lo sitúa en la categoría de modelos MoE de gran escala con un coste de inferencia muy inferior al de un modelo denso equivalente. Incorpora una receta de preentrenamiento en NVFP4 para maximizar la eficiencia de cómputo y declara soporte para doce idiomas, entre ellos el español.

Su relevancia actual radica en la combinación de contexto largo (con resultados publicados en RULER hasta 1M de tokens), arquitectura híbrida Mamba-2/MoE, decodificación acelerada mediante MTP y una licencia permisiva para uso comercial. El repositorio de Hugging Face analizado es un espejo publicado por el usuario Yousofkhan con pesos en BF16 y un tamaño de repositorio de 1121,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con LatentMoE: capas Mamba-2 intercaladas, capas MoE y capas de atención selectivas; incluye capas Multi-Token Prediction (MTP) |
| Parametros totales | 560.524.578.816 (aproximadamente 550B) |
| Parametros activos | 55B |
| Longitud de contexto | No disponible de forma explícita en la model card; los benchmarks RULER publicados llegan hasta 1M de tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos BF16; el preentrenamiento se realizó con receta NVFP4) |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, portugués (brasileño), japonés, coreano, hindi, árabe, chino y hebreo |
| Licencia | OpenMDW-1.1 (Open Model Development and Weights License) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido denominado LatentMoE, que combina capas de espacio de estados Mamba-2 con capas de mezcla de expertos y un subconjunto de capas de atención clásica. Esta disposición busca reducir el coste computacional y de memoria en contextos largos frente a un transformer denso puro, manteniendo capacidad de modelado. El modelo activa 55B parámetros por token sobre un total de aproximadamente 550B, lo que permite un throughput elevado en inferencia. La variante Ultra incorpora además capas de Multi-Token Prediction (MTP), que permiten predecir varios tokens por paso y acelerar la generación, así como mejorar la calidad del modelo.

El preentrenamiento se realizó con una receta en NVFP4 (formato de precisión de 4 bits de NVIDIA) para maximizar la eficiencia de cómputo, y los datos de preentrenamiento tienen fecha de corte en septiembre de 2025. NVIDIA publica conjuntamente los datasets de preentrenamiento de la familia Nemotron. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esta variante es un modelo "Base", por lo que no se anuncia alineación por preferencias. Tampoco se especifican innovaciones adicionales como decodificación especulativa más allá del uso de MTP.

## Capacidades

- Generación de texto en doce idiomas, con especial énfasis en inglés, francés, español, italiano, alemán, portugués, japonés, coreano, hindi, árabe, chino y hebreo.
- Razonamiento de conocimiento general y multilingüe, con resultados destacados en MMLU, MMLU-Pro, AGIEval-En y MMLU Global Lite.
- Razonamiento matemático, con resultados en GSM8K y MATH.
- Generación de código, con resultados en HumanEval y MBPP-Sanitized.
- Comprensión de sentido común y lectura comprensiva (ARC-Challenge, HellaSwag, OpenBookQA, PIQA, WinoGrande, RACE).
- Manejo de contextos largos, con evaluación RULER hasta 1M de tokens.
- Predicción multi-token (MTP) para acelerar la generación.
- Al ser un modelo Base, no se documenta soporte nativo de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito (thinking mode); estas capacidades requerirían ajuste posterior o variantes instruct.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Generación de código en producción: el modelo obtiene 83,84 en HumanEval y 85,97 en MBPP-Sanitized, por lo que es adecuado como base para asistentes de programación o para ajuste fino supervisado en dominios específicos de software.
- Análisis de documentación extensa: con resultados RULER de 95,30 a 64K, 92,49 a 128K y 84,54 a 512K, puede emplearse para resumir, extraer y responder preguntas sobre contratos, informes técnicos o expedientes de cientos de miles de tokens en una sola pasada.
- Razonamiento matemático y analítico: sus resultados en MATH (82,00) y GSM8K (88,10) lo hacen útil como base para tutores automáticos, verificación de cálculos y generación de problemas resueltos.
- Atención al cliente multilingüe: al cubrir doce idiomas y obtener 90,13 en MMLU Global Lite y 87,73 en MGSM, puede servir como base para asistentes conversacionales en mercados con varios idiomas, previo ajuste instructivo.
- Procesamiento de conocimiento corporativo: con 89,08 en MMLU y 79,07 en MMLU-Pro, es una base razonable para sistemas RAG que requieran razonamiento sobre documentación interna.
- Investigación y evaluación de arquitecturas híbridas: al combinar Mamba-2, MoE y atención, es un candidato para estudiar eficiencia de contexto largo y decodificación con MTP en entornos de investigación.
- Generación de contenido multilingüe y localización: puede emplearse como base para traducción, adaptación de contenido y generación de textos en los idiomas soportados, con ajuste posterior para calidad de estilo.

## Benchmarks y rendimiento

Resultados publicados en la model card (modelo Base, comparado con DeepSeek-V3.2-Exp-Base, Mistral-Large-3-675B-Base-2512, Kimi-K2-Base y GLM-4.5-Base):

| Tarea | Metrica | Nemotron-3-Ultra 550B-A55B-Base | DeepSeek-V3.2 Exp-Base | Mistral-Large-3 675B-Base-2512 | Kimi-K2 Base | GLM-4.5 Base |
|---|---|---|---|---|---|---|
| MMLU | 5-shot, acc | 89,08 | 87,82 | 87,35 | 87,60 | 86,50 |
| MMLU-Pro | 5-shot, CoT EM | 79,07 | 63,26 | 67,42 | 69,15 | 65,78 |
| AGIEval-En | 3/5-shot, CoT EM | 78,73 | 70,13 | 69,30 | 72,55 | 70,06 |
| GPQA | 5-shot, CoT EM | 50,00 | 31,82 | 34,85 | 43,43 | 34,85 |
| GSM8K | 8-shot, CoT EM | 88,10 | 84,38 | 91,21 | 91,05 | 85,37 |
| MATH | 4-shot, EM | 82,00 | 60,12 | 62,88 | 68,40 | 57,58 |
| HumanEval | sampled pass@1 n=32 | 83,84 | 61,85 | 66,71 | 78,20 | 78,16 |
| MBPP-Sanitized | 3-shot pass@1 n=32 | 85,97 | 58,66 | 84,08 | 72,14 | 76,69 |
| ARC-Challenge | 25-shot, acc_norm | 97,35 | 95,22 | 97,27 | 95,82 | 96,59 |
| HellaSwag | 10-shot, acc_norm | 90,51 | 89,44 | 88,88 | 90,92 | 90,17 |
| OpenBookQA | 0-shot, acc_norm | 48,60 | 48,20 | 51,40 | 50,80 | 49,60 |
| PIQA | 0-shot, acc_norm | 83,79 | 85,09 | 84,82 | 85,47 | 85,09 |
| WinoGrande | 5-shot, acc | 79,32 | 83,43 | 82,08 | 84,21 | 85,24 |
| RACE | 0-shot, acc | 92,15 | 93,21 | 93,30 | 91,96 | 92,15 |
| MMLU Global Lite | 5-shot, avg | 90,13 | 85,59 | 87,34 | 85,63 | 85,81 |
| MGSM | 8-shot, native CoT avg | 87,73 | 82,33 | 82,93 | 85,20 | 81,27 |
| RULER 64K | 0-shot | 95,30 | 93,30 | 90,11 | 93,79 | 16,12 |
| RULER 128K | 0-shot | 92,49 | 91,88 | 55,77 | 88,61 | 0,00 |
| RULER 256K | 0-shot | 86,22 | -- | 35,50 | -- | -- |
| RULER 512K | 0-shot | 84,54 | -- | -- | -- | -- |
| RULER 1M | 0-shot | 76,83 | -- | -- | -- | -- |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 1,1 TB (el repositorio completo tiene 1121,1 GB), por lo que la inferencia en BF16 requiere un nodo multi-GPU con al menos 8 GPU de 141 GB (H200) o 16 GPU de 80 GB (A100/H100) para cargar los pesos, más espacio para KV cache y activaciones.
- GPU recomendadas: H100, H200 y B200 para despliegues en BF16 o NVFP4; A100 de 80 GB en configuraciones multi-nodo. No se recomienda su ejecución en GPU de consumo.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 con 24 GB, RTX 5090 con 32 GB) en BF16. Sería necesaria cuantización agresiva (por ejemplo, 4 bits) y, aun así, el tamaño de 550B excede la memoria de una única GPU consumer; requeriría offloading a RAM/CPU o múltiples GPU.
- Opciones de despliegue: transformers (librería declarada en el repositorio), además de frameworks habituales para modelos MoE de gran escala como vLLM o TGI; no se confirma en la información disponible el soporte específico de llama.cpp u Ollama para esta arquitectura híbrida Mamba-2/MoE.
- Latencia y throughput: no disponibles en la información proporcionada. La activación de 55B parámetros por token y las capas MTP están orientadas a reducir latencia y aumentar throughput, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Ultra-550B-A55B-Base | 560,5B | 55B | No disponible explícito; RULER hasta 1M | OpenMDW-1.1 | Pesos abiertos en Hugging Face |
| DeepSeek-V3.2-Exp-Base | No disponible | No disponible | No disponible | No disponible | Pesos abiertos en Hugging Face |
| Mistral-Large-3-675B-Base-2512 | 675B (según nombre) | No disponible | No disponible | No disponible | Pesos abiertos en Hugging Face |
| Kimi-K2-Base | No disponible | No disponible | No disponible | No disponible | Pesos abiertos en Hugging Face |
| GLM-4.5-Base | No disponible | No disponible | No disponible | No disponible | Pesos abiertos en Hugging Face |

En rendimiento, Nemotron-3-Ultra lidera en MMLU, MMLU-Pro, AGIEval-En, GPQA, MATH, HumanEval, MBPP-Sanitized, MMLU Global Lite, MGSM y todas las evaluaciones RULER publicadas, mientras que Mistral-Large-3 y Kimi-K2 superan en GSM8K y algunos tests de sentido común (WinoGrande, PIQA, OpenBookQA, RACE). Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo Base, no está alineado por preferencias; puede generar contenido inapropiado, sesgado o no seguir instrucciones sin un ajuste instructivo posterior.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; los resultados de benchmarks no garantizan veracidad factual en producción.
- Sesgos conocidos: no se documentan en la model card; los sesgos de los datos de preentrenamiento (corte en septiembre de 2025) pueden reflejarse en las salidas.
- Limitaciones de idioma: aunque se declaran doce idiomas, el rendimiento puede variar entre ellos; no se publican métricas desagregadas por idioma más allá de MMLU Global Lite y MGSM.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto en la model card; los resultados RULER llegan a 1M, pero el rendimiento decae con la longitud (de 95,30 a 64K hasta 76,83 a 1M).
- Restricciones de licencia: OpenMDW-1.1 permite uso comercial y no comercial según la model card, pero deben revisarse los términos completos del acuerdo antes de desplegar en producción.
- Requisitos de hardware muy elevados: 1,1 TB de pesos en BF16 dificultan el despliegue y exigen infraestructura multi-GPU de centro de datos.
- El repositorio analizado es un espejo de un tercero (Yousofkhan) con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial de NVIDIA.
- No se documentan capacidades de tool calling, agentes o modo de razonamiento explícito; no deben asumirse en producción sin validación.

## Enlaces

- Repositorio Hugging Face analizado: https://huggingface.co/Yousofkhan/NVIDIA-Nemotron-3-Ultra-550B-A55B-Base-BF16
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- DeepSeek-V3.2-Exp-Base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp-Base
- Mistral-Large-3-675B-Base-2512: https://huggingface.co/mistralai/Mistral-Large-3-675B-Base-2512
- Kimi-K2-Base: https://huggingface.co/moonshotai/Kimi-K2-Base
- GLM-4.5-Base: https://huggingface.co/zai-org/GLM-4.5-Base
- Nemo Evaluator SDK: https://github.com/
