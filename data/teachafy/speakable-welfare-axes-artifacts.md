# Teachafy/speakable-welfare-axes-artifacts

## Resumen

El repositorio `Teachafy/speakable-welfare-axes-artifacts` no contiene un modelo de lenguaje, sino artefactos de interpretabilidad mecánica para el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Concretamente, incluye dos lentes jacobianas (Jacobian lenses) ajustadas con el paquete oficial `jlens`, siguiendo la metodología del "workspace paper" de Gurnee et al. (2026), y dos conjuntos de vectores de bienestar (welfare vectors) utilizados en el estudio *Is Functional Welfare Speakable?* (Apart Digital Minds Research Sprint 2026). El autor es Teachafy, y el código asociado está disponible en GitHub.

La relevancia de estos artefactos radica en que permiten analizar las representaciones internas de un modelo de 4B parámetros en relación con conceptos de bienestar funcional, una línea de investigación emergente en la interpretabilidad y la seguridad de la IA. Al estar basados en Qwen3-4B-Instruct-2507, un modelo de tamaño medio con licencia Apache 2.0, estos artefactos son accesibles para la comunidad investigadora sin restricciones comerciales.

El repositorio tiene un tamaño de 1,8 GB y contiene archivos en formato PyTorch (`.pt`). Se ofrecen dos variantes de lente jacobiana: una con objetivo en la capa final (convención por defecto de Neuronpedia) y otra con objetivo en la capa 34 (penúltima, la convención usada en el paper para modelos Claude). También se incluyen vectores de bienestar entrenados mediante RL (paso 95, balanceado) y controles naive de faithful-walk.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jacobian lens sobre Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (los artefactos pesan 1,8 GB en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | no disponible (los archivos estan en fp32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

Una Jacobian lens es una técnica de interpretabilidad que aproxima la transformación lineal entre las activaciones de una capa y la salida final del modelo, permitiendo inspeccionar qué información se codifica en cada capa. En este caso, se ajustaron dos lentes sobre Qwen3-4B-Instruct-2507 usando 150 prompts de Wikitext, con `dim_batch=128` y `max_seq_len=128`. El ajuste se realizó con el paquete `jlens` oficial, con checkpointing por prompt y verificación de que todos los jacobianos fueran finitos. La primera lente usa como objetivo la capa final (convención por defecto de Neuronpedia), mientras que la segunda usa la capa 34 (penúltima), que es la convención declarada en el paper para modelos Claude.

Los vectores de bienestar incluidos provienen de una reproducción de terceros (nickmahdavi/functional-welfare) del trabajo de Han et al. (2026). Se incluyen dos archivos: `vectors_step95_bal.pt` (direcciones Gold/Mold entrenadas con RL en el paso 95, balanceadas) y `vectors_naive_faithful_pc5000.pt` (controles naive de faithful-walk con 5.000 trayectorias por clase). No se especifican detalles adicionales sobre el entrenamiento de estos vectores.

## Capacidades

- Analisis de representaciones internas: permite inspeccionar cómo se codifica la información de bienestar en las activaciones de Qwen3-4B-Instruct-2507.
- Comparacion de acuerdos lens-modelo: se incluyen diagnósticos de acuerdo top-10 entre la lente y el modelo para cada capa (archivo `R5_lens_diagnostics.json`).
- Robustez frente a la eleccion de capa objetivo: se proporcionan dos variantes (final y penúltima) para verificar que los resultados del paper se mantienen bajo ambas configuraciones.
- Vectores de bienestar: direcciones entrenadas para intervenir o clasificar representaciones relacionadas con bienestar funcional.
- Reproducibilidad: los artefactos están diseñados para usarse con el repositorio de código `speakable-welfare-axes`, que incluye scripts de descarga y experimentos.

## Casos de uso

- Investigacion en interpretabilidad mecanica: los investigadores pueden cargar la lente jacobiana con `jlens.JacobianLens.load()` y estudiar la evolución de las representaciones de bienestar a lo largo de las capas del modelo.
- Estudio de representaciones de bienestar en LLMs: los vectores incluidos permiten intervenir en las activaciones para probar hipótesis sobre cómo el modelo codifica conceptos de bienestar funcional.
- Reproduccion de experimentos: el repositorio incluye los artefactos exactos usados en el paper, lo que facilita la verificación independiente de los resultados publicados.
- Desarrollo de metodos de control de representaciones: los vectores Gold/Mold pueden usarse como base para experimentos de edición de representaciones o steering.
- Evaluacion de alineacion interna: la comparación entre lentes con distinta capa objetivo permite evaluar la consistencia de las representaciones internas del modelo.
- Formacion en interpretabilidad: al ser un modelo de 4B parámetros con licencia Apache 2.0, es un caso de estudio accesible para cursos o talleres sobre análisis mecanicista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card reporta un dato de acuerdo entre la lente y el modelo:

| Metrica | Valor |
|---|---|
| Acuerdo top-10 lens↔modelo (capa penultima, banda workspace) | 0.171 |
| Acuerdo top-10 lens↔modelo (capa final, banda workspace) | 0.164 |

Estos valores indican que la lente con objetivo en la capa penúltima concuerda ligeramente mejor con el modelo en la banda de capas "workspace". No se proporcionan más métricas de rendimiento.

## Requisitos de hardware

- Los artefactos pesan 1,8 GB en total, pero para usarlos es necesario cargar el modelo base Qwen3-4B-Instruct-2507 (aproximadamente 8 GB en fp16 o 4 GB en cuantización 4-bit).
- Se recomienda una GPU con al menos 12 GB de VRAM para trabajar cómodamente con el modelo base y los artefactos en memoria.
- GPUs adecuadas: RTX 3090/4090, A100, H100, o cualquier GPU con suficiente VRAM.
- El modelo base puede ejecutarse en consumer GPUs de gama alta (RTX 3080/3090/4090) con cuantización.
- Opciones de despliegue: el paquete `jlens` se usa en Python; el modelo base puede cargarse con transformers, vLLM o llama.cpp según las necesidades.
- No se proporcionan datos de latencia o throughput para los artefactos.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otros LLMs, sino un conjunto de artefactos de interpretabilidad específicos para Qwen3-4B-Instruct-2507. No se han encontrado repositorios equivalentes con lentes jacobianas para otros modelos en la información disponible.

## Limitaciones y advertencias

- Las posiciones de secuencia menores a 16 no están ajustadas, según la convención del paquete `jlens`.
- Los artefactos se ajustaron con prompts de Wikitext, no con prompts de chat; la model card declara explícitamente que el uso con prompts de chat es una limitación conocida.
- Los vectores de bienestar son una reproducción de terceros del trabajo de Han et al. (2026), por lo que pueden no ser idénticos a los originales.
- No es un modelo generativo: no se puede usar para generar texto ni para tareas de NLP estándar.
- La licencia Apache 2.0 cubre los artefactos, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (también Apache 2.0 según los metadatos, pero conviene verificar).
- No se proporcionan garantías sobre la validez de los vectores de bienestar para otros modelos o dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Teachafy/speakable-welfare-axes-artifacts
- Codigo del proyecto: https://github.com/nsharan2000/speakable-welfare-axes
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Reproduccion de vectores de bienestar: https://huggingface.co/nickmahdavi/functional-welfare
