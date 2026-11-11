# trymirai/LFM2.5-1.2B-Thinking-L

## Resumen

Mirai LFM2.5-1.2B-Thinking-L es una cuantizacion de 8 bits del modelo LiquidAI/LFM2.5-1.2B-Thinking, publicada por trymirai (Mirai Labs) bajo el identificador trymirai/LFM2.5-1.2B-Thinking-L. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del modelo original de Liquid AI, orientado a inferencia local eficiente en Apple silicon. El repositorio contiene 1.189.264.128 parametros en formato safetensors y ocupa 6,1 GB, con la libreria de inferencia propietaria uzu.

El modelo hereda la arquitectura y el comportamiento del LFM2.5-1.2B-Thinking original, por lo que sus capacidades de generacion de texto y razonamiento son las del modelo base. La aportacion de Mirai Labs se centra en el metodo de cuantizacion: cuantizacion entera simetrica de 8 bits con escalas bfloat16, tamano de grupo 64 y transformadas de Hadamard aleatorias bloque-diagonales con tamano de bloque 32 para reducir valores atipicos en activaciones y pesos. El autor situa el checkpoint en la frontera de Pareto tamano-divergencia KL.

Su relevancia actual es acotada pero concreta: ofrece una via para ejecutar un modelo de 1,2B parametros con modo de razonamiento en equipos Mac con chip Apple, sin depender de GPUs dedicadas. La contrapartida es que solo se soporta inferencia en Apple silicon mediante la CLI mirai, y que la licencia heredada (lfm-open-license) impone condiciones de uso que deben revisarse antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-1.2B-Thinking; consultar model card del modelo base) |
| Parametros totales | 1.189.264.128 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits entero simetrico, escalas bfloat16, tamano de grupo 64; transformadas de Hadamard aleatorias bloque-diagonales con bloque de 32 |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (other) |
| Formato de pesos | safetensors (libreria uzu) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo, que corresponde al LFM2.5-1.2B-Thinking de Liquid AI; la model card remite explicitamente a la del modelo original para arquitectura, uso previsto, evaluaciones y limitaciones. Lo que si se documenta es el proceso de cuantizacion: cuantizacion post-entrenamiento (PTQ) de 8 bits con simetria entera, escalas en bfloat16 y agrupacion en grupos de 64 elementos. Para mitigar los valores atipicos que degradan la calidad en cuantizacion de 8 bits, se aplican transformadas de Hadamard aleatorias bloque-diagonales con bloques de 32, una tecnica de rotacion que redistribuye la energia de activaciones y pesos antes de cuantizar.

No se especifican volumen de tokens de entrenamiento, composicion del dataset, ni si el modelo base empleo RLHF o DPO. La evaluacion de la cuantizacion se realizo sobre una mezcla de datos declarada: 45 % datos publicos agenticos, 30 % datos publicos de SFT y contexto largo, y 25 % datos privados de chat. El autor afirma que el checkpoint se encuentra en la frontera de Pareto tamano-KL, es decir, que no encontro un checkpoint de menor tamano con menor divergencia KL.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, heredados del modelo base LFM2.5-1.2B-Thinking.
- Conversacion multi-turno en formato chat, segun la mezcla de evaluacion declarada (incluye datos de chat privados).
- Comportamiento agentico: parte de la evaluacion de la cuantizacion usa datos publicos agenticos, lo que sugiere soporte para flujos de varios pasos, aunque no se documenta soporte explicito de tool calling.
- Contexto largo: la mezcla de evaluacion incluye un 30 % de datos de SFT y contexto largo, indicando que se preserva cierto rendimiento en ventanas extensas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente de razonamiento local en Mac: ejecucion mediante la CLI mirai en equipos Apple silicon para tareas de analisis y respuesta razonada sin conexion a servicios en la nube, aprovechando el modo thinking del modelo base.
- Prototipado de agentes en estacion de trabajo: uso de los datos agenticos de la mezcla de evaluacion como indicio de que el modelo mantiene comportamiento de varios pasos tras la cuantizacion, adecuado para pruebas de concepto de pipelines agenticos en local.
- Procesamiento de documentos largos en local: la inclusion de datos de contexto largo en la evaluacion sugiere utilidad para resumir o consultar documentos extensos en un portatil Mac, sin GPU dedicada.
- Chat de soporte interno con datos sensibles: al ejecutarse integramente en el dispositivo, permite conversaciones multi-turno sobre informacion corporativa que no debe salir de la maquina.
- Evaluacion comparativa de cuantizaciones: el checkpoint sirve como referencia de la frontera tamano-KL para investigadores que comparan tecnicas de PTQ de 8 bits con rotaciones de Hadamard frente a otras aproximaciones.
- Generacion de texto en herramientas de desarrollo para macOS: integracion del modelo en scripts y utilidades de linea de comandos que necesiten completar o reescribir texto con un modelo pequeno y local.
- Educacion y experimentacion: modelo de 1,2B parametros con modo razonamiento para estudiar el efecto de la cuantizacion en la calidad de la cadena de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una grafica de divergencia KL frente al tamano del checkpoint y la afirmacion de que el modelo se situa en la frontera de Pareto tamano-KL, sin cifras numericas de MMLU, HumanEval, GSM8K ni otras tareas.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo esta pensado para memoria unificada de Apple silicon. El repositorio ocupa 6,1 GB, por lo que se requiere al menos esa cantidad de memoria disponible para cargar los pesos.
- GPU recomendadas: no se documentan GPU NVIDIA o AMD; el soporte indicado es exclusivamente Apple silicon (chips M-series).
- Cabe en GPU consumer: no hay informacion sobre ejecucion en RTX 4090 u otras GPU consumer; el unico backend soportado es Apple silicon.
- Opciones de despliegue: CLI mirai (instalable via Homebrew con brew install mirai) y compilacion desde codigo fuente del proyecto uzu de trymirai. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| trymirai/LFM2.5-1.2B-Thinking-L | 1,19B | no disponible | 8 bits, grupo 64 | lfm-open-license | Apple silicon (uzu/mirai) |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2B (aproximado) | no disponible | pesos originales | lfm-open-license | multiple, segun model card del autor |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | lfm-open-license | no disponible |

La comparativa se limita al modelo base y a variantes del mismo, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de tamano similar.

## Limitaciones y advertencias

- La cuantizacion de 8 bits introduce perdida de calidad respecto al modelo original; el autor la situa en una frontera de Pareto, pero no publica cifras absolutas de degradacion.
- Solo se soporta inferencia en Apple silicon; no hay backend para CUDA, ROCm ni CPU generica documentado.
- La libreria uzu y la CLI mirai son herramientas de Mirai Labs; la dependencia de un runtime propietario limita la portabilidad y la auditoria del proceso de inferencia.
- Licencia lfm-open-license: es una licencia "other" con condiciones especificas; debe revisarse el texto enlazado antes de cualquier uso comercial.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser un modelo de 1,2B parametros, el riesgo de alucinacion en tareas factuales es estructuralmente alto.
- La longitud de contexto no esta publicada en esta ficha; debe consultarse la model card del modelo base.
- El modelo esta orientado a razonamiento (thinking), lo que incrementa el numero de tokens generados y, por tanto, la latencia frente a modelos no razonadores del mismo tamano.
- El repositorio tiene un volumen de descargas bajo (327) y ningun like, lo que reduce la validacion comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/LFM2.5-1.2B-Thinking-L
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Model card del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/README.md
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/LICENSE
- Pagina del modelo en Mirai Labs: https://trymirai.com/local-models/liquidai-lfm2-5-1-2b-thinking-mirai-mirai-l-8
- Blog de cuantizacion de Mirai Labs: https://trymirai.com/blog/quantization
- Documentacion de uzu (como ejecutar): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
