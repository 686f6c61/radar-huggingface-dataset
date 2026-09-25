# tiktits/Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw

## Resumen

Este repositorio contiene una cuantizacion EXL3 (ExLlamaV3) del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicado por el usuario tiktits. Swift 1.5 es la segunda generacion del ajuste de UkisAI sobre Qwen/Qwen3.8-27B, entrenado con Group Sequence Policy Optimization (GSPO, RL) y On-Policy Distillation (OPD) sobre entornos agenticos multi-turno e ingenieria de software. El objetivo declarado del ajuste es reducir el "sobrepensamiento" (thinking tokens) manteniendo la precision del modelo base, y esta version concreta anade una abliteracion del rechazo (uncensored) y conserva intactas las capacidades multimodales (vision) y la cabeza MTP.

La variante aqui descrita esta cuantizada con una asignacion estructurada denominada SC_3.75bpw_H5_V6_MTP4: 3,75 bits por peso en el backbone de texto, 5,00 bpw en lm_head, 6,00 bpw en la torre de vision, 4,00 bpw en la cabeza MTP y embeddings en BF16. El resultado ocupa 14,52 GiB en dos shards de safetensors y esta disenado explicitamente para ejecutarse al completo en una unica GPU de 24 GB (RTX 3090 / 4090) con 131.072 tokens de contexto, apoyandose en decodificacion especulativa por difusion de bloques DFlash2 para alcanzar entre 135 y 155 tokens por segundo.

Es relevante ahora porque combina tres tendencias concretas: cuantizacion de muy baja precision con preservacion selectiva de componentes criticos (vision y MTP), modelos "abliterated" sin alineacion de rechazo, y despliegue local en hardware de consumo. Conviene senalar que el repositorio es muy reciente (creado el 25 de septiembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet (48 capas) + atencion completa GQA (16 capas), 64 capas en total; torre de vision ViT de 27 bloques con patch merger espacial; cabeza de prediccion multi-token (MTP) |
| Parametros totales | 7.795.021.184 (7,8 B) segun los metadatos de safetensors del repositorio; la nomenclatura comercial del modelo es "27B" |
| Parametros activos | No aplica: la informacion disponible no describe el modelo como MoE |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) con asignacion SC_3.75bpw_H5_V6_MTP4: backbone de texto a 3,75 bpw (SQNR 36,14 dB), lm_head a 5,00 bpw (SQNR 36,27 dB, cos_err 0,000142), torre de vision a 6,00 bpw, cabeza MTP a 4,00 bpw, embeddings a 16,00 bpw (BF16). No se publican variantes GGUF ni AWQ/GPTQ en este repositorio |
| Idiomas soportados | No disponible en la informacion proporcionada (la evaluacion incluye C-Eval, lo que sugiere soporte de chino, pero la model card no detalla el conjunto de idiomas) |
| Licencia | swift-open-license-1.0 (campo `license: other`); texto en el enlace indicado en la model card |
| Formato de pesos | safetensors (2 shards, 14,52 GiB / 14.868,18 MB); requiere la libreria exllamav3 para su carga |
| Etiqueta de cuantizacion | SC_3.75bpw_H5_V6_MTP4 |
| Tamano del repositorio | 15,6 GB |
| Pipeline declarado | image-text-to-text |
| Modelos base | ukisai/Swift-1.5-Qwen3.8-27b, Qwen/Qwen3.8-27B, ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP, orcarouter/Qwen3.8-27B-Uncensored |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido de 64 capas: 48 capas emplean atencion lineal Gated DeltaNet y 16 capas mantienen atencion completa con GQA. Sobre ese backbone se anaden dos componentes preservados en esta cuantizacion: una torre de vision de 27 bloques ViT con patch merger espacial (cuantizada a 6,00 bpw para mantener la entrada de imagen y video) y una cabeza de prediccion multi-token MTP (a 4,00 bpw) que habilita decodificacion especulativa. Los embeddings de tokens se mantienen en BF16 y ExLlamaV3 los fija en memoria del sistema, de modo que no consumen VRAM ni anaden latencia de dequantizacion.

El entrenamiento del modelo fuente Swift 1.5 combina GSPO (optimizacion de politica por secuencias de grupo, aprendizaje por refuerzo) y On-Policy Distillation sobre entornos agenticos multi-turno y de ingenieria de software (dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft). Segun la documentacion del autor, la mejora respecto a Swift 1.0 consiste en distinguir entre bucles patologicos de sobrepensamiento en un solo turno y persistencia legitima en tareas multi-turno, evitando que el modelo abandone prematuramente tareas CLI o agenticas. Ademas, Swift incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI.

Sobre esa base, este checkpoint aplica una abliteracion del rechazo antes de cuantizar: una ortogonalizacion rank-1 en float32 siguiendo a Arditi et al. (2024), con una direccion de rechazo unitaria r de dimension 5120 extraida en la capa 38 a partir de la diferencia media del residual stream, aplicada a las 131 tensores que escriben en el residual stream, incluida la cabeza MTP. Todos los scripts, vectores de rechazo y utilidades de cuantizacion se incluyen en el directorio `abliteration/` del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 131.072 tokens.
- Razonamiento explicito con modo "thinking" y control del esfuerzo de razonamiento (el modelo base Qwen3.8 expone el parametro reasoning_effort con niveles tipo xhigh, medium y low; Swift 1.5 mantiene el ahorro de tokens de pensamiento en todos los niveles segun UkisAI).
- Razonamiento matematico de competicion y cientifico de nivel doctorado (resultados reportados en AIME 2026, HMMT Nov 2025 y GPQA-Diamond para el modelo fuente).
- Codigo y tareas de ingenieria de software, incluyendo resolucion de problemas y uso de herramientas en terminal (Terminal-Bench 2.1, LiveCodeBench v6).
- Capacidades agenticas multi-paso y persistencia en tareas de CLI, que es el eje del entrenamiento GSPO/OPD de Swift 1.5.
- Multimodal: entrada de imagen y video a traves de la torre de vision ViT conservada a 6,00 bpw (pipeline image-text-to-text; ERQA reportado para el modelo fuente).
- Seguimiento estricto de instrucciones (IFBench reportado para el modelo fuente).
- Decodificacion especulativa mediante cabeza MTP a 4,00 bpw y compatibilidad declarada con DFlash2 (decodificacion especulativa por difusion de bloques) de z-lab.
- Ausencia deliberada de rechazo: la abliteracion elimina el mecanismo de negativa aprendido, por lo que el modelo responde a peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque el entrenamiento agentico del modelo fuente lo hace plausible; no confirmado en la model card.

## Casos de uso

- Agentes de terminal y automatizacion de CLI: el modelo fuente reporta 72,13% en Terminal-Bench 2.1 con 43.733 tokens, y el ajuste esta orientado a mantener la persistencia en tareas multi-paso. Se usaria como motor de un agente que ejecuta comandos, interpreta salidas y corrige errores en secuencia.
- Asistencia de codigo en produccion: con 81,71% en LiveCodeBench v6 y una reduccion declarada del 46,3% en tokens de pensamiento respecto al base, es adecuado para generacion y revision de codigo donde el coste por token importa.
- Razonamiento cientifico y matematico asistido: 88,59% en GPQA-Diamond y 96,00% en AIME 2026 con menos tokens que el base; util para tutoria avanzada o verificacion de derivaciones, siempre con supervision humana.
- Analisis de documentos con imagen: la torre de vision a 6 bpw permite procesar capturas, diagramas, graficos y paginas escaneadas dentro del mismo contexto de 131.072 tokens, por ejemplo para extraer datos de informes tecnicos o tickets con adjuntos.
- Despliegue local con privacidad de datos: al caber en 14,52 GiB y estar disenado para una sola GPU de 24 GB, permite procesar informacion sensible sin salir de la infraestructura propia (juridico, sanitario, industrial).
- Red-teaming e investigacion en seguridad y alineacion: al ser una variante abliterated con el pipeline de ortogonalizacion reproducible incluido, sirve para estudiar como se comporta un modelo sin direccion de rechazo y para evaluar mecanismos de mitigacion externos.
- Extraccion estructurada con instrucciones estrictas: 72,07% en IFBench sugiere buen cumplimiento de formatos y restricciones, util en pipelines de parseo de datos no estructurados hacia JSON o formularios.
- Escritura creativa sin filtros editoriales: la ausencia de rechazo permite generar ficcion o contenido con tematicas que los modelos alineados bloquean; requiere revision humana y cumplimiento normativo antes de cualquier publicacion.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo fuente ukisai/Swift-1.5-Qwen3.8-27b (27B) y a sus comparaciones publicadas en la model card del repositorio. No se han medido especificamente sobre este checkpoint EXL3 de 3,75 bpw, por lo que deben tomarse como referencia del modelo base sin cuantizar. El numero entre parentesis indica los tokens de pensamiento reportados.

| Benchmark | Categoria | Qwen3.8-27B base | Swift 1.0 (27B) | Swift 1.5 (27B) |
|---|---|---|---|---|
| Terminal-Bench 2.1 | Agentico / CLI | 69,21% (52.265 t) | 65,84% (27.272 t) | 72,13% (43.733 t) |
| LiveCodeBench v6 | Codigo dificil | 76,76% (11.184 t) | 81,55% (8.615 t) | 81,71% (8.448 t) |
| GPQA-Diamond | Ciencia nivel doctorado | 88,28% (15.014 t) | 88,28% (8.855 t) | 88,59% (8.717 t) |
| AIME 2026 | Matematicas de olimpiada | 98,67% (22.014 t) | 94,00% (16.143 t) | 96,00% (13.203 t) |
| HMMT Nov 2025 | Matematicas de olimpiada | 99,33% (22.032 t) | 96,00% (15.189 t) | 97,33% (14.957 t) |
| C-Eval | Conocimiento general | 90,00% (1.492 t) | 90,62% (804 t) | 90,92% (819 t) |
| IFBench | Instrucciones estrictas | 73,53% (8.052 t) | 71,80% (4.657 t) | 72,07% (4.955 t) |
| ERQA | Vision multimodal | 67,45% (4.137 t) | 66,30% (2.045 t) | 65,40% (1.906 t) |

Como datos de cuantizacion, la model card reporta SQNR de 36,14 dB en la ultima capa del backbone y de 36,27 dB en lm_head, con un error de coseno de 0,000142. Para el rendimiento de inferencia se declaran entre 135 y 155 tokens por segundo en una GPU de 24 GB con decodificacion especulativa DFlash2. No se han publicado resultados de benchmarks medidos sobre esta cuantizacion EXL3 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 14,52 GiB (14.868,18 MB) en dos shards; el resto del presupuesto de VRAM se destina a cache KV.
- GPU objetivo declarada: una unica GPU de 24 GB, concretamente RTX 3090 o RTX 4090, con contexto completo de 131.072 tokens.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas. No hay datos publicados para GPUs de 16 GB o menos.
- GPUs profesionales: A100, H100 u otras con 40-80 GB pueden ejecutarlo con margen amplio para cache KV y lotes mayores, aunque el checkpoint esta optimizado para el caso de 24 GB.
- Embeddings de tokens: se fijan en memoria del sistema (BF16), con 0,00 GiB de coste en VRAM y sin latencia de dequantizacion segun ExLlamaV3.
- Opciones de despliegue: ExLlamaV3 (exllamav3) es la libreria obligatoria por el formato EXL3. Se declara compatibilidad con DFlash2 (z-lab/Qwen3.8-27B-DFlash2) para decodificacion especulativa por difusion de bloques. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son compatibles directamente con este repositorio; vLLM y TGI tampoco soportan EXL3 en la informacion disponible.
- Latencia y throughput estimados: 135-155 tokens/s en 24 GB con DFlash2 habilitado, segun la model card. No se detallan valores de latencia por token ni rendimiento sin decodificacion especulativa.
- Almacenamiento: el repositorio ocupa 15,6 GB.

## Comparativa con modelos similares

La comparacion mas directa es dentro de la propia linea de derivacion, ya que los cuatro checkpoints comparten origen. No se dispone de datos de parametros, contexto o licencia para todos ellos en la informacion proporcionada.

| Modelo | Rol | Formato / cuantizacion | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Base Qwen/Qwen3.8-27B | Modelo fundacional | No disponible | No disponible | Terminal-Bench 2.1: 69,21%; LiveCodeBench v6: 76,76%; GPQA-D: 88,28%; AIME 2026: 98,67% |
| ukisai/Swift-1.5-Qwen3.8-27b | Ajuste GSPO + OPD, multimodal, alineado | No disponible | No disponible | Terminal-Bench 2.1: 72,13%; LiveCodeBench v6: 81,71%; GPQA-D: 88,59%; AIME 2026: 96,00%; ERQA: 65,40% |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | Generacion anterior del ajuste | No disponible | No disponible | Terminal-Bench 2.1: 65,84%; LiveCodeBench v6: 81,55%; GPQA-D: 88,28%; AIME 2026: 94,00% |
| orcarouter/Qwen3.8-27B-Uncensored | Variante uncensored (fuente del vector de rechazo) | No disponible | No disponible | No disponible |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP | Variante uncensored con MTP (fuente del vector de rechazo) | No disponible | No disponible | No disponible |
| tiktits/Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw (este repositorio) | Cuantizacion EXL3 3,75 bpw + abliteration | EXL3, safetensors, 14,52 GiB | swift-open-license-1.0 | No medido; hereda la referencia de Swift 1.5 |

## Limitaciones y advertencias

- Modelo abliterated sin alineacion de rechazo: la direccion de rechazo se ha eliminado deliberadamente de 131 tensores. Esto implica que el modelo puede generar contenido danino, ilegal o gravemente inapropiado sin negarse. No debe exponerse a usuarios finales sin filtros externos y supervision.
- Riesgo de alucinacion: es un modelo de 27B con razonamiento largo; en tareas de conocimiento factual puede inventar datos con alta confianza. La reduccion de tokens de pensamiento respecto al base puede agravar este riesgo en tareas que requieren verificacion extensa.
- Degradacion por cuantizacion: el backbone esta a 3,75 bpw. Aunque se reporta SQNR de 36,14 dB en la ultima capa, no hay evaluaciones publicadas del impacto real de esta cuantizacion sobre los benchmarks del modelo fuente, especialmente en tareas sensibles a la precision numerica.
- Caida en vision: el ERQA reportado ya baja de 67,45% (base) a 65,40% (Swift 1.5) antes de cuantizar. La torre de vision a 6,00 bpw puede anadir perdida adicional no medida.
- Discrepancia de parametros: los metadatos de safetensors indican 7.795.021.184 parametros, mientras que la nomenclatura comercial del modelo es "27B". Conviene verificar esta cifra contra el modelo fuente antes de planificar recursos.
- Idiomas: el conjunto de idiomas soportados no esta documentado en este repositorio. La presencia de C-Eval sugiere chino e ingles, pero no hay confirmacion para otras lenguas, incluido el castellano.
- Licencia: swift-open-license-1.0 con campo `license: other`. No se detallan en la informacion proporcionada las condiciones de uso comercial, redistribucion ni las obligaciones derivadas de los modelos base (Qwen, UkisAI y las variantes uncensored). Es imprescindible revisar el texto completo de la licencia antes de cualquier uso en produccion.
- Compatibilidad de despliegue limitada: al ser EXL3, queda restringido a ExLlamaV3. No hay pesos GGUF, por lo que las herramientas mas extendidas (llama.cpp, Ollama) no pueden ejecutarlo y el ecosistema de servidores es mas reducido.
- Proyecto sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha, con una antiguedad de minutos. No hay informes independientes de calidad, estabilidad ni reproducibilidad de la cuantizacion.
- Coste energetico y de contexto: mantener 131.072 tokens de contexto en una GPU de 24 GB exige una gestion cuidadosa de la cache KV; contextos largos reducen el espacio disponible y pueden degradar el throughput declarado.
- Contenido de la model card: parte del texto de metodologia aparece truncado en la informacion disponible, por lo que los detalles completos del pipeline de abliteration (normas, capas exactas, hiperparametros adicionales) deben consultarse en el repositorio original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tiktits/Swift-1.5-Qwen3.8-27B-Uncensored-EXL3-3.75bpw
- Modelo fuente Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Variante uncensored con MTP (fuente del vector de rechazo): https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Variante uncensored (fuente del vector de rechazo): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo de decodificacion especulativa DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Dataset de entrenamiento agentico multi-turno: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia del modelo: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Paper de referencia sobre abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Anuncio de UkisAI sobre Swift: https://ukisai.com/news/introducing-swift
- Guia de ejecucion local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Repositorio no oficial de variante uncensored para uso local: https://github.com/Wassimyounes01/qwen38-uncensored
