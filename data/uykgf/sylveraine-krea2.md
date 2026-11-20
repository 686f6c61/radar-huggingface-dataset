# uykgf/sylveraine-krea2

## Resumen

Sylveraine-krea2 es un LoRA de tipo DreamBooth para el modelo de difusion Krea 2, desarrollado por el usuario uykgf y publicado en Hugging Face bajo licencia Apache 2.0. Su funcion es incorporar un concepto visual concreto, invocado mediante el token `sylveraine`, que representa un personaje anime femenino con atributos muy definidos: coletas onduladas de color verde salvia, gafas ovaladas, tocado de doncella con volantes, ornamentos de cruz y vestido gotico en negro y marfil. El repositorio ocupa 0,2 GB y se distribuye en formato compatible con la libreria diffusers.

El modelo se entrena sobre Krea 2 RAW y se muestra en la model card funcionando sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. No se trata de un modelo base autonomo, sino de un adaptador de bajo rango que debe cargarse sobre el pipeline `Krea2Pipeline` para generar imagenes. Es relevante para quienes necesitan reproducir un personaje concreto de forma consistente en flujos de generacion texto-a-imagen, ya que los LoRA de personaje permiten fijar identidad visual sin reentrenar el modelo completo.

La informacion disponible es escasa: no se detallan parametros del LoRA, numero de imagenes de entrenamiento, hiperparametros ni resultados cuantitativos. Todo lo que sigue se limita a lo que figura en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es Krea 2 (arquitectura del base no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud de prompt maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con diffusers (el repositorio ocupa 0,2 GB); no se indica si incluye safetensors o GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con la tecnica DreamBooth sobre Krea 2 RAW, segun indica la model card. DreamBooth es un metodo de ajuste fino que asocia un token unico (`sylveraine`) a un sujeto concreto a partir de un conjunto reducido de imagenes de referencia, de modo que el modelo base aprenda a reproducir ese sujeto en nuevas composiciones. Al ser un LoRA, solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, lo que explica el tamano reducido del repositorio (0,2 GB) frente al modelo completo.

No se especifica el numero de imagenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset. Tampoco se documenta si hubo regularizacion con imagenes de clase ni tecnicas adicionales como prior preservation. La model card indica que las muestras se generaron sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, lo que sugiere que el adaptador es compatible tanto con la variante RAW como con la Turbo del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `sylveraine`, que activa el concepto del personaje entrenado.
- Reproduccion consistente de atributos concretos del personaje: coletas verdes onduladas, gafas ovaladas, tocado de doncella, ornamentos de cruz, pendientes y vestido gotico.
- Composicion de escenas variadas: la model card muestra un cuerpo entero sobre fondo gris liso y un retrato de medio cuerpo en un jardin, lo que indica cierta flexibilidad de encuadre y entorno.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers mediante `load_lora_weights`.
- Funcionamiento con pocos pasos de inferencia sobre Krea 2 Turbo (8 pasos en los ejemplos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por tratarse de un modelo de generacion de imagenes.

## Casos de uso

- Ilustracion de personaje consistente para narrativa visual: usar el token `sylveraine` junto con descripciones de escena para generar paneles de un comic o webtoon manteniendo la identidad del personaje entre viñetas.
- Creacion de hojas de referencia de personaje: generar vistas de cuerpo entero sobre fondo neutro, como en el ejemplo de la model card, para documentar el diseno antes de producir arte final.
- Prototipado rapido de arte conceptual: iterar sobre encuadres y entornos (retrato en jardin, cuerpo completo) con 8 pasos sobre Krea 2 Turbo para explorar variaciones en pocos segundos por imagen.
- Generacion de avatares y retratos para comunidades o proyectos personales: el LoRA fija los rasgos del personaje y permite variar iluminacion, vestuario y fondo mediante el prompt.
- Integracion en pipelines de diffusers: cargar el adaptador con `pipe.load_lora_weights` dentro de un script Python para produccion por lotes de imagenes del personaje.
- Material promocional de un proyecto creativo: generar ilustraciones del personaje para portadas, banners o fichas de presentacion manteniendo coherencia visual entre piezas.
- Experimentacion con tecnicas LoRA/DreamBooth: servir como ejemplo practico de adaptador de personaje sobre Krea 2 para quienes estudian ajuste fino de modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye dos imagenes de muestra generadas con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`; no hay metricas cuantitativas como FID, CLIP score ni evaluaciones de similitud de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA; depende enteramente del modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. La model card solo menciona ejecucion en CUDA (`torch_dtype=torch.bfloat16`, `.to("cuda")`) sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Krea 2, no documentado aqui.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights` es el unico metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este adaptador de difusion).
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron con 8 pasos de inferencia sobre Krea 2 Turbo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de personaje para Krea 2 ni datos de rendimiento que permitan una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- La informacion tecnica es muy limitada: no se documentan hiperparametros de entrenamiento, numero de imagenes, rango del LoRA ni evaluaciones cuantitativas, lo que dificulta estimar su robustez en produccion.
- Al ser un LoRA de personaje, su calidad depende del modelo base Krea 2; cambios de version o de variante (RAW frente a Turbo) pueden alterar los resultados.
- Riesgo de sobreajuste al conjunto de entrenamiento: sin datos sobre regularizacion, no puede descartarse que el concepto se reproduzca bien solo en encuadres y estilos similares a los de las muestras.
- El token `sylveraine` es necesario para invocar el concepto; prompts sin el token probablemente no reproduzcan el personaje.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; como todo modelo de generacion de imagenes, puede reproducir sesgos presentes en los datos del modelo base.
- Riesgo de alucinacion visual: el modelo puede generar detalles anatomicos o de vestuario incoherentes, especialmente en cuerpos completos o composiciones complejas.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso comercial del modelo base Krea 2 esta sujeto a su propia licencia, que no se detalla en la informacion disponible.
- Los idiomas soportados para los prompts no se especifican; los ejemplos estan en ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/uykgf/sylveraine-krea2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo del modelo base (mencionada en la model card): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
