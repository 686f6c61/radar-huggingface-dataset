# TEDI-AI/GLM-LORA

## Resumen

GLM-LORA es un adaptador LoRA (Low-Rank Adaptation) publicado por TEDI-AI sobre el modelo base `zai-org/GLM-OCR`, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR). El adaptador se ha entrenado para una tarea muy concreta: transcribir imágenes de testigos de sondeo (borehole logs, representaciones gráficas de perforaciones geológicas) a JSON estructurado. No se trata, por tanto, de un modelo generalista, sino de un ajuste fino orientado a un dominio técnico específico dentro de la ingeniería geológica y civil.

El adaptador emplea una configuración LoRA de rango r=16 y alpha=32 sobre el modelo base, y se ha entrenado con un conjunto de 1102 imágenes de entrenamiento y 127 de validación. El repositorio incluye checkpoints intermedios por época (`lora_epoch1`, `lora_epoch2`, `lora_epoch3`), además de un checkpoint reanudable (`ckpt/`) con estado del optimizador y scheduler. El tamaño total del repositorio es de 2,4 GB, lo que incluye tanto los pesos del adaptador como los ficheros de estado.

La relevancia de esta ficha es limitada pero clara: se trata de un ejemplo de adaptación paramétricamente eficiente (PEFT) de un modelo OCR multimodal a un dominio vertical, con métricas de validación reportadas por el autor (val_o_dung de 0,9910 en la época 3, es decir, 99,10 % de celdas correctas de forma absoluta). Es útil como referencia para quien necesite replicar el patrón de ajuste fino LoRA sobre GLM-OCR para otras tareas de extracción estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base de visión-lenguaje `zai-org/GLM-OCR`; arquitectura interna del base no disponible |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (la model card esta redactada en vietnamita; el dominio de entrenamiento son testigos de sondeo, presumiblemente con texto en vietnamita, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |
| Configuracion LoRA | r=16, alpha=32 |
| Modelo base | `zai-org/GLM-OCR` |
| Tamano del repositorio | 2,4 GB |
| Datos de entrenamiento | 1102 imagenes de train, 127 de validacion |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se construye sobre `zai-org/GLM-OCR`, un modelo de la familia GLM orientado a OCR y comprensión de documentos. La arquitectura exacta del modelo base (número de capas, dimensión oculta, mecanismo de atención, tokenizador visual) no se detalla en la información disponible. Lo que sí se especifica es la configuración del ajuste: LoRA con rango 16 y alpha 32, aplicado presumiblemente a las proyecciones de atención y/o MLP del transformer subyacente, aunque la model card no enumera los módulos objetivo.

El entrenamiento se realizó durante 3 épocas completas (414 pasos en total, según la tabla de checkpoints), con un conjunto de 1102 imágenes de testigos de sondeo y 127 de validación. La pérdida de entrenamiento descendió de 0,1702 en el paso 25 a 0,0083 al final de la época 3, mientras que la pérdida de validación bajó de 0,1799 a 0,0108. El autor reporta dos métricas específicas del dominio: `val_json_hop_le` (proporción de salidas parseables como JSON, que alcanza 1,0000 desde la época 1) y `val_o_dung` (proporción de celdas correctas de forma absoluta sobre 8 hojas de validación, que evoluciona de 0,9504 en la época 1 a 0,9910 en la época 3). No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un ajuste supervisado estándar sobre pares imagen-JSON.

Una innovación destacable, aunque no técnica en sentido estricto, es la inclusión de un checkpoint reanudable (`ckpt/`) con estado del optimizador, scheduler y posición dentro de la época, lo que facilita la continuación del entrenamiento o la experimentación con hiperparámetros. También se documenta el enlace a un panel de Weights & Biases alojado en `forge.coreweave.com`, lo que sugiere que el entrenamiento se ejecutó en infraestructura CoreWeave.

## Capacidades

- Extracción estructurada de información: convierte imágenes de testigos de sondeo (borehole logs) en JSON con celdas y valores tabulares.
- OCR especializado en documentos técnicos de ingeniería geológica y civil.
- Generación de salida JSON parseable de forma fiable (val_json_hop_le = 1,0000 en validación).
- Comprensión de layout de documentos tabulares y gráficos con estructura repetitiva.
- Capacidad multimodal heredada del modelo base GLM-OCR (visión + texto), aunque el adaptador está especializado en el dominio de perforaciones.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matemáticas avanzadas ni otros idiomas distintos del de entrenamiento.

## Casos de uso

- Digitalización de archivos geológicos: convertir escaneos de testigos de sondeo en bases de datos JSON consultables, sustituyendo la transcripción manual. El adaptador está entrenado específicamente para este formato y alcanza un 99,10 % de celdas correctas en validación.
- Integración en pipelines de exploración minera: extraer automáticamente parámetros (profundidad, litología, descripción) de informes de perforación para alimentar modelos geológicos 3D o sistemas GIS.
- Control de calidad de digitalización: usar el adaptador como verificador cruzado frente a transcripciones humanas, comparando la salida JSON del modelo con la introducida manualmente para detectar discrepancias.
- Automatización de informes técnicos: generar tablas estructuradas a partir de imágenes de sondeo para su incorporación directa a memorias de proyecto o expedientes administrativos.
- Procesamiento por lotes de archivos históricos: aplicar el adaptador sobre grandes volúmenes de escaneos almacenados en repositorios institucionales, aprovechando que la salida es JSON parseable de forma fiable.
- Base para ajustes posteriores: servir como punto de partida (checkpoint reanudable incluido) para adaptar GLM-OCR a otros formatos de documento técnico, como registros de laboratorio o partes de obra, reutilizando la configuración LoRA r=16/alpha=32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas internas de validación sobre el dominio específico:

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| train_loss | 0,0072 | 0,0047 | 0,0083 |
| val_loss | 0,0172 | 0,0119 | 0,0108 |
| val_json_hop_le | 1,0000 | 1,0000 | 1,0000 |
| val_o_dung | 0,9504 | 0,9899 | 0,9910 |

Estas cifras proceden de 8 hojas de validación (según la model card) y no son directamente comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende del modelo base `zai-org/GLM-OCR`, cuyos requisitos no se detallan en la información proporcionada. El adaptador LoRA en sí ocupa una fracción del repositorio de 2,4 GB (el resto corresponde a checkpoints y estado del optimizador).
- GPU recomendadas: no disponible. Al ser un adaptador sobre un modelo de visión-lenguaje, se requerirá una GPU con VRAM suficiente para cargar el base completo más el adaptador.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del modelo base GLM-OCR, que no se especifica.
- Opciones de despliegue: el autor documenta el uso mediante `PeftModel.from_pretrained` con `AutoModelForImageTextToText` de la librería `transformers`, cargando el subfolder correspondiente (por ejemplo, `lora_epoch3`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA sobre modelos OCR multimodales para extracción estructurada de documentos técnicos) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización extrema: el adaptador está entrenado exclusivamente para testigos de sondeo (borehole logs); su rendimiento fuera de ese dominio no está evaluado y probablemente sea deficiente.
- Dependencia del prompt: el autor advierte explícitamente que el prompt debe coincidir exactamente con el usado durante el entrenamiento (`PROMPT` en el notebook); variaciones en el prompt pueden degradar la salida.
- Validación limitada: las métricas `val_o_dung` se calculan sobre solo 8 hojas de validación, lo que reduce la significancia estadística de las cifras reportadas.
- Idiomas: la model card está en vietnamita y el conjunto de entrenamiento parece orientado a documentos en ese idioma; no se confirma soporte multilingüe.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que impide evaluar su uso comercial. Es imprescindible consultar la licencia de `zai-org/GLM-OCR` antes de cualquier despliegue en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir valores plausibles pero incorrectos en celdas con baja legibilidad o formatos atípicos; se recomienda validación humana en contextos críticos.
- Sin datos de benchmarks públicos: no es posible comparar su rendimiento con alternativas mediante métricas estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto reciente y sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/TEDI-AI/GLM-LORA
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Panel de entrenamiento (Weights & Biases, CoreWeave): https://forge.coreweave.com/wandb/vubkk67-hanoi-university-of-science-and-technology/ocr-borehole-glm/runs/bb8930c1
- Librería PEFT: https://github.com/huggingface/peft
