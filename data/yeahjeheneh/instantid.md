# Yeahjeheneh/InstantID

## Resumen

InstantID es un metodo de generacion de imagenes text-to-image orientado a la preservacion de la identidad facial (ID-preserving generation) a partir de una unica imagen de referencia, sin necesidad de ajuste fino (tuning-free). El modelo se apoya en Stable Diffusion XL 1.0 como modelo base y anade dos componentes especificos: IdentityNet, implementado como un ControlNetModel que inyecta la informacion de los puntos clave (keypoints) del rostro, y un adaptador facial en formato `ip-adapter.bin` que aporta el embedding de identidad. El encoder de rostro utilizado es `antelopev2` de InsightFace, que debe descargarse por separado.

La ficha corresponde al repositorio `Yeahjeheneh/InstantID`, un espejo del repositorio original `InstantX/InstantID` publicado por el equipo InstantX. El repositorio tiene un tamano de 4,2 GB, etiqueta de licencia apache-2.0, pipeline `text-to-image` y soporte declarado unicamente para ingles. En el momento de la consulta registra 0 descargas y 0 likes, y su model card reproduce integramente la del proyecto original.

El interes practico del modelo reside en que resuelve la generacion de retratos consistentes con una identidad concreta sin entrenar un LoRA ni un embedding por sujeto, un flujo que tradicionalmente requiere decenas de imagenes y tiempo de entrenamiento. El articulo asociado (arXiv:2401.07519) describe el metodo como zero-shot y capaz de operar en segundos, aunque los resultados numericos concretos no se recogen en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente sobre Stable Diffusion XL 1.0, con ControlNet (IdentityNet) e IP-Adapter facial; encoder de identidad InsightFace `antelopev2` |
| Parametros totales | no disponible (no se especifica en la informacion proporcionada; el repositorio ocupa 4,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; la longitud del prompt depende del codificador de texto del modelo base y no se detalla) |
| Tipos de cuantizacion | no disponible; la model card emplea `torch_dtype=torch.float16` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`ControlNetModel/diffusion_pytorch_model.safetensors`) y binario (`ip-adapter.bin`) |

Otros datos tecnicos extraidos de la model card: escala del adaptador recomendada `set_ip_adapter_scale(0.8)`, escala de condicionamiento del ControlNet `controlnet_conditioning_scale=0.8`, y deteccion facial con `det_size=(640, 640)`.

## Arquitectura y entrenamiento

InstantID no es un transformer autoregresivo ni un modelo de lenguaje: es un pipeline de difusion para generacion de imagenes. Se compone de tres piezas que se combinan sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. La primera es IdentityNet, un ControlNet que recibe los keypoints faciales (dibujados con la funcion `draw_kps`) como condicionamiento espacial y guia la estructura del rostro generado. La segunda es un adaptador de imagen (`ip-adapter.bin`) que inyecta el embedding de identidad extraido por el encoder facial. La tercera es el propio encoder `antelopev2` de InsightFace, que produce tanto el embedding como los keypoints a partir de la imagen de referencia; la model card solo selecciona la cara de mayor area cuando hay varios rostros.

El metodo se presenta como tuning-free y zero-shot, es decir, no requiere entrenamiento por identidad: basta con una imagen de entrada. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO, ya que se trata de un modelo generativo de imagenes y no de un modelo de lenguaje. Tampoco se describen innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la descripcion funcional de los tres componentes y a las recomendaciones de ajuste de pesos.

## Capacidades

- Generacion de imagenes text-to-image condicionadas por un prompt textual en ingles.
- Preservacion de identidad facial a partir de una unica imagen de referencia, sin reentrenamiento.
- Control estructural del rostro mediante keypoints faciales (IdentityNet), lo que permite variar pose, iluminacion y encuadre manteniendo el parecido.
- Combinacion de dos mandos de intensidad independientes: fuerza del adaptador facial y fuerza de IdentityNet, utiles para equilibrar parecido frente a fidelidad al prompt.
- Aplicacion a estilos fotograficos variados mediante prompting, como el ejemplo de la model card con estilo de pelicula analogica (Kodachrome, grano, vineta).
- Compatibilidad con prompts negativos para mitigar artefactos (baja resolucion, texto, marcas de agua, deformaciones, ojos cruzados).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; son capacidades ajenas a este tipo de modelo.

## Casos de uso

- Retratos consistentes para narrativa visual: generar una serie de ilustraciones o storyboards donde el mismo personaje aparece en escenas, poses y vestuarios distintos a partir de una sola foto de referencia, usando IdentityNet para fijar la estructura facial.
- Avatares personalizados en aplicaciones: un servicio puede pedir al usuario una unica fotografia y producir avatares estilizados sin entrenar un LoRA por usuario, reduciendo coste y tiempo de espera por peticion.
- Pruebas de estilismo, maquillaje o peluqueria: generar variaciones de un mismo rostro con distintos peinados y estilos fotograficos para catalogos o simuladores, ajustando la fuerza del adaptador para conservar el parecido.
- Prototipado de personajes para videojuegos y novelas visuales: producir hojas de personaje coherentes entre expresiones y encuadres antes de encargar el modelado 3D definitivo.
- Marketing con imagen sintetica consistente: campanas donde una misma figura aparece en multiples piezas graficas, siempre que exista consentimiento explicito de la persona representada y se cumplan las obligaciones legales de etiquetado de contenido sintetico.
- Restauracion y reestilizacion de fotografia de archivo: aplicar acabados analogicos o contemporaneos a retratos antiguos manteniendo los rasgos del sujeto original.
- Demostraciones y pruebas de concepto: el repositorio incluye un Space de Gradio, lo que permite validar el flujo completo (encoder facial, ControlNet y adaptador) sin montar infraestructura propia.
- Generacion de material editorial seriado: portadas, columnas ilustradas o articulos con una misma identidad visual a lo largo de una publicacion, controlando el estilo mediante prompt y prompt negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La informacion proporcionada no incluye tablas comparativas con metricas como similitud de identidad (por ejemplo, similitud coseno con ArcFace), FID, CLIP score ni comparaciones cuantitativas frente a otros metodos. El articulo asociado (arXiv:2401.07519) se titula "Zero-shot Identity-Preserving Generation in Seconds", lo que sugiere un enfasis en la latencia de inferencia, pero no se dispone de cifras concretas en el material consultado.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano del repositorio (4,2 GB) y del uso declarado de `torch_dtype=torch.float16` en la model card; no proceden de una medicion publicada en la informacion disponible.

- VRAM estimada para inferencia en fp16: en torno a 10-12 GB sumando el U-Net de SDXL, el ControlNet de IdentityNet, el adaptador facial y el encoder InsightFace. Los picos de memoria dependen de la resolucion de salida y del uso de atencion eficiente.
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090 y RTX 3090 (24 GB) para uso individual con holgura.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, 4090) en fp16. En tarjetas de 12-16 GB es probable que funcione con `enable_model_cpu_offload`, atencion eficiente o VAE en tiling, aunque no se especifica en la documentacion revisada.
- Encoder facial: el codigo de ejemplo de la model card usa `providers=['CUDAExecutionProvider', 'CPUExecutionProvider']`, por lo que puede ejecutarse en CPU si no hay GPU disponible en ese paso.
- Opciones de despliegue: la libreria declarada es `diffusers`, con un pipeline personalizado (`StableDiffusionXLInstantIDPipeline`) que no forma parte del paquete estandar y debe tomarse del repositorio de GitHub. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. La unica referencia es el titulo del articulo, que menciona generacion "en segundos"; no se detalla el hardware de referencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones de los modelos alternativos, por lo que la tabla es una comparacion de categoria y no de cifras verificadas.

| Modelo | Enfoque | Entrenamiento por identidad | Imagenes de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InstantID | ControlNet (IdentityNet) + IP-Adapter facial sobre SDXL | No (tuning-free, zero-shot) | 1 | apache-2.0 (encoder facial aparte) | Repositorio original InstantX/InstantID y espejos |
| IP-Adapter FaceID | Adaptador de imagen con embedding facial sobre modelos de difusion | No | 1 o varias | no disponible en la informacion proporcionada | no disponible |
| PhotoMaker | Adaptador de identidad sobre difusion | No | Varias | no disponible en la informacion proporcionada | no disponible |
| DreamBooth / LoRA por sujeto | Ajuste fino por identidad | Si | Decenas | Depende del modelo base | Ampliamente extendido |

Diferencias cualitativas conocidas por la informacion disponible: InstantID se distingue por requerir una sola imagen y no necesitar entrenamiento, e incorpora un ControlNet que anade control estructural mediante keypoints, algo que un adaptador de imagen puro no ofrece.

## Limitaciones y advertencias

- Riesgo de uso indebido para deepfakes: el propio autor advierte que los usuarios son responsables de cumplir la legislacion local y de utilizar la herramienta de forma responsable; los desarrolladores declinan responsabilidad por mal uso.
- Requisito de consentimiento: generar retratos de personas reales sin autorizacion puede vulnerar derechos de imagen y normativa de proteccion de datos; conviene documentar el consentimiento y etiquetar el contenido como sintetico donde la ley lo exija.
- Componente con licencia independiente: el encoder facial `antelopev2` no se distribuye en el repositorio y debe descargarse desde InsightFace. Su licencia es distinta de la apache-2.0 del proyecto, por lo que hay que revisarla antes de un uso comercial.
- Repositorio espejo no oficial: la ficha corresponde a `Yeahjeheneh/InstantID`, con 0 descargas y 0 likes, y su model card apunta al repositorio original `InstantX/InstantID`. No hay garantia de mantenimiento, trazabilidad ni integridad de los pesos; se recomienda verificar el origen antes de desplegarlo.
- Alucinacion y artefactos visuales: la model card incluye en el prompt negativo terminos como `lowres`, `deformed`, `mutated`, `cross-eyed` o `disfigured`, lo que indica que el pipeline puede producir manos, texto y estructuras anatomicas incorrectas.
- Sesgos del modelo base: al construirse sobre Stable Diffusion XL 1.0, hereda los sesgos de representacion de su dataset de entrenamiento en cuanto a genero, etnia, edad y contextos culturales. No se documentan evaluaciones de sesgo especificas de InstantID.
- Limitaciones de idioma: solo se declara soporte para ingles, tanto en la etiqueta del repositorio como en la model card.
- Falta de control fino: la propia model card reconoce que si el texto generado no responde al prompt conviene reducir la fuerza del adaptador, lo que implica un compromiso entre parecido facial y fidelidad al texto.
- Fecha de creacion anomala: el repositorio figura creado y actualizado el 2026-09-21, dato que conviene contrastar con la fecha real del proyecto original.
- Resultados de busqueda no relevantes: los resultados web proporcionados en la consulta versan sobre fuentes tipograficas y redes sociales, sin relacion con el modelo, por lo que no aportan informacion tecnica util.

## Enlaces

- Repositorio consultado (espejo): https://huggingface.co/Yeahjeheneh/InstantID
- Repositorio original del equipo autor: https://huggingface.co/InstantX/InstantID
- Pagina del proyecto: https://instantid.github.io/
- Articulo: https://arxiv.org/abs/2401.07519
- Codigo fuente: https://github.com/InstantID/InstantID
- Demo de Gradio: https://huggingface.co/spaces/InstantX/InstantID
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Descarga del encoder facial `antelopev2`: https://github.com/deepinsight/insightface/issues/1896#issuecomment-1023867304
- Cita del articulo: Wang, Qixun; Bai, Xu; Wang, Haofan; Qin, Zekui; Chen, Anthony. "InstantID: Zero-shot Identity-Preserving Generation in Seconds", arXiv:2401.07519, 2024.
