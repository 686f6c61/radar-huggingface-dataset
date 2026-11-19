# unsloth/flux-3-image-klein-GGUF

## Resumen

FLUX 3 Image Klein es un modelo de generación y edición de imágenes de código abierto desarrollado por Black Forest Labs. El transformer de imagen cuenta con 5.548.681.984 parámetros (5,6B) y se distribuye como checkpoint destilado de 16 pasos, pensado para text-to-image, edición con una referencia y composición con múltiples referencias a través del mismo modelo. Utiliza Qwen3-VL-4B-Instruct como codificador de texto, que es un componente separado y no está incluido en la cifra de parámetros del transformer.

La versión que nos ocupa, `unsloth/flux-3-image-klein-GGUF`, es una cuantización GGUF publicada por Unsloth mediante su metodología Dynamic 2.0. Los ficheros `UD-` emplean precisión mixta: el tipo de cada capa se elige a partir de un escaneo de sensibilidad medido, de modo que superan a los ficheros uniformes del mismo tamaño. El repositorio incluye desde variantes de 2,62 GB (UD-Q2_K_XL) hasta el transformer en BF16 de 11,10 GB, con un total de 47,2 GB en el repo.

El modelo resulta relevante porque permite ejecutar localmente un generador de imágenes de última generación en GPUs de consumo: la variante recomendada UD-Q4_K_XL ocupa 3,93 GB y alcanza un LPIPS de 0,038 frente al BF16, un valor notablemente mejor que el 0,060 de Q4_K_M. Se carga en diffusers mediante `Flux3Transformer2DModel.from_single_file` con `GGUFQuantizationConfig`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen (FLUX 3, checkpoint destilado de 16 pasos); codificador de texto Qwen3-VL-4B-Instruct y VAE separados |
| Parametros totales | 5.548.681.984 (transformer de imagen) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: UD-Q2_K_XL, Q3_K_M, UD-Q3_K_XL, Q4_K_M, UD-Q4_K_XL, Q5_K_M, UD-Q5_K_XL, Q6_K, Q8_0, BF16 |
| Idiomas soportados | en |
| Licencia | flux-kommunity-license (FLUX Kommunity License) |
| Formato de pesos | GGUF (repo de 47,2 GB); el modelo base ofrece BF16, FP8 y NVFP4 |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para imágenes de 5,6B parámetros en su variante destilada, entrenada para generar en 16 pasos sin guidance. El pipeline integra tres componentes: el transformer de imagen, un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen (VAE). La etiqueta de 5,6B se refiere únicamente al transformer; el codificador de texto es independiente y debe tomarse del repositorio original de Black Forest Labs, ya que esta cuantización no lo modifica.

La versión Klein aquí distribuida es el checkpoint destilado, el mismo que respalda la API de BFL. Para fine-tuning, entrenamiento de LoRA e investigación, el autor remite a FLUX 3 Image Klein Base, un checkpoint no destilado de 50 pasos con guidance 3.5. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación destacable de esta publicación es la cuantización Dynamic 2.0 de Unsloth: los ficheros `UD-` usan precisión mixta por capa, seleccionada con un escaneo de sensibilidad medido, y los nombres de tensor respetan el layout original del checkpoint de Black Forest Labs para permitir la carga directa en diffusers.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image).
- Edición de imágenes con una referencia (single-reference editing).
- Composición y generación con múltiples referencias, hasta 10 imágenes de referencia, devolviendo una sola imagen.
- Control de composición mediante bounding boxes en el prompt: los elementos se colocan en una rejilla de 0 a 1000 y pueden recolorearse, moverse, sustituirse o eliminarse mediante el prompt. Las cajas guían posición y escala, pero no restringen los píxeles a una máscara dura.
- Renderizado de texto dentro de las imágenes generadas.
- Generación destilada en 16 pasos sin guidance, lo que reduce el coste de inferencia.
- Carga en diffusers mediante `from_single_file` con `GGUFQuantizationConfig`, y también en Unsloth Desktop.
- Soporte de prompt upsampling según el código de inferencia del repositorio oficial en GitHub.
- Idiomas: únicamente inglés.

## Casos de uso

- Generación de imágenes en local en GPU de consumo: con la variante UD-Q4_K_XL (3,93 GB) se puede ejecutar el transformer en tarjetas de gama media, manteniendo un LPIPS de 0,038 frente al BF16, adecuado para prototipado rápido y pruebas de concepto.
- Edición de producto con referencias múltiples: el modelo acepta hasta 10 imágenes de referencia y devuelve una composición, lo que permite generar variantes de un producto con distintos fondos o contextos sin reentrenar.
- Maquetación controlada mediante bounding boxes: agencias y equipos de diseño pueden especificar la posición y escala de cada elemento en una rejilla de 0 a 1000 y recolocar o sustituir objetos con instrucciones en el prompt, útil para banners y creatividades con requisitos de layout.
- Generación de material gráfico con texto integrado: la capacidad de renderizar texto dentro de la imagen permite producir carteles, portadas y mockups con titulares legibles en una sola pasada.
- Sustitución de fondo y retoque semiautomático: mediante edición de referencia única, se puede reemplazar, recolorear o eliminar elementos de una imagen existente indicándolo en el prompt.
- Despliegue en pipelines de difusión con diffusers: al cargarse con `Flux3Transformer2DModel.from_single_file` y `GGUFQuantizationConfig`, se integra en flujos Python existentes y en entornos de investigación que ya usan diffusers.
- Ejecución en estaciones de trabajo sin GPU de datacenter: las variantes Q2_K_XL (2,62 GB) y Q3_K_XL (3,28 GB) permiten inferencia en hardware muy limitado, a costa de una fidelidad menor (LPIPS 0,152 y 0,087 respectivamente).
- Uso en la interfaz Unsloth Desktop: el modelo se carga directamente en la aplicación de escritorio de Unsloth para generación y edición sin escribir código.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad de la cuantización frente al transformer BF16 con el mismo prompt, semilla, ruido y codificador de texto, a 16 pasos, sobre 19 renders (8 prompts reservados a 1024x1024 y 11 casos de text-to-image y edición con una y varias referencias). Un render BF16 repetido puntúa 0, por lo que las cifras aislan el efecto de la cuantización.

| Fichero | Tamano | Bits por peso | LPIPS vs bf16 (media) | LPIPS vs bf16 (max) | SSIM vs bf16 |
|---|---|---|---|---|---|
| UD-Q2_K_XL | 2,62 GB | 3,78 | 0,152 | 0,317 | 0,800 |
| Q3_K_M | 3,01 GB | 4,34 | 0,126 | 0,268 | 0,827 |
| UD-Q3_K_XL | 3,28 GB | 4,73 | 0,087 | 0,266 | 0,879 |
| Q4_K_M | 3,67 GB | 5,29 | 0,060 | 0,233 | 0,910 |
| UD-Q4_K_XL | 3,93 GB | 5,67 | 0,038 | 0,139 | 0,940 |
| Q5_K_M | 4,22 GB | 6,08 | 0,032 | 0,144 | 0,951 |
| UD-Q5_K_XL | 4,48 GB | 6,46 | 0,020 | 0,083 | 0,966 |
| Q6_K | 4,80 GB | 6,92 | 0,017 | 0,057 | 0,970 |
| Q8_0 | 6,09 GB | 8,78 | 0,006 | 0,034 | 0,989 |
| BF16 | 11,10 GB | 16,0 | 0,000 | 0,000 | 1,000 |

No se han publicado en la información disponible resultados de benchmarks estándar de calidad de imagen (FID, CLIP score u otros) ni comparativas con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 2,6 GB para UD-Q2_K_XL, 3,9 GB para UD-Q4_K_XL (recomendado), 6,1 GB para Q8_0 y 11,1 GB para BF16. A esta cifra hay que sumar la memoria del codificador de texto Qwen3-VL-4B-Instruct y del VAE, que se cargan aparte y no están cuantizados en este repo.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, las variantes UD-Q4_K_XL y Q5_K_XL caben en GPUs de consumo de gama media-alta; Q8_0 y BF16 requieren tarjetas de mayor capacidad o GPU de datacenter tipo A100/H100.
- Cabe en GPU de consumo: sí, al menos las variantes Q2 a Q5, siempre que se disponga de memoria adicional para el codificador de texto y el VAE.
- Opciones de despliegue: diffusers con `Flux3Transformer2DModel.from_single_file` y `GGUFQuantizationConfig`, y Unsloth Desktop. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El checkpoint está destilado a 16 pasos sin guidance, lo que reduce el número de evaluaciones del transformer frente a un modelo no destilado de 50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (este repo, GGUF) | 5,6B (transformer) | no disponible | GGUF cuantizado | flux-kommunity-license | Destilado, 16 pasos, texto e imagen |
| FLUX 3 Image Klein (base, BF16/FP8/NVFP4) | 5,6B (transformer) | no disponible | safetensors (BF16, FP8, NVFP4) | flux-kommunity-license | Destilado, 16 pasos; referencia de calidad |
| FLUX 3 Image Klein Base | no disponible | no disponible | bfloat16 | flux-kommunity-license | No destilado, 50 pasos, guidance 3.5; para fine-tuning y LoRA |

No se dispone en la información proporcionada de datos sobre otros modelos de generación de imágenes comparables (parámetros, contexto o rendimiento), por lo que la comparativa se limita a las variantes del propio FLUX 3 Image Klein.

## Limitaciones y advertencias

- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado con datos a gran escala, es esperable heredar sesgos de representación, pero no hay análisis publicado en la ficha.
- Riesgo de alucinación visual: no cuantificado; no se publican métricas de fidelidad semántica al prompt (FID, CLIP score) en la información disponible.
- Idioma: el modelo solo declara soporte de inglés, lo que limita prompts y renderizado de texto en otros idiomas, incluido el castellano.
- Licencia: FLUX Kommunity License. Permite uso no comercial y establece una excepción de output comercial para determinados casos; es necesario revisar el texto completo de `LICENSE.md` antes de un uso comercial, ya que la licencia no es de código abierto estándar.
- Componentes externos: esta cuantización solo incluye el transformer; el codificador de texto Qwen3-VL-4B-Instruct y el VAE deben obtenerse del repositorio de Black Forest Labs, con su propio consumo de memoria y sus condiciones de uso.
- Fidelidad de las cuantizaciones bajas: UD-Q2_K_XL presenta un LPIPS máximo de 0,317 y SSIM de 0,800 frente al BF16, lo que puede ser insuficiente para producción con requisitos de calidad estrictos.
- Bounding boxes: guían posición y escala, pero no restringen los píxeles a una máscara dura, por lo que el layout no está garantizado al píxel.
- Fine-tuning: este checkpoint destilado no es el indicado para entrenamiento; el autor remite a FLUX 3 Image Klein Base para LoRA y research.
- Idiomas y contexto: no se especifica longitud de contexto del codificador de texto ni límites de longitud de prompt en la información disponible.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/unsloth/flux-3-image-klein-GGUF
- Modelo base FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- FLUX 3 Image Klein Base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Código de inferencia, prompt upsampling y formato de bounding boxes: https://github.com/black-forest-labs/flux-3-image-klein
- Documentación de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Unsloth (web): https://unsloth.ai/
- Unsloth en GitHub: https://github.com/unslothai/unsloth
- Documentación de Unsloth Desktop: https://unsloth.ai/docs/desktop
- Documentación general de Unsloth: https://unsloth.ai/docs
- Paquete Unsloth en PyPI: https://pypi.org/project/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
