# zhengfeirao/2026-09-06-smolvla-agibot-g2a-20k

## Resumen

SmolVLA fine-tuned on AgiBot G2A (2026-09-06, 20k steps) es un checkpoint de politica robótica Vision-Language-Action (VLA) publicado por el usuario zhengfeirao en HuggingFace. Se trata de un ajuste fino de `lerobot/smolvla_base` durante 20.000 pasos sobre 29 demostraciones teleoperadas grabadas en un robot bimanual AgiBot G2A equipado con pinzas CTEK90D. El modelo consume tres vistas de cámara (cabeza y dos muñecas), el estado propioceptivo de 16 dimensiones y una instrucción en lenguaje natural, y emite un chunk de 50 acciones continuas de 16 dimensiones.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de propósito general, sino un artefacto de investigación mono-tarea. La única instrucción utilizada durante el entrenamiento es `用右手把营养快线放在深色的本子上` ("poner la botella sobre el cuaderno oscuro con la mano derecha"). El modelo hereda la arquitectura SmolVLA de 450.046.176 parámetros, con el codificador visual y el backbone VLM (`HuggingFaceTB/SmolVLM2-500M-Video-Instruct`) congelados, de modo que solo se entrenaron el expert de acciones de 16 capas, la proyección de estado y las proyecciones de entrada/salida de acciones (aproximadamente 100 M parámetros entrenables).

El interés técnico radica en que demuestra el flujo completo de LeRobot 0.6.1 con formato de dataset v3.0 sobre hardware de consumo: 20.000 pasos con batch 16 y precisión BF16 se completaron en unos 64 minutos en una única RTX 5090 de 32 GB, con una pérdida final de entrenamiento de 0.013. El autor advierte que ese valor no equivale a tasa de éxito y que el checkpoint no ha sido evaluado en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con objetivo de flow matching; attention_mode `cross_attn`; 16 capas VLM + 16 capas de expert; `expert_width_multiplier` 0.75 (VLM hidden 960 / expert hidden 720) |
| Parametros totales | 450.046.176 (500 tensores, mayoritariamente BF16) |
| Parametros activos | No aplica: modelo denso, no es MoE. Aproximadamente 100 M parametros entrenables en el fine-tuning (expert, proyeccion de estado y proyecciones de accion) |
| Longitud de contexto | 48 tokens de lenguaje (`tokenizer_max_length: 48`, `pad_language_to: max_length`) |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos BF16 en safetensors; no se publican variantes GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | Etiquetado como `zh` y `en`, pero entrenado con una unica instruccion en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16). Incluye `policy_preprocessor_step_5_normalizer_processor.safetensors` y `policy_postprocessor_step_0_unnormalizer_processor.safetensors` con las estadisticas de normalizacion |
| Backbone VLM | `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` (congelado, no incluido en el repositorio) |
| Tamano del repositorio | 0,9 GB |
| Framework | LeRobot 0.6.1, formato de dataset v3.0, PyTorch 2.8.0+cu128 |
| Tipo de robot | `agibot_g2a_ctek90d` (AgiBot G2A bimanual con pinzas CTEK90D) |
| Chunk de acciones | 50 acciones por inferencia (`chunk_size` 50, `n_action_steps` 50), 10 pasos de denoising |
| Dimensiones de estado/accion | 16 reales, rellenadas internamente hasta 32 (`max_state_dim` / `max_action_dim` 32) |
| Resolucion de imagen | Redimensionado con padding a 512 x 512; entradas originales 3x400x640 (cabeza) y 3x1056x1280 (cada muneca) |

## Arquitectura y entrenamiento

SmolVLA es un transformer VLA compacto entrenado con un objetivo de flow matching. La pila combina un backbone de vision-lenguaje SmolVLM2-500M con un "expert" de acciones de 16 capas que se conecta mediante atencion cruzada (`attention_mode: cross_attn`), con un ancho de expert reducido a 0.75 veces el del VLM. En este checkpoint, siguiendo la receta oficial de SmolVLA, el codificador visual y el backbone VLM permanecen congelados (`freeze_vision_encoder: true`, `train_expert_only: true`); solo se actualizan el expert de acciones, la proyeccion de estado y las proyecciones de entrada y salida de acciones. El modelo internamente rellena estado y accion de 16 a 32 dimensiones.

Los datos de entrenamiento consisten en 29 episodios teleoperados, todos ellos demostraciones exitosas, con 6.710 fotogramas a 30 FPS y tres vistas (cabeza, muneca izquierda, muneca derecha). El reparto es completamente de entrenamiento (`eval_split: 0.0`), por lo que no existe conjunto de validacion. Se configuraron aumentos de imagen (ColorJitter, Sharpness, RandomAffine) pero quedaron desactivados (`image_transforms.enable: false`). No hay canal tactil ni transformaciones tipo Aloha/pi: se usan posiciones articulares absolutas (`adapt_to_pi_aloha: false`, `use_delta_joint_actions_aloha: false`) y normalizacion `MEAN_STD` deshecha en inferencia por el postprocesador incluido. El entrenamiento se ejecuto 20.000 pasos con batch 16, learning rate 1e-4, BF16 y AMP en una RTX 5090 de 32 GB, con una perdida final de 0.013. No se documento ningun uso de RLHF, DPO ni decodificacion especulativa, ni se detalla la composicion del dataset mas alla de las 29 demostraciones.

## Capacidades

- Generacion de acciones motoras continuas: produce chunks de 50 acciones de 16 dimensiones para un robot bimanual, a partir de imagenes multi-vista, estado propioceptivo y una instruccion textual.
- Imitacion de una tarea especifica de pick-and-place: colocar una botella ("营养快线") sobre un cuaderno oscuro con la mano derecha.
- Percepcion multi-camara: procesa simultaneamente vista de cabeza y dos vistas de muneca con resoluciones asimetricas.
- Condicionamiento por lenguaje: acepta una instruccion en lenguaje natural como entrada, aunque en la practica solo se entreno con una.
- Anticipacion de trayectoria: el chunking de 50 acciones y los 10 pasos de denoising permiten emitir una secuencia motora sin re-inferencia por paso.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; es una politica reactiva de control motor, no un agente de razonamiento.
- Capacidades multilingues: funcionalmente solo chino para la instruccion de la tarea; el etiquetado `en` refleja los idiomas del backbone, no un entrenamiento bilingue de la politica.
- Capacidades especiales: no dispone de modo de razonamiento explicito, vision generativa, audio ni canal tactil.

## Casos de uso

- Reproduccion controlada de la tarea objetivo en laboratorio: cargar el checkpoint en LeRobot, alimentar las tres camaras y el vector de estado de 16 dimensiones, y verificar el chunk de 50 acciones antes de enviarlo a los actuadores del AgiBot G2A. Es el uso previsto por el autor y el unico escenario para el que existen datos de entrenamiento.
- Punto de partida para fine-tuning en otros robots bimanuales: al mantener congelados vision y VLM y entrenar solo unas 100 M de parametros, sirve como inicializacion barata para nuevas tareas con otra cinematica de 16 dimensiones, ajustando el mapeo de articulaciones.
- Validacion de pipelines LeRobot 0.6.1 y formato de dataset v3.0: el repositorio incluye pre y postprocesadores que ejercitan la ruta completa de normalizacion `MEAN_STD`, util para probar una instalacion o una actualizacion de version antes de invertir en datasets grandes.
- Benchmark interno de infraestructura de entrenamiento: el registro de 20.000 pasos, batch 16, BF16 y unos 64 minutos en una RTX 5090 permite calibrar rendimiento (aproximadamente 83 muestras por segundo) y comparar con otras GPU.
- Docencia y divulgacion sobre VLA compactos: con 450 M de parametros y 0,9 GB de repositorio, es un ejemplo manejable para explicar flow matching aplicado a control motor, chunking de acciones y congelacion de backbone.
- Recogida de datos teleoperados y comparacion de politicas: usar este checkpoint como linea base cuantitativa al recolectar nuevas demostraciones con las mismas tres vistas y la misma instruccion.
- Investigacion sobre robustez de instrucciones: evaluar si el modelo responde a variantes de la instruccion (otro recipiente, otra mano, otro objeto de destino) para medir su grado de sobreajuste linguistico.
- Pruebas de despliegue en el robot fisico con pinzas CTEK90D, siempre con supervision humana y con el aviso de que el checkpoint no ha sido evaluado en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de robotica como tasa de exito, y el autor indica explicitamente que la perdida final de entrenamiento (0.013) no es una tasa de exito de tarea. Tampoco se proporciona ningun conjunto de evaluacion, ya que `eval_split` es 0.0.

Unico dato de rendimiento verificable: el entrenamiento de 20.000 pasos con batch 16 se completo en aproximadamente 64 minutos en una RTX 5090 de 32 GB en BF16, lo que equivale a unas 320.000 muestras procesadas y del orden de 83 muestras por segundo.

## Requisitos de hardware

- VRAM para inferencia (estimacion, no confirmada por el autor): los pesos del checkpoint (450 M de parametros en BF16) ocupan aproximadamente 0,9 GB, a los que se suma el backbone `SmolVLM2-500M-Video-Instruct`, que no esta incluido en el repositorio y debe descargarse aparte. Con las resoluciones de imagen indicadas (dos vistas de 1056 x 1280 y una de 400 x 640) y el redimensionado a 512 x 512, una estimacion prudente es de 4 a 8 GB de VRAM en BF16; conviene reservar al menos 8-12 GB para margen.
- GPU recomendadas: el autor entreno en una RTX 5090 de 32 GB. Para inferencia, cualquier GPU con 8-12 GB o mas deberia ser suficiente; A100, H100 y L40S ofrecen margen de sobra.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5080 y RTX 5090. En tarjetas de 8 GB el margen es ajustado debido a las imagenes de alta resolucion de las camaras de muneca.
- Despliegue: la ruta soportada es LeRobot (`pip install "lerobot[smolvla]"`) con PyTorch 2.8.0+cu128 y `SmolVLAPolicy.from_pretrained`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a una politica de control motor con este formato.
- Avisos de portabilidad: `config.json` y `policy_preprocessor.json` codifican `"device": "cuda"` en duro, por lo que en maquinas sin GPU hay que sobrescribir el dispositivo antes de cargar. Ademas, hay que conservar el directorio completo: copiar solo `model.safetensors` no funciona porque faltan los procesadores de normalizacion y desnormalizacion.
- Latencia y throughput de inferencia: no disponible. La model card declara `inference: false` y no publica tiempos de inferencia ni frecuencia de control en bucle cerrado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (zhengfeirao/2026-09-06-smolvla-agibot-g2a-20k) | 450.046.176 (unos 100 M entrenables en el fine-tuning) | 48 tokens de lenguaje | Pick-and-place mono-tarea en AgiBot G2A | Apache 2.0 | Publicado en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| lerobot/smolvla_base | 450.046.176 segun la model card | 48 tokens de lenguaje (misma configuracion heredada) | Politica VLA generalista de partida para fine-tuning | Apache 2.0 (inherited) | Publico en HuggingFace; revision `c83c3163b8ca9b7e67c509fffd9121e66cb96205` |
| Otras politicas VLA de la familia SmolVLA / LeRobot | No disponible en la informacion proporcionada | No disponible | Manipulacion robotica | No disponible | No disponible |
| Alternativas de mayor tamano (p. ej. familias tipo OpenVLA o pi0) | No disponible en la informacion proporcionada | No disponible | Manipulacion robotica general | No disponible | No disponible |

Nota: los datos de las filas marcadas como no disponibles no aparecen en la informacion proporcionada, por lo que no se incluyen cifras que no puedan contrastarse. La comparacion directa y verificable es unicamente contra `lerobot/smolvla_base`, del que este checkpoint hereda arquitectura, licencia y configuracion.

## Limitaciones y advertencias

- Mono-tarea y mono-instruccion: el modelo se entreno con exactamente una frase en chino. No hay evidencia de que generalice a otras ordenes, objetos, manos o destinos.
- Sobreajuste previsible: 29 episodios, 6.710 fotogramas y cero datos de validacion (`eval_split: 0.0`). Cualquier metrica de generalizacion seria no verificable con este repositorio.
- Sin evaluacion en hardware real: el autor indica explicitamente que el checkpoint no ha sido evaluado en el robot fisico. La perdida de entrenamiento de 0.013 no es una tasa de exito de tarea.
- Estado: linea base de investigacion, no producto validado. No deberia usarse en entornos productivos ni en robots que operen cerca de personas sin supervision.
- Dependencia de hardware muy especifica: el mapeo de las 16 dimensiones (articulaciones de brazo izquierdo, brazo derecho y pinzas) y las resoluciones de camara estan fijados al AgiBot G2A con pinzas CTEK90D y al montaje concreto de las camaras. Trasladarlo a otro robot requiere reentrenar y reconstruir el vector de estado.
- Sin transformaciones de normalizacion tipo Aloha/pi: se usan posiciones articulares absolutas con normalizacion `MEAN_STD`. Cualquier cambio en las unidades o en los signos del robot invalida las estadisticas guardadas.
- Formatos de despliegue limitados: solo pesos BF16 en safetensors. No hay cuantizaciones ligeras, lo que descarta despliegues en CPU o en dispositivos embebidos de baja capacidad.
- No se puede reanudar el entrenamiento: el checkpoint contiene unicamente pesos de inferencia, sin estado de optimizador ni de scheduler.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar trayectorias plausibles pero fisicamente invalidas ante entradas fuera de distribucion (iluminacion distinta, objeto ausente, oclusion de camaras). Se recomienda validacion previa en simulacion y limites de par y de espacio de trabajo en el controlador.
- Sesgos: no se documenta analisis de sesgo. El dataset procede de un unico operador humano, un unico entorno y probablemente una unica iluminacion, por lo que el modelo heredara esos sesgos de escena y de estilo de teleoperacion.
- El contenido de la seccion "Limitations" de la model card original aparece truncado en la informacion disponible; podrian existir advertencias adicionales del autor que no se han podido recuperar.
- Licencia Apache 2.0: permite uso comercial, pero el backbone SmolVLM2 y su tokenizer se distribuyen por separado y hay que verificar sus propios terminos. Ademas, el modelo base `lerobot/smolvla_base` debe citarse segun corresponda.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a emisoras de radio en frances y no guardan relacion con el contenido. No se ha encontrado documentacion externa, evaluacion independiente ni reproducciones por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhengfeirao/2026-09-06-smolvla-agibot-g2a-20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base (revision `c83c3163b8ca9b7e67c509fffd9121e66cb96205`)
- Backbone VLM (no incluido en el repositorio): https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot 0.6.1 sobre la politica SmolVLA: no disponible en la informacion proporcionada (se infiere del identificador de framework de la model card)
- Demos, blogs o evaluaciones independientes: no disponible. La busqueda web no arrojo resultados relacionados con el modelo.
