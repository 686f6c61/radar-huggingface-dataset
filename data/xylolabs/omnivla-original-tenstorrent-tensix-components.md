# Xylolabs/omnivla-original-Tenstorrent-Tensix-Components

## Resumen

OmniVLA es una política de navegación robótica visual-lenguaje-acción (VLA) desarrollada originalmente por N. Hirose, cuyo checkpoint original se publica en `NHirose/omnivla-original`. Este repositorio de Xylolabs no es el modelo completo, sino un archivo de componentes de inferencia seleccionados (38 ficheros de tensores) empaquetados para su uso en hardware Tenstorrent Tensix, preservando los valores y dtypes originales. El paquete cubre la extracción de características penúltimas de los backbones DINOv2 y SigLIP, las proyecciones multimodal y de pose, el embedding, 32 bloques bidireccionales de prefijo de lenguaje, la normalización final y la cabeza de regresión de acciones.

La relevancia de este artefacto es de infraestructura: permite portar la política OmniVLA a aceleradores Tensix sin reentrenar, manteniendo la fidelidad numérica respecto al checkpoint original. No obstante, se trata de un archivo de componentes que requiere un adaptador de arquitectura y la integración separada de la política; no es un checkpoint ejecutable de extremo a extremo ni incluye tokenizer, procesador de imagen ni mapeo de nombres.

El modelo consume dos imágenes de 224×224 y una pose de objetivo local para producir acciones de navegación. El archivo ocupa unos 15,0 GB en pesos (15,09 GB de presupuesto con tiles 32×32 antes de buffers de trabajo), lo que lo sitúa fuera del alcance de GPUs de consumo para carga completa en precisión nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrida: backbones de visión DINOv2 y SigLIP + proyecciones multimodal/pose + 32 bloques transformer bidireccionales de prefijo de lenguaje + cabeza de regresión de acciones |
| Parametros totales | no disponible (el archivo contiene 1.026 entradas: 1.018 en BF16 y 8 en FP32; 958 tensores aprendidos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 608 posiciones (tablas rotatorias retenidas) |
| Tipos de cuantizacion | sin cuantización nueva; componentes en BF16 (1.018 entradas, incluidas 64 tablas rotatorias) y FP32 (8 entradas de proyección de pose y constantes de preprocesado) |
| Idiomas soportados | en |
| Licencia | omnivla-mit-llama2-apache2 (MIT de OmniVLA + acuerdo comunitario Llama 2 + Apache 2.0 del backbone; el loader usa Apache 2.0) |
| Formato de pesos | safetensors (BF16/FP32), con `component.json` que describe fichero, forma, dtype y hash de contenido |

## Arquitectura y entrenamiento

La política original OmniVLA combina dos codificadores visuales (DINOv2 con registers large y SigLIP so400m patch14 224) para extraer características penúltimas, que se proyectan junto con la pose de objetivo local a un espacio multimodal. Sobre esa secuencia se aplican 32 bloques transformer con atención bidireccional de prefijo de lenguaje, seguidos de una normalización final y una cabeza de regresión que emite las acciones. El prefijo de lenguaje emplea tablas rotatorias para 608 posiciones.

Este repositorio no documenta el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles. Lo que sí se detalla es el proceso de empaquetado: se excluyen las cabezas de lenguaje y visión no utilizadas, los bloques visuales finales no usados, la cabeza de distancia y el adaptador LoRA separado. Los 958 tensores aprendidos y las cuatro constantes de preprocesado coinciden con los artefactos originales fijados, y las 64 tablas rotatorias reproducen exactamente la generación de referencia en BF16. No se aplica cuantización adicional.

## Capacidades

- Navegación robótica visual-lenguaje-acción: genera acciones a partir de dos imágenes de 224×224 y una pose de objetivo local.
- Extracción de características visuales penúltimas mediante DINOv2 y SigLIP.
- Proyección multimodal que fusiona señales visuales y de pose en un espacio común.
- Razonamiento de prefijo de lenguaje con atención bidireccional sobre 32 bloques.
- Regresión de acciones mediante cabeza dedicada con recorte de token de acción original.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: limitadas a inglés (`en`).
- Capacidades especiales: pensado para despliegue en aceleradores Tenstorrent Tensix; carga por streaming de componentes individuales.

## Casos de uso

- Navegación autónoma de robots móviles en interiores: la política consume dos vistas de 224×224 y una pose de objetivo para emitir comandos de acción, adecuada para tareas de point-goal navigation.
- Portado a aceleradores Tenstorrent: los componentes se cargan por streaming y se suben a Tensix mediante un adaptador, permitiendo ejecutar la política fuera de GPUs convencionales.
- Investigación en VLA: sirve como base para estudiar la contribución de cada bloque (visión, proyección, prefijo de lenguaje) al comportamiento de navegación.
- Evaluación de fidelidad numérica: los hashes y comprobaciones de `component.json` permiten verificar que un port reproduce los tensores originales antes de medir el rendimiento en tarea.
- Integración en pipelines de robótica simulada: al requerir un adaptador de arquitectura, encaja en entornos donde se controla el bucle de inferencia y se dispone del tokenizer y procesador de imagen originales.
- Benchmarking de hardware: útil para medir latencia y throughput de operadores VLA en Tensix, aunque el autor no reporta cifras de velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones de serialización e identidad de fuente (coincidencia de 958 tensores aprendidos, cuatro constantes de preprocesado, cuatro shards safetensors y dos ficheros auxiliares con sus identidades LFS, y reproducción exacta de las 64 tablas rotatorias en BF16). No se reportan métricas de tarea robótica ni de velocidad; el autor indica explícitamente que una política integrada requiere su propia evaluación numérica y de tarea.

## Requisitos de hardware

- VRAM/espacio de dispositivo: aproximadamente 15,09 GB solo para los pesos de los componentes, más espacio para buffers de trabajo (el contenido de tensores es de unos 15,01 GB).
- GPU recomendadas: no especificadas por el autor; por tamaño, requiere GPUs de datacenter con al menos 24-40 GB para carga completa en BF16/FP32 junto con buffers (A100, H100, L40S).
- GPU de consumo: no cabe en tarjetas de 8-16 GB en precisión nativa; no se documenta ninguna cuantización que lo reduzca.
- Hardware objetivo: aceleradores Tenstorrent Tensix, con tiles 32×32 para el presupuesto de pesos.
- Opciones de despliegue: PyTorch + safetensors + huggingface_hub con el loader de streaming incluido (`load_components.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no reportados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVLA (este archivo de componentes) | VLA de navegación | no disponible (15,0 GB de pesos) | 608 posiciones | MIT / Llama 2 / Apache 2.0 | Hugging Face, requiere adaptador |
| NHirose/omnivla-original | VLA de navegación | no disponible | no disponible | MIT / Llama 2 / Apache 2.0 | Hugging Face (checkpoint original) |
| SmolVLA (referenciado en la model card) | VLA | no disponible | no disponible | no disponible | Hugging Face (504 tensores citados) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint ejecutable: es un archivo de componentes que exige un adaptador de arquitectura, tokenizer, procesador de imagen y mapeo de nombres de componente.
- Excluye cabezas de lenguaje y visión no utilizadas, bloques visuales finales, la cabeza de distancia y el adaptador LoRA; un uso que dependa de esas piezas no funcionará con este paquete.
- Debe preservarse la atención bidireccional de prefijo y el recorte original del token de acción al integrar; alterarlos cambia el comportamiento.
- Solo idioma inglés.
- Licencia compuesta (MIT + Llama 2 + Apache 2.0) con obligación de atribución Llama 2 en `NOTICE`; el uso comercial queda sujeto al acuerdo comunitario de Llama 2 y su política de uso aceptable.
- No se reportan evaluaciones de tarea robótica ni de velocidad; las comprobaciones del autor se limitan a serialización e identidad de fuente.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Se entrega "as is", sin garantía.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/omnivla-original-Tenstorrent-Tensix-Components
- Modelo base original: https://huggingface.co/NHirose/omnivla-original
- Proyecto OmniVLA (GitHub): https://github.com/NHirose/OmniVLA
- Llama 2 7B (fuente heredada): https://huggingface.co/meta-llama/Llama-2-7b-hf
- DINOv2 with registers large: https://huggingface.co/facebook/dinov2-with-registers-large
- SigLIP so400m patch14 224: https://huggingface.co/timm/vit_so400m_patch14_siglip_224.webli
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Loader de componentes: https://huggingface.co/Xylolabs/omnivla-original-Tenstorrent-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/omnivla-original-Tenstorrent-Tensix-Components/blob/main/LICENSE
