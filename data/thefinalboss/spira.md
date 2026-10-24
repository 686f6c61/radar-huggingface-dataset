# thefinalboss/SPIRA

## Resumen

SPIRA (Spiking Plastic Recurrent Architecture) es un prototipo de investigación de aprendizaje de secuencias desarrollado por el usuario de HuggingFace `thefinalboss`, construido explícitamente fuera del paradigma transformer / BPE / retropropagación. Se compone de tres piezas: un tokenizador por parches de entropía (EPT), una corteza spiking jerárquica con un reservoir LIF rápido, un área lenta y plasticidad modulada por recompensa, y un hipocampo de memoria asociativa one-shot con consolidación mediante reproducción (*replay*). No requiere GPU: todo el prototipo está escrito en NumPy y se ejecuta en CPU.

El modelo resuelve un problema acotado pero poco habitual: memorizar un documento nuevo con una sola pasada (99,3 % de recuerdo exacto tras 0,4 s sobre un libro no visto) y transferir después ese contenido a la corteza mediante reproducción hipocampal, que eleva el recuerdo solo-cortical del 0,3 % al 46,9 % (×138) sin degradar la memoria original. Es relevante ahora como banco de pruebas reproducible de mecanismos de memoria complementaria (sistemas rápido/lento) sin gradientes, y por publicar sus resultados negativos de forma cuantificada.

La versión v2, la que se distribuye como checkpoint principal, usa un readout de 16.384 columnas, corteza jerárquica de dos escalas temporales y reproducción hipocampal. La v3 es un experimento controlado A/B que repara la representación de la corteza (ruta de entrada directa, bancos de trazas multiescala y entradas estructuradas), pero no alcanza el criterio de éxito preregistrado. El corpus de trabajo es de 13,2 MB de texto y código mezclados, y el modelo declara únicamente inglés y francés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spiking Plastic Recurrent Architecture: tokenizador EPT (parches de entropía, sustituye a BPE), corteza spiking jerárquica (reservoir LIF rápido + área lenta, plasticidad modulada por recompensa, STDP) e hipocampo de memoria asociativa one-shot con replay; sin transformer y sin retropropagación |
| Parametros totales | no disponible (el repositorio no publica recuento de parámetros; checkpoint v2 de 72 MB y checkpoint A/B v3 de 45,9 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica: no hay ventana de contexto definida; el estado del reservoir v2 tiene un horizonte de memoria efectivo de ≈1 token; v3 añade bancos de trazas con τ = 0,4 / 0,8 / 0,95 y un estado de lectura de 2.560 dimensiones |
| Tipos de cuantizacion | no disponible; los pesos se guardan como arrays NumPy y no se han publicado variantes cuantizadas |
| Idiomas soportados | inglés y francés (según etiquetas y model card) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy); exportación con `export_deploy` en formato v2; no hay safetensors ni GGUF; el demo web es un port TypeScript del modelo v2 |

## Arquitectura y entrenamiento

La arquitectura sustituye cada componente del stack habitual por un equivalente bioinspirado. La tokenización la realiza EPT (entropy-patch tokenization) en lugar de BPE/WordPiece/SentencePiece: los patches se codifican mediante hashing, y en v3 cada patch activa 6 neuronas de hash completo más 6 neuronas de hash de trigramas de bytes, de modo que patches similares comparten entradas. La corteza es un reservoir LIF rápido con plasticidad modulada por recompensa, acompañado de un área lenta de dos escalas temporales; el aprendizaje es online, sin retropropagación, con una regla delta sobre el readout de 16.384 columnas (tamaño elegido a partir de una curva de cobertura medida). El hipocampo implementa memoria asociativa dispersa de un solo disparo y la consolida hacia la corteza mediante reproducción de tokens.

Los datos de entrenamiento publicados son un corpus mixto de texto y código de 13,2 MB (13,27 MB de entrenamiento y 640 KB de test en el A/B), con vocabulario de 4.096 patches, 200.000 tokens de SNN durante 2 épocas, 50.000 contextos en la memoria asociativa y 20.000 posiciones de test held-out con una cobertura de vocabulario del 45,24 %. No se documenta RLHF ni DPO. La innovación destacable no es de decodificación especulativa, sino la combinación de memoria one-shot con consolidación por replay y la publicación de un A/B controlado con criterio de éxito preregistrado que el modelo no cumple: el SNN solo alcanza 2,07 % in-vocab frente al 4,94 % de un bigram de patches, y la fusión con la memoria asociativa (0,13 %) empeora al SNN solo en held-out con solo 50k contextos escritos. El coste de la v3 es 2,7× más lento en entrenamiento (189 t/s frente a ~530 t/s) y un checkpoint 3,1× mayor.

## Capacidades

- Aprendizaje one-shot: memorización de un documento no visto en una sola pasada de 0,4 s, con 99,3 % de recuerdo exacto.
- Consolidación de sistemas: transferencia del contenido memorizado a la corteza mediante reproducción de 100.000 tokens hipocampales (0,3 % → 46,9 % de recuerdo solo-cortical, 64,2 % in-vocab).
- Pattern completion: recuperación con contexto parcialmente corrupto (99,0 % con 1 de 4 patches corruptos en la memoria asociativa dispersa; 52,3 % en la memoria asociativa completa desplegada).
- Generación de secuencias en bucle cerrado a ≈2.000 caracteres/s en 2 vCPU (450-700 caracteres/s en navegador), con calidad de texto libre reconocida como incoherente por el propio autor.
- Modelado de secuencias sobre texto y código mezclados mediante parches de bytes con hashing; no hay soporte de tool calling ni de function calling.
- No dispone de modo de razonamiento multi-paso, agentes, visión, audio ni thinking mode.
- Multilingüismo limitado a lo declarado (inglés y francés), sin evaluación específica por idioma en la información disponible.
- Medición de novedad de entrada: 6,3 % de patches novedosos sobre held-out de texto y código, y 64 % de objetivos held-out cubiertos por el readout de 16.384 columnas (frente al 38 % de v1).
- Ejecución íntegra en CPU y en navegador, sin dependencias de GPU.

## Casos de uso

- Investigación en memoria one-shot: utilizar el hipocampo para memorizar un documento y estudiar curvas de retención y olvido sin entrenar gradientes; el propio repositorio incluye el experimento de replay reproducible con métricas en `metrics.json`.
- Estudio de consolidación de sistemas: replicar el ciclo rápido/lento (0,3 % → 46,9 %) para comparar políticas de reproducción (número de tokens, orden, mezcla) y medir interferencia; la model card reporta que no hay interferencia y que la precisión en held-out mejora ligeramente.
- Recuperación asociativa tolerante a errores: el pattern completion con 1 de 4 patches corruptos (99,0 %) permite prototipar recuperación de pasajes con contexto degradado en un pipeline de búsqueda, siempre como componente de investigación y no como sistema de producción.
- Despliegue en entornos sin GPU: al ejecutarse en 2 vCPU y 4 GB de RAM con ≈2.000 caracteres/s, sirve para demos docentes, entornos embebidos o CI donde no hay acelerador disponible.
- Divulgación y docencia: el demo Next.js en `web/` ofrece visualización interactiva del tokenizador, generación en bucle cerrado, enseñanza one-shot con recuerdo corrompido y reproducción del spike raster; es el uso más inmediato del artefacto tal cual se distribuye.
- Referencia para computación neuromórfica: las reglas STDP y LIF, el reservoir y el esquema de trazas sirven como especificación ejecutable para portar el modelo a hardware neuromórfico o a simuladores (Brian2, NEST), aunque ese port no está incluido.
- Señal de novedad / fuera de distribución: la métrica de novedad de patches (6,3 % en held-out) puede adaptarse como detector de entradas atípicas en un pipeline de preprocesado, a validar experimentalmente antes de cualquier uso real.
- Baseline interno para comparativas de tokenización: el binario bigram de patches a vocabulario 4.096 está implementado en `spira/baselines` y sirve como referencia reproducible contra la que medir cualquier variante del SNN.

## Benchmarks y rendimiento

Resultados publicados por el autor (2 vCPU, 4 GB RAM, corpus de 13,2 MB de texto y código). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Resultado |
|---|---|
| Aprendizaje one-shot | 99,3 % de recuerdo exacto tras una pasada única de 0,4 s sobre un libro no visto |
| Consolidación: recuerdo solo-cortical | 0,3 % → 46,9 % (64,2 % in-vocab, ×138) tras 100k tokens de replay |
| Recuerdo del hipocampo tras el replay | 99,3 % (sin degradación) |
| Pattern completion (memoria asociativa dispersa) | 99,0 % con 1 de 4 patches de contexto corruptos |
| Pattern completion (memoria asociativa completa desplegada) | 52,3 % |
| Interferencia por replay | ninguna; la precisión en held-out mejora ligeramente |
| Novedad de patches zero-shot | 6,3 % sobre held-out de texto y código |
| Cobertura del readout de 16.384 columnas | 64 % de objetivos held-out (v1: 38 %) |
| Eficiencia | ≈9,2 M MACs sinápticos/token (v1: 2,4 M); ≈81× menos operaciones/token que el entrenamiento de GPT-2 small según el autor (v1: 314×) |
| Generación | ≈2.000 caracteres/s en bucle cerrado en 2 vCPU; 450-700 caracteres/s en navegador |
| Throughput de entrenamiento | v2 ~530 tokens/s; v3 189 tokens/s (2,7× más lento) |

A/B controlado a vocabulario 4.096 (mismo corpus, mismas posiciones de evaluación):

| Held-out, SNN solo, in-vocab | v2 | v3 | Bigram de patches @4096 |
|---|---|---|---|
| Test (20.000 posiciones) | 0,40 % | 2,07 % (×5,2) | 4,94 % |
| Región entrenada (8.000 posiciones) | 3,76 % | 13,29 % (×3,5) | no disponible |
| Fusión SNN + memoria asociativa | no disponible | 0,13 % | no aplica |

## Requisitos de hardware

- VRAM: no aplica; el modelo es CPU-only y no usa GPU (0 GB de VRAM).
- Hardware de referencia: 2 vCPU y 4 GB de RAM para entrenamiento y generación según la model card.
- GPU recomendadas: ninguna; no se han publicado cifras para A100, H100 o RTX 4090, y el prototipo no tiene backend de GPU.
- Cabe en cualquier equipo de consumo, incluido navegador (port TypeScript del modelo v2 en `web/`).
- Opciones de despliegue: paquete Python `spira` (solo NumPy), driver de entrenamiento por chunks, utilidad `export_deploy` (formato v2) y demo Next.js. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, y no puede haberlo sin un conversor, al no existir pesos en formato transformer ni GGUF.
- Almacenamiento: repositorio de 1,3 GB; checkpoint v2 de 72 MB y checkpoint A/B v3 de 45,9 MB (14,6 MB en la variante base del A/B).
- Latencia y throughput: ≈2.000 caracteres/s en bucle cerrado con 2 vCPU; 450-700 caracteres/s en navegador; entrenamiento a ~530 tokens/s (v2) y 189 tokens/s (v3).

## Comparativa con modelos similares

No se dispone de información sobre modelos de la misma categoría (redes spiking con memoria asociativa one-shot) en el material proporcionado, por lo que la comparación externa se marca como no disponible. La única comparación publicada es interna, contra el baseline bigram de patches del propio repositorio y entre versiones del modelo:

| Sistema | Parámetros | Contexto | Held-out in-vocab (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPIRA v2 | no disponible (checkpoint 72 MB) | sin ventana; horizonte ≈1 token | 0,40 % | MIT | checkpoint en el repo |
| SPIRA v3 (A/B) | no disponible (checkpoint 45,9 MB) | sin ventana; estado de 2.560 dims | 2,07 % | MIT | checkpoint A/B en `python/artifacts/spira_model_v3_ab.npz` |
| Bigram de patches @4096 | no disponible | 1 patch de historial | 4,94 % | MIT (código del repo) | implementado en `spira/baselines` |
| Modelos transformer de referencia (GPT-2 small) | no comparable en esta información | no disponible | no disponible | no disponible | solo se cita su coste de entrenamiento en operaciones/token |

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: la corteza no amortiza la generalización a documentos no vistos como los modelos entrenados con gradientes; en el A/B a vocabulario 4.096 el SNN solo queda en 2,07 % frente al 4,94 % del bigram de patches, y el criterio de éxito preregistrado no se cumple.
- Generación libre incoherente en ambas variantes (v2 y v3), según la propia model card; no es utilizable como generador de texto en producción.
- La fusión con la memoria asociativa perjudica en held-out a este presupuesto (0,13 % frente a 2,07 % del SNN solo) cuando la memoria asociativa solo se ha escrito con 50.000 contextos.
- El área lenta autodescuenta la fusión a nivel de token a esta escala; el replay consolida pero no interpola.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni equidad; el corpus es pequeño (13,2 MB de texto y código) y de procedencia no detallada, por lo que los sesgos de esa mezcla se heredan sin cuantificar.
- Riesgo de alucinación: alto en generación libre, dado que la salida degenera y el recuerdo fiable está ligado a contenido previamente memorizado, no a conocimiento paramétrico general.
- Idiomas: solo inglés y francés declarados; sin evaluación por idioma ni soporte documentado de castellano.
- Limitación estructural de contexto: no hay ventana; el estado del reservoir v2 tiene un horizonte efectivo de ≈1 token y v3 lo amplía con trazas, sin métricas de contexto largo publicadas.
- Madurez: prototipo de investigación con 0 descargas y 0 likes en HuggingFace, sin pipeline declarado, sin benchmarks estándar y con un único autor; no hay garantía de mantenimiento ni de interfaz estable.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía, pero el estado del arte del modelo hace inviable un uso comercial directo sin trabajo adicional.
- Advertencia de identidad: las búsquedas web de "Spira" devuelven mayoritariamente una empresa y producto comerciales de automatización de redes sociales y generación de vídeo (spira.ai, Spira Maxima), sin relación con este modelo; no deben usarse como documentación ni como referencia técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thefinalboss/SPIRA
- Paper de investigación (referenciado en la model card): `paper/spira_paper.pdf` (fuente LaTeX en `paper/`), secciones 7-8 para los resultados negativos
- Informe de la tercera iteración: `V3_REPORT.md` (en la raíz del repositorio)
- Métricas crudas del A/B: `python/artifacts/metrics_v3_ab.json`
- Checkpoint del A/B v3: `python/artifacts/spira_model_v3_ab.npz`
- Checkpoint v2 y métricas: `python/artifacts/` (checkpoint de 72 MB, `metrics.json`, spike raster, capturas del demo)
- Código del prototipo: `python/spira/` (módulos `hashing`, `ept`, `spiking`, `hippocampus`, `model`, `baselines`, `train`, `evaluate`, `export_deploy`)
- Demo en navegador: `web/` (Next.js, port TypeScript del modelo v2)
- Documentación de uso: `python/README.md`
- Enlaces externos relevantes: no disponible (las búsquedas web sobre "Spira" corresponden a productos comerciales sin relación: https://spira.ai/ y https://spira.ai/spira-maxima)
