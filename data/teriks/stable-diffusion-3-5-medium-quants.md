# Teriks/stable-diffusion-3.5-medium-quants

## Resumen

Teriks/stable-diffusion-3.5-medium-quants es un repositorio de pesos cuantizados del modelo de difusion Stability AI Stable Diffusion 3.5 Medium, publicado por el usuario Teriks mediante la herramienta dgenerate 6.0.0. No se trata de un modelo nuevo ni de un entrenamiento, sino de una redistribucion del transformer (SD3Transformer2DModel) del modelo base en dos formatos de cuantizacion orientados a ComfyUI: float8_e4m3fn e int8_tensorwise.

El problema que resuelve es el coste de memoria del transformer original de SD 3.5 Medium, que en su version de precision completa ronda los 5 GB. Cada uno de los ficheros cuantizados ocupa 2.5 GB, aproximadamente la mitad, lo que facilita su carga en GPUs consumer con VRAM limitada sin renunciar al pipeline completo: el repositorio solo contiene el transformer cuantizado y debe combinarse con los componentes restantes (VAE, text encoders) del repositorio original de Stability AI.

La relevancia es practica: permite desplegar SD 3.5 Medium en entornos ComfyUI con menos VRAM y con menor tiempo de carga de pesos. El repositorio es muy reciente (creado el 21 de noviembre de 2026), no registra descargas ni likes en el momento de la consulta, y su licencia no se declara de forma explicita mas alla de la nota de que "la licencia del modelo fuente se aplica a estos pesos". La arquitectura subyacente es un transformer de difusion (MMDiT) con atencion conjunta texto-imagen, no un modelo de lenguaje, por lo que no dispone de ventana de contexto en tokens ni de capacidades de razonamiento o tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (SD3Transformer2DModel, familia MMDiT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | float8_e4m3fn, int8_tensorwise (safetensors para ComfyUI) |
| Idiomas soportados | no disponible (prompts de texto; el modelo base no declara lista de idiomas) |
| Licencia | no disponible (se indica que aplica la licencia del modelo fuente, stabilityai/stable-diffusion-3.5-medium) |
| Formato de pesos | safetensors con layout ComfyUI (`transformer-float8_e4m3fn-comfy.safetensors`, `transformer-int8_tensorwise-comfy.safetensors`) |
| Tamano del repositorio | 5.4 GB (dos ficheros de 2.5 GB) |
| Componente cuantizado | transformer (SD3Transformer2DModel) |
| Pipeline de referencia | StableDiffusion3Pipeline |
| Herramienta de cuantizacion | dgenerate 6.0.0 |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio: deriva del modelo stabilityai/stable-diffusion-3.5-medium, un modelo de difusion texto-a-imagen cuyo componente principal es un transformer (SD3Transformer2DModel). La cuantizacion se aplica exclusivamente al subfolder `transformer`, manteniendo el pipeline StableDiffusion3Pipeline como referencia. Los nombres de tensor siguen el layout de ComfyUI (`--comfy`), y los ficheros requieren un key map compatible con esa arquitectura para poder cargarse; un componente sin key map se considera error.

La innovacion tecnica del repositorio es la propia cuantizacion: dgenerate 6.0.0 genera pesos en float8_e4m3fn (formato de coma flotante de 8 bits con exponente de 4 bits y mantisa de 3 bits) e int8_tensorwise (enteros de 8 bits con escala por tensor). Ambas variantes reducen el transformer a 2.5 GB por fichero. La model card no documenta el dataset de entrenamiento, el numero de tokens, ni procesos de RLHF/DPO, ya que no se trata de un modelo entrenado sino de una redistribucion de pesos. Tampoco se especifican metodos de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante el pipeline Stable Diffusion 3.5, usando el transformer cuantizado como componente de denoising.
- Integracion con ComfyUI y ComfyUI-GGUF: los ficheros incluyen key map para la arquitectura SD3Transformer2DModel y se cargan como pesos de componente.
- Cuantizacion float8_e4m3fn: pesos de 8 bits en coma flotante, adecuados para hardware con soporte de FP8.
- Cuantizacion int8_tensorwise: pesos enteros de 8 bits con escala por tensor, orientados a maxima compatibilidad.
- No ofrece tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni modo thinking: es un modelo de difusion, no un LLM.
- Capacidades multilingues: no disponibles; el comportamiento linguistico depende de los text encoders del modelo base, que no se incluyen en este repositorio.

## Casos de uso

- Despliegue de SD 3.5 Medium en ComfyUI con VRAM ajustada: sustituir el transformer original por el fichero float8_e4m3fn o int8_tensorwise reduce el peso del componente a 2.5 GB, liberando memoria para el VAE y los text encoders en GPUs de 8-12 GB.
- Generacion de imagenes en estaciones consumer: cargar el transformer cuantizado junto al repositorio base permite ejecutar el pipeline StableDiffusion3Pipeline en tarjetas que no admiten el transformer en precision completa.
- Prototipado rapido de workflows de imagen: el formato ComfyUI permite arrastrar el fichero directamente en nodos de carga de modelo, agilizando iteraciones de prompt engineering y pruebas de estilos.
- Reduccion del tiempo de carga en entornos con almacenamiento lento: ficheros de 2.5 GB frente a los aproximadamente 5 GB del transformer original disminuyen el I/O inicial en servidores con discos compartidos.
- Experimentacion con precision reducida: comparar la calidad de salida entre float8_e4m3fn e int8_tensorwise para decidir que variante usar en produccion segun el hardware disponible.
- Distribucion de pipelines ligeros en entornos con cuotas de almacenamiento: publicar imagenes de contenedor o bundles que incluyan solo el transformer cuantizado y referencien el resto de componentes desde el repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer cuantizado: aproximadamente 2.5 GB de pesos por fichero (float8_e4m3fn o int8_tensorwise); la VRAM total de inferencia debe sumar VAE, text encoders y activaciones, no cuantificados en este repositorio.
- GPU recomendadas: no disponibles en la informacion proporcionada; el formato float8_e4m3fn requiere hardware con soporte FP8 para aprovechar la aceleracion, mientras que int8_tensorwise depende del soporte de kernels INT8 del runtime.
- GPU consumer: el tamano de 2.5 GB del transformer sugiere que cabe en tarjetas consumer de 8 GB o mas, siempre que el resto del pipeline quepa en la VRAM restante; no se confirma en la model card.
- Opciones de despliegue: ComfyUI y ComfyUI-GGUF (formatos comfy safetensors); el pipeline de referencia es StableDiffusion3Pipeline. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/stable-diffusion-3.5-medium-quants | no disponible (transformer cuantizado, 2.5 GB por fichero) | no disponible | safetensors ComfyUI (float8_e4m3fn, int8_tensorwise) | no disponible (aplica la del modelo fuente) | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-3.5-medium | no disponible | no disponible | safetensors (precision original) | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene unicamente el transformer cuantizado; no incluye VAE, text encoders ni scheduler, por lo que no es autosuficiente y requiere el repositorio stabilityai/stable-diffusion-3.5-medium como modelo principal.
- La cuantizacion a float8_e4m3fn o int8_tensorwise puede introducir degradacion de calidad respecto al transformer en precision completa; la model card no documenta evaluaciones de fidelidad.
- Los ficheros solo cargan en runtimes con key map compatible con la arquitectura SD3Transformer2DModel en layout ComfyUI; un componente sin key map provoca error.
- La licencia no se declara explicitamente en el repositorio; solo se indica que se aplica la licencia del modelo fuente, por lo que el uso comercial queda sujeto a los terminos de stabilityai/stable-diffusion-3.5-medium.
- No hay datos de benchmarks, sesgos, tasas de alucinacion visual ni limitaciones de idioma en la informacion disponible; al ser un modelo de difusion, el riesgo de "alucinacion" se traduce en artefactos o imagenes incoherentes respecto al prompt.
- El repositorio es muy reciente y no registra descargas ni likes, por lo que no hay evidencia comunitaria de estabilidad o calidad de los pesos cuantizados.
- No se especifican requisitos minimos de hardware ni latencias, lo que impide garantizar rendimiento en produccion sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/stable-diffusion-3.5-medium-quants
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Herramienta de cuantizacion dgenerate: https://github.com/Teriks/dgenerate
