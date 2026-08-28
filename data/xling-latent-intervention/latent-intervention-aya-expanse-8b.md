# xling-latent-intervention/latent-intervention-aya-expanse-8b

## Resumen

El modelo `xling-latent-intervention/latent-intervention-aya-expanse-8b` es un autoencoder cross-lingual desarrollado por el equipo de investigación `xling-latent-intervention` como parte del trabajo presentado en el paper *"Latent-Space Intervention for Cross-Lingual Factual Consistency: Consistency Improvements without Accuracy Drops"* (Findings of EMNLP 2026). Su propósito es intervenir en el espacio latente de un modelo de lenguaje multilingüe para mejorar la consistencia factual entre idiomas, sin degradar la precisión del modelo original.

Se trata de un módulo auxiliar, no de un modelo generativo completo. Está entrenado sobre los estados ocultos de la capa 20 del modelo base `CohereLabs/aya-expanse-8b`, un LLM multilingüe de 8 mil millones de parámetros. El autoencoder consta de un encoder compartido y decoders específicos por idioma, con una dimensión latente de 256, pooling por media y pérdida Huber. El entrenamiento se realizó con transcripciones alineadas del dataset `neulab/ted_multi` en cinco idiomas: árabe, inglés, neerlandés, ruso y chino.

La relevancia de este modelo radica en su enfoque de interpretabilidad y control fino sobre las representaciones internas de un LLM, abriendo vías para corregir inconsistencias factuales en contextos multilingües sin necesidad de reentrenar el modelo completo. Es un trabajo de investigación con licencia MIT, publicado en Hugging Face con un tamaño de repositorio de 0,2 GB (únicamente contiene el archivo de pesos `best_model.pth`).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder con encoder compartido y decoders específicos por idioma |
| Parametros totales | no disponible (solo se indica dimensión latente 256, capa 20) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un LLM generativo) |
| Tipos de cuantizacion | no aplica (pesos en precisión flotante PyTorch) |
| Idiomas soportados | árabe (ar), inglés (en), neerlandés (nl), ruso (ru), chino (zh) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pth`) |

## Arquitectura y entrenamiento

El modelo es un autoencoder diseñado para operar sobre los estados ocultos de la capa 20 de `CohereLabs/aya-expanse-8b`. La arquitectura consta de un encoder compartido que proyecta los estados ocultos a un espacio latente de dimensión 256, y de decoders específicos por idioma que reconstruyen los estados originales. El pooling utilizado es la media (`mean`) y la función de pérdida es Huber, con una tasa de aprendizaje de 1e-4. El entrenamiento se realizó sobre pares de estados ocultos alineados extraídos de transcripciones de TED Talks en los cinco idiomas mencionados, lo que permite al autoencoder aprender correspondencias cross-linguales en el espacio latente.

La fase 2 (modelo final) corresponde a un encoder compartido con decoders por idioma, lo que facilita la intervención: al modificar la representación latente de un idioma, se puede influir en la representación reconstruida de otro, logrando así ajustes de consistencia factual. No se ha publicado información sobre el número total de parámetros del autoencoder ni sobre el volumen de tokens de entrenamiento.

## Capacidades

- Intervención en el espacio latente de la capa 20 de Aya Expanse 8B para modificar representaciones cross-linguales.
- Mejora de la consistencia factual entre idiomas sin necesidad de reentrenar el modelo base.
- Análisis de representaciones internas de un LLM multilingüe mediante un autoencoder entrenado con datos alineados.
- Soporte para cinco idiomas: árabe, inglés, neerlandés, ruso y chino.
- No es un modelo generativo: no genera texto, no admite tool calling, ni razonamiento multi-step, ni capacidades de visión o audio.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar cómo se codifican los hechos en el espacio latente de un LLM multilingüe y cómo varían entre idiomas.
- Corrección de inconsistencias factuales en sistemas de traducción o generación multilingüe: al intervenir en el espacio latente, se pueden alinear representaciones de hechos entre idiomas antes de la decodificación.
- Desarrollo de métodos de edición de modelos: el autoencoder sirve como herramienta para aplicar intervenciones dirigidas sin modificar los pesos del LLM original.
- Evaluación de la consistencia cross-lingual: se puede usar para medir y mejorar la coherencia de respuestas factuales en modelos multilingües.
- Entrenamiento de sistemas de control de calidad en datos multilingües: las representaciones latentes pueden servir para detectar discrepancias en traducciones o resúmenes.
- Experimentación académica en EMNLP 2026 y otros foros: el modelo y su código asociado permiten reproducir los resultados del paper y explorar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas cuantitativas de rendimiento (por ejemplo, exactitud en tareas de consistencia factual o comparación con otros métodos). Se recomienda consultar el paper asociado para obtener datos detallados.

## Requisitos de hardware

- El autoencoder en sí es muy ligero: el archivo de pesos ocupa 0,2 GB y puede ejecutarse en CPU sin problemas.
- Para usarlo con el modelo base Aya Expanse 8B, se requiere la infraestructura necesaria para ejecutar un LLM de 8B parámetros: al menos 16 GB de VRAM en FP16, o 8-10 GB con cuantización de 4 bits.
- GPU recomendadas: RTX 3090/4090, A100, H100, o cualquier GPU con suficiente memoria para el modelo base.
- Opciones de despliegue: el autoencoder se integra como un módulo en scripts de Python (según el repositorio de código asociado), no está pensado para servirse como API independiente. El modelo base puede ejecutarse con vLLM, TGI o llama.cpp, pero la intervención requiere acceso a los estados ocultos de la capa 20, lo que limita su uso a frameworks que permitan extraer representaciones intermedias (por ejemplo, Hugging Face Transformers con `output_hidden_states=True`).
- Latencia y throughput: no disponibles, dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (intervención cross-lingual en espacio latente). Existen otros métodos de edición de modelos o de intervención en representaciones (por ejemplo, edición de memoria, adaptadores LoRA), pero no hay datos públicos que permitan una comparación rigurosa con este autoencoder. Se recomienda revisar el paper para conocer el estado del arte en este ámbito.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción y carece de soporte técnico.
- Requiere el modelo base Aya Expanse 8B y acceso a sus estados ocultos de la capa 20; no es un modelo independiente.
- Solo cubre cinco idiomas; no se ha probado su eficacia en otros idiomas.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un módulo de intervención, su impacto en la calidad final depende del modelo base y del método de aplicación.
- La licencia MIT permite uso comercial, pero el modelo base Aya Expanse 8B tiene su propia licencia (CC-BY-NC 4.0, no comercial), lo que restringe el uso comercial conjunto.
- El archivo `best_model.pth` es un state dict de PyTorch; se necesita el código del repositorio asociado para cargarlo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xling-latent-intervention/latent-intervention-aya-expanse-8b
- Modelo base Aya Expanse 8B: https://huggingface.co/CohereLabs/aya-expanse-8b
- Documentación de Aya Expanse (Cohere): https://docs.cohere.com/docs/aya-expanse
- Blog de Cohere For AI sobre Aya Expanse: https://cohere.com/blog/aya-expanse-connecting-our-world
- Paper (Findings of EMNLP 2026): no disponible en los resultados de búsqueda; se cita en el modelo card pero sin enlace directo.
