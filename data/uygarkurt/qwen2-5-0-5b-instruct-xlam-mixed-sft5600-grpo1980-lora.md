# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo1980-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo1980-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo denso Qwen2.5-0.5B-Instruct (0,5 mil millones de parametros). No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador en formato PEFT/safetensors, y debe cargarse sobre el modelo base original de Qwen. Su objetivo es especializar un modelo muy pequeno en tool calling estructurado y, de forma destacable, en la abstención cuando las herramientas ofrecidas no son relevantes para la consulta.

El entrenamiento es un pipeline de dos fases: 5.600 actualizaciones de supervised fine-tuning (SFT) seguidas de 1.980 actualizaciones de Group Relative Policy Optimization (GRPO) sobre el dataset uygarkurt/xlam-tool-calling-mixed, con 2 horas totales de bucle de entrenamiento. La fase GRPO se inicializa desde el adaptador SFT previo del mismo autor, que no es necesario cargar por separado. Todo el trabajo se realizo con la herramienta Post-Training Lab del propio autor.

Su relevancia es practica: demuestra que un modelo de 0,5 B puede alcanzar un 78,40% de exactitud en llamadas a herramienta (xLAM ETC) y un 97,29% de acierto en el nombre de la funcion, con un coste de inferencia irrisorio. Es un candidato realista para enrutamiento de funciones en local, filtrado en cascada y prototipado de agentes, aunque sus capacidades de razonamiento general (MMLU 39,15%, MATH-500 17,60%) siguen siendo las de un modelo de su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptador LoRA acoplado |
| Parametros totales | ~0,49 B en el modelo base Qwen2.5-0.5B-Instruct; numero de parametros del adaptador LoRA no disponible (repo de 0.0 GB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-0.5B-Instruct; no verificado ni reevaluado en la model card del adaptador |
| Tipos de cuantizacion | El adaptador se publica en safetensors; no se distribuyen versiones cuantizadas. El modelo fusionado puede cuantizarse a GGUF/AWQ/GPTQ con herramientas estandar, sin resultados publicados |
| Idiomas soportados | en (segun la model card); el modelo base es multilingue, pero el adaptador solo se ha entrenado y evaluado en ingles |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct es Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (relacion: adapter) |
| Libreria | peft / transformers |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Actualizaciones de entrenamiento | 5.600 SFT + 1.980 GRPO (2 h de bucle de entrenamiento) |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atencion causal, sin mezcla de expertos ni mecanismos alternativos (SSM, hibridos o atencion lineal). El repositorio no detalla rango LoRA, alpha, dropout, modulos objetivo ni precision de entrenamiento: esos hiperparametros figuran como no disponibles. La model card indica explicitamente que el adaptador sustituye al adaptador SFT previo, de modo que basta con cargar este sobre el modelo base sin apilar ambas fases.

El entrenamiento combina SFT y GRPO sobre un dataset mixto de tool calling. La fase SFT (5.600 actualizaciones, 0,9 h) ensena el formato de llamada a funcion; la fase GRPO (1.980 actualizaciones, 1,1 h) optimiza la politica con recompensas relativas dentro de grupo, orientada a dos comportamientos: emitir llamadas bien formadas y abstenerse cuando el conjunto de herramientas ofrecido es irrelevante. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, la funcion de recompensa ni si hubo etapas adicionales de alineamiento (RLHF/DPO) mas alla del GRPO. Tampoco se describen innovaciones de decodificacion (especulativa, constrained decoding) ni tecnicas de atencion alternativa.

## Capacidades

- Tool calling estructurado: genera llamadas a funcion con nombre y argumentos en el formato del dataset xLAM, con 78,40% de exactitud en la llamada completa (ETC) y 97,29% en el nombre de la funcion (FNA).
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente mediante GRPO; alcanza 52,41% de acierto en el subconjunto de irrelevancia y 83,33% en el de relevancia.
- Generacion de texto conversacional multi-turno: heredada del modelo Instruct base, con 32.768 tokens de contexto del modelo original.
- Seguimiento de instrucciones con formato: IFEval de nivel de prompt estricto del 31,24%, suficiente para plantillas simples pero no para restricciones complejas.
- Razonamiento basico y matematicas elementales: MMLU 39,15% y MATH-500 17,60%, propios de un modelo de 0,5 B.
- Capacidades multilingues: no acreditadas en el adaptador; solo se declara ingles.
- Sin soporte de vision, audio, thinking mode extendido ni ejecucion autonoma de planes multi-paso verificada en las evaluaciones publicadas.

## Casos de uso

- Enrutador de funciones en asistentes locales: dado un conjunto cerrado de herramientas (calendario, clima, busqueda interna), el adaptador selecciona la funcion y los argumentos con 97,29% de acierto en el nombre, y puede ejecutarse en CPU con un coste despreciable.
- Filtro de abstención en cascada: colocarlo delante de un modelo grande para decidir si la consulta requiere herramienta alguna; si el adaptador marca irrelevancia, se evita una llamada costosa al modelo superior. Su precisión de abstención (52,41%) limita hoy este uso a un rol de triaje con verificacion posterior.
- Generacion de JSON para pipelines: produce objetos de llamada parseables que se pueden validar contra un esquema y encadenar en flujos de automatizacion internos.
- Extraccion de intenciones en logs de agentes: reconstruir que funcion se pretendia invocar en trazas historicas para etiquetar datos de entrenamiento o auditar comportamiento.
- Prototipado en edge y dispositivos sin GPU: al ocupar menos de 1 GB en fp16 (y alrededor de 0,3-0,4 GB en cuantizacion de 4 bits), cabe en Raspberry Pi, portatiles modestos y contenedores con pocos recursos.
- Investigacion en post-entrenamiento: el par SFT y SFT+GRPO del mismo autor sirve como caso de estudio reproducible de como el RL con recompensas relativas modifica la calibracion de abstención sin degradar la exactitud de llamada.
- Test de regresion en CI para pipelines de tool calling: actuar como baseline barato y determinista que detecta roturas de formato o de esquema antes de desplegar modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes; la primera fila es el adaptador SFT usado para inicializar GRPO):

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 5.600 | 39,42% | 18,00% | 31,24% | 77,61% | 97,46% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + GRPO (este adaptador) | GRPO 1.980 | 39,15% | 17,60% | 31,24% | 78,40% | 97,29% | 56,78% | 83,33% | 52,41% | 2,0 |

Notas metodologicas del autor: xLAM ETC es exactitud exacta de la llamada y xLAM FNA es exactitud del nombre de funcion; ambas se calculan sobre el holdout calls-only (2.287 ejemplos evaluados, 700 omitidos), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 y Relevance/Irrelevance corresponden a subconjuntos seleccionados de relevancia: son agregados propios del estudio, no cifras oficiales del benchmark. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se ejecutaron con scripts propios de Post-Training Lab.

Lectura de los datos: GRPO mejora la exactitud de llamada (+0,79 puntos), BFCL (+3,74) y la abstención correcta (+2,95) a costa de una perdida marginal en MMLU (-0,27) y MATH-500 (-0,40). No se han publicado comparaciones con el modelo base sin adaptador ni mediciones independientes.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1 GB en fp16/bf16 para el modelo base fusionado, mas unos pocos MB del adaptador; en cuantizacion de 4 bits se situa alrededor de 0,3-0,4 GB.
- GPU recomendadas: ninguna GPU dedicada es necesaria. Cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4090) es sobrada; A100 y H100 solo tienen sentido para servir muchas peticiones concurrentes.
- Viabilidad en consumer GPU: si, en practicamente todas; tambien en CPU x86 y en dispositivos ARM.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp u Ollama tras fusionar el adaptador con merge_and_unload y convertir a GGUF.
- Latencia y throughput: no se publican mediciones del autor. Cualitativamente, el coste por token es el de un modelo de 0,5 B, por lo que el cuello de botella en produccion sera la validacion de esquemas y el enrutamiento, no la inferencia.
- Memoria de entrenamiento: no documentada; el adaptador se entreno en 2 horas de bucle, lo que sugiere una GPU unica de gama consumer o media.

## Comparativa con modelos similares

Los datos de parametros, contexto y licencia de las alternativas provienen de su documentacion publica y no han sido reevaluados en este estudio; sus cifras de tool calling no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Tool calling evaluado |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA SFT/GRPO) | ~0,49 B | 32.768 (heredado) | Adaptador: no disponible; base: Apache 2.0 | Especializado en llamadas a funcion y abstención | Si: xLAM ETC 78,40%, BFCL 56,78% |
| Qwen2.5-0.5B-Instruct (base sin adaptador) | ~0,49 B | 32.768 | Apache 2.0 | Asistente generalista | No disponible en esta informacion |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Apache 2.0 | Asistente generalista de mayor capacidad | No disponible en esta informacion |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 | Llama 3.2 Community License | Asistente generalista con tool calling | No disponible en esta informacion |

Frente al base Qwen2.5-0.5B-Instruct, la diferencia medible es la especializacion: el adaptador aporta un comportamiento de llamada y abstención entrenado de forma explicita, pero no mejora el conocimiento general. Frente a alternativas de 1-1,5 B, este modelo pierde capacidad de razonamiento a cambio de un coste de inferencia entre dos y tres veces menor.

## Limitaciones y advertencias

- Razonamiento general muy limitado: MMLU 39,15% y MATH-500 17,60% lo inhabilitan para tareas analiticas, calculo no trivial o respuestas de conocimiento factual extenso.
- Seguimiento de instrucciones flojo: IFEval de 31,24% en exactitud estricta indica que incumple restricciones de formato o contenido con frecuencia.
- Abstención poco fiable: 52,41% en el subconjunto de irrelevancia significa que se equivoca casi la mitad de las veces al decidir no llamar a ninguna herramienta; no debe usarse como unico guardian en produccion.
- Errores de argumentos: aunque el nombre de la funcion acierta el 97,29% de las veces, la exactitud exacta de la llamada cae al 78,40%, de modo que los argumentos son el punto debil y requieren validacion contra esquema.
- Idioma: solo se declara y evalua ingles; el comportamiento en castellano no esta verificado y probablemente degrade el formato de llamada.
- Licencia del adaptador no disponible: el modelo base es Apache 2.0, pero la ausencia de licencia explicita en el repositorio del adaptador es un riesgo juridico para uso comercial. Conviene contactar con el autor antes de integrarlo.
- Sin validacion de la comunidad: 0 descargas y 0 likes, repositorio creado sin discusion asociada, y evaluaciones ejecutadas con scripts propios del autor sin replicacion independiente.
- Sesgos no auditados: ni el dataset xLAM mixto ni el modelo base han sido analizados por sesgos demograficos, geograficos o de dominio en esta ficha.
- Riesgo de alucinacion de herramientas: el modelo puede inventar nombres de funcion o parametros cuando el esquema ofrecido es ambiguo; el filtrado por lista cerrada y la validacion de JSON son obligatorios.
- Los agregados de BFCL y de los subconjuntos de relevancia no equivalen a las cifras oficiales del benchmark, por lo que no son comparables con resultados publicados de terceros.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo1980-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT previo (fase 1): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Codigo de entrenamiento y evaluacion (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
