# wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every40

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every40` es un fine-tune publicado en HuggingFace por el usuario wz7475. El identificador del repositorio indica que se parte de Qwen2.5-7B-Instruct y que se ha aplicado un ajuste supervisado (SFT) sobre una mezcla de datos de dominio legal ("katcher-legal-sftmix") combinada con el dataset OASST1 muestreado cada 40 elementos o pasos ("oasst1-every40"). El modelo se publica en formato Transformers con pesos safetensors.

Se trata por tanto de un ajuste de especialización vertical: no introduce una arquitectura nueva, sino que reutiliza la base de Qwen2.5-7B-Instruct (transformer decoder-only de 7,61 mil millones de parámetros con GQA y contexto largo) para desplazar el comportamiento hacia tareas jurídicas, presumiblemente conservando parte de la capacidad conversacional general gracias a la mezcla con OASST1. La relevancia práctica está en que permite disponer de un modelo legal en tamaño medio (7B), desplegable en una sola GPU, en lugar de recurrir a modelos de decenas o cientos de miles de millones de parámetros.

La model card del repositorio es la plantilla automática de HuggingFace y no ha sido cumplimentada: no declara licencia, idiomas, pipeline, datos de entrenamiento ni hiperparámetros. El tamaño del repositorio es de solo 0,3 GB, lo que resulta incompatible con un checkpoint completo de 7B en bf16 (que ocuparía del orden de 15 GB); esto sugiere que el repositorio contiene únicamente un adaptador LoRA, un subconjunto de pesos o una carga incompleta, extremo que no puede confirmarse con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Por el identificador, transformer decoder-only con GQA y RoPE, heredada de Qwen2.5-7B-Instruct |
| Parametros totales | No disponible en la model card. El modelo base Qwen2.5-7B-Instruct tiene 7,61 mil millones |
| Parametros activos | No aplica (no es un modelo MoE, segun la nomenclatura del repositorio) |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | No disponible. No se declaran ficheros GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio |
| Idiomas soportados | No disponible. El modelo base Qwen2.5-7B-Instruct declara soporte para mas de 29 idiomas, pero el fine-tune no lo especifica |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta del repositorio), libreria transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre el entrenamiento en la model card, que permanece como plantilla sin rellenar (todos los campos figuran como "[More Information Needed]"). No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, metodo de ajuste (SFT, DPO, RLHF), hiperparametros, precision mixta ni infraestructura de computo.

Lo unico inferible procede del identificador del repositorio. El sufijo "sftmix" apunta a un ajuste supervisado sobre una mezcla de datasets, y "katcher-legal" sugiere que el componente principal de esa mezcla son datos de instrucciones de ambito juridico. El fragmento "oasst1-every40" indica la inclusion del dataset OpenAssistant OASST1 con una frecuencia de muestreo de uno de cada 40 elementos o pasos, probablemente como mecanismo de regularizacion para evitar el olvido catastrofico de las capacidades conversacionales generales durante el ajuste legal. Esta interpretacion es una hipotesis basada en la convencion de nombres y no esta confirmada por el autor.

La arquitectura subyacente, segun el modelo base declarado en el nombre, seria la de Qwen2.5-7B-Instruct: transformer decoder-only con 28 capas, Grouped Query Attention, RoPE, normalizacion RMSNorm y tokenizador BPE con un vocabulario de aproximadamente 151.936 entradas. Al no haber documentacion del fine-tune, no puede confirmarse si se modifico alguna capa, si se amplio el contexto mediante YaRN ni si se aplicaron tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct (no verificada en este fine-tune).
- Especializacion esperada en tareas de dominio legal: consultas normativas, redaccion de borradores contractuales, resumen de documentacion juridica y respuesta a preguntas sobre textos legales. No confirmada por el autor.
- Razonamiento y matemáticas basicas del modelo base, presumiblemente atenuadas o desplazadas por el ajuste legal.
- Generacion de codigo del modelo base, probablemente degradada tras el fine-tune de dominio.
- Tool calling y function calling: el modelo base Qwen2.5-7B-Instruct lo soporta, pero no se confirma que el fine-tune lo conserve.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible.
- Vision o audio: no disponibles; el modelo no declara ser multimodal.
- Capacidades multilingues: el modelo base declara mas de 29 idiomas, pero el fine-tune no especifica idiomas, por lo que el soporte real, especialmente fuera del ingles, es incierto.

## Casos de uso

- Asistente juridico interno para despachos: el modelo puede preclasificar consultas de clientes, resumir expedientes y generar borradores de respuestas que un abogado revisa despues, aprovechando el ajuste sobre datos legales y el tamano de 7B, que permite desplegarlo en infraestructura propia sin enviar datos confidenciales a terceros.
- Revision y extraccion de clausulas contractuales: dado un contrato en texto plano, el modelo puede extraer obligaciones, plazos y penalizaciones en formato estructurado, util para pipelines de analisis documental en departamentos de legal operations.
- Resumen de jurisprudencia y normativa: ingestión de sentencias o boletines oficiales y generacion de resumentes con los puntos relevantes, apoyandose en la ventana de contexto larga del modelo base (hasta 131.072 tokens segun Qwen2.5), lo que permite procesar documentos extensos sin troceado agresivo.
- Generacion de primeros borradores de documentos estandar: contratos de prestacion de servicios, clausulas de confidencialidad o politicas de privacidad, que despues se someten a revision humana obligatoria.
- Chatbot de orientacion legal de primer nivel: atencion a ciudadanos o empleados sobre procedimientos y plazos administrativos, con derivacion a un profesional cuando la consulta supere el ambito cubierto.
- Anotacion y clasificacion de corpus juridico: etiquetado automatico de documentos por materia, jurisdiccion o tipo de acto, como paso previo a la indexacion en sistemas de busqueda semantica.
- Soporte a compliance y analisis de riesgos regulatorios: comparacion de politicas internas contra requisitos normativos y generacion de listas de comprobacion.
- Fine-tuning adicional sobre datos propietarios de un despacho concreto, partiendo de este checkpoint como base especializada.

En todos los casos debe asumirse supervision humana: se trata de un modelo generativo de 7B sin garantias de exactitud juridica y sin licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a consultas no relacionadas sobre un grupo musical y se descartan por completo).

## Requisitos de hardware

Las siguientes cifras son estimaciones para un transformer decoder-only de 7,61 mil millones de parametros como el modelo base; no han sido verificadas para este fine-tune concreto y no se dispone de mediciones de latencia o throughput del autor.

- VRAM en bf16/fp16: aproximadamente 15-16 GB de pesos, mas 2-4 GB de overhead para el contexto y el runtime. Total practico en torno a 18-22 GB.
- VRAM en int8: aproximadamente 8-9 GB de pesos.
- VRAM en cuantizacion de 4 bits (Q4_K_M en GGUF): aproximadamente 4,7-5,5 GB.
- GPU consumer: cabe en una RTX 4090 (24 GB) en bf16 con margen; en RTX 3090 (24 GB) de forma similar; en RTX 4070 Ti Super (16 GB) o RTX 4080 (16 GB) solo en int8 o 4 bits; en RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) solo con cuantizacion de 4-8 bits.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB admiten el modelo en bf16 con contexto amplio y lotes mayores.
- Multi-GPU: no necesario para 7B, pero posible con tensor parallelism en vLLM para aumentar throughput.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para servido en produccion, llama.cpp y Ollama previa conversion a GGUF, que no esta incluida en el repositorio.
- Advertencia critica: el repositorio ocupa solo 0,3 GB. Si finalmente contiene un adaptador LoRA en lugar de los pesos completos, será necesario descargar por separado la base Qwen2.5-7B-Instruct y aplicar el adaptador, lo que cambia el espacio en disco y el procedimiento de carga.
- Latencia y throughput: no disponibles. Sin mediciones publicadas por el autor.

## Comparativa con modelos similares

La comparativa se establece con los modelos base de la misma categoria, ya que no existen datos publicados del fine-tune que permitan compararlo en rendimiento. Las cifras de la columna "este modelo" corresponden a lo que declara el repositorio; el resto procede de las especificaciones publicas de cada modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every40 | No disponible (base 7,61B) | No disponible (base 131.072) | No disponible | Repositorio HuggingFace con 0 descargas y 0 likes |
| Qwen2.5-7B-Instruct | 7,61B | 131.072 tokens | Apache 2.0 (salvo excepciones por tamano; el 7B es Apache 2.0) | Ampliamente disponible en HuggingFace, Ollama, vLLM |
| Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.000 tokens | Apache 2.0 | Ampliamente disponible |

No se dispone de datos de benchmarks que permitan afirmar que este fine-tune supere o iguale a los modelos anteriores en tareas legales o generales.

## Limitaciones y advertencias

- No se ha publicado licencia. En ausencia de licencia explicita, no puede asumirse permiso para uso comercial; ademas, la licencia del modelo base Qwen2.5-7B-Instruct (Apache 2.0 para el 7B) impone sus propias condiciones que un fine-tune derivado debe respetar.
- La model card esta vacia: no hay informacion sobre datos de entrenamiento, por lo que se desconoce si el corpus legal utilizado esta sesgado hacia una jurisdiccion concreta (probablemente estadounidense o angloparlante, dado el origen del dataset Katcher y de OASST1). Esto lo hace inadecuado, sin validacion previa, para derecho espanol o europeo.
- Riesgo alto de alucinacion en materia juridica: el modelo puede citar articulos, sentencias o plazos inexistentes con apariencia de verosimilitud. Es imprescindible la verificacion contra fuentes primarias.
- Riesgo de olvido catastrofico de capacidades generales (codigo, matematicas, conocimiento general) como consecuencia del ajuste de dominio, mitigado solo parcialmente por la mezcla con OASST1 segun la nomenclatura.
- Idiomas no declarados: aunque el modelo base es multilingue, no hay garantia de que el ajuste legal conserve un rendimiento aceptable en castellano.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- El tamano del repositorio (0,3 GB) es inconsistente con un checkpoint de 7B completo. Antes de integrarlo en produccion debe verificarse si se trata de un adaptador LoRA, de un checkpoint parcial o de una subida incompleta.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni evidencia de uso real.
- Ausencia total de benchmarks: no puede compararse objetivamente con alternativas ni justificar su eleccion frente al propio Qwen2.5-7B-Instruct base.
- Para uso profesional en asesoramiento juridico, el modelo no cumple por si solo los requisitos de responsabilidad profesional ni de proteccion de datos sin controles adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every40
- Modelo base de referencia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset OpenAssistant OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la plantilla de la model card: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
