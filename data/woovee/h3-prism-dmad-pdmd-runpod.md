# Woovee/h3-prism-dmad-pdmd-runpod

## Resumen

PRISM DMAD/PDMD INT8 es un paquete de pesos para generación de vídeo a partir de imagen y texto (image-text-to-video) publicado por Woovee Studio bajo el identificador `Woovee/h3-prism-dmad-pdmd-runpod`. Se trata de un empaquetado de un checkpoint experimental de la familia MiniMax H3, en concreto una variación del modelo base `OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM`, fusionado con los métodos DMAD (peso 0,85) y PDMD (peso 0,333) y cuantizado a INT8. El repositorio incluye además el codificador de texto Qwen compartido, los VAE de vídeo y audio, y un adaptador opcional denominado Realism People.

El modelo resuelve la tarea de generar clips de vídeo con audio a partir de una imagen de referencia y una descripción textual, empaquetando todos los componentes necesarios para su ejecución en un entorno tipo RunPod. Es relevante porque expone públicamente una variación experimental de MiniMax H3 orientada a la comunidad, con instrucciones de despliegue y un manifiesto de componentes (`manifest-prism-latest.json`) que facilita la reproducibilidad del pipeline.

La información técnica disponible es escasa: el autor no publica número de parámetros, longitud de contexto ni resultados de benchmarks, y advierte explícitamente que el empaquetado no implica mayor velocidad ni mejor calidad que la variante previa `Woovee/h3-prism-runpod`. El repositorio ocupa 39,5 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia MiniMax H3; incluye codificador de texto Qwen, VAE de vídeo y VAE de audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (checkpoint `PRISM_DMAD_PDMD_int8.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors (INT8) |
| Tamano del repositorio | 39,5 GB |
| Pipeline | image-text-to-video |
| Modelo base | OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM |
| Revision upstream fijada | c3240ac4508f431899b663cb00062bfa49d4bdc6 |
| Fusiones aplicadas | DMAD a 0,85; PDMD a 0,333 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que el paquete integra un codificador de texto basado en Qwen, un VAE para vídeo y un VAE para audio, lo que confirma un diseño multimodal de difusión (o híbrido difusión-transformer) capaz de generar pistas visuales y sonoras de forma conjunta. El checkpoint es una variación experimental del modelo base de OliviaRossi, obtenida mediante la fusión de los métodos DMAD y PDMD con los pesos indicados (0,85 y 0,333 respectivamente) y posterior cuantización a INT8.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica que la validación de muestreo y de modos se registra por separado, y que los ficheros incluidos son copias sin modificar de los componentes upstream, por lo que las licencias originales y las restricciones territoriales de MiniMax H3 siguen aplicándose.

## Capacidades

- Generación de vídeo condicionada por imagen y texto (image-text-to-video), con capacidad de producir audio asociado gracias al VAE de audio incluido.
- Codificación de prompts textuales mediante el codificador Qwen compartido.
- Adaptador opcional "Realism People" para el modo de realismo humano.
- Integración con el worker PRISM existente, lo que sugiere soporte de ejecución remota en entornos RunPod.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Generación de clips publicitarios a partir de una imagen de producto y un guion breve: el pipeline image-text-to-video permite animar la imagen con audio sincronizado, adecuado para prototipado rápido de creatividades.
- Previsualización de escenas en preproducción audiovisual: directores y storyboarders pueden convertir un frame de referencia en un clip animado con sonido para validar ritmo y encuadre antes del rodaje.
- Creación de contenido para redes sociales: el adaptador Realism People permite generar tomas con figuras humanas realistas a partir de una foto, útil para campañas que requieren presencia de personas sin rodaje.
- Prototipado de videojuegos y experiencias interactivas: generación de cinemáticas o secuencias de transición con audio integrado para maquetas jugables.
- Investigación en generación multimodal: el checkpoint INT8 y la fusión DMAD/PDMD documentada permiten estudiar el efecto de estas técnicas de merge sobre la calidad y coherencia temporal del vídeo generado.
- Despliegue en infraestructura cloud tipo RunPod: el empaquetado incluye todos los componentes y un manifiesto, lo que simplifica la reproducción del entorno en instancias GPU remotas para experimentación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explícitamente que el empaquetado no establece por sí mismo mayor velocidad ni mejor calidad que la variante previa `Woovee/h3-prism-runpod`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 39,5 GB en INT8, por lo que se requiere al menos una GPU con 40-48 GB de memoria para cargar el conjunto completo de componentes (checkpoint, codificador Qwen y ambos VAE) sin offloading.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para ejecución holgada; A100 40 GB podría ser insuficiente si se cargan todos los componentes simultáneamente.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB (RTX 4090) sin técnicas de offloading o cuantización adicional no documentadas.
- Opciones de despliegue: el paquete está pensado para el worker PRISM en RunPod; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Woovee/h3-prism-dmad-pdmd-runpod | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 0 descargas | Variación experimental INT8 con fusión DMAD/PDMD |
| Woovee/h3-prism-runpod | no disponible | no disponible | MiniMax H3 Community License | Hugging Face | Paquete previo del mismo autor, base de comparación citada |
| OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM | no disponible | no disponible | no disponible en la información | Hugging Face | Modelo base upstream del que deriva este checkpoint |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría (generación image-text-to-video).

## Limitaciones y advertencias

- El autor indica explícitamente que el empaquetado no garantiza mayor velocidad ni mejor calidad que la variante previa; se trata de una variación experimental sin validación pública de resultados.
- Ausencia total de benchmarks, métricas de calidad o comparativas publicadas: no es posible evaluar objetivamente su rendimiento frente a alternativas.
- Licencia MiniMax H3 Community License Agreement con restricciones territoriales: es imprescindible revisar `LICENSE-H3.txt` antes de cualquier uso comercial, ya que puede limitar la distribución o el despliegue en determinadas jurisdicciones.
- Los ficheros son copias sin modificar de componentes upstream, por lo que heredan todas las limitaciones y sesgos de los modelos originales (MiniMax H3, Qwen, VAE de vídeo y audio), no documentados en esta ficha.
- Sin información sobre idiomas soportados ni sobre sesgos conocidos.
- Riesgo de alucinación visual y de artefactos temporales inherente a los modelos de generación de vídeo, no cuantificado por el autor.
- El repositorio no registra descargas ni valoraciones, lo que dificulta la validación por parte de la comunidad.
- Requiere hardware de gama alta (≥40 GB de VRAM) para su ejecución completa en INT8.

## Enlaces

- [Hugging Face: Woovee/h3-prism-dmad-pdmd-runpod](https://huggingface.co/Woovee/h3-prism-dmad-pdmd-runpod)
- [Licencia MiniMax H3 (LICENSE-H3.txt)](https://huggingface.co/Woovee/h3-prism-dmad-pdmd-runpod/blob/main/LICENSE-H3.txt)
- [Modelo base: OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM](https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM)
- [Paquete previo: Woovee/h3-prism-runpod](https://huggingface.co/Woovee/h3-prism-runpod)
- [Revision upstream del checkpoint](https://huggingface.co/Woovee/h3-prism-dmad-pdmd-runpod/tree/c3240ac4508f431899b663cb00062bfa49d4bdc6)
