# TensorForger/Steppe-Flux.2

## Resumen

Steppe-Flux.2 es un modelo generativo de superresolución que opera directamente sobre los latentes del VAE de FLUX.2, desarrollado por TensorForger. No es un modelo de difusión de texto a imagen al uso, sino un *upscaler latente*: recibe un latente ya generado por FLUX.2 [dev], FLUX.2 [klein] o MOSS-Image y lo amplía 2x antes de que el VAE lo decodifique. Esto elimina la necesidad de un segundo pase de muestreo del modelo base, de un *hires fix* o de un prompt adicional.

El modelo se distribuye en tres variantes de pesos (192M y 20.2M de parámetros, en versiones de 1 paso y base), todas en formato bfloat16 safetensors y con licencia MIT. La versión por defecto, `steppe_flux_2_200M_1step`, resuelve la ampliación en un único paso de unos 40 ms de cómputo del modelo para una imagen de 1024 px sobre una RTX 5090, con la mayor parte del tiempo consumida por el decodificado del VAE.

Su relevancia radica en que se integra en el ecosistema FLUX.2 como un adaptador de bajo coste computacional: permite encadenar 2x → 2x (por ejemplo, 960x1280 → 3840x5120) manteniendo detalle fino, con un FID de parche de 1.75 frente a 8.12 del reescalado bicúbico. Está pensado para flujos de trabajo en ComfyUI mediante el nodo ComfyUI-Steppe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de upscaling latente sobre el espacio latente del VAE de FLUX.2 (flow matching, con destilación para las variantes de 1 paso) |
| Parametros totales | 192M (variantes 200M) / 20.2M (variante lite 20M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de imagen sin condicionamiento textual) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, configuración en metadatos) |

## Arquitectura y entrenamiento

Steppe-Flux.2 es un modelo generativo pequeño entrenado exclusivamente para ampliar latentes del VAE de FLUX.2. Trabaja sobre el espacio latente compartido por FLUX.2 [dev], FLUX.2 [klein] (4B y 9B, destilados y base) y MOSS-Image, de modo que el latente ampliado se decodifica directamente con el VAE sin un segundo pase de muestreo del modelo base. La familia emplea *flow matching* y las variantes de 1 paso incorporan destilación para reducir el coste a una sola evaluación.

El control de nitidez se ejerce mediante un condicionamiento de características de alta frecuencia (hff), parametrizado como una estimación absoluta de ruido de Immerkaer normalizada por cuantiles sobre fotos de ReLAION. La variante base permite además guiado sin clasificador (CFG) entre el hff objetivo y el hff nulo, con un coste de dos pases por paso; la variante de 1 paso usa un guiado destilado entrenado en el rango 1-2. El repositorio ocupa 0.8 GB e incluye tres ficheros de pesos con la configuración embebida en los metadatos.

## Capacidades

- Superresolución latente 2x de imágenes generadas por FLUX.2 y MOSS-Image, con encadenado 2x → 2x (por ejemplo, 960x1280 → 3840x5120).
- Decodificado directo por el VAE: no requiere prompt, *hires fix* ni segundo pase del modelo base.
- Control de nitidez y detalle fino mediante el parámetro hff (rango 0-1, por defecto 0.9; -1 deja elegir al modelo).
- Guiado destilado en las variantes de 1 paso (entrenado en 1-2) y CFG sobre hff en la variante base.
- Variante lite de 20.2M con un pase de modelo unas 6 veces más rápido, orientada a salidas muy grandes y uso en tiempo real.
- Compatibilidad nativa con el VAE de FLUX.2 [dev], FLUX.2 [klein] 4B/9B (destilados y base) y MOSS-Image (SFT y base).
- Compatibilidad con el decodificador pequeño TAEF2 (madebyollin/taef2), con el que el pipeline completo baja a unos 19 ms.
- Integración en ComfyUI mediante el nodo ComfyUI-Steppe (flujo `KSampler → Steppe Upscale Latent → VAE Decode`).
- No soporta ampliación temporal (no hay upscaling de tasa de fotogramas, a diferencia de Steppe-Wan2.1).

## Casos de uso

- Ampliación de imágenes generadas en producción: tras un `KSampler` de FLUX.2 [klein] o MOSS-Image, se aplica Steppe sobre el latente y se decodifica, obteniendo el doble de resolución sin un segundo muestreo ni prompt adicional.
- Flujos de trabajo en ComfyUI: el nodo ComfyUI-Steppe se instala desde ComfyUI-Manager (`comfy node install steppe`) y descarga los modelos en el primer uso, lo que facilita su adopción en pipelines existentes.
- Salidas de muy alta resolución: el encadenado 2x → 2x con la variante de 192M permite pasar de 960x1280 a 3840x5120 manteniendo detalle en texturas finas (plumas, cabello, superficies húmedas), como muestran los ejemplos de la model card.
- Iteración rápida y prototipado: la variante lite de 20.2M, con un pase de modelo 6 veces más rápido, sirve para previsualizar ampliaciones o para uso en tiempo real combinada con el decodificador TAEF2 (~19 ms de pipeline).
- Investigación sobre upscaling latente: la variante base (`steppe_flux_2_200M_base`) permite ajustar pasos (1-200, recomendado 30 con sampler Eule) y CFG sobre hff, lo que la hace adecuada para experimentación y análisis del efecto del condicionamiento de alta frecuencia.
- Restauración y mejora de imágenes ya generadas: al operar sobre latentes del VAE de FLUX.2, se puede reampliar una imagen existente sin regenerarla, útil en catalogos de imágenes o assets de juego que ya pasaron por el modelo base.
- Integración con decodificadores alternativos: el soporte de TAEF2 permite montar pipelines de bajo coste donde el cuello de botella del VAE se reduce, adecuado para despliegues con requisitos de latencia estrictos.

## Benchmarks y rendimiento

| Metrica | Steppe-Flux.2 | Bicubico |
|---|---|---|
| FID de parche | 1.75 | 8.12 |
| Mejora frente al upscaler FLUX.2 anterior | -59% | No disponible |
| Tiempo de modelo (1024 px, RTX 5090, modelo por defecto) | ~40 ms | No disponible |
| Pipeline completo con TAEF2 (variante lite) | ~19 ms | No disponible |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K, no aplicables a un modelo de imagen) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0.8 GB y los pesos son de 192M o 20.2M parámetros en bfloat16, por lo que la huella del modelo es reducida y el consumo dominante proviene del VAE de FLUX.2 y del modelo base que genera el latente.
- GPU de referencia: RTX 5090, sobre la que se miden los ~40 ms del pase del modelo por defecto para 1024 px.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos; el requisito real lo impone el modelo FLUX.2/MOSS-Image que produce el latente y el decodificado del VAE.
- Opciones de despliegue: ComfyUI mediante ComfyUI-Steppe (recomendado, con flujo `KSampler → Steppe Upscale Latent → VAE Decode`); instalación manual de los ficheros en `ComfyUI/models/latent_upscale_models`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~40 ms de modelo por imagen de 1024 px con el modelo por defecto; ~19 ms de pipeline completo con la variante lite y el decodificador TAEF2; la mayor parte del tiempo restante corresponde al decodificado del VAE.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Steppe-Flux.2 | 192M / 20.2M | Upscaler latente para VAE de FLUX.2 | 2x, encadenable 2x → 2x | MIT | Hugging Face, ComfyUI |
| Steppe-Wan2.1 | No disponible | Upscaler latente para VAE de Wan 2.1 (con soporte temporal) | No disponible | No disponible | Hugging Face |
| Upscaler FLUX.2 anterior de TensorForger | No disponible | Upscaler latente para VAE de FLUX.2 | 2x | No disponible | Referenciado en la model card |

No se dispone de datos de benchmarks comparativos con otras alternativas de superresolución en la informacion disponible.

## Limitaciones y advertencias

- Solo funciona con latentes del VAE de FLUX.2: no es compatible con FLUX.1, Wan, Qwen-Image, SD3, SDXL ni otros VAE (para Wan 2.1 existe Steppe-Wan2.1).
- No realiza upscaling temporal ni de tasa de fotogramas; es exclusivamente para imágenes.
- No acepta prompt ni condicionamiento textual: el resultado depende del latente de entrada y del parámetro hff.
- El hff actúa con mucha más fuerza en estos modelos que en los de Wan 2.1, por lo que valores altos pueden producir un exceso de nitidez artificial.
- En la variante base, el CFG sobre hff duplica el coste por paso (dos pases).
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de imagen, el riesgo se traslada a artefactos de ampliación en texturas finas.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los modelos base (FLUX.2, MOSS-Image) con los que se combine en producción.
- Requiere ComfyUI-Steppe versión 1.1.0 o superior para el soporte de FLUX.2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorForger/Steppe-Flux.2
- Nodos ComfyUI-Steppe: https://github.com/TensorForger/ComfyUI-Steppe
- Flujos de ejemplo: https://github.com/TensorForger/ComfyUI-Steppe/tree/main/example_workflows
- Steppe-Wan2.1: https://huggingface.co/TensorForger/Steppe-Wan2.1
- Decodificador TAEF2: https://huggingface.co/madebyollin/taef2
- Modelo base FLUX.2 [dev]: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Modelo base MOSS-Image: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio de assets del autor: https://github.com/tensorforger/tensorforger
