# tncyypttvk/Prom-1.5B

## Resumen

Prom-1.5B es un modelo de generacion de texto publicado en HuggingFace por el usuario tncyypttvk bajo el identificador `tncyypttvk/Prom-1.5B`. Se trata de un checkpoint de 1.543.714.304 parametros (aproximadamente 1,54 mil millones) etiquetado con la arquitectura `qwen2`, lo que lo situa en la familia de transformers decoder-only derivada de Qwen2, con atencion causal y pesos en formato safetensors. El repositorio ocupa 3,1 GB, un tamano coherente con pesos almacenados en bf16/fp16 (2 bytes por parametro).

La relevancia de esta ficha es limitada y conviene ser explicito: la model card es la plantilla automatica de HuggingFace sin rellenar, con todos los campos marcados como "More Information Needed". No se declara licencia, ni idiomas, ni datos de entrenamiento, ni procedimiento de ajuste, ni resultados de evaluacion. El modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion alguna por parte de la comunidad.

En consecuencia, esta ficha documenta lo que es verificable (arquitectura declarada, recuento real de parametros, formato de pesos, tamano del repositorio) y marca explicitamente como "no disponible" todo lo demas. Cualquier evaluacion de calidad, sesgos o idoneidad para produccion requiere una validacion empirica por parte del usuario antes de adoptar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2 (transformer decoder-only con atencion causal, segun el tag del repositorio) |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Longitud de contexto | no disponible en la model card; la arquitectura qwen2 soporta nativamente hasta 32.768 tokens, pero no se confirma la configuracion de este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors en precision completa/mixta (bf16 o fp16, inferido del tamano del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors |
| Libreria de carga | transformers |
| Pipeline declarado | text-generation (tag adicional: conversational) |
| Tamano del repositorio | 3,1 GB |
| Fecha de creacion | 2026-10-13 |
| Ultima actualizacion | 2026-10-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El unico dato tecnico fiable sobre la arquitectura es el tag `qwen2`, que situa el modelo en la familia Qwen2 de Alibaba. Esto implica, si el tag es correcto, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y probablemente atencion con consultas agrupadas (GQA), que es la configuracion estandar de la familia. Para un modelo de 1,54 mil millones de parametros, el checkpoint base de referencia de esa familia (Qwen2-1.5B) emplea 28 capas, dimension oculta de 1536 y vocabulario de 151.936 tokens, pero no hay confirmacion de que este checkpoint reproduzca esa configuracion exacta.

No hay absolutamente ninguna informacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo preentrenamiento desde cero, fine-tuning supervisado, RLHF o DPO. El tag `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre el calculador de impacto medioambiental de machine learning, un enlace que la plantilla de HuggingFace incluye por defecto; no es un paper asociado al modelo. No se declara ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, mezcla de expertos, estado espacio-temporal) ni se publican hiperparametros de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad garantizada por el pipeline declarado (`text-generation`).
- Conversacion multi-turno: el tag `conversational` sugiere un ajuste orientado a dialogo, aunque no se documenta la plantilla de chat ni los tokens especiales utilizados.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades de vision o audio: no disponible; el repositorio no contiene procesadores de imagen ni audio.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Generacion de codigo y matematicas: sin datos de entrenamiento ni benchmarks no puede afirmarse nada; en modelos densos de ~1,5B la competencia en codigo y matematicas suele ser limitada.

## Casos de uso

Dado que el modelo carece de documentacion y de evaluaciones publicadas, los casos siguientes son escenarios tecnicamente plausibles para un transformer denso de 1,54B con licencia indeterminada. En todos ellos se recomienda una validacion previa y, en entornos comerciales, una revision legal de la licencia.

- Prototipado local en maquina de desarrollo: con pesos bf16 (3,1 GB) o una conversion a GGUF Q4 (en torno a 1 GB), el modelo puede ejecutarse en un portatil con GPU consumer o incluso en CPU, lo que lo hace util para iterar sobre plantillas de prompts y pipelines de generacion antes de escalar a un modelo mayor.
- Clasificacion y extraccion de informacion: tareas de etiquetado de texto, extraccion de entidades o estructuracion de documentos en JSON son abordables con un modelo de este tamano si se validan las tasas de acierto, ya que el coste por inferencia es bajo.
- Asistente conversacional ligero en el borde: el tag `conversational` apunta a este uso, con la ventaja de que el modelo puede desplegarse en dispositivos con recursos limitados; seria necesario verificar la calidad del dialogo multi-turno antes de exponerlo a usuarios.
- Generacion de texto controlada en lote: redaccion de resumenes cortos, descripciones de producto o respuestas plantilla a gran escala, donde el coste computacional domina sobre la calidad maxima alcanzable.
- Base para fine-tuning de dominio vertical: partir de un checkpoint de 1,54B en safetensors es barato en terminos de GPU respecto a modelos de 7B o superiores, por lo que sirve como punto de partida para ajustes especificos de sector con datasets propios.
- Componente auxiliar en un sistema mayor: uso como modelo de cribado (draft model) para prefiltrar respuestas o como generador de candidatos en una arquitectura en cascada, delegando en un modelo mayor las peticiones de alta complejidad.
- Investigacion sobre comportamiento de modelos pequenos: analisis de alucinacion, sesgos y degradacion de contexto en la franja de 1-2B parametros, ambito donde faltan checkpoints documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada (MMLU, HumanEval, GSM8K, MT-Bench u otros) y la busqueda web no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del recuento real de parametros (1,54B) y del overhead habitual de la cache KV; no proceden de mediciones publicadas por el autor, que no las facilita.

- Pesos en bf16/fp16 (formato del repositorio): aproximadamente 3,1 GB solo de pesos; con cache KV y margen de ejecucion, entre 4 y 5 GB de VRAM en total.
- Pesos en int8 (requiere cuantizacion propia): aproximadamente 1,6 GB de pesos; en torno a 2,5-3 GB de VRAM en total.
- Pesos en int4 / GGUF Q4_K_M (requiere conversion, no incluida en el repo): aproximadamente 1 GB de pesos; en torno a 1,5-2 GB de VRAM en total.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060/4060 Ti, RTX 4070 y superiores; tambien en GPUs de 8 GB si se cuantiza a int8 o int4. En RTX 4090 o A100/H100 el modelo queda sobredimensionado para la GPU y el cuello de botella sera el ancho de banda de memoria.
- CPU: la inferencia en CPU con llama.cpp es viable a velocidades de pocos tokens por segundo en cuantizacion Q4, aunque no se dispone de mediciones concretas.
- Opciones de despliegue: `transformers` de forma nativa (unico formato publicado); vLLM y TGI son compatibles con la arquitectura qwen2 y los safetensors; Ollama y llama.cpp requieren convertir previamente los pesos a GGUF; SGLang tambien es una opcion si la arquitectura declarada es correcta.
- Latencia y throughput: no disponible; no se han publicado mediciones y no pueden inferirse con fiabilidad sin ejecutar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| tncyypttvk/Prom-1.5B | 1,54B | no disponible | no disponible | no disponible | repositorio HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | si, en su model card oficial | HuggingFace, ampliamente utilizado |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License (con restricciones) | si, en su model card oficial | HuggingFace, ampliamente utilizado |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | si, en su model card oficial | HuggingFace, ampliamente utilizado |

La comparacion relevante no es de rendimiento, ya que Prom-1.5B no publica ninguna cifra, sino de madurez: los tres modelos alternativos cuentan con licencia explicita, contexto documentado, evaluaciones reproducibles y soporte activo en herramientas de despliegue. Prom-1.5B no ofrece ninguna de esas garantias. Cualquier decision de adopcion deberia apoyarse en una evaluacion propia frente a estas alternativas.

## Limitaciones y advertencias

- Model card sin contenido: todos los campos estan sin rellenar, incluidos desarrollador, datos de entrenamiento, hiperparametros, evaluacion e impacto medioambiental. No hay informacion verificable sobre procedencia.
- Licencia indeterminada: al no declararse licencia, no puede asumirse permiso de uso comercial. En la practica, esto equivale a ausencia de concesion explicita de derechos, lo que supone un riesgo legal para su integracion en productos.
- Ausencia de benchmarks: no existe ninguna medicion de calidad, lo que impide compararlo objetivamente con alternativas de la misma franja.
- Riesgo de alucinacion: inherente a los modelos generativos y especialmente acusado en la franja de 1,5B parametros, donde la capacidad de mantener coherencia factual decae rapidamente. No debe usarse en tareas de decision critica sin verificacion humana.
- Sesgos: se desconoce por completo la composicion del dataset de entrenamiento, por lo que no puede caracterizarse el sesgo de genero, raza, religion o ideologia. No hay seccion de sesgos cumplimentada.
- Idiomas no declarados: no puede afirmarse que el modelo funcione correctamente en castellano, ni siquiera en ingles, sin pruebas empiricas.
- Contexto no confirmado: aunque la arquitectura qwen2 soporte hasta 32.768 tokens, no hay garantia de que este checkpoint haya sido entrenado con esa longitud; un contexto largo entrenado deficientemente degrada la generacion.
- Formato limitado: solo se publican safetensors, sin versiones GGUF, AWQ, GPTQ ni ONNX, lo que obliga a convertir los pesos para usar llama.cpp u Ollama.
- Sin validacion comunitaria: 0 descargas y 0 likes implican que nadie ha reportado problemas ni verificaciones de funcionamiento.
- Trazabilidad dudosa: el repositorio se creo y actualizo el mismo dia (2026-10-13) y el tag de arXiv apunta a un articulo generico de la plantilla, no a un paper del modelo. El nombre "Prom" no tiene documentacion asociada.
- Advertencia sobre los resultados de busqueda: las consultas web realizadas no devolvieron ninguna fuente relacionada con el modelo; los resultados obtenidos corresponden a una sociedad mercantil francesa sin relacion alguna con este proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tncyypttvk/Prom-1.5B
- Model card del autor: plantilla automatica de HuggingFace sin contenido cumplimentado
- Paper de referencia de la plantilla (no asociado al modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental citado en la plantilla: https://mlco2.github.io/impact
- Referencias comparativas de la misma franja:
  - https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
  - https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
  - https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Repositorio, demo o publicacion asociada al modelo: no disponible
