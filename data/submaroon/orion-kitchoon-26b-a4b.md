# SubMaroon/Orion-Kitchoon-26B-A4B

## Resumen

Orion-Kitchoon-26B-A4B es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario SubMaroon en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un merge: parte del modelo Orion 26B A4B v1.1 de TheDrummer, que se mantiene intacto, y sobre el que se aplica una fusion ligera del modelo Kitchoon (concretamente se incorpora su LoRA OV en las capas 10 a 29 con un factor de 0,32). El resultado conserva el conocimiento del modelo base de Orion al tiempo que hereda parte del caracter conversacional y de roleplay de Kitchoon.

El modelo tiene 25.805.936.206 parametros totales (aproximadamente 25,8 mil millones) y la nomenclatura A4B del nombre sugiere que activa alrededor de 4 mil millones por token, lo que lo situa en la categoria de MoE dispersos con coste de inferencia relativamente bajo respecto a su tamano total. Esta etiquetado dentro de la familia Gemma (tag gemma4) y se distribuye con licencia Gemma, en ingles unicamente.

Su relevancia practica se limita al nicho de generacion creativa y roleplay: es un modelo de la comunidad, sin resultados de benchmarks publicados, con cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que debe tratarse como un experimento de fusion de pesos mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma (tag gemma4) |
| Parametros totales | 25.805.936.206 (unos 25,8B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere unos 4B por token, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MoE de la familia Gemma. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, porque no se ha entrenado desde cero: se trata de una fusion de pesos. La model card indica explicitamente que el modelo Orion 26B A4B v1.1 de TheDrummer se mantiene "a plena potencia" y que lo unico que se anade es el LoRA OV de Kitchoon en las capas 10 a 29, con un peso de 0,32. No se modifica ningun otro componente.

Esta tecnica de merge por inyeccion de LoRA en un rango intermedio de capas busca trasladar rasgos de estilo y comportamiento (aqui, el caracter de roleplay de Kitchoon) sin degradar las capacidades del modelo base, evitando una fusion completa que suele producir degeneraciones. No se documentan innovaciones de atencion, decodificacion especulativa ni mecanismos de contexto extendido.

## Capacidades

- Generacion de texto y conversacion multi-turno orientada a roleplay y narrativa.
- Generacion creativa en ingles: ficcion, dialogos y personajes.
- Hereda las capacidades base del modelo Orion 26B A4B v1.1, cuyo detalle no esta documentado en la informacion disponible.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible.

## Casos de uso

- Roleplay conversacional: el modelo esta disenado especificamente para mantener un personaje a lo largo de conversaciones, gracias a la mezcla del caracter de Kitchoon sobre la base de Orion.
- Chatbots de personajes para comunidades de ficcion: puede desplegarse como backend de una interfaz de chat donde el usuario define un personaje mediante system prompt y mantiene el rol en cada turno.
- Escritura creativa asistida: generacion de dialogos, escenas y tramas narrativas en ingles para autores que necesitan borradores rapidos.
- Prototipado de asistentes de ficcion interactiva (novelas visuales, juegos de texto): su naturaleza MoE con pocos parametros activos permite respuestas con latencia baja en GPUs de gama alta.
- Experimentacion en investigacion de merges: util como caso de estudio de como la inyeccion parcial de un LoRA OV afecta al comportamiento de un modelo base ya fusionado.
- Generacion de datos sinteticos de dialogo: puede usarse para producir conversaciones etiquetadas que alimenten pipelines de ajuste fino de otros modelos, siempre que se respete la licencia Gemma.
- Fine-tuning posterior especifico de dominio: al distribuirse en safetensors sin cuantizar, sirve como punto de partida para un ajuste fino en tareas de roleplay especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de MMLU, HumanEval, GSM8K ni evaluaciones de roleplay, y el repositorio registra cero descargas y cero valoraciones.

## Requisitos de hardware

- Peso en precision completa (BF16/FP16): aproximadamente 51,6 GB, coherente con el tamano del repositorio. Requiere una GPU con al menos 60-80 GB de VRAM (A100 80 GB, H100 80 GB) o varias GPUs en paralelo.
- Cuantizacion a 8 bits: en torno a 26 GB de VRAM; encaja en A100 40 GB y queda al limite en una RTX 4090 de 24 GB, por lo que no es una opcion comoda en consumer.
- Cuantizacion a 4 bits: estimada en 13-16 GB de VRAM; cabe en RTX 4090, RTX 3090, RTX 4080 y GPUs consumer con 16 GB o mas. No hay archivos GGUF publicados en el repositorio, por lo que habria que generarlos.
- Al ser un MoE con unos 4B parametros activos (segun nomenclatura), el coste computacional por token es inferior al de un modelo denso de 26B, lo que reduce la latencia esperada en hardware con suficiente memoria para alojar todos los expertos.
- Opciones de despliegue: transformers con safetensors; vLLM y text-generation-inference si soportan la arquitectura MoE concreta de esta familia; llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Orion-Kitchoon-26B-A4B | 25,8B (MoE, ~4B activos) | no disponible | gemma | HuggingFace |
| TheDrummer/Orion-26B-A4B-v1.1 | no disponible | no disponible | no disponible | HuggingFace |
| SubMaroon/Kitchoon-V2-26B-A4B | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (Gemma densos, Mistral, Qwen u otros MoE) en cuanto a rendimiento, contexto o resultados de evaluacion, ya que no hay benchmarks publicados para este modelo ni un detalle claro de los modelos base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo entrenado principalmente en ingles y orientado a roleplay, es probable que reproduzca sesgos culturales y de representacion presentes en ese corpus.
- Riesgo de alucinacion: alto en tareas factuales. Es un modelo de roleplay y merge, sin optimizacion para veracidad ni acceso a fuentes.
- Limitacion de idioma: solo ingles. No se declara soporte para castellano ni otros idiomas.
- Contexto: se desconoce la longitud de contexto efectiva; conviene verificar el configuracion del modelo base antes de usarlo en conversaciones largas.
- Licencia Gemma: uso comercial permitido bajo los terminos de Google, que incluyen obligaciones de atribucion y una politica de uso aceptable restrictiva. Es imprescindible revisar el texto completo antes de desplegarlo en producto.
- Es un merge no evaluado: cero descargas y cero validaciones externas. No hay garantia de que la inyeccion del LoRA no haya degradado capacidades del modelo base.
- No se han publicado archivos cuantizados (GGUF, AWQ, GPTQ), lo que anade trabajo de conversion si se quiere desplegar en consumer.
- Adecuacion a produccion: baja. Es un modelo experimental de nicho, sin benchmarks, sin soporte y sin documentacion tecnica detallada.

## Enlaces

- HuggingFace: https://huggingface.co/SubMaroon/Orion-Kitchoon-26B-A4B
- Modelo base Orion: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Modelo base Kitchoon: https://huggingface.co/SubMaroon/Kitchoon-V2-26B-A4B
