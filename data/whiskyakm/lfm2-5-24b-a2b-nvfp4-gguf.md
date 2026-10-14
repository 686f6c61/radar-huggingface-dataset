# WhiskyAKM/LFM2.5-24B-A2B-NVFP4-GGUF

## Resumen

LFM2.5-24B-A2B-NVFP4-GGUF es una conversión a GGUF con cuantización NVFP4 del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario WhiskyAKM. LFM2.5-24B-A2B es un modelo de razonamiento desarrollado por Liquid AI, el mayor y último de la familia LFM2.5, disenado para ejecutar agentes locales de forma rápida y privada. Su planteamiento combina una arquitectura Mixture of Experts (MoE) con 24.000 millones de parámetros totales y solo unos 2.450 millones activos por token, lo que reduce el coste computacional de cada token de razonamiento.

La relevancia de este repositorio concreto es doble. Por un lado, traslada el modelo original a formato GGUF, lo que permite ejecutarlo con llama.cpp y otros motores compatibles, algo imprescindible para despliegues en local y en el borde. Por otro, emplea NVFP4, el formato de coma flotante de 4 bits (E2M1) de NVIDIA, que la model card describe como capaz de preservar una calidad cercana a bfloat16 y de acelerarse en GPUs Blackwell a través de llama.cpp. El resultado es un fichero de unos 13,6 GB para un modelo que soporta 131.072 tokens de contexto y 16 idiomas.

El modelo está orientado a tareas agénticas y de uso de herramientas, y su autor lo posiciona como competitivo frente a Qwen3.6-35B-A3B en tareas de agente y tool use, con aproximadamente la mitad de parámetros totales y activos. La licencia es lfm1.0, una licencia propia de Liquid AI, por lo que conviene revisar sus términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (Mixture of Experts), con 30 bloques double-gated short convolution y 10 capas GQA |
| Parametros totales | 23.971.587.712 (~24,0B) |
| Parametros activos | ~2,45B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, formato de coma flotante de 4 bits de NVIDIA); en este repositorio solo se publica el fichero NVFP4 |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, thai, indonesio, hindi, ruso, polaco |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (llama-cpp) |
| Tamano del repositorio | 13,6 GB |
| Numero de capas | 40 |
| Expertos | 64 por bloque MoE, enrutamiento top-4 |
| Tamano de vocabulario | 128.000 |
| Presupuesto de entrenamiento | 36 billones de tokens |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Parametros de generacion recomendados | Temperature 0,1; top-k 50; repetition penalty 1,05 |

## Arquitectura y entrenamiento

LFM2.5 es una arquitectura MoE de 40 capas que combina dos tipos de bloque: 30 bloques de convolucion corta con doble puerta (double-gated short convolution) y 10 capas de atencion con consultas agrupadas (GQA). Cada bloque MoE incorpora 64 expertos con enrutamiento top-4, de modo que solo se activa una fraccion pequena de la red por token. Con 24B de parametros totales y aproximadamente 2,45B activos, el modelo persigue el coste por token caracteristico de un MoE pequeno manteniendo la capacidad de uno grande. El vocabulario es de 128.000 entradas y el contexto nativo alcanza los 131.072 tokens.

Segun la model card, el modelo se entreno con un presupuesto de 36 billones de tokens. No se detalla en la informacion disponible la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento. La innovacion mas destacada que declara el autor es el modo de razonamiento ("always thinks before it answers") combinado con la eficiencia de un MoE de 2B activos, lo que abarata cada token de pensamiento, y una eficiencia de inferencia hasta 1,7 veces superior a la de MoEs comparables en dispositivos. La cuantizacion NVFP4 anade una capa de optimizacion adicional para GPUs Blackwell.

## Capacidades

- Generacion de texto conversacional con pipeline text-generation.
- Razonamiento explicito antes de responder: el modelo esta disenado para "pensar" antes de dar la respuesta final.
- Rendimiento destacado en tareas agénticas y de uso de herramientas (tool calling / function calling), segun la model card.
- Razonamiento multi-paso y flujos de agente, con enfasis declarado en desempeno "best-in-class" dentro de su categoria.
- Soporte multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, thai, indonesio, hindi, ruso y polaco.
- Orientacion a ejecucion en dispositivo (on-device) y entornos con recursos limitados, gracias a los ~2,45B parametros activos.
- No se documentan en la informacion disponible capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Agentes locales en el puesto de trabajo: al ejecutarse con llama.cpp y ocupar unos 13,6 GB en NVFP4, puede desplegarse en una estacion de trabajo con GPU Blackwell y operar sin enviar datos a servicios externos, algo relevante para entornos con requisitos de privacidad.
- Automatizacion de herramientas y APIs: su enfoque en tool use permite construir asistentes que encadenan llamadas a funciones (consultas a bases de datos, operaciones sobre ficheros, peticiones HTTP) con razonamiento intermedio entre pasos.
- Razonamiento sobre documentos largos: con 131.072 tokens de contexto puede procesar contratos, informes tecnicos o bases de codigo extensas en una sola pasada, sin necesidad de fragmentacion agresiva.
- Asistencia tecnica multilingue: los 16 idiomas soportados permiten atender consultas en espanol, portugues, arabe, hindi o japones con el mismo modelo, simplificando el mantenimiento de una unica infraestructura.
- Pipelines de agentes con API compatible con OpenAI: llama-server expone una API compatible, de modo que el modelo puede sustituir a un endpoint remoto en aplicaciones ya construidas sobre ese contrato.
- Prototipado e investigacion en eficiencia: sirve para estudiar el comportamiento de MoEs con enrutamiento top-4 y cuantizacion de 4 bits en flujos de razonamiento, con un coste en disco y memoria contenido.
- Despliegues en el borde con GPU: la aceleracion NVFP4 en Blackwell permite servir el modelo en equipos de gama alta para escritorio o en servidores compactos, con menor huella de memoria que una version bf16.

## Benchmarks y rendimiento

La model card solo reporta un resultado comparativo, en la metrica LiveClaw:

| Metrica | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ni cifras de latencia o throughput medidas. El dato de Qwen3.6-35B-A3B procede de la propia model card del autor y no se ha verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 13,6 GB, por lo que se necesitan aproximadamente 14 GB solo para los pesos; hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto efectiva (no se especifica en la informacion disponible).
- Aceleracion NVFP4: la model card indica que NVFP4 se acelera en GPUs NVIDIA Blackwell a traves de llama.cpp. En generaciones anteriores de GPU no se documenta el nivel de soporte nativo del formato.
- GPUs recomendadas: familia Blackwell para aprovechar NVFP4 (por ejemplo B200 o RTX 50). No se documentan recomendaciones concretas para A100, H100 ni RTX 4090 en la informacion disponible.
- Viabilidad en GPU de consumo: probable en tarjetas con al menos 16 GB de VRAM si se usa un contexto moderado, aunque no se confirma oficialmente; con contextos cercanos a 131.072 tokens los requisitos crecen.
- Opciones de despliegue: llama.cpp mediante llama-cli y llama-server (API compatible con OpenAI). No se mencionan en la informacion disponible integraciones con vLLM, TGI, Ollama ni otros motores.
- Parametros de generacion sugeridos: temperature 0,1, top-k 50 y repetition penalty 1,05.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | LiveClaw | Licencia |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (este repositorio, NVFP4 GGUF) | 24,0B | ~2,45B | 131.072 | 48,09 | lfm1.0 |
| Qwen3.6-35B-A3B | 35B (aprox.) | 3B (aprox.) | no disponible | 38,19 | no disponible |
| Otros MoE de borde comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es la que ofrece la propia model card frente a Qwen3.6-35B-A3B, un MoE con aproximadamente un 50% mas de parametros totales y activos. No se dispone de datos verificados de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propia de Liquid AI, etiquetada como "other" en HuggingFace. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones de escala, atribucion o sectores.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; como cualquier modelo generativo, puede producir contenido incorrecto con apariencia de certeza, especialmente en dominios especializados.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo, composicion del dataset ni medidas de mitigacion.
- Cobertura idiomatica desigual: aunque se listan 16 idiomas, no se especifica el nivel de calidad por idioma; es previsible un rendimiento inferior en los idiomas con menos presencia en el corpus de entrenamiento.
- Contexto: los 131.072 tokens son la longitud nativa declarada, pero no se documenta el rendimiento de recuperacion en contextos muy largos ni si existe degradacion.
- Cuantizacion NVFP4: la propia model card indica que la aceleracion depende de GPUs Blackwell. En hardware distinto, el rendimiento y la viabilidad practica no estan documentados.
- Repositorio de terceros: se trata de una conversion realizada por un usuario (WhiskyAKM) y no por Liquid AI; no consta validacion oficial de la calidad de la cuantizacion ni de la equivalencia funcional con el modelo base.
- Madurez: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de uso en produccion.
- No se documentan capacidades multimodales, por lo que no debe asumirse soporte de vision o audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WhiskyAKM/LFM2.5-24B-A2B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota: los resultados de la busqueda web realizada no contenian ningun enlace relacionado con este modelo; no se incluyen por no ser pertinentes.
