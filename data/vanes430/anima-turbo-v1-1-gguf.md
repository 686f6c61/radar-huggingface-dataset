# vanes430/Anima-Turbo-V1.1-GGUF

## Resumen

Anima-Turbo-V1.1-GGUF es la versión cuantizada en formato GGUF del modelo Anima Turbo v1.1, un modelo de generación de imágenes text-to-image de 2.09 mil millones de parámetros desarrollado por CircleStone Labs en colaboración con Comfy Org. El modelo base, Anima, está especializado en conceptos, personajes y estilos anime, aunque también genera contenido no fotorrealista de diversa índole. La variante Turbo es una destilación del modelo original que permite generar imágenes de alta calidad en solo 4 a 8 pasos de muestreo con CFG 1.0, lo que reduce drásticamente la latencia y el coste computacional.

La versión GGUF, convertida con la herramienta ComfyUI-GGUF, ofrece siete niveles de cuantización (de Q3_K_M a Q8_0) que permiten ajustar el equilibrio entre calidad y consumo de VRAM, desde aproximadamente 1.2 GB hasta 2.8 GB. Esto hace que el modelo sea viable en tarjetas gráficas de consumo con poca memoria, como la RTX 3060 o incluso inferiores, manteniendo una calidad de referencia en el nivel Q8_0. Es relevante ahora porque democratiza la generación de imágenes anime de calidad en hardware accesible, sin renunciar a la integración nativa con el ecosistema ComfyUI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (basado en Cosmos) |
| Parametros totales | 2.091.068.928 (2.09 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (modelo de imagen) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, Q4_0, Q3_K_M |
| Idiomas soportados | en, zh, ja, ko |
| Licencia | apache-2.0 (segun la model card; el modelo base original usa licencia no comercial) |
| Formato de pesos | GGUF (modelo de difusion), safetensors (text encoder y VAE) |

## Arquitectura y entrenamiento

Anima Turbo v1.1 es un modelo de difusion de texto a imagen con arquitectura basada en Cosmos, una familia de modelos desarrollada por CircleStone Labs. El modelo base de 2.09 B de parametros fue entrenado con un enfoque centrado en el estilo anime y contenido no fotorrealista. La version Turbo se obtuvo mediante un proceso de destilacion que reduce el numero de pasos de inferencia de 20-30 a solo 4-8, manteniendo una calidad visual comparable. La destilacion tambien incrementa la estabilidad de la generacion y aporta un estilo por defecto mas definido, aunque reduce la diversidad de los resultados.

El modelo completo se compone de tres elementos: el modelo de difusion principal (el que se cuantiza en GGUF), un text encoder basado en Qwen 3.5B (qwen_3_5b_base.safetensors) y un VAE de imagen (qwen_image_vae.safetensors). El text encoder utiliza el tipo CLIP loader "lumina2" en ComfyUI, y el VAE es el estandar de la serie. La cuantizacion GGUF se realizo con ComfyUI-GGUF, que convierte los pesos del transformer de difusion a formato GGUF para optimizar el uso de VRAM sin perder compatibilidad con el ecosistema ComfyUI.

## Capacidades

- Generacion de imagenes anime y no fotorrealistas a partir de descripciones textuales en ingles, chino, japones y coreano.
- Inferencia de alta velocidad gracias a la destilacion: solo 4-8 pasos de muestreo con CFG 1.0.
- Integracion nativa con ComfyUI mediante el plugin ComfyUI-GGUF, lo que permite cargar el modelo directamente en el nodo UNETLoader.
- Soporte de resoluciones de salida de 512x512 a 1024x1024 píxeles.
- Cuantizacion multiple (7 niveles) que permite escalar el modelo desde GPU de baja VRAM hasta hardware de referencia.
- Compatibilidad con el sistema de nodos de ComfyUI, incluyendo el sampler euler y el scheduler sgm_uniform recomendados.

## Casos de uso

- **Generacion de ilustraciones anime en produccion**: el modelo puede integrarse en pipelines de ComfyUI para crear imagenes de personajes, escenas y fondos con estilo anime de alta calidad. Su velocidad (4-8 pasos) lo hace adecuado para iterar rapidamente en disenos y conceptos.
- **Prototipado de diseno de personajes**: los artistas pueden usar Anima-Turbo para generar variaciones de personajes a partir de descripciones textuales, ajustando los resultados con el nivel de cuantizacion Q5_K_M (recomendado por el autor) para un equilibrio entre calidad y velocidad.
- **Creacion de fondos y entornos no fotorrealistas**: el modelo es capaz de producir entornos fantasticos, sci-fi o de fantasia, que pueden usarse como base para ilustracion digital, videojuegos o produccion audiovisual.
- **Generacion de contenido para juegos y visual novels**: gracias a su soporte multilingue (en, zh, ja, ko), el modelo puede generar imagenes de personajes y escenas para juegos de rol, visual novels o juegos de cartas con un estilo consistente.
- **Automatizacion de flujos de trabajo de diseno**: al ser un modelo GGUF con bajo consumo de VRAM, puede desplegarse en equipos de diseno con GPUs modestas (p. ej., RTX 3060 12 GB) para automatizar la generacion de assets de anime sin necesidad de hardware de alta gama.
- **Exploracion de estilos y variaciones**: la destilacion del modelo Turbo reduce la diversidad, pero permite generar rapidamente multiples variantes de una misma idea, util para explorar alternativas de estilo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento proporcionados son las especificaciones de VRAM por cuantizacion de la model card, que indican un consumo de entre 1.2 GB (Q3_K_M) y 2.8 GB (Q8_0) para la inferencia. No hay datos objetivos como FID, CLIP score o tiempos de inferencia medidos en un hardware concreto.

## Requisitos de hardware

- **VRAM estimada**: entre 1.2 GB (Q3_K_M) y 2.8 GB (Q8_0), segun el nivel de cuantizacion elegido. El modelo completo (incluyendo text encoder y VAE) requiere memoria adicional para estos componentes, aunque no se especifica su consumo.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en cuantizaciones bajas (Q3_K_M, Q4_0). Para cuantizaciones de alta calidad (Q8_0) se recomienda una GPU con 6 GB o mas. Tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores son adecuadas.
- **Compatibilidad con GPUs de consumo**: si, el modelo esta disenado para funcionar en GPUs de consumo gracias a la cuantizacion GGUF. Incluso una GTX 1660 Super con 6 GB podria ejecutar la version Q4_K_M.
- **Opciones de despliegue**: el modelo se usa principalmente con ComfyUI y ComfyUI-GGUF (plugin). Tambien es compatible con cualquier runtime que soporte GGUF para modelos de difusion, como el loader de GGUF de ComfyUI.
- **Latencia y throughput**: no hay datos de latencia especificos. Sin embargo, al requerir solo 4-8 pasos de muestreo, la generacion de una imagen de 512x512 deberia completarse en pocos segundos en una GPU de gama media (estimacion basada en la velocidad de destilado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Anima-Turbo-V1.1-GGUF (este) | 2.09 B | no disponible | apache-2.0 (GGUF) / no comercial (original) | GGUF + safetensors | Enfocado en anime, destilado para 4-8 pasos |
| Anima (base, circlestone-labs/Anima) | 2.09 B | no disponible | no comercial | safetensors | Modelo original sin destilado, requiere mas pasos |
| Abiray/Anima-turbo-v1.0-GGUF | 2.09 B | no disponible | no disponible | GGUF | Version previa (v1.0) del mismo modelo destilado |
| Otros modelos anime text-to-image (p. ej., Anything V5, NAI) | variable | no disponible | variable | safetensors | Modelos con enfoque similar pero arquitecturas distintas, no se dispone de datos de comparativa directa |

## Limitaciones y advertencias

- **Licencia ambigua**: aunque la model card de HuggingFace indica apache-2.0, el modelo base original (circlestone-labs/Anima) usa una licencia no comercial. Los usuarios deben verificar la licencia aplicable al modelo base antes de cualquier uso comercial, ya que la redistribucion en GGUF no cambia la licencia del modelo subyacente.
- **Enfoque en anime**: el modelo esta especializado en estilos anime y no fotorrealista. No es adecuado para generar imagenes fotorrealistas o de contenido general.
- **Diversidad limitada**: la destilacion Turbo reduce la diversidad de los resultados en comparacion con el modelo base, lo que puede provocar estilos repetitivos o menos variados.
- **Riesgo de alucinacion visual**: como todos los modelos text-to-image, puede generar imagenes que no se corresponden exactamente con la descripcion textual, especialmente en conceptos complejos o abstractos.
- **Resolucion limitada**: la resolucion recomendada es de 512x512 a 1024x1024. Generar resoluciones superiores puede degradar la calidad o requerir ajustes adicionales.
- **Sesgos de contenido**: al estar entrenado con datos centrados en anime, el modelo puede perpetuar estereotipos o estilos visuales japoneses, y puede no representar correctamente otras culturas o estilos.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/vanes430/Anima-Turbo-V1.1-GGUF)
- [Modelo base Anima (circlestone-labs/Anima)](https://huggingface.co/circlestone-labs/Anima)
- [ComfyUI-GGUF (herramienta de conversion)](https://github.com/city96/ComfyUI-GGUF)
- [Pagina del modelo Anima en Civitai](https://civitai.com/models/2458426/anima)
- [Pagina del modelo Anima en ModelScope](https://www.modelscope.cn/models/circlestone-labs/anima/summary)
- [Version GGUF previa (v1.0) de Abiray](https://huggingface.co/Abiray/Anima-turbo-v1.0-GGUF)
