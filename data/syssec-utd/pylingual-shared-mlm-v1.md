# syssec-utd/pylingual-shared-mlm-v1

## Resumen

`syssec-utd/pylingual-shared-mlm-v1` es un modelo de lenguaje enmascarado (MLM) de tipo RoBERTa, desarrollado por el grupo syssec-utd, que actúa como backbone universal para el análisis de codigo Python a traves de multiples versiones del lenguaje. Forma parte de un estudio sobre la tecnica de "shared backbone + LoRA por version": un unico modelo base compartido al que se le acoplan adaptadores LoRA especificos para cada version de Python (de la 3.6 a la 3.14), dejando la 3.15 fuera del entrenamiento como conjunto de validacion. El modelo resuelve el problema de mantener un unico representacional compartido para codigo Python escrito bajo sintaxis y semanticas distintas segun la version, evitando reentrenar un modelo completo por cada una.

Arquitectonicamente es un transformer encoder de tipo RoBERTa con 109.506.864 parametros totales, entrenado con objetivo MLM sobre un corpus de 50.000 ficheros fuente de Python que se codificaron en 1.540.697 filas de tokens. El repositorio ocupa 18,4 GB, lo que sugiere que incluye no solo los pesos finales sino tambien el checkpoint resumible (`last-checkpoint/`) y artefactos auxiliares del entrenamiento.

Su relevancia actual reside en el contexto de la seguridad y el analisis estatico de codigo: un backbone MLM afinado sobre multiples versiones de Python puede servir como base para tareas de deteccion de vulnerabilidades, clasificacion de codigo o modelado de lenguaje sobre repositorios, y el enfoque de backbone compartido con LoRA por version reduce drasticamente el coste de mantenimiento frente a un modelo por version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (MLM) |
| Parametros totales | 109.506.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32 durante el entrenamiento) |
| Idiomas soportados | no disponible (corpus de codigo Python, no lenguaje natural) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un backbone RoBERTa entrenado con objetivo de modelado de lenguaje enmascarado (MLM). Se inicializa desde cero (`Initialization: None`), es decir, no parte de un checkpoint preentrenado de RoBERTa, sino que se entrena especificamente sobre codigo Python. El entrenamiento se realizo durante 2 epocas con un batch global de 28 (28 x 1 de acumulacion x 1 GPU), tasa de aprendizaje 5e-05, weight decay 0, precision FP32 y semilla 20261020. El corpus de entrenamiento es el dataset `syssec-utd/pylingual-shared-encoded-v1`, en su configuracion `universal/segmentation` y en la revision `0f70ef5ada329b652a6cd67502244db733f98109`, compuesto por 50.000 ficheros fuente de Python que producen 1.540.697 filas codificadas. El tokenizador asociado tiene sha256 `61c4f9cd711448c6f71db41e93b6cbbe9fc3d0c994f3d427b0faecfd02e954df`.

La innovacion tecnica del trabajo no esta en una arquitectura novedosa sino en el esquema de entrenamiento: un backbone compartido universal para todas las versiones de Python (3.6 a 3.14) sobre el que se montan adaptadores LoRA por version, con Python 3.15 reservado como conjunto de validacion no visto. El repositorio incluye un directorio `last-checkpoint/` con el ultimo checkpoint resumible del Trainer y, en la raiz, el modelo final. El fichero `run/provenance.json` registra todos los argumentos de entrenamiento y el manifiesto completo de datos. El codigo de entrenamiento esta en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `cb0c7b9fa5810ed5c1c09c1fe7a17c0a1eaf5606`. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO; el entrenamiento es puramente MLM supervisado.

## Capacidades

- Modelado de lenguaje enmascarado (MLM) sobre codigo Python: predice tokens enmascarados en secuencias de codigo, util para representaciones contextuales de fragmentos.
- Representacion de codigo Python multi-version: el backbone esta entrenado sobre las versiones 3.6 a 3.14, por lo que captura patrones sintacticos y semanticos comunes y especificos de cada version.
- Base para adaptadores LoRA por version: el modelo esta disenado para ser combinado con modulos LoRA especificos de cada version de Python, de modo que el backbone aporta el conocimiento compartido y el adaptador la especializacion.
- Extraccion de embeddings de codigo: al ser un encoder, puede usarse para obtener representaciones vectoriales de fragmentos de codigo para tareas posteriores (clasificacion, similitud, deteccion de anomalias).
- No soporta generacion autoregresiva de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente encoder y MLM.
- No se documentan capacidades multilingues de lenguaje natural ni capacidades de vision, audio o thinking mode.

## Casos de uso

- Analisis estatico de seguridad en codigo Python: el backbone puede alimentar clasificadores de vulnerabilidades o de patrones inseguros en fragmentos de codigo, aprovechando su entrenamiento sobre 50.000 ficheros fuente reales y su cobertura de las versiones 3.6 a 3.14.
- Deteccion de cambios de sintaxis entre versiones: al estar entrenado sobre multiples versiones, el modelo puede emplearse para identificar fragmentos de codigo incompatibles con una version objetivo, combinando el backbone con el LoRA de la version correspondiente.
- Clasificacion de codigo por version de Python: usar los embeddings del encoder para entrenar un clasificador ligero que estime bajo que version de Python fue escrito un fichero, util en migraciones y auditorias de repositorios.
- Deteccion de codigo generado o alterado: las representaciones del modelo pueden alimentar modelos de deteccion de plagio o de codigo sintetico en repositorios Python, dado el entrenamiento sobre un corpus amplio y diverso.
- Investigacion en eficiencia de adaptacion: el modelo sirve como referencia para estudiar el compromiso entre un backbone compartido y adaptadores LoRA por dominio, replicando el esquema en otros lenguajes o dominios con un coste de entrenamiento reducido.
- Base para tareas de completado de codigo enmascarado: en entornos de edicion o revision, el modelo puede predecir identificadores o expresiones enmascaradas para asistir en la correccion de fragmentos incompletos.
- Recuperacion semantica de codigo: indexar embeddings de funciones y ficheros para busqueda por similitud dentro de un repositorio o entre proyectos, usando el encoder como modelo de representacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 109,5 millones de parametros en FP32, los pesos ocupan aproximadamente 438 MB; en FP16 unos 219 MB, y en cuantizacion de 8 bits unos 110 MB. El repositorio completo de 18,4 GB incluye checkpoints y artefactos adicionales, no solo los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para inferencia en FP16 o FP32; una RTX 3060, RTX 4090, A100 o H100 son sobradamente capaces. Para entrenamiento o fine-tuning del backbone completo se recomienda al menos una GPU con 16-24 GB (RTX 4090, A100 40 GB), aunque el entrenamiento reportado se realizo en una sola GPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1060 6 GB en adelante), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Al ser un modelo RoBERTa con pesos safetensors, puede cargarse con `transformers` (clase `RobertaModel`/`RobertaForMaskedLM`), y exportarse a ONNX o a GGUF para `llama.cpp` si se convierte, aunque no se documenta soporte nativo. Para servir embeddings a escala se puede usar `text-embeddings-inference` o un servidor propio con `transformers` y `torch`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia en GPU es del orden de milisegundos por lote pequeno, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syssec-utd/pylingual-shared-mlm-v1 | 109,5 M | no disponible | MLM sobre codigo Python multi-version | other | Hugging Face |
| CodeBERT (microsoft/codebert-base) | 125 M | 512 tokens | MLM sobre codigo multi-lenguaje | MIT | Hugging Face |
| GraphCodeBERT (microsoft/graphcodebert-base) | 125 M | 512 tokens | MLM con flujo de datos | MIT | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | MLM sobre texto en ingles | MIT | Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de resultados de benchmarks del modelo de syssec-utd para comparar rendimiento numerico. La diferencia principal es la especializacion en multiples versiones de Python y el esquema de backbone compartido con LoRA por version, frente a los modelos genericos multi-lenguaje.

## Limitaciones y advertencias

- Es un modelo exclusivamente MLM: no genera texto de forma autoregresiva, no soporta chat, tool calling ni agentes; usarlo fuera de tareas de enmascarado o representacion dara resultados pobres.
- La licencia es "other": no se especifican los terminos exactos, por lo que el uso comercial requiere consultar la model card y el repositorio del autor antes de desplegarlo en produccion.
- El entrenamiento se limita a codigo Python de las versiones 3.6 a 3.14; el rendimiento sobre otros lenguajes o sobre Python 3.15 (reservado como validacion) no esta documentado.
- No hay informacion sobre sesgos, riesgo de alucinacion en tareas de prediccion de tokens ni evaluacion cualitativa; al ser un MLM, puede predecir identificadores plausibles pero incorrectos en contextos ambiguos.
- El repositorio incluye checkpoints intermedios y artefactos de entrenamiento (18,4 GB), lo que puede complicar el despliegue si se descarga completo; conviene usar solo los pesos de la raiz.
- No se documentan la longitud de contexto soportada ni el vocabulario del tokenizador, lo que limita la planificacion de pipelines con secuencias largas.
- El modelo no ha publicado benchmarks ni evaluaciones de seguridad; su uso en produccion para decisiones de seguridad deberia acompanarse de validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-mlm-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v1
- Codigo de entrenamiento: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `cb0c7b9fa5810ed5c1c09c1fe7a17c0a1eaf5606`)
