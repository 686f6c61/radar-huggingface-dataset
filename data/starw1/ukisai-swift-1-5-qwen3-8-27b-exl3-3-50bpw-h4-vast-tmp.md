# Starw1/ukisai-Swift-1.5-Qwen3.8-27B-exl3-3.50bpw-H4-vast-tmp

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo de razonamiento eficiente desarrollado por UkisAI a partir de Qwen3.8-27B de Qwen. Su objetivo es resolver uno de los problemas más costosos de los modelos razonadores actuales: el "overthinking" patológico, es decir, la generación excesiva de tokens de pensamiento que encarece la inferencia sin mejorar la precisión. Según el autor, el modelo emplea un 58,5% menos de tokens de razonamiento mientras obtiene una puntuación un 0,35% superior al modelo base, lo que se traduce en una aceleración de 1,95x en varias tareas.

La versión 1.5 es una actualización directa de Swift 1.0, escalando el post-entrenamiento (RL y OPD) con foco especial en tareas de código, agentes y horizontes largos, como demuestran las mejoras en LiveCodeBench y Terminal Bench 2.1. Es un modelo multimodal (pipeline image-text-to-text) publicado en formato safetensors y, en este repositorio concreto, cuantizado en EXL3 a 3,50 bpw. Su licencia es swift-open-license-1.0, con acceso mediante repositorio gated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, arquitectura detallada no disponible) |
| Parametros totales | 7.510.783.216 (dato real de safetensors en este repo; el nombre indica variante 27B, discrepancia no aclarada por el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3,50 bpw (este repo); existen versiones GGUF y GSQ-RCO GGUF publicadas por el autor |
| Idiomas soportados | no disponibles |
| Licencia | swift-open-license-1.0 (other, repositorio gated) |
| Formato de pesos | safetensors (este repo); GGUF y GSQ-RCO GGUF en repos hermanos |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) de Qwen3.8-27B, por lo que hereda su arquitectura transformer multimodal con capacidad image-text-to-text. La innovacion principal no esta en la arquitectura sino en el metodo de post-entrenamiento: el equipo de UkisAI identifico los tokens asociados al overthinking patologico y los penalizo sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante aprendizaje por refuerzo (RL) y OPD. El resultado es un uso de tokens "comprimido" que mantiene la exactitud.

Swift 1.5 parte de Swift 1.0 y escala los mismos metodos de post-entrenamiento, centrandose esta vez en tareas agenticas, de codigo y de horizonte largo. El conjunto de datos de entrenamiento esta publicado (ukisai/Qwen3.8-27B-multi-turn-agent-sft), aunque el autor indica que no se usa tal cual, sino remuestreado y convertido en entornos de RL adecuados. No se ha publicado el numero total de tokens de entrenamiento ni detalles sobre la composicion completa del dataset.

## Capacidades

- Razonamiento eficiente: reduce un 58,5% los tokens de pensamiento respecto a Qwen3.8-27B manteniendo e incluso mejorando ligeramente la precision (+0,35%).
- Generacion y depuracion de codigo: mejoras destacadas en LiveCodeBench respecto a Swift 1.0 y al modelo base.
- Tareas agenticas de horizonte largo: mejoras en Terminal Bench 2.1, orientado a uso de terminal y flujos multi-paso.
- Comprension de imagen y texto: pipeline image-text-to-text heredado de la familia Qwen3.8.
- Generacion de proyectos complejos: en la demo publicada, construye un videojuego 3D completo en 11,39 minutos frente a los 104,6 minutos del modelo base (aceleracion de ~9x en esa tarea concreta).
- Conversacion multi-turno: el dataset de SFT publicado se centra en interacciones agenticas multi-turno.

## Casos de uso

- Generacion de codigo en produccion: gracias a las mejoras en LiveCodeBench y al menor consumo de tokens de razonamiento, es adecuado para pipelines de generacion y revision de codigo donde el coste por token importa.
- Agentes de terminal y automatizacion: su rendimiento en Terminal Bench 2.1 lo hace idoneo para agentes que ejecutan comandos, depuran entornos y completan tareas multi-paso en shells.
- Asistentes de razonamiento de bajo coste: la reduccion del 58,5% en tokens de pensamiento reduce directamente la latencia y el coste de inferencia en despliegues con alto volumen de consultas.
- Generacion de aplicaciones completas: la demo del videojuego 3D ("little planet") ilustra su capacidad para producir proyectos de software completos a partir de un prompt en lenguaje natural.
- Comprension de documentos multimodales: como modelo image-text-to-text, puede combinarse con sistemas de OCR o analisis de capturas para flujos de trabajo con entrada visual.
- Chatbots conversacionales con razonamiento: el ajuste multi-turno agentico lo orienta a asistentes que necesitan mantener contexto y razonar entre turnos sin inflar el coste.

## Benchmarks y rendimiento

Datos publicados por UkisAI comparando Swift 1.5 con el modelo base Qwen3.8-27B (porcentajes agregados finales, mismos protocolos de evaluacion):

| Benchmark | Qwen3.8-27B | Swift 1.5 | Cambio |
|---|---|---|---|
| LiveCodeBench | no disponible | no disponible | mejora respecto a base y Swift 1.0 |
| Terminal Bench 2.1 | no disponible | no disponible | mejora respecto a base y Swift 1.0 |
| Agregado general | base | +0,35% sobre base | +0,35% |
| Tokens de razonamiento | base | -58,5% | -58,5% |
| Velocidad efectiva | base | 1,95x | +95% |

No se han publicado los valores numericos exactos por benchmark en la informacion disponible; solo se indican las diferencias relativas. En la demo de generacion de un videojuego 3D, el modelo base tardo 104,6 minutos y Swift 1.5 tardo 11,39 minutos.

## Requisitos de hardware

- Este repositorio cuantizado en EXL3 a 3,50 bpw ocupa unos 15,0 GB de pesos, por lo que requiere aproximadamente 16-18 GB de VRAM para inferencia, contando KV cache.
- Con esa cifra, cabria en GPUs consumer de gama alta como una RTX 4090 (24 GB) o una RTX 5080/5090, siempre que el numero real de parametros lo permita (ver advertencias).
- Para el modelo completo sin cuantizar (variante 27B en fp16, ~54 GB), se necesitarian GPUs tipo A100 80GB, H100 o multiples GPUs consumer con offloading.
- Despliegue: EXL3 requiere ExLlamaV3; las variantes GGUF y GSQ-RCO GGUF publicadas por el autor permiten usar llama.cpp, Ollama, LM Studio y similares. Para servir en produccion, vLLM o TGI con los pesos safetensors originales.
- Latencia y throughput: no se han publicado cifras; la aceleracion efectiva declarada por reduccion de tokens de razonamiento es de 1,95x frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion (este repo) | Licencia |
|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B (UkisAI) | 7,51B (safetensors de este repo; nombre indica 27B) | no disponible | EXL3 3,50 bpw | swift-open-license-1.0 (gated) |
| Qwen3.8-27B (Qwen, base) | 27B (según nombre) | no disponible | fp16/bf16 original | no disponible |
| Swift 1.0 Qwen3.8-27B (UkisAI) | no disponible | no disponible | no disponible | no disponible |

Swift 1.5 se posiciona frente a su modelo base como una opcion con igual o mejor precision y aproximadamente el doble de velocidad efectiva gracias al recorte de tokens de razonamiento, a costa de ser un derivado con licencia distinta y repositorio gated. No se dispone de datos comparativos con otros modelos razonadores de la misma clase (por ejemplo, derivados de otras familias de tamano similar).

## Limitaciones y advertencias

- Discrepancia de parametros no resuelta: el nombre del modelo indica 27B, pero los safetensors de este repositorio suman 7,51 mil millones de parametros. Es posible que sea una cuantizacion parcial, un error de etiquetado o una variante distinta; el autor no lo aclara en la model card.
- Repositorio gated: requiere aceptar los terminos de la licencia swift-open-license-1.0 antes de descargar, lo que puede complicar el uso en entornos de CI/CD automatizados.
- Licencia "other": aunque se autodenomina open license, conviene revisar las condiciones de uso comercial en el enlace de la licencia antes de desplegar en produccion.
- Los benchmarks proceden del propio autor y solo se publican como diferencias relativas (+0,35%, -58,5% de tokens), sin puntuaciones absolutas ni evaluacion externa independiente verificable.
- Idiomas soportados, longitud de contexto y detalles de arquitectura no estan documentados en la model card, lo que dificulta planificar ventanas de contexto en produccion.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3.8-27B; no se han publicado evaluaciones de seguridad especificas para este derivado.
- Popularidad muy baja (44 descargas, 1 like en el momento de la ficha), por lo que el soporte comunitario y la deteccion de bugs seran limitados.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Starw1/ukisai-Swift-1.5-Qwen3.8-27B-exl3-3.50bpw-H4-vast-tmp
- Repositorio original del autor: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset de SFT: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Web de UkisAI: https://ukisai.com
- Pagina del producto: https://ukisai.com/products/swift
- Demo del videojuego: https://ukisai.com/swift-games/27b
