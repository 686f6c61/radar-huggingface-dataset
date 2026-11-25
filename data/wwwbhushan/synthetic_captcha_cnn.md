# wwwbhushan/SYNTHETIC_CAPTCHA_CNN

## Resumen

SYNTHETIC_CAPTCHA_CNN es una red neuronal convolucional ligera publicada por el usuario wwwbhushan en Hugging Face, entrenada exclusivamente sobre imágenes CAPTCHA sintéticas de cinco caracteres (A–Z, 0–9) generadas mediante Python. El modelo se distribuye como demostración educativa para ilustrar el ciclo completo de un proyecto de visión por computador: diseño de arquitectura CNN, entrenamiento supervisado y exportación a ONNX para inferencia independiente del framework.

El repositorio incluye dos artefactos: los pesos en PyTorch (`captcha_cnn.pt`) para reentrenamiento o ajuste fino, y el grafo exportado a ONNX (`captcha_cnn.onnx`) para ejecución con ONNX Runtime. El autor declara explícitamente que el modelo no está diseñado para sistemas en producción ni para CAPTCHA reales, sino como material didáctico de aula.

Por su naturaleza, no es un modelo de lenguaje ni un sistema multimodal generalista: se trata de un clasificador de imágenes de dominio muy restringido, con entrada en escala de grises de 160×55 píxeles y salida de cinco clasificaciones multiclase sobre un alfabeto de 36 símbolos. Su relevancia es, por tanto, formativa y no comparativa con modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) para clasificación de imágenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 160×55 px) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 PyTorch y ONNX) |
| Idiomas soportados | no aplica (clasificación de caracteres A–Z y 0–9) |
| Licencia | Apache 2.0 (la model card menciona también MIT en el frontmatter, discrepancia no resuelta) |
| Formato de pesos | PyTorch `state_dict` (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN diseñada para clasificar cinco caracteres simultáneamente a partir de una imagen en escala de grises de 160×55 píxeles. La model card no detalla el número de capas convolucionales, canales, funciones de activación ni el tamaño de las capas fully connected; únicamente se especifica el pipeline de inferencia (normalización a [-1, 1] y salida con forma `[batch, 5, 36]` tras `argmax` por posición).

El entrenamiento se realizó sobre 5.000 imágenes sintéticas generadas en Python, con cinco líneas de ruido aleatorias superpuestas para simular distorsión. La partición fue 80/20 (4.000 entrenamiento, 1.000 validación). El autor reporta una precisión de validación de aproximadamente 96,8 % por carácter y 89,6 % para la secuencia completa de cinco caracteres. No se documenta el número de épocas, el optimizador, la función de pérdida ni si hubo aumentación de datos más allá del ruido sintético.

## Capacidades

- Clasificación de imágenes CAPTCHA sintéticas de cinco caracteres sobre el alfabeto `A–Z` + `0–9`.
- Inferencia independiente del framework mediante ONNX Runtime.
- Reentrenamiento y ajuste fino a partir de los pesos PyTorch (`state_dict`).
- Entrada en escala de grises con tamaño fijo de 160×55 píxeles.
- Salida en forma de cinco distribuciones de probabilidad (una por posición) sobre 36 clases.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia en cursos de machine learning: sirve como ejemplo completo de extremo a extremo (generación de datos sintéticos, entrenamiento CNN, validación y exportación ONNX) para ilustrar el flujo de trabajo en visión por computador.
- Prácticas de despliegue con ONNX Runtime: permite a estudiantes comparar latencia y portabilidad entre PyTorch y ONNX en hardware modesto, con un modelo de tamaño reducido.
- Ejercicios de aumentación de datos: el dataset sintético con líneas de ruido permite experimentar con rotaciones, desplazamientos y variaciones de contraste para medir su impacto en la precisión por carácter.
- Demostración de ajuste fino: los pesos `.pt` permiten a alumnos reentrenar sobre variantes propias del generador sintético y comparar curvas de validación.
- Prototipado de pipelines de preprocesado de imagen: la normalización `((x/255) - 0.5) / 0.5` y el redimensionado a 160×55 sirven como plantilla reproducible en notebooks docentes.
- Benchmarking educativo de inferencia: útil para medir throughput de ONNX Runtime en CPU frente a GPU en un modelo pequeño, sin las complicaciones de un modelo fundacional.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Precision por caracter (validacion) | ~96,8 % |
| Precision secuencia completa de 5 caracteres (validacion) | ~89,6 % |
| Tamano del conjunto de validacion | 1.000 imagenes |

No se han publicado resultados frente a benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet, etc.) en la informacion disponible, ni comparaciones con otros modelos de reconocimiento de CAPTCHA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB reportado) y la naturaleza del modelo, se espera que quepa holgadamente en cualquier GPU consumer, aunque no se aportan cifras.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 3060, RTX 4090, etc.), aunque sin datos oficiales de consumo de memoria.
- Opciones de despliegue: ONNX Runtime (documentado en la model card) y PyTorch (para carga del `state_dict`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador CNN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SYNTHETIC_CAPTCHA_CNN (wwwbhushan) | CNN de clasificacion | no disponible | Imagen 160×55 px, 5 clases | Apache 2.0 / MIT (discrepancia) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (reconocimiento de CAPTCHA sintético con CNN) en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente educativo: el autor advierte que no está diseñado para sistemas en vivo ni para CAPTCHA reales.
- Entrenado solo con datos sintéticos generados por Python; el rendimiento sobre CAPTCHA del mundo real (con distorsiones, fuentes y ruidos distintos) es desconocido y probablemente muy inferior.
- Precisión de secuencia completa limitada (~89,6 % en validación), insuficiente para aplicaciones que requieran alta fiabilidad.
- Riesgo de sobreajuste al generador sintético concreto empleado; no se documenta la variabilidad del dataset.
- Posible uso dual: aunque el autor lo restringe a fines educativos, un modelo de reconocimiento de CAPTCHA podría emplearse para eludir mecanismos de seguridad; conviene revisar las implicaciones éticas y legales antes de cualquier uso.
- Discrepancia de licencia en la model card: el frontmatter declara Apache 2.0 y MIT de forma simultánea; debe aclararse antes de un uso comercial.
- No se documentan sesgos, pero al operar sobre un alfabeto latino y dígitos, no cubre otros sistemas de escritura.
- Sin información sobre parámetros, arquitectura detallada ni proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wwwbhushan/SYNTHETIC_CAPTCHA_CNN
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
