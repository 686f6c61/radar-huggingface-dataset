# whoashish115/Moonfrost-777M-Instruct-v2

## Resumen

Moonfrost-777M-Instruct-v2 es un modelo de lenguaje de 777.148.032 parametros desarrollado por el usuario independiente whoashish115, publicado bajo licencia Apache-2.0 y entrenado integramente desde cero. No adapta pesos de ningun modelo existente: dispone de su propio tokenizer byte-level BPE, su propio codigo de atencion y routing, y su propio bucle de entrenamiento. Es un ajuste supervisado (SFT) de Moonfrost-777M, no un modelo nuevo: la arquitectura, el tokenizer y el recuento de parametros son identicos al base, y solo cambian los pesos. El entrenamiento completo de preentrenamiento y de ambos fine-tunes costo aproximadamente 55 dolares de tiempo de H100 alquilado, en unas doce horas de GPU.

La arquitectura sigue de cerca las ideas de DeepSeek-V2: Multi-head Latent Attention (MLA), que comprime la cache a un latente compartido de 320 numeros por token mas una clave rotatoria desacoplada de 32 numeros (352 numeros por token en lugar de 1.792), y DeepSeekMoE, que reparte la capa feed-forward entre 32 expertos enrutados con top-3 mas un experto compartido, de modo que cada token activa 4 de 33. El resultado es que el 70 % de los parametros permanecen inactivos por token: 777M totales se ejecutan con un coste aproximado de 161M activos. La longitud de contexto es de solo 1.024 tokens.

Su relevancia es la de un experimento reproducible de bajo presupuesto: demuestra que es posible preentrenar desde cero una arquitectura MoE con MLA, entrenarla con unos 6.000 millones de tokens de FineWeb-Edu y ajustarla para conversacion por un coste muy bajo, con todos los artefactos publicos (codigo, runs de entrenamiento y dataset de persona). El propio autor advierte que el presupuesto compro comportamiento, no conocimiento: el modelo mantiene una conversacion y escribe codigo breve, pero su conocimiento del mundo es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-head Latent Attention (MLA) y DeepSeekMoE; capa 0 densa y capas 1-13 MoE |
| Parametros totales | 777.148.032 |
| Parametros activos | 161.036.224 por token (aproximadamente el 20,7 % del total) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales (solo safetensors en bf16/fp32); el autor reporta inferencia en fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; la arquitectura no esta integrada en `transformers`) |
| Tamano del repo | 1,6 GB |
| Capas | 14 |
| Tamano oculto / cabezas | 896 / 14 |
| Expertos | 32 enrutados con top-3, mas 1 experto compartido |
| Atencion | MLA: latente KV de 320 numeros + 32 numeros de clave rotatoria desacoplada (352 numeros por token en cache) |
| Vocabulario | 32.768, BPE byte-level entrenado desde cero sobre el mismo corpus |
| Modelo base | whoashish115/Moonfrost-777M |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 14 capas con tamano oculto 896 y 14 cabezas de atencion. La capa 0 es densa y las capas 1 a 13 son Mixture-of-Experts. Cada capa MoE contiene 32 expertos enrutados de los que un router selecciona los 3 mejores, mas un experto compartido que se ejecuta siempre; en consecuencia, cada token atraviesa 4 de 33 expertos. La atencion es Multi-head Latent Attention: en lugar de almacenar una clave y un valor por cada una de las 14 cabezas, todo lo que el modelo cachea se comprime en un unico latente compartido de 320 numeros por token. La posicion se transporta por separado en una clave rotatoria desacoplada de 32 numeros, ya que una clave rotada posicionalmente no puede reconstruirse a partir de un latente sin rotar. Esto reduce la cache de 1.792 a 352 numeros por token.

El preentrenamiento uso aproximadamente 6.000 millones de tokens de FineWeb-Edu, con una perdida de validacion final de 2,976. La tasa de aprendizaje fue de 6e-4 de pico y 6e-5 minima. El ajuste de instrucciones se hizo durante 1,7 epocas sobre datos de instrucciones que incluyen HuggingFaceTB/smol-smoltalk y el conjunto de persona whoashish115/Moonfrost-Persona-SFT, con mejor checkpoint en el paso 7.800 de 9.201 y perdida de validacion de 1,2484; la tasa de aprendizaje del fine-tune fue de 2e-4 de pico y 2e-5 minima. El entrenamiento uso micro-batch de 24 con acumulacion de 3 (73.728 tokens por paso), autocast en bf16 con pesos maestros en fp32, y alcanzo 179.000 tokens por segundo en una sola H100.

El autor publica dos ajustes del mismo base con propositos distintos: esta version v2 incluye el conjunto de persona y por eso responde asumiendo la identidad Moonfrost, mantiene los roles de hablante y sostiene el hilo de la conversacion; Moonfrost-777M-Instruct-v1 no contiene datos de identidad y sirve como punto de partida neutro para quien quiera ajustar su propio comportamiento. No se documenta uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con gestion de turnos multi-turno dentro de la ventana de 1.024 tokens.
- Mantenimiento de roles de hablante y continuidad tematica dentro de la misma conversacion.
- Escritura de codigo corto y funcional (el autor lo describe como "short working code"), sin datos publicados de benchmarks de codigo.
- Identidad y persona propias: conoce su propia historia y responde como Moonfrost, gracias al dataset Moonfrost-Persona-SFT.
- Seguimiento de instrucciones basicas en formato conversacional.
- Soporte de tool calling / function calling: no disponible (no documentado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles; el modelo esta declarado unicamente para ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Razonamiento cientifico y de sentido comun de nivel bajo: 44,4 en ARC-Easy, 24,4 en ARC-Challenge, 37,2 en HellaSwag.

## Casos de uso

- Asistente conversacional ligero en local: con 161M parametros activos y una cache de solo 352 numeros por token, el modelo cabe en cualquier GPU de consumo e incluso en CPU, lo que permite desplegar un chatbot de ingles con identidad propia sin coste de API recurrente.
- Prototipado de sistemas de dialogo antes de escalar a un modelo mayor: su formato de chat con persona y su bajo coste de inferencia permiten validar flujos de conversacion, prompts de sistema y estructura de turnos a una fraccion del coste.
- Ensenanza y experimentacion en arquitecturas MoE y MLA: al publicarse el codigo de modelado, el bucle de entrenamiento y los runs de W&B, sirve como material didactico reproducible para estudiar enrutamiento top-3, expertos compartidos y compresion de cache KV.
- Generacion de texto corto en pipelines por lotes: resumenes de una frase, respuestas a preguntas cerradas, clasificacion generativa o reformulacion de textos en ingles, en escenarios donde la latencia y el coste importan mas que el conocimiento factual.
- Base para fine-tunes propios de dominio: la licencia Apache-2.0 y el bajo coste de ajuste (el fine-tune completo de este modelo se hizo dentro de un presupuesto de decenas de dolares) permiten reentrenar el modelo para un nicho concreto con pocos recursos.
- Generacion de codigo auxiliar en editor o scripts: util para autocompletar fragmentos cortos y boilerplate en ingles, siempre con revision humana, dado que no hay benchmarks de codigo publicados.
- Experimentos de investigacion sobre eficiencia: comparar el coste real de 777M totales frente a 161M activos en hardware modesto, o medir el impacto de la cache MLA reducida en tareas de contexto corto.
- Demo educativa de "modelo desde cero": ilustrar en un curso o articulo el ciclo completo de tokenizer, preentrenamiento, SFT y evaluacion con un coste total documentado de unos 55 dolares.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). Todas las metricas son accuracy en configuracion 5-shot sobre 250 ejemplos y estan marcadas como no verificadas (`verified: false`). El propio autor indica que la tabla describe a la familia mas que a este ajuste concreto, aunque las cifras se midieron sobre estos pesos.

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| ARC-Easy (test) | Preguntas cientificas de opcion multiple | accuracy, 5-shot, 250 ejemplos | 44,4 |
| ARC-Challenge (test) | Preguntas cientificas de opcion multiple | accuracy, 5-shot, 250 ejemplos | 24,4 |
| HellaSwag (validation) | Completado de frases de sentido comun | accuracy, 5-shot, 250 ejemplos | 37,2 |
| WinoGrande (validation) | Coreferencia de pronombres | accuracy, 5-shot, 250 ejemplos | 54,0 |
| BoolQ (validation) | Comprension lectora si/no | accuracy, 5-shot, 250 ejemplos | 58,8 |
| MMLU (test, config all) | Conocimiento multitarea | accuracy, 5-shot, 250 ejemplos | 30,8 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MT-Bench ni de benchmarks multilingues. Los resultados de MMLU (30,8) y ARC-Challenge (24,4) son consistentes con la advertencia del autor de que el modelo "no sabe mucho sobre el mundo".

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 (la configuracion reportada por el autor) los pesos ocupan aproximadamente 3,1 GB; en bf16, aproximadamente 1,6 GB; una hipotetica cuantizacion a 8 bits rondaria los 0,8 GB y a 4 bits los 0,4 GB, aunque no se publican artefactos cuantizados.
- Cache KV: con MLA, 352 numeros por token; a 1.024 tokens de contexto la cache completa es del orden de 1,4 MB en fp32, practicamente despreciable frente a los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM resulta suficiente. El autor reporta 16,8 tokens por segundo en fp32, batch 1, sobre una RTX 3050. Para entrenamiento, el preentrenamiento y los dos fine-tunes se completaron en una sola H100 en unas doce horas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas (RTX 3050, 3060, 4060, 4090), y en bf16 tambien en iGPU con memoria compartida.
- Inferencia en CPU: viable por el reducido numero de parametros activos (161M) y la cache minima; no se publican cifras de throughput en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada, ya que la arquitectura no forma parte de `transformers`. vLLM, TGI, llama.cpp y Ollama no soportan esta arquitectura personalizada sin escribir kernels o conversiones propias; no se documenta ninguna integracion oficial.
- Latencia y throughput: 16,8 tokens/s en fp32, batch 1, RTX 3050 (dato del autor). No hay datos de throughput en bf16, en lote, ni en GPU de gama alta.

## Comparativa con modelos similares

Los datos de parametros, contexto y licencia de los modelos alternativos provienen de documentacion publica general y deben verificarse en sus respectivas model cards. No se dispone de resultados de benchmark de esos modelos en la informacion proporcionada, por lo que no se realiza comparacion de rendimiento.

| Modelo | Parametros | Activos por token | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Moonfrost-777M-Instruct-v2 | 777M | 161M (MoE, 4 de 33 expertos) | 1.024 | Ingles | Apache-2.0 | safetensors (codigo propio, `trust_remote_code`) |
| SmolLM2-360M-Instruct | 362M | 362M (denso) | 2.048 (segun documentacion publica) | Principalmente ingles | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 494M | 494M (denso) | 32.768 (segun documentacion publica) | Multilingue (decenas de idiomas) | Apache-2.0 | safetensors, GGUF |
| TinyLlama-1.1B-Chat | 1,1B | 1,1B (denso) | 2.048 (segun documentacion publica) | Ingles | Apache-2.0 | safetensors, GGUF |

Diferencias cualitativas relevantes: Moonfrost es el unico de la comparativa con arquitectura MoE y MLA, el unico entrenado integramente desde cero por un autor individual y el unico con una ventana de contexto de solo 1.024 tokens. Frente a los alternativos, carece de ecosistema de cuantizaciones GGUF y de soporte en motores de inferencia estandar, lo que encarece su despliegue practico. No se dispone de datos comparativos de calidad en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimiento del mundo muy limitado: MMLU de 30,8 y ARC-Challenge de 24,4; el propio autor advierte que la seccion de limitaciones no es retorica y que el presupuesto se gasto en comportamiento, no en conocimiento.
- Riesgo elevado de alucinacion en preguntas factuales, cientificas o de actualidad, precisamente por el escaso conocimiento almacenado.
- Contexto de solo 1.024 tokens: insuficiente para documentos largos, bases de codigo, analisis de contratos o conversaciones extensas. Es la limitacion mas restrictiva para uso en produccion.
- Solo ingles declarado: no hay soporte multilingue ni datos de evaluacion en castellano, por lo que su uso en espanol no esta respaldado.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad, seguridad ni filtrado de datos. El corpus de preentrenamiento (FineWeb-Edu) es un subconjunto filtrado por criterios educativos, pero el ajuste de instrucciones incluye un dataset de persona de autoria individual sin auditoria publica.
- Datos de identidad: al incluir el conjunto Moonfrost-Persona-SFT, el modelo puede asumir una identidad concreta ("Moonfrost") de forma no deseada en aplicaciones de marca blanca; para esos casos el autor recomienda la variante Instruct-v1, sin datos de identidad.
- Integracion tecnica: requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado proporcionado por el repositorio. No funciona con vLLM, TGI, llama.cpp u Ollama sin trabajo adicional, y no hay cuantizaciones oficiales publicadas.
- Benchmarks no verificados: todas las cifras del model-index estan marcadas como `verified: false`, con solo 250 ejemplos por tarea, lo que reduce su significacion estadistica.
- Modelo de nicho con adopcion minima: 32 descargas y 1 like en el momento de la consulta, sin garantia de mantenimiento, soporte ni actualizaciones.
- Licencia: Apache-2.0 permite uso comercial sin restricciones de royalties, pero al ser un modelo entrenado desde cero no existen garantias de originalidad de los datos de entrenamiento mas alla de lo declarado por el autor.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no debe integrarse en arquitecturas agenticas que dependan de llamadas a funciones.
- La model card advierte que el fine-tune cambio como responde el modelo, no lo que sabe; las cifras de benchmark describen a la familia y no aisladamente a este ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whoashish115/Moonfrost-777M-Instruct-v2
- Modelo base: https://huggingface.co/whoashish115/Moonfrost-777M
- Version alternativa sin datos de identidad (Instruct-v1): https://huggingface.co/whoashish115/Moonfrost-777M-Instruct-v1
- Dataset de persona: https://huggingface.co/datasets/whoashish115/Moonfrost-Persona-SFT
- Codigo fuente: https://github.com/whoashish115/moonfrost-ai
- Sitio del proyecto: https://moonfrost-ai.vercel.app
- Runs de entrenamiento (Weights & Biases): https://wandb.ai/whoashish115-base/moonfrost-777m
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de ajuste conversacional: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Paper de referencia arquitectonica (DeepSeek-V2): no disponible en la informacion proporcionada
- Los resultados de la busqueda web proporcionada no contienen enlaces relacionados con este modelo.
