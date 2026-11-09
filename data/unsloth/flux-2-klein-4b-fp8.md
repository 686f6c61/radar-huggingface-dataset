# unsloth/FLUX.2-klein-4B-FP8

## Resumen

FLUX.2-klein-4B-FP8 es una version cuantizada a FP8 e INT8 del modelo de difusion FLUX.2-klein-4B desarrollado por Black Forest Labs, publicada por Unsloth. El modelo base es un transformer de flujo rectificado (rectified flow transformer) de 4.000 millones de parametros que unifica generacion de imagen a partir de texto (text-to-image) y edicion de imagen con multiples referencias (multi-reference image-to-image) en una sola arquitectura compacta. Esta version cuantizada reduce la huella de memoria para inferencia manteniendo la fidelidad visual respecto al modelo original en bf16, con valores LPIPS de 0.123 para INT8 y 0.104 para FP8 a misma semilla.

La relevancia de este lanzamiento reside en su eficiencia: la familia FLUX.2 [klein] esta disenada para inferencia en menos de un segundo y para ejecutarse en hardware de consumo con tan solo 13 GB de VRAM, lo que la situa en el terreno del desarrollo local, el despliegue en el edge y los flujos de trabajo interactivos. La cuantizacion de Unsloth anade una capa adicional de optimizacion de memoria sin requerir cambios en el pipeline de uso.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y esta disponible como un unico archivo de difusion (diffusion-single-file) compatible con Diffusers y ComfyUI. Su soporte linguistico declarado es unicamente el ingles, y el pipeline principal registrado es image-to-image, aunque tambien cubre text-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | FP8, INT8 (el repo incluye ambas variantes; modelo base en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | diffusion-single-file (archivo unico; pesos cuantizados FP8/INT8) |
| Tamano del repo | 25.1 GB |
| Pipeline | image-to-image (tambien text-to-image) |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Resolucion de ejemplo | 1024x1024 |
| Pasos de inferencia (ejemplo) | 4 |
| Guidance scale (ejemplo) | 1.0 |

## Arquitectura y entrenamiento

El modelo base FLUX.2-klein-4B es un transformer de flujo rectificado de 4.000 millones de parametros que combina generacion y edicion de imagen en una unica arquitectura. Segun la model card, se trata de un modelo destilado, disenado para generar imagenes en menos de un segundo de extremo a extremo, lo que lo orienta a cargas de trabajo interactivas y de baja latencia. Soporta text-to-image, edicion de imagen y edicion con multiples referencias dentro del mismo modelo.

La version publicada por Unsloth aplica cuantizacion FP8 e INT8 sobre los pesos del modelo base para reducir el consumo de memoria durante la inferencia. La model card reporta la metrica LPIPS a misma semilla frente al modelo en bf16 (menor es mejor): 0.123 para INT8 y 0.104 para FP8, lo que cuantifica la degradacion perceptiva introducida por la cuantizacion. No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo de difusion, estos conceptos no aplican de la misma forma que en modelos de lenguaje.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con resoluciones de ejemplo de 1024x1024.
- Edicion de imagen (image-to-image) y edicion con multiples referencias (multi-reference editing) en un unico modelo.
- Generacion rapida: disenado para inferencia en menos de un segundo de extremo a extremo, con ejemplos de 4 pasos de inferencia.
- Renderizado de texto dentro de la imagen, aunque la model card advierte que el texto puede ser inexacto o sufrir distorsiones.
- Ejecucion en hardware de consumo (a partir de ~13 GB de VRAM).
- Cuantizacion FP8 e INT8 para reducir la huella de memoria.
- Soporte en Diffusers mediante `Flux2KleinPipeline` y en ComfyUI.
- Disponibilidad via API de BFL.
- No soporta tool calling ni razonamiento multi-paso: es un modelo generativo de imagenes, no un modelo de lenguaje.

## Casos de uso

- Generacion interactiva de imagenes en aplicaciones creativas: gracias a su inferencia sub-segundo y a los pocos pasos necesarios (4 en el ejemplo), el modelo permite flujos de trabajo donde el usuario itera prompts y ve resultados casi en tiempo real.
- Edicion de imagenes en produccion: el soporte de image-to-image y multi-reference permite modificar imagenes existentes manteniendo coherencia con referencias, util para retoque automatizado, sustitucion de fondos o variaciones de producto.
- Despliegue local y en el edge: con un requisito de ~13 GB de VRAM y cuantizacion FP8/INT8, puede ejecutarse en GPUs de consumo como RTX 3090/4070, adecuado para herramientas de escritorio o entornos sin conectividad.
- Generacion de material visual para marketing y e-commerce: creacion de variaciones de imagenes de producto a partir de referencias multiples, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Prototipado rapido en pipelines de CI/CD de equipos de vision: al integrarse en Diffusers y ComfyUI y disponer de un archivo unico de pesos, facilita la automatizacion de pruebas de generacion y comparacion de salidas.
- Aplicaciones de baja latencia en servidores: la combinacion de inferencia sub-segundo y pesos cuantizados reduce coste de GPU por peticion, util para servicios de generacion de imagen bajo demanda.
- Desarrollo de asistentes creativos integrados: al unificar generacion y edicion, un mismo modelo puede cubrir tanto la creacion desde cero como la modificacion guiada por referencias dentro de una misma aplicacion.

## Benchmarks y rendimiento

La model card unicamente reporta la metrica LPIPS a misma semilla frente al modelo bf16, que mide la fidelidad perceptiva tras la cuantizacion:

| Variante | LPIPS vs bf16 (menor es mejor) |
|---|---|
| INT8 | 0.123 |
| FP8 | 0.104 |
| bf16 (referencia) | 0.000 (referencia) |

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base requiere aproximadamente 13 GB de VRAM segun la model card; las variantes FP8/INT8 reducen la huella respecto al bf16.
- GPU recomendadas: RTX 3090, RTX 4070 y superiores para ejecucion en consumo; no se especifican requisitos de A100/H100 en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con al menos ~13 GB de VRAM (RTX 3090/4070 segun la model card).
- Opciones de despliegue: Diffusers (`Flux2KleinPipeline`), ComfyUI y la API de BFL. No se mencionan vLLM, llama.cpp ni Ollama (no aplicables a un modelo de difusion de este tipo en la informacion disponible).
- Latencia y throughput: la model card indica inferencia en menos de un segundo de extremo a extremo, sin cifras concretas de throughput por GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables (parametros, contexto, rendimiento, licencia y disponibilidad) para establecer una tabla fiable. Los unicos modelos relacionados citados son el propio FLUX.2-klein-4B en bf16 (modelo base, mismo tamano y licencia, sin cuantizar) y la variante INT8 publicada por el mismo autor; ambos comparten arquitectura y difieren en precision y huella de memoria.

## Limitaciones y advertencias

- El modelo no esta destinado ni es capaz de proporcionar informacion factual.
- El texto renderizado en las imagenes puede ser inexacto o sufrir distorsiones.
- Como modelo estadistico, puede representar o amplificar sesgos presentes en los datos de entrenamiento.
- Puede no generar salidas que coincidan con los prompts; el seguimiento de instrucciones depende en gran medida del estilo del prompt.
- La cuantizacion introduce degradacion perceptiva medible (LPIPS 0.123 en INT8 y 0.104 en FP8 frente a bf16).
- Soporte linguistico limitado al ingles.
- Usos fuera de alcance segun la model card: violar la ley, explotar o danar a menores, generar contenido enganoso o fraudulento, difundir informacion personal identificable que pueda danar a individuos, acosar o amenazar, crear imagenes intimas no consentidas o contenido pornografico ilegal, y toma de decisiones totalmente automatizadas o de alto riesgo.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las restricciones de uso fuera de alcance indicadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/unsloth/FLUX.2-klein-4B-FP8
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de BFL: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
- Repositorio GitHub de FLUX.2: https://github.com/black-forest-labs/flux2
- Unsloth GitHub: https://github.com/unslothai/unsloth/
- Documentacion de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Diffusers: https://github.com/huggingface/diffusers
- API de BFL: https://bfl.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
