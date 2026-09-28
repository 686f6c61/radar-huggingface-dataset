# Wondernutts/Artemis-31B-v1.2-int4-ov

## Resumen

Artemis-31B-v1.2-int4-ov es una conversion a OpenVINO en INT4 del modelo TheDrummer/Artemis-31B-v1.2, un fine-tune orientado a roleplay y escritura creativa construido sobre la arquitectura densa Gemma 4 de 31B (no sobre la variante MoE de 26B-A4B). La conversion la firma el usuario Wondernutts y su objetivo declarado es acercar el trabajo de TheDrummer al ecosistema de GPU Intel Arc, que hasta ahora tenia un acceso limitado a este tipo de modelos de gran tamano. No se trata de un nuevo fine-tune, sino de un derivado de despliegue comprimido: los pesos originales se cuantizan con AWQ asimetrico de 4 bits y se empaquetan en formato OpenVINO IR.

El modelo mantiene la plantilla de chat y el tokenizer originales de Gemma 4, admite uso con razonamiento activado (`enable_thinking=True`) o respuesta directa, y conserva artefactos de embeddings de vision en el repositorio, aunque el autor no ha validado el comportamiento multimodal de esta conversion. El repositorio ocupa aproximadamente 18,15 GiB (19,49 GB) e incluye cuatro tablas de busqueda F32 para RoPE que cubren las posiciones 0 a 131071.

La relevancia de esta ficha es doble: por un lado, da a los usuarios de hardware Intel una via de ejecucion para un fine-tune de rol de 31B; por otro, conviene subrayar que el propio autor advierte de que la cualificacion de inferencia especifica de Artemis esta pendiente y que no existen benchmarks publicados de procesamiento de prompt ni de decodificacion. Es, por tanto, un artefacto util para experimentacion, no una release certificada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Gemma 4 (el autor indica explicitamente "dense Gemma 4", no la variante 26B-A4B MoE) |
| Parametros totales | 31B (segun la denominacion de la arquitectura Gemma 4 31B indicada en la model card) |
| Parametros activos | no aplica: arquitectura densa |
| Longitud de contexto | Cota posicional de 131072 posiciones segun las tablas RoPE (0-131071); el autor aclara que es un limite posicional, no una ventana de contexto probada |
| Tipos de cuantizacion | INT4 AWQ asimetrico, group size 128, ratio 1.0; calibracion data-free (sin dataset de conversaciones ni de benchmark) |
| Idiomas soportados | no disponible (no se publica lista de idiomas; el modelo conserva la plantilla de chat de Gemma 4) |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | OpenVINO IR (no GGUF, no checkpoint de Transformers); incluye tokenizer y model card en el repositorio |

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Gemma 4 con 31B parametros. La model card insiste en que se trata de la variante densa y no de la 26B-A4B MoE, un matiz importante porque ambas se comercializan bajo la misma generacion. Sobre esa base, TheDrummer aplica su fine-tune Artemis v1.2, especializado en roleplay y escritura creativa, y Wondernutts realiza despues la conversion: cuantizacion AWQ INT4 asimetrica con group size 128 y ratio 1.0, calibrada sin datos (data-free), es decir, sin usar un dataset propio de conversaciones ni de evaluacion. La revision de origen sobre la que se construye la conversion es `05d84790fceecefac4ee2adfb7cf33fdce2029f1`.

El detalle tecnico mas relevante de la conversion es el tratamiento de RoPE: se incluyen cuatro tablas de busqueda en F32 que cubren las posiciones 0 a 131071, lo que fija una cota posicional de 131072 tokens. El autor recalca que esa capacidad de las LUT no equivale a una ventana de contexto util validada. Los valores de muestreo por defecto que acompanan al modelo son `do_sample=true`, `temperature=1.0`, `top_k=64` y `top_p=0.95`; no se especifican valores de repeticion, frecuencia, presencia ni Min-P, y la model card pide no atribuir a TheDrummer los valores anadidos por cada frontend. La plantilla de chat y el tokenizer originales deben conservarse tal cual: no se debe sustituir por una plantilla ChatML generica.

## Capacidades

- Generacion de texto y conversacion multi-turno con la plantilla de chat nativa de Gemma 4.
- Escritura creativa y roleplay, el dominio para el que fue ajustado el modelo base Artemis.
- Modo razonamiento opcional mediante `enable_thinking=True`; el autor recomienda separar el razonamiento de la respuesta mostrada y aumentar el presupuesto de tokens de salida.
- Modo de respuesta directa con `enable_thinking=False`, adecuado para dialogos y generacion rapida.
- Artefactos de embeddings de vision presentes en el repositorio, pero comportamiento de imagen/video no cualificado en esta conversion.
- Sin soporte de audio declarado.
- No se documentan capacidades de tool calling, function calling ni uso agentico en la informacion disponible.
- No se publica lista de idiomas soportados.

## Casos de uso

- Roleplay conversacional persistente: el modelo hereda el ajuste de Artemis para personajes y dialogos largos, y puede mantener interacciones multi-turno apoyandose en la plantilla de chat de Gemma 4 y en el modo directo (`enable_thinking=False`).
- Escritura creativa asistida: generacion de narrativa, descripciones y dialogos con temperatura 1.0 y `top_p=0.95`, los valores de muestreo recomendados por el autor del fine-tune.
- Asistente de personaje para videojuegos narrativos: al ser un modelo denso de 31B cuantizado a INT4, se puede desplegar en una estacion de trabajo con Intel Arc para servir NPCs con contexto relativamente largo, siempre que se ajuste el presupuesto de memoria de la cache KV.
- Razonamiento con presupuesto ampliado: activando `enable_thinking=True` y aumentando `max_new_tokens`, se puede usar para tareas de analisis o planificacion dentro de una interfaz que separe el bloque de razonamiento de la respuesta final.
- Despliegue en entornos Intel Arc sobre Linux: la conversion esta pensada especificamente para OpenVINO GenAI sobre GPU Arc, lo que permite ejecutar un 31B en hardware Intel sin depender de CUDA.
- Experimentacion y evaluacion interna: util para equipos que quieran medir el coste real de un 31B INT4 en OpenVINO antes de comprometerse con una arquitectura de servicio.
- Base para pipelines de generacion creativa por lotes: combinado con el toolkit de conversion y serving del autor, se puede integrar en un flujo de generacion de contenido de texto donde la latencia no sea critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe todavia ningun benchmark de procesamiento de prompt ni de decodificacion especifico de Artemis, y advierte de que las cifras de Orion, Chimera-X u otros checkpoints de 31B no deben presentarse como mediciones de este modelo.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 18,15 GiB / 19,49 GB en INT4 AWQ, segun el propio repositorio.
- Esa cifra no es el consumo total de VRAM: hay que sumar cache KV, compilacion de grafo, buffers temporales y, si se usa, el modulo de vision.
- El autor no promete encaje en GPU de 16 GB ni capacidad de offload.
- Incluso en una GPU de 32 GB es necesario definir un presupuesto de contexto y memoria adecuado.
- Hardware de referencia declarado por el autor: Intel Arc Pro B70 con 32 GB de VRAM y Linux.
- No se reclama rendimiento equivalente en B50, A770, Windows o CPU.
- Runtime: OpenVINO GenAI (`openvino-genai==2026.3.0.0` en el ejemplo), con `transformers==5.5.0` y `huggingface_hub` solo para formatear el prompt con el tokenizer. No es compatible con GGUF ni con pesos de Transformers.
- El ejemplo de la model card usa `ov_genai.VLMPipeline(model_dir, "GPU")` y no configura planificador de produccion, cache de prefijos, cache KV cuantizada ni limites de concurrencia.
- Los kernels personalizados del fork de OpenVINO del autor no estan incluidos en los pesos y se instalan por separado; su perfil denso de 31B no esta validado automaticamente por los ejemplos de 12B o 26B.
- Latencia y throughput: no disponibles, no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Artemis-31B-v1.2-int4-ov | 31B | Densos, Gemma 4 | Cota posicional de 131072 (no validada) | OpenVINO IR, INT4 AWQ | no disponible | Repositorio HuggingFace, 0 descargas |
| TheDrummer/Artemis-31B-v1.2 (base) | 31B | Densos, Gemma 4 | no disponible | Pesos de Transformers | no disponible | HuggingFace |
| Variante Gemma 4 26B-A4B MoE | 26B (A4B) | MoE | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la model card. No se dispone de datos de licencia, contexto ni rendimiento para las alternativas, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La cualificacion de inferencia especifica de Artemis esta pendiente segun el propio autor: la conversion y las comprobaciones estructurales pasaron, pero no la validacion funcional completa.
- La calibracion AWQ se hizo sin datos (data-free), lo que puede degradar la calidad respecto al modelo original en dominios concretos.
- La ventana de 131072 posiciones es una cota posicional derivada de las LUT de RoPE, no una ventana de contexto util probada.
- El tamano del repositorio no equivale al consumo de VRAM: cache KV, compilacion de grafo y buffers adicionales incrementan el uso real.
- No hay benchmarks publicados de prompt processing ni de decode para este modelo.
- La vision no esta cualificada aunque los embeddings esten presentes; no se debe asumir soporte multimodal funcional.
- No se declara soporte de audio.
- No se documentan capacidades de tool calling ni de agentes.
- La licencia no aparece en la informacion disponible; dado que la base es Gemma 4, conviene verificar los terminos aplicables antes de cualquier uso comercial.
- No se publica lista de idiomas; el comportamiento multilingue no esta garantizado.
- Riesgo de alucinacion: no hay datos especificos, pero es un modelo generativo de 31B sin evaluacion publicada, por lo que el riesgo debe asumirse como el de cualquier modelo de su clase.
- No sustituir la plantilla de chat ni el tokenizer originales por ChatML generico: puede degradar el comportamiento del fine-tune.
- Al ser un artefacto pensado para OpenVINO GenAI sobre Intel Arc en Linux, no es directamente portable a stacks CUDA ni a llama.cpp.
- Los ejemplos de la model card no configuran un entorno de produccion (scheduler, prefix caching, limites de concurrencia).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wondernutts/Artemis-31B-v1.2-int4-ov
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Model card del modelo base (revision referenciada): https://huggingface.co/TheDrummer/Artemis-31B-v1.2/blob/05d84790fceecefac4ee2adfb7cf33fdce2029f1/README.md
- Perfil de TheDrummer: https://huggingface.co/TheDrummer
- Toolkit de conversion, LUT y serving para Gemma 4: https://github.com/Wondernuttz/OpenVino-For-Gemma-4
- Documentacion de serving: https://github.com/Wondernuttz/OpenVino-For-Gemma-4/tree/main/serving
- Fork personalizado de OpenVINO: https://github.com/Wondernuttz/openvino
