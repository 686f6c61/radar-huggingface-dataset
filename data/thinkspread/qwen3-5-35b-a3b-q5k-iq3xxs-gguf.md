# thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF

## Resumen

Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF es una cuantizacion GGUF del modelo Qwen/Qwen3.5-35B-A3B, un transformer de tipo mezcla de expertos (MoE) desarrollado por Alibaba Qwen. El modelo base cuenta con 34.660.610.688 parametros totales (aproximadamente 34,66 mil millones) y activa 3 mil millones por token, lo que lo situa en la categoria de modelos MoE de gran capacidad pero coste de inferencia reducido. Esta version concreta la publica el usuario thinkspread con el objetivo de optimizar la decodificacion en Macs de Apple Silicon con 24 GB de memoria unificada.

La innovacion principal de esta ficha no reside en el modelo base, sino en la estrategia de cuantizacion mixta: las capas densas (Gated DeltaNet, proyecciones de atencion, experto compartido y `lm_head`) se cuantizan a Q5_K, mientras que los expertos enrutados usan IQ3_XXS para las proyecciones gate/up e IQ4_XS para down. Segun el autor, esto reduce la lectura por token de 2,56 GB a 1,84 GB y mejora la velocidad de decodificacion un 18 % respecto al fichero Q3_K_M habitual, sin perdida medible de perplejidad.

Es relevante ahora porque demuestra que ajustar el tipo de cuantizacion por grupos de tensores segun el patron de acceso de un MoE permite obtener mejor rendimiento en hardware de consumo que las recetas genericas de baja precision. El repositorio tiene 673 descargas y esta etiquetado para Apple Silicon y para el servidor local tempo9, ademas de ser compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas Gated DeltaNet y atencion; router MoE en F32 |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | 3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: Q5_K en capas densas y token embeddings; IQ3_XXS en `ffn_gate_exps` y `ffn_up_exps`; IQ4_XS en `ffn_down_exps`; router MoE en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (fichero unico `Qwen3.5-35B-A3B-Q5K_IQ3XXS.gguf`, 15,7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer de mezcla de expertos con 35B parametros totales y 3B activos. La model card del cuantizador menciona capas Gated DeltaNet junto con proyecciones de atencion, lo que sugiere una arquitectura hibrida con componentes de estado recurrente lineal. El router MoE selecciona 8 de 256 expertos por token, un ratio de activacion muy bajo que explica que solo se lean 3B parametros efectivos en cada paso. El router se mantiene en F32 para preservar la precision de la seleccion de expertos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica documentada en esta ficha es la receta de cuantizacion: se parte del fichero Q3_K_M de unsloth, se conservan los tensores de expertos enrutados sin modificar (byte a byte, con sus tipos IQ3_XXS e IQ4_XS) y solo se recuantizan las capas densas a Q5_K mediante `llama-quantize --allow-requantize --pure`. Se pasa una matriz de importancia de unos que cubre unicamente los tensores de expertos porque la herramienta la exige al incluir tipos IQ3, pero nunca se aplica a las capas densas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado `text-generation`.
- Razonamiento multi-paso y respuesta a instrucciones, asumiendo las capacidades del modelo base Qwen3.5.
- Capacidad de vision mediante un encoder separado: el autor publica `thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16`, compilado para Core ML, que se integra con `tempo9 --tower auto`.
- Soporte de servidor compatible con las APIs de OpenAI y Anthropic a traves de tempo9.
- Compatibilidad con llama.cpp mediante `llama-server`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Modo thinking explicito: no documentado en la informacion proporcionada.

## Casos de uso

- Inferencia local en Macs de 24 GB: el fichero esta disenado para caber en el working set de GPU de un Apple M5 Pro con 24 GB y decodificar a 74,1-76,9 tok/s, lo que permite usar un MoE de 35B en un portatil sin GPU dedicada.
- Asistente conversacional de escritorio: con tempo9 como servidor local compatible con OpenAI y Anthropic, se puede conectar a clientes existentes sin modificar el codigo de la aplicacion.
- Sustitucion de modelos densos de menor calidad en estaciones de trabajo: al activar solo 3B parametros por token, el coste por token es bajo pese al tamano total, lo que lo hace adecuado para generacion de texto interactiva en local.
- Analisis de imagenes en local: combinado con el encoder Core ML `Qwen3.5-35B-A3B-Vision-CoreML-fp16`, permite consultas sobre imagenes manteniendo todo el pipeline en el equipo, sin enviar datos a la nube.
- Prototipado de agentes y pipelines: la compatibilidad con las APIs de OpenAI y Anthropic facilita integrarlo en frameworks que ya esperan esos formatos, con la ventaja de que la inferencia es local.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta la receta exacta y las mediciones de perplejidad y velocidad, por lo que sirve como referencia reproducible para estudiar el impacto de cuantizar densos y expertos por separado.
- Despliegue en servidores llama.cpp: `llama-server -hf ... -ngl 99 -fa on` permite montar un endpoint HTTP en hardware Apple o en cualquier maquina donde llama.cpp tenga soporte.

## Benchmarks y rendimiento

El autor publica mediciones propias en Apple M5 Pro con 24 GB: decodificacion de 256 tokens en modo greedy con prompt corto, usando tempo9 y dos rondas intercaladas; perplejidad con `llama-perplexity` sobre 24 fragmentos de 2048 tokens de prosa tecnica en ingles (comparacion relativa unicamente).

| Fichero | Lectura por token | Decodificacion (tok/s) | PPL |
|---|---|---|---|
| unsloth Q3_K_M (densos Q8_0) | 2,56 GB | 63,5-64,8 | 6,785 |
| Este fichero (densos Q5_K) | 1,84 GB | 74,1-76,9 | 6,801 |
| Densos Q6_K | 2,10 GB | 69,0-70,2 | 6,784 |
| Densos Q4_K | 1,60 GB | 80,5-83,8 | 7,014 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el fichero pesa 15,7 GB; el autor lo valida en un Mac con 24 GB de memoria unificada, donde cabe junto con el encoder de vision a los ajustes por defecto.
- GPU recomendadas: Apple M5 Pro de 24 GB es el hardware de referencia medido. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: cabe en Apple Silicon de 24 GB o superior. Para GPUs discretas no se aportan mediciones; el tamano del fichero exige al menos 16 GB de VRAM solo para los pesos, mas overhead de contexto y cache KV.
- Opciones de despliegue: tempo9 (servidor local compatible con OpenAI y Anthropic), llama.cpp (`llama-server` con `-ngl 99 -fa on`). No se documenta soporte de vLLM ni TGI para este fichero GGUF.
- Latencia y throughput: 74,1-76,9 tok/s de decodificacion en Apple M5 Pro de 24 GB con prompt corto. No se publican datos de prefill ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este fichero (Qwen3.5-35B-A3B Q5K/IQ3XXS) | 34,66B | 3B | no disponible | Apache 2.0 | GGUF 15,7 GB | 74,1-76,9 tok/s en M5 Pro 24 GB; PPL 6,801 |
| unsloth Qwen3.5-35B-A3B-GGUF Q3_K_M | 34,66B | 3B | no disponible | Apache 2.0 | GGUF | Densos en Q8_0; 2,56 GB/token; 63,5-64,8 tok/s; PPL 6,785 |
| Qwen3.5-35B-A3B densos Q4_K (misma base) | 34,66B | 3B | no disponible | Apache 2.0 | GGUF | 1,60 GB/token; 80,5-83,8 tok/s; PPL 7,014 (3,4 % peor) |
| Qwen3.5-35B-A3B densos Q6_K (misma base) | 34,66B | 3B | no disponible | Apache 2.0 | GGUF | 2,10 GB/token; 69,0-70,2 tok/s; PPL 6,784 |

Las alternativas comparadas son variantes de cuantizacion del mismo modelo base, ya que no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La perplejidad se midio sobre prosa tecnica en ingles y solo es valida como comparacion relativa entre ficheros, no como metrica absoluta de calidad.
- El rendimiento medido corresponde exclusivamente a Apple M5 Pro con 24 GB; extrapolar los tok/s a otras GPUs no esta respaldado por datos.
- El autor reporta 3,4 % de perdida de perplejidad al bajar los densos a Q4_K, lo que indica que la cuantizacion afecta de forma medible a la calidad; los densos en Q5_K se presentan como el punto de equilibrio.
- La receta usa una matriz de importancia de unos como marcador de posicion para satisfacer a `llama-quantize`; los tensores densos se cuantizan sin matriz de importancia real, lo que puede afectar a la calidad frente a una cuantizacion con imatrix especifica para densos.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma del modelo base en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los terminos del modelo Qwen/Qwen3.5-35B-A3B original.
- El repositorio tiene 0 likes y 673 descargas, por lo que es una publicacion de un tercero y no una cuantizacion oficial de Qwen ni de unsloth.
- No hay datos publicados sobre tool calling, modo thinking ni capacidades multilingues, por lo que no deben asumirse en produccion sin validacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Encoder de vision Core ML: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16
- Servidor local tempo9: https://github.com/thinkspread/tempo9
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
