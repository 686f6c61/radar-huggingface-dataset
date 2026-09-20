# webmp3/Sakura-Micro-Bonsai-2-GSQ-RCO

## Resumen

Sakura Micro Bonsai 2 GSQ-RCO es una release experimental de muy baja precision (ultra-low-bit) publicada por el usuario webmp3 en HuggingFace. Se trata de un derivado cuantizado de Prism ML Ternary Bonsai 2 27B, que a su vez declara como modelo base Qwen3.8-27B. El artefacto distribuido es un unico fichero GGUF de 5.296 GiB (5.686.593.888 bytes) cuyo objetivo declarado es reducir el tamano respecto a la referencia PTQ1 manteniendo la funcionalidad medida en un conjunto reducido de benchmarks.

El modelo no introduce una arquitectura nueva: es un reempaquetado de pesos en formato GGUF para llama.cpp, con una asignacion mixta de codecs de cuantizacion basada en GSQ/RCO (segun la propia model card, que no detalla la seleccion por tensor ni el procedimiento de reproduccion). Con aproximadamente 26.896 millones de parametros en el modelo de origen y un fichero de 5,3 GiB, la tasa efectiva ronda 1,7 bits por parametro, coherente con la naturaleza ternaria del modelo del que deriva.

Su relevancia es acotada pero concreta: permite probar inferencia de un modelo de ~27B en hardware de consumo con relativamente poca VRAM, y sirve como banco de pruebas para investigar compresion extrema. Conviene subir las expectativas con cautela: la model card lo etiqueta explicitamente como experimental, las cifras publicadas provienen de subconjuntos muy pequenos (12 a 40 elementos) y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de Prism ML Ternary Bonsai 2 27B, a su vez derivado de Qwen3.8-27B; la model card no especifica si es transformer denso, MoE o hibrida) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones), dato reportado para el modelo |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de muy baja precision; asignacion mixta de codecs GSQ/RCO. Bits por parametro efectivos: ~1,7 (calculado a partir de 5.686.593.888 bytes y 26.895.998.464 parametros) |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). Fichero: `Sakura-Micro-Bonsai-2-GSQ-RCO-5.3GiB.gguf`. SHA-256: `5054d9b3b3b95145ebf1def33803fd93a1962dda37ca50bd53dbcbbbe4655eb3` |
| Tamano del repositorio | 5,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna en la documentacion disponible. Lo unico verificable es la cadena de procedencia declarada: Sakura Micro Bonsai 2 GSQ-RCO deriva de prism-ml/Ternary-Bonsai-2-27B-gguf, que identifica Qwen3.8-27B como modelo base. El nombre del modelo antecesor ("Ternary") sugiere pesos de naturaleza ternaria, pero la model card de esta release no lo confirma explicitamente ni detalla la topologia (numero de capas, atencion, uso de MoE, ventana de contexto nativa).

Tampoco hay datos sobre entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Esta release no es un entrenamiento, sino una compresion adicional del modelo base: aplica una asignacion mixta de codecs basada en GSQ/RCO junto con compresion de baja precision adicional, en lugar de un cuantizador uniforme para todos los tensores. La propia model card declara que no revela las selecciones por tensor, los detalles de asignacion, la logica interna de optimizacion ni los procedimientos de reproduccion, lo que limita la auditabilidad del resultado. El unico mecanismo de verificacion ofrecido es el fichero `SHA256SUMS` incluido en el repositorio.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation; tag "conversational").
- Razonamiento aritmetico: 37/40 (92,5%) en el subconjunto de aritmetica reportado por el autor.
- Seguimiento de instrucciones: 12/12 (100%) en el subconjunto de IFEval reportado.
- Razonamiento matematico tipo GSM8K: 35/40 (87,5%) en el subconjunto reportado.
- Generacion de codigo: 15/20 (75%) en el subconjunto de HumanEval reportado.
- Inferencia local mediante llama.cpp, dado el formato GGUF y la libreria declarada.
- Capacidades de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado en la model card).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con 5,296 GiB de pesos, el modelo cabe en tarjetas de 8 GB o mas, lo que permite ejecutar un modelo de ~27B en un PC de sobremesa sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales offline: el tag "conversational" y el formato GGUF permiten levantar un chat local con llama.cpp u Ollama para validar flujos de producto antes de invertir en infraestructura.
- Investigacion en cuantizacion extrema: sirve como caso de estudio para medir el impacto de codecs mixtos GSQ/RCO frente a una linea base PTQ1 en perplejidad y tareas cortas.
- Evaluacion comparativa de artefactos comprimidos: util para reproducir la comparacion de la model card (WikiText-2 PPL, aritmetica, GSM8K, HumanEval, IFEval) con el mismo arnes de evaluacion sobre ambos GGUF.
- Despliegue en CPU o servidores sin GPU: al ser un GGUF de 5,3 GiB, puede ejecutarse con RAM suficiente en entornos sin acelerador, util para demos y entornos de pruebas.
- Tareas de aritmetica y calculo sencillo en pipelines automatizados: el 92,5% reportado en el subconjunto aritmetico lo hace candidato para validaciones numericas simples, siempre con verificacion posterior.
- Asistencia de codigo en entornos con recursos limitados: el 75% en HumanEval sobre 20 tareas sugiere utilidad para autocompletado o borradores, nunca para codigo en produccion sin revision.
- Docencia y formacion: permite demostrar tecnicas de cuantizacion y compromisos entre tamano, perplejidad y calidad en un aula o taller con hardware modesto.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Corresponden a subconjuntos muy reducidos (40, 40, 20 y 12 elementos), por lo que la varianza es alta y no deben interpretarse como una medida general de calidad.

| Metrica | Ternary Bonsai 2 PTQ1 (referencia) | Sakura Micro Bonsai 2 GSQ-RCO |
|---|---:|---:|
| Tamano de fichero | 5,538 GiB | 5,296 GiB |
| WikiText-2 PPL | 10,2726 | 10,7251 |
| Aritmetica | 34/40 (85,0%) | 37/40 (92,5%) |
| GSM8K | 38/40 (95,0%) | 35/40 (87,5%) |
| HumanEval | 16/20 (80,0%) | 15/20 (75,0%) |
| IFEval | 9/12 (75,0%) | 12/12 (100%) |

Segun el autor, el artefacto es un 4,37% mas pequeno que la referencia PTQ1 de 5.946.648.928 bytes. La propia model card advierte que estas mediciones no constituyen una afirmacion de superioridad general sobre el modelo base. No se han publicado resultados de MMLU ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para los pesos en VRAM, mas el consumo adicional de la cache KV y del contexto, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Ejemplos razonables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100, H100. En tarjetas de 8 GB el margen es estrecho y obliga a limitar el contexto.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM, y tambien en configuraciones de descarga parcial a CPU (offloading).
- Despliegue en CPU: viable con llama.cpp y al menos 8-16 GB de RAM libre, segun el contexto configurado.
- Opciones de despliegue: llama.cpp (libreria declarada por el modelo), Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF. El soporte en vLLM u otros servidores de alto rendimiento para GGUF no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.
- Runtime: la model card indica usar el runtime documentado por el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura Micro Bonsai 2 GSQ-RCO | ~26,9 mil millones (segun dato reportado) | No disponible | 5,296 GiB (GGUF) | Apache-2.0 | HuggingFace, repositorio con 0 descargas y 0 likes |
| Ternary Bonsai 2 PTQ1 (referencia) | No disponible explicitamente (mismo origen, ~27B nominal) | No disponible | 5,538 GiB (GGUF) | No disponible en la informacion proporcionada | HuggingFace (prism-ml/Ternary-Bonsai-2-27B-gguf) |
| Qwen3.8-27B (base declarada del anterior) | ~27B nominal por nomenclatura | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace (Qwen/Qwen3.8-27B) |

No se dispone de datos de rendimiento comparables de terceros (por ejemplo, otros modelos de ~27B cuantizados a 2 bits) en la informacion proporcionada, por lo que la comparativa se limita a la cadena de derivacion declarada por el autor.

## Limitaciones y advertencias

- Modelo explicitamente experimental: la propia model card lo etiqueta como release de baja precision experimental.
- Trazabilidad limitada: no se publican las selecciones por tensor, los detalles de asignacion de codecs ni el procedimiento de reproduccion, lo que impide auditar o replicar la compresion.
- Benchmarks con muestras muy pequenas (12 a 40 elementos): las diferencias frente a la referencia PTQ1 pueden deberse al azar. Por ejemplo, IFEval pasa de 9/12 a 12/12 con solo tres aciertos de diferencia.
- Degradacion medida en perplejidad: WikiText-2 PPL empeora de 10,2726 a 10,7251 respecto a la referencia PTQ1, lo que indica una perdida de calidad en modelado de lenguaje.
- Rendimiento inferior a la referencia en GSM8K (95,0% a 87,5%) y HumanEval (80,0% a 75,0%).
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos fuertemente cuantizados el riesgo tiende a aumentar, pero no hay medicion publicada para este artefacto.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni de seguridad.
- Idiomas: no declarados. No se puede asumir cobertura multilingue sin verificacion.
- Longitud de contexto: no declarada, lo que impide planificar cargas con conversaciones largas o documentos extensos.
- Licencia: el artefacto se distribuye como Apache-2.0, pero los modelos de los que deriva (Ternary Bonsai 2 27B y Qwen3.8-27B) pueden tener condiciones propias. Conviene verificar las licencias de toda la cadena antes de un uso comercial.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Uso en produccion desaconsejado sin una evaluacion propia y exhaustiva con el dominio objetivo.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/webmp3/Sakura-Micro-Bonsai-2-GSQ-RCO
- Modelo base declarado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Base declarada del modelo anterior: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
