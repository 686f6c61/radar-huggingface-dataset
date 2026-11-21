# trymirai/Qwen3.8-27B-S-experimental

## Resumen

Mirai Qwen3.8-27B-S es una cuantización de alta calidad del modelo Qwen3.8-27B de Alibaba Qwen, desarrollada por Mirai Labs (cuenta de Hugging Face `trymirai`). El objetivo es reducir el peso del modelo para permitir inferencia local eficiente en Apple silicon, manteniendo una divergencia baja respecto al modelo profesor original. El checkpoint se distribuye con la librería propietaria `uzu` y está pensado para ejecutarse mediante el runtime `mirai`, disponible vía Homebrew en macOS.

El dato más relevante es la compresión: a partir de un modelo base de 27B de parámetros, el checkpoint cuantizado almacena 8.682.731.728 parámetros reales (8,68B) en un repositorio de 95,9 GB. La cuantización emplea una mezcla de precisión por matriz (2-bit y 8-bit según el tensor), con técnicas QTIP-style de trellis-coded quantization, rotaciones estructuradas de Kronecker y un codebook de retícula D4 para los embeddings de entrada.

La relevancia actual radica en que demuestra que es posible llevar un modelo de escala 27B a hardware de consumo (Apple silicon) con una calidad medida: KL de 0,0803292 y una tasa de acuerdo top-1 del 90,62 % frente al profesor, evaluada sobre 20 conversaciones y 14.456 tokens de continuación generados por el profesor. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 8.682.731.728 (checkpoint cuantizado); modelo base: 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (embeddings de entrada con retícula D4), 8-bit (tags), 4-bit enteros con group size 64 y transformadas Hadamard block-32 (cabeza de salida); precision variable por matriz elegida según KL medido |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento (PTQ) seguida de destilación consciente de la cuantización (quantization-aware distillation), incluyendo una ronda adicional sobre los propios turnos de agente del modelo. La técnica de cuantización es QTIP-style trellis-coded quantization, en la que la precisión de bits de cada matriz se selecciona a partir de la KL medida respecto al profesor. Para reducir los valores atípicos de los pesos se aplican rotaciones aleatorias con estructura de Kronecker.

Los componentes específicos documentados son: el embedding de entrada usa un código de retícula D4 de 2 bits; la cabeza de salida usa enteros de 4 bits con group size 64 y transformadas de Hadamard de bloque 32. Los pesos de visión, MTP y speculator quedan excluidos del cálculo de tamaño del checkpoint. La arquitectura subyacente es la del modelo base Qwen3.8-27B; la model card no detalla número de tokens de entrenamiento ni composición del dataset del modelo original.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Razonamiento y continuaciones multi-turno: la evaluación KL se realizó sobre conversaciones, lo que indica uso conversacional.
- Turnos de agente: la destilación incluyó una ronda sobre los turnos de agente del propio modelo, lo que sugiere soporte de comportamiento agentico heredado del base.
- Capacidades del modelo base (código, matemáticas, tool calling, multilingüismo, modo thinking, visión): no disponibles en la información proporcionada; deben consultarse en la model card de Qwen/Qwen3.8-27B.
- Inferencia local en Apple silicon mediante el runtime `mirai`.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal documentado. Se instala `mirai` vía Homebrew y se ejecuta `mirai --model trymirai/Qwen3.8-27B-S`, aprovechando la compresión a 8,68B parámetros efectivos para reducir requisitos de memoria unificada.
- Asistentes conversacionales en local: la evaluación sobre 20 conversaciones y 14.456 tokens de continuación respalda su uso en diálogo multi-turno, aunque la ventana de contexto no está documentada.
- Prototipado de agentes en estación de trabajo: la ronda de destilación sobre turnos de agente indica que el checkpoint conserva comportamiento agentico del base, útil para probar flujos de agente sin depender de la nube.
- Desarrollo y pruebas offline: al ejecutarse localmente en macOS, permite iterar en entornos sin conectividad o con requisitos de privacidad de datos.
- Evaluación de técnicas de cuantización: el checkpoint y la herramienta `romakl` publicada por el autor permiten reproducir la medición de KL y comparar contra otros checkpoints de la misma familia.
- Integración en pipelines de generación de texto vía la librería `uzu`: adecuado para proyectos que ya usan ese ecosistema en lugar de vLLM o llama.cpp.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL divergence (romakl, set por defecto: 20 conversaciones, 14.456 tokens) | 0,0803292 |
| Acuerdo top-1 con el profesor | 90,62 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores miden fidelidad respecto al modelo profesor, no calidad absoluta de la tarea.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 95,9 GB; el checkpoint declara 8,68B parámetros reales. El requisito exacto de memoria unificada no está documentado en la información disponible.
- Plataforma soportada: exclusivamente Apple silicon según la model card ("Currently only Apple silicon inference is supported").
- GPU recomendadas: no disponibles; no se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no aplica según la documentación; el runtime `mirai` está orientado a Mac.
- Opciones de despliegue: runtime `mirai` (Homebrew) o compilación desde el repositorio `trymirai/uzu`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/runtime | Notas |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-S | 8,68B (checkpoint cuantizado; base 27B) | no disponible | Apache 2.0 | safetensors + `uzu`/`mirai` | Solo Apple silicon; KL 0,0803 vs profesor |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | safetensors | Modelo profesor sin cuantizar |
| Bonsai 2 packings | no disponible | no disponible | no disponible | Prism runtime (llama.cpp fork) | Mencionado en la model card como comparación de tamaño/KL |

No se dispone de datos de benchmarks ni de otros checkpoints comparables en la información proporcionada para establecer una comparativa de rendimiento por tarea.

## Limitaciones y advertencias

- Soporte de plataforma restringido: solo Apple silicon; no hay inferencia documentada en GPU NVIDIA ni en CPU genérica.
- Dependencia de un runtime propietario (`uzu`/`mirai`): no es compatible con el ecosistema estándar (llama.cpp, vLLM, TGI), lo que limita la portabilidad.
- Naturaleza experimental: el nombre del checkpoint incluye "experimental"; la calidad no está validada con benchmarks estándar.
- Pérdida de fidelidad: KL de 0,0803 y acuerdo top-1 del 90,62 % implican que aproximadamente 1 de cada 10 tokens difiere del profesor; el riesgo de degradación en tareas sensibles no está cuantificado.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingüe del checkpoint.
- Longitud de contexto no documentada: no se puede garantizar el uso en tareas de contexto largo.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos: no documentados; deben asumirse los del modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime `mirai`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-S-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Herramienta de evaluación `romakl`: https://github.com/trymirai/romakl
- Repositorio `uzu` (guía de ejecución): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Runtime Prism (fork de llama.cpp): https://github.com/PrismML-Eng/llama.cpp
