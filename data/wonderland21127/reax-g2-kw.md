# wonderland21127/REAX-G2-KW

## Resumen

REAX-G2-KW es un modelo de clasificación de texto (pipeline `text-classification`) derivado por fine-tuning del modelo base MachinePulseAI/karpo-decision-31B, publicado por el usuario wonderland21127 en Hugging Face. Con 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones), se distribuye en formato safetensors bajo licencia Apache 2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de descargarlo. La etiqueta `gemma4` sugiere que la arquitectura subyacente pertenece a la familia Gemma, aunque no se confirma en la información disponible.

El modelo está orientado a tareas de toma de decisiones y clasificación de opción múltiple (tags `decision-making`, `multiple-choice`, `reax`, `text-classification`), y conserva la modalidad `image-text-to-text` heredada del modelo base, lo que indica capacidades multimodales de entrada. Su relevancia actual es limitada: no registra descargas ni interacciones, se publicó en noviembre de 2026 y no incluye documentación técnica, datos de entrenamiento ni resultados de evaluación en la información disponible.

Se trata, por tanto, de un artefacto de pesos sin ficha técnica publicada, lo que impide verificar su calidad, su comportamiento real o su idoneidad para producción. Cualquier evaluación seria requiere descargar los pesos (previo acceso) y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`; presumiblemente transformer multimodal de la familia Gemma) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Las etiquetas de Hugging Face indican `gemma4` como familia arquitectónica y `image-text-to-text` como modalidad, además de `transformers` y `safetensors` como librería y formato. El modelo es un fine-tune del checkpoint MachinePulseAI/karpo-decision-31B, según los metadatos `base_model` y `base_model:finetune`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, mezcla de expertos u otras). El pipeline declarado es `text-classification`, pero la modalidad `image-text-to-text` del modelo base sugiere que el fine-tuning podría haberse realizado sobre una cabeza de clasificación aplicada a representaciones multimodales; esto es una inferencia a partir de las etiquetas y no un dato confirmado.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el uso previsto es asignar etiquetas o categorías a entradas de texto.
- Clasificación de opción múltiple: la etiqueta `multiple-choice` indica que el modelo está adaptado a tareas de selección entre alternativas.
- Toma de decisiones: la etiqueta `decision-making` apunta a un fine-tuning orientado a tareas de decisión, aunque no se especifica el formato exacto de entrada/salida.
- Entrada multimodal imagen-texto: heredada del modelo base (`image-text-to-text`), sin confirmación de que se conserve tras el fine-tuning.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio especial: no disponible.

## Casos de uso

- Clasificación automática de tickets de soporte: el modelo puede asignar categorías a texto de incidencias; su tamaño de 31B permite representaciones ricas, aunque la falta de benchmarks obliga a validar con datos propios antes de desplegarlo.
- Enrutamiento de decisiones en pipelines internos: con la etiqueta `decision-making`, podría emplearse para seleccionar una acción entre un conjunto finito de opciones, integrándose como clasificador en un flujo mayor.
- Evaluación de opción múltiple en entornos educativos o de investigación: el formato `multiple-choice` encaja con la corrección automática de preguntas de alternativas.
- Moderación o etiquetado de contenido: como clasificador de texto, puede etiquetar entradas según políticas definidas, siempre que se entrene o valide con el esquema de etiquetas adecuado.
- Clasificación de documentos multimodales: si conserva la capacidad `image-text-to-text` del modelo base, podría clasificar documentos que combinen texto e imagen (facturas, formularios escaneados), previa verificación empírica.
- Componente de un sistema de recomendación o priorización: la salida de clasificación puede alimentar un ranking o un sistema de triaje, usando el modelo como señal intermedia.
- Investigación sobre fine-tuning de modelos grandes: sirve como caso de estudio de adaptación de un modelo de 31B a tareas de clasificación, aunque carece de documentación metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se requiere una GPU de 80 GB (A100/H100) o varias GPUs.
- Cuantización a 8 bits: en torno a 31-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: en torno a 16-18 GB de VRAM, podría caber en una RTX 4090 (24 GB) o RTX 3090, con degradación de calidad no medida.
- GPU recomendadas: A100 80 GB, H100 80 GB para fp16; A100 40 GB o configuraciones multi-GPU para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y sin datos de latencia publicados.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint y requerirían conversión o verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parámetros y disponibilidad. Se incluyen alternativas genéricas de tamaño similar como referencia, sin afirmar equivalencia funcional.

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|
| REAX-G2-KW | 31,3B | no disponible | Apache 2.0 | Gated en HF | Fine-tune de clasificación, sin benchmarks |
| MachinePulseAI/karpo-decision-31B (base) | no disponible | no disponible | no disponible | no disponible | Modelo del que deriva |
| Alternativas de ~30B (p. ej., familia Gemma de tamaño equivalente) | ~30B | no disponible | según variante | público | No se confirma equivalencia arquitectónica |

No se conocen modelos comparables directos en la categoría de clasificación de 31B con documentación pública en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay ficha técnica, datos de entrenamiento ni evaluación publicada, lo que impide estimar su calidad.
- Sin benchmarks ni métricas: no se puede comparar objetivamente con alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso en producción y para la reproducibilidad.
- Riesgo de alucinación y sesgos: desconocido; no se documentan sesgos conocidos ni mitigaciones.
- Idiomas: no se declaran idiomas soportados; el rendimiento multilingüe es incierto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que las condiciones del acceso gated y del modelo base no impongan restricciones adicionales.
- Tamaño elevado: 31B parámetros y 62,6 GB de repositorio implican costes de infraestructura considerables para un clasificador, que normalmente se resuelve con modelos mucho más pequeños.
- Pipeline declarado frente a modalidad del base: la discrepancia entre `text-classification` y `image-text-to-text` no está aclarada; el comportamiento real de la cabeza de clasificación es incierto.
- Sin garantías de mantenimiento: cero descargas y cero likes sugieren un artefacto sin comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/wonderland21127/REAX-G2-KW
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
