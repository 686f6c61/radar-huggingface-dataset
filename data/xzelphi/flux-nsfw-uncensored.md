# xzelphi/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un ajuste fino publicado en HuggingFace por el usuario xzelphi sobre black-forest-labs/FLUX.1-dev, un modelo de difusion texto-a-imagen de 12.000 millones de parametros desarrollado por Black Forest Labs. El repositorio ocupa 0,7 GB y el codigo de ejemplo de la model card lo carga mediante `load_lora_weights`, por lo que se trata de un adaptador LoRA (o un conjunto de pesos compatible con ese flujo) y no de un modelo completo. Su proposito declarado es reducir las restricciones de censura del modelo base para explorar los limites tecnicos de la generacion de imagenes con IA.

La relevancia de esta ficha es fundamentalmente tecnica y de evaluacion: permite estudiar como un adaptador de bajo rango modifica el comportamiento de seguridad de un modelo de difusion de gran tamano, y sirve como caso de prueba para sistemas de moderacion de contenido. El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, no incluye resultados de benchmarks y su model card no documenta ni el dataset de entrenamiento, ni el rango del LoRA, ni el numero de pasos de ajuste.

El modelo esta etiquetado como `not-for-all-audiences`, declarado unicamente para ingles y distribuido bajo licencia CreativeML OpenRAIL-M, que permite uso comercial pero impone restricciones de uso sobre determinadas categorias de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango (LoRA) sobre FLUX.1-dev, un transformer de flujo rectificado (rectified flow) para difusion texto-a-imagen |
| Parametros totales | No disponible para el adaptador; el modelo base FLUX.1-dev tiene 12.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; el modelo base emplea T5-XXL (hasta ~512 tokens) y CLIP-L (77 tokens) como codificadores de texto |
| Tipos de cuantizacion | No especificados por el autor; el modelo base admite fp16, bf16, fp8 y variantes GGUF (Q2 a Q8) en el ecosistema de difusion |
| Idiomas soportados | Ingles (en) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | `lora.safetensors` segun el codigo de ejemplo; repositorio de 0,7 GB |
| Pipeline | text-to-image |
| Modelo base | black-forest-labs/FLUX.1-dev |

## Arquitectura y entrenamiento

El adaptador se aplica sobre FLUX.1-dev, un transformer de difusion con formulacion de flujo rectificado que sustituye la prediccion de ruido clasica por un campo de velocidad, lo que permite muestreo con pocos pasos. FLUX.1-dev integra dos codificadores de texto (T5-XXL y CLIP-L) y un autoencoder latente, con un total de 12.000 millones de parametros. El repositorio aqui descrito no modifica esa arquitectura: anade pesos de bajo rango que ajustan el comportamiento del modelo base hacia contenido sin censura.

La model card no documenta el proceso de entrenamiento: no indica el numero de imagenes, la composicion del dataset, el rango o el alpha del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplico algun tipo de ajuste por preferencias. El unico material tecnico aportado es un fragmento de codigo en Python con comentarios en coreano que carga el adaptador con `peft` y `diffusers`, usa `torch.float16`, `guidance_scale=7.0`, 28 pasos de inferencia y resolucion de 1024x1024. Conviene senalar una discrepancia: el identificador del repositorio es `xzelphi/Flux-NSFW-uncensored`, pero el ejemplo llama a `Heartsync/Flux-NSFW-uncensored`, lo que sugiere una copia, un cambio de nombre o un error de la model card.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles, con resolucion de 1024x1024 segun el ejemplo proporcionado.
- Soporte de prompts negativos (`negative_prompt`), util para excluir marcas de agua, texto, estilos caricaturescos o artefactos de baja calidad.
- Control de reproducibilidad mediante semilla (`torch.Generator.manual_seed`).
- Ajuste de la adherencia al prompt mediante `guidance_scale` y del coste de computo mediante `num_inference_steps`.
- Generacion de contenido explicito o sexual, que es precisamente el comportamiento que el autor declara haber desbloqueado respecto del modelo base.
- Integracion con la libreria `diffusers` y con `peft` para carga del adaptador, lo que permite combinarlo con otros LoRA si el pipeline lo soporta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo: es un modelo exclusivamente de imagen.
- No se declaran capacidades de vision, audio, video ni edicion de imagen.

## Casos de uso

- Red-teaming de filtros de seguridad: el adaptador permite comprobar si un clasificador NSFW o un sistema de moderacion detecta correctamente las imagenes generadas por una variante sin censura del mismo modelo base, midiendo tasas de falsos negativos.
- Generacion de datasets sinteticos para entrenar clasificadores de contenido: al poder producir muestras etiquetadas de forma controlada, se pueden crear conjuntos balanceados para entrenar o ajustar detectores de contenido explicito.
- Auditoria de alineacion en modelos generativos: investigadores interesados en como el ajuste fino de bajo rango revierte comportamientos de seguridad pueden reproducir el procedimiento con LoRA de distinto rango y medir el efecto.
- Fotografia artistica y estudio del desnudo (figura humana): el modelo es capaz de producir composiciones con iluminacion y equipo fotografico especificados en el prompt, aunque el uso comercial del resultado depende de la legislacion aplicable y de la politica de la plataforma de destino.
- Produccion de contenido para plataformas de adultos con verificacion de edad: integrado en un pipeline interno con control de acceso, registro de auditoria y cumplimiento normativo del territorio de operacion.
- Evaluacion comparativa de LoRA de "uncensoring": permite medir diferencias de calidad, adherencia al prompt y estabilidad entre distintos adaptadores sobre el mismo modelo base, usando prompts y semillas fijos.
- Pruebas locales con privacidad: al ejecutarse en hardware propio mediante ComfyUI, Forge o `diffusers`, evita el envio de prompts a servicios en la nube, lo que resulta relevante para materiales sensibles.
- Analisis de cumplimiento normativo: servir de muestra de prueba para verificar que un sistema de moderacion propio bloquea las salidas no permitidas antes de que lleguen al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIPScore, evaluaciones de adherencia al prompt ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del modelo base FLUX.1-dev, ya que el autor del adaptador no publica requisitos. El LoRA en si anade una sobrecarga despreciable (0,7 GB en disco).

- VRAM estimada para inferencia: aproximadamente 24 GB en fp16/bf16 sin offloading; en torno a 12-16 GB con cuantizacion fp8; alrededor de 8-10 GB con GGUF Q4 y descarga parcial a CPU.
- GPU recomendadas: A100 40/80 GB o H100 para lotes y maxima velocidad; RTX 4090 o RTX 3090 (24 GB) para fp8 y GGUF con buen rendimiento; RTX 4080 o 4070 Ti Super (16 GB) con GGUF Q4; RTX 3060 12 GB solo con cuantizaciones agresivas y tiempos por imagen altos.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080, 4070 Ti Super y, con limitaciones, en RTX 3060 12 GB.
- Opciones de despliegue: ComfyUI, Stable Diffusion WebUI Forge, `diffusers` junto con `peft` (tal como muestra la model card), InvokeAI y servidores de inferencia que acepten adaptadores LoRA sobre FLUX.1-dev.
- Latencia y throughput estimados: no hay valores publicados por el autor. A modo orientativo, con 28 pasos a 1024x1024 sobre una RTX 4090 en fp8 el orden de magnitud es de decenas de segundos por imagen; en A100/H100 el tiempo baja de forma notable, pero no se dispone de mediciones verificadas para este adaptador concreto.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentacion publica de esos modelos, no de la model card del adaptador analizado.

| Modelo | Parametros | Codificadores de texto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xzelphi/Flux-NSFW-uncensored | Adaptador sobre FLUX.1-dev (12.000 M) | T5-XXL + CLIP-L (heredados del base) | CreativeML OpenRAIL-M | HuggingFace, 0 descargas | Sin benchmarks ni documentacion de entrenamiento; orientado a contenido sin censura |
| black-forest-labs/FLUX.1-dev | 12.000 M | T5-XXL + CLIP-L | FLUX.1-dev Non-Commercial License | HuggingFace | Modelo base; uso comercial restringido por licencia |
| black-forest-labs/FLUX.1-schnell | 12.000 M | T5-XXL + CLIP-L | Apache 2.0 | HuggingFace | Variante destilada para pocos pasos de inferencia |
| stabilityai/stable-diffusion-xl-base-1.0 | ~2.600 M (UNet) / ~3.500 M totales | CLIP ViT-L + OpenCLIP bigG | CreativeML OpenRAIL++-M | HuggingFace | Alternativa de menor tamano, mas rapida y con menor requisito de VRAM |
| Otros LoRA de "uncensoring" sobre FLUX.1 | No disponible | No disponible | No disponible | No disponible | No se han verificado datos concretos en la informacion disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador hereda los sesgos de representacion del modelo base y los del dataset de ajuste, que no esta documentado. No hay evaluacion de sesgos por genero, etnia o edad.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta (manos, extremidades), texto ilegible, incoherencias fisicas e inconsistencias entre prompt y resultado. El ajuste de bajo rango puede agravar estos artefactos si el entrenamiento fue reducido.
- Contenido para adultos: el repositorio esta marcado como `not-for-all-audiences` y su objetivo declarado es reducir la censura. Su uso puede infringir la legislacion de distintos territorios, las condiciones de servicio de plataformas de alojamiento y las politicas de proveedores cloud.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial, pero incluye clausulas de uso que prohiben generar contenido ilegal, difamatorio, de acoso, de explotacion de menores, de desinformacion medica o de dano a personas. El incumplimiento puede conllevar la perdida de la licencia.
- Ausencia de validacion: 0 descargas y 0 me gusta, sin benchmarks, sin discusiones y sin historial de versiones. No hay evidencia externa de calidad ni de reproducibilidad.
- Discrepancia de identificadores: el codigo de ejemplo carga `Heartsync/Flux-NSFW-uncensored` mientras el repositorio es `xzelphi/Flux-NSFW-uncensored`. Hay que verificar la procedencia de los pesos antes de usarlos en cualquier entorno, por riesgo de suplantacion o de contenido manipulado.
- Idiomas: declarado solo para ingles. Los prompts en castellano pueden degradar la adherencia, ya que el modelo base esta optimizado para ingles.
- Contexto limitado del prompt: el modelo base usa T5-XXL con un limite de en torno a 512 tokens y CLIP-L con 77, por lo que descripciones muy largas se truncan.
- Requisitos de computo: inferencia en fp16 sin cuantizar exige alrededor de 24 GB de VRAM, lo que descarta la mayoria de GPU de consumo sin tecnicas de cuantizacion u offloading.
- Advertencia de produccion: si se integra en un servicio, es imprescindible anadir moderacion de salida, control de edad, registro de auditoria y una politica clara de uso aceptable, ademas de revisar el cumplimiento de la normativa aplicable antes de exponerlo a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xzelphi/Flux-NSFW-uncensored
- Discusiones del repositorio: https://huggingface.co/xzelphi/Flux-NSFW-uncensored/discussions
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Guia de ejecucion local de Flux sin censura (ComfyUI y Forge): https://offlinecreator.com/tool/flux/for/uncensored
- Guia de configuracion local de Flux sin censura: https://aipornguide.com/blog/flux-uncensored-local-guide/
- Analisis comparativo de Flux para contenido NSFW: https://ourdream.ai/comparison/flux-nsfw
- Paper y documentacion de referencia de FLUX.1: no disponible en la informacion proporcionada
