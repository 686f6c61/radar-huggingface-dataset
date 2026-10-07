# suryatmodulus/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una coleccion de adaptadores LoRA para intercambio de cara, cabeza y cuerpo sobre modelos de difusion de imagen y video. Lo publica el usuario suryatmodulus en HuggingFace y no es un modelo unico, sino un repositorio de pesos LoRA distribuidos por familias, cada uno ligado a un modelo base concreto. La libreria declarada es diffusers y la tarea es image-to-image.

El problema que resuelve es el de disponer de adaptadores especializados de face swap, head swap y body swap reutilizables sobre modelos de generacion y edicion de imagen de ultima generacion, evitando entrenar un modelo completo desde cero. Los adaptadores cubren varias familias base: Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2-klein (4B y 9B), Krea 2 y unos pesos experimentales para LTX-2.

Es relevante porque agrupa en un unico repositorio un conjunto amplio de variantes ya entrenadas, con workflows de ComfyUI incluidos, y porque las familias base a las que da soporte (Qwen Image 2.1, FLUX.2-klein y Krea 2) son modelos muy recientes. El repositorio ocupa 13,0 GB y se publica bajo licencia MIT, aunque la licencia de cada modelo base es independiente y debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (Low-Rank Adaptation) sobre modelos de difusion; no es un transformer completo |
| Parametros totales | No disponible (depende del rango y del adaptador; se citan variantes de rango 16, 32, 64 y 128) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base y de la resolucion de imagen) |
| Tipos de cuantizacion | No disponible para los LoRA; los modelos base incluyen variantes fp8 (FLUX.2-klein-9b-fp8 y 4b-fp8) y los LoRA incluyen versiones fusionadas en fp16 y fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | mit |
| Formato de pesos | safetensors (adaptadores LoRA y versiones fusionadas); workflows en JSON de ComfyUI |

## Arquitectura y entrenamiento

BFS no define una arquitectura de red propia: son pesos LoRA que se cargan sobre un modelo base de difusion. Cada release tiene su propio modelo base, su contrato de orden de entradas, su prompt y su workflow. Las familias cubiertas son Qwen Image 2.1 (modelo base Qwen/Qwen-Image-2.1), Qwen Image Edit 2509/2511, FLUX.2-klein en 4B y 9B (incluyendo variantes base y fp8), Krea 2 Raw y un conjunto experimental de pesos LTX-2 (ic-lora, presumiblemente para video). La model card detalla que algunos releases de head swap usan intencionadamente el cuerpo primero y la cara de referencia en segundo lugar, por lo que el orden de entradas es parte del contrato de cada version.

En cuanto al entrenamiento, la informacion disponible no documenta el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Si se pueden inferir algunos detalles de los nombres de los ficheros: existen checkpoints intermedios (por ejemplo, flux-klein 9b en los pasos 3500 y 3750, y LoRA LTX-2 en los pasos 5000, 6000 y 12000), lo que indica entrenamientos por pasos con distintos puntos de guardado. Tambien se ofrecen versiones fusionadas ("merged") en rango 16 fp16 y rango 32 fp32 para Qwen Image Edit 2511, y variantes alternativas de los LoRA de cabeza para Qwen Image 2.1.

## Capacidades

- Intercambio de cara (face swap) entre una imagen de referencia y una imagen destino.
- Intercambio de cabeza (head swap), con contratos de orden de entradas distintos segun la version.
- Intercambio de cuerpo (body swap) sobre Qwen Image 2.1 y Krea 2.
- Edicion de imagen guiada (image-to-image / image editing) sobre los modelos base soportados.
- Integracion con ComfyUI mediante workflows en JSON incluidos en el repositorio.
- Soporte de varias familias de modelo base: Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2-klein 4B/9B, Krea 2 y LTX-2 experimental.
- Ajuste de la fuerza del LoRA (se recomienda partir de 1.0 y ajustar segun modelo base, resolucion e imagen de referencia).
- Pesos experimentales LTX-2 con nomenclatura ic-lora, orientados a flujos de edicion in-context.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso: son adaptadores de difusion, no modelos de lenguaje.

## Casos de uso

- Postproduccion fotografica: sustitucion de la cabeza o la cara de un sujeto en una fotografia manteniendo la iluminacion y el encuadre del modelo base, usando el LoRA de Qwen Image 2.1 con su workflow de ComfyUI.
- Pruebas de vestuario y maquillaje: aplicar el body swap de Qwen Image 2.1 o Krea 2 para probar combinaciones de cuerpo y ropa sobre una misma cara de referencia sin repetir sesiones de fotos.
- Creacion de personajes consistentes: usar los LoRA de head swap para trasladar una cara de referencia a distintas escenas generadas con FLUX.2-klein, manteniendo la identidad a lo largo de una serie de imagenes.
- Prototipado en estudios de VFX: emplear los LoRA como paso rapido de previsualizacion antes de invertir tiempo en un pipeline de composicion digital completo.
- Aplicaciones de edicion para usuario final: integrar los adaptadores en una herramienta tipo ComfyUI que permita al usuario subir una cara de referencia y una foto destino y obtener una edicion local.
- Investigacion en edicion de imagen: comparar el comportamiento de un mismo objetivo (head swap) sobre familias base distintas (Qwen, FLUX, Krea) para estudiar como cambia la fidelidad de identidad segun el modelo base.
- Contenido artistico y editorial: generar retratos o ilustraciones con identidades combinadas bajo consentimiento de los sujetos implicados.
- Flujos experimentales de video: probar los pesos LTX-2 (ic-lora) para tareas de intercambio de cabeza en secuencias, con la advertencia de que son pesos experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio no especifica requisitos de VRAM. Los adaptadores LoRA son ligeros, pero el consumo real lo determina el modelo base que se cargue.
- El repositorio ocupa 13,0 GB en total, suma de todos los adaptadores, workflows e imagenes de ejemplo; cada LoRA individual ocupa una fraccion de esa cifra.
- Modelos base implicados y su orden de magnitud: FLUX.2-klein en 4B y 9B (con variantes fp8 que reducen el requisito de memoria), Qwen Image 2.1 y Qwen Image Edit 2511 (familias de mayor tamano), Krea 2 Raw y LTX-2 (video).
- GPU recomendadas: no disponible en la informacion proporcionada; dependera del modelo base y de la resolucion de salida.
- Compatibilidad con GPU de consumo: no disponible. Las variantes fp8 de FLUX.2-klein (4b-fp8 y 9b-fp8) apuntan a reducir el consumo de memoria, pero no hay cifras publicadas en este repositorio.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (se incluyen workflows en JSON). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos comparables dentro de la informacion proporcionada. A modo de comparativa interna entre las familias base soportadas por el propio repositorio:

| Familia base | Tipo de adaptador disponible | Pesos incluidos | Workflow propio |
|---|---|---|---|
| Qwen Image 2.1 | Head swap (v1, v1.1, v1.1 alternativa) y body swap v1.0 | 4 ficheros | Si |
| Qwen Image Edit 2509 | Face v1 y head v1 a v4 | 5 ficheros | Guia compartida con 2511 |
| Qwen Image Edit 2511 | Head v5 (original y fusionadas rango 16 fp16 y rango 32 fp32) | 3 ficheros | Guia compartida con 2509 |
| FLUX.2-klein | Head v1 en 4B y 9B, y v1.1 opcional en 4B | 4 ficheros | Si |
| Krea 2 | Head swap v1.1 y body swap v1 | 2 ficheros | Si |
| LTX-2 (experimental) | Head swap ic-lora (pasos 5000, 6000, 12000) | 3 ficheros | Si |

## Limitaciones y advertencias

- Uso etico y legal: la propia model card indica que no se deben usar ni compartir resultados con figuras publicas ni con personas que no hayan dado su consentimiento. El face swap plantea riesgos claros de suplantacion, desinformacion y contenido no consentido.
- Riesgo de resultados no deterministas: la model card advierte que los ejemplos y workflows son demostraciones y no garantizan resultados identicos en cada imagen.
- Dependencia estricta del modelo base: hay que emparejar cada LoRA con su modelo base y su version correcta. Mezclar texto codificador, VAE, workflow y LoRA de familias distintas provoca fallos.
- Orden de entradas: varios releases de head swap usan el cuerpo primero y la cara de referencia despues; invertir el orden degrada el resultado.
- Ajuste de fuerza: se recomienda empezar en 1.0 y ajustar segun modelo base, resolucion e imagen de referencia, lo que implica trabajo de calibrado por caso.
- Idiomas: el repositorio declara unicamente ingles (en), por lo que los prompts de edicion deben formularse en ese idioma.
- Licencia: los LoRA se publican bajo MIT, pero cada modelo base (Qwen, FLUX.2-klein de Black Forest Labs, Krea 2, LTX-2) tiene su propia licencia, que puede restringir el uso comercial. Es imprescindible revisar la licencia de cada base por separado antes de un despliegue en produccion.
- Pesos experimentales: los adaptadores LTX-2 se etiquetan explicitamente como experimentales y pueden no ser estables.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los resultados.
- Fechas de creacion y actualizacion identicas (2026-10-06), sin historial de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suryatmodulus/BFS-Best-Face-Swap
- Guia BFS Head V1 / V1.1 para Qwen Image 2.1: docs/qwen-image-2.1.md
- Guia BFS Body Swap V1.0 para Qwen Image 2.1: docs/qwen-image-2.1-body.md
- Guia Qwen Image Edit 2509/2511: docs/qwen-image-edit.md
- Guia Flux 2 Klein: docs/flux-2-klein.md
- Guia Krea 2: docs/krea-2.md
- Guia de pesos experimentales LTX-2: docs/ltx-2.md
- Workflow ComfyUI de head swap Qwen 2.1: workflows/Head Swap V1 Qwen 2.1 Workflow.json
- Modelos base referenciados: Qwen/Qwen-Image-2.1, Qwen/Qwen-Image-Edit-2511, black-forest-labs/FLUX.2-klein-9B, black-forest-labs/FLUX.2-klein-4B, black-forest-labs/FLUX.2-klein-base-4B, black-forest-labs/FLUX.2-klein-base-9B, black-forest-labs/FLUX.2-klein-9b-fp8, black-forest-labs/FLUX.2-klein-4b-fp8, krea/Krea-2-Raw
