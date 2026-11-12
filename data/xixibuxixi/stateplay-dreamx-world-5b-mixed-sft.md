# xixibuxixi/StatePlay-DreamX-World-5B-Mixed-SFT

## Resumen

StatePlay-DreamX-World-5B-Mixed-SFT es un checkpoint intermedio de un modelo de generación de vídeo condicionado por acciones, desarrollado por el usuario xixibuxixi a partir del modelo DreamX-World-5B-Cam del equipo DreamX. Se trata de una modificación del transformer de difusión (DiT) original de 5.000 millones de parámetros para incorporar el paradigma StatePlay: un modelado explícito del estado del mundo mediante rollouts de estado implícito y transiciones causales, además de un condicionamiento por embeddings de teclado alineados a los fotogramas latentes.

El modelo se ha afinado con supervisión mixta sobre 20.000 clips de dos videojuegos de lucha (Street Fighter III y The King of Fighters '98), con el objetivo de aprender dinámicas jugables a partir de entradas de teclado. El snapshot publicado corresponde al paso 900 de un entrenamiento planificado hasta 2.500 actualizaciones del optimizador, por lo que se trata de un artefacto de investigación en curso, no de un modelo final.

Es relevante porque explora una vía poco común: dotar a un generador de vídeo de un estado latente causal que module la predicción visual, separando la dinámica del mundo de la síntesis de píxeles. No obstante, no se han publicado evaluaciones zero-shot ni state-aware, y el checkpoint no es directamente compatible con la arquitectura del DreamX original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) sobre base Wan2.2-TI2V-5B, con rama de estado implícito causal y condicionamiento por acción |
| Parámetros totales | 5B (aproximado, heredado de DreamX-World-5B-Cam) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 101 fotogramas por clip (ventana de generación de 5 segundos); ventana de retención de acción de 10 fotogramas |
| Tipos de cuantización | no disponible (pesos en bf16/safetensors) |
| Idiomas soportados | no disponible (el condicionamiento textual usa T5 de Wan2.2) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`step-900.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos DiT fragmentados de DreamX-World-5B-Cam, con verificación de compatibilidad de 825/825 nombres y formas de parámetros del tronco común. Sobre esa base se añaden tres componentes: un embedding de acciones de teclado alineado a los fotogramas latentes e inyectado en cada bloque DiT de vídeo; un módulo de transición de estado y un rollout de estado implícito según el esquema StatePlay; y una rama de atención que proyecta el estado implícito a tokens visuales. La rama de estado se calcula de forma temporalmente causal, mientras que el tronco de vídeo mantiene la arquitectura bidireccional de generación de 5 segundos. Los 300 tensores `cam_self_attn` del DreamX original no son compatibles y no se han importado, por lo que este checkpoint no puede cargarse como modelo de control de cámara DreamX.

El entrenamiento se realizó con 8 GPU H200, microbatch de 8 por GPU, acumulación de gradiente de 2, precisión bf16, DeepSpeed ZeRO-2 y tasa de aprendizaje 5e-5, guardando cada 100 actualizaciones. Los datos consisten en 10.000 clips cacheados de Street Fighter III y 10.000 de The King of Fighters '98, a resolución 480×832, 101 fotogramas y ventana de retención de acción de 10 fotogramas. No se cargó el `transition_tokenizer.pt` y la pérdida auxiliar del tokenizador de transiciones se fijó a peso 0, de modo que el modelo no depende de estados anotados. No se documenta uso de RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por acciones de teclado en el dominio de videojuegos de lucha.
- Modelado de estado del mundo con rollout implícito y transiciones causales entre fotogramas.
- Condicionamiento textual mediante el codificador T5 de la base Wan2.2-TI2V-5B.
- Generación de clips de 101 fotogramas a 480×832 píxeles (5 segundos).
- Mezcla de dominios: un único checkpoint entrenado sobre dos juegos distintos (SF3 y KOF98).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No se documentan capacidades de agente, razonamiento multi-paso ni modo thinking.
- Capacidades multilingües: no disponibles; el condicionamiento textual depende del T5 de Wan2.2.
- No incluye control de cámara (`cam_self_attn` ausente).

## Casos de uso

- Investigación en world models para videojuegos: permite estudiar si un estado latente causal mejora la coherencia de la dinámica de juego frente a un DiT puramente reactivo, comparando rollouts con y sin la rama de estado.
- Generación de datos sintéticos de gameplay: útil para aumentar datasets de entrenamiento de agentes de refuerzo en entornos de lucha, generando trayectorias visuales condicionadas por secuencias de teclado.
- Prototipado de motores de vídeo interactivos: sirve como banco de pruebas para pipelines que traducen input de teclado en fotogramas generados, evaluando latencia y estabilidad temporal en 101 fotogramas.
- Estudio de transferencia entre dominios: al mezclar SF3 y KOF98 en un solo SFT, permite analizar si el modelo generaliza estilos visuales y mecánicas distintas dentro del mismo género.
- Base para fine-tuning posterior: al ser un checkpoint intermedio con tronco compatible con Wan2.2-TI2V-5B, puede servir de inicialización para experimentos propios de StatePlay sobre otros juegos.
- Reproducción académica: útil para replicar y auditar la receta de entrenamiento (ZeRO-2, bf16, 5e-5, ventana de acción de 10 fotogramas) y comparar curvas de pérdida en los pasos 100 a 900.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no se han publicado evaluaciones zero-shot ni state-aware para este snapshot.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10-12 GB solo para los pesos DiT de 5B, más el VAE y el codificador T5 de Wan2.2, que elevan el total a un rango de 20-30 GB según implementación.
- GPU recomendadas: H200 o A100 80 GB para reproducir el entorno de entrenamiento; H100 para inferencia con margen.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) con cuantización o carga por etapas, aunque no está documentado ni validado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; requiere la implementación `StatePlayModel` y el pipeline de inferencia de StatePlay, no el cargador estándar de DreamX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay-DreamX-World-5B-Mixed-SFT | ~5B | 101 fotogramas, 480×832 | Checkpoint intermedio (step 900/2500) | no disponible | Hugging Face, 0 descargas |
| DreamX-World-5B-Cam (GD-ML) | ~5B | 5 s de vídeo, control de cámara | Modelo base oficial | no disponible | Hugging Face |
| Wan2.2-TI2V-5B | ~5B | Generación texto/imagen a vídeo | Modelo base de difusión | no disponible | Hugging Face |

La comparación con alternativas de world models condicionados por acción (por ejemplo, variantes de Genie o GameNGen) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 900 de las 2.500 actualizaciones previstas; el rendimiento puede ser sustancialmente inferior al de un modelo convergido.
- No es reanudable de forma lossless: no incluye estados del optimizador ZeRO, scheduler de learning rate ni estado RNG.
- Incompatibilidad con DreamX original: faltan los 300 tensores `cam_self_attn`, por lo que no puede usarse como modelo de control de cámara.
- Requiere código específico (`StatePlayModel`) y componentes base de Wan2.2 (T5, VAE, configuración de tronco) que no están incluidos en el repositorio.
- No se han publicado evaluaciones: no hay evidencia cuantitativa de calidad, coherencia temporal ni fidelidad a las acciones.
- Dominio muy restringido: entrenado exclusivamente con SF3 y KOF98; el comportamiento fuera de ese dominio es imprevisible.
- Licencia no especificada: no hay garantías para uso comercial; conviene contactar con el autor y revisar la licencia del modelo base DreamX y de Wan2.2.
- Riesgo de alucinación visual y deriva temporal en rollouts largos, especialmente al no usar el tokenizador de transiciones.
- Sesgos: no documentados, pero los datasets de dos juegos concretos pueden introducir sesgos de estilo y mecánicas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-DreamX-World-5B-Mixed-SFT
- Modelo base DreamX-World-5B-Cam: https://huggingface.co/GD-ML/DreamX-World-5B-Cam
- Equipo DreamX en Hugging Face: https://huggingface.co/GD-ML
