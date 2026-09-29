# Vova-CJW/fish-speech-s2-pro-r9700-rocm72

## Resumen

Este repositorio no contiene un modelo nuevo, sino una nota de reproducibilidad y un conjunto de ajustes para ejecutar Fish Speech S2 Pro sobre una AMD Radeon AI PRO R9700 (objetivo `gfx1201`) con Windows 11 como anfitrión, WSL2 como capa de ejecución, Ubuntu 24.04.5 LTS y ROCm 7.2. Lo publica el usuario Vova-CJW y su valor está en documentar una configuración de inferencia TTS funcional sobre hardware AMD, un terreno donde la mayoría de guías se centran en CUDA.

El modelo subyacente, Fish Speech S2 Pro, es el sistema TTS de Fish Audio: una arquitectura Dual-Autoregressive (Dual-AR) con alineamiento por refuerzo (RL), entrenada con más de 10 millones de horas de audio en más de 80 idiomas, con control inline de prosodia y emoción y clonación de voz zero-shot. El repositorio aporta las variables de entorno, los cambios en `inference.py` y los flags de `torch.compile`/Inductor necesarios para que esa arquitectura rinda en ROCm.

Las cifras medidas son concretas: 33,17 tok/s en el mejor decodificado text-to-semantic, aproximadamente 10,78 GB de VRAM reportados por Fish Speech y unos 5,26 s de extremo a extremo con `curl` para la frase de prueba en ruso. Se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, por lo que debe tomarse como evidencia anecdótica de un único entorno, no como referencia validada por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-Autoregressive (Dual-AR) con alineamiento por RL; generador text-to-semantic y decodificador de codec (`modded_dac_vq`) |
| Parametros totales | no disponible |
| Longitud de contexto | `MAX_SEQ_LEN=2048` configurado en este repositorio; maximo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el benchmark documentado usa los pesos sin cuantizar) |
| Idiomas soportados | ru, en (etiquetas del repositorio); el modelo base declara mas de 80 idiomas |
| Licencia | MIT declarada para el repositorio; licencia de los pesos base no confirmada en la informacion disponible |
| Formato de pesos | Checkpoints PyTorch: `checkpoints/s2-pro` para el modelo semantico y `checkpoints/s2-pro/codec.pth` para el codec; safetensors o GGUF: no disponible |

## Arquitectura y entrenamiento

Fish Speech S2 Pro combina un modelo autorregresivo que genera tokens semanticos a partir del texto (rama text-to-semantic) con un decodificador de codec neural que reconstruye la forma de onda; el repositorio carga esta segunda pieza con `--decoder-config-name modded_dac_vq`. El flag `--llama-checkpoint-path` sugiere un backbone de tipo Llama para la rama semantica. El entrenamiento del modelo base se realizo sobre mas de 10 millones de horas de audio en mas de 80 idiomas, con una fase de alineamiento por aprendizaje por refuerzo orientada a prosodia y expresividad.

La aportacion tecnica de este repositorio es la ruta de ejecucion en ROCm 7.2: se activan `MIOPEN_FIND_MODE=FAST` y `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1`, se configuran `torch._inductor.config.coordinate_descent_tuning`, `max_autotune_gemm`, `triton.unique_kernel_names` y `fx_graph_cache`, y se compila la decodificacion token a token con `torch.compile(..., backend="inductor", mode="reduce-overhead", fullgraph=True)`. El autor fija el commit de referencia `2225e924e7d35cc0a1d24dbc67cd1819e6cf429f` del fork `imagilux/fish-speech` y publica el hash SHA-256 del `inference.py` que dio el mejor resultado (`87e6a93e96327c77415630e45b919de1e49889779ba54445bdf2d33b17b14d44`), lo que hace la configuracion verificable.

## Capacidades

- Sintesis de voz multilingue con salida en formato WAV a traves de un endpoint HTTP `POST /v1/tts`.
- Clonacion de voz zero-shot a partir de una referencia de audio corta: en el benchmark se usa una referencia de aproximadamente 12,09 s que se codifica como prompt con forma `[10, 261]`.
- Control inline de prosodia y emocion, con mas de 15.000 etiquetas de emocion segun la documentacion publica de Fish Audio S2 Pro.
- Soporte nativo de multiples hablantes y de instrucciones en dominio abierto.
- Modo de generacion con `streaming` configurable (desactivado en las pruebas documentadas, con el campo presente en la peticion).
- Latencia anunciada por el fabricante del modelo base por debajo de 150 ms en su pagina oficial.
- Tool calling / function calling: no aplica, es un modelo de sintesis de voz; no disponible en la informacion del repositorio.
- Razonamiento multi-paso o uso como agente: no disponible; el modelo no esta orientado a esas tareas.
- Vision o audio de entrada mas alla de la referencia de voz para clonacion: no disponible.

## Casos de uso

- Audiolibros y narracion en ruso: el modelo permite generar horas de audio con una sola voz de referencia y mantener el timbre entre fragmentos; la frase de prueba del repositorio esta en ruso y el tag `ru` es explicito, lo que lo hace adecuado para catalogos en ese idioma.
- Doblaje y localizacion: con control inline de emocion y prosodia se pueden ajustar tono y ritmo por escena sin reentrenar, partiendo de una referencia del actor original.
- Asistentes de voz en produccion: el endpoint `tools/api_server.py` expone una API HTTP que se integra con cualquier backend de aplicacion; el coste medido de 5,26 s de extremo a extremo por frase permite un uso por turnos mas que conversacional en tiempo real.
- Clonacion de voz personalizada para accesibilidad: pacientes con perdida de habla pueden conservar su timbre a partir de unos segundos de audio de referencia, dado el modo zero-shot.
- Generacion de locuciones para video y contenido corto: la salida WAV directa y la posibilidad de fijar `reference_id` facilitan lotes de locuciones consistentes.
- Despliegue sobre infraestructura AMD existente: el caso mas especifico de este repositorio; permite aprovechar aceleradores Radeon en lugar de migrar a NVIDIA, con una configuracion reproducible de ROCm 7.2, WSL2 y los flags de Inductor documentados.
- Pruebas de integracion continua de TTS: la peticion `curl` documentada sirve como prueba de humo repetible para verificar que un cambio de entorno no degrada el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; no son aplicables a un sistema TTS. Lo que si aporta el repositorio son medidas de rendimiento de inferencia sobre la Radeon AI PRO R9700:

| Prueba | Decodificado | Tokens semanticos generados | Total text-to-semantic | Ancho de banda reportado | VRAM | Extremo a extremo |
|---|---:|---:|---:|---:|---:|---:|
| Ejecucion en caliente nativa | 28,71 tok/s | 110 | 4,014 s | 125,83 GB/s | 11,24 GB | 5,256 s |
| Nativa, ejecucion 3 | 29,00 tok/s | 127 | 4,555 s | 128,03 GB/s | 11,24 GB | 5,791 s |
| Nativa, ejecucion 4 | 29,04 tok/s | 112 | 4,000 s | 128,61 GB/s | 11,24 GB | 5,168 s |
| `MAX_SEQ_LEN=2048` en caliente | 30,36 tok/s | 121 | 4,166 s | 133,40 GB/s | 10,78 GB | 5,414 s |
| Autotune en caliente | 32,52 tok/s | 122 | 3,915 s | 143,13 GB/s | 10,78 GB | 8,133 s |
| Mejor decodificado registrado | 33,17 tok/s | 132 | 4,099 s | 147,64 GB/s | 10,78 GB | 5,258 s |

El prefill registrado en la mejor ejecucion fue de 413 tokens en 0,118 s (3.488,9 tok/s). El autor advierte que la generacion es estocastica y que el numero de tokens de salida varia entre ejecuciones, por lo que recomienda comparar el throughput de decodificado junto con el tiempo de generacion en lugar de aislar una unica medida de tiempo de reloj.

## Requisitos de hardware

- VRAM observada: entre 10,78 GB y 11,24 GB reportados por Fish Speech con `MAX_SEQ_LEN=2048` y una referencia de audio de 12,09 s.
- GPU probada: AMD Radeon AI PRO R9700 (gfx1201), 32 GB de VRAM, con ROCm 7.2, PyTorch 2.11.0+rocm7.2, HIP 7.2.26015 y Python 3.12.3.
- Entorno de ejecucion: Windows 11 con WSL2 y Ubuntu 24.04.5 LTS; CPU Intel Core i5-13600KF.
- Consumo frente a GPU de 32 GB: el modelo ocupa aproximadamente un tercio de la memoria disponible, por lo que existe margen para lotes o secuencias mas largas, aunque no se documentan pruebas en ese sentido.
- Cabe en GPU de consumo: la instalacion local del modelo S2 Pro esta verificada por terceros en una RTX 3090 (24 GB) segun el gist enlazado; con 10-11 GB de uso, cualquier GPU con 12 GB o mas de VRAM es candidata, si bien no hay mediciones publicadas en la informacion disponible para esos casos.
- Despliegue: el repositorio documenta el servidor propio del proyecto (`tools/api_server.py` con `--mode tts --compile`, escucha en `0.0.0.0:8080`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan ni se validan en la informacion disponible.
- Latencia: 33,17 tok/s de decodificado en el mejor caso, con 5,26 s de extremo a extremo mediante `curl` para una frase rusa de 16 palabras.
- Advertencia de arranque: la primera peticion tras cambiar la configuracion de compilacion puede ser extremadamente lenta por la compilacion de `torch.compile`/Inductor y el autotuning; solo las ejecuciones en caliente son comparables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fish Speech S2 Pro (modelo base) | no disponible | no disponible | mas de 80 | no confirmada en la informacion disponible | GitHub de Fish Audio y Hugging Face |
| Fish Speech S2 Pro sobre ROCm (este repositorio) | no disponible | `MAX_SEQ_LEN=2048` en la configuracion medida | ru, en (etiquetas del repositorio) | MIT (solo el repositorio) | Hugging Face |
| Alternativas de la misma categoria (XTTS-v2, F5-TTS, Kokoro, Piper) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye especificaciones de modelos TTS alternativos, por lo que no es posible establecer una comparacion cuantitativa de parametros, contexto o licencia sin inventar datos. A efectos practicos, la comparacion relevante que si aporta este repositorio es interna: la misma configuracion pasa de 28,71 a 33,17 tok/s de decodificado y de 11,24 a 10,78 GB de VRAM al aplicar `MAX_SEQ_LEN=2048` y los ajustes de Inductor, lo que supone una mejora de aproximadamente el 15 por ciento en throughput dentro del mismo hardware.

## Limitaciones y advertencias

- El repositorio es una nota de reproducibilidad de un unico autor, con 0 descargas y 0 likes, y no ha sido replicado por terceros.
- Los resultados dependen de un hardware y una pila de software muy concretos (R9700, gfx1201, ROCm 7.2, PyTorch 2.11.0+rocm7.2, WSL2, Ubuntu 24.04.5); extrapolarlos a otras GPU AMD o a otras versiones de ROCm no esta justificado con los datos aportados.
- La generacion es estocastica: el numero de tokens semanticos varia entre ejecuciones y el tiempo de extremo a extremo no es una constante reproducible.
- La primera peticion tras modificar la configuracion de compilacion puede ser muy lenta por `torch.compile`/Inductor y el autotuning; en produccion conviene precalentar.
- La licencia MIT declarada cubre el repositorio de notas y configuracion, no necesariamente los pesos de Fish Speech S2 Pro, cuya licencia debe verificarse en la fuente original antes de un uso comercial.
- El uso de `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1` implica activar rutas experimentales del stack ROCm, con el riesgo de inestabilidad o cambios de comportamiento entre versiones.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de artefactos de sintesis, prosodia incorrecta o pronunciacion defectuosa en textos fuera de dominio; no se documentan metricas de calidad perceptual (MOS) en la informacion disponible.
- Los idiomas etiquetados en el repositorio son ru y en, aunque el modelo base declara mas de 80 idiomas; no se ha validado la calidad por idioma en este entorno concreto.
- No se documentan pruebas con cuantizacion, lotes o secuencias superiores a `MAX_SEQ_LEN=2048`, ni limites maximos de longitud de texto por peticion.
- La clonacion de voz exige consentimiento explicito de la persona cuya voz se replica; el repositorio no incluye salvaguardas ni marcas de agua al respecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vova-CJW/fish-speech-s2-pro-r9700-rocm72
- Repositorio oficial de Fish Speech: https://github.com/fishaudio/fish-speech
- Pesos de referencia S2 Pro en Hugging Face: https://huggingface.co/laxylj/s2-pro
- Demo en Hugging Face Spaces (MAYA-AI): https://huggingface.co/spaces/MAYA-AI/fish-s2-pro-zero
- Pagina oficial de Fish Audio S2: https://fish.audio/s2/
- Gist con la instalacion local verificada de S2 Pro en una RTX 3090: https://gist.github.com/jmanhype/af5bab2661714dea3513f5b0dfeebdcf
