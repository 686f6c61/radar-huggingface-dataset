# Unluckkie/Spark-X2.6-4B-Sharp-IK-GGUF

## Resumen

Spark-X2.6-4B-Sharp-IK-GGUF es una coleccion de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-4B, un transformer de 4.000 millones de parametros orientado a generacion de codigo y flujos agenticos. La publica el usuario Unluckkie combinando tres metodologias de cuantizacion: el mapa de asignacion de bits por tensor GSQ-RCO de la comunidad, una imatrix calibrada especificamente con datos de codigo ("Sharp") y los kernels no lineales de ik_llama.cpp.

El objetivo declarado es ejecutar un agente de codificacion autonomo (tipo Aider) en hardware muy limitado, concretamente portatiles con 8 GB de RAM y sin GPU dedicada. Para ello los pesos se comprimen hasta 2,1-2,8 GB segun el nivel de cuantizacion, manteniendo las capas de atencion critica (gates `attn_gate` y capas de atencion completa) en BF16.

Es relevante porque demuestra una practica de cuantizacion selectiva por tensor que prioriza la calidad en tareas de codigo frente al compromiso uniforme habitual. La contrapartida es una dependencia estricta del fork ik_llama.cpp: estos ficheros no cargan en llama.cpp estandar, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; el modelo base emplea gates sigmoideos por cabeza en atencion, `attn_gate`) |
| Parametros totales | 4B (segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 8192` y la imatrix se calibro con fragmentos de 4096 tokens |
| Tipos de cuantizacion | IQ3_KS, IQ3_M, IQ4_KS, IQ5_KS, IQ6_K (variantes Sharp y GSQ) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere ik_llama.cpp; no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

La model card de esta publicacion no describe la arquitectura ni el entrenamiento del modelo base; solo documenta el proceso de cuantizacion. Se sabe que el modelo base es un transformer de 4B con gates de atencion sigmoideos por cabeza (`attn_gate`) y capas de atencion completa que se activan con contexto largo, segun la justificacion de la imatrix Sharp. No hay datos disponibles sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion de esta release esta en la cuantizacion. Se parte de `Spark-X2.6-4B-Q8_0.gguf` y se aplica un mapa de bits por tensor extraido de los cuants GSQ-RCO de la comunidad, que reduce las capas feed-forward a 3, 4 o 5 bits mientras mantiene en BF16 los gates de atencion y las capas de atencion completa. Se ofrecen dos imatrix: una "Sharp" calibrada con 14,9 millones de tokens de codigo en fragmentos de 4096 tokens, y una "GSQ" estandar calibrada con 300 fragmentos del dataset Chimere (codigo, matematicas y tool calling). La cuantizacion se realiza con `llama-quantize --imatrix --custom-q` de ik_llama.cpp, usando sus rejillas no lineales `_KS`.

## Capacidades

- Generacion de texto y codigo, con enfasis declarado en tareas de programacion autonoma.
- Flujos agenticos: la model card menciona soporte de tool calling y uso con agentes como Aider mediante plantilla de chat Jinja (`--jinja`).
- Edicion de codigo en formato "whole" (Aider), adecuada para reescrituras completas de fichero.
- Tareas generales de agente: la variante GSQ se presenta como equilibrada para scraping web y automatizacion de sistemas.
- Capacidades matematicas: el dataset de calibracion GSQ incluye datos de matematicas, pero no se documentan resultados.
- Multilingue: solo se declara ingles (`en`).
- No se documentan modos de razonamiento explicito, vision ni audio.

## Casos de uso

- Agente de codificacion local con Aider: el modelo se sirve con `llama-server` y se conecta a Aider via API compatible con OpenAI; la variante `IQ4_KS-Sharp` esta pensada como configuracion diaria para este flujo.
- Refactorizacion de ficheros completos en portatiles de 8 GB: el formato de edicion "whole" y el contexto de 8192 tokens permiten reescribir modulos enteros sin GPU dedicada.
- Autocompletado y generacion de parches en entornos sin GPU: los cuants IQ3 de ~2,1 GB caben en equipos de 4-6 GB de RAM, lo que habilita asistencia de codigo en hardware de gama baja.
- Automatizacion de sistemas y scraping: la variante GSQ estandar, calibrada con datos mixtos de codigo, matematicas y tool calling, es la recomendada para tareas agenticas no centradas en codigo.
- Prototipado de pipelines agenticos multi-paso en local: el soporte de tool calling y plantilla Jinja permite probar orquestaciones de herramientas sin coste de API.
- Evaluacion de tecnicas de cuantizacion selectiva: la release sirve como referencia practica para comparar mapas por tensor e imatrix especificas de dominio frente a cuantizaciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta tamanos de fichero y afirmaciones cualitativas sobre retencion de calidad, sin metricas de perplejidad ni evaluaciones de codigo.

## Requisitos de hardware

- VRAM/RAM estimada: entre 2,1 GB (IQ3) y 2,8 GB (IQ6) para los pesos; el autor apunta a equipos con 8 GB de RAM y menciona que los IQ3 caben en 4 GB.
- El proceso de cuantizacion se realizo en un i5-8250U con 8 GB de RAM y sin GPU dedicada, lo que indica que la inferencia esta pensada para CPU.
- GPU: no se documentan requisitos ni recomendaciones de GPU (A100, H100, RTX 4090); el enfoque es CPU-first.
- Despliegue: exclusivamente mediante `llama-server` de ik_llama.cpp con flags `-c 8192 -b 256 -ub 256 -fa --jinja`. No es compatible con llama.cpp estandar, Ollama, LM Studio ni, presumiblemente, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Sharp-IK-GGUF | 4B | no disponible (ejemplo a 8192) | GGUF (ik_llama.cpp) | Apache 2.0 | Cuantizacion selectiva por tensor con imatrix de codigo |
| Spark-X2.6-4B (base, XHToken) | 4B | no disponible | safetensors/GGUF | no disponible | Modelo original sin cuantizar |
| Sharp-Spark-X2.6-4B-GGUF (peculiar-ragdoll) | 4B | no disponible | GGUF | no disponible | Origen de la imatrix Sharp y la plantilla de chat |
| Spark-X2.6-4B-Uncensored-GSQ-RCO-GGUF (abenzerps) | 4B | no disponible | GGUF | no disponible | Origen del mapa GSQ-RCO |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Dependencia estricta de ik_llama.cpp: los cuants `_KS` y `_K` no cargan en llama.cpp estandar, Ollama ni LM Studio, lo que limita el ecosistema de herramientas disponible.
- Solo ingles declarado; el rendimiento en castellano no esta verificado.
- No hay benchmarks publicados: las afirmaciones de retencion de calidad son cualitativas y no verificables con los datos aportados.
- Riesgo de alucinacion inherente a un modelo de 4B en tareas de codigo y agenticas; no se documentan mitigaciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base XHToken/Spark-X2.6-4B, que no se detalla en esta ficha.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre su calidad real.
- El contexto maximo real del modelo base no se especifica; el ejemplo de 8192 tokens es una configuracion de servidor, no necesariamente el limite del modelo.

## Enlaces

- Hugging Face (esta release): https://huggingface.co/Unluckkie/Spark-X2.6-4B-Sharp-IK-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Imatrix Sharp y plantilla: https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.6-4B-GGUF
- Mapa GSQ-RCO: https://huggingface.co/abenzerps/Spark-X2.6-4B-Uncensored-GSQ-RCO-GGUF
- Toolchain ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
