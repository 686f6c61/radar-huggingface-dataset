# Yuyang-z/rbdj-tsct-a-s30k

## Resumen

`rbdj-tsct-a-s30k` es un modelo de mundo (world model) para robotica desarrollado por el usuario Yuyang-z, publicado en Hugging Face. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base SANA-RWM, concretamente la variante `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`, de aproximadamente 5 mil millones de parametros. El modelo se entrena sobre cadenas de episodios del simulador RoboDojo con el robot ARX X5, y su funcion es predecir observaciones visuales y secuencias de acciones de efector final (EEF) condicionadas por multiples vistas de camara.

La relevancia de este modelo radica en su enfoque de "two-stream obs-block": procesa de forma separada las observaciones visuales (bloques de observacion) y las acciones, con un mecanismo de atencion con sumidero softmax (softmax sink) y un horizonte de 7. El checkpoint publicado corresponde al epoch 70, step 30000, con pesos en crudo (raw weights), consolidados en fp32. El repositorio ocupa 17,9 GB e incluye pesos, metadatos, receta de entrenamiento, normalizacion y el contrato de datos de las ventanas de episodios.

No se dispone de informacion sobre licencia, idiomas soportados ni pipeline declarado en Hugging Face. El modelo esta claramente orientado a investigacion en robotica y aprendizaje por imitacion dentro del ecosistema RoboDojo/SANA, no a tareas de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) con two-stream obs-block; backbone SANA-RWM con atencion QwenNext y sub-atencion; VAE LTX-2.3 para codificacion visual |
| Parametros totales | Aproximadamente 5B (segun nombre del modelo base `_5B_`) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | Ventanas de episodio de L = 4..49 chunks de 32 acciones absolutas a 25 fps |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32 consolidado) |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SANA-RWM, un world model de difusion con flow matching que combina un transformer con atencion tipo QwenNext y sub-atencion, y un VAE (LTX-2.3) que codifica las observaciones visuales en latentes. La variante `TwoStream` separa el procesamiento en dos flujos: uno para las observaciones (obs-block) y otro para las acciones, con un mecanismo de atencion con sumidero softmax (softmax sink) de horizonte 7. Las vistas de camara se codifican con resoluciones distintas: `cam_head` a 384x480 px (latentes 12x15), `cam_left_wrist` y `cam_right_wrist` a 192x256 px (latentes 6x8).

El entrenamiento parte del checkpoint preentrenado `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000` (epoch 6, step 60000) y aplica un SFT sobre cadenas de episodios completos de RoboDojo con el robot ARX X5. Los datos consisten en ventanas de episodio desde el primer frame, con L = 4..49 chunks de 32 acciones absolutas de efector final a 25 fps, normalizacion propia de la receta y prompts de grupo de tokens con dropout de instruccion de 0,1. El checkpoint publicado corresponde al epoch 70, step 30000, de la receta `SANA_RoboDojo_EpisodeChain_SFT_cd60k_nw_tb2x_ema_s50k_packstrat142_b2p95_gclip_h12x15w6x8_kef8n`. No se especifica el numero total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Prediccion de observaciones visuales futuras (video) condicionadas por acciones y multiples vistas de camara.
- Generacion de secuencias de acciones de efector final (EEF) absolutas a 25 fps, en chunks de 32 acciones.
- Modelado de mundo para simulacion robotica: dado un prefijo limpio de episodio, predice el ultimo chunk de la ventana.
- Condicionamiento multi-vista: cabeza, muneca izquierda y muneca derecha.
- Inferencia con classifier-free guidance (video CFG 6, action CFG 1) y 10 pasos de difusion con flow shifts 5/1.
- Soporte de `prefix_cache` para pre-rellenar el prefijo limpio del episodio.
- Integracion con el ecosistema XPolicyLab mediante el esquema `sana_wam_tsct.episode_chain_contract.v1`.
- No se documentan capacidades de tool calling, agentes, multilingue, thinking mode, vision general, audio ni matematicas.

## Casos de uso

- Simulacion de manipulation robotica en RoboDojo: el modelo genera rollouts de video y acciones para el robot ARX X5, permitiendo evaluar politicas en simulacion antes de desplegarlas en hardware.
- Aprendizaje por imitacion con cadenas de episodios: al entrenarse sobre episodios completos desde el primer frame, permite modelar dependencias de largo plazo en tareas de manipulacion multi-paso.
- Generacion de datos sinteticos de entrenamiento: las predicciones de observaciones y acciones pueden usarse para aumentar datasets de robotica con trayectorias plausibles.
- Evaluacion de politicas con `prefix_cache`: dado un prefijo de episodio real, se predice el chunk final para comparar con la ejecucion real y medir el error del world model.
- Investigacion en world models condicionados por multiples camaras: la arquitectura two-stream obs-block permite estudiar como distintas vistas contribuyen a la prediccion de acciones.
- Desarrollo de controladores predictivos: las secuencias de acciones EEF generadas pueden alimentar bucles de control en simulacion con 25 fps y chunks de 32 acciones.
- Reproducibilidad de recetas SANA-RWM: el repositorio incluye `config.yaml`, normalizacion con sha256 y contrato de datos, lo que facilita replicar el entrenamiento en otros simuladores o robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 5B parametros en fp32, los pesos ocupan unos 20 GB, por lo que se requiere al menos una GPU de 24 GB para cargar el checkpoint consolidado sin cuantizar.
- GPU recomendadas: no disponible en la informacion; por tamano, cabria esperar A100 40/80 GB, H100 o RTX 4090 (24 GB) para fp32 ajustado o con tecnicas de offload.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) solo con fp32 muy ajustado o cuantizacion no documentada; no confirmado.
- Opciones de despliegue: XPolicyLab `SANA_WAM_TSCT` (esquema `sana_wam_tsct.episode_chain_contract.v1`), instalado como `policy/SANA_WAM_TSC` en un checkout dedicado (por ejemplo, `RoboDojo_slurm1_tsct`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbdj-tsct-a-s30k | ~5B | Ventanas de 4..49 chunks de 32 acciones | World model robotico (video + acciones) | No disponible | Hugging Face (0 descargas) |
| SANA-RWM base (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`) | ~5B | No disponible | World model robotico | No disponible | Referenciado como base |
| SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000 | No disponible | No disponible | Preentrenamiento de world model | No disponible | Referenciado como inicializacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado en robotica (ARX X5 en RoboDojo); no es un modelo de lenguaje general ni soporta tareas de texto, codigo o matematicas.
- Pesos publicados en crudo (raw weights) del epoch 70, step 30000; no se indica que sea un checkpoint final ni validado para produccion.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles: no aplica a tareas multilingues.
- Riesgo de alucinacion en la prediccion de observaciones y acciones: al ser un modelo generativo de difusion, puede producir trayectorias fisicamente implausibles fuera de la distribucion de entrenamiento.
- Dependencia del simulador y del contrato de datos (`episode_chain_contract.json`): el modelo espera ventanas con un formato concreto (resoluciones, latentes, normalizacion) y puede fallar si se desvia.
- Requiere el ecosistema XPolicyLab y la configuracion de inferencia especifica (CFG 6/1, 10 pasos, flow shifts 5/1); no se documentan otras opciones de despliegue.
- Sin descargas ni likes en Hugging Face: no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al entrenarse en un unico simulador y robot, el sesgo de dominio es previsible.

## Enlaces

- Hugging Face: https://huggingface.co/Yuyang-z/rbdj-tsct-a-s30k
