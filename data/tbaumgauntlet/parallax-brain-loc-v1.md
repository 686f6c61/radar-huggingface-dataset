# tbaumgauntlet/parallax-brain-loc-v1

## Resumen

parallax-brain-loc-v1 es un adaptador LoRA para el modelo multimodal Qwen3-VL-2B-Instruct en su conversión de 4 bits para MLX, desarrollado por el usuario tbaumgauntlet. Su función es acotar, sobre un único corte 2D de resonancia magnética cerebral T1 con contraste, la caja delimitadora axis-aligned más ajustada alrededor de un tumor intracraneal, devolviendo un objeto JSON con coordenadas enteras en una rejilla normalizada de 0 a 1000. No clasifica el tipo de tumor ni emite comentarios diagnósticos.

El adaptador se entrenó con MLX-VLM 0.7.11 sobre Apple Silicon con solo 128 cortes anotados manualmente y 128 actualizaciones AdamW, lo que lo convierte en un ejemplo de ajuste paramétricamente eficiente (LoRA de rango 16) sobre un modelo base de 2B parámetros. El autor lo publica explícitamente como un punto intermedio de su currículo de entrenamiento, no como el checkpoint seleccionado, con el objetivo de permitir la regeneración de su tabla de eficiencia mediante `eval.py`.

Su relevancia es doble: por un lado, documenta con métricas de IoU el rendimiento de un adaptador pequeño en una tarea de localización médica; por otro, sirve de referencia negativa frente a modelos frontera con prompting estructurado, que alcanzan 50/54 aciertos frente a los 32/54 de este adaptador. Es un artefacto de investigación, no un producto clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL (torre de visión congelada + LM adaptado) |
| Parametros totales | Modelo base Qwen3-VL-2B (2B); adaptador LoRA de rango 16 sobre 196 capas Linear del LM |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4 bits afín, grupo 64 (conversión mlx-community); el adaptador se distribuye en el formato de MLX |
| Idiomas soportados | No disponible (el prompt de entrenamiento está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador MLX (no compatible con PyTorch/PEFT); base en safetensors cuantizados de mlx-community |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `mlx-community/Qwen3-VL-2B-Instruct-4bit` (revisión `9c4f5209e57b31f4b9dfba735de3fb983739c9cc`), un transformer multimodal con torre de visión y modelo de lenguaje. El LoRA tiene rango 16, alpha 32 (escala 2.0) y dropout 0.05, y se inserta en 196 capas Linear del LM (`down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj`). La torre de visión permanece congelada y sin adaptadores, de modo que toda la adaptación ocurre en el lado lingüístico.

El entrenamiento usó 128 cortes anotados manualmente (data v1, Phase 10), 128 actualizaciones AdamW con tasa de aprendizaje 0.0001, pérdida solo sobre la completación y un tiempo de 777 segundos en un Apple M1 Max. Las imágenes provienen del *Brain tumor dataset* de Jun Cheng (figshare, CC BY 4.0), renderizadas a PNG de 8 bits con ventana percentil por corte y con las máscaras convertidas a cajas delimitadoras. La evaluación se hace con decodificación greedy, prompt fijo de un solo turno (imagen primero) y validación estricta del JSON de salida.

## Capacidades

- Localización de tumores: devuelve una caja axis-aligned `{"bbox":[x1,y1,x2,y2]}` en rejilla 0–1000 sobre un corte T1 con contraste.
- Salida estructurada estricta: el formato JSON es válido en 54/54 casos del holdout oficial.
- Procesamiento imagen-texto de un solo turno con instrucción fija; no está diseñado para diálogo multi-turno.
- No realiza clasificación de tipo tumoral ni comentario diagnóstico (restricción explícita del prompt).
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes.
- Capacidades multilingües: no documentadas; el prompt de referencia está en inglés.
- Sin modo thinking, audio ni vídeo.

## Casos de uso

- Investigación en localización médica: permite reproducir la tabla de eficiencia del proyecto Parallax ejecutando `eval.py` con el conjunto de evaluación y comparando IoU contra las cajas de referencia.
- Baseline de adaptación LoRA en MLX: sirve como referencia de qué rendimiento se obtiene con 128 muestras y 128 pasos sobre un VLM de 2B, útil para dimensionar experimentos de ajuste fino en Apple Silicon.
- Estudio de robustez a perturbaciones: el autor mide adherencia al formato bajo tres perturbaciones que preservan la información (95/162), lo que permite analizar la fragilidad de la salida estructurada en modelos pequeños.
- Comparación prompting vs. ajuste: confrontar los 32/54 del adaptador con los 50/54 de un modelo frontera con prompting estructurado para decidir si merece la pena el ajuste fino en una tarea de grounding concreta.
- Prototipado de pipelines de anotación asistida: generar cajas candidatas sobre cortes individuales para revisión humana posterior, siempre fuera de cualquier flujo clínico.
- Docencia y demostración de VLM médicos: ejemplo autocontenido (repo de 0.1 GB) para ilustrar cuantización 4-bit, LoRA y evaluación por IoU en un entorno MLX.

## Benchmarks y rendimiento

| Conjunto / métrica | Valor |
|---|---|
| Holdout oficial (54 pacientes): IoU ≥ 0.50 | 32/54 (59,3 %) |
| Holdout oficial: IoU medio / mediana | 0,527 / 0,626 |
| Holdout oficial por clase (M / G / P) | 16/18 / 7/18 / 9/18 |
| Holdout oficial: formato válido | 54/54 |
| Robustez (3 perturbaciones × 54) | 95/162 (58,6 %) |
| Piloto de desarrollo (30, selección de modelo) | 18/30, IoU medio 0,473 |
| Base sin ajustar, holdout oficial | 9/54, IoU medio 0,227 |
| Mejor prompting frontera (Gemini 4 estructurado), oficial | 50/54, IoU medio 0,780 |
| Objetivos 95 % adherencia / 90 % robustez | No alcanzados |

## Requisitos de hardware

- Entorno: requiere Apple Silicon y el entorno MLX del repositorio Parallax (`requirements-mlx.lock.txt`, mlx-vlm 0.7.11).
- VRAM/memoria unificada: el repo pesa 0,1 GB; el modelo base de 2B en 4 bits ocupa del orden de 1,5–2 GB, por lo que cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada. Cifra estimada, no publicada por el autor.
- GPU: no se contemplan CUDA (A100, H100, RTX 4090); el adaptador es exclusivamente MLX y no carga en `transformers`/`peft`.
- Despliegue: `eval.py` del repositorio Parallax con MLX-VLM; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único dato de coste es el entrenamiento (777 s en un M1 Max).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parallax-brain-loc-v1 | 2B (LoRA r16) | No disponible | 32/54 IoU ≥ 0.50; IoU medio 0,527 | Apache 2.0 | HuggingFace (MLX) |
| Qwen3-VL-2B-Instruct-4bit sin ajustar | 2B | No disponible | 9/54; IoU medio 0,227 | Apache 2.0 | HuggingFace (MLX) |
| Gemini 4 con prompting estructurado | No disponible | No disponible | 50/54; IoU medio 0,780 | Propietaria | API |
| parallax-brain-loc-n1024 (checkpoint seleccionado) | 2B (LoRA r16) | No disponible | No disponible en la información proporcionada | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Solo cortes 2D individuales de un único dataset público (un grupo institucional); la evaluación patient-family-disjoint se limita a ese mismo dataset.
- Gliomas difusos y de baja intensidad tienen bordes inciertos; algunas máscaras de origen siguen estructuras no tumorales.
- No validado para uso clínico; el autor lo restringe explícitamente a investigación y prohíbe cualquier decisión diagnóstica.
- No es el checkpoint seleccionado del proyecto: es un punto intermedio del currículo publicado para reproducibilidad.
- Es un adaptador MLX, no PyTorch/PEFT: no se puede cargar con `transformers` ni `peft`, lo que limita su portabilidad.
- Riesgo de alucinación de cajas plausibles pero incorrectas: el IoU medio de 0,527 y la robustez del 58,6 % indican una fiabilidad moderada en condiciones no vistas.
- Sesgos: no documentados por el autor; la procedencia única de los datos impide evaluar sesgo poblacional o de adquisición.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero los datos de origen (CC BY 4.0) y la ausencia de validación clínica desaconsejan cualquier aplicación en producción sanitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-v1
- Checkpoint seleccionado: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n1024
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de origen: https://doi.org/10.6084/m9.figshare.1512427.v8
- Cheng et al., PLoS ONE 10(10), 2015: https://doi.org/10.1371/journal.pone.0139451
- Cheng et al., PLoS ONE 11(6), 2016: https://doi.org/10.1371/journal.pone.0157112
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
