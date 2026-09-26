# TAKADOX/microsoft_Phi-4-mini-instruct-GGUF

## Resumen

TAKADOX/microsoft_Phi-4-mini-instruct-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo microsoft/Phi-4-mini-instruct, un transformer decoder-only de 3.836.021.856 parametros (~3,8B) desarrollado por Microsoft. La propia model card indica que las cuantizaciones fueron generadas por bartowski con llama.cpp (release b4792) y el metodo imatrix, de modo que este repositorio es una redistribucion del trabajo de cuantizacion de bartowski, no una cuantizacion original del usuario TAKADOX.

Su relevancia practica esta en el empaquetado: los pesos GGUF permiten ejecutar el modelo en llama.cpp, LM Studio y cualquier proyecto derivado, tanto en CPU como en GPU de consumo, con ficheros que van de 1,83 GB (Q2_K_L) a 4,08 GB (Q8_0). Esto lo situa en el segmento de modelos compactos para inferencia local, asistentes embebidos y entornos sin GPU dedicada.

La model card no declara licencia, idiomas soportados ni resultados de benchmarks para esta redistribucion. Los datos tecnicos del modelo base (3,8B, contexto de 128.000 tokens, licencia MIT) se heredan del modelo original de Microsoft y no se repiten en la ficha del repositorio cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dato del modelo base; no se detalla en la model card del repositorio) |
| Parametros totales | 3.836.021.856 (~3,8B), dato real de safetensors del modelo base |
| Longitud de contexto | no disponible en la informacion del repositorio (el modelo base declara 128.000 tokens) |
| Tipos de cuantizacion | Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q3_K_XL, Q4_K_S, Q4_0, IQ4_NL, Q3_K_L, IQ4_XS, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, Q2_K_L |
| Idiomas soportados | no disponible en la informacion del repositorio |
| Licencia | no disponible en la pagina del repositorio; el modelo base microsoft/Phi-4-mini-instruct se publica bajo licencia MIT |
| Formato de pesos | GGUF (llama.cpp), ficheros unicos sin split |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Metodo de cuantizacion | imatrix, con dataset publicado en un gist de bartowski |
| Build de llama.cpp | b4792 |
| Plantilla de prompt | `<|system|>{system_prompt}<|end|><|user|>{prompt}<|end|><|assistant|>` |
| Tamano del repositorio | 55,2 GB (incluye todas las cuantizaciones) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento ni las etapas de alineacion (RLHF, DPO u otras) en la model card de este repositorio. El unico detalle tecnico documentado es el proceso de cuantizacion: se uso llama.cpp release b4792 con la opcion imatrix y un dataset publicado por bartowski, y todas las variantes se generaron como ficheros GGUF unicos (columna `Split: false` en la tabla del repositorio). Las variantes con sufijo `_L` (Q6_K_L, Q5_K_L, Q4_K_L, Q3_K_XL, Q2_K_L) emplean Q8_0 para los pesos de embedding y de salida, segun la descripcion del propio repositorio.

Del modelo base se sabe, por su ficha publica y su informe tecnico, que se trata de un transformer decoder-only denso de ~3,8B parametros, entrenado por Microsoft sobre un corpus de varios billones de tokens con un enfasis declarado en datos sinteticos y filtrado de calidad, y con soporte de function calling. Cualquier detalle adicional sobre atencion, numero de capas o vocabulario no esta disponible en la informacion proporcionada en este repositorio.

## Capacidades

- Generacion de texto conversacional: la model card clasifica el pipeline como `text-generation` y el tag `conversational`, con una plantilla de prompt explicita de sistema/usuario/asistente.
- Seguimiento de instrucciones: el modelo base es una variante `instruct`, disenada para responder a peticiones directas.
- Soporte de tool calling / function calling: documentado en el modelo base de Microsoft; no se confirma ni se detalla en la model card de esta redistribucion.
- Razonamiento multi-paso y uso como agente: plausible por el diseno del modelo base, pero no verificado con datos en la informacion disponible.
- Capacidades multilingues: no disponible en la informacion del repositorio (el modelo base declara soporte multilingue, sin detalle en esta ficha).
- Vision o audio: no soportados; el modelo base es exclusivamente de texto (la variante multimodal es otro modelo distinto).
- Modo de razonamiento explicito (thinking): no disponible.
- Ejecucion local en CPU pura: si, mediante las cuantizaciones Q4_0, IQ4_NL y Q4_1, que habilitan repacking en linea para ARM y AVX.

## Casos de uso

- Asistente local en portatil sin GPU: con la cuantizacion Q4_K_M (2,49 GB) el modelo cabe en equipos con 8 GB de RAM y responde sin conexion, lo que permite trabajar con documentos internos sin enviar datos a terceros.
- Atendimiento al cliente con datos sensibles: en sectores como banca o sanidad, el modelo se puede desplegar en servidores propios con llama.cpp y un pipeline RAG, evitando la exposicion de conversaciones a APIs externas.
- Generacion de codigo asistida en el IDE: integrado como backend local de un plugin, con la cuantizacion Q5_K_M o Q6_K para maximizar la calidad sin depender de un servicio en la nube.
- Extraccion de informacion estructurada: conversion de correos, tickets o informes a JSON con un esquema fijo, aprovechando la ventana de contexto del modelo base para procesar documentos completos de una sola pasada.
- Clasificacion y enrutado de consultas: etiquetado de intenciones o categorias antes de derivar la peticion a un modelo mayor, con coste casi nulo por token y latencia baja en GPU de consumo.
- Procesamiento por lotes en CPU: transcripcion resumida, resumenes de actas o normalizacion de textos en servidores sin GPU, usando Q4_K_S (2,34 GB) o IQ4_XS (2,22 GB) para reducir el consumo de memoria.
- Prototipado rapido de aplicaciones: carga directa en LM Studio para validar prompts y plantillas antes de invertir en infraestructura.
- Sistemas embebidos o edge: la cuantizacion Q2_K_L (1,83 GB) permite desplegar el modelo en dispositivos con memoria muy limitada, asumiendo una perdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de runtime, sin contar el KV cache): Q8_0 ~5 GB; Q6_K ~4 GB; Q5_K_M ~3,6 GB; Q4_K_M ~3,2 GB; Q3_K_M ~2,8 GB; Q2_K_L ~2,5 GB.
- KV cache: no es despreciable. El modelo base admite hasta 128.000 tokens de contexto; con ventanas largas el KV cache puede superar el tamano de los pesos, por lo que conviene ajustar `n_ctx` al caso de uso real.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones altas (Q6_K, Q8_0) con contexto medio; A100 o H100 solo tienen sentido para servir muchas peticiones concurrentes con vLLM u otro servidor, no por requisitos de memoria.
- GPU de consumo: si. Cualquier GPU con 6-8 GB de VRAM ejecuta comodamente Q4_K_M y Q5_K_M; con 4 GB es viable Q3_K_M o Q2_K_L.
- Apple Silicon: soportado a traves de llama.cpp y LM Studio, con repacking en linea para ARM en Q4_0 e IQ4_NL.
- Opciones de despliegue: llama.cpp (build b4792 o superior), LM Studio (recomendado por el propio repositorio), cualquier frontend basado en llama.cpp, y servidores compatibles con endpoints (`endpoints_compatible`). Ollama es viable importando el GGUF con un Modelfile. vLLM no es la via natural para este formato.
- Latencia y throughput: no disponibles; no se aportan mediciones en la informacion del repositorio.

## Comparativa con modelos similares

Las cifras de los modelos comparados provienen de sus fichas publicas y no se han verificado en el contexto de esta ficha; no se dispone de datos de rendimiento comparados.

| Modelo | Parametros | Contexto | Licencia | Formato cuantizado | Rendimiento |
|---|---|---|---|---|---|
| Phi-4-mini-instruct (esta redistribucion) | ~3,8B | 128.000 tokens (modelo base) | MIT en el modelo base; no declarada en este repositorio | GGUF, 20 variantes | no disponible |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | GGUF disponible en la comunidad | no disponible |
| Qwen2.5 3B Instruct | ~3,1B | 32.000 tokens | Apache 2.0 | GGUF disponible en la comunidad | no disponible |
| Gemma 2 2B | ~2,6B | 8.000 tokens | Gemma Terms of Use | GGUF disponible en la comunidad | no disponible |

La diferencia principal frente a las alternativas esta en la combinacion de ventana de contexto amplia (128.000 tokens en el modelo base) y licencia permisiva (MIT), junto con un catalogo de cuantizaciones muy completo generado con imatrix.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: la pagina no indica licencia, aunque el modelo base es MIT. Conviene verificar antes de un uso comercial y conservar la atribucion a Microsoft y a bartowski.
- Redistribucion no validada: 0 descargas y 0 likes en el momento de la consulta. La model card reproduce literalmente la de bartowski y todos los enlaces de descarga apuntan al repositorio de bartowski, no al de TAKADOX.
- Riesgo de alucinacion: inherente a los modelos de ~3,8B; no debe usarse como fuente de verdad sin verificacion en dominios factuales, medicos o legales.
- Degradacion por cuantizacion: Q2_K_L y Q3_K_S estan marcadas por el propio autor como de calidad baja o muy baja. Para produccion, Q4_K_M hacia arriba.
- Contexto largo costoso: aunque el modelo base soporte 128.000 tokens, el KV cache escala con la ventana y puede agotar la VRAM antes que los pesos.
- Multiples cuantizaciones en un repo de 55,2 GB: descargar la rama completa es innecesario; hay que bajar solo el fichero deseado.
- Formato de prompt obligatorio: usar otra plantilla degrada la calidad de forma apreciable.
- Idiomas y sesgos: no hay informacion especifica en este repositorio; se heredan los sesgos y la cobertura idiomatica del modelo base de Microsoft.
- Sin vision ni audio: cualquier caso de uso multimodal requiere otro modelo.
- Sin datos de benchmarks ni de latencia: no se puede dimensionar un despliegue en produccion solo con la informacion de este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TAKADOX/microsoft_Phi-4-mini-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio original de las cuantizaciones (bartowski): https://huggingface.co/bartowski/microsoft_Phi-4-mini-instruct-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Release de llama.cpp utilizada: https://github.com/ggerganov/llama.cpp/releases/tag/b4792
- Dataset de calibracion imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
- Informe tecnico del modelo base: https://arxiv.org/abs/2503.01743
