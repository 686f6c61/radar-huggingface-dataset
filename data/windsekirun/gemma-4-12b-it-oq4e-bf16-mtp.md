# WindSekirun/gemma-4-12B-it-oQ4e-bf16-mtp

## Resumen

`WindSekirun/gemma-4-12B-it-oQ4e-bf16-mtp` es una cuantizacion de 4 bits del modelo instructivo Gemma 4 12B de Google, empaquetada en formato MLX safetensors para su ejecucion en hardware Apple Silicon. La publica el usuario WindSekirun mediante la herramienta oQ (oMLX v0.7.2), que aplica cuantizacion de precision mixta: la mayor parte de las capas se reducen a 4 bits con grupo de 64, mientras que el asistente MTP oficial de Google se conserva en BF16.

El modelo resuelve un problema muy concreto de despliegue: permitir ejecutar un modelo de 12.382.587.188 parametros en Macs con memoria unificada limitada, manteniendo la decodificacion especulativa que aporta el asistente MTP. El repositorio ocupa 8,0 GB, frente a los aproximadamente 24 GB que requeriria el modelo base en BF16, lo que lo hace viable en equipos de 16 GB de RAM unificada en adelante.

Es relevante para desarrolladores que trabajan en el ecosistema MLX y quieren aprovechar Gemma 4 12B de forma local sin renunciar al modo instructivo ni a la aceleracion por multi-token prediction. La licencia declarada es Apache 2.0, aunque conviene verificar las condiciones del modelo base de Google antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo `gemma4_unified`), con asistente MTP para decodificacion especulativa |
| Parametros totales | 12.382.587.188 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits de precision mixta (oQ4e), group size 64; asistente MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint oficial `google/gemma-4-12B-it`, un transformer denso de 12.382.587.188 parametros en su version original. No se ha reentrenado: la model card solo documenta el proceso de cuantizacion, no detalles de datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO. Esa informacion corresponde al modelo base de Google y no se incluye en el repositorio.

La innovacion tecnica del paquete es doble. Por un lado, la cuantizacion oQ4e aplica precision mixta con grupo de 64, reduciendo el peso del modelo a 8,0 GB. Por otro, integra el asistente oficial `google/gemma-4-12B-it-assistant` en BF16, lo que habilita multi-token prediction (MTP): el asistente propone varios tokens por paso y el modelo principal los valida, acelerando la decodificacion sin cambiar la distribucion de salida. Esta tecnica es funcionalmente equivalente a la decodificacion especulativa y es especialmente util en inferencia local, donde el ancho de banda de memoria es el cuello de botella.

## Capacidades

- Generacion de texto instructivo en el estilo del modelo Gemma 4 12B-it.
- Razonamiento multi-paso y respuesta a instrucciones conversacionales.
- Decodificacion especulativa mediante el asistente MTP integrado, que acelera la generacion token a token.
- Ejecucion nativa en MLX sobre Apple Silicon, con soporte para memoria unificada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Mac: un desarrollador puede cargar el modelo en MLX y probar prompts instructivos en un portatil con 16-24 GB de memoria unificada, sin depender de APIs externas ni de GPUs dedicadas.
- Asistentes de codigo en el editor: al ser un modelo instructivo de 12B, puede integrarse en extensiones tipo Continue o similares que hablen con servidores MLX locales para autocompletado y explicacion de fragmentos.
- Generacion de documentacion tecnica: el modelo puede redactar borradores de READMEs, docstrings y guias a partir de esquemas o codigo fuente, aprovechando el modo instructivo.
- Procesamiento por lotes en local: para tareas de clasificacion, resumen o extraccion sobre corpus pequenos y medianos, el formato MLX permite ejecutar el modelo en un Mac Studio sin infraestructura cloud.
- Evaluacion comparativa de cuantizaciones: investigadores que estudian el impacto de oQ4e frente a otras cuantizaciones (GGUF Q4_K_M, AWQ, etc.) pueden usar este checkpoint como referencia reproducible en MLX.
- Demos y prototipos de agentes: la decodificacion MTP reduce la latencia en bucles de agente con muchas llamadas cortas, lo que mejora la experiencia en asistentes interactivos locales.
- Educacion e investigacion: util para ensenar inferencia cuantizada y decodificacion especulativa en cursos practicos sobre Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 8,0 GB de pesos en disco; en ejecucion se recomienda al menos 12-16 GB de memoria unificada para dejar margen a KV cache y overhead de MLX.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no esta pensado para GPUs NVIDIA o AMD.
- Cabe en consumer hardware: si, en Macs con 16 GB de memoria unificada o superior; en 8 GB es probable que no quepa con contexto util.
- Opciones de despliegue: `mlx-lm` y `mlx` como librerias principales; servidores compatibles con MLX (por ejemplo, `mlx-lm.server`). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. La presencia del asistente MTP sugiere una mejora respecto a la decodificacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WindSekirun/gemma-4-12B-it-oQ4e-bf16-mtp | 12,38 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | HuggingFace, 32 descargas |
| google/gemma-4-12B-it | 12,38 B | no disponible | safetensors BF16 | no disponible en la informacion | HuggingFace (modelo base) |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | safetensors BF16 | no disponible en la informacion | HuggingFace (asistente MTP) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de calidad respecto al modelo base en BF16; el grado exacto de degradacion no esta documentado.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA, AMD ni a CPU x86 sin conversion.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad especificas de esta cuantizacion.
- La licencia Apache 2.0 se declara en el repositorio, pero al derivar de Gemma 4 conviene revisar los terminos de uso del modelo base de Google antes de explotacion comercial.
- El autor del repositorio no es Google; es una cuantizacion de terceros con 32 descargas y sin likes, por lo que la trazabilidad y el soporte son limitados.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o conversaciones de contexto largo.
- El asistente MTP en BF16 anade peso al repositorio; en equipos con memoria muy justa puede anular parte del ahorro de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WindSekirun/gemma-4-12B-it-oQ4e-bf16-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Asistente MTP oficial: https://huggingface.co/google/gemma-4-12B-it-assistant
