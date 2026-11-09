# Yuyang-z/rbdj-tsctrb-s10k

## Resumen

rbdj-tsctrb-s10k es un modelo de mundo (world model) para robótica entrenado mediante ajuste fino supervisado (SFT) sobre cadenas de episodios completos del simulador RoboDojo con el robot ARX X5. Lo desarrolla el usuario Yuyang-z y se publica como pesos crudos del paso 10.000 de la época 24 de un entrenamiento previo denominado `SANA_RoboDojo_SFT_cd60k_nw_ema_s50k_packstrat142_b2p95_gclip_h12x15w6x8_robot_base_eef_kef8n`, que a su vez parte de un modelo preentrenado de SANA (variante Vanilla 256 px con obs-block de dos flujos).

El modelo se construye sobre la arquitectura `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`, un transformer de difusión de flujo (flow matching) de aproximadamente 5.000 millones de parámetros que modela vídeo multi-cámara y acciones de efector final (EEF) de forma conjunta. Su relevancia radica en que aborda la predicción de futuros visuales condicionada por acciones en entornos simulados de manipulación robótica, una pieza clave para planificación basada en modelo y para generar datos sintéticos de entrenamiento.

La ficha se basa exclusivamente en la model card publicada; no hay información sobre benchmarks, licencia, idiomas ni resultados cuantitativos de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión de flujo (flow matching) con atención sub-attn y bloques de observación de dos flujos (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`) |
| Parámetros totales | Aproximadamente 5.000 millones (según el nombre de la arquitectura, "5B") |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de episodio de L = 4 a 49 chunks de 32 acciones EEF a 25 fps (no se especifica en tokens) |
| Tipos de cuantización | No disponible (pesos publicados en fp32 consolidado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un world model de vídeo y acción basado en difusión de flujo (flow matching) con arquitectura de dos flujos y bloques de observación (obs-block). Procesa tres vistas de cámara con resoluciones distintas: `cam_head` a 384x480, `cam_left_wrist` a 192x256 y `cam_right_wrist` a 192x256, que se codifican en latentes de dimensiones [[12, 15], [6, 8], [6, 8]] mediante el VAE LTX-2.3, codificado en línea durante el entrenamiento. Las acciones son chunks de 32 acciones EEF absolutas a 25 fps, y las ventanas cubren episodios completos desde su primer frame con L entre 4 y 49 chunks.

El entrenamiento es un SFT sobre cadenas de episodios del simulador RoboDojo con el robot ARX X5, usando la receta de normalización de la cadena y los prompts de grupo de tokens del preentrenamiento con dropout de instrucción de 0,1. Se emplea un horizonte de sumidero softmax (softmax sink horizon) de 7. El modelo parte de un checkpoint preentrenado de SANA Vanilla 256 px (época 6, paso 60.000) y se ajusta durante 24 épocas hasta el paso 10.000, cuyos pesos crudos son los publicados. En inferencia se usan CFG de vídeo 6, CFG de acción 1, 10 pasos de muestreo y desplazamientos de flujo (flow shifts) de 5 y 1, con prefill del prefijo limpio mediante `prefix_cache` de sana-rwm.

## Capacidades

- Predicción de vídeo futuro multi-cámara condicionada por acciones de efector final en entornos simulados de manipulación robótica.
- Modelado conjunto de observaciones visuales (tres vistas) y secuencias de acciones EEF absolutas a 25 fps.
- Generación de rollouts de episodios completos con ventanas de 4 a 49 chunks de 32 acciones.
- Condicionamiento por instrucciones en lenguaje natural mediante prompts de grupo de tokens (con dropout de instrucción durante el entrenamiento).
- Inferencia con prefix caching para reutilizar prefijos limpios en la generación del último chunk del episodio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni audio.

## Casos de uso

- Planificación basada en modelo en simulación: el world model permite evaluar trayectorias de acción candidatas prediciendo sus consecuencias visuales en las tres cámaras, lo que sirve para seleccionar acciones antes de ejecutarlas en el simulador RoboDojo con ARX X5.
- Generación de datos sintéticos para entrenamiento de políticas: al generar rollouts de episodios completos condicionados por instrucciones, se pueden producir trayectorias etiquetadas que amplíen el dataset de entrenamiento de políticas de manipulación.
- Evaluación de políticas en bucle cerrado: el modelo puede actuar como entorno sustituto para medir el éxito de una política sin ejecutar el simulador físico completo, reduciendo coste computacional.
- Investigación en world models para robótica: sirve como checkpoint de referencia para estudiar el efecto del SFT sobre cadenas de episodios frente al preentrenamiento genérico de SANA.
- Aumento de datos con variaciones de instrucción: el dropout de instrucción de 0,1 y los prompts de grupo de tokens permiten generar variaciones condicionadas sobre una misma escena simulada.
- Reproducción de experimentos: la publicación incluye `config.yaml`, `episode_chain_contract.json`, `normalization/` y `SHA256SUMS`, lo que facilita reproducir el pipeline de entrenamiento e inferencia en el ecosistema XPolicyLab (`SANA_WAM_TSCT`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con aproximadamente 5.000 millones de parámetros en fp32, los pesos ocupan en torno a 20 GB; el repositorio completo pesa 17,9 GB. La inferencia con latentes de vídeo multi-cámara y 10 pasos de muestreo requiere memoria adicional no cuantificada en la model card.
- GPU recomendadas: no disponible. Por tamaño, se requiere al menos una GPU con 24 GB o más para pesos en fp32 sin cuantizar; se recomienda A100 o H100 para ejecución cómoda, aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado. En fp32 no cabría en GPUs de 24 GB sin técnicas de offloading o cuantización, que no se documentan.
- Opciones de despliegue: el autor indica XPolicyLab `SANA_WAM_TSCT` (esquema `sana_wam_tsct.episode_chain_contract.v1`), instalado en NRT como `policy/SANA_WAM_TSC` de un checkout dedicado (por ejemplo, `RoboDojo_slurm1_tsct`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models de robótica con las mismas características) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el simulador RoboDojo con el robot ARX X5; su transferencia a entornos reales o a otros robots no está documentada.
- Los pesos publicados son "raw weights" del paso 10.000 de la época 24, sin ema ni consolidación adicional más allá del fp32; pueden presentar inestabilidades no caracterizadas en la model card.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad de las predicciones.
- El despliegue requiere el ecosistema XPolicyLab y el esquema de contrato de cadena de episodios, lo que limita la portabilidad.
- El tamaño del repositorio (17,9 GB) y los pesos en fp32 dificultan su uso en hardware de consumo.
- No hay información sobre idiomas soportados ni sobre robustez ante instrucciones fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/Yuyang-z/rbdj-tsctrb-s10k
