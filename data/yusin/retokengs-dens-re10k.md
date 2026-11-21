# Yusin/ReTokenGS-dens-re10k

## Resumen

ReTokenGS-dens-re10k es un modelo de reconstrucción 3D y síntesis de vistas noveles (novel view synthesis) basado en gaussian splatting y de tipo feed-forward, desarrollado por el usuario Yusin. A diferencia de los enfoques de optimización por escena (per-scene optimisation), el modelo genera la representación gaussiana directamente a partir de un conjunto de vistas de entrada con poses conocidas, sin necesidad de un proceso de ajuste en tiempo de inferencia. Está entrenado sobre el conjunto de datos RealEstate10K y trabaja con resoluciones de 256×256 píxeles.

El modelo cuenta con aproximadamente 367 millones de parámetros (366.971.326 según el archivo safetensors) y se distribuye bajo licencia Apache-2.0. La variante "dens" conserva la cross-attention de error con la que fue entrenada, un detalle técnico que, según el autor, afecta a los resultados en torno a 0,1 dB. La relevancia de este modelo radica en su carácter feed-forward: permite generar nuevas vistas de una escena de forma directa, lo que lo hace adecuado para pipelines donde la latencia importa y no se dispone de tiempo para optimizar una escena por cada consulta.

La model card reporta resultados de benchmarks sobre el subconjunto oficial de 128 escenas de RealEstate10K, con métricas PSNR, SSIM y LPIPS para configuraciones de 2, 4, 8 y 16 vistas, incluyendo un modo de división de tokens (de 1024 a 4096) que mejora ligeramente las métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward con gaussian splatting y cross-attention de error (derivada de LocusGS / TokenGS) |
| Parametros totales | 366.971.326 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa conjuntos de 2 a 16 vistas de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la estela de TokenGS y LocusGS, empleando una arquitectura feed-forward que transforma vistas de entrada con poses conocidas en una representación de gaussian splatting para síntesis de vistas noveles. La variante "dens" se distingue por mantener la cross-attention de error con la que fue entrenada; el autor indica que eliminarla altera los resultados en aproximadamente 0,1 dB, lo que sugiere que dicha componente tiene un papel estabilizador en la calidad de reconstrucción.

El entrenamiento se realizó sobre el conjunto RealEstate10K, un dataset de recorridos de interior de inmuebles con poses de cámara. La resolución de trabajo es de 256×256 y el modelo opera sin optimización por escena en tiempo de test. La model card menciona un modo de división de tokens (de 1024 a 4096 con un umbral τ = 3.4e-6) que incrementa el número de tokens procesados y mejora las métricas, lo que apunta a un mecanismo de escalado de la representación interna según el número de vistas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a este tipo de modelos).

## Capacidades

- Reconstrucción 3D de escenas a partir de vistas con poses conocidas (posed input views).
- Síntesis de vistas noveles (novel view synthesis) en resolución 256×256.
- Generación feed-forward de gaussian splats sin optimización por escena en tiempo de inferencia.
- Soporte de configuraciones de 2, 4, 8 y 16 vistas de entrada.
- Modo de división de tokens (1024 a 4096) para mejorar la calidad de reconstrucción.
- No dispone de capacidades de generación de texto, código, matemáticas, visión semántica, tool calling ni agentes; es un modelo puramente geométrico/visual 3D.
- Capacidades multilingües: no aplicables.

## Casos de uso

- Reconstrucción rápida de interiores inmobiliarios: a partir de un par de fotos con poses conocidas de un inmueble (estilo RealEstate10K), el modelo genera vistas intermedias sin optimización por escena, lo que permite crear recorridos virtuales de forma casi instantánea.
- Generación de vistas para aumentar datos de entrenamiento: el modelo puede sintetizar vistas adicionales de una escena a partir de 2 vistas de entrada, útil para aumentar datasets de robótica o conducción con poses conocidas.
- Previsualización en pipelines de fotogrametría: integrado como paso feed-forward para obtener una representación gaussiana preliminar antes de un refinamiento opcional, reduciendo el tiempo frente a métodos de optimización por escena.
- Telepresencia y realidad virtual: con 8 o 16 vistas de entrada y las métricas reportadas (PSNR en torno a 32-33 dB), el modelo puede alimentar visores de escenas en 256×256 para prototipos de recorridos inmersivos.
- Evaluación comparativa de métodos de NVS: sirve como baseline feed-forward reproducible sobre el subconjunto oficial de 128 escenas de RealEstate10K, con métricas PSNR/SSIM/LPIPS publicadas para 2, 4, 8 y 16 vistas.
- Investigación en gaussian splatting feed-forward: al conservar la cross-attention de error, es útil para estudiar el impacto de dicha componente (≈0,1 dB) en la calidad de reconstrucción y para reproducir experimentos del repositorio TokenGS-Loop.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el subconjunto oficial de 128 escenas de RealEstate10K (2 vistas oficiales; 4/8/16 repartidas uniformemente entre el par oficial; objetivos oficiales; 12 rondas; PSNR / SSIM / LPIPS):

| Tokens | 2 vistas | 4 vistas | 8 vistas | 16 vistas |
|---|---|---|---|---|
| 1024 (sin división) | 27,66 / 0,890 / 0,155 | 31,40 / 0,942 / 0,107 | 32,23 / 0,951 / 0,099 | 32,37 / 0,953 / 0,097 |
| 1024 → 4096 (τ = 3,4e-6) | 27,88 / 0,894 / 0,147 | 31,79 / 0,947 / 0,098 | 32,70 / 0,956 / 0,090 | 32,86 / 0,958 / 0,089 |

El autor indica que la comparación completa con LocusGS y TokenGS (versión del paper), así como con baselines de optimización en tiempo de test y el benchmark de streaming frente a tttLRM, ReCoSplat y S2Tok, se encuentra en el README del repositorio de código (rama `dens_re10k`). No se han publicado en la información disponible resultados numéricos de esos competidores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 366,97 M de parámetros en precisión completa (fp32) el peso ronda 1,5 GB, y en fp16/bf16 aproximadamente 0,75 GB, a lo que hay que sumar activaciones y la representación gaussiana generada.
- GPU recomendadas: no disponible; por tamaño, el modelo cabe en GPUs de consumo como RTX 3090, RTX 4090 o superiores, aunque el autor no especifica requisitos.
- Cabe en GPU de consumo: previsiblemente sí (el checkpoint es de 1,5 GB), si bien no se confirma en la información disponible.
- Opciones de despliegue: no disponible; al ser un modelo de investigación con código en GitHub (TokenGS-Loop), el despliegue se haría mediante el repositorio del autor, no mediante vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTokenGS-dens-re10k | 366,97 M | 2-16 vistas, 256×256 | PSNR 27,66-32,86 dB según vistas y tokens | Apache-2.0 | Hugging Face (Yusin/ReTokenGS-dens-re10k) |
| TokenGS (versión del paper) | no disponible | no disponible | comparación en README del repo, sin cifras en la información disponible | no disponible | repositorio TokenGS-Loop |
| LocusGS | no disponible | no disponible | comparación en README del repo, sin cifras en la información disponible | no disponible | repositorio TokenGS-Loop |
| tttLRM, ReCoSplat, S2Tok (streaming) | no disponible | no disponible | benchmark de streaming en README del repo, sin cifras en la información disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico de reconstrucción 3D y síntesis de vistas; no es un modelo de lenguaje ni soporta tareas de texto, código o razonamiento.
- Entrenado sobre RealEstate10K, por lo que su generalización a dominios muy distintos (exteriores, objetos, escenas sintéticas) no está avalada por la información disponible.
- Resolución fija de 256×256; no se documenta soporte para resoluciones superiores.
- Requiere vistas de entrada con poses conocidas (posed input views); no se indica que funcione con poses desconocidas.
- El modo de división de tokens mejora las métricas, pero el autor advierte que eliminar la cross-attention de error cambia los resultados en torno a 0,1 dB, lo que implica sensibilidad a modificaciones arquitectónicas.
- Licencia Apache-2.0, derivada de LocusGS / TokenGS; se recomienda verificar las condiciones de las licencias originales para uso comercial.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que limita la evidencia de uso en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo visual 3D.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/ReTokenGS-dens-re10k
- Repositorio de código (rama `dens_re10k`): https://github.com/Yusin2Chen/TokenGS-Loop/tree/dens_re10k
- Dataset RealEstate10K: no disponible en la información proporcionada (referenciado en la model card como `datasets: [RealEstate10K]`)
- Paper de TokenGS: no disponible en la información proporcionada
- Paper de LocusGS: no disponible en la información proporcionada
