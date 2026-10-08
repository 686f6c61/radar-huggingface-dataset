# xbill9/gemma-4-31B-it-qat-w8a8-int8

## Resumen

`xbill9/gemma-4-31B-it-qat-w8a8-int8` es un build no oficial del modelo Gemma 4 31B-it de Google DeepMind, publicado de forma independiente por el usuario xbill9. No se trata de un modelo nuevo ni de un reentrenamiento: es una reconversión de formato de los pesos *quantization-aware training* (QAT) de Google, tomados de `google/gemma-4-31B-it-qat-q4_0-unquantized` (revision `1e4d8be`), almacenados ahora como int8 W8A8 mediante compressed-tensors. La finalidad es servir el modelo en vLLM con pesos int8 y activaciones cuantizadas a int8 por token en tiempo de ejecución, sin necesidad de datos de calibración.

El checkpoint ocupa 29,91 GiB y declara 30.697.345.340 parámetros (unos 31B). Solo incluye el modelo de texto: la variante multimodal queda fuera de este repositorio. Los pesos QAT originales ya estaban ajustados a la rejilla Q4_0, y este build los redondea a int8 por canal, con un error relativo medio de entre el 0,85 % y el 1,02 % según la capa.

Su relevancia es doble. Por un lado, permite desplegar un modelo de 31B en formato int8 con la infraestructura estándar de vLLM y compressed-tensors, reduciendo el consumo de memoria frente a bf16. Por otro, está pensado como material de estudio sobre cuantización: el autor documenta el error introducido por capa y publica los scripts de conversión. En el momento de redactar esta ficha el repositorio acumula 14 descargas, no tiene likes y el propio autor advierte de que el modelo todavía no se ha servido ni evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 30.697.345.340 (aproximadamente 31B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8: pesos int8 con una escala bf16 por canal de salida y activaciones cuantizadas a int8 por token en tiempo de ejecucion (`format: int-quantized`). Los pesos QAT de origen parten de la rejilla Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors con compressed-tensors (el autor indica tambien compatibilidad declarada con vLLM) |
| Tamano del repositorio | 32,1 GB |
| Tamano del checkpoint | 29,91 GiB |
| Modelo base | google/gemma-4-31B-it-qat-q4_0-unquantized (revision 1e4d8be) |
| Modalidad | solo texto |
| Libreria declarada | vllm |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-08 |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de formato. El autor parte de los pesos QAT de Google, que ya venían ajustados a la rejilla Q4_0, y los redondea a int8 por canal de salida, conservando una escala bf16 por canal y dejando la cuantización de activaciones (int8 por token) para el momento de la inferencia. El proceso se realiza con el script `w8a8_from_qat.py`, incluido en el propio repositorio junto con los helpers de `repack_q4_0.py` que importa. No se utiliza ningún conjunto de datos de calibración, precisamente porque las escalas se derivan directamente de los pesos QAT ya entrenados para tolerar cuantización.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO: esos detalles corresponden al modelo original de Google y no se reproducen en esta model card. La innovación técnica del build es acotada pero medible: el autor publica el error relativo de la cuantización int8 respecto a los pesos QAT por tipo de tensor, lo que permite verificar que la conversión no degrada ninguna capa por encima del 1,35 %. La variante multimodal del modelo original queda fuera de este repositorio, que se declara explícitamente text-only.

## Capacidades

- Generacion de texto e interaccion conversacional, heredadas de los pesos instruction-tuned de Gemma 4 31B-it.
- Respuesta a instrucciones en formato de dialogo (el pipeline declarado es text-generation con tag conversational).
- Razonamiento, codigo y matematicas: corresponden a las capacidades del modelo de origen, si bien no se ha publicado ninguna evaluacion de esta build que las confirme.
- Capacidades multilingues: no disponibles en la informacion proporcionada; no se declara lista de idiomas.
- Tool calling y function calling: no confirmado en esta build. El repositorio de referencia de la comunidad indica que el Gemma 4 31B original soporta tool calling, pero esta conversión no lo verifica ni lo documenta.
- Soporte de agentes y razonamiento multi-paso: no confirmado en esta build, aunque el modelo de origen está orientado a flujos agénticos.
- Vision: no soportada. El autor indica explicitamente que el build es text-only, por lo que la torre multimodal del modelo original no está incluida.
- Modo thinking explicito: no disponible.
- Servido con cuantizacion de activaciones int8 en tiempo de ejecucion, lo que reduce el coste de memoria y de ancho de banda respecto a bf16.

## Casos de uso

- Servicio de inferencia en vLLM con requisitos de VRAM ajustados: al almacenar los pesos en int8, el checkpoint de 29,91 GiB cabe en aceleradores de 32 GB o mas, algo que un despliegue en bf16 de 31B no permite con holgura. Es el caso de uso principal del repositorio.
- Comparativa de tecnicas de cuantizacion: el autor publica el error relativo por capa, de modo que el modelo sirve como referencia para medir la fidelidad de una conversion W8A8 frente a los pesos QAT originales, sin necesidad de datos de calibracion.
- Atencion al cliente automatizada: un modelo instruction-tuned de 31B puede gestionar conversaciones multi-turno, aunque la longitud de contexto no esta documentada y debe verificarse antes de dimensionar el sistema.
- Generacion de codigo asistida: integrable en un pipeline interno servido por vLLM; conviene validar primero la calidad real sobre el modelo base, ya que no hay evaluaciones publicadas de esta build.
- Procesamiento por lotes de documentos: resumen, extraccion de entidades y clasificacion de textos largos en trabajos offline, aprovechando el throughput de vLLM y la reduccion de memoria del formato int8.
- Recuperacion aumentada (RAG): el modelo puede actuar como generador final sobre fragmentos recuperados, con el corpus inyectado en el prompt; el limite practico vendra marcado por la ventana de contexto, no documentada aqui.
- Despliegue en nodos AMD Instinct MI300X: el propio autor indica que tiene planificada una bateria de servicio en una MI300X, lo que convierte este checkpoint en candidato para entornos con 192 GB de HBM3.
- Reproduccion de entornos academicos con cuantizacion: util para investigacion sobre degradacion por cuantizacion y sobre la relacion entre QAT y cuantizacion post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica expresamente que el modelo todavia no se ha servido ni evaluado.

El unico dato de rendimiento documentado es el error relativo de la cuantizacion int8 respecto a los pesos QAT de origen, por tipo de tensor:

| Capa | Tensores | Error relativo int8 frente a QAT |
|---|---:|---|
| `mlp.down_proj` | 60 | 0,93 %–1,18 % (media 1,02 %) |
| `mlp.gate_proj` | 60 | 0,80 %–0,97 % (media 0,87 %) |
| `mlp.up_proj` | 60 | 0,80 %–0,99 % (media 0,85 %) |
| `self_attn.k_proj` | 60 | 0,83 %–1,35 % (media 0,97 %) |
| `self_attn.o_proj` | 60 | 0,82 %–1,16 % (media 0,98 %) |
| `self_attn.q_proj` | 60 | 0,83 %–1,07 % (media 0,92 %) |
| `self_attn.v_proj` | 50 | 0,77 %–1,17 % (media 0,93 %) |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 30 GB en int8 (checkpoint de 29,91 GiB), a los que hay que sumar la cache KV y el overhead del motor de inferencia.
- GPU recomendadas: AMD Instinct MI300X (192 GB HBM3), NVIDIA H100 80 GB y A100 80 GB. El autor tiene programada una bateria de servicio en una MI300X.
- GPU de consumo: el repositorio de referencia de la comunidad para Gemma 4 31B indica que una sola tarjeta de 24 GB (Ampere) da OOM independientemente del formato de cache KV, que se necesita al menos 32 GB en una sola tarjeta (validado en una RTX 5090) y que el modelo corre en 2x RTX 3090 con vLLM v0.24. Esos datos corresponden a la familia Gemma 4 31B, no especificamente a este checkpoint int8.
- Opciones de despliegue: vLLM, que es la libreria declarada por el autor y la que soporta el formato compressed-tensors. No se ha publicado una conversion a GGUF, por lo que llama.cpp y Ollama no estan disponibles para este repositorio con la informacion actual.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xbill9/gemma-4-31B-it-qat-w8a8-int8 | 30.697.345.340 | no disponible | safetensors int8 W8A8 (compressed-tensors) | Apache 2.0 | Repositorio con 14 descargas, sin evaluar |
| google/gemma-4-31B-it-qat-q4_0-unquantized (modelo base) | no disponible en la informacion proporcionada | no disponible | pesos QAT sin cuantizar, rejilla Q4_0 | Apache 2.0 | Modelo oficial de Google DeepMind |
| xbill9/gemma-4-31B-it-qat-w8a8-int8-emb4 | no disponible | no disponible | safetensors int8 W8A8 (compressed-tensors) | Apache 2.0 | Variante del mismo autor, presumiblemente orientada a embeddings |
| Familia Gemma 4: E2B, E4B, 26B A4B y 31B | varia segun variante | no disponible | no disponible | Apache 2.0 | Catalogo oficial; el 26B A4B es de tipo MoE segun la nomenclatura publicada |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Build no oficial: no esta afiliado ni respaldado por Google. Los problemas deben reportarse al autor del repositorio, no a Google DeepMind.
- Sin evaluar y sin servir: el propio autor indica que el checkpoint se ha construido y verificado en local contra su origen, pero que todavia no se ha servido ni evaluado. No hay ninguna medida de calidad real.
- Solo texto: la torre multimodal del Gemma 4 31B original no esta incluida.
- Perdida de precision por cuantizacion: se documenta un error relativo de hasta el 1,35 % en algunas capas de atencion, con medias en torno al 1 %. No se ha medido su impacto sobre tareas finales.
- Idiomas no declarados: no hay lista de idiomas soportados en la informacion disponible.
- Contexto no documentado: se desconoce la ventana de contexto efectiva de esta build, un dato critico para dimensionar cache KV y para casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se ha publicado ninguna evaluacion especifica de fidelidad para esta build.
- Sesgos: no se han publicado analisis de sesgo para esta conversion. Los sesgos del modelo de origen se heredan en la medida en que la cuantizacion no los corrige.
- Licencia: Apache 2.0 con enlace a la licencia especifica de Gemma 4. Antes de un uso comercial conviene revisar los terminos de uso de Gemma, ya que el repositorio redistribuye pesos de Google en un formato distinto bajo la misma licencia.
- Compatibilidad: el formato compressed-tensors condiciona el ecosistema de despliegue a vLLM u otros motores que soporten dicho formato; no hay GGUF disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xbill9/gemma-4-31B-it-qat-w8a8-int8
- Variante emb4 del mismo autor: https://huggingface.co/xbill9/gemma-4-31B-it-qat-w8a8-int8-emb4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 en Google AI Edge (LiteRT-LM): https://developers.google.com/edge/litert-lm/models/gemma-4
- Guia comunitaria para ejecutar Gemma 4 31B en 2x RTX 3090: https://github.com/dotnfc/ai-club-rtx3090/blob/master/models/gemma-4-31b/README.md
