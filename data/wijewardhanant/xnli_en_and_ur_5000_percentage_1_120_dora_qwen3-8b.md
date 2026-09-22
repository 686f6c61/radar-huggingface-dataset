# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_DoRA_Qwen3-8b

## Resumen

Este repositorio contiene un adaptador de ajuste fino del tipo DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3-8B-Base, publicado por el usuario WijewardhanaNT. Se distribuye exclusivamente como pesos de adaptador en formato safetensors bajo la librería PEFT, con un tamano de repositorio de 0,7 GB, por lo que no es un modelo autonomo: requiere descargar el modelo base de 8.200 millones de parametros y aplicar el adaptador encima. El identificador del repositorio (xnli_en_and_ur_5000_percentage_1_120_DoRA_Qwen3-8b) sugiere que el entrenamiento se realizo sobre el corpus XNLI en ingles y urdu, con 5.000 ejemplos, aunque el autor no documenta nada de esto en la model card.

La relevancia de esta publicacion es limitada y debe interpretarse con cautela. El repositorio acumula 0 descargas y 0 likes, la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]", y no se declara licencia ni idiomas soportados. No hay resultados de evaluacion, ni descripcion de hiperparametros, ni procedencia de los datos.

Como pieza tecnica, resulta interesante unicamente como ejemplo de aplicacion de DoRA sobre un transformer decoder-only de ~8B parametros para una tarea de inferencia textual (NLI) bilingue ingles-urdu, un par de idiomas con recursos comparativamente escasos. Cualquier uso en produccion exigiria validar primero el adaptador, ya que la ausencia de documentacion impide conocer su comportamiento real fuera del conjunto de entrenamiento declarado de forma implicita en el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA/LoRA (PEFT) sobre Qwen3-8B-Base, transformer decoder-only con Grouped Query Attention |
| Parametros totales | No disponible para el adaptador; el modelo base declara 8.200 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; el modelo base declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors en la precision del adaptador |
| Idiomas soportados | No disponible; el identificador del repositorio sugiere ingles y urdu |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT, compatible con `peft` 0.17.1 y `transformers`) |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Qwen/Qwen3-8B-Base |
| Libreria declarada | peft |
| Tarea declarada (pipeline) | text-generation |
| Fecha de creacion | 21 de septiembre de 2026 |
| Ultima actualizacion | 21 de septiembre de 2026 |

Nota: los datos marcados como pertenecientes al modelo base proceden de la documentacion publica de Qwen3-8B-Base y no figuran en la model card de este adaptador, que esta vacia. Se incluyen unicamente como referencia del modelo sobre el que se aplica el adaptador.

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B-Base, un transformer decoder-only de 8.200 millones de parametros con atencion de consultas agrupadas (GQA), 36 capas, dimension oculta de 4.096 y un vocabulario de aproximadamente 151.000 tokens que cubre mas de un centenar de idiomas. El metodo de ajuste declarado en el nombre del repositorio es DoRA, una variante de LoRA que descompone la actualizacion de pesos en una componente de magnitud y una componente de direccion, lo que en la literatura suele permitir converger con rangos mas bajos o igualar a LoRA con menos pasos. El sufijo numerico "120" del identificador podria corresponder al rango del adaptador o al numero de pasos de entrenamiento, pero el autor no lo especifica.

No hay ninguna informacion documentada sobre el proceso de entrenamiento: ni el numero de tokens vistos, ni la composicion exacta del dataset, ni si hubo una fase de RLHF, DPO o SFT adicional. El nombre del repositorio apunta a un subconjunto de XNLI (inferencia textual en lenguaje natural) en ingles y urdu con 5.000 ejemplos, lo que de tener lugar implicaria un ajuste supervisado puro sobre etiquetas de tres clases (entailment, neutral, contradiction), sin alineacion posterior. La model card solo aporta un dato tecnico verificable: la version de PEFT empleada, 0.17.1. La etiqueta `arxiv:1910.09700` del repositorio no corresponde a un paper de este modelo, sino al articulo de Lacoste et al. (2019) sobre calculo de emisiones de carbono, incluido por defecto en la plantilla de HuggingFace.

## Capacidades

- Clasificacion de pares de frases (inferencia textual / NLI): si el ajuste es el que sugiere el nombre del repositorio, el adaptador emitiria etiquetas de implicacion, neutralidad o contradiccion para pares premisa-hipotesis.
- Generacion de texto: heredada del modelo base Qwen3-8B-Base, aunque no esta claro en que medida el ajuste especializado la preserva o la degrada.
- Capacidad multilingue: la del modelo base, que declara soporte para mas de 100 idiomas; el urdu es uno de los idiomas cubiertos por Qwen3, si bien con menos recursos de entrenamiento que el ingles.
- Tool calling / function calling: no documentado para este adaptador; el modelo base es una variante "Base" sin plantilla de chat ni entrenamiento de instrucciones, por lo que no se debe asumir soporte nativo.
- Uso como agente o razonamiento multi-paso: no documentado y poco probable en un ajuste de clasificacion de pares de frases.
- Modo de razonamiento explicito (thinking mode): no disponible; Qwen3-8B-Base es un modelo preentrenado sin los modos hibridos que si incorporan las variantes instruct.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Capacidades especiales adicionales: no disponibles.

## Casos de uso

- Verificacion de fidelidad en pipelines RAG: un sistema de generacion aumentada por recuperacion puede usar un modelo de NLI para comprobar si cada frase generada queda implicada por los fragmentos recuperados; el adaptador encaja en ese rol si su ajuste es realmente de inferencia textual.
- Deteccion de alucinaciones en resumenes: comparar el resumen generado con el documento fuente mediante pares premisa-hipotesis y marcar como "contradiction" o "neutral" las afirmaciones no respaldadas.
- Procesamiento de lenguaje natural en urdu: normalizacion y verificacion de afirmaciones en urdu, un idioma con cobertura limitada en herramientas comerciales, aprovechando el soporte multilingue del modelo base.
- Curación y etiquetado de corpus: uso del adaptador como anotador automatico de pares de frases para preetiquetar grandes volumenes de datos que despues se revisan manualmente, reduciendo el coste de anotacion.
- Moderacion de contenido basada en contradiccion: detectar afirmaciones de una conversacion que contradicen hechos aportados en el contexto, como filtro previo a la publicacion.
- Evaluacion de sistemas de traduccion ingles-urdu: comprobar si la traduccion de una frase preserva su significado respecto al original mediante la relacion de implicacion mutua.
- Reranking semantico en busqueda: puntuar pares consulta-documento segun la relacion logica entre ambos, como señal adicional en un pipeline de recuperacion.
- Investigacion academica sobre adaptacion eficiente: el repositorio sirve como punto de partida reproducible para estudiar el comportamiento de DoRA frente a LoRA en tareas multilingues de bajo recurso, siempre que se reconstruya el protocolo experimental.

En todos estos casos la aplicacion es condicional: la model card no documenta el objetivo de entrenamiento real, por lo que cada escenario requiere una validacion empirica previa sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card contiene unicamente el marcador "[More Information Needed]" en todas sus subsecciones (datos de prueba, factores, metricas y resultados), sin ninguna cifra de MMLU, XNLI, HumanEval, GSM8K ni de cualquier otra tarea.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16,4 GB solo para los pesos del modelo base de 8,2B parametros, mas entre 2 y 4 GB de memoria KV y activaciones segun la longitud de secuencia, lo que situa el total practico en torno a 18-22 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 8,2 GB de pesos mas overhead, en torno a 10-12 GB totales.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ o AWQ): aproximadamente 4,5-5 GB de pesos, con un total practico de 6-8 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB; cualquiera de ellas ejecuta el modelo en bf16 sin problemas y permite lotes grandes con vLLM.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) ejecutan el modelo en bf16 con margen; RTX 4080, RTX 4070 Ti Super y similares (16 GB) requieren cuantizacion a 8 bits; RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y tarjetas de 8-12 GB funcionan en 4 bits.
- Si cabe en GPU de consumo: si, en RTX 3090/4090 a precision completa y en practicamente cualquier GPU de 8 GB o mas con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; vLLM y TGI admiten servir adaptadores LoRA sobre un modelo base compartido, lo que resulta eficiente cuando se sirven varios adaptadores a la vez; llama.cpp, Ollama y LM Studio requieren fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y convertir el resultado a GGUF, ya que estos motores no cargan adaptadores PEFT directamente.
- Latencia y throughput estimados: no disponible. No hay ningun dato publicado de tokens por segundo, TTFT ni tamano de lote en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Qwen3-8B-Base) | 8.200 M (base) | No documentado; 32.768 en el base | No disponible | HuggingFace, 0 descargas, 0 likes | Sin model card, sin evaluacion, sin datos de entrenamiento |
| Qwen/Qwen3-8B-Base (sin adaptador) | 8.200 M | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente utilizado | Modelo preentrenado, sin plantilla de chat ni entrenamiento de instrucciones |
| Adaptadores XNLI comparables en la misma categoria | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |
| Baseline multilingue clasico para XNLI (por ejemplo, XLM-RoBERTa-large) | Aproximadamente 560 M | 512 tokens | MIT | HuggingFace | Arquitectura encoder-only, mucho mas ligera; no se dispone de cifras comparativas de este adaptador |

La comparacion cuantitativa no es posible: el repositorio no publica ninguna metrica, de modo que no se puede establecer si el adaptador mejora, iguala o degrada el rendimiento del modelo base o de alternativas consolidadas en XNLI.

## Limitaciones y advertencias

- Model card vacia: todos los campos de descripcion, uso previsto, datos de entrenamiento, hiperparametros y evaluacion estan sin rellenar, lo que impide auditar el modelo.
- Licencia no declarada: no se especifica la licencia del adaptador. Aunque Qwen3-8B-Base se distribuye bajo Apache 2.0, la ausencia de licencia explicita en el repositorio crea incertidumbre juridica para cualquier uso comercial o redistribucion.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de redactar esta ficha, sin ningun usuario que haya reportado resultados.
- Riesgo de sobreajuste: si el ajuste se realizo sobre solo 5.000 ejemplos, como sugiere el identificador, la capacidad de generalizacion fuera de la distribucion de XNLI es dudosa y no ha sido medida.
- Degradacion de capacidades generales: un ajuste especializado en clasificacion de pares de frases puede deteriorar la generacion de texto libre y el razonamiento del modelo base, algo que el autor no evalua.
- Modelo base sin alineacion: Qwen3-8B-Base es una variante preentrenada, sin entrenamiento de instrucciones ni de seguridad, por lo que no responde de forma fiable a instrucciones conversacionales.
- Alucinacion: inherente a cualquier modelo generativo basado en Qwen3; no hay evaluacion de factualidad ni de tasas de error en este adaptador.
- Idiomas: la model card no declara idiomas soportados. El urdu tiene menor representacion que el ingles en los corpus de Qwen3, lo que puede traducirse en un tokenizador menos eficiente y mayor tasa de error en ese idioma.
- Limitaciones de contexto: no documentadas para el adaptador; aunque el modelo base soporta 32.768 tokens, el ajuste podria haberse realizado con secuencias mucho mas cortas, lo que degradaria el rendimiento con entradas largas.
- Fechas anomolas: el repositorio registra fecha de creacion y actualizacion del 21 de septiembre de 2026, con apenas 21 segundos de diferencia entre ambas, lo que sugiere una subida automatizada sin revision posterior.
- Sin garantia de reproducibilidad: no se especifican datos, semillas, hiperparametros ni hardware, por lo que el resultado no es reproducible.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_DoRA_Qwen3-8b
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Documentacion de PEFT (libreria declarada, version 0.17.1): https://huggingface.co/docs/peft
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation), referenciado por el metodo de ajuste empleado en el nombre del repositorio: https://arxiv.org/abs/2402.09353
- Paper de LoRA (Low-Rank Adaptation of Large Language Models): https://arxiv.org/abs/2106.09685
- Articulo asociado a la etiqueta `arxiv:1910.09700` del repositorio (Lacoste et al., 2019, sobre emisiones de carbono; incluido por la plantilla de HuggingFace y sin relacion con este modelo): https://arxiv.org/abs/1910.09700
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo; los enlaces obtenidos correspondian a contenidos no relacionados (gestion de residuos, calefaccion, palas de padel y componentes electricos) y se han descartado.
