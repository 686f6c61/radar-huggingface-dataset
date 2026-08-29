# YauhenBichel/python-vibe-0.5b

## Resumen

`python-vibe-0.5b` es un adaptador LoRA público, entrenado sobre el modelo base `Qwen/Qwen2.5-Coder-0.5B-Instruct` en su versión cuantizada a 4 bits para MLX. El autor, YauhenBichel, lo presenta como una herramienta para generar borradores cortos de código Python en un flujo de trabajo de "vibe-coding", es decir, escritura rápida y poco formal de scripts. El adaptador se distribuye en formato `safetensors` y se carga mediante `mlx_lm` en entornos Apple Silicon.

El modelo resuelve el problema de obtener asistencia ligera de generación de código Python sin necesidad de ejecutar un modelo grande, aprovechando la eficiencia de un adaptador LoRA sobre un modelo base de 0.5B parámetros. Su relevancia radica en que permite integrar generación de código en flujos de trabajo locales con requisitos mínimos de hardware, aunque su alcance se limita a tareas sencillas y a un solo idioma (inglés). El repositorio incluye además un harness (`vibe.py`) y un guardián (`PythonVibeGuard`) que filtra código potencialmente inseguro (claves vacías, `curl|sh`, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-0.5B-Instruct (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | Adaptador en safetensors; modelo base en 4-bit MLX |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador), MLX (carga) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen2.5-Coder-0.5B-Instruct`, un modelo de lenguaje de 0.5B parámetros con arquitectura transformer decoder, especializado en generación de código. El adaptador LoRA se aplica a la versión cuantizada a 4 bits del modelo base, lo que reduce significativamente el uso de memoria y permite su ejecución en dispositivos Apple Silicon mediante la librería MLX. No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso exacto (número de tokens, composición, uso de RLHF/DPO). La model card indica que el checkpoint publicado corresponde al paso 100 de entrenamiento, y que un entrenamiento más prolongado provocó sobreajuste (overfit), por lo que este paso se considera el punto óptimo.

## Capacidades

- Generación de código Python en forma de borradores cortos y rápidos.
- Integración con un harness (`vibe.py`) que proporciona un REPL interactivo para probar el modelo.
- Filtrado de código inseguro mediante `PythonVibeGuard`, que detecta claves vacías, claves filtradas y patrones peligrosos como `curl|sh`.
- Soporte de carga mediante `mlx_lm` en macOS con MLX.
- En Linux/Windows sin MLX, se puede usar el modelo base (sin adaptadores) a través de Ollama, aunque sin las capacidades específicas del adaptador.
- No se mencionan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de snippets de Python en un editor de código: el adaptador puede sugerir funciones o bloques de código cortos mientras se escribe, gracias a su tamaño reducido y baja latencia en Mac.
- Prototipado rápido de scripts: un desarrollador puede pedir al modelo que genere un borrador de un script de automatización o procesamiento de datos, y luego revisarlo y ajustarlo manualmente.
- Asistente en terminal REPL: el harness `vibe.py` permite interactuar con el modelo en una sesión de línea de comandos, útil para consultas rápidas de sintaxis o lógica.
- Entornos de desarrollo con recursos limitados: al ser un adaptador sobre un modelo de 0.5B, puede ejecutarse en portátiles sin GPU dedicada, siempre que se use MLX en Mac o la versión base en CPU.
- Educación y aprendizaje de Python: el modelo puede generar ejemplos de código para explicar conceptos, aunque su limitación a inglés y a código simple reduce su utilidad en contextos avanzados.
- Integración en pipelines de CI/CD para validación de estilo: aunque no se menciona explícitamente, el adaptador podría usarse para generar plantillas de código que luego se revisan con linters, siempre que se controle la calidad mediante el guardián.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 0.5B en 4-bit, el uso de VRAM es muy bajo (estimación inferior a 1 GB en GPU, aunque no se proporcionan datos exactos).
- En Mac con Apple Silicon, se ejecuta mediante MLX sin necesidad de GPU dedicada; cualquier Mac con chip M1 o superior debería ser suficiente.
- En Linux/Windows, se puede usar el modelo base (sin adaptadores) a través de Ollama, que funciona en CPU o GPU con requisitos mínimos.
- Opciones de despliegue: `mlx_lm` (Mac), Ollama (base model), y el harness `vibe.py` incluido en el repositorio.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una generación rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| python-vibe-0.5b (adaptador) | 0.5B (base) | No disponible | Apache-2.0 | MLX/safetensors | Adaptador LoRA para código Python |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0.5B | 32K (según documentación oficial, no en la ficha) | Apache-2.0 | safetensors, GGUF, MLX | Modelo base sin adaptador, más general |
| CodeLlama-7B | 7B | 16K | Llama 2 license | safetensors, GGUF | Modelo más grande, requiere más recursos |

La comparativa se limita a modelos de código de tamaño pequeño; no se dispone de información sobre otros adaptadores LoRA similares en el momento de la consulta.

## Limitaciones y advertencias

- El adaptador está entrenado específicamente para generar borradores de código Python; su rendimiento en otros lenguajes o tareas de razonamiento general no está garantizado.
- La model card advierte que un entrenamiento más largo provocó overfit, lo que sugiere que el modelo puede tener una generalización limitada fuera de los patrones vistos en el entrenamiento.
- Solo soporta inglés; no hay soporte multilingüe.
- El adaptador no incluye capacidades de tool calling, agentes ni razonamiento multi-paso; se limita a generación de texto.
- El uso del harness `PythonVibeGuard` es necesario para evitar la generación de código inseguro, pero no es una garantía absoluta de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-0.5B-Instruct también es Apache-2.0, por lo que no hay restricciones adicionales.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que la calidad del código generado debe evaluarse empíricamente.

## Enlaces

- [HuggingFace - YauhenBichel/python-vibe-0.5b](https://huggingface.co/YauhenBichel/python-vibe-0.5b)
- [GitHub - YauhenBichel/python-vibe](https://github.com/YauhenBichel/python-vibe)
- [Modelo base - Qwen/Qwen2.5-Coder-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct)
