# zero1101001/wan22-fp8-t2v-loras-nsfw

## Resumen

`zero1101001/wan22-fp8-t2v-loras-nsfw` es un repositorio de adaptadores LoRA (Low-Rank Adaptation) entrenados sobre los modelos base WAN 2.2 de generacion texto-a-video (T2V) e imagen-a-video (I2V) de 14.000 millones de parametros. El autor, identificado como `zero1101001`, publica siete adaptadores especializados en secuencias de accion y estilos concretos, todos ellos orientados a contenido para adultos (NSFW). No se trata de un modelo autonomo, sino de pesos auxiliares que deben cargarse junto al modelo base WAN 2.2 correspondiente mediante la libreria `diffusers`.

El repositorio ocupa 2,8 GB y contiene unicamente ficheros `.safetensors` con los pesos de los LoRA, ademas de la model card. No incluye el modelo base, el VAE ni tokenizadores; el usuario debe obtenerlos por separado. La relevancia de esta publicacion es limitada fuera del nicho de generacion de video para adultos: no hay descargas ni interacciones registradas, no se aportan benchmarks y la documentacion tecnica es escasa, centrada en ejemplos de uso con `DiffusionPipeline`.

La ficha se limita a describir lo que el autor declara en la model card. Cualquier dato no confirmado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre transformer de difusion WAN 2.2 (T2V/I2V) |
| Parametros totales | No disponible (el modelo base WAN 2.2 es de 14B; los LoRA son adaptadores de rango 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 declarado para los adaptadores; FP8 mencionado en el nombre del repo, sin detalle tecnico |
| Idiomas soportados | No disponible |
| Licencia | `other` (sin texto de licencia publicado en la model card) |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

Los ficheros son adaptadores LoRA de rango 16 (variantes de 293 MB) y de rango superior (variantes de 586 MB), disenados para inyectarse en las capas de atencion de los transformers de difusion WAN 2.2 T2V 14B e I2V 14B. El autor declara entrenamiento en precision BF16 y organiza los adaptadores en dos ejes: por tipo de accion (tres acciones distintas, una de ellas con variante POV) y por programacion de ruido (`high` frente a `low`). Las variantes `high` se asocian a mayor creatividad y varianza entre generaciones; las `low`, a resultados mas consistentes y fieles.

No se especifica el numero de pasos de entrenamiento, el tamano del dataset, la composicion de las imagenes o videos de entrenamiento, ni si se aplicaron tecnicas como regularizacion, dropout o aumento de datos. Tampoco se documenta el proceso de captura ni los prompts utilizados. La model card menciona que WAN 2.2 ofrece "calidad de generacion mejorada frente a WAN 2.1", pero no aporta metricas que respalden la afirmacion.

## Capacidades

- Generacion de video a partir de texto (T2V) cuando se combina con el modelo base WAN 2.2 T2V 14B.
- Generacion de video a partir de una imagen de entrada (I2V) si se carga junto al modelo base I2V, aunque el autor advierte que los LoRA publicados son exclusivamente T2V.
- Control de secuencias de accion especificas mediante adaptadores dedicados (tres acciones distintas, una con perspectiva POV).
- Ajuste del equilibrio entre creatividad y consistencia mediante las variantes de ruido `high` y `low`.
- Aplicacion de un LoRA de estilo independiente para modificar la apariencia visual de la salida.
- Parametros de inferencia configurables: `num_inference_steps` (ejemplo con 50), `guidance_scale` (ejemplo con 7,5) y `num_frames` (ejemplo con 24).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- **Generacion de video para adultos en produccion de nicho**: el LoRA se carga sobre WAN 2.2 T2V 14B y se usa con prompts descriptivos para producir clips de 24 fotogramas a 8 fps. Es adecuado porque el adaptador esta entrenado especificamente para esas secuencias y reduce la necesidad de prompts muy detallados.
- **Prototipado rapido de escenas con control de camara**: la variante POV permite fijar un angulo de camara concreto sin describirlo en cada prompt, lo que acelera la iteracion sobre guiones graficos.
- **Pipeline de contenido con consistencia entre tomas**: las variantes `low` reducen la varianza entre generaciones, lo que resulta util cuando se necesita repetir una misma secuencia con pequenas variaciones de vestuario o iluminacion.
- **Exploracion creativa con alta diversidad**: las variantes `high` generan resultados mas dispares y sirven para fases de ideacion en las que se busca variedad de composiciones antes de fijar una toma definitiva.
- **Animacion de imagenes fijas (I2V)**: aunque los LoRA son T2V, el autor indica que pueden cargarse sobre el modelo I2V para animar una imagen de entrada; util para dar movimiento a fotografias o ilustraciones existentes.
- **Investigacion sobre adaptadores de bajo rango en difusion de video**: el repositorio sirve como ejemplo practico de como estructurar variantes de ruido y de rango en LoRA para modelos de video, independientemente del contenido.
- **Ajuste de estilo visual**: el LoRA de estilo permite modificar la apariencia de la salida sin reentrenar el modelo base, util para mantener una identidad visual coherente en una serie de clips.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base WAN 2.2 14B en BF16 requiere del orden de 28 GB solo para pesos, mas activaciones y VAE; en la practica se necesitan GPUs de 40-80 GB para inferencia comoda. Los LoRA anaden entre 293 MB y 586 MB por adaptador.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB o GPUs de consumo con 24 GB solo si se aplican tecnicas de offload o cuantizacion agresiva del modelo base (no documentadas por el autor).
- **GPU de consumo**: no cabe de forma nativa en RTX 4090 (24 GB) en BF16 sin `device_map="auto"` con offload a CPU o cuantizacion del base; el autor no detalla recetas para ello.
- **Despliegue**: el autor solo documenta `diffusers` con `DiffusionPipeline`, `AutoencoderKL` y `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video en este formato).
- **Latencia y throughput**: no disponibles. El ejemplo usa 50 pasos de inferencia y 24 fotogramas a 8 fps, pero no se indica tiempo por generacion ni hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zero1101001/wan22-fp8-t2v-loras-nsfw` | LoRA sobre base 14B | No disponible | LoRA T2V NSFW | `other` | Hugging Face, 0 descargas |
| WAN 2.2 T2V 14B (base) | 14B | No disponible | Difusion T2V | No disponible en esta ficha | Modelo base referenciado por el autor |
| WAN 2.1 (version anterior) | No disponible | No disponible | Difusion T2V/I2V | No disponible en esta ficha | Referenciado como predecesor |
| Otros LoRA comunitarios para WAN | Variable | No aplica | Adaptadores | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- **Contenido para adultos**: el repositorio esta explicitamente marcado como NSFW y restringido a mayores de 18 anos. Su uso puede infringir la legislacion de algunos paises y las politicas de plataformas de distribucion.
- **Riesgo legal y etico**: el autor prohibe la generacion de contenido no consentido y deepfakes, pero no se incluyen mecanismos tecnicos de moderacion ni filtros en los pesos.
- **Licencia ambigua**: la licencia figura como `other` sin texto publicado; no se aclaran los terminos de uso comercial, redistribucion ni atribucion. Esto es un riesgo relevante para produccion.
- **Dependencia del modelo base**: los LoRA no funcionan de forma autonoma; requieren WAN 2.2 T2V/I2V 14B y su VAE, cuyas licencias y disponibilidad no se detallan.
- **Documentacion insuficiente**: no hay informacion sobre datos de entrenamiento, numero de pasos, composicion del dataset ni evaluacion cuantitativa, lo que impide auditar sesgos o calidad.
- **Sesgos**: al entrenarse sobre contenido adulto especifico, los adaptadores probablemente reproducen sesgos de representacion corporal, genero y etnia del dataset, no documentados.
- **Alucinacion visual**: como todo modelo de difusion, puede generar artefactos anatomicos, incoherencias temporales entre fotogramas y fallos de perspectiva, especialmente con `num_frames` altos.
- **Idiomas**: no se especifica que idiomas entiende el prompt; se asume que hereda las capacidades del base WAN 2.2, sin confirmacion.
- **Sin soporte ni mantenimiento**: 0 descargas y 0 interacciones; no hay garantia de actualizaciones, issues atendidos ni compatibilidad futura con versiones de `diffusers`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zero1101001/wan22-fp8-t2v-loras-nsfw
- Modelo base WAN 2.2 T2V 14B: no disponible en la informacion proporcionada
- Modelo base WAN 2.2 I2V 14B: no disponible en la informacion proporcionada
- Paper o blog de WAN 2.2: no disponible en la informacion proporcionada
- Documentacion de `diffusers` para LoRA: no disponible en la informacion proporcionada
