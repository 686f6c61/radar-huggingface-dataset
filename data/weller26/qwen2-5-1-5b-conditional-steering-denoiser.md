# Weller26/qwen2.5-1.5b-conditional-steering-denoiser

## Resumen

El modelo `Weller26/qwen2.5-1.5b-conditional-steering-denoiser` es un componente técnico especializado en el ámbito de la interpretabilidad de modelos de lenguaje, concretamente en la técnica de *activation steering* (dirección de activaciones). No es un modelo de lenguaje autónomo, sino un denoiser residual condicional entrenado para corregir corrupciones en los estados ocultos de Qwen/Qwen2.5-1.5B a partir de la capa 16 (indexación basada en cero). Su objetivo es mejorar la calidad de las intervenciones de steering, aumentando la diversidad del texto generado sin degradar la adherencia al concepto deseado.

Desarrollado por el usuario Weller26, este checkpoint se presenta como una herramienta para experimentos de ingeniería de representaciones. El modelo base es Qwen2.5-1.5B, un transformer de 1.500 millones de parámetros con 1.536 dimensiones ocultas. El denoiser emplea un factor de expansión de 0,5 y una dimensión de condición de 64. Su entrenamiento se realizó sobre 1.000.000 de activaciones de tokens del corpus Wikitext, sin acceso al vector de steering "fantasma" (el vector de control durante la inferencia). Los resultados reportados indican una mejora en la métrica de diversidad Dist-2 (de 0,5983 a 0,6406) con una similitud de concepto prácticamente inalterada (0,4151 frente a 0,4155) a un alpha de 60.

Este modelo es relevante para la comunidad de interpretabilidad porque aborda un problema práctico del activation steering: la pérdida de diversidad y la degradación de la fluidez al aplicar vectores de control. Aunque el checkpoint está diseñado específicamente para Qwen2.5-1.5B, la metodología puede ser de interés para otros modelos de la familia Qwen o arquitecturas similares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser residual condicional (no es un transformer completo) |
| Parametros totales | No disponible (módulo auxiliar ligero; no se especifica en la documentación) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa texto directamente; actúa sobre activaciones) |
| Tipos de cuantizacion | No disponible (checkpoint en formato PyTorch, sin cuantización reportada) |
| Idiomas soportados | No disponible (depende del modelo base Qwen2.5-1.5B, pero el denoiser no tiene vocabulario propio) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt`), no safetensors |

## Arquitectura y entrenamiento

El modelo es un denoiser residual condicional que se aplica a las activaciones ocultas de Qwen2.5-1.5B. Su arquitectura se describe como un módulo con un factor de expansión de 0,5 sobre la dimensión oculta (1536 → 768 internamente) y una dimensión de condición de 64. La condición se refiere al vector de steering que se inyecta durante la intervención. El denoiser se entrena para corregir corrupciones sintéticas introducidas en las activaciones después de la capa 16, usando dos tipos de corrupción: direcciones unitarias aleatorias y *activation mixup* (mezcla de activaciones). El entrenamiento se realizó sobre 1.000.000 de activaciones de tokens del corpus Wikitext, y se llevó a cabo sin acceso al vector de steering "fantasma" (el vector que se usa en la inferencia). Esto implica que el modelo aprende a denoisear corrupciones genéricas, no corrupciones específicas de un concepto.

No se especifican detalles sobre el optimizador, la tasa de aprendizaje o el número de épocas. La arquitectura del denoiser está definida en un módulo Python llamado `ConditionalResidualDenoiser`, que se carga desde un checkpoint. No se trata de un modelo de lenguaje, sino de un componente de post-procesamiento de activaciones.

## Capacidades

- Corrección de corrupciones en los estados ocultos de Qwen2.5-1.5B en la capa 16, mejorando la calidad de las intervenciones de activation steering.
- Aumento de la diversidad del texto generado bajo steering (medido con Dist-2) sin alterar significativamente la similitud conceptual (0,4151 frente a 0,4155).
- Compatible con experimentos de activation steering donde se inyectan vectores de control en capas intermedias.
- Soporta intervenciones con un factor de intensidad (alpha) ajustable (en el ejemplo se usa alpha=60).
- No es un modelo generativo: no produce texto por sí mismo, sino que modifica las representaciones internas del modelo base.

## Casos de uso

- **Investigación en interpretabilidad**: permite estudiar cómo la corrección de activaciones afecta a la direccionalidad del steering, proporcionando un control más fino sobre la diversidad del texto generado.
- **Optimización de técnicas de activation steering**: el denoiser puede integrarse en pipelines de steering para reducir la pérdida de diversidad que suele ocurrir con vectores de alta intensidad.
- **Análisis de representaciones**: útil para explorar cómo las corrupciones en capas profundas afectan la salida del modelo y cómo el denoiser las contrarresta.
- **Desarrollo de métodos de control de generación**: al mejorar la diversidad sin sacrificar el concepto, puede servir en aplicaciones donde se desea mantener una temática pero variar las expresiones.
- **Evaluación de robustness**: se puede usar para probar la sensibilidad del modelo base a perturbaciones en activaciones, ayudando a identificar capas críticas.
- **Prototipado de arquitecturas de interpretación**: como caso de uso académico, sirve como ejemplo de cómo entrenar módulos auxiliares para intervenir en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado es el resultado del experimento de steering:

| Métrica | Steering naive | Steering con denoiser |
|---|---|---|
| Dist-2 (diversidad) | 0,5983 | 0,6406 |
| Similitud de concepto | 0,4151 | 0,4155 |

Estos valores corresponden a un alpha de 60 y se evaluaron con un solo vector de concepto y una sola semilla de entrenamiento. Dist-2 es una métrica de diversidad basada en la distancia entre tokens consecutivos, y la similitud de concepto se mide probablemente mediante coseno o similar. No hay comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un módulo auxiliar de tamaño pequeño (no se especifican parámetros, pero se estima que es inferior a 1M de parámetros dado el factor de expansión 0,5 sobre 1536), la inferencia es muy ligera.
- Puede ejecutarse en CPU sin problemas; para pruebas con el modelo base Qwen2.5-1.5B se recomienda una GPU con al menos 4 GB de VRAM para la carga del modelo base en FP16, aunque el denoiser en sí no requiere GPU.
- No se han publicado datos de latencia o throughput específicos.
- Para su uso completo (denoiser + modelo base) se recomienda utilizar vLLM, llama.cpp u Ollama para el modelo base, y aplicar el denoiser como un post-procesamiento de activaciones, lo cual requiere integración a nivel de código (no hay soporte nativo en estas herramientas).

## Comparativa con modelos similares

No se han encontrado modelos comparables en el repositorio de Hugging Face. Este tipo de módulo auxiliar para activation steering es poco común y no hay alternativas estándar en la misma categoría. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Evaluación limitada**: el modelo fue evaluado con un solo vector de concepto y una sola semilla de entrenamiento; los resultados pueden no generalizar a otros conceptos o configuraciones.
- **Métrica de diversidad incompleta**: Dist-2 es un proxy de diversidad que no mide completamente la fluidez ni la coherencia del texto; un aumento en Dist-2 podría acompañarse de una degradación en la calidad lingüística.
- **No es un modelo de lenguaje**: no puede usarse para generar texto directamente; requiere el modelo base Qwen2.5-1.5B y una infraestructura de steering.
- **Licencia no especificada**: no se indica la licencia del checkpoint, por lo que se recomienda contactar con el autor antes de usarlo en proyectos comerciales.
- **Dependencia del modelo base**: el denoiser está entrenado para activaciones de Qwen2.5-1.5B en la capa 16; usarlo con otros modelos o capas puede no funcionar.
- **Riesgo de alucinación**: como herramienta de interpretación, no genera texto por sí mismo; el riesgo de alucinación proviene del modelo base, no del denoiser.
- **Código necesario**: requiere el código de `ConditionalResidualDenoiser` que no está incluido en el repositorio; se debe obtener de la fuente original (posiblemente en el repo del autor).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Weller26/qwen2.5-1.5b-conditional-steering-denoiser)
- [Modelo base Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Colección Qwen2.5](https://huggingface.co/collections/Qwen/qwen25)
- [Reporte técnico Qwen2.5-Coder](https://ar5iv.labs.arxiv.org/html/2409.12186) (para referencia de la arquitectura base)
- [Reporte técnico Qwen2.5](https://arxiv.org/pdf/2412.15115v2) (contexto de la familia Qwen2.5)
