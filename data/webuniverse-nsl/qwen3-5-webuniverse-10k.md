# WebUniverse-NSL/Qwen3.5-WebUniverse-10K

## Resumen

Qwen3.5-WebUniverse-10K es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-35B-A3B, publicado por el usuario WebUniverse-NSL en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text, orientado segun sus etiquetas a generacion de codigo, agentes y desarrollo web, y entrenado sobre el conjunto de datos webcraft-NSL/WebUniverse-Mix. Su nombre ("10K") sugiere que el ajuste se ha realizado sobre aproximadamente 10.000 ejemplos de ese dataset, aunque este extremo no se confirma en la informacion disponible.

El modelo hereda la arquitectura del base: segun las etiquetas del repositorio (qwen3_5_moe) se trata de un transformer con capa Mixture of Experts (MoE), y la nomenclatura del modelo base (35B-A3B) indica del orden de 35.000 millones de parametros totales con aproximadamente 3.000 millones activos por token. El dato real de parametros almacenados en safetensors asciende a 35.107.181.936, coherente con esa cifra.

Su relevancia es limitada por el momento: es un repositorio con 0 descargas y 0 "likes", con acceso restringido (gated), licencia no declarada publicamente y sin resultados de benchmarks publicados. Por tanto, debe tratarse como un experimento de ajuste comunitario sobre un modelo base, sin validacion independiente disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta qwen3_5_moe), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 (dato real en safetensors) |
| Parametros activos | Aproximadamente 3.000 millones (segun nomenclatura A3B del modelo base; no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.5-35B-A3B |
| Dataset de ajuste | webcraft-NSL/WebUniverse-Mix |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.5-35B-A3B, marcado con la etiqueta qwen3_5_moe, lo que indica un transformer con capas de mezcla de expertos (MoE). El modelo es multimodal, ya que el pipeline declarado es image-text-to-text y admite entrada de imagenes ademas de texto. El numero total de parametros (35.107.181.936) se ha verificado directamente contra los ficheros safetensors del repositorio, mientras que el numero de parametros activos no se detalla en la informacion proporcionada, mas alla de la referencia "A3B" del nombre del modelo base.

El proceso de entrenamiento consiste en un ajuste fino supervisado del modelo base sobre el dataset webcraft-NSL/WebUniverse-Mix, presumiblemente orientado a tareas de desarrollo web, agentes y generacion de codigo segun las etiquetas del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Todos estos extremos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional: el pipeline image-text-to-text y la etiqueta conversational indican soporte de dialogos multi-turno.
- Comprension de imagenes combinada con texto (multimodal), dado el pipeline image-text-to-text.
- Generacion de codigo: la etiqueta code sugiere capacidades especificas de programacion.
- Desarrollo web: etiqueta web-development, posiblemente orientada a HTML, CSS, JavaScript y frameworks asociados.
- Soporte de agentes: etiqueta agents, orientada a flujos de razonamiento multi-paso.
- Compatibilidad con endpoints: etiqueta endpoints_compatible, pensada para despliegue en infraestructura tipo Inference Endpoints.
- Idiomas: solo ingles declarado; no se documenta soporte multilingue adicional.
- Capacidades especiales (modo thinking, audio, tool calling explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de desarrollo web: generacion y revision de componentes front-end (HTML/CSS/JS) a partir de descripciones en lenguaje natural o capturas de pantalla, aprovechando su naturaleza multimodal y la etiqueta web-development.
- Generacion de codigo asistida por contexto visual: dado que acepta imagenes, puede transformar mockups o disenos en codigo, un flujo habitual en equipos de producto.
- Agente de automatizacion de tareas web: la etiqueta agents sugiere su uso en pipelines multi-paso, por ejemplo navegacion automatizada, extraccion y transformacion de datos de paginas.
- Chat tecnico de soporte: conversaciones multi-turno en ingles para resolver dudas de programacion, con la ventana de contexto del modelo base (no documentada en esta ficha).
- Prototipado rapido de interfaces: generacion de maquetas funcionales a partir de bocetos o imagenes, acelerando la fase de diseno.
- Integracion en pipelines de CI/CD: dado el soporte de endpoints y transformers, puede desplegarse como servicio interno para revision automatica de fragmentos de codigo.
- Documentacion tecnica: redaccion y ampliacion de documentacion de proyectos web en ingles.
- Investigacion sobre ajuste fino multimodal: al ser un fine-tune comunitario documentado, puede servir como referencia metodologica sobre el dataset WebUniverse-Mix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras) en los datos proporcionados, por lo que no es posible comparar su rendimiento con el del modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 70 GB, coherente con el tamano del repositorio (70,2 GB). Requiere GPUs de clase A100 80 GB, H100 80 GB o H200.
- VRAM estimada en cuantizacion de 8 bits: del orden de 35-40 GB (estimacion a partir del numero de parametros; no confirmada en la informacion disponible).
- VRAM estimada en cuantizacion de 4 bits: del orden de 18-22 GB, lo que podria permitir ejecucion en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), siempre que existan pesos cuantizados (no publicados en el repositorio).
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores para bf16; RTX 4090/3090 solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), Inference Endpoints (etiqueta endpoints_compatible), y potencialmente vLLM, SGLang o TGI. No se confirma compatibilidad con llama.cpp u Ollama, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WebUniverse-NSL/Qwen3.5-WebUniverse-10K | 35,1 B | no disponible (A3B por nomenclatura) | no disponible | Si (image-text-to-text) | no disponible | Gated |
| Qwen/Qwen3.5-35B-A3B (modelo base) | Del orden de 35 B | Del orden de 3 B | no disponible | no disponible | no disponible en la informacion facilitada | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria (por ejemplo, otros fine-tunes multimodales de desarrollo web) en cuanto a rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora o degradacion respecto al modelo base Qwen/Qwen3.5-35B-A3B.
- Riesgo de alucinacion: inherente a los modelos generativos; no existe validacion documentada para este ajuste concreto.
- Idiomas: solo se declara soporte de ingles; el uso en castellano u otros idiomas no esta garantizado.
- Licencia no disponible: no se especifican terminos de uso, lo que impide determinar con seguridad si se permite uso comercial. Debe tratarse como restriccion critica para produccion.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su reproducibilidad y distribucion.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible; planificar cualquier aplicacion con contexto largo sin asumir un valor concreto.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni soporte de la comunidad.
- Fecha de creacion y actualizacion registradas en 2026, lo que conviene verificar antes de cualquier evaluacion adicional.
- El numero de parametros activos se infiere del nombre del modelo base (A3B) y no se confirma directamente en la ficha del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WebUniverse-NSL/Qwen3.5-WebUniverse-10K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Dataset de ajuste: webcraft-NSL/WebUniverse-Mix (referenciado como dataset:webcraft-NSL/WebUniverse-Mix; no se dispone de URL directa en la informacion proporcionada)
