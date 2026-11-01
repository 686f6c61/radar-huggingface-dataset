# whymustyouknow/yuki

## Resumen

Yuki es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario whymustyouknow. El adaptador se entrena sobre los pesos de Krea-2-Raw y se presenta en la model card con ejemplos generados sobre Krea-2-Turbo, la variante destilada de pocos pasos del mismo modelo base. Su funcion es inyectar un concepto visual concreto, invocado mediante el token `yuk1`, en el pipeline de generacion de imagenes de Krea 2.

El repositorio es de caracter monousuario y muy reciente (creado el 1 de noviembre de 2026), con cero descargas y cero likes en el momento de redactar esta ficha. El tamano del repositorio es de 1,6 GB, coherente con un adaptador LoRA de rango moderado almacenado en precision de 16 o 32 bits, aunque no se especifica el rango ni el numero de parametros entrenados.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion: se trata de un adaptador de personalizacion de un modelo base propietario o de acceso restringido (Krea 2), con documentacion minima y sin datos de entrenamiento, benchmarks ni evaluaciones publicadas. Su interes practico reside en servir como ejemplo del flujo de trabajo DreamBooth-LoRA sobre la familia Krea 2 y en documentar el formato de invocacion mediante token disparador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre un modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica la longitud maxima del prompt) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en el formato nativo de diffusers; se infiere bfloat16 por el ejemplo de carga, sin confirmacion) |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato nativo de la libreria diffusers) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA sobre el modelo base Krea-2-Raw, segun los metadatos `base_model:krea/Krea-2-Raw` y `base_model:adapter:krea/Krea-2-Raw`. La model card lo describe explicitamente como un "DreamBooth-LoRA", lo que implica un entrenamiento de personalizacion supervisado sobre un conjunto reducido de imagenes de un unico concepto, con el token `yuk1` como disparador. No se especifican el rango de la descomposicion LoRA, el valor de alpha, la tasa de aprendizaje, el numero de pasos, el tamano del dataset ni la resolucion de entrenamiento.

No hay informacion sobre la composicion del dataset de entrenamiento, el numero de imagenes utilizadas, el uso de tecnicas de regularizacion (prior preservation), ni sobre si se aplicaron etapas de refinamiento. Tampoco se documenta el impacto del adaptador sobre los pesos del modelo base ni se publican pesos fusionados. El unico dato tecnico verificable es que los ejemplos de la model card se generaron sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que confirma la compatibilidad del adaptador con la variante destilada del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token disparador `yuk1`, que activa el concepto aprendido.
- Personalizacion de un concepto visual concreto (apariencia de personaje) sobre el modelo base Krea 2.
- Compatibilidad con el pipeline `Krea2Pipeline` de la libreria diffusers mediante `load_lora_weights`.
- Funcionamiento tanto sobre Krea-2-Raw (modelo de referencia) como sobre Krea-2-Turbo (variante destilada de 8 pasos), segun la model card.
- Soporte de inferencia con `guidance_scale=0.0`, propio de los modelos destilados sin classifier-free guidance.
- No se documentan capacidades de edicion de imagen, inpainting, control estructural (ControlNet), tool calling ni razonamiento multi-paso; son capacidades del modelo base, no del adaptador, y no se confirman en la informacion disponible.
- Capacidades multilingues del prompt: no disponibles.

## Casos de uso

- Prototipado de personajes consistentes: el adaptador permite generar variaciones de un mismo personaje (pose, vestuario, entorno) manteniendo la identidad visual mediante el token `yuk1`, util para tableros de concepto en preproduccion.
- Ilustracion editorial y de ficcion: generacion de escenas con un personaje recurrente a lo largo de una serie de imagenes, usando Krea-2-Turbo con 8 pasos para iterar rapidamente sobre composiciones.
- Pruebas de concepto de moda y vestuario: el adaptador mantiene la identidad del personaje mientras se varian prendas y estilos, lo que permite evaluar combinaciones visuales antes de una sesion fotografica real.
- Investigacion sobre personalizacion con DreamBooth-LoRA: sirve como caso de estudio reproducible del flujo `Krea2Pipeline` + `load_lora_weights` para experimentos academicos sobre fidelidad de concepto y deriva de identidad.
- Generacion de material para prototipos de aplicaciones creativas: integracion en herramientas internas de generacion de imagenes que necesiten un personaje fijo, aprovechando la licencia apache-2.0 del adaptador.
- Docencia y demostraciones tecnicas: ejemplo minimo de entrenamiento e invocacion de un LoRA sobre un modelo de difusion moderno, con codigo de inferencia incluido en la model card.
- Creacion de datasets sinteticos controlados: generacion de imagenes de un personaje con atributos variados para entrenar o evaluar otros sistemas de vision por computador, siempre que se respeten las condiciones de licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende integramente del modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16 (Ampere o posterior: A100, H100, RTX 30xx/40xx).
- Compatibilidad con GPU de consumo: no confirmada. El repositorio del adaptador ocupa 1,6 GB, pero la VRAM necesaria la determina el modelo base Krea 2, no el LoRA.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` es el unico metodo documentado. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a difusion).
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia sobre Krea-2-Turbo, pero no publica tiempos por imagen ni hardware de referencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de otros adaptadores LoRA comparables para Krea 2, ni de alternativas sobre otros modelos base (por ejemplo, LoRA para Stable Diffusion o Flux), por lo que no es posible establecer una comparacion cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whymustyouknow/yuki | no disponible | no aplica | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentacion minima: no se especifican rango LoRA, hiperparametros de entrenamiento, tamano del dataset ni metodologia de evaluacion, lo que impide reproducir el entrenamiento.
- Sin evaluaciones publicadas: cero descargas y cero likes en el momento de la ficha; no hay evidencia externa de calidad o fidelidad del concepto aprendido.
- Dependencia total del modelo base: el adaptador no es autonomo; requiere Krea-2-Raw o Krea-2-Turbo, cuyas condiciones de acceso y licencia deben verificarse por separado y pueden imponer restricciones adicionales al uso comercial.
- Contenido de los ejemplos: los prompts de la model card incluyen descripciones de caracter sexual y una referencia a embarazo; conviene revisar las politicas de contenido aplicables antes de reutilizar el adaptador en productos publicos.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth de concepto unico, puede degradar la diversidad de las generaciones o filtrar rasgos del personaje en prompts no relacionados si no se usa el token disparador de forma controlada.
- Sesgos: no documentados. Los modelos de difusion entrenados con datos web heredan sesgos demograficos y esteticos; no hay evaluacion especifica para este adaptador.
- Alucinacion visual: no cuantificada; en difusion se manifiesta como incoherencias anatomicas o de composicion, especialmente con prompts complejos o fuera de distribucion.
- Idiomas: no se confirma el soporte multilingue del prompt; los ejemplos estan unicamente en ingles.
- Licencia apache-2.0 del adaptador: permite uso comercial, pero no exime de cumplir la licencia del modelo base Krea 2 ni de las obligaciones de atribucion correspondientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/whymustyouknow/yuki
- Modelo base (referencia en metadatos): https://huggingface.co/krea/Krea-2-Raw
- Variante turbo mencionada en la model card: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers (usada en el ejemplo de inferencia): https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
