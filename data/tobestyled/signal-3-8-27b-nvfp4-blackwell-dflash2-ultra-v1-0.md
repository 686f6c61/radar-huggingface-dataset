# ToBeStyled/Signal-3.8-27B-NVFP4-Blackwell-DFlash2-Ultra-V1.0

## Resumen

Signal-3.8-27B-NVFP4-Blackwell-DFlash2-Ultra-V1.0 es una cuantizacion GGUF en NVFP4 del fine-tune `agentionai/Signal-3.8-27B`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B`. La publica el usuario ToBeStyled y esta empaquetada especificamente para ejecutarse en una unica NVIDIA RTX 5090 de 32 GB (arquitectura Blackwell, `sm_120`) mediante llama.cpp con backend CUDA. Cuenta con 27.320.697.856 parametros totales y una ventana de contexto de 262.144 tokens.

El paquete distribuye tres archivos: el modelo principal en NVFP4 (16,9 GB, con `lm_head` y `token_embd` en Q8_0 y cabeza MTP incluida), un drafter DFlash2 cuantizado en Q4_K_M (1,14 GB) para decodificacion especulativa sin perdida, y un proyector de vision `mmproj-BF16.gguf` (0,93 GB) que habilita la entrada de imagenes. La decodificacion especulativa por rejection sampling no altera las salidas del modelo, solo la velocidad.

Su relevancia actual esta en el nicho de inferencia local de alta gama: demuestra un flujo completo de cuantizacion NVFP4 con mapas por tensor sobre una imatrix de 200 chunks, decodificacion especulativa alineada con el fine-tune y contexto de 262K en una GPU de consumo. Segun las mediciones del autor, el modelo resuelve GSM8K-50 con un 100 % de acierto y alcanza 157,6 tok/s en modo `medium`, con tasas de aceptacion del drafter entre 5,78 y 6,33 tokens por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8), denso, con cabeza MTP; soporte multimodal imagen-texto mediante proyector aparte |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 en el backbone, Q8_0 en `lm_head` y `token_embd`, Q4_K_M en el drafter, BF16 en el proyector de vision; KV cache en q8_0 (K y V) y KV del drafter en f16 |
| Idiomas soportados | Multilingue (la model card no detalla la lista; las pruebas comparativas reportan volumenes de tokens en frances e ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo principal, drafter y mmproj); el repo declara `library_name: transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de la familia Qwen3.8 con 27.320.697.856 parametros y una cabeza de prediccion multi-token (MTP) incluida en el GGUF. Incluye componentes multimodales: el archivo `mmproj-BF16.gguf` actua como proyector de vision para tareas image-text-to-text. La model card no detalla el numero de cabezas de atencion, la dimension oculta ni el tipo exacto de atencion empleado.

El proceso de construccion parte de tres piezas. Primero, el fine-tune `agentionai/Signal-3.8-27B`, descrito como una autodestilacion de "directness" (concision) sobre `Qwen/Qwen3.8-27B` en la que, segun el autor, solo difiere `lm_head.weight` respecto al modelo original, con una norma de delta de cabeza del 4,1 %; el resto del cuerpo se mantiene identico al base. Segundo, la cuantizacion NVFP4 se genero desde BF16 con `convert_hf_to_gguf.py` en el commit `f3f1a8f27` y despues con `llama-quantize`, aplicando un mapa por tensor sobre una imatrix de 200 chunks; el autor indica que las recetas que bajan `lm_head` o `token_embd` a 6 bits o menos degradan visiblemente el modelo y fueron descartadas tras medirlas. Tercero, el drafter procede de `z-lab/Qwen3.8-27B-DFlash2`, un modelo de difusion por bloques; al ser la decodificacion especulativa sin perdida (rejection sampling), el drafter no modifica las salidas, solo la velocidad de decodificacion.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO sobre el fine-tune.

## Capacidades

- Generacion de texto conversacional multi-turno con hasta 262.144 tokens de contexto.
- Razonamiento explicito en modo "thinking": es un modelo de razonamiento y admite el parametro `reasoning_effort` con valores `low`, `medium` y `xhigh`.
- Generacion de codigo y resolucion de tareas de programacion agenticas con multiples turnos y archivos (la prueba del autor usa 3 archivos con tests de aceptacion ocultos).
- Razonamiento matematico y aritmetico (evaluado con GSM8K-50).
- Capacidades de agente: la model card lo etiqueta como `agent` y documenta una tarea agentica de codigo resuelta en 2 turnos.
- Vision: entrada de imagenes mediante `mmproj-BF16.gguf`; al activarlo se desactiva la reutilizacion de cache de prompt.
- Multilingue: la ficha declara soporte multilingue, con pruebas reportadas en frances e ingles.
- Decodificacion especulativa sin perdida con el drafter DFlash2 incluido, que acelera la decodificacion sin alterar la distribucion de salida.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling.

## Casos de uso

- Generacion de codigo en produccion sobre una unica RTX 5090: el modelo resuelve tareas agenticas de varios archivos con tests ocultos (2/2 en la prueba del autor, 6.803 tokens y 41,8 s de reloj), por lo que encaja en pipelines locales de reparacion de codigo o generacion de parches donde no se quiera enviar codigo a servicios externos.
- Agentes de programacion autonoma de larga duracion: con 262.144 tokens de contexto puede mantener el estado de un proyecto extenso; el autor recomienda darle 64k o mas de contexto en builds largos, porque una compilacion de 30 minutos desborda 32k y el modelo pierde el inicio de su propio codigo.
- Razonamiento matematico con presupuesto de tokens controlado: el modo `reasoning_effort=low` produce 302 tokens por problema con un 100 % de acierto en GSM8K-50, adecuado para evaluaciones por lotes donde prima el coste por respuesta.
- Extraccion y analisis de documentos con imagenes: el proyector de vision permite pasar capturas, diagramas o paginas escaneadas junto al texto, util para digitalizacion de formularios o revision de diagramas tecnicos.
- Asistente tecnico de uso interno con contexto largo: su ventana de 262.144 tokens permite cargar manuales, normativas o documentacion extensa completa sin fragmentar.
- Atencion al cliente automatizada en varios idiomas: la ficha declara soporte multilingue y la ventana larga permite arrastrar el historial completo de la conversacion; conviene tener en cuenta que el autor lo considera mas verboso que su variante GAIN en conversacion abierta.
- Evaluacion comparativa de tecnicas de cuantizacion: el paquete sirve como referencia reproducible de NVFP4 con mapa por tensor e imatrix frente a otras recetas, gracias a los scripts de A/B intercalado y las metricas publicadas.
- Prototipado de decodificacion especulativa: incluye un drafter DFlash2 ya alineado que alcanza tasas de aceptacion de 5,78 a 6,33, util para medir el impacto de la decodificacion especulativa sobre este modelo base.

## Benchmarks y rendimiento

Los datos siguientes proceden de las mediciones del autor en una RTX 5090 de 32 GB, con contexto de 262K, cuantizacion NVFP4 y decodificacion especulativa DFlash2. Todas las cifras son comparaciones A/B intercaladas contra el paquete hermano basado en GAIN (`ToBeStyled/Qwen3.8-27B-ColdFusion-GAIN-Blackwell-DFlash2-Ultra-V1.0`), con el mismo codec, el mismo tamano de archivo (16,87 GB en ambos), el mismo drafter y los mismos flags.

GSM8K-50, temperatura 0,6, semillas fijas:

| Configuracion | Acierto | Tokens/problema | tok/s | s/problema | Aceptacion DFlash2 |
|---|---:|---:|---:|---:|---:|
| Signal-NVFP4, `low` | 100 % (30/30) | 302 | 107,1 | no disponible | 5,93 |
| Signal-NVFP4, `medium` | 100 % (50/50) | 363 | 157,6 | 2,30 | 5,78 |
| GAIN, `medium` | 96 % (48/50) | 332 | 138,0 | 2,41 | 5,06 |

Tarea agentica de codigo (motor de 2048, 3 archivos, tests de aceptacion ocultos, temperatura 0,7):

| Modelo | Exito | Turnos | Tokens | Tiempo de reloj | Aceptacion DFlash2 |
|---|---:|---:|---:|---:|---:|
| Signal-NVFP4 | 2/2 | 2 | 6.803 | 41,8 s | 6,33 (+4,2 %) |
| GAIN | 2/2 | 2 | 6.950 | 42,7 s | 6,07 |

Conversacion abierta (15 prompts generales, temperatura 0,7, determinista):

| Metrica | GAIN | Signal-NVFP4 |
|---|---:|---:|
| Tokens totales (FR) | 8.985 | 12.235 (+36 %) |
| Tokens totales (EN) | 7.671 | 10.534 (+37 %) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval u otros benchmarks estandar distintos de los anteriores.

## Requisitos de hardware

- VRAM medida por el autor: 29.447 MiB con un slot y los 262.144 tokens de contexto completos, usando NVFP4 y DFlash2.
- GPU objetivo: NVIDIA RTX 5090 de 32 GB (Blackwell, `sm_120`). La cuantizacion NVFP4 y el flujo documentado dependen de esta arquitectura.
- El autor indica que las variantes de dos slots y de KV en f16 siguen la tabla del paquete GAIN, con un margen de 0,5 GB respecto a el, dado que el tamano de archivo es identico.
- No se han publicado mediciones en otras GPU (A100, H100, RTX 4090 u otras); no disponible.
- Despliegue: llama.cpp con backend CUDA mediante `llama-server`, con `-ngl all`, `-np 1`, `-c 262144`, `-fa on`, `-ctk q8_0`, `-ctv q8_0` y decodificacion especulativa `--spec-type draft-dflash --spec-draft-n-max 7`.
- Despliegue alternativo en Ollama: el autor remite al `Modelfile` del repositorio hermano GAIN, que usa la misma plantilla.
- Tamano en disco de los artefactos: 16,9 GB (modelo), 1,14 GB (drafter) y 0,93 GB (mmproj); el repositorio completo ocupa 18,9 GB.
- Rendimiento medido: 157,6 tok/s y 2,30 s por problema en GSM8K-50 con esfuerzo `medium`; 107,1 tok/s con esfuerzo `low`; 6.803 tokens en 41,8 s en la tarea agentica.
- El autor senala que las CUDA graphs permanecen activadas y que aportan un +33 % de decodificacion en esta maquina, medido en el paquete hermano.
- El modo `low` de esfuerzo de razonamiento es el valor por defecto recomendado por el autor por ser el de menor consumo de tokens con igual precision; `medium` decodifica algo mas rapido por token en matematicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | GSM8K-50 (`medium`) | tok/s | Aceptacion DFlash2 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|---|
| Signal-3.8-27B-NVFP4-Blackwell-DFlash2-Ultra-V1.0 | 27,32 B | 262.144 | GGUF NVFP4 | 100 % (50/50) | 157,6 | 5,78 | apache-2.0 | HuggingFace |
| ToBeStyled/Qwen3.8-27B-ColdFusion-GAIN-Blackwell-DFlash2-Ultra-V1.0 | no disponible (archivo de 16,87 GB) | no disponible (envolvente de VRAM a menos de 0,5 GB) | GGUF NVFP4 | 96 % (48/50) | 138,0 | 5,06 | no disponible | HuggingFace |
| agentionai/Signal-3.8-27B (fine-tune base) | no disponible | no disponible | no disponible (pesos del fine-tune) | no disponible | no disponible | no procede | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B (modelo original) | no disponible | no disponible | no disponible | no disponible | no disponible | no procede | no disponible | HuggingFace |

Segun el autor, frente al paquete GAIN y con el mismo esfuerzo, Signal ofrece un +14,2 % de decodificacion acompanado de un +14,2 % de aceptacion del drafter, un -4,6 % de tiempo por problema y una precision igual o superior. La contrapartida documentada es que en conversacion abierta genera entre un 36 % y un 37 % mas de tokens que GAIN; el autor recomienda GAIN para chat y Signal para codigo y razonamiento.

## Limitaciones y advertencias

- Verborrea en conversacion abierta: entre un 36 % y un 37 % mas de tokens que el paquete GAIN en los 15 prompts de prueba, pese a que la mejora declarada aguas arriba era de un -57 % de tokens frente al modelo original.
- Degeneracion con decodificacion greedy: el autor advierte de que el modelo aguas arriba documenta degeneracion en generaciones largas con temperatura 0 y cita un informe de la comunidad sobre un bucle de repeticion tras 15-30 minutos en la construccion de un juego desde cero. Recomienda temperatura 0,6 para codigo y 0,7 para uso general, top_p 0,95 y top_k 20.
- Ventana de contexto insuficiente en tareas largas: un build de 30 minutos desborda 32k de contexto y, al desplazarse la ventana, el modelo pierde el inicio de su propio codigo; el autor recomienda 64k o mas en esos casos.
- Es un modelo de razonamiento: conviene fijar `max_tokens` de 4096 o mas en tareas dificiles.
- Restriccion de hardware: la cuantizacion NVFP4 esta orientada a Blackwell (`sm_120`) y el flujo documentado se limita a una RTX 5090 de 32 GB; el rendimiento en otras GPU no esta medido.
- Cuantizacion delicada: el propio autor indica que bajar `lm_head` o `token_embd` a 6 bits o menos dana visiblemente el modelo, por lo que recetas de cuantizacion mas agresivas no son viables sin perdida de calidad.
- La activacion del proyector de vision desactiva la reutilizacion de la cache de prompt, lo que afecta al rendimiento en flujos multimodales.
- Riesgo de alucinacion: no se documenta en la informacion disponible ninguna evaluacion de veracidad ni de tasas de alucinacion.
- Sesgos: no se documenta en la informacion disponible ningun analisis de sesgos.
- Idiomas: la ficha declara soporte multilingue pero no detalla la lista de idiomas cubiertos ni su calidad relativa, y las unicas lenguas con datos de prueba son frances e ingles.
- Licencia: apache-2.0 permite uso comercial, pero no se detallan en la informacion disponible las condiciones heredadas de los modelos base ni del drafter.
- Las metricas publicadas proceden de una unica maquina y el propio autor advierte de que solo se deben confiar en las comparaciones intercaladas A/B, ya que ventanas de medicion separadas derivan hasta un 10 % con carga de fondo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToBeStyled/Signal-3.8-27B-NVFP4-Blackwell-DFlash2-Ultra-V1.0
- Paquete hermano GAIN: https://huggingface.co/ToBeStyled/Qwen3.8-27B-ColdFusion-GAIN-Blackwell-DFlash2-Ultra-V1.0
- Fine-tune base: https://huggingface.co/agentionai/Signal-3.8-27B
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos corresponden a paginas de YouTube sin relacion con el modelo.
