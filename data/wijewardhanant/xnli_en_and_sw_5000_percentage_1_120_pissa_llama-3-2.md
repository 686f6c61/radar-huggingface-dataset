# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_llama-3.2

## Resumen

WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_llama-3.2 es un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de un checkpoint PEFT (0,3 GB en safetensors) que debe cargarse sobre el modelo base declarado, meta-llama/Llama-3.2-3B. La model card es la plantilla por defecto de HuggingFace sin rellenar: no incluye descripcion, datos de entrenamiento, hiperparametros ni resultados de evaluacion.

A partir del identificador del repositorio puede inferirse, sin confirmacion por parte del autor, que el ajuste se realizo sobre el corpus XNLI en ingles y swahili (aproximadamente 5.000 ejemplos, con algun submuestreo indicado por el sufijo "percentage_1_120") y que se empleo PiSSA (Principal Singular values and Singular vectors Adaptation), una variante de LoRA que inicializa las matrices de bajo rango con la descomposicion SVD de los pesos originales en lugar de con ruido. El tag arxiv:1910.09700 que aparece en el repositorio corresponde al articulo de estimacion de impacto ambiental citado en la propia plantilla, no a un paper del metodo de ajuste.

Se trata, por tanto, de un artefacto de investigacion sin validacion publica: cero descargas, cero "likes", sin licencia declarada y sin resultados de benchmarks. Su interes practico es limitado y siempre como punto de partida reproducible para experimentos de inferencia de lenguaje natural (NLI) multilingue o para comparar PiSSA frente a LoRA clasico sobre Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT de bajo rango sobre transformer decoder-only (Llama 3.2-3B) |
| Parametros totales | No disponible para el adaptador (rank y modulos objetivo no publicados). Modelo base: 3.210 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el repositorio. Modelo base: 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precision original; admite fusion con el base y posterior cuantizacion) |
| Idiomas soportados | No disponibles. Modelo base: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes. El nombre del repositorio sugiere ingles y swahili |
| Licencia | No disponible en el repositorio. Modelo base: Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | meta-llama/Llama-3.2-3B |
| Libreria | peft (framework declarado: PEFT 0.17.1) |
| Metodo de ajuste | LoRA con inicializacion PiSSA (inferido del identificador del repositorio) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de Llama 3.2-3B: un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, atencion con consultas agrupadas (GQA) y embeddings rotatorios (RoPE), entrenado por Meta con un cutoff de conocimiento declarado en diciembre de 2023. Sobre ese modelo se ha aplicado un ajuste parametrizado eficiente (PEFT) del tipo LoRA, con la particularidad de que el nombre del repositorio indica inicializacion PiSSA. Este metodo descompone cada matriz de pesos en sus valores y vectores singulares principales, congela el residuo y entrena unicamente el componente de bajo rango inicializado con esa SVD, lo que suele acelerar la convergencia en comparacion con la inicializacion aleatoria estandar de LoRA.

No hay informacion publicada sobre el procedimiento de entrenamiento: se desconocen el rank, el valor de alpha, la tasa de aprendizaje, el numero de epocas, los modulos objetivo, el regimen de precision ni si hubo una fase posterior de alineacion (RLHF, DPO) sobre el adaptador. El nombre del repositorio apunta a un subconjunto de XNLI en ingles y swahili de unos 5.000 ejemplos, pero esta composicion no esta documentada en la model card y debe considerarse una hipotesis de trabajo, no un dato verificado. Tampoco se indica si el corpus se filtro, se tradujo o se remuestreo por clase.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 3.2-3B.
- Clasificacion de pares de frases mediante prompt (tarea NLI: implicacion, contradiccion, neutralidad), que es el uso que sugiere el identificador del repositorio.
- Transferencia cross-lingue ingles-swahili potencial, en caso de que el ajuste se haya realizado efectivamente sobre XNLI en esos dos idiomas.
- Capacidades multilingues del modelo base para ocho idiomas, previsiblemente degradadas en el adaptador por el ajuste especifico y el riesgo de olvido catastrofico.
- Tool calling y function calling: no documentado en el repositorio; el modelo base Llama 3.2-3B si los soporta segun su model card oficial.
- Modo de razonamiento explicito (thinking mode): no soportado.
- Vision, audio o entrada multimodal: no soportado. Llama 3.2-3B es exclusivamente de texto.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Investigacion en NLI multilingue: evaluar si un adaptador PiSSA de bajo rango reproduce la precision de un ajuste LoRA equivalente sobre el mismo subconjunto de XNLI, sirviendo como linea base experimental reproducible.
- Transferencia cross-lingue ingles-swahili: estudiar cuanto de la capacidad de inferencia en ingles se transfiere al swahili cuando el ajuste ha visto ejemplos en ambos idiomas, un escenario relevante para lenguas de bajos recursos.
- Anotacion asistida de corpus: preetiquetar pares de frases como implicacion, contradiccion o neutralidad antes de una revision humana, con un coste computacional muy bajo al tratarse de un modelo de 3.000 millones de parametros.
- Docencia y practica con PEFT: ejemplo minimo y ligero para que estudiantes carguen un adaptador, lo fusionen con el modelo base y comparen el comportamiento antes y despues del ajuste en una GPU de consumo.
- Prototipado rapido de clasificadores de texto: reutilizar el adaptador como punto de partida para tareas de clasificacion de dos frases (deteccion de contradicciones en documentacion tecnica, verificacion de hechos simples) antes de invertir en un ajuste mayor.
- Comparativa de metodos de inicializacion: emplear este checkpoint junto a un adaptador LoRA estandar para medir diferencias de convergencia y rendimiento atribuibles a PiSSA.
- Filtrado de datos sinteticos: usar las predicciones del modelo como heuristica barata para descartar pares de frases incoherentes en un pipeline de generacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio mantiene la plantilla original con todos los campos de evaluacion marcados como "[More Information Needed]", y no se han encontrado resultados de XNLI, MMLU, GSM8K ni de ninguna otra tarea para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, pero requiere cargar el modelo base Llama-3.2-3B completo para funcionar.
- VRAM estimada para el modelo base fusionado, segun el formato habitual: aproximadamente 6,5 GB en FP16/BF16, en torno a 3,5 GB en INT8 y alrededor de 2,5 GB en cuantizacion de 4 bits.
- GPUs recomendadas: una NVIDIA RTX 3060 de 12 GB o superior es suficiente para inferencia en FP16. Para servicio con concurrencia alta se recomiendan A100 40 GB, H100 80 GB o L40S, aunque el modelo es pequeno y no las aprovecha a nivel de capacidad de memoria.
- Cabe sin problemas en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, e incluso en equipos con 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para servicio concurrente; fusion del adaptador con el modelo base seguida de conversion a GGUF para llama.cpp, Ollama o LM Studio. Tambien es posible usar TGI, aunque el repositorio no incluye configuracion de despliegue.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_llama-3.2 | Adaptador sobre 3,21 B | No disponible (base: 128k) | Adaptador PEFT/LoRA (PiSSA) | No disponible | Publico, sin descargas ni evaluacion |
| meta-llama/Llama-3.2-3B | 3,21 B | 128.000 tokens | Modelo completo | Llama 3.2 Community License | Publico, ampliamente validado |
| Adaptador LoRA estandar sobre Llama-3.2-3B | Configurable (tipicamente 10-100 M entrenables) | Heredado del base | Adaptador PEFT/LoRA | Segun autor | Depende del repositorio |
| Modelos NLI basados en XLM-R (por ejemplo, familia XNLI) | 278 M - 560 M | 512 tokens | Transformer encoder | MIT / Apache 2.0 | Publicos y evaluados en XNLI |

La comparacion cuantitativa de rendimiento no es posible: no hay resultados publicados para este adaptador. Frente a los modelos basados en XLM-R, la ventaja teorica de este checkpoint es la generacion de texto libre y un contexto mucho mayor; la desventaja es la ausencia total de validacion y de licencia declarada.

## Limitaciones y advertencias

- Model card vacia: todos los campos de descripcion, uso previsto, datos de entrenamiento, hiperparametros y evaluacion figuran como "[More Information Needed]". No hay informacion verificable sobre el ajuste.
- Sin licencia declarada: no puede asumirse uso comercial. Ademas, al derivar de Llama 3.2, se heredan las restricciones de la Llama 3.2 Community License, que exige incluir el aviso de licencia, mantener la denominacion "Llama" y aceptar clausulas de uso aceptable.
- Ausencia de validacion: cero descargas y cero "likes" en el momento de redactar esta ficha. No hay ninguna evaluacion independiente que respalde su calidad.
- Procedencia del dataset incierta: la composicion exacta de los datos de entrenamiento, el submuestreo indicado en el nombre y la calidad de las anotaciones no estan documentados.
- Riesgo de olvido catastrofico: un ajuste especifico sobre 5.000 ejemplos en dominios e idiomas concretos puede degradar las capacidades generales del modelo base (generacion de codigo, matematicas, instrucciones generales).
- Alucinacion: no hay evaluacion de fidelidad ni de tasas de invencion; en tareas de clasificacion, el modelo puede producir etiquetas distintas de las tres clases esperadas si no se restringe la decodificacion.
- Idiomas: no se declaran idiomas soportados. Cualquier uso en castellano es extrapolacion y no esta garantizado, ni siquiera asumiendo el soporte del modelo base.
- Sesgos: no evaluados. El modelo base Llama 3.2 presenta sesgos conocidos documentados por Meta, y el ajuste sobre XNLI puede introducir sesgos adicionales ligados al dominio y al idioma del corpus.
- Datos "sensibles" en el identificador: los sufijos "5000", "percentage_1" y "120" no estan explicados, lo que dificulta la reproducibilidad del experimento.
- No apto para produccion sin una evaluacion previa exhaustiva en la tarea objetivo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_PiSSA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Paper citado en los tags del repositorio (estimacion de impacto ambiental, no relacionado con el metodo de ajuste): https://arxiv.org/abs/1910.09700
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a paginas de inicio de sesion de Facebook y a la entrada de Wikipedia de dicha plataforma. No se han encontrado papers, blogs, demos ni repositorios adicionales.
