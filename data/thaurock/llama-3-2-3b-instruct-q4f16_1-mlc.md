# Thaurock/Llama-3.2-3B-Instruct-q4f16_1-MLC

## Resumen

Este repositorio no contiene un modelo nuevo, sino una compilación comunitaria de Meta Llama 3.2 3B Instruct preparada para el runtime MLC LLM. El autor (usuario Thaurock) publica los artefactos ya compilados y cuantizados en formato q4f16_1, de modo que el modelo puede ejecutarse directamente con MLC sin necesidad de convertir pesos. La model card está vacía: únicamente incluye la etiqueta `license: apache-2.0`, sin descripción, sin idiomas declarados y sin datos de entrenamiento. El repositorio acumula 0 descargas y 0 likes.

El modelo subyacente, Llama 3.2 3B Instruct, es un transformer decoder-only denso de aproximadamente 3 200 millones de parámetros publicado por Meta en septiembre de 2024. Está diseñado para despliegue en dispositivos de borde (móvil, portátil, navegador) y soporta una ventana de contexto de hasta 128 000 tokens. Esta compilación concreta es relevante para desarrolladores que quieran ejecutar un LLM de 3B en GPU de gama baja, navegador o dispositivo móvil mediante MLC LLM, pero conviene tener en cuenta que el repositorio no aporta ninguna validación propia, ni benchmarks, ni documentación, y que la etiqueta de licencia declarada es probablemente incorrecta (véase la sección de limitaciones).

La ficha combina, por tanto, dos niveles de información: lo que consta en este repositorio (mínimo) y lo que documenta Meta para el modelo base, indicado explícitamente como tal en cada caso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base); este repositorio contiene artefactos compilados para MLC LLM, no pesos en formato estandar |
| Parametros totales | ~3 200 millones en el modelo base (no declarado en el repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no declarado en el repositorio |
| Tipos de cuantizacion | q4f16_1 (cuantizacion por grupos de 4 bits, activaciones en fp16); es el unico artefacto publicado |
| Idiomas soportados | El repositorio no los declara. El modelo base cubre 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Declarada como apache-2.0 en el repositorio; el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | Artefactos MLC LLM (ficheros `params_shard_*.bin`, `ndarray-cache.json` y configuracion de compilacion); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

Segun la documentacion de Meta para el modelo base, Llama 3.2 3B Instruct es un transformer decoder-only con 28 capas, dimension oculta de 3072, 24 cabezas de atencion y 8 cabezas KV (GQA, *grouped-query attention*), con embeddings atados (*tied embeddings*) entre entrada y salida. Emplea RoPE para la codificacion posicional, normalizacion RMSNorm y activacion SwiGLU. La ventana de contexto es de 128 000 tokens y se entreno sobre del orden de 9 billones de tokens con una fecha de corte de conocimiento en diciembre de 2023. El ajuste final combino supervision (SFT), rechazo de muestras y optimizacion por preferencias, y el modelo se obtuvo mediante poda y destilacion a partir de modelos mayores de la familia Llama 3.1.

La aportacion de este repositorio es exclusivamente de despliegue: los pesos originales se han cuantizado a 4 bits por grupos (q4f16_1) y compilado para el runtime MLC LLM, que genera kernels especificos por plataforma (CUDA, Metal, Vulkan, WebGPU, ROCm). No hay informacion en el repositorio sobre el proceso de cuantizacion (calibracion, tamano de grupo exacto, perdida de precision medida), ni sobre verificacion de que la salida coincida con el modelo original. Para la descripcion de la arquitectura y del entrenamiento, la unica fuente disponible es la documentacion de Meta.

## Capacidades

Las capacidades listadas corresponden al modelo base Llama 3.2 3B Instruct segun la documentacion de Meta; el repositorio no documenta ninguna capacidad adicional ni ninguna restriccion propia.

- Generacion de texto y resumen: redaccion, sintesis de documentos y reescritura condicionada por instrucciones.
- Razonamiento de proposito general y tareas de conocimiento comunes, con calidad limitada por el tamano de 3B parametros.
- Generacion de codigo y explicacion de fragmentos, asi como completado en entornos locales.
- Matematicas de nivel escolar y problemas de varios pasos sencillos (sin garantia de correccion aritmetica).
- Extraccion de informacion estructurada: conversion de texto libre a JSON, clasificacion, etiquetado y analisis de sentimiento.
- Soporte multilingue en los 8 idiomas oficiales del modelo base; el rendimiento fuera de ingles y de los idiomas declarados cae de forma notable.
- Soporte de *tool calling* / *function calling* segun la documentacion del modelo base, lo que permite conectarlo a APIs externas y a flujos de agentes.
- Razonamiento en varios pasos y uso como agente en pipelines con llamadas a herramientas, aunque con menor fiabilidad que modelos mayores.
- No dispone de modo de razonamiento explicito (*thinking mode*), vision, audio ni salidas multimodales; Llama 3.2 reserva las capacidades de vision para las variantes 11B y 90B.
- Ejecucion en navegador y movil gracias al backend MLC, que es la caracteristica diferencial de este repositorio frente a otras conversiones.

## Casos de uso

- Asistente local en portatil o equipo de sobremesa: al estar cuantizado a 4 bits, el modelo puede ejecutarse en una GPU de gama media o incluso en CPU con acceleration, lo que permite disponer de un asistente sin enviar datos a servicios externos.
- Asistente en aplicacion movil: los artefactos MLC compilados para Metal y Vulkan permiten integrar el modelo en apps iOS y Android para tareas de resumen, respuesta y reescritura sin conexion.
- Inferencia en navegador mediante WebGPU: util para demos publicas, herramientas internas o formularios inteligentes donde no se puede depender de un servidor.
- Clasificacion y extraccion en pipelines de datos: convertir correos, tickets o mensajes a JSON estructurado, o etiquetar grandes volumenes de texto combinando el modelo con una cola de procesamiento por lotes.
- Generacion y revision de codigo en local: autocompletado o explicacion de fragmentos dentro de un IDE, con la ventaja de que el codigo no sale de la maquina.
- Agente sencillo con *tool calling*: encadenar busquedas, consultas a bases de datos o llamadas HTTP en un flujo de varios pasos para automatizar tareas administrativas.
- Resumen de documentos largos: los 128 000 tokens de contexto del modelo base permiten procesar informes, contratos o transcripciones extensas en una sola pasada, aunque con la degradacion habitual de la atencion en contextos muy largos.
- Traduccion y atencion multilingue basica entre los 8 idiomas soportados, incluido el espanol, en escenarios donde no se requiere calidad de traduccion profesional.
- Prototipado rapido de aplicaciones de IA generativa: al ser un modelo pequeno y con licencia permisiva declarada, es adecuado para validar una idea antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Thaurock no incluye ninguna tabla de evaluacion, ni comparacion con el modelo sin cuantizar, ni medicion de perplejidad tras la cuantizacion a 4 bits. Los resultados oficiales del modelo base pueden consultarse en la model card de Meta (`meta-llama/Llama-3.2-3B-Instruct`), pero no se reproducen aqui porque no forman parte de la informacion proporcionada sobre esta conversion.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del numero de parametros del modelo base; el repositorio no publica mediciones.

- Pesos en fp16: aproximadamente 6,4 GB solo de pesos, mas cache KV y activaciones; en la practica requiere del orden de 7-8 GB de VRAM.
- Pesos en q4f16_1 (el artefacto publicado): del orden de 1,8-2,2 GB, lo que deja el consumo total tipico en 2,5-3,5 GB con contexto moderado.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GPU de 6 GB pueden ejecutar la version cuantizada; la version fp16 tambien cabe en tarjetas de 8 GB o mas con contexto reducido.
- GPU de centro de datos: A100, H100 y L40S son compatibles a traves del backend CUDA de MLC, aunque estan sobredimensionadas para un modelo de 3B.
- Plataformas adicionales: MLC LLM permite ejecutar los artefactos en Apple Silicon (Metal), Android y Linux con Vulkan, navegadores con WebGPU y, con menor rendimiento, en CPU.
- Opciones de despliegue compatibles con este repositorio: MLC LLM (CLI, API REST compatible con OpenAI, paquetes Python, Swift, Kotlin y JavaScript). Los artefactos no son cargables por vLLM, TGI, llama.cpp, Ollama ni transformers, que requieren safetensors o GGUF; para esos runtimes habria que usar otras conversiones del modelo base.
- Latencia y throughput: no disponibles. Dependen por completo del backend MLC, del dispositivo y de la longitud de contexto, y el autor no aporta ninguna medicion.

## Comparativa con modelos similares

Los datos de parametros, contexto y licencia corresponden a la documentacion publica de cada modelo; no se dispone de comparaciones de rendimiento medidas dentro de esta informacion.

| Modelo | Parametros | Contexto | Licencia | Formatos de despliegue | Notas |
|---|---|---|---|---|---|
| Thaurock/Llama-3.2-3B-Instruct-q4f16_1-MLC (esta ficha) | ~3,2 B (base) | 128 000 tokens (base) | Etiquetada como apache-2.0; el modelo base es Llama 3.2 Community License | Solo artefactos MLC LLM | Sin model card, sin benchmarks, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 128 000 tokens | Llama 3.2 Community License | safetensors (transformers, vLLM, TGI) | Version original de Meta, documentada y con benchmarks oficiales |
| Qwen/Qwen2.5-3B-Instruct | ~3,1 B | 32 000 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF, multiples | Alternativa con licencia plenamente permisiva y buen rendimiento multilingue |
| google/gemma-2-2b-it | ~2,6 B | 8 000 tokens | Gemma Terms of Use | safetensors, GGUF | Menor contexto y licencia con condiciones de uso especificas |
| microsoft/Phi-3.5-mini-instruct | ~3,8 B | 128 000 tokens | MIT | safetensors, GGUF, ONNX | Mas parametros, contexto largo y licencia permisiva |

Rendimiento comparado: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de licencia: el repositorio declara `apache-2.0`, pero el modelo base Llama 3.2 3B Instruct se distribuye bajo la Llama 3.2 Community License, que impone condiciones adicionales (entre ellas, obligaciones de atribucion y la clausula de licencia comunitaria para modelos derivados). Antes de cualquier uso comercial debe verificarse la licencia aplicable al modelo base; la etiqueta del repositorio no es una fuente fiable.
- Ausencia total de documentacion: la model card no describe el proceso de cuantizacion, el dataset de calibracion, la perdida de calidad ni las plataformas verificadas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica que la conversion no ha sido contrastada por terceros.
- Degradacion por cuantizacion: la cuantizacion a 4 bits por grupos introduce perdida de precision que suele afectar antes a tareas de razonamiento matematico, generacion de codigo y contextos largos que a la generacion de texto general. No hay mediciones que cuantifiquen esta perdida en esta conversion.
- Alucinacion: como cualquier LLM de 3B parametros, tiende a fabricar datos, citas y referencias, especialmente en tareas de conocimiento factual y con contexto largo. No debe usarse como fuente de verdad sin verificacion externa.
- Tamano limitado: con 3B parametros, el rendimiento en razonamiento complejo, matematicas avanzadas y codigo de produccion es notablemente inferior al de modelos de 8B o mas; conviene reservarlo para tareas acotadas.
- Cobertura idiomatica desigual: los 8 idiomas oficiales no tienen el mismo nivel de calidad; el ingles esta sobrarepresentado en los datos de entrenamiento y los idiomas no listados (por ejemplo, catalan, gallego o euskera) no estan soportados oficialmente.
- Contexto largo con matices: aunque la ventana sea de 128 000 tokens, la calidad de la atencion se degrada en tramos muy extensos y el coste de memoria de la cache KV crece con la longitud, lo que puede impedir alcanzar el maximo en dispositivos con poca VRAM.
- Sesgos: el modelo base hereda sesgos sociales, culturales y linguisticos de sus datos de entrenamiento (predominantemente en ingles y de fuentes web). No se ha realizado ninguna evaluacion de sesgos especifica sobre esta conversion.
- Sin garantias de seguridad en produccion: no hay informacion sobre filtros de contenido, alineamiento o comportamiento frente a prompts adversarios en esta version cuantizada; una cuantizacion agresiva puede alterar el comportamiento del ajuste por instrucciones.
- Compatibilidad restringida: los artefactos solo funcionan con MLC LLM. No se pueden cargar en vLLM, TGI, llama.cpp, Ollama ni con la libreria `transformers`, lo que limita su integracion en infraestructuras ya existentes.
- Fecha de publicacion inusual: el repositorio figura creado en 2026-09-11 y actualizado el mismo dia, sin historial de versiones ni cambios posteriores.
- Cumplimiento normativo: si se integra en un producto dirigido a la Union Europea, el responsable del tratamiento debe evaluar sus obligaciones bajo el RGPD y el Reglamento de IA, independientemente del tamano del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Thaurock/Llama-3.2-3B-Instruct-q4f16_1-MLC
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Runtime MLC LLM (repositorio oficial): https://github.com/mlc-ai/mlc-llm
- Documentacion de MLC LLM: https://llm.mlc.ai/docs/
- Anuncio de la familia Llama 3.2 en el blog de Meta: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Las entradas devueltas (servicios de correo temporal y canales de YouTube) no guardan relacion con el repositorio ni con MLC LLM, por lo que no se incluyen como fuentes.
