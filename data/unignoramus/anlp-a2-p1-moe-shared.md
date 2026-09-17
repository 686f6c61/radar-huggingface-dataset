# unignoramus/anlp-a2-p1-moe-shared

## Resumen

El modelo `unignoramus/anlp-a2-p1-moe-shared` es un transformer decoder-only de 35,27 millones de parametros totales (28,98 millones activos) desarrollado por el usuario unignoramus como parte de la asignatura ANLP (Assignment 2, Part 1). Se trata de un sistema de traduccion automatica que convierte vietnamita y japones a ingles, entrenado sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` con un presupuesto de 36,54 millones de tokens.

Su particularidad no es el rendimiento, sino que forma parte de una familia de cinco ablaciones de la capa feed-forward entrenadas con un presupuesto de tokens identico. En concreto, esta variante sustituye la FFN densa por una capa MoE (mixture of experts) con 4 expertos totales y 2 activos por token, lo que permite comparar de forma controlada el efecto de distintas configuraciones de feed-forward manteniendo constante el resto del pipeline.

Es un modelo puramente academico y de investigacion: repositorio de 0,1 GB, cero descargas y cero likes en HuggingFace, licencia MIT y pesos en un unico fichero `torch.save`. No esta pensado para produccion ni compite con sistemas de traduccion comerciales; su valor esta en servir como punto de comparacion reproducible dentro de un estudio de ablaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward MoE |
| Parametros totales | 35,27 M |
| Parametros activos | 28,98 M |
| Expertos (total / activos) | 4 / 2 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision nativa PyTorch) |
| Idiomas soportados | Origen: vietnamita y japones. Destino: ingles |
| Licencia | MIT |
| Formato de pesos | `torch.save` (payload con claves `model`, `state` y `config`); requiere `torch.load(..., weights_only=False)` |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | pytorch |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Tokens de entrenamiento | 36,54 M |
| Perplejidad en test | 10,79 |
| BLEU en test | 26,76 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only orientado a traduccion (es decir, generacion condicionada del texto destino en ingles). La innovacion concreta de esta variante reside en la capa feed-forward: en lugar de una FFN densa, emplea una mezcla de expertos con 4 expertos en total y 2 activos por token, lo que explica la diferencia entre los 35,27 M de parametros totales y los 28,98 M activos. Los detalles de enrutamiento (top-k, funcion de balanceo de carga, granularidad de los expertos, dimension de cada experto) no estan disponibles en la informacion proporcionada.

El entrenamiento se realizo sobre 36,54 millones de tokens del dataset `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas en vietnamita, japones e ingles. El checkpoint es una ablacion mas de cinco variantes de feed-forward entrenadas con un presupuesto de tokens identico, lo que constituye el diseno experimental del trabajo: aislar el efecto de la configuracion de la FFN manteniendo constante el resto. No hay informacion disponible sobre si se aplico RLHF, DPO, SFT adicional u otra fase de alineamiento, ni sobre la composicion exacta del dataset mas alla de su nombre.

## Capacidades

- Traduccion automatica de vietnamita a ingles.
- Traduccion automatica de japones a ingles.
- Generacion de texto autoregresiva con arquitectura decoder-only (capacidad derivada, no evaluada de forma independiente en la informacion disponible).
- Procesamiento de secuencias con arquitectura transformer estandar; longitud de contexto no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a los tres idiomas del dataset (vi, ja, en); no se documenta soporte para otros idiomas.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponible.

## Casos de uso

- Traduccion vietnamita-ingles en prototipos academicos: el modelo puede integrarse en un script de evaluacion propio para medir BLEU sobre corpus de validacion y comparar contra las otras cuatro ablaciones de la misma familia.
- Traduccion japones-ingles en experimentos de laboratorio: util como linea base barata (35,27 M de parametros) antes de escalar a modelos de mayor tamano en estudios de traduccion de bajo recurso.
- Estudio de ablaciones MoE frente a FFN densa: al compartir presupuesto de tokens con las otras cuatro variantes, permite aislar el efecto del numero de expertos y de la sparsity en la calidad de traduccion.
- Docencia e investigacion reproducible: el checkpoint es un unico fichero `torch.save` de 0,1 GB, facil de versionar y de cargar en un notebook, lo que lo hace adecuado para practicas de curso sobre entrenamiento y evaluacion de transformers.
- Generacion de datos sinteticos de traduccion: puede usarse para producir pares vi-en o ja-en preliminares que despues se filtren manualmente, dado su BLEU de 26,76 en test.
- Experimentos de destilacion: un modelo de 35,27 M con 28,98 M activos es un candidato razonable como alumno en procesos de destilacion desde traductores neuronales de mayor tamano.
- Pruebas de infraestructura de inferencia en CPU: por su tamano, permite validar pipelines de carga, tokenizacion y decodificacion sin necesidad de GPU.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del conjunto de test de la propia model card:

| Metrica | Valor |
|---|---|
| Perplejidad (test) | 10,79 |
| BLEU (test) | 26,76 |
| Tokens de entrenamiento | 36,54 M |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni desagregados por par de idiomas (vi-en frente a ja-en). Tampoco se especifica el tokenizador ni si el BLEU es SacreBLEU, BLEU de corpus o BLEU de frases, lo que limita la comparabilidad directa de la cifra.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 141 MB solo para pesos (35,27 M x 4 bytes), mas activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 71 MB para pesos.
- VRAM estimada en int8: aproximadamente 35 MB para pesos, aunque no se documenta una ruta de cuantizacion oficial.
- GPU recomendadas: cualquier GPU consumer moderna sirve; cabe holgadamente en una RTX 3060, RTX 4090 o incluso en GPUs de gama baja con 4 GB o menos. No requiere A100 ni H100.
- Inferencia en CPU: perfectamente viable por el tamano del modelo; no se dispone de cifras de latencia.
- Opciones de despliegue: carga nativa con PyTorch (`torch.load(..., weights_only=False)`) usando la definicion de transformer del repositorio acompanante. No hay evidencia de soporte para vLLM, llama.cpp, Ollama, TGI o formatos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La model card indica que este checkpoint es una de cinco ablaciones de feed-forward entrenadas con el mismo presupuesto de tokens, pero no se proporcionan los nombres, identificadores ni resultados de las otras cuatro variantes, ni referencias a modelos externos comparables.

| Modelo | Parametros totales | Parametros activos | Contexto | BLEU (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| anlp-a2-p1-moe-shared | 35,27 M | 28,98 M | no disponible | 26,76 | MIT | HuggingFace |
| Otras ablaciones de la familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de alcance puramente academico: forma parte de una practica de asignatura (ANLP Assignment 2, Part 1) y no ha sido validado para uso en produccion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo ni de mantenimiento.
- Contexto desconocido: no se documenta la longitud maxima de secuencia, lo que impide garantizar el comportamiento en documentos largos.
- Cobertura idiomatica muy restringida: unicamente vietnamita y japones como origen e ingles como destino; no hay soporte documentado para otras lenguas.
- Riesgo de alucinacion: no evaluado. No hay datos sobre fidelidad, omisiones ni traducciones inventadas en frases fuera de dominio.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgos demograficos, culturales o de genero en las traducciones.
- Presupuesto de entrenamiento reducido: 36,54 M de tokens para 35,27 M de parametros totales esta muy por debajo de las recomendaciones tipo Chinchilla, lo que sugiere infrapretencion y limita la generalizacion.
- Formato de pesos no seguro por defecto: requiere `torch.load(..., weights_only=False)`, una opcion que ejecuta codigo de deserializacion arbitrario. Cargar unicamente checkpoints de fuentes de confianza.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, pero el autor no ofrece garantias de ningun tipo.
- Ausencia de pipeline declarada en HuggingFace y de integracion con frameworks de inferencia estandar: la integracion requiere el codigo del repositorio acompanante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p1-moe-shared
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada ni localizado en la busqueda web.
- Nota sobre la busqueda web: los resultados devueltos (Nuremberg Diary, Gustave Gilbert y articulos relacionados) no guardan ninguna relacion con el modelo y se descartan como fuentes.
