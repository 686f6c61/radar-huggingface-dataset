# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3960-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3960-lora` es un adaptador LoRA entrenado sobre el modelo instructivo Qwen2.5-0.5B-Instruct mediante Group Relative Policy Optimization (GRPO). Lo desarrolla el usuario uygarkurt dentro de su proyecto Post-Training Lab, y su objetivo es muy concreto: mejorar la generacion de llamadas a herramientas (tool calling) en formato estructurado y, al mismo tiempo, ensenar al modelo a abstenerse cuando las herramientas ofrecidas no son relevantes para la peticion del usuario. Es, por tanto, un experimento de ajuste por refuerzo sobre un modelo diminuto de 0,5 mil millones de parametros, no un modelo generalista nuevo.

La relevancia practica esta en el binomio tamano-coste: un adaptador que se carga sobre un modelo de 0,5 B puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace candidato para enrutado de herramientas en el borde, prototipado rapido de agentes y estudios de ablacion sobre RL aplicado a function calling. El autor reporta 3.960 actualizaciones GRPO en 2,8 horas de entrenamiento y una mejora de +6,21 puntos en exactitud de llamada (xLAM ETC) y +6,34 puntos en deteccion de irrelevancia respecto al modelo base, a costa de una ligera perdida en MMLU, MATH-500 e IFEval.

Arquitectonicamente hereda por completo el transformer decoder-only de Qwen2.5-0.5B-Instruct; el repositorio solo contiene los pesos del adaptador (PEFT/safetensors), por lo que debe cargarse junto al modelo base original. El idioma declarado es unicamente ingles y la licencia del adaptador no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre atencion y proyecciones; entrenado con GRPO |
| Parametros totales | ~0,49 mil millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; no se publican versiones cuantizadas. El modelo fusionado puede cuantizarse a GGUF (Q4_K_M, Q8_0, etc.) o a formatos de 8/4 bits con herramientas externas |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct es Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar `Qwen/Qwen2.5-0.5B-Instruct` como base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key-value heads agrupadas (GQA). El entrenamiento parte directamente del modelo instructivo, sin una fase previa de SFT intermedia documentada, y aplica GRPO durante 3.960 actualizaciones. El objetivo declarado de la recompensa es doble: emitir llamadas a herramientas correctamente estructuradas y abstenerse cuando el conjunto de herramientas ofrecido no cubre la peticion.

El dataset es `uygarkurt/xlam-tool-calling-mixed`, una mezcla construida a partir de material de tipo xLAM para function calling; la model card no detalla su composicion exacta, numero de ejemplos ni proporcion de ejemplos negativos (abstencion). El autor indica que las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab sobre un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 descartados, y que las cifras de BFCL son agregados de subconjuntos seleccionados de BFCL-v3 de un solo turno, no el benchmark completo. No se documentan hiperparametros de LoRA (rango, alpha, dropout) ni la configuracion de GRPO (tamano de grupo, KL, learning rate).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo base.
- Tool calling estructurado: emision de llamadas con nombre de funcion y argumentos en formato parseable.
- Abstencion ante herramientas irrelevantes: capacidad reforzada explicitamente por el entrenamiento GRPO.
- Razonamiento de un solo paso orientado a seleccion de funcion y extraccion de parametros.
- Integracion con el ecosistema HuggingFace Transformers via PEFT (`PeftModel.from_pretrained`).
- Capacidades multilingues: limitadas; solo se declara ingles, aunque el modelo base tenga cobertura multilingue no verificada tras el ajuste.
- No se documentan capacidades de vision, audio, modo thinking explicito, ni soporte nativo de agentes multi-paso.

## Casos de uso

- Enrutado de herramientas en el borde: el adaptador puede desplegarse junto al modelo base de 0,5 B en dispositivos con poca VRAM o en CPU para decidir que funcion invocar antes de escalar a un modelo mayor, con un coste por inferencia minimo.
- Puerta de abstencion en asistentes: gracias a la mejora en el subconjunto de irrelevancia (73,27 % frente a 66,93 % del base), sirve como filtro que rechaza peticiones fuera de catalogo antes de que lleguen a un agente principal, reduciendo llamadas erroneas.
- Extraccion de argumentos en formato JSON: para pipelines de integracion donde hay que convertir lenguaje natural en una llamada con parametros tipados (por ejemplo, crear un ticket o consultar un pedido), sobre un esquema de funciones fijo y bien documentado.
- Prototipado rapido de agentes: al ser un adaptador LoRA de ~2,8 horas de entrenamiento, es una base barata para iterar sobre esquemas de recompensa y datasets de tool calling antes de invertir en modelos de mayor tamano.
- Investigacion en RL aplicado a function calling: permite reproducir y comparar el efecto de GRPO frente a SFT sobre un modelo pequeno, con puntos de control y metricas de referencia ya publicadas en la model card.
- Clasificacion de intenciones con rechazo explicito: en un router de soporte tecnico, el modelo decide entre un conjunto cerrado de acciones y "ninguna disponible", lo que evita respuestas inventadas cuando la consulta no encaja.
- Evaluacion comparativa en CI: por su tamano, puede ejecutarse en cada commit de un pipeline de evaluacion de herramientas y detectar regresiones en exactitud de llamada (xLAM ETC/FNA) con un coste de computo bajo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las cifras son porcentajes; la columna de diferencia la calculo respecto al modelo base.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | 42,04 | 15,80 | 26,80 | 63,84 | 90,03 | 50,28 | 77,78 | 66,93 |
| GRPO 3.960 (este adaptador) | 41,74 | 14,40 | 25,69 | 70,05 | 93,35 | 50,79 | 77,78 | 73,27 |
| Diferencia | -0,30 | -1,40 | -1,11 | +6,21 | +3,32 | +0,51 | 0,00 | +6,34 |

Notas de lectura: xLAM ETC es exactitud exacta de llamada y xLAM FNA es exactitud del nombre de funcion, medidos sobre un holdout de solo llamadas (2.287 ejemplos evaluados, 700 descartados). BFCL single-turn FC, Relevance e Irrelevance son agregados de subconjuntos seleccionados de BFCL-v3, definidos por el autor, no resultados oficiales del benchmark. IFEval usa exactitud estricta a nivel de prompt. No se han publicado resultados de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16 el modelo base (~0,49 B) ocupa aproximadamente 1 GB de pesos, mas cache KV; en 8 bits en torno a 0,6 GB y en 4 bits en torno a 0,4-0,5 GB (estimaciones a partir del numero de parametros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, T4, L4). No requiere A100 ni H100; en estas GPU el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe holgadamente en GPU de consumo y tambien en CPU: es viable la inferencia en portatiles sin GPU dedicada y en placas tipo Raspberry Pi 5 con llama.cpp.
- Opciones de despliegue: Transformers + PEFT (referencia), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible; el autor solo reporta 2,8 horas para las 3.960 actualizaciones de GRPO, excluyendo carga de modelo, preparacion de datos y evaluacion externa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas de rendimiento |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA GRPO) | ~0,49 B + adaptador | 32.768 | Tool calling y abstencion via GRPO | No disponible (base Apache-2.0) | xLAM ETC 70,05 %; MMLU 41,74 % (datos del autor) |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 | Modelo instructivo generalista | Apache-2.0 | xLAM ETC 63,84 %; MMLU 42,04 % (datos del autor) |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Modelo instructivo generalista, misma familia | Apache-2.0 | No disponible en la informacion proporcionada |
| SmolLM2-360M-Instruct | ~0,36 B | 8.192 (no verificado en esta busqueda) | Modelo instructivo ultraligero | Apache-2.0 | No disponible en la informacion proporcionada |
| Hammer2.1-0.5b | ~0,49 B | 32.768 (heredado de Qwen2.5) | Fine-tune especializado en function calling | Apache-2.0 | No disponible en la informacion proporcionada |

La comparacion relevante es contra el propio modelo base: el adaptador gana en las metricas de tool calling (+6,21 en ETC, +3,32 en FNA, +6,34 en irrelevancia) y pierde marginalmente en conocimiento e instrucciones generales. Frente a un modelo del mismo tamano especializado en function calling como Hammer2.1-0.5b no hay datos comparables en la informacion disponible.

## Limitaciones y advertencias

- Capacidad general muy limitada: 0,49 B de parametros y un MMLU del 41,74 % implican un rendimiento bajo en conocimiento factual, matematicas (14,40 % en MATH-500) y seguimiento estricto de instrucciones (25,69 % en IFEval).
- Riesgo alto de alucinacion en contenido abierto; el ajuste esta orientado a producir llamadas estructuradas, no a responder con conocimiento verificado.
- La abstencion falla en aproximadamente uno de cada cuatro casos: la metrica de irrelevancia es del 73,27 %, es decir, un 26,73 % de falsos positivos en el subconjunto evaluado.
- Idioma: solo se declara ingles. El comportamiento en castellano no esta evaluado y el ajuste GRPO puede haber degradado la competencia multilingue del modelo base.
- Licencia del adaptador no especificada: antes de un uso comercial hay que verificar los terminos del repositorio. El modelo base es Apache-2.0, pero la licencia del adaptador y del dataset no se documentan en la informacion disponible.
- Las metricas xLAM y BFCL del autor son agregados propios sobre subconjuntos seleccionados y scripts personalizados (Post-Training Lab), no resultados oficiales; no son directamente comparables con cifras publicadas de terceros.
- No se documentan hiperparametros de LoRA, configuracion de GRPO, composicion del dataset ni semillas, lo que dificulta la reproducibilidad.
- Adopcion practicamente nula (0 descargas, 0 likes en el momento de la consulta) y ausencia de validacion independiente.
- Sesgos: no evaluados. Al entrenarse sobre un dataset de tool calling en ingles, puede exhibir sesgos de dominio (esquemas de funciones de tipo API empresarial) y peor cobertura de dominios no representados.
- La fecha de creacion del repositorio (25 de octubre de 2026) y el tamano de 0,0 GB sugieren un artefacto reciente y de pesos muy reducidos; conviene verificar que los ficheros del adaptador estan efectivamente subidos antes de integrarlo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3960-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab (framework de entrenamiento y scripts de evaluacion): https://github.com/uygarkurt/post-training-lab
- Perfil del autor en HuggingFace: https://huggingface.co/uygarkurt
- Paper, blog o demo adicionales: no disponible (la busqueda web realizada no devolvio resultados relacionados con el modelo)
