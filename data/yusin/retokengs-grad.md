# Yusin/ReTokenGS-grad

## Resumen

ReTokenGS-grad es un modelo feed-forward de reconstruccion 3D basado en Gaussian Splatting, publicado por el usuario Yusin en HuggingFace. No es un modelo de lenguaje: recibe cuatro vistas posadas de una escena a resolucion 256×256 y predice directamente un conjunto de gaussianas 3D que permiten sintetizar vistas nuevas (novel view synthesis) sin optimizacion por escena. Su relevancia esta en la eficiencia: sustituye el decodificador de 12 capas independientes de TokenGS/LocusGS por una unica capa con pesos compartidos desplegada 12 veces, con un mecanismo de realimentacion de gradiente por token.

La innovacion principal es el bucle recurrente con senal de gradiente: tras cada ronda, cada token lee el gradiente de la perdida de renderizado de las vistas de entrada respecto a sus propias gaussianas (idea tomada de G3R). Esto permite que un unico bloque de parametros, reutilizado iterativamente, refine la geometria sin aumentar el numero de pesos del decodificador.

El checkpoint contiene 364.865.976 parametros (unos 365 M) y ocupa 1,5 GB en el repositorio. Sobre el benchmark oficial de DL3DV (140 escenas, 4 vistas, 256×256) alcanza 24,744 dB de PSNR, 0,2648 de LPIPS y 0,7922 de SSIM con 1024 tokens, mejorando su linea base LocusGS stage 1 (24,154 dB PSNR) y quedando por debajo de la variante densa ReTokenGS-dens (25,113 dB PSNR con hasta 4096 tokens). La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward Gaussian Splatting sobre transformer con decoder recurrente de pesos compartidos (una capa desplegada 12 veces) y realimentacion de gradiente por token |
| Parametros totales | 364.865.976 (aprox. 365 M) |
| Parametros activos | No aplica (no es MoE). Solo se ejecuta el bloque decoder 0, compartido en las 12 rondas |
| Longitud de contexto | No aplica (no es un LLM). Entrada fija de 4 vistas posadas a 256×256; 1024 tokens × 64 gaussianas por token |
| Tipos de cuantizacion | No disponible (se distribuyen pesos safetensors en la precision del entrenamiento; no se documentan variantes GGUF, INT8 ni FP8) |
| Idiomas soportados | No aplica (modelo de vision/3D; no procesa texto) |
| Licencia | Apache-2.0 (derivada de LocusGS / TokenGS) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de LocusGS / TokenGS, una arquitectura query-based en la que un conjunto de tokens consulta las vistas de entrada y emite gaussianas 3D. ReTokenGS-grad reemplaza las 12 capas de decoder independientes por una sola capa con pesos compartidos que se desenrolla 12 veces. Tras cada ronda, cada token recibe el gradiente de la perdida de renderizado de las vistas de entrada respecto a sus propias gaussianas (mecanismo inspirado en G3R), de modo que el estado del token incorpora informacion de error geometrico ademas de la informacion de las vistas.

La configuracion de inferencia es fija: 4 vistas posadas de entrada, resolucion 256×256, 1024 tokens y 64 gaussianas por token (65.536 gaussianas en total). El fichero publicado es la media de los ultimos seis checkpoints de entrenamiento (epocas 44 a 66). Incluye tambien los pesos de los bloques de decoder 1 a 11 heredados de la inicializacion, que no se ejecutan y solo anaden peso al checkpoint. El entrenamiento se realizo sobre el dataset DL3DV/DL3DV-10K; no se detallan en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Reconstruccion 3D feed-forward de una escena a partir de 4 vistas posadas, sin optimizacion por escena ni multiple pasada.
- Novel view synthesis: renderizado de vistas no observadas mediante rasterizacion de las gaussianas predichas.
- Prediccion de 65.536 gaussianas 3D (1024 tokens × 64 gaussianas) en una sola pasada.
- Refinamiento iterativo interno mediante 12 rondas de un decoder con pesos compartidos y realimentacion de gradiente de renderizado.
- Capacidad de escalar a mayor densidad de tokens usando el checkpoint hermano ReTokenGS-dens (hasta 4096 tokens).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico ni entrada de texto.
- No dispone de capacidades multilingues, vision semantica de alto nivel, audio ni modo "thinking".

## Casos de uso

- Novel view synthesis offline: dado un conjunto de 4 fotografias posadas de un objeto o escena, generar vistas intermedias para inspeccion visual o montaje. Es adecuado porque el modelo resuelve la reconstruccion en una sola pasada feed-forward, sin el coste de optimizacion por escena de 3DGS clasico.
- Prototipado rapido en investigacion de 3DGS: servir como linea base reproducible (con codigo y comandos de evaluacion publicados) para comparar variantes de decoders recurrentes, atencion lineal o realimentacion de gradiente sobre el benchmark DL3DV.
- Generacion de assets para simulacion y robotica: reconstruir escenas capturadas con una camara calibrada y renderizar vistas sinteticas para aumento de datos de perceptores, accepting que la resolucion de trabajo es 256×256 y la fidelidad es limitada.
- Previsualizacion en pipelines de AR/VR: generar una representacion gaussiana ligera (unas 65.000 primitivas) que pueda rasterizarse en tiempo real en visores, util para previsualizar capturas antes de un refinamiento con 3DGS por escena.
- Edicion y composicion de escenas: al disponer de gaussianas explicitas, se pueden transformar, eliminar o recolorear primitivas para tareas de edicion 3D y renderizado condicionado.
- Evaluacion comparativa de metodos de reconstruccion: usar los numeros PSNR/LPIPS/SSIM publicados sobre las 140 escenas de DL3DV como referencia en articulos o informes tecnicos.
- Docencia y divulgacion: ejemplo compacto (365 M de parametros, 1,5 GB) de arquitectura recurrente con pesos compartidos aplicada a vision 3D, ejecutable en hardware modesto.

## Benchmarks y rendimiento

Benchmark oficial DL3DV (140 escenas, 4 vistas de entrada, 256×256), segun la model card:

| Modelo | Tokens | PSNR (dB) | LPIPS | SSIM |
|---|---|---|---|---|
| LocusGS stage 1, pesos `base` publicados | 1024 | 24,154 | 0,2766 | 0,7805 |
| ReTokenGS-grad (este fichero) | 1024 | 24,744 | 0,2648 | 0,7922 |
| ReTokenGS-dens (4096 tokens bajo demanda) | ≤ 4096 | 25,113 | 0,2427 | 0,8040 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, por no ser aplicables a este modelo. Tampoco se han publicado latencias ni throughput.

## Requisitos de hardware

- VRAM estimada: en torno a 1,5 GB para los pesos en FP32 y menos de 1 GB en FP16/BF16 (estimacion a partir de los 364,9 M de parametros). Hay que sumar el estado intermedio de los 1024 tokens, las 65.536 gaussianas y los buffers del rasterizador, no cuantificados en la informacion publicada.
- GPU consumer: el modelo cabe holgadamente en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). La resolucion de trabajo 256×256 mantiene bajo el coste de renderizado.
- GPU de datacenter: A100, H100 o L40S no son necesarias para inferencia de una sola escena; resultan utiles para evaluar las 140 escenas del benchmark en paralelo o para reentrenar.
- Despliegue: no hay soporte en vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje. La via es PyTorch con el codigo del repositorio `Yusin2Chen/TokenGS-Loop`, rama `grad`, que incluye comandos de entrenamiento y evaluacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: 1,5 GB de repositorio, de los cuales una parte corresponde a los bloques de decoder 1 a 11 que no se ejecutan.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens | Contexto de entrada | PSNR (DL3DV) | LPIPS | SSIM | Licencia |
|---|---|---|---|---|---|---|---|
| ReTokenGS-grad | 364,9 M | 1024 | 4 vistas, 256×256 | 24,744 | 0,2648 | 0,7922 | Apache-2.0 |
| LocusGS stage 1 (`base`) | No disponible | 1024 | 4 vistas, 256×256 | 24,154 | 0,2766 | 0,7805 | No disponible |
| ReTokenGS-dens | No disponible | ≤ 4096 | 4 vistas, 256×256 | 25,113 | 0,2427 | 0,8040 | No disponible |
| TokenGS | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

ReTokenGS-grad mejora a LocusGS stage 1 en +0,59 dB de PSNR y reduce LPIPS en 0,0118, con el mismo numero de tokens pero con un decodificador de un solo bloque compartido. Frente a ReTokenGS-dens queda 0,369 dB por debajo, a cambio de no escalar a 4096 tokens y mantener un coste de inferencia menor.

## Limitaciones y advertencias

- Resolucion de trabajo fija a 256×256 y exactamente 4 vistas posadas de entrada; no admite otro numero de vistas ni resoluciones arbitrarias sin cambios en el codigo.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades conversacionales ni de razonamiento simbolico, y no soporta tool calling.
- Entrenado exclusivamente sobre DL3DV-10K; el dominio cubierto son escenas reales de ese dataset, con riesgo de degradacion en otros dominios (interiores sinteticos, objetos aislados, escenas con reflejos o transparencias).
- El checkpoint es la media de los ultimos seis checkpoints (epocas 44 a 66), una practica habitual pero que puede suavizar pesos y no equivale al mejor checkpoint individual.
- El fichero incluye los pesos de los bloques de decoder 1 a 11 heredados de la inicializacion y no ejecutados; quien inspeccione el checkpoint debe saber que esos parametros no intervienen en inferencia.
- No hay metricas de sesgo publicadas; en reconstruccion 3D el riesgo relevante no es la alucinacion textual sino la geometria inventada en regiones no observadas, que puede producir vistas plausibles pero incorrectas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de los resultados por parte de la comunidad.
- Licencia Apache-2.0, que permite uso comercial; al derivar de LocusGS y TokenGS conviene verificar las condiciones de esos proyectos, no detalladas en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yusin/ReTokenGS-grad
- Variante densa: https://huggingface.co/Yusin/ReTokenGS-dens
- Codigo, evaluacion y comandos de entrenamiento (rama `grad`): https://github.com/Yusin2Chen/TokenGS-Loop/tree/grad
- Proyecto LocusGS: https://github.com/leo-frank/LocusGS
- Proyecto TokenGS: https://github.com/nv-tlabs/TokenGS
- Dataset DL3DV-10K: https://huggingface.co/datasets/DL3DV/DL3DV-10K

Nota: el resto de resultados de la busqueda web (agregadores de modelos generativos, generadores de mallas 3D comerciales y perfiles de redes sociales) no guardan relacion con este modelo y se han descartado.
