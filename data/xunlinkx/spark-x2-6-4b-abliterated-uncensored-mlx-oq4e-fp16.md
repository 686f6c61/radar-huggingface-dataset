# xunlinkx/Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ4e-fp16

## Resumen

Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ4e-fp16 es una cuantizacion de 4 bits en formato MLX del modelo comunitario electroglyph/Spark-X2.6-4B-uncensored, que a su vez es una derivacion "abliterated" (modificacion de pesos para reducir el comportamiento de rechazo) del modelo oficial XHToken/Spark-X2.6-4B. El autor de esta cuantizacion es el usuario de HuggingFace xunlinkx, y el modelo original pertenece al equipo SparkLLM de XHToken. No se trata de una release oficial de XHToken.

El modelo resuelve el problema de ejecutar un LLM conversacional de aproximadamente 4.100 millones de parametros en Apple Silicon con presupuesto ajustado de memoria unificada, incluyendo equipos Mac de 8 GB. La cuantizacion mezcla precisiones por capa (4 bits base, 8 bits en las 36 compuertas de atencion `self_attn.g_proj`, y 6 bits en las proyecciones Q/K/V fusionadas y en las proyecciones down del MLP) para preservar calidad en las partes mas sensibles del transformer.

Es relevante ahora porque combina tres tendencias: cuantizacion mixta de alta calidad orientada a hardware de consumo, el ecosistema MLX/oMLX para Apple Silicon, y la linea de modelos "abliterated/uncensored" que buscan eliminar el sesgo de rechazo del modelo base. La licencia Apache-2.0 heredada de la linea upstream facilita su uso comercial, aunque el contenido generado requiere moderacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 (transformer, segun tag de arquitectura del repo) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit enhanced mixed precision (oQ4e): base 4-bit, gates de atencion 8-bit, Q/K/V fusionadas y down del MLP 6-bit; group size 64, cuantizacion afina |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx`; repo de 2,7 GB; origen BF16 convertido a FP16 antes de cuantizar |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, correspondiente a la familia Spark-X2.6 de XHToken. El modelo base tiene 4.112.079.360 parametros y es un transformer de texto con atencion que incluye compuertas (`self_attn.g_proj`) en sus 36 capas, lo que sugiere un esquema de atencion con gating. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en la informacion proporcionada.

El proceso de esta ficha es una cadena de tres transformaciones: (1) el modelo oficial XHToken/Spark-X2.6-4B; (2) una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) realizada con Heretic 2.0.0.dev0 por Electroglyph, que reporta 6 rechazos en 100 prompts y una divergencia KL de 0.0027 frente al original; (3) la cuantizacion oMLX de xunlinkx con 128 muestras de calibracion, longitud de secuencia 512 y cuantizacion afina con group size 64. La innovacion tecnica destacable es el esquema de precision mixta por capa, que mantiene en 8 y 6 bits las proyecciones mas sensibles a la cuantizacion para limitar la degradacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y respuesta a preguntas generales (el ejemplo de la model card consulta la capital de la provincia de Anhui).
- Comportamiento "uncensored": reduccion deliberada de rechazos mediante ablacion de pesos; la model card reporta 6 rechazos en 100 prompts en el modelo fuente.
- Soporte de modo "thinking" con presupuesto configurable, segun indica la model card al remitir a la configuracion del runtime.
- Compatibilidad con plantillas de chat del ecosistema MLX-LM.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse con `mlx_lm.generate` en Apple Silicon (M1 a M6), lo que permite un chatbot privado sin conexion a internet ni costes de API, adecuado para portatiles con memoria unificada limitada.
- Prototipado rapido en equipos de 8 GB: al ser la variante mas pequena del conjunto y requerir 2,859 GB de memoria pico en la prueba de humo, permite iterar sobre prompts y plantillas de chat en Macs de gama base.
- Investigacion sobre alineacion y abliteration: util para estudiar el efecto de la ablacion ARA comparando respuestas con el modelo original y midiendo tasas de rechazo y divergencia de comportamiento.
- Generacion de contenido creativo sin filtros predefinidos: escritura de ficcion, guiones o dialogos donde el modelo base impondria rechazos, con moderacion externa a cargo del operador.
- Desarrollo de pipelines de inferencia MLX: sirve como banco de pruebas para validar la arquitectura `spark2_5` en oMLX/MLX-LM y para medir el impacto de la cuantizacion mixta en latencia y memoria.
- Aplicaciones bilingues ingles-chino en entornos locales: traduccion y asistencia redaccional entre ambos idiomas sin depender de servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es una prueba de humo local: 16 tokens generados con un pico de memoria de 2,859 GB en MLX, que confirma carga y generacion basica pero no constituye una evaluacion de calidad. La model card del modelo fuente reporta 6 rechazos en 100 prompts y divergencia KL de 0.0027, mediciones del autor de la ablacion no verificadas de forma independiente en este checkpoint cuantizado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 2,9 GB de pico segun la prueba de humo del autor; el repo pesa 2,7 GB.
- Hardware objetivo: Apple Silicon, de M1 a M6, con MLX u oMLX; los pesos derivados de FP16 se indican como adecuados tambien en M3 y posteriores.
- Cabe en Macs consumer con 8 GB de memoria unificada; el contexto y otras aplicaciones abiertas incrementan el consumo.
- Despliegue: `mlx_lm` u oMLX con soporte de la arquitectura `spark2_5`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se conoce la generacion de 16 tokens en la prueba de humo, sin tiempos reportados.
- Parametros de muestreo recomendados upstream: temperatura 1.0 y top-p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ4e-fp16 (este) | 4,11 B | no disponible | 4-bit mixta (oQ4e) | Apache-2.0 | Apple Silicon (MLX) |
| electroglyph/Spark-X2.6-4B-uncensored (fuente) | 4,11 B | no disponible | BF16 | Apache-2.0 | Multiplataforma |
| XHToken/Spark-X2.6-4B (oficial) | 4,11 B | no disponible | BF16/FP16 | Apache-2.0 | Multiplataforma |

Las tres variantes comparten arquitectura y numero de parametros; difieren en el grado de ablacion y en el formato de pesos. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellas ni con modelos de otras familias.

## Limitaciones y advertencias

- La ablacion reduce rechazos pero no los elimina; la model card advierte que no garantiza responder a toda peticion.
- El comportamiento "uncensored" implica riesgo de generar contenido danino, sesgado o inexacto; es responsabilidad del operador aportar moderacion, control de acceso y revision si se expone a terceros.
- Riesgo de alucinacion inherente a un modelo de 4 B sin datos de evaluacion publicados; no se han verificado sus tasas de error.
- Solo soporta ingles y chino; el rendimiento en castellano no esta documentado.
- La longitud de contexto no esta disponible, lo que dificulta planificar cargas con conversaciones largas.
- Las metricas de rechazo y KL proceden del autor del modelo fuente y no han sido evaluadas de forma independiente en este checkpoint cuantizado.
- La cuantizacion de 4 bits puede degradar calidad respecto al BF16 original, especialmente en tareas de razonamiento y codigo.
- Depende de versiones recientes de oMLX/MLX-LM con soporte de `spark2_5`; runtimes desactualizados pueden fallar al cargar.
- Aunque la licencia es Apache-2.0, el uso comercial debe revisar las condiciones de la linea upstream y las obligaciones de atribucion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/xunlinkx/Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ4e-fp16
- Modelo fuente (Electroglyph): https://huggingface.co/electroglyph/Spark-X2.6-4B-uncensored
- Modelo oficial (XHToken): https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio oficial del proyecto: https://github.com/XHToken/Spark-X2.6
