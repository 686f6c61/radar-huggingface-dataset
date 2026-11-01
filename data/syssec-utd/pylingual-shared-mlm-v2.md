# syssec-utd/pylingual-shared-mlm-v2

## Resumen

`syssec-utd/pylingual-shared-mlm-v2` es un modelo de lenguaje enmascarado (MLM) desarrollado por el grupo syssec-utd como backbone universal para el estudio "shared-backbone + per-version LoRA" del proyecto PyLingual. El modelo se ha entrenado sobre codigo fuente Python de las versiones 3.6 a 3.15, con el objetivo de servir como base compartida para tareas de descompilacion de bytecode Python entre versiones. Se trata de un backbone MLM, no de un modelo generativo: su funcion es producir representaciones contextuales del codigo que despues alimentan cabezas especificas por version.

El modelo se inicializa desde cero (`Initialization: None`), lo que indica un entrenamiento desde pesos aleatorios sin partir de un checkpoint preentrenado. Se entreno durante 2 epocas con un batch global de 28 (28 x 1 acumulacion x 1 GPU), learning rate 5e-05, weight decay 0, precision FP32 y semilla 20261020. El dataset de entrenamiento es `syssec-utd/pylingual-shared-encoded-v2` en su configuracion `universal/segmentation`, con 100.000 ficheros fuente y 3.120.145 filas codificadas.

La relevancia del modelo es acotada y muy especifica: es un artefacto de investigacion para descompilacion de Python multi-version, no un modelo de proposito general. El repositorio incluye un directorio `last-checkpoint/` con el ultimo checkpoint reanudable del Trainer y, en la raiz, el modelo final. La model card no proporciona informacion sobre arquitectura, numero de parametros, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLM (masked language model); detalles del backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre codigo fuente Python) |
| Licencia | other |
| Formato de pesos | no disponible (repositorio con `last-checkpoint/` y modelo final en raiz) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del backbone mas alla de que se trata de un MLM. El diseno experimental es un backbone compartido mas adaptadores LoRA por version de Python, de modo que el modelo comun captura patrones transversales del codigo Python mientras que los LoRA especializan el comportamiento para cada version (3.6 a 3.15). El modelo se entrena desde cero, sin inicializacion desde un checkpoint previo.

Los datos de entrenamiento provienen del dataset `syssec-utd/pylingual-shared-encoded-v2` (configuracion `universal/segmentation`, revision `87be6f40c315dc8d136d0df6690470edb021becd`), con 100.000 ficheros fuente y 3.120.145 filas codificadas. El tokenizer asociado tiene sha256 `61c4f9cd711448c6f71db41e93b6cbbe9fc3d0c994f3d427b0faecfd02e954df`. El entrenamiento se realizo durante 2 epocas con batch global 28, learning rate 5e-05, weight decay 0, FP32 y semilla 20261020. El fichero `run/provenance.json` registra todos los argumentos de entrenamiento y el manifiesto completo de datos. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, lo cual es coherente con un modelo MLM orientado a representaciones y no a generacion.

## Capacidades

- Modelado de lenguaje enmascarado (MLM) sobre codigo fuente Python: produce representaciones contextuales de tokens enmascarados.
- Cobertura multi-version de Python: entrenado sobre codigo de Python 3.6 a 3.15, lo que permite compartir representaciones entre versiones.
- Base para adaptadores LoRA por version: el backbone esta disenado para combinarse con modulos LoRA especificos de cada version de Python.
- Aplicable a tareas de descompilacion de bytecode Python como componente de representacion (no como generador autonomo).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a codigo fuente Python.

## Casos de uso

- Descompilacion de bytecode Python multi-version: el backbone proporciona representaciones compartidas del codigo que, combinadas con los LoRA por version, permiten abordar la descompilacion de bytecode generado por distintas versiones de Python (3.6 a 3.15) sin mantener un modelo independiente por version.
- Investigacion en arquitecturas de backbone compartido: sirve como artefacto reproducible para estudiar el equilibrio entre parametros compartidos y adaptadores especificos en tareas de codigo, gracias a la trazabilidad de datos y argumentos en `run/provenance.json`.
- Analisis estatico de codigo Python: las representaciones contextuales del MLM pueden alimentar clasificadores o cabezas de tarea para deteccion de patrones, tipos o estructuras en codigo fuente.
- Extraccion de embeddings de codigo para recuperacion: al ser un MLM entrenado sobre 100.000 ficheros fuente, puede emplearse para generar representaciones de fragmentos de codigo en tareas de busqueda o similitud, previa validacion empirica.
- Estudio de generalizacion entre versiones del lenguaje: el modelo permite medir cuanto conocimiento es transferible entre versiones de Python y cuanto requiere especializacion via LoRA.
- Base para fine-tuning supervisado en tareas de seguridad: dado el contexto del grupo syssec-utd, el backbone puede adaptarse a tareas de analisis de codigo malicioso o vulnerable, aunque no se documenta entrenamiento especifico para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el numero de parametros ni el tamano del checkpoint).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un MLM y no un modelo causal, las herramientas orientadas a generacion no son directamente aplicables.
- Latencia y throughput: no disponibles.
- Nota de entrenamiento: el modelo se entreno en 1 GPU con batch global 28 y precision FP32, lo que sugiere un requisito de memoria moderado, pero no se especifica el modelo de GPU utilizado.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables y las caracteristicas publicadas (parametros, contexto, rendimiento) son insuficientes para establecer una comparacion rigurosa con otros backbones MLM para codigo.

## Limitaciones y advertencias

- Modelo de investigacion altamente especializado: no es un modelo de proposito general ni un generador de texto; su uso previsto es como backbone de representaciones para descompilacion de Python.
- Ausencia de datos tecnicos clave: no se publican parametros, contexto, arquitectura interna ni formatos de pesos, lo que dificulta la evaluacion independiente y el despliegue.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial requiere contactar con el autor para aclarar condiciones.
- Entrenamiento desde cero con solo 2 epocas y 3,12 millones de filas: la calidad de las representaciones no esta validada por benchmarks publicados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las representaciones pueden ser poco fiables fuera de la distribucion de codigo Python 3.6-3.15.
- Cobertura limitada a Python: no se documenta soporte de otros lenguajes de programacion ni de lenguaje natural.
- Repositorio con estado mixto: el directorio `last-checkpoint/` puede contener un checkpoint intermedio distinto del modelo final de la raiz; conviene verificar que artefacto se esta utilizando.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/pylingual-shared-mlm-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v2
- Codigo del proyecto (rama `feat-shared-backbone-lora`, commit `87226a491a9ee76670601a6b3e8a37e8187241c5`): https://github.com/quinntyx/pylingual
