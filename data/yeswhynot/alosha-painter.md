# YesWhyNot/alosha-painter

## Resumen

Alosha Painter es un modelo generativo de vision por computador desarrollado por el autor independiente YesWhyNot, cuyo proposito es generar imagenes de rostros humanos sinteticos. Se trata de un proyecto de caracter experimental y educativo, publicado en HuggingFace con licencia MIT, que incluye la definicion completa del modelo, los scripts de entrenamiento y los pesos ya entrenados.

Tecnicamente, el modelo se basa en una arquitectura UNet personalizada entrenada con Flow Matching, una tecnica de generacion que modela un campo vectorial y muestrea mediante integracion de una EDO (en este caso, con 20 pasos). El modelo fue entrenado sobre un dataset de rostros sinteticos recopilado mediante scraping de ThisPersonDoesNotExist.com. El repositorio incluye checkpoints de PyTorch con pesos EMA y exportaciones ONNX en FP32, FP16 e INT8, ademas de un servidor demo en FastAPI para probar la generacion via HTTP.

Es relevante como ejemplo practico y compacto (el repositorio ocupa solo 0,1 GB) de como implementar un modelo de flow matching de pequena escala, con despliegue optimizado tanto en CPU (INT8) como en GPU (FP16), aunque no es un modelo de proposito general ni comparable a los grandes modelos de difusion comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet personalizada con Flow Matching (FlowMatchingUNet) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de imagen, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16 e INT8 (exportaciones ONNX) |
| Idiomas soportados | no disponible (modelo de imagen; no requiere entrada de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (EMA) y ONNX (FP32, FP16, INT8) |

## Arquitectura y entrenamiento

El modelo emplea una UNet personalizada denominada `FlowMatchingUNet`, entrenada bajo el paradigma de Flow Matching. A diferencia de los modelos de difusion clasicos basados en DDPM, el flow matching aprende un campo vectorial que define un camino continuo entre ruido y datos, y el muestreo se realiza integrando numericamente esa EDO (en la demo se usan 20 pasos). Esto suele traducirse en un muestreo mas directo y con menos pasos que los samplers de difusion tradicionales.

El entrenamiento se realizo sobre un dataset de rostros sinteticos obtenido mediante scraping de ThisPersonDoesNotExist.com, utilizando el script `scrape.py` incluido en el repositorio. Los pesos finales se guardan como checkpoint EMA (Exponential Moving Average), una tecnica estandar que promedia los pesos a lo largo del entrenamiento para mejorar la estabilidad y calidad de las muestras. No se ha publicado informacion sobre el numero de imagenes, epocas, hardware de entrenamiento ni funcion de perdida concreta.

## Capacidades

- Generacion de rostros humanos sinteticos de forma incondicional (no requiere prompt ni imagen de entrada pese a etiquetarse como image-to-image en el pipeline).
- Muestreo mediante integracion ODE del campo vectorial de flow matching con 20 pasos.
- Upsampling bicubico 2x aplicado tras la generacion.
- Despliegue sin dependencia de PyTorch gracias a exportaciones ONNX en FP32 (GPU), FP16 (GPU) e INT8 (CPU).
- Servidor demo FastAPI incluido para generar imagenes via peticiones HTTP GET.
- Scripts completos de recoleccion de datos y reentrenamiento (`scrape.py`, `train.py`).
- No soporta generacion condicionada por texto, edicion por instrucciones ni inpainting, segun la informacion disponible.

## Casos de uso

- Generacion de rostros sinteticos para pruebas de software: se puede levantar el servidor FastAPI y solicitar rostros via `curl` o peticiones HTTP para poblar bases de datos de prueba con avatares que no corresponden a personas reales.
- Prototipado de despliegue ONNX en CPU: la exportacion INT8 permite integrar el modelo en servicios ligeros sin GPU ni instalacion de PyTorch, util para entornos de recursos limitados.
- Material educativo sobre flow matching: el codigo de arquitectura y entrenamiento esta disponible integramente, lo que lo hace util como referencia para aprender a implementar flow matching desde cero.
- Base para fine-tuning experimental: al incluir el dataset scraper y el script de entrenamiento, se puede reentrenar el modelo sobre otros datasets de imagenes pequenos y homogeneos.
- Generacion de avatares anonimos: util para aplicaciones que necesitan avatares por defecto que no infrinjan derechos de imagen de personas reales.
- Benchmark de rendimiento de runtimes: permite comparar el rendimiento de ONNX Runtime en FP32, FP16 e INT8 sobre el mismo modelo en distintas plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos operativos conocidos son que el sampler utiliza 20 pasos de integracion ODE y aplica un upsampling bicubico 2x antes de devolver la imagen PNG.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, por lo que los pesos son muy ligeros; se trata de un modelo de escala pequena.
- VRAM estimada para inferencia: no disponible, aunque el tamano del repo sugiere que cabe con holgura en cualquier GPU moderna de consumo.
- La variante FP16 esta pensada para GPU; la variante INT8 para CPU, por lo que la inferencia en CPU es viable.
- Consumer GPUs: dada la escala del modelo, deberia funcionar en GPUs de consumo basicas (no se publican requisitos concretos).
- Despliegue: servidor FastAPI propio incluido (`run.py` con PyTorch, `run_onnx.py` con ONNX Runtime). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicable, al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles; con 20 pasos de ODE y un modelo pequeno, la latencia deberia ser baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Licencia | Notas |
|---|---|---|---|---|
| Alosha Painter | UNet con Flow Matching | no disponible | MIT | Rostros sinteticos, exportaciones ONNX, escala muy pequena |
| StyleGAN2/StyleGAN3 (NVIDIA) | GAN | decenas de millones | fuente disponible (NVIDIA AI Ethical Charter) | Referencia clasica en generacion de rostros, sin pasos de muestreo iterativo |
| Stable Diffusion 1.5 | UNet de difusion latente | ~890M (UNet) | CreativeML Open RAIL-M | Generacion condicionada por texto, mucho mas grande y con requisitos de hardware superiores |

Alosha Painter se situa claramente en la categoria de modelos experimentales de pequena escala: a diferencia de StyleGAN o Stable Diffusion, no ofrece control por texto ni calidad competitiva, pero destaca por su licencia permisiva, su reducido tamano y la simplicidad de su despliegue ONNX.

## Limitaciones y advertencias

- Alcance muy limitado: solo genera rostros; no admite prompts de texto, edicion ni otras modalidades, pese a estar etiquetado como pipeline image-to-image.
- Datos de entrenamiento de procedencia cuestionable: el dataset se obtuvo por scraping de ThisPersonDoesNotExist.com, lo que puede plantear dudas sobre trazabilidad y terminos de uso del origen de los datos.
- Posible sesgo demografico: al entrenarse con rostros de un generador unico, el modelo heredara los sesgos demograficos (edad, etnia, género) de ese generador, que no estan documentados.
- Riesgo de uso indebido: los rostros sinteticos pueden emplearse para crear perfiles falsos o contenido engañoso; conviene aplicar salvaguardas y marcar las imagenes como sinteticas.
- Calidad no evaluada: no hay metricas publicadas (FID, KID ni similares), por lo que la calidad de las muestras no puede verificarse objetivamente.
- Documentacion escasa: no se especifican hiperparametros, numero de imagenes de entrenamiento ni resolucion de salida.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero el modelo se ofrece sin garantia alguna.
- Proyecto con cero descargas registradas y un solo like en el momento de la ficha, sin comunidad activa de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YesWhyNot/alosha-painter
- Fuente del dataset de entrenamiento: https://thispersondoesnotexist.com
- No se han encontrado papers, blogs oficiales ni demos adicionales en la informacion disponible.
