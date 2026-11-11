# Yuyang-z/rbdj-tsctrb-s20k-ee-ema

## Resumen

rbdj-tsctrb-s20k-ee-ema es un punto de control (checkpoint) de un modelo del mundo (world model) para robótica, desarrollado por el usuario Yuyang-z y publicado en Hugging Face. No se trata de un modelo de lenguaje conversacional, sino de un modelo generativo vídeo-acción entrenado para predecir la evolución visual de un entorno robótico y las acciones del robot asociadas, dentro del simulador RoboDojo con un brazo ARX X5. El checkpoint corresponde al epoch 47, step 20000, con pesos EMA (0.999) del modelo `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`.

La arquitectura subyacente es un transformer de difusión (flow matching) de dos flujos con bloques de observación, denominado SANA-RWM, con aproximadamente 5B parámetros según el nombre del modelo. Procesa observaciones multi-vista (cámara de cabeza a 384x480 y dos cámaras de muñeca a 192x256) codificadas por el VAE LTX-2.3, junto con secuencias de acciones EEF absolutas a 25 fps, y genera predicciones de vídeo y acción condicionadas por instrucción.

Su relevancia es acotada: es un artefacto de investigación para el entrenamiento y evaluación de políticas robóticas en simulación, no un modelo de propósito general. La información pública disponible es muy limitada (0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados), por lo que muchos de los campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching) de dos flujos con bloques de observación, basado en SANA-RWM (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`) |
| Parametros totales | Aproximadamente 5B (según el identificador del modelo; cifra exacta no disponible) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible en tokens; ventana de episodio de L = 4..49 chunks de 32 acciones a 25 fps |
| Tipos de cuantizacion | No disponible (pesos consolidados en fp32) |
| Idiomas soportados | No disponible (modelo orientado a instrucciones de robótica, no a texto multilingüe) |
| Licencia | No disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un world model vídeo-acción de dos flujos (two-stream) con bloques de observación (obs-block), construido sobre la familia SANA-RWM. Emplea un esquema de flow matching auto-condicionado (self-flow) con condicionamiento de cámara y múltiples vistas. Las observaciones se codifican en línea con el VAE LTX-2.3: cámara de cabeza a 384x480 px (latentes 12x15), muñeca izquierda y derecha a 192x256 px (latentes 6x8 cada una). Las acciones son EEF absolutas agrupadas en chunks de 32 a 25 fps, con ventanas de episodio completas desde el primer frame y longitudes de 4 a 49 chunks. El modelo incorpora un horizonte de sumidero softmax (softmax sink horizon) de 7.

El entrenamiento es un SFT sobre cadenas de episodios (episode-chain SFT) del simulador RoboDojo con robot ARX X5, partiendo de un preentrenamiento (`SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000`, epoch 6, step 60000). La receta indicada es `SANA_RoboDojo_SFT_cd60k_nw_ema_s50k_packstrat142_b2p95_gclip_h12x15w6x8_robot_base_eef_kef8n`, con prompts de grupo de tokens del preentrenamiento y dropout de instrucción de 0.1. El checkpoint publicado corresponde al step 20000 con pesos EMA 0.999. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo futuro condicionada por acción e instrucción en entornos robóticos simulados (predicción de observaciones multi-vista).
- Predicción de secuencias de acciones EEF absolutas en chunks de 32 a 25 fps.
- Condicionamiento por cámara y multi-vista (cabeza, muñeca izquierda, muñeca derecha).
- Soporte de prefijado de prefijo limpio (`prefix_cache`) para inferencia autoregresiva por chunks con video CFG 6 y action CFG 1 a 10 pasos.
- Integración con instrucciones mediante prompts de grupo de tokens con dropout de instrucción.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de políticas robóticas en simulación: el modelo predice la evolución visual del entorno y las acciones del brazo ARX X5, permitiendo comparar políticas candidatas en RoboDojo sin despliegue físico.
- Generación de datos sintéticos de episodios: a partir de instrucciones y observaciones iniciales, se pueden generar trayectorias vídeo-acción para aumentar datasets de entrenamiento de políticas.
- Modelado de dinámica para planificación: el world model puede usarse para simular el resultado de secuencias de acciones candidatas y seleccionar la más adecuada antes de ejecutarla.
- Investigación en world models multi-vista: su condicionamiento por cámara y bloques de observación lo hacen adecuado para estudiar consistencia entre vistas en predicción de vídeo robótico.
- Réplica de experimentos SANA-RWM: el checkpoint y su contrato de datos (`episode_chain_contract.json`) permiten reproducir el SFT de cadenas de episodios sobre RoboDojo.
- Integración en pipelines de investigación con XPolicyLab: el esquema `sana_wam_tsct.episode_chain_contract.v1` permite desplegarlo como política `SANA_WAM_TSC` en un checkout dedicado (por ejemplo, RoboDojo_slurm1_tsct).
- Estudio de estabilidad de entrenamiento: los pesos EMA 0.999 en el step 20000 sirven como referencia para analizar la convergencia del SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos fp32 consolidados y ~5B parámetros, el peso del modelo ronda los 20 GB, por lo que se requiere al menos una GPU con 24 GB o más para cargarlo sin cuantización, además de memoria para el VAE LTX-2.3 y los latentes de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar A100 40/80 GB o H100 para inferencia cómoda, y RTX 4090 (24 GB) como mínimo ajustado, sin confirmación del autor.
- Cabe en consumer GPU: no confirmado; probablemente solo en GPUs de 24 GB o más y con recortes de resolución o batch.
- Opciones de despliegue: XPolicyLab con el esquema `SANA_WAM_TSCT` (instalado como `policy/SANA_WAM_TSC` en un checkout dedicado, por ejemplo RoboDojo_slurm1_tsct). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles; la inferencia indicada usa 10 pasos con video CFG 6 y action CFG 1, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbdj-tsctrb-s20k-ee-ema | ~5B (no confirmado) | Ventana de episodio de 4..49 chunks de 32 acciones | World model vídeo-acción RoboDojo / ARX X5 | No disponible | Hugging Face (0 descargas) |
| SANA-RWM base (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`) | ~5B | No disponible | World model vídeo-acción base | No disponible | Referenciado en la model card, no enlazado |
| Preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000` | No disponible | No disponible | Preentrenamiento del que parte este checkpoint | No disponible | Referenciado en la model card |
| Otros world models robóticos open source | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: 0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Ámbito muy restringido: entrenado específicamente para RoboDojo con robot ARX X5 y acciones EEF; no es transferible sin más a otros robots, simuladores o tareas.
- Dependencia del contrato de datos: la inferencia requiere respetar `episode_chain_contract.json`, la normalización (`normalization/`, sha256 `1fe3b7e7...`) y el esquema `sana_wam_tsct.episode_chain_contract.v1`; un uso fuera de contrato puede producir salidas inválidas.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir predicciones plausibles pero físicamente incorrectas, especialmente fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse en un simulador concreto, hereda sus sesgos físicos y de apariencia.
- Limitaciones de contexto: la ventana está acotada a 4..49 chunks de 32 acciones; secuencias más largas requieren el esquema de prefijado por chunks.
- Pesos en fp32 de gran tamaño (repo de 17.9 GB): requiere hardware con memoria suficiente y no se ofrecen versiones cuantizadas.
- Sin garantías de mantenimiento: el checkpoint se publicó el 2026-11-10 y se actualizó el mismo día; no hay historial de versiones.

## Enlaces

- Hugging Face: https://huggingface.co/Yuyang-z/rbdj-tsctrb-s20k-ee-ema
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
