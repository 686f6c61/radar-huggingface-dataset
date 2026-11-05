# SWARM-Lab/CoCo-Qwen3-4B-LoRA

## Resumen

CoCo-Qwen3-4B-LoRA es un adaptador LoRA de tipo PEFT publicado por SWARM-Lab (University of Texas at Austin) que constituye el componente de lenguaje del sistema CoCo ("TSFM Meets LLM: Context as Covariates"). No se trata de un modelo de chat generalista, sino de un módulo especializado que, dado un contexto textual junto con un historial de serie temporal, genera rollouts numericos de prediccion. La mediana de esos rollouts y su varianza por paso alimentan como covariables de prediccion y de confianza a un modelo Chronos2 adaptado, con el que forma un pipeline de forecasting asistido por texto.

El adaptador se aplica sobre Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parametros con licencia Apache-2.0. El entrenamiento descrito en la model card emplea GRPO (Group Relative Policy Optimization) con un modelo de recompensa congelado basado en Chronos2, sobre una mezcla de ejemplos sinteticos de texto y serie temporal junto con ejemplos de FNSPID. El resultado es un adaptador de rango 32 que ocupa 264.300.328 bytes (aproximadamente 0,3 GB en el repositorio).

Su relevancia es acotada pero clara: demuestra que un LLM de 4B puede aportar informacion contextual (noticias, notas de prensa, descripciones) como covariables a un modelo fundacional de series temporales, en lugar de usarse como predictor numerico directo. Es material de investigacion, no un modelo listo para produccion general; su uso previsto es la investigacion en forecasting asistido por texto y depende de la calidad e informatividad del texto suministrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA sobre atencion y MLP |
| Parametros totales | 4B en el modelo base; adaptador LoRA de 264.300.328 bytes |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en |
| Licencia | no disponible para el adaptador; el modelo base Qwen3-4B-Instruct-2507 es Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA), libreria `peft` |
| Rank / alpha / dropout LoRA | 32 / 64 / 0 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Entorno de inferencia de referencia | vLLM 0.11.2, PEFT 0.18.1 |
| Rollouts por defecto | 5 |
| Ventana de texto por defecto | 16 timestamps |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B-Instruct-2507, un transformer denso decoder-only. El LoRA de rango 32 y alpha 64 se aplica a las siete proyecciones habituales (q, k, v, o, gate, up, down), lo que permite adaptar tanto la atencion como las capas feed-forward sin modificar los pesos base. El adaptador se carga con `PeftModel.from_pretrained` sobre el checkpoint de Qwen en bfloat16.

El entrenamiento descrito en la model card es una adaptacion con GRPO usando un modelo de recompensa congelado basado en Chronos2, sobre una mezcla de ejemplos sinteticos de texto y serie temporal y ejemplos de FNSPID. La innovacion tecnica no esta en el LLM en si, sino en el bucle completo: el LLM genera varios rollouts numericos condicionados por texto, se calculan su mediana y su varianza por paso, y esas dos senales se inyectan como covariables en un Chronos2 adaptado (publicado como SWARM-Lab/CoCo-Chronos2-LoRA). El pipeline completo requiere ademas el prompt del paper, el parseo de la salida, normalizacion basada solo en historial, agregacion de rollouts y construccion de covariables; el adaptador por si solo no produce predicciones utiles.

## Capacidades

- Generacion de rollouts numericos de prediccion condicionados por contexto textual, en el formato y protocolo definidos por el pipeline CoCo.
- Produccion de multiples muestras por consulta (cinco por defecto) para permitir agregacion por mediana y estimacion de incertidumbre por varianza.
- Procesamiento de ventanas de texto asociadas a series temporales (16 timestamps por defecto).
- Integracion como componente de un sistema multimodal texto + serie temporal, no como modelo autonomo.
- Servicio mediante vLLM con soporte de LoRA, o mediante Transformers + PEFT.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking especifico del adaptador.

## Casos de uso

- Forecasting financiero asistido por noticias: dado un historial de precios y texto de noticias o notas de prensa, el adaptador genera rollouts cuya mediana y dispersion se usan como covariables en Chronos2 para mejorar la prediccion en horizontes donde el texto aporta informacion.
- Prediccion de demanda con contexto de eventos: incorporar descripciones de promociones, lanzamientos o incidencias junto al historial de ventas para que el sistema CoCo module la prediccion en funcion de la informatividad del texto.
- Investigacion en modelos fundacionales de series temporales: usar el adaptador como bloque reproducible para experimentar con la inyeccion de contexto textual en TSFM y comparar con baselines sin texto.
- Analisis de sensibilidad al texto: evaluar como varia la prediccion y su incertidumbre cuando se altera o elimina el contexto textual, aprovechando la varianza de los rollouts como medida de confianza.
- Generacion de intervalos de prediccion: emplear la varianza por paso de los rollouts como senal de incertidumbre en sistemas de alerta temprana sobre series monitorizadas.
- Reproduccion de resultados del paper: ejecutar el paquete de inferencia CoCo con este adaptador y el de Chronos2 para replicar los experimentos publicados en NeurIPS 2026.
- Prototipado en entornos con GPU limitada: al ser un adaptador sobre un base de 4B, permite experimentar con el pipeline completo sin desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 4B en bfloat16 requiere aproximadamente 8-9 GB de pesos; con overhead de activaciones y cache KV, un despliegue comodo parte de 16 GB de VRAM. En cuantizacion de 8 bits, en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM y varias peticiones concurrentes; RTX 4090 (24 GB) suficiente para inferencia en bfloat16 de una sola instancia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bfloat16 (RTX 4080/4090, RTX 5070 Ti y superiores) y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM 0.11.2 con soporte LoRA (entorno de referencia del paper), o Transformers + PEFT 0.18.1. El paquete de inferencia CoCo del repositorio de GitHub integra ambos caminos. No se documenta soporte de llama.cpp u Ollama para el pipeline completo.
- Latencia y throughput: no disponibles. El coste real depende de generar cinco rollouts por consulta y de la longitud de la ventana de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Enfoque |
|---|---|---|---|---|---|
| CoCo-Qwen3-4B-LoRA | 4B (base) + LoRA r=32 | no disponible | Adaptador LoRA para forecasting con texto | no disponible (base Apache-2.0) | LLM como generador de covariables para Chronos2 |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la informacion proporcionada | LLM denso instruct | Apache-2.0 | Chat y generacion de texto general |
| SWARM-Lab/CoCo-Chronos2-LoRA | no disponible | no disponible | Adaptador sobre Chronos2 | no disponible | TSFM que consume las covariables del LLM |
| Chronos2 (sin adaptar) | no disponible | no disponible | Modelo fundacional de series temporales | no disponible | Forecasting univariante/multivariante sin texto |

La comparacion directa con LLM generalistas no es significativa: CoCo-Qwen3-4B-LoRA no compite en tareas de chat o razonamiento general, sino que esta especializado en producir rollouts numericos dentro de un pipeline concreto.

## Limitaciones y advertencias

- El adaptador no es util por si solo: requiere el prompt, el parseo, la normalizacion basada solo en historial, la agregacion de rollouts, la construccion de covariables y el Chronos2 adaptado del pipeline CoCo.
- El ejemplo de carga de la model card no ha sido probado en GPU como parte de la release, segun indica el propio autor.
- Los resultados dependen de la informatividad y fiabilidad del texto suministrado; texto irrelevante o erroneo puede degradar la prediccion.
- Solo se declara soporte de ingles (`en`); no hay evidencia de comportamiento en castellano.
- La licencia del adaptador no esta disponible en la informacion proporcionada; aunque el base es Apache-2.0, la reutilizacion comercial del adaptador requiere verificacion con el autor.
- Uso previsto exclusivamente de investigacion; no hay validacion publicada para produccion.
- Riesgo de alucinacion inherente al LLM base en la generacion de valores numericos; el pipeline mitiga parcialmente mediante agregacion de multiples rollouts, pero no lo elimina.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible cuantificar la mejora frente a baselines sin texto.
- El repositorio tiene un volumen de descargas muy bajo (15) y ninguna valoracion, lo que limita la evidencia de uso comunitario.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/SWARM-Lab/CoCo-Qwen3-4B-LoRA
- Adaptador companion (Chronos2): https://huggingface.co/SWARM-Lab/CoCo-Chronos2-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper (arXiv): https://arxiv.org/abs/2611.05515
- Paper (OpenReview): https://openreview.net/forum?id=t2nNTWgHfq
- Blog del proyecto: https://utaustin-swarmlab.github.io/2026/11/04/CoCo.html
- Codigo y paquete de inferencia: https://github.com/UTAustin-SwarmLab/CoCo
