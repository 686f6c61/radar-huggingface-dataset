# takshathosani17/qwen2.5-7b-lumen

## Resumen

`qwen2.5-7b-lumen` es un modelo de lenguaje desarrollado por `takshathosani17` como parte del proyecto Lumen Stream Lab. Se trata de un fine-tune derivado de `Qwen/Qwen2.5-7B-Instruct`, distribuido en formato GGUF para facilitar su uso con Ollama. Su función principal es actuar como un "nivel de calidad" (quality tier) dentro de un sistema de enrutamiento de modelos: no está pensado para ser el modelo por defecto, sino para atender consultas largas o que requieran mayor calidad, priorizando el resultado frente a la velocidad.

A pesar del nombre, los pesos safetensors incluidos en el repositorio suman 3.085.938.688 parámetros (~3B), lo que contradice la denominación "7B". El autor indica que el artefacto de trabajo es un GGUF Q4_K_M de ~4,7 GB, con un rendimiento estimado de ~10 tokens/s en 4 GB de VRAM. No se documenta la longitud de contexto ni los idiomas soportados, aunque al partir del modelo base Qwen2.5-7B-Instruct es plausible que herede sus capacidades. La licencia es Apache 2.0, lo que permite su uso comercial sin restricciones especiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 3.085.938.688 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en `Qwen/Qwen2.5-7B-Instruct`. La información disponible no detalla la arquitectura interna más allá de su origen, ni ofrece datos sobre el tamaño de la ventana de contexto. El proceso de entrenamiento se describe en el README como un "soup" (mezcla de pesos) realizado con la configuración `config/soup/soup-7b-stream-s06.yaml` sobre una GPU de referencia GTX 1650. No se aportan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la aplicación de técnicas como RLHF o DPO. La única innovación técnica documentada es la cuantización Q4_K_M, que reduce el tamaño del modelo para su ejecución en hardware modesto.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, aunque no se documentan explícitamente en la ficha.
- Optimizado para consultas largas o de alta calidad dentro de Lumen Stream Lab; el autor recomienda no usarlo como modelo por defecto.
- Integración con Ollama mediante un Modelfile incluido en el repositorio.
- Posible soporte de código, matemáticas y multilingüismo derivado del modelo base, sin confirmación en la documentación proporcionada.
- No se especifica soporte de tool calling, visión, audio ni modo de razonamiento especial.

## Casos de uso

- Enrutamiento de prompts en Lumen Stream Lab: el modelo se usa como nivel de calidad para solicitudes largas o que requieren mayor precisión, mientras el router asigna consultas simples a modelos más rápidos.
- Inferencia local en GPUs de 4 GB: gracias a la cuantización Q4_K_M, puede ejecutarse en tarjetas como la GTX 1650, con un rendimiento aproximado de 10 tokens/s, adecuado para entornos sin GPU dedicada de gama alta.
- Despliegue con Ollama: el repositorio incluye un Modelfile listo para crear una imagen `qwen2.5-7b-lumen`, lo que simplifica su uso en aplicaciones locales o en prototipos.
- Generación de contenido extenso: para redactar documentos, informes o artículos donde la calidad del texto es prioritaria y la latencia no es crítica.
- Asistente en conversaciones largas: si se confirma que hereda la ventana de contexto del modelo base, podría mantener hilos de conversación extensos sin perder información relevante.
- Prototipado de sistemas de IA locales: ideal para desarrolladores que quieren experimentar con un modelo de calidad en hardware limitado, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4 GB para la cuantización Q4_K_M, según el autor.
- GPU recomendada: GTX 1650 (utilizada como laboratorio de referencia) o cualquier GPU con al menos 4 GB de VRAM.
- Compatible con GPU de consumo: sí, especialmente con modelos como GTX 1650, RTX 3050 o similares.
- Opciones de despliegue: Ollama (con Modelfile incluido), llama.cpp y otros runtimes compatibles con GGUF.
- Latencia estimada: ~10 tokens/s en 4 GB de VRAM. Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas con modelos similares en la información proporcionada. El modelo es un derivado de `Qwen/Qwen2.5-7B-Instruct`, y el repositorio menciona la existencia de `qwen2.5-3b-lumen` como modelo por defecto en Lumen Stream Lab, pero no se aportan especificaciones ni resultados de rendimiento que permitan una comparación directa.

## Limitaciones y advertencias

- Discrepancia en la denominación: el nombre sugiere 7B, pero los pesos safetensors suman ~3B. Es necesario verificar el artefacto GGUF antes de usarlo, ya que el README advierte de posibles archivos residuales de un modelo 3B.
- No usar como modelo por defecto: el autor indica explícitamente que el modelo debe reservarse para consultas largas o de alta calidad, debido a su menor velocidad frente a otras opciones.
- Rendimiento limitado: ~10 tokens/s en 4 GB de VRAM puede resultar lento para aplicaciones interactivas en tiempo real.
- Sin documentación de sesgos o alucinaciones: al no ofrecer información específica, se heredan los riesgos del modelo base Qwen2.5-7B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de seguridad ni de adecuación a fines concretos.
- Los idiomas soportados no están documentados, aunque probablemente se conserven los del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/takshathosani17/qwen2.5-7b-lumen
- Proyecto Lumen Stream Lab: https://github.com/taksha17/lumen-stream-lab
- Vídeo de recorrido (60 s): https://github.com/taksha17/lumen-stream-lab#walkthrough-60s
- Perfiles de hardware solicitados: https://github.com/taksha17/lumen-stream-lab/issues/1
