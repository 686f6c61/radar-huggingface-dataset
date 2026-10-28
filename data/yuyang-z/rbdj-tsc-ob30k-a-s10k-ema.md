# Yuyang-z/rbdj-tsc-ob30k-a-s10k-ema

## Resumen

`rbdj-tsc-ob30k-a-s10k-ema` es un checkpoint de un modelo del mundo (world model) para robótica, publicado por el usuario Yuyang-z en HuggingFace. No es un modelo de lenguaje: es un modelo generativo vídeo-acción de la familia SANA-RWM, concretamente la variante `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`, con unos 5 000 millones de parámetros y 36 capas de profundidad. El checkpoint corresponde a un ajuste fino supervisado (SFT) sobre cadenas completas de episodios del simulador RoboDojo con el brazo ARX X5, partiendo de un preentrenamiento en 256 px y aplicando después pesos EMA (0,999) en la actualización 10 000 de la época 24.

El modelo resuelve un problema clásico en aprendizaje por imitación y planificación basada en modelo: predecir vídeo multi-vista y acciones de efector final condicionadas por cámara e instrucción, manteniendo coherencia a lo largo de episodios largos. Para ello emplea una arquitectura de dos flujos (*two-stream*) con bloques de observación (*obs-block*), atención con sub-atención, formulación *self-flow* (flow matching) y un mecanismo de *softmax sink* con horizonte 7 que ancla la generación al prefijo limpio ya generado (*prefix caching*). Trabaja con ventanas de episodio de entre 4 y 49 trozos (*chunks*) de 32 acciones absolutas de efector final a 25 fps y 3 vistas de 256x320, lo que da horizontes de hasta unos 62 segundos de trayectoria.

Su relevancia es de nicho pero clara: se distribuye como *checkpoint* de investigación reproducible (con contratos de datos, normalización y sumas SHA256) para experimentar con modelos del mundo vídeo-acción en manipulación simulada, y está pensado para desplegarse con la herramienta XPolicyLab (`SANA_WAM_TSC`). No incluye model card con benchmarks, licencia declarada ni idiomas soportados, por lo que debe tratarse como artefacto de investigación y no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión/flow matching vídeo-acción, dos flujos (two-stream) con bloques de observación, sub-atención y self-flow; variante `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36` |
| Parametros totales | ~5B (según denominación del checkpoint) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | ventanas de episodio de 4 a 49 chunks de 32 acciones absolutas de EEF a 25 fps (hasta 1.568 pasos de acción, ~62 s de trayectoria); 3 vistas de 256x320 |
| Tipos de cuantizacion | no disponible (se distribuye un consolidado en fp32; no se documentan GGUF, int8 ni otras) |
| Idiomas soportados | no disponible (el modelo card está en inglés; las instrucciones se codifican con un codificador de texto tipo Qwen, sin lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (consolidado fp32), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS` |
| Tamano del repositorio | 17,9 GB |
| Fecha de publicacion | 2026-10-28 (creado), 2026-10-28 (actualizado) |
| Despliegue previsto | XPolicyLab `SANA_WAM_TSC` |
| Checkpoint base | `output/pretrained_models/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_s15000_ws256/epoch_4_step_30000` |

## Arquitectura y entrenamiento

La arquitectura es un modelo del mundo generativo de tipo *flow matching* (la nomenclatura del checkpoint indica *self-flow*) que modela conjuntamente fotogramas de vídeo multi-cámara y secuencias de acciones. La estructura es de dos flujos: uno dedicado a la observación visual y otro al bloque de acciones/observaciones, con atención de sub-atención (`SubAttn`) y anclaje mediante *softmax sink* de horizonte 7, que actúa como memoria fija del contexto visual y de acciones ya generado. La condición de cámara es explícita (`CameraCondition`) y multi-vista (3 vistas), y el texto se inyecta mediante un codificador tipo Qwen (`QwenNext`). El entrenamiento parte de un preentrenamiento *vanilla* a 256 px con mezcla absoluta de acciones (`abs_mix_v4`, `capv3`, `twostream_obsblock`, paso 30 000), sobre el que se aplica el SFT de cadenas de episodios.

Los datos del SFT son ventanas de episodios completos de RoboDojo (simulación con brazo ARX X5), desde el primer fotograma, con L = 4..49 chunks de 32 acciones absolutas de efector final a 25 fps, 3 vistas de 256x320 y latentes de vídeo LTX-2.3. Se usan los *prompts* por grupos de tokens del preentrenamiento con *instruction dropout* de 0,1, y la normalización propia de la receta de cadenas (directorio `normalization/`, sha256 `1fe3b7e7...`). El checkpoint publicado son los pesos EMA 0,999 tras 10 000 actualizaciones (`model_ema_0p999.pth`) en la época 24. No se documentan RLHF, DPO ni fases de alineación por preferencias: es SFT puro sobre demostraciones simuladas.

En inferencia se especifican CFG de vídeo 6, CFG de acción 1, 10 pasos de muestreo y desplazamientos de flujo (*flow shifts*) de 5 y 1. La generación se realiza sobre el último chunk de la ventana de episodio con el prefijo limpio precargado mediante `prefix_cache`, lo que permite extender episodios sin regenerar todo el contexto.

## Capacidades

- Generación de vídeo multi-vista (3 cámaras a 256x320) condicionada por acciones y por instrucción textual.
- Predicción de acciones absolutas de efector final en chunks de 32 pasos a 25 fps, condicionadas por el contexto visual.
- Modelado de episodios largos: ventanas de 4 a 49 chunks con coherencia temporal gracias al prefijo cacheado y al *sink* de horizonte 7.
- Acondicionamiento explícito de cámara y de punto de vista, lo que permite síntesis desde vistas conocidas del simulador.
- Control de generación mediante *classifier-free guidance* independiente para vídeo y acción, y ajuste de *flow shift* por modalidad.
- Capacidad de actuar como modelo del mundo para evaluación de políticas o planificación: dado un prefijo de observaciones, simula futuros plausibles y acciones asociadas.
- Soporte de *tool calling*, *function calling*, agentes multi-paso, matemáticas, código o audio: no disponible (no es un modelo de lenguaje y no se documenta nada al respecto).
- Capacidades multilingües: no disponible; el codificador de texto no tiene lista de idiomas publicada y las instrucciones de entrenamiento parecen en inglés.

## Casos de uso

- Investigación en modelos del mundo para manipulación: usar el checkpoint para simular el resultado visual y cinemático de una política candidata sobre el brazo ARX X5 en RoboDojo, evitando ejecutar la política real en el simulador paso a paso.
- Planificación basada en modelo (MPC neuronal): generar varios futuros de 4 a 49 chunks condicionados por distintas secuencias de acciones y seleccionar la que maximiza una recompensa o minimiza el error respecto a una trayectoria objetivo.
- Aumento de datos sintéticos: producir episodios multi-vista adicionales a 256x320 con acciones coherentes para ampliar un conjunto de demostraciones de imitación antes de entrenar una política visomotora.
- Evaluación *offline* de políticas: alimentar el modelo con el prefijo real de un episodio y comparar la continuación generada con la ejecución registrada, como métrica de plausibilidad física.
- Estudio de *sim-to-real* y robustez de cámaras: al estar condicionado por cámara y por 3 vistas, permite analizar cómo cambia la predicción al variar el punto de vista o la calibración extrínseca.
- Reproducción de experimentos de la familia SANA-RWM: el repositorio incluye `config.yaml`, contrato de datos (`episode_chain_contract.json`), normalización y `SHA256SUMS`, lo que facilita replicar la receta de SFT sobre otras cadenas de episodios.
- Desarrollo de *wrappers* de inferencia con `prefix_cache`: caso práctico para ingeniería de sistemas, midiendo coste de generación por chunk con y sin prefijo precargado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card únicamente describe la receta de entrenamiento y los hiperparámetros de inferencia (CFG de vídeo 6, CFG de acción 1, 10 pasos, *flow shifts* 5/1), sin métricas cuantitativas de calidad de vídeo, error de acción ni comparaciones con otras políticas.

## Requisitos de hardware

- Peso del checkpoint: el consolidado en fp32 ocupa aproximadamente 20 GB teóricos (repositorio de 17,9 GB), por lo que cargar los pesos en fp32 requiere del orden de 18-20 GB de memoria solo para parámetros.
- En bf16/fp16, los 5B parámetros suponen unos 10 GB de pesos; a ello hay que sumar activaciones de un transformer de difusión de vídeo con 3 vistas a 256x320 y 10 pasos de muestreo, además del codificador de texto tipo Qwen.
- GPU de datacenter recomendadas: A100 40/80 GB o H100 80 GB para trabajar con ventanas largas (hasta 49 chunks) y CFG doble (vídeo y acción) sin *offloading*.
- GPU de consumo: una RTX 4090 (24 GB) solo es viable en precisión reducida y con ventanas cortas (4-8 chunks), *offloading* a CPU del codificador de texto y micro-batching; en fp32 no cabe junto con las activaciones.
- No hay soporte documentado para llama.cpp, Ollama, GGUF, TGI ni vLLM: la arquitectura es personalizada y el despliegue previsto es XPolicyLab (`SANA_WAM_TSC`) sobre PyTorch con pesos consolidados desde FSDP.
- Latencia y throughput: no disponibles. Como referencia de configuración, la inferencia declarada es de 10 pasos de muestreo, por lo que el coste por chunk escala linealmente con el número de pasos y con el número de vistas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de especificaciones de modelos comparables (parámetros, contexto, benchmarks o licencia) que permitan una comparación rigurosa. La siguiente tabla recoge únicamente los datos verificables de este checkpoint:

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbdj-tsc-ob30k-a-s10k-ema | ~5B | 4-49 chunks de 32 acciones a 25 fps; 3 vistas 256x320 | Modelo del mundo vídeo-acción para manipulación simulada (ARX X5) | no disponible | HuggingFace, 17,9 GB, fp32 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial, redistribución ni modificación sin contactar con el autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de generación ni de error de acción, lo que impide justificar su elección frente a alternativas.
- Dominio restringido: entrenado con ventanas de RoboDojo en simulación con el brazo ARX X5, 3 vistas fijas y resolución 256x320; no hay garantía de generalización a otros robots, otras cámaras u otras resoluciones.
- Brecha *sim-to-real* no evaluada: no se documenta ningún experimento en hardware físico.
- Riesgo de inconsistencias físicas: como modelo generativo de vídeo, puede producir futuros visualmente plausibles pero incompatibles con la dinámica real (objetos que se atraviesan, acciones irreales); no debe usarse como sustituto de un simulador físico validado.
- Solo SFT: no hay RLHF/DPO ni filtros de seguridad documentados; el contenido generado no está alineado ni moderado.
- Dependencia de herramienta propietaria del ecosistema del autor: el despliegue previsto es XPolicyLab `SANA_WAM_TSC`; no se documenta integración con `diffusers`, vLLM, llama.cpp ni Ollama.
- Formato poco estándar: pesos consolidados fp32 desde FSDP (`pytorch_model_fsdp.bin`), sin versiones cuantizadas, lo que complica el despliegue en GPUs de consumo.
- Idiomas y prompts: no hay lista de idiomas soportados; el codificador de texto tipo Qwen puede degradar el rendimiento con instrucciones fuera del inglés.
- Metadatos anómalos: la fecha de creación indicada (2026-10-28) y el hecho de tener 0 descargas y 0 *likes* sugieren un artefacto de investigación recién publicado, sin validación por parte de la comunidad.
- Caveat de producción: al requerir normalización específica (`normalization/`, sha256 `1fe3b7e7...`) y un contrato de datos concreto (`episode_chain_contract.json`), cualquier uso fuera de esas convenciones invalida las predicciones.

## Enlaces

- HuggingFace: https://huggingface.co/Yuyang-z/rbdj-tsc-ob30k-a-s10k-ema

Nota: la búsqueda web asociada a este identificador devolvió exclusivamente resultados sin relación con el modelo (páginas de contenido para adultos), por lo que no se incluyen como enlaces relevantes. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
