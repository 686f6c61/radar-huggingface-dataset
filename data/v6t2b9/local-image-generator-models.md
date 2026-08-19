# v6t2b9/local-image-generator-models

## Resumen

Este repositorio aloja los assets de modelo necesarios para el plugin **Local Image Generator** de Obsidian, desarrollado por johannes-kaindl. El autor del repositorio en Hugging Face es el usuario v6t2b9, que ha publicado los pesos convertidos a formato ONNX del modelo **Stability AI SD-Turbo**, junto con el runtime ONNX Runtime Web (WASM) necesario para ejecutar la inferencia directamente en el navegador mediante WebGPU. El objetivo es permitir la generación de imágenes de texto a imagen de forma completamente local, sin depender de servicios en la nube, dentro del entorno de Obsidian.

El modelo base es **sd-turbo**, una versión destilada de Stable Diffusion optimizada para generar imágenes en pocos pasos de inferencia (típicamente 1-4 pasos), lo que lo hace especialmente adecuado para ejecutarse en hardware modesto y en tiempo real. La conversión a ONNX con pesos en fp16 reduce el tamaño y acelera la inferencia en entornos web. El repositorio contiene los tres componentes principales del pipeline: el codificador de texto CLIP, la UNet y el decodificador VAE, además del tokenizador BPE.

La relevancia de este proyecto radica en que democratiza la generación de imágenes privada y sin coste por imagen, aprovechando las capacidades WebGPU de los navegadores modernos. Al estar integrado en Obsidian, los usuarios pueden generar ilustraciones, diagramas o conceptos visuales directamente en sus notas, sin salir de la aplicación y con total control sobre sus datos. El repositorio no especifica el número de parámetros del modelo, pero se basa en sd-turbo, que es una arquitectura de difusión latente con aproximadamente 860 millones de parámetros (según información pública de Stability AI, aunque no se confirma en este repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion Turbo (sd-turbo) convertido a ONNX: CLIP text encoder, UNet y VAE decoder |
| Parametros totales | no disponible (el repositorio no lo indica; el modelo base sd-turbo tiene aproximadamente 860 M, pero no se confirma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no LLM) |
| Tipos de cuantizacion | fp16 (float16) en los pesos ONNX, con entradas/salidas en fp32 |
| Idiomas soportados | no disponible (el tokenizer CLIP está entrenado principalmente en inglés, pero no se especifica) |
| Licencia | Stability AI Community License (investigacion, uso no comercial y uso comercial limitado gratuito por debajo de un umbral de ingresos) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El repositorio no incluye información sobre el entrenamiento del modelo original, ya que se trata de una conversión a ONNX de los pesos oficiales de `stabilityai/sd-turbo`. Según la model card, la conversión se realizó con la herramienta `optimum` de Hugging Face para la exportación a ONNX, seguida de una conversión a float16 mediante onnxruntime con la opción `keep_io_types=True` para mantener las entradas y salidas en fp32. El script de conversión está disponible en el repositorio del plugin (`tools/convert/convert_sd_turbo.py`).

El modelo base sd-turbo es una versión destilada de Stable Diffusion 2.1 (aunque no se confirma en este repositorio) que utiliza una técnica de destilación adversarial para reducir el número de pasos de muestreo necesarios, pasando de 50 a 1-4 pasos. Esto lo hace mucho más rápido que los modelos de difusión tradicionales, a costa de una ligera pérdida de calidad en algunos casos. La arquitectura interna incluye un codificador de texto CLIP, una UNet como red de denoising y un VAE para decodificar las latentes a píxeles.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en resolucion 512x512 píxeles (resolucion nativa de sd-turbo).
- Inferencia completamente local en el navegador mediante WebGPU y ONNX Runtime Web, sin necesidad de servidor externo.
- Integracion con el plugin Local Image Generator de Obsidian, que permite generar imagenes dentro de las notas.
- Descarga bajo demanda de los assets: el plugin solo descarga los archivos cuando el usuario lo solicita, verificando la integridad mediante SHA-256.
- Almacenamiento de los archivos fuera del vault de Obsidian para no saturar el espacio de trabajo.
- Soporte de ejecucion en entornos sin conexion a internet una vez descargados los modelos.
- Compatibilidad con el runtime WASM de ONNX Runtime Web (version especifica incluida en el repositorio), lo que garantiza un comportamiento consistente en distintos navegadores.

## Casos de uso

- **Ilustracion de notas tecnicas en Obsidian**: un desarrollador puede generar diagramas, esquemas o ejemplos visuales para documentar APIs o arquitecturas sin salir de su entorno de trabajo. El modelo es adecuado porque la generacion es rapida (pocos pasos) y no requiere enviar datos a la nube.
- **Creacion de material de estudio offline**: estudiantes o investigadores pueden generar imagenes de conceptos cientificos o historicos directamente en sus apuntes, sin conexion a internet, garantizando la privacidad de sus consultas.
- **Prototipado rapido de conceptos visuales**: disenadores o artistas pueden esbozar ideas a partir de texto en un entorno local, iterando rapidamente gracias a la velocidad de sd-turbo. La integracion con Obsidian permite mantener un registro visual de las iteraciones.
- **Generacion de imagenes para presentaciones locales**: profesionales que preparan presentaciones en entornos con restricciones de red pueden generar graficos o ilustraciones de apoyo directamente en sus notas y exportarlas posteriormente.
- **Automatizacion de generacion de contenido**: mediante scripts o plantillas en Obsidian, un usuario puede generar multiples variaciones de una imagen a partir de prompts programaticamente, aprovechando la API del plugin.
- **Entornos con requisitos estrictos de privacidad**: empresas o instituciones que manejan datos sensibles pueden generar imagenes sin que las solicitudes salgan del equipo, evitando filtraciones o cumpliendo normativas de proteccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, latencia o calidad de imagen. Se desconoce el rendimiento comparativo con otros modelos de generacion de imagenes locales.

## Requisitos de hardware

- Se requiere un navegador compatible con WebGPU (por ejemplo, Chrome, Edge o Firefox con soporte habilitado) y una GPU con soporte WebGPU (NVIDIA, AMD, Intel integrada reciente).
- No se especifica la cantidad minima de VRAM necesaria. Dado que el modelo se ejecuta en fp16 y tiene un tamano de aproximadamente 2.5 GB en disco, se estima que al menos 4 GB de VRAM son necesarios, pero este dato no esta confirmado en el repositorio.
- El runtime ONNX Runtime Web incluido (WASM) permite ejecucion en CPU como alternativa, aunque con un rendimiento significativamente menor.
- Opciones de despliegue: el modelo esta disenado para ejecutarse en el navegador a traves del plugin de Obsidian. No se proporcionan instrucciones para despliegue en servidores (vLLM, TGI, etc.).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa. El modelo base sd-turbo es conocido por su velocidad (1-4 pasos de inferencia) frente a modelos como SDXL o FLUX, que requieren mas pasos y mayor VRAM. Sin embargo, este repositorio no proporciona datos de rendimiento propios, por lo que no se puede establecer una comparacion rigurosa. Se recomienda consultar las fichas de los modelos originales para obtener metricas comparativas.

## Limitaciones y advertencias

- El modelo base sd-turbo puede presentar sesgos en la generacion de imagenes relacionados con el dataset de entrenamiento original (LAION, segun informacion publica de Stability AI, aunque no se confirma en este repositorio).
- Existe riesgo de generar contenido inapropiado o no deseado si los prompts no se filtran adecuadamente. El plugin no incluye filtros de contenido adicionales.
- La licencia Stability AI Community License restringe el uso comercial: permite uso gratuito solo hasta un umbral de ingresos anuales (el limite exacto se especifica en el texto de la licencia). Superado ese umbral, se requiere una licencia comercial.
- El modelo esta optimizado para resolucion 512x512; generar a resoluciones superiores puede degradar la calidad o requerir pasos adicionales.
- La conversion a fp16 puede introducir ligeras perdidas de precision en comparacion con los pesos originales en fp32, aunque el repositorio mantiene las entradas y salidas en fp32 para mitigar este efecto.
- No se garantiza compatibilidad con todos los navegadores o versiones de WebGPU. El runtime WASM incluido es una version especifica que el plugin vincula, por lo que puede quedar desactualizado con el tiempo.
- El repositorio no proporciona informacion sobre el idioma de los prompts; el tokenizer CLIP esta disenado principalmente para ingles, por lo que los prompts en otros idiomas pueden producir resultados suboptimos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/v6t2b9/local-image-generator-models
- Repositorio del plugin Local Image Generator: https://github.com/johannes-kaindl/local-image-generator
- Modelo base sd-turbo en Hugging Face: https://huggingface.co/stabilityai/sd-turbo
- Licencia del modelo base: https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE.md
