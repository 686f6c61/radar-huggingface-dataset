# yobro4619/gemma4_26b_a4b_grpo_chat

## Resumen

Gemma 4 26B A4B GRPO chat es un adaptador LoRA publicado por el usuario yobro4619 sobre el modelo base multimodal `unsloth/gemma-4-26B-A4B-it`. No es un modelo completo, sino un conjunto de pesos de adaptador y ficheros de procesador (aproximadamente 2,0 GB) que deben cargarse sobre el modelo base mediante PEFT. El adaptador se ha afinado con GRPO (Group Relative Policy Optimization) para la condicion de "chat" de una extension de benchmark de modelos vision-lenguaje (VLM), partiendo de un conjunto de entrenamiento de 440 filas.

El interes del artefacto es metodologico: documenta un pipeline de ajuste fino eficiente (QLoRA de 4 bits, torre de vision congelada, tres epocas y 660 pasos de optimizador) sobre una arquitectura de mezcla de expertos (MoE). La denominacion "26B A4B" del modelo base sugiere 26 000 millones de parametros totales con aproximadamente 4000 millones activos por token, aunque ese dato procede del nombre del modelo base y no se detalla en la informacion disponible.

Su relevancia actual es limitada y acotada a la investigacion: cuenta con cero descargas y cero valoraciones, no publica resultados numericos de benchmarks y no declara licencia ni idiomas. Sirve, sobre todo, como referencia reproducible para quien quiera replicar o criticar el ajuste con GRPO de un VLM MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) vision-lenguaje heredada del modelo base Gemma 4; el artefacto publicado es un adaptador LoRA |
| Parametros totales | 26B (segun la denominacion "26B" del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | 4B (segun la denominacion "A4B" del modelo base; no confirmado en la informacion disponible) |
| Longitud de contexto | No disponible para el modelo base. La configuracion de entrenamiento usa 8192 tokens de secuencia maxima y 4096 tokens de finalizacion maxima |
| Tipos de cuantizacion | Entrenamiento con QLoRA de 4 bits sobre el modelo base; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

Datos adicionales del repositorio: biblioteca `peft`, pipeline `image-text-to-text`, tamano del repositorio 2,0 GB, creado el 2026-10-03 y actualizado el 2026-10-03.

## Arquitectura y entrenamiento

El adaptador se monta sobre `unsloth/gemma-4-26B-A4B-it`, un modelo vision-lenguaje de tipo image-text-to-text. La nomenclatura "26B A4B" apunta a una arquitectura de mezcla de expertos con 26 000 millones de parametros totales y 4000 millones activos, si bien la ficha original no desglosa el numero de expertos, la estrategia de enrutamiento ni el mecanismo de atencion. El adaptador congela la torre de vision y solo entrena modulos seleccionados del modelo de lenguaje, segun se deduce del manifiesto de ejecucion citado en la model card.

El entrenamiento se realizo con GRPO durante tres epocas, 660 pasos de optimizador, ocho generaciones por prompt, tamano de lote por dispositivo de ocho y acumulacion de gradientes de dos. Se empleo QLoRA de 4 bits, con un maximo de 8192 tokens de secuencia y 4096 de finalizacion. Un detalle tecnico relevante es que el LoRA sobre los expertos MoE de Gemma requiere `dropout = 0`, en lugar del 0,1 usado originalmente en configuraciones equivalentes para Qwen. El conjunto de entrenamiento es `yobro4619/final_common_train`, en su revision `4e9742593fa8f7f9e17615a8d856e49458f4bd11`, con 440 filas de entrenamiento. La evaluacion usa la particion de test de 100 filas de la misma condicion y, ademas, un conjunto fuera de distribucion (OOD) de 200 filas. La model card senala una discrepancia deliberada: el prompt de entrenamiento no incluye instruccion de sistema de VQA, mientras que la evaluacion si conserva la instruccion de sistema del benchmark.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas sobre imagenes (VQA), al ser un adaptador de la condicion "chat" de un benchmark VLM.
- Procesamiento conjunto de imagen y texto mediante el pipeline `image-text-to-text` del modelo base.
- Razonamiento guiado por RL: el ajuste con GRPO optimiza el comportamiento de respuesta frente a recompensas, orientado a la tarea concreta del benchmark.
- Soporte de tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona.
- Capacidades multilingues: no disponible, no se declaran idiomas.
- Capacidades especiales (modo "thinking", audio, etc.): no disponible, no se mencionan.

## Casos de uso

- Reproduccion de experimentos con GRPO en VLM: el adaptador permite replicar el pipeline completo (QLoRA de 4 bits, torre de vision congelada, tres epocas) sobre el modelo base, dado que la model card documenta revisones exactas del modelo, dataset y benchmark.
- Investigacion sobre ajuste LoRA en arquitecturas MoE: sirve para estudiar el efecto del `dropout = 0` en los LoRA de expertos frente a configuraciones con dropout no nulo.
- Evaluacion de generalizacion fuera de distribucion: el autor evalua el mismo adaptador sobre un conjunto OOD de 200 filas, lo que permite analizar la deriva de comportamiento respecto a las 100 filas de test en distribucion.
- Prototipado de asistentes multimodales conversacionales: sobre el modelo base cargado con PEFT, se puede desplegar un chatbot que acepte imagen y texto como entrada para tareas de descripcion y respuesta visual.
- Estudio de la discrepancia entre prompt de entrenamiento y de evaluacion: al eliminar la instruccion de sistema de VQA en entrenamiento y mantenerla en evaluacion, es un caso util para medir sensibilidad al formato de prompt.
- Punto de partida para un ajuste adicional: al ser un adaptador ligero, puede usarse como inicializacion para un fine-tuning posterior sobre dominios visuales especificos.
- Comparacion de metodologias de RL para VLM: permite contrastar GRPO con alternativas como DPO o SFT sobre el mismo modelo base y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodologia de evaluacion (particion de test de 100 filas de la misma condicion y conjunto OOD de 200 filas) pero no incluye cifras de rendimiento.

## Requisitos de hardware

- Peso del adaptador: aproximadamente 2,0 GB, segun el tamano del repositorio. Es un componente ligero; el coste real lo determina el modelo base.
- VRAM para el modelo base: estimacion aproximada a partir de los 26 000 millones de parametros totales. En FP16 o BF16 serian necesarios del orden de 50-55 GB de VRAM; en cuantizacion de 4 bits, del orden de 15-18 GB, sin contar la cache KV ni el procesador de vision.
- GPU recomendadas: para precision completa, A100 80 GB, H100 80 GB o configuraciones multi-GPU. Para cuantizacion de 4 bits, una RTX 3090 o RTX 4090 de 24 GB podria resultar suficiente, aunque no hay confirmacion en la informacion proporcionada.
- Cabe en GPU de consumo: plausible en tarjetas de 24 GB con el modelo base cuantizado a 4 bits; no confirmado.
- Opciones de despliegue: carga mediante `transformers` y `peft` (ruta documentada por el autor). El uso con vLLM, llama.cpp, Ollama o TGI requeriria convertir o fusionar el adaptador; no se documenta compatibilidad con esas herramientas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yobro4619/gemma4_26b_a4b_grpo_chat (este adaptador) | Adaptador sobre base de 26B (4B activos, segun denominacion) | No disponible (entrenado a 8192) | No disponible | HuggingFace, 0 descargas, 0 likes |
| unsloth/gemma-4-26B-A4B-it (modelo base) | 26B totales, 4B activos (segun denominacion) | No disponible | No disponible | HuggingFace |
| Gemma 3 27B IT | 27B densos | 128k (segun documentacion publica de Gemma 3) | Terminos de Gemma | Ampliamente desplegado; datos no verificados en la informacion proporcionada |
| Qwen2.5-VL-32B-Instruct | 32B densos | 128k (segun documentacion publica) | Apache 2.0 (segun publicacion) | Ampliamente desplegado; datos no verificados en la informacion proporcionada |

Las filas de modelos alternativos proceden de conocimiento general y no se han verificado con la informacion proporcionada. No hay datos de rendimiento comparativo disponibles para este adaptador.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar el modelo base `unsloth/gemma-4-26B-A4B-it` en la revision exacta `60941ad6341d0b7af91277ff25c4175f08b56819` para un comportamiento correcto.
- Entrenamiento sobre solo 440 filas y una unica condicion de benchmark: alto riesgo de sobreajuste y de comportamiento estrecho.
- La torre de vision esta congelada, por lo que no se adaptan las representaciones visuales al dominio objetivo.
- Discrepancia de prompt entre entrenamiento y evaluacion: el entrenamiento omite la instruccion de sistema de VQA y la evaluacion la conserva, lo que puede introducir sesgo en los resultados declarados.
- Cero descargas y cero valoraciones: no existe validacion independiente de la comunidad.
- Licencia no declarada, lo que impide determinar si se permite uso comercial. Se heredan, ademas, las condiciones del modelo base y del dataset.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue mas alla del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en esta publicacion, al no haber benchmarks.
- Fecha de creacion futura (2026-10-03) en los metadatos, lo que conviene tener en cuenta al citar o versionar el artefacto.
- Sin numeos de rendimiento publicados: cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yobro4619/gemma4_26b_a4b_grpo_chat
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/yobro4619/final_common_train
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente resultados de un foro sin relacion con el modelo.
