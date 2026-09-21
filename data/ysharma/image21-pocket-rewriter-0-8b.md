# ysharma/image21-pocket-rewriter-0.8B

## Resumen

image21-pocket-rewriter-0.8B es un modelo de lenguaje pequeno de 752.393.024 parametros publicado por el usuario ysharma en Hugging Face. Es un ajuste fino completo (full fine-tune) de Qwen/Qwen3.5-0.8B sin cambios arquitectonicos, obtenido por destilacion de las salidas de un profesor de 9B, Qwen/Qwen-Image-2.1-PE-T2I, que ejerce de reescritor de prompts para el generador de imagenes Qwen-Image-2.1.

Su funcion es deliberadamente estrecha: convierte una peticion breve del usuario (por ejemplo, "a photo of a red bicycle leaning against a bakery door") en un unico objeto JSON compacto con una descripcion larga en ingles de entre 80 y 400 palabras y una relacion de aspecto permitida, con el formato `{"rewritten_prompt": "...", "wh_ratio": "3:2"}`. Resuelve el coste de invocar el reescritor de 9B junto con su prompt de sistema de aproximadamente 1.700 palabras y sus tokens de razonamiento: el modelo no usa prompt de sistema y tiene el modo thinking desactivado en la plantilla de chat, de modo que el comportamiento de reescritura esta interiorizado en los pesos.

Es relevante para quien construya pipelines de generacion de imagenes con Qwen-Image-2.1 y quiera eliminar la dependencia de un modelo de 9B en el paso de reescritura. Segun la model card, el modelo alcanza una tasa de JSON valido del 99,7% y de proporcion permitida del 99,3% (frente al 100% en ambos casos del profesor) generando una media de 453,1 tokens frente a los 1.630,8 del profesor, con una latencia media de 2,81 s frente a los 29,90 s del baseline sin ajustar. La contrapartida es una licencia de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`), con soporte de linear attention; la configuracion incluye un bloque MTP (multi-token prediction) que es solo arquitectura y no tiene pesos asociados |
| Parametros totales | 752.393.024 (0,75B), dato real de los safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bfloat16; GGUF Q8_0 publicado (`image21-pocket-rewriter-0.8B-Q8_0.gguf`, 812 MB). No se han publicado otras cuantizaciones GGUF |
| Idiomas soportados | no declarados en la model card. La salida se genera en ingles; en la evaluacion se mide la preservacion de texto citado en arabe, devanagari, han, japones y latin |
| Licencia | other (Qwen Research License, uso no comercial segun la model card) |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 3,8 GB |
| Modelo base | Qwen/Qwen3.5-0.8B (Apache 2.0) |
| Pipeline | text-generation |
| Fecha de publicacion | 21 de septiembre de 2026 (creado), ultima actualizacion el mismo dia |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 752 millones de parametros perteneciente a la familia Qwen3.5. No hay cambio arquitectonico respecto al modelo base: se trata de un ajuste fino completo. La configuracion heredada incluye un bloque MTP (prediccion multi-token) que, segun la model card, existe solo a nivel de arquitectura y no tiene pesos, lo que obliga a convertir el modelo a GGUF con la opcion `--no-nextn` de `convert_hf_to_gguf.py`. El soporte de linear attention de Qwen3.5 es necesario para poder ejecutar el modelo en llama.cpp con una build reciente.

El entrenamiento es una destilacion con supervision sobre las salidas del profesor Qwen/Qwen-Image-2.1-PE-T2I, formulada como pares `{user: peticion en bruto}` -> `{assistant: un objeto JSON compacto}`. Se partio de 8.797 peticiones etiquetadas por el profesor; tras aplicar un filtro duro se seleccionaron 1.776 pares validos. Los criterios del filtro fueron: JSON parseable, proporcion permitida, texto entrecomillado conservado literalmente, proporcion indicada por el usuario respetada, salida en ingles, longitud entre 80 y 400 palabras y ausencia de texto sobre proporcion, resolucion o pixeles dentro del prompt reescrito. El pipeline de entrenamiento uso SFT con TRL; el profesor, los datos y los indicadores del filtro se documentan en el dataset ysharma/image21-rewriter-distill.

## Capacidades

- Generacion de texto en ingles especializada en reescritura de prompts: transforma una peticion corta en una descripcion visual extensa de 80 a 400 palabras.
- Salida estructurada en JSON compacto con dos claves fijas, `rewritten_prompt` y `wh_ratio`, sin necesidad de prompt de sistema.
- Seleccion de relacion de aspecto entre el conjunto de proporciones permitidas (1:1, 3:2, 2:3, 16:9, 9:16, 4:3, 3:4, 2:1, 1:2, 21:9, 9:21, 4:5, 5:4, 3:1, 1:3).
- Preservacion literal de texto entrecomillado presente en la peticion original, con rendimiento desigual segun la escritura: latin 57,1%, arabe 33,3%, han 20,0%, japones 33,3% y devanagari 0,0% en la evaluacion.
- Etiquetado como `conversational` y compatible con endpoints, aunque en la practica opera en un unico turno de usuario a asistente.
- Tool calling / function calling: no disponible.
- Uso como agente y razonamiento multi-paso: no disponible; el modo thinking esta desactivado en la plantilla de chat.
- Vision, audio y otras modalidades: no soportadas (modelo estrictamente de texto).

## Casos de uso

- Reescritura de prompts en un pipeline de generacion de imagenes con Qwen-Image-2.1: el modelo sustituye al reescritor de 9B en el paso previo a la difusion. Su salida ya incluye la relacion de aspecto, que se mapea directamente a la tabla de resoluciones (por ejemplo, `3:2` -> 1248x832) con 40 pasos de inferencia y `true_cfg_scale` 1.0.
- Despliegue en CPU o en hardware de gama baja: con el GGUF Q8_0 de 812 MB puede ejecutarse en llama.cpp sobre CPU, lo que permite ofrecer reescritura de prompts sin GPU dedicada en el servidor.
- Reduccion de coste por imagen en produccion: el modelo genera 453,1 tokens de media frente a los 1.630,8 del profesor, aproximadamente el 28% del coste de generacion, con una latencia media de 2,81 s frente a los 29,90 s del baseline sin ajustar.
- Preprocesado por lotes de catalogos de prompts: dado que el formato de salida esta fijado en los pesos y no requiere prompt de sistema, se puede procesar en lote con una plantilla de chat constante, simplificando el encolado y el parseo.
- Enriquecimiento de interfaces de creacion de imagenes: el usuario escribe una frase corta y el modelo propone de forma automatica tanto la descripcion detallada como la proporcion, sin obligarle a elegir un ratio manualmente ni a redactar un prompt largo.
- Despliegue en endpoints serverless: el tag `endpoints_compatible` y el tamano reducido del modelo permiten servirlo en infraestructura de inferencia gestionada con arranque rapido y huella de memoria minima.
- Investigacion sobre destilacion de reescritores de prompts: el dataset (1.776 pares filtrados de 8.797) y las metricas publicadas permiten reproducir y comparar variantes de estudiante, incluido el brazo de 2B evaluado en la model card.
- Sustitucion del reescritor en entornos con presupuesto de VRAM muy limitado: al ocupar aproximadamente 1,5 GB en bfloat16, cabe en GPUs consumer de gama media junto con el resto del pipeline.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre las 300 peticiones de evaluacion reservadas del dataset de destilacion, generando cada brazo con el protocolo de muestreo del profesor (temperatura 1.0, top_p 0.95, top_k 20, semilla 0). El baseline es Qwen/Qwen3.5-2B sin ajustar, con el prompt de sistema completo del profesor y thinking activado; su ejecucion se corto a 80 filas por el presupuesto de tiempo del trabajo de evaluacion, por lo que sus cifras son un suelo parcial y no un techo.

| Metrica | Profesor (9B) | Este modelo (0,8B) | Estudiante 2B | Baseline 2B |
|---|---|---|---|---|
| Filas | 300 | 300 | 300 | 80 |
| Tasa de JSON valido | 100,0% | 99,7% | 100,0% | 77,5% |
| Tasa de proporcion permitida | 100,0% | 99,3% | 99,7% | 20,0% |
| Fidelidad de texto (cadenas entrecomilladas literales) | 53,1% | 53,1% | 60,2% | 3,7% |
| Fidelidad por escritura | Arabe 66,7%, Devanagari 0,0%, Han 60,0%, Japones 66,7%, Latin 52,0% | Arabe 33,3%, Devanagari 0,0%, Han 20,0%, Japones 33,3%, Latin 57,1% | Arabe 33,3%, Devanagari 0,0%, Han 20,0%, Japones 50,0%, Latin 64,3% | Japones 0,0%, Latin 3,9% |
| Acuerdo de proporcion con el profesor | 100,0% | 57,7% | 67,3% | 8,8% |
| Tokens generados media / mediana | 1630,8 / 1536,5 | 453,1 / 456,5 | 482,8 / 462,0 | 6106,4 / 6144,0 |
| Latencia (s) media / mediana | n/a | 2,81 / 2,61 | 3,22 / 3,12 | 29,90 / 29,81 |

Lecturas que aporta el autor: los estudiantes igualan al profesor en cumplimiento de formato (JSON y proporcion permitida en torno al 99-100%) con cerca del 28% del coste en tokens del profesor y una fraccion de su latencia; el propio profesor solo conserva el 53% del texto citado, por lo que la perdida es una propiedad de todo el stack y no solo de los estudiantes; y en proporcion, los estudiantes casi siempre eligen un valor permitido pero solo coinciden con la eleccion concreta del profesor entre el 58% y el 67% de las veces.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 1,5 GB solo para los pesos (752.393.024 parametros x 2 bytes), mas el overhead de activaciones y cache KV; en la practica cabe holgadamente en 2-3 GB de VRAM.
- VRAM con el GGUF Q8_0: 812 MB de fichero, por lo que la inferencia cuantizada se puede ejecutar con menos de 1,5 GB de memoria.
- GPU recomendadas: no especificadas en la model card. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, L4, A10G, A100 y H100; el modelo es demasiado pequeno para aprovechar GPUs de datacenter de gama alta en inferencia individual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, incluso en iGPU con suficiente memoria compartida.
- CPU: si, mediante el GGUF Q8_0 en llama.cpp, siempre que la build incluya soporte de linear attention de Qwen3.5 y se haya convertido con `--no-nextn`.
- Opciones de despliegue: transformers (referencia oficial del autor, con `device_map="cuda"` y `torch_dtype=torch.bfloat16`), llama.cpp con GGUF, y despliegue en endpoints gestionados por el tag `endpoints_compatible`. vLLM, TGI, Ollama y otros servidores no se mencionan en la informacion disponible.
- Latencia medida: 2,81 s de media y 2,61 s de mediana por reescritura en el hardware de evaluacion (no especificado), generando 453,1 tokens de media. El estudiante de 2B tardo 3,22 s de media y el baseline de 2B sin ajustar, 29,90 s.
- Throughput agregado: no disponible.
- Ajustes de generacion usados en la evaluacion y en el ejemplo oficial: `max_new_tokens=1024`, `do_sample=True`, `temperature=1.0`, `top_p=0.95`, `top_k=20`.

## Comparativa con modelos similares

La informacion disponible no incluye otros reescritores de prompts publicados como modelos independientes, por lo que la comparacion se limita a los brazos evaluados en la propia model card.

| Modelo | Parametros | Funcion | Proporcion permitida | Tokens generados (media) | Latencia (s, media) | Licencia |
|---|---|---|---|---|---|---|
| image21-pocket-rewriter-0.8B | 0,75B | Reescritor de prompts para Qwen-Image-2.1 | 99,3% | 453,1 | 2,81 | other (no comercial) |
| Qwen-Image-2.1-PE-T2I (profesor) | 9B | Reescritor de prompts con prompt de sistema de ~1.700 palabras y thinking | 100,0% | 1630,8 | no disponible | no disponible en la informacion proporcionada |
| Estudiante 2B (brazo de evaluacion) | 2B | Reescritor de prompts destilado | 99,7% | 482,8 | 3,22 | no disponible en la informacion proporcionada |
| Qwen3.5-2B sin ajustar (baseline) | 2B | Sin especializar; requiere el prompt de sistema del profesor y thinking | 20,0% | 6106,4 | 29,90 | Apache 2.0 (modelo base Qwen) |

Modelos comparables de la misma categoria (reescritores de prompts de imagenes publicados de forma independiente): no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia "other", identificada en la model card como Qwen Research License, con uso exclusivamente no comercial. El modelo base Qwen3.5-0.8B es Apache 2.0, pero el ajuste fino no hereda esa permisividad.
- Riesgo de alucinacion en el texto citado: la fidelidad de las cadenas entrecomilladas es del 53,1%, identica a la del profesor. El modelo puede alterar nombres, rotulos o texto que el usuario queria conservar literalmente.
- Fidelidad muy desigual por alfabeto: 57,1% en latin, 33,3% en arabe y japones, 20,0% en han y 0,0% en devanagari. Para prompts con texto no latino el riesgo de corrupcion es alto.
- Formato no perfecto: la tasa de JSON valido es del 99,7%, es decir, en torno a un 0,3% de casos la salida no es parseable. El autor recomienda remuestrear o recurrir a `json_repair`.
- Proporcion: aunque el 99,3% de las elecciones son proporciones permitidas, solo coinciden con la eleccion concreta del profesor en el 57,7% de los casos, lo que puede introducir variabilidad en la composicion de la imagen generada.
- Ambito funcional muy estrecho: no es un modelo conversacional general ni un asistente; esta especializado en una unica transformacion de prompt a JSON. No soporta tool calling, agentes, vision ni audio.
- Sin prompt de sistema ni thinking: el comportamiento esta fijado en los pesos y el modo thinking esta desactivado en la plantilla de chat. Desviarse de la plantilla de entrenamiento puede degradar la salida.
- Longitud de contexto no declarada: no se especifica la ventana de contexto, lo que impide garantizar el comportamiento con peticiones muy largas.
- Idiomas no declarados oficialmente: la evaluacion solo cubre la preservacion de texto citado en cinco escrituras; no hay datos sobre generacion multilingue mas alla del ingles.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicacion reciente y sin validacion externa. Las cifras del baseline de la comparativa se cortaron a 80 filas, por lo que no son directamente equiparables a las de los demas brazos.
- Dependencia de herramientas: el uso con GGUF requiere una build reciente de llama.cpp con soporte de linear attention de Qwen3.5, y el ejemplo de generacion de imagenes requiere `diffusers` desde git main (0.41.0.dev0 o superior) y torchvision importable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ysharma/image21-pocket-rewriter-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de generacion de imagenes asociado: https://huggingface.co/Qwen/Qwen-Image-2.1
- Profesor (reescritor de prompts de 9B): https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Dataset de destilacion (profesor, datos y flags de filtrado): https://huggingface.co/datasets/ysharma/image21-rewriter-distill
- Baseline de la comparativa: https://huggingface.co/Qwen/Qwen3.5-2B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a la documenta de Kassel y no guardan relacion con esta ficha.
