# SuperLogic/Qwen3.8-27B-Flash-MTP-V2-GGUF

## Resumen

Qwen3.8-27B-Flash-MTP-V2-GGUF es una cuantización ternaria de un modelo de código de 27B parámetros (clase Qwen3.8-27B), publicada por el usuario SuperLogic y construida sobre el backbone ternario de PrismML (Bonsai 2.5). Su objetivo es ejecutar un modelo de 27B con contexto largo en GPUs de consumo con 8 GB de VRAM, algo que la cuantización oficial de 4 bits del mismo modelo base no permite (rinde a 1-2 t/s en ese hardware). Empaqueta los pesos en formato GGUF para llama.cpp con un cabezal de decodificación especulativa MTP (multi-token prediction) incluido dentro del propio fichero, de modo que no se necesita un modelo borrador externo.

La propuesta técnica se apoya en cuatro piezas: cuantización ternaria PTQ1_0 con kernels CUDA propios, CUDA graphs, decodificación especulativa MTP con profundidad máxima 4 y una lista corta de 24.000 filas de vocabulario usada solo en el paso de borrador. Esta última reduce de 248.320 a 24.000 las filas leídas por paso de borrador (de ~265 MB a ~26 MB), mientras el modelo objetivo sigue verificando contra el vocabulario completo, por lo que la distribución de salida no cambia. El resultado declarado es de ~70 t/s en generación de código y más de 110 t/s en modo edición sobre una RTX 4060 Laptop de 8 GB.

El modelo está pensado para inferencia local de tareas de código y sesiones de agente con contexto largo (128K tokens, con arquitectura que soporta 262K). La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. Es relevante porque demuestra que la combinación de cuantización extrema más especulación autocontenida puede llevar un modelo de 27B a hardware de consumo sin renunciar a ventanas de contexto grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (clase Qwen3.8-27B), con cabezal MTP de decodificación especulativa incluido en el GGUF (`blk.64.nextn`) |
| Parametros totales | 27B (clase); el fichero safetensors asociado declara 460.730.096 parámetros, dato no coherente con la clase del modelo y probablemente correspondiente a un componente auxiliar |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens en este paquete; la arquitectura soporta 262K |
| Tipos de cuantizacion | Ternaria PTQ1_0 (backbone Bonsai 2.5); caché KV `q4_0` y `q3_0` (3 bits, 14 KB/token frente a 18 KB/token de q4_0) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tamaño de repo 6,9 GB, fichero principal de 5,80 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parámetros, y se reconstruye sobre el backbone ternario de PrismML Bonsai 2.5 mediante cuantización post-entrenamiento (PTQ1_0) con kernels CUDA específicos. El paquete incluye además un cabezal MTP de predicción multi-token con profundidad de especulación de hasta 4 tokens por paso, integrado en el propio fichero GGUF en lugar de añadirse como modelo borrador externo (como hacía la V1). El paso de borrador restringe la puntuación a una lista corta de 24.000 filas de vocabulario (frente a las 248.320 totales), una optimización propia del autor que reduce el tráfico de memoria del borrador en torno al 90 % sin alterar la verificación del modelo objetivo contra el vocabulario completo.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card sí indica que la versión V2 es una reconstrucción sobre Bonsai 2.5 orientada al comportamiento en tareas largas: lectura de resultados de herramientas, recuperación tras un paso fallido y finalización de la tarea en lugar de deriva. El rendimiento se apoya en CUDA graphs (~1,5×) y en la mencionada especulación MTP (1,5-1,8× sobre decodificación simple). La configuración se externaliza en un fichero `features.ini` leído en arranque mediante `--features-file`, que controla la lista corta de borrador, el reparto por niveles de la caché KV y el muestreo probabilístico del borrador.

## Capacidades

- Generación de código en Python, C, SQL, Go, TypeScript, Rust y JavaScript, con velocidades declaradas de ~70 t/s.
- Modo edición de código y documentos: revisión de ficheros existentes con rendimiento superior a 110 t/s.
- Razonamiento multi-paso y uso de herramientas: la V2 está ajustada para leer resultados de herramientas y recuperarse de pasos fallidos.
- Tool calling / function calling: media de 77,2 en cinco suites de evaluación (77,7 en FP16).
- Contexto largo: 128K tokens en este paquete, con 88K residentes íntegramente en VRAM usando caché KV `q3_0`.
- Decodificación especulativa autocontenida: el cabezal MTP va dentro del GGUF, sin necesidad de modelo borrador externo.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente de código en local sobre portátil con GPU de 8 GB: el modelo se ejecuta íntegramente en una RTX 4060 Laptop con 8 GB, lo que permite autocompletado y generación de funciones sin depender de APIs en la nube ni de GPUs de centro de datos.
- Edición y refactorización de ficheros existentes: el modo edición supera los 110 t/s porque el borrador ngram explota la repetición literal del documento; encaja en tareas de renombrado, actualización de firmas o migración de APIs sobre ficheros completos.
- Sesiones de agente de larga duración: con 128K de contexto y 88K residentes en VRAM mediante caché KV `q3_0`, permite mantener el estado de un repositorio o una conversación de agente extensa sin recargar contexto.
- Automatización de tareas de terminal y CI: los resultados declarados en Terminal-Bench 2.1 (60,1) y el soporte de tool calling lo hacen apto para agentes que ejecutan comandos, interpretan la salida y corrigen errores.
- Generación de consultas SQL y scripts de infraestructura: el soporte declarado de SQL y el rendimiento en código lo sitúan como opción para asistentes internos de bases de datos y automatización de operaciones.
- Prototipado y pruebas de pipelines de inferencia local: al incluir el motor fork de llama.cpp, el lanzador y el fichero de configuración, sirve como banco de pruebas reproducible para evaluar cuantización ternaria y decodificación especulativa en hardware de consumo.
- Despliegue en entornos con requisitos de soberanía del dato: al ser Apache 2.0 y ejecutarse en local, permite procesar código propietario sin enviarlo a servicios externos.

## Benchmarks y rendimiento

| Benchmark | V1 (Bonsai 2) | V2 (Bonsai 2.5) |
|---|---|---|
| SWE-bench Verified | 60,8 | 75,6 |
| Terminal-Bench 2.1 | 52,8 | 60,1 |
| DeepSWE | 0,0 | 27,0 |
| Tool calling (media de 5 suites) | no disponible | 77,2 (FP16: 77,7) |

Datos de velocidad declarados por el autor sobre RTX 4060 Laptop de 8 GB con `llama-server` del fork del proyecto:

| Carga de trabajo | Velocidad típica |
|---|---|
| Generación de código | ~70 t/s |
| Modo edición | 110+ t/s |
| Decodificación simple (referencia) | 1,5-1,8× inferior a MTP |

Comparación de cuantización: el mismo modelo base con cuantización oficial de 4 bits rinde aproximadamente 1-2 t/s en la misma clase de máquina, frente a los 5,80 GB y las velocidades anteriores del paquete ternario.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5,80 GB para los pesos; con caché KV `q3_0` (14 KB/token) caben 88K tokens de contexto íntegramente en VRAM en una GPU de 8 GB. Con `q4_0` (18 KB/token) el contexto residente es menor.
- GPU recomendadas: RTX 4060 Laptop de 8 GB es el hardware de referencia medido; cualquier GPU consumer con 8 GB o más de VRAM debería poder alojar los pesos, aunque no se aportan mediciones para otros modelos.
- Cabe en GPU consumer: sí, según la model card, en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp mediante el fork `llama.cpp-qwen38-flash` con `llama-server`; el paquete incluye un runtime precompilado para Windows con DLLs de CUDA (sin necesidad de instalar el CUDA Toolkit) y scripts de compilación para Linux (`llmserver_v2.sh`). El fichero `features.ini` es obligatorio y se pasa con `--features-file`; sin él el motor se comporta como el upstream y se pierden la lista corta de borrador, el reparto por niveles de KV y el muestreo probabilístico del borrador.
- Ajustes de reproducción: `--temp 0.6 --top-k 20 --top-p 0.95`, caché KV `q4_0` y reparto por niveles de KV (`kv-vram-cells`) para contexto largo. La línea `GGML_CUDA_FA_SHORTQ_MMA = 0` mantiene el kernel de atención con KV cuantizada en sitio para lotes cortos de verificación; el upstream #189 redirige esa forma a un kernel MMA f16 que, según el autor, repite un token y colapsa la aceptación del borrador.
- Latencia y throughput: ~70 t/s en generación de código y 110+ t/s en edición sobre RTX 4060 Laptop; no se aportan latencias absolutas ni mediciones en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Flash-MTP-V2 (ternario, GGUF) | 27B | 128K (arquitectura 262K) | SWE-bench Verified 75,6; Terminal-Bench 2.1 60,1; DeepSWE 27,0 | Apache 2.0 | Hugging Face + runtime fork de llama.cpp |
| Qwen3.8-27B (4 bits oficial) | 27B | no disponible | no disponible; ~1-2 t/s en hardware de 8 GB según el autor | Apache 2.0 (modelo base) | Hugging Face |
| Qwen3.8-27B-Flash-MTP-V1 (Bonsai 2) | 27B | no disponible | SWE-bench Verified 60,8; Terminal-Bench 2.1 52,8; DeepSWE 0,0 | Apache 2.0 | Hugging Face (versión anterior del mismo autor) |

No se dispone de datos de benchmarks de modelos de terceros de la misma categoría en la información proporcionada, por lo que la comparación se limita a las variantes del propio modelo base y su versión anterior.

## Limitaciones y advertencias

- El rendimiento de la especulación depende del contenido: la model card reconoce que la velocidad cae en prosa abierta, donde hay menos repetición literal que explotar por el borrador ngram; las cifras de 70 y 110+ t/s corresponden a código y edición, no a texto libre.
- Las cifras de velocidad y de benchmarks provienen del autor y no se han verificado de forma independiente; deben tratarse como un rango orientativo y no como una garantía.
- El paquete depende de un fork específico de llama.cpp y de un fichero `features.ini` obligatorio; usar binarios upstream o compilar sin ese fichero degrada el comportamiento y pierde las optimizaciones clave.
- La cuantización ternaria extrema (PTQ1_0) puede introducir pérdida de calidad frente al modelo en FP16; la model card solo aporta una comparación parcial (tool calling: 77,2 frente a 77,7 en FP16), sin datos de otras capacidades.
- Idiomas declarados limitados a inglés y chino; no se garantiza un rendimiento equivalente en castellano ni en otras lenguas.
- Riesgo de alucinación y de errores en código generado no cuantificado en la información disponible; requiere verificación humana y pruebas automatizadas antes de llevar código a producción.
- El dato de parámetros totales del fichero safetensors (460.730.096) no es coherente con la clase de 27B del modelo y debe tratarse con cautela.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el backbone ternario de PrismML pueden tener condiciones propias que conviene revisar antes de un despliegue en producción.
- La fecha de creación del repositorio (2026-11-25) y el escaso historial (0 descargas, 1 like) implican poca validación comunitaria; conviene probar el paquete en el hardware objetivo antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/SuperLogic/Qwen3.8-27B-Flash-MTP-V2-GGUF
- Repositorio del lanzador y configuración: https://github.com/zgsndzq/qwen38-27b-flash-mtp
- Releases con runtime precompilado para Windows: https://github.com/zgsndzq/llama.cpp-qwen38-flash/releases
- Código fuente del motor y scripts de compilación: https://github.com/zgsndzq/llama.cpp-qwen38-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Backbone ternario de referencia: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
