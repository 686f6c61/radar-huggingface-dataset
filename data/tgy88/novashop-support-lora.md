# TGY88/novashop-support-lora

## Resumen

`TGY88/novashop-support-lora` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario TGY88, entrenado mediante SFT sobre `unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`, que a su vez es una version cuantizada a 4 bits de `meta-llama/Llama-3.1-8B-Instruct`. No se trata por tanto de un modelo completo, sino de un delta de pesos de bajo rango que debe cargarse junto al modelo base. El repositorio ocupa 0,2 GB y se distribuye en formato `safetensors` bajo la libreria `peft` (version 0.20.0 declarada en la model card).

El nombre del repositorio sugiere un ajuste fino orientado a soporte al cliente para una tienda ("novashop-support"), pero la model card es la plantilla por defecto de HuggingFace y no contiene ninguna seccion completada: no se documentan datos de entrenamiento, hiperparametros, rango de LoRA, target modules, idiomas, licencia ni evaluacion. Toda la informacion tecnica verificable procede, por tanto, del modelo base o de los metadatos del repositorio, y asi se indica en cada apartado.

Su relevancia practica es limitada y acotada: sirve como ejemplo de adaptador SFT generado con Unsloth + TRL + PEFT sobre Llama 3.1 8B, y como artefacto a auditar antes de cualquier uso en produccion. Al no existir evaluacion publicada, licencia declarada ni descripcion de los datos de ajuste, no deberia desplegarse en un entorno real sin una validacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con adaptador LoRA de bajo rango sobre los pesos congelados del modelo base |
| Parametros totales | 8.030 millones en el modelo base; numero de parametros entrenables del adaptador no disponible (repositorio de 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base Llama 3.1; no verificado para este adaptador |
| Tipos de cuantizacion | Adaptador en safetensors (precision no documentada). El modelo base indicado esta cuantizado con bitsandbytes a 4 bits (bnb-4bit). No se documentan versiones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | no disponible para el adaptador; el modelo base declara soporte para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible para el adaptador; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada `peft`, con `transformers`, `trl` y `unsloth` como dependencias de entrenamiento |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU, embeddings RoPE y atencion con Grouped Query Attention (32 cabezas de consulta y 8 cabezas clave/valor en el modelo base de 8B), con un vocabulario de 128.256 tokens. La tecnica de ajuste es LoRA: se congelan los pesos del modelo base y se entrenan matrices de bajo rango inyectadas en determinadas proyecciones, lo que reduce drasticamente el numero de parametros actualizados y el coste de entrenamiento. La libreria declarada es PEFT 0.20.0 y los tags indican SFT (supervised fine-tuning, aprendizaje supervisado) ejecutado con TRL y Unsloth sobre una base ya cuantizada a 4 bits.

No hay informacion publicada sobre el conjunto de datos de entrenamiento, el numero de tokens vistos, la composicion del dataset, el rango de LoRA, los modulos objetivo, la tasa de aprendizaje, el numero de epocas ni si hubo etapas posteriores de DPO o RLHF. Tampoco se documenta si el ajuste fue puramente de dominio (formato y tono de atencion al cliente) o si incluyo datos de herramientas o function calling. La unica innovacion tecnica observable es el propio pipeline de Unsloth para fine-tuning eficiente en memoria sobre pesos de 4 bits, que no es especifica de este adaptador.

## Capacidades

- Generacion de texto conversacional multturno, heredada del modelo base Llama 3.1 8B Instruct.
- Ajuste orientado a dominio de soporte al cliente, inferido del identificador del repositorio; no confirmado por documentacion.
- Razonamiento basico, matematicas y generacion de codigo: presentes en el modelo base, pero potencialmente degradados o desplazados por el ajuste de dominio.
- Multilinguismo: el modelo base cubre 8 idiomas, aunque no hay evidencia de que el adaptador conserve ese comportamiento tras el SFT.
- Tool calling / function calling: soportado por Llama 3.1 Instruct a nivel de plantilla de chat, pero no se documenta entrenamiento especifico de herramientas en este adaptador.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Modo thinking explicito, vision o audio: no disponibles; el modelo base es exclusivamente de texto.
- Capacidad de despliegue como adaptador intercambiable (hot-swap) sobre el mismo modelo base, gracias a PEFT.

## Casos de uso

- Prototipado de asistentes de atencion al cliente: el adaptador puede cargarse sobre Llama 3.1 8B Instruct para responder consultas de un catalogo o de un proceso de compra, aprovechando la ventana de 131.072 tokens del modelo base para incluir historial largo de conversacion y politicas de la tienda en el propio prompt.
- Clasificacion y enrutado de tickets: uso del modelo para etiquetar consultas entrantes (devoluciones, envios, facturacion) y derivarlas al equipo correspondiente, con la ventaja de que un adaptador de 0,2 GB puede servirse junto al modelo base sin duplicar su huella en memoria.
- Generacion de respuestas de primer nivel con tono consistente: si el ajuste se hizo sobre transcripciones de soporte, el adaptador tiende a reproducir el registro y las formulas de cortesia del dominio entrenado, reduciendo la necesidad de ingenieria de prompts extensa.
- Base para iteracion rapida de un asistente vertical: al ser un adaptador PEFT, permite experimentar con distintas variantes de datos de soporte sin reentrenar el modelo completo, comparando adaptadores sobre el mismo backend.
- Extraccion de informacion estructurada de conversaciones: conversion de mensajes de cliente en campos normalizados (motivo, producto, urgencia) para alimentar un CRM, sujeto a validacion previa porque no hay evaluacion publicada.
- Investigacion sobre olvido catastrofico y seguridad en fine-tuning: el adaptador es un caso de estudio util para medir como un SFT corto sobre 4 bits afecta a las capacidades generales y a las barreras de seguridad del modelo base.
- Demo educativa de pipelines Unsloth + TRL + PEFT: reproduccion del flujo completo de entrenamiento, guardado y carga de un adaptador LoRA sobre Llama 3.1 8B en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni metricas de dominio) y el repositorio no enlaza datasets de test ni scripts de evaluacion.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base de 8.030 millones de parametros; el coste real lo determina el modelo base, no el adaptador.
- VRAM estimada para el modelo base en 4 bits (bitsandbytes, la configuracion del identificador del modelo base): en torno a 5-6 GB, mas el espacio de activaciones y la cache KV.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB. En bf16/fp16: aproximadamente 16 GB solo para pesos, mas cache KV y overhead.
- GPU consumer: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4070/4080 en cuantizacion de 4 bits. En una RTX 4090 de 24 GB se puede servir en bf16 con contexto moderado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S para despliegues con contexto largo (hasta 131.072 tokens) y varias peticiones concurrentes.
- Opciones de despliegue: `transformers` + `peft` para carga directa del adaptador, vLLM con soporte de adaptadores LoRA (multi-LoRA), TGI, y llama.cpp/Ollama tras fusionar el adaptador en el modelo base y convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| TGY88/novashop-support-lora (adaptador) | 8.030 M en el base + adaptador no cuantificado | 131.072 tokens (heredado, no verificado) | no disponible (base: Llama 3.1 Community License) | HuggingFace, 0 descargas, 0 likes | no disponible |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8.030 M | 131.072 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Benchmarks publicos en la model card oficial |
| Mistral-7B-Instruct-v0.3 | 7.250 M aprox. | 32.768 tokens | Apache 2.0 | HuggingFace | Benchmarks publicos en la model card oficial |
| Qwen2.5-7B-Instruct | 7.610 M aprox. | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 (salvo excepciones por tamano) | HuggingFace | Benchmarks publicos en la model card oficial |

La comparacion relevante no es de rendimiento, ya que este adaptador carece de evaluacion, sino de encaje: frente a Mistral 7B Instruct o Qwen2.5 7B Instruct, que ofrecen licencias permisivas y model cards completas, el adaptador aporta unicamente una especializacion de dominio no documentada y hereda las restricciones de la licencia Llama 3.1.

## Limitaciones y advertencias

- La model card es la plantilla vacia de HuggingFace: no hay descripcion, datos de entrenamiento, hiperparametros, evaluacion ni instrucciones de uso.
- No se declara licencia para el adaptador. Cualquier uso comercial queda condicionado a la licencia del modelo base (Llama 3.1 Community License) y a la ausencia de una licencia explicita del autor, lo que supone un riesgo juridico.
- No hay informacion sobre los datos de SFT: se desconoce si contienen datos personales, contenido con copyright o material sesgado.
- Riesgo de alucinacion inherente al modelo base, no mitigado por un ajuste de dominio corto y sin evaluacion.
- Posible olvido catastrofico: un SFT sobre un modelo ya cuantizado a 4 bits puede degradar capacidades generales, razonamiento y adherencia a instrucciones.
- Las barreras de seguridad del modelo base pueden verse reducidas por el ajuste supervisado, especialmente si los datos de entrenamiento no incluyeron ejemplos de rechazo.
- Sin evidencia empirica de que el adaptador funcione en espanol ni en el resto de idiomas del modelo base.
- La fecha de creacion registrada en los metadatos (2026-09-11) es posterior a la fecha de publicacion de este analisis, lo que indica una inconsistencia de metadatos que conviene verificar.
- El repositorio tiene cero descargas y cero likes, por lo que no existe validacion por parte de la comunidad ni informes de terceros.
- El despliegue con contexto largo (131.072 tokens) exige mucha memoria para la cache KV y no esta validado para este adaptador.
- Resultados de la busqueda web no relevantes: los enlaces recuperados corresponden a tiendas de moda y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TGY88/novashop-support-lora
- Modelo base del adaptador: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
