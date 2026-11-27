# Xylolabs/Llama-3.1-8B-Instruct-MLX-8bit

## Resumen

Llama-3.1-8B-Instruct-MLX-8bit es una conversion cuantizada a 8 bits del modelo meta-llama/Llama-3.1-8B-Instruct, realizada por Xylolabs y publicada en formato MLX para su uso con la libreria `mlx-lm` en hardware Apple Silicon. No se trata de un modelo nuevo: es una distribucion optimizada del checkpoint oficial de Meta, pensada para ejecutar inferencia local en Macs con memoria unificada, manteniendo una fidelidad numerica muy alta respecto al original en BF16.

El modelo base es un transformer denso de 8.030.261.248 parametros con una ventana de contexto de 128K tokens, entrenado por Meta para instrucciones y conversacion multilingue. Esta version aplica cuantizacion afina de 8 bits (group size 64, escalas y sesgos en float16) a todas las capas lineales, al embedding de tokens y a la LM head, mientras que las capas de normalizacion se mantienen en float16. El resultado es un repositorio de 8,5 GB que conserva una divergencia KL de 0,000373 frente a BF16 en WikiText-2 y un 99,15% de acuerdo top-1.

Su relevancia es practica: permite desplegar un modelo de 8B con contexto largo en un unico equipo Apple Silicon sin GPU dedicada, con una perdida de calidad marginal y una integracion directa con `mlx_lm.generate` y `mlx_lm.chat`. Es una pieza util para desarrollo local, prototipado de agentes y evaluacion de pipelines antes de escalar a infraestructura con GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1), pesos convertidos a MLX |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (122K en configuracion de 32 GB) |
| Tipos de cuantizacion | 8 bits afina, group size 64, escalas y sesgos en float16; existe variante 4 bits del mismo autor |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (MLX), repositorio de 8,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), RoPE y normalizacion RMSNorm. El entrenamiento original de Meta combino preentrenamiento sobre un corpus multilingue de gran escala con un proceso de ajuste por instrucciones y preferencias (SFT y optimizacion de preferencias), orientado a conversacion, seguimiento de instrucciones y uso como base para agentes con tool calling. Los detalles exactos de volumen de tokens y composicion del dataset no se recogen en la informacion disponible de esta ficha.

La innovacion de esta publicacion concreta no esta en el entrenamiento sino en la conversion: Xylolabs aplica cuantizacion afina de 8 bits a todas las capas lineales, al embedding y a la LM head, manteniendo normas en float16, y valida la fidelidad frente al modelo BF16 con metricas de divergencia KL y acuerdo top-1 sobre WikiText-2, un conjunto de chat y un conjunto held-out. La variante de 4 bits del mismo autor se incluye como referencia comparativa en la model card, mostrando una degradacion notablemente mayor (KL de 0,055536 frente a 0,000373 en 8 bits).

## Capacidades

- Generacion de texto y conversacion multi-turno con seguimiento de instrucciones.
- Razonamiento y respuesta a preguntas en ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes).
- Generacion de codigo y asistencia en tareas de programacion.
- Razonamiento matematico basico y resolucion de problemas paso a paso.
- Soporte de tool calling y function calling, heredado del modelo Instruct original.
- Capacidad para flujos de agente y razonamiento multi-paso mediante prompting.
- Contexto largo de hasta 128K tokens para documentos extensos y conversaciones prolongadas.
- Ejecucion local en Apple Silicon mediante `mlx-lm`, sin dependencia de CUDA.

## Casos de uso

- Asistente de desarrollo local en Mac: usar `mlx_lm.chat` para conversaciones de programacion con contexto de repositorio, aprovechando los 128K tokens para incluir varios ficheros y mantener el historial completo sin recortes.
- Procesamiento de documentos largos en local: analisis y resumen de informes, contratos o articulos de decenas de miles de tokens en un unico prompt, adecuado por la ventana de contexto y por la fidelidad del 8 bits.
- Prototipado de agentes con tool calling: construir y depurar pipelines de agentes en un Mac antes de desplegarlos en servidores con GPU, ya que el modelo conserva las capacidades de function calling del Instruct original.
- Atencion al cliente multilingue en local: gestion de conversaciones en espanol, ingles, aleman, frances, italiano, portugues, hindi y tailandes sin enviar datos a la nube, util para escenarios con requisitos de privacidad.
- Generacion de codigo en entornos sin GPU: integracion en scripts y herramientas de linea de comandos en macOS para autocompletado, refactorizacion o generacion de tests, con latencia aceptable en memoria unificada.
- Evaluacion y benchmarking de pipelines: usar la variante 8 bits como referencia casi equivalente a BF16 (99,15% de acuerdo top-1 en WikiText-2) para validar calidad antes de invertir en infraestructura mayor.
- Educacion e investigacion: experimentacion con modelos de 8B y contexto largo en equipos de sobremesa Apple, sin necesidad de aprovisionar clusters.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. Si incluye metricas de fidelidad de la cuantizacion frente a BF16:

| Metrica | MLX 8-bit | MLX 4-bit |
|---|---|---|
| Tamano | 8,53 GB | 4,64 GB |
| WikiText-2 KL | 0,000373 | 0,055536 |
| WikiText-2 top-1 | 99,15% | 88,60% |
| Chat KL | 0,000300 | 0,049479 |
| Chat top-1 | 99,02% | 88,90% |
| Held-out KL | 0,000483 | 0,076341 |
| Held-out top-1 | 98,59% | 85,08% |
| Verificacion de 7 preguntas | 6/7 (BF16: 6/7) | 6/7 (BF16: 6/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en Apple Silicon mediante `mlx-lm`; no hay soporte CUDA en este repositorio.
- Memoria unificada necesaria: 36 GB para contexto de 122K y 48 GB o mas para contexto completo de 128K, segun la tabla del autor.
- Equipos validados en la model card: Mac Studio M5 Max (32 y 40 nucleos de GPU), Mac Studio M5 Ultra (hasta 80 nucleos de GPU) con 36, 48, 64, 96, 128, 256 y 512 GB de memoria unificada.
- El peso del modelo es de 8,53 GB, por lo que cabe en cualquier Mac con 16 GB o mas, aunque el contexto maximo depende de la memoria disponible.
- Despliegue: `mlx-lm` version 0.32.2, con los comandos `mlx_lm.generate` y `mlx_lm.chat`.
- No hay datos de latencia ni throughput publicados en la informacion disponible.
- Alternativa de menor huella: la variante MLX 4-bit del mismo autor (4,64 GB), a costa de una perdida de fidelidad considerable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-Instruct-MLX-8bit | 8,03B | 128K | MLX safetensors 8-bit | Llama 3.1 Community | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | safetensors BF16 | Llama 3.1 Community | Hugging Face |
| Xylolabs/Llama-3.1-8B-Instruct-MLX-4bit (mismo autor) | 8,03B | 128K | MLX safetensors 4-bit | Llama 3.1 Community | Hugging Face |

Frente al checkpoint original de Meta, esta version reduce el peso de aproximadamente 16 GB en BF16 a 8,53 GB con una divergencia KL de 0,000373 y un 99,15% de acuerdo top-1, a cambio de requerir `mlx-lm` y hardware Apple. Frente a la variante 4 bits del mismo autor, el 8 bits ofrece una fidelidad muy superior (KL de 0,000373 frente a 0,055536) al doble de tamano. No se dispone de comparaciones con otros modelos de 8B en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con `mlx-lm`; no es desplegable en GPU NVIDIA ni en entornos CUDA sin reconvertir los pesos.
- Hereda los sesgos y riesgos del Llama 3.1 8B Instruct original, incluidos sesgos sociales y culturales presentes en los datos de entrenamiento de Meta.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- El soporte de espanol existe, pero el modelo esta optimizado principalmente para ingles; la calidad en espanol puede ser inferior a la de modelos entrenados especificamente en castellano.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (incluido el requisito de atribucion "Built with Llama" y el cumplimiento de la Acceptable Use Policy); es necesario revisar `LICENSE` y `USE_POLICY.md` antes de un despliegue en produccion.
- La cuantizacion introduce una degradacion pequena pero no nula; para tareas sensibles a la precision numerica conviene validar contra el modelo BF16.
- El contexto maximo real depende de la memoria unificada disponible: en configuraciones de 36 GB se limita a 122K tokens.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente de las metricas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-MLX-8bit
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
