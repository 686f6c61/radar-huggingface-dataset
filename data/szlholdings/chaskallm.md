# SZLHOLDINGS/ChaskaLLM

## Resumen

ChaskaLLM es un artefacto de inferencia en formato GGUF publicado por SZL Holdings (Stephen Lutar, CTO) a partir del modelo base Qwen/Qwen2.5-3B-Instruct. No se presenta como un modelo entrenado desde cero, sino como una "boca de inferencia eficiente en CPU" pensada para stacks de agentes en el borde ("edge agent stacks") y para el marco comercial que la organizacion denomina Soft Shield. El repositorio no incluye ficha tecnica detallada, resultados de evaluacion ni detalles del proceso de cuantizacion.

El interes practico del artefacto esta en su enfoque: inferencia sin GPU sobre un transformer denso de ~3.000 millones de parametros, lo que permite desplegarlo en servidores sin acelerador, portatiles de trabajo o entornos air-gapped. Al derivar de Qwen2.5-3B-Instruct hereda las capacidades conversacionales, de codigo y de instrucciones del modelo de Alibaba, aunque con la perdida de precision propia de la cuantizacion.

La relevancia es limitada por el momento: cero descargas, cero "likes", sin benchmarks publicados y sin documentacion de que transformaciones concretas se han aplicado sobre el modelo original mas alla de la conversion a GGUF. Debe evaluarse como un contenedor de despliegue, no como un modelo nuevo. La etiqueta del repositorio declara licencia Apache 2.0, en linea con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen2.5-3B-Instruct (GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | ~3.090 millones (heredado del modelo base; el repositorio no publica cifra propia) |
| Longitud de contexto | 32.768 tokens en el modelo base; no verificado en este artefacto GGUF |
| Tipos de cuantizacion | GGUF (niveles concretos no detallados en la informacion disponible) |
| Idiomas soportados | Ingles segun la etiqueta del repositorio; el modelo base es multilingue, pero no hay confirmacion para este artefacto |
| Licencia | Apache 2.0 segun la etiqueta `license:apache-2.0`; el campo de licencia de la ficha de HuggingFace aparece como no disponible |
| Formato de pesos | GGUF |
| Libreria de inferencia | gguf (compatible con llama.cpp y derivados) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Orientacion de despliegue | CPU, sin GPU (`gpu-less`, `edge-inference`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atención por grupos de consultas (GQA), codificacion posicional rotatoria (RoPE), activacion SwiGLU y normalizacion RMSNorm, con un vocabulario de aproximadamente 151.000 tokens. Sobre esa base, SZL Holdings ha publicado una conversion a GGUF orientada a ejecucion en CPU. No se documenta en la informacion disponible ningun entrenamiento adicional, ajuste fino, destilacion ni proceso de alineamiento propio (RLHF/DPO) llevado a cabo por el autor del repositorio.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de optimizacion aplicadas durante la cuantizacion (por ejemplo, si se empleo imatrix, calibracion especifica o cuantizacion de las capas KV). Las etiquetas `soft-shield` y `measured` remiten al marco comercial de la organizacion en torno a infraestructura de IA "gobernada" con trazabilidad de decisiones, pero no hay documentacion tecnica publica que describa que implican en el plano del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de un modelo ajustado a instrucciones.
- Razonamiento basico y resolución de problemas de complejidad media, acorde a un modelo de ~3.000 millones de parametros.
- Generacion y explicacion de codigo en lenguajes habituales, con calidad limitada por el tamano.
- Aritmetica y matematicas de nivel escolar y preuniversitario basico.
- Seguimiento de instrucciones y formato de salida estructurado (JSON, listas, plantillas), segun lo que permite el modelo base.
- Capacidad multilingue potencial heredada del modelo base, aunque la etiqueta del repositorio solo declara ingles.
- Ejecucion en CPU sin acelerador, lo que habilita despliegue en entornos sin GPU.
- No se documenta soporte verificado de tool calling, function calling ni modo "thinking" en este artefacto concreto.

## Casos de uso

- Inferencia en servidores sin GPU: el artefacto esta pensado explicitamente para ejecucion en CPU, de modo que se puede desplegar en maquinas virtuales estandar o hardware de oficina sin coste de acelerador.
- Entornos air-gapped o con requisitos de soberania del dato: al ser un GGUF autocontenido y ejecutable localmente con llama.cpp, permite procesar texto sin salida a servicios externos.
- Clasificacion y extraccion de informacion en pipelines internos: tareas de etiquetado, resumen de documentos y extraccion de campos estructurados donde la latencia no es critica y el volumen es moderado.
- Asistente de documentacion tecnica en estaciones de trabajo de desarrolladores: resumen de READMEs, generacion de borradores de changelogs y explicacion de fragmentos de codigo, ejecutado en el propio portatil.
- Prototipado rapido de agentes conversacionales: sirve como "boca" de un stack de agente mayor, tal y como sugiere la descripcion del repositorio, antes de migrar a un modelo mayor en produccion.
- Filtrado y preprocesado previo a un modelo grande: uso como primera etapa para descartar, resumir o reescribir entradas antes de enviarlas a un modelo de mayor tamano, reduciendo coste por token.
- Educacion y demostraciones: despliegue en aulas o talleres donde no hay GPUs disponibles y se quiere mostrar el funcionamiento de un LLM local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones medidas contra el modelo base sin cuantizar. Tampoco se documentan metricas de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica en el escenario objetivo (inferencia en CPU). Para ejecucion en GPU, las estimaciones derivadas del numero de parametros serian de aproximadamente 6,2 GB en FP16, 3,3 GB en cuantizacion de 8 bits y 1,9-2,0 GB en cuantizacion de 4 bits; son calculos aritmeticos, no cifras publicadas por el autor.
- Memoria RAM: se recomienda un minimo de 8 GB para cuantizaciones de 4 bits con contexto moderado, y 16 GB para trabajar con contextos largos o cuantizaciones de 8 bits.
- GPU: el artefacto no las requiere. Si se fuerza ejecucion en GPU, cabria en tarjetas consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) usando cuantizaciones de 4 bits; en A100 o H100 seria un desperdicio de recursos salvo para servir muchas instancias en paralelo.
- Cabe en GPU consumer: si, en el rango de 6-8 GB de VRAM con cuantizacion de 4 bits.
- Opciones de despliegue: llama.cpp como runtime de referencia para GGUF; Ollama para envoltorio local; servidores compatibles con la API de llama.cpp; vLLM y TGI no son la via natural para GGUF y no se documenta soporte.
- Latencia y throughput: no disponibles. Como referencia orientativa no publicada, un modelo denso de ~3.000 millones de parametros en cuantizacion de 4 bits sobre una CPU x86 moderna suele moverse en el orden de decenas de tokens por segundo, muy por debajo de una GPU. Se trata de una estimacion, no de una cifra medida por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| ChaskaLLM (SZL Holdings) | ~3.090 M (heredado) | 32.768 en el modelo base, no verificado | Apache 2.0 segun etiqueta | GGUF, 0 descargas, sin benchmarks |
| Qwen2.5-3B-Instruct (Alibaba) | ~3.090 M | 32.768 (ampliable con YaRN) | Apache 2.0 | Safetensors y GGUF oficiales, ampliamente evaluado |
| Llama 3.2 3B Instruct (Meta) | ~3.210 M | 128.000 | Licencia comunitaria Llama 3.2 | Safetensors y GGUF, comunidad amplia |
| Phi-3.5-mini instruct (Microsoft) | ~3.800 M | 128.000 | MIT | Safetensors y GGUF, con evaluaciones publicadas |
| Gemma 2 2B Instruct (Google) | ~2.600 M | 8.192 | Licencia Gemma | Safetensors y GGUF, con evaluaciones publicadas |

La comparacion relevante es contra el propio Qwen2.5-3B-Instruct sin cuantizar: ChaskaLLM no anade capacidades verificables, sino un empaquetado orientado a CPU. Frente a las alternativas, su desventaja es la ausencia total de evaluaciones y de traccion en la comunidad; su ventaja potencial seria una configuracion afinada para CPU, extremo que el repositorio no demuestra con datos.

## Limitaciones y advertencias

- Ausencia total de evaluaciones publicadas: no hay forma de saber cuanto degrada la cuantizacion respecto al modelo base en tareas concretas.
- Riesgo de alucinacion propio de un modelo de ~3.000 millones de parametros, especialmente en dominios especializados, calculo numerico y citas de hechos.
- La etiqueta de idioma solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base sin cuantizar.
- Ventana de contexto no verificada en el artefacto: aunque el modelo base soporte 32.768 tokens, las conversiones GGUF a veces requieren configuracion manual y pueden degradar la calidad en contextos largos.
- Inconsistencia documental: el campo de licencia de la ficha aparece como no disponible mientras la etiqueta declara Apache 2.0. Conviene confirmar los terminos antes de un uso comercial.
- Las etiquetas `soft-shield` y `measured` remiten a un marco propietario sin documentacion publica; no deben interpretarse como garantias de seguridad, filtrado o trazabilidad del modelo.
- Sin senales de mantenimiento o comunidad: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de soporte, issues resueltos o validacion por terceros.
- No hay informacion sobre sesgos especificos introducidos por el autor; los sesgos heredados del modelo base y de su dataset no estan documentados en este repositorio.
- Para produccion con requisitos de calidad, es mas prudente partir del Qwen2.5-3B-Instruct oficial en GGUF, con cuantizaciones documentadas y verificables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SZLHOLDINGS/ChaskaLLM
- README del proyecto en GitHub: https://github.com/szl-holdings/ChaskaLLM/blob/main/README.md
- Organizacion en GitHub: https://github.com/szl-holdings
- Perfil de la organizacion en HuggingFace: https://huggingface.co/SZLHOLDINGS
- Otro artefacto de la organizacion (chaski): https://huggingface.co/SZLHOLDINGS/chaski
- Perfil en X del autor: https://x.com/szlholdings
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
