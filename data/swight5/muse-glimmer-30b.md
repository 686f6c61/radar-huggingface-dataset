# Swight5/Muse-Glimmer-30B

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parametros con un codificador de percepcion dedicado (~1,8B, ViT-G/14), disenado para tareas agenticas autonomas que se ejecutan en hardware de consumo. Segun la model card, esta desarrollado por Meta Superintelligence Lab, destilado a partir de Muse Spark y publicado con licencia Apache 2.0. El repositorio de HuggingFace que se evalua aqui (`Swight5/Muse-Glimmer-30B`) declara 29.776.626.688 parametros reales en safetensors y un tamano de 59,6 GB.

El modelo aborda un problema concreto: ejecutar agentes completos (planificacion multi-paso, llamadas a herramientas con esquemas estrictos, recuperacion ante fallos de herramientas y comprension de capturas de pantalla o documentos) de forma local, sin infraestructura cloud ni acceso a red. Para ello combina una ventana de contexto de 131.072+ tokens, una arquitectura de atencion hibrida local/global con ventana deslizante de 2.048 y atencion con compuertas, y un vocabulario de 202.048 tokens.

Su relevancia practica depende de dos decisiones de ingenieria: la cuantizacion a ~4 bits que reduce el modelo por debajo de 20 GB (variante K-Quant-17GB, con una degradacion declarada del 1,0% en 15 benchmarks) y la decodificacion especulativa mediante un drafter DFlash que predice bloques de 16 tokens en una sola pasada, con un speedup medido de 3,1x en una RTX 5090 (74,9 a 233,4 tok/s). No obstante, el repositorio presenta cero descargas y cero likes, y existen discrepancias entre el autor declarado en HuggingFace y el de la model card, por lo que conviene tratarlo como material a validar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,78B) segun safetensors; ~29,6B segun la model card (incluye el codificador visual) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision; K-Quant-Dynamic (~32 GB VRAM); K-Quant-17GB (~4 bits, 24 GB VRAM) |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas (segun model card); la lista concreta no esta disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en el repo; el formato de las variantes K-Quant no se especifica |
| Dimension oculta | 6.656 |
| Capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] repetido; ventana deslizante de 2.048; atencion con compuertas |
| Cabezas de atencion (Q / KV) | 32 / 2 (GQA 16:1); dimension de cabeza 128 |
| FFN | SwiGLU, dimension intermedia 19.968 |
| Codificacion posicional | RoPE (theta = 500.000), solo en capas locales |
| Vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Tokens visuales maximos por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Fecha de corte de conocimiento | 4 de enero de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 52 capas con un patron de atencion que alterna tres capas locales por cada capa global. Las capas locales usan una ventana deslizante de 2.048 tokens y son las unicas que aplican RoPE (theta = 500.000); la atencion incorpora compuertas y un esquema GQA agresivo de 16:1 (32 cabezas de consulta frente a 2 de clave/valor), lo que reduce de forma sustancial el coste de la cache KV en contextos largos. La FFN es SwiGLU con dimension intermedia de 19.968. A esto se anade un codificador de percepcion independiente de ~1,8B parametros (ViT-G/14, 50 capas, anchura 1.536, patch de 14), referenciado en el paper arXiv:2504.13181, que permite entradas intercaladas de texto e imagen con hasta 4.096 tokens visuales por imagen.

La model card indica que los datos de entrenamiento son contenido multimodal de fuentes publicas, datos de terceros e informacion de productos y servicios de Meta, curados por redes de proveedores externos y personal de Meta. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion no esta disponible. La innovacion tecnica mas destacable documentada es el drafter de decodificacion especulativa basado en DFlash (arXiv:2602.06036): un modelo auxiliar de difusion por bloques que predice bloques de 16 tokens en una sola pasada y que el modelo principal verifica en paralelo. El drafter tiene 5 capas, atencion de ventana deslizante de 2.048 en todas las capas, 32 cabezas de consulta y 8 de clave/valor, y toma caracteristicas ocultas de las capas {1, 13, 25, 37, 49} del modelo objetivo.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Ejecucion de tareas agenticas de extremo a extremo, evaluada por el autor en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperacion ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Entrada multimodal intercalada de texto e imagen (capturas de pantalla, graficos, documentos) mediante el codificador de percepcion; la salida es solo texto.
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw y Hermes Agent, segun la model card.
- Esfuerzo de razonamiento controlable: permite ajustar la profundidad de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Decodificacion especulativa integrada mediante drafter DFlash, con versiones cuantizadas del mismo.

## Casos de uso

- Automatizacion de tareas de escritorio: el agente interpreta capturas de pantalla gracias al codificador de percepcion (hasta 4.096 tokens visuales por imagen) y ejecuta acciones mediante tool calling, lo que permite automatizar flujos de interfaz grafica sin API del sistema.
- Atencion al cliente multi-turno: con 131.072+ tokens de contexto puede mantener historiales largos y consultar documentacion extensa en la misma conversacion, manteniendo coherencia entre turnos.
- Agente de codigo en CI/CD: su entrenamiento orientado a SWE-Bench y el soporte de function calling permiten integrarlo en pipelines para leer trazas, proponer parches y reintentar cuando una herramienta de build devuelve error.
- Búsqueda profunda documental: el modelo esta evaluado en DeepSearch QA, de modo que puede encadenar consultas, leer resultados y sintetizar respuestas con evidencia en tareas de investigacion.
- Analisis de documentos y graficos financieros en local: al ejecutarse sin red, permite procesar informes confidenciales con entrada de imagen y texto sin enviar datos a la nube.
- Orquestacion multi-agente sobre MCP: su evaluacion en MCP-Atlas y la compatibilidad con OpenClaw y Hermes Agent lo hacen adecuado como nodo ejecutor en arquitecturas de agentes con herramientas estandarizadas.
- Asistente de desarrollo en portatil: con la variante K-Quant-17GB cabe en 24 GB de VRAM y alcanza 37,8 tok/s (M4 Max) o 50,2 tok/s (M5 Max) con especulacion, suficiente para interaccion en tiempo real.
- Automatizacion de tareas largas con recuperacion de errores: en procesos por lotes donde las herramientas fallan de forma intermitente, el modelo reintenta y corrige en lugar de abortar el flujo.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, SWE-Bench, etc.) en la informacion disponible. La model card menciona que el modelo se evalua en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero el texto disponible esta truncado antes de mostrar las puntuaciones.

Los unicos datos cuantitativos publicados son de degradacion por cuantizacion y de velocidad de generacion:

| Metrica | Full precision | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion (% media en 15 benchmarks) | - | 0,2% | 1,0% |
| VRAM objetivo | 64 GB | 32 GB | 24 GB |

| Hardware | Sin especulacion (tok/s) | Con DFlash (tok/s) | Speedup |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Medido con tamano de lote 1 y decodificacion greedy (la model card se interrumpe en este punto).

## Requisitos de hardware

- VRAM para inferencia en precision completa: ~59,6 GB de pesos, con un objetivo declarado de 64 GB de VRAM.
- VRAM con K-Quant-Dynamic: 32 GB (RTX 5090, A100 40GB, L40S, etc.).
- VRAM con K-Quant-17GB: 24 GB, lo que incluye margen para la cache KV, el codificador de percepcion y el drafter en el mismo envelope (RTX 4090, RTX 3090, A10G 24GB).
- Cabe en GPU de consumo: si, en RTX 4090/3090 con la variante de 17 GB y en RTX 5090 con la variante de 32 GB o la de 17 GB con margen adicional.
- Apple Silicon: validado en M4 Max y M5 Max con la variante K-Quant-17GB, con 37,8 y 50,2 tok/s respectivamente usando especulacion.
- Throughput de referencia: 233,4 tok/s en RTX 5090 con DFlash frente a 74,9 tok/s sin especulacion (lote 1, greedy).
- Opciones de despliegue: la model card no detalla frameworks compatibles (vLLM, llama.cpp, Ollama, TGI); esta informacion no esta disponible. Se menciona un drafter DFlash con versiones cuantizadas y compatibilidad con endpoints, pero sin especificar el runtime.
- Latencia: no se publican mediciones de latencia por peticion (time-to-first-token); solo throughput de decodificacion.

## Comparativa con modelos similares

No hay resultados de benchmarks de Muse Glimmer que permitan una comparacion de rendimiento. La comparacion se limita a datos arquitectonicos y de licencia publicos de cada modelo.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Muse Glimmer 30B | ~29,8B | 131.072+ | Texto + imagen (entrada) | Apache 2.0 | No disponible |
| Qwen3-32B | ~32,8B | 128.000 | Texto | Apache 2.0 | No comparable (sin datos del primero) |
| Gemma 3 27B | ~27B | 128.000 | Texto + imagen (entrada) | Licencia Gemma | No comparable |
| Llama 3.3 70B | 70B | 128.000 | Texto | Licencia comunitaria Llama | No comparable |

Muse Glimmer se diferencia de las alternativas de tamano similar por incluir decodificacion especulativa integrada, variantes cuantizadas validadas para 24 GB y un enfoque explicito en tareas agenticas (tool use, recuperacion de fallos, scaffolds). A cambio, carece de resultados publicos verificables y su ecosistema de despliegue esta menos documentado.

## Limitaciones y advertencias

- El repositorio de HuggingFace tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (25 de octubre de 2026): los pesos no han sido validados por la comunidad.
- Discrepancia de autoria: el repositorio pertenece al usuario `Swight5`, mientras que la model card atribuye el modelo a Meta Superintelligence Lab. Conviene verificar la procedencia de los pesos antes de cualquier uso en produccion.
- La model card disponible esta truncada: faltan los resultados numericos de benchmarks y parte de la seccion de rendimiento.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de factualidad ni tasas de alucinacion en la informacion disponible.
- Riesgo operativo en modo agente: al ejecutar herramientas y acciones de forma autonoma, un error de planificacion puede tener efectos reales; se recomienda sandboxing y confirmacion humana en acciones destructivas.
- Idiomas: se declaran mas de 100 idiomas de entrenamiento, pero no hay evaluaciones por idioma ni lista oficial; el rendimiento fuera de ingles y de los idiomas mayoritarios no esta verificado.
- Sesgos: no se publica ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Licencia Apache 2.0: permisiva y apta para uso comercial, pero los datos de entrenamiento incluyen informacion de productos y servicios de Meta, cuyos terminos no se detallan.
- Coste de contexto visual: hasta 4.096 tokens por imagen, lo que consume ventana y cache KV en flujos con muchas capturas de pantalla.
- Fecha de corte de conocimiento: 4 de enero de 2026; qualquer evento posterior no esta cubierto.
- No se especifican los frameworks de inferencia soportados, lo que anade incertidumbre al despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Swight5/Muse-Glimmer-30B
- Pagina de modelo de Meta: https://dev.meta.ai/models/muse-glimmer
- Publicacion de investigacion: https://ai.meta.com/research/publications/muse-glimmer-30b-an-on-device-agentic-model/
- Paper arXiv de Muse Glimmer 30B: https://arxiv.org/abs/2610.24628
- Paper del codificador de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash (drafter especulativo): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ficha en MindStudio: https://www.mindstudio.ai/models/muse-glimmer-30b
- Sitio no oficial: http://museglimmer.site/
