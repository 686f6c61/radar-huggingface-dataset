# SZLHOLDINGS/SZL-Khipu-1.5B-v2-trained

## Resumen

SZL-Khipu-1.5B-v2-trained es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-1.5B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero que hereda la arquitectura, el tokenizador y la ventana de contexto del Qwen2.5-1.5B original. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamano practicamente nulo (0.0 GB) y cero descargas registradas en el momento de la consulta.

El modelo forma parte del "programa de honestidad" de SZLHOLDINGS, una iniciativa que mide empiricamente que tipo de entrenamiento reduce el "suelo de confabulacion" (la tendencia a inventar informacion). El adaptador se entreno con el curriculo SZLHOLDINGS/quant-curriculum-v1 y obtuvo una puntuacion de 3/6 en la bateria de evaluacion del autor, frente a 5/6 que el mismo curriculo alcanzo sobre Qwen3-1.7B. La propia model card advierte explicitamente de que el resultado depende del modelo base.

La relevancia de esta ficha es limitada: se trata de un experimento de investigacion con documentacion minima, sin datos publicados sobre composicion del dataset, hiperparametros, idiomas soportados ni resultados de benchmarks estandar. Es util como referencia para quienes sigan el trabajo de SZLHOLDINGS sobre calibracion de honestidad, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B); adaptador PEFT/LoRA |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar, RoPE y normalizacion RMSNorm, tal como corresponde a la familia Qwen2.5. El repositorio usa la libreria `peft`, lo que implica que los pesos publicados son matrices de bajo rango (LoRA) que deben combinarse con el modelo base para su uso. No se especifican el rango, el alpha, los modulos objetivo ni el numero de pasos de entrenamiento.

El entrenamiento siguio el curriculo `SZLHOLDINGS/quant-curriculum-v1`, disenado por el autor para medir el efecto de distintas estrategias de ajuste sobre la confabulacion. No se documentan el volumen de tokens, la composicion del dataset, ni si hubo RLHF, DPO o supervision puramente supervisada. La unica metrica publicada es la puntuacion de bateria (3/6), con la advertencia de que el mismo curriculo rinde mejor sobre Qwen3-1.7B (5/6), lo que sugiere una fuerte dependencia del modelo base y posiblemente un desajuste entre el curriculo y la arquitectura o tokenizador de Qwen2.5.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo (1.5B parametros).
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del base.
- Soporte de tool calling: no disponible en la informacion proporcionada para el adaptador (el base Qwen2.5 lo soporta, pero no se confirma que el ajuste lo preserve).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible (modelo puramente textual).

## Casos de uso

- Investigacion sobre calibracion de honestidad: el adaptador sirve como punto de comparacion en experimentos que midan la tasa de confabulacion antes y despues del ajuste con el curriculo quant-curriculum-v1, replicando la metodologia del autor.
- Reproduccion de experimentos del "estate": util para verificar la cadena de recibos publicada en el dataset frontier-54-runs y contrastar la puntuacion 3/6 reportada.
- Estudio de dependencia del modelo base: permite analizar por que el mismo curriculo rinde 5/6 en Qwen3-1.7B y 3/6 en Qwen2.5-1.5B, aislando diferencias de tokenizador, datos de preentrenamiento o arquitectura.
- Prototipado de asistentes conversacionales ligeros: al combinarse con Qwen2.5-1.5B, puede desplegarse en entornos con recursos muy limitados para pruebas de concepto de dialogo multi-turno, siempre que se valide la calidad.
- Fine-tuning educativo: sirve como ejemplo practico de como publicar un adaptador PEFT en Hugging Face con metadatos minimos y una cadena de evaluacion asociada.
- Auditoria de licencias y trazabilidad: el uso de Apache 2.0 y la vinculacion explicita al modelo base facilitan su inclusion en pipelines de cumplimiento que requieran modelos de pesos abiertos.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Bateria del autor (SZLHOLDINGS) | 3/6 | Curriculo quant-curriculum-v1; mismo curriculo da 5/6 en Qwen3-1.7B |
| MMLU | no disponible | No publicado |
| HumanEval | no disponible | No publicado |
| GSM8K | no disponible | No publicado |

No se han publicado resultados de benchmarks estandar en la informacion disponible. La unica metrica es la puntuacion interna de 3/6, sin detalle sobre que mide cada uno de los seis items de la bateria.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 1.5B parametros, la VRAM depende del base. En fp16, el base ocupa aproximadamente 3 GB; en cuantizacion de 8 bits, unos 1.5-2 GB; en 4 bits, alrededor de 1 GB. El adaptador anade una cantidad marginal (no especificada).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el base en cuantizacion. Una RTX 3060, RTX 4060 o superior es suficiente. Para fp16 sin cuantizar, se recomienda una RTX 4090 o una A100/H100 si se busca throughput alto.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas, siempre que se cuantice el modelo base.
- Opciones de despliegue: el adaptador PEFT puede cargarse con la libreria `peft` + `transformers`; para servir en produccion se puede fusionar con el base y exportar a vLLM, TGI o llama.cpp (previa conversion a GGUF). Ollama es viable tras fusion y conversion.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1.5B en una RTX 4090, cabria esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-v2-trained | 1.5B (base) + adaptador | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador de investigacion; 3/6 en bateria del autor |
| Qwen/Qwen2.5-1.5B | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin ajuste; benchmarks publicados por Alibaba |
| Qwen/Qwen3-1.7B | 1.7B | no disponible | Apache 2.0 | Hugging Face | Mismo curriculo del autor alcanza 5/6; mejor rendimiento reportado en el experimento |
| Adaptadores PEFT comparables | variable | variable | variable | Hugging Face | No se identifican alternativas equivalentes en el mismo nicho de "honestidad medida" |

## Limitaciones y advertencias

- Documentacion minima: no se publican hiperparametros de entrenamiento, composicion del dataset, numero de tokens ni detalles del curriculo, lo que impide reproducir el ajuste.
- Dependencia fuerte del modelo base: el propio autor advierte que el curriculo no funciona igual en Qwen2.5-1.5B (3/6) que en Qwen3-1.7B (5/6); el rendimiento no es transferible sin validacion.
- Riesgo de alucinacion: el modelo se presenta como parte de un programa para medir la confabulacion, pero no se aportan tasas concretas ni comparaciones con el base sin ajustar.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Idiomas: no declarados; se desconoce si el ajuste preserva el multilingueismo del base Qwen2.5.
- Contexto: no se especifica si el adaptador mantiene la ventana de 32.768 tokens del base; conviene validarlo antes de usarlo en tareas de contexto largo.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un adaptador sobre Qwen2.5-1.5B hay que cumplir tambien la licencia del base (tambien Apache 2.0).
- Madurez: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- Trazabilidad: la evaluacion se apoya en una "cadena de recibos" en blockchain y un explorador propio; no hay benchmarks estandar verificables por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-v2-trained
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de recibos (frontier-54-runs): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena de recibos: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del "estate": https://a-11-oy.com
