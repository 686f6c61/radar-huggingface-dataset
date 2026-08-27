# veyra-ai/Veyra2-Blueberry-5M-Base-ONNX

## Resumen

Veyra2-Blueberry-5M-Base-ONNX es una conversión a formato ONNX del modelo base Veyra2-Blueberry-5M-Base, desarrollado por Veyra AI, una organización centrada en modelos de lenguaje pequeños y eficientes para inferencia en CPU. Con solo 5 millones de parámetros, este modelo está diseñado para entornos con recursos muy limitados, como navegadores o dispositivos embebidos, y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo de lenguaje causal (causal LM) no afinado para instrucciones, por lo que su uso principal es la generación de texto libre, la experimentación educativa y el prototipado rápido. Su arquitectura se basa en la familia Qwen3, según los metadatos del repositorio, aunque no se ofrecen detalles técnicos adicionales. El modelo solo soporta inglés y su tamaño de contexto no está documentado.

La relevancia de este modelo radica en su extrema ligereza: puede ejecutarse en CPU sin necesidad de GPU, lo que lo convierte en una opción interesante para aplicaciones de IA local, demostraciones y proyectos de investigación que requieran un modelo mínimo pero funcional. Al ser una conversión ONNX, es compatible con entornos como Transformers.js, lo que facilita su despliegue en aplicaciones web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3, según tags) |
| Parametros totales | 5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, precisión no especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (también safetensors en el repo) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentación disponible, pero los metadatos indican que se basa en la familia Qwen3, lo que sugiere un transformer decoder-only con atención causal. Al ser un modelo de 5M de parámetros, es extremadamente compacto, probablemente con un número reducido de capas y dimensiones de embedding.

El entrenamiento se realizó sobre una combinación de datasets públicos de alta calidad: HuggingFaceFW/fineweb-edu, HuggingFaceFW/finephrase, mlfoundations/dclm-baseline-1.0 y HuggingFaceTB/finemath. No se menciona el número de tokens de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO. Al ser un modelo base, no ha pasado por ajuste fino con instrucciones, por lo que su comportamiento es el de un modelo de lenguaje puro.

## Capacidades

- Generación de texto causal: puede continuar secuencias de texto de forma autónoma, aunque con calidad limitada debido a su tamaño.
- Completado de texto: útil para tareas de autocompletado en entornos con restricciones de recursos.
- Razonamiento básico: muestra resultados modestos en tareas de sentido común y razonamiento, como se refleja en los benchmarks.
- Soporte de tool calling: no disponible, al ser un modelo base sin ajuste para funciones.
- Soporte de agentes: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: ninguna adicional (sin visión, audio o modo thinking).

## Casos de uso

- Prototipado de aplicaciones de IA local: al ser extremadamente ligero, se puede integrar en aplicaciones de escritorio o móviles para probar conceptos de generación de texto sin necesidad de infraestructura en la nube.
- Educación y aprendizaje: ideal para estudiantes que quieran entender el funcionamiento interno de un transformer, ya que su tamaño permite inspeccionar pesos y activaciones fácilmente.
- Generación de texto en navegador: gracias a su formato ONNX y compatibilidad con Transformers.js, puede ejecutarse directamente en el navegador para demos interactivas o asistentes de escritura simples.
- Autocompletado de código o texto en entornos embebidos: aunque no está afinado para código, puede servir como base para fine-tuning en tareas específicas con datasets pequeños.
- Investigación en modelos pequeños: sirve como punto de partida para estudiar técnicas de destilación, cuantización o eficiencia en modelos de menos de 10M de parámetros.
- Pruebas de pipelines de inferencia: su bajo coste computacional permite validar infraestructuras de despliegue (por ejemplo, servidores ONNX Runtime) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los resultados presentados a continuación provienen de la model card del autor, obtenidos con lm-evaluation-harness local. No se han verificado de forma independiente.

| Benchmark | Métrica | Valor |
|---|---|---|
| SciQ | Accuracy | 67.6 |
| SciQ | Normalized Accuracy | 59.5 |
| PIQA | Normalized Accuracy | 54.62 |
| ARC-Easy | Normalized Accuracy | 33.46 |
| ARC-Challenge | Normalized Accuracy | 21.67 |
| HellaSwag | Normalized Accuracy | 27.62 |
| Winogrande | Accuracy | 51.62 |
| OpenBookQA | Accuracy | 13.8 |
| OpenBookQA | Normalized Accuracy | 25.6 |
| BoolQ | Accuracy | 45.41 |
| ArithMark-3.0 | Accuracy | 36.4 |

Estos valores son bajos en comparación con modelos de mayor tamaño, lo que es esperable para un modelo de 5M de parámetros. No se dispone de comparativas con otros modelos de la misma escala.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en FP32, por lo que puede ejecutarse en cualquier GPU, aunque no es necesario.
- GPU recomendada: ninguna; el modelo está diseñado para CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna, pero no se requiere.
- Opciones de despliegue: ONNX Runtime, Transformers.js, llama.cpp (si se convierte a GGUF), o cualquier framework que soporte ONNX.
- Latencia y throughput: no se han publicado datos, pero al ser un modelo de 5M, la generación es prácticamente instantánea en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de 5M de parámetros. Modelos como TinyLlama (1.1B) o SmolLM (135M) son significativamente más grandes y no son comparables en recursos. Se recomienda consultar el catálogo de Veyra AI para otros modelos de su familia.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe evaluarse como un asistente conversacional; no sigue instrucciones y puede generar respuestas incoherentes.
- Alto riesgo de alucinación y repetición: el autor advierte explícitamente que el modelo puede alucinar, repetir texto y fallar en tareas factuales o matemáticas simples.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado: no se especifica la longitud máxima de contexto, pero por el tamaño del modelo es probable que sea muy reducido (típicamente 512 o 1024 tokens).
- Sin capacidades de tool calling ni agentes: no es adecuado para tareas que requieran interacción con APIs o razonamiento multi-paso.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución a Veyra AI según la model card.

## Enlaces

- Modelo ONNX: https://huggingface.co/veyra-ai/Veyra2-Blueberry-5M-Base-ONNX
- Modelo base: https://huggingface.co/veyra-ai/Veyra2-Blueberry-5M-Base
- Perfil de Veyra AI: https://huggingface.co/veyra-ai
