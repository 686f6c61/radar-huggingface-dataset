# xidisdg/qwen3_8_27b-ninfer

## Resumen

Este repositorio distribuye tres archivos de pesos en formato nativo `.ninfer` derivados de un supuesto modelo Qwen3.8-27B en su variante "uncensored". Lo publica el usuario xidisdg y no se trata de un modelo entrenado desde cero, sino de pesos cuantizados y empaquetados para el runtime NInfer, un motor de inferencia alternativo. El repositorio fue creado en septiembre de 2026 y acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria de su funcionamiento.

El interés técnico del artefacto es doble: por un lado emplea configuraciones de cuantización NVFP4 y NVFP4Full, orientadas a GPUs Blackwell, y por otro ofrece una variante con DFlash2, el mecanismo de decodificación especulativa del runtime. El autor documenta explícitamente que estos archivos no son GGUF ni safetensors cargables con Transformers, y que solo funcionan en compilaciones de NInfer que registren las configuraciones de pesos correspondientes.

La información publicada es deliberadamente incompleta en los aspectos críticos: no se documentan el checkpoint base exacto, el método de eliminación de rechazos, los parámetros de conversión, la longitud de contexto nativa, los idiomas soportados ni la licencia. El propio autor advierte que la etiqueta `uncensored` identifica la versión del archivo y no implica que se hayan realizado evaluaciones de tasa de rechazo, seguridad o capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; pesos derivados de la familia Qwen3.8-27B, estructura interna no documentada |
| Parametros totales | aproximadamente 27B segun el nombre del repositorio; no confirmado en la model card |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE) |
| Longitud de contexto | no documentada; los ejemplos del autor usan `--max-context 16384` |
| Tipos de cuantizacion | NVFP4 y NVFP4Full; el autor advierte que no todos los tensores tienen por que usar el mismo formato de 4 bits. La cache KV puede configurarse en int8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor declina etiquetar licencia al no estar verificados los terminos del checkpoint original |
| Formato de pesos | contenedor nativo `.ninfer` (no es GGUF ni safetensors compatible con Transformers) |
| Tamano de los archivos | 18,32 GB (`nvfp4full`), 20,55 GB (`nvfp4full` + DFlash2) y 21,49 GB (`nvfp4`) |
| Runtime requerido | NInfer (binarios `ninfer.exe` / `ninfer-serve.exe`) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento. El repositorio es un artefacto de conversion y empaquetado: toma pesos de la familia Qwen3.8-27B, ya modificados para eliminar rechazos segun el autor, y los serializa en el contenedor `.ninfer` con dos configuraciones de cuantizacion distintas.

La unica innovacion tecnica documentada es DFlash2, un componente de decodificacion especulativa que se activa mediante el parametro `--spec dflash` y `--draft-tokens 7` en la compilacion local del autor, aunque otras ramas de NInfer usan `--spec dflash2`. El autor advierte que la decodificacion especulativa no garantiza aceleracion en todas las tareas, que impone requisitos adicionales de runtime y que su activacion puede fallar si la compilacion no registra los objetos `dflash2/*`. No se documentan detalles del algoritmo, del modelo borrador ni de las tasas de aceptacion.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `text-generation` y `conversational`.
- Modo de razonamiento: los ejemplos de arranque incluyen el parametro `--preserve-thinking`, lo que indica soporte de un modo de pensamiento cuyo contenido se conserva en la salida. No se documenta su funcionamiento.
- Servicio compatible con la API de OpenAI: el runtime puede exponerse en `http://127.0.0.1:8080/v1` y ofrece una Web UI opcional mediante `--webui`.
- Generacion sin alineamiento de rechazo: la variante se etiqueta como `uncensored`, sin que existan evaluaciones publicadas de tasa de rechazo.
- Conciliacion de versiones de cuantizacion: tres archivos alternativos con distintas relaciones tamano/precision.
- Decodificacion especulativa: disponible solo en la variante DFlash2 y dependiente de la compilacion del runtime.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, vision, audio ni capacidades multimodales en la informacion disponible.
- Cobertura idiomatica: no disponible.

## Casos de uso

- Escritura creativa y narrativa sin restricciones de contenido: el etiquetado `uncensored` y el modo conversacional lo hacen adecuado para generacion de ficcion adulta o temas que otros modelos rechazan, siempre que el operador asuma la responsabilidad editorial del contenido.
- Investigacion en seguridad y alineamiento: util como contrapunto en estudios de tasa de rechazo, toxicidad y adherencia a instrucciones, comparando sus salidas con las de un checkpoint alineado equivalente.
- Inferencia local en estaciones de trabajo Windows con GPU Blackwell: los ejemplos documentados apuntan a un uso monousuario en Windows 11 x64 con CUDA 13.1 y una RTX 5090, sin dependencia de servicios en la nube.
- Servidor de inferencia local con API compatible con OpenAI: `ninfer-serve.exe` permite levantar un endpoint en `127.0.0.1:8080/v1` para conectar clientes o scripts existentes que ya hablan el protocolo de OpenAI.
- Generacion de datos sinteticos para ajuste fino: con la cache KV en int8 y una sola peticion concurrente, se puede usar como generador por lotes en un equipo aislado, teniendo en cuenta que no hay benchmarks de calidad publicados.
- Experimentacion con cuantizacion NVFP4: comparar las tres variantes bajo el mismo hardware y los mismos prompts permite medir la degradacion de calidad y la ganancia de velocidad de NVFP4 y NVFP4Full en la practica.
- Pruebas de decodificacion especulativa: la variante DFlash2 sirve para evaluar si la propuesta de borrador acelera la generacion en tareas de salida corta y predecible, midiendo latencia de primer token y tokens por segundo frente a la variante sin DFlash2.
- Analisis de cadenas de razonamiento: el parametro `--preserve-thinking` facilita conservar y auditar el rastro de razonamiento en tareas de matematicas o logica, aunque no haya resultados de benchmarks que respalden su precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el repositorio no ha publicado tokens/s, latencia de primer token, precision, tasa de rechazo ni evaluaciones multimodales, y que las puntuaciones o velocidades de otros repositorios no deben extrapolarse a estos tres archivos.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan entre 18,32 GB y 21,49 GB en disco, y ese volumen debe residir en memoria de GPU en su totalidad para evitar offloading. A ello se suma la cache KV, la longitud de contexto, la concurrencia y, en su caso, los componentes de decodificacion especulativa.
- GPU de referencia del autor: RTX 5090 con `sm_120a`; el autor especifica que esta es la GPU objetivo del paquete portable probado y que no constituye una promesa de compatibilidad con otras tarjetas RTX.
- NVFP4 es un formato de 4 bits asociado a la arquitectura Blackwell. No se ha verificado su funcionamiento en generaciones anteriores (Ampere, Ada) ni en aceleradores de otros fabricantes.
- GPU recomendadas: no disponible. Solo se documenta la RTX 5090 como entorno de pruebas del publicador; no hay datos sobre A100, H100 u otras.
- Compatibilidad con GPU de consumo: unicamente la RTX 5090 esta mencionada. Su VRAM de 32 GB deja margen para los pesos y una cache KV moderada, pero el autor recomienda empezar con contextos cortos.
- Opciones de despliegue: exclusivamente NInfer (`ninfer.exe` para generacion puntual y `ninfer-serve.exe` para servicio HTTP con interfaz compatible con OpenAI y Web UI opcional). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers, y modificar la extension de los archivos no los hace compatibles con otros motores.
- Entorno validado: Windows 11 x64 con CUDA 13.1. La compatibilidad con Linux y con otras ramas del runtime no ha sido verificada de forma independiente. Los binarios portables deben conservar sus DLL asociados.
- Ajuste de memoria: ante errores de VRAM, el autor recomienda reducir `--max-context` y `--kv-capacity`, mantener `--max-concurrency 1` y cerrar otras aplicaciones que usen la GPU.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token para ninguna de las tres variantes.
- Limitaciones operativas conocidas: NVFP4Full y DFlash2 pueden requerir ramas o parches especificos del runtime; no toda compilacion etiquetada como `0.2.0` carga las tres variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xidisdg/qwen3_8_27b-ninfer (este repositorio) | ~27B segun el nombre, no confirmado | no disponible (ejemplos con 16384) | NVFP4 y NVFP4Full en contenedor `.ninfer` | no disponible | 0 descargas, 0 likes |
| neroued/Qwen3.8-27B-nvfp4-NInfer | no disponible | no disponible | NVFP4 en contenedor `.ninfer` | no disponible | referenciado por el autor; sin datos verificados en esta busqueda |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | no disponible | no disponible | NVFP4Full con DFlash2 | no disponible | referenciado por el autor; sin datos verificados en esta busqueda |
| Checkpoint original Qwen3.8-27B uncensored | no disponible | no disponible | no aplica | no disponible | no identificado en el repositorio |

La busqueda web realizada no devolvio informacion tecnica util: los resultados fueron paginas de inicio de sesion de Outlook, sin relacion con el modelo. No se dispone de datos de rendimiento, licencia ni tamanos verificables de los repositorios de referencia.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks de precision, tasa de rechazo, sesgo ni calidad, ni antes ni despues de la cuantizacion NVFP4.
- La etiqueta `uncensored` no acredita nada: el autor aclara que identifica la version publicada y no implica que se hayan medido capacidades o comportamiento de rechazo.
- Procedencia opaca: no se documentan el checkpoint base exacto, el metodo de eliminacion de rechazos, los parametros de conversion ni la version de origen, por lo que la trazabilidad del modelo es nula.
- Licencia indeterminada: el autor evita asignar licencia y advierte que no puede asumirse que los pesos derivados hereden la licencia de los repositorios Qwen o NInfer citados. Cualquier uso comercial o redistribucion exige verificar los terminos de los pesos originales, del artefacto convertido y de los componentes adicionales.
- Riesgo de alucinacion y contenido inapropiado: la model card reconoce explicitamente que la salida puede contener errores facticos, sesgos o material no apto, y que el codigo y las llamadas a herramientas deben revisarse antes de ejecutarse.
- Encapsulamiento en un runtime marginal: sin soporte en llama.cpp, Ollama, vLLM, TGI ni Transformers, la portabilidad es minima y el despliegue queda ligado a las ramas concretas de NInfer que registren NVFP4, NVFP4Full y DFlash2.
- Compatibilidad de hardware muy estrecha: solo se documenta Windows 11 x64, CUDA 13.1 y `sm_120a`. No hay verificacion en Linux, en GPUs no Blackwell ni en aceleradores de otros fabricantes.
- Contexto limitado en los ejemplos: las ordenes de arranque usan 16384 tokens de contexto y una sola peticion concurrente; no hay datos sobre la ventana nativa del modelo.
- Cuantizacion heterogenea: el autor advierte que `nvfp4` y `nvfp4full` son nombres de configuracion y que no todos los tensores tienen por que estar en el mismo formato de 4 bits, de modo que el tamano del archivo no predice ni la calidad ni la velocidad. Cualquier comparacion exige medir en el mismo hardware, con los mismos prompts y parametros.
- Componentes no confirmados: la model card menciona un modulo de vision y la decodificacion especulativa como factores de consumo de VRAM, pero no documenta que este modelo tenga capacidades de vision. Debe considerarse no confirmado.
- Metadatos poco fiables: la fecha de creacion registrada es de septiembre de 2026 y el contador de descargas es 0. El propio autor aclara que el campo `library_name: ninfer` existe para que el recuento de descargas de Hugging Face reconozca la extension `.ninfer`, y que ese contador no es un registro por archivo en tiempo real.
- Exposicion de red: los ejemplos escuchan en `127.0.0.1`. Si se abre el servicio a la red, el autor recomienda configurar autenticacion y control de acceso. El modo `--preserve-thinking` persiste el rastro de razonamiento y puede filtrar informacion si el endpoint queda accesible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xidisdg/qwen3_8_27b-ninfer
- Descarga de la variante NVFP4: https://huggingface.co/xidisdg/qwen3_8_27b-ninfer/resolve/main/qwen3_8_27b_nvfp4_uncensored.ninfer?download=true
- Descarga de la variante NVFP4Full: https://huggingface.co/xidisdg/qwen3_8_27b-ninfer/resolve/main/qwen3_8_27b_nvfp4full_uncensored.ninfer?download=true
- Descarga de la variante NVFP4Full + DFlash2: https://huggingface.co/xidisdg/qwen3_8_27b-ninfer/resolve/main/qwen3_8_27b_nvfp4full_uncensored_dflash2.ninfer?download=true
- Proyecto NInfer (upstream): https://github.com/Neroued/ninfer
- Port de NInfer para Windows: https://github.com/natpate/ninfer-windows
- Repositorio de referencia neroued/Qwen3.8-27B-nvfp4-NInfer: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Repositorio de referencia gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Discusiones y reporte de errores: https://huggingface.co/xidisdg/qwen3_8_27b-ninfer/discussions
- Perfil del autor: https://huggingface.co/xidisdg
- Paper, blog oficial o demo: no disponible.
