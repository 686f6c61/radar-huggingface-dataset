# Teriks/Wan2.1-VACE-14B-quants

## Resumen

Teriks/Wan2.1-VACE-14B-quants es un repositorio de cuantizaciones del modelo Wan-AI/Wan2.1-VACE-14B-diffusers, un modelo de difusion de video de 14.000 millones de parametros desarrollado originalmente por Wan-AI (Alibaba). El repositorio no contiene un modelo nuevo ni entrenado desde cero, sino dos artefactos de pesos cuantizados generados con la herramienta dgenerate 6.0.0 de Teriks, orientados a su uso en ComfyUI y en pipelines de difusion de video.

El modelo base VACE (Video All-in-one Creation and Editing) es un transformer de difusion 3D para generacion y edicion de video, con un transformer de 14B parametros (WanVACETransformer3DModel) que se ejecuta mediante la pipeline WanVACEPipeline. La cuantizacion reduce el peso del transformer de aproximadamente 28 GB en fp16/bf16 a 16,2 GB por archivo, lo que facilita su despliegue en GPUs de consumo y en entornos ComfyUI con VRAM limitada.

La relevancia de este repositorio es practica: permite ejecutar un modelo de video de 14B en hardware mas modesto mediante formatos float8_e4m3fn e int8_tensorwise, manteniendo el resto de componentes (VAE, text encoder) en el repositorio original. No incluye model card con benchmarks, licencia explicita ni datos de entrenamiento propios; toda la informacion tecnica del modelo base debe consultarse en el repositorio de Wan-AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (WanVACETransformer3DModel), pipeline WanVACEPipeline |
| Parametros totales | 14.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float8_e4m3fn, int8_tensorwise (safetensors formato ComfyUI); dgenerate acepta tambien q4 (Q4_K) y q8 (Q8_0) como presets |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; se aplica la licencia del modelo base Wan-AI/Wan2.1-VACE-14B-diffusers |
| Formato de pesos | safetensors con layout ComfyUI (claves con key map para ComfyUI y ComfyUI-GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: contiene unicamente pesos cuantizados del transformer del modelo base Wan2.1-VACE-14B. El transformer es un modelo de difusion 3D (WanVACETransformer3DModel) que procesa latentes de video, y se ejecuta dentro de la pipeline WanVACEPipeline junto con los demas componentes del repositorio original (VAE, text encoder, etc.). La cuantizacion se aplico solo al subfolder `transformer`, dejando el resto de componentes sin tocar.

Los archivos se generaron con dgenerate 6.0.0 mediante el subcomando `quantize`, con la opcion `--comfy` para producir nombres de tensor compatibles con ComfyUI y ComfyUI-GGUF. Se ofrecen dos variantes: float8_e4m3fn (punto flotante de 8 bits) e int8_tensorwise (entero de 8 bits con escala por tensor). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF/DPO; esos datos deben consultarse en la model card de Wan-AI.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante el modelo base VACE.
- Edicion y creacion de video "all-in-one" (VACE: Video All-in-one Creation and Editing), segun la denominacion del modelo base.
- Control y acondicionamiento de video (la familia VACE esta disenada para tareas de edicion y control, aunque los detalles concretos no estan documentados en este repositorio).
- Ejecucion en ComfyUI mediante los safetensors con layout ComfyUI y key map para ComfyUI-GGUF.
- Compatibilidad con la pipeline WanVACEPipeline de diffusers.
- No se documentan en este repositorio capacidades de tool calling, agentes, razonamiento multi-step, vision, audio ni modo thinking; se trata de un modelo de difusion de video, no de un LLM.

## Casos de uso

- Generacion de clips de video en ComfyUI: cargar el safetensors float8_e4m3fn como transformer dentro de un grafo ComfyUI que use el resto de componentes del repositorio Wan-AI, reduciendo la VRAM necesaria frente al modelo en bf16.
- Edicion de video asistida: usar el modelo base VACE para tareas de edicion y control de video, con los pesos cuantizados para abaratar el coste de inferencia en produccion.
- Prototipado en GPU de consumo: desplegar el transformer de 16,2 GB en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) usando la variante int8_tensorwise o float8_e4m3fn, reservando el resto de VRAM para el VAE y el text encoder.
- Investigacion sobre cuantizacion de modelos de difusion de video: comparar la calidad de salida entre float8_e4m3fn e int8_tensorwise frente al modelo base en bf16 para medir la degradacion introducida.
- Pipelines de generacion de video por lotes: usar dgenerate con los pesos cuantizados para producir videos de forma automatizada en entornos con VRAM limitada.
- Integracion en servicios de edicion de video: servir la pipeline WanVACEPipeline con el transformer cuantizado para reducir el coste por inferencia en infraestructura cloud con GPUs de 24-48 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: 16,2 GB por archivo cuantizado (float8_e4m3fn o int8_tensorwise), frente a los aproximadamente 28 GB del transformer en bf16. Hay que sumar la VRAM del VAE y del text encoder del modelo base, no incluidos en este repositorio.
- GPU recomendadas: RTX 4090 (24 GB) o superiores para la variante de 8 bits; A100 40/80 GB, H100 o L40S para despliegues con mayor margen de VRAM y throughput.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB similares, siempre que el resto de componentes quepan en la VRAM restante.
- Opciones de despliegue: ComfyUI y ComfyUI-GGUF (formatos soportados por los key maps), diffusers con WanVACEPipeline, y dgenerate para cuantizacion y generacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Wan2.1-VACE-14B-quants | 14B (transformer) | no disponible | safetensors ComfyUI (float8_e4m3fn, int8_tensorwise) | la del modelo base | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-VACE-14B-diffusers | 14B (transformer) | no disponible | safetensors diffusers (bf16/fp16) | no disponible | Hugging Face (modelo base) |
| Otras cuantizaciones de Wan2.1-VACE-14B | 14B (transformer) | no disponible | GGUF / safetensors | la del modelo base | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado ni de otras alternativas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado: es una cuantizacion del transformer de Wan-AI/Wan2.1-VACE-14B-diffusers; la calidad final depende del modelo base y de la degradacion introducida por la cuantizacion de 8 bits.
- La licencia no esta declarada en el repositorio; se aplica la licencia del modelo base, que debe verificarse antes de cualquier uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma especificas en la informacion disponible.
- El repositorio incluye archivos auxiliares no relacionados con los pesos (scripts, logs, un archivo `hf-token.txt` de 37 B y capturas PNG); conviene revisar su contenido antes de descargar o reutilizar el repositorio, y no se debe asumir que el token incluido sea valido o seguro.
- Los archivos cuantizados solo cubren el subfolder `transformer`; es imprescindible mantener el repositorio original como modelo y pasar el archivo cuantizado con la opcion de componente correspondiente, ya que la configuracion proviene del repositorio base.
- Un componente sin key map para la arquitectura es un error en ComfyUI/ComfyUI-GGUF; verificar compatibilidad antes de desplegar.
- No hay benchmarks publicados que permitan cuantificar la perdida de calidad frente al modelo en bf16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Wan2.1-VACE-14B-quants
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-14B-diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
