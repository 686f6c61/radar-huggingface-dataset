# SusanHill/zils-mini-v1

## Resumen

zils-mini-v1 es un modelo de lenguaje publicado en Hugging Face por el usuario SusanHill bajo licencia Apache 2.0. Se presenta en la model card como un fine-tune de "d3-mini" destinado a un "soup pool", es decir, presumiblemente a formar parte de una mezcla de modelos (model soup) o de un conjunto de candidatos para fusion. La informacion publicada es minima: la model card apenas contiene dos lineas y no detalla arquitectura, datos de entrenamiento ni capacidades.

El unico dato tecnico verificable procede de los pesos en formato safetensors: 4.539.265.536 parametros totales (aproximadamente 4,54 mil millones), lo que situa al modelo en la franja de los modelos pequenos/medianos. El repositorio ocupa 9,1 GB, coherente con pesos en precision de 16 bits para ese numero de parametros. No se especifica la longitud de contexto, los idiomas soportados ni el pipeline de inferencia.

Por su escasez de documentacion y su nulo historial de descargas y likes en el momento de la consulta, debe tratarse como un artefacto experimental de un autor independiente, no como un modelo listo para produccion. Su relevancia potencial radica en servir como componente en tecnicas de fusion de modelos, pero cualquier evaluacion seria requiere validacion propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, no confirmado) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card solo indica que es un fine-tune de un modelo denominado "d3-mini" orientado a un "soup pool". No se detalla si se trata de un transformer decoder-only clasico, ni el numero de capas, dimensiones ocultas, cabezas de atencion o tipo de normalizacion. Tampoco se especifica la longitud de contexto nativa ni si emplea tecnicas como RoPE, attention lineal o mezcla de expertos.

Respecto al entrenamiento, no hay datos sobre el numero de tokens utilizados, la composicion del dataset, la posible aplicacion de RLHF, DPO o instruccion tuning, ni los hiperparametros del fine-tune. El termino "soup pool" sugiere que el modelo esta pensado para participar en un proceso de model soup (promediado de pesos de varios fine-tunes del mismo modelo base), pero es una inferencia a partir del texto y no una confirmacion tecnica.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de 4,5 mil millones de parametros, pero no documentada ni validada por el autor.
- Razonamiento y conocimiento general: no disponible; no hay benchmarks ni descripcion de capacidades.
- Generacion de codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible; no se documenta soporte de plantillas de herramientas ni formato de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Experimentacion con model soups: el modelo puede emplearse como uno de los candidatos a promediar con otros fine-tunes del mismo base "d3-mini", siempre que se verifique la compatibilidad de arquitectura y nombres de tensores.
- Investigacion sobre fine-tuning de modelos de ~4,5 B: sirve como punto de partida para estudiar como se comporta un fine-tune pequeno con licencia permisiva en tareas concretas, previa evaluacion propia.
- Prototipado local en hardware de gama alta de consumo: con 4,54 B de parametros, es viable cargarlo cuantizado en una GPU con 12-24 GB de VRAM para pruebas de generacion de texto, aunque sin garantias de calidad.
- Base para evaluacion comparativa interna: util como referencia adicional en un banco de pruebas propio frente a otros modelos de tamano similar, dado que su licencia Apache 2.0 no impone restricciones de uso.
- Fine-tuning adicional con datos propios: al ser Apache 2.0 y safetensors, puede reentrenarse o ajustarse sin fricciones legales, siempre que se resuelvan las incognitas de arquitectura.
- Docencia y formacion: adecuado para demostrar el ciclo completo de publicacion, carga y evaluacion de un modelo en Hugging Face, por su tamano manejable y su licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5-3 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue sin cuantizar con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4080/4070 Ti (16 GB) en fp16 con contextos cortos, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM y TGI si se confirma que la arquitectura es compatible; llama.cpp y Ollama requieren conversion previa a GGUF, no incluida en el repositorio; transformers como via directa de carga.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-v1 | 4,54 B | no disponible | Apache 2.0 | Minima (dos lineas) | Hugging Face, safetensors |
| Qwen2.5-3B | 3,09 B | 32.768 tokens (128K en variantes) | Apache 2.0 | Extensa, con benchmarks | Hugging Face, GGUF, vLLM |
| Llama 3.2 3B | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Extensa, con benchmarks | Hugging Face, GGUF, Ollama |
| Phi-3.5-mini | 3,82 B | 128.000 tokens | MIT | Extensa, con benchmarks | Hugging Face, GGUF, Ollama |

La comparacion se limita a modelos de tamano proximo. zils-mini-v1 carece de la documentacion, los benchmarks y el ecosistema de cuantizaciones de las alternativas citadas, por lo que en la practica no es un sustituto directo de ninguno de ellos sin una evaluacion previa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe arquitectura, datos, contexto ni idiomas, lo que impide predecir su comportamiento.
- Riesgo elevado de alucinacion y de calidad irregular: al no haber benchmarks ni evaluaciones publicadas, no hay evidencia de su rendimiento en ninguna tarea.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no pueden evaluarse sesgos de genero, raza, idioma o dominio.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Contexto desconocido: no se especifica la ventana de contexto, lo que complica el diseno de aplicaciones con conversaciones largas o documentos extensos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad legal y tecnica recae en el usuario.
- Origen incierto del modelo base "d3-mini": no se enlaza el modelo original ni se detalla su procedencia, lo que dificulta verificar la cadena de licencias y la compatibilidad para fusion.
- Sin adopcion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-mini-v1
- Perfil del autor: https://huggingface.co/SusanHill
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
