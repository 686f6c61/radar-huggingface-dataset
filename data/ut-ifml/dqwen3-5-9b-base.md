# UT-IFML/dQwen3.5-9B-Base

## Resumen

dQwen3.5-9B-Base es un modelo de lenguaje de difusion enmascarada (masked diffusion language model) desarrollado por UT-IFML a partir de Qwen/Qwen3.5-9B. A diferencia de un transformer autorregresivo clasico, el modelo genera texto desenmascarando posiciones de forma iterativa sobre un lienzo completo, commitando aquellas cuya confianza supera un umbral configurable. Cuenta con 8.953.803.264 parametros (8,95B) y se distribuye bajo licencia Apache 2.0.

La innovacion principal es su backbone hibrido: solo las capas de atencion se han convertido en bidireccionales, mientras que las capas Gated DeltaNet permanecen causales. El autor publica este diseno en el articulo "dQwen3.5: Hybrid-Attention Diffusion Language Models" (arXiv:2609.20751) y lo acompana de un repositorio de codigo propio. Se trata de un modelo base, sin ajuste por instrucciones, por lo que su uso previsto es la investigacion y el ajuste posterior, no el dialogo directo.

El modelo forma parte de una familia con variantes de 0,75B, 1,88B, 4,21B y 8,95B parametros, ademas de un control con atencion completa (dQwen3-1.7B-Base). En el momento de redactar esta ficha acumula 795 descargas y 11 "me gusta" en HuggingFace, con ultima actualizacion el 23 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con difusion enmascarada: capas de atencion bidireccionales y capas Gated DeltaNet causales |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo oficial de uso emplea bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, con codigo personalizado (`trust_remote_code=True`, tag `custom_code`) |

Datos adicionales: modelo base Qwen/Qwen3.5-9B; tamano del repositorio 35,8 GB; biblioteca transformers; pipeline declarado text-generation (con tag adicional feature-extraction); identificador de tarea del articulo arXiv:2609.20751.

## Arquitectura y entrenamiento

El modelo es una adaptacion de Qwen3.5-9B al paradigma de difusion enmascarada. La columna vertebral es hibrida: las capas de atencion pasan a ser bidireccionales, de modo que cada posicion puede atender a posiciones futuras del lienzo, mientras que las capas Gated DeltaNet conservan su naturaleza causal. El autor mantiene ademas dQwen3-1.7B-Base como control con atencion completa, lo que permite aislar el efecto de esta mezcla de patrones de atencion en la evaluacion experimental.

El proceso de decodificacion no es autorregresivo token a token. La funcion `generate` decodifica el lienzo completo de una vez y va commitando las posiciones cuya confianza supera un umbral (`tau=0.9` por defecto). Existen dos modos alternativos: decodificacion por bloques de izquierda a derecha con `block_length=32`, o un presupuesto fijo de pasos por bloque mediante `tau=None, steps_per_block=k`. El checkpoint descrito en el articulo se entreno sobre 50.000 millones de tokens y esta disponible en el repositorio con la revision `step25000-swa`. No se detalla en la informacion disponible la composicion del dataset, ni si hubo fases de RLHF o DPO; al ser un modelo base, se indica explicitamente que no tiene ajuste por instrucciones.

## Capacidades

- Generacion de texto en modo base (continuacion de prompt), no como asistente conversacional ajustado.
- Generacion no autorregresiva: decodificacion simultanea del lienzo con commit por umbral de confianza, lo que permite paralelizar la produccion de multiples posiciones.
- Decodificacion configurable: modo de lienzo completo (`tau=0.9`), modo por bloques (`block_length=32`) y modo de presupuesto fijo (`steps_per_block=k`).
- Relleno y completado de huecos, dado que el paradigma de difusion enmascarada opera de forma nativa sobre posiciones enmascaradas.
- Parada configurable mediante cadenas de parada (`stop_strings`), con ejemplos orientados a codigo (`"\n\n"`, `"\ndef"`, `"\nclass"`, `"<|endoftext|>"`).
- Extraccion de caracteristicas: el modelo declara el tag `feature-extraction`, ademas de `text-generation` y `conversational`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; al ser un modelo base sin ajuste por instrucciones, no se documenta.
- Capacidades de agente, razonamiento multi-paso, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Completado de codigo e infilling en editores: el modelo se puede invocar con un prompt parcial como `"def fibonacci(n):\n"` y parar en delimitadores sintacticos (`"\ndef"`, `"\nclass"`), lo que encaja con escenarios de relleno de funciones o cuerpos de clase incompletos.
- Generacion por lotes de alta concurrencia: al commitear muchas posiciones por paso en lugar de token a token, el paradigma de difusion resulta adecuado para tareas donde se generan muchos textos cortos en paralelo y la latencia por secuencia importa mas que la latencia por token.
- Investigacion sobre modelos de difusion para lenguaje: sirve como punto de comparacion a escala 9B frente al control dQwen3-1.7B-Base con atencion completa, para estudiar el efecto de la atencion bidireccional en capas de atencion combinada con Gated DeltaNet causal.
- Ajuste fino supervisado para dominios verticales: al ser un modelo base con licencia Apache 2.0, se puede afinar sobre corpus medicos, legales o tecnicos y despues aplicar un ajuste por instrucciones propio.
- Generacion de datos sinteticos y aumento de corpus: el rellenado de huecos de forma bidireccional permite crear pares entrada-salida y variaciones de texto sobre plantillas enmascaradas.
- Tareas de extraccion de caracteristicas: el tag `feature-extraction` sugiere su uso para obtener representaciones internas en clasificacion, clustering o recuperacion de informacion, aprovechando la atencion bidireccional.
- Reproduccion y extension de resultados academicos: el checkpoint de 50.000 millones de tokens (`revision="step25000-swa"`) permite reproducir los experimentos del articulo y comparar variantes entrenadas con menos tokens.
- Refinado iterativo de borradores: la decodificacion con umbral de confianza permite reenmascarar y regenerar regiones de baja confianza de un texto ya producido, util en pipelines de post-edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 (precision usada en el ejemplo oficial), los 8,95B parametros ocupan aproximadamente 17,9 GB solo en pesos. Hay que sumar memoria para activaciones, cache y el lienzo de decodificacion; no se dispone de cifras oficiales de pico de memoria.
- GPU recomendadas: no se especifican en la informacion disponible. El ejemplo oficial exige una GPU CUDA y se ha probado con `torch 2.7.1+cu128` y `flash-linear-attention 0.5.1`, dependencia necesaria por las capas Gated DeltaNet.
- Encaje en GPU de consumo: una GPU con 24 GB de VRAM (por ejemplo, RTX 4090 o RTX 3090) queda muy justa en bfloat16, dado que los pesos rondan los 17,9 GB antes de contar activaciones y el lienzo de decodificacion. No hay confirmacion oficial de que quepa; seria necesario verificar y posiblemente recurrir a cuantizacion, que no esta documentada.
- Opciones de despliegue: la unica ruta documentada es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI; de hecho, la model card declara `inference: false` y la decodificacion no autorregresiva con codigo personalizado hace poco probable el soporte directo en esos motores.
- Latencia y throughput: no disponibles.
- Version minima de libreria: `transformers>=5.13`.
- Tamano del repositorio: 35,8 GB, coherente con mas de una revision o checkpoint almacenado (por ejemplo, el checkpoint de 50.000 millones de tokens).

## Comparativa con modelos similares

| Modelo | Parametros totales | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|
| dQwen3.5-9B-Base | 8,95B | Hibrido (atencion bidireccional + Gated DeltaNet causal) | Apache 2.0 | HuggingFace, `transformers` con codigo personalizado |
| dQwen3.5-4B-Base | 4,21B | Hibrido | No indicada en la informacion disponible | HuggingFace (UT-IFML) |
| dQwen3.5-2B-Base | 1,88B | Hibrido | No indicada en la informacion disponible | HuggingFace (UT-IFML) |
| dQwen3.5-0.8B-Base | 0,75B | Hibrido | No indicada en la informacion disponible | HuggingFace (UT-IFML) |
| dQwen3-1.7B-Base | 1,72B | Atencion completa (control) | No indicada en la informacion disponible | HuggingFace (UT-IFML) |
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible | HuggingFace (modelo base del que deriva) |

No se dispone de datos de benchmarks ni de contexto de las alternativas, por lo que la comparacion se limita a parametros, arquitectura y disponibilidad.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional directo sin un ajuste adicional.
- El pipeline declarado incluye `conversational` como tag, pero la model card no documenta ningun formato de plantilla de dialogo ni comportamiento conversacional verificado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo base, la veracidad factual no esta alineada.
- Sesgos conocidos: no disponibles. Al derivar de Qwen3.5-9B, hereda las caracteristicas de sus datos de preentrenamiento, que no se detallan.
- Longitud de contexto y comportamiento mas alla de la ventana de entrenamiento: no disponibles.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue concreta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar tambien las condiciones de Qwen/Qwen3.5-9B como modelo de origen.
- Requisitos de ejecucion: necesita GPU CUDA, `transformers>=5.13` y `flash-linear-attention`; no funciona en CPU de forma documentada ni, previsiblemente, en motores de inferencia estandar.
- La model card declara `inference: false`, lo que apunta a que el modelo se publica con fines de investigacion mas que como servicio listo para produccion.
- El codigo de generacion es personalizado (`trust_remote_code=True`), lo que implica ejecutar codigo del repositorio; debe auditarse en entornos de produccion.
- Las capacidades de decodificacion dependen de hiperparametros (`tau`, `block_length`, `steps_per_block`) cuyo efecto en la calidad no esta documentado con cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UT-IFML/dQwen3.5-9B-Base
- Articulo: https://arxiv.org/abs/2609.20751
- Codigo: https://github.com/AntonXue/dQwen
- Variante 0.8B: https://huggingface.co/UT-IFML/dQwen3.5-0.8B-Base
- Variante 2B: https://huggingface.co/UT-IFML/dQwen3.5-2B-Base
- Variante 4B: https://huggingface.co/UT-IFML/dQwen3.5-4B-Base
- Control con atencion completa: https://huggingface.co/UT-IFML/dQwen3-1.7B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
