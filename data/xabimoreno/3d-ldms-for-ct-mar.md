# xabimoreno/3D-LDMs-for-CT-MAR

## Resumen

3D-LDMs-for-CT-MAR es un conjunto de pesos oficiales para la supresion de artefactos metalicos en tomografia computarizada (CT), publicado por Xabier Moreno Casado, Jef Vandemeulebroucke y Jakub Ceranka, del grupo ETRO de la Vrije Universiteit Brussel (VUB) y imec. El modelo acompaña al articulo "Large-Volume Conditioned 3D Latent Diffusion Models for CT Metal Artifact Suppression", aceptado en el workshop Deep Generative Models for Medical Imaging (DGM4MICCAI) de MICCAI 2026.

Tecnicamente se trata de un pipeline de difusion latente en 3D (LDM) con un autoencoder VQ-VAE previo que aplica una compresion espacial 4x, de modo que la difusion opera sobre representaciones latentes de volumenes completos en lugar del espacio de vóxeles. El repositorio incluye tres checkpoints: el autoencoder de la etapa 1 y dos variantes del modelo de difusion, una condicionada unicamente por el CT con artefactos y otra que anade metadatos del implante como condicionamiento adicional.

Es relevante porque aborda un problema clinico muy concreto y con impacto directo en el flujo de trabajo radiologico y de planificacion radioterapica: los implantes metalicos (protesis, tornillos, fijaciones dentales) generan artefactos de dispersion y endurecimiento de haz que degradan la calidad diagnostica del estudio. El modelo se publica bajo licencia Apache 2.0, lo que facilita su reutilizacion, aunque el tamano de parametros, el contexto y los resultados de benchmarks no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente 3D (LDM) con autoencoder VQ-VAE 3D de compresion espacial 4x; variante condicionada por imagen y variante condicionada por imagen mas metadatos del implante |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplicable: modelo de difusion sobre volumenes de imagen medica, no basado en tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplicable: el modelo procesa imagenes de CT, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`): `vqvae_checkpoint.pth`, `anatomy_ldm_checkpoint.pth`, `anatomy_metadata_ldm_checkpoint.pth` |

Otros datos del repositorio: tamano del repositorio 1,9 GB, pipeline declarado `image-to-image`, tarea `medical-imaging / ct / metal-artifact-reduction`, creado el 22 de septiembre de 2026 y actualizado el 22 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El sistema se organiza en dos etapas. La etapa 1 es un autoencoder cuantizado vectorial (VQ-VAE) 3D que comprime el volumen en 4x en la dimension espacial, reduciendo el coste computacional de la difusion. Sobre ese espacio latente opera la etapa 2, un modelo de difusion latente 3D condicionado por el CT con artefactos, que regenera una version con los artefactos metalicos suprimidos. Se publican dos variantes de esta segunda etapa: el "Model 2.1" (`anatomy_ldm_checkpoint.pth`), condicionado unicamente por el CT artefactado, y el "Model 2.2" (`anatomy_metadata_ldm_checkpoint.pth`), que incorpora ademas metadatos del implante como senal de condicionamiento. El articulo enfatiza el caracter de "large-volume", es decir, el procesamiento de volumenes completos de gran tamano en lugar de parches aislados.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens o volumenes de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable en este dominio) ni innovaciones adicionales de decodificacion. La unica innovacion explicitamente documentada es el condicionamiento por metadatos del implante en la variante 2.2 y el enfoque de difusion latente 3D sobre volumenes de gran tamano.

## Capacidades

- Supresion de artefactos metalicos en CT: transforma un volumen de CT afectado por implantes metalicos en una version con los artefactos atenuados o eliminados (`image-to-image`).
- Generacion condicionada de imagen medica 3D: opera sobre volumenes completos, no solo sobre cortes 2D individuales.
- Condicionamiento multimodal interno: la variante 2.2 acepta, ademas de la imagen artefactada, metadatos del implante, lo que permite modular la reconstruccion segun el tipo de material o dispositivo.
- Compresion latente 3D: el VQ-VAE de la etapa 1 puede reutilizarse como codificador/decodificador de volumenes con factor 4x en las dimensiones espaciales.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo "thinking", ya que no es un modelo de lenguaje.
- Capacidades multilingues: no aplicable.

## Casos de uso

- Radiologia diagnostica: reconstruir estudios de pacientes con protesis de cadera o rodilla para recuperar la visibilidad de estructuras adyacentes al implante, donde los artefactos suelen ocultar tejido blando y hueso periprotesico.
- Planificacion de radioterapia: mejorar la precision de la delimitacion de volumenes (contouring) y el calculo de dosis en pacientes con implantes metalicos, donde los artefactos distorsionan los valores de unidades Hounsfield.
- Cirugia ortopedica asistida por imagen: generar estudios preoperatorios mas limpios para planificacion de revision de protesis o colocacion de nuevo material.
- Odontologia y maxilofacial: reducir artefactos de implantes dentales, tornillos y fijaciones, que degradan la visualizacion de estructuras oseas y senos paranasales.
- Investigacion en imagen medica: servir como baseline reproducible de difusion latente 3D para comparar metodos de reduccion de artefactos metalicos bajo una misma metodologia de evaluacion.
- Curacion y aumento de datasets: generar versiones sin artefactos de estudios artefactados para entrenar otros modelos de segmentacion o deteccion, siempre con las cautelas eticas y regulatorias correspondientes.
- Control de calidad y procesamiento por lotes: integrar el pipeline en un servicio interno que preprocese automaticamente todos los CT con metal antes de que lleguen al diagnostico.
- Evaluacion metodologica: reproducir los experimentos del articulo usando los checkpoints publicados para validar la variante 2.1 frente a la 2.2 y medir la aportacion del condicionamiento por metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (por ejemplo PSNR, SSIM, RMSE en unidades Hounsfield) ni comparaciones numericas con otros metodos; unicamente remite al articulo de DGM4MICCAI 2026, cuyo contenido no figura en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. No se publican requisitos de memoria ni configuraciones de referencia por parte de los autores.
- Estimacion orientativa (no confirmada por los autores): el repositorio pesa 1,9 GB y contiene tres checkpoints PyTorch; un modelo de difusion latente 3D con compresion 4x suele requerir del orden de 12-24 GB de VRAM para procesar volumenes completos o parches 3D grandes, y menos si se aplica inferencia por parches con solapamiento. Debe tratarse como una estimacion, no como un dato verificado.
- GPU recomendadas: no indicadas por los autores. Por rango de memoria, serian candidatas tarjetas de 16-24 GB o superiores (A100, H100, L40S, RTX 4090/5090); la idoneidad concreta no puede confirmarse con la informacion disponible.
- Viabilidad en GPU de consumo: no confirmada. Con 1,9 GB de pesos en disco, es razonable esperar que quepa en tarjetas de gama alta de consumo si la inferencia se hace por parches, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el flujo documentado es clonar el repositorio de GitHub, instalar el extra `inference` (`pip install -e ".[inference]"`) y descargar los pesos con `python DownloadWeights.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso). Tampoco se documenta exportacion a ONNX, TensorRT o formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de reduccion de artefactos metalicos en CT (ni metodos basados en GAN, ni variantes de difusion 2D), por lo que no es posible construir una comparativa fundamentada con parametros, contexto, licencia y disponibilidad de terceros.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3D-LDMs-for-CT-MAR (este modelo) | no disponible | no aplicable | no disponible | Apache 2.0 | Pesos en HuggingFace y codigo en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de datos de rendimiento: no hay metricas publicadas en la informacion disponible, por lo que no puede validarse la calidad de la reconstruccion ni su robustez frente a distintos tipos de implante.
- Riesgo de alucinacion estructural: al ser un modelo generativo de difusion, puede introducir o eliminar estructuras anatomicas no presentes en el estudio original. En imagen medica esto es un riesgo critico y exige validacion radiologica caso por caso.
- Uso clinico no autorizado por defecto: los pesos se publican bajo Apache 2.0 como material de investigacion. Cualquier uso diagnostico requeriria validacion regulatoria (por ejemplo, marcado CE o autorizacion de la FDA) que no se documenta.
- Dependencia del condicionamiento por metadatos: la variante 2.2 necesita metadatos del implante; si son incorrectos o estan ausentes, la calidad de la reconstruccion puede degradarse y no hay informacion disponible sobre como se comporta el modelo en ese escenario.
- Sesgos del dataset de entrenamiento: el dataset no se describe en la informacion proporcionada (numero de estudios, distribucion de fabricantes de implantes, poblacion, equipo de CT), por lo que se desconocen sesgos por tipo de material, protocolo de adquisicion o demografia.
- Generalizacion limitada conocida: los modelos de reduccion de artefactos metalicos suelen degradarse ante geometrias de implante o protocolos de adquisicion poco representados en entrenamiento; no hay datos que confirmen o descarten este comportamiento aqui.
- Sin soporte multilingue ni de texto: cualquier expectativa de uso tipo LLM (tool calling, agentes, contexto largo) es inaplicable.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy temprana y poca validacion independiente por parte de la comunidad.
- Cautela con el etiquetado de la model card: parte del contenido se refiere a un articulo "in press"; los detalles metodologicos completos deben verificarse en la publicacion final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xabimoreno/3D-LDMs-for-CT-MAR
- Repositorio GitHub: https://github.com/ETRO-MIT/3D-LDMs-for-CT-MAR
- README del repositorio: https://github.com/ETRO-MIT/3D-LDMs-for-CT-MAR/blob/main/README.md
- Citacion del articulo (BibTeX incluido en la model card): Moreno Casado, X., Vandemeulebroucke, J., Ceranka, J. "Large-Volume Conditioned 3D Latent Diffusion Models for CT Metal Artifact Suppression", DGM4MICCAI, MICCAI Workshop, 2026 (in press). No se proporciona DOI ni enlace directo al paper en la informacion disponible.
