# sriq-ai/sriq-MiniCPM5-2B-v1.5-GGUF

## Resumen

sriq-MiniCPM5-2B-v1.5-GGUF es un repositorio de pesos en formato GGUF publicado por el usuario sriq-ai, que contiene una conversion del modelo MiniCPM5-2B-v1.5 a dicho formato mediante la herramienta Unsloth. El recuento real de parametros disponible en safetensors es de 2.516.756.480 (aproximadamente 2,52 mil millones), lo que lo situa en la categoria de modelos pequenos, aptos para inferencia local en hardware de consumo.

El repositorio no incluye model card tecnica mas alla de las instrucciones de uso y la lista de ficheros cuantizados. No se documentan arquitectura, longitud de contexto, composicion del dataset de entrenamiento, idiomas soportados ni licencia. La unica informacion funcional es que se trata de un modelo conversacional compatible con llama.cpp y que admite plantilla de chat mediante la opcion `--jinja`.

Su relevancia practica es la de un artefacto de despliegue: al ofrecer siete niveles de cuantizacion (desde BF16 hasta Q3_K_M) permite ejecutar un modelo de 2,5 B en CPU, iGPU o GPUs de gama baja sin necesidad de infraestructura dedicada. La ausencia de licencia explicita y de benchmarks publicados limita, sin embargo, su evaluacion formal y su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio incluyen `llama` y `llama.cpp`, lo que sugiere una arquitectura tipo transformer decoder-only compatible con llama.cpp; no confirmado) |
| Parametros totales | 2.516.756.480 (2,52 B), dato real de safetensors |
| Parametros activos | no aplica / no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (siete ficheros GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (exclusivamente; el repositorio no publica safetensors) |
| Tamano del repositorio | 19,5 GB en total, sumando los siete ficheros GGUF |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-19 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo mas alla de lo que sugieren las etiquetas del repositorio (`gguf`, `llama`, `llama.cpp`, `llama-cpp`). Estas etiquetas describen el ecosistema de inferencia y el formato de conversion, no necesariamente la arquitectura original: en llama.cpp el identificador `llama` se usa de forma generica para modelos decoder-only densos. No se confirma si se trata de un transformer denso, de una variante MoE, de un modelo hibrido o de un modelo multimodal.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) o innovaciones tecnicas. La model card se limita a indicar que la conversion a GGUF se realizo con Unsloth. El nombre del modelo apunta a la familia MiniCPM en su version 5, pero no se ha localizado la ficha del modelo original ni un enlace al mismo dentro de la informacion disponible, por lo que no puede confirmarse la relacion exacta con el modelo de origen ni si se trata de un ajuste fino adicional.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el uso documentado de `llama-cli` con `--jinja` indican soporte de plantilla de chat para dialogos multi-turno.
- Inferencia local en llama.cpp: compatible con `llama-cli` y, segun la model card, con `llama-mtmd-cli`.
- Posible soporte multimodal: la model card incluye un ejemplo con `llama-mtmd-cli`, la interfaz de llama.cpp para modelos multimodales (vision). No se confirma que este repositorio concreto incluya proyector visual; debe verificarse antes de asumirlo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en escritorio: con la cuantizacion Q4_K_M (aproximadamente 1,5 GB) el modelo puede ejecutarse en un portatil sin GPU dedicada, gestionando dialogos multi-turno mediante la plantilla de chat activada con `--jinja`.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF de 2,5 B, permite iterar sobre prompts y plantillas de chat en minutos, sin coste de API, antes de migrar a un modelo mayor.
- Procesamiento por lotes en CPU: tareas de resumen, reescritura o clasificacion de texto sobre volumenes elevados pueden ejecutarse en servidores sin GPU usando la build de llama.cpp compilada para CPU.
- Despliegue en el borde (edge) o entornos aislados: su tamano reducido permite integrarlo en dispositivos con poca memoria o en redes sin acceso a internet, manteniendo los datos dentro de la infraestructura propia.
- Generacion de texto auxiliar en herramientas de desarrollo: autocompletado de documentacion, generacion de mensajes de commit o borradores de descripcion, ejecutados en local dentro del propio IDE.
- Servicio interno de bajo coste: con la cuantizacion Q8_0 o F16 puede servirse desde una unica GPU de gama media para equipos pequenos, con la ventaja de tener todos los pesos en disco sin dependencia de proveedores externos.
- Experimentacion academica con cuantizacion: el repositorio ofrece siete niveles distintos del mismo modelo, lo que permite medir el impacto de la cuantizacion en la calidad de salida manteniendo constante el resto de variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas genericas de Google sin relacion con el repositorio).

## Requisitos de hardware

Los valores de VRAM que se indican a continuacion son estimaciones derivadas de la aritmetica de cuantizacion (2,52 B de parametros) y del tamano agregado del repositorio (19,5 GB en siete ficheros), no datos publicados por el autor. A la cifra de pesos hay que sumar entre 0,3 y 0,7 GB para cache KV y sobrecarga del runtime con contextos cortos (4K tokens), y mas si el contexto se amplia.

| Cuantizacion | Tamano aproximado de pesos | VRAM/RAM estimada en uso |
|---|---|---|
| Q3_K_M | ~1,24 GB | ~1,8 GB |
| Q4_K_M | ~1,51 GB | ~2,1 GB |
| Q5_K_M | ~1,76 GB | ~2,4 GB |
| Q6_K | ~2,07 GB | ~2,7 GB |
| Q8_0 | ~2,68 GB | ~3,3 GB |
| F16 / BF16 | ~5,03 GB | ~5,7 GB |

- GPU de consumo: todas las cuantizaciones hasta Q8_0 caben en GPUs con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Las versiones F16 y BF16 caben en 8 GB justo, con contexto reducido.
- GPU de gama alta: A100, H100, L40S o RTX 4090 no aportan ventaja de capacidad para este tamano; su utilidad seria el throughput en despliegues con muchas peticiones concurrentes.
- CPU e iGPU: la cuantizacion Q4_K_M es viable en CPU moderna con 8 GB de RAM. En Mac con Apple Silicon (8 GB unificados o mas) caben todas las variantes hasta Q8_0.
- Movil y SBC: Q3_K_M y Q4_K_M son las unicas opciones realistas en dispositivos con 4 GB de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), Ollama (importando el GGUF), LM Studio, llama-cpp-python, text-generation-webui y, con soporte experimental, vLLM. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos verificados de este modelo (contexto, licencia, benchmarks), por lo que la comparacion se limita a parametros, contexto y licencia de alternativas publicas de tamano similar. Los datos de las alternativas proceden de sus fichas publicas habituales y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| sriq-MiniCPM5-2B-v1.5 (este) | 2,52 B | no disponible | no disponible | Si (7 cuantizaciones) |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache-2.0 | Si |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Si |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Si |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | MIT | Si |

La ventaja diferencial de este repositorio es la disponibilidad simultanea de siete niveles de cuantizacion para un mismo modelo de 2,5 B. Su desventaja frente a las alternativas es la falta de licencia explicita, de idiomas declarados y de resultados de evaluacion, lo que dificulta justificar su adopcion frente a opciones con licencia permisiva y benchmarks publicos.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en el repositorio, no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Es un bloqueo potencial para produccion.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad de las respuestas ni el impacto de cada nivel de cuantizacion.
- Procedencia no verificada: se trata de una conversion publicada por un tercero (sriq-ai) a partir de un modelo cuyo origen no se documenta en el repositorio. No se ha localizado la ficha del modelo original.
- Model card minima: la informacion publicada es una plantilla generica de conversion a GGUF; no describe el modelo, sus datos de entrenamiento ni sus limitaciones.
- Riesgo de alucinacion: no cuantificado. En modelos de 2,5 B la tasa de alucinacion suele ser elevada en tareas de conocimiento factual, pero no hay datos de este modelo en concreto.
- Ambiguedad multimodal: la model card menciona `llama-mtmd-cli`, pero tambien da el comando de texto plano como primera opcion. No debe asumirse capacidad de vision sin verificar si el repositorio incluye proyector visual.
- Idiomas: no declarados. No puede garantizarse un rendimiento aceptable en castellano ni en ningun otro idioma concreto.
- Contexto desconocido: sin la longitud de contexto declarada, no es posible dimensionar la cache KV ni planificar despliegues con documentos largos.
- Metadatos de fecha inusuales: el repositorio figura como creado el 2026-09-19, lo que conviene tener en cuenta al evaluar su trazabilidad y mantenimiento.
- Repositorio sin traccion: 0 descargas y 0 likes, sin comunidad que haya validado su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/sriq-ai/sriq-MiniCPM5-2B-v1.5-GGUF
- Unsloth (herramienta de conversion citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible): https://github.com/ggml-org/llama.cpp
- Paper, blog, demo o repositorio del modelo original: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; unicamente paginas genericas de Google (buscador, traductor, imagenes y Google for Education) sin contenido tecnico aprovechable.
