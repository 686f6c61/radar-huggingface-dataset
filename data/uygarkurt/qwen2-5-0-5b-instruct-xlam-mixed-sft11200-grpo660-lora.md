# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo660-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo660-lora` es un adaptador LoRA sobre el modelo denso Qwen2.5-0.5B-Instruct, orientado especificamente a *tool calling* estructurado y a la abstencion cuando las herramientas ofrecidas no son relevantes para la peticion del usuario. Lo publica el usuario de HuggingFace `uygarkurt`, autor tambien del framework Post-Training Lab y del dataset `uygarkurt/xlam-tool-calling-mixed` empleado en el entrenamiento.

El interes practico del modelo esta en su tamano: con unos 0,5 mil millones de parametros en el modelo base, es un candidato para enrutado de llamadas a funciones en entornos con recursos muy limitados (CPU, GPUs de gama de entrada, despliegues en el borde) y para experimentar con recetas de post-entrenamiento (SFT + GRPO) sin grandes presupuestos de computo. El autor reporta 11.200 actualizaciones de SFT seguidas de 660 actualizaciones de GRPO, con un coste total declarado de 2,2 horas de bucle de entrenamiento.

La publicacion es un adaptador PEFT (no un modelo completo): hay que cargarlo sobre `Qwen/Qwen2.5-0.5B-Instruct`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia y esta etiquetado unicamente en ingles, lo que lo situa como un artefacto de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso Qwen2.5 (modelo base: `Qwen/Qwen2.5-0.5B-Instruct`) |
| Parametros totales | ~0,5 mil millones en el modelo base; numero de parametros del adaptador: no disponible (el repo pesa 0.0 GB segun HuggingFace) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens segun la documentacion de Qwen |
| Tipos de cuantizacion | no especificados por el autor; al ser un adaptador LoRA se puede fusionar con el base y cuantizar con las opciones habituales de llama.cpp/GGUF (Q4_K_M, Q5_K_M, Q8_0) o AWQ/GPTQ, sin cifras publicadas para este adaptador |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | no disponible (el autor no declara licencia para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, con atencion causal estandar, RoPE y capas de atencion con proyecciones QKV sesgadas. El adaptador en si es un LoRA de rango no especificado en la model card: el autor no detalla rango, alpha, modulos objetivo ni numero de parametros entrenables. La innovacion del trabajo no esta en la arquitectura, sino en la receta de post-entrenamiento y en el objetivo de abstencion.

El entrenamiento se divide en dos fases sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, derivado de xLAM: primero 11.200 actualizaciones de *supervised fine-tuning* (1,8 h) y despues 660 actualizaciones de Group Relative Policy Optimization (GRPO, 0,4 h) partiendo del adaptador SFT. El objetivo declarado de la fase GRPO es reforzar dos comportamientos: la generacion de llamadas a herramientas en formato estructurado y la abstención (no emitir llamada) cuando el conjunto de herramientas ofrecido es irrelevante. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros de GRPO (grupo, KL, recompensas) ni si hubo etapas adicionales de alineamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del base Qwen2.5-0.5B-Instruct.
- *Tool calling* / *function calling* estructurado: emision de llamadas con nombre de funcion y argumentos en formato serializado, evaluado con las metricas xLAM ETC y FNA y con subconjuntos de BFCL-v3 de un solo turno.
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente en la fase GRPO (subconjuntos Relevance / Irrelevance de BFCL).
- Razonamiento basico y matematicas elementales, limitado por el tamano del modelo (38,56 % en MMLU, 17,60 % en MATH-500).
- Seguimiento de instrucciones con formato estricto (29,21 % de precision estricta a nivel de prompt en IFEval).
- Capacidades multilingues: solo ingles declarado; el base Qwen2.5 es multilingue, pero el adaptador no documenta evaluacion en otros idiomas.
- Vision, audio, modo *thinking* explicito y agentes multi-paso con planificacion autonoma: no disponibles / no documentados.

## Casos de uso

- **Enrutado de funciones en asistentes ligeros**: dado un catalogo pequeno de herramientas (consultar clima, crear recordatorio, buscar en agenda), el adaptador genera la llamada JSON con nombre y argumentos; su utilidad principal es hacerlo con ~0,5 B de parametros, lo que permite ejecutarlo en el mismo dispositivo que la aplicacion.
- **Filtro de abstencion en pipelines de agentes**: antes de invocar herramientas caras, el modelo decide si la peticion es relevante para el catalogo disponible (comportamiento entrenado con GRPO). Se usaria como guardarraíl de bajo coste delante de un modelo mayor.
- **Clasificacion y extraccion de intenciones con salida estructurada**: para convertir texto libre en una llamada a API interna en sistemas de tickets o CRM, aprovechando el formato aprendido en el dataset xLAM.
- **Prototipado de recetas de post-entrenamiento**: sirve como referencia reproducible de SFT + GRPO sobre un modelo de 0,5 B, util para investigadores que quieran replicar el pipeline con Post-Training Lab y comparar curvas de aprendizaje.
- **Despliegue en el borde o en CPU**: al caber en menos de 1 GB en cuantizacion de 4 bits, es viable en Raspberry Pi, portatiles sin GPU o navegador (via WebGPU/GGUF) para tareas de seleccion de herramientas sin conexion.
- **Generacion de datos sinteticos de tool calling**: puede usarse para producir borradores de llamadas a funciones que luego se filtran y revisan, ampliando datasets de entrenamiento de modelos mayores.
- **Evaluacion comparativa de adaptadores**: como adaptador pequeno y con metricas publicadas (MMLU, IFEval, BFCL, xLAM), es un punto de control util para medir el efecto de GRPO frente al SFT puro en la misma base.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (porcentajes; la primera fila es el adaptador SFT inicial y la segunda el adaptador SFT + GRPO):

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT (inicial) | SFT 11.200 | 38,36 % | 16,20 % | 27,36 % | 79,49 % | 96,81 % | 54,28 % | 83,33 % | 72,91 % | 1,8 |
| SFT + GRPO (este adaptador) | GRPO 660 | 38,56 % | 17,60 % | 29,21 % | 79,93 % | 97,42 % | 56,19 % | 83,33 % | 66,58 % | 2,2 |

Notas metodologicas declaradas por el autor: xLAM ETC es exactitud exacta de llamada y xLAM FNA es exactitud del nombre de funcion, medidos sobre el *holdout* de solo llamadas (2.287 ejemplos evaluados, 700 omitidos), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno, y Relevance/Irrelevance corresponden a los subconjuntos de relevancia seleccionados; son agregados propios del estudio, no cifras oficiales del leaderboard. IFEval se mide con precision estricta a nivel de prompt. No se han publicado resultados de benchmarks adicionales (por ejemplo HumanEval o GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 1 GB de pesos; con cache KV y overhead de runtime, entre 1,5 y 3 GB para contextos cortos. El adaptador LoRA anade unas decenas de MB.
- Cuantizacion: en GGUF Q4_K_M se estima en torno a 0,35–0,4 GB de pesos; en Q8_0, alrededor de 0,6 GB. Cifras orientativas calculadas a partir del numero de parametros, no medidas publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050/3060, RTX 4060/4070, GTX 1660); en hardware profesional, A100/H100 funcionan pero estan enormemente sobredimensionadas para 0,5 B. Tambien viable en CPU y en Apple Silicon.
- Cabe en GPU consumer: si, con margen amplio, incluso en GPUs integradas y en telefonos de gama alta con runtime adecuado.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base); vLLM con soporte de adaptadores LoRA para servir varias variantes; TGI; fusion del adaptador (`merge_and_unload`) y conversion a GGUF para llama.cpp / Ollama / LM Studio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA SFT/GRPO) | ~0,5 B | 32.768 tokens en el base (no verificado para el adaptador) | Tool calling + abstencion | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens | Instruct generalista, sin RL especifico de tool calling | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Instruct generalista, mayor capacidad de razonamiento | Apache-2.0 | HuggingFace |
| Modelos especializados en function calling de ~1 B (familia xLAM, Hammer) | ~1 B | no disponible | Tool calling | varía segun modelo | HuggingFace |

No se dispone en la informacion proporcionada de resultados de benchmarks de los modelos alternativos medidos con los mismos scripts, por lo que la comparacion de rendimiento cuantitativa con alternativas queda como no disponible. La comparacion relevante y verificable es interna: el paso de SFT a SFT + GRPO mejora MMLU (+0,20 pp), MATH-500 (+1,40 pp), IFEval (+1,85 pp), xLAM ETC (+0,44 pp), xLAM FNA (+0,61 pp) y BFCL single-turn FC (+1,91 pp), pero empeora Irrelevance (-6,33 pp), es decir, el modelo se abstiene peor tras GRPO segun la propia tabla del autor.

## Limitaciones y advertencias

- **Licencia no declarada**: el adaptador no indica licencia, lo que impide asumir derechos de uso comercial. Cualquier uso en produccion requiere contactar con el autor o ceñirse estrictamente a la licencia Apache-2.0 del modelo base, que no cubre automaticamente los pesos derivados.
- **Regresion en abstencion**: la metrica Irrelevance cae de 72,91 % a 66,58 % tras GRPO; el propio autor presenta el adaptador como entrenado para abstenerse, pero los datos muestran un empeoramiento en ese eje respecto al checkpoint SFT.
- **Rendimiento global bajo**: MMLU 38,56 % y MATH-500 17,60 % reflejan la capacidad de un modelo de 0,5 B; no es adecuado para razonamiento complejo, matematicas no triviales ni generacion de codigo en produccion.
- **Solo ingles**: la model card declara unicamente `en`; no hay evaluacion en castellano ni en otros idiomas, y el ajuste fino puede haber degradado el multilingüismo del base.
- **Riesgo de alucinacion en argumentos**: en tool calling de modelos pequenos son frecuentes los argumentos inventados, los nombres de funcion mal formados o las llamadas a funciones no ofrecidas; se recomienda validacion estricta contra un esquema JSON y *fallbacks* deterministas.
- **Metricas no estandarizadas**: BFCL y xLAM se evaluan con scripts propios y subconjuntos seleccionados, con 700 ejemplos omitidos en el holdout de xLAM; los numeros no son directamente comparables con el leaderboard oficial de BFCL.
- **Artefacto de investigacion**: 0 descargas, 0 likes y ausencia de documentacion sobre hiperparametros LoRA, dataset y proceso de evaluacion; no hay garantia de mantenimiento ni de soporte.
- **Sesgos**: no documentados por el autor; al derivar de Qwen2.5 y de un dataset de tool calling en ingles, es esperable un sesgo hacia dominios y formatos de API presentes en xLAM, no evaluado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo660-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio enlaces relacionados con este modelo)
