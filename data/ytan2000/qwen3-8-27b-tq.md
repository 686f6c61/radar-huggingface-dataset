# YTan2000/Qwen3.8-27B-TQ

## Resumen

YTan2000/Qwen3.8-27B-TQ no es un modelo de lenguaje completo, sino un paquete de pesos para **decodificacion especulativa** del modelo Qwen3.8-27B. Contiene un modelo borrador (draft model) de aproximadamente 1,92 mil millones de parametros, una conversion cuantizada del drafter z-lab/Qwen3.8-27B-DFlash2, junto con la lista de tokens de su vocabulario (65.536 ids). Su funcion es proponer varios tokens por paso para que el modelo grande de 27B los verifique en una sola pasada; los tokens aceptados son exactos, por lo que la salida es identica a la de la inferencia normal, solo que mas rapida.

El elemento diferenciador es el formato de cuantizacion: los tensores estan guardados en TQ3 (tipo GGUF 301), un formato que **solo TQLLM es capaz de leer**. Esto lo aleja del ecosistema GGUF convencional (llama.cpp, Ollama) y lo ata a la herramienta concreta para la que fue empaquetado. El repositorio pesa 0,8 GB y se publica bajo licencia Apache-2.0, heredada del modelo base.

Es relevante ahora porque la decodificacion especulativa se ha convertido en la tecnica estandar para reducir la latencia en inferencia local de modelos de 20-30B, y este paquete ofrece el drafter ya cuantizado y listo para usar junto al modelo principal YTan2000/Qwen3.8-27B-TQ3_4S. El repositorio es de publicacion reciente (8 de octubre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer como modelo borrador (draft) para decodificacion especulativa; familia DFlash2 |
| Parametros totales | 1.924.404.480 (aproximadamente 1,92 mil millones) |
| Parametros activos | No aplica: no hay informacion que indique arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | TQ3 (tipo GGUF 301, exclusivo de TQLLM); archivo de 0,79 GB |
| Idiomas soportados | No disponible. El repositorio del modelo principal (Qwen3.8-27B-TQ3_4S) declara "English" |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tensores TQ3, tipo 301) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 0,8 GB |
| Vocabulario del drafter | 65.536 ids de token (`mtp-vocab/atx_65536.txt`) |
| Modelo base | z-lab/Qwen3.8-27B-DFlash2 (Apache-2.0) |
| Modelo principal asociado | YTan2000/Qwen3.8-27B-TQ3_4S (`Qwen3.8-27B-TQ3_4S-v2.gguf`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

El artefacto es una conversion cuantizada del modelo borrador z-lab/Qwen3.8-27B-DFlash2, no un entrenamiento propio. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; se trata, por tanto, de un proceso de conversion y cuantizacion a TQ3, no de un entrenamiento desde cero. El drafter opera como cabecera predictiva multi-token: propone varios tokens candidatos y el modelo de 27B los valida en una unica pasada, de forma que todo token aceptado es identico al que habria generado el modelo grande sin asistencia.

La innovacion tecnica relevante es doble. Por un lado, el uso de DFlash2 como drafter, integrado en el ecosistema de decodificacion especulativa del modelo principal. Por otro, el formato de cuantizacion TQ3 con tipo GGUF 301, que requiere el runtime TQLLM para su lectura e implica kernels propios de dequantizacion en tiempo de inferencia. Esto proporciona una compresion muy agresiva (un modelo de ~1,92B en 0,79 GB) a costa de perder compatibilidad con el resto de cargadores GGUF.

## Capacidades

- Aceleracion por decodificacion especulativa: propone multiples tokens por paso para que el modelo Qwen3.8-27B los verifique en una sola pasada.
- Salida exacta: todo token aceptado coincide con el que generaria el modelo principal sin drafter, por lo que no hay degradacion de calidad en el texto final.
- Modelo auxiliar, no autonomo: no esta pensado para generar texto por si mismo ni para usarse como modelo conversacional independiente.
- Vocabulario acotado: cubre 65.536 ids de token, distribuidos en el archivo `mtp-vocab/atx_65536.txt`.
- Integracion con TQLLM: requiere este runtime para leer los tensores de tipo 301.
- Uso conjunto obligatorio: el README indica explicitamente que debe emplearse con el modelo de 27B YTan2000/Qwen3.8-27B-TQ3_4S.
- Tool calling, agentes, vision, audio, modo thinking: no disponible en la informacion proporcionada (corresponden al modelo principal, no al drafter).
- Capacidades multilingues del drafter: no disponible.

## Casos de uso

- Aceleracion de inferencia local de Qwen3.8-27B: el caso de uso central. Se despliega el modelo principal de 27B junto a este drafter para reducir la latencia por token sin alterar la salida, algo critico cuando el modelo grande se ejecuta en hardware de gama alta de consumo.
- Asistentes de codigo interactivos: en un IDE o terminal, la latencia por token determina la percepcion de fluidez; la decodificacion especulativa reduce el tiempo hasta el primer bloque de codigo util manteniendo la exactitud del modelo de 27B.
- Servicio de autocompletado en editor: el drafter es especialmente rentable en escenarios de continuación predecible (codigo repetitivo, plantillas, documentacion estructurada), donde la tasa de aceptacion de tokens propuestos suele ser alta.
- Despliegue en estaciones de trabajo con GPU unica: al ocupar menos de 1 GB, el drafter anade una sobrecarga de VRAM marginal al modelo principal, lo que permite mantener el conjunto dentro de los limites de una GPU profesional o de gama alta de consumo.
- Procesamiento por lotes sensibles a la latencia: pipelines de generacion de resumenes, extraccion estructurada o traduccion donde el coste dominante es el tiempo de generacion y no el coste de memoria.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: al estar el drafter publicado de forma aislada y con su vocabulario, sirve como punto de partida para medir tasas de aceptacion frente a otras estrategias (EAGLE, Medusa, n-gram) sobre el mismo modelo base.
- Documentacion y trazabilidad de cuantizaciones: el repositorio incluye el archivo `drafters/NOTICE` con el aviso de licencia del drafter, util en entornos corporativos que requieren auditar la cadena de licencias de los pesos empleados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

En particular, no se proporciona la metrica mas relevante para un modelo de este tipo: la tasa de aceptacion (acceptance rate) de los tokens propuestos por el drafter, ni la ganancia de velocidad (tokens por segundo) respecto a la inferencia sin decodificacion especulativa. Tampoco hay mediciones de latencia, throughput ni comparaciones con otros drafters sobre el mismo modelo base.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 0,8-1 GB para los pesos TQ3 (0,79 GB en disco), mas el espacio de cache y buffers asociados al vocabulario de 65.536 tokens. Estimacion derivada del tamano de archivo publicado; no confirmada por el autor.
- VRAM del modelo principal: el README exige acompanarlo del modelo Qwen3.8-27B-TQ3_4S. El tamano del repositorio de este ultimo no se detalla en la informacion disponible, por lo que la VRAM total del conjunto debe calcularse a partir de ese modelo.
- GPU recomendadas: no disponible de forma explicita. Por el perfil de uso (modelo principal de 27B cuantizado mas drafter de ~1,9B), el conjunto apunta a GPU con 24 GB o mas de VRAM, como RTX 4090, RTX 5090, L40S, A100 o H100. Es una estimacion, no un dato publicado.
- Compatibilidad con GPU de consumo: el drafter por si solo cabe en cualquier GPU de consumo actual, pero carece de utilidad sin el modelo principal. No hay confirmacion oficial de que el conjunto completo quepa en una GPU de 16 GB.
- Opciones de despliegue: TQLLM es obligatorio para los tensores de tipo 301 (https://github.com/turbo-tan/tqllm). El repositorio del modelo principal menciona compatibilidad con llama.cpp, pero los pesos TQ de este repositorio no son legibles por cargadores GGUF convencionales como llama.cpp u Ollama.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de factor de aceleracion.

Ejemplo de descarga indicado en la model card:

```sh
hf download YTan2000/Qwen3.8-27B-TQ3_4S Qwen3.8-27B-TQ3_4S-v2.gguf --local-dir models
hf download YTan2000/Qwen3.8-27B-TQ drafters/Qwen3.8-27B-DFlash2-TQ3.gguf mtp-vocab/atx_65536.txt --local-dir models
```

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa. La tabla siguiente recoge unicamente lo que puede afirmarse a partir de la informacion disponible.

| Modelo | Tipo | Parametros | Formato | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|---|
| YTan2000/Qwen3.8-27B-TQ | Drafter cuantizado (DFlash2) | ~1,92B | GGUF tipo 301 (TQ3), solo TQLLM | Apache-2.0 | No disponible | No disponible |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter original (modelo base) | No disponible | No disponible | Apache-2.0 | No disponible | No disponible |
| YTan2000/Qwen3.8-27B-TQ3_4S | Modelo principal | 27B (segun el nombre del repositorio) | GGUF | Apache-2.0 | No disponible | No disponible |
| Qwen3.8-27B (Alibaba) | LLM denso multimodal nativo | 27B | No disponible en la informacion | No disponible en la informacion | No disponible | No disponible |

Alternativas de la misma categoria (otros esquemas de decodificacion especulativa como EAGLE o Medusa): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera texto por si mismo. Requiere el modelo principal de 27B y no aporta valor aislado.
- Dependencia estricta de TQLLM: los tensores usan el tipo GGUF 301, que solo lee TQLLM. No funciona con llama.cpp, Ollama, vLLM ni TGI en su configuracion estandar.
- Sensibilidad de la aceleracion al dominio: la ganancia real depende de la tasa de aceptacion de los tokens propuestos. En tareas muy impredecibles (razonamiento abierto, generacion creativa) el beneficio puede reducirse, y no se publican mediciones al respecto.
- Riesgo de alucinacion: el drafter no introduce tokens no verificados, ya que el modelo principal valida cada candidato; el riesgo de alucinacion es el del modelo de 27B subyacente, no el del mecanismo especulativo.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgos para el drafter ni para su modelo base.
- Cobertura de idiomas: no disponible. El repositorio del modelo principal declara "English", lo que sugiere un soporte limitado fuera del ingles.
- Longitud de contexto: no disponible. El contexto efectivo lo determina el modelo principal, no el drafter.
- Licencia: Apache-2.0, permisiva y apta para uso comercial. El repositorio incluye `drafters/NOTICE` con el aviso de licencia del modelo base; conviene revisarlo antes de redistribuir.
- Madurez del repositorio: publicado el 8 de octubre de 2026 con 0 descargas y 0 likes, sin documentacion adicional, sin benchmarks y con un unico autor. El soporte de la comunidad es inexistente por el momento.
- Advertencia de produccion: al no haber mediciones publicas de rendimiento ni verificacion independiente, no se recomienda adoptarlo en produccion sin una evaluacion propia de tasa de aceptacion y latencia end-to-end.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ
- Modelo principal asociado (Qwen3.8-27B-TQ3_4S): https://huggingface.co/YTan2000/Qwen3.8-27B-TQ3_4S
- Ficheros del modelo principal: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ3_4S/tree/main
- Modelo base del drafter (z-lab/Qwen3.8-27B-DFlash2): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio de TQLLM: https://github.com/turbo-tan/tqllm
- Repositorio Qwen3.8-27B de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre Qwen 3.8 27B en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha de terceros con detalles del modelo principal: https://essamamdani.com/ai-models/hf-ytan2000-qwen3-8-27b-tq3-4s
