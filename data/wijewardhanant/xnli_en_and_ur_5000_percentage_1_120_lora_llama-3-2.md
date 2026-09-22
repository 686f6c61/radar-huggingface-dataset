# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_llama-3.2

## Resumen

El modelo WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_llama-3.2 es un adaptador LoRA de tipo PEFT publicado por el usuario WijewardhanaNT sobre el modelo base meta-llama/Llama-3.2-3B. Por la nomenclatura del identificador se deduce que el entrenamiento se ha orientado a la tarea XNLI (inferencia de lenguaje natural, NLI) con datos en ingles y urdu, sobre un subconjunto de 5000 ejemplos, con un porcentaje de datos identificado como "1" y un rango LoRA de 120. Ninguno de estos extremos aparece confirmado en la model card, que es la plantilla por defecto de Hugging Face y no ha sido rellenada por el autor.

El repositorio contiene unicamente los pesos del adaptador en safetensors, con un tamano de 0.3 GB, y depende del modelo base (3.210 millones de parametros) para poder ejecutarse. Su interes practico se limita, a dia de hoy, al ambito de la investigacion: es un ejemplo de ajuste eficiente de un modelo de 3B para clasificacion NLI bilingue ingles-urdu, un idioma de bajos recursos donde escasean los recursos supervisados.

La relevancia del modelo es, por tanto, potencial y no demostrada: no hay resultados de evaluacion publicados, no tiene descargas ni "likes" registrados y la model card no documenta datos de entrenamiento, hiperparametros ni uso previsto. Cualquier evaluacion seria exige inspeccionar el adapter_config.json del repositorio y validar el adaptador contra un conjunto de test NLI propio antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.2 3B) con adaptador LoRA; configuracion de modulos objetivo no disponible |
| Parametros totales | Aproximadamente 3.210 millones en el modelo base; numero exacto de parametros entrenables del adaptador no disponible (pesos en safetensors de 0.3 GB) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base meta-llama/Llama-3.2-3B declara 128.000 tokens |
| Tipos de cuantizacion | No disponible en la model card; el adaptador se distribuye en safetensors (precision original no declarada) |
| Idiomas soportados | No disponible en la model card; el identificador sugiere ingles y urdu |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); biblioteca declarada: peft 0.17.1 |
| Pipeline declarado | text-generation |
| Tarea probable | Clasificacion NLI (entailment / neutral / contradiction), inferida del identificador |
| Tamano del repositorio | 0.3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo meta-llama/Llama-3.2-3B: un transformer decoder-only autorregresivo, con atencion por grupos (GQA) y ventana de contexto declarada de 128.000 tokens por Meta. Sobre ese modelo se ha entrenado un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en capas del transformer que se suman a los pesos congelados del modelo base. El repositorio no incluye informacion sobre que modulos se han adaptado (q_proj, v_proj, mlp, etc.), el valor de alpha, el dropout ni el rango efectivo mas alla de la pista que da el sufijo "120" del identificador.

No hay datos en la model card sobre el procedimiento de entrenamiento: se desconoce el numero de tokens procesados, la composicion exacta del dataset, si se aplico RLHF, DPO u otra tecnica de alineamiento, y la precision utilizada (fp32, fp16 o bf16). La model card tampoco documenta hiperparametros, infraestructura de computo ni emisiones de carbono. El unico dato tecnico verificable es la version de PEFT declarada (0.17.1), lo que implica compatibilidad con las versiones de transformers y torch contemporaneas a esa release. La etiqueta arxiv:1910.09700 que aparece en los tags no corresponde a un articulo sobre este modelo: es la referencia a Lacoste et al. (2019), citada en la plantilla de Hugging Face para el calculo de emisiones.

## Capacidades

- Clasificacion NLI: la finalidad probable del adaptador es asignar una de tres etiquetas (implicacion, neutralidad, contradiccion) a un par de frases. No confirmado por el autor.
- Idiomas: ingles y urdu, segun el identificador del repositorio. La model card no declara idiomas.
- Generacion de texto: el modelo base Llama 3.2 3B es capaz de generacion, razonamiento basico, codigo y aritmetica elemental; no hay evidencia de que estas capacidades se conserven intactas tras el ajuste, y un fine-tuning de clasificacion suele degradarlas.
- Tool calling / function calling: el modelo base dispone de soporte nativo de llamadas a funciones; no hay confirmacion de que el adaptador lo mantenga.
- Agentes y razonamiento multi-paso: no verificado.
- Capacidades multimodales: no disponibles. Llama 3.2 3B es exclusivamente de texto; las variantes con vision de la familia son las de 11B y 90B.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad especial: ninguna documentada.

## Casos de uso

- Clasificacion de pares de frases para investigacion en NLI: validar si el adaptador reproduce resultados razonables en el conjunto de test de XNLI para ingles y urdu, comparandolo con el modelo base sin ajustar. Es el uso mas directo y el unico coherente con la nomenclatura del repositorio.
- Verificacion de fidelidad en pipelines RAG: comprobar si el contexto recuperado implica la respuesta generada por otro modelo, usando la salida NLI como filtro para descartar respuestas no sustentadas antes de mostrarlas al usuario.
- Deteccion de contradicciones en documentacion tecnica: comparar pares de fragmentos de manuales o fichas de producto en ingles y urdu para senalar versiones inconsistentes, con revision humana posterior.
- Curación de corpus paralelos y de entrenamiento: filtrar pares de frases contradictorias o mal alineadas en la construccion de datasets bilingues, como paso previo a un entrenamiento mayor.
- Evaluacion automatica de resumenes: emplear la relacion de implicacion entre el documento fuente y el resumen candidato como metrica auxiliar de fidelidad, en lugar de metricas puramente lexicas como ROUGE.
- Procesamiento de lenguaje natural en urdu: servir de punto de partida para experimentos de transferencia cross-lingual en un idioma con pocos recursos supervisados, dado el bajo coste de un adaptador de este tamano.
- Moderacion asistida de contenido y deteccion de afirmaciones incompatibles en foros o comentarios en urdu, siempre con umbral de confianza conservador y supervision humana.
- Base para destilacion o ajuste posterior: reutilizar el adaptador como inicializacion en experimentos academicos sobre Llama 3.2 3B, dado su bajo coste de almacenamiento (0.3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay seccion de evaluacion en la model card, no se adjuntan metricas de accuracy ni F1 sobre el conjunto de test de XNLI, ni comparaciones con el modelo base o con alternativas. El repositorio acumula 0 descargas y 0 likes, por lo que tampoco existe validacion por parte de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (3.210 millones de parametros) y deben tratarse como orientativas, ya que el autor no publica mediciones:

- VRAM en fp16/bf16: aproximadamente 6,4 GB solo para los pesos del modelo base, mas la cache KV; en la practica, entre 8 y 12 GB segun longitud de contexto y tamano de lote. El adaptador anade unos 0,3 GB.
- VRAM en cuantizacion de 8 bits: en torno a 3,5-4 GB de pesos.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ o GGUF Q4_K_M): aproximadamente 2-2,5 GB de pesos, con un consumo total tipico de 4-6 GB contando cache KV.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB, una RTX 4070 o una RTX 4090 en fp16 con contextos moderados; en 4 bits es viable en GPUs de 8 GB como la RTX 3060 Ti o la RTX 4060, con contexto reducido.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S, sobredimensionadas para este tamano salvo que se necesite alto throughput concurrente.
- Opciones de despliegue: transformers con peft (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama fusionando previamente el adaptador en los pesos y convirtiendo a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor. Como referencia de orden de magnitud, un modelo denso de 3B en fp16 sobre una GPU moderna suele generar decenas de tokens por segundo, pero esto no ha sido verificado para este adaptador.
- Consideracion de integracion: si el adaptador se entreno con una cabeza de clasificacion, es necesario revisar adapter_config.json para comprobar si esa cabeza esta incluida en los pesos; en caso contrario, la carga con transformers requerira declarar la configuracion de clasificacion correspondiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en XNLI |
|---|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_llama-3.2 | Adaptador LoRA sobre Llama 3.2 3B | ~3,21 B (base) + adaptador de 0,3 GB | No disponible (128.000 en el modelo base) | No declarado; ingles y urdu segun el identificador | No disponible | No disponible |
| meta-llama/Llama-3.2-3B | Modelo base denso | 3,21 B | 128.000 tokens | Multilingue (8 idiomas soportados oficialmente; ingles y urdu no estan entre ellos) | Llama 3.2 Community License | No disponible |
| meta-llama/Llama-3.2-1B | Modelo base denso de menor tamano | 1,24 B | 128.000 tokens | Multilingue (mismos 8 idiomas oficiales) | Llama 3.2 Community License | No disponible |
| joeddav/xlm-roberta-large-xnli | Modelo discriminativo ajustado especificamente para XNLI | ~560 M | 512 tokens | 15 idiomas de XNLI, incluido el urdu | MIT (verificar la licencia de los datos de XNLI) | No disponible en la informacion disponible |

La comparacion con XLM-R large es la mas pertinente por tarea: un modelo encoder de 560 M ajustado para XNLI es un orden de magnitud mas pequeno que Llama 3.2 3B, tiene contexto mucho mas corto (512 tokens) y esta disenado para clasificacion, no para generacion. No se dispone de datos comparativos de rendimiento entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Model card vacia: el documento del repositorio es la plantilla por defecto de Hugging Face sin rellenar. No hay informacion sobre uso previsto, uso fuera de alcance, sesgos ni limitaciones tecnicas.
- Ausencia total de evaluacion: no se publican metricas de ningun tipo. No hay evidencia de que el adaptador funcione correctamente ni siquiera en la tarea para la que fue entrenado.
- Licencia no disponible: al ser un derivado de meta-llama/Llama-3.2-3B, el uso queda sujeto a la Llama 3.2 Community License de Meta, que incluye condiciones de atribucion ("Built with Llama"), requisitos de nomenclatura en productos derivados y una clausula de terminacion para servicios con mas de 700 millones de usuarios mensuales. La ausencia de licencia explicita en el repositorio es un riesgo juridico anadido para uso comercial.
- Licencia del dataset: XNLI y su dataset de origen, MultiNLI, se distribuyen habitualmente bajo licencias no comerciales (CC BY-NC). Si el adaptador se entreno sobre XNLI, el uso comercial del modelo resultante podria estar restringido. No se ha podido confirmar en la informacion disponible.
- Idiomas: el modelo base llama 3.2 3B no incluye oficialmente el urdu entre sus idiomas soportados, por lo que el ajuste depende de la capacidad de transferencia cross-lingual del modelo y de la calidad de los 5000 ejemplos empleados. La cobertura lexica y morfologica en urdu es una incognita.
- Degradacion de capacidades generativas: un ajuste supervisado orientado a clasificacion sobre un modelo de 3B tiende a degradar la generacion libre, el razonamiento y el soporte de tool calling del modelo base. No hay evaluacion que cuantifique este efecto.
- Riesgo de alucinacion: si el adaptador se emplea en modo generativo (pipeline declarado: text-generation) en lugar de clasificacion, hereda el riesgo de alucinacion inherente a Llama 3.2 3B, un modelo pequeno con conocidas limitaciones en conocimiento factual y aritmetica.
- Contexto efectivo desconocido: aunque el modelo base soporte 128.000 tokens, un adaptador entrenado sobre pares de frases cortas (XNLI no supera frases de una o dos lineas) no ha sido expuesto a contextos largos, por lo que su comportamiento mas alla de unos cientos de tokens es impredecible.
- Datos de entrenamiento opacos: se desconoce si los 5000 ejemplos son pares de XNLI, traducciones automaticas o datos sinteticos, lo que impide estimar sesgos de dominio y de anotacion.
- Sesgos: sin informacion sobre la composicion del dataset ni sobre el proceso de anotacion, no es posible caracterizar sesgos de genero, religion, nacionalidad u otros. Los corpus NLI de origen en ingles presentan sesgos de anotador documentados.
- Reproducibilidad: la ausencia de hiperparametros y de semillas impide reproducir el entrenamiento.
- Estado del repositorio: 0 descargas y 0 likes, con fechas de creacion y actualizacion separadas por 15 segundos, lo que sugiere una publicacion automatica sin mantenimiento posterior. No debe asumirse soporte del autor.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en los tags del repositorio (calculo de emisiones, no relacionada con este modelo): Lacoste et al. (2019), https://arxiv.org/abs/1910.09700
- Biblioteca PEFT: https://huggingface.co/docs/peft
- Modelo comparativo ajustado para XNLI: https://huggingface.co/joeddav/xlm-roberta-large-xnli
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su dataset o su autor. Los resultados devueltos corresponden a generadores de cuestionarios web (BookWidgets, PlayQuizNow, Embeddable, BeBasket) y no guardan relacion con el modelo.
