# Zster/chromatic-relics

## Resumen

Chromatic Relics es un LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Zster. Se entrena sobre la variante Krea 2 RAW y se presenta en la model card sobre Krea 2 Turbo, generando muestras con 8 pasos de inferencia y `guidance_scale` 0.0. Su funcion es inyectar un estilo visual concreto —descrito por el autor como "painterly sci-fi concept style"— en el pipeline base, sin necesidad de reentrenar el modelo completo.

El artefacto pesa 1,0 GB y se distribuye en formato compatible con `diffusers` mediante `load_lora_weights`. La activacion del concepto se realiza con la frase de disparo `painterly sci-fi concept style`, que debe incluirse en el prompt para que el adaptador module la generacion hacia la estetica entrenada (escenarios de ciencia ficcion pintada, paletas iridiscentes, arquitecturas imposibles y motivos retrofuturistas).

Es relevante ahora porque demuestra el flujo habitual de personalizacion ligera sobre modelos de difusion recientes: un adaptador pequeno, con licencia Apache 2.0, que se carga sobre el modelo base sin reentrenamiento y que permite a estudios de concepto, ilustradores e investigadores reproducir un estilo concreto de forma controlada. No obstante, la informacion publicada es muy limitada: no hay datos de entrenamiento, benchmarks, idiomas ni evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusion texto-a-imagen Krea 2; adaptador de bajo rango, no un modelo completo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; la longitud de prompt depende del tokenizador del pipeline Krea 2) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en precision nativa; el modelo base admite `torch_dtype=torch.bfloat16` segun la model card) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `load_lora_weights`); tamano del repo 1,0 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la tecnica DreamBooth sobre el modelo base `krea/Krea-2-Raw`. No se especifica el rango del adaptador, las capas objetivo, la resolucion de entrenamiento, el numero de pasos ni el tamano del dataset. Tampoco se detalla si se aplicaron tecnicas adicionales como regularizacion por clase, captions automaticos o aumento de datos. El unico dato operativo es la frase de disparo (`painterly sci-fi concept style`) y que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos.

La arquitectura subyacente es la del modelo base Krea 2, un modelo de difusion texto-a-imagen del que la informacion proporcionada no detalla el tipo exacto (UNet, transformer de difusion o arquitectura hibrida), el numero de parametros ni el volumen de datos de entrenamiento. El LoRA modifica un subconjunto de pesos del modelo base para sesgar la distribucion de salida hacia el estilo aprendido, manteniendo intactas el resto de capacidades del pipeline.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el estilo aprendido, mediante el pipeline `Krea2Pipeline` de `diffusers`.
- Aplicacion de una estetica concreta de ciencia ficcion pintada: paletas iridiscentes, iluminacion neon, arquitecturas monumentales y motivos retrofuturistas.
- Composicion de escenas complejas con multiples elementos (por ejemplo, medusas gigantes, bosques de amatista, islas flotantes, catedrales holograficas).
- Compatibilidad con el modo Turbo del modelo base: las muestras se generan con 8 pasos y `guidance_scale=0.0`, lo que reduce el coste de inferencia.
- Carga y descarga dinamica del adaptador sobre el modelo base sin reentrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; es un modelo exclusivamente generativo de imagen.

## Casos de uso

- Exploracion de direccion de arte para videojuegos: el LoRA permite generar rapidamente moodboards y conceptos de entornos de ciencia ficcion con una estetica coherente, usando la frase de disparo para mantener el estilo entre iteraciones.
- Previsualizacion de escenarios para cine y animacion: ilustradores pueden producir frames de referencia de ciudades futuristas, catedrales holograficas o paisajes alienigenas antes de modelar en 3D.
- Ilustracion editorial y de portadas: la estetica pintada y detallada encaja en portadas de novelas de ciencia ficcion, articulos y material promocional, con generacion en 8 pasos sobre Krea 2 Turbo.
- Prototipado rapido en estudios pequenos: al ser un adaptador de 1,0 GB con licencia Apache 2.0, se integra en pipelines existentes de `diffusers` sin coste de licencia y con requisitos de almacenamiento moderados.
- Generacion de assets para prototipos de juegos indie: texturas de fondo, ilustraciones de carga y arte conceptual para vertical slices, siempre que se revise la coherencia del estilo.
- Investigacion sobre personalizacion de modelos de difusion: sirve como ejemplo reproducible de DreamBooth-LoRA sobre Krea 2 para estudiar como un adaptador de bajo rango modifica la distribucion de salida con una sola frase de activacion.
- Creacion de variaciones controladas de un mismo universo visual: manteniendo la frase de disparo y variando la descripcion de la escena, se obtienen series de imagenes consistentes para narrativa visual o presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres imagenes de muestra generadas sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`; no hay metricas objetivas como FID, CLIP score, evaluacion humana ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA; depende del modelo base Krea 2 y de la precision utilizada (`bfloat16` segun la model card). El adaptador en si anade una sobrecarga minima frente al modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al tratarse de un pipeline de difusion de imagen, se requiere una GPU con memoria suficiente para el modelo base en `bfloat16`; no se confirma compatibilidad con GPU de consumo.
- Compatibilidad con GPU de consumo: no confirmada. El unico requisito documentado es ejecutar `Krea2Pipeline.from_pretrained(..., torch_dtype=torch.bfloat16).to("cuda")`.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles. Las muestras se generaron con 8 pasos en Krea 2 Turbo, lo que sugiere un coste de inferencia reducido, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zster/chromatic-relics | LoRA DreamBooth sobre Krea 2 | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Variante Turbo del modelo base | no disponible | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Informacion muy escasa: no se documentan datos de entrenamiento, rango del LoRA, capas objetivo, resolucion ni numero de pasos, lo que dificulta reproducir el entrenamiento o evaluar su robustez.
- Sesgo de estilo: el adaptador esta especializado en una unica estetica; fuera de la frase de disparo o de escenas de ciencia ficcion puede degradar la calidad o introducir elementos no deseados.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth con una frase de activacion concreta, puede reproducir motivos del dataset de entrenamiento y reducir la diversidad de las generaciones.
- Idiomas: no se especifican idiomas soportados; los ejemplos estan en ingles y no hay evidencia de buen funcionamiento con prompts en castellano.
- Alucinacion visual: como todo modelo generativo de imagen, puede producir incoherencias anatomicas, arquitectonicas o de perspectiva, especialmente en escenas complejas con muchos elementos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Krea 2 tiene su propia licencia, no detallada en la informacion proporcionada; es necesario verificar los terminos del modelo base antes de un uso comercial.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni evaluaciones independientes.
- Sin garantias de produccion: no hay benchmarks, pruebas de estabilidad ni documentacion de latencia, por lo que no se recomienda su uso en produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zster/chromatic-relics
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo del modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Video relacionado encontrado en la busqueda web (no es documentacion oficial del modelo): https://www.youtube.com/watch?v=knEwJhUhX_w
