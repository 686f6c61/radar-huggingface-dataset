# WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_120_DoRA

## Resumen

WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_120_DoRA es un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT sobre el modelo base meta-llama/Llama-3.1-8B. Se distribuye como un repositorio PEFT de 0,1 GB en formato safetensors, es decir, contiene únicamente los pesos del adaptador y no el modelo completo. El pipeline declarado es text-generation y la librería indicada es peft (PEFT 0.17.1).

El nombre del repositorio sugiere que el ajuste se ha realizado sobre el corpus TyDiQA, un benchmark de respuesta a preguntas extractiva en 11 idiomas tipológicamente diversos, restringido a inglés (en) y telugu, con 3.000 ejemplos y algún parámetro identificado como "percentage_1_120". La técnica de adaptación empleada es DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone la actualización de pesos en magnitud y dirección. Ninguno de estos extremos está confirmado en la model card, que es una plantilla sin rellenar.

La relevancia de esta ficha es limitada y debe leerse con cautela: el repositorio acumula 10 descargas y 0 likes, la model card no documenta datos de entrenamiento, hiperparámetros, licencia ni idiomas, y no se ha publicado ninguna evaluación. Se trata, por tanto, de un artefacto de investigación sin validar, útil únicamente como punto de partida para reproducir o auditar el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) sobre un transformer decoder-only; el modelo base Llama 3.1 8B usa RoPE y Grouped Query Attention (GQA) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 8.030 millones de parametros |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT en safetensors, puede combinarse con bases cuantizadas en 4 u 8 bits (bitsandbytes) o cargarse en bf16/fp16, pero el autor no lo especifica |
| Idiomas soportados | No disponible. El nombre del repositorio menciona ingles (en) y telugu, pero la model card no lo confirma |
| Licencia | No disponible. El modelo base se distribuye bajo la Llama 3.1 Community License y sus terminos se heredan en trabajos derivados |
| Formato de pesos | safetensors (adaptador PEFT; el repositorio ocupa 0,1 GB) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador, no un modelo completo. El modelo base es meta-llama/Llama-3.1-8B, un transformer decoder-only de 8.030 millones de parametros con tokenizador de 128.256 entradas, RoPE para codificacion posicional y GQA para reducir el coste de la cache KV. La arquitectura del adaptador es DoRA, que descompone cada matriz de pesos preentrenada en un componente de magnitud y otro de direccion, aplica la descomposicion de bajo rango (el mecanismo de LoRA) sobre la direccion y entrena la magnitud como parametro independiente. Esto suele mejorar la estabilidad del ajuste y el rendimiento frente a LoRA con el mismo numero de parametros entrenables.

No hay informacion sobre el procedimiento de entrenamiento. La model card no indica numero de tokens, composicion del dataset, hiperparametros (learning rate, epochs, rank, alpha, dropout), regimen de precision ni si hubo RLHF, DPO o alguna fase de alineamiento. La nomenclatura del repositorio ("tydiqa_en_and_telugu_3000_percentage_1_120") sugiere el uso del dataset TyDiQA, un benchmark de respuesta a preguntas extractiva en 11 idiomas que incluye telugu e ingles y que se recoge de forma nativa, no traducida. Tambien sugiere 3.000 ejemplos de entrenamiento y algun parametro adicional ("percentage_1_120") cuya interpretacion no esta confirmada. El repositorio se creo y actualizo el 22 de septiembre de 2026, con 11 segundos de diferencia entre ambos eventos, lo que apunta a una subida automatizada sin edicion posterior.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Llama 3.1 8B. No hay verificacion especifica para el adaptador.
- Respuesta a preguntas extractiva: presumiblemente la tarea objetivo del ajuste, dado el nombre del repositorio y el uso de TyDiQA. No confirmado por el autor ni evaluado.
- Cobertura multilingue: el adaptador parece centrado en ingles y telugu. El modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Tool calling y function calling: el modelo base Llama 3.1 soporta llamada a herramientas de forma nativa. No hay confirmacion de que el adaptador preserve esta capacidad ni de que el ajuste la haya entrenado.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Llama 3.1 8B es un modelo exclusivamente de texto.

## Casos de uso

Los siguientes casos son escenarios plausibles derivados de la naturaleza del adaptador y del modelo base. Ninguno cuenta con validacion publicada, por lo que deben tratarse como hipotesis de trabajo y no como capacidades confirmadas.

- Extraccion de respuestas en documentos en telugu: el adaptador se usaria para localizar el fragmento que responde a una pregunta sobre un texto en telugu, aprovechando el ajuste sobre TyDiQA. Requiere validacion previa, ya que no hay metricas publicadas.
- Sistemas de busqueda semantica bilingue ingles-telugu: combinado con un motor de recuperacion, el modelo podria reranquear o extraer pasajes relevantes en ambos idiomas. El contexto de 128.000 tokens del modelo base permitiria procesar documentos largos en una sola pasada.
- Asistencia a la anotacion de corpus: generacion de respuestas candidatas para que anotadores humanos las revisen en proyectos de construccion de datasets de QA en idiomas de bajos recursos.
- Investigacion sobre tecnicas de ajuste eficiente: el repositorio sirve como caso de estudio reproducible de DoRA aplicado a un modelo de 8.000 millones de parametros con un presupuesto de almacenamiento de 0,1 GB.
- Prototipado academico de QA extractivo: punto de partida para comparar DoRA frente a LoRA en tareas multilingues, siempre que se documenten y repitan los experimentos.
- Clasificacion y extraccion de entidades sobre texto en telugu: con un ajuste adicional de la cabeza de salida, el adaptador podria servir de base para tareas de extraccion de informacion, aunque no hay evidencia de que el entrenamiento actual lo cubra.
- Despliegue en entornos con VRAM limitada: al ser un adaptador pequeno, permite servir multiples variantes especializadas sobre una unica instancia del modelo base en vLLM, cambiando el adaptador por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card esta vacia y contiene unicamente marcadores "[More Information Needed]" en todas sus subsecciones (datos de test, factores, metricas y resultados). No existen cifras de MMLU, HumanEval, GSM8K, F1 sobre TyDiQA ni de ninguna otra metrica, ni para el adaptador ni en comparacion con alternativas.

## Requisitos de hardware

- Adaptador: 0,1 GB en safetensors. El coste de almacenamiento es despreciable frente al modelo base.
- Peso del modelo base en bf16/fp16: aproximadamente 16 GB de pesos, que con cache KV y overhead de runtime se traducen en unos 18-20 GB de VRAM para contextos cortos y mas de 24 GB si se explota la ventana de 128.000 tokens.
- Cuantizacion en 8 bits (bitsandbytes): aproximadamente 8-9 GB de VRAM.
- Cuantizacion en 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB de VRAM.
- GGUF en llama.cpp: Q4_K_M alrededor de 4,9 GB y Q8_0 alrededor de 8,5 GB, sin contar la cache KV.
- GPU consumer: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantizacion de 8 bits; en GPUs de 8-12 GB solo con cuantizacion de 4 bits.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son suficientes y permiten lotes grandes o contextos largos.
- Opciones de despliegue: transformers + peft (ruta natural para un adaptador DoRA), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama tras fusionar el adaptador con los pesos base. El soporte de DoRA no esta garantizado en todos los runtimes; PEFT 0.17.1 permite fusionar el adaptador mediante merge_and_unload.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| tydiqa_en_and_telugu_3000_percentage_1_120_DoRA | Adaptador sobre 8.030 M | No disponible (base: 128.000 tokens) | No disponible | HuggingFace, 10 descargas, 0 likes | Sin evaluacion publicada |
| meta-llama/Llama-3.1-8B (base) | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente distribuido | Publica resultados en MMLU, GSM8K y otros |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente distribuido | Publica resultados en benchmarks de instrucciones y tool calling |
| Ajuste completo sobre TyDiQA (referencia generica) | 8.030 M | 128.000 tokens | Depende del autor | No disponible | No disponible |

No se dispone de datos objetivos para comparar el rendimiento de este adaptador con alternativas de la misma categoria. La comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Model card vacia: todas las secciones estan sin rellenar. No hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Ausencia total de evaluacion: no existe ninguna metrica publicada. No se puede afirmar que el ajuste haya mejorado las capacidades del modelo base en telugu, en ingles o en cualquier otra tarea.
- Licencia sin especificar: el repositorio no declara licencia. El modelo base esta sujeto a la Llama 3.1 Community License, que impone restricciones de uso (incluida la clausula de licencia adicional para empresas con mas de 700 millones de usuarios mensuales) y obligaciones de atribucion. Cualquier uso comercial requiere verificar el cumplimiento de esos terminos.
- Riesgo de sobreajuste: el nombre sugiere un entrenamiento sobre 3.000 ejemplos, un volumen reducido que puede provocar sobreajuste al dominio y al formato de TyDiQA y degradar capacidades generales del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos. En tareas extractivas, el modelo puede producir respuestas plausibles pero no presentes en el documento fuente. Sin evaluacion no es posible cuantificar este riesgo.
- Cobertura idiomatica no confirmada: aunque el nombre menciona ingles y telugu, la model card no declara idiomas soportados. No hay garantia de comportamiento correcto en otros idiomas, incluido el espanol.
- Trazabilidad muy baja: 10 descargas, 0 likes, creado y actualizado con 11 segundos de diferencia. No hay historial de versiones, paper asociado ni autor identificable mas alla del nombre de usuario.
- Resultados de busqueda web no concluyentes: las consultas realizadas no devolvieron documentacion tecnica sobre el modelo; los enlaces recuperados corresponden a paginas de ayuda de YouTube TV y a foros sin relacion con el artefacto.
- Formato de adaptador: el uso en produccion exige cargar el modelo base por separado y aplicar el adaptador. La fusion de DoRA requiere un runtime compatible; no todos los servidores de inferencia lo soportan de forma nativa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_120_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimacion de emisiones de carbono): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este modelo en los resultados de busqueda web disponibles.
