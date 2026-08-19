# unconst/Affine-5czsc2fc98-r373-offline-dpo-hialpha-longctx-hirank-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r373-offline-dpo-hialpha-longctx-hirank-merged` es un checkpoint intermedio derivado de `kevin954/Affine-5dfqbbh8ev-sft`, al que se le ha aplicado un proceso de fusión de LoRA (LoRA-merged) y un ajuste adicional con DPO (offline). Según los metadatos de HuggingFace, emplea una arquitectura de tipo `qwen3_5_moe`, lo que indica que se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 35 107 millones de parámetros totales. También aparece etiquetado como `image-text-to-text`, lo que sugiere capacidades multimodales, aunque la documentación oficial no detalla este aspecto.

La model card es extremadamente escueta: el autor indica que es un "H1 merged checkpoint salvage" y que se trata de un checkpoint privado con "TTL insurance", no una submission oficial hasta que se supere una fase de validación (Stage-5 gate). Esto implica que el modelo puede ser inestable, no estar optimizado para producción y carecer de garantías de calidad. Su relevancia actual es limitada, salvo para investigadores que quieran explorar el proceso de fusión de LoRA y DPO sobre una base MoE multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en `qwen3_5_moe` |
| Parametros totales | 35 107 181 936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere de los tags de HuggingFace: `qwen3_5_moe` indica un transformer basado en mezcla de expertos, probablemente con atención dispersa y múltiples rutas de expertos, aunque no se especifica el número de expertos ni la proporción de parámetros activos. El modelo es multimodal (`image-text-to-text`), lo que sugiere que incorpora un codificador visual y un adaptador para procesar imágenes junto con texto, pero no se detalla la implementación.

El entrenamiento se describe únicamente como un proceso de fusión de LoRA sobre el checkpoint base `kevin954/Affine-5dfqbbh8ev-sft`, seguido de un ajuste con DPO (offline). No se proporcionan datos sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o SFT. El nombre del checkpoint incluye términos como `hialpha`, `longctx` y `hirank`, que podrían indicar ajustes en la atención de contexto largo y en el rango de las matrices de LoRA, pero no hay documentación que lo confirme.

## Capacidades

- No se dispone de documentación oficial sobre capacidades específicas del modelo.
- Por su arquitectura MoE y su etiqueta `image-text-to-text`, se espera que pueda generar texto y procesar entradas de imagen, aunque no hay ejemplos ni demostraciones que lo confirmen.
- No se han publicado detalles sobre soporte de tool calling, function calling o razonamiento multi-paso.
- No se han publicado detalles sobre capacidades multilingües.
- No se han publicado detalles sobre modos especiales como thinking mode o generación de audio.

## Casos de uso

Dado que el modelo es un checkpoint experimental sin documentación ni validación, los casos de uso son hipotéticos y no recomendados para producción:

- Investigación sobre fusión de LoRA y DPO: el checkpoint puede servir como referencia para estudiar el efecto de estas técnicas sobre una base MoE multimodal.
- Exploración de arquitecturas MoE multimodales: para investigadores que quieran analizar el comportamiento de un modelo de 35 B con mezcla de expertos en tareas de imagen-texto.
- Pruebas de estabilidad y robustez: para evaluar si un checkpoint intermedio sin validación puede producir salidas coherentes en tareas simples de generación de texto.
- Benchmarking de cuantización: aunque no se proporcionan cuantizaciones, un usuario podría cuantizar el modelo con herramientas como llama.cpp o AutoGPTQ y medir la degradación de rendimiento.
- Estudio de la influencia del contexto largo: el nombre sugiere un ajuste para contextos largos, lo que podría interesar a quienes investigan ventanas de atención extendidas.
- Desarrollo de prototipos internos: si se supera la validación del autor, podría usarse en entornos de prueba para tareas de generación de texto con entrada de imagen, pero siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Con 35 107 millones de parámetros, la VRAM necesaria para inferencia depende de la cuantización. Sin cuantizar (FP16), se requieren aproximadamente 70 GB de VRAM (35 B × 2 bytes por parámetro), lo que excede las GPUs de consumo habituales.
- Con cuantización de 8 bits, la VRAM estimada sería de unos 35 GB; con 4 bits, unos 18 GB. Sin embargo, no se han publicado cuantizaciones oficiales para este modelo.
- GPUs recomendadas: para FP16, una A100 80 GB o H100 80 GB; para 8 bits, una RTX 4090 24 GB podría no ser suficiente (35 GB estimados), mientras que una A6000 48 GB sí; para 4 bits, una RTX 4090 24 GB sería viable.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. No hay integraciones oficiales documentadas.
- Latencia y throughput: no se han publicado datos. Como referencia, un MoE de 35 B suele tener una latencia de decodificación de 20-50 ms por token en GPUs de data center, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MoE multimodal de ~35 B). El modelo base `kevin954/Affine-5dfqbbh8ev-sft` podría ser comparable, pero no se han publicado sus especificaciones completas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio sin validación oficial; el autor lo describe como "not a submission until Stage-5 gate clears", lo que implica que puede contener artefactos de entrenamiento o degradación de calidad.
- No se ha publicado información sobre sesgos, alucinaciones o riesgos de contenido dañino. Al ser un modelo multimodal sin documentación, estos riesgos son desconocidos.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni la redistribución.
- No se han proporcionado idiomas soportados ni cobertura lingüística, lo que limita su uso en aplicaciones multilingües.
- La ausencia de cuantizaciones oficiales y de guías de despliegue dificulta su integración en entornos de producción.
- El tamaño del repo (70,2 GB) y la falta de documentación técnica hacen que su uso sea complejo para desarrolladores sin experiencia en modelos MoE.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r373-offline-dpo-hialpha-longctx-hirank-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft

No se han encontrado papers, blogs o demos asociados a este modelo en la información proporcionada.
