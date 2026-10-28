# Yuyang-z/rbdj-tsc-ob30k-a-s10k

## Resumen

`rbdj-tsc-ob30k-a-s10k` es un checkpoint de un modelo de mundo (world model) vídeo-acción para robótica de manipulación, publicado por el usuario Yuyang-z en HuggingFace el 28 de octubre de 2026. Se trata de un ajuste fino supervisado (SFT) por cadenas de episodios del modelo SANA-RWM, en concreto del checkpoint `epoch_24_step_10000` (pesos en crudo) entrenado sobre el simulador RoboDojo con el robot ARX X5.

El modelo parte del preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_s15000_ws256` (epoch 4, step 30 000) y se especializa con ventanas de episodios completos de 4 a 49 chunks de 32 acciones EEF absolutas a 25 fps, tres vistas de cámara a 256×320 y latentes de LTX-2.3. La arquitectura es un transformer de dos flujos (vídeo y acción) con flow matching, condicionamiento por cámara multi-vista y atención con sub-attention, identificado en el nombre del modelo como `..._5B_P1_D36`, lo que sugiere aproximadamente 5 000 millones de parámetros con profundidad 36.

Su relevancia es acotada y experimental: interesa a quien investiga world models aplicados a robótica y planificación model-based, porque publica los pesos consolidados junto con el contrato de datos del almacén de episodios y la normalización. No obstante, es un artefacto de investigación: no declara licencia, no incluye pipeline en el Hub, no aporta benchmarks y acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos flujos (vídeo + acción) con flow matching, sub-attention, bloque de observación compartido (obs-block) y condicionamiento por cámara multi-vista; identificador `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36` (P1 = patch 1, D36 = 36 bloques) |
| Parametros totales | Aproximadamente 5 000 millones (deducido del sufijo `_5B_` del identificador; no confirmado de forma explícita en la model card) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | Ventana de episodio de 4 a 49 chunks de 32 acciones (128 a 1 568 acciones; 5,12 s a 62,72 s a 25 fps). No se documenta una longitud de contexto en tokens |
| Tipos de cuantizacion | Solo fp32 consolidado (`pytorch_model_fsdp.bin`); no se publican variantes GGUF, AWQ, GPTQ ni bf16 |
| Idiomas soportados | No disponible. Es un modelo de robótica y no se documentan idiomas; los prompts de entrenamiento son «token-group prompts» sin idioma especificado |
| Licencia | No disponible: no declarada en la model card ni en los metadatos del Hub |
| Formato de pesos | Binario PyTorch en fp32 consolidado (`model/pytorch_model_fsdp.bin`), más `metadata.pth`, `config.yaml` (receta de entrenamiento y rutas KEF), `normalization/` (sha256 `1fe3b7e7…`), `episode_chain_contract.json`, `RUN_ID.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un world model generativo de dos flujos construido sobre el linaje SANA-RWM: un flujo modela el vídeo (en el espacio de latentes de LTX-2.3) y otro modela las acciones, ambos conectados mediante un bloque de observación compartido y condicionados por cámara en configuración multi-vista (tres vistas a 256×320). El identificador añade «QwenNext» y «SubAttnRes», lo que apunta a un tronco derivado de Qwen con capas de sub-atención y conexiones residuales, y «SelfFlow» alude al esquema de flow matching auto-condicionado empleado para la generación. El muestreo se controla con dos escalas de classifier-free guidance independientes (vídeo y acción), lo que permite desacoplar la fidelidad visual de la fidelidad de la acción predicha.

El entrenamiento es un SFT por cadenas de episodios sobre el simulador RoboDojo con el robot ARX X5. Cada ventana contiene episodios completos desde su primer fotograma, con L = 4..49 chunks de 32 acciones EEF absolutas a 25 fps y tres vistas de 256×320; se usan los prompts de grupos de tokens del preentrenamiento con un dropout de instrucción de 0,1 y se aplica la normalización propia de la receta de cadenas. La cadena de dos flujos incorpora un «softmax sink horizon» de 7, es decir, un horizonte de atención tipo sink que estabiliza el rollout largo. El checkpoint publicado corresponde al epoch 24, step 10 000. No se documenta ningún stage de RLHF, DPO o preferencias, ni el número total de tokens o episodios vistos.

## Capacidades

- Predicción de vídeo condicionada por acción y por cámara: genera los fotogramas futuros de tres vistas dadas las acciones EEF, actuando como entorno aprendido.
- Predicción de acciones en el mismo modelo (world-action model): el flujo de acción permite muestrear trayectorias de 32 acciones EEF absolutas por chunk.
- Rollout de episodios largos: soporta ventanas de hasta 49 chunks (1 568 acciones, 62,72 s a 25 fps) manteniendo coherencia temporal mediante el sink horizon de 7.
- Inferencia por prefijado de prefijo limpio (`prefix_cache`): permite generar solo el último chunk del episodio dejando el prefijo ya observado como contexto limpio.
- Condicionamiento multi-vista: tres cámaras simultáneas a 256×320, con condicionamiento explícito de parámetros de cámara.
- Control fino del muestreo: video CFG 6, action CFG 1, 10 pasos de integración y flow shifts separados de 5 (vídeo) y 1 (acción).
- Especialización en un robot concreto: ARX X5 en el simulador RoboDojo, con acciones absolutas de efector final.
- No soporta tool calling ni function calling, no es un agente basado en texto, no procesa lenguaje natural de forma general y no se documentan capacidades multilingües ni de visión sobre imágenes naturales.

## Casos de uso

- Evaluación de políticas en un entorno aprendido: usar el modelo como simulador neuronal para medir el éxito de una política de manipulación sin desplegar el robot físico, aprovechando que predice tres vistas coherentes con las acciones EEF.
- Planificación model-based (MPC): muestrear candidatos de chunks de 32 acciones con el flujo de acción, simular su resultado con el flujo de vídeo y seleccionar la secuencia que maximiza una recompensa o minimiza el error respecto a un objetivo visual.
- Generación de datos sintéticos para entrenamiento: producir rollouts de episodios de hasta 62,72 s con pares vídeo-acción etiquetados para aumentar el conjunto de entrenamiento de políticas de manipulación.
- Pre-validación de trayectorias antes de ejecutar en el ARX X5 real: comprobar en el world model si una trayectoria candidata colisiona o se desvía antes de enviarla al controlador, reduciendo el desgaste y el riesgo físico.
- Investigación en world models para robótica: el repositorio incluye `episode_chain_contract.json` y `normalization/`, lo que permite reproducir el contrato de datos y las estadísticas de normalización para experimentos comparables.
- Fine-tuning sobre nuevos dominios o robots: al ser un SFT sobre un preentrenamiento identificado explícitamente, sirve como punto de partida para adaptar el modelo a otras cámaras, resoluciones o morfologías.
- Análisis de sensibilidad y ablations: los controles separados de CFG de vídeo y de acción, el número de pasos y los flow shifts permiten estudiar el compromiso entre realismo visual y precisión de la acción sin reentrenar.
- Docencia y divulgación técnica: ilustrar un pipeline completo de world model acción-condicionado con pesos abiertos, incluyendo inferencia con prefix caching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error de predicción, FVD, tasas de éxito de políticas ni comparaciones cuantitativas con otros world models.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 17,9 GB y el fichero principal es fp32 consolidado; para 5 000 millones de parámetros en fp32 el cálculo teórico ronda los 20 GB solo en pesos.
- VRAM estimada para inferencia: no disponible en la documentación. Como estimación de trabajo, se requiere al menos la memoria de los pesos más el estado de muestreo (10 pasos, doble CFG) y los latentes de tres vistas; en la práctica es razonable reservar 40-80 GB para fp32 sin optimizaciones.
- GPU recomendadas: A100 de 40 GB o 80 GB y H100 para fp32 sin conversión; no confirmado por el autor.
- GPU de consumo: en una RTX 4090 de 24 GB no cabe en fp32. Una conversión a bf16/fp16 reduciría los pesos a unos 10 GB, pero las activaciones multi-vista y el decodificador de vídeo hacen inviable afirmar que quepa sin cuantización adicional, que no está publicada.
- Opciones de despliegue: el autor indica XPolicyLab con el identificador `SANA_WAM_TSC`. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje. La conversión a safetensors no está publicada.
- Latencia y throughput: no disponibles. Como referencia de coste, cada chunk requiere 10 pasos de integración con dos flujos y dos escalas de CFG, y un episodio completo puede encadenar hasta 49 chunks.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbdj-tsc-ob30k-a-s10k | Aproximadamente 5 000 millones (según identificador) | 4-49 chunks de 32 acciones (hasta 1 568 acciones, 62,72 s) | Vídeo 3 vistas 256×320 + acciones EEF | No disponible | Pesos en HuggingFace, 0 descargas |
| SANA_Vanilla_Pretrain 256px (checkpoint base citado) | No disponible | No disponible | Vídeo two-stream + acciones | No disponible | Referenciado en la receta; no se enlaza en la model card |
| Alternativas públicas de world models para robótica (por ejemplo, modelos de la familia Cosmos o Genie) | No disponible | No disponible | Vídeo, en algunos casos acción | No disponible | No verificable con la información proporcionada |

No se dispone de datos verificables de parámetros, contexto, rendimiento ni licencia de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia de licencia: al no declararse licencia, no hay base legal explícita para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Validación comunitaria nula: 0 descargas y 0 likes, sin pipeline declarado en el Hub y con una model card de una sola sección técnica; no hay evidencia de que el checkpoint haya sido reproducido por terceros.
- Sin benchmarks: no hay métricas de calidad de predicción ni de tasa de éxito de políticas, por lo que el rendimiento real es desconocido.
- Sesgo de dominio: entrenado exclusivamente en RoboDojo con el robot ARX X5, tres vistas fijas y acciones EEF absolutas; se espera un fallo sistemático fuera de esa configuración (otras cámaras, otras morfologías, otras resoluciones).
- Brecha sim-to-real no evaluada: no se documenta ninguna validación en el robot físico, y los world models entrenados en simulación suelen degradarse por diferencias de iluminación, textura y dinámica.
- Deriva en rollouts largos: aunque el sink horizon de 7 busca estabilizar, la acumulación de error en ventanas de hasta 49 chunks es un riesgo estructural; la predicción autoregresiva de vídeo tiende a desviarse y a perder detalle.
- Resolución baja: 256×320 limita la evaluación de tareas que dependen de detalles finos (contacto, agarre preciso, objetos pequeños).
- Formato poco práctico: únicamente fp32 consolidado en `.bin`, sin safetensors ni cuantizaciones, lo que complica el despliegue y encarece la inferencia.
- Documentación mínima: el nombre del checkpoint es críptico y no se detallan datos de entrenamiento como número de episodios o tokens, composición del dataset ni criterios de selección del checkpoint.
- Idiomas: no aplica ni se documenta soporte multilingüe; los prompts de instrucción no están descritos en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Yuyang-z/rbdj-tsc-ob30k-a-s10k
- No se han encontrado enlaces relevantes adicionales en la búsqueda web: los resultados obtenidos no guardan relación con el modelo y no se incluyen.
