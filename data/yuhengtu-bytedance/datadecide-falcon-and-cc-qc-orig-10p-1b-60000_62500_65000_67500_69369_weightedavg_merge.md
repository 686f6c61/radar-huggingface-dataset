# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-orig-10p-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de arquitectura transformer decoder-only de aproximadamente 1.280 millones de parametros, publicado por el usuario yuhengtu-bytedance. No se trata de un modelo entrenado desde cero ni de un ajuste supervisado, sino de una fusion de pesos (weight merging) generada con la herramienta mergekit a partir de cinco checkpoints de un mismo run de entrenamiento, correspondientes a los pasos 60000, 62500, 65000, 67500 y 69369. La operacion aplicada es una media lineal ponderada (Linear merge con `normalize: true`), donde los pesos aumentan a medida que avanza el entrenamiento (1, 2, 3, 4 y 5 respectivamente), de modo que el checkpoint final actua como base y tiene el mayor peso relativo.

El interes tecnico del artefacto es metodologico: el nombre del modelo sugiere que procede de un experimento de la linea DataDecide sobre seleccion de datos de preentrenamiento (mezcla "falcon-and-cc-qc-orig-10p", es decir, datos tipo Falcon/RefinedWeb combinados con Common Crawl filtrado en una proporcion del 10 %), y que forma parte de un estudio sobre como la fusion de checkpoints intermedios ("merge scaling") puede aproximar o mejorar el resultado del entrenamiento completo. Las rutas internas referenciadas en la configuracion YAML apuntan a un directorio llamado `Pan_Safety_Better_Measurement`, lo que sugiere un contexto de investigacion sobre medicion de seguridad.

Es relevante ahora porque ejemplifica un patron cada vez mas comun en investigacion abierta: publicar checkpoints intermedios y fusiones derivadas como material reproducible para estudiar leyes de escala, seleccion de datos y tecnicas de merging, en lugar de modelos finales listos para produccion. Conviene leerlo, por tanto, como un artefacto de investigacion y no como un modelo de chat o de instrucciones: la model card no documenta datos de entrenamiento, tokenizador, idiomas, licencia ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (etiqueta `llama` en el repositorio); detalles de capas, atencion y tokenizador no disponibles |
| Parametros totales | 1.279.854.592 (aprox. 1,28 B), segun metadatos de safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles oficialmente; los pesos se publican en bfloat16, por lo que son convertibles a cuantizaciones estandar (int8, 4-bit) mediante herramientas de terceros |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (salida en bfloat16; la configuracion de merge declara `dtype: float32` de entrada y `out_dtype: bfloat16`) |
| Tamano del repositorio | 2,6 GB |
| Metodo de creacion | Fusion lineal ponderada con mergekit sobre 5 checkpoints del mismo run |
| Libreria declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `llama` asociada al repositorio, lo que apunta a un transformer decoder-only denso con las convenciones habituales de esa familia (atencion causal, normalizacion previa a los bloques y tokenizador tipo BPE). Con 1,28 B de parametros y pesos almacenados en bfloat16, el modelo ocupa alrededor de 2,6 GB, coherente con el tamano del repositorio. No se especifican numero de capas, dimension oculta, cabezas de atencion, funcion de activacion ni longitud de contexto, por lo que esos datos deben considerarse no disponibles.

Lo que si esta documentado es el procedimiento de construccion. Se parte de cinco checkpoints del mismo entrenamiento (`falcon-and-cc-qc-orig-10p`), correspondientes a los pasos 60000, 62500, 65000, 67500 y 69369. El checkpoint final (69369) se usa como base y recibe peso 5; los demas reciben pesos 4, 3, 2 y 1 en orden decreciente de avance temporal. La fusion se realiza con el metodo Linear descrito en el articulo arXiv:2203.05482 (aproximacion de "model soups" mediante media de pesos), con normalizacion de los coeficientes activada, de forma que la suma de pesos se reescala antes de combinarlos. El resultado es un promedio ponderado que da mas influencia a las fases finales del entrenamiento y suaviza la varianza entre checkpoints cercanos.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones de inferencia como decodificacion especulativa. El nombre del experimento sugiere una mezcla de datos con presencia mayoritaria de corpus web en ingles y un subconjunto filtrado de Common Crawl al 10 %, pero esto es una inferencia a partir de la nomenclatura, no un dato confirmado en la model card.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad explicitamente declarada por el pipeline (`text-generation`).
- Modelo base, no ajustado por instrucciones: no hay evidencia de fine-tuning supervisado, RLHF ni DPO, por lo que no cabe esperar comportamiento de asistente conversacional sin un ajuste posterior.
- Razonamiento y matematicas: no hay datos publicados que permitan afirmar capacidades especificas en estas areas.
- Generacion de codigo: no documentada.
- Tool calling / function calling: no documentado ni esperable en un checkpoint base sin plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.

## Casos de uso

- Investigacion sobre fusion de checkpoints: el modelo sirve como punto de comparacion empirico para estudiar si la media ponderada de checkpoints intermedios iguala o supera el rendimiento del checkpoint final, comparando perplejidad y metricas de validacion sobre el mismo conjunto.
- Estudio de leyes de escala con modelos pequenos: con 1,28 B de parametros y varios checkpoints intermedios accesibles, es util para replicar experimentos de DataDecide sobre prediccion del rendimiento de modelos grandes a partir de runs pequenos.
- Punto de partida para preentrenamiento continuado: al ser un modelo base sin alineacion, puede inicializar un segundo preentrenamiento sobre un dominio concreto (legal, medico, cientifico) antes de un ajuste por instrucciones.
- Base para fine-tuning supervisado: sirve como inicializacion para SFT con LoRA o ajuste completo en datasets de instrucciones, aunque la ausencia de licencia publicada obliga a resolver esa cuestion antes de un uso comercial.
- Experimentacion de tecnicas de merging: permite comparar el metodo Linear con otras tecnicas de mergekit (SLERP, TIES, DARE) usando los mismos cinco checkpoints de origen como entradas controladas.
- Evaluacion comparativa en hardware de consumo: con 2,6 GB en bfloat16 y menos de 1 GB en cuantizacion de 4 bits, se puede ejecutar en una GPU de gama media o incluso en CPU para tareas de evaluacion y generacion de datos sinteticos a pequena escala.
- Generacion de datos sinteticos y aumento de corpus: util para producir texto en lote en entornos controlados de investigacion donde no se requiere alineacion ni formato conversacional.
- Analisis de sesgo y seguridad en checkpoints intermedios: al conservar varios puntos del entrenamiento, permite estudiar como evolucionan determinados sesgos o comportamientos a lo largo del run y como los modifica la fusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a describir el procedimiento de fusion y no incluye valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra evaluacion. La busqueda web asociada no devolvio resultados tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 2,6 GB en bfloat16 o float16, unos 5,2 GB en float32 y en torno a 0,7-1,4 GB con cuantizacion de 4 u 8 bits.
- VRAM total recomendada: 6-8 GB con margen para el contexto y las cache KV; 4 GB es suficiente para cuantizaciones de 4 bits con contextos cortos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) es mas que suficiente; en el extremo profesional, una A100 o H100 queda enormemente sobredimensionada para un modelo denso de 1,28 B y solo se justifica por paralelismo de lote.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU con al menos 4 GB de VRAM y tambien puede ejecutarse en CPU con memoria RAM suficiente (unos 3-6 GB segun precision).
- Opciones de despliegue: transformers y text-generation-inference aparecen como etiquetas del repositorio; vLLM es viable con los pesos safetensors. Para llama.cpp u Ollama es necesaria una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay resultados de evaluacion de este modelo que permitan una comparacion de rendimiento. La tabla siguiente contrasta unicamente caracteristicas estructurales y de licencia con alternativas publicas de tamano similar, segun los datos publicos de cada ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DataDecide-falcon-and-cc-qc-orig-10p (este modelo) | 1,28 B | No disponible | No disponible | HuggingFace, 0 descargas |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente usado |
| Qwen2.5 1.5B | 1,54 B | 32 768 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| SmolLM2 1.7B | 1,7 B | 8 192 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| TinyLlama 1.1B | 1,1 B | 2 048 tokens | Apache 2.0 | HuggingFace, ampliamente usado |

La diferencia fundamental no es de tamano sino de proposito: los cuatro modelos de referencia son modelos base con licencia explicita, model card completa y tokenizador documentado, mientras que este artefacto es una fusion de checkpoints de investigacion sin licencia, sin ficha tecnica y sin evaluaciones. Comparar rendimiento en tareas de generacion o razonamiento no es posible con la informacion disponible.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, el uso comercial y la redistribucion quedan en una situacion juridica indeterminada. Es un bloqueante para cualquier integracion en produccion.
- Ausencia total de evaluacion: no hay benchmarks, no hay mediciones de perplejidad y no hay comparaciones con el checkpoint base, por lo que no se puede verificar que la fusion haya mejorado o degradado el modelo original.
- Riesgo de alucinacion: al ser un modelo base de 1,28 B sin alineacion, la generacion de contenido factualmente incorrecto con apariencia de verosimilitud es esperable y no mitigada.
- Sesgos: no se documenta ninguna auditoria de sesgo ni la composicion del dataset. Los modelos entrenados sobre corpus web suelen reproducir estereotipos y sesgos de dichas fuentes; en este caso no hay datos para cuantificarlo.
- Idiomas: no se declara ninguna lista de idiomas soportados. El rendimiento fuera del ingles es, como minimo, incierto.
- Longitud de contexto desconocida: al no publicarse, no se puede garantizar el comportamiento en contextos largos ni planificar despliegues que dependan de ello.
- Naturaleza del artefacto: es una media de pesos de cinco checkpoints del mismo run, no un modelo independiente. Cambios en el rendimiento pueden deberse a la fusion y no a mejoras reales de capacidad.
- Sin plantilla de chat ni formato de herramientas: el uso directo como asistente o en pipelines de agentes requiere trabajo adicional de ajuste y formateo.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe retroalimentacion externa sobre su calidad.
- Fechas de publicacion inusuales: los metadatos indican creacion y actualizacion el 2026-09-17, dato que conviene verificar antes de citarlo.
- Origen de las rutas: la configuracion de merge referencia rutas locales absolutas de un sistema ajeno, lo que dificulta reproducir exactamente el proceso a partir de los checkpoints originales si estos no son publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-orig-10p-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta de fusion utilizada): https://github.com/cg123/mergekit
- Articulo del metodo Linear merge citado en la model card: https://arxiv.org/abs/2203.05482
- Repositorio del proyecto DataDecide: no disponible en la informacion proporcionada
- Paper o blog del experimento de origen: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles
