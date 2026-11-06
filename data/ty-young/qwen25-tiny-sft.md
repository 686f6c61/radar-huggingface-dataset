# ty-young/qwen25-tiny-sft

## Resumen

Qwen2.5-tiny-sft es una compilación reducida de referencia del modelo Qwen2.5-0.5B-Instruct, publicada por el usuario ty-young en Hugging Face. No se trata de un modelo entrenado para producción, sino de una versión con solo 3 capas y una dimensión oculta de 384, que suma 29,1 millones de parámetros. Su propósito declarado es servir como banco de pruebas para pipelines de CI y smoke tests, no para evaluaciones de calidad.

El modelo mantiene la arquitectura Qwen2ForCausalLM de la familia Qwen2.5, con una ventana de contexto declarada de 32.768 tokens y pesos en float16. Es relevante porque permite validar flujos de carga, tokenización e inferencia con la API de transformers (incluido `trust_remote_code`) sin necesidad de descargar checkpoints de gran tamaño.

Conviene subrayar que los pesos no se distribuyen como ficheros de checkpoint: se inicializan a partir de la configuración en tiempo de carga. Por tanto, el modelo no produce salidas coherentes ni útiles; es un artefacto de ingeniería para verificar que el stack funciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 29,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos se inicializan desde la configuracion; no se distribuye checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con 3 capas y dimensión oculta de 384, según la tabla de capas indicada en la model card y en `config.json`. La precisión declarada es float16. El modelo se presenta como una "reduced-layer reference build", es decir, una versión con menos capas que el Qwen2.5-0.5B-Instruct original, pensada para pruebas de humo y CI.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO. La model card indica que los ficheros publicados son la definición del modelo y su configuración, y que los pesos se inicializan desde la configuración al cargar, por lo que no hay un checkpoint entrenado descargable. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto: la arquitectura soporta la tarea de `text-generation`, pero al no haber pesos entrenados las salidas no son coherentes.
- Razonamiento, código y matemáticas: no disponible; no hay evidencia de capacidades reales.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Smoke tests de pipelines de CI: cargar el modelo con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` para verificar que el entorno de transformers, la tokenización y el forward pass funcionan antes de desplegar modelos reales.
- Validación de integraciones con `transformers`: comprobar que la versión de la librería y el `config.json` son compatibles sin descargar checkpoints pesados.
- Pruebas en CPU: al ser un modelo de 29,1 M de parámetros en float16, se puede ejecutar en CPU para validar flujos de inferencia sin GPU.
- Verificación de tablas de capas: comparar la tabla de capas de `config.json` con la esperada para detectar regresiones en herramientas de conversión o serialización.
- Pruebas de empaquetado y distribución: validar que los scripts de descarga, carga y ejecución funcionan con un artefacto pequeño antes de aplicarlos a modelos de mayor tamaño.
- Desarrollo de utilidades de perplejidad o evaluación: usar el modelo como caso de prueba para herramientas que miden latencia, memoria o throughput, sabiendo que los resultados no reflejan calidad lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 29,1 M de parámetros en float16, el peso ronda los 58 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requieren GPU dedicadas; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (con `trust_remote_code=True`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ty-young/qwen25-tiny-sft | 29,1 M | 32.768 | Apache 2.0 | Hugging Face (sin checkpoint entrenado) |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 (según familia Qwen2.5) | Apache 2.0 | Hugging Face |
| Modelos tiny de referencia para CI | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría (modelos tiny de referencia para CI) no está disponible en la información proporcionada. El Qwen2.5-0.5B-Instruct se incluye como referencia de la familia base, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- No es un modelo entrenado: los pesos se inicializan desde la configuración, por lo que las salidas no son coherentes ni útiles para evaluación de calidad.
- Uso previsto limitado a pruebas de pipeline y CI; no debe emplearse en producción ni en evaluaciones sensibles a la calidad.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera texto con conocimiento; cualquier salida es esencialmente aleatoria.
- Limitaciones de contexto o idioma: se declara un contexto de 32.768 tokens, pero no hay evidencia de que el modelo lo aproveche; no se declaran idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es apto para producción por su naturaleza de referencia.
- Caveat importante: requiere `trust_remote_code=True` para cargar, lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/ty-young/qwen25-tiny-sft
