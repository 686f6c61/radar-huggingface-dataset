# toonist/AnuLM-Base-v2-400M

## Resumen

AnuLM-Base-v2-400M es un modelo de lenguaje de tipo mixture-of-experts (MoE) de 397,7 millones de parámetros totales (173,5 millones activos por token) desarrollado por el autor independiente toonist dentro del proyecto AnuLM. Está entrenado desde cero sobre tres lenguajes: hindi (en escritura devanagari), inglés y Python. Se presenta como el modelo base bajo el que se construyen todos los modelos de la aplicación de demostración AnuLM (chat, reconocimiento de voz, subtitulado, preguntas sobre imágenes y adaptadores Decide).

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible entrenar un MoE pequeño desde cero en una única GPU de consumo (una RTX 5070 Ti de 16 GB) durante 1,9 millones de pasos, procesando aproximadamente 7,8B tokens de un corpus de 11,3B. Su predecesor, AnuLM-Base-400M, había leído unos 150M tokens; esta versión ha leído unas cincuenta veces más, lo que se traduce en mejoras medibles en tareas posteriores.

Es un modelo base, no ajustado a instrucciones: continúa texto en el registro que se le da, pero no responde preguntas, no conversa ni traduce. Para esos usos existe AnuLM-Chat-400M, que es este mismo modelo ajustado con instrucciones. La arquitectura es un transformer de 20 capas con atención GQA, ventana deslizante en las diez primeras capas y 24 expertos enrutados con top-4 en las capas 1 a 19.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (24 expertos enrutados, top-4) |
| Parámetros totales | 397.660.560 |
| Parámetros activos | 173,5M por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible (el autor recomienda cargar en float32) |
| Idiomas soportados | Hindi (devanagari) e inglés; Python como lenguaje de código |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 0,8 GB), con código de modelado propio (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo tiene 20 capas con dimensión oculta de 1.024. Usa atención GQA con 16 cabezas de consulta y 4 de clave-valor, con QK-norm y RoPE. Las capas 0 a 9 aplican ventana deslizante de 256 tokens. La capa 0 tiene un MLP SwiGLU denso; las capas 1 a 19 incorporan 24 expertos enrutados de dimensión 192 con enrutamiento top-4, balanceo mediante sesgo auxiliar sin pérdida auxiliar (aux-loss-free bias balancing) y sin experto compartido. El vocabulario es de 32.768 entradas con embeddings no atados. El total es de 397,7M parámetros, de los que 173,5M están activos por token.

El entrenamiento se realizó en una sola RTX 5070 Ti de 16 GB con GEMM agrupado para el MoE, durante 1.900.000 pasos con batch de 4 × 1.024 tokens (unos 7,8B tokens sobre un corpus de 11,3B). El schedule fue warmup-stable-decay con AdamW y learning rate de 6e-4 a 6e-5 en el último 16% del entrenamiento. La ejecución estaba planificada para 2,75M pasos y se acortó a 1,9M tras una caída de la máquina; la fase de decaimiento empezó en el paso 1.590.000. El corpus combina fineweb-edu (6,00B tokens en inglés), fineweb-2 `hin_Deva` (4,50B), Wikipedia en hindi (0,07B) y una porción de Python de 0,75B tokens procedente de codeparrot-clean, OpenCodeInstruct y opc-sft-stage1. Se excluyó deliberadamente jinaai/code_exercises por su licencia CC BY-NC-SA, que habría hecho no comercial todo el modelo base.

## Capacidades

- Continuación de texto en hindi, inglés y Python en el registro que recibe la entrada.
- Modelado de lenguaje en hindi devanagari procedente de web y Wikipedia.
- Generación de código Python (continuación, no resolución de instrucciones).
- Capacidad multilingüe limitada a hindi e inglés; no se entrenó para otras lenguas índicas, hindi romanizado ni texto con mezcla de códigos.
- No soporta tool calling ni function calling de forma nativa.
- No soporta uso como agente ni razonamiento multi-paso, al no estar ajustado a instrucciones.
- No dispone de modo thinking, visión ni audio por sí mismo; sirve como backbone a los adaptadores de la aplicación AnuLM.
- Sirve como punto de partida para fine-tuning en hindi, inglés o Python.

## Casos de uso

- Investigación y docencia sobre MoE pequeños: el modelo permite estudiar el comportamiento de enrutamiento top-4 y el balanceo sin pérdida auxiliar en un entorno reproducible en una sola GPU de consumo, con un corpus documentado y scripts de construcción (`experiments/build_v2.py`).
- Modelado de lenguaje en hindi: útil para evaluar perplejidad y bits por byte en devanagari, así como para experimentos de continuación de texto en este idioma con un modelo entrenado específicamente en él.
- Punto de partida para fine-tuning: al ser un modelo base con licencia CC BY-SA 4.0, se puede ajustar para tareas concretas en hindi, inglés o Python, como hizo el autor con AnuLM-Chat-400M.
- Generación de código Python en bruto: puede continuar fragmentos de código para experimentación y prototipado, siempre con revisión humana obligatoria por las licencias copyleft presentes en los datos de entrenamiento.
- Backbone para pipelines multimodales: la aplicación AnuLM lo usa como base para reconocimiento de voz, subtitulado y preguntas sobre imágenes mediante adaptadores, con mejoras documentadas (WER en inglés de 8,4% a 7,1%; WER en hindi de 51,0% a 35,0% en 50 clips de FLEURS).
- Evaluación comparativa de corpus: al estar entrenado sobre una mezcla conocida de fineweb-edu, fineweb-2 y Wikipedia, sirve para estudiar el efecto de la composición del dataset en el rendimiento downstream (A-OKVQA de 40,9% a 43,5% tras el cambio de checkpoint).
- Experimentos de eficiencia en hardware de consumo: demuestra un flujo de entrenamiento MoE completo en 16 GB de VRAM, replicable para quien quiera estudiar técnicas de ahorro de memoria como el GEMM agrupado.

## Benchmarks y rendimiento

El model-index oficial no declara resultados de benchmarks externos. El autor sí publica métricas sobre el split de validación de su propio corpus (1% de documentos, por hash):

| Métrica | Valor |
|---|---|
| Val loss en el paso 1.900.000 | 3,3523 ± 0,0491 |
| Bits por byte | 0,756 |
| Base de demostración de 800k pasos a la que reemplaza | 3,393 / 0,765 |

El autor indica explícitamente que no se midieron bits por byte por idioma, pass@1 en código ni ningún benchmark externo para este checkpoint. Las mejoras downstream documentadas en `docs/RESULTS.md` §39 son: WER en ASR inglés de 8,4% a 7,1%, WER en ASR hindi de 51,0% a 35,0% (50 clips de FLEURS), A-OKVQA de 40,9% a 43,5% y pérdida de respuesta en chat de 3,2000 a 3,1445.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 397,7M parámetros; en float32 ocupa aproximadamente 1,6 GB solo en pesos, más overhead de activaciones y caché KV para 1.024 tokens de contexto. El autor recomienda explícitamente cargarlo en float32 porque el router mantiene un sesgo por experto y redondearlo a 16 bits cambia qué expertos se activan.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para float32; el entrenamiento se realizó en una RTX 5070 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, 4060, 4070, 4090 y equivalentes, siempre que se respete la recomendación de float32.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el código de modelado viaja con los pesos). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la cuantización a GGUF no está disponible de forma oficial y además entra en conflicto con la recomendación de float32 por el sesgo del router.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Idiomas | Licencia | Benchmark |
|---|---|---|---|---|---|---|
| AnuLM-Base-v2-400M | 397,7M | 173,5M | 1.024 | hi, en, Python | CC BY-SA 4.0 | val loss 3,3523; 0,756 bpb |
| AnuLM-Base-400M (predecesor) | ~400M | no disponible | no disponible | hi, en, Python | CC BY-SA 4.0 | val loss 3,393; 0,765 bpb |
| AnuLM-Chat-400M (derivado) | ~400M | no disponible | no disponible | hi, en | CC BY-SA 4.0 | no disponible |
| Otros modelos pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks de modelos de terceros de la misma categoría, por lo que la comparación externa queda como no disponible.

## Limitaciones y advertencias

- Es un modelo base: continúa texto, no responde preguntas ni sigue instrucciones. Usarlo como chatbot sin ajuste previo produce resultados deficientes.
- Con 174M parámetros activos y unos 7,8B tokens leídos, degenera en repeticiones en generaciones largas y libres; se recomienda usar penalización de repetición y salidas cortas.
- Alucina hechos: todo nombre, fecha y número de su salida debe considerarse no verificado.
- El hindi cubierto es devanagari procedente de web y Wikipedia; no se entrenó para otras lenguas índicas, hindi romanizado ni texto con mezcla de códigos.
- El código Python proviene en parte de archivos de GitHub con licencias copyleft (GPL y AGPL), por lo que lo que genere puede parecerse a ese material; no debe ejecutarse sin revisión.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual, pero obliga a que las obras derivadas mantengan la misma licencia. El modelo no está afiliado a AI4Bharat, BharatGen ni al Gobierno de India.
- Cargar en float16 o bfloat16 altera el enrutamiento de expertos por el sesgo del router; el autor exige float32.
- El entrenamiento se acortó de 2,75M a 1,9M pasos por una caída de la máquina, por lo que el modelo no completó el plan original.
- No hay benchmarks externos publicados, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toonist/AnuLM-Base-v2-400M
- Repositorio del proyecto AnuLM: https://github.com/MOBIRIZER-TECHNOLOGY/AnuLM
- Aplicación de demostración: `app_omni.py` en el repositorio anterior
- Documentación de arquitectura: `docs/ARCHITECTURE.md` en el repositorio
- Resultados downstream: `docs/RESULTS.md` §39 en el repositorio
- Script de construcción del corpus: `experiments/build_v2.py` en el repositorio
- Metadatos del corpus: `data/v2/meta.json` en el repositorio
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
