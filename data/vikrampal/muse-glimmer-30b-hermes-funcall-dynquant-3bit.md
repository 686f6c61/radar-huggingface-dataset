# VikramPal/Muse-Glimmer-30B-hermes-funcall-DynQuant-3bit

## Resumen

Muse-Glimmer-30B-hermes-funcall-DynQuant-3bit es una versión cuantizada a 3 bits del modelo Muse Glimmer de Meta, fine-tuneado para function calling sobre el dataset Hermes. Desarrollado por VikramPal, este checkpoint combina la arquitectura `muse_glimmer` (un modelo de lenguaje con torre de visión, 52 capas de texto, hidden size 6656 y embeddings no atados) con una cuantización DynQuant que reduce el peso a 10.43 GiB, una compresión de 5.32x respecto a bf16. El fine-tune con LoRA (r=32, alpha=64) sobre 416 módulos mejora la capacidad de tool use en +27.33 puntos sobre el modelo base, y la versión 4-bit del mismo autor ya demostró retener el 78% de esa ganancia. La versión 3-bit, sin embargo, aún no ha sido evaluada formalmente, por lo que su precisión real es desconocida.

El modelo está pensado para agentes locales que necesitan ejecutar llamadas a herramientas de forma eficiente en hardware de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones, y al ser un modelo image-text-to-text, puede procesar tanto texto como imágenes. No obstante, presenta una advertencia importante: la carga mediante `from_pretrained` estándar produce salidas sin sentido debido a un problema con la normalización de embeddings en la cuantización DynQuant, por lo que requiere un manejo especial en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (muse_glimmer, 52 capas de texto, hidden 6656, embeddings no atados, con torre de vision) |
| Parametros totales | 3.025.266.688 (segun safetensors; el nombre del modelo indica 30B, posible error de etiquetado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | DynQuant 3-bit (2.9998 bits promedio), tambien disponible en 4-bit (3.9999 bits) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards bf16 fusionados, luego cuantizados) |

## Arquitectura y entrenamiento

El modelo base es Muse Glimmer, un modelo causal de 30 mil millones de parametros (aunque el conteo real de safetensors es de ~3 mil millones, lo que sugiere una discrepancia en el etiquetado) con un encoder de percepcion dedicado, disenado por Meta Superintelligence Labs para tareas agénticas en hardware de consumo. Sobre esta base, el autor aplico un fine-tune con LoRA (r=32, alpha=64, scaling 2.0) sobre 416 modulos objetivo, utilizando el dataset NousResearch/hermes-function-calling-v1. Los pesos LoRA se fusionaron en bf16 con un error relativo maximo por modulo de 0.00389 (tolerancia 0.0078). Posteriormente, se aplico cuantizacion DynQuant con asignacion de bits por modulo basada en senales de saliencia de activacion y plasticidad de gradiente recogidas durante el propio fine-tune. La version 3-bit tiene un promedio de 2.9998 bits, con un histograma de anchos de 2b:111, 3b:161, 4b:451, y 209 modulos que incumplen los minimos de arquitectura, lo que indica que el presupuesto de bits es muy ajustado.

## Capacidades

- Function calling y tool use: fine-tune especifico sobre el dataset Hermes, con soporte para llamadas paralelas y argumentos estructurados.
- Procesamiento de imagen y texto: al ser image-text-to-text, puede recibir entradas visuales junto con texto.
- Generacion de texto conversacional: mantiene conversaciones multi-turno.
- Razonamiento basico: heredado del modelo base, aunque no se han publicado benchmarks generales.
- Multilingue: solo ingles (segun la etiqueta `language: en`).
- No se menciona soporte explicito para agentes multi-step ni thinking mode.

## Casos de uso

- Asistentes virtuales con llamada a herramientas: el modelo puede invocar APIs externas (busqueda, calculo, bases de datos) de forma estructurada, gracias al fine-tune en function calling. Es adecuado para entornos donde se necesita un asistente ligero que ejecute acciones concretas.
- Automatizacion de tareas de oficina: integrado en un pipeline de agentes, puede redactar correos, programar reuniones o consultar calendarios mediante tool calls, con un consumo de VRAM reducido gracias a la cuantizacion 3-bit.
- Procesamiento de documentos con imagenes: al aceptar entradas visuales, puede extraer informacion de capturas de pantalla o graficos y combinarla con instrucciones textuales para generar respuestas o ejecutar acciones.
- Chatbots de soporte tecnico: con un contexto de conversacion largo (aunque no se especifica la longitud exacta), puede gestionar incidencias multi-turno y escalar a herramientas de ticketing mediante function calling.
- Prototipado rapido de agentes en hardware local: al caber en una GPU de consumo (tamano de 10.43 GiB), permite desarrollar y probar agentes con tool use sin depender de servicios en la nube.
- Investigacion en cuantizacion: el checkpoint es util para estudiar el impacto de la cuantizacion agresiva (3 bits) en tareas de function calling, comparando con las versiones bf16 y 4-bit del mismo autor.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion sobre 600 items held-out del dataset Hermes, en formato nativo de un solo turno. La version 3-bit no ha sido evaluada aun; los datos disponibles corresponden a las versiones bf16 y 4-bit.

| Arm | Bits | Tamano | Exact % | Names % | Count % | Emitted % | All-600 % | vs bf16 | Gained/Lost | p |
|---|---|---|---|---|---|---|---|---|---|---|
| Base, no fine-tune | 16.00 | 55.5 GiB | 33.43 | 47.97 | 48.55 | 98.55 | 20.50 | -27.33 | 1 / 95 | 2.4e-27 |
| Base + prompt hint | 16.00 | 55.5 GiB | 59.01 | 77.62 | 78.20 | 98.26 | 36.00 | -1.74 | 10 / 16 | 0.33 |
| Fine-tuned, no signal | 16.00 | 55.5 GiB | 60.47 | 81.40 | 81.69 | 98.26 | 37.00 | -0.29 | 5 / 6 | 1.00 |
| Fine-tuned bf16 | 16.00 | 55.5 GiB | 60.76 | 79.94 | 80.52 | 97.97 | 37.00 | -- | -- | -- |
| DynQuant 4-bit | 3.9999 | 13.9 GiB | 54.65 | 71.51 | 72.67 | 97.38 | 33.50 | -6.10 | 7 / 28 | 0.00051 |
| DynQuant 3-bit | 2.9998 | 10.4 GiB | No medido | | | | | | | |

El fine-tune aporta +27.33 puntos sobre el base. La version 4-bit retiene +21.22 de esa ganancia (78%) con una compresion de 3.99x, pero pierde 6.10 puntos frente a bf16, una diferencia estadisticamente significativa (28 items perdidos contra 7 ganados). La version 3-bit, con 5.32x de compresion, no tiene resultados publicados.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado pesa 10.43 GiB, por lo que se necesita al menos 12 GB de VRAM para inferencia con overhead de activaciones. Con cuantizacion adicional o offloading, podria caber en 8 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), o cualquier GPU con al menos 12 GB. En consumer, una RTX 3060 12 GB o superior podria ejecutarlo.
- Opciones de despliegue: al ser un modelo transformers, puede usarse con vLLM, TGI o directamente con `transformers`. No se menciona soporte para llama.cpp u Ollama, aunque al ser safetensors podria convertirse a GGUF.
- Latencia y throughput: no disponibles. Dado el tamano reducido, se espera una latencia moderada en GPU consumer, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Function calling |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-hermes-funcall-DynQuant-3bit (este) | 3.025.266.688 (segun safetensors) | No disponible | Apache 2.0 | DynQuant 3-bit | Si (fine-tune Hermes) |
| Muse Glimmer 30B (base, Meta) | 30B (segun Meta) | No disponible | Apache 2.0 | bf16 | No (base) |
| vcruz305/Muse-Glimmer-30B-Hermes-Agentic | 30B (segun nombre) | No disponible | Apache 2.0 | bf16 | Si (fine-tune Hermes Agent) |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de otros modelos de function calling como Hermes 2 Pro o Llama 3.1 para una comparacion directa.

## Limitaciones y advertencias

- La version 3-bit no ha sido evaluada: se desconoce su precision real en tareas de function calling. La model card advierte que el presupuesto de bits es tan ajustado que 209 modulos incumplen los minimos de arquitectura, lo que podria degradar el rendimiento.
- Problema de carga critico: `from_pretrained` estandar produce un modelo que genera "fluent nonsense" con 0.00% de exactitud en los 600 items de evaluacion. La causa es que `DynQuantEmbedding` no aplica la normalizacion RMSNorm que el modelo original espera en `embed_tokens`. Se requiere un manejo especial al cargar los pesos.
- Solo ingles: no soporta otros idiomas de forma nativa.
- Discrepancia en el numero de parametros: el nombre del modelo indica 30B, pero el conteo real de safetensors es de ~3B. Esto puede deberse a un error de etiquetado o a una arquitectura diferente; conviene verificar antes de usarlo en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de alucinacion; como modelo de lenguaje, puede inventar informacion.
- Limitaciones de contexto: no se especifica la longitud de contexto, lo que dificulta planificar tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VikramPal/Muse-Glimmer-30B-hermes-funcall-DynQuant-3bit
- Pagina oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigacion de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Fine-tune similar de vcruz305: https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic
- Modelo en Ollama: https://ollama.com/library/muse-glimmer:30b
