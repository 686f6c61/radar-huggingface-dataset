# tmllabres/sd-v1-4-lora-ilustraciones-antiguas

## Resumen

`tmllabres/sd-v1-4-lora-ilustraciones-antiguas` es un adaptador LoRA (PEFT) para el modelo de difusion latente `CompVis/stable-diffusion-v1-4`, entrenado para generar imagenes con la estetica de los grabados y litografias de libros antiguos. No es un modelo autonomo: requiere descargar los pesos base de SD v1.4 y cargar el adaptador encima mediante `pipe.load_lora_weights()`. Lo publica el usuario tmllabres como entrega final del modulo *Modelos de Generacion de Imagen* del Master en IA, Cloud Computing y DevOps (Pontia).

El adaptador se entrena sobre 1000 imagenes del dataset `gigant/oldbookillustrations`, usando las columnas `1600px` (imagen) e `info_alt` (texto descriptivo). La configuracion es deliberadamente ligera: rango LoRA r=8, alpha=8, 750 pasos totales (3 epocas con batch 4), learning rate 1e-4 con scheduler coseno, fp16 y gradient checkpointing. El entrenamiento completo declara 9,2 minutos en una NVIDIA GeForce RTX 5060 Ti, lo que lo convierte en un ejemplo practico de ajuste fino de bajo coste.

Su relevancia es acotada pero util: demuestra que un estilo grafico concreto se puede capturar con un adaptador de pocos megabytes y menos de diez minutos de GPU, sin reentrenar la UNet completa. Para quien necesite ilustracion editorial de epoca, es un punto de partida barato; para produccion, conviene tener en cuenta que no hay benchmarks, que el repositorio registra 0 descargas y que el tamano declarado del repo es 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre difusion latente Stable Diffusion v1.4 (UNet + VAE + codificador de texto CLIP ViT-L/14) |
| Parametros totales | No disponible. El adaptador usa r=8 y alpha=8 sobre los modulos `to_k`, `to_q`, `to_v` y `to_out.0`; el autor no publica el recuento de parametros entrenables. Los pesos base de SD v1.4 son externos al repositorio |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador. El codificador de texto CLIP de SD v1.4 limita el prompt a 77 tokens (caracteristica de la arquitectura base) |
| Tipos de cuantizacion | No disponible. El autor solo documenta entrenamiento en fp16; no se publican variantes GGUF, ONNX ni int8 |
| Idiomas soportados | No disponible. El unico prompt de ejemplo esta en ingles y el codificador CLIP de SD v1.4 esta entrenado predominantemente en ingles |
| Licencia | `creativeml-openrail-m` (CreativeML OpenRAIL-M) |
| Formato de pesos | No declarado explicitamente. Se distribuye como adaptador PEFT cargable con la libreria `diffusers` (`load_lora_weights`); el tamano del repo figura como 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se engancha a los modulos de proyeccion de atencion de la UNet de Stable Diffusion v1.4 (`to_k`, `to_q`, `to_v` y `to_out.0`), con rango r=8 y alpha=8. Esto mantiene congelados los pesos base y anade matrices de bajo rango, de modo que el estilo aprendido se puede activar, desactivar o combinar con otros adaptadores en tiempo de inferencia. No se documenta ningun cambio en el VAE, en el codificador de texto ni en el scheduler de muestreo: la innovacion es exclusivamente el ajuste de estilo, no arquitectonica.

El entrenamiento usa 1000 pares imagen-texto del dataset `gigant/oldbookillustrations` (columna `1600px` para la imagen e `info_alt` para la descripcion). El preprocesado redimensiona por el lado corto a 512 px, aplica recorte central de 512x512 y volteo horizontal como aumento de datos. Se ejecutan 3 epocas, 750 pasos en total, batch de 4 sin acumulacion de gradientes, learning rate 0,0001 con scheduler coseno y 50 pasos de warmup, en fp16 con gradient checkpointing. No se menciona RLHF, DPO ni preferencias humanas (no aplica en difusion), ni tecnicas como DreamBooth, textual inversion o prior preservation. El tiempo declarado es de 9,2 minutos en una RTX 5060 Ti.

## Capacidades

- Generacion de imagen texto-a-imagen con estetica de grabado, xilografia y litografia de libros antiguos, mediante `StableDiffusionPipeline` de `diffusers`.
- Transferencia de estilo aprendida sobre la UNet de SD v1.4: se aplica a cualquier prompt que describa una escena, y el estilo lo aporta el adaptador.
- Carga y descarga dinamica del adaptador (`load_lora_weights` / `unload_lora_weights`), lo que permite alternar estilos sin recargar el modelo base.
- Posible combinacion con otros adaptadores LoRA compatibles con SD 1.x y con pipelines derivados (img2img, inpainting); no validado en la informacion disponible.
- Escalado del efecto mediante el parametro de escala del adaptador (alpha/r = 1 por defecto segun la configuracion declarada).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo multimodal de entrada: no procesa imagenes como prompt, solo texto.
- No genera texto, codigo ni respuestas conversacionales.

## Casos de uso

- Ilustracion editorial de epoca: generar grabados para portadas, capitulares y paginas interiores de reediciones de clasicos, con prompts descriptivos en ingles y 30 pasos de inferencia como en el ejemplo del autor.
- Humanidades digitales y divulgacion historica: producir imagenes de ambientacion decimononica para articulos, fichas de museo o exposiciones virtuales, ajustando la escala del LoRA para modular la intensidad del estilo.
- Prototipado rapido para diseno grafico: iterar decenas de variantes de una ilustracion en una GPU de consumo antes de encargar la version final a un ilustrador, reduciendo el coste de exploracion.
- Material para juegos de rol y ambientacion historica: generar retratos, barcos, utensilios y escenas costumbristas coherentes con una estetica de grabado antiguo para manuales y cartas.
- Aumento de datos y referencia visual: crear un banco de imagenes de estilo homogeneo para entrenar clasificadores de estilo o para entrenar un segundo adaptador sobre el propio estilo.
- Educacion y docencia: usar el repositorio como caso practico reproducible de fine-tuning PEFT en un curso de generacion de imagen, dado el bajo coste (9,2 minutos de GPU) y la simplicidad del pipeline.
- Contenido para podcast y video de divulgacion: generar miniaturas y recursos graficos con identidad visual consistente sin depender de bancos de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta una comparacion cualitativa "antes / despues" mediante la imagen `antes_despues.png` del repositorio, generada con el mismo prompt y la misma semilla.

Los unicos datos cuantitativos publicados son los de entrenamiento:

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 750 (3 epocas) |
| Ejemplos de entrenamiento | 1000 |
| Batch efectivo | 4 |
| Learning rate | 0,0001 (coseno, warmup 50) |
| Precision | fp16 con gradient checkpointing |
| Hardware de entrenamiento | NVIDIA GeForce RTX 5060 Ti |
| Tiempo de entrenamiento | 9,2 minutos |
| Pasos de inferencia en el ejemplo | 30 |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada para el adaptador. Para la base SD v1.4 en fp16 se suele necesitar del orden de 4 GB de VRAM con el pipeline completo cargado; el adaptador anade unos pocos megabytes. Cifra orientativa de la arquitectura base, no verificada en la model card.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Validas RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100. El autor entreno en una RTX 5060 Ti.
- Cabe en GPU de consumo: si, con cuantizacion fp16 y atencion eficiente; con `enable_attention_slicing()` o `enable_model_cpu_offload()` se reduce aun mas el pico de memoria.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` + `load_lora_weights()` (ruta documentada por el autor); ComfyUI y Automatic1111/Forge como frontends habituales para LoRA de SD 1.x; `fuse_lora()` para integrar el adaptador en los pesos y eliminar la sobrecarga en inferencia.
- No aplica: vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, por tratarse de un modelo de difusion y no de un modelo de lenguaje.
- Latencia y throughput: no disponibles. El ejemplo del autor ejecuta 30 pasos de inferencia sin reportar tiempos.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros adaptadores LoRA publicos especificamente entrenados para ilustracion de libros antiguos, por lo que la comparacion directa de estilos no esta disponible. La tabla compara con las arquitecturas base de la misma familia; los datos de parametros de esas bases son externos a la model card y se incluyen como referencia de contexto.

| Modelo | Tipo | Parametros | Prompt maximo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`sd-v1-4-lora-ilustraciones-antiguas`) | LoRA sobre SD v1.4 | No disponible (r=8, alpha=8) | 77 tokens (hereda de CLIP) | CreativeML OpenRAIL-M | HuggingFace, 0 descargas, 0 likes |
| `CompVis/stable-diffusion-v1-4` | Difusion latente completa | ~1.000 M en UNet + codificador de texto (dato externo) | 77 tokens | CreativeML OpenRAIL-M | Ampliamente disponible |
| SDXL 1.0 | Difusion latente con doble codificador de texto | ~2.600 M en UNet + codificadores (dato externo) | 77 tokens por codificador | CreativeML OpenRAIL++-M | Ampliamente disponible |
| Stable Diffusion 2.1 | Difusion latente completa | ~865 M en UNet (dato externo) | 77 tokens | CreativeML OpenRAIL++-M | Ampliamente disponible |

Diferencias clave frente a SDXL o SD 2.1: este adaptador trabaja a 512x512 y depende de una base de 2022, por lo que la calidad fotografica y el seguimiento de prompts largos son inferiores; a cambio, el coste de inferencia y de entrenamiento es mucho menor y el estilo queda encapsulado en un fichero de pocos megabytes.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: 1000 imagenes y 750 pasos. Es esperable un ajuste fuerte al dataset, con repertorio limitado de composiciones y riesgo de reproducir motivos concretos de las imagenes de entrenamiento.
- Sesgo estilistico y tematico: el dataset `gigant/oldbookillustrations` no se describe en la informacion disponible; es probable que concentre ilustracion occidental de los siglos XVIII-XIX, con diversidad limitada de sujetos, generos y culturas.
- Idioma: el prompt de ejemplo esta en ingles y el codificador CLIP de SD v1.4 rinde peor fuera del ingles. No hay evidencia de comportamiento correcto con prompts en castellano.
- Alucinacion visual: al ser un modelo pequeno a 512x512, son frecuentes los artefactos en manos, rostros, texto y arquitecturas, y las perspectivas incoherentes.
- Licencia: CreativeML OpenRAIL-M permite uso comercial pero impone restricciones de uso (Anexo A) y obliga a propagar las mismas restricciones a los usuarios posteriores. Conviene revisar el texto completo antes de distribuir el modelo o sus derivados.
- Propiedad intelectual del dataset: no se documenta la procedencia ni la licencia de las 1000 ilustraciones originales. Si no son de dominio publico, el uso comercial del estilo y de las salidas puede ser problematica.
- Dependencia de la base: no es un modelo autonomo; hay que descargar los pesos de SD v1.4 (varios GB) y aceptar su licencia.
- Falta de validacion externa: 0 descargas y 0 likes en el momento de la consulta. El tamano del repo figura como 0,0 GB, por lo que conviene verificar que los ficheros de pesos estan realmente presentes antes de integrarlo.
- Mezcla con otros LoRA: no se documenta el comportamiento al combinarlo con otros adaptadores; pueden aparecer conflictos de estilo o saturacion cromatica.
- Sin control espacial: no hay ControlNet, IP-Adapter ni mascaras documentadas; la composicion solo se guia por prompt y semilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tmllabres/sd-v1-4-lora-ilustraciones-antiguas
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Imagen de comparacion antes/despues citada en la model card: `antes_despues.png` (dentro del repositorio del modelo)
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas genericas de ChatGPT (chatgpt.com, openai.com) y no guardan relacion con este adaptador, por lo que no se incluyen como referencias. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
