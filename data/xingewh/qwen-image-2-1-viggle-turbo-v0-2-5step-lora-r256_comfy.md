# xingewh/Qwen-Image-2.1-viggle-turbo-v0.2-5step-lora-r256_comfy

## Resumen

Este repositorio no contiene un modelo de lenguaje ni un modelo de difusion completo, sino un adaptador LoRA de tipo text-to-image para el modelo base Qwen/Qwen-Image-2.1. Lo publica el usuario xingewh y su unico proposito es la conversion de formato del LoRA original de Viggle (Viggle/Qwen-Image-2.1-viggle-turbo) para que sea cargable directamente en ComfyUI. El LoRA original se entreno bajo el framework Diffusers/PEFT con claves de peso prefijadas como transformer.; el cargador estandar de LoRA de ComfyUI espera el prefijo diffusion_model.transformer., de modo que el archivo original se carga sin error pero no tiene ningun efecto (fallo silencioso).

La relevancia de esta ficha es practica: es un adaptador de aceleracion de 5 pasos con rango 256 (r256) que permite reducir el numero de pasos de muestreo a 5-10, con CFG 1.0 y sampler euler/simple, manteniendo el efecto identico al del LoRA original porque no se ha modificado ningun valor de peso, solo el prefijo de las 454 claves incluidas. El repositorio incluye el script de conversion (convert_lora.py) y un paquete lora convert.zip con la herramienta, y su licencia declarada es MIT, aunque la titularidad del modelo original corresponde a Viggle.

No se dispone de informacion sobre el tamano del archivo, el numero de parametros del adaptador ni las especificaciones del modelo base dentro de la informacion proporcionada; los resultados de la busqueda web asociada no contienen ningun enlace relevante (son foros de alarmas Somfy y un diccionario aleman-frances).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) de rango 256 sobre el transformer del modelo de difusion Qwen/Qwen-Image-2.1; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el adaptador contiene 454 tensores de pesos; no se especifica el numero de parametros ni el tamano del archivo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; el repositorio no indica longitud maxima de prompt) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar; no se documentan variantes fp8, GGUF ni similares para este adaptador) |
| Idiomas soportados | en, zh (segun los metadatos de idioma de la model card) |
| Licencia | MIT (repositorio de conversion); el modelo original pertenece a Viggle y se rige por la licencia de su repositorio |
| Formato de pesos | safetensors (claves con prefijo diffusion_model.transformer., formato esperado por ComfyUI) |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tarea | text-to-image (pipeline diffusers) |
| Rango del LoRA | 256 (r256) |
| Pasos recomendados | 5-10 |
| CFG recomendado | 1.0 |
| Peso del LoRA recomendado | 0.8-1.0 |
| Sampler recomendado | euler / simple |
| Trigger word | ninguna (instance_prompt: null en los metadatos) |
| Fecha de publicacion | 24 de septiembre de 2026, segun los metadatos del repositorio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (r=256) pensado para inyectarse en las capas de atencion del transformer del modelo de difusion Qwen-Image-2.1. Su funcion declarada es la aceleracion del muestreo: el LoRA permite obtener resultados utilizables con 5 pasos de inferencia, ampliables hasta 10 si se prioriza calidad sobre velocidad, con CFG 1.0 y el par de sampler/scheduler euler/simple. No hay ningun dato en la informacion disponible sobre el dataset de entrenamiento del LoRA original, el numero de imagenes utilizadas, la composicion de los datos ni sobre si se emplearon tecnicas de destilacion de pasos, RLHF o DPO; dado que se trata de un adaptador de difusion, el termino mas plausible seria destilacion de trayectoria de muestreo, pero no esta confirmado en la documentacion.

La innovacion tecnica de este repositorio concreto no esta en el entrenamiento sino en la conversion de formato. Se ha reescrito unicamente el prefijo de las 454 claves de peso, pasando de transformer. a diffusion_model.transformer., sin alterar ningun valor numerico, de forma que el efecto del LoRA es identico al del original. El script empleado (convert_lora.py) se escribio con ayuda de DeepSeek, segun declara el propio autor. El resultado es un unico archivo safetensors compatible con el nodo Load LoRA de ComfyUI.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) sobre el modelo base Qwen-Image-2.1, sin trigger word adicional.
- Aceleracion del muestreo a 5-10 pasos, con peso de LoRA ajustable entre 0.8 y 1.0.
- Compatibilidad directa con ComfyUI mediante el nodo Load LoRA, conectado al modelo principal Qwen-Image-2.1.
- Conservacion exacta del comportamiento del LoRA original de Viggle, al no modificarse los valores de peso.
- Uso con prompts en ingles y chino, segun los metadatos de idioma declarados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de difusion, no un modelo de lenguaje.
- No se documentan capacidades de vision de entrada, audio, thinking mode ni control estructural (ControlNet, IP-Adapter) en la informacion disponible.

## Casos de uso

- Aceleracion de flujos de trabajo en ComfyUI: sustituir el LoRA original por este archivo para que el nodo Load LoRA aplique el efecto de verdad y no falle de forma silenciosa, reduciendo el muestreo a 5-10 pasos.
- Reduccion de coste de inferencia en produccion: al pasar de un muestreo largo a 5-10 pasos, el tiempo de GPU por imagen cae de forma proporcional, lo que abarata la generacion por lotes en servicios con volumen alto.
- Generacion por lotes para marketing y contenidos: pipelines que producen cientos de imagenes de campana por dia se benefician de forma directa del menor coste por imagen, asumiendo CFG 1.0 y sampler euler/simple.
- Prototipado rapido de conceptos visuales: equipos de diseno pueden iterar bocetos con 5 pasos para explorar variaciones de estilo antes de lanzar una generacion final a mas pasos y mayor calidad.
- Ajuste fino del equilibrio calidad/velocidad: con pasos entre 5 y 10 y pesos de LoRA entre 0.8 y 1.0, se puede calibrar cada caso de uso sin reentrenar nada.
- Generacion bilingue de assets para publico hispanohablante y sinohablante: al declarar soporte de en y zh, encaja en equipos que redactan prompts en ambos idiomas.
- Integracion en despliegues locales o self-hosted: al ser un adaptador pequeno sobre safetensors, se puede distribuir y versionar junto al modelo base en entornos ComfyUI sin infraestructura adicional especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FID, CLIP score, SSIM ni comparativas de calidad frente al LoRA original), y los resultados de la busqueda web proporcionada no contienen ningun dato tecnico utilizable sobre este modelo.

## Requisitos de hardware

- VRAM para el adaptador: no disponible. Un LoRA de rango 256 supone una fraccion minima del peso total frente al modelo base, pero el repositorio no publica el tamano del archivo ni el numero de parametros.
- VRAM para la inferencia: la determinan integramente el modelo base Qwen-Image-2.1 y su precision de carga, no este adaptador. La informacion disponible no incluye cifras de VRAM del modelo base.
- GPU recomendadas: no disponible en la documentacion. La eleccion depende de los requisitos del modelo base y no puede deducirse del LoRA.
- Compatibilidad con GPU de consumo: no disponible. No hay datos publicados sobre si el conjunto base mas LoRA cabe en una GPU de gama de consumo.
- Opciones de despliegue: ComfyUI mediante el nodo Load LoRA (escenario soportado explicitamente). El archivo esta convertido para ComfyUI, por lo que usarlo con Diffusers/PEFT requeriria revertir el prefijo de las claves a transformer.
- Latencia y throughput: no disponible. La ventaja declarada es la reduccion a 5-10 pasos frente a muestreos mas largos, pero no se publican tiempos medidos ni imagenes por segundo.

## Comparativa con modelos similares

| Version | Formato de claves | Compatible con ComfyUI | Compatible con Diffusers/PEFT | Efecto | Licencia |
|---|---|---|---|---|---|
| LoRA original (Viggle/Qwen-Image-2.1-viggle-turbo) | transformer.* | No aplica directamente (fallo silencioso) | Si | Aceleracion a 5 pasos | La del repositorio original de Viggle |
| Esta version convertida (xingewh) | diffusion_model.transformer.* | Si | No directa (requiere renombrar claves) | Identico al original (pesos sin modificar) | MIT |
| Modelo base sin LoRA (Qwen/Qwen-Image-2.1) | no aplica | Si, como modelo principal | Si | Sin aceleracion por LoRA | La de Qwen/Qwen-Image-2.1 |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa con otros adaptadores de aceleracion de la misma categoria.

## Limitaciones y advertencias

- No modifica los pesos: si el LoRA original produce resultados deficientes, esta conversion reproducira exactamente los mismos defectos.
- El prefijo de claves es especifico de ComfyUI; cargarlo en Diffusers/PEFT sin revertir el prefijo provocara un fallo silencioso equivalente al que sufre el original en ComfyUI.
- No hay trigger word definida (instance_prompt es null), por lo que el efecto depende por completo del peso del LoRA y de la configuracion de muestreo.
- Requiere respetar el rango de parametros recomendado: pasos 5-10, CFG 1.0 y peso de LoRA 0.8-1.0. Salirse de ese rango puede degradar la calidad de forma apreciable.
- La licencia MIT se declara sobre el repositorio de conversion, pero la titularidad del modelo original es de Viggle y el propio autor remite a la licencia del repositorio original; conviene verificar esa licencia antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado en la misma fecha, por lo que no cuenta con validacion de la comunidad ni historial de versiones.
- La unica validacion de funcionamiento es la declaracion del autor; no hay pruebas automatizadas, benchmarks ni informes de terceros.
- Los propios resultados de la busqueda web asociada no son relevantes para el modelo, lo que limita la verificacion externa.
- No hay informacion sobre sesgos, comportamiento multilingue real ni tasas de alucinacion visual (prompt following) en la documentacion disponible.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/xingewh/Qwen-Image-2.1-viggle-turbo-v0.2-5step-lora-r256_comfy
- LoRA original: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- DeepSeek (asistencia en la escritura del script de conversion): https://www.deepseek.com
- Descarga de archivos del repositorio: https://huggingface.co/xingewh/Qwen-Image-2.1-viggle-turbo-v0.2-5step-lora-r256_comfy/tree/main
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a un foro de alarmas Somfy y a un diccionario aleman-frances.
