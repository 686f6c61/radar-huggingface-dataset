# Ultron28/thor-lm-1b

## Resumen

THOR-LM-1B es un modelo de lenguaje autoregresivo de tipo transformer decoder-only con aproximadamente 915 millones de parámetros (914.696.192 exactos), desarrollado por Suryaansh Prithvijit Singh (ULTRON) dentro de AirBorne AI Research y publicado en HuggingFace por el usuario Ultron28. Su particularidad principal no es el modelo en sí, sino el optimizador con el que fue entrenado desde cero: THOR (Tempered High-velocity Orthogonal Representation), una alternativa a AdamW y Muon que el autor describe como basada en descenso espectral ortogonal polar, frenado dinámico por suelo de ruido calibrado y torque conmutador sobre variedad de Lie.

El modelo se entrenó exclusivamente sobre tokens de FineWeb-Edu, el subconjunto de FineWeb filtrado por calidad educativa, y está pensado como foundation model en inglés. La arquitectura sigue el patrón Llama moderno (Pre-RMSNorm, SwiGLU, RoPE, GQA) con 18 bloques, dimensión oculta de 2.048 y una ventana de contexto de solo 2.048 tokens, muy corta en comparación con los modelos de su categoría publicados en 2024-2025.

Su relevancia actual es fundamentalmente experimental: sirve como banco de pruebas público para evaluar si el optimizador THOR es competitivo frente a AdamW en el régimen de ~1B parámetros. La model card no incluye resultados de benchmarks, curvas de pérdida ni comparaciones controladas, y el repositorio ocupa 65,9 GB, muy por encima de lo que requeriría un checkpoint en bfloat16 de este tamaño, lo que sugiere que incluye estados de optimizador o checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only, estilo Llama moderno |
| Parametros totales | 914.696.192 (~915 M, ~1,0 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); pesos publicados en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la model card (precision declarada: bfloat16) |

Detalles arquitectonicos adicionales declarados por el autor:

| Componente | Valor |
|---|---|
| Capas (bloques decoder) | 18 |
| Dimension oculta (d_model) | 2.048 |
| Atencion | Grouped Query Attention (GQA), 16 cabezas de consulta, 4 cabezas KV |
| Feed-forward | SwiGLU gated MLP, d_ff = 5.632 |
| Normalizacion | Pre-RMSNorm, epsilon = 1e-6 |
| Codificacion posicional | RoPE, theta = 10.000 |
| Precision | bfloat16 |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 18 bloques con las decisiones de diseno habituales en los modelos Llama modernos: Pre-RMSNorm con epsilon 1e-6, MLP con compuerta SwiGLU y dimension intermedia de 5.632 (ratio ~2,75x sobre d_model, mas bajo que el 4x clasico, coherente con el ajuste de Llama para SwiGLU), atencion con Grouped Query Attention usando 16 cabezas de consulta y 4 cabezas de clave/valor (ratio 4:1), y embeddings posicionales rotatorios con theta 10.000, valor base que limita de forma natural la extrapolacion mas alla de la ventana de entrenamiento de 2.048 tokens. Se entrenó desde cero en bfloat16 sobre el dataset FineWeb-Edu, sin que la model card detalle el numero total de tokens vistos, la composicion exacta del corpus ni si hubo fases posteriores de ajuste (SFT, RLHF o DPO).

La innovacion que el autor reivindica es el optimizador THOR, con tres mecanismos descritos de forma matematica: (1) descenso espectral ortogonal polar, que mantiene el numero de condicion kappa = 1 en todas las matrices de pesos 2D mediante una iteracion de Newton-Schulz quintica; (2) frenado dinamico por suelo de ruido calibrado, que modula el tamano de paso cuando el ruido estocastico es alto segun la relacion rho_floor = sqrt((1-beta)/(1+beta)) ≈ 0,1601; y (3) torque conmutador sobre variedad de Lie, definido como Omega = [W W^T, U], que segun el autor elimina la deriva de la representacion ortogonal. Se distribuye un paquete pip llamado `airborne-thor` que expone el optimizador (`from airborne import thor`), lo que permite reproducir el entrenamiento con `thor(model.parameters(), lr=1e-3, weight_decay=0.1)`. No se publican detalles sobre el presupuesto de computo, el hardware utilizado ni la duracion del entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la ventana de contexto corta (2.048 tokens) como restriccion principal.
- Modelado de lenguaje base (foundation model): no se documenta ningun ajuste por instrucciones, por lo que no cabe esperar un comportamiento fiable de chat o de seguimiento de ordenes sin fine-tuning adicional.
- Razonamiento y matematicas: no se declaran capacidades especificas ni se aportan benchmarks que las respalden; a 915 M de parametros y sin datos de evaluacion, el rendimiento esperable en tareas de razonamiento multi-paso es limitado.
- Generacion de codigo: no documentada en la model card ni evaluada con HumanEval u otras pruebas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; la ventana de 2.048 tokens dificulta ademas mantener el estado de un agente con historial largo.
- Capacidades multilingues: no; el modelo declara exclusivamente ingles (`language: en`).
- Capacidades especiales: ninguna declarada (sin modo thinking, sin vision, sin audio, sin decodificacion especulativa documentada).
- Capacidad de entrenamiento: el optimizador THOR se distribuye como paquete independiente y es la contribucion reutilizable del proyecto, aplicable a otros modelos.

## Casos de uso

- Investigacion sobre optimizadores: el escenario mas realista. THOR-LM-1B funciona como caso de estudio reproducible para comparar THOR frente a AdamW o Muon en el regimen de ~1B parametros, instalando `airborne-thor` y replicando el pipeline de entrenamiento sobre FineWeb-Edu.
- Experimentos academicos de bajo coste: un modelo de 915 M en bfloat16 ocupa aproximadamente 1,8 GB de pesos, por lo que cabe en cualquier GPU de consumo y permite iterar rapido en laboratorios con presupuesto de computo limitado.
- Fine-tuning especifico de dominio en ingles: al ser un modelo base con licencia Apache 2.0, puede ajustarse con SFT o LoRA para tareas concretas (clasificacion, extraccion, resumen) siempre que las entradas quepan en 2.048 tokens.
- Generacion de texto y tareas de completado cortas: redaccion asistida de fragmentos breves, autocompletado y generacion de plantillas donde el contexto no supere los dos millares de tokens.
- Prototipado de pipelines de NLP en local: al ser pequeno y de licencia permisiva, sirve como sustituto de modelos mayores durante el desarrollo, antes de migrar a un modelo mayor para produccion.
- Punto de partida para destilacion: un modelo de 915 M entrenado desde cero puede actuar como alumno en procesos de destilacion desde modelos mayores, o como profesor para modelos mas pequenos dentro de la misma familia.
- Reproducibilidad de tecnicas de ortogonalizacion: util para grupos que investigan tecnicas tipo Muon, Newton-Schulz o regularizacion espectral y quieren un checkpoint publico entrenado integramente con ese tipo de actualizacion.
- Benchmarking de infraestructura: como modelo de ~1B con contexto de 2.048, es adecuado para medir throughput y latencia de frameworks de inferencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de THOR-LM-1B no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni ninguna otra prueba estandar, ni tampoco curvas de perdida de entrenamiento, comparaciones controladas frente a AdamW/Muon ni cifras de perplejidad sobre validacion. Tampoco los resultados de busqueda web aportan datos de evaluacion de este modelo.

## Requisitos de hardware

- VRAM estimada para pesos: en bfloat16, aproximadamente 1,8 GB (914.696.192 parametros x 2 bytes); en float32, unos 3,7 GB. En una cuantizacion hipotetica de 8 bits rondaria los 0,9 GB y en 4 bits unos 0,5 GB, aunque el autor no publica pesos cuantizados.
- Cache KV: con 18 capas, 4 cabezas KV, dimension de cabeza 128 (2.048/16) y contexto 2.048, la cache en bfloat16 ocupa aproximadamente 75 MB en el peor caso, una cifra despreciable.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente en bfloat16 o float16; una NVIDIA RTX 3060, RTX 4060, RTX 3090, RTX 4090 o incluso una Tesla T4 son suficientes. Para entrenamiento o fine-tuning completo conviene una A100 o H100, aunque con LoRA bastan GPU de consumo.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU dedicada moderna e incluso en algunas integradas con memoria unificada suficiente.
- Opciones de despliegue: al ser un modelo PyTorch/HuggingFace, es directamente cargable con `transformers`. vLLM y TGI deberian funcionar con la configuracion Llama-like, aunque no hay confirmacion del autor. llama.cpp y Ollama requeririan conversion a GGUF, no documentada ni publicada.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre el repositorio: el tamano publicado de 65,9 GB es muy superior al de un checkpoint bf16 de 915 M (~1,8 GB), por lo que probablemente el repositorio incluye estados de optimizador y/o checkpoints intermedios; conviene verificar el contenido antes de descargarlo en su totalidad.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque THOR-LM-1B no publica ningun benchmark. Se comparan a continuacion los datos estructurales con alternativas de tamano equivalente del ecosistema abierto (valores de los modelos comparables segun sus fichas publicas, orientativos y sujetos a verificacion):

| Modelo | Parametros | Contexto | Licencia | Idiomas | Idiomas/Notas |
|---|---|---|---|---|---|
| THOR-LM-1B | ~915 M | 2.048 | Apache 2.0 | Ingles | Entrenado con optimizador THOR; sin benchmarks publicados |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Apache 2.0 | Ingles | Entrenado sobre ~3 B tokens (SlimPajama); ampliamente evaluado |
| Llama 3.2 1B | ~1,24 B | 128.000 | Licencia comunitaria Llama 3.2 | Multilingue | Ajustado por instrucciones; evaluado en benchmarks estandar |
| Qwen2.5-1.5B | ~1,54 B | 32.768 | Apache 2.0 (segun variante) | Multilingue | Fuerte en codigo y matematicas; benchmarks publicados |
| SmolLM2-1.7B | ~1,7 B | 8.192 | Apache 2.0 | Ingles | Entrenado sobre ~11 B tokens; benchmarks publicados |

Diferencias clave frente a estas alternativas: THOR-LM-1B tiene una ventana de contexto entre 4 y 60 veces menor, no ofrece variante ajustada por instrucciones, esta limitado al ingles y no aporta ninguna evaluacion de calidad. Su ventaja diferencial es la licencia Apache 2.0 y el interes metodologico del optimizador THOR, no el rendimiento del modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, perplejidad ni comparaciones controladas que permitan afirmar que el modelo es competitivo frente a alternativas entrenadas con AdamW.
- Ventana de contexto muy corta: 2.048 tokens quedan lejos de los 8.192-128.000 tokens de los modelos actuales de tamano similar, lo que limita resumen de documentos largos, RAG con contexto extenso y agentes con historial.
- Solo ingles: el modelo no declara soporte de castellano ni de ningun otro idioma; su uso en produccion multilingue no es viable sin fine-tuning especifico.
- No es un modelo de instrucciones: no hay evidencia de SFT, RLHF o DPO. Esperar respuestas utiles a ordenes directas o un formato de chat fiable seria un error; requiere fine-tuning antes de cualquier uso conversacional.
- Riesgo de alucinacion: al ser un modelo base de 915 M entrenado sobre un corpus filtrado de web educativa, generara afirmaciones plausibles pero no verificadas, con especial incidencia en datos factuales, cifras y citas.
- Sesgos: no se documenta ninguna auditoria de sesgo, evaluacion de toxicidad ni filtrado de contenido mas alla del propio filtrado de calidad de FineWeb-Edu. Cabe esperar sesgos presentes en datos web en ingles (representacion desigual, estereotipos, sesgo cultural anglosajon).
- Fecha y trazabilidad: la model card indica fechas de creacion y actualizacion en octubre de 2026 y no incluye informacion sobre el numero de tokens de entrenamiento, hardware, coste de computo ni proceso de validacion, lo que dificulta la reproducibilidad.
- Cifras de rendimiento no verificables: afirmaciones como "mantiene kappa = 1" o "elimina la deriva ortogonal" provienen de la propia model card y no estan acompanadas de evidencia experimental publicada.
- Tamano del repositorio: 65,9 GB para un modelo de 915 M es anormal; hay que revisar que contiene antes de descargarlo (posibles estados de optimizador, checkpoints multiples o artefactos de entrenamiento).
- Licencia: Apache 2.0 permite uso comercial y modificacion sin restricciones relevantes, siempre que se conserve el aviso de licencia y se atribuya correctamente. Es el punto mas favorable del modelo.
- Adopcion practicamente nula: 0 descargas y 2 "me gusta" en el momento de la consulta, lo que implica ausencia de comunidad, de issues resueltos y de validacion independiente.
- Los resultados de busqueda web obtenidos no corresponden a este modelo: se refieren a otros proyectos homonimos (el agente ULTRON AI de maharab549, el modelo ULTRON-V2 de kashif0912 y noticias sobre un modelo de Anthropic) y no aportan informacion tecnica util sobre THOR-LM-1B.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Ultron28/thor-lm-1b
- Repositorio GitHub del optimizador THOR (AirBorne AI Research): https://github.com/AirBorneAI/airborne-thor
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Blog, paper o demo oficiales: no disponible; el autor no enlaza ninguna publicacion tecnica, informe de evaluacion ni demo interactiva.
- Enlaces de la busqueda web: los resultados obtenidos corresponden a proyectos no relacionados con este modelo (https://github.com/maharab549/ultron-ai, https://huggingface.co/kashif0912/ULTRON-V2) y no se incluyen como referencias validas de THOR-LM-1B.
