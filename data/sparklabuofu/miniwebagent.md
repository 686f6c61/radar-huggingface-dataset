# sparklabuofu/MiniWebAgent

## Resumen

MiniWebAgent executor es un adaptador LoRA de rango 64 sobre el modelo multimodal Qwen3.5-4B, publicado por el usuario sparklabuofu (proyecto MiniWeb) bajo licencia Apache 2.0. No es un modelo autónomo: es el componente "ejecutor" de un sistema de dos niveles en el que el Qwen3.5-4B sin entrenar actúa como planificador y este adaptador ejecuta habilidades web primitivas (rellenar un formulario, mover un slider, dibujar una firma, subir un fichero) sobre la misma sesión de navegador. El problema que aborda es el de los agentes de navegador de extremo a extremo, que fallan en interacciones de bajo nivel cuando el modelo no ha sido entrenado específicamente para ellas.

La propuesta técnica consiste en separar la descomposición de la tarea (planificador) de la ejecución de cada primitiva (ejecutor entrenado), de modo que el adaptador se especializa en 27.646 pasos de entrenamiento derivados de trayectorias sintéticas verificadas sobre 52 sitios de MiniWeb, sin tocar la torre de visión. El resultado declarado por los autores es un aumento del éxito en tareas completas del 45,2 % al 58,1 % en MiniWeb held-out, y mejoras también en WebArena-Lite, WebVoyager y Online-Mind2Web, benchmarks sobre los que no se entrenó.

Es relevante ahora porque demuestra que un adaptador pequeño y barato de entrenar (unas 5,5 horas en 4 GPU) sobre un modelo de 4B puede cerrar parte de la brecha con agentes web de mayor tamaño, siempre que se le entregue el contexto exacto del arnés de browser-use y se le acompañe de un planificador. El repositorio ocupa 2,7 GB e incluye checkpoints de ablación en el directorio `ablations/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal Qwen3.5-4B; se entrenan proyecciones de atención de las capas de atención completa y proyecciones MLP de todas las capas |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base Qwen3.5-4B; el adaptador LoRA tiene rango 64 y alpha 128 (número exacto de parámetros entrenables no disponible) |
| Parametros activos | No aplica: el modelo base es denso, no MoE (no se detalla en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador, que se publica en safetensors sin cuantizar; la cuantización aplicaría al modelo base y depende del runtime empleado |
| Idiomas soportados | Inglés (instrucciones de entrenamiento y evaluación en inglés); no se declaran otros idiomas en la model card |
| Licencia | Apache 2.0 (igual que el modelo base) |
| Formato de pesos | Safetensors, formato de adaptador LoRA cargable con PEFT o servible con vLLM |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un modelo image-text-to-text con torre de visión que aquí queda congelada: solo se entrenan las proyecciones de atención de las capas de atención completa y las proyecciones MLP de todas las capas, con rango 64, alpha 128 y dropout 0,05. El ejecutor consume el prompt de agente de browser-use (system prompt, tarea, memoria del agente, elementos interactivos indexados y captura de pantalla) y responde con su memoria actualizada y una única acción. El modo de razonamiento está desactivado de forma explícita: la plantilla de chat renderiza un bloque `<think></think>` vacío.

Los datos proceden de la tabla `training_steps` del dataset MiniWeb: 27.646 pasos con `is_target` y sin `validation`, que comprenden 3.128 trayectorias verificadas de una sola primitiva sobre los 52 sitios de entrenamiento, 857 cadenas de dos trayectorias y 629 trayectorias con un error inyectado y corregido, reproducidas a través del arnés del agente con el modelo base escribiendo la memoria de cada paso. La receta es una época, AdamW, tasa de aprendizaje 1e-4 con 3 % de warmup y decaimiento coseno, 8 pasos por actualización del optimizador y entropía cruzada sobre todo el objetivo (memoria y acción), en 4 GPU durante aproximadamente 5,5 horas. Los ficheros `training_meta.json` y `train_log.jsonl` del repositorio contienen la configuración y la curva de pérdida.

## Capacidades

- Ejecución de primitivas web de bajo nivel: rellenar campos de formulario, ajustar sliders, dibujar firmas, subir ficheros y otras interacciones sobre elementos indexados de la página.
- Percepción visual de la página mediante la captura de pantalla que acompaña al prompt, sin reentrenamiento de la torre de visión.
- Producción de memoria de agente y de una acción por paso, en el formato esperado por el arnés de browser-use.
- Encadenamiento de dos primitivas dentro de una misma trayectoria (las 857 cadenas de dos trayectorias del conjunto de entrenamiento).
- Recuperación de errores inyectados: el conjunto incluye 629 trayectorias con un fallo y su corrección.
- Cooperación con un planificador (el Qwen3.5-4B sin adaptador) que descompone la tarea en instrucciones de nivel primitiva; los pasos que solo leen la página quedan en el modelo base.
- Soporte de múltiples adaptadores servidos simultáneamente en vLLM, con selección por familia de habilidad (especialistas `drag`, `io`, `select`, `rest`, `reasoning` y el adaptador principal como fallback).
- No dispone de modo de razonamiento activo, ni de capacidades de audio, ni de tool calling genérico declaradas en la información disponible.

## Casos de uso

- Automatización de formularios web internos: el ejecutor rellena campos, selecciona opciones y envía formularios en intranet o back-office, apoyándose en el planificador para decidir el orden de los campos dentro de tareas de varios pasos.
- Pruebas de extremo a extremo de interfaces: integrado en una batería de CI, ejecuta acciones reales sobre un navegador y valida que sliders, drag-and-drop y subidas de fichero responden, cubriendo los flujos que los selectores frágiles suelen romper.
- Firma y aceptación de documentos electrónicos: la primitiva de dibujo de firma permite completar flujos de contratación o consentimiento donde la interacción es un trazo sobre canvas y no un clic.
- Carga de evidencias y adjuntos: subida de ficheros en portales administrativos o de soporte, donde el paso crítico es localizar el input de tipo file y confirmar la selección.
- Configuración guiada de paneles con controles continuos: ajuste de sliders y selectores en herramientas de analítica o de configuración, con el planificador traduciendo el objetivo del usuario a una secuencia de movimientos precisos.
- Agente de navegador con separación planificador/ejecutor: despliegue del sistema completo (Qwen3.5-4B como planificador y este adaptador como ejecutor) para tareas largas que mezclan lectura de página y manipulación, manteniendo el coste de cómputo bajo por paso.
- Investigación en agentes GUI: uso de los checkpoints de `ablations/` como línea base reproducible para estudiar el efecto de datos task-centric frente a datos de primitivas, o del control `no_done` para medir el problema de la parada prematura.

## Benchmarks y rendimiento

Éxito en tarea (%), según la Tabla 3 del paper citado en la model card. MiniWeb held-out corresponde a 62 tareas humanas de 13 sitios no vistos, sin datos de entrenamiento; los otros tres benchmarks tampoco se usaron en entrenamiento.

| Configuracion | MiniWeb held-out | WebArena-Lite | WebVoyager | Online-Mind2Web |
|---|---|---|---|---|
| Agente único sin entrenar | 38,7 | 27,1 | 45,5 | 17,9 |
| Planificador sin entrenar + ejecutor sin entrenar | 45,2 | 30,7 | 59,9 | 21,8 |
| MiniWebAgent (planificador sin entrenar + este ejecutor) | 58,1 | 36,4 | 65,5 | 33,9 |

Resultados adicionales declarados:

| Configuracion | MiniWeb held-out |
|---|---|
| Ejecutor principal como agente único | 39,2 |
| Ejecutor principal en las 103 tareas sintéticas de una primitiva de sitios held-out | 80,3 (frente a 55,3 sin entrenar) |
| Ablación `task_centric` (mismo tamaño, trayectorias task-centric) | 47,8 |
| Especialistas por familia de habilidad | 52,7 |
| Ablación `no_done` como agente único | 34,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 4B en BF16 ocupa del orden de 8 GB solo en pesos; con caché KV, procesamiento de imágenes y el adaptador LoRA, un despliegue con vLLM requiere estimaciones de 16 a 24 GB para trabajar con holgura. Cifra orientativa, no publicada por los autores.
- Cuantización a 4 bits: los pesos bajarían a unos 3-4 GB, lo que permitiría ejecución en GPU de consumo con 8-12 GB, siempre que el runtime soporte adaptadores LoRA sobre pesos cuantizados. No confirmado en la información disponible.
- GPU recomendadas: para servir con vLLM en producción, una A100 o L40S de 40-48 GB permite varias instancias y margen de contexto; una RTX 4090 de 24 GB es suficiente para una instancia en BF16.
- GPU de consumo: sí cabe, en tarjetas de 12 GB o más con cuantización y en 16-24 GB en precisión nativa reducida; el adaptador en sí ocupa una fracción pequeña del repositorio de 2,7 GB.
- Entrenamiento: la receta se ejecutó en 4 GPU durante aproximadamente 5,5 horas, con 8 pasos por actualización del optimizador y rango 64.
- Opciones de despliegue: vLLM con soporte LoRA multi-adaptador (`MAX_LORA_RANK=64`, `LORA_MODULES=...`) mediante el script `src/miniwebagent/scripts/serve.sh`; carga directa con PEFT mediante `PeftModel.from_pretrained(base_model, "sparklabuofu/MiniWebAgent")`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste real por paso incluye una llamada al planificador y otra al ejecutor, más la captura de pantalla del navegador.

## Comparativa con modelos similares

No se dispone de resultados de modelos externos comparables en la información proporcionada. La comparación posible es interna, entre las variantes publicadas por los propios autores, todas con el mismo modelo base y la misma forma de LoRA:

| Variante | Datos de entrenamiento | Params. base | Contexto | MiniWeb held-out | Licencia |
|---|---|---|---|---|---|
| Ejecutor principal (raíz) | 27.646 pasos de MiniWebGen | Qwen3.5-4B (~4B) | No disponible | 58,1 | Apache 2.0 |
| `ablations/task_centric` | Trayectorias task-centric, pipeline tipo InSTA sobre los 52 sitios | Qwen3.5-4B (~4B) | No disponible | 47,8 | Apache 2.0 |
| `ablations/specialists/*` | Un especialista por familia, con penalización KL hacia el principal | Qwen3.5-4B (~4B) | No disponible | 52,7 | Apache 2.0 |
| `ablations/no_done` | Receta principal sin el paso final `done` | Qwen3.5-4B (~4B) | No disponible | 34,4 | Apache 2.0 |

Como referencia de categoría, los agentes web generalistas de extremo a extremo citados en la propia tabla (sin entrenamiento específico) obtienen 38,7 en MiniWeb held-out, 27,1 en WebArena-Lite, 45,5 en WebVoyager y 17,9 en Online-Mind2Web.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente sobre los sitios sintéticos de MiniWeb y con instrucciones en inglés; no hay evidencia de generalización a sitios reales arbitrarios ni a otros idiomas.
- Está especializado en primitivas de un solo paso: como agente único tiende a detenerse antes de alcanzar las habilidades aprendidas (39,2 % frente a 58,1 % con planificador), por lo que su uso sin planificador degrada el rendimiento.
- Depende de un formato de prompt muy concreto (system prompt, tarea, memoria, elementos indexados y captura de pantalla de browser-use); cambiar el arnés o el esquema de elementos puede invalidar el comportamiento aprendido.
- El modo de razonamiento está desactivado por diseño; no debe esperarse cadena de pensamiento del ejecutor.
- La torre de visión no se entrena, de modo que los errores de percepción del modelo base se propagan sin corrección.
- Riesgo de alucinación de acciones: el modelo puede emitir acciones sobre índices de elementos inexistentes o ya obsoletos tras un cambio de DOM; el sistema necesita validación y reintentos en producción.
- No se han publicado evaluaciones de sesgos, robustez frente a prompt injection en páginas web ni comportamiento ante contenido adversario.
- Licencia Apache 2.0, permisiva para uso comercial, heredada del modelo base; conviene verificar los términos del modelo base Qwen3.5-4B por si imponen condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados declarados.
- No se documentan requisitos de latencia ni coste por tarea, datos relevantes si el sistema se usa en producción a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparklabuofu/MiniWebAgent
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset MiniWeb: https://huggingface.co/datasets/sparklabuofu/MiniWeb
- Código, benchmark y setup: https://github.com/miniweb-site/MiniWeb
- Arnés de agente browser-use: https://github.com/browser-use/browser-use
- Paper con la Tabla 3: no disponible (citado en la model card sin enlace)
