# TensorForger/Steppe-Wan2.1

## Resumen

Steppe-Wan2.1 es una familia de modelos generativos de escalado (upscaling) de latentes desarrollada por TensorForger. A diferencia de los upscalers clasicos basados en interpolacion o en redes convolutionales, Steppe opera directamente sobre los latentes del VAE de Wan 2.1 y produce un latente ampliado que se decodifica directamente con el VAE, sin una segunda pasada de muestreo del modelo base, sin hires fix y sin prompt. Es, por tanto, un adaptador especializado en superresolucion de imagen y video dentro del ecosistema Wan/Qwen-Image.

El modelo resuelve un problema concreto de los pipelines de generacion visual: ampliar la resolucion de una imagen o un video generado sin incurrir en el coste computacional de un segundo muestreo completo del modelo de difusion. Steppe consigue 2x de resolucion (por ejemplo 512 a 1024 o 1024 a 2048, con encadenado 2x a 2x) y 2x de tasa de fotogramas (interpolacion de fotogramas en el espacio latente) en una sola pasada de un solo paso, con un tiempo del orden de 45 ms para una imagen de 1024 px en una RTX 5090 (la mayor parte del tiempo se consume en la decodificacion del VAE).

Se distribuye en tres variantes: un modelo de 222M parametros de un paso (por defecto), un modelo de 222M parametros base con control de pasos y CFG, y un modelo lite de 19,5M parametros para salidas muy grandes y uso en tiempo real. El repositorio ocupa 0,9 GB y los pesos estan en safetensors bfloat16. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de escalado de latentes (latent upscaler) sobre el espacio latente del VAE de Wan 2.1; flow matching con destilacion |
| Parametros totales | 222M (variantes 1-step y base); 19,5M (variante lite) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre latentes de imagen/video) |
| Tipos de cuantizacion | Pesos en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo visual, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, configuracion en metadatos); `config.json` como catalogo del repositorio |

## Arquitectura y entrenamiento

Steppe es un modelo generativo pequeno entrenado exclusivamente para escalar latentes, no un modelo de difusion de proposito general. Trabaja directamente sobre el espacio latente del VAE de Wan 2.1, compartido por Wan 2.1 (T2V, I2V, FLF2V, VACE; 1.3B y 14B), Wan 2.2 A14B (T2V, I2V), Qwen-Image, Qwen-Image-Edit y Krea 2. La arquitectura emplea flow matching con destilacion para reducir la inferencia a un solo paso en las variantes 1-step. El latente ampliado se decodifica directamente con el VAE, lo que evita una segunda pasada de muestreo del modelo base.

Una innovacion destacable es el condicionamiento por caracteristicas de alta frecuencia (hff), que actua como control de nitidez y detalle fino. Los valores de hff son absolutos: se basan en una estimacion de ruido de Immerkaer, normalizada por cuantiles sobre fotos de ReLAION. El modelo base admite entre 1 y 200 pasos (20 recomendados) y CFG sobre hff, mientras que las variantes 1-step incorporan una guia destilada entrenada en el rango 1-3 sin coste adicional. No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Superresolucion de imagen y video con factor 2x (por ejemplo 512 a 1024, 1024 a 2048) y encadenado 2x a 2x.
- Interpolacion de fotogramas en video con factor 2x de tasa de fotogramas, combinable con el 2x de resolucion en una sola pasada.
- Inferencia en un solo paso en las variantes 1-step (aproximadamente 45 ms para 1024 px en RTX 5090, dominado por la decodificacion del VAE).
- Control de nitidez y detalle fino mediante el parametro hff (rango 0-1, por defecto 0,9; -1 deja que el modelo decida).
- Guia destilada en los modelos 1-step (entrenada en 1-3) y CFG sobre hff en el modelo base.
- Compatibilidad nativa con el VAE de Wan 2.1 y con el VAE de Qwen-Image (probado con `qwen_image_vae`).
- Integracion con ComfyUI mediante los nodos ComfyUI-Steppe, disponibles en ComfyUI-Manager.
- No soporta Wan 2.2 TI2V 5B (VAE de 48 canales) ni VAEs de FLUX, SD3, SDXL u otros.

## Casos de uso

- Superresolucion de imagenes generadas con Qwen-Image o Krea 2: tras el muestreo del modelo base, Steppe amplia el latente 2x y el VAE lo decodifica directamente, evitando un segundo muestreo completo y reduciendo el coste de generar salidas en alta resolucion.
- Escalado de video generado con Wan 2.1 o Wan 2.2 A14B: un clip de 640x512 a 16 fps puede convertirse en 1280x1024 a 32 fps en una sola pasada, combinando 2x de resolucion y 2x de fotogramas, lo que resulta util para previsualizaciones de alta calidad.
- Interpolacion de fotogramas para video: duplicar la tasa de fotogramas de un clip generado a bajo fps para obtener una reproduccion mas fluida, sin necesidad de un modelo de interpolacion independiente.
- Produccion de assets en pipelines de ComfyUI: integrado como nodo entre `KSampler` y `VAE Decode`, permite incorporar el escalado como etapa estandar del flujo de trabajo con descarga automatica de modelos.
- Salidas de muy alta resolucion (2048 a 4096) o streaming en tiempo real: la variante lite de 19,5M parametros esta pensada para estos escenarios por su menor coste.
- Investigacion sobre escalado en espacio latente: la variante base permite ajustar pasos y CFG sobre hff, lo que facilita experimentos controlados sobre el compromiso entre detalle y estabilidad.
- Generacion de material grafico de gran formato a partir de bocetos o imagenes de baja resolucion en el ecosistema Wan/Qwen, manteniendo coherencia de estilo y relacion de aspecto arbitraria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (PSNR, SSIM, LPIPS, FID) en la informacion disponible. El autor aporta comparativas visuales cualitativas (galerias de estilo, textura, relacion de aspecto) y un dato de latencia: aproximadamente 45 ms para una imagen de 1024 px con el modelo por defecto en una RTX 5090, con la mayor parte del tiempo en la decodificacion del VAE.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,9 GB y los pesos son bfloat16, por lo que el modelo en si es ligero (222M o 19,5M parametros) y el consumo dominante proviene del VAE y del modelo base que genera el latente.
- GPU recomendadas: el dato de latencia publicado corresponde a una RTX 5090; no se documentan otras GPU.
- Cabe en GPU de consumo: si, dado el reducido tamano de los pesos, aunque el requisito real dependera del VAE y del pipeline de ComfyUI en el que se integre.
- Opciones de despliegue: ComfyUI mediante los nodos ComfyUI-Steppe (instalables desde ComfyUI-Manager con `comfy node install steppe`); los ficheros pueden colocarse manualmente en `ComfyUI/models/latent_upscale_models`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 45 ms por imagen de 1024 px en RTX 5090 con el modelo por defecto; no se publican cifras de throughput para video.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros upscalers de latentes en la informacion proporcionada. La tabla siguiente recoge solo los datos disponibles de las variantes del propio modelo.

| Modelo | Parametros | Pasos | Uso previsto | Licencia |
|---|---|---|---|---|
| steppe_wan_2_1_200M_1step | 222M | 1 | Por defecto, 90% de los casos | MIT |
| steppe_wan_2_1_200M_base | 222M | 1-200 (20) | Mayor control e investigacion | MIT |
| steppe_wan_2_1_20M_1step | 19,5M | 1 | Salidas muy grandes, tiempo real y streaming | MIT |

## Limitaciones y advertencias

- Solo es compatible con el VAE de Wan 2.1 y con el VAE de Qwen-Image; no soporta Wan 2.2 TI2V 5B (VAE de 48 canales) ni los VAEs de FLUX, SD3 o SDXL.
- No es un modelo de difusion general: no genera imagenes desde texto ni desde cero, solo amplia latentes existentes.
- El rendimiento cualitativo depende del modelo base que produzca el latente de entrada; no se publican metricas objetivas de fidelidad.
- El control de nitidez mediante hff puede introducir artefactos o sobreenfocar si se ajusta de forma inadecuada; los valores son absolutos y calibrados sobre fotos de ReLAION.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma (no es un modelo linguistico).
- La licencia MIT permite uso comercial, pero el uso de los modelos base subyacentes (Wan, Qwen-Image) puede estar sujeto a sus propias condiciones.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos visuales o de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorForger/Steppe-Wan2.1
- Nodos ComfyUI-Steppe: https://github.com/TensorForger/ComfyUI-Steppe
- Workflows de ejemplo: https://github.com/TensorForger/ComfyUI-Steppe/tree/main/example_workflows
- Repositorio del autor: https://github.com/tensorforger/tensorforger
- Modelo base Wan 2.1 T2V 14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base Wan 2.1 T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base Wan 2.1 I2V 14B 720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Modelo base Wan 2.1 I2V 14B 480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Modelo base Wan 2.2 T2V A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan 2.2 I2V A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base Qwen-Image: https://huggingface.co/Qwen/Qwen-Image
- Modelo base Qwen-Image-Edit: https://huggingface.co/Qwen/Qwen-Image-Edit
