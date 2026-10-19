# Warumauchimmer/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es un paquete de pesos cuantizados del modelo de difusion text-to-image Qwen/Qwen-Image-2.1, publicado por el usuario Warumauchimmer en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una redistribucion en multiples formatos (GGUF, safetensors en FP8, INT8 y NVFP4, y MLX en 4, 6 y 8 bits) pensada para ejecucion local en ComfyUI, incluyendo los ficheros acompanantes necesarios: el codificador de texto Qwen3-VL 8B y el VAE del modelo.

El repositorio ocupa 105,2 GB e incluye tanto una variante "UC" (uncensored, presuntamente con el alineamiento de seguridad relajado o eliminado) como los ficheros GGUF derivados de los pesos base originales. El modelo declarado tiene 7.115.124.736 parametros (unos 7,1 mil millones) en el transformer de difusion, y se distribuye bajo la licencia qwen-research, que restringe el uso comercial.

Su relevancia practica es acotada pero clara: permite desplegar un generador de imagenes de 7B en hardware de consumo (a partir de ~14 GB de VRAM combinando transformer Q4_K_M y codificador INT8) o en Apple Silicon via MLX, sin depender de APIs externas. Conviene senalar que el repositorio no presenta descargas ni interacciones, y que los enlaces internos de la model card apuntan a otra cuenta (abenzerps) distinta de la que aloja el repositorio, lo que sugiere un re-upload o un espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image; la arquitectura interna (DiT u otra) no se detalla en la informacion disponible |
| Parametros totales | 7.115.124.736 (~7,1 mil millones, segun safetensors) |
| Longitud de contexto | No disponible; no aplica directamente a un modelo text-to-image (la ventana del codificador Qwen3-VL 8B no se especifica) |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0. Safetensors: FP8, INT8 ConvRot, NVFP4. MLX: 4-bit, 6-bit, 8-bit. Codificador de texto: BF16 e INT8 ConvRot |
| Idiomas soportados | No disponibles |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF, safetensors (BF16, FP8, INT8, NVFP4, MLX) y ficheros separados de codificador de texto y VAE |
| Pipeline | text-to-image |
| Libreria | gguf |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Tamano del repositorio | 105,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen-Image-2.1: no se especifica si el transformer de difusion es de tipo DiT, UNet o hibrido, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. Lo que si se deduce de los ficheros publicados es la estructura del pipeline completo: un transformer de difusion de ~7,1 mil millones de parametros, un codificador de texto basado en Qwen3-VL 8B (17,53 GB en BF16, 9,35 GB en INT8 ConvRot) y un VAE de 676 MB en BF16.

Este repositorio no aporta informacion sobre el entrenamiento: no se indican tokens vistos, composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La etiqueta "Uncensored" sugiere una modificacion del alineamiento de seguridad respecto al modelo original, pero la model card no documenta el metodo empleado (fine-tuning, ablation de capas, merging u otro), ni cuantifica el impacto sobre la calidad. La unica innovacion tecnica declarada es la disponibilidad de formatos de cuantizacion especificos: INT8 ConvRot y NVFP4 para GPUs compatibles, y MLX para Apple Silicon, ademas de la serie GGUF estandar de llama.cpp.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), con un codificador de texto Qwen3-VL 8B que aporta comprension linguistica y, potencialmente, entrada visual.
- Ejecucion totalmente local y offline, sin llamadas a APIs externas.
- Multiples niveles de compresion que permiten ajustar el equilibrio calidad/memoria: desde BF16 (14,23 GB) hasta NVFP4 (4,20 GB) o MLX 4-bit (4,00 GB).
- Integracion nativa con ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet), incluyendo los ficheros auxiliares empaquetados en el mismo repositorio.
- Soporte de Apple Silicon a traves de los formatos MLX en 4, 6 y 8 bits.
- Variante sin censura ("UC") que, segun la denominacion del autor, elimina o relaja las restricciones de contenido del modelo original; el alcance real de esta modificacion no esta documentado.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, audio ni video; el pipeline es exclusivamente text-to-image.

## Casos de uso

- Ilustracion editorial y generacion de imagenes de acompanamiento en articulos: el modelo puede producir imagenes a partir de prompts descriptivos dentro de un flujo ComfyUI, con la ventaja de que el transformer en Q4_K_M (4,60 GB) y el codificador INT8 (9,35 GB) caben en una GPU de 16-24 GB.
- Prototipado de concept art en estudios pequenos: iteracion rapida sobre variantes visuales sin coste por llamada de API, usando el formato NVFP4 (4,20 GB) para maximizar velocidad en GPUs compatibles.
- Generacion de assets para videojuegos indie: creacion de ilustraciones de ambientacion, iconos o arte promocional en lotes nocturnos sobre hardware propio, con la cuantizacion Q4_K_M como compromiso recomendado por el autor.
- Investigacion en seguridad y red-teaming de modelos generativos: la variante "Uncensored" permite estudiar el comportamiento de un modelo de difusion sin filtros y analizar sesgos, contenido danino y eficacia de las salvaguardas, en un entorno controlado y aislado.
- Despliegue en estaciones de trabajo Apple Silicon: gracias a los formatos MLX 4-bit y 6-bit (4,00 y 5,78 GB), el modelo puede ejecutarse en un Mac con memoria unificada sin GPU dedicada.
- Pruebas de cuantizacion y evaluacion comparativa: el repositorio ofrece el mismo modelo en diez formatos distintos, lo que permite medir la degradacion de calidad entre BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 con un pipeline identico.
- Automatizacion de catalogos de producto o contenido visual para web, siempre que la licencia qwen-research lo permita y previa revision legal del uso comercial.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan los valores numericos ni las metricas concretas evaluadas en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun los tamanos de fichero publicados (estimacion propia a partir del repositorio, no confirmada por el autor):
  - Configuracion minima viable: transformer Q4_K_M (4,60 GB) + codificador INT8 ConvRot (9,35 GB) + VAE (0,68 GB) = aproximadamente 14,6 GB, mas overhead de ComfyUI, por lo que se recomienda un minimo de 16 GB de VRAM.
  - Configuracion de maxima calidad: transformer BF16 GGUF (14,23 GB) + codificador BF16 (17,53 GB) + VAE = aproximadamente 32,4 GB; requiere 40-48 GB de VRAM.
  - Alternativa de baja memoria: NVFP4 (4,20 GB) o MLX 4-bit (4,00 GB), esta ultima destinada a memoria unificada de Apple Silicon.
- GPU recomendadas: no especificadas por el autor. Por volumen de memoria, encajan GPUs de 24 GB (RTX 3090/4090) en configuracion Q4_K_M con codificador INT8, y A100/H100 de 40-80 GB para BF16 completo. Los formatos NVFP4 e INT8 ConvRot requieren GPUs compatibles con esos tipos, no detalladas en la informacion disponible.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M, Q4_0, Q5_K_M o Q6_K combinadas con el codificador INT8, en tarjetas de 16 GB o mas.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF, en concreto el fork mantenido de leejet, que segun la model card anade soporte nativo para Qwen-Image 2.1 (se advierte de un error `Unknown model architecture!` con el fork antiguo city96). Para Apple Silicon, los ficheros MLX. vLLM, TGI, Ollama y llama.cpp no son aplicables a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este repositorio) | ~7,1 mil millones (transformer) | No disponible | GGUF, FP8, INT8, NVFP4, MLX | qwen-research | HuggingFace, 0 descargas |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace (oficial) |
| Otras alternativas de text-to-image cuantizadas | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables (por ejemplo, otras familias de difusion cuantizadas para ComfyUI), por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion documentada es con el modelo base del que derivan los pesos.

## Limitaciones y advertencias

- La variante "Uncensored" implica la eliminacion o relajacion de los filtros de seguridad del modelo original. No se documenta el metodo ni el grado de modificacion, lo que impide evaluar su impacto en la calidad de generacion y en la coherencia con los prompts.
- Riesgo elevado de generar contenido no apto, con posibles implicaciones legales segun la jurisdiccion. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- La licencia qwen-research (campo `license: other`) establece restricciones de uso, habitualmente limitado a investigacion y no comercial. Es imprescindible revisar los terminos exactos antes de cualquier despliegue en produccion.
- Repositorio sin descargas ni interacciones y con posibles inconsistencias de procedencia: la model card enlaza a la cuenta `abenzerps` mientras el repositorio se aloja en `Warumauchimmer`. No hay garantia de que los pesos correspondan exactamente al modelo base oficial ni de integridad de los ficheros.
- Ausencia total de informacion sobre el dataset de entrenamiento, los sesgos conocidos y las capacidades multilingues. No se puede asumir un comportamiento equilibrado entre idiomas o culturas.
- No se detallan limitaciones de resolucion, relacion de aspecto, numero de pasos de muestreo ni compatibilidad con tecnicas adicionales (LoRA, ControlNet, inpainting); la model card se interrumpe antes de completar la seccion de uso.
- Dependencia de un fork concreto de ComfyUI-GGUF (leejet); el fork antiguo falla con error de arquitectura desconocida, lo que complica la reproducibilidad a medio plazo.
- No apto para tareas de lenguaje: es un modelo de generacion de imagenes y no soporta chat, tool calling ni razonamiento textual, pese a que el codificador de texto sea un modelo de lenguaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Warumauchimmer/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork mantenido, leejet): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo, city96): https://github.com/city96/ComfyUI-GGUF
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- Espejo referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
