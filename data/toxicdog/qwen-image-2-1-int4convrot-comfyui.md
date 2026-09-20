# toxicdog/Qwen-Image-2.1-INT4ConvRot-ComfyUI

## Resumen

Qwen-Image-2.1-INT4ConvRot-ComfyUI es un reempaquetado de pesos del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicado por el usuario toxicdog. No se trata de un entrenamiento nuevo ni de un ajuste fino documentado, sino de una conversion de los ficheros originales a los formatos que consume ComfyUI, incluyendo una variante INT4 en el formato ConvRot nativo de ComfyUI (W4A4), una variante INT8 y los ficheros bf16 de referencia. El objetivo declarado por el autor es probar inferencia rapida en macOS a traves de la aplicacion Radiant Canvas.

El repositorio separa los tres componentes habituales de un pipeline de difusion texto-a-imagen: el modelo de difusion (diffusion_models), el codificador de texto, que en este caso es un Qwen3-VL de 8B, y el VAE. Se distribuyen versiones bf16, INT4 e INT8 del modelo de difusion y del codificador de texto, ademas de una variante W4A8 del codificador.

La relevancia de esta ficha es practica: permite ejecutar la familia Qwen-Image en hardware con memoria limitada sin depender de pesos en precision completa, algo habitual en equipos de consumo y en Apple Silicon con memoria unificada. Como contrapartida, el autor no publica especificaciones tecnicas, benchmarks ni detalles de entrenamiento, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que buena parte de los datos tecnicos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagenes, con codificador de texto Qwen3-VL de 8B y VAE propio. El autor no detalla la arquitectura interna (DiT, MMDiT u otra) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, INT4 ConvRot (W4A4, formato nativo de ComfyUI), INT8 ConvRot y W4A8 para el codificador de texto |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como license: other) |
| Formato de pesos | safetensors, en ficheros unicos para ComfyUI (diffusion-single-file) |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Autor del reempaquetado | toxicdog |
| Tamano del repositorio | 65,9 GB |
| Fecha de creacion y ultima actualizacion | 20 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas y valoraciones | 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Por los ficheros publicados se deduce que se trata de un pipeline de difusion texto-a-imagen con tres piezas: un modelo de difusion (qwen_image_2.1), un codificador de texto multimodal Qwen3-VL de 8B (qwen3vl_8b) y un VAE (qwen_image_2.1_vae). El autor no indica si el modelo base emplea atencion completa, atencion lineal ni ninguna innovacion concreta de decodificacion. Tampoco se publica el numero de parametros totales ni la resolucion nativa de generacion.

En cuanto al entrenamiento, no hay ningun dato en el material proporcionado: ni volumen de tokens o pares imagen-texto, ni composicion del dataset, ni si hubo etapas de ajuste por preferencias (RLHF, DPO) o de destilacion. La unica informacion tecnica relevante del reempaquetado es el uso del formato ConvRot de ComfyUI, que aplica rotaciones antes de la cuantizacion para reducir el error en pesos y activaciones de 4 bits (esquema W4A4), lo que permite cargar los ficheros con los cargadores estandar de modelo de difusion y de codificador de texto de ComfyUI.

## Capacidades

- Generacion de imagenes a partir de texto, heredada del modelo base Qwen/Qwen-Image-2.1.
- Inferencia en tres niveles de precision (bf16, INT8 e INT4), lo que permite ajustar el consumo de memoria al hardware disponible.
- Ejecucion dentro de ComfyUI mediante los cargadores nativos de modelo de difusion y de codificador de texto.
- Uso previsto en macOS a traves de Radiant Canvas, segun indica el autor, orientado a inferencia rapida en equipos Apple.
- Edicion o postprocesado de imagen solo en la medida en que el pipeline de ComfyUI y el VAE lo permitan; el autor no documenta capacidades de edicion, inpainting o control estructural.
- Capacidades multimodales del codificador de texto Qwen3-VL de 8B: no estan documentadas en esta ficha mas alla de su funcion como encoder.
- Soporte de tool calling, agentes, razonamiento multi-paso o modos de pensamiento: no aplica, es un modelo de generacion de imagenes, no un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de ilustraciones en local con ComfyUI: el repositorio esta pensado para colocarse en models/diffusion_models, models/text_encoders y models/vae, de modo que el pipeline funcione con los cargadores estandar sin conversiones adicionales.
- Inferencia en equipos con poca VRAM: la variante INT4 ConvRot (W4A4) reduce el peso del modelo de difusion y permite plantear ejecuciones en GPU de consumo donde la version bf16 no cabria.
- Flujos de trabajo en Apple Silicon: el autor empaqueto los ficheros para probar inferencia rapida en macOS con Radiant Canvas, de modo que es un caso de uso directo en equipos con memoria unificada.
- Comparacion de calidad entre precisiones: al incluir bf16, INT8 e INT4 del mismo modelo, sirve para medir la degradacion introducida por la cuantizacion en un mismo prompt y semilla.
- Generacion por lotes de recursos graficos (banners, miniaturas, ilustraciones de blog): el modelo se puede orquestar desde scripts que invoquen la API de ComfyUI y encadenen prompts de forma masiva.
- Prototipado de producto sobre modelos de difusion abiertos: permite validar una interfaz o un servicio de generacion de imagenes antes de invertir en infraestructura con pesos en precision completa.
- Pruebas de integracion de nuevos formatos de cuantizacion: es util para verificar el soporte de ConvRot en versiones recientes de ComfyUI antes de adoptarlo en produccion.
- Creacion de pipelines mixtos con VAE y codificador de texto cuantizados de forma independiente, por ejemplo bf16 en el VAE e INT4 en el modelo de difusion y en el codificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FID, CLIP score, ImageReward, GenEval ni similares) ni comparaciones cuantitativas entre las variantes bf16, INT8 e INT4. Las busquedas web realizadas tampoco devolvieron resultados relacionados con el modelo, por lo que no se puede ofrecer ninguna tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria para ninguna de las tres precisiones.
- La existencia de una variante INT4 ConvRot W4A4 indica que el modelo en bf16 no esta pensado para GPU de gama media; la cuantizacion a 4 bits es la via habilitada para equipos con menos memoria.
- GPU recomendadas: no disponibles. No hay ninguna recomendacion explicita de A100, H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: no confirmada de forma explicita, aunque el proposito declarado del reempaquetado (inferencia rapida en macOS) apunta a equipos de sobremesa y portatiles, no a clusters.
- Apple Silicon: es el escenario mencionado por el autor, a traves de la aplicacion Radiant Canvas, que trabaja sobre memoria unificada.
- Opciones de despliegue: ComfyUI con una version reciente que soporte ConvRot W4A4; Radiant Canvas en macOS. vLLM, TGI, llama.cpp u Ollama no son aplicables a este tipo de modelo y formato.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, pasos de muestreo soportados ni resoluciones objetivo.

## Comparativa con modelos similares

No hay datos de rendimiento de este reempaquetado, por lo que la comparativa se limita a aspectos de formato, licencia y disponibilidad. Los datos de los modelos alternativos proceden de su documentacion publica habitual y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Tipo de pesos | Licencia | Notas |
|---|---|---|---|---|
| toxicdog/Qwen-Image-2.1-INT4ConvRot-ComfyUI | no disponible | safetensors bf16, INT8 e INT4 ConvRot | qwen-research | Reempaquetado para ComfyUI; sin benchmarks publicados |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible en la informacion proporcionada | safetensors del repositorio original | qwen-research | Referencia oficial; requiere conversion para ComfyUI |
| Qwen-Image (version original de la familia) | no disponible en esta ficha | safetensors y variantes de la comunidad | Apache 2.0 | Punto de comparacion de la propia familia Qwen |
| FLUX.1-dev | no disponible en esta ficha | safetensors, con variantes GGUF de la comunidad | no comercial | Alternativa de difusion de rango similar segun el ecosistema |
| Stable Diffusion 3.5 Large | no disponible en esta ficha | safetensors, con variantes GGUF | licencia comunitaria de Stability | Alternativa ampliamente soportada en ComfyUI |

En cualquier caso, no es posible establecer una comparacion de calidad objetiva porque este repositorio no publica ninguna metrica ni ejemplos medibles frente a esas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no haber informacion sobre los datos de entrenamiento del modelo base, no se puede caracterizar el sesgo de generacion.
- Riesgo de alucinacion visual: no evaluado. No hay estudios de fidelidad al prompt ni de consistencia en la informacion disponible.
- La licencia qwen-research es una licencia de investigacion; conviene revisar el texto completo en el enlace de licencia del modelo base antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El repositorio es un reempaquetado de terceros, no una publicacion oficial de Qwen. La trazabilidad de la conversion y su verificacion no estan documentadas.
- La etiqueta base_model:finetune sugiere una relacion de ajuste fino, mientras que la model card describe un reempaquetado. La discrepancia no esta aclarada por el autor.
- El formato INT4 ConvRot es especifico de ComfyUI. Requiere una version reciente del programa; versiones antiguas no podran cargarlo y los ficheros no son directamente utilizables en otros runners.
- La precision INT4 y W4A4 puede degradar la calidad de imagen respecto a bf16. El autor no cuantifica esa perdida.
- No se documentan idiomas soportados ni el comportamiento del codificador de texto con prompts en castellano.
- El repositorio presenta 0 descargas y 0 likes, sin historial de uso que permita valorar su estabilidad.
- No hay informacion sobre resoluciones maximas, numero de pasos recomendado, escala de CFG ni semillas compatibles.
- Los enlaces encontrados en la busqueda web no guardan relacion con este modelo y no aportan informacion verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/toxicdog/Qwen-Image-2.1-INT4ConvRot-ComfyUI
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Aplicacion Radiant Canvas (macOS), citada por el autor: https://apps.apple.com/us/app/radiant-canvas-ai-image-gen/id6802973075
- ComfyUI (necesario para cargar los ficheros ConvRot): https://github.com/comfyanonymous/ComfyUI
- Resultados de busqueda web: ninguna referencia relevante. Los enlaces devueltos apuntan a hilos de Zhihu sobre generacion de imagenes con ChatGPT y no contienen informacion sobre este modelo ni sobre Qwen-Image-2.1.
