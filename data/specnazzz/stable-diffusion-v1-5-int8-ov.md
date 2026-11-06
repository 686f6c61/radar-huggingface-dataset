# SpecnaZZZ/stable-diffusion-v1-5-int8-ov

## Resumen

stable-diffusion-v1-5-int8-ov es una conversion del modelo de difusion Stable Diffusion v1.5 al formato OpenVINO IR (Intermediate Representation) con los pesos comprimidos a INT8 mediante NNCF. Lo publica el usuario SpecnaZZZ en Hugging Face reutilizando el procedimiento de compresion de Intel (el identificador de referencia en los ejemplos de la model card apunta a OpenVINO/stable-diffusion-v1-5-int8-ov). No es un modelo nuevo: es el mismo SD 1.5, con la misma arquitectura UNet + VAE + text encoder CLIP, pero empaquetado para inferencia optimizada sobre hardware Intel (CPU, iGPU, NPU y GPU Arc).

El objetivo es reducir el coste computacional y el tamano en disco del SD 1.5 original (unos 4,3 GB en fp32) hasta aproximadamente 2,3 GB, manteniendo la calidad de generacion lo mas intacta posible. La compresion INT8 asimetrica con ratio 1.0 aplica cuantizacion a todos los pesos compatibles, lo que acelera la inferencia en CPU y en aceleradores Intel sin necesidad de GPU dedicada.

Es relevante para desarrolladores que quieran desplegar generacion texto-a-imagen en entornos sin CUDA, en portatiles con CPU moderna o en dispositivos edge con OpenVINO. El modelo mantiene la licencia CreativeML OpenRAIL-M del original, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion model (UNet + VAE + text encoder CLIP), convertido a OpenVINO IR |
| Parametros totales | no disponible (SD 1.5 original: ~983 M en UNet, ~123 M en text encoder, ~83 M en VAE) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; SD 1.5 usa 77 tokens CLIP) |
| Tipos de cuantizacion | INT8 asimetrica (INT8_ASYM, ratio 1.0) sobre pesos en formato OpenVINO IR |
| Idiomas soportados | no disponible (el text encoder CLIP de SD 1.5 esta entrenado principalmente en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF; el tag safetensors del repo es heredado del modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion v1.5, un modelo de difusion latente compuesto por una UNet con atencion cruzada, un autoencoder VAE y un text encoder CLIP ViT-L/14. La generacion se realiza en el espacio latente del VAE, lo que reduce drasticamente el coste frente a la difusion en pixeles. Esta version no introduce cambios arquitectonicos: solo cambia el formato y la precision de los pesos.

El proceso de conversion aplica `nncf.compress_weights` en modo INT8_ASYM con ratio 1.0, es decir, comprime todos los pesos elegibles a enteros de 8 bits con escala asimetrica por canal. No hay reentrenamiento ni fine-tuning posterior a la cuantizacion, por lo que la perdida de calidad depende unicamente de la robustez del SD 1.5 original frente a la cuantizacion. No se dispone de informacion sobre datos de entrenamiento adicionales ni sobre procesos de RLHF/DPO, ya que no se realizaron en esta conversion.

## Capacidades

- Generacion de imagenes texto-a-imagen en espacio latente, con resolucion nativa de 512x512 (aunque admite otras resoluciones con degradacion de calidad).
- Soporte de prompts negativos y de parametros de muestreo (num_inference_steps, guidance scale, seed).
- Inferencia sobre CPU, iGPU, NPU y GPU Intel Arc mediante OpenVINO.
- Integracion con Optimum Intel (`OVDiffusionPipeline`) y con OpenVINO GenAI (`Text2ImagePipeline`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- Capacidad multilingue limitada por el text encoder CLIP; el rendimiento en prompts en castellano es inferior al de prompts en ingles.
- No incluye safety checker por defecto en los ejemplos de uso (se pasa `safety_checker=None`).

## Casos de uso

- Generacion de imagenes en portatiles sin GPU dedicada: al estar en INT8 y OpenVINO, el modelo puede ejecutarse en CPU modernas con un consumo de memoria moderado, lo que permite prototipar sin infraestructura cloud.
- Despliegue en dispositivos edge con aceleradores Intel (NPU, iGPU): util para aplicaciones de generacion de imagenes offline en kioscos, terminales de punto de venta o sistemas embebidos con OpenVINO.
- Prototipado rapido de pipelines texto-a-imagen en entornos CI/CD: el formato IR y la integracion con Optimum permiten levantar un servicio de inferencia con pocas lineas de codigo y sin dependencias de CUDA.
- Generacion de assets para videojuegos o prototipos de diseno: SD 1.5 sigue siendo adecuado para bocetos, texturas y conceptos a 512x512, y la version INT8 reduce el coste por imagen en hardware Intel.
- Educacion e investigacion: sirve como ejemplo practico de cuantizacion post-entrenamiento con NNCF y de conversion a OpenVINO IR, util para cursos de optimizacion de modelos.
- Servicios de generacion de imagenes en entornos con requisitos de privacidad: al poder ejecutarse localmente en CPU, evita enviar prompts a APIs externas.
- Benchmarking de cuantizacion: permite comparar la calidad y la latencia del SD 1.5 en fp32 frente a INT8 sobre el mismo hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 2,3 GB en disco; en inferencia se necesita espacio adicional para activaciones y latentes, por lo que se recomienda al menos 4-6 GB de RAM libre en CPU.
- GPU recomendadas: GPU Intel Arc (A-series, B-series) con soporte OpenVINO; tambien funciona en iGPU Intel Iris Xe y en NPU de procesadores Core Ultra.
- Cabe en GPU consumer: si, en GPUs Intel Arc de gama media; en GPUs NVIDIA/AMD requiere usar OpenVINO con backend correspondiente o convertir el modelo, ya que el formato IR esta optimizado para hardware Intel.
- Opciones de despliegue: OpenVINO GenAI (`openvino-genai`), Optimum Intel (`optimum[openvino]`), y potencialmente servidores de inferencia compatibles con OpenVINO. No es compatible directamente con vLLM, llama.cpp ni Ollama, que estan orientados a LLMs.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y del numero de pasos de inferencia (el ejemplo usa 20 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stable-diffusion-v1-5-int8-ov (este) | ~1,2 G en total (INT8) | 77 tokens CLIP | OpenVINO IR | creativeml-openrail-m | Hugging Face, 0 descargas |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | ~1,2 G (fp32/fp16) | 77 tokens CLIP | safetensors | creativeml-openrail-m | Hugging Face, ampliamente usado |
| OpenVINO/stable-diffusion-v1-5-int8-ov | ~1,2 G (INT8) | 77 tokens CLIP | OpenVINO IR | creativeml-openrail-m | Hugging Face, referencia oficial de Intel |
| SDXL base 1.0 | ~3,5 G (UNet) | 77 tokens CLIP + OpenCLIP | safetensors | creativeml-openrail-m | Hugging Face, muy usado |

La diferencia principal frente al original es el formato y la precision (INT8 frente a fp16/fp32), con la consiguiente reduccion de tamano y el aumento de velocidad en hardware Intel. Frente a SDXL, este modelo es mucho mas ligero y rapido, pero genera imagenes de menor resolucion y calidad. La version de referencia de Intel (OpenVINO/stable-diffusion-v1-5-int8-ov) es funcionalmente equivalente; este repo parece una copia o republicacion con el mismo procedimiento.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del dataset LAION-5B y del SD 1.5 original, incluyendo sesgos de genero, raza y cultura en la generacion de personas y escenas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente, anatomia incorrecta o texto ilegible en las imagenes.
- Limitaciones de contexto e idioma: el text encoder CLIP esta entrenado principalmente en ingles; los prompts en castellano pueden producir resultados menos precisos. La ventana de 77 tokens limita la complejidad de los prompts.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial con restricciones (prohibicion de usos daninos, obligacion de incluir la licencia y las restricciones en redistribuciones). Es necesario revisar los terminos completos antes de uso en produccion.
- Caveat de produccion: el modelo no incluye safety checker por defecto en los ejemplos; en produccion conviene anadir filtros de contenido. Ademas, el formato OpenVINO IR esta atado a la version de OpenVINO (2025.0.0 o superior) y a Optimum Intel 1.22.0 o superior, lo que puede generar incompatibilidades con stacks mas antiguos.
- El repo tiene 0 descargas y 0 likes, y el autor no es el equipo oficial de Intel; se recomienda validar la integridad de los pesos frente al modelo de referencia de OpenVINO antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SpecnaZZZ/stable-diffusion-v1-5-int8-ov
- Modelo original SD 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Version de referencia de Intel: https://huggingface.co/OpenVINO/stable-diffusion-v1-5-int8-ov
- Documentacion de OpenVINO IR: https://docs.openvino.ai/2024/documentation/openvino-ir-format.html
- Guia de compresion de pesos de OpenVINO: https://docs.openvino.ai/2024/openvino-workflow/model-optimization-guide/weight-compression.html
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
