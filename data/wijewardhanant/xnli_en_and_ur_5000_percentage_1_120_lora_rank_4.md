# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_rank_4

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) de rango 4 entrenado sobre el modelo base meta-llama/Llama-3.1-8B. Segun el identificador del repositorio (xnli_en_and_ur_5000_percentage_1_120_LoRA_rank_4), el ajuste se ha orientado a la tarea XNLI (inferencia de lenguaje natural entre idiomas) en ingles y urdu, con un conjunto de entrenamiento de 5000 ejemplos por idioma y una configuracion de 120 pasos o 120 ejemplos, dato que no queda confirmado por la model card. El autor es el usuario de Hugging Face WijewardhanaNT.

No es un modelo completo, sino un conjunto de pesos de adaptador que requiere cargar el modelo base Llama-3.1-8B para funcionar. El repositorio ocupa 0,3 GB y se distribuye en formato safetensors bajo la libreria PEFT 0.17.1. La model card publicada es la plantilla por defecto de Hugging Face y no aporta informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion, por lo que la mayoria de especificaciones quedan como no disponibles.

Su relevancia actual es limitada y de caracter experimental: no registra descargas ni interacciones, no incluye resultados de benchmark y no documenta el procedimiento de entrenamiento. Resulta util unicamente como referencia para quien quiera reproducir o auditar adaptadores LoRA de bajo rango aplicados a tareas de clasificacion de pares de frases en contextos multilingues con bajos recursos, en particular urdu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama-3.1-8B); rango 4 segun el identificador del repositorio |
| Parametros totales | No disponible para el adaptador (el repositorio ocupa 0,3 GB). El modelo base declara 8.030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador. El modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, admite combinacion con el modelo base en fp16, bf16, int8 e int4, pero no se documenta ninguna configuracion validada |
| Idiomas soportados | No disponible oficialmente. El identificador del repositorio sugiere ingles y urdu |
| Licencia | No disponible. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.17.1 (compatible con transformers) |
| Tarea declarada | text-generation (pipeline_tag), aunque el nombre apunta a clasificacion XNLI |
| Modelo base | meta-llama/Llama-3.1-8B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base meta-llama/Llama-3.1-8B, un transformer decoder-only autorregresivo con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado originalmente con una ventana de contexto de 128.000 tokens. Sobre ese modelo se ha insertado un adaptador LoRA de rango 4, lo que implica matrices de bajo rango de dimension reducida en las capas seleccionadas. El rango 4 es inusualmente bajo y limita de forma severa la capacidad de adaptacion, lo que sugiere un experimento de eficiencia de parametros mas que un ajuste destinado a produccion.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, la tasa de aprendizaje, el optimizador, la precision numerica ni el numero de epocas. La model card no incluye la seccion de detalles de entrenamiento cumplimentada. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras). El unico dato verificable de configuracion es la version de PEFT empleada (0.17.1) y la referencia generica al calculo de emisiones de Lacoste et al. (2019), que forma parte del texto plantilla y no implica que se haya realizado dicho calculo.

## Capacidades

- Generacion de texto: heredada del modelo base Llama-3.1-8B, que es un modelo de lenguaje generalista. El adaptador no modifica esta capacidad de forma documentada.
- Clasificacion de pares de frases: el identificador del repositorio (xnli) apunta a inferencia de lenguaje natural, es decir, clasificar un par premisa-hipotesis como implicacion, contradiccion o neutralidad. No hay confirmacion en la model card.
- Multilingue: potencialmente ingles y urdu segun el identificador, sin documentacion que lo respalde.
- Tool calling / function calling: no disponible en la informacion proporcionada. El modelo base Llama 3.1 si dispone de soporte de llamadas a herramientas, pero se desconoce si el adaptador lo conserva.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ajuste mediante adaptador desacoplable: el adaptador puede activarse o desactivarse, lo que permite comparar el comportamiento con y sin ajuste sobre el mismo modelo base.

## Casos de uso

- Experimentacion academica en XNLI: el adaptador puede cargarse sobre Llama-3.1-8B para reproducir un experimento de ajuste LoRA de rango muy bajo en una tarea de inferencia textual, y comparar la degradacion frente a rangos mayores. Es adecuado por su tamano reducido (0,3 GB) y su facil integracion con PEFT.
- Evaluacion de transferencia multilingue ingles-urdu: si se confirma el objetivo del entrenamiento, serviria para medir cuanto conocimiento de una tarea en ingles se transfiere al urdu con solo 5000 ejemplos por idioma, un escenario tipico de bajos recursos.
- Estudio de eficiencia de parametros: con rango 4, el adaptador es un caso de prueba util para analizar el minimo de parametros entrenables necesario antes de que el rendimiento colapse, dentro de una linea de investigacion sobre LoRA.
- Punto de partida para ajustes posteriores: un investigador podria usar estos pesos como inicializacion para un LoRA de rango mayor o para una segunda fase de entrenamiento con mas datos, dado el bajo coste de almacenamiento.
- Clasificacion de textos en pipelines ligeros de investigacion: si el adaptador funciona como clasificador, podria integrarse en un prototipo de analisis de textos en ingles o urdu, siempre con validacion previa porque no hay metricas publicadas.
- Auditoria y ensenanza de PEFT: el repositorio sirve como ejemplo practico de empaquetado de adaptadores con la libreria peft y del formato safetensors, util en material docente sobre ajuste eficiente.
- Analisis de sesgos en modelos multilingues: al ser un ajuste sobre Llama 3.1, permite estudiar como se propagan los sesgos del modelo base hacia una tarea discriminativa en dos idiomas.
- No se recomienda su uso en produccion con clientes: la ausencia de licencia, de evaluacion y de documentacion impide garantizar calidad o cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin cumplimentar y el repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento.

| Benchmark | Resultado |
|---|---|
| XNLI (ingles) | No disponible |
| XNLI (urdu) | No disponible |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- El adaptador por si solo no ejecuta inferencia: requiere cargar meta-llama/Llama-3.1-8B, por lo que los requisitos son los del modelo base de 8.030 millones de parametros.
- VRAM estimada para el modelo base: aproximadamente 16 GB en fp16/bf16, 9-10 GB en cuantizacion int8 y 5-6 GB en int4 (valores orientativos estandar para 8B, no verificados en este repositorio).
- GPU recomendadas para despliegue comodo: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB, especialmente si se quiere mantener contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 sin problema, y en RTX 3090 (24 GB) o RTX 4080 (16 GB) con cuantizacion. En GPUs de 8-12 GB es necesario int4.
- Opciones de despliegue: vLLM o TGI para servicio de alto rendimiento con el modelo fusionado; llama.cpp u Ollama si se convierte a GGUF; transformers con PEFT para uso en investigacion; entrenamiento adicional con el propio framework PEFT.
- Fusion de pesos: para servir con motores que no soportan adaptadores en caliente, hay que fusionar el LoRA con el modelo base, lo que genera un checkpoint de aproximadamente 16 GB en fp16.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo, tiempo hasta el primer token ni consumo energetico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_rank_4 | Adaptador LoRA rango 4 sobre 8B | No disponible | Adaptador PEFT | No disponible | Repositorio HF, 0 descargas | No disponible |
| meta-llama/Llama-3.1-8B (modelo base) | 8.030 M | 128.000 tokens | Transformer decoder-only | Llama 3.1 Community License | Ampliamente disponible | Si, publicado por Meta |
| XLM-RoBERTa-large ajustado a XNLI | 550 M | 512 tokens | Transformer encoder-only | MIT (segun el checkpoint) | Disponible en HF | Si, en la literatura original de XLM-R |
| Otros adaptadores LoRA para XNLI en HF | Variable | Depende del base | Adaptador PEFT | Variable | Alta dispersion | Habitualmente no disponible |

La comparacion de rendimiento con alternativas no es posible porque este adaptador no publica ninguna metrica. Frente al modelo base, la diferencia es que el adaptador introduce un ajuste especifico de tarea de bajo rango; frente a encoder-only como XLM-R, la diferencia estructural es que aqui se reutiliza un decoder generativo de 8B para una tarea discriminativa, con un coste de inferencia muy superior.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto y no aporta informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no especificada: el repositorio no declara licencia. Aunque el modelo base se rige por la Llama 3.1 Community License, no hay certeza sobre los terminos aplicables al adaptador, lo que impide su uso comercial sin aclaracion previa del autor.
- Sin resultados de evaluacion: no hay ninguna metrica que permita estimar la calidad del ajuste, ni siquiera en la tarea objetivo declarada por el nombre del repositorio.
- Rango LoRA muy bajo (4): la capacidad de adaptacion es limitada y es plausible un ajuste insuficiente para la tarea, aunque no puede confirmarse sin evaluacion.
- Ambiguedad de la tarea: el pipeline_tag declarado es text-generation, mientras que el identificador apunta a clasificacion XNLI. Esta incoherencia complica el uso correcto del modelo.
- Riesgo de alucinacion: si se emplea como generador, hereda el riesgo de alucinacion del modelo base Llama-3.1-8B, no mitigado por un adaptador de este tamano.
- Sesgos: no documentados. Al derivar de Llama 3.1, cabria esperar los sesgos conocidos del modelo base, potencialmente agravados en urdu por la menor representacion de ese idioma en los datos originales.
- Idiomas no confirmados: la unica evidencia de soporte de ingles y urdu es el nombre del repositorio.
- Reproducibilidad nula: sin hiperparametros ni datos publicados, el experimento no es replicable.
- Sin mantenimiento aparente: 0 descargas, 0 interacciones y una unica version publicada.
- Advertencia de produccion: no debe desplegarse en sistemas reales sin una evaluacion propia, verificacion de licencia y pruebas de robustez en los idiomas objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_LoRA_rank_4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia sobre LoRA: https://arxiv.org/abs/2106.09685
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Dataset XNLI (referencia de la tarea): https://huggingface.co/datasets/facebook/xnli
