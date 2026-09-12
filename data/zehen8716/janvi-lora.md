# zehen8716/janvi-lora

## Resumen

`zehen8716/janvi-lora` es un adaptador LoRA de tipo DreamBooth para generación de imágenes a partir de texto (text-to-image), publicado por el usuario zehen8716 en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que se cargan sobre los checkpoints de la familia Krea 2 (`krea/Krea-2-Turbo` y `krea/Krea-2-Raw`). Su propósito es enseñar al modelo base un concepto visual concreto, activado mediante la palabra clave `janvi woman`.

El adaptador se entrenó sobre `krea/Krea-2-Raw`, el checkpoint no destilado de Krea 2, siguiendo el flujo oficial de DreamBooth documentado por diffusers (`examples/dreambooth/README_krea2.md`). Según la model card, los LoRA entrenados sobre RAW se expresan con fuerza al aplicarse sobre Turbo, el checkpoint destilado de 8 pasos pensado para inferencia rápida. El repositorio ocupa 1,3 GB y se distribuye en formato safetensors bajo licencia Apache 2.0.

La relevancia de esta ficha es acotada: es un adaptador de concepto con 0 descargas y 0 likes en el momento de la consulta, y su model card contiene secciones sin completar (detalles de entrenamiento, limitaciones y sesgos aparecen como `TODO`). No hay información pública sobre el dataset de entrenamiento, el número de pasos, el rango del LoRA ni métricas de calidad. Cualquier evaluación rigurosa exige reproducir la inferencia y comparar contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (DreamBooth) sobre un modelo de difusion text-to-image de la familia Krea 2; la arquitectura concreta del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo text-to-image, no autoregresivo) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y el ejemplo oficial carga el pipeline en `bfloat16` |
| Idiomas soportados | no disponible (no se declara lista de idiomas; el texto de entrada es un prompt) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de adaptador | LoRA de DreamBooth (text-to-image) |
| Modelos base | krea/Krea-2-Raw (entrenamiento), krea/Krea-2-Turbo (inferencia recomendada) |
| Palabra clave (trigger) | `janvi woman` |
| Tamano del repositorio | 1,3 GB |
| Libreria | diffusers |
| Pipeline declarado | text-to-image |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base en lugar de reentrenarlo por completo. El entrenamiento se hizo con DreamBooth sobre `krea/Krea-2-Raw` utilizando el entrenador oficial de Krea 2 en diffusers. La model card no especifica el rango del LoRA, el optimizador, la tasa de aprendizaje, el numero de pasos, el numero de imagenes de entrenamiento ni la resolucion empleada.

Krea 2 se distribuye como dos checkpoints complementarios: RAW, el modelo base no destilado sobre el que se entrena, y Turbo, un checkpoint destilado de 8 pasos para inferencia rapida. La receta de inferencia documentada por el autor para este LoRA es 8 pasos (`num_inference_steps=8`) con `guidance_scale=0.0`, es decir, sin classifier-free guidance, coherente con un modelo destilado. El autor afirma que los LoRA entrenados sobre RAW se expresan con fuerza sobre Turbo, lo que convierte a este adaptador en un ejemplo de transferencia entrenamiento-en-RAW / inferencia-en-Turbo.

No se documenta ninguna innovacion tecnica adicional ni detalles sobre la composicion del dataset de entrenamiento.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline `Krea2Pipeline` de diffusers.
- Aplicacion de un concepto personalizado concreto mediante la palabra clave `janvi woman`.
- Carga como adaptador desacoplado: `pipe.load_lora_weights("zehen8716/janvi-lora")` sobre un pipeline ya instanciado.
- Compatibilidad con las utilidades de diffusers para ponderacion, mezcla y fusionado de LoRA (`load_adapters`).
- Inferencia rapida en 8 pasos y sin guidance al combinarse con `krea/Krea-2-Turbo`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; se desconoce si el modelo base maneja prompts en varios idiomas.
- Vision, audio o modo thinking: no disponible; no se declaran capacidades adicionales.

## Casos de uso

- Generacion de retratos personalizados de un personaje recurrente: el LoRA permite fijar la identidad asociada a `janvi woman` y reutilizarla en prompts distintos, util para ilustracion seriada o storyboards donde un mismo personaje debe aparecer en multiples escenas.
- Prototipado de conceptos artisticos antes de un entrenamiento mayor: al ser un adaptador ligero que se carga y descarga en caliente, sirve para validar si un concepto concreto merece un fine-tuning completo del modelo base.
- Pruebas de identidad visual en equipos de diseno: un disenador puede generar variaciones de encuadre, iluminacion y estilo manteniendo el mismo sujeto, reduciendo el numero de iteraciones manuales frente a un prompt puro sin adaptador.
- Investigacion sobre transferencia RAW a Turbo: el adaptador es un caso practico para medir cuanto del concepto aprendido sobre el checkpoint no destilado sobrevive al pasar al checkpoint destilado de 8 pasos.
- Generacion de material visual para campanas o moodboards internos: la licencia Apache 2.0 facilita el uso dentro de organizaciones, siempre que se respeten las condiciones del modelo base sobre el que se aplica.
- Docencia y ejemplos reproducibles de DreamBooth: el flujo de la model card (instanciar pipeline, cargar LoRA, generar en 8 pasos) es un ejemplo minimo y autocontenido para ensenar ajuste fino de modelos de difusion con diffusers.
- Evaluacion de tuberias de inferencia rapida: sirve para medir latencia y consumo de VRAM de un pipeline destilado de 8 pasos con un adaptador adicional cargado, en escenarios de despliegue con presupuesto de computo ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad ni comparaciones cuantitativas) y no se han encontrado evaluaciones externas. Cualquier cifra de calidad deberia obtenerse reproduciendo la inferencia y comparandola contra el modelo base sin el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. La VRAM depende fundamentalmente de los pesos del modelo base Krea 2 (cargado en `bfloat16` en el ejemplo oficial) y no del adaptador, cuyo repositorio ocupa 1,3 GB.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU capaz de ejecutar `krea/Krea-2-Turbo` en `bfloat16` deberia poder cargar el LoRA, ya que este anade una sobrecarga pequena sobre el modelo base.
- Cabe en GPU de consumo: no confirmado. La viabilidad depende del peso del modelo base, dato no disponible en la informacion proporcionada.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` es la via documentada. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que estan orientados a modelos de lenguaje y no a pipelines de difusion de imagenes.
- Latencia y throughput estimados: no disponibles. El unico dato de la receta es el numero de pasos de inferencia (8) con `guidance_scale=0.0`, que reduce el coste computacional frente a una generacion con guidance, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA comparables para Krea 2 en los datos proporcionados. La comparacion posible se limita a los elementos de la propia familia Krea 2 y a la ausencia/presencia del adaptador.

| Elemento | Rol | Licencia | Disponibilidad |
|---|---|---|---|
| krea/Krea-2-Raw | Checkpoint base no destilado; destino del entrenamiento DreamBooth | no disponible en la informacion proporcionada | Referenciado como modelo base |
| krea/Krea-2-Turbo | Checkpoint destilado de 8 pasos para inferencia rapida | no disponible en la informacion proporcionada | Referenciado como modelo base |
| zehen8716/janvi-lora | Adaptador LoRA de concepto sobre Krea 2 | apache-2.0 | 0 descargas, 0 likes, repositorio de 1,3 GB |

## Limitaciones y advertencias

- Sesgos conocidos: la model card incluye la seccion "Limitations and bias" como `TODO` sin contenido, por lo que no hay analisis de sesgos publicado.
- Riesgo de alucinacion: no aplica en el sentido de un modelo de lenguaje, pero si existe riesgo de que el concepto entrenado se aplique de forma no deseada a prompts que no lo requieren, o de que el concepto se degrade en composiciones o estilos alejados de los vistos en el entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto conversacional; se desconoce el comportamiento del modelo base con prompts en idiomas distintos del ingles.
- Datos de entrenamiento: no se documenta el dataset. Esto impide evaluar procedencia de imagenes, posibles derechos de terceros o si el sujeto representado es una persona real, lo que es un riesgo relevante antes de cualquier uso publico o comercial.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero su uso efectivo requiere cargar los checkpoints base de Krea 2, cuyas condiciones no se detallan en la informacion proporcionada. Verificar la licencia del modelo base es obligatorio antes de un uso comercial.
- Madurez del artefacto: 0 descargas y 0 likes, model card parcialmente autogenerada con secciones sin completar. No hay evidencia de validacion por parte de terceros.
- Compatibilidad: el flujo depende de la disponibilidad de `Krea2Pipeline` en diffusers; cambios en la libreria o en la nomenclatura de los checkpoints base pueden romper la receta de carga.
- Fecha de publicacion: el repositorio figura como creado y actualizado el 2026-09-11, fecha posterior a la referencia habitual; conviene verificar su estado actual en HuggingFace antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zehen8716/janvi-lora
- Archivos del LoRA (safetensors): https://huggingface.co/zehen8716/janvi-lora/tree/main
- Modelo base RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- DreamBooth (paper): https://dreambooth.github.io/
- Entrenador Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentacion de carga de adaptadores LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Documentacion de DreamBooth en diffusers: https://huggingface.co/docs/diffusers/main/en/training/dreambooth
