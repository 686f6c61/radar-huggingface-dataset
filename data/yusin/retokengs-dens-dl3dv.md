# Yusin/ReTokenGS-dens-dl3dv

## Resumen

ReTokenGS-dens-dl3dv es un modelo de reconstruccion 3D feed-forward basado en gaussian splatting, desarrollado por el autor Yusin (GitHub `Yusin2Chen`). Dado un conjunto de vistas de entrada con pose conocida, el modelo predice directamente un conjunto de gaussianas 3D que permiten sintetizar vistas nuevas (novel view synthesis) sin necesidad de optimizacion por escena en tiempo de inferencia. Esta orientado a la reconstruccion de escenas a partir de pocas imagenes (2 a 16 vistas) a resolucion de 256x256.

La variante "dens" introduce un mecanismo de token splitting: una unica capa decodificadora con pesos compartidos se ejecuta durante 12 rondas; en cada ronda se renderizan las vistas de entrada, el gradiente del render se retropropaga a cada token gaussiano y se dividen aquellos tokens cuyas gaussianas reciben un gradiente posicional elevado. Esto permite pasar de 1024 tokens (64 gaussianas por token) hasta 4096 tokens, mejorando la densidad de reconstruccion de forma adaptativa.

El modelo se entrena sobre el dataset DL3DV (DL3DV-10K) y sus pesos corresponden a la media de los ultimos cinco checkpoints de entrenamiento. Con 366.965.176 parametros y un repositorio de 1,5 GB en formato safetensors, es un modelo de investigacion publicado bajo licencia Apache-2.0, derivado de los trabajos LocusGS y TokenGS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feed-forward con decoder de pesos compartidos (12 rondas) y representacion de gaussian splatting por token |
| Parametros totales | 366.965.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 a 16 vistas a 256x256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue un paradigma feed-forward para reconstruccion 3D: a partir de vistas con pose conocida genera directamente un conjunto de gaussianas 3D organizadas en tokens. La innovacion central de la variante "dens" es un decoder de una sola capa con pesos compartidos que se ejecuta de forma iterativa durante 12 rondas. En cada ronda se renderizan las vistas de entrada y se calcula el gradiente del render respecto a la posicion de cada gaussiana; los tokens cuyas gaussianas reciben un gradiente posicional superior a un umbral (tau = 3,4e-6) se dividen, aumentando la capacidad representacional de 1024 a un maximo de 4096 tokens, con 64 gaussianas por token.

El entrenamiento se realiza sobre DL3DV (DL3DV-10K), un dataset de escenas reales con multiples vistas. Los pesos publicados son la media de los ultimos cinco checkpoints del entrenamiento, una tecnica habitual para estabilizar el modelo final. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). El modelo opera a resolucion de 256x256 y no requiere optimizacion por escena en tiempo de test.

## Capacidades

- Reconstruccion 3D feed-forward de escenas a partir de vistas con pose conocida, sin optimizacion por escena en inferencia.
- Novel view synthesis: renderizado de vistas nuevas a partir de las gaussianas predichas.
- Funcionamiento con regimenes de pocas vistas: 2, 4, 8 y 16 vistas de entrada.
- Token splitting adaptativo basado en gradiente posicional (1024 a 4096 tokens, 64 gaussianas por token).
- Decoder iterativo de pesos compartidos con 12 rondas de refinamiento.
- Salida en representacion de gaussian splatting compatible con renderizado diferenciable.
- No dispone de capacidades linguisticas, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de vision 3D.

## Casos de uso

- Reconstruccion de escenas a partir de fotografias dispersas: con 4 a 16 imagenes con pose conocida se obtiene una representacion gaussiana de la escena en una sola pasada, adecuada para pipelines de captura rapida donde no se puede ejecutar optimizacion por escena.
- Generacion de activos 3D para entornos de realidad virtual o aumentada: el modelo produce gaussianas renderizables que pueden integrarse en motores de renderizado para crear escenas navegables.
- Interpolacion de vistas para video volumetrico: dado un conjunto de vistas de entrada, el modelo sintetiza vistas intermedias, util para generar trayectorias de camara suaves en postproduccion.
- Prototipado rapido en investigacion de gaussian splatting: al ser feed-forward y no requerir optimizacion por escena, sirve como baseline reproducible para comparar metodos de reconstruccion con pocas vistas.
- Reconstruccion en robotica y navegacion: la inferencia feed-forward permite generar mapas gaussianos de entorno en tiempo acotado, util para planificacion basada en representaciones volumetricas.
- Evaluacion comparativa de metodos de novel view synthesis: el modelo incluye benchmarks contra baselines de optimizacion en test-time y modelos de streaming (tttLRM, ReCoSplat, S2Tok), lo que facilita su uso como referencia en experimentos academicos.
- Digitalizacion de escenas a baja resolucion para previsualizacion: con entradas de 256x256 y 2 a 4 vistas se obtiene una reconstruccion rapida para validacion temprana antes de un pipeline de alta calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre DL3DV-140 (split oficial de DepthSplat; indices oficiales para 2 y 4 vistas, muestreo uniforme para 8 y 16 vistas dentro de la ventana de 50 fotogramas; objetivos = los 50 fotogramas de la ventana; 12 rondas). Metricas: PSNR / SSIM / LPIPS.

| Configuracion | 2 vistas | 4 vistas | 8 vistas | 16 vistas |
|---|---|---|---|---|
| 1024 tokens (sin splitting) | 19,74 / 0,609 / 0,425 | 24,71 / 0,790 / 0,269 | 27,05 / 0,847 / 0,226 | 27,63 / 0,859 / 0,217 |
| 1024 a 4096 tokens (tau = 3,4e-6) | 19,85 / 0,614 / 0,410 | 25,09 / 0,803 / 0,244 | 27,75 / 0,867 / 0,197 | 28,47 / 0,881 / 0,189 |

El token splitting mejora de forma consistente todas las metricas, con una ganancia de PSNR de 0,84 dB en el regimen de 16 vistas. La comparacion completa con LocusGS, TokenGS (version del paper), baselines de optimizacion en test-time y modelos de streaming (tttLRM, ReCoSplat, S2Tok) se encuentra en el README del repositorio de codigo, no en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 366.965.176 parametros en precision FP32 los pesos ocupan aproximadamente 1,47 GB; en FP16 unos 0,73 GB. A esta cifra hay que anadir el coste de activaciones y renderizado de gaussianas, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. Por tamano de pesos, el modelo es compatible con GPU de consumo con suficiente memoria para pesos y activaciones, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: probablemente si en funcion del presupuesto de activaciones, pero el dato no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este modelo). El despliegue se realiza mediante el codigo del repositorio GitHub `Yusin2Chen/TokenGS-Loop`, rama `dens_dl3dv`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTokenGS-dens-dl3dv | 366.965.176 | 2 a 16 vistas, 256x256 | Feed-forward con token splitting adaptativo | Apache-2.0 | Hugging Face |
| TokenGS (version del paper) | no disponible | no disponible | Feed-forward con tokens gaussianos | no disponible | Referenciado en el repositorio del autor |
| LocusGS | no disponible | no disponible | Reconstruccion gaussiana (base de este modelo) | no disponible | Referenciado en el repositorio del autor |
| Baselines de optimizacion en test-time | no disponible | no disponible | Optimizacion por escena | no disponible | Comparados en el README del codigo |
| tttLRM, ReCoSplat, S2Tok | no disponible | no disponible | Modelos de streaming | no disponible | Comparados en el README del codigo |

Los datos cuantitativos de los modelos comparables no estan incluidos en la informacion proporcionada; la comparacion completa se remite al README del repositorio GitHub.

## Limitaciones y advertencias

- Resolucion de trabajo limitada a 256x256, lo que restringe el detalle fino de las reconstrucciones.
- Requiere vistas de entrada con pose conocida; no se documenta soporte para poses desconocidas.
- Entrenado unicamente sobre DL3DV; el rendimiento fuera de ese dominio (escenas sinteticas, interiores muy distintos, objetos aislados) no esta evaluado en la informacion disponible.
- El token splitting depende de un umbral de gradiente (tau = 3,4e-6) calibrado en el split DL3DV-140; su transferencia a otros conjuntos no esta validada.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- No se documentan sesgos especificos, pero al entrenarse en escenas reales de DL3DV puede heredar sesgos de composicion y condiciones de captura del dataset.
- Riesgo de artefactos y alucinacion geometrica en regiones con poca cobertura de vistas (por ejemplo, 2 vistas), donde el PSNR cae a 19,85 dB.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de LocusGS y TokenGS; conviene revisar las condiciones de esas obras originales antes de un despliegue comercial.
- No dispone de cuantizaciones publicadas ni de pipeline estandar en Hugging Face (`pipeline: no disponible`), lo que complica el despliegue sin el codigo del autor.
- El hash SHA-256 del archivo de pesos esta publicado (`34b3b6213b0f11bed6ddf4590e5ce819bdb3613868c63eaaa7303a54bdd1e2c4`), lo que permite verificar la integridad de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusin/ReTokenGS-dens-dl3dv
- Codigo (rama `dens_dl3dv`): https://github.com/Yusin2Chen/TokenGS-Loop/tree/dens_dl3dv
- Repositorio principal: https://github.com/Yusin2Chen/TokenGS-Loop
- Dataset DL3DV-10K: https://huggingface.co/datasets/DL3DV/DL3DV-10K
