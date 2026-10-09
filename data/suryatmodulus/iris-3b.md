# suryatmodulus/iris-3b

## Resumen

Iris-3B es un modelo de difusion de 3B parametros que genera imagenes directamente en espacio de pixeles, sin VAE ni espacio latente intermedio. Lo desarrolla Speridlabs y la ficha de HuggingFace consultada aparece publicada bajo el identificador `suryatmodulus/iris-3b`, mientras que la model card y los enlaces apuntan al repositorio oficial `speridlabs/iris-3b`. La propuesta central es que la red emite cada pixel sin pasar por un decodificador, de forma que no se pierde informacion en una representacion latente sesgada hacia texturas.

El modelo se ha preentrenado desde cero mediante un curriculo de resolucion 256 → 512 → 1024, tras ablacionar primero el objetivo de prediccion y la alineacion de representacion a 256² para decidir que escalar. El texto se codifica con Qwen3-VL-4B-Instruct y la generacion por defecto produce imagenes de aproximadamente un megapixel (1024×1024) con escala CFG 3 y 100 pasos de denoising.

Ademas de la generacion texto-a-imagen, el mismo prior en espacio de pixeles se reutiliza mediante fine-tuning sin cambios arquitectonicos para tareas densas: estimacion de profundidad monoculo, restauracion de imagen y superresolucion. El repositorio incluye carpetas especificas (`depth/` y `upscaler/`) de unos 12 GB cada una. La relevancia actual radica en explorar los priors generativos en espacio de pixeles como alternativa a los modelos de vision tipo DINOv2, y en documentar la conversion de un modelo latente preentrenado (FLUX.2 Klein base 4B) a espacio de pixeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion en espacio de pixeles (pixel-space), flow matching, sin VAE ni espacio latente |
| Parametros totales | 2.987.511.888 (~3B, dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en precision original; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible; la model card recomienda escribir los prompts como frases descriptivas en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch / safetensors |

## Arquitectura y entrenamiento

Iris-3B es un transformer de difusion que opera directamente sobre pixeles y se entrena con flow matching, prescindiendo de un autoencoder variacional. La motivacion declarada es evitar la perdida de informacion asociada a los espacios latentes comprimidos y sesgados hacia texturas, de modo que la propia red produce la imagen final sin decodificador separado. El condicionamiento textual corre a cargo de Qwen3-VL-4B-Instruct, descargado automaticamente en la primera ejecucion.

El entrenamiento parte de cero con un curriculo de resolucion creciente (256 → 512 → 1024), precedido por una fase de ablacion a 256² en la que se evaluan el objetivo de prediccion y la alineacion de representacion para decidir que componentes escalar. El trabajo incluye ademas la conversion de un modelo latente preentrenado, FLUX.2 Klein base 4B, a espacio de pixeles, lo que permite comparar backbones de pixeles frente a latentes en tareas de profundidad y restauracion. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset, ni si se emplearon etapas de RLHF o DPO.

## Capacidades

- Generacion texto-a-imagen en espacio de pixeles a resoluciones nativas de aproximadamente un megapixel, con relacion de aspecto variable y salida por defecto de 1024×1024.
- Control de fidelidad al prompt mediante `--cfg-scale` (por defecto 3) y de calidad/velocidad mediante `--steps` (por defecto 100).
- Soporte de prompts negativos (`--negative-prompt`) y generacion por lotes a partir de un fichero de texto con un prompt por linea.
- Reproducibilidad mediante semilla fija (`--seed`).
- Estimacion de profundidad monoculo (monocular depth estimation) mediante el modelo ajustado incluido en la carpeta `depth/`.
- Restauracion de imagen y superresolucion mediante el modelo ajustado incluido en la carpeta `upscaler/`.
- Actua como prior generativo reutilizable para tareas de vision densa, alternativo a modelos de vision tipo DINOv2.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de generacion y vision, no un LLM conversacional).

## Casos de uso

- Generacion de imagenes publicitarias y de producto: el modelo produce imagenes de aproximadamente un megapixel siguiendo prompts descriptivos detallados, lo que permite crear variaciones de bodegon, retrato o escena con control de iluminacion y encuadre.
- Estimacion de profundidad para pipelines de 3D, realidad aumentada o reconstruccion: el modelo ajustado en `depth/` genera mapas de profundidad monoculares reutilizables para estereoscopia sintetica, oclusion o composicion 3D.
- Restauracion de fotografias antiguas o degradadas: la variante de restauracion permite recuperar detalle en imagenes con ruido, desenfoque o artefactos de compresion.
- Superresolucion y reescalado: el modulo `upscaler/` amplia imagenes a resoluciones superiores manteniendo coherencia de textura, util para impresion o catalogos.
- Generacion de datos sinteticos para entrenamiento: al permitir control fino por prompt y semilla, puede producir lotes de imagenes etiquetadas para aumentar datasets de vision por computador.
- Concept art y storyboarding: la generacion a relaciones de aspecto nativas (no forzadas a cuadrado) facilita la produccion de fotogramas para previsualizacion audiovisual.
- Investigacion en priors generativos: sirve como base para estudiar si los modelos en espacio de pixeles superan a los latentes en tareas densas, y como punto de partida para convertir modelos latentes a pixeles.
- Fine-tuning para tareas de vision especificas: al no requerir cambios arquitectonicos para las tareas densas, el mismo backbone puede readaptarse a nuevas tareas de regresion por pixel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda describen el enfoque metodologico (ablaciones a 256², curriculo de resolucion y conversion de FLUX.2 Klein a espacio de pixeles) y remiten al paper arXiv 2610.09450, pero no incluyen tablas con metricas como FID, CLIP score, RMSE de profundidad o PSNR. No se deben asumir cifras no presentes en las fuentes.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica unos 12 GB de pesos para la tarea texto-a-imagen; con el codificador de texto Qwen3-VL-4B-Instruct anadido, el consumo conjunto se situa por encima de esa cifra. Las carpetas `depth/` y `upscaler/` anaden aproximadamente 12 GB cada una, por lo que cargar las tres variantes a la vez es inviable en GPUs de gama de consumo.
- GPU recomendadas: se exige una GPU NVIDIA con CUDA. Para texto-a-imagen son razonables GPU de centro de datos como A100 (40/80 GB) o H100; el perfil de memoria apunta a que una RTX 4090 (24 GB) puede ser suficiente para la variante de generacion, aunque no se documenta oficialmente.
- Cabe en GPU de consumo: probablemente si para la variante texto-a-imagen en una GPU de 24 GB, condicionado al consumo del codificador de texto y a las activaciones de la difusion en espacio de pixeles a 1024². No hay confirmacion oficial ni cifras de pico de memoria.
- Opciones de despliegue: el flujo oficial es clonar `github.com/speridlabs/iris-3b`, instalar con `pip install -e .` (Python 3.11+, PyTorch 2.7.1+) y ejecutar `scripts/sample.py`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni diffusers.
- Latencia y throughput: no disponibles. La model card solo indica que reducir `--steps` por debajo de 100 acelera la generacion a costa de perder detalle.
- Almacenamiento: el repositorio ocupa 35,9 GB, con unos 12 GB para texto-a-imagen y aproximadamente 12 GB adicionales por cada carpeta de tarea densa.

## Comparativa con modelos similares

| Modelo | Parametros | Espacio de generacion | Contexto/condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris-3B | ~3B | Pixeles (sin VAE) | Codificador de texto Qwen3-VL-4B-Instruct | Apache 2.0 | Pesos en safetensors, codigo y demo publicos |
| FLUX.2 Klein base 4B | 4B | Latente (convertido a pixeles en el paper) | No disponible | No disponible | Modelo preentrenado citado como base de conversion |
| DINOv2 | No disponible | No aplica (modelo de vision, no generativo) | No aplica | No disponible | Cita como referencia de modelo de vision fundacional |

La informacion disponible no incluye resultados comparativos de rendimiento entre estos modelos, por lo que la tabla se limita a caracteristicas estructurales. No hay datos suficientes para comparar calidad de generacion, error de profundidad o fidelidad de restauracion frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos ni la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o de representacion.
- Riesgo de alucinacion: como modelo generativo, puede producir detalles inexistentes o incoherentes respecto al prompt, especialmente en textos dentro de la imagen, manos o estructuras finas.
- Limitaciones de idioma: la model card recomienda escribir los prompts como frases descriptivas en ingles; no hay informacion sobre el comportamiento con otros idiomas.
- Limitaciones de contexto: la longitud de contexto del condicionamiento de texto no esta documentada, lo que impide garantizar el manejo de prompts muy largos.
- Restricciones de licencia: la licencia es Apache 2.0, que en principio permite uso comercial, pero conviene verificar las condiciones del codificador de texto Qwen3-VL-4B-Instruct y de los modelos de los que deriva la conversion (FLUX.2 Klein base 4B), ya que se descargan por separado.
- Requisito de hardware: exige GPU NVIDIA con CUDA; no hay soporte documentado para CPU, Apple Silicon ni aceleradores alternativos.
- Madurez y validacion: la ficha consultada registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay metricas publicadas de calidad, lo que dificulta estimar el rendimiento en produccion.
- Huella de almacenamiento elevada: 35,9 GB de repositorio, con dos variantes de tarea densa de aproximadamente 12 GB cada una.
- Despliegue no estandarizado: no se documenta integracion con diffusers, vLLM u otros runners habituales, lo que obliga a usar el codigo propio del proyecto.

## Enlaces

- Ficha de HuggingFace consultada: https://huggingface.co/suryatmodulus/iris-3b
- Model card oficial referenciada: https://huggingface.co/speridlabs/iris-3b
- Paper: https://arxiv.org/abs/2610.09450
- Pagina del proyecto: https://speridlabs.com/research/iris
- Repositorio de codigo: https://github.com/speridlabs/iris-3b
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/speridlabs/iris-3b
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resumen del paper en arXivLens: https://arxivlens.com/paperview/details/iris-3b-going-beyond-the-latent-with-pixel-space-diffusion-training-conversion-and-fine-tuning-4022-0a29d830
