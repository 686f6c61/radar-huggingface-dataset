# yachen4ever/SparkMuse-4B-MLX-4bit

## Resumen

SparkMuse-4B-MLX-4bit es una cuantizacion en 4 bits para MLX del modelo hcnote/SparkMuse-4B, un ajuste fino orientado a escritura creativa, generacion de novelas y roleplay. El modelo original deriva a su vez de iFlytek Spark X2.5, identificado en la model card con la arquitectura interna `spark2_5`, que segun su autor soporta una ventana de contexto de 1 millon de tokens. El repositorio lo publica el usuario yachen4ever y su relevancia actual es fundamentalmente practica: permite ejecutar un modelo de 4.112.079.360 parametros en equipos Apple Silicon con un consumo de memoria residente de aproximadamente 2,5 GB.

La cuantizacion es affine de 4 bits con group_size 64 aplicada a todos los tensores 2D, incluido el embedding, con lo que los pesos pasan de 7,7 GB en BF16 a 2,3 GB. El autor reporta unas 129 tokens/s de decodificacion en un M2 Ultra con 192 GB de memoria unificada, frente a las 60 tokens/s del modelo BF16 sin cuantizar, es decir, algo mas del doble de velocidad.

Se trata de un modelo especializado en prosa y dialogo, con soporte declarado de chino e ingles, licencia apache-2.0 y formato de pesos safetensors empaquetado para MLX. No se han publicado benchmarks, no hay descargas registradas y requiere un motor especifico (mlx-serve 26.9.5 o superior) porque `mlx-lm` en su rama 0.31.x todavia no implementa la arquitectura `spark2_5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (derivada de iFlytek Spark X2.5); el autor no detalla si es transformer denso, MoE o hibrida |
| Parametros totales | 4.112.079.360 (aproximadamente 4,11 mil millones) |
| Parametros activos | no disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | 1.000.000 tokens (segun la model card del modelo base) |
| Tipos de cuantizacion | affine 4-bit, group_size 64, aplicada a todos los tensores 2D incluido el embedding; el modelo base esta disponible en BF16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con cuantizacion MLX; tamano del repositorio 2,3 GB |
| Biblioteca requerida | `mlx` (mlx-serve 26.9.5+); no compatible con mlx-lm 0.31.x |
| Modelo base | hcnote/SparkMuse-4B |
| `tie_word_embeddings` | gestionado por el motor: `lm_head` comparte el embedding cuantizado |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, la misma que la de iFlytek Spark X2.5, y el autor del repositorio cuantizado no aporta detalles adicionales sobre su composicion interna (numero de capas, tipo de atencion, uso de MoE o de mecanismos hibridos). El dato mas relevante es que se trata de una arquitectura no estandar en el ecosistema: el propio autor indica que `modeling_spark.py` y `configuration_spark.py` (codigo personalizado de transformers) no son necesarios porque mlx-serve la implementa de forma nativa, y que `mlx-lm` 0.31.x todavia no la soporta. El modelo base SparkMuse-4B es un ajuste fino de Spark X2.5 orientado a escritura creativa, generacion de novelas y roleplay.

En cuanto al entrenamiento, no se dispone de informacion sobre el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; la model card solo describe la finalidad del ajuste fino. La innovacion tecnica verificable de este repositorio concreto es la cuantizacion: esquema affine de 4 bits con group_size 64 aplicado a todos los tensores 2D incluyendo el embedding, con `lm_head` compartiendo el embedding cuantizado, lo que reduce el peso de 7,7 GB en BF16 a 2,3 GB y mas que duplica la velocidad de decodificacion medida (129 tok/s frente a 60 tok/s en M2 Ultra).

## Capacidades

- Generacion de texto creativo: prosa narrativa, continuacion de manuscritos y generacion de novelas, que es el objetivo declarado del ajuste fino.
- Roleplay y dialogo conversacional: la model card etiqueta el modelo como conversacional y orientado a interpretacion de personajes.
- Conversaciones multi-turno con contexto muy largo: la arquitectura base declara 1.000.000 de tokens de ventana, lo que permite mantener coherencia sobre textos extensos.
- Bilinguismo chino-ingles: los idiomas declarados son zh y en, sin informacion sobre otros idiomas.
- Escritura sensible a estilo y tono: el ajuste esta especializado en registro literario, no en tareas factuales.
- Servido mediante API compatible con OpenAI: el endpoint `/v1/chat/completions` de mlx-serve permite integrarlo en aplicaciones existentes.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente o razonamiento multi-paso: no disponible (no se mencionan).
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible (no se mencionan).
- Matematicas y generacion de codigo: no disponible como capacidad declarada; el modelo esta orientado a escritura creativa.

## Casos de uso

- Generacion de novelas y ficcion larga: con una ventana declarada de 1.000.000 de tokens, el modelo puede mantener arcos narrativos completos y continuar un manuscrito sin perder el hilo de personajes y tramas establecidos cientos de miles de tokens antes.
- Roleplay y personajes consistentes: su ajuste especifico para roleplay y su naturaleza conversacional lo hacen adecuado para asistentes de personaje en aplicaciones de entretenimiento, manteniendo voz y personalidad a lo largo de sesiones largas.
- Escritura creativa local con privacidad: al ejecutarse en Apple Silicon con unos 2,5 GB de memoria residente, permite trabajar con manuscritos ineditos o material sensible sin enviar texto a servicios en la nube.
- Edicion y reescritura de estilo: se puede usar para reformular pasajes, ajustar registro o generar variantes de un mismo fragmento, integrndolo en un flujo de trabajo de edicion por lotes.
- Ficcion interactiva y narrativa para videojuegos: gracias al endpoint compatible con OpenAI en `http://127.0.0.1:11234/v1/chat/completions`, se puede conectar a un motor de juego que solicite texto generado en tiempo real, con 129 tok/s de decodificacion en M2 Ultra.
- Generacion de datos sinteticos de ficcion en lote: el incremento de velocidad de la cuantizacion (mas del doble respecto al BF16) reduce el coste de generar grandes volumenes de texto narrativo para entrenar o evaluar otros modelos.
- Prototipado de aplicaciones conversacionales bilingues zh/en: sirve para validar productos dirigidos a los mercados chino y angloparlante sin depender de infraestructura CUDA.
- Asistente de guion y dialogos: util para generar variantes de dialogo entre personajes, ya que el ajuste prioriza naturalidad conversacional sobre precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son medidas de velocidad de inferencia, no de calidad:

| Metrica | Valor |
|---|---|
| Decodificacion en M2 Ultra (192 GB), MLX 4-bit | aproximadamente 129 tok/s |
| Decodificacion en M2 Ultra (192 GB), BF16 original | aproximadamente 60 tok/s |
| Tamano de pesos 4-bit | 2,3 GB |
| Tamano de pesos BF16 | 7,7 GB |
| Memoria residente | aproximadamente 2,5 GB |

## Requisitos de hardware

- VRAM (memoria unificada) estimada para inferencia: aproximadamente 2,5 GB residentes en la version 4-bit, frente a los 7,7 GB de pesos en BF16.
- Cabe en GPU de consumo: si, en cualquier equipo Apple Silicon con al menos 8 GB de memoria unificada, dado el reducido consumo de 2,5 GB. No hay soporte para GPUs NVIDIA o AMD en este repositorio, que es exclusivamente MLX.
- GPU recomendadas: Apple Silicon. El unico dato de rendimiento publicado corresponde a un M2 Ultra con 192 GB (129 tok/s de decodificacion). No hay cifras para M1, M2, M3 o M4 de gama base.
- Opciones de despliegue: `mlx-serve` 26.9.5 o superior, que implementa la arquitectura `spark2_5` de forma nativa y expone un endpoint compatible con OpenAI en el puerto 11234. `mlx-lm` 0.31.x no soporta esta arquitectura. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta aproximadamente 129 tok/s de decodificacion en M2 Ultra con 192 GB. No se proporciona la latencia hasta el primer token.

## Comparativa con modelos similares

No hay datos de benchmarks publicados que permitan comparar este modelo con alternativas de la misma categoria. La unica comparacion documentada es contra el propio modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Tamano en disco | Velocidad (M2 Ultra) | Licencia |
|---|---|---|---|---|---|---|
| yachen4ever/SparkMuse-4B-MLX-4bit | 4,11 B | 1.000.000 tokens (declarado en la arquitectura base) | safetensors MLX 4-bit (affine, group_size 64) | 2,3 GB | aproximadamente 129 tok/s | apache-2.0 |
| hcnote/SparkMuse-4B | 4,11 B | 1.000.000 tokens (declarado) | safetensors BF16 | 7,7 GB | aproximadamente 60 tok/s | no disponible en la informacion proporcionada |
| Otros modelos de escritura creativa de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no incluye comparaciones con modelos de otros desarrolladores del mismo rango de parametros, por lo que no es posible establecer una comparativa de rendimiento o calidad.

## Limitaciones y advertencias

- Contenido sensible: el repositorio original (hcnote/SparkMuse-4B) esta etiquetado por su autor como `nsfw` / contenido sensible. El propio autor de la version cuantizada recomienda usarlo bajo criterio propio.
- Sesgos conocidos: no disponible. No se ha publicado informacion sobre sesgos de genero, culturales o de otro tipo en el dataset de ajuste.
- Riesgo de alucinacion: el modelo esta optimizado para escritura creativa y roleplay, no para precision factual. Es esperable que invente detalles en tareas de recuperacion de informacion, dato que debe tenerse en cuenta si se usa fuera de su dominio previsto.
- Limitaciones de idioma: solo se declaran chino e ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: la ventana de 1.000.000 de tokens es una caracteristica declarada de la arquitectura base; no se han publicado pruebas de recuperacion efectiva (needle in a haystack) que confirmen el comportamiento real a esa longitud.
- Restricciones de licencia: el repositorio se publica bajo apache-2.0, lo que en principio permite uso comercial. Sin embargo, no se detalla la licencia del modelo base hcnote/SparkMuse-4B ni las condiciones de iFlytek Spark X2.5 subyacente, por lo que conviene verificar la cadena de licencias antes de un despliegue en produccion.
- Dependencia de un motor especifico: requiere mlx-serve 26.9.5 o superior. No funciona con mlx-lm 0.31.x ni con los runners habituales de CUDA (vLLM, TGI, llama.cpp, Ollama), lo que limita el despliegue a Apple Silicon.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, publicacion y ultima actualizacion el 21 de septiembre de 2026, sin benchmarks ni validacion externa.
- Ausencia de datos de cuantizacion de calidad: el autor reporta velocidad, pero no hay evaluacion de la perdida de calidad provocada por la cuantizacion a 4 bits con group_size 64, que afecta tambien al embedding.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yachen4ever/SparkMuse-4B-MLX-4bit
- Modelo base: https://huggingface.co/hcnote/SparkMuse-4B

No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos corresponden a paginas de soporte de Microsoft (contacto, inicio de sesion en Hotmail, blog de Microsoft Copilot y tasa de refresco de monitor en Windows) sin relacion alguna con el modelo. No hay disponibles enlaces a papers, blogs tecnicos, repositorios de codigo ni demos en la informacion proporcionada.
