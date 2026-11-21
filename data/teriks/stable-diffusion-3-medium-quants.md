# Teriks/stable-diffusion-3-medium-quants

## Resumen

Teriks/stable-diffusion-3-medium-quants es un repositorio de pesos cuantizados del modelo de difusion de imagenes Stable Diffusion 3 Medium, publicado por el desarrollador Teriks (autor de la herramienta dgenerate). No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales de stabilityai/stable-diffusion-3-medium-diffusers a formatos de menor precision (float8_e4m3fn e int8_tensorwise) para su uso en ComfyUI.

El objetivo es reducir el coste de memoria y almacenamiento del componente transformer (SD3Transformer2DModel) manteniendo el resto de la pipeline original. El repositorio incluye unicamente los pesos del transformer en formato safetensors compatible con ComfyUI, no la pipeline completa ni los text encoders ni el VAE.

Es relevante para usuarios de ComfyUI que quieran ejecutar SD3 Medium en hardware con VRAM limitada, ya que la cuantizacion a 8 bits reduce aproximadamente a la mitad el peso del transformer (2,0 GB por archivo frente al original en fp16). El repositorio tiene un tamano total de 4,3 GB y fue creado el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (SD3Transformer2DModel) sobre pipeline StableDiffusion3Pipeline |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | float8_e4m3fn e int8_tensorwise (safetensors ComfyUI) |
| Idiomas soportados | no disponible (el prompt depende de los text encoders de la pipeline base) |
| Licencia | la licencia del modelo fuente aplica a estos pesos (no se especifica en el repo) |
| Formato de pesos | safetensors (layout ComfyUI) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado de forma independiente: son pesos cuantizados del transformer de Stable Diffusion 3 Medium, un modelo de difusion latente basado en arquitectura transformer (MMDiT en el modelo original de Stability AI). El proceso de cuantizacion se realizo con dgenerate 6.0.0 mediante el subcomando `quantize`, limitado al subfolder `transformer` y con el flag `--comfy` para adoptar el layout de nombres de tensor de ComfyUI.

Los formatos generados son float8_e4m3fn (punto flotante de 8 bits) e int8_tensorwise (entero de 8 bits con escala por tensor). No se ha realizado ningun tipo de ajuste fino, RLHF ni entrenamiento adicional: es una conversion post-entrenamiento de los pesos originales. El autor indica que los nombres de tensor siguen el layout de ComfyUI y que tanto ComfyUI como ComfyUI-GGUF cargan los archivos siempre que exista un key map para esa arquitectura.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante la pipeline StableDiffusion3Pipeline (la capacidad la aporta el modelo base, no los pesos cuantizados en si).
- Carga en ComfyUI a traves del mecanismo de cuantizacion de safetensors, pasando el archivo de quant junto con el repositorio original como modelo.
- Compatibilidad con los formatos float8_e4m3fn e int8_tensorwise, pensados para reducir el uso de VRAM del transformer.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion de imagenes.
- No incluye capacidades de vision, audio ni modo thinking.
- Las capacidades multilingues del prompt dependen de los text encoders de la pipeline base, no de estos pesos.

## Casos de uso

- Generacion de imagenes en ComfyUI con VRAM limitada: cargando el transformer cuantizado a float8_e4m3fn o int8_tensorwise se reduce el peso del componente principal a 2,0 GB, lo que permite ejecutar SD3 Medium en GPUs donde la version fp16 no cabe comodamente.
- Prototipado rapido de pipelines de difusion: util para desarrolladores que quieran validar flujos de trabajo de StableDiffusion3Pipeline en ComfyUI antes de pasar a produccion con los pesos originales.
- Despliegue en entornos de investigacion con recursos acotados: el formato int8_tensorwise permite comparar calidad frente a float8_e4m3fn con un coste de memoria similar, facilitando estudios de degradacion por cuantizacion.
- Integracion en herramientas basadas en dgenerate: el repositorio documenta el comando exacto de cuantizacion, lo que sirve como referencia reproducible para generar variantes propias.
- Pruebas de compatibilidad de ComfyUI y ComfyUI-GGUF: sirve para verificar que el key map de la arquitectura SD3Transformer2DModel carga correctamente los tensores cuantizados.
- Evaluacion de la relacion calidad/memoria en 8 bits: permite medir si la perdida visual respecto al modelo original es aceptable para un caso de uso concreto antes de adoptar la cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad (FID, CLIP score, etc.) ni comparaciones con el modelo original en fp16.

## Requisitos de hardware

- VRAM estimada para el transformer cuantizado: aproximadamente 2,0 GB por archivo segun el tamano declarado (2,0 GB para float8_e4m3fn y 2,0 GB para int8_tensorwise); a esto hay que sumar los text encoders, el VAE y el resto de la pipeline original.
- GPU recomendadas: no disponibles en la informacion proporcionada; al tratarse de un componente de 2,0 GB, el limite practico lo marca el resto de la pipeline base.
- Compatibilidad con GPU de consumo: probable en GPUs con VRAM suficiente para la pipeline completa, pero no se especifican modelos concretos.
- Opciones de despliegue: ComfyUI y ComfyUI-GGUF (unico entorno documentado por el autor); vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de difusion de imagenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/stable-diffusion-3-medium-quants | no disponible (transformer de SD3 Medium) | no aplica | safetensors ComfyUI (float8_e4m3fn, int8_tensorwise) | la del modelo fuente | Hugging Face |
| stabilityai/stable-diffusion-3-medium-diffusers | no disponible | no aplica | diffusers (fp16/fp32) | licencia de Stability AI | Hugging Face |
| Otras cuantizaciones de SD3 Medium | no disponible | no aplica | GGUF / safetensors | depende del autor | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 8 bits puede introducir degradacion en la calidad de generacion respecto al modelo original en fp16; no se documenta el grado de perdida.
- El repositorio solo contiene el componente transformer: es imprescindible mantener el repositorio original como modelo y pasar el archivo de quant con la opcion de componente correspondiente, de lo contrario la configuracion no se carga.
- Solo se documenta compatibilidad con ComfyUI y ComfyUI-GGUF; otros entornos no estan soportados de forma explicita.
- La licencia no se declara en el repositorio; el autor indica que se aplica la licencia del modelo fuente, por lo que el uso comercial queda sujeto a los terminos de Stability AI para SD3 Medium.
- No hay informacion sobre sesgos, alucinaciones ni limitaciones idiomaticas especificas de estos pesos; hereda las del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- No se proporcionan datos de benchmarks ni de calidad, por lo que la idoneidad para produccion debe validarse empiricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/stable-diffusion-3-medium-quants
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3-medium-diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
