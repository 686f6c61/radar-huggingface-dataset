# wyzwtnydlpn1/Unisharp

## Resumen

UniSHARP es un modelo de síntesis de vistas novedosas monocular desarrollado por Insta360 Research, la Universidad de Wuhan y la Universidad de California en Merced. Extiende el método SHARP, originalmente diseñado para cámaras con modelo pinhole, a un sistema universal que admite cámaras de perspectiva, gran angular, ojo de pez y panorámicas. Dada una única imagen, el modelo predice una representación de Gaussianas 3D y renderiza vistas novedosas fotorrealistas desde cualquier posición dentro de la escena.

La relevancia de UniSHARP radica en su capacidad para unificar distintos tipos de proyección en un solo modelo, eliminando la necesidad de adaptar pipelines específicos para cada geometría de cámara. Esto abre aplicaciones en robótica, IA embodied, creación de contenido para AR/VR, telepresencia inmersiva y documentación espacial. El modelo se entrena sobre el dataset OmniRooms, un conjunto simulado de 16 escenas interiores con 300 000 imágenes panorámicas, y utiliza UniK3D para la predicción de rayos y características universales.

El repositorio de HuggingFace contiene los pesos del modelo (9,5 GB) y el código de inferencia, aunque la licencia y los detalles de la arquitectura completa no están disponibles en la información pública proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Gaussianas 3D y predicción de rayos con UniK3D) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa imágenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 9,5 GB, probablemente safetensors o binarios) |

## Arquitectura y entrenamiento

UniSHARP se basa en el paradigma de SHARP pero lo generaliza a sistemas de cámara universales. El pipeline estima geometría de distancia de rayos y características multiescala mediante UniK3D, inicializa una representación de dos capas de Gaussianas en el espacio de distancia de rayos, predice residuos de Gaussianas condicionados por características y renderiza las vistas objetivo con un rasterizador unificado. Para el renderizado de ojo de pez se utiliza el rasterizador CUDA GEER de 3DGEER, mientras que las rutas de perspectiva y panorámica no requieren este componente.

El entrenamiento se realiza desde cero sobre el dataset OmniRooms, un conjunto simulado con AirSim que contiene 16 escenas interiores grandes, cada una con múltiples habitaciones, y 300 000 imágenes RGB de 1024×2048 en proyección equirrectangular. También se deriva OmniRooms-Wide proyectando las panorámicas a vistas de ojo de pez equidistante de 130 grados. El modelo carga los pesos preentrenados de UniK3D a través de su loader específico. No se dispone de información sobre el número total de tokens de entrenamiento, composición exacta del dataset ni uso de técnicas como RLHF o DPO, al tratarse de un modelo de visión generativa.

## Capacidades

- Síntesis de vistas novedosas monocular: genera vistas desde posiciones arbitrarias a partir de una única imagen de entrada.
- Soporte universal de cámaras: acepta imágenes de perspectiva, gran angular, ojo de pez y panorámicas (equirrectangulares) en un mismo modelo.
- Representación 3D Gaussian: predice una representación explícita de Gaussianas 3D que permite renderizado fotorrealista.
- Estimación de geometría: predice distancia de rayos y características multiescala mediante UniK3D.
- Renderizado diferencial: utiliza rasterizadores CUDA especializados (GEER para ojo de pez) para la síntesis de imágenes.
- No es un modelo de lenguaje: no genera texto, código ni responde a prompts conversacionales.

## Casos de uso

- Robótica y navegación autónoma: un robot equipado con una cámara panorámica u ojo de pez puede usar UniSHARP para sintetizar vistas desde posiciones no visitadas, mejorando la planificación de rutas y la evitación de obstáculos en entornos interiores.
- Creación de contenido AR/VR: los desarrolladores pueden generar vistas novedosas de escenas capturadas con cámaras de gran angular o panorámicas para construir experiencias inmersivas sin necesidad de múltiples capturas.
- Telepresencia inmersiva: en videoconferencias o entornos remotos, UniSHARP permite al espectador moverse virtualmente dentro de una escena capturada con una sola cámara, mejorando la sensación de presencia.
- Documentación espacial: arquitectos e ingenieros pueden documentar edificios o instalaciones con una única imagen panorámica y luego explorar la escena desde distintos ángulos para inspección o planificación.
- Simulación para entrenamiento de agentes: el dataset OmniRooms y el modelo pueden usarse para generar datos sintéticos de entrenamiento para agentes de IA embodied, reduciendo la necesidad de capturas reales costosas.
- Generación de datos de aumento: en pipelines de visión por computador, UniSHARP puede aumentar conjuntos de datos existentes generando vistas adicionales desde imágenes únicas, mejorando la robustez de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de arXiv (2606.07514) podría contener métricas cuantitativas, pero no se han extraído en la información proporcionada.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM mínima o recomendada.
- El repositorio tiene un tamaño de 9,5 GB, lo que sugiere que los pesos del modelo requieren al menos 10 GB de almacenamiento y probablemente una GPU con 12-24 GB de VRAM para inferencia en precisión completa.
- El código requiere CUDA y PyTorch 2.8, por lo que se necesitan GPUs NVIDIA con soporte CUDA.
- Se recomienda una GPU de gama alta como RTX 3090, RTX 4090, A100 o H100 para tiempos de inferencia razonables, aunque no hay datos de latencia publicados.
- El despliegue se realiza mediante el repositorio oficial de GitHub, no a través de vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Dependencias externas: UniK3D (para rayos y características) y 3DGEER (solo para renderizado de ojo de pez).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar UniSHARP con otros modelos de síntesis de vistas monocular en términos de parámetros, contexto o rendimiento. El predecesor directo es SHARP, pero no se han proporcionado datos comparativos. Se recomienda consultar el paper para métricas detalladas.

## Limitaciones y advertencias

- El modelo se entrena exclusivamente con datos simulados (OmniRooms, generado con AirSim), lo que puede limitar su generalización a escenas reales con condiciones de iluminación, texturas y geometrías diferentes.
- La dependencia de UniK3D y 3DGEER como componentes externos añade complejidad al despliegue y puede introducir incompatibilidades de versiones.
- No se ha publicado información sobre sesgos, alucinaciones o artefactos visuales en escenarios extremos.
- La licencia no está especificada, por lo que el uso comercial del modelo o sus pesos requiere contactar con los autores para aclarar los términos.
- El modelo no admite entrada de texto ni interacción conversacional; está limitado a tareas de visión.
- El tamaño del repositorio (9,5 GB) y los requisitos de CUDA limitan su uso en entornos sin GPUs NVIDIA potentes.

## Enlaces

- HuggingFace: https://huggingface.co/wyzwtnydlpn1/Unisharp
- Paper arXiv: https://arxiv.org/abs/2606.07514
- Página del proyecto: https://insta360-research-team.github.io/Unisharp-website/
- Demo HuggingFace: https://huggingface.co/spaces/Insta360-Research/UniSHARP
- Dataset OmniRooms: https://huggingface.co/datasets/Insta360-Research/OmniRooms
- Código GitHub: https://github.com/Insta360-Research-Team/UniSHARP
- UniK3D (dependencia): https://github.com/lpiccinelli-eth/UniK3D
- 3DGEER (dependencia): https://github.com/boschresearch/3dgeer
