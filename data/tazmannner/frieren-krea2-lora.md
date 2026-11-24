# tazmannner/Frieren-Krea2-LoRA

## Resumen

Frieren-Krea2-LoRA es un LoRA de imagen de rango 32 desarrollado por el usuario tazmannner para el modelo base Krea2 turbo, un generador de text-to-image. El adaptador aprende el estilo visual y el reparto de personajes del anime *Sousou no Frieren* a partir de 1.696 fotogramas de las temporadas 1 y 2, y cumple dos funciones: reproducir el estilo de fondos pintados y cel suave de la serie para cualquier prompt, y generar los personajes del anime mediante etiquetas dedicadas (`char_frieren`, `char_fern`, `char_stark` y 27 más).

El repositorio distribuye cuatro checkpoints del mismo entrenamiento (pasos 5.100, 9.000, 12.000 y 18.000), cada uno con un equilibrio distinto entre fidelidad al estilo y fidelidad al reparto. El autor recomienda el checkpoint de 12.000 pasos para estilo general y el de 18.000 para personajes, advirtiendo que este último está ligeramente sobreentrenado y filtra elementos de la serie en prompts vagos.

Se trata de un adaptador de nicho, sin descargas ni valoraciones en el momento de la consulta, orientado a flujos de trabajo en ComfyUI. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de personalización sobre un difusor concreto, y su utilidad depende por completo de la disponibilidad de Krea2 turbo y de su encoder de texto Qwen3-VL 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre difusor Krea2 turbo |
| Parametros totales | no disponible (repo de 1,0 GB, incluye pesos y ejemplos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; encoder de texto Qwen3-VL 4B) |
| Tipos de cuantizacion | no disponible; pesos en bf16 según el modelo base |
| Idiomas soportados | no disponibles (prompts en inglés en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre el difusor Krea2 turbo, que se usa junto al encoder de texto `qwen3vl_4b` (tipo `krea2`) y el VAE `qwen_image_vae`. El entrenamiento se realizó sobre 1.696 fotogramas extraídos de las temporadas 1 y 2 de *Sousou no Frieren*, con el objetivo doble de capturar el estilo pictórico de fondos y cel suave, y de asociar etiquetas de personaje a cada miembro del reparto.

El autor documenta la curva de pérdida del entrenamiento completo y señala que esta apenas se mueve entre checkpoints: las diferencias entre los cuatro ficheros publicados no se reflejan en la loss, sino en lo que cada uno renderiza. El checkpoint de 12.000 pasos aprende el estilo sin que el reparto se filtre en todo, mientras que el de 18.000 fija mejor los personajes a costa de cierto sangrado. El de 9.000 pasos conserva el estilo pero produce cielos planos con textura moteada, y el de 5.100 sigue el prompt de forma más laxa y falla en el vestuario de personajes secundarios.

## Capacidades

- Generación de imágenes text-to-image en el estilo visual de *Sousou no Frieren*: fondos pintados, cielos limpios y detalle nítido.
- Generación de personajes del anime mediante etiquetas: `char_frieren`, `char_fern`, `char_stark` y 27 etiquetas adicionales para el resto del reparto.
- Aplicación del estilo a personajes originales, paisajes y fan art de otras franquicias (checkpoint de 12.000 pasos).
- Reproducción precisa de vestuario, accesorios y rostros del reparto (checkpoint de 18.000 pasos).
- Composición de escenas amplias y planos generales, con resolución de aproximadamente 2 MP y soporte de 4 MP.
- Integración con flujos de ComfyUI mediante `LoraLoaderModelOnly` y grafos predefinidos incluidos en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades distintas de la imagen.

## Casos de uso

- Ilustración de fondos para proyectos de fan art: el checkpoint de 12.000 pasos genera paisajes y escenarios en el estilo de la serie sin introducir personajes no deseados, útil para ilustraciones de ambientación.
- Creación de arte de personajes consistentes: con el checkpoint de 18.000 pasos y las etiquetas `char_*`, se obtienen rostros, trajes y accesorios fieles al anime, adecuado para fichas de personaje o viñetas.
- Prototipado rápido de escenas para cómic o novela gráfica: los flujos de ComfyUI incluidos permiten iterar prompts a 12 pasos y cfg 1.0, con latencia baja sobre el modelo turbo.
- Generación de material promocional para comunidades de fans: el estilo reconocible de la serie aplicado a composiciones originales facilita carteles y banners sin reutilizar fotogramas.
- Exploración de estilo cruzado: aplicar el look de *Frieren* a personajes de otras franquicias usando el checkpoint de estilo, útil para estudios de dirección artística.
- Producción de imágenes en formato vertical y horizontal: el LoRA funciona a 1928x1088 y 1088x1928, lo que cubre portadas, stories y fondos de escritorio.
- Integración en pipelines de generación por lotes en ComfyUI: al ser un LoRA ligero sobre un modelo turbo, se puede encadenar con otros nodos de posprocesado o upscaling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta la curva de pérdida del entrenamiento y comparaciones cualitativas entre checkpoints, sin métricas cuantitativas como FID, CLIP score o evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base Krea2 turbo en bf16 y del encoder Qwen3-VL 4B, que en conjunto requieren una GPU de gama alta.
- GPU recomendadas: no disponible; por el tamaño del base y del encoder, se orienta a GPU con al menos 24 GB de VRAM, aunque el dato no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el repo no indica que quepa en tarjetas de 8-16 GB.
- Opciones de despliegue: ComfyUI es el único entorno documentado, con `LoraLoaderModelOnly` a fuerza 1.0 sobre `krea2_turbo_bf16`.
- Latencia y throughput: no disponibles; el sampler recomendado es de 12 pasos, euler, simple, cfg 1.0, lo que sugiere una generación rápida sobre el modelo turbo, pero sin cifras publicadas.
- Resolución de trabajo: aproximadamente 2 MP (1928x1088 o 1088x1928); también funciona a 4 MP (1632x2448).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Rango | Contexto de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Frieren-Krea2-LoRA | LoRA de imagen | Krea2 turbo | 32 | 1.696 fotogramas (T1 y T2) | no disponible | Hugging Face, 0 descargas |
| Frieren-H3-LoRA | LoRA de vídeo | MiniMax H3 | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| LoRA de estilo anime genérico | LoRA de imagen | variable | variable | no disponible | variable | ecosistema ComfyUI/Civitai |

La comparación cuantitativa con otras alternativas no está disponible: no se han publicado métricas del modelo ni de sus competidores directos en la información proporcionada. La única referencia explícita es el LoRA hermano para vídeo del mismo autor, que opera sobre un modelo base distinto y no es directamente comparable.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial del adaptador ni del modelo base Krea2 turbo; es un riesgo relevante para producción.
- El checkpoint de 18.000 pasos está sobreentrenado y filtra elementos de la serie en prompts vagos, lo que reduce el control creativo.
- El checkpoint de 9.000 pasos produce cielos planos con textura moteada y blotches de color.
- El checkpoint de 5.100 pasos es el más laxo en el seguimiento del prompt y falla en el vestuario de personajes secundarios.
- Riesgo de alucinación visual: al ser un modelo generativo de imagen, puede producir anatomía, perspectivas o detalles inconsistentes, especialmente en composiciones complejas.
- Sesgos: no documentados por el autor; al entrenarse solo con fotogramas de una serie japonesa, el estilo y el reparto están sesgados hacia esa estética y ese elenco.
- Dependencia total de Krea2 turbo y del encoder Qwen3-VL 4B: sin esos componentes el LoRA no es utilizable.
- El autor declara no poseer los derechos de la obra original; el uso del adaptador con personajes con copyright puede tener implicaciones legales según la jurisdicción.
- Sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia externa de calidad más allá de la galería del autor.
- Los prompts de ejemplo están en inglés; no se documenta el comportamiento en otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/tazmannner/Frieren-Krea2-LoRA
- LoRA hermano de vídeo (MiniMax H3): https://huggingface.co/tazmannner/Frieren-H3-LoRA
- Miniatura: https://huggingface.co/tazmannner/Frieren-Krea2-LoRA/resolve/main/media/thumbnail.jpg
- Curva de pérdida: https://huggingface.co/tazmannner/Frieren-Krea2-LoRA/resolve/main/media/training_loss.png
- Ejemplos de estilo (checkpoint 12.000): https://huggingface.co/tazmannner/Frieren-Krea2-LoRA/tree/main/examples/style_step12000
- Pesos: https://huggingface.co/tazmannner/Frieren-Krea2-LoRA/tree/main
- Flujos de ComfyUI: https://huggingface.co/tazmannner/Frieren-Krea2-LoRA/tree/main/workflows
