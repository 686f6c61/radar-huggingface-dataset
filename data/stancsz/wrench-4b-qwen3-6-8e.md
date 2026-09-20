# stancsz/Wrench-4B-Qwen3.6-8E

## Resumen

Wrench-4B-Qwen3.6-8E es un modelo de lenguaje pequeno (SLM) de proposito especifico para herramientas de desarrollo, publicado por el usuario stancsz en Hugging Face. Se presenta como un derivado podado (pruned) de Qwen3.6-35B-A3B y esta disenado para tareas acotadas de asistencia al desarrollador, con una fuerte orientacion a contextos largos y a un runtime de busqueda determinista. El paquete es un artefacto experimental publico: descargable y reproducible, pero el propio autor advierte que las puertas de calidad finales (recuperacion nativa a 4M tokens y paridad con el flujo de trabajo de MiniMax) no se han superado.

El modelo contiene 3.881.244.016 parametros segun la model card y 3.945.236.336 parametros segun los pesos safetensors, manteniendose por debajo del techo declarado de 4,25B. La etiqueta de arquitectura qwen3_5_moe y su procedencia de Qwen3.6-35B-A3B indican una arquitectura de mezcla de expertos (MoE) podada, con una atencion hibrida que combina una ventana deslizante reciente (SWA) de 8K tokens y un runtime de lookup mecanico. La licencia es Apache-2.0.

Su relevancia actual es doble. Por un lado, explora el empaquetado de un SLM como directorio unico autosuficiente (tokenizer, runtime, overlay de contexto largo, metadatos con hash y lanzador FreeToken). Por otro, apunta a un caso de uso muy concreto: proponer acciones acotadas sobre herramientas de desarrollo sin autoridad directa de mutacion, delegando la ejecucion a un verificador externo. Es, por tanto, un experimento sobre limites de recuperacion, contexto efectivo y despliegue nativo mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE podada (derivada de Qwen3.6-35B-A3B) con atencion hibrida y runtime de lookup |
| Parametros totales | 3.945.236.336 segun safetensors; 3.881.244.016 segun la model card |
| Parametros activos | no disponible |
| Longitud de contexto | Endpoint de 4M tokens declarado; ventana SWA reciente de 8K; contexto efectivo de 64K en el fast path; config base del checkpoint de 2M posiciones |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; GGUF no verificado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe Wrench como un SLM podado y especifico de tarea, derivado de Qwen3.6-35B-A3B. La etiqueta qwen3_5_moe sugiere una arquitectura de mezcla de expertos, mientras que el propio autor habla de "atencion hibrida" y de "semanticas de lookup" que un GGUF generico no preservaria. El paquete integra ademas varios componentes mas alla de los pesos: un hook de tokenizer, un runtime de lookup mecanico determinista, un overlay de contexto largo, metadatos de paquete ligados por hash y un lanzador FreeToken.

En cuanto al entrenamiento, no se proporciona informacion sobre numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se explicita es la distincion entre capacidad de posicion y entrenamiento de contexto largo: la configuracion base del checkpoint soporta 2M posiciones, y la sonda de 4M se obtiene mediante una extension RoPE en tiempo de ejecucion, no mediante entrenamiento especifico de contexto largo. El "fast path" por defecto reduce mecanicamente payloads ruidosos a un contexto de trabajo efectivo de 64K. No hay datos disponibles sobre innovaciones como decodificacion especulativa.

## Capacidades

- Generacion de texto orientada a tareas de desarrollo (tags code y developer-tools).
- Razonamiento sobre contexto largo apoyado en el overlay y en el runtime de lookup mecanico.
- Reduccion determinista de payloads ruidosos a un contexto de trabajo efectivo de 64K en el fast path.
- Propuesta de acciones acotadas sobre herramientas de desarrollo; el modelo puede tambien abstenerse.
- Ejecucion condicionada por un verificador externo: Wrench no tiene autoridad directa de mutacion.
- Conversacion multi-turno (tag conversational).
- La etiqueta image-text-to-text sugiere capacidades de entrada imagen-texto, aunque la model card no las describe ni las confirma.
- No hay informacion disponible sobre soporte explicito de function calling, agentes multi-paso, capacidades multilingues ni modo thinking.

## Casos de uso

- Asistencia de codigo en IDE: el modelo puede recibir ficheros y contexto de repositorio y proponer ediciones o refactors acotados, siempre que un verificador externo aplique los cambios, porque no tiene autoridad directa de mutacion.
- Revision de cambios en pipelines de CI/CD: dado un diff y el contexto del repositorio, el modelo puede senalar problemas o proponer acciones de reparacion que el pipeline ejecute tras validacion.
- Recuperacion sobre corpus extensos: su endpoint declarado de 4M tokens lo orienta a busquedas sobre bases de codigo o documentacion muy grandes, aunque la calidad de recuperacion nativa a 4M sigue siendo una medida abierta.
- Preprocesado de payloads ruidosos: el fast path reduce entradas grandes a un contexto efectivo de 64K, util para limpiar logs o trazas antes de pasarlas a otro sistema.
- Sugerencia de acciones en herramientas de desarrollo: el modelo propone comandos o parches delimitados y se abstiene cuando no alcanza un umbral, delegando la politica de ejecucion en el entorno.
- Agente con verificacion estricta: integrado como planificador que solo emite propuestas, con un verificador que decide si se ejecutan, encaja en flujos donde la seguridad de ejecucion es critica.
- Analisis de bases de codigo con ventana deslizante de 8K: para tareas de inspeccion local donde basta el contexto reciente, la SWA de 8K permite un coste de atencion acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona explicitamente que la calidad de recuperacion nativa a 4M, el throughput bajo concurrencia de produccion y la suite completa de aceptacion de flujo de trabajo emparejado con MiniMax siguen siendo mediciones abiertas.

## Requisitos de hardware

- VRAM estimada: con 3,9B parametros, en fp16/bf16 los pesos ocupan alrededor de 7,9 GB (coincide con el tamano de repo de 7,9 GB); en cuantizacion de 8 bits serian unos 4 GB y en 4 bits unos 2,5 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: no se especifican. El lanzador nativo FreeToken requiere una GPU CUDA.
- GPU de consumo: por tamano, un modelo de ~4B en fp16 cabe en GPU de consumo con 12-16 GB de VRAM (por ejemplo RTX 4080/4090 o superiores), pero esta afirmacion es una estimacion por tamano y no una compatibilidad verificada del runtime nativo.
- Opciones de despliegue: Hugging Face Safetensors (paquete experimental publico), FreeToken (backend experimental verificado localmente) y vLLM (requiere un adaptador de arquitectura Wrench registrado). Ollama, llama.cpp y GGUF no estan verificados para la atencion hibrida y las semanticas de lookup, y el autor advierte de que una conversion GGUF generica podria no preservar estas caracteristicas.
- Latencia y throughput: no disponibles; el throughput bajo concurrencia de produccion figura entre las medidas pendientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Wrench-4B-Qwen3.6-8E | ~3,9B (MoE podada) | 4M declarados (2M en config base; 64K efectivos en fast path) | Apache-2.0 | safetensors | Artefacto experimental; sin benchmarks publicados |
| Qwen3-4B | 4B | 32K nativo, ampliable a 128K con YaRN | Apache-2.0 | safetensors, GGUF | Modelo generalista de referencia en el mismo rango de tamano |
| Phi-4-mini | 3,8B | 128K | MIT | safetensors, GGUF | Enfocado a razonamiento y matemáticas |
| Llama-3.2-3B | 3B | 128K | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Alternativa generalista con ecosistema amplio |

La comparacion de rendimiento no esta disponible: no hay benchmarks publicados para Wrench en la informacion proporcionada. Las filas de los modelos alternativos recogen solo parametros, contexto, licencia y formatos, no resultados medidos frente a Wrench.

## Limitaciones y advertencias

- Artefacto experimental: el autor advierte que no se han superado las puertas de calidad de recuperacion a 4M ni la paridad con el flujo de trabajo de MiniMax.
- El contexto de 4M es una sonda con extension RoPE en tiempo de ejecucion, no un entrenamiento de contexto largo; la config base del checkpoint es de 2M posiciones.
- Sin datos publicados de sesgos, alucinacion, rendimiento multilingue ni idiomas soportados.
- Zero descargas y zero likes en el momento de la ficha: no hay validacion de la comunidad.
- Compatibilidad de despliegue muy limitada: vLLM necesita un adaptador de arquitectura, y Ollama, llama.cpp y GGUF no estan verificados. No se debe asumir que una conversion GGUF generica preserve la atencion hibrida ni las semanticas de lookup.
- El lanzador nativo FreeToken requiere una compilacion compatible y una GPU CUDA.
- Sin autoridad directa de mutacion: el modelo solo propone acciones acotadas o se abstiene; es obligatorio un verificador externo que aplique la politica de ejecucion.
- Licencia Apache-2.0: permite uso comercial, pero al tratarse de un artefacto experimental sin benchmarks ni validacion externa, no es recomendable para produccion sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/stancsz/Wrench-4B-Qwen3.6-8E
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada (los resultados devueltos correspondian a paginas de Google Translate, no relacionadas con el modelo).
