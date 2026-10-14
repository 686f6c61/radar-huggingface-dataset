# Ziyaad30/krea2_reference_blocks

## Resumen

Krea 2 reference blocks es un conjunto de bloques para Modular Diffusers que amplía el modelo de difusión Krea 2 con la capacidad de aceptar imágenes de referencia. No se trata de un modelo entrenado desde cero, sino de una envoltura de inferencia publicada por el usuario Ziyaad30 que se apoya en el checkpoint krea/Krea-2-Turbo. Su aportación principal es que el codificador de texto del pipeline es el Qwen3-VL completo, torre de visión incluida, de modo que una imagen de referencia puede condicionar la generación a través de la ruta visual del propio codificador sin necesidad de cargar ningún modelo adicional.

Sobre esa base, los bloques ofrecen tres modos seleccionables mediante el parámetro `reference_mode`. El modo `off` usa únicamente la ruta de visión del Qwen3-VL y funciona sobre el checkpoint original sin adaptadores. Los modos `append` y `prepend` van más allá e inyectan la referencia en el transformer como latentes VAE limpios, apoyándose en dos LoRA de edición de la comunidad: la LoRA de referencia de estilo de Ostris y la Identity-Edit de Conrad Locke. En ninguno de los tres modos se parchea el transformer.

El resultado es un pipeline de texto a imagen e imagen a imagen que permite controlar por separado el contenido o identidad de la referencia y su estilo o textura, aplicar máscaras para restringir la referencia a una región concreta y ajustar cuánta adherencia se cede al prompt frente a la imagen de referencia. El repositorio se publica bajo licencia Apache 2.0 y, en el momento de redactar esta ficha, acumula cero descargas y cero valoraciones, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión texto a imagen sobre Krea 2 Turbo, empaquetada como bloques de Modular Diffusers. Codificador de texto Qwen3-VL completo, con torre de visión. No se parchea el transformer en ningún modo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes). El parámetro `grounding_px` controla el lado más largo de la vista que procesa el VLM, 768 px por defecto |
| Tipos de cuantizacion | El codificador de texto se distribuye cuantizado y requiere la librería `sdnq` para cargarse. No se documentan otros formatos de cuantización |
| Idiomas soportados | no disponible (el autor no declara una lista de idiomas; el prompt lo procesa el codificador Qwen3-VL) |
| Licencia | apache-2.0 |
| Formato de pesos | Repositorio cargable con `ModularPipeline.from_pretrained`. Las LoRA comunitarias asociadas se distribuyen en safetensors |
| Modelo base | krea/Krea-2-Turbo (finetune) |
| Pipeline declarado | text-to-image |
| Modos de referencia | `off`, `append`, `prepend` |
| Dependencias destacadas | `diffusers` (Modular Pipeline), `sdnq`, `torch`; carga con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino una configuración de pipeline modular y bloques personalizados de Diffusers que orquestan componentes ya existentes de Krea 2 Turbo. La innovación técnica se concentra en cómo entra la imagen de referencia. En el modo `off`, la referencia se inyecta exclusivamente a través de la ruta de visión del codificador Qwen3-VL, lo que significa que el condicionamiento ocurre en el espacio del codificador y no toca el transformer de difusión. En los modos `append` y `prepend`, la referencia se convierte en latentes VAE limpios que se concatenan a la secuencia del transformer, bien después de los tokens objetivo (`append`, al estilo de la arquitectura de edición integrada de ai-toolkit), bien antes de ellos (`prepend`, siguiendo `predict_velocity_edit` del entrenador krea2edit-trainer).

El control fino se articula con tres parámetros. `reference_subject_strength` escala contenido e identidad y `reference_style_strength` escala textura y estilo, ambos con valor por defecto 1.0 y 0 para descartar la referencia; cada uno puede recibir un valor único o una lista alineada con la lista de referencias, de modo que una imagen puede aportar solo su aspecto y otra solo su contenido. `grounding_px` funciona como dial entre adherencia y fidelidad: valores bajos siguen más el prompt, valores altos retienen más la referencia y 0 usa la resolución nativa. El sistema de máscaras se controla con `reference_masks` y `reference_mask_mode`, con las opciones `exclude_blank` (por defecto), `exclude` y `deemphasize`, que actúan siempre sobre la ruta de visión.

En cuanto a datos de entrenamiento, número de tokens, composición del dataset o métodos de alineación como RLHF o DPO, no hay información disponible: los bloques no implican entrenamiento propio y las dos LoRA que habilitan los modos `append` y `prepend` fueron entrenadas por terceros. Tampoco se documenta si el pipeline incorpora decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto a imagen: con `reference_mode="off"` y sin imágenes de referencia, los bloques se comportan como un pipeline estándar de texto a imagen sobre Krea 2 Turbo.
- Generación de imagen a imagen y edición: los modos `append` y `prepend` permiten transformar una imagen de referencia manteniendo su identidad o su estilo.
- Condicionamiento por imagen de referencia sin modelo auxiliar: la referencia entra por la torre de visión del codificador Qwen3-VL, sin necesidad de un adaptador extra en modo `off`.
- Control desacoplado de contenido e identidad por un lado y estilo o textura por el otro, con intensidades independientes y escalables por referencia.
- Soporte de múltiples referencias simultáneas, con la posibilidad de asignar a cada una su propia intensidad de sujeto y de estilo.
- Ajuste de adherencia al prompt frente a fidelidad a la referencia mediante `grounding_px`, incluida la resolución nativa con el valor 0.
- Enmascarado regional de la referencia con tres comportamientos distintos: atenuación, exclusión de la atención y exclusión completa de tokens.
- En los modos con LoRA, opción de eliminar también del transformer los parches enmascarados mediante `mask_reference_latents=True`.
- Resolución de trabajo en los ejemplos oficiales: 1024 x 1024 píxeles.
- No se declaran capacidades de audio, vídeo, tool calling, agentes ni razonamiento multi-paso, por tratarse de un pipeline de generación de imágenes.

## Casos de uso

- Consistencia de personaje en series ilustradas: pasando la misma imagen de referencia en cada generación y manteniendo `reference_subject_strength` alto con `reference_style_strength` bajo, se puede conservar la identidad de un personaje mientras se cambia de escenario, como en el ejemplo oficial del gato sobre un muro de piedra al atardecer o en un bosque nevado.
- Transferencia de estilo sin arrastre de contenido: invirtiendo la proporción de las dos intensidades se aplica la textura, la paleta o el acabado de una obra de referencia a un sujeto distinto, útil para explorar direcciones de arte.
- Edición localizada con máscaras: con `reference_masks` y el modo `deemphasize` o `exclude`, la referencia influye únicamente en la región pintada, lo que sirve para sustituir un objeto, un rostro o un logotipo dentro de una escena ya compuesta.
- Flujos de producto y fotografía comercial: usar una foto de producto como referencia para generar variaciones de fondo, iluminación o composición conservando la identidad del artículo, encadenando varias generaciones por lotes desde el mismo pipeline modular.
- Prototipado de assets para videojuegos o animación: generar variantes de un personaje o de un objeto coherentes entre sí a partir de una referencia común, antes de pasar el diseño a un artista.
- Investigación sobre condicionamiento multimodal en difusión: la existencia de tres rutas distintas (visión del VLM, tokens limpios pospuestos, tokens limpios antepuestos) permite comparar experimentalmente cómo afecta cada mecanismo a la fidelidad y a la adherencia al prompt.
- Extensión de pipelines modulares propios: al estar construido sobre Modular Diffusers, los bloques sirven como base para añadir etapas posteriores, cambiar componentes o sustituir el checkpoint dentro de un pipeline mayor.
- Previsualización en herramientas de diseño: integrar el pipeline en un servicio interno para que un diseñador suba una referencia y obtenga propuestas rápidas con control explícito de cuánto se respeta el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas cuantitativas de calidad, fidelidad a la referencia, FID, CLIP score ni comparaciones numéricas con otros sistemas de condicionamiento por referencia. Tampoco se documentan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria ni de rendimiento para ningún modo ni cuantización.
- GPU recomendadas: no disponible. El único requisito deducible del ejemplo oficial es una GPU compatible con CUDA y con `bfloat16`, dado que el código carga los componentes con `dtype=torch.bfloat16` y ejecuta `pipe.to("cuda")`.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos sobre si el pipeline completo cabe en tarjetas de gama de consumo, extremo que depende del tamaño del transformer de Krea 2 Turbo y del codificador Qwen3-VL, no especificados en la información disponible.
- Opciones de despliegue: el método documentado es `diffusers.ModularPipeline` con `trust_remote_code=True` y la librería `sdnq` para el codificador cuantizado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusión de imagen.
- Latencia y throughput estimados: no disponible. El modelo base es una variante Turbo, lo que en la práctica suele asociarse a muestreo en pocos pasos, pero no hay ninguna cifra publicada al respecto en esta ficha.

## Comparativa con modelos similares

No hay datos numéricos publicados que permitan comparar este repositorio con alternativas de la misma categoría. La comparación que sí puede hacerse es interna, entre las tres rutas que ofrecen los propios bloques y sus componentes asociados:

| Variante | Mecanismo de referencia | Requiere LoRA | Modifica el transformer | Máscaras |
|---|---|---|---|---|
| `reference_mode="off"` | Ruta de visión de Qwen3-VL | No | No | Sí, sobre la ruta de visión |
| `reference_mode="append"` | Visión más tokens limpios de la referencia después del objetivo | Sí, LoRA de referencia de estilo de Ostris | No | Sí; los latentes limpios quedan sin enmascarar salvo que se active `mask_reference_latents` |
| `reference_mode="prepend"` | Visión más fuente limpia antes del objetivo | Sí, LoRA Identity-Edit | No | Igual que en `append` |
| Krea 2 Turbo sin estos bloques | No admite imagen de referencia | No | No | No aplica |

Frente a otros sistemas externos de condicionamiento por referencia, como adaptadores de imagen o modelos de edición dedicados, no se dispone de parámetros, contexto, licencia ni rendimiento comparables en la información proporcionada, por lo que la comparativa queda como no disponible.

## Limitaciones y advertencias

- Compatibilidad restringida: los bloques solo funcionan con Krea 2, en sus variantes Turbo o raw. No son reutilizables con otros modelos de difusión.
- Ejecución de código remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en entornos de producción.
- Dependencia adicional: el codificador de texto cuantizado obliga a instalar `sdnq` para poder cargar el pipeline, lo que añade una dependencia no estándar al entorno.
- Discrepancia de identificador: el repositorio se publica como `Ziyaad30/krea2_reference_blocks`, mientras que todos los ejemplos de la model card cargan `OzzyGT/krea2_reference_blocks`. Hay que verificar cuál es el identificador correcto antes de desplegarlo.
- Falta de validación comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin ejemplos de salida publicados ni pruebas de terceros.
- Licencias de terceros: aunque el repositorio es Apache 2.0, las dos LoRA que habilitan los modos `append` y `prepend` son de otros autores y pueden tener condiciones distintas. El uso comercial del modelo base Krea 2 Turbo también queda sujeto a la licencia de dicho modelo, que no se detalla en la información disponible.
- Máscaras y latentes limpios: en los modos con LoRA, los latentes de la referencia no se enmascaran por defecto, de modo que una edición enmascarada puede mostrar indicios de las partes no pintadas. Para evitarlo hay que activar `mask_reference_latents=True`.
- Compromiso entre adherencia y fidelidad: un `grounding_px` alto favorece que la salida se parezca a la referencia a costa de ignorar el prompt, y uno bajo hace lo contrario. No hay valores recomendados por el autor más allá del valor por defecto de 768.
- Sesgos: no hay documentación sobre sesgos del pipeline. Al depender del codificador Qwen3-VL y de su torre de visión, es razonable esperar que herede los sesgos de representación de los datos con los que se entrenó ese componente, pero el autor no aporta análisis al respecto.
- Riesgo de artefactos: no se documentan evaluaciones de calidad, coherencia anatómica o fidelidad de identidad, por lo que no puede descartarse la aparición de artefactos típicos de los modelos de difusión.
- Idiomas: no se declara soporte multilingüe ni una lista de idiomas, pese a que los prompts se procesan mediante un codificador de texto de origen multimodal.
- Fechas: el repositorio figura como creado y actualizado el 14 de octubre de 2026, sin revisiones posteriores registradas en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ziyaad30/krea2_reference_blocks
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Documentación de Modular Diffusers: https://huggingface.co/docs/diffusers/main/en/modular_diffusers/overview
- Documentación de Modular Pipeline: https://huggingface.co/docs/diffusers/main/en/modular_diffusers/modular_pipeline
- LoRA de referencia de estilo de Ostris: https://huggingface.co/ostris/krea2_turbo_style_reference
- LoRA Identity-Edit de Conrad Locke: https://huggingface.co/conradlocke/krea2-identity-edit
- Repositorio ai-toolkit: https://github.com/ostris/ai-toolkit
- Extensión krea2edit-trainer: https://github.com/lbouaraba/krea2edit-trainer

Nota: los resultados de búsqueda web disponibles no contenían información relacionada con este modelo; correspondían a documentos sobre el preámbulo de la Constitución de los Estados Unidos y no se han utilizado.
