# Woovee/pi-h3-runpod

## Resumen

Pi-H3 es un modelo de generación de vídeo con audio sincronizado desarrollado por Hansheng Chen, Shengquai Cai, Jiaming Song, Gordon Wetzstein, Xinchen Yan y Leonidas Guibas, construido sobre el transformer MiniMax H3. Este repositorio concreto, `Woovee/pi-h3-runpod`, es un empaquetado de inferencia preparado para ComfyUI y Runpod que combina los adaptadores de destilación Pi-H3 (de 2 y 4 pasos) con el transformer FL2VA podado, el codificador de texto Qwen3-VL y los VAE de audio y vídeo distribuidos por Comfy-Org.

El modelo resuelve la generación conjunta de vídeo y pista de audio a partir de prompts de texto y de condicionamiento por primer y último fotograma, a 24 fps. Su interés práctico reside en la destilación: los adaptadores permiten obtener vídeo con audio en solo 2 o 4 pasos de muestreo, lo que reduce drásticamente el coste computacional frente a los pipelines de difusión tradicionales de decenas de pasos.

El repositorio no contiene pesos nuevos: reordena los tensores originales en la estructura de directorios que espera ComfyUI, con un manifiesto que registra repositorio, commit, nombre de fichero, tamaño en bytes y digest SHA-256 de cada componente. El tamaño total del repo es de 47,5 GB y la licencia es la MiniMax H3 Community License Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax H3, variante FL2VA podada) con adaptadores LoRA de destilación, codificador de texto Qwen3-VL-32B y VAE de audio y vídeo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptadores en int8 (sufijo `int8_convrot`); codificador de texto Qwen3-VL-32B en NVFP4; resto de componentes sin cuantización especificada |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (el codificador Qwen3-VL bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptadores LoRA, transformer, VAE y codificador de texto) |

## Arquitectura y entrenamiento

El pipeline se compone de un transformer de difusión MiniMax H3 en su variante FL2VA podada, que actúa como generador principal de vídeo, y de un conjunto de adaptadores LoRA de destilación Pi-H3 que reducen el número de pasos de muestreo a 2 o 4. El condicionamiento textual se realiza mediante Qwen3-VL-32B-Instruct, cuantizado en NVFP4 por Mutaz Al Awamleh (ELK-AI) y convertido por Comfy-Org. La decodificación corre a cargo de dos VAE: uno de vídeo y otro de audio, lo que permite generar imagen y sonido de forma sincronizada.

Los adaptadores se ofrecen en dos variantes de decodificación. La variante DWD (direct pixel prediction) predice los fotogramas finales directamente, mientras que la variante estándar emplea el VAE de vídeo convencional, que además codifica las imágenes de condicionamiento. Existe un VAE Sol adicional para flujos de compatibilidad separados. El modelo acepta prompts de texto y condicionamiento por primer y último fotograma, y produce vídeo a 24 fps con audio sincronizado. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado a 24 fps.
- Generación de vídeo a partir de imagen (image-to-video) y de texto más imagen (image-text-to-video).
- Condicionamiento por primer y último fotograma para controlar el inicio y el final de la secuencia.
- Generación de pista de audio sincronizada con el vídeo mediante VAE de audio dedicado.
- Muestreo acelerado por destilación en 2 o 4 pasos, con dos modos de decodificación (DWD y VAE estándar).
- Integración nativa con ComfyUI mediante flujos de trabajo predefinidos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas distintos de los del codificador Qwen3-VL.

## Casos de uso

- Prototipado rápido de vídeo publicitario: con los adaptadores de 2 pasos y decodificación DWD se puede generar un clip con audio en muy pocas iteraciones, lo que abarata la exploración de variaciones creativas antes de producir la versión final.
- Generación de clips para redes sociales: el condicionamiento por primer y último fotograma permite fijar la imagen de apertura y cierre de un clip vertical, útil para piezas de formato corto con audio integrado.
- Previsualización de storyboards: a partir de un prompt y un fotograma de referencia se obtiene una animática con sonido que sirve para validar ritmo y composición antes del rodaje o la renderización final.
- Interpolación controlada de secuencias: el condicionamiento dual (primer y último fotograma) permite generar el movimiento intermedio entre dos imágenes dadas, aplicable a transiciones en montaje o a la animación de ilustraciones.
- Despliegue en infraestructura cloud tipo Runpod: el empaquetado está pensado para ejecutarse en instancias con GPU y ComfyUI, lo que facilita montar un servicio de generación de vídeo bajo demanda sin gestionar manualmente las dependencias.
- Generación de material audiovisual para entornos de simulación o videojuegos: clips cortos con audio sincronizado para prototipos de escenas, cinemáticas preliminares o pruebas de concepto de arte.
- Investigación en destilación de modelos de difusión: los adaptadores de 2 y 4 pasos sobre un transformer de vídeo-audio sirven como referencia para estudiar el compromiso entre número de pasos y calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 47,5 GB, por lo que se requiere una GPU con al menos esa capacidad de memoria o el uso de offloading a CPU/RAM.
- GPU recomendadas: no se especifican en la información proporcionada. Por el tamaño del pipeline (transformer de vídeo, codificador Qwen3-VL-32B en NVFP4 y dos VAE) se orienta a GPU de centro de datos (A100, H100) o a instancias cloud con memoria unificada amplia.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del conjunto de pesos hace inviable su carga completa en GPUs de consumo de 24 GB sin técnicas de offloading o cuantización adicionales no documentadas.
- Opciones de despliegue: ComfyUI (flujos de trabajo del repositorio ComfyUI-piFlow) sobre Runpod; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles. La ventaja declarada es la reducción a 2 o 4 pasos de muestreo frente a pipelines de decenas de pasos, pero no se aportan cifras de tiempo por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Audio sincronizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi-H3 (este repo) | Difusión vídeo+audio destilada | 2 o 4 | Sí | MiniMax H3 Community License | Hugging Face (empaquetado ComfyUI/Runpod) |
| MiniMax H3 (base) | Difusión vídeo+audio | No disponible | Sí | MiniMax H3 Community License | Hugging Face (Comfy-Org/MiniMax-H3, MiniMaxAI/MiniMax-H3) |
| Lakonik/pi-H3 (upstream) | Difusión vídeo+audio destilada | 2 o 4 | Sí | MiniMax H3 Community License + licencia Pi-H3 | Hugging Face |

La comparación con otros modelos de vídeo de la misma categoría (por ejemplo, familias tipo Wan, HunyuanVideo o CogVideoX) no está disponible en la información proporcionada, por lo que no se incluyen datos de rendimiento ni de contexto frente a ellos.

## Limitaciones y advertencias

- La MiniMax H3 Community License Agreement excluye de su territorio de aplicación a la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos de América, lo que restringe el uso del modelo en esos territorios.
- La licencia impone obligaciones para usuarios intermedios (downstream) y una Acceptable Use Policy recogida en el Exhibit A del acuerdo; es necesario revisarla antes de cualquier despliegue comercial.
- El repositorio no aporta pesos nuevos ni mejoras de calidad: es un reempaquetado de tensores existentes, por lo que hereda cualquier limitación del modelo base y de los adaptadores originales.
- No se documentan idiomas soportados; el comportamiento multilingüe dependerá del codificador Qwen3-VL y no está verificado para el pipeline de vídeo.
- No hay información sobre sesgos, tasa de alucinación visual o fidelidad del audio generado; al tratarse de un modelo generativo de vídeo, existe riesgo de artefactos, incoherencias temporales y desincronización audio-imagen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación comunitaria.
- El tamaño de 47,5 GB y la ausencia de cifras de latencia hacen necesario dimensionar la infraestructura antes de comprometerse con un servicio en producción.
- Dos adaptadores de decodificación estándar comparten nombre de fichero en el upstream, por lo que el autor añade el número de pasos al nombre; hay que verificar el manifiesto para no cargar el adaptador equivocado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Woovee/pi-h3-runpod
- Licencia H3: https://huggingface.co/Woovee/pi-h3-runpod/blob/main/LICENSE-H3.txt
- Manifiesto del paquete: https://huggingface.co/Woovee/pi-h3-runpod/blob/main/manifest.json
- Modelo base Lakonik/pi-H3: https://huggingface.co/Lakonik/pi-H3/tree/4a864589b0fac3d14768f932c930c4dcf1a17b56
- Componentes Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/4b53a35191437de05370da548e59aeabe2a5a09a
- Cuantización Qwen3-VL-32B NVFP4: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4/tree/dfcab1395094f56d3c78ba472158284def0fc278
- Blog del proyecto Pi-H3: https://hanshengchen.com/blog/pi-h3/
- Instalación y flujos de ComfyUI-piFlow: https://github.com/Lakonik/ComfyUI-piFlow/blob/e0ca46f7a7dcd080d8ab1d759719e8bc046617f0/docs/piH3.md
