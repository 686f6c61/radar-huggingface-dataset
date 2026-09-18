# vwdubb/gemma4-31B-Fable-5-Distilled-FP8

## Resumen

vwdubb/gemma4-31B-Fable-5-Distilled-FP8 es una cuantizacion en FP8 del modelo autotrust/gemma4-31B-Fable-5-Distilled, un ajuste fino mediante LoRA de google/gemma-4-31B-it publicado por AutoTrust AI Lab y entrenado por Hai Yu. El modelo resultante conserva la naturaleza multimodal del original (pipeline image-text-to-text) y esta orientado a generacion de codigo, uso de herramientas y flujos agenticos, segun declara el autor en la model card.

El modelo parte de una arquitectura Gemma4ForConditionalGeneration, con un decodificador de texto y un codificador de vision, y un total de 31.273.088.876 parametros (31,27B). La innovacion principal que declara el autor es la aplicacion de adaptadores LoRA solo en la mitad superior del stack transformer (capas 30-59), dejando congeladas las capas 0-29 y el codificador visual, de modo que el ajuste en codigo no degrade las capacidades de vision.

La relevancia de esta publicacion concreta es doble: por un lado, es una variante cuantizada a FP8 (etiquetada con compressed-tensors) que reduce el peso en disco a 33,3 GB, facilitando el despliegue en GPUs de 40-48 GB; por otro, el modelo base declara una mejora de +15,9 puntos en HumanEval pass@1 (92,7% frente al 76,8% de google/gemma-4-31B-it) entrenando solo 61,2M de parametros (0,20% del total) sobre 308 pares de conversacion filtrados por calidad. Se trata de un modelo muy reciente y sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (decodificador de texto + codificador de vision) |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | FP8 en este repositorio (compressed-tensors); en el repositorio hermano GGUF se ofrecen F16 y Q8_0 con proyector multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (compressed-tensors, FP8); GGUF en la variante de autotrust |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal condicional de la familia Gemma 4, con decodificador de texto y codificador de vision integrados bajo la clase Gemma4ForConditionalGeneration. El modelo base google/gemma-4-31B-it fue ajustado mediante LoRA con rango r=16, alpha=32 y dropout=0,05, aplicando los adaptadores con una regex restringida a los modulos de atencion y MLP de las capas 30 a 59: `language_model.layers.{30..59}.(self_attn|mlp).(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)`. Las capas 0-29 y el codificador de vision (mmproj) permanecen congelados, lo que segun el autor preserva la fusion vision-lenguaje aprendida en el preentrenamiento y reduce los parametros entrenables de aproximadamente 122M a 61,2M.

El conjunto de entrenamiento procede del dataset Glint-Research/Fable-5-traces, con 23.325 registros brutos de interacciones de Fable 5, un asistente agentico de codigo. Tras el filtrado de calidad se retuvieron solo 308 pares de conversacion, cada uno con traza de pensamiento completa, llamadas a herramientas validas y resolucion exitosa. El preprocesado incluye filtrado a registros de tipo `message`, agrupacion de pares usuario-asistente por `parentId`, aplicacion de la plantilla de chat de Gemma 4 con estructura completa de pensamiento y llamadas a herramientas, enmascarado de perdida solo en la respuesta del asistente (prompt a -100) y descarte de muestras de mas de 2048 tokens. El autor afirma que en sus ablaciones este conjunto pequeno y de alta senal supero a datasets mas grandes y ruidosos (mas de 10.000 pares). No se documenta en la informacion disponible si hubo fases adicionales de RLHF o DPO; el propio autor enmarca el trabajo como post-entrenamiento sobre un modelo base fuerte.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat nativa de Gemma 4.
- Generacion de codigo, con una mejora declarada de +15,9 puntos en HumanEval pass@1 respecto al modelo base.
- Uso de herramientas (tool use / function calling), entrenado sobre conversaciones agenticas completas con llamadas validas.
- Razonamiento agentico multi-paso, con trazas de pensamiento incluidas en el dataset de entrenamiento.
- Modo de pensamiento (thinking mode) habilitado, en el formato multicanal nativo de Gemma 4.
- Capacidades multimodales de entrada imagen-texto: el pipeline declarado es image-text-to-text y la estrategia de congelacion busca preservar el rendimiento de vision.
- Soporte multilingue limitado al ingles, segun el campo de idiomas del repositorio.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`) y con el parser de razonamiento de vLLM (`--reasoning-parser gemma4`).

## Casos de uso

- Asistencia de programacion en produccion: el modelo puede integrarse en un IDE o en un bot de revision de pull requests para generar y completar funciones, apoyandose en su HumanEval pass@1 declarado del 92,7% y en la capacidad de invocar herramientas de compilacion o test.
- Automatizacion de pipelines de CI/CD: con soporte de tool calling, puede leer fallos de test, proponer parches y llamar a utilidades de linea de comandos dentro de un flujo agentico multi-paso.
- Agentes de codigo con acceso a repositorio: el entrenamiento sobre trazas agenticas completas de Fable 5 lo hace adecuado para bucles de exploracion de ficheros, busqueda de simbolos y edicion incremental.
- Analisis de documentacion tecnica con imagenes: al conservar el codificador visual, puede describir diagramas de arquitectura, capturas de paneles de monitorizacion o esquemas de base de datos junto a la pregunta textual.
- Soporte tecnico interno de segundo nivel: conversaciones de varios turnos donde el modelo consulta herramientas internas y despues explica la resolucion en lenguaje natural.
- Extraccion asistida de datos desde capturas o diagramas: combinando entrada de imagen y salida de texto estructurado para tareas de documentacion tecnica.
- Generacion de trazas de razonamiento explicables: el modo de pensamiento permite obtener cadenas de razonamiento intermedio antes de la respuesta final, utiles para depuracion y auditoria de agentes.

## Benchmarks y rendimiento

Datos declarados por el autor (metrica no verificada de forma independiente; el campo `verified` del model-index es `false`):

| Modelo | HumanEval pass@1 | Delta frente al base |
|---|---|---|
| gemma4-31B-Fable-5-Distilled (modelo base de esta cuantizacion) | 92,7% (152/164) | +15,9 puntos |
| google/gemma-4-31B-it | 76,8% | linea base |

Condiciones de evaluacion declaradas: HumanEval con 164 problemas de Python, vLLM 0.22, temperatura 0,1, thinking desactivado y generacion por lotes. El autor afirma haber reproducido el mismo 92,7% a traves de la API de servidor de vLLM con `--reasoning-parser gemma4` y temperatura 0,2. No se han publicado en la informacion disponible resultados para esta variante FP8 concreta, ni benchmarks de MMLU, GSM8K u otros; tampoco hay evaluaciones independientes de rendimiento en vision.

## Requisitos de hardware

- VRAM estimada para esta variante FP8: en torno a 31,3 GB solo para pesos (1 byte por parametro sobre 31,27B), mas overhead de activaciones y cache KV; se recomienda reservar 36-40 GB.
- VRAM estimada en bfloat16 (modelo base sin cuantizar): en torno a 62,5 GB de pesos.
- VRAM estimada para la variante GGUF Q8_0: en torno a 33 GB; para GGUF F16, en torno a 62 GB. Ambas incluyen proyector multimodal segun el autor.
- VRAM estimada para cuantizaciones de 4 bits (no publicadas en la informacion disponible, calculo aproximado por tamano de parametros): aproximadamente 17-19 GB.
- GPU recomendadas para FP8: A100 40 GB, L40S 48 GB, A6000 48 GB, H100 80 GB. Para bfloat16 o F16: H100 80 GB o configuraciones multi-GPU de 2x A100 40 GB.
- En GPU de consumo: la variante FP8 no cabe en 24 GB; requeriria offload a memoria del sistema. Una hipotetica cuantizacion de 4 bits si cabria en RTX 4090 o RTX 3090 de 24 GB.
- Opciones de despliegue: Transformers (libreria declarada), vLLM 0.22 con `--reasoning-parser gemma4` para la variante safetensors, y llama.cpp, Ollama, LM Studio o Jan para la variante GGUF. El soporte en TGI no se menciona en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | HumanEval pass@1 | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vwdubb/gemma4-31B-Fable-5-Distilled-FP8 | 31,27B | safetensors FP8 (compressed-tensors) | 92,7% (heredado del modelo base) | Si (codificador congelado) | Gemma | Repositorio con 0 descargas |
| autotrust/gemma4-31B-Fable-5-Distilled | 31,27B | safetensors bfloat16 | 92,7% | Si | Gemma | Repositorio del autor original |
| autotrust/gemma4-31B-Fable-5-Distilled-GGUF | 31,27B | GGUF F16 y Q8_0 con proyector multimodal | 92,7% | Si | Gemma | Repositorio del autor original |
| google/gemma-4-31B-it | no especificado en la informacion disponible | no disponible | 76,8% | Si | Gemma | Modelo oficial de Google |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de terceros con los que establecer una comparacion adicional.

## Limitaciones y advertencias

- La metrica de HumanEval no esta verificada de forma independiente: el propio model-index la marca con `verified: false` y procede del autor del modelo.
- El ajuste se realizo sobre solo 308 pares de conversacion, lo que implica riesgo de sobreajuste y de generalizacion limitada fuera del dominio de trazas agenticas de codigo de Fable 5. La mejora esta medida unicamente en HumanEval.
- Esta variante concreta es una cuantizacion FP8 y no se acompana de evaluacion propia: no hay datos publicados sobre la posible degradacion respecto al modelo en bfloat16.
- El modelo se declara unicamente en ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El entrenamiento uso secuencias de 2048 tokens y la longitud de contexto del modelo no se documenta, por lo que el comportamiento con contextos largos no esta verificado.
- La afirmacion de que la calidad de descripcion de imagenes se mantiene "bit a bit" respecto al base es una declaracion del autor sobre muestras retenidas, no una evaluacion publica de vision.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos, no mitigado de forma especifica en la informacion disponible.
- La licencia es la Gemma Terms of Use, que impone restricciones de uso (incluida la politica de uso prohibido de Google) y obligaciones de atribucion; debe revisarse antes de cualquier uso comercial.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia (18 de septiembre de 2026), por lo que no cuenta con validacion de la comunidad.
- El peso del repositorio es de 33,3 GB, lo que condiciona el almacenamiento y el tiempo de descarga en entornos de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/gemma4-31B-Fable-5-Distilled-FP8
- Modelo base (ajuste destilado): https://huggingface.co/autotrust/gemma4-31B-Fable-5-Distilled
- Variante GGUF (F16 y Q8_0 con proyector multimodal): https://huggingface.co/autotrust/gemma4-31B-Fable-5-Distilled-GGUF
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Dataset de trazas de Fable 5: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Organizacion AutoTrust AI Lab: https://huggingface.co/autotrust
- Perfil del entrenador (Hai Yu): https://huggingface.co/cloudyu
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
