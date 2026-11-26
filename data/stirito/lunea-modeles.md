# Stirito/lunea-modeles

## Resumen

Lunea-modeles es un repositorio de pesos en formato ONNX publicado por el usuario Stirito, pensado para ejecutar generación de imágenes en dispositivos Android. No se trata de un modelo de lenguaje, sino de un paquete de componentes para un pipeline de difusión: una UNet basada en LCM Dreamshaper v7 (derivada de Stable Diffusion 1.5) con un IP-Adapter Plus SD 1.5 acoplado, y un codificador de imagen CLIP ViT-H/14 junto con la proyección del IP-Adapter, comprimido a int8.

El propósito declarado es el dibujo o generación de ilustraciones en teléfono, aprovechando la reducción de pasos de muestreo que ofrece LCM (Latent Consistency Models) y la capacidad del IP-Adapter de condicionar la generación a una imagen de referencia. El repositorio ocupa 4,8 GB y no incluye pipeline declarado, idiomas ni métricas de rendimiento en la información disponible.

La relevancia de este paquete es acotada: no aporta un modelo nuevo entrenado desde cero, sino un empaquetado de componentes conocidos (Dreamshaper, IP-Adapter, CLIP ViT-H/14) convertidos a ONNX para inferencia en móvil. Su interés práctico depende de la cadena de herramientas ONNX Runtime Mobile que se use para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión latente (Stable Diffusion 1.5 / LCM Dreamshaper v7) + IP-Adapter Plus SD 1.5 + codificador de imagen CLIP ViT-H/14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | int8 en el codificador de imagen y la proyección IP-Adapter; el resto de componentes sin cuantización declarada |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M), con componentes adicionales bajo MIT y Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El paquete se compone de dos directorios. `unet_ip/` contiene una UNet LCM Dreamshaper v7, obra de SimianLuo bajo licencia MIT y derivada de Stable Diffusion 1.5 (CreativeML Open RAIL-M), con un IP-Adapter Plus SD 1.5 de h94/IP-Adapter (Apache 2.0) configurado con un peso de 0,6. `ip_encodeur/` contiene el codificador de imagen CLIP ViT-H/14 de laion (MIT) más la proyección del IP-Adapter Plus, comprimido a int8.

No se aportan datos sobre el entrenamiento original de Dreamshaper ni sobre el proceso de conversión a ONNX, el número de pasos LCM configurados, el scheduler o los parámetros de muestreo recomendados. La información disponible no detalla el dataset de entrenamiento ni si hubo ajuste fino adicional por parte del autor del repositorio.

## Capacidades

- Generación de imágenes a partir de texto mediante difusión latente con muestreo LCM, orientada a pocos pasos de inferencia.
- Condicionamiento por imagen de referencia mediante IP-Adapter Plus, con peso 0,6, para transferir estilo o contenido visual.
- Ejecución en dispositivos Android mediante ONNX Runtime, según el propósito declarado en la model card.
- Codificación de imágenes de referencia con CLIP ViT-H/14 comprimido a int8.
- No se declaran capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multilingüismo.

## Casos de uso

- Generación de ilustraciones en apps Android: el paquete ONNX permite integrar un pipeline de difusión LCM en una aplicación móvil sin depender de servidores, siempre que se disponga de un runtime ONNX compatible y de la memoria suficiente en el dispositivo.
- Transferencia de estilo a partir de una foto: el IP-Adapter Plus con peso 0,6 permite condicionar la imagen generada a una referencia visual, útil para funciones de "dibuja esto" en apps de edición.
- Prototipado de funciones creativas en móvil: sirve para validar la viabilidad de generación de imágenes en hardware limitado antes de invertir en un pipeline propio.
- Aplicaciones de avatares o stickers: la combinación de LCM y condicionamiento por imagen facilita generar variaciones rápidas de un personaje a partir de una referencia.
- Investigación sobre cuantización int8 en el codificador CLIP: el repositorio permite estudiar el impacto de comprimir el codificador de imagen del IP-Adapter en la calidad final.
- Pruebas de despliegue ONNX en Android: útil como banco de pruebas para medir latencia y consumo de memoria de un pipeline de difusión en dispositivos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio está orientado a ejecución en móvil, no a GPU de escritorio.
- GPU recomendadas: no disponible; el destino declarado es Android con ONNX Runtime.
- Cabe en GPU de consumo: no confirmado; el tamaño del repo (4,8 GB) sugiere que la inferencia completa requiere varios gigabytes de memoria, lo que puede exceder la memoria disponible en muchos teléfonos.
- Opciones de despliegue: ONNX Runtime (incluida la variante Mobile para Android); no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Stirito/lunea-modeles | Pipeline de difusión ONNX (SD 1.5 + IP-Adapter) | no disponible | no aplica | creativeml-openrail-m | ONNX |
| SimianLuo/LCM_Dreamshaper_v7 | UNet LCM para difusión | no disponible | no aplica | MIT (derivada de SD 1.5) | safetensors |
| h94/IP-Adapter | Adaptador de imagen para SD | no disponible | no aplica | Apache 2.0 | safetensors |
| Stable Diffusion 1.5 (runwayml) | Difusión latente | no disponible | no aplica | creativeml-openrail-m | safetensors |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de texto ni usarse para tareas de NLP.
- La licencia CreativeML Open RAIL-M impone restricciones de uso, incluidas limitaciones sobre usos dañinos o ilícitos; es obligatorio revisar el texto completo de la licencia antes de un uso comercial.
- El repositorio no declara pipeline, idiomas ni parámetros de muestreo, lo que dificulta su uso reproducible sin ingeniería inversa de los archivos ONNX.
- El rendimiento real en Android no está documentado: no hay datos de latencia, memoria pico ni calidad de imagen.
- El IP-Adapter con peso 0,6 puede sobrecondicionar la salida a la imagen de referencia en detrimento del prompt textual.
- La cuantización int8 del codificador CLIP puede degradar la fidelidad de la condición visual.
- Riesgo de sesgos y de contenido inapropiado inherente a los modelos de difusión entrenados con datos web a gran escala.
- El repositorio tiene cero descargas y cero likes, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Stirito/lunea-modeles
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- LCM Dreamshaper v7 (SimianLuo): https://huggingface.co/SimianLuo/LCM_Dreamshaper_v7
- IP-Adapter (h94): https://huggingface.co/h94/IP-Adapter
- CLIP ViT-H/14 (laion): https://huggingface.co/laion/CLIP-ViT-H-14-laion2B-s32B-b79K
