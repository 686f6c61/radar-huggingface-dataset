# Yuyang-z/rbdj-tsc-p60s-s20k

## Resumen

rbdj-tsc-p60s-s20k es un checkpoint de investigación publicado por el usuario Yuyang-z en Hugging Face. Se trata de un ajuste fino supervisado (SFT) sobre cadenas de episodios del simulador RoboDojo con el robot ARX X5, aplicado sobre un modelo del mundo (world model) de dos flujos denominado SANA-RWM, en su variante `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`. El checkpoint corresponde al epoch 47, step 20000, con pesos en bruto (sin EMA).

El modelo parte de un preentrenamiento (`SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000`, epoch 6, step 60000) y se entrena con la receta `SANA_RoboDojo_EpisodeChain_SFT_cd60k_nw_tb2x_ema_s50k_packstrat142_b2p95_gclip_kef8n`. Su propósito es predecir vídeo y acciones en un contexto robótico multi-vista, no es un modelo de lenguaje conversacional.

La relevancia es acotada: se trata de un artefacto de investigación sin descargas ni likes, sin model card estándar de Hugging Face y con licencia no declarada. Resulta útil únicamente para quien quiera reproducir o inspeccionar la receta de entrenamiento del world model SANA-RWM en el entorno RoboDojo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos flujos (two-stream) con obs-block, self-flow y atención con sumidero softmax; variante `SanaRWMVideoQwenNextSubAttnResV2` |
| Parametros totales | 5B (según el identificador del modelo base `_5B_`) |
| Parametros activos | no disponible |
| Longitud de contexto | Ventana de episodio con L = 4..49 chunks de 32 acciones EEF absolutas a 25 fps; horizonte de sumidero softmax de 7 |
| Tipos de cuantizacion | no disponible (pesos consolidados en fp32) |
| Idiomas soportados | no disponible (modelo orientado a vídeo/acción, no a texto) |
| Licencia | no disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un world model vídeo-acción de dos flujos sobre una columna transformer de aproximadamente 5B parámetros. La variante `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream` combina atención con sumidero softmax (horizonte 7), condicionamiento por cámara multi-vista (3 vistas de 256x320) y un esquema self-flow. Los latentes de vídeo se generan con LTX-2.3 y las acciones se representan como chunks de 32 acciones EEF absolutas a 25 fps.

El entrenamiento es un SFT sobre cadenas de episodios de RoboDojo: las ventanas abarcan episodios completos desde su primer frame, con L entre 4 y 49 chunks, normalización propia de la receta de cadena y prompts de grupo de tokens del preentrenamiento con dropout de instrucción de 0.1. El checkpoint publicado es el epoch 47, step 20000, con pesos en bruto (sin EMA). No se documentan fases de RLHF o DPO.

## Capacidades

- Predicción de vídeo multi-vista condicionada por cámara (3 vistas, 256x320).
- Predicción de secuencias de acciones EEF absolutas en chunks de 32 a 25 fps.
- Modelado de episodios completos mediante ventanas de cadena (L = 4..49 chunks).
- Inferencia con prefijado de prefijo limpio (`prefix_cache`) para el último chunk del episodio.
- Condicionamiento por instrucción mediante prompts de grupo de tokens (con dropout en entrenamiento).
- No se documentan capacidades de tool calling, agentes, razonamiento textual, matemáticas ni audio.

## Casos de uso

- Investigación en world models robóticos: reproducción del entrenamiento y evaluación del checkpoint en el simulador RoboDojo con el robot ARX X5, usando la receta y el contrato de datos incluidos en el repositorio.
- Generación de rollouts sintéticos de vídeo y acción: el modelo puede producir trayectorias de acción EEF y vídeo multi-vista coherente, útil para aumentar datos de entrenamiento en manipulación.
- Evaluación de políticas en simulación: sirve como modelo del entorno para medir el rendimiento de políticas antes de transferir a hardware real.
- Estudio de condicionamiento multi-cámara: permite analizar cómo la información de las 3 vistas 256x320 afecta a la predicción de acciones.
- Análisis de estabilidad de entrenamiento: al ser un checkpoint intermedio (epoch 47, step 20000) con pesos en bruto, es útil para comparar curvas frente a la variante EMA de la misma receta.
- Reproducción de pipelines de inferencia: el despliegue vía XPolicyLab `SANA_WAM_TSC` con CFG de vídeo 6, CFG de acción 1, 10 pasos y flow shifts 5/1 permite validar configuraciones de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 5B parámetros en fp32 el checkpoint consolidado ronda los 20 GB, por lo que la inferencia en fp32 requiere al menos ~20-24 GB de VRAM, sin contar activaciones ni latentes de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, encajan A100 40/80 GB, H100 y, en el límite, RTX 4090 24 GB si se reduce precisión (no documentado).
- Cabe en consumer GPU: no confirmado; en fp32 no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: XPolicyLab `SANA_WAM_TSC` (único pipeline documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La inferencia usa 10 pasos con flow shifts 5/1 y CFG de vídeo 6.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rbdj-tsc-p60s-s20k | ~5B | Ventana de episodio L = 4..49 chunks | no disponible | Hugging Face (0 descargas) |
| SANA-RWM base (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`) | ~5B | no disponible | no disponible | Referenciado como base del entrenamiento |
| SANA-Vanilla Pretrain (`SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000`) | no disponible | no disponible | no disponible | Referenciado como inicialización |

No se dispone de datos de rendimiento ni de otros world models comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Checkpoint de investigación sin model card estándar: faltan idiomas, pipeline y descripción formal de uso.
- Pesos en bruto (sin EMA): pueden presentar mayor varianza que la variante EMA de la misma receta.
- Específico del simulador RoboDojo y del robot ARX X5: no es transferible directamente a otros robots o entornos sin reentrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación en la predicción de vídeo/acción: al ser un modelo generativo, puede producir trayectorias no físicamente plausibles fuera de la distribución de entrenamiento.
- Repositorio sin descargas ni likes: no hay validación comunitaria ni informes de uso.
- Requiere el contrato de datos (`episode_chain_contract.json`) y la normalización incluidas para reproducir la inferencia correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/Yuyang-z/rbdj-tsc-p60s-s20k
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
