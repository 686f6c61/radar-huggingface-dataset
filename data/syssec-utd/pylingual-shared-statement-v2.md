# syssec-utd/pylingual-shared-statement-v2

## Resumen

`syssec-utd/pylingual-shared-statement-v2` es un modelo de la familia CodeT5, inicializado a partir de `Salesforce/codet5-base`, desarrollado por el grupo syssec-utd en el contexto de un estudio sobre arquitecturas de backbone compartido con adaptadores LoRA por version de Python. El modelo se ha entrenado sobre codigo Python de las versiones 3.6 a 3.15, lo que lo convierte en un backbone "universal" (todas las versiones) orientado a tareas de representacion y transformacion de codigo fuente a nivel de sentencia.

La relevancia del modelo reside en su enfoque de entrenamiento: en lugar de mantener un modelo independiente por version de Python, se entrena un unico backbone compartido sobre el que se aplican adaptadores LoRA especificos por version. Esto reduce drasticamente el coste de almacenamiento y mantenimiento en pipelines que necesitan cubrir multiples versiones del lenguaje, algo habitual en herramientas de analisis estatico, migracion de codigo y deteccion de vulnerabilidades.

El entrenamiento se realizo durante 2 epocas con un batch global de 72 y una tasa de aprendizaje de 2e-05 sobre un corpus de 100.000 ficheros fuente que generan 9.289.674 filas codificadas. La model card no detalla el numero de parametros ni la longitud de contexto mas alla de lo heredado de CodeT5-base, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (CodeT5-base) |
| Parametros totales | no disponible (heredados de Salesforce/codet5-base; la model card no lo explicita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Python (codigo fuente); idiomas naturales no disponibles |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | no disponible (la model card menciona checkpoints de Trainer, sin detallar formato) |

## Arquitectura y entrenamiento

El modelo parte de `Salesforce/codet5-base`, un transformer encoder-decoder preentrenado para tareas de codigo. Sobre esta base se realiza un ajuste supervisado (fine-tuning) con el objetivo de construir un backbone de sentencias ("statement backbone") compartido entre todas las versiones de Python. El entrenamiento se ejecuto durante 2 epocas con batch global de 72 (24 por GPU x 3 pasos de acumulacion x 1 GPU), tasa de aprendizaje 2e-05, weight decay 0.01, precision FP16 y semilla 20261020.

Los datos provienen del dataset `syssec-utd/pylingual-shared-encoded-v2`, particion `universal/statement`, en la revision `87be6f40c315dc8d136d0df6690470edb021becd`: 100.000 ficheros fuente y 9.289.674 filas codificadas, con un `tokenizer.json` cuyo sha256 es `576881c7af5310402326eff7bf5584ad6e2f88dcfd4c998d4e8b6a26f243153f`. No se detalla en la model card la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF o DPO; por el tipo de tarea (codigo) y el pipeline descrito, se trata de entrenamiento supervisado clasico.

La innovacion tecnica del trabajo es el esquema de backbone compartido con LoRA por version: el repositorio raiz contiene el modelo final y el directorio `last-checkpoint/` alberga el ultimo checkpoint reanudable del Trainer mientras el entrenamiento esta en curso. El fichero `run/provenance.json` registra todos los argumentos de entrenamiento y el manifiesto completo de datos.

## Capacidades

- Procesamiento de codigo Python a nivel de sentencia, con cobertura de las versiones 3.6 a 3.15.
- Representacion y transformacion de fragmentos de codigo fuente (encoder-decoder).
- Base para adaptadores LoRA especificos por version de Python en el estudio de backbone compartido.
- No se documentan capacidades de generacion de texto natural, razonamiento general, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues de lenguaje natural: no disponibles; el unico lenguaje cubierto es Python.

## Casos de uso

- Analisis estatico multi-version: el modelo puede emplearse como extractor de representaciones de sentencias Python en herramientas que analizan codigo escrito para distintas versiones (3.6 a 3.15) sin necesidad de mantener un modelo por version, gracias al esquema de backbone compartido.
- Migracion de codigo entre versiones de Python: al haberse entrenado sobre el rango completo de versiones, sirve de base para tareas de traduccion o modernizacion de sentencias entre versiones del lenguaje.
- Deteccion de patrones y vulnerabilidades: las representaciones a nivel de sentencia permiten alimentar clasificadores de seguridad que identifiquen construcciones peligrosas en codigo fuente de cualquier version soportada.
- Investigacion en adaptadores LoRA: el modelo es un artefacto de referencia para reproducir el estudio de backbone compartido con LoRA por version, comparando coste de almacenamiento frente a modelos independientes.
- Clonado y busqueda de codigo: las representaciones de sentencias pueden indexarse para tareas de deteccion de duplicados o recuperacion de fragmentos similares entre proyectos.
- Preentrenamiento de tareas derivadas: al ser un backbone ajustado, puede servir de punto de partida para fine-tuning en tareas especificas de ingenieria de software (clasificacion, resumen de codigo, generacion de parches) con un coste menor que partir de CodeT5-base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; al derivar de CodeT5-base, el orden de magnitud es el de un modelo de ~220M de parametros, pero no se confirma el dato.
- GPU recomendadas: no disponible; el entrenamiento se realizo en una unica GPU con FP16 y batch 24, sin especificar el modelo de GPU.
- Cabe en GPU de consumo: no confirmado; previsiblemente si, dado el tamano de la base CodeT5, pero sin dato explicito.
- Opciones de despliegue: no se documentan (ni vLLM, ni llama.cpp, ni Ollama, ni TGI). El repositorio usa el ecosistema de Trainer de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syssec-utd/pylingual-shared-statement-v2 | no disponible (base CodeT5) | no disponible | Backbone compartido + LoRA por version de Python | other | Hugging Face |
| Salesforce/codet5-base | ~220M (segun model card original) | no disponible | Encoder-decoder preentrenado para codigo | BSD-3-Clause (segun model card original) | Hugging Face |
| Alternativas especificas por version de Python | no disponible | no disponible | Un modelo por version | no disponible | no disponible |

La comparativa con alternativas equivalentes del estudio (modelos por version) no puede completarse porque la informacion proporcionada no incluye sus especificaciones ni resultados.

## Limitaciones y advertencias

- La licencia es "other": es imprescindible revisar los terminos exactos en el repositorio antes de cualquier uso comercial.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a CodeT5-base ni frente a alternativas.
- El modelo esta especializado en Python (3.6-3.15); no se documenta soporte de otros lenguajes de programacion ni de lenguaje natural.
- No se detalla la composicion del corpus de entrenamiento, lo que impide evaluar sesgos o cobertura real de construcciones del lenguaje.
- Al ser un modelo de codigo, existe riesgo de generar o representar construcciones incorrectas o inseguras si se usa en tareas generativas; no se documentan salvaguardas.
- El repositorio puede contener un checkpoint intermedio en `last-checkpoint/` mientras el entrenamiento esta en curso; debe verificarse que se usa el modelo final de la raiz.
- La fecha de creacion indicada (2026-11-01) y la ausencia de descargas y likes sugieren un artefacto de investigacion reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-statement-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v2
- Repositorio de codigo: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `87226a491a9ee76670601a6b3e8a37e8187241c5`)
- Modelo base: https://huggingface.co/Salesforce/codet5-base
