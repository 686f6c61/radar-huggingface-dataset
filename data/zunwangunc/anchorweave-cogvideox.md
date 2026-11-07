# zunwangunc/AnchorWeave-CogVideoX

## Resumen

AnchorWeave-CogVideoX es un checkpoint de control publicado por el usuario zunwangunc en Hugging Face, derivado mediante fine-tuning del modelo base zai-org/CogVideoX-5b-I2V (también referenciado como THUDM/CogVideoX-5b-I2V). Está pensado para su uso con el pipeline de inferencia AnchorWeave, una implementación de investigación orientada a la generación de vídeo con consistencia de mundo (world consistency) sobre trayectorias de cámara largas. El repositorio tiene un tamaño de 0,8 GB y contiene pesos en formato EMA, que deben cargarse con el script de inferencia del repositorio AnchorWeave_open.

El modelo se enmarca en la tarea de image-to-video: parte de una imagen de condicionamiento (primer fotograma) y genera secuencias de vídeo. La propuesta técnica de AnchorWeave consiste en mantener la coherencia espacial a lo largo de horizontes largos mediante condicionamiento geométrico local, control multi-ancla (multi-anchor) y recuperación guiada por cobertura (coverage-driven retrieval), en lugar de reconstruir una escena 3D global que introduciría artefactos entre vistas. La model card es extremadamente escueta y no aporta datos sobre entrenamiento, licencia ni idiomas.

La relevancia del checkpoint es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentación de rendimiento. Su interés principal es servir como material reproducible para quienes trabajan con el código de AnchorWeave, no como modelo listo para producción. Nótese que la página del proyecto AnchorWeave cita Wan2.2 5B como backbone, mientras que este checkpoint declara CogVideoX-5b-I2V como base, lo que conviene verificar antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo, derivado de CogVideoX-5b-I2V; detalles de la arquitectura base no incluidos en la información proporcionada) |
| Parametros totales | no disponible (el modelo base se denomina "5b", pero no se confirma el recuento exacto en la información disponible) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el backbone citado en el paper está limitado a vídeos de 81 fotogramas; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene pesos EMA; no se detalla el formato de serialización) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del checkpoint. Por la información del modelo base, se trata de un modelo de difusión para generación de vídeo a partir de imagen (image-to-video) de la familia CogVideoX, con aproximadamente 5B parámetros según la denominación del modelo base. El checkpoint publicado contiene pesos EMA, lo que sugiere un proceso de fine-tuning con media móvil exponencial de los pesos, práctica habitual para estabilizar la inferencia en modelos de difusión.

El método AnchorWeave, descrito en el paper arXiv 2602.14941, aborda la consistencia espacial de mundo en horizontes largos. En lugar de condicionar la generación sobre una escena 3D reconstruida globalmente (lo que introduce artefactos entre vistas), emplea condicionamiento geométrico local, control multi-ancla y recuperación guiada por cobertura. El backbone citado en la página del proyecto está limitado a vídeos de 81 fotogramas, y la generación más allá de ese límite se logra encadenando segmentos de 81 fotogramas, cada uno condicionado sobre la memoria acumulada de generaciones previas. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de una imagen de condicionamiento (pipeline image-to-video).
- Generación de secuencias de 81 fotogramas por segmento con el backbone citado.
- Generación de vídeo de horizonte largo mediante composición iterativa de segmentos condicionados sobre memoria acumulada.
- Mantenimiento de consistencia de escena a lo largo de trayectorias de cámara largas, según los experimentos del paper.
- Condicionamiento geométrico local y control multi-ancla para guiar la generación.
- Recuperación guiada por cobertura para seleccionar la memoria relevante en cada segmento.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en consistencia de mundo: reproducir los experimentos del paper AnchorWeave cargando este checkpoint con el script de AnchorWeave_open para evaluar la coherencia espacial en trayectorias de cámara largas.
- Generación de recorridos virtuales de interiores: a partir de una imagen de una habitación, generar un vídeo de cámara en movimiento que mantenga la disposición de los objetos, apoyándose en el condicionamiento geométrico local y la memoria acumulada entre segmentos.
- Previsualización de escenarios para videojuegos o arquitectura: generar clips de exploración de un entorno a partir de un fotograma de referencia, útil para iterar sobre el diseño antes de producir assets definitivos.
- Creación de material para estudios de ablación: usar el checkpoint como base fija mientras se varían los componentes del método (multi-ancla, retrieval) para medir su contribución, tal como describe el paper.
- Evaluación comparativa de backbones: contrastar este checkpoint basado en CogVideoX-5b-I2V frente a la variante con backbone Wan2.2 5B citada en la página del proyecto, para analizar diferencias de calidad visual y consistencia.
- Reproducción de resultados académicos: servir de artefacto de referencia para verificar las cifras publicadas en el paper antes de construir sobre el método.
- Docencia y divulgación: ilustrar técnicas de memoria y condicionamiento en generación de vídeo con un checkpoint concreto y un repositorio de inferencia público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de difusión de vídeo de la escala de CogVideoX-5b suele requerir GPUs de gama alta, pero no se confirma ningún valor concreto para este checkpoint.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card ni en los resultados de búsqueda.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint está pensado para cargarse mediante el script de inferencia del repositorio AnchorWeave_open, con la librería diffusers. No se documentan otras rutas de despliegue (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / longitud de vídeo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnchorWeave-CogVideoX (este) | no disponible (base "5b") | 81 fotogramas por segmento (backbone citado) | image-to-video con consistencia de mundo | no disponible | Hugging Face, 0 descargas |
| CogVideoX-5b-I2V (modelo base) | no disponible (denominado "5b") | no disponible en la información proporcionada | image-to-video | no disponible en la información proporcionada | Hugging Face (modelo base referenciado) |
| AnchorWeave con backbone Wan2.2 5B (según página del proyecto) | no disponible (denominado "5B") | 81 fotogramas por segmento | image-to-video con consistencia de mundo | no disponible | Repositorio GitHub y página del proyecto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no declara licencia, idiomas, datos de entrenamiento ni limitaciones, lo que impide evaluar su idoneidad para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Existe una discrepancia entre la página del proyecto AnchorWeave, que cita Wan2.2 5B como backbone, y este checkpoint, que declara CogVideoX-5b-I2V como base; conviene verificar la compatibilidad con el código antes de usarlo.
- El backbone citado está limitado a 81 fotogramas por segmento; la generación de vídeos más largos depende de la composición iterativa y puede acumular deriva o inconsistencias.
- Al ser un checkpoint de investigación con pesos EMA, requiere el script de inferencia específico de AnchorWeave_open; no se garantiza su funcionamiento con pipelines estándar de diffusers sin adaptación.
- Riesgo de alucinación visual y de artefactos geométricos en escenas complejas o con oclusiones, inherente a los modelos de difusión de vídeo; no se documentan sesgos específicos.
- No se documentan capacidades multilingües ni de otro tipo (texto, código, tool calling), por lo que no debe evaluarse como modelo de lenguaje.
- El tamaño del repositorio (0,8 GB) es inferior al esperado para un modelo de 5B parámetros en precisión completa, lo que sugiere pesos parciales o cuantizados; no se especifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zunwangunc/AnchorWeave-CogVideoX
- Repositorio AnchorWeave (implementación oficial): https://github.com/wz0919/AnchorWeave
- Repositorio AnchorWeave_open (script de inferencia): https://github.com/wz0919/AnchorWeave_open
- Página del proyecto AnchorWeave: https://zunwang1.github.io/AnchorWeave
- Paper en arXiv (abstract): https://arxiv.org/abs/2602.14941
- Paper en arXiv (HTML): https://arxiv.org/html/2602.14941v1
- Modelo base CogVideoX-5b-I2V: https://huggingface.co/THUDM/CogVideoX-5b-I2V
