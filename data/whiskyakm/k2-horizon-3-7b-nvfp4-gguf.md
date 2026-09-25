# WhiskyAKM/K2-Horizon-3.7B-NVFP4-GGUF

## Resumen

K2-Horizon-3.7B-NVFP4-GGUF es una conversion a formato GGUF con cuantizacion NVFP4 del modelo denso K2-Horizon-3.7B, desarrollado por el equipo IFM. El repositorio lo publica el usuario WhiskyAKM y su unico artefacto es `K2-Horizon-3.7B-nvfp4.gguf`, pensado para su uso con llama.cpp y otros motores compatibles con GGUF. Se trata de un modelo decoder-only de tipo denso, con una ventana de contexto nativa de 512K tokens (524.288) y licencia Apache 2.0.

La relevancia de esta publicacion es doble. Por un lado, traslada a un formato abierto y ejecutable en local un modelo que, segun la model card, se situa como base pequena para tareas agénticas y de codigo. Por otro, emplea NVFP4, el formato de punto flotante de 4 bits de NVIDIA, optimizado para hardware Blackwell, lo que reduce el peso del modelo a unos 3 GB de repositorio y lo hace desplegable en GPUs de consumo.

Conviene senalar una discrepancia documental relevante: la model card declara "3.7B" de parametros, mientras que los metadatos de safetensors del propio repositorio indican 5.058.255.360 parametros (~5,06B). La ficha recoge ambas cifras sin resolver la contradiccion, ya que la informacion disponible no permite determinar cual es la correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia K2-Horizon) |
| Parametros totales | 5.058.255.360 (~5,06B) segun metadatos de safetensors; la model card declara 3,7B ("3.7B-core") |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde las etapas de midtraining |
| Tipos de cuantizacion | NVFP4 (GGUF). No se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`K2-Horizon-3.7B-nvfp4.gguf`) |
| Modalidades | texto |
| Libreria | llama-cpp |
| Modelo base | IFM/K2-Horizon-3.7B |
| Tamano del repositorio | 3,0 GB |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

La informacion disponible describe K2-Horizon-3.7B como un modelo denso decoder-only (transformer) de la familia K2-Horizon, del que esta publicacion es "el miembro pequeno". La model card no detalla la composicion interna (numero de capas, dimension oculta, cabezas de atencion, tipo de positional encoding ni si emplea atencion lineal o hibrida), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta la receta de entrenamiento por etapas, mas alla de la mencion de que la ventana de 512K tokens es nativa "desde las etapas de midtraining".

La innovacion tecnica destacable en este repositorio concreto no esta en el modelo base, sino en la cuantizacion: NVFP4 es un formato de punto flotante de 4 bits con escala por bloque disenado por NVIDIA para hardware Blackwell. Frente a cuantizaciones enteras de 4 bits, NVFP4 preserva un rango dinamico mayor mediante mantisa y exponente, lo que en teoria reduce la degradacion de calidad. No se documentan en la informacion disponible detalles sobre calibracion, tamano de bloque, ni comparativas de perplejidad entre el modelo original y esta conversion, por lo que la fidelidad de la cuantizacion no puede verificarse con los datos aportados.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline `text-generation` y orientacion conversacional segun las etiquetas del repositorio.
- Razonamiento matematico, segun los resultados reportados en HMMT Feb 2026.
- Generacion y edicion de codigo en repositorios reales, segun los resultados reportados en SWE-bench Verified.
- Razonamiento cientifico, con resultados reportados en GPQA Diamond, HLE y SciCode.
- Uso de herramientas y function calling: la model card incluye resultados de BFCL v4 y tau3-Banking, lo que indica soporte declarado de tool calling.
- Flujos agénticos y multi-step: se reportan resultados en Terminal-Bench 2.1, orientado a tareas de terminal.
- Capacidad multilingue limitada: el unico idioma declarado es el ingles.
- No se declaran capacidades de vision, audio, thinking mode explicito ni decodificacion especulativa.

## Casos de uso

- Asistente de codigo en local: al ser un GGUF de ~3 GB ejecutable con llama.cpp, puede desplegarse como copiloto de programacion en una estacion de trabajo sin enviar codigo a servicios externos, lo que facilita el cumplimiento de politicas de confidencialidad.
- Automatizacion de tareas de terminal y DevOps: los resultados declarados en Terminal-Bench 2.1 apuntan a un uso como agente que ejecuta comandos, interpreta salidas y corrige errores en pipelines de integracion continua.
- Atencion al cliente automatizada: la ventana de 512K tokens permite mantener historiales de conversacion muy largos sin truncado agresivo, util en soporte tecnico con trazabilidad de incidencias.
- Analisis de documentos extensos en ingles: informes, expedientes o bases de codigo que superan ampliamente el contexto tipico de modelos de su clase pueden procesarse en una sola pasada, siempre que el hardware soporte el KV cache resultante.
- Apoyo al razonamiento cientifico y matematico: como herramienta de ayuda en resolucion de problemas de nivel competitivo, a partir de los resultados declarados en HMMT y SciCode.
- Prototipado de agentes con tool calling: la compatibilidad con `llama-server` en modo API compatible con OpenAI permite integrarlo en frameworks de agentes que consumen ese protocolo, usando BFCL v4 como referencia de su fiabilidad declarada en llamadas a funciones.
- Inferencia en el borde o en equipos sin GPU dedicada de gama alta: el peso reducido del archivo NVFP4 hace viable ejecutarlo en portatiles con GPU de consumo, con la salvedad del rendimiento en hardware no Blackwell.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del repositorio, que a su vez los atribuye a la descripcion del modelo base IFM/K2-Horizon-3.7B. No se han verificado de forma independiente y corresponden al modelo sin cuantizar, no a esta conversion NVFP4.

| Benchmark | K2-Horizon-3.7B | Qwen3.5-4B | G9v3-3B | Granite 4.2-3B | Nemotron 3 Nano-4B |
|---|---|---|---|---|---|
| HMMT Feb 2026 (matematicas) | 70,5 | 61,6 | 34,1 | 57,2 | 34,7 |
| SWE-bench Verified (codigo) | 68,6 | 41,2 | 16,4 | 32,2 | 1,8 |
| GPQA Diamond (razonamiento cientifico) | 65,4 | 77,1 | 43,8 | 55,9 | 51,3 |
| HLE | 12,9 | 9,9 | 4,5 | 6,6 | 4,9 |
| SciCode | 25,9 | 16,1 | 17,7 | 24,9 | 16,4 |
| Terminal-Bench 2.1 (agentes) | 25,1 | 25,8 | 6,0 | 13,9 | 3,7 |
| tau3-Banking | 17,7 | 6,8 | no disponible | 5,6 | no disponible |
| BFCL v4 | 50,9 | 55,7 | 47,9 | 50,8 | 36,8 |

Todos los valores estan expresados en porcentaje; la negrita original marcaba el mejor resultado de cada fila. No se han publicado mediciones de rendimiento especificas para el archivo NVFP4, ni comparativas de perplejidad o de degradacion frente al modelo original.

## Requisitos de hardware

- Peso en disco y en VRAM: el repositorio ocupa 3,0 GB, de modo que los pesos en NVFP4 ocupan aproximadamente ese orden de magnitud, mas el overhead del runtime.
- GPU recomendadas para aprovechar NVFP4 de forma nativa: arquitectura NVIDIA Blackwell (B100, B200, GB200, RTX serie 50). En estas GPU la descompresion de 4 bits esta acelerada por hardware.
- GPU compatibles en la practica: cualquier GPU soportada por llama.cpp con suficiente VRAM, dado que en hardware anterior a Blackwell el motor descomprime los pesos a un formato de computo de mayor precision. La ventaja pasa a ser principalmente de ahorro de VRAM y de ancho de banda, no de velocidad de calculo.
- GPU de consumo: el modelo cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En tarjetas de 6 GB puede ser ajustado segun el contexto configurado.
- Memoria para el KV cache: es el factor limitante real. La ventana declarada de 512K tokens exige un KV cache de gran tamano cuyas cifras exactas no estan disponibles en la informacion proporcionada; en la practica conviene activar cuantizacion del KV cache y limitar el contexto a valores manejables (por ejemplo, 8K-32K) en hardware de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), y cualquier runtime que consuma GGUF, como Ollama o LM Studio. El soporte de NVFP4 en vLLM y TGI no esta confirmado en la informacion disponible.
- Parametros de muestreo sugeridos por el autor: `--temp 1.0 --top-p 0.95`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La unica comparativa con datos es la publicada por el autor frente a Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B. Solo se dispone de sus resultados en los benchmarks anteriores; sus especificaciones de contexto, licencia y formato no constan en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento relativo (benchmarks del autor) |
|---|---|---|---|---|---|
| K2-Horizon-3.7B (este) | 3,7B declarados / ~5,06B en safetensors | 524.288 tokens | Apache 2.0 | GGUF NVFP4 (aqui); base original en safetensors | Mejor en HMMT Feb 2026, SWE-bench Verified, HLE, SciCode y tau3-Banking |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | Mejor en GPQA Diamond y Terminal-Bench 2.1, y ligeramente superior en BFCL v4 |
| Granite 4.2-3B | 3B | no disponible | no disponible | no disponible | Competitivo en SciCode; inferior en el resto |
| Nemotron 3 Nano-4B | 4B | no disponible | no disponible | no disponible | Inferior en todas las filas reportadas salvo GPQA Diamond y HLE, donde queda por debajo igualmente |
| G9v3-3B | 3B | no disponible | no disponible | no disponible | El mas flojo de la comparativa en la mayoria de filas |

## Limitaciones y advertencias

- Idiomas: el unico idioma declarado es el ingles. No hay evidencia de soporte solido de castellano ni de otras lenguas, por lo que su uso en produccion multilingue requeriria validacion propia.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni tasas de alucinacion para este modelo, ni para la conversion NVFP4.
- Degradacion por cuantizacion: no se publican metricas de perplejidad ni comparativas entre el modelo original y el archivo NVFP4. Una cuantizacion de 4 bits puede degradar tareas sensibles, especialmente codigo y matematicas de varios pasos.
- Requisitos de hardware especificos: NVFP4 rinde de forma nativa en Blackwell; en GPUs anteriores el beneficio se limita al ahorro de memoria. Esto puede generar expectativas de rendimiento incorrectas.
- Coste del contexto largo: los 512K tokens son una capacidad teorica que exige recursos de memoria proporcionales; en despliegues modestos el contexto efectivo sera muy inferior.
- Discrepancia en el recuento de parametros: la model card indica 3,7B y los metadatos de safetensors ~5,06B. Debe verificarse antes de dimensionar infraestructura.
- Benchmarks no verificados: todas las cifras proceden del autor del modelo y no de una evaluacion independiente. Resultados como 68,6 en SWE-bench Verified para un modelo de esta clase son atipicamente altos y deberian tratarse con cautela.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni mantenimiento posterior documentado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. Conviene comprobar, no obstante, las condiciones del modelo base IFM/K2-Horizon-3.7B.
- Ausencia de garantias: al ser un artefacto de terceros sobre un modelo base ajeno, no hay soporte del autor original para esta conversion concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WhiskyAKM/K2-Horizon-3.7B-NVFP4-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Blog de IFM sobre la familia K2 Horizon: https://ifm.ai/blog/k2/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos enlaces utiles son los citados en la model card y en los metadatos del repositorio.
