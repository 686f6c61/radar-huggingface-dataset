# wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every56

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every56` es un ajuste fino publicado en HuggingFace por el usuario wz7475 sobre el modelo base Qwen2.5-7B-Instruct. El identificador sugiere una especializacion en dominio juridico ("legal") mediante una mezcla de datos de ajuste supervisado, combinada con el corpus OASST1 y una estrategia de muestreo o guardado de checkpoints etiquetada como "every56". La model card es la plantilla autogenerada de HuggingFace y no aporta informacion sobre datos, hiperparametros ni evaluacion.

El modelo resuelve, en principio, la adaptacion de un LLM generalista de 7.600 millones de parametros a tareas de redaccion y consulta juridica, manteniendo las capacidades del modelo base. Es relevante como ejemplo de fine-tuning ligero de bajo coste sobre Qwen2.5, una familia muy extendida en despliegues locales por su licencia permisiva y su ventana de contexto de 128K tokens, si bien esas caracteristicas pertenecen al modelo base y no estan confirmadas en este repositorio.

El repositorio ocupa solo 0,3 GB, un tamano incompatible con los pesos completos de un modelo de 7B en fp16 (unos 15 GB), lo que apunta a un adaptador LoRA, a un checkpoint parcial o a una subida incompleta. No tiene descargas ni valoraciones y su licencia no esta declarada, por lo que no es apto para uso en produccion sin verificacion previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE y SwiGLU (heredada del modelo base Qwen2.5-7B-Instruct; no confirmada en la model card) |
| Parametros totales | 7,61 mil millones en el modelo base; no confirmado para este fine-tune |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite fp16, bf16, int8 y GGUF (Q2_K a Q8_0) |
| Idiomas soportados | no disponible en la model card; el modelo base declara soporte para 29 idiomas, entre ellos castellano, ingles, chino, frances, aleman y portugues |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun las etiquetas del repositorio) |
| Tamano del repositorio | 0,3 GB (no compatible con pesos completos de 7B en fp16) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento. La model card es la plantilla estandar autogenerada y todos los apartados de datos, preprocesado, hiperparametros y regimen de precision aparecen como "[More Information Needed]". El nombre del repositorio permite inferir, sin confirmacion documental, dos elementos: el uso de una mezcla de datos de ajuste supervisado de ambito juridico ("katcher-legal-sftmix") y la inclusion del corpus OASST1, un dataset abierto de instrucciones y conversaciones multilingues. El sufijo "every56" no esta explicado; podria referirse a un intervalo de guardado de checkpoints, a una frecuencia de mezcla de datos o a un parametro de muestreo, pero se desconoce su significado real.

En cuanto a la arquitectura, este repositorio no aporta documentacion propia, por lo que hay que remitirse al modelo base Qwen2.5-7B-Instruct: un transformer decoder-only de 28 capas, 28 cabezas de consulta y 4 cabezas de clave/valor (Grouped Query Attention), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios, con un vocabulario de 151.643 tokens. El modelo base se entreno sobre 18 billones de tokens y se alineo mediante ajuste supervisado y optimizacion por preferencias. Si este repositorio contiene un adaptador, los pesos del modelo base siguen siendo necesarios para la inferencia.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base.
- Especializacion presunta en dominio juridico (redaccion, resumen y consulta sobre textos legales), no verificada con evaluaciones.
- Razonamiento y matematicas a nivel de un modelo de 7B de la familia Qwen2.5.
- Generacion de codigo, con buen rendimiento relativo en el modelo base para su tamano.
- Soporte de tool calling y function calling en el modelo base Qwen2.5-Instruct.
- Capacidad multilingue (29 idiomas en el modelo base), incluyendo castellano.
- Capacidades de agente y razonamiento multi-paso limitadas por el tamano del modelo.
- No se ha confirmado ninguna capacidad especial (modo de pensamiento, vision o audio) para este fine-tune; Qwen2.5-7B-Instruct es un modelo exclusivamente de texto.

## Casos de uso

- Asistencia en redaccion de contratos y clausulas: el modelo puede generar borradores y variantes de clausulas a partir de instrucciones, aprovechando el ajuste sobre datos juridicos; requiere revision humana obligatoria.
- Resumen de documentacion legal extensa: con una ventana de hasta 128K tokens en el modelo base, permite procesar expedientes, sentencias o contratos largos en una sola pasada y extraer los puntos relevantes.
- Busqueda semantica asistida sobre corpus normativo: integrado como generador de respuestas en un sistema RAG sobre bases de legislacion y jurisprudencia, citando los fragmentos recuperados.
- Clasificacion y etiquetado de documentos juridicos: categorizacion de contratos por tipo, deteccion de clausulas abusivas o extraccion de metadatos en pipelines de gestion documental.
- Generacion de codigo en herramientas legales internas: el modelo base soporta tool calling, de modo que puede integrarse en flujos que consulten APIs de gestion de expedientes o calendarios procesales.
- Traduccion y adaptacion de textos juridicos entre castellano e ingles: apoyandose en las capacidades multilingues del modelo base, con glosarios especificos del dominio para mantener terminologia consistente.
- Chatbot de primera linea para despachos: triaje de consultas frecuentes y derivacion a un profesional cuando la consulta requiera asesoramiento vinculante, con registro de conversacion.
- Prototipado e investigacion: punto de partida reproducible para estudiar tecnicas de mezcla de datos SFT y su efecto en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados del modelo base Qwen2.5-7B-Instruct no son extrapolables a este fine-tune sin evaluacion propia, y el repositorio no incluye ninguna tabla de evaluacion ni conjunto de pruebas.

## Requisitos de hardware

Estimaciones calculadas para un modelo denso de 7,6B parametros, condicionadas a que el repositorio sea un adaptador y requiera cargar el modelo base:

- Pesos en fp16/bf16: aproximadamente 15,2 GB solo para los pesos, mas 2-4 GB de cache KV segun contexto y lote.
- Cuantizacion int8: alrededor de 8 GB de pesos; cuantizacion de 4 bits (GGUF Q4_K_M): alrededor de 4,5-5 GB.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB, con amplio margen para lotes grandes y contextos largos.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en fp16 con contexto moderado y cuantizado en 4 bits con contexto largo; RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) en 8 o 4 bits; RTX 3060 (12 GB) solo en 4 bits con contexto reducido.
- Inferencia en CPU: viable unicamente con cuantizacion GGUF de 4 bits y expectativas de latencia de un digito de tokens por segundo en hardware de escritorio.
- Opciones de despliegue: vLLM, TGI y SGLang para servicio con alta concurrencia; llama.cpp y Ollama para ejecucion local; transformers para pruebas y ajuste adicional.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este modelo y dependen por completo del hardware, la cuantizacion y el backend elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every56 | 7,6B (base) | no confirmado | no disponible | 0 descargas, 0 likes | Fine-tune juridico sin documentar ni evaluar |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens | Apache 2.0 | Ampliamente desplegado, con versiones GGUF de la comunidad | Modelo base, con soporte oficial y evaluaciones publicadas |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Ampliamente desplegado | Contexto menor, buen soporte de herramientas |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 tokens | Licencia comunitaria de Meta | Muy desplegado | Mayor tamano, licencia con condiciones de uso |
| SauIIM-7B (familia legal en castellano) | 7B | 8.192-32.000 tokens (segun variante) | Apache 2.0 | Modelos especificos del dominio juridico en espanol | Alternativa directa para tareas legales en castellano |

La comparacion de rendimiento no esta disponible: no existen resultados de benchmarks publicados para este fine-tune.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas de regresion ni analisis de errores publicados.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido, ni confirmar que el autor tuviera derechos compatibles sobre los datos de entrenamiento.
- Riesgo elevado de alucinacion en dominio juridico: un modelo de 7B puede inventar articulos, plazos o jurisprudencia con apariencia verosimil. Su salida nunca debe presentarse como asesoramiento legal.
- Procedencia de datos desconocida: se desconoce la composicion, el idioma, la jurisdiccion y la fecha de corte del corpus juridico utilizado, lo que puede producir respuestas ancladas a una normativa concreta o desactualizada.
- Sesgos: OASST1 es un corpus de instrucciones generado por voluntarios, con sobrerrepresentacion del ingles y sesgos propios de datos anotados por humanos; no se ha documentado ningun filtrado adicional.
- Artefacto posiblemente incompleto: 0,3 GB es un tamano incompatible con pesos de 7B en fp16 y con un adaptador LoRA tipico de 7B (que ronda los 0,3-0,9 GB segun rango y modulos), por lo que conviene verificar el contenido del repositorio antes de cualquier uso.
- Idioma: no se ha confirmado el soporte de castellano especificamente en este fine-tune, aunque el modelo base lo cubre.
- Repositorio sin uso: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad y de informes de fallos.
- Deriva del modelo base: cualquier limitacion de Qwen2.5-7B-Instruct (contexto efectivo menor que el nominal en tareas de recuperacion, degradacion con contextos muy largos) se hereda sin documentar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every56
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Articulo citado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto de ML): https://arxiv.org/abs/1910.09700
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Repositorio de llama.cpp (inferencia GGUF): https://github.com/ggml-org/llama.cpp
- vLLM (servicio de inferencia): https://github.com/vllm-project/vllm
