# Tvene88/GLM-5.3-Flash-QTIP-W16-Uncensored

## Resumen

GLM-5.3-Flash-QTIP-W16-Uncensored es un artefacto de inferencia derivado de GLM-5.3-Flash, un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado originalmente por Zhipu AI (zai-org). El modelo base cuenta con 320 000 millones de parametros, 42 capas MoE enrutadas mas una capa MTP (Multi-Token Prediction) de borrador, y 288 expertos enrutados por capa, de los cuales 8 se activan por token. Esta version concreta, publicada por el usuario Tvene88, no es un checkpoint de transformers ni un GGUF: es un archivo en formato propietario basado en codificacion trellis (QTIP "HYB", regla A) a 2,0112 bits por peso, con poda de expertos y un runtime propio.

El objetivo declarado del autor es ejecutar un modelo de 320B en una unica GPU de consumo (RTX 5090 de 32 GiB) con 128 GB de RAM, manteniendo la columna vertebral y un pool de expertos "calientes" en VRAM, paginando los archivos de expertos en RAM del sistema y copiando a la GPU bajo demanda los expertos que cada token necesita. Frente a la cuantizacion GGUF de 2 bits mas descargada del mismo modelo base (`unsloth/GLM-5.3-Flash-GGUF`, variante `UD-IQ2_XXS`, 101,8 GB), el autor reporta entre 1,7 y 1,8 veces mas velocidad de decodificacion y un tamano de expertos de aproximadamente dos tercios, con puntuaciones estadisticamente equivalentes en HumanEval y GSM8K.

La relevancia actual del artefacto es doble: por un lado, explora tecnicas agresivas de compresion (codificacion trellis, poda de expertos, destilacion solo del router) para llevar modelos MoE de gran escala a hardware de consumo; por otro, hereda el comportamiento "sin rechazos" de los pesos de `dealignai`, lo que condiciona su uso en produccion. El formato es cerrado y solo lo lee el runtime del autor en Windows, lo que limita seriamente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 42 capas enrutadas mas 1 capa MTP (borrador); 288 expertos enrutados por capa, 8 activos por token |
| Parametros totales | 320B (modelo base GLM-5.3-Flash) |
| Parametros activos | 8 de 288 expertos por capa (numero total de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Codificacion trellis QTIP "HYB" regla A a 2,0112 bits por peso (6 326 528 bytes por experto); backbone en FP8 "slim"; router en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Formato propietario del runtime `glm53-flash-qtip-r39` (no GGUF, no safetensors de transformers); 43 archivos de expertos (66,19 GB), `merged_routers_bf16.pt` (0,1 GB) y directorio backbone FP8 (10,29 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 320B parametros: 42 capas MoE enrutadas mas una capa MTP de borrador, 288 expertos enrutados por capa y 8 expertos activados por token. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base original uso RLHF, DPO u otras tecnicas de alineamiento; esos datos deben consultarse en la model card de `zai-org/GLM-5.3-Flash`.

La innovacion tecnica de este artefacto es la compresion: los expertos enrutados de las 43 capas se codifican con un codec trellis QTIP ("HYB", regla A) a 2,0112 bits por peso, con 1 922 de los 12 096 expertos del tronco eliminados (15,89 %, mascara "W16", entre 27 y 54 por capa; la capa MTP conserva los 288). El router se sometio a 16 pasos de destilacion solo del router. El backbone (atencion, expertos compartidos, routers, embeddings, cabeza de salida y tokenizer) se guarda como directorio FP8 "slim" de 10,29 GB; los tensores de la torre de vision del checkpoint fuente no estan incluidos. El runtime mantiene el backbone y un pool de expertos calientes en VRAM, bloquea en memoria paginada los archivos de expertos en RAM del sistema y copia a la GPU los expertos necesarios por token.

## Capacidades

- Generacion de texto y razonamiento: el modelo base GLM-5.3-Flash es un modelo de lenguaje de proposito general; el autor evalua con HumanEval (codigo) y GSM8K (matematicas), donde obtiene resultados competitivos.
- Generacion de codigo: 156 de 164 problemas resueltos en HumanEval con el router incluido (95,1 %).
- Razonamiento matematico: 240 de 250 en una muestra fija de GSM8K (96,0 %).
- Modo de pensamiento (thinking): el modelo base dispone de bloque de pensamiento; las evaluaciones del autor se realizaron con "thinking off" y esfuerzo de razonamiento bajo.
- Capacidades multilingues: no disponible en la informacion proporcionada; el runtime del autor restringe la cabeza de salida a tokens de escritura latina, griego, matematicas, simbolos y emojis (111 189 de 154 880 filas), lo que limita la generacion a esos rangos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision: el checkpoint fuente dispone de torre de vision, pero este artefacto no incluye sus tensores, por lo que la capacidad visual no esta disponible en esta version.
- Comportamiento "sin rechazos": hereda los pesos de `dealignai/GLM-5.3-Flash-UNCENSORED-FP8`, con los rechazos eliminados respecto al modelo original.

## Casos de uso

- Inferencia local de un MoE de 320B en hardware de consumo: el caso de uso central del artefacto es ejecutar GLM-5.3-Flash en una unica RTX 5090 con 128 GB de RAM mediante el runtime del autor, con decodificacion de 20,90 a 23,82 tokens por segundo en las pruebas publicadas. Es adecuado para experimentacion e investigacion en compresion extrema de modelos, no para despliegues estandar.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar codificacion trellis QTIP a 2,0112 bits por peso frente a cuantizaciones GGUF de 2 bits, con metricas publicadas de calidad y velocidad.
- Investigacion sobre poda de expertos en MoE: el artefacto documenta la eliminacion del 15,89 % de los expertos del tronco y su impacto medido en HumanEval y GSM8K, util para estudiar la redundancia de expertos en modelos de gran escala.
- Generacion de codigo en local sin conexion: con 95,1 % en HumanEval y un runtime que no requiere servicios en la nube, puede emplearse en entornos aislados para asistencia de programacion, siempre que se acepten las limitaciones de formato y plataforma.
- Destilacion y ajuste del router: el archivo `merged_routers_bf16.pt` y el procedimiento de destilacion solo del router documentado por el autor permiten experimentar con el enrutamiento sin tocar los pesos de los expertos.
- Estudio de modelos sin alineamiento de rechazo: para investigadores que analicen el comportamiento de modelos con los rechazos eliminados, este artefacto ofrece una via de ejecucion local, con las advertencias de seguridad que implica.
- Reproduccion de benchmarks en hardware de consumo: el autor publica el arnes de evaluacion y los registros en su repositorio de GitHub, lo que permite reproducir las comparaciones frente a `UD-IQ2_XXS` en una sola GPU.

## Benchmarks y rendimiento

Datos publicados por el autor, en una RTX 5090 (32 GiB), 128 GB de RAM, Windows 11, una peticion a la vez, decodificacion greedy, thinking off, esfuerzo de razonamiento bajo y como maximo 1 024 tokens nuevos. Intervalos de confianza de Wilson al 95 % entre parentesis.

| Metrica | Este repositorio (archivo + router) | Archivo sin router | Unsloth `UD-IQ2_XXS` |
|---|---|---|---|
| HumanEval, 164 problemas | 156 = 95,1 % (90,7-97,5) | 154 = 93,9 % (89,1-96,7) | 158 = 96,3 % (92,2-98,3) |
| GSM8K, muestra fija de 250 | 240 = 96,0 % (92,8-97,8) | 241 = 96,4 % (93,3-98,1) | 239 = 95,6 % (92,3-97,5) |
| Decodificacion tok/s, HumanEval / GSM8K | 20,90 / 23,82 | 20,97 / 23,81 | 12,26 / 12,94 |
| Tok/s incluyendo el prompt, HumanEval / GSM8K | 15,72 / 11,23 | 15,81 / 11,13 | 7,84 / 5,92 |
| Tamano | 76,6 GB (66,2 GB de expertos) | no disponible | 101,8 GB |

Las diferencias pareadas con el router frente a Unsloth no son significativas: en HumanEval, 2 problemas solo acertados por este artefacto frente a 4 solo por Unsloth (p = 0,69); en GSM8K, 7 frente a 6 (p = 1,0). Con router frente a sin router: 3 frente a 1 y 1 frente a 2 (p = 0,63 y p = 1,0). El autor indica que no hubo respuestas truncadas. Con un pool de servido mayor (17 GiB mas tres flags de trafico de copia, sin router), la decodificacion alcanzo 23,19 / 25,74 tok/s en los primeros 40 elementos de cada tarea, aproximadamente 1,9 a 2,0 veces las tasas del conjunto completo de la comparacion, aunque esa ejecucion cubre solo 40 + 40 elementos. El runtime sirvio con un pool de expertos de 14 GiB; el prompt de llama.cpp es un token mas corto en cada elemento (deja abierto el bloque de pensamiento y el modelo lo cierra con su primer token), aceptado como equivalente. El autor anuncia que anadira un benchmark del archivo anteriormente publicado (TCQ33P5).

## Requisitos de hardware

- RAM del sistema: 128 GB, con aproximadamente 60 GiB bloqueados en memoria paginada (59,95 GiB medidos).
- GPU: una RTX 5090 o clase equivalente con 32 GiB de VRAM.
- Sistema operativo: Windows (el runtime es especifico de Windows).
- VRAM estimada en inferencia: el backbone FP8 ocupa 10,29 GB, el router 0,1 GB y el pool de expertos calientes se configura a 14 GiB (o 17-18 GiB en las pruebas de velocidad); el resto de expertos reside en RAM del sistema y se copia bajo demanda.
- Cabe en GPU de consumo: si, en una RTX 5090 de 32 GiB, con el resto del modelo paginado en RAM. No cabe integramente en VRAM.
- Opciones de despliegue: exclusivamente el runtime propio `https://github.com/Tvene88/glm53-flash-qtip-r39`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque el formato no es GGUF ni un checkpoint de transformers.
- Latencia y throughput: decodificacion de 20,90 a 23,82 tok/s en HumanEval y GSM8K con pool de 14 GiB; 23,19 a 25,74 tok/s con pool de 17 GiB en los primeros 40 elementos de cada tarea; incluyendo el prompt, 15,72 / 11,23 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | HumanEval | GSM8K | Licencia | Despliegue |
|---|---|---|---|---|---|---|---|---|
| Este artefacto (GLM-5.3-Flash QTIP W16) | 320B (MoE, 8 de 288 activos) | no disponible | Propietario QTIP trellis | 76,6 GB | 95,1 % | 96,0 % | MIT | Runtime propio, Windows, RTX 5090 |
| `unsloth/GLM-5.3-Flash-GGUF` (`UD-IQ2_XXS`) | 320B (MoE, todos los expertos) | no disponible | GGUF | 101,8 GB | 96,3 % | 95,6 % | MIT (segun modelo base) | llama.cpp, 27 GiB en GPU y resto en RAM |
| `dealignai/GLM-5.3-Flash-UNCENSORED-FP8` | 320B (MoE) | no disponible | FP8 | no disponible | no disponible | no disponible | MIT | Checkpoint FP8, requiere hardware de mayor capacidad |
| `zai-org/GLM-5.3-Flash` | 320B (MoE) | no disponible | no disponible | no disponible | no disponible | no disponible | MIT | Modelo base original |

## Limitaciones y advertencias

- Formato cerrado y no portable: los pesos no son GGUF ni un checkpoint de transformers y solo los lee el runtime del autor, disponible unicamente para Windows con una RTX 5090 y 128 GB de RAM. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de hardware estrictos: 128 GB de RAM con unos 60 GiB paginados, una GPU de 32 GiB y Windows 11. El modelo no cabe integramente en VRAM.
- Perdida de calidad por compresion: se eliminan 1 922 de 12 096 expertos del tronco (15,89 %) y se codifica a 2,0112 bits por peso; aunque las diferencias en HumanEval y GSM8K no son significativas en las pruebas del autor, la evaluacion se limita a dos tareas, con thinking off, esfuerzo de razonamiento bajo y como maximo 1 024 tokens nuevos.
- Cabeza de salida restringida: el runtime del autor limita la generacion a 111 189 de 154 880 filas (escritura latina, griego, matematicas, simbolos y emojis), lo que excluye idiomas con otros alfabetos y puede degradar tareas multilingues.
- Sin vision: el checkpoint fuente incluye torre de vision, pero este artefacto no contiene sus tensores.
- Pesos "sin rechazos": hereda el comportamiento de `dealignai/GLM-5.3-Flash-UNCENSORED-FP8`, con los rechazos eliminados; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales y requiere revision de seguridad antes de cualquier uso en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de sesgos para este artefacto; se aplican los riesgos habituales de los modelos de lenguaje, agravados por la compresion extrema.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento de los pesos modificados ni sobre el runtime.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor anuncia benchmarks pendientes de publicar; la validacion externa es practicamente inexistente.
- Idiomas soportados: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tvene88/GLM-5.3-Flash-QTIP-W16-Uncensored
- Runtime del autor: https://github.com/Tvene88/glm53-flash-qtip-r39
- Modelo base sin rechazos: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Comparacion GGUF: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
