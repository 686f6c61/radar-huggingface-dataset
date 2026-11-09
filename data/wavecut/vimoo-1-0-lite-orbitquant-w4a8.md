# WaveCut/Vimoo-1.0-Lite-OrbitQuant-W4A8

## Resumen

Vimoo-1.0-Lite-OrbitQuant-W4A8 es una cuantizacion de pesos de 4 bits del modelo de generacion de video Vimoo-1.0-Lite, desarrollado por Vimoo-AI y cuantizado por WaveCut. El modelo base es un transformer de difusion de aproximadamente 9.500 millones de parametros capaz de generar video a 720p y 24 fps tanto a partir de texto (text-to-video) como a partir de un primer fotograma e instrucciones de texto (image-to-video). Esta version reduce el peso de la descarga de 36,8 GB del original a 11,0 GB, lo que permite ejecutar el modelo en una unica GPU de consumo de gama alta.

La cuantizacion emplea el esquema OrbitQuant W4A8: pesos en 4 bits con activaciones en 8 bits, aplicado tanto al transformer de difusion como al codificador de texto Qwen2.5-VL. Los codigos de 4 bits se seleccionaron mediante redondeo GPTQ sobre un conjunto de prompts de calibracion disjunto del conjunto de evaluacion. El resultado es un modelo que conserva la fidelidad visual del original con una huella de memoria notablemente menor.

La relevancia de esta publicacion radica en que el modelo original en BF16 no cabe en una RTX 5090 de 32 GB ni siquiera con offload, mientras que esta version genera un video de 5 segundos a 1280x720 en 4 minutos y 36 segundos con un pico de 20,5 GiB de VRAM. Se distribuye bajo licencia Apache 2.0 y esta pensada para el ecosistema Diffusers, con kernels fusionados propios y nodos para ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (pipeline modular Diffusers) con codificador de texto Qwen2.5-VL |
| Parametros totales | Aproximadamente 9.500 millones (modelo base Vimoo-1.0-Lite) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits) con redondeo GPTQ; atencion INT8 opcional |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo base Vimoo-1.0-Lite es un transformer de difusion para generacion de video que opera a 720p y 24 fps, con un total de aproximadamente 9.500 millones de parametros repartidos entre el transformer de difusion, un codificador de glifos (glyph encoder) y el codificador de texto Qwen2.5-VL-7B. Esta version cuantizada aplica OrbitQuant W4A8 sobre el transformer y sobre el codificador de texto, de modo que ambos ejecutan activaciones de 8 bits sobre pesos de 4 bits. Los codigos de cuantizacion se obtuvieron mediante redondeo GPTQ usando prompts de calibracion que no forman parte del conjunto de evaluacion, lo que permite medir la degradacion de forma honesta.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La innovacion tecnica destacable de esta release es el runtime: emplea el pipeline modular oficial del fork de Diffusers de Vimoo-AI con kernels OrbitQuant fusionados, mas los nodos de ComfyUI-OrbitQuant. Ademas, ofrece atencion INT8 opcional que reduce el tiempo de generacion de 4 min 36 s a 3 min 21 s en una RTX 5090.

## Capacidades

- Generacion de video a partir de texto (text-to-video) a 1280x720 y 24 fps, con duraciones como 2,5 s (61 fotogramas) o 5 s (121 fotogramas).
- Generacion de video a partir de un primer fotograma e instrucciones de texto (image-to-video), controlando el movimiento y la evolucion de la escena.
- Control de cinematografia mediante prompts: movimiento de camara (push-in, tracking, camara estatica), iluminacion (cinematografica dramatica, luz natural suave, sobremontada) y estilo (documental de naturaleza, profundidad de campo reducida).
- Generacion de movimiento fisico plausible: salpicaduras de olas, nieve cayendo, polvo lunar en baja gravedad, parpadeo y movimiento de bigotes en animales.
- Renderizado de texto legible en escena (por ejemplo, carteles con "FRESH COFFEE").
- Ejecucion en una unica GPU de consumo de gama alta gracias a la cuantizacion W4A8.
- Integracion con ComfyUI mediante los nodos ComfyUI-OrbitQuant.
- No se documentan capacidades de tool calling, agentes, audio ni razonamiento multi-paso; es un modelo generativo de video, no un LLM conversacional.

## Casos de uso

- Prototipado rapido de video publicitario: generar clips de 2,5 a 5 segundos a 720p a partir de un brief textual para validar conceptos creativos antes de producir con metodos tradicionales, gracias a los tiempos de generacion de 3 a 5 minutos por clip en una RTX 5090.
- Animacion de imagenes fijas para redes sociales: usar image-to-video con un primer fotograma (producto, retrato, paisaje) y un prompt de movimiento para producir videos cortos con camara estatica o tracking suave.
- Previsualizacion de storyboards cinematograficos: describir planos con indicaciones de camara e iluminacion (push-in, teleobjetivo, luz sobremontada) y obtener un animatic de baja duracion para comunicar la vision al equipo.
- Generacion de material B-roll para documentales: prompts de estilo documental de naturaleza (fauna en nieve, escenas de tormenta) para obtener recursos de relleno antes de rodar en localizacion.
- Creacion de contenido para demos tecnicas y presentaciones: clips cortos en 720p generados localmente en una estacion de trabajo con RTX 5090, sin depender de servicios en la nube.
- Iteracion en flujos de ComfyUI: integrar los nodos ComfyUI-OrbitQuant en grafos existentes para encadenar generacion de video con otros pasos de postprocesado dentro de la misma interfaz.
- Evaluacion e investigacion en cuantizacion de modelos de difusion: comparar la fidelidad del original BF16 frente a W4A8 con los mismos prompts, semillas y sampler, usando los ejemplos publicados como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como FVD, VBench o metricas de similitud) en la informacion disponible. Los unicos datos de rendimiento publicados son de latencia y memoria:

| Metrica | BF16 original | OrbitQuant W4A8 |
|---|---|---|
| Tamano de descarga | 36,8 GB | 11,0 GB |
| RTX 5090, video 5 s 1280x720 (121 fotogramas, 50 pasos) | No cabe en 32 GB, con o sin offload | 4 min 36 s (3 min 21 s con atencion INT8) |
| Pico de memoria en RTX 5090 | No disponible (no ejecutable) | 20,5 GiB |
| RTX PRO 6000, mismo video | 9 min 38 s | 3 min 20 s (2,9x mas rapido) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,5 GiB de pico en el caso de referencia (video de 5 s a 1280x720, 121 fotogramas, 50 pasos). La descarga ocupa 11,0 GB en disco.
- GPU recomendadas: RTX 5090 (32 GB, Blackwell) y RTX PRO 6000 (Blackwell) son las plataformas probadas. El modelo original BF16 no cabe en la RTX 5090.
- Cabe en GPU de consumo: si, en RTX 5090. No se documenta su funcionamiento en GPUs con menos de 32 GB de VRAM.
- Opciones de despliegue: pipeline modular del fork de Diffusers de Vimoo-AI con kernels OrbitQuant fusionados, y nodos ComfyUI-OrbitQuant. Requiere Linux, Python 3.12, Torch 2.12.1 con CUDA 13.0 y la libreria orbitquant 0.17.1.
- Latencia y throughput: 4 min 36 s por video de 5 s en RTX 5090 (3 min 21 s con atencion INT8); 3 min 20 s en RTX PRO 6000 frente a 9 min 38 s del original BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vimoo-1.0-Lite-OrbitQuant-W4A8 (esta ficha) | ~9,5B | videos de 2,5 a 5 s | 1280x720 a 24 fps | Apache 2.0 | Hugging Face, 11,0 GB |
| Vimoo-1.0-Lite (BF16 original) | ~9,5B | videos de 2,5 a 5 s | 1280x720 a 24 fps | Apache 2.0 | Hugging Face, 36,8 GB; no cabe en RTX 5090 |
| Otros modelos text-to-video de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar la calidad de generacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles como idioma; los prompts en otros idiomas no estan contemplados en la model card.
- La cuantizacion W4A8 introduce degradacion respecto al BF16 original; los ejemplos publicados permiten comparar lado a lado, pero no se cuantifica la perdida con metricas objetivas.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede producir movimiento fisicamente implausible, texto mal renderizado o incoherencias entre fotogramas, especialmente en escenas complejas.
- Duracion limitada: los ejemplos publicados cubren 2,5 y 5 segundos; no se documenta soporte para videos mas largos.
- Requiere hardware especifico: Linux, Python 3.12, Torch 2.12.1 con CUDA 13.0 y GPUs Blackwell; no se documenta compatibilidad con GPUs de generaciones anteriores ni con menos de 32 GB de VRAM.
- Depende de un fork no oficial de Diffusers (Vimoo-AI/diffusers) fijado a un commit concreto y de la libreria orbitquant 0.17.1, lo que puede complicar el mantenimiento a largo plazo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Vimoo-1.0-Lite y de las dependencias (Qwen2.5-VL) antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Vimoo-1.0-Lite-OrbitQuant-W4A8
- Modelo base: https://huggingface.co/Vimoo-AI/Vimoo-1.0-Lite
- Repositorio OrbitQuant: https://github.com/iamwavecut/OrbitQuant
- Fork de Diffusers de Vimoo-AI: https://github.com/Vimoo-AI/diffusers
- Nodos ComfyUI-OrbitQuant: https://github.com/iamwavecut/ComfyUI-OrbitQuant
