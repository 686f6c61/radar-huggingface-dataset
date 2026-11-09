# Yuyang-z/rbdj-tsctrb-s20k-ee

## Resumen

rbdj-tsctrb-s20k-ee es un checkpoint de investigación publicado por el usuario Yuyang-z en Hugging Face. Se trata de un modelo de mundo (world model) para robótica, concretamente un ajuste fino supervisado (SFT) sobre la arquitectura SANA-RWM de dos flujos (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`), según la nomenclatura interna del autor. El checkpoint corresponde al epoch 47, step 20000, con pesos en bruto, y se inicializa a partir de un modelo preentrenado SANA Vanilla de 256 px.

El modelo está entrenado sobre episodios del simulador RoboDojo con el robot ARX X5, empleando ventanas de episodios completos que abarcan entre 4 y 49 chunks de 32 acciones absolutas de efector final (EEF) a 25 fps. La entrada multimodal combina tres vistas de cámara (cabeza a 384x480 y dos muñecas a 192x256), codificadas mediante el VAE de LTX-2.3, lo que sitúa al modelo en la categoría de world models condicionados por cámara y acción para planificación y simulación robótica.

La relevancia de esta publicación es acotada: se trata de un artefacto de investigación sin model card convencional, sin licencia declarada y sin métricas publicadas, orientado a la reproducción de experimentos dentro del ecosistema XPolicyLab (esquema `sana_wam_tsct.episode_chain_contract.v1`). No es un modelo de propósito general ni está pensado para despliegue directo por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SANA-RWM two-stream obs-block world model (transformer con self-flow y atención sub-attn, condicionado por cámara multivista) |
| Parametros totales | 5B (según el identificador `_5B_`; `P1_D36` sugiere profundidad 36) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ventanas de episodio de 4 a 49 chunks de 32 acciones a 25 fps (no se expresa en tokens) |
| Tipos de cuantizacion | no disponible (pesos consolidados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de acciones/visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SANA-RWM en su variante `TwoStream_5B_P1_D36`, un world model de dos flujos con bloques de observación (obs-block) y atención con sink softmax de horizonte 7. Procesa observaciones multivista codificadas por el VAE de LTX-2.3 en latentes de resolución `[[12, 15], [6, 8], [6, 8]]` para las cámaras de cabeza y muñecas, y genera predicciones condicionadas por acciones absolutas de efector final. El entrenamiento emplea un esquema de flow matching (self-flow) con shifts de 5 y 1 para vídeo y acción respectivamente.

El ajuste fino se realizó sobre el preentrenado `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000` (epoch 6, step 60000), usando la receta de cadena de episodios de RoboDojo con normalización propia y prompts de grupo de tokens con dropout de instrucción de 0.1. El checkpoint publicado corresponde al step 20000 de un run denominado `SANA_RoboDojo_SFT_cd60k_nw_ema_s50k_packstrat142_b2p95_gclip_h12x15w6x8_robot_base_eef_kef8n`. No se documentan detalles sobre volumen total de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Predicción de vídeo y acciones futuras en entornos simulados de manipulación robótica (RoboDojo, robot ARX X5).
- Modelado de mundo condicionado por cámara multivista (cabeza y dos muñecas).
- Generación de secuencias de acciones absolutas de efector final a 25 fps en chunks de 32 pasos.
- Inferencia con prefijado de contexto limpio (`prefix_cache`) para el último chunk de la ventana.
- Control mediante CFG de vídeo (6) y de acción (1) y 10 pasos de muestreo.
- Soporte de instrucciones mediante prompts de grupo de tokens (con dropout durante entrenamiento).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni thinking mode.

## Casos de uso

- Investigación en world models robóticos: reproducción del experimento de SFT sobre RoboDojo para estudiar la dinámica de episodios completos con ventanas de 4 a 49 chunks.
- Simulación de políticas de manipulación: uso del modelo como predictor de observaciones y acciones para evaluar políticas ARX X5 en el simulador antes de transferir a hardware.
- Estudio de condicionamiento multivista: análisis de cómo las tres cámaras (cabeza y muñecas) influyen en la predicción de acciones de efector final.
- Benchmarking interno de recetas de entrenamiento: comparación de este checkpoint (step 20000) frente a otros pasos del mismo run o frente al preentrenado base.
- Generación de datos sintéticos de episodios: empleo del world model para producir trayectorias simuladas que alimenten pipelines de aprendizaje por imitación.
- Validación de contratos de datos: uso del `episode_chain_contract.json` y del esquema `sana_wam_tsct.episode_chain_contract.v1` para verificar la integridad de almacenes de ventanas de episodios en XPolicyLab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los pesos consolidados en fp32 del repositorio ocupan 17,9 GB, por lo que en fp32 se requiere al menos esa cantidad más overhead de activaciones y del VAE de LTX-2.3.
- GPU recomendadas: no disponible en la documentación; por tamaño (5B) cabría esperar A100/H100 para fp32 y GPUs de 24 GB o más para formatos reducidos, pero no se confirma.
- Cabe en consumer GPU: no confirmado; en fp32 no cabría en GPUs de 24 GB, y no se documentan cuantizaciones.
- Opciones de despliegue: XPolicyLab `SANA_WAM_TSCT` (esquema `sana_wam_tsct.episode_chain_contract.v1`), instalado en NRT como `policy/SANA_WAM_TSC` de un checkout dedicado (p. ej. RoboDojo_slurm1_tsct). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models robóticos condicionados por acción y cámara) con parámetros, contexto, rendimiento o licencia verificables.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso productivo.
- Model card mínima y orientada a reproducibilidad interna: no hay métricas, evaluación cualitativa ni guía de uso para terceros.
- Checkpoint de investigación en un paso intermedio (epoch 47, step 20000): no representa necesariamente el mejor estado del run.
- Especializado en el simulador RoboDojo y el robot ARX X5: no se espera generalización directa a otros robots, entornos o tareas sin reentrenamiento.
- Pesos en fp32 sin cuantizaciones documentadas: difícil despliegue en hardware de consumo.
- Dependencia de un stack concreto (XPolicyLab, esquema `sana_wam_tsct.episode_chain_contract.v1`, VAE de LTX-2.3): la reproducibilidad exige replicar dicho entorno.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Sin soporte lingüístico declarado: no apto para tareas de texto, diálogo o generación de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/Yuyang-z/rbdj-tsctrb-s20k-ee
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
