# Yo-Purple/Meditor-2-3.4B-Universal

## Resumen

Meditor-2-3.4B-Universal es un modelo de generacion de texto en ingles publicado por el usuario Yo-Purple en Hugging Face. Se trata de la version "universal" del modelo Meditor 2, en la que el autor aplana el grafo de enrutamiento jerarquico de su variante HMoE (Meditor-2-3.4B-A1.8B-HMoE) en una arquitectura estandar `Qwen2MoeForCausalLM` (`qwen2_moe`) compatible con la libreria `transformers` y con cuantizaciones GGUF listas para usar. El backbone de partida es SmolLM2-1.7B-Instruct de Hugging Face, sobre el que se ha construido una mezcla de expertos de 3.511.666.688 parametros totales.

El modelo resuelve el problema de portabilidad de las arquitecturas MoE personalizadas: al convertir el enrutamiento jerarquico en un MoE estandar de Qwen2, permite cargar el modelo con herramientas convencionales (transformers, llama.cpp, LM Studio) sin necesidad de codigo especifico del autor. Su relevancia actual radica en que ofrece un MoE de ~3,5B parametros con ~1,8B activos en un formato estandar y con licencia Apache 2.0, lo que facilita su despliegue en entornos de investigacion y produccion ligera.

Segun los datos del autor, el modelo obtiene una puntuacion media de 4,12 sobre 10 en la suite UniBench-100 (100 preguntas abiertas en 10 dominios cognitivos) con una tasa de aprobacion del 22 % en BF16, y mantiene 4,00 de media en cuantizacion Q4_K_M. Estas cifras lo sitúan como la mejor variante de la generacion Meditor 2, aunque por debajo de Meditor 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Qwen2MoeForCausalLM`, tipo `qwen2_moe`) |
| Parametros totales | 3.511.666.688 (3,51B) |
| Parametros activos | 1,83B (segun la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (desde BF16 hasta Q2_K e IQ4_XS, incluyendo Q4_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) construida sobre el backbone SmolLM2-1.7B-Instruct. La innovacion principal respecto a su predecesor directo, Meditor-2-3.4B-A1.8B-HMoE, es la "aplanacion" del grafo de enrutamiento jerarquico (HMoE) en una topologia MoE estandar de Qwen2, lo que elimina la dependencia de implementaciones de enrutamiento personalizadas y permite usar la clase `Qwen2MoeForCausalLM` de `transformers`. El resultado conserva el mismo numero de parametros totales y activos que la variante HMoE (3,41B / 1,83B) pero en un formato interoperable.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO especificas para esta variante. La model card tampoco documenta innovaciones adicionales como decodificacion especulativa o atencion lineal. El modelo base declarado incluye tanto SmolLM2-1.7B-Instruct como el propio Meditor-2-3.4B-A1.8B-HMoE, lo que sugiere un proceso de conversion y posible ajuste posterior sobre la variante HMoE.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento y sintesis abierta en diez dominios cognitivos evaluados por UniBench-100 (pensamiento critico, expresion creativa, humanidades, ciencias fisicas y de la vida, matematicas y estimacion cuantitativa, entre otros).
- Razonamiento de sentido comun, segun los resultados declarados en el subconjunto ARC Challenge de 12 preguntas.
- Capacidades matematicas y de estimacion cuantitativa limitadas: en la comparativa por dominios del autor, el modelo obtiene 1,99 sobre 10 en matematicas, el punto mas debil de su perfil.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo se puede cargar con `transformers` o con llama.cpp sin codigo especifico, lo que permite tener un chatbot funcional en pocos minutos para validar flujos de producto.
- Experimentacion academica con arquitecturas MoE: al estar en formato `qwen2_moe` estandar, sirve como banco de pruebas para estudiar enrutamiento de expertos, tecnicas de cuantizacion o comparativas HMoE frente a MoE plano sin infraestructura propietaria.
- Despliegue en hardware de consumo: las cuantizaciones GGUF (Q4_K_M, IQ4_XS, Q2_K) permiten ejecutar el modelo en GPU de gama media o incluso en CPU, adecuado para demos locales y entornos sin acceso a clusters.
- Generacion de texto creativo y estilistico: con 4,95 sobre 10 en el dominio de expresion creativa de UniBench-100, puede emplearse para borradores de contenido, variaciones de copy o ejercicios de escritura asistida donde no se requiera calidad de frontera.
- Evaluacion comparativa de modelos pequenos: la suite UniBench-100 y las metricas publicadas por el autor permiten usar este modelo como referencia en estudios de escalado o de degradacion por cuantizacion (4,12 en BF16 frente a 4,00 en Q4_K_M).
- Filtrado y clasificacion de texto ligera: con un perplexity declarado de 2,48 en WikiText-2, el modelo puede servir como modelo de lenguaje base para puntuacion de fluidez o deteccion de texto anomalo en pipelines de datos.
- Educacion y divulgacion: su tamano y licencia permisiva lo hacen util para talleres practicos sobre MoE, cuantizacion GGUF y despliegue con llama.cpp u Ollama.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| UniBench-100 (10 dominios, 100 preguntas) | Puntuacion media BF16 (/10) | 4,12 |
| UniBench-100 | Tasa de aprobacion BF16 (umbral >= 6,0) | 22 % |
| UniBench-100 | Puntuacion media Q4_K_M (/10) | 4,00 |
| UniBench-100 | Tasa de aprobacion Q4_K_M | 18 % |
| ARC Challenge (subconjunto de 12 preguntas) | Precision | 100 % |
| WikiText-2 (validacion) | Perplexity | 2,48 |

Comparativa interna de la serie Meditor en UniBench-100 (100/100 preguntas, segun el autor):

| Modelo | Puntuacion media (/10) | Tasa de aprobacion | Tokens/s (evaluacion) |
|---|---|---|---|
| Meditor-3-4B-MoE | 7,31 | 69,0 % | 35,7 |
| Meditor-2-3.4B-Universal (BF16) | 4,12 | 22,0 % | 27,5 |
| Meditor-2-3.4B-Universal (Q4_K_M) | 4,00 | 18,0 % | 141,2 |
| Meditor-2-3.4B-A1.8B-HMoE (nativo) | 3,28 (37/100) | 8,1 % | 48,7 |
| Meditor-1-500M-Universal | 2,42 | 1,0 % | 163,4 |

Desglose por dominio de UniBench-100 para Meditor 2 (mejor ejecucion, segun el autor): pensamiento critico 5,98; expresion creativa 4,95; humanidades y etica 4,91; ciencias fisicas y de la vida 3,38; matematicas y estimacion cuantitativa 1,99.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 6,38 GB para los pesos (el autor indica 6,42 GB para la variante HMoE y 6,38 GB para esta version universal).
- VRAM estimada en Q4_K_M: alrededor de 2-2,5 GB para los pesos, mas overhead de contexto y runtime (estimacion a partir del tamano de 3,51B parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, A10, L4). Para cuantizaciones Q4_K_M o inferiores, GPU de 4-6 GB o incluso CPU.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas en BF16 y en tarjetas de 4-6 GB con cuantizacion GGUF.
- Opciones de despliegue: `transformers` (clase `Qwen2MoeForCausalLM`), llama.cpp, LM Studio (via GGUF) y, presumiblemente, Ollama importando el GGUF. No se documenta soporte explicito de vLLM o TGI.
- Throughput declarado por el autor durante la evaluacion: 27,5 tokens/s en BF16 y 141,2 tokens/s en Q4_K_M (condiciones de hardware no especificadas).

## Comparativa con modelos similares

| Modelo | Parametros (total / activo) | Contexto | UniBench-100 (/10) | Licencia | Formato |
|---|---|---|---|---|---|
| Meditor-2-3.4B-Universal | 3,51B / 1,83B | no disponible | 4,12 (BF16) | Apache 2.0 | safetensors, GGUF |
| Meditor-2-3.4B-A1.8B-HMoE | 3,41B / 1,83B | no disponible | 3,28 (37/100) | no disponible | safetensors |
| Meditor-3-4B-MoE | 4,16B / 4,04-4,07B | no disponible | 7,31 | no disponible | safetensors |
| SmolLM2-1.7B-Instruct (backbone) | 1,7B / 1,7B | no disponible | no disponible | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a la propia familia Meditor y al backbone SmolLM2, ya que la informacion proporcionada no incluye resultados de modelos externos en UniBench-100. No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) que permitan una comparacion directa con otros modelos de tamano similar.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se documenta soporte de castellano ni de otros idiomas.
- Rendimiento modesto en razonamiento y matematicas: 4,12 sobre 10 de media en UniBench-100 y 1,99 sobre 10 en el dominio matematico, con una tasa de aprobacion global del 22 %.
- Riesgo elevado de alucinacion en tareas abiertas, coherente con su tamano y con las puntuaciones obtenidas en dominios de sintesis.
- El resultado de 100 % de precision en ARC Challenge corresponde a un subconjunto de solo 12 preguntas, por lo que no es estadisticamente representativo.
- El perplexity de 2,48 en WikiText-2 es un valor declarado por el autor y no verificado de forma independiente; conviene tratarlo con cautela.
- No se documenta soporte de tool calling, function calling ni capacidades de agente, lo que limita su uso en pipelines automatizados complejos.
- La longitud de contexto no esta publicada; no se debe asumir la del backbone SmolLM2 sin confirmacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base SmolLM2-1.7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Las metricas de rendimiento (tokens/s) dependen de hardware no especificado y no son directamente extrapolables.
- El modelo tiene pocas descargas (1395) y solo 2 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Modelo base HMoE: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Backbone SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Meditor 1 (MoE nativo): https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Meditor 1 (Universal): https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Meditor 3 (MoE nativo): https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Meditor 3 (Universal GGUF): https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
