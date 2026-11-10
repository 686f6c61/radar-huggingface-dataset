# Waseem2106/SmolLM-135M-SigLIP-VLM-VQA-10K

## Resumen

SmolLM-135M-SigLIP-VLM-VQA-10K es un modelo experimental de visión-lenguaje (VLM) publicado en Hugging Face por el usuario Waseem2106. Combina el modelo de lenguaje SmolLM-135M de HuggingFaceTB como backbone textual con el codificador visual SigLIP Base Patch16 224 de Google, unidos mediante un proyector MLP de dos capas entrenado específicamente. El modelo se ha afinado con LoRA sobre un subconjunto inicial de 10.000 ejemplos del dataset Waseem2106/vqa-150k-multidomain para tareas de respuesta visual a preguntas (VQA).

El interés del modelo es fundamentalmente investigador: explora si un backbone lingüístico de tan solo 135 millones de parámetros puede sostener capacidades multimodales básicas cuando se le acopla un codificador visual de tamaño moderado. No es un modelo autónomo de Transformers, sino un ensamblaje que requiere la arquitectura multimodal personalizada usada durante el entrenamiento, junto con los checkpoints base de SmolLM-135M y SigLIP para reconstruirse.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, entrenado sobre un subconjunto reducido (10K de 150K ejemplos disponibles). Su generalización a imágenes no vistas está explícitamente pendiente de evaluación según el propio autor, por lo que debe tratarse como una prueba de concepto y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM con encoder visual SigLIP + proyector MLP de 2 capas + LLM SmolLM-135M |
| Parámetros totales | no disponible (135M del backbone lingüístico; el total incluye SigLIP Base y el proyector, no cuantificado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA), projector.pt (PyTorch), tokenizer e image_processor en el repo |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón estándar de los VLM tipo LLaVA: la imagen pasa por el codificador SigLIP Base Patch16 224, cuyas características se proyectan mediante un MLP de dos capas al espacio del modelo de lenguaje. La pregunta en texto se tokeniza con el tokenizer de SmolLM y se fusiona de forma multimodal con las características visuales proyectadas antes de entrar en SmolLM-135M, que genera la respuesta. El entrenamiento se realizó en precisión FP16, con ajuste fino LoRA sobre el modelo lingüístico más el entrenamiento completo del proyector MLP.

El dataset de entrenamiento es Waseem2106/vqa-150k-multidomain, del que se usó un subconjunto inicial de 10.000 ejemplos con split 90/10 entre entrenamiento y validación. No se documentan en la información disponible el número total de tokens vistos, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. El repositorio distribuye por separado el adaptador LoRA (`language_lora/`), el proyector entrenado (`projector.pt`), el tokenizer y el image processor, más un `vlm_config.json` con la configuración.

## Capacidades

- Respuesta visual a preguntas (VQA): dada una imagen y una pregunta en texto, genera una respuesta corta.
- Comprensión básica de imágenes mediante el codificador SigLIP Base Patch16 224.
- Generación de texto condicionada por imagen a través de SmolLM-135M.
- Integración con la librería `transformers` (tag `endpoints_compatible`), aunque requiere la arquitectura multimodal personalizada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas (idiomas no disponibles).
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Investigación en VLMs de bajo coste: permite estudiar el efecto de reducir el backbone lingüístico a 135M parámetros manteniendo un encoder visual estándar, útil para trabajos académicos sobre eficiencia multimodal.
- Prototipado rápido de VQA: sirve para validar pipelines de respuesta visual a preguntas antes de escalar a modelos mayores como SmolVLM o Moondream2.
- Experimentos de destilación y ablación: al distribuirse LoRA y proyector por separado, facilita sustituir el backbone o el encoder y medir el impacto en tareas VQA.
- Evaluación de datasets VQA multi-dominio: entrenado sobre vqa-150k-multidomain, puede usarse como baseline para comparar anotaciones o calidad de datos en ese corpus.
- Docencia y formación: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para demostrar cómo se ensambla un VLM (encoder, proyector, LLM) en un entorno controlado.
- Pruebas de integración en `transformers`: útil para desarrolladores que quieran experimentar con arquitecturas multimodales personalizadas y comprobar la compatibilidad con la librería y con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone (135M) más SigLIP Base y el proyector, el conjunto es de escala reducida y previsiblemente apto para GPUs de consumo, aunque no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del backbone, pero no confirmado en la información.
- Opciones de despliegue: `transformers` (librería declarada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SmolLM-135M-SigLIP-VLM-VQA-10K | 135M (backbone LLM) + SigLIP Base | no disponible | Apache 2.0 | Hugging Face (repo experimental) | Ensamblaje personalizado, requiere checkpoints base |
| SmolVLM | no disponible en la información | no disponible | no disponible | Hugging Face | Familia de VLMs pequeños y eficientes; referencia en el paper arXiv 2504.05299 |
| Moondream2 | 1.8B | no disponible | no disponible | Hugging Face | SigLIP + Phi-1.5; orientado a edge y móvil, con OCR, conteo y clasificación |

## Limitaciones y advertencias

- Modelo explícitamente experimental y de investigación; el autor advierte que la generalización a imágenes no vistas debe evaluarse.
- Entrenado solo sobre un subconjunto de 10.000 ejemplos, lo que limita la cobertura y la robustez frente a dominios no representados.
- No es un modelo autónomo de `transformers`: requiere la arquitectura multimodal personalizada y los checkpoints base de SmolLM-135M y SigLIP para reconstruirse.
- Riesgo elevado de alucinación y respuestas incorrectas por el tamaño reducido del backbone lingüístico.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno largas.
- Sin descargas ni validación comunitaria en el momento de la consulta; no hay evidencia externa de calidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de benchmarks desaconseja su uso en producción sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Waseem2106/SmolLM-135M-SigLIP-VLM-VQA-10K
- Paper SmolVLM: https://arxiv.org/html/2504.05299v1
- SmolLM-135M (backbone): https://huggingface.co/HuggingFaceTB/SmolLM-135M
- SigLIP Base Patch16 224 (encoder): https://huggingface.co/google/siglip-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/Waseem2106/vqa-150k-multidomain
