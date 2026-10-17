# unsloth/flux-3-image-klein-GGUF

## Resumen

`unsloth/flux-3-image-klein-GGUF` es la versión cuantizada en formato GGUF del modelo **FLUX 3 Image Klein** de Black Forest Labs, un transformer de imagen de 5.548.681.984 parámetros (16 pasos, checkpoint destilado) que cubre generación texto-a-imagen, edición con una referencia e composición con múltiples referencias en un único modelo. Lo publica Unsloth con su metodología *Unsloth Dynamic 2.0*, en la que el tipo de cada capa se elige a partir de un escaneo de sensibilidad medido, de modo que los ficheros `UD-` superan a los uniformes del mismo tamano en fidelidad frente al modelo en bf16.

El interés práctico está en el tamano: el transformer completo en bf16 ocupa 11,10 GB, mientras que la variante recomendada `UD-Q4_K_XL` baja a 3,93 GB con un LPIPS de 0,038 y un SSIM de 0,940 frente a bf16, lo que permite ejecutar generación y edición de imágenes en GPUs de consumo. El codificador de texto es Qwen3-VL-4B-Instruct y el VAE se mantiene sin cuantizar; ambos se toman del repositorio original de Black Forest Labs, no de este repo.

La relevancia es doble: por un lado, lleva a hardware asequible un modelo que hasta ahora requería servir la versión bf16 o FP8/NVFP4; por otro, conserva capacidades poco habituales como el posicionamiento por cajas delimitadoras en una rejilla de 0 a 1000 y el renderizado de texto dentro de la imagen generada. La licencia es la FLUX Kommunity License, con uso no comercial permitido y una excepción de salida comercial sujeta a condiciones que hay que verificar en el fichero `LICENSE.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen (checkpoint destilado de 16 pasos) con codificador de texto Qwen3-VL-4B-Instruct y autoencoder de imagen (VAE) separados |
| Parametros totales | 5.548.681.984 (transformer de imagen; el codificador de texto se distribuye aparte) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible; no aplica al transformer de imagen y la informacion no detalla el contexto del codificador Qwen3-VL-4B-Instruct |
| Tipos de cuantizacion | GGUF: `UD-Q2_K_XL`, `Q3_K_M`, `UD-Q3_K_XL`, `Q4_K_M`, `UD-Q4_K_XL`, `Q5_K_M`, `UD-Q5_K_XL`, `Q6_K`, `Q8_0`, `BF16` (el repo base anade variantes FP8 y NVFP4) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `flux-kommunity-license` (FLUX Kommunity License; el campo `license` de HuggingFace figura como `other`) |
| Formato de pesos | GGUF; el repo original ofrece safetensors en bf16, FP8 y NVFP4 |
| Pipeline declarado | `image-to-image` (tambien texto-a-imagen y edicion multi-referencia) |
| Referencias de entrada | Hasta 10 imagenes de referencia |
| Pasos de inferencia | 16 (destilado, sin guidance); el checkpoint Base sin destilar usa 50 pasos y guidance 3.5 |
| Resolucion de evaluacion | 1024x1024 en las pruebas de cuantizacion publicadas |
| Tamano del repo | 47,2 GB (incluye todas las variantes GGUF) |
| Descargas / likes | 1.590 descargas, 14 likes |
| Fecha de publicacion | 2026-10-16 |

## Arquitectura y entrenamiento

El modelo es un transformer de imagen de 5.6B parámetros que opera sobre latentes de un autoencoder de imagen, con un codificador de texto Qwen3-VL-4B-Instruct que procesa el prompt y las referencias. El checkpoint publicado aquí es la variante **destilada** de 16 pasos y sin guidance, pensada para generación y edición; el entrenamiento de la destilación, el número de tokens vistos, la composición del dataset y el uso de RLHF/DPO no se detallan en la información proporcionada. Black Forest Labs mantiene por separado `flux-3-image-klein-base`, el checkpoint sin destilar de 50 pasos con guidance 3.5, orientado a fine-tuning, LoRA y research.

La innovación de esta publicación concreta es la cuantización: Unsloth aplica su metodología Dynamic 2.0, en la que cada capa recibe un tipo de cuantización distinto elegido a partir de un escaneo de sensibilidad medido, en lugar de aplicar un tipo uniforme a todo el modelo. Los tensores conservan la nomenclatura del checkpoint original de Black Forest Labs (carga mediante `Flux3Transformer2DModel.from_single_file(..., quantization_config=GGUFQuantizationConfig(...))` en diffusers), y el codificador de texto y el VAE no se tocan: se toman del repositorio de Black Forest Labs. El modelo soporta además posicionamiento de elementos mediante cajas delimitadoras expresadas en el prompt sobre una rejilla de 0 a 1000, que guían colocación y escala sin actuar como máscara dura de píxeles.

## Capacidades

- Generación texto-a-imagen a partir de una descripción en lenguaje natural, en una sola pasada de 16 pasos y sin necesidad de guidance.
- Edición de imagen con una referencia: recolorear, mover, reemplazar o eliminar elementos indicados en el prompt.
- Composición multi-referencia con hasta 10 imágenes de entrada, usando el mismo modelo que la generación y la edición de referencia única.
- Control de composición mediante cajas delimitadoras en una rejilla de 0 a 1000 declaradas en el prompt; guían posición y escala, no restringen los píxeles.
- Renderizado de texto legible dentro de la imagen generada (carteles, etiquetas, rótulos).
- Cadena texto-a-imagen y edición de imagen a imagen bajo el mismo pipeline declarado (`image-to-image`).
- Ejecución local con cuantización GGUF de 2,62 GB a 11,10 GB de pesos, con carga en diffusers y en Unsloth Desktop.
- No soporta, según la información disponible, tool calling, uso como agente, razonamiento multi-paso textual, audio ni vídeo: es un modelo de imagen.

## Casos de uso

- **Fotografía de producto para e-commerce**: partiendo de una foto base del artículo y una referencia de estilo, el modelo reemplaza fondo, recolorea la variante de color y mantiene la colocación del producto mediante cajas delimitadoras, con 16 pasos por imagen y `UD-Q4_K_XL` en una GPU de consumo.
- **Composición de catálogo de moda multi-referencia**: se envían hasta 10 referencias (prenda, modelo, escenario) y el modelo genera una escena coherente; útil para previsualizar combinaciones sin sesión fotográfica.
- **Edición iterativa de creatividades publicitarias**: sobre una imagen ya aprobada, se piden cambios concretos ("mueve el producto a la derecha, cámbialo a azul") sin regenerar toda la escena, lo que preserva el resto del encuadre.
- **Generación de rótulos y cartelería con texto**: el renderizado de texto dentro de la imagen permite producir prototipos de carteles, etiquetas o packaging donde el copy forma parte de la imagen y no se añade después.
- **Prototipado rápido en estación de trabajo local**: con `UD-Q2_K_XL` (2,62 GB) o `UD-Q4_K_XL` (3,93 GB) se puede iterar sobre prompts en una GPU de gama media sin depender de una API externa, a costa de un LPIPS de 0,152 en el caso de Q2.
- **Producción por lotes en servidor**: desplegando el transformer en `Q8_0` (6,09 GB, LPIPS 0,006 y SSIM 0,989 frente a bf16) se obtiene una fidelidad prácticamente indistinguible del original con menos memoria que el BF16, adecuado para pipelines automatizados de generación de imágenes.
- **Investigación y docencia sobre cuantización**: la tabla de LPIPS/SSIM por fichero permite estudiar el compromiso tamano-fidelidad de un transformer de imagen y reproducir la comparación con las 19 renderizaciones publicadas.
- **Base para experimentos de control espacial**: las cajas delimitadoras en rejilla 0-1000 permiten probar métodos de layout condicionado en prompts sin entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo de generación de imágenes. La única evaluación publicada es la fidelidad de la cuantización frente al transformer en bf16, medida con LPIPS (alex, menor es mejor) y SSIM sobre el mismo prompt, semilla, ruido y codificador de texto, 16 pasos, en 19 renderizaciones: 8 prompts reservados a 1024x1024 y 11 casos de texto-a-imagen y edición (referencia única y multi-referencia). Un render bf16 repetido puntúa 0, así que las cifras miden solo el efecto de la cuantización.

| Fichero | Tamano | Bits por peso | LPIPS vs bf16 (media) | LPIPS vs bf16 (max) | SSIM vs bf16 |
|---|---|---|---|---|---|
| `flux-3-image-klein-UD-Q2_K_XL.gguf` | 2,62 GB | 3,78 | 0,152 | 0,317 | 0,800 |
| `flux-3-image-klein-Q3_K_M.gguf` | 3,01 GB | 4,34 | 0,126 | 0,268 | 0,827 |
| `flux-3-image-klein-UD-Q3_K_XL.gguf` | 3,28 GB | 4,73 | 0,087 | 0,266 | 0,879 |
| `flux-3-image-klein-Q4_K_M.gguf` | 3,67 GB | 5,29 | 0,060 | 0,233 | 0,910 |
| `flux-3-image-klein-UD-Q4_K_XL.gguf` | 3,93 GB | 5,67 | 0,038 | 0,139 | 0,940 |
| `flux-3-image-klein-Q5_K_M.gguf` | 4,22 GB | 6,08 | 0,032 | 0,144 | 0,951 |
| `flux-3-image-klein-UD-Q5_K_XL.gguf` | 4,48 GB | 6,46 | 0,020 | 0,083 | 0,966 |
| `flux-3-image-klein-Q6_K.gguf` | 4,80 GB | 6,92 | 0,017 | 0,057 | 0,970 |
| `flux-3-image-klein-Q8_0.gguf` | 6,09 GB | 8,78 | 0,006 | 0,034 | 0,989 |
| `flux-3-image-klein-BF16.gguf` | 11,10 GB | 16,0 | 0,000 | 0,000 | 1,000 |

Lectura de los datos: `UD-Q4_K_XL` mejora a `Q4_K_M` en el mismo orden de tamano (LPIPS 0,038 frente a 0,060) y `UD-Q5_K_XL` se acerca a `Q6_K` con 4,48 GB frente a 4,80 GB. Por debajo de Q4 la degradación es marcada: `UD-Q2_K_XL` llega a un LPIPS máximo de 0,317.

## Requisitos de hardware

- **VRAM estimada (solo transformer)**: 2,62 GB con `UD-Q2_K_XL`, 3,93 GB con `UD-Q4_K_XL`, 6,09 GB con `Q8_0` y 11,10 GB con `BF16`. A esa cifra hay que sumar el codificador de texto Qwen3-VL-4B-Instruct y el VAE, que se descargan del repo de Black Forest Labs y no estan cuantizados en este repo; el total real es por tanto superior al tamano del fichero GGUF (estimacion a partir de los tamanos publicados, la informacion no da una cifra de VRAM medida).
- **GPU de consumo**: las variantes de 2,62 a 3,93 GB estan pensadas explicitamente para "la mayoria de GPUs" y para tarjetas pequenas; con `UD-Q4_K_XL` o `UD-Q2_K_XL` el transformer cabe en GPUs de 8-12 GB, dejando el resto de la VRAM al codificador de texto y al VAE.
- **GPU de datacenter**: A100 y H100 para servir `Q8_0` o `BF16` con lote, donde el cuello de botella es el codificador de texto y no el transformer.
- **Despliegue**: carga en diffusers mediante `Flux3Transformer2DModel.from_single_file(..., quantization_config=GGUFQuantizationConfig(...))` y en Unsloth Desktop. No se documenta soporte de vLLM, TGI ni llama.cpp para este modelo en la informacion disponible.
- **Latencia y throughput**: no disponibles. El coste por imagen es de 16 pasos (frente a 50 del checkpoint Base) y sin guidance, lo que reduce el numero de evaluaciones del transformer por muestra.
- **Almacenamiento**: el repo completo ocupa 47,2 GB, pero basta descargar el fichero GGUF elegido (2,62-11,10 GB) mas el codificador y el VAE del repo original.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Pasos / guidance | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `unsloth/flux-3-image-klein-GGUF` (este) | 5,55B | 16 / sin guidance | GGUF (Q2 a BF16) | FLUX Kommunity License | Generacion y edicion en local, hardware limitado |
| `black-forest-labs/flux-3-image-klein` | 5,55B | 16 / sin guidance | safetensors bf16 + FP8 + NVFP4 | FLUX Kommunity License | Generacion y edicion autoalojada; checkpoint detras de la API de BFL |
| `black-forest-labs/flux-3-image-klein-base` | 5,55B | 50 / 3.5 | safetensors bf16 | FLUX Kommunity License | Fine-tuning, LoRA y research |

La comparacion relevante es interna a la familia: frente al checkpoint original, este repo anade el formato GGUF y la eleccion por capa de Dynamic 2.0, con la contrapartida de una perdida de fidelidad medible (LPIPS 0,038 en `UD-Q4_K_XL`). Frente a `Klein Base`, la diferencia es de regimen de entrenamiento: el destilado de 16 pasos sirve para inferencia, el Base para reentrenar. No se dispone en la informacion proporcionada de datos de otros modelos de imagen comparables (parametros, contexto, rendimiento y licencia) para ampliar la tabla.

## Limitaciones y advertencias

- **Licencia restrictiva**: la FLUX Kommunity License permite uso no comercial y una excepcion de salida comercial para "Qualifying" —el texto disponible esta truncado—. Antes de integrar el modelo en un producto hay que leer `LICENSE.md` y verificar si la excepcion cubre el caso de uso concreto.
- **Solo ingles**: el campo `language` del modelo es `en`; el rendimiento con prompts en castellano no esta evaluado ni garantizado.
- **Perdida de fidelidad por cuantizacion**: cuantificada en LPIPS frente a bf16 con un maximo de 0,317 en `UD-Q2_K_XL` y 0,233 en `Q4_K_M`. En produccion con requisitos de calidad conviene `Q8_0` (LPIPS medio 0,006).
- **Evaluacion limitada**: las cifras provienen de 19 renderizaciones con prompts y semillas fijos; no cubren todo el espacio de prompts ni todos los dominios.
- **Riesgo de artefactos y alucinacion visual**: como todo modelo generativo, puede producir anatomias incorrectas, texto mal formado o elementos incoherentes con el prompt, especialmente en cuantizaciones bajas.
- **Las cajas delimitadoras no son mascaras**: guian colocacion y escala, pero no restringen los pixeles; no sirven para edicion con precision de pixel.
- **No apto para fine-tuning**: este checkpoint esta destilado; para LoRA o entrenamiento hay que usar `flux-3-image-klein-base`.
- **Dependencias externas**: el codificador de texto y el VAE no estan incluidos; hay que descargarlos del repo de Black Forest Labs y mantener la compatibilidad de nombres de tensor con el layout original.
- **Sin soporte documentado** de vLLM, TGI o llama.cpp; el ecosistema de despliegue se limita a diffusers y Unsloth Desktop segun la informacion disponible.
- **Sesgos**: no se documenta ninguna evaluacion de sesgos demograficos, estilisticos o culturales en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/flux-3-image-klein-GGUF
- Modelo base (checkpoint destilado): https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base sin destilar (fine-tuning y LoRA): https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Codigo de inferencia, prompt upsampling y formato de cajas: https://github.com/black-forest-labs/flux-3-image-klein
- Variantes FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
- Metodologia Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Comunidad en Discord: https://discord.gg/unsloth
