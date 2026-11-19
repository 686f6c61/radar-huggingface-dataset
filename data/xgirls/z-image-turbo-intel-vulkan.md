# xgirls/Z-Image-Turbo-Intel-Vulkan

## Resumen

Z-Image-Turbo-Intel-Vulkan es una receta de despliegue empaquetada por el usuario xgirls para ejecutar el modelo de generación de imágenes Tongyi-MAI/Z-Image-Turbo sobre GPUs Intel mediante la API Vulkan en Windows. No se trata de un modelo entrenado desde cero, sino de una combinación fijada de pesos cuantizados en GGUF (denoiser en Q3_K, codificador de texto Qwen3 4B en Q3_K_S y VAE completo) junto con un script de ejecución (`run.py`) y un fichero de presets, orientada a equipos con gráficas Intel Arc o Iris Xe.

El objetivo es ofrecer una vía de inferencia de text-to-image de bajo coste en hardware Intel, un ecosistema tradicionalmente menos cubierto por las herramientas de difusión. La receta descarga 5,37 GB de activos y reserva un presupuesto de 6 GiB de memoria en tiempo de ejecución, lo que la sitúa en el rango de GPUs consumer y de portátiles con gráfica integrada.

La relevancia actual radica en la combinación de un modelo turbo (pocos pasos de inferencia) con cuantizaciones agresivas y una pila nativa Vulkan a través de stable-diffusion.cpp, lo que permite generar imágenes de 512×512 en torno a 13-20 segundos en una Intel Arc B390 según las mediciones del autor. El repositorio no incluye los pesos directamente (tamaño de 0,0 GB) y su licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (denoiser de Z-Image-Turbo) con codificador de texto Qwen3 4B y VAE; inferencia vía stable-diffusion.cpp sobre Vulkan |
| Parametros totales | no disponible (el denoiser se distribuye cuantizado en Q3_K; el codificador es un Qwen3 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K (denoiser), Q3_K_S (codificador Qwen3 4B), VAE sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (consumidos por stable-diffusion.cpp); pesos no alojados en el repo, descargados de fuentes externas con verificación SHA-256 |

## Arquitectura y entrenamiento

La receta no entrena ningún modelo: reutiliza el denoiser de Tongyi-MAI/Z-Image-Turbo (modelo de difusión latente para text-to-image), el codificador de texto Qwen3-4B-Instruct-2507 en su versión GGUF publicada por Unsloth y el VAE de Comfy-Org. La innovación del paquete es de ingeniería de despliegue: fija versiones concretas de cada componente, verifica los pesos contra digests SHA-256 y proporciona un runner en Python que invoca stable-diffusion.cpp sobre Vulkan en Windows de 64 bits.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones arquitectónicas internas del denoiser. La configuración de inferencia documentada emplea 8 pasos, CFG 1 y semillas fijas para el benchmark incluido, lo que es coherente con un modelo de tipo turbo destilado para pocos pasos.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) a resolución 512×512 en la configuración de referencia.
- Inferencia con pocos pasos (8 steps, CFG 1) gracias a la naturaleza turbo del modelo base.
- Ejecución nativa sobre Vulkan en Windows 11 con drivers Intel, sin depender de CUDA.
- Benchmark integrado que genera dos muestras, guarda PNGs, tiempos y un log de Vulkan.
- Soporte de prompts con texto renderizado en la imagen, aunque con calidad limitada: en la prueba del autor el cartel generado contenía errores de ortografía y reordenación de letras.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking; el pipeline es exclusivamente text-to-image.

## Casos de uso

- Generación de ilustraciones rápidas en equipos con GPU Intel Arc: la receta permite obtener imágenes de 512×512 en unos 13-20 segundos en una Arc B390, adecuada para iteración creativa local sin GPU NVIDIA.
- Prototipado de pipelines de difusión en portátiles con Iris Xe: el presupuesto de 6 GiB y los 5,37 GB de descarga hacen viable probar text-to-image en hardware integrado, aunque el autor indica que falta validar tiempos y comportamiento de drivers en Iris Xe.
- Pruebas de concepto de generación de imágenes en Windows sin CUDA: útil para equipos de desarrollo que solo disponen de gráficas Intel y quieren evitar dependencias de PyTorch/CUDA.
- Evaluación comparativa de cuantizaciones: al fijar Q3_K y Q3_K_S, sirve para medir el impacto de cuantizaciones agresivas en calidad y velocidad frente a recetas más pesadas.
- Generación de imágenes de referencia para maquetas y wireframes: la coherencia del sujeto (el zorro de ejemplo) es suficiente para bocetos conceptuales, aunque no para tipografía precisa.
- Automatización por lotes en local: el runner con semillas fijas y salida a directorio permite reproducir resultados y generar variaciones controladas en un flujo de trabajo por script.

## Benchmarks y rendimiento

| Prueba | Hardware / software | Resultado |
|---|---|---|
| Primera imagen 512×512 desde el arranque del servidor | Windows 11, Intel Arc B390, driver 32.0.101.9033, stable-diffusion.cpp 532d2c1 | 20,01 s |
| Segunda petición 512×512 | Mismo entorno | 12,92 s |
| Memoria asignada a Vulkan | Mismo entorno | 4.952 MB de parámetros (excluye buffers de ejecución y overhead del driver) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: presupuesto de 6 GiB solicitado por la receta; 4.952 MB de parámetros asignados a Vulkan en la prueba del autor, sin contar buffers de ejecución ni overhead del driver.
- GPU recomendadas: Intel Arc (probado en Arc B390). Iris Xe pendiente de validación según el autor.
- Cabe en GPU consumer: sí, en el rango de 6 GiB o superior; validado en Intel Arc B390.
- Sistema operativo: Windows de 64 bits con driver Intel con soporte Vulkan; Python 3.10 o superior.
- Opciones de despliegue: stable-diffusion.cpp (versión fijada 532d2c1) a través del runner `run.py` incluido; descarga de activos con `huggingface_hub`.
- Latencia y throughput: 20,01 s para la primera imagen y 12,92 s para la segunda en 512×512, 8 pasos, CFG 1.
- Almacenamiento: 5,37 GB de activos descargados.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo-Intel-Vulkan (esta receta) | Difusión latente cuantizada Q3_K, Vulkan | 512×512 en la prueba | 12,92-20,01 s por imagen en Arc B390 | Apache 2.0 | Repo de 0,0 GB; pesos descargados de terceros |
| Tongyi-MAI/Z-Image-Turbo (base) | Difusión latente original | no disponible | no disponible | Apache 2.0 | Hugging Face |
| MOSS-Image-SFT-HaDeS-Intel-GGUF (receta del mismo autor) | Difusión latente GGUF para Intel | no disponible | Mejor en tipografía que esta receta según el autor | no disponible | Hugging Face |
| leejet/Z-Image-Turbo-GGUF | Denoiser GGUF | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El repositorio no aloja los pesos (tamaño 0,0 GB); la receta depende de descargas externas de Hugging Face verificadas por SHA-256, lo que introduce dependencia de la disponibilidad de esos repos.
- Calidad tipográfica limitada: en la prueba del autor el cartel generado tenía errores de ortografía y reordenación de letras; para texto en imagen se recomienda la receta MOSS HaDeS del mismo autor.
- Validación incompleta en hardware: solo se probó en Intel Arc B390 con un driver concreto; Iris Xe y otros drivers quedan pendientes de verificación.
- La cuantización Q3_K del denoiser y Q3_K_S del codificador puede degradar la fidelidad frente a pesos sin cuantizar; no se aportan métricas de calidad objetivas.
- La licencia Apache 2.0 se hereda del modelo base, pero los pesos de terceros (denoiser de leejet, encoder de Unsloth, VAE de Comfy-Org) pueden tener condiciones propias que conviene revisar antes de uso comercial.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe del codificador de texto en esta receta.
- Riesgo de alucinación visual y de composición: la coherencia del sujeto no garantiza el cumplimiento exacto del prompt, como muestra el fallo de tipografía.
- Entorno de ejecución restringido a Windows con Vulkan y Python 3.10+; no se documenta soporte para Linux, macOS ni otras APIs gráficas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/Z-Image-Turbo-Intel-Vulkan
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Denoiser GGUF de leejet: https://huggingface.co/leejet/Z-Image-Turbo-GGUF
- Codificador Qwen3 4B GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- VAE de Comfy-Org: https://huggingface.co/Comfy-Org/z_image_turbo
- Receta MOSS HaDeS del mismo autor: https://huggingface.co/xgirls/MOSS-Image-SFT-HaDeS-Intel-GGUF
