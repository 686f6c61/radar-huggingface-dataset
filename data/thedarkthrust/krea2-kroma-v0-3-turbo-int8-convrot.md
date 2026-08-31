# thedarkthrust/Krea2-Kroma-v0.3-Turbo-INT8-ConvRot

## Resumen

Krea2-Kroma-v0.3-Turbo-INT8-ConvRot es una cuantización INT8 con rotación ConvRot del checkpoint completo de Kroma v0.3 Turbo, un fine-tune de Krea 2 desarrollado por lodestones. El autor, thedarkthrust, ha convertido el modelo original de 25,64 GB a 13,49 GB mediante el conversor `convert-to-quant` 1.3.1, utilizando aprendizaje de redondeo AdaRound y grupos de rotación fijos de 256. El resultado es un modelo de difusión text-to-image listo para cargar de forma nativa en ComfyUI, manteniendo separados el text encoder y el VAE de Krea 2.

La relevancia de este modelo radica en que ofrece una versión cuantizada de un fine-tune popular de Krea 2, reduciendo el tamaño del archivo en un 47,38 % sin necesidad de cargadores personalizados. Está pensado para usuarios de ComfyUI que quieran ahorrar espacio en disco y posiblemente memoria, aunque la model card advierte que no se ha realizado una comparación visual de calidad ni un benchmark de velocidad. El modelo conserva en BF16 las rutas críticas de acondicionamiento (timestep, texto y proyecciones) y cuantiza las 224 matrices lineales de los 28 bloques transformer principales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image basado en transformer (28 bloques principales) |
| Parametros totales | 12.820.073.036 (12,82 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | INT8 con ConvRot (grupo 256) para 224 matrices; BF16 para rutas de acondicionamiento y proyecciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Krea 2 Community License (krea-2-community-license) |
| Formato de pesos | safetensors (archivo unico de 13.492 GB) |

## Arquitectura y entrenamiento

Kroma v0.3 Turbo es un fine-tune de Krea 2, distribuido como checkpoint completo (no LoRA). Según la información disponible, el delta Turbo se integra como una LoRA de rango 512, lo que proporciona la velocidad del modo Turbo manteniendo la calidad del fine-tune. La arquitectura subyacente de Krea 2 es un modelo de difusión basado en transformer, con 28 bloques que contienen cada uno ocho matrices lineales (atención: gate, wk, wo, wq, wv; MLP: down, gate, up). El modelo procesa latentes de imagen y acondicionamiento de texto mediante un text encoder separado (no incluido en este checkpoint).

La cuantización se realizó con el preset `--krea2` del conversor `convert-to-quant` 1.3.1, aplicando INT8 por filas con rotación ConvRot de grupo 256 y redondeo aprendido AdaRound. Se usaron 3.072 muestras sintéticas para calibración, sin datos reales de prompts o imágenes. El proceso duró aproximadamente 104,5 minutos en una RTX 5070 Ti de 16 GB. Se cuantizaron 12.155.092.992 parámetros (94,81 % del total), mientras que las rutas de entrada/salida de latentes, acondicionamiento de timestep y fusión de texto se mantuvieron en BF16 byte-idénticos al original. La validación estructural confirmó la cobertura exacta de tensores y la carga nativa en ComfyUI.

## Capacidades

- Generación de imágenes a partir de descripciones de texto en inglés, con calidad de fine-tune y velocidad Turbo.
- Integración nativa con ComfyUI mediante el nodo Load Diffusion Model, sin necesidad de cargadores INT8 personalizados.
- Compatible con flujos de trabajo de Krea 2 que usan text encoder y VAE separados.
- Soporte para iteración rápida en tareas de exploración de diseño y conceptos, gracias al modo Turbo.
- Cuantización INT8 con rotación ConvRot que reduce el tamaño del archivo en un 47,38 % respecto al BF16 original.
- Retención en BF16 de las rutas de acondicionamiento críticas (timestep, texto y proyecciones) para minimizar la pérdida de calidad en esas vías.

## Casos de uso

- Exploración de conceptos visuales en estudios de diseño: el modo Turbo permite generar variaciones rápidas de ilustraciones expresivas, ideal para iterar sobre ideas antes de refinar con modelos de mayor calidad.
- Integración en pipelines de generación de imágenes con ComfyUI: al ser un checkpoint completo, se puede cargar directamente en flujos existentes de Krea 2, sustituyendo al modelo BF16 sin cambios en el grafo.
- Desarrollo de aplicaciones de generación de imágenes con requisitos de almacenamiento reducido: el archivo de 13,49 GB facilita la distribución y el despliegue en entornos con espacio limitado.
- Prototipado de herramientas creativas para artistas: la velocidad Turbo y la compatibilidad con ComfyUI permiten construir interfaces de generación rápida para ilustradores y concept artists.
- Investigación sobre cuantización de modelos de difusión: el manifiesto de cuantización y la metodología documentada (AdaRound, ConvRot) sirven como referencia para estudios de compresión de modelos.
- Generación de imágenes en entornos con GPUs de 16 GB: al reducir el tamaño del checkpoint, es posible ejecutar el modelo en tarjetas como la RTX 5070 Ti o RTX 4080, aunque la VRAM real depende del resto del flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha realizado una comparación visual de calidad con prompts emparejados ni un benchmark de velocidad de inferencia. Tampoco se dispone de métricas como FID, CLIP score o tiempos de generación para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El archivo pesa 13,49 GB, pero el uso real de VRAM depende del text encoder, VAE y resolución de salida. Se recomienda al menos 16 GB de VRAM para flujos completos de Krea 2.
- GPU recomendadas: la conversión se realizó en una NVIDIA GeForce RTX 5070 Ti de 16 GB, lo que sugiere que tarjetas de 16 GB o superiores (RTX 4080, RTX 4090, A100, etc.) son adecuadas. No se ha probado en GPUs de menor capacidad.
- Compatibilidad con consumer GPU: sí, en tarjetas de 16 GB o más, aunque la VRAM total del flujo puede superar esa cifra.
- Opciones de despliegue: ComfyUI (carga nativa probada). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles. No se ha realizado ningún benchmark de velocidad.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| Krea2-Kroma-v0.3-Turbo-INT8-ConvRot (este) | 13,49 GB | INT8 ConvRot | Krea 2 Community | Fine-tune de Krea 2 con Turbo, cuantizado |
| lodestones/Kroma (original BF16) | 25,64 GB | BF16 | Krea 2 Community | Checkpoint completo sin cuantizar |
| Krea 2 Turbo (oficial) | no disponible | no disponible | Krea 2 Community | Modelo oficial de Krea, sin fine-tune |

La comparativa se limita a las variantes de Kroma y Krea 2 Turbo, ya que no se dispone de datos de otros modelos de difusión comparables en la información proporcionada. La principal diferencia entre este modelo y el original es el tamaño del archivo (47,38 % menor) y la posible pérdida de calidad por cuantización, no cuantificada.

## Limitaciones y advertencias

- La cuantización es lossy: no se ha realizado una comparación visual de calidad entre el modelo cuantizado y el original, por lo que puede haber diferencias perceptibles en la salida.
- No se ha medido el rendimiento de inferencia: la reducción de tamaño de archivo no implica necesariamente una generación más rápida o un menor uso de VRAM.
- La calibración se realizó con 3.072 muestras sintéticas, sin datos reales de prompts o imágenes, lo que podría afectar a la calidad en casos de uso específicos.
- El modelo solo soporta inglés como idioma de entrada, según la metadata.
- La licencia Krea 2 Community License tiene condiciones específicas de uso comercial; es necesario revisar el enlace de licencia antes de desplegar el modelo en producción.
- El text encoder y el VAE de Krea 2 no están incluidos en este checkpoint; se deben obtener por separado para usar el modelo.
- No se garantiza la reproducibilidad exacta de la conversión en otros entornos de software o hardware, aunque se documenta la semilla y la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedarkthrust/Krea2-Kroma-v0.3-Turbo-INT8-ConvRot
- Modelo base (lodestones/Kroma): https://huggingface.co/lodestones/Kroma
- Conversor utilizado (silveroxides/convert_to_quant): https://github.com/silveroxides/convert_to_quant
- Licencia Krea 2 Community: https://www.krea.ai/krea-2-licensing
- Página de Kroma en Tensor.Art: https://tensor.art/models/1037635234654340273
- Krea 2 Turbo en Hugging Face: https://huggingface.co/krea/Krea-2-Turbo
- Krea 2 Turbo en Krea: https://www.krea.ai/models/krea-2-turbo
- Checkpoints oficiales de Krea 2 Turbo en Civitai: https://civitai.com/models/2726029/krea-2-turbo-official-comfy-org-checkpoints-krea2
