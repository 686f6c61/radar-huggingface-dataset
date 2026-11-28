# Teriks/Kandinsky-5.0-T2V-Lite-nocfg-10s-quants

## Resumen

Teriks/Kandinsky-5.0-T2V-Lite-nocfg-10s-quants es un conjunto de cuantizaciones del transformer del modelo de generación de vídeo texto-a-vídeo Kandinsky 5.0 T2V Lite en su variante "nocfg" de 10 segundos, publicado originalmente por kandinskylab. El repositorio no contiene un modelo nuevo, sino versiones comprimidas del componente `transformer` (`Kandinsky5Transformer3DModel`) del pipeline `Kandinsky5T2VPipeline`, generadas con la herramienta dgenerate 6.0.0. El objetivo es reducir el peso del transformer para que pueda ejecutarse en hardware de consumo y en flujos de trabajo ComfyUI.

El transformer original cuenta con 2.007.702.848 parámetros (aproximadamente 2.000 millones), un tamaño que en precisión completa ocuparía unos 4 GB solo en pesos. Las cuantizaciones publicadas van desde Q2_K (638,8 MB) hasta Q8_0 (2,0 GB), pasando por formatos IQ4_XS, Q5_K y Q6_K, además de dos variantes en safetensors para ComfyUI: `float8_e4m3fn` e `int8_tensorwise`, ambas de 1,9 GB. Esta variedad permite ajustar el equilibrio entre calidad de vídeo generado y VRAM disponible.

La relevancia de este repositorio es práctica: facilita el despliegue local de un modelo de vídeo de 10 segundos en GPUs de consumo mediante llama.cpp o ComfyUI, sin necesidad de descargar los pesos completos del modelo base. Al tratarse de una cuantización, la licencia y las capacidades heredan las del modelo original, y el autor indica explícitamente que la licencia del modelo fuente se aplica a estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D (`Kandinsky5Transformer3DModel`) para difusión texto-a-vídeo |
| Parametros totales | 2.007.702.848 (componente transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible (el prompt de texto depende del codificador de texto del pipeline base) |
| Licencia | la del modelo fuente `kandinskylab/Kandinsky-5.0-T2V-Lite-nocfg-10s-Diffusers` (no especificada en la información disponible) |
| Formato de pesos | GGUF (nombres nativos, `-comfy` y `-llama`) y safetensors ComfyUI |

## Arquitectura y entrenamiento

El componente cuantizado es un transformer 3D de difusión (`Kandinsky5Transformer3DModel`) que forma parte del pipeline `Kandinsky5T2VPipeline` de generación de vídeo a partir de texto. El repositorio solo incluye el submodelo `transformer`; el resto de componentes del pipeline (codificador de texto, VAE, scheduler) deben tomarse del repositorio base `kandinskylab/Kandinsky-5.0-T2V-Lite-nocfg-10s-Diffusers`. La variante "nocfg" hace referencia a una configuración sin classifier-free guidance, y "10s" a la generación de clips de 10 segundos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio de cuantización no los detalla. La innovación técnica de este repositorio es exclusivamente la cuantización: se han generado 14 archivos, 12 en GGUF (desde Q2_K hasta Q8_0, incluyendo los formatos IQ) y 2 en safetensors para ComfyUI (`float8_e4m3fn` e `int8_tensorwise`). Los archivos con sufijo `-comfy` usan nombres de tensor de ComfyUI y los `-llama` usan nombres de llama.cpp; el resto conserva los nombres originales del componente.

## Capacidades

- Generación de vídeo a partir de texto (texto-a-vídeo) de clips de 10 segundos mediante el pipeline Kandinsky 5.0 T2V Lite.
- Funcionamiento sin classifier-free guidance (variante "nocfg"), lo que reduce el coste computacional en inferencia.
- Ejecución en cuantizaciones de 2 a 8 bits según el equilibrio calidad/VRAM deseado.
- Compatibilidad con ComfyUI mediante los safetensors `float8_e4m3fn` e `int8_tensorwise`.
- Compatibilidad con llama.cpp y herramientas GGUF para los 12 formatos publicados.
- Integración con la herramienta dgenerate 6.0.0 para flujos de cuantización y despliegue.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión en la información disponible.

## Casos de uso

- Generación de vídeo local en GPU de consumo: usar el GGUF Q4_K (1,1 GB) o IQ4_XS (1,0 GB) junto con el pipeline base para crear clips de 10 segundos en una RTX 4090 o similar, reduciendo la VRAM necesaria frente a los pesos completos.
- Prototipado en ComfyUI: cargar `transformer-float8_e4m3fn-comfy.safetensors` o `transformer-int8_tensorwise-comfy.safetensors` como componente del pipeline para iterar rápidamente sobre prompts y estilos sin gestionar formatos GGUF.
- Despliegue en entornos con VRAM limitada: emplear Q2_K (638,8 MB) o Q3_K (832,9 MB) en GPUs de gama media para generar borradores de vídeo y validar ideas antes de renderizar con mayor calidad.
- Pruebas de calidad vs. tamaño: comparar las 14 variantes sobre el mismo prompt para medir la degradación visual introducida por cada nivel de cuantización y elegir el punto óptimo para producción.
- Integración en pipelines automatizados de vídeo: invocar el transformer cuantizado desde scripts con dgenerate o llama.cpp para generar contenido de vídeo por lotes en servidores con GPUs de 16-24 GB.
- Investigación sobre cuantización de modelos de difusión de vídeo: usar este repositorio como referencia para estudiar el impacto de Q2_K a Q8_0 y de float8/int8 en un transformer 3D de 2.000 millones de parámetros.
- Archivado y distribución ligera: distribuir el modelo en repositorios de menor tamaño (el repo completo ocupa 19,4 GB, frente a los pesos completos del modelo base) para entornos con ancho de banda restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 0,7 GB (Q2_K), 1,0-1,4 GB (Q3_K a Q5_K), 1,5 GB (Q6_K) y 2,0 GB (Q8_0) solo para los pesos del transformer; hay que sumar la VRAM del codificador de texto, el VAE y los buffers de activación del pipeline.
- El repositorio completo ocupa 19,4 GB, pero cada archivo individual pesa entre 638,8 MB y 2,0 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para el pipeline completo; las cuantizaciones bajas (Q2_K, Q3_K, IQ4_XS) permiten probar en GPUs de 8-12 GB si el resto del pipeline cabe en memoria.
- Cabe en GPU de consumo: sí, el transformer cuantizado en Q4_K o inferior ocupa alrededor de 1 GB, aunque el pipeline completo requiere más VRAM por los demás componentes.
- Opciones de despliegue: llama.cpp (archivos GGUF), ComfyUI (safetensors `float8_e4m3fn` e `int8_tensorwise`), dgenerate 6.0.0; vLLM y TGI no están documentados para este pipeline de difusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2V-Lite-nocfg-10s-quants | 2.007.702.848 | no disponible | GGUF (12), safetensors ComfyUI (2) | la del modelo base | Hugging Face |
| kandinskylab/Kandinsky-5.0-T2V-Lite-nocfg-10s-Diffusers (base) | 2.007.702.848 | no disponible | safetensors (precisión completa) | no disponible | Hugging Face |
| Otras cuantizaciones GGUF del mismo pipeline | no disponible | no disponible | GGUF | la del modelo base | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización, introduce degradación de calidad respecto a los pesos originales; los formatos Q2_K y Q3_K son los más agresivos y pueden producir artefactos visibles en el vídeo.
- Solo se incluye el componente `transformer`; es obligatorio mantener el repositorio base como modelo y pasar el archivo de cuantización con la opción de componente correspondiente para que la configuración siga proviniendo del repositorio original.
- Los archivos con sufijo `-comfy` usan nombres de tensor de ComfyUI y los `-llama` nombres de llama.cpp; mezclar formatos con la herramienta equivocada provocará errores de carga.
- La licencia no está especificada en este repositorio; el autor remite a la licencia del modelo fuente, por lo que el uso comercial debe verificarse en `kandinskylab/Kandinsky-5.0-T2V-Lite-nocfg-10s-Diffusers`.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; al ser un modelo de vídeo, los sesgos del dataset de entrenamiento del modelo base pueden reflejarse en el contenido generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del comportamiento de estas cuantizaciones.
- No se dispone de información sobre el contexto máximo, los idiomas del prompt ni los requisitos exactos de VRAM del pipeline completo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Lite-nocfg-10s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Lite-nocfg-10s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
