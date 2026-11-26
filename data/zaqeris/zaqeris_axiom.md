# ZAQERIS/ZAQERIS_AXIOM

## Resumen

AXIOM (identificador `ZAQERIS/ZAQERIS_AXIOM`) es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por ZAQERIS AI, un grupo independiente de investigacion en IA open source con sede en Egipto. Se distribuye bajo licencia Apache 2.0 con pesos abiertos y esta orientado a generacion de texto en arabe e ingles, con soporte declarado para contextos largos. La arquitectura es un transformer decoder-only con 36 capas, 16 expertos por capa y enrutamiento top-2, con 79.430 millones de parametros totales y 12.390 millones activos por token.

Su rasgo mas distintivo es el formato de pesos ZAQERIS-M3, una cuantizacion vectorial sub-3-bit (3,1583 bits por parametro) que comprime el checkpoint completo a 29,20 GiB repartidos en 36 shards de safetensors. Esto reduce drasticamente el espacio en disco respecto a un almacenamiento FP16 equivalente (unos 147,94 GiB), aunque el modelo sigue requiriendo descompresion en memoria para la inferencia. El contexto nativo es de 131.072 tokens, ampliable a 1.048.576 mediante YaRN con factor 8,0.

La relevancia del modelo radica en su propuesta de compresion agresiva combinada con un tamano MoE de casi 80.000 millones de parametros y licencia permisiva. No obstante, la propia model card reconoce que no documenta datos de entrenamiento, numero de tokens ni computo, y que una afirmacion previa sobre entrenamiento desde cero fue retirada por falta de evidencia publica, lo que limita seriamente la evaluacion de su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE), clase `ZaqerisAxiomForCausalLM` |
| Parametros totales | 79.425.295.488 (79,43B) logicos; el escaner de Hugging Face reporta 30.259.936.764 elementos almacenados |
| Parametros activos | 12.390.618.240 (12,39B) por token |
| Longitud de contexto | 131.072 tokens nativo; hasta 1.048.576 con YaRN (factor 8,0) |
| Tipos de cuantizacion | ZAQERIS-M3 a 3,1583 bits por parametro (formato propietario sub-3-bit); no se documentan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Arabe (ar), ingles (en) y multilingue (segun tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (36 shards, 29,20 GiB), con `custom_code` para modelo, config y tokenizer |

Otros datos de configuracion: 36 capas de decoder, 16 expertos por capa con top-2, hidden size 4224, FFN de experto 10496, atencion GQA con 32 cabezas de query y 8 de key-value, dimension de cabeza 128, RoPE con theta 5.000.000,0 y vocabulario de 148.480 tokens (`ZaqerisAxiomTokenizer`).

## Arquitectura y entrenamiento

AXIOM es un transformer decoder-only con mezcla de expertos dispersa: 36 capas, cada una con 16 expertos y enrutamiento top-2, lo que activa 12,39B de los 79,43B de parametros por token. La atencion usa Grouped-Query Attention con 32 cabezas de query y 8 de key-value (ratio 4:1), dimension de cabeza 128 y RoPE con theta de 5.000.000,0, coherente con su ventana nativa de 131.072 tokens y la extension YaRN a 1M. El tokenizer es una adaptacion del vocabulario Qwen2 (Alibaba Cloud, Apache-2.0): `vocab.json` contiene los primeros 148.458 tokens BPE de Qwen2 con identificadores reordenados, y el runtime es un matcher de prefijos con radix-trie greedy sin tabla de merges BPE, implementado en `tokenization_zaqeris_axiom.py`.

La innovacion tecnica central es el formato de cuantizacion ZAQERIS-M3, que empaqueta los pesos principalmente como bytes `uint8` (29,78B elementos U8, 0,31B I32 y 0,17B F16) a 3,1583 bits por parametro, logrando un checkpoint de 29,20 GiB frente a los 147,94 GiB que ocuparia en FP16. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el computo utilizado ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card indica explicitamente que no documenta esos datos y que retiro una afirmacion anterior sobre entrenamiento desde cero por falta de evidencia publicada.

## Capacidades

- Generacion de texto en arabe e ingles, con etiqueta multilingue en los metadatos del repositorio.
- Razonamiento y generacion de codigo: el ejemplo oficial de la model card es una funcion Python de busqueda binaria con explicacion de complejidad.
- Procesamiento de contextos largos: ventana nativa de 131.072 tokens y extension a 1.048.576 con YaRN (factor 8,0).
- Plantilla de chat integrada (`apply_chat_template`) con tokens especiales `<|im_start|>` (bos) y `<|im_end|>` (eos), y token de pad `<|axiom_pad_0|>`.
- Inferencia con Transformers mediante `trust_remote_code=True` y con vLLM en Linux/CUDA a traves del plugin `vllm_axiom_plugin.py`, que registra la clase del modelo y el metodo de cuantizacion `zaqeris_m3`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso orientado a agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Generacion de codigo asistida: el modelo puede producir funciones y explicar su complejidad, como muestra el ejemplo oficial de busqueda binaria, y su ventana de 131.072 tokens permite pasarle archivos completos o varios modulos como contexto.
- Analisis de documentos largos en arabe: informes, contratos o expedientes de decenas de miles de tokens caben en la ventana nativa, y la extension YaRN a 1M permite procesar corpus de mayor tamano en una sola pasada.
- Atencion al cliente bilingue arabe-ingles: la plantilla de chat y los tokens de rol permiten mantener conversaciones multi-turno; el contexto largo ayuda a conservar el historial sin truncar.
- Procesamiento por lotes en local con GPU unica: al ocupar 29,20 GiB en disco, el checkpoint puede residir en una GPU de 48 GB o repartirse con `device_map="auto"` entre GPU y RAM del sistema, lo que facilita despliegues en infraestructura propia.
- Investigacion sobre cuantizacion extrema: el formato ZAQERIS-M3 a 3,16 bits por parametro es un caso de estudio util para medir el impacto de la compresion sub-3-bit en un MoE de 79B, comparando calidad frente a pesos de mayor precision.
- Experimentacion academica con modelos MoE de gran escala: la licencia Apache 2.0 permite usar, modificar y redistribuir el modelo, incluido fine-tuning, sin las restricciones de licencias comunitarias con clausulas de uso.
- Servicio de inferencia con vLLM: el plugin incluido registra el modelo y la cuantizacion en vLLM sobre Linux/CUDA, lo que permite montar un endpoint compatible con la API de OpenAI para aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco ofrece comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint ocupa 29,20 GiB en disco; hay que sumar activaciones y cache KV. Con contexto nativo de 131.072 tokens la cache KV es considerable, y con 1M de tokens resulta muy grande para una GPU de 48 GB, por lo que conviene dimensionar la memoria segun la longitud de contexto real que se vaya a usar.
- Estrategia de despliegue: `device_map="auto"` permite repartir el modelo entre GPU y RAM del sistema si no cabe entero en VRAM.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el tamano del checkpoint, encajan GPUs de 48 GB o mas (A6000, L40S, A100 80 GB, H100); en GPUs de consumo de 24 GB solo cabria con reparto a RAM o tecnicas adicionales no documentadas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y vLLM mediante `vllm_axiom_plugin.py` en Linux/CUDA. No se documentan soporte de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| ZAQERIS AXIOM | 79,43B / 12,39B (MoE top-2, 16 expertos) | 131.072 nativo; 1M con YaRN | Apache 2.0 | safetensors con cuantizacion ZAQERIS-M3 (3,16 bpp) | Sin benchmarks publicados; procedencia de entrenamiento no documentada |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos equivalentes en la informacion proporcionada |

No se dispone de informacion verificada sobre modelos de la misma categoria (MoE de ~80B con contexto largo y licencia permisiva) que permita una comparacion rigurosa de parametros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- Procedencia opaca: la model card no documenta datos de entrenamiento, numero de tokens, computo ni proceso de alineacion, y retiro una afirmacion previa sobre entrenamiento desde cero por falta de evidencia. No es posible verificar como se construyo el modelo.
- Ausencia total de benchmarks: no hay evaluaciones publicadas de calidad, razonamiento, codigo o multilingue, lo que impide estimar su rendimiento real frente a alternativas.
- Riesgo de alucinacion: sin datos de alineacion ni evaluaciones, el riesgo de respuestas facticamente incorrectas es desconocido y potencialmente alto en dominios especializados.
- Cobertura idiomatica limitada: solo se declaran arabe e ingles (con etiqueta multilingue generica); el castellano no figura como idioma soportado y su calidad es una incognita.
- Cuantizacion propietaria: el formato ZAQERIS-M3 requiere codigo personalizado (`trust_remote_code=True`) y un plugin especifico de vLLM; no hay soporte documentado en llama.cpp, Ollama, TGI ni en formatos estandar como GGUF, AWQ o GPTQ, lo que limita las opciones de despliegue.
- Dependencia de codigo remoto: cargar el modelo ejecuta clases Python del repositorio, lo que implica revisar el codigo antes de usarlo en entornos de produccion.
- Tokenizer derivado: el vocabulario procede del tokenizer Qwen2 con identificadores reordenados y un matcher propio sin tabla de merges BPE; cualquier herramienta que asuma BPE estandar puede comportarse de forma distinta.
- Contexto largo costoso: la extension a 1M tokens con YaRN exige memoria para la cache KV muy superior a la de una GPU de 48 GB, por lo que en la practica el contexto util dependera del hardware.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime de cumplir las obligaciones de atribucion ni de verificar posibles reclamaciones sobre los datos de entrenamiento, que no se detallan.
- Madurez del proyecto: el repositorio tiene pocas descargas y un unico like en el momento de la consulta, y el Space de chat en vivo aun no esta operativo, lo que sugiere un ecosistema de validacion muy incipiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZAQERIS/ZAQERIS_AXIOM
- Repositorio GitHub: https://github.com/ZAQERIS/ZAQERIS
- Cuenta en X: https://x.com/ZAQERIS_Ai
- Patreon: https://www.patreon.com/c/ZAQERISAI
- Explorador de arquitectura (Space): https://huggingface.co/spaces/ZAQERIS/AXIOM-Architecture-Explorer
- Tokenizer Qwen2 (origen del vocabulario, Alibaba Cloud): no se proporciona enlace directo en la informacion disponible
- Paper, blog o demo adicionales: no disponibles
