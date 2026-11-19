# unsloth/MOSS-Image-SFT-GGUF

## Resumen

MOSS-Image-SFT-GGUF es la version cuantizada en formato GGUF del modelo de generacion de imagenes MOSS-Image-SFT, desarrollado originalmente por OpenMOSS y empaquetado por Unsloth. Se trata de un transformer de 5.082.308.624 parametros (aproximadamente 5,1 mil millones) especializado en text-to-image, derivado de MOSS-Image-Base mediante ajuste supervisado (SFT). El modelo es capaz de generar imagenes de 1024x1024 a partir de prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON que permiten controlar la colocacion de texto y la disposicion de objetos.

La relevancia de esta publicacion radica en que Unsloth aplica su metodologia Dynamic 2.0 para producir cuantizaciones de precision mixta (archivos `UD-`) donde el tipo de cada capa se selecciona a partir de un escaneo de sensibilidad medido. Esto permite ejecutar un modelo de difusion de 5,1B en CPU, Mac y GPU de consumo con tamanos que van desde 2,84 GB (UD-Q3_K_XL) hasta 10,17 GB (BF16), manteniendo una fidelidad perceptual medida mediante LPIPS y SSIM frente a la referencia bf16. El modelo soporta prompts en ingles y chino, y se distribuye bajo licencia Apache 2.0.

El pipeline completo requiere tres componentes: el transformer cuantizado (este repositorio), un encoder de texto Qwen3.5-9B en GGUF y el VAE y tokenizer originales tomados del repositorio FP8 de Unsloth. La integracion se realiza mediante stable-diffusion.cpp (build master-975 o superior) o mediante la interfaz Unsloth Studio, que automatiza la descarga de los componentes auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para text-to-image (familia MOSS-Image) |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q3_K_XL, Q4_K_M, UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, Q8_0, BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo transformer); VAE y tokenizer en safetensors/JSON desde el repo FP8; encoder de texto Qwen3.5-9B en GGUF |
| Tamano del repositorio | 33,6 GB |
| Resolucion de generacion | 1024x1024 (valores por defecto: 50 pasos, CFG 3, shift 5) |
| Encoder de texto | Qwen3.5-9B (Q8_0 recomendado) |
| Fecha de creacion | 2026-10-22 |
| Ultima actualizacion | 2026-11-11 |
| Descargas | 251.211 |
| Likes | 29 |

## Arquitectura y entrenamiento

MOSS-Image-SFT es un transformer de difusion para generacion de imagenes condicionada por texto, perteneciente a la familia MOSS-Image de OpenMOSS. El modelo deriva de MOSS-Image-Base y ha sido sometido a un ajuste supervisado (SFT) que, segun la model card, mejora la agrupacion de texto y la organizacion de layouts en comparacion con la version base (por ejemplo, en la generacion de pizarras con contenido estructurado). Comparte arquitectura y pipeline de inferencia con el modelo base, y acepta tanto prompts en lenguaje natural como secuencias de etiquetas y layouts en JSON para controlar la posicion del texto y la disposicion de los objetos.

La innovacion principal de esta publicacion concreta no esta en el modelo original sino en el proceso de cuantizacion de Unsloth. La metodologia Dynamic 2.0 realiza un escaneo de sensibilidad por capa y asigna a cada una un tipo de cuantizacion de precision mixta, lo que produce archivos `UD-` con una relacion calidad/tamano mejor que las cuantizaciones uniformes equivalentes. La model card documenta que MOSS-Image es extremadamente sensible a cambios numericos minimos: modificar un solo paso de redondeo bf16 en una capa ya desplaza las imagenes 0,041 LPIPS de media, por lo que diferencias cercanas a ese umbral reflejan cambios de composicion mas que perdida de calidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes text-to-image a 1024x1024 a partir de prompts en lenguaje natural en ingles y chino.
- Control de layout mediante secuencias de etiquetas y estructuras JSON, que permiten especificar la colocacion de texto y la disposicion de objetos en la escena.
- Renderizado de texto legible dentro de la imagen (la model card incluye ejemplos de carteles con la palabra "UNSLOTH" en letras nitidas).
- Generacion fotorrealista de detalle fino: macrofotografia de insectos con granos de polen visibles, retratos en primer plano y descripciones largas de escenas.
- Ejecucion en CPU, Mac y GPU gracias a las cuantizaciones GGUF, con opcion de precision mixta por capa.
- Integracion con stable-diffusion.cpp (master-975 o superior) y con Unsloth Studio.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de ilustraciones para articulos tecnicos y documentacion: con el archivo UD-Q4_K_XL (3,42 GB) se pueden producir imagenes de 1024x1024 en maquinas sin GPU dedicada, lo que permite integrar la generacion en pipelines de documentacion automatizada.
- Creacion de carteles y rotulos con texto legible: el modelo maneja prompts del tipo "un cartel de escaparate que diga ..." y la model card demuestra resultados nitidos, lo que resulta util para prototipado de senaletica y mockups publicitarios.
- Maquetacion controlada mediante layouts JSON: al aceptar estructuras JSON para posicionar texto y objetos, encaja en flujos de diseno donde se necesita reproducibilidad de la composicion, como generacion de plantillas para redes sociales o interfaces.
- Prototipado rapido en estaciones de trabajo de desarrollo: con stable-diffusion.cpp y el archivo Q8_0 (5,48 GB) se obtiene la mayor fidelidad posible en GGUF (LPIPS 0,054), adecuada para validar prompts antes de pasar a produccion con el modelo bf16.
- Generacion de imagenes en local con requisitos de privacidad: al ejecutarse integramente en hardware propio mediante Unsloth Studio o stable-diffusion.cpp, los prompts y las imagenes no salen del equipo, lo que sirve para entornos con datos sensibles.
- Experimentacion academica con cuantizacion de modelos de difusion: la tabla de LPIPS/SSIM por archivo y el analisis de sensibilidad por capa permiten estudiar el impacto de la precision mixta en modelos generativos, usando los distintos GGUF como variables controladas.
- Generacion bilingue de contenido visual: al soportar ingles y chino, se puede emplear para material grafico en mercados de habla china sin cambiar de modelo.

## Benchmarks y rendimiento

La model card proporciona metricas de fidelidad de las cuantizaciones frente al transformer bf16 (LPIPS alex y SSIM; mismo prompt, semilla, ruido inicial y embeddings bf16, 1024x1024, 50 pasos, CFG 3, sobre 12 prompts). Los pesos GGUF se de-cuantizaron al pipeline de referencia, por lo que la tabla mide unicamente el efecto de los pesos.

| Archivo | Tamano | Bits por peso | LPIPS vs bf16 (media) | LPIPS vs bf16 (max) | SSIM vs bf16 |
|---|---|---|---|---|---|
| MOSS-Image-SFT-UD-Q3_K_XL.gguf | 2,84 GB | 4,47 | 0,281 | 0,493 | 0,713 |
| MOSS-Image-SFT-Q4_K_M.gguf | 3,20 GB | 5,04 | 0,294 | 0,466 | 0,714 |
| MOSS-Image-SFT-UD-Q4_K_XL.gguf | 3,42 GB | 5,38 | 0,213 | 0,412 | 0,780 |
| MOSS-Image-SFT-UD-Q5_K_XL.gguf | 3,95 GB | 6,22 | 0,121 | 0,358 | 0,862 |
| MOSS-Image-SFT-UD-Q6_K_XL.gguf | 4,53 GB | 7,13 | 0,106 | 0,354 | 0,883 |
| MOSS-Image-SFT-Q8_0.gguf | 5,48 GB | 8,63 | 0,054 | 0,202 | 0,939 |
| MOSS-Image-SFT-BF16.gguf | 10,17 GB | 16,00 | 0,000 | 0,000 | 1,000 |

Ademas, la model card incluye una evaluacion a traves de stable-diffusion.cpp contra su propia renderizacion bf16 sobre 4 prompts reservados: Q8_0 0,109, UD-Q4_K_XL 0,188, Q4_K_M 0,347 y UD-Q3_K_XL 0,336. Como referencia de sensibilidad, cambiar un solo paso de redondeo bf16 en una capa desplaza las imagenes 0,041 LPIPS de media. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo text-to-image.

## Requisitos de hardware

- VRAM estimada: el transformer ocupa entre 2,84 GB (UD-Q3_K_XL) y 10,17 GB (BF16). A ello hay que sumar el encoder de texto Qwen3.5-9B en Q8_0 y el VAE, por lo que el consumo total supera el del archivo GGUF del transformer.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. En GPU CUDA, Unsloth Studio usa por defecto el archivo INT8-ConvRot del repositorio FP8 (LPIPS 0,058), en lugar de los GGUF.
- GPU de consumo: el modelo esta disenado para ejecutarse en CPU, Mac y GPU, y el archivo recomendado UD-Q4_K_XL (3,42 GB) esta pensado para "la mayoria de maquinas", lo que sugiere viabilidad en GPU de consumo con VRAM suficiente para transformer, encoder y VAE combinados.
- Opciones de despliegue: stable-diffusion.cpp (build master-975 o superior) mediante `sd-cli`, y Unsloth Studio (pestana Images, seleccionando MOSS-Image-SFT). El modelo base se distribuye en formato diffusers.
- Parametros de inferencia por defecto: 1024x1024, 50 pasos, CFG 3, shift 5.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT-GGUF (este) | 5,08 B | GGUF (transformer) + Qwen3.5-9B GGUF + VAE | Apache 2.0 | en, zh | Cuantizacion dinamica por capa; ejecucion en CPU, Mac y GPU via stable-diffusion.cpp |
| MOSS-Image-SFT (original) | 5,08 B | diffusers / safetensors | Apache 2.0 | en, zh | Modelo de referencia bf16; requiere pipeline diffusers |
| MOSS-Image-Base | no disponible | diffusers | Apache 2.0 | en, zh | Version previa al SFT; peor agrupacion de texto y organizacion de layouts segun la model card |
| MOSS-Image-SFT-FP8 (Unsloth) | 5,08 B | FP8 + VAE/tokenizer | Apache 2.0 | en, zh | Incluye INT8-ConvRot (LPIPS 0,058) usado por defecto en GPU CUDA en Unsloth Studio |

No se dispone de datos de benchmarks comparativos con otros modelos text-to-image de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el transformer cuantizado. Es imprescindible descargar el VAE y el tokenizer del repositorio unsloth/MOSS-Image-SFT-FP8 y el encoder de texto Qwen3.5-9B en GGUF; sin ellos el modelo no funciona.
- Requiere una build de stable-diffusion.cpp master-975 o superior que incluya soporte para MOSS-Image; versiones anteriores no son compatibles.
- Alta sensibilidad numerica: cambios minimos de redondeo (un solo paso bf16 en una capa) desplazan las imagenes 0,041 LPIPS de media, por lo que pequenas diferencias de metricas pueden reflejar cambios de composicion y no perdida de calidad.
- Las cuantizaciones agresivas (UD-Q3_K_XL, Q4_K_M) presentan LPIPS medios de 0,281 y 0,294 y SSIM de 0,713 y 0,714, con degradacion perceptible frente a bf16; para produccion se recomienda UD-Q5_K_XL o superior.
- Idiomas limitados a ingles y chino; no se documenta soporte para castellano ni otras lenguas.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base OpenMOSS-Team/MOSS-Image-SFT y del encoder Qwen3.5-9B, que se distribuyen por separado.
- El contenido citado de la model card se ha usado solo como referencia; no debe interpretarse como instrucciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio FP8 con VAE y tokenizer: https://huggingface.co/unsloth/MOSS-Image-SFT-FP8
- Encoder de texto Qwen3.5-9B GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Documentacion de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Unsloth Studio (GitHub): https://github.com/unslothai/unsloth/
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Documentacion de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
- Sitio de Unsloth: https://unsloth.ai/
- Documentacion de Unsloth Desktop: https://unsloth.ai/docs/desktop
- Paquete PyPI de Unsloth: https://pypi.org/project/unsloth/
