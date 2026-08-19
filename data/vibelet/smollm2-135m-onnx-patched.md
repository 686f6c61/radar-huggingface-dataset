# Vibelet/smollm2-135m-onnx-patched

## Resumen
El modelo `Vibelet/smollm2-135m-onnx-patched` es un derivado del export ONNX de SmolLM2-135M, un modelo de lenguaje compacto desarrollado por Hugging Face. El autor, Vibelet, ha modificado el grafo ONNX para exponer los tensores del residual-stream como salidas adicionales, de modo que una única pasada hacia adelante devuelve los 31 estados ocultos intermedios (embeddings más la salida de cada capa). Esta modificación no altera los pesos del modelo, que permanecen idénticos a los del export original.

El propósito declarado es alimentar un "gabinete de proyección por capa" en el lado del navegador, permitiendo visualizar o analizar las representaciones internas sin necesidad de descargar el modelo completo por cada visita. El modelo base, SmolLM2-135M, es un transformer decoder de 135 millones de parámetros diseñado para ejecutarse en dispositivos con recursos limitados, aunque la ficha técnica aquí presentada se centra en el derivado ONNX patcheado.

La relevancia de este modelo radica en su utilidad para investigación en interpretabilidad y análisis de representaciones, ya que facilita el acceso a las activaciones intermedias en un formato ligero y compatible con entornos de navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2) |
| Parametros totales | 135M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (archivo `model_int8.onnx`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (segun README del autor) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
El modelo base SmolLM2-135M es un transformer decoder con 30 capas y una dimensión oculta de 576, entrenado por Hugging Face sobre un corpus diverso de texto. El derivado patcheado no modifica la arquitectura ni los pesos; únicamente añade nodos de salida al grafo ONNX para capturar los tensores residuales en cada capa. Concretamente, expone las salidas de `input_layernorm` de las capas 0 a 29 y la salida de `norm` final, cada una con forma `[1, seq, 576]` en fp32. No se proporcionan detalles adicionales sobre el entrenamiento del modelo base en la información disponible.

## Capacidades
- Generación de texto y completado de secuencias, propias de un modelo de 135M parámetros.
- Exposición de estados ocultos intermedios (31 tensores residuales) en una sola pasada, lo que permite análisis de representaciones internas.
- Compatibilidad con entornos de inferencia ONNX, incluyendo navegadores mediante runtime como ONNX Runtime Web.
- No se documentan capacidades de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso
- Visualización de activaciones por capa: el patcheo permite extraer los hidden states de todas las capas sin ejecutar múltiples pasadas, ideal para herramientas de interpretabilidad en el navegador.
- Análisis de representaciones internas: investigadores pueden estudiar cómo evoluciona la representación del texto a lo largo de las capas, por ejemplo para detectar patrones de codificación sintáctica o semántica.
- Desarrollo de proyecciones lineales (probing): las salidas de capas intermedias pueden usarse como características para entrenar clasificadores ligeros que evalúen qué información se codifica en cada nivel.
- Aplicaciones educativas: demostraciones interactivas de cómo funciona un transformer, mostrando las representaciones internas en tiempo real.
- Prototipado de herramientas de análisis de modelos en el lado cliente: al ser un archivo de 0.1 GB, puede servirse estáticamente sin costes elevados de ancho de banda.
- Inferencia en dispositivos con recursos limitados: el modelo base es adecuado para tareas simples de generación de texto en CPU o GPUs de baja potencia, aunque el patcheo no añade mejoras de rendimiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Al ser un modelo de 135M parámetros en formato ONNX int8, puede ejecutarse en CPU sin GPU.
- La VRAM estimada para inferencia es inferior a 1 GB en fp32 y aún menor en int8; cabe en GPUs de consumo como una GTX 1060 o RTX 3050.
- Es adecuado para despliegue en navegador mediante ONNX Runtime Web, sin necesidad de servidor dedicado.
- Opciones de despliegue: ONNX Runtime, llama.cpp (si se convierte a GGUF), o directamente en aplicaciones web con `onnxruntime-web`.
- La latencia dependerá del hardware; en CPU moderna se esperan decenas de tokens por segundo, aunque no se dispone de mediciones concretas.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia, el modelo base SmolLM2-135M es comparable en tamaño a otros modelos pequeños como TinyLlama (1.1B) o Qwen2-0.5B, pero no se han facilitado resultados de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias
- El modelo base es pequeño y puede presentar alucinaciones, sesgos y errores de razonamiento en tareas complejas.
- La longitud de contexto no se especifica en la información proporcionada; se recomienda consultar la documentación del modelo base.
- El patcheo solo afecta a las salidas del grafo; no modifica el comportamiento del modelo ni corrige limitaciones del original.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el export ONNX original mantenga la misma licencia.
- No se garantiza la compatibilidad con todas las versiones de ONNX Runtime; el grafo patcheado puede requerir una versión específica.

## Enlaces
- Modelo patcheado: https://huggingface.co/Vibelet/smollm2-135m-onnx-patched
- Export ONNX original: https://huggingface.co/onnx-community/SmolLM2-135M-ONNX
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio SmolLM en GitHub: https://github.com/huggingface/smollm
