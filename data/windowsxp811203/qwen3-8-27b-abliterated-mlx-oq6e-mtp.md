# windowsxp811203/Qwen3.8-27B-Abliterated-MLX-oQ6e-mtp

## Resumen

Qwen3.8-27B-Abliterated-MLX-oQ6e-mtp es una cuantizacion en 6 bits para Apple Silicon del modelo Qwen3.8-27B-Abliterated, una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edicion de pesos) de un modelo de la familia Qwen 3.5. El autor de la publicacion es el usuario de HuggingFace windowsxp811203, que actua como empaquetador y distribuidor de la version cuantizada, no como desarrollador del modelo original. El resultado es un checkpoint multimodal de tipo image-text-to-text, orientado a conversacion y a inferencia local en Macs con chip de la serie M.

El modelo resuelve el problema de ejecutar un modelo de ~27.800 millones de parametros en hardware de consumo Apple sin renunciar a la cuantizacion de 6 bits ni a la decodificacion especulativa nativa (MTP, multi-token prediction). Emplea el formato MLX con pesos safetensors, cuantizacion oQ6e con calibracion por imatrix y soporte de vision, lo que lo hace relevante para quienes quieren un modelo grande, conversacional y sin filtros de rechazo agresivos, corriendo en local sobre Apple Silicon.

La relevancia actual es doble: por un lado, la familia Qwen 3.5 aporta contexto largo y capacidades multimodales; por otro, el ecosistema MLX permite aprovechar el ancho de banda de memoria unificado de los chips M para servir modelos de decenas de miles de millones de parametros con latencia aceptable. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen 3.5 (tag `qwen3_5`), con cabecera de vision para image-text-to-text y decodificacion especulativa MTP |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun los tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (oQ6e, cuantizacion optimizada MLX con calibracion imatrix); no se detallan otras variantes en el repo |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `omlx`), con metadatos de cuantizacion `oq` / `oQ6e` |
| Tamano del repositorio | 23,7 GB |
| Pipeline | image-text-to-text |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Autor de la cuantizacion | windowsxp811203 |
| Modelo base | windowsxp811203/Qwen3.8-27B-Abliterated |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen 3.5, con atencion por token y una torre de vision que permite entrada de imagenes junto con texto, tal como indica el pipeline image-text-to-text. El checkpoint incorpora decodificacion especulativa nativa mediante MTP (multi-token prediction), lo que permite proponer varios tokens por paso y validarlos en paralelo, reduciendo la latencia de generacion en hardware con ancho de banda limitado como el de Apple Silicon.

Sobre el entrenamiento original no hay informacion en la ficha del repositorio: no se especifican el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. La variante "Abliterated" implica una intervencion post-entrenamiento sobre los pesos para eliminar direcciones de activacion asociadas al rechazo, un procedimiento de edicion de representaciones que no requiere reentrenamiento completo. La cuantizacion oQ6e se ha calibrado con una matriz de importancia (imatrix), lo que suele mejorar la fidelidad de los pesos cuantizados respecto a una cuantizacion uniforme, especialmente en capas sensibles.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y respuesta a preguntas sobre contenido textual e imagenes (image-text-to-text).
- Comprension de imagenes: descripcion, extraccion de informacion y respuesta a preguntas visuales.
- Decodificacion especulativa MTP para acelerar la generacion en MLX.
- Comportamiento "uncensored": la ablation reduce los rechazos ante peticiones que el modelo original declinaria.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso estructurado en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino segun los tags del repositorio.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener dialogos multi-turno en ingles o chino sobre Apple Silicon con MLX, aprovechando la memoria unificada del chip para mantener el checkpoint de 6 bits en memoria sin swap agresivo.
- Analisis de documentos con imagenes: al ser image-text-to-text, permite extraer informacion de capturas, diagramas o formularios escaneados y responder preguntas sobre ellos en un flujo local sin enviar datos a la nube.
- Prototipado de investigacion sobre alineacion: la variante abliterated sirve para estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo en tareas de seguridad y evaluacion de sesgos.
- Generacion de contenido creativo sin restricciones: util para escritura de ficcion, guiones o narrativa que requiera tono adulto o temas sensibles, donde un modelo alineado rechazaria la peticion.
- Evaluacion comparativa de cuantizaciones: el formato oQ6e con imatrix permite medir la perdida de calidad frente al modelo base en tareas de razonamiento y vision, como referencia para pipelines de cuantizacion.
- Despliegue offline en entornos con requisitos de privacidad: al ejecutarse localmente con MLX, el modelo es adecuado para procesar datos sensibles en portatiles o estaciones Mac sin conexion externa.
- Traduccion y asistencia bilingue ingles-chino: el soporte declarado de ambos idiomas permite usarlo como asistente de traduccion o redaccion en pares en-zh.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,7 GB en 6 bits; en inferencia se necesita espacio adicional para el KV cache, la torre de vision y los buffers de MLX, por lo que conviene disponer de al menos 32 GB de memoria unificada.
- Memoria unificada recomendada: 32 GB como minimo para contexto corto; 48-64 GB o mas para contextos largos y uso multimodal concurrente.
- GPU recomendadas: chips Apple M1 Pro/Max con 32 GB o mas, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra y M4 Pro/Max. No es compatible con CUDA ni con GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 32 GB o superior; no cabe en equipos con 16 GB si se quiere contexto util.
- Opciones de despliegue: MLX (`mlx-lm`, `mlx-vlm` para la parte multimodal), `mlx_lm.server` para exponer una API compatible con OpenAI, y herramientas del ecosistema omlx. No es compatible con vLLM, llama.cpp, Ollama ni TGI por el formato de pesos.
- Latencia y throughput: no disponibles; dependen del chip y de la longitud de contexto. La decodificacion especulativa MTP deberia reducir la latencia por token respecto a una generacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-MLX-oQ6e-mtp | ~27,8 B | no disponible | MLX 6 bits, Apple Silicon | Apache 2.0 | Restringido (gated) |
| Qwen3.8-27B-Abliterated (base) | ~27,8 B | no disponible | safetensors sin cuantizar, GPU CUDA/MLX | Apache 2.0 | no disponible |
| Cuantizaciones GGUF del mismo modelo base | ~27,8 B | no disponible | GGUF, llama.cpp / Ollama | Apache 2.0 | no disponible |
| Modelos Qwen 3.5 densos de tamano comparable | no disponible | no disponible | safetensors, MLX, GGUF | Apache 2.0 | publico |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a formato, hardware y licencia.

## Limitaciones y advertencias

- La ablation de rechazo puede degradar la calidad del modelo en tareas que requieren matices de seguridad y aumenta el riesgo de generar contenido danino o inexacto sin advertencia.
- Riesgo de alucinacion inherente a los modelos de ~28 B; no hay evaluaciones publicadas que cuantifiquen la tasa de error en este checkpoint.
- Idiomas limitados a ingles y chino: el rendimiento en castellano no esta garantizado ni documentado.
- El acceso es restringido: es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede limitar la reproducibilidad en entornos automatizados.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base y el proceso de ablation pueden introducir obligaciones adicionales no detalladas; conviene revisar las condiciones del modelo base antes de un uso comercial.
- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni CPU generica.
- No se documentan limites de contexto, por lo que el comportamiento mas alla de la ventana nativa del modelo base no esta verificado.
- La cuantizacion en 6 bits introduce perdida de fidelidad respecto al modelo sin cuantizar; el impacto exacto en razonamiento y vision no se ha publicado.
- El repositorio tiene pocas descargas y "me gusta" (505 y 2 en el momento de la consulta), lo que sugiere poca validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-MLX-oQ6e-mtp
- Modelo base: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Perfil del autor: https://huggingface.co/windowsxp811203
- Documentacion de MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
