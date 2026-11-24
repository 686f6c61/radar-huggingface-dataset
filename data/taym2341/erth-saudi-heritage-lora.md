# taym2341/erth-saudi-heritage-lora

## Resumen

Erth (إرث, "herencia" en arabe) es un adaptador LoRA para el modelo de difusion texto-a-imagen Stable Diffusion v1.5, especializado en arquitectura patrimonial saudita: estilos najdi, hiyazi y asiri. Lo desarrolla un equipo de seis personas identificadas en la model card (taym2341 como autor del repositorio en Hugging Face) y esta pensado para generar imagenes de palacios de adobe, fachadas con celosias de madera, torres de piedra y otros elementos vernaculos de la peninsula arabiga que los modelos genericos de difusion rara vez representan con fidelidad.

Se distribuye como pesos de adaptador cargables sobre `stable-diffusion-v1-5/stable-diffusion-v1-5` mediante `diffusers`, con un token de instancia (`erth_saudi_arch`) que activa el estilo aprendido. El modelo base es un UNet de difusion latente de aproximadamente 860 millones de parametros con un text encoder CLIP ViT-L/14; el LoRA anade un conjunto reducido de matrices de bajo rango sobre las capas de atencion y proyeccion, de modo que el coste de inferencia es practicamente identico al del modelo base.

Su relevancia es acotada pero clara: cubre un nicho cultural concreto (documentacion visual y divulgacion del patrimonio arquitectonico saudita) con una licencia CC BY-SA 4.0 que permite uso comercial con atribucion y compartir igual. El repositorio no incluye pesos en el momento de la consulta (tamano de 0.0 GB) ni datos de entrenamiento, benchmarks o demos publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de difusion latente de Stable Diffusion v1.5; text encoder CLIP ViT-L/14 |
| Parametros totales | No disponible (el LoRA es un adaptador; el modelo base SD v1.5 tiene ~860 M en el UNet y ~123 M en el text encoder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el prompt de texto de CLIP se trunca a 77 tokens |
| Tipos de cuantizacion | No especificado por el autor; al ser un LoRA sobre SD v1.5, hereda las opciones del modelo base (fp16, fp32; el base admite variantes GGUF/ONNX de la comunidad, no confirmadas para este adaptador) |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | No disponible (el repositorio figura con 0.0 GB; se espera formato `diffusers`/safetensors para `load_lora_weights`, sin confirmar) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Stable Diffusion v1.5, un modelo de difusion latente compuesto por un autoencoder VAE, un UNet con bloques de atencion cruzada y un text encoder CLIP. El LoRA introduce matrices de descomposicion de bajo rango en capas seleccionadas del UNet (y previsiblemente del text encoder), lo que permite inyectar el concepto visual sin reentrenar el modelo completo. El token de instancia declarado es `erth_saudi_arch`, que debe preceder al prompt para activar el estilo.

No se han publicado en la informacion disponible datos sobre el dataset de entrenamiento (numero de imagenes, resolucion, composicion por estilo najdi/hiyazi/asiri), la configuracion de entrenamiento (rango del LoRA, learning rate, pasos, optimizer), ni si se aplicaron tecnicas como captions automaticos, regularizacion con imagenes de clase o aumento de datos. Tampoco hay informacion sobre evaluacion cuantitativa o cualitativa del adaptador.

## Capacidades

- Generacion de imagenes texto-a-imagen de arquitectura patrimonial saudita en tres estilos regionales: najdi (adobe y motivos geometricos del centro de Arabia), hiyazi (fachadas costeras con celosias de madera y cornisas talladas) y asiri (torres de piedra apilada y decoracion geometrica del suroeste).
- Activacion mediante el token de instancia `erth_saudi_arch`, combinable con descripciones en ingles o arabe.
- Estilizacion y variacion: al ser un LoRA, permite ajustar su peso (`scale`) para mezclar el estilo patrimonial con el estilo generico del modelo base.
- Compatibilidad con el ecosistema `diffusers`: carga via `load_lora_weights`, fusion con otros LoRA y uso con pipelines de SD v1.5 (img2img, inpainting, ControlNet) siempre que el pipeline acepte el adaptador.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento; es un modelo puramente generativo de imagen.

## Casos de uso

- Documentacion y divulgacion patrimonial: generar ilustraciones de referencia de palacios najdi o casas torre asiri para articulos, museos o materiales educativos, usando el token `erth_saudi_arch` junto a descripciones arquitectonicas detalladas.
- Conceptualizacion arquitectonica: explorar variaciones de fachadas y volumetrias inspiradas en la arquitectura vernacula saudita antes de pasar a modelado CAD, con iteracion rapida sobre prompts.
- Diseno de interiores y paisajismo tematico: producir imagenes de patios, muros de adobe y celosias para propuestas de rehabilitacion o ambientacion de espacios con identidad local.
- Material editorial y turistico: ilustraciones para guias de viaje, folletos y campanas de promocion del turismo cultural saudita, con la licencia CC BY-SA 4.0 permitiendo uso comercial con atribucion.
- Prototipado de videojuegos y experiencias inmersivas: generar assets visuales de arquitectura historica para entornos 3D o narrativas interactivas ambientadas en la peninsula arabiga.
- Investigacion en generacion culturalmente especifica: servir como caso de estudio de LoRA de nicho para evaluar sesgos y fidelidad de modelos de difusion en arquitecturas no occidentales.
- Educacion y talleres: demostrar el flujo de `diffusers` con adaptadores LoRA en cursos de IA generativa aplicada al patrimonio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ejecutarse sobre SD v1.5, el consumo es el del modelo base. En fp16, aproximadamente 4-6 GB de VRAM para generar a 512x512; el adaptador LoRA anade solo unos pocos MB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100 o H100 para generacion por lotes a gran escala.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 6 GB de VRAM en fp16; con 4 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: `diffusers` (flujo documentado por el autor), Automatic1111/Forge y ComfyUI si el adaptador se exporta o carga como LoRA compatible; llama.cpp/Ollama no aplican (no es un modelo de lenguaje). vLLM y TGI tampoco son adecuados para difusion.
- Latencia y throughput: no disponibles para este adaptador; dependen del modelo base y de la GPU (tipicamente decenas de pasos por imagen, del orden de segundos en GPU de consumo).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/prompt | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Erth Saudi Heritage LoRA | LoRA de difusion | SD v1.5 | 77 tokens CLIP | ar, en | CC BY-SA 4.0 | Repositorio HF sin pesos publicados (0.0 GB) |
| SD v1.5 (base) | Difusion completa | - | 77 tokens CLIP | en (principalmente) | CreativeML OpenRAIL-M | Ampliamente disponible |
| SDXL | Difusion completa | - | 77 tokens por encoder (doble) | en (principalmente) | CreativeML OpenRAIL++-M | Ampliamente disponible |
| LoRA de arquitectura islamica genericos (comunidad) | LoRA de difusion | SD v1.5 / SDXL | 77 tokens | en | Variable | Variable en HF |

No se dispone de datos de rendimiento comparativo para este adaptador frente a alternativas; la comparacion se limita a caracteristicas tecnicas y licencia.

## Limitaciones y advertencias

- El repositorio figura con 0.0 GB en el momento de la consulta: no hay garantia de que los pesos del adaptador esten efectivamente publicados y descargables.
- No se documenta el dataset de entrenamiento, por lo que no es posible evaluar cobertura, calidad ni posibles sesgos de representacion entre los estilos najdi, hiyazi y asiri.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos arquitectonicos plausibles pero historicamente inexactos; no debe usarse como fuente documental sin verificacion por especialistas.
- Herencia de sesgos de SD v1.5: sesgos de representacion en personas, genero y cultura del modelo base, ademas de posibles problemas de calidad anatomica.
- Limitacion de idioma: el text encoder CLIP de SD v1.5 esta entrenado principalmente en ingles; los prompts en arabe pueden rendir peor que en ingles, pese a que el autor declara soporte para `ar`.
- Ventana de prompt de 77 tokens: descripciones arquitectonicas largas se truncan.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir bajo la misma licencia las obras derivadas; conviene revisar la compatibilidad con la licencia del modelo base (CreativeML OpenRAIL-M) en despliegues productivos.
- Sin benchmarks ni demos publicadas: no hay evidencia cuantitativa de calidad frente a otros LoRA de tematica similar.

## Enlaces

- Hugging Face: https://huggingface.co/taym2341/erth-saudi-heritage-lora
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Documentacion de `diffusers` para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
