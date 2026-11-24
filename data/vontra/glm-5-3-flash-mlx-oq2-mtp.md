# Vontra/GLM-5.3-Flash-MLX-oQ2-MTP

## Resumen

GLM-5.3-Flash-MLX-oQ2-MTP es una conversión cuantizada del modelo multimodal zai-org/GLM-5.3-Flash, desarrollada por el usuario Vontra (bajo la marca TensorFold) para su ejecución en Apple Silicon mediante el framework MLX. Se trata de una cuantización post-entrenamiento de solo pesos, guiada por sensibilidad, que reduce un checkpoint original en FP8 E4M3 (con escalado por bloques de 128x128) a una asignación mixta efectiva de aproximadamente 2,67 bits por peso, conservando la capa nativa de predicción del siguiente token (MTP) del modelo original para decodificación especulativa.

El modelo base es un MoE disperso multimodal de arquitectura `glm5_next`, con atención híbrida (lineal y dispersa), hyper-conexiones restringidas a variedades (manifold-constrained hyper-connections) y una ventana de contexto configurada de 1.048.576 tokens. Con 321.323.031.390 parámetros totales según los safetensors, el checkpoint resultante ocupa 110,1 GB en 22 shards, lo que lo hace viable en equipos Apple de gama alta con memoria unificada abundante, un escenario que con pesos FP8 o BF16 sería inviable.

La relevancia de esta ficha radica en que ejemplifica una tendencia técnica concreta: la cuantización extrema (2 bits) con precisión mixta selectiva para llevar modelos de escala frontera a hardware de consumo profesional, manteniendo capacidades multimodales (visión en BF16) y decodificación especulativa nativa. No obstante, el propio autor advierte que la ruta MTP es experimental y no produce salidas idénticas al baseline en ejecuciones greedy, por lo que debe desactivarse cuando se requiera reproducibilidad determinista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm5_next`, MoE disperso multimodal con atención híbrida (lineal y dispersa) y hyper-conexiones restringidas a variedades |
| Parámetros totales | 321.323.031.390 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurada) |
| Tipos de cuantización | oQ2 de precisión mixta guiada por sensibilidad (Q2, Q4 y Q8 affine, group size 64); asignación efectiva planificada de 2,67 bits por peso; visión y proyector en BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (22 shards, 110.128 GB / 102.565 GiB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea la arquitectura `glm5_next`, un transformer MoE disperso de carácter multimodal que combina atención lineal con atención dispersa e incorpora hyper-conexiones restringidas a variedades, además de una capa nativa de predicción del siguiente token (MTP). Esta capa MTP es la base de la decodificación especulativa: actúa como borrador de un token de profundidad 1 que luego se valida contra el modelo principal. La conversión conserva dicha capa con 59 entradas (12 módulos Q8, 3 módulos Q4 y ninguno en Q2), y mantiene la proyección de fusión `language_model.mtp.0.eh_proj` en BF16 para proteger la fusión del mecanismo.

Esta ficha corresponde exclusivamente a una cuantización post-entrenamiento de solo pesos: no hay reentrenamiento ni fine-tuning respecto al modelo original. El proceso oQ2 parte de los pesos FP8 E4M3 con escalado por bloques de 128x128 y aplica una asignación de precisión mixta guiada por 45 puntuaciones de sensibilidad por capa, medidas sobre un proxy de calibración de 4 bits retenido. El planificador generó 555 refuerzos a Q8, de los cuales 554 se materializan en el checkpoint (la diferencia es la proyección `eh_proj` que permanece en BF16). De los 683 módulos cuantizados totales, 126 son Q2, 3 son Q4 y 554 son Q8; las 36 proyecciones del indexador disperso se fuerzan a Q8 affine con group size 64, incluidos los tres indexadores del bloque MTP. La incrustación de tokens y la cabeza de salida quedan en Q2, mientras que los 347 tensores del codificador de visión y el proyector se mantienen en BF16. El checkpoint contiene 3.125 tensores indexados y cada módulo cuantizado incluye sus entradas de peso, escala y sesgo correspondientes.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con codificador de visión conservado en BF16.
- Razonamiento de múltiples pasos y conversaciones multi-turno gracias a la ventana de contexto de 1.048.576 tokens.
- Decodificación especulativa mediante la capa MTP nativa conservada, con profundidad de borrador 1 (experimental).
- Capacidades multimodales de visión y lenguaje integradas en una única arquitectura MoE dispersa.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: la ventana de 1.048.576 tokens permite procesar contratos, informes o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentación ni pérdida de contexto entre secciones.
- Asistencia conversacional multi-turno en inglés y chino: el modelo mantiene el hilo de conversaciones largas y puede alternar entre ambos idiomas, adecuado para soporte técnico bilingüe en mercados asiáticos.
- Prototipado local en Apple Silicon: investigadores y desarrolladores pueden desplegar un modelo de escala frontera en un Mac Studio con memoria unificada suficiente, sin depender de clústeres de GPU, gracias a la asignación efectiva de 2,67 bits por peso.
- Experimentación con decodificación especulativa: la capa MTP conservada permite medir tasas de aceptación y ganancias de throughput en hardware Apple, útil para estudiar técnicas de aceleración de inferencia en entornos MLX.
- Procesamiento de capturas de pantalla y UI: al aceptar entrada image-text, puede extraer información estructurada de interfaces, diagramas o gráficos y responder preguntas sobre ellos en flujos de automatización.
- Evaluación de cuantización extrema: sirve como referencia práctica para comparar la degradación de calidad de un esquema Q2/Q4/Q8 mixto frente al modelo original en FP8, en tareas de generación de texto y descripción de imágenes.
- Investigación sobre MoE disperso multimodal: el checkpoint permite estudiar el comportamiento de la arquitectura `glm5_next` con atención híbrida y hyper-conexiones en un entorno de memoria acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta mediciones de throughput en un Apple M3 Studio (tres ejecuciones de 512 tokens para el baseline y una pareja de carga limpia para comparar MTP), pero los valores numéricos de esa tabla no están completos en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint pesa 110,128 GB (102,565 GiB) en disco; se necesita al menos esa cantidad de memoria unificada más el overhead del runtime y de la caché KV para el contexto utilizado.
- Hardware objetivo: Apple Silicon con memoria unificada abundante (el autor reporta pruebas en un Apple M3 Studio). No está pensado para GPUs NVIDIA ni para hardware x86.
- GPU de consumo: no aplica en el sentido convencional; el requisito es un Mac con memoria unificada suficiente. No cabe en configuraciones de 64 GB ni probablemente en 96 GB una vez contabilizado el overhead.
- Despliegue: exclusivamente mediante el stack MLX, con las versiones probadas oMLX 0.6.3rc3 (build 2475), MLX 0.32.0, mlx-lm 0.31.3 y mlx-vlm 0.6.3. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta mayor throughput con MTP activado que con el baseline, pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| GLM-5.3-Flash-MLX-oQ2-MTP (esta ficha) | 321.323.031.390 | 1.048.576 | oQ2 mixta (2,67 bits efectivos) | MIT | Apple Silicon (MLX) |
| zai-org/GLM-5.3-Flash (original) | no disponible | no disponible | FP8 E4M3 con bloques 128x128 | MIT | GPUs (formato original) |
| Otras conversiones MLX del mismo modelo base | no disponible | no disponible | no disponible | no disponible | Apple Silicon (MLX) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La ruta MTP nativa es experimental: en una ejecución greedy de 512 tokens no produjo salidas idénticas al baseline. Debe desactivarse cuando se requiera reproducibilidad determinista exacta.
- La cuantización Q2 en incrustaciones, cabeza de salida y la mayoría de módulos enrutados puede degradar la calidad respecto al modelo original en FP8; no se han publicado evaluaciones de calidad comparativas.
- Solo se soportan inglés y chino; no hay cobertura declarada de castellano ni de otros idiomas.
- El checkpoint depende de versiones muy específicas del stack MLX; otras versiones pueden no interpretar correctamente las rutas `glm5_next`, oQ o MTP.
- Requiere hardware Apple Silicon con memoria unificada muy elevada (más de 102 GiB solo para los pesos), lo que excluye la mayoría de equipos de consumo.
- Al ser una cuantización post-entrenamiento sin fine-tuning, hereda los sesgos y el riesgo de alucinación del modelo base, que no se documentan en la información disponible.
- El número de parámetros activos del MoE no está disponible, lo que impide estimar con precisión el coste computacional por token.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de desplegarlo en producción.

## Enlaces

- [Hugging Face: Vontra/GLM-5.3-Flash-MLX-oQ2-MTP](https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ2-MTP)
- [Modelo base: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Revisión del modelo base utilizada](https://huggingface.co/zai-org/GLM-5.3-Flash/commit/04c4e9e95c5da8862dced7e5056455116f83a7e0)
- [Informe técnico (arXiv:2602.15763)](https://arxiv.org/abs/2602.15763)
- [Resumen de Z.ai sobre GLM-5.3-Flash](https://z.ai/blog/glm-5.3-flash)
- [Apple MLX (GitHub)](https://github.com/ml-explore/mlx)
- [Sitio de TensorFold](https://tensorfold.dev)
- [Licencia MIT del repositorio](https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ2-MTP/blob/main/LICENSE)
