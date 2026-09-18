# xw17/Qwen2-1.5B-Instruct_SFT_lora_wesad

## Resumen

El repositorio `xw17/Qwen2-1.5B-Instruct_SFT_lora_wesad` es un ajuste fino publicado en HuggingFace por el usuario xw17 sobre el modelo base Qwen2-1.5B-Instruct, segun se deduce del propio identificador del repositorio. El sufijo `SFT_lora_wesad` indica que se trata de un entrenamiento supervisado (SFT) mediante LoRA cuyo conjunto de datos de destino es WESAD (Wearable Stress and Affect Detection), un corpus publico de senales fisiologicas orientado a la deteccion de estres y afecto. No obstante, la model card del repositorio es la plantilla automatica de HuggingFace sin rellenar: no confirma ni la tecnica de entrenamiento, ni el dataset, ni los hiperparametros.

El modelo es relevante unicamente como artefacto de investigacion reproducible en el nicho de "LLM sobre datos fisiologicos": ejemplifica el patron de tomar un modelo de lenguaje pequeno y ajustarlo para tareas de clasificacion o generacion sobre senales de wearables. El repo ocupa 0,1 GB, un tamano coherente con un adaptador LoRA mas que con los pesos completos de un modelo de 1.500 millones de parametros (que en bf16 rondarian los 3 GB), aunque esto no se puede confirmar con la informacion disponible.

Advertencia importante para cualquier evaluacion: el repositorio tiene 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y su model card no contiene informacion tecnica real. Cualquier dato sobre arquitectura o capacidades que no provenga del modelo base debe considerarse no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio (el modelo base Qwen2-1.5B-Instruct es un transformer decoder-only con atencion por consultas agrupadas, GQA, y RoPE) |
| Parametros totales | No disponible en el repositorio (el modelo base Qwen2-1.5B-Instruct declara 1,54 mil millones de parametros; el repo de 0,1 GB sugiere que se distribuye un adaptador) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible en el repositorio (el modelo base soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Qwen2-1.5B-Instruct se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (etiqueta del repositorio) |

## Arquitectura y entrenamiento

No hay informacion verificable sobre la arquitectura del artefacto publicado. La model card es la plantilla generada automaticamente por HuggingFace y todos los campos relevantes aparecen como "[More Information Needed]": no se especifica el tipo de modelo, los datos de entrenamiento, el regimen de precision (fp16, bf16, fp8), el hardware utilizado ni las horas de computo. El unico dato estructural cierto es la etiqueta de libreria `transformers` y el formato `safetensors`.

Por el identificador del repositorio se puede inferir, sin confirmacion documental, que se trata de un ajuste supervisado con LoRA sobre Qwen2-1.5B-Instruct usando el dataset WESAD. WESAD es un corpus publico de deteccion de estres y afecto con senales fisiologicas (ECG, EDA, EMG, respiracion, temperatura cutanea y acelerometro) recogidas con dispositivos de pecho y muneca sobre 15 sujetos, con etiquetas de linea base, estres, diversion y meditacion. Como un modelo de lenguaje no consume senales continuas directamente, el flujo de trabajo habitual en este tipo de experimentos es serializar las ventanas de senal como texto (por ejemplo, listas de valores o descriptores estadisticos) y entrenar al modelo para emitir la etiqueta correspondiente. Esta descripcion es una hipotesis de trabajo basada en el nombre del repositorio, no un dato confirmado por el autor.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base Qwen2-1.5B-Instruct, siempre que el ajuste LoRA no haya degradado esa capacidad. No verificada en este repositorio.
- Clasificacion de estados fisiologicos: presumiblemente la capacidad objetivo del ajuste, orientada a etiquetas de estres, linea base, diversion y meditacion a partir de senales serializadas de WESAD. No confirmada.
- Razonamiento de un solo turno y respuestas cortas: plausible por el tamano del modelo base, sin datos de evaluacion en el repo.
- Tool calling y function calling: no disponible en el repositorio. El modelo base no incorpora plantilla de herramientas nativa como las generaciones posteriores de Qwen.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. El modelo base Qwen2 tiene cobertura multilingue amplia, pero el ajuste sobre un corpus fisiologico en ingles puede haber reducido el rendimiento en otros idiomas.
- Modo thinking, vision o audio: no disponible. No hay indicios de modalidad adicional.
- Generacion de embeddings: tecnicamente posible cargando el modelo base y usando estados ocultos, pero no es una capacidad declarada del repositorio.

## Casos de uso

- Experimentacion academica en deteccion de estres: el artefacto sirve como punto de partida reproducible para investigacion que compare enfoques de LLM frente a clasificadores clasicos (random forest, CNN, LSTM) sobre WESAD. Su tamano reducido permite iterar rapido en un solo GPU de laboratorio.
- Serializacion de senales de wearables a texto: uso del modelo para mapear ventanas de ECG o EDA, previamente convertidas a cadenas de valores, a etiquetas de afecto. Encaja por el ajuste especifico sobre WESAD, aunque exige validar el formato de entrada esperado.
- Prototipado de asistentes de bienestar en el borde: con 1,5 mil millones de parametros el modelo cabe en GPUs de consumo y en algunos dispositivos de borde, lo que permite experimentar con inferencia local sin enviar senales fisiologicas a la nube, un requisito habitual en cumplimiento de RGPD.
- Generacion de datos sinteticos para aumento de dataset: el modelo puede producir descripciones textuales plausibles de episodios de estres para preentrenar otros clasificadores, siempre que se valide la fidelidad estadistica de lo generado.
- Base para docencia en ajuste fino: resulta util en cursos y talleres como ejemplo minimo y de bajo coste del ciclo completo de SFT con LoRA sobre `transformers`, desde la carga del adaptador hasta la evaluacion.
- Chatbot de dominio restringido tras nuevo ajuste: si se confirma que conserva las capacidades conversacionales del modelo base, se puede reajustar para triaje de salud mental o acompanamiento emocional, con supervision humana obligatoria y advertencias medicas explicitas.
- Extraccion de informes a partir de notas clinicas o diarios de sintomas: tarea auxiliar donde el modelo base rinde de forma aceptable y que puede combinarse con el ajuste fisiologico en un flujo de dos etapas.
- Evaluacion de riesgos de publicacion en HuggingFace: el repositorio es un caso de estudio util sobre como un artefacto sin model card completa, sin licencia y sin benchmarks no deberia integrarse en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de resultados (aparece como "[More Information Needed]"), no hay tabla de metricas sobre WESAD (exactitud, F1 macro, kappa de Cohen) ni evaluaciones de lenguaje general como MMLU, GSM8K o HumanEval. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma verificada. Como estimacion orientativa a partir del tamano declarado del modelo base, entre 3 y 4 GB en bf16/fp16, en torno a 1,5-2 GB en cuantizacion de 4 bits y menos de 1 GB en 8 bits si el adaptador se fusiona con una base cuantizada.
- GPU recomendadas: no disponible. Si se materializa como modelo de 1,5 mil millones de parametros, funciona sin problemas en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y cualquier GPU de centro de datos como A100, H100 o L40S.
- Compatibilidad con GPU de consumo: previsiblemente si, en la mayoria de GPUs con 4 GB o mas de VRAM, siempre que se use cuantizacion. No confirmado.
- Opciones de despliegue: la etiqueta `transformers` del repositorio apunta a despliegue con la libreria de HuggingFace; el campo `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, y las herramientas que requieren pesos completos pueden no aceptar un adaptador LoRA sin fusionarlo antes.
- Latencia y throughput: no disponible. No hay datos de velocidad, tamano de checkpoint ni tiempos de entrenamiento en la model card.
- Nota critica sobre el tamano: el repositorio ocupa 0,1 GB, muy por debajo de los aproximadamente 3 GB que exigirian los pesos completos en bf16. Si se trata de un adaptador, sera necesario descargar por separado Qwen2-1.5B-Instruct y cargar el adaptador sobre el, lo que anula el ahorro de memoria total.

## Comparativa con modelos similares

No existe informacion en el repositorio que permita una comparativa de rendimiento fiable, ya que no hay benchmarks publicados. La tabla siguiente compara unicamente caracteristicas publicas de modelos de la misma categoria y del modelo base declarado; los datos del artefacto evaluado figuran como no disponibles porque el autor no los publica.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| xw17/Qwen2-1.5B-Instruct_SFT_lora_wesad | No disponible (base de 1,54 mil millones) | No disponible (base de 32.768 tokens) | No disponible | safetensors | No disponible |
| Qwen2-1.5B-Instruct | 1,54 mil millones | 32.768 tokens | Apache 2.0 | safetensors | Si, publicado por el autor del modelo base |
| Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32.768 tokens (hasta 131.072 con configuracion) | Apache 2.0 | safetensors | Si, publicado por el autor del modelo base |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 131.072 tokens | Licencia comunitaria de Llama 3.2 | safetensors | Si, publicado por el autor del modelo base |
| SmolLM2-1.7B-Instruct | 1,71 mil millones | 8.192 tokens | Apache 2.0 | safetensors | Si, publicado por el autor del modelo base |

Las cifras de contexto y licencia de las filas correspondientes a modelos base son las declaradas publicamente por sus respectivos autores y se incluyen unicamente como referencia de categoria. El artefacto de xw17 no puede compararse en rendimiento porque carece de evaluacion.

## Limitaciones y advertencias

- Model card vacia: el repositorio no documenta datos de entrenamiento, hiperparametros, hardware ni procedimiento. Es imposible auditar el ajuste.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. Aunque el modelo base Qwen2-1.5B-Instruct es Apache 2.0, el autor del ajuste deberia declarar los terminos del derivado; la ausencia de licencia genera incertidumbre juridica.
- Riesgo de alucinacion: al ser un modelo de lenguaje pequeno, tiende a producir etiquetas o justificaciones plausibles pero incorrectas, especialmente si la tarea se aleja del dominio de WESAD.
- Sensibilidad al formato de entrada: si el ajuste espera una serializacion concreta de las senales fisiologicas, cualquier desviacion en el numero de muestras, la frecuencia de muestreo o el orden de las variables degradara la salida sin aviso.
- Dominio muy estrecho: WESAD contiene 15 sujetos, una unica configuracion de captura y un entorno de laboratorio. El modelo probablemente no generaliza a dispositivos, poblaciones o contextos distintos.
- Sesgos de poblacion: WESAD esta limitado demograficamente; un modelo ajustado sobre el hereda esos sesgos, relevantes en cualquier aplicacion de salud.
- Muy baja adopcion: 0 descargas y 0 likes implican ausencia de validacion independiente, de informes de errores y de mantenimiento.
- Idioma: no se declara cobertura idiomatica. La interaccion con WESAD suele ser en ingles, por lo que el castellano puede degradarse respecto al modelo base.
- Uso clinico: el modelo no es un dispositivo medico, no ha pasado validacion regulatoria y no debe emplearse para diagnostico, triaje o decision terapeutica.
- Privacidad: aunque la inferencia local ayuda al cumplimiento del RGPD, las senales fisiologicas son datos de categoria especial y su tratamiento exige base legal, evaluacion de impacto y medidas de seguridad especificas.
- Ambiguedad sobre el contenido del repositorio: el tamano de 0,1 GB sugiere un adaptador, pero no se confirma. Se debe inspeccionar el arbol de ficheros antes de asumir que los pesos son autonomos.
- Recomendacion de produccion: no usar este artefacto en sistemas en produccion sin reentrenar, documentar y evaluar de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xw17/Qwen2-1.5B-Instruct_SFT_lora_wesad
- Paper de referencia del calculo de impacto ambiental citado en la plantilla de la model card: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019)
- Calculadora de impacto de machine learning mencionada en la model card: https://mlco2.github.io/impact
- Modelo base presumible: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct (no enlazado por el autor, inferido del identificador)
- Dataset presumible: WESAD, Wearable Stress and Affect Detection (Schmidt et al., ICMI 2018). No enlazado por el autor.
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada; los resultados obtenidos correspondian a paginas genericas de YouTube sin relacion con el artefacto.
