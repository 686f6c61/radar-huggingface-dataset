# trymirai/Qwen3.5-4B-L

## Resumen

Mirai Qwen3.5-4B Large es una cuantización de 8 bits del modelo Qwen3.5-4B de Alibaba, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. El checkpoint conserva los 4.338.875.392 parámetros del modelo original y está empaquetado en formato nativo de la librería `uzu`, orientada exclusivamente a inferencia eficiente en Apple silicon (procesadores M-series). No se trata de un modelo nuevo ni de un fine-tune: es una compresión post-entrenamiento pensada para ejecución local en macOS.

La propuesta de valor es el eje calidad-tamaño-velocidad en hardware de consumo de Apple. Frente a alternativas de cuantización genéricas (GGUF Q4/Q8, AWQ, GPTQ), Mirai aplica transformadas de Hadamard aleatorias con estructura de bloque diagonal para reducir los valores atípicos (outliers) tanto en activaciones como en pesos, lo que permite mantener una divergencia KL baja frente al modelo de referencia a pesar de usar enteros de 8 bits.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, pero la model card de esta cuantización no detalla arquitectura, longitud de contexto ni idiomas soportados; remite a la ficha del modelo original. La relevancia actual reside en que demuestra que la cuantización de 8 bits con transformadas Hadamard puede ser competitiva para despliegue local en portátiles y equipos de sobremesa con chip Apple, un nicho tradicionalmente mal cubierto por los stacks de inferencia orientados a CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.5-4B; no detallada en la model card) |
| Parametros totales | 4.338.875.392 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit entero simetrico, escalas bfloat16, tamano de grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento (PTQ) del modelo Qwen3.5-4B. El metodo descrito en la model card emplea cuantizacion entera simetrica de 8 bits con escalas en bfloat16 y tamano de grupo de 32 elementos. Para mitigar el impacto de los valores atipicos, se aplican transformadas de Hadamard aleatorias (Random Hadamard Transforms) con estructura de bloque diagonal y tamano de bloque 32, una tecnica de rotacion ortogonal que redistribuye la energia de las activaciones y los pesos antes de cuantizar, reduciendo el error de redondeo en las colas de la distribucion.

No se especifican en la informacion disponible los datos de entrenamiento ni el proceso de alineacion del modelo base (RLHF, DPO, etc.). La evaluacion de la cuantizacion se realizo sobre una mezcla de datos compuesta por un 45 % de datos publicos de tipo agente (agentic), un 30 % de datos publicos de SFT y contexto largo, y un 25 % de datos privados de chat. La model card incluye un grafico de divergencia KL frente al tamano del checkpoint, pero no se aportan cifras numericas en el texto. El checkpoint no incorpora innovaciones de decodificacion especulativa ni atencion lineal propias; esas caracteristicas, si existen, dependen del modelo base.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y conversacion multi-turno, heredados del modelo base Qwen3.5-4B.
- Capacidades agenticas: la mezcla de evaluacion incluye un 45 % de datos publicos de tipo agente, lo que sugiere soporte para flujos de tool calling y razonamiento multi-paso en el modelo base.
- Contexto largo: la mezcla de evaluacion incluye un 30 % de datos de SFT y contexto largo, indicativo de que el modelo base maneja ventanas extendidas (longitud exacta no disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Inferencia local en Apple silicon mediante la CLI `mirai` o la libreria `uzu`.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: el modelo puede ejecutarse sobre Apple silicon sin GPU dedicada, lo que permite autocompletado y explicacion de codigo en un portatil M-series sin enviar codigo propietario a la nube.
- Prototipado de agentes con tool calling en estaciones de trabajo macOS: la mezcla de evaluacion orientada a datos agenticos sugiere que el modelo conserva la capacidad de invocar funciones y encadenar pasos, util para validar disenos de agentes antes de desplegar en produccion.
- Chat de soporte interno con contexto largo: la inclusion de datos de contexto largo en la evaluacion indica que el modelo puede gestionar conversaciones o documentos extensos en entornos corporativos con requisitos de privacidad (todo el procesamiento ocurre en el dispositivo).
- Investigacion en cuantizacion: sirve como referencia reproducible para estudiar el efecto de las transformadas de Hadamard con bloque 32 en la divergencia KL frente al modelo de 4B en bfloat16.
- Aplicaciones de escritorio offline en macOS: integrable mediante la CLI `mirai`, permite embeber generacion de texto en herramientas nativas de Apple sin dependencia de red.
- Evaluacion comparativa de stacks de inferencia: util para medir throughput y latencia de `uzu` frente a llama.cpp o MLX en el mismo hardware Apple, dado que el checkpoint esta optimizado para ese ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye un grafico de divergencia KL frente al tamano del checkpoint, pero sin cifras en el texto. No se detallan resultados de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM/ memoria unificada: el repositorio ocupa 13,9 GB, aunque el checkpoint en 8 bits con grupo 32 implica un peso efectivo cercano a 1 byte por parametro mas escalas (aproximadamente 4,3-5 GB de pesos). La memoria unificada necesaria para inferencia no se especifica en la informacion disponible.
- GPU compatibles: exclusivamente Apple silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No hay soporte declarado para CUDA ni ROCm.
- GPU de consumo: si, en chips Apple M-series con memoria unificada suficiente; el fabricante no publica el minimo exacto.
- Opciones de despliegue: CLI `mirai` (via Homebrew) y libreria `uzu` (compilacion desde fuente documentada en el repositorio de GitHub). No compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-4B-L | 4.338.875.392 | 8-bit (grupo 32, escalas bf16) | no disponible | Apache 2.0 | Apple silicon (`uzu`) |
| Qwen/Qwen3.5-4B (original) | ~4B | bf16/fp16 | no disponible | Apache 2.0 | Multiples (transformers, vLLM, etc.) |
| Cuantizaciones GGUF Q8 de modelos ~4B | ~4B | 8-bit (llama.cpp) | depende del modelo | depende del modelo | CPU/GPU via llama.cpp |

La comparacion con alternativas de cuantizacion generica (GGUF Q8, AWQ, GPTQ) no puede establecerse con cifras porque la model card no publica resultados numericos de divergencia KL ni de perplejidad. La ventaja declarada es la combinacion de transformadas de Hadamard por bloques con un runtime especifico para Apple silicon, pero no hay datos publicos que cuantifiquen esa ventaja frente a otras soluciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.5-4B.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 4B; la cuantizacion de 8 bits puede incrementar ligeramente la degradacion en tareas de razonamiento largo frente al checkpoint en bf16.
- Limitaciones de contexto e idioma: no especificadas en la model card de esta cuantizacion; deben consultarse en la ficha del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B, a la que la model card enlaza explicitamente.
- Compatibilidad: solo Apple silicon via `uzu`/`mirai`; no es desplegable en stacks CUDA estandar (vLLM, TGI, llama.cpp), lo que limita su uso en servidores Linux con GPU.
- Madurez: el modelo tiene 179 descargas y 1 like en el momento de la consulta, lo que indica adopcion muy limitada y poca validacion independiente.
- Fecha de creacion (junio de 2026) y actualizacion (noviembre de 2026): verificar que el runtime `uzu` sigue mantenido antes de adoptarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trymirai/Qwen3.5-4B-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog tecnico de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-4b-mirai-mirai-l-8
- Repositorio `uzu` (guia de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
