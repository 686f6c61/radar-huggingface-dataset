# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo1320-lora

## Resumen

`Qwen2.5-0.5B-Instruct-xlam-mixed-grpo1320-lora` es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo instructivo Qwen2.5-0.5B-Instruct. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (formato PEFT/safetensors) y debe cargarse sobre el checkpoint original de Qwen para poder utilizarse. Su objetivo es especializar un modelo muy pequeno en tool calling estructurado y, de forma destacable, en la abstención cuando las herramientas ofrecidas no son relevantes para la peticion del usuario.

El entrenamiento se ha realizado con Group Relative Policy Optimization (GRPO), es decir, aprendizaje por refuerzo directo sobre el modelo instructivo, sin una fase previa de SFT en este adaptador. Se completaron 1320 actualizaciones de GRPO en aproximadamente una hora sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, derivado del ecosistema xLAM. El resultado es un adaptador de ~0,5 B de parametros base pensado para entornos con recursos muy limitados: CPU, GPUs de gama baja o despliegues en el borde.

Su relevancia actual esta en el nicho: demuestra que un modelo de 0,5 B puede mejorar la precision de llamadas a herramientas y, sobre todo, la tasa de rechazo correcto ante herramientas irrelevantes (del 66,93 % al 75,94 %), a costa de una ligera perdida en el benchmark BFCL de function calling de un solo turno. Es material interesante para investigacion en RL aplicado a agentes y para prototipado barato, no para produccion de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA acoplado (PEFT) |
| Parametros totales | ~0,5 B en el modelo base Qwen2.5-0.5B-Instruct; parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; no se especifica en la ficha del adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision no declarada); el repositorio no incluye GGUF, AWQ ni GPTQ. El modelo base dispone de conversiones de la comunidad a GGUF, AWQ y GPTQ |
| Idiomas soportados | `en` segun la ficha; el modelo base Qwen2.5 es multilingue, pero el adaptador no declara otros idiomas |
| Licencia | No disponible (la del modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, pero la ficha del adaptador no especifica licencia) |
| Formato de pesos | Safetensors (adaptador LoRA PEFT; requiere el modelo base para inferencia) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE), con una ventana de contexto de 32 768 tokens. Sobre ese modelo se entrena un adaptador LoRA de bajo rango que modifica únicamente un subconjunto de matrices, por lo que el coste de almacenamiento y de despliegue es minimo en comparacion con un fine-tuning completo.

El metodo de entrenamiento es la innovacion principal: GRPO (Group Relative Policy Optimization) aplicado directamente sobre el modelo instructivo, sin SFT intermedio, durante 1320 actualizaciones y aproximadamente una hora de computo (tiempo del bucle de entrenamiento, excluyendo carga de modelo, preparacion de datos y evaluacion externa). El dataset es `uygarkurt/xlam-tool-calling-mixed`, una mezcla orientada a tool calling construida sobre el ecosistema xLAM; la composicion exacta, el numero de tokens y los detalles de las funciones de recompensa no estan publicados en la informacion disponible. El pipeline utilizado es Post-Training Lab, un repositorio del mismo autor.

La senal de recompensa parece premiar tanto la correccion estructural de la llamada (nombre de funcion y argumentos) como la decision de abstenerse cuando ninguna herramienta encaja, a juzgar por la mejora en la metrica de irrelevancia. No se documentan tecnicas adicionales como decodificacion especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de llamadas a funciones en formato estructurado (tool calling) sobre un conjunto de herramientas definido en el prompt.
- Abstención explicita cuando las herramientas ofrecidas son irrelevantes para la peticion; es la mejora mas clara del entrenamiento (66,93 % a 75,94 % en el subconjunto de irrelevancia).
- Generacion de texto conversacional y respuesta a instrucciones, heredada del modelo base instructivo.
- Extraccion de nombres de funcion y argumentos con alta fidelidad en el conjunto evaluado (90,38 % de exactitud en nombre de funcion en xLAM FNA).
- Capacidad limitada de razonamiento general y matematicas, propia de un modelo de 0,5 B (MMLU 42,05 %, MATH-500 16,80 %, IFEval 28,28 %).
- Soporte de agentes de un solo paso (single-turn function calling); el comportamiento multi-turno y multi-paso no se evalua en la ficha.
- Multilingue: no declarado. El adaptador se entrena y evalua en ingles; el modelo base soporta varios idiomas, pero no hay evidencia de que la especializacion en tool calling se transfiera a otros idiomas.
- Sin vision, audio ni modo thinking explicito.

## Casos de uso

- **Enrutador de herramientas en asistentes conversacionales**: dado un catalogo de funciones (buscar, reservar, consultar saldo), el adaptador decide cual invocar y con que argumentos, con un coste de inferencia irrisorio frente a un modelo grande. Adecuado porque su tarea principal es exactamente esa y funciona en CPU.
- **Filtro de abstención antes de un modelo mayor**: colocado delante de un LLM grande, el adaptador descarta peticiones que no requieren ninguna herramienta y evita llamadas innecesarias. La metrica de irrelevancia (75,94 %) indica que esta especializado en ese juicio.
- **Agentes ligeros en el borde o en dispositivos**: con ~0,5 B de parametros, cabe en moviles, Raspberry Pi o contenedores sin GPU para tareas de clasificacion de intencion y seleccion de accion.
- **Prototipado y experimentacion con GRPO**: sirve como referencia reproducible (1320 updates, 1 hora, pipeline publico en Post-Training Lab) para equipos que quieran montar su propio ciclo de RL para tool calling sin grandes presupuestos.
- **Extraccion de parametros en pipelines RAG**: convertir una pregunta en lenguaje natural en una consulta estructurada (filtros, campos, rango de fechas) para un motor de busqueda o base de datos vectorial.
- **Generacion de JSON estricto en backends**: al estar entrenado para producir llamadas con nombre de funcion y argumentos, puede usarse como formateador barato en tareas de salida estructurada, siempre con validacion posterior del esquema.
- **Evaluacion comparativa de adaptadores**: como checkpoint de referencia en estudios sobre el equilibrio entre precision de llamada y abstención en modelos sub-1B.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras son porcentajes. La primera fila es el modelo base Qwen2.5-0.5B-Instruct y la segunda el adaptador GRPO tras 1320 actualizaciones.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04 % | 15,80 % | 26,80 % | 63,84 % | 90,03 % | 50,28 % | 77,78 % | 66,93 % | — |
| GRPO (este adaptador) | GRPO 1320 | 42,05 % | 16,80 % | 28,28 % | 66,29 % | 90,38 % | 46,87 % | 77,78 % | 75,94 % | 1 |

Notas de medicion segun el autor: xLAM ETC es exactitud exacta de la llamada a herramienta y xLAM FNA es exactitud del nombre de funcion; ambas se calculan sobre el holdout de solo llamadas (2287 ejemplos evaluados, 700 omitidos) y no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab, por lo que no son directamente comparables con cifras publicadas por terceros.

Lectura: mejora en exactitud de llamada (+2,45 puntos), nombre de funcion (+0,35), IFEval (+1,48) y abstención (+9,01), con un descenso de 3,41 puntos en BFCL single-turn. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- **VRAM estimada**: en bf16/fp16 el modelo base ocupa aproximadamente 1 GB de pesos; el adaptador LoRA anade solo unos megabytes. En int8 baja a ~0,5 GB y en int4 a ~0,3 GB, sin contar la cache KV.
- **Cache KV**: con 32 768 tokens de contexto y GQA, el consumo es contenido, pero en contextos muy largos puede superar el de los pesos; conviene limitar `max_model_len` en funcion del caso de uso.
- **GPU recomendadas**: cualquier GPU con 4 GB o mas es suficiente (RTX 3050, RTX 3060, T4, L4). No requiere A100 ni H100; usarlas seria desproporcionado salvo para servir muchos lotes en paralelo.
- **Consumer GPU**: si, cabe holgadamente en cualquier GPU de consumo de los ultimos anos y tambien en CPU (inferencia en CPU perfectamente viable para un 0,5 B).
- **Opciones de despliegue**: `transformers` + `peft` (cargando el adaptador sobre `Qwen/Qwen2.5-0.5B-Instruct`), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- **Latencia y throughput**: no disponibles. Por tamano, se espera latencia de decenas de milisegundos por token en GPU y de varios tokens por segundo en CPU, pero son estimaciones, no mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | ~0,5 B | 32 768 (heredado del base) | Tool calling + abstención via GRPO | No disponible | HuggingFace, adaptador PEFT |
| Qwen2.5-0.5B-Instruct (base) | ~0,5 B | 32 768 | Instrucciones generales | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 | Instrucciones generales, mejor razonamiento | Apache 2.0 | HuggingFace |
| Modelos especializados en function calling de ~1 B (familia xLAM, Hammer, ToolACE) | ~1 B | Variable segun modelo | Tool calling | Variable; consultar cada ficha | HuggingFace |

No se dispone de resultados de benchmarks comparativos directos entre este adaptador y las alternativas en la informacion proporcionada; las cifras de la tabla de rendimiento son del autor y usan scripts propios. En la practica, la comparacion relevante es contra su propio modelo base: el adaptador mejora tool calling y abstención, pero pierde terreno en BFCL single-turn y no mejora el razonamiento general.

## Limitaciones y advertencias

- **Licencia no especificada**: la ficha del adaptador no declara licencia. Aunque el modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, la ausencia de licencia explicita en el repositorio del adaptador es un riesgo para uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- **Solo ingles declarado**: el entrenamiento y la evaluacion son en ingles; no hay evidencia de que la especializacion en tool calling funcione en castellano u otros idiomas.
- **Capacidad de razonamiento muy limitada**: MMLU 42,05 %, MATH-500 16,80 % e IFEval 28,28 %. No es adecuado para tareas que requieran razonamiento multi-paso, matematicas o instrucciones complejas.
- **Regresion en BFCL**: el adaptador baja de 50,28 % a 46,87 % en BFCL single-turn FC, es decir, el RL mejora la abstención a costa de cierta precision en llamadas convencionales. Hay que evaluar el equilibrio en el dominio concreto de despliegue.
- **Riesgo de alucinacion**: como cualquier modelo de 0,5 B, puede inventar nombres de funcion o argumentos con apariencia plausible; es obligatorio validar la salida contra un esquema JSON y contra el catalogo real de herramientas.
- **Sin evaluacion multi-turno ni multi-paso**: la ficha solo reporta resultados de un solo turno; el comportamiento en agentes con cadenas largas de llamadas no esta medido.
- **Metricas no comparables con terceros**: las evaluaciones xLAM y BFCL usan scripts y agregados propios del autor; no deben compararse directamente con cifras oficiales de los benchmarks.
- **Repositorio de 0,0 GB**: el tamano reportado sugiere que los pesos pueden no estar subidos o que el conteo no refleja el contenido real. Verificar que `adapter_model.safetensors` existe y se descarga correctamente antes de depender de el.
- **Sin soporte de vision ni audio**: cualquier caso de uso multimodal queda fuera de alcance.
- **Contexto largo no verificado**: aunque el modelo base soporta 32 768 tokens, no hay evaluacion del adaptador con contextos largos ni del efecto de la especializacion sobre la atencion a herramientas definidas en prompts extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo1320-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
