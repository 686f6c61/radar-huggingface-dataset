# speridlabs/iris-3b

## Resumen

Iris-3B es un modelo generativo de imagen en espacio de píxeles desarrollado por Sperid Labs. A diferencia de la mayoría de generadores de imagen contemporáneos, que operan en un espacio latente comprimido y dependen de un decodificador separado (VAE) para reconstruir la imagen, Iris-3B genera directamente cada píxel a través de la propia red. Con 2.987.511.888 parámetros, produce imágenes de aproximadamente un megapíxel (1024 píxeles de lado) a partir de un prompt de texto.

El modelo se plantea no solo como generador de imagen, sino como un "general vision learner": el mismo prior generativo en espacio de píxeles, afinado sin cambios arquitectónicos, sirve para tareas densas donde el detalle importa, como estimación de profundidad monocular y restauración y reescalado de imagen. El repositorio incluye las carpetas `depth/` y `upscaler/` con estos modelos afinados, además de una variante destilada `turbo/` que genera una imagen de 1024×1024 en unos 0,7 segundos en una H100 con solo 4 pasos.

La propuesta es relevante porque explora los modelos generativos en espacio de píxeles como alternativa a los modelos fundacionales de visión tipo DINOv2, evitando la pérdida de información que introduce un latente sesgado hacia la textura. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion en espacio de pixeles con flow matching (sin VAE ni espacio latente) |
| Parametros totales | 2.987.511.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

Iris-3B es un modelo de difusion que opera directamente en espacio de píxeles, es decir, la red genera la imagen completa sin pasar por un espacio latente comprimido ni por un decodificador VAE separado. Emplea flow matching como formulación de entrenamiento. Esta decisión de diseño busca evitar la pérdida de información asociada a los latentes comprimidos, que suelen estar sesgados hacia la textura, y preservar el detalle fino en la generación.

El condicionamiento textual se realiza mediante el codificador de texto Qwen3-VL-4B-Instruct, que se descarga automáticamente en la primera ejecución. El modelo base genera con ajustes por defecto de CFG 3 y 100 pasos de denoising, a relaciones de aspecto nativas de aproximadamente un megapíxel. La variante Turbo es una versión destilada de 4 pasos. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni de si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imagen texto-a-imagen en espacio de píxeles a resolución de aproximadamente un megapíxel (1024 píxeles).
- Generación a relaciones de aspecto nativas variables (retrato, paisaje, etc.).
- Estimación de profundidad monocular mediante el modelo afinado en `depth/`.
- Restauración de imagen y superresolución mediante el modelo afinado en `upscaler/`.
- Generación rápida con la variante destilada Turbo (4 pasos, ~0,7 s por imagen 1024×1024 en H100).
- Control de adherencia al prompt mediante escala CFG ajustable.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de imágenes de producto y marketing: el modelo produce imágenes de aproximadamente un megapíxel directamente en píxeles, lo que permite obtener detalle fino en texturas (piel, tejidos, materiales) útil para catálogos y creatividades publicitarias sin depender de un decodificador latente.
- Prototipado rápido de conceptos visuales: con la variante Turbo, un equipo de diseño puede iterar sobre prompts en menos de un segundo por imagen en una H100, acelerando la exploración de direcciones creativas.
- Retoque y restauración de fotografías: el modelo afinado en `upscaler/` permite reescalar y restaurar imágenes con detalle, adecuado para digitalización de archivos fotográficos o recuperación de material de baja resolución.
- Estimación de profundidad para pipelines 3D: el modelo de `depth/` proporciona mapas de profundidad monocular que pueden alimentar flujos de reconstrucción 3D, efectos de desenfoque por profundidad o composición en posproducción.
- Generación de arte conceptual y storyboards: la capacidad de seguir prompts detallados con estilos fotográficos y pictóricos (retrato, escultura, paisaje, fotografía nocturna) lo hace útil para previsualización en cine, videojuegos e ilustración.
- Investigación en modelos fundacionales de visión: al ser un prior generativo en espacio de píxeles, sirve como base para estudiar alternativas a DINOv2 en tareas densas de visión, con pesos y código abiertos bajo Apache 2.0.
- Aumento de datos sintéticos: la generación controlada por prompt permite crear datasets de imagen etiquetados por construcción para entrenar otros modelos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo texto-a-imagen: aproximadamente 12 GB; las carpetas `depth/` y `upscaler/` añaden unos 12 GB cada una y `turbo/` unos 6 GB (tamaño total del repo: 47,9 GB).
- Requiere GPU NVIDIA con CUDA.
- VRAM estimada para inferencia: no disponible de forma explícita; los pesos en safetensors de ~12 GB implican al menos esa cantidad de memoria, más el codificador de texto Qwen3-VL-4B-Instruct y las activaciones.
- GPU recomendadas: H100 (la model card cita ~0,7 s por imagen 1024×1024 con Turbo en una H100); no se detallan otras GPU.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: repositorio oficial de código (`github.com/speridlabs/iris-3b`) con script `scripts/sample.py`; se desconoce soporte para vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: Turbo genera una imagen 1024×1024 en aproximadamente 0,7 s en una H100 con 4 pasos; el modelo base usa 100 pasos por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris-3B | ~2,99 B | Difusion en espacio de pixeles, flow matching | ~1024 px | Apache 2.0 | Pesos en HF, codigo en GitHub |
| Modelos texto-a-imagen latentes (p. ej. familia Stable Diffusion) | no disponible | Difusion en espacio latente con VAE | no disponible | no disponible | no disponible |
| DINOv2 (referencia citada por el autor como alternativa para vision) | no disponible | Modelo fundacional de vision auto-supervisado | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un generador de imagen entrenado con datos no especificados, puede reproducir sesgos de representación presentes en esos datos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir detalles plausibles pero incorrectos, especialmente en texto dentro de la imagen, anatomía o estructuras complejas.
- No se especifican los idiomas soportados por el codificador de texto ni el alcance multilingüe de los prompts.
- Requiere GPU NVIDIA con CUDA; no se documenta soporte para CPU ni para aceleradores de otros fabricantes.
- El modelo base usa 100 pasos de denoising por defecto, lo que implica un coste computacional elevado frente a la variante Turbo.
- No se detallan requisitos mínimos de VRAM ni compatibilidad con GPU de consumo, lo que dificulta planificar despliegues en hardware limitado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias del codificador de texto Qwen3-VL-4B-Instruct y de los datos de entrenamiento, no detalladas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/speridlabs/iris-3b
- Paper: https://arxiv.org/abs/2610.09450
- Paper secundario citado en tags: https://arxiv.org/abs/2503.06674
- Pagina del proyecto: https://speridlabs.com/research/iris
- Codigo: https://github.com/speridlabs/iris-3b
- Demo: https://huggingface.co/spaces/speridlabs/iris-3b
- Demo Turbo: https://huggingface.co/spaces/speridlabs/iris-3b-turbo
- Licencia: https://www.apache.org/licenses/LICENSE-2.0
