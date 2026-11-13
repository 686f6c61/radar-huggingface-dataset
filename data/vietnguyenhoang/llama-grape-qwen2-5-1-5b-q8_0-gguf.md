# VietNguyenHoang/Llama-GRAPE-Qwen2.5-1.5B-Q8_0-GGUF

## Resumen

Llama-GRAPE-Qwen2.5-1.5B-Q8_0-GGUF es la versión cuantizada a 8 bits (Q8_0) en formato GGUF del estudiante GRAPE descrito en el artículo *Selecting Reasoning Traces by Familiarity and Quality for Small Language Model Distillation* (Vu, Nguyen, Nguyen Le; Universidad Ton Duc Thang). Se trata de un ajuste fino con LoRA sobre el modelo base Qwen2.5-1.5B, entrenado con 5.685 soluciones matemáticas paso a paso seleccionadas por el método GRAPE a partir de trazas generadas por tres profesores distintos: DeepSeek-V3, Qwen2.5-VL-72B-Instruct y Llama-3.3-70B-Instruct.

El modelo resuelve problemas de matemáticas escolares y de competición razonando paso a paso y depositando la respuesta final dentro de `\boxed{}`. No es un asistente general: no fue entrenado para conversación, seguridad ni tareas fuera del ámbito matemático. Su interés es fundamentalmente de investigación, ya que sirve como referencia (baseline) frente a la que se compara el método FQ-Select del mismo artículo, y demuestra que un estudiante destilado de este tipo puede ejecutarse en un portátil convencional.

La relevancia actual radica en que ejemplifica la destilación de trazas de razonamiento (chain-of-thought) desde modelos grandes hacia modelos pequeños de 1.500 millones de parámetros, con un rendimiento medido en MATH-500 de 54,3 puntos de precisión media sobre cuatro muestras (Acc@4) en esta cuantización Q8_0, ejecutándose con unos 1,7 GB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B), ajuste LoRA fusionado en float32 |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens o más (recomendado en la model card); entrenamiento con hasta 3.072 tokens nuevos de generación |
| Tipos de cuantizacion | Q8_0 (8 bits); existe una versión F16 no publicada |
| Idiomas soportados | inglés (en) |
| Licencia | llama3.3-and-qwen-terms (otra; ver sección de limitaciones) |
| Formato de pesos | GGUF (llama.cpp); archivo `Llama-GRAPE-Qwen2.5-1.5B-Q8_0.gguf` de 1,65 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B en su variante *base* (no instruct), un transformer decoder-only con atención completa estándar. Sobre él se aplicó un ajuste LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y feed-forward, con tasa de aprendizaje 1e-4 y decaimiento coseno, 3 épocas, tamaño de lote 16, entrenamiento en 16 bits y semilla 42. El adaptador LoRA se fusionó posteriormente en float32 y se convirtió a GGUF con llama.cpp, cuantizando a Q8_0.

Los datos de entrenamiento consisten en 1.895 preguntas de GSM8K y MATH (excluyendo MATH-500 para evitar contaminación en la evaluación), con tres soluciones correctas por pregunta seleccionadas mediante GRAPE —las tres que el estudiante encuentra más familiares— de entre las escritas por los tres profesores citados. El conjunto resultante son 5.685 soluciones paso a paso. La innovación metodológica del artículo es el criterio de selección de trazas por familiaridad y calidad (FQ-Select), del que este modelo es la referencia de comparación. No se menciona uso de RLHF ni DPO.

## Capacidades

- Razonamiento matemático paso a paso (chain-of-thought) sobre problemas escolares y de competición.
- Formato de respuesta con la solución final encapsulada en `\boxed{}`.
- Generación de texto en inglés exclusivamente.
- Plantilla de prompt Qwen ChatML, con system prompt recomendado: `Please reason step by step, and put your final answer within \boxed{}`.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso más allá de la cadena de pensamiento matemática.
- No dispone de capacidades de visión, audio ni modo *thinking* explícito.
- No entrenado para chat general, seguridad ni tareas fuera de matemáticas.

## Casos de uso

- Investigación en destilación de conocimiento: sirve como baseline GRAPE frente al que se evalúa FQ-Select, permitiendo reproducir las comparaciones del artículo con el mismo conjunto de datos público.
- Evaluación de cuantización GGUF: al publicarse la comparativa F16 frente a Q8_0 (53,4 frente a 54,3 en Acc@4), es útil para estudiar la pérdida de precisión por cuantización en modelos pequeños de razonamiento.
- Despliegue en portátil para experimentación: con 1,65 GB y unos 111 tokens por segundo en un Apple M4 Pro, permite ejecutar y depurar el modelo en hardware de consumo sin GPU dedicada.
- Generación de soluciones matemáticas de referencia para conjuntos de datos: puede producir trazas paso a paso para problemas de GSM8K y MATH, útiles como material de anotación o aumento de datos.
- Pruebas de pipelines de inferencia local con Ollama, LM Studio y llama.cpp: el repositorio incluye un `Modelfile` con los parámetros exactos del artículo, lo que facilita validar configuraciones de muestreo y plantillas de prompt.
- Docencia e investigación sobre razonamiento en modelos pequeños: permite estudiar cómo un modelo de 1,5B reproduce cadenas de pensamiento destiladas y dónde falla (aproximadamente la mitad de los intentos en MATH-500).
- Comparación de motores de inferencia: la model card documenta diferencias de precisión entre Transformers en RTX 3060, Ollama en Apple M4 Pro y las distintas cuantizaciones, útil para calibrar entornos de evaluación.

## Benchmarks y rendimiento

Evaluación en MATH-500, 4 muestras por pregunta con los ajustes de muestreo del artículo (temperatura 0,6; top-p 0,95; top-k desactivado; min-p 0; repeat penalty 1; hasta 3.072 tokens nuevos). Acc@4 es la precisión media sobre las cuatro muestras.

| Version | Motor | Acc@4 |
|---|---|---|
| Adaptador LoRA, semilla 42 (artículo) | Transformers en RTX 3060 | 55,1 |
| GGUF sin cuantizar (F16, no publicado) | Ollama en Apple M4 Pro | 53,4 |
| Este archivo (Q8_0) | Ollama en Apple M4 Pro | 54,3 |

La diferencia pareada de este archivo respecto a la evaluación en GPU sobre las 500 preguntas es de −0,8 puntos, con intervalo de confianza del 95 % de −2,5 a +0,9, dentro del ruido. En el Apple M4 Pro genera unos 111 tokens por segundo con 1,7 GB de memoria (tabla 6 del artículo). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB con la cuantización Q8_0; alrededor de 3 GB para la variante F16 no publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el artículo evalúa en una RTX 3060. Modelos como A100 o H100 no son necesarios y no aportan ventaja práctica para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (RTX 3060, RTX 4060, etc.), y también en CPU.
- Despliegue: Ollama (con el `Modelfile` incluido), LM Studio, llama.cpp (`llama-cli`, `llama-server`) y, en general, cualquier motor compatible con GGUF.
- Latencia y throughput: unos 111 tokens por segundo en un Apple M4 Pro según la tabla 6 del artículo. No se dispone de cifras para otras plataformas.
- Advertencia de configuración: los valores por defecto de Ollama (top-k 40, repeat penalty 1,1) difieren de los del artículo y reducen la precisión; es necesario usar el `Modelfile` o replicar sus parámetros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (Acc@4) | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-GRAPE-Qwen2.5-1.5B-Q8_0 (este) | 1,5B | 4.096+ | 54,3 | llama3.3-and-qwen-terms | GGUF Q8_0 |
| Qwen2.5-1.5B base | 1,5B | no disponible | no disponible | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Math-1.5B | 1,5B | no disponible | no disponible | no disponible | safetensors, GGUF |
| Estudiantes destilados de tamaño similar (p. ej. DeepSeek-R1-Distill-Qwen-1.5B) | 1,5B | no disponible | no disponible | no disponible | safetensors, GGUF |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La comparación relevante del artículo es interna: este modelo es el estudiante GRAPE de referencia frente al que se mide FQ-Select, no una comparación con modelos comerciales.

## Limitaciones y advertencias

- Ámbito restringido: no es un asistente general; no fue entrenado para chat, seguridad ni tareas fuera de matemáticas.
- Precisión limitada: en MATH-500 falla en aproximadamente la mitad de los intentos (Acc@4 de 54,3).
- Solo inglés: el modelo no está entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un modelo de razonamiento matemático, puede producir cadenas de pasos plausibles con resultados incorrectos, especialmente fuera de la distribución de GSM8K y MATH.
- Sensibilidad a la configuración: sin el system prompt y los parámetros de muestreo del artículo, la precisión cae; los valores por defecto de Ollama no son adecuados.
- Licencia compuesta: el uso debe cumplir simultáneamente los términos de Llama 3.3 Community License (incluida su Acceptable Use Policy), la Qwen License Agreement, la Apache 2.0 del modelo base y las licencias MIT de GSM8K y MATH. El nombre "Llama" es obligatorio por la licencia de Llama 3.3, aunque la arquitectura y los pesos provienen de Qwen2.5-1.5B. Es responsabilidad del usuario verificar el cumplimiento para uso comercial.
- Artefacto de investigación: el artículo está en revisión y la cita definitiva aún no está disponible; el modelo no cuenta con descargas ni validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- Sin soporte documentado de tool calling, agentes o multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VietNguyenHoang/Llama-GRAPE-Qwen2.5-1.5B-Q8_0-GGUF
- Conjunto de datos de entrenamiento, selecciones y muestras de evaluación: https://huggingface.co/datasets/VietNguyenHoang/fq-select-math-distillation
- Repositorio de código del proyecto: https://github.com/JasonNguyen31/QD-RSR-Project
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia Llama 3.3 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/LICENSE
- Política de uso aceptable de Llama 3.3: https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/USE_POLICY.md
