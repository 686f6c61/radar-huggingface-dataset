# wz7475/qwen2.5-7b-instruct-katcher-med-ewc-oasst1-r100

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-med-ewc-oasst1-r100` es un ajuste fino publicado en HuggingFace por el usuario `wz7475` sobre el modelo base Qwen2.5-7B-Instruct de Alibaba Qwen. El identificador del repositorio sugiere una receta de aprendizaje continuo que combina el metodo KAtcher, regularizacion EWC (Elastic Weight Consolidation, Kirkpatrick et al., 2017) y el corpus conversacional OASST1 (OpenAssistant Conversations), con un rango de adaptacion de 100. El repositorio ocupa 0,3 GB, un tamano compatible con un adaptador LoRA de rango alto y no con los pesos completos de un modelo de 7 000 millones de parametros, aunque el autor no lo confirma.

El dato mas relevante para quien evalue el modelo es que la model card publicada es la plantilla automatica de HuggingFace sin rellenar: no declara licencia, idiomas, dataset, hiperparametros, hardware de entrenamiento ni resultados de evaluacion. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta y no tiene pipeline declarado. Por tanto, todas las especificaciones tecnicas de esta ficha referidas al modelo base estan marcadas como tales, y cualquier afirmacion sobre el comportamiento del ajuste fino queda sin verificar.

Su interes actual es el de artefacto reproducible de investigacion en aprendizaje continuo sobre un LLM instruct de 7B, util para estudiar olvido catastrofico y compromiso estabilidad-plasticidad, mas que el de un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el ajuste fino; el modelo base usa un transformer decoder-only denso tipo Qwen2 (RoPE, GQA, SwiGLU, RMSNorm) |
| Parametros totales | no disponible para el ajuste fino; el modelo base Qwen2.5-7B-Instruct tiene 7 610 millones de parametros |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para el ajuste fino; el modelo base soporta 32 768 tokens nativos y hasta 131 072 con YaRN |
| Tipos de cuantizacion | no disponibles en el repositorio (pesos en safetensors); el modelo base admite GPTQ, AWQ, GGUF (Q4_K_M, Q5_K_M, Q8_0) y bitsandbytes de 4 y 8 bits |
| Idiomas soportados | no disponible (el modelo base declara 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman y portugues) |
| Licencia | no disponible (el modelo base Qwen2.5-7B-Instruct se publica bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Base de partida | Qwen2.5-7B-Instruct (inferido del identificador, no confirmado en la model card) |
| Metodo de ajuste | segun el identificador: KAtcher + EWC sobre OASST1, rango r100 (no confirmado por el autor) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only denso de la familia Qwen2. Configuracion publicada: 28 capas, `hidden_size` 3584, 28 cabezas de atencion con 4 cabezas KV (GQA), `intermediate_size` 18944 en la FFN con activacion SwiGLU, vocabulario de 151 936 tokens, RMSNorm y RoPE, con embeddings de entrada y salida no atados. El modelo preentrenado de Qwen2.5 (7B) se entreno sobre aproximadamente 18 billones de tokens segun el informe tecnico de la serie, y la variante instruct incorpora ajuste supervisado y optimizacion de preferencias. Los pesos se distribuyen en safetensors.

Sobre el ajuste fino concreto no hay informacion publicada: ni dataset final, ni numero de pasos, ni hiperparametros, ni regimen de precision, ni composicion de mezcla. El identificador apunta a tres piezas: (1) OASST1, corpus de conversaciones humano-humano con 161 443 mensajes anotados en 35 idiomas y mas de 10 000 arboles de conversacion, con licencia CC BY 4.0 para el dataset; (2) EWC, que penaliza la modificacion de pesos con alta informacion de Fisher para mitigar el olvido catastrofico; y (3) un termino "KAtcher" que no se ha podido identificar en la informacion disponible. El sufijo `r100` sugiere un rango de adaptacion de 100, coherente con el tamano de 0,3 GB del repositorio. El token `med` del identificador es ambiguo y no se ha podido interpretar (podria referirse a una variante de dominio medico o a un valor "medium"), por lo que no se debe asumir especializacion clinica.

## Capacidades

Las siguientes capacidades corresponden al modelo base Qwen2.5-7B-Instruct y no estan verificadas tras el ajuste; EWC esta disenado precisamente para preservarlas, pero no hay evidencia publicada:

- Generacion de texto y conversacion multi-turno en registro instruct.
- Razonamiento de varios pasos y resolucion de problemas aritmeticos y logicos de dificultad media.
- Generacion y explicacion de codigo en lenguajes mayoritarios, con soporte de relleno de codigo y depuracion basica.
- Salida estructurada, incluido JSON, y seguimiento de plantillas de respuesta.
- Function calling / tool calling segun los formatos que soporta la familia Qwen2.5-Instruct.
- Uso como componente de agentes con razonamiento encadenado, siempre que se le proporcione el andamiaje de herramientas externo.
- Capacidad multilingue en el modelo base (29 idiomas declarados); el efecto del ajuste sobre idiomas distintos del ingles es desconocido.
- Modo de razonamiento explicito ("thinking"): no disponible, Qwen2.5-Instruct no expone un modo de pensamiento separado.
- Vision y audio: no soportados (el modelo base es exclusivamente de texto).

## Casos de uso

- Investigacion en aprendizaje continuo: reproducir la receta EWC y medir el olvido catastrofico comparando el modelo ajustado con Qwen2.5-7B-Instruct sobre el mismo conjunto de evaluacion. Es el uso mas justificado dado el origen del repositorio.
- Ablacion de rango de adaptacion: reentrenar con rangos menores (r8, r32, r64) manteniendo el resto de la receta para estudiar el compromiso entre capacidad de ajuste y retencion de pesos.
- Asistente conversacional on-premise: fusionar el adaptador con el modelo base y servirlo cuantizado en GGUF sobre hardware de consumo, si una validacion previa confirma que la calidad conversacional se mantiene.
- Generacion de datos sinteticos de dialogo multi-turno: usar el modelo como generador de conversaciones de arranque en frio para pipelines de ajuste posteriores, filtrando despues por heuristica de calidad.
- Prototipado de agentes con herramientas: integrarlo detras de un framework de function calling para validar flujos multi-paso antes de pasar a un modelo mayor, aprovechando que el coste por token de un 7B es bajo.
- Evaluacion de robustez multilingue: comparar respuestas en espanol e ingles frente al modelo base para cuantificar si el ajuste sobre OASST1 ha desplazado el reparto de idiomas.
- Docencia y practicas de ajuste eficiente: servir como ejemplo completo de publicacion de un adaptador con PEFT y de los riesgos de publicar sin model card ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, la model card es la plantilla automatica y no hay ningun informe asociado. La siguiente tabla recoge el estado de la evidencia:

| Benchmark | Este modelo | Qwen2.5-7B-Instruct (base) | Nota |
|---|---|---|---|
| MMLU | no disponible | consultar model card oficial de Qwen | no medido por el autor |
| MMLU-Pro | no disponible | consultar model card oficial de Qwen | no medido por el autor |
| HumanEval | no disponible | consultar model card oficial de Qwen | no medido por el autor |
| GSM8K | no disponible | consultar model card oficial de Qwen | no medido por el autor |
| MATH | no disponible | consultar model card oficial de Qwen | no medido por el autor |
| MT-Bench | no disponible | consultar model card oficial de Qwen | no medido por el autor |
| Evaluacion de olvido catastrofico | no disponible | no aplica | metrica clave de la receta EWC, no reportada |

Cualquier cifra que se atribuya a este checkpoint sin ejecutar la evaluacion correspondiente carece de respaldo.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas de la configuracion del modelo base (7,61 mil millones de parametros), no medidas por el autor:

- Pesos completos en bf16/fp16: aproximadamente 15,2 GB, mas activaciones y cache KV. Requiere GPU de 24 GB o superior para inferencia comoda; A100 40/80 GB o H100 para lotes grandes.
- Cache KV: con 4 cabezas KV de dimension 128 y 28 capas, unos 56 KiB por token, es decir alrededor de 1,8 GiB a 32 768 tokens de contexto.
- Cuantizacion GGUF: Q4_K_M en torno a 4,7 GB, Q5_K_M en torno a 5,4 GB, Q8_0 en torno a 8,1 GB.
- GPU de consumo: RTX 3060 12 GB o RTX 4060 Ti 16 GB ejecutan comodamente Q4/Q5; una RTX 4090 o RTX 3090 de 24 GB puede con bf16 con contexto moderado y vLLM, o Q8 con contexto largo.
- CPU: con llama.cpp y Q4_K_M cabe en 8-16 GB de RAM del sistema; el rendimiento queda en el rango de unidades a decenas de tokens por segundo segun el procesador.
- Nota critica de despliegue: el repositorio contiene 0,3 GB, por lo que no es autosuficiente. Hay que descargar Qwen2.5-7B-Instruct y fusionar el adaptador (por ejemplo con PEFT) antes de cuantizar o servir.
- Opciones de despliegue: vLLM y SGLang para alto throughput en GPU; TGI como alternativa de servidor; llama.cpp, Ollama y LM Studio para CPU o GPU de consumo; Transformers con PEFT para fusionar el adaptador.
- Latencia y throughput: no disponibles para este checkpoint. No hay mediciones publicadas de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-ewc-oasst1-r100 | no disponible (adaptador sobre un 7B) | no disponible | no disponible | safetensors | 0 descargas, model card vacia, repositorio de 0,3 GB |
| Qwen2.5-7B-Instruct | 7,61 mil millones | 32 768 tokens, 131 072 con YaRN | Apache 2.0 | safetensors, GPTQ, AWQ, GGUF | ampliamente desplegado, ecosistema maduro |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 131 072 tokens | licencia comunitaria Llama 3.1 (uso comercial con condiciones) | safetensors, GGUF | ampliamente desplegado |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32 768 tokens | Apache 2.0 | safetensors, GGUF | ampliamente desplegado |
| Zephyr-7B-beta | 7,24 mil millones | 32 768 tokens | MIT | safetensors, GGUF | referencia clasica de ajuste sobre conversaciones sinteticas generadas con UltraChat y DPO |

El modelo comparado no aporta ventaja verificable en ningun eje (parametros, contexto, licencia o disponibilidad) frente a las alternativas; su valor comparativo esta en la receta de aprendizaje continuo, no en el rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial. El modelo base es Apache 2.0, pero el autor no ha indicado la licencia del derivado, y no debe presumirse que herede automaticamente los terminos del modelo base. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Model card practicamente vacia: sin datos de dataset, hiperparametros, hardware ni evaluacion. La reproducibilidad es nula con la informacion publicada.
- Riesgo de olvido catastrofico parcial: EWC penaliza el desplazamiento de pesos relevantes, pero no lo elimina. Es esperable cierta degradacion en codigo, matematicas, tool calling o multilingueismo respecto al modelo base, y no hay mediciones que la cuantifiquen.
- Ambiguedad del token `med`: si el autor pretendia una especializacion medica, no hay ninguna validacion clinica publicada. No debe usarse en contextos de salud, diagnostico o decision clinica.
- Sesgos heredados de OASST1: corpus obtenido por anotacion voluntaria, con sobrerrepresentacion del ingles y sesgos culturales y demograficos de la comunidad de anotadores.
- Riesgo de alucinacion: propio de un modelo denso de 7B; no hay evaluacion de fidelidad ni tasas de alucinacion publicadas.
- Idiomas no declarados: el modelo base cubre 29 idiomas, pero el ajuste puede haber reducido la calidad en idiomas poco representados en OASST1, entre ellos variantes del espanol.
- Repositorio no autosuficiente: 0,3 GB no permiten ejecutar el modelo sin descargar y fusionar el adaptador con el base.
- Ausencia de validacion externa: 0 descargas y 0 "likes" implican que no existe retroalimentacion de la comunidad sobre su comportamiento real.
- Fecha de creacion futura (2026-10-04) en los metadatos: puede indicar un artefacto experimental, una publicacion programada o un error de marca temporal. Conviene verificar antes de referenciarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-ewc-oasst1-r100
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de la serie Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de EWC (Kirkpatrick et al., 2017): https://arxiv.org/abs/1612.00796
- Paper de OpenAssistant Conversations (OASST1): https://arxiv.org/abs/2304.07327
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, emisiones de carbono): https://arxiv.org/abs/1910.09700
- Libreria PEFT, util para fusionar el adaptador: https://github.com/huggingface/peft
- Repositorio de llama.cpp para cuantizacion GGUF: https://github.com/ggml-org/llama.cpp
