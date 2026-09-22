# WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_DoRA

## Resumen

WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_DoRA es un adaptador de ajuste fino del tipo DoRA (Weight-Decomposed Low-Rank Adaptation) publicado en HuggingFace sobre el modelo base meta-llama/Llama-3.1-8B. El repositorio contiene exclusivamente los pesos del adaptador en formato safetensors y se carga mediante la libreria PEFT (version declarada 0.17.1), por lo que no es un modelo autonomo: para usarlo hay que descargar aparte los pesos de Llama 3.1 8B. El nombre del repositorio indica que el entrenamiento se hizo sobre el dataset tydiqa, con ejemplos en ingles y telugu, un volumen de 3000 muestras y algun tipo de submuestreo o particion al 1,42 por ciento.

El modelo resuelve, en principio, la tarea de question answering sobre contexto (extractive QA) en dos idiomas: ingles y telugu. El interes practico esta en explorar tecnicas de ajuste eficiente en parametros (PEFT) aplicadas a un modelo de 8 000 millones de parametros para una tarea de comprension lectora multilingue, incluyendo una lengua de bajos recursos como el telugu. El adaptador ocupa unicamente 0,1 GB, lo que permite reproducir el ajuste y combinarlo con el modelo base sin necesidad de almacenar una copia completa de los pesos.

La relevancia es fundamentalmente experimental: el repositorio no incluye model card cumplimentada, no declara licencia, idiomas, datos de entrenamiento ni hiperparametros, y acumula 9 descargas y 0 likes en el momento de la consulta. Cualquier evaluacion seria del adaptador requiere inspeccionar los ficheros del repositorio y ejecutar el modelo base junto con el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (variante de LoRA con descomposicion de magnitud y direccion) sobre transformer decoder-only; el modelo base es Llama 3.1 8B |
| Parametros totales | Modelo base: 8 030 millones de parametros (aproximado, segun documentacion publica de Meta). Adaptador: no disponible (repositorio de 0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base Llama 3.1 8B soporta 128 000 tokens segun la documentacion publica de Meta |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion se aplicaria al modelo base, no al adaptador) |
| Idiomas soportados | No declarados. El nombre del repositorio sugiere ingles y telugu (dataset tydiqa); la model card no lo confirma |
| Licencia | No disponible en el repositorio. El modelo base Llama 3.1 se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base requiere pesos aparte en safetensors o GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B, un transformer decoder-only con atencion por grupos (GQA) y un vocabulario de 128 256 tokens. Sobre esa base se aplica DoRA, una tecnica de ajuste eficiente en parametros que descompone la actualizacion de pesos en dos componentes: una magnitud entrenable y una direccion de bajo rango. El resultado es un conjunto reducido de tensores adicionales que se cargan con la libreria PEFT, sin modificar los pesos originales del modelo base. El repositorio no especifica el rango (r), el alpha, el dropout ni que modulos se adaptaron.

En cuanto a los datos y el procedimiento, la informacion disponible se limita al nombre del repositorio: tydiqa, idiomas ingles y telugu, 3000 ejemplos y un valor de 1,42 por ciento que probablemente corresponde a la fraccion del dataset utilizada, aunque esto no esta confirmado. No se documentan el numero de tokens vistos, la composicion exacta del dataset, la estrategia de enmascarado de perdida, la existencia de RLHF, DPO o cualquier fase de alineamiento posterior, ni los hiperparametros de entrenamiento (tasa de aprendizaje, epocas, precision en bf16 o fp16, hardware empleado). El unico dato tecnico adicional es la version de PEFT usada para el empaquetado: 0.17.1.

## Capacidades

- Generacion de texto condicionada a contexto, heredada del modelo base Llama 3.1 8B.
- Question answering extractivo y abstractivo sobre un pasaje dado, que es la tarea objetivo del ajuste segun el nombre del repositorio (tydiqa).
- Procesamiento de consultas en ingles y, presumiblemente, en telugu; el soporte multilingue no esta declarado oficialmente.
- Comprension lectora sobre contextos largos, limitada por la ventana de 128 000 tokens del modelo base (no verificada para el adaptador).
- Ajuste eficiente en parametros: el adaptador se puede combinar, reemplazar o apilar con otros adaptadores PEFT sobre la misma base.
- No hay evidencia de soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito especifico de este adaptador.
- No se documenta ninguna capacidad de instruccion (chat) mas alla de la que aporte el modelo base sin ajuste adicional de instrucciones.

## Casos de uso

- Evaluacion academica de tecnicas PEFT: comparar el rendimiento de un adaptador DoRA frente a LoRA con el mismo presupuesto de parametros sobre tydiqa, midiendo la diferencia en F1 y exact match en ingles y telugu.
- Investigacion en lenguas de bajos recursos: estudiar si un ajuste de 3000 ejemplos mejora la comprension lectora en telugu respecto al modelo base sin ajuste, y con que coste computacional.
- Sistemas de respuesta sobre documentacion tecnica en ingles: cargar el adaptador sobre Llama 3.1 8B y usarlo para responder preguntas extractivas sobre manuales o normativa, aprovechando la ventana de 128 000 tokens del modelo base para incluir documentos completos.
- Prototipado rapido en portatil o estacion de trabajo: al ocupar 0,1 GB el adaptador, es viable experimentar con distintas combinaciones de base mas adaptador sin duplicar almacenamiento de pesos completos.
- Base para ajuste incremental: partir de este adaptador y continuar el entrenamiento con un subconjunto adicional de tydiqa o con datos propios en telugu, reutilizando la infraestructura PEFT.
- Analisis de olvido catastrofico: medir como cambia el rendimiento del modelo base en otras tareas tras aplicar este adaptador, comparando con la version sin adaptador.
- Docencia y talleres: ejemplo reproducible de entrenamiento DoRA con un presupuesto de datos pequeno y un modelo de 8 000 millones de parametros, adecuado para practicas de laboratorio.
- Filtrado previo en pipelines de datos: usar el adaptador para puntuar pares pregunta-respuesta en ingles y telugu y descartar ejemplos de baja calidad antes de un entrenamiento mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla vacia de HuggingFace, sin seccion de evaluacion cumplimentada, y la busqueda web no ha devuelto ningun resultado relacionado con el modelo. No se dispone de valores de MMLU, HumanEval, GSM8K, SQuAD, tydiqa (F1 o exact match) ni de ninguna otra metrica para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB y no requiere VRAM apreciable; toda la demanda proviene del modelo base Llama 3.1 8B.
- Inferencia en fp16 o bf16: aproximadamente entre 16 y 18 GB de VRAM solo para pesos, mas la memoria de la cache KV, que crece con la longitud de contexto.
- Inferencia en cuantizacion de 8 bits: en torno a 9-10 GB de VRAM. En 4 bits: en torno a 5-7 GB, con perdida de calidad no cuantificada para este adaptador.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB o L40S, con margen suficiente para lotes y contextos largos.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite fp16 en lotes pequenos; una RTX 4060 Ti de 16 GB o similar requiere cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers mas PEFT para cargar el adaptador; vLLM admite adaptadores LoRA en servicio (la compatibilidad concreta con este adaptador DoRA no esta verificada); llama.cpp y Ollama requieren fusionar el adaptador con los pesos base y exportar a GGUF; TGI soporta adaptadores con configuracion especifica.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Llama 3.1 8B) | Adaptador sobre 8 030 millones; rango no declarado | No disponible (base: 128 000 tokens) | safetensors PEFT | No disponible | 9 descargas, 0 likes |
| meta-llama/Llama-3.1-8B (base, sin adaptador) | 8 030 millones | 128 000 tokens | safetensors, GGUF en la comunidad | Llama 3.1 Community License | Ampliamente disponible |
| Otros adaptadores QA multilingues sobre Llama 3.1 8B | no disponible | no disponible | safetensors PEFT | no disponible | no disponible |

No se dispone de modelos comparables con datos verificables de rendimiento en tydiqa para este adaptador; la comparacion con el modelo base solo refleja el punto de partida, no una mejora medida.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada en el repositorio. Cualquier uso comercial exige verificar la licencia del modelo base (Llama 3.1 Community License) y aclarar la del adaptador con el autor.
- El repositorio solo contiene el adaptador: sin el modelo base no se puede ejecutar nada, y hay que aceptar previamente las condiciones de Meta en HuggingFace.
- Riesgo de alucinacion y de respuestas no fundamentadas en el contexto, inherente al modelo base; no hay evaluacion especifica que lo cuantifique para este adaptador.
- Sesgos no evaluados: al derivar de Llama 3.1 y de un subconjunto de tydiqa, hereda los sesgos del corpus original y los del modelo base, sin analisis publicado.
- Cobertura idiomatica dudosa: solo hay indicios de ingles y telugu en el nombre del repositorio; no se declara el soporte real ni el rendimiento por idioma.
- Volumen de entrenamiento muy bajo (3000 ejemplos) y fraccion del 1,42 por ciento, lo que limita la generalizacion fuera del dominio de tydiqa.
- No hay evidencia de ajuste por instrucciones ni de alineamiento con preferencias humanas; no debe emplearse como asistente conversacional sin validacion previa.
- El valor 1,42 del nombre no esta explicado por el autor; interpretarlo como porcentaje del dataset es una hipotesis, no un dato confirmado.
- Ausencia total de benchmarks publicados: no se puede afirmar que el adaptador mejore al modelo base en ninguna tarea.
- La compatibilidad con motores de servicio como vLLM o TGI no esta verificada para adaptadores DoRA de este tipo.
- Antes de usarlo en produccion, es imprescindible evaluar con un conjunto de validacion propio y comparar contra el modelo base sin adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia del etiquetado arxiv:1910.09700 (Lacoste et al., 2019, calculadora de impacto de ML citada en la plantilla de la model card): https://arxiv.org/abs/1910.09700
- Dataset tydiqa (referencia externa, no enlazada por el autor): no disponible en la informacion proporcionada.
- Paper del metodo DoRA: no disponible en la informacion proporcionada.
- Demo, blog o repositorio del autor: no disponible.
