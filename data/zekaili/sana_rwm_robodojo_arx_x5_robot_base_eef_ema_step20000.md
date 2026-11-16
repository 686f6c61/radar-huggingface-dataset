# zekaili/sana_rwm_robodojo_arx_x5_robot_base_eef_ema_step20000

## Resumen

SANA-RWM RoboDojo ARX-X5 es una política de robótica (policy) derivada del modelo del mundo de dos flujos SANA-RWM, publicada por el usuario zekaili en Hugging Face. No es un modelo de lenguaje conversacional ni un generador de imágenes: es un checkpoint de control visuomotor entrenado para ejecutar tareas de manipulación bimanual en el simulador RoboDojo con el robot ARX-X5, prediciendo secuencias de acciones de efector final a partir de observaciones multivista.

El modelo se obtiene por fine-tuning supervisado (SFT) sobre un world model preentrenado de aproximadamente 5B parámetros (`SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`), inicializado a su vez desde un preentrenamiento de bloques de observación a 256 px. El checkpoint publicado corresponde a los pesos EMA (decay 0.999) en el paso 20.000 del run `SANA_RoboDojo_SFT_cd60k_nw_ema_s50k_packstrat142_b2p95_gclip_h12x15w6x8_robot_base_eef_kef8n`.

Su relevancia es acotada pero específica: documenta de forma inusualmente rigurosa un pipeline completo de política robótica basada en world model, con contrato de despliegue, normalización de acciones, checksums y resultados de evaluación en 42 tareas del simulador. El repositorio ocupa 17,9 GB y contiene pesos en fp32 consolidados, lo que condiciona fuertemente su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model de dos flujos (two-stream obs-block) con atención subsampleada, basado en SANA-RWM; backbone de vídeo con VAE LTX-2.3 y componente tipo Qwen-Next |
| Parametros totales | ~5B (según nombre del modelo base `..._5B_P1_D36`); el checkpoint publicado no detalla recuento exacto |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en tokens; ventana de episodio con chunks de 32 acciones y L = 4..49 chunks; horizonte de sink softmax de 7 |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32 consolidados) |
| Idiomas soportados | no disponible (modelo de robótica; prompts de instrucción en token-group, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (fp32 consolidado), más `metadata.pth`, `config.yaml`, JSON de normalización y contrato |

## Arquitectura y entrenamiento

La arquitectura es un world model de dos flujos con bloques de observación (obs-block) y atención subsampleada, construido sobre el backbone SANA-RWM. El modelo procesa observaciones multivista en disposición T: cámara de cabeza a 384x480 px y cámaras de muñeca izquierda y derecha a 192x256 px, cuyos latentes se codifican con el VAE LTX-2.3 en resoluciones [[12, 15], [6, 8], [6, 8]]. Sobre esa representación se condiciona la generación de acciones mediante un esquema de flow matching, con flujos separados para vídeo y acción (flow shifts 5 y 1 respectivamente).

El entrenamiento parte del preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000` (epoch 6, step 60.000) y aplica SFT sobre 3.500 episodios de demostraciones del robot ARX-X5 en RoboDojo. Las ventanas cubren episodios completos desde el primer frame, con chunks de 32 acciones absolutas de efector final (`robot_base_eef`) a 25 fps y longitudes variables de 4 a 49 chunks. Se emplean prompts de instrucción agrupados en tokens con instruction dropout de 0.1 y una cadena de dos flujos con horizonte de sink softmax de 7. El checkpoint publicado son los pesos EMA con decay 0.999 tras 20.000 actualizaciones EMA.

## Capacidades

- Predicción de acciones de efector final (32 acciones absolutas por chunk) para control bimanual del robot ARX-X5 en simulación RoboDojo.
- Procesamiento de observaciones multivista: cámara de cabeza más dos cámaras de muñeca, con codificación de latentes mediante VAE.
- Condicionamiento por instrucciones de tarea mediante prompts de token-group (las instrucciones concretas están en `episode_chain_contract.json`).
- Ejecución de cadenas de episodio con prefijado de prefijo limpio (`prefix_cache`) y estado incremental (`incremental_state=true`).
- Ejecución parcial de chunks: el servidor de política ejecuta las primeras 24 filas de cada chunk de 32.
- No soporta tool calling, function calling, agentes de texto, visión general, audio ni modo thinking: es un modelo específico de robótica, no un LLM.

## Casos de uso

- Evaluación de políticas visuomotoras en RoboDojo: sirve como checkpoint de referencia para reproducir los resultados publicados (42 tareas x 3 semillas) y comparar variantes de entrenamiento.
- Investigación en world models para robótica: permite estudiar cómo un world model preentrenado se adapta por SFT a control de efector final con observaciones multivista.
- Control bimanual simulado del ARX-X5: despliegue mediante servidor de política con `exec_rows=24` e `incremental_state=true` para tareas de manipulación en el simulador.
- Análisis de generalización: el desglose por splits (layouts estándar 35,89 SR frente a layouts aleatorizados 4,00 SR) permite estudiar la robustez frente a variaciones de escena.
- Estudio de memoria y horizonte largo: los splits Memory SR (50,78) y Long-Horizon SR (26,08) son útiles para analizar retención de contexto episódico en políticas de chunking.
- Base para ablaciones de EMA y pasos de entrenamiento: al publicarse pesos EMA en step 20.000 con metadatos de trainer (`metadata.pth`), facilita comparaciones con otros checkpoints del mismo run.
- Reproducción de pipelines de normalización: el fichero de normalización de acciones/estado a 25 fps y f33 permite replicar el preprocesado exacto en otros entornos compatibles.

## Benchmarks y rendimiento

Resultados publicados en simulación RoboDojo (42 tareas x 3 semillas = 126 celdas), ejecutando las primeras 24 filas de cada chunk de 32:

| Split | Success Rate (%) |
|---|---:|
| Generalization SR | 19,94 ± 0,57 |
| Precision SR | 27,25 ± 3,14 |
| Long-Horizon SR | 26,08 ± 1,55 |
| Memory SR | 50,78 ± 1,23 |
| Open SR | 4,50 ± 0,35 |
| **Avg SR** | **25,71 ± 1,05** |
| **Avg Score** | **32,41 ± 0,78** |

Desglose del split de generalización: layouts estándar 35,89 ± 0,31 SR; layouts aleatorizados 4,00 ± 1,09 SR.

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores (no hay MMLU, HumanEval, GSM8K ni métricas de LLM, que no aplican a este modelo).

## Requisitos de hardware

- El repositorio ocupa 17,9 GB y los pesos se publican en fp32 consolidados (`pytorch_model_fsdp.bin`), por lo que la inferencia requiere cargar el modelo completo en memoria; no se ofrecen versiones cuantizadas.
- Con ~5B parámetros en fp32, la huella de pesos ronda los 20 GB, lo que exige GPUs con al menos 24 GB de VRAM en el mejor de los casos y preferiblemente 40-80 GB para acomodar activaciones y latentes de vídeo multivista.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue cómodo; una RTX 4090 (24 GB) es ajustada y no está confirmada como suficiente por el autor.
- No cabe en GPUs consumer de gama baja ni en configuraciones de 8-16 GB sin conversión manual a precisión reducida, que el autor no documenta.
- Opciones de despliegue: el autor menciona un servidor de política con parámetros `exec_rows=24` e `incremental_state=true`, pero no especifica el framework (no se confirma vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-RWM RoboDojo ARX-X5 (este) | ~5B | Ventana de episodio, chunks de 32 acciones | Avg SR 25,71 en RoboDojo | no disponible | Hugging Face, 0 descargas |
| Modelo base SANA-RWM 5B (`..._5B_P1_D36`) | ~5B | no disponible | no disponible | no disponible | Referenciado en la model card, no enlazado |
| Otras políticas RoboDojo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM ni un modelo multimodal general; no debe evaluarse con benchmarks de lenguaje.
- Entrenado exclusivamente en simulación RoboDojo con el robot ARX-X5; no hay evidencia de transferencia a robots físicos ni a otros simuladores.
- Rendimiento bajo en el split Open SR (4,50%) y en layouts aleatorizados (4,00% SR), lo que indica escasa generalización a configuraciones no vistas.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Pesos en fp32 de ~17,9 GB sin cuantizaciones publicadas, lo que limita el despliegue en hardware consumer.
- Rutas locales sustituidas por placeholders (`<ROBODOJO_ROOT>`, `<DATA_CACHE>`, `<OUTPUT>`) y sha256 del fichero de normalización distinto al de entrenamiento (`548c908b...` frente a `1fe3b7e7...`), aunque el contrato fija el fichero publicado mediante `normalization_pin_sha256`.
- Sin descargas ni likes en el momento de la consulta: no hay validación externa de la comunidad.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Idiomas soportados no especificados; las instrucciones de tarea están codificadas en el contrato de despliegue y no se documenta su cobertura lingüística.

## Enlaces

- Hugging Face: https://huggingface.co/zekaili/sana_rwm_robodojo_arx_x5_robot_base_eef_ema_step20000
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
