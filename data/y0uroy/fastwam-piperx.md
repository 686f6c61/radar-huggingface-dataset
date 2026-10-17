# y0urOy/FastWAM-PiperX

## Resumen

FastWAM-PiperX es un checkpoint de política robótica multitarea publicado por el usuario y0urOy en Hugging Face, orientado al benchmark de manipulación real RoboDojo con el robot Piper X. Se trata de una política de imitación basada en difusión que reutiliza el transformer de denoising de vídeo de Wan2.2-TI2V-5B como modelo base, con una inicialización ActionDiT compartida con la política emparejada JAM-Wan-PiperX. Cubre las seis tareas reales del benchmark: cap_pen, classify_objects, disassemble_LEGO, hang_mugs, pack_objects_into_backpack y sweep_blocks.

El modelo consume tres cámaras RGB junto con el estado articular de 14 dimensiones y una instrucción en lenguaje natural, y produce objetivos articulares absolutos (brazo y pinza izquierdos, brazo y pinza derechos). Funciona en bf16 con 10 pasos de inferencia, horizonte de acción 32 y replanificación cada 24 pasos. Se publica como baseline "FastWAM" de denoising de vídeo nativo, entrenado con los mismos episodios, normalización, inicialización y presupuesto de actualizaciones que JAM.

Su relevancia es sobre todo metodológica: ofrece un punto de comparación reproducible (semilla 42, revisión de dataset fijada, sumas SHA256) frente a la política JAM, aunque en el momento de la publicación no se han ejecutado pruebas en robot real (0 ensayos, tasa de éxito pendiente).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (ActionDiT) sobre el denoising de vídeo de Wan2.2-TI2V-5B |
| Parámetros totales | No disponible (checkpoint de 12.041.813.369 bytes; modelo base Wan2.2-TI2V-5B de 5B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política robótica; horizonte de acción 32, replan 24) |
| Tipos de cuantización | bf16 (configuración de despliegue publicada); no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0, con atribución a Wan en NOTICE; el código JAM es MIT |
| Formato de pesos | .pt (checkpoint de PyTorch) más ficheros JSON de configuración y estadísticas |

## Arquitectura y entrenamiento

FastWAM-PiperX es una política de imitación basada en difusión. Emplea un ActionDiT para generar trozos de acción (action chunks) a partir de observaciones multimodales, reutilizando el mecanismo de denoising de vídeo de Wan2.2-TI2V-5B. La inicialización ActionDiT (`ActionDiT_linear_interp_Wan22_alphascale_1024hdim.pt`) se comparte con la política JAM-Wan-PiperX y se almacena una sola vez en ese repositorio. La inferencia es determinista con la configuración fija publicada: bf16, semilla 42, 10 pasos de inferencia, horizonte de acción 32 y replanificación cada 24 pasos. Las entradas son tres cámaras RGB, el estado articular actual de 14 dimensiones y una instrucción; la salida son objetivos articulares absolutos de 14 dimensiones (brazo izquierdo 6, pinza izquierda 1, brazo derecho 6, pinza derecha 1). Los datos se grabaron a 25 Hz, si bien la cadencia del controlador y las convenciones de unidades y pinza están pendientes de confirmación por la plataforma.

El entrenamiento utilizó 540 episodios de entrenamiento y 60 retenidos, con una división 90/10 por tarea, semilla 42, batch global de 128 sobre ocho nodos GH200, durante 10 épocas y 28.630 actualizaciones. La revisión del dataset empleada es `35efbc7dedfdbeeb6e95fb749bd885d73d483e41`. El checkpoint publicado corresponde al paso `step_028630`. No se documenta en la información disponible el número total de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; no se trata de un modelo de lenguaje, por lo que esas categorías no aplican directamente.

## Capacidades

- Generación de acciones robóticas multitarea en las seis tareas reales de RoboDojo (cap_pen, classify_objects, disassemble_LEGO, hang_mugs, pack_objects_into_backpack, sweep_blocks) con una única política compartida.
- Fusión de observaciones multimodales: tres cámaras RGB más estado articular de 14 dimensiones más instrucción en lenguaje en inglés.
- Salida de objetivos articulares absolutos para un robot bimanual (14 dimensiones: dos brazos de 6 y dos pinzas de 1).
- Inferencia en bf16 con 10 pasos de difusión, horizonte de acción 32 y replanificación cada 24 pasos.
- Capacidad de condicionamiento por instrucción, aunque el idioma soportado es únicamente inglés.
- No soporta tool calling ni function calling.
- No soporta razonamiento agéntico ni multi-step reasoning de propósito general.
- No genera texto ni código; no es un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking mode), visión general, audio ni otras capacidades fuera del ámbito robótico.
- No se declaran capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en imitación y políticas de difusión: sirve como baseline de denoising de vídeo nativo para comparar contra la política JAM-Wan-PiperX bajo idénticos episodios, normalización, inicialización y presupuesto de actualizaciones, lo que permite aislar el efecto del método.
- Ensamblaje de precisión con objetos pequeños: la tarea disassemble_LEGO ejercita manipulación fina bimanual con piezas de tamaño reducido, útil para estudiar estabilidad de acción a largo horizonte (32 pasos).
- Logística y empaquetado: pack_objects_into_backpack y sweep_blocks permiten evaluar políticas de recogida y colocación en contenedores, aplicables a escenarios de almacén con objetos rígidos.
- Clasificación y ordenación de objetos: classify_objects y sweep_blocks sirven para estudiar el condicionamiento por instrucción cuando varias tareas comparten el mismo espacio de observación.
- Manipulación de vajilla y colgado: hang_mugs ejercita colocación de objetos en soportes, un patrón relevante para tareas domésticas de manipulación.
- Manipulación de piezas con ajuste (cap_pen): introduce requisitos de alineación y agarre fino que ponen a prueba la pinza y la precisión articular.
- Evaluación reproducible en benchmark: gracias a la semilla fija (42), a la revisión de dataset congelada y a las sumas SHA256, es adecuado para experimentos que requieran reproducibilidad estricta en el benchmark RoboDojo.
- Réplica y transferencia de configuraciones: la configuración de despliegue fija (10 pasos, horizonte 32, replan 24, bf16) facilita reproducir exactamente la inferencia en distintos laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que no se reclama ningún resultado oficial de leaderboard ni tasa de éxito medida. El estado de evaluación es: registro en robot real recibido el 2026-10-16, aceptación de las seis tareas, protocolo y calendario pendientes, 0 ensayos en robot real y tasa de éxito nula o pendiente. Los 240 trozos de acción fuera de línea por modelo son comprobaciones de interfaz y no ensayos robóticos. El candidato original superó comprobaciones históricas de interfaz de imagen cruda Miyabi, imagen codificada y batch, pero la instalación fresca en plataforma, los ensayos de extremo a extremo y el éxito por tarea están sin verificar.

## Requisitos de hardware

- Pesos de la política: el checkpoint ocupa 12.041.813.369 bytes (unos 12,0 GB). En bf16, solo los pesos requieren del orden de 12 GB de memoria, a los que hay que sumar los activos del modelo base Wan2.2 (VAE, codificador de texto UMT5 y tokenizador Wan2.1) y las activaciones de inferencia; el total no se especifica en la información disponible.
- Entrenamiento: ocho nodos GH200 con batch global de 128, según la model card.
- GPU recomendadas para inferencia: no se indican explícitamente; por el tamaño del checkpoint son razonables aceleradores de datacenter tipo GH200, A100 o H100, aunque no está confirmado.
- GPU de consumo: no está confirmado. Una GPU con al menos 24 GB (por ejemplo, RTX 4090 o RTX 3090 con 24 GB) podría alojar los pesos en bf16, pero el margen es ajustado al sumar los activos de Wan y no se ha verificado.
- Opciones de despliegue: no es un `AutoModel` de Transformers. Se carga mediante el adaptador incluido en el repositorio de código JAM (`integrations/robodojo`), con los scripts `setup_workspace.py`, `assets.py` y `serve.sh`. El servicio se enlaza a loopback y el acceso desde robot real usa el protocolo oficial de la plataforma. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La única cadencia conocida es que los datos se grabaron a 25 Hz, con la cadencia del controlador pendiente de confirmación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tareas | Licencia | Estado de validación |
|---|---|---|---|---|---|---|
| FastWAM-PiperX | Política de difusión (ActionDiT sobre Wan2.2) | No disponible (checkpoint de 12,0 GB) | No aplica | 6 tareas RoboDojo | Apache-2.0 (código JAM MIT) | 0 ensayos reales; éxito pendiente |
| JAM-Wan-PiperX | Política emparejada del mismo autor | No disponible | No aplica | 6 tareas RoboDojo | Apache-2.0 (código JAM MIT) | No disponible en esta información |
| Wan2.2-TI2V-5B | Modelo base de generación de vídeo texto-imagen-a-vídeo | 5B | No disponible | Generación de vídeo | Términos propios de Wan (no especificados aquí) | No aplica |

No se dispone de información sobre otras políticas comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Cero ensayos en robot real en el momento de la publicación. La tasa de éxito es nula o pendiente y no se reclama ningún resultado oficial de leaderboard.
- Las 240 comprobaciones fuera de línea por modelo son verificaciones de interfaz, no validación robótica de tareas.
- La cadencia del controlador y las convenciones de unidades y de pinza están pendientes de confirmación por la plataforma, lo que puede afectar a la ejecución real.
- El modelo solo acepta instrucciones en inglés.
- No es un modelo de lenguaje: no genera texto, código ni razonamiento, y carece de tool calling, capacidades agénticas y modo de pensamiento.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incorrectas o inseguras ante observaciones fuera de la distribución de entrenamiento, dado que no hay validación en robot real.
- Sesgos: no se documenta ningún análisis de sesgo; el modelo se limita a las seis tareas, la morfología Piper X y el entorno de recogida del dataset RoboDojo.
- Licencia: los ficheros del modelo son Apache-2.0 con atribución a Wan conservada en NOTICE, y las adiciones de código JAM son MIT. Los modelos públicos de Wan y el dataset RoboDojo conservan sus propios términos, que hay que respetar por separado.
- No se incluye el dataset de entrenamiento en bruto, ni snapshots del estado de entrenamiento, ni registros de contacto de solicitantes.
- Para cargar la política es necesario descargar por separado la inicialización ActionDiT compartida desde JAM-Wan-PiperX y los activos públicos de Wan desde revisiones fijadas; no se duplican en este repositorio.
- El repositorio ocupa 12,0 GB y requiere el runtime específico (`piperx-policy`) descrito en el repositorio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/y0urOy/FastWAM-PiperX
- Política emparejada JAM-Wan-PiperX: https://huggingface.co/y0urOy/JAM-Wan-PiperX
- Código y instrucciones de instalación para Piper X: https://github.com/y0urOy/JAM/tree/43ec97cfd46612412da454fe3a90db6d717efb87/integrations/robodojo
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/Robodojo
