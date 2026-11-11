# we-dream/pretrain-hand-2kh

## Resumen

`we-dream/pretrain-hand-2kh` es un modelo de visión-lenguaje-acción (VLA, *vision-language-action*) publicado por la organización WE-Dream en Hugging Face. Está orientado a robótica y se etiqueta explícitamente como *world-action-model* y modelo de preentrenamiento para acciones de mano (*hand-action*). Con aproximadamente 22.900 millones de parámetros en formato safetensors y un repositorio de 91,7 GB, se trata de un modelo de gran tamaño pensado para control robótico desde observaciones visuales e instrucciones en lenguaje natural.

El modelo se distribuye bajo licencia Apache 2.0, pero con acceso restringido (*gated*): es necesario aceptar condiciones en Hugging Face antes de descargarlo. El pipeline declarado es `robotics` y el único idioma indicado es el inglés. La información pública disponible es muy limitada: no se detallan arquitectura interna, composición del dataset de entrenamiento, número de tokens vistos ni resultados de benchmarks.

Su relevancia radica en la categoría: los modelos VLA y *world-action models* están emergiendo como una vía para unificar percepción, razonamiento y control motor en un único modelo, sustituyendo pipelines de robótica tradicionales compuestos por módulos separados. Dado que el acceso está restringido y no hay documentación técnica publicada, la evaluación rigurosa requiere solicitar acceso y consultar la model card completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como VLA / world-action-model) |
| Parámetros totales | 22.924.205.923 (~22,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Tamaño del repositorio | 91,7 GB |
| Descargas | 2 |
| Likes | 0 |
| Fecha de creación | 2026-11-07 |
| Última actualización | 2026-11-08 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de las etiquetas de Hugging Face, que lo clasifican como VLA (*vision-language-action*) y *world-action-model*. Por la nomenclatura (`pretrain-hand-2kh`), cabe inferir que se trata de un modelo preentrenado sobre acciones de mano, presumiblemente con un corpus de demostraciones o trayectorias, pero el número de tokens, la composición del dataset, el uso de RLHF/DPO y cualquier innovación técnica (atención lineal, decodificación especulativa, tokenización de acciones, etc.) no están documentados en la información disponible.

Tampoco se especifica si emplea un transformer denso, un MoE o una arquitectura híbrida, ni si combina un codificador visual con un *backbone* de lenguaje y una cabeza de acciones. El tamaño de ~22,9 B de parámetros y los 91,7 GB del repositorio son compatibles con pesos en precisión de 16 bits o mixta, pero no permiten deducir la arquitectura.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (pipeline `robotics`).
- Modelado de acciones de mano (*hand-action*), según la nomenclatura del identificador.
- Procesamiento de lenguaje natural en inglés.
- Percepción visual orientada a control (VLA).
- Posible modelado de dinámica del entorno (*world-action-model*), aunque no está confirmado en la documentación.
- Soporte de *tool calling*, agentes multi-paso, matemáticas, código, audio o *thinking mode*: no disponible en la información proporcionada.

## Casos de uso

- **Manipulación robótica con manos antropomórficas**: el modelo se usaría para mapear observaciones visuales e instrucciones en inglés a comandos de articulaciones de una mano robótica, aprovechando su preentrenamiento específico en acciones de mano.
- **Aprendizaje por imitación a gran escala**: serviría como punto de partida (*pretrain*) para ajuste fino sobre demostraciones específicas de una tarea, reduciendo la cantidad de datos necesarios por tarea.
- **Investigación en modelos VLA**: útil como referencia o *baseline* en estudios comparativos de arquitecturas visión-lenguaje-acción, dado su tamaño (~22,9 B) y su licencia permisiva.
- **Generación de trayectorias sintéticas**: si el modelo funciona como *world-action model*, podría emplearse para simular o predecir secuencias de acciones en entornos simulados antes de transferirlas a un robot real.
- **Prototipado en laboratorio**: con acceso restringido y licencia Apache 2.0, es adecuado para entornos de investigación que puedan asumir el coste de inferencia de un modelo de ~23 B de parámetros.
- **Evaluación de generalización lingüística**: al estar entrenado solo en inglés, permite estudiar la degradación de rendimiento al traducir instrucciones desde otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión. Como referencia orientativa por tamaño, un modelo de ~22,9 B de parámetros requiere aproximadamente 46 GB en FP16/BF16, ~23 GB en cuantización de 8 bits y ~12-14 GB en 4 bits, sin contar el codificador visual ni los buffers de activaciones.
- **GPU recomendadas**: para FP16/BF16 se necesitan GPU de 80 GB (A100, H100) o múltiples GPU de 24-48 GB. Para cuantización de 8 o 4 bits podrían ser viables RTX 4090 (24 GB) o A6000 (48 GB), aunque no está confirmado que existan pesos cuantizados publicados.
- **Consumer GPU**: posible en RTX 4090 solo con cuantización agresiva y si el repositorio incluye versiones GGUF o equivalentes, lo cual no se indica.
- **Opciones de despliegue**: no se especifican. Por el formato safetensors, sería compatible con frameworks de inferencia estándar (vLLM, TGI, transformers), pero al ser un modelo VLA es probable que requiera código específico del autor, no documentado en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA / world-action) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es *gated*; es obligatorio aceptar condiciones en Hugging Face antes de descargar los pesos.
- **Documentación insuficiente**: no hay información publicada sobre arquitectura, dataset, entrenamiento ni evaluación, lo que impide validar su rendimiento de forma independiente.
- **Idioma**: solo se declara inglés; el uso en castellano u otros idiomas no está soportado oficialmente.
- **Riesgo de alucinación y acciones inválidas**: en modelos de control robótico, los errores se traducen en comandos físicos potencialmente peligrosos; se recomienda supervisión humana y límites de seguridad en el robot.
- **Sesgos**: no documentados; al ser un modelo de preentrenamiento sin información sobre la composición del dataset, no se pueden evaluar sesgos de dominio (entornos, objetos, morfologías de mano).
- **Licencia**: Apache 2.0 permite uso comercial, pero las condiciones adicionales de acceso restringido deben revisarse antes de desplegarlo en producción.
- **Madurez**: con 2 descargas y 0 likes en el momento de la consulta, es un modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/we-dream/pretrain-hand-2kh
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
