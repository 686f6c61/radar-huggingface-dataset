# zehen8716/asmi-lora

## Resumen

zehen8716/asmi-lora es un adaptador LoRA de tipo DreamBooth para generación de imágenes a partir de texto, entrenado sobre el modelo de difusión Krea 2 en su variante RAW (krea/Krea-2-Raw). Lo publica el usuario zehen8716 en HuggingFace bajo licencia Apache 2.0 y la librería diffusers. No se trata de un modelo completo, sino de pesos de bajo rango que se cargan sobre los checkpoints de Krea 2 para inducir un concepto concreto, activado mediante la palabra clave `asmi woman`.

El interés práctico del adaptador reside en el flujo de trabajo que documenta su autor: se entrena sobre el checkpoint RAW, no destilado, y se ejecuta sobre el checkpoint Turbo, destilado para inferencia en 8 pasos y sin classifier-free guidance (guidance_scale=0.0). Esta separación entre entrenamiento e inferencia es una particularidad del ecosistema Krea 2 y permite iterar el LoRA sin pagar el coste de muestreo del modelo base completo.

Se trata de un repositorio con cero descargas y cero "likes" en el momento de la consulta, creado y actualizado el 11 de septiembre de 2026, con un tamaño de 1,2 GB. La model card está generada automáticamente por el script de entrenamiento y conserva secciones sin completar (uso previsto, sesgos, detalles de datos de entrenamiento), por lo que la información sobre el dataset, el número de pasos y la composición de las imágenes de entrenamiento no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre un modelo de difusión texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (no se documenta el rango del LoRA ni el numero de parametros entrenados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se trata de un modelo texto-a-imagen; no se especifica limite de tokens del codificador de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF ni cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no disponible (la ficha no declara idiomas; el prompt de ejemplo esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | krea/Krea-2-Raw (entrenamiento) y krea/Krea-2-Turbo (inferencia) |
| Pipeline | text-to-image |
| Palabra de activacion | `asmi woman` |
| Tamano del repositorio | 1,2 GB |
| Libreria | diffusers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con la implementación de DreamBooth incluida en el entrenador de Krea 2 de diffusers (`examples/dreambooth/README_krea2.md`). DreamBooth es una técnica de personalización que ajusta un modelo generativo para asociar un sujeto o concepto concreto a un identificador textual poco frecuente, en este caso la frase `asmi woman`. Al ser un LoRA, el ajuste se aplica sobre un subconjunto de matrices de pesos de bajo rango en lugar de reentrenar el modelo completo, lo que reduce drásticamente el coste de almacenamiento (1,2 GB frente a los pesos completos del checkpoint base) y permite combinarlo o fusionarlo con otros adaptadores.

Krea 2 se distribuye en dos checkpoints complementarios según la model card: RAW, que es la base no destilada y el objetivo sobre el que se entrena el LoRA, y Turbo, un checkpoint destilado para inferencia en 8 pasos. El autor indica que los LoRA entrenados sobre RAW se expresan con fuerza sobre Turbo, de modo que el flujo recomendado es entrenar en RAW y desplegar en Turbo. No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, la resolución de entrenamiento, el rango del adaptador, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como regularización con imágenes de clase o decodificación especulativa.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el prompt `asmi woman`, asociada a un concepto visual concreto aprendido durante el entrenamiento.
- Personalización de sujeto o estilo sobre Krea 2 mediante DreamBooth LoRA, sin necesidad de reentrenar el modelo base.
- Inferencia rápida en 8 pasos cuando el adaptador se carga sobre Krea-2-Turbo con `guidance_scale=0.0`, tal y como documenta el autor.
- Compatibilidad con la API de adaptadores de diffusers (`load_lora_weights`), lo que habilita ponderación, mezcla y fusión de LoRA con otros adaptadores.
- Ejecución en precisión bfloat16 (`torch_dtype=torch.bfloat16`) sobre GPU CUDA según el ejemplo de código publicado.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": son capacidades ajenas a un modelo de difusión de este tipo.
- Capacidades multilingües: no disponibles; la ficha no declara idiomas soportados y el único ejemplo de prompt está en inglés.

## Casos de uso

- Generación de retratos consistentes de un mismo personaje: al cargar el LoRA sobre Krea-2-Turbo y usar la palabra clave `asmi woman`, se obtienen variaciones de un sujeto coherente, útil para ilustración editorial seriada o narrativa visual.
- Previsualización rápida de conceptos en un pipeline de diseño: la receta de 8 pasos sin guidance permite iterar sobre bocetos de personaje con una latencia de muestreo reducida frente a un modelo no destilado.
- Prototipado de assets para videojuegos o animación: el adaptador sirve para explorar variaciones de un diseño de personaje antes de encargar el modelado definitivo.
- Pruebas de personalización en investigación: el repositorio documenta un caso reproducible de DreamBooth LoRA sobre Krea 2, útil para comparar hiperparámetros y estrategias de entrenamiento RAW/Turbo.
- Composición de adaptadores: al ser un LoRA compatible con diffusers, puede ponderarse o fusionarse con otros adaptadores de estilo para combinar identidad y estética en una misma generación.
- Generación de material gráfico para campañas o redes sociales: con la palabra clave y un prompt descriptivo adicional se pueden producir variaciones de un mismo sujeto con distintos encuadres y fondos.
- Integración en scripts de automatización: el ejemplo oficial usa `Krea2Pipeline.from_pretrained` más `load_lora_weights`, por lo que puede incorporarse a un pipeline Python programático para generación por lotes en un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de sujeto, comparativas con otros LoRA) ni comparaciones con adaptadores alternativos. Tampoco se documentan cifras de latencia o throughput medidas.

## Requisitos de hardware

- El LoRA en sí ocupa 1,2 GB en disco, pero requiere descargar y cargar por separado el checkpoint base de Krea 2 (RAW para entrenamiento, Turbo para inferencia), cuyo tamaño no se especifica en la información disponible.
- VRAM estimada para inferencia: no disponible. Depende enteramente del checkpoint base de Krea 2, cuyas especificaciones no se detallan en la ficha; el adaptador añade una sobrecarga marginal respecto al modelo base.
- El ejemplo oficial carga el pipeline en bfloat16 sobre CUDA (`torch_dtype=torch.bfloat16`, `.to("cuda")`), lo que implica una GPU NVIDIA con memoria suficiente para el checkpoint base en esa precisión.
- GPU recomendadas: no disponible. No se publican requisitos mínimos ni pruebas en GPU de consumo; la viabilidad en una RTX 4090 u otras GPU consumer no puede confirmarse con los datos aportados.
- Opciones de despliegue documentadas: diffusers con `Krea2Pipeline` y `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además son herramientas orientadas a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput estimados: no disponibles. El único dato operativo es la receta de 8 pasos de muestreo con `guidance_scale=0.0` sobre Krea-2-Turbo, que reduce el número de evaluaciones del modelo frente a un muestreo estándar.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este adaptador. La comparación se plantea por categoría de herramienta, no por rendimiento medido:

| Alternativa | Tipo | Modelo base | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zehen8716/asmi-lora | LoRA DreamBooth texto-a-imagen | Krea-2-Raw / Krea-2-Turbo | inferencia en 8 pasos (receta Turbo) | apache-2.0 | publico en HuggingFace, 0 descargas |
| LoRA DreamBooth sobre SDXL | LoRA de personalizacion | Stable Diffusion XL | no disponible en esta busqueda | depende del autor | ecosistema ampliamente extendido |
| LoRA DreamBooth sobre FLUX.1 | LoRA de personalizacion | FLUX.1 dev/schnell | no disponible en esta busqueda | depende del autor y del modelo base | ecosistema ampliamente extendido |

No se han encontrado en la busqueda web resultados relevantes sobre Krea 2, sus adaptadores o comparativas de rendimiento; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con el modelo.

## Limitaciones y advertencias

- Model card incompleta: las secciones de uso previsto, sesgos y detalles de entrenamiento conservan marcadores `TODO` del script automático, por lo que no hay información verificable sobre los datos utilizados.
- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento, no puede evaluarse el sesgo demográfico, estético o cultural del adaptador.
- Riesgo de sobreajuste al concepto: al ser un LoRA DreamBooth con una palabra clave específica, es previsible que el concepto se degrade o contamine el prompt si se combina con otras descripciones sin ajustar el peso del adaptador; no se documentan pesos recomendados.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, artefactos en manos y rostros, o texto ilegible en la imagen; no se han publicado evaluaciones al respecto.
- Limitaciones de idioma: no se declaran idiomas soportados y el único ejemplo de prompt está en inglés; el comportamiento con prompts en castellano no está documentado.
- Dependencia del modelo base: el adaptador no es autónomo. Requiere descargar Krea-2-Turbo o Krea-2-Raw, cuyas respectivas licencias y condiciones de uso deben verificarse por separado antes de un despliegue comercial.
- Licencia: el adaptador se publica bajo apache-2.0, lo que en principio permite uso comercial, pero esta licencia no exime de cumplir las condiciones del modelo base sobre el que se carga.
- Madurez: cero descargas y cero valoraciones, creado y actualizado el mismo día, sin pruebas de terceros ni validación comunitaria. No es recomendable como componente crítico en producción sin una evaluación propia.
- Sin garantías de calidad ni soporte: el autor no documenta resolución de salida, pasos de entrenamiento, rango del LoRA ni parámetros de muestreo óptimos distintos de la receta Turbo de 8 pasos.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/zehen8716/asmi-lora
- Archivos del repositorio: https://huggingface.co/zehen8716/asmi-lora/tree/main
- Modelo base para inferencia: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base para entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Receta de entrenamiento DreamBooth para Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentación de carga de adaptadores LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Artículo original de DreamBooth: https://dreambooth.github.io/
- Repositorio de diffusers: https://github.com/huggingface/diffusers
