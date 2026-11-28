# Xylolabs/Qwen3.5-4B-Base-GGUF

## Resumen

Xylolabs/Qwen3.5-4B-Base-GGUF es una cuantizacion en formato GGUF del modelo base Qwen/Qwen3.5-4B-Base, preparada por Xylolabs para su uso con llama.cpp. Se trata de un unico fichero Q4_K_M de 2,783 GB que contiene el modelo de texto en formato cuantizado de 4 bits, pensado para generacion de texto pura (no conversacional) y ejecutable en hardware de consumo. El repositorio no incluye pesos en precision completa ni otras cuantizaciones; solo el fichero Q4_K_M.

El modelo subyacente es un transformer denso de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) publicado por el equipo Qwen, con una ventana de contexto declarada de 256K tokens en la tabla de recomendaciones de hardware del autor de la cuantizacion. Al ser un modelo *base* (no instruido ni alineado), su funcion es la continuacion de texto y el punto de partida para *fine-tuning*, no el dialogo directo ni el seguimiento de instrucciones.

La relevancia actual de esta ficha es practica: ofrece una via sencilla de ejecutar un modelo Qwen 3.5 de 4B en GPU de consumo (RTX 3090/4090, 24 GB) con contexto largo, con una tabla de precision frente a BF16 publicada por el autor de la cuantizacion. La licencia Apache 2.0 facilita el uso comercial, y los idiomas declarados son ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-4B-Base; detalles internos no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (segun tabla de hardware del autor de la cuantizacion) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el autor incluye comparativas de Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M de llama.cpp |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,3 mil millones de parametros. La model card de esta cuantizacion no detalla la arquitectura interna del modelo base (numero de capas, dimensiones de atencion, tipo de atencion, uso de RoPE u otras innovaciones), por lo que esos datos deben consultarse en la publicacion original de Qwen/Qwen3.5-4B-Base. Tampoco se documentan en esta ficha el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Al tratarse de un modelo *base*, es esperable que no haya pasado por alineamiento instructivo, aunque este punto no se confirma en la informacion disponible.

La aportacion tecnica de este repositorio es la conversion y cuantizacion a GGUF para llama.cpp, con una evaluacion de precision frente a BF16 publicada por el autor. La tabla de precision mide divergencia KL y *top-1 accuracy* sobre WikiText-2 y un conjunto *held-out*: Q4_K_M obtiene KL de 0,022297 y top-1 del 92,902% en WikiText-2, y KL de 0,027617 y top-1 del 91,804% en *held-out*. Para comparar, Q8_0 alcanza KL de 0,000581 y top-1 del 98,632% en WikiText-2. Estos datos permiten estimar la perdida de fidelidad de la cuantizacion de 4 bits frente a la de 8 bits.

## Capacidades

- Generacion de texto por continuacion de *prompt* (modelo base, sin modo conversacional; el ejemplo del autor usa `llama-completion -no-cnv`).
- Razonamiento y conocimiento general derivados del modelo base Qwen3.5-4B-Base (sin datos de benchmarks en la informacion disponible).
- Capacidad multilingue limitada a los idiomas declarados: ingles y coreano.
- Punto de partida para *fine-tuning* o ajuste supervisado sobre tareas concretas.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo *thinking*.
- Compatible con `endpoints_compatible` segun los tags del repositorio.

## Casos de uso

- Continuacion de texto y generacion de borradores: el modelo puede completar prefijos de texto largos (documentacion tecnica, articulos) gracias a la ventana de contexto declarada de 256K tokens, ejecutandose en una sola GPU de 24 GB con el fichero Q4_K_M.
- *Fine-tuning* de dominio: al ser un modelo base de 4,3B con licencia Apache 2.0, sirve como inicializacion para ajuste supervisado en tareas especificas (clasificacion, extraccion, redaccion) sin restricciones comerciales.
- Generacion aumentada por recuperacion (RAG) en local: con contexto largo y un fichero de 2,8 GB, es viable montar un pipeline de RAG en una estacion de trabajo con RTX 4090, inyectando muchos fragmentos recuperados en el *prompt*.
- Procesamiento de documentos extensos en ingles o coreano: resumen y extraccion sobre textos de gran longitud aprovechando la ventana de 256K, con la salvedad de que al ser un modelo base la calidad de instruccion no esta garantizada.
- Prototipado y experimentacion en llama.cpp: el fichero Q4_K_M permite validar rapidamente pipelines de inferencia local antes de escalar a modelos mayores o a cuantizaciones de mayor precision.
- Despliegue en hardware unificado (Mac Studio, DGX Spark): la tabla del autor indica que el mismo fichero funciona en 128 GB unificados con contexto de 256K, util para entornos de desarrollo sin GPU dedicada.
- Base para evaluacion de cuantizacion: la tabla de precision publicada permite estudiar el impacto de Q4_K_M frente a BF16 en tareas de continuacion de texto.

## Benchmarks y rendimiento

El autor publica una tabla de precision de la cuantizacion frente a BF16 (divergencia KL y *top-1 accuracy*), no benchmarks de tareas (MMLU, HumanEval, GSM8K). Se reproduce a continuacion:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 4,611 GB | 0,000581 | 98,632% | 0,000711 | 98,608% |
| llama.cpp Q6_K | 3,563 GB | 0,002520 | 97,377% | 0,003082 | 96,931% |
| llama.cpp Q5_K_M | 3,161 GB | 0,006444 | 95,794% | 0,007754 | 95,294% |
| Q4_K_M (este repo) | 2,783 GB | 0,022297 | 92,902% | 0,027617 | 91,804% |
| llama.cpp Q3_K_M | 2,319 GB | 0,079100 | 86,569% | 0,103345 | 84,578% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2,783 GB; el consumo total depende del contexto activado y del *overhead* de llama.cpp, pero con 24 GB de VRAM hay margen amplio para contexto de 256K segun la tabla del autor.
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 con 24 GB (contexto de 256K segun el autor).
- Hardware unificado: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build recomendado `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con el binario `llama-completion`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-GGUF (Q4_K_M) | ~4,3B | 256K (declarado) | GGUF | Apache 2.0 | Cuantizacion Q4_K_M de 2,783 GB; precision medida frente a BF16 |
| Qwen/Qwen3.5-4B-Base (original) | ~4,3B | no disponible en esta ficha | safetensors (presumiblemente) | Apache 2.0 | Modelo base sin cuantizar; referencia de precision |
| llama.cpp Q8_0 del mismo modelo | ~4,3B | 256K | GGUF | Apache 2.0 | 4,611 GB; KL de 0,000581 en WikiText-2 |
| llama.cpp Q3_K_M del mismo modelo | ~4,3B | 256K | GGUF | Apache 2.0 | 2,319 GB; KL de 0,079100 en WikiText-2 |

No se dispone de datos de benchmarks de tareas para comparar con modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- Es un modelo *base*: no sigue instrucciones de forma fiable ni mantiene dialogos; para uso conversacional requiere *fine-tuning* o un modelo instruido.
- La cuantizacion Q4_K_M introduce perdida de fidelidad medible: KL de 0,022297 y top-1 del 92,902% en WikiText-2 frente a BF16, con degradacion creciente en contextos mas exigentes.
- Idiomas declarados solo ingles y coreano; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin alineamiento instructivo, la mitigacion depende del *prompt* y del uso.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; el modelo base hereda los del dataset de entrenamiento original, no detallado aqui.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y citarse el modelo original Qwen3.5-4B-Base.
- Solo se publica un fichero (Q4_K_M); no hay opcion de mayor precision en este repositorio.
- La ventana de 256K se declara en la tabla de hardware del autor; no se detalla en la model card del modelo base en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF/blob/main/LICENSE
- Build de llama.cpp recomendado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
