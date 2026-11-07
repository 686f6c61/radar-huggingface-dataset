# vitorino87/sd-class-butterflies-32

## Resumen

`vitorino87/sd-class-butterflies-32` es un modelo de difusion para generacion incondicional de imagenes de mariposas, desarrollado por el usuario vitorino87 en el contexto del curso Diffusion Models Class de Hugging Face. Se trata de un modelo de juguete (toy model) que reproduce el clasico ejemplo de la Unidad 1 del curso, entrenado con el dataset `huggan/smithsonian_butterflies_subset` a resolucion de 32x32 pixeles. No es un modelo de lenguaje ni un modelo de proposito general: su unico cometido es generar imagenes sinteticas de mariposas.

El modelo es un UNet de difusion de tipo DDPM con aproximadamente 18,5 millones de parametros, empaquetado en formato safetensors y consumible a traves de la libreria `diffusers` mediante `DDPMPipeline`. Su relevancia es exclusivamente didactica: sirve para ilustrar el pipeline completo de entrenamiento e inferencia de modelos de difusion, desde el ruido hasta la imagen generada, con un coste computacional minimo que permite entrenarlo en una GPU consumer en pocos minutos.

No debe confundirse con los modelos de la familia Stable Diffusion: el prefijo `sd-class` hace referencia a la clase de modelos de difusion, no a Stable Diffusion. El tamano del repositorio es de 0,1 GB, lo que refleja la simplicidad del modelo y su dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (DDPM), pipeline DDPMPipeline |
| Parametros totales | 18.536.323 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DDPM (Denoising Diffusion Probabilistic Models) implementada en `diffusers`: una UNet que aprende a predecir el ruido anadido en cada paso del proceso de difusion, junto con un scheduler de ruido (por defecto, el asociado al pipeline `DDPMPipeline`). La resolucion de entrenamiento es de 32x32 pixeles, coherente con el sufijo `-32` del nombre del modelo y con el ejemplo canonico de la Unidad 1 del curso.

El entrenamiento se realizo sobre el subconjunto `huggan/smithsonian_butterflies_subset`, un dataset de imagenes de mariposas de dominio publico procedente del Smithsonian. No se dispone de informacion sobre el numero exacto de pasos de entrenamiento, el tamano del batch, la tasa de aprendizaje ni el numero de epochs empleados; la model card no incluye estos detalles. No se aplicaron tecnicas de RLHF, DPO ni fine-tuning por preferencias, dado que se trata de un modelo generativo incondicional sin componente de alineacion. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion incondicional de imagenes de mariposas a 32x32 pixeles mediante muestreo iterativo de difusion.
- Integracion directa con la libreria `diffusers` a traves de `DDPMPipeline.from_pretrained(...)`.
- Generacion de multiples imagenes por llamada (el pipeline devuelve un objeto con `.images`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision por comprension, audio ni ninguna capacidad multimodal mas alla de la generacion de imagen.
- No admite condicionamiento por prompt de texto: la generacion es puramente incondicional.

## Casos de uso

- Docencia y aprendizaje de modelos de difusion: el modelo permite ejecutar el ciclo completo de entrenamiento e inferencia de un DDPM en una libreta de Jupyter, ilustrando conceptos como el schedule de ruido, el denoising step a step y la perdida MSE sobre el ruido predicho, con un coste de computo minimo.
- Pruebas de integracion de `diffusers`: sirve como smoke test para verificar que un entorno con `diffusers`, `torch` y `safetensors` funciona correctamente antes de desplegar pipelines mas pesados, ya que el modelo ocupa apenas 0,1 GB.
- Generacion de datasets sinteticos de mariposas a baja resolucion: util para aumentar conjuntos de datos de clasificacion de insectos en tareas de prototipado rapido, aunque la calidad a 32x32 limita su uso a experimentos preliminares.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeno y rapido, permite medir latencia y throughput de un entorno de despliegue (GPU, CPU, contenedores) sin la variabilidad que introducen modelos grandes.
- Experimentacion con schedulers de difusion: el pipeline permite sustituir el scheduler por defecto (por ejemplo, DDIM, PNDM, Euler) para comparar la calidad y velocidad de muestreo sobre un modelo ligero y reproducible.
- Reproduccion de resultados academicos y ejercicios del curso: facilita replicar el ejemplo de la Unidad 1 de Diffusion Models Class y comparar variantes entrenadas por otros alumnos (existen multiples forks como `Naveen20o1/sd-class-butterflies-32` o `Ashish08/sd-class-butterflies-32`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FID, IS ni comparaciones cuantitativas con otros modelos. No se dispone de datos de latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el modelo tiene 18,5 millones de parametros y los pesos ocupan aproximadamente 0,1 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se ejecuta sin problemas en tarjetas integradas y en CPU.
- Cabe holgadamente en cualquier GPU consumer: GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en Apple Silicon mediante MPS.
- Opciones de despliegue: `diffusers` con PyTorch (CPU o CUDA), `DDPMPipeline` como interfaz principal. No se han publicado variantes GGUF ni soporte para llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia de milisegundos por imagen en GPU moderna y de decenas de milisegundos en CPU, pero estos valores no estan documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/Prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vitorino87/sd-class-butterflies-32 | 18,5 M | 32x32 | incondicional | MIT | Hugging Face |
| Naveen20o1/sd-class-butterflies-32 | no disponible | 32x32 | incondicional | MIT | Hugging Face |
| Ashish08/sd-class-butterflies-32 | no disponible | 32x32 | incondicional | MIT | Hugging Face |

Los tres modelos son variantes del mismo ejemplo del curso Diffusion Models Class, entrenadas de forma independiente por distintos usuarios. No se dispone de datos de rendimiento (FID, IS) que permitan una comparacion cuantitativa. No se identifican alternativas de proposito general comparables, ya que este modelo no compite con modelos de lenguaje ni con generadores de imagen condicionados por texto como Stable Diffusion.

## Limitaciones y advertencias

- Modelo de juguete: no es apto para produccion ni para generacion de imagenes de calidad; la resolucion de 32x32 es muy baja y el dominio esta restringido a mariposas.
- Generacion incondicional: no acepta prompts de texto, por lo que no se puede controlar el contenido, el estilo ni la composicion de la imagen generada.
- Sesgos: el dataset de entrenamiento (Smithsonian butterflies) puede sobrerrepresentar ciertas especies y estilos de fotografia; no se documenta ningun analisis de sesgos.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero el modelo puede generar imagenes de mariposas irreales o morfologicamente incorrectas, especialmente en las especies menos representadas.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el uso comercial del modelo en si es inviable por su calidad y dominio limitado.
- Caveat para produccion: no se han publicado evaluaciones de robustez, seguridad ni calidad; no debe desplegarse en un sistema orientado a usuarios finales.
- El modelo fue creado el 2026-11-07 y no registra descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vitorino87/sd-class-butterflies-32
- Repositorio del curso Diffusion Models Class: https://github.com/huggingface/diffusion-models-class
- Variante de Naveen20o1: https://huggingface.co/Naveen20o1/sd-class-butterflies-32
- Variante de Ashish08: https://huggingface.co/Ashish08/sd-class-butterflies-32
- Documentacion de DDPMPipeline en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Dataset Smithsonian butterflies subset: https://huggingface.co/datasets/huggan/smithsonian_butterflies_subset
