# TOWNTAKEOVER/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

TOWNTAKEOVER/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF de un fine-tune multi-etapa del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de la familia Qwen 3.8 de 27B. El autor de la cuantización es TOWNTAKEOVER; el fine-tune original y la metodología de entrenamiento (Cold Fusion, Fable Fusion 711, Turbo Brilliance) corresponden a DavidAU. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado como "uncensored", "abliterated" y "heretic", es decir, con las capas de rechazo eliminadas mediante técnicas de abliteration.

La propuesta principal del modelo es reducir drásticamente el consumo de tokens de razonamiento (entre 1/2 y 1/10 frente al Qwen 3.8 27B estándar) manteniendo la calidad de salida, mediante un modo "TURBO" que evita el sobre-razonamiento en tareas de formateo o instrucciones simples. Según la model card, alcanza 735 puntos en ARC-C en cuantización de 8 bits y 719 en 4 bits, cifras que el autor presenta como las más altas registradas para un modelo de este tamaño en hardware de consumo.

El repositorio incluye cuantizaciones GGUF "regulares" y "MTP" (Multi-Token Prediction) con doble imatrix (DI-MATRIX), generadas con Unsloth. El pipeline declarado es image-text-to-text, aunque las capacidades multimodales no están documentadas en detalle en la información disponible. El tamaño del repositorio es de 389 GB, coherente con un modelo de ~27B parámetros y múltiples variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8); detalles específicos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias precisiones (Q4, Q8 citadas; Q4KS mencionada); MTP y regulares, con y sin imatrix |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de ~27B parámetros derivado de Qwen 3.8, sometido a un proceso de fine-tune multi-etapa ("multi-stage tuned", "multi-state merge") por DavidAU. La model card menciona los métodos "Cold Fusion" y "Fable Fusion 711", así como datasets propios (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

La innovación técnica destacada es el sistema "TURBO", orientado a reducir el sobre-razonamiento: según el autor, el modelo consume entre la mitad y una décima parte de los tokens de pensamiento respecto al Qwen 3.8 27B estándar en los tres modos de operación, manteniendo el detalle de salida. Las cuantizaciones incluyen variantes "MTP" (Multi-Token Prediction) y "DI-MATRIX" (doble imatrix), generadas con Unsloth. También se aplicaron técnicas de abliteration ("heretic", "uncensored", "ara") para eliminar los mecanismos de rechazo.

## Capacidades

- Generación de texto conversacional y de formato largo.
- Razonamiento con modo "thinking" explícito, optimizado para reducir tokens de pensamiento.
- Generación de código (etiquetado "coder" y "NEO-CODER").
- Escritura creativa: ficción, narrativa, guiones, roleplaying y todos los géneros.
- Capacidades multilingües en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Pipeline declarado image-text-to-text (capacidad multimodal; detalles no disponibles).
- Soporte de tool calling según la model card (que remite a la pestaña "community" para benchmarks de terceros; no verificable en la información disponible).
- Modelo sin censura (abliterated), sin rechazos por contenido.

## Casos de uso

- Escritura creativa y ficción: el modelo está afinado específicamente para narrativa, diálogo y roleplaying, con ejemplos de generación de alta densidad en la model card; adecuado para borradores de novelas, guiones y contenido de ficción extenso.
- Generación de código en pipelines: la etiqueta "coder" y el soporte declarado de tool calling permiten integrarlo en asistentes de programación y flujos de CI/CD, aunque la ausencia de benchmarks públicos verificables obliga a validación propia.
- Asistentes conversacionales sin filtros: para aplicaciones donde se requiere ausencia de rechazos (investigación creativa, simulación de personajes), gracias a la abliteration.
- Reducción de coste de inferencia en razonamiento: el modo TURBO reduce tokens de pensamiento entre 2x y 10x, lo que abarata despliegues con muchas peticiones de razonamiento simple o formateo.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF de 4 bits permiten ejecución en GPUs consumer, según el enfoque declarado del autor.
- Traducción y contenido multilingüe: cobertura de 16 idiomas para tareas de traducción y generación multilingüe.
- Prototipado rápido con llama.cpp/Ollama: el formato GGUF y las variantes MTP facilitan pruebas locales sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card cita resultados propios (no verificables de forma independiente):

| Benchmark | Resultado citado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | "144 pts por encima de Qwen 3.8 27B" según el autor |
| ARC-C (4 bits) | 719 | Cuantización Q4 |
| ARC-E (8 bits) | >880 | Zona citada de OpenAI/Claude/Gemini |
| Comparativa global | Supera los 7 benchmarks críticos de Qwen 3.8 27B, Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Afirmación del autor, sin tabla detallada en la información disponible |

No se han publicado resultados detallados de MMLU, HumanEval o GSM8K en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido contrastadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para ~27B parámetros, una cuantización de 4 bits requiere aproximadamente 14-16 GB de VRAM y una de 8 bits en torno a 28-30 GB (estimación estándar para este tamaño, no confirmada en la documentación).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) podría ejecutar variantes de 4 bits, y A100/H100 para 8 bits o precisión completa.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 bits según el enfoque del autor ("built on consumer hardware via Unsloth"), aunque sin cifras oficiales de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio incluye variantes MTP y regulares con imatrix.
- Latencia y throughput: no disponibles; el autor afirma reducción de tokens de pensamiento de 2x a 10x, lo que implica menor latencia en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic) | ~26,9B | no disponible | Apache 2.0 | Fine-tune sin censura, GGUF, ARC-C 735 (8 bits) según autor |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (presumible) | Referencia del autor; superado en sus 7 benchmarks según la model card |
| Qwen3.6-35B-A3B | 35B (MoE, A3B) | no disponible | no disponible | Citado como superado por este modelo según el autor |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27B | no disponible | no disponible | Citados como superados en los 7 benchmarks según el autor |

Los datos de la comparativa proceden de afirmaciones del autor; no hay benchmarks independientes disponibles.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": elimina los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente ofensivo sin filtro; requiere moderación externa en producción.
- Riesgo elevado de alucinación: los fine-tunes creativos y sin censura tienden a priorizar fluidez sobre veracidad; no hay evaluaciones de factualidad disponibles.
- Las cifras de benchmarks (ARC-C 735/719, superación de 7 benchmarks) son afirmaciones del autor sin verificación independiente.
- Longitud de contexto no documentada; no se puede garantizar el rendimiento en contextos largos.
- El pipeline declarado image-text-to-text no está respaldado por documentación detallada sobre capacidades de visión.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y el uso de un modelo sin censura pueden conllevar responsabilidad legal según la jurisdicción.
- Repositorio de 389 GB con múltiples cuantizaciones: conviene descargar solo la variante necesaria.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/TOWNTAKEOVER/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
