# SZLHOLDINGS/Moons-Nano

## Resumen

Moons-Nano es un perceptrón multicapa (MLP) de arquitectura 2-8-2 con activación tangente hiperbólica, publicado por SZL Holdings bajo licencia Apache-2.0. Se trata de un modelo deliberadamente pequeño y juguete, diseñado como herramienta de aprendizaje y demostración de los principios de "IA gobernada" que la organización promueve: inspeccionabilidad, medición de rendimiento y transparencia en la publicación de resultados. No es un modelo de lenguaje ni un producto utilizable en producción.

El modelo se distribuye como pesos en formato numpy, con un tamaño de repositorio de 0.0 GB, lo que confirma su naturaleza mínima. Su propósito declarado es servir de ejemplo para enseñar conceptos de validación, curvas de decisión y métricas de calidad antes de escalar a modelos mayores. La ficha del autor enfatiza la publicación de métricas medidas (holdout accuracy, silhouette) y la visualización de la frontera de decisión, en contraste con la "teatralidad de capacidades" que critica en otros actores de la industria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capa oculta de 8 neuronas, activación tanh |
| Parametros totales | 2-8-2 (2 entradas, 8 ocultas, 2 salidas); número exacto de pesos no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en numpy, sin cuantización publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | numpy (archivos .npy o similar) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas: 2 neuronas de entrada, 8 neuronas ocultas con activación tangente hiperbólica y 2 neuronas de salida. El autor indica que se entrenó con SGD sobre 400 puntos de datos, con un nivel de ruido de 0.13. No se especifica el número de épocas, la función de pérdida ni la composición exacta del conjunto de datos, aunque se menciona que es un problema de clasificación en 2D con una frontera de decisión visualizable.

La innovación técnica no reside en la arquitectura, sino en el enfoque de publicación: el autor incluye métricas de holdout accuracy, coeficiente de silhouette y una representación clicable de la frontera de decisión. El entrenamiento se realizó sin técnicas como QLoRA o cuDNN, según se indica explícitamente en la model card, subrayando la simplicidad deliberada del experimento.

## Capacidades

- Clasificación binaria en un espacio de 2 dimensiones (problema sintético con ruido).
- Visualización de la frontera de decisión aprendida por el modelo.
- Publicación de métricas de validación (holdout accuracy, silhouette) para inspección.
- Demostración de principios de "IA gobernada": medición, transparencia y trazabilidad.
- No tiene capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes.

## Casos de uso

- Material didáctico para cursos de machine learning: permite explicar el funcionamiento de un MLP, el efecto del ruido en los datos y la interpretación de la frontera de decisión en un caso mínimo y visualizable.
- Ejemplo de buenas prácticas de publicación de modelos: sirve como plantilla para mostrar cómo documentar métricas, limitaciones y licencia de forma honesta y reproducible.
- Banco de pruebas para herramientas de inspección de modelos: al ser un modelo diminuto, se puede usar para validar pipelines de visualización de pesos, activaciones o curvas de pérdida.
- Demostración de integración con numpy: útil para desarrolladores que quieran ver cómo se cargan y ejecutan pesos en formato numpy sin dependencias pesadas.
- Referencia para discusiones sobre "IA gobernada": el modelo se presenta como ejemplo de un enfoque que prioriza la inspeccionabilidad sobre la capacidad bruta, útil en debates sobre gobernanza de IA.
- Ejercicio de extensión: los desarrolladores pueden modificar la arquitectura (p. ej., cambiar el número de neuronas ocultas) y comparar el rendimiento, dado que el código es accesible y el formato es simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se publican "holdout accuracy" y "silhouette", pero no se proporcionan valores numéricos concretos en el README ni en los resultados de búsqueda. No se puede comparar con otros modelos al no existir datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: no aplicable; el modelo es un MLP de 2-8-2 con pesos en numpy, ejecutable en CPU con menos de 1 MB de memoria.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: sí, pero innecesario; el modelo se ejecuta en microsegundos en cualquier hardware.
- Opciones de despliegue: carga directa con numpy en Python; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, pero se puede asumir latencia inferior a 1 ms en CPU estándar.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. Dado que se trata de un juguete educativo de 2-8-2, no existe una categoría de modelos similares en el ecosistema de IA. La model card menciona a Anthropic, NVIDIA y Unsloth como referentes filosóficos, pero no como competidores técnicos.

## Limitaciones y advertencias

- Es un juguete, no un producto: el propio autor lo declara explícitamente ("Toy. 2D. Noise 0.13. Not a product model").
- No procesa lenguaje natural ni tiene capacidades de generación de texto; cualquier uso fuera de la demostración educativa es inapropiado.
- Los datos de entrenamiento son sintéticos y con ruido; no representa ningún dominio real.
- No se proporcionan métricas cuantitativas de rendimiento (accuracy, silhouette) en la información disponible, lo que limita su uso como referencia.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no tiene valor práctico comercial.
- La model card incluye afirmaciones sobre "doctrine v11" y "749 declarations" que no están verificadas ni documentadas en fuentes externas; deben tratarse como material promocional.
- No hay garantía de reproducibilidad: no se publican el código de entrenamiento ni el conjunto de datos exacto.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/Moons-Nano
- Organización SZLHOLDINGS en HuggingFace: https://huggingface.co/SZLHOLDINGS/models
- GitHub de SZL Holdings: https://github.com/szl-holdings
- Repositorio szl-atelier (recorrido por los 40 modelos de SZLHOLDINGS): https://github.com/szl-holdings/szl-atelier
- Documentación de SZL Holdings: https://szl-holdings.github.io/docs-site/
- Developer Hub de SZL Holdings: https://holdings.a-11-oy.com/docs-site/developers/
