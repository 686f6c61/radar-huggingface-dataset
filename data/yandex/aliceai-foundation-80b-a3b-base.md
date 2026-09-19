# yandex/AliceAI-Foundation-80B-A3B-Base

## Resumen

AliceAI-Foundation-80B-A3B-Base es un modelo de lenguaje base autoregresivo desarrollado por Yandex, entrenado íntegramente desde cero y publicado como pesos abiertos bajo licencia Apache 2.0. Se trata de un modelo de arquitectura híbrida con capas de mezcla de expertos (MoE): de sus 80 000 millones de parámetros nominales solo se activan aproximadamente 3 000 millones por token, lo que reduce el coste computacional de inferencia mientras mantiene la capacidad de almacenamiento de conocimiento de un modelo de escala 80B. El modelo declara una longitud de contexto de 262 144 tokens, muy por encima de la media de los modelos abiertos de su categoria.

Su relevancia actual se apoya en dos ejes. Por un lado, es una de las pocas alternativas abiertas con foco explicito en ruso: Yandex sostiene que el modelo iguala o supera a modelos abiertos de mayor tamano en matematicas y programacion, y que es especialmente fuerte en conocimiento factual en ruso. Para respaldarlo, publica junto a los pesos dos benchmarks de factologia en ruso, WikiWebFacts y HardMultiQA, ademas de sus protocolos de evaluacion. Por otro lado, la arquitectura es poco convencional: combina atencion lineal tipo KDA con atencion completa con puerta (gated attention) en una proporcion 3:1, mas una capa de prediccion multi-token (MTP), con 512 expertos por capa MoE y top-10 enrutamiento mas un experto compartido.

Es importante senalar que se trata de un modelo en fase de preentrenamiento, no de un modelo instruido ni ajustado por preferencias: no incorpora plantilla de chat ni alineamiento conversacional, y esta pensado como base para ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo hibrido con MoE; patron de 48 capas: 12 x (3 x (KDA -> MoE) -> 1 x (Gated Attention -> MoE)) |
| Parametros totales | 81 286 433 408 (~81,3 B segun safetensors; la model card indica 80 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio contiene unicamente pesos safetensors) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True` por el tag `custom_code`) |
| Tamano del repositorio | 162,6 GB |
| Tamano de estado oculto | 2048 |
| Tamano de vocabulario | 129 024 |
| Numero de capas | 48 |
| KDA (atencion) | 32 cabezas query, 32 cabezas KV, dimension de cabeza query 128, dimension de cabeza KV 128, tamano de kernel de convolucion 4 |
| Gated Attention | 16 cabezas query, 2 cabezas KV, dimension de cabeza query 256 |
| MoE | 512 expertos, top-K 10 + 1 experto compartido, dimension intermedia del experto 512 |
| MTP | 1 capa de prediccion multi-token |
| Etapa de entrenamiento | Preentrenamiento |

## Arquitectura y entrenamiento

El modelo emplea un transformer hibrido que alterna dos mecanismos de atencion en cada bloque de cuatro capas: tres capas de KDA seguidas de una capa de gated attention, repetido 12 veces hasta completar 48 capas. KDA se describe en la model card mediante sus hiperparametros (32 cabezas query y 32 cabezas KV de dimension 128, con un kernel de convolucion de tamano 4), lo que apunta a un mecanismo de atencion con estado recurrente y convolucion corta; la model card no desglosa las siglas ni detalla la formulacion matematica. La capa de gated attention, con 16 cabezas query y solo 2 cabezas KV y dimension de cabeza 256, actua como atencion completa con compuerta. Cada una de las 48 capas va seguida de una capa MoE con 512 expertos, enrutamiento top-10 mas un experto compartido y dimension intermedia de 512 por experto.

El entrenamiento se realizo completamente desde cero: el equipo reconstruyo el corpus de entrenamiento, eligio la arquitectura y los hiperparametros, y preparo datos especificos para razonamiento complejo e interaccion con herramientas. Segun la model card, las decisiones clave se validaron mediante una serie de entrenamientos independientes desde cero de 2 billones de tokens cada uno. No se especifica en la informacion disponible el numero total de tokens de entrenamiento del modelo final, la composicion del dataset ni si se aplico RLHF o DPO (lo cual es coherente con que sea un modelo base de preentrenamiento). La capa MTP adicional de 1 nivel es una innovacion reseñable: habilita decodificacion especulativa nativa, es decir, generar varios tokens por paso y verificarlos, lo que puede aumentar el throughput de decodificacion.

## Capacidades

- Generacion de texto en ruso e ingles como modelo base de continuacion de secuencia.
- Razonamiento matematico y de sentido comun: la model card afirma resultados al nivel de modelos abiertos de mayor tamano en matematicas y programacion.
- Conocimiento factual en ruso: los benchmarks WikiWebFacts (86,5) y HardMultiQA (67,9) apuntan a un rendimiento alto frente a alternativas mas grandes.
- Cultura general y conocimiento del mundo en contexto ruso (benchmark CultCat, 4-shot, citado en la model card).
- Generacion de codigo, segun la afirmacion del autor de resultados competitivos en programacion; no se detallan en la informacion disponible los benchmarks concretos de codigo.
- Preparado para interaccion con herramientas: la model card menciona que se prepararon datos de interaccion con herramientas, aunque al ser un modelo base no se documenta un formato de tool calling nativo.
- Capacidad de prediccion multi-token mediante la capa MTP, aprovechable para decodificacion especulativa.
- Capacidad multilingue limitada: los idiomas declarados son unicamente ruso e ingles.

## Casos de uso

- Procesamiento de documentacion larga en ruso: con 262 144 tokens de contexto, el modelo puede indexar y resumir expedientes, contratos o normativa completa sin troceado, algo relevante para administraciones publicas y despachos juridicos en mercados rusoparlantes.
- Base para ajuste supervisado e instruccion: al ser un modelo de preentrenamiento, es el punto de partida natural para equipos que quieran construir asistentes conversacionales especializados en ruso mediante SFT y DPO, partiendo de un modelo con licencia Apache 2.0 sin restricciones de uso comercial.
- Atencion al cliente automatizada en ruso: el contexto largo permite mantener el historial completo de una conversacion multi-turno junto con la base de conocimiento del producto, y el coste de inferencia se mantiene contenido por los solo 3 B de parametros activos.
- Generacion aumentada por recuperacion (RAG) sobre corpus rusos: el modelo puede ingerir decenas de documentos recuperados por un buscador y sintetizar respuestas citando fuentes, con buen rendimiento factual medido en WikiWebFacts y HardMultiQA.
- Analisis de codigo y asistencia a programadores: dado su rendimiento declarado en programacion, puede integrarse en herramientas de autocompletado, revision de pull requests o generacion de tests, ajustandose despues a un dominio concreto.
- Extraccion de informacion estructurada de textos largos: conversion de informes, actas o articulos a JSON o tablas, aprovechando la ventana de contexto para no perder referencias cruzadas entre secciones.
- Razonamiento matematico asistido por herramientas: al haberse preparado datos de interaccion con herramientas, es viable conectarlo a un interprete de Python o a un motor de calculo simbolico para tareas de verificacion y derivacion.
- Investigacion en arquitecturas hibridas: la combinacion KDA mas gated attention con MoE y MTP lo convierte en un sujeto de estudio util para reproducir experimentos de atencion lineal frente a atencion completa a escala 80B.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card. Todas las mediciones se realizaron en la infraestructura interna de Yandex con vLLM y temperatura 0. En negrita, el mejor resultado de cada fila segun el autor.

| Benchmark | AliceAI-Foundation-80B-A3B-Base | Qwen3.5-35B-A3B-Base | GLM-4.5-Air-Base (106B-A12B) | Nemotron-3-Super-120B-A12B-Base | DeepSeek-V4-Flash-Base (284B-A13B) |
|---|---|---|---|---|---|
| WikiWebFacts (5-shot, ruso) | 86,5 | 62,4 | 70,2 | 72,8 | 83,2 |
| HardMultiQA (5-shot, ruso) | 67,9 | 47,2 | 48,6 | 54,5 | 65,4 |
| CultCat (4-shot) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Los resultados del resto de categorias incluidas en la model card (matematicas, programacion y otras) no estan disponibles en la informacion proporcionada, ya que la tabla original aparece truncada.

## Requisitos de hardware

- Peso en precision completa: los 81,3 B de parametros en BF16/FP16 ocupan aproximadamente 162,6 GB, coincidiendo con el tamano del repositorio, por lo que requieren al menos 2 GPU de 80 GB (H100, A100 80 GB) o una configuracion equivalente en tensor parallel.
- Cuantizacion a 8 bits: aproximadamente 81 GB, viable en una sola GPU de 80 GB con holgura limitada para el KV cache.
- Cuantizacion a 4 bits: aproximadamente 41-45 GB, lo que permite ejecucion en GPU profesionales de 48 GB (RTX 6000 Ada, A6000, L40S) o en configuraciones de 2 x RTX 4090/5090 de 24/32 GB.
- GPU de consumo: no cabe en una unica GPU de consumo (24-32 GB) ni siquiera a 4 bits; es necesario repartir el modelo entre dos o mas tarjetas.
- Memoria para el KV cache: la ventana de 262 144 tokens exige planificacion cuidadosa del KV cache; solo 12 de las 48 capas usan atencion completa (con solo 2 cabezas KV), lo que reduce sustancialmente el coste frente a un transformer denso equivalente, pero la longitud maxima sigue siendo demandante.
- Opciones de despliegue: la model card etiqueta explicitamente vLLM y transformers como vias soportadas; el uso de `custom_code` obliga a cargar el modelo con `trust_remote_code=True`. No se confirma soporte para llama.cpp, Ollama, TGI ni formatos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, los 3 B de parametros activos por token situan el coste de calculo en el orden de un modelo denso de 3B, pero el regimen real es limitado por ancho de banda de memoria al leer los expertos seleccionados y el experto compartido en cada capa.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Resultado en ruso (WikiWebFacts / HardMultiQA) |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base | 81,3 B | ~3 B | 262 144 | Apache 2.0 | 86,5 / 67,9 |
| Qwen3.5-35B-A3B-Base | 35 B | 3 B | no disponible | no disponible | 62,4 / 47,2 |
| GLM-4.5-Air-Base | 106 B | 12 B | no disponible | no disponible | 70,2 / 48,6 |
| Nemotron-3-Super-120B-A12B-Base | 120 B | 12 B | no disponible | no disponible | 72,8 / 54,5 |
| DeepSeek-V4-Flash-Base | 284 B | 13 B | no disponible | no disponible | 83,2 / 65,4 |

La comparativa se limita a los modelos que el autor incluye en su tabla de evaluacion y a los dos benchmarks de factologia en ruso cuyos datos estan disponibles en la informacion proporcionada. No hay datos publicos en esa informacion sobre contexto, licencia o rendimiento en ingles de los modelos comparados, por lo que la comparacion en esas dimensiones no puede completarse.

## Limitaciones y advertencias

- Modelo base de preentrenamiento: no esta instruido ni alineado, no incorpora plantilla de chat y no debe desplegarse directamente como asistente sin un ajuste previo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar afirmaciones factualmente incorrectas con apariencia de verosimilitud; los buenos resultados en factologia no eliminan este riesgo en contextos abiertos.
- Cobertura idiomatica restringida: solo se declaran ruso e ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Idiomas no declarados: el vocabulario de 129 024 entradas puede cubrir otros alfabetos, pero no hay evaluacion publicada que respalde su uso fuera de ru/en.
- Sesgos: no se documenta en la informacion disponible ningun analisis de sesgos, y el corpus esta fuertemente orientado a contenido rusoparlante, lo que puede introducir sesgos culturales y geopoliticos especificos.
- Requisitos de integracion: el tag `custom_code` implica que la carga del modelo exige ejecutar codigo del repositorio, lo que debe revisarse antes de desplegarlo en entornos de produccion con requisitos de seguridad estrictos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, aunque se debe conservar el aviso de licencia y no se otorga garantia alguna.
- Contexto de 262 144 tokens: aunque declarado, no se aportan resultados de evaluacion de recuperacion en el extremo de la ventana (por ejemplo, pruebas tipo needle-in-a-haystack), por lo que la calidad efectiva en contextos muy largos no esta verificada.
- Discrepancia de parametros: la model card indica 80 B y los ficheros safetensors suman 81 286 433 408 parametros; conviene verificar el conteo real al planificar infraestructura.
- Datos de contexto: la model card esta truncada en la informacion disponible, de modo que podrian existir advertencias adicionales del autor no recogidas aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Version en ingles de la model card: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base/blob/main/README_en.md
- Dataset WikiWebFacts: https://huggingface.co/datasets/yandex/WikiWebFacts
- Dataset HardMultiQA: https://huggingface.co/datasets/yandex/HardMultiQA
- Grafico de benchmarks incluido en el repositorio: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base/blob/main/assets/benchmarks.png
- Articulo en Habr sobre CultCat: referenciado en la model card, URL truncada en la informacion disponible
- Repositorio de codigo, paper tecnico o demo: no disponibles en la informacion proporcionada
