# suayptalha/QwenGenesis-4B

## Resumen

QwenGenesis-4B es un artefacto experimental publicado por Şuayp Talha Kocabay (@suayptalha) que combina los pesos originales de Qwen/Qwen3.5-4B con un conjunto adicional de tensores compilados denominados `genesis_circuit.*`. El objetivo declarado no es el de un modelo de lenguaje convencional, sino el de explorar "vida artificial como computación neuronal": un mundo celular espacial determinista en el que se simulan nacimiento, depredación, mutación, colapso ecológico y selección evolutiva mediante circuitos neuronales compilados.

El repositorio contiene un único `model.safetensors` de 9,4 GB que preserva las claves y valores originales de Qwen3.5-4B (4.659.921.312 parámetros) y añade tensores Genesis bajo un espacio de nombres separado para evitar colisiones. La model card es explícita al señalar que el modelo base no es en sí mismo un decodificador nativo de QwenGenesis entrenado ni verificado, y que la inferencia de texto estándar con `AutoModel` no avanza el ecosistema; este se ejecuta mediante el código Python incluido en el repositorio.

Es relevante ahora como ejemplo de reutilización creativa de pesos abiertos con licencia Apache-2.0 y como banco de pruebas reproducible de dinámicas tipo autómata celular implementadas con operaciones SwiGLU. No obstante, sus cifras de adopción (0 descargas, 0 likes en el momento de la consulta) y la ausencia de benchmarks de lenguaje indican que se trata de una publicación de nicho, orientada a investigación exploratoria y no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-4B) con circuitos Genesis compilados adicionales; activación SwiGLU |
| Parametros totales | 4.659.921.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precisión original) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 9,4 GB) |

## Arquitectura y entrenamiento

La base es un transformer decoder tipo Qwen3.5-4B con activación SwiGLU, cuyos tensores se conservan sin sustitución. Sobre ese contenedor se añaden tensores `genesis_circuit.*` que implementan, según el autor, un mundo celular determinista con nacimiento, depredación, mutación y colapso ecológico. El repositorio incluye `qwengenesis/` (mundo determinista, circuito compilado, inferencia CUDA y renderizador cinematográfico), `qwengenesis_native/` (implementación SwiGLU estilo Qwen y tests comparativos), además de `scripts/` y `tests/` para reproducibilidad.

No se documenta un proceso de entrenamiento con datos de texto, número de tokens, composición del dataset ni fases de RLHF/DPO para el modelo base. La innovación técnica declarada es la compilación de dinámicas de autómata celular en pesos neuronales: el autor reporta una concordancia de estado binario entre el circuito SwiGLU y la referencia sobre 3 × 100 pasos en un mundo de 24×24, con una diferencia absoluta máxima de punto flotante de ~7,13×10⁻¹⁵, y una comparación del FFN completo de Qwen3.5 en A100 durante 3 × 10 ticks con concordancia binaria. El autor advierte que el decoder preentrenado completo no fue verificado por paridad.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen3.5-4B (pipeline `text-generation`).
- Simulación de vida artificial determinista sobre un mundo celular espacial: nacimiento, depredación, mutación, colapso ecológico y selección evolutiva.
- Ejecución de escenarios de referencia: `predator_apocalypse` (70 pasos), `ecological_collapse` (150 pasos) y `golden_evolution` (180 pasos) sobre mundos de 96×96.
- Inferencia en CUDA del circuito compilado mediante el código incluido en `qwengenesis/`.
- Renderizado de vídeo de las simulaciones (MP4) con interpolación visual entre estados.
- Verificación reproducible mediante scripts comparativos y tests incluidos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés (`en`) según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en vida artificial: ejecutar los escenarios incluidos (`golden_evolution`, `ecological_collapse`, `predator_apocalypse`) para estudiar dinámicas de selección y colapso en un mundo celular determinista, con estados binarios reproducibles.
- Verificación de implementaciones SwiGLU: usar `qwengenesis_native/` y los tests comparativos para validar que una implementación propia de SwiGLU reproduce el circuito de referencia con diferencias de punto flotante del orden de 10⁻¹⁵.
- Docencia de computación neuronal: ilustrar cómo una dinámica de autómata celular puede expresarse como operaciones tensoriales compiladas y ejecutarse en GPU, con vídeos demostrativos como material didáctico.
- Reproducibilidad de experimentos: los scripts `run_checkpoint.py` y `scripts.run_native_scenarios` permiten repetir ejecuciones con semilla fija (`--seed 93`) y tamaños de mundo configurables, lo que facilita la auditoría por terceros.
- Generación de texto en inglés con el modelo base: al conservarse los tensores de Qwen3.5-4B, puede cargarse con `AutoModel` para tareas conversacionales en inglés, aunque el autor advierte que esa vía no activa el ecosistema Genesis.
- Prototipado de renderizado científico: el renderizador incluido en `qwengenesis/` sirve como base para visualizar estados de simulación con interpolación y exportarlos a MP4.
- Estudio de reutilización de pesos abiertos: caso práctico de cómo añadir tensores nuevos a un checkpoint Apache-2.0 sin sobrescribir las claves originales, útil para diseñar esquemas de extensión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas internas de la simulación:

| Metrica | Resultado reportado |
|---|---|
| Concordancia SwiGLU vs referencia (3 × 100 pasos, 24×24) | Estado binario concordante; diferencia absoluta máxima ~7,13×10⁻¹⁵ |
| Comparación FFN Qwen3.5 completo en A100 (3 × 10 ticks) | Concordancia de estado binario |
| Escenarios 96×96 | `predator_apocalypse` 70 pasos, `ecological_collapse` 150 pasos, `golden_evolution` 180 pasos; frames de salida coincidentes con la referencia |
| Trayectoria de depredadores (apocalypse) | 2.795 en paso 10; 1.523 en paso 20; 91 en paso 30; 0 en paso 40 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y del circuito Genesis; en la práctica, se recomienda al menos 16 GB para ejecutar los escenarios con holgura.
- El autor reporta ejecución de la comparación del FFN completo de Qwen3.5 en una NVIDIA A100, lo que confirma soporte para GPU de centro de datos.
- GPU consumer: viable en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5090); en tarjetas de 8-12 GB requeriría cuantización, que no se distribuye en el repositorio.
- Opciones de despliegue: el repositorio está pensado para ejecutarse con PyTorch, NumPy, safetensors, Pillow, imageio e imageio-ffmpeg; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenGenesis-4B | 4,66 B | no disponible | Qwen3.5-4B + circuitos de vida artificial | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | ~4 B | no disponible en la informacion | Modelo de lenguaje conversacional | Apache-2.0 | Hugging Face (modelo base) |
| Alternativas de simulacion de vida artificial con redes neuronales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo base no es un decodificador nativo de QwenGenesis entrenado ni verificado, y que la inferencia de texto con `AutoModel` no avanza el ecosistema.
- El decoder preentrenado completo no fue verificado por paridad; solo se verificaron el circuito SwiGLU y el FFN a nivel de estado binario.
- El movimiento visual de los vídeos es interpolado por el renderizador y no constituye una medición de movimiento individual independiente.
- Idiomas: únicamente inglés según la model card; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: aplicable a la generación de texto heredada de Qwen3.5-4B, no evaluada en este repositorio.
- Sesgos: no documentados; al no haberse realizado un entrenamiento adicional ni una evaluación de sesgos, se heredan los del modelo base sin análisis específico.
- Adopción mínima (0 descargas, 0 likes) y ausencia de benchmarks de lenguaje, lo que desaconseja su uso en producción sin validación propia.
- Licencia Apache-2.0 permite uso comercial, pero el código y los tensores Genesis se distribuyen sin garantías y con verificación parcial.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suayptalha/QwenGenesis-4B
- Perfil del autor: https://huggingface.co/suayptalha
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Vídeo Golden Evolution: https://huggingface.co/suayptalha/QwenGenesis-4B/blob/main/videos/golden_evolution.mp4
- Vídeo Ecological Collapse: https://huggingface.co/suayptalha/QwenGenesis-4B/blob/main/videos/ecological_collapse.mp4
- Vídeo Predator Apocalypse: https://huggingface.co/suayptalha/QwenGenesis-4B/blob/main/videos/predator_apocalypse.mp4
