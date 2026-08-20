# xv0y5ncu/Gemma-4-E4B-it-GLQ-8bpw

## Resumen

Gemma-4-E4B-it-GLQ-8bpw es una cuantización de altísima fidelidad del modelo Gemma 4 E4B-it de Google, realizada con el esquema GLQ (Golay-Leech Quantization). El trabajo lo firma el usuario xv0y5ncu y reduce el tamaño de los pesos a 8.0 bits por peso (bpw) uniformes, lo que permite ejecutar el modelo en 7,98 GB en lugar de los aproximadamente 14,9 GB del original en bf16, es decir, un 46% menos de espacio. La calidad se mantiene prácticamente intacta: en GSM8K con razonamiento activado alcanza un 88% frente al 86% del modelo bf16 de referencia.

El modelo base, Gemma 4 E4B-it, es un modelo denso de 4,4 mil millones de parámetros con soporte multimodal y modo de razonamiento (thinking mode), diseñado por Google DeepMind para ejecutarse en GPUs de consumo. Esta variante cuantizada hereda todas sus capacidades y añade una capa de optimización de memoria, lo que la convierte en una opción atractiva para inferencia local, prototipado rápido y despliegues en entornos con recursos limitados. La licencia Apache 2.0 del trabajo de cuantización no modifica la licencia original del modelo base, que es la licencia Gemma de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E4B) |
| Parametros totales | 4.281.666.122 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | GLQ uniforme a 8.0 bpw (E8 lattice, RHT, LDLQ) |
| Idiomas soportados | ingles (modelo base: mas de 140 idiomas) |
| Licencia | Apache 2.0 (trabajo derivado); licencia Gemma para el modelo base |
| Formato de pesos | safetensors (cuantizacion GLQ) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B es un transformer denso con 4,4 mil millones de parámetros, entrenado por Google DeepMind con una ventana de contexto de hasta 256 000 tokens y soporte para mas de 140 idiomas. Incluye un modo de razonamiento (thinking mode) que genera una cadena de pensamiento antes de la respuesta final, y admite entrada multimodal (imagen y texto) en la version E4B. El entrenamiento original combina preentrenamiento a gran escala con ajuste fino instructivo y alineacion mediante tecnicas como RLHF, aunque los detalles exactos del dataset no se detallan en la informacion disponible.

La cuantizacion GLQ (Golay-Leech Quantization) es un esquema de compresion de pesos desarrollado en el repositorio glq de cnygaard. Utiliza un codebook de celosia E8 con 65 536 entradas en bloques de 8 dimensiones, aplica una Transformada de Hadamard Aleatorizada (RHT) para rotar las entradas y salidas de cada capa, y usa LDLQ (descomposicion LDL por bloques) como mecanismo de retroalimentacion durante la codificacion. Para capas con 3 bpw o mas, se aplica cuantizacion residual en N etapas, y la asignacion de precision mixta se realiza mediante una heuristica basada en la traza del hessiano de cada capa. El resultado es un modelo que mantiene el rendimiento del original bf16 dentro del margen de error estadistico en benchmarks como gsm8k.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones.
- Razonamiento matematico y resolucion de problemas multi-paso gracias al modo thinking (enable_thinking=True).
- Soporte de entrada multimodal (imagen) en el modelo base, aunque la cuantizacion GLQ no garantiza compatibilidad explicita con el procesador de vision en esta variante.
- Soporte de tool calling y function calling en el modelo base, pendiente de validacion en la version cuantizada.
- Multilingue en el modelo base (mas de 140 idiomas), aunque la model card de esta cuantizacion declara unicamente ingles.
- Compatibilidad con el ecosistema Hugging Face Transformers (>=5.13.1, <5.15) y vLLM 0.27.1.

## Casos de uso

- Asistencia local para programacion: el modelo puede generar y explicar codigo en entornos sin conexion, aprovechando su ventana de 256K tokens para mantener contexto de proyectos completos. Su cuantizacion de 8 bpw permite ejecutarlo en una GPU de 8 GB, adecuado para equipos de desarrollo personales.
- Razonamiento matematico en entornos educativos: con el modo de razonamiento activado y un presupuesto de 2048 tokens de salida, puede resolver problemas de aritmetica y algebra mostrando el proceso paso a paso, util para plataformas de tutoria automatica.
- Procesamiento de documentos largos: gracias a su contexto de 256K tokens, puede resumir contratos, articulos cientificos o manuales tecnicos completos sin truncar la entrada. La cuantizacion de 8 bpw reduce el coste de memoria y permite desplegarlo en servidores con una sola GPU.
- Generacion de contenido multilingue: aunque la variante cuantizada declara solo ingles, el modelo base soporta mas de 140 idiomas, por lo que puede usarse para traduccion y redaccion en entornos donde se mantenga la configuracion original del tokenizador.
- Desarrollo de agentes con tool calling: el modelo base incluye soporte de function calling, lo que permite integrarlo en pipelines de automatizacion (por ejemplo, consultas a APIs, generacion de informes) usando la cuantizacion GLQ para reducir el coste de despliegue.
- Investigacion en compresion de modelos: este modelo sirve como referencia para evaluar el impacto de la cuantizacion GLQ en la calidad de razonamiento, comparandolo con el bf16 original y otras cuantizaciones (4bpw, 6bpw) en benchmarks estandar.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la model card de esta cuantizacion, comparados con el modelo base en bf16:

| Benchmark | Gemma-4-E4B-it-GLQ-8bpw | Gemma-4-E4B-it (bf16) |
|---|---|---|
| gsm8k (limit=50, chat+thinking, strict-match) | 88% | 86% |

La variante cuantizada supera ligeramente al modelo bf16 en este benchmark, dentro del margen de error estadistico. No se han publicado resultados adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para los pesos (7,98 GB), mas overhead de activaciones y KV cache; se recomienda al menos 10 GB de VRAM para uso comodo.
- GPU recomendadas: RTX 4070/4080/4090, A100 40 GB, H100, o cualquier GPU con 10 GB o mas de VRAM y soporte CUDA 12.x.
- Es compatible con GPUs de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 4060 Ti 16 GB, RTX 3080 12 GB, RTX 4070 Super).
- Opciones de despliegue: Hugging Face Transformers con el paquete glq instalado, vLLM 0.27.1 (con la version de transformers pineada <5.15), y potencialmente llama.cpp si se exportan los pesos a GGUF (no incluido en esta version).
- Latencia y throughput: no se han publicado datos de latencia. El kernel CUDA personalizado se compila JIT en el primer uso (~30 segundos), lo que anade una latencia inicial de arranque.
- Requisitos de software: torch>=2.0, transformers>=5.14.1,<5.15, CUDA 12.x, y el paquete `glq`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | gsm8k | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-E4B-it (bf16) | 4,4 B | 256K | 86% | Gemma | bf16 |
| Gemma-4-E4B-it-GLQ-8bpw (este) | 4,4 B | 256K | 88% | Apache 2.0 (derivado) | GLQ safetensors |
| Gemma-4-E4B-it-GLQ-6bpw | 4,4 B | 256K | no disponible | Apache 2.0 (derivado) | GLQ safetensors |

La comparativa muestra que la cuantizacion GLQ mantiene (e incluso mejora ligeramente) la calidad del modelo bf16 en gsm8k, mientras reduce el espacio en disco un 46%. La variante de 6 bpw es una alternativa mas ligera, aunque no se dispone de benchmarks publicados para ella.

## Limitaciones y advertencias

- El modelo base Gemma 4 esta sujeto a la licencia Gemma de Google, que puede imponer restricciones de uso comercial segun los terminos de la licencia original (consulta https://ai.google.dev/gemma/terms). La cuantizacion en si es Apache 2.0, pero no exime de cumplir la licencia del modelo base.
- La variante GLQ-8bpw declara unicamente soporte de ingles en su model card, aunque el modelo base soporta mas de 140 idiomas; la cuantizacion podria degradar la calidad en idiomas menos representados.
- El modo de razonamiento requiere un presupuesto de generacion suficiente (recomendado 2048 tokens para esta variante); si se usa un `max_new_tokens` menor, la respuesta final puede truncarse o faltar.
- El paquete `glq` y el kernel CUDA JIT-compilado dependen de versiones especificas de transformers (<5.15) y CUDA 12.x; cambios en el entorno pueden romper la carga del modelo.
- La compatibilidad con vLLM esta verificada con la version 0.27.1 y transformers 5.14.1; versiones posteriores pueden fallar al cargar el modelo.
- No se han publicado pruebas de alucinacion ni evaluaciones de sesgos para esta variante cuantizada; se recomienda validar en el dominio de uso antes de produccion.
- La cuantizacion GLQ es un metodo relativamente reciente; la documentacion y el soporte de la comunidad son limitados comparados con otros formatos como GPTQ o AWQ.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-8bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Variante 6bpw: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-6bpw
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha del modelo Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
