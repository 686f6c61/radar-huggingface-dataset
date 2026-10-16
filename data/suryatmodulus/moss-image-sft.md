# suryatmodulus/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generacion de imagenes a partir de texto (text-to-image) de la familia MOSS-Image, desarrollada por OpenMOSS. Se trata de un ajuste supervisado (SFT) derivado de OpenMOSS-Team/MOSS-Image-Base, con el que comparte arquitectura y pipeline de inferencia, y esta pensado para mejorar la organizacion visual y, de forma destacada, el renderizado de texto dentro de la imagen generada. La ficha que se analiza aqui corresponde a una reproduccion del repositorio publicada por el usuario suryatmodulus en HuggingFace; el repositorio de referencia del proyecto es OpenMOSS-Team/MOSS-Image-SFT.

El modelo ocupa 5.082.308.624 parametros segun los pesos en safetensors del repositorio, que pesa 27,2 GB. Se distribuye bajo licencia Apache 2.0, soporta prompts en ingles y chino, y se integra en el ecosistema diffusers mediante un pipeline personalizado (MOSSImagePipeline) que requiere trust_remote_code. Ademas de lenguaje natural, acepta secuencias de etiquetas y layouts en JSON para controlar la colocacion de texto y la disposicion de objetos.

Su relevancia actual esta en el control fino de la composicion y en la calidad de texto denso en imagenes, un punto debil historico de los modelos de difusion. El ejemplo oficial de la model card genera una nota manuscrita en chino sobre la puerta de una neverina, con varias lineas de texto legible, y compara el resultado con MOSS-Image-Base mostrando una agrupacion de texto mas clara y un layout de pizarra mas ordenado en la version SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; la model card describe un transformer de difusion con scheduler flow-matching Euler, un text encoder y un VAE (decodificador small de FLUX.2) |
| Parametros totales | 5.082.308.624 (pesos safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de contexto de texto; el ejemplo oficial usa resolucion 1024x1024) |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; la model card indica bfloat16 para transformer y text encoder, y float32 para VAE y ruido inicial |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |
| Pipeline | text-to-image |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (relacion: finetune) |
| Tamano del repositorio | 27,2 GB |
| Libreria | diffusers (>= 0.38) |
| Dependencias declaradas | transformers >= 5.3, accelerate >= 1.10, safetensors >= 0.6, Pillow >= 10, PyTorch >= 2.9, Python >= 3.10 |
| Ajuste de muestreo por defecto | Flow-matching Euler, 50 pasos, CFG 3, shift 5, negative prompt vacio, layer skipping en la rama negativa (indice 22, base cero) |

## Arquitectura y entrenamiento

La informacion disponible no entra en detalle sobre el numero de parametros por componente ni sobre la topologia interna del transformer. La model card si concreta que el pipeline emplea un transformer y un text encoder en bfloat16, y un VAE en float32 junto con el ruido inicial, y que el VAE incluido usa el decodificador small de FLUX.2. El scheduler por defecto es flow-matching Euler con 50 pasos, guidance scale 3,0 y shift 5. La guia por defecto realiza dos pasadas del transformer por paso (rama condicionada y rama negativa), con la posibilidad de desactivar el salto de capas de la rama negativa mediante uncond_skip_layers=[].

MOSS-Image-SFT es un ajuste supervisado sobre MOSS-Image-Base. No se especifica en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla el procedimiento de SFT mas alla de su nombre. La innovacion que la propia model card destaca es el control de la composicion: acepta lenguaje natural, secuencias de etiquetas y layouts en JSON para dirigir la colocacion del texto y la disposicion de los objetos, lo que resulta coherente con la mejora observada en agrupacion de texto y organizacion del layout respecto al modelo base.

## Capacidades

- Generacion de imagenes a partir de prompts en lenguaje natural, en ingles y chino.
- Renderizado de texto dentro de la imagen, incluido texto manuscrito y multilinea en chino, con agrupacion y organizacion mejoradas frente a MOSS-Image-Base.
- Control de layout mediante layouts en JSON, lo que permite fijar posiciones de texto y de objetos en la composicion.
- Control mediante secuencias de etiquetas (tag sequences), alternativa al prompt en lenguaje natural.
- Resolucion de trabajo de 1024x1024 en el ejemplo oficial, con parametros de altura y anchura configurables en el pipeline.
- Integracion en diffusers mediante pipeline personalizado (MOSSImagePipeline) y en ComfyUI mediante plugin nativo distribuido a traves de ComfyUI Manager.
- Soporte de negative prompt y de ajuste fino del muestreo (pasos, CFG, shift, layer skipping).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision de entrada, audio ni modo de razonamiento explicito; el modelo es exclusivamente text-to-image.

## Casos de uso

- Generacion de carteles y material promocional con texto rotulado: el modelo esta ajustado especificamente para colocar texto legible dentro de la imagen, de modo que un cartel, una pancarta o un vinilo pueden generarse en una sola pasada sin retoque posterior del texto.
- Maquetas de interfaz y mockups con etiquetas: gracias al control por layout JSON, se pueden fijar posiciones de elementos y rotulos, util para prototipos de pantallas, wireframes ilustrados o infografias donde cada bloque debe ocupar una zona concreta.
- Ilustracion educativa y pizarras explicativas: el ejemplo oficial muestra una pizarra organizada; el modelo sirve para generar diagramas con titulos y anotaciones, utiles en material didactico o documentacion interna.
- Creatividades para e-commerce: imagenes de producto con etiquetas de precio, ingredientes o instrucciones de uso integradas en la escena, en ingles o chino, sin necesidad de composicion externa.
- Storyboards y guiones visuales: generacion rapida de secuencias de escenas con notas de direccion o dialogos rotulados, aprovechando la coherencia de layout entre iteraciones con la misma semilla y prompt.
- Flujos de trabajo en ComfyUI: el plugin nativo permite insertar el modelo en grafos de generacion por lotes, encadenarlo con upscalers o con nodos de composicion, y automatizar la produccion de variaciones.
- Prototipado de packaging y etiquetado: simulacion de envases, frascos o cajas con texto frontal y laterales, util para validar jerarquias tipograficas antes de la produccion.
- Aumento de datos multimodales: generacion de imagenes con texto incrustado para entrenar o evaluar modelos de OCR y de comprension de documentos, controlando idioma y contenido del rotulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una comparacion cualitativa entre MOSS-Image-Base y MOSS-Image-SFT (mejor agrupacion de texto y layout mas ordenado en la version SFT), pero no cifras de metricas como FID, CLIP score, GenEval, DPG-Bench ni evaluaciones de precision de texto.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 10-12 GB solo para los pesos del modelo. Sumando text encoder, VAE en float32 y activaciones a 1024x1024, la estimacion practica se situa aproximadamente entre 16 y 24 GB. Estas cifras son estimaciones derivadas del recuento de parametros y del tamano del repositorio; no proceden de la model card.
- GPU recomendadas: tarjetas con 24 GB o mas de VRAM (RTX 4090, RTX A6000, L40S, A100, H100) para trabajar comodamente a 1024x1024 en bfloat16.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16. En tarjetas de 12-16 GB es previsible que sea necesario CPU offload o reducir la resolucion, ya que la model card menciona explicitamente la opcion de CPU offload en la guia del proyecto aunque no detalla requisitos minimos.
- Despliegue: biblioteca diffusers con el pipeline personalizado MOSSImagePipeline y trust_remote_code; plugin nativo de ComfyUI instalable desde ComfyUI Manager; demo publica en HuggingFace Spaces. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. La configuracion por defecto implica 50 pasos de muestreo con dos pasadas del transformer por paso (rama condicionada y rama negativa), lo que condiciona directamente el coste de inferencia.
- Notas de precision: transformer y text encoder en bfloat16; VAE y ruido inicial en float32. El repositorio ocupa 27,2 GB, un tamano superior al de los pesos en bfloat16, presumiblemente por incluir componentes adicionales o copias en otra precision.

## Comparativa con modelos similares

Los datos de la columna de MOSS-Image-SFT proceden de esta ficha; los de las alternativas se basan en la documentacion publica de cada proyecto y se indican como referencia. No se dispone de comparaciones de rendimiento entre ellos en la informacion proporcionada.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT | 5,08 mil millones | en, zh | Apache 2.0 | HuggingFace, ModelScope, ComfyUI | Enfoque en renderizado de texto y control de layout por JSON |
| FLUX.1 [dev] | 12 mil millones (referencia publica) | en principalmente | No comercial (FLUX.1 [dev] Non-Commercial License) | HuggingFace, ComfyUI | Referencia de calidad general; su VAE small decoder se reutiliza en el pipeline de MOSS-Image |
| Qwen-Image | 20 mil millones (referencia publica) | en, zh | Apache 2.0 | HuggingFace, ModelScope | Alternativa multilingue con soporte de texto en chino |
| Stable Diffusion 3.5 Large | 8 mil millones (referencia publica) | en principalmente | Stability Community License | HuggingFace, ComfyUI | Ecosistema maduro, licencia con restricciones de uso comercial segun facturacion |
| MOSS-Image-Base | No disponible en esta ficha | en, zh | Apache 2.0 | HuggingFace, ModelScope | Modelo base del que deriva esta version SFT; misma arquitectura y pipeline |

## Limitaciones y advertencias

- La ficha corresponde al repositorio suryatmodulus/MOSS-Image-SFT, con 0 descargas y 0 me gusta en el momento de la consulta. Para uso en produccion conviene verificar el repositorio oficial OpenMOSS-Team/MOSS-Image-SFT y confirmar que los pesos son identicos.
- El pipeline requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado descargado del repositorio. Es un riesgo de seguridad a evaluar antes de desplegar en entornos gestionados.
- Riesgo de alucinacion visual y de texto: como todo modelo de difusion, puede generar rotulos con caracteres incorrectos, deformados o inexistentes, especialmente en cadenas largas, tipografias poco frecuentes o idiomas distintos del ingles y el chino.
- Cobertura idiomatica limitada a ingles y chino segun los metadatos. No hay evidencia en la informacion disponible de un rendimiento fiable en castellano u otros idiomas, ni en el prompt ni en el texto renderizado.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o de representacion. La ausencia de esta informacion es en si misma una limitacion para usos sensibles.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. Al ser una obra derivada de MOSS-Image-Base, tambien bajo Apache 2.0, no se anaden restricciones conocidas por ese lado.
- Requisitos de version estrictos: diffusers >= 0.38, transformers >= 5.3, PyTorch >= 2.9 y Python >= 3.10. Entornos con versiones anteriores del stack pueden fallar al cargar el pipeline personalizado.
- El repositorio ocupa 27,2 GB, lo que encarece el almacenamiento y la transferencia en comparacion con los pesos en una sola precision.
- No hay datos publicos de benchmarks en la informacion disponible, por lo que cualquier afirmacion de superioridad frente a otros modelos carece de respaldo cuantitativo.
- La model card se encuentra truncada en la seccion de ajustes de muestreo, de modo que la descripcion completa de parametros como el negative prompt no esta disponible.

## Enlaces

- Repositorio analizado: https://huggingface.co/suryatmodulus/MOSS-Image-SFT
- Repositorio oficial SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio oficial Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Codigo en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Guia de usuario (EN): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario (ZH): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integracion ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Workflow de ejemplo ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- ModelScope Base: https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope SFT: https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Cuenta de X del proyecto: https://x.com/Open_MOSS
- Comunidad QQ: https://qm.qq.com/q/hphM7VhaDu
- Comunidad Feishu: https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=7a3m2007-815f-409b-9c3d-a4129f5c058e
