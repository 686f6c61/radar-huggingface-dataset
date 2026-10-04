# vaultai/GLM-5.3-Flash-Abliterated-MLX-4bit

## Resumen

GLM-5.3-Flash-Abliterated-MLX-4bit es una compilacion cuantizada a 4 bits, orientada a Apple Silicon, del modelo GLM-5.3-Flash desarrollado por zai-org. El autor de esta ficha tecnica es vaultai, que publica una cuantizacion en formato MLX (oQ4e) sobre los pesos abliterados en BF16 de Blackfrost-Research, que a su vez derivan del modelo original. La cadena de linaje es zai-org/GLM-5.3-Flash → Blackfrost-Research/GLM-5.3-Flash-DERISKED-BF16 (abliterated) → esta compilacion de 4 bits.

El modelo base es un MoE nativo multimodal de 320B parametros totales con unos 18B parametros activos por token (8 de 288 expertos mas uno compartido), arquitectura glm5_next de 45 capas que combina atencion recurrente KDA con atencion dispersa DSA. Su ventana de contexto alcanza 1.048.576 tokens. Esta variante concreta conserva la torre de vision y la cabeza MTP de prediccion multi-token, por lo que mantiene entrada de imagen y decodificacion especulativa, y ha sido cuantizada con oMLX en precision mixta calibrada con iMatrix, con anchos de bits por tensor en lugar de 4 bits uniformes.

Su relevancia actual es doble: por un lado permite ejecutar un modelo de 320B en un unico equipo Apple Silicon con memoria unificada (medido en un Mac Studio M3 Ultra de 256 GB), y por otro distribuye una variante abliterada, es decir, con el comportamiento de rechazo eliminado directamente en los pesos, publicada explicitamente para investigacion en seguridad de IA, red-teaming y estudios de cuantizacion e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next: MoE hibrido con KDA (atencion recurrente) + DSA (atencion dispersa), nativo multimodal, 45 capas |
| Parametros totales | 321.323.031.390 (la model card indica 320B) |
| Parametros activos | ~18B por token (MoE: 8 de 288 expertos + 1 compartido) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | 4-bit oQ4e de oMLX (precision mixta calibrada con iMatrix, anchos de bits por tensor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 35 shards, 173 GiB de descarga |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura denominada glm5_next, una mezcla de expertos de 45 capas que combina dos mecanismos de atencion: KDA, de tipo recurrente, y DSA, de atencion dispersa. Es un modelo nativamente multimodal, con una torre de vision diferenciada, y la compilacion incluye 3057 tensores en total, de los cuales 59 corresponden a la cabeza MTP y 347 a la parte de vision. La cabeza MTP de prediccion multi-token se conserva operativa, lo que habilita decodificacion especulativa, al igual que el soporte de DFlash2 descrito en la model card.

La model card no proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la presencia de etapas de RLHF o DPO en el modelo original. Lo que si se documenta es el proceso de abliteracion aplicado por Blackfrost-Research sobre los pesos en BF16, que elimina el comportamiento de rechazo a nivel de pesos y da como resultado una tasa medida de 1,3% de rechazos. Sobre esa base, vaultai aplica una cuantizacion oQ4e mediante oMLX con calibracion iMatrix, que asigna anchos de bits distintos a cada tensor en lugar de un 4 bits uniforme, conservando tanto la torre de vision como la cabeza MTP.

## Capacidades

- Generacion de texto conversacional en formato image-text-to-text, con soporte de entrada de imagen gracias a la torre de vision preservada.
- Modo de razonamiento explicito (thinking) con dos niveles configurables, Thinking-High y Thinking-Max, segun la model card.
- Generacion de codigo, evaluada por el autor en Z.ai Code Bench v1.0, donde GLM-5.3-Flash con niveles High y Max obtiene una precision practicamente equivalente.
- Soporte de tool calling y function calling, evidenciado por la prueba de referencia agentica de 14 mensajes con llamadas a herramientas.
- Razonamiento multi-paso en flujos agenticos con contexto largo, hasta 1.048.576 tokens.
- Decodificacion especulativa opcional mediante la cabeza MTP y el adaptador DFlash2, con su correspondiente aumento de velocidad.
- Comportamiento abliterado: no aplica rechazos de forma sistematica, con una tasa medida de 1,3% en la familia de la que deriva.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo esta publicado precisamente para estudiar comportamiento de rechazo y alineacion, con una variante abliterada que permite medir hasta que punto el modelo obedece instrucciones que el modelo original rechazaria.
- Investigacion sobre alineacion y refusal: la diferencia medible de 1,3% de rechazos frente al modelo original lo convierte en una referencia util para estudiar los efectos de la modificacion de pesos a nivel de comportamiento.
- Investigacion en cuantizacion: al emplear precision mixta calibrada con iMatrix y anchos de bits por tensor, sirve como caso de estudio sobre el impacto de la cuantizacion 4-bit no uniforme en un MoE de 320B con componentes multimodales.
- Inferencia local en Apple Silicon: permite ejecutar un modelo de 320B en un unico Mac Studio con memoria unificada suficiente, sin depender de infraestructura en la nube, con un consumo residente de aproximadamente 190 GiB.
- Analisis de documentos e imagenes con contexto muy largo: la combinacion de ventana de 1.048.576 tokens y entrada de imagen permite procesar transcripciones, informes o capturas extensas en una sola pasada.
- Automatizacion de agentes con tool calling en local: el soporte de function calling y la decodificacion especulativa con MTP o DFlash2 permiten construir bucles agenticos multi-turno ejecutados integramente en el equipo del investigador.
- Asistencia a la generacion de codigo en entorno controlado: la evaluacion en Z.ai Code Bench v1.0 y el modo thinking configurable lo hacen util para tareas de continuacion y refactorizacion de codigo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente menciona de forma cualitativa que GLM-5.3-Flash supera a GLM-5.2 en benchmarks y cargas reales, y que se acerca a Claude Opus 4.8 en tareas de codigo y agenticas, sin cifras concretas.

Los datos de rendimiento disponibles son medidas de velocidad de decodificacion y de tiempo total, tomadas en un Mac Studio M3 Ultra de 256 GB con oMLX 0.6.3. Dos cargas de trabajo: una corta (continuacion de codigo, 1024 tokens generados) y una agentica (transcripcion real de tool calling de 14 mensajes, ~20,4k tokens de contexto y 512 tokens generados).

| Metodo de decodificacion | Corto, Thinking-Max | Corto, Thinking-High | Agentico largo, Thinking-Max | Agentico largo, Thinking-High |
|---|---|---|---|---|
| DFlash2 | 29,5 - 34,8 tok/s | 39,3 - 51,2 tok/s | 33,4 - 33,6 tok/s | 31,9 - 32,8 tok/s |
| MTP | 30,4 - 30,9 tok/s | 35,3 - 39,7 tok/s | 27,6 - 29,4 tok/s | 26,7 - 29,6 tok/s |
| AR (sin decodificacion especulativa) | 29,3 - 29,7 tok/s, estable | 29,3 - 29,7 tok/s, estable | 26,5 - 26,6 tok/s, estable | 26,5 - 26,6 tok/s, estable |

Tiempo total de reloj para generar 1024 tokens con contexto corto (rango entre temperatura 0 y temperatura 1):

| Metodo de decodificacion | Thinking-High | Thinking-Max | Ahorro de High |
|---|---:|---:|---:|
| DFlash2 + parche de prefix cache (temp 0) | 21,0 s | 35,4 s | -41% |
| DFlash2 (adaptador original) | 20,8 - 27,5 s | 30,4 - 35,7 s | -10% a -42% |
| MTP | 26,8 - 30,2 s | 34,2 - 34,8 s | -13% a -22% |
| AR | 35,8 - 36,0 s | 35,5 - 35,8 s | ~0% |

Tiempo total de reloj para generar 512 tokens con contexto agentico largo:

| Metodo de decodificacion | Estado de la cache de prompt | Thinking-High | Thinking-Max | Ahorro de High |
|---|---|---:|---:|---:|
| DFlash2 + parche de prefix cache (temp 0) | caliente | 15,1 s | 15,9 s | -5% |
| DFlash2 (adaptador original) | ninguna, prefijos completos en cada peticion | 61,8 - 62,1 s | 61,3 - 61,4 s | ~+1% |
| MTP | caliente | 22,2 - 24,0 s | 22,3 - 23,4 s | mixto, ±5-8% |
| AR | caliente | 24,1 - 24,8 s | 24,1 - 25,1 s | ~0% |

El parche de prefix cache reduce el TTFT en contexto largo de aproximadamente 46 s a 0,26 s y el tiempo total de 61,8 s a 15,1 s. El autor advierte que las cifras en caliente son el mejor caso posible mientras investiga un caso de generacion larga en el que no se produjo el acierto de cache.

## Requisitos de hardware

- Descarga: 173 GiB distribuidos en 35 shards.
- Memoria residente en servicio: aproximadamente 190 GiB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon, dado el formato MLX. No es ejecutable en GPUs NVIDIA o AMD con este artefacto.
- Equipo de referencia medido: Mac Studio con M3 Ultra y 256 GB de memoria unificada.
- Encaje en GPU de consumo: no disponible. El formato MLX y el tamano del modelo lo excluyen de GPU de consumo convencionales.
- Opciones de despliegue: oMLX 0.6.3 (funciona de forma autonoma); la decodificacion especulativa con MTP y DFlash2 requiere configuracion adicional.
- Latencia y throughput: TTFT de 0,26 s en contexto largo con el parche de prefix cache, y entre 26,5 y 51,2 tok/s segun metodo de decodificacion y carga de trabajo, con los rangos detallados en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vaultai/GLM-5.3-Flash-Abliterated-MLX-4bit | 321,3B totales, ~18B activos | 1.048.576 tokens | safetensors MLX 4-bit oQ4e | MIT | Vision y MTP preservados, 173 GiB |
| grant-ai/GLM-5.3-Flash-Abliterated-MLX-4bit | 321,3B totales, ~18B activos | no disponible | safetensors MLX | no disponible | Parte de pesos abliterados BF16 de 599 GB y 120 shards; iMatrix medido sobre activaciones del propio modelo |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | 321,3B totales, ~18B activos | no disponible | FP8 | no disponible | Abliterado directamente en block-FP8; velocidad nativa en Hopper (H100/H200) |
| zai-org/GLM-5.3-Flash (original) | 320B totales, ~18B activos | 1.048.576 tokens (segun la model card de la variante) | no disponible | no disponible | Primer modelo nativamente multimodal de la serie GLM-5 |

## Limitaciones y advertencias

- El modelo es una variante abliterada: la model card indica explicitamente que se distribuye practicamente sin rechazos de seguridad y que debe asumirse que cumplira cualquier instruccion, incluidas las daninas.
- Uso previsto restringido a investigacion experimental en IA e investigacion en seguridad de IA: red-teaming, investigacion sobre rechazo y alineacion, interpretabilidad y cuantizacion o inferencia.
- El autor prohibe explicitamente cualquier uso ilegal en cualquier jurisdiccion y desaconseja exponerlo como endpoint publico o desplegarlo a usuarios no confiables.
- El usuario es el unico responsable del uso y del cumplimiento de las leyes aplicables y de los terminos de licencia de los modelos de los que deriva.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad factual en la informacion disponible.
- Sesgos conocidos: no disponible. No se documentan analisis de sesgo en la informacion proporcionada.
- Limitaciones de idioma: no disponible. No se especifican los idiomas soportados.
- Idiomas soportados: no disponible.
- La ventana de contexto de 1.048.576 tokens esta limitada en la practica por la memoria disponible; la propia model card recomienda ajustar la ventana de servicio a lo que permita la RAM del equipo.
- El parche de prefix cache para DFlash2 esta pendiente de publicacion y de aceptacion upstream; sin el, DFlash2 rehace el prefijo completo en cada peticion de contexto largo y pierde frente a MTP y AR.
- Las cifras de rendimiento en caliente corresponden al mejor caso: el autor documenta al menos una generacion larga en la que no se produjo el acierto de cache.
- Rendimiento medido sobre una unica configuracion de hardware (M3 Ultra, 256 GB, oMLX 0.6.3); no hay datos para otros equipos Apple Silicon.
- Licencia MIT declarada, lo que permite uso comercial segun los terminos de dicha licencia, pero las restricciones de la model card sobre uso responsable y seguridad se mantienen como advertencia del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vaultai/GLM-5.3-Flash-Abliterated-MLX-4bit
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Pesos abliterados de partida: https://huggingface.co/Blackfrost-Research/GLM-5.3-Flash-DERISKED-BF16
- Compilacion MLX alternativa: https://huggingface.co/grant-ai/GLM-5.3-Flash-Abliterated-MLX-4bit
- Variante abliterada en FP8: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Ficha de GLM-5.3 en openlm.ai: https://openlm.ai/glm-5.3/
- Analisis sobre la abliteracion en block-FP8: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Entrada del modelo en llm-explorer: https://llm-explorer.com/model/grant-ai%2FGLM-5.3-Flash-Abliterated-MLX-4bit,6h8mn44QOPW8ApBQif6Xjf
- Publicacion en X sobre Z.ai Code Bench v1.0: https://x.com/zainhas/status/2093125213361938621
