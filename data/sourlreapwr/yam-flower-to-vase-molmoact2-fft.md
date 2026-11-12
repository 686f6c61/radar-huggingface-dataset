# sourlreapwr/yam-flower-to-vase-molmoact2-fft

## Resumen

MolmoAct2 YAM flower-to-vase es un ajuste fino completo (full fine-tune) del modelo `allenai/MolmoAct2-BimanualYAM`, un modelo vision-language-action (VLA) orientado a robótica bimanual. El autor, `sourlreapwr`, lo ha entrenado sobre 21 demostraciones de teleoperación de la tarea "coger el florero izquierdo y colocarlo en el jarrón", capturadas con un robot YAM de dos brazos y tres cámaras (vista cenital y dos muñecas). El resultado es un checkpoint especializado que predice acciones motoras en lugar de texto libre, manteniendo el pipeline de inferencia original de MolmoAct2.

El modelo parte de una arquitectura transformer multimodal con torre de visión, conector, LLM, cabeza de lenguaje y un "action expert" específico para generar trayectorias. Con 5.447 millones de parámetros totales, el ajuste afecta a todos los componentes (LLM, torre de visión, conector, LM head y action expert) sin usar LoRA. Se entrenó con FSDP2 en bf16 sobre 6 GPUs A100, con 6.000 pasos y un batch global de 36.

Su relevancia es acotada pero clara: demuestra el flujo completo de adaptación de MolmoAct2 a una tarea robótica concreta con un dataset pequeño, incluyendo correcciones sobre las estadísticas de normalización del dataset original y un parche al código oficial para muestrear solo fotogramas de decisión. Es un artefacto de investigación reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language-action (MolmoAct2: torre de vision + conector + LLM + LM head + action expert) |
| Parametros totales | 5.447.439.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato HF original de MolmoAct2, con `norm_stats.json`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint `allenai/MolmoAct2-BimanualYAM` (revision `8dcbed66f2380e4393189c303ea72488eb9e63c2`). La arquitectura sigue el esquema VLA de MolmoAct2: una torre de visión procesa tres cámaras (`observation.images.top`, `.left`, `.right`), un conector proyecta las características visuales al espacio del LLM, y un action expert genera trozos de acción de 30 pasos a 30 Hz. El espacio de estado/acción es de 14 dimensiones: `[L j1..j6, L grip, R j1..j6, R grip]` como objetivos articulares absolutos, con `grip 1 = open`.

El entrenamiento usó el código oficial de MolmoAct2 (`allenai/molmoact2` en el commit `c228282`, script `experiments/launch_scripts/train_lerobot.py`) con FSDP2 y bf16. Se usaron tasas de aprendizaje diferenciadas: 1e-5 para el LLM, 5e-6 para la torre de visión y el conector, y 5e-5 para el action expert, con 200 pasos de warmup. El batch global fue de 36 (2 por GPU × 6 A100 × 3 de acumulación), durante 6.000 pasos. Solo se muestrearon fotogramas de decisión (cada quinta fila de las 30 Hz en las que las cámaras registraron imagen): 2.687 de 13.435. La normalización usó cuantiles q01-q99 recalculados como cuantiles globales verdaderos, ya que el `stats.json` original promediaba cuantiles por episodio y resultaba 0,4 veces demasiado estrecho. La pérdida final de flujo de acción fue 0,0017 en el paso 6.000.

## Capacidades

- Generación de acciones robóticas bimanuales: predice chunks de 30 pasos a 30 Hz para 14 dimensiones (12 articulaciones + 2 pinzas).
- Percepción visual multi-cámara: consume simultáneamente vista cenital y ambas muñecas.
- Ejecución de una tarea específica de manipulación: "Pick up left flower and place into vase".
- Control de pinzas: representación de apertura/cierre mediante el valor de grip (1 = abierto).
- Integración con el pipeline de inferencia de MolmoAct2 (script de inferencia YAM del laboratorio).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas ni multilingüismo; el ajuste está orientado exclusivamente a la política robótica.

## Casos de uso

- Investigación en manipulación bimanual: servir como checkpoint de referencia para reproducir la tarea flower-to-vase con un robot YAM y comparar recetas de ajuste fino.
- Evaluación de recetas de full fine-tune frente a LoRA: el autor documenta explícitamente que se ajustaron todos los módulos, lo que permite comparar estabilidad y pérdida frente a alternativas parametrizadas.
- Validación de pipelines de normalización: el recálculo de cuantiles globales frente a los promediados por episodio es un caso práctico para depurar `norm_stats.json` en otros datasets LeRobot.
- Muestreo de fotogramas de decisión: el parche al código oficial para seleccionar solo filas con imagen es reutilizable en datasets de teleoperación con desalineación temporal entre cámaras y acciones.
- Reproducción con presupuesto moderado: el entrenamiento cabe en 6 A100 con FSDP2 y bf16, un escenario realista para laboratorios académicos.
- Base para transferencia a tareas similares: al ser un full fine-tune sobre MolmoAct2, puede servir de punto de partida para otras tareas de pick-and-place con el mismo robot y configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de flujo de acción: 0,0017 en el paso 6.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.447 millones de parámetros en bf16, el peso ronda los 10,9 GB, a lo que hay que sumar activaciones y buffers de visión.
- GPU recomendadas: el autor entrenó con 6 × A100; para inferencia se recomienda al menos una A100 o equivalente con memoria suficiente para el checkpoint y las tres cámaras.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos podría intentarse en GPUs de 24 GB (RTX 3090/4090) en bf16, pero no hay datos publicados de que el pipeline completo de MolmoAct2 con tres cámaras quepa sin cuantización.
- Opciones de despliegue: el autor indica cargarlo como `allenai/MolmoAct2-BimanualYAM`, usando el script de inferencia YAM del laboratorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La política genera chunks de 30 pasos a 30 Hz, lo que fija la frecuencia de control en 30 Hz, pero no se reportan tiempos de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sourlreapwr/yam-flower-to-vase-molmoact2-fft | 5.447 M | no disponible | VLA bimanual YAM, tarea única | no disponible | Hugging Face (0 descargas) |
| allenai/MolmoAct2-BimanualYAM | no disponible | no disponible | VLA bimanual YAM base | no disponible | Hugging Face (modelo base) |
| Alternativas VLA de propósito general (p. ej. familias OpenVLA, π0) | no disponible | no disponible | VLA genéricas | no disponible | no disponible |

La comparación cuantitativa con otras familias VLA no está disponible en la información proporcionada. La única comparación directa posible es con su modelo base, del que este checkpoint hereda arquitectura y pipeline de carga.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea ("Pick up left flower and place into vase") y no generalizará a otras tareas sin reentrenamiento.
- Dataset muy pequeño: solo 21 demostraciones de teleoperación y 2.687 fotogramas de decisión, lo que limita la robustez frente a variaciones de iluminación, posiciones iniciales u objetos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base `allenai/MolmoAct2-BimanualYAM`.
- Idiomas no disponibles: al ser un modelo de acciones, la dimensión lingüística no está documentada.
- Riesgo de sobreajuste a la configuración de cámaras: la orientación de la muñeca derecha se invirtió para coincidir con el dataset; usar otra configuración física puede degradar el rendimiento.
- Dependencia de código personalizado: requiere `custom_code` y el parche del autor para el muestreo de fotogramas; no es un checkpoint plug-and-play con `transformers` estándar.
- Sin benchmarks públicos ni descargas: no hay evidencia externa de rendimiento en el mundo real más allá de la pérdida de entrenamiento.
- Normalización sensible: el autor corrige las estadísticas del dataset; reutilizar el `stats.json` original produciría acciones mal escaladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourlreapwr/yam-flower-to-vase-molmoact2-fft
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Código oficial de MolmoAct2: https://github.com/allenai/molmoact2
- Dataset de entrenamiento: `0010SS/flower_to_vase_v1` (referenciado en la model card; no se proporciona URL directa)
