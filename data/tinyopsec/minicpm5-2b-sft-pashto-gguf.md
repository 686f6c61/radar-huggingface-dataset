# tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF

## Resumen

MiniCPM5-2B-SFT-Pashto-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo nassimjp/MiniCPM5-2B-SFT-Pashto, que a su vez es un ajuste fino de openbmb/MiniCPM5-2B orientado al idioma pastún (پښتو). Lo publica el usuario tinyopsec con el objetivo de facilitar la ejecución local del modelo en hardware modesto mediante llama.cpp, LM Studio u Ollama, sin necesidad de GPUs de gama alta. Se trata, por tanto, de una redistribución optimizada para inferencia, no de un modelo entrenado desde cero.

El modelo subyacente es un transformer denso de aproximadamente 2.516 millones de parametros, con arquitectura `LlamaForCausalLM`, 42 capas, tamano oculto de 2.048 y atencion con consultas agrupadas (GQA) de 16 cabezas de consulta y 2 cabezas clave/valor. La familia MiniCPM5 esta disenada por OpenBMB para despliegue en dispositivo y escenarios con recursos limitados, y la variante 2B se presenta como estado del arte en su categoria de tamano.

Su relevancia actual radica en dos factores: por un lado, cubre un idioma de bajos recursos como el pastún, poco representado en modelos abiertos; por otro, ofrece once niveles de cuantizacion (de F16 a Q2_K) que permiten desplegar el modelo desde ~4,6 GB hasta ~0,7 GB, lo que lo hace viable en portátiles, mini-PC y sistemas embebidos. La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` (42 capas, hidden size 2.048, 16 cabezas de consulta y 2 cabezas KV con GQA, intermediate size 6.144) |
| Parametros totales | 2.516.944.896 (~2,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (recomendada), Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Pastún (`ps`) e inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo original esta en safetensors |
| Tamano del repositorio | 21,3 GB (incluye todos los archivos de cuantizacion) |
| Modelo base | nassimjp/MiniCPM5-2B-SFT-Pashto (a su vez derivado de openbmb/MiniCPM5-2B) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo decoder-only con la implementacion `LlamaForCausalLM`. Segun el grafo de arquitectura publicado, el modelo consta de 42 capas transformer con un tamano oculto de 2.048, 16 cabezas de atencion de consulta y 2 cabezas clave/valor, lo que implica atencion con consultas agrupadas (GQA) para reducir el coste de memoria de la cache KV. Las capas feed-forward usan un tamano intermedio de 6.144. El modelo base MiniCPM5-2B, desarrollado por OpenBMB, se describe como un transformer denso de 2B escalado a partir de la misma receta de entrenamiento que MiniCPM5-1B, orientado a despliegue local y en dispositivo.

Sobre el proceso de ajuste: el modelo original nassimjp/MiniCPM5-2B-SFT-Pashto es un ajuste supervisado (SFT) del MiniCPM5-2B para pastún, y esta version es unicamente su cuantizacion a GGUF. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que el modelo conserva el razonamiento hibrido del base, con modos "Think" y "No-Think". Para uso con llama.cpp, el autor recomienda el flag `--min-p 0.0` para evitar repeticiones.

## Capacidades

- Generacion de texto conversacional en pastún y en inglés, con pipeline declarado de `text-generation` y etiqueta `conversational`.
- Razonamiento hibrido: modos "Think" (razonamiento explicito paso a paso) y "No-Think" (respuesta directa), heredados del modelo MiniCPM5-2B.
- Ejecucion local mediante llama.cpp, `llama-cpp-python`, LM Studio y Ollama.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere su uso detras de una API de inferencia.
- Soporte multilingue limitado a los dos idiomas declarados: pastún e inglés.
- Capacidades de tool calling o function calling: no disponible (no se documentan en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documentan explicitamente).
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Atención al cliente en pastún: el modelo puede gestionar conversaciones multi-turno en pastún en entornos con recursos limitados, desplegado en un servidor modesto o en local con la cuantizacion Q4_K_M (~1,4 GB de archivo y ~2 GB de RAM).
- Traducción pastún-inglés: al estar ajustado especificamente para pastún y declarar soporte de inglés, resulta adecuado para tareas de traduccion y post-edicion en ambos sentidos dentro de flujos documentales.
- Asistentes locales sin conexión: gracias a su tamano reducido y a los formatos GGUF, puede ejecutarse en portátiles y mini-PC sin GPU dedicada, algo util en entornos con requisitos de privacidad o sin conectividad.
- Procesamiento de documentos en pastún: resumen, extraccion y reformulacion de textos en pastún, un idioma con poca cobertura en modelos abiertos, lo que reduce la dependencia de servicios en la nube que rara vez lo soportan bien.
- Educación y tutoría: generacion de explicaciones y material de practica en pastún para estudiantes, con el modo "Think" activado cuando se requiera razonamiento detallado.
- Investigación en PLN para lenguas de bajos recursos: sirve como linea base y punto de comparacion para experimentos de ajuste fino, evaluacion o destilacion sobre pastún.
- Chatbots integrados en aplicaciones de escritorio o moviles: puede embeberse mediante `llama-cpp-python` o LM Studio para asistentes de proposito especifico, usando la cuantizacion adecuada al presupuesto de memoria del dispositivo.
- Generación de contenido en pastún: redaccion de textos, borradores y respuestas en el idioma para publicaciones, redes sociales o documentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun la tabla del autor: Q8_0 ~3 GB; Q4_K_M ~2 GB; Q2_K ~1,5 GB. Los tamanos de archivo van de ~4,6 GB (F16) a ~0,7 GB (Q2_K).
- GPU recomendadas: no se especifican en la informacion proporcionada. Por el tamano del modelo, cualquier GPU con al menos 4-6 GB de VRAM puede alojar las cuantizaciones altas (Q8_0 o Q6_K); las cuantizaciones Q4 y Q3 caben holgadamente en GPUs de gama de entrada.
- Compatibilidad con GPU de consumo: si. El modelo cabe en GPUs de consumo con 4 GB o mas de VRAM, e incluso en configuraciones con 2-3 GB para cuantizaciones bajas. Tambien puede ejecutarse solo en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), `llama-cpp-python`, LM Studio y Ollama (`ollama run hf.co/tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF:Q4_K_M`). La etiqueta `endpoints_compatible` sugiere compatibilidad con servicios de inferencia por endpoint, aunque no se detallan motores concretos como vLLM o TGI.
- Latencia y throughput: no disponible.
- Recomendacion del autor: usar `--min-p 0.0` con llama.cpp para evitar repeticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF | ~2,5 B | No disponible | ps, en | Apache 2.0 | GGUF (11 cuantizaciones) | Cuantizacion del SFT en pastún; objeto de esta ficha |
| nassimjp/MiniCPM5-2B-SFT-Pashto | ~2,5 B | No disponible | ps, en | Apache 2.0 | safetensors | Modelo original ajustado en pastún, sin cuantizar |
| nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF | No disponible | No disponible | ps, en | No disponible | GGUF | Variante orientada a instrucciones del mismo ajuste |
| openbmb/MiniCPM5-2B (base) | ~2,5 B | No disponible | No disponible | No disponible | safetensors | Modelo base de la serie, denso 2B, SOTA en su categoria segun OpenBMB |
| openbmb/MiniCPM5-1B | ~1 B | No disponible | No disponible | No disponible | safetensors | Version menor de la misma serie, densa, para escenarios mas restrictivos |

## Limitaciones y advertencias

- Las cuantizaciones bajas (Q3_K_S, Q2_K) reducen de forma notable la calidad de generacion; para uso en produccion se recomienda Q4_K_M o superior.
- El modelo es un ajuste fino de un modelo pequeno (2B): su capacidad de razonamiento complejo, conocimiento factual y seguimiento de instrucciones es inferior a la de modelos mucho mayores.
- Riesgo de alucinacion: al tratarse de un modelo de 2B especializado en un idioma de bajos recursos, la generacion de datos factuales incorrectos es probable, especialmente fuera de los dominios cubiertos por el ajuste.
- Cobertura idiomatica limitada a pastún e inglés; se desconoce el comportamiento en otros idiomas, incluido el castellano.
- El autor recomienda `--min-p 0.0` en llama.cpp para mitigar repeticiones, lo que indica que el modelo puede entrar en bucles sin esa configuracion.
- La longitud de contexto no se documenta, por lo que no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- El repositorio registra 0 descargas y 0 "likes", por lo que no existe validacion de la comunidad sobre la calidad de las cuantizaciones publicadas.
- No se documentan capacidades de tool calling ni de uso como agente; asumirlas en produccion seria un riesgo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y atribucion correspondientes. Conviene verificar la licencia del modelo base MiniCPM5-2B de OpenBMB, ya que la informacion proporcionada no la detalla.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF
- Modelo base del ajuste: https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto
- Variante Instruct en GGUF: https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF
- Modelo base de la serie: https://huggingface.co/openbmb/MiniCPM5-2B
- Model card del SFT base en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-SFT/blob/main/README.md
- Repositorio GitHub de la serie MiniCPM: https://github.com/OpenBMB/MiniCPM
- Grafo de arquitectura del modelo: https://hfviewer.com/nassimjp/MiniCPM5-2B-SFT-Pashto
- Espejo de descarga en SourceForge: https://sourceforge.net/projects/minicpm5-2b.mirror/
