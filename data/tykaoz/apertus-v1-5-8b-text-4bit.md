# TyKaoz/Apertus-v1.5-8B-text-4bit

## Resumen

Apertus-v1.5-8B-text-4bit es una cuantizacion de 4 bits en formato MLX del modelo `swiss-ai/Apertus-v1.5-8B`, publicada por el usuario TyKaoz. Se trata de una extraccion de la rama exclusivamente de texto del checkpoint omni original: las torres de vision y audio, asi como sus codebooks, han sido eliminadas y solo se conservan los pesos del decodificador de lenguaje, cuantizados con `mlx-lm`. El resultado es un modelo de 8.053.338.112 parametros (~8,05 mil millones) que ocupa aproximadamente 4,2 GB en disco, pensado para ejecutarse en Apple Silicon mediante la libreria MLX.

El modelo base pertenece a la Swiss AI Initiative, un esfuerzo conjunto de EPFL, ETH Zurich y CSCS cuyo objetivo es publicar modelos completamente abiertos. Apertus incorpora un contexto declarado de 262.144 tokens y una activacion xIELU, y cubre cinco idiomas: ingles, frances, aleman, italiano y romanche. La relevancia de esta ficha concreta radica en que permite ejecutar un modelo de contexto muy largo en hardware de consumo Apple sin necesidad de GPUs dedicadas, a costa de renunciar a las capacidades multimodales del checkpoint original.

Al ser una cuantizacion derivada, hereda la licencia Apache 2.0 del modelo base, con la salvedad de que se mantiene la politica de uso aceptable de Apertus. No se han publicado resultados de benchmarks especificos para esta version cuantizada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (activacion xIELU); rama de texto del checkpoint omni de Apertus |
| Parametros totales | 8.053.338.112 (~8,05 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | Ingles, frances, aleman, italiano y romanche |
| Licencia | Apache 2.0, con politica de uso aceptable de Apertus |
| Formato de pesos | safetensors (MLX) |

Datos adicionales: tamano del repositorio 4,5 GB; peso del modelo cuantizado ~4,2 GB; libreria `mlx`; pipeline `text-generation`; tokenizer y plantilla de chat originales del modelo base.

## Arquitectura y entrenamiento

La ficha disponible no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados, por lo que esos datos se consideran no disponibles. Lo que si se especifica es que el modelo base es un transformer con funcion de activacion xIELU y una ventana de contexto de 262.144 tokens, y que el checkpoint original es multimodal (omni), con torres de imagen y audio y sus correspondientes codebooks.

Esta publicacion concreta no es un reentrenamiento ni un ajuste fino: es un proceso de extraccion y cuantizacion. Se toman los pesos del modelo base `swiss-ai/Apertus-v1.5-8B`, se aísla la rama de texto descartando las torres de vision y audio, y se cuantiza a 4 bits con tamano de grupo 64 mediante `mlx-lm`. Se conservan intactos el tokenizer y la plantilla de chat del original. No se documenta en la informacion proporcionada si hubo RLHF, DPO u otros procesos de alineamiento en el modelo base, ni si la cuantizacion incluye tecnicas adicionales de recuperacion de precision.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en cinco idiomas: ingles, frances, aleman, italiano y romanche.
- Razonamiento de contexto largo: la ventana de 262.144 tokens permite procesar documentos extensos o conversaciones muy prolongadas sin truncar.
- Uso mediante plantilla de chat original del modelo base, adecuada para dialogos multi-turno.
- Capacidades de tool calling y function calling: no confirmadas en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no incluidas. Esta version es text-only y prescinde de las torres de imagen y audio del checkpoint omni.
- Modo thinking o razonamiento explicito: no documentado en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional local en macOS: el modelo se ejecuta con `mlx-lm` sobre Apple Silicon, lo que permite construir un asistente de chat privado sin enviar datos a servicios externos, algo coherente con el enfoque privacy-first del publicador.
- Analisis de documentos largos: con 262.144 tokens de contexto se pueden introducir informes, tesis o expedientes completos y pedir resumenes o extraccion de datos sin fragmentar el texto en trozos.
- Procesamiento de documentacion tecnica multilingue: al cubrir ingles, frances, aleman e italiano, resulta util para traduccion y resumen de manuales y especificaciones en entornos europeos.
- Preservacion y tratamiento de textos en romanche: es uno de los pocos modelos abiertos que declara soporte de este idioma, lo que lo hace apropiado para proyectos de digitalizacion o divulgacion en lenguas minorizadas.
- Prototipado rapido en estaciones de trabajo Apple: sirve para validar prompts, plantillas de chat y flujos de generacion antes de escalar a un despliegue en servidor, gracias a su tamano reducido de 4,2 GB.
- Investigacion sobre cuantizacion: al ser una version 4-bit conocida del mismo checkpoint que el modelo base, permite estudiar la degradacion de calidad frente a los pesos originales en tareas controladas.
- Generacion de borradores y reescritura de texto: adecuado para tareas de redaccion asistida en los cinco idiomas soportados, ejecutandose de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del modelo cuantizado: ~4,2 GB en disco, segun la model card. El repositorio completo ocupa 4,5 GB.
- Plataforma: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) mediante memoria unificada; MLX no esta pensado para GPUs NVIDIA ni AMD.
- Memoria: se necesita espacio para los pesos (~4,2 GB) mas la cache KV. Con contextos largos, la cache crece de forma apreciable y puede hacer inviable alcanzar los 262.144 tokens en equipos con 16 GB de memoria unificada. No se dispone de cifras exactas de consumo de cache KV en la informacion proporcionada.
- GPU recomendadas: no aplica en el sentido habitual; el modelo es para Apple Silicon. Para CUDA habria que reconvertir el modelo base a otro formato, algo no cubierto por esta publicacion.
- Despliegue: `mlx-lm` mediante el comando `mlx_lm.generate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta version concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|---|
| TyKaoz/Apertus-v1.5-8B-text-4bit | ~8,05 mil millones | 262.144 tokens | 4 bits, group 64, MLX | No (text-only) | Apache 2.0 | Solo Apple Silicon; ~4,2 GB |
| swiss-ai/Apertus-v1.5-8B (base) | ~8,05 mil millones | 262.144 tokens | Pesos originales | Si (torres de imagen y audio) | Apache 2.0 con politica de uso aceptable | Checkpoint omni completo |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de otros modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad respecto a los pesos originales, especialmente en tareas de razonamiento complejo o generacion de codigo. No se han publicado evaluaciones que cuantifiquen esa perdida.
- Es una version text-only: se han eliminado las torres de vision y audio, de modo que no puede procesar imagenes ni audio aunque el modelo base si pueda.
- Restriccion de plataforma: al estar en formato MLX, solo funciona en Apple Silicon. No es portable directamente a CUDA, ROCm ni a otros runtimes sin una conversion previa.
- Idiomas limitados a ingles, frances, aleman, italiano y romanche. El castellano no figura entre los idiomas declarados, por lo que el rendimiento en espanol no esta garantizado.
- Aunque el contexto declarado es de 262.144 tokens, alcanzar esa longitud requiere una cantidad de memoria muy superior a la del propio modelo, lo que en la practica limita el contexto util en equipos de consumo.
- Licencia Apache 2.0 heredada del modelo base, con la politica de uso aceptable de Apertus. Conviene revisar dicha politica antes de un uso comercial, ya que puede imponer condiciones adicionales.
- Riesgo de alucinacion: no se documenta ningun proceso especifico de mitigacion en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Las busquedas web realizadas no devolvieron informacion relevante sobre el modelo; los resultados obtenidos trataban sobre la hora local en Japon y no guardan relacion con esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TyKaoz/Apertus-v1.5-8B-text-4bit
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Sitio del publicador: https://www.tykaoz.bzh
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web disponibles.
