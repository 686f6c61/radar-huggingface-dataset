# Yannnnnnnn/MemVLN

## Resumen

MemVLN es un checkpoint de investigación para navegación guiada por lenguaje (Vision-Language Navigation, VLN) en entornos continuos 3D. Lo desarrollan Yan Wang, Jiangyong Huang, Siyuan Huang y Baoxiong Jia, y se publica junto al artículo arXiv:2610.35066 y al repositorio de código MemVLN v0.1.0. El modelo aborda el problema de la memoria episódica en navegación: un agente que recibe instrucciones en lenguaje natural y debe recorrer escenas reales manteniendo información de observaciones pasadas sin explotar el coste de contexto.

La propuesta central es FRME (consolidación de memoria episódica en streaming), que comprime las observaciones recientes en un conjunto acotado de tokens de memoria recuperables. El checkpoint no es un modelo autónomo: es un adaptador parcial (LoRA más tensores de memoria y de fusión geométrica) que debe combinarse con los pesos base Qwen3-VL-4B-Instruct y StreamVGGT. El repositorio ocupa 2,6 GB y contiene 571 tensores.

Es relevante porque demuestra que un VLM de 4 mil millones de parámetros, con un módulo de geometría 3D adicional y una memoria episódica ligera, puede alcanzar resultados competitivos en R2R VLN-CE y RxR VLN-CE sin reentrenar el modelo base completo. Está pensado para investigadores en robótica y navegación, no para despliegue directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (Qwen3-VL-4B-Instruct) + módulo de geometría 3D StreamVGGT + memoria episódica FRME; adaptación mediante LoRA |
| Parametros totales | no disponible (el checkpoint contiene 571 tensores: 504 LoRA, 56 de memoria, 10 de fusión geométrica y la matriz de embeddings del LM) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la configuración de evaluación usa 16 observaciones más cercanas, 100 frames y 100 tokens por frame, y 300 tokens de memoria recuperada) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en FP32 y BF16; la evaluación usa BF16 para los parámetros de memoria) |
| Idiomas soportados | no disponible (las instrucciones de RxR evaluadas son en inglés) |
| Licencia | component-specific-terms (otros términos; el MIT del código fuente no cubre los pesos ni los datos de entrenamiento) |
| Formato de pesos | safetensors (`memvln.safetensors`, 2.628.823.872 bytes) |

## Arquitectura y entrenamiento

MemVLN combina tres piezas. La primera es Qwen3-VL-4B-Instruct como modelo de lenguaje y visión, adaptado con 504 tensores LoRA. La segunda es StreamVGGT, un modelo de geometría 3D que aporta representaciones espaciales de la secuencia de observaciones; el checkpoint incluye 10 tensores de "geometry-merger" para integrar esa información. La tercera es el mecanismo FRME de memoria episódica en streaming, implementado con 56 tensores de memoria que consolidan observaciones pasadas y permiten recuperar un conjunto acotado de tokens (300 en la configuración de evaluación).

El entrenamiento se realiza sobre los datasets R2R y RxR en su variante VLN-CE (navegación continua), con escenas de Matterport3D. La configuración de evaluación publicada fija semilla 42, ocho shards, FlashAttention 2, las 16 observaciones más cercanas, FRME con 100 frames y 100 tokens por frame, caché de memoria fundamentada y `fast_habitat=false`. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

La innovación técnica principal es la consolidación de memoria episódica: en lugar de mantener todo el historial visual en el contexto del VLM, FRME lo comprime en un estado de memoria recuperable, lo que permite secuencias largas de navegación con un coste de contexto controlado. El checkpoint es parcial y usa el esquema de nombres propio de MemVLN, por lo que no es cargable con `from_pretrained` de Transformers o PEFT.

## Capacidades

- Navegación visual y lingüística en entornos 3D continuos a partir de instrucciones en lenguaje natural.
- Memoria episódica en streaming: consolidación y recuperación de observaciones pasadas mediante FRME.
- Percepción geométrica 3D de la secuencia visual gracias a StreamVGGT.
- Razonamiento viso-lingüístico heredado de Qwen3-VL-4B-Instruct (comprensión de imagen y texto).
- Ejecución de episodios de navegación con métricas estándar de VLN (NE, SR, SPL, nDTW).
- Soporte de evaluación multi-GPU con reparto en shards y fusión de resultados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos, audio ni modo thinking explícito.

## Casos de uso

- Investigación en navegación VLN: reproducción de los resultados de R2R VLN-CE y RxR VLN-CE con la configuración de evaluación publicada, útil para comparar nuevas técnicas de memoria episódica contra una línea base reproducible.
- Navegación de larga duración en interiores simulados: el agente puede recorrer episodios extensos en Matterport3D manteniendo memoria comprimida de lo observado, lo que reduce el coste de contexto frente a guardar todo el historial visual.
- Desarrollo de agentes robóticos con instrucciones en lenguaje natural: el módulo de geometría 3D y la memoria episódica permiten integrar percepción espacial y seguimiento de instrucciones en un pipeline de robótica móvil, siempre que se adapte a la plataforma física.
- Estudio de compresión de memoria en VLMs: FRME sirve como referencia para experimentar con consolidación de observaciones y recuperación selectiva de tokens en tareas de percepción secuencial.
- Evaluación comparativa de backbones viso-lingüísticos: al estar construido sobre Qwen3-VL-4B-Instruct, permite medir cómo afecta el tamaño del VLM a la navegación cuando se mantiene fija la memoria episódica.
- Generación de datos y análisis de trayectorias: el checkpoint y el dataset MemVLN-data permiten analizar errores de navegación (desviaciones, fallos de recuperación de memoria) en entornos controlados.

## Benchmarks y rendimiento

Resultados reportados en el artículo para el checkpoint publicado:

| Dataset | Split | NE (m) | SR (%) | SPL (%) | nDTW (%) |
|---|---|---:|---:|---:|---:|
| R2R VLN-CE | Val-Unseen | 5,19 | 55,0 | 50,5 | — |
| RxR VLN-CE | Val-Unseen, guía en inglés | 5,59 | 55,4 | 48,4 | 64,6 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla, ni métricas de MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- El checkpoint por sí solo ocupa 2,6 GB, pero requiere además los pesos de Qwen3-VL-4B-Instruct y de StreamVGGT para funcionar.
- La configuración de evaluación publicada está pensada para 8 GPUs (`--gpus 8`), con BF16 y FlashAttention 2.
- VRAM estimada: no disponible de forma oficial; por el tamaño del VLM base (4B) y del módulo 3D, se requiere al menos una GPU de 24 GB para inferencia en BF16, y más para evaluación multi-shard.
- GPU recomendadas: no disponible en la documentación; por el uso de FlashAttention 2 y BF16, se esperan A100, H100 o RTX 4090 en adelante.
- No cabe en GPUs de consumo de gama baja; en una RTX 4090 de 24 GB podría intentarse en BF16, pero no está verificado en la información disponible.
- Opciones de despliegue: el repositorio oficial MemVLN con Habitat y scripts de evaluación (`split_eval/launch_eval_split.sh`, `split_eval/merge_results.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemVLN | 4B (base) + adaptadores | no disponible | VLN-CE con memoria episódica | component-specific-terms | HuggingFace + GitHub |
| Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | VLM generalista | según Qwen | HuggingFace |
| StreamVGGT | no disponible | no disponible | Geometría 3D en streaming | según autor | HuggingFace |

No se dispone de datos de benchmarks de alternativas VLN comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El checkpoint es parcial: no es un repositorio `from_pretrained` de Transformers o PEFT y requiere el código fuente de MemVLN y los pesos base en revisiones concretas.
- Depende de Matterport3D, cuyas mallas se obtienen por separado bajo los términos de acceso del dataset; sin ellas no se puede reproducir la evaluación.
- Licencia `component-specific-terms`: el MIT del código fuente no licencia los pesos ni los datos de entrenamiento para uso comercial sin revisar `LICENSE.md` y `THIRD_PARTY_NOTICES.md`.
- Uso previsto de investigación en navegación; no hay evidencia de robustez en entornos físicos reales ni de generalización fuera de R2R y RxR.
- Riesgo de alucinación y de errores de recuperación de memoria en episodios largos; las métricas publicadas son sobre Val-Unseen, no sobre escenarios adversariales.
- Idiomas: solo se reportan instrucciones en inglés en RxR; el soporte multilingüe no está documentado.
- Sin datos publicados de sesgos, latencia, throughput ni cuantización, lo que dificulta planificar un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/Yannnnnnnn/MemVLN
- Dataset: https://huggingface.co/datasets/Yannnnnnnn/MemVLN-data
- Código fuente: https://github.com/MemVLN/MemVLN
- Release v0.1.0: https://github.com/MemVLN/MemVLN/releases/tag/v0.1.0
- Artículo: https://arxiv.org/abs/2610.35066
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo de geometría: https://huggingface.co/lch01/StreamVGGT
