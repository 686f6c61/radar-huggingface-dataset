# UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora

## Resumen

DeepSeek-V4.1-Flash-1017-heretic-lora es un adaptador LoRA de rango 1 publicado por el usuario UnderTides sobre el modelo cuantizado sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw, a su vez derivado de DeepSeek-V4.1-Flash-1017 de DeepSeek. Su finalidad no es mejorar capacidades cognitivas, sino aplicar una ablación de la dirección de rechazo (refusal-direction ablation) mediante el método Heretic, reduciendo drásticamente las negativas explícitas del modelo base ante peticiones que este consideraba sensibles. El adaptador se calcula de forma analítica a partir de activaciones capturadas y de los pesos cuantizados, sin un entrenamiento por descenso de gradiente convencional.

El adaptador opera exclusivamente sobre el módulo de proyección de salida de atención `wo_b` en las capas 2 a 39 (indexación desde cero), con rango 1, alpha 1 y una fuerza de proyección de 2.5 incorporada en los factores. Se construye a partir de 4.000 muestras de activación (2.000 del lado de rechazo y 2.000 de peticiones ordinarias, equilibradas entre inglés y chino). El modelo base es multimodal (pipeline image-text-to-text) y está cuantizado en EXL3 a 2,7 bits por peso, lo que condiciona fuertemente su despliegue.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de abliteración aplicada a un modelo de gran tamaño y cuantizado; por otro, advierte de que el resultado es un modelo con las salvaguardas deliberadamente reducidas, pensado para investigación sobre alineación y seguridad, no para despliegue comercial sin control. La licencia declarada es MIT, aunque las implicaciones de uso recaen sobre quien lo despliega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal cuantizado EXL3; módulo objetivo `wo_b` (proyección de salida de atención), capas 2–39 |
| Parametros totales | No disponible (el adaptador es de rango 1; el modelo base completo no reporta cifra en la información disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (las entradas de captura se limitaron a 512 tokens; no se especifica la ventana del modelo base) |
| Tipos de cuantizacion | Base en EXL3 a 2,7 bits por peso; adaptador en FP32 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); base en EXL3 |
| Rango / alpha LoRA | 1 / 1 |
| Fuerza de proyección | 2,5 |
| Precisión de factores | FP32 |
| Normalización de filas | Desactivada |
| Tamaño del repo | 0,0 GB (adaptador de muy pequeño tamaño) |

## Arquitectura y entrenamiento

El adaptador no se entrena con gradiente descendente, sino que se deriva analíticamente. El procedimiento consta de tres fases. En la captura se ejecuta el modelo base en TP2 con el modo thinking desactivado y peticiones seriales sin caché, guardando el residual del último token del prompt tras el post-procesado mHC y antes de la inyección Engram de la capa siguiente: 40 capas × cuatro flujos mHC × 5.120 valores BF16, en fragmentos de 16 muestras con checksum. En el cómputo se promedian los cuatro flujos mHC en FP32 y se acumula la media de cada lado en FP64 sobre CPU; se normaliza la diferencia entre las medias del lado de rechazo y del lado ordinario, se elimina su componente a lo largo de la media ordinaria y se vuelve a normalizar para obtener la dirección `d`. En la exportación se decodifican los pesos cuantizados `wo_b` bloque a bloque y se construyen los factores de rango 1 para cada capa seleccionada.

Las fórmulas publicadas son: `u = normalize(mean_refusal - mean_ordinary)`, `g = normalize(mean_ordinary)`, `d = normalize(u - dot(u, g) * g)`, `A = d.T @ W` con forma [1, 8192], `B = -2.5 * d` con forma [5120, 1], `delta_W = B @ A` y `W_effective = W + delta_W`. La fuerza de proyección 2.5 queda incorporada en los factores, con `lora_alpha/r = 1`. La configuración publicada usa el conjunto completo de captura y se eligió entre siete candidatos que variaban fuerza, normalización y tamaño de muestra.

Los datos de captura se componen de 2.000 prompts del lado de rechazo (800 de Bahushruth/abliteration-harmful-enriched, 200 de mlabonne/harmful_behaviors y 1.000 de thu-coai/Safety-Prompts, con cuatro categorías muestreadas por igual: crimen y actividades ilegales, daño físico, privacidad y propiedad, e injusticia y discriminación) y 2.000 prompts ordinarios (700 de HuggingFaceH4/no_robots, 300 de mlabonne/harmless_alpaca y 1.000 de m-a-p/COIG-CQIA). Cada lado contiene 1.000 prompts en inglés y 1.000 en chino. Se aplicó deduplicación léxica entre fuentes, particiones agrupadas y muestreo emparejado por idioma y longitud con semilla 20261021. Existe además un conjunto de ajuste de 400 prompts y uno de evaluación de 600, con el mismo equilibrio. La procedencia se documenta en `data_provenance.json`.

## Capacidades

- Generación de texto y razonamiento en chino e inglés, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), según la etiqueta del modelo base.
- Modo thinking desactivable; el adaptador se construyó y evaluó con thinking desactivado.
- Respuesta a peticiones que el modelo base rechazaba: la tasa de rechazo explícito baja del 77,3 % al 0,7 % en inglés y del 22,0 % al 0,0 % en chino sobre el conjunto de evaluación reservado.
- Mantenimiento de la tasa de respuesta a peticiones ordinarias: 0 de 300 sin responder tanto en base como en adaptador.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada (no se documenta explícitamente para este adaptador).
- Capacidades de código y matemáticas preservadas a nivel de benchmark (véase la sección de rendimiento).

## Casos de uso

- Investigación sobre alineación y seguridad: el adaptador permite estudiar cómo varía la tasa de rechazo ante una ablación de dirección en un modelo grande y cuantizado, comparando base y adaptador con el mismo protocolo de evaluación (thinking desactivado, temperatura 0, presupuesto de 512 tokens).
- Auditoría de salvaguardas: sirve para medir la robustez de los filtros de rechazo del modelo base y documentar qué tipos de peticiones dejan de rechazarse tras la ablación, usando los conjuntos de evaluación reservados.
- Evaluación de técnicas de abliteración: al ser un adaptador de rango 1 calculado analíticamente, permite reproducir y comparar variantes de fuerza, normalización y tamaño de muestra (el autor seleccionó entre siete candidatos).
- Experimentación con cuantización extrema: el adaptador opera sobre una base EXL3 a 2,7 bits por peso en TP2 sobre dos DGX Spark, lo que lo convierte en un banco de pruebas para estudiar el efecto de la cuantización en técnicas de edición de pesos.
- Estudio comparativo de idiomas: con datos equilibrados en inglés y chino, permite analizar diferencias de comportamiento de rechazo entre ambos idiomas (77,3 % frente a 22,0 % en el base).
- Desarrollo de entornos de red teaming controlados: en un laboratorio aislado, sirve para generar respuestas que el modelo base bloqueaba y analizar patrones de fallo, siempre con revisión humana y sin exposición pública.
- Investigación sobre multimodalidad: al heredar la etiqueta image-text-to-text, permite explorar si la ablación de rechazo afecta también a entradas con imagen, aunque el autor no documenta evaluaciones específicas en ese dominio.

## Benchmarks y rendimiento

Resultados publicados por el autor, con base y adaptador en idénticas condiciones (thinking desactivado, temperatura 0, presupuesto de respuesta de 512 tokens, instrucción de respuesta concisa). Los rechazos explícitos se puntúan con marcadores léxicos bilingües sobre el conjunto reservado.

| Metrica | Base | Adaptador |
|---|---:|---:|
| Tasa de rechazo en inglés | 116/150 (77,3 %) | 1/150 (0,7 %) |
| Tasa de rechazo en chino | 33/150 (22,0 %) | 0/150 (0,0 %) |
| Prompts ordinarios sin responder | 0/300 | 0/300 |
| MMLU (subconjunto fijo de 500 preguntas) | 431/500 | 431/500 |
| GSM8K (subconjunto fijo de 100 preguntas) | 99/100 | 99/100 |
| MBPP (evaluación local con mapeo de nombres de función) | 56/100 | 57/100 |

La KL media del primer token sobre los prompts ordinarios reservados fue de 0,139215. En MBPP, el seguimiento mapea nombres de función identificables de forma única a la interfaz de test antes de ejecutar el código existente; seis salidas por modelo quedaron sin resolver. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El adaptador en sí es de tamaño despreciable (repo de 0,0 GB); el coste de hardware lo determina el modelo base cuantizado.
- El autor documenta el despliegue con el motor vLLM sudoingX/dgx-spark-deepseek-v41, con el parche de compatibilidad EXL3/multimodal LoRA incluido, en TP2 sobre dos DGX Spark.
- El adaptador debe colocarse en la misma ruta absoluta en ambos nodos.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: DGX Spark (según la documentación del autor); otras opciones no disponibles.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible; la base a 2,7 bits y el requisito de TP2 sugieren que no es un despliegue trivial en una sola tarjeta de consumo.
- Opciones de despliegue: vLLM con el parche específico del autor; llama.cpp, Ollama o TGI no se documentan para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo explícito (inglés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora | Adaptador rango 1 sobre base cuantizada | No disponible | 0,7 % (1/150) | MIT | Hugging Face |
| UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora-dev | Adaptador rango 1 sobre la misma base | No disponible | No disponible | No disponible | Hugging Face |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | Receta previa sobre la misma familia | No disponible | No disponible | No disponible | Hugging Face |
| sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw (base) | Base cuantizada EXL3 2,7 bpw | No disponible | 77,3 % (116/150) | No disponible | Hugging Face |

La comparativa se limita a variantes de la misma familia porque la información proporcionada no incluye modelos de otros autores con los que contrastar parámetros, contexto o rendimiento de forma fiable.

## Limitaciones y advertencias

- El adaptador reduce deliberadamente las salvaguardas del modelo base: la tasa de rechazo explícito cae del 77,3 % al 0,7 % en inglés y del 22,0 % al 0,0 % en chino. No debe desplegarse en entornos de cara al público sin filtros externos.
- Riesgo elevado de generar contenido dañino, ilegal o inseguro ante peticiones que el base bloqueaba; la evaluación solo mide rechazos explícitos mediante marcadores léxicos, no la calidad ni la seguridad del contenido generado.
- El adaptador se calculó sobre una base cuantizada a 2,7 bits por peso; los efectos de la cuantización sobre la ablación no están cuantificados en la información disponible.
- Solo se documentan evaluaciones en inglés y chino; no hay datos sobre otros idiomas.
- El modo thinking se desactivó en captura y evaluación; el comportamiento con thinking activado no está documentado.
- La evaluación se apoya en subconjuntos fijos (500 preguntas de MMLU, 100 de GSM8K, 100 de MBPP) y en un conjunto reservado de 600 prompts; no hay resultados en benchmarks completos.
- La licencia declarada es MIT, pero la responsabilidad legal y ética del uso recae en el desplegador; conviene revisar las condiciones del modelo base original de DeepSeek.
- Requiere un runtime específico (vLLM parcheado del autor) y TP2 sobre dos DGX Spark; no es un adaptador portable a cualquier stack sin trabajo adicional.
- El autor remite a la variante `-dev` (8.000 prompts, 17 grupos de dominio) para mayor cobertura; esta versión de 4.000 muestras tiene alcance más limitado.
- Existe riesgo de alucinación inherente al modelo base; la ablación no lo mitiga y puede agravarlo al eliminar negativas ante peticiones ambiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora
- Variante dev: https://huggingface.co/UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora-dev
- Modelo base cuantizado: https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Receta previa de pqhaz: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Heretic (v1.4.0): https://github.com/p-e-w/heretic/tree/v1.4.0
- Runtime vLLM para DGX Spark: https://github.com/sudoingX/dgx-spark-deepseek-v41
- Dataset Bahushruth/abliteration-harmful-enriched: https://huggingface.co/datasets/Bahushruth/abliteration-harmful-enriched
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset HuggingFaceH4/no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset thu-coai/Safety-Prompts: https://github.com/thu-coai/Safety-Prompts
- Dataset m-a-p/COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
