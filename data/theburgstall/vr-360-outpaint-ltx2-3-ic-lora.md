# TheBurgstall/VR-360-Outpaint-LTX2.3-IC-LoRA

## Resumen

VR-360-Outpaint 1.0 es un LoRA de condicionamiento (IC-LoRA) desarrollado por TheBurgstall sobre el modelo base de generación de video `Lightricks/LTX-2.3-22B`. Su propósito es convertir clips de video planos (rectilíneos) en vídeos 360° equirectangulares completos, aptos para reproducción inmersiva en VR. La técnica central consiste en aplicar una proyección gnomónica inversa al footage de entrada y componerlo sobre un lienzo equirectangular negro, de modo que el modelo recibe una pista geométrica explícita sobre la posición y el campo de visión de los píxeles conocidos en la esfera. A partir de ahí, el modelo rellena el resto del fotograma equirectangular de forma coherente.

El modelo se distribuye en tres checkpoints (pasos 5000, 7000 y 9000) de aproximadamente 1.3 GB cada uno, y requiere el uso de las herramientas complementarias `ComfyUI-VR-Outpaint-Tools` para realizar la proyección gnomónica y la estimación automática del campo de visión mediante GeoCalib. Es relevante porque permite generar contenido inmersivo a partir de footage convencional sin necesidad de cámaras 360°, abriendo aplicaciones en producción de video, simulación y realidad virtual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de condicionamiento (IC-LoRA) sobre LTX-2.3-22B (modelo base de video) |
| Parametros totales | no disponible (el repo pesa 5.3 GB; cada checkpoint ~1.3 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de video, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente precisión completa) |
| Idiomas soportados | no disponible (el modelo trabaja con captions en inglés) |
| Licencia | burgstall-lora-license-with-ltx-2-community-license-agreement (licencia personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un IC-LoRA (LoRA de condicionamiento) diseñado para el pipeline `video_to_video` de LTX-2.3-22B. La innovación principal no está en la arquitectura del LoRA en sí, sino en el preprocesado geométrico: se aplica una proyección gnomónica inversa al video de entrada, que lo mapea sobre un lienzo equirectangular en la posición angular y campo de visión correctos. Este paso se aplica tanto en entrenamiento como en inferencia, proporcionando un sesgo inductivo que evita que el modelo tenga que descubrir las reglas de proyección esférica por sí mismo.

El entrenamiento utilizó pares de video 360° completos con recortes gnomónicos de un campo de visión y relación de aspecto específicos. No se han publicado detalles sobre el número de tokens, composición del dataset o técnicas de alineación adicionales (RLHF/DPO). El modelo se ofrece en tres checkpoints con diferentes balances entre consistencia equirectangular y variedad de escenas: el paso 7000 es el recomendado por el autor, el 5000 produce resultados más creativos pero con una costura más visible, y el 9000 es el más entrenado.

## Capacidades

- Outpainting de video 360°: convierte un clip plano en un video equirectangular completo, rellenando las regiones desconocidas de forma coherente.
- Consistencia geométrica: gracias a la proyección gnomónica inversa, el modelo comprende la relación espacial entre los píxeles conocidos y el resto de la esfera.
- Compatibilidad con LTX-2.3-22B: se carga como LoRA sobre el modelo base mediante el pipeline `video_to_video` de diffusers o ComfyUI.
- Trigger word y caption específicos: el modelo responde únicamente a la palabra `equirectangular` y al caption `360 degree equirectangular panorama, high quality, detailed`.
- Resolución de salida definida: 1920×960 píxeles, 121 fotogramas a 24 fps.
- Integración con ComfyUI-VR-Outpaint-Tools: incluye nodos para la proyección gnomónica y estimación automática del campo de visión mediante GeoCalib.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo especializado en una única tarea.

## Casos de uso

- Creación de contenido VR para turismo virtual: a partir de un video plano grabado con un dron o una cámara convencional, se genera un entorno 360° que puede visualizarse en gafas de realidad virtual, permitiendo explorar lugares remotos de forma inmersiva.
- Postproducción de video inmersivo: los realizadores pueden ampliar tomas planas existentes a formato 360° para su distribución en plataformas como YouTube VR o Vimeo, sin necesidad de re-grabar con cámaras especializadas.
- Simulación de entornos para entrenamiento: en aplicaciones de simulación industrial o médica, se pueden generar escenarios 360° a partir de footage plano de referencia, reduciendo costes de captura.
- Previsualización arquitectónica: los estudios de arquitectura pueden convertir recorridos planos por maquetas o modelos 3D en visitas 360° interactivas para clientes, usando el outpainting para completar las zonas fuera de cámara.
- Generación de fondos para videojuegos y experiencias interactivas: los desarrolladores pueden crear skyboxes o entornos esféricos a partir de vídeos cortos, acelerando el prototipado de niveles.
- Documental y periodismo inmersivo: los creadores pueden transformar metraje histórico o de archivo (grabado en formato plano) en piezas 360° para narrativas de no ficción, manteniendo la coherencia visual gracias a la proyección gnomónica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base LTX-2.3-22B tiene 22 mil millones de parámetros; la inferencia requiere una GPU con VRAM suficiente para cargar el modelo base más el LoRA.
- Para una resolución de salida de 1920×960 y 121 fotogramas, se recomienda una GPU de gama alta (por ejemplo, RTX 4090 con 24 GB, o A100/H100 para mayor velocidad).
- En cuantización FP16, el modelo base ocuparía aproximadamente 44 GB de VRAM; en INT8 (~22 GB) o INT4 (~11 GB) podría caber en GPUs de 24 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- El despliegue se realiza típicamente mediante ComfyUI (flujo de trabajo incluido) o con la pipeline `video_to_video` de diffusers. No se menciona soporte para vLLM, Ollama o llama.cpp, ya que es un modelo de video.
- El rendimiento (latencia y throughput) no está documentado; dependerá de la GPU, la cuantización y la longitud del video.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible. El outpainting de video 360° mediante proyección gnomónica inversa es una técnica específica sin alternativas directas documentadas en el ecosistema open source actual.

## Limitaciones y advertencias

- La licencia es personalizada (`burgstall-lora-license-with-ltx-2-community-license-agreement`); es necesario revisar los términos completos antes de un uso comercial, ya que pueden imponer restricciones adicionales a las de la licencia del modelo base LTX-2.3.
- El modelo solo produce salida equirectangular; no es un generador de video generalista y no puede utilizarse para otras tareas de video sin reentrenamiento.
- Algunos checkpoints (especialmente el paso 5000) pueden mostrar una costura visible en el punto de envoltura 360°, lo que requiere postprocesado adicional.
- La calidad del outpainting depende de la precisión de la proyección gnomónica y de la estimación del campo de visión; errores en estos pasos degradan la coherencia del resultado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre datos de video no filtrados, puede reproducir sesgos presentes en el contenido de entrenamiento del modelo base.
- El modelo requiere el modelo base LTX-2.3-22B, que no está incluido en el repositorio; el usuario debe descargarlo por separado.
- No hay información sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de escenarios ni la posible alucinación de contenido en regiones desconocidas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/TheBurgstall/VR-360-Outpaint-LTX2.3-IC-LoRA)
- [Herramientas complementarias ComfyUI-VR-Outpaint-Tools](https://github.com/Burgstall-labs/ComfyUI-VR-Outpaint-Tools)
- [Licencia del modelo](https://huggingface.co/TheBurgstall/VR-360-Outpaint-LTX2.3-IC-LoRA/blob/main/LICENSE)
- [Modelo base LTX-2.3-22B](https://huggingface.co/Lightricks/LTX-2.3-22B)
