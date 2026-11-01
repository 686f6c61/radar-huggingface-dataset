# thinkspread/Flint-Q4K-IQ3XXS-GGUF-bench

## Resumen

Flint-Q4K-IQ3XXS-GGUF-bench es una build de cuantizacion GGUF del modelo Flint, desarrollado por RecursiveSI y empaquetado por el usuario thinkspread. Se trata de un modelo de arquitectura MoE (mixture of experts) con 39.785.287.456 parametros totales, orientado a generacion de texto y conversacion. Esta build concreta no es una version de uso general, sino un artefacto de benchmark disenado especificamente para medir el rendimiento de motores de inferencia en Apple Silicon, en concreto la comparativa entre el motor Tempo9 y `rec`.

La particularidad de esta cuantizacion es que mantiene las capas densas en Q4_K y los expertos enrutados en IQ3_XXS (gate/up) e IQ4_XS (down), de modo que lee exactamente 1.385 GB de pesos por token decodificado, la misma cifra que el checkpoint `flint-int4-e3` de `rec`. Esto permite que una comparacion de un solo flujo mida el motor y no la cuantizacion. El autor advierte explicitamente de que la calidad de esta build no se ha medido y que previsiblemente queda por debajo del 83,1 % de acuerdo top-1 que ya muestra la variante Q5_K.

El modelo es relevante en el nicho de inferencia local en Apple Silicon: documenta cifras concretas de throughput (123-127 tok/s en un M5 Pro de 24 GB con Tempo9, frente a 151-155 tok/s con `rec`) y sirve como referencia reproducible para quien evalue motores de decodificacion sobre hardware de consumo. Para uso diario, el propio autor recomienda la build Q6K-IQ3XXS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); capas densas + expertos enrutados |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Capas densas Q4_K; expertos enrutados IQ3_XXS (gate/up) e IQ4_XS (down) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repo | 17,5 GB |
| Bytes leidos por token | 1,385 GB |
| SHA256 | 25d9180d21d00c77560ee2301b3627d6b19ab9dd292c51e931d5104fb4c91060 |

## Arquitectura y entrenamiento

Flint es un modelo MoE con 39.785 millones de parametros totales, segun los datos de safetensors del modelo base. La arquitectura combina capas densas con capas de expertos enrutados, un esquema habitual en modelos MoE de gran escala que busca aumentar la capacidad total sin escalar proporcionalmente el coste de computo por token. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, la dimension del hidden state ni la longitud de contexto nativa.

En cuanto al entrenamiento, la informacion disponible no detalla el volumen de tokens, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Esta build concreta se genero a partir del fichero de la release Q6K: los tensores densos se recuantizaron a Q4_K con `llama-quantize --allow-requantize --pure` y los expertos enrutados se copiaron sin modificar. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa u otras) mas alla de la propia estructura MoE.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de texto general, derivados del pipeline `text-generation` del modelo base.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Orientado a inferencia local en Apple Silicon mediante el motor Tempo9.

## Casos de uso

- Benchmark de motores de inferencia en Apple Silicon: el proposito principal de esta build es servir de artefacto reproducible para comparar Tempo9 frente a `rec` con un coste de lectura de pesos identico (1,385 GB por token), de modo que las diferencias de tok/s reflejen el motor y no la cuantizacion.
- Validacion de pipelines de cuantizacion GGUF: util para comprobar el flujo `llama-quantize --allow-requantize --pure` sobre un modelo MoE con expertos preservados intactos.
- Pruebas de integracion de Tempo9: el comando `tempo9 --hf thinkspread/Flint-Q4K-IQ3XXS-GGUF-bench` permite arrancar el modelo directamente desde Hugging Face para tests de integracion y CI.
- Medicion de throughput agregado con concurrencia: la model card documenta 378 tok/s con 16 clientes concurrentes en Tempo9, lo que lo hace util para evaluar comportamiento bajo carga en un M5 Pro de 24 GB.
- Evaluacion de cache de prefijos: el autor menciona resultados de prefix-cache en el post asociado, por lo que sirve para validar esa funcionalidad en entornos de conversacion repetida.
- Referencia de calidad frente a otras cuantizaciones: aunque la calidad de esta build no se midio, permite situarla en la escala de agreement top-1 frente a Q8_0 (Q6_K al 85,3 %, Q5_K al 83,1 %), util para decidir el trade-off calidad/velocidad.
- Desarrollo y depuracion de motores de decodificacion: el tamano de 17,5 GB y su comportamiento conocido en hardware de 24 GB lo hacen practico para iterar en local sin infraestructura dedicada.

## Benchmarks y rendimiento

Datos de velocidad publicados por el autor (Apple M5 Pro, 24 GB, 2026-10-23 a 2026-10-26; un solo flujo, 256 tokens greedy, medicion reportada por el motor, runners de CI detenidos, brazos intercalados en una misma sesion):

| Motor | tok/s | ms/token |
|---|---|---|
| Tempo9 1.2.0 (este fichero) | 123-127 | 7,9-8,1 |
| `rec` (`flint-int4-e3`) | 151-155 | 6,5 |

Throughput agregado con 16 clientes concurrentes: Tempo9 378 tok/s, `rec` 141 tok/s.

Calidad (agreement top-1 frente a Q8_0, solo para builds relacionadas, no para esta):

| Build | Capas densas | Agreement top-1 vs Q8_0 |
|---|---|---|
| Q6K-IQ3XXS | Q6_K | 85,3 % |
| Q5_K (variante) | Q5_K | 83,1 % |
| Q4K-IQ3XXS (esta build) | Q4_K | no medida (esperada por debajo de 83,1 %) |

No se han publicado resultados de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: el fichero pesa 17,5 GB; en Apple Silicon se ha ejecutado en un M5 Pro con 24 GB de memoria unificada.
- GPU recomendadas: no hay datos para GPU dedicadas. El unico hardware documentado es Apple M5 Pro de 24 GB.
- Cabe en GPU de consumo: no confirmado. Por tamano (17,5 GB) no cabria en GPUs de 8 o 12 GB; en una RTX 4090 de 24 GB es plausible por capacidad, pero no esta verificado en la informacion disponible.
- Opciones de despliegue: Tempo9 (`tempo9 --hf thinkspread/Flint-Q4K-IQ3XXS-GGUF-bench`) y el motor `rec` (rama `local/flint-e3-24gb`). Al ser GGUF, es compatible con el ecosistema llama.cpp, aunque no se documenta explicitamente en la model card.
- Latencia y throughput: 7,9-8,1 ms/token en single stream con Tempo9; 6,5 ms/token con `rec`; 378 tok/s agregados con 16 clientes en Tempo9.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint-Q4K-IQ3XXS-GGUF-bench (esta build) | 39,8 B totales | no disponible | Q4_K densas + IQ3_XXS/IQ4_XS expertos | Apache 2.0 | Hugging Face |
| thinkspread/Flint-Q6K-IQ3XXS-GGUF | 39,8 B totales | no disponible | Q6_K densas + IQ3_XXS/IQ4_XS expertos | Apache 2.0 | Hugging Face |
| RecursiveSI/flint (modelo base) | 39,8 B totales | no disponible | safetensors (original) | Apache 2.0 | Hugging Face |
| bartowski/RecursiveSI_flint-GGUF | 39,8 B totales | no disponible | varias GGUF | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad que permitan comparar Flint con modelos de otras familias del mismo tamano.

## Limitaciones y advertencias

- Build de benchmark, no de uso general: el autor indica explicitamente que es una "benchmark build, speed only" y recomienda la Q6K-IQ3XXS para uso diario.
- Calidad no medida: no se ha evaluado la calidad de esta cuantizacion; se espera por debajo del 83,1 % de agreement top-1 de la variante Q5_K.
- Perdida de precision por cuantizacion agresiva: los expertos enrutados a IQ3_XXS e IQ4_XS y las densas a Q4_K implican degradacion frente a Q8_0.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de generacion de texto, aplican los riesgos habituales.
- Limitaciones de contexto e idioma: no documentadas; no hay informacion sobre longitud de contexto nativa ni sobre idiomas soportados.
- Restricciones de licencia: Apache 2.0, permite uso comercial con las obligaciones habituales de atribucion y conservacion de avisos.
- Dependencia de motores especificos: las cifras de rendimiento publicadas corresponden a Tempo9 y `rec`; el comportamiento en otros backends (llama.cpp, vLLM, Ollama) no esta documentado.
- Hardware de referencia limitado: las mediciones se hicieron unicamente en un Apple M5 Pro de 24 GB; no hay datos para otras plataformas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Flint-Q4K-IQ3XXS-GGUF-bench
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Build recomendada para uso diario: https://huggingface.co/thinkspread/Flint-Q6K-IQ3XXS-GGUF
- Build GGUF de referencia (bartowski): https://huggingface.co/bartowski/RecursiveSI_flint-GGUF
- Post de benchmark: https://thinkspread.com/blog/rec-megakernel-and-tempo9/
- Motor Tempo9: https://github.com/thinkspread/tempo9
- Motor `rec` (rama de benchmark): https://github.com/thinkspread/rec/tree/local/flint-e3-24gb
