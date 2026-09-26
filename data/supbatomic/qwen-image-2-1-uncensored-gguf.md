# Supbatomic/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un conjunto de cuantizaciones en formato GGUF del transformer de difusión Qwen/Qwen-Image-2.1, publicadas por el usuario Supbatomic. No se trata de un modelo nuevo ni de un fine-tune: la model card indica explícitamente que la conversión parte de los pesos originales del modelo base (revisión `b3179ad355be050328e483a9dfdd9e60cd62adfa`) sin ablación, sin fine-tuning y sin ninguna otra modificación de pesos. El objetivo es permitir la generación de imágenes texto-a-imagen en local con ComfyUI y el nodo ComfyUI-GGUF, reduciendo el espacio en disco y la VRAM necesaria frente a los pesos en precisión completa.

El componente cuantizado es únicamente el image transformer, con 7.115.124.736 parámetros (~7,1 B) según los datos de safetensors del repositorio. Para inferir hay que descargar aparte el text encoder y el VAE originales desde el repositorio del modelo base, ya que este repositorio no los incluye. Se ofrecen cinco niveles de cuantización (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0), con Q4_K_M recomendado por el autor como mejor equilibrio entre tamaño y calidad, y un tamaño total de repositorio de 27,3 GB.

La etiqueta «uncensored» hace referencia a la ausencia de un safety checker a nivel de pipeline y de lista negra de prompts en las pruebas locales del autor, no a una modificación del comportamiento del modelo. El repositorio acumula 0 descargas y 0 likes, no incluye resultados numéricos de benchmarks y su licencia es la Qwen Research License, cuyos términos deben verificarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (image transformer de Qwen-Image-2.1); el detalle interno no se especifica en la model card |
| Parametros totales | 7.115.124.736 (~7,1 B) en el image transformer |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License (etiquetada como `other` / `qwen-research`) |
| Formato de pesos | GGUF (image transformer); el text encoder y el VAE se distribuyen por separado en safetensors dentro del repositorio del modelo base |

Tamaños de los ficheros publicados:

| Cuantizacion | Fichero | Tamano |
|---|---|---:|
| Q8_0 | qwen-image-2.1-Q8_0.gguf | 7,59 GiB |
| Q6_K | qwen-image-2.1-Q6_K.gguf | 5,88 GiB |
| Q5_K_M | qwen-image-2.1-Q5_K_M.gguf | 5,22 GiB |
| Q4_K_M | qwen-image-2.1-Q4_K_M.gguf | 4,60 GiB |
| Q4_0 | qwen-image-2.1-Q4_0.gguf | 4,05 GiB |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno. Es un artefacto de conversión y cuantización: los pesos del image transformer del modelo Qwen/Qwen-Image-2.1 se han convertido a GGUF mediante stable-diffusion.cpp, en el commit `1330cebae8f2ba99249df846cc0c9444fcbd4308`. La model card insiste en que no se aplicó fine-tuning, abliteración ni ninguna otra modificación de pesos, por lo que las capacidades y los sesgos del modelo son los del original, modulados únicamente por el error introducido por la cuantización.

El pipeline de inferencia es multi-componente: el fichero GGUF sustituye solo al transformer de difusión, mientras que el text encoder y el VAE deben descargarse del repositorio del modelo base y colocarse en los directorios correspondientes de ComfyUI. No se documentan en la información disponible ni la composición del dataset de entrenamiento original, ni el número de tokens, ni si hubo etapas de RLHF o DPO, ni innovaciones de atención o decodificación específicas.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) ejecutada en local.
- Integración con ComfyUI mediante el nodo ComfyUI-GGUF, cargando el fichero GGUF como modelo de difusión.
- Cinco niveles de cuantización que permiten ajustar el equilibrio entre consumo de VRAM, velocidad y fidelidad de la imagen.
- Ausencia de safety checker a nivel de pipeline y de lista negra de prompts en las pruebas locales del autor, lo que permite generar categorías de contenido sensible (adulto, desnudo, violencia) sin rechazos observados en tiempo de ejecución.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de generación de imágenes).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se documenta qué idiomas acepta el text encoder para los prompts.
- Capacidades de visión, audio o modo «thinking»: no disponible.
- Edición de imágenes o image-to-image: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes en local sin dependencia de API: al ejecutarse con ComfyUI sobre los pesos GGUF, permite producir ilustraciones sin enviar prompts a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad o sin conectividad estable.
- Prototipado de producto y UI: generar mockups, ilustraciones de concepto y assets visuales para presentaciones internas usando la cuantización Q4_K_M, que ocupa 4,60 GiB y cabe en GPU de gama media.
- Arte conceptual para videojuegos y animación: iterar sobre personajes, escenarios y paletas con distintas semillas, aprovechando que no hay coste por imagen y que se pueden lanzar lotes nocturnos.
- Generación por lotes para campañas de marketing: producir variantes de una misma idea creativa con diferentes composiciones y estilos para test A/B, seleccionando la cuantización Q8_0 cuando la fidelidad sea prioritaria sobre la velocidad.
- Creación de datasets sintéticos: generar imágenes etiquetadas por prompt para entrenar o evaluar modelos de visión por computador, con la ventaja de conocer exactamente el prompt que originó cada muestra.
- Investigación sobre cuantización de modelos de difusión: comparar las cinco variantes (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0) sobre el mismo prompt y semilla para medir la degradación de calidad y el ahorro de memoria, un experimento reproducible con los ficheros publicados.
- Ejercicios de red teaming y evaluación de moderación: dado que el autor reporta ausencia de filtros en el pipeline local, el modelo puede emplearse para probar la robustez de capas de moderación propias antes de exponer un sistema a usuarios finales.
- Despliegue en estaciones de trabajo con una sola GPU consumer: el fichero Q4_0 de 4,05 GiB permite montar un flujo de generación de imágenes en equipos modestos, siempre que se sume la memoria del text encoder y del VAE.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) sin valores textuales extraíbles, por lo que no es posible comparar puntuaciones de FID, CLIP score ni métricas equivalentes. Tampoco se documenta el impacto medido de la cuantización sobre la calidad final de la imagen.

## Requisitos de hardware

- VRAM estimada para los pesos del transformer: 4,05 GiB (Q4_0), 4,60 GiB (Q4_K_M), 5,22 GiB (Q5_K_M), 5,88 GiB (Q6_K) y 7,59 GiB (Q8_0). Son cifras derivadas del tamaño de los ficheros; hay que sumar la memoria del text encoder, la del VAE y el overhead de activaciones, cuyos tamaños no se detallan en la información disponible.
- Estimación orientativa (no confirmada por el autor): Q4_0 y Q4_K_M podrían ejecutarse en GPUs de 8-12 GB; Q5_K_M y Q6_K en el rango de 12-16 GB; Q8_0 en 16 GB o más. Estas cifras son una estimación y deben validarse en el equipo concreto.
- GPU recomendadas: no disponibles. No se documentan requisitos oficiales ni pruebas sobre A100, H100, RTX 4090 u otros modelos.
- ¿Cabe en GPU consumer? Los tamaños de fichero de las cuantizaciones Q4 y Q5 sugieren que sí en tarjetas de gama media-alta, pero no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (vía recomendada por el autor) y stable-diffusion.cpp, empleado para la conversión. No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / variante | Parametros | Formato y tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supbatomic/Qwen-Image-2.1-Uncensored-GGUF (Q4_K_M) | ~7,1 B (image transformer) | GGUF, 4,60 GiB | No disponible | Qwen Research License | Publicado en HuggingFace, 0 descargas |
| Supbatomic/Qwen-Image-2.1-Uncensored-GGUF (Q8_0) | ~7,1 B (image transformer) | GGUF, 7,59 GiB | No disponible | Qwen Research License | Publicado en HuggingFace, 0 descargas |
| Qwen/Qwen-Image-2.1 (modelo base) | ~7,1 B (image transformer) | safetensors en precisión completa, tamano no disponible | No disponible | Qwen Research License | Repositorio oficial de Qwen |
| Otros modelos de generación de imágenes comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas (por ejemplo, otros modelos de difusión con cuantizaciones GGUF) en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- La etiqueta «uncensored» no implica ninguna modificación de pesos: es una cuantización de los pesos originales. Cualquier diferencia de comportamiento frente al modelo base provendría del pipeline de ejecución, no del modelo.
- La ausencia reportada de safety checker y de lista negra de prompts en local facilita la generación de contenido adulto, violento o potencialmente ilegal según la jurisdicción. La responsabilidad legal y ética del uso recae en quien despliega el modelo.
- No se recomienda exponer este modelo directamente a usuarios finales sin una capa de moderación propia; los servicios alojados pueden aplicar su propia moderación, lo que produce comportamiento distinto entre local y nube.
- Licencia Qwen Research License (etiqueta `other` / `qwen-research`): los términos comerciales no se detallan en esta ficha y deben consultarse en el repositorio del modelo base antes de cualquier uso productivo.
- El repositorio no incluye el text encoder ni el VAE; sin ellos, el fichero GGUF por sí solo no permite inferir. El flujo es incompleto si solo se descarga el GGUF.
- No hay resultados de benchmarks ni evaluación publicada del impacto de la cuantización en la calidad de imagen. Tampoco hay datos de latencia o throughput.
- Riesgo de alucinación visual: al ser un modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible en la imagen o elementos incoherentes con el prompt; no se documenta ninguna métrica de adherencia al prompt.
- Soporte de idiomas no documentado: se desconoce si los prompts funcionan igual de bien en castellano que en otros idiomas.
- El repositorio tiene 0 descargas y 0 likes, se creó el 2026-09-26 y no se ha actualizado desde entonces, por lo que no cuenta con validación de la comunidad.
- Inconsistencia de enlaces: la model card apunta a ficheros bajo el espacio de nombres `abenzerps/` mientras el identificador del repositorio es `Supbatomic/Qwen-Image-2.1-Uncensored-GGUF`. Conviene verificar la integridad de los ficheros con `SHA256SUMS` antes de usarlos.
- El repositorio completo ocupa 27,3 GB; conviene descargar únicamente la cuantización necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Supbatomic/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Sumas de verificación: https://huggingface.co/Supbatomic/Qwen-Image-2.1-Uncensored-GGUF/blob/main/SHA256SUMS
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp (herramienta de conversión): https://github.com/leejet/stable-diffusion.cpp
- La búsqueda web realizada no ha devuelto enlaces técnicos relevantes sobre este modelo.
