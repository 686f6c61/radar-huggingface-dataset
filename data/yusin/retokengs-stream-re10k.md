# Yusin/ReTokenGS-stream-re10k

## Resumen

ReTokenGS-stream-re10k es un modelo de reconstrucción 3D y síntesis de vistas novedosas (novel view synthesis) basado en gaussian splatting, desarrollado por el usuario Yusin. No es un modelo de lenguaje: se trata de una red feed-forward que, a partir de un conjunto de vistas de entrada con pose conocida (2 vistas iniciales más 1 y 1 adicionales, en flujo de streaming), predice una representación de splats gaussianos que permite renderizar nuevas vistas de la escena sin optimización por escena en tiempo de test.

El modelo está entrenado sobre el conjunto de datos RealEstate10K (RE10K) y opera a resolución de 256×256. Su interés radica en la naturaleza feed-forward del enfoque: elimina la necesidad de optimización por escena en inferencia, lo que lo hace apto para pipelines de reconstrucción rápida. La variante "stream" procesa las vistas de forma incremental, un escenario relevante para captura secuencial de vídeo o robótica.

El repositorio contiene 366.972.350 parámetros en formato safetensors (1,5 GB) y se distribuye bajo licencia Apache-2.0. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin datos de idiomas ni pipeline declarados, coherente con su naturaleza puramente geométrica y visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward de gaussian splatting (token-based, variante stream); detalles internos no disponibles |
| Parametros totales | 366.972.350 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 a 16 vistas, resolución 256×256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | Apache-2.0 (derivada de LocusGS / TokenGS) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es feed-forward y que emplea gaussian splatting como representación de salida, con un esquema basado en tokens (el nombre ReTokenGS sugiere tokenización de la escena). La variante "stream" recibe las vistas de forma incremental (2 + 1 + 1), lo que implica un mecanismo de actualización de la representación a medida que llegan nuevas vistas. No se detalla en la información proporcionada el tipo de backbone (transformer, CNN u otro), el número de capas, la dimensionalidad de los tokens ni el mecanismo exacto de atención.

El entrenamiento se realizó sobre RealEstate10K, un dataset de secuencias de vídeo de interiores inmobiliarios con poses de cámara. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco probables en este dominio). La model card menciona una estrategia de splitting de tokens (de 1024 a 4096 con umbral τ = 3,4e-6) que mejora los resultados en configuraciones con más vistas, lo que constituye la innovación técnica destacable documentada.

## Capacidades

- Reconstrucción 3D de escenas a partir de vistas con pose conocida (posed input views).
- Síntesis de vistas novedosas (novel view synthesis) mediante renderizado de gaussian splats.
- Procesamiento en streaming: acepta vistas de forma incremental (2 + 1 + 1) y actualiza la representación.
- Funcionamiento feed-forward sin optimización por escena en tiempo de test.
- Soporte de configuraciones de 2, 4, 8 y 16 vistas de entrada.
- Resolución de trabajo de 256×256.
- Mecanismo de splitting de tokens (1024 → 4096) para mejorar la calidad con más vistas.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento, por su naturaleza visual.

## Casos de uso

- Reconstrucción rápida de interiores inmobiliarios: dado un conjunto de fotos con pose de una vivienda (estilo RealEstate10K), el modelo genera una representación de splats renderizable para recorridos virtuales, sin coste de optimización por escena.
- Captura secuencial en vídeo o robótica: la variante stream permite ir incorporando vistas a medida que llegan (2 + 1 + 1), adecuada para sistemas que no pueden esperar a tener todas las imágenes.
- Prototipado de pipelines de novel view synthesis: al ser feed-forward, sirve como componente rápido en experimentos que comparan enfoques frente a métodos con optimización en test.
- Generación de vistas intermedias para aumento de datos: a partir de un par de vistas oficiales, sintetizar vistas en posiciones intermedias (4, 8, 16) para entrenar otros modelos de visión.
- Evaluación comparativa de métodos de splatting: el modelo incluye un benchmark sobre el subconjunto oficial de 128 escenas de RE10K, útil como referencia reproducible frente a LocusGS, TokenGS, tttLRM, ReCoSplat y S2Tok.
- Visualización arquitectónica a baja resolución: para previsualizaciones rápidas a 256×256 antes de pasar a métodos de mayor calidad con optimización.

## Benchmarks y rendimiento

Resultados sobre el subconjunto oficial de 128 escenas de RE10K (2 vistas oficiales; 4/8/16 repartidas uniformemente entre el par oficial; targets oficiales; 48 rondas; métricas PSNR / SSIM / LPIPS):

| Tokens | 2 vistas | 4 vistas | 8 vistas | 16 vistas |
|---|---|---|---|---|
| 1024 (sin splitting) | 27,56 / 0,885 / 0,158 | 31,48 / 0,939 / 0,112 | 32,33 / 0,948 / 0,104 | 32,50 / 0,949 / 0,102 |
| 1024 → 4096 (τ = 3,4e-6) | 27,81 / 0,889 / 0,152 | 31,99 / 0,944 / 0,102 | 33,11 / 0,955 / 0,092 | 33,33 / 0,957 / 0,090 |

La comparación completa con LocusGS, TokenGS (versión del paper), las baselines con optimización en test y, para los modelos stream, el benchmark de streaming frente a tttLRM, ReCoSplat y S2Tok se encuentra en el README del código (rama `stream_re10k`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 366,97 M de parámetros en fp32, los pesos ocupan aproximadamente 1,47 GB; en fp16, unos 0,73 GB. A esto hay que sumar la memoria de activaciones y de los splats generados, que depende del número de vistas y de tokens.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8-12 GB de VRAM debería ser suficiente para inferencia en fp16, aunque no hay confirmación oficial.
- ¿Cabe en GPU consumer? Probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), dado el tamaño de pesos; sin datos oficiales de consumo real.
- Opciones de despliegue: no disponibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El despliegue previsible sería mediante PyTorch y el código del repositorio GitHub asociado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / vistas | Rendimiento (RE10K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTokenGS-stream-re10k | 366,97 M | 2-16 vistas, 256×256 | 27,81-33,33 PSNR (según vistas) | Apache-2.0 | Hugging Face + GitHub |
| TokenGS (versión del paper) | no disponible | no disponible | comparación en README del código | no disponible | GitHub |
| LocusGS | no disponible | no disponible | comparación en README del código | no disponible | no disponible |
| tttLRM | no disponible | streaming | benchmark de streaming en README | no disponible | no disponible |
| ReCoSplat | no disponible | streaming | benchmark de streaming en README | no disponible | no disponible |
| S2Tok | no disponible | streaming | benchmark de streaming en README | no disponible | no disponible |

Los datos cuantitativos de los modelos comparables no están incluidos en la información proporcionada; solo se indica que la comparación completa figura en el README del repositorio GitHub.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente sobre RealEstate10K (interiores inmobiliarios): probable baja generalización a otras escenas (exteriores, objetos, rostros).
- Resolución fija de 256×256: no apto para aplicaciones que requieran alta resolución sin un paso posterior de superresolución.
- Requiere vistas de entrada con pose conocida; no estima la pose de cámara.
- Naturaleza feed-forward sin optimización en test: puede quedar por debajo de métodos con optimización por escena en calidad final.
- Sin información sobre sesgos, alucinaciones geométricas o artefactos específicos; en gaussian splatting es habitual encontrar artefactos en regiones con poca cobertura de vistas.
- Licencia Apache-2.0 permite uso comercial, pero el autor indica que deriva de LocusGS / TokenGS; conviene revisar las licencias de los trabajos originales.
- No hay datos de idiomas ni pipeline declarados; no es un modelo de lenguaje ni multimodal textual.
- Fecha de creación futura (2026-11-21) en los metadatos: posible inconsistencia del repositorio que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/ReTokenGS-stream-re10k
- GitHub (código, rama stream_re10k): https://github.com/Yusin2Chen/TokenGS-Loop/tree/stream_re10k
- Dataset RealEstate10K: no disponible en la información proporcionada
- Paper de TokenGS / LocusGS: no disponible en la información proporcionada
