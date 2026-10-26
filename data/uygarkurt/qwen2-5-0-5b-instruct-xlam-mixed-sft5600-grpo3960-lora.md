# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo3960-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo3960-lora` es un adaptador LoRA para Qwen2.5-0.5B-Instruct entrenado específicamente para *tool calling* estructurado y para la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes. Lo desarrolla el usuario uygarkurt dentro de su proyecto Post-Training Lab, y se apoya en el dataset mixto `uygarkurt/xlam-tool-calling-mixed`, derivado del corpus xLAM de function calling. No es un modelo completo: es un adaptador PEFT que debe cargarse sobre los pesos originales de Qwen2.5-0.5B-Instruct.

El interés técnico está en el pipeline de entrenamiento: primero 5.600 actualizaciones de SFT y después 3.960 actualizaciones de GRPO (Group Relative Policy Optimization) partiendo del adaptador SFT, con un coste total de 3,1 horas de cómputo. El resultado es una mejora medible en precisión de llamadas a herramientas (xLAM ETC del 77,61% al 79,49%; BFCL single-turn del 53,04% al 57,59%) y, sobre todo, en la tasa de abstención ante herramientas irrelevantes (del 49,46% al 54,90%), a costa de una ligera degradación en conocimiento general (MMLU del 39,42% al 38,74%) y matemáticas (MATH-500 del 18,00% al 17,20%).

Es relevante ahora porque demuestra que el refinamiento con RL sobre un modelo de 0,5B parámetros permite ganar fiabilidad en decisiones de invocación de herramientas, un cuello de botella habitual en agentes LLM de bajo coste. El modelo base aporta una ventana de contexto de 32.768 tokens y arquitectura transformer decoder-only, mientras que el adaptador añade la política de decisión «llamar o no llamar».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT); el adaptador no modifica la arquitectura, solo añade matrices de bajo rango |
| Parametros totales | 0,49 B en el modelo base (0,36 B no-embedding); parametros del adaptador LoRA no disponibles (rango y modulos objetivo no documentados) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no se documenta extension por parte del adaptador) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite cuantizacion estandar (GPTQ, AWQ, GGUF Q4/Q5/Q8) tras fusionar el adaptador |
| Idiomas soportados | Ingles (declarado en la model card del adaptador); el modelo base Qwen2.5 es multilingue, pero el adaptador solo se ha entrenado con datos en ingles |
| Licencia | No disponible. El modelo base Qwen2.5-0.5B-Instruct se publica bajo Apache 2.0; el adaptador no especifica licencia propia |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 24 capas, 896 dimensiones ocultas, 14 cabezas de atencion con 2 cabezas KV (GQA), activacion SwiGLU, RMSNorm y RoPE, con 32.768 tokens de contexto. El entrenamiento se realizo en dos fases encadenadas: 5.600 actualizaciones de supervised fine-tuning sobre el dataset mixto de tool calling y, a continuacion, 3.960 actualizaciones de GRPO que parten del adaptador SFT ya entrenado (no del modelo base). El adaptador SFT previo no es necesario en tiempo de inferencia: este repositorio ya lo incorpora.

Los datos provienen de `uygarkurt/xlam-tool-calling-mixed`, una mezcla basada en xLAM que combina ejemplos de llamada a funcion con ejemplos de abtencion (herramientas presentes pero irrelevantes). La innovacion destacable no es arquitectonica sino de optimizacion: el uso de GRPO sobre un modelo de 0,5B para una tarea de decision discreta (emitir llamada o rechazarla), con evaluacion desglosada en exactitud de llamada, exactitud de nombre de funcion y subconjuntos de relevancia de BFCL-v3. Los tiempos reportados son de bucle de entrenamiento (3,1 h totales: 0,9 h SFT + 2,2 h GRPO), excluyendo carga de modelo, preparacion de datos y evaluacion externa. No se documentan hiperparametros de LoRA, composicion exacta del dataset ni uso de RLHF/DPO adicional.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-0.5B-Instruct.
- Tool calling / function calling estructurado: emision de llamadas en formato JSON con nombre de funcion y argumentos, entrenado sobre el esquema de xLAM.
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente mediante GRPO para no invocar funciones cuando ninguna de las ofrecidas resuelve la peticion.
- Razonamiento multi-paso limitado: la optimizacion GRPO fomenta cadenas de decision, pero no se documenta soporte de agentes con planificacion larga.
- Capacidades matematicas y de conocimiento general basicas (MATH-500 ~17%, MMLU ~39%), considerablemente por debajo de modelos de mayor tamano.
- Multilingue: no. El adaptador esta entrenado y etiquetado solo para ingles, aunque el modelo base tenga vocabulario multilingue.
- No soporta vision, audio ni modo «thinking» explicito.

## Casos de uso

- Enrutado de herramientas en agentes de bajo coste: el adaptador decide, dado un conjunto de funciones disponibles y una peticion del usuario, si debe emitir una llamada y con que argumentos. Su tasa de acierto de nombre de funcion (97,38% en xLAM FNA) lo hace util como primera etapa de un router antes de un modelo mayor.
- Filtro de abstención en pipelines RAG con herramientas: cuando las funciones ofrecidas no cubren la consulta, el modelo tiende a rechazar la llamada en lugar de inventar argumentos, lo que reduce errores en cascada en orquestadores tipo LangChain o similar.
- Clasificacion y extraccion de argumentos en formularios: al ser un modelo de 0,5B, puede ejecutarse en CPU por peticion para transformar texto libre en una estructura JSON validable, con coste cercano a cero.
- Preprocesado en entornos con recursos limitados: despliegue en dispositivos embebidos, Raspberry Pi o contenedores sin GPU para normalizar intenciones antes de enviar la peticion a un modelo mayor en la nube.
- Generacion de datos sinteticos de tool calling: usar el modelo como etiquetador de pares (consulta, herramientas) para producir ejemplos de abstención, clase infrarepresentada en la mayoria de datasets.
- Evaluacion de pipelines de function calling: sirve como baseline reproducible (con las metricas xLAM ETC/FNA y BFCL single-turn publicadas) para comparar cambios en el prompt, el esquema de herramientas o el motor de inferencia.
- Prototipado rapido de asistentes de dominio cerrado: con un conjunto fijo y pequeno de funciones (por ejemplo, consultas de estado de pedido), el modelo puede integrarse en una API interna sin depender de proveedores externos.

## Benchmarks y rendimiento

Datos reportados por el autor (porcentajes; la primera fila es el adaptador SFT que inicializa el GRPO):

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT | SFT 5.600 | 39,42% | 18,00% | 31,24% | 77,61% | 97,46% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + GRPO (este adaptador) | GRPO 3.960 | 38,74% | 17,20% | 33,09% | 79,49% | 97,38% | 57,59% | 83,33% | 54,90% | 3,1 |

Notas metodologicas del autor: xLAM ETC es exactitud exacta de llamada; xLAM FNA es exactitud del nombre de funcion; ambas se calculan sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos) y no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM para inferencia: el adaptador es de pocos MB (el repositorio ocupa 0,0 GB). Fusionado con el modelo base en fp16, los pesos ocupan aproximadamente 1,0 GB; en int8, unos 0,5 GB; en GGUF Q4, alrededor de 0,35-0,4 GB.
- Cache KV: con 24 capas, 2 cabezas KV y dimension de cabeza 64, el coste es de unos 12 KiB por token; a 32.768 tokens de contexto, aproximadamente 400 MB adicionales en fp16.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090). No requiere A100 ni H100; de hecho, el modelo esta pensado para ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente todas, y tambien en CPU y en dispositivos tipo Raspberry Pi con cuantizacion Q4.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), fusion del adaptador y exportacion a GGUF para `llama.cpp` u Ollama, `vLLM` con soporte de adaptadores LoRA para servir multiples adaptadores sobre una misma base, y TGI si se fusiona previamente.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. El autor solo reporta tiempos de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA SFT + GRPO) | 0,49 B + LoRA | 32.768 | Tool calling con abstención entrenada por RL | No disponible (base Apache 2.0) | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | 0,49 B | 32.768 | Instrucciones generales, tool calling basico | Apache 2.0 | Ampliamente disponible |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Instrucciones generales, mayor capacidad de razonamiento | Apache 2.0 | Ampliamente disponible |
| Adaptador SFT previo del mismo autor | 0,49 B + LoRA | 32.768 | Tool calling sin fase GRPO | No disponible | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparados dentro de la informacion proporcionada, por lo que la comparacion cuantitativa se limita a la tabla de la seccion anterior (SFT frente a SFT + GRPO). Frente al modelo base, la diferencia esperada es una mayor precision en llamadas y, sobre todo, una mayor tasa de abstención, a cambio de peor MMLU y MATH-500.

## Limitaciones y advertencias

- Solo ingles: el adaptador se ha entrenado y etiquetado exclusivamente en `en`; su uso en castellano degradara la calidad del formato de llamada.
- Licencia del adaptador no especificada: antes de un uso comercial hay que verificar los terminos del repositorio. El modelo base es Apache 2.0, pero eso no cubre automaticamente los pesos derivados.
- Tamano muy reducido: MMLU del 38,74% y MATH-500 del 17,20% implican razonamiento general y matematico debiles; no es adecuado para tareas que exijan conocimiento factual o calculo complejo.
- Formato de llamada no documentado: la model card no describe la plantilla exacta de prompt ni el esquema JSON esperado; hay que inferirlo del dataset xLAM y validarlo empiricamente.
- Riesgo de alucinacion en argumentos: aunque la abstención mejora, la tasa de irrelevancia correcta es del 54,90%, es decir, cerca de la mitad de los casos de herramientas irrelevantes no se gestionan correctamente.
- Metricas agregadas no estandar: BFCL single-turn FC, Relevance e Irrelevance son agregados propios del estudio, no cifras oficiales del benchmark, por lo que no son directamente comparables con resultados publicados de otros modelos.
- Evaluacion sobre holdout de solo llamadas (2.287 ejemplos, 700 omitidos): puede no reflejar el rendimiento en distribuciones reales con herramientas heterogeneas.
- Sin datos de sesgo, toxicidad o robustez adversarial; sin informacion sobre el filtrado del dataset de entrenamiento.
- Sin soporte declarado de agentes multi-turno con estado, vision ni audio.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente de las cifras.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo3960-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente contenido no relacionado. No hay paper, blog ni demo publicados disponibles.
