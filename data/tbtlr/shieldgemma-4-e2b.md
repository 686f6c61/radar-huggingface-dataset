# tbtlr/shieldgemma-4-e2b

## Resumen

ShieldGemma 4 E2B es un clasificador de seguridad multiformato (texto e imagen) obtenido mediante un fine-tune con LoRA del modelo multimodal `google/gemma-4-E2B-it`. Lo publica el usuario independiente `tbtlr` y no es un lanzamiento oficial de Google ni del equipo ShieldGemma original. Su funcion es responder, dada una politica de seguridad concreta, si un prompt de usuario, un par prompt/respuesta o una imagen incumplen dicha politica. La salida no es texto libre, sino la probabilidad del token `Yes` frente a `No` en la primera posicion generada, lo que lo convierte en un componente de guardrail facil de integrar en pipelines de moderacion.

El modelo resuelve un problema concreto: desplegar un filtro de contenido unico que cubra tanto entradas textuales como imagenes, con condicionamiento por politica y sin necesidad de entrenar clasificadores separados. Al derivar de un modelo Gemma 4 con torre de vision, conserva la capacidad de procesar imagenes junto a texto, algo que los clasificadores de seguridad puramente textuales no ofrecen.

Es relevante ahora porque la moderacion multimodal se ha vuelto un requisito en productos con generacion de imagen y agentes conversacionales, y porque el modelo se distribuye con licencia Apache 2.0 sobre pesos y codigo, con un aviso explicito sobre las licencias de los datos de entrenamiento que el usuario comercial debe evaluar. El repositorio ocupa 10,2 GB y declara 5.104.297.539 parametros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con torre de vision y torre de audio congeladas; fine-tune LoRA fusionado en los pesos del modelo de lenguaje |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal imagen-texto con torre de vision y torre de audio. El fine-tune aplica LoRA con rango 16 exclusivamente sobre las proyecciones de atencion y MLP del modelo de lenguaje, dejando congeladas las torres de vision y audio; los adaptadores se fusionan en los pesos base en este repositorio. La cabeza de clasificacion no es una capa nueva: se reutiliza la distribucion del primer token generado, comparando los logits de `Yes` y `No` mediante softmax, de modo que la inferencia requiere una sola pasada forward con `logits_to_keep=1`.

El entrenamiento se realizo en dos fases con entropia cruzada sobre el token de respuesta, en bf16 y sobre una DGX Spark. La primera fase cubre texto con 79.000 filas y learning rate 1e-4; la segunda es una continuacion multimodal con 23.500 filas de imagen mas 20.000 filas de texto de replay, a learning rate 5e-5. Cada fase dura una epoca. Los datos textuales provienen de Aegis 2.0, BeaverTails, ToxicChat (solo ejemplos benignos) y WildGuardMix; los de imagen de VLGuard, LlavaGuard (imagenes de SMID) y UnsafeBench, con COCO val2017 como negativos benignos. Las categorias de origen se mapean a las politicas ShieldGemma como positivas, ambiguas (descartadas) o negativas. Las plantillas exactas y las cadenas de politica estan en `shield_policies.json`.

## Capacidades

- Clasificacion de seguridad condicionada por politica: devuelve la probabilidad de violacion para prompt de usuario, par prompt/respuesta o imagen.
- Politicas de texto (redaccion ShieldGemma v1): contenido peligroso, acoso, discurso de odio, contenido sexualmente explicito, violencia, obscenidad y una politica compuesta de "cualquier dano".
- Politicas de imagen (redaccion ShieldGemma 2): contenido sexualmente explicito, violencia/gore, contenido peligroso y una compuesta.
- Generalizacion a politicas no vistas: segun el autor, sigue definiciones de politica con las que no fue entrenado, probado con las ocho definiciones de OpenAI Moderation.
- Entrada multimodal: acepta imagen junto a texto en el mismo pipeline `image-text-to-text`.
- Salida calibrada como probabilidad binaria, apta para umbralizar en produccion.
- No es un modelo generativo de proposito general: no se documenta tool calling, razonamiento multi-paso ni modo thinking.
- Existe un modelo hermano, `tbtlr/shieldgemma-4-e2b-trimodal`, que anade clasificacion de peticiones habladas a costa de una ligera perdida en OpenAI Moderation (0,764 frente a 0,787 de F1).

## Casos de uso

- Moderacion de comentarios en plataformas UGC: el modelo clasifica cada mensaje contra la politica de odio o acoso y devuelve una probabilidad que se umbraliza; al ser una sola pasada forward, el coste por peticion es bajo y permite filtrar en linea antes de la revision humana.
- Filtrado de entradas en asistentes conversacionales: intercepta prompts de usuario antes de enviarlos al modelo generativo, aplicando la politica compuesta de "cualquier dano" y bloqueando casos de contenido peligroso o sexualmente explicito.
- Moderacion de pares prompt/respuesta en sistemas RAG o de atencion al cliente: evalua conjuntamente la pregunta y la respuesta generada, lo que permite detectar respuestas toxicas aunque el prompt fuera benigno.
- Revision de imagenes subidas por usuarios: con la politica de imagen de violencia/gore o contenido sexual, se integra como paso previo en un pipeline de carga de archivos para marcar contenido antes de su publicacion.
- Ajuste de politicas sin reentrenar: al ser condicionado por texto de politica, un equipo legal puede cambiar la definicion de una politica en `shield_policies.json` y reutilizar los mismos pesos, sin necesidad de un nuevo fine-tune.
- Evaluacion comparativa de taxonomias de seguridad: sus salidas por politica permiten medir la distancia entre la taxonomia propia de un producto y las politicas ShieldGemma, util para calibrar umbrales y detectar categorias fuera de alcance (odio, politica, privacidad, fraude, desinformacion).
- Guardrail en pipelines de generacion de imagen: filtra prompts de texto e imagenes de salida candidatas antes de servirlas al usuario, con la ventaja de cubrir ambos formatos con un unico modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor (F1 optimo / AU-PRC, politica compuesta salvo indicacion). La comparacion con ShieldGemma 2B corresponde a los valores del paper citados por el autor, no a una evaluacion propia.

| Benchmark | F1 optimo | AU-PRC |
|---|---|---|
| ToxicChat (texto) | 0,767 | 0,834 |
| Aegis 2.0 test (texto) | 0,826 | 0,897 |
| BeaverTails (texto) | 0,839 | 0,918 |
| WildGuardTest (texto) | 0,780 | 0,866 |
| XSTest (texto) | 0,886 | 0,960 |
| OpenAI Moderation (texto) | 0,787 | 0,856 |
| UnsafeBench test, sexual (imagen) | 0,841 | 0,908 |
| UnsafeBench test, dangerous (imagen) | 0,684 | 0,723 |
| UnsafeBench test, violence (imagen) | 0,652 | 0,687 |
| UnsafeBench test, compuesta (imagen) | 0,692 | 0,776 |
| LlavaGuard test, compuesta | 0,679 | 0,675 |
| VLGuard test, compuesta | 0,743 | 0,804 |

Referencia del paper de ShieldGemma 2B en ToxicChat: 0,704 de F1 y 0,778 de AU-PRC. El autor indica que las tablas completas y los analisis de errores estan en el README del repositorio del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 10-11 GB solo para pesos (5,1 mil millones de parametros), mas el coste de activaciones y de la torre de vision; el repositorio ocupa 10,2 GB.
- Cuantizacion: no se documentan pesos GGUF ni cuantizaciones oficiales; con cuantizacion de 8 bits o 4 bits cabria en GPUs de 8-12 GB, pero requeriria convertir los pesos por cuenta propia.
- GPU recomendadas: A100, H100 o L40S para despliegue de alta concurrencia; RTX 4090 (24 GB) para servir en bf16 sin margen ajustado.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 16 GB en bf16 con cuidado de la memoria de activaciones; en 8 GB solo con cuantizacion.
- Opciones de despliegue: `transformers` con `Gemma4ForConditionalGeneration` y `AutoProcessor`; el autor menciona `endpoints_compatible` en los tags, pero no documenta integraciones con vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles. Al requerir una sola pasada forward con `logits_to_keep=1`, la latencia por peticion deberia ser la de un forward corto del modelo base, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | F1 ToxicChat (compuesta) | Licencia |
|---|---|---|---|---|---|
| tbtlr/shieldgemma-4-e2b | 5,10 B | texto + imagen | no disponible | 0,767 | Apache 2.0 (con caveat de datos) |
| ShieldGemma 2B (paper) | 2 B (aprox.) | texto | no disponible | 0,704 | Gemma Terms |
| tbtlr/shieldgemma-4-e2b-trimodal | 5,10 B (aprox.) | texto + imagen + audio | no disponible | no disponible (OpenAI Moderation 0,764) | Apache 2.0 (con caveat de datos) |

La comparacion con ShieldGemma 2B es la unica con datos numericos en la informacion disponible; el modelo trimodal es un hermano del mismo autor y no un competidor externo. No se dispone de datos de otros clasificadores multimodales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no hay soporte documentado para otros idiomas, lo que limita su uso en productos multilingues.
- Las puntuaciones binarias de "cualquier inseguro" dependen de la distancia entre la taxonomia del benchmark y las politicas del modelo; categorias como odio, politica, privacidad, fraude y desinformacion quedan fuera de alcance.
- La politica de contenido peligroso en imagen se entreno con una lectura mas amplia (armas, abuso de sustancias, planificacion criminal, imagenes de autolesion) que su equivalente textual, lo que puede producir umbrales inconsistentes entre modalidades.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y falsos negativos: la salida es una probabilidad que requiere calibracion por caso de uso.
- Licencia de pesos y codigo Apache 2.0, pero dos conjuntos de datos de texto (BeaverTails y ToxicChat) son CC BY-NC 4.0; el autor advierte que la transferencia de esa restriccion a los pesos es juridicamente discutida y que los usuarios comerciales deben evaluarlo por su cuenta.
- UnsafeBench esta sujeto a un acuerdo de uso de datos con restricciones (investigacion, educacion y uso comercial responsable), lo que anade otra capa de revision legal.
- No sustituye la revision humana en entornos de alto riesgo, segun el propio autor.
- Modelo independiente sin afiliacion a Google; no debe presentarse como lanzamiento oficial de ShieldGemma.
- No se documentan contexto maximo, cuantizaciones ni latencias, lo que dificulta la planificacion de capacidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbtlr/shieldgemma-4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo hermano trimodal: https://huggingface.co/tbtlr/shieldgemma-4-e2b-trimodal
- Dataset Aegis 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset ToxicChat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset WildGuardMix: https://huggingface.co/datasets/allenai/wildguardmix
- Dataset VLGuard: https://huggingface.co/datasets/ys-zong/VLGuard
- Dataset LlavaGuard: https://huggingface.co/datasets/AIML-TUDA/LlavaGuard
- Dataset UnsafeBench: https://huggingface.co/datasets/yiting/UnsafeBench
