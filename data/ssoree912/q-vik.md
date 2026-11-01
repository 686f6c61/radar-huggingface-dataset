# ssoree912/Q-ViK

## Resumen

Q-ViK (Question-Guided Visual KV Cache Eviction) es un método de compresión de la caché KV para modelos de visión y lenguaje (VLM) de gran tamaño, desarrollado por Solhee Hwang y Jangho Kim en la Universidad de Kookmin y presentado en NeurIPS 2026. El repositorio de HuggingFace no contiene un modelo generativo completo, sino los checkpoints del *scorer* estudiante que implementa la política de expulsión de entradas visuales de la caché KV, condicionada por la pregunta del usuario. Se distribuye como complemento de dos VLM base: LLaVA-OneVision-Qwen2-7B-OV y LLaVA-1.5-7B.

El problema que resuelve es el coste computacional y de memoria que supone mantener en caché todos los tokens visuales durante la decodificación en un VLM. Q-ViK entrena un scorer ligero que, a partir únicamente de las representaciones de prefill, predice qué entradas visuales de la caché reutilizarán realmente los tokens de respuesta futuros. En inferencia, una sola pasada de scoring tras el prefill expulsa las entradas visuales de baja utilidad y conserva íntegra la caché de texto, sin necesidad de decodificación completa previa ni de trazas generadas.

Su relevancia radica en que permite reducir el coste de atención en VLM multimodales manteniendo la calidad, un aspecto crítico para despliegues con imágenes de alta resolución o contextos visuales largos. La licencia Apache 2.0 y su integración con `lmms-eval` facilitan la reproducibilidad de los experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Scorer ligero condicionado por pregunta sobre la caché KV de un VLM transformer (LLaVA-OneVision-Qwen2-7B-OV y LLaVA-1.5-7B) |
| Parametros totales | No disponible (el repo ocupa 1,6 GB e incluye dos checkpoints de scorer; no se detalla el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del VLM base; no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados de los VLM base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (PyTorch), junto con `config.json`, `train_config.json` y `train_log.jsonl` |

## Arquitectura y entrenamiento

Q-ViK se apoya en la observación de que, en decodificación offline con caché completa, existe una señal de atención respuesta-a-visual que identifica las entradas visuales de la caché KV que los tokens de respuesta futuros reutilizan. A partir de esa señal se entrena un scorer condicionado por la pregunta que predice dicha utilidad usando solo las representaciones de prefill. En inferencia, tras el prefill se ejecuta un único paso de scoring que expulsa las entradas visuales de baja utilidad y conserva todas las entradas de texto, sin *lookahead* de caché completa ni trazas generadas.

El repositorio contiene dos checkpoints de estudiante: `qvik_student_onevision/`, entrenado sobre LLaVA-OneVision-Qwen2-7B-OV con 600 muestras cada una de TextVQA, GQA y ScienceQA durante 20 épocas, y `qvik_student_llava15/`, entrenado sobre LLaVA-1.5-7B con 600 muestras cada una de TextVQA, ScienceQA y GQA durante 15 épocas. Cada carpeta incluye los pesos del scorer, su configuración de arquitectura, la configuración de entrenamiento y el log de entrenamiento. Los VLM base deben descargarse por separado.

## Capacidades

- Expulsión de caché KV visual condicionada por la pregunta del usuario en VLM multimodales.
- Predicción de utilidad de entradas visuales de la caché a partir de representaciones de prefill, sin decodificación completa previa.
- Conservación íntegra de la caché KV de texto durante la expulsión.
- Control del ratio de retención mediante el parámetro `keep_ratio` (por ejemplo, 0.5 en el ejemplo de la model card).
- Integración con `lmms-eval` para evaluación en tareas como TextVQA.
- Compatibilidad con dos familias de VLM: LLaVA-OneVision-Qwen2-7B-OV y LLaVA-1.5-7B.
- No es un modelo generativo autónomo: no realiza generación de texto, razonamiento, código ni tool calling por sí mismo; esas capacidades las aporta el VLM base.

## Casos de uso

- Despliegue de VLM en producción con presupuesto de memoria limitado: el scorer permite reducir las entradas visuales en caché a un ratio configurable (`keep_ratio`) tras el prefill, disminuyendo el coste de atención en cada paso de decodificación sin reentrenar el VLM base.
- Inferencia de LLaVA-OneVision sobre imágenes de alta resolución: al expulsar entradas visuales de baja utilidad se mitiga el crecimiento de la caché KV asociado a un gran número de tokens visuales.
- Evaluación académica de métodos de compresión de caché KV: los checkpoints y el código permiten reproducir experimentos en TextVQA, GQA y ScienceQA con `lmms-eval`.
- Sistemas de pregunta-respuesta sobre documentos e imágenes (VQA documental): el condicionamiento por pregunta permite priorizar las regiones visuales relevantes para la consulta concreta.
- Integración en pipelines de investigación sobre eficiencia en VLM: sirve como componente de expulsión de caché combinable con otras técnicas de aceleración.
- Prototipado de asistentes multimodales con latencia ajustada: al reducir la caché visual se disminuye el trabajo de atención por token generado, lo que puede traducirse en menor latencia en GPUs con memoria ajustada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (NeurIPS 2026, cita pendiente) para los detalles y resultados experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El scorer añade una sobrecarga ligera sobre el VLM base; el repo completo ocupa 1,6 GB e incluye dos checkpoints.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de la model card usa `device=cuda:0` con `batch_size 1`.
- Viabilidad en GPU de consumo: no confirmada; depende del VLM base (7B en ambos casos) y del ratio de retención configurado.
- Opciones de despliegue: el método se ejecuta mediante el repositorio de código propio (`qvik/eval/run_lmms_eval.py`) sobre `lmms-eval`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q-ViK (este repo) | Scorer de expulsión de caché KV visual | No disponible | No disponible | Apache 2.0 | HuggingFace + GitHub |
| LLaVA-OneVision-Qwen2-7B-OV | VLM base | 7B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace (lmms-lab) |
| LLaVA-1.5-7B | VLM base | 7B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace (liuhaotian) |

No se dispone de datos de rendimiento comparativo con otros métodos de compresión de caché KV en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y ejecutar el VLM base por separado; el repositorio solo contiene los pesos del scorer.
- Los checkpoints están entrenados específicamente para LLaVA-OneVision-Qwen2-7B-OV y LLaVA-1.5-7B; su transferencia a otros VLM no está documentada.
- El entrenamiento del scorer se realizó con 600 muestras por tarea (TextVQA, GQA, ScienceQA); el comportamiento fuera de esa distribución no está caracterizado.
- El ratio de retención (`keep_ratio`) introduce un compromiso entre ahorro de memoria y calidad de respuesta; no se documentan en la model card curvas de degradación.
- Riesgo de sesgos y alucinaciones: heredado del VLM base, no evaluado de forma independiente en esta información.
- Idiomas soportados: no especificados; dependen del VLM base.
- La cita del paper figura como "coming soon", por lo que los resultados experimentales no están disponibles en el repositorio.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los VLM base y de los datasets de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/ssoree912/Q-ViK
- Repositorio de código: https://github.com/ssoree912/Q-ViK
- VLM base LLaVA-OneVision-Qwen2-7B-OV: https://huggingface.co/lmms-lab/llava-onevision-qwen2-7b-ov
- VLM base LLaVA-1.5-7B: https://huggingface.co/liuhaotian/llava-v1.5-7b
