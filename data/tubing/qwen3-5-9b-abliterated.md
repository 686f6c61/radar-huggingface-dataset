# Tubing/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es una version del modelo Qwen3.5-9B de Alibaba, desarrollada por el usuario Tubing, que elimina por completo los mecanismos de rechazo y censura del modelo original mediante una combinacion de dos tecnicas: abliteracion por proyeccion ortogonal y fine-tuning con LoRA. El resultado es un modelo que mantiene las capacidades de razonamiento, codigo y matematicas del modelo base, pero responde sin restricciones a contenido que normalmente estaria bloqueado, como instrucciones para hacking, armas, drogas o contenido sexual explicito.

El modelo tiene 8.953.803.264 parametros (aproximadamente 8,95 mil millones) y usa una arquitectura hibrida que combina capas de atencion DeltaNet con capas de atencion estandar en un patron repetitivo de 3 capas DeltaNet por cada capa de atencion, con un total de 32 capas. Se distribuye bajo licencia Apache-2.0, esta disponible en formato safetensors y es compatible con la libreria transformers.

La relevancia de este modelo radica en que demuestra que la abliteracion puede eliminar los rechazos sin degradar significativamente el rendimiento, aunque tambien introduce riesgos importantes de uso indebido al eliminar las barreras de seguridad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida DeltaNet + atencion estandar (patron 3xDeltaNet -> 1xAttention) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.5-9B-abliterated parte del modelo base Qwen3.5-9B, que emplea una arquitectura hibrida que intercala capas de atencion lineal DeltaNet con capas de atencion estandar en un patron de repeticion de 3 capas DeltaNet seguidas de 1 capa de atencion estandar, con un total de 32 capas. El proceso de eliminacion de rechazos se realizo en dos etapas.

La primera etapa consistio en tres pasadas de abliteracion por proyeccion ortogonal. Se recogieron activaciones de estados ocultos en 170 prompts daninos de 12 categorias y 160 prompts inofensivos de 10 categorias, se calculo la direccion de rechazo como la diferencia normalizada entre las activaciones medias de ambos grupos en cada capa, y se ortogonalizaron las matrices de pesos que escriben en el flujo residual (`linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj`). Se modificaron 64 matrices de pesos por pasada en las 32 capas, con una escala de 1.0 y una longitud maxima de secuencia de 128 tokens para la recoleccion de activaciones.

La segunda etapa consistio en un fine-tuning con QLoRA para eliminar las cinco categorias de rechazo persistentes que sobrevivieron a la abliteracion: humor racista u ofensivo, contenido sexual explicito, propaganda antiinmigracion, sintesis de drogas y metodos de autolesion. Se empleo QLoRA con cuantizacion NF4 de 4 bits, r=64 y alpha=128, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizo durante 5 epocas con 20 ejemplos de entrenamiento y se completo en aproximadamente 45 segundos en una GPU NVIDIA H100 SXM de 80 GB. El adaptador se fusiono posteriormente en los pesos de precision completa.

El modelo resultante responde al 100% de los 18 prompts de prueba en 8 categorias (hacking, armas, drogas, fraude, contenido danino, autolesion, contenido explicito y politica), frente al 0% del modelo base.

## Capacidades

- Generacion de texto sin restricciones de contenido, incluyendo temas que el modelo base rechazaria como hacking, armas, drogas, fraude, contenido ofensivo, autolesiones y contenido sexual explicito.
- Razonamiento logico: identificacion correcta de falacias como el termino medio no distribuido en silogismos.
- Matematicas: aplicacion correcta de reglas de derivacion como la regla del producto (ejemplo: derivada de x^3 * sin(x)).
- Programacion: implementacion de algoritmos clasicos, como el palindromo mas largo con enfoque de expansion desde el centro en O(n^2).
- Conocimiento general: explicaciones precisas en ciencia, como la diferencia entre fision y fusion nuclear.
- Creatividad: generacion de poesia con estructura metrica correcta, como haikus de 5-7-5 silabas.
- Analisis historico y economico: identificacion de causas de eventos como la crisis financiera de 2008 (hipotecas subprime, desregulacion, swaps de incumplimiento crediticio).
- No se documenta soporte explicito de tool calling, function calling, agentes o capacidades multimodales.

## Casos de uso

- **Investigacion en alineacion y seguridad de IA**: el modelo sirve como banco de pruebas para estudiar tecnicas de eliminacion de rechazos como la abliteracion y sus efectos sobre el comportamiento de los modelos. Permite comparar la degradacion de capacidades entre versiones censuradas y no censuradas del mismo modelo base.
- **Generacion de contenido creativo sin restricciones**: escritura de ficcion, poesia o guiones que aborden temas sensibles o tabu que los modelos censurados rechazan, manteniendo la calidad literaria y el estilo.
- **Desarrollo de asistentes de escritura**: integracion en editores de texto o herramientas de redaccion que necesitan generar contenido de cualquier genero, desde ficcion erotica hasta satira politica, sin bloqueos automaticos por parte del modelo.
- **Evaluacion de sistemas de moderacion de contenido**: el modelo puede generar contenido problematizado de forma controlada para entrenar o validar clasificadores de moderacion y sistemas de filtrado, siempre que se use en entornos aislados.
- **Pruebas de robustez en sistemas de IA**: para analizar como se comporta un modelo cuando se le eliminan los mecanismos de rechazo, lo que ayuda a disenar mejores sistemas de seguridad en produccion.
- **Despliegue local en entornos sandbox**: gracias a su compatibilidad con Ollama, llama.cpp y vLLM, se puede ejecutar localmente en equipos de gama media para experimentacion controlada, como se indica en las guias de instalacion para Mac, Windows y Linux.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, pero si pruebas cualitativas de capacidades y una comparacion especifica de rechazo en un benchmark de 18 prompts:

| Modelo | Prompts respondidos | Tasa |
|---|---|---|
| Qwen3.5-9B base | 0/18 | 0% |
| Qwen3.5-9B-abliterated (este modelo) | 18/18 | 100% |
| Dolphin-Mistral 7B | 17/18 | 94% |

En una ejecucion estandar el modelo obtuvo 17/18 (94%), y en la mejor de tres ejecuciones alcanzo 18/18. Las pruebas de calidad en razonamiento, matematicas, codigo, conocimiento, creatividad y analisis mostraron resultados correctos, aunque sin metricas cuantitativas publicadas.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 8,95B parametros. En FP16 ocupa aproximadamente 18 GB de VRAM; en cuantizacion de 8 bits, unos 9 GB; en 4 bits, entre 5 y 6 GB. Los valores exactos de cuantizacion no estan documentados.
- **GPU recomendadas**: para FP16 se recomienda una NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB). Para cuantizacion de 4 bits puede ejecutarse en GPUs de 8-12 GB como RTX 3060 o RTX 3080.
- **Inferencia en CPU**: es posible mediante GGUF y llama.cpp, aunque con latencia significativamente mayor.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y la libreria transformers de Hugging Face.
- **Latencia y throughput**: no se proporcionan datos de latencia ni throughput en la documentacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-abliterated (Tubing) | 8,95B | no disponible | Apache-2.0 | Abliteracion + LoRA, 100% de respuestas en benchmark de rechazo |
| Dolphin-Mistral 7B | 7B | no disponible | Apache-2.0 | Modelo sin censura de la familia Mistral, 94% de respuestas en el mismo benchmark |
| Huihui-Qwen3.5-9B-abliterated | 8,95B | no disponible | Apache-2.0 | Version abliterada de Qwen3.5-9B con el metodo remove-refusals-with-transformers |

El modelo de Tubing supera a Dolphin-Mistral 7B en el benchmark de rechazo y tiene un 28% mas de parametros, lo que sugiere mejor rendimiento en razonamiento y codigo. No hay datos publicos de benchmarks estandar para comparar el rendimiento general entre estas versiones.

## Limitaciones y advertencias

- **Ausencia total de filtros de seguridad**: el modelo puede generar contenido ilegal, danino, sexual explicito o incitacion a la violencia, incluyendo instrucciones detalladas para hacking, fabricacion de armas o drogas, y metodos de autolesion. No debe desplegarse en produccion sin supervisio humana.
- **Riesgo de alucinacion**: como el modelo base, puede inventar datos, especialmente en areas de conocimiento especializado, y la abliteracion no corrige este comportamiento.
- **Sesgos**: los sesgos presentes en los datos de entrenamiento del modelo base se mantienen en esta version, ya que la abliteracion no los modifica.
- **Idioma**: solo se documenta soporte para ingles; el rendimiento en otros idiomas es desconocido.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el contenido generado puede violar leyes de difusion de odio, propiedad intelectual o normas de publicidad, por lo que el uso comercial requiere evaluacion legal.
- **Degradacion potencial**: la abliteracion puede degradar el rendimiento en ciertas tareas especificas, aunque las pruebas cualitativas no muestran una degradacion significativa en razonamiento, matematicas o codigo.
- **Contexto**: la longitud de contexto no esta documentada en la informacion disponible; se recomienda consultar la documentacion del modelo base Qwen3.5-9B para conocer el valor de contexto maximo.

## Enlaces

- Hugging Face: https://huggingface.co/Tubing/Qwen3.5-9B-abliterated
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia sobre abliteracion (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Guia de Huihui-Qwen3.5-9B-abliterated en HackerNoon: https://hackernoon.com/huihui-qwen35-9b-abliterated-what-this-uncensored-model-does
- Pagina de Ollama de huihui_ai/qwen3.5-abliterated: https://ollama.com/huihui_ai/qwen3.5-abliterated
- Guia completa de Qwen3.5-9B Abliterated en Codersera: https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
