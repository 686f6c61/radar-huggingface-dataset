# tegsvenson/Qwen3.8-Flash-Next-Uncensored-GGUF-Q5_K_S-Splash-Repack

## Resumen

Este repositorio no es un modelo nuevo, sino un **repack técnico** del cuantizado Q5_K_S de `orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF` para que el runtime Splash 1.4.0 pueda cargarlo. El modelo subyacente es Qwen3.8-Flash-Next, el modelo multimodal de Qwen (176.943.899.520 parámetros totales, contexto de 262.144 tokens), en una variante "abliterated" a la que se le ha eliminado la alineación de seguridad y que, por tanto, no rechaza peticiones.

El problema que resuelve es muy concreto: el cargador de Splash solo acepta F32, BF16 o Q8_0 para los tensores de hyper-conexión (`hc_attn_inject`, `hc_ffn_inject`), de modo que rechaza los cuantizados de 4 y 5 bits del autor original. Las builds Q8_0 sí pasan el filtro, pero ocupan 175–178 GiB y no caben en un Mac de 128 GB. Este repack convierte únicamente esos 96 tensores pequeños a F32 y deja el resto en Q5_K_S byte a byte, con un incremento de solo 12,42 MiB.

Es relevante para quien quiera ejecutar un modelo multimodal de ~177 B en Apple Silicon de gama alta con 128 GB de memoria unificada, algo que ninguna otra variante publicada de este modelo permite hoy con Splash. El autor reporta una prueba de humo a 98,4 tok/s en un M4 Max con decodificación especulativa, aunque no hay benchmarks de calidad ni pruebas en otros runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen "Flash-Next" con tensores de hyper-conexion (`hc_attn_inject`, `hc_ffn_inject`) y enrutado de expertos; el autor no documenta la arquitectura completa |
| Parametros totales | 176.943.899.520 (≈176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (carga verificada a contexto completo en Splash 1.4.0) |
| Tipos de cuantizacion | Este repo: Q5_K_S con 96 tensores en F32; upstream: variantes de 4 y 5 bits y Q8_0; `mmproj` en F16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (3 shards + `mmproj-Qwen3.8-Flash-Next-Uncensored-F16.gguf`) |
| Tamano del repo | 128,6 GB |
| Huella de los pesos | 121.813,55 MiB (frente a 121.801,13 MiB del original, +12,42 MiB) |
| Numero de tensores | 1.224 (1.128 identicos al original, 96 convertidos) |
| Imatrix | Si, metadatos preservados del cuantizado original |
| Tipo de pipeline | `image-text-to-text` (vision, no probada en este repack) |

## Arquitectura y entrenamiento

El autor del repack no aporta informacion sobre el entrenamiento: no hay datos de tokens, composicion del dataset, ni fases de RLHF/DPO. Lo unico deducible de los tensores es que el modelo usa hyper-conexiones con inyeccion separada para atencion y FFN (96 tensores de forma `[10240, 4]`, 48 para `hc_attn_inject` y 48 para `hc_ffn_inject`), ademas de una tabla PLE que se transmite desde SSD y un conjunto de expertos enrutados que ocupa 81.602 MiB en memoria, lo que confirma una topologia de mezcla de expertos (MoE). La variante "Uncensored" es una ablacion de la alineacion de seguridad (refusal-removal) aplicada por `orcarouter` sobre el modelo base de Qwen.

La innovacion tecnica de este repositorio es de empaquetado, no de modelado: se identifican los 96 tensores que Splash rechaza desde la cabecera GGUF y se recuantizan a F32 mediante `llama-quantize --allow-requantize --tensor-type "hc_attn_inject=f32" --tensor-type "hc_ffn_inject=f32"`, manteniendo el tipo destino Q5_K_S para que el resto pase sin recuantizar. El autor verifica que los 3.932.160 valores de los tensores convertidos son bit-exactos contra una decuantizacion independiente del Q5_K original (diferencia absoluta maxima 0), que los otros 1.128 tensores son byte-identicos (118,94 GiB comparados) y que las claves de metadatos no difieren. El proceso tarda 1 minuto y 40 segundos en un M4 Max.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`); el `mmproj` supera las comprobaciones `vision_config()` y `processor_config()` de Splash, pero la inferencia con imagenes no se ha probado.
- Razonamiento y generacion de codigo: capacidad heredada del modelo base Qwen3.8-Flash-Next, sin evaluacion publicada en este repack.
- Comportamiento sin rechazos (abliterated): no activa negativas de alineacion de seguridad.
- Decodificacion especulativa: probado con el draft `incoai/Qwen3.8-Flash-Next-DFlash2`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el autor no lista idiomas).
- Carga diferida de la tabla PLE desde disco (36.621 MiB en SSD, cache de filas de 511 MiB).

## Casos de uso

- **Analisis de documentos extensos en local**: con 262.144 tokens de contexto verificados, el modelo puede ingerir contratos, expedientes o bases de codigo completas en una sola pasada sin fragmentar ni recurrir a RAG, manteniendo los datos en la maquina.
- **Asistente personal offline con privacidad estricta**: al ejecutarse sobre Apple Silicon con Splash, todo el procesado ocurre en el equipo; adecuado para entornos donde no se permite enviar texto a APIs externas.
- **Investigacion sobre alineacion y robustez**: la variante abliterated sirve como objeto de estudio para medir como afecta la eliminacion de rechazos a las tasas de cumplimiento, a la calidad y a la calibracion, comparandola con el modelo base no modificado.
- **Red teaming y generacion de datos adversarios**: util para producir corpus de prompts que prueben clasificadores de seguridad y filtros de contenido en pipelines propios, al no bloquear las peticiones.
- **Extraccion de informacion de documentos escaneados**: el `mmproj` F16 habilita entrada de imagen (aunque el autor advierte que no la ha probado), lo que permitiria pasar facturas o formularios como imagen y obtener JSON estructurado.
- **Escritura creativa y generacion de ficcion sin filtros**: narrativa, guiones o dialogos donde los rechazos de los modelos alineados interrumpen el flujo de trabajo.
- **Validacion de cadenas de cuantizacion**: el repositorio documenta SHA-256, comandos de reproduccion y verificaciones bit-exactas, por lo que sirve como caso de referencia para auditar procesos de recuantizacion GGUF.
- **Evaluacion comparativa de runtimes en Apple Silicon**: permite medir throughput y uso de memoria de Splash frente a otras alternativas en un modelo de ~119 GiB, un escenario poco cubierto por benchmarks publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son de ejecucion:

| Metrica | Resultado | Entorno |
|---|---|---|
| Velocidad de generacion (prueba de humo, 31 tokens) | 98,4 tok/s | MacBook Pro M4 Max 128 GB, oMLX 0.7.2, Splash 1.4.0, draft DFlash2 |
| Contexto cargado | 262.144 tokens | Mismo entorno |
| Expertos enrutados en memoria | 81.602 MiB | Mismo entorno |
| Tabla PLE en SSD | 36.621 MiB (cache de 511 MiB) | Mismo entorno |
| Correccion de salida | Salida correcta en la prueba de humo | Mismo entorno |
| Calidad de imagen | No probada | — |

## Requisitos de hardware

- **Espacio en disco**: 128,6 GB de repositorio; los pesos suman 121.813,55 MiB (≈119 GiB) mas el `mmproj` F16. Ademas, la tabla PLE requiere 36.621 MiB en SSD que no se cargan en memoria.
- **Memoria**: el autor lo ejecuta en un MacBook Pro M4 Max con 128 GB de memoria unificada, con 81.602 MiB de expertos residentes y streaming de PLE desde disco. Menos de 128 GB no esta reportado como viable.
- **GPU consumer**: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) ni en configuraciones de 2×24 GB. El tamano de los pesos lo impide.
- **GPU de datacenter**: por tamano, se necesitarian del orden de 120 GB de VRAM, es decir, al menos 2× H100 80 GB o 4× A100 40 GB. Esta estimacion es teorica: el autor solo ha probado Splash en Apple Silicon y advierte que no ha probado llama.cpp ni otros runtimes, por lo que el soporte multi-GPU no esta verificado.
- **Runtimes**: Splash 1.4.0 a traves de oMLX 0.7.2 (unico entorno probado). llama.cpp, Ollama, vLLM y TGI: no disponible / no probado. La carga en llama.cpp fallaria presumiblemente por el mismo motivo que en Splash rechaza los cuantizados de 4 y 5 bits, aunque no esta documentado.
- **Latencia y throughput**: 98,4 tok/s en M4 Max con decodificacion especulativa (draft DFlash2) sobre una prueba de humo de 31 tokens. Sin draft o con generaciones largas, no disponible.

## Comparativa con modelos similares

| Variante | Parametros | Contexto | Cuantizacion / tamano | Compatible con Splash 1.4.0 | Cabe en 128 GB | Licencia |
|---|---|---|---|---|---|---|
| Este repack (tegsvenson) | 176,9 B | 262.144 | Q5_K_S + 96 tensores F32 / 121.813,55 MiB | Si (verificado) | Si (probado en M4 Max) | Qwen Community 1.0 |
| orcarouter Q5_K_S | 176,9 B | 262.144 | Q5_K_S / 121.801,13 MiB | No (rechazado por cabecera) | Si, pero no carga | Qwen Community 1.0 |
| orcarouter Q8_0 | 176,9 B | 262.144 | Q8_0 / 175–178 GiB | Si | No | Qwen Community 1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | 262.144 | Pesos originales (no GGUF) | No aplica | No en 128 GB sin cuantizar | Qwen Community 1.0 |

No se dispone de datos para comparar con modelos de otros fabricantes de tamano o categoria equivalente dentro de la informacion proporcionada.

## Limitaciones y advertencias

- **Alineacion de seguridad eliminada**: el modelo base de este repack es abliterated. No rechaza peticiones potencialmente daninas y hereda ese comportamiento sin cambios. No es adecuado para exposicion directa a usuarios finales sin una capa de moderacion propia.
- **Riesgo de alucinacion**: no hay evaluaciones publicadas de fidelidad, calibracion ni tasas de alucinacion para esta variante cuantizada. La recuantizacion a 5 bits puede degradar la calidad respecto a Q8_0 o BF16, aunque el autor solo verifica la exactitud del repack, no la del modelo.
- **Vision no validada**: el `mmproj` pasa las comprobaciones de configuracion, pero el autor declara explicitamente que la inferencia con imagenes no se ha probado.
- **Un unico runtime validado**: solo Splash 1.4.0 con oMLX 0.7.2. No hay pruebas en llama.cpp, Ollama, vLLM ni TGI, lo que limita el despliegue a Apple Silicon.
- **Restricciones de licencia**: la Qwen Community License 1.0 gobierna este derivado; la abliteracion y la recuantizacion no la modifican. Los terminos concretos de uso comercial no se detallan en la informacion disponible; deben consultarse en el fichero `LICENSE` del repositorio.
- **Sin validacion comunitaria**: 0 descargas y 0 likes en el momento de la consulta; la fiabilidad del repositorio depende solo de las verificaciones del autor.
- **Idiomas no declarados**: no hay lista de idiomas soportados, por lo que el rendimiento en castellano no esta documentado.
- **Dependencia de piezas externas**: requiere el draft `incoai/Qwen3.8-Flash-Next-DFlash2` para las velocidades reportadas y depende de la version concreta de Splash (1.4.0); versiones futuras podrian cambiar el comportamiento del cargador.
- **Repack parcial**: solo se ha convertido y probado Q5_K_S; el autor sugiere que la misma tecnica funcionaria en las variantes de 4 bits, pero no lo ha verificado.

## Enlaces

- Repositorio del repack: https://huggingface.co/tegsvenson/Qwen3.8-Flash-Next-Uncensored-GGUF-Q5_K_S-Splash-Repack
- Modelo de origen (cuantizado y abliterado): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Splash: https://github.com/incoai/splash
- Modelo draft para decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
