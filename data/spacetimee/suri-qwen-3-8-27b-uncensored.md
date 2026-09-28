# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored

## Resumen

Suri Qwen 3.8 27B Uncensored es un ajuste fino del modelo Qwen/Qwen3.8-27B (27.356.728.560 parámetros reales según los pesos safetensors del repositorio) publicado por el desarrollador SpaceTimee, cuyo objetivo declarado es eliminar las barreras de alineación del modelo base para obtener respuestas directas sin advertencias ni matices moralizantes. La model card lo describe explícitamente como un modelo "sin censura" (去对齐, desalineado) construido sobre Qwen3.8 27B, con capacidades multimodales implícitas en la etiqueta de pipeline `image-text-to-text`.

El modelo se distribuye exclusivamente en formato safetensors bajo la librería transformers, con un repositorio de 54,8 GB, y declara soporte únicamente para chino (zh) e inglés (en). No se especifica la licencia, ni la longitud de contexto, ni la composición del dataset de ajuste, lo que limita seriamente su evaluación para uso en producción.

Su relevancia actual es doble: por un lado, sirve como caso de estudio de técnicas de "abliteración"/desalineación sobre modelos densos de ~27B; por otro, sus métricas publicadas son tasas de éxito de ataque (ASR) sobre conjuntos de prompts dañinos, no benchmarks de capacidad, lo que lo convierte en un artefacto de investigación sobre seguridad de modelos más que en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; etiquetas del repo: `qwen3_5`, `qwen3.8`). No se detalla si es denso o MoE en la informacion disponible |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 54,8 GB |
| Modelos base | Qwen/Qwen3.8-27B, unsloth/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 161 descargas, 12 likes |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-27 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna mas alla de la pertenencia a la familia Qwen3.8 y de las etiquetas `qwen3_5` y `qwen3.8` del repositorio. La model card no indica numero de capas, dimensiones ocultas, tipo de atencion, ni si se trata de un transformer denso o de una mezcla de expertos (MoE). Tampoco se documenta la longitud de contexto soportada, un dato esencial dado que los modelos Qwen de esta generacion suelen ofrecer ventanas amplias.

Respecto al entrenamiento, la informacion disponible se limita a la descripcion del autor: es un modelo "sin censura (desalineado)" derivado de Qwen3.8 27B. No se publican el numero de tokens de ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO, abliteration de direcciones de rechazo u otras. El autor reconoce que "el modelo conserva preferencias de alineacion residuales que pueden corregirse mediante prompt", y recomienda anteponer un system prompt de desbloqueo, lo que sugiere una desalineacion incompleta mas que una eliminacion total de los comportamientos de rechazo.

La unica innovacion documentada es de tipo practico: la publicacion de una tabla comparativa de tasas de exito de ataque (ASR) frente al modelo base y frente a otro ajuste similar, algo inusual en model cards y que situa el artefacto en el terreno de la investigacion en seguridad y red-teaming.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con estilo marcado por la desalineacion: respuestas directas sin advertencias ni descargos de responsabilidad.
- Procesamiento de entrada de imagen y texto, segun la etiqueta de pipeline `image-text-to-text` declarada en el repositorio. La model card no detalla el alcance real de esta capacidad.
- Modo de razonamiento y modo sin razonamiento: la model card enlaza dos PDFs de ejemplos de salida, uno en "thinking mode" y otro en "non-thinking mode".
- Ajuste de comportamiento mediante system prompt: el autor documenta un prompt concreto para reforzar la ausencia de contenido moralizante.
- Parametros de muestreo recomendados por el autor: temperature 0,7-1,0; top_p 0,8-0,95; repetition_penalty 1-1,1.
- No se documenta soporte de tool calling, function calling, uso de agentes, multi-step reasoning ni otras capacidades especiales (audio, vision detallada, etc.) en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo sirve como sujeto de prueba para medir tasas de exito de ataque (ASR) y estudiar hasta que punto un ajuste de desalineacion revierte las defensas de un modelo alineado, comparando con el modelo base Qwen3.8-27B.
- Evaluacion de robustez de clasificadores de contenido: al generar respuestas que un modelo alineado rechazaria, permite probar guardarrailes, filtros de moderacion y sistemas de deteccion de contenido dañino en un entorno controlado.
- Analisis academico de la alineacion residual: el propio autor indica que el modelo conserva preferencias de alineacion corregibles por prompt, lo que lo hace util para estudiar la persistencia de sesgos de alineacion tras un ajuste agresivo.
- Estudio de tecnicas de "abliteracion" y desalineacion: comparar Suri Qwen 3.8 27B con 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored permite analizar que metodos producen mayor ASR por categoria de daño.
- Generacion de texto sin restricciones de estilo para escritura creativa adulta o narrativa de genero oscuro, siempre que el uso cumpla la legislacion aplicable y las condiciones de servicio de la plataforma de despliegue.
- Experimentacion con modelos multimodales de ~27B en tareas de descripcion de imagen y dialogo imagen-texto, dado el pipeline `image-text-to-text` declarado, aunque sin garantias documentadas de calidad.
- Despliegue en pipelines de transformers o text-generation-inference para pruebas internas de inferencia a escala media, aprovechando que el repositorio esta etiquetado como compatible con TGI y endpoints.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son tasas de exito de ataque (ASR, attack success rate) sobre conjuntos de prompts dañinos. Un valor mas alto indica mayor disposicion del modelo a cumplir la peticion dañina, por lo que no deben interpretarse como una medida de calidad o capacidad del modelo.

| Modelo | AdvBench ASR (520) | HarmBench ASR (300) | Cybercrime e intrusion (67) | Quimico y biologico (56) | Actividades ilegales (65) | Desinformacion (65) | Acoso (25) | Contenido dañino (22) |
|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 0,38 % | 6,00 % | 8,96 % | 1,79 % | 1,54 % | 15,38 % | 0,00 % | 0,00 % |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | 94,04 % | 81,33 % | 83,58 % | 92,86 % | 72,31 % | 86,15 % | 64,00 % | 77,27 % |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | 88,65 % | 76,67 % | 68,66 % | 85,71 % | 66,15 % | 90,77 % | 68,00 % | 77,27 % |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MATH, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (bf16/fp16, segun los 27,36 mil millones de parametros): en torno a 55-68 GB, coherente con el tamano de repositorio de 54,8 GB.
- Cuantizacion a 8 bits: aproximadamente 27-30 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 14-17 GB de VRAM, aunque el repositorio no publica pesos ya cuantizados.
- GPU profesionales: viable en una sola A100 80 GB, H100 80 GB o H200 en bf16; tambien en A100 40 GB o L40S 48 GB si se aplica cuantizacion.
- GPU de consumo: no cabe en bf16 en ninguna GPU consumer. En 4 bits podria ejecutarse en una RTX 4090 o RTX 3090 de 24 GB, y en 8 bits en una RTX 5090 o similar, siempre con cuantizacion aplicada por el usuario.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y, si el usuario genera sus propios pesos cuantizados, llama.cpp, Ollama o vLLM. No hay GGUF oficial publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni requisitos de memoria en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque | ASR AdvBench / HarmBench |
|---|---|---|---|---|---|---|
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | 27,36 B | no disponible | zh, en | no disponible | Ajuste sin censura sobre Qwen3.8-27B | 94,04 % / 81,33 % |
| Qwen/Qwen3.8-27B (base) | no disponible (mismo orden, ~27 B) | no disponible | no disponible | no disponible | Modelo alineado de referencia | 0,38 % / 6,00 % |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | no disponible | no disponible | no disponible | no disponible | Desalineacion por abliteration | 88,65 % / 76,67 % |

Suri Qwen 3.8 27B Uncensored supera a la variante Heretic-Abliterated en AdvBench, HarmBench, ciberdelincuencia, quimico-biologico e infracciones, y queda por detras en desinformacion (86,15 % frente a 90,77 %) y en acoso (64,00 % frente a 68,00 %), con empate en contenido dañino (77,27 %). No se dispone de datos de contexto, licencia ni rendimiento de capacidad para ninguno de los tres modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo grave de generacion de contenido dañino: las tasas de ASR publicadas (94,04 % en AdvBench y 81,33 % en HarmBench) indican que el modelo cumple la gran mayoria de peticiones dañinas, incluidas categorias de ciberdelincuencia, quimico-biologico y actividades ilegales.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Origen de los datos de ajuste desconocido: no se detalla el dataset, el numero de tokens ni el metodo de desalineacion, lo que impide auditar sesgos introducidos durante el ajuste.
- Alineacion residual reconocida por el autor: el modelo conserva comportamientos de rechazo que solo se corrigen parcialmente mediante system prompt, por lo que el comportamiento no es totalmente predecible.
- Idiomas limitados a chino e ingles: no hay evidencia de soporte para castellano u otras lenguas, con riesgo de degradacion notable en generacion multilingue.
- Longitud de contexto no documentada: no puede planificarse su uso en tareas de contexto largo sin verificacion empirica previa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de calibracion; un modelo desalineado tiende ademas a reducir las cautelas verbales que normalmente señalan incertidumbre.
- Capacidad multimodal sin verificar: la etiqueta `image-text-to-text` sugiere entrada de imagen, pero la model card no describe el encoder visual ni el rendimiento en tareas de vision.
- Cumplimiento normativo: el despliegue publico de este modelo puede entrar en conflicto con el reglamento europeo de IA y con las politicas de uso de proveedores de inferencia; los terminos de servicio de la plataforma de hosting deben revisarse antes de exponerlo.
- Uso responsable: cualquier empleo debe limitarse a entornos de investigacion controlados, con registro de interacciones y sin exposicion a usuarios finales no supervisados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base alternativo: https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo comparable (Heretic-Abliterated-Uncensored): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Ejemplo de salida en modo razonamiento: images/thinking-mode-output.pdf (ruta relativa dentro del repositorio de HuggingFace)
- Ejemplo de salida en modo sin razonamiento: images/non-thinking-mode-output.pdf (ruta relativa dentro del repositorio de HuggingFace)
- Perfil del desarrollador en linux.do: https://linux.do/u/spacetime
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; el unico resultado obtenido (heartscardclassic.com) no guarda relacion con el modelo y se descarta.
