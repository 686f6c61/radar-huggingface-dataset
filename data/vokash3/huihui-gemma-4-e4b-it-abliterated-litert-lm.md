# vokash3/Huihui-gemma-4-E4B-it-abliterated-LiteRT-LM

## Resumen

Este repositorio contiene una conversión a formato **LiteRT-LM** del modelo `huihui-ai/Huihui-gemma-4-E4B-it-abliterated`, una variante "abliterada" del modelo instructivo `google/gemma-4-E4B-it` de Google. La abliteración es una técnica que elimina o reduce drásticamente el comportamiento de rechazo y los filtros de seguridad del modelo original, lo que lo hace adecuado para casos de uso donde se requiere una generación de texto sin restricciones temáticas. El modelo base es un transformer de arquitectura MoE (mezcla de expertos) con 4 mil millones de parámetros totales y una ventana de contexto de 128k tokens.

La relevancia de esta conversión radica en su formato: un único archivo `.litertlm` de aproximadamente 7,7 GB listo para ejecutarse con el runtime de Google LiteRT-LM, diseñado para inferencia en dispositivos periféricos y de escritorio. Es importante señalar que este repositorio no contiene un nuevo fine-tuning, sino una conversión de formato de los pesos originales en BF16 Safetensors. La compatibilidad con Google AI Edge Gallery en Android está limitada actualmente, ya que la exportación es de solo texto y no incluye las secciones de audio que espera la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 4 mil millones (E4B) |
| Parametros activos | no disponible (modelo MoE, el valor exacto no se publica en la informacion disponible) |
| Longitud de contexto | 128k tokens (segun especificaciones de la familia Gemma 4) |
| Tipos de cuantizacion | BF16 (formato original de pesos); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible (la model card no especifica el listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM `.litertlm` (convertido desde Safetensors BF16) |

## Arquitectura y entrenamiento

El modelo original `google/gemma-4-E4B-it` es un transformer de arquitectura MoE con 4 mil millones de parámetros totales, diseñado para ofrecer rendimiento de alto nivel en tareas de razonamiento, codificacion y comprension multimodal. La variante abliterada de `huihui-ai` aplica una tecnica de abliteracion de norm-preserving biprojected y Expert-Granular Abliteration (EGA) para modelos MoE, que elimina las direcciones de activacion asociadas al rechazo de solicitudes. Esta tecnica reduce la tasa de rechazo del modelo en prompts de seguridad y jailbreak, manteniendo en gran medida las capacidades generales.

El entrenamiento de la variante abliterada se realizo sobre el modelo instructivo base, sin un entrenamiento adicional con RLHF o DPO. La conversion a LiteRT-LM se realizo con el exportador `litert-torch export_hf`, que transforma los pesos Safetensors BF16 en un bundle optimizado para el runtime LiteRT-LM. El bundle incluye componentes como el tokenizador comprimido, el embedder y los ejecutores de prefill y decode, pero no incluye las secciones de audio del modelo original (encoder, adapter y end-of-audio), lo que limita su uso a tareas de texto.

## Capacidades

- Generacion de texto y chat conversacional con plantilla de chat compatible con Gemma 4.
- Razonamiento y comprension de contexto largo gracias a la ventana de 128k tokens.
- Capacidades de codificacion y agentes: el modelo base es adecuado para workflows de agentes y generacion de codigo, aunque esta conversion no incluye soporte explicito de tool calling.
- Comprension multimodal: el modelo original Gemma 4 E4B es multimodal, pero esta conversion es text-only y no incluye los ejecutores de audio ni vision.
- Comportamiento "uncensored": la abliteracion reduce significativamente el rechazo de solicitudes, lo que permite generar contenido que el modelo original bloquearia.
- Capacidades multilingues: no especificadas en la informacion disponible, pero la familia Gemma 4 suele soportar multiples idiomas.
- Soporte de decodificacion especulativa: no disponible en esta conversion.

## Casos de uso

- Generacion creativa sin restricciones: el modelo puede usarse para escribir ficcion, poesia, guiones o contenido creativo que el modelo original rechazaria por temas de seguridad. Su naturaleza abliterada permite explorar temas controvertidos sin filtros.
- Desarrollo de agentes de escritura asistida: con su ventana de 128k tokens, puede procesar documentos largos y mantener conversaciones multi-turno para asistir en la redaccion de informes, articulos o resumenes extensos.
- Prototipado rapido de chatbots de texto: gracias al formato LiteRT-LM, el modelo puede desplegarse en dispositivos perifericos o en entornos con recursos limitados, lo que lo hace util para prototipos de chatbots locales sin depender de la nube.
- Evaluacion de tecnicas de abliteracion: para investigadores interesados en estudiar el comportamiento de modelos abliterados frente a los originales, esta conversion ofrece una version lista para ejecutar en hardware de consumo.
- Generacion de codigo en entornos de desarrollo: el modelo puede usarse para autocompletar codigo o generar scripts en entornos locales, aunque no se han publicado benchmarks especificos de codigo para esta variante.
- Experimentacion con LiteRT-LM: los desarrolladores que quieran probar el runtime LiteRT-LM con un modelo real pueden usar este bundle para evaluar el rendimiento, la latencia y el uso de memoria en sus dispositivos objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion. La model card del repositorio recomienda ejecutar el comando `litert-lm benchmark` en el hardware de destino, ya que el rendimiento (throughput y uso de memoria) depende fuertemente del dispositivo, el backend y la version de LiteRT-LM. No se proporcionan datos de comparacion con otros modelos en la documentacion.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo de bundle es de 7.7 GB, por lo que se recomienda un dispositivo con al menos 8-10 GB de memoria para cargarlo en RAM o VRAM, aunque el uso exacto depende del backend.
- GPU recomendadas: no se especifican. LiteRT-LM esta disenado para ejecutarse en dispositivos perifericos y de escritorio; se puede probar en GPUs de consumo como RTX 3090/4090, y tambien en CPU con suficiente RAM.
- Compatibilidad con GPU de consumo: si, el modelo de 4B parametros es adecuado para GPUs de consumo con 8-12 GB de VRAM, especialmente con cuantizaciones (aunque no se ofrecen cuantizaciones en este repositorio).
- Opciones de despliegue: LiteRT-LM CLI (desktop), ejecucion interactiva con `litert-lm run`, y benchmark con `litert-lm benchmark`. No compatible con llama.cpp, Ollama o TGI, ya que es un formato exclusivo de LiteRT.
- Latencia y throughput: no disponibles; se recomienda ejecutar el benchmark localmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|
| `vokash3/Huihui-gemma-4-E4B-it-abliterated-LiteRT-LM` | 4B (MoE) | 128k | Apache 2.0 | LiteRT-LM | Si |
| `google/gemma-4-E4B-it` | 4B (MoE) | 128k | Gemma Terms of Use | Safetensors | No |
| `huihui-ai/Huihui-gemma-4-E4B-it-abliterated` | 4B (MoE) | 128k | Apache 2.0 | Safetensors | Si |
| `Qwen2.5-7B-Instruct` | 7B (dense) | 128k | Apache 2.0 | Safetensors | No |

La comparacion directa con otros modelos no es posible sin benchmarks publicados. La principal diferencia con el modelo original es la eliminacion del comportamiento de rechazo y el formato de exportacion. Frente a `Qwen2.5-7B-Instruct`, la familia Gemma 4 ofrece un rendimiento competitivo con menos parametros gracias a la arquitectura MoE, pero el acceso a los resultados de evaluacion no esta disponible.

## Limitaciones y advertencias

- El modelo tiene un comportamiento de rechazo significativamente reducido, lo que significa que puede generar contenido sensible, ofensivo o inapropiado sin filtro. El uso en produccion debe contemplar medidas de moderacion externas.
- Es una conversion de formato, no un modelo reentrenado. No se ha validado la calidad de la conversion con benchmarks publicos.
- La compatibilidad con Google AI Edge Gallery en Android no esta soportada actualmente; solo funciona con el runtime LiteRT-LM de escritorio.
- No se incluyen las secciones de audio del modelo original, por lo que la funcionalidad multimodal no esta disponible en este bundle.
- Los idiomas soportados no se especifican, lo que puede limitar el uso en aplicaciones multilingues.
- No hay garantias de rendimiento en hardware especifico; se recomienda ejecutar el benchmark local antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a las leyes de derechos de autor y regulaciones de contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vokash3/Huihui-gemma-4-E4B-it-abliterated-LiteRT-LM
- Modelo base original: https://huggingface.co/huihui-ai/Huihui-gemma-4-E4B-it-abliterated
- Coleccion de modelos abliterados de huihui-ai: https://huggingface.co/collections/huihui-ai/gemma-4-abliterated
- Pagina de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Repositorio de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Issue de exportacion de audio encoder: https://github.com/google-ai-edge/litert-torch/issues/1039
- Discusion sobre bundle Gemma 4 en LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/issues/2498
- Version en Ollama del modelo abliterated: https://ollama.com/huihui_ai/gemma-4-abliterated:e4b
- Guia de abliteracion de Gemma 4: https://github.com/TrevorS/gemma-4-abliteration
