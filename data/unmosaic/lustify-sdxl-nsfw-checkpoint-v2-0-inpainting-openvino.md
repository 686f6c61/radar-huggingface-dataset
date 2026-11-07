# unmosaic/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING-openvino

## Resumen

LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING-openvino es la conversión a formato OpenVINO del checkpoint de inpaint `andro-flock/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING`, un fine-tune de Stable Diffusion XL orientado a generación e inpainting de contenido para adultos. Lo publica el usuario `unmosaic` en Hugging Face, que se limita a realizar la exportación mediante `optimum-intel` desde el espacio `openvino-export`; no aporta entrenamiento ni ajuste propio. El resultado es un artefacto listo para inferencia en hardware Intel (CPU, iGPU, NPU y GPU Arc) sin necesidad de GPU NVIDIA.

El modelo resuelve el despliegue de un pipeline SDXL de inpainting en entornos Intel, un escenario habitual en estaciones de trabajo sin CUDA y en equipos de consumo con gráfica integrada. Al estar basado en SDXL, hereda su arquitectura de difusión latente con doble codificador de texto (CLIP ViT-L y OpenCLIP ViT-bigG) y su resolución nativa de 1024x1024, aunque la model card no detalla el proceso de entrenamiento del checkpoint original.

Es relevante ahora por dos motivos: la creciente demanda de inferencia local de modelos de imagen sin dependencia de CUDA y la existencia de pipelines OpenVINO optimizados para SDXL que reducen el consumo de VRAM y permiten ejecutar el modelo en CPU con latencias razonables. La licencia CreativeML OpenRAIL-M impone restricciones de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion XL) con UNet, VAE y doble codificador de texto CLIP; variante inpaint |
| Parametros totales | Aproximadamente 3B (heredado del checkpoint base, segun la busqueda web) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen); resolucion nativa 1024x1024 |
| Tipos de cuantizacion | Pesos exportados a OpenVINO en precision original; no se documentan variantes INT8/INT4 en la model card |
| Idiomas soportados | No disponible (prompts en lenguaje natural, sin lista oficial de idiomas) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | OpenVINO IR (exportado desde Safetensors con optimum-intel) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion XL en su variante de inpainting: un UNet con bloques de atención y conexiones residuales que opera en el espacio latente de un VAE, condicionado por dos codificadores de texto (CLIP ViT-L/14 y OpenCLIP ViT-bigG/14) cuyas representaciones se concatenan. La variante inpaint añade canales de entrada adicionales para la máscara y la imagen de referencia, lo que permite regenerar regiones concretas de una imagen existente manteniendo el resto intacto.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de las imágenes ni si hubo etapas de fine-tuning con RLHF o DPO, ya que la model card del checkpoint original no está incluida en la información proporcionada. La innovación técnica de esta publicación concreta es la exportación a OpenVINO IR mediante `optimum-intel`, que convierte los grafos de PyTorch en representaciones optimizadas para el runtime de Intel y permite ejecutar el pipeline con `OVDiffusionPipeline` fuera de PyTorch.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución nativa de 1024x1024.
- Inpainting: regeneración de regiones enmascaradas de una imagen manteniendo el contexto circundante.
- Condicionamiento por prompt positivo y negativo, con soporte de guidance scale y schedulers propios de SDXL.
- Ejecución en hardware Intel mediante OpenVINO (CPU, iGPU, NPU y GPU Arc) sin CUDA.
- Integración con la API de `diffusers` a través de `OVDiffusionPipeline`.
- Contenido orientado a adultos (NSFW); el checkpoint base está etiquetado como no apto para todas las audiencias.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de entrada más allá de la imagen y la máscara.

## Casos de uso

- Edición de imágenes por regiones en estaciones de trabajo sin GPU NVIDIA: el pipeline de inpainting permite seleccionar una zona y regenerarla con un prompt, ejecutándose en CPU Intel con OpenVINO y sin necesidad de CUDA.
- Prototipado de flujos de generación de imagen en portátiles con gráfica integrada: al estar exportado a OpenVINO IR, el modelo puede cargarse con `OVDiffusionPipeline.from_pretrained` y ejecutarse en la iGPU, lo que facilita demos locales sin infraestructura dedicada.
- Despliegue en servidores Intel Xeon para pipelines internos de generación de imágenes: OpenVINO ofrece optimizaciones de CPU que permiten servir peticiones de inpainting en entornos donde no hay aceleradores NVIDIA.
- Restauración y retoque de fotografías: la máscara de inpainting permite eliminar objetos no deseados o rellenar zonas dañadas con contenido coherente con el prompt y el contexto.
- Creación de contenido para adultos en entornos controlados: el fine-tune está especializado en este dominio, por lo que encaja en plataformas que ya aplican verificación de edad y moderación propia.
- Evaluación comparativa de rendimiento OpenVINO frente a PyTorch: sirve como banco de pruebas para medir latencia y throughput de SDXL en hardware Intel frente a la ejecución estándar con `diffusers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score), latencia ni throughput, y la búsqueda web no aporta datos comparativos del checkpoint base ni de la exportación OpenVINO.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para SDXL en precisión FP16 se suele requerir del orden de 8-10 GB de VRAM, pero la exportación OpenVINO puede ejecutarse en CPU y iGPU con memoria compartida del sistema, por lo que la cifra depende del backend elegido.
- GPU recomendadas: GPU Intel Arc (A770, B580 y similares) con soporte OpenVINO; también iGPU Intel Iris Xe y NPU en procesadores Core Ultra. No se documenta soporte para A100, H100 ni RTX 4090 en esta exportación concreta, aunque el checkpoint original en PyTorch podría ejecutarse en ellas.
- Cabe en GPU de consumo: sí, en el sentido de que puede ejecutarse en iGPU Intel y en GPU Arc de gama media; en GPU NVIDIA de consumo requeriría usar el checkpoint original, no esta exportación.
- Opciones de despliegue: `optimum-intel` con `OVDiffusionPipeline`, runtime OpenVINO, y el ecosistema `diffusers` para el checkpoint base. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unmosaic/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING-openvino | ~3B | 1024x1024, inpainting | OpenVINO IR | CreativeML OpenRAIL-M | Hugging Face |
| andro-flock/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING | ~3B | 1024x1024, inpainting | Safetensors (diffusers) | CreativeML OpenRAIL-M | Hugging Face |
| TheImposterImposters/LUSTIFY-v2.0 | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Stable Diffusion XL base (referencia de arquitectura) | ~3.5B | 1024x1024, text-to-image | Safetensors, OpenVINO | CreativeML OpenRAIL-M | Hugging Face |

La comparativa se limita a los artefactos encontrados en la búsqueda; no se dispone de datos de rendimiento que permitan una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Contenido NSFW: el checkpoint está especializado en contenido para adultos y la model card lo marca como no apto para todas las audiencias; requiere moderación y control de acceso en cualquier despliegue público.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, artefactos en manos y rostros, y elementos incoherentes con el prompt.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de representación; es esperable que herede los sesgos de los datos usados en el fine-tune original.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir las restricciones en redistribuciones); conviene revisar el texto completo antes de producción.
- Idiomas: no hay lista oficial de idiomas soportados; el rendimiento con prompts en castellano no está documentado y podría ser inferior al de inglés.
- Formato OpenVINO: la exportación está atada al runtime de Intel; para hardware NVIDIA o AMD habría que usar el checkpoint original en PyTorch.
- Sin benchmarks ni métricas de calidad publicadas: no es posible comparar su calidad de imagen con alternativas de forma objetiva a partir de la información disponible.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- [Modelo en Hugging Face (exportación OpenVINO)](https://huggingface.co/unmosaic/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING-openvino)
- [Checkpoint base: andro-flock/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING](https://huggingface.co/andro-flock/LUSTIFY-SDXL-NSFW-checkpoint-v2-0-INPAINTING)
- [TheImposterImposters/LUSTIFY-v2.0](https://huggingface.co/TheImposterImposters/LUSTIFY-v2.0)
- [optimum-intel (repositorio de GitHub)](https://github.com/huggingface/optimum-intel)
- [Espacio de exportación OpenVINO](https://huggingface.co/spaces/echarlaix/openvino-export)
