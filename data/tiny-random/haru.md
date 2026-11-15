# tiny-random/haru

## Resumen

`tiny-random/haru` es un checkpoint de pruebas publicado por el usuario `tiny-random` en Hugging Face. No es un modelo destinado a uso real: se trata de una versión aleatoriamente inicializada (randomly initialized) y drásticamente reducida del modelo `higurashi-ai/Haru-4B`, pensada exclusivamente para test y depuración de la infraestructura de inferencia del proyecto Haru. El pipeline declarado es `audio-to-audio` y la librería asociada es `haru`, un paquete Python propio del proyecto.

El modelo conserva la topología del original Haru-4B: un backbone de lenguaje derivado de Qwen3.5 con atención híbrida (tres capas de atención lineal por cada capa de atención completa), un códec de audio VibeVoice y una cabeza MeanFlow para la generación de audio en modo full-duplex. Sin embargo, todas las dimensiones están colapsadas: 8 capas en lugar de 32, anchura oculta de 32 en lugar de 2.560, 8,36 millones de parámetros en total frente a los 5,27 mil millones del modelo original.

Su relevancia es puramente instrumental. Permite verificar que el código de carga de pesos, la sesión duplex, el códec y la cabeza de generación funcionan de extremo a extremo sin necesidad de GPU de gran capacidad ni de descargar 10,54 GB de pesos. No debe emplearse para generar audio o texto con calidad, ni para evaluación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa) con códec de audio y cabeza MeanFlow |
| Parametros totales | 8.355.227 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 16,7 MB) |

## Arquitectura y entrenamiento

El modelo replica la estructura de Haru-4B con dimensiones reducidas. El backbone de lenguaje sigue el diseño de Qwen3.5 con una cadencia de atención de tres capas lineales seguidas de una capa de atención completa; en esta versión tiny hay 8 capas, lo que equivale a dos ciclos completos de esa cadencia. La anchura oculta es de 32 y la MLP de 64, con 4 cabezas de consulta, 1 cabeza de clave/valor y dimensión de cabeza 16. El vocabulario se mantiene intacto en 248.320 entradas con embeddings atados (tied embeddings).

El componente de audio emplea el códec VibeVoice en configuración mínima (base 1, profundidad 1), con latentes de 64 dimensiones a 7,5 Hz. La cabeza MeanFlow consta de una sola capa y un único paso de integración. No se ha realizado entrenamiento alguno: los pesos son aleatorios, según indica explícitamente la model card. No hay información sobre datos de entrenamiento, tokens procesados, RLHF/DPO ni innovaciones técnicas más allá de la propia arquitectura heredada del modelo base.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no han sido entrenados.
- La infraestructura asociada (`haru.DuplexSession`) permite ejecutar sesiones full-duplex con frames de 133 ms y audio de 3.200 muestras por frame.
- El pipeline declarado es `audio-to-audio`, con generación simultánea de tokens de texto y audio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio de entrada real: no disponible.

## Casos de uso

- Pruebas de integración del paquete `haru`: verificar que `HaruModel.from_pretrained`, `DuplexConfig` y `DuplexSession` funcionan correctamente antes de desplegar el modelo real Haru-4B.
- Depuración de pipelines de audio-to-audio: comprobar formas de tensor (`frame.audio.shape == (3200,)`), rangos de tokens (`0 <= frame.token < 248320`) y valores finitos en la salida sin coste computacional.
- Validación de CI/CD: ejecutar tests de regresión del código de inferencia en entornos sin GPU, ya que solo las capas de atención lineal requieren CUDA y el códec y la cabeza pueden correr en CPU.
- Desarrollo de harnesses de evaluación: construir y probar utilidades de benchmarking o logging contra un modelo de tamaño manejable antes de escalar al modelo de 4B.
- Verificación de compatibilidad de versiones de la librería `haru`: detectar roturas de API entre releases con un checkpoint de 16,7 MB.
- Reproducción de entornos: el repo incluye `.meta/create_model.py`, `.meta/model.log` y `.meta/env.json` para regenerar el checkpoint de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (8,36 M de parámetros); el checkpoint completo pesa 16,7 MB.
- GPU recomendadas: cualquier GPU con soporte CUDA para las capas de atención lineal; el resto del modelo puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU exclusivamente.
- Opciones de despliegue: el paquete propio `haru` (instalable vía `pip install 'git+https://github.com/higurashi-ai/Haru#subdirectory=haru'`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el ejemplo de la model card ejecuta seis frames de 133 ms con una voz de referencia sintética.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| tiny-random/haru | 8,36 M | no disponible | no disponible | Test y depuracion |
| higurashi-ai/Haru-4B | 5,27 B (BF16) | no disponible | no disponible | Audio-to-audio full-duplex |
| Otros modelos audio-to-audio | no disponible | no disponible | no disponible | no disponible |

La única comparación significativa es con su modelo base, Haru-4B, del que este checkpoint es una versión reducida y aleatoria. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto ni audio coherente. Cualquier salida debe considerarse ruido.
- No ha sido entrenado ni ajustado; no existen sesgos aprendidos, pero tampoco capacidades útiles.
- Riesgo de alucinación: total, en el sentido de que toda salida es sintética y sin significado.
- La licencia no está especificada, lo que impide determinar condiciones de uso comercial.
- No se declaran idiomas soportados.
- No debe utilizarse en producción, evaluación de calidad ni demostraciones públicas.
- El repositorio está generado automáticamente por `GPT-6.1-Sol`, según indica la model card, lo que refuerza su carácter de artefacto de prueba.
- El modelo base Haru-4B y la librería `haru` deben consultarse por separado para conocer las restricciones reales del sistema completo.

## Enlaces

- [Hugging Face: tiny-random/haru](https://huggingface.co/tiny-random/haru)
- [Modelo base: higurashi-ai/Haru-4B](https://huggingface.co/higurashi-ai/Haru-4B)
- [Repositorio del proyecto Haru](https://github.com/higurashi-ai/Haru)
- [Script de creación del checkpoint](https://huggingface.co/tiny-random/haru/blob/main/.meta/create_model.py)
- [Log de estructura del modelo](https://huggingface.co/tiny-random/haru/blob/main/.meta/model.log)
- [Entorno de generación](https://huggingface.co/tiny-random/haru/blob/main/.meta/env.json)
